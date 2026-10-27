import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {documentsFor,parseStory,fileText,requirementCoverageSource} from '../src/canvas-prototype/project.mjs';
import {discoverNativeIndex} from '../src/canvas-prototype/native-project.mjs';
import {readProjectDirectory,documentDigest} from './canvas_project_files.mjs';
import {validateProjectStory} from './canvas_story_validation.mjs';
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const projectRoot=resolve(option('--project','examples/canvas-blue-dog')),output=resolve(option('--output','build/canvas-prototype/runtime-cache.json'));
const project=await readProjectDirectory(projectRoot),manifest=project.manifest,sources=documentsFor(project);
const child=spawn(resolve(option('--native','build/canvas-prototype/engine/sysml-native')),[],{stdio:['pipe','pipe','inherit']});
let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native response framing');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
child.on('error',error=>{for(const job of pending.values())job.reject(error);pending.clear();});
child.on('exit',code=>{for(const job of pending.values())job.reject(Error('Native engine exited: '+code));pending.clear();});
function call(method,params={}){console.error(method+(params.view?' '+params.view:''));const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});}
try{
 const engine=await call('GetServerInfo');
 const initial=await call('ParseSources',{documents:sources});
 if((initial.diagnostics??[]).some(d=>String(d.severity).toLowerCase().includes('error')))throw Error('Native model has errors: '+JSON.stringify(initial.diagnostics));
 const declarations=await call('ExportModel',{modelHash:initial.modelHash,projection:'declarations'});
 const discovered=discoverNativeIndex(initial,declarations,{modelDocumentCount:manifest.modelSources.length});
 const roots=manifest.modelRoots??discovered.modelRoots,requirementSeeds=manifest.requirementSeeds??discovered.requirementSeeds;
 if(!roots.length)throw Error('Native model has no discoverable model roots');
 let runtimePackage='SyspresentRuntimeContext';while(declarations.elements.some(element=>element.qualifiedName===runtimePackage))runtimePackage+='X';
 const documents=[...sources,{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(roots,runtimePackage,requirementSeeds)}];
 const parsed=await call('ParseSources',{documents});
 if((parsed.diagnostics??[]).some(d=>String(d.severity).toLowerCase().includes('error')))throw Error('Native model has errors: '+JSON.stringify(parsed.diagnostics));
 const exported=await call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
 await validateProjectStory(project,{exported,engine:{call},modelHash:parsed.modelHash});
 const provenance=JSON.parse(await readFile(resolve(option('--provenance','build/canvas-prototype/engine/provenance.json')),'utf8'));
 const render=view=>call('RenderView',{modelHash:parsed.modelHash,view,includeSemanticIdentity:true});
 const coverage=requirementSeeds.length?await render(runtimePackage+'::coverage'):{kind:'definition',nodes:[],edges:[]},scenes=parseStory(fileText(project,manifest.story)),views={};
 for(const name of new Set([...scenes.flatMap(scene=>[scene.view,...(scene.regions??[]).map(r=>r.view)]),...(manifest.entryView?[manifest.entryView]:[])]))views[name]=await render(name);
 const availableViews=exported.elements.filter(e=>e['@type']==='ViewUsage'&&e.qualifiedName&&e['sysx:sourceLine']&&!e.qualifiedName.startsWith(runtimePackage+'::')).map(e=>e.qualifiedName);
 const cache={schemaVersion:'syspresent.native-cache.v1',engineVersion:engine.version,engineFingerprint:provenance.assets['sysml-wasm.wasm'].sha256,modelHash:parsed.modelHash,modelRoots:roots,requirementSeeds,runtimePackage,inputDigest:documentDigest(sources),sourceDigest:documentDigest(documents),exported,coverage,availableViews,views};
 await mkdir(dirname(output),{recursive:true});const data=JSON.stringify(cache);await writeFile(output,data);
 console.log(JSON.stringify({output,bytes:Buffer.byteLength(data),declarations:exported.elements.length,views:Object.fromEntries(Object.entries(views).map(([name,value])=>[name,{nodes:value.nodes.length,edges:value.edges.length}]))},null,2));
}finally{child.stdin.end();}
