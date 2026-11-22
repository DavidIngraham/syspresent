import test from 'node:test';
import assert from 'node:assert/strict';
import {discoverNativeIndex} from '../src/canvas-prototype/native-project.mjs';

test('native roots use parse identities and document boundaries, not qualified-name resemblance',()=>{
 const parsed={roots:[{childIds:['root']},{childIds:['views']}]},exported={elements:[{'@id':'unrelated',qualifiedName:'Root::Pretend','@type':'Package'},{'@id':'root',qualifiedName:'Root','@type':'PartDefinition'},{'@id':'views',qualifiedName:'Views','@type':'Package'},{'@id':'req','@type':'RequirementUsage',qualifiedName:'Root::safety',declaredName:'safety'},{'@id':'fake','@type':'PartUsage',qualifiedName:'Root::Requirement',declaredName:'Requirement'}]};
 assert.deepEqual(discoverNativeIndex(parsed,exported,{modelDocumentCount:1}),{modelRoots:['Root'],requirementSeeds:['Root::safety']});
 assert.deepEqual(discoverNativeIndex({roots:[]},{elements:[]}),{modelRoots:[],requirementSeeds:[]});
});


test('a sole conventionally named view file still supplies native model roots',()=>{
 assert.deepEqual(discoverNativeIndex({roots:[{childIds:['Model']}]},{elements:[{'@id':'Model','@type':'Package',qualifiedName:'Model'}]},{modelDocumentCount:0}).modelRoots,['Model']);
});

import {discoverModelIndex} from '../src/canvas-prototype/native-project.mjs';
test('native discovery uses the advertised lightweight index and retains strict identities',async()=>{
 const parsed={modelHash:'native-hash',roots:[{childIds:['root']},{childIds:['views']}]},calls=[];
 const response={projection:'declaration-index',declarationIndex:[{id:'root',qualifiedName:"'A::B'"},{id:'req',qualifiedName:"'A::B'::safety",requirementSeed:true},{id:'views',qualifiedName:'Views'}]};
 const engine={call:async(method,params)=>{calls.push([method,params]);return response;}};
 assert.deepEqual(await discoverModelIndex(engine,parsed,{capabilities:['declaration_index'],modelDocumentCount:1}),{modelRoots:["'A::B'"],requirementSeeds:["'A::B'::safety"],qualifiedNames:["'A::B'","'A::B'::safety",'Views']});
 assert.deepEqual(calls,[['ExportModel',{modelHash:'native-hash',projection:'declaration-index'}]]);
 response.declarationIndex[1].requirementSeed='true';await assert.rejects(discoverModelIndex(engine,parsed,{capabilities:['declaration_index']}),/Invalid native declaration index entry/);
});
test('native discovery keeps the existing full declaration fallback for older engines',async()=>{
 let projection;const engine={call:async(_,params)=>{projection=params.projection;return {elements:[{'@id':'root',qualifiedName:'P','@type':'Package'},{'@id':'r',qualifiedName:'P::r',declaredName:'r','@type':'RequirementUsage'}]};}};
 assert.deepEqual(await discoverModelIndex(engine,{modelHash:'hash',roots:[{childIds:['root']}]}),{modelRoots:['P'],requirementSeeds:['P::r'],qualifiedNames:['P','P::r']});assert.equal(projection,'declarations');
});
