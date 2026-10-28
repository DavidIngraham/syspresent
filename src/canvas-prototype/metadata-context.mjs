/**
 * Native source ownership and metadata inspection. Ownership, annotation targets
 * and annotation-record provenance are distinct facts, never interchangeable
 * containment links. No QName, source-text or encoded-ID semantic reconstruction.
 */
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const unique=values=>[...new Set(values)].sort();
const compare=(a,b)=>a<b?-1:a>b?1:0;
const source=element=>element.layer==='project'||!!element.native?.['sysx:sourceLine'];
const metadata=element=>element?.kind==='MetadataUsage';
const add=(map,key,value)=>{if(!map.has(key))map.set(key,new Set());map.get(key).add(value);};
const indexes=new WeakMap();
const isIndex=value=>value?.byId instanceof Map&&value?.ownerIds instanceof Map;

/** Every explicit native owner role, including non-declaration relationships. */
export function nativeOwnershipIndex(graph){
 if(isIndex(graph))return graph;
 const prior=indexes.get(graph);
 if(prior&&prior.elements===graph.elements&&prior.elementCount===(graph.elements??[]).length&&prior.containment===graph.containment&&prior.containmentCount===(graph.containment??[]).length&&prior.relationships===graph.relationships&&prior.relationshipCount===(graph.relationships??[]).length)return prior.index;
 const byId=new Map((graph.elements??[]).map(element=>[element.id,element])),owners=new Map(),children=new Map(),sourceIds=new Set();
 for(const element of byId.values()){
  if(source(element))sourceIds.add(element.id);
  for(const owner of refs(element.native?.owner)){add(owners,element.id,owner);add(children,owner,element.id);}
 }
 // Some contract fixtures expose the same native role as an explicit graph
 // navigation record. Accept that evidence, without inventing missing nodes.
 for(const edge of [...(graph.containment??[]),...(graph.relationships??[])])if(edge.kind==='containment'&&edge.nativeRole==='owner'){
  const parent=edge.source,child=edge.target;if(typeof parent!=='string'||typeof child!=='string')continue;
  add(owners,child,parent);add(children,parent,child);
 }
 const ownerIds=new Map([...owners].map(([id,ids])=>[id,unique(ids)])),childIds=new Map([...children].map(([id,ids])=>[id,unique(ids)]));
 const annotations=new Map(),ensure=id=>{
  if(!annotations.has(id))annotations.set(id,{annotationId:id,recordedOnIds:new Set(),metadataIds:new Set(),annotatedElementIds:new Set(),provenance:[]});
  return annotations.get(id);
 };
 for(const element of byId.values()){
  for(const id of refs(element.native?.ownedAnnotation)){const link=ensure(id);link.recordedOnIds.add(element.id);link.provenance.push({elementId:element.id,property:'ownedAnnotation',referencedId:id});}
  if(element.kind==='Annotation'){
   const link=ensure(element.id);
   for(const id of refs(element.native?.annotatedElement))link.annotatedElementIds.add(id);
   for(const id of refs(element.native?.annotatingElement))link.metadataIds.add(id);
   for(const property of ['annotatedElement','annotatingElement'])for(const id of refs(element.native?.[property]))link.provenance.push({elementId:element.id,property,referencedId:id});
  }
 }
 for(const element of byId.values())if(metadata(element))for(const id of refs(element.native?.owningRelationship)){
  const link=annotations.get(id);if(!link)continue;
  link.metadataIds.add(element.id);link.provenance.push({elementId:element.id,property:'owningRelationship',referencedId:id});
 }
 const annotationLinks=[...annotations.values()].map(link=>({
  annotationId:link.annotationId,available:byId.has(link.annotationId),
  recordedOnIds:unique(link.recordedOnIds),metadataIds:unique(link.metadataIds),annotatedElementIds:unique(link.annotatedElementIds),
  provenance:link.provenance.sort((a,b)=>compare(JSON.stringify(a),JSON.stringify(b))),
  presentationOnly:true,authority:'native-api',role:'annotation-record-provenance'
 })).sort((a,b)=>compare(a.annotationId,b.annotationId));
 const annotationLinksByMetadata=new Map(),annotationLinksByElement=new Map(),metadataByAnnotatedElement=new Map();
 for(const link of annotationLinks){
  for(const id of link.metadataIds){if(!annotationLinksByMetadata.has(id))annotationLinksByMetadata.set(id,[]);annotationLinksByMetadata.get(id).push(link);for(const target of link.annotatedElementIds)add(metadataByAnnotatedElement,target,id);}
  for(const id of unique([...link.recordedOnIds,...link.annotatedElementIds,...link.metadataIds])){if(!annotationLinksByElement.has(id))annotationLinksByElement.set(id,[]);annotationLinksByElement.get(id).push(link);}
 }
 const metadataIds=[...byId.values()].filter(element=>metadata(element)&&sourceIds.has(element.id)).sort((a,b)=>compare(a.qualifiedName??a.name??a.id,b.qualifiedName??b.name??b.id)||compare(a.id,b.id)).map(element=>element.id);
 for(const id of metadataIds)for(const target of refs(byId.get(id).native?.annotatedElement))add(metadataByAnnotatedElement,target,id);
 const index={byId,ownerIds,childIds,sourceIds,annotationLinks,annotationLinksByMetadata,annotationLinksByElement,metadataByAnnotatedElement,metadataIds};
 indexes.set(graph,{elements:graph.elements,elementCount:(graph.elements??[]).length,containment:graph.containment,containmentCount:(graph.containment??[]).length,relationships:graph.relationships,relationshipCount:(graph.relationships??[]).length,index});
 return index;
}

