import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM,VirtualConsole} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {routeConflicts} from '../src/canvas-prototype/peripheral-routing.mjs';
import {packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const {outputFiles}=await build({entryPoints:['src/canvas-prototype/app.mjs'],bundle:true,format:'iife',write:false,logLevel:'silent'});
const html=await readFile('index.html','utf8');
const raw=[{'@id':'orphan','@type':'PartUsage',qualifiedName:'Model::orphan',declaredName:'orphan','sysx:sourceLine':4},{'@id':'Model','@type':'Package',qualifiedName:'Model',declaredName:'Model','sysx:sourceLine':1},{'@id':'req','@type':'RequirementUsage',qualifiedName:'Model::req',declaredName:'req','sysx:sourceLine':2},{'@id':'part','@type':'PartUsage',qualifiedName:'Model::part',declaredName:'part','sysx:sourceLine':3},{'@id':'view','@type':'ViewUsage',qualifiedName:'Views::requirements','sysx:sourceLine':1}];
const native={kind:'requirement',nodes:[{id:'r',semanticId:'req',identityStatus:'mapped',name:'req',kind:'requirement'},{id:'p',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{from:'p',to:'r',kind:'satisfy',label:'satisfy'}]};
const coverage={kind:'requirement',nodes:native.nodes,edges:native.edges};
const manifest={schemaVersion:'syspresent.project.v1',title:'Fixture',systemOfInterest:['Model'],modelSources:['model.sysml'],viewSources:['views.sysml'],story:'story.md',assets:[],publication:{scope:'complete'}};
const files={'model.sysml':'package Model {}','views.sysml':'package Views {}','story.md':'```syspresent\n'+JSON.stringify({type:'scene',id:'one',title:'Control the part',view:'Views::requirements',focus:'Model::req'})+'\n```\n\nReader context.'};
const until=async predicate=>{for(let i=0;i<1000;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('UI did not settle');};
async function pickPackage(h,name){const d=h.document;d.getElementById('choose-package').click();const search=d.getElementById('package-search');search.value=name;search.dispatchEvent(new h.window.Event('input'));const choice=[...d.querySelectorAll('#package-list button')].find(b=>b.textContent===name);assert.ok(choice,'native package is offered');choice.click();await until(()=>!d.getElementById('package-dialog').open&&sceneSettled(d));}
async function harness({landingOnly=false,reducedMotion=true,secondScene=false,secondView,nativeView,compartmentFixture=false,storedSettings,contextNeighbor=false,traceFixture=false,structuralFixture=false,hierarchyFixture=false,packageFixture=false,emptyNative=false,ancestorFixture=false,foreignOwnerFixture=false,ambiguousRefs=false,presentation,storyContent=false,url='http://localhost/',noStory=false,entryView,entryFocus,overviewFixture=false,overviewPort=false,rollupFixture=false,nativeCaptureFixture=false,sequenceCaptureFixture=false,authoringFixture=false,lifecycleFixture=false,focusedFixture=false,behaviorFixture=false,parameterFixture=false,initialCount=2,size={width:1000,height:700}}={}){
 let workerCount=0,resizeCallback;const nativeModels=new Set(),sourceHashes=new Map();const nativeRequests=[],nativeCalls=[],fetchCalls=[];const fixtureNative=structuredClone(nativeView??native);if(compartmentFixture)for(const node of fixtureNative.nodes)node.detail='Native details for '+node.semanticId;const fixtureFiles={...files};if(presentation)fixtureFiles['story.md']=fixtureFiles['story.md'].replace('\"focus\":\"Model::req\"','\"focus\":\"Model::req\",\"presentation\":'+JSON.stringify(presentation));if(secondScene)fixtureFiles['story.md']+='\n\n```syspresent\n'+JSON.stringify({type:'scene',id:'two',title:'Other scene',view:'Views::other',focus:secondView?'Model::part':'Model::orphan'})+'\n```\n\nOther context.';
 if(storyContent){const block=JSON.parse(fixtureFiles['story.md'].split('```syspresent\n')[1].split('\n```')[0]);Object.assign(block,{chapter:{id:'challenge',title:'Challenge'},figures:[{id:'course',title:'Course map',asset:'assets/course.svg',alt:'Course map',caption:'Illustrative course.',provenance:{source:'Model',context:'Fixture'},modelRefs:['Model::req']}],context:[{kind:'candidate',title:'Candidate',text:'Proposed boat.',modelRefs:['Model::part']}]});fixtureFiles['story.md']='```syspresent\n'+JSON.stringify(block)+'\n```\n\nRead [the requirement](model:Model::req) and [hidden context](model:Model::orphan).';fixtureFiles['assets/course.svg']='<svg xmlns="http://www.w3.org/2000/svg"/>';}
 const extra=traceFixture?[{id:'origin',kind:'RequirementUsage'},{id:'case',kind:'VerificationCaseUsage'},...Array.from({length:8},(_,i)=>({id:'child'+i,kind:'RequirementUsage'}))]:[],fixtureCoverage=structuredClone(coverage);for(const e of extra)fixtureCoverage.nodes.push({id:e.id,semanticId:e.id,name:e.id,kind:e.kind==='VerificationCaseUsage'?'verification case':'requirement',identityStatus:'mapped'});if(traceFixture)fixtureCoverage.edges.push({from:'r',to:'origin',kind:'derive',label:'derive'},{from:'case',to:'r',kind:'verify',label:'verify'},...extra.filter(e=>e.id.startsWith('child')).map(e=>({from:e.id,to:'r',kind:'derive',label:'derive'})));
 const structuralRaw=structuralFixture?[{'@id':'definition','@type':'PartDefinition',qualifiedName:'Model::Device',declaredName:'Device',owner:{'@id':'Model'},ownedMember:[{'@id':'sensor'},{'@id':'processor'}],'sysx:sourceLine':10},...['sensor','processor'].map(id=>({'@id':id,'@type':'PartUsage',qualifiedName:'Model::Device::'+id,declaredName:id,owner:{'@id':'definition'},'sysx:sourceLine':11})),{'@id':'nested','@type':'Package',qualifiedName:'Model::Nested',declaredName:'Nested',owner:{'@id':'Model'},'sysx:sourceLine':12}]:[];
 if(sequenceCaptureFixture)structuralRaw.push({'@id':'exchange','@type':'OccurrenceUsage',qualifiedName:'Model::exchange',declaredName:'exchange',owner:{'@id':'Model'},'sysx:sourceLine':120});
 if(parameterFixture)for(const [id,name,direction]of [['parameter-in','incoming','in'],['parameter-out','outgoing','out'],['parameter-inout','shared','inout']])structuralRaw.push({'@id':id,'@type':'ReferenceUsage',qualifiedName:'Model::part::'+name,declaredName:name,direction,owner:{'@id':'part'},'sysx:sourceLine':130});
 if(focusedFixture)structuralRaw.push({'@id':'mass-attribute','@type':'AttributeUsage',qualifiedName:'Model::Device::mass',declaredName:'mass',owner:{'@id':'definition'},'sysx:sourceLine':110});
 if(hierarchyFixture)structuralRaw.push(...Array.from({length:65},(_,i)=>({'@id':'extra-part-'+i,'@type':'PartUsage',qualifiedName:'Model::Device::extra'+String(i).padStart(2,'0'),declaredName:'extra'+String(i).padStart(2,'0'),owner:{'@id':'definition'},'sysx:sourceLine':20+i})),{'@id':'voltage','@type':'AttributeUsage',qualifiedName:'Model::Device::voltage',declaredName:'voltage',owner:{'@id':'definition'},'sysx:sourceLine':99});
 if(packageFixture)structuralRaw.push({'@id':'run','@type':'ActionDefinition',qualifiedName:'Model::Nested::Run',declaredName:'Run',owner:{'@id':'nested'},'sysx:sourceLine':16});
 if(rollupFixture)structuralRaw.push(...['a','b'].map(id=>({'@id':id,'@type':'Package',qualifiedName:'Model::'+id.toUpperCase(),declaredName:id.toUpperCase(),owner:{'@id':'Model'},'sysx:sourceLine':100})),...['a','b'].map(id=>({'@id':'hidden-'+id,'@type':'PartUsage',qualifiedName:'Model::'+id.toUpperCase()+'::hidden',declaredName:'hidden',owner:{'@id':id},'sysx:sourceLine':101})),...['one','two'].map(id=>({'@id':'native-dependency-'+id,'@type':'Dependency',client:[{'@id':'hidden-a'}],supplier:[{'@id':'hidden-b'}],'sysx:sourceLine':102})));
 let fixtureRaw=raw.map(e=>packageFixture&&e['@id']==='req'?{...e,owner:{'@id':'nested'}}:structuralFixture&&e['@id']==='part'?{...e,type:[{'@id':'definition'}],owner:{'@id':'Model'}}:e);
 if(behaviorFixture)fixtureRaw=fixtureRaw.map(element=>['part','req'].includes(element['@id'])?{...element,'@type':'ActionUsage'}:element);
 let fixtureSequence,capturedSequence;if(sequenceCaptureFixture){fixtureSequence=structuredClone(sequenceFixture);fixtureSequence.nodes[1].semanticId='orphan';capturedSequence=structuredClone(fixtureSequence);const capturedIds=new Map(capturedSequence.nodes.map(node=>[node.id,'captured-'+node.id]));capturedSequence.nodes=capturedSequence.nodes.map(node=>({...node,id:capturedIds.get(node.id)}));capturedSequence.edges=capturedSequence.edges.map(edge=>({...edge,from:capturedIds.get(edge.from),to:capturedIds.get(edge.to)}));}
 const fixtureManifest={...manifest,...(entryView?{entryView}:{}),...(entryFocus?{entryFocus}:{})};
 if(noStory)fixtureFiles['story.md']='# Explore the supplied model\n\nNo authored scenes.';
 if(overviewFixture)structuralRaw.push({'@id':'outside','@type':'PartDefinition',qualifiedName:'Foreign::outside',declaredName:'outside','sysx:sourceLine':14},{'@id':'outside-dependency','@type':'Dependency',client:[{'@id':'definition'}],supplier:[{'@id':'outside'}]});
 if(overviewPort)structuralRaw.push({'@id':'control-port','@type':'PortUsage',qualifiedName:'Model::controlPort',declaredName:'controlPort',owner:{'@id':'Model'},'sysx:sourceLine':15});
 let renderOverride;let authoredViews=[],holdNextParse=false,capturedNative=false,pendingRender,holdLayout=false,holdCountdown=null;const heldLayouts=[],heldParses=[];
 const massValue={numerator:'1',denominator:'4'};const window=new JSDOM(html,{url,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}).window;
 if(storedSettings)window.localStorage.setItem('syspresent.reader.v1',JSON.stringify(storedSettings));
 const blobs=new Map(),downloads=[];window.Blob=Blob;window.TextDecoder=TextDecoder;window.TextEncoder=class{encode(value){return new window.Uint8Array(new TextEncoder().encode(value));}};window.URL.createObjectURL=blob=>{const url='blob:fixture-'+blobs.size;blobs.set(url,blob);return url;};window.URL.revokeObjectURL=()=>{};const anchorClick=window.HTMLAnchorElement.prototype.click;window.HTMLAnchorElement.prototype.click=function(){if(this.download)downloads.push({name:this.download,blob:blobs.get(this.href)});else anchorClick.call(this);};
 window.matchMedia=()=>({matches:reducedMotion});window.Element.prototype.animate=function(){let done;const finished=new Promise(resolve=>done=resolve);return {finished,cancel:()=>done()};};const ownRealm=value=>{if(value===null||typeof value!=='object')return value;if(ArrayBuffer.isView(value))return new window.Uint8Array(value);if(Array.isArray(value))return window.Array.from(value,ownRealm);if(value instanceof Set)return new window.Set([...value].map(ownRealm));if(value instanceof Map)return new window.Map([...value].map(([k,v])=>[ownRealm(k),ownRealm(v)]));return window.Object.fromEntries(Object.entries(value).map(([k,v])=>[k,ownRealm(v)]));};window.structuredClone=value=>ownRealm(structuredClone(value));window.ResizeObserver=class{constructor(fn){resizeCallback=fn;}observe(){}};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;this.dispatchEvent(new window.Event('close'));};
 Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{get(){return size.width;}});Object.defineProperty(window.HTMLElement.prototype,'clientHeight',{get(){return size.height;}});
 let fetchOverride;window.fetch=async (url,options)=>{fetchCalls.push(String(url));if(fetchOverride){const value=await fetchOverride(String(url),options);if(value!==undefined)return value;}return ({ok:true,arrayBuffer:async()=>packProject({manifest:fixtureManifest,files:fixtureFiles}).buffer,json:async()=>String(url).includes('demos.json')?{schemaVersion:'syspresent.demos.v1',demos:[{id:'blue-dog',title:'Fixture',project:'project.zip'},{id:'flashlight',title:'Small fixture',project:'small.zip'}]}:String(url).includes('project.json')?fixtureManifest:{version:'fixture'},text:async()=>files[String(url).split('/').at(-1)]});};
 const semanticWorkers=[];window.Worker=class{constructor(url){workerCount++;if(!String(url).includes('elk-worker'))semanticWorkers.push(this);this.layout=String(url).includes('elk-worker')?new ELK():null;}postMessage(message){const {id,method,params}=message;if(method)nativeCalls.push({method,params});if(message.cmd){if(message.cmd==='layout')this.layout.layout(structuredClone(message.graph)).then(data=>{const reply=()=>this.onmessage({data:{id,data}});if(holdLayout||holdCountdown===1){holdLayout=false;holdCountdown=null;heldLayouts.push(error=>error?this.onmessage({data:{id,error:{message:error}}}):reply());}else{if(holdCountdown!==null)holdCountdown--;reply();}});else queueMicrotask(()=>this.onmessage({data:{id,data:{}}}));return;}const respond=result=>queueMicrotask(()=>this.onmessage({data:{id,result}}));
  if(method==='RenderView'&&renderOverride){const reject=error=>queueMicrotask(()=>this.onmessage({data:{id,error:{message:error.message}}}));let override;try{override=renderOverride(params);}catch(error){reject(error);return;}if(override!==undefined){Promise.resolve(override).then(respond,reject);return;}}
  if(method==='Initialize')respond({version:'test'});
  else if(method==='ReleaseModel')respond({released:nativeModels.delete(params.modelHash)});
  else if(method==='ParseSources'){const sourceKey=JSON.stringify(params.documents);if(!sourceHashes.has(sourceKey))sourceHashes.set(sourceKey,'fixture-'+(sourceHashes.size+1));const modelHash=lifecycleFixture?sourceHashes.get(sourceKey):'fixture';nativeModels.add(modelHash);capturedNative=(nativeCaptureFixture||sequenceCaptureFixture)&&params.documents.some(d=>d.content.includes('package CanvasCaptured2'));authoredViews=authoringFixture?[2,3,4,5].filter(n=>params.documents.some(d=>d.content.includes('package CanvasAuthored'+n))):[];const reply=()=>respond({modelHash,roots:[{childIds:['Model']}],diagnostics:params.documents.some(d=>d.content.includes('BROKEN'))?[{severity:'error',message:'Native parse rejected broken view'}]:[]});if(holdNextParse){holdNextParse=false;heldParses.push(reply);}else reply();}
  else if(method==='ExportModel')respond({elements:structuredClone([...authoredViews.map(n=>({'@id':'authored-view-'+n,'@type':'ViewUsage',qualifiedName:'CanvasAuthored'+n+'::slide',declaredName:'slide','sysx:sourceLine':210+n})),...(capturedNative?[{'@id':'captured-view','@type':'ViewUsage',qualifiedName:'CanvasCaptured2::slide',declaredName:'slide','sysx:sourceLine':200}]:[]),...structuralRaw,...fixtureRaw.map(e=>(ancestorFixture||foreignOwnerFixture)&&['req','orphan'].includes(e['@id'])?{...e,owner:{'@id':foreignOwnerFixture?'foreign':'Model'}}:e),...(foreignOwnerFixture?[{'@id':'foreign','@type':'Package',qualifiedName:'Foreign::root',declaredName:'root','sysx:sourceLine':1}]:[]),...(ambiguousRefs?['duplicate1','duplicate2'].map(id=>({'@id':id,'@type':'RequirementUsage',qualifiedName:'Model::ambiguous',declaredName:'ambiguous','sysx:sourceLine':9})):[]),...extra.map(e=>({'@id':e.id,'@type':e.kind,qualifiedName:'Model::'+e.id,declaredName:e.id,'sysx:sourceLine':8})),...((secondScene||secondView)?[{'@id':'view2','@type':'ViewUsage',qualifiedName:'Views::other','sysx:sourceLine':2}]:[]),...(contextNeighbor==='shared'?[{'@id':'second-neighbor-link','@type':'Dependency',client:[{'@id':'part'}],supplier:[{'@id':'orphan'}]}]:[]),...(contextNeighbor?[{'@id':'neighbor-link','@type':'Dependency',client:[{'@id':'req'}],supplier:[{'@id':'orphan'}]}]:[])])});
  else if(method==='GetSymbol')respond(authoringFixture&&params.symbolId==='Model::part'?{symbol:{id:'native-part-symbol',attributes:[{name:'mass',type:'ISQBase::MassValue',unit:'kg',value:{rationalValue:{numerator:massValue.numerator,denominator:massValue.denominator}}}]}}:{error:'Native fixture symbol is unavailable'});
  else if(method==='RenderView'&&authoringFixture&&authoredViews.some(n=>params.view==='CanvasAuthored'+n+'::slide'))respond({kind:'interconnection',nodes:[{...native.nodes[1],id:'authored-part-representation'}],edges:[]});
  else if(method==='RenderView'&&sequenceCaptureFixture&&params.view==='CanvasCaptured2::slide')respond(structuredClone(capturedSequence));
  else if(method==='RenderView'&&nativeCaptureFixture&&params.view==='CanvasCaptured2::slide')respond({kind:'interconnection',nodes:[{...native.nodes[1],id:'captured-part-representation'}],edges:[]});
  else if(method==='RenderView'&&params.view==='Views::other')respond(structuredClone(secondView??{kind:'requirement',nodes:[{id:'o',semanticId:'orphan',identityStatus:'mapped',name:'orphan',kind:'part'}],edges:[]}));
  else if(method==='RenderView'&&params.view.startsWith('#')){nativeRequests.push(params.view);pendingRender=()=>respond(sequenceCaptureFixture&&params.view.startsWith('#sequence:')?structuredClone(fixtureSequence):emptyNative?{kind:'action',nodes:[],edges:[]}:packageFixture&&params.view.startsWith('#action:')?{kind:'action',nodes:[{id:'run-native',semanticId:'run',name:'Native run activity',kind:'action',identityStatus:'mapped'}],edges:[]}:{kind:'interconnection',nodes:[native.nodes[1]],edges:[]});}
  else if(method==='RenderView')respond(params.view.endsWith('::coverage')?fixtureCoverage:structuredClone(fixtureNative));
 }terminate(){}};
 window.eval(outputFiles[0].text);if(landingOnly)return {window,document:window.document,nativeCalls,fetchCalls,setFetch:handler=>{fetchOverride=handler;},workerCount:()=>workerCount};window.document.querySelector('[data-demo="blue-dog"]').click();await until(()=>(noStory?window.document.querySelectorAll('.node[data-context=\"false\"]').length>0:window.document.querySelectorAll('.node[data-context=\"false\"]').length===initialCount)&&window.document.getElementById('status').textContent.startsWith('OpenSysML WASM')).catch(e=>{throw Error(e.message+': '+window.document.getElementById('status').textContent);});
 return {window,nativeRequests,nativeCalls,nativeModels,fetchCalls,downloads,failWorker:()=>semanticWorkers.at(-1).onerror({message:'Native worker lost'}),setNativeRender:handler=>{renderOverride=handler;},setMass:(numerator,denominator)=>Object.assign(massValue,{numerator,denominator}),holdParse:()=>{holdNextParse=true;},parsePending:()=>heldParses.length>0,releaseParse:()=>heldParses.splice(0).forEach(reply=>reply()),story:fixtureFiles['story.md'],document:window.document,resize:(width,height)=>{size.width=width;size.height=height;resizeCallback?.();},release:()=>pendingRender?.(),pending:()=>!!pendingRender,holdLayout:()=>{holdLayout=true;},holdLayoutAfter:count=>{holdCountdown=count;},layoutPending:()=>heldLayouts.length>0,layoutPendingCount:()=>heldLayouts.length,releaseNextLayout:error=>heldLayouts.shift()?.(error),releaseLayout:error=>heldLayouts.splice(0).forEach(reply=>reply(error))};
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
 await until(()=>sceneSettled(d)&&d.getElementById('exploration-label').textContent.startsWith('Effective requirements'));
 assert.deepEqual(new Set(active().map(n=>n.dataset.semanticId)),new Set(['part','req']));
 assert.equal(d.querySelector('.node[data-context="true"]'),null,'effective requirements keep collapsed inheritance out of peripheral context');
 assert.equal(d.querySelectorAll('#connections g[data-kind="typing"][data-context="false"]').length,0);
 d.querySelector('.node[data-context="false"][data-semantic-id="part"]').click();
 const local=[...d.querySelectorAll('#selection button')].find(b=>b.textContent.startsWith('Local understanding'));assert.ok(local);local.click();
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
 d.getElementById('resume-model').click();await until(()=>d.getElementById('landing').hidden);h.window.close();
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
  assert.match(d.querySelector('.sequence-evidence').textContent,/neither elapsed time nor additional modeled ordering/);
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


test('voice UI hierarchy reaches every declaration page and exposes part and attribute details',async()=>{
 const h=await harness({structuralFixture:true,hierarchyFixture:true}),d=h.document;
 try{
  d.getElementById('standalone').click();await until(()=>sceneSettled(d)&&!d.getElementById('workspace-controls').hidden);
  d.getElementById('browse-hierarchy').click();
  const find=d.getElementById('hierarchy-search');find.value='Model::Device';find.dispatchEvent(new h.window.Event('input'));
  assert.equal(d.querySelectorAll('#hierarchy-list .hierarchy-row').length,50);assert.equal(d.getElementById('hierarchy-next').disabled,false);
  d.getElementById('hierarchy-next').click();assert.ok(d.querySelector('#hierarchy-list').textContent.includes('extra64'));assert.equal(d.getElementById('hierarchy-next').disabled,true);
  d.getElementById('hierarchy-previous').click();assert.equal(d.querySelectorAll('#hierarchy-list .hierarchy-row').length,50);
  const row=[...d.querySelectorAll('#hierarchy-list .hierarchy-row')].find(r=>r.querySelector('span').textContent==='Model::Device');assert.ok(row);
  [...row.querySelectorAll('button')].find(b=>b.textContent==='Declarations').click();assert.equal(d.getElementById('declarations-dialog').open,true);
  assert.match(d.getElementById('declaration-summary').textContent,/declared|declaration/i);assert.ok(d.querySelectorAll('#declaration-list .hierarchy-row').length>5);
  const allDetails=()=>d.getElementById('declaration-list').textContent;let detailText=allDetails();while(!d.getElementById('declaration-next').disabled){d.getElementById('declaration-next').click();detailText+=allDetails();}
  assert.match(detailText,/voltage/);assert.match(detailText,/attribute/i);assert.match(detailText,/extra64/);
  d.getElementById('declarations-dialog').close();d.getElementById('hierarchy-dialog').close();
  assert.equal(d.querySelectorAll('#scenes option').length,1,'manual hierarchy and details browsing does not append slides');
 }finally{h.window.close();}
});

test('voice UI focused rendering removes peripheral opacity and preserves native active connections',async()=>{
 const h=await harness({contextNeighbor:true,presentation:{emphasis:['verify']}}),d=h.document;
 try{
  assert.ok(d.querySelector('.node[data-context="true"]'));
  const before=d.querySelector('#connections g[data-context="false"]');assert.ok(Number(before.style.opacity)<1);
  const chooser=d.getElementById('rendering-mode');chooser.value='focused';chooser.dispatchEvent(new h.window.Event('change'));
  await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('compliance is not established')).catch(error=>{throw Error(error.message+': '+chooser.value+' / '+d.getElementById('status').textContent);});
  assert.equal(d.querySelector('.node[data-context="true"]'),null);assert.equal(d.getElementById('adjust-layout').disabled,true);
  const active=d.querySelector('#connections g[data-context="false"]');assert.equal(Number(active.style.opacity),1);assert.equal(active.dataset.source,'part');assert.equal(active.dataset.target,'req');assert.equal(active.dataset.kind,'satisfy');
  assert.deepEqual(activeIDs(d),['part','req']);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&chooser.value==='exploratory');assert.ok(d.querySelector('.node[data-context="true"]'));
 }finally{h.window.close();}
});

