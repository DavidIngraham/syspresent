/** Native-canvas DOM checks, not a substitute for rendered browser review. */
import assert from 'node:assert/strict';
import {test,after} from 'node:test';
import {createRequire} from 'node:module';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,join} from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';

if(!process.env.OPENSYSML_SOURCE)throw Error('Set OPENSYSML_SOURCE to the pinned renderer checkout');
const editor=resolve(process.env.OPENSYSML_SOURCE,'editors/vscode');
const require=createRequire(join(editor,'package.json'));
const {build}=require('esbuild'),{JSDOM}=require('jsdom');
const temporary=await mkdtemp(join(tmpdir(),'syspresent-renderer-test-'));
after(()=>rm(temporary,{recursive:true,force:true}));
const output=join(temporary,'renderer.mjs');
await build({entryPoints:[fileURLToPath(new URL('../src/renderer.mjs',import.meta.url))],outfile:output,bundle:true,format:'esm',platform:'node',alias:Object.fromEntries(['canvas','layout','autolayout','table'].map(k=>['@opensysml/'+k,join(editor,'src/webview',k+'.ts')]))});
const {renderView,presentationPayload,layoutPayload,presentationLayout,pinchFrame,installDiagramGestures}=await import(pathToFileURL(output).href);
function fixture(){return {id:'requirements',native:{kind:'requirement',form:'mermaid',nodes:[
  {id:'local-a',semanticId:'semantic-a',kind:'requirement',name:'AND',detail:'A long statement '.repeat(30)},
  {id:'local-b',semanticId:'semantic-b',kind:'requirement',name:'Child',detail:'Child requirement'}],edges:[{from:'local-a',to:'local-b',kind:'derivation',label:'derive'}]}};}
function dom(){const d=new JSDOM('<!doctype html><body><div id="a"></div><div id="b"></div></body>');globalThis.document=d.window.document;for(const [name,size] of [['clientWidth',400],['clientHeight',300]])Object.defineProperty(d.window.HTMLElement.prototype,name,{configurable:true,get(){return this.classList.contains('native-scroll')&&this.isConnected&&!this.closest('[hidden]')?size:0;}});return d;}

test('native source is immutable; only layout dispatch changes structural kind',async()=>{
  const d=dom(),view=fixture(),before=JSON.stringify(view.native);
  assert.equal(layoutPayload(presentationPayload(view.native,false)).kind,'tree');
  assert.equal(presentationPayload(view.native,false).kind,'requirement');
  assert.ok(!presentationPayload(view.native,false).shown.includes('compartments'));
  for(const kind of ['action','state','sequence','fault-tree'])assert.equal(presentationPayload({...view.native,kind},false).shown,undefined);
  await renderView(document.getElementById('a'),view,{selectedId:'semantic-a'});
  assert.equal(JSON.stringify(view.native),before);
  assert.ok(document.getElementById('a').textContent.includes('A long statement'));
  d.window.close();
});

