import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM,VirtualConsole} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {routeConflicts} from '../src/canvas-prototype/peripheral-routing.mjs';
import {packProject} from '../src/canvas-prototype/project.mjs';
const {outputFiles}=await build({entryPoints:['src/canvas-prototype/app.mjs'],bundle:true,format:'iife',write:false,logLevel:'silent'});
const html=await readFile('index.html','utf8');
const raw=[{'@id':'orphan','@type':'PartUsage',qualifiedName:'Model::orphan',declaredName:'orphan','sysx:sourceLine':4},{'@id':'Model','@type':'Package',qualifiedName:'Model',declaredName:'Model','sysx:sourceLine':1},{'@id':'req','@type':'RequirementUsage',qualifiedName:'Model::req',declaredName:'req','sysx:sourceLine':2},{'@id':'part','@type':'PartUsage',qualifiedName:'Model::part',declaredName:'part','sysx:sourceLine':3},{'@id':'view','@type':'ViewUsage',qualifiedName:'Views::requirements','sysx:sourceLine':1}];
const native={kind:'requirement',nodes:[{id:'r',semanticId:'req',identityStatus:'mapped',name:'req',kind:'requirement'},{id:'p',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{from:'p',to:'r',kind:'satisfy',label:'satisfy'}]};
const coverage={kind:'requirement',nodes:native.nodes,edges:native.edges};
const manifest={schemaVersion:'syspresent.project.v1',title:'Fixture',systemOfInterest:['Model'],modelSources:['model.sysml'],viewSources:['views.sysml'],story:'story.md',assets:[],publication:{scope:'complete'}};
const files={'model.sysml':'package Model {}','views.sysml':'package Views {}','story.md':'```syspresent\n'+JSON.stringify({type:'scene',id:'one',title:'Control the part',view:'Views::requirements',focus:'Model::req'})+'\n```\n\nReader context.'};
const until=async predicate=>{for(let i=0;i<1000;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('UI did not settle');};
async function pickPackage(h,name){const d=h.document;d.getElementById('choose-package').click();const search=d.getElementById('package-search');search.value=name;search.dispatchEvent(new h.window.Event('input'));const choice=[...d.querySelectorAll('#package-list button')].find(b=>b.textContent===name);assert.ok(choice,'native package is offered');choice.click();await until(()=>!d.getElementById('package-dialog').open&&sceneSettled(d));}
async function harness({landingOnly=false,reducedMotion=true,secondScene=false,secondView,nativeView,compartmentFixture=false,storedSettings,contextNeighbor=false,traceFixture=false,structuralFixture=false,packageFixture=false,emptyNative=false,ancestorFixture=false,foreignOwnerFixture=false,ambiguousRefs=false,presentation,storyContent=false,url='http://localhost/',noStory=false,entryView,entryFocus,overviewFixture=false,overviewPort=false,size={width:1000,height:700}}={}){
 let workerCount=0,resizeCallback;const nativeRequests=[];const fixtureNative=structuredClone(nativeView??native);if(compartmentFixture)for(const node of fixtureNative.nodes)node.detail='Native details for '+node.semanticId;const fixtureFiles={...files};if(presentation)fixtureFiles['story.md']=fixtureFiles['story.md'].replace('\"focus\":\"Model::req\"','\"focus\":\"Model::req\",\"presentation\":'+JSON.stringify(presentation));if(secondScene)fixtureFiles['story.md']+='\n\n```syspresent\n'+JSON.stringify({type:'scene',id:'two',title:'Other scene',view:'Views::other',focus:secondView?'Model::part':'Model::orphan'})+'\n```\n\nOther context.';
 if(storyContent){const block=JSON.parse(fixtureFiles['story.md'].split('```syspresent\n')[1].split('\n```')[0]);Object.assign(block,{chapter:{id:'challenge',title:'Challenge'},figures:[{id:'course',title:'Course map',asset:'assets/course.svg',alt:'Course map',caption:'Illustrative course.',provenance:{source:'Model',context:'Fixture'},modelRefs:['Model::req']}],context:[{kind:'candidate',title:'Candidate',text:'Proposed boat.',modelRefs:['Model::part']}]});fixtureFiles['story.md']='```syspresent\n'+JSON.stringify(block)+'\n```\n\nRead [the requirement](model:Model::req) and [hidden context](model:Model::orphan).';fixtureFiles['assets/course.svg']='<svg xmlns="http://www.w3.org/2000/svg"/>';}
 const extra=traceFixture?[{id:'origin',kind:'RequirementUsage'},{id:'case',kind:'VerificationCaseUsage'},...Array.from({length:8},(_,i)=>({id:'child'+i,kind:'RequirementUsage'}))]:[],fixtureCoverage=structuredClone(coverage);for(const e of extra)fixtureCoverage.nodes.push({id:e.id,semanticId:e.id,name:e.id,kind:e.kind==='VerificationCaseUsage'?'verification case':'requirement',identityStatus:'mapped'});if(traceFixture)fixtureCoverage.edges.push({from:'r',to:'origin',kind:'derive',label:'derive'},{from:'case',to:'r',kind:'verify',label:'verify'},...extra.filter(e=>e.id.startsWith('child')).map(e=>({from:e.id,to:'r',kind:'derive',label:'derive'})));
 const structuralRaw=structuralFixture?[{'@id':'definition','@type':'PartDefinition',qualifiedName:'Model::Device',declaredName:'Device',owner:{'@id':'Model'},ownedMember:[{'@id':'sensor'},{'@id':'processor'}],'sysx:sourceLine':10},...['sensor','processor'].map(id=>({'@id':id,'@type':'PartUsage',qualifiedName:'Model::Device::'+id,declaredName:id,owner:{'@id':'definition'},'sysx:sourceLine':11})),{'@id':'nested','@type':'Package',qualifiedName:'Model::Nested',declaredName:'Nested',owner:{'@id':'Model'},'sysx:sourceLine':12}]:[];
 if(packageFixture)structuralRaw.push({'@id':'run','@type':'ActionDefinition',qualifiedName:'Model::Nested::Run',declaredName:'Run',owner:{'@id':'nested'},'sysx:sourceLine':16});
 const fixtureRaw=raw.map(e=>packageFixture&&e['@id']==='req'?{...e,owner:{'@id':'nested'}}:structuralFixture&&e['@id']==='part'?{...e,type:[{'@id':'definition'}],owner:{'@id':'Model'}}:e);
 const fixtureManifest={...manifest,...(entryView?{entryView}:{}),...(entryFocus?{entryFocus}:{})};
 if(noStory)fixtureFiles['story.md']='# Explore the supplied model\n\nNo authored scenes.';
 if(overviewFixture)structuralRaw.push({'@id':'outside','@type':'PartDefinition',qualifiedName:'Foreign::outside',declaredName:'outside','sysx:sourceLine':14},{'@id':'outside-dependency','@type':'Dependency',client:[{'@id':'definition'}],supplier:[{'@id':'outside'}]});
 if(overviewPort)structuralRaw.push({'@id':'control-port','@type':'PortUsage',qualifiedName:'Model::controlPort',declaredName:'controlPort',owner:{'@id':'Model'},'sysx:sourceLine':15});
 let pendingRender,holdLayout=false,holdCountdown=null;const heldLayouts=[];
 const window=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}).window;
 if(storedSettings)window.localStorage.setItem('syspresent.reader.v1',JSON.stringify(storedSettings));
 window.URL.createObjectURL=()=> 'blob:fixture';window.URL.revokeObjectURL=()=>{};
 window.matchMedia=()=>({matches:reducedMotion});window.Element.prototype.animate=function(){let done;const finished=new Promise(resolve=>done=resolve);return {finished,cancel:()=>done()};};const ownRealm=value=>{if(value===null||typeof value!=='object')return value;if(ArrayBuffer.isView(value))return new window.Uint8Array(value);if(Array.isArray(value))return window.Array.from(value,ownRealm);if(value instanceof Set)return new window.Set([...value].map(ownRealm));if(value instanceof Map)return new window.Map([...value].map(([k,v])=>[ownRealm(k),ownRealm(v)]));return window.Object.fromEntries(Object.entries(value).map(([k,v])=>[k,ownRealm(v)]));};window.structuredClone=value=>ownRealm(structuredClone(value));window.ResizeObserver=class{constructor(fn){resizeCallback=fn;}observe(){}};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{get(){return size.width;}});Object.defineProperty(window.HTMLElement.prototype,'clientHeight',{get(){return size.height;}});
 window.fetch=async url=>({ok:true,arrayBuffer:async()=>packProject({manifest:fixtureManifest,files:fixtureFiles}).buffer,json:async()=>String(url).includes('demos.json')?{schemaVersion:'syspresent.demos.v1',demos:[{id:'blue-dog',title:'Fixture',project:'project.zip'},{id:'flashlight',title:'Small fixture',project:'small.zip'}]}:String(url).includes('project.json')?fixtureManifest:{version:'fixture'},text:async()=>files[String(url).split('/').at(-1)]});
 window.Worker=class{constructor(url){workerCount++;this.layout=String(url).includes('elk-worker')?new ELK():null;}postMessage(message){const {id,method,params}=message;if(message.cmd){if(message.cmd==='layout')this.layout.layout(structuredClone(message.graph)).then(data=>{const reply=()=>this.onmessage({data:{id,data}});if(holdLayout||holdCountdown===1){holdLayout=false;holdCountdown=null;heldLayouts.push(error=>error?this.onmessage({data:{id,error:{message:error}}}):reply());}else{if(holdCountdown!==null)holdCountdown--;reply();}});else queueMicrotask(()=>this.onmessage({data:{id,data:{}}}));return;}const respond=result=>queueMicrotask(()=>this.onmessage({data:{id,result}}));
  if(method==='Initialize')respond({version:'test'});
  else if(method==='ParseSources')respond({modelHash:'fixture',roots:[{childIds:['Model']}],diagnostics:params.documents.some(d=>d.content.includes('BROKEN'))?[{severity:'error',message:'Native parse rejected broken view'}]:[]});
  else if(method==='ExportModel')respond({elements:structuredClone([...structuralRaw,...fixtureRaw.map(e=>(ancestorFixture||foreignOwnerFixture)&&['req','orphan'].includes(e['@id'])?{...e,owner:{'@id':foreignOwnerFixture?'foreign':'Model'}}:e),...(foreignOwnerFixture?[{'@id':'foreign','@type':'Package',qualifiedName:'Foreign::root',declaredName:'root','sysx:sourceLine':1}]:[]),...(ambiguousRefs?['duplicate1','duplicate2'].map(id=>({'@id':id,'@type':'RequirementUsage',qualifiedName:'Model::ambiguous',declaredName:'ambiguous','sysx:sourceLine':9})):[]),...extra.map(e=>({'@id':e.id,'@type':e.kind,qualifiedName:'Model::'+e.id,declaredName:e.id,'sysx:sourceLine':8})),...((secondScene||secondView)?[{'@id':'view2','@type':'ViewUsage',qualifiedName:'Views::other','sysx:sourceLine':2}]:[]),...(contextNeighbor==='shared'?[{'@id':'second-neighbor-link','@type':'Dependency',client:[{'@id':'part'}],supplier:[{'@id':'orphan'}]}]:[]),...(contextNeighbor?[{'@id':'neighbor-link','@type':'Dependency',client:[{'@id':'req'}],supplier:[{'@id':'orphan'}]}]:[])])});
  else if(method==='RenderView'&&params.view==='Views::other')respond(structuredClone(secondView??{kind:'requirement',nodes:[{id:'o',semanticId:'orphan',identityStatus:'mapped',name:'orphan',kind:'part'}],edges:[]}));
  else if(method==='RenderView'&&params.view.startsWith('#')){nativeRequests.push(params.view);pendingRender=()=>respond(emptyNative?{kind:'action',nodes:[],edges:[]}:packageFixture&&params.view.startsWith('#action:')?{kind:'action',nodes:[{id:'run-native',semanticId:'run',name:'Native run activity',kind:'action',identityStatus:'mapped'}],edges:[]}:{kind:'interconnection',nodes:[native.nodes[1]],edges:[]});}
  else if(method==='RenderView')respond(params.view.endsWith('::coverage')?fixtureCoverage:structuredClone(fixtureNative));
 }terminate(){}};
 window.eval(outputFiles[0].text);if(landingOnly)return {window,document:window.document,workerCount:()=>workerCount};window.document.querySelector('[data-demo="blue-dog"]').click();await until(()=>(noStory?window.document.querySelectorAll('.node[data-context=\"false\"]').length>0:window.document.querySelectorAll('.node[data-context=\"false\"]').length===2)&&window.document.getElementById('status').textContent.startsWith('OpenSysML WASM')).catch(e=>{throw Error(e.message+': '+window.document.getElementById('status').textContent);});
 return {window,nativeRequests,story:fixtureFiles['story.md'],document:window.document,resize:(width,height)=>{size.width=width;size.height=height;resizeCallback?.();},release:()=>pendingRender?.(),pending:()=>!!pendingRender,holdLayout:()=>{holdLayout=true;},holdLayoutAfter:count=>{holdCountdown=count;},layoutPending:()=>heldLayouts.length>0,releaseLayout:error=>heldLayouts.splice(0).forEach(reply=>reply(error))};
}
test('package workspace scopes search and traversal, offers native view switching and restores scene handoff',async()=>{
 const h=await harness({structuralFixture:true,packageFixture:true,overviewFixture:true}),d=h.document;
 try{
  d.getElementById('standalone').click();await until(()=>sceneSettled(d)&&!d.getElementById('workspace-controls').hidden);
  await pickPackage(h,'Model::Nested');
  assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');
  assert.deepEqual(activeIDs(d),['nested','req','run']);assert.equal(d.querySelector('[data-semantic-id="outside"]'),null);
  const positions=[...d.querySelectorAll('.node')].map(n=>n.style.transform);d.querySelector('[data-semantic-id="req"]').click();assert.deepEqual([...d.querySelectorAll('.node')].map(n=>n.style.transform),positions);
  d.getElementById('find-toggle').click();const search=d.getElementById('search');search.value='Model';search.dispatchEvent(new h.window.Event('input'));
  assert.ok(d.querySelectorAll('#search-results button').length);assert.ok([...d.querySelectorAll('#search-results button')].every(b=>['Model::Nested','Model::req','Model::Nested::Run'].includes(b.textContent)));
  d.getElementById('find-toggle').click();d.querySelector('[data-semantic-id="req"]').click();action(d,'Focus').click();await until(()=>sceneSettled(d)&&d.getElementById('exploration-label').textContent.includes('req'));
  assert.deepEqual(activeIDs(d),['req']);assert.equal(d.querySelector('[data-semantic-id="part"]'),null);
  d.getElementById('context-details').click();assert.match(d.getElementById('information-text').textContent,/outside-scope/);d.getElementById('information').close();
  d.getElementById('view-navigation').value='authored:Views::requirements';d.getElementById('view-navigation').dispatchEvent(new h.window.Event('change'));
  await until(()=>d.getElementById('status').textContent.includes('outside Nested'));
  assert.deepEqual(activeIDs(d),['req']);assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');
  d.getElementById('workspace-overview').click();await until(()=>sceneSettled(d)&&activeIDs(d).includes('run'));
  d.querySelector('[data-semantic-id="run"]').click();action(d,'Focus').click();await until(()=>sceneSettled(d)&&d.getElementById('exploration-label').textContent.includes('Run'));
  const chooser=d.getElementById('view-navigation');chooser.value='native:action';chooser.dispatchEvent(new h.window.Event('change'));await until(h.pending);h.release();
  await until(()=>sceneSettled(d)&&chooser.value==='native:action'&&d.querySelector('[data-semantic-id="run"] .name')?.textContent==='Native run activity');assert.equal(h.nativeRequests.at(-1),'#action:Model::Nested::Run');assert.deepEqual(activeIDs(d),['run']);
  assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&chooser.value==='context').catch(error=>{throw Error(error.message+': '+chooser.value+' / '+d.getElementById('exploration-label').textContent+' / '+d.getElementById('status').textContent);});assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');assert.deepEqual(activeIDs(d),['run']);
  d.getElementById('return').click();await until(()=>sceneSettled(d)&&!d.getElementById('narrative').hidden);assert.equal(d.getElementById('workspace-controls').hidden,true);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&d.getElementById('narrative').hidden);assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');
 }finally{h.window.close();}
});

