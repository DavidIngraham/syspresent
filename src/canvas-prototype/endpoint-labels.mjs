/** Disposable geometry for native connector-end labels. Native roles/text and
 * directed route order are supplied by the semantic renderer, never inferred.
 */
import {connectionObstacles,routeConnectsEndpoints} from './geometry.mjs';
const finite=value=>Number.isFinite(value);
const rect=value=>value&&[value.x,value.y,value.width,value.height].every(finite)&&value.width>0&&value.height>0;
const overlap=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const inside=(box,area)=>!area||box.x>=area.x&&box.y>=area.y&&box.x+box.width<=area.x+area.width&&box.y+box.height<=area.y+area.height;
const point=value=>value&&finite(value.x)&&finite(value.y);
// Liang–Barsky clipping with an open rectangle: boundary tangency is allowed.
function crosses(a,b,box,padding=0){
 let lo=0,hi=1;
 for(const [origin,delta,min,max]of [[a.x,b.x-a.x,box.x-padding,box.x+box.width+padding],[a.y,b.y-a.y,box.y-padding,box.y+box.height+padding]]){
  if(Math.abs(delta)<1e-9){if(origin<=min||origin>=max)return false;continue;}
  let first=(min-origin)/delta,last=(max-origin)/delta;if(first>last)[first,last]=[last,first];lo=Math.max(lo,first);hi=Math.min(hi,last);if(lo>=hi)return false;
 }
 return hi>0&&lo<1;
}
const pathHits=(points,box,padding=0)=>(points??[]).slice(1).some((b,i)=>crosses(points[i],b,box,padding));
function routeSamples(points,end,scale){
 const ordered=end==='source'?points:[...points].reverse(),segments=[];let length=0;
 for(let i=1;i<ordered.length;i++){const a=ordered[i-1],b=ordered[i],size=Math.hypot(b.x-a.x,b.y-a.y);if(size>1e-6){segments.push({a,b,start:length,length:size});length+=size;}}
 const distances=[12,20,32,48,64,80].map(n=>n*scale),samples=[];
 for(const distance of distances){if(distance>length/2||distance>96*scale)continue;const segment=segments.find(item=>distance<=item.start+item.length);if(!segment)continue;const t=(distance-segment.start)/segment.length; samples.push({x:segment.a.x+(segment.b.x-segment.a.x)*t,y:segment.a.y+(segment.b.y-segment.a.y)*t,dx:(segment.b.x-segment.a.x)/segment.length,dy:(segment.b.y-segment.a.y)/segment.length,distance});}
 return samples;
}
function candidates(samples,width,height,scale){
 const gap=4*scale,result=[];
 for(const sample of samples)for(const side of [1,-1]){
  const nx=-sample.dy,ny=sample.dx,clearance=(Math.abs(nx)*width+Math.abs(ny)*height)/2+gap;
  result.push({x:sample.x+nx*side*clearance-width/2,y:sample.y+ny*side*clearance-height/2,width,height});
 }
 return result;
}
/** Place native end labels beside their own directed source/target terminals.
 * Other geometry/identity is unchanged. Unplaceable labels are explicit omissions;
 * the original endLabels records remain inspectable even when no box is drawn.
 */
export function placeEndpointLabels(edges,nodes,{measureLabel=text=>({width:String(text).length*7,height:16}),area}={}){
 if(!Array.isArray(edges)||!Array.isArray(nodes))throw new TypeError('Endpoint labels require drawing edge and node arrays.');
 if(area!==undefined&&!rect(area))throw new TypeError('Endpoint label area must be a finite positive rectangle.');
 const occupied=edges.flatMap(edge=>rect(edge.labelBox)?[edge.labelBox]:[]),ports=nodes.flatMap(node=>rect(node.portLabelBox)?[node.portLabelBox]:[]),omissions=[];
 const drawings=edges.map(edge=>{
  const {endLabelBoxes:oldBoxes,...drawing}=edge;if(edge.endLabels===undefined)return drawing;
  const boxes=[],validScale=edge.labelScale===undefined||finite(edge.labelScale)&&edge.labelScale>0,scale=edge.labelScale??1;
  const terminal={...edge,source:edge.sourceAttachment??edge.source,target:edge.targetAttachment??edge.target};
  const points=edge.points??[],validRoute=!edge.routingBlocked&&points.length>=2&&points.every(point)&&routeConnectsEndpoints(points,terminal,nodes);
  const obstacles=connectionObstacles(terminal,nodes),byId=new Map(nodes.map(node=>[node.id,node]));
  // Missing ancestor-header geometry is not permission to put text over it.
  // Reserve that entire native container rather than invent a header height.
  for(const id of [terminal.source,terminal.target]){let node=byId.get(id);const seen=new Set();while(node?.parentId&&!seen.has(node.parentId)){seen.add(node.parentId);node=byId.get(node.parentId);if(node&&rect(node)&&!(finite(node.headerHeight)&&node.headerHeight>0)&&!obstacles.some(item=>item.id===node.id))obstacles.push(node);}}
  if(!Array.isArray(edge.endLabels)){omissions.push({reason:'invalid-end-label',relationshipId:edge.semanticId??edge.id,message:'Native connector end labels were not supplied as a list; no placement was guessed.'});return {...drawing,endLabelBoxes:[]};}
  for(const [index,label]of (Array.isArray(edge.endLabels)?edge.endLabels:[]).entries()){
   const omit=(reason,message)=>omissions.push({reason,relationshipId:edge.semanticId??edge.id,end:label?.end,role:label?.role,labelIndex:index,message});
   if(!label||!['source','target'].includes(label.end)){omit('invalid-end-label','A native end label has no supported source/target role; its placement was not guessed.');continue;}
   if(typeof label.text!=='string'||!label.text.trim()){omit('end-label-text-unavailable','The native connector end has no supplied label text; no role label was invented.');continue;}
   if(!validScale){omit('end-label-measurement','The fitted native end-label scale is not finite and positive.');continue;}
   if(!validRoute){omit('end-label-route','The native directed route is unavailable or detached; its end label was not drawn.');continue;}
   let measured;try{measured=measureLabel(label.text);}catch{omit('end-label-measurement','The native end label could not be measured.');continue;}
   if(!measured||![measured.width,measured.height].every(finite)||measured.width<=0||measured.height<=0){omit('end-label-measurement','The native end label has no finite positive measured dimensions.');continue;}
   const width=measured.width*scale,height=measured.height*scale;
   if(!finite(width)||!finite(height)||width<=0||height<=0){omit('end-label-measurement','Scaled native end-label dimensions are unavailable.');continue;}
   const box=candidates(routeSamples(points,label.end,scale),width,height,scale).find(candidate=>rect(candidate)&&inside(candidate,area)&&!obstacles.some(item=>overlap(candidate,item,2*scale))&&!ports.some(item=>overlap(candidate,item,2*scale))&&!occupied.some(item=>overlap(candidate,item,3*scale))&&!edges.some(other=>pathHits(other.points,candidate,2*scale)));
   if(!box){omit('end-label-space','No clear slot near this native connector end fits its measured label; inspect the retained native role instead.');continue;}
   const placed={end:label.end,role:label.role,text:label.text,box};boxes.push(placed);occupied.push(box);
  }
  return {...drawing,endLabelBoxes:boxes};
 });
 return {edges:drawings,omissions};
}
