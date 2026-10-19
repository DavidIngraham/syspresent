/** Display policy for bounded, translucent context around an authoritative native view.
 * This is not another SysML query or diagram: graph edges retain their native kinds,
 * semantic endpoints and direction, and the authored active view is never changed.
 */
import {ENGINEERING_RELATIONSHIPS} from './core/index.mjs';
import {graphView} from './graph.mjs';
import {edgeLayoutHints} from './notation.mjs';

const allowedKinds=new Set(ENGINEERING_RELATIONSHIPS);
const forbiddenKinds=new Set(['type','typing','specialization','owner','owningMembership','ownedMembership','documentation','membership','succession','transition']);
const engineeringElement=/^(Requirement|Part|Action|State|VerificationCase|AnalysisCase|UseCase|Case|Constraint|Calculation|Interface|Connection|Port|Attribute|Item|Occurrence|Allocation)(Definition|Usage)$/;
const compare=(a,b)=>a<b?-1:a>b?1:0;
const edgeKey=edge=>JSON.stringify([edge.id,edge.source,edge.target,edge.kind]);
// Rank declared engineering traces before a generic dependency, using only the
// authoritative relationship kind, never prose, names or a project-specific rule.
const kindOrder=new Map(['derive','derivation','refine','refinement','satisfy','satisfaction','verify','verification','allocate','allocation','composition','connection','reference','flow','item-flow','control-flow','causation','dependency'].map((kind,index)=>[kind,index]));

/** One-hop neighboring engineering elements, separate from active layout/fit bounds.
 * budget limits context nodes (not active nodes). Selection is stable and independent
 * of source serialization order. scopeIds is optional; it does not redefine the
 * active native view. All filtered, unavailable and truncated neighbors are explicit.
 */
