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
