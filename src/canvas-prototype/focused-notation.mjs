/** Supported OMG SysML 2.0 graphical productions, formal/2026-03-02 §8.2.3.
 * This is a renderer over native API objects, never a parser or model query.
 * Source identity, usage/definition status, typing and ownership are authoritative.
 */
import {focusedEdgeAppearance} from './notation.mjs';
export {focusedEdgeAppearance} from './notation.mjs';
const profiles=new Map([
 ['Package',['','package','8.2.3.5']],
 ...[['Part','part','8.2.3.11'],['Item','item','8.2.3.10'],['Attribute','attribute','8.2.3.7'],['Port','port','8.2.3.12'],['Requirement','requirement','8.2.3.21'],['Concern','concern','8.2.3.21'],['Constraint','constraint','8.2.3.20'],['Action','action','8.2.3.17'],['State','state','8.2.3.18'],['Case','case','8.2.3.22'],['AnalysisCase','analysis','8.2.3.23'],['VerificationCase','verification','8.2.3.24'],['UseCase','use case','8.2.3.25']].flatMap(([type,keyword,section])=>[[type+'Definition',[keyword+' def','rectangle',section]],[type+'Usage',[keyword,'rounded',section]]]),
]);
const referenceShapes=new Set(['PartUsage','ItemUsage','RequirementUsage','ConstraintUsage','ActionUsage','StateUsage']);
const controls=new Map([['start','start'],['initial','start'],['done','done'],['final','done'],['end','done'],['terminate','terminate'],['terminate action','terminate'],['fork','fork'],['join','join'],['decision','decision'],['merge','merge']]);
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const caches=new WeakMap();
function index(graph){if(!graph)return {elements:new Map(),children:new Map()};if(caches.has(graph))return caches.get(graph);const elements=new Map((graph.elements??[]).map(e=>[e.id,e])),children=new Map();for(const edge of graph.containment??[])if(edge.nativeRole==='owner'){if(!children.has(edge.source))children.set(edge.source,new Set());children.get(edge.source).add(edge.target);}const result={elements,children};caches.set(graph,result);return result;}
const distinct=values=>[...new Set(values.filter(Boolean))];
const nativeName=element=>element?.native?.declaredName||element?.qualifiedName||element?.name||'';
const notice=(kind,id,message)=>({reason:'unsupported-focused-notation',target:id,kind,message});
function typeReferences(element,data){
 const ids=refs(element?.native?.type),names=[],unresolvedIds=[];
 for(const id of ids){const target=data.elements.get(id),name=target?.native?.declaredName||target?.native?.declaredShortName||target?.qualifiedName;if(name)names.push(name);else unresolvedIds.push(id);}
 return {ids,names,unresolvedIds};
}
function unavailableTypes(element,types){return types.unresolvedIds.map(typeId=>({...notice(element.kind,element.id,'Native type '+typeId+' has no named declaration in this projection. The type reference is omitted from the graphical typed name; no library type name is inferred.'),reason:'focused-type-unavailable',typeId}));}
function declaration(element,data){
 const types=typeReferences(element,data),direction=['in','out','inout'].includes(element.native?.direction)?element.native.direction+' ':'';
 const prefix=element.native?.isDerived===true?'/':'';
 const name=nativeName(element);return {text:prefix+direction+name+(types.names.length?' : '+types.names.join(', '):''),typeIds:types.ids,unresolvedTypeIds:types.unresolvedIds,notices:unavailableTypes(element,types)};
}
/** expanded controls optional doc/member compartments. Mandatory behavior text
 * is always retained, even when optional compartments are collapsed. */
