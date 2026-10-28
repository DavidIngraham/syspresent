/** Reader scope over native ownership. Names are labels, never membership rules. */
import {representations,nativeViewContextIdentities} from './view-contract.mjs';
import {isDeclarationKind} from './graph.mjs';
import {nativeOwnershipIndex} from './metadata-context.mjs';
import {completeRootContext} from './child-exploration.mjs';

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
 const native=nativeOwnershipIndex(graph);for(const [child,owners]of native.ownerIds)for(const parent of owners)if(elements.has(child)&&elements.has(parent)){if(!children.has(parent))children.set(parent,new Set());children.get(parent).add(child);if(!parents.has(child))parents.set(child,new Set());parents.get(child).add(parent);}
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
 for(const id of nativeViewContextIdentities(view))represented.add(id);
 return [...represented].filter(id=>!allowed.has(id)).sort(compare);
}
export function focusViewKinds(element){
 const kind=element?.kind;
 const views=[{id:'context',label:'Connections'}];
 if(isDeclarationKind(kind))views.push({id:'contents',label:'Complete contents'});
 if(['PartUsage','PartDefinition'].includes(kind))views.push({id:'native:interconnection',label:'Native internal view'});
 if(isPackage(element))views.push({id:'native:tree',label:'Native tree (complete)'},{id:'native:mixed',label:'Native general view (complete)'});
 if(['ActionUsage','ActionDefinition'].includes(kind))views.push({id:'native:action',label:'Native activity'},{id:'native:sequence',label:'Native sequence'});
 if(['OccurrenceUsage','OccurrenceDefinition'].includes(kind))views.push({id:'native:sequence',label:'Native sequence'});
 if(['StateUsage','StateDefinition'].includes(kind))views.push({id:'native:state',label:'Native states'});
 return views;
}

/** Complete, paged declaration navigation over the native ownership index.
 * Pagination changes presentation only; every loaded declaration remains reachable.
 */
export function hierarchyPage(graph,{rootId=null,parentId=null,query='',page=0,pageSize=50,scopeIds=null}={}){
 const data=index(graph),size=Number.isInteger(pageSize)&&pageSize>0?Math.min(pageSize,200):50;
 const project=new Set(graph.elements.filter(e=>e.layer==='project'&&e.native?.['sysx:sourceLine']&&(/^(Package|Namespace|[A-Za-z]+(?:Usage|Definition))$/.test(e.kind))).map(e=>e.id));
 const allowed=new Set(scopeIds??project);
 for(const id of [...allowed])if(!project.has(id))allowed.delete(id);
 if(rootId){
  if(!allowed.has(rootId))throw Error('Hierarchy root is not a loaded declaration in this scope.');
  const descendants=new Set([rootId]),queue=[rootId];
  for(let i=0;i<queue.length;i++)for(const id of data.children.get(queue[i])??[])if(allowed.has(id)&&!descendants.has(id)){descendants.add(id);queue.push(id);}
  for(const id of [...allowed])if(!descendants.has(id))allowed.delete(id);
 }
 if(parentId&&!allowed.has(parentId))throw Error('Hierarchy parent is outside the loaded declaration scope.');
 const sorted=ids=>[...ids].map(id=>data.elements.get(id)).filter(Boolean).sort((a,b)=>compare(a.qualifiedName||a.name,b.qualifiedName||b.name)||compare(a.id,b.id));
 const parents=id=>sorted([...(data.parents.get(id)??[])].filter(p=>allowed.has(p)));
 const path=id=>{const seen=new Set([id]),result=[];let current=id;while(true){const parent=parents(current).find(e=>!seen.has(e.id));if(!parent)break;result.unshift(parent.id);seen.add(parent.id);current=parent.id;}return result;};
 const q=query.trim().toLowerCase();
 const rootCandidates=scopeIds?[...allowed].filter(id=>![...(data.parents.get(id)??[])].some(parent=>scopeIds.includes(parent))):completeRootContext(graph).targets;
 const candidates=q?sorted([...allowed].filter(id=>{const e=data.elements.get(id);return [e.name,e.qualifiedName,id].some(value=>value?.toLowerCase().includes(q));})):sorted(parentId?[...(data.children.get(parentId)??[])].filter(id=>allowed.has(id)):rootId?[rootId]:rootCandidates);
 // Non-root/cyclic source records remain available through explicit Source inspection and search.
 const pages=Math.max(1,Math.ceil(candidates.length/size)),current=Math.max(0,Math.min(pages-1,Number.isInteger(page)?page:0));
 const items=candidates.slice(current*size,(current+1)*size).map(e=>({id:e.id,label:e.native?.declaredName||e.native?.declaredShortName||e.name,qualifiedName:e.qualifiedName,kind:e.kind,parentIds:parents(e.id).map(p=>p.id),pathIds:path(e.id),childCount:[...(data.children.get(e.id)??[])].filter(id=>allowed.has(id)).length,provenance:{authority:'native-api',role:'owner',sourceLine:e.native?.['sysx:sourceLine'],sourceColumn:e.native?.['sysx:sourceColumn']}}));
 return {items,rootId,parentId,query,page:current,pageSize:size,total:candidates.length,loadedTotal:allowed.size,pages,hasPrevious:current>0,hasNext:current+1<pages,summary:`Showing ${items.length} of ${candidates.length} ${q?'matching declarations':parentId?'directly owned declarations':'ownership roots'} in the loaded native declaration projection (${allowed.size} declarations in scope). Ownership is model location, not physical composition or runtime instances.`};
}
