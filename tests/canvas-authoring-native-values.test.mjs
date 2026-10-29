import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync} from 'node:fs';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {documentsFor} from '../src/canvas-prototype/project.mjs';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {NARRATIVE_SCHEMA,resolveNarrative,formatNativeValue} from '../src/canvas-prototype/authoring.mjs';
function nativeClient(binary){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)break;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)break;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
 for(const event of ['error','exit'])child.on(event,error=>{for(const job of pending.values())job.reject(Error(String(error)));pending.clear();});
 return {call(method,params={}){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
const binary=resolve(process.env.SYSPRESENT_NATIVE_ENGINE??'build/canvas-prototype/engine/sysml-native');
const narrative=bindings=>({schemaVersion:NARRATIVE_SCHEMA,template:bindings.map(binding=>'{{'+binding.name+'}}').join(' | '),bindings});
test('native quantities, big integers, enum identity and unknown/collection results keep their typed meaning',()=>{
 assert.equal(formatNativeValue({type:'Length',value:{quantity:{rationalMagnitude:{numerator:'6',denominator:'5'},unit:'m'}}},{unit:'m',type:'Length',decimals:2}),'1.20 m');
 assert.equal(formatNativeValue({type:'Integer',value:{bigIntValue:'18446744073709551616'}}),'18446744073709551616');
 assert.equal(formatNativeValue({type:'Evidence',value:{enumLiteral:{enumerationId:'Evidence',literalId:'Evidence::unknown',name:'unknown'}}}),'Evidence::unknown');
 assert.throws(()=>formatNativeValue({value:{quantity:{intMagnitude:'1',unit:'m'}}},{unit:'ft'}),/Unit conversion/);
 assert.throws(()=>formatNativeValue({value:{undetermined:{reason:'input not supplied'}}}),/undetermined.*input not supplied/);
 assert.throws(()=>formatNativeValue({value:{unset:true}}),/unset/);
 for(const value of [{sequence:{}},{sequence:{elements:[{intValue:'1'}]}},{enumLiteral:{name:'guessed label'}}])assert.throws(()=>formatNativeValue({value}));
});
test('attribute fallback evaluates only a known quoted attribute in its native selected context and preserves errors',async()=>{
 const graph={elements:[{id:'known',qualifiedName:'System::known',kind:'PartUsage'}]},calls=[];
 const engine={call:async(method,params)=>{calls.push({method,params});return method==='GetSymbol'?{symbol:{id:'System::known',attributes:[{name:'alias',type:'ScalarValues::Real'}]}}:{result:{rationalValue:{numerator:'6',denominator:'5'}}};}};
 const record=narrative([{name:'a',symbol:'known',attribute:'alias',type:'ScalarValues::Real',decimals:2},{name:'b',symbol:'known',attribute:'alias',decimals:1}]),result=await resolveNarrative(record,{graph,engine,modelHash:'current'});
 assert.equal(result.markdown,'1.20 | 1.2');assert.deepEqual(calls.map(call=>call.method),['GetSymbol','Evaluate']);assert.deepEqual(calls[1].params,{modelHash:'current',expression:"'alias'",contextSymbolId:'System::known',subjectSymbolId:'System::known'});assert.equal(result.values[0].authority,'native:Evaluate');assert.equal(result.values[0].evaluation.result.rationalValue.numerator,'6');
 calls.length=0;await assert.rejects(resolveNarrative(narrative([{name:'a',symbol:'known',attribute:'alias + invented'}]),{graph,engine,modelHash:'current'}),/Unavailable native constant attribute/);assert.deepEqual(calls.map(call=>call.method),['GetSymbol']);
 engine.call=async method=>method==='GetSymbol'?{symbol:{attributes:[{name:'alias',type:'Real'}]}}:{error:'required input has no value'};await assert.rejects(resolveNarrative(narrative([{name:'a',symbol:'known',attribute:'alias'}]),{graph,engine,modelHash:'current'}),/required input has no value/);
});
test('actual native fixture preserves inherited defaults and resolves aliases, quantities and enums without guessed inputs',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const content=await readFile(resolve('tests/fixtures/attribute-interpolation.sysml'),'utf8'),parsed=await engine.call('ParseSources',{documents:[{name:'values.sysml',content}]});assert.deepEqual(parsed.diagnostics??[],[]);
  const info=await engine.call('GetServerInfo');assert.ok(info.capabilities.includes('evaluate_subject'));
  const exported=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),graph=modelGraph(exported.elements),symbol='AttributeInterpolation::linked',staticSymbol=await engine.call('GetSymbol',{modelHash:parsed.modelHash,symbolId:symbol});
  assert.equal(staticSymbol.symbol.attributes.find(attribute=>attribute.name==='identifier').value,undefined);
  const source=await engine.call('GetSymbol',{modelHash:parsed.modelHash,symbolId:'AttributeInterpolation::source'});assert.deepEqual(source.symbol.attributes.find(attribute=>attribute.name==='huge').value,{bigIntValue:'18446744073709551616'});
  const bindings=[{name:'label',symbol,attribute:'identifier'},{name:'distance',symbol,attribute:'distance',unit:'m',decimals:2},{name:'battery',symbol,attribute:'batteryWhKg',unit:''},{name:'doubled',symbol,attribute:'doubled'},{name:'state',symbol,attribute:'state'},{name:'huge',symbol,attribute:'huge'},{name:'zero',symbol,attribute:'count'},{name:'false',symbol,attribute:'enabled'},{name:'inherited',symbol,attribute:'defaultLabel'}];
  const result=await resolveNarrative(narrative(bindings),{engine,modelHash:parsed.modelHash,graph});
  assert.equal(result.markdown,'IC-fixture | 1.20 m | 140 | 280 | AttributeInterpolation::Evidence::unknown | 18446744073709551616 | 0 | false | inherited default');
  assert.equal(result.values[0].authority,'native:Evaluate');assert.equal(result.values[1].unit,'m');assert.equal(result.values[1].evaluation.request.subjectSymbolId,symbol);assert.ok(result.values[4].value.enumLiteral.literalId);assert.equal(result.values[6].authority,'native:GetSymbol');assert.equal(result.values[7].value.boolValue,false);
  const changed=await engine.call('ParseSources',{documents:[{name:'values.sysml',content:content.replace('batteryWhKg : Real = 140','batteryWhKg : Real = 160')}]});
  const changedExport=await engine.call('ExportModel',{modelHash:changed.modelHash,projection:'declarations'}),changedValue=await resolveNarrative(narrative([{name:'v',symbol,attribute:'batteryWhKg'}]),{engine,modelHash:changed.modelHash,graph:modelGraph(changedExport.elements)});assert.equal(changedValue.markdown,'160');assert.equal(changedValue.values[0].evaluation.request.modelHash,changed.modelHash);
  for(const attribute of ['unsetInput','dependent','emptyOptional','sequenceValues'])await assert.rejects(resolveNarrative(narrative([{name:'v',symbol,attribute}]),{engine,modelHash:parsed.modelHash,graph}),/unset|undetermined|evaluation failed|scalar/);
  await assert.rejects(resolveNarrative(narrative([{name:'v',symbol,attribute:'distance',unit:'ft'}]),{engine,modelHash:parsed.modelHash,graph}),/Unit conversion/);
 }finally{engine.close();}
});
test('current Blue Dog and Gorge native bindings recover selected stored expressions and keep missing/collection values explicit',{skip:!existsSync(binary)},async()=>{
 const engine=nativeClient(binary);
 try{
  const project=await readProjectDirectory(resolve('examples/canvas-blue-dog')),parsed=await engine.call('ParseSources',{documents:documentsFor(project)});assert.deepEqual(parsed.diagnostics??[],[]);
  const exported=await engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}),graph=modelGraph(exported.elements);
  const bindings=[{name:'length',symbol:'GorgeChallenge',attribute:'maximumOverallLength',unit:'m',decimals:1},{name:'identifier',symbol:'BlueDog::Configurations::IC01::integration',attribute:'identifier'},{name:'batteryDensity',symbol:'BlueDog::Configurations::IC01::integration',attribute:'batteryWhKg',unit:''},{name:'mainBattery',symbol:'BlueDog::Architecture::Physical::IC01Candidate::mainBattery',attribute:'nameplateWh',unit:''},{name:'recoveryBattery',symbol:'BlueDog::Architecture::Physical::IC01Candidate::recoveryBattery',attribute:'nameplateWh',unit:''},{name:'state',symbol:'BlueDog::Decisions::Design::sizingBaseline',attribute:'recordState'}];
  const result=await resolveNarrative(narrative(bindings),{engine,modelHash:parsed.modelHash,graph});assert.equal(result.markdown,'1.2 m | IC-01 | 140 | 1300 | 60 | EngineeringDecisions::RecordState::workingDisposition');assert.equal(result.values[0].authority,'native:GetSymbol');assert.ok(result.values.slice(1).every(value=>value.authority==='native:Evaluate'));assert.equal(result.values[2].unit,'');
  const gate=await engine.call('RenderView',{modelHash:parsed.modelHash,view:'#action:BlueDog::Behavior::Contracts::SailingActuationGate',includeSemanticIdentity:true,show:['parameter-symbols','port-symbols','typings','edge-labels']}),pins=gate.nodes.flatMap(node=>node.ports??[]);
  assert.equal(pins.length,10,'Sailing actuation has nine actual input parameters and one output parameter');assert.equal(pins.filter(pin=>pin.direction==='in').length,9);assert.equal(pins.filter(pin=>pin.direction==='out').length,1);assert.ok(pins.every(pin=>pin.parameter===true&&pin.semanticId&&pin.identityStatus==='mapped'));assert.ok(pins.some(pin=>pin.name==='actuate'&&pin.direction==='out'));
  for(const [symbol,attribute]of [['GorgeChallenge::OverallLength','measuredOverallLength'],['BlueDog::Mission::Course::MarkerGate','nearOffsetM'],['BlueDog::Mission::Course::policy','gateNames'],['BlueDog::Decisions::Design::sizingBaseline','accepted']])await assert.rejects(resolveNarrative(narrative([{name:'v',symbol,attribute}]),{engine,modelHash:parsed.modelHash,graph}),/unset|undetermined|scalar/);
 }finally{engine.close();}
});
