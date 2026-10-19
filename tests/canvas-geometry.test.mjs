import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutScene} from '../src/canvas-prototype/core/index.mjs';
import {graphArea,fitNodes,fitDiagram,routeEdges,routeIsClear} from '../src/canvas-prototype/geometry.mjs';
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const fixture=()=>({kind:'requirement',nodes:[{id:'traffic',semanticId:'native-traffic',width:280,height:185},...['tracking','assessment','command','fault'].map(id=>({id,semanticId:'native-'+id,width:160,height:76}))],edges:['tracking','assessment','command','fault'].map(id=>({id:'derive-'+id,source:id,target:'traffic',kind:'derive',label:'derive'}))});
const segmentCrosses=(a,b,n)=>a.x===b.x?a.x>n.x+.01&&a.x<n.x+n.width-.01&&Math.max(a.y,b.y)>n.y+.01&&Math.min(a.y,b.y)<n.y+n.height-.01:a.y===b.y&&a.y>n.y+.01&&a.y<n.y+n.height-.01&&Math.max(a.x,b.x)>n.x+.01&&Math.min(a.x,b.x)<n.x+n.width-.01;

test('phone shared-parent scene uses compact two-column peers above the prose, with no reserved-panel hole',()=>{
 const panel={x:12,y:342,width:366,height:250},area=graphArea(390,650,[panel]),source=fixture();
 const layout=layoutScene(source,{width:area.width,height:area.height,padding:8,gap:34,panels:[]}),fitted=fitNodes(layout.nodes,area);
 assert.ok(fitted.scale>.7,'active diagram must not be minified to fit phantom narrative whitespace');
 const nodes=Object.fromEntries(fitted.nodes.map(n=>[n.id,n]));
 assert.equal(nodes.assessment.y,nodes.command.y);assert.equal(nodes.fault.y,nodes.tracking.y);assert.ok(nodes.traffic.y<nodes.assessment.y);
 for(const n of fitted.nodes){assert.equal(overlap(n,panel),false);assert.ok(n.x>=area.x&&n.y>=area.y&&n.x+n.width<=area.x+area.width+.001&&n.y+n.height<=area.y+area.height+.001);}
 const routes=routeEdges(layout.edges,fitted.nodes,{area,measureLabel:()=>({width:36,height:16})});
 assert.equal(routes.length,4);assert.equal(new Set(routes.map(r=>r.points.at(-1).x)).size,4,'shared target has distinct stable endpoint ports');
 for(const edge of routes){assert.equal(edge.routingBlocked,false);assert.ok(edge.labelBox,'every visible derivation has a measured label');assert.equal(edge.labelOmitted,undefined);assert.equal(edge.target,'traffic');
  for(const n of fitted.nodes)assert.equal(overlap(edge.labelBox,n),false,'label cannot cover an active card');
  for(let i=1;i<edge.points.length;i++)for(const n of fitted.nodes)assert.equal(segmentCrosses(edge.points[i-1],edge.points[i],n),false,'path cannot pass through active cards');
 }
 for(let i=0;i<routes.length;i++)for(let j=i+1;j<routes.length;j++)assert.equal(overlap(routes[i].labelBox,routes[j].labelBox),false,'individual derivation labels cannot overlap');
 assert.deepEqual(source,fixture(),'disposable layout never mutates native identity or endpoints');
});

test('measured side and bottom panels select one unobstructed active reading rectangle',()=>{
 const panels=[{x:620,y:12,width:360,height:570},{x:12,y:560,width:580,height:120}],area=graphArea(1000,740,panels);
 assert.ok(area.width>500&&area.height>400);
 for(const p of panels)assert.equal(overlap(area,p),false);
 const l=layoutScene(fixture(),{width:390,height:650,padding:8,gap:24,panels:[{x:12,y:342,width:366,height:250}]});
 assert.ok(Math.max(...l.nodes.map(n=>n.y+n.height))-Math.min(...l.nodes.map(n=>n.y))<420,'a prose rectangle must never introduce an empty layout row');
});

test('unplaceable labels are explicitly reported rather than drawn over cards',()=>{
 const nodes=[{id:'a',x:0,y:0,width:100,height:80},{id:'b',x:0,y:90,width:100,height:80}],edges=[{id:'native',source:'a',target:'b',label:'a label larger than the whole available area'}];
 const [r]=routeEdges(edges,nodes,{area:{x:0,y:0,width:100,height:170},measureLabel:()=>({width:400,height:20})});
 assert.equal(r.labelOmitted,true);assert.equal(r.labelBox,undefined);assert.equal(r.id,'native');assert.equal(r.source,'a');assert.equal(r.target,'b');
});


