import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {gzipSync,gunzipSync} from 'node:zlib';
import {ModelStore} from '../src/model_store.mjs';
const digest=async bytes=>createHash('sha256').update(bytes).digest('hex');
const bucket=id=>createHash('sha256').update(id).digest('hex').slice(0,2);
function fixture(){
  const elements=[{id:'a',name:'A',native:{raw:'complete-a'}},{id:'b',name:'B',native:{raw:'complete-b'}}];
  const edge={id:'ab',source:'a',target:'b',kind:'allocation',label:'native allocation'};
  const unknown={id:'outside',source:'b',target:'missing',kind:'reference'};
  const blocks={a:{element:elements[0],relationships:[edge],neighbors:[{id:'b',name:'B',exported:true}]},b:{element:elements[1],relationships:[edge,unknown],neighbors:[{id:'a',name:'A',exported:true},{id:'missing',exported:false}]}};
  return packageBlocks(blocks);
}
function packageBlocks(blocks){const grouped={},files=new Map(),shards={};for(const [id,block] of Object.entries(blocks)){const key=bucket(id);(grouped[key]??={})[id]=block;}
  for(const [key,nodes] of Object.entries(grouped)){const bytes=gzipSync(JSON.stringify({schemaVersion:'syspresent.model-shards.v1',bucket:key,nodes})),path=`model/${key}.json.gz`;files.set(path,bytes);shards[key]={path,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
  const bundle={elements:[],relationships:[],modelStore:{schemaVersion:'syspresent.model-shards.v1',shards}};
  const options={digest,decompress:async bytes=>gunzipSync(bytes),fetchBytes:async path=>files.get(path)};
  return {bundle,options,files};
}

test('loads requested full node and known neighbor summaries, then deduplicates all incident edges',async()=>{
  const {bundle,options}=fixture(),store=new ModelStore(bundle,options);
  await store.ensureNeighborhood(['a']);assert.equal(bundle.elements.find(e=>e.id==='a').native.raw,'complete-a');assert.equal(bundle.elements.find(e=>e.id==='b').neighborhoodLoaded,false);
  await store.ensureNeighborhood(['b','a']);assert.equal(bundle.elements.find(e=>e.id==='b').native.raw,'complete-b');assert.equal(bundle.relationships.length,2);
  assert.deepEqual(bundle.relationships[0],{id:'ab',source:'a',target:'b',kind:'allocation',label:'native allocation'});
  assert.ok(!bundle.elements.some(e=>e.id==='missing'));assert.ok(bundle.unavailableTargets.includes('missing'));
  assert.deepEqual((await store.ensureNeighborhood(['missing'])).unavailable,['missing']);
});

test('compressed digest is checked before decompression or mutation',async()=>{
  const {bundle,options,files}=fixture();const bytes=files.values().next().value;bytes[bytes.length-1]^=1;let decoded=false;
  const store=new ModelStore(bundle,{...options,decompress:async()=>{decoded=true;return new Uint8Array();}});
  await assert.rejects(store.ensureNeighborhood(['a']),/integrity/);assert.equal(decoded,false);assert.deepEqual(bundle.elements,[]);assert.deepEqual(bundle.relationships,[]);
});

test('LRU never keeps more than eight buckets and does not discard loaded native context',async()=>{
  const blocks={},seen=new Set();for(let i=0;seen.size<10;i++){const id='node-'+i,key=bucket(id);if(seen.has(key))continue;seen.add(key);blocks[id]={element:{id,native:{original:i}},relationships:[],neighbors:[]};}
  const {bundle,options}=packageBlocks(blocks);let loads=0;const store=new ModelStore(bundle,{...options,fetchBytes:async path=>{loads++;return options.fetchBytes(path);}});
  await store.ensureNeighborhood(Object.keys(blocks));assert.equal(store.cache.size,8);assert.equal(bundle.elements.length,10);
  await store.ensureNeighborhood(Object.keys(blocks));assert.equal(loads,10);assert.equal(bundle.elements.length,10);
});

test('concurrent requests share one bucket load and errors remain visible',async()=>{
  const {bundle,options}=fixture();let loads=0;const store=new ModelStore(bundle,{...options,fetchBytes:async path=>{loads++;return options.fetchBytes(path);}});
  await Promise.all([store.ensureNeighborhood(['a']),store.ensureNeighborhood(['a'])]);assert.equal(loads,1);assert.equal(bundle.relationships.length,1);
  const failed=new ModelStore(fixture().bundle,{...options,fetchBytes:async()=>{throw Error('offline');}});await assert.rejects(failed.ensureNeighborhood(['a']),/offline/);
});
test('unsharded bundles remain usable without fetching or rewriting native context',async()=>{
  const bundle={elements:[{id:'a',native:{original:true}}],relationships:[]};const before=JSON.stringify(bundle);
  const store=new ModelStore(bundle,{fetchBytes:async()=>{throw Error('must not fetch');},digest});
  assert.deepEqual(await store.ensureNeighborhood(['a','missing']),{loaded:['a'],unavailable:['missing']});assert.equal(JSON.stringify(bundle),before);
});
