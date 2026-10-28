#!/usr/bin/env node
/** Reproduce full-project export pressure with actual native Go/WASM semantics.
 * Each run owns a fresh process. Reports acquired linear memory separately from
 * JS/process memory; Go heap samples are only used when supplied by the engine.
 */
import {readFile,mkdir} from 'node:fs/promises';
import {writeFileSync,appendFileSync} from 'node:fs';
import {webcrypto,createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readProjectDirectory} from '../canvas_project_files.mjs';
import {documentsFor,requirementCoverageSource} from '../../src/canvas-prototype/project.mjs';
import {createOfflineAuthoringProposal,prepareAuthoringProposal} from '../../src/canvas-prototype/authoring.mjs';
import {modelGraph} from '../../src/canvas-prototype/graph.mjs';
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const engine=resolve(option('--engine','build/canvas-prototype/engine'));
const projectPath=resolve(option('--project','examples/canvas-blue-dog'));
const cachePath=resolve(option('--cache','build/canvas-prototype/runtime-cache.json'));
const output=resolve(option('--output','build/export-memory-profile.json'));
const mode=option('--mode','single');
if(!['single','candidate'].includes(mode))throw Error('--mode must be single or candidate');
await mkdir(dirname(output),{recursive:true});
writeFileSync(output,'{}\n',{flag:'wx'});
const evidence={schemaVersion:'syspresent.export-memory.v1',mode,engine,projectPath,startedAt:new Date().toISOString(),samples:[],nativeLogs:[]};
let memory,goExited=false;
const stdout=console.log.bind(console),stderr=console.error.bind(console),start=performance.now();
const save=()=>writeFileSync(output,JSON.stringify(evidence,null,2)+'\n');
function sample(phase,extra={}){const value={phase,elapsedMs:Math.round(performance.now()-start),linearMemoryBytes:memory?.buffer.byteLength,nodeMemory:process.memoryUsage(),...extra};evidence.samples.push(value);save();stdout(JSON.stringify(value));}
for(const [name,original] of [['log',stdout],['error',stderr],['warn',stderr]])console[name]=(...values)=>{const text=values.map(String).join(' ');evidence.nativeLogs.push({at:new Date().toISOString(),stream:name,text,linearMemoryBytes:memory?.buffer.byteLength});appendFileSync(output+'.native.log',text+'\n');save();original(text);};
process.on('exit',code=>{evidence.exitCode=code;evidence.endedAt=new Date().toISOString();save();});
process.on('SIGTERM',()=>{evidence.interrupted='SIGTERM external bounded timeout';sample('bounded-timeout');process.exit(124);});
globalThis.crypto ||= webcrypto;
await import(pathToFileURL(resolve(engine,'wasm_exec.js')));
const go=new globalThis.Go();
const reset=go.importObject.gojs?.['runtime.resetMemoryDataView'];
if(reset)go.importObject.gojs['runtime.resetMemoryDataView']=(...params)=>{const result=reset(...params);if(memory)sample('linear-memory-growth');return result;};
go.exit=code=>{goExited=true;evidence.goExitCode=code;sample('go-exit');};
const wasm=await readFile(resolve(engine,'sysml-wasm.wasm'));
evidence.engineSha256=createHash('sha256').update(wasm).digest('hex');
evidence.engineProvenance=JSON.parse(await readFile(resolve(engine,'provenance.json'),'utf8'));
const {instance}=await WebAssembly.instantiate(wasm,go.importObject);
memory=instance.exports.mem||instance.exports.memory;
go.run(instance).catch(error=>{evidence.goRunError={message:error.message,stack:error.stack};sample('go-rejected');});
while(!globalThis.sysmlWasm){if(goExited)throw Error('Go exited during initialization');await new Promise(resolve=>setTimeout(resolve,10));}
sample('engine-ready');
function call(method,params={}){if(method==='ParseSources')writeFileSync(output+'.documents-'+evidence.samples.filter(s=>s.phase==='before-ParseSources').length+'.json',JSON.stringify(params.documents));sample('before-'+method,{parameters:method==='ParseSources'?{documents:params.documents.length}:params});const begin=performance.now(),raw=globalThis.sysmlWasm.call(method,JSON.stringify(params));sample('after-'+method,{operationMs:Math.round(performance.now()-begin),rawType:typeof raw,jsonBytes:typeof raw==='string'?Buffer.byteLength(raw):null});if(typeof raw!=='string')throw Error('Native bridge returned '+String(raw));const envelope=JSON.parse(raw);if(evidence.server?.capabilities?.includes('memory_stats')&&method!=='GetMemoryStats'){const stats=JSON.parse(globalThis.sysmlWasm.call('GetMemoryStats','{}'));if(stats.result){evidence.nativeStats??=[];evidence.nativeStats.push({phase:'after-'+method,...stats.result});save();}}if(envelope.error)throw Object.assign(Error(envelope.error.message),{code:envelope.error.code});return envelope.result;}
try{
 evidence.server=call('GetServerInfo');
 const project=await readProjectDirectory(projectPath),documents=documentsFor(project);
 evidence.documents=documents.length;evidence.totalSourceBytes=documents.reduce((total,d)=>total+Buffer.byteLength(d.content),0);evidence.sourceDigest=createHash('sha256').update(JSON.stringify(documents)).digest('hex');
 const parsed=call('ParseSources',{documents});evidence.baseModelHash=parsed.modelHash;
 let exportHash=parsed.modelHash;
 if(mode==='candidate'){
  const cache=JSON.parse(await readFile(cachePath,'utf8'));
  const runtime=call('ParseSources',{documents:[...documents,{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(cache.modelRoots,cache.runtimePackage,cache.requirementSeeds)}]});
  evidence.runtimeModelHash=runtime.modelHash;
  const graph=modelGraph(cache.exported.elements),integration=graph.elements.find(element=>element.qualifiedName==='BlueDog::Configurations::IC01::integration');
  if(!integration)throw Error('The current native model does not expose the integration configuration');
  const proposal=createOfflineAuthoringProposal({graph,focus:integration.id,question:'Inspect battery density'});
  proposal.narrative={schemaVersion:'syspresent.narrative.v1',template:'Battery density: {{battery}}',bindings:[{name:'battery',symbol:integration.id,attribute:'batteryWhKg',unit:''}]};
  const prepared=await prepareAuthoringProposal(project,{proposal,graph,engine:{call:async(method,params)=>call(method,params)}});
  evidence.candidateView=prepared.viewName;evidence.candidateModelHash=prepared.modelHash;exportHash=prepared.modelHash;
 }
 const exported=call('ExportModel',{modelHash:exportHash,projection:'declarations'});
 evidence.export={elementCount:exported.elementCount,omittedElementCount:exported.omittedElementCount,elements:exported.elements.length,sha256:createHash('sha256').update(JSON.stringify(exported)).digest('hex'),jsonBytes:Buffer.byteLength(JSON.stringify(exported))};
 if(evidence.server?.capabilities?.includes('memory_stats'))evidence.collectedStats=call('GetMemoryStats',{collect:true});sample('complete');save();process.exit(0);
}catch(error){evidence.failure={message:error.message,stack:error.stack,code:error.code};sample('failed');save();process.exit(1);}