export function surroundingContext(graph,activeView,options={}) {
 const {budget=6}=options;
 if(!Number.isInteger(budget)||budget<0)throw new Error('Invalid surrounding context budget');
 const elements=new Map((graph.elements??[]).map(element=>[element.id,element]));
 const activeNodes=activeView.nodes??[],activeEdges=activeView.edges??[];
 const activeIds=[...new Set(activeNodes.map(node=>node.semanticId).filter(Boolean))].sort(compare);
 const active=new Set(activeIds),scope=options.scopeIds?new Set(options.scopeIds):null;
 const kinds=new Set((options.relationshipKinds??[...allowedKinds]).filter(kind=>allowedKinds.has(kind)&&!forbiddenKinds.has(kind)));
 const representations=new Map();
 for(const node of [...activeNodes].sort((a,b)=>compare(a.id,b.id)))if(node.semanticId&&!representations.has(node.semanticId))representations.set(node.semanticId,node.id);
 const edges=[...new Map((graph.relationships??[]).map(edge=>[edgeKey(edge),edge])).values()].sort((a,b)=>compare(edgeKey(a),edgeKey(b)));
 const omissions=[],seenOmissions=new Set();
 const omit=(edge,target,reason,anchor)=>{
  const key=JSON.stringify([edgeKey(edge),target,reason]);
  if(seenOmissions.has(key))return;
  seenOmissions.add(key);omissions.push({relationshipId:edge.id??null,target,anchor,reason});
 };
 const elementReason=id=>{
  const element=elements.get(id);
  if(!element)return 'unavailable';
  if(scope&&!scope.has(id))return 'outside-scope';
  if(element.layer==='metamodel'||element.metamodel===true)return 'metamodel-boundary';
  if(!engineeringElement.test(element.kind??''))return 'element-policy';
  return null;
 };
 const candidates=new Map();
 for(const edge of edges){
  const sourceActive=active.has(edge.source),targetActive=active.has(edge.target);
  if(sourceActive===targetActive)continue;
  const target=sourceActive?edge.target:edge.source,anchor=sourceActive?edge.source:edge.target;
  const reason=!kinds.has(edge.kind)?'relationship-policy':elementReason(target);
  if(reason){omit(edge,target,reason,anchor);continue;}
  if(!candidates.has(target))candidates.set(target,[]);
  candidates.get(target).push(edge);
 }
 // Round-robin by active anchor avoids letting one high-degree element monopolize
 // a small peripheral context budget. Shared neighbors consume only one slot.
 const priority=id=>Math.min(...candidates.get(id).map(edge=>kindOrder.get(edge.kind)??99));
 const chosen=new Set(),pending=new Map(activeIds.map(id=>[id,[...candidates.keys()].filter(target=>candidates.get(target).some(edge=>edge.source===id||edge.target===id)).sort((a,b)=>priority(a)-priority(b)||compare(a,b))]));
 while(chosen.size<budget){
  let progress=false;
  for(const id of activeIds){
   const queue=pending.get(id);
   while(queue.length&&chosen.has(queue[0]))queue.shift();
   if(queue.length&&chosen.size<budget){chosen.add(queue.shift());progress=true;}
  }
  if(!progress)break;
 }
 const relationships=[];
 for(const [target,links]of candidates){
  if(chosen.has(target))relationships.push(...links);
  else for(const edge of links)omit(edge,target,'budget',active.has(edge.source)?edge.source:edge.target);
 }
 // Keep an explicit connection between two already chosen neighbors too. This
 // does not select more nodes or make a second-hop context expansion.
 for(const edge of edges)if(chosen.has(edge.source)&&chosen.has(edge.target)){
  if(kinds.has(edge.kind))relationships.push(edge);
  else omit(edge,edge.target,'relationship-policy',edge.source);
 }
 // A context node is a boundary, not a recursive expansion. Disclose known links
 // beyond it, including a second-hop element even if the initial budget was ample.
 for(const edge of edges){
  const sourceChosen=chosen.has(edge.source),targetChosen=chosen.has(edge.target);
  if(sourceChosen===targetChosen)continue;
  const target=sourceChosen?edge.target:edge.source,anchor=sourceChosen?edge.source:edge.target;
  if(active.has(target))continue;
  const reason=!kinds.has(edge.kind)?'relationship-policy':elementReason(target)??'depth';
  omit(edge,target,reason,anchor);
 }
 const contextElements=[...chosen].map(id=>elements.get(id));
 const projected=graphView(graph,{elements:contextElements,relationships:[]},'Surrounding engineering context');
 const contextIDs=new Map(contextElements.map(element=>[element.id,`context:${activeView.id??'view'}:${element.id}`]));
 const endpoint=id=>representations.get(id)??contextIDs.get(id);
 const byReason={};for(const omission of omissions)byReason[omission.reason]=(byReason[omission.reason]??0)+1;
 const boundary={omitted:omissions.length,byReason,budget,depth:1,shown:contextElements.length};
 return {
  activeView,activeIds,activeNodes,activeEdges,elements:contextElements,relationships,omissions,boundary,
  view:{...projected,id:`context:${activeView.id??'view'}`,kind:'general',context:true,fit:false,boundary,
   nodes:projected.nodes.map(node=>({...node,id:contextIDs.get(node.semanticId),detail:'',type:'',parentId:null,context:true,fit:false,notation:'general'})),
   edges:relationships.map(edge=>({...edge,id:`context:${edge.id??edgeKey(edge)}`,semanticSource:edge.source,semanticTarget:edge.target,source:endpoint(edge.source),target:endpoint(edge.target),context:true,fit:false,notation:'general'}))}
 };
}

const overlap=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const center=rect=>({x:rect.x+rect.width/2,y:rect.y+rect.height/2});
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));

/** Reading order is a presentation policy; native relationship direction is unchanged.
 * Derivation, satisfaction and verification are decisions grounded in their target.
 */
export function decisionOrder(edge) {
 const {rank}=edgeLayoutHints(edge,{viewKind:'general'});
 if(rank==='target-above-source')return {above:edge.target,below:edge.source};
 if(rank==='source-above-target')return {above:edge.source,below:edge.target};
 return null;
}


/** Place decorative context only; active geometry and its camera bounds stay untouched.
 * All inputs use the same coordinate system. Cards fit entirely inside area. When
 * no card fits, its real connection ends at an explicit small boundary marker.
 * Return cards and boundaryMarkers separately: markers are not ordinary model cards.
 */
