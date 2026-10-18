/** DOM regressions; these do not establish visual quality or reader acceptance. */
import assert from 'node:assert/strict';
import {test} from 'node:test';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {fileURLToPath,pathToFileURL} from 'node:url';
import * as exploration from '../src/exploration.mjs';

if (!process.env.OPENSYSML_SOURCE) throw Error('Set OPENSYSML_SOURCE to the pinned renderer checkout');
const require=createRequire(resolve(process.env.OPENSYSML_SOURCE,'editors/vscode/package.json'));
const {JSDOM}=require('jsdom');
const app=readFileSync(new URL('../src/app.mjs',import.meta.url),'utf8');
const html=readFileSync(new URL('../index.html',import.meta.url),'utf8');

function harness(hash='',renderer=null) {
  const dom=new JSDOM(html,{url:'https://example.test/snapshots/one/'+hash,runScripts:'outside-only'});
  const w=dom.window;
  let mobile=false;
  const renders=[];
  Object.assign(w,exploration,{structuredClone,renderView:async(container,view,options)=>{renders.push({container,host:container.parentElement,view,options});if(renderer)await renderer(container,view,options);},fetch:async()=>({ok:true,json:async()=>[['Parameter','Value'],['Length',1]]})});
  w.matchMedia=()=>({matches:mobile,addEventListener(){}});
  w.HTMLElement.prototype.scrollIntoView=function(){this.dataset.scrolled='true';};
  w.scrollTo=()=>{};
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true;};
  w.HTMLDialogElement.prototype.close=function(){this.open=false;};
  // Execute production functions in their actual lexical scope, omitting only
  // imports (injected above) and the network-startup call. No algorithms copied.
  let source=app.replace(/^import .*;\r?\n/gm,'');
  const startup=source.lastIndexOf('start().catch');assert.ok(startup>0,'startup boundary exists');
  source=source.slice(0,startup)+`
    bundle={elements:[{id:'a',name:'Alpha',kind:'part'},{id:'b',name:'Beta',kind:'part'}],relationships:[],views:[{id:'v',elementIds:['a','b'],native:{}}]};
    story={blocks:[
      {type:'stop',id:'first',title:'First',focus:'a',view:'v',camera:{target:'a',zoom:2},placements:[{target:'a',x:20,y:30}]},
      {type:'markdown',text:'Some readable prose.'},
      {type:'table',id:'wide',title:'Wide evidence',fullWidth:true,asset:'table.json',caption:'Measured',provenance:{source:'record',context:'run'}},
      {type:'stop',id:'second',title:'Second',focus:'b',view:'v',camera:{target:'b',zoom:2}},
      {type:'closing',id:'close',title:'Next',supports:'A',open:'B',next:'C'}],stops:['first','second']};
    manifest={snapshotId:'one'};
    for(const e of bundle.elements)elements.set(e.id,e);for(const v of bundle.views)views.set(v.id,v);
    selected='a';nav=new Navigation(initialState('a'));
    globalThis.api={evidence,bindNavigationControls,configure:configuration=>{bundle.configuration=configuration;configureNavigation();},addView:view=>{bundle.views.push(view);views.set(view.id,view);},markdown,setStore:value=>{store=value;},draw,buildStory,activate,restoreLocation,exploreStop,update,choose,pause,dockExplorer,
      state:()=>({selected,paused,stop:activeStop?.id,saved:savedStory,nav:nav.state})};
  `;
  w.eval(source);
  return {dom,w,renders,api:w.api,setMobile(value){mobile=value;}};
}

test('direct stop URLs restore after asynchronous story construction; outline changes URL',async()=>{
  const h=harness('#second');await h.api.buildStory();h.api.activate('first');h.api.restoreLocation();
  assert.equal(h.api.state().stop,'second');assert.equal(h.api.state().selected,'b');
  assert.equal(h.w.document.getElementById('second').dataset.scrolled,'true');
  h.w.document.querySelector('#outline a[data-stop="first"]').click();
  assert.equal(h.w.location.hash,'#first');assert.equal(h.api.state().stop,'first');
  h.w.location.hash='#second';h.api.restoreLocation();assert.equal(h.api.state().stop,'second');
  await new Promise(setImmediate); // Drain pending asynchronous scene draws before tearing down the DOM.
  h.dom.window.close();
});

