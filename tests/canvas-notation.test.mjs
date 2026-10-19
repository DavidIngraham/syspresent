import test from 'node:test';
import assert from 'node:assert/strict';
import {edgeAppearance, edgeLayoutHints, continuationAppearance, markerDefinition} from '../src/canvas-prototype/notation.mjs';

// The native renderer's all-EdgeKind DOT fixture is the style oracle. Source and
// target mean native From/To; no ranking or layout operation may swap them.
const styles = {
  connection: ['solid', 'none', 'none', false],
  transition: ['solid', 'none', 'filled-arrow', true],
  succession: ['solid', 'none', 'filled-arrow', true],
  flow: ['dashed', 'none', 'filled-arrow', true],
  binding: ['solid', 'none', 'none', false],
  specialization: ['solid', 'none', 'hollow-triangle', true],
  typing: ['dashed', 'none', 'hollow-triangle', true],
  composition: ['solid', 'diamond', 'none', true],
  reference: ['solid', 'hollow-diamond', 'none', true],
  containment: ['solid', 'containment', 'none', true],
  import: ['dashed', 'none', 'open-arrow', true],
  satisfy: ['dashed', 'none', 'open-arrow', true],
  verify: ['dashed', 'none', 'open-arrow', true],
  derive: ['dashed', 'none', 'open-arrow', true],
  refine: ['dashed', 'none', 'open-arrow', true],
  allocate: ['dashed', 'none', 'open-arrow', true],
  association: ['solid', 'none', 'none', false],
  include: ['dashed', 'none', 'filled-arrow', true],
  anchor: ['dashed', 'none', 'none', false],
  dependency: ['dashed', 'none', 'open-arrow', true],
};
for (const [kind, expected] of Object.entries(styles)) test(`native ${kind} notation retains endpoint meaning`, () => {
  const edge = Object.freeze({kind, source: 'native-from', target: 'native-to', label: '  native «label»  '});
  const a = edgeAppearance(edge);
  assert.deepEqual([a.line, a.sourceMarker, a.targetMarker, a.directed], expected);
  assert.equal(a.label, edge.label);
  assert.equal(a.supported, true);
  assert.equal(edge.source, 'native-from');
  assert.equal(edge.target, 'native-to');
});

test('native case/mixed typing and reference retain their context-specific open arrow', () => {
  for (const viewKind of ['case', 'mixed']) for (const kind of ['typing', 'reference']) {
    const a = edgeAppearance({kind}, {viewKind});
    assert.deepEqual([a.line, a.sourceMarker, a.targetMarker], ['dashed', 'none', 'open-arrow']);
  }
  assert.equal(edgeAppearance({kind: 'reference', viewKind: 'mixed'}).targetMarker, 'open-arrow');
  assert.equal(edgeAppearance({kind: 'reference'}, {viewKind: 'definition'}).sourceMarker, 'hollow-diamond');
});

test('unknown notation is disclosed and labels cannot invent direction or relationship type', () => {
  for (const kind of ['future-kind', undefined, 'constructor', '__proto__']) {
    const a = edgeAppearance({kind, label: 'derive flow ->'});
    assert.equal(a.supported, false);
    assert.match(a.notice, /Unsupported relationship notation/);
    assert.equal(a.directed, false);
    assert.equal(a.sourceMarker, 'none');
    assert.equal(a.targetMarker, 'none');
  }
  assert.equal(edgeAppearance({kind: 'connection', label: 'flow ->', directed: true}).directed, false);
  assert.equal(edgeAppearance({kind: 'succession', label: ''}).targetMarker, 'filled-arrow');
});

test('ranking follows engineering structure without reversing native endpoints or behavior order', () => {
  for (const kind of ['derive', 'specialization', 'typing']) assert.equal(edgeLayoutHints({kind}).rank, 'target-above-source');
  for (const kind of ['composition', 'containment', 'reference']) assert.equal(edgeLayoutHints({kind}).rank, 'source-above-target');
  for (const kind of ['transition', 'succession', 'flow']) assert.equal(edgeLayoutHints({kind}).rank, 'source-before-target');
  for (const kind of ['connection', 'binding', 'association', 'dependency', 'satisfy', 'verify', 'allocate']) assert.equal(edgeLayoutHints({kind}).rank, 'free');
  assert.equal(edgeLayoutHints({kind: 'reference'}, {viewKind: 'case'}).rank, 'free');
  assert.equal(edgeLayoutHints({kind: 'derive'}).preserveEndpoints, true);
});

test('display attachment positions neither create nor replace native modeled ports', () => {
  const edge = {kind: 'connection', fromPort: 'actual-native-port', toPort: '', sourceAnchor: 'layout-west'};
  const before = structuredClone(edge);
  edgeAppearance(edge);
  edgeLayoutHints(edge);
  assert.deepEqual(edge, before);
  assert.equal('fromPort' in edgeAppearance({kind: 'connection'}), false);
});

test('context continuation uses an unfilled chevron rather than a junction dot', () => {
  const a = continuationAppearance();
  assert.equal(a.marker, 'continuation-chevron');
  assert.equal(a.filled, false);
  assert.equal(a.semantic, false);
});


test('SVG marker geometry distinguishes hollow definitions, filled ownership and open continuation', () => {
  for (const name of ['open-arrow', 'filled-arrow', 'hollow-triangle', 'diamond', 'hollow-diamond', 'containment', 'continuation-chevron']) {
    const d = markerDefinition(name);
    assert.equal(d.orient, 'auto-start-reverse');
    assert.ok(d.path);
  }
  assert.equal(markerDefinition('diamond').fill, 'line');
  assert.equal(markerDefinition('hollow-diamond').fill, 'background');
  assert.equal(markerDefinition('hollow-triangle').fill, 'background');
  assert.equal(markerDefinition('containment').fill, 'background');
  assert.equal(markerDefinition('continuation-chevron').fill, 'none');
  assert.equal(markerDefinition('none'), null);
  assert.equal(markerDefinition('constructor'), null);
});