export function positionSurrounding(context,activePositionedNodes,area,options={}) {
 const {width=108,height=52,gap=12,obstacles=[]}=options;
 if(![area?.x,area?.y,area?.width,area?.height,width,height,gap].every(Number.isFinite)||area.width<=0||area.height<=0||width<=0||height<=0||gap<0)throw new Error('Invalid surrounding context geometry');
 const active=activePositionedNodes??[],known=new Map(active.map(node=>[node.id,node]));
 const left=area.x,top=area.y,right=left+area.width,bottom=top+area.height;
 const hull=active.length?{x:Math.min(...active.map(n=>n.x)),y:Math.min(...active.map(n=>n.y)),width:Math.max(...active.map(n=>n.x+n.width))-Math.min(...active.map(n=>n.x)),height:Math.max(...active.map(n=>n.y+n.height))-Math.min(...active.map(n=>n.y))}:area;
 const nodes=[],boundaryMarkers=[],omissions=[...context.omissions],occupied=[...active,...obstacles];
 const anchorFor=node=>{
  const links=context.view.edges.filter(edge=>edge.source===node.id||edge.target===node.id);
  const anchors=links.map(edge=>known.get(edge.source===node.id?edge.target:edge.source)).filter(Boolean);
  if(!anchors.length)return center(hull);
  return {x:anchors.reduce((sum,n)=>sum+center(n).x,0)/anchors.length,y:anchors.reduce((sum,n)=>sum+center(n).y,0)/anchors.length};
 };
 for(const [index,node]of context.view.nodes.entries()){
  const anchor=anchorFor(node),candidatePoints=[];
  const xs=[left+gap,right-width-gap,clamp(anchor.x-width/2,left+gap,right-width-gap)],ys=[top+gap,bottom-height-gap,clamp(anchor.y-height/2,top+gap,bottom-height-gap)];
  for(const activeNode of active){xs.push(activeNode.x-width-gap,activeNode.x+activeNode.width+gap);ys.push(activeNode.y-height-gap,activeNode.y+activeNode.height+gap);}
  for(const x of xs)for(const y of ys){
   const candidate={x,y,width,height};
   if(x<left||y<top||x+width>right||y+height>bottom)continue;
   if(occupied.some(other=>overlap(candidate,other,gap)))continue;
   // A faint contextual card still participates in the same decision chain as
   // the active diagram. Do not place a child above its grounding requirement.
   const ordered=context.view.edges.filter(edge=>edge.source===node.id||edge.target===node.id).every(edge=>{
    const order=decisionOrder(edge);if(!order)return true;
    const other=known.get(edge.source===node.id?edge.target:edge.source);if(!other)return true;
    return order.above===node.id?candidate.y+candidate.height+gap<=other.y:other.y+other.height+gap<=candidate.y;
   });
   if(!ordered)continue;
   candidatePoints.push(candidate);
  }
  // Prefer the outside of the active hull, then the shortest connection. Interior
  // holes may be used if they are the only readable space left on a narrow canvas.
  candidatePoints.sort((a,b)=>Number(overlap(a,hull))-Number(overlap(b,hull))||Math.hypot(center(a).x-anchor.x,center(a).y-anchor.y)-Math.hypot(center(b).x-anchor.x,center(b).y-anchor.y)||a.y-b.y||a.x-b.x);
  if(candidatePoints.length){const placed={...node,...candidatePoints[0]};nodes.push(placed);occupied.push(placed);known.set(placed.id,placed);continue;}
  const points=[{x:left,y:clamp(anchor.y,top,bottom)},{x:right,y:clamp(anchor.y,top,bottom)},{x:clamp(anchor.x,left,right),y:top},{x:clamp(anchor.x,left,right),y:bottom}];
  points.sort((a,b)=>Math.hypot(a.x-anchor.x,a.y-anchor.y)-Math.hypot(b.x-anchor.x,b.y-anchor.y)||a.y-b.y||a.x-b.x);
  const point=points[index%points.length];
  boundaryMarkers.push({...node,...point,width:0,height:0,kind:'context-boundary',boundary:true,interactive:false});
  const link=context.view.edges.find(edge=>edge.source===node.id||edge.target===node.id);
  omissions.push({target:node.semanticId,anchor:link?(link.semanticSource===node.semanticId?link.semanticTarget:link.semanticSource):null,reason:'context-space',relationshipId:link?.id??null});
 }
 const byReason={};for(const omission of omissions)byReason[omission.reason]=(byReason[omission.reason]??0)+1;
 return {...context.view,nodes,edges:context.view.edges,boundaryMarkers,omissions,boundary:{...context.boundary,omitted:omissions.length,byReason,cards:nodes.length,markers:boundaryMarkers.length}};
}
