/** Supported OMG SysML 2.0 graphical productions, formal/2026-03-02 §8.2.3.
 * This is a renderer over native API objects, never a parser or model query.
 * Source identity, usage/definition status, typing and ownership are authoritative.
 */
import {focusedEdgeAppearance} from './notation.mjs';
export {focusedEdgeAppearance} from './notation.mjs';
const profiles=new Map([
 ['Package',['','package','8.2.3.5']],
 ...[['Part','part','8.2.3.11'],['Item','item','8.2.3.10'],['Attribute','attribute','8.2.3.7'],['Port','port','8.2.3.12'],['Enumeration','enum','8.2.3.8'],['Occurrence','occurrence','8.2.3.9'],['Connection','connection','8.2.3.13'],['Interface','interface','8.2.3.14'],['Allocation','allocation','8.2.3.15'],['Flow','flow','8.2.3.16'],['Calculation','calc','8.2.3.19'],['View','view','8.2.3.26'],['Viewpoint','viewpoint','8.2.3.26'],['Requirement','requirement','8.2.3.21'],['Concern','concern','8.2.3.21'],['Constraint','constraint','8.2.3.20'],['Action','action','8.2.3.17'],['State','state','8.2.3.18'],['Case','case','8.2.3.22'],['AnalysisCase','analysis','8.2.3.23'],['VerificationCase','verification','8.2.3.24'],['UseCase','use case','8.2.3.25']].flatMap(([type,keyword,section])=>[[type+'Definition',[keyword+' def','rectangle',section]],[type+'Usage',[keyword,'rounded',section]]]),
 ['MetadataDefinition',['metadata def','rectangle','8.2.3.27']],
 ['AssertConstraintUsage',['assert constraint','rounded','8.2.3.20']],
 ['SatisfyRequirementUsage',['satisfy requirement','rounded','8.2.3.21']],
 ['AssignmentActionUsage',['assign','rounded','8.2.3.17']],
 ['SendActionUsage',['send action','rounded','8.2.3.17']],
 ['AcceptActionUsage',['accept action','rounded','8.2.3.17']],
 ['PerformActionUsage',['perform action','rounded','8.2.3.17']],
 ['ExhibitStateUsage',['exhibit state','rounded','8.2.3.18']],
 ['IncludeUseCaseUsage',['include use case','rounded','8.2.3.25']],
 ['SuccessionFlowUsage',['succession flow','rounded','8.2.3.16']],
 ['Message',['message','rounded','8.2.3.16']],
]);
const referenceShapes=new Set(['PartUsage','ItemUsage','OccurrenceUsage','RequirementUsage','ConstraintUsage','ActionUsage','StateUsage']);
const parameterOwners=new Set(['ActionUsage','ActionDefinition','StateUsage','StateDefinition','CalculationUsage','CalculationDefinition','CaseUsage','CaseDefinition','AnalysisCaseUsage','AnalysisCaseDefinition','VerificationCaseUsage','VerificationCaseDefinition','UseCaseUsage','UseCaseDefinition']);
const memberCategories=new Map([['AttributeUsage','attributes'],['PartUsage','parts'],['PortUsage','ports'],['RequirementUsage','requirements'],['ItemUsage','items'],['EnumerationUsage','enums'],['OccurrenceUsage','occurrences'],['ConnectionUsage','connections'],['AllocationUsage','allocations'],['InterfaceUsage','interfaces'],['FlowUsage','flows'],['CalculationUsage','calcs'],['StateUsage','states'],['ActionUsage','actions'],['ConstraintUsage','constraints'],['AssertConstraintUsage','assert constraints'],['SatisfyRequirementUsage','satisfy requirements'],['ViewUsage','views'],['ViewpointUsage','viewpoints']]);
const memberCategory=(child,owner)=>child.kind==='PortUsage'?'ports':['in','out','inout'].includes(child.native?.direction)?parameterOwners.has(owner.kind)?'parameters':['PartDefinition','PartUsage'].includes(owner.kind)?'directed features':memberCategories.get(child.kind):child.native?.isEnd===true&&['ConnectionDefinition','ConnectionUsage','InterfaceDefinition','InterfaceUsage'].includes(owner.kind)?'ends':memberCategories.get(child.kind);
const declarationSuffix=native=>[native.isOrdered===true?'ordered':'',native.isUnique===false?'nonunique':''].filter(Boolean).join(' ');
function usagePrefix(native){return [native.isEnd===true?'end':'',native.isEnd===true?'':native.direction,native.isDerived===true?'derived':'',native.isAbstract===true?'abstract':native.isVariation===true?'variation':'',native.isConstant===true&&native.isEnd!==true?'constant':'',native.isIndividual===true?'individual':''].filter(Boolean).join(' ');}
const controls=new Map([['start','start'],['initial','start'],['done','done'],['final','done'],['end','done'],['terminate','terminate'],['terminate action','terminate'],['fork','fork'],['join','join'],['decision','decision'],['merge','merge']]);
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const caches=new WeakMap();
function index(graph){if(!graph)return {elements:new Map(),children:new Map()};if(caches.has(graph))return caches.get(graph);const elements=new Map((graph.elements??[]).map(e=>[e.id,e])),children=new Map();for(const edge of graph.containment??[])if(edge.nativeRole==='owner'){if(!children.has(edge.source))children.set(edge.source,new Set());children.get(edge.source).add(edge.target);}const result={elements,children};caches.set(graph,result);return result;}
const distinct=values=>[...new Set(values.filter(Boolean))];
const nativeName=element=>element?.native?.declaredName||'';
const declarationName=element=>[element?.native?.declaredShortName?'<' +element.native.declaredShortName+'>':'',nativeName(element)].filter(Boolean).join(' ');
const notice=(kind,id,message)=>({reason:'unsupported-focused-notation',target:id,kind,message});
const nativeTypeLabel=node=>['mapped','native'].includes(node?.identityStatus)&&typeof node.type==='string'&&node.type.trim()?node.type:'';
function typeLabelFor(element,node,view){
 const direct=nativeTypeLabel(node);if(direct)return direct;
 if(!element)return '';
 const labels=new Set();for(const item of view?.nodes??[]){for(const candidate of [item,...(item.ports??[])])if(candidate.semanticId===element.id){const label=nativeTypeLabel(candidate);if(label)labels.add(label);}}
 return labels.size===1?[...labels][0]:'';
}
function typeReferences(element,data,{node,view}={}){
 const ids=refs(element?.native?.type),names=[],unresolvedIds=[];
 for(const id of ids){const target=data.elements.get(id),name=target?.native?.declaredName||target?.native?.declaredShortName||target?.qualifiedName;if(name)names.push(name);else unresolvedIds.push(id);}
 const nativeLabel=typeLabelFor(element,node,view);
 return {ids,names:nativeLabel?[nativeLabel]:names,unresolvedIds,nativeLabel,labelAuthority:nativeLabel?'native-view':names.length?'native-declaration':null};
}
function unavailableTypes(element,types){return types.unresolvedIds.map(typeId=>({...notice(element.kind,element.id,types.nativeLabel?'The displayed type label comes from native rendering; its referenced type declaration '+typeId+' is outside this declaration projection.':'Native type '+typeId+' has no named declaration in this projection. The type reference is omitted from the graphical typed name; no library type name is inferred.'),reason:types.nativeLabel?'focused-native-type-label':'focused-type-unavailable',typeId}));}
function declaration(element,data,{view}={}){
 const types=typeReferences(element,data,{view}),prefix=usagePrefix(element.native??{}),suffix=declarationSuffix(element.native??{});
 const name=declarationName(element);return {text:(prefix?prefix+' ':'')+name+(types.names.length?' : '+types.names.join(', '):'')+(suffix?' '+suffix:''),typeIds:types.ids,unresolvedTypeIds:types.unresolvedIds,typeLabelAuthority:types.labelAuthority,notices:unavailableTypes(element,types)};
}
/** expanded controls optional doc/member compartments. Mandatory behavior text
 * is always retained, even when optional compartments are collapsed. */
