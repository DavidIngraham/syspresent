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
// Display hierarchy is independent of native arrow direction. These are actual
// directed decision/composition relations, never shared-classifier shortcuts.
const UPWARD_KINDS = new Set(['derive','derivation','refine','refinement','satisfy','satisfaction','verify','verification']);
const DOWNWARD_KINDS = new Set(['composition','containment']);
function hierarchyPolicy(graph, options, includeOwnership) {
  const policy=graphPolicy(graph,options), omissions=[], seen=new Set(), upward=new Map();
  const omit=(edge,target,reason)=>{const key=JSON.stringify([edge?.id,target,reason]);if(!seen.has(key)){seen.add(key);omissions.push({relationshipId:edge?.id??null,target,reason});}};
  const allowed=id=>{
    const reason=policy.allowedElement(id);if(reason)return reason;
    const element=policy.elements.get(id);
    if(element.layer==='metamodel'||element.metamodel===true)return 'metamodel-boundary';
    return element.layer==='library'?'library-boundary':null;
  };
  const ownershipIds=new Set((graph.containment??[]).map(edge=>edge.id));
  const links=[...policy.edges,...(includeOwnership?(graph.containment??[]).map(edge=>({...edge,source:endpoint(edge,'source'),target:endpoint(edge,'target')})):[])];
  for(const edge of links){
    const ownership=includeOwnership&&ownershipIds.has(edge.id)&&['owner','ownership','containment'].includes(edge.kind);
    if(!ownership&&!UPWARD_KINDS.has(edge.kind)&&!DOWNWARD_KINDS.has(edge.kind))continue;
    if(!ownership&&!policy.kinds.has(edge.kind))continue;
    const [child,parent]=DOWNWARD_KINDS.has(edge.kind)?[edge.target,edge.source]:[edge.source,edge.target];
    if(!upward.has(child))upward.set(child,[]);upward.get(child).push({parent,edge,ownership});
  }
  // Stable tie-breaking avoids publication changes caused only by export order.
  for(const links of upward.values())links.sort((a,b)=>a.parent.localeCompare(b.parent)||String(a.edge.id).localeCompare(String(b.edge.id)));
  return {...policy,allowed,upward,omissions,omit};
}
/** Find the nearest common engineering ancestor, then descend to the destination.
 * graph.containment is an optional, separately exported native ownership index:
 * owner -> child containment edges. This is location context, not a satisfaction claim.
 * No undirected dependency, classifier, membership or library path is invented.
 */
