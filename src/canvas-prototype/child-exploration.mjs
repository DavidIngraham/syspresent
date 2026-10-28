/** Complete immediate source-declaration projection over explicit native owners.
 * This is one native ownership hop, not runtime instantiation or recursive expansion.
 * Related engineering nodes and presentation budgets cannot displace siblings.
 */
import {isDeclarationKind} from './graph.mjs';

const compareText=(a,b)=>a<b?-1:a>b?1:0;
const endpoint=(edge,side)=>side==='source'?edge.source??edge.fromId??edge.from_id??edge.from:edge.target??edge.toId??edge.to_id??edge.to;
const edgeKey=edge=>JSON.stringify([edge.id??null,edge.source,edge.target,edge.kind]);
const indexes=new WeakMap();
function prepare(graph){
 const prior=indexes.get(graph);
 if(prior&&prior.elementSource===graph.elements&&prior.relationshipSource===graph.relationships&&prior.containmentSource===graph.containment&&prior.elementCount===(graph.elements??[]).length&&prior.relationshipCount===(graph.relationships??[]).length&&prior.containmentCount===(graph.containment??[]).length)return prior;
 const elements=new Map((graph.elements??[]).map(element=>[element.id,element]));
 const edges=[...new Map([...(graph.relationships??[]),...(graph.containment??[])].map(edge=>{const value={...edge,source:endpoint(edge,'source'),target:endpoint(edge,'target')};return [edgeKey(value),value];})).values()].sort((a,b)=>compareText(edgeKey(a),edgeKey(b)));
 const owners=new Map(),types=new Map();
 for(const edge of edges){
  if(edge.kind==='containment'&&edge.nativeRole==='owner'){
   if(!owners.has(edge.source))owners.set(edge.source,[]);owners.get(edge.source).push(edge);
  }
  if(['typing','type'].includes(edge.kind)){
   if(!types.has(edge.source))types.set(edge.source,[]);types.get(edge.source).push(edge);
  }
 }
 const result={elements,edges,owners,types,elementSource:graph.elements,relationshipSource:graph.relationships,containmentSource:graph.containment,elementCount:(graph.elements??[]).length,relationshipCount:(graph.relationships??[]).length,containmentCount:(graph.containment??[]).length};
 indexes.set(graph,result);return result;
}

/** All loaded immediate declarations for one or several selected native roots.
 * Directly typed definitions supply declarations with their own owner and typing
 * identities. They never turn into runtime copies or other usages of that type.
 */
