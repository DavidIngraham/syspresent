import {createRouteValidator,routeConnectsEndpoints} from './geometry.mjs';

const finite=(n,fallback)=>Number.isFinite(n)&&n>0?n:fallback;
const semanticId=n=>n.semanticId??n.id;
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const simplify=points=>points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y).filter((p,i,a)=>!i||i===a.length-1||!((a[i-1].x===p.x&&p.x===a[i+1].x)||(a[i-1].y===p.y&&p.y===a[i+1].y)));
const routeLength=p=>p.slice(1).reduce((n,b,i)=>n+Math.abs(b.x-p[i].x)+Math.abs(b.y-p[i].y),0);
const boundsOf=items=>{
 if(!items.length)return {x:0,y:0,width:0,height:0};
 const x=Math.min(...items.map(n=>n.x)),y=Math.min(...items.map(n=>n.y));
 return {x,y,width:Math.max(...items.map(n=>n.x+(n.width??0)))-x,height:Math.max(...items.map(n=>n.y+(n.height??0)))-y};
};

/**
 * Presentation-only layout of a complete, already selected one-hop projection.
 * This function never discovers semantic membership, creates instances, or drops cards.
 * Native ownership frames replace only navigation-only owner drawing spokes;
 * the original semantic view and exact ownership records remain available.
 */
