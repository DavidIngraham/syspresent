import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {adaptNativeView,modelGraph} from '../src/canvas-prototype/graph.mjs';
import {documentsFor,fileText,packProject,unpackProject,parseStory} from '../src/canvas-prototype/project.mjs';
import {nativeViewDefinitionSource,assertExactNativeProjection,prepareNativeCapture,prepareQuestionSlide} from '../src/canvas-prototype/conversation.mjs';

test('native capture separates reusable definition, usage exposure and rendering extension',()=>{
 const source=nativeViewDefinitionSource({packageName:'Captured',qualifiedNames:['Test::two words'],kinds:['RequirementUsage']});
 assert.match(source,/view def Definition :> GeneralView/);assert.match(source,/filter @SysML::RequirementUsage/);
 assert.match(source,/view slide : Definition \{/);assert.match(source,/expose 'Test'::'two words'/);
 assert.ok(source.indexOf('expose')>source.indexOf('view slide'));
 for(const options of [{packageName:'Bad;Name'},{name:'bad;name'},{definition:'FakeView'},{kinds:['PartUsage; expose X']}])assert.throws(()=>nativeViewDefinitionSource({packageName:'Captured',qualifiedNames:['Test::x'],...options}));
});
test('exact capture checks directed relationships, occurrence count and native identity',()=>{
 const view={nodes:[{id:'a',semanticId:'one'},{id:'b',semanticId:'two'}],edges:[{from:'a',to:'b',kind:'satisfy'}]};
 assertExactNativeProjection(view,{...view,nodes:[...view.nodes].reverse()});
 for(const edges of [[{from:'b',to:'a',kind:'satisfy'}],[{from:'a',to:'b',kind:'verify'}],[...view.edges,...view.edges]])assert.throws(()=>assertExactNativeProjection(view,{...view,edges}),/cannot yet be captured faithfully/);
 assert.throws(()=>assertExactNativeProjection(view,{...view,nodes:[...view.nodes,{id:'c',semanticId:'extra'}]}),/cannot yet/);
});
test('explicit questions require actual submission text and never mutate on engine failure',async()=>{
 assert.throws(()=>prepareQuestionSlide({},{}),/explicit question/);
 const project=await readProjectDirectory(resolve('examples/canvas-prototype')),before=structuredClone(project);
 await assert.rejects(prepareNativeCapture(project,{view:{id:'x',nodes:[{id:'n',semanticId:'x'}]},focus:'x',graph:{elements:[{id:'x',qualifiedName:'Flashlight::portable',kind:'RequirementUsage'}]},engine:{call:async()=>{throw Error('native failed');}}}),/native failed/);
 assert.deepEqual(project,before);
});

function nativeClient(binary){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)break;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)break;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
 for(const event of ['error','exit'])child.on(event,error=>{for(const job of pending.values())job.reject(Error(String(error)));pending.clear();});
 return {call(method,params={}){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
const binary=resolve(process.env.SYSPRESENT_NATIVE_ENGINE??'build/canvas-prototype/engine/sysml-native');
test('native reusable capture resolves, appends questions and round-trips without pinning model version',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const project=await readProjectDirectory(resolve('examples/canvas-prototype')),original=structuredClone(project);
  const parsed=await engine.call('ParseSources',{documents:documentsFor(project)}),exported=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),graph=modelGraph(exported.elements);
  const raw=await engine.call('RenderView',{modelHash:parsed.modelHash,view:'#action:Flashlight::turnOn',includeSemanticIdentity:true});
  const view=adaptNativeView(raw,'#action:Flashlight::turnOn');view.capture={definition:'ActionFlowView',root:'Flashlight::turnOn'};
  const options={view,graph,focus:'Flashlight__turnOn',views:new Map(),engine};
  const internal=adaptNativeView(await engine.call('RenderView',{modelHash:parsed.modelHash,view:'#interconnection:Flashlight::light',includeSemanticIdentity:true}),'#interconnection:Flashlight::light');
  internal.capture={definition:'InterconnectionView',root:'Flashlight::light'};
  const internalCapture=await prepareNativeCapture(project,{...options,view:internal,focus:'Flashlight__light'});assert.match(internalCapture.source,/view def Definition :> InterconnectionView/);
  const declared=adaptNativeView(await engine.call('RenderView',{modelHash:parsed.modelHash,view:'CanvasViews::operation',includeSemanticIdentity:true}),'CanvasViews::operation');
  const declaredCapture=await prepareQuestionSlide(project,{...options,view:declared,views:new Map([[declared.id,declared]]),question:'How does the declared operation work?'});
  assert.equal(declaredCapture.source,undefined);assert.equal(declaredCapture.scene.view,'CanvasViews::operation');
  const first=await prepareQuestionSlide(project,{...options,question:'How does turnOn work?'});
  assert.deepEqual(project,original);assert.match(first.source,/view def Definition :> ActionFlowView/);
  assert.equal(first.scene.question,'How does turnOn work?');assert.equal(first.scene.allowDisconnected,true);
  const second=await prepareQuestionSlide(first.project,{...options,question:'What does turnOn contain?'});
  assert.equal(parseStory(fileText(second.project,second.project.manifest.story)).length,parseStory(fileText(project,project.manifest.story)).length+2);
  assert.notEqual(first.scene.id,second.scene.id);
  const roundtrip=unpackProject(packProject(second.project));assert.equal(fileText(roundtrip,'model.sysml'),fileText(project,'model.sysml'));
  const fresh=await engine.call('ParseSources',{documents:documentsFor(roundtrip)});assert.equal((fresh.diagnostics??[]).length,0);
  const freshView=adaptNativeView(await engine.call('RenderView',{modelHash:fresh.modelHash,view:first.viewName,includeSemanticIdentity:true}),first.viewName);assertExactNativeProjection(view,freshView);
  // A later source edit is resolved afresh; the saved native selection has no model hash.
  const changed=structuredClone(roundtrip);changed.files['model.sysml']=fileText(changed,'model.sysml').replace('action turnOn {','action turnOn {\n        action inspectAdded;');
  const changedParse=await engine.call('ParseSources',{documents:documentsFor(changed)});assert.equal((changedParse.diagnostics??[]).length,0);
  const changedView=await engine.call('RenderView',{modelHash:changedParse.modelHash,view:first.viewName,includeSemanticIdentity:true});assert.ok(changedView.nodes.some(node=>node.name==='inspectAdded'));
  const leaf={id:'explore:portable',nodes:[{id:'n',semanticId:'Flashlight__portable'}],edges:[]};
  const leafCapture=await prepareNativeCapture(project,{...options,view:leaf,focus:'Flashlight__portable'});assert.match(leafCapture.source,/filter @SysML::RequirementUsage/);
  const part={id:'explore:light',nodes:[{id:'n',semanticId:'Flashlight__light'}],edges:[]};
  const partCapture=await prepareNativeCapture(project,{...options,view:part,focus:'Flashlight__light'});assert.ok(partCapture.source);
  const invented={...leaf,edges:[{source:'n',target:'n',kind:'satisfy'}]};
  await assert.rejects(prepareNativeCapture(project,{...options,view:invented,focus:'Flashlight__portable'}),/cannot yet be captured faithfully/);
  assert.deepEqual(project,original);
 }finally{engine.close();}
});