export function focusedNodeDescriptor(node,graph,{expanded=true,pageSize=12}={}) {
 const data=index(graph),element=data.elements.get(node.semanticId),native=element?.native??{},kind=element?.kind;
 const base={semanticId:node.semanticId??null,representationId:node.id,keyword:'',name:nativeName(element)||((node.nameSynthesized??node.name_synthesized)?'':node.name)||'',type:'',shape:'unsupported',compartments:[],notices:[],supported:false,section:null,reference:false};
 if(controls.has(node.kind))return {...base,shape:'control',control:controls.get(node.kind),supported:true,section:'8.2.3.17',caption:distinct([base.name,node.text,node.detail]).join('\n')};
 if(node.kind==='port'&&node.parentId){
  const direction=node.nativePort?.direction??node.direction??native.direction,parameter=node.parameter??node.nativePort?.parameter??false;
  return {...base,shape:'port-glyph',portSide:node.portSide??node.side??'EAST',parameter,direction,supported:['in','out','inout'].includes(direction),section:parameter?'8.2.3.17':'8.2.3.12',name:node.label||base.name,type:node.label?'':node.type||'',notices:['in','out','inout'].includes(direction)?[]:[notice(kind??'port',node.semanticId??node.id,'Port direction is unavailable in the native projection; its neutral attachment is retained without an invented arrow.')]};
 }
 const profile=profiles.get(kind);if(!profile){base.notices.push(notice(kind??node.kind,node.semanticId??node.id,`Focused graphical notation for ${kind??node.kind??'unknown kind'} is unsupported. Native content is shown in a neutral box, without claiming a standard symbol.`));return base;}
 const [keyword,shape,section]=profile,types=typeReferences(element,data);
 Object.assign(base,{keyword,shape,section,supported:true,type:types.names.join(', '),typeIds:types.ids,unresolvedTypeIds:types.unresolvedIds,reference:referenceShapes.has(kind)&&(native.isReference===true||native.isComposite===false)});
 if(native.declaredShortName)base.name='<'+native.declaredShortName+'> '+base.name;
 if(native.isAbstract===true)base.keyword='abstract '+base.keyword;
 if(native.isVariation===true)base.keyword='variation '+base.keyword;
 base.notices.push(...unavailableTypes(element,types));
 if(native.value)base.notices.push(notice(kind,node.semanticId,'A declared value expression is not evaluated or rendered by this focused subset.'));
 const modifiers=['isReadOnly','isIndividual','isPortion','isSufficient','isOrdered','isParallel','isConstant','isEnd'].filter(key=>native[key]===true);if(modifiers.length)base.notices.push(notice(kind,node.semanticId,'Unsupported native modifiers: '+modifiers.join(', ')+'.'));
 if(native.isConjugated===true)base.notices.push(notice(kind,node.semanticId,'Conjugated-port type notation is not supported by this focused rendering subset.'));
 if(native.multiplicity||native.ownedMultiplicity)base.notices.push(notice(kind,node.semanticId,'Native multiplicity is present but not rendered by this focused subset.'));
 if(node.text||node.detail){
  if(['ActionUsage','ActionDefinition','StateUsage','StateDefinition'].includes(kind)){base.compartments.push({title:'',text:distinct([node.text,node.detail]).join('\n'),mandatory:true,role:'native-behavior'});base.notices.push(notice(kind,node.semanticId,'Native behavior text is retained verbatim; structured entry/do/exit, loop and expression compartments are not supplied by this native projection.'));}
 }
 if(expanded){
  if(element.description)base.compartments.push({title:'doc',text:element.description,role:'documentation',sourceId:element.id});
  const children=[...(data.children.get(element.id)??[])].map(id=>data.elements.get(id)).filter(Boolean).sort((a,b)=>nativeName(a).localeCompare(nativeName(b))||a.id.localeCompare(b.id));
  const categories=new Map([['AttributeUsage','attributes'],['PartUsage','parts'],['PortUsage','ports'],['RequirementUsage','requirements']]);
  const eligible=children.filter(child=>categories.has(child.kind)),size=Math.max(1,Math.min(200,Number.isInteger(pageSize)?pageSize:12)),selected=eligible.slice(0,size),grouped=new Map();
  for(const child of selected){const category=categories.get(child.kind);if(!grouped.has(category))grouped.set(category,[]);const entry=declaration(child,data);grouped.get(category).push({semanticId:child.id,text:entry.text,typeIds:entry.typeIds,unresolvedTypeIds:entry.unresolvedTypeIds});base.notices.push(...entry.notices);if(child.native?.value)base.notices.push(notice(child.kind,child.id,'A declared value expression is not evaluated or rendered by this focused subset.'));}
  for(const [title,entries]of grouped)base.compartments.push({title,entries,text:entries.map(item=>item.text).join('\n'),role:'owned-declarations'});
  if(eligible.length>selected.length){base.compartments.push({title:'',text:'…',role:'omission'});base.notices.push({reason:'focused-compartment-budget',target:node.semanticId,shown:selected.length,total:eligible.length,message:`Showing ${selected.length} of ${eligible.length} native owned declarations; browse declarations to reach all.`});}
  const unhandled=children.filter(child=>!categories.has(child.kind)&&!['Documentation','Comment','ViewUsage','ViewDefinition'].includes(child.kind));
  if(unhandled.length)base.notices.push(notice(kind,node.semanticId,`${unhandled.length} owned declarations are outside the supported attributes/parts/ports/requirements compartments; their native identities remain available in hierarchy.`));
 }
 return base;
}
const svgNS='http://www.w3.org/2000/svg';
function symbol(document,descriptor){
 const svg=document.createElementNS(svgNS,'svg');svg.setAttribute('viewBox','0 0 40 40');svg.setAttribute('aria-hidden','true');svg.classList.add('focused-symbol');const path=document.createElementNS(svgNS,'path');let d='',fill='none';
 switch(descriptor.control){
 case 'start':d='M32 20 A12 12 0 1 1 8 20 A12 12 0 1 1 32 20 Z';fill='currentColor';break;
 case 'done':d='M36 20 A16 16 0 1 1 4 20 A16 16 0 1 1 36 20 Z M33 20 A13 13 0 1 1 7 20 A13 13 0 1 1 33 20 Z M29 20 A9 9 0 1 1 11 20 A9 9 0 1 1 29 20 Z';path.setAttribute('fill-rule','evenodd');fill='currentColor';break;
 case 'terminate':d='M34 20 A14 14 0 1 1 6 20 A14 14 0 1 1 34 20 Z M10 10 L30 30 M30 10 L10 30';break;
 case 'fork':case 'join':d='M0 0 H40 V40 H0 Z';fill='currentColor';svg.setAttribute('preserveAspectRatio','none');break;
 case 'decision':case 'merge':d='M20 2 L38 20 L20 38 L2 20 Z';break;
 }
 if(descriptor.shape==='port-glyph'){
  if(descriptor.parameter){const box=document.createElementNS(svgNS,'rect');for(const [key,value]of Object.entries({x:1,y:1,width:38,height:38,rx:6,fill:'white',stroke:'currentColor','stroke-width':2}))box.setAttribute(key,String(value));svg.append(box);}
  const side=String(descriptor.portSide).toUpperCase(),out=({EAST:0,SOUTH:90,WEST:180,NORTH:270})[side]??0,angle=out+(descriptor.direction==='in'?180:0);svg.style.transform='rotate('+angle+'deg)';
  d=descriptor.direction==='inout'?'M6 20 H34 M6 20 L14 12 M6 20 L14 28 M34 20 L26 12 M34 20 L26 28':['in','out'].includes(descriptor.direction)?'M6 20 H34 M34 20 L24 10 M34 20 L24 30':'M10 10 H30 V30 H10 Z';
 }
 path.setAttribute('d',d);path.setAttribute('fill',fill);path.setAttribute('stroke','currentColor');path.setAttribute('stroke-width','2');svg.append(path);return svg;
}
/** Renders only the descriptor that was measured when available. DOM uses
 * textContent throughout; model prose never becomes executable HTML. */
