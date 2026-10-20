/** Prepared one-hop world geometry. Camera changes never rerun this layout. */
import {routeIsClear,routeConnectsEndpoints} from './geometry.mjs';
import {decisionOrder} from './context.mjs';
import {routePeripheralEdges,peripheralRoutingMetrics,peripheralRouteScore,routeConflicts} from './peripheral-routing.mjs';

const compare=(a,b)=>String(a)<String(b)?-1:String(a)>String(b)?1:0;
const overlap=(a,b,g=0)=>a.x<b.x+b.width+g&&a.x+a.width+g>b.x&&a.y<b.y+b.height+g&&a.y+a.height+g>b.y;
const center=n=>({x:n.x+n.width/2,y:n.y+n.height/2});
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
const bounds=rects=>{const x=Math.min(...rects.map(r=>r.x)),y=Math.min(...rects.map(r=>r.y));return {x,y,width:Math.max(...rects.map(r=>r.x+r.width))-x,height:Math.max(...rects.map(r=>r.y+r.height))-y};};
const pathBoxes=edges=>edges.flatMap(e=>(e.points??[]).slice(1).map((b,i)=>{const a=e.points[i];return {x:Math.min(a.x,b.x)-5,y:Math.min(a.y,b.y)-5,width:Math.abs(a.x-b.x)+10,height:Math.abs(a.y-b.y)+10};}));

/** Every selected neighbor is a genuine tile, including outside the initial frame.
 * Native source/target and active geometry are preserved. Geometry cannot create
 * a semantic connection; unavailable routes are disclosed, never shortened into
 * dangling arrows. Ownership and typing keep their own native notation.
 */
