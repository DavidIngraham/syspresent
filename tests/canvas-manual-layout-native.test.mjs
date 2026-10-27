import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import ELK from 'elkjs/lib/elk.bundled.js';
import {adaptNativeView} from '../src/canvas-prototype/graph.mjs';
import {layoutDiagram} from '../src/canvas-prototype/elk-layout.mjs';
import {fitDiagram,routeConnectsEndpoints,routeIsClear} from '../src/canvas-prototype/geometry.mjs';
import {manualLayoutSupport,moveLayoutNode} from '../src/canvas-prototype/manual-layout.mjs';
function nativeClient(binary){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)break;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)break;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
 for(const event of ['error','exit'])child.on(event,error=>{for(const job of pending.values())job.reject(Error(String(error)));pending.clear();});
 return {call(method,params={}){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
const binary=resolve(process.env.SYSPRESENT_NATIVE_ENGINE??'build/canvas-prototype/engine/sysml-native');
test('native RenderView and fitted ELK parent bounds allow a bounded internal-part move without moving peers',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const source='package Pins { part assembly { part source { port output; } part sink { port input; } connect source.output to sink.input; } }';
  const parsed=await engine.call('ParseSources',{documents:[{name:'pins.sysml',content:source}]}),raw=await engine.call('RenderView',{modelHash:parsed.modelHash,view:'#interconnection:Pins::assembly',includeSemanticIdentity:true});
  assert.equal((parsed.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error')).length,0);
  const view=adaptNativeView(raw,'#interconnection:Pins::assembly'),area={x:0,y:0,width:1000,height:800},fitted=fitDiagram(await layoutDiagram(view,{elk:new ELK(),width:1000,height:800}),area),before=structuredClone(fitted);
  const child=fitted.nodes.find(n=>n.semanticId==='Pins__assembly__source'),parent=fitted.nodes.find(n=>n.id===child.parentId);assert.ok(parent.headerHeight>0);assert.equal(manualLayoutSupport(fitted,child.id).supported,true);
  const moved=moveLayoutNode(fitted,{id:child.id,x:child.x,y:child.y+2},{area});assert.deepEqual(fitted,before);
  const descendants=new Set([child.id]);for(let progress=true;progress;){progress=false;for(const node of fitted.nodes)if(descendants.has(node.parentId)&&!descendants.has(node.id)){descendants.add(node.id);progress=true;}}
  for(const node of moved.nodes){const old=fitted.nodes.find(n=>n.id===node.id);assert.equal(node.y-old.y,descendants.has(node.id)?2:0);assert.equal(node.x,old.x);assert.equal(node.semanticId,old.semanticId);if(node.portLabelBox&&descendants.has(node.id))assert.equal(node.portLabelBox.y-old.portLabelBox.y,2);}
  const nativeEdge=fitted.edges[0],edge=moved.edges[0];assert.equal(edge.semanticId,nativeEdge.semanticId);assert.equal(edge.source,nativeEdge.source);assert.equal(edge.target,nativeEdge.target);assert.equal(edge.fromPort,nativeEdge.fromPort);assert.equal(edge.toPort,nativeEdge.toPort);
  const attached={...edge,source:edge.sourceAttachment??edge.source,target:edge.targetAttachment??edge.target};assert.equal(edge.routingBlocked,false);assert.equal(routeConnectsEndpoints(edge.points,attached,moved.nodes),true);assert.equal(routeIsClear(edge.points,attached,moved.nodes),true);
  assert.throws(()=>moveLayoutNode(fitted,{id:child.id,x:child.x,y:parent.y+parent.headerHeight-child.height/2},{area}),/parent content bounds/);
 }finally{engine.close();}
});
