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
