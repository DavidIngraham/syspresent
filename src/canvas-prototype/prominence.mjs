/**
 * Presentation ranking of the available native projection, not model importance
 * or engineering acceptance. No names or qualified-name prefixes define scope.
 *
 * Score = 3 log2(1 + distinct structural children)
 *       + 1 log2(1 + descendants)
 *       + 2 log2(1 + distinct engineering neighbors)
 *       + 2 log2(1 + neighbors in other top-level native branches).
 * Ownership/composition are counted structurally, never again as connections.
 * Descendant walks stop at 256 identities or 4096 inspected adjacency entries.
 * Capped values are lower bounds. Each walk has fixed work limits: a 13k-node
 * deep or cyclic model cannot trigger an all-pairs transitive closure.
 */
const DESCENDANT_CAP = 256;
const DESCENDANT_WORK_CAP = 4096;
const MAX_OVERVIEW_TILES = 10;
const defaultIndexes = new WeakMap();
const scopedIndexes = new WeakMap();
const packageKind = kind => kind === 'Package';
const engineeringCategory = /^(?:Package|Namespace)$|^(?:Requirement|Concern|Part|Action|State|VerificationCase|AnalysisCase|UseCase|Case|Constraint|Calculation|Interface|Connection|Port|Attribute|Item|Occurrence|Enumeration|Actor)(?:Definition|Usage)$/;
const excludedConnections = new Set(['containment','composition','owner','owningMembership','ownedMembership','membership','documentation','typing','type','specialization']);
const compareText = (a,b) => a < b ? -1 : a > b ? 1 : 0;
const idText = id => typeof id === 'string' && id.length > 0;
const copy = value => structuredClone(value);
// Native qualified names may name generated anonymous members (for example @3).
// Only an explicit native long/short declared name establishes eligibility.
const named = element => idText(element.native?.declaredName) || idText(element.native?.declaredShortName);
const eligible = element => element?.layer === 'project' && named(element) && engineeringCategory.test(element.kind ?? '');
const edgeKey = edge => JSON.stringify([edge.semanticId ?? edge.nativeRelationship ?? edge.id ?? null,edge.source,edge.target,edge.kind]);

function nativeStructure(graph) {
  const children = new Map(),parents = new Map();
  const add = edge => {
    if (!idText(edge.source) || !idText(edge.target) || edge.source === edge.target) return;
    if (!children.has(edge.source)) children.set(edge.source,new Set());
    if (!parents.has(edge.target)) parents.set(edge.target,new Set());
    children.get(edge.source).add(edge.target); parents.get(edge.target).add(edge.source);
  };
  for (const edge of graph.containment ?? []) if (edge.nativeRole === 'owner') add(edge);
  for (const edge of graph.relationships ?? []) if (edge.kind === 'composition') add(edge);
  return {children,parents};
}

/** Native owner/composition closure, including explicit roots and unknown targets. */
function descendantClosure(children, rootIds) {
  const seen = new Set((rootIds ?? []).filter(idText));
  const queue = [...seen];
  for (let i=0;i<queue.length;i++) for (const child of children.get(queue[i]) ?? []) {
    if (!seen.has(child)) { seen.add(child); queue.push(child); }
  }
  return [...seen].sort(compareText);
}
export function nativeScopeIds(graph, rootIds) {
  return descendantClosure(nativeStructure(graph).children,rootIds);
}

function prepare(graph, scopeIds) {
  const scope = scopeIds === undefined ? null : new Set(scopeIds);
  const elements = new Map((graph.elements ?? []).filter(element => eligible(element) && (!scope || scope.has(element.id))).map(element => [element.id,element]));
  const keys = new Map((graph.elements ?? []).map(element => [element.id,element.qualifiedName ?? element.native?.declaredName ?? element.native?.declaredShortName ?? element.name ?? element.id]));
  const compareNames = (a,b) => compareText(keys.get(a) ?? a,keys.get(b) ?? b) || compareText(a,b);
  const native = nativeStructure(graph),children = new Map(),parents = new Map();
  for (const id of elements.keys()) {
    children.set(id,[...(native.children.get(id) ?? [])].filter(child => elements.has(child)).sort(compareNames));
    parents.set(id,[...(native.parents.get(id) ?? [])].filter(parent => elements.has(parent)).sort(compareNames));
  }
  return {elements,children,parents,compareNames};
}

