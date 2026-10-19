const overlaps=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const contains=(a,b)=>a.x<=b.x&&a.y<=b.y&&a.x+a.width>=b.x+b.width&&a.y+a.height>=b.y+b.height;
const centre=n=>({x:n.x+n.width/2,y:n.y+n.height/2});

/** Largest unobstructed reading rectangle; prose is measured only once. */
export function graphArea(width,height,panels=[]){
 const left=16,top=16,right=Math.max(left+1,width-16),bottom=Math.max(top+1,height-60);
 const xs=[left,right,...panels.flatMap(p=>[Math.max(left,p.x-16),Math.min(right,p.x+p.width+16)])];
 const ys=[top,bottom,...panels.flatMap(p=>[Math.max(top,p.y-16),Math.min(bottom,p.y+p.height+16)])];
 const candidates=[];
 for(const x of xs)for(const r of xs)for(const y of ys)for(const b of ys){const rect={x,y,width:r-x,height:b-y};if(rect.width>0&&rect.height>0&&!panels.some(p=>overlaps(rect,p)))candidates.push(rect);}
 return candidates.sort((a,b)=>b.width*b.height-a.width*a.height)[0]??{x:left,y:top,width:right-left,height:bottom-top};
}
/** Fit occupied active bounds, never origin whitespace or peripheral context. */
export function fitNodes(nodes,area){
 const minX=nodes.length?Math.min(...nodes.map(n=>n.x)):0,minY=nodes.length?Math.min(...nodes.map(n=>n.y)):0;
 const maxX=nodes.length?Math.max(...nodes.map(n=>n.x+n.width)):1,maxY=nodes.length?Math.max(...nodes.map(n=>n.y+n.height)):1;
 const scale=Math.min(1.4,area.width/(maxX-minX+20),area.height/(maxY-minY+20));
 const offsetX=area.x+(area.width-(maxX-minX)*scale)/2-minX*scale,offsetY=area.y+(area.height-(maxY-minY)*scale)/2-minY*scale;
 return {scale,nodes:nodes.map(n=>({...n,x:n.x*scale+offsetX,y:n.y*scale+offsetY,width:n.width*scale,height:n.height*scale}))};
}
const simplify=points=>points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y).filter((p,i,all)=>!i||i===all.length-1||!(all[i-1].x===p.x&&p.x===all[i+1].x||all[i-1].y===p.y&&p.y===all[i+1].y));
function segmentBlocked(a,b,obstacles){return obstacles.some(n=>a.x===b.x?a.x>n.x&&a.x<n.x+n.width&&Math.max(a.y,b.y)>n.y&&Math.min(a.y,b.y)<n.y+n.height:a.y>n.y&&a.y<n.y+n.height&&Math.max(a.x,b.x)>n.x&&Math.min(a.x,b.x)<n.x+n.width);}
/** Rectilinear visibility grid. Obstacles include endpoint cards, so a wrapped
 * edge cannot run back through its source, target or an intervening peer. */