export function focusedNodeDescriptor(node,graph,{expanded=true,pageSize=12,view}={}) {
 const data=index(graph),element=data.elements.get(node.semanticId),native=element?.native??{},kind=element?.kind;
 const base={semanticId:node.semanticId??null,representationId:node.id,keyword:'',name:element?nativeName(element):((node.nameSynthesized??node.name_synthesized)?'':node.name)||'',type:'',suffix:'',annotations:[],shape:'unsupported',compartments:[],notices:[],supported:false,section:null,reference:false};
 if(controls.has(node.kind))return {...base,shape:'control',control:controls.get(node.kind),supported:true,section:'8.2.3.17',caption:distinct([base.name,node.text,node.detail]).join('\n')};
 if(node.kind==='port'&&node.parentId){
  const direction=node.nativePort?.direction??node.direction??native.direction,parameter=node.parameter??node.nativePort?.parameter??false;
  return {...base,shape:'port-glyph',portSide:node.portSide??node.side??'EAST',parameter,direction,supported:['in','out','inout'].includes(direction),section:parameter?'8.2.3.17':'8.2.3.12',name:node.label||base.name,type:node.label?'':node.type||'',notices:['in','out','inout'].includes(direction)?[]:[notice(kind??'port',node.semanticId??node.id,'Port direction is unavailable in the native projection; its neutral attachment is retained without an invented arrow.')]};
 }
 const resolvedTypes=typeReferences(element,data,{node,view}),metadata=kind==='MetadataUsage'&&resolvedTypes.names.length===1&&(resolvedTypes.ids.length===1||resolvedTypes.nativeLabel);
 const profile=metadata?['metadata','note','8.2.3.27']:['actor','subject','stakeholder'].includes(node.kind)&&element?[''+node.kind,'rounded','8.2.3.21']:profiles.get(kind);if(!profile){const reason=kind==='ReferenceUsage'?'A standalone ReferenceUsage has no single graphical node production: its native parameter, subject, end or metadata-value role and owning frame must be supplied. Directed parameters and connector ends are rendered in their actual owner compartments.':kind==='MetadataUsage'?'A metadata annotation requires its resolved native metadata definition and expression argument text; those fields are not supplied by this declaration-only projection.':kind==='Dependency'?'A native Dependency is an edge, not a standalone graphical node. Open a native view that represents its client and supplier.':`Focused graphical notation for ${kind??node.kind??'unknown kind'} requires a native graphical role not provided by this projection.`;base.notices.push(notice(kind??node.kind,node.semanticId??node.id,reason+' Native content is retained in a neutral box.'));return base;}
 const [keyword,shape,section]=profile,types=resolvedTypes;
 Object.assign(base,{keyword,shape,section,supported:true,type:types.names.join(', '),typeIds:types.ids,unresolvedTypeIds:types.unresolvedIds,typeLabelAuthority:types.labelAuthority,reference:referenceShapes.has(kind)&&(native.isReference===true||native.isComposite===false)});
 if(metadata){base.metadataUsageName=base.name;base.name=types.names[0];base.type='';base.notices.push(...unavailableTypes(element,types));const bodyIds=refs(native.ownedMember);if(bodyIds.length){base.coverage='native-base';base.extensionLabel='Metadata body omitted from this projection';base.notices.push({reason:'focused-metadata-body',target:element.id,omittedIds:bodyIds,message:'The native metadata definition is known, but '+bodyIds.length+' owned body records do not supply argument expression text. No values are inferred or evaluated.'});}return base;}
 if(native.declaredShortName)base.name=['<'+native.declaredShortName+'>',base.name].filter(Boolean).join(' ');
 if(kind.endsWith('Definition')){if(native.isAbstract===true)base.keyword='abstract '+base.keyword;else if(native.isVariation===true&&kind!=='EnumerationDefinition')base.keyword='variation '+base.keyword;if(native.isIndividual===true)base.keyword='individual '+base.keyword;}else {const prefix=usagePrefix(native);if(prefix)base.keyword=prefix+' '+base.keyword;base.suffix=declarationSuffix(native);}
 if(native.isParallel===true||node.state?.parallel===true)base.annotations.push('parallel');
 if(['AND','OR','basic event','event','house event','undeveloped event'].includes(node.kind)){base.coverage='native-base';base.extensionLabel='Native fault-tree category: '+node.kind;base.notices.push({reason:'focused-native-base',target:node.semanticId,kind:node.kind,message:'This fault-tree element is rendered as its native '+kind+' base. The native '+node.kind+' category is preserved without claiming an OMG-standard gate symbol.'});}
 base.notices.push(...unavailableTypes(element,types));
 if(native.value)base.notices.push(notice(kind,node.semanticId,'A declared value expression is not evaluated or rendered by this focused subset.'));
 const modifiers=['isReadOnly','isPortion','isSufficient','isNegated'].filter(key=>native[key]===true);if(modifiers.length)base.notices.push(notice(kind,node.semanticId,'Unsupported native modifiers: '+modifiers.join(', ')+'.'));
 if(node.kind==='objective'){base.coverage='native-base';base.extensionLabel='Native case role: objective';base.notices.push({reason:'focused-native-base',target:node.semanticId,kind:node.kind,message:'The native objective is rendered using its requirement base; the case objective role remains explicit.'});}
 if(native.isConjugated===true)base.notices.push(notice(kind,node.semanticId,'Conjugated-port type notation is not supported by this focused rendering subset.'));
 if(native.multiplicity||native.ownedMultiplicity)base.notices.push(notice(kind,node.semanticId,'Native multiplicity is present but not rendered by this focused subset.'));
 if(node.state&&['StateUsage','StateDefinition','ExhibitStateUsage'].includes(kind)){
  const grouped=new Map();for(const behavior of node.state.behaviors??[]){if(!['entry','do','exit'].includes(behavior.role)){base.notices.push(notice(kind,node.semanticId,'Unsupported native state behavior role: '+behavior.role));continue;}if(!grouped.has(behavior.role))grouped.set(behavior.role,[]);grouped.get(behavior.role).push({semanticId:behavior.semanticId??null,qualifiedName:behavior.qualifiedName??null,identityStatus:behavior.identityStatus??'unknown',kind:behavior.kind,text:behavior.text??''});}
  for(const role of ['entry','do','exit'])if(grouped.has(role)){const entries=grouped.get(role);base.compartments.push({title:role,entries,text:entries.map(e=>e.text).join('\n'),mandatory:true,role:'native-state-behavior'});}
 }else if(node.text||node.detail){
  if(['ActionUsage','ActionDefinition','StateUsage','StateDefinition','AssignmentActionUsage','SendActionUsage','AcceptActionUsage','PerformActionUsage'].includes(kind)){base.compartments.push({title:'',text:distinct([node.text,node.detail]).join('\n'),mandatory:true,role:'native-behavior'});if(['StateUsage','StateDefinition'].includes(kind))base.notices.push(notice(kind,node.semanticId,'Native state text is retained verbatim; this older payload does not supply structured entry/do/exit roles.'));}
 }
 if(['SendActionUsage','AcceptActionUsage'].includes(kind))base.actionGlyph=kind==='SendActionUsage'?'send':'accept';
 if(['AssignmentActionUsage','SendActionUsage','AcceptActionUsage'].includes(kind)&&!node.text&&!node.detail)base.notices.push(notice(kind,node.semanticId,'The native declaration identifies this action kind but this payload does not supply its operand/expression text.'));
 if(['AssertConstraintUsage','SatisfyRequirementUsage'].includes(kind)&&!node.text&&!node.detail&&!element.description)base.notices.push(notice(kind,node.semanticId,'The native declaration identifies this assertion; its expression/subject details are not supplied by this rendering.'));
 if(expanded){
  if(element.description)base.compartments.push({title:'doc',text:element.description,role:'documentation',sourceId:element.id});
  const children=[...(data.children.get(element.id)??[])].map(id=>data.elements.get(id)).filter(Boolean).sort((a,b)=>nativeName(a).localeCompare(nativeName(b))||a.id.localeCompare(b.id));
  const categoryOf=child=>memberCategory(child,element);
  const eligible=children.filter(child=>categoryOf(child)),size=Math.max(1,Math.min(200,Number.isInteger(pageSize)?pageSize:12)),selected=eligible.slice(0,size),grouped=new Map();
  for(const child of selected){const category=categoryOf(child);if(!grouped.has(category))grouped.set(category,[]);const entry=declaration(child,data,{view});if(!entry.text){entry.text='…';entry.notices.push(notice(child.kind,child.id,'This anonymous declaration requires native expression/body text that is not supplied by the declaration projection.'));}grouped.get(category).push({semanticId:child.id,text:entry.text,typeIds:entry.typeIds,unresolvedTypeIds:entry.unresolvedTypeIds,typeLabelAuthority:entry.typeLabelAuthority});base.notices.push(...entry.notices);if(child.native?.value)base.notices.push(notice(child.kind,child.id,'A declared value expression is not evaluated or rendered by this focused subset.'));}
  for(const [title,entries]of grouped)base.compartments.push({title,entries,text:entries.map(item=>item.text).join('\n'),role:'owned-declarations'});
  if(eligible.length>selected.length){base.compartments.push({title:'',text:'…',role:'omission'});base.notices.push({reason:'focused-compartment-budget',target:node.semanticId,shown:selected.length,total:eligible.length,message:`Showing ${selected.length} of ${eligible.length} native owned declarations; browse declarations to reach all.`});}
  const unhandled=children.filter(child=>!categoryOf(child)&&!['Documentation','Comment','ViewUsage','ViewDefinition'].includes(child.kind));
  if(unhandled.length)base.notices.push(notice(kind,node.semanticId,`${unhandled.length} owned declarations are outside the supported native declaration compartments; their native identities remain available in hierarchy.`));
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
 case 'send':d='M7 10 H27 L37 20 L27 30 H7 Z';fill='currentColor';break;
 case 'accept':d='M5 10 H33 V30 H5 L15 20 Z';fill='currentColor';break;
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
 if(['control','port-glyph'].includes(descriptor.shape)){face.append(symbol(document,descriptor.shape==='port-glyph'?{...descriptor,portSide:node.portSide??node.side??descriptor.portSide}:descriptor));if(descriptor.shape==='control'&&descriptor.caption)face.append(make('span',descriptor.caption,'focused-control-caption'));if(descriptor.shape==='port-glyph'&&descriptor.name)face.append(make('span',descriptor.name+(descriptor.type?' : '+descriptor.type:'')+(descriptor.suffix?' '+descriptor.suffix:''),'port-name'));return face;}
 if(descriptor.shape==='note'){const frame=document.createElementNS(svgNS,'svg');frame.classList.add('focused-note-frame');frame.setAttribute('viewBox','0 0 100 100');frame.setAttribute('preserveAspectRatio','none');frame.setAttribute('aria-hidden','true');const border=document.createElementNS(svgNS,'path');border.setAttribute('d','M0 0 H85 L100 15 V100 H0 Z M85 0 V15 H100');border.setAttribute('fill','white');border.setAttribute('stroke','currentColor');border.setAttribute('stroke-width','1.5');border.setAttribute('vector-effect','non-scaling-stroke');frame.append(border);face.append(frame);}
 if(descriptor.actionGlyph){face.dataset.actionGlyph=descriptor.actionGlyph;const glyph=symbol(document,{control:descriptor.actionGlyph});glyph.classList.add('focused-action-symbol');face.append(glyph);}
 if(descriptor.shape==='package')face.append(make('span',undefined,'focused-package-tab'));
 const header=make('span',undefined,'focused-header');if(descriptor.typeLabelAuthority)header.dataset.typeLabelAuthority=descriptor.typeLabelAuthority;if(descriptor.keyword)header.append(make('span','«'+descriptor.keyword+'»','focused-keyword'));header.append(make('span',descriptor.name+(descriptor.type?' : '+descriptor.type:'')+(descriptor.suffix?' '+descriptor.suffix:''),'focused-name name'));for(const annotation of descriptor.annotations??[])header.append(make('span','«'+annotation+'»','focused-keyword'));face.append(header);
 for(const compartment of descriptor.compartments){const section=make('span',undefined,'focused-compartment');section.dataset.role=compartment.role;if(compartment.sourceId)section.dataset.sourceId=compartment.sourceId;if(compartment.title)section.append(make('span',compartment.title,'focused-compartment-title'));if(compartment.entries)for(const entry of compartment.entries){const line=make('span',entry.text,'focused-compartment-line');if(entry.semanticId)line.dataset.semanticId=entry.semanticId;if(entry.qualifiedName)line.dataset.qualifiedName=entry.qualifiedName;section.append(line);}else section.append(make('span',compartment.text,'focused-compartment-text'));face.append(section);}
 if(descriptor.extensionLabel)face.append(make('span',descriptor.extensionLabel,'focused-extension'));
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
 const fallback=24+lines(descriptor.name+(descriptor.type?' : '+descriptor.type:'')+(descriptor.suffix?' '+descriptor.suffix:''))*19+(descriptor.keyword?18:0)+(descriptor.annotations?.length??0)*18+(descriptor.extensionLabel?24:0)+(descriptor.shape==='package'?18:0)+descriptor.compartments.reduce((sum,c)=>sum+16+(c.title?16:0)+lines(c.text)*17,0);
 return {width,height:Math.ceil(Math.max(72,measured,fallback)),focusedDescriptor};
}
/** One inspectable, per-kind coverage record for every rendered unsupported item. */
export function focusedNotationNotices(view,graph) {
 const notices=[];
 if(view.kind==='fault-tree')notices.push({reason:'focused-native-base',kind:view.kind,message:'Fault-tree elements use their available native occurrence/connection base symbols. Native gate categories remain visible; these extensions are not claimed as OMG-standard fault-tree symbols.'});
 for(const node of view.nodes??[])notices.push(...(node.focusedDescriptor??focusedNodeDescriptor(node,graph,{view})).notices);
 for(const edge of view.edges??[]){const appearance=focusedEdgeAppearance(edge,{viewKind:view.kind,graph,view});if(appearance.notice)notices.push({reason:appearance.supported?'focused-native-base':'unsupported-focused-notation',relationshipId:edge.id,kind:edge.kind,message:appearance.notice,missingFacts:appearance.missingFacts??[]});}
 return notices;
}
