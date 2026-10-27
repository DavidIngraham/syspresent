/** Disposable, local placement of labels belonging to native pins. Never moves
 * pins, cards or routes; omitted text remains on its native drawing record. */
import {connectionObstacles} from './geometry.mjs';
const finite=Number.isFinite;
const rect=box=>box&&[box.x,box.y,box.width,box.height].every(finite)&&box.width>0&&box.height>0;
const overlap=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const inside=(box,area)=>!area||box.x>=area.x&&box.y>=area.y&&box.x+box.width<=area.x+area.width&&box.y+box.height<=area.y+area.height;
const centre=box=>({x:box.x+box.width/2,y:box.y+box.height/2});
const distance=(p,box)=>Math.hypot(Math.max(box.x-p.x,0,p.x-box.x-box.width),Math.max(box.y-p.y,0,p.y-box.y-box.height));
function crosses(a,b,box,padding){
 if(!a||!b||![a.x,a.y,b.x,b.y].every(finite))return false;
 let lo=0,hi=1;
 for(const [origin,delta,min,max]of [[a.x,b.x-a.x,box.x-padding,box.x+box.width+padding],[a.y,b.y-a.y,box.y-padding,box.y+box.height+padding]]){
  if(Math.abs(delta)<1e-9){if(origin<=min||origin>=max)return false;continue;}
  let first=(min-origin)/delta,last=(max-origin)/delta;if(first>last)[first,last]=[last,first];lo=Math.max(lo,first);hi=Math.min(hi,last);if(lo>=hi)return false;
 }
 return hi>0&&lo<1;
}
const pathHits=(points,box,padding)=>(points??[]).slice(1).some((b,i)=>crosses(points[i],b,box,padding));
const sideOf=node=>String(node.portSide??node.side??'').toUpperCase();
function adjacent(node,width,height,scale){
 const side=sideOf(node),c=centre(node),result=[];
 if(!['NORTH','SOUTH','EAST','WEST'].includes(side))return result;
 for(const gap of [4,8,12])for(const shift of [0,-4,4,-8,8,-12,12,-16,16,-24,24]){
  const offset=shift*scale,g=gap*scale;
  result.push({x:side==='WEST'?node.x-g-width:side==='EAST'?node.x+node.width+g:c.x-width/2+offset,y:side==='NORTH'?node.y-g-height:side==='SOUTH'?node.y+node.height+g:c.y-height/2+offset,width,height});
 }
 return result;
}
/** Fitted geometry in, fitted geometry out. `scale` is the fit's text scale.
 * Existing nearby safe ELK boxes win. Alternative boxes stay beside the native
 * port side, closer to that pin than any other, without association leaders.
 * A hidden label has portLabelOmitted=true and no portLabelBox; full native
 * label/name and portLabelText remain available to inspection/accessibility.
 */
export function placePortLabels(nodes,edges,{area,scale=1,measureLabel}={}){
 if(!Array.isArray(nodes)||!Array.isArray(edges))throw new TypeError('Port labels require drawing node and edge arrays.');
 if(area!==undefined&&!rect(area))throw new TypeError('Port label area must be a finite positive rectangle.');
 const byId=new Map(nodes.map(node=>[node.id,node])),pins=nodes.filter(node=>node.kind==='port'),counts=new Map(),omissions=[];
 for(const node of nodes)counts.set(node.id,(counts.get(node.id)??0)+1);
 const occupied=edges.flatMap(edge=>[...(rect(edge.labelBox)?[edge.labelBox]:[]),...(edge.endLabelBoxes??[]).flatMap(label=>rect(label.box)?[label.box]:[])]);
 const drawings=nodes.map(node=>{
  if(node.kind!=='port')return node;
  const {portLabelBox:oldBox,portLabelOmitted:oldOmitted,portLabelText:oldText,...drawing}=node;
  const text=typeof node.label==='string'?node.label:typeof node.name==='string'?node.name:'';
  if(!text.trim())return drawing;
  const omit=(reason,message)=>{omissions.push({reason,nodeId:node.id,semanticId:node.semanticId??null,ownerId:node.parentId??null,text,message});return {...drawing,portLabelText:text,portLabelOmitted:true};};
  if(!finite(scale)||scale<=0||!rect(node))return omit('port-label-geometry','Native pin label geometry or fitted scale is unavailable; inspect its retained text.');
  if(counts.get(node.id)!==1||!node.parentId||!byId.has(node.parentId))return omit('port-label-association','The native pin has no unique visible owner; label association was not guessed.');
  let measured;
  try{measured=measureLabel?measureLabel(text):rect(oldBox)?{width:oldBox.width/scale,height:oldBox.height/scale}:{width:text.length*7,height:16};}catch{return omit('port-label-measurement','The native pin label could not be measured.');}
  if(!measured||![measured.width,measured.height].every(finite)||measured.width<=0||measured.height<=0)return omit('port-label-measurement','The native pin label has no finite positive measured dimensions.');
  const width=measured.width*scale,height=measured.height*scale;
  if(!finite(width)||!finite(height)||width<=0||height<=0)return omit('port-label-measurement','Scaled native pin label dimensions are unavailable.');
  const obstacles=connectionObstacles({source:node.id,target:node.id},nodes);
  // Do not silently use an unknown compound header as free label space.
  let ancestor=byId.get(node.parentId);const seen=new Set();
  while(ancestor&&!seen.has(ancestor.id)){seen.add(ancestor.id);if(rect(ancestor)&&!(finite(ancestor.headerHeight)&&ancestor.headerHeight>0)&&!obstacles.some(item=>item.id===ancestor.id))obstacles.push(ancestor);ancestor=byId.get(ancestor.parentId);}
  const pin=centre(node),peerPins=pins.filter(other=>other!==node&&rect(other));
  const safe=box=>rect(box)&&inside(box,area)&&distance(pin,box)<=32*scale&&peerPins.every(other=>distance(pin,box)+.01*scale<distance(centre(other),box))&&!obstacles.some(item=>overlap(box,item,2*scale))&&!occupied.some(item=>overlap(box,item,3*scale))&&!edges.some(edge=>pathHits(edge.points,box,2*scale));
  const candidates=[];
  // Retain ELK's position only when the measured full text also fits safely.
  if(rect(oldBox))candidates.push({...oldBox,width:Math.max(width,oldBox.width),height:Math.max(height,oldBox.height)});
  candidates.push(...adjacent(node,width,height,scale));
  const box=candidates.find(safe);
  if(!box)return omit('port-label-space','No unambiguous clear slot beside this native pin fits its full label; inspect the retained text.');
  occupied.push(box);return {...drawing,portLabelText:text,portLabelBox:box};
 });
 return {nodes:drawings,omissions};
}