function orthogonal(start,end,obstacles){
 const xs=[...new Set([start.x,end.x,...obstacles.flatMap(n=>[n.x,n.x+n.width])])].sort((a,b)=>a-b);
 const ys=[...new Set([start.y,end.y,...obstacles.flatMap(n=>[n.y,n.y+n.height])])].sort((a,b)=>a-b);
 const points=[],byXY=new Map();
 for(const x of xs)for(const y of ys)if(!obstacles.some(n=>x>n.x&&x<n.x+n.width&&y>n.y&&y<n.y+n.height)){byXY.set(x+','+y,points.length);points.push({x,y});}
 const first=byXY.get(start.x+','+start.y),last=byXY.get(end.x+','+end.y);if(first===undefined||last===undefined)return null;
 const links=points.map(()=>[]);
 for(const axis of ['x','y']){
  const groups=new Map();for(const [i,p]of points.entries()){const value=p[axis];if(!groups.has(value))groups.set(value,[]);groups.get(value).push(i);}
  for(const group of groups.values()){group.sort((a,b)=>points[a][axis==='x'?'y':'x']-points[b][axis==='x'?'y':'x']);for(let j=1;j<group.length;j++){const a=group[j-1],b=group[j];if(!segmentBlocked(points[a],points[b],obstacles)){const length=Math.abs(points[a].x-points[b].x)+Math.abs(points[a].y-points[b].y);links[a].push([b,length,axis]);links[b].push([a,length,axis]);}}}
 }
 const queue=[{id:first,cost:0,axis:'',path:[first]}],best=new Map();
 while(queue.length){queue.sort((a,b)=>a.cost-b.cost);const current=queue.shift(),key=current.id+current.axis;if(best.has(key)&&best.get(key)<current.cost)continue;if(current.id===last)return current.path.map(i=>points[i]);for(const [id,length,axis]of links[current.id]){const cost=current.cost+length+(current.axis&&current.axis!==axis?14:0),key=id+axis;if(best.has(key)&&best.get(key)<=cost)continue;best.set(key,cost);queue.push({id,cost,axis,path:[...current.path,id]});}}
 return null;
}
function endpoints(a,b,sourceFraction=.5,targetFraction=.5){
 const ac=centre(a),bc=centre(b),vertical=Math.abs(ac.y-bc.y)>Math.abs(ac.x-bc.x)*.5;
 const normal=side=>({NORTH:{x:0,y:-1},SOUTH:{x:0,y:1},EAST:{x:1,y:0},WEST:{x:-1,y:0}}[side]);
 const defaultDirection=vertical?{x:0,y:bc.y>ac.y?1:-1}:{x:bc.x>ac.x?1:-1,y:0};
 const sourceDirection=normal(a.kind==='port'?(a.portSide??a.side):'')??defaultDirection,targetDirection=normal(b.kind==='port'?(b.portSide??b.side):'')??{x:-defaultDirection.x,y:-defaultDirection.y};
 const attachment=(node,direction,fraction)=>direction.x?{x:node.x+(direction.x>0?node.width:0),y:node.y+node.height*fraction}:{x:node.x+node.width*fraction,y:node.y+(direction.y>0?node.height:0)};
 return [attachment(a,sourceDirection,sourceFraction),attachment(b,targetDirection,targetFraction),sourceDirection,targetDirection];
}
function connectionObstacles(edge,nodes){
 const byID=new Map(nodes.map(n=>[n.id,n])),ancestors=new Set(),leafPortOwners=new Set();
 for(const id of [edge.source,edge.target]){let node=byID.get(id);if(node?.kind==='port'&&node.parentId&&!byID.get(node.parentId)?.headerHeight)leafPortOwners.add(node.parentId);const seen=new Set();while(node?.parentId&&!seen.has(node.parentId)){seen.add(node.parentId);ancestors.add(node.parentId);node=byID.get(node.parentId);}}
 return nodes.filter(n=>(n.opacity??1)>.08&&n.width>0&&n.height>0).flatMap(n=>ancestors.has(n.id)&&!leafPortOwners.has(n.id)?n.headerHeight?[{...n,height:n.headerHeight}]:[]:[n]);
}
function route(a,b,nodes,options={}){
 const [start,end,direction,targetDirection]=endpoints(a,b,options.sourceFraction,options.targetFraction),clearance=options.clearance??8;
 let stub={x:start.x+direction.x*clearance,y:start.y+direction.y*clearance},finish={x:end.x+targetDirection.x*clearance,y:end.y+targetDirection.y*clearance};
 const obstacles=connectionObstacles({source:a.id,target:b.id},nodes).map(n=>({x:n.x-4,y:n.y-4,width:n.width+8,height:n.height+8}));
 let middle=orthogonal(stub,finish,obstacles);
 // Scaled peer gaps can be narrower than a normal eight-pixel port stub.
 // Keep the stub outside its own four-pixel obstacle without overshooting
 // into a neighboring card. Zero-size boundary markers remain free points.
 if(!middle&&clearance>4.1){
  stub={x:start.x+direction.x*4.1,y:start.y+direction.y*4.1};finish={x:end.x+targetDirection.x*4.1,y:end.y+targetDirection.y*4.1};middle=orthogonal(stub,finish,obstacles);
 }
 // A malformed native containment drawing may not expose a free port. Retain
 // the actual directed endpoints and disclose the routing limitation.
 const points=middle?simplify([start,...middle,end]):[];
 return {points,d:points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '),routingBlocked:!middle};
}
/** Compatibility route for one edge. Use routeEdges for collision-aware labels. */
export function edgeRoute(a,b,nodes=[]){const result=route(a,b,nodes);if(!result.points.length)return {...result,x:0,y:0};const p=result.points[Math.floor((result.points.length-1)/2)],q=result.points[Math.ceil((result.points.length-1)/2)];return {...result,x:(p.x+q.x)/2,y:(p.y+q.y)/2-5};}
// Liang–Barsky clipping also checks diagonal offset-label leaders.
function lineCrossesRect(a,b,rect,padding=0){
 const left=rect.x-padding,top=rect.y-padding,right=rect.x+rect.width+padding,bottom=rect.y+rect.height+padding;
 let lo=0,hi=1;
 for(const [origin,delta,min,max]of [[a.x,b.x-a.x,left,right],[a.y,b.y-a.y,top,bottom]]){
  if(Math.abs(delta)<1e-9){if(origin<=min||origin>=max)return false;continue;}
  let first=(min-origin)/delta,last=(max-origin)/delta;if(first>last)[first,last]=[last,first];lo=Math.max(lo,first);hi=Math.min(hi,last);if(lo>=hi)return false;
 }
 return hi>0&&lo<1;
}
function clearLeader(box,points,nodes,labels){
 const from={x:box.x+box.width/2,y:box.y+box.height/2},targets=[...points,...points.slice(1).map((p,i)=>({x:(p.x+points[i].x)/2,y:(p.y+points[i].y)/2}))];
 targets.sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y));
 const to=targets.find(target=>!nodes.some(n=>n.width>0&&n.height>0&&lineCrossesRect(from,target,n,2))&&!labels.some(label=>lineCrossesRect(from,target,label,2)));
 return to?{from,to}:null;
}
function labelCandidates(points,width,height){
 const candidates=[];
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i],length=Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
  if(length<8)continue;
  for(const t of [.5,.25,.75]){const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
   if(a.y===b.y){candidates.push({x:x-width/2,y:y-height-3,score:length},{x:x-width/2,y:y+3,score:length-1});}
   else candidates.push({x:x+5,y:y-height/2,score:length-2},{x:x-width-5,y:y-height/2,score:length-3});
  }
 }
 return candidates.sort((a,b)=>b.score-a.score);
}
/** Batch directed routes and measured labels. Each edge keeps its identity;
 * shared-parent labels occupy separate clear slots instead of a common bus. */
