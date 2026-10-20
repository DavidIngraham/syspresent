/** Presentation-only affine camera. World geometry and native model identities are unchanged. */
export const CAMERA_LIMITS=Object.freeze({minScale:.005,maxScale:4});
const finite=(value,fallback)=>Number.isFinite(value)?value:fallback;
function limits(options={}){
 const minScale=clamp(finite(options.minScale,CAMERA_LIMITS.minScale),CAMERA_LIMITS.minScale,CAMERA_LIMITS.maxScale);
 return {minScale,maxScale:clamp(finite(options.maxScale,CAMERA_LIMITS.maxScale),minScale,CAMERA_LIMITS.maxScale)};
}
const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
export function createCamera(camera={},options={}){
 const {minScale,maxScale}=limits(options);
 return {x:finite(camera?.x,0),y:finite(camera?.y,0),scale:clamp(finite(camera?.scale,1),minScale,maxScale)};
}
export const normalizeCamera=createCamera;
export function worldToScreen(camera,point){const c=createCamera(camera);return {x:c.x+point.x*c.scale,y:c.y+point.y*c.scale};}
export function screenToWorld(camera,point){const c=createCamera(camera);return {x:(point.x-c.x)/c.scale,y:(point.y-c.y)/c.scale};}
export function panCamera(camera,dx,dy){const c=createCamera(camera);return {...c,x:c.x+finite(dx,0),y:c.y+finite(dy,0)};}
export function zoomCameraAt(camera,point,factor,options={}){
 const c=createCamera(camera,options),{minScale,maxScale}=limits(options);
 const scale=clamp(c.scale*Math.max(.0001,finite(factor,1)),minScale,maxScale);
 const world={x:(point.x-c.x)/c.scale,y:(point.y-c.y)/c.scale};
 return {x:point.x-world.x*scale,y:point.y-world.y*scale,scale};
}
/** Frame world bounds in a screen-space area; the area can exclude measured prose. */
export function fitCameraToBounds(bounds,area,padding=24,options={}){
 if(!bounds||!area||![bounds.x,bounds.y,bounds.width,bounds.height,area.x,area.y,area.width,area.height].every(Number.isFinite)||bounds.width<0||bounds.height<0||area.width<=0||area.height<=0)return createCamera({},options);
 const inset=Math.max(0,finite(padding,24)),{minScale,maxScale}=limits(options);
 const scale=clamp(Math.min(Math.max(1,area.width-inset*2)/Math.max(1,bounds.width),Math.max(1,area.height-inset*2)/Math.max(1,bounds.height)),minScale,maxScale);
 return {x:area.x+area.width/2-(bounds.x+bounds.width/2)*scale,y:area.y+area.height/2-(bounds.y+bounds.height/2)*scale,scale};
}
function graphTarget(target,element){
 if(!target||!element.contains(target))return false;
 // Graph nodes and native relationship controls remain selectable by a stationary tap.
 if(target.closest?.('article,aside,dialog,#selection,#canvas-tools,#loading,[data-camera-ignore]'))return false;
 if(target.closest?.('.node,[data-relationship],[data-camera-surface]'))return true;
 return !target.closest?.('button,a,input,textarea,select,summary,[contenteditable="true"],[role="button"]');
}
const midpoint=(a,b)=>({x:(a.x+b.x)/2,y:(a.y+b.y)/2});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
/**
 * Bind camera gestures without touching graph layout. setCamera(next,{source}) applies the
 * camera; onChange(next,{source}) is an optional notification. Return value tears down
 * every listener and pointer capture. getViewportArea can provide a measured prose-free
 * keyboard zoom area in local screen coordinates. CSS declares graph touch-action.
 */
