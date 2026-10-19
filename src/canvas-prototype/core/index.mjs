/** Focused canvas prototype. Native typed relationships are the only semantic authority.
 * Geometry is disposable; semantic identities and native payloads remain unchanged.
 */
const copy = value => structuredClone(value);
export const ENGINEERING_RELATIONSHIPS = Object.freeze([
  'derive','derivation','refine','refinement','satisfy','satisfaction','verify','verification',
  'allocate','allocation','dependency','composition','reference','connection','flow',
  'item-flow','control-flow','causation'
]);
const FORBIDDEN_SHORTCUTS = new Set(['type','typing','specialization','owner','owningMembership','ownedMembership','documentation','membership']);
const endpoint = (edge, side) => side === 'source'
  ? edge.source ?? edge.fromId ?? edge.from_id ?? edge.from : edge.target ?? edge.toId ?? edge.to_id ?? edge.to;
const nativeEdges = graph => (graph.relationships ?? []).map(edge => ({...edge,source:endpoint(edge,'source'),target:endpoint(edge,'target')}));
const allowedKinds = options => new Set((options.relationshipKinds ?? ENGINEERING_RELATIONSHIPS).filter(kind=>!FORBIDDEN_SHORTCUTS.has(kind)));
function graphPolicy(graph, options) {
  const elements = new Map((graph.elements ?? []).map(element=>[element.id,element]));
  const scope = options.scopeIds ? new Set([...options.scopeIds,...(options.includedIds ?? [])]) : null;
  const explicit = new Set(options.includedIds ?? []);
  const allowedElement = id => {
    const element=elements.get(id);
    if(!element) return 'unavailable';
    if(scope && !scope.has(id)) return 'outside-scope';
    if((element.layer==='metamodel' || element.metamodel===true) && !explicit.has(id)) return 'metamodel-boundary';
    return null;
  };
  return {elements,edges:nativeEdges(graph),kinds:allowedKinds(options),allowedElement};
}
/** Return bounded engineering context. Omitted context is never presented as absent. */
export function engineeringContext(graph, options={}) {
  const {focus,depth=1,budget=24}=options;
  if(!Number.isInteger(depth)||depth<0 || !Number.isInteger(budget)||budget<1) throw new Error('Invalid context depth or budget');
  const policy=graphPolicy(graph,options), wanted=new Set(), omissions=[], seenOmissions=new Set();
  const omit=(edge,target,reason)=>{const key=`${edge?.id}:${target}:${reason}`;if(!seenOmissions.has(key)){seenOmissions.add(key);omissions.push({relationshipId:edge?.id ?? null,target,reason});}};
  const rootReason=policy.allowedElement(focus);
  if(rootReason){omit(null,focus,rootReason);return {elements:[],relationships:[],omissions};}
  wanted.add(focus);const queue=[[focus,0]];
  while(queue.length){
    const [id,distance]=queue.shift();
    for(const edge of policy.edges){
      if(edge.source!==id && edge.target!==id)continue;
      const target=edge.source===id ? edge.target : edge.source;
      if(!policy.kinds.has(edge.kind)){omit(edge,target,'relationship-policy');continue;}
      const reason=policy.allowedElement(target);if(reason){omit(edge,target,reason);continue;}
      if(wanted.has(target))continue;
      if(distance>=depth){omit(edge,target,'depth');continue;}
      if(wanted.size>=budget){omit(edge,target,'budget');continue;}
      wanted.add(target);queue.push([target,distance+1]);
    }
  }
  return copy({elements:[...wanted].map(id=>policy.elements.get(id)),relationships:policy.edges.filter(edge=>policy.kinds.has(edge.kind)&&wanted.has(edge.source)&&wanted.has(edge.target)),omissions});
}
/** Bidirectional graph navigation preserves the direction of every native edge. */
export function findEngineeringRoute(graph, options={}) {
  const {from,to,maxHops=12}=options, policy=graphPolicy(graph,options), omissions=[];
  for(const id of [from,to]){const reason=policy.allowedElement(id);if(reason)return {found:false,elements:[],relationships:[],omissions:[{target:id,reason}]};}
  const visited=new Set([from]), queue=[{id:from,path:[from],edges:[]}];
  while(queue.length){
    const current=queue.shift();
    if(current.id===to)return copy({found:true,elements:current.path.map(id=>policy.elements.get(id)),relationships:current.edges,omissions});
    for(const edge of policy.edges){
      if(edge.source!==current.id && edge.target!==current.id)continue;
      const target=edge.source===current.id?edge.target:edge.source;
      const reason=!policy.kinds.has(edge.kind)?'relationship-policy':policy.allowedElement(target);
      if(reason){omissions.push({relationshipId:edge.id,target,reason});continue;}
      if(visited.has(target))continue;
      if(current.edges.length>=maxHops){omissions.push({relationshipId:edge.id,target,reason:'hop-limit'});continue;}
      visited.add(target);queue.push({id:target,path:[...current.path,target],edges:[...current.edges,edge]});
    }
  }
  return copy({found:false,elements:[],relationships:[],omissions});
}
/** Explicit one-hop typing bridge; never part of route search or recursive traversal. */
export function directTypingContext(graph, id) {
  const elements=new Map((graph.elements ?? []).map(element=>[element.id,element]));
  const relationships=nativeEdges(graph).filter(edge=>['type','typing'].includes(edge.kind)&&(edge.source===id||edge.target===id));
  const ids=new Set([id]);for(const edge of relationships){ids.add(edge.source);ids.add(edge.target);}
  return copy({elements:[...ids].filter(key=>elements.has(key)).map(key=>elements.get(key)),relationships});
}
/** Adapt only drawing IDs and explicit semantic IDs; never guess identity from a label. */
export function projectView(view) {
  const nodes=(view.nodes ?? []).map(node=>({...copy(node),id:node.id,semanticId:node.semanticId ?? node.semantic_id ?? null,parentId:node.parentId ?? node.parent ?? null}));
  if(nodes.some(node=>typeof node.id!=='string'))throw new Error('Native drawing node lacks a representation ID');
  if(new Set(nodes.map(node=>node.id)).size!==nodes.length)throw new Error('Duplicate representation ID');
  const nodeIds=new Set(nodes.map(node=>node.id));
  const edges=(view.edges ?? []).map((edge,index)=>({...copy(edge),id:edge.id ?? `${view.id ?? 'view'}:edge:${index}`,source:endpoint(edge,'source'),target:endpoint(edge,'target')}));
  if(edges.some(edge=>!nodeIds.has(edge.source)||!nodeIds.has(edge.target)))throw new Error('Native edge references an unavailable drawing node');
  return {...copy(view),nodes,edges};
}
const intersects=(a,b,gap=0)=>a.x<b.x+b.width+gap&&a.x+a.width+gap>b.x&&a.y<b.y+b.height+gap&&a.y+a.height+gap>b.y;
function topologicalRanks(ids, edges) {
  // Tarjan condensation keeps cycles together rather than fabricating a flow order.
  let sequence=0;const stack=[],active=new Set(),low=new Map(),indices=new Map(),groups=[];
  const next=new Map(ids.map(id=>[id,[]]));for(const [a,b]of edges)if(a!==b && next.has(a)&&next.has(b))next.get(a).push(b);
  function visit(id){indices.set(id,sequence);low.set(id,sequence++);stack.push(id);active.add(id);
    for(const target of next.get(id)){if(!indices.has(target)){visit(target);low.set(id,Math.min(low.get(id),low.get(target)));}else if(active.has(target))low.set(id,Math.min(low.get(id),indices.get(target)));}
    if(low.get(id)===indices.get(id)){const group=[];let item;do{item=stack.pop();active.delete(item);group.push(item);}while(item!==id);groups.push(group);}
  }
  for(const id of ids)if(!indices.has(id))visit(id);
  const membership=new Map(groups.flatMap((group,index)=>group.map(id=>[id,index]))),rank=new Map(groups.map((_,index)=>[index,0]));
  for(let pass=0;pass<groups.length;pass++){let changed=false;for(const [a,b]of edges){const x=membership.get(a),y=membership.get(b);if(x!==y&&x!==undefined&&y!==undefined&&rank.get(y)<rank.get(x)+1){rank.set(y,rank.get(x)+1);changed=true;}}if(!changed)break;}
  return new Map(ids.map(id=>[id,rank.get(membership.get(id))]));
}
/** Small-scene reflow. DOM code supplies measured prose rectangles and optional node sizes.
 * Nested nodes remain inside their native parent. Insufficient space is explicit overflow,
 * never silent clipping or unreadable scaling. Edges retain native direction and detail.
 */
