import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {JSDOM} from 'jsdom';
import {sequenceLayout,mountSequence,sequencePresentationLayout,sequenceNotationCoverage,SEQUENCE_LAYOUT_SCHEMA} from '../src/canvas-prototype/sequence-view.mjs';
const {views}=JSON.parse(await readFile(new URL('fixtures/canvas-views/behaviors.native.json',import.meta.url)));
const source=await readFile(new URL('./fixtures/canvas-views/sequence.sysml',import.meta.url),'utf8');
// Native contract values corresponding to the fixture's real event declarations.
// These are explicit fixture identities, never derived from display labels.
const eventSequence=()=>{
 const view=structuredClone(views.sequence),ref=(name,lifelineId)=>({kind:'event occurrence',semanticId:'fixture-event:'+name,qualifiedName:'DeskFan::StartupExchange::'+name,lifelineId});
 const panelSent=ref('panel::sent','n0'),panelReceived=ref('panel::received','n0'),accepted=ref('control::accepted','n1'),checkSent=ref('control::checkSent','n1'),checkReceived=ref('control::checkReceived','n1'),replied=ref('control::replied','n1');
 const pairs=[[panelSent,accepted],[checkSent,checkReceived],[replied,panelReceived]];
 for(const [index,edge] of view.edges.entries())edge.notation={production:'message',declarationKind:'message',sourceRole:'source',targetRole:'target',sourceEvent:pairs[index][0],targetEvent:pairs[index][1]};
 view.sequenceOrders=[{kind:'succession',semanticId:'fixture-order:1',sourceEvent:accepted,targetEvent:checkSent},{kind:'succession',semanticId:'fixture-order:2',sourceEvent:checkReceived,targetEvent:replied}];
 view.sequenceOrdering='partial-order-linearization';return view;
};
test('native message order differs from declaration order; renderer retains order, direction and self message',()=>{
 const native=structuredClone(views.sequence),before=structuredClone(native),view=sequenceLayout(native);
 assert.deepEqual(native,before);
 assert.deepEqual(view.edges.map(e=>e.semanticId),['DeskFan__StartupExchange__request','DeskFan__StartupExchange__selfCheck','DeskFan__StartupExchange__ready']);
 assert.deepEqual(view.nodes.map(n=>n.semanticId),native.nodes.map(n=>n.semanticId));
 assert.deepEqual(view.edges.map(e=>[e.source,e.target]),native.edges.map(e=>[e.from,e.to]));
 assert.ok(view.edges[0].points[0].y<view.edges[1].points[0].y&&view.edges[1].points[0].y<view.edges[2].points[0].y);
 assert.equal(view.edges[1].self,true);assert.equal(view.edges[1].points.length,4);
 assert.equal(view.edges[1].sourceSemanticId,view.edges[1].targetSemanticId);
 assert.ok(source.indexOf('message request')>source.indexOf('message ready'),'fixture declares messages in reverse causal order');
});
test('selecting native participants and messages remains stationary; explore is explicit and history restores scroll',()=>{
 const dom=new JSDOM('<div id="host"></div>'),host=dom.window.document.getElementById('host'),selections=[],explorations=[];
 const mounted=mountSequence(host,views.sequence,{onSelect:s=>selections.push(s),onExplore:s=>explorations.push(s),state:{scrollLeft:81,scrollTop:49}});
 host.querySelectorAll('.sequence-message')[1].click();
 assert.equal(selections.length,1);assert.equal(explorations.length,0);
 assert.equal(selections[0].relationships[0].semanticId,'DeskFan__StartupExchange__selfCheck');
 assert.deepEqual(mounted.getState(),{scrollLeft:81,scrollTop:49,selectedId:'DeskFan__StartupExchange__selfCheck'});
 host.querySelector('.sequence-toolbar button').click();assert.equal(explorations.length,1);
 const saved=mounted.getState();mounted.destroy();assert.equal(host.children.length,0);
 const restored=mountSequence(host,views.sequence,{state:saved});
 assert.deepEqual(restored.getState(),saved);
 assert.equal(host.querySelectorAll('[aria-pressed="true"]').length,1);
});
test('native labels and notices stay literal, unsupported semantics are disclosed without fabricated arrows',()=>{
 const native=structuredClone(views.sequence);native.edges[0].label='[guard] x < y & "start"';native.edges[1].kind='unknown-control';native.notices=['Native ordering is partial.'];native.fragments=[{kind:'parallel'}];
 const before=structuredClone(native),dom=new JSDOM('<div></div>'),host=dom.window.document.querySelector('div');
 mountSequence(host,native);
 assert.match(host.textContent,/\[guard\] x < y & "start"/);
 assert.match(host.textContent,/Native ordering is partial/);assert.match(host.textContent,/Unsupported sequence message kind/);assert.match(host.textContent,/fragments are not supported/);
 assert.equal(host.querySelectorAll('.sequence-message-line').length,2);
 assert.deepEqual(native,before);
});
test('multiple shared relationships highlight without moving or emitting; restoration retains all identities',()=>{
 const dom=new JSDOM('<div></div>'),host=dom.window.document.querySelector('div'),changes=[];
 let mounted=mountSequence(host,views.sequence,{state:{scrollLeft:35,scrollTop:48},onSelect:s=>changes.push(s)});
 const ids=[views.sequence.edges[0].semanticId,views.sequence.edges[2].semanticId];
 mounted.selectMany(ids);
 assert.equal(host.querySelectorAll('.sequence-message.selected').length,2);assert.equal(changes.length,0);
 const state=mounted.getState();assert.deepEqual(state,{scrollLeft:35,scrollTop:48,selectedId:null,selectedIds:ids});
 assert.equal(host.querySelector('.sequence-toolbar button').disabled,true,'multiple highlights do not silently explore only one relationship');
 mounted.destroy();mounted=mountSequence(host,views.sequence,{state});assert.deepEqual(mounted.getState(),state);assert.equal(host.querySelectorAll('.sequence-message.selected').length,2);
 mounted.selectMany([...ids,'not-in-view']);assert.match(host.querySelector('.sequence-selection-notice').textContent,/1 selected element is not represented/);
 assert.equal(mounted.getState().selectedIds.at(-1),'not-in-view');
 host.querySelector('.sequence-message').click();assert.equal(mounted.getState().selectedIds,undefined);assert.equal(host.querySelectorAll('.sequence-message.selected').length,1);
});