test('duplicate zero-size peripheral boundary markers are endpoints, never routing obstacles',()=>{
 const area={x:16,y:16,width:358,height:310},source=fixture(),layout=layoutScene(source,{width:area.width,height:area.height,padding:8,gap:34}),fitted=fitNodes(layout.nodes,area);
 const markers=['outside-a','outside-b','outside-c'].map(id=>({id,x:area.x+area.width+8,y:100,width:0,height:0}));
 const edges=[{id:'out-a',source:'tracking',target:'outside-a'},{id:'out-b',source:'assessment',target:'outside-b'},{id:'in-c',source:'outside-c',target:'command'}];
 const routes=routeEdges(edges,[...fitted.nodes,...markers],{area});
 assert.equal(routes.length,3);
 for(const [i,route]of routes.entries()){
  assert.equal(route.routingBlocked,false,'coincident zero-size markers cannot obstruct their neighbors');assert.equal(route.source,edges[i].source);assert.equal(route.target,edges[i].target);
  const marker=markers[i],endpoint=i===2?route.points[0]:route.points.at(-1);assert.deepEqual(endpoint,{x:marker.x,y:marker.y});
  for(let j=1;j<route.points.length;j++){const a=route.points[j-1],b=route.points[j];assert.ok(a.x===b.x||a.y===b.y,'native directed route remains orthogonal');for(const card of fitted.nodes)assert.equal(segmentCrosses(a,b,card),false,'peripheral connection cannot cross active cards');}
 }
});


test('actual narrow-phone derivation geometry retains all four labels in clear local gutters',()=>{
 const nodes=[
  {id:'parent',x:124.0422,y:24.8697,width:141.9156,height:67.4099},
  {id:'tracking',x:45.9886,y:118.0018,width:141.9156,height:67.4099},
  {id:'assessment',x:202.0958,y:117.1149,width:141.9156,height:69.18385},
  {id:'command',x:45.9886,y:211.1339,width:141.9156,height:69.1839},
  {id:'fault',x:202.0958,y:211.1339,width:141.9156,height:69.1839}
 ];
 const edges=nodes.slice(1).map(n=>({id:n.id,source:n.id,target:'parent',kind:'derive',label:'derive'}));
 const area={x:16,y:16,width:358,height:290},routes=routeEdges(edges,nodes,{area,measureLabel:()=>({width:33.15,height:16})});
 for(const route of routes){
  assert.ok(route.labelBox,'every active native derivation keeps its visible label');assert.equal(route.labelOmitted,undefined);assert.equal(route.routingBlocked,false);
  for(const card of nodes)assert.equal(overlap(route.labelBox,card),false);
  assert.ok(route.labelBox.x>=area.x&&route.labelBox.y>=area.y&&route.labelBox.x+route.labelBox.width<=area.x+area.width&&route.labelBox.y+route.labelBox.height<=area.y+area.height);
  if(route.labelLeader){
   const {from,to}=route.labelLeader;assert.ok(Math.hypot(from.x-to.x,from.y-to.y)<12,'offset label remains beside its own branch');
   assert.ok(Math.abs(from.x-to.x)<.001||Math.abs(from.y-to.y)<.001);
   for(const card of nodes)assert.equal(segmentCrosses(from,to,card),false,'short label leader cannot cross an active card');
  }
 }
 for(let i=0;i<routes.length;i++)for(let j=i+1;j<routes.length;j++)assert.equal(overlap(routes[i].labelBox,routes[j].labelBox),false);
});

test('camera includes complete routes and labels without letting peripheral context change its fit',()=>{
 const diagram={nodes:[{id:'a',x:100,y:100,width:100,height:70}],edges:[{id:'e',points:[{x:150,y:170},{x:150,y:300},{x:400,y:300}],labelBox:{x:300,y:310,width:120,height:16},x:300,y:322}]},area={x:16,y:20,width:358,height:240},fitted=fitDiagram(diagram,area);
 for(const rect of [...fitted.nodes,...fitted.edges.map(e=>e.labelBox)]){assert.ok(rect.x>=area.x&&rect.y>=area.y);assert.ok(rect.x+rect.width<=area.x+area.width&&rect.y+rect.height<=area.y+area.height);}for(const point of fitted.edges[0].points)assert.ok(point.x<=area.x+area.width&&point.y<=area.y+area.height);
});
test('moving routes cannot cross an unrelated tile, a header or a real port owner body',()=>{
 const nodes=[{id:'assembly',x:0,y:0,width:400,height:350,headerHeight:50},{id:'owner',parentId:'assembly',x:100,y:100,width:100,height:80},{id:'pin',kind:'port',parentId:'owner',x:194,y:130,width:12,height:12},{id:'b',parentId:'assembly',x:280,y:100,width:100,height:80}];
 const edge={source:'pin',target:'b'};
 assert.equal(routeIsClear([{x:206,y:136},{x:280,y:136}],edge,nodes),true);
 assert.equal(routeIsClear([{x:194,y:136},{x:150,y:136},{x:150,y:80},{x:300,y:80},{x:300,y:100}],edge,nodes),false);
 assert.equal(routeIsClear([{x:206,y:136},{x:230,y:136},{x:230,y:20},{x:300,y:20},{x:300,y:100}],edge,nodes),false);
});