test('package Up, Whole project, empty contents and history preserve native scope and view',async()=>{
 const h=await harness({noStory:true,structuralFixture:true}),d=h.document;
 try{
  await pickPackage(h,'Model::Nested');assert.deepEqual(activeIDs(d),['nested']);
  assert.equal(d.getElementById('return').hidden,true);
  d.getElementById('zoom-in').click();const camera=d.getElementById('graph-world').style.transform;
  d.getElementById('scope-up').click();await until(()=>sceneSettled(d)&&d.getElementById('scope-label').textContent==='Model');
  d.getElementById('scope-clear').click();await until(()=>sceneSettled(d)&&d.getElementById('scope-label').textContent==='Whole project');
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&d.getElementById('scope-label').textContent==='Model');
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&d.getElementById('scope-label').textContent==='Model::Nested');assert.deepEqual(activeIDs(d),['nested']);assert.equal(d.getElementById('graph-world').style.transform,camera);
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&d.getElementById('scope-label').textContent==='Model');
 }finally{h.window.close();}
});

test('a delayed native request cannot replace a newly selected package scope',async()=>{
 const h=await harness({noStory:true,structuralFixture:true,packageFixture:true}),d=h.document;
 try{
  await pickPackage(h,'Model::Nested');d.querySelector('[data-semantic-id="run"]').click();action(d,'Activity view').click();await until(h.pending);
  d.getElementById('scope-clear').click();await until(()=>sceneSettled(d)&&d.getElementById('scope-label').textContent==='Whole project');const before=activeIDs(d);
  h.release();await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(d.getElementById('scope-label').textContent,'Whole project');assert.deepEqual(activeIDs(d),before);
  assert.ok(![...d.querySelectorAll('.node .name')].some(n=>n.textContent==='Native run activity'));
 }finally{h.window.close();}
});

test('an empty native rendering reports its limit without replacing the package viewpoint',async()=>{
 const h=await harness({noStory:true,structuralFixture:true,packageFixture:true,emptyNative:true}),d=h.document;
 try{
  await pickPackage(h,'Model::Nested');const before=activeIDs(d);d.querySelector('[data-semantic-id="run"]').click();action(d,'Activity view').click();await until(h.pending);h.release();
  await until(()=>d.getElementById('status').textContent.includes('No native action content'));
  assert.deepEqual(activeIDs(d),before);assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');assert.equal(d.getElementById('view-navigation').value,'overview');
 }finally{h.window.close();}
});

