import test from 'node:test';
import assert from 'node:assert/strict';
import {createPresentationLayouts,presentationViewKey,loadPresentationLayouts,savePresentationLayouts,PRESENTATION_LAYOUT_FILE} from '../src/canvas-prototype/presentation-layout.mjs';
import {manualLayoutSupport,moveLayoutNode,applyManualPositions} from '../src/canvas-prototype/manual-layout.mjs';
import {routeConnectsEndpoints,routeIsClear} from '../src/canvas-prototype/geometry.mjs';
import {normalizeProject,packProject,unpackProject,fileText,documentsFor} from '../src/canvas-prototype/project.mjs';
const view={id:'Views::structure',kind:'definition'},area={x:0,y:0,width:800,height:600};
const flat=()=>({kind:view.kind,nodes:[{id:'a',semanticId:'native-a',x:0,y:0,width:100,height:60},{id:'b',semanticId:'native-b',x:200,y:0,width:100,height:60}],edges:[{id:'e',semanticId:'native-e',source:'b',target:'a',kind:'satisfy'}]});
const project=()=>normalizeProject({files:{'model.sysml':'package Test { part a; part b; }','story.md':''}});

test('portable layouts preserve native identity and source bytes through actual ZIP export/import',()=>{
 const source=project(),before=structuredClone(source),store=createPresentationLayouts();store.capture(view,flat(),{positions:{a:{x:0,y:140}},area});
 const candidate=savePresentationLayouts(source,store),restored=unpackProject(packProject(candidate)),loaded=loadPresentationLayouts(restored);
 assert.deepEqual(loaded.restore(view,flat(),{area}).positions.a,{x:0,y:140});assert.deepEqual(source,before);
 assert.equal(fileText(restored,'model.sysml'),fileText(source,'model.sysml'));assert.deepEqual(documentsFor(restored),documentsFor(source));
 assert.ok(restored.manifest.assets.includes(PRESENTATION_LAYOUT_FILE));assert.ok(!JSON.stringify(store.snapshot()).includes('modelHash'));
 const record=store.snapshot().views[0].placements[0];assert.equal(record.semanticId,'native-a');assert.equal(record.representationId,'a');assert.equal(record.parentRepresentationId,null);assert.deepEqual(record.offset,{x:0,y:140/600});
});
test('viewport remapping preserves normalized manual displacement over fresh automatic geometry',()=>{
 const store=createPresentationLayouts();store.capture(view,flat(),{positions:{a:{x:80,y:120}},area});
 const fresh=flat();fresh.nodes=fresh.nodes.map(n=>({...n,x:n.x/2+10,y:20,width:n.width/2,height:n.height/2}));
 const result=store.restore(view,fresh,{area:{x:10,y:20,width:400,height:300}});
 assert.deepEqual(result.positions.a,{x:50,y:80});assert.deepEqual(result.omissions,[]);
 assert.equal(presentationViewKey({...view,modelHash:'changed'}),presentationViewKey(view));
});
test('missing representation, changed containment and unsafe replay report omissions without breaking layout',()=>{
 const store=createPresentationLayouts();store.capture(view,flat(),{positions:{a:{x:0,y:140}},area});
 const missing=flat();missing.nodes=missing.nodes.filter(n=>n.id!=='a');missing.edges=[];
 assert.equal(store.restore(view,missing,{area}).omissions[0].reason,'layout-missing-representation');
 const renamed=flat();renamed.nodes[0].id='new-render-id';renamed.edges=[];assert.equal(store.restore(view,renamed,{area}).omissions[0].reason,'layout-missing-representation');
 const nested=flat();nested.nodes[0].parentId='b';assert.equal(store.restore(view,nested,{area}).omissions[0].reason,'layout-parent-changed');
 const conflicting=flat();conflicting.nodes[1].x=0;conflicting.nodes[1].y=140;const replay=store.restore(view,conflicting,{area});
 assert.equal(Object.keys(replay.positions).length,0);assert.equal(replay.omissions[0].reason,'layout-conflict');assert.match(replay.omissions[0].message,/overlaps/);
});
test('snapshot history and clones isolate manual edits and reject invalid data atomically',()=>{
 const store=createPresentationLayouts();store.capture(view,flat(),{positions:{a:{x:0,y:140}},area});const before=store.snapshot(),copy=store.clone();
 copy.clear(view);assert.equal(copy.has(view),false);assert.equal(store.has(view),true);
 const external=store.snapshot();external.views[0].placements[0].offset.y=999;assert.deepEqual(store.snapshot(),before);
 store.clear();assert.equal(store.has(view),false);store.fromSnapshot(before);assert.equal(store.has(view),true);
 const invalid=structuredClone(before);invalid.views[0].placements[0].offset.y=Infinity;assert.throws(()=>store.fromSnapshot(invalid),/Invalid/);assert.deepEqual(store.snapshot(),before);
 assert.throws(()=>loadPresentationLayouts({...project(),files:{[PRESENTATION_LAYOUT_FILE]:'{"unrelated":true}'}}),/Invalid/);
 assert.throws(()=>savePresentationLayouts({...project(),files:{[PRESENTATION_LAYOUT_FILE]:'unrelated asset'}},store),/Invalid/);
});
test('capture aliases only unambiguous native semantic and parent correspondence, never labels',()=>{
 const store=createPresentationLayouts();store.capture(view,flat(),{positions:{a:{x:0,y:140}},area});
 const targetView={id:'Captured::slide',kind:'definition'},target=flat();target.nodes[0].id='new-a';target.edges=[];
 assert.deepEqual(store.alias(view,targetView,target),{retained:1,omissions:[]});assert.deepEqual(store.restore(targetView,target,{area}).positions['new-a'],{x:0,y:140});
 const ambiguous={...target,nodes:[...target.nodes,{...target.nodes[0],id:'duplicate'}]},other={id:'Captured::ambiguous',kind:'definition'};
 const result=store.alias(view,other,ambiguous);assert.equal(result.retained,0);assert.equal(result.omissions[0].reason,'layout-ambiguous-capture');
 const unrelated={...target,nodes:target.nodes.map(n=>({...n,semanticId:'unrelated-'+n.semanticId,name:'a'}))};assert.equal(store.alias(view,{id:'Captured::labels',kind:'definition'},unrelated).retained,0);
});
test('peer swaps restore as one validated arrangement rather than rejecting intermediate overlap',()=>{
 const store=createPresentationLayouts();store.capture(view,flat(),{positions:{a:{x:200,y:0},b:{x:0,y:0}},area});
 const result=store.restore(view,flat(),{area});assert.equal(result.omissions.length,0);assert.equal(applyManualPositions(flat(),result.positions).nodes[0].x,200);
});
function compound(){return {kind:'interconnection',nodes:[
 {id:'assembly',semanticId:'native-assembly',x:0,y:0,width:300,height:240,headerHeight:30},
 {id:'child-a',semanticId:'native-child-a',parentId:'assembly',x:30,y:80,width:80,height:50},
 {id:'child-b',semanticId:'native-child-b',parentId:'assembly',x:180,y:80,width:80,height:50},
 {id:'port',semanticId:'native-port',nativePortId:'pin',nativePort:{id:'pin',direction:'out'},kind:'port',portSide:'EAST',parentId:'assembly',x:294,y:100,width:12,height:12,portLabelBox:{x:310,y:100,width:40,height:16}},
 {id:'outside',semanticId:'native-outside',x:500,y:0,width:100,height:60},
 ],edges:[
 {id:'internal',semanticId:'native-internal',source:'child-a',target:'child-b',kind:'flow',label:'flow',points:[{x:110,y:105},{x:180,y:105}],labelBox:{x:130,y:80,width:30,height:16},x:130,y:92},
 {id:'external',semanticId:'native-external',source:'assembly',target:'outside',sourceAttachment:'port',fromPort:'pin',kind:'flow',points:[]},
 ],ports:[{id:'port',ownerId:'assembly',representationId:'port',semanticId:'native-port',x:300,y:106},{id:'drawing-anchor',ownerId:'child-a',identityStatus:'drawing-anchor',semanticId:null,x:110,y:105}]};}

