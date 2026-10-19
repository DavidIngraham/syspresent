/** Disposable ELK geometry over an authoritative native drawing projection.
 * ELK ports added for routing are drawing anchors, never SysML model ports.
 */
import ELK from 'elkjs/lib/elk-api.js';
import {projectView} from './core/index.mjs';
import {graphArea,routeOrthogonal} from './geometry.mjs';
import {edgeLayoutHints} from './notation.mjs';

export const createLayoutEngine = options => new ELK({algorithms:['layered'],...options});
const behavioralKinds=new Set(['action','activity','state']);
const sizes=new Map([['initial',[28,28]],['final',[32,32]],['fork',[80,8]],['join',[80,8]],['decision',[44,44]],['merge',[44,44]],['start',[28,28]],['end',[32,32]]]);
const overlap=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
const segmentHits=(a,b,n)=>a.x===b.x?a.x>n.x+.01&&a.x<n.x+n.width-.01&&Math.max(a.y,b.y)>n.y+.01&&Math.min(a.y,b.y)<n.y+n.height-.01:a.y===b.y&&a.y>n.y+.01&&a.y<n.y+n.height-.01&&Math.max(a.x,b.x)>n.x+.01&&Math.min(a.x,b.x)<n.x+n.width-.01;
const simplify=points=>points.filter((p,i)=>!i||p.x!==points[i-1].x||p.y!==points[i-1].y).filter((p,i,all)=>!i||i===all.length-1||!(all[i-1].x===p.x&&p.x===all[i+1].x||all[i-1].y===p.y&&p.y===all[i+1].y));
const num=(value,fallback)=>Number.isFinite(Number(value))&&Number(value)>0?Number(value):fallback;
function dimensions(node){const symbol=sizes.get(node.kind);return {width:symbol?.[0]??num(node.width,160),height:symbol?.[1]??num(node.height,76)};}
function isPort(node,nodes){return node.kind==='port'&&nodes.has(node.parentId);}
/** Native NodeData.Ports contains rendering pin IDs, not semantic model IDs.
 * Preserve it verbatim; make disposable glyphs only to position the pins.
 */