test('voice UI explicit questions append ordered slides while manual browsing keeps the conversation unchanged',async()=>{
 const h=await harness(),d=h.document;
 try{
  const count=()=>d.querySelectorAll('#scenes option').length;
  assert.equal(count(),1);d.getElementById('standalone').click();await until(()=>sceneSettled(d)&&d.getElementById('narrative').hidden);
  d.querySelector('.node[data-semantic-id="req"]').click();action(d,'Ask as a new slide').click();
  assert.equal(d.getElementById('question-dialog').open,true);d.getElementById('question-text').value='Which requirement does this part satisfy?';d.getElementById('submit-question').click();
  await until(()=>!d.getElementById('question-dialog').open&&sceneSettled(d)&&count()===2);
  assert.equal(d.querySelector('#narrative h2').textContent,'Which requirement does this part satisfy?');
  d.getElementById('previous').click();await until(()=>sceneSettled(d)&&d.querySelector('#narrative h2').textContent==='Control the part');assert.equal(count(),2);
  d.getElementById('standalone').click();await until(()=>sceneSettled(d)&&d.getElementById('narrative').hidden);d.querySelector('.node[data-semantic-id="req"]').click();action(d,'Ask as a new slide').click();d.getElementById('question-text').value='Show the same native view again';d.getElementById('submit-question').click();
  await until(()=>sceneSettled(d)&&count()===3&&!d.getElementById('question-dialog').open);assert.equal(d.querySelector('#narrative h2').textContent,'Show the same native view again');
  assert.match(d.getElementById('status').textContent,/Question appended/);
 }finally{h.window.close();}
});

