/** Routing policy for translucent context. Native edges and active geometry are immutable. */
import {routeOrthogonal,createRouteValidator} from './geometry.mjs';

const eps=.05;
const overlap=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const length=points=>points.slice(1).reduce((s,p,i)=>s+Math.abs(p.x-points[i].x)+Math.abs(p.y-points[i].y),0);
const simplify=points=>points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y).filter((p,i,a)=>!i||i===a.length-1||!(a[i-1].x===p.x&&p.x===a[i+1].x||a[i-1].y===p.y&&p.y===a[i+1].y));
const segments=points=>(points??[]).slice(1).map((p,i)=>[points[i],p]);
/** Distinct links may share a genuine endpoint, never an apparent bus or T-junction. */
export function routeConflicts(points,otherPoints){
 const crossingPoints=new Set();let overlapLength=0;
 for(const [a,b]of segments(points))for(const [c,d]of segments(otherPoints)){
  const av=Math.abs(a.x-b.x)<eps,cv=Math.abs(c.x-d.x)<eps;
  if(av===cv){
   if(Math.abs((av?a.x:a.y)-(cv?c.x:c.y))>eps)continue;
   const common=Math.min(Math.max(av?a.y:a.x,av?b.y:b.x),Math.max(cv?c.y:c.x,cv?d.y:d.x))-Math.max(Math.min(av?a.y:a.x,av?b.y:b.x),Math.min(cv?c.y:c.x,cv?d.y:d.x));
   if(common>eps)overlapLength+=common;
  }else{
   const v=av?[a,b]:[c,d],h=av?[c,d]:[a,b],x=v[0].x,y=h[0].y;
   if(x>=Math.min(h[0].x,h[1].x)-eps&&x<=Math.max(h[0].x,h[1].x)+eps&&y>=Math.min(v[0].y,v[1].y)-eps&&y<=Math.max(v[0].y,v[1].y)+eps){
    const isTerminal=(path)=>[path[0],path.at(-1)].some(p=>Math.abs(p.x-x)<eps&&Math.abs(p.y-y)<eps);
    if(!(isTerminal(points)&&isTerminal(otherPoints)))crossingPoints.add(`${Math.round(x/eps)},${Math.round(y/eps)}`);
   }
  }
 }
 return {crossings:crossingPoints.size,overlapLength};
}
export function peripheralRoutingMetrics(edges,activeEdges=[]){
 const metrics={crossings:0,overlapLength:0,length:0,bends:0,blocked:0};
 edges.forEach((edge,i)=>{
  if(!edge.points?.length){metrics.blocked++;return;}
  metrics.length+=length(edge.points);metrics.bends+=Math.max(0,edge.points.length-2);
  for(const other of [...activeEdges,...edges.slice(0,i)]){const c=routeConflicts(edge.points,other.points);metrics.crossings+=c.crossings;metrics.overlapLength+=c.overlapLength;}
 });return metrics;
}
/** A long direct link is not a detour; require both excess and stretch. */
export function isLongPeripheralDetour(points){
 if((points??[]).length<2)return false;
 const first=points[0],last=points.at(-1),direct=Math.abs(first.x-last.x)+Math.abs(first.y-last.y),total=length(points);
 return total-direct>120&&total>direct*3;
}
export const peripheralRouteScore=m=>m.blocked*1e8+m.crossings*1e6+m.overlapLength*1e4+m.length+m.bends*12;
const normals={NORTH:{x:0,y:-1},SOUTH:{x:0,y:1},EAST:{x:1,y:0},WEST:{x:-1,y:0}};
function terminals(a,b){
 if(!a.width&&!a.height)return [{point:{x:a.x,y:a.y},stub:{x:a.x,y:a.y}}];
 const dx=b.x+b.width/2-a.x-a.width/2,dy=b.y+b.height/2-a.y-a.height/2;
 const preferred=Math.abs(dy)>Math.abs(dx)*.5?(dy>0?'SOUTH':'NORTH'):(dx>0?'EAST':'WEST');
 const secondary=preferred==='NORTH'||preferred==='SOUTH'?(dx>=0?'EAST':'WEST'):(dy>=0?'SOUTH':'NORTH');
 const fixed=a.kind==='port'?(a.portSide??a.side):null;
 return (fixed&&normals[fixed]?[fixed]:[preferred,secondary]).flatMap(side=>(fixed?[.5]:side===preferred?[.5,.25,.75]:[.5]).map(f=>{const n=normals[side],point=n.x?{x:a.x+(n.x>0?a.width:0),y:a.y+a.height*f}:{x:a.x+a.width*f,y:a.y+(n.y>0?a.height:0)};return {point,stub:{x:point.x+n.x*8,y:point.y+n.y*8}};}));
}
function cardObstacles(edge,nodes){
 const byID=new Map(nodes.map(n=>[n.id,n])),ancestors=new Set(),leafPortOwners=new Set();
 for(const id of [edge.source,edge.target]){let n=byID.get(id);if(n?.kind==='port'&&n.parentId&&!byID.get(n.parentId)?.headerHeight)leafPortOwners.add(n.parentId);const seen=new Set();while(n?.parentId&&!seen.has(n.parentId)){seen.add(n.parentId);ancestors.add(n.parentId);n=byID.get(n.parentId);}}
 return nodes.filter(n=>n.width>0&&n.height>0).flatMap(n=>ancestors.has(n.id)&&!leafPortOwners.has(n.id)?n.headerHeight?[{...n,height:n.headerHeight}]:[]:[n]);
}
const segmentHitsRect=(a,b,r)=>Math.abs(a.x-b.x)<eps?a.x>r.x+eps&&a.x<r.x+r.width-eps&&Math.max(a.y,b.y)>r.y+eps&&Math.min(a.y,b.y)<r.y+r.height-eps:a.y>r.y+eps&&a.y<r.y+r.height-eps&&Math.max(a.x,b.x)>r.x+eps&&Math.min(a.x,b.x)<r.x+r.width-eps;
const segmentBox=(a,b,pad=1)=>({x:Math.min(a.x,b.x)-pad,y:Math.min(a.y,b.y)-pad,width:Math.abs(a.x-b.x)+pad*2,height:Math.abs(a.y-b.y)+pad*2});
const clearLabel=(box,nodes,labels,paths,area)=>box.x>=area.x&&box.y>=area.y&&box.x+box.width<=area.x+area.width&&box.y+box.height<=area.y+area.height&&!nodes.some(n=>n.width>0&&n.height>0&&overlap(box,n,3))&&!labels.some(r=>overlap(box,r,3))&&!paths.some(path=>segments(path).some(([a,b])=>overlap(box,segmentBox(a,b,1))));
function labelFor(edge,points,nodes,labels,paths,area,measureLabel){
 if(!edge.label)return null;
 const measured=measureLabel?.(edge.label)??{width:String(edge.label).length*6.5+4,height:14},size={width:Math.max(1,measured.width),height:Math.max(1,measured.height)},slots=[];
 for(const [a,b]of segments(points))for(const t of [.5,.25,.75]){
  const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
  if(Math.abs(a.y-b.y)<eps)slots.push({x:x-size.width/2,y:y-size.height-4,...size},{x:x-size.width/2,y:y+4,...size});
  else slots.push({x:x+5,y:y-size.height/2,...size},{x:x-size.width-5,y:y-size.height/2,...size});
 }
 return slots.find(box=>clearLabel(box,nodes,labels,paths,area,measureLabel))??null;
}
/** Active paths are soft barriers: crossings are costly, shared buses cost more.
 * Actual cards and every accepted measured label remain hard obstacles. */
