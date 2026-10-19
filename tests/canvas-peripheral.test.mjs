import test from 'node:test';
import assert from 'node:assert/strict';
import {surroundingContext,positionSurrounding,decisionOrder} from '../src/canvas-prototype/context.mjs';
import {preparePeripheral} from '../src/canvas-prototype/peripheral.mjs';
import {routePeripheralEdges,routeConflicts,peripheralRoutingMetrics,isLongPeripheralDetour} from '../src/canvas-prototype/peripheral-routing.mjs';
import {routeIsClear,routeConnectsEndpoints} from '../src/canvas-prototype/geometry.mjs';
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

test('full contextual links retain native labels and produce finalized routes',()=>{
 const a=active('parent',{x:180,y:70}),c=context([a],[edge('derive','child','parent')]);
 const placed=preparePeripheral(c,[a],{x:0,y:0,width:500,height:400});
 assert.equal(placed.nodes.length,1);assert.equal(placed.edges.length,1);assert.equal(placed.edges[0].label,'derive');assert.equal(placed.stubEdges.length,0);
});


test('full inactive routes avoid an active corridor without moving or changing active content',()=>{
 const nodes=[{id:'ghost',context:true,x:40,y:30,width:80,height:45},{id:'active',x:300,y:240,width:100,height:50}];
 const activeEdges=[{id:'protected',points:[{x:140,y:140},{x:290,y:140}],labelBox:{x:180,y:115,width:45,height:16}}];
 const originals=structuredClone({nodes,activeEdges}),edges=[edge('native:context','ghost','active')];
 const result=routePeripheralEdges(edges,nodes,{x:0,y:0,width:440,height:330},{activeEdges});
 assert.equal(result.edges.length,1);assert.equal(result.metrics.blocked,0);assert.equal(result.metrics.crossings,0);assert.equal(result.metrics.overlapLength,0);
 assert.ok(result.edges[0].labelBox);assert.ok(routeIsClear(result.edges[0].points,edges[0],nodes));assert.ok(routeConnectsEndpoints(result.edges[0].points,edges[0],nodes));
 assert.deepEqual({nodes,activeEdges},originals);assert.equal(result.edges[0].source,'ghost');assert.equal(result.edges[0].target,'active');
});

test('inactive links reroute together to avoid crossings and accidental shared buses',()=>{
 const nodes=[{id:'a',x:30,y:30,width:70,height:40},{id:'b',x:320,y:30,width:70,height:40},{id:'c',x:30,y:250,width:70,height:40},{id:'d',x:320,y:250,width:70,height:40}];
 const edges=[edge('a-d','a','d'),edge('b-c','b','c')],result=routePeripheralEdges(edges,nodes,{x:0,y:0,width:430,height:340});
 assert.equal(result.metrics.blocked,0);assert.equal(result.metrics.crossings,0);assert.equal(result.metrics.overlapLength,0);
 for(const e of result.edges){assert.ok(e.labelBox);assert.ok(routeIsClear(e.points,e,nodes));assert.ok(routeConnectsEndpoints(e.points,e,nodes));}
 assert.equal(new Set(result.edges.map(e=>e.id)).size,2);
 assert.ok(routeConflicts([{x:0,y:10},{x:100,y:10}],[{x:20,y:10},{x:80,y:10}]).overlapLength===60,'overlap is a conflict even without a geometric crossing');
});

test('final peripheral API returns usable labeled routes and discloses truly blocked routes',()=>{
 const a=active('parent',{x:180,y:70}),c=context([a],[edge('derive','child','parent')]),original=structuredClone({a,c});
 const placed=preparePeripheral(c,[a],{x:0,y:0,width:500,height:400});
 assert.equal(placed.routedEdges.length,1);assert.equal(placed.routedEdges[0].routingBlocked,false);assert.ok(placed.routedEdges[0].labelBox);assert.equal(placed.routingMetrics.blocked,0);
 assert.deepEqual({a,c},original);
 const blocked=routePeripheralEdges([edge('blocked','a','b')],[{id:'a',x:20,y:20,width:80,height:40},{id:'b',x:200,y:20,width:80,height:40}],{x:0,y:0,width:300,height:80},{obstacles:[{x:110,y:0,width:80,height:80}]});
 assert.equal(blocked.metrics.blocked,1);assert.deepEqual(blocked.edges[0].points,[]);assert.equal(blocked.edges[0].routingBlocked,true);
 assert.equal(peripheralRoutingMetrics(blocked.edges).blocked,1);
});


test('unavoidable inactive-active crossing remains visible and measurable instead of hiding context',()=>{
 const nodes=[{id:'left',x:20,y:80,width:60,height:40},{id:'right',x:220,y:180,width:60,height:40}],protectedEdges=[{id:'wall',points:[{x:150,y:0},{x:150,y:300}]}];
 const result=routePeripheralEdges([edge('native:crossing','left','right')],nodes,{x:0,y:0,width:300,height:300},{activeEdges:protectedEdges});
 assert.equal(result.metrics.blocked,0);assert.equal(result.edges.length,1);assert.ok(result.edges[0].points.length);assert.ok(result.edges[0].labelBox);assert.ok(result.metrics.crossings>0);assert.equal(result.metrics.overlapLength,0);
});