test('rigid compound movement preserves descendant, native port, anchor and internal-route coordinates',()=>{
 const source=compound(),before=structuredClone(source);assert.equal(manualLayoutSupport(source,'assembly').supported,true);
 const result=moveLayoutNode(source,{id:'assembly',x:50,y:200},{area});
 assert.deepEqual(source,before);assert.deepEqual(result.nodes.find(n=>n.id==='outside'),source.nodes.find(n=>n.id==='outside'));
 for(const id of ['assembly','child-a','child-b','port']){const old=source.nodes.find(n=>n.id===id),node=result.nodes.find(n=>n.id===id);assert.equal(node.x-old.x,50);assert.equal(node.y-old.y,200);assert.equal(node.parentId,old.parentId);assert.equal(node.semanticId,old.semanticId);}
 const port=result.nodes.find(n=>n.id==='port');assert.deepEqual(port.nativePort,source.nodes.find(n=>n.id==='port').nativePort);assert.deepEqual(port.portLabelBox,{x:360,y:300,width:40,height:16});
 assert.deepEqual(result.ports.map(p=>[p.x,p.y]),[[350,306],[160,305]]);
 const internal=result.edges.find(e=>e.id==='internal');assert.deepEqual(internal.points,[{x:160,y:305},{x:230,y:305}]);assert.deepEqual(internal.labelBox,{x:180,y:280,width:30,height:16});
 const external=result.edges.find(e=>e.id==='external'),attachmentEdge={...external,source:'port'};assert.equal(external.source,'assembly');assert.equal(external.target,'outside');assert.equal(external.fromPort,'pin');assert.equal(external.sourceAttachment,'port');assert.equal(external.semanticId,'native-external');
 assert.equal(external.routingBlocked,false);assert.equal(routeConnectsEndpoints(external.points,attachmentEdge,result.nodes),true);assert.equal(routeIsClear(external.points,attachmentEdge,result.nodes),true);
});
test('compound and port safety rejects escaped groups, unknown attachments and behavioral controls',()=>{
 assert.throws(()=>moveLayoutNode(compound(),{id:'child-a',x:70,y:220}),/parent content bounds/);
 assert.throws(()=>moveLayoutNode(compound(),{id:'assembly',x:450,y:0}),/overlaps/);
 assert.equal(manualLayoutSupport(compound(),'port').supported,false);
 const unknown=compound();unknown.edges[1].sourceAttachment='unrepresented-port';assert.equal(manualLayoutSupport(unknown,'assembly').supported,false);
 const action=compound();action.kind='action';assert.equal(manualLayoutSupport(action,'assembly').supported,false);
 const disguised=flat();disguised.nodes[0].kind='fork';assert.equal(manualLayoutSupport(disguised,'b').supported,false);
});