function projectEmbeddedPorts(view){
 const nodes=[...view.nodes],attachments=new Map(),usedIDs=new Set(nodes.map(n=>n.id));
 for(const owner of view.nodes)for(const port of owner.ports??[]){
  if(typeof port.id!=='string'||!port.id)throw Error('Native embedded port lacks a rendering ID');
  const key=JSON.stringify([owner.id,port.id]);if(attachments.has(key))throw Error('Duplicate native port on '+owner.id+': '+port.id);
  let id='syspresent-native-port:'+key;while(usedIDs.has(id))id+=':';usedIDs.add(id);attachments.set(key,id);
  const name=port.nameSynthesized?'':port.name??'',label=port.type?name+' : '+port.type:name;
  nodes.push({id,kind:'port',name,label,parentId:owner.id,width:12,height:12,semanticId:null,identityStatus:'modeled-pin',nativePortId:port.id,nativePort:structuredClone(port),direction:port.direction,parameter:port.parameter,origin:structuredClone(port.origin??null)});
 }
 const edges=view.edges.map(edge=>{
  const result={...edge};for(const [endpoint,field,attachment]of [['source','fromPort','sourceAttachment'],['target','toPort','targetAttachment']]){
   const pin=edge[field]??edge[field==='fromPort'?'from_port':'to_port'];if(!pin)continue;
   const id=attachments.get(JSON.stringify([edge[endpoint],pin]));if(!id)throw Error('Native connection '+edge.id+' references unavailable port '+pin+' on '+edge[endpoint]);result[attachment]=id;
  }return result;
 });
 return {...view,nodes,edges};
}
function orientation(edge,behavioral,viewKind){return !behavioral&&edgeLayoutHints(edge,{viewKind}).rank==='target-above-source'?[edge.target,edge.source,true]:[edge.source,edge.target,false];}
function partitions(nodes,edges,capacity){
 const ranks=new Map(nodes.map(n=>[n.id,0]));
 // Cyclic dependency sets are not given artificial ordering constraints.
 for(let i=0;i<nodes.length;i++){let changed=false;for(const [a,b] of edges){if(a!==b&&ranks.has(a)&&ranks.has(b)&&ranks.get(b)<=ranks.get(a)){ranks.set(b,ranks.get(a)+1);changed=true;}}if(!changed)break;if(i===nodes.length-1)return null;}
 const groups=new Map();for(const node of nodes){const rank=ranks.get(node.id);if(!groups.has(rank))groups.set(rank,[]);groups.get(rank).push(node);}
 const result=new Map();let row=0;for(const [,group]of [...groups].sort((a,b)=>a[0]-b[0])){group.sort((a,b)=>a.id.localeCompare(b.id));for(let i=0;i<group.length;i++)result.set(group[i].id,row+Math.floor(i/capacity));row+=Math.ceil(group.length/capacity);}
 return result;
}
function makeGraph(view,options,profile){
 const nodes=new Map(view.nodes.map(n=>[n.id,n])),behavioral=behavioralKinds.has(view.kind),actualPorts=new Set(view.nodes.filter(n=>isPort(n,nodes)).map(n=>n.id)),children=new Map(view.nodes.map(n=>[n.id,[]]));
 for(const node of view.nodes)if(node.parentId&&nodes.has(node.parentId)&&!actualPorts.has(node.id))children.get(node.parentId).push(node.id);
 const roots=view.nodes.filter(n=>!actualPorts.has(n.id)&&(!n.parentId||!nodes.has(n.parentId)));
 if(options.grouping==='owner'&&!behavioral)roots.sort((a,b)=>String(a.layoutGroup||a.id).localeCompare(String(b.layoutGroup||b.id))||a.id.localeCompare(b.id));
 const rootOf=id=>{let node=nodes.get(id),seen=new Set();while(node?.parentId&&nodes.has(node.parentId)){if(seen.has(node.id))throw Error('Cyclic native drawing containment');seen.add(node.id);node=nodes.get(node.parentId);}return node?.id;};
 const rows=profile.capacity?partitions(roots,view.edges.filter(e=>edgeLayoutHints(e,{viewKind:view.kind}).rank!=='free').map(e=>{const [a,b]=orientation(e,behavioral,view.kind);return [rootOf(a),rootOf(b)];}),profile.capacity):null;
 const elkNodes=new Map(),anchors=new Map(),edgeMap=new Map(),gap=profile.gap;
 function build(node){
  const {width,height}=dimensions(node),nested=children.get(node.id),result={id:node.id,width,height,children:nested.map(id=>build(nodes.get(id))),ports:[],layoutOptions:{'elk.portConstraints':'FIXED_SIDE','elk.portLabels.placement':'[OUTSIDE]','elk.padding':`[top=${height+20},left=24,bottom=24,right=24]`}};
  if(!nested.length)delete result.children;
  if(rows?.has(node.id))result.layoutOptions['elk.partitioning.partition']=String(rows.get(node.id));
  elkNodes.set(node.id,result);return result;
 }
 const graph={id:'syspresent-layout-root',children:roots.map(build),edges:[],layoutOptions:{
  'elk.algorithm':'layered','elk.direction':'DOWN','elk.edgeRouting':'ORTHOGONAL','elk.hierarchyHandling':'INCLUDE_CHILDREN',
  'elk.randomSeed':'1','elk.padding':'[top=12,left=12,bottom=12,right=12]',
  'elk.spacing.nodeNode':String(gap),'elk.spacing.edgeEdge':'12','elk.spacing.edgeNode':'12','elk.spacing.labelNode':'8','elk.spacing.edgeLabel':'7',
  'elk.layered.spacing.nodeNodeBetweenLayers':String(gap),'elk.layered.spacing.edgeEdgeBetweenLayers':'12','elk.layered.spacing.edgeNodeBetweenLayers':'12',
  'elk.layered.mergeEdges':'false','elk.layered.mergeHierarchyEdges':'false','elk.layered.unnecessaryBendpoints':'true',
  'elk.layered.crossingMinimization.strategy':'LAYER_SWEEP','elk.layered.nodePlacement.strategy':profile.capacity?'SIMPLE':'BRANDES_KOEPF',
  ...(profile.balanced?{'elk.layered.nodePlacement.favorStraightEdges':'false','elk.layered.nodePlacement.bk.fixedAlignment':'BALANCED'}:{}),
  ...(rows?{'elk.partitioning.activate':'true'}:{}),
  ...(options.grouping==='owner'&&!behavioral?{'elk.layered.considerModelOrder.strategy':'NODES_AND_EDGES'}:{})
 }};
 for(const native of view.nodes.filter(n=>actualPorts.has(n.id))){
  const owner=elkNodes.get(native.parentId),incoming=view.edges.find(e=>(e.sourceAttachment??e.source)===native.id||(e.targetAttachment??e.target)===native.id),specified=String(native.portSide??native.side??'').toUpperCase();
  const side=['NORTH','SOUTH','EAST','WEST'].includes(specified)?specified:(incoming?.sourceAttachment??incoming?.source)===native.id?'SOUTH':'NORTH';
  const text=native.label??native.name,label=text?(options.measureLabel?.(text)??{width:String(text).length*6.5,height:16}):null;
  owner.ports.push({id:native.id,width:num(native.width,12),height:num(native.height,12),...(label?{labels:[{id:native.id+':port-label',text,width:num(label.width,1),height:num(label.height,16)}]}:{}),layoutOptions:{'elk.port.side':side,'elk.port.borderOffset':String(-Math.min(num(native.width,12),num(native.height,12))/2)}});
  anchors.set(native.id,{identityStatus:native.semanticId?'actual-model-port':'modeled-pin',semanticId:native.semanticId??null,representationId:native.id,ownerId:native.parentId,...(native.nativePortId?{nativePortId:native.nativePortId,nativePort:structuredClone(native.nativePort)}:{})});
 }
 function anchor(id,edgeId,side,preferredSide){if(actualPorts.has(id))return id;const portId=`syspresent-anchor:${edgeId}:${side}`,owner=elkNodes.get(id);if(!owner)throw Error('Native endpoint has no drawing owner: '+id);
  owner.ports.push({id:portId,width:0,height:0,layoutOptions:{'elk.port.side':preferredSide??(side==='source'?'SOUTH':'NORTH')}});anchors.set(portId,{identityStatus:'drawing-anchor',semanticId:null,representationId:null,ownerId:id});return portId;
 }
 for(const [i,edge]of [...view.edges].sort((a,b)=>a.id.localeCompare(b.id)).entries()){
  const [source,target,reversed]=orientation(edge,behavioral,view.kind),id=`syspresent-edge:${i}`,label=edge.label?options.measureLabel?.(edge.label)??{width:String(edge.label).length*7.2+4,height:16}:null;
  const sourcePin=reversed?edge.targetAttachment:edge.sourceAttachment,targetPin=reversed?edge.sourceAttachment:edge.targetAttachment,sides=profile.anchorSides?.get(edge.id);
  graph.edges.push({id,sources:[anchor(sourcePin??source,id,'source',sides?.[0])],targets:[anchor(targetPin??target,id,'target',sides?.[1])],...(label?{labels:[{id:id+':label',text:edge.label,width:num(label.width,1),height:num(label.height,16)}]}:{})});edgeMap.set(id,{edge,reversed});
 }
 return {graph,nodes,children,actualPorts,anchors,edgeMap};
}
function readLayout(view,data,laid,options,profile){
 const positions=new Map(),routes=new Map(),diagnostics=[],ports=[],nativeRoutes=[];
 function walk(item,ox=0,oy=0){const x=ox+(item.x??0),y=oy+(item.y??0);
  if(data.nodes.has(item.id)){const native=data.nodes.get(item.id);positions.set(item.id,{...native,x,y,width:item.width,height:item.height,...(item.children?.length?{headerHeight:dimensions(native).height}:{} )});}
  for(const port of item.ports??[]){const anchor=data.anchors.get(port.id),position={...anchor,id:port.id,x:x+port.x+port.width/2,y:y+port.y+port.height/2,side:port.layoutOptions?.['elk.port.side']};ports.push(position);
   if(data.actualPorts.has(port.id)){const native=data.nodes.get(port.id),label=port.labels?.[0],portLabelBox=label?{x:x+port.x+label.x,y:y+port.y+label.y,width:label.width,height:label.height}:null;positions.set(port.id,{...native,portSide:port.layoutOptions?.['elk.port.side'],x:x+port.x,y:y+port.y,width:port.width,height:port.height,...(portLabelBox?{portLabelBox}: {})});position.portLabelBox=portLabelBox;}
  }
  for(const edge of item.edges??[])nativeRoutes.push({edge,x,y});
  for(const child of item.children??[])walk(child,x,y);
 }
 walk(laid);
 // ELK keeps cross-hierarchy edge records at the root while their section
 // coordinates name an explicit container. Resolve that frame after all nodes.
 for(const record of nativeRoutes){const {edge}=record,native=data.edgeMap.get(edge.id);if(!native)continue;
  const container=positions.get(edge.container),x=container?.x??record.x,y=container?.y??record.y;
  const points=simplify((edge.sections??[]).flatMap(s=>[s.startPoint,...(s.bendPoints??[]),s.endPoint]).map(p=>({x:p.x+x,y:p.y+y})));
  const label=edge.labels?.[0],labelBox=label?{x:label.x+x,y:label.y+y,width:label.width,height:label.height}:undefined;
  const first=data.anchors.get(edge.sources?.[0]),last=data.anchors.get(edge.targets?.[0]);
  routes.set(native.edge.id,{...native.edge,points:native.reversed?[...points].reverse():points,...(labelBox?{labelBox,x:labelBox.x,y:labelBox.y+labelBox.height*.78}:{}),sourceAnchor:native.reversed?last:first,targetAnchor:native.reversed?first:last,routingEngine:'elk-layered'});
 }
 const nodes=view.nodes.map(n=>positions.get(n.id)).filter(Boolean);
 if(!behavioralKinds.has(view.kind)&&nodes.length<=24&&!nodes.some(n=>n.parentId))optimizeRoutes([...routes.values()],nodes);
 const ancestors=id=>{const result=new Set();let node=data.nodes.get(id);while(node?.parentId&&data.nodes.has(node.parentId)){if(result.has(node.parentId))throw Error('Cyclic native drawing containment');result.add(node.parentId);node=data.nodes.get(node.parentId);}return result;};
 if(nodes.length!==view.nodes.length||nodes.some(n=>![n.x,n.y,n.width,n.height].every(Number.isFinite)))throw Error('ELK returned invalid tile geometry');
 const edges=view.edges.map(native=>{
  const edge=routes.get(native.id)??{...native,points:[]},anc=new Set([...ancestors(native.sourceAttachment??native.source),...ancestors(native.targetAttachment??native.target)]);
  const obstacles=nodes.flatMap(n=>data.children.get(n.id)?.length?anc.has(n.id)?[{...n,height:n.headerHeight}]:[n]:data.actualPorts.has(n.id)&&[native.sourceAttachment??native.source,native.targetAttachment??native.target].includes(n.id)?[]:[n]);
  const blocked=edge.points.length<2||edge.points.some(p=>!Number.isFinite(p.x)||!Number.isFinite(p.y))||edge.points.slice(1).some((point,i)=>obstacles.some(n=>segmentHits(edge.points[i],point,n)));
  if(blocked){diagnostics.push({reason:'unroutable-connection',relationshipId:native.id,message:'No unobstructed native connection route was found.'});edge.points=[];edge.routingBlocked=true;}
  if(edge.labelBox&&(![edge.labelBox.x,edge.labelBox.y,edge.labelBox.width,edge.labelBox.height].every(Number.isFinite)||obstacles.some(n=>overlap(edge.labelBox,n,2)))){delete edge.labelBox;edge.labelOmitted=true;diagnostics.push({reason:'unplaceable-connection-label',relationshipId:native.id});}
  return edge;
 });
 for(let i=0;i<edges.length;i++)for(let j=0;j<i;j++)if(edges[i].labelBox&&edges[j].labelBox&&overlap(edges[i].labelBox,edges[j].labelBox,2)){delete edges[i].labelBox;edges[i].labelOmitted=true;diagnostics.push({reason:'unplaceable-connection-label',relationshipId:edges[i].id});}
 return {...view,nodes,edges,ports,diagnostics,omissions:[...(view.omissions??[]),...diagnostics],bounds:{x:0,y:0,width:laid.width,height:laid.height},layoutEngine:'elk-layered',layoutProfile:(profile.capacity?'responsive-partitions-'+profile.capacity:'layered')+(profile.anchorSides?'-facing-sides':'')+(profile.balanced?'-balanced':''),panels:structuredClone(options.panels??[])};
}
/** Jointly place nodes, choose endpoint order and route/label native edges.
 * Returned coordinates are diagram-local. The caller applies one camera transform
 * to nodes, ports, labels and routes inside its unobstructed measured graph area.
 * Responsive partitions are disposable layout constraints; they add no model edges.
 */
