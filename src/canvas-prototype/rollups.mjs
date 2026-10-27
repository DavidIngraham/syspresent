/** Typed presentation rollups over explicit native ownership only.
 * These records are not model relationships and must never enter modelGraph,
 * native view capture or semantic traversal. Native endpoint order is retained.
 */
import {ENGINEERING_RELATIONSHIPS} from './core/index.mjs';
const containers=new Set(['Package','Namespace','PartDefinition','PartUsage']);
const compare=(a,b)=>a<b?-1:a>b?1:0;
const endpoint=(e,side)=>side==='source'?e.source??e.fromId??e.from_id??e.from:e.target??e.toId??e.to_id??e.to;
const edgeKey=e=>JSON.stringify([e.id??null,e.source,e.target,e.kind]);
const indexes=new WeakMap();
function index(graph){
 if(indexes.has(graph))return indexes.get(graph);
 const elements=new Map((graph.elements??[]).map(e=>[e.id,e])),parents=new Map();
 for(const edge of graph.containment??[]){
  if(edge.kind!=='containment'||edge.nativeRole!=='owner'||edge.presentationOnly)continue;
  if(!parents.has(edge.target))parents.set(edge.target,[]);parents.get(edge.target).push(edge);
 }
 for(const values of parents.values())values.sort((a,b)=>compare(edgeKey(a),edgeKey(b)));
 const relationships=[...new Map((graph.relationships??[]).filter(e=>!e.presentationOnly&&!e.aggregate).map(e=>{const edge={...e,source:endpoint(e,'source'),target:endpoint(e,'target')};return [edgeKey(edge),edge];})).values()].sort((a,b)=>compare(edgeKey(a),edgeKey(b)));
 const value={elements,parents,relationships};indexes.set(graph,value);return value;
}
function optionsFor(options){
 const {budget=100,maxOwnerHops=64}=options;
 if(!Number.isInteger(budget)||budget<0||budget>1000)throw Error('Invalid rollup budget (0–1000)');
 if(!Number.isInteger(maxOwnerHops)||maxOwnerHops<0||maxOwnerHops>256)throw Error('Invalid rollup ownership bound (0–256)');
 if(!options.visibleIds)throw Error('Rollups require visible native identities');
 return {budget,maxOwnerHops,visible:new Set(options.visibleIds),scope:options.scopeIds?new Set(options.scopeIds):null,kinds:new Set(options.relationshipKinds??ENGINEERING_RELATIONSHIPS)};
}
/** Nearest visible containing part/package, using only actual owner edges.
 * Equal-distance alternative containers are ambiguous and never guessed.
 */
function representative(data,id,policy){
 const root=data.elements.get(id);
 if(!root)return {reason:'unavailable',target:id};
 if(root.metamodel||root.layer==='metamodel')return {reason:'metamodel-boundary',target:id};
 if(policy.scope&&!policy.scope.has(id))return {reason:'outside-scope',target:id};
 if(policy.visible.has(id))return {id,path:{elementIds:[id],relationships:[]}};
 const visited=new Set([id]),queue=[{id,ids:[id],edges:[]}],matches=new Map();let distance=Infinity,cycle=false,limited=false,unavailable=false,outside=false;
 for(let cursor=0;cursor<queue.length;cursor++){
  const current=queue[cursor];if(current.edges.length>=distance)continue;
  const parents=data.parents.get(current.id)??[];
  if(current.edges.length>=policy.maxOwnerHops){if(parents.length)limited=true;continue;}
  for(const edge of parents){
   const parent=edge.source,element=data.elements.get(parent);
   if(current.ids.includes(parent)){cycle=true;continue;}
   if(!element){unavailable=true;continue;}
   if(element.metamodel||element.layer==='metamodel')continue;
   if(policy.scope&&!policy.scope.has(parent)){outside=true;continue;}
   const path={elementIds:[...current.ids,parent],relationships:[...current.edges,edge]};
   if(policy.visible.has(parent)&&containers.has(element.kind)){distance=path.relationships.length;matches.set(parent,{id:parent,path});continue;}
   if(!visited.has(parent)){visited.add(parent);queue.push({id:parent,ids:path.elementIds,edges:path.relationships});}
  }
 }
 if(matches.size===1)return [...matches.values()][0];
 if(matches.size>1)return {reason:'ambiguous-visible-owner',target:id,candidates:[...matches.keys()].sort(compare)};
 return {reason:limited?'ownership-limit':unavailable?'unavailable-owner':outside?'outside-scope-owner':cycle?'ownership-cycle':'no-visible-owner',target:id};
}
function identityCounts(edges){
 const known=new Set(edges.map(e=>e.nativeRelationship).filter(Boolean)),unresolved=edges.filter(e=>!e.nativeRelationship).length;
 return {count:known.size+unresolved,recordCount:edges.length,nativeRelationshipCount:known.size,unresolvedRecordCount:unresolved,identityComplete:unresolved===0,occurrenceCount:edges.reduce((n,e)=>n+(e.occurrences?.length||1),0),nativeRelationshipIds:[...known].sort(compare)};
}
/** Roll up hidden links without modifying any semantic input. Scope is checked
 * on native endpoints before aggregation, so external allocations cannot leak
 * back into an isolated package through a visible containing package.
 * Count is known native relationships plus unresolved connection records;
 * occurrenceCount is separately disclosed and never claimed as model cardinality.
 */
