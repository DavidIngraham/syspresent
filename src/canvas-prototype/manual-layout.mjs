/** Drawing geometry stays separate from native model selection and semantics. */
import {routeEdges,routeIsClear,routeConnectsEndpoints,connectionObstacles} from './geometry.mjs';
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const finite=position=>position&&Number.isFinite(position.x)&&Number.isFinite(position.y);
/** Compatibility session cache. Portable positions live in presentation-layout.mjs. */
export function createManualLayout() {
 const views=new Map();
 return {
  get(key){return structuredClone(views.get(key)??{});},
  set(key,id,position){if(typeof key!=='string'||!key||typeof id!=='string'||!id||!finite(position))throw new TypeError('Manual placement needs a view key, representation ID and finite coordinates.');const positions=views.get(key)??Object.create(null);positions[id]={x:position.x,y:position.y};views.set(key,positions);},
  clear(key){if(key===undefined)views.clear();else views.delete(key);},
 };
}
const behaviorKinds=new Set(['action','activity','sequence','state','fault-tree','mixed']);
const controls=new Set(['initial','final','fork','join','decision','merge','action','state','terminate','shallow-history','deep-history']);
function drawingHierarchy(nodes){const byID=new Map(nodes.map(n=>[n.id,n])),result=new Map();for(const id of byID.keys()){const seen=new Set([id]),ancestors=new Set();let node=byID.get(id);while(node?.parentId){if(seen.has(node.parentId))throw Error('Cyclic native drawing containment is unsupported.');seen.add(node.parentId);ancestors.add(node.parentId);node=byID.get(node.parentId);}result.set(id,ancestors);}return result;}
function terminal(layout,edge,side){
 const attachment=edge[side+'Attachment'];if(attachment)return layout.nodes.find(n=>n.id===attachment)?.id;
 const port=edge[side==='source'?'fromPort':'toPort'];if(port){const matches=layout.nodes.filter(n=>n.parentId===edge[side]&&[n.id,n.nativePortId,n.semanticId].includes(port));return matches.length===1?matches[0].id:undefined;}
 return layout.nodes.find(n=>n.id===edge[side])?.id;
}
/** Structural groups move rigidly. Nested moves require the native fitted
 * parent's actual content bounds; ports and behavioral controls remain fixed. */
export function manualLayoutSupport(layout,id,hierarchy) {
 const node=layout.nodes?.find(item=>item.id===id);
 if(!node)return {supported:false,reason:'The selected representation is not in this drawing.'};
 if(behaviorKinds.has(layout.view?.kind??layout.kind)||layout.nodes.some(n=>controls.has(n.kind)))return {supported:false,reason:'Manual movement of this behavioral notation is not supported.'};
 if(node.context||node.kind==='context-boundary'||node.kind==='port'||!node.semanticId)return {supported:false,reason:'Choose an active native structural element, not a port.'};
 if(node.parentId){const parent=layout.nodes.find(n=>n.id===node.parentId);if(!parent||![parent.x,parent.y,parent.width,parent.height,parent.headerHeight].every(Number.isFinite)||parent.width<=0||parent.headerHeight<=0||parent.height<=parent.headerHeight)return {supported:false,reason:'Nested movement requires native compound parent content bounds including header height. Keep automatic layout for this drawing.'};}
 try{hierarchy??=drawingHierarchy(layout.nodes);}catch(error){return {supported:false,reason:error.message};}
 if(layout.edges.some(edge=>!terminal(layout,edge,'source')||!terminal(layout,edge,'target')))return {supported:false,reason:'Manual movement requires every native port and connection attachment to be represented explicitly.'};
 return {supported:true,reason:''};
}
export function moveLayoutNode(layout,{id,x,y},options={}) {
 return applyManualPositions(layout,{[id]:{x,y}},options);
}
const translatePoint=(p,delta)=>({...p,x:p.x+delta.x,y:p.y+delta.y});
const cleanEdge=({points,d,labelBox,labelLeader,labelOmitted,routingBlocked,x,y,routePoints,sourceAnchor,targetAnchor,...edge})=>edge;
/** Validate final peer positions together, translate every descendant and native
 * port with its root, and reroute external connections as one attachment batch. */
