import {createCamera,fitCameraToBounds} from './camera.mjs';
import {sampleTrack} from './motion.mjs';

const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
const validNode=node=>node&&(node.opacity??1)>0&&[node.x,node.y,node.width,node.height].every(Number.isFinite)&&node.width>=0&&node.height>=0;
const identity=node=>node.semanticId??node.key??node.id;
function boundsFor(nodes){
 if(!nodes.length)return null;
 const x=Math.min(...nodes.map(n=>n.x)),y=Math.min(...nodes.map(n=>n.y));
 return {x,y,width:Math.max(...nodes.map(n=>n.x+n.width))-x,height:Math.max(...nodes.map(n=>n.y+n.height))-y};
}
function frameArea(frame){
 const area=frame.area;
 if(area&&[area.x,area.y,area.width,area.height].every(Number.isFinite)&&area.width>0&&area.height>0)return {...area};
 return {x:0,y:0,width:Math.max(1,Number.isFinite(frame.width)?frame.width:1000),height:Math.max(1,Number.isFinite(frame.height)?frame.height:700)};
}
function focusNode(frame,nodes){const focus=frame.focus??frame.view?.focus;return nodes.find(n=>identity(n)===focus||n.id===focus||n.key===focus);}
/** Fit actual relevant geometry while biasing its focus toward the prose-free center. */
function viewpoint(frame,nodes,{maximumScale=.78,padding=24}={}){
 const area=frameArea(frame),bounds=boundsFor(nodes);if(!bounds)return createCamera();
 const fit=fitCameraToBounds(bounds,area,padding),scale=Math.min(maximumScale,fit.scale);
 const focus=focusNode(frame,nodes),center=focus?{x:focus.x+focus.width/2,y:focus.y+focus.height/2}:{x:bounds.x+bounds.width/2,y:bounds.y+bounds.height/2};
 const desired={x:area.x+area.width/2-center.x*scale,y:area.y+area.height/2-center.y*scale};
 // Center focus where space permits, but never push another route tile into prose.
 const marginX=Math.min(padding,area.width/2),marginY=Math.min(padding,area.height/2);
 const minX=area.x+marginX-bounds.x*scale,maxX=area.x+area.width-marginX-(bounds.x+bounds.width)*scale;
 const minY=area.y+marginY-bounds.y*scale,maxY=area.y+area.height-marginY-(bounds.y+bounds.height)*scale;
 return createCamera({x:minX<=maxX?clamp(desired.x,minX,maxX):fit.x,y:minY<=maxY?clamp(desired.y,minY,maxY):fit.y,scale});
}
function normalizedOffsets(frames,offsets){
 if(offsets===undefined)return frames.map((_,index)=>index/(frames.length-1||1));
 if(frames.length===1&&offsets.length===1&&offsets[0]===0)return [0];
 if(offsets.length!==frames.length||offsets[0]!==0||offsets.at(-1)!==1||offsets.some((value,index)=>!Number.isFinite(value)||(index>0&&value<=offsets[index-1])))throw new TypeError('Journey camera offsets must strictly increase from 0 to 1 for every frame');
 return [...offsets];
}
/**
 * Camera choreography on the same 0–1 clock as prepared geometry. No semantic
 * traversal is performed here: the native journey has already selected each frame.
 * Intermediate frames reveal and follow only that route. The source opening uses
 * those same identities where actually represented, never the entire neighborhood.
 * finalCamera defaults to identity because prepared destination geometry is fitted.
 */
export function journeyCameraTrack(frames,{initialCamera=createCamera(),finalCamera=createCamera(),offsets}={}){
 if(!Array.isArray(frames)||!frames.length)throw new TypeError('Journey camera requires at least one prepared frame');
 const start=createCamera(initialCamera),finish=createCamera(finalCamera),times=normalizedOffsets(frames,offsets),poses=[];
 const add=(progress,camera,phase,frameIndex)=>poses.push({progress,camera:createCamera(camera),phase,frameIndex});
 if(frames.length===1){add(0,finish,'destination',0);add(1,finish,'destination',0);}
 else {
  add(0,start,'source',0);
  if(frames.length>2){
   const routeIds=new Set();
   for(const frame of frames.slice(1,-1))for(const node of frame.nodes??[])if(validNode(node)&&!node.context)routeIds.add(identity(node));
   const source=frames[0],sourceNodes=(source.nodes??[]).filter(validNode),focus=focusNode(source,sourceNodes);
   const openingNodes=sourceNodes.filter(node=>routeIds.has(identity(node))||node===focus);
   if(openingNodes.length)add(Math.min(.10,times[1]*.5),viewpoint(source,openingNodes,{maximumScale:.82}),'open-route',0);
   for(let index=1;index<frames.length-1;index++){
    const frame=frames[index],nodes=(frame.nodes??[]).filter(node=>validNode(node)&&!node.context);
    add(times[index],viewpoint(frame,nodes),'follow-route',index);
   }
  }else{
   // Shared-notation reflows need only a slight pullback for a substantial move.
   const source=frames[0],destination=frames[1],a=focusNode(source,(source.nodes??[]).filter(validNode)),b=focusNode(destination,(destination.nodes??[]).filter(validNode));
   const area=frameArea(source),travel=a&&b?Math.hypot(a.x+a.width/2-b.x-b.width/2,a.y+a.height/2-b.y-b.height/2):0;
   if(travel>Math.min(area.width,area.height)*.35){
    // Use real bounds from both settled frames; no invented nodes or relationships.
    add(.5,viewpoint(source,[a,b],{maximumScale:.9}),'reflow',0);
   }
  }
  add(1,finish,'destination',frames.length-1);
 }
 const track=poses.map(p=>p.camera),cameraOffsets=poses.map(p=>p.progress);
 return {poses,track,offsets:cameraOffsets,sample:progress=>createCamera(sampleTrack(track,cameraOffsets,Number.isFinite(progress)?clamp(progress,0,1):0))};
}