test('a declared matrix opens from standalone navigation and a scoped comparison is rejected intact',async()=>{
 const h=await harness({noStory:true,structuralFixture:true,packageFixture:true,secondView:gridFixture}),d=h.document;
 try{
  const choose=d.getElementById('view-navigation');choose.value='authored:Views::other';choose.dispatchEvent(new h.window.Event('change'));
  await until(()=>sceneSettled(d)&&d.querySelector('.canvas-grid-view'));assert.equal(d.getElementById('return').hidden,true);
  await pickPackage(h,'Model::Nested');assert.equal(d.querySelector('.canvas-grid-view'),null);const before=activeIDs(d);
  d.getElementById('view-catalog').click();d.getElementById('views').value='Views::other';d.getElementById('compare-view').click();
  await until(()=>d.getElementById('status').textContent.includes('outside Nested'));
  assert.deepEqual(activeIDs(d),before);assert.equal(d.querySelector('.canvas-grid-view'),null);assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');
 }finally{h.window.close();}
});

test('story links select without moving, disclose hidden context and permit explicit exploration',async()=>{
 const h=await harness({storyContent:true}),d=h.document;
 const positions=[...d.querySelectorAll('#nodes .node')].map(n=>n.style.transform);
 d.querySelector('#narrative [data-model-id="req"]').click();assert.equal(d.getElementById('narrative').hidden,false);assert.deepEqual([...d.querySelectorAll('#nodes .node')].map(n=>n.style.transform),positions);
 d.querySelector('#narrative [data-model-id="orphan"]').click();assert.match(d.getElementById('selection').textContent,/outside the displayed views/);
 [...d.querySelectorAll('#selection button')].find(b=>b.textContent==='Focus').click();await until(()=>d.getElementById('narrative').hidden);d.getElementById('return').click();await until(()=>!d.getElementById('narrative').hidden);assert.ok(d.querySelector('#narrative .context-card'));h.window.close();
});
test('figures remain readable on a narrow region tab and enlarge without losing the scene',async()=>{
 const h=await harness({storyContent:true,size:{width:390,height:844}}),d=h.document;
 [...d.querySelectorAll('#region-tabs button')].find(b=>b.textContent==='Course map').click();await until(()=>d.querySelector('.figure-region img'));
 assert.equal(d.querySelector('.figure-region img').alt,'Course map');assert.equal(d.getElementById('graph-viewport').hidden,true);
 [...d.querySelectorAll('.figure-region button')].find(b=>b.textContent==='Enlarge figure').click();assert.equal(d.getElementById('figure-dialog').open,true);d.getElementById('figure-dialog').close();
 d.querySelector('#region-tabs button').click();await until(()=>!d.getElementById('graph-viewport').hidden);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');h.window.close();
});
test('contents and direct scene URLs restore the authored story and preserve browser history',async()=>{
 const h=await harness({secondScene:true}),d=h.document;d.getElementById('contents').click();const links=d.querySelectorAll('#contents-list a');assert.equal(links.length,2);assert.match(links[1].href,/#scene=two/);links[1].click();await until(()=>d.querySelector('#narrative h2').textContent==='Other scene'&&h.window.location.hash.includes('scene=two'));assert.match(h.window.location.hash,/scene=two/);
 d.getElementById('share-scene').click();assert.match(d.getElementById('share-url').value,/demo=blue-dog#scene=two&model=fixture/);d.getElementById('share-dialog').close();h.window.history.back();await until(()=>d.querySelector('#narrative h2').textContent==='Control the part');h.window.close();
});
test('story content edits validate atomically and retain chapter, figures and evidence fields',async()=>{
 const h=await harness({storyContent:true}),d=h.document;d.getElementById('edit').click();assert.equal(d.getElementById('chapter-id').value,'challenge');assert.match(d.getElementById('scene-figures').value,/course.svg/);
 d.getElementById('scene-prose').value='[Broken](model:Missing::target)';d.getElementById('save-scene').click();await until(()=>d.getElementById('editor-error').textContent.includes('Missing::target'));assert.match(d.getElementById('narrative').textContent,/the requirement/);
 d.getElementById('scene-prose').value='[The candidate](model:Model::part)';d.getElementById('save-scene').click();await until(()=>!d.getElementById('editor').open);assert.ok(d.querySelector('#narrative [data-model-id="part"]'));d.getElementById('share-scene').click();assert.match(d.getElementById('share-note').textContent,/no published URL/);assert.equal(d.getElementById('share-url').hidden,true);h.window.close();
});
test('a resized pending scene retains its publication URL even when layout revisions change',async()=>{
 const h=await harness({secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);assert.match(h.window.location.hash,/scene=two/);h.resize(390,844);h.releaseLayout();await until(()=>d.getElementById('stage').getAttribute('aria-busy')==='false');assert.match(h.window.location.hash,/scene=two/);h.window.close();
});
test('choosing a demo explicitly recovers from a stale incoming link',async()=>{
 const h=await harness({landingOnly:true,url:'http://localhost/?demo=blue-dog#scene=one&model=old'}),d=h.document;
 await until(()=>d.getElementById('landing-error').textContent.includes('different story'));d.querySelector('[data-demo="blue-dog"]').click();await until(()=>!d.getElementById('landing').hidden===false);assert.match(h.window.location.hash,/model=fixture/);h.window.close();
});
test('a delayed native view cannot overwrite a newer scene navigation',async()=>{
 const h=await harness(),d=h.document;
 d.querySelector('[data-semantic-id="part"]').click();[...d.querySelectorAll('#selection button')].find(e=>e.textContent==='Internal view').click();
 await until(h.pending);d.getElementById('scenes').dispatchEvent(new h.window.Event('change'));h.release();
 await until(()=>d.querySelectorAll('.node').length===2);await new Promise(r=>setTimeout(r,15));
 assert.equal(d.querySelectorAll('.node').length,2);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.equal(d.getElementById('return').hidden,true);h.window.close();
});
test('native view validation failure retains the previous project and visible scene',async()=>{
 const h=await harness(),d=h.document;d.getElementById('edit').click();d.getElementById('view-source').value='BROKEN';d.getElementById('apply-views').click();
 await until(()=>d.getElementById('editor-error').textContent.includes('Native parse rejected'));
 assert.equal(d.querySelectorAll('.node').length,2);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.equal(d.getElementById('fit').disabled,false);
 d.getElementById('fit').click();assert.equal(d.querySelectorAll('.node').length,2);h.window.close();
});

test('return restores the authored scene after a deliberate disconnected exploration',async()=>{
 const h=await harness(),d=h.document;d.getElementById('find-toggle').click();const search=d.getElementById('search');search.value='orphan';search.dispatchEvent(new h.window.Event('input'));d.querySelector('#search-results button').click();
 await until(()=>d.getElementById('narrative').hidden&&d.querySelectorAll('.node').length===1);
 assert.match(d.getElementById('transition').textContent,/explicit view jump/);d.getElementById('return').click();
 await until(()=>!d.getElementById('narrative').hidden&&d.querySelectorAll('.node').length===2&&d.getElementById('return').hidden);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');h.window.close();
});

test('cancelled explicit-jump animation cannot commit over a newer restored scene',async()=>{
 const h=await harness({reducedMotion:false}),d=h.document;d.getElementById('find-toggle').click();const search=d.getElementById('search');search.value='orphan';search.dispatchEvent(new h.window.Event('input'));d.querySelector('#search-results button').click();
 await until(()=>d.getElementById('transition').textContent.includes('explicit view jump'));
 d.getElementById('reduce').click();d.getElementById('return').click();await until(()=>d.querySelectorAll('.node').length===2&&!d.getElementById('narrative').hidden);await new Promise(r=>setTimeout(r,15));d.getElementById('fit').click();
 assert.equal(d.querySelectorAll('.node').length,2);assert.equal(d.getElementById('return').hidden,true);h.window.close();
});

test('exploring a scene keeps its native diagram and gives the canvas the prose space',async()=>{
 const h=await harness(),d=h.document;const identities=[...d.querySelectorAll('.node')].map(e=>e.dataset.semanticId);d.getElementById('standalone').click();await until(()=>d.getElementById('narrative').hidden);
 assert.deepEqual([...d.querySelectorAll('.node')].map(e=>e.dataset.semanticId),identities);await until(()=>d.getElementById('status').textContent.includes('Explore this native view'));h.window.close();
});

test('Fit during a journey completes the current destination instead of restoring the previous diagram',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 d.getElementById('fit').click();await until(()=>d.getElementById('stage').dataset.motionProgress===undefined&&d.querySelectorAll('.node[data-context="false"]').length===1);
 assert.equal(d.querySelector('.node[data-context="false"]').dataset.semanticId,'orphan');assert.equal(d.querySelector('#narrative h2').textContent,'Other scene');assert.equal(d.getElementById('scenes').value,'1');h.window.close();
});
test('viewport changes during a journey rebuild and settle the intended destination',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 h.resize(390,650);await new Promise(resolve=>setTimeout(resolve,120));d.getElementById('reduce').click();
 await until(()=>d.getElementById('stage').dataset.motionProgress===undefined&&d.getElementById('scenes').value==='1');
 assert.equal(d.querySelector('.node[data-context="false"]').dataset.semanticId,'orphan');assert.equal(d.getElementById('connections').getAttribute('viewBox'),'0 0 390 650');h.window.close();
});
test('space-limited context retains a real offscreen tile and complete native link',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:180,height:240}}),d=h.document;
 assert.equal(d.querySelector('.context-boundary'),null);const neighbor=d.querySelector('.node[data-context="true"]');assert.equal(neighbor.dataset.semanticId,'orphan');assert.equal(neighbor.getAttribute('aria-hidden'),'false');
 const edge=d.querySelector('#connections g[data-context="true"]');assert.equal(edge.dataset.source,'req');assert.equal(edge.dataset.target,'orphan');assert.ok(Number(edge.style.opacity)>0&&Number(edge.style.opacity)<1);const coordinates=[...edge.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d').matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));assert.ok(coordinates.length>=2,'context path must remain visible');for(let i=1;i<coordinates.length;i++)assert.ok(coordinates[i].x===coordinates[i-1].x||coordinates[i].y===coordinates[i-1].y,'settled context routes retain exact orthogonal bends');h.window.close();
});

