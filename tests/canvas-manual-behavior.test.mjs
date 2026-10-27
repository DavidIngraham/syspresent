import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import ELK from 'elkjs/lib/elk.bundled.js';
import {layoutDiagram} from '../src/canvas-prototype/elk-layout.mjs';
import {fitDiagram,routeConnectsEndpoints,routeIsClear} from '../src/canvas-prototype/geometry.mjs';
import {manualLayoutSupport,manualLayoutCoverage,moveLayoutNode,applyManualPositions} from '../src/canvas-prototype/manual-layout.mjs';
import {createPresentationLayouts,savePresentationLayouts,loadPresentationLayouts} from '../src/canvas-prototype/presentation-layout.mjs';
import {normalizeProject,packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const {views}=JSON.parse(await readFile(new URL('fixtures/canvas-views/behaviors.native.json',import.meta.url))),area={x:0,y:0,width:2400,height:1800};
const layouts=new Map();
async function fixture(name){if(!layouts.has(name))layouts.set(name,fitDiagram(await layoutDiagram(structuredClone(views[name]),{elk:new ELK(),width:area.width,height:area.height}),area));return structuredClone(layouts.get(name));}
const bySemantic=(layout,id)=>layout.nodes.find(node=>node.semanticId===id);
const edgeIdentity=layout=>layout.edges.map(({id,semanticId,source,target,kind,label,guard,fromPort,toPort,sourceAttachment,targetAttachment})=>({id,semanticId,source,target,kind,label,guard,fromPort,toPort,sourceAttachment,targetAttachment}));
function safeRoutes(layout){for(const edge of layout.edges){if(edge.routingBlocked)continue;const attached={...edge,source:edge.sourceAttachment??edge.source,target:edge.targetAttachment??edge.target};assert.equal(routeConnectsEndpoints(edge.points,attached,layout.nodes),true,edge.id);assert.equal(routeIsClear(edge.points,attached,layout.nodes),true,edge.id);}}

test('actual native graph coverage distinguishes containers, actions, states, faults, controls and sequence ordering',async()=>{
 const mixed=await fixture('mixed'),coverage=manualLayoutCoverage(mixed),entry=id=>coverage.find(item=>item.semanticId===id);
 assert.equal(entry('DeskFan__StartCycle').constraint,'rigid');assert.equal(entry('DeskFan__StartCycle__energize').constraint,'horizontal');assert.equal(entry('DeskFan__StartCycle__prepare').constraint,'horizontal');
 assert.equal(entry('DeskFan__operating').constraint,'rigid');assert.equal(entry('DeskFan__operating__idle').constraint,'free');assert.equal(entry('BehaviorViews__control').constraint,'free');
 assert.ok(coverage.filter(item=>!item.semanticId).every(item=>!item.supported&&/owning native container/.test(item.reason)));
 const fault=await fixture('fault');assert.ok(manualLayoutCoverage(fault).every(item=>item.supported&&item.constraint==='horizontal'));
 const sequence=await fixture('sequence');assert.ok(manualLayoutCoverage(sequence).every(item=>!item.supported&&/participant\/message ordering/.test(item.reason)));
});
test('native state container and leaf moves preserve transition topology, boundaries and stationary peers',async()=>{
 const source=await fixture('state'),before=structuredClone(source),root=bySemantic(source,'DeskFan__operating'),whole=moveLayoutNode(source,{id:root.id,x:root.x+30,y:root.y+40},{area});
 assert.deepEqual(source,before);assert.deepEqual(edgeIdentity(whole),edgeIdentity(source));
 for(const node of whole.nodes){const old=source.nodes.find(item=>item.id===node.id);assert.ok(Math.abs(node.x-old.x-30)<1e-6);assert.ok(Math.abs(node.y-old.y-40)<1e-6);assert.equal(node.parentId,old.parentId);assert.equal(node.kind,old.kind);}
 safeRoutes(whole);
 const idle=bySemantic(source,'DeskFan__operating__idle'),leaf=moveLayoutNode(source,{id:idle.id,x:idle.x+2,y:idle.y+1},{area});
 for(const node of leaf.nodes)if(node.id!==idle.id)assert.deepEqual(node,source.nodes.find(item=>item.id===node.id));
 assert.deepEqual(edgeIdentity(leaf),edgeIdentity(source));safeRoutes(leaf);
 const start=source.nodes.find(node=>node.kind==='start');assert.throws(()=>moveLayoutNode(source,{id:start.id,x:start.x+1,y:start.y}),/owning native container/);
});
test('native mixed action branches move horizontally while mapped controls and guards retain identity',async()=>{
 const source=await fixture('mixed'),before=structuredClone(source),action=bySemantic(source,'DeskFan__StartCycle__energize');
 const moved=moveLayoutNode(source,{id:action.id,x:action.x+2,y:action.y},{area});assert.deepEqual(source,before);assert.deepEqual(edgeIdentity(moved),edgeIdentity(source));safeRoutes(moved);
 for(const node of moved.nodes)if(node.id!==action.id)assert.deepEqual(node,source.nodes.find(item=>item.id===node.id));
 assert.throws(()=>moveLayoutNode(source,{id:action.id,x:action.x,y:action.y+2},{area}),/only horizontally.*reading layer/);
 const control=bySemantic(source,'DeskFan__StartCycle__permission'),shifted=moveLayoutNode(source,{id:control.id,x:control.x+2,y:control.y},{area});assert.deepEqual(edgeIdentity(shifted),edgeIdentity(source));safeRoutes(shifted);
 const guards=source.edges.filter(edge=>edge.label);assert.ok(guards.length>0);for(const guard of guards){const current=shifted.edges.find(edge=>edge.id===guard.id);assert.equal(current.label,guard.label);if(guard.labelBox&&!guard.labelOmitted)assert.ok(current.labelBox);}
});
test('concurrent branch horizontal swaps preserve fork/join endpoints rather than claiming semantic lane order',async()=>{
 const source=await fixture('mixed'),left=bySemantic(source,'DeskFan__StartCycle__energize'),right=bySemantic(source,'DeskFan__StartCycle__recordRequest');assert.equal(left.y,right.y);
 const moved=applyManualPositions(source,{[left.id]:{x:right.x,y:left.y},[right.id]:{x:left.x,y:right.y}},{area});
 assert.equal(moved.nodes.find(node=>node.id===left.id).x,right.x);assert.equal(moved.nodes.find(node=>node.id===right.id).x,left.x);assert.deepEqual(edgeIdentity(moved),edgeIdentity(source));safeRoutes(moved);
});
test('whole native action containers translate rigidly and mixed structural nodes remain independently movable',async()=>{
 const source=await fixture('mixed'),root=bySemantic(source,'DeskFan__StartCycle'),moved=moveLayoutNode(source,{id:root.id,x:root.x+2,y:root.y+2},{area}),descendants=new Set([root.id]);
 for(let changed=true;changed;){changed=false;for(const node of source.nodes)if(descendants.has(node.parentId)&&!descendants.has(node.id)){descendants.add(node.id);changed=true;}}
 for(const node of moved.nodes){const old=source.nodes.find(item=>item.id===node.id);assert.ok(Math.abs(node.x-old.x-(descendants.has(node.id)?2:0))<1e-6);assert.ok(Math.abs(node.y-old.y-(descendants.has(node.id)?2:0))<1e-6);}
 assert.deepEqual(edgeIdentity(moved),edgeIdentity(source));safeRoutes(moved);
 const part=bySemantic(source,'BehaviorViews__control'),structural=moveLayoutNode(source,{id:part.id,x:part.x,y:part.y+2},{area});assert.equal(structural.nodes.find(node=>node.id===part.id).y,part.y+2);assert.deepEqual(edgeIdentity(structural),edgeIdentity(source));
});
test('native fault gates and a shared cause keep established vertical reading layers and causal identities',async()=>{
 const source=await fixture('fault'),before=structuredClone(source);
 for(const id of ['PowerSupply__common','PowerSupply__left','PowerSupply__loss']){
  const event=bySemantic(source,id),moved=moveLayoutNode(source,{id:event.id,x:event.x+2,y:event.y},{area});assert.deepEqual(edgeIdentity(moved),edgeIdentity(source));assert.ok(moved.nodes.every(node=>node.y===source.nodes.find(item=>item.id===node.id).y));safeRoutes(moved);
  assert.throws(()=>moveLayoutNode(source,{id:event.id,x:event.x,y:event.y+1},{area}),/only horizontally/);
 }
 assert.equal(source.edges.filter(edge=>edge.source===bySemantic(source,'PowerSupply__common').id).length,2);assert.deepEqual(source,before);
});
test('portable behavioral offsets preserve native metadata and reject unsafe vertical action replay',async()=>{
 const layout=await fixture('mixed'),action=bySemantic(layout,'DeskFan__StartCycle__energize'),view={id:'BehaviorViews::mixed',kind:'mixed'},store=createPresentationLayouts(),project=normalizeProject({files:{'model.sysml':'package Example { action run; }'}}),before=structuredClone(project);
 store.capture(view,layout,{positions:{[action.id]:{x:action.x+2,y:action.y}},area});const saved=unpackProject(packProject(savePresentationLayouts(project,store))),restored=loadPresentationLayouts(saved).restore(view,layout,{area});assert.equal(restored.omissions.length,0);assert.equal(restored.positions[action.id].y,action.y);assert.equal(fileText(saved,'model.sysml'),fileText(project,'model.sysml'));assert.deepEqual(project,before);
 const snapshot=store.snapshot();snapshot.views[0].placements[0].offset.y=1/area.height;store.fromSnapshot(snapshot);const unsafe=store.restore(view,layout,{area});assert.equal(Object.keys(unsafe.positions).length,0);assert.match(unsafe.omissions[0].message,/only horizontally/);
});
test('behavioral gestures reject lost visible native labels and keep opaque guard metadata intact',()=>{
 const guard={semanticId:'native-guard',expression:'opaque-native-expression'},source={kind:'action',nodes:[{id:'a',semanticId:'native-a',kind:'action',x:0,y:0,width:100,height:60},{id:'b',semanticId:'native-b',kind:'action',x:200,y:100,width:100,height:60}],edges:[{id:'edge',semanticId:'native-edge',source:'a',target:'b',kind:'succession',label:'Native relationship text',guard,points:[{x:100,y:30},{x:150,y:30},{x:150,y:130},{x:200,y:130}],labelBox:{x:120,y:65,width:50,height:16}}]};
 const moved=moveLayoutNode(source,{id:'a',x:20,y:0},{area});assert.deepEqual(moved.edges[0].guard,guard);assert.equal(moved.edges[0].label,source.edges[0].label);
 assert.throws(()=>moveLayoutNode(source,{id:'a',x:20,y:0},{area:{x:0,y:0,width:1,height:1},measureLabel:()=>({width:400,height:20})}),/Native labels and guards must remain visible/);
});