export function focusedFace(document,node,graph,options={}) {
 const descriptor=node.focusedDescriptor??focusedNodeDescriptor(node,graph,options),make=(tag,text,cls)=>{const item=document.createElement(tag);if(text!==undefined)item.textContent=text;if(cls)item.className=cls;return item;};
 const face=make('span',undefined,'node-face focused-face');face.dataset.shape=descriptor.shape;face.dataset.supported=String(descriptor.supported);face.dataset.reference=String(descriptor.reference);if(descriptor.section)face.dataset.notationSection=descriptor.section;
 if(['control','port-glyph'].includes(descriptor.shape)){face.append(symbol(document,descriptor.shape==='port-glyph'?{...descriptor,portSide:node.portSide??node.side??descriptor.portSide}:descriptor));if(descriptor.shape==='control'&&descriptor.caption)face.append(make('span',descriptor.caption,'focused-control-caption'));if(descriptor.shape==='port-glyph'&&descriptor.name)face.append(make('span',descriptor.name+(descriptor.type?' : '+descriptor.type:''),'port-name'));return face;}
 if(descriptor.shape==='package')face.append(make('span',undefined,'focused-package-tab'));
 const header=make('span',undefined,'focused-header');if(descriptor.keyword)header.append(make('span','«'+descriptor.keyword+'»','focused-keyword'));header.append(make('span',descriptor.name+(descriptor.type?' : '+descriptor.type:''),'focused-name name'));face.append(header);
 for(const compartment of descriptor.compartments){const section=make('span',undefined,'focused-compartment');section.dataset.role=compartment.role;if(compartment.sourceId)section.dataset.sourceId=compartment.sourceId;if(compartment.title)section.append(make('span',compartment.title,'focused-compartment-title'));if(compartment.entries)for(const entry of compartment.entries){const line=make('span',entry.text,'focused-compartment-line');line.dataset.semanticId=entry.semanticId;section.append(line);}else section.append(make('span',compartment.text,'focused-compartment-text'));face.append(section);}
 if(!descriptor.supported)face.append(make('span','Unsupported notation: '+(node.kind||'unknown'),'focused-unsupported'));
 return face;
}
/** Measure exactly the face later rendered, with a conservative fallback for
 * environments without layout (e.g. jsdom). Model/display state is not mutated. */