test('sequence presentation widths and message spacing preserve native participant and message semantics',()=>{
 const native=structuredClone(views.sequence),before=structuredClone(native),base=sequenceLayout(native),first=base.nodes[0],layout={schemaVersion:SEQUENCE_LAYOUT_SCHEMA,lanes:[{semanticId:first.semanticId,representationId:first.id,width:460}],messageGap:150};
 const changed=sequenceLayout(native,{layout});
 assert.deepEqual(native,before);assert.deepEqual(changed.nodes.map(n=>n.semanticId),base.nodes.map(n=>n.semanticId));
 assert.deepEqual(changed.edges.map(e=>[e.semanticId,e.sourceSemanticId,e.targetSemanticId]),base.edges.map(e=>[e.semanticId,e.sourceSemanticId,e.targetSemanticId]));
 assert.equal(changed.nodes[0].laneWidth,460);assert.ok(changed.nodes[1].x>base.nodes[1].x);
 assert.ok(changed.edges[1].points[0].y-changed.edges[0].points[0].y>=150);
 assert.equal(changed.edges[1].self,true);
 assert.throws(()=>sequencePresentationLayout(native,{...layout,order:['n1','n0']}),/only lane widths/);
 assert.throws(()=>sequencePresentationLayout(native,{...layout,messageGap:0}),/spacing/);
 const stale=sequenceLayout(native,{layout:{schemaVersion:SEQUENCE_LAYOUT_SCHEMA,lanes:[{semanticId:'missing',representationId:first.id,width:460}]}});
 assert.equal(stale.nodes[0].laneWidth,base.nodes[0].laneWidth);assert.match(stale.notices.join(' '),/no exact native representation/);
});
test('sequence controls explicitly persist identity widths, reset, and retain shared selection without reordering',()=>{
 const dom=new JSDOM('<div></div>'),host=dom.window.document.querySelector('div'),edits=[],selections=[];
 const mounted=mountSequence(host,views.sequence,{onLayoutChange:(value,details)=>edits.push({value,details}),onSelect:value=>selections.push(value),state:{scrollLeft:24,scrollTop:36}});
 assert.equal(edits.length,0);host.querySelector('.sequence-message').click();assert.equal(edits.length,0);
 const selected=mounted.getState().selectedId,input=host.querySelector('.sequence-layout-fields input');input.value='420';input.dispatchEvent(new dom.window.Event('change'));
 assert.equal(edits.length,1);assert.equal(edits[0].details.previousLayout,undefined);assert.equal(mounted.getState().selectedId,selected);
 assert.equal(mounted.getState().scrollTop,36);assert.equal(mounted.getState().layout.lanes[0].semanticId,views.sequence.nodes[0].semanticId);
 assert.equal(selections.length,1,'layout does not become model selection');
 const restored=mountSequence(dom.window.document.createElement('div'),views.sequence,{state:mounted.getState()});assert.deepEqual(restored.getState(),mounted.getState());restored.destroy();
 host.querySelector('.sequence-layout-fields button').click();assert.equal(edits.length,2);assert.equal(edits[1].value,undefined);assert.ok(edits[1].details.previousLayout);assert.equal(mounted.getState().layout,undefined);mounted.destroy();
});
test('focused sequence uses native view frame, open message heads and explicit per-kind coverage',()=>{
 const native=eventSequence(),dom=new JSDOM('<div></div>'),host=dom.window.document.querySelector('div');
 const mounted=mountSequence(host,native,{renderingMode:'focused'});assert.ok(host.querySelector('.focused-sequence'));assert.match(host.querySelector('.sequence-frame-label').textContent,/BehaviorViews::sequence/);
 const marker=host.querySelector('marker path');assert.equal(marker.getAttribute('fill'),'none');assert.doesNotMatch(marker.getAttribute('d'),/Z/);
 assert.equal(sequenceNotationCoverage(native).records.filter(r=>r.role==='message'&&r.status==='implemented').length,3);
 assert.match(host.querySelector('.sequence-evidence').textContent,/neither elapsed time nor additional modeled ordering/);mounted.destroy();
 native.edges[0].kind='transition';mountSequence(host,native,{renderingMode:'focused'});assert.equal(host.querySelectorAll('.sequence-message-line').length,2);assert.match(host.textContent,/Unsupported sequence message kind/);
});