test('voice UI external trace context is explicit and history restores isolated package scope',async()=>{
 const h=await harness({structuralFixture:true,packageFixture:true}),d=h.document;
 try{
  await pickPackage(h,'Model::Nested');d.querySelector('.node[data-semantic-id="req"]').click();action(d,'Focus').click();await until(()=>sceneSettled(d)&&activeIDs(d).length===1);
  const toggle=d.getElementById('scope-context-toggle');assert.equal(toggle.checked,false);
  toggle.checked=true;toggle.dispatchEvent(new h.window.Event('change'));await until(()=>sceneSettled(d)&&activeIDs(d).includes('part')).catch(error=>{throw Error(error.message+': '+toggle.checked+' / '+activeIDs(d)+' / '+d.getElementById('status').textContent);});
  assert.equal(d.getElementById('scope-label').textContent,'Model::Nested + external context');assert.equal(toggle.checked,true);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&!toggle.checked);assert.deepEqual(activeIDs(d),['req']);assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');
 }finally{h.window.close();}
});

test('voice UI dragging moves only the selected card and reset restores automatic geometry',async()=>{
 const h=await harness(),d=h.document;
 try{
  const target=()=>d.querySelector('.node[data-context="false"][data-semantic-id="part"]'),peer=()=>d.querySelector('.node[data-context="false"][data-semantic-id="req"]');
  const original=target().style.transform,stationary=peer().style.transform;
  d.getElementById('adjust-layout').click();assert.equal(d.getElementById('adjust-layout').getAttribute('aria-pressed'),'true');
  const node=target(),pointer=(name,x,y)=>node.dispatchEvent(new h.window.MouseEvent(name,{button:0,clientX:x,clientY:y,bubbles:true,cancelable:true}));
  // jsdom lacks the browser onpointerdown event-handler property dispatch.
  node.onpointerdown(new h.window.MouseEvent('pointerdown',{button:0,clientX:100,clientY:100,bubbles:true,cancelable:true}));pointer('pointermove',400,100);pointer('pointerup',400,100);
  await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('Drawing positions saved')).catch(error=>{throw Error(error.message+': '+d.getElementById('status').textContent+' / '+target().style.transform);});
  assert.notEqual(target().style.transform,original);assert.equal(peer().style.transform,stationary);assert.equal(d.querySelector('#connections g[data-context="false"]').dataset.source,'part');
  d.getElementById('reset-layout').click();await until(()=>sceneSettled(d)&&target().style.transform===original);assert.equal(peer().style.transform,stationary);
 }finally{h.window.close();}
});


const rollupNative={kind:'definition',nodes:[{id:'native-a',semanticId:'a',identityStatus:'mapped',name:'A',kind:'package'},{id:'native-b',semanticId:'b',identityStatus:'mapped',name:'B',kind:'package'}],edges:[]};
const manualTarget=(d,id)=>d.querySelector('.node[data-context="false"][data-semantic-id="'+id+'"]');
async function exportAndImport(h){
 const d=h.document;d.getElementById('export-project').click();const download=h.downloads.at(-1);assert.equal(download?.name,'syspresent-project.zip');
 const bytes=new Uint8Array(await download.blob.arrayBuffer()),project=unpackProject(bytes),input=d.getElementById('project-file');
 const parses=h.nativeCalls.filter(call=>call.method==='ParseSources').length;Object.defineProperty(input,'files',{configurable:true,value:[{arrayBuffer:async()=>bytes.buffer}]});input.dispatchEvent(new h.window.Event('change'));
 await until(()=>h.nativeCalls.filter(call=>call.method==='ParseSources').length>parses&&d.getElementById('loading').hidden&&sceneSettled(d)&&d.getElementById('status').textContent.startsWith('OpenSysML WASM')).catch(error=>{throw Error(error.message+': '+d.getElementById('status').textContent);});
 return project;
}
test('remaining UI typed rollups drill into exact native links and preserve scope plus Back and Forward',async()=>{
 const h=await harness({nativeView:rollupNative,rollupFixture:true}),d=h.document;
 try{
  const toggle=d.getElementById('show-rollups');toggle.checked=true;toggle.dispatchEvent(new h.window.Event('change'));
  const aggregate=()=>d.querySelector('#connections g[data-relationship^="presentation-rollup:"]');
  await until(()=>sceneSettled(d)&&aggregate());
  assert.equal(aggregate().dataset.source,'a');assert.equal(aggregate().dataset.target,'b');assert.equal(aggregate().dataset.kind,'dependency');assert.match(aggregate().textContent,/×2|2 native/);
  aggregate().dispatchEvent(new h.window.MouseEvent('click',{bubbles:true}));
  assert.equal(d.getElementById('rollup-dialog').open,true);assert.match(d.getElementById('rollup-summary').textContent,/2 native dependency/);
  assert.match(d.getElementById('rollup-list').textContent,/native-dependency-one/);assert.match(d.getElementById('rollup-list').textContent,/native-dependency-two/);
  assert.match(d.getElementById('rollup-list').textContent,/hidden-a|Model::A::hidden/);assert.match(d.getElementById('rollup-list').textContent,/hidden-b|Model::B::hidden/);
  d.getElementById('rollup-expand').click();await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='hidden-a,hidden-b');
  assert.equal(aggregate(),null,'drilldown displays native endpoints rather than inventing container relationships');
  const direct=[...d.querySelectorAll('#connections g[data-context="false"]')];assert.equal(direct.length,2);assert.ok(direct.every(e=>e.dataset.source==='hidden-a'&&e.dataset.target==='hidden-b'));
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&aggregate());assert.equal(toggle.checked,true);
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='hidden-a,hidden-b');
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&aggregate());
  await pickPackage(h,'Model::A');assert.equal(aggregate(),null);assert.equal(d.getElementById('scope-label').textContent,'Model::A');
  d.getElementById('context-details').click();assert.match(d.getElementById('information-text').textContent,/outside-scope/);
  assert.equal(d.querySelectorAll('#scenes option').length,1,'rollup inspection and browsing do not append slides');
 }finally{h.window.close();}
});
test('remaining UI portable layout survives source ZIP export import and reversible reset',async()=>{
 const h=await harness(),d=h.document;
 try{
  const target=()=>manualTarget(d,'part'),peer=()=>manualTarget(d,'req'),original=target().style.transform,stationary=peer().style.transform;
  d.getElementById('adjust-layout').click();target().click();const move=action(d,'Move right');assert.ok(move);move.click();
  await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('Drawing positions saved'));const moved=target().style.transform;
  assert.notEqual(moved,original);assert.equal(peer().style.transform,stationary);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&target().style.transform===original);
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&target().style.transform===moved);
  const project=await exportAndImport(h);assert.ok(project.files['syspresent-layouts.json'],JSON.stringify(Object.keys(project.files)));const layout=JSON.parse(fileText(project,'syspresent-layouts.json'));
  assert.equal(layout.schemaVersion,'syspresent.presentation-layouts.v1');assert.ok(layout.views.some(v=>v.placements.some(p=>p.semanticId==='part')));
  assert.equal(fileText(project,'model.sysml'),files['model.sysml']);assert.equal(fileText(project,'views.sysml'),files['views.sysml']);
  await until(()=>sceneSettled(d)&&target().style.transform===moved);assert.equal(peer().style.transform,stationary);
  d.getElementById('reset-layout').click();await until(()=>sceneSettled(d)&&target().style.transform===original);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&target().style.transform===moved);
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&target().style.transform===original);
 }finally{h.window.close();}
});

