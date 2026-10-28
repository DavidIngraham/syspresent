import test from 'node:test';
import assert from 'node:assert/strict';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {packageMembers,packageCatalog,containingPackage,outsidePackage,focusViewKinds} from '../src/canvas-prototype/package-explorer.mjs';
import {traceContext,structuralActions} from '../src/canvas-prototype/exploration.mjs';
import {surroundingContext} from '../src/canvas-prototype/context.mjs';

const declaration=(id,kind,owner,qname=id)=>({'@id':id,'@type':kind,declaredName:id,qualifiedName:qname,...(owner?{owner:{'@id':owner}}:{}),'sysx:sourceLine':1});
function fixture(){return modelGraph([
 declaration('project','Package'),declaration('scope','Package','project'),declaration('nested','Package','scope'),
 declaration('inside','PartUsage','nested','Unrelated::label'),declaration('fake','PartUsage','project','scope::looksInside'),
 declaration('external','PartDefinition','project'),declaration('req','RequirementUsage','scope'),
 {...declaration('typed','PartUsage','scope'),type:[{'@id':'external'}]},
 {'@id':'dependency','@type':'Dependency',client:[{'@id':'inside'}],supplier:[{'@id':'external'}]},
 {'@id':'library','@type':'Package',declaredName:'library',qualifiedName:'Library'},
 ]);}

test('package scope uses native ownership through nested declarations, never name prefixes or typing',()=>{
 const graph=fixture(),before=structuredClone(graph);
 assert.deepEqual(packageMembers(graph,'scope'),['inside','nested','req','scope','typed']);
 assert.equal(containingPackage(graph,'inside'),'nested');assert.equal(containingPackage(graph,'scope'),'project');
 assert.deepEqual(packageCatalog(graph,'sCoPe').map(e=>e.id),['scope']);
 assert.ok(!packageCatalog(graph).some(e=>e.id==='library'));
 assert.throws(()=>packageMembers(graph,'inside'),/project package/);assert.throws(()=>packageMembers(graph,'library'),/project package/);
 assert.deepEqual(graph,before);
});
test('native ownership cycles terminate and scope caches belong to their graph snapshot',()=>{
 const graph=fixture();graph.containment.push({source:'nested',target:'scope',nativeRole:'owner'});
 assert.equal(packageMembers(graph,'scope').length,5);assert.equal(containingPackage(graph,'scope'),'nested');
 const other=fixture();other.containment=other.containment.filter(e=>e.target!=='inside');delete other.elements.find(e=>e.id==='inside').native.owner;
 assert.ok(!packageMembers(other,'scope').includes('inside'));
});
test('scoped traces and neighborhoods disclose external native targets and retain direction',()=>{
 const graph=fixture(),scopeIds=packageMembers(graph,'scope');
 const context=traceContext(graph,{focus:'inside',mode:'context',scopeIds});
 assert.deepEqual(context.elements.map(e=>e.id).sort(),['inside','nested']);
 assert.ok(context.omissions.some(o=>o.target==='external'&&o.reason==='outside-scope'));
 assert.ok(context.relationships.some(e=>e.source==='nested'&&e.target==='inside'&&e.kind==='containment'));
 const neighborhood=surroundingContext(graph,{nodes:[{id:'n',semanticId:'inside'}],edges:[]},{scopeIds});
 assert.ok(!neighborhood.elements.some(e=>e.id==='external'));
 assert.ok(neighborhood.omissions.some(o=>o.target==='external'&&o.reason==='outside-scope'));
 assert.equal(structuralActions(graph,'scope',{scopeIds}).find(a=>a.mode==='container').count,0);
});
test('native behavior, grid and relationship-cell boundary checks preserve payloads and semantic endpoints',()=>{
 const ids=['inside','req'],view={kind:'sequence',nodes:[{id:'a',semanticId:'inside'},{id:'b',semanticId:'external'},{id:'control',identityStatus:'notation'}],edges:[]};
 const before=structuredClone(view);assert.deepEqual(outsidePackage(view,ids),['external']);assert.deepEqual(view,before);
 const matrix={kind:'matrix',rows:[{semanticId:'inside'}],columnElements:[{index:1,semanticId:'req'}],relationshipCells:[{row:0,column:1,relationships:[{semanticId:'relationship',sourceSemanticId:'inside',targetSemanticId:'external'}]}]};
 assert.deepEqual(outsidePackage(matrix,ids),['external']);
 assert.deepEqual(outsidePackage(view,undefined),[]);
});
test('view actions follow native element categories rather than names',()=>{
 assert.ok(focusViewKinds({kind:'Package'}).some(v=>v.id==='native:mixed'));
 assert.ok(focusViewKinds({kind:'ActionDefinition'}).some(v=>v.id==='native:sequence'));
 assert.ok(focusViewKinds({kind:'StateUsage'}).some(v=>v.id==='native:state'));
 assert.ok(!focusViewKinds({kind:'PartUsage',name:'Activity'}).some(v=>v.id==='native:action'));
});

test('every native declaration kind can reopen complete contents without a relationship budget',()=>{
 for(const kind of ['Package','PartUsage','PartDefinition','CalculationDefinition','AttributeUsage','PortDefinition','SatisfyRequirementUsage','MetadataUsage']){
  assert.deepEqual(focusViewKinds({kind}).find(view=>view.id==='contents'),{id:'contents',label:'Complete contents'});
 }
 assert.equal(focusViewKinds({kind:'Membership'}).some(view=>view.id==='contents'),false);
});

test('scope and nearest package traverse actual Dependency owners without adopting annotation targets',()=>{
 const graph=modelGraph([declaration('scope','Package'),declaration('other','Package'),declaration('relationship','Dependency','scope'),{...declaration('meta','MetadataUsage','relationship'),annotatedElement:[{'@id':'other'}]},declaration('value','AttributeUsage','meta')]);
 assert.deepEqual(packageMembers(graph,'scope'),['meta','relationship','scope','value']);
 assert.equal(containingPackage(graph,'meta'),'scope');
 assert.ok(!packageMembers(graph,'scope').includes('other'));
 assert.deepEqual(packageMembers(graph,'other'),['other']);
});
