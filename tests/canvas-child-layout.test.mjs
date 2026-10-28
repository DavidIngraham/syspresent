import test from 'node:test';
import assert from 'node:assert/strict';
import {layoutChildWorkspace,placeChildWorkspace} from '../src/canvas-prototype/child-layout.mjs';
import {routeConnectsEndpoints,createRouteValidator} from '../src/canvas-prototype/geometry.mjs';

const fixture=(count,{framed=true}={})=>{
 const root={id:'v:root',semanticId:'root',kind:'package',name:'Native package',width:300,height:120};
 const children=Array.from({length:count},(_,i)=>({id:'v:'+i,semanticId:'native:'+i,kind:i%2?'requirement':'attribute',name:'Declaration '+i,width:260+(i%3)*10,height:96+(i%4)*17}));
 return {nodes:framed?[root,...children]:children,edges:framed?children.map(n=>({id:'owner:'+n.semanticId,source:root.id,target:n.id,nativeRole:'owner',navigationOnly:true,kind:'containment'})):[],childProjection:{rootIds:framed?['root']:[],childIds:children.map(n=>n.semanticId),declaredOn:Object.fromEntries(children.map(n=>[n.semanticId,framed?'root':null])),declarationOwners:Object.fromEntries(children.map(n=>[n.semanticId,framed?['root']:[]]))}};
};
const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
for(const count of [0,1,5,6,463])for(const width of [358,1440]){
 test('complete '+count+' immediate children remain readable at viewport '+width,async()=>{
  const view=fixture(count),before=structuredClone(view),layout=await layoutChildWorkspace(view,{width});
  assert.equal(layout.nodes.length,count+1);assert.deepEqual(new Set(layout.nodes.map(n=>n.semanticId)),new Set(view.nodes.map(n=>n.semanticId)));
  assert.equal(layout.ownershipFrames.length,count);assert.equal(layout.edges.length,0);
  assert.deepEqual(view,before,'layout must not mutate semantic input');
  const leaves=layout.nodes.filter(n=>n.id!=='v:root');
  for(const n of leaves){assert.ok(n.width>=260);assert.equal(n.parentId,'v:root');}
  for(let i=0;i<leaves.length;i++)for(let j=i+1;j<leaves.length;j++)assert.equal(overlaps(leaves[i],leaves[j]),false,'sibling cards must not overlap');
  const placed=placeChildWorkspace(layout,{x:16,y:20,width,height:700});
  assert.equal(placed.scale,1);assert.equal(placed.nodes.length,count+1);
  assert.equal(placed.bounds.width,layout.bounds.width);assert.equal(placed.bounds.height,layout.bounds.height);
  assert.equal(placed.bounds.x,16);assert.equal(placed.bounds.y,20);
  for(let i=0;i<leaves.length;i++)assert.equal(placed.nodes[i+1].width,leaves[i].width);
 });
}
test('735 whole-project roots form a complete flat grid',async()=>{
 const layout=await layoutChildWorkspace(fixture(735,{framed:false}),{width:1100});
 assert.equal(layout.nodes.length,735);assert.equal(layout.ownershipFrames.length,0);
 assert.ok(layout.nodes.every(n=>!n.parentId));assert.ok(layout.bounds.height>10000);
});
test('definition children belong to native definition, never copies of a usage',async()=>{
 const view={nodes:[{id:'usage',semanticId:'u',width:260,height:120},{id:'type',semanticId:'t',width:260,height:120},{id:'part',semanticId:'p',width:260,height:120}],edges:[{id:'typing',source:'usage',target:'type',kind:'typing',label:'defined by'},{id:'ownership',source:'type',target:'part',nativeRole:'owner',navigationOnly:true,kind:'containment'}],childProjection:{rootIds:['u'],typeIds:['t'],childIds:['p'],declaredOn:{p:'t'}}};
 const layout=await layoutChildWorkspace(view,{width:1100});
 assert.equal(layout.nodes.find(n=>n.id==='part').parentId,'type');
 assert.ok(layout.nodes.find(n=>n.id==='usage').y<layout.nodes.find(n=>n.id==='type').y,'selected usage header precedes potentially huge definition context');
 assert.equal(layout.nodes.filter(n=>n.semanticId==='p').length,1);
 const edge=layout.edges[0];assert.equal(edge.id,'typing');assert.equal(edge.source,'usage');assert.equal(edge.target,'type');assert.equal(edge.kind,'typing');
 assert.equal(edge.routingBlocked,undefined);assert.ok(routeConnectsEndpoints(edge.points,edge,layout.nodes));assert.ok(createRouteValidator(edge,layout.nodes,{orthogonalOnly:true})(edge.points));
 assert.equal(layout.ownershipFrames[0].id,'ownership');
});
test('peer, composition and parallel relationship identities remain directed and clear',async()=>{
 const view=fixture(30);view.edges.push(...[
  {id:'peer-one',source:'v:0',target:'v:29',kind:'satisfy',label:'satisfies'},
  {id:'peer-two',source:'v:0',target:'v:29',kind:'verify',label:'verifies'},
  {id:'reverse',source:'v:29',target:'v:0',kind:'dependency',label:'depends on'},
  {id:'composition',source:'v:root',target:'v:4',kind:'composition',nativeRole:'composition'},
 ]);
 const layout=await layoutChildWorkspace(view,{width:1100});
 assert.equal(layout.edges.length,4);
 for(const edge of layout.edges){
  const original=view.edges.find(n=>n.id===edge.id);for(const key of ['source','target','kind','label'])assert.equal(edge[key],original[key]);
  assert.ok(!edge.routingBlocked,JSON.stringify(edge));assert.ok(routeConnectsEndpoints(edge.points,edge,layout.nodes));assert.ok(createRouteValidator(edge,layout.nodes,{orthogonalOnly:true})(edge.points));
 }
 assert.notDeepEqual(layout.edges[0].points,layout.edges[1].points,'parallel native relationships need distinct endpoint positions');
});
test('selected roots never become nested merely because native ownership also selects them',async()=>{
 const view=fixture(2);view.childProjection.rootIds.push('native:0');
 const layout=await layoutChildWorkspace(view);assert.equal(layout.nodes.find(n=>n.id==='v:0').parentId,undefined);assert.equal(layout.nodes.length,3);
 assert.equal(layout.edges.find(e=>e.id==='owner:native:0')?.source,'v:root');
});
test('ambiguous owners and ownership cycles retain all cards and disclose unavailable frames',async()=>{
 const view=fixture(3,{framed:false});
 view.childProjection.declaredOn={'native:0':'native:1','native:1':'native:0','native:2':null};
 view.childProjection.declarationOwners={'native:2':['missing-a','missing-b']};
 const layout=await layoutChildWorkspace(view);
 assert.equal(layout.nodes.length,3);assert.ok(layout.nodes.every(n=>!n.parentId));assert.ok(layout.diagnostics.some(n=>n.code==='child-owner-cycle'));assert.ok(layout.diagnostics.some(n=>n.code==='child-owner-frame-unavailable'));
});
test('unavailable exact attachments are explicit without routing to a false endpoint',async()=>{
 const view=fixture(2);view.edges.push({id:'pin',source:'v:0',target:'v:1',sourceAttachment:'missing-native-pin',kind:'flow'});
 const layout=await layoutChildWorkspace(view);assert.equal(layout.nodes.length,3);assert.equal(layout.edges[0].routingBlocked,true);assert.deepEqual(layout.edges[0].points,[]);assert.ok(layout.diagnostics.some(n=>n.edgeId==='pin'));
});
test('selection does not move cards and cooperative cancellation prevents stale output',async()=>{
 const view=fixture(90);const a=await layoutChildWorkspace(view),b=await layoutChildWorkspace({...view,selectedId:'v:80'});
 assert.deepEqual(a.nodes,b.nodes);
 let ticks=0;await assert.rejects(layoutChildWorkspace(view,{isCurrent:()=>ticks<2,yieldControl:async()=>{ticks++;}}),{name:'AbortError',code:'LAYOUT_CANCELED'});
 assert.equal(ticks,2);
});