function descendantsOf(id, children) {
  const seen = new Set([id]),queue = [id];
  let work=0,capped=false;
  outer: for (let i=0;i<queue.length;i++) for (const child of children.get(queue[i]) ?? []) {
    if (++work > DESCENDANT_WORK_CAP) { capped=true; break outer; }
    if (seen.has(child)) continue;
    seen.add(child);queue.push(child);
    if (seen.size-1 >= DESCENDANT_CAP) { capped=true; break outer; }
  }
  return {descendants:seen.size-1,descendantsCapped:capped};
}

/** Skip only single-child package wrappers, never a part or behavioral owner. */
function promotedRoot(id, data) {
  const visited = new Set();
  while (packageKind(data.elements.get(id)?.kind) && data.children.get(id)?.length === 1) {
    visited.add(id);
    const next=data.children.get(id)[0];
    if (visited.has(next)) break;
    id=next;
  }
  return id;
}

function branchIdentities(data) {
  const ids=[...data.elements.keys()].sort(data.compareNames),assigned=new Map(),queue=[];
  const seedRoot = root => {
    if (assigned.has(root)) return;
    assigned.set(root,root);
    const promoted=promotedRoot(root,data);
    // Native wrapper chains stay with their root. Its substantial children
    // become branch seeds before the breadth-first traversal.
    let current=root;const visited=new Set();
    while (current !== promoted && !visited.has(current)) {
      visited.add(current); assigned.set(current,root);
      current=data.children.get(current)?.[0];
    }
    assigned.set(promoted,root);
    for (const child of data.children.get(promoted) ?? []) if (!assigned.has(child)) {
      assigned.set(child,child);queue.push(child);
    }
  };
  const drain = () => {
    for (let i=0;i<queue.length;i++) {
      const id=queue[i];
      for (const child of data.children.get(id) ?? []) if (!assigned.has(child)) {
        assigned.set(child,assigned.get(id));queue.push(child);
      }
    }
    queue.length=0;
  };
  for (const id of ids) if (!data.parents.get(id).length) seedRoot(id);
  drain();
  // Malformed native containment can contain cycles. Choose a deterministic
  // remaining seed and traverse once; never recurse or invent a parent.
  for (const id of ids) if (!assigned.has(id)) { seedRoot(id);drain(); }
  return assigned;
}

/**
 * Indexes are cached by immutable graph snapshot identity and, when supplied,
 * immutable scope Array/Set identity. Callers that change either must supply a
 * new object. Equivalent scope values in a new container are independent.
 */
export function createProminenceIndex(graph, {scopeIds}={}) {
  if (scopeIds === undefined && defaultIndexes.has(graph)) return defaultIndexes.get(graph);
  const cacheableScope=scopeIds !== null && typeof scopeIds === 'object';
  if (cacheableScope && scopedIndexes.get(graph)?.has(scopeIds)) return scopedIndexes.get(graph).get(scopeIds);
  const data=prepare(graph,scopeIds),branches=branchIdentities(data),neighbors=new Map();
  for (const id of data.elements.keys()) neighbors.set(id,new Set());
  for (const edge of graph.relationships ?? []) {
    if (edge.navigationOnly || excludedConnections.has(edge.kind) || edge.source === edge.target || !neighbors.has(edge.source) || !neighbors.has(edge.target)) continue;
    neighbors.get(edge.source).add(edge.target);neighbors.get(edge.target).add(edge.source);
  }
  const metrics=new Map();
  for (const id of [...data.elements.keys()].sort(data.compareNames)) {
    const children=data.children.get(id).length,descendants=descendantsOf(id,data.children),connections=neighbors.get(id).size;
    const crossBranchConnections=[...neighbors.get(id)].filter(other => branches.get(other) !== branches.get(id)).length;
    const score=3*Math.log2(1+children)+Math.log2(1+descendants.descendants)+2*Math.log2(1+connections)+2*Math.log2(1+crossBranchConnections);
    metrics.set(id,{children,...descendants,connections,crossBranchConnections,score});
  }
  const compare=(a,b) => {
    const am=metrics.get(a),bm=metrics.get(b);
    return Number(!!bm)-Number(!!am) || (bm?.score ?? 0)-(am?.score ?? 0) || data.compareNames(a,b);
  };
  const result={metrics,compare};
  if (scopeIds === undefined) defaultIndexes.set(graph,result);
  else if (cacheableScope) {
    if (!scopedIndexes.has(graph)) scopedIndexes.set(graph,new WeakMap());
    scopedIndexes.get(graph).set(scopeIds,result);
  }
  return result;
}

