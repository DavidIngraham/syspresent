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
const behavioralViews=new Set(['action','activity','state','fault-tree','mixed']);
// These are native notation kinds, not names or descriptions.
const actionKinds=new Set(['action','action def','accept','send','perform action']);
const stateKinds=new Set(['state','state def','region','exhibit state']);
const faultKinds=new Set(['event','basic event','house event','undeveloped event','AND','OR']);
const controls=new Set(['start','initial','final','end','terminate','terminate action','fork','join','decision','merge','choice','junction','shallow history','deep history','shallow-history','deep-history']);
const behavioralNode=node=>actionKinds.has(node?.kind)||stateKinds.has(node?.kind)||faultKinds.has(node?.kind)||controls.has(node?.kind);
function drawingHierarchy(nodes){const byID=new Map(nodes.map(n=>[n.id,n])),result=new Map();for(const id of byID.keys()){const seen=new Set([id]),ancestors=new Set();let node=byID.get(id);while(node?.parentId){if(seen.has(node.parentId))throw Error('Cyclic native drawing containment is unsupported.');seen.add(node.parentId);ancestors.add(node.parentId);node=byID.get(node.parentId);}result.set(id,ancestors);}return result;}
function terminal(layout,edge,side){
 const attachment=edge[side+'Attachment'];if(attachment)return layout.nodes.find(n=>n.id===attachment)?.id;
 const port=edge[side==='source'?'fromPort':'toPort'];if(port){const matches=layout.nodes.filter(n=>n.parentId===edge[side]&&[n.id,n.nativePortId,n.semanticId].includes(port));return matches.length===1?matches[0].id:undefined;}
 return layout.nodes.find(n=>n.id===edge[side])?.id;
}
function movementPolicy(layout,node,hierarchy){
 const viewKind=layout.view?.kind??layout.kind,byID=new Map(layout.nodes.map(item=>[item.id,item]));
 const ancestors=[...(hierarchy.get(node.id)??[])].map(id=>byID.get(id)),group=new Set(layout.nodes.filter(item=>item.id===node.id||hierarchy.get(item.id).has(node.id)).map(item=>item.id));
 const actionContext=['action','activity'].includes(viewKind)||ancestors.some(item=>actionKinds.has(item?.kind));
 const stateContext=viewKind==='state'||ancestors.some(item=>stateKinds.has(item?.kind));
 const boundary=kind=>layout.edges.some(edge=>kind(edge)&&group.has(terminal(layout,edge,'source'))!==group.has(terminal(layout,edge,'target')));
 const hasActions=actionKinds.has(node.kind)||layout.nodes.some(item=>group.has(item.id)&&actionKinds.has(item.kind));
 const hasFaults=faultKinds.has(node.kind)||layout.nodes.some(item=>group.has(item.id)&&faultKinds.has(item.kind));
 if(behavioralViews.has(viewKind)&&!node.kind)return {supported:false,reason:'The native behavioral node role is unavailable; keep automatic layout.'};
 if(controls.has(node.kind)){
  if(stateContext&&!actionContext)return {supported:true,constraint:'free',notice:'State topology is retained; position does not assert transition order or elapsed time.'};
  if(actionContext||layout.edges.some(edge=>edge.kind==='succession'&&[edge.source,edge.target].includes(node.id)))return {supported:true,constraint:'horizontal',notice:'Move horizontally to preserve this drawing’s established action reading layers; native succession and concurrency stay fixed.'};
  return {supported:false,reason:'The native behavioral control context is unavailable; move its owning container instead.'};
 }
 if(faultKinds.has(node.kind))return {supported:true,constraint:'horizontal',notice:'Move horizontally to preserve this drawing’s established cause/effect reading layers; native gate kind and causal direction stay fixed.'};
 if(actionKinds.has(node.kind)||actionContext){
  if(group.size>1&&!boundary(edge=>edge.kind==='succession'))return {supported:true,constraint:'rigid',notice:'The complete action container and its native controls move rigidly; internal order and concurrency stay fixed.'};
  return {supported:true,constraint:'horizontal',notice:'Move horizontally to preserve this drawing’s established action reading layers; native succession and concurrency stay fixed.'};
 }
 if(hasActions&&boundary(edge=>edge.kind==='succession')||hasFaults&&boundary(edge=>edge.kind==='connection'))return {supported:true,constraint:'horizontal',notice:'External native behavioral links constrain this group to its established drawing reading layer.'};
 if(stateKinds.has(node.kind)||stateContext)return {supported:true,constraint:group.size>1?'rigid':'free',notice:'State topology and actual boundaries are retained; position does not assert transition order or elapsed time.'};
 return {supported:true,constraint:group.size>1?'rigid':'free',notice:''};
}
/** Native action/fault layers, state topology and real parent boundaries constrain
 * gestures. Synthetic controls and native ports move only with their container. */