test('remaining UI explicit native capture rebinds portable placement by semantic identity and survives ZIP import',async()=>{
 const h=await harness({nativeCaptureFixture:true}),d=h.document;
 try{
  manualTarget(d,'part').click();action(d,'Internal view').click();await until(h.pending);h.release();await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='part');
  const target=()=>manualTarget(d,'part'),automatic=target().style.transform;
  d.getElementById('adjust-layout').click();target().click();action(d,'Move right').click();await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('Drawing positions saved'));
  const moved=target().style.transform;assert.notEqual(moved,automatic);
  d.getElementById('edit').click();d.getElementById('scene-title').value='Reusable internal view';d.getElementById('capture-scene').click();
  await until(()=>sceneSettled(d)&&d.querySelectorAll('#scenes option').length===2&&!d.getElementById('editor').open).catch(error=>{throw Error(error.message+': '+d.getElementById('status').textContent);});
  assert.equal(target().dataset.representation,'captured-part-representation');assert.notEqual(target().style.transform,automatic);
  const project=await exportAndImport(h);assert.ok(project.files['syspresent-layouts.json'],JSON.stringify(Object.keys(project.files)));const layout=JSON.parse(fileText(project,'syspresent-layouts.json'));
  assert.match(fileText(project,'views/captured-views.sysml'),/view def Definition/);
  const saved=layout.views.find(v=>v.viewId==='CanvasCaptured2::slide');assert.ok(saved);assert.equal(saved.placements[0].semanticId,'part');assert.equal(saved.placements[0].representationId,'captured-part-representation');
  d.getElementById('next').click();await until(()=>sceneSettled(d)&&d.getElementById('scenes').value==='1'&&activeIDs(d).join(',')==='part');
  assert.equal(target().dataset.representation,'captured-part-representation');assert.notEqual(target().style.transform,automatic);
 }finally{h.window.close();}
});


const massProposal=(title='Native mass')=>({schemaVersion:'syspresent.authoring-proposal.v1',question:'What is the declared mass?',title,focus:'part',view:{definition:'InterconnectionView',expose:['part'],kinds:[],membership:'native'},narrative:{schemaVersion:'syspresent.narrative.v1',template:'Declared mass: {{mass}}.',bindings:[{name:'mass',symbol:'part',attribute:'mass',type:'ISQBase::MassValue',unit:'kg',decimals:2}]},references:['part'],relationshipClaims:[]});
const proposalInput=(h,proposal)=>{const input=h.document.getElementById('authoring-proposal');input.value=typeof proposal==='string'?proposal:JSON.stringify(proposal);input.dispatchEvent(new h.window.Event('input'));};
const openNativeAuthoring=h=>{const d=h.document;manualTarget(d,'part').click();d.getElementById('edit').click();d.getElementById('author-native-slide').click();};
test('remaining UI offline native authoring validates repeated proposals, appends only explicitly and refreshes typed values on import',async()=>{
 const h=await harness({authoringFixture:true}),d=h.document;
 try{
  const fetchCount=h.fetchCalls.length;openNativeAuthoring(h);
  assert.match(d.getElementById('authoring-provider').textContent,/No LLM provider|unconfigured/i);assert.equal(d.getElementById('authoring-generate').disabled,true);d.getElementById('authoring-generate').click();assert.equal(h.fetchCalls.length,fetchCount);
  assert.match(d.getElementById('authoring-review').textContent,/not an LLM response/);
  d.getElementById('authoring-values-button').click();await until(()=>d.getElementById('authoring-values').textContent.includes('mass'));
  assert.match(d.getElementById('authoring-values').textContent,/0.25 kg/);
  proposalInput(h,massProposal());d.getElementById('authoring-validate').click();await until(()=>!d.getElementById('authoring-append').disabled);
  assert.match(d.getElementById('authoring-review').textContent,/native:GetSymbol/);assert.ok(d.querySelector('#authoring-preview .node[data-semantic-id="part"]'));assert.equal(d.querySelectorAll('#scenes option').length,1);
  d.getElementById('authoring-validate').click();await until(()=>!d.getElementById('authoring-append').disabled);assert.equal(d.querySelectorAll('#scenes option').length,1,'validation does not append');
  d.getElementById('authoring-append').click();await until(()=>sceneSettled(d)&&!d.getElementById('authoring-dialog').open&&d.querySelectorAll('#scenes option').length===2);
  assert.match(d.getElementById('narrative').textContent,/Declared mass: 0.25 kg/);assert.equal(h.fetchCalls.length,fetchCount,'local authoring sends no model content via fetch');
  h.setMass('1','2');const project=await exportAndImport(h);assert.match(fileText(project,'views/authored-proposals.sysml'),/view def Definition/);assert.match(fileText(project,'story.md'),/syspresent.narrative.v1/);
  d.getElementById('next').click();await until(()=>sceneSettled(d)&&d.getElementById('scenes').value==='1'&&d.getElementById('narrative').textContent.includes('Declared mass: 0.50 kg'));
  openNativeAuthoring(h);proposalInput(h,massProposal('Native mass again'));d.getElementById('authoring-validate').click();await until(()=>!d.getElementById('authoring-append').disabled);d.getElementById('authoring-append').click();
  await until(()=>sceneSettled(d)&&!d.getElementById('authoring-dialog').open&&d.querySelectorAll('#scenes option').length===3);assert.match(d.getElementById('narrative').textContent,/Native mass again/);assert.match(d.getElementById('narrative').textContent,/0.50 kg/);
 }finally{h.window.close();}
});
test('remaining UI invalid or stale native authoring proposals never append or replace the current scene',async()=>{
 const h=await harness({authoringFixture:true}),d=h.document;
 try{
  openNativeAuthoring(h);const initialIDs=activeIDs(d),count=()=>d.querySelectorAll('#scenes option').length;
  proposalInput(h,'{invalid');d.getElementById('authoring-validate').click();await until(()=>d.getElementById('authoring-review').textContent.includes('valid JSON'));assert.equal(count(),1);assert.equal(d.getElementById('authoring-append').disabled,true);assert.deepEqual(activeIDs(d),initialIDs);
  const wrong=massProposal();wrong.narrative.bindings[0].unit='lb';proposalInput(h,wrong);d.getElementById('authoring-validate').click();await until(()=>d.getElementById('authoring-review').textContent.includes('Unit conversion is unsupported'));assert.equal(count(),1);assert.deepEqual(activeIDs(d),initialIDs);
  proposalInput(h,massProposal());h.holdParse();d.getElementById('authoring-validate').click();await until(h.parsePending);proposalInput(h,massProposal('Changed while native parse pending'));h.releaseParse();
  await until(()=>!d.getElementById('authoring-validate').disabled);assert.equal(d.getElementById('authoring-append').disabled,true);assert.equal(count(),1);assert.deepEqual(activeIDs(d),initialIDs);
  d.getElementById('authoring-validate').click();await until(()=>!d.getElementById('authoring-append').disabled);
  d.getElementById('authoring-proposal').value=JSON.stringify(massProposal('Changed without input event'));d.getElementById('authoring-append').click();await until(()=>d.getElementById('status').textContent.includes('Validate the proposal again'));assert.equal(count(),1);assert.deepEqual(activeIDs(d),initialIDs);
 }finally{h.window.close();}
});

