/** Browser preferences never modify native membership or exported scene intent. */
const key = 'syspresent.reader.v1';
export const defaults = Object.freeze({compartments: 'all', routing: 'square'});
export function readerSettings(value = {}) {
  return {
    compartments: ['all', 'none', 'focused'].includes(value?.compartments) ? value.compartments : defaults.compartments,
    routing: ['square', 'mind-map'].includes(value?.routing) ? value.routing : defaults.routing,
  };
}
export function loadReaderSettings(storage) {
  try { return readerSettings(JSON.parse(storage.getItem(key) || '{}')); }
  catch { return {...defaults}; }
}
export function saveReaderSettings(storage, value) {
  const settings = readerSettings(value);
  try { storage.setItem(key, JSON.stringify(settings)); } catch { /* Private browsing may deny storage. */ }
  return settings;
}
export function compartmentVisible(node, {mode='all', focus, expanded=new Set(), collapsed=new Set()} = {}) {
  if (collapsed.has(node.semanticId)) return false;
  if (expanded.has(node.semanticId)) return true;
  return mode === 'all' || mode === 'focused' && !!node.semanticId && node.semanticId === focus;
}
