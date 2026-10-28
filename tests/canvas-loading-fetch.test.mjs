import test from 'node:test';
import assert from 'node:assert/strict';
import {readLoadingBytes} from '../src/canvas-prototype/loading-fetch.mjs';
const response=(parts,headers={})=>new Response(new ReadableStream({start(controller){for(const part of parts)controller.enqueue(new Uint8Array(part));controller.close();}}),{headers});
test('project download reports actual bytes with a trustworthy same-representation total',async()=>{
 const progress=[],bytes=await readLoadingBytes(response([[1,2],[3]],{'Content-Length':'3'}),{onProgress:event=>progress.push(event)});
 assert.deepEqual([...bytes],[1,2,3]);assert.equal(progress.at(-1).completed,3);assert.equal(progress.at(-1).total,3);assert.equal(progress.at(-1).unit,'bytes');
});
test('compressed or inconsistent content lengths never become misleading decoded-byte percentages',async()=>{
 for(const headers of [{'Content-Length':'1','Content-Encoding':'gzip'},{'Content-Length':'1'},{'Content-Length':'10'}]){
  const progress=[];await readLoadingBytes(response([[1,2],[3]],headers),{onProgress:event=>progress.push(event)});
  assert.equal(progress.at(-1).completed,3);assert.equal(progress.at(-1).total,undefined);
 }
});
test('canceling a pending download cancels its reader without waiting for another chunk',async()=>{
 const controller=new AbortController();let canceled=false;
 const pending=readLoadingBytes(new Response(new ReadableStream({cancel(){canceled=true;}})),{signal:controller.signal});
 controller.abort();await assert.rejects(pending,/Loading canceled/);assert.equal(canceled,true);
});
test('HTTP failures remain actionable and do not read or report a completed download',async()=>{
 const progress=[];await assert.rejects(readLoadingBytes(new Response('unavailable',{status:503}),{onProgress:event=>progress.push(event)}),/HTTP 503.*Retry/);assert.deepEqual(progress,[]);
});
