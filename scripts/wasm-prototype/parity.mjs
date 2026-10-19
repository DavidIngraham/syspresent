#!/usr/bin/env node
/** Exercise the same parsed sources and calls through native JSON-RPC and real WASM. */
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { modelGraph, adaptNativeView } from '../../src/canvas-prototype/graph.mjs';
import { engineeringContext } from '../../src/canvas-prototype/core/index.mjs';

const args = process.argv.slice(2);
const option = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
const engineDir = resolve(option('--engine', 'build/canvas-prototype/engine'));
const modelDir = resolve(option('--model', 'examples/canvas-prototype'));
const output = resolve(option('--output', 'build/canvas-prototype/parity-native.json'));

function nativeClient(binary) {
  const child = spawn(binary, [], { stdio: ['pipe', 'pipe', 'inherit'] });
  let buffer = Buffer.alloc(0);
  let next = 0;
  const pending = new Map();
  child.stdout.on('data', chunk => {
    buffer = Buffer.concat([buffer, chunk]);
    while (true) {
      const headerEnd = buffer.indexOf('\r\n\r\n');
      if (headerEnd < 0) break;
      const length = Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0, headerEnd).toString())?.[1]);
      if (!Number.isFinite(length)) throw new Error('Invalid native JSON-RPC frame');
      if (buffer.length < headerEnd + 4 + length) break;
      const message = JSON.parse(buffer.subarray(headerEnd + 4, headerEnd + 4 + length));
      buffer = buffer.subarray(headerEnd + 4 + length);
      const job = pending.get(message.id);
      if (!job) continue;
      pending.delete(message.id);
      if (message.error) job.reject(Object.assign(new Error(message.error.message), { code: message.error.code }));
      else job.resolve(message.result);
    }
  });
  child.on('exit', code => { for (const job of pending.values()) job.reject(new Error(`Native engine exited: ${code}`)); });
  return {
    call(method, params) {
      const id = ++next;
      const data = Buffer.from(JSON.stringify({ jsonrpc: '2.0', id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
        child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);
        child.stdin.write(data);
      });
    },
    close() { child.stdin.end(); }
  };
}

async function wasmClient() {
  globalThis.crypto ||= webcrypto;
  await import(pathToFileURL(resolve(engineDir, 'wasm_exec.js')));
  const go = new globalThis.Go();
  const { instance } = await WebAssembly.instantiate(await readFile(resolve(engineDir, 'sysml-wasm.wasm')), go.importObject);
  go.run(instance).catch(error => { console.error(error); process.exit(1); });
  while (!globalThis.sysmlWasm) await new Promise(resolve => setTimeout(resolve, 10));
  return { call(method, params) {
    const message = JSON.parse(globalThis.sysmlWasm.call(method, JSON.stringify(params)));
    if (message.error) throw Object.assign(new Error(message.error.message), { code: message.error.code });
    return message.result;
  }};
}

