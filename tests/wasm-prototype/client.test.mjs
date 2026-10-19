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
