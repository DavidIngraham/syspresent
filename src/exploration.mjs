/** Pure snapshot navigation; relationship semantics are supplied by the native exporter. */
export function initialState(focus, config = {}) {
  return {focus, view: null, expanded: [], pinned: [], nodeTypes: [...(config.defaultNodeTypes ?? [])], relationshipTypes: [...(config.defaultRelationshipTypes ?? [])], budget: config.contextLimit ?? 24};
}

// Native API plumbing remains available through explicit relationship filters.
export function engineeringEdge(edge, index) {
  if (edge.authority !== 'native-api-property') return true;
  if (edge.kind === 'type') return /Usage$/.test(index.get(edge.source)?.kind ?? '') || index.get(edge.source)?.kind === 'Feature';
  return edge.kind === 'ownedMember' && ['ConstraintUsage', 'ConstraintDefinition', 'AssertConstraintUsage'].includes(index.get(edge.target)?.kind);
}

export function requirementUsages(bundle, ids) {
  const index = new Map(bundle.elements.map(e => [e.id, e]));
  const definitions = new Set(ids.filter(id => index.get(id)?.kind === 'RequirementDefinition'));
  return [...new Set(bundle.relationships.filter(e => e.kind === 'type' && definitions.has(e.target)
    && index.get(e.source)?.kind === 'RequirementUsage').map(e => e.source))];
}

export function context(bundle, state) {
  const index = new Map(bundle.elements.map(element => [element.id, element]));
  if (!index.has(state.focus)) throw new Error(`Unknown focus: ${state.focus}`);
  const roots = new Set([state.focus, ...state.pinned]);
  const wanted = new Set(roots);
  const omissions = [];
  const allowedNode = id => !state.nodeTypes.length || state.nodeTypes.includes(index.get(id)?.kind);
  const allowedEdge = edge => state.relationshipTypes.length ? state.relationshipTypes.includes(edge.kind) : engineeringEdge(edge, index);
  const pending = new Set([state.focus, ...state.expanded, ...requirementUsages(bundle, [state.focus, ...state.expanded])]);
  const visited = new Set();
  for (;;) {
    const id = [...pending].find(candidate => wanted.has(candidate) && !visited.has(candidate));
    if (id === undefined) break;
    visited.add(id);
    for (const edge of bundle.relationships.filter(edge => edge.source === id || edge.target === id).sort((a,b) => Number(b.authority === 'native-render-view') - Number(a.authority === 'native-render-view'))) {
      const other = edge.source === id ? edge.target : edge.source;
      let reason;
      if (!index.has(other)) reason = 'unavailable';
      else if (!allowedEdge(edge)) reason = 'relationship-filter';
      else if (!allowedNode(other) && !roots.has(other)) reason = 'node-filter';
      else if (!wanted.has(other) && wanted.size >= state.budget) reason = 'budget';
      if (reason) omissions.push({from: id, target: other, relationship: edge.id, reason});
      else wanted.add(other);
    }
  }
  return {
    elements: [...wanted].map(id => index.get(id)).filter(Boolean),
    relationships: [...new Map(bundle.relationships.filter(edge => wanted.has(edge.source) && wanted.has(edge.target) && allowedEdge(edge)).map(edge => [JSON.stringify([edge.source, edge.target, edge.kind, edge.label]), edge])).values()],
    omissions,
    filters: {nodeTypes: state.nodeTypes, relationshipTypes: state.relationshipTypes},
  };
}

export class Navigation {
  constructor(state) { this.entries = [structuredClone(state)]; this.position = 0; }
  get state() { return structuredClone(this.entries[this.position]); }
  update(patch) {
    this.entries.splice(this.position + 1);
    this.entries.push({...this.state, ...structuredClone(patch)});
    this.position++;
    return this.state;
  }
  back() { this.position = Math.max(0, this.position - 1); return this.state; }
  forward() { this.position = Math.min(this.entries.length - 1, this.position + 1); return this.state; }
  reset(state) { return this.update(state); }
}

