/** Part requirement/impact projections over exported native links only.
 * A collapsed path is provenance, never a replacement modeled relationship.
 */
const partKinds=new Set(['PartUsage','PartDefinition']);
const requirementKinds=new Set(['RequirementUsage','RequirementDefinition']);
const typingKinds=new Set(['typing','type']);
const inheritanceKinds=new Set(['specialization']);
const satisfactionKinds=new Set(['satisfy','satisfaction']);
const compare=(a,b)=>a<b?-1:a>b?1:0;
const key=e=>JSON.stringify([e.id??null,e.source,e.target,e.kind]);
const endpoint=(e,side)=>side==='source'?e.source??e.fromId??e.from_id??e.from:e.target??e.toId??e.to_id??e.to;
// Graph objects are immutable semantic projections and are replaced after a
// native view/model update. Cache their index for repeated selection/actions.
const indexes=new WeakMap();
function prepare(graph){
 const prior=indexes.get(graph);
 if(prior&&prior.elementSource===graph.elements&&prior.relationshipSource===graph.relationships&&prior.containmentSource===graph.containment&&prior.elementCount===(graph.elements??[]).length&&prior.relationshipCount===(graph.relationships??[]).length&&prior.containmentCount===(graph.containment??[]).length)return prior;
 const elements=new Map((graph.elements??[]).map(e=>[e.id,e]));
 const edges=[...new Map([...(graph.relationships??[]),...(graph.containment??[]).filter(e=>e.kind==='containment'&&e.nativeRole==='owner')].map(e=>{const value={...e,source:endpoint(e,'source'),target:endpoint(e,'target')};return [key(value),value];})).values()].sort((a,b)=>compare(key(a),key(b)));
 const incident=new Map();for(const edge of edges)for(const id of new Set([edge.source,edge.target])){if(!incident.has(id))incident.set(id,[]);incident.get(id).push(edge);}
 const result={elements,incident,elementSource:graph.elements,relationshipSource:graph.relationships,containmentSource:graph.containment,elementCount:(graph.elements??[]).length,relationshipCount:(graph.relationships??[]).length,containmentCount:(graph.containment??[]).length};
 indexes.set(graph,result);return result;
}
export const isPartElement=element=>partKinds.has(element?.kind);
/** Effective requirements include native declared requirements and satisfaction
 * traces, separately labeled. This is neither a completeness nor verdict claim.
 * Global impact exposes type declarations and other typed usages, not instances.
 */