export function measureFocusedNode(document,node,graph,options={}) {
 const focusedDescriptor=focusedNodeDescriptor(node,graph,options),descriptor=focusedDescriptor;
 if(descriptor.shape==='control'){const bar=['fork','join'].includes(descriptor.control);return {width:bar?80:descriptor.control==='decision'||descriptor.control==='merge'?44:32,height:bar?8:descriptor.control==='decision'||descriptor.control==='merge'?44:32,focusedDescriptor};}
 if(descriptor.shape==='port-glyph')return {width:node.width??16,height:node.height??16,focusedDescriptor};
 const width=Math.max(220,Number(node.width)||0,descriptor.compartments.length?280:0),host=document.createElement('div');host.className='node';host.style.cssText='position:fixed;left:-10000px;top:0;visibility:hidden;width:'+width+'px;height:auto;transform:none;';const face=focusedFace(document,{...node,focusedDescriptor},graph);face.style.position='relative';face.style.inset='auto';face.style.height='auto';host.append(face);document.body.append(host);const measured=Math.max(host.getBoundingClientRect().height,host.scrollHeight);host.remove();
 const lines=text=>String(text??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/Math.max(16,Math.floor((width-24)/7)))),0);
 const fallback=24+lines(descriptor.name+(descriptor.type?' : '+descriptor.type:''))*19+(descriptor.keyword?18:0)+(descriptor.shape==='package'?18:0)+descriptor.compartments.reduce((sum,c)=>sum+16+(c.title?16:0)+lines(c.text)*17,0);
 return {width,height:Math.ceil(Math.max(72,measured,fallback)),focusedDescriptor};
}
/** One inspectable, per-kind coverage record for every rendered unsupported item. */
export function focusedNotationNotices(view,graph) {
 const notices=[];
 if(['sequence','table','matrix','grid','fault-tree'].includes(view.kind))notices.push({reason:'unsupported-focused-family',kind:view.kind,message:`The ${view.kind} renderer is outside this focused graphical notation subset. Its native identities and order are retained; full OMG notation support is not established.`});
 for(const node of view.nodes??[])notices.push(...(node.focusedDescriptor??focusedNodeDescriptor(node,graph)).notices);
 for(const edge of view.edges??[]){const appearance=focusedEdgeAppearance(edge,{viewKind:view.kind});if(!appearance.supported)notices.push({reason:'unsupported-focused-notation',relationshipId:edge.id,kind:edge.kind,message:appearance.notice});}
 return notices;
}
