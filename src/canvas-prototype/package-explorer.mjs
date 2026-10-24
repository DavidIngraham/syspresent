/** Reader scope over native ownership. Names are labels, never membership rules. */
import {representations} from './view-contract.mjs';

const indexes=new WeakMap();
export const isPackage=element=>['Package','Namespace'].includes(element?.kind);
const compare=(a,b)=>a<b?-1:a>b?1:0;
function index(graph){
 if(indexes.has(graph))return indexes.get(graph);
 const elements=new Map(graph.elements.map(e=>[e.id,e])),children=new Map(),parents=new Map();
 for(const edge of graph.containment??[]){
  if(edge.nativeRole!=='owner'||!elements.has(edge.source)||!elements.has(edge.target))continue;
  if(!children.has(edge.source))children.set(edge.source,new Set());children.get(edge.source).add(edge.target);
  if(!parents.has(edge.target))parents.set(edge.target,new Set());parents.get(edge.target).add(edge.source);
 }
 const result={elements,children,parents,members:new Map()};indexes.set(graph,result);return result;
}
export function packageMembers(graph,id){
 const data=index(graph),root=data.elements.get(id);
 if(!isPackage(root)||root.layer!=='project')throw Error('Choose a loaded project package.');
 if(!data.members.has(id)){
  const ids=new Set([id]),queue=[id];
  for(let i=0;i<queue.length;i++)for(const child of data.children.get(queue[i])??[])if(!ids.has(child)){ids.add(child);queue.push(child);}
  data.members.set(id,[...ids].sort(compare));
 }
 return data.members.get(id);
}
export function packageCatalog(graph,query=''){
 const q=query.trim().toLowerCase();
 return graph.elements.filter(e=>isPackage(e)&&e.layer==='project'&&e.qualifiedName&&(e.native?.declaredName||e.native?.declaredShortName)&&(!q||(e.name+' '+e.qualifiedName).toLowerCase().includes(q)))
  .sort((a,b)=>compare(a.qualifiedName,b.qualifiedName)||compare(a.id,b.id));
}
/** Nearest enclosing package, walking only the native owner role; cycles terminate. */
export function containingPackage(graph,id){
 const data=index(graph),seen=new Set([id]),queue=[id];
 for(let i=0;i<queue.length;i++)for(const parent of [...(data.parents.get(queue[i])??[])].sort(compare)){
  if(seen.has(parent))continue;seen.add(parent);
  if(isPackage(data.elements.get(parent)))return parent;queue.push(parent);
 }
 return null;
}
/** Do not trim native behavioral/grid views at a reader boundary. Validate first. */
export function outsidePackage(view,ids){
 if(!ids)return [];
 const allowed=new Set(ids),represented=new Set();
 for(const item of representations(view)){
  if(['node','row','column'].includes(item.role)&&item.semanticId)represented.add(item.semanticId);
  for(const id of [item.sourceSemanticId,item.targetSemanticId])if(id)represented.add(id);
 }
 return [...represented].filter(id=>!allowed.has(id)).sort(compare);
}
export function focusViewKinds(element){
 const kind=element?.kind;
 const views=[{id:'context',label:'Connections'}];
 if(isPackage(element)||['PartUsage','PartDefinition'].includes(kind))views.push({id:'contents',label:'Parts / contents'});
 if(['PartUsage','PartDefinition'].includes(kind))views.push({id:'native:interconnection',label:'Native internal view'});
 if(isPackage(element))views.push({id:'native:tree',label:'Native tree (complete)'},{id:'native:mixed',label:'Native general view (complete)'});
 if(['ActionUsage','ActionDefinition'].includes(kind))views.push({id:'native:action',label:'Native activity'},{id:'native:sequence',label:'Native sequence'});
 if(['StateUsage','StateDefinition'].includes(kind))views.push({id:'native:state',label:'Native states'});
 return views;
}