test('native local markers are namespaced for multiple simultaneous views',async()=>{
  const d=dom(),view=fixture();await renderView(document.getElementById('a'),view);await renderView(document.getElementById('b'),view);
  const markerIds=[...document.querySelectorAll('svg [id]')].map(e=>e.id);assert.ok(markerIds.length>0);assert.equal(new Set(markerIds).size,markerIds.length);
  for(const svg of document.querySelectorAll('svg')){
    const own=new Set([...svg.querySelectorAll('[id]')].map(e=>e.id));
    for(const e of svg.querySelectorAll('*'))for(const attribute of e.attributes){for(const match of attribute.value.matchAll(/url\(#([^\)]+)\)/g))assert.ok(own.has(match[1]),'marker resolves within its SVG');}
  }
  d.window.close();
});

test('selection uses native semantic identity, never label inference',async()=>{
  const d=dom(),view=fixture(),selected=[];
  await renderView(document.getElementById('a'),view,{selectedId:'semantic-a',onSelect:id=>selected.push(id)});
  const group=document.querySelector('[data-opensysml-id="local-a"]');assert.ok(group.classList.contains('selected'));assert.ok(!group.querySelector('.fault-and'));
  group.dispatchEvent(new d.window.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.deepEqual(selected,['semantic-a']);
  d.window.close();
});

test('readable default scale and manual zoom/pan persist across selection',async()=>{
  const d=dom(),view=fixture(),container=document.getElementById('a');await renderView(container,view,{selectedId:'semantic-a'});
  fitted(container);
  container.querySelector('button[aria-label="Zoom in"]').click();const manual=container.querySelector('output').textContent;
  const viewport=container.querySelector('.native-scroll');viewport.scrollLeft=70;viewport.dispatchEvent(new d.window.Event('scroll'));
  await renderView(container,view,{selectedId:'semantic-b'});assert.equal(container.querySelector('output').textContent,manual);assert.equal(container.querySelector('.native-scroll').scrollLeft,70);
  d.window.close();
});
test('native table selection follows rowToElement with accessible controls and cross-view identity',async()=>{
  const d=dom(),selected=[],view={id:'table',rowToElement:{'0':'semantic-a','1':'semantic-b','2':null},native:{kind:'table',columns:['Target','Value'],rows:[{cells:['Same label','one']},{cells:['Same label','two']},{cells:['semantic-a','unmapped']}],notices:[]}};
  const before=JSON.stringify(view),container=document.getElementById('a');
  await renderView(container,view,{selectedId:'semantic-b',onSelect:id=>selected.push(id)});
  const rows=container.querySelectorAll('tbody tr');
  assert.equal(rows[1].getAttribute('aria-selected'),'true');assert.equal(rows[1].querySelector('button').textContent,'Selected');
  assert.equal(rows[1].querySelector('button').getAttribute('aria-pressed'),'true');
  assert.ok(rows[1].style.backgroundColor);
  // Native HTML buttons are keyboard-operable; no pointer-only row contract.
  assert.equal(rows[0].querySelector('button').type,'button');
  rows[0].querySelector('button').click();rows[1].dispatchEvent(new d.window.MouseEvent('click',{bubbles:true}));
  assert.deepEqual(selected,['semantic-a','semantic-b']);
  assert.equal(rows[2].querySelector('button'),null);rows[2].dispatchEvent(new d.window.MouseEvent('click',{bubbles:true}));assert.equal(selected.length,2);
  assert.ok(container.textContent.includes('no exported semantic identity'));
  await renderView(document.getElementById('b'),fixture(),{selectedId:selected[0]});assert.ok(document.querySelector('#b [data-opensysml-id="local-a"]').classList.contains('selected'));
  assert.equal(JSON.stringify(view),before);
  await renderView(container,view,{selectedId:'absent'});assert.ok(container.textContent.includes('not represented in this table'));
  d.window.close();
});

function fitted(container){const svg=container.querySelector('svg');assert.ok(parseFloat(svg.style.width)<=400);assert.ok(parseFloat(svg.style.height)<=300);assert.equal(container.querySelector('.native-scroll').scrollLeft,0);return container.querySelector('output').textContent;}
function dialogShim(d){
  d.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  d.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new d.window.Event('close'));};
}
test('expanded diagram moves existing native DOM and restores zoom, pan and focus on close or Escape',async()=>{
  const d=dom();dialogShim(d);const view=fixture(),before=JSON.stringify(view),container=document.getElementById('a');let interactions=0;
  await renderView(container,view,{onInteract:()=>interactions++});
  container.querySelector('[aria-label="Zoom in"]').click();
  const manual=container.querySelector('output').textContent;const fragment=container.firstElementChild,svg=container.querySelector('svg'),viewport=container.querySelector('.native-scroll'),expand=container.querySelector('.native-expand');
  viewport.scrollLeft=80;viewport.scrollTop=40;viewport.dispatchEvent(new d.window.Event('scroll'));expand.focus();expand.click();
  let dialog=document.querySelector('dialog');assert.ok(dialog.open);assert.equal(dialog.querySelector('svg'),svg);assert.equal(document.querySelectorAll('svg').length,1);assert.equal(interactions,2);
  assert.equal(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent,view.id);
  dialog.querySelector('[aria-label="Zoom in"]').click();viewport.scrollLeft=200;viewport.scrollTop=100;viewport.dispatchEvent(new d.window.Event('scroll'));
  dialog.querySelector('.native-dialog-header button').click();
  assert.equal(document.querySelector('dialog'),null);assert.equal(container.firstElementChild,fragment);assert.equal(container.querySelector('output').textContent,manual);assert.equal(viewport.scrollLeft,80);assert.equal(viewport.scrollTop,40);assert.equal(document.activeElement,expand);
  expand.click();dialog=document.querySelector('dialog');dialog.dispatchEvent(new d.window.Event('cancel',{cancelable:true}));assert.equal(document.querySelector('dialog'),null);assert.equal(document.activeElement,expand);assert.equal(JSON.stringify(view),before);
  d.window.close();
});
test('expanded native table selects semantic identity after restoring embedded content',async()=>{
  const d=dom();dialogShim(d);const container=document.getElementById('a'),selected=[];
  const view={id:'table',rowToElement:{0:'native-id'},native:{kind:'table',columns:['Name'],rows:[{cells:['misleading-label']}],notices:[]}};
  await renderView(container,view,{onSelect:id=>{assert.equal(document.querySelector('dialog'),null);assert.ok(container.querySelector('table'));selected.push(id);}});
  const table=container.querySelector('table');container.querySelector('.native-expand').click();assert.equal(document.querySelector('dialog table'),table);
  table.querySelector('tbody tr').click();assert.deepEqual(selected,['native-id']);d.window.close();
});
test('new frames fit despite zoom preferences or authored camera, while user zoom persists',async()=>{
  const d=dom(),container=document.getElementById('a'),view=fixture();
  await renderView(container,view,{presentationPreferences:{defaultZoom:.8,showCompartments:true}});fitted(container);assert.ok(container.textContent.includes('Hide compartments'));
  container.querySelector('[aria-label="Zoom in"]').click();const manual=container.querySelector('output').textContent;
  await renderView(container,view,{presentationPreferences:{defaultZoom:.5,showCompartments:true}});assert.equal(container.querySelector('output').textContent,manual);
  await renderView(container,view,{camera:{zoom:1.5},presentationPreferences:{defaultZoom:.8}});fitted(container);d.window.close();
});
test('manual camera controls pause story; programmatic restoration does not',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();let interactions=0;
 await renderView(container,view,{onInteract:()=>interactions++});
 const viewport=container.querySelector('.native-scroll');
 viewport.dispatchEvent(new d.window.Event('scroll'));assert.equal(interactions,0);
 viewport.dispatchEvent(new d.window.Event('wheel'));viewport.dispatchEvent(new d.window.Event('pointerdown'));
 viewport.dispatchEvent(new d.window.KeyboardEvent('keydown',{key:'ArrowDown'}));assert.equal(interactions,3);
 viewport.dispatchEvent(new d.window.KeyboardEvent('keydown',{key:'Tab'}));assert.equal(interactions,3);
 container.querySelector('[aria-label="Zoom in"]').click();assert.equal(interactions,4);
 [...container.querySelectorAll('button')].find(b=>b.textContent==='Fit').click();assert.equal(interactions,5);
 [...container.querySelectorAll('button')].find(b=>b.textContent==='Show compartments').click();assert.equal(interactions,6);
 for(let i=0;i<100&&!container.textContent.includes('Hide compartments');i++)await new Promise(resolve=>setTimeout(resolve,10));assert.ok(container.textContent.includes('Hide compartments'));assert.equal(interactions,6);d.window.close();
});
test('explicit frame reset restores fit and detail defaults, then selection retains changes',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();
 const options={camera:{zoom:.8},presentationPreferences:{showCompartments:false}};
 await renderView(container,view,options);const initial=fitted(container);container.querySelector('[aria-label="Zoom in"]').click();const manual=container.querySelector('output').textContent;
 let viewport=container.querySelector('.native-scroll');viewport.scrollLeft=90;viewport.dispatchEvent(new d.window.Event('scroll'));
 await renderView(container,view,{...options,selectedId:'semantic-b'});assert.equal(container.querySelector('output').textContent,manual);assert.equal(container.querySelector('.native-scroll').scrollLeft,90);
 await renderView(container,view,{...options,resetFrame:true});assert.equal(fitted(container),initial);
 [...container.querySelectorAll('button')].find(b=>b.textContent==='Show compartments').click();for(let i=0;i<100&&!container.textContent.includes('Hide compartments');i++)await new Promise(resolve=>setTimeout(resolve,10));assert.ok(container.textContent.includes('Hide compartments'),'recursive render must not replay reset');
 await renderView(container,view,{...options,resetFrame:true});assert.ok(container.textContent.includes('Show compartments'));d.window.close();
});
test('inline and explorer surfaces retain independent manual frames for one native view',async()=>{
 const d=dom(),a=document.getElementById('a'),b=document.getElementById('b'),view=fixture();
 await renderView(a,view,{frameScope:'inline:one',camera:{zoom:.8}});
 a.querySelector('[aria-label="Zoom in"]').click();
 await renderView(b,view,{camera:{zoom:.8},resetFrame:true});
 [...a.querySelectorAll('button')].find(x=>x.textContent==='Show compartments').click();
 for(let i=0;i<100&&!a.textContent.includes('Hide compartments');i++)await new Promise(r=>setTimeout(r,10));
 fitted(a);assert.ok(a.textContent.includes('Hide compartments'));
 fitted(b);assert.ok(b.textContent.includes('Show compartments'));
 await renderView(a,view,{frameScope:'inline:one',camera:{zoom:.8},resetFrame:true});
 fitted(a);assert.ok(a.textContent.includes('Show compartments'));d.window.close();
});

test('pinch scales around moving midpoint and bounds zoom',()=>{
 const start={zoom:1,left:100,top:50,distance:100,midpoint:{x:80,y:60}};
 assert.deepEqual(pinchFrame(start,{x:100,y:70},200),{zoom:2,left:260,top:150});
 assert.equal(pinchFrame(start,{x:80,y:60},10000).zoom,4);
});
test('touch gesture leaves one finger native, handles pinch and suppresses accidental selection',()=>{
 const d=dom(),viewport=document.getElementById('a'),node=document.createElement('button');viewport.append(node);
 const frame={zoom:1,left:0,top:0},scales=[];let selected=0;node.onclick=()=>selected++;
 installDiagramGestures(viewport,frame,()=>scales.push(frame.zoom));
 const touch=(type,points)=>{const event=new d.window.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:points.map(([clientX,clientY])=>({clientX,clientY}))});node.dispatchEvent(event);return event;};
 touch('touchstart',[[20,20]]);assert.equal(touch('touchmove',[[40,20]]).defaultPrevented,false);
 touch('touchstart',[[20,20],[120,20]]);assert.equal(touch('touchmove',[[20,20],[220,20]]).defaultPrevented,true);assert.equal(frame.zoom,2);assert.equal(scales.length,1);
 touch('touchend',[]);node.dispatchEvent(new d.window.MouseEvent('click',{bubbles:true,detail:1}));assert.equal(selected,0);
 node.dispatchEvent(new d.window.MouseEvent('click',{bubbles:true,detail:0}));assert.equal(selected,1,'keyboard activation remains available');
 const pointer=(type,x)=>{const e=new d.window.Event(type,{bubbles:true});Object.defineProperties(e,{clientX:{value:x},clientY:{value:0}});node.dispatchEvent(e);};
 pointer('pointerdown',0);pointer('pointermove',30);pointer('pointerup',30);node.dispatchEvent(new d.window.MouseEvent('click',{bubbles:true,detail:1}));assert.equal(selected,1);
 d.window.close();
});
test('compact controls keep semantic warnings and fit authored scenes without Expand',async()=>{
 const d=dom(),view=fixture(),container=document.getElementById('a');view.native.notices=['Incomplete semantic evidence'];
 await renderView(container,view,{compactControls:true,allowExpand:false,fitInitial:true,camera:{zoom:1.5}});
 assert.equal(container.querySelector('.native-expand'),null);assert.ok(container.querySelector('.native-more'));assert.ok(container.querySelector('[aria-label="Zoom in"]'));fitted(container);
 assert.ok(container.textContent.includes('Incomplete semantic evidence'));assert.ok(!container.textContent.includes('Pan with scroll'));assert.ok(container.querySelector('.native-more').textContent.includes('Show compartments'));d.window.close();
});
test('hidden panel restoration waits for visible dimensions and ignores hidden scroll events',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();
 await renderView(container,view);let viewport=container.querySelector('.native-scroll');viewport.scrollLeft=140;viewport.scrollTop=90;viewport.dispatchEvent(new d.window.Event('scroll'));
 container.hidden=true;await renderView(container,view,{selectedId:'semantic-b'});viewport=container.querySelector('.native-scroll');
 assert.equal(viewport.clientWidth,0);assert.equal(viewport.scrollLeft,0,'hidden render does not restore against zero dimensions');
 viewport.dispatchEvent(new d.window.Event('scroll'));
 container.hidden=false;container.querySelector('.native-view').restoreFrame();assert.equal(viewport.scrollLeft,140);assert.equal(viewport.scrollTop,90);
 container.hidden=true;await renderView(container,view,{frameScope:'new-hidden',fitInitial:true});assert.equal(container.querySelector('output').textContent,'100%');
 container.hidden=false;container.querySelector('.native-view').restoreFrame();assert.notEqual(container.querySelector('output').textContent,'100%','initial fit is deferred until visible');
 d.window.close();
});

