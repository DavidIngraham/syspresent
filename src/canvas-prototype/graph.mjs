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
  if(item['@type']==='Documentation')for(const owner of refs(item.owner)){const target=index.get(owner);if(target&&!target.description)target.description=item.body||'';}
 }
 for(const view of views){const nodes=new Map(view.nodes.map(n=>[n.id,n.semanticId]));for(const [i,edge] of view.edges.entries()){
  const source=nodes.get(edge.fromId??edge.from??edge.source),target=nodes.get(edge.toId??edge.to??edge.target);
  add(source,target,edge.kind,`view:${view.id}:${i}`);
 }}
 const seen=new Set();return {elements,containment,relationships:relationships.filter(e=>{const key=JSON.stringify([e.source,e.target,e.kind]);if(seen.has(key))return false;seen.add(key);return true;})};
}
export function graphView(graph,context,name='Focused General View'){
 const known=new Map(graph.elements.map(e=>[e.id,e]));
 return {id:'explore:'+context.elements.map(e=>e.id).join(','),kind:'definition',title:name,omissions:context.omissions??[],nodes:context.elements.map(e=>({id:'gv:'+e.id,semanticId:e.id,name:e.name,kind:e.kind.replace(/(Usage|Definition)$/,'').replace(/([a-z])([A-Z])/g,'$1 $2').toLowerCase(),qualifiedName:e.qualifiedName,detail:e.description||'',type:refs(e.native?.type).map(id=>known.get(id)?.name||id).join(', ')})),edges:context.relationships.map(e=>({...e,semanticSource:e.source,semanticTarget:e.target,source:'gv:'+e.source,target:'gv:'+e.target}))};
}
export function requireNativeIdentity(view){const missing=view.nodes.filter(n=>!n.semanticId&&!['synthetic','control','notation'].includes(n.identityStatus));if(missing.length)throw Error('Native semantic identity missing for '+missing.map(n=>n.name||n.id).join(', '));return view;}