export async function layoutChildWorkspace(view,{width=1100,gap=28,padding=24,minCardWidth=260,measureLabel,isCurrent=()=>true,yieldControl=()=>new Promise(resolve=>setTimeout(resolve,0))}={}){
 gap=finite(gap,28);padding=finite(padding,24);width=finite(width,1100);
 const diagnostics=[],ownershipFrames=[],notices=[];
 let deadline=performance.now()+12,work=0;
 const checkpoint=async()=>{
  if(!isCurrent()){const error=new Error('Child workspace layout canceled');error.name='AbortError';error.code='LAYOUT_CANCELED';throw error;}
  if(++work%32===0||performance.now()>=deadline){await yieldControl();deadline=performance.now()+12;if(!isCurrent()){const error=new Error('Child workspace layout canceled');error.name='AbortError';error.code='LAYOUT_CANCELED';throw error;}}
 };
 await checkpoint();
 const nodes=(view.nodes??[]).map(n=>({...n,width:Math.max(minCardWidth,finite(n.width,260)),height:finite(n.height,120)}));
 const byId=new Map(nodes.map(n=>[n.id,n])),bySemantic=new Map();
 for(const n of nodes){const id=semanticId(n);if(!bySemantic.has(id))bySemantic.set(id,[]);bySemantic.get(id).push(n);}
 const projection=view.childProjection??{},roots=new Set([...(projection.rootIds??[]),...(projection.typeIds??[])]);
 const parentOf=new Map();
 for(const n of nodes){
  await checkpoint();
  // Requested scope and its type context stay independently addressable.
  delete n.parentId;
  if(roots.has(semanticId(n)))continue;
  const owner=projection.declaredOn?.[semanticId(n)],candidates=bySemantic.get(owner)??[];
  if(owner&&candidates.length===1&&candidates[0].id!==n.id)parentOf.set(n.id,candidates[0].id);
  else if(owner||projection.declarationOwners?.[semanticId(n)]?.length>1)diagnostics.push({code:'child-owner-frame-unavailable',nodeId:n.id,semanticId:semanticId(n),ownerIds:projection.declarationOwners?.[semanticId(n)]??[owner],message:'Native ownership is retained, but no unique containing card is available.'});
 }
 // Keep cyclic native ownership as metadata, never a cyclic presentation tree.
 for(const n of nodes){
  const path=[],seen=new Set();let id=n.id;
  while(parentOf.has(id)){
   if(seen.has(id)){const cycle=path.slice(path.indexOf(id));for(const member of cycle)parentOf.delete(member);diagnostics.push({code:'child-owner-cycle',nodeIds:cycle,message:'Cyclic native ownership is shown without nested frames.'});break;}
   seen.add(id);path.push(id);id=parentOf.get(id);
  }
 }
 const children=new Map();
 for(const [child,parent]of parentOf){if(!children.has(parent))children.set(parent,[]);children.get(parent).push(byId.get(child));byId.get(child).parentId=parent;}
 const cells=new Map();
 const measure=node=>{
  const owned=children.get(node.id)??[];
  if(!owned.length)return;
  for(const child of owned)measure(child);
  const cellWidth=Math.max(minCardWidth,...owned.map(n=>n.width));
  const columns=Math.max(1,Math.min(owned.length,Math.floor((Math.max(width,node.width)-padding*2+gap)/(cellWidth+gap))));
  const headerHeight=Math.max(72,finite(node.headerHeight,node.height));
  const rows=[];
  for(let offset=0;offset<owned.length;offset+=columns){const row=owned.slice(offset,offset+columns);rows.push({nodes:row,height:Math.max(...row.map(n=>n.height))});}
  node.headerHeight=headerHeight;node.width=Math.max(node.width,padding*2+columns*cellWidth+(columns-1)*gap);
  node.height=headerHeight+padding*2+rows.reduce((sum,r)=>sum+r.height,0)+Math.max(0,rows.length-1)*gap;
  node.childGrid={columns,rows:rows.length,complete:true};
  let y=headerHeight+padding;
  for(const row of rows){for(let col=0;col<row.nodes.length;col++){const child=row.nodes[col];child.x=padding+col*(cellWidth+gap);child.y=y;cells.set(child.id,{left:child.x-gap/2,right:child.x+cellWidth+gap/2,top:y-gap/2,bottom:y+row.height+gap/2});}y+=row.height+gap;}
 };
 const top=nodes.filter(n=>!parentOf.has(n.id));
 // Root/context order is the supplied native projection order, never selection state.
 for(const n of top)measure(n);
 let cursorY=0;
 const absolutize=node=>{
  for(const child of children.get(node.id)??[]){
   const cell=cells.get(child.id);child.x+=node.x;child.y+=node.y;
   cells.set(child.id,{left:cell.left+node.x,right:cell.right+node.x,top:cell.top+node.y,bottom:cell.bottom+node.y});
   absolutize(child);
  }
 };
 const rootOrder=[...(projection.rootIds??[]),...(projection.typeIds??[])],rank=new Map(rootOrder.map((id,i)=>[id,i]));
 top.sort((a,b)=>(rank.get(semanticId(a))??Infinity)-(rank.get(semanticId(b))??Infinity));
 // Consecutive root cards share a grid; a native owner frame stays at its
 // original position in that order, so a usage precedes its definition context.
 let flat=[];
 const placeFlat=()=>{
  if(!flat.length)return;
  const cellWidth=Math.max(minCardWidth,...flat.map(n=>n.width)),columns=Math.max(1,Math.min(flat.length,Math.floor((width+gap)/(cellWidth+gap))));
  for(let offset=0;offset<flat.length;offset+=columns){
   const row=flat.slice(offset,offset+columns),height=Math.max(...row.map(n=>n.height));
   for(let col=0;col<row.length;col++){const n=row[col];n.x=col*(cellWidth+gap);n.y=cursorY;cells.set(n.id,{left:n.x-gap/2,right:n.x+cellWidth+gap/2,top:cursorY-gap/2,bottom:cursorY+height+gap/2});}
   cursorY+=height+gap;
  }
  flat=[];
 };
 for(const n of top){
  if(children.has(n.id)){placeFlat();n.x=0;n.y=cursorY;absolutize(n);cursorY+=n.height+gap*2;}
  else flat.push(n);
  await checkpoint();
 }
 placeFlat();
 const cardBounds=boundsOf(nodes),edges=[],labelBoxes=[];
 const degree=new Map();for(const e of view.edges??[])for(const id of [e.source,e.target])degree.set(id,(degree.get(id)??0)+1);
 const terminalCount=new Map();
 const terminals=(node,edge,source)=>{
  const slot=terminalCount.get(node.id)??0;terminalCount.set(node.id,slot+1);
  const fraction=.2+.6*((slot+.5)/(degree.get(node.id)??1)),cell=cells.get(node.id);
  if(node.headerHeight)return [
   [{x:node.x,y:node.y+Math.min(node.headerHeight,node.height)*fraction},{x:node.x-gap/2,y:node.y+Math.min(node.headerHeight,node.height)*fraction}],
   [{x:node.x+node.width,y:node.y+Math.min(node.headerHeight,node.height)*fraction},{x:node.x+node.width+gap/2,y:node.y+Math.min(node.headerHeight,node.height)*fraction}],
  ];
  return [
   [{x:node.x+node.width*fraction,y:node.y},{x:node.x+node.width*fraction,y:cell?.top??node.y-gap/2}],
   [{x:node.x+node.width*fraction,y:node.y+node.height},{x:node.x+node.width*fraction,y:cell?.bottom??node.y+node.height+gap/2}],
   [{x:node.x,y:node.y+node.height*fraction},{x:cell?.left??node.x-gap/2,y:node.y+node.height*fraction}],
   [{x:node.x+node.width,y:node.y+node.height*fraction},{x:cell?.right??node.x+node.width+gap/2,y:node.y+node.height*fraction}],
  ];
 };
 for(const original of view.edges??[]){
  await checkpoint();
  const edge={...original},geometryEdge={...edge,source:edge.sourceAttachment??edge.source,target:edge.targetAttachment??edge.target},source=byId.get(geometryEdge.source),target=byId.get(geometryEdge.target);
  if(!edge.sourceAttachment&&!edge.targetAttachment&&source&&target&&edge.navigationOnly&&edge.nativeRole==='owner'&&target.parentId===source.id){
   ownershipFrames.push({...edge,presentation:'containing-frame',ownerId:source.id,childId:target.id});continue;
  }
  if(!source||!target){edge.points=[];edge.routingBlocked=true;diagnostics.push({code:'child-edge-endpoint-unavailable',edgeId:edge.id,message:edge.sourceAttachment||edge.targetAttachment?'An exact native attachment has no card in this projection.':'A native relationship endpoint has no card in this projection.'});edges.push(edge);continue;}
  const starts=terminals(source,edge,true),ends=terminals(target,edge,false),valid=createRouteValidator(geometryEdge,nodes,{orthogonalOnly:true});
  let best=null,bestCost=Infinity;
  const outerLeft=cardBounds.x-gap*(1+(edges.length%5)/6),outerRight=cardBounds.x+cardBounds.width+gap*(1+(edges.length%5)/6);
  for(const [start,a]of starts)for(const [end,b]of ends){
   const candidates=[
    [start,a,{x:b.x,y:a.y},b,end],[start,a,{x:a.x,y:b.y},b,end],
    ...[outerLeft,outerRight].map(x=>[start,a,{x,y:a.y},{x,y:b.y},b,end]),
    ...[cardBounds.y-gap,cardBounds.y+cardBounds.height+gap].map(y=>[start,a,{x:a.x,y},{x:b.x,y},b,end]),
   ];
   for(const raw of candidates){
    const points=simplify(raw),cost=routeLength(points)+(points.length-2)*8;
    if(cost<bestCost&&valid(points)&&routeConnectsEndpoints(points,geometryEdge,nodes)){best=points;bestCost=cost;}
   }
  }
  if(!best){edge.points=[];edge.routingBlocked=true;diagnostics.push({code:'child-edge-route-blocked',edgeId:edge.id,message:edge.sourceAttachment||edge.targetAttachment?'Exact native attachment has no supported card anchor.':'No clear orthogonal route exists in the available grid gutters.'});}
  else{
   edge.points=best;
   if(edge.label){
    const measured=measureLabel?.(edge.label,edge)??{width:Math.max(40,String(edge.label).length*7),height:18};
    const w=finite(measured.width,60),h=finite(measured.height,18);
    // Frames are allowed label surfaces below their header; leaf cards are not.
    const obstacles=nodes.map(n=>n.headerHeight?{...n,height:n.headerHeight}:n);
    for(let i=1;i<best.length;i++){
     const a=best[i-1],b=best[i],box={x:(a.x+b.x-w)/2,y:(a.y+b.y-h)/2,width:w,height:h};
     if((a.y===b.y&&Math.abs(a.x-b.x)<w+8)||(a.x===b.x&&Math.abs(a.y-b.y)<h+8))continue;
     if(obstacles.some(n=>overlap(box,n))||labelBoxes.some(n=>overlap(box,n)))continue;
     edge.labelBox=box;edge.x=box.x;edge.y=box.y+box.height*.78;labelBoxes.push(box);break;
    }
    if(!edge.labelBox){edge.labelOmitted=true;diagnostics.push({code:'child-edge-label-unplaced',edgeId:edge.id,message:'The native relationship label remains available in relationship details.'});}
   }
  }
  edges.push(edge);
 }
 if(ownershipFrames.length)notices.push({code:'native-ownership-as-frames',count:ownershipFrames.length,message:ownershipFrames.length+' native ownership links are shown by containing frames; relationship identities remain available.'});
 const routePoints=edges.flatMap(e=>(e.points??[]).map(p=>({...p,width:0,height:0})));
 return {...view,nodes,edges,ports:[],scale:1,bounds:boundsOf([...nodes,...routePoints,...labelBoxes]),layoutEngine:'complete-child-grid',ownershipFrames,diagnostics,notices,omissions:[],childWorkspace:true};
}

/** Place without shrinking complete sibling sets; the viewport pans over world bounds. */
export function placeChildWorkspace(layout,area={x:0,y:0}){
 const dx=(area.x??0)-(layout.bounds?.x??0),dy=(area.y??0)-(layout.bounds?.y??0);
 const move=p=>({...p,x:p.x+dx,y:p.y+dy});
 return {...layout,scale:1,nodes:layout.nodes.map(move),ports:(layout.ports??[]).map(move),edges:layout.edges.map(e=>({...e,points:(e.points??[]).map(move),...(e.labelBox?{labelBox:move(e.labelBox),x:e.x+dx,y:e.y+dy}:{})})),bounds:{...layout.bounds,x:layout.bounds.x+dx,y:layout.bounds.y+dy},worldBounds:{...layout.bounds,x:layout.bounds.x+dx,y:layout.bounds.y+dy}};
}