test('remaining UI focused notation distinguishes definitions usages compartments and official typing markers',async()=>{
 const fixture={kind:'definition',nodes:[{id:'native-definition',semanticId:'definition',identityStatus:'mapped',name:'Device',kind:'part'},{id:'native-part',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{id:'native-typing',from:'native-part',to:'native-definition',kind:'typing',label:'typing'}]};
 const h=await harness({structuralFixture:true,focusedFixture:true,nativeView:fixture}),d=h.document;
 try{
  const mode=d.getElementById('rendering-mode');mode.value='focused';mode.dispatchEvent(new h.window.Event('change'));
  await until(()=>sceneSettled(d)&&d.querySelector('.focused-face'));
  const definition=manualTarget(d,'definition'),usage=manualTarget(d,'part');assert.equal(definition.querySelector('.focused-face').dataset.shape,'rectangle');assert.equal(usage.querySelector('.focused-face').dataset.shape,'rounded');
  assert.equal(definition.querySelector('.focused-keyword').textContent,'«part def»');assert.equal(usage.querySelector('.focused-keyword').textContent,'«part»');assert.match(usage.querySelector('.focused-name').textContent,/part : Device/);
  assert.ok([...definition.querySelectorAll('.focused-compartment-title')].some(n=>n.textContent==='attributes'));assert.ok([...definition.querySelectorAll('.focused-compartment-title')].some(n=>n.textContent==='parts'));
  assert.equal(definition.querySelector('.focused-compartment-line[data-semantic-id="mass-attribute"]').textContent,'mass');
  const edge=d.querySelector('#connections g[data-context="false"][data-kind="typing"]'),line=edge.querySelector('.edge-line:not(.edge-outgoing)');assert.equal(edge.dataset.source,'part');assert.equal(edge.dataset.target,'definition');assert.equal(line.getAttribute('stroke-dasharray'),null);assert.equal(line.getAttribute('marker-end'),'url(#edge-definition-two-dot)');
  assert.equal(d.querySelectorAll('marker#edge-definition-two-dot path').length,2,'hollow triangle and two native typing dots are both drawn');
  const before=[...d.querySelectorAll('.node')].map(n=>n.style.transform);usage.click();assert.deepEqual([...d.querySelectorAll('.node')].map(n=>n.style.transform),before);
 }finally{h.window.close();}
});
test('remaining UI focused ownership uses circled plus at native owner without reversing endpoints',async()=>{
 const fixture={kind:'definition',nodes:[{id:'native-package',semanticId:'Model',identityStatus:'mapped',name:'Model',kind:'package'},{id:'native-part',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{id:'native-owner',from:'native-package',to:'native-part',kind:'containment',label:'owns'}]};
 const h=await harness({structuralFixture:true,nativeView:fixture}),d=h.document;
 try{
  const mode=d.getElementById('rendering-mode');mode.value='focused';mode.dispatchEvent(new h.window.Event('change'));await until(()=>sceneSettled(d)&&d.querySelector('.focused-face'));
  const edge=d.querySelector('#connections g[data-context="false"][data-kind="containment"]'),line=edge.querySelector('.edge-line:not(.edge-outgoing)');assert.equal(edge.dataset.source,'Model');assert.equal(edge.dataset.target,'part');assert.equal(line.getAttribute('marker-start'),'url(#edge-owned-membership)');assert.equal(line.getAttribute('marker-end'),null);assert.equal(manualTarget(d,'Model').querySelector('.focused-face').dataset.shape,'package');
 }finally{h.window.close();}
});


test('remaining UI nested adjustment stays local then follows ancestor movement and survives portable import',async()=>{
 const fixture={kind:'interconnection',nodes:[{id:'compound-definition',semanticId:'definition',identityStatus:'mapped',name:'Device',kind:'part'},{id:'compound-sensor',semanticId:'sensor',identityStatus:'mapped',name:'sensor',kind:'part',parentId:'compound-definition'},{id:'r',semanticId:'req',identityStatus:'mapped',name:'req',kind:'requirement'}],edges:[{id:'native-owned-sensor',from:'compound-definition',to:'compound-sensor',kind:'composition',label:'part'},{id:'native-sensor-dependency',from:'compound-sensor',to:'r',kind:'dependency',label:'dependency'}]};
 const h=await harness({structuralFixture:true,nativeView:fixture,initialCount:3}),d=h.document;
 try{
  const root=()=>manualTarget(d,'definition'),child=()=>manualTarget(d,'sensor'),peer=()=>manualTarget(d,'req'),originalRoot=root().style.transform,originalChild=child().style.transform,stationary=peer().style.transform;
  const coords=node=>/translate\(([-.\d]+)px,([-.\d]+)px\)/.exec(node.style.transform).slice(1).map(Number),beforeRoot=coords(root()),beforeChild=coords(child()),close=(actual,expected)=>Math.abs(actual-expected)<.001;
  d.getElementById('adjust-layout').click();root().click();action(d,'Move right').click();await until(()=>sceneSettled(d)&&close(coords(root())[0],beforeRoot[0]+40));
  const afterRoot=coords(root()),afterChild=coords(child());assert.equal(afterChild[0]-beforeChild[0],40);assert.equal(afterRoot[1],beforeRoot[1]);assert.equal(afterChild[1],beforeChild[1]);assert.equal(peer().style.transform,stationary);
  child().click();assert.ok(action(d,'Move right'),'native child exposes safe local adjustment');action(d,'Move right').click();
  await until(()=>sceneSettled(d)&&close(coords(child())[0],afterChild[0]+8));assert.deepEqual(coords(root()),afterRoot);assert.equal(peer().style.transform,stationary);
  child().click();action(d,'Move down').click();await until(()=>sceneSettled(d)&&close(coords(child())[1],afterChild[1]+8));const nested=coords(child());assert.deepEqual(coords(root()),afterRoot);assert.equal(peer().style.transform,stationary);
  const moving=child();moving.onpointerdown(new h.window.MouseEvent('pointerdown',{button:0,clientX:100,clientY:100,bubbles:true,cancelable:true}));for(const name of ['pointermove','pointerup'])moving.dispatchEvent(new h.window.MouseEvent(name,{button:0,clientX:100,clientY:-500,bubbles:true,cancelable:true}));
  await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('parent content bounds'));assert.deepEqual(coords(child()),nested);assert.deepEqual(coords(root()),afterRoot);assert.equal(peer().style.transform,stationary);
  root().click();action(d,'Move right').click();await until(()=>sceneSettled(d)&&close(coords(root())[0],afterRoot[0]+40)&&close(coords(child())[0],nested[0]+40));
  const movedRoot=coords(root()),movedChild=coords(child());assert.equal(movedChild[1],nested[1]);assert.equal(peer().style.transform,stationary);
  const external=d.querySelector('#connections g[data-kind="dependency"][data-context="false"]');assert.equal(external.dataset.source,'sensor');assert.equal(external.dataset.target,'req');
  const project=await exportAndImport(h),layout=JSON.parse(fileText(project,'syspresent-layouts.json')),record=layout.views.find(v=>v.viewId==='Views::requirements');
  assert.ok(record.placements.some(p=>p.semanticId==='definition'));assert.ok(record.placements.some(p=>p.semanticId==='sensor'&&p.parentSemanticId==='definition'));
  await until(()=>sceneSettled(d)&&close(coords(root())[0],movedRoot[0])&&close(coords(child())[0],movedChild[0])&&close(coords(child())[1],movedChild[1]));assert.equal(peer().style.transform,stationary);
  d.getElementById('reset-layout').click();await until(()=>sceneSettled(d)&&root().style.transform===originalRoot&&child().style.transform===originalChild);assert.equal(peer().style.transform,stationary);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&close(coords(root())[0],movedRoot[0])&&close(coords(child())[0],movedChild[0]));
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&root().style.transform===originalRoot&&child().style.transform===originalChild);
 }finally{h.window.close();}
});

