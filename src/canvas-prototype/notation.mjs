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
export function focusedEdgeAppearance(edge,{viewKind=edge.viewKind}={}) {
 const profile=Object.hasOwn(focusedProfiles,edge.kind)?focusedProfiles[edge.kind]:null;
 // Native flow collapses message, flow and succession-flow into one kind;
 // their distinct normative arrows cannot be selected from that kind alone.
 // Derivation is a domain-library connection whose end roles are not retained
 // by the native 'derive' edge. Do not substitute SysML v1 dependency notation.
 if(!profile||edge.aggregate||edge.presentationOnly||(['case','mixed'].includes(viewKind)&&['typing','reference'].includes(edge.kind)))return {line:'solid',sourceMarker:'none',targetMarker:'none',directed:false,label:edge.label??'',supported:false,family:'unsupported',notice:`Focused notation unsupported for ${String(edge.kind??'(missing kind)')}${edge.aggregate||edge.presentationOnly?' presentation aggregate':''}: native projection lacks an unambiguous supported OMG graphical production. Native identities and endpoint order are retained.`};
 let [line,sourceMarker,targetMarker,directed,family,section]=profile;
 if(edge.kind==='succession'&&!['action','activity'].includes(viewKind))return {line:'solid',sourceMarker:'none',targetMarker:'none',directed:false,label:edge.label??'',supported:false,family:'unsupported',notice:'Focused succession notation outside an action-flow view is unsupported: the native kind does not distinguish temporal succession from action control flow.'};
 const keyword=['satisfy','verify','allocate','include','import'].includes(edge.kind)?'«'+edge.kind+'»':edge.kind==='binding'?'=':'';
 const already=keyword&&(edge.label===keyword||edge.label?.startsWith(keyword+' '));
 const bare=['specialization','typing','composition','reference','containment','succession'].includes(edge.kind)&&(edge.label===edge.kind||edge.kind==='containment'&&edge.label==='owns');
 const label=bare?'':keyword?(already?edge.label:edge.label&&edge.label!==edge.kind?keyword+' '+edge.label:keyword):edge.label??'';
 return {line,sourceMarker,targetMarker,directed,family,label,supported:true,notice:'',section};
}
