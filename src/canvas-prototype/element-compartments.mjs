/** Attribute/part compartments use explicit native ownership and one direct type.
 * They describe declarations, never fabricated instance slots or evaluated values.
 */
const caches=new WeakMap();
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const compare=(a,b)=>a<b?-1:a>b?1:0;
function index(graph){
 if(caches.has(graph))return caches.get(graph);
 const elements=new Map(graph.elements.map(e=>[e.id,e])),children=new Map();
 for(const edge of graph.containment??[])if(edge.nativeRole==='owner'){
  if(!children.has(edge.source))children.set(edge.source,new Set());children.get(edge.source).add(edge.target);
 }
 const data={elements,children};caches.set(graph,data);return data;
}
export function elementCompartments(graph,id,{page=0,pageSize=12}={}){
 const data=index(graph),focus=data.elements.get(id);if(!focus)throw Error('Compartment target is unavailable.');
 const size=Number.isInteger(pageSize)&&pageSize>0?Math.min(200,pageSize):12;
 const classifiers=refs(focus.native?.type).filter(type=>data.elements.has(type));
 const owners=[id,...classifiers.filter(type=>type!==id)],seen=new Set(),declarations=[];
 for(const ownerId of owners)for(const childId of data.children.get(ownerId)??[]){
  const child=data.elements.get(childId);if(!child||!['AttributeUsage','PartUsage'].includes(child.kind)||seen.has(childId))continue;
  seen.add(childId);const declaredOn=data.elements.get(ownerId);
  declarations.push({id:child.id,label:child.native?.declaredName||child.native?.declaredShortName||child.name,qualifiedName:child.qualifiedName,kind:child.kind,category:child.kind==='AttributeUsage'?'attribute':'part',declaredOn:ownerId,declaredOnLabel:declaredOn?.qualifiedName||declaredOn?.name||ownerId,direct:ownerId===id,typeIds:refs(child.native?.type),typeLabels:refs(child.native?.type).map(type=>data.elements.get(type)?.native?.declaredName||data.elements.get(type)?.name||type),valueReferences:refs(child.native?.value),valueStatus:child.native?.value?'declared; not evaluated':'not provided by this projection',provenance:{authority:'native-api',role:'owner',sourceLine:child.native?.['sysx:sourceLine'],sourceColumn:child.native?.['sysx:sourceColumn'],sourceText:child.native?.['sysx:sourceText']||''}});
 }
 declarations.sort((a,b)=>Number(b.direct)-Number(a.direct)||compare(a.declaredOnLabel,b.declaredOnLabel)||compare(a.category,b.category)||compare(a.label,b.label)||compare(a.id,b.id));
 const pages=Math.max(1,Math.ceil(declarations.length/size)),current=Math.max(0,Math.min(pages-1,Number.isInteger(page)?page:0)),items=declarations.slice(current*size,(current+1)*size);
 return {id,items,classifiers:classifiers.map(type=>({id:type,label:data.elements.get(type).qualifiedName||data.elements.get(type).name})),total:declarations.length,page:current,pageSize:size,pages,hasPrevious:current>0,hasNext:current+1<pages,summary:`Showing ${items.length} of ${declarations.length} attribute and internal-part declarations from this element and its direct classifiers in the loaded projection. Classifier-owned declarations retain their original identities; other inherited members are available by exploring definitions. Values are not evaluated.`};
}
/** Short, disclosed page for tiles; complete pages remain available in the browser. */
export function compartmentText(graph,id,{pageSize=12}={}){
 if(!graph||!id||!index(graph).elements.has(id))return '';
 const result=elementCompartments(graph,id,{pageSize});if(!result.total)return '';
 const lines=[];let group=null;
 for(const item of result.items){const key=[item.declaredOn,item.category].join(':');if(key!==group){lines.push((item.category==='attribute'?'Attributes':'Internal parts')+(item.direct?'':` declared on ${item.declaredOnLabel}`));group=key;}lines.push(`${item.label}${item.typeLabels.length?' : '+item.typeLabels.join(', '):''}${item.valueReferences.length?' (value declared; not evaluated)':''}`);}
 if(result.total>result.items.length)lines.push(`Showing ${result.items.length} of ${result.total}; browse declarations for all.`);
 return lines.join('\n');
}