export function partContext(graph,options={}){
 const {focus,mode='effective',budget=7,page=0}=options;
 if(!['effective','global-impact'].includes(mode))throw Error('Unknown part exploration mode: '+mode);
 if(!Number.isInteger(budget)||budget<1)throw Error('Invalid exploration budget');
 if(!Number.isInteger(page)||page<0)throw Error('Invalid exploration page');
 const limit=Math.max(3,Math.min(24,budget)),{elements,incident}=prepare(graph);
 const scope=options.scopeIds?new Set(options.scopeIds):null,kinds=options.relationshipKinds?new Set(options.relationshipKinds):null,nodeKinds=options.elementKinds?new Set(options.elementKinds):null;
 const omissions=[],omissionKeys=new Set(),unavailable=new Set(),filtered=new Set();
 const omit=(edge,target,reason,anchor)=>{const value={relationshipId:edge?.id??null,target,reason,anchor:anchor??null},id=JSON.stringify(value);if(!omissionKeys.has(id)){omissionKeys.add(id);omissions.push(value);}if(reason==='unavailable')unavailable.add(target);else if(['outside-scope','metamodel-boundary','relationship-filter','element-filter'].includes(reason))filtered.add(target);};
 const excluded=id=>!elements.has(id)?'unavailable':elements.get(id).metamodel||elements.get(id).layer==='metamodel'?'metamodel-boundary':scope&&!scope.has(id)?'outside-scope':nodeKinds&&!nodeKinds.has(elements.get(id).kind)?'element-filter':null;
 const allowed=(edge,target,anchor)=>{const reason=kinds&&!kinds.has(edge.kind)?'relationship-filter':excluded(target);if(reason){omit(edge,target,reason,anchor);return false;}return true;};
 const root=elements.get(focus),rootReason=excluded(focus),valid=!rootReason&&isPartElement(root);
 if(!valid){if(rootReason)omit(null,focus,rootReason);return {elements:[],relationships:[],omissions,mode,page:0,pages:0,total:0,shown:0,targets:[],typingBridges:[],paths:[],collapsedContext:[],budget:limit,summary:{status:'missing-focus',shown:0,total:0,unavailable:unavailable.size,filtered:filtered.size,message:'Effective requirements and global impact apply to loaded parts and part definitions.'}};}
 // The breadth-first paths follow only explicit outgoing usage typing and
 // definition specialization. Native owner names never establish inheritance.
 const ancestors=new Map([[focus,{ids:[focus],edges:[]}]]),queue=[focus],nativeLinks=new Map(),candidates=new Set(),paths=[];
 let inspections=0,truncated=false;
 for(let cursor=0;cursor<queue.length;cursor++){
  const anchor=queue[cursor],element=elements.get(anchor),path=ancestors.get(anchor);
  for(const edge of incident.get(anchor)??[]){
   if(++inspections>4096){omit(edge,edge.source===anchor?edge.target:edge.source,'inspection-limit',anchor);truncated=true;break;}
   const target=edge.source===anchor?edge.target:edge.source,other=elements.get(target);
   const type=edge.source===anchor&&element.kind==='PartUsage'&&typingKinds.has(edge.kind);
   const inheritance=edge.source===anchor&&element.kind==='PartDefinition'&&inheritanceKinds.has(edge.kind);
   if(type||inheritance){
    if(!allowed(edge,target,anchor))continue;
    if(other.kind!=='PartDefinition'){omit(edge,target,'typing-boundary',anchor);continue;}
    if(!ancestors.has(target)&&ancestors.size>=256){omit(edge,target,'ancestor-limit',anchor);truncated=true;continue;}
    nativeLinks.set(key(edge),edge);
    if(!ancestors.has(target)){ancestors.set(target,{ids:[...path.ids,target],edges:[...path.edges,edge]});queue.push(target);}
    continue;
   }
   const declared=edge.source===anchor&&edge.kind==='containment'&&edge.nativeRole==='owner'&&other?.kind==='RequirementUsage';
   const satisfaction=edge.source===anchor&&satisfactionKinds.has(edge.kind);
   if(declared||satisfaction){
    if(!allowed(edge,target,anchor))continue;
    if(!requirementKinds.has(other.kind)){omit(edge,target,'requirement-policy',anchor);continue;}
    candidates.add(target);nativeLinks.set(key(edge),edge);
    paths.push({target,kind:declared?'declared-requirement':'satisfaction',inherited:anchor!==focus,elementIds:[...path.ids,target],relationships:[...path.edges,edge]});
    continue;
   }
   // Show usages of each reached definition only in the explicit impact mode.
   // Do not traverse through them or imply that they instantiate a runtime object.
   if(mode==='global-impact'&&element.kind==='PartDefinition'&&edge.target===anchor&&typingKinds.has(edge.kind)&&other?.kind==='PartUsage'){
    if(allowed(edge,target,anchor)){candidates.add(target);nativeLinks.set(key(edge),edge);}continue;
   }
   if(mode==='effective'&&(typingKinds.has(edge.kind)||inheritanceKinds.has(edge.kind)))omit(edge,target,'collapsed-context',anchor);
  }
  if(inspections>4096)break;
 }
 if(mode==='global-impact'){
  // A change to a definition may affect native specializing definitions and
  // typed usages. Keep the walk explicit and bounded; never recurse through a
  // usage into an invented runtime tree.
  const definitions=[...ancestors.keys()].filter(id=>elements.get(id)?.kind==='PartDefinition'),seen=new Set(definitions);
  for(let cursor=0;cursor<definitions.length;cursor++)for(const edge of incident.get(definitions[cursor])??[]){
   const anchor=definitions[cursor],target=edge.source,other=elements.get(target);
   if(edge.target!==anchor||!((inheritanceKinds.has(edge.kind)&&other?.kind==='PartDefinition')||(typingKinds.has(edge.kind)&&other?.kind==='PartUsage')))continue;
   if(++inspections>4096){omit(edge,target,'inspection-limit',anchor);truncated=true;break;}
   if(!allowed(edge,target,anchor))continue;
   if(!candidates.has(target)&&candidates.size>=256){omit(edge,target,'impact-limit',anchor);truncated=true;continue;}
   candidates.add(target);nativeLinks.set(key(edge),edge);
   if(other.kind==='PartDefinition'&&!seen.has(target)){seen.add(target);definitions.push(target);}
  }
  for(const id of ancestors.keys())if(id!==focus)candidates.add(id);
 }
 for(const target of candidates)filtered.delete(target);
 const rank=id=>mode==='global-impact'?(ancestors.has(id)?0:partKinds.has(elements.get(id)?.kind)?1:2):0;
 const targets=[...candidates].filter(id=>id!==focus).sort((a,b)=>rank(a)-rank(b)||compare(elements.get(a)?.qualifiedName??elements.get(a)?.name??a,elements.get(b)?.qualifiedName??elements.get(b)?.name??b)||compare(a,b));
 const pages=Math.ceil(targets.length/(limit-1)),actualPage=Math.min(page,Math.max(0,pages-1)),shown=targets.slice(actualPage*(limit-1),(actualPage+1)*(limit-1)),wanted=new Set([focus,...shown]);
 const relationships=[...nativeLinks.values()].filter(e=>wanted.has(e.source)&&wanted.has(e.target));
 const selectedPaths=paths.filter(path=>wanted.has(path.target));
 const collapsedContext=mode==='effective'?[...new Set(selectedPaths.flatMap(path=>path.elementIds.slice(1,-1)))].sort(compare):[];
 for(const edge of nativeLinks.values())if(!wanted.has(edge.source)||!wanted.has(edge.target))omit(edge,!wanted.has(edge.target)?edge.target:edge.source,mode==='effective'&&selectedPaths.some(p=>p.relationships.some(e=>key(e)===key(edge)))?'collapsed-context':'budget',edge.source);
 const inherited=selectedPaths.filter(p=>p.inherited).length;
 let message=mode==='effective'?`${shown.length} of ${targets.length} requirements declared by or linked through native satisfaction to this part and its explicit types. ${collapsedContext.length} type / inheritance declarations collapsed; ${inherited} inherited paths retain native provenance. Collapsed paths are not drawn as new relationships.`:`${shown.length} of ${targets.length} definition, inheritance, usage and requirement targets shown. Other usages are model declarations, not runtime instances. Only native links between displayed identities are drawn.`;
 if(!targets.length)message+=' No matching links are known in this loaded projection; this does not prove their absence from the model.';
 if(unavailable.size)message+=` ${unavailable.size} referenced targets unavailable.`;
 if(filtered.size)message+=` ${filtered.size} targets excluded by scope or filters.`;
 if(truncated)message+=' Native ancestry inspection was bounded; results may be incomplete.';
 message+=' Counts describe the loaded native projection; omitted relationships may exist. Satisfaction is a modeled claim, not executed verification or approval.';
 return structuredClone({elements:[...wanted].map(id=>elements.get(id)),relationships,omissions,mode,page:actualPage,pages,total:targets.length,shown:shown.length,targets:shown,typingBridges:relationships.filter(e=>typingKinds.has(e.kind)).map(e=>e.id),paths:selectedPaths,collapsedContext,budget:limit,summary:{status:shown.length?'shown':unavailable.size?'unavailable':filtered.size?'filtered':'no-known-links',message,shown:shown.length,total:targets.length,unavailable:unavailable.size,filtered:filtered.size,collapsed:collapsedContext.length,inherited,truncated}});
}
