import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState, context, Navigation, shareState, restoreState, SHARED_STATE_LIMITS} from '../src/exploration.mjs';
const bundle = {elements: [{id:'r',kind:'requirement'}, {id:'p',kind:'part',owner:'project'}, {id:'l',kind:'part',owner:'library'}], relationships:[{id:'s',source:'p',target:'r',kind:'satisfaction'}, {id:'t',source:'p',target:'l',kind:'typing'}, {id:'u',source:'l',target:'missing',kind:'typing'}],views:[]};
test('incoming satisfaction retains direction and is not a verdict', () => {
  const result = context(bundle, initialState('r'));
  assert.deepEqual(result.elements.map(e=>e.id), ['r','p']);
  assert.equal(result.relationships[0].source,'p');
  assert.equal(result.relationships[0].verdict,undefined);
});
test('library traversal and unavailable targets are explicit', () => {
  const result=context(bundle,{...initialState('p'),expanded:['l']});
  assert.ok(result.elements.some(e=>e.owner==='library'));
  assert.equal(result.omissions[0].reason,'unavailable');
});
test('filters and budget disclose hidden neighbors', () => {
  assert.equal(context(bundle,{...initialState('r'),budget:1}).omissions[0].reason,'budget');
  assert.equal(context(bundle,{...initialState('r'),nodeTypes:['requirement']}).omissions[0].reason,'node-filter');
  assert.equal(context(bundle,{...initialState('r'),relationshipTypes:['typing']}).omissions[0].reason,'relationship-filter');
});
test('history and sharing restore exact context without switching snapshots', () => {
  const first=initialState('r'); const nav=new Navigation(first);
  const next=nav.update({focus:'p',expanded:['l'],pinned:['r'],nodeTypes:['part']});
  assert.deepEqual(nav.back(),first); assert.deepEqual(nav.forward(),next);
  const hash=shareState('frozen','intro',next);
  assert.deepEqual(restoreState(hash,'frozen',bundle).exploration,next);
  assert.throws(()=>restoreState(hash,'latest',bundle),/Snapshot mismatch/);
});

test('hidden intermediate nodes cannot expand into disconnected context', () => {
  const graph={elements:[{id:'a',kind:'requirement'},{id:'b',kind:'part'},{id:'c',kind:'requirement'}],relationships:[{id:'ab',source:'a',target:'b',kind:'trace'},{id:'bc',source:'b',target:'c',kind:'trace'}]};
  const result=context(graph,{...initialState('a'),expanded:['b'],nodeTypes:['requirement']});
  assert.deepEqual(result.elements.map(e=>e.id),['a']);
  assert.deepEqual(context(graph,{...initialState('a'),expanded:['b'],budget:1}).elements.map(e=>e.id),['a']);
});

const rawState = (state, extra={}) => '#state='+encodeURIComponent(JSON.stringify({version:1,snapshotId:'frozen',stop:'intro',exploration:state,...extra}));
const sceneBundle = {...bundle,views:[{id:'requirements',elementIds:['r','p']}]};

test('shared native scene restores annotations, placements and camera exactly',()=>{
  const state={...initialState('r'),view:'requirements',sceneOptions:{annotations:[{target:'r',text:'Requirement\nwith context'}],placements:[{target:'p',x:-120,y:300}],camera:{target:'r',zoom:1.25}}};
  assert.deepEqual(restoreState(shareState('frozen','intro',state),'frozen',sceneBundle).exploration,state);
});

test('search catalog identities restore without requiring initial drawing membership',()=>{
  const sharded={...bundle,searchIndex:[{id:'remote',exported:true,kind:'requirement'}]};
  const state={...initialState('remote'),expanded:['r'],pinned:['remote']};
  const restored=restoreState(rawState(state),'frozen',sharded);
  assert.deepEqual(restored.exploration,state);
  assert.equal(restored.unresolvedElementIds,undefined);
});

test('unnamed shard identities remain provisional until the caller resolves them',()=>{
  const sharded={...bundle,searchIndex:[],modelStore:{schemaVersion:'syspresent.model-shards.v1',addressing:'sha256-utf8-first2',shards:{aa:{path:'model/aa.json.gz'}}}};
  const state={...initialState('anonymous-native-id'),expanded:['second-native-id'],pinned:['r']};
  const restored=restoreState(rawState(state),'frozen',sharded);
  assert.deepEqual(restored.unresolvedElementIds,['anonymous-native-id','second-native-id']);
  assert.deepEqual(restored.exploration,state);
  assert.throws(()=>restoreState(rawState(state),'frozen',bundle),/Unknown model element/);
  assert.throws(()=>restoreState(rawState(state),'frozen',{...sharded,modelStore:{...sharded.modelStore,shards:{unresolved:{}}}}),/Unknown model element/);
});