/** Inspect all reachable owner records without recursion or arbitrary limits.
 * Missing records, scope boundaries, ambiguous owners and actual cycles remain
 * explicit inspection entries. Annotation targets never participate in traversal.
 */
export function inspectNativeOwnership(graph,id,{scopeIds}={}){
 const index=nativeOwnershipIndex(graph),scope=scopeIds?new Set(scopeIds):null,seen=new Set(),queue=[id],steps=[],boundaries=[],ambiguous=[];
 for(let cursor=0;cursor<queue.length;cursor++){
  const current=queue[cursor];if(seen.has(current))continue;seen.add(current);
  const element=index.byId.get(current);
  if(!element){boundaries.push({id:current,reason:'missing-owner'});continue;}
  if(scope&&!scope.has(current)){boundaries.push({id:current,reason:'outside-scope'});continue;}
  const ownerIds=index.ownerIds.get(current)??[];
  steps.push({id:current,kind:element.kind,source:index.sourceIds.has(current),ownerIds});
  if(!ownerIds.length)boundaries.push({id:current,reason:'native-root'});
  if(ownerIds.length>1){const entry={id:current,reason:'ambiguous-owner',ownerIds};ambiguous.push(entry);boundaries.push(entry);}
  for(const owner of ownerIds)if(!seen.has(owner))queue.push(owner);
 }
 // Iterative DFS detects true back edges rather than mistaking a shared parent
 // for a cycle. Every native edge is retained in steps, including ambiguous ones.
 const visited=new Set(),active=new Map(),cycles=[],cycleKeys=new Set(),allowed=new Set(steps.map(step=>step.id));
 for(const start of allowed){
  if(visited.has(start))continue;const stack=[{id:start,cursor:0}];active.set(start,0);
  while(stack.length){
   const frame=stack.at(-1),parents=(index.ownerIds.get(frame.id)??[]).filter(owner=>allowed.has(owner));
   if(frame.cursor>=parents.length){visited.add(frame.id);active.delete(frame.id);stack.pop();continue;}
   const parent=parents[frame.cursor++];
   if(active.has(parent)){
    const members=stack.slice(active.get(parent)).map(item=>item.id),key=JSON.stringify([...members].sort());
    if(!cycleKeys.has(key)){cycleKeys.add(key);cycles.push({id:parent,reason:'ownership-cycle',ids:members});}
   }else if(!visited.has(parent)){active.set(parent,stack.length);stack.push({id:parent,cursor:0});}
  }
 }
 boundaries.push(...cycles);
 return structuredClone({id,found:index.byId.has(id),ownerIds:index.ownerIds.get(id)??[],steps,boundaries,reachableOwnerIds:[...seen].filter(owner=>owner!==id),ambiguous,cycles,missingOwnerIds:unique(boundaries.filter(item=>item.reason==='missing-owner').map(item=>item.id)),outsideScopeIds:unique(boundaries.filter(item=>item.reason==='outside-scope').map(item=>item.id))});
}

