/** Visual scheduling only: native model identities and edge directions are untouched. */
const visible = node => !!node && (node.opacity ?? 1) > .01;
const active = node => visible(node) && !node.context && node.kind !== 'context-boundary';
const overlaps = (a,b,padding=0) => a.x < b.x+b.width+padding && a.x+a.width+padding > b.x && a.y < b.y+b.height+padding && a.y+a.height+padding > b.y;
const clamp = value => Math.max(0,Math.min(1,value));
const smooth = value => {const t=clamp(value);return t*t*(3-2*t);};
const identity = node => node.semanticId ?? node.semantic ?? node.id ?? node.key;
const rectangle = node => ({x:node.x,y:node.y,width:node.width,height:node.height});
function nativeObstacles(node,nodes){
 const byId=new Map(nodes.map(item=>[item.id,item]));
 const ancestorOf=(ancestor,child)=>{const seen=new Set();let current=child;while(current?.parentId&&!seen.has(current.parentId)){seen.add(current.parentId);if(current.parentId===ancestor.id)return true;current=byId.get(current.parentId);}return false;};
 return nodes.flatMap(other=>{
  if(other.key===node.key||!active(other)||ancestorOf(node,other))return [];
  if(ancestorOf(other,node))return other.headerHeight>0?[{...rectangle(other),height:Math.min(other.height,other.headerHeight)}]:[];
  return [rectangle(other)];
 });
}
function firstContact(node,destination,obstacle){
 const dx=destination.x-node.x,dy=destination.y-node.y;
 if(overlaps(node,obstacle))return Infinity; // Existing snapshot overlap is not a new crossing.
 if(dx&&node.y<obstacle.y+obstacle.height&&node.y+node.height>obstacle.y){const gap=dx>0?obstacle.x-node.x-node.width:node.x-obstacle.x-obstacle.width;return gap>=0?gap/Math.abs(dx):Infinity;}
 if(dy&&node.x<obstacle.x+obstacle.width&&node.x+node.width>obstacle.x){const gap=dy>0?obstacle.y-node.y-node.height:node.y-obstacle.y-obstacle.height;return gap>=0?gap/Math.abs(dy):Infinity;}
 return Infinity;
}
function exitPosition(node,width,height,obstacles){
 const margin=24;
 const candidates=[
  {side:'left',x:-node.width-margin,y:node.y},
  {side:'right',x:width+margin,y:node.y},
  {side:'top',x:node.x,y:-node.height-margin},
  {side:'bottom',x:node.x,y:height+margin},
 ];
 // Prose, retained cards and held arrivals are occupants. Prefer a clear
 // swept rectangle even if its exit is farther away than the nearest edge.
 // When every direction is blocked, finish fading before first contact and
 // only continue the remaining offscreen travel while invisible.
 for(const candidate of candidates){
  const swept={x:Math.min(node.x,candidate.x),y:Math.min(node.y,candidate.y),width:node.width+Math.abs(node.x-candidate.x),height:node.height+Math.abs(node.y-candidate.y)};
  candidate.obstructions=obstacles.filter(obstacle=>!overlaps(node,obstacle)&&overlaps(swept,obstacle)).length;
  candidate.fadeUntil=Math.min(1,...obstacles.map(obstacle=>firstContact(node,candidate,obstacle)));
  candidate.fadeUntil=Math.max(0,candidate.fadeUntil-.005);
  candidate.distance=Math.abs(candidate.x-node.x)+Math.abs(candidate.y-node.y);
 }
 return candidates.sort((a,b)=>a.obstructions-b.obstructions||a.distance-b.distance)[0];
}
/**
 * Vacate reused slots within each adjacent frame interval. Never retime the
 * whole journey: every supplied GV waypoint and its endpoint presence is exact.
 * sampleAt(progress) remains the caller's ordinary continuous track sampler.
 */
