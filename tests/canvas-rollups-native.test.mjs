import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {modelGraph,adaptNativeView} from '../src/canvas-prototype/graph.mjs';
import {relationshipRollups,rollupDrilldown} from '../src/canvas-prototype/rollups.mjs';
const binary=resolve(process.env.SYSPRESENT_NATIVE??'build/canvas-prototype/engine/sysml-native');
function nativeClient(){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const jobs=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native frame');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=jobs.get(message.id);if(!job)continue;jobs.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
 child.on('error',error=>{for(const job of jobs.values())job.reject(error);jobs.clear();});child.on('exit',code=>{for(const job of jobs.values())job.reject(Error('Native engine exited: '+code));jobs.clear();});
 return {call(method,params){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{jobs.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
test('real native satisfaction origin survives repeated view projections and typed rollup drilldown',{skip:!existsSync(binary)&&'Build native semantic engine or set SYSPRESENT_NATIVE first',timeout:30000},async()=>{
 const client=nativeClient();
 const content=`package SatisfactionFixture {
  private import StandardViewDefinitions::*;
  package Design { part p; }
  package Requirements { requirement r; }
  satisfy Requirements::r by Design::p;
  view firstProjection : GeneralView { filter @SysML::RequirementUsage; expose Requirements::**; }
  view secondProjection : GeneralView { filter @SysML::RequirementUsage; expose Requirements::**; }
 }`;
 try{
  const parsed=await client.call('ParseSources',{documents:[{name:'satisfaction-native.sysml',content}]});assert.ok(!parsed.diagnostics?.some(d=>d.severity==='error'),JSON.stringify(parsed.diagnostics));
  const exported=await client.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),assertion=exported.elements.find(e=>e['@type']==='SatisfyRequirementUsage');assert.ok(assertion);
  const views=[];for(const view of ['SatisfactionFixture::firstProjection','SatisfactionFixture::secondProjection'])views.push(adaptNativeView(await client.call('RenderView',{modelHash:parsed.modelHash,view,includeSemanticIdentity:true}),view));
  for(const view of views){const edge=view.edges.find(e=>e.kind==='satisfy');assert.ok(edge);assert.equal(edge.semanticId,assertion['@id']);assert.equal(edge.identityStatus,'mapped');}
  const g=modelGraph(exported.elements,views),id=name=>exported.elements.find(e=>e.qualifiedName==='SatisfactionFixture::'+name)['@id'];
  const aggregate=relationshipRollups(g,{visibleIds:[id('Design'),id('Requirements')]}).rollups.find(r=>r.kind==='satisfy');assert.ok(aggregate);
  assert.equal(aggregate.nativeRelationshipCount,1);assert.equal(aggregate.count,1);assert.equal(aggregate.occurrenceCount,2);assert.equal(aggregate.identityComplete,true);assert.deepEqual(aggregate.nativeRelationshipIds,[assertion['@id']]);
  const detail=rollupDrilldown(g,aggregate);assert.equal(detail.relationships.length,1);assert.equal(detail.relationships[0].nativeRelationship,assertion['@id']);assert.equal(detail.relationships[0].source,id('Design::p'));assert.equal(detail.relationships[0].target,id('Requirements::r'));
 }finally{client.close();}
});
