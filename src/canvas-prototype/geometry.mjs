/** Fit only occupied diagram bounds, excluding unused origin space. */
export function graphArea(width,height,panels=[]){
 if(!panels.length)return {x:16,y:16,width:width-32,height:height-76};
 const p=panels[0];if(p.width>width*.7)return {x:16,y:16,width:width-32,height:Math.max(100,p.y-30)};
 if(p.x<width*.3)return {x:p.x+p.width+20,y:16,width:width-p.x-p.width-36,height:height-76};
 return {x:16,y:16,width:Math.max(160,p.x-34),height:height-76};
}
export function fitNodes(nodes,area){
 const minX=nodes.length?Math.min(...nodes.map(n=>n.x)):0,minY=nodes.length?Math.min(...nodes.map(n=>n.y)):0;
 const maxX=nodes.length?Math.max(...nodes.map(n=>n.x+n.width)):1,maxY=nodes.length?Math.max(...nodes.map(n=>n.y+n.height)):1;
 const scale=Math.min(1.4,area.width/(maxX-minX+20),area.height/(maxY-minY+20));
 const offsetX=area.x+(area.width-(maxX-minX)*scale)/2-minX*scale,offsetY=area.y+(area.height-(maxY-minY)*scale)/2-minY*scale;
 return {scale,nodes:nodes.map(n=>({...n,x:n.x*scale+offsetX,y:n.y*scale+offsetY,width:n.width*scale,height:n.height*scale}))};
}

/** Route around unrelated cards after mobile wrapping; native endpoints stay directed. */
export function edgeRoute(a,b,nodes=[]){
 const ac={x:a.x+a.width/2,y:a.y+a.height/2},bc={x:b.x+b.width/2,y:b.y+b.height/2};
 const vertical=Math.abs(ac.y-bc.y)>Math.abs(ac.x-bc.x)*.5;
 let points;
 if(vertical){const down=bc.y>ac.y,start={x:ac.x,y:down?a.y+a.height:a.y},end={x:bc.x,y:down?b.y:b.y+b.height},middle=(start.y+end.y)/2;points=[start,{x:start.x,y:middle},{x:end.x,y:middle},end];}
 else {const right=bc.x>ac.x,start={x:right?a.x+a.width:a.x,y:ac.y},end={x:right?b.x:b.x+b.width,y:bc.y},middle=(start.x+end.x)/2;points=[start,{x:middle,y:start.y},{x:middle,y:end.y},end];}
 const contains=(outer,inner)=>outer.x<=inner.x&&outer.y<=inner.y&&outer.x+outer.width>=inner.x+inner.width&&outer.y+outer.height>=inner.y+inner.height;
 const obstacles=nodes.filter(n=>n.id!==a.id&&n.id!==b.id&&!contains(n,a)&&!contains(n,b));
 const blocked=path=>path.slice(1).some((q,i)=>{const p=path[i];return obstacles.some(n=>p.x===q.x?p.x>n.x-2&&p.x<n.x+n.width+2&&Math.max(p.y,q.y)>n.y-2&&Math.min(p.y,q.y)<n.y+n.height+2:p.y>n.y-2&&p.y<n.y+n.height+2&&Math.max(p.x,q.x)>n.x-2&&Math.min(p.x,q.x)<n.x+n.width+2);});
 let label={x:(points[1].x+points[2].x)/2,y:(points[1].y+points[2].y)/2-5};
 if(vertical&&blocked(points)){
  const start=points[0],end=points.at(-1),direction=end.y>start.y?1:-1;
  const left=Math.min(...nodes.map(n=>n.x))-12,right=Math.max(...nodes.map(n=>n.x+n.width))+12;
  const buses=ac.x<(left+right)/2?[left,right]:[right,left];
  for(const bus of buses){const candidate=[start,{x:start.x,y:start.y+direction*10},{x:bus,y:start.y+direction*10},{x:bus,y:end.y-direction*10},{x:end.x,y:end.y-direction*10},end];if(!blocked(candidate)){points=candidate;label={x:start.x,y:start.y-7};break;}}
 }
 return {points,d:points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '),...label};
}