export async function layoutDiagram(nativeView,options={}){
 const {width=1000,height=700,elk}=options;if(!elk?.layout)throw Error('layoutDiagram requires an ELK engine');
 if(!Number.isFinite(width)||width<=0||!Number.isFinite(height)||height<=0)throw Error('Invalid viewport');
 const view=projectEmbeddedPorts(projectView(nativeView)),area=options.panels?.length?graphArea(width,height,options.panels):{width,height};
 if(!view.nodes.length)return {...view,nodes:[],edges:[],ports:[],diagnostics:[],bounds:{x:0,y:0,width:1,height:1},layoutEngine:'elk-layered'};
 const rootCount=view.nodes.filter(n=>!n.parentId).length,behavioral=behavioralKinds.has(view.kind),profiles=[{gap:32}];
 if(!behavioral&&rootCount>2&&area.width<700)for(const capacity of [2,1])profiles.push({gap:28,capacity});
 // A balanced Brandes–Köpf candidate centers a requirement over its fanout.
 // The usual straight-edge bias can otherwise align it over the first child.
 if(!behavioral&&rootCount>=3&&rootCount<=9&&requirementFanout(view))profiles.push({gap:32,balanced:true});
 const candidates=[];
 for(const profile of profiles){try{
   const data=makeGraph(view,options,profile),laid=await elk.layout(data.graph),candidate=readLayout(view,data,laid,options,profile);
   scoreLayout(candidate,area);candidates.push(candidate);
   // Responsive rows can place an intervening sibling between an ancestor and
   // a later row. In that case all-SOUTH/NORTH anchors force a long sweep to
   // the opposite perimeter. Try exterior facing sides chosen from the actual
   // first joint placement, then let ELK solve placement, paths and labels again.
   // Actual native ports remain fixed: these choices affect drawing anchors only.
   // Side constraints may reorder siblings; reassess settled geometry until
   // stable, with a bounded retry count and cycle detection.
   let previous=candidate;const seen=new Set();
   for(let retry=0;!behavioral&&profile.capacity&&retry<3;retry++){
    const anchorSides=facingSides(previous);if(!anchorSides.size)break;
    const key=JSON.stringify([...anchorSides]);if(seen.has(key))break;seen.add(key);
    const alternate={...profile,anchorSides},joint=makeGraph(view,options,alternate),result=readLayout(view,joint,await elk.layout(joint.graph),options,alternate);scoreLayout(result,area);candidates.push(result);previous=result;
   }
  }catch(error){candidates.push({...view,nodes:[],edges:view.edges.map(e=>({...e,points:[],routingBlocked:true})),ports:[],bounds:{x:0,y:0,width:1,height:1},layoutEngine:'elk-layered',layoutScore:1e9,diagnostics:[{reason:'layout-failed',message:error.message}]});}}
 candidates.sort((a,b)=>a.layoutScore-b.layoutScore);if(!candidates.some(candidate=>candidate.nodes.length))throw Error(candidates[0]?.diagnostics[0]?.message??'ELK could not lay out the native diagram');return candidates[0];
}

