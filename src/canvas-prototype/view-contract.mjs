/** Renderer membership follows the native view kind, never displayed labels. */
export const supportedViewKinds = Object.freeze([
  'requirement', 'definition', 'tree', 'package', 'interconnection', 'action',
  'state', 'sequence', 'fault-tree', 'table', 'matrix', 'case', 'mixed',
]);
export const supportsView = view => supportedViewKinds.includes(typeof view === 'string' ? view : view?.kind);
export const isGridView = view => view?.kind === 'table' || view?.kind === 'matrix';
export function rendererFamily(view) {
  if (isGridView(view)) return 'grid';
  if (view?.kind === 'sequence') return 'sequence';
  return supportsView(view) ? 'graph' : 'unsupported';
}
const identity = value => typeof value === 'string' && value.length ? value : undefined;

/**
 * A semantic element may have several representations. Keep them distinct,
 * including duplicate occurrences of one relationship in a matrix cell.
 * Unknown identities stay unknown: headings and labels never become IDs.
 */
export function representations(view) {
  const result = [];
  const add = (record, item) => result.push({
    ...record, semanticId:identity(item?.semanticId),
    identityStatus:item?.identityStatus ?? (identity(item?.semanticId) ? 'native' : 'unknown'),
    label:item?.name ?? item?.label ?? '', qualifiedName:item?.qualifiedName,
  });
  for (const [index,node] of (view?.nodes ?? []).entries()) add({role:'node',index,representationId:node.id}, node);
  for (const [index,edge] of (view?.edges ?? []).entries()) add({
    role:'edge',index,representationId:edge.id,
    sourceSemanticId:edge.sourceSemanticId ?? edge.semanticSource,
    targetSemanticId:edge.targetSemanticId ?? edge.semanticTarget,
    kind:edge.kind,
  }, edge);
  for (const [row,item] of (view?.rows ?? []).entries()) add({
    role:'row',row,representationId:`row:${row}`,
  }, {...item,name:item.name ?? item.cells?.[0]});
  for (const item of view?.columnElements ?? []) add({
    role:'column',column:item.index,representationId:`column:${item.index}`,
  }, {...item,name:item.name ?? view.columns?.[item.index]});
  for (const cell of view?.relationshipCells ?? []) {
    for (const [index,relationship] of (cell.relationships ?? []).entries()) add({
      role:'cell',row:cell.row,column:cell.column,index,
      representationId:`cell:${cell.row}:${cell.column}:${index}`,
      sourceSemanticId:relationship.sourceSemanticId,
      targetSemanticId:relationship.targetSemanticId,kind:relationship.kind,
    }, relationship);
  }
  return result;
}
export const representedIdentities = view => [...new Set(representations(view).map(r => r.semanticId).filter(Boolean))];

/**
 * A bounded transition scaffold, not a replacement rendering or model query.
 * Native cell endpoints and directions are retained verbatim. Omissions are
 * explicit and never imply that the rest of the grid or model is absent.
 */
export function transitionGraphView(view, {limit=24,focusedId,visibleIds=[]}={}) {
  if (!isGridView(view)) return view;
  const boundedLimit = Number.isInteger(limit) ? Math.max(0, Math.min(limit, 128)) : 24;
  const records = representations(view);
  const elements = records.filter(r => ['row','column','node'].includes(r.role) && r.semanticId);
  const known = new Map();
  for (const item of elements) if (!known.has(item.semanticId)) known.set(item.semanticId,item);
  const cellFocus = records.filter(r => r.role === 'cell' && r.semanticId === focusedId);
  const priority = [focusedId,...cellFocus.flatMap(r => [r.sourceSemanticId,r.targetSemanticId]),...visibleIds,...known.keys()];
  const selected = [...new Set(priority)].filter(id => known.has(id)).slice(0,boundedLimit);
  const ids = new Map(selected.map((id,index) => [id,`grid-transition:${index}`]));
  const nodes = selected.map(id => {
    const item = known.get(id);
    return {id:ids.get(id),semanticId:id,name:item.label,qualifiedName:item.qualifiedName,kind:'element',identityStatus:'native'};
  });
  const edges = records.filter(r => r.role === 'cell' && ids.has(r.sourceSemanticId) && ids.has(r.targetSemanticId)).map(r => ({
    id:r.representationId,semanticId:r.semanticId,identityStatus:r.identityStatus,
    source:ids.get(r.sourceSemanticId),target:ids.get(r.targetSemanticId),
    semanticSource:r.sourceSemanticId,semanticTarget:r.targetSemanticId,kind:r.kind,label:r.label,
  }));
  return {
    id:`transition:${view.id ?? view.kind}`,title:view.title,kind:'definition',nodes,edges,
    transitionOnly:true,sourceViewId:view.id,
    notices:[...(view.notices ?? []),...(known.size > selected.length ? [`Transition shows ${selected.length} of ${known.size} grid elements; the complete grid remains available.`] : [])],
    omissions:[...known.keys()].filter(id => !ids.has(id)).map(id => ({target:id,reason:'transition-budget'})),
  };
}


/** Additional native symbol references displayed inside existing representations.
 * Keep these separate from selection/expose membership: a parameter pin, state
 * action or sequence event is context within its native owner, not a new tile. */
export function nativeViewContextIdentities(view){
 const result=new Set();
 const add=record=>{if(identity(record?.semanticId))result.add(record.semanticId);};
 for(const node of view?.nodes??[]){
  for(const port of node.ports??[])add(port);
  for(const behavior of node.state?.behaviors??[])add(behavior);
 }
 for(const edge of view?.edges??[])for(const event of [edge.notation?.sourceEvent,edge.notation?.targetEvent])add(event);
 for(const order of view?.sequenceOrders??[])for(const event of [order.sourceEvent,order.targetEvent])add(event);
 return [...result];
}