test('bounded nested structural movement keeps parent and peers fixed and rejects header/edge escape',()=>{
 const source=compound(),before=structuredClone(source),moved=moveLayoutNode(source,{id:'child-a',x:40,y:155},{area});
 assert.equal(manualLayoutSupport(source,'child-a').supported,true);assert.deepEqual(source,before);
 assert.equal(moved.nodes.find(n=>n.id==='child-a').y,155);
 for(const id of ['assembly','child-b','port','outside'])assert.deepEqual(moved.nodes.find(n=>n.id===id),source.nodes.find(n=>n.id===id));
 for(const position of [{x:-1,y:80},{x:30,y:20},{x:230,y:80},{x:30,y:200}])assert.throws(()=>moveLayoutNode(source,{id:'child-a',...position}),/bounds|overlaps/);
 const missing=compound();delete missing.nodes[0].headerHeight;assert.match(manualLayoutSupport(missing,'child-a').reason,/native compound parent content bounds/);
 const orphan=compound();orphan.nodes[1].parentId='missing';assert.equal(manualLayoutSupport(orphan,'child-a').supported,false);
});
test('nested structural groups retain descendant pins and label envelopes inside parent body',()=>{
 const source=compound();source.nodes=source.nodes.filter(n=>n.id!=='port');source.nodes[1]={...source.nodes[1],height:80,headerHeight:25};
 source.nodes.push({id:'nested-pin',semanticId:'native-nested-pin',nativePortId:'out',kind:'port',portSide:'EAST',parentId:'child-a',x:104,y:105,width:12,height:12,portLabelBox:{x:120,y:105,width:35,height:16}});
 source.edges=source.edges.filter(e=>e.id==='internal');source.edges.push({id:'pin-link',semanticId:'native-pin-link',source:'child-a',target:'outside',sourceAttachment:'nested-pin',fromPort:'out',kind:'flow'});
 source.ports=[{id:'nested-pin',ownerId:'child-a',representationId:'nested-pin',semanticId:'native-nested-pin',x:110,y:111}];
 const moved=moveLayoutNode(source,{id:'child-a',x:40,y:150},{area}),pin=moved.nodes.find(n=>n.id==='nested-pin');
 assert.deepEqual([pin.x,pin.y],[114,175]);assert.deepEqual(pin.portLabelBox,{x:130,y:175,width:35,height:16});assert.deepEqual(moved.ports.map(p=>[p.x,p.y]),[[120,181]]);
 const edge=moved.edges.find(e=>e.id==='pin-link');assert.equal(edge.source,'child-a');assert.equal(edge.target,'outside');assert.equal(edge.sourceAttachment,'nested-pin');assert.equal(edge.fromPort,'out');assert.equal(edge.semanticId,'native-pin-link');
 if(!edge.routingBlocked)assert.equal(routeConnectsEndpoints(edge.points,{...edge,source:'nested-pin'},moved.nodes),true);
 // The card itself fits, but its native output label would leave the outer body.
 assert.throws(()=>moveLayoutNode(source,{id:'child-a',x:200,y:150}),/parent content bounds/);
 // The pin label must not be moved through a stationary peer either.
 assert.throws(()=>moveLayoutNode(source,{id:'child-a',x:56,y:80}),/native port label|overlaps/);
});
test('absolute ancestor/child batches persist and roundtrip without pinning descendants or altering source',()=>{
 const source=compound(),before=structuredClone(source),nestedView={id:'Views::nested',kind:'interconnection'},positions={assembly:{x:50,y:200},'child-a':{x:100,y:320}},store=createPresentationLayouts();
 const moved=applyManualPositions(source,positions,{area});assert.equal(moved.nodes.find(n=>n.id==='assembly').x,50);assert.deepEqual([moved.nodes.find(n=>n.id==='child-a').x,moved.nodes.find(n=>n.id==='child-a').y],[100,320]);assert.deepEqual([moved.nodes.find(n=>n.id==='child-b').x,moved.nodes.find(n=>n.id==='child-b').y],[230,280]);
 store.capture(nestedView,source,{positions,area});const original=project(),originalBefore=structuredClone(original),roundtrip=unpackProject(packProject(savePresentationLayouts(original,store))),restored=loadPresentationLayouts(roundtrip).restore(nestedView,source,{area});
 assert.equal(restored.omissions.length,0);assert.deepEqual({...restored.positions},positions);assert.deepEqual(applyManualPositions(source,restored.positions,{area}).nodes,moved.nodes);assert.deepEqual(source,before);assert.deepEqual(original,originalBefore);assert.equal(fileText(roundtrip,'model.sysml'),fileText(original,'model.sysml'));
 const childPlacement=store.snapshot().views[0].placements.find(p=>p.representationId==='child-a');assert.equal(childPlacement.parentSemanticId,'native-assembly');assert.equal(childPlacement.parentRepresentationId,'assembly');
});

test('a moved internal-part label cannot overlap a stationary native port label',()=>{
 const source=compound();source.nodes=source.nodes.filter(n=>n.id!=='port');source.edges=[];source.ports=[];
 source.nodes.push({id:'out',kind:'port',parentId:'child-a',x:104,y:100,width:12,height:12,portLabelBox:{x:120,y:140,width:80,height:16}},{id:'in',kind:'port',parentId:'child-b',x:174,y:100,width:12,height:12,portLabelBox:{x:120,y:160,width:80,height:16}});
 assert.throws(()=>moveLayoutNode(source,{id:'child-a',x:30,y:100}),/overlaps native port labels/);
});
