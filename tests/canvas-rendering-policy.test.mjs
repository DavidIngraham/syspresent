import test from 'node:test';
import assert from 'node:assert/strict';
import {renderingPolicy,renderingPreferences,NOTATION_AUTHORITY} from '../src/canvas-prototype/rendering-policy.mjs';
import {createManualLayout,manualLayoutSupport,moveLayoutNode,applyManualPositions} from '../src/canvas-prototype/manual-layout.mjs';
import {routeConnectsEndpoints,routeIsClear} from '../src/canvas-prototype/geometry.mjs';

test('exploration is the default and focused notation excludes exploratory effects without a compliance claim',()=>{
 assert.equal(renderingPolicy().mode,'exploratory');assert.equal(renderingPolicy().manualLayout,true);
 const policy=renderingPolicy('focused');assert.equal(policy.contextBudget,0);assert.equal(policy.emphasis,false);assert.equal(policy.journeys,false);assert.equal(policy.manualLayout,false);
 assert.match(policy.notice,/compliance is not established/);assert.match(NOTATION_AUTHORITY.url,/www.omg.org/);
 const source={contextBudget:48,emphasis:['verify'],compartments:'expanded'},focused=renderingPreferences(source,'focused');
 assert.equal(focused.contextBudget,0);assert.deepEqual(focused.emphasis,[]);assert.equal(focused.compartments,'expanded');assert.deepEqual(source.emphasis,['verify']);
 assert.throws(()=>renderingPolicy('compliant'),/Unknown rendering mode/);
});
const fixture=()=>({kind:'requirement',nodes:[{id:'a',semanticId:'native-a',x:0,y:0,width:100,height:60},{id:'b',semanticId:'native-b',x:200,y:0,width:100,height:60},{id:'c',semanticId:'native-c',x:400,y:0,width:100,height:60}],edges:[{id:'e',semanticId:'native-e',source:'b',target:'a',kind:'derive',label:'derive'}]});

test('manual movement leaves other cards fixed and preserves native directed identity while rerouting',()=>{
 const source=fixture(),before=structuredClone(source),result=moveLayoutNode(source,{id:'a',x:0,y:140});
 assert.deepEqual(source,before);assert.deepEqual(result.nodes.slice(1),before.nodes.slice(1));assert.equal(result.nodes[0].y,140);
 const edge=result.edges[0];assert.equal(edge.id,'e');assert.equal(edge.semanticId,'native-e');assert.equal(edge.source,'b');assert.equal(edge.target,'a');assert.equal(edge.kind,'derive');
 assert.equal(edge.routingBlocked,false);assert.equal(routeConnectsEndpoints(edge.points,edge,result.nodes),true);assert.equal(routeIsClear(edge.points,edge,result.nodes),true);
});

test('manual overlap, compounds, native ports and behavior fail explicitly',()=>{
 assert.throws(()=>moveLayoutNode(fixture(),{id:'a',x:220,y:0}),/overlaps/);
 assert.throws(()=>moveLayoutNode(fixture(),{id:'a',x:NaN,y:0}),/finite/);
 const compound=fixture();compound.nodes[0].parentId='owner';assert.match(manualLayoutSupport(compound,'a').reason,/compound/);
 const ports=fixture();ports.edges[0].fromPort='native-pin';assert.equal(manualLayoutSupport(ports,'a').supported,false);
 const action=fixture();action.kind='action';assert.match(manualLayoutSupport(action,'a').reason,/behavioral/);
});

test('manual drawing state is session-local, view-specific and copied at the boundary',()=>{
 const store=createManualLayout();store.set('view-a:geometry-1','representation-a',{x:10,y:20});
 const position=store.get('view-a:geometry-1');position['representation-a'].x=999;
 assert.equal(store.get('view-a:geometry-1')['representation-a'].x,10);assert.deepEqual(store.get('view-b'),{});
 store.clear('view-a:geometry-1');assert.deepEqual(store.get('view-a:geometry-1'),{});
 assert.throws(()=>store.set('view-a','a',{x:Infinity,y:0}),/finite/);
});

test('rerouting drops obsolete label geometry when the new label does not fit',()=>{
 const source=fixture();source.edges[0].labelBox={x:100,y:10,width:30,height:16};source.edges[0].labelLeader={from:{x:100,y:10},to:{x:110,y:30}};
 const result=moveLayoutNode(source,{id:'a',x:0,y:140},{area:{x:0,y:0,width:1,height:1},measureLabel:()=>({width:400,height:20})});
 assert.equal(result.edges[0].labelOmitted,true);assert.equal(result.edges[0].labelBox,undefined);assert.equal(result.edges[0].labelLeader,undefined);assert.ok(result.omissions.some(item=>item.reason==='label-space'&&item.relationshipId==='native-e'));
});

test('manual arrangement replay validates the final peer positions together',()=>{
 const source=fixture();
 const result=applyManualPositions(source,{a:{x:200,y:0},b:{x:0,y:0}});
 assert.equal(result.nodes[0].x,200);assert.equal(result.nodes[1].x,0);assert.equal(result.edges[0].source,'b');assert.equal(result.edges[0].target,'a');assert.equal(result.edges[0].routingBlocked,false);
 assert.deepEqual(source,fixture());
});

test('manual placement accepts only geometry and preserves opaque representation identities',()=>{
 const source=fixture(),result=applyManualPositions(source,{a:{x:0,y:140,id:'forged',semanticId:'forged'}});
 assert.equal(result.nodes[0].id,'a');assert.equal(result.nodes[0].semanticId,'native-a');
 const store=createManualLayout();store.set('view','__proto__',{x:3,y:4});assert.deepEqual(store.get('view')['__proto__'],{x:3,y:4});
});
