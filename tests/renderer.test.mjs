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
const {renderView,presentationPayload,layoutPayload}=await import(pathToFileURL(output).href);
function fixture(){return {id:'requirements',native:{kind:'requirement',form:'mermaid',nodes:[
  {id:'local-a',semanticId:'semantic-a',kind:'requirement',name:'AND',detail:'A long statement '.repeat(30)},
  {id:'local-b',semanticId:'semantic-b',kind:'requirement',name:'Child',detail:'Child requirement'}],edges:[{from:'local-a',to:'local-b',kind:'derivation',label:'derive'}]}};}
function dom(){const d=new JSDOM('<!doctype html><body><div id="a"></div><div id="b"></div></body>');globalThis.document=d.window.document;return d;}

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
  const svg=container.querySelector('svg');assert.equal(svg.style.width,svg.getAttribute('viewBox').split(' ')[2]+'px');
  container.querySelector('button[aria-label="Zoom in"]').click();assert.equal(container.querySelector('output').textContent,'125%');
  const viewport=container.querySelector('.native-scroll');viewport.scrollLeft=70;viewport.dispatchEvent(new d.window.Event('scroll'));
  await renderView(container,view,{selectedId:'semantic-b'});assert.equal(container.querySelector('output').textContent,'125%');assert.equal(container.querySelector('.native-scroll').scrollLeft,70);
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

function dialogShim(d){
  d.window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  d.window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new d.window.Event('close'));};
}
test('expanded diagram moves existing native DOM and restores zoom, pan and focus on close or Escape',async()=>{
  const d=dom();dialogShim(d);const view=fixture(),before=JSON.stringify(view),container=document.getElementById('a');let interactions=0;
  await renderView(container,view,{onInteract:()=>interactions++});
  container.querySelector('[aria-label="Zoom in"]').click();
  const fragment=container.firstElementChild,svg=container.querySelector('svg'),viewport=container.querySelector('.native-scroll'),expand=container.querySelector('.native-expand');
  viewport.scrollLeft=80;viewport.scrollTop=40;viewport.dispatchEvent(new d.window.Event('scroll'));expand.focus();expand.click();
  let dialog=document.querySelector('dialog');assert.ok(dialog.open);assert.equal(dialog.querySelector('svg'),svg);assert.equal(document.querySelectorAll('svg').length,1);assert.equal(interactions,2);
  assert.equal(document.getElementById(dialog.getAttribute('aria-labelledby')).textContent,view.id);
  dialog.querySelector('[aria-label="Zoom in"]').click();viewport.scrollLeft=200;viewport.scrollTop=100;viewport.dispatchEvent(new d.window.Event('scroll'));
  dialog.querySelector('.native-dialog-header button').click();
  assert.equal(document.querySelector('dialog'),null);assert.equal(container.firstElementChild,fragment);assert.equal(container.querySelector('output').textContent,'125%');assert.equal(viewport.scrollLeft,80);assert.equal(viewport.scrollTop,40);assert.equal(document.activeElement,expand);
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
test('presentation preferences seed new frames but authored camera and user zoom prevail',async()=>{
  const d=dom(),container=document.getElementById('a'),view=fixture();
  await renderView(container,view,{presentationPreferences:{defaultZoom:.8,showCompartments:true}});assert.equal(container.querySelector('output').textContent,'80%');assert.ok(container.textContent.includes('Hide compartments'));
  container.querySelector('[aria-label="Zoom in"]').click();
  await renderView(container,view,{presentationPreferences:{defaultZoom:.5}});assert.equal(container.querySelector('output').textContent,'100%');
  await renderView(container,view,{camera:{zoom:1.5},presentationPreferences:{defaultZoom:.8}});assert.equal(container.querySelector('output').textContent,'150%');d.window.close();
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
test('explicit frame reset restores authored camera and detail defaults, then selection retains changes',async()=>{
 const d=dom(),container=document.getElementById('a'),view=fixture();
 const options={camera:{zoom:.8},presentationPreferences:{showCompartments:false}};
 await renderView(container,view,options);container.querySelector('[aria-label="Zoom in"]').click();
 let viewport=container.querySelector('.native-scroll');viewport.scrollLeft=90;viewport.dispatchEvent(new d.window.Event('scroll'));
 await renderView(container,view,{...options,selectedId:'semantic-b'});assert.equal(container.querySelector('output').textContent,'100%');assert.equal(container.querySelector('.native-scroll').scrollLeft,90);
 await renderView(container,view,{...options,resetFrame:true});assert.equal(container.querySelector('output').textContent,'80%');assert.equal(container.querySelector('.native-scroll').scrollLeft,0);
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
 assert.equal(a.querySelector('output').textContent,'100%');assert.ok(a.textContent.includes('Hide compartments'));
 assert.equal(b.querySelector('output').textContent,'80%');assert.ok(b.textContent.includes('Show compartments'));
 await renderView(a,view,{frameScope:'inline:one',camera:{zoom:.8},resetFrame:true});
 assert.equal(a.querySelector('output').textContent,'80%');assert.ok(a.textContent.includes('Show compartments'));d.window.close();
});