test('inline selection and Explore bind their owning stop even while another stop is paused',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('second');h.api.pause();
  const firstInline=h.renders.find(r=>r.options.camera?.target==='a');assert.ok(firstInline);
  firstInline.options.onSelect('a');
  assert.equal(h.api.state().stop,'first');assert.equal(h.api.state().saved.stop,'first');
  assert.equal(h.api.state().nav.focus,'a');assert.equal(h.api.state().selected,'a');
  h.api.activate('second',true);h.api.pause();
  h.w.document.querySelector('#first .inline-view > button').click();
  assert.equal(h.api.state().stop,'first');assert.equal(h.api.state().saved.stop,'first');
  await new Promise(setImmediate); // Drain pending asynchronous scene draws before tearing down the DOM.
  h.dom.window.close();
});

test('focus updates synchronize details; selection retains camera until explicit context change',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('first');h.api.choose('b');
  assert.equal(h.api.state().paused,true);assert.equal(h.api.state().nav.sceneOptions.camera.zoom,2);
  assert.equal(h.api.state().nav.sceneOptions.placements[0].x,20);
  h.api.update({focus:'b',view:null});assert.equal(h.api.state().selected,'b');assert.equal(h.api.state().nav.sceneOptions,null);
  h.api.update({view:'v'});assert.equal(h.api.state().selected,'b');
  await new Promise(setImmediate); // Drain pending asynchronous scene draws before tearing down the DOM.
  h.dom.window.close();
});

test('fullWidth evidence has a separate layout row; mobile explorer opens only when requested',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('first');const d=h.w.document;
  assert.equal(d.getElementById('wide').parentElement.id,'story');assert.ok(d.getElementById('wide').classList.contains('evidence-wide'));
  assert.equal(d.querySelectorAll('.reading-band').length,2);
  assert.equal(d.getElementById('explorer-disclosure').parentElement,d.getElementById('first').closest('.reading-band'));
  h.api.activate('second');assert.equal(d.getElementById('explorer-disclosure').parentElement,d.getElementById('second').closest('.reading-band'));
  h.setMobile(true);h.api.dockExplorer();assert.equal(d.getElementById('explorer-disclosure').parentElement.className,'workspace');
  assert.equal(d.getElementById('explorer-disclosure').open,false);h.api.pause();assert.equal(d.getElementById('explorer-disclosure').open,true);
  await new Promise(setImmediate); // Drain pending asynchronous scene draws before tearing down the DOM.
  h.dom.window.close();
});


test('lazy context loads before drawing; failed loads remain explicit',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('first');
  const requests=[];h.api.setStore({ensureNeighborhood:async ids=>{requests.push(ids);return {loaded:ids,unavailable:[]};}});
  h.api.update({focus:'b',view:null});await new Promise(setImmediate);
  assert.ok(requests.some(ids=>ids.includes('b')));
  assert.match(h.w.document.getElementById('details').textContent,/Beta/);
  h.api.setStore({ensureNeighborhood:async()=>{throw Error('digest mismatch');}});
  await h.api.draw();assert.match(h.w.document.getElementById('notice').textContent,/digest mismatch/);
  assert.match(h.w.document.getElementById('canvas').textContent,/does not mean relationships are absent/);
  h.dom.window.close();
});


test('selection redraw moves keyboard focus to the selected details heading',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('first');await new Promise(setImmediate);
  const node=h.w.document.createElement('button');node.textContent='Selected model node';h.w.document.getElementById('canvas').append(node);node.focus();
  h.api.choose('b');await new Promise(setImmediate);
  assert.equal(h.w.document.activeElement.tagName,'H3');
  assert.equal(h.w.document.activeElement.textContent,'Beta');
  h.dom.window.close();
});


test('tilde and long backtick fences stay literal rather than interactive prose',()=>{
  const h=harness();
  for(const fence of ['~~~','````']){
    const rendered=h.api.markdown(fence+'\n[Inspect](model:a)\n```\n'+fence);
    assert.equal(rendered.querySelectorAll('button,a').length,0);
    assert.match(rendered.querySelector('pre').textContent,/model:a/);
  }
  h.dom.window.close();
});


test('entry points sharing one semantic identity select distinct native views',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('first');
  h.api.addView({id:'alternate',elementIds:['a'],native:{}});
  h.api.configure({entryPoints:[{id:'a',view:'v',label:'Structure'},{id:'a',view:'alternate',label:'Actions'}]});
  const select=h.w.document.querySelector('#entry-points select');
  select.value='1';select.dispatchEvent(new h.w.Event('change'));
  assert.equal(h.api.state().nav.view,'alternate');
  select.value='0';select.dispatchEvent(new h.w.Event('change'));
  assert.equal(h.api.state().nav.view,'v');
  await new Promise(setImmediate);h.dom.window.close();
});