test('connection selection traces the full relationship without moving tiles',async()=>{
 const h=await harness(),d=h.document,before=[...d.querySelectorAll('.node')].map(n=>n.style.transform),edge=d.querySelector('#connections g[data-relationship]');
 assert.equal(edge.getAttribute('tabindex'),'0');edge.dispatchEvent(new h.window.MouseEvent('click',{bubbles:true}));assert.ok(edge.classList.contains('traced'));assert.equal(d.querySelectorAll('.trace-endpoint').length,2);assert.deepEqual([...d.querySelectorAll('.node')].map(n=>n.style.transform),before);assert.ok(edge.querySelector('.edge-hit'));assert.equal(edge.querySelector('.edge-line').getAttribute('marker-end'),'url(#edge-open-arrow)');h.window.close();
});
test('an older asynchronous layout cannot replace a newer scene',async()=>{
 const h=await harness({secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);d.getElementById('scenes').value='0';d.getElementById('scenes').dispatchEvent(new h.window.Event('change'));await until(()=>d.querySelector('#narrative h2').textContent==='Control the part'&&d.querySelectorAll('.node[data-context="false"]').length===2);h.releaseLayout();await new Promise(r=>setTimeout(r,30));assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.equal(d.querySelectorAll('.node[data-context="false"]').length,2);for(const n of d.querySelectorAll('.node'))assert.ok(!n.style.transform.includes('NaN'));h.window.close();
});

test('a rejected obsolete layout cannot restore stale prose over the newer model',async()=>{
 const h=await harness({secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);d.getElementById('scenes').value='1';d.getElementById('scenes').dispatchEvent(new h.window.Event('change'));await until(()=>d.querySelectorAll('.node[data-context="false"]').length===1);h.releaseLayout('obsolete layout failed');await new Promise(r=>setTimeout(r,30));assert.equal(d.querySelector('#narrative h2').textContent,'Other scene');assert.equal(d.getElementById('scenes').value,'1');assert.equal(d.querySelector('.node[data-context="false"]').dataset.semanticId,'orphan');assert.ok(!d.getElementById('status').textContent.includes('obsolete'));assert.equal(d.querySelectorAll('.narrative-outgoing').length,0);h.window.close();
});

test('focused relationship touch targets are above translucent context targets',async()=>{
 const h=await harness({contextNeighbor:true}),groups=[...h.document.querySelectorAll('#connections g[data-relationship]')];assert.ok(groups.some(g=>g.dataset.context==='true'));assert.equal(groups.at(-1).dataset.context,'false');assert.equal(groups.at(-1).querySelector('.edge-hit').getAttribute('stroke-width'),'18');assert.equal(groups.find(g=>g.dataset.context==='true').querySelector('.edge-hit').getAttribute('stroke-width'),'8');h.window.close();
});

const activeIDs=d=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>n.dataset.semanticId).sort();
const action=(d,text)=>[...d.querySelectorAll('#selection button')].find(b=>b.textContent===text);
test('directional requirement actions stay on the canvas and history restores the authored scene',async()=>{
 const h=await harness({traceFixture:true}),d=h.document,before=[...d.querySelectorAll('.node')].map(n=>n.style.transform);d.querySelector('[data-semantic-id="req"]').click();assert.deepEqual([...d.querySelectorAll('.node')].map(n=>n.style.transform),before);assert.ok(action(d,'Origins (1)'));assert.ok(action(d,'Derived requirements (8)'));assert.ok(action(d,'Design impact (1)'));assert.ok(action(d,'Verification (1)'));action(d,'Origins (1)').click();await until(()=>d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='origin,req');assert.ok(d.getElementById('exploration-label').textContent.includes('Origins'));d.getElementById('explore-back').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');assert.equal(d.getElementById('explore-forward').disabled,false);d.getElementById('explore-forward').click();await until(()=>d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='origin,req');d.getElementById('return').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');h.window.close();
});
test('verification tracing retains native direction without inferring a passed test',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Verification (1)').click();await until(()=>activeIDs(d).join(',')==='case,req');const edge=d.querySelector('#connections g[data-context="false"]');assert.equal(edge.dataset.source,'case');assert.equal(edge.dataset.target,'req');assert.ok(d.getElementById('status').textContent.includes('not executed results'));h.window.close();
});
test('large derived sets page through bounded diagrams and history restores the prior page',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Derived requirements (8)').click();await until(()=>d.getElementById('trace-next').hidden===false&&activeIDs(d).length===7);const first=activeIDs(d);d.getElementById('trace-next').click();await until(()=>activeIDs(d).length===3);assert.ok(d.getElementById('exploration-label').textContent.includes('2 of 8'));d.getElementById('explore-back').click();await until(()=>activeIDs(d).join(',')===first.join(','));assert.equal(d.getElementById('trace-next').disabled,false);h.window.close();
});
test('editor display preferences validate references before changing or exporting the scene',async()=>{
 const h=await harness(),d=h.document;d.getElementById('edit').click();d.getElementById('presentation-expanded').value='Model::missing';d.getElementById('save-scene').click();await until(()=>d.getElementById('editor-error').textContent.includes('missing'));assert.equal(d.getElementById('editor').open,true);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');d.getElementById('presentation-expanded').value='Model::req';d.getElementById('presentation-context').value='0';d.getElementById('presentation-compartments').value='compact';d.getElementById('save-scene').click();await until(()=>!d.getElementById('editor').open);await new Promise(r=>setTimeout(r,20));assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);d.getElementById('edit').click();assert.equal(d.getElementById('presentation-expanded').value,'Model::req');assert.equal(d.getElementById('presentation-context').value,'0');assert.equal(d.getElementById('presentation-compartments').value,'compact');h.window.close();
});

test('reader collapse overrides the global All default and survives history restoration',async()=>{
 const h=await harness({traceFixture:true,compartmentFixture:true,presentation:{compartments:'expanded'}}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();assert.ok(d.querySelector('[data-semantic-id="req"] .detail'));action(d,'Collapse compartment').click();await until(()=>!d.querySelector('[data-semantic-id="req"] .detail'));action(d,'Origins (1)').click();await until(()=>activeIDs(d).join(',')==='origin,req');d.getElementById('explore-back').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');assert.equal(d.querySelector('[data-semantic-id="req"] .detail'),null);h.window.close();
});

test('a failed Return restores exploration history without inserting a duplicate entry',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Origins (1)').click();await until(()=>activeIDs(d).join(',')==='origin,req');h.holdLayout();d.getElementById('return').click();await until(h.layoutPending);h.releaseLayout('Return layout failed');await until(()=>d.getElementById('status').textContent.includes('Return layout failed'));assert.equal(d.getElementById('narrative').hidden,true);d.getElementById('explore-back').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');h.window.close();
});

test('explicit trace intent emphasizes its connections independently of the authored scene emphasis',async()=>{
 const h=await harness({traceFixture:true,presentation:{emphasis:['derive']}}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Design impact (1)').click();await until(()=>d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req'&&d.getElementById('status').textContent.includes('matching engineering neighbors'));const edge=d.querySelector('#connections g[data-context="false"]');assert.equal(edge.style.opacity,'1');assert.equal(d.querySelector('header nav').hidden,true);d.getElementById('return').click();await until(()=>!d.getElementById('narrative').hidden&&d.querySelector('#connections g[data-context="false"]').style.opacity==='0.28');assert.equal(d.querySelector('header nav').hidden,false);assert.equal(d.querySelector('#connections g[data-context="false"]').style.opacity,'0.28');h.window.close();
});

test('ambiguous native references are rejected before author preference edits are applied',async()=>{
 const h=await harness({ambiguousRefs:true}),d=h.document;d.getElementById('edit').click();d.getElementById('presentation-expanded').value='Model::ambiguous';d.getElementById('save-scene').click();await until(()=>d.getElementById('editor-error').textContent.includes('Ambiguous'));assert.equal(d.getElementById('editor').open,true);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');h.window.close();
});

test('history restores the matching context disclosure instead of leaving a later verification message',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Origins (1)').click();await until(()=>activeIDs(d).join(',')==='origin,req');d.querySelector('[data-semantic-id="req"]').click();action(d,'Verification (1)').click();await until(()=>activeIDs(d).join(',')==='case,req');assert.ok(d.getElementById('status').textContent.includes('not executed'));d.getElementById('explore-back').click();await until(()=>activeIDs(d).join(',')==='origin,req'&&d.getElementById('exploration-label').textContent.includes('Origins'));assert.ok(!d.getElementById('status').textContent.includes('not executed'));assert.ok(d.getElementById('status').textContent.includes('1 of 1'));h.window.close();
});

test('viewport changes during verification preserve the matching verification disclosure',async()=>{
 const h=await harness({traceFixture:true,reducedMotion:false}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Verification (1)').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);h.resize(390,650);await new Promise(r=>setTimeout(r,130));d.getElementById('reduce').click();await until(()=>d.getElementById('stage').dataset.motionProgress===undefined&&activeIDs(d).join(',')==='case,req'&&d.getElementById('status').textContent.includes('not executed'));h.window.close();
});

test('a tiny viewport clips the neighborhood without removing its actual endpoint',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:120,height:140}}),d=h.document;assert.equal(d.querySelector('.context-boundary'),null);assert.ok(d.querySelector('#connections g[data-context="true"]'));assert.equal(d.querySelector('.node[data-context="true"]').dataset.semanticId,'orphan');const before=d.querySelector('.node[data-context="true"]').style.transform;d.getElementById('show-neighborhood').click();assert.notEqual(d.getElementById('graph-world').style.transform,'translate(0px,0px) scale(1)');assert.equal(d.querySelector('.node[data-context="true"]').style.transform,before);h.window.close();
});


