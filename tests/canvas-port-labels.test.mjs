import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {resolve} from 'node:path';
import ELK from 'elkjs/lib/elk.bundled.js';
import {JSDOM} from 'jsdom';
import {placePortLabels} from '../src/canvas-prototype/port-labels.mjs';
import {layoutDiagram} from '../src/canvas-prototype/elk-layout.mjs';
import {fitDiagram} from '../src/canvas-prototype/geometry.mjs';
import {measureFocusedNode} from '../src/canvas-prototype/focused-notation.mjs';
import {adaptNativeView} from '../src/canvas-prototype/graph.mjs';
const area={x:0,y:0,width:600,height:400},measureLabel=text=>({width:text.length*7,height:16});
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const owner=()=>({id:'owner',x:160,y:80,width:220,height:220});
const pin=(id='pin',y=160)=>({id,kind:'port',semanticId:'native-'+id,parentId:'owner',portSide:'WEST',x:154,y,width:12,height:12,label:'native input',portLabelBox:{x:180,y:80,width:84,height:16}});
test('port labels move locally off owner content without moving native pins or routes',()=>{
 const nodes=[owner(),pin()],edges=[{id:'native-edge',source:'pin',target:'other',points:[{x:154,y:166},{x:40,y:166}]}],before=structuredClone({nodes,edges});
 const result=placePortLabels(nodes,edges,{area,measureLabel});assert.equal(result.omissions.length,0);const p=result.nodes[1];assert.ok(p.portLabelBox.x+p.portLabelBox.width<p.x);assert.equal(overlap(p.portLabelBox,nodes[0]),false);assert.equal(p.semanticId,'native-pin');assert.equal(p.y,160);assert.deepEqual({nodes,edges},before);
});
test('valid nearby ELK label geometry wins and fitted dimensions use the supplied scale',()=>{
 const node={...pin(),portLabelBox:{x:60,y:160,width:84,height:16}};
 const first=placePortLabels([owner(),node],[],{area,measureLabel});assert.deepEqual(first.nodes[1].portLabelBox,node.portLabelBox);
 const scaled=[owner(),pin()].map(n=>({...n,x:n.x/2,y:n.y/2,width:n.width/2,height:n.height/2,portLabelBox:undefined}));
 const result=placePortLabels(scaled,[],{area,scale:.5,measureLabel});assert.equal(result.omissions.length,0);assert.equal(result.nodes[1].portLabelBox.width,42);assert.equal(result.nodes[1].portLabelBox.height,8);
});
test('compound headers, central/end labels, peer pins and route corridors remain reserved',()=>{
 const nodes=[{id:'assembly',x:0,y:0,width:600,height:400,headerHeight:70},{...owner(),parentId:'assembly'},pin('a',150),pin('b',190)],edges=[{id:'label',labelBox:{x:0,y:145,width:140,height:16},endLabelBoxes:[{box:{x:0,y:180,width:140,height:16}}],points:[{x:0,y:180},{x:150,y:180}]}];
 const result=placePortLabels(nodes,edges,{area,measureLabel});for(const node of result.nodes.filter(n=>n.portLabelBox)){assert.equal(overlap(node.portLabelBox,{...nodes[0],height:70}),false);for(const box of [edges[0].labelBox,edges[0].endLabelBoxes[0].box])assert.equal(overlap(node.portLabelBox,box),false);}
 assert.equal(result.nodes.length,nodes.length);assert.equal(result.nodes[2].parentId,'owner');
});
test('crowded native pins omit unsafe text with exact per-pin provenance and keep full labels',()=>{
 const nodes=[owner(),pin('a',160),pin('b',160)],before=structuredClone(nodes),result=placePortLabels(nodes,[],{area,measureLabel});
 assert.equal(result.omissions.length,2);for(const node of result.nodes.slice(1)){assert.equal(node.portLabelOmitted,true);assert.equal(node.portLabelBox,undefined);assert.equal(node.portLabelText,'native input');assert.equal(node.label,'native input');assert.ok(result.omissions.some(o=>o.nodeId===node.id&&o.semanticId===node.semanticId&&o.ownerId==='owner'&&o.text===node.label));}assert.deepEqual(nodes,before);
});
test('missing owner/side and invalid measurement fail honestly without guessed associations',()=>{
 const nodes=[owner(),{...pin('a'),portSide:undefined,portLabelBox:undefined},{...pin('b'),parentId:'absent'}],result=placePortLabels(nodes,[],{area,measureLabel});assert.equal(result.omissions.length,2);assert.equal(result.omissions[0].reason,'port-label-space');assert.equal(result.omissions[1].reason,'port-label-association');
 const bad=placePortLabels([owner(),pin()],[],{area,measureLabel:()=>({width:NaN,height:16})});assert.equal(bad.omissions[0].reason,'port-label-measurement');assert.throws(()=>placePortLabels([],[],{area:{x:0,y:0,width:0,height:10}}),/area/);
});
const binary=resolve(process.env.SYSPRESENT_NATIVE??'build/canvas-prototype/engine/sysml-native');
function client(){const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const jobs=new Map();child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=jobs.get(message.id);if(!job)continue;jobs.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});child.on('error',error=>{for(const job of jobs.values())job.reject(error);jobs.clear();});return {call(method,params){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{jobs.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};}
function sources(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(item=>item.isDirectory()?sources(resolve(dir,item.name)):item.name.endsWith('.sysml')?[{name:resolve(dir,item.name),content:readFileSync(resolve(dir,item.name),'utf8')}]:[]);}
test('actual Blue Dog Actuation native ten-pin view keeps fixed ELK geometry and safely places or discloses every label',{skip:!existsSync(binary)&&'Build native engine first',timeout:60000},async()=>{
 const native=client();try{
  const parsed=await native.call('ParseSources',{documents:sources(resolve('examples/canvas-blue-dog'))});
  const dto=await native.call('RenderView',{modelHash:parsed.modelHash,view:'#action:BlueDogBehaviorContracts::SailingActuationGate',includeSemanticIdentity:true,show:['parameter-symbols','port-symbols','typings','edge-labels']});
  const view=adaptNativeView(dto,'actuation-labels'),doc=new JSDOM('<body></body>').window.document;
  const measured={...view,nodes:view.nodes.map(n=>({...n,...measureFocusedNode(doc,n,null,{view})}))};
  const layout=await layoutDiagram(measured,{elk:new ELK(),width:1100,height:760,measureLabel}),fitted=fitDiagram(layout,{x:0,y:0,width:1100,height:760}),before=structuredClone(fitted);
  const result=placePortLabels(fitted.nodes,fitted.edges,{area:{x:0,y:0,width:1100,height:760},scale:fitted.scale,measureLabel}),pins=result.nodes.filter(n=>n.kind==='port');
  assert.equal(pins.length,10);assert.equal(pins.filter(n=>n.portSide==='WEST').length,9);assert.equal(pins.filter(n=>n.portSide==='EAST').length,1);
  assert.equal(pins.filter(n=>n.portLabelBox).length+result.omissions.length,10);
  const boxes=pins.filter(n=>n.portLabelBox);for(let i=0;i<boxes.length;i++)for(let j=0;j<i;j++)assert.equal(overlap(boxes[i].portLabelBox,boxes[j].portLabelBox),false);
  assert.ok(boxes.length>0,'new side policy must expose at least one safe native label');
  for(const node of result.nodes){const original=fitted.nodes.find(n=>n.id===node.id);for(const field of ['x','y','width','height','parentId','semanticId','nativePortId'])assert.equal(node[field],original[field]);}
  assert.deepEqual(fitted,before);console.log('Actual native Actuation label geometry:',JSON.stringify({pins:10,visible:boxes.length,omitted:result.omissions.length,scale:fitted.scale}));
 }finally{native.close();}
});
