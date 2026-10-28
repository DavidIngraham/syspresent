import test from 'node:test';
import assert from 'node:assert/strict';
import { createSemanticEngine } from '../../src/canvas-prototype/engine/client.mjs';

class WorkerFake {
  static latest;
  constructor(url) { this.url = url; this.messages = []; WorkerFake.latest = this; }
  postMessage(message) { this.messages.push(message); }
  terminate() { this.terminated = true; }
  answer(id, result, error) { this.onmessage({ data: { id, result, error } }); }
}
const create = () => createSemanticEngine({ assetBase: new URL('https://example.test/engine/'), WorkerClass: WorkerFake });

test('engine handshake precedes semantic calls and preserves raw result identities', async () => {
  const engine = create();
  const worker = WorkerFake.latest;
  assert.equal(worker.messages[0].method, 'Initialize');
  const call = engine.call('RenderView', { view: 'Views::requirements', includeSemanticIdentity: true });
  await Promise.resolve();
  assert.equal(worker.messages.length, 1);
  worker.answer(1, { capabilities: ['render_view'] });
  await engine.ready;
  await Promise.resolve();
  assert.equal(worker.messages[1].method, 'RenderView');
  assert.equal(worker.messages[1].params.includeSemanticIdentity, true);
  worker.answer(2, { nodes: [{ semanticId: 'Demo__requirement' }] });
  assert.equal((await call).nodes[0].semanticId, 'Demo__requirement');
  engine.terminate();
});

test('engine reports structured semantic errors and remains usable', async () => {
  const engine = create();
  const worker = WorkerFake.latest;
  worker.answer(1, {});
  await engine.ready;
  const bad = engine.call('RenderView', { view: 'missing' });
  await Promise.resolve();
  worker.answer(2, undefined, { code: 5, message: 'view not found' });
  await assert.rejects(bad, error => error.code === 5 && error.message === 'view not found');
  const good = engine.call('ExportModel', { modelHash: 'abc' });
  await Promise.resolve();
  worker.answer(3, { elements: [] });
  assert.deepEqual(await good, { elements: [] });
  engine.terminate();
});

test('termination rejects pending work and prohibits future requests', async () => {
  const engine = create();
  const worker = WorkerFake.latest;
  worker.answer(1, {});
  await engine.ready;
  const call = engine.call('ParseSources', { documents: [] });
  await Promise.resolve();
  engine.terminate();
  await assert.rejects(call, /terminated/);
  await assert.rejects(engine.call('GetServerInfo'), /terminated/);
  assert.equal(worker.terminated, true);
});

test('initialization progress does not settle the RPC and ignores obsolete messages', async () => {
  const progress=[];
  const engine=createSemanticEngine({assetBase:new URL('https://example.test/engine/'),WorkerClass:WorkerFake,onProgress:event=>progress.push(event)});
  const worker=WorkerFake.latest;let settled=false;
  engine.ready.then(()=>{settled=true;});
  worker.onmessage({data:{id:999,progress:{stage:'stale'}}});
  worker.onmessage({data:{id:1,progress:{stage:'engine-download',completed:10,unit:'bytes'}}});
  await Promise.resolve();
  assert.equal(settled,false);assert.equal(progress.length,1);
  assert.equal(progress[0].requestId,1);assert.equal(progress[0].method,'Initialize');assert.equal(progress[0].completed,10);
  worker.answer(1,{version:'actual'});await engine.ready;
  worker.onmessage({data:{id:1,progress:{stage:'late'}}});
  engine.terminate();worker.onmessage({data:{id:1,progress:{stage:'closed'}}});
  assert.equal(progress.length,1);
});

test('a failed initialization closes its worker and a fresh engine can retry', async () => {
  const engine=create();const failedWorker=WorkerFake.latest;
  const failure=assert.rejects(engine.ready,/HTTP 503/);
  failedWorker.answer(1,undefined,{message:'Cannot load semantic engine: HTTP 503'});await failure;
  assert.equal(failedWorker.terminated,true);
  await assert.rejects(engine.call('GetServerInfo'),/HTTP 503/);
  const retry=create();const worker=WorkerFake.latest;worker.answer(1,{version:'retry'});
  assert.equal((await retry.ready).version,'retry');retry.terminate();
});

test('a progress observer cannot interrupt engine initialization', async () => {
  const engine=createSemanticEngine({assetBase:new URL('https://example.test/engine/'),WorkerClass:WorkerFake,onProgress:()=>{throw Error('display observer');}});
  const worker=WorkerFake.latest;
  assert.doesNotThrow(()=>worker.onmessage({data:{id:1,progress:{stage:'engine-start'}}}));
  worker.answer(1,{version:'native'});assert.equal((await engine.ready).version,'native');engine.terminate();
});

test('worker transport and decoding failures reject pending initialization', async () => {
  for(const kind of ['onerror','onmessageerror']){
    const engine=create();const worker=WorkerFake.latest;const rejected=assert.rejects(engine.ready,/worker/);
    worker[kind]({message:'worker asset unavailable'});await rejected;
    assert.equal(worker.terminated,true);
  }
});

test('worker creation and initialization post failures reject ready and expose closed state', async () => {
 for(const WorkerClass of [
  class {constructor(){throw Error('worker creation blocked');}},
  class {postMessage(){throw Error('worker post blocked');}terminate(){this.terminated=true;WorkerFake.latest=this;}}
 ]){
  const engine=createSemanticEngine({assetBase:new URL('https://example.test/engine/'),WorkerClass});
  await assert.rejects(engine.ready,/worker.*blocked/);
  assert.equal(engine.closed,true);engine.terminate();
 }
});

test('a stopped native bridge closes the engine and rejects other pending work', async () => {
 const engine=create();const worker=WorkerFake.latest;worker.answer(1,{});await engine.ready;
 const failed=engine.call('ExportModel'),other=engine.call('GetSymbol');await Promise.resolve();
 const failure=assert.rejects(failed,error=>error.code==='NATIVE_NO_RESPONSE');
 const rejection=assert.rejects(other,error=>error.code==='NATIVE_NO_RESPONSE');
 worker.answer(2,undefined,{message:'native engine stopped',code:'NATIVE_NO_RESPONSE'});
 await Promise.all([failure,rejection]);assert.equal(engine.closed,true);assert.equal(worker.terminated,true);
});
