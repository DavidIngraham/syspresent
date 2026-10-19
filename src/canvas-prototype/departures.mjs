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
 * Vacate reused slots before their replacements move into them. This is a
 * per-node schedule on the existing continuous journey clock, not extra
 * animation stages. sampleAt(progress) is the caller's ordinary track sampler.
 *
 * Intermediate frames remain untouched; identity matching uses native IDs,
 * never labels. A peripheral representation is allowed to reappear later at
 * its own settled position, after the departing active representation is gone.
 */
export function planDepartures(frames,{width,height,panels=[],clearAt=.28,arriveAfter=.31,contextAfter=.78}={}){
 if(!Array.isArray(frames)||!frames.length)throw new TypeError('Departure planning requires frames');
 const first=frames[0],last=frames.at(-1);
 width=width??last.width??first.width;height=height??last.height??first.height;
 if(!(width>0&&height>0))throw new RangeError('Departure planning requires a positive viewport');
 if(!(clearAt>0&&clearAt<arriveAfter&&arriveAfter<contextAfter&&contextAfter<1))throw new RangeError('Departure phases must be ordered within the journey');
 const finalByKey=new Map(last.nodes.map(node=>[node.key,node]));
 const arrivals=new Set(),departures=[];
 for(const node of first.nodes){
  const final=finalByKey.get(node.key);
  if(!active(node)||active(final))continue;
  const replacements=last.nodes.filter(next=>active(next)&&identity(next)!==identity(node)&&overlaps(node,next,4));
  if(!replacements.length)continue;
  const exit=exitPosition(node,width,height,[...panels,...nativeObstacles(node,first.nodes)]);
  departures.push({key:node.key,semanticId:identity(node),from:rectangle(node),exit:{x:exit.x,y:exit.y},side:exit.side,fadeUntil:exit.fadeUntil,clearAt,arriveAfter,replacements:replacements.map(next=>next.key)});
  for(const next of replacements)arrivals.add(next.key);
 }
 const byKey=new Map(departures.map(item=>[item.key,item]));
 const departingIdentities=new Set(departures.map(item=>item.semanticId));
 // A semantic element can legitimately use another visual key when it becomes
 // a boundary marker. Keep the representations distinct, but do not show the
 // returning marker before its outgoing active card has vacated the slot.
 const contextReturns=new Map(last.nodes.filter(node=>!active(node)&&visible(node)&&departingIdentities.has(identity(node))).map(node=>[node.key,node]));
 function sampleNode(key,progress,sampleAt){
  // Endpoints are exact, including reduced-motion and interrupted snapshots.
  if(progress<=0)return sampleAt(0);if(progress>=1)return sampleAt(1);
  const departure=byKey.get(key);
  if(departure){
   const base=sampleAt(progress),start=sampleAt(0),finish=sampleAt(1);
   if(progress<=clearAt){const t=smooth(progress/clearAt);return {...base,...rectangle(start),scale:start.scale,x:start.x+(departure.exit.x-start.x)*t,y:start.y+(departure.exit.y-start.y)*t,opacity:(start.opacity??1)*(1-smooth(departure.fadeUntil>0?t/departure.fadeUntil:1))};}
   // Reposition while invisible, then fade the peripheral tile in at its final
   // location. No active card travels back across its replacement's slot.
   return {...base,...rectangle(finish),scale:finish.scale,opacity:(finish.opacity??0)*smooth((progress-contextAfter)/(1-contextAfter))};
  }
  if(contextReturns.has(key)){
   const finish=sampleAt(1);return {...finish,opacity:(finish.opacity??0)*smooth((progress-contextAfter)/(1-contextAfter))};
  }
  if(arrivals.has(key)){
   const start=sampleAt(0),t=clamp((progress-arriveAfter)/(1-arriveAfter));
   return {...sampleAt(smooth(t)),...(progress<=arriveAfter?start:{})};
  }
  return sampleAt(progress);
 }
 return {departures,arrivals:[...arrivals],contextReturns:[...contextReturns.keys()],sampleNode};
}
