import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {layoutDiagram} from '../src/canvas-prototype/elk-layout.mjs';
import {behaviorFace,behaviorNodeDetail,behaviorNotation,applyBehaviorLayout} from '../src/canvas-prototype/behavior-view.mjs';
import {edgeAppearance} from '../src/canvas-prototype/notation.mjs';
const {views}=JSON.parse(await readFile(new URL('fixtures/canvas-views/behaviors.native.json',import.meta.url)));
const elk=new ELK(),document=new JSDOM('').window.document;
test('native fault tree preserves shared cause identity and cause to effect endpoints while ranking effects above causes',async()=>{
 const native=structuredClone(views.fault),before=structuredClone(native),view=await layoutDiagram(native,{elk,width:1200,height:1000}),nodes=new Map(view.nodes.map(n=>[n.id,n]));
 assert.deepEqual(native,before);assert.equal(view.diagnostics.length,0);
 const common=view.nodes.find(n=>n.semanticId==='PowerSupply__common');
 assert.equal(view.nodes.filter(n=>n.semanticId===common.semanticId).length,1);
 assert.equal(view.edges.filter(e=>e.source===common.id).length,2);
 for(const edge of view.edges){assert.ok(nodes.get(edge.target).y<nodes.get(edge.source).y);assert.ok(edge.points.length>1);}
 assert.deepEqual(view.edges.map(e=>[e.source,e.target]),native.edges.map(e=>[e.from,e.to]));
 for(const kind of ['basic event','AND','OR']){const node=view.nodes.find(n=>n.kind===kind),face=behaviorFace(document,node);assert.equal(face.dataset.shape,kind);assert.ok(face.querySelector('svg path'));assert.match(face.textContent,new RegExp(node.name));}
});
test('native nested state boundaries and mandatory detail survive hidden optional compartments',async()=>{
 const native=structuredClone(views.state),before=structuredClone(native),view=await layoutDiagram(native,{elk,width:1000,height:800}),nodes=new Map(view.nodes.map(n=>[n.id,n]));
 assert.deepEqual(native,before);
 for(const node of view.nodes.filter(n=>n.parentId)){const parent=nodes.get(node.parentId);assert.ok(node.x>=parent.x&&node.y>=parent.y+parent.headerHeight);assert.ok(node.x+node.width<=parent.x+parent.width+.01&&node.y+node.height<=parent.y+parent.height+.01);}
 const initial=view.nodes.find(n=>n.detail==='initial');assert.match(behaviorFace(document,{...initial,displayDetail:''}).textContent,/initial/);
 const detail={kind:'state',text:'entry / reset',detail:'do / sample\nexit / stop',displayDetail:''};
 assert.match(behaviorFace(document,detail).textContent,/entry \/ reset/);assert.match(behaviorNodeDetail(detail),/exit \/ stop/);
 assert.equal(behaviorNodeDetail({kind:'part',detail:'optional documentation'}),'');
 assert.equal(behaviorNodeDetail({kind:'state',displayDetail:'optional documentation'}),'');
});
test('native case families use case notation and mixed views retain individual families without changing kind or identity',()=>{
 for(const node of views.cases.nodes){assert.equal(behaviorNotation(node)?.family,'case');assert.equal(behaviorFace(document,node).dataset.shape,'ellipse');}
 const before=structuredClone(views.mixed),prepared=applyBehaviorLayout(views.mixed);
 assert.deepEqual(views.mixed,before);
 for(const node of prepared.nodes){assert.equal(node.kind,before.nodes.find(n=>n.id===node.id).kind);assert.equal(node.semanticId,before.nodes.find(n=>n.id===node.id).semanticId);}
 assert.equal(behaviorNotation(prepared.nodes.find(n=>n.kind==='part')),null);
 assert.ok(prepared.nodes.some(n=>behaviorNotation(n)?.family==='case'));
 assert.equal(edgeAppearance({kind:'reference'},{viewKind:'mixed'}).targetMarker,'open-arrow');
 assert.equal(behaviorFace(document,{kind:'unknown',name:'AND case state'}),null,'labels never determine notation');
});
