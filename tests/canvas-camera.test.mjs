import test from 'node:test';
import assert from 'node:assert/strict';
import {createCamera,normalizeCamera,screenToWorld,worldToScreen,panCamera,zoomCameraAt,fitCameraToBounds,bindCameraControls} from '../src/canvas-prototype/camera.mjs';
const close=(a,b)=>{for(const key of Object.keys(b))assert.ok(Math.abs(a[key]-b[key])<1e-9,`${key}: ${a[key]} != ${b[key]}`);};
function harness(onGestureStart,getViewportArea){
 class Surface {
  listeners=new Map();captures=new Set();
  addEventListener(type,fn){if(!this.listeners.has(type))this.listeners.set(type,new Set());this.listeners.get(type).add(fn);}
  removeEventListener(type,fn){this.listeners.get(type)?.delete(fn);}
  getBoundingClientRect(){return {left:80,top:120,width:600,height:400};}
  contains(target){return [this,tile,prose,control].includes(target);}
  closest(){return null;}
  setPointerCapture(id){this.captures.add(id);}
  releasePointerCapture(id){this.captures.delete(id);}
  fire(type,values={}){const e={type,target:element,button:0,detail:1,pointerId:1,clientX:180,clientY:220,preventDefault(){this.defaultPrevented=true;},stopImmediatePropagation(){this.stopped=true;},...values};for(const fn of this.listeners.get(type)??[]){fn(e);if(e.stopped)break;}return e;}
 }
 const document=new Surface(),element=new Surface();element.ownerDocument=document;
 const tile={closest:selector=>selector.includes('.node')?tile:selector.includes('button')?tile:null};
 const prose={closest:selector=>selector.includes('article')?prose:null};
 const control={closest:selector=>selector.includes('button')?control:null};
 let camera=createCamera(),changes=[],starts=[];
 const teardown=bindCameraControls({element,getCamera:()=>camera,setCamera:(next,meta)=>{camera=next;changes.push({...next,...meta});},onGestureStart:meta=>{starts.push(meta);onGestureStart?.(meta,next=>camera=next);},getViewportArea});
 return {element,document,tile,prose,control,changes,starts,teardown,get camera(){return camera;},set camera(value){camera=value;}};
}
test('camera defaults are identity, finite and bounded without mutating input',()=>{
 assert.deepEqual(createCamera(),{x:0,y:0,scale:1});assert.deepEqual(normalizeCamera({x:Infinity,y:NaN,scale:-3}),{x:0,y:0,scale:.005});
 const original={x:10,y:-20,scale:200};assert.equal(createCamera(original).scale,4);assert.equal(original.scale,200);assert.equal(createCamera({scale:20},{minScale:.001,maxScale:30}).scale,4);assert.equal(createCamera({scale:.001},{minScale:.001,maxScale:30}).scale,.005);
});
test('world and screen conversion roundtrip with translation and scale',()=>{
 const camera={x:173,y:-24,scale:.25},world={x:-120,y:830};close(screenToWorld(camera,worldToScreen(camera,world)),world);
 assert.deepEqual(panCamera(camera,20,-35),{x:193,y:-59,scale:.25});
});
test('zoom retains the anchored world point, including when hitting either clamp',()=>{
 const camera={x:-120,y:35,scale:1.3},point={x:240,y:310},world=screenToWorld(camera,point);
 for(const factor of [1.5,100,.00001]){const zoomed=zoomCameraAt(camera,point,factor);close(worldToScreen(zoomed,world),point);assert.ok(zoomed.scale>=.005&&zoomed.scale<=4);}
});
test('fit frames negative world coordinates inside an offset prose-free area',()=>{
 const bounds={x:-500,y:60,width:800,height:200},area={x:24,y:32,width:400,height:350},camera=fitCameraToBounds(bounds,area,20);
 assert.equal(camera.scale,.45);close(worldToScreen(camera,{x:-100,y:160}),{x:224,y:207});
 const a=worldToScreen(camera,bounds),b=worldToScreen(camera,{x:300,y:260});assert.ok(a.x>=44&&a.y>=52);assert.ok(b.x<=404&&b.y<=362);
 assert.deepEqual(fitCameraToBounds(null,area),createCamera());assert.ok(Number.isFinite(fitCameraToBounds({x:0,y:0,width:0,height:0},area).scale));
});
test('neighborhood fit frames a twenty-thousand-unit fan on a narrow viewport',()=>{
 const bounds={x:-10000,y:-500,width:20000,height:1000},area={x:16,y:12,width:358,height:500};
 const camera=fitCameraToBounds(bounds,area,20);assert.equal(camera.scale,.0159);
 const left=worldToScreen(camera,{x:-10000,y:-500}),right=worldToScreen(camera,{x:10000,y:500});
 close(left,{x:36,y:254.05});close(right,{x:354,y:269.95});
 assert.ok(camera.scale>=.005&&camera.scale<.08);
});
test('stationary tile tap remains selection without camera callbacks or click suppression',()=>{
 const h=harness();h.element.fire('pointerdown',{target:h.tile});h.document.fire('pointermove',{clientX:182,clientY:222});h.document.fire('pointerup');
 assert.equal(h.changes.length,0);assert.equal(h.starts.length,0);assert.ok(!h.element.fire('click',{target:h.tile}).defaultPrevented);h.teardown();
});
test('tile drag pans after threshold, captures pointers and suppresses only its following click',()=>{
 const h=harness();h.element.fire('pointerdown',{target:h.tile});h.document.fire('pointermove',{clientX:200,clientY:235});assert.deepEqual(h.camera,{x:20,y:15,scale:1});assert.deepEqual([...h.element.captures],[1]);
 h.document.fire('pointermove',{clientX:210,clientY:250});assert.deepEqual(h.camera,{x:30,y:30,scale:1});assert.equal(h.starts.length,1);
 h.document.fire('pointerup');assert.equal(h.element.captures.size,0);assert.ok(h.element.fire('click',{target:h.tile}).stopped);assert.ok(!h.element.fire('click',{target:h.tile}).stopped);h.teardown();
});
test('pinch combines centroid travel and anchored scale using local surface coordinates',()=>{
 const h=harness();h.element.fire('pointerdown',{pointerId:1,clientX:180,clientY:220});h.element.fire('pointerdown',{pointerId:2,clientX:280,clientY:220});
 // Initial centroid is local (150,100); the pinch reaches local (200,130), distance 200.
 h.document.fire('pointermove',{pointerId:1,clientX:180,clientY:250});h.document.fire('pointermove',{pointerId:2,clientX:380,clientY:250});
 close(h.camera,{x:-100,y:-70,scale:2});close(worldToScreen(h.camera,{x:150,y:100}),{x:200,y:130});
 h.document.fire('pointerup',{pointerId:2});const before={...h.camera};h.document.fire('pointermove',{pointerId:1,clientX:190,clientY:265});close(h.camera,{...before,x:before.x+10,y:before.y+15});h.teardown();
});
test('cancel and lost capture clear a gesture without jumps or accidental activation',()=>{
 for(const kind of ['pointercancel','lostpointercapture']){
  const h=harness();h.element.fire('pointerdown');h.document.fire('pointermove',{clientX:210});const before={...h.camera};
  (kind==='pointercancel'?h.document:h.element).fire(kind);h.document.fire('pointermove',{clientX:500});assert.deepEqual(h.camera,before);assert.equal(h.element.captures.size,0);assert.ok(h.element.fire('click').stopped);
  h.element.fire('pointerdown',{clientX:300});h.document.fire('pointermove',{clientX:310});assert.equal(h.camera.x,before.x+10);h.teardown();
 }
});
test('prose and ordinary controls never start gestures, wheel zoom or keyboard camera actions',()=>{
 const h=harness();for(const target of [h.prose,h.control]){
  h.element.fire('pointerdown',{target});h.document.fire('pointermove',{clientX:500});h.document.fire('pointerup');
  assert.ok(!h.element.fire('wheel',{target,deltaY:100,ctrlKey:true}).defaultPrevented);assert.ok(!h.element.fire('keydown',{target,key:'ArrowDown'}).defaultPrevented);
 }assert.equal(h.changes.length,0);h.teardown();
});
test('canvas wheel zoom is anchored and prevents browser pinch zoom only over graph',()=>{
 const h=harness(),anchor={x:100,y:100},event=h.element.fire('wheel',{clientX:180,clientY:220,deltaY:-100,ctrlKey:true});
 assert.ok(event.defaultPrevented);assert.ok(h.camera.scale>1);close(worldToScreen(h.camera,anchor),anchor);h.teardown();
});
test('keyboard camera controls pan and zoom without taking Enter or Space from tile selection',()=>{
 const h=harness();assert.ok(h.element.fire('keydown',{key:'+'}).defaultPrevented);assert.equal(h.camera.scale,1.25);const before={...h.camera};h.element.fire('keydown',{key:'ArrowRight'});assert.equal(h.camera.x,before.x-48);
 assert.ok(!h.element.fire('keydown',{target:h.tile,key:'Enter'}).defaultPrevented);assert.ok(!h.element.fire('keydown',{target:h.tile,key:' '}).defaultPrevented);
 h.element.fire('keydown',{key:'0'});assert.deepEqual(h.camera,createCamera());h.teardown();
});
test('teardown removes all listeners and captures, including during a gesture',()=>{
 const h=harness();h.element.fire('pointerdown');h.document.fire('pointermove',{clientX:250});const before={...h.camera};h.teardown();assert.equal(h.element.captures.size,0);
 h.document.fire('pointermove',{clientX:500});h.element.fire('wheel',{deltaY:100});assert.deepEqual(h.camera,before);assert.ok([...h.document.listeners.values(),...h.element.listeners.values()].every(set=>set.size===0));
});

