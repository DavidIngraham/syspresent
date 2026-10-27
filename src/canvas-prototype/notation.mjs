/**
 * Interactive canvas notation over native OpenSysML EdgeKind values.
 *
 * Authority: opensysml 19eaec64755ff229794bda0193d4be9db9ca1b10,
 * internal/ir/view/view.go (EdgeKind meaning and direction),
 * internal/ir/view/dot.go:1856 (dotEdgeAttributes), and
 * internal/ir/view/dot_test.go:348 (all edge kinds, including case/mixed).
 * Official notation scope: https://www.omg.org/spec/SysML/2.0/Language/PDF
 * sections 8.2.3.2 and 8.2.3.5-6. These are native SysML v2 renderer
 * profiles, not inferred SysML v1 styles. Native containment is DOT odot
 * (hollow circle), distinct from the nonsemantic continuation chevron.
 * A display attachment is geometry; only native fromPort/toPort identifies a
 * modeled port. The profile neither creates ports nor reverses endpoints.
 */
const profiles = Object.freeze({
  connection:     ['solid',  'none',           'none',            false, 'connector'],
  transition:     ['solid',  'none',           'filled-arrow',    true,  'behavior'],
  succession:     ['solid',  'none',           'filled-arrow',    true,  'behavior'],
  flow:           ['dashed', 'none',           'filled-arrow',    true,  'behavior'],
  binding:        ['solid',  'none',           'none',            false, 'connector'],
  specialization: ['solid',  'none',           'hollow-triangle', true,  'classifier'],
  typing:         ['dashed', 'none',           'hollow-triangle', true,  'classifier'],
  composition:    ['solid',  'diamond',        'none',            true,  'ownership'],
  reference:      ['solid',  'hollow-diamond', 'none',            true,  'ownership'],
  containment:    ['solid',  'containment',    'none',            true,  'ownership'],
  import:         ['dashed', 'none',           'open-arrow',      true,  'dependency'],
  satisfy:        ['dashed', 'none',           'open-arrow',      true,  'dependency'],
  verify:         ['dashed', 'none',           'open-arrow',      true,  'dependency'],
  derive:         ['dashed', 'none',           'open-arrow',      true,  'derivation'],
  refine:         ['dashed', 'none',           'open-arrow',      true,  'dependency'],
  allocate:       ['dashed', 'none',           'open-arrow',      true,  'dependency'],
  association:    ['solid',  'none',           'none',            false, 'connector'],
  include:        ['dashed', 'none',           'filled-arrow',    true,  'dependency'],
  anchor:         ['dashed', 'none',           'none',            false, 'annotation'],
  dependency:     ['dashed', 'none',           'open-arrow',      true,  'dependency'],
});

/** Preserve the native label verbatim, including an empty label. */
export function edgeAppearance(edge, {viewKind = edge.viewKind} = {}) {
  const profile = Object.hasOwn(profiles, edge.kind) ? profiles[edge.kind] : null;
  if (!profile) return {
    line: 'solid', sourceMarker: 'none', targetMarker: 'none', directed: false,
    label: edge.label ?? '', supported: false, family: 'unsupported',
    notice: `Unsupported relationship notation: ${String(edge.kind ?? '(missing kind)')}. Shown as a neutral line; direction is not inferred.`,
  };
  let [line, sourceMarker, targetMarker, directed, family] = profile;
  if (['case', 'mixed'].includes(viewKind) && ['typing', 'reference'].includes(edge.kind)) {
    line = 'dashed'; sourceMarker = 'none'; targetMarker = 'open-arrow';
    directed = true; family = 'dependency';
  }
  return {line, sourceMarker, targetMarker, directed, family,
    label: edge.label ?? '', supported: true, notice: ''};
}

/**
 * Placement preferences are separate from semantic endpoint order. A rank may
 * guide placement only; it must never reverse native arrows or action order.
 * Target-above-source implements general-above-specific for derivation,
 * specialization and typing, and a decision chain with requirements above their
 * satisfying parts and verification cases. The arrows retain their native
 * source-to-target direction; vertical reading order is a presentation policy.
 * Generic dependencies and allocations do not imply an endpoint hierarchy.
 */