test('large typed sibling set routes real relationships without losing any declaration',async()=>{
 const view=fixture(463);
 for(let i=0;i<209;i++)view.edges.push({id:'typing:'+i,source:'v:'+i,target:'v:'+(i+209),kind:'typing',label:'defined by'});
 const layout=await layoutChildWorkspace(view,{width:1440});
 assert.equal(layout.nodes.length,464);assert.equal(layout.edges.length,209);
 for(const edge of layout.edges){assert.equal(edge.routingBlocked,undefined,edge.id);assert.ok(createRouteValidator(edge,layout.nodes,{orthogonalOnly:true})(edge.points),edge.id);}
});

test('represented native attachments use their exact cards while preserving relationship owners',async()=>{
 const view=fixture(3);view.edges.push({id:'attached',source:'v:0',target:'v:1',sourceAttachment:'v:2',kind:'flow'});
 const layout=await layoutChildWorkspace(view),edge=layout.edges[0];
 assert.equal(edge.source,'v:0');assert.equal(edge.target,'v:1');assert.equal(edge.sourceAttachment,'v:2');
 const geometryEdge={...edge,source:edge.sourceAttachment};
 assert.ok(!edge.routingBlocked);assert.ok(routeConnectsEndpoints(edge.points,geometryEdge,layout.nodes));assert.ok(createRouteValidator(geometryEdge,layout.nodes,{orthogonalOnly:true})(edge.points));
});