export function manualLayoutSupport(layout,id,hierarchy) {
 const node=layout.nodes?.find(item=>item.id===id);
 if(!node)return {supported:false,reason:'The selected representation is not in this drawing.'};
 if((layout.view?.kind??layout.kind)==='sequence')return {supported:false,reason:'Sequence movement needs the dedicated participant/message ordering geometry. Generic graph placement cannot change participant order, message order or imply elapsed time.'};
 if(node.context||node.kind==='context-boundary'||node.kind==='port'||!node.semanticId)return {supported:false,reason:controls.has(node.kind)?'Synthetic behavioral controls move only with their owning native container.':'Choose an active native element, not a port or synthetic representation.'};
 if(node.parentId){const parent=layout.nodes.find(n=>n.id===node.parentId);if(!parent||![parent.x,parent.y,parent.width,parent.height,parent.headerHeight].every(Number.isFinite)||parent.width<=0||parent.headerHeight<=0||parent.height<=parent.headerHeight)return {supported:false,reason:'Nested movement requires native compound parent content bounds including header height. Keep automatic layout for this drawing.'};}
 try{hierarchy??=drawingHierarchy(layout.nodes);}catch(error){return {supported:false,reason:error.message};}
 if(layout.edges.some(edge=>!terminal(layout,edge,'source')||!terminal(layout,edge,'target')))return {supported:false,reason:'Manual movement requires every native port and connection attachment to be represented explicitly.'};
 return {reason:'',...movementPolicy(layout,node,hierarchy)};
}
/** Coverage is reported per actual representation, including explicit reasons. */
export function manualLayoutCoverage(layout){return (layout.nodes??[]).map(node=>({representationId:node.id,semanticId:node.semanticId??null,kind:node.kind??null,parentId:node.parentId??null,...manualLayoutSupport(layout,node.id)}));}

export function moveLayoutNode(layout,{id,x,y},options={}) {
 return applyManualPositions(layout,{[id]:{x,y}},options);
}
const translatePoint=(p,delta)=>({...p,x:p.x+delta.x,y:p.y+delta.y});
const cleanEdge=({points,d,labelBox,labelLeader,labelOmitted,routingBlocked,x,y,routePoints,sourceAnchor,targetAnchor,...edge})=>edge;
/** Recover a native behavioral label beside its exact rerouted path. Native
 * ancestor bodies are traversable content regions; their headers remain obstacles.
 * No guard/expression text is interpreted here. */
function recoverBehaviorLabel(edge,original,adapted,nodes,labels,area){
 if(!original.labelBox||!edge.points?.length)return null;
 const {width,height}=original.labelBox,candidates=[{...original.labelBox}];
 for(let i=1;i<edge.points.length;i++){
  const a=edge.points[i-1],b=edge.points[i];for(const t of [.5,.25,.75]){const p={x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t};if(a.y===b.y)candidates.push({x:p.x-width/2,y:p.y-height-4,width,height},{x:p.x-width/2,y:p.y+4,width,height});else candidates.push({x:p.x+5,y:p.y-height/2,width,height},{x:p.x-width-5,y:p.y-height/2,width,height});}
 }
 const obstacles=connectionObstacles(adapted,nodes),labelNodes=labels.map((box,i)=>({...box,id:'manual-reserved-label:'+i}));
 for(const box of candidates){
  if(area&&(box.x<area.x||box.y<area.y||box.x+width>area.x+area.width||box.y+height>area.y+area.height)||obstacles.some(node=>overlap(box,node))||labels.some(other=>overlap(box,other)))continue;
  if(!routeIsClear(edge.points,adapted,[...nodes,{...box,id:'manual-candidate-label'}]))continue;
  const from={x:box.x+width/2,y:box.y+height/2},targets=[];
  for(let i=1;i<edge.points.length;i++){const a=edge.points[i-1],b=edge.points[i];targets.push(a,b,a.x===b.x?{x:a.x,y:Math.max(Math.min(a.y,b.y),Math.min(Math.max(a.y,b.y),from.y))}:{x:Math.max(Math.min(a.x,b.x),Math.min(Math.max(a.x,b.x),from.x)),y:a.y});}
  targets.sort((a,b)=>Math.hypot(a.x-from.x,a.y-from.y)-Math.hypot(b.x-from.x,b.y-from.y));
  const to=targets.find(target=>routeIsClear([from,target],adapted,[...nodes,...labelNodes]));
  if(to)return {labelBox:box,labelLeader:{from,to},labelOmitted:false,x:box.x,y:box.y+height*.78};
 }
 return null;
}
/** Validate final peer positions together, translate every descendant and native
 * port with its root, and reroute external connections as one attachment batch. */
