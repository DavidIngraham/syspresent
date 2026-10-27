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
 assert.match(face.textContent,/entry \/ initialize/);assert.match(face.textContent,/exit \/ stop/);assert.equal(descriptor.compartments[0].mandatory,true);
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
 for(const kind of ['sequence','table','matrix','grid'])assert.equal(focusedNotationNotices({kind,nodes:[],edges:[]},graph).length,0,'surface-specific native coverage is owned by its renderer');assert.ok(focusedNotationNotices({kind:'fault-tree',nodes:[],edges:[]},graph).some(n=>n.reason==='focused-native-base'));
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


test('concrete native declaration kinds use their own official headers instead of arbitrary unsupported boxes',()=>{
 const cases=[['EnumerationDefinition','enum def'],['EnumerationUsage','enum'],['CalculationDefinition','calc def'],['CalculationUsage','calc'],['OccurrenceUsage','occurrence'],['ConnectionUsage','connection'],['AllocationUsage','allocation'],['FlowUsage','flow'],['ViewUsage','view'],['MetadataDefinition','metadata def'],['AssignmentActionUsage','assign'],['AssertConstraintUsage','assert constraint'],['SatisfyRequirementUsage','satisfy requirement']];
 const g=modelGraph(cases.map(([kind],i)=>({'@id':'e'+i,'@type':kind,declaredName:'entry'+i,'sysx:sourceLine':i+1})));
 for(const [[kind,keyword],i]of cases.map((entry,i)=>[entry,i])){const d=focusedNodeDescriptor({id:'v'+i,semanticId:'e'+i,kind:'unrelated label'},g);assert.equal(d.keyword,keyword,kind);assert.equal(d.supported,true,kind);assert.equal(d.shape,kind.endsWith('Definition')?'rectangle':'rounded');}
});

test('action and calculation compartments retain actual native directed parameters, ordered/nonunique and constant flags',()=>{
 const g=modelGraph([
  {'@id':'action','@type':'ActionDefinition',declaredName:'Control','sysx:sourceLine':1},
  {'@id':'input','@type':'ReferenceUsage',declaredName:'sample',direction:'in',isOrdered:true,isUnique:false,isConstant:true,owner:{'@id':'action'},'sysx:sourceLine':2},
  {'@id':'output','@type':'AttributeUsage',declaredName:'result',direction:'out',isResult:true,owner:{'@id':'action'},'sysx:sourceLine':3},
 ]),d=focusedNodeDescriptor(node('action','action'),g),parameters=d.compartments.find(c=>c.title==='parameters');
 assert.equal(parameters.entries.length,2);assert.ok(parameters.entries.some(e=>e.semanticId==='input'&&e.text==='in constant sample ordered nonunique'));assert.ok(parameters.entries.some(e=>e.semanticId==='output'&&e.text==='out result'));
 const header=focusedNodeDescriptor(node('input','parameter'),g);assert.equal(header.supported,false,'a parameter outside its owning action frame does not acquire an invented standalone node symbol');
});

test('native structured state behavior roles, parallel marker and action identities survive collapsed optional compartments',()=>{
 const g=modelGraph([{'@id':'state','@type':'StateDefinition',declaredName:'Operate','sysx:sourceLine':1}]),input={id:'v-state',semanticId:'state',kind:'state def',detail:'flattened legacy text must not be parsed',state:{parallel:true,behaviors:[{role:'entry',text:'initialize',kind:'ActionUsage',semanticId:'enter',qualifiedName:'M::initialize',identityStatus:'mapped'},{role:'do',text:'sample',kind:'ActionUsage',semanticId:'work',identityStatus:'mapped'},{role:'exit',text:'stop',kind:'ActionUsage',semanticId:'leave',identityStatus:'mapped'}]}};
 const before=structuredClone(input),descriptor=focusedNodeDescriptor(input,g,{expanded:false}),face=focusedFace(document,{...input,focusedDescriptor:descriptor},g);
 assert.deepEqual(descriptor.annotations,['parallel']);assert.deepEqual(descriptor.compartments.map(c=>c.title),['entry','do','exit']);assert.deepEqual([...face.querySelectorAll('[data-semantic-id]')].map(e=>e.dataset.semanticId),['enter','work','leave']);assert.ok(!face.textContent.includes('flattened legacy'));assert.match(face.textContent,/«parallel»/);assert.deepEqual(input,before);
 const old=focusedNodeDescriptor({...input,state:undefined},g,{expanded:false});assert.ok(old.notices.some(n=>n.message.includes('older payload')));
});