test('Fit clears manual pan and fits large diagrams below five percent',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();
 await renderView(container,view,{placements:[{target:'semantic-b',x:20000,y:20000}],camera:{zoom:3,target:'semantic-b'}});
 const initial=fitted(container);assert.ok(parseInt(initial)<5,'large canvas fits below five percent');
 container.querySelector('[aria-label="Zoom in"]').click();const viewport=container.querySelector('.native-scroll');viewport.scrollLeft=70;viewport.scrollTop=90;viewport.dispatchEvent(new d.window.Event('scroll'));
 [...container.querySelectorAll('button')].find(b=>b.textContent==='Fit').click();assert.equal(fitted(container),initial);assert.equal(viewport.scrollTop,0);d.window.close();
});
test('resize fits untouched frames and hidden first displays but preserves manual zoom',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();let notify,width=400,height=300;
 d.window.ResizeObserver=class{constructor(callback){notify=callback;}observe(){}disconnect(){}};
 for(const [name,get] of [['clientWidth',()=>width],['clientHeight',()=>height]])Object.defineProperty(d.window.HTMLElement.prototype,name,{configurable:true,get(){return this.classList.contains('native-scroll')&&!this.closest('[hidden]')?get():0;}});
 container.hidden=true;await renderView(container,view,{camera:{zoom:3}});container.hidden=false;notify();fitted(container);
 width=200;height=150;notify();let svg=container.querySelector('svg');assert.ok(parseFloat(svg.style.width)<=200);assert.ok(parseFloat(svg.style.height)<=150);
 container.querySelector('[aria-label="Zoom in"]').click();const manual=container.querySelector('output').textContent;width=400;height=300;notify();assert.equal(container.querySelector('output').textContent,manual);d.window.close();
});