test('faded transition connections cannot retain invisible pointer or keyboard targets',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;d.getElementById('next').click();
 await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 let hidden=0;
 for(let i=0;i<180;i++){
  for(const edge of d.querySelectorAll('#connections g[data-relationship]'))if(Number(edge.style.opacity)<.05){
   hidden++;assert.equal(edge.style.pointerEvents,'none');assert.equal(edge.getAttribute('aria-hidden'),'true');assert.equal(edge.getAttribute('tabindex'),'-1');
  }
  if(d.getElementById('stage').dataset.motionProgress===undefined)break;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 assert.ok(hidden>0,'exercise an actually faded connection during the journey');h.window.close();
});


test('disjoint same-notation navigation visibly ascends native ownership and descends before settling',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,ancestorFixture:true,presentation:{emphasis:['derive']}}),d=h.document;
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 await until(()=>[...d.querySelectorAll('[data-semantic-id="Model"]')].some(n=>Number(n.style.opacity)>.1));
 assert.match(d.getElementById('transition').textContent,/Model ownership route/);
 const edges=[...d.querySelectorAll('#connections g[data-relationship]')];assert.ok(edges.some(g=>g.dataset.source==='Model'&&g.dataset.target==='req'));assert.ok(edges.some(g=>g.dataset.source==='Model'&&g.dataset.target==='orphan'));
 await until(()=>[...d.querySelectorAll('#connections g[data-kind="containment"]')].some(g=>Number(g.style.opacity)>.8&&Number(g.querySelector('text')?.style.opacity)>.8));
 await until(()=>[...d.querySelectorAll('#connections g[data-kind="containment"]')].filter(g=>Number(g.style.opacity)>.6).length===2);
 const attachments=[...d.querySelectorAll('#connections g[data-kind="containment"]')].filter(g=>Number(g.style.opacity)>.6).map(g=>g.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d').match(/^M([\d.-]+),([\d.-]+)/).slice(1).map(Number));
 assert.notDeepEqual(attachments[0],attachments[1],'live ownership hops retain separate native-parent drawing attachments');
 d.getElementById('fit').click();await until(()=>activeIDs(d).join(',')==='orphan'&&d.getElementById('stage').dataset.motionProgress===undefined);assert.equal(d.getElementById('scenes').value,'1');h.window.close();
});


test('a saved same-notation ownership route outside the story boundary is rejected before replacing the project',async()=>{
 const h=await harness({secondScene:true,foreignOwnerFixture:true}),d=h.document,input=d.getElementById('markdown-file');
 const authored=h.story.replace('"focus":"Model::orphan"','"focus":"Model::orphan","journey":["Model::req","Foreign::root","Model::orphan"]');
 Object.defineProperty(input,'files',{value:[{text:async()=>authored}],configurable:true});input.dispatchEvent(new h.window.Event('change'));
 await until(()=>d.getElementById('editor-error').textContent.includes('saved journey no longer resolves within the presentation boundary'));
 assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.deepEqual(activeIDs(d),['part','req']);assert.equal(d.getElementById('fit').disabled,false);h.window.close();
});


test('fading old context paths cannot reintroduce crossings against current context or active routes',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,contextNeighbor:'shared'}),d=h.document;
 const points=path=>[...(path??'').matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);let sampled=0;
 for(let i=0;i<220;i++){
  const rows=[...d.querySelectorAll('#connections g[data-relationship]')].filter(g=>Number(g.style.opacity)>.01).map(g=>({context:g.dataset.context==='true',now:points(g.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d')),old:points(g.querySelector('.edge-outgoing').getAttribute('d')),oldOpacity:Number(g.querySelector('.edge-outgoing').style.opacity)}));
  if(rows.filter(r=>r.context).length>1)sampled++;
  for(const row of rows.filter(r=>r.context&&r.oldOpacity>.01&&r.old.length>1)){
   const score=path=>rows.filter(r=>r!==row).reduce((sum,other)=>{const c=routeConflicts(path,other.now);return sum+c.crossings*1e6+c.overlapLength*1e4;},0);
   assert.ok(score(row.old)<=score(row.now)+.01,'obsolete context path worsens the current crossing/overlap state');
  }
  if(d.getElementById('stage').dataset.motionProgress===undefined)break;await new Promise(resolve=>setTimeout(resolve,10));
 }
 assert.ok(sampled>0,'exercise multiple faint paths during motion');h.window.close();
});

test('part and package actions expose structural context on the canvas and history restores it',async()=>{
 const h=await harness({structuralFixture:true,size:{width:390,height:720}}),d=h.document;
 const active=()=>[...d.querySelectorAll('.node[data-context="false"]')];
 const clickAction=text=>{const control=[...d.querySelectorAll('#selection button')].find(b=>b.textContent===text);assert.ok(control,text);control.click();};
 d.querySelector('[data-semantic-id="part"]').click();clickAction('Focus');
 await until(()=>active().length===5&&d.getElementById('status').textContent.includes('matching structural'));
 assert.deepEqual(new Set(active().map(n=>n.dataset.semanticId)),new Set(['part','Model','definition','sensor','processor']));
 assert.equal(d.querySelectorAll('#connections g[data-kind="typing"][data-context="false"]').length,1);
 assert.equal(d.querySelectorAll('#connections g[data-kind="composition"][data-context="false"]').length,2);
 // Actual positions are CSS transforms, inspected below rather than DOM order.
 const rect=id=>d.querySelector('.node[data-context="false"][data-semantic-id="'+id+'"]').style.transform.match(/translate\(([\d.-]+)px,\s*([\d.-]+)px/).slice(1).map(Number);
 assert.ok(rect('definition')[1]<rect('sensor')[1]);assert.ok(rect('Model')[1]<rect('part')[1]);
 d.querySelector('.node[data-context="false"][data-semantic-id="part"]').click();clickAction('Parts / contents (2)');
 await until(()=>active().length===4&&d.getElementById('exploration-label').textContent.startsWith('Parts / contents'));
 assert.ok(!active().some(n=>n.dataset.semanticId==='Model'));
 d.querySelector('.node[data-context="false"][data-semantic-id="part"]').click();clickAction('Containing element (1)');
 await until(()=>active().length===2&&d.getElementById('exploration-label').textContent.startsWith('Containing element'));
 d.getElementById('explore-back').click();await until(()=>active().length===4&&d.getElementById('exploration-label').textContent.startsWith('Parts / contents'));
 d.getElementById('explore-back').click();await until(()=>active().length===5);
 d.querySelector('.node[data-context="false"][data-semantic-id="Model"]').click();clickAction('Parts / contents (3)');
 await until(()=>d.getElementById('exploration-label').textContent.startsWith('Parts / contents · Model')&&active().length===4&&active().some(n=>n.dataset.semanticId==='nested'));
 assert.deepEqual(new Set(active().map(n=>n.dataset.semanticId)),new Set(['Model','part','definition','nested']));
 const owned=[...d.querySelectorAll('#connections g[data-kind="containment"][data-context="false"]')];assert.equal(owned.length,3);assert.ok(owned.every(g=>g.dataset.source==='Model'));
 assert.ok(d.getElementById('status').textContent.includes('Package ownership is location context'));h.window.close();
});


test('camera zoom and pan reveal fixed world geometry, Fit restores active content and taps stay stationary',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:390,height:720}}),d=h.document,world=d.getElementById('graph-world'),surface=d.getElementById('graph-viewport');
 const geometry=()=>[...d.querySelectorAll('.node')].map(n=>[n.dataset.semanticId,n.style.transform,n.style.width,n.style.height]);
 const before=geometry();h.holdLayout();d.getElementById('show-neighborhood').click();const neighborhoodCamera=world.style.transform;assert.notEqual(neighborhoodCamera,'translate(0px,0px) scale(1)');assert.deepEqual(geometry(),before);assert.equal(h.layoutPending(),false);
 d.querySelector('.node[data-context="true"]').click();assert.equal(world.style.transform,neighborhoodCamera);assert.equal(d.getElementById('selection').hidden,false);
 surface.dispatchEvent(new h.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));assert.notEqual(world.style.transform,neighborhoodCamera);assert.deepEqual(geometry(),before);
 const panCamera=world.style.transform;surface.dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:100,clientX:190,clientY:200,bubbles:true,cancelable:true}));assert.notEqual(world.style.transform,panCamera);assert.deepEqual(geometry(),before);
 d.getElementById('fit').click();assert.equal(world.style.transform,'translate(0px,0px) scale(1)');assert.deepEqual(geometry(),before);assert.equal(h.layoutPending(),false);h.window.close();
});

test('offscreen neighbor Focus and Back restore the former camera and neighborhood without changing native identity',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:390,height:720}}),d=h.document,active=()=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>n.dataset.semanticId).sort();
 d.getElementById('show-neighborhood').click();const camera=d.getElementById('graph-world').style.transform;
 d.querySelector('.node[data-context="true"]').click();[...d.querySelectorAll('#selection button')].find(b=>b.textContent==='Focus').click();
 await until(()=>d.getElementById('exploration-label').textContent.includes('orphan')&&active().includes('orphan')&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.equal(d.getElementById('graph-world').style.transform,'translate(0px,0px) scale(1)');
 d.getElementById('explore-back').click();await until(()=>d.getElementById('return').hidden&&active().join(',')==='part,req'&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.equal(d.getElementById('graph-world').style.transform,camera);assert.equal(d.querySelector('.node[data-context="true"]').dataset.semanticId,'orphan');h.window.close();
});

