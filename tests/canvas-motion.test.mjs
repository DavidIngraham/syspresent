import test from 'node:test';
import assert from 'node:assert/strict';
import {sampleTrack,startTimeline,samplePolyline,visibleTrackKeys} from '../src/canvas-prototype/motion.mjs';
test('one journey clock passes intermediate waypoints with continuing motion',()=>{
 const track=[{x:0},{x:100},{x:200},{x:300}],offsets=[0,1/3,2/3,1];
 const before=sampleTrack(track,offsets,1/3-.01).x,after=sampleTrack(track,offsets,1/3+.01).x;
 assert.ok(before<100&&after>100);assert.ok(after-before>5);assert.equal(sampleTrack(track,offsets,1).x,300);
});
test('cancelled timeline preserves its current visual sample and cannot finish over a newer scene',async()=>{
 let callback,clock=0;const seen=[];
 const motion=startTimeline({duration:1000,update:(p,t)=>seen.push([p,t]),now:()=>clock,request:fn=>(callback=fn,1),cancel:()=>{}});
 clock=400;callback(clock);const partial=seen.at(-1);motion.cancel();callback(1000);
 assert.equal((await motion.finished).cancelled,true);assert.deepEqual(seen.at(-1),partial);assert.ok(partial[0]>0&&partial[0]<1);
});
test('opacity fades both entering and leaving content, with the same reduced-motion endpoint',async()=>{
 const track=[{opacity:1},{opacity:0}];assert.equal(sampleTrack(track,[0,1],.5).opacity,.5);
 const seen=[];const motion=startTimeline({duration:0,update:p=>seen.push(p)});assert.deepEqual(seen,[1]);assert.equal((await motion.finished).cancelled,false);
});
test('edge interpolation preserves both directed endpoints',()=>{
 const points=[{x:10,y:20},{x:10,y:50},{x:100,y:50}],sampled=samplePolyline(points);
 assert.deepEqual(sampled[0],points[0]);assert.deepEqual(sampled.at(-1),points.at(-1));
});

test('unequal stage timing retains the same velocity on both sides of each waypoint',()=>{
 const track=[{x:0},{x:100},{x:200},{x:300},{x:400}],offsets=[0,.18,.5,.74,1],epsilon=1e-6;
 for(const knot of offsets.slice(1,-1)){const center=sampleTrack(track,offsets,knot).x,left=(center-sampleTrack(track,offsets,knot-epsilon).x)/epsilon,right=(sampleTrack(track,offsets,knot+epsilon).x-center)/epsilon;assert.ok(Math.abs(left-right)/Math.max(left,right)<.0001);assert.ok(left>0&&right>0);}
});

test('interrupted journeys discard abandoned content that never became visible',()=>{
 const frames=[{nodes:[{key:'active',opacity:1},{key:'abandoned',opacity:0}],edges:[{key:'old-future',opacity:0}]},{nodes:[{key:'destination',opacity:1}],edges:[]}];
 assert.deepEqual(visibleTrackKeys(frames,'nodes'),['active','destination']);assert.deepEqual(visibleTrackKeys(frames,'edges'),[]);
});
