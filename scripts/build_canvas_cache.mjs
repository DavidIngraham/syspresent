import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {createHash} from 'node:crypto';
import {documentsFor,parseStory,fileText,requirementCoverageSource,validateProject} from '../src/canvas-prototype/project.mjs';
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const projectRoot=resolve(option('--project','examples/canvas-blue-dog')),output=resolve(option('--output','build/canvas-prototype/runtime-cache.json'));
const manifest=JSON.parse(await readFile(join(projectRoot,'project.json'),'utf8')),files={};
for(const name of [...manifest.modelSources,...manifest.viewSources,manifest.story,...manifest.assets])files[name]=new Uint8Array(await readFile(join(projectRoot,name)));
const project=validateProject({manifest,files}),sources=documentsFor(project);
const child=spawn(resolve(option('--native','build/canvas-prototype/engine/sysml-native')),[],{stdio:['pipe','pipe','inherit']});
let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native response framing');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
child.on('error',error=>{for(const job of pending.values())job.reject(error);pending.clear();});
child.on('exit',code=>{for(const job of pending.values())job.reject(Error('Native engine exited: '+code));pending.clear();});
function call(method,params={}){console.error(method+(params.view?' '+params.view:''));const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});}
try{
 const engine=await call('GetServerInfo');let roots=manifest.modelRoots;
 if(!roots?.length){const parsed=await call('ParseSources',{documents:sources}),exported=await call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),ids=parsed.roots.flatMap(root=>root.childIds??[]);roots=exported.elements.filter(e=>ids.includes(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName);}
 let runtimePackage='SyspresentRuntimeContext';while(roots.includes(runtimePackage))runtimePackage+='X';
 const documents=[...sources,{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(roots,runtimePackage,manifest.requirementSeeds)}];
 const parsed=await call('ParseSources',{documents});if((parsed.diagnostics??[]).some(d=>String(d.severity).toLowerCase().includes('error')))throw Error('Native model has errors: '+JSON.stringify(parsed.diagnostics));
 const exported=await call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
 if(manifest.requirementSeeds){const actual=[...new Set(exported.elements.filter(e=>['RequirementUsage','RequirementDefinition'].includes(e['@type'])&&e.declaredName&&e.qualifiedName).map(e=>e.qualifiedName))].sort();if(JSON.stringify(actual)!==JSON.stringify([...manifest.requirementSeeds].sort()))throw Error('Native requirement seed index needs rebuilding');}
 const provenance=JSON.parse(await readFile(resolve(option('--provenance','build/canvas-prototype/engine/provenance.json')),'utf8'));
 const render=view=>call('RenderView',{modelHash:parsed.modelHash,view,includeSemanticIdentity:true});
 const coverage=await render(runtimePackage+'::coverage'),scenes=parseStory(fileText(project,manifest.story)),views={};
 for(const name of new Set([...scenes.map(scene=>scene.view),...(manifest.entryView?[manifest.entryView]:[])]))views[name]=await render(name);
 const availableViews=exported.elements.filter(e=>e['@type']==='ViewUsage'&&e.qualifiedName&&e['sysx:sourceLine']&&!e.qualifiedName.startsWith(runtimePackage+'::')).map(e=>e.qualifiedName);
 const cache={schemaVersion:'syspresent.native-cache.v1',engineVersion:engine.version,engineFingerprint:provenance.assets['sysml-wasm.wasm'].sha256,modelHash:parsed.modelHash,modelRoots:roots,sourceDigest:createHash('sha256').update(JSON.stringify(documents)).digest('hex'),exported,coverage,availableViews,views};
 await mkdir(dirname(output),{recursive:true});const data=JSON.stringify(cache);await writeFile(output,data);
 console.log(JSON.stringify({output,bytes:Buffer.byteLength(data),declarations:exported.elements.length,views:Object.fromEntries(Object.entries(views).map(([name,value])=>[name,{nodes:value.nodes.length,edges:value.edges.length}]))},null,2));
}finally{child.stdin.end();}