export function routeEdges(edges,nodes,options={}){
 const byID=new Map(nodes.map(n=>[n.id,n])),labels=[],ports=new Map();
 const measured=text=>{const size=options.measureLabel?.(text);return {width:Math.max(1,size?.width??String(text).length*7.2+4),height:Math.max(1,size?.height??16)};};
 // Stable, distributed endpoint ports keep parallel derivations distinguishable.
 const ordered=[...edges].sort((a,b)=>String(a.id).localeCompare(String(b.id)));
 for(const edge of ordered)for(const side of ['source','target']){const key=edge[side];if(!ports.has(key))ports.set(key,[]);ports.get(key).push({edge,side});}
 const fraction=(edge,side)=>{const group=ports.get(edge[side]),index=group.findIndex(item=>item.edge===edge&&item.side===side);return group.length===1?.5:.2+.6*(index+.5)/group.length;};
 const area=options.area;
 return edges.map(edge=>{
  const a=byID.get(edge.source),b=byID.get(edge.target);if(!a||!b)return null;
  const result={...edge,...route(a,b,nodes,{...options,sourceFraction:fraction(edge,'source'),targetFraction:fraction(edge,'target')})};
  if(!edge.label||result.routingBlocked)return result;
  const size=measured(edge.label),valid=box=>!nodes.some(n=>n.width>0&&n.height>0&&overlaps(box,n,3))&&!labels.some(other=>overlaps(box,other,4))&&(!area||box.x>=area.x&&box.y>=area.y&&box.x+box.width<=area.x+area.width&&box.y+box.height<=area.y+area.height);
  let labelBox=labelCandidates(result.points,size.width,size.height).map(candidate=>({...candidate,...size})).find(valid);
  if(!labelBox){
   // Search adjacent empty space, nearest the route first. This is still a
   // per-relationship label; an optional leader connects an offset slot.
   const mid=result.points[1]??result.points[0],region=area??{x:Math.min(...nodes.map(n=>n.x))-80,y:Math.min(...nodes.map(n=>n.y))-40,width:Math.max(...nodes.map(n=>n.x+n.width))-Math.min(...nodes.map(n=>n.x))+160,height:Math.max(...nodes.map(n=>n.y+n.height))-Math.min(...nodes.map(n=>n.y))+80};
   // Card-aligned candidates catch narrow free gutters that a regular grid
   // can skip entirely (for example a 25-pixel gap holding a 16-pixel label).
   const cards=nodes.filter(n=>n.width>0&&n.height>0);
   const xs=[region.x,...cards.flatMap(n=>[n.x+n.width/2-size.width/2,n.x-size.width-4,n.x+n.width+4]),...result.points.map(p=>p.x-size.width/2)];
   const ys=[region.y,...cards.flatMap(n=>[n.y+n.height+4,n.y-size.height-4]),...result.points.map(p=>p.y-size.height/2)];
   for(let y=region.y;y+size.height<=region.y+region.height;y+=size.height+5)ys.push(y);
   for(let x=region.x;x+size.width<=region.x+region.width;x+=Math.max(12,size.width/2))xs.push(x);
   const slots=[];for(const y of new Set(ys))for(const x of new Set(xs)){const box={x,y,...size};if(valid(box))slots.push(box);}
   slots.sort((a,b)=>Math.hypot(a.x+a.width/2-mid.x,a.y+a.height/2-mid.y)-Math.hypot(b.x+b.width/2-mid.x,b.y+b.height/2-mid.y));
   for(const slot of slots){const leader=clearLeader(slot,result.points,nodes,labels);if(leader){labelBox=slot;result.labelLeader=leader;break;}}
  }
  if(labelBox){labels.push(labelBox);result.labelBox=labelBox;result.x=labelBox.x;result.y=labelBox.y+labelBox.height*.78;}
  else result.labelOmitted=true; // Explicitly report an impossible label fit.
  return result;
 }).filter(Boolean);
}