function requirementFanout(view){
 if(!['requirement','definition','general'].includes(view.kind)||view.nodes.some(n=>n.parentId)||view.edges.length!==view.nodes.length-1)return false;
 const oriented=view.edges.map(edge=>edgeLayoutHints(edge,{viewKind:view.kind}).rank==='target-above-source'?orientation(edge,false,view.kind):null);
 return oriented.every(Boolean)&&oriented.every(([source])=>source===oriented[0][0])&&new Set(oriented.map(([,target])=>target)).size===view.nodes.length-1;
}
function facingSides(view){
 const nodes=new Map(view.nodes.map(n=>[n.id,n])),sides=new Map();
 // Variable-height siblings can share a row without sharing their top y.
 // Count an intervening row by actual rectangle separation, not exact y ranks.
 for(const edge of view.edges){
  if(edgeLayoutHints(edge,{viewKind:view.kind}).rank==='free')continue;
  const [from,to]=orientation(edge,false,view.kind),a=nodes.get(from),b=nodes.get(to);
  if(!a||!b||a.parentId||b.parentId||a.kind==='port'||b.kind==='port')continue;
  if(!view.nodes.some(n=>n!==a&&n!==b&&!n.parentId&&n.y>=a.y+a.height-.01&&n.y+n.height<=b.y+.01))continue;
  const side=b.x+b.width/2<a.x+a.width/2?'WEST':'EAST';sides.set(edge.id,[side,side]);
 }
 return sides;
}
function scoreLayout(candidate,area){
 let length=0,bends=0,stretch=0,crossings=0;
 for(const edge of candidate.edges){const points=edge.points;let route=0;for(let i=1;i<points.length;i++)route+=Math.abs(points[i].x-points[i-1].x)+Math.abs(points[i].y-points[i-1].y);length+=route;bends+=Math.max(0,points.length-2);if(points.length>1){const direct=Math.abs(points[0].x-points.at(-1).x)+Math.abs(points[0].y-points.at(-1).y);stretch+=Math.max(0,route/Math.max(1,direct)-1);}}
 for(let i=0;i<candidate.edges.length;i++)for(let j=0;j<i;j++){
  const a=candidate.edges[i].points,b=candidate.edges[j].points;
  for(let ai=1;ai<a.length;ai++)for(let bi=1;bi<b.length;bi++){
   const aa=a[ai-1],ab=a[ai],ba=b[bi-1],bb=b[bi],horizontal=aa.y===ab.y,otherHorizontal=ba.y===bb.y;if(horizontal===otherHorizontal)continue;
   const h=horizontal?[aa,ab]:[ba,bb],v=horizontal?[ba,bb]:[aa,ab];
   if(v[0].x>Math.min(h[0].x,h[1].x)+.01&&v[0].x<Math.max(h[0].x,h[1].x)-.01&&h[0].y>Math.min(v[0].y,v[1].y)+.01&&h[0].y<Math.max(v[0].y,v[1].y)-.01)crossings++;
  }
 }
 const occupied=[...candidate.nodes,...candidate.edges.flatMap(e=>[...(e.labelBox?[e.labelBox]:[]),...e.points.map(p=>({...p,width:0,height:0}))])],minX=Math.min(...occupied.map(n=>n.x)),minY=Math.min(...occupied.map(n=>n.y)),maxX=Math.max(...occupied.map(n=>n.x+n.width)),maxY=Math.max(...occupied.map(n=>n.y+n.height));
 candidate.bounds={x:minX,y:minY,width:maxX-minX,height:maxY-minY};
 const scale=Math.min(1,area.width/(candidate.bounds.width+20),area.height/(candidate.bounds.height+20));candidate.layoutFitScale=scale;
 const extent=candidate.nodes.reduce((sum,n)=>sum+n.width+n.height,0);
 candidate.layoutMetrics={pathLength:length,bends,pathStretch:stretch,crossings};
 // A marginally larger camera fit must not win by crossing independent links.
 candidate.layoutScore=candidate.diagnostics.length*10000+3/Math.max(.01,scale)+length/Math.max(1,extent)*.45+stretch*.3+bends*.05+crossings*.6+(candidate.bounds.width*candidate.bounds.height)/1e8;
}