export function relationshipRollups(graph,options={}){
 const data=index(graph),policy=optionsFor(options),omissions=[],groups=new Map(),directRelationships=[],representatives=new Map();let excludedOutsideScope=0;
 const represent=id=>{if(!representatives.has(id))representatives.set(id,representative(data,id,policy));return representatives.get(id);};
 const omit=(edge,reason,extra={})=>omissions.push({relationshipId:edge.id??null,source:edge.source,target:edge.target,kind:edge.kind,reason,...extra});
 for(const edge of data.relationships){
  // Entirely unrelated external records are not crossing links in this reader
  // scope. Count them separately instead of flooding the boundary disclosure.
  if(policy.scope&&!policy.scope.has(edge.source)&&!policy.scope.has(edge.target)){excludedOutsideScope++;continue;}
  if(!policy.kinds.has(edge.kind)){omit(edge,'relationship-filter');continue;}
  if(!edge.id){omit(edge,'missing-relationship-identity');continue;}
  const source=represent(edge.source),target=represent(edge.target);
  if(source.reason||target.reason){for(const [side,value]of [['source',source],['target',target]])if(value.reason)omit(edge,value.reason,{endpoint:side,elementId:value.target,candidates:value.candidates});continue;}
  if(source.id===edge.source&&target.id===edge.target){directRelationships.push(edge);continue;}
  if(source.id===target.id&&!options.includeInternal){omit(edge,'internal-to-visible-container',{container:source.id});continue;}
  const id='presentation-rollup:'+JSON.stringify([source.id,target.id,edge.kind]);
  if(!groups.has(id))groups.set(id,{id,presentationOnly:true,aggregate:true,source:source.id,target:target.id,kind:edge.kind,scopeIds:policy.scope?[...policy.scope].sort(compare):null,maxOwnerHops:policy.maxOwnerHops,records:[]});
  groups.get(id).records.push({relationship:edge,sourcePath:source.path,targetPath:target.path});
 }
 const ordered=[...groups.values()].sort((a,b)=>compare(a.source,b.source)||compare(a.target,b.target)||compare(a.kind,b.kind)),selected=ordered.slice(0,policy.budget);
 for(const group of ordered.slice(policy.budget))for(const {relationship}of group.records)omit(relationship,'rollup-budget',{rollupId:group.id});
 const rollups=selected.map(group=>{const {records,...base}=group,relationships=records.map(r=>r.relationship),counts=identityCounts(relationships);return {...base,...counts,underlyingRelationshipIds:relationships.map(e=>e.id),records,summary:counts.identityComplete?`${counts.nativeRelationshipCount} native ${group.kind} relationship(s), presented at containing elements.`:`${counts.nativeRelationshipCount} known native relationship(s) and ${counts.unresolvedRecordCount} ${group.kind} connection record(s) with unresolved relationship identity. ${counts.occurrenceCount} retained API/view occurrence(s); occurrences are not additional modeled relationships.`};});
 const reasonCounts={};for(const omission of omissions)reasonCounts[omission.reason]=(reasonCounts[omission.reason]??0)+1;
 const summary={excludedOutsideScope,groups:rollups.length,totalGroups:ordered.length,records:rollups.reduce((n,r)=>n+r.recordCount,0),direct:directRelationships.length,omissions:omissions.length,reasonCounts,message:`${rollups.length} of ${ordered.length} typed presentation rollups; ${directRelationships.length} directly represented native connection records. ${omissions.length} omission records disclose scope, filters, ownership, internal links or display limits. ${excludedOutsideScope?`${excludedOutsideScope} unrelated records entirely outside reader scope excluded. `:''}Counts describe this loaded projection, not all model relationships. Rollups are display artifacts; native kinds, endpoints and provenance remain available through drilldown.`};
 return structuredClone({rollups,directRelationships,omissions,summary,visibleIds:[...policy.visible].sort(compare),scopeIds:policy.scope?[...policy.scope].sort(compare):null});
}
/** Resolve a rollup again against current graph/scope before opening exact native
 * edges. Stale or foreign records cannot bypass a newly isolated reader scope.
 * Returned relationships contain no aggregate; ownership paths stay separate.
 */