test('native-only exploration blocks relationship navigation but retains authored scenes and inspection',async()=>{
  const h=harness();await h.api.buildStory();h.api.configure({modes:['native-views'],entryPoints:[{id:'a'},{id:'b',view:'v'}]});h.api.activate('first');
  h.api.update({focus:'b',view:null});assert.equal(h.api.state().nav.focus,'a');
  h.api.choose('b');await new Promise(setImmediate);
  assert.equal(h.api.state().selected,'b');assert.equal(h.api.state().nav.view,'v');
  assert.ok(![...h.w.document.querySelectorAll('#details button')].some(b=>['Focus','Pin','Expand neighbors','Collapse expansion'].includes(b.textContent)));
  assert.equal(h.w.document.getElementById('node-filters').closest('details').hidden,true);
  assert.equal(h.w.document.querySelectorAll('#entry-points option').length,2);
  h.w.location.hash=exploration.shareState('one','first',{...exploration.initialState('b'),view:null});await h.api.restoreLocation();
  assert.match(h.w.document.getElementById('notice').textContent,/mode is disabled/);
  h.api.activate('second',true);await new Promise(setImmediate);assert.equal(h.api.state().stop,'second');
  assert.equal(h.renders.at(-1).view.id,'v');h.dom.window.close();
});

test('relationships-only exploration rejects native entry navigation without hiding authored native scenes',async()=>{
  const h=harness();await h.api.buildStory();h.api.configure({modes:['relationships'],entryPoints:[{id:'a',view:'v'},{id:'b'}]});h.api.activate('first');await new Promise(setImmediate);
  assert.equal(h.renders.at(-1).view.id,'v');
  assert.equal(h.w.document.querySelectorAll('#entry-points option').length,2);
  h.api.update({view:'v'});assert.equal(h.api.state().paused,false);
  h.api.update({focus:'b',view:null});await new Promise(setImmediate);assert.equal(h.renders.at(-1).view.id,'exploration');
  h.w.location.hash=exploration.shareState('one','first',{...exploration.initialState('b'),view:'v'});await h.api.restoreLocation();
  assert.match(h.w.document.getElementById('notice').textContent,/mode is disabled/);
  h.api.activate('second',true);await new Promise(setImmediate);assert.equal(h.renders.at(-1).view.id,'v');
  h.dom.window.close();
});


test('relationships-only shared authored inspection requires exact stop options',async()=>{
  const h=harness();await h.api.buildStory();h.api.configure({modes:['relationships']});h.api.activate('first');
  for(const sceneOptions of [{},{camera:{target:'a',zoom:1}}]){
    h.w.location.hash=exploration.shareState('one','first',{...exploration.initialState('a'),view:'v',sceneOptions});
    await h.api.restoreLocation();assert.match(h.w.document.getElementById('notice').textContent,/mode is disabled/);
    assert.equal(h.api.state().paused,false);
  }
  await new Promise(setImmediate);h.dom.window.close();
});