/** Keep ELK's terminal identities and label reservations, but discard needless
 * label-layer stair steps. This flat structural optimization never changes
 * behavior order, compound frames, real ports, or the settled node positions.
 */
function optimizeRoutes(edges,nodes){
 const inflated=(n,padding)=>({x:n.x-padding,y:n.y-padding,width:n.width+padding*2,height:n.height+padding*2});
 const tileObstacles=nodes.map(n=>inflated(n,4)),settled=[];
 for(const edge of [...edges].sort((a,b)=>String(a.id).localeCompare(String(b.id)))){
  const original=edge.points;if(original.length<2)continue;
  const obstacles=[...tileObstacles,...edges.flatMap(other=>other!==edge&&other.labelBox?[inflated(other.labelBox,3)]:[])];
  const start=original[0],end=original.at(-1),normal=(from,to)=>({x:Math.sign(to.x-from.x),y:Math.sign(to.y-from.y)}),a=normal(start,original[1]),b=normal(end,original.at(-2));
  if(a.x&&a.y||b.x&&b.y)continue;
  const stub={x:start.x+a.x*8,y:start.y+a.y*8},finish={x:end.x+b.x*8,y:end.y+b.y*8};
  const middle=routeOrthogonal(stub,finish,obstacles,{bendPenalty:24,segmentCost:(from,to)=>{
   let cost=0;
   for(const points of settled)for(let i=1;i<points.length;i++){
    const a=points[i-1],b=points[i];
    if(from.y===to.y&&a.y===b.y&&from.y===a.y)cost+=Math.max(0,Math.min(Math.max(from.x,to.x),Math.max(a.x,b.x))-Math.max(Math.min(from.x,to.x),Math.min(a.x,b.x)))*4;
    else if(from.x===to.x&&a.x===b.x&&from.x===a.x)cost+=Math.max(0,Math.min(Math.max(from.y,to.y),Math.max(a.y,b.y))-Math.max(Math.min(from.y,to.y),Math.min(a.y,b.y)))*4;
    else {const h=from.y===to.y?[from,to]:[a,b],v=from.x===to.x?[from,to]:[a,b];if(h[0].y===h[1].y&&v[0].x===v[1].x&&v[0].x>Math.min(h[0].x,h[1].x)&&v[0].x<Math.max(h[0].x,h[1].x)&&h[0].y>Math.min(v[0].y,v[1].y)&&h[0].y<Math.max(v[0].y,v[1].y))cost+=80;}
   }return cost;
  }});
  if(middle){const points=simplify([start,...middle,end]),length=ps=>ps.slice(1).reduce((sum,p,i)=>sum+Math.abs(p.x-ps[i].x)+Math.abs(p.y-ps[i].y),0);if(length(points)+Math.max(0,points.length-2)*24<length(original)+Math.max(0,original.length-2)*24)edge.points=points;}
  // An edge may move its own label, but other labels stay hard obstacles.
  // Restore its original valid route if no readable adjacent label slot exists.
  if(!relocateLabels([edge],nodes,edges))edge.points=original;
  settled.push(edge.points);
 }
}