test('explicit More neighbors expands only the prepared neighborhood and keeps the active layout and camera',async()=>{
 const h=await harness({contextNeighbor:true,presentation:{contextBudget:0}}),d=h.document;
 const active=()=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>[n.dataset.semanticId,n.style.transform]);
 const before=active(),camera=d.getElementById('graph-world').style.transform;assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);assert.equal(d.getElementById('more-neighbors').hidden,false);
 d.getElementById('more-neighbors').click();await until(()=>d.querySelectorAll('.node[data-context="true"]').length===1&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.deepEqual(active(),before);assert.equal(d.getElementById('graph-world').style.transform,camera);assert.equal(d.getElementById('more-neighbors').hidden,true);
 d.getElementById('explore-back').click();await until(()=>d.querySelectorAll('.node[data-context="true"]').length===0);h.window.close();
});


test('a camera gesture during pending layout is not overwritten by its eventual destination',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);
 d.getElementById('graph-viewport').dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:120,clientX:180,clientY:170,bubbles:true,cancelable:true}));
 const camera=d.getElementById('graph-world').style.transform;assert.notEqual(camera,'translate(0px,0px) scale(1)');h.releaseLayout();
 await until(()=>d.getElementById('scenes').value==='1'&&d.getElementById('stage').dataset.motionProgress===undefined&&activeIDs(d).join(',')==='orphan');
 assert.equal(d.getElementById('graph-world').style.transform,camera);h.window.close();
});

test('a native ancestor journey pulls the camera back and travels before settling on active fit',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,ancestorFixture:true}),d=h.document;
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 await until(()=>{const m=/scale\(([^)]+)\)/.exec(d.getElementById('graph-world').style.transform);return m&&Number(m[1])<.9;});
 const camera=d.getElementById('graph-world').style.transform;assert.notEqual(camera,'translate(0px,0px) scale(1)');
 await until(()=>d.querySelector('.node[data-semantic-id="Model"]')&&Number(d.querySelector('.node[data-semantic-id="Model"]').style.opacity)>.5);
 assert.match(d.getElementById('transition').textContent,/Model ownership route/);
 d.getElementById('fit').click();await until(()=>activeIDs(d).join(',')==='orphan'&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.equal(d.getElementById('graph-world').style.transform,'translate(0px,0px) scale(1)');h.window.close();
});


test('a gesture during intermediate journey preparation cancels automated camera travel',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,ancestorFixture:true}),d=h.document;h.holdLayoutAfter(2);d.getElementById('next').click();await until(h.layoutPending);
 d.getElementById('graph-viewport').dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:120,clientX:180,clientY:170,bubbles:true,cancelable:true}));const camera=d.getElementById('graph-world').style.transform;h.releaseLayout();
 await until(()=>d.getElementById('scenes').value==='1'&&d.getElementById('stage').dataset.motionProgress===undefined&&activeIDs(d).join(',')==='orphan');
 assert.equal(d.getElementById('graph-world').style.transform,camera);h.window.close();
});


test('neighbor disclosure counts prepared tiles rather than conflating offscreen tiles with omissions',async()=>{
 const h=await harness({contextNeighbor:true}),d=h.document;assert.equal(d.getElementById('context-details').textContent,'Neighbors (1)');
 d.getElementById('context-details').click();assert.equal(d.getElementById('information-title').textContent,'Prepared neighborhood');
 assert.match(d.getElementById('information-text').textContent,/1 of 1 eligible one-hop neighbors prepared/);assert.match(d.getElementById('information-text').textContent,/real tile/);h.window.close();
});


test('landing does not start a model engine or load a project until the user chooses',async()=>{
 const h=await harness({landingOnly:true}),d=h.document;
 assert.equal(d.getElementById('landing').hidden,false);assert.equal(d.getElementById('stage').hidden,true);
 assert.equal(d.querySelectorAll('#nodes .node').length,0);assert.equal(h.workerCount(),0);
 assert.equal(d.getElementById('landing').getAttribute('aria-busy'),'false');
 d.querySelector('[data-demo="flashlight"]').click();
 await until(()=>d.querySelectorAll('#nodes .node').length===2&&!d.getElementById('stage').hidden);
 d.getElementById('home').click();assert.equal(d.getElementById('landing').hidden,false);assert.equal(d.getElementById('stage').hidden,true);
 d.getElementById('resume-model').click();assert.equal(d.getElementById('landing').hidden,true);h.window.close();
});

test('a plain SysML selection opens exploration without a manifest or authored story',async()=>{
 const h=await harness({landingOnly:true}),d=h.document,input=d.getElementById('sysml-files'),bytes=new TextEncoder().encode('package Model {}');
 Object.defineProperty(input,'files',{configurable:true,value:[{name:'model.sysml',size:bytes.length,arrayBuffer:async()=>bytes.buffer}]});
 input.dispatchEvent(new h.window.Event('change'));
 await until(()=>!d.getElementById('stage').hidden&&d.getElementById('status').textContent.startsWith('OpenSysML WASM'));
 assert.equal(d.getElementById('return').hidden,true);assert.equal(d.getElementById('narrative').hidden,true);assert.equal(d.querySelector('#nodes .node[data-semantic-id="Model"]')!==null,true);
 assert.equal(d.getElementById('editor-error').textContent,'');h.window.close();
});

test('a storyless project opens a bounded system overview with metrics and no automatic peripheral neighborhood',async()=>{
 const h=await harness({noStory:true,structuralFixture:true,overviewFixture:true}),d=h.document;
 assert.match(d.getElementById('exploration-label').textContent,/^System overview/);
 assert.equal(d.getElementById('narrative').hidden,true);assert.equal(d.getElementById('return').hidden,true);
 const ids=activeIDs(d);assert.ok(ids.length>1&&ids.length<=9);assert.ok(ids.includes('definition'));
 assert.ok(!ids.includes('outside'),'a linked declaration outside native roots is not an overview candidate');
 assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0,'overview budget does not gain the default 48 neighbors');
 const metric=d.querySelector('.node[data-semantic-id="definition"] .prominence');
 assert.ok(metric,'the overview explains each selected component');assert.match(metric.textContent,/2 children.*\d+ neighbors/);
 assert.ok(d.getElementById('more-neighbors').hidden||d.getElementById('more-neighbors').disabled);
 assert.equal(d.getElementById('context-details').hidden,false);d.getElementById('context-details').click();
 assert.equal(d.getElementById('information-title').textContent,'Overview selection');
 assert.match(d.getElementById('information-text').textContent,/children|neighbors|rank|importance|prominen/i);
 assert.ok(d.getElementById('information-text').textContent.length>60,'ranking and scoped-selection details remain available');
 h.window.close();
});

test('authored scenes and explicit standalone entry overrides take precedence over automatic overview',async()=>{
 for(const options of [
  {noStory:false,entryView:'Views::requirements',entryFocus:'Model::orphan'},
  {noStory:true,entryView:'Views::requirements'},
  {noStory:true,entryFocus:'Model::part'},
  {noStory:true,entryView:'Views::requirements',entryFocus:'Model::part'}
 ]){
  const h=await harness({...options,structuralFixture:true,overviewFixture:true}),d=h.document;
  assert.doesNotMatch(d.getElementById('exploration-label').textContent,/^System overview/,JSON.stringify(options));
  assert.equal(d.querySelectorAll('.prominence').length,0,'overview metadata must not bleed into authored or focused views');
  if(options.entryView||!options.noStory)assert.deepEqual(activeIDs(d).sort(),['part','req']);
  else assert.ok(activeIDs(d).includes('part'));
  assert.equal(d.getElementById('narrative').hidden,options.noStory);
  h.window.close();
 }
});

test('overview ports show metrics as readable cards while retaining native port identity',async()=>{
 const h=await harness({noStory:true,structuralFixture:true,overviewPort:true}),d=h.document;
 try{
  const port=d.querySelector('.node[data-context="false"][data-semantic-id="control-port"]');
  assert.ok(port);assert.ok(port.classList.contains('port'));assert.ok(port.classList.contains('overview-card'));
  assert.match(port.querySelector('.prominence').textContent,/0 children.*0 neighbors/);
  assert.match(port.getAttribute('aria-label'),/controlPort: select port/);
  assert.ok(parseFloat(port.style.width)>=160);assert.ok(parseFloat(port.style.height)>=76);
  port.click();assert.equal(port.classList.contains('selected'),true);
  assert.match(d.getElementById('selection').textContent,/0 direct children.*0 distinct connected elements/);
 }finally{h.window.close();}
});

test('a resize restarting pending overview layout commits its overview heading and ignores the older layout',async()=>{
 const h=await harness({structuralFixture:true,reducedMotion:false}),d=h.document;
 try{
  h.holdLayout();d.getElementById('system-overview').click();await until(h.layoutPending);
  h.resize(1000,650);
  await until(()=>d.querySelectorAll('.prominence').length>0&&sceneSettled(d));
  assert.match(d.getElementById('exploration-label').textContent,/^System overview/);
  assert.equal(d.getElementById('narrative').hidden,true);
  const ids=activeIDs(d);h.releaseLayout();await new Promise(resolve=>setTimeout(resolve,40));
  assert.match(d.getElementById('exploration-label').textContent,/^System overview/);
  assert.deepEqual(activeIDs(d),ids);assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);
 }finally{h.releaseLayout();h.window.close();}
});