function metadataRecord(index,element){
 const owningRelationshipIds=unique(refs(element.native?.owningRelationship));
 const matches=index.annotationLinksByMetadata.get(element.id)??[];
 return {
  id:element.id,kind:element.kind,name:element.name,qualifiedName:element.qualifiedName,
  ownerIds:index.ownerIds.get(element.id)??[],annotatedElementIds:unique(refs(element.native?.annotatedElement)),
  owningRelationshipIds,typeIds:unique(refs(element.native?.type)),
  matchingOwnedAnnotationIds:unique(matches.filter(link=>link.recordedOnIds.length).map(link=>link.annotationId)),
  recordedOnIds:unique(matches.flatMap(link=>link.recordedOnIds)),
  ownedElementIds:index.childIds.get(element.id)??[],
  source:{line:element.native?.['sysx:sourceLine']??null,column:element.native?.['sysx:sourceColumn']??null,text:element.native?.['sysx:sourceText']??null},
  authority:'native-api'
 };
}

/** Explicit metadata on an owner or relationship; target annotations are separate. */
export function metadataContext(graph,id,{scopeIds}={}){
 const index=nativeOwnershipIndex(graph),scope=scopeIds?new Set(scopeIds):null;
 const sourceRecord=key=>metadata(index.byId.get(key))&&index.sourceIds.has(key),recordsFor=ids=>unique(ids).filter(sourceRecord).map(key=>metadataRecord(index,index.byId.get(key)));
 const owned=recordsFor(index.childIds.get(id)??[]),annotating=recordsFor(index.metadataByAnnotatedElement.get(id)??[]);
 const annotationLinks=index.annotationLinksByElement.get(id)??[];
 const classify=record=>({...record,outsideScope:!!scope&&!scope.has(record.id),unavailableOwnerIds:record.ownerIds.filter(owner=>!index.byId.has(owner)),unavailableAnnotatedElementIds:record.annotatedElementIds.filter(target=>!index.byId.has(target))});
 const recordIds=unique([...owned,...annotating].map(record=>record.id));
 const unknownAnnotations=annotationLinks.filter(link=>!link.available).map(link=>link.annotationId);
 return structuredClone({id,found:index.byId.has(id),metadata:metadata(index.byId.get(id))?classify(metadataRecord(index,index.byId.get(id))):null,ownedMetadata:owned.map(classify),annotatingMetadata:annotating.map(classify),annotationLinks,unavailableAnnotationIds:unique(unknownAnnotations),total:recordIds.length,summary:{owned:owned.length,annotating:annotating.length,uniqueMetadata:recordIds.length,annotationRecords:annotationLinks.length,unavailableAnnotations:unique(unknownAnnotations).length}});
}

/** All source metadata stays inspectable with explicit, truthful pagination.
 * This inventory is independent of structural scope; ownerId means direct native
 * owner only. Query is display text search, never a semantic relationship query.
 */
export function sourceMetadata(graph,{ownerId,query='',page=0,pageSize=40}={}){
 if(!Number.isSafeInteger(pageSize)||pageSize<1)throw Error('Metadata pageSize must be a positive integer');
 if(!Number.isSafeInteger(page)||page<0)throw Error('Metadata page must be a nonnegative integer');
 const index=nativeOwnershipIndex(graph),needle=String(query).trim().toLowerCase();
 const all=index.metadataIds.map(id=>index.byId.get(id));
 const selected=all.filter(element=>(ownerId===undefined||(index.ownerIds.get(element.id)??[]).includes(ownerId))&&(!needle||[element.id,element.name,element.qualifiedName,element.native?.['sysx:sourceText']].filter(Boolean).some(value=>String(value).toLowerCase().includes(needle)))).sort((a,b)=>compare(a.qualifiedName??a.name??a.id,b.qualifiedName??b.name??b.id)||compare(a.id,b.id));
 const pages=Math.max(1,Math.ceil(selected.length/pageSize)),actualPage=Math.min(page,pages-1),items=selected.slice(actualPage*pageSize,(actualPage+1)*pageSize).map(element=>metadataRecord(index,element));
 return structuredClone({items,rows:items,total:selected.length,totalSourceMetadata:all.length,shown:items.length,page:actualPage,pageSize,pages,hasPrevious:actualPage>0,hasNext:actualPage+1<pages,ownerId:ownerId??null,query:String(query),scope:'all-loaded-source-metadata'});
}