test('zoom out and inward pinch remain monotonic below five percent after fitting a large diagram',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();
 await renderView(container,view,{placements:[{target:'semantic-b',x:20000,y:20000}]});
 const svg=container.querySelector('svg'),initialWidth=parseFloat(svg.style.width);
 container.querySelector('[aria-label="Zoom out"]').click();assert.ok(parseFloat(svg.style.width)<initialWidth,'zoom out must shrink the fitted diagram');
 const initialZoom=.01;
 const pinched=pinchFrame({zoom:initialZoom,left:0,top:0,distance:100,midpoint:{x:50,y:50}},{x:50,y:50},50);
 assert.ok(pinched.zoom>0&&pinched.zoom<initialZoom,'inward pinch must reduce sub-five-percent zoom');
 d.window.close();
});


test('touch tap preserves automatic fit until a real pan or pinch changes the frame',()=>{
 const d=dom(),viewport=document.getElementById('a'),frame={zoom:.01,left:0,top:0,fitted:true};
 installDiagramGestures(viewport,frame,()=>{});
 const touch=(type,points)=>{const event=new d.window.Event(type,{bubbles:true,cancelable:true});Object.defineProperty(event,'touches',{value:points.map(([clientX,clientY])=>({clientX,clientY}))});viewport.dispatchEvent(event);};
 touch('touchstart',[[20,20]]);touch('touchend',[]);assert.equal(frame.fitted,true);
 touch('touchstart',[[20,20],[120,20]]);assert.equal(frame.fitted,true);
 touch('touchmove',[[20,20],[70,20]]);assert.equal(frame.fitted,false);assert.equal(frame.zoom,.005);d.window.close();
});