test('protected labels also obstruct terminal stubs rather than only the middle of a route',()=>{
 const nodes=[{id:'a',x:20,y:100,width:100,height:50},{id:'b',x:260,y:100,width:100,height:50}],edges=[edge('native:label-stub','a','b')];
 for(const labelBox of [{x:121,y:116,width:4,height:18},{x:121,y:92,width:4,height:65}]){
  const result=routePeripheralEdges(edges,nodes,{x:0,y:0,width:400,height:300},{activeEdges:[{points:[],labelBox}]});
  assert.equal(result.metrics.blocked,0);const route=result.edges[0];
  for(let i=1;i<route.points.length;i++){const a=route.points[i-1],b=route.points[i];assert.ok(!(a.y===b.y&&a.y>labelBox.y&&a.y<labelBox.y+labelBox.height&&Math.min(a.x,b.x)<labelBox.x+labelBox.width&&Math.max(a.x,b.x)>labelBox.x),'no route segment crosses a protected label');}
 }
});


test('inactive links to the same native endpoint keep distinct terminals and jointly reserved labels',()=>{
 const nodes=[{id:'parent',x:180,y:30,width:140,height:70},{id:'left',x:40,y:240,width:100,height:50},{id:'right',x:330,y:240,width:100,height:50}],edges=[edge('left-parent','left','parent'),edge('right-parent','right','parent')];
 const result=routePeripheralEdges(edges,nodes,{x:0,y:0,width:500,height:350});
 assert.equal(result.metrics.blocked,0);assert.equal(result.metrics.crossings,0);assert.equal(result.metrics.overlapLength,0);
 assert.notDeepEqual(result.edges[0].points.at(-1),result.edges[1].points.at(-1),'distinct relationships have distinct target attachments');
 const [a,b]=result.edges.map(e=>e.labelBox);assert.ok(a&&b);assert.ok(a.x+a.width<=b.x||b.x+b.width<=a.x||a.y+a.height<=b.y||b.y+b.height<=a.y);
 for(const route of result.edges)for(const other of result.edges.filter(e=>e.id!==route.id))for(let i=1;i<route.points.length;i++){
  const p=route.points[i-1],q=route.points[i],r=other.labelBox;
  assert.ok(!(p.x===q.x?p.x>r.x&&p.x<r.x+r.width&&Math.min(p.y,q.y)<r.y+r.height&&Math.max(p.y,q.y)>r.y:p.y>r.y&&p.y<r.y+r.height&&Math.min(p.x,q.x)<r.x+r.width&&Math.max(p.x,q.x)>r.x),'a route never crosses another context label');
 }
});


test('a single modest unavoidable context crossing retains its full card and reports the crossing',()=>{
 const a=active('parent',{x:150,y:180,width:100,height:50}),c=context([a],[edge('native:single-crossing','child','parent')]);
 const area={x:0,y:0,width:400,height:400},activeEdges=[{id:'protected-wall',points:[{x:0,y:245},{x:400,y:245}]}],options={activeEdges,obstacles:[{x:0,y:244,width:400,height:2}]};
 const placed=preparePeripheral(c,[a],area,options);
 assert.equal(placed.nodes.length,1);assert.equal(placed.routedEdges.length,1);assert.equal(placed.routedEdges[0].continuation,undefined);assert.equal(placed.routingMetrics.crossings,1);assert.equal(placed.routingMetrics.overlapLength,0);
 assert.ok(placed.notices.some(n=>n.reason==='context-route-conflict'&&n.crossings===1));assert.ok(!placed.notices.some(n=>n.reason==='context-route-continuation'));
});

test('dense crossings may shorten peripheral context and report why, rather than retaining a wire maze',()=>{
 const a=active('parent',{x:150,y:180,width:100,height:50}),c=context([a],[edge('native:dense-crossing','child','parent')]);
 const area={x:0,y:0,width:400,height:400},activeEdges=[245,280].map(y=>({id:'wall-'+y,points:[{x:0,y},{x:400,y}]})),options={activeEdges,obstacles:[{x:0,y:244,width:400,height:2},{x:0,y:279,width:400,height:2}]};
 const placed=preparePeripheral(c,[a],area,options);
 assert.equal(placed.nodes.length,0);assert.ok(placed.notices.some(n=>n.reason==='context-route-continuation'&&n.reasons.some(r=>r.reason==='dense-crossing')));
 assert.ok(placed.stubEdges.length||placed.omissions.some(o=>o.reason==='context-continuation-space'),'shortened or omitted link remains explicitly disclosed');
});

test('one physical crossing at a bend or T contact is counted once, while shared route length remains explicit',()=>{
 const bent=[{x:0,y:50},{x:50,y:50},{x:50,y:100}],straight=[{x:50,y:0},{x:50,y:50},{x:100,y:50}];
 assert.deepEqual(routeConflicts(bent,straight),{crossings:1,overlapLength:0});
 const bus=routeConflicts([{x:0,y:50},{x:50,y:50},{x:100,y:50}],[{x:25,y:50},{x:75,y:50}]);
 assert.equal(bus.crossings,0);assert.equal(bus.overlapLength,50);
});


test('long peripheral detour requires both substantial excess and triple direct distance',()=>{
 assert.equal(isLongPeripheralDetour([{x:0,y:0},{x:0,y:200},{x:200,y:200},{x:200,y:0},{x:50,y:0}]),true);
 assert.equal(isLongPeripheralDetour([{x:0,y:0},{x:0,y:1000}]),false,'a long but direct native link is not shortened');
 assert.equal(isLongPeripheralDetour([{x:0,y:0},{x:0,y:30},{x:30,y:30},{x:30,y:0},{x:10,y:0}]),false,'small local detour has insufficient excess');
 assert.equal(isLongPeripheralDetour([{x:75,y:391},{x:75,y:383},{x:18,y:383},{x:18,y:18},{x:138,y:18},{x:138,y:51},{x:130,y:51}]),false,'full-frame link with1.5timesstretch remains eligible for full context');
});