test('native send and accept actions use distinct official header icons and retain native operand text',()=>{
 const g=modelGraph([{'@id':'send','@type':'SendActionUsage','sysx:sourceLine':1},{'@id':'accept','@type':'AcceptActionUsage','sysx:sourceLine':2}]);
 const send=focusedFace(document,{id:'send-node',semanticId:'send',kind:'send',text:'event to receiver'},g),accept=focusedFace(document,{id:'accept-node',semanticId:'accept',kind:'accept',text:'event via port'},g);
 assert.equal(send.dataset.actionGlyph,'send');assert.equal(accept.dataset.actionGlyph,'accept');assert.notEqual(send.querySelector('path').getAttribute('d'),accept.querySelector('path').getAttribute('d'));assert.match(send.textContent,/event to receiver/);assert.ok(!send.textContent.includes('@'));
});

test('actual native dependency roles enable refinement base notation without reading source text or guessing from a label',()=>{
 const g=modelGraph([{'@id':'a','@type':'RequirementUsage',declaredName:'detail','sysx:sourceLine':1},{'@id':'b','@type':'RequirementUsage',declaredName:'goal','sysx:sourceLine':2},{'@id':'dependency','@type':'Dependency',declaredName:'refineGoal',client:[{'@id':'a'}],supplier:[{'@id':'b'}],'sysx:sourceLine':3}]);
 const view={kind:'requirement',nodes:[{id:'n1',semanticId:'a'},{id:'n2',semanticId:'b'}]},edge={kind:'refine',semanticId:'dependency',from:'n1',to:'n2',label:'fake textual meaning'},before=structuredClone(edge);
 const profile=focusedEdgeAppearance(edge,{graph:g,view,viewKind:view.kind});assert.equal(profile.supported,true);assert.equal(profile.coverage,'native-base');assert.equal(profile.line,'dashed');assert.equal(profile.targetMarker,'open-arrow');assert.equal(profile.label,'refineGoal');assert.deepEqual(edge,before);
 assert.equal(focusedEdgeAppearance({...edge,from:'n2',to:'n1'},{graph:g,view}).supported,false,'reversed endpoints cannot borrow client/supplier semantics');
});

test('native derivation and flow production facts select the correct connector/flow symbols and preserve directed provenance',()=>{
 const derivation={kind:'derive',name:'deriveLimit',from:'derived',to:'original',notation:{production:'derivation',declarationKind:'ConnectionUsage',sourceRole:'derived',targetRole:'original',sourceEndName:'newRequirement',targetEndName:'basis'}},before=structuredClone(derivation),d=focusedEdgeAppearance(derivation);
 assert.equal(d.supported,true);assert.equal(d.line,'solid');assert.equal(d.sourceMarker,'none');assert.equal(d.targetMarker,'none');assert.equal(d.label,'deriveLimit');assert.deepEqual(d.endLabels,[{end:'source',role:'derived',text:'newRequirement'},{end:'target',role:'original',text:'basis'}]);assert.deepEqual(derivation,before);
 for(const [production,line,marker]of [['flow','solid','filled-arrow'],['succession-flow','dashed','filled-arrow'],['message','solid','open-arrow']]){const edge={kind:'flow',from:'a',to:'b',fromPort:'a.port',toPort:'b.port',notation:{production}},appearance=focusedEdgeAppearance(edge);assert.equal(appearance.supported,true);assert.equal(appearance.line,line);assert.equal(appearance.targetMarker,marker);}
 const incomplete=focusedEdgeAppearance({kind:'flow',notation:{production:'flow'}});assert.equal(incomplete.supported,false);assert.ok(incomplete.missingFacts.includes('fromPort'));
 assert.equal(focusedEdgeAppearance({kind:'succession',notation:{production:'action-succession'}},{viewKind:'mixed'}).supported,true);
});

test('fault-tree native categories use available occurrence/connection bases with visible extension disclosure',()=>{
 const g=modelGraph([{'@id':'gate','@type':'OccurrenceUsage',declaredName:'systemLoss','sysx:sourceLine':1}]),descriptor=focusedNodeDescriptor({id:'gate-node',semanticId:'gate',kind:'AND'},g),face=focusedFace(document,{id:'gate-node',semanticId:'gate',kind:'AND',focusedDescriptor:descriptor},g);
 assert.equal(descriptor.supported,true);assert.equal(descriptor.keyword,'occurrence');assert.equal(descriptor.coverage,'native-base');assert.match(face.textContent,/Native fault-tree category: AND/);assert.ok(descriptor.notices.some(n=>n.reason==='focused-native-base'));
});