// Transport bounds protect the browser; they are not graph-readability thresholds.
export const SHARED_STATE_LIMITS = Object.freeze({hash: 131072, identifier: 4096, filter: 256,
  annotationText: 8192, elements: 1000, filters: 128, annotations: 100, placements: 100,
  coordinate: 1e7, minZoom: 0.0001, maxZoom: 10000});

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    && Object.getPrototypeOf(value) === Object.prototype;
}
function keys(value, allowed, required = []) {
  if (!object(value) || Object.keys(value).some(key => !allowed.includes(key))
      || required.some(key => !Object.hasOwn(value, key))) throw new Error('Invalid shared state fields');
}
function text(value, limit, multiline = false) {
  if (typeof value !== 'string' || !value.length || value.length > limit
      || (multiline ? /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/ : /[\u0000-\u001f\u007f]/).test(value)) {
    throw new Error('Invalid shared state string');
  }
}
function strings(value, count, length) {
  if (!Array.isArray(value) || value.length > count) throw new Error('Invalid shared state array');
  for (const item of value) text(item, length);
  if (new Set(value).size !== value.length) throw new Error('Duplicate shared state entries');
}
function coordinate(value) {
  if (typeof value !== 'number' || !Number.isFinite(value) || Math.abs(value) > SHARED_STATE_LIMITS.coordinate) {
    throw new Error('Invalid scene coordinate');
  }
}
function validateScene(scene, view, bundle) {
  if (scene === undefined || scene === null) return;
  keys(scene, ['annotations', 'placements', 'camera', 'presentationPreferences']);
  if (scene.presentationPreferences !== undefined) {
    keys(scene.presentationPreferences, ['showCompartments']);
    if (typeof scene.presentationPreferences.showCompartments !== 'boolean') throw new Error('Invalid scene compartment preference');
  }
  const populated = Object.values(scene).some(value => value !== undefined);
  if (populated && view === null) throw new Error('Scene options require a native view');
  const members = bundle && view !== null ? new Set(bundle.views.find(item => item.id === view).elementIds) : null;
  const target = identity => {
    text(identity, SHARED_STATE_LIMITS.identifier);
    if (members && !members.has(identity)) throw new Error('Scene target absent from selected view');
  };
  for (const field of ['annotations', 'placements']) {
    if (scene[field] === undefined) continue;
    if (!Array.isArray(scene[field]) || scene[field].length > SHARED_STATE_LIMITS[field]) throw new Error('Invalid scene options array');
    const seen = new Set();
    for (const item of scene[field]) {
      const allowed = field === 'annotations' ? ['target', 'text'] : ['target', 'x', 'y'];
      keys(item, allowed, allowed);
      target(item.target);
      if (seen.has(item.target)) throw new Error('Duplicate scene target');
      seen.add(item.target);
      if (field === 'annotations') text(item.text, SHARED_STATE_LIMITS.annotationText, true);
      else { coordinate(item.x); coordinate(item.y); }
    }
  }
  if (scene.camera !== undefined) {
    keys(scene.camera, ['target', 'zoom'], ['target', 'zoom']);
    target(scene.camera.target);
    if (typeof scene.camera.zoom !== 'number' || !Number.isFinite(scene.camera.zoom)
        || scene.camera.zoom < SHARED_STATE_LIMITS.minZoom || scene.camera.zoom > SHARED_STATE_LIMITS.maxZoom) {
      throw new Error('Invalid scene camera zoom');
    }
  }
}
function validateShared(value, expectedSnapshot, bundle) {
  keys(value, ['version', 'snapshotId', 'stop', 'exploration'], ['version', 'snapshotId', 'exploration']);
  text(value.snapshotId, SHARED_STATE_LIMITS.identifier);
  if (value.version !== 1 || value.snapshotId !== expectedSnapshot) throw new Error('Snapshot mismatch');
  if (value.stop !== undefined && value.stop !== null) text(value.stop, SHARED_STATE_LIMITS.identifier);
  const state = value.exploration;
  if (state === null) return [];
  const fields = ['focus', 'view', 'expanded', 'pinned', 'nodeTypes', 'relationshipTypes', 'budget'];
  keys(state, [...fields, 'sceneOptions'], fields);
  text(state.focus, SHARED_STATE_LIMITS.identifier);
  if (!Number.isInteger(state.budget) || state.budget < 1 || state.budget > 1000) throw new Error('Invalid context limit');
  for (const field of ['expanded', 'pinned']) strings(state[field], SHARED_STATE_LIMITS.elements, SHARED_STATE_LIMITS.identifier);
  for (const field of ['nodeTypes', 'relationshipTypes']) strings(state[field], SHARED_STATE_LIMITS.filters, SHARED_STATE_LIMITS.filter);
  if (state.view !== null) {
    text(state.view, SHARED_STATE_LIMITS.identifier);
    if (bundle && !bundle.views.some(view => view.id === state.view)) throw new Error('Unknown view');
  }
  validateScene(state.sceneOptions, state.view, bundle);
  if (!bundle) return [];
  const ids = new Set([...bundle.elements.filter(element => element.exported !== false),
    ...(bundle.searchIndex ?? []).filter(element => element.exported === true)].map(element => element.id));
  const unknown = [...new Set([state.focus, ...state.expanded, ...state.pinned])].filter(id => !ids.has(id));
  if (unknown.length) {
    const store = bundle.modelStore;
    // Unnamed declarations are absent from the search catalog. Accept bounded
    // candidates only provisionally: the caller must resolve them from shards.
    if (!store || store.schemaVersion !== 'syspresent.model-shards.v1' || store.addressing !== 'sha256-utf8-first2'
        || !object(store.shards) || !Object.keys(store.shards).some(key => /^[0-9a-f]{2}$/.test(key))) {
      throw new Error('Unknown model element');
    }
  }
  return unknown;
}

export function shareState(snapshotId, stop, exploration = null) {
  const value = {version: 1, snapshotId, stop, exploration};
  validateShared(value, snapshotId);
  const hash = '#state=' + encodeURIComponent(JSON.stringify(value));
  if (hash.length > SHARED_STATE_LIMITS.hash) throw new Error('Shared state exceeds link size limit');
  return hash;
}

export function restoreState(hash, expectedSnapshot, bundle) {
  if (typeof hash !== 'string' || hash.length > SHARED_STATE_LIMITS.hash || !hash.startsWith('#state=')) throw new Error('Invalid shared state or link size');
  const value = JSON.parse(decodeURIComponent(hash.slice(7)));
  const unresolved = validateShared(value, expectedSnapshot, bundle);
  // These IDs are candidates, not assertions of existence. The async store
  // must verify every one before restoring the navigation state.
  if (unresolved.length) value.unresolvedElementIds = unresolved;
  return value;
}
