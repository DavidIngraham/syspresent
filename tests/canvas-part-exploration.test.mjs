import test from 'node:test';
import assert from 'node:assert/strict';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {traceContext,structuralActions} from '../src/canvas-prototype/exploration.mjs';
const element=(id,kind='PartDefinition',extra={})=>({id,kind,name:id,qualifiedName:'Model::'+id,layer:'project',...extra});
const edge=(id,source,target,kind,extra={})=>({id,source,target,kind,authority:'native-api',...extra});
const own=(id,source,target)=>edge(id,source,target,'containment',{nativeRole:'owner',navigationOnly:true});
const ids=result=>result.elements.map(e=>e.id);
const fixture=()=>({elements:[element('part','PartUsage'),element('definition'),element('base'),element('other','PartUsage'),element('derived'),element('derivedUsage','PartUsage'),element('direct','RequirementUsage'),element('inherited','RequirementUsage'),element('declared','RequirementUsage'),element('template','RequirementDefinition'),element('unrelated','RequirementUsage')],
 relationships:[edge('type','part','definition','typing'),edge('inherit','definition','base','specialization'),edge('usage','other','definition','typing'),edge('derived','derived','definition','specialization'),edge('derivedUsage','derivedUsage','derived','typing'),edge('direct','part','direct','satisfy'),edge('inherited','base','inherited','satisfaction')],
 containment:[own('declared','definition','declared'),own('template','definition','template')]});

test('effective requirement projection collapses ancestry without inventing direct satisfaction',()=>{
 const g=fixture(),result=traceContext(g,{focus:'part',mode:'effective',budget:7});
 assert.deepEqual(ids(result),['part','declared','direct','inherited']);
 assert.deepEqual(result.relationships,[g.relationships[5]]);
 assert.deepEqual(result.collapsedContext,['base','definition']);
 assert.equal(result.paths.find(p=>p.target==='inherited').kind,'satisfaction');
 assert.deepEqual(result.paths.find(p=>p.target==='inherited').relationships,g.relationships.filter(e=>['type','inherit','inherited'].includes(e.id)));
 assert.deepEqual(result.paths.find(p=>p.target==='declared').elementIds,['part','definition','declared']);
 assert.equal(result.paths.find(p=>p.target==='declared').kind,'declared-requirement');
 assert.ok(!ids(result).includes('template'),'owned requirement definitions are templates, not imposed usage obligations');
 assert.ok(!ids(result).includes('other'));assert.ok(!ids(result).includes('unrelated'));
 assert.match(result.summary.message,/not drawn as new relationships/);assert.match(result.summary.message,/not executed verification/);
});

test('global impact exposes native inheritance, specializing definitions and typed usages with original direction',()=>{
 const g=fixture(),result=traceContext(g,{focus:'definition',mode:'global-impact',budget:24});
 assert.deepEqual(new Set(ids(result)),new Set(['definition','base','other','part','derived','derivedUsage','declared','inherited']));
 for(const native of g.relationships.filter(e=>e.id!=='direct'))assert.ok(result.relationships.some(e=>e.id===native.id&&e.source===native.source&&e.target===native.target&&e.kind===native.kind));
 assert.match(result.summary.message,/not runtime instances/);
 assert.deepEqual(result.collapsedContext,[]);
});

test('scope stops inherited context and exposes outside scope distinctly from missing native targets',()=>{
 const g=fixture();g.relationships.push(edge('missing','definition','missing','specialization'));
 const result=traceContext(g,{focus:'part',mode:'effective',scopeIds:['part','definition','declared','direct']});
 assert.deepEqual(result.targets,['declared','direct']);
 assert.ok(result.omissions.some(o=>o.relationshipId==='inherit'&&o.reason==='outside-scope'));
 assert.ok(result.omissions.some(o=>o.relationshipId==='missing'&&o.reason==='unavailable'));
 assert.equal(result.summary.unavailable,1);assert.equal(result.summary.filtered,1);
 assert.ok(!result.paths.some(p=>p.target==='inherited'));
});