test('shared state is bounded before decoding or applying graph context',()=>{
  assert.throws(()=>restoreState('#state='+'x'.repeat(SHARED_STATE_LIMITS.hash),'frozen',bundle),/size/);
  assert.throws(()=>restoreState(rawState(initialState('r'),{stop:'x'.repeat(SHARED_STATE_LIMITS.identifier+1)}),'frozen',bundle),/string/);
  assert.throws(()=>restoreState(rawState({...initialState('r'),expanded:Array.from({length:1001},(_,i)=>'id'+i)}),'frozen',bundle),/array/);
  assert.throws(()=>restoreState(rawState({...initialState('r'),nodeTypes:Array.from({length:129},(_,i)=>'type'+i)}),'frozen',bundle),/array/);
  assert.throws(()=>restoreState(rawState({...initialState('r'),relationshipTypes:['x'.repeat(257)]}),'frozen',bundle),/string/);
  assert.throws(()=>shareState('frozen','intro',{...initialState('r'),expanded:['r','r']}),/Duplicate/);
});

test('shared state refuses malformed objects and unexpected fields',()=>{
  for(const state of [false,1,'r',[],{}, {...initialState('r'),budget:0},{...initialState('r'),budget:1001},{...initialState('r'),focus:'r\u0000'}, {...initialState('r'),untrusted:'value'}]){
    assert.throws(()=>restoreState(rawState(state),'frozen',bundle));
  }
  assert.throws(()=>restoreState(rawState(null,{untrusted:'value'}),'frozen',bundle),/fields/);
  assert.throws(()=>restoreState('#state=%E0%A4%A','frozen',bundle));
  const polluted=JSON.parse('{"version":1,"snapshotId":"frozen","exploration":null,"__proto__":{"polluted":true}}');
  assert.throws(()=>restoreState('#state='+encodeURIComponent(JSON.stringify(polluted)),'frozen',bundle),/fields/);
  assert.equal({}.polluted,undefined);
});

test('scene options must refer to the actual selected native view',()=>{
  const scene={annotations:[{target:'l',text:'Outside selected view'}]};
  assert.throws(()=>restoreState(rawState({...initialState('r'),view:'requirements',sceneOptions:scene}),'frozen',sceneBundle),/absent from selected view/);
  assert.throws(()=>restoreState(rawState({...initialState('r'),sceneOptions:{camera:{target:'r',zoom:1}}}),'frozen',sceneBundle),/require a native view/);
  assert.throws(()=>restoreState(rawState({...initialState('r'),view:'missing',sceneOptions:{}}),'frozen',sceneBundle),/Unknown view/);
});

test('scene options reject excessive annotations and invalid coordinates',()=>{
  const invalid=[
    {annotations:[{target:'r',text:'x'.repeat(SHARED_STATE_LIMITS.annotationText+1)}]},
    {annotations:Array.from({length:101},()=>({target:'r',text:'text'}))},
    {annotations:[{target:'r',text:'first'},{target:'r',text:'second'}]},
    {annotations:[{target:'r',text:'text',html:'<script>'}]},
    {placements:[{target:'r',x:1e308,y:0}]},
    {placements:[{target:'r',x:null,y:0}]},
    {placements:[{target:'r',x:'0',y:0}]},
    {camera:{target:'r',zoom:0}},
    {camera:{target:'r',zoom:1e308}},
    {camera:{target:'r',zoom:0.000001}},
    {camera:{target:'r',zoom:1,x:10}},
  ];
  for(const sceneOptions of invalid) assert.throws(()=>restoreState(rawState({...initialState('r'),view:'requirements',sceneOptions}),'frozen',sceneBundle));
  assert.throws(()=>shareState('frozen','intro',{...initialState('r'),view:'requirements',sceneOptions:{placements:[{target:'r',x:Infinity,y:0}]}}),/coordinate/);
});

test('valid null and empty scene options preserve existing exploration links',()=>{
  for(const sceneOptions of [null,{}]){
    const state={...initialState('r'),sceneOptions};
    assert.deepEqual(restoreState(shareState('frozen',null,state),'frozen',bundle).exploration,state);
  }
  assert.equal(restoreState(shareState('frozen','intro'),'frozen',bundle).exploration,null);
});