function relocateLabels(edges,nodes,allEdges=edges){
 const distance=(box,points)=>{const center={x:box.x+box.width/2,y:box.y+box.height/2};return Math.min(...points.slice(1).map((b,i)=>{const a=points[i];return a.x===b.x?Math.hypot(center.x-a.x,center.y-Math.max(Math.min(a.y,b.y),Math.min(Math.max(a.y,b.y),center.y))):Math.hypot(center.y-a.y,center.x-Math.max(Math.min(a.x,b.x),Math.min(Math.max(a.x,b.x),center.x)));}));};
 for(const edge of edges){
  const box=edge.labelBox;if(!box)continue;
  const crossed=edge.points.slice(1).some((p,i)=>segmentHits(edge.points[i],p,box));
  const left=Math.min(...nodes.map(n=>n.x)),right=Math.max(...nodes.map(n=>n.x+n.width));
  if(!crossed&&box.x>=left&&box.x+box.width<=right&&distance(box,edge.points)<Math.max(box.width,box.height)/2+12)continue;
  const candidates=[];
  for(let i=1;i<edge.points.length;i++){
   const a=edge.points[i-1],b=edge.points[i],length=Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
   for(const t of [.5,.25,.75]){const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;if(a.y===b.y)candidates.push({...box,x:x-box.width/2,y:y-box.height-5,score:length},{...box,x:x-box.width/2,y:y+5,score:length-1});else candidates.push({...box,x:x+5,y:y-box.height/2,score:length},{...box,x:x-box.width-5,y:y-box.height/2,score:length-1});}
  }
  // Favor local label slots over widening the whole diagram for a long outer leg.
  const labelScore=candidate=>candidate.score-12*(Math.max(0,left-candidate.x)+Math.max(0,candidate.x+candidate.width-right));
  const replacement=candidates.sort((a,b)=>labelScore(b)-labelScore(a)).find(candidate=>!nodes.some(n=>overlap(candidate,n,3))&&!allEdges.some(other=>other!==edge&&other.labelBox&&overlap(candidate,other.labelBox,4))&&!allEdges.some(other=>other.points.slice(1).some((p,i)=>segmentHits(other.points[i],p,{x:candidate.x-2,y:candidate.y-2,width:candidate.width+4,height:candidate.height+4}))));
  if(replacement){delete replacement.score;edge.labelBox=replacement;edge.x=replacement.x;edge.y=replacement.y+replacement.height*.78;}else return false;
 }
 return true;
}