test('opposite scene compartment defaults stay isolated and reset to their own authored choice',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();
 const expanded={presentationPreferences:{showCompartments:true}},collapsed={presentationPreferences:{showCompartments:false}};
 await renderView(container,view,expanded);fitted(container);
 assert.ok(container.textContent.includes('Hide compartments'));
 await renderView(container,view,collapsed);fitted(container);
 assert.ok(container.textContent.includes('Show compartments'));
 [...container.querySelectorAll('button')].find(b=>b.textContent==='Show compartments').click();
 for(let i=0;i<100&&!container.textContent.includes('Hide compartments');i++)await new Promise(resolve=>setTimeout(resolve,10));
 assert.ok(container.textContent.includes('Hide compartments'));
 await renderView(container,view,expanded);
 [...container.querySelectorAll('button')].find(b=>b.textContent==='Hide compartments').click();
 for(let i=0;i<100&&!container.textContent.includes('Show compartments');i++)await new Promise(resolve=>setTimeout(resolve,10));
 assert.ok(container.textContent.includes('Show compartments'));
 await renderView(container,view,collapsed);assert.ok(container.textContent.includes('Hide compartments'));
 await renderView(container,view,{...collapsed,resetFrame:true});fitted(container);assert.ok(container.textContent.includes('Show compartments'));
 await renderView(container,view,expanded);assert.ok(container.textContent.includes('Show compartments'));
 await renderView(container,view,{...expanded,resetFrame:true});fitted(container);assert.ok(container.textContent.includes('Hide compartments'));
 d.window.close();
});


