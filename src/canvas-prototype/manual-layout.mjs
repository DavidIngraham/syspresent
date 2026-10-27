/** Session-local drawing geometry. Positions never become SysML properties. */
import {routeEdges} from './geometry.mjs';
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const finite=position=>position&&Number.isFinite(position.x)&&Number.isFinite(position.y);
/** Persist only in this workspace session. The caller owns view keys and clears
 * them when source, viewport geometry or representation membership changes. */
export function createManualLayout() {
 const views=new Map();
 return {
  get(key){return structuredClone(views.get(key)??{});},
  set(key,id,position){if(typeof key!=='string'||!key||typeof id!=='string'||!id||!finite(position))throw new TypeError('Manual placement needs a view key, representation ID and finite coordinates.');const positions=views.get(key)??Object.create(null);positions[id]={x:position.x,y:position.y};views.set(key,positions);},
  clear(key){if(key===undefined)views.clear();else views.delete(key);},
 };
}
/** First slice supports flat structural cards. Reject compound/port/behavior
 * drawings rather than detach native pins or alter behavioral arrangement. */
export function manualLayoutSupport(layout,id) {
 const node=layout.nodes?.find(item=>item.id===id);
 if(!node)return {supported:false,reason:'The selected representation is not in this drawing.'};
 if(['action','activity','sequence','state','fault-tree','mixed'].includes(layout.view?.kind??layout.kind))return {supported:false,reason:'Manual movement of this behavioral notation is not supported.'};
 if(node.context||node.kind==='context-boundary'||!node.semanticId)return {supported:false,reason:'Choose an active native element.'};
 if(layout.nodes.some(item=>item.parentId||item.container||item.kind==='port'||item.ports?.length)||layout.edges.some(edge=>edge.sourceAttachment||edge.targetAttachment||edge.fromPort||edge.toPort))return {supported:false,reason:'Manual movement of compound or native-port drawings is not supported yet.'};
 return {supported:true,reason:''};
}
/** Move only the requested card, reroute the batch against every stationary card,
 * and disclose unavailable routes. Input objects and native identities stay intact.
 * Coordinates use the same prepared world as layout nodes, before camera transform. */
export function moveLayoutNode(layout,{id,x,y},options={}) {
 return applyManualPositions(layout,{[id]:{x,y}},options);
}
/** Apply the final arrangement together. Valid final positions must not be rejected
 * merely because a moved peer still occupies its automatic starting position. */
export function applyManualPositions(layout,positions,options={}) {
 const entries=Object.entries(positions??{});
 for(const [id,position]of entries){if(!finite(position))throw new TypeError('Manual coordinates must be finite.');const support=manualLayoutSupport(layout,id);if(!support.supported)throw new Error(support.reason);}
 const moved=new Set(entries.map(([id])=>id));
 const nodes=layout.nodes.map(node=>({...node,...(moved.has(node.id)?{x:positions[node.id].x,y:positions[node.id].y}:{})}));
 for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++)if((moved.has(nodes[i].id)||moved.has(nodes[j].id))&&overlap(nodes[i],nodes[j]))throw new Error('This position overlaps another card. Choose a clear position.');
 // Discard old drawing geometry before routing; an omitted new label must not
 // retain the former label box or leader. Native metadata remains unchanged.
 const clean=layout.edges.map(({points,d,labelBox,labelLeader,labelOmitted,routingBlocked,x,y,routePoints,sourceAnchor,targetAnchor,...edge})=>edge);
 const edges=routeEdges(clean,nodes,{measureLabel:options.measureLabel,area:options.area});
 const omissions=[...(layout.omissions??[]).filter(item=>!['route-space','label-space'].includes(item.reason)),...edges.filter(edge=>edge.routingBlocked||edge.labelOmitted).map(edge=>({reason:edge.routingBlocked?'route-space':'label-space',relationshipId:edge.semanticId??edge.id,target:edge.semanticTarget??edge.target}))];
 return {...layout,nodes,edges,omissions,manual:true};
}