test('native event identities and explicit partial orders render without causal or time inference',()=>{
 const native=eventSequence(),before=structuredClone(native),view=sequenceLayout(native,{renderingMode:'focused'});
 assert.deepEqual(native,before);assert.equal(view.events.length,6);assert.equal(view.orders.filter(order=>order.supported).length,2);
 assert.equal(view.events[3].x,view.edges[1].points.at(-1).x);assert.equal(view.events[3].y,view.edges[1].points.at(-1).y);
 assert.ok(view.events[3].y>view.events[2].y,'self message keeps distinct source/target event occurrences');
 assert.deepEqual(view.orders.map(order=>[order.sourceSemanticId,order.targetSemanticId]),native.sequenceOrders.map(order=>[order.sourceEvent.semanticId,order.targetEvent.semanticId]));
 const dom=new JSDOM('<div></div>'),host=dom.window.document.querySelector('div'),selected=[];
 const mounted=mountSequence(host,native,{renderingMode:'focused',onSelect:value=>selected.push(value)});
 assert.equal(host.querySelectorAll('.sequence-event-proxy').length,6);assert.equal(host.querySelectorAll('.sequence-order-line').length,2);
 assert.match(host.querySelector('.sequence-order-line').getAttribute('marker-end'),/-order/);
 host.querySelector('.sequence-event-proxy').click();assert.equal(selected.at(-1).semanticId,native.edges[0].notation.sourceEvent.semanticId);
 host.querySelector('.sequence-order').click();assert.equal(selected.at(-1).relationships[0].semanticId,'fixture-order:1');assert.equal(selected.at(-1).relationships[0].sourceSemanticId,native.sequenceOrders[0].sourceEvent.semanticId);
 const snapshot=mounted.getState();const input=host.querySelector('.sequence-layout-fields input');input.value='480';input.dispatchEvent(new dom.window.Event('change'));
 assert.equal(mounted.getState().selectedId,snapshot.selectedId);assert.equal(host.querySelectorAll('.sequence-event-proxy').length,6);assert.equal(host.querySelectorAll('.sequence-order-line').length,2);
});
test('missing or ambiguous native event roles remain explicit rather than guessed from names',()=>{
 const native=eventSequence();native.edges[0].notation.sourceEvent.kind='part';native.edges[2].notation.targetEvent.lifelineId='not-shown';
 native.sequenceOrders[0].sourceEvent=structuredClone(native.edges[0].notation.sourceEvent);
 const view=sequenceLayout(native,{renderingMode:'focused'});assert.equal(view.events.length,4);assert.equal(view.orders[0].supported,false);assert.match(view.notices.join(' '),/missing or ambiguous event-occurrence/);
 const duplicate=eventSequence();duplicate.edges[2].notation.sourceEvent=structuredClone(duplicate.edges[1].notation.targetEvent);
 duplicate.sequenceOrders[1].sourceEvent=structuredClone(duplicate.edges[1].notation.targetEvent);
 const ambiguous=sequenceLayout(duplicate,{renderingMode:'focused'});assert.equal(ambiguous.orders[1].supported,false,'two positions for a native event do not choose a convenient succession attachment');
});
test('focused sequence preserves native flow productions and rejects unavailable endpoint glyph semantics',()=>{
 const legacy=sequenceLayout(views.sequence,{renderingMode:'focused'});assert.equal(legacy.edges.filter(edge=>edge.supported).length,0);assert.match(legacy.notices.join(' '),/Original native message\/flow production is unavailable/);
 const native=eventSequence();native.edges[0].notation.production='flow';native.edges[1].notation.production='succession-flow';
 const view=sequenceLayout(native,{renderingMode:'focused'});assert.deepEqual(view.edges.map(edge=>edge.notation.production),['flow','succession-flow','message']);assert.equal(view.edges.filter(edge=>edge.supported).length,1);assert.match(view.notices.join(' '),/no message arrow is substituted/);
});