export function prepareNeighborhood(context,activeNodes,area,options={}){
 const {width=156,height=70,gap=72,activeEdges=[],labelObstacles=[],obstacles=[],measureLabel}=options;
 if(![area?.x,area?.y,area?.width,area?.height,width,height,gap].every(Number.isFinite)||area.width<=0||area.height<=0||width<=0||height<=0||gap<0)throw new Error('Invalid neighborhood geometry');
 const active=activeNodes??[],known=new Map(active.map(n=>[n.id,n])),drafts=[...context.view.nodes].sort((a,b)=>compare(a.name,b.name)||compare(a.id,b.id));
 const byID=new Map(drafts.map(n=>[n.id,{...n,width:Number.isFinite(n.width)&&n.width>0?n.width:width,height:Number.isFinite(n.height)&&n.height>0?n.height:height}])),edges=context.view.edges??[],orders=edges.map(decisionOrder).filter(Boolean),hull=active.length?bounds(active):area;
 const blocked=[...active,...obstacles,...labelObstacles,...pathBoxes(activeEdges)],nodes=[],notices=[];
 // Propagate pinned active vertical bounds over explicit ranked native edges.
 // This includes neighbor-to-neighbor links without selecting any further node.
 const limits=new Map(drafts.map(n=>[n.id,{min:-Infinity,max:Infinity}]));
 const lower=id=>known.has(id)?known.get(id).y:limits.get(id)?.min??-Infinity;
 const upper=id=>known.has(id)?known.get(id).y:limits.get(id)?.max??Infinity;
 const nodeHeight=id=>known.get(id)?.height??byID.get(id)?.height??height;
 const rankGap=id=>Math.max(gap,orders.filter(o=>o.above===id||o.below===id).length*10+24);
 for(let i=0;i<drafts.length+1;i++){
  let changed=false;
  for(const {above,below}of orders){
   const lo=limits.get(below),hi=limits.get(above),nextMin=lower(above)+nodeHeight(above)+rankGap(above),nextMax=upper(below)-nodeHeight(above)-rankGap(above);
   if(lo&&nextMin>lo.min){lo.min=nextMin;changed=true;}
   if(hi&&nextMax<hi.max){hi.max=nextMax;changed=true;}
  }
  if(!changed)break;
 }
 // Topological ordering makes already positioned general nodes constrain their
 // descendants. Conflicting/cyclic native ranks are explicitly disclosed.
 const remaining=new Set(drafts.map(n=>n.id)),ordered=[];
 while(remaining.size){
  const ready=[...remaining].filter(id=>!orders.some(o=>o.below===id&&remaining.has(o.above))).sort(compare);
  if(!ready.length){notices.push({reason:'context-rank-conflict',targets:[...remaining]});ordered.push(...[...remaining].sort(compare));break;}
  for(const id of ready){ordered.push(id);remaining.delete(id);}
 }
 for(const id of ordered){
  const node=byID.get(id),width=node.width,height=node.height,links=edges.filter(e=>e.source===id||e.target===id),linked=links.map(e=>known.get(e.source===id?e.target:e.source)).filter(Boolean),activeAnchors=linked.filter(n=>active.some(a=>a.id===n.id)),anchors=activeAnchors.length?activeAnchors:linked,anchor=anchors.length?{x:anchors.reduce((s,n)=>s+center(n).x,0)/anchors.length,y:anchors.reduce((s,n)=>s+center(n).y,0)/anchors.length}:center(hull);
  let {min,max}=limits.get(id);
  for(const {above,below}of orders){if(below===id&&known.has(above))min=Math.max(min,known.get(above).y+known.get(above).height+rankGap(above));if(above===id&&known.has(below))max=Math.min(max,known.get(below).y-height-rankGap(id));}
  if(min>max){notices.push({reason:'context-rank-conflict',target:node.semanticId});min=-Infinity;max=Infinity;}
  const idealY=clamp(anchor.y-height/2,min,max),idealX=anchor.x-width/2,dx=width+gap,dy=height+gap;
  let placed=null;
  // Search increasingly distant rings; world space is deliberately unbounded.
  // A horizontal lane always remains available even for a tightly pinned rank.
  for(let ring=0;ring<drafts.length+blocked.length+8&&!placed;ring++){
   const candidates=[];
   const ranked=orders.some(o=>o.above===id||o.below===id);
   for(let row=ranked?0:-ring;row<=(ranked?0:ring);row++)for(let col=-ring;col<=ring;col++){
    if(Math.max(Math.abs(row),Math.abs(col))!==ring)continue;
    for(const offset of [0,dx/2]){
     const candidate={x:idealX+col*dx+offset,y:clamp(idealY+row*dy,min,max),width,height};
     if(blocked.some(other=>overlap(candidate,other,gap/2)))continue;
     const stemBlocked=orders.some(order=>{
      const other=active.find(n=>n.id===(order.above===id?order.below:order.below===id?order.above:null));if(!other)return false;
      const x=candidate.x+candidate.width/2,top=order.below===id?other.y+other.height:candidate.y+height,bottom=order.below===id?candidate.y:other.y;
      return nodes.some(n=>x>n.x-6&&x<n.x+n.width+6&&n.y<bottom&&n.y+n.height>top);
     });
     if(stemBlocked)continue;
     candidates.push(candidate);
    }
   }
   candidates.sort((a,b)=>Math.abs(center(a).x-anchor.x)+Math.abs(center(a).y-anchor.y)-Math.abs(center(b).x-anchor.x)-Math.abs(center(b).y-anchor.y)||a.y-b.y||a.x-b.x);
   if(candidates.length)placed={...node,...candidates[0],context:true,fit:false,parentId:null};
  }
  if(!placed)throw new Error('Unable to place neighborhood tile in world space');
  nodes.push(placed);blocked.push(placed);known.set(id,placed);
 }
 const allNodes=[...active,...nodes],extent=bounds([...allNodes,...obstacles,...labelObstacles,area]),padding=Math.max(60,gap*2),worldBounds={x:extent.x-padding,y:extent.y-padding,width:extent.width+padding*2,height:extent.height+padding*2};
 // Assign distinct presentation attachments around actual tile perimeters.
 // These are disposable geometry points, not model ports or graph identities.
 // The shared router otherwise offers just three fractions, which creates false
 // shared buses for a dense one-hop neighborhood.
 const attachments=new Map(),sideFor=(a,b)=>{
  const order=edges.find(e=>e.source===a.id&&e.target===b.id||e.target===a.id&&e.source===b.id),rank=order&&decisionOrder(order);
  if(rank)return rank.above===a.id?'SOUTH':'NORTH';
  const ac=center(a),bc=center(b);return Math.abs(bc.y-ac.y)>Math.abs(bc.x-ac.x)*.65?(bc.y>=ac.y?'SOUTH':'NORTH'):(bc.x>=ac.x?'EAST':'WEST');
 };
 for(const node of allNodes){
  const incident=edges.filter(e=>e.source===node.id||e.target===node.id);
  for(const side of ['NORTH','SOUTH','EAST','WEST']){
   const neighbors=incident.map(e=>({edge:e,other:known.get(e.source===node.id?e.target:e.source)})).filter(({other})=>other&&sideFor(node,other)===side);
   neighbors.sort((a,b)=>{const ac=center(a.other),bc=center(b.other);return (side==='NORTH'||side==='SOUTH'?ac.x-bc.x:ac.y-bc.y)||compare(a.edge.id,b.edge.id);});
   const byDistance=[...neighbors].sort((a,b)=>Math.abs(center(b.other).x-center(node).x)-Math.abs(center(a.other).x-center(node).x)||compare(a.edge.id,b.edge.id));
   neighbors.forEach(({edge},i)=>{const fraction=(i+1)/(neighbors.length+1),point=side==='NORTH'||side==='SOUTH'?{x:node.x+node.width*fraction,y:node.y+(side==='SOUTH'?node.height:0)}:{x:node.x+(side==='EAST'?node.width:0),y:node.y+node.height*fraction};attachments.set(`${edge.id}:${node.id}`,{...point,side,lane:(byDistance.findIndex(n=>n.edge.id===edge.id)+1)/(neighbors.length+1)});});
  }
 }
 let routed=[];const fanCandidates=new Map();
 const sorted=[...edges].sort((a,b)=>compare(a.id,b.id));
 for(const edge of sorted){
  const endpoints=new Set([edge.source,edge.target]),proxyNodes=allNodes.flatMap(node=>{
   if(!endpoints.has(node.id))return [node];
   const point=attachments.get(`${edge.id}:${node.id}`);if(!point)return [node];
   // Keep the endpoint interior protected, while routing from the real border.
   const interior={...node,id:`interior:${node.id}`,x:node.x+6,y:node.y+6,width:Math.max(0,node.width-12),height:Math.max(0,node.height-12),parentId:null};
   return [interior,{...node,...point,width:.01,height:.01,kind:'port',portSide:point.side,parentId:null}];
  });
  const routingOptions={activeEdges:[...activeEdges,...routed.filter(e=>!e.routingBlocked)],obstacles:[...obstacles,...labelObstacles],measureLabel,candidateBudget:4,reverse:false,visibilitySearches:0};
  const routingEdge={...edge,label:''};
  let result=routePeripheralEdges([routingEdge],proxyNodes,worldBounds,routingOptions).edges[0];
  const order=decisionOrder(edge);
  if(order){
   const above=known.get(order.above),below=known.get(order.below),top=attachments.get(`${edge.id}:${order.above}`),bottom=attachments.get(`${edge.id}:${order.below}`);
   if(above&&below&&top?.side==='SOUTH'&&bottom?.side==='NORTH'&&bottom.y-top.y>20){
    let laneMin=top.y+8,laneMax=bottom.y-8;
    for(const obstacle of [...obstacles,...labelObstacles,...activeEdges.flatMap(e=>e.labelBox?[e.labelBox]:[])]){
     if(top.x>obstacle.x-5&&top.x<obstacle.x+obstacle.width+5&&obstacle.y>=top.y+8&&obstacle.y<bottom.y)laneMax=Math.min(laneMax,obstacle.y-8);
     if(bottom.x>obstacle.x-5&&bottom.x<obstacle.x+obstacle.width+5&&obstacle.y+obstacle.height>top.y&&obstacle.y+obstacle.height<=bottom.y-8)laneMin=Math.max(laneMin,obstacle.y+obstacle.height+8);
    }
    const lane=laneMin+(laneMax-laneMin)*top.lane,path=[{x:top.x,y:top.y},{x:top.x,y:lane},{x:bottom.x,y:lane},{x:bottom.x,y:bottom.y}],points=edge.source===order.above?path:[...path].reverse(),candidate={...edge,points,routingBlocked:false,d:points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')};
    const avoids=laneMin<=laneMax&&![...obstacles,...labelObstacles,...activeEdges.flatMap(e=>e.labelBox?[e.labelBox]:[])].some(r=>pathBoxes([candidate]).some(box=>overlap(box,r)));
    if(avoids&&routeIsClear(points,edge,allNodes,{orthogonalOnly:true})){fanCandidates.set(edge.id,candidate);}
    if(avoids&&routeIsClear(points,edge,allNodes,{orthogonalOnly:true})&&peripheralRouteScore(peripheralRoutingMetrics([candidate],routingOptions.activeEdges))<peripheralRouteScore(peripheralRoutingMetrics([result],routingOptions.activeEdges)))result=candidate;
   }
  }
  if(result.routingBlocked)result=routePeripheralEdges([routingEdge],proxyNodes,worldBounds,{...routingOptions,candidateBudget:8,visibilitySearches:1}).edges[0];
  result={...result,label:edge.label};
  if(!result.routingBlocked&&(!routeIsClear(result.points,edge,allNodes,{orthogonalOnly:true})||!routeConnectsEndpoints(result.points,edge,allNodes)))result={...result,points:[],d:'',routingBlocked:true};
  if(result.routingBlocked){
   const fallback=routePeripheralEdges([routingEdge],allNodes,worldBounds,{...routingOptions,candidateBudget:16,visibilitySearches:2}).edges[0];
   if(!fallback.routingBlocked&&routeIsClear(fallback.points,edge,allNodes,{orthogonalOnly:true})&&routeConnectsEndpoints(fallback.points,edge,allNodes))result={...fallback,label:edge.label};
  }
  routed.push(result);
 }
 const allFans=routed.map(edge=>fanCandidates.get(edge.id)??edge);
 if(peripheralRouteScore(peripheralRoutingMetrics(allFans,activeEdges))<peripheralRouteScore(peripheralRoutingMetrics(routed,activeEdges)))routed=allFans;
 // Separate accidental collinear buses after the complete graph is known.
 // Shifting orthogonal lanes keeps endpoints on their actual glyph borders.
 // Actual cards/protected content remain hard obstacles. A short crossing is
 // preferable to pretending that distinct native relationships share a wire.
 const protectedRects=[...obstacles,...labelObstacles,...activeEdges.flatMap(e=>e.labelBox?[e.labelBox]:[])];
 const safe=edge=>routeConnectsEndpoints(edge.points,edge,allNodes)&&routeIsClear(edge.points,edge,allNodes,{orthogonalOnly:true})&&!pathBoxes([edge]).some(box=>protectedRects.some(r=>overlap(box,r)));
 // Crossings in the initial reading area cost more than crossings in the
 // offscreen neighborhood. Camera fit and active geometry remain immutable.
 const clipPoints=points=>{const paths=[];for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i];if(Math.abs(a.x-b.x)<.01){if(a.x<area.x||a.x>area.x+area.width)continue;const low=Math.max(Math.min(a.y,b.y),area.y),high=Math.min(Math.max(a.y,b.y),area.y+area.height);if(low<=high)paths.push([{x:a.x,y:low},{x:a.x,y:high}]);}else{if(a.y<area.y||a.y>area.y+area.height)continue;const low=Math.max(Math.min(a.x,b.x),area.x),high=Math.min(Math.max(a.x,b.x),area.x+area.width);if(low<=high)paths.push([{x:low,y:a.y},{x:high,y:a.y}]);}}return paths;};
 const visibleCrossings=(edge,other)=>clipPoints(edge.points).reduce((total,path)=>total+other.reduce((sum,e)=>sum+routeConflicts(path,e.points??[]).crossings,0),0);
 const laneScore=(metrics,edge,other)=>metrics.blocked*1e12+metrics.overlapLength*1e8+visibleCrossings(edge,other)*1e7+metrics.crossings*1e5+metrics.length+metrics.bends*12;
 for(let pass=0;pass<3;pass++){
  let improved=false;
  for(let index=0;index<routed.length;index++){
   const current=routed[index];if(current.routingBlocked)continue;
   const other=[...activeEdges,...routed.filter((_,i)=>i!==index)],metric=peripheralRoutingMetrics([current],other);
   if(metric.overlapLength<.05&&!metric.crossings)continue;
   let best=current,bestScore=laneScore(metric,current,other);
   for(let segment=0;segment<current.points.length-1;segment++)for(const offset of [-7,7,-14,14,-28,28,-49,49,-98,98,-196,196]){
    const points=current.points.map(p=>({...p})),a=points[segment],b=points[segment+1];
    if(Math.abs(a.x-b.x)<.01){a.x+=offset;b.x+=offset;}else if(Math.abs(a.y-b.y)<.01){a.y+=offset;b.y+=offset;}else continue;
    const candidate={...current,points};if(!safe(candidate))continue;
    const score=laneScore(peripheralRoutingMetrics([candidate],other),candidate,other);
    if(score<bestScore){best=candidate;bestScore=score;}
   }
   if(best!==current){routed[index]={...best,d:best.points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' ')};improved=true;}
  }
  if(!improved)break;
 }
 // Labels are placed only after all geometry settles, so an early label
 // cannot block another real neighbor's terminal or connection corridor.
 const reserved=[...obstacles,...labelObstacles,...activeEdges.flatMap(e=>e.labelBox?[e.labelBox]:[])],corridors=pathBoxes([...activeEdges,...routed]);
 for(const edge of routed){
  if(!edge.label||edge.routingBlocked)continue;
  const measured=measureLabel?.(edge.label)??{width:String(edge.label).length*6.5+4,height:14},size={width:Math.max(1,measured.width),height:Math.max(1,measured.height)},slots=[];
  for(let i=1;i<edge.points.length;i++){
   const a=edge.points[i-1],b=edge.points[i];
   for(const fraction of [.5,.25,.75]){const x=a.x+(b.x-a.x)*fraction,y=a.y+(b.y-a.y)*fraction;
    if(a.y===b.y)slots.push({x:x-size.width/2,y:y-size.height-8,...size},{x:x-size.width/2,y:y+8,...size});
    else slots.push({x:x+8,y:y-size.height/2,...size},{x:x-size.width-8,y:y-size.height/2,...size});
   }
  }
  const box=slots.find(box=>box.x>=worldBounds.x&&box.y>=worldBounds.y&&box.x+box.width<=worldBounds.x+worldBounds.width&&box.y+box.height<=worldBounds.y+worldBounds.height&&![...allNodes,...reserved,...corridors].some(r=>overlap(box,r,2)));
  if(box){edge.labelBox=box;edge.x=box.x;edge.y=box.y+box.height*.78;reserved.push(box);}else edge.labelOmitted=true;
 }
 const routing={edges:routed,metrics:peripheralRoutingMetrics(routed,activeEdges)};
 const omissions=[...(context.omissions??[])],routedEdges=routing.edges.filter(e=>!e.routingBlocked);
 for(const edge of routing.edges.filter(e=>e.routingBlocked))omissions.push({relationshipId:edge.semanticId??edge.id,source:edge.semanticSource,target:edge.semanticTarget,reason:'context-route-unavailable'});
 const omittedLabels=routedEdges.filter(e=>e.labelOmitted);
 if(omittedLabels.length)notices.push({reason:'context-label-space',relationships:omittedLabels.map(e=>e.semanticId??e.id),count:omittedLabels.length});
 if(routing.metrics.blocked)notices.push({reason:'context-route-unavailable',count:routing.metrics.blocked});
 if(routing.metrics.crossings||routing.metrics.overlapLength)notices.push({reason:'context-route-conflict',...routing.metrics});
 const byReason={};for(const omission of omissions)byReason[omission.reason]=(byReason[omission.reason]??0)+1;
 const finalBounds=bounds([worldBounds,...routedEdges.flatMap(e=>[...(e.points??[]).map(p=>({...p,width:0,height:0})),...(e.labelBox?[e.labelBox]:[])])]);
 return {...context.view,nodes,edges,routedEdges,stubEdges:[],boundaryMarkers:[],worldBounds:finalBounds,routingMetrics:routing.metrics,notices,omissions,boundary:{...context.boundary,cards:nodes.length,markers:0,omitted:omissions.length,byReason}};
}