export function applyManualPositions(layout,positions,options={}) {
 const entries=Object.entries(positions??{}),byID=new Map(layout.nodes.map(n=>[n.id,n])),hierarchy=drawingHierarchy(layout.nodes),policies=new Map();
 for(const [id,position]of entries){if(!finite(position))throw new TypeError('Manual coordinates must be finite.');const support=manualLayoutSupport(layout,id,hierarchy);if(!support.supported)throw new Error(support.reason);policies.set(id,support);}
 if(!entries.length)return {...layout,manual:false};
 const deltas=new Map(entries.map(([id,p])=>[id,{x:p.x-byID.get(id).x,y:p.y-byID.get(id).y}])),groups=new Map(),offsets=new Map();
 for(const node of layout.nodes){const root=[node.id,...hierarchy.get(node.id)].find(id=>deltas.has(id));if(root){groups.set(node.id,root);offsets.set(node.id,deltas.get(root));}}
 const nodes=layout.nodes.map(node=>{const delta=offsets.get(node.id);return delta?{...translatePoint(node,delta),...(node.portLabelBox?{portLabelBox:translatePoint(node.portLabelBox,delta)}:{})}:{...node};});
 const finalByID=new Map(nodes.map(node=>[node.id,node]));
 for(const [id]of entries)if(policies.get(id).constraint==='horizontal'){
  const node=byID.get(id),delta=offsets.get(id),parentDelta=offsets.get(node.parentId)??{x:0,y:0};
  if(Math.abs(delta.y-parentDelta.y)>.01)throw new Error('This behavioral construct moves only horizontally to preserve the drawing’s established reading layer. Move the complete owning container to translate that layer; this is not a modeled time axis.');
 }
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
  const edge=adapted[i],original=layout.edges[i],a=offsets.get(edge.source)??{x:0,y:0},b=offsets.get(edge.target)??{x:0,y:0};
  if(a.x===b.x&&a.y===b.y&&original.points?.length>=2){
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
  if(edge.label&&!edge.labelBox&&!edge.routingBlocked&&(['succession','transition'].includes(original.kind)||[original.source,original.target].some(id=>behavioralNode(byID.get(id))))){const recovered=recoverBehaviorLabel(edge,original,adapted[i],routeNodes,labels,options.area);if(recovered)Object.assign(edge,recovered);}
  if(edge.labelBox){const obstacles=connectionObstacles(adapted[i],routeNodes).filter(n=>![adapted[i].source,adapted[i].target].includes(n.id));if(obstacles.some(n=>overlap(edge.labelBox,n))||labels.some(box=>overlap(edge.labelBox,box))){delete edge.labelBox;delete edge.labelLeader;edge.labelOmitted=true;}else labels.push(edge.labelBox);}
  return edge;
 });
 for(let i=0;i<edges.length;i++){
  const original=layout.edges[i],edge=edges[i],behavioral=['succession','transition'].includes(original.kind)||[original.source,original.target].some(id=>behavioralNode(byID.get(id)));
  if(!behavioral)continue;
  if(original.points?.length>=2&&!original.routingBlocked&&(edge.routingBlocked||!edge.points?.length))throw new Error('This movement leaves a native behavioral connection without a safe route. Choose a different position or keep automatic layout.');
  if(original.label&&original.labelBox&&!original.labelOmitted&&!edge.labelBox)throw new Error('This movement leaves a native behavioral relationship label without clear space. Native labels and guards must remain visible.');
 }
 const ports=layout.ports?.map(port=>{const delta=offsets.get(port.representationId)??offsets.get(port.ownerId)??offsets.get(port.id);return delta?{...translatePoint(port,delta),...(port.portLabelBox?{portLabelBox:translatePoint(port.portLabelBox,delta)}:{})}:{...port};});
 const omissions=[...(layout.omissions??[]).filter(item=>!['route-space','label-space'].includes(item.reason)),...edges.filter(edge=>edge.routingBlocked||edge.labelOmitted).map(edge=>({reason:edge.routingBlocked?'route-space':'label-space',relationshipId:edge.semanticId??edge.id,target:edge.semanticTarget??edge.target}))];
 return {...layout,nodes,edges,...(ports?{ports}:{}),omissions,manual:true};
}
