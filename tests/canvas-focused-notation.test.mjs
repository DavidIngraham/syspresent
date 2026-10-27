import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {spawn} from 'node:child_process';
import {existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {focusedNodeDescriptor,focusedFace,measureFocusedNode,focusedNotationNotices,focusedEdgeAppearance} from '../src/canvas-prototype/focused-notation.mjs';
import {edgeAppearance,markerDefinition} from '../src/canvas-prototype/notation.mjs';
const document=new JSDOM('<!doctype html><body></body>').window.document;
const raw=[
 {'@id':'pkg','@type':'Package',declaredName:'System','sysx:sourceLine':1},
 {'@id':'def','@type':'PartDefinition',declaredName:'Device',owner:{'@id':'pkg'},'sysx:sourceLine':2},
 {'@id':'use','@type':'PartUsage',declaredName:'device',type:[{'@id':'def'}],owner:{'@id':'pkg'},'sysx:sourceLine':3},
 {'@id':'attribute','@type':'AttributeUsage',declaredName:'voltage',type:[{'@id':'real'}],owner:{'@id':'def'},'sysx:sourceLine':4},
 {'@id':'part','@type':'PartUsage',declaredName:'sensor',owner:{'@id':'def'},'sysx:sourceLine':5},
 {'@id':'port','@type':'PortUsage',declaredName:'io',direction:'out',owner:{'@id':'def'},'sysx:sourceLine':6},
 {'@id':'real','@type':'DataType',declaredName:'Real'},
 {'@id':'reqdef','@type':'RequirementDefinition',declaredName:'Limit',declaredShortName:'R-01','sysx:sourceLine':7},
 {'@id':'req','@type':'RequirementUsage',declaredName:'limit',type:[{'@id':'reqdef'}],'sysx:sourceLine':8},
 {'@id':'documentation','@type':'Documentation',owner:{'@id':'reqdef'},body:'Voltage shall remain within the modeled limit.'},
 {'@id':'action','@type':'ActionDefinition',declaredName:'Inspect','sysx:sourceLine':9},
];
const graph=modelGraph(raw),node=(id,kind='part')=>({id:'render:'+id,semanticId:id,name:'Misleading label',kind});

test('focused native definitions and usages have distinct normative headers and shapes',()=>{
 const definition=focusedNodeDescriptor(node('def'),graph),usage=focusedNodeDescriptor(node('use'),graph);
 assert.deepEqual([definition.keyword,definition.name,definition.shape],['part def','Device','rectangle']);
 assert.deepEqual([usage.keyword,usage.name,usage.type,usage.shape],['part','device','Device','rounded']);
 assert.equal(focusedNodeDescriptor(node('pkg'),graph).shape,'package');
 const requirement=focusedNodeDescriptor(node('reqdef'),graph);assert.equal(requirement.keyword,'requirement def');assert.equal(requirement.name,'<R-01> Limit');
 assert.equal(focusedNodeDescriptor(node('req'),graph).keyword,'requirement');
 assert.equal(focusedNodeDescriptor(node('missing','part def'),graph).supported,false,'a label or render kind cannot invent definition status');
});

test('focused compartments use actual owner declarations and keep classifier parts out of usage slots',()=>{
 const descriptor=focusedNodeDescriptor(node('def'),graph),face=focusedFace(document,node('def'),graph);
 assert.deepEqual(descriptor.compartments.map(c=>c.title),['ports','parts','attributes']);
 assert.deepEqual(new Set([...face.querySelectorAll('[data-semantic-id]')].map(e=>e.dataset.semanticId)),new Set(['attribute','part','port']));
 assert.match(face.textContent,/voltage : Real/);assert.equal(focusedNodeDescriptor(node('use'),graph).compartments.length,0);
 const requirement=focusedFace(document,node('reqdef'),graph);assert.equal(requirement.querySelector('.focused-compartment-title').textContent,'doc');assert.match(requirement.textContent,/Voltage shall/);
});

test('measured descriptor fixes optional expansion for the exact rendered face',()=>{
 const measured=measureFocusedNode(document,node('def'),graph,{expanded:false});assert.equal(measured.focusedDescriptor.compartments.length,0);
 const face=focusedFace(document,{...node('def'),...measured},graph,{expanded:true});assert.equal(face.querySelector('.focused-compartment'),null);
 const expanded=measureFocusedNode(document,node('def'),graph,{expanded:true});assert.ok(expanded.height>measured.height);assert.ok(expanded.width>=220);
 assert.equal(measured.focusedDescriptor.semanticId,'def');assert.equal(measured.focusedDescriptor.representationId,'render:def');
});

test('mandatory native behavior text survives collapsed optional compartments without interpreting its labels',()=>{
 const source={...node('action','action def'),text:'entry / initialize',detail:'do / sample\nexit / stop'},descriptor=focusedNodeDescriptor(source,graph,{expanded:false}),face=focusedFace(document,{...source,focusedDescriptor:descriptor},graph);
 assert.match(face.textContent,/entry \/ initialize/);assert.match(face.textContent,/exit \/ stop/);assert.equal(descriptor.compartments[0].mandatory,true);assert.ok(descriptor.notices.some(n=>n.message.includes('retained verbatim')));
 assert.equal(focusedNodeDescriptor({id:'unsupported',kind:'AND',name:'requirement part'},graph).supported,false,'fault-tree symbols cannot acquire official notation from labels');
});

test('completion and termination retain distinct official control glyphs',()=>{
 const done=focusedFace(document,{id:'done',kind:'final',identityStatus:'synthetic'},graph),terminate=focusedFace(document,{id:'stop',kind:'terminate action',identityStatus:'synthetic'},graph);
 assert.equal(done.dataset.shape,'control');assert.equal(done.querySelector('path').getAttribute('fill-rule'),'evenodd');assert.match(terminate.querySelector('path').getAttribute('d'),/M10 10 L30 30/);
 assert.notEqual(done.querySelector('path').getAttribute('d'),terminate.querySelector('path').getAttribute('d'));
 const fork=measureFocusedNode(document,{id:'fork',kind:'fork'},graph);assert.equal(fork.height,8);assert.equal(focusedFace(document,{id:'fork',kind:'fork',...fork},graph).querySelector('path').getAttribute('d'),'M0 0 H40 V40 H0 Z');
 for(const kind of ['start','fork','join','decision','merge'])assert.equal(focusedFace(document,{id:kind,kind},graph).dataset.supported,'true');
});

test('embedded ports retain native direction and distinguish parameters from model ports',()=>{
 const input={...node('port','port'),parentId:'render:def',direction:'in',portSide:'WEST'},face=focusedFace(document,input,graph);
 assert.equal(face.dataset.shape,'port-glyph');assert.equal(face.dataset.supported,'true');assert.match(face.querySelector('svg').style.transform,/rotate\(360deg\)/);
 const parameter=focusedFace(document,{...input,parameter:true},graph);assert.ok(parameter.querySelector('rect'));
 const measured=measureFocusedNode(document,input,graph),relocated=focusedFace(document,{...input,...measured,portSide:'NORTH'},graph);assert.match(relocated.querySelector('svg').style.transform,/rotate\(450deg\)/,'geometry-selected side may change after measurement without changing native direction');
 const absent=focusedNodeDescriptor({id:'pin',kind:'port',parentId:'a'},graph);assert.equal(absent.supported,false);assert.match(absent.notices[0].message,/direction is unavailable/);
 const before=structuredClone(input);focusedFace(document,input,graph);assert.deepEqual(input,before);
});

test('focused relationship profiles preserve endpoints while rendering SysML v2 productions separately',()=>{
 const source={id:'typing-id',source:'usage',target:'definition',kind:'typing',label:'typing'},before=structuredClone(source);
 const type=focusedEdgeAppearance(source);assert.deepEqual([type.line,type.targetMarker],['solid','definition-two-dot']);assert.deepEqual(source,before);
 assert.equal(type.label,'');const named=focusedEdgeAppearance({kind:'satisfy',label:'native role'});assert.equal(focusedEdgeAppearance({...source,kind:'satisfy',label:named.label}).label,named.label,'layout/paint formatting is idempotent');
 assert.equal(edgeAppearance(source).line,'dashed','exploratory engine profile remains separate');
 assert.equal(focusedEdgeAppearance({kind:'containment'}).sourceMarker,'owned-membership');
 for(const kind of ['satisfy','verify','allocate','include']){const profile=focusedEdgeAppearance({kind,label:kind});assert.equal(profile.line,'solid');assert.equal(profile.targetMarker,'open-arrow');assert.equal(profile.label,'«'+kind+'»');}
 assert.equal(focusedEdgeAppearance({kind:'succession'},{viewKind:'action'}).line,'dashed');assert.equal(focusedEdgeAppearance({kind:'transition'},{viewKind:'state'}).targetMarker,'open-arrow');
 const marker=markerDefinition('definition-two-dot');assert.equal(marker.refX,21);assert.equal(marker.fill,'background');assert.equal(marker.adornments[0].fill,'line');assert.match(marker.path,/L21,8/);assert.ok(markerDefinition('owned-membership').path.includes('M6,1 L6,11'));
});

test('per-kind limitations disclose ambiguous native flows, derivation, and presentation rollups',()=>{
 for(const kind of ['derive','refine','flow','constructor','unknown']){const appearance=focusedEdgeAppearance({kind,label:'satisfy'});assert.equal(appearance.supported,false);assert.equal(appearance.targetMarker,'none');assert.match(appearance.notice,/unsupported/);}
 assert.equal(focusedEdgeAppearance({kind:'satisfy',presentationOnly:true}).supported,false);
 const notices=focusedNotationNotices({kind:'definition',nodes:[{id:'gate',kind:'AND'}],edges:[{id:'native-derive',kind:'derive'}]},graph);
 assert.ok(notices.some(n=>n.kind==='AND'));assert.ok(notices.some(n=>n.relationshipId==='native-derive'));
});

test('focused native prose stays inert and omission markers retain the actual declaration total',()=>{
 const copy=structuredClone(graph);copy.elements.find(e=>e.id==='reqdef').description='<script>throw Error(1)</script>';
 const face=focusedFace(document,node('reqdef'),copy);assert.equal(face.querySelector('script'),null);assert.match(face.textContent,/<script>/);
 const descriptor=focusedNodeDescriptor(node('def'),graph,{pageSize:1});assert.ok(descriptor.compartments.some(c=>c.text==='…'));assert.ok(descriptor.notices.some(n=>n.shown===1&&n.total===3));
});

const binary=resolve(process.env.SYSPRESENT_NATIVE??'build/canvas-prototype/engine/sysml-native');
function nativeClient(){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const jobs=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native frame');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=jobs.get(message.id);if(!job)continue;jobs.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
 child.on('error',error=>{for(const job of jobs.values())job.reject(error);jobs.clear();});
 child.on('exit',code=>{for(const job of jobs.values())job.reject(Error('Native engine exited: '+code));jobs.clear();});
 return {call(method,params){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{jobs.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}

test('actual native declarations and action rendering drive focused notation without label inference',{skip:!existsSync(binary)&&'Build native engine or set SYSPRESENT_NATIVE first',timeout:30000},async()=>{
 const client=nativeClient();
 try{
  const content=`package FocusedFixture {
   part def Sensor;
   port def DataPort;
   part def Device { attribute voltage : ScalarValues::Real; part sensor : Sensor; port io : DataPort; }
   part device : Device;
   requirement def Limit { doc /* Voltage shall remain within its modeled limit. */ }
   requirement limit : Limit;
   action def Inspect { first start; then action sample; then done; }
   view inspect : StandardViewDefinitions::ActionFlowView { expose FocusedFixture::Inspect; }
  }`;
  const parsed=await client.call('ParseSources',{documents:[{name:'focused-notation.sysml',content}]});assert.ok(!parsed.diagnostics?.some(d=>String(d.severity).toLowerCase()==='error'),JSON.stringify(parsed.diagnostics));
  const exported=await client.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),g=modelGraph(exported.elements),id=name=>g.elements.find(e=>e.qualifiedName==='FocusedFixture::'+name)?.id;
  assert.ok(id('Device'));assert.ok(id('device'));
  const definition=focusedNodeDescriptor({id:'definition-representation',semanticId:id('Device'),kind:'part',name:'misleading'},g),usage=focusedNodeDescriptor({id:'usage-representation',semanticId:id('device'),kind:'part def',name:'misleading'},g);
  assert.equal(definition.keyword,'part def');assert.equal(usage.keyword,'part');assert.equal(usage.type,'Device');assert.equal(usage.compartments.length,0);
  assert.deepEqual(new Set(definition.compartments.map(c=>c.title)),new Set(['attributes','parts','ports']));
  const nativeVoltage=g.elements.find(e=>e.id===id('Device::voltage')),voltageTypes=(Array.isArray(nativeVoltage.native.type)?nativeVoltage.native.type:[nativeVoltage.native.type]).map(t=>t['@id']);assert.ok(voltageTypes.length);
  const missingLibrary={...g,elements:g.elements.filter(e=>!voltageTypes.includes(e.id))};
  const missingAttribute=focusedNodeDescriptor({id:'voltage-representation',semanticId:nativeVoltage.id,kind:'attribute'},missingLibrary),missingOwner=focusedNodeDescriptor({id:'device-representation',semanticId:id('Device'),kind:'part'},missingLibrary);
  assert.equal(missingAttribute.type,'');assert.deepEqual(missingAttribute.typeIds,voltageTypes);assert.deepEqual(missingAttribute.unresolvedTypeIds,voltageTypes);
  const voltageEntry=missingOwner.compartments.flatMap(c=>c.entries??[]).find(e=>e.semanticId===nativeVoltage.id);assert.equal(voltageEntry.text,'voltage');assert.deepEqual(voltageEntry.typeIds,voltageTypes);
  for(const typeId of voltageTypes){assert.ok(missingAttribute.notices.some(n=>n.typeId===typeId));assert.ok(missingOwner.notices.some(n=>n.target===nativeVoltage.id&&n.typeId===typeId));assert.ok(!focusedFace(document,{id:'voltage',semanticId:nativeVoltage.id,kind:'attribute',focusedDescriptor:missingAttribute},missingLibrary).textContent.includes(typeId));}

  const requirement=focusedNodeDescriptor({id:'requirement',semanticId:id('Limit'),kind:'requirement'},g);assert.equal(requirement.keyword,'requirement def');assert.ok(requirement.compartments.some(c=>c.title==='doc'&&c.text.includes('Voltage shall')));
  const action=await client.call('RenderView',{modelHash:parsed.modelHash,view:'FocusedFixture::inspect',includeSemanticIdentity:true});assert.ok(action.nodes.length>1);
  const start=action.nodes.find(n=>['initial','start'].includes(n.kind)),done=action.nodes.find(n=>['final','end','done'].includes(n.kind));assert.ok(start);assert.ok(done);
  assert.equal(focusedNodeDescriptor(start,g).control,'start');assert.equal(focusedNodeDescriptor(done,g).control,'done');
  for(const edge of action.edges.filter(e=>e.kind==='succession'))assert.equal(focusedEdgeAppearance(edge,{viewKind:'action'}).targetMarker,'open-arrow');
 }finally{client.close();}
});

test('unsupported native families and overloaded case relationships always have coverage notices',()=>{
 for(const kind of ['sequence','table','matrix','grid','fault-tree'])assert.ok(focusedNotationNotices({kind,nodes:[],edges:[]},graph).some(n=>n.reason==='unsupported-focused-family'));
 assert.equal(focusedEdgeAppearance({kind:'typing'},{viewKind:'case'}).supported,false);assert.equal(focusedEdgeAppearance({kind:'reference'},{viewKind:'mixed'}).supported,false);
});

test('unavailable native type/value and unrendered modifiers produce explicit per-element notices',()=>{
 const copy=modelGraph([{'@id':'a','@type':'AttributeUsage',declaredName:'load',type:[{'@id':'missing-type'}],value:{'@id':'expression'},isReadOnly:true,'sysx:sourceLine':1}]);
 const descriptor=focusedNodeDescriptor(node('a','attribute'),copy);assert.ok(descriptor.notices.some(n=>n.message.includes('missing-type')));assert.ok(descriptor.notices.some(n=>n.message.includes('not evaluated')));assert.ok(descriptor.notices.some(n=>n.message.includes('isReadOnly')));
});

test('intrinsically reference attributes keep their normative rounded outline instead of inventing an attribute-ref symbol',()=>{
 const g=modelGraph([{'@id':'attribute','@type':'AttributeUsage',declaredName:'mass',isReference:true,isComposite:false,'sysx:sourceLine':1},{'@id':'part','@type':'PartUsage',declaredName:'external',isReference:true,'sysx:sourceLine':2}]);
 assert.equal(focusedNodeDescriptor(node('attribute','attribute'),g).reference,false);assert.equal(focusedNodeDescriptor(node('part','part'),g).reference,true);
});

test('missing library type identities remain diagnostic provenance and never masquerade as graphical type names',()=>{
 const missing='9cd0e404-9217-4c4f-9a45-3aef2ce5ee9d',g=modelGraph([
  {'@id':'hull','@type':'PartDefinition',declaredName:'Hull','sysx:sourceLine':1},
  {'@id':'mass','@type':'AttributeUsage',declaredName:'mass',type:[{'@id':missing}],owner:{'@id':'hull'},'sysx:sourceLine':2},
  {'@id':'unnamed','@type':'DataType'},
  {'@id':'volume','@type':'AttributeUsage',declaredName:'volume',type:[{'@id':'unnamed'}],owner:{'@id':'hull'},'sysx:sourceLine':3},
 ]),before=structuredClone(g);
 const mass=focusedNodeDescriptor(node('mass','attribute'),g),header=focusedFace(document,{...node('mass','attribute'),focusedDescriptor:mass},g);
 assert.equal(mass.type,'');assert.deepEqual(mass.typeIds,[missing]);assert.deepEqual(mass.unresolvedTypeIds,[missing]);assert.equal(header.querySelector('.focused-name').textContent,'mass');assert.ok(!header.textContent.includes(missing));
 const hull=focusedNodeDescriptor(node('hull'),g),face=focusedFace(document,{...node('hull'),focusedDescriptor:hull},g),entries=hull.compartments.flatMap(c=>c.entries??[]);
 assert.equal(entries.find(e=>e.semanticId==='mass').text,'mass');assert.deepEqual(entries.find(e=>e.semanticId==='mass').typeIds,[missing]);assert.equal(entries.find(e=>e.semanticId==='volume').text,'volume');assert.ok(!face.textContent.includes(missing));assert.ok(!face.textContent.includes(' : '));
 for(const id of [missing,'unnamed'])assert.ok(hull.notices.some(n=>n.reason==='focused-type-unavailable'&&n.typeId===id&&n.message.includes(id)));
 assert.deepEqual(g,before);
});