test('production Relayout and Share preserve restorable authored inspection with native exploration disabled',async()=>{
  const h=harness();await h.api.buildStory();h.api.configure({modes:['relationships']});h.api.activate('first');h.api.bindNavigationControls();
  h.api.choose('b');h.w.document.getElementById('relayout').click();await new Promise(setImmediate);
  assert.equal(h.api.state().nav.sceneOptions.camera.zoom,2);
  h.w.document.getElementById('share').click();await new Promise(setImmediate);
  assert.match(h.w.location.hash,/^#state=/);await h.api.restoreLocation();await new Promise(setImmediate);
  assert.equal(h.api.state().paused,true);assert.equal(h.api.state().nav.view,'v');
  assert.equal(h.api.state().nav.sceneOptions.camera.zoom,2);
  assert.doesNotMatch(h.w.document.getElementById('notice').textContent,/not restored/);
  h.dom.window.close();
});


test('prepared evidence displays supplied execution classification and inputs safely (synthetic fixture, not an actual run)',async()=>{
  const h=harness();const fixture={type:'figure',id:'synthetic',title:'Synthetic UI fixture',asset:'fixture.svg',alt:'Fixture only',caption:'Not an engineering run',provenance:{source:'fixture',context:'unit test'},evidence:{classification:'recorded-execution',source:'synthetic recorder',runId:'not-an-actual-run',configuration:'test configuration',inputs:{unsafe:'<img src=x onerror=alert(1)>',count:2,enabled:false}}};
  const rendered=await h.api.evidence(fixture);
  assert.equal(rendered.querySelector('.evidence-classification').textContent,'Recorded execution');
  for(const value of ['synthetic recorder','not-an-actual-run','test configuration'])assert.ok(rendered.querySelector('.evidence-metadata').textContent.includes(value));
  assert.deepEqual(JSON.parse(rendered.querySelector('.evidence-metadata pre').textContent),fixture.evidence.inputs);
  assert.equal(rendered.querySelectorAll('.evidence-metadata img,script').length,0);
  h.dom.window.close();
});

test('prepared analysis tables do not invent run IDs and absent metadata stays unclassified',async()=>{
  const h=harness();const fixture={type:'table',id:'synthetic-table',title:'Synthetic analysis fixture',asset:'table.json',caption:'UI test only',provenance:{source:'fixture',context:'unit test'}};
  const analysis=await h.api.evidence({...fixture,evidence:{classification:'prepared-analysis',source:'synthetic calculation',configuration:'test inputs',inputs:{}}});
  assert.equal(analysis.querySelector('.evidence-classification').textContent,'Prepared analysis');
  assert.ok(![...analysis.querySelectorAll('dt')].some(node=>node.textContent==='Run ID'));
  assert.ok(analysis.querySelector('table'));
  const unclassified=await h.api.evidence(fixture);
  assert.equal(unclassified.querySelector('.evidence-classification').textContent,'Unclassified evidence');
  assert.match(unclassified.textContent,/No execution or analysis classification was supplied/);
  h.dom.window.close();
});


test('explicit Resume resets the owning inline scene, while selection does not reset inline framing',async()=>{
  const h=harness();await h.api.buildStory();h.api.activate('first');h.api.bindNavigationControls();await new Promise(setImmediate);
  const initialInline=h.renders.find(r=>r.host.closest('#first .inline-canvas'));
  const inlineCount=()=>h.renders.filter(r=>r.host.closest('.inline-canvas')).length;
  const before=inlineCount();initialInline.options.onInteract();h.api.choose('b');await new Promise(setImmediate);
  assert.equal(inlineCount(),before);assert.equal(h.api.state().paused,true);
  h.w.document.getElementById('resume').click();await new Promise(setImmediate);
  assert.equal(inlineCount(),before+1);
  const restored=h.renders.filter(r=>r.host.closest('#first .inline-canvas')).at(-1);
  assert.equal(restored.options.resetFrame,true);assert.equal(restored.options.camera.zoom,2);
  assert.equal(restored.options.selectedId,'a');assert.equal(h.api.state().paused,false);
  h.dom.window.close();
});


test('Resume restores real native inline zoom and compartments after mobile exploration',async()=>{
  const directory=await mkdtemp(join(tmpdir(),'syspresent-app-renderer-'));
  const previousDocument=globalThis.document;
  let h;
  try{
    const output=join(directory,'renderer.mjs');const editor=resolve(process.env.OPENSYSML_SOURCE,'editors/vscode');
    await require('esbuild').build({entryPoints:[fileURLToPath(new URL('../src/renderer.mjs',import.meta.url))],outfile:output,bundle:true,format:'esm',platform:'node',alias:Object.fromEntries(['canvas','layout','autolayout','table'].map(k=>['@opensysml/'+k,join(editor,'src/webview',k+'.ts')]))});
    const {renderView}=await import(pathToFileURL(output).href);h=harness('',renderView);globalThis.document=h.w.document;h.setMobile(true);
    h.api.addView({id:'v',elementIds:['a','b'],native:{kind:'requirement',form:'mermaid',nodes:[{id:'a',semanticId:'a',kind:'requirement',name:'Alpha',detail:'Synthetic requirement'},{id:'b',semanticId:'b',kind:'requirement',name:'Beta',detail:'Synthetic requirement'}],edges:[]}});
    await h.api.buildStory();h.api.activate('first');h.api.bindNavigationControls();await h.api.draw();
    let inline=h.w.document.querySelector('#first .inline-canvas');
    [...inline.querySelectorAll('button')].find(b=>b.textContent==='Show compartments').click();
    for(let attempt=0;attempt<100&&!([...inline.querySelectorAll('button')].some(b=>b.textContent==='Hide compartments'));attempt++)await new Promise(resolve=>setTimeout(resolve,10));
    inline.querySelector('button[aria-label="Zoom in"]').click();
    assert.equal(h.api.state().paused,false);
    assert.equal(inline.querySelector('output').textContent,'250%');
    assert.ok([...inline.querySelectorAll('button')].some(b=>b.textContent==='Hide compartments'));
    await h.w.document.getElementById('resume').onclick();await h.api.draw();
    inline=h.w.document.querySelector('#first .inline-canvas');assert.equal(inline.querySelector('output').textContent,'200%');
    assert.ok([...inline.querySelectorAll('button')].some(b=>b.textContent==='Show compartments'));
    assert.equal(h.api.state().paused,false);
  }finally{h?.dom.window.close();globalThis.document=previousDocument;await rm(directory,{recursive:true,force:true});}
});

test('mobile exploration uses bounded panels and restores the story on cancel',async()=>{
 const h=harness();h.setMobile(true);await h.api.buildStory();h.api.activate('second');h.api.bindNavigationControls();
 const d=h.w.document;let scroll;
 h.w.scrollTo=value=>{scroll=value.top;};Object.defineProperty(h.w,'scrollY',{value:640});
 const trigger=d.querySelector('#first .inline-view > button');trigger.focus();trigger.click();
 assert.equal(d.getElementById('mobile-explorer').open,true);
 assert.equal(d.getElementById('inspector').parentElement.id,'mobile-host');
 assert.equal(h.api.state().saved.scroll,640);assert.equal(h.api.state().stop,'first');
 assert.equal(d.getElementById('panel-model').hidden,false);
 await new Promise(setImmediate);
 const before=h.renders.length;
 d.getElementById('tab-find').click();d.getElementById('tab-model').click();
 assert.equal(h.renders.length,before,'tabs preserve the rendered camera surface');
 h.api.choose('b');await new Promise(setImmediate);
 assert.equal(d.getElementById('panel-details').hidden,false);
 d.getElementById('mobile-explorer').dispatchEvent(new h.w.Event('cancel',{cancelable:true}));
 await new Promise(setImmediate);
 assert.equal(d.getElementById('mobile-explorer').open,false);
 assert.equal(d.body.classList.contains('explorer-open'),false);
 assert.equal(h.api.state().paused,false);assert.equal(scroll,640);assert.equal(d.activeElement,trigger);
 h.dom.window.close();
});

test('inline touch interaction does not launch a modal',async()=>{
 const h=harness();h.setMobile(true);await h.api.buildStory();h.api.activate('second');
 h.renders.find(r=>r.options.frameScope==='inline:first').options.onInteract();
 assert.equal(h.w.document.getElementById('mobile-explorer').open,false);assert.equal(h.api.state().paused,false);
 await new Promise(setImmediate);h.dom.window.close();
});

test('desktop transition restores authored navigation and releases modal state',async()=>{
 const h=harness();h.setMobile(true);await h.api.buildStory();h.api.activate('first');h.api.bindNavigationControls();
 h.api.exploreStop('first');await new Promise(setImmediate);h.api.update({focus:'b',view:null});await new Promise(setImmediate);
 h.setMobile(false);h.api.dockExplorer();await new Promise(setImmediate);
 assert.equal(h.api.state().paused,false);assert.equal(h.api.state().nav.view,'v');
 assert.equal(h.api.state().nav.focus,'a');assert.equal(h.w.document.getElementById('mobile-explorer').open,false);
 assert.equal(h.w.document.getElementById('panel-details').hidden,false);
 h.dom.window.close();
});

test('late selection render cannot override a newer mobile tab choice',async()=>{
 const h=harness();h.setMobile(true);await h.api.buildStory();h.api.activate('first');h.api.bindNavigationControls();
 h.api.exploreStop('first');await new Promise(setImmediate);
 let resolveLoad;h.api.setStore({ensureNeighborhood:()=>new Promise(resolve=>{resolveLoad=resolve;})});
 h.api.choose('b');h.w.document.getElementById('tab-find').click();
 resolveLoad({unavailable:[]});await new Promise(setImmediate);
 assert.equal(h.w.document.getElementById('panel-find').hidden,false);
 h.dom.window.close();
});
