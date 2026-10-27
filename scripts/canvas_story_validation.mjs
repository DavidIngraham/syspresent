import {loadPresentationLayouts} from '../src/canvas-prototype/presentation-layout.mjs';
import {spawn} from 'node:child_process';
import {documentsFor,fileText,parseStory,projectPath,requirementCoverageSource} from '../src/canvas-prototype/project.mjs';
import {validateStoryContent,nativeIdentityResolver} from '../src/canvas-prototype/story-content.mjs';
import {discoverNativeIndex} from '../src/canvas-prototype/native-project.mjs';
import {adaptNativeView,modelGraph} from '../src/canvas-prototype/graph.mjs';
import {authoringReferencedViews,resolveAuthoredScene} from '../src/canvas-prototype/authoring.mjs';

/** Validate publication targets and resolve reusable native narrative bindings. */
export async function validateProjectStory(project,{native,exported,engine,modelHash}={}){
 loadPresentationLayouts(project);
 let scenes=parseStory(fileText(project,project.manifest.story));const authored=scenes.some(scene=>scene.narrative||scene.authoring),needsCoverage=scenes.some(scene=>scene.authoring?.relationshipClaims?.length);let child,coverage;
 if(!engine&&(!exported||authored)){
  if(!native)throw Error('Native story validation requires the native compiler for authored bindings');
  child=spawn(native,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
  const fail=error=>{for(const job of pending.values())job.reject(error);pending.clear();};
  child.on('error',fail);child.on('exit',code=>fail(Error('Native validation exited: '+code)));
  child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length)){fail(Error('Invalid native response'));return;}if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
  engine={call(method,params){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});}};
 }
 try{
  if(engine&&(!modelHash||!exported||needsCoverage)){
   const parsed=await engine.call('ParseSources',{documents:documentsFor(project)});if((parsed.diagnostics??[]).some(d=>String(d.severity).toLowerCase().includes('error')))throw Error('Native story source errors: '+JSON.stringify(parsed.diagnostics));modelHash=parsed.modelHash;
   // A caller-supplied projection may belong to another source version. Fresh
   // parsing requires a matching fresh projection for grounded values/claims.
   exported=await engine.call('ExportModel',{modelHash,projection:'declarations'});
   if(needsCoverage){
    const discovered=discoverNativeIndex(parsed,exported,{modelDocumentCount:project.manifest.modelSources.length});
    if(discovered.requirementSeeds.length){
     // A disposable helper uses actual native discovery, just like the app.
     // Its package name is intentionally independent of saved provenance names.
     const names=new Set(exported.elements.map(element=>element.qualifiedName));let packageName='SyspresentAuthoringContext';while(names.has(packageName))packageName+='X';
     const documents=[...documentsFor(project),{name:'__syspresent_authoring_context.sysml',content:requirementCoverageSource(discovered.modelRoots,packageName,discovered.requirementSeeds)}];
     const covered=await engine.call('ParseSources',{documents});if((covered.diagnostics??[]).some(d=>String(d.severity).toLowerCase().includes('error')))throw Error('Native authoring coverage errors: '+JSON.stringify(covered.diagnostics));modelHash=covered.modelHash;
     exported=await engine.call('ExportModel',{modelHash,projection:'declarations'});
     coverage=adaptNativeView(await engine.call('RenderView',{modelHash,view:packageName+'::coverage',includeSemanticIdentity:true}),packageName+'::coverage');
    }
   }
  }
  if(authored){
   if(!engine||!modelHash)throw Error('Typed authoring validation requires the current native model');
   const views=coverage?[coverage]:[];for(const view of new Set([...scenes.map(scene=>scene.view),...authoringReferencedViews(scenes)]))views.push(adaptNativeView(await engine.call('RenderView',{modelHash,view,includeSemanticIdentity:true}),view));
   const graph=modelGraph(exported.elements,views);
   scenes=await Promise.all(scenes.map(scene=>resolveAuthoredScene(scene,{engine,modelHash,graph})));
  }
  validateStoryContent(scenes,{files:project.files,pathFor:projectPath,resolve:nativeIdentityResolver(exported)});return scenes;
 }finally{child?.stdin.end();}
}
