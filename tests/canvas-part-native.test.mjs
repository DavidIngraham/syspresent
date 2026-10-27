import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFileSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {traceContext} from '../src/canvas-prototype/exploration.mjs';
const binary=resolve(process.env.SYSPRESENT_NATIVE??'build/canvas-prototype/engine/sysml-native');
function nativeClient(){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const jobs=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native frame');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=jobs.get(message.id);if(!job)continue;jobs.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
 child.on('error',error=>{for(const job of jobs.values())job.reject(error);jobs.clear();});
 child.on('exit',code=>{for(const job of jobs.values())job.reject(Error('Native engine exited: '+code));jobs.clear();});
 return {call(method,params){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{jobs.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
test('real native declaration export supports inherited effective requirements and global usage impact',{skip:!existsSync(binary)&&'Build native semantic engine or set SYSPRESENT_NATIVE first',timeout:30000},async()=>{
 const client=nativeClient();
 try{
  const content=readFileSync(new URL('./fixtures/part-effective.sysml',import.meta.url),'utf8');
  const parsed=await client.call('ParseSources',{documents:[{name:'part-effective.sysml',content}]});
  assert.ok(!parsed.diagnostics?.some(d=>d.severity==='error'),JSON.stringify(parsed.diagnostics));
  const exported=await client.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),g=modelGraph(exported.elements);
  const id=name=>exported.elements.find(e=>e.qualifiedName==='EffectiveFixture::'+name)?.['@id'];
  assert.ok(id('component'));assert.ok(id('Base'));assert.ok(id('Derived'));
  const effective=traceContext(g,{focus:id('component'),mode:'effective'});
  assert.deepEqual(new Set(effective.targets),new Set([id('Base::baseReq'),id('Derived::localReq')]));
  assert.equal(effective.relationships.length,0,'collapsed declaration paths must not become invented links');
  const inherited=effective.paths.find(p=>p.target===id('Base::baseReq'));
  assert.deepEqual(inherited.elementIds,[id('component'),id('Derived'),id('Base'),id('Base::baseReq')]);
  assert.deepEqual(inherited.relationships.map(e=>e.kind),['typing','specialization','containment']);
  const nativeDerived=exported.elements.find(e=>e['@id']===id('Derived'));
  assert.equal(inherited.relationships[1].nativeRelationship,nativeDerived.ownedSubclassification[0]['@id']);
  const impact=traceContext(g,{focus:id('Derived'),mode:'global-impact'});
  assert.ok(impact.targets.includes(id('component')));assert.ok(impact.targets.includes(id('another')));
  assert.ok(impact.relationships.some(e=>e.kind==='specialization'&&e.source===id('Derived')&&e.target===id('Base')));
 }finally{client.close();}
});
