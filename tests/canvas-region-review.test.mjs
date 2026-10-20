import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {mountGraphRegion,updateRegionReferences} from '../src/canvas-prototype/scene-regions.mjs';
const fixture=()=>({kind:'definition',nodes:[{id:'a',semanticId:'native-a',kind:'part',name:'A'},{id:'b',semanticId:'native-b',kind:'part',name:'B'}],edges:[{id:'wire',semanticId:'native-wire',source:'a',target:'b',kind:'connection',label:'Connection'}]});
const hostFor=()=>new JSDOM('<div id="host"></div>').window.document.getElementById('host');

test('a delayed graph region does not emit stale initialization state after its host is detached',async()=>{
 const host=hostFor(),changes=[],engine=new ELK();let release,started;
 const waitStarted=new Promise(resolve=>{started=resolve;}),gate=new Promise(resolve=>{release=resolve;});
 const pending=mountGraphRegion(host,fixture(),{elk:{layout:async graph=>{started();await gate;return engine.layout(graph);}},state:{camera:{x:41,y:29,scale:1.3}},onStateChange:value=>changes.push(value)});
 await waitStarted;host.remove();release();const controller=await pending;
 assert.deepEqual(changes,[],'mounting must not publish obsolete state before the caller revision check');
 assert.equal(controller.getState().camera.x,41);controller.destroy();
});

test('secondary graph omits invisible edge targets and retains native plus layout notices',async()=>{
 const host=hostFor(),native={kind:'state',notices:['Native state detail unavailable.'],nodes:['a','middle','b'].map(id=>({id,semanticId:id,kind:'state',width:170,height:80})),edges:[{id:'crossing',semanticId:'native-crossing',source:'a',target:'b',kind:'transition',label:'guard'}]};
 const elk={layout:async graph=>({...graph,width:220,height:320,children:graph.children.map((n,i)=>({...n,x:12,y:i*110+12})),edges:graph.edges.map(edge=>({...edge,sections:[{startPoint:{x:62,y:92},endPoint:{x:62,y:232}}]}))})};
 const controller=await mountGraphRegion(host,native,{elk});
 assert.equal(host.querySelectorAll('svg g[role="button"]').length,0);
 assert.equal(host.querySelectorAll('svg text').length,0);
 assert.match(host.textContent,/Native state detail unavailable/);assert.match(host.textContent,/route unavailable/);
 controller.destroy();
});

test('secondary graph click and keyboard selection update origin state before emitting native identities',async()=>{
 const host=hostFor(),emitted=[];let controller;
 controller=await mountGraphRegion(host,fixture(),{elk:new ELK(),onSelect:selection=>emitted.push({selection,state:controller.getState()})});
 host.querySelector('[data-semantic-id="native-a"]').click();
 assert.equal(emitted[0].state.selectedId,'native-a');assert.ok(host.querySelector('[data-semantic-id="native-a"]').classList.contains('selected'));
 host.querySelector('svg g[role="button"]').dispatchEvent(new host.ownerDocument.defaultView.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
 assert.equal(emitted[1].selection.semanticId,'native-wire');assert.equal(emitted[1].selection.relationships[0].sourceSemanticId,'native-a');assert.equal(emitted[1].state.selectedId,'native-wire');assert.ok(host.querySelector('svg g[role="button"]').classList.contains('selected'));
 controller.destroy();
});

test('editing region references preserves metadata and gives new or duplicate entries distinct IDs',()=>{
 const previous=[{id:'region-1',view:'A',focus:'Model::focus',title:'Authored title'},{id:'alternate',view:'A',focus:'Model::other'},{id:'region-2',view:'C'}],before=structuredClone(previous);
 const result=updateRegionReferences(previous,['B','A','A','A','C']);
 assert.equal(new Set(result.map(r=>r.id)).size,result.length);
 assert.deepEqual(result[1],previous[0]);assert.deepEqual(result[2],previous[1]);assert.deepEqual(result[4],previous[2]);
 assert.notEqual(result[0].id,'region-1');assert.notEqual(result[3].id,'region-1');assert.notEqual(result[3].id,'alternate');
 assert.deepEqual(previous,before);
});

test('mounting a graph region honors current shared multi selection over its earlier saved selection',async()=>{
 const host=hostFor(),controller=await mountGraphRegion(host,fixture(),{elk:new ELK(),selectedIds:['native-a','native-wire'],state:{selectedIds:['native-b']}});
 assert.deepEqual(controller.getState().selectedIds,['native-a','native-wire']);
 assert.ok(host.querySelector('[data-semantic-id="native-a"]').classList.contains('selected'));
 assert.ok(host.querySelector('svg g[role="button"]').classList.contains('selected'));
 assert.equal(host.querySelector('[data-semantic-id="native-b"]').classList.contains('selected'),false);
 controller.destroy();
});

test('unknown secondary relationship notation is disclosed rather than silently shown as a neutral connection',async()=>{
 const host=hostFor(),native=fixture();native.edges[0].kind='unsupported-native-kind';
 const controller=await mountGraphRegion(host,native,{elk:new ELK()});
 assert.match(host.textContent,/Unsupported relationship notation: unsupported-native-kind/);
 assert.equal(host.querySelector('svg g[role="button"] path').hasAttribute('marker-end'),false);
 controller.destroy();
});
