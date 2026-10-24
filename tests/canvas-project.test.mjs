import {fileURLToPath} from 'node:url';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {validateProject,packProject,unpackProject,parseStory,writeStory,documentsFor,captureViewSource,projectPath,appendScene,fileText} from '../src/canvas-prototype/project.mjs';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {modelGraph,adaptNativeView,requireNativeIdentity} from '../src/canvas-prototype/graph.mjs';
async function example(){return readProjectDirectory(fileURLToPath(new URL('../examples/canvas-prototype/',import.meta.url)));}
test('ordinary project ZIP and Markdown round-trip without changing system sources',async()=>{const project=await example();validateProject(project);const original=fileText(project,'model.sysml'),scenes=parseStory(fileText(project,'story.md'));appendScene(project,{...scenes[0],id:'captured',title:'Captured native view'});const roundtrip=unpackProject(packProject(project));assert.equal(fileText(roundtrip,'model.sysml'),original);assert.deepEqual(parseStory(fileText(roundtrip,'story.md')),parseStory(fileText(project,'story.md')));assert.deepEqual(documentsFor(roundtrip),documentsFor(project));});
test('project boundaries, missing assets and malformed scene references fail explicitly',async()=>{for(const name of ['../secret','/root/a','a\\b','C:/x','a//b'])assert.throws(()=>projectPath(name));const p=await example();delete p.files['views.sysml'];assert.throws(()=>validateProject(p),/Missing project file/);assert.throws(()=>parseStory('```syspresent\n{"type":"scene","id":"x"}\n```'),/requires/);});
test('captured view references native qualified identities and writes declarative SysML',()=>{const source=captureViewSource({name:'scene4',qualifiedNames:['A::one','A::two words','A::one']});assert.match(source,/view scene4 : GeneralView/);assert.equal((source.match(/expose/g)||[]).length,2);assert.ok(source.includes("'A'::'two words'"));});
test('explicit native engineering roles preserve direction; typing is not a route shortcut',()=>{const raw=[{'@id':'a','@type':'PartUsage',declaredName:'satisfy fake',ownedMember:[{'@id':'p'}]},{'@id':'p','@type':'PartUsage',type:[{'@id':'t'}]},{'@id':'t','@type':'PartDefinition'},{'@id':'d','@type':'Dependency',client:[{'@id':'p'}],supplier:[{'@id':'a'}]}];const graph=modelGraph(raw);assert.ok(graph.relationships.some(e=>e.kind==='composition'&&e.source==='a'&&e.target==='p'));assert.ok(graph.relationships.some(e=>e.kind==='dependency'&&e.source==='p'&&e.target==='a'));assert.ok(!graph.relationships.some(e=>e.kind==='satisfy'));});
test('native control symbols remain synthetic, not assigned a fabricated identity',()=>{const v=adaptNativeView({kind:'action',nodes:[{id:'n',identity_status:'synthetic',kind:'initial'}],edges:[]},'test');assert.equal(requireNativeIdentity(v).nodes[0].semanticId,undefined);assert.throws(()=>requireNativeIdentity(adaptNativeView({nodes:[{id:'x',kind:'action'}]},'test')),/identity missing/);});

import {graphView} from '../src/canvas-prototype/graph.mjs';
import {projectView} from '../src/canvas-prototype/core/index.mjs';
test('focused graph edges use drawing endpoints while retaining semantic endpoints',()=>{
 const graph={elements:[{id:'r',name:'Requirement',kind:'RequirementUsage'},{id:'p',name:'Part',kind:'PartUsage'}],relationships:[{id:'s',source:'p',target:'r',kind:'satisfy'}]};
 const view=projectView(graphView(graph,graph));
 assert.equal(view.edges[0].source,'gv:p');assert.equal(view.edges[0].target,'gv:r');assert.equal(view.edges[0].semanticSource,'p');
});

test('native activity capture retains the declared notation and exposes only its root',()=>{
 const source=captureViewSource({name:'activity',qualifiedNames:['Flashlight::turnOn'],definition:'ActionFlowView'});
 assert.match(source,/view activity : ActionFlowView/);assert.equal((source.match(/expose/g)||[]).length,1);
 assert.throws(()=>captureViewSource({packageName:'Bad;Name',name:'x',qualifiedNames:['A']}),/package name/);
});

