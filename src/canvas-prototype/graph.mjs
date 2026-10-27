/** Adapter over native metamodel roles and view identities. No source/label parsing. */
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const camel=value=>Array.isArray(value)?value.map(camel):value&&typeof value==='object'?Object.fromEntries(Object.entries(value).map(([k,v])=>[k.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),camel(v)])):value;
export function adaptNativeView(raw,name){const v=camel(raw);return {...v,id:name,title:name,nodes:v.nodes??[],edges:v.edges??[],notices:v.notices??[]};}
// Native declaration categories, excluding relationship/membership/expression plumbing.
export const isDeclarationKind=kind=>/^(Package|Namespace|[A-Za-z]+(?:Usage|Definition))$/.test(kind??'');
export function modelGraph(raw,views=[]){
 const elements=raw.map(e=>({id:e['@id'],kind:e['@type'],name:e.declaredName||e.qualifiedName||e['@id'],qualifiedName:e.qualifiedName,description:e.body||'',native:e,layer:e['sysx:sourceLine']?'project':'library'}));
 const index=new Map(elements.map(e=>[e.id,e])),relationships=[],containment=[];
 // Navigation-only ownership comes from the native API role, never qname
 // truncation or a membership/type/library walk. Keep it outside engineering
 // context so namespace location cannot masquerade as a design dependency.
 const declaration=e=>e?.layer==='project'&&isDeclarationKind(e.kind);
 const add=(source,target,kind,id,nativeRelationship)=>{if(!source||!target)return;relationships.push({id,source,target,kind,label:kind,authority:'native-api',nativeRelationship});};
 for(const item of raw){const id=item['@id'];
  if(declaration(index.get(id)))for(const owner of refs(item.owner))if(declaration(index.get(owner)))containment.push({id:`owner:${owner}:${id}`,source:owner,target:id,kind:'containment',label:'owns',authority:'native-api',nativeRelationship:refs(item.owningMembership)[0]??refs(item.owningRelationship)[0]??null,nativeRole:'owner',navigationOnly:true});
  if(item['@type']==='Dependency')for(const client of refs(item.client))for(const supplier of refs(item.supplier))add(client,supplier,'dependency','api:'+id+':'+client+':'+supplier,id);
  // A part's owned PartUsage is engineering composition, not a path through memberships.
  if(['PartUsage','PartDefinition'].includes(item['@type']))for(const child of refs(item.ownedMember))if(index.get(child)?.kind==='PartUsage')add(id,child,'composition',`part:${id}:${child}`);
  if(item['@type']?.endsWith('Usage'))for(const type of refs(item.type))add(id,type,'typing',`typing:${id}:${type}`);
  // Native API `specializes` names the actual general classifier. The
  // declaration projection omits subclassification plumbing but retains its
  // native identity in ownedSubclassification. Never infer inheritance from
  // labels, type ancestry or qualified-name prefixes.
  if(item['@type']?.endsWith('Definition')){
   const generals=refs(item.specializes),nativeIds=refs(item.ownedSubclassification);
   for(const general of generals)add(id,general,'specialization',`specialization:${id}:${general}`,generals.length===1&&nativeIds.length===1?nativeIds[0]:undefined);
  }
  if(item['@type']==='Documentation')for(const owner of refs(item.owner)){const target=index.get(owner);if(target&&!target.description)target.description=item.body||'';}
 }
 for(const view of views){const nodes=new Map(view.nodes.map(n=>[n.id,n.semanticId]));for(const [i,edge] of view.edges.entries()){
  // Display aggregates can be laid out alongside a view, but never become
  // semantic graph links when a presentation projection is reused here.
  if(edge.presentationOnly===true||edge.aggregate===true)continue;
  const source=nodes.get(edge.fromId??edge.from??edge.source),target=nodes.get(edge.toId??edge.to??edge.target);
  const semantic=index.get(edge.semanticId);
  // The native renderer binds satisfy edges to the satisfaction usage's own
  // origin (not the satisfying part or requirement). It is a Usage subtype,
  // but its mapped ID identifies the actual native satisfaction assertion.
  // Other declaration-backed edge kinds stay unresolved unless their native
  // contract separately establishes a relationship identity. Do not match by
  // endpoint pairs or resolve the exported free-text subject in JavaScript.
  const satisfaction=['satisfy','satisfaction'].includes(edge.kind)&&semantic?.kind==='SatisfyRequirementUsage';
  const nativeRelationship=edge.semanticId&&(edge.identityStatus==='native'||satisfaction||semantic&&!isDeclarationKind(semantic.kind))?edge.semanticId:undefined;
  const occurrence={id:`view:${view.id}:${i}`,viewId:view.id,index:i,representationId:edge.id??null,semanticId:edge.semanticId??null,identityStatus:edge.identityStatus??'unknown',qualifiedName:edge.qualifiedName??null,nativeEdge:structuredClone(edge)};
  const previous=relationships.length;add(source,target,edge.kind,occurrence.id,nativeRelationship);
  if(relationships.length>previous)relationships.at(-1).occurrences=[occurrence];
 }}
 // Keep distinct known native relationships even when their endpoints/kind
 // coincide. Repeated view projections keep every occurrence as provenance on
 // one connection record; a mapped element identity is not a relationship ID.
 const records=new Map();
 for(const edge of relationships){const key=JSON.stringify([edge.source,edge.target,edge.kind,edge.nativeRelationship??null]),prior=records.get(key);if(!prior){records.set(key,edge);continue;}if(edge.occurrences){prior.occurrences??=[];const known=new Set(prior.occurrences.map(o=>o.id));prior.occurrences.push(...edge.occurrences.filter(o=>!known.has(o.id)));}}
 return {elements,containment,relationships:[...records.values()]};
}
export function graphView(graph,context,name='Focused General View'){
 const known=new Map(graph.elements.map(e=>[e.id,e]));
 return {id:'explore:'+context.elements.map(e=>e.id).join(','),kind:'definition',title:name,omissions:context.omissions??[],nodes:context.elements.map(e=>({id:'gv:'+e.id,semanticId:e.id,name:e.name,kind:e.kind.replace(/(Usage|Definition)$/,'').replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase(),qualifiedName:e.qualifiedName,detail:e.description||'',type:refs(e.native?.type).map(id=>known.get(id)?.name||id).join(', ')})),edges:context.relationships.map(e=>({...e,semanticSource:e.source,semanticTarget:e.target,source:'gv:'+e.source,target:'gv:'+e.target}))};
}
export function requireNativeIdentity(view){const missing=view.nodes.filter(n=>!n.semanticId&&!['synthetic','control','notation'].includes(n.identityStatus));if(missing.length)throw Error('Native semantic identity missing for '+missing.map(n=>n.name||n.id).join(', '));return view;}