test('overview selection stays stationary and explicit contents exploration restores metrics, camera and zero neighbors through Back',async()=>{
 const h=await harness({noStory:true,structuralFixture:true,overviewFixture:true}),d=h.document;
 const geometry=()=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>[n.dataset.semanticId,n.style.transform]);
 const original=geometry(),metrics=[...d.querySelectorAll('.prominence')].map(n=>n.textContent);
 d.getElementById('graph-viewport').dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:120,clientX:180,clientY:170,bubbles:true,cancelable:true}));
 const camera=d.getElementById('graph-world').style.transform;
 d.querySelector('.node[data-context="false"][data-semantic-id="definition"]').click();
 assert.deepEqual(geometry(),original);assert.deepEqual([...d.querySelectorAll('.prominence')].map(n=>n.textContent),metrics);
 assert.equal(d.getElementById('graph-world').style.transform,camera);
 const expand=[...d.querySelectorAll('#selection button')].find(b=>b.textContent==='Expand contents');assert.ok(expand);expand.click();
 await until(()=>d.getElementById('exploration-label').textContent.startsWith('Parts / contents')&&activeIDs(d).includes('sensor'));
 assert.ok(activeIDs(d).includes('processor'));assert.ok(activeIDs(d).length<=7);
 assert.equal(d.querySelectorAll('.prominence').length,0,'ordinary contents context does not retain overview badges');
 d.getElementById('explore-back').click();
 await until(()=>d.getElementById('exploration-label').textContent.startsWith('System overview')&&d.querySelectorAll('.prominence').length===metrics.length);
 assert.deepEqual(geometry(),original);assert.deepEqual([...d.querySelectorAll('.prominence')].map(n=>n.textContent),metrics);
 assert.equal(d.getElementById('graph-world').style.transform,camera);
 assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);
 d.getElementById('context-details').click();assert.equal(d.getElementById('information-title').textContent,'Overview selection');d.getElementById('information').close();
 d.getElementById('explore-forward').click();await until(()=>d.getElementById('exploration-label').textContent.startsWith('Parts / contents'));
 assert.equal(d.querySelectorAll('.prominence').length,0);h.window.close();
});

test('explicit overview from a guided scene is reversible and Home Resume preserves the bounded overview',async()=>{
 const h=await harness({structuralFixture:true,overviewFixture:true}),d=h.document;
 d.getElementById('system-overview').click();
 await until(()=>d.getElementById('exploration-label').textContent.startsWith('System overview')&&d.querySelectorAll('.prominence').length>0);
 const ids=activeIDs(d),metrics=[...d.querySelectorAll('.prominence')].map(n=>n.textContent);
 d.getElementById('home').click();d.getElementById('resume-model').click();
 await until(()=>!d.getElementById('stage').hidden&&d.querySelectorAll('.prominence').length===metrics.length);
 assert.deepEqual(activeIDs(d),ids);assert.deepEqual([...d.querySelectorAll('.prominence')].map(n=>n.textContent),metrics);
 assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);
 d.getElementById('explore-back').click();
 await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).sort().join(',')==='part,req');
 assert.equal(d.querySelectorAll('.prominence').length,0);h.window.close();
});


test('resuming the current model cancels an older demo fetch before native intake',async()=>{
 const h=await harness(),d=h.document,fetch=h.window.fetch;let release;
 h.window.fetch=async url=>String(url).includes('small.zip')?await new Promise(resolve=>{release=()=>resolve({ok:true,arrayBuffer:async()=>packProject({manifest:{...manifest,title:'Delayed replacement'},files}).buffer});}):fetch(url);
 d.getElementById('home').click();d.querySelector('[data-demo="flashlight"]').click();await until(()=>!!release);d.getElementById('resume-model').click();release();
 await new Promise(r=>setTimeout(r,40));assert.equal(d.title,'Fixture · Syspresent');assert.equal(d.getElementById('landing').hidden,true);h.window.close();
});

test('resuming the current model cancels an older file read before native intake',async()=>{
 const h=await harness(),d=h.document,input=d.getElementById('sysml-files');let release;
 Object.defineProperty(input,'files',{configurable:true,value:[{name:'replacement.sysml',size:20,arrayBuffer:()=>new Promise(resolve=>{release=()=>resolve(new TextEncoder().encode('package Model {}').buffer);})}]});
 d.getElementById('home').click();input.dispatchEvent(new h.window.Event('change'));await until(()=>!!release);d.getElementById('resume-model').click();release();
 await new Promise(r=>setTimeout(r,40));assert.equal(d.title,'Fixture · Syspresent');assert.equal(d.getElementById('landing').hidden,true);h.window.close();
});


test('Home ignores the hidden canvas resize instead of reporting a zero-size layout error',async()=>{
 const h=await harness(),d=h.document;d.getElementById('home').click();h.resize(0,0);await new Promise(r=>setTimeout(r,140));assert.equal(d.getElementById('landing-error').hidden,true);assert.equal(d.getElementById('landing-error').textContent,'');h.window.close();
});