test('native subtype roles distinguish subclassification, subsetting, reference-subsetting and redefinition markers',()=>{
 for(const [role,extra,expected]of [['specializes',{},'hollow-triangle'],['subsets',{},'hollow-triangle'],['subsets',{ownedReferenceSubsetting:{'@id':'relation'}},'reference-subsetting'],['redefines',{},'redefinition']]){
  const g=modelGraph([{'@id':'specific','@type':role==='specializes'?'PartDefinition':'PartUsage',declaredName:'Specific',[role]:{'@id':'general'},...extra,'sysx:sourceLine':1},{'@id':'general','@type':role==='specializes'?'PartDefinition':'PartUsage',declaredName:'General','sysx:sourceLine':2}]),edge={kind:'specialization',semanticSource:'specific',semanticTarget:'general'},profile=focusedEdgeAppearance(edge,{graph:g});
  assert.equal(profile.supported,true);assert.equal(profile.targetMarker,expected);assert.equal(edge.semanticSource,'specific');assert.equal(edge.semanticTarget,'general');
 }
 assert.equal(focusedEdgeAppearance({kind:'specialization',label:'redefines'}).supported,false,'free text cannot select a specialization subtype');
 assert.ok(markerDefinition('redefinition').path.includes('M3,1 L3,15'));assert.equal(markerDefinition('reference-subsetting').adornments[0].fill,'line');
});

test('mixed native type and perform/exhibit roles render only when their direct target is supplied',()=>{
 const g=modelGraph([{'@id':'definition','@type':'UseCaseDefinition',declaredName:'Start','sysx:sourceLine':1},{'@id':'usage','@type':'UseCaseUsage',declaredName:'start',type:[{'@id':'definition'}],'sysx:sourceLine':2},{'@id':'perform','@type':'PerformActionUsage',subsets:{'@id':'action'},'sysx:sourceLine':3},{'@id':'action','@type':'ActionUsage',declaredName:'work','sysx:sourceLine':4},{'@id':'exhibit','@type':'ExhibitStateUsage',subsets:{'@id':'state'},'sysx:sourceLine':5},{'@id':'state','@type':'StateUsage',declaredName:'operate','sysx:sourceLine':6}]);
 assert.equal(focusedEdgeAppearance({kind:'typing',semanticSource:'usage',semanticTarget:'definition'},{graph:g,viewKind:'mixed'}).targetMarker,'definition-two-dot');
 assert.equal(focusedEdgeAppearance({kind:'reference',semanticSource:'perform',semanticTarget:'action'},{graph:g,viewKind:'mixed'}).label,'«perform»');
 assert.equal(focusedEdgeAppearance({kind:'reference',semanticSource:'exhibit',semanticTarget:'state'},{graph:g,viewKind:'mixed'}).label,'«exhibit»');
 assert.equal(focusedEdgeAppearance({kind:'reference',semanticSource:'perform',semanticTarget:'state'},{graph:g,viewKind:'mixed'}).supported,false);
});

test('anonymous declaration identities are retained in provenance instead of appearing as modeled names',()=>{
 const g=modelGraph([{'@id':'owner','@type':'PartDefinition',declaredName:'Device','sysx:sourceLine':1},{'@id':'assertion','@type':'AssertConstraintUsage',qualifiedName:'Model::Device::@7',owner:{'@id':'owner'},'sysx:sourceLine':2},{'@id':'short','@type':'RequirementUsage',declaredShortName:'R-9','sysx:sourceLine':3}]);
 const d=focusedNodeDescriptor(node('assertion','constraint'),g);assert.equal(d.name,'');assert.ok(!focusedFace(document,{...node('assertion'),focusedDescriptor:d},g).textContent.includes('@7'));
 const owner=focusedNodeDescriptor(node('owner'),g),entry=owner.compartments.flatMap(c=>c.entries??[]).find(e=>e.semanticId==='assertion');assert.equal(entry.text,'…');assert.ok(owner.notices.some(n=>n.target==='assertion'&&n.message.includes('anonymous')));
 assert.equal(focusedNodeDescriptor(node('short','requirement'),g).name,'<R-9>');
});

