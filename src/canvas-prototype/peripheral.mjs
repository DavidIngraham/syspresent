/** Peripheral geometry never changes the active camera or native semantic graph. */
import {positionSurrounding,decisionOrder} from './context.mjs';

const overlaps=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const inside=(r,a)=>r.x>=a.x&&r.y>=a.y&&r.x+r.width<=a.x+a.width&&r.y+r.height<=a.y+a.height;
function segmentCrosses(a,b,r,pad=2){
 const box={x:r.x-pad,y:r.y-pad,width:r.width+2*pad,height:r.height+2*pad};
 return a.x===b.x?a.x>box.x&&a.x<box.x+box.width&&Math.max(a.y,b.y)>box.y&&Math.min(a.y,b.y)<box.y+box.height:
  a.y>box.y&&a.y<box.y+box.height&&Math.max(a.x,b.x)>box.x&&Math.min(a.x,b.x)<box.x+box.width;
}
const directions={NORTH:{x:0,y:-1},SOUTH:{x:0,y:1},EAST:{x:1,y:0},WEST:{x:-1,y:0}};
function attachment(node,side,fraction){const d=directions[side];return d.x?{x:node.x+(d.x>0?node.width:0),y:node.y+node.height*fraction}:{x:node.x+node.width*fraction,y:node.y+(d.y>0?node.height:0)};}
function candidates(edge,anchor,area,measureLabel){
 const order=decisionOrder(edge),sides=order?[order.above===anchor.id?'SOUTH':'NORTH']:['NORTH','SOUTH','EAST','WEST'];
 const label=edge.label||edge.kind,size=measureLabel?.(label)??{width:String(label).length*6.5+4,height:14},out=[];
 for(const side of sides)for(const fraction of [.5,.25,.75,.125,.875])for(const length of [28,36,20]){
  const d=directions[side],start=attachment(anchor,side,fraction),end={x:start.x+d.x*length,y:start.y+d.y*length};
  // The chevron is an explicit clipping indication, not a replacement model node.
  const markerBox={x:end.x-5,y:end.y-5,width:10,height:10};if(!inside(markerBox,area))continue;
  const middle={x:(start.x+end.x)/2,y:(start.y+end.y)/2};
  const labels=d.y?[{x:middle.x+7,y:middle.y-size.height/2,...size},{x:middle.x-size.width-7,y:middle.y-size.height/2,...size}]:[{x:middle.x-size.width/2,y:middle.y-size.height-5,...size},{x:middle.x-size.width/2,y:middle.y+5,...size}];
  for(const labelBox of labels)if(inside(labelBox,area))out.push({start,end,side,markerBox,labelBox,label});
 }
 return out;
}

/** Prepare full contextual cards and short, explicitly labeled continuations.
 * Active nodes are authoritative positioned drawings. Route and label obstacles
 * are separate: they must never be used as fake engineering anchors. Full-card
 * edges still need collision-aware routing by the caller; stubEdges are final.
 * A shared missing neighbor receives a distinct continuation representation for
 * each relationship, avoiding false shared junctions and anonymous long wires.
 */
export function preparePeripheral(context,activeNodes,area,options={}){
 const {obstacles=[],measureLabel}=options;
 const placed=positionSurrounding(context,activeNodes,area,options),active=new Map(activeNodes.map(n=>[n.id,n]));
 const cards=new Map(placed.nodes.map(n=>[n.id,n])),missing=new Map(context.view.nodes.filter(n=>!cards.has(n.id)).map(n=>[n.id,n]));
 const nodes=placed.nodes,boundaryMarkers=[],edges=[],stubEdges=[],omissions=[...placed.omissions];
 const occupied=[...activeNodes,...nodes,...obstacles],reserved=[],paths=[];
 for(const edge of context.view.edges){
  const sourceKnown=active.has(edge.source)||cards.has(edge.source),targetKnown=active.has(edge.target)||cards.has(edge.target);
  if(sourceKnown&&targetKnown){edges.push(edge);continue;}
  const anchor=active.get(edge.source)??active.get(edge.target),neighbor=missing.get(edge.source)??missing.get(edge.target);
  if(!anchor||!neighbor){omissions.push({relationshipId:edge.semanticId??edge.id,target:neighbor?.semanticId??edge.semanticTarget,reason:'context-link-space'});continue;}
  const choice=candidates(edge,anchor,area,measureLabel).find(candidate=>{
   if(occupied.some(n=>overlaps(candidate.markerBox,n,3)||overlaps(candidate.labelBox,n,3)))return false;
   if(reserved.some(r=>overlaps(candidate.markerBox,r,4)||overlaps(candidate.labelBox,r,4)))return false;
   if(occupied.some(n=>n.id!==anchor.id&&segmentCrosses(candidate.start,candidate.end,n)))return false;
   if(reserved.some(r=>segmentCrosses(candidate.start,candidate.end,r)))return false;
   if(paths.some(path=>segmentCrosses(candidate.start,candidate.end,path,4)||segmentCrosses(path.start,path.end,candidate.labelBox,3)||segmentCrosses(path.start,path.end,candidate.markerBox,3)))return false;
   return true;
  });
  if(!choice){omissions.push({relationshipId:edge.semanticId??edge.id,target:neighbor.semanticId,anchor:anchor.semanticId,reason:'context-continuation-space'});continue;}
  const id=`continuation:${edge.id}:${anchor.id}:${neighbor.id}`,sourceIsAnchor=edge.source===anchor.id;
  const marker={...neighbor,id,x:choice.end.x,y:choice.end.y,width:0,height:0,kind:'context-boundary',boundary:true,interactive:false,continuationDirection:choice.side,relationshipId:edge.semanticId??edge.id};
  boundaryMarkers.push(marker);reserved.push(choice.markerBox,choice.labelBox);
  paths.push({start:choice.start,end:choice.end,x:Math.min(choice.start.x,choice.end.x),y:Math.min(choice.start.y,choice.end.y),width:Math.abs(choice.start.x-choice.end.x),height:Math.abs(choice.start.y-choice.end.y)});
  const points=sourceIsAnchor?[choice.start,choice.end]:[choice.end,choice.start];
  stubEdges.push({...edge,source:sourceIsAnchor?anchor.id:id,target:sourceIsAnchor?id:anchor.id,points,d:points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '),label:choice.label,labelBox:choice.labelBox,x:choice.labelBox.x,y:choice.labelBox.y+choice.labelBox.height*.78,continuation:true,routingBlocked:false});
 }
 const byReason={};for(const omission of omissions)byReason[omission.reason]=(byReason[omission.reason]??0)+1;
 return {...placed,nodes,edges,stubEdges,boundaryMarkers,omissions,boundary:{...placed.boundary,cards:nodes.length,markers:boundaryMarkers.length,omitted:omissions.length,byReason}};
}