const gridFixture={
 kind:'matrix',nodes:[],edges:[],columns:['Source / Target','Required behavior','Other behavior'],
 rows:[{semanticId:'part',identityStatus:'mapped',cells:['Zulu part','satisfy','']},{semanticId:'orphan',identityStatus:'mapped',cells:['Alpha part','','']}],
 columnElements:[{index:1,name:'Required behavior',semanticId:'req',identityStatus:'mapped'}],
 relationshipCells:[{row:0,column:1,relationships:[
  {semanticId:'satisfy-first',sourceSemanticId:'part',targetSemanticId:'req',kind:'satisfy',label:'First native link'},
  {semanticId:'satisfy-second',sourceSemanticId:'part',targetSemanticId:'req',kind:'satisfy',label:'Second native link'},
 ]}],
};
const tableFixture={kind:'table',nodes:[],edges:[],columns:['Name','Value'],rows:[
 {semanticId:'part',identityStatus:'mapped',cells:['Zulu part','2']},
 {semanticId:'orphan',identityStatus:'mapped',cells:['Alpha part','1']},
]};
const sequenceFixture={kind:'sequence',nodes:[
 {id:'part-line',semanticId:'part',identityStatus:'mapped',name:'Zulu participant',kind:'part'},
 {id:'req-line',semanticId:'req',identityStatus:'mapped',name:'Alpha participant',kind:'part'},
],edges:[
 {id:'message-one',semanticId:'message-one',from:'part-line',to:'req-line',kind:'flow',label:'First native message'},
 {id:'message-two',semanticId:'message-two',from:'req-line',to:'part-line',kind:'flow',label:'Second native message'},
]};
const gridCell=(d,row,column)=>d.querySelector(`.canvas-grid-view button[data-grid-row="${row}"][data-grid-column="${column}"]`);
const sceneSettled=d=>d.getElementById('stage').dataset.motionProgress===undefined&&d.getElementById('stage').getAttribute('aria-busy')!=='true';
test('graph to matrix to relationship exploration and Back restores exact grid state and native duplicate direction',async()=>{
 const h=await harness({secondScene:true,secondView:gridFixture}),d=h.document;
 try{
  d.getElementById('next').click();
  await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  assert.equal(d.getElementById('graph-viewport').hidden,true);
  const scroll=d.querySelector('.canvas-grid-scroll');scroll.scrollTop=127;scroll.scrollLeft=64;scroll.dispatchEvent(new h.window.Event('scroll'));
  const width=d.querySelector('.canvas-grid-widths input');width.value='340';width.dispatchEvent(new h.window.Event('change'));
  gridCell(d,0,1).click();
  assert.equal(d.querySelectorAll('.canvas-grid-inspector li').length,2);
  assert.equal(d.querySelector('.canvas-grid-scroll').scrollTop,127);
  assert.equal(d.getElementById('narrative').hidden,false,'selection keeps the authored reading state');
  d.querySelector('.canvas-grid-explore').click();
  await until(()=>!d.querySelector('.canvas-grid-view')&&d.getElementById('narrative').hidden&&sceneSettled(d)&&d.getElementById('status').textContent.startsWith('Explore this native view'));
  const edges=[...d.querySelectorAll('#connections g[data-context="false"]')];
  assert.equal(edges.length,2);
  assert.ok(edges.every(edge=>edge.dataset.source==='part'&&edge.dataset.target==='req'));
  d.getElementById('explore-back').click();
  await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  assert.equal(d.querySelector('.canvas-grid-scroll').scrollTop,127);
  assert.equal(d.querySelector('.canvas-grid-scroll').scrollLeft,64);
  assert.equal(d.querySelector('.canvas-grid-table col').style.width,'340px');
  assert.equal(gridCell(d,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(d.querySelectorAll('.canvas-grid-inspector li').length,2);
  assert.equal(d.getElementById('narrative').hidden,false);
  gridCell(d,0,2).click();
  assert.match(d.querySelector('.canvas-grid-inspector').textContent,/No matching relationship in this view/);
 }finally{h.window.close();}
});
test('table scene sorting and Back retain native row identity without mutating the authored order',async()=>{
 const before=structuredClone(tableFixture),h=await harness({secondScene:true,secondView:tableFixture}),d=h.document;
 try{
  d.getElementById('next').click();await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  d.querySelector('.canvas-grid-sort').click();
  assert.deepEqual([...d.querySelectorAll('.canvas-grid-table tbody tr')].map(row=>row.dataset.nativeRow),['1','0']);
  d.querySelector('.canvas-grid-view button[data-grid-kind="row"][data-grid-row="0"]').click();
  d.querySelector('.canvas-grid-explore').click();await until(()=>!d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  d.getElementById('explore-back').click();await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  assert.deepEqual([...d.querySelectorAll('.canvas-grid-table tbody tr')].map(row=>row.dataset.nativeRow),['1','0']);
  assert.equal(d.querySelector('.canvas-grid-view button[data-grid-kind="row"][data-grid-row="0"]').getAttribute('aria-pressed'),'true');
  assert.deepEqual(tableFixture,before);
 }finally{h.window.close();}
});
test('sequence scenes preserve native participant and message order and restore scrolling through history',async()=>{
 const h=await harness({secondScene:true,secondView:sequenceFixture}),d=h.document;
 try{
  d.getElementById('next').click();await until(()=>d.querySelector('.sequence-view')&&sceneSettled(d));
  assert.deepEqual([...d.querySelectorAll('.sequence-participant')].map(node=>node.dataset.semanticId),['part','req']);
  assert.deepEqual([...d.querySelectorAll('.sequence-message')].map(node=>node.textContent),['First native message','Second native message']);
  const scroll=d.querySelector('.sequence-viewport');scroll.scrollTop=90;scroll.scrollLeft=45;scroll.dispatchEvent(new h.window.Event('scroll'));
  d.querySelector('.sequence-participant').click();d.querySelector('.sequence-toolbar button').click();
  await until(()=>!d.querySelector('.sequence-view')&&sceneSettled(d));
  d.getElementById('explore-back').click();await until(()=>d.querySelector('.sequence-view')&&sceneSettled(d));
  assert.equal(d.querySelector('.sequence-viewport').scrollTop,90);assert.equal(d.querySelector('.sequence-viewport').scrollLeft,45);
  assert.match(d.querySelector('.sequence-evidence').textContent,/does not represent elapsed time/);
 }finally{h.window.close();}
});
test('comparison selection coordinates graph and matrix without scrolling or moving either representation',async()=>{
 const h=await harness({secondView:gridFixture,size:{width:1400,height:800}}),d=h.document;
 try{
  d.getElementById('find-toggle').click();d.getElementById('views').value='Views::other';d.getElementById('compare-view').click();
  await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  const before=[...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform);
  const scroll=d.querySelector('.canvas-grid-scroll');scroll.scrollLeft=85;
  d.querySelector('.canvas-grid-view button[data-grid-kind="row"][data-grid-row="0"]').click();
  assert.equal(d.querySelector('#nodes .node[data-semantic-id="part"]').classList.contains('selected'),true);
  assert.deepEqual([...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),before);
  d.querySelector('#nodes .node[data-semantic-id="req"]').click();
  assert.equal(d.querySelector('.canvas-grid-view button[data-grid-kind="column"][data-grid-column="1"]').getAttribute('aria-pressed'),'true');
  assert.equal(scroll.scrollLeft,85);
 }finally{h.window.close();}
});
test('opening overview from a narrow comparison shows the overview and Back restores the comparison tab and grid state',async()=>{
 const h=await harness({secondView:gridFixture,structuralFixture:true,size:{width:390,height:800}}),d=h.document;
 try{
  d.getElementById('find-toggle').click();d.getElementById('views').value='Views::other';d.getElementById('compare-view').click();
  await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  assert.equal(d.getElementById('graph-viewport').hidden,true);
  const scroll=d.querySelector('.canvas-grid-scroll');scroll.scrollTop=120;scroll.scrollLeft=55;scroll.dispatchEvent(new h.window.Event('scroll'));
  gridCell(d,0,1).click();
  d.getElementById('system-overview').click();
  await until(()=>d.getElementById('exploration-label').textContent.startsWith('System overview')&&d.querySelectorAll('.prominence').length>0&&sceneSettled(d));
  assert.equal(d.querySelector('.canvas-grid-view'),null);
  assert.equal(d.getElementById('graph-viewport').hidden,false);
  assert.ok(activeIDs(d).length<=6,'the phone overview retains its tile budget');
  assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);
  d.getElementById('explore-back').click();
  await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  assert.equal(d.getElementById('graph-viewport').hidden,true,'Back restores the visible comparison tab');
  assert.equal(d.querySelector('.canvas-grid-scroll').scrollTop,120);
  assert.equal(d.querySelector('.canvas-grid-scroll').scrollLeft,55);
  assert.equal(gridCell(d,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(d.querySelectorAll('.canvas-grid-inspector li').length,2);
 }finally{h.window.close();}
});
test('global All None and Focused compartments persist as reader settings independently of scenes',async()=>{
 const h=await harness({compartmentFixture:true,secondScene:true}),d=h.document;let saved;
 try{
  const details=()=>[...d.querySelectorAll('#nodes .node[data-context="false"] .detail')].map(node=>node.textContent);
  assert.equal(d.getElementById('global-compartments').value,'all');assert.equal(details().length,2);
  const setMode=async(mode,count)=>{const select=d.getElementById('global-compartments');select.value=mode;select.dispatchEvent(new h.window.Event('change'));await until(()=>details().length===count&&sceneSettled(d));};
  await setMode('none',0);await setMode('focused',1);assert.match(details()[0],/req/);
  const before=[...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform);
  d.querySelector('#nodes .node[data-semantic-id="part"]').click();
  assert.deepEqual([...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),before);
  assert.match(details()[0],/req/,'stationary selection does not change focused compartments');
  await setMode('all',2);saved=JSON.parse(h.window.localStorage.getItem('syspresent.reader.v1'));
  assert.equal(saved.compartments,'all');
  await setMode('none',0);saved=JSON.parse(h.window.localStorage.getItem('syspresent.reader.v1'));
  d.getElementById('next').click();await until(()=>d.getElementById('scenes').value==='1'&&sceneSettled(d));
  d.getElementById('previous').click();await until(()=>d.getElementById('scenes').value==='0'&&sceneSettled(d));
  assert.equal(details().length,0);assert.equal(d.getElementById('global-compartments').value,'none');
 }finally{h.window.close();}
 const restored=await harness({compartmentFixture:true,storedSettings:saved});
 try{assert.equal(restored.document.getElementById('global-compartments').value,'none');assert.equal(restored.document.querySelectorAll('#nodes .detail').length,0);}finally{restored.window.close();}
});
test('global connection routing changes drawing paths while retaining native endpoint direction and markers',async()=>{
 const h=await harness({contextNeighbor:'shared'}),d=h.document;
 try{
  const paths=()=>[...d.querySelectorAll('#connections g[data-relationship]')].map(edge=>({source:edge.dataset.source,target:edge.dataset.target,marker:edge.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('marker-end'),path:edge.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d')}));
  const before=paths();assert.ok(before.every(edge=>!/[CQ]/.test(edge.path)));
  const routing=d.getElementById('global-routing');routing.value='mind-map';routing.dispatchEvent(new h.window.Event('change'));
  await until(()=>sceneSettled(d)&&paths().some(edge=>/[CQ]/.test(edge.path))).catch(error=>{throw Error(error.message+': '+JSON.stringify(paths()));});
  assert.deepEqual(paths().map(({path,...rest})=>rest),before.map(({path,...rest})=>rest));
  assert.equal(JSON.parse(h.window.localStorage.getItem('syspresent.reader.v1')).routing,'mind-map');
  routing.value='square';routing.dispatchEvent(new h.window.Event('change'));await until(()=>sceneSettled(d)&&paths().every(edge=>!/[CQ]/.test(edge.path)));
 }finally{h.window.close();}
});
test('unsupported authored native views fail before replacing the existing scene',async()=>{
 const h=await harness({secondView:{kind:'unimplemented-native-view',nodes:[],edges:[]}}),d=h.document;
 try{
  const story=h.story+'\n```syspresent\n'+JSON.stringify({type:'scene',id:'unsupported',title:'Unsupported',view:'Views::other',focus:'Model::part'})+'\n```\n';
  const input=d.getElementById('markdown-file');
  Object.defineProperty(input,'files',{configurable:true,value:[{text:async()=>story}]});input.dispatchEvent(new h.window.Event('change'));
  await until(()=>d.getElementById('editor-error').textContent.includes('Unsupported native view kind'));
  assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
  assert.deepEqual(activeIDs(d),['part','req']);
  assert.equal(d.querySelector('.canvas-grid-view'),null);
 }finally{h.window.close();}
});
test('comparison relationship selection highlights all native duplicates and graph tracing highlights the corresponding matrix cell',async()=>{
 const nativeView={...native,edges:gridFixture.relationshipCells[0].relationships.map(link=>({
  id:link.semanticId,semanticId:link.semanticId,from:'p',to:'r',kind:link.kind,label:link.label,
 }))};
 const h=await harness({nativeView,secondView:gridFixture,size:{width:1400,height:800}}),d=h.document;
 try{
  d.getElementById('find-toggle').click();d.getElementById('views').value='Views::other';d.getElementById('compare-view').click();
  await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  const positions=[...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),scroll=d.querySelector('.canvas-grid-scroll');
  scroll.scrollTop=100;scroll.scrollLeft=50;
  gridCell(d,0,1).click();
  const traced=[...d.querySelectorAll('#connections g.traced')];
  assert.deepEqual(traced.map(edge=>edge.dataset.relationship).sort(),['satisfy-first','satisfy-second']);
  assert.equal(d.querySelectorAll('.canvas-grid-inspector li').length,2,'originating cell retains its complete selection');
  assert.equal(scroll.scrollTop,100);assert.equal(scroll.scrollLeft,50);
  assert.deepEqual([...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),positions);
  d.querySelector('#nodes .node[data-semantic-id="req"]').click();
  assert.equal(gridCell(d,0,1).getAttribute('aria-pressed'),'false');
  d.querySelector('#connections g[data-relationship="satisfy-second"]').dispatchEvent(new h.window.MouseEvent('click',{bubbles:true}));
  assert.equal(gridCell(d,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(d.querySelectorAll('#connections g.traced').length,1);
  assert.equal(scroll.scrollTop,100);assert.equal(scroll.scrollLeft,50);
 }finally{h.window.close();}
});