export function routePeripheralEdges(edges,nodes,area,{activeEdges=[],obstacles=[],measureLabel,candidateBudget=16,reverse=true,visibilitySearches=2}={}){
 const byID=new Map(nodes.map(n=>[n.id,n])),activePaths=activeEdges.map(e=>e.points).filter(p=>p?.length),activeLabels=[...obstacles,...activeEdges.flatMap(e=>e.labelBox?[e.labelBox]:[])];
 const run=ordered=>{
  const results=[],labels=[...activeLabels];
  for(const edge of ordered){
   const a=byID.get(edge.source),b=byID.get(edge.target);if(!a||!b){results.push({...edge,points:[],d:'',routingBlocked:true});continue;}
   const validate=createRouteValidator(edge,nodes);
   const paths=[...activePaths,...results.map(e=>e.points)],hard=[...cardObstacles(edge,nodes).map(n=>({x:n.x-4,y:n.y-4,width:n.width+8,height:n.height+8})),...labels.map(r=>({x:r.x-2,y:r.y-2,width:r.width+4,height:r.height+4}))];
   const laneXs=[area.x+2,area.x+area.width-2,...hard.flatMap(r=>[r.x,r.x+r.width]),...paths.flatMap(points=>points.flatMap(p=>[p.x-7,p.x+7]))],laneYs=[area.y+2,area.y+area.height-2,...hard.flatMap(r=>[r.y,r.y+r.height]),...paths.flatMap(points=>points.flatMap(p=>[p.y-7,p.y+7]))];
   const uniqueLanes=(values,mid,min,max)=>[...new Set(values)].filter(v=>v>=min&&v<=max).sort((a,b)=>Math.abs(a-mid)-Math.abs(b-mid)).slice(0,candidateBudget<=4?4:12);
   const xs=uniqueLanes(laneXs,(a.x+a.width/2+b.x+b.width/2)/2,area.x,area.x+area.width),ys=uniqueLanes(laneYs,(a.y+a.height/2+b.y+b.height/2)/2,area.y,area.y+area.height);
   let best=null;
   const inspect=(from,to,middle)=>{
    const points=simplify([from.point,...middle,to.point]);
    if(points.some(p=>p.x<area.x||p.y<area.y||p.x>area.x+area.width||p.y>area.y+area.height)||!validate(points))return;
    if(segments(points).some(([p,q])=>labels.some(r=>segmentHitsRect(p,q,r))))return;
    if(segments(middle).some(([p,q])=>hard.some(r=>segmentHitsRect(p,q,r))))return;
    const metric=peripheralRoutingMetrics([{points}],paths.map(points=>({points}))),score=peripheralRouteScore(metric);
    if(best&&score>=best.score)return;
    const labelBox=labelFor(edge,points,nodes,labels,paths,area,measureLabel);if(edge.label&&!labelBox)return;
    best={points,labelBox,score};
   };
   const froms=terminals(a,b),tos=terminals(b,a),pairs=froms.flatMap((from,i)=>tos.map((to,j)=>({from,to,i,j}))).sort((a,b)=>Math.abs(a.i-a.j)-Math.abs(b.i-b.j)||a.i+a.j-b.i-b.j).slice(0,Math.max(1,candidateBudget));
   for(const {from,to}of pairs){
    const p=from.stub,q=to.stub;
    inspect(from,to,[p,{x:p.x,y:q.y},q]);inspect(from,to,[p,{x:q.x,y:p.y},q]);
    for(const x of [...new Set([(p.x+q.x)/2,...xs])])inspect(from,to,[p,{x,y:p.y},{x,y:q.y},q]);
    for(const y of [...new Set([(p.y+q.y)/2,...ys])])inspect(from,to,[p,{x:p.x,y},{x:q.x,y},q]);
   }
   if(candidateBudget>4&&(!best||best.score>=10000))for(const {from,to}of pairs){
    const p=from.stub,q=to.stub;
    for(const x of [...new Set([area.x+2,area.x+area.width-2,...xs.slice(0,2)])])for(const y of [...new Set([area.y+2,area.y+area.height-2,...ys.slice(0,2)])]){
     inspect(from,to,[p,{x,y:p.y},{x,y},{x:q.x,y},q]);
     inspect(from,to,[p,{x:p.x,y},{x,y},{x,y:q.y},q]);
    }
   }
   // At most two visibility searches are reserved for static genuinely blocked
   // geometry. Live callers disable this and use four cheap candidate pairs.
   if(!best&&candidateBudget>4)for(const {from,to}of pairs.slice(0,visibilitySearches)){
    const middle=routeOrthogonal(from.stub,to.stub,hard,{bendPenalty:12});if(middle)inspect(from,to,middle);
   }
   if(!best){results.push({...edge,points:[],d:'',routingBlocked:true,labelOmitted:!!edge.label});continue;}
   const result={...edge,points:best.points,d:best.points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '),routingBlocked:false};
   if(best.labelBox){labels.push(best.labelBox);result.labelBox=best.labelBox;result.x=best.labelBox.x;result.y=best.labelBox.y+best.labelBox.height*.78;}
   results.push(result);
  }
  return {edges:results,metrics:peripheralRoutingMetrics(results,activeEdges)};
 };
 const ordered=[...edges].sort((a,b)=>String(a.id).localeCompare(String(b.id))),first=run(ordered);
 if(!reverse||!first.metrics.crossings&&!first.metrics.overlapLength&&!first.metrics.blocked)return first;
 const second=run([...ordered].reverse());return peripheralRouteScore(second.metrics)<peripheralRouteScore(first.metrics)?second:first;
}
