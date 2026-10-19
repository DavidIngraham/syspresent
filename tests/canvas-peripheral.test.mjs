import test from 'node:test';
import assert from 'node:assert/strict';
import {surroundingContext,positionSurrounding,decisionOrder} from '../src/canvas-prototype/context.mjs';
import {preparePeripheral} from '../src/canvas-prototype/peripheral.mjs';
const element=id=>({id,kind:'RequirementUsage',name:id});
const edge=(id,source,target,kind='derive')=>({id,source,target,kind,label:kind,authority:'native-view'});
const active=(id='parent',extra={})=>({id:'drawing:'+id,semanticId:id,x:80,y:60,width:100,height:50,...extra});
const view=nodes=>({id:'native.requirements',kind:'requirement',nodes,edges:[]});
const context=(nodes,relationships)=>surroundingContext({elements:[...new Set(relationships.flatMap(e=>[e.source,e.target]))].map(element),relationships},view(nodes));

test('peripheral traces follow the decision chain without changing native direction',()=>{
 for(const kind of ['derive','satisfy','verify','refine']){
  const a=active('parent',{x:180,y:100}),c=context([a],[edge('native:child-parent','child','parent',kind)]);
  const placed=positionSurrounding(c,[a],{x:0,y:0,width:500,height:400});
  assert.equal(placed.nodes.length,1,kind);
  assert.ok(placed.nodes[0].y>=a.y+a.height+12,kind);
  assert.equal(placed.edges[0].semanticSource,'child');assert.equal(placed.edges[0].semanticTarget,'parent');
 }
 const c=decisionOrder(edge('allocation','function','physical','allocate'));assert.equal(c,null,'allocation has no assumed endpoint role');
 const composition=decisionOrder(edge('owns','whole','part','composition'));assert.deepEqual(composition,{above:'whole',below:'part'});
});

test('a grounding context requirement appears above its active satisfying part',()=>{
 const a=active('part',{x:180,y:200}),c=context([a],[edge('native:satisfy','part','requirement','satisfy')]);
 const placed=positionSurrounding(c,[a],{x:0,y:0,width:500,height:400});
 assert.equal(placed.nodes.length,1);assert.ok(placed.nodes[0].y+placed.nodes[0].height+12<=a.y);
});

test('native avoidance command derivation becomes a short labeled downward continuation when its child card will not fit',()=>{
 const parent='BlueDogRequirements__trafficSafety',child='BlueDogRequirements__avoidanceCommandDeadline',id='BlueDogRequirements__decomposeAvoidanceCommandDeadline';
 const a=active(parent),c=context([a],[edge(id,child,parent)]),original=structuredClone(c);
 const placed=preparePeripheral(c,[a],{x:0,y:0,width:260,height:150});
 assert.equal(placed.nodes.length,0);assert.equal(placed.edges.length,0);assert.equal(placed.stubEdges.length,1);assert.equal(placed.boundaryMarkers.length,1);
 const e=placed.stubEdges[0],marker=placed.boundaryMarkers[0];
 assert.equal(e.id,'context:'+id);assert.equal(e.semanticSource,child);assert.equal(e.semanticTarget,parent);
 assert.equal(e.source,marker.id);assert.equal(e.target,a.id);assert.equal(marker.semanticId,child);assert.equal(marker.continuationDirection,'SOUTH');
 assert.equal(marker.interactive,false);assert.equal(marker.fit,false);assert.equal(e.label,'derive');assert.ok(e.labelBox);
 assert.ok(marker.y>a.y+a.height);const length=Math.hypot(e.points[1].x-e.points[0].x,e.points[1].y-e.points[0].y);assert.ok(length>=20&&length<=36);
 assert.deepEqual(c,original);
});

test('shared hidden neighbors get separate continuation identities and do not create a false junction',()=>{
 const a=active('a',{x:5,y:20}),b=active('b',{x:145,y:20});
 const placed=preparePeripheral(context([a,b],[edge('ca','child','a'),edge('cb','child','b')]),[a,b],{x:0,y:0,width:260,height:120});
 assert.equal(placed.nodes.length,0);assert.equal(placed.stubEdges.length,2);assert.equal(placed.boundaryMarkers.length,2);
 assert.equal(new Set(placed.boundaryMarkers.map(m=>m.id)).size,2);
 assert.equal(new Set(placed.boundaryMarkers.map(m=>m.x+','+m.y)).size,2);
 assert.ok(placed.boundaryMarkers.every(m=>m.semanticId==='child'));
 assert.deepEqual(placed.stubEdges.map(e=>e.semanticTarget),['a','b']);
});

test('context continuations never use long fallback wires across blockers or outside the frame',()=>{
 const a=active(),c=context([a],[edge('child-parent','child','parent')]);
 const area={x:0,y:0,width:260,height:150},obstacles=[{id:'prose-or-route',x:0,y:111,width:260,height:39}];
 const placed=preparePeripheral(c,[a],area,{obstacles});
 assert.equal(placed.nodes.length,0);assert.equal(placed.stubEdges.length,0);assert.equal(placed.boundaryMarkers.length,0);
 assert.ok(placed.omissions.some(o=>o.reason==='context-continuation-space'&&o.relationshipId==='context:child-parent'));
});

test('full contextual links retain their relationship labels for the caller to route',()=>{
 const a=active('parent',{x:180,y:70}),c=context([a],[edge('derive','child','parent')]);
 const placed=preparePeripheral(c,[a],{x:0,y:0,width:500,height:400});
 assert.equal(placed.nodes.length,1);assert.equal(placed.edges.length,1);assert.equal(placed.edges[0].label,'derive');assert.equal(placed.stubEdges.length,0);
});
