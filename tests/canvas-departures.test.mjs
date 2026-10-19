import test from 'node:test';
import assert from 'node:assert/strict';
import {planDepartures} from '../src/canvas-prototype/departures.mjs';
import {sampleTrack} from '../src/canvas-prototype/motion.mjs';
const node=(key,x,y,extra={})=>({key,id:key,semanticId:key,x,y,width:100,height:60,scale:1,opacity:1,...extra});
const frame=nodes=>({nodes,edges:[],width:400,height:600});
const sample=(first,last)=>(p)=>sampleTrack([first,last],[0,1],p);
function scene(){const outgoing=node('challenge',150,30),incoming=node('system',150,170),final=node('system',150,30);return {outgoing,incoming,final,frames:[frame([outgoing,incoming]),frame([final])]};}
function overlap(a,b){return a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
test('outgoing challenge tile exits before its replacement rises into the reused slot',()=>{
 const {outgoing,incoming,final,frames}=scene(),plan=planDepartures(frames);
 assert.equal(plan.departures.length,1);assert.equal(plan.departures[0].side,'top');
 const gone={...outgoing,opacity:0};
 for(let p=0;p<=1;p+=.005){const old=plan.sampleNode('challenge',p,sample(outgoing,gone)),next=plan.sampleNode('system',p,sample(incoming,final));if(old.opacity>.01&&next.opacity>.01)assert.equal(overlap(old,next),false);}
 const old=plan.sampleNode('challenge',.28,sample(outgoing,gone));assert.equal(old.opacity,0);assert.ok(old.y+old.height<0);
 assert.deepEqual(plan.sampleNode('system',.3,sample(incoming,final)),incoming);
 assert.ok(plan.sampleNode('system',.5,sample(incoming,final)).y<incoming.y);
});
test('transition endpoint and reduced-motion samples retain exact caller geometry',()=>{
 const {outgoing,incoming,final,frames}=scene(),plan=planDepartures(frames),gone={...outgoing,opacity:0};
 for(const [key,a,b]of [['challenge',outgoing,gone],['system',incoming,final]]){assert.deepEqual(plan.sampleNode(key,0,sample(a,b)),a);assert.deepEqual(plan.sampleNode(key,1,sample(a,b)),b);}
});
test('a peripheral representation fades back only at its final location',()=>{
 const {outgoing,incoming,final}=scene(),ghost=node('challenge',20,400,{context:true,opacity:.22}),frames=[frame([outgoing,incoming]),frame([ghost,final])],plan=planDepartures(frames);
 assert.equal(plan.departures.length,1);
 for(const p of [.3,.5,.77]){const current=plan.sampleNode('challenge',p,sample(outgoing,ghost));assert.equal(current.opacity,0);assert.equal(current.x,ghost.x);assert.equal(current.y,ghost.y);}
 const reappearing=plan.sampleNode('challenge',.9,sample(outgoing,ghost));assert.ok(reappearing.opacity>0&&reappearing.opacity<.22);assert.equal(reappearing.x,ghost.x);
});
test('a partially faded interrupted snapshot departs from its actual current location',()=>{
 const {outgoing,incoming,final}=scene(),partial={...outgoing,x:147,y:20,opacity:.43},plan=planDepartures([frame([partial,incoming]),frame([final])]);
 const draw=sample(partial,{...partial,opacity:0});assert.deepEqual(plan.sampleNode('challenge',0,draw),partial);const moving=plan.sampleNode('challenge',.1,draw);assert.ok(moving.opacity<.43);assert.ok(moving.y<20);
});
test('unrelated nodes keep the original continuous timeline including intermediate waypoints',()=>{
 const {frames}=scene(),plan=planDepartures(frames),track=[{x:0,opacity:1},{x:100,opacity:1},{x:200,opacity:1}],sampler=p=>sampleTrack(track,[0,.5,1],p);
 for(const p of [.1,.4,.5,.6,.9])assert.deepEqual(plan.sampleNode('unrelated',p,sampler),sampler(p));
});
test('active nodes that remain active are not faded out or semantically merged',()=>{
 const a=node('a',50,30),b=node('b',220,30),frames=[frame([a,b]),frame([{...a,x:b.x},{...b,x:a.x}])],plan=planDepartures(frames);
 assert.deepEqual(plan.departures,[]);assert.deepEqual(plan.arrivals,[]);
});
test('several vacated slots clear independently without changing native identity',()=>{
 const a=node('a',20,20),b=node('b',270,20),c=node('c',20,200),d=node('d',270,200),plan=planDepartures([frame([a,b,c,d]),frame([{...c,y:20},{...d,y:20}])]);
 assert.deepEqual(plan.departures.map(x=>x.semanticId),['a','b']);assert.deepEqual(plan.arrivals,['c','d']);assert.equal(plan.departures[0].side,'top');assert.equal(plan.departures[1].side,'top');
});
test('measured prose blocks the nearest exit route',()=>{
 const outgoing=node('a',150,400),incoming=node('b',10,20),plan=planDepartures([frame([outgoing,incoming]),frame([{...incoming,x:150,y:400}])],{panels:[{x:0,y:480,width:400,height:120}]});
 assert.notEqual(plan.departures[0].side,'bottom');
});
test('planning and sampling preserve frame, edge and source snapshots',()=>{
 const {frames,outgoing}=scene();frames[0].edges=[{id:'native-derive',source:'system',target:'challenge',kind:'derive'}];const before=structuredClone(frames);const plan=planDepartures(frames);plan.sampleNode('challenge',.2,sample(outgoing,{...outgoing,opacity:0}));assert.deepEqual(frames,before);assert.notEqual(plan.departures[0].from,outgoing);
});
test('invisible abandoned snapshots do not schedule departures',()=>{
 const {frames}=scene();frames[0].nodes[0].opacity=0;assert.equal(planDepartures(frames).departures.length,0);
});

test('a new boundary representation keeps its own key and waits for active departure',()=>{
 const {outgoing,incoming,final}=scene(),marker=node('boundary:challenge',0,230,{semanticId:'challenge',context:true,kind:'context-boundary',width:0,height:0,opacity:.22}),plan=planDepartures([frame([outgoing,incoming]),frame([final,marker])]);
 const sampler=sample({...marker,opacity:0},marker);assert.deepEqual(plan.contextReturns,['boundary:challenge']);assert.equal(plan.sampleNode(marker.key,.5,sampler).opacity,0);assert.ok(plan.sampleNode(marker.key,.9,sampler).opacity>0);assert.equal(plan.sampleNode(marker.key,.9,sampler).key,marker.key);assert.deepEqual(plan.sampleNode(marker.key,1,sampler),marker);
});

test('departure chooses a clear side exit instead of crossing a retained card above',()=>{
 const outgoing=node('old',150,170),retained=node('retained',150,50),incoming=node('incoming',10,400),final={...incoming,x:150,y:170},plan=planDepartures([frame([outgoing,retained,incoming]),frame([retained,final])]);
 assert.ok(['left','right'].includes(plan.departures[0].side));
 for(let p=0;p<=.28;p+=.001){const current=plan.sampleNode('old',p,sample(outgoing,{...outgoing,opacity:0}));if(current.opacity>.001)assert.equal(overlap(current,retained),false);}
});
test('when all exits are blocked the card finishes fading before reaching another card',()=>{
 const outgoing=node('old',150,170),incoming=node('incoming',10,400),obstacles=[node('up',150,50),node('left',20,170),node('right',280,170),node('down',150,270)],final={...incoming,x:150,y:170},plan=planDepartures([frame([outgoing,incoming,...obstacles]),frame([final,...obstacles])]);
 assert.ok(plan.departures[0].fadeUntil<1);
 for(let p=0;p<=.28;p+=.0005){const current=plan.sampleNode('old',p,sample(outgoing,{...outgoing,opacity:0}));if(current.opacity>.000001)for(const obstacle of obstacles)assert.equal(overlap(current,obstacle),false);}
 const gone=plan.sampleNode('old',.28,sample(outgoing,{...outgoing,opacity:0}));assert.equal(gone.opacity,0);
});
test('native ancestor bodies allow departure but ancestor headers remain obstacles',()=>{
 const owner=node('owner',0,0,{width:400,height:550,headerHeight:40}),outgoing=node('old',150,60,{parentId:'owner'}),incoming=node('incoming',10,400,{parentId:'owner'}),final={...incoming,x:150,y:60},plan=planDepartures([frame([owner,outgoing,incoming]),frame([owner,final])]);
 assert.notEqual(plan.departures[0].side,'top');
 const unrelated={...owner,id:'unrelated',key:'unrelated'};const enclosed=planDepartures([frame([unrelated,outgoing,incoming]),frame([unrelated,final])]);
 assert.ok(enclosed.departures.length>0); // Overlap does not manufacture native ancestry.
});

test('held replacements start moving with continuous position and zero initial velocity',()=>{
 const {frames,incoming,final}=scene(),plan=planDepartures(frames),sampler=sample(incoming,final),epsilon=.00001;
 const before=plan.sampleNode('system',.31-epsilon,sampler),at=plan.sampleNode('system',.31,sampler),after=plan.sampleNode('system',.31+epsilon,sampler);
 assert.equal(before.y,at.y);assert.ok(Math.abs((after.y-at.y)/epsilon)<.05);
 const finish=plan.sampleNode('system',1-epsilon,sampler);assert.ok(Math.abs((final.y-finish.y)/epsilon)<.05);
});