test('actual native enumeration, calculation parameters and ordered declarations use available structured roles',{skip:!existsSync(binary)&&'Build native semantic engine first',timeout:30000},async()=>{
 const client=nativeClient();try{
  const content=`package MoreNotation {
   enum def Mode { stopped; running; }
   calc def Offset { in input : ScalarValues::Real; return output : ScalarValues::Real = input + 1; }
   part def Device { attribute samples : ScalarValues::Real [3] ordered nonunique; constant attribute limit : ScalarValues::Real = 4; }
  }`;
  const parsed=await client.call('ParseSources',{documents:[{name:'more-notation.sysml',content}]});assert.ok(!parsed.diagnostics?.some(d=>String(d.severity).toLowerCase()==='error'),JSON.stringify(parsed.diagnostics));
  const exported=await client.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),g=modelGraph(exported.elements),id=name=>g.elements.find(e=>e.qualifiedName==='MoreNotation::'+name)?.id;
  const enumeration=focusedNodeDescriptor({id:'enum',semanticId:id('Mode'),kind:'enum'},g),calculation=focusedNodeDescriptor({id:'calc',semanticId:id('Offset'),kind:'calc'},g),device=focusedNodeDescriptor({id:'part',semanticId:id('Device'),kind:'part'},g);
  assert.equal(enumeration.keyword,'enum def');assert.deepEqual(new Set(enumeration.compartments.find(c=>c.title==='enums').entries.map(e=>e.text)),new Set(['stopped','running']));
  assert.equal(calculation.keyword,'calc def');const parameters=calculation.compartments.find(c=>c.title==='parameters');assert.ok(parameters.entries.some(e=>e.text.startsWith('in input')));assert.ok(parameters.entries.some(e=>e.text.startsWith('out output')));
  const entries=device.compartments.flatMap(c=>c.entries??[]);assert.ok(entries.some(e=>e.text.includes('samples')&&e.text.includes('ordered nonunique')));assert.ok(entries.some(e=>e.text.startsWith('constant limit')));
 }finally{client.close();}
});


test('actual native notation facts render derivation, directed flow pins and structured state behavior without source reconstruction',{skip:!existsSync(binary)&&'Build native semantic engine with notation facts first',timeout:30000},async()=>{
 const client=nativeClient();try{
  const content=`package NativeNotationFixture {
   private import StandardViewDefinitions::*;
   private import RequirementDerivation::*;
   private import ModelingMetadata::*;
   requirement sourceRequirement;
   requirement detailedRequirement;
   #derivation connection derivedFrom { end #original basis ::> sourceRequirement; end #derive detail ::> detailedRequirement; }
   #refinement dependency refine from detailedRequirement to sourceRequirement;
   view requirements : GeneralView { filter @SysML::RequirementUsage; expose sourceRequirement; expose detailedRequirement; }
   item def Value;
   action def Source { out value : Value; }
   action def Sink { in value : Value; }
   action def Pipe { action source : Source; then action sink : Sink; flow source.value to sink.value; }
   view pipeline : ActionFlowView { expose Pipe; }
   state def Machine {
    entry; then Active;
    state Active { entry action initialize; do action monitor; exit action stop; }
   }
   view states : StateTransitionView { expose Machine; }
  }`;
  const parsed=await client.call('ParseSources',{documents:[{name:'native-notation-facts.sysml',content}]});assert.ok(!parsed.diagnostics?.some(d=>String(d.severity).toLowerCase()==='error'),JSON.stringify(parsed.diagnostics));
  const exported=await client.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),g=modelGraph(exported.elements),request=view=>client.call('RenderView',{modelHash:parsed.modelHash,view:'NativeNotationFixture::'+view,includeSemanticIdentity:true,show:['parameter-symbols','port-symbols','typings','edge-labels']});
  const requirements=await request('requirements'),derive=requirements.edges.find(e=>e.kind==='derive');assert.ok(derive?.notation,'Native engine must supply additive derivation role facts');assert.deepEqual([derive.notation.sourceRole,derive.notation.targetRole],['derived','original']);
  const connection=focusedEdgeAppearance(derive,{graph:g,view:requirements,viewKind:requirements.kind});assert.equal(connection.supported,true);assert.equal(connection.targetMarker,'none');assert.equal(connection.label,'derivedFrom');assert.deepEqual(connection.endLabels.map(e=>e.text),['detail','basis']);
  const pipeline=await request('pipeline'),flow=pipeline.edges.find(e=>e.kind==='flow');assert.ok(flow?.notation);assert.ok(flow.fromPort);assert.ok(flow.toPort);assert.ok(pipeline.nodes.flatMap(n=>n.ports??[]).every(port=>port.parameter===true&&port.semanticId&&port.identityStatus==='mapped'));
  const profile=focusedEdgeAppearance(flow,{graph:g,view:pipeline,viewKind:pipeline.kind});assert.equal(profile.supported,true);assert.equal(profile.line,'solid');assert.equal(profile.targetMarker,'filled-arrow');
  const states=await request('states'),state=states.nodes.find(n=>n.state?.behaviors?.length===3);assert.ok(state,'native state roles must survive the wire');
  const before=structuredClone(state),descriptor=focusedNodeDescriptor(state,g,{expanded:false});assert.deepEqual(descriptor.compartments.map(c=>c.title),['entry','do','exit']);assert.ok(descriptor.compartments.every(c=>c.entries.every(e=>e.semanticId&&e.identityStatus==='mapped')));assert.deepEqual(state,before);
 }finally{client.close();}
});