import {fitNodes,graphArea} from '../src/canvas-prototype/geometry.mjs';
test('fit excludes unused origin space and reserves the narrative on either axis',()=>{
 for(const panel of [{x:12,y:420,width:976,height:180},{x:680,y:16,width:300,height:220}]){
  const area=graphArea(1000,700,[panel]);const a=fitNodes([{id:'root',x:16,y:900,width:368,height:540}],area),b=fitNodes([{id:'root',x:0,y:0,width:368,height:540}],area);
  assert.equal(a.scale,b.scale);const r=a.nodes[0];assert.ok(r.x>=area.x&&r.y>=area.y&&r.x+r.width<=area.x+area.width+.001&&r.y+r.height<=area.y+area.height+.001);
 }
});

import {layoutScene} from '../src/canvas-prototype/core/index.mjs';
test('requirements sit above their satisfying design while the native arrow still points upward',()=>{
 const layout=layoutScene({kind:'requirement',nodes:[{id:'p',name:'Part'},{id:'r',name:'Requirement'}],edges:[{from:'p',to:'r',kind:'satisfy'}]},{width:1000,height:700});
 assert.ok(layout.nodes.find(n=>n.id==='r').y<layout.nodes.find(n=>n.id==='p').y);assert.equal(layout.edges[0].source,'p');assert.equal(layout.edges[0].target,'r');
});

import {mkdtemp,rm,readFile as readBytes} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {retainSnapshot} from '../scripts/canvas_snapshot.mjs';
test('a changed build cannot rewrite a retained snapshot',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'syspresent-snapshot-'));
 try{const a=await retainSnapshot(directory,Buffer.from('reviewed'));const b=await retainSnapshot(directory,Buffer.from('new'));const again=await retainSnapshot(directory,Buffer.from('reviewed'));assert.notEqual(a.id,b.id);assert.equal(a.path,again.path);assert.equal((await readBytes(a.path)).toString(),'reviewed');}finally{await rm(directory,{recursive:true,force:true});}
});

test('narrow activity layout keeps parallel branches beside each other instead of suggesting a sequence',()=>{
 const view={kind:'action',nodes:[{id:'root',kind:'action'},{id:'fork',kind:'fork',parent:'root'},{id:'power',kind:'action',parent:'root'},{id:'temperature',kind:'action',parent:'root'},{id:'join',kind:'join',parent:'root'}],edges:[{from:'fork',to:'power',kind:'succession'},{from:'fork',to:'temperature',kind:'succession'},{from:'power',to:'join',kind:'succession'},{from:'temperature',to:'join',kind:'succession'}]};
 const layout=layoutScene(view,{width:390,height:700,panels:[{x:12,y:500,width:366,height:140}]});const power=layout.nodes.find(n=>n.id==='power'),temperature=layout.nodes.find(n=>n.id==='temperature');assert.equal(power.y,temperature.y);assert.notEqual(power.x,temperature.x);
});

import {documentationFor} from '../src/canvas-prototype/documentation.mjs';
test('requirement usages retain the complete native definition statement and its origin',()=>{
 const body='The autonomous vessel shall keep its safety functions available. '.repeat(12);
 const graph={elements:[{id:'usage',native:{type:[{'@id':'definition'}]}},{id:'definition',qualifiedName:'System::Safety',description:body}]};
 const statement=documentationFor(graph,'usage');assert.equal(statement.text,body);assert.equal(statement.source.id,'definition');assert.equal(documentationFor(graph,'missing').text,'');
});

