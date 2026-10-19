/** Focused display projections over native engineering relationships.
 * No relationship or identity is inferred from labels, documentation or ancestry.
 * Definition/usage bridges are explicit typing, at most one hop.
 * Package ownership remains location context, distinct from part composition.
 */
import {isDeclarationKind} from './graph.mjs';
import {ENGINEERING_RELATIONSHIPS} from './core/index.mjs';

const engineeringKinds=new Set(ENGINEERING_RELATIONSHIPS);
const requirementKinds=new Set(['RequirementDefinition','RequirementUsage']);
const structuralKinds=new Set(['PartDefinition','PartUsage','Package','Namespace']);
const packageKinds=new Set(['Package','Namespace']);
const structuralModes=new Set(['contents','container']);
const structuralEdges=new Set(['composition','reference','containment']);
export const isStructuralElement=element=>structuralKinds.has(element?.kind);
const engineeringElement=/^(Requirement|Part|Action|State|VerificationCase|AnalysisCase|UseCase|Case|Constraint|Calculation|Interface|Connection|Port|Attribute|Item|Occurrence|Allocation)(Definition|Usage)$/;
const origins=new Set(['derive','derivation','refine','refinement']);
const satisfaction=new Set(['satisfy','satisfaction']);
const allocation=new Set(['allocate','allocation']);
const verification=new Set(['verify','verification']);
const compare=(a,b)=>a<b?-1:a>b?1:0;
const clone=value=>structuredClone(value);
const edgeKey=edge=>JSON.stringify([edge.id??null,edge.source,edge.target,edge.kind]);
const modes=Object.freeze({
 origins:{label:'Origins',empty:'No upstream derivation or refinement links are known in the loaded model.'},
 derived:{label:'Derived requirements',empty:'No downstream derivation or refinement links are known in the loaded model.'},
 impact:{label:'Design impact',empty:'No satisfaction or allocation links are known in the loaded model.'},
 verification:{label:'Verification',empty:'No verification links are known in the loaded model.'},
 contents:{label:'Parts / contents',empty:'No direct contents are known in the loaded model.'},
 container:{label:'Containing element',empty:'No containing element is known in the loaded model.'},
 context:{label:'Explore connections',empty:'No engineering neighbors are known in the loaded model.'}
});
const endpoint=(edge,side)=>side==='source'?edge.source??edge.fromId??edge.from_id??edge.from:edge.target??edge.toId??edge.to_id??edge.to;
function accepts(edge,anchor,mode,{root,elements,bridge}={}){
 const structural=isStructuralElement(root);
 const ownership=edge.kind==='containment'&&(packageKinds.has(elements?.get(edge.source)?.kind)||packageKinds.has(elements?.get(edge.target)?.kind));
 const structure=structuralEdges.has(edge.kind)&&(edge.kind!=='containment'||ownership);
 if(structuralModes.has(mode))return structural&&structure&&(mode==='contents'?edge.source===anchor:edge.target===anchor)&&(!bridge||mode==='contents'&&edge.kind!=='containment');
 // Only children declared on the direct part definition are reached through
 // its typing bridge. Do not inherit the definition's owner or requirements.
 if(bridge&&root.kind==='PartUsage')return mode==='context'&&['composition','reference'].includes(edge.kind)&&edge.source===anchor;
 if(mode==='context'&&structural&&ownership)return true;
 if(mode==='origins')return origins.has(edge.kind)&&edge.source===anchor;
 if(mode==='derived')return origins.has(edge.kind)&&edge.target===anchor;
 if(mode==='impact')return satisfaction.has(edge.kind)&&edge.target===anchor||allocation.has(edge.kind);
 if(mode==='verification')return verification.has(edge.kind)&&edge.target===anchor;
 return engineeringKinds.has(edge.kind);
}
function prepare(graph){
 const elements=new Map((graph.elements??[]).map(element=>[element.id,element]));
 // Compute sort keys once; sorting large native graphs must not repeatedly
 // serialize the same relationship during every comparison or action mode.
 const compositionPairs=new Set((graph.relationships??[]).filter(e=>['composition','reference'].includes(e.kind)).map(e=>JSON.stringify([endpoint(e,'source'),endpoint(e,'target')])));
 const ownership=(graph.containment??[]).filter(e=>e.kind==='containment'&&e.nativeRole==='owner'&&!compositionPairs.has(JSON.stringify([e.source,e.target])));
 const keyed=new Map([...(graph.relationships??[]),...ownership].map(edge=>{const value={...edge,source:endpoint(edge,'source'),target:endpoint(edge,'target')};return [edgeKey(value),value];}));
 const edges=[...keyed].sort((a,b)=>compare(a[0],b[0])).map(([,edge])=>edge);
 const incident=new Map();
 for(const edge of edges)for(const id of new Set([edge.source,edge.target])){if(!incident.has(id))incident.set(id,[]);incident.get(id).push(edge);}
 return {elements,edges,incident};
}
function projection(graph,focus,mode,options={},prepared=prepare(graph)){
 if(!modes[mode])throw new Error('Unknown exploration mode: '+mode);
 const {elements,edges,incident}=prepared;
 const root=elements.get(focus),structural=isStructuralElement(root)&&['context','contents','container'].includes(mode);
 const omissions=[],seen=new Set(),anchors=new Map([[focus,null]]),candidates=new Map(),unavailable=new Set(),filtered=new Set();
 const kinds=options.relationshipKinds?new Set(options.relationshipKinds):null;
 const nodeKinds=options.elementKinds?new Set(options.elementKinds):null;
 const scope=options.scopeIds?new Set(options.scopeIds):null;
 const omit=(edge,target,reason,anchor)=>{const key=JSON.stringify([edgeKey(edge??{}),target,reason,anchor]);if(!seen.has(key)){seen.add(key);omissions.push({relationshipId:edge?.id??null,target,reason,anchor:anchor??null});}};
 const reason=id=>{
  const element=elements.get(id);
  if(!element)return 'unavailable';
  if(element.layer==='metamodel'||element.metamodel===true)return 'metamodel-boundary';
  if(scope&&!scope.has(id))return 'outside-scope';
  if(!engineeringElement.test(element.kind??'')&&!((structural||id===focus)&&isDeclarationKind(element.kind)))return 'element-policy';
  if(nodeKinds&&!nodeKinds.has(element.kind))return 'element-filter';
  return null;
 };
 const rootReason=reason(focus);
 if(rootReason){omit(null,focus,rootReason,null);return {elements,edges,anchors,candidates,omissions,unavailable,filtered,rootReason,root};}
 // Requirements may bridge either representation; parts follow only their
 // direct declared type. Never recurse or pull sibling typed usages into view.
 if(requirementKinds.has(root.kind)||root.kind==='PartUsage'&&['context','contents'].includes(mode))for(const edge of incident.get(focus)??[]){
  if(!['type','typing'].includes(edge.kind)||edge.source!==focus&&edge.target!==focus)continue;
  const target=edge.source===focus?edge.target:edge.source,other=elements.get(target);
  if(root.kind==='PartUsage'&&edge.source!==focus)continue;
  const opposite=root.kind==='PartUsage'?'PartDefinition':root.kind==='RequirementUsage'?'RequirementDefinition':'RequirementUsage';
  const excluded=reason(target);
  if(excluded){omit(edge,target,excluded,focus);if(excluded==='unavailable')unavailable.add(target);continue;}
  if(other.kind!==opposite){omit(edge,target,'typing-boundary',focus);continue;}
  if(!anchors.has(target))anchors.set(target,edge);
  // A part's classifier is useful structure even if it declares no children.
  if(root.kind==='PartUsage'&&mode==='context'&&(!kinds||kinds.has(edge.kind)))candidates.set(target,[{edge,anchor:focus,bridge:null}]);
 }
 if(structuralModes.has(mode)&&!isStructuralElement(root))return {elements,edges,anchors,candidates,omissions,unavailable,filtered,rootReason:'not-structural',root};
 if(mode!=='context'&&!structuralModes.has(mode)&&!requirementKinds.has(root.kind))return {elements,edges,anchors,candidates,omissions,unavailable,filtered,rootReason:'not-requirement',root};
 for(const [anchor,bridge]of anchors)for(const edge of incident.get(anchor)??[]){
  if(edge.source!==anchor&&edge.target!==anchor)continue;
  const target=edge.source===anchor?edge.target:edge.source;
  if(anchors.has(target))continue;
  if(!accepts(edge,anchor,mode,{root,elements,bridge})){omit(edge,target,'relationship-policy',anchor);continue;}
  const excluded=kinds&&!kinds.has(edge.kind)?'relationship-filter':reason(target);
  if(excluded){omit(edge,target,excluded,anchor);(excluded==='unavailable'?unavailable:filtered).add(target);continue;}
  if(!candidates.has(target))candidates.set(target,[]);
  candidates.get(target).push({edge,anchor,bridge});
 }
 // Pick a shortest explicit connection for each neighbor. Additional links on
 // already necessary bridge nodes remain visible, without adding more nodes.
 for(const target of candidates.keys())filtered.delete(target);
 for(const links of candidates.values())links.sort((a,b)=>Number(Boolean(a.bridge))-Number(Boolean(b.bridge))||compare(a.anchor,b.anchor)||compare(edgeKey(a.edge),edgeKey(b.edge)));
 return {elements,edges,anchors,candidates,omissions,unavailable,filtered,rootReason:null,root};
}
function summaryFor(data,mode,shown,total){
 const unavailable=data.unavailable.size,filtered=data.filtered.size;
 let status=shown?'shown':unavailable?'unavailable':filtered?'filtered':'no-known-links';
 let message=shown?`${shown} of ${total} matching ${isStructuralElement(data.root)?'structural / engineering':'engineering'} neighbors shown.`:modes[mode].empty;
 if(data.rootReason){status=['not-requirement','not-structural'].includes(data.rootReason)?'filtered':'missing-focus';message=data.rootReason==='not-requirement'?'This action applies to requirement definitions and usages.':data.rootReason==='not-structural'?'This action applies to parts and packages.':'The focused element is unavailable or excluded from engineering exploration.';}
 if(unavailable)message+=` ${unavailable} referenced element${unavailable===1?' is':'s are'} unavailable; missing context is not evidence that a link is absent.`;
 if(filtered)message+=` ${filtered} matching neighbor${filtered===1?' is':'s are'} excluded by the active exploration policy.`;
 if(isStructuralElement(data.root)&&shown)message+=' Package ownership is location context; part definition contents retain their explicit typing link.';
 if(mode==='verification'&&shown)message+=' These are modeled verification links, not executed results or acceptance verdicts.';
 return {status,message,shown,total,unavailable,filtered};
}
/** Contextual actions count unique available neighbors, not parallel edges.
 * A disabled action can still disclose unavailable or policy-filtered references.
 */