export function bindCameraControls({element,getCamera,setCamera,onChange,onGestureStart,getViewportArea,shouldHandleTarget=graphTarget,minScale=.005,maxScale=4,dragThreshold=5}){
 if(!element||typeof getCamera!=='function'||typeof setCamera!=='function')throw new TypeError('Camera controls require element, getCamera and setCamera');
 const options={minScale,maxScale},points=new Map(),listeners=[],captures=new Set();
 const pointerHost=element.ownerDocument??element;
 let gesture=null,moved=false,suppressClick=false,disposed=false;
 const local=event=>{const r=element.getBoundingClientRect();return {x:event.clientX-r.left,y:event.clientY-r.top};};
 const accept=event=>shouldHandleTarget(event.target,element,event);
 const listen=(host,type,fn,options)=>{host.addEventListener(type,fn,options);listeners.push(()=>host.removeEventListener(type,fn,options));};
 const emit=(camera,source)=>{const next=createCamera(camera,options),current=createCamera(getCamera(),options);if(next.x===current.x&&next.y===current.y&&next.scale===current.scale)return;setCamera(next,{source});onChange?.(next,{source});};
 const rebase=()=>{gesture={camera:createCamera(getCamera(),options),points:[...points.values()].map(p=>({...p}))};};
 const capture=()=>{for(const id of points.keys())if(!captures.has(id)){try{element.setPointerCapture?.(id);captures.add(id);}catch{/* A canceled pointer may already be gone. */}}};
 const begin=source=>{if(!moved){
  moved=true;suppressClick=true;onGestureStart?.({source});
  // A synchronous handoff can finish motion and replace the camera. Keep the
  // original pointer origins so the threshold-crossing delta is not discarded.
  if(gesture)gesture.camera=createCamera(getCamera(),options);
 }capture();};
 const down=event=>{
  if(disposed||event.button>0||points.has(event.pointerId)||points.size>=2||!accept(event))return;
  if(!points.size){moved=false;suppressClick=false;}
  points.set(event.pointerId,local(event));rebase();
  if(points.size===2){begin('pinch');event.preventDefault();}
 };
 const move=event=>{
  if(!points.has(event.pointerId)||!gesture)return;
  points.set(event.pointerId,local(event));const current=[...points.values()],base=gesture.points;
  if(current.length===2&&base.length===2){
   begin('pinch');event.preventDefault();
   const origin=midpoint(...base),now=midpoint(...current),ratio=distance(...current)/Math.max(1,distance(...base));
   const zoomed=zoomCameraAt(gesture.camera,origin,ratio,options);
   emit({...zoomed,x:zoomed.x+now.x-origin.x,y:zoomed.y+now.y-origin.y},'pinch');
  }else if(current.length===1&&base.length===1){
   const dx=current[0].x-base[0].x,dy=current[0].y-base[0].y;
   if(!moved&&Math.hypot(dx,dy)<dragThreshold)return;
   begin('pan');event.preventDefault();emit(panCamera(gesture.camera,dx,dy),'pan');
  }
 };
 const release=id=>{if(captures.delete(id))try{element.releasePointerCapture?.(id);}catch{/* Capture can be implicitly released by the browser. */}};
 const up=event=>{
  if(!points.has(event.pointerId))return;
  points.delete(event.pointerId);release(event.pointerId);
  if(points.size)rebase();else gesture=null;
 };
 const cancel=event=>{
  if(!points.has(event.pointerId))return;
  // Keep the last camera, discard the entire gesture, and never treat cancellation as a tap.
  suppressClick=true;points.clear();gesture=null;for(const id of [...captures])release(id);
 };
 const click=event=>{if(suppressClick&&event.detail!==0&&accept(event)){event.preventDefault();event.stopImmediatePropagation();suppressClick=false;}};
 const wheel=event=>{
  if(!accept(event)||!Number.isFinite(event.deltaY)||!event.deltaY)return;
  event.preventDefault();onGestureStart?.({source:'wheel'});
  const unit=event.deltaMode===1?16:event.deltaMode===2?element.getBoundingClientRect().height:1;
  emit(zoomCameraAt(getCamera(),local(event),Math.exp(clamp(-event.deltaY*unit*.002,-2,2)),options),'wheel');
 };
 const key=event=>{
  if(event.altKey||event.ctrlKey||event.metaKey||!accept(event)||!['+','=','-','0','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;
  event.preventDefault();onGestureStart?.({source:'keyboard'});
  // Read camera and viewport after the handoff hook, never from in-flight motion.
  const r=element.getBoundingClientRect(),area=getViewportArea?.();
  const usable=area&&[area.x,area.y,area.width,area.height].every(Number.isFinite)&&area.width>0&&area.height>0;
  const center=usable?{x:area.x+area.width/2,y:area.y+area.height/2}:{x:r.width/2,y:r.height/2};let next;
  if(event.key==='+'||event.key==='=')next=zoomCameraAt(getCamera(),center,1.25,options);
  else if(event.key==='-')next=zoomCameraAt(getCamera(),center,.8,options);
  else if(event.key==='0')next=createCamera({},options);
  else if(event.key==='ArrowLeft')next=panCamera(getCamera(),48,0);
  else if(event.key==='ArrowRight')next=panCamera(getCamera(),-48,0);
  else if(event.key==='ArrowUp')next=panCamera(getCamera(),0,48);
  else if(event.key==='ArrowDown')next=panCamera(getCamera(),0,-48);
  if(next)emit(next,'keyboard');
 };
 listen(element,'pointerdown',down);listen(pointerHost,'pointermove',move,{passive:false});listen(pointerHost,'pointerup',up);listen(pointerHost,'pointercancel',cancel);listen(element,'lostpointercapture',cancel);
 listen(element,'click',click,true);listen(element,'wheel',wheel,{passive:false});listen(element,'keydown',key);
 return ()=>{disposed=true;points.clear();gesture=null;for(const id of [...captures])release(id);for(const remove of listeners)remove();};
}