test('paths preserve parallel native satisfaction identities and input/returned state is isolated',()=>{
 const g=fixture();g.relationships.push(edge('parallel','base','inherited','satisfy'));
 const before=structuredClone(g),result=traceContext(g,{focus:'part',mode:'effective'});
 assert.equal(result.paths.filter(p=>p.target==='inherited').length,2);
 result.paths[0].relationships[0].kind='changed';result.elements[0].name='changed';assert.deepEqual(g,before);
});

test('effective and impact paging remain bounded, deterministic and disclose budget exclusions',()=>{
 const g=fixture();for(let i=0;i<9;i++){g.elements.push(element('req'+i,'RequirementUsage'));g.relationships.push(edge('req'+i,'base','req'+i,'satisfy'));}
 for(const mode of ['effective','global-impact']){
  const first=traceContext(g,{focus:'part',mode,budget:3}),second=traceContext(g,{focus:'part',mode,budget:3,page:1});
  assert.equal(first.elements.length,3);assert.equal(second.elements.length,3);assert.ok(first.pages>2);assert.ok(first.omissions.some(o=>o.reason==='budget'));
  assert.deepEqual(traceContext({...g,elements:[...g.elements].reverse(),relationships:[...g.relationships].reverse(),containment:[...g.containment].reverse()},{focus:'part',mode,budget:3}),first);
 }
});

test('cycles and wrong native type categories cannot create requirement ancestry shortcuts',()=>{
 const g=fixture();g.relationships.push(edge('cycle','base','definition','specialization'),edge('bad','definition','unrelated','specialization'),edge('siblingReq','other','unrelated','satisfy'));
 const result=traceContext(g,{focus:'part',mode:'effective'});assert.equal(result.total,3);assert.ok(!result.targets.includes('unrelated'));assert.ok(result.omissions.some(o=>o.relationshipId==='bad'&&o.reason==='typing-boundary'));
 const filtered=traceContext(g,{focus:'part',mode:'effective',relationshipKinds:['satisfy']});assert.deepEqual(filtered.targets,['direct']);assert.ok(filtered.omissions.some(o=>o.reason==='relationship-filter'));
});

test('local understanding retains existing direct structural policy and empty effective requirements remain explicit',()=>{
 const g=fixture(),local=traceContext(g,{focus:'part',mode:'local-understanding'}),context=traceContext(g,{focus:'part'});
 assert.deepEqual(local.elements,context.elements);assert.deepEqual(local.relationships,context.relationships);assert.match(local.summary.message,/Local understanding/);
 const empty=traceContext({elements:[element('part','PartUsage')],relationships:[]},{focus:'part',mode:'effective'});assert.deepEqual(ids(empty),['part']);assert.equal(empty.summary.status,'no-known-links');assert.match(empty.summary.message,/does not prove/);
 assert.ok(structuralActions({elements:[element('part','PartUsage')],relationships:[]},'part').find(a=>a.mode==='effective').enabled);
 assert.throws(()=>traceContext(g,{focus:'part',mode:'effective',budget:0}),/budget/);assert.throws(()=>traceContext(g,{focus:'part',mode:'global-impact',page:-1}),/page/);
});

 test('native specializes role alone establishes directed inheritance and retains relationship provenance',()=>{
 const raw=[{'@id':'base','@type':'PartDefinition',declaredName:'base','sysx:sourceLine':1},{'@id':'derived','@type':'PartDefinition',declaredName:'derived','sysx:sourceLine':2,specializes:{'@id':'base'},ownedSubclassification:[{'@id':'native-subclassification'}]},{'@id':'fake','@type':'PartDefinition',declaredName:'base derived','sysx:sourceLine':3}];
 const g=modelGraph(raw);assert.deepEqual(g.relationships,[{id:'specialization:derived:base',source:'derived',target:'base',kind:'specialization',label:'specialization',authority:'native-api',nativeRelationship:'native-subclassification'}]);
 });