import {webcrypto,createHash} from 'node:crypto';
import {sourceDigest,verifiedRuntimeCache} from '../src/canvas-prototype/project.mjs';
test('prepared native cache requires publisher hash, exact sources, engine and native model identity',async()=>{
 const originalCrypto=Object.getOwnPropertyDescriptor(globalThis,'crypto');Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});
 try{
  const documents=[{name:'model.sysml',content:'package Test {}'}];
  const cache={schemaVersion:'syspresent.native-cache.v1',engineVersion:'pinned-engine',engineFingerprint:'binary-hash',modelHash:'native-model',sourceDigest:await sourceDigest(documents),exported:{elements:[]}};
  const bytes=new TextEncoder().encode(JSON.stringify(cache));
  const project={manifest:{runtimeCache:'runtime-cache.json'},files:{'runtime-cache.json':bytes}};
  const options={trustedHash:createHash('sha256').update(bytes).digest('hex'),engineVersion:'pinned-engine',engineFingerprint:'binary-hash',modelHash:'native-model',documents};
  assert.deepEqual(await verifiedRuntimeCache(project,options),cache);
  for(const change of [{trustedHash:undefined},{trustedHash:'forged'},{engineVersion:'other'},{engineFingerprint:'different-binary'},{modelHash:'changed'},{documents:[{...documents[0],content:'package Changed {}'}]}])assert.equal(await verifiedRuntimeCache(project,{...options,...change}),null);
  project.files['runtime-cache.json']=new TextEncoder().encode(JSON.stringify({...cache,exported:{elements:[{'@id':'forged'}]}}));
  assert.equal(await verifiedRuntimeCache(project,options),null);
 }finally{if(originalCrypto)Object.defineProperty(globalThis,'crypto',originalCrypto);else delete globalThis.crypto;}
});

import {edgeRoute} from '../src/canvas-prototype/geometry.mjs';
test('wrapped requirement edges detour around intervening cards without reversing endpoints',()=>{
 const parent={id:'parent',x:26,y:30,width:280,height:170},upper={id:'upper',x:26,y:224,width:160,height:76},lower={id:'lower',x:26,y:324,width:160,height:76};
 const route=edgeRoute(lower,parent,[parent,upper,lower]);
 assert.deepEqual(route.points[0],{x:106,y:324});assert.deepEqual(route.points.at(-1),{x:166,y:200});assert.ok(route.points.some(p=>p.x<26||p.x>186));
 for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];assert.ok(!(a.x===b.x&&a.x>26&&a.x<186&&Math.min(a.y,b.y)<300&&Math.max(a.y,b.y)>224));}
});


test('native project ownership is a separate location graph without namespace or typing inference',()=>{
 const project=(id,kind,owner)=>({'@id':id,'@type':kind,'sysx:sourceLine':1,declaredName:id,...(owner?{owner:{'@id':owner},owningMembership:{'@id':id+'-membership'}}:{})});
 const graph=modelGraph([project('system','Package'),project('requirements','Package','system'),project('req','RequirementUsage','requirements'),project('member','OwningMembership','system'),project('doc','Documentation','req'),project('expr','OperatorExpression','req'),{'@id':'lib','@type':'PartDefinition'},project('instance','PartUsage','lib'),{...project('fake','PartUsage'),qualifiedName:'system::fake'}]);
 assert.deepEqual(graph.containment.map(e=>[e.source,e.target]),[['system','requirements'],['requirements','req']]);
 assert.equal(graph.containment[1].nativeRelationship,'req-membership');assert.ok(graph.containment.every(e=>e.navigationOnly&&e.nativeRole==='owner'&&e.authority==='native-api'));
 assert.equal(graph.relationships.some(e=>e.kind==='containment'),false);assert.equal(graph.containment.some(e=>e.target==='fake'),false);
});

test('package ownership includes source declarations beyond the engineering subset',()=>{
 const kinds=['EnumerationDefinition','ConcernUsage','MetadataDefinition','MetadataUsage','ViewUsage','ReferenceUsage','SatisfyRequirementUsage'];
 const raw=[{'@id':'package','@type':'Package','sysx:sourceLine':1},...kinds.map((kind,i)=>({'@id':kind,'@type':kind,owner:{'@id':'package'},'sysx:sourceLine':i+2})),...['Documentation','OwningMembership','FeatureReferenceExpression'].map(kind=>({'@id':kind,'@type':kind,owner:{'@id':'package'},'sysx:sourceLine':20}))];
 const g=modelGraph(raw);assert.deepEqual(g.containment.map(e=>e.target),kinds);assert.deepEqual(g.relationships,[]);
});
