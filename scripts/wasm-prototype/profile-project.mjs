#!/usr/bin/env node
/** Profile a complete source project using the real Go/WASM semantic engine. */
import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { webcrypto, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { resolve, relative, dirname } from 'node:path';
import { pathToFileURL } from 'node:url';

const args=process.argv.slice(2);
const option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const project=resolve(option('--project','/home/david/repos/sv-blue-dog-editorial'));
const engine=resolve(option('--engine','build/canvas-prototype/engine'));
const output=resolve(option('--output','build/canvas-prototype/full-project-wasm-profile.json'));
async function filesUnder(path){const found=[];for(const entry of await readdir(path,{withFileTypes:true})){const name=resolve(path,entry.name);if(entry.isDirectory())found.push(...await filesUnder(name));else if(entry.isFile()&&entry.name.endsWith('.sysml'))found.push(name);}return found;}
const paths=[...await filesUnder(resolve(project,'models')),resolve(project,'tools/publishing/reference.sysml')].sort();
const documents=await Promise.all(paths.map(async path=>({name:relative(project,path).replaceAll('\\','/'),content:await readFile(path,'utf8')})));
const extraViews=option('--views',null);
if(extraViews)documents.push({name:'profile-views.sysml',content:await readFile(resolve(extraViews),'utf8')});
const runtimeHelper=option('--runtime-helper',null);
if(runtimeHelper)documents.push({name:'runtime-context.sysml',content:await readFile(resolve(runtimeHelper),'utf8')});
const totalSourceBytes=documents.reduce((sum,doc)=>sum+Buffer.byteLength(doc.content),0);
const sourceDigest=createHash('sha256').update(JSON.stringify(documents)).digest('hex');
const samples=[];
let memory;
function sample(phase,elapsedMs,extra={}){const m=process.memoryUsage();const value={phase,elapsedMs:Math.round(elapsedMs),rssBytes:m.rss,jsHeapUsedBytes:m.heapUsed,linearMemoryBytes:memory?.buffer.byteLength,...extra};samples.push(value);console.log(JSON.stringify(value));}
globalThis.crypto ||= webcrypto;
const started=performance.now();
await import(pathToFileURL(resolve(engine,'wasm_exec.js')));
const go=new globalThis.Go();
const memoryLimit=option('--memory-limit',null);
if(memoryLimit)go.env.GOMEMLIMIT=memoryLimit;
const gcPercent=option('--gc-percent',null);
if(gcPercent)go.env.GOGC=gcPercent;
const {instance}=await WebAssembly.instantiate(await readFile(resolve(engine,'sysml-wasm.wasm')),go.importObject);
memory=instance.exports.mem||instance.exports.memory;
go.run(instance).catch(error=>{console.error(error);process.exit(1);});
while(!globalThis.sysmlWasm)await new Promise(resolve=>setTimeout(resolve,10));
sample('engine-ready',performance.now()-started);
function call(method,params){const result=JSON.parse(globalThis.sysmlWasm.call(method,JSON.stringify(params)));if(result.error)throw Object.assign(new Error(result.error.message),{code:result.error.code});return result.result;}
let begin=performance.now();
const parsed=call('ParseSources',{documents});
sample('full-project-parsed',performance.now()-begin,{modelHash:parsed.modelHash,documents:documents.length,totalSourceBytes,roots:parsed.roots?.length||0,diagnostics:parsed.diagnostics?.length||0,diagnosticDetails:parsed.diagnostics||[]});
let projected;
if(!args.includes('--skip-export')){
 begin=performance.now();
 projected=call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
 sample('declarations-exported',performance.now()-begin,{elementCount:projected.elementCount,omittedElementCount:projected.omittedElementCount,jsonBytes:Buffer.byteLength(JSON.stringify(projected)),projection:projected.projection});
}
const proof=projected?.elements.find(element=>element.qualifiedName==='BlueDog::Requirements::trafficSafety')||{qualifiedName:'BlueDog::Requirements::trafficSafety'};
begin=performance.now();const symbol=call('GetSymbol',{modelHash:parsed.modelHash,symbolId:proof.qualifiedName});sample('native-symbol-after-parse',performance.now()-begin,{qualifiedName:proof.qualifiedName,returned:!!symbol.symbol});
const viewNames=option('--view','').split(',').filter(Boolean);
for(const viewName of viewNames){begin=performance.now();const drawing=call('RenderView',{modelHash:parsed.modelHash,view:viewName,includeSemanticIdentity:true});sample('native-view-after-parse',performance.now()-begin,{view:viewName,kind:drawing.kind,nodes:drawing.nodes.length,edges:drawing.edges.length,mappedNodes:drawing.nodes.filter(node=>node.identityStatus==='mapped').length,unmappedNodes:drawing.nodes.filter(node=>node.identityStatus==='unmapped').length});}
const result={memoryLimit,gcPercent,sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:project,encoding:'utf8'}).trim(),sourceDigest,documents:documents.length,totalSourceBytes,modelHash:parsed.modelHash,engine:JSON.parse(await readFile(resolve(engine,'provenance.json'),'utf8')),samples,maxRssBytes:process.resourceUsage().maxRSS*1024,coverageNotice:projected?.coverageNotice};
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log('profile saved '+output);
process.exit(0);