export function rollupDrilldown(graph,rollup,{page=0,pageSize=10,scopeIds=undefined}={}){
 if(!rollup?.presentationOnly||!rollup.aggregate||!Array.isArray(rollup.records))throw Error('Choose a presentation rollup');
 if(!Number.isInteger(page)||page<0||!Number.isInteger(pageSize)||pageSize<1||pageSize>100)throw Error('Invalid rollup drilldown page');
 const data=index(graph),currentScope=scopeIds===undefined?rollup.scopeIds:scopeIds,scope=currentScope?new Set(currentScope):null,available=new Map(data.relationships.map(e=>[edgeKey(e),e])),omissions=[],valid=[];
 for(const record of rollup.records){
  const edge=available.get(edgeKey(record.relationship));
  if(!edge){omissions.push({relationshipId:record.relationship?.id??null,reason:'stale-relationship'});continue;}
  if(scope&&(!scope.has(edge.source)||!scope.has(edge.target))){omissions.push({relationshipId:edge.id,reason:'outside-scope'});continue;}
  if(!data.elements.has(edge.source)||!data.elements.has(edge.target)){omissions.push({relationshipId:edge.id,reason:'unavailable'});continue;}
  const policy={visible:new Set([rollup.source,rollup.target]),scope,maxOwnerHops:rollup.maxOwnerHops??64};
  const source=representative(data,edge.source,policy),target=representative(data,edge.target,policy);
  if(source.reason||target.reason||source.id!==rollup.source||target.id!==rollup.target){omissions.push({relationshipId:edge.id,reason:'stale-owner-projection'});continue;}
  valid.push({relationship:edge,sourcePath:source.path,targetPath:target.path});
 }
 const pages=Math.max(1,Math.ceil(valid.length/pageSize)),actualPage=Math.min(page,pages-1),records=valid.slice(actualPage*pageSize,(actualPage+1)*pageSize),relationships=records.map(r=>r.relationship),wanted=new Set(relationships.flatMap(e=>[e.source,e.target]));
 const paths=records.map(record=>({relationshipId:record.relationship.id,source:record.sourcePath,target:record.targetPath}));
 const ownership=new Map();for(const path of paths)for(const side of [path.source,path.target])for(const edge of side.relationships)if(!scope||scope.has(edge.source)&&scope.has(edge.target))ownership.set(edgeKey(edge),edge);
 return structuredClone({rollupId:rollup.id,elements:[...wanted].sort(compare).map(id=>data.elements.get(id)),relationships,paths,ownershipRelationships:[...ownership.values()],omissions,page:actualPage,pageSize,pages,total:valid.length,shown:records.length,hasPrevious:actualPage>0,hasNext:actualPage+1<pages,...identityCounts(relationships),summary:`${records.length} of ${valid.length} underlying native connection records. Endpoint order and every available relationship/occurrence identity are unchanged; ownership paths describe only native model location.`});
}