export function edgeLayoutHints(edge, options) {
  const appearance = edgeAppearance(edge, options);
  const caseReference = appearance.family === 'dependency' && edge.kind === 'reference';
  const rank = ['specialization', 'typing', 'derive', 'refine', 'satisfy', 'verify'].includes(edge.kind)
    ? 'target-above-source'
    : ['composition', 'containment', 'reference'].includes(edge.kind) && !caseReference
      ? 'source-above-target'
      : ['transition', 'succession', 'flow'].includes(edge.kind)
        ? 'source-before-target' : 'free';
  return {family: appearance.family, rank, preserveEndpoints: true,
    supported: appearance.supported};
}

/** A truncated context route is not a modeled node, junction, or port. */
export function continuationAppearance() {
  return {marker: 'continuation-chevron', filled: false, semantic: false,
    label: 'More model context beyond this view'};
}

/**
 * SVG marker geometry. Resolve fill tokens against the current line/background
 * colours; use auto-start-reverse so a source marker faces its native endpoint.
 * Hollow shapes must have an opaque background, keeping the route out of them.
 * The containment hollow circle follows native DOT odot, without a junction dot.
 */
export function markerDefinition(name) {
  const common = {viewBox: '0 0 12 12', refX: 11, refY: 6,
    markerWidth: 12, markerHeight: 12, orient: 'auto-start-reverse'};
  switch (name) {
    case 'open-arrow': return {...common, path: 'M1,1 L11,6 L1,11', fill: 'none'};
    case 'filled-arrow': return {...common, path: 'M1,1 L11,6 L1,11 Z', fill: 'line'};
    case 'hollow-triangle': return {...common, path: 'M1,1 L11,6 L1,11 Z', fill: 'background'};
    case 'diamond': return {...common, path: 'M1,6 L6,1 L11,6 L6,11 Z', fill: 'line'};
    case 'hollow-diamond': return {...common, path: 'M1,6 L6,1 L11,6 L6,11 Z', fill: 'background'};
    case 'containment': return {...common, path: 'M11,6 A5,5 0 1,1 1,6 A5,5 0 1,1 11,6 Z', fill: 'background'};
    case 'definition-two-dot': return {...common, viewBox:'0 0 22 16', refX:21,refY:8,markerWidth:22,markerHeight:16,path:'M7,1 L21,8 L7,15 Z',fill:'background',adornments:[{path:'M2,4 A1.5,1.5 0 1,0 5,4 A1.5,1.5 0 1,0 2,4 Z M2,12 A1.5,1.5 0 1,0 5,12 A1.5,1.5 0 1,0 2,12 Z',fill:'line'}]};
    case 'redefinition': return {...common,viewBox:'0 0 22 16',refX:21,refY:8,markerWidth:22,markerHeight:16,path:'M7,1 L21,8 L7,15 Z M3,1 L3,15',fill:'background'};
    case 'reference-subsetting': return {...common,viewBox:'0 0 28 20',refX:27,refY:10,markerWidth:28,markerHeight:20,path:'M13,3 L27,10 L13,17 Z',fill:'background',adornments:[{path:'M2,6 A1.5,1.5 0 1,0 5,6 A1.5,1.5 0 1,0 2,6 Z M7,6 A1.5,1.5 0 1,0 10,6 A1.5,1.5 0 1,0 7,6 Z M2,14 A1.5,1.5 0 1,0 5,14 A1.5,1.5 0 1,0 2,14 Z M7,14 A1.5,1.5 0 1,0 10,14 A1.5,1.5 0 1,0 7,14 Z',fill:'line'}]};
    case 'owned-membership': return {...common,path:'M11,6 A5,5 0 1,1 1,6 A5,5 0 1,1 11,6 Z M6,1 L6,11 M1,6 L11,6',fill:'background'};
    case 'continuation-chevron': return {...common, path: 'M2,1 L7,6 L2,11 M6,1 L11,6 L6,11', fill: 'none'};
    default: return null;
  }
}