export function requirementActions(graph,focus){
 const prepared=prepare(graph);
 return Object.entries(modes).filter(([mode])=>!structuralModes.has(mode)).map(([mode,definition])=>{
  const data=projection(graph,focus,mode,{},prepared),count=data.candidates.size;
  return {mode,label:definition.label,count,total:count+data.unavailable.size+data.filtered.size,unavailable:data.unavailable.size,filtered:data.filtered.size,enabled:count>0,summary:summaryFor(data,mode,count,count)};
 });
}
/** Bounded active context. The budget includes focus, required typing bridges
 * and targets. Stable independent pages cannot accumulate unbounded context.
 * Only one engineering/structural hop beyond focus or a direct typing bridge is
 * selected. Native source/target direction, IDs and relationship kinds survive.
 */
export function traceContext(graph,options={}){
 const {focus,mode='context',budget=7,page=0}=options;
 if(!Number.isInteger(budget)||budget<1)throw new Error('Invalid exploration budget');
 if(!Number.isInteger(page)||page<0)throw new Error('Invalid exploration page');
 const effectiveBudget=Math.max(3,Math.min(24,budget)),data=projection(graph,focus,mode,options);
 const priorities=new Map(['derive','derivation','refine','refinement','satisfy','satisfaction','verify','verification','allocate','allocation','composition','connection','reference','flow','dependency'].map((kind,index)=>[kind,index]));
 const priority=id=>Math.min(...data.candidates.get(id).map(({edge,anchor,bridge})=>{
  if(isStructuralElement(data.root)&&['context','contents','container'].includes(mode)){
   if(structuralEdges.has(edge.kind))return edge.target===anchor?0:bridge?3:2;
   if(['type','typing'].includes(edge.kind))return 1;
   if(['connection','flow','binding'].includes(edge.kind))return 4;
   return 10+(priorities.get(edge.kind)??99);
  }
  return mode==='context'?priorities.get(edge.kind)??99:0;
 }));
 const targets=[...data.candidates.keys()].sort((a,b)=>priority(a)-priority(b)||(isStructuralElement(data.root)?compare(data.elements.get(a)?.qualifiedName??data.elements.get(a)?.name??a,data.elements.get(b)?.qualifiedName??data.elements.get(b)?.name??b):0)||compare(a,b)),pages=[];
 let group=[],ids=new Set([focus]);
 for(const target of targets){
  const best=data.candidates.get(target)[0],addition=[target,...(best.bridge?[best.anchor]:[])];
  const cost=addition.filter(id=>!ids.has(id)).length;
  if(group.length&&ids.size+cost>effectiveBudget){pages.push(group);group=[];ids=new Set([focus]);}
  group.push(target);for(const id of addition)ids.add(id);
 }
 if(group.length)pages.push(group);
 const actualPage=Math.min(page,Math.max(0,pages.length-1)),shown=pages[actualPage]??[],wanted=new Set(data.rootReason?[]:[focus]),bridges=new Map();
 for(const target of shown){wanted.add(target);const best=data.candidates.get(target)[0];if(best.bridge){wanted.add(best.anchor);bridges.set(edgeKey(best.bridge),best.bridge);}}
 const relationships=new Map(bridges),omissions=[...data.omissions];
 for(const [target,links]of data.candidates){
  if(!wanted.has(target)){for(const {edge,anchor}of links)omissions.push({relationshipId:edge.id??null,target,anchor,reason:'budget'});continue;}
  for(const {edge,anchor,bridge}of links)if(wanted.has(anchor)){
   relationships.set(edgeKey(edge),edge);
   if(bridge)relationships.set(edgeKey(bridge),bridge);
  }
 }
 // Native peer connections may join the selected contents; this neither
 // expands the page nor synthesizes connectivity from common ownership.
 if(isStructuralElement(data.root)&&['context','contents'].includes(mode))for(const edge of data.edges)if(['connection','flow','binding'].includes(edge.kind)&&wanted.has(edge.source)&&wanted.has(edge.target)&&(!options.relationshipKinds||options.relationshipKinds.includes(edge.kind)))relationships.set(edgeKey(edge),edge);
 return clone({elements:[...wanted].map(id=>data.elements.get(id)),relationships:[...relationships.values()].sort((a,b)=>compare(edgeKey(a),edgeKey(b))),omissions,
  summary:summaryFor(data,mode,shown.length,targets.length),mode,page:actualPage,total:targets.length,pages:pages.length,shown:shown.length,targets:shown,typingBridges:[...bridges.values()].map(edge=>edge.id),budget:effectiveBudget});
}

/** Structural actions share exactly the same bounded projection as Focus. */
export function structuralActions(graph,focus){
 const prepared=prepare(graph);
 return [...structuralModes].map(mode=>{const data=projection(graph,focus,mode,{},prepared),count=data.candidates.size;return {mode,label:modes[mode].label,count,enabled:count>0,summary:summaryFor(data,mode,count,count)};});
}