test('threshold pan starts from the post-handoff camera without losing initial pointer delta',()=>{
 const settled={x:200,y:-30,scale:.5},h=harness((meta,set)=>{if(meta.source==='pan')set(settled);});
 h.element.fire('pointerdown',{clientX:180,clientY:220});h.document.fire('pointermove',{clientX:200,clientY:235});
 close(h.camera,{x:220,y:-15,scale:.5});assert.equal(h.starts.length,1);
 h.document.fire('pointermove',{clientX:215,clientY:245});close(h.camera,{x:235,y:-5,scale:.5});h.teardown();
});
test('pinch anchors to the post-handoff camera at the initial two-pointer centroid',()=>{
 const settled={x:200,y:-30,scale:.5},h=harness((meta,set)=>{if(meta.source==='pinch')set(settled);});
 h.element.fire('pointerdown',{pointerId:1,clientX:180,clientY:220});h.element.fire('pointerdown',{pointerId:2,clientX:280,clientY:220});
 const anchor=screenToWorld(settled,{x:150,y:100});
 h.document.fire('pointermove',{pointerId:1,clientX:180,clientY:250});h.document.fire('pointermove',{pointerId:2,clientX:380,clientY:250});
 close(h.camera,{x:300,y:-130,scale:1});close(worldToScreen(h.camera,anchor),{x:200,y:130});assert.equal(h.starts.length,1);h.teardown();
});
test('keyboard pan and zoom are calculated after the synchronous handoff hook',()=>{
 const settled={x:200,y:-30,scale:.5},h=harness((meta,set)=>{if(meta.source==='keyboard')set(settled);});
 h.element.fire('keydown',{key:'ArrowRight'});close(h.camera,{x:152,y:-30,scale:.5});
 h.element.fire('keydown',{key:'+'});close(h.camera,zoomCameraAt(settled,{x:300,y:200},1.25));
 assert.equal(h.starts.length,2);h.teardown();
});

test('keyboard zoom anchors to the measured graph area excluding pinned prose',()=>{
 const area={x:20,y:30,width:300,height:200},h=harness(undefined,()=>area),anchor={x:170,y:130};
 h.camera={x:-60,y:22,scale:.6};const world=screenToWorld(h.camera,anchor);
 h.element.fire('keydown',{key:'+'});close(worldToScreen(h.camera,world),anchor);assert.equal(h.camera.scale,.75);
 h.element.fire('keydown',{key:'-'});close(worldToScreen(h.camera,world),anchor);close(h.camera,{x:-60,y:22,scale:.6});h.teardown();
});
test('invalid measured keyboard areas safely fall back to the surface center',()=>{
 for(const area of [undefined,{x:NaN,y:0,width:200,height:100},{x:0,y:0,width:0,height:100}]){
  const h=harness(undefined,()=>area),anchor={x:300,y:200};h.element.fire('keydown',{key:'+'});close(worldToScreen(h.camera,anchor),anchor);h.teardown();
 }
});