/** OMG SysML 2.0 formal/2026-03-02 graphical productions. These focused
 * profiles deliberately differ from the engine's exploratory DOT profiles.
 * Endpoint order is the native From/To order; marker choice never swaps it.
 * See 8.2.3.3/.5/.6/.13/.15/.17/.18/.21/.24/.25. */
const focusedProfiles=Object.freeze({
 connection:['solid','none','none',false,'connector','8.2.3.13'],
 association:['solid','none','none',false,'case-role','8.2.3.21'],
 binding:['solid','none','none',false,'connector','8.2.3.13'],
 specialization:['solid','none','hollow-triangle',true,'classifier','8.2.3.6'],
 typing:['solid','none','definition-two-dot',true,'classifier','8.2.3.6'],
 composition:['solid','diamond','none',true,'ownership','8.2.3.6'],
 reference:['solid','hollow-diamond','none',true,'ownership','8.2.3.6'],
 containment:['solid','owned-membership','none',true,'ownership','8.2.3.5'],
 dependency:['dashed','none','open-arrow',true,'dependency','8.2.3.3'],
 import:['dashed','none','open-arrow',true,'dependency','8.2.3.5'],
 satisfy:['solid','none','open-arrow',true,'requirement','8.2.3.21'],
 verify:['solid','none','open-arrow',true,'verification','8.2.3.24'],
 allocate:['solid','none','open-arrow',true,'allocation','8.2.3.15'],
 include:['solid','none','open-arrow',true,'case','8.2.3.25'],
 succession:['dashed','none','open-arrow',true,'behavior','8.2.3.17'],
 transition:['solid','none','open-arrow',true,'behavior','8.2.3.18'],
});
const focusedGraphs=new WeakMap();
function focusedIndex(graph){if(!graph)return new Map();if(!focusedGraphs.has(graph))focusedGraphs.set(graph,new Map((graph.elements??[]).map(e=>[e.id,e])));return focusedGraphs.get(graph);}
const nativeRefs=value=>Array.isArray(value)?value.flatMap(nativeRefs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
function edgeNativeRecord(edge,graph){const data=focusedIndex(graph);for(const id of [edge.nativeRelationship,edge.semanticId,...(edge.occurrences??[]).map(o=>o.semanticId)]){const record=data.get(id);if(record&&['Dependency','ConnectionUsage','FlowUsage','SuccessionFlowUsage','Message'].includes(record.kind))return record;}return null;}
function semanticEnds(edge,view,graph){const known=focusedIndex(graph),nodes=new Map((view?.nodes??[]).map(n=>[n.id,n.semanticId]));return [edge.semanticSource??edge.sourceSemanticId??nodes.get(edge.fromId??edge.from??edge.source)??(known.has(edge.source)?edge.source:null),edge.semanticTarget??edge.targetSemanticId??nodes.get(edge.toId??edge.to??edge.target)??(known.has(edge.target)?edge.target:null)];}
function focusedUnsupported(edge,message,missingFacts=[]){return {line:'solid',sourceMarker:'none',targetMarker:'none',directed:false,label:edge.label??'',supported:false,family:'unsupported',missingFacts,notice:`Focused notation unsupported for ${String(edge.kind??'(missing kind)')}: ${message}. Native identities and endpoint order are retained.`};}
function faithfulName(edge,record){return edge.name??record?.native?.declaredName??'';}
function occurrenceNotation(edge){const facts=(edge.occurrences??[]).map(o=>o.nativeEdge?.notation).filter(Boolean);if(!facts.length)return null;const keys=['production','declarationKind','sourceRole','targetRole','sourceEndName','targetEndName','classification'],signature=f=>JSON.stringify(keys.map(k=>f[k]??null)),first=signature(facts[0]);return facts.every(f=>signature(f)===first)?facts[0]:null;}
/** Native notation facts are produced by the semantic engine, never by label
 * matching. Old payloads may use an exported metatype plus explicit endpoint roles. */
export function focusedEdgeAppearance(edge,{viewKind=edge.viewKind,graph,view}={}) {
 const profile=Object.hasOwn(focusedProfiles,edge.kind)?focusedProfiles[edge.kind]:null,record=edgeNativeRecord(edge,graph),facts=edge.notation??occurrenceNotation(edge)??{},production=facts.production;
 const nativeIds=new Set((edge.occurrences??[]).map(o=>o.semanticId).filter(id=>['Dependency','ConnectionUsage','FlowUsage','SuccessionFlowUsage','Message'].includes(focusedIndex(graph).get(id)?.kind)));
 if(!edge.nativeRelationship&&nativeIds.size>1)return focusedUnsupported(edge,'this presentation edge combines distinct native relationship identities; open an individual native occurrence',['one native relationship identity']);
 if(edge.aggregate||edge.presentationOnly)return focusedUnsupported(edge,'presentation aggregates are exploratory artifacts, not native relationships');
 if(edge.kind==='refine'||production==='refinement'){
  const [source,target]=semanticEnds(edge,view,graph),native=record?.native;
  const classified=production==='refinement'&&facts.sourceRole==='client'&&facts.targetRole==='supplier';
  const exported=record?.kind==='Dependency'&&source&&target&&nativeRefs(native.client).includes(source)&&nativeRefs(native.supplier).includes(target);
  if(!classified&&!exported)return focusedUnsupported(edge,'refinement requires native Dependency client/supplier roles or explicit native refinement facts',['Dependency.client','Dependency.supplier']);
  return {line:'dashed',sourceMarker:'none',targetMarker:'open-arrow',directed:true,label:faithfulName(edge,record),supported:true,family:'dependency',coverage:'native-base',section:'8.2.3.3',notice:'Refinement is rendered with the verified native Dependency base symbol. Its refinement metadata classification remains native; this is not a SysML v1 refine stereotype.'};
 }
 if(edge.kind==='derive'||production==='derivation'){
  if(production!=='derivation'||facts.sourceRole!=='derived'||facts.targetRole!=='original')return focusedUnsupported(edge,'derivation requires explicit native derived/original end-role facts; a mapped element identity or label does not establish those roles',['notation.production','notation.sourceRole','notation.targetRole']);
  const endLabels=[{end:'source',role:'derived',text:facts.sourceEndName??''},{end:'target',role:'original',text:facts.targetEndName??''}];
  return {line:'solid',sourceMarker:'none',targetMarker:'none',directed:false,label:faithfulName(edge,record),supported:true,family:'connector',coverage:'native-base',section:'8.2.3.13',endLabels,notice:'Requirement derivation is rendered as its native ConnectionUsage base; source role is derived'+(facts.sourceEndName?' ('+facts.sourceEndName+')':'')+' and target role is original'+(facts.targetEndName?' ('+facts.targetEndName+')':'')+'. The connector has no invented dependency arrow. Native end roles and relationship direction remain inspectable.'};
 }
 if(edge.kind==='flow'||['flow','succession-flow','message'].includes(production)){
  const nativeProduction=production??({'FlowUsage':'flow','SuccessionFlowUsage':'succession-flow','Message':'message'}[record?.kind]);
  if(!['flow','succession-flow','message'].includes(nativeProduction))return focusedUnsupported(edge,'the native flow kind does not distinguish flow, succession flow and message',['notation.production']);
  if(nativeProduction!=='message'&&!(edge.fromPort&&edge.toPort))return focusedUnsupported(edge,'flow and succession-flow require native directed-feature endpoint pins; node-to-node fallback does not identify the required parameters/proxies',['fromPort','toPort','nodes[].ports']);
  return {line:nativeProduction==='succession-flow'?'dashed':'solid',sourceMarker:'none',targetMarker:nativeProduction==='message'?'open-arrow':'filled-arrow',directed:true,label:edge.label??'',supported:true,family:nativeProduction,section:'8.2.3.16',notice:''};
 }
 if(production==='action-succession')return {line:'dashed',sourceMarker:'none',targetMarker:'open-arrow',directed:true,label:edge.label??'',supported:true,family:'behavior',section:'8.2.3.17',notice:''};
 if(production==='state-transition')return {line:'solid',sourceMarker:'none',targetMarker:'open-arrow',directed:true,label:edge.label??'',supported:true,family:'behavior',section:'8.2.3.18',notice:''};
 if(edge.kind==='specialization'){
  const [source,target]=semanticEnds(edge,view,graph),element=focusedIndex(graph).get(source),native=element?.native??{};
  const verified=nativeRefs(native.specializes).includes(target)?'subclassification':nativeRefs(native.redefines).includes(target)?'redefinition':nativeRefs(native.subsets).includes(target)?nativeRefs(native.ownedReferenceSubsetting).length?'reference-subsetting':'subsetting':null;
  if(!verified)return focusedUnsupported(edge,'the native specialization kind conflates subclassification, subsetting and redefinition; explicit native role targets are required',['specializes|subsets|redefines']);
  return {line:'solid',sourceMarker:'none',targetMarker:verified==='redefinition'?'redefinition':verified==='reference-subsetting'?'reference-subsetting':'hollow-triangle',directed:true,label:edge.label===edge.kind?'':edge.label??'',supported:true,family:'classifier',section:'8.2.3.6',production:verified,notice:''};
 }
 if(['case','mixed'].includes(viewKind)&&['typing','reference'].includes(edge.kind)){
  const [source,target]=semanticEnds(edge,view,graph),data=focusedIndex(graph),element=data.get(source),native=element?.native??{};
  if(edge.kind==='typing'&&nativeRefs(native.type).includes(target))return {line:'solid',sourceMarker:'none',targetMarker:'definition-two-dot',directed:true,label:'',supported:true,family:'classifier',section:'8.2.3.6',notice:''};
  if(edge.kind==='reference'){
   const verb=element?.kind==='PerformActionUsage'?'perform':element?.kind==='ExhibitStateUsage'?'exhibit':null;
   if(verb&&nativeRefs(native.subsets).includes(target))return {line:'solid',sourceMarker:'none',targetMarker:'open-arrow',directed:true,label:'«'+verb+'»',supported:true,family:'behavior',section:verb==='perform'?'8.2.3.17':'8.2.3.18',notice:''};
   const child=data.get(target);if(child&&nativeRefs(child.native?.owner).includes(source)&&child.native?.isReference===true)return {line:'solid',sourceMarker:'hollow-diamond',targetMarker:'none',directed:true,label:'',supported:true,family:'ownership',section:'8.2.3.6',notice:''};
  }
  return focusedUnsupported(edge,'the mixed/case native relationship kind requires an explicit native type, ownership, perform or exhibit target role',['native.type|native.owner|native.subsets']);
 }
 if(!profile)return focusedUnsupported(edge,'native projection lacks an unambiguous supported OMG graphical production');
 let [line,sourceMarker,targetMarker,directed,family,section]=profile;
 if(edge.kind==='succession'&&!['action','activity'].includes(viewKind))return focusedUnsupported(edge,'succession outside an action-flow view requires a native action-succession production',['notation.production']);
 const keyword=['satisfy','verify','allocate','include','import'].includes(edge.kind)?'«'+edge.kind+'»':edge.kind==='binding'?'=':'';
 const already=keyword&&(edge.label===keyword||edge.label?.startsWith(keyword+' '));
 const bare=['specialization','typing','composition','reference','containment','succession'].includes(edge.kind)&&(edge.label===edge.kind||edge.kind==='containment'&&edge.label==='owns');
 const label=bare?'':keyword?(already?edge.label:edge.label&&edge.label!==edge.kind?keyword+' '+edge.label:keyword):edge.label??'';
 return {line,sourceMarker,targetMarker,directed,family,label,supported:true,notice:'',section};
}