const focusedSourceCalls=h=>h.nativeCalls.filter(call=>call.method==='RenderView'&&Array.isArray(call.params.show));
const changeMode=(h,mode)=>{const select=h.document.getElementById('rendering-mode');select.value=mode;select.dispatchEvent(new h.window.Event('change'));};
test('integrated focused mode rerenders source views with exact native show flags and reuses only the loaded-model cache',async()=>{
 const h=await harness(),d=h.document;
 try{
  const parses=h.nativeCalls.filter(call=>call.method==='ParseSources').length,fetches=h.fetchCalls.length;
  changeMode(h,'focused');await until(()=>sceneSettled(d)&&d.querySelector('.focused-face')&&d.getElementById('status').textContent.includes('compliance is not established'));
  const calls=focusedSourceCalls(h);assert.equal(calls.length,1);assert.equal(calls[0].params.view,'Views::requirements');assert.equal(calls[0].params.modelHash,'fixture');assert.equal(calls[0].params.includeSemanticIdentity,true);
  assert.deepEqual([...calls[0].params.show],['parameter-symbols','port-symbols','typings','edge-labels']);assert.deepEqual(activeIDs(d),['part','req']);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&d.getElementById('rendering-mode').value==='exploratory'&&!d.querySelector('.focused-face'));
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&d.getElementById('rendering-mode').value==='focused'&&d.querySelector('.focused-face'));
  assert.equal(focusedSourceCalls(h).length,1,'same loaded native model reuses native profile response');assert.equal(h.nativeCalls.filter(call=>call.method==='ParseSources').length,parses);assert.equal(h.fetchCalls.length,fetches);
  assert.equal(d.querySelectorAll('#scenes option').length,1,'notation changes do not append slides');
  const imported=await exportAndImport(h);assert.equal(fileText(imported,'model.sysml'),files['model.sysml']);
  assert.equal(focusedSourceCalls(h).length,2,'loading a project creates a fresh native profile cache even when this mock model hash is unchanged');assert.ok(d.querySelector('.focused-face'));
 }finally{h.window.close();}
});
test('integrated focused native failures preserve scene selection geometry and history then permit a genuine retry',async()=>{
 const h=await harness(),d=h.document;
 try{
  manualTarget(d,'part').click();const positions=[...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),url=h.window.location.href,back=d.getElementById('explore-back').disabled;
  h.setNativeRender(params=>{if(params.show)throw Error('Native focused profile rejected fixture');});
  changeMode(h,'focused');await until(()=>d.getElementById('status').textContent.includes('Native focused profile rejected fixture'));
  assert.equal(d.getElementById('rendering-mode').value,'exploratory');assert.equal(d.querySelector('.focused-face'),null);assert.deepEqual(activeIDs(d),['part','req']);assert.deepEqual([...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),positions);
  assert.equal(manualTarget(d,'part').classList.contains('selected'),true);assert.equal(d.getElementById('explore-back').disabled,back);assert.equal(h.window.location.href,url);assert.equal(d.querySelectorAll('#scenes option').length,1);
  h.setNativeRender(undefined);changeMode(h,'focused');await until(()=>sceneSettled(d)&&d.querySelector('.focused-face')&&d.getElementById('status').textContent.includes('compliance is not established'));
  assert.equal(focusedSourceCalls(h).length,2,'failed native response is not cached as a successful rendering');
 }finally{h.window.close();}
});
test('integrated focused source membership cannot cross isolated package scope or replace the current native view',async()=>{
 const inside={kind:'requirement',nodes:[structuredClone(native.nodes[0])],edges:[]},h=await harness({structuralFixture:true,packageFixture:true,nativeView:inside,initialCount:1}),d=h.document;
 try{
  await pickPackage(h,'Model::Nested');const chooser=d.getElementById('view-navigation');chooser.value='authored:Views::requirements';chooser.dispatchEvent(new h.window.Event('change'));
  await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='req'&&chooser.value==='authored:Views::requirements');
  const before=[...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),back=d.getElementById('explore-back').disabled;
  h.setNativeRender(params=>params.show?structuredClone(native):undefined);changeMode(h,'focused');
  await until(()=>d.getElementById('status').textContent.includes('outside Nested'));
  assert.equal(d.getElementById('rendering-mode').value,'exploratory');assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');assert.deepEqual(activeIDs(d),['req']);assert.deepEqual([...d.querySelectorAll('#nodes .node')].map(node=>node.style.transform),before);assert.equal(d.getElementById('explore-back').disabled,back);
  assert.equal(d.querySelector('.focused-face'),null);assert.equal(focusedSourceCalls(h).at(-1).params.view,'Views::requirements');
 }finally{h.window.close();}
});
test('integrated delayed focused response cannot switch notation or membership after a newer package navigation',async()=>{
 const h=await harness({structuralFixture:true,packageFixture:true}),d=h.document;let release;
 try{
  h.setNativeRender(params=>params.show?new Promise(resolve=>{release=()=>resolve(structuredClone(native));}):undefined);
  changeMode(h,'focused');await until(()=>typeof release==='function');
  await pickPackage(h,'Model::Nested');await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='nested,req,run');
  release();await new Promise(resolve=>setTimeout(resolve,25));
  assert.equal(d.getElementById('rendering-mode').value,'exploratory');assert.equal(d.getElementById('scope-label').textContent,'Model::Nested');assert.deepEqual(activeIDs(d),['nested','req','run']);assert.equal(d.querySelector('.focused-face'),null);
 }finally{h.window.close();}
});
test('integrated sequence explicit widths and spacing retain identity and selection across history reset and source ZIP import',async()=>{
 const before=structuredClone(sequenceFixture),h=await harness({secondScene:true,secondView:sequenceFixture}),d=h.document;
 try{
  d.getElementById('next').click();await until(()=>d.querySelector('.sequence-view')&&sceneSettled(d));
  const input=()=>d.querySelector('.sequence-layout-fields input'),original=Number(input().value),order=()=>[...d.querySelectorAll('.sequence-message')].map(node=>node.dataset.semanticId),nativeOrder=order();
  const scroll=d.querySelector('.sequence-viewport');scroll.scrollTop=87;scroll.scrollLeft=41;scroll.dispatchEvent(new h.window.Event('scroll'));d.querySelector('.sequence-message').click();
  input().value='420';input().dispatchEvent(new h.window.Event('change'));await until(()=>d.getElementById('status').textContent.includes('Native region spacing saved'));
  assert.equal(Number(input().value),420);assert.equal(d.querySelector('.sequence-viewport').scrollTop,87);assert.equal(d.querySelector('.sequence-message').getAttribute('aria-pressed'),'true');assert.deepEqual(order(),nativeOrder);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&Number(input()?.value)===original);assert.equal(d.querySelector('.sequence-message').getAttribute('aria-pressed'),'true');
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&Number(input()?.value)===420);
  const gap=d.querySelector('[aria-label="Message spacing in pixels"]');gap.value='160';gap.dispatchEvent(new h.window.Event('change'));
  const project=await exportAndImport(h),layouts=JSON.parse(fileText(project,'syspresent-layouts.json')),record=layouts.regions.find(record=>record.viewId==='Views::other'&&record.viewKind==='sequence');
  assert.equal(record.layout.lanes[0].semanticId,'part');assert.equal(record.layout.lanes[0].representationId,'part-line');assert.equal(record.layout.lanes[0].width,420);assert.equal(record.layout.messageGap,160);assert.equal(fileText(project,'model.sysml'),files['model.sysml']);
  assert.doesNotMatch(JSON.stringify(record.layout),/selectedId|scrollTop|modelHash/);d.getElementById('next').click();await until(()=>sceneSettled(d)&&d.querySelector('.sequence-view')&&Number(input()?.value)===420);
  assert.equal(d.querySelector('[aria-label="Message spacing in pixels"]').value,'160');assert.deepEqual(order(),nativeOrder);
  d.querySelector('.sequence-layout-fields button').click();await until(()=>Number(input().value)===original);assert.equal(d.querySelector('[aria-label="Message spacing in pixels"]').value,'78');
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&Number(input()?.value)===420);assert.equal(d.querySelector('[aria-label="Message spacing in pixels"]').value,'160');
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&Number(input()?.value)===original);assert.deepEqual(order(),nativeOrder);assert.deepEqual(sequenceFixture,before);assert.equal(d.querySelectorAll('#scenes option').length,2);
 }finally{h.window.close();}
});
test('integrated matrix explicit native column width history reset and source ZIP import preserve every cell occurrence and direction',async()=>{
 const before=structuredClone(gridFixture),h=await harness({secondScene:true,secondView:gridFixture}),d=h.document;
 try{
  d.getElementById('next').click();await until(()=>d.querySelector('.canvas-grid-view')&&sceneSettled(d));
  const input=()=>d.querySelectorAll('.canvas-grid-widths input')[1],width=()=>d.querySelectorAll('.canvas-grid-table col')[1]?.style.width,rows=()=>[...d.querySelectorAll('.canvas-grid-table tbody tr')].map(row=>row.dataset.nativeRow),originalRows=rows();
  const scroll=d.querySelector('.canvas-grid-scroll');scroll.scrollTop=76;scroll.scrollLeft=34;scroll.dispatchEvent(new h.window.Event('scroll'));gridCell(d,0,1).click();
  input().value='380';input().dispatchEvent(new h.window.Event('change'));await until(()=>d.getElementById('status').textContent.includes('Native region spacing saved'));assert.equal(width(),'380px');assert.equal(d.querySelectorAll('.canvas-grid-inspector li').length,2);assert.equal(d.querySelector('.canvas-grid-scroll').scrollTop,76);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&width()==='200px');assert.equal(gridCell(d,0,1).getAttribute('aria-pressed'),'true');
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&width()==='380px');assert.deepEqual(rows(),originalRows);
  const project=await exportAndImport(h),layouts=JSON.parse(fileText(project,'syspresent-layouts.json')),record=layouts.regions.find(record=>record.viewId==='Views::other'&&record.viewKind==='matrix');
  assert.equal(record.layout.columns[0].semanticId,'req');assert.equal(record.layout.columns[0].index,1);assert.equal(record.layout.columns[0].width,380);assert.equal(fileText(project,'views.sysml'),files['views.sysml']);
  d.getElementById('next').click();await until(()=>sceneSettled(d)&&d.querySelector('.canvas-grid-view')&&width()==='380px');gridCell(d,0,1).click();assert.equal(d.querySelectorAll('.canvas-grid-inspector li').length,2);assert.match(d.querySelector('.canvas-grid-inspector').textContent,/part → req/);assert.deepEqual(rows(),originalRows);
  d.querySelector('.canvas-grid-reset-widths').click();await until(()=>width()==='200px');d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&width()==='380px');d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&width()==='200px');
  assert.deepEqual(gridFixture,before);assert.equal(d.querySelectorAll('#scenes option').length,2);
 }finally{h.window.close();}
});
test('integrated action adjustment exposes horizontal controls and persists no causal vertical displacement',async()=>{
 const fixture={kind:'action',nodes:[{id:'a',semanticId:'req',identityStatus:'mapped',name:'First native action',kind:'action'},{id:'b',semanticId:'part',identityStatus:'mapped',name:'Second native action',kind:'action'}],edges:[{id:'native-action-order',semanticId:'native-action-order',from:'a',to:'b',kind:'succession',label:'[enabled] native succession',guard:'enabled'}]},before=structuredClone(fixture),h=await harness({nativeView:fixture,behaviorFixture:true}),d=h.document;
 try{
  const target=()=>manualTarget(d,'part'),peer=()=>manualTarget(d,'req'),coords=node=>/translate\(([-.\d]+)px,\s*([-.\d]+)px/.exec(node.style.transform).slice(1).map(Number),original=coords(target()),stationary=peer().style.transform;
  d.getElementById('adjust-layout').click();target().click();assert.equal(action(d,'Move up').disabled,true);assert.equal(action(d,'Move down').disabled,true);assert.equal(action(d,'Move right').disabled,false);
  action(d,'Move down').click();assert.deepEqual(coords(target()),original);action(d,'Move right').click();await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('Drawing positions saved'));
  const moved=coords(target());assert.equal(moved[0]-original[0],40);assert.equal(moved[1],original[1]);assert.equal(peer().style.transform,stationary);
  const edge=d.querySelector('#connections g[data-context="false"][data-kind="succession"]');assert.equal(edge.dataset.source,'req');assert.equal(edge.dataset.target,'part');assert.match(edge.textContent,/enabled/);
  const project=await exportAndImport(h),layout=JSON.parse(fileText(project,'syspresent-layouts.json')),placement=layout.views.find(record=>record.viewId==='Views::requirements').placements.find(record=>record.semanticId==='part');assert.equal(placement.offset.y,0);
  await until(()=>sceneSettled(d)&&coords(target())[0]===moved[0]);assert.equal(coords(target())[1],original[1]);assert.equal(peer().style.transform,stationary);assert.deepEqual(fixture,before);
 }finally{h.window.close();}
});

test('guided history toolbar stays on the canvas through first move capture Back Home and reload and moves to the header only for exploration',async()=>{
 const fixture={kind:'interconnection',nodes:[structuredClone(native.nodes[1])],edges:[]},h=await harness({nativeView:fixture,nativeCaptureFixture:true,initialCount:1}),d=h.document;
 const controls=()=>d.getElementById('exploration-controls'),header=()=>d.getElementById('viewer-header'),nav=()=>header().querySelector('nav'),target=()=>manualTarget(d,'part');
 const guided=()=>{assert.equal(controls().parentElement,d.getElementById('canvas-tools'));assert.equal(controls().classList.contains('guided-history'),true);assert.equal(controls().closest('nav'),null);assert.equal(header().contains(controls()),false);assert.equal(nav().hidden,false);assert.equal(d.querySelectorAll('#exploration-controls').length,1);};
 const exploring=()=>{assert.equal(controls().parentElement,header());assert.equal(controls().classList.contains('guided-history'),false);assert.equal(controls().closest('nav'),null);assert.equal(controls().hidden,false);assert.equal(nav().hidden,true);assert.equal(d.querySelectorAll('#exploration-controls').length,1);};
 try{
  guided();assert.equal(controls().hidden,true);const headerChildren=[...header().children].map(node=>node.id||node.className),automatic=target().style.transform;
  d.getElementById('adjust-layout').click();target().click();action(d,'Move right').click();await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('Drawing positions saved'));
  const moved=target().style.transform;assert.notEqual(moved,automatic);guided();assert.equal(controls().hidden,false);assert.deepEqual([...header().children].map(node=>node.id||node.className),headerChildren,'first guided edit does not insert a new header row');
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&target().style.transform===automatic);guided();
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&target().style.transform===moved);guided();
  target().click();action(d,'Internal view').click();await until(h.pending);h.release();await until(()=>sceneSettled(d)&&d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part');exploring();
  d.getElementById('edit').click();d.getElementById('scene-title').value='Reusable guided layout';d.getElementById('capture-scene').click();
  await until(()=>sceneSettled(d)&&d.querySelectorAll('#scenes option').length===2&&!d.getElementById('editor').open&&target()?.dataset.representation==='captured-part-representation').catch(error=>{throw Error(error.message+': '+d.getElementById('status').textContent);});guided();
  const captured=target().style.transform;assert.equal(d.getElementById('narrative').hidden,false);
  if(d.getElementById('adjust-layout').getAttribute('aria-pressed')!=='true')d.getElementById('adjust-layout').click();target().click();action(d,'Move right').click();
  await until(()=>sceneSettled(d)&&target().style.transform!==captured&&d.getElementById('status').textContent.includes('Drawing positions saved'));guided();
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&target().style.transform===captured);guided();assert.equal(controls().hidden,false);
  d.getElementById('home').click();assert.equal(header().hidden,true);assert.equal(d.getElementById('stage').hidden,true);assert.ok(controls().closest('[hidden]'),'relocated controls are hidden with their viewer surface');
  d.getElementById('resume-model').click();await until(()=>sceneSettled(d)&&!d.getElementById('stage').hidden&&target()?.style.transform===captured);guided();assert.equal(header().hidden,false);
  d.getElementById('standalone').click();await until(()=>sceneSettled(d)&&d.getElementById('narrative').hidden&&!d.getElementById('workspace-controls').hidden);exploring();
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&!d.getElementById('narrative').hidden&&target()?.dataset.representation==='captured-part-representation');guided();
  const imported=await exportAndImport(h);assert.match(fileText(imported,'views/captured-views.sysml'),/view def Definition/);guided();assert.equal(header().hidden,false);assert.equal(d.getElementById('stage').hidden,false);
  d.getElementById('standalone').click();await until(()=>sceneSettled(d)&&d.getElementById('narrative').hidden&&!d.getElementById('workspace-controls').hidden);exploring();
  d.getElementById('home').click();assert.equal(header().hidden,true);assert.ok(controls().closest('[hidden]'));
  d.getElementById('resume-model').click();await until(()=>sceneSettled(d)&&!header().hidden&&!d.getElementById('stage').hidden);exploring();
  d.getElementById('return').click();await until(()=>sceneSettled(d)&&!d.getElementById('narrative').hidden);guided();
 }finally{h.window.close();}
});

