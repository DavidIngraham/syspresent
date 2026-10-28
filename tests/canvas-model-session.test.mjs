import test from 'node:test';
import assert from 'node:assert/strict';
import {createModelSession} from '../src/canvas-prototype/engine/model-session.mjs';

function fixture(){
  const calls=[],models=new Set();let nextParse='one',hold;
  const native={ready:Promise.resolve({}),call:async(method,params)=>{
    calls.push({method,params});
    if(hold){const pause=hold;hold=null;await pause;}
    if(method==='ParseSources'){models.add(nextParse);return {modelHash:nextParse};}
    if(method==='ReleaseModel')return {released:models.delete(params.modelHash)};
    if(!models.has(params.modelHash))throw Error('Unknown native model');
    if(method==='Fail')throw Error('Native rejected candidate');
    return {identity:params.modelHash};
  }};
  return {session:createModelSession(native),calls,models,parse:hash=>{nextParse=hash;},hold:()=>{let resolve;hold=new Promise(r=>resolve=r);return resolve;}};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));

test('current and candidate share identical parse identities until both owners end',async()=>{
  const f=fixture(),current=f.session.createLease(),candidate=f.session.createLease();
  await current.engine.call('ParseSources',{});await candidate.engine.call('ParseSources',{});
  await current.dispose();assert.equal(f.models.has('one'),true);
  assert.deepEqual(await candidate.engine.call('RenderView',{modelHash:'one'}),{identity:'one'});
  await candidate.dispose();assert.equal(f.models.size,0);
  assert.equal(f.calls.filter(c=>c.method==='ReleaseModel').length,1);
  await candidate.dispose();assert.equal(f.calls.filter(c=>c.method==='ReleaseModel').length,1);
});

test('load drops its discovery model before retaining the compiled runtime model',async()=>{
  const f=fixture(),lease=f.session.createLease();
  await lease.engine.call('ParseSources',{});f.parse('runtime');await lease.engine.call('ParseSources',{});
  await lease.retainOnly('runtime');
  assert.deepEqual([...f.models],['runtime']);
  await lease.dispose();assert.equal(f.models.size,0);
});

test('disposal waits for the full already submitted native call and a pending parse',async()=>{
  const f=fixture(),lease=f.session.createLease(),resume=f.hold();
  const parsing=lease.engine.call('ParseSources',{}),disposed=lease.dispose();
  await tick();assert.equal(f.calls.length,1);assert.equal(f.calls[0].method,'ParseSources');
  resume();await parsing;await disposed;
  assert.deepEqual(f.calls.map(c=>c.method),['ParseSources','ReleaseModel']);
  assert.equal(f.models.size,0);await assert.rejects(lease.engine.call('RenderView',{modelHash:'one'}),/lease has ended/);
});

test('same-hash reparse after disposal is ordered after release and remains usable',async()=>{
  const f=fixture(),a=f.session.createLease();await a.engine.call('ParseSources',{});
  const disposed=a.dispose(),b=f.session.createLease(),parsed=b.engine.call('ParseSources',{});
  await Promise.all([disposed,parsed]);assert.deepEqual(f.calls.map(c=>c.method),['ParseSources','ReleaseModel','ParseSources']);
  assert.deepEqual(await b.engine.call('Evaluate',{modelHash:'one'}),{identity:'one'});
  await b.dispose();
});

test('releasing an old project preserves its already submitted query and the new model',async()=>{
  const f=fixture(),old=f.session.createLease(),candidate=f.session.createLease();
  await old.engine.call('ParseSources',{});f.parse('new');await candidate.engine.call('ParseSources',{});
  const query=f.session.engine.call('RenderView',{modelHash:'one'}),cleanup=old.dispose();
  assert.deepEqual(await query,{identity:'one'});await cleanup;
  assert.deepEqual([...f.models],['new']);
  assert.deepEqual(await f.session.engine.call('Evaluate',{modelHash:'new'}),{identity:'new'});
  await candidate.dispose();
});

test('failed candidates are released without poisoning the request queue or current model',async()=>{
  const f=fixture(),current=f.session.createLease(),candidate=f.session.createLease();
  await current.engine.call('ParseSources',{});f.parse('bad');await candidate.engine.call('ParseSources',{});
  await assert.rejects(candidate.engine.call('Fail',{modelHash:'bad'}),/Native rejected/);
  await candidate.dispose();assert.deepEqual([...f.models],['one']);
  assert.deepEqual(await f.session.engine.call('RenderView',{modelHash:'one'}),{identity:'one'});
  await current.dispose();
});

test('unowned parses are rejected and invalid retention does not silently lose models',async()=>{
  const f=fixture(),lease=f.session.createLease();
  await assert.rejects(f.session.engine.call('ParseSources',{}),/requires a model lease/);
  await lease.engine.call('ParseSources',{});
  await assert.rejects(lease.retainOnly('unknown'),/does not own/);assert.deepEqual([...f.models],['one']);
  await lease.dispose();
});


test('disposing leases after worker termination clears ownership without calls to the dead native engine',async()=>{
 let closed=false,calls=0;
 const native={ready:Promise.resolve({}),get closed(){return closed;},terminate(){closed=true;},async call(method){calls++;if(closed)throw Error('Native worker ended');return method==='ParseSources'?{modelHash:'current'}:{};}};
 const session=createModelSession(native),lease=session.createLease();await lease.engine.call('ParseSources',{});session.engine.terminate();
 assert.equal(session.engine.closed,true);assert.equal(lease.engine.closed,true);await lease.dispose();await lease.dispose();assert.equal(calls,1);
});
