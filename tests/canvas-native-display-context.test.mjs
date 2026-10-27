import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeViewContextIdentities,representedIdentities} from '../src/canvas-prototype/view-contract.mjs';
import {outsidePackage} from '../src/canvas-prototype/package-explorer.mjs';
import {modelGraph,adaptNativeView,graphView} from '../src/canvas-prototype/graph.mjs';

test('native pins, state actions and event proxies preserve owner membership but constrain scope',()=>{
 const view={id:'view',kind:'action',nodes:[{id:'n',semanticId:'owner',ports:[{id:'p',semanticId:'parameter'}],state:{behaviors:[{role:'entry',semanticId:'entry'}]}}],edges:[{id:'e',source:'n',target:'n',notation:{sourceEvent:{semanticId:'send'},targetEvent:{semanticId:'receive'}}}],sequenceOrders:[{sourceEvent:{semanticId:'receive'},targetEvent:{semanticId:'next'}}]};
 assert.deepEqual(representedIdentities(view),['owner']);
 assert.deepEqual(nativeViewContextIdentities(view),['parameter','entry','send','receive','next']);
 assert.deepEqual(outsidePackage(view,['owner','parameter','entry','send','receive']),['next']);
 assert.deepEqual(outsidePackage(view,undefined),[]);
 assert.deepEqual(view.nodes[0].ports,[{id:'p',semanticId:'parameter'}]);
});
test('native connection identity and production survive graph projection without render-local pins',()=>{
 const raw=[{'@id':'derived','@type':'RequirementUsage'},{'@id':'original','@type':'RequirementUsage'},{'@id':'derivation','@type':'ConnectionUsage'}];
 const notation={production:'derivation',declarationKind:'ConnectionUsage',sourceRole:'derived',targetRole:'original'};
 const view=adaptNativeView({kind:'requirement',nodes:[{id:'d',semanticId:'derived'},{id:'o',semanticId:'original'}],edges:[{id:'e',from:'d',to:'o',fromPort:'local',semanticId:'derivation',identityStatus:'mapped',kind:'derive',notation}]},'Native::view');
 const graph=modelGraph(raw,[view,view]);
 assert.equal(graph.relationships.length,1);
 assert.equal(graph.relationships[0].nativeRelationship,'derivation');
 assert.deepEqual(graph.relationships[0].notation,notation);
 const projected=graphView(graph,graph);
 assert.deepEqual(projected.edges[0].notation,notation);
 assert.equal(projected.edges[0].fromPort,undefined);
 assert.equal(view.edges[0].fromPort,'local');
});
test('conflicting native productions stay in occurrence provenance without a chosen production',()=>{
 const raw=[{'@id':'a','@type':'PartUsage'},{'@id':'b','@type':'PartUsage'},{'@id':'dep','@type':'Dependency'}];
 const native=(name,production)=>adaptNativeView({kind:'definition',nodes:[{id:'a',semanticId:'a'},{id:'b',semanticId:'b'}],edges:[{from:'a',to:'b',semanticId:'dep',identityStatus:'mapped',kind:'dependency',notation:{production}}]},name);
 const graph=modelGraph(raw,[native('one','refinement'),native('two','other')]);
 assert.equal(graph.relationships[0].notation,undefined);
 assert.equal(graph.relationships[0].occurrences.length,2);
 assert.deepEqual(graph.relationships[0].occurrences.map(o=>o.nativeEdge.notation.production),['refinement','other']);
});

test('capture retains spacing-only sequence layout without requiring customized participant widths',async()=>{
 const {createPresentationLayouts}=await import('../src/canvas-prototype/presentation-layout.mjs');
 const source={id:'Source',kind:'sequence',nodes:[{id:'p',semanticId:'participant'}]},target={...source,id:'Captured'};
 const store=createPresentationLayouts();store.setRegion(source,{schemaVersion:'syspresent.sequence-layout.v1',lanes:[],messageGap:140});
 const result=store.alias(source,target);assert.equal(result.retained,0);assert.equal(result.settingsRetained,true);
 assert.equal(store.getRegion(target).messageGap,140);
});

test('explicit undefined portable grid layout overrides stale legacy width cache',async()=>{
 const {JSDOM}=await import('jsdom'),{mountGrid}=await import('../src/canvas-prototype/grid-view.mjs');
 const dom=new JSDOM('<section id="host"></section>'),host=dom.window.document.getElementById('host');
 const view={id:'matrix',kind:'matrix',nodes:[],edges:[],columns:['Name','Target'],rows:[],columnElements:[{index:1,semanticId:'target'}]};
 const controller=mountGrid(host,view,{state:{layout:undefined,widths:{1:380}}});
 assert.equal(controller.getState().widths[1],undefined);
 assert.equal(host.querySelectorAll('col')[1].style.width,'200px');
 controller.destroy();dom.window.close();
});

test('native occurrence declarations offer the same deterministic sequence selector as action interactions',async()=>{
 const {focusViewKinds}=await import('../src/canvas-prototype/package-explorer.mjs');
 for(const kind of ['OccurrenceUsage','OccurrenceDefinition'])assert.deepEqual(focusViewKinds({kind}).find(item=>item.id==='native:sequence'),{id:'native:sequence',label:'Native sequence'});
 assert.equal(focusViewKinds({kind:'PartUsage'}).some(item=>item.id==='native:sequence'),false);
});
