import test from 'node:test';
import assert from 'node:assert/strict';
import {createFocusedNativeViews,FOCUSED_NATIVE_SHOW,FOCUSED_NATIVE_PROFILE} from '../src/canvas-prototype/focused-native-view.mjs';

const view=()=>({id:'Views::activity',kind:'action',title:'Author title',capture:{definition:'ActionFlowView',root:'Model::Activity'},nodes:[{id:'old',semanticId:'old'}],edges:[],omissions:[{reason:'old-projection'}]});
const native=()=>({kind:'action',nodes:[
 {id:'source',semanticId:'source-id',ports:[{id:'output',semanticId:'output-id',parameter:true,direction:'out'}]},
 {id:'target',semanticId:'target-id',ports:[{id:'input',semanticId:'input-id',parameter:true,direction:'in'}]},
 {id:'outside',semanticId:'outside-reader-scope'},
],edges:[
 {from:'source',to:'target',fromPort:'output',toPort:'input',kind:'flow',semanticId:'flow1',notation:{production:'flow',sourceRole:'source',targetRole:'target'}},
 {from:'source',to:'target',fromPort:'output',toPort:'input',kind:'flow',semanticId:'flow2',notation:{production:'flow',sourceRole:'source',targetRole:'target'}},
],notices:['Native notice'],nativeExtension:{facts:['kept']}});
function provider(reply=native,options={}){
 const calls=[],engine={async call(method,params){calls.push({method,params});return typeof reply==='function'?reply():reply;}};
 return {...createFocusedNativeViews({engine,modelHash:'loaded-model',declaredViewIds:['Views::activity'],...options}),calls};
}

test('focused profile re-renders full native membership and directed duplicate occurrences',async()=>{
 const input=view(),before=structuredClone(input),p=provider(),actual=await p.resolve(input);
 assert.deepEqual(p.calls,[{method:'RenderView',params:{modelHash:'loaded-model',view:'Views::activity',includeSemanticIdentity:true,show:[...FOCUSED_NATIVE_SHOW]}}]);
 assert.equal(actual.id,input.id);assert.equal(actual.title,input.title);assert.deepEqual(actual.capture,input.capture);
 assert.equal(actual.focusedNative,true);assert.equal(actual.nativeDisplayProfile,FOCUSED_NATIVE_PROFILE);
 assert.equal(actual.nodes.length,3);assert.equal(actual.nodes[2].semanticId,'outside-reader-scope');
 assert.deepEqual(actual.edges.map(e=>e.semanticId),['flow1','flow2']);assert.equal(actual.edges[0].fromPort,'output');assert.equal(actual.edges[0].toPort,'input');
 assert.equal(actual.nodes[0].ports[0].parameter,true);assert.deepEqual(actual.nativeExtension,{facts:['kept']});assert.deepEqual(actual.notices,['Native notice']);assert.equal(actual.omissions,undefined);
 assert.deepEqual(input,before);
});

test('concurrent requests share one promise while returned presentation and native records stay isolated',async()=>{
 let release;const reply=new Promise(resolve=>{release=resolve;}),p=provider(()=>reply),a=view(),b={...view(),title:'Different title',capture:{definition:'Other',root:'Other'}};
 const first=p.resolve(a),second=p.resolve(b);await Promise.resolve();assert.equal(p.calls.length,1);release(native());
 const [one,two]=await Promise.all([first,second]);assert.equal(one.title,'Author title');assert.equal(two.title,'Different title');
 one.nodes[0].ports[0].name='mutated';one.edges[0].notation.production='mutated';one.capture.root='mutated';one.nativeExtension.facts.push('mutated');
 const again=await p.resolve(a);assert.equal(p.calls.length,1);assert.equal(again.nodes[0].ports[0].name,undefined);assert.equal(again.edges[0].notation.production,'flow');assert.equal(again.capture.root,'Model::Activity');assert.deepEqual(again.nativeExtension,{facts:['kept']});assert.equal(two.capture.root,'Other');
});

test('generic projections remain the same object even when forced or containing a native selector',async()=>{
 const p=provider();for(const item of [
  {...view(),id:'explore:#action:Model::Activity'}, {...view(),id:'overview:Model'},
  {...view(),id:'transition:Views::activity'}, {...view(),id:'projection:Views::activity'},
  {...view(),transitionOnly:true}, {...view(),projectionOnly:true}, {...view(),presentationOnly:true}, {...view(),overview:{summary:{}}},
  {...view(),id:'Unknown'}, {...view(),id:''}, {kind:'action'},null,
 ]) {assert.equal(await p.resolve(item),item);if(item?.id==='Unknown')continue;if(item?.id==='')continue;if(!item?.id)continue;assert.equal(await p.resolve(item,{forceNative:true}),item);}
 assert.equal(p.calls.length,0);
});

test('native selectors and explicitly forced source previews use the same native profile',async()=>{
 const p=provider();const selector={...view(),id:'#action:Model::Activity'};await p.resolve(selector);
 const preview={...view(),id:'NewAuthored::slide'};assert.equal(await p.resolve(preview),preview);await p.resolve(preview,{forceNative:true});
 assert.deepEqual(p.calls.map(call=>call.params.view),['#action:Model::Activity','NewAuthored::slide']);
});

test('failed native requests evict the promise and can retry without changing the input',async()=>{
 let attempts=0;const input=view(),p=provider(()=>{if(++attempts===1)throw Error('Native failure');return native();});
 await assert.rejects(p.resolve(input),/Native failure/);const actual=await p.resolve(input);assert.equal(p.calls.length,2);assert.equal(actual.nodes.length,3);assert.equal(input.nodes[0].id,'old');
});

test('unsupported, changed-kind and missing native identities fail honestly and evict bad responses',async()=>{
 for(const [bad,message]of [[{kind:'timeline',nodes:[],edges:[]},/Unsupported focused native notation/],[{kind:'state',nodes:[],edges:[]},/changed notation from action to state/],[{kind:'action',nodes:[{id:'missing'}],edges:[]},/Native semantic identity missing/]]){
  let attempts=0;const p=provider(()=>++attempts===1?bad:native());await assert.rejects(p.resolve(view()),message);await p.resolve(view());assert.equal(p.calls.length,2);
 }
});

test('each caller verifies the expected native kind even for a cached response',async()=>{
 const p=provider();await p.resolve(view());await assert.rejects(p.resolve({...view(),kind:'state'}),/changed notation from state to action/);assert.equal(p.calls.length,1);await p.resolve(view());assert.equal(p.calls.length,2);
});

test('model identity and declaration inventory are fixed per factory and show flags cannot mutate the profile',async()=>{
 const ids=new Set(['Views::activity']),calls=[],engine={async call(method,params){calls.push(params);params.show.push('mutated-by-transport');return native();}};
 const a=createFocusedNativeViews({engine,modelHash:'model-a',declaredViewIds:ids});ids.add('Later::view');
 assert.equal(await a.resolve({...view(),id:'Later::view'}).then(v=>v.focusedNative),undefined);
 await a.resolve(view());await a.resolve({...view(),id:'#action:Another'});
 const b=createFocusedNativeViews({engine,modelHash:'model-b',declaredViewIds:['Views::activity']});await b.resolve(view());
 assert.deepEqual(calls.map(c=>c.modelHash),['model-a','model-a','model-b']);assert.equal(FOCUSED_NATIVE_SHOW.length,4);assert.equal(Object.isFrozen(FOCUSED_NATIVE_SHOW),true);
 assert.throws(()=>createFocusedNativeViews(),/semantic engine/);assert.throws(()=>createFocusedNativeViews({engine}),/loaded model identity/);
});