/**
 * Select a bounded, coherent native overview. Represent every disconnected root
 * before allocating extra slots, then each root's direct children before deeper
 * descendants. Deeper expansion rotates across already represented branches.
 * With multiple roots, a direct-child round must fit one child for every still
 * expandable represented root. The budget may remain partly unused to avoid
 * showing arbitrary extra detail for only the first few disconnected roots.
 * Output contains copied native elements and edges; no aggregate node or link
 * stands in for omitted descendants.
 */
export function buildSystemOverview(graph, {rootIds,budget=9}={}) {
  if (!Number.isInteger(budget) || budget < 0) throw Error('Overview budget must be a nonnegative integer');
  const limit=Math.min(MAX_OVERVIEW_TILES,budget),all=prepare(graph),structure=nativeStructure(graph),allElements=new Map((graph.elements ?? []).map(element => [element.id,element]));
  const explicit=Array.isArray(rootIds) && rootIds.length>0;
  let requested=[...new Set((rootIds ?? []).filter(idText))];
  if (!explicit) {
    requested=[...all.elements.keys()].filter(id => !all.parents.get(id).length).sort(all.compareNames);
    // Include disconnected cyclic components, too.
    const covered=new Set(descendantClosure(structure.children,requested));
    for (const id of [...all.elements.keys()].sort(all.compareNames)) if (!covered.has(id)) {
      requested.push(id);for (const member of descendantClosure(structure.children,[id])) covered.add(member);
    }
  }
  const scopeIds=descendantClosure(structure.children,requested),scope=new Set(scopeIds),data=prepare(graph,scopeIds),index=createProminenceIndex(graph,{scopeIds});
  const omissions=[],effectiveRoots=[];
  for (const root of [...requested].sort(index.compare)) {
    if (!data.elements.has(root)) {
      omissions.push({target:root,reason:allElements.has(root)?'element-policy':'unavailable-root'});
      continue;
    }
    const promoted=promotedRoot(root,data);
    if (!effectiveRoots.includes(promoted)) effectiveRoots.push(promoted);
  }
  // An explicitly supplied ancestor and descendant are one connected scope.
  // Keep their native identity entries; a Set below prevents duplicate tiles.
  effectiveRoots.sort(index.compare);
  const chosen=new Set(),add=id => {if (chosen.size < limit) chosen.add(id);};
  for (const root of effectiveRoots) add(root);
  const rootQueues=effectiveRoots.filter(root => chosen.has(root)).map(root => ({
    root,ids:[...data.children.get(root)].sort(index.compare),offset:0,
  }));
  let partialRootRound=false;
  while (chosen.size < limit) {
    const expandable=[];
    for (const queue of rootQueues) {
      while (queue.offset < queue.ids.length && chosen.has(queue.ids[queue.offset])) queue.offset++;
      if (queue.offset < queue.ids.length) expandable.push(queue);
    }
    if (!expandable.length) break;
    if (rootQueues.length>1 && expandable.length>limit-chosen.size) {partialRootRound=true;break;}
    for (const queue of expandable) if (chosen.size<limit) add(queue.ids[queue.offset++]);
  }
  const branches=[];
  for (const queue of rootQueues) for (const child of queue.ids) if (chosen.has(child)) {
    branches.push({ids:(data.children.get(child) ?? []).map(id => ({id,depth:2})).sort((a,b) => index.compare(a.id,b.id)),offset:0,queued:new Set([child,...(data.children.get(child) ?? [])])});
  }
  while (chosen.size < limit && !partialRootRound) {
    for (const branch of branches) while (branch.offset < branch.ids.length && chosen.has(branch.ids[branch.offset].id)) branch.offset++;
    const depths=branches.filter(branch => branch.offset<branch.ids.length).map(branch => branch.ids[branch.offset].depth);
    if (!depths.length) break;
    const depth=Math.min(...depths);
    for (const branch of branches) {
      if (chosen.size >= limit) break;
      const next=branch.ids[branch.offset];
      if (!next || next.depth !== depth || chosen.has(next.id)) continue;
      branch.offset++;add(next.id);
      for (const child of [...data.children.get(next.id)].sort(index.compare)) if (!branch.queued.has(child)) {
        branch.queued.add(child);branch.ids.push({id:child,depth:next.depth+1});
      }
    }
  }
  const promotedWrappers=new Set();
  for (const root of requested) {
    let id=root;const seen=new Set();
    while (data.elements.has(id) && packageKind(data.elements.get(id).kind) && data.children.get(id)?.length===1 && !seen.has(id)) {
      seen.add(id);if (effectiveRoots.includes(id)) break;
      promotedWrappers.add(id);id=data.children.get(id)[0];
    }
  }
  const omittedTargets=new Set(omissions.map(item=>item.target));
  for (const id of scopeIds) if (!allElements.has(id) && !omittedTargets.has(id)) {
    omissions.push({target:id,reason:'unavailable'});omittedTargets.add(id);
  }
  for (const element of graph.elements ?? []) {
    if (!scope.has(element.id)) { if (eligible(element)) omissions.push({target:element.id,reason:'outside-scope'});continue; }
    if (!eligible(element)) {if (!omittedTargets.has(element.id)) omissions.push({target:element.id,reason:element.layer==='project'?'element-policy':'library'});continue;}
    if (!chosen.has(element.id)) omissions.push({target:element.id,reason:promotedWrappers.has(element.id)?'package-wrapper':'budget'});
  }
  const compositionPairs=new Set((graph.relationships ?? []).filter(edge=>edge.kind==='composition').map(edge=>JSON.stringify([edge.source,edge.target])));
  const edges=[...(graph.relationships ?? []),...(graph.containment ?? []).filter(edge=>edge.nativeRole==='owner'&&!compositionPairs.has(JSON.stringify([edge.source,edge.target])))];
  const seenEdges=new Set(),relationships=[];
  for (const edge of [...edges].sort((a,b)=>compareText(edgeKey(a),edgeKey(b)))) {
    if (!chosen.has(edge.source) || !chosen.has(edge.target)) continue;
    const key=edgeKey(edge);if(seenEdges.has(key))continue;
    seenEdges.add(key);relationships.push(copy(edge));
  }
  const ordered=[...chosen],focus=ordered[0] ?? null,shown=ordered.length,total=data.elements.size;
  const descendantsCapped=[...index.metrics.values()].some(metric=>metric.descendantsCapped);
  const summary={
    message:`${shown} of ${total} named model elements in the loaded native scope. Ranked by structural size and distinct connections; omitted content remains available through exploration.${descendantsCapped ? ` Descendant ranking counts stop at ${DESCENDANT_CAP} identities or ${DESCENDANT_WORK_CAP} inspected links; capped counts are lower bounds. Ranking is a reading aid, not engineering criticality.` : ''}`,
    shown,total,roots:effectiveRoots.length,shownRoots:effectiveRoots.filter(id=>chosen.has(id)).length,
    descendantsCapped,
  };
  return {
    elements:ordered.map(id=>copy(data.elements.get(id))),relationships,focus,metrics:index.metrics,
    omissions:omissions.sort((a,b)=>compareText(a.reason,b.reason)||all.compareNames(a.target,b.target)),
    summary,rootIds:[...requested].sort(all.compareNames),promotedRootIds:effectiveRoots,scopeIds,budget:limit,
  };
}
