import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {validateProjectStory} from '../scripts/canvas_story_validation.mjs';
import {documentsFor,fileText,packProject,unpackProject,parseStory,requirementCoverageSource,writeStory} from '../src/canvas-prototype/project.mjs';
import {discoverNativeIndex} from '../src/canvas-prototype/native-project.mjs';
import {modelGraph,adaptNativeView} from '../src/canvas-prototype/graph.mjs';
import {AUTHORING_SCHEMA,NARRATIVE_SCHEMA,AUTHORING_GATEWAY_SCHEMA,createJsonGatewayTransport,buildAuthoringContext,createOfflineAuthoringProposal,createAuthoringProvider,authoringProviderStatus,parseAuthoringProposal,validateNarrative,formatNativeValue,resolveNarrative,prepareAuthoringProposal,resolveAuthoredScene,authoringReferencedViews} from '../src/canvas-prototype/authoring.mjs';

const graph={elements:[{id:'part',kind:'PartUsage',qualifiedName:'Model::part',name:'satisfies everything',description:'A source statement.',native:{declaredName:'part','sysx:sourceText':'secret source'}},{id:'other',kind:'PartUsage',qualifiedName:'Model::other',name:'other',native:{}}],relationships:[{id:'dep',source:'part',target:'other',kind:'dependency',nativeRelationship:'native-dep'}]};
const starter=()=>createOfflineAuthoringProposal({graph,focus:'part',question:'What is this part?'});
test('unconfigured and offline authoring never call a transport',async()=>{
 for(const mode of ['unconfigured','offline']){let calls=0;const provider=createAuthoringProvider({mode,transport:async()=>{calls++;return starter();}});assert.equal(provider.status.state,mode);await assert.rejects(provider.generateProposal({question:'Question',context:buildAuthoringContext({graph,focus:'part'})}));assert.equal(calls,0);}
 assert.match(authoringProviderStatus().message,/No LLM provider/);assert.match(authoringProviderStatus('mock').message,/Mock/);
});
test('mock transport needs explicit data policy and receives only permitted focused metadata',async()=>{
 const context=buildAuthoringContext({graph,focus:'part'});let received,calls=0;
 const transport=async request=>{calls++;received=request;return JSON.stringify(starter());};
 await assert.rejects(createAuthoringProvider({mode:'mock',transport}).generateProposal({question:'Question',context}),/explicit.*data policy/);assert.equal(calls,0);
 const provider=createAuthoringProvider({mode:'mock',transport,privacy:{allowModelMetadata:true,fields:['identity']}}),result=await provider.generateProposal({question:'Question',context});
 assert.equal(result.origin,'mock');assert.equal(result.reviewRequired,true);assert.equal(calls,1);assert.equal(received.context.elements[0].documentation,undefined);assert.deepEqual(received.context.relationships,[]);assert.ok(!JSON.stringify(received).includes('secret source'));
 await assert.rejects(createAuthoringProvider({mode:'configured',transport,privacy:{allowModelMetadata:true,fields:['identity']}}).generateProposal({question:'Question',context}),/privacy decision/);assert.equal(calls,1);
 const controller=new AbortController();controller.abort();await assert.rejects(provider.generateProposal({question:'Question',context,signal:controller.signal}),/cancelled/);assert.equal(calls,1);
});
test('focused context follows actual directed links and scoped source documentation',()=>{
 const context=buildAuthoringContext({graph,focus:'part',scopeIds:['part']});assert.equal(context.elements.length,1);assert.equal(context.omittedRelationships,1);assert.deepEqual(context.relationships,[]);assert.equal(context.elements[0].documentation,'A source statement.');assert.ok(!JSON.stringify(context).includes('secret source'));
 const proposal=starter();assert.equal(proposal.narrative.template,'{{statement}}');assert.equal(proposal.relationshipClaims.length,0);assert.deepEqual(proposal.view.expose,['part']);
 assert.throws(()=>buildAuthoringContext({graph,focus:'other',scopeIds:['part']}),/outside.*scope/);
});
test('proposal and interpolation schemas reject source injection and unsupported expressions',()=>{
 assert.equal(parseAuthoringProposal(starter()).schemaVersion,AUTHORING_SCHEMA);
 for(const change of [{view:{...starter().view,source:'part invented;'}},{view:{...starter().view,kinds:['PartUsage; expose Model::*']}},{narrative:{schemaVersion:NARRATIVE_SCHEMA,template:'{{mass + 2}}',bindings:[]}},{narrative:{schemaVersion:NARRATIVE_SCHEMA,template:'{{missing}}',bindings:[]}}])assert.throws(()=>parseAuthoringProposal({...starter(),...change}));
 assert.throws(()=>validateNarrative({schemaVersion:NARRATIVE_SCHEMA,template:'{{x}}',bindings:[{name:'x',symbol:'part',attribute:'mass',expression:'secret()'}]}),/Unsupported/);
});
test('typed native formatting preserves false, zero and exact large integers and rationals',()=>{
 assert.equal(formatNativeValue({value:{boolValue:false}}),'false');assert.equal(formatNativeValue({value:{intValue:'0'}}),'0');assert.equal(formatNativeValue({value:{stringValue:''}}),'');
 assert.equal(formatNativeValue({value:{intValue:'9007199254740993'}}),'9007199254740993');
 assert.equal(formatNativeValue({value:{rationalValue:{numerator:'11',denominator:'50'}},unit:'kg',type:'Mass'},{decimals:2,unit:'kg',type:'Mass'}),'0.22 kg');
 assert.equal(formatNativeValue({value:{rationalValue:{numerator:'-1',denominator:'3'}}},{decimals:2}),'-0.33');
 assert.equal(formatNativeValue({value:{rationalValue:{numerator:'1',denominator:'3'}}}),'1/3');
 for(const [attribute,binding] of [[{value:{null:'unknown'}},{}],[{value:{realValue:'Infinity'}},{}],[{value:{intValue:1},unit:'kg'},{unit:'g'}],[{value:{boolValue:false}},{decimals:2}],[{value:{intValue:1},type:'Mass'},{type:'Length'}]])assert.throws(()=>formatNativeValue(attribute,binding));
});
test('native interpolation never guesses missing values, ambiguous attributes or evaluation context',async()=>{
 const record={schemaVersion:NARRATIVE_SCHEMA,template:'{{mass}}',bindings:[{name:'mass',symbol:'part',attribute:'mass'}]};
 const engine={call:async()=>({symbol:{id:'Model::part',attributes:[]}})};
 await assert.rejects(resolveNarrative(record,{graph,engine,modelHash:'test'}),/Unavailable native constant attribute/);
 await assert.rejects(resolveNarrative(record,{graph}),/semantic engine/);
 engine.call=async()=>({symbol:{attributes:[{name:'mass',value:{intValue:1}},{name:'mass',value:{intValue:2}}]}});await assert.rejects(resolveNarrative(record,{graph,engine,modelHash:'test'}),/Ambiguous/);
});

