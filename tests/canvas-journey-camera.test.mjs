import test from 'node:test';
import assert from 'node:assert/strict';
import {journeyCameraTrack} from '../src/canvas-prototype/journey-camera.mjs';
import {createCamera,worldToScreen} from '../src/canvas-prototype/camera.mjs';
const node=(id,x,y,extra={})=>({id,semanticId:id,x,y,width:100,height:60,...extra});
const frame=(focus,nodes,extra={})=>({focus,nodes,edges:[],area:{x:20,y:30,width:350,height:420},view:{kind:'gv'},...extra});
const close=(a,b,tolerance=1e-8)=>{for(const key of Object.keys(b))assert.ok(Math.abs(a[key]-b[key])<tolerance,`${key}: ${a[key]} != ${b[key]}`);};
const route=()=>[
 frame('origin',[node('origin',100,70),node('ancestor',120,220,{context:true}),node('irrelevant',-8000,6000,{context:true})]),
 frame('ancestor',[node('origin',120,210),node('ancestor',120,70)]),
 frame('branch',[node('ancestor',40,70),node('branch',210,220)]),
 frame('destination',[node('destination',120,80)])
];
test('camera journey preserves the starting camera and settles fitted identity',()=>{
 const initialCamera={x:-80,y:25,scale:.4},plan=journeyCameraTrack(route(),{initialCamera,offsets:[0,.2,.7,1]});
 close(plan.sample(0),initialCamera);close(plan.sample(1),createCamera());assert.deepEqual(plan.poses.map(p=>p.phase),['source','open-route','follow-route','follow-route','destination']);
 assert.deepEqual(plan.offsets,[0,.1,.2,.7,1]);assert.ok(plan.poses.slice(1,-1).every(p=>p.camera.scale<1));
});
test('source opening reveals actual route neighbors without framing unrelated context or worldBounds',()=>{
 const frames=route(),original=journeyCameraTrack(frames);frames[0].worldBounds={x:-20000,y:-20000,width:40000,height:40000};frames[0].nodes.push(node('another-unrelated',90000,-90000,{context:true}));
 const expanded=journeyCameraTrack(frames);assert.deepEqual(expanded.poses,original.poses);
 const open=expanded.poses.find(p=>p.phase==='open-route'),area=frames[0].area;
 for(const n of frames[0].nodes.slice(0,2)){
  const a=worldToScreen(open.camera,n),b=worldToScreen(open.camera,{x:n.x+n.width,y:n.y+n.height});
  assert.ok(a.x>=area.x+24&&a.y>=area.y+24);assert.ok(b.x<=area.x+area.width-24&&b.y<=area.y+area.height-24);
 }
});
test('intermediate camera follows actual waypoint focus inside the measured prose-free area',()=>{
 const frames=route(),plan=journeyCameraTrack(frames),steps=plan.poses.filter(p=>p.phase==='follow-route');
 assert.notDeepEqual(steps[0].camera,steps[1].camera);
 for(const pose of steps){
  const f=frames[pose.frameIndex],n=f.nodes.find(n=>n.semanticId===f.focus),center=worldToScreen(pose.camera,{x:n.x+n.width/2,y:n.y+n.height/2});
  assert.ok(center.x>=f.area.x+24&&center.x<=f.area.x+f.area.width-24);assert.ok(center.y>=f.area.y+24&&center.y<=f.area.y+f.area.height-24);
 }
});
test('camera sampling remains finite and continuous through every intermediate waypoint',()=>{
 const plan=journeyCameraTrack(route(),{offsets:[0,.18,.74,1]});
 for(let i=0;i<=1000;i++){const pose=plan.sample(i/1000);assert.ok(Object.values(pose).every(Number.isFinite));assert.ok(pose.scale>=.005&&pose.scale<=4);}
 for(const t of plan.offsets.slice(1,-1)){
  close(plan.sample(t-1e-8),plan.sample(t+1e-8),.0001);
  // Hermite has a shared derivative; it is not independently eased to rest per stage.
  const a=plan.sample(t-1e-6),b=plan.sample(t),c=plan.sample(t+1e-6);
  for(const key of ['x','y','scale'])assert.ok(Math.abs((b[key]-a[key])/1e-6-(c[key]-b[key])/1e-6)<.1);
 }
});
test('planner does not mutate prepared frames, edges, offsets or initial camera',()=>{
 const frames=route(),offsets=[0,.2,.6,1],initialCamera={x:12,y:32,scale:.3};const before=structuredClone({frames,offsets,initialCamera});
 const plan=journeyCameraTrack(frames,{offsets,initialCamera});for(const p of [0,.1,.5,.9,1])plan.sample(p);assert.deepEqual({frames,offsets,initialCamera},before);
});
test('normal small shared reflow does not introduce an unnecessary pullback',()=>{
 const frames=[frame('same',[node('same',100,80)]),frame('same',[node('same',110,100)])],plan=journeyCameraTrack(frames);
 assert.equal(plan.poses.length,2);close(plan.sample(.5),createCamera());
});
test('substantial shared reflow gently opens around the real source and destination geometry',()=>{
 const frames=[frame('same',[node('same',50,70)]),frame('same',[node('same',280,320)])],plan=journeyCameraTrack(frames);
 assert.equal(plan.poses.length,3);assert.equal(plan.poses[1].phase,'reflow');assert.ok(plan.sample(.5).scale<1);close(plan.sample(1),createCamera());
});
test('single-frame reduced-motion use ends immediately at the requested final pose',()=>{
 const finish={x:25,y:-12,scale:.65},plan=journeyCameraTrack([route().at(-1)],{initialCamera:{x:200,y:100,scale:.3},finalCamera:finish,offsets:[0]});
 close(plan.sample(0),finish);close(plan.sample(1),finish);
});
test('explicit final camera preserves history restoration while normal journeys end at identity',()=>{
 const finalCamera={x:20,y:35,scale:.4};close(journeyCameraTrack(route(),{finalCamera}).sample(1),finalCamera);
});
test('malformed timing is rejected and missing focus cannot create fictional geometry',()=>{
 assert.throws(()=>journeyCameraTrack([]),/prepared frame/);assert.throws(()=>journeyCameraTrack(route(),{offsets:[0,.3,.3,1]}),/strictly increase/);
 const frames=[frame('not-present',[]),frame('also-absent',[]),frame('destination',[])],plan=journeyCameraTrack(frames);
 assert.ok(plan.poses.every(p=>Object.values(p.camera).every(Number.isFinite)));assert.ok(!plan.poses.some(p=>p.phase==='open-route'));assert.equal(frames[1].nodes.length,0);
});
