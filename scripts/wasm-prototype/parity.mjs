#!/usr/bin/env node
/** Exercise the same parsed sources and calls through native JSON-RPC and real WASM. */
import { spawn } from 'node:child_process';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { webcrypto } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { resolve, dirname } from 'node:path';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
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
  for (const capability of ['render_view', 'semantic_rendering_identity', 'export_model','symbol_attributes','evaluate_subject','big_int_values']) assert.ok(serverInfo.capabilities.includes(capability));
  const parsed = await native.call('ParseSources', { documents });
  const wasmParsed = await wasm.call('ParseSources', { documents });
  assert.deepEqual(wasmParsed, parsed, 'Native and WASM parsing must have the same hash, roots and diagnostics');
  const modelHash = parsed.modelHash;
  const exported = await native.call('ExportModel', { modelHash });
  const wasmExported = await wasm.call('ExportModel', { modelHash });
  assert.deepEqual(wasmExported, exported, 'Native and WASM API graph must be identical');
  const declarations = await native.call('ExportModel', { modelHash, projection: 'declarations' });
  const wasmDeclarations = await wasm.call('ExportModel', { modelHash, projection: 'declarations' });
  assert.deepEqual(wasmDeclarations, declarations, 'Declaration projection must agree in native and WASM');
  assert.equal(declarations.projection, 'declarations');
  const sourceDeclarations = exported.elements.filter(element => Object.hasOwn(element, 'sysx:sourceLine'));
  if(!isDeepStrictEqual(declarations.elements,sourceDeclarations)) {
    const expected=new Map(sourceDeclarations.map(element=>[element['@id'],element]));
    const differences=declarations.elements.filter(element=>!isDeepStrictEqual(element,expected.get(element['@id']))).map(element=>({id:element['@id'],properties:[...new Set([...Object.keys(element),...Object.keys(expected.get(element['@id'])||{})])].filter(key=>!isDeepStrictEqual(element[key],expected.get(element['@id'])?.[key])).map(key=>({key,actual:element[key],expected:expected.get(element['@id'])?.[key]}))}));
    await writeFile(resolve(dirname(output),'projection-differences.json'),JSON.stringify(differences,null,2));
    assert.fail('Projected declaration objects changed; see projection-differences.json: '+JSON.stringify(differences.slice(0,3)));
  }
  assert.equal(declarations.elementCount, sourceDeclarations.length);
  assert.equal(declarations.omittedElementCount, exported.elements.length - sourceDeclarations.length);
  assert.ok(declarations.coverageNotice);

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
  const parallelDocuments=[{name:'parallel-identity.sysml',content:`package ParallelIdentity {
    private import StandardViewDefinitions::*;
    part vehicle;
    requirement target;
    satisfy target by vehicle;
    satisfy target by vehicle;
    view relationships : GeneralView { filter @SysML::RequirementUsage; expose target; }
  }`}];
  const parallelParsed=await native.call('ParseSources',{documents:parallelDocuments});
  assert.deepEqual(await wasm.call('ParseSources',{documents:parallelDocuments}),parallelParsed,'Parallel native assertions must parse identically in WASM');
  assert.equal(parallelParsed.diagnostics?.length||0,0);
  const parallelExported=await native.call('ExportModel',{modelHash:parallelParsed.modelHash,projection:'declarations'});
  assert.deepEqual(await wasm.call('ExportModel',{modelHash:parallelParsed.modelHash,projection:'declarations'}),parallelExported);
  const assertionIds=parallelExported.elements.filter(e=>e['@type']==='SatisfyRequirementUsage').map(e=>e['@id']).sort();
  assert.equal(assertionIds.length,2,'Fixture must declare two distinct native satisfaction assertions');
  const parallelParams={modelHash:parallelParsed.modelHash,view:'ParallelIdentity::relationships',includeSemanticIdentity:true};
  const parallelView=await native.call('RenderView',parallelParams);
  assert.deepEqual(await wasm.call('RenderView',parallelParams),parallelView,'Native and WASM must retain every parallel relationship identity');
  assert.deepEqual(await native.call('RenderView',parallelParams),parallelView,'Repeated rendering must not invent occurrences');
  assert.deepEqual(parallelView.edges.filter(e=>e.kind==='satisfy').map(e=>e.semanticId).sort(),assertionIds);
  const parallelGraph=modelGraph(parallelExported.elements,[adaptNativeView(parallelView,'ParallelIdentity::relationships'),adaptNativeView(parallelView,'ParallelIdentity::repeated')]);
  assert.deepEqual(parallelGraph.relationships.filter(e=>e.kind==='satisfy').map(e=>e.nativeRelationship).sort(),assertionIds,'Adapter must deduplicate repeated projections while retaining distinct native assertions');
  const parallelIdentity={assertionIds,view:parallelView};
  const boundedSource = "package BoundedViews { private import StandardViewDefinitions::*; view portable : GeneralView { @OpenSysMLRenderings::RequirementContext { relationshipDepth = 1; } filter @SysML::RequirementUsage; expose Flashlight::portable; } }";
  const boundedDocuments = [...documents, { name: 'bounded.sysml', content: boundedSource }];
  const boundedParsed = await native.call('ParseSources', { documents: boundedDocuments });
  assert.deepEqual(await wasm.call('ParseSources', { documents: boundedDocuments }), boundedParsed);
  assert.equal(boundedParsed.diagnostics?.length || 0, 0);
  const boundedParams = { modelHash: boundedParsed.modelHash, view: 'BoundedViews::portable', includeSemanticIdentity: true };
  const boundedRequirementView = await native.call('RenderView', boundedParams);
  assert.deepEqual(await wasm.call('RenderView', boundedParams), boundedRequirementView, 'Bounded native context must agree in WASM');
  const boundedIDs = new Set(boundedRequirementView.nodes.map(node => node.semanticId));
  assert.ok(boundedIDs.has('Flashlight__light') && boundedIDs.has('Flashlight__massCheck'));
  assert.ok(!boundedIDs.has('Flashlight__controllable'), 'Depth-one context must not follow a newly added satisfier into another requirement');
  const gridDocuments = [{ name: 'grid-parity.sysml', content: `package GridParity {
    private import RequirementDerivation::*;
    part fromPart;
    part toPart;
    dependency linkOne from fromPart to toPart;
    dependency linkTwo from fromPart to toPart;
    dependency backLink from toPart to fromPart;
    requirement sourceReq;
    requirement childReq;
    #derivation connection derivationLink {
      end :> derivedRequirements ::> childReq;
      end :> originalRequirements ::> sourceReq;
    }
  }` }];
  const gridParsed = await native.call('ParseSources', { documents: gridDocuments });
  assert.deepEqual(await wasm.call('ParseSources', { documents: gridDocuments }), gridParsed, 'Grid fixture must parse identically');
  assert.equal(gridParsed.diagnostics?.length || 0, 0, 'Grid fixture must compile without diagnostics');
  const gridExportParams = { modelHash: gridParsed.modelHash, projection: 'declarations' };
  const gridDeclarations = await native.call('ExportModel', gridExportParams);
  assert.deepEqual(await wasm.call('ExportModel', gridExportParams), gridDeclarations, 'Grid declaration identities must agree');
  const gridIDs = new Set(gridDeclarations.elements.map(element => element['@id']));
  const gridParams = { modelHash: gridParsed.modelHash, view: '#matrix:GridParity', includeSemanticIdentity: true };
  const matrix = await native.call('RenderView', gridParams);
  assert.deepEqual(await wasm.call('RenderView', gridParams), matrix, 'Grid axes and every relationship occurrence must agree in native and WASM');
  assert.equal(matrix.kind, 'matrix');
  assert.equal(matrix.columnElements.length, matrix.columns.length - 1, 'Leading label column has no invented target identity');
  const columns = new Map(matrix.columnElements.map(column => {
    assert.ok(column.index > 0 && column.index < matrix.columns.length, 'Column index includes the leading label column');
    assert.equal(column.name, matrix.columns[column.index]);
    assert.equal(column.identityStatus, 'mapped');
    assert.ok(gridIDs.has(column.semanticId), 'Column identity must be native declaration identity');
    return [column.index, column];
  }));
  const expectedRelations = new Map([
    ['GridParity__linkOne', ['GridParity__fromPart', 'GridParity__toPart', 'dependency']],
    ['GridParity__linkTwo', ['GridParity__fromPart', 'GridParity__toPart', 'dependency']],
    ['GridParity__backLink', ['GridParity__toPart', 'GridParity__fromPart', 'dependency']],
    // Matrix derivation follows native original-to-derived axes, independently of diagram arrow conventions.
    ['GridParity__derivationLink', ['GridParity__sourceReq', 'GridParity__childReq', 'derive']]
  ]);
  const foundRelations = new Set();
  let duplicateCell;
  for (const cell of matrix.relationshipCells) {
    assert.ok(Number.isInteger(cell.row) && cell.row >= 0 && cell.row < matrix.rows.length);
    const row = matrix.rows[cell.row], column = columns.get(cell.column);
    assert.ok(column, 'Sparse cell must address a semantic target column');
    assert.equal(row.identityStatus, 'mapped');
    assert.ok(gridIDs.has(row.semanticId));
    assert.ok(row.cells[cell.column], 'Sparse relationship records address nonempty legacy cells');
    for (const relation of cell.relationships) {
      assert.ok(expectedRelations.has(relation.semanticId), `Unexpected relationship ${relation.semanticId}`);
      assert.ok(!foundRelations.has(relation.semanticId), 'Each declaration contributes one occurrence in this fixture');
      assert.equal(relation.identityStatus, 'mapped');
      assert.ok(gridIDs.has(relation.semanticId), 'Cell declaration must occur in native export');
      assert.deepEqual([relation.sourceSemanticId, relation.targetSemanticId, relation.kind], expectedRelations.get(relation.semanticId));
      assert.equal(relation.sourceSemanticId, row.semanticId, 'Native source remains the row axis');
      assert.equal(relation.targetSemanticId, column.semanticId, 'Native target remains the column axis');
      foundRelations.add(relation.semanticId);
    }
    if (cell.relationships.some(relation => relation.semanticId === 'GridParity__linkOne')) duplicateCell = cell;
  }
  assert.equal(foundRelations.size, expectedRelations.size, 'Repeated same-kind native relationships must not collapse');
  assert.deepEqual(duplicateCell.relationships.map(relation => relation.semanticId), ['GridParity__linkOne', 'GridParity__linkTwo']);
  assert.equal(matrix.rows[duplicateCell.row].cells[duplicateCell.column], 'dependency', 'Legacy display still deduplicates the relationship keyword');
  const tableParams = { ...gridParams, view: '#table:GridParity' };
  const table = await native.call('RenderView', tableParams);
  assert.deepEqual(await wasm.call('RenderView', tableParams), table, 'Native table row identities must agree');
  assert.equal(table.kind, 'table');
  assert.ok(table.rows.some(row => row.semanticId === 'GridParity__fromPart'));
  assert.equal(table.columnElements?.length || 0, 0, 'Property headings must not acquire matrix target identities');
  assert.equal(table.relationshipCells?.length || 0, 0, 'Ordinary table values must not acquire fabricated relationships');
  const gridContract = { parsed: gridParsed, declarations: gridDeclarations, matrix, table };
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
  // Additive value metadata must agree and must actually be present. Comparing
  // two empty/dropped payloads would not prove the new semantic contract.
  const valueDocuments=[{name:'attribute-interpolation.sysml',content:await readFile(resolve('tests/fixtures/attribute-interpolation.sysml'),'utf8')}];
  const valueParsed=await native.call('ParseSources',{documents:valueDocuments});
  assert.deepEqual(await wasm.call('ParseSources',{documents:valueDocuments}),valueParsed);
  assert.deepEqual(valueParsed.diagnostics??[],[],'Attribute interpolation fixture must compile');
  const valueSymbols={};
  for(const symbolId of ['AttributeInterpolation::source','AttributeInterpolation::linked']){
    const params={modelHash:valueParsed.modelHash,symbolId},symbol=await native.call('GetSymbol',params);
    assert.deepEqual(await wasm.call('GetSymbol',params),symbol,'Native and WASM typed attribute facts must agree');valueSymbols[symbolId]=symbol;
  }
  assert.deepEqual(valueSymbols['AttributeInterpolation::source'].symbol.attributes.find(a=>a.name==='huge').value,{bigIntValue:'18446744073709551616'},'GetSymbol must not truncate an unbounded integer to int64');
  const evaluatedAttributes={};
  for(const attribute of ['identifier','distance','batteryWhKg','state','huge','unsetInput','sequenceValues']){
    const params={modelHash:valueParsed.modelHash,expression:"'"+attribute+"'",contextSymbolId:'AttributeInterpolation::linked',subjectSymbolId:'AttributeInterpolation::linked'},result=await native.call('Evaluate',params);
    assert.deepEqual(await wasm.call('Evaluate',params),result,'Native and WASM explicit attribute context must agree');assert.ok(!result.error,JSON.stringify(result));evaluatedAttributes[attribute]=result;
  }
  assert.equal(evaluatedAttributes.identifier.result.stringValue,'IC-fixture');
  assert.equal(evaluatedAttributes.distance.result.quantity.unit,'m');assert.deepEqual(evaluatedAttributes.distance.result.quantity.rationalMagnitude,{numerator:'6',denominator:'5'});
  assert.equal(evaluatedAttributes.batteryWhKg.result.intValue,'140');
  assert.equal(evaluatedAttributes.state.result.enumLiteral.literalId,'AttributeInterpolation::Evidence::unknown');
  assert.equal(evaluatedAttributes.state.result.enumLiteral.enumerationId,'AttributeInterpolation::Evidence');
  assert.equal(evaluatedAttributes.huge.result.bigIntValue,'18446744073709551616');
  assert.equal(evaluatedAttributes.unsetInput.result.unset,true,'Unbound inputs remain unset in both runtimes');
  assert.equal(evaluatedAttributes.sequenceValues.result.sequence.elements.length,3,'Collections remain structured native values');
  const valueContract={parsed:valueParsed,symbols:valueSymbols,evaluatedAttributes};

  const galleryDocuments=[{name:'native-gallery.sysml',content:await readFile(resolve('examples/canvas-views/model.sysml'),'utf8')},{name:'notation-parity.sysml',content:await readFile(resolve('tests/fixtures/notation-parity.sysml'),'utf8')}];
  const galleryParsed=await native.call('ParseSources',{documents:galleryDocuments});
  assert.deepEqual(await wasm.call('ParseSources',{documents:galleryDocuments}),galleryParsed);assert.deepEqual(galleryParsed.diagnostics??[],[],'Native notation fixture must compile');
  const galleryDeclarations=await native.call('ExportModel',{modelHash:galleryParsed.modelHash,projection:'declarations'}),galleryIDs=new Set(galleryDeclarations.elements.map(e=>e['@id']));
  assert.deepEqual(await wasm.call('ExportModel',{modelHash:galleryParsed.modelHash,projection:'declarations'}),galleryDeclarations);
  const notationViews={};
  for(const view of ['ViewDemo::BehaviorViews::sequence','ViewDemo::BehaviorViews::states','NativeNotationParity::requirements','NativeNotationParity::pipeline','NativeNotationParity::states']){
    const params={modelHash:galleryParsed.modelHash,view,includeSemanticIdentity:true,show:['parameter-symbols','port-symbols','typings','edge-labels']},drawing=await native.call('RenderView',params);
    assert.deepEqual(await wasm.call('RenderView',params),drawing,'Every structured native notation fact must agree in WASM');notationViews[view]=drawing;
  }
  const sequence=notationViews['ViewDemo::BehaviorViews::sequence'];assert.equal(sequence.sequenceOrdering,'partial-order-linearization');assert.equal(sequence.sequenceOrders.length,2,'Gallery has two explicit native message-event ordering relationships');
  for(const edge of sequence.edges){assert.equal(edge.notation.production,'message');for(const [role,lifeline]of [['sourceEvent',edge.from],['targetEvent',edge.to]]){const event=edge.notation[role];assert.equal(event.kind,'event occurrence');assert.equal(event.lifelineId,lifeline);assert.equal(event.identityStatus,'mapped');assert.ok(galleryIDs.has(event.semanticId));}}
  for(const order of sequence.sequenceOrders){assert.equal(order.kind,'succession');assert.ok(galleryIDs.has(order.semanticId));assert.ok(galleryIDs.has(order.sourceEvent.semanticId));assert.ok(galleryIDs.has(order.targetEvent.semanticId));}
  const derive=notationViews['NativeNotationParity::requirements'].edges.find(e=>e.kind==='derive');assert.ok(derive?.notation);assert.deepEqual([derive.notation.production,derive.notation.sourceRole,derive.notation.targetRole],['derivation','derived','original']);assert.deepEqual([derive.notation.sourceEndName,derive.notation.targetEndName],['detail','basis']);
  const pipeline=notationViews['NativeNotationParity::pipeline'],flow=pipeline.edges.find(e=>e.kind==='flow');assert.equal(flow.notation.production,'flow');assert.ok(flow.fromPort&&flow.toPort);
  const pins=pipeline.nodes.flatMap(node=>node.ports??[]);assert.equal(pins.length,2);assert.deepEqual(pins.map(pin=>pin.direction).sort(),['in','out']);for(const pin of pins){assert.equal(pin.parameter,true);assert.equal(pin.identityStatus,'mapped');assert.ok(galleryIDs.has(pin.semanticId));}
  const state=notationViews['NativeNotationParity::states'].nodes.find(node=>node.state?.behaviors?.length===3);assert.ok(state,'Structured entry/do/exit roles must not be flattened away');assert.equal(state.state.parallel,true);assert.deepEqual(state.state.behaviors.map(b=>b.role),['entry','do','exit']);for(const behavior of state.state.behaviors){assert.equal(behavior.identityStatus,'mapped');assert.ok(galleryIDs.has(behavior.semanticId));assert.ok(behavior.text);}
  const notationContract={parsed:galleryParsed,views:notationViews};
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, JSON.stringify({ serverInfo, parsed, exported, declarations, views, capturedViews, requirementCoverage, boundedRequirementView, gridContract, parallelIdentity,valueContract,notationContract }, null, 2) + '\n');
  console.log(JSON.stringify({ modelHash, diagnostics: parsed.diagnostics?.length || 0, elements: exported.elements.length, declarations: declarations.elementCount, omittedElements: declarations.omittedElementCount, captures: Object.keys(capturedViews), gridRelationships: foundRelations.size, parallelRelationships: assertionIds.length,valueAttributes:Object.keys(evaluatedAttributes).length,notationViews:Object.keys(notationViews).length,
    views: Object.fromEntries(Object.entries(views).map(([name, view]) => [name, { kind: view.kind, nodes: view.nodes.length, edges: view.edges.length }])) }, null, 2));
} finally { native.close(); }
// Go remains resident by design. This harness owns the process lifetime.
process.exit(0);