function nativeClient(binary){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)break;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)break;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
 for(const event of ['error','exit'])child.on(event,error=>{for(const job of pending.values())job.reject(Error(String(error)));pending.clear();});
 return {call(method,params={}){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
const binary=resolve(process.env.SYSPRESENT_NATIVE_ENGINE??'build/canvas-prototype/engine/sysml-native');
test('actual native proposal authoring validates, reuses bindings and refreshes source values on reload/build',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const project=await readProjectDirectory(resolve('examples/canvas-prototype')),original=structuredClone(project),parsed=await engine.call('ParseSources',{documents:documentsFor(project)}),exported=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),nativeGraph=modelGraph(exported.elements);
  const proposal=createOfflineAuthoringProposal({graph:nativeGraph,focus:'Flashlight__light',question:'What is the modeled mass?'});
  proposal.narrative={schemaVersion:NARRATIVE_SCHEMA,template:'{{statement}}\n\nDeclared mass: {{mass}}.',bindings:[{name:'statement',kind:'documentation',symbol:'Flashlight__light'},{name:'mass',symbol:'Flashlight__light',attribute:'mass',type:'ISQBase::MassValue',unit:'kg',decimals:2}]};
  const dependency=nativeGraph.relationships.find(edge=>edge.kind==='dependency'&&edge.source==='Flashlight__turnOn'&&edge.target==='Flashlight__light');assert.ok(dependency);
  proposal.relationshipClaims=[{id:dependency.id,source:dependency.source,target:dependency.target,kind:dependency.kind}];proposal.references.push('Flashlight__turnOn');
  const candidateCalls=[],boundedEngine={call:async(method,params)=>{candidateCalls.push({method,modelHash:params?.modelHash});if(method==='ExportModel')throw Error('Closed view proposal must not export the full candidate model');if(method==='ParseSources')for(const name of project.manifest.modelSources)assert.equal(params.documents.find(document=>document.name===name).content,fileText(project,name));return engine.call(method,params);}};
  const result=await prepareAuthoringProposal(project,{proposal,graph:nativeGraph,engine:boundedEngine});assert.deepEqual(project,original);assert.equal(candidateCalls.some(call=>call.method==='ExportModel'),false);assert.ok(candidateCalls.filter(call=>call.method==='GetSymbol').every(call=>call.modelHash===result.modelHash));assert.deepEqual(result.sourceGraphReuse.modelSources,project.manifest.modelSources);assert.equal(result.sourceGraphReuse.kind,'closed-view-extension');assert.deepEqual(result.review.sourceGraphReuse,result.sourceGraphReuse);assert.match(result.source,/view def Definition :> InterconnectionView/);assert.match(result.scene.markdown,/Declared mass: 0\.22 kg/);assert.equal(result.scene.narrative.template,proposal.narrative.template);assert.ok(result.review.added.length>0);assert.equal(result.review.values[1].authority,'native:GetSymbol');assert.match(result.review.narrativeStatus,/Unverified author draft/);
  assert.equal(parseStory(fileText(result.project,result.project.manifest.story)).length,parseStory(fileText(project,project.manifest.story)).length+1);
  const priorViewSource=fileText(result.project,'views/authored-proposals.sysml'),repeated=await prepareAuthoringProposal(result.project,{proposal,graph:nativeGraph,engine:boundedEngine});assert.ok(fileText(repeated.project,'views/authored-proposals.sysml').startsWith(priorViewSource+'\n'));for(const name of project.manifest.modelSources)assert.deepEqual(repeated.project.files[name],project.files[name]);
  const roundtrip=unpackProject(packProject(result.project)),stored=parseStory(fileText(roundtrip,roundtrip.manifest.story)).at(-1);assert.deepEqual(stored.narrative,proposal.narrative);assert.equal(fileText(roundtrip,'model.sysml'),fileText(project,'model.sysml'));
  const changed=structuredClone(roundtrip);changed.files['model.sysml']=fileText(changed,'model.sysml').replace('= 0.22 [kg]','= 0.31 [kg]').replace('A design claims satisfaction','A refreshed design claims satisfaction');
  const fresh=await engine.call('ParseSources',{documents:documentsFor(changed)}),freshExport=await engine.call('ExportModel',{modelHash:fresh.modelHash,projection:'declarations'}),freshGraph=modelGraph(freshExport.elements);
  const refreshed=await resolveAuthoredScene(stored,{engine,modelHash:fresh.modelHash,graph:freshGraph});assert.match(refreshed.markdown,/0\.31 kg/);assert.match(refreshed.markdown,/A refreshed design/);assert.match(stored.markdown,/0\.22 kg/);
  const checked=await validateProjectStory(changed,{exported:freshExport,engine,modelHash:fresh.modelHash});assert.match(checked.at(-1).markdown,/0\.31 kg/);
  const checkedWithCompiler=await validateProjectStory(changed,{native:binary,exported:freshExport});assert.match(checkedWithCompiler.at(-1).markdown,/0\.31 kg/);
  const newBinding=structuredClone(proposal);newBinding.narrative.bindings[0].symbol=result.viewName;const beforeInvalid=candidateCalls.length;await assert.rejects(prepareAuthoringProposal(project,{proposal:newBinding,graph:nativeGraph,engine:boundedEngine}),/Unavailable native reference/);assert.equal(candidateCalls.length,beforeInvalid,'New authored declarations are not bindings into the loaded source graph');
  const collision=structuredClone(project);collision.files['views/authored-proposals.sysml']='package PreserveSystemSource {}';collision.manifest.modelSources.push('views/authored-proposals.sysml');const beforeCollision=structuredClone(collision);await assert.rejects(prepareAuthoringProposal(collision,{proposal,graph:nativeGraph,engine:boundedEngine}),/presentation-owned/);assert.deepEqual(collision,beforeCollision);
  const changedDuringValidation=structuredClone(project),changedEngine={call:async(method,params)=>{const result=await engine.call(method,params);if(method==='ParseSources')changedDuringValidation.files['model.sysml']='package ChangedWhileValidating {}';return result;}};await assert.rejects(prepareAuthoringProposal(changedDuringValidation,{proposal,graph:nativeGraph,engine:changedEngine}),/Model sources changed/);
  const changedViews=structuredClone(project),changedViewsEngine={call:async(method,params)=>{const result=await engine.call(method,params);if(method==='ParseSources')changedViews.files['views.sysml']='package ChangedViewSource {}';return result;}};await assert.rejects(prepareAuthoringProposal(changedViews,{proposal,graph:nativeGraph,engine:changedViewsEngine}),/Model sources changed/);
  const unknown=structuredClone(proposal);unknown.view.expose=['invented'];await assert.rejects(prepareAuthoringProposal(project,{proposal:unknown,graph:nativeGraph,engine}),/Unavailable native reference/);
  const reversed=structuredClone(proposal);[reversed.relationshipClaims[0].source,reversed.relationshipClaims[0].target]=[dependency.target,dependency.source];await assert.rejects(prepareAuthoringProposal(project,{proposal:reversed,graph:nativeGraph,engine}),/not grounded/);
  await assert.rejects(prepareAuthoringProposal(project,{proposal,graph:nativeGraph,engine,scopeIds:['Flashlight__light']}),/outside.*scope/);
  const exact=structuredClone(proposal);exact.view.membership='exact';await assert.rejects(prepareAuthoringProposal(project,{proposal:exact,graph:nativeGraph,engine}),/membership differs/);
  const missing=structuredClone(result.project),missingScenes=parseStory(fileText(missing,missing.manifest.story));missingScenes.at(-1).narrative.bindings[1].attribute='notReal';
  const {writeStory}=await import('../src/canvas-prototype/project.mjs');missing.files[missing.manifest.story]=writeStory(missing.manifest.title,missingScenes);await assert.rejects(validateProjectStory(missing,{native:binary,exported}),/Unavailable native constant attribute/);
  assert.deepEqual(project,original);
 }finally{engine.close();}
});