export function findHierarchyRoute(graph,options={}) {
  const {from,to,maxHops=12}=options;
  if(!Number.isInteger(maxHops)||maxHops<0)throw Error('Invalid route hop limit');
  function search(includeOwnership){
    const policy=hierarchyPolicy(graph,options,includeOwnership);
    for(const id of [from,to]){const reason=policy.allowed(id);if(reason)return {found:false,elements:[],relationships:[],omissions:[{target:id,reason}]};}
    function ancestors(root){
      const found=new Map([[root,{ids:[root],edges:[],ownership:false}]]),queue=[root];
      for(let cursor=0;cursor<queue.length;cursor++){
        const current=queue[cursor],path=found.get(current);
        for(const {parent,edge,ownership} of policy.upward.get(current)??[]){
          const reason=policy.allowed(parent);if(reason){policy.omit(edge,parent,reason);continue;}
          if(found.has(parent))continue;
          if(path.edges.length>=maxHops){policy.omit(edge,parent,'hop-limit');continue;}
          found.set(parent,{ids:[...path.ids,parent],edges:[...path.edges,edge],ownership:path.ownership||ownership});queue.push(parent);
        }
      }
      return found;
    }
    const left=ancestors(from),right=ancestors(to),common=[...left.keys()].filter(id=>right.has(id));
    const bounded=common.filter(id=>left.get(id).edges.length+right.get(id).edges.length<=maxHops);
    bounded.sort((a,b)=>{
      const lengths=id=>[left.get(id).edges.length,right.get(id).edges.length];
      const [al,ar]=lengths(a),[bl,br]=lengths(b);
      return al+ar-bl-br||Math.max(al,ar)-Math.max(bl,br)||a.localeCompare(b);
    });
    if(!bounded.length){
      if(common.length)policy.omit(null,to,'hop-limit');
      policy.omit(null,to,'no-common-ancestor');
      return {found:false,elements:[],relationships:[],omissions:policy.omissions};
    }
    const ancestor=bounded[0],ascent=left.get(ancestor),descent=right.get(ancestor),ids=[...ascent.ids,...descent.ids.slice(0,-1).reverse()];
    return copy({found:true,strategy:ascent.ownership||descent.ownership?'ownership-ancestor':'common-ancestor',commonAncestor:ancestor,
      ascentIds:ascent.ids,descentIds:[...descent.ids].reverse(),elements:ids.map(id=>policy.elements.get(id)),
      relationships:[...ascent.edges,...[...descent.edges].reverse()],omissions:policy.omissions});
  }
  const engineering=search(false);
  return engineering.found||!(graph.containment??[]).length?engineering:search(true);
}
/** Validate an author-chosen route without replacing it with a shorter proposal. */
export function findExplicitRoute(graph,ids,options={}) {
  const policy=graphPolicy(graph,options),relationships=[],elements=[],omissions=[];
  if(!Array.isArray(ids)||!ids.length)return {found:false,elements:[],relationships:[],omissions:[{reason:'empty-route'}]};
  const ownership=new Set((graph.containment??[]).map(edge=>edge.id));
  const edges=[...policy.edges,...(graph.containment??[]).map(edge=>({...edge,source:endpoint(edge,'source'),target:endpoint(edge,'target')}))];
  for(const [index,id]of ids.entries()){
    const reason=policy.allowedElement(id);if(reason)return {found:false,elements:[],relationships:[],omissions:[{target:id,reason}]};
    elements.push(policy.elements.get(id));if(!index)continue;
    const previous=ids[index-1],edge=edges.find(edge=>(policy.kinds.has(edge.kind)||ownership.has(edge.id))&&((edge.source===previous&&edge.target===id)||(edge.target===previous&&edge.source===id)));
    if(!edge)return {found:false,elements:[],relationships:[],omissions:[{target:id,reason:'missing-explicit-link'}]};relationships.push(edge);
  }
  return copy({found:true,strategy:'explicit',elements,relationships,omissions});
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
  // Lay out in one compact reading rectangle. Reserving the prose in a packing
  // pass and subsequently fitting the whole result used to preserve a large,
  // invisible hole when a wrapped row was pushed below a bottom narrative.
  let area={x:0,y:0,width,height};
  if(panels.length){
    const xs=[0,width,...panels.flatMap(p=>[Math.max(0,p.x-gap),Math.min(width,p.x+p.width+gap)])];
    const ys=[0,height,...panels.flatMap(p=>[Math.max(0,p.y-gap),Math.min(height,p.y+p.height+gap)])];
    const candidates=[];
    for(const x of xs)for(const right of xs)for(const y of ys)for(const bottom of ys){
      const rect={x,y,width:right-x,height:bottom-y};
      if(rect.width>=160&&rect.height>=76&&!panels.some(p=>intersects(rect,p)))candidates.push(rect);
    }
    area=candidates.sort((a,b)=>b.width*b.height-a.width*a.height)[0]??area;
  }
  const contentWidth=Math.max(160,area.width-2*padding);
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
    const ownWidth=symbol?symbol[0]:Number(node.width)>0?Number(node.width):Math.max(160,Math.min(280,Math.max(0,...lines.map(line=>line.length))*7+32));
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
  const reserved=panels.map(panel=>({...copy(panel)})),placed=new Map();
  const behavioral=['action','activity','state'].includes(view.kind);
  const columnGap=Math.min(gap,16);
  const rows=[];
  for(const node of [...roots].sort((a,b)=>ranks.get(a.id)-ranks.get(b.id)||a.id.localeCompare(b.id))){
    const size=sizes.get(node.id),rank=ranks.get(node.id),row=rows.at(-1);
    if(!row||row.rank!==rank||(!behavioral&&row.width+columnGap+size.width>contentWidth))rows.push({rank,ids:[node.id],width:size.width,height:size.height});
    else{row.ids.push(node.id);row.width+=columnGap+size.width;row.height=Math.max(row.height,size.height);}
  }
  // All rows share a compact centreline. Wrapped peers remain peers; behavioral
  // parallel branches are deliberately never wrapped into a false sequence.
  const occupiedWidth=Math.max(0,...rows.map(row=>row.width));
  let y=area.y+padding;
  for(const row of rows){
    let x=area.x+padding+(occupiedWidth-row.width)/2;
    for(const id of row.ids){const size=sizes.get(id);placed.set(id,{x,y:y+(row.height-size.height)/2,...size});x+=size.width+columnGap;}
    y+=row.height+gap;
  }
  const result=[];
  function collect(id,rect){const node=nodeMap.get(id);result.push({...node,...rect});for(const child of childPlacements.get(id)??[])collect(child.id,{x:rect.x+child.x,y:rect.y+child.y,width:child.width,height:child.height});}
  for(const root of roots)collect(root.id,placed.get(root.id));
  const bounds={x:0,y:0,width:Math.max(width,...result.map(node=>node.x+node.width+padding)),height:Math.max(height,...result.map(node=>node.y+node.height+padding))};
  if(bounds.width>width||bounds.height>height)omissions.push({reason:'layout-overflow',message:'The scene needs scrolling or fewer elements to retain readable node sizes.'});
  return {...view,nodes:result,panels:reserved,bounds,omissions};
}
function semanticIds(scene){return [...new Set((scene.nodes??scene.view?.nodes??[]).map(node=>node.semanticId).filter(Boolean))];}
/** Plan honest semantic continuity; actual interpolation belongs to the renderer.
 * A disjoint same-notation view still needs a journey. Shared content can reflow
 * directly; changing notation uses GV even when the endpoint identities overlap.
 */