export function completeChildContext(graph,options={}){
 const {elements,edges,owners,types}=prepare(graph);
 const requested=[...new Set(options.rootIds??(options.focus?[options.focus]:[]))];
 const focus=options.focus??requested[0];
 if(focus&&!requested.includes(focus))requested.unshift(focus);
 const scope=options.scopeIds?new Set(options.scopeIds):null;
 const kinds=options.elementKinds?new Set(options.elementKinds):null;
 const relationships=options.relationshipKinds?new Set(options.relationshipKinds):null;
 const omissions=[],omitted=new Set(),unavailable=new Set(),filtered=new Set(),outside=new Set();
 const omit=(edge,target,reason,anchor)=>{
  const value={relationshipId:edge?.id??null,target,reason,anchor:anchor??null},key=JSON.stringify(value);
  if(omitted.has(key))return;omitted.add(key);omissions.push(value);
  if(reason==='unavailable')unavailable.add(target);else filtered.add(target);
  if(reason==='outside-scope')outside.add(target);
 };
 const excluded=(id,{source=false}={})=>{
  const element=elements.get(id);
  if(!element)return 'unavailable';
  if(element.metamodel===true||element.layer==='metamodel')return 'metamodel-boundary';
  if(scope&&!scope.has(id))return 'outside-scope';
  if(!isDeclarationKind(element.kind))return 'element-policy';
  if(source&&element.layer!=='project')return 'source-projection';
  if(kinds&&!kinds.has(element.kind))return 'element-filter';
  return null;
 };
 const compare=(a,b)=>compareText(elements.get(a)?.qualifiedName??elements.get(a)?.name??a,elements.get(b)?.qualifiedName??elements.get(b)?.name??b)||compareText(a,b);
 const roots=[];
 for(const id of requested){const reason=excluded(id);if(reason)omit(null,id,reason,null);else roots.push(id);}
 roots.sort(compare);
 const anchors=new Map(roots.map(id=>[id,{root:true,bridges:[]}]));
 if(options.includeDirectTypes!==false)for(const root of roots){
  if(!elements.get(root)?.kind?.endsWith('Usage'))continue;
  for(const edge of types.get(root)??[]){
   const target=edge.target,reason=excluded(target);
   if(reason){omit(edge,target,reason,root);continue;}
   if(!elements.get(target)?.kind?.endsWith('Definition')){omit(edge,target,'typing-boundary',root);continue;}
   if(!anchors.has(target))anchors.set(target,{root:false,bridges:[]});
   anchors.get(target).bridges.push(edge);
  }
 }
 const children=new Map(),ownership=[],own=new Set(),defined=new Set(),neededTypes=new Set(),bridgeEdges=new Map();
 const compositionPairs=new Set(edges.filter(edge=>edge.kind==='composition').map(edge=>JSON.stringify([edge.source,edge.target])));
 for(const [anchor,context]of anchors)for(const edge of owners.get(anchor)??[]){
  const target=edge.target;
  const reason=relationships&&!relationships.has(edge.kind)&&!(relationships.has('composition')&&compositionPairs.has(JSON.stringify([anchor,target])))?'relationship-filter':excluded(target,{source:true});
  if(reason){omit(edge,target,reason,anchor);continue;}
  if(anchor===target){omit(edge,target,'ownership-cycle',anchor);continue;}
  if(!children.has(target))children.set(target,new Set());children.get(target).add(anchor);ownership.push(edge);
  if(context.root)own.add(target);else{
   defined.add(target);neededTypes.add(anchor);
   for(const bridge of context.bridges)bridgeEdges.set(edgeKey(bridge),bridge);
  }
 }
 const childIds=[...children.keys()].sort(compare),typeIds=[...neededTypes].sort(compare);
 const wanted=new Set(roots);
 for(const id of typeIds)wanted.add(id);
 for(const id of childIds)wanted.add(id);
 const selected=new Map(ownership.map(edge=>[edgeKey(edge),edge]));
 for(const edge of bridgeEdges.values())selected.set(edgeKey(edge),edge);
 // Retain actual links between already included declarations, never add their
 // external endpoints or infer connectivity from a shared owner.
 for(const edge of edges)if(wanted.has(edge.source)&&wanted.has(edge.target)&&(!relationships||relationships.has(edge.kind))){
  if(edge.kind==='containment'&&edge.nativeRole!=='owner')continue;
  selected.set(edgeKey(edge),edge);
 }
 const declarationOwners=Object.fromEntries(childIds.map(id=>[id,[...children.get(id)].sort(compare)]));
 const declaredOn=Object.fromEntries(childIds.map(id=>[id,declarationOwners[id].length===1?declarationOwners[id][0]:null]));
 const kindCounts={};for(const id of childIds){const kind=elements.get(id).kind;kindCounts[kind]=(kindCounts[kind]??0)+1;}
 const count=childIds.length;
 let message=`All ${count} loaded immediate source declaration${count===1?'':'s'} shown`;
 if(roots.length>1)message+=` across ${roots.length} selected roots`;
 message+=`: ${own.size} owned by the selected element${roots.length===1?'':'s'}`;
 if(defined.size)message+=`, ${defined.size} declared on directly typed definitions`;
 message+='.';
 if(defined.size)message+=' Definition declarations retain their native owners and explicit typing links; they are not runtime instances.';
 if(outside.size)message+=` ${outside.size} native target${outside.size===1?' is':'s are'} outside the isolated scope.`;
 if(unavailable.size)message+=` ${unavailable.size} referenced target${unavailable.size===1?' is':'s are'} unavailable in this projection.`;
 if(filtered.size-outside.size)message+=` ${filtered.size-outside.size} target${filtered.size-outside.size===1?' is':'s are'} excluded by explicit policy or unavailable declaration data.`;
 message+=' Only immediate native owners and one direct typing hop are opened; drill into a child to continue. Counts describe the loaded projection, not proof that omitted model content is absent.';
 if(!roots.length)message='The selected native declaration is unavailable or outside this scope.';
 const childProjection={rootIds:roots,childIds,ownChildIds:[...own].sort(compare),definitionChildIds:[...defined].sort(compare),typeIds,declaredOn,declarationOwners,ownership,complete:true,kindCounts};
 return structuredClone({
  elements:[...wanted].map(id=>elements.get(id)),relationships:[...selected.values()].sort((a,b)=>compareText(edgeKey(a),edgeKey(b))),omissions,
  mode:'contents',focus,rootIds:roots,page:0,pages:1,total:count,shown:count,targets:childIds,budget:null,typingBridges:[...bridgeEdges.values()].map(edge=>edge.id),childProjection,
  summary:{status:roots.length?(count?'shown':unavailable.size?'unavailable':'no-known-children'):'missing-focus',message,shown:count,total:count,unavailable:unavailable.size,filtered:filtered.size,outsideScope:outside.size,ownChildren:own.size,definitionChildren:defined.size,complete:true,kindCounts}
 });
}