const documents = await Promise.all(['model.sysml', 'views.sysml'].map(async name => ({ name, content: await readFile(resolve(modelDir, name), 'utf8') })));
const native = nativeClient(resolve(engineDir, 'sysml-native'));
try {
  const wasm = await wasmClient();
  const serverInfo = await native.call('GetServerInfo', {});
  assert.deepEqual(await wasm.call('GetServerInfo', {}), serverInfo, 'Native and WASM capability contract must match');
  for (const capability of ['render_view', 'semantic_rendering_identity', 'export_model']) assert.ok(serverInfo.capabilities.includes(capability));
  const parsed = await native.call('ParseSources', { documents });
  const wasmParsed = await wasm.call('ParseSources', { documents });
  assert.deepEqual(wasmParsed, parsed, 'Native and WASM parsing must have the same hash, roots and diagnostics');
  const modelHash = parsed.modelHash;
  const exported = await native.call('ExportModel', { modelHash });
  const wasmExported = await wasm.call('ExportModel', { modelHash });
  assert.deepEqual(wasmExported, exported, 'Native and WASM API graph must be identical');
  const views = {};
  for (const view of ['CanvasViews::requirements', 'CanvasViews::structure', 'CanvasViews::assembly', 'CanvasViews::operation']) {
    const params = { modelHash, view, includeSemanticIdentity: true, show: ['compartments'] };
    const a = await native.call('RenderView', params);
    const b = await wasm.call('RenderView', params);
    assert.deepEqual(b, a, `${view} native and WASM drawings must be identical`);
    const exportedIDs = new Set(exported.elements.map(element => element['@id']));
    for (const node of a.nodes) {
      if (node.identityStatus === 'mapped') assert.ok(exportedIDs.has(node.semanticId), `${view} mapped node absent from graph: ${node.semanticId}`);
      if (node.identityStatus === 'synthetic') assert.equal(node.semanticId, undefined, 'Synthetic notation must not acquire a model identity');
    }
    const renderIDs = new Set(a.nodes.map(node => node.id));
    for (const edge of a.edges) {
      assert.ok(renderIDs.has(edge.from) && renderIDs.has(edge.to), `${view} edge endpoint absent`);
      if (edge.identityStatus === 'mapped') assert.ok(exportedIDs.has(edge.semanticId), `${view} mapped edge absent from graph`);
    }
    views[view] = a;
  }
  const capturedViews = {};
  const captureCases = [
    { pseudo: '#action:Flashlight::turnOn', root: ['Flashlight', 'turnOn'], name: 'operation', definition: 'ActionFlowView' },
    { pseudo: '#interconnection:Flashlight::light', root: ['Flashlight', 'light'], name: 'structure', definition: 'InterconnectionView' }
  ];
  for (const capture of captureCases) {
    const quotedRoot = capture.root.map(segment => `'${segment}'`).join('::');
    const capturedSource = `package CanvasCapture { private import StandardViewDefinitions::*; view '${capture.name}' : ${capture.definition} { expose ${quotedRoot}; } }`;
    const captureDocuments = [...documents, { name: 'captured.sysml', content: capturedSource }];
    const captureParsed = await native.call('ParseSources', { documents: captureDocuments });
    assert.deepEqual(await wasm.call('ParseSources', { documents: captureDocuments }), captureParsed, 'Captured source must parse identically');
    assert.equal(captureParsed.diagnostics?.length || 0, 0, 'Captured standard view has diagnostics');
    const pseudoParams = { modelHash, view: capture.pseudo, includeSemanticIdentity: true, show: ['compartments'] };
    const namedParams = { ...pseudoParams, modelHash: captureParsed.modelHash, view: `CanvasCapture::${capture.name}` };
    const pseudoNative = await native.call('RenderView', pseudoParams);
    const capturedNative = await native.call('RenderView', namedParams);
    assert.deepEqual(await wasm.call('RenderView', pseudoParams), pseudoNative, 'Pseudo-view must agree across native and WASM');
    assert.deepEqual(await wasm.call('RenderView', namedParams), capturedNative, 'Captured view must agree across native and WASM');
    // View names and the stated selection differ; notation, identity, direction and guards must not.
    const projection = drawing => ({ kind: drawing.kind, nodes: drawing.nodes, edges: drawing.edges, shown: drawing.shown, notices: drawing.notices });
    assert.deepEqual(projection(capturedNative), projection(pseudoNative), `${capture.pseudo} capture changed notation or model correspondence`);
    capturedViews[capture.pseudo] = { source: capturedSource, modelHash: captureParsed.modelHash, drawing: capturedNative };
  }
  const coverageSource = "package CanvasCoverage { private import StandardViewDefinitions::*; view requirements : GeneralView { filter @SysML::RequirementUsage or @SysML::RequirementDefinition; expose 'Flashlight'::**; } }";
  const coverageDocuments = [...documents, { name: 'coverage.sysml', content: coverageSource }];
  const coverageParsed = await native.call('ParseSources', { documents: coverageDocuments });
  assert.deepEqual(await wasm.call('ParseSources', { documents: coverageDocuments }), coverageParsed, 'Requirement coverage source must parse identically');
  assert.equal(coverageParsed.diagnostics?.length || 0, 0, 'Requirement coverage view must compile without diagnostics');
  const coverageParams = { modelHash: coverageParsed.modelHash, view: 'CanvasCoverage::requirements', includeSemanticIdentity: true };
  const requirementCoverage = await native.call('RenderView', coverageParams);
  assert.deepEqual(await wasm.call('RenderView', coverageParams), requirementCoverage, 'Native requirement discovery must agree in WASM');
  const coverageNodes = new Map(requirementCoverage.nodes.map(node => [node.id, node.semanticId]));
  const coverageEdges = requirementCoverage.edges.map(edge => `${edge.kind}:${coverageNodes.get(edge.from)}->${coverageNodes.get(edge.to)}`);
  assert.ok(coverageEdges.includes('satisfy:Flashlight__light->Flashlight__portable'), 'Native rendering must resolve implicit satisfier');
  assert.ok(coverageEdges.includes('verify:Flashlight__MassCheck->Flashlight__portable'), 'Native rendering must discover verification definition');
  assert.ok(coverageEdges.includes('verify:Flashlight__massCheck->Flashlight__portable'), 'Native rendering must discover inherited verification usage');
  const graph = modelGraph(exported.elements, [adaptNativeView(requirementCoverage, 'CanvasCoverage::requirements')]);
  const portableContext = engineeringContext(graph, { focus: 'Flashlight__portable', depth: 1, budget: 24 });
  const contextIDs = new Set(portableContext.elements.map(element => element.id));
  for (const id of ['Flashlight__light', 'Flashlight__MassCheck', 'Flashlight__massCheck']) assert.ok(contextIDs.has(id), `Standalone requirement context lost native endpoint: ${id}`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ serverInfo, parsed, exported, views, capturedViews, requirementCoverage }, null, 2) + '\n');
  console.log(JSON.stringify({ modelHash, diagnostics: parsed.diagnostics?.length || 0, elements: exported.elements.length, captures: Object.keys(capturedViews),
    views: Object.fromEntries(Object.entries(views).map(([name, view]) => [name, { kind: view.kind, nodes: view.nodes.length, edges: view.edges.length }])) }, null, 2));
} finally { native.close(); }
// Go remains resident by design. This harness owns the process lifetime.
process.exit(0);