export function planDepartures(frames,{width,height,panels=[],offsets,clearAt=.28,arriveAfter=.31,contextAfter=.78}={}){
 if(!Array.isArray(frames)||!frames.length)throw new TypeError('Departure planning requires frames');
 const first=frames[0],last=frames.at(-1);
 width=width??last.width??first.width;height=height??last.height??first.height;
 if(!(width>0&&height>0))throw new RangeError('Departure planning requires a positive viewport');
 if(!(clearAt>0&&clearAt<arriveAfter&&arriveAfter<contextAfter&&contextAfter<1))throw new RangeError('Departure phases must be ordered within the journey');
 offsets=offsets??frames.map((_,index)=>index/(frames.length-1||1));
 if(offsets.length!==frames.length||offsets[0]!==0||(frames.length>1&&offsets.at(-1)!==1)||offsets.some((value,index)=>!Number.isFinite(value)||(index>0&&value<=offsets[index-1])))throw new RangeError('Departure offsets must match frames and increase from zero to one');
 const departures=[],arrivals=new Set(),contextReturns=new Set(),intervals=[];
 for(let interval=0;interval<frames.length-1;interval++){
  const startFrame=frames[interval],endFrame=frames[interval+1],finalByKey=new Map(endFrame.nodes.map(node=>[node.key,node]));
  const localDepartures=[],localArrivals=new Set();
  for(const node of startFrame.nodes){
   const final=finalByKey.get(node.key);
   if(!active(node)||active(final))continue;
   const replacements=endFrame.nodes.filter(next=>active(next)&&identity(next)!==identity(node)&&overlaps(node,next,4));
   if(!replacements.length)continue;
   const occupiedPanels=[...panels,...(startFrame.panels??[]),...(endFrame.panels??[])];
   const exit=exitPosition(node,width,height,[...occupiedPanels,...nativeObstacles(node,startFrame.nodes)]);
   localDepartures.push({key:node.key,semanticId:identity(node),from:rectangle(node),exit:{x:exit.x,y:exit.y},side:exit.side,fadeUntil:exit.fadeUntil,clearAt,arriveAfter,replacements:replacements.map(next=>next.key),interval,startAt:offsets[interval],endAt:offsets[interval+1]});
   for(const next of replacements){localArrivals.add(next.key);arrivals.add(next.key);}
  }
  const identities=new Set(localDepartures.map(item=>item.semanticId));
  const localReturns=new Set(endFrame.nodes.filter(node=>!active(node)&&visible(node)&&identities.has(identity(node))).map(node=>node.key));
  for(const key of localReturns)contextReturns.add(key);
  departures.push(...localDepartures);
  intervals.push({startAt:offsets[interval],endAt:offsets[interval+1],byKey:new Map(localDepartures.map(item=>[item.key,item])),arrivals:localArrivals,contextReturns:localReturns});
 }
 function sampleNode(key,progress,sampleAt){
  // Includes reduced motion, interrupted snapshots and every interior waypoint.
  if(progress<=0)return sampleAt(0);if(progress>=1)return sampleAt(1);
  if(offsets.some(offset=>Math.abs(progress-offset)<1e-12))return sampleAt(progress);
  const interval=intervals.find(item=>progress>item.startAt&&progress<item.endAt);
  if(!interval)return sampleAt(progress);
  const span=interval.endAt-interval.startAt,local=(progress-interval.startAt)/span;
  const departure=interval.byKey.get(key);
  if(departure){
   const base=sampleAt(progress),start=sampleAt(interval.startAt),finish=sampleAt(interval.endAt);
   if(local<=clearAt){const t=smooth(local/clearAt);return {...base,...rectangle(start),scale:start.scale,x:start.x+(departure.exit.x-start.x)*t,y:start.y+(departure.exit.y-start.y)*t,opacity:(start.opacity??1)*(1-smooth(departure.fadeUntil>0?t/departure.fadeUntil:1))};}
   // Reposition invisibly, then return any peripheral representation at this
   // hop's endpoint, not at the final scene's unrelated location.
   return {...base,...rectangle(finish),scale:finish.scale,opacity:(finish.opacity??0)*smooth((local-contextAfter)/(1-contextAfter))};
  }
  if(interval.contextReturns.has(key)){
   const finish=sampleAt(interval.endAt);return {...finish,opacity:(finish.opacity??0)*smooth((local-contextAfter)/(1-contextAfter))};
  }
  if(interval.arrivals.has(key)){
   const start=sampleAt(interval.startAt),t=clamp((local-arriveAfter)/(1-arriveAfter));
   return {...sampleAt(interval.startAt+smooth(t)*span),...(local<=arriveAfter?start:{})};
  }
  return sampleAt(progress);
 }
 return {departures,arrivals:[...arrivals],contextReturns:[...contextReturns],sampleNode};
}