const nativeRefs=value=>Array.isArray(value)?value.flatMap(nativeRefs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
/** Find closed ownership-cycle members without recursive JS calls on deep models. */
function closedCycleMembers(ids,children,parents){
 const remaining=new Set(ids),seen=new Set(),order=[];
 for(const start of remaining){
  if(seen.has(start))continue;
  const stack=[[start,false]];
  while(stack.length){
   const [id,expanded]=stack.pop();
   if(expanded){order.push(id);continue;}
   if(seen.has(id))continue;seen.add(id);stack.push([id,true]);
   const next=[...(children.get(id)??[])].filter(child=>remaining.has(child));
   for(let i=next.length-1;i>=0;i--)if(!seen.has(next[i]))stack.push([next[i],false]);
  }
 }
 const assigned=new Set(),cycles=[];
 for(let i=order.length-1;i>=0;i--){
  const start=order[i];if(assigned.has(start))continue;
  const component=[],queue=[start];assigned.add(start);
  for(let cursor=0;cursor<queue.length;cursor++){
   const id=queue[cursor];component.push(id);
   for(const parent of parents.get(id)??[])if(remaining.has(parent)&&!assigned.has(parent)){assigned.add(parent);queue.push(parent);}
  }
  if(component.length>1||(children.get(start)?.has(start)))cycles.push(...component);
 }
 return cycles;
}

/** Every source ownership root, including disclosed boundaries of the projection.
 * The project is only a presentation grouping; no synthetic modeled root or
 * ownership relation is created. Closed cycles remain reachable as cycle entries.
 */
export function completeRootContext(graph,options={}){
 const {elements,edges}=prepare(graph),scope=options.scopeIds?new Set(options.scopeIds):null;
 const source=new Set([...elements.values()].filter(element=>element.layer==='project'&&element.metamodel!==true&&isDeclarationKind(element.kind)&&(!scope||scope.has(element.id))).map(element=>element.id));
 const compare=(a,b)=>Number(!['Package','Namespace'].includes(elements.get(a)?.kind))-Number(!['Package','Namespace'].includes(elements.get(b)?.kind))||compareText(elements.get(a)?.qualifiedName??elements.get(a)?.name??a,elements.get(b)?.qualifiedName??elements.get(b)?.name??b)||compareText(a,b);
 const nativeOwners=new Map(),parents=new Map(),children=new Map();
 const add=(parent,child)=>{
  if(typeof parent!=='string'||!source.has(child))return;
  if(!nativeOwners.has(child))nativeOwners.set(child,new Set());nativeOwners.get(child).add(parent);
  if(!source.has(parent))return;
  if(!parents.has(child))parents.set(child,new Set());parents.get(child).add(parent);
  if(!children.has(parent))children.set(parent,new Set());children.get(parent).add(child);
 };
 for(const edge of edges)if(edge.kind==='containment'&&edge.nativeRole==='owner')add(edge.source,edge.target);
 for(const id of source)for(const parent of nativeRefs(elements.get(id).native?.owner))add(parent,id);
 const roots=[...source].filter(id=>!(parents.get(id)?.size)),reachable=new Set(),walk=starts=>{
  const queue=[...starts];for(let cursor=0;cursor<queue.length;cursor++){const id=queue[cursor];if(reachable.has(id))continue;reachable.add(id);for(const child of children.get(id)??[])if(!reachable.has(child))queue.push(child);}
 };
 walk(roots);
 const cycleIds=closedCycleMembers([...source].filter(id=>!reachable.has(id)),children,parents),cycles=new Set(cycleIds);
 roots.push(...cycleIds);walk(cycleIds);
 // Every finite closed parent component should have a cycle. Keep any malformed
 // residual native records accessible rather than silently dropping them.
 const unresolved=[...source].filter(id=>!reachable.has(id)),unresolvedIds=new Set(unresolved);roots.push(...unresolved);
 const childIds=[...new Set(roots)].sort(compare),wanted=new Set(childIds),omissions=[],projectionRoots=[];
 const declarationOwners=Object.fromEntries(childIds.map(id=>[id,[...(nativeOwners.get(id)??[])].sort(compareText)]));
 for(const id of childIds){
  const ownerIds=declarationOwners[id];
  const omittedOwnerIds=ownerIds.filter(owner=>!elements.has(owner)||elements.get(owner).layer!=='project'||!isDeclarationKind(elements.get(owner).kind));
  const outsideOwnerIds=scope?ownerIds.filter(owner=>elements.has(owner)&&elements.get(owner).layer==='project'&&isDeclarationKind(elements.get(owner).kind)&&!scope.has(owner)):[];
  const reason=cycles.has(id)?'cycle':unresolvedIds.has(id)?'ownership-unresolved':!ownerIds.length?'native-root':!omittedOwnerIds.length&&outsideOwnerIds.length?'outside-scope':'native-owner-omitted';
  projectionRoots.push({id,reason,ownerIds,omittedOwnerIds,outsideOwnerIds});
  if(reason!=='native-root')omissions.push({relationshipId:null,target:id,reason,anchor:null,ownerIds});
 }
 const relationships=edges.filter(edge=>wanted.has(edge.source)&&wanted.has(edge.target));
 const kindCounts={};for(const id of childIds){const kind=elements.get(id).kind;kindCounts[kind]=(kindCounts[kind]??0)+1;}
 const packageCount=(kindCounts.Package??0)+(kindCounts.Namespace??0),metadataCount=projectionRoots.filter(entry=>['MetadataUsage','MetadataDefinition'].includes(elements.get(entry.id).kind)&&entry.reason!=='native-root').length;
 const boundaryCount=projectionRoots.filter(entry=>!['native-root','cycle'].includes(entry.reason)).length;
 let message=`All ${childIds.length} roots of the loaded source ownership projection shown: ${packageCount} packages/namespaces`;
 if(metadataCount)message+=` and ${metadataCount} unanchored metadata declarations`;
 message+='.';
 if(boundaryCount)message+=` ${boundaryCount} entries appear here because their explicit native owner is outside the available source-declaration projection or scope; they are not asserted to be physical or model-wide top-level roots.`;
 if(cycles.size)message+=` ${cycles.size} closed ownership-cycle members are exposed as inspectable entries; no containing hierarchy has been guessed.`;
 message+=` ${source.size} source declarations remain reachable through intentional immediate-child drilldown. No recursive model expansion or modeled project root is created.`;
 return structuredClone({
  elements:childIds.map(id=>elements.get(id)),relationships,omissions,mode:'contents',focus:childIds[0],rootIds:[],page:0,pages:1,total:childIds.length,shown:childIds.length,targets:childIds,budget:null,typingBridges:[],
  childProjection:{rootIds:[],childIds,ownChildIds:childIds,definitionChildIds:[],typeIds:[],declaredOn:{},declarationOwners,ownership:[],projectionRoots,complete:true,kindCounts,implicitProject:true},
  summary:{status:childIds.length?'shown':'no-known-children',message,total:childIds.length,shown:childIds.length,unavailable:0,filtered:0,complete:true,kindCounts,sourceDeclarations:source.size,packages:packageCount,unanchoredMetadata:metadataCount,projectionBoundaries:boundaryCount,cycleEntries:cycles.size}
 });
}
