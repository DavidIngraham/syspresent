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