test('runtime-only native satisfaction claims survive helper renaming and reject deleted or reversed links',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const project=await readProjectDirectory(resolve('examples/canvas-prototype'));
  // This authored namespace forces publication's disposable helper to choose a
  // different name. No semantic relationship is inferred from namespace text.
  project.files['model.sysml']=fileText(project,'model.sysml')+'\npackage SyspresentAuthoringContext { part unrelated; }\n';
  async function covered(value,packageName){
   const documents=documentsFor(value),initial=await engine.call('ParseSources',{documents}),declarations=await engine.call('ExportModel',{modelHash:initial.modelHash,projection:'declarations'}),index=discoverNativeIndex(initial,declarations,{modelDocumentCount:value.manifest.modelSources.length});
   assert.ok(!modelGraph(declarations.elements).relationships.some(edge=>edge.kind==='satisfy'));
   const parsed=await engine.call('ParseSources',{documents:[...documents,{name:'__test_runtime.sysml',content:requirementCoverageSource(index.modelRoots,packageName,index.requirementSeeds)}]});
   const coverage=adaptNativeView(await engine.call('RenderView',{modelHash:parsed.modelHash,view:packageName+'::coverage',includeSemanticIdentity:true}),packageName+'::coverage');
   return {modelHash:parsed.modelHash,graph:modelGraph(declarations.elements,[coverage]),coverage};
  }
  const original=await covered(project,'SyspresentRuntimeContext'),edge=original.graph.relationships.find(edge=>edge.kind==='satisfy'&&edge.source==='Flashlight__light'&&edge.target==='Flashlight__portable');assert.ok(edge?.nativeRelationship);
  const proposal=createOfflineAuthoringProposal({graph:original.graph,focus:'Flashlight__light',question:'Which requirement does this design claim to satisfy?'});
  proposal.references.push('Flashlight__portable');proposal.relationshipClaims=[{id:edge.id,source:edge.source,target:edge.target,kind:edge.kind}];
  const result=await prepareAuthoringProposal(project,{proposal,graph:original.graph,engine}),claim=result.scene.authoring.relationshipClaims[0];
  assert.equal(claim.nativeRelationship,edge.nativeRelationship);assert.match(claim.occurrences[0].viewId,/SyspresentRuntimeContext/);assert.deepEqual(authoringReferencedViews([result.scene]),[]);
  const reloaded=await covered(result.project,'FreshlyNamedRuntimeHelper');await resolveAuthoredScene(result.scene,{...reloaded,engine});
  const published=await validateProjectStory(result.project,{native:binary});assert.equal(published.at(-1).authoring.relationshipClaims[0].nativeRelationship,edge.nativeRelationship);
  const deleted=structuredClone(result.project);deleted.files['model.sysml']=fileText(deleted,'model.sysml').replace('satisfy portable;','');const deletedGraph=await covered(deleted,'AnotherRuntimeHelper');
  await assert.rejects(resolveAuthoredScene(result.scene,{...deletedGraph,engine}),/not grounded/);
  await assert.rejects(validateProjectStory(deleted,{native:binary}),/not grounded/);
  const reversed=structuredClone(result.project),scenes=parseStory(fileText(reversed,reversed.manifest.story)),last=scenes.at(-1).authoring.relationshipClaims[0];[last.source,last.target]=[last.target,last.source];reversed.files[reversed.manifest.story]=writeStory(reversed.manifest.title,scenes);
  await assert.rejects(validateProjectStory(reversed,{native:binary}),/not grounded/);
 }finally{engine.close();}
});
test('ad-hoc native behavior provenance is rendered on demand outside the declared view catalog',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const project=await readProjectDirectory(resolve('examples/canvas-prototype')),parsed=await engine.call('ParseSources',{documents:documentsFor(project)}),exported=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
  const action=adaptNativeView(await engine.call('RenderView',{modelHash:parsed.modelHash,view:'#action:Flashlight::turnOn',includeSemanticIdentity:true}),'#action:Flashlight::turnOn'),graph=modelGraph(exported.elements,[action]);
  const edge=graph.relationships.find(edge=>edge.occurrences?.some(item=>item.viewId.startsWith('#')));assert.ok(edge);
  const proposal=createOfflineAuthoringProposal({graph,focus:'Flashlight__light',question:'Inspect a modeled ordering link'});proposal.relationshipClaims=[{id:edge.id,source:edge.source,target:edge.target,kind:edge.kind}];
  const result=await prepareAuthoringProposal(project,{proposal,graph,engine});assert.deepEqual(authoringReferencedViews([result.scene]),[]);
  const fresh=await engine.call('ParseSources',{documents:documentsFor(result.project)}),freshExport=await engine.call('ExportModel',{modelHash:fresh.modelHash,projection:'declarations'});
  await resolveAuthoredScene(result.scene,{engine,modelHash:fresh.modelHash,graph:modelGraph(freshExport.elements)});
  await validateProjectStory(result.project,{native:binary});
 }finally{engine.close();}
});