test('sequence capture waits for a resize-restarted target before rebinding portable native lane identities',async()=>{
 const h=await harness({sequenceCaptureFixture:true}),d=h.document;
 try{
  d.getElementById('find-toggle').click();const search=d.getElementById('search');search.value='Model::exchange';search.dispatchEvent(new h.window.Event('input'));
  const exchange=[...d.querySelectorAll('#search-results button')].find(button=>button.textContent==='Model::exchange');assert.ok(exchange);exchange.click();
  await until(()=>sceneSettled(d)&&activeIDs(d).includes('exchange'));
  const chooser=d.getElementById('view-navigation');assert.ok([...chooser.options].some(option=>option.value==='native:sequence'),'native OccurrenceUsage offers sequence projection');chooser.value='native:sequence';chooser.dispatchEvent(new h.window.Event('change'));await until(h.pending);h.release();
  await until(()=>sceneSettled(d)&&d.querySelector('.sequence-view')&&h.nativeRequests.at(-1)==='#sequence:Model::exchange');
  const width=d.querySelector('.sequence-layout-fields input');width.value='460';width.dispatchEvent(new h.window.Event('change'));const gap=d.querySelector('[aria-label="Message spacing in pixels"]');gap.value='170';gap.dispatchEvent(new h.window.Event('change'));
  assert.equal(d.querySelector('.sequence-layout-fields input').value,'460');assert.equal(d.querySelector('[aria-label="Message spacing in pixels"]').value,'170');
  h.holdLayout();d.getElementById('edit').click();d.getElementById('scene-title').value='Sequence captured across resize';d.getElementById('capture-scene').click();
  await until(()=>h.layoutPendingCount()===1&&d.querySelectorAll('#scenes option').length===2);assert.equal(d.getElementById('editor').open,true);assert.equal(d.getElementById('stage').getAttribute('aria-busy'),'true');
  h.holdLayout();h.resize(990,680);await until(()=>h.layoutPendingCount()===2);
  h.releaseNextLayout();await new Promise(resolve=>setTimeout(resolve,35));
  assert.equal(h.layoutPendingCount(),1);assert.equal(d.getElementById('editor').open,true,'obsolete capture layout cannot complete capture while its replacement has not committed');assert.doesNotMatch(d.getElementById('status').textContent,/Native view captured\./);
  h.releaseLayout();await until(()=>sceneSettled(d)&&!d.getElementById('editor').open&&d.querySelector('.sequence-participant')?.dataset.representation==='captured-part-line'&&d.getElementById('status').textContent.startsWith('Native view captured.'));
  assert.equal(d.querySelector('.sequence-layout-fields input').value,'460');assert.equal(d.querySelector('[aria-label="Message spacing in pixels"]').value,'170');assert.equal(d.getElementById('scenes').value,'1');
  assert.deepEqual([...d.querySelectorAll('.sequence-participant')].map(node=>node.dataset.semanticId),['part','orphan']);assert.deepEqual([...d.querySelectorAll('.sequence-message')].map(node=>node.dataset.semanticId),['message-one','message-two']);
  d.getElementById('export-project').click();const download=h.downloads.at(-1),project=unpackProject(new Uint8Array(await download.blob.arrayBuffer())),saved=JSON.parse(fileText(project,'syspresent-layouts.json')),target=saved.regions.find(region=>region.viewId==='CanvasCaptured2::slide');
  assert.ok(target,'captured native sequence owns portable settings');assert.equal(target.viewKind,'sequence');assert.equal(target.layout.messageGap,170);assert.deepEqual(target.layout.lanes.map(lane=>[lane.semanticId,lane.representationId,lane.width]),[['part','captured-part-line',460]]);assert.equal(saved.regions.some(region=>region.viewId==='Views::requirements'),false,'initial requirement scene does not receive the sequence alias');
  assert.match(fileText(project,'views/captured-views.sysml'),/SequenceView/);assert.equal(fileText(project,'model.sysml'),files['model.sysml']);await new Promise(resolve=>setTimeout(resolve,35));assert.match(d.getElementById('status').textContent,/^Native view captured\./);
 }finally{h.window.close();}
});

test('focused native parameter pins generated after sizing retain canonical identities and supported glyphs across mode history',async()=>{
 const base={kind:'action',nodes:[{id:'first',semanticId:'req',identityStatus:'mapped',name:'First action',kind:'action'},{id:'owner',semanticId:'part',identityStatus:'mapped',name:'Parameterized action',kind:'action'}],edges:[]},profile=structuredClone(base);
 profile.nodes[1].ports=[
  {id:'incoming-pin',name:'incoming',semanticId:'parameter-in',qualifiedName:'Model::part::incoming',identityStatus:'mapped',parameter:true,direction:'in'},
  {id:'outgoing-pin',name:'outgoing',semanticId:'parameter-out',qualifiedName:'Model::part::outgoing',identityStatus:'mapped',parameter:true,direction:'out',side:'NORTH'},
  {id:'shared-pin',name:'shared',semanticId:'parameter-inout',qualifiedName:'Model::part::shared',identityStatus:'mapped',parameter:true,direction:'inout'},
 ];
 const before=structuredClone(profile),h=await harness({nativeView:base,behaviorFixture:true,parameterFixture:true}),d=h.document;
 const pin=id=>manualTarget(d,id),glyph=id=>pin(id)?.querySelector('.focused-face[data-shape="port-glyph"][data-supported="true"]');
 try{
  h.setNativeRender(params=>params.show?structuredClone(profile):undefined);changeMode(h,'focused');
  await until(()=>sceneSettled(d)&&['parameter-in','parameter-out','parameter-inout'].every(id=>glyph(id))&&d.getElementById('status').textContent.includes('compliance is not established'));
  for(const id of ['parameter-in','parameter-out','parameter-inout']){assert.equal(pin(id).dataset.semanticId,id);assert.match(pin(id).dataset.representation,/syspresent-native-port:/);assert.equal(glyph(id).dataset.notationSection,'8.2.3.17');assert.equal(glyph(id).querySelectorAll('svg.focused-symbol rect').length,1,'native parameter role adds the parameter box');assert.ok(glyph(id).querySelector('svg.focused-symbol path'));}
  for(const [id,name]of [['parameter-in','incoming'],['parameter-out','outgoing'],['parameter-inout','shared']])assert.ok(pin(id).getAttribute('aria-label').includes(name),'native pin name remains accessible even if no safe label slot exists');
  if(['parameter-in','parameter-out','parameter-inout'].some(id=>!pin(id).querySelector('.port-name'))){assert.equal(d.getElementById('context-details').hidden,false,'withheld native pin labels require an explicit rendering notice');d.getElementById('context-details').click();assert.match(d.getElementById('information-text').textContent,/native pin label|beside this native pin|retained text/i);d.getElementById('information').close();}
  assert.equal(glyph('parameter-in').querySelector('svg').style.transform,'rotate(360deg)','native input defaults to WEST and points into its owner');assert.equal(glyph('parameter-out').querySelector('svg').style.transform,'rotate(270deg)','explicit native NORTH attachment takes precedence over output default');assert.equal(glyph('parameter-inout').querySelector('svg').style.transform,'rotate(0deg)','native inout defaults to EAST');
  assert.match(glyph('parameter-inout').querySelector('svg path').getAttribute('d'),/M6 20 L14 12.*M34 20 L26 12/,'native inout retains both arrow directions');
  const representations=['parameter-in','parameter-out','parameter-inout'].map(id=>pin(id).dataset.representation);assert.equal(focusedSourceCalls(h).at(-1).params.includeSemanticIdentity,true);assert.deepEqual(profile,before);
  d.getElementById('explore-back').click();await until(()=>sceneSettled(d)&&d.getElementById('rendering-mode').value==='exploratory'&&!d.querySelector('.focused-face'));assert.equal(pin('parameter-in'),null,'exploratory source membership is not replaced with cached focused pins');
  d.getElementById('explore-forward').click();await until(()=>sceneSettled(d)&&d.getElementById('rendering-mode').value==='focused'&&glyph('parameter-inout'));
  assert.deepEqual(['parameter-in','parameter-out','parameter-inout'].map(id=>pin(id).dataset.representation),representations);assert.ok(glyph('parameter-in'));assert.ok(glyph('parameter-out'));assert.equal(d.querySelectorAll('#scenes option').length,1);
 }finally{h.window.close();}
});

test('repeated project edits release obsolete native models and preserve the current model on rejection',async()=>{
 const h=await harness({lifecycleFixture:true}),d=h.document;
 try{
  await until(()=>h.nativeModels.size===1);
  const current=()=>[...h.nativeModels][0],initial=current();
  for(let i=0;i<3;i++){
   d.getElementById('edit').click();d.getElementById('view-source').value='package Views { /* edit '+i+' */ }';d.getElementById('apply-views').click();
   await until(()=>!d.getElementById('editor').open&&sceneSettled(d)&&h.nativeModels.size===1&&current()!==initial);
  }
  const retained=current();d.getElementById('edit').click();d.getElementById('view-source').value='BROKEN';d.getElementById('apply-views').click();
  await until(()=>d.getElementById('editor-error').textContent.includes('Native parse rejected')&&h.nativeModels.size===1);
  assert.equal(current(),retained);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
  assert.ok(h.nativeCalls.filter(call=>call.method==='ReleaseModel').length>=5);
 }finally{h.window.close();}
});