// Exercise the real additive engine contract. A present older binary must fail
// this test, rather than silently skipping missing event/production metadata.
function nativeSequenceClient(binary){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),nextId=0;const pending=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)break;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)break;const result=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(result.id);if(!job)continue;pending.delete(result.id);result.error?job.reject(Error(result.error.message)):job.resolve(result.result);}});
 for(const event of ['error','exit'])child.on(event,error=>{for(const job of pending.values())job.reject(Error(String(error)));pending.clear();});
 return {call(method,params){const id=++nextId,body=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write('Content-Length: '+body.length+'\r\n\r\n');child.stdin.write(body);});},close(){child.stdin.end();}};
}
const nativeSequenceBinary=resolve(process.env.SYSPRESENT_NATIVE_ENGINE??'build/canvas-prototype/engine/sysml-native');
test('real native sequence renders six canonical event proxies and two explicit orders; portable spacing preserves semantics',{skip:!existsSync(nativeSequenceBinary),timeout:60000},async()=>{
 const engine=nativeSequenceClient(nativeSequenceBinary);
 try{
  const documents=await Promise.all(['sequence.sysml','behaviors.sysml'].map(async name=>({name,content:await readFile(new URL('fixtures/canvas-views/'+name,import.meta.url),'utf8')}))),parsed=await engine.call('ParseSources',{documents});
  assert.equal((parsed.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error')).length,0);
  const native=await engine.call('RenderView',{modelHash:parsed.modelHash,view:'BehaviorViews::sequence',includeSemanticIdentity:true}),before=structuredClone(native);
  assert.equal(native.sequenceOrdering,'partial-order-linearization');assert.deepEqual(native.edges.map(edge=>edge.notation.production),['message','message','message']);
  const nodes=new Map(native.nodes.map(node=>[node.id,node]));
  for(const edge of native.edges)for(const [role,lifeline]of [['sourceEvent',edge.from],['targetEvent',edge.to]]){
   const ref=edge.notation[role];assert.equal(ref.kind,'event occurrence');assert.equal(ref.lifelineId,lifeline);assert.ok(ref.semanticId);assert.ok(nodes.has(ref.lifelineId));assert.equal(ref.identityStatus,'mapped');
  }
  const view=sequenceLayout(native,{renderingMode:'focused'});assert.equal(view.events.length,6);assert.equal(view.orders.filter(order=>order.supported).length,2);assert.equal(view.edges.filter(edge=>edge.supported).length,3);assert.equal(view.coverage.records.filter(record=>record.status!=='implemented').length,0);
  const dom=new JSDOM('<div></div>'),host=dom.window.document.querySelector('div'),controller=mountSequence(host,native,{renderingMode:'focused'});assert.equal(host.querySelectorAll('.sequence-event-proxy').length,6);assert.equal(host.querySelectorAll('.sequence-order-line').length,2);
  const first=host.querySelector('.sequence-layout-fields input');first.value='460';first.dispatchEvent(new dom.window.Event('change'));
  const portable=JSON.parse(JSON.stringify(controller.getState().layout)),remounted=sequenceLayout(native,{renderingMode:'focused',layout:portable});
  assert.equal(remounted.nodes[0].laneWidth,460);assert.deepEqual(remounted.nodes.map(node=>node.semanticId),view.nodes.map(node=>node.semanticId));
  assert.deepEqual(remounted.edges.map(edge=>[edge.semanticId,edge.source,edge.target,edge.notation]),view.edges.map(edge=>[edge.semanticId,edge.source,edge.target,edge.notation]));
  assert.deepEqual(remounted.orders.map(order=>[order.semanticId,order.sourceSemanticId,order.targetSemanticId]),view.orders.map(order=>[order.semanticId,order.sourceSemanticId,order.targetSemanticId]));assert.deepEqual(native,before);controller.destroy();
 }finally{engine.close();}
});