const mockGatewayResponse=(proposal=starter())=>({ok:true,status:200,redirected:false,headers:{get:()=> 'application/json; charset=utf-8'},text:async()=>JSON.stringify({schemaVersion:AUTHORING_GATEWAY_SCHEMA,proposal})});
test('optional gateway construction never connects and permits only explicit same-origin or exact loopback endpoints',()=>{
 let calls=0;const fetchImpl=async()=>{calls++;return mockGatewayResponse();};
 for(const endpoint of ['http://localhost:8787/author','http://127.0.0.1:8787/author','http://[::1]:8787/author'])assert.equal(createJsonGatewayTransport({endpoint,fetchImpl}).protocol.gatewayVerified,false);
 assert.equal(createJsonGatewayTransport({endpoint:'/author',origin:'https://canvas.example',fetchImpl}).protocol.endpoint,'https://canvas.example/author');
 for(const endpoint of ['https://provider.example/author','http://localhost.evil.test/author','http://127.0.0.2/author','http://user:secret@localhost/author','http://localhost/author?api_key=secret','http://localhost/author#secret','file:///tmp/author','javascript:alert(1)'])assert.throws(()=>createJsonGatewayTransport({endpoint,fetchImpl}));
 assert.throws(()=>createJsonGatewayTransport({endpoint:'/author',fetchImpl}));assert.throws(()=>createJsonGatewayTransport({fetchImpl}));assert.throws(()=>createJsonGatewayTransport({endpoint:'http://localhost/author'}),/explicitly supplied fetch/);assert.equal(calls,0);
});
test('gateway requests require the provider policy gate and omit browser credentials, auth, redirects and source payloads',async()=>{
 const sent=[],fetchImpl=async(url,options)=>{sent.push({url,options});return mockGatewayResponse();},transport=createJsonGatewayTransport({endpoint:'/author',origin:'https://canvas.example',fetchImpl});
 await assert.rejects(transport({}),/data-policy gate/);assert.equal(sent.length,0);
 const context=buildAuthoringContext({graph,focus:'part'});context.elements[0].sourceFiles=['secret model source'];context.relationships[0].nativeEdge={sourceText:'secret relationship source'};
 await assert.rejects(createAuthoringProvider({mode:'configured',transport,privacy:{allowModelMetadata:true,fields:['identity']}}).generateProposal({question:'Question',context}),/privacy decision/);assert.equal(sent.length,0);
 const provider=createAuthoringProvider({mode:'mock',transport,privacy:{allowModelMetadata:true,fields:['identity','relationships']}}),result=await provider.generateProposal({question:'Question',context});assert.equal(result.reviewRequired,true);assert.equal(result.origin,'mock');assert.equal(sent.length,1);
 const {url,options}=sent[0],request=JSON.parse(options.body);assert.equal(url,'https://canvas.example/author');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.cache,'no-store');assert.equal(options.referrerPolicy,'no-referrer');assert.equal(options.mode,'same-origin');assert.deepEqual(Object.keys(options.headers).sort(),['Accept','Content-Type']);assert.equal(request.schemaVersion,AUTHORING_GATEWAY_SCHEMA);assert.equal(request.responseSchema,AUTHORING_SCHEMA);assert.equal(request.context.elements[0].documentation,undefined);assert.ok(!options.body.includes('secret model source'));assert.ok(!options.body.includes('secret relationship source'));assert.ok(!options.body.includes('secret source'));assert.deepEqual(request.context.relationships[0],{id:'dep',source:'part',target:'other',kind:'dependency',nativeRelationship:'native-dep'});
});
test('gateway protocol failures reject without automatic retries or returning unvalidated proposals',async()=>{
 const responses=[{...mockGatewayResponse(),ok:false,status:502},{...mockGatewayResponse(),redirected:true},{...mockGatewayResponse(),headers:{get:()=> 'text/html'}},{...mockGatewayResponse(),text:async()=>'{invalid'},{...mockGatewayResponse(),text:async()=> 'x'.repeat(262145)},{...mockGatewayResponse(),text:async()=>JSON.stringify({schemaVersion:'unknown',proposal:starter()})},{...mockGatewayResponse(),text:async()=>JSON.stringify({schemaVersion:AUTHORING_GATEWAY_SCHEMA,proposal:{...starter(),source:'part invented;'}})}];
 for(const response of responses){let calls=0;const transport=createJsonGatewayTransport({endpoint:'http://127.0.0.1:8787/author',fetchImpl:async()=>{calls++;return response;}}),provider=createAuthoringProvider({mode:'mock',transport,privacy:{allowModelMetadata:true,fields:['identity']}});await assert.rejects(provider.generateProposal({question:'Question',context:buildAuthoringContext({graph,focus:'part'})}));assert.equal(calls,1);}
});
test('mocked gateway proposals still enter actual native view validation before review',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const project=await readProjectDirectory(resolve('examples/canvas-prototype')),parsed=await engine.call('ParseSources',{documents:documentsFor(project)}),exported=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),graph=modelGraph(exported.elements),proposal=createOfflineAuthoringProposal({graph,focus:'Flashlight__light',question:'Inspect this native part'});let calls=0;
  const transport=createJsonGatewayTransport({endpoint:'http://localhost:8787/author',fetchImpl:async()=>{calls++;return mockGatewayResponse(proposal);}}),provider=createAuthoringProvider({mode:'mock',transport,privacy:{allowModelMetadata:true,fields:['identity']}}),response=await provider.generateProposal({question:proposal.question,context:buildAuthoringContext({graph,focus:proposal.focus})});
  const reviewed=await prepareAuthoringProposal(project,{proposal:response.proposal,graph,engine});assert.equal(calls,1);assert.match(reviewed.source,/view def Definition :> InterconnectionView/);assert.ok(reviewed.nativeView.nodes.some(node=>node.semanticId==='Flashlight__light'));assert.match(reviewed.review.narrativeStatus,/Unverified author draft/);
 }finally{engine.close();}
});