test('general definitions sit above typed usages and specialization chains without reversing semantic arrows',async()=>{
 const native={kind:'tree',nodes:[{id:'usage',kind:'part',name:'Top'},{id:'specific',kind:'part def',name:'Middle'},{id:'general',kind:'part def',name:'Bottom'}],edges:[{from:'usage',to:'specific',kind:'typing'},{from:'specific',to:'general',kind:'specialization'}]};
 const before=JSON.stringify(native),auto=await presentationLayout(presentationPayload(native));
 assert.ok(auto.nodes.get('general').y<auto.nodes.get('specific').y);
 assert.ok(auto.nodes.get('specific').y<auto.nodes.get('usage').y);
 for(const [index,points] of auto.routes){assert.ok(points[0].y>points.at(-1).y,'semantic arrow points from specific up to general');}
 const d=dom();await renderView(document.getElementById('a'),{id:'general',native});
 for(const edge of document.querySelectorAll('.opensysml-edge polyline'))assert.ok(edge.getAttribute('marker-end').includes('triangle-hollow'));
 assert.equal(JSON.stringify(native),before);d.window.close();
});
test('ownership stays owner-first and behavior, fault trees and port interconnections retain native layout input',async()=>{
 const native={kind:'tree',nodes:[{id:'owner',kind:'part def',name:'Owner'},{id:'part',kind:'part',name:'Part'},{id:'type',kind:'part def',name:'Type'}],edges:[{from:'owner',to:'part',kind:'composition'},{from:'part',to:'type',kind:'typing'}]};
 const input=layoutPayload(native);assert.deepEqual(input.edges[0],native.edges[0]);
 const auto=await presentationLayout(presentationPayload(native));
 assert.ok(auto.nodes.get('owner').y<auto.nodes.get('part').y);assert.ok(auto.nodes.get('type').y<auto.nodes.get('part').y);
 for(const kind of ['action','state','sequence','fault-tree','interconnection']){const other={...native,kind};assert.equal(layoutPayload(other),other);}
});

