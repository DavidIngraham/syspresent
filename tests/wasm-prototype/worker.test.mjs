import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
const source=await readFile('src/canvas-prototype/engine/worker.js','utf8');
const harness=call=>{const context=vm.createContext({self:{},sysmlWasm:{call}});vm.runInContext(source,context);return context;};
test('worker preserves real native envelopes and native error codes',()=>{
 const context=harness(method=>method==='ok'?JSON.stringify({result:{modelHash:'native'}}):JSON.stringify({error:{code:'native-error',message:'actual diagnostic'}}));
 assert.equal(context.invoke('ok',{}).modelHash,'native');
 assert.throws(()=>context.invoke('bad',{}),error=>error.message==='actual diagnostic'&&error.code==='native-error');
 assert.equal(context.invoke('ok',{}).modelHash,'native');
});
test('a stopped native bridge reports the failing method and refuses later native calls',()=>{
 let count=0;const context=harness(()=>{count++;return undefined;});
 assert.throws(()=>context.invoke('ExportModel',{}),error=>error.code==='NATIVE_NO_RESPONSE'&&error.message.includes('ExportModel')&&error.message.includes('reload the app'));
 assert.throws(()=>context.invoke('Evaluate',{}),error=>error.code==='NATIVE_NO_RESPONSE'&&error.message.includes('ExportModel'));
 assert.equal(count,1);
});
test('worker onmessage returns stopped-engine status without a misleading JSON parse error',async()=>{
 const responses=[],context=harness(()=>undefined);context.self.postMessage=message=>responses.push(message);vm.runInContext('engineReady=Promise.resolve({})',context);
 await context.self.onmessage({data:{id:7,method:'ExportModel',params:{modelHash:'real'}}});
 assert.equal(responses[0].id,7);assert.equal(responses[0].error.code,'NATIVE_NO_RESPONSE');assert.match(responses[0].error.message,/native semantic engine/);assert.doesNotMatch(responses[0].error.message,/valid JSON/);
});

function startupHarness({streaming=true,headers={},status=200,scriptError,fetchError,compileError,bodyError}={}) {
 const events=[],fetches=[],scripts=[],compiles=[],bytes=new Uint8Array([0,97,115,109,1,0,0,0]);
 let consumed;
 const native={result:{version:'native',capabilities:['render_view']}};
 const context=vm.createContext({self:{postMessage:message=>events.push(JSON.parse(JSON.stringify(message)))},URL,Response,ReadableStream,Date,setTimeout,
  fetch:async url=>{
   fetches.push(url);if(fetchError)throw fetchError;
   const body=new ReadableStream({start(controller){if(bodyError){controller.error(bodyError);return;}controller.enqueue(bytes.subarray(0,4));controller.enqueue(bytes.subarray(4));controller.close();}});
   return new Response(body,{status,headers});
  },
  WebAssembly:{
   instantiateStreaming:streaming?async(response,imports)=>{compiles.push({streaming:true,mime:response.headers.get('content-type'),imports});if(compileError)throw compileError;consumed=new Uint8Array(await response.arrayBuffer());return {instance:{}};}:undefined,
   instantiate:async(buffer,imports)=>{compiles.push({streaming:false,imports});if(compileError)throw compileError;consumed=new Uint8Array(buffer);return {instance:{}};}
  }
 });
 context.importScripts=url=>{scripts.push(url);if(scriptError)throw scriptError;context.Go=class{constructor(){this.importObject={native:true};}run(){context.sysmlWasm={call:()=>JSON.stringify(native)};return Promise.resolve();}};};
 vm.runInContext(source,context);
 const start=id=>context.self.onmessage({data:{id,method:'Initialize',params:{assetBase:'https://example.test/engine/',assetVersion:'pinned-build'}}});
 return {context,events,fetches,scripts,compiles,bytes,start,get consumed(){return consumed;}};
}

test('engine streams a single pinned download even when static MIME is wrong',async()=>{
 const h=startupHarness({headers:{'content-type':'text/plain','content-length':'8'}});
 await h.start(3);
 assert.equal(h.fetches.length,1);assert.match(h.fetches[0],/sysml-wasm.wasm\?v=pinned-build$/);
 assert.match(h.scripts[0],/wasm_exec.js\?v=pinned-build$/);
 assert.equal(h.compiles.length,1);assert.equal(h.compiles[0].streaming,true);assert.equal(h.compiles[0].mime,'application/wasm');
 assert.deepEqual(h.consumed,h.bytes);
 const progress=h.events.filter(e=>e.progress).map(e=>e.progress);
 assert.equal(progress[0].stage,'engine-runtime');assert.ok(progress.some(e=>e.stage==='engine-download'&&e.completed===8&&e.total===8&&e.unit==='bytes'));
 const compiling=progress.find(e=>e.stage==='engine-compile');assert.ok(compiling);assert.equal(compiling.total,undefined);
 assert.equal(progress.at(-1).stage,'engine-start');
 const final=h.events.filter(e=>!e.progress);assert.deepEqual(final,[{id:3,result:{version:'native',capabilities:['render_view']}}]);
});

test('compressed download progress never compares decoded bytes to encoded Content-Length',async()=>{
 const h=startupHarness({headers:{'content-encoding':'gzip','content-length':'3'}});
 await h.start(1);
 const progress=h.events.filter(e=>e.progress?.stage==='engine-download').map(e=>e.progress);
 assert.ok(progress.some(e=>e.completed===8));
 assert.ok(progress.every(e=>e.total===undefined));
});

test('streaming-unavailable engines retain the single-fetch array-buffer path',async()=>{
 const h=startupHarness({streaming:false,headers:{'content-length':'8'}});
 await h.start(1);
 assert.equal(h.fetches.length,1);assert.equal(h.compiles.length,1);assert.equal(h.compiles[0].streaming,false);
 assert.deepEqual(h.consumed,h.bytes);assert.ok(h.events.some(e=>e.result?.version==='native'));
});

test('a compile failure is reported without a duplicate fetch or fallback compile',async()=>{
 const h=startupHarness({compileError:new Error('invalid native module')});await h.start(1);
 assert.equal(h.fetches.length,1);assert.equal(h.compiles.length,1);
 assert.match(h.events.at(-1).error.message,/invalid native module/);
 assert.ok(!h.events.some(e=>e.progress?.stage==='engine-start'||e.result));
});

test('runtime script, HTTP and interrupted download errors retain actionable causes',async()=>{
 for(const [options,message] of [
  [{scriptError:new Error('runtime missing')},/runtime script: runtime missing/],
  [{status:503},/HTTP 503/],
  [{fetchError:new Error('network unavailable')},/download semantic engine: network unavailable/],
  [{bodyError:new Error('download interrupted')},/download interrupted/]
 ]){
  const h=startupHarness(options);await h.start(1);
  assert.match(h.events.at(-1).error.message,message);assert.ok(!h.events.some(e=>e.result));
 }
});

test('concurrent initialization requests share one engine without double download',async()=>{
 const h=startupHarness();await Promise.all([h.start(1),h.start(2)]);
 assert.equal(h.fetches.length,1);assert.equal(h.compiles.length,1);
 assert.deepEqual(h.events.filter(e=>e.result).map(e=>e.id).sort(),[1,2]);
});