test('native rendered type labels are authoritative while synthesized graph UUID type fallbacks remain omitted',()=>{
 const typeId='9cd0e404-9217-4c4f-9a45-3aef2ce5ee9d',g=modelGraph([{'@id':'owner','@type':'PartDefinition',declaredName:'Hull','sysx:sourceLine':1},{'@id':'mass','@type':'AttributeUsage',declaredName:'mass',type:[{'@id':typeId}],owner:{'@id':'owner'},'sysx:sourceLine':2}]);
 const raw={id:'native-mass',semanticId:'mass',identityStatus:'mapped',kind:'attribute',type:'MassValue'},native=focusedNodeDescriptor(raw,g),synthetic=focusedNodeDescriptor({id:'gv:mass',semanticId:'mass',kind:'attribute',type:typeId},g);
 assert.equal(native.type,'MassValue');assert.equal(native.typeLabelAuthority,'native-view');assert.deepEqual(native.typeIds,[typeId]);assert.ok(native.notices.some(n=>n.typeId===typeId&&n.reason==='focused-native-type-label'));
 assert.equal(synthetic.type,'');assert.ok(synthetic.notices.some(n=>n.typeId===typeId&&n.reason==='focused-type-unavailable'));
 const face=focusedFace(document,{...raw,focusedDescriptor:native},g);assert.equal(face.querySelector('.focused-name').textContent,'mass : MassValue');assert.ok(!face.textContent.includes(typeId));
 const view={kind:'definition',nodes:[raw]},owner=focusedNodeDescriptor({id:'owner',semanticId:'owner',kind:'part def'},g,{view}),entry=owner.compartments.flatMap(c=>c.entries??[]).find(e=>e.semanticId==='mass');assert.equal(entry.text,'mass : MassValue');assert.equal(entry.typeLabelAuthority,'native-view');
 const graphView={kind:'definition',nodes:[{...raw,identityStatus:undefined,type:typeId}]},unresolved=focusedNodeDescriptor({id:'owner',semanticId:'owner',kind:'part def'},g,{view:graphView});assert.equal(unresolved.compartments.flatMap(c=>c.entries??[]).find(e=>e.semanticId==='mass').text,'mass');
 const portView={kind:'action',nodes:[{id:'frame',ports:[{id:'pin',semanticId:'mass',identityStatus:'mapped',type:'MassValue'}]}]},pinOwner=focusedNodeDescriptor({id:'owner',semanticId:'owner',kind:'part def'},g,{view:portView});assert.equal(pinOwner.compartments.flatMap(c=>c.entries??[]).find(e=>e.semanticId==='mass').text,'mass : MassValue');
});


test('metadata with an actual named native definition uses its official note base and never invents missing argument values',()=>{
 const g=modelGraph([{'@id':'type','@type':'MetadataDefinition',declaredName:'Equipment','sysx:sourceLine':1},{'@id':'tag','@type':'MetadataUsage',declaredName:'allocationStatus',type:[{'@id':'type'}],ownedMember:[{'@id':'value'}],'sysx:sourceLine':2}]),descriptor=focusedNodeDescriptor(node('tag','metadata'),g),face=focusedFace(document,{...node('tag'),focusedDescriptor:descriptor},g);
 assert.equal(descriptor.supported,true);assert.equal(descriptor.keyword,'metadata');assert.equal(descriptor.shape,'note');assert.equal(descriptor.name,'Equipment');assert.equal(descriptor.metadataUsageName,'allocationStatus');assert.equal(descriptor.type,'');assert.ok(face.querySelector('.focused-note-frame path'));assert.match(face.textContent,/Metadata body omitted/);assert.ok(descriptor.notices.some(n=>n.reason==='focused-metadata-body'&&n.omittedIds.includes('value')));
 const missing=modelGraph([{'@id':'tag','@type':'MetadataUsage',declaredName:'status',type:[{'@id':'unknown'}],'sysx:sourceLine':1}]);assert.equal(focusedNodeDescriptor(node('tag','metadata'),missing).supported,false);
});