test('closing a validated native authoring preview releases its candidate but keeps the project',async()=>{
 const h=await harness({lifecycleFixture:true,authoringFixture:true}),d=h.document;
 try{
  const current=[...h.nativeModels][0];d.querySelector('[data-semantic-id="part"]').click();d.getElementById('edit').click();d.getElementById('author-native-slide').click();d.getElementById('authoring-validate').click();
  await until(()=>!d.getElementById('authoring-append').disabled&&h.nativeModels.size===2);
  d.getElementById('authoring-dialog').close();
  await until(()=>h.nativeModels.size===1);assert.equal([...h.nativeModels][0],current);
  assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
 }finally{h.window.close();}
});

test('a discarded delayed project parse releases the candidate and preserves Resume',async()=>{
 const h=await harness({lifecycleFixture:true}),d=h.document;
 try{
  const retained=[...h.nativeModels][0];h.holdParse();d.getElementById('edit').click();d.getElementById('view-source').value='package Views { /* stale edit */ }';d.getElementById('apply-views').click();await until(h.parsePending);
  d.getElementById('home').click();h.releaseParse();await until(()=>h.nativeModels.size===1);
  assert.equal([...h.nativeModels][0],retained);assert.equal(d.getElementById('landing').hidden,false);
  d.getElementById('resume-model').click();await until(()=>d.getElementById('landing').hidden&&sceneSettled(d));assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
 }finally{h.window.close();}
});

test('failed initial layout restores the preceding project, native model and URL',async()=>{
 const h=await harness({lifecycleFixture:true}),d=h.document;
 try{
  const retained=[...h.nativeModels][0],url=h.window.location.href,title=d.title;
  h.holdLayout();d.getElementById('edit').click();d.getElementById('view-source').value='package Views { /* layout rejected */ }';d.getElementById('apply-views').click();await until(h.layoutPending);
  assert.ok(h.nativeModels.has(retained),'previous native model stays owned through first drawing');
  h.releaseLayout('Rejected initial layout');await until(()=>d.getElementById('editor-error').textContent.includes('Rejected initial layout')&&h.nativeModels.size===1&&sceneSettled(d));
  assert.equal([...h.nativeModels][0],retained);assert.equal(h.window.location.href,url);assert.equal(d.title,title);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
  d.querySelector('[data-semantic-id="part"]').click();assert.match(d.getElementById('selection').textContent,/part/);
 }finally{h.window.close();}
});

test('Home during initial layout rolls the tentative project back before Resume',async()=>{
 const h=await harness({lifecycleFixture:true}),d=h.document;
 try{
  const retained=[...h.nativeModels][0];
  h.holdLayout();d.getElementById('edit').click();d.getElementById('view-source').value='package Views { /* canceled drawing */ }';d.getElementById('apply-views').click();await until(h.layoutPending);
  d.getElementById('home').click();h.releaseLayout();await until(()=>h.nativeModels.size===1&&d.getElementById('landing').hidden===false);
  assert.equal([...h.nativeModels][0],retained);assert.equal(d.getElementById('resume-model').hidden,false,'Resume is visibly available after tentative display rollback');
  d.getElementById('resume-model').click();await until(()=>d.getElementById('landing').hidden&&sceneSettled(d));assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
 }finally{h.window.close();}
});

test('resized initial layout keeps the previous native model until the replacement commits or rolls back',async()=>{
 const h=await harness({lifecycleFixture:true}),d=h.document;
 try{
  const retained=[...h.nativeModels][0],url=h.window.location.href;
  h.holdLayout();d.getElementById('edit').click();d.getElementById('view-source').value='package Views { /* resized first drawing */ }';d.getElementById('apply-views').click();await until(()=>h.layoutPendingCount()===1);
  h.holdLayout();h.resize(990,680);await until(()=>h.layoutPendingCount()===2);
  h.releaseNextLayout();await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(h.layoutPendingCount(),1);assert.equal(d.getElementById('editor').open,true);assert.ok(h.nativeModels.has(retained),'superseded initial attempt cannot release preceding native model');
  assert.equal(h.nativeModels.size,2);h.releaseNextLayout('Rejected resized initial layout');
  await until(()=>d.getElementById('editor-error').textContent.includes('Rejected resized initial layout')&&h.nativeModels.size===1&&sceneSettled(d));
  assert.equal([...h.nativeModels][0],retained);assert.equal(h.window.location.href,url);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');
  assert.equal(d.getElementById('resume-model').hidden,false);
 }finally{h.window.close();}
});


test('loading failure exposes a genuine single retry and never claims ready before its first view',async()=>{
 const h=await harness({landingOnly:true}),d=h.document;let failed=false;
 try{
  h.setFetch(async url=>{if(url.includes('project.zip')&&!failed){failed=true;return {ok:false,status:503};}});
  d.querySelector('[data-demo="blue-dog"]').click();
  await until(()=>!d.getElementById('loading-error').hidden&&d.getElementById('loading-error').textContent.includes('503'));
  assert.equal(d.getElementById('loading').hidden,false);assert.equal(d.getElementById('loading-progress').hidden,true);
  assert.equal(d.getElementById('loading-retry').hidden,false);assert.equal(d.getElementById('landing').hidden,false);
  const before=h.fetchCalls.filter(url=>url.includes('project.zip')).length;
  d.getElementById('loading-retry').click();d.getElementById('loading-retry').click();
  await until(()=>d.getElementById('status').textContent.startsWith('OpenSysML WASM')&&d.getElementById('stage').getAttribute('aria-busy')!=='true');
  assert.equal(h.fetchCalls.filter(url=>url.includes('project.zip')).length,before+1);
  assert.equal(d.getElementById('loading').hidden,true);assert.ok(activeIDs(d).length);
 }finally{h.window.close();}
});
test('canceling a pending project download aborts it and late completion cannot replace the next demo',async()=>{
 const h=await harness({landingOnly:true}),d=h.document;let reply,signal;
 try{
  h.setFetch((url,options)=>{if(url.includes('project.zip')){signal=options.signal;return new Promise(resolve=>{reply=()=>resolve({ok:true,arrayBuffer:async()=>new ArrayBuffer(0)});});}});
  d.querySelector('[data-demo="blue-dog"]').click();await until(()=>reply&&!d.getElementById('loading').hidden);
  d.getElementById('loading-cancel').click();assert.equal(signal.aborted,true);assert.equal(d.getElementById('loading').hidden,true);
  d.querySelector('[data-demo="flashlight"]').click();
  await until(()=>d.getElementById('status').textContent.startsWith('OpenSysML WASM')&&d.getElementById('stage').getAttribute('aria-busy')!=='true');
  const ready=d.getElementById('status').textContent,ids=activeIDs(d),url=h.window.location.href;
  reply();await new Promise(resolve=>setTimeout(resolve,30));
  assert.equal(d.getElementById('status').textContent,ready);assert.deepEqual(activeIDs(d),ids);assert.equal(h.window.location.href,url);
  assert.match(url,/demo=flashlight/);assert.equal(d.getElementById('loading').hidden,true);
 }finally{h.window.close();}
});


test('capture load retry completes the exact target and original continuation without duplicating a native slide',async()=>{
 const h=await harness({nativeCaptureFixture:true}),d=h.document;
 try{
  manualTarget(d,'part').click();action(d,'Internal view').click();await until(h.pending);h.release();await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='part');
  d.getElementById('adjust-layout').click();manualTarget(d,'part').click();action(d,'Move right').click();await until(()=>sceneSettled(d)&&d.getElementById('status').textContent.includes('Drawing positions saved'));
  const sourcePosition=manualTarget(d,'part').style.transform;
  d.getElementById('edit').click();d.getElementById('scene-title').value='Retry captured view';h.holdLayout();d.getElementById('capture-scene').click();await until(h.layoutPending);h.releaseLayout('capture layout unavailable');
  await until(()=>d.getElementById('loading-error').textContent.includes('capture layout unavailable'));
  assert.equal(d.querySelectorAll('#scenes option').length,1);assert.equal(d.getElementById('editor').open,true);
  d.getElementById('loading-retry').click();d.getElementById('loading-retry').click();
  await until(()=>sceneSettled(d)&&!d.getElementById('editor').open&&d.getElementById('status').textContent.startsWith('Native view captured'));
  assert.equal(d.getElementById('scenes').value,'1');assert.equal(d.querySelectorAll('#scenes option').length,2);assert.equal(d.getElementById('loading').hidden,true);
  assert.equal(manualTarget(d,'part').dataset.representation,'captured-part-representation');assert.ok(sourcePosition);
 }finally{h.window.close();}
});
test('canceling a held capture target cannot append or close over a resumed previous project',async()=>{
 const h=await harness({nativeCaptureFixture:true}),d=h.document;
 try{
  manualTarget(d,'part').click();action(d,'Internal view').click();await until(h.pending);h.release();await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='part');
  const previous=activeIDs(d);d.getElementById('edit').click();d.getElementById('scene-title').value='Canceled capture';h.holdLayout();d.getElementById('capture-scene').click();await until(h.layoutPending);
  d.getElementById('loading-cancel').click();h.releaseLayout();await until(()=>!d.getElementById('landing').hidden&&!d.getElementById('resume-model').hidden);
  d.getElementById('resume-model').click();await until(()=>d.getElementById('landing').hidden&&sceneSettled(d)&&d.querySelectorAll('#scenes option').length===1&&d.getElementById('status').textContent.startsWith('OpenSysML WASM'));
  const ready=d.getElementById('status').textContent;await new Promise(resolve=>setTimeout(resolve,30));
  assert.deepEqual(activeIDs(d),previous);assert.equal(d.querySelectorAll('#scenes option').length,1);assert.equal(d.getElementById('editor').open,false);assert.equal(d.getElementById('loading').hidden,true);assert.match(ready,/OpenSysML WASM/);
 }finally{h.window.close();}
});


test('Resume rebuilds the retained project when its own worker died even if a failed replacement created a healthy engine',async()=>{
 const h=await harness({lifecycleFixture:true}),d=h.document;
 try{
  h.failWorker();d.getElementById('edit').click();d.getElementById('view-source').value+=' BROKEN';d.getElementById('apply-views').click();
  await until(()=>d.getElementById('loading-error').textContent.includes('Native parse rejected'));
  const afterFailure=h.nativeCalls.filter(c=>c.method==='ParseSources').length;
  d.getElementById('loading-cancel').click();d.getElementById('resume-model').click();
  await until(()=>d.getElementById('landing').hidden&&sceneSettled(d)&&d.getElementById('status').textContent.startsWith('OpenSysML WASM'));
  assert.ok(h.nativeCalls.filter(c=>c.method==='ParseSources').length>afterFailure);
  manualTarget(d,'part').click();action(d,'Internal view').click();await until(h.pending);h.release();
  await until(()=>sceneSettled(d)&&activeIDs(d).join(',')==='part');assert.equal(d.getElementById('loading').hidden,true);
 }finally{h.window.close();}
});
