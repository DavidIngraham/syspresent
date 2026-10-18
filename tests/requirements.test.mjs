import test from 'node:test';
import assert from 'node:assert/strict';
import {requirementReading,requirementFamily,loadRequirementReading} from '../src/requirements.mjs';
const e=(id,kind,description='')=>({id,name:id,kind,description});
const link=(source,target,kind)=>({id:source+target+kind,source,target,kind,authority:'native-render-view'});
function fixture(){return {elements:[e('r','RequirementDefinition','Parent shall...'),e('u','RequirementUsage'),e('otherUse','RequirementUsage'),e('d','RequirementUsage'),e('dd','RequirementDefinition','Detailed shall...'),e('boat','PartUsage'),e('test','VerificationCaseDefinition','Measure performance'),e('parent','RequirementUsage')],relationships:[{...link('u','r','type'),authority:'native-api-property'},{...link('otherUse','r','type'),authority:'native-api-property'},{...link('d','dd','type'),authority:'native-api-property'},link('u','parent','derive'),link('d','u','derive'),link('boat','d','satisfy'),link('test','u','verify'),link('test','d','verify')]};}
test('five questions preserve typing, derivation direction, direct and indirect paths',()=>{
 const b=fixture(),r=requirementReading(b,'r');
 assert.deepEqual(new Set(r.family),new Set(['r','u','otherUse']));
 assert.deepEqual(requirementFamily(b,'u'),['u','r']);
 assert.equal(r.statements[0].description,'Parent shall...');
 assert.equal(r.groups.sources[0].id,'parent');
 assert.equal(r.groups.derived[0].id,'d');
 assert.equal(r.groups.affected[0].id,'boat');assert.equal(r.groups.affected[0].via,'d');
 assert.equal(r.groups.verification.length,1);assert.equal(r.groups.verification[0].via,null);
 assert.deepEqual(r.groups.verification[0].paths.map(p=>p.via),[null,'d']);
 assert.equal(r.groups.affected[0].edge.target,'d');
});
test('duplicate drawings deduplicate; budget and unavailable targets stay explicit',()=>{
 const b=fixture();b.relationships.push({...b.relationships.at(-1),id:'anotherDrawing'},link('missing','u','verify'));
 const r=requirementReading(b,'r',1);assert.equal(r.groups.verification.length,2);
 assert.equal(r.visible.verification.length,1);assert.equal(r.omitted.verification,1);
 assert.equal(r.groups.verification.find(r=>r.id==='missing').available,false);
 assert.equal(r.groups.affected[0].edge.verdict,undefined);
});
test('owned rationale is read as annotation; absent prose and tests are not invented',()=>{
 const b=fixture();b.elements[0].readingRecords=[{name:'rationale',kind:'comment',text:'Why it matters'}];
 const r=requirementReading(b,'r');assert.equal(r.rationale[0].text,'Why it matters');assert.equal(r.notes.length,0);
 const absent=requirementReading({elements:[e('r','RequirementDefinition')],relationships:[]},'r');
 assert.equal(absent.statements.length,0);assert.equal(absent.groups.verification.length,0);
});
test('lazy reading fetches family and linked classifier records; failed loads propagate',async()=>{
 const b=fixture(),calls=[];const store={ensureNeighborhood:async ids=>{calls.push(ids);return {unavailable:[]};}};
 await loadRequirementReading(store,b,'r');assert.ok(calls.some(ids=>ids.includes('dd')));assert.ok(calls.some(ids=>ids.includes('boat')));
 await assert.rejects(loadRequirementReading({ensureNeighborhood:async()=>({unavailable:['u']})},b,'r'),/context unavailable/);
});


test('indirect case discovered during lazy loading is fetched with its results',async()=>{
 const b={elements:[e('r','RequirementUsage'),e('d','RequirementUsage')],relationships:[link('d','r','derive')]};
 const calls=[];const store={ensureNeighborhood:async ids=>{
  calls.push(ids);
  if(ids.includes('d')&&!b.elements.some(e=>e.id==='case')){
   b.elements.push({id:'case',kind:'VerificationCaseDefinition',neighborhoodLoaded:false});
   b.relationships.push(link('case','d','verify'));
  }
  if(ids.includes('case'))b.elements[b.elements.findIndex(e=>e.id==='case')]={...e('case','VerificationCaseDefinition','Measure the installed response'),readingRecords:[{recordType:'declared-result',kind:'reference',name:'verdict',value:'inconclusive'}]};
  return {unavailable:[]};
 }};
 const reading=await loadRequirementReading(store,b,'r');
 assert.ok(calls.some(ids=>ids.includes('case')));
 assert.equal(reading.visible.verification[0].element.description,'Measure the installed response');
 assert.equal(reading.visible.verification[0].element.readingRecords[0].value,'inconclusive');
});


test('upstream derivation rationale is included without importing downstream rationale',()=>{
 const b=fixture();b.elements.push({...e('upstreamLink','ConnectionUsage'),readingRecords:[{kind:'comment',name:'rationale',text:'Parent obligation needs this behavior'}]},{...e('downstreamLink','ConnectionUsage'),readingRecords:[{kind:'comment',name:'rationale',text:'This child needs a tighter deadline'}]});
 b.relationships.find(e=>e.source==='u'&&e.kind==='derive').nativeRelationship='upstreamLink';
 b.relationships.find(e=>e.source==='d'&&e.kind==='derive').nativeRelationship='downstreamLink';
 const r=requirementReading(b,'r');assert.equal(r.rationale.length,1);assert.equal(r.rationale[0].owner,'upstreamLink');
 assert.equal(r.rationale[0].onRelationship,true);
});


test('known exported targets load from search catalog; indirect paths stay within derived limit',async()=>{
 const b={elements:[e('r','RequirementUsage'),e('d1','RequirementUsage'),e('d2','RequirementUsage')],searchIndex:[{...e('case','VerificationCaseDefinition'),exported:true}],relationships:[link('d1','r','derive'),link('d2','r','derive'),link('case','d1','verify'),link('case2','d2','verify')]};
 const calls=[];const store={ensureNeighborhood:async ids=>{calls.push(ids);if(ids.includes('case'))b.elements.push(e('case','VerificationCaseDefinition','Measured response'));return {unavailable:[]};}};
 const r=await loadRequirementReading(store,b,'r',1);
 assert.ok(calls.some(ids=>ids.includes('case')));assert.equal(r.visible.verification[0].element.description,'Measured response');
 assert.equal(r.groups.verification.some(r=>r.id==='case2'),false);assert.equal(r.omitted.derived,1);
});


test('minimum context still loads a linked usage statement from its classifier',async()=>{
 const b=fixture(),calls=[];
 await loadRequirementReading({ensureNeighborhood:async ids=>{calls.push(ids);return {unavailable:[]};}},b,'u',1);
 assert.ok(calls.some(ids=>ids.includes('dd')));
});