export function planTransition(fromScene,toScene,options={}) {
  const previous=fromScene.view??fromScene,next=toScene.view??toScene;
  const oldIds=semanticIds(previous),newIds=semanticIds(next),duration=options.reducedMotion?0:360;
  const correspondence=oldIds.filter(id=>newIds.includes(id)).map(semanticId=>({semanticId,fromRepresentationIds:previous.nodes.filter(node=>node.semanticId===semanticId).map(node=>node.id),toRepresentationIds:next.nodes.filter(node=>node.semanticId===semanticId).map(node=>node.id)}));
  if(previous.kind===next.kind&&correspondence.length&&!options.journey?.length)return {mode:'same-kind',journeyRequired:false,correspondence,stages:[{kind:'reflow',viewKind:next.kind,semanticIds:newIds,focusId:toScene.focus,duration}]};
  const route=options.graph&&fromScene.focus&&toScene.focus
    ? options.journey?.length?(options.journey[0]===fromScene.focus&&options.journey.at(-1)===toScene.focus?findExplicitRoute(options.graph,options.journey,options):{found:false,elements:[],relationships:[],omissions:[{reason:'explicit-route-endpoints'}]}):findHierarchyRoute(options.graph,{...options,from:fromScene.focus,to:toScene.focus})
    : {found:false,elements:[],relationships:[],omissions:[{reason:'missing-route-context'}]};
  const journey=route.found?route.elements.map(element=>element.id):[],stages=[{kind:'gv-bridge',viewKind:'gv',semanticIds:oldIds,focusId:fromScene.focus,duration}];
  if(route.found){
    // Overlapping three-element windows show each local hop without shrinking a
    // long route into one overview. Native relationship directions are intact.
    if(journey.length===1)stages.push({kind:'gv-journey',viewKind:'gv',semanticIds:journey,focusId:journey[0],route:[],routeIndex:0,duration});
    else for(let index=1;index<journey.length;index++){
      const start=Math.max(0,index-1),end=Math.min(journey.length,index+2);
      stages.push({kind:'gv-journey',viewKind:'gv',semanticIds:journey.slice(start,end),focusId:journey[index],route:route.relationships.slice(start,end-1),routeIndex:index,
        phase:route.commonAncestor?(index<=journey.indexOf(route.commonAncestor)?'ascent':'descent'):'explicit',duration});
    }
  }else stages.push({kind:'gv-journey',viewKind:'gv',semanticIds:[],focusId:toScene.focus,route:[],disconnected:true,duration});
  stages.push({kind:'gv-gather',viewKind:'gv',semanticIds:newIds,focusId:toScene.focus,duration},{kind:'morph',viewKind:next.kind,semanticIds:newIds,focusId:toScene.focus,duration});
  return {mode:previous.kind===next.kind?'same-kind-journey':'cross-kind',journeyRequired:true,correspondence,route,stages};
}