export function layoutScene(nativeView, options={}) {
  const {width=1000,height=700,padding=20,gap=24,panels=[]}=options;
  if(!Number.isFinite(width)||width<=0||!Number.isFinite(height)||height<=0)throw new Error('Invalid viewport');
  const view=projectView(nativeView), nodeMap=new Map(view.nodes.map(node=>[node.id,node])), omissions=[];
  const children=new Map(view.nodes.map(node=>[node.id,[]]));
  for(const node of view.nodes)if(node.parentId && nodeMap.has(node.parentId))children.get(node.parentId).push(node.id);
  const roots=view.nodes.filter(node=>!node.parentId||!nodeMap.has(node.parentId));
  const sizes=new Map(), visiting=new Set(), childPlacements=new Map();
  // The author supplies measured panel rectangles. Estimate the available upper
  // canvas stripe for child wrapping; final placement checks every rectangle.
  let intervals=[[padding,width-padding]];
  for(const panel of panels.filter(panel=>panel.y<=padding+76&&panel.y+panel.height>padding)){
    intervals=intervals.flatMap(([left,right])=>panel.x>=right||panel.x+panel.width<=left?[[left,right]]:[[left,Math.min(right,panel.x-gap)],[Math.max(left,panel.x+panel.width+gap),right]].filter(([a,b])=>b>a));
  }
  const contentWidth=Math.max(160,...intervals.map(([a,b])=>b-a));
  const controlSizes=new Map([['initial',[28,28]],['final',[32,32]],['fork',[80,24]],['join',[80,24]],['decision',[44,44]],['merge',[44,44]],['start',[28,28]],['end',[32,32]]]);
  const flowKinds=new Set(['succession','control-flow','transition','flow']);
  function directChildOf(id,parent){let child=nodeMap.get(id),count=0;while(child?.parentId&&child.parentId!==parent){child=nodeMap.get(child.parentId);if(++count>view.nodes.length)throw new Error('Cyclic native drawing containment');}return child?.parentId===parent?child.id:null;}
  function measure(id){
    if(sizes.has(id))return sizes.get(id);
    if(visiting.has(id))throw new Error('Cyclic native drawing containment');
    visiting.add(id);
    const node=nodeMap.get(id),items=children.get(id);
    const lines=[node.label??node.name??'',...(node.compartments??[]).map(value=>typeof value==='string'?value:JSON.stringify(value))].join('\n').split('\n');
    const symbol=controlSizes.get(node.kind);
    const ownHeight=symbol?symbol[1]:Math.max(76,Math.min(16,lines.length)*18+24,Number(node.height)||0);
    const ownWidth=symbol?symbol[0]:Math.max(160,Math.min(280,Math.max(0,...lines.map(line=>line.length))*7+32),Number(node.width)||0);
    for(const child of items)measure(child);
    const behavioral=['action','activity','state'].includes(view.kind);
    const edges=view.edges.filter(edge=>!behavioral||flowKinds.has(edge.kind)).map(edge=>[directChildOf(edge.source,id),directChildOf(edge.target,id)]).filter(([a,b])=>a&&b&&a!==b);
    const ranks=topologicalRanks(items,edges);
    const rows=[];
    for(const child of [...items].sort((a,b)=>ranks.get(a)-ranks.get(b)||items.indexOf(a)-items.indexOf(b))){
      const childSize=sizes.get(child),rank=ranks.get(child),previous=rows.at(-1);
      if(!previous||previous.rank!==rank||(!behavioral&&previous.width+16+childSize.width>contentWidth-32))rows.push({rank,ids:[child],width:childSize.width,height:childSize.height});
      else{previous.ids.push(child);previous.width+=16+childSize.width;previous.height=Math.max(previous.height,childSize.height);}
    }
    const childWidth=Math.max(0,...rows.map(row=>row.width));
    const containerWidth=Math.max(ownWidth,items.length?childWidth+32:0);
    let y=ownHeight+16;
    const positions=[];
    for(const row of rows){let x=(containerWidth-row.width)/2;for(const child of row.ids){const childSize=sizes.get(child);positions.push({id:child,x,y:y+(row.height-childSize.height)/2,width:childSize.width,height:childSize.height});x+=childSize.width+16;}y+=row.height+16;}
    childPlacements.set(id,positions);
    const size={width:containerWidth,height:items.length?y:ownHeight,headerHeight:ownHeight};
    visiting.delete(id);sizes.set(id,size);return size;
  }
  for(const node of view.nodes)measure(node.id);
  const rootOf=id=>{let node=nodeMap.get(id),count=0;while(node?.parentId&&nodeMap.has(node.parentId)){node=nodeMap.get(node.parentId);if(++count>view.nodes.length)throw new Error('Cyclic native drawing containment');}return node?.id;};
  const general=new Set(['general','gv','requirement','definition','tree','mixed','structure']);
  const orderedEdges=view.edges.map(edge=>{
    const a=rootOf(edge.source),b=rootOf(edge.target);
    return general.has(view.kind)&&['derive','derivation','typing','type','specialization','satisfy','satisfaction','verify','verification'].includes(edge.kind)?[b,a]:[a,b];
  });
  const ranks=topologicalRanks(roots.map(node=>node.id),orderedEdges);
  const reserved=panels.map(panel=>({...copy(panel)})),occupied=[...reserved],placed=new Map();
  let minimumY=padding,lastRank=-1,rankBottom=padding;
  for(const node of [...roots].sort((a,b)=>ranks.get(a.id)-ranks.get(b.id)||a.id.localeCompare(b.id))){
    const rank=ranks.get(node.id),size=sizes.get(node.id);
    if(rank!==lastRank){minimumY=rankBottom+(lastRank<0?0:gap);lastRank=rank;}
    const ys=[minimumY,...occupied.map(rect=>rect.y+rect.height+gap).filter(y=>y>=minimumY)].sort((a,b)=>a-b);
    let position=null;
    for(const y of [...new Set(ys)]){
      const xs=[padding,...occupied.filter(rect=>y<rect.y+rect.height+gap&&y+size.height+gap>rect.y).map(rect=>rect.x+rect.width+gap)].sort((a,b)=>a-b);
      for(const x of [...new Set(xs)]){const rect={x,y,width:size.width,height:size.height};if(x+size.width>width-padding)continue;if(!occupied.some(other=>intersects(rect,other,gap))){position=rect;break;}}
      if(position)break;
    }
    if(!position){const y=Math.max(minimumY,...occupied.map(rect=>rect.y+rect.height+gap));position={x:padding,y,width:size.width,height:size.height};}
    occupied.push(position);placed.set(node.id,position);rankBottom=Math.max(rankBottom,position.y+position.height);
  }
  const result=[];
  function collect(id,rect){const node=nodeMap.get(id);result.push({...node,...rect});for(const child of childPlacements.get(id)??[])collect(child.id,{x:rect.x+child.x,y:rect.y+child.y,width:child.width,height:child.height});}
  for(const root of roots)collect(root.id,placed.get(root.id));
  const bounds={x:0,y:0,width:Math.max(width,...result.map(node=>node.x+node.width+padding)),height:Math.max(height,...result.map(node=>node.y+node.height+padding))};
  if(bounds.width>width||bounds.height>height)omissions.push({reason:'layout-overflow',message:'The scene needs scrolling or fewer elements to retain readable node sizes.'});
  return {...view,nodes:result,panels:reserved,bounds,omissions};
}
function semanticIds(scene){return [...new Set((scene.nodes??scene.view?.nodes??[]).map(node=>node.semanticId).filter(Boolean))];}
/** Plan honest semantic continuity; actual interpolation belongs to the renderer. */
export function planTransition(fromScene,toScene,options={}) {
  const previous=fromScene.view??fromScene,next=toScene.view??toScene;
  const oldIds=semanticIds(previous),newIds=semanticIds(next),duration=options.reducedMotion?0:360;
  const correspondence=oldIds.filter(id=>newIds.includes(id)).map(semanticId=>({semanticId,fromRepresentationIds:previous.nodes.filter(node=>node.semanticId===semanticId).map(node=>node.id),toRepresentationIds:next.nodes.filter(node=>node.semanticId===semanticId).map(node=>node.id)}));
  if(previous.kind===next.kind)return {mode:'same-kind',correspondence,stages:[{kind:'reflow',viewKind:next.kind,semanticIds:newIds,duration}]};
  const route=options.graph&&fromScene.focus&&toScene.focus?findEngineeringRoute(options.graph,{...options,from:fromScene.focus,to:toScene.focus}):null;
  const journey=route?.found?route.elements.map(element=>element.id):[];
  const all=[...new Set([...oldIds,...journey,...newIds])];
  return {mode:'cross-kind',correspondence,route,stages:[
    {kind:'gv-bridge',viewKind:'gv',semanticIds:oldIds,duration},
    {kind:'gv-journey',viewKind:'gv',semanticIds:all,route:route?.found?route.relationships:[],disconnected:route?.found===false,duration},
    {kind:'gv-gather',viewKind:'gv',semanticIds:newIds,duration},
    {kind:'morph',viewKind:next.kind,semanticIds:newIds,duration}
  ]};
}