export function applyManualPositions(layout,positions,options={}) {
 const entries=Object.entries(positions??{}),byID=new Map(layout.nodes.map(n=>[n.id,n])),hierarchy=drawingHierarchy(layout.nodes);
 for(const [id,position]of entries){if(!finite(position))throw new TypeError('Manual coordinates must be finite.');const support=manualLayoutSupport(layout,id,hierarchy);if(!support.supported)throw new Error(support.reason);}
 if(!entries.length)return {...layout,manual:false};
 const deltas=new Map(entries.map(([id,p])=>[id,{x:p.x-byID.get(id).x,y:p.y-byID.get(id).y}])),groups=new Map(),offsets=new Map();
 for(const node of layout.nodes){const root=[node.id,...hierarchy.get(node.id)].find(id=>deltas.has(id));if(root){groups.set(node.id,root);offsets.set(node.id,deltas.get(root));}}
 const nodes=layout.nodes.map(node=>{const delta=offsets.get(node.id);return delta?{...translatePoint(node,delta),...(node.portLabelBox?{portLabelBox:translatePoint(node.portLabelBox,delta)}:{})}:{...node};});
 const finalByID=new Map(nodes.map(node=>[node.id,node]));
 for(const [id]of entries){const node=finalByID.get(id);if(!node.parentId)continue;const parent=finalByID.get(node.parentId),content={x:parent.x,y:parent.y+parent.headerHeight,width:parent.width,height:parent.height-parent.headerHeight};
  const envelopes=nodes.filter(item=>item.id===id||hierarchy.get(item.id).has(id)).flatMap(item=>[item,...(item.portLabelBox?[item.portLabelBox]:[])]);
  if(envelopes.some(box=>![box.x,box.y,box.width,box.height].every(Number.isFinite)||box.x<content.x-.01||box.y<content.y-.01||box.x+box.width>content.x+content.width+.01||box.y+box.height>content.y+content.height+.01))throw new Error('This nested position enters the compound header or leaves its native parent content bounds. Keep the complete group and native port labels inside the container.');
 }
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){
  if(!groups.has(nodes[i].id)&&!groups.has(nodes[j].id))continue;
  if(hierarchy.get(nodes[i].id).has(nodes[j].id)||hierarchy.get(nodes[j].id).has(nodes[i].id))continue;
  if(overlap(nodes[i],nodes[j]))throw new Error('This position overlaps another card or compound group. Choose a clear position.');
 }
 for(const node of nodes)if(node.portLabelBox)for(const other of nodes){
  if(node.id===other.id||(!groups.has(node.id)&&!groups.has(other.id))||groups.has(node.id)&&groups.get(node.id)===groups.get(other.id)||hierarchy.get(node.id).has(other.id))continue;
  if(overlap(node.portLabelBox,other))throw new Error('This position overlaps a native port label with another card. Choose a clear position.');
 }
 const labeled=nodes.filter(node=>node.portLabelBox);
 for(let i=0;i<labeled.length;i++)for(let j=i+1;j<labeled.length;j++){const a=labeled[i],b=labeled[j];if((groups.has(a.id)||groups.has(b.id))&&(!groups.has(a.id)||groups.get(a.id)!==groups.get(b.id))&&overlap(a.portLabelBox,b.portLabelBox))throw new Error('This position overlaps native port labels. Choose a clear position.');}
 const routeNodes=[...nodes,...labeled.map(node=>({...node.portLabelBox,id:'manual-port-label:'+node.id,kind:'drawing-label'}))];
 const adapted=layout.edges.map(edge=>({...cleanEdge(edge),source:terminal(layout,edge,'source'),target:terminal(layout,edge,'target')}));
 const rigid=new Map(),external=[];
 for(let i=0;i<adapted.length;i++){
  const edge=adapted[i],original=layout.edges[i],a=offsets.get(edge.source),b=offsets.get(edge.target);
  if(a&&b&&a.x===b.x&&a.y===b.y&&original.points?.length>=2){
   const translated={...original,points:original.points.map(p=>translatePoint(p,a)),...(original.routePoints?{routePoints:original.routePoints.map(p=>translatePoint(p,a))}:{}),...(original.labelBox?{labelBox:translatePoint(original.labelBox,a),x:(original.x??original.labelBox.x)+a.x,y:(original.y??original.labelBox.y)+a.y}:{}),...(original.labelLeader?{labelLeader:{from:translatePoint(original.labelLeader.from,a),to:translatePoint(original.labelLeader.to,a)}}:{})};
   if(original.d!==undefined)translated.d=translated.points.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' ');
   if(routeIsClear(translated.points,edge,nodes)&&routeConnectsEndpoints(translated.points,edge,nodes)){rigid.set(edge.id,translated);continue;}
  }
  external.push(edge);
 }
 const routed=new Map(routeEdges(external,nodes,{measureLabel:options.measureLabel,area:options.area}).map(e=>[e.id,e])),labels=[];
 const edges=layout.edges.map((original,i)=>{
  const route=rigid.get(original.id)??routed.get(original.id),edge={...original,...route,source:original.source,target:original.target};
  // No obsolete route/label geometry survives a reroute failure.
  if(!rigid.has(original.id)){for(const key of ['labelBox','labelLeader','x','y','routePoints','sourceAnchor','targetAnchor','d'])if(!Object.hasOwn(route??{},key))delete edge[key];}
  if(edge.labelBox){const obstacles=connectionObstacles(adapted[i],routeNodes).filter(n=>![adapted[i].source,adapted[i].target].includes(n.id));if(obstacles.some(n=>overlap(edge.labelBox,n))||labels.some(box=>overlap(edge.labelBox,box))){delete edge.labelBox;delete edge.labelLeader;edge.labelOmitted=true;}else labels.push(edge.labelBox);}
  return edge;
 });
 const ports=layout.ports?.map(port=>{const delta=offsets.get(port.representationId)??offsets.get(port.ownerId)??offsets.get(port.id);return delta?{...translatePoint(port,delta),...(port.portLabelBox?{portLabelBox:translatePoint(port.portLabelBox,delta)}:{})}:{...port};});
 const omissions=[...(layout.omissions??[]).filter(item=>!['route-space','label-space'].includes(item.reason)),...edges.filter(edge=>edge.routingBlocked||edge.labelOmitted).map(edge=>({reason:edge.routingBlocked?'route-space':'label-space',relationshipId:edge.semanticId??edge.id,target:edge.semanticTarget??edge.target}))];
 return {...layout,nodes,edges,...(ports?{ports}:{}),omissions,manual:true};
}
