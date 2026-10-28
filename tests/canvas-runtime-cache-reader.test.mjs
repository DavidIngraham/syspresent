import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {createRuntimeCacheReader,sourceDigest,verifiedRuntimeCache,verifiedRuntimeIndex} from '../src/canvas-prototype/project.mjs';

async function fixture({binary=true,...changes}={}){
 const documents=[{name:'model.sysml',content:'package NativeRoot {}',language:'sysml'}];
 const runtimeDocuments=[...documents,{name:'helper.sysml',content:'package Runtime {}',language:'sysml'}];
 const cache={schemaVersion:'syspresent.native-cache.v1',engineVersion:'engine',engineFingerprint:'fingerprint',modelHash:'native-model',inputDigest:await sourceDigest(documents),sourceDigest:await sourceDigest(runtimeDocuments),modelRoots:['NativeRoot'],requirementSeeds:[],runtimePackage:'Runtime',exported:{elements:[{'@id':'native-element'}]},views:{view:{nodes:[{semanticId:'native-element'}]}}};
 const text=JSON.stringify({...cache,...changes}),bytes=new TextEncoder().encode(text);
 const project={manifest:{runtimeCache:'runtime-cache.json'},files:{'runtime-cache.json':binary?bytes:text}};
 const options={trustedHash:createHash('sha256').update(bytes).digest('hex'),engineVersion:'engine',engineFingerprint:'fingerprint'};
 return {documents,runtimeDocuments,cache,text,bytes,project,options};
}
const withCrypto=async fn=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'crypto');
 Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});
 try{return await fn();}finally{if(original)Object.defineProperty(globalThis,'crypto',original);else delete globalThis.crypto;}
};

test('one compilation parses verified cache JSON once but checks both source boundaries',()=>withCrypto(async()=>{
 for(const binary of [true,false]){
  const f=await fixture({binary}),reader=createRuntimeCacheReader(f.project,f.options);
  let parses=0;const parse=JSON.parse;
  JSON.parse=function(text,...rest){if(text===f.text)parses++;return parse(text,...rest);};
  try{
   const index=await reader.index({documents:f.documents});
   assert.deepEqual(index,{modelRoots:['NativeRoot'],requirementSeeds:[],runtimePackage:'Runtime'});
   assert.equal(index.exported,undefined);
   index.modelRoots.push('caller-change');
   assert.equal(await reader.cache({documents:f.documents,modelHash:'native-model'}),null);
   assert.equal(await reader.cache({documents:f.runtimeDocuments,modelHash:'wrong-model'}),null);
   assert.deepEqual(await reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),f.cache);
   assert.equal(parses,1);
  }finally{JSON.parse=parse;}
 }
}));

test('runtime cache bytes changed in place or replaced after index verification are rejected',()=>withCrypto(async()=>{
 for(const mutation of [
  f=>{f.bytes[f.bytes.length-2]^=1;},
  f=>{f.project.files['runtime-cache.json']=new TextEncoder().encode(JSON.stringify({...f.cache,modelHash:'different-model'}));},
  f=>{delete f.project.files['runtime-cache.json'];},
  f=>{f.project.manifest.runtimeCache='untrusted-cache.json';}
 ]){
  const f=await fixture(),reader=createRuntimeCacheReader(f.project,f.options);
  assert.ok(await reader.index({documents:f.documents}));
  mutation(f);
  assert.equal(await reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),null);
 }
}));

test('the parsed snapshot is the exact binary input authenticated before asynchronous hashing',()=>withCrypto(async()=>{
 const f=await fixture(),original=f.bytes.slice();
 const reader=createRuntimeCacheReader(f.project,f.options);
 const pending=reader.index({documents:f.documents});
 // The reader starts on its serial queue. Mutate after hashing has captured bytes.
 await Promise.resolve();f.bytes.fill(32);
 const index=await pending;
 assert.deepEqual(index,{modelRoots:['NativeRoot'],requirementSeeds:[],runtimePackage:'Runtime'});
 assert.equal(await reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),null);
 f.bytes.set(original);
 assert.deepEqual(await reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),f.cache);
}));

test('caller-owned cache results cannot mutate later or concurrent reads',()=>withCrypto(async()=>{
 const f=await fixture(),reader=createRuntimeCacheReader(f.project,f.options);
 await reader.index({documents:f.documents});
 const [first,second]=await Promise.all([
  reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),
  reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'})
 ]);
 assert.notEqual(first,second);assert.notEqual(first.exported,second.exported);
 first.exported.elements[0]['@id']='caller-mutation';first.modelRoots.push('changed');
 assert.deepEqual(second,f.cache);
 assert.deepEqual(await reader.index({documents:f.documents}),{modelRoots:['NativeRoot'],requirementSeeds:[],runtimePackage:'Runtime'});
 assert.deepEqual(await reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),f.cache);
}));

test('untrusted hashes and incompatible engines never expose index or semantic cache',()=>withCrypto(async()=>{
 const f=await fixture();
 for(const changes of [{trustedHash:undefined},{trustedHash:'wrong'},{engineVersion:'wrong'},{engineFingerprint:'wrong'}]){
  const reader=createRuntimeCacheReader(f.project,{...f.options,...changes});
  assert.equal(await reader.index({documents:f.documents}),null);
  assert.equal(await reader.cache({documents:f.runtimeDocuments,modelHash:'native-model'}),null);
 }
 const changed=await fixture(),reader=createRuntimeCacheReader(changed.project,changed.options);
 assert.equal(await reader.index({documents:[{...changed.documents[0],content:'package Other {}'}]}),null);
 assert.equal(await reader.cache({documents:[...changed.runtimeDocuments,{name:'extra.sysml',content:'part extra;'}],modelHash:'native-model'}),null);
}));

test('existing cache helpers retain independent caller ownership and malformed JSON behavior',()=>withCrypto(async()=>{
 const f=await fixture(),options={...f.options,documents:f.runtimeDocuments,modelHash:'native-model'};
 const first=await verifiedRuntimeCache(f.project,options);
 first.exported.elements.length=0;
 assert.deepEqual(await verifiedRuntimeCache(f.project,options),f.cache);
 const malformed=new TextEncoder().encode('{'),project={manifest:{runtimeCache:'cache.json'},files:{'cache.json':malformed}},badOptions={...options,trustedHash:createHash('sha256').update(malformed).digest('hex')};
 assert.equal(await verifiedRuntimeIndex(project,{...badOptions,documents:f.documents}),null);
 await assert.rejects(verifiedRuntimeCache(project,badOptions),SyntaxError);
}));
