/**
 * Scene display policy, separate from native view membership and model queries.
 * These preferences never select model content, invent ownership, filter an
 * active relationship, or evaluate author-supplied expressions.
 */
export const PRESENTATION_RELATIONSHIP_KINDS = Object.freeze([
  'connection', 'transition', 'succession', 'flow', 'binding',
  'specialization', 'typing', 'composition', 'reference', 'containment',
  'import', 'satisfy', 'verify', 'derive', 'refine', 'allocate',
  'association', 'include', 'anchor', 'dependency',
]);
const keys = new Set(['compartments', 'expanded', 'emphasis', 'contextBudget', 'grouping']);
const kinds = new Set(PRESENTATION_RELATIONSHIP_KINDS);
const own = (value, key) => Object.hasOwn(value, key);
const fail = message => { throw new TypeError(`Scene presentation: ${message}`); };

function stringList(value, key, allowed) {
  if (!Array.isArray(value)) fail(`${key} must be an array`);
  const result = [];
  for (const entry of value) {
    if (typeof entry !== 'string' || !entry.trim() || entry !== entry.trim()) {
      fail(`${key} entries must be nonempty strings without surrounding whitespace`);
    }
    if (allowed && !allowed.has(entry)) fail(`unsupported ${key} relationship kind "${entry}"`);
    if (!result.includes(entry)) result.push(entry);
  }
  return result;
}

/**
 * Validate and copy JSON-compatible author intent. contextBudget is optional
 * here because its default is independent of viewport width. Expanded entries remain
 * native references until resolvePresentation resolves them through the caller's
 * authoritative native identity index. No fallback name/label lookup is used.
 */
export function validatePresentation(config = {}) {
  if (!config || typeof config !== 'object' || Array.isArray(config)
    || ![Object.prototype, null].includes(Object.getPrototypeOf(config))) {
    fail('configuration must be a plain object');
  }
  if (Object.getOwnPropertySymbols(config).length) fail('symbol keys are not supported');
  for (const key of Object.getOwnPropertyNames(config)) {
    if (!keys.has(key)) fail(`unknown option "${key}"`);
    const descriptor = Object.getOwnPropertyDescriptor(config, key);
    if (!descriptor.enumerable || !own(descriptor, 'value')) fail(`${key} must be an ordinary JSON property`);
  }
  const compartments = own(config, 'compartments') ? config.compartments : 'auto';
  if (!['auto', 'compact', 'expanded'].includes(compartments)) fail('compartments must be auto, compact or expanded');
  const grouping = own(config, 'grouping') ? config.grouping : 'none';
  if (!['none', 'owner'].includes(grouping)) fail('grouping must be none or owner');
  const expanded = stringList(own(config, 'expanded') ? config.expanded : [], 'expanded');
  const emphasis = stringList(own(config, 'emphasis') ? config.emphasis : [], 'emphasis', kinds);
  const result = {compartments, expanded, emphasis, grouping};
  if (own(config, 'contextBudget')) {
    if (!Number.isInteger(config.contextBudget) || config.contextBudget < 0 || config.contextBudget > 256) {
      fail('contextBudget must be an integer from 0 through 256');
    }
    result.contextBudget = config.contextBudget;
  }
  return result;
}

/**
 * Resolve explicit expanded references at project compilation using a native
 * resolver, which must return an unambiguous native id string or element {id}.
 * grouping:'owner' is only a soft layout hint using actual native ownership.
 * emphasis reduces nonmatching active-edge emphasis; it must never hide edges.
 */
export function resolvePresentation(config = {}, {width = 1024, resolve} = {}) {
  const presentation = validatePresentation(config);
  if (!Number.isFinite(width) || width <= 0) fail('viewport width must be a positive finite number');
  if (presentation.expanded.length && typeof resolve !== 'function') {
    fail('expanded references require a native identity resolver');
  }
  const expandedIds = [];
  for (const reference of presentation.expanded) {
    let element;
    try { element = resolve(reference); }
    catch (cause) { throw new TypeError(`Scene presentation: cannot resolve expanded reference "${reference}": ${cause?.message??String(cause)}`, {cause}); }
    const id = typeof element === 'string' ? element : element && !Array.isArray(element) ? element.id : null;
    if (typeof id !== 'string' || !id.trim() || id !== id.trim()) {
      fail(`unresolved or ambiguous expanded reference "${reference}"`);
    }
    if (!expandedIds.includes(id)) expandedIds.push(id);
  }
  return {...presentation, contextBudget: presentation.contextBudget ?? 48, expandedIds};
}