/** One camera transform for all occupied joint geometry, including labels. */
export function fitDiagram(layout,area){
 const occupied=[...layout.nodes,...layout.nodes.flatMap(n=>n.portLabelBox?[n.portLabelBox]:[]),...layout.edges.flatMap(e=>[...(e.labelBox?[e.labelBox]:[]),...e.points.map(p=>({...p,width:0,height:0}))])],fit=fitNodes(occupied,area),scale=fit.scale;
 const origin=occupied[0],fitted=fit.nodes[0],dx=origin?fitted.x-origin.x*scale:area.x,dy=origin?fitted.y-origin.y*scale:area.y;
 const point=p=>({x:p.x*scale+dx,y:p.y*scale+dy}),box=n=>({...n,...point(n),width:n.width*scale,height:n.height*scale});
 return {...layout,scale,nodes:layout.nodes.map(n=>({...box(n),...(n.headerHeight?{headerHeight:n.headerHeight*scale}:{}),...(n.portLabelBox?{portLabelBox:box(n.portLabelBox)}:{})})),edges:layout.edges.map(e=>({...e,points:e.points.map(point),...(e.labelBox?{labelBox:box(e.labelBox),x:e.x*scale+dx,y:e.y*scale+dy}:{}),labelScale:scale})),ports:layout.ports?.map(p=>({...p,...point(p)}))};
}
/** Validate actual segments, including during motion; containment is identity based. */
export function routeIsClear(points,edge,nodes,{orthogonalOnly=false}={}){
 if(points.length<2||points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y)))return false;
 const obstacles=connectionObstacles(edge,nodes);
 for(let i=1;i<points.length;i++){
  const a=points[i-1],b=points[i];if(orthogonalOnly&&Math.abs(a.x-b.x)>.01&&Math.abs(a.y-b.y)>.01)return false;
  if(obstacles.some(n=>lineCrossesRect(a,b,{x:n.x+.05,y:n.y+.05,width:Math.max(0,n.width-.1),height:Math.max(0,n.height-.1)})))return false;
 }
 return true;
}