test('general-first layout preserves nested ownership and explicit author placement',async()=>{
 const native=presentationPayload({kind:'tree',nodes:[{id:'owner',kind:'part',name:'Assembly'},{id:'part',parent:'owner',kind:'part',name:'Component'},{id:'type',kind:'part def',name:'ComponentType'}],edges:[{from:'part',to:'type',kind:'typing'}]});
 const auto=await presentationLayout(native),owner=auto.nodes.get('owner'),part=auto.nodes.get('part'),type=auto.nodes.get('type');
 assert.ok(type.y<part.y);assert.ok(owner.y<part.y);assert.ok(owner.y+owner.height>=part.y+part.height);
 const placed={...native,nodes:native.nodes.map(n=>n.id==='type'?{...n,x:800,y:900}:n)};
 const authored=await presentationLayout(placed);assert.equal(authored.nodes.get('type').x,800);assert.equal(authored.nodes.get('type').y,900);
 const portEdge={kind:'typing',from:'usage',to:'definition',fromPort:'usage-port',toPort:'definition-port'};
 assert.deepEqual(layoutPayload({kind:'tree',edges:[portEdge]}).edges[0],{...portEdge,from:'definition',to:'usage',fromPort:'definition-port',toPort:'usage-port'});
});


test('matrix labels shorten only unambiguous names and retain accessible full names and native row selection',async()=>{
 const d=dom(),container=document.getElementById('a'),selected=[];
 const view={id:'trace',rowToElement:{0:'source-id',1:'collision-id',2:'plain-id'},native:{kind:'matrix',columns:['Source / Target','Requirements::safe','A::same','Requirements::shared','plain'],rows:[{cells:['Design::boat','Requirements::safe','derive','satisfy','']},{cells:['B::same','','','','']},{cells:['Requirements::shared','','','','']}]}};
 const before=JSON.stringify(view);await renderView(container,view,{onSelect:id=>selected.push(id)});
 const headers=container.querySelectorAll('th'),rows=container.querySelectorAll('tbody tr');
 assert.equal(headers[0].textContent,'Source / Target');assert.equal(headers[1].textContent,'safe');assert.equal(headers[1].title,'Requirements::safe');assert.equal(headers[1].getAttribute('aria-label'),'Requirements::safe');
 assert.equal(headers[2].textContent,'A::same');assert.equal(rows[1].querySelector('td').textContent,'Select B::same');
 assert.equal(headers[3].textContent,'shared');assert.equal(rows[2].querySelector('td').textContent,'Select shared','repeated identical full names are unambiguous');
 assert.equal(rows[0].querySelector('td').getAttribute('aria-label'),'Design::boat');assert.equal(rows[0].children[1].textContent,'Requirements::safe','relationship cell text stays native');
 rows[0].querySelector('button').click();assert.deepEqual(selected,['source-id']);assert.equal(rows[0].dataset.semanticId,'source-id');assert.equal(JSON.stringify(view),before);
 await renderView(container,{...view,native:{...view.native,kind:'table'}});assert.equal(container.querySelectorAll('th')[1].textContent,'Requirements::safe');assert.equal(container.querySelector('tbody tr').children[1].textContent,'Requirements::safe');
 d.window.close();
});
