import test from 'node:test';
import assert from 'node:assert/strict';
import {requirementActions,structuralActions,traceContext} from '../src/canvas-prototype/exploration.mjs';
const element=(id,kind='RequirementUsage',extra={})=>({id,kind,name:id,layer:'project',native:{declaredName:extra.name??id},description:'Native documentation for '+id,...extra});
const edge=(id,source,target,kind,extra={})=>({id,source,target,kind,label:'Native label '+id,authority:'native-api',...extra});
const graph=(elements,relationships)=>({elements,relationships});
const action=(g,id,mode)=>requirementActions(g,id).find(a=>a.mode===mode);
const ids=result=>result.elements.map(e=>e.id);
const fixture=()=>graph([
 element('req'),element('origin','RequirementDefinition'),element('child'),element('part','PartUsage'),element('case','VerificationCaseUsage'),element('allocation','ActionUsage'),element('constraint','ConstraintUsage'),element('dependency')
],[edge('origin-link','req','origin','derive'),edge('child-link','child','req','derivation'),edge('satisfaction','part','req','satisfaction'),edge('verification','case','req','verification'),edge('allocated','req','allocation','allocate'),edge('constraint','constraint','req','dependency'),edge('not-origin','req','dependency','dependency')]);

test('requirement actions expose directed native traces without inferring origins from dependency',()=>{
 const g=fixture();
 assert.deepEqual(requirementActions(g,'req').map(a=>[a.mode,a.count,a.enabled]),[['origins',1,true],['derived',1,true],['impact',2,true],['verification',1,true],['context',7,true]]);
 assert.deepEqual(ids(traceContext(g,{focus:'req',mode:'origins'})),['req','origin']);
 assert.deepEqual(traceContext(g,{focus:'req',mode:'derived'}).relationships,[g.relationships[1]]);
 const impact=traceContext(g,{focus:'req',mode:'impact'});
 assert.deepEqual(impact.relationships.map(e=>[e.source,e.target,e.kind]),[['req','allocation','allocate'],['part','req','satisfaction']]);
 assert.ok(ids(traceContext(g,{focus:'req',budget:24})).includes('constraint'));
 assert.ok(!ids(traceContext(g,{focus:'req',mode:'origins'})).includes('dependency'));
});

test('all explicit aliases preserve original kinds and direction',()=>{
 const kinds=['derive','derivation','refine','refinement','satisfy','satisfaction','verify','verification','allocate','allocation'];
 const g=graph([element('r'),...kinds.map(k=>element(k))],kinds.map(k=>edge(k,['derive','derivation','refine','refinement'].includes(k)?'r':k,['derive','derivation','refine','refinement'].includes(k)?k:'r',k)));
 assert.equal(action(g,'r','origins').count,4);assert.equal(action(g,'r','impact').count,4);assert.equal(action(g,'r','verification').count,2);
 assert.deepEqual(traceContext(g,{focus:'r',mode:'verification'}).relationships,g.relationships.filter(e=>['verify','verification'].includes(e.kind)).sort((a,b)=>a.id.localeCompare(b.id)));
});

test('definition/usage typing bridges work in both directions without merging identities',()=>{
 for(const focus of ['usage','definition']){
  const other=focus==='usage'?'definition':'usage';
  const typing=edge('typing','usage','definition','typing'),verify=edge('verify','case',other,'verify');
  const g=graph([element('usage'),element('definition','RequirementDefinition'),element('case','VerificationCaseUsage')],[typing,verify]);
  const result=traceContext(g,{focus,mode:'verification',budget:3});
  assert.deepEqual(ids(result),[focus,'case',other]);assert.equal(result.elements.length,3);
  assert.deepEqual(result.relationships,[typing,verify]);assert.deepEqual(result.typingBridges,['typing']);
  assert.equal(action(g,focus,'verification').count,1);
  assert.match(result.summary.message,/not executed results/);
 }
});

test('typing bridges are not included unless needed by a selected neighbor',()=>{
 const g=graph([element('r'),element('d','RequirementDefinition'),element('a'),element('b')],[edge('t','r','d','typing'),edge('direct','a','r','derive'),edge('indirect','b','d','derive')]);
 const first=traceContext(g,{focus:'r',mode:'derived',budget:3});
 assert.deepEqual(ids(first),['r','a']);assert.deepEqual(first.typingBridges,[]);assert.equal(first.pages,2);
 const second=traceContext(g,{focus:'r',mode:'derived',budget:3,page:1});
 assert.deepEqual(ids(second),['r','b','d']);assert.deepEqual(second.relationships.map(e=>e.id),['indirect','t']);
});

test('pagination bounds active elements including shared typing bridges and counts unique targets',()=>{
 const g=graph([element('r'),element('d','RequirementDefinition'),...['a','b','c','e','f'].map(id=>element(id))],[edge('t','r','d','type'),...['a','b','c','e','f'].map(id=>edge(id,id,'d','derive')),edge('duplicate','a','d','refine')]);
 assert.equal(action(g,'r','derived').count,5);
 const p0=traceContext(g,{focus:'r',mode:'derived',budget:4}),p1=traceContext(g,{focus:'r',mode:'derived',budget:4,page:1}),p2=traceContext(g,{focus:'r',mode:'derived',budget:4,page:2});
 assert.equal(p0.pages,3);assert.equal(p0.total,5);assert.deepEqual(p0.targets,['a','b']);assert.deepEqual(p1.targets,['c','e']);assert.deepEqual(p2.targets,['f']);
 for(const p of [p0,p1,p2])assert.ok(p.elements.length<=4);
 assert.equal(p0.omissions.filter(o=>o.reason==='budget').length,3);
 const reversed=graph([...g.elements].reverse(),[...g.relationships].reverse());
 assert.deepEqual(traceContext(reversed,{focus:'r',mode:'derived',budget:4}),p0);
 assert.equal(traceContext(g,{focus:'r',mode:'derived',budget:4,page:99}).page,2);
});

test('available, filtered, missing links and unavailable targets stay distinct',()=>{
 const empty=graph([element('r'),element('other')],[edge('dependency','r','other','dependency')]);
 assert.equal(traceContext(empty,{focus:'r',mode:'origins'}).summary.status,'no-known-links');
 const unavailable=traceContext(graph([element('r')],[edge('missing','r','absent','derive')]),{focus:'r',mode:'origins'});
 assert.equal(unavailable.summary.status,'unavailable');assert.equal(unavailable.summary.unavailable,1);assert.equal(unavailable.total,0);assert.deepEqual(unavailable.omissions,[{relationshipId:'missing',target:'absent',reason:'unavailable',anchor:'r'}]);
 const filtered=traceContext(graph([element('r'),element('meta','RequirementDefinition',{layer:'metamodel'})],[edge('meta','r','meta','derive')]),{focus:'r',mode:'origins'});
 assert.equal(filtered.summary.status,'filtered');assert.equal(filtered.omissions[0].reason,'metamodel-boundary');
 const elementFiltered=traceContext(fixture(),{focus:'req',mode:'impact',elementKinds:['RequirementUsage']});
 assert.equal(elementFiltered.summary.status,'filtered');assert.equal(elementFiltered.summary.filtered,2);
 const missing=traceContext(empty,{focus:'missing'});assert.equal(missing.summary.status,'missing-focus');assert.deepEqual(missing.elements,[]);
});

test('no metamodel, definition ancestry, second-hop requirement or document wormholes',()=>{
 const g=graph([element('r'),element('d','RequirementDefinition'),element('ancestor','RequirementDefinition'),element('a'),element('further'),element('doc','Documentation'),element('part','PartDefinition'),element('meta','RequirementDefinition',{metamodel:true})],[edge('t','r','d','typing'),edge('ancestry','d','ancestor','typing'),edge('a','a','d','derive'),edge('further','further','a','derive'),edge('bad','r','doc','dependency'),edge('part','r','part','typing'),edge('meta','r','meta','typing'),edge('meta-origin','meta','ancestor','derive')]);
 const result=traceContext(g,{focus:'r',mode:'derived',budget:24});assert.deepEqual(ids(result),['r','a','d']);assert.deepEqual(result.relationships.map(e=>e.id),['a','t']);
 assert.ok(!ids(traceContext(g,{focus:'r',budget:24})).includes('doc'));
 assert.ok(result.omissions.some(o=>o.reason==='typing-boundary'&&o.target==='part'));
});

test('generic context works for engineering components and non-requirement trace actions stay disabled',()=>{
 const g=graph([element('part','PartUsage'),element('constraint','ConstraintUsage'),element('r')],[edge('constraint','constraint','part','dependency'),edge('satisfy','part','r','satisfy')]);
 assert.deepEqual(ids(traceContext(g,{focus:'part',mode:'context'})),['part','r','constraint']);
 assert.ok(requirementActions(g,'part').filter(a=>a.mode!=='context').every(a=>!a.enabled));
 assert.equal(action(g,'part','context').count,2);
});

test('model input is immutable, returned data is isolated and native evidence is not fabricated',()=>{
 const g=fixture(),original=structuredClone(g),result=traceContext(g,{focus:'req',mode:'verification'});
 result.elements[0].description='changed';result.relationships[0].label='changed';
 assert.deepEqual(g,original);requirementActions(g,'req');assert.deepEqual(g,original);
 assert.equal('verdict' in result,false);assert.equal('executed' in result,false);
});

test('invalid options fail explicitly and effective budgets are bounded',()=>{
 const g=fixture();
 assert.throws(()=>traceContext(g,{focus:'req',budget:0}),/budget/);assert.throws(()=>traceContext(g,{focus:'req',budget:2.5}),/budget/);
 assert.throws(()=>traceContext(g,{focus:'req',page:-1}),/page/);assert.throws(()=>traceContext(g,{focus:'req',mode:'guessed'}),/mode/);
 assert.equal(traceContext(g,{focus:'req',budget:1}).budget,3);assert.equal(traceContext(g,{focus:'req',budget:100}).budget,24);
});


test('an explicitly focused package remains visible without opening ownership or metamodel plumbing',()=>{
 const g=graph([element('project','Package'),element('part','PartUsage'),element('owned','RequirementUsage'),element('meta','Package',{layer:'metamodel'})],[edge('engineering','project','part','dependency'),edge('owned','project','owned','owningMembership'),edge('meta','project','meta','typing')]);
 const result=traceContext(g,{focus:'project'});assert.deepEqual(ids(result),['project','part']);assert.deepEqual(result.relationships.map(e=>e.id),['engineering']);
 assert.ok(result.omissions.some(o=>o.relationshipId==='owned'&&o.reason==='relationship-policy'));
 const alone=traceContext(graph([element('project','Package')],[]),{focus:'project'});assert.deepEqual(ids(alone),['project']);assert.equal(alone.summary.status,'no-known-links');
});

test('different necessary bridge nodes consume separate page slots and direct parallel links do not add nodes',()=>{
 const g=graph([element('r','RequirementDefinition'),element('u1'),element('u2'),element('a','PartUsage'),element('b','PartUsage')],[edge('t1','u1','r','typing'),edge('t2','u2','r','typing'),edge('a','a','u1','satisfy'),edge('a2','a','u1','satisfaction'),edge('b','b','u2','satisfy')]);
 assert.equal(action(g,'r','impact').count,2);
 const first=traceContext(g,{focus:'r',mode:'impact',budget:3}),second=traceContext(g,{focus:'r',mode:'impact',budget:3,page:1});
 assert.deepEqual(ids(first),['r','a','u1']);assert.deepEqual(ids(second),['r','b','u2']);assert.equal(first.relationships.length,3);assert.equal(first.pages,2);
});

test('default context prioritizes requirement traces over incidental dependencies within its node budget',()=>{
 const g=graph([element('r'),element('z-origin'),element('z-part','PartUsage'),element('z-case','VerificationCaseUsage'),...['a','b','c','d'].map(id=>element(id,'PartUsage'))],[edge('origin','r','z-origin','derive'),edge('impact','z-part','r','satisfy'),edge('verify','z-case','r','verify'),...['a','b','c','d'].map(id=>edge(id,id,'r','dependency'))]);
 const result=traceContext(g,{focus:'r',mode:'context',budget:4});assert.deepEqual(result.targets,['z-origin','z-part','z-case']);assert.equal(result.total,7);assert.ok(result.omissions.some(o=>o.reason==='budget'&&o.target==='a'));assert.deepEqual(traceContext(graph([...g.elements].reverse(),[...g.relationships].reverse()),{focus:'r',mode:'context',budget:4}),result);
});

const owns=(source,target)=>edge('owns:'+source+':'+target,source,target,'containment',{nativeRole:'owner',navigationOnly:true});
const structureFixture=()=>({
 elements:[element('package','Package'),element('nested','Package'),element('assembly','PartDefinition'),element('part','PartUsage'),element('type','PartDefinition'),element('subpart','PartUsage'),element('peer','PartUsage'),element('other-instance','PartUsage'),element('base','PartDefinition'),element('deep','PartUsage'),...Array.from({length:6},(_,i)=>element('requirement'+i))],
 containment:[owns('package','nested'),owns('package','assembly'),owns('package','type'),owns('assembly','part'),owns('type','subpart'),owns('type','peer')],
 relationships:[edge('composition','assembly','part','composition'),edge('typing','part','type','typing'),edge('declared-child','type','subpart','composition'),edge('declared-peer','type','peer','composition'),edge('wire','subpart','peer','connection'),edge('other-type','other-instance','type','typing'),edge('base-type','type','base','typing'),edge('deeper','base','deep','composition'),...Array.from({length:6},(_,i)=>edge('satisfy'+i,'part','requirement'+i,'satisfy'))]
});
test('part focus prioritizes its whole, explicit classifier and declared parts ahead of requirements',()=>{
 const g=structureFixture(),before=structuredClone(g),result=traceContext(g,{focus:'part',budget:5});
 assert.deepEqual(result.targets,['assembly','type','peer','subpart']);
 assert.deepEqual(new Set(result.relationships.map(e=>e.id)),new Set(['composition','typing','declared-child','declared-peer','wire']));
 assert.deepEqual(result.typingBridges,['typing']);assert.equal(result.elements.length,5);
 assert.ok(!ids(result).includes('other-instance'));assert.ok(!ids(result).includes('base'));assert.ok(!ids(result).includes('deep'));
 assert.ok(result.omissions.some(o=>o.target==='requirement0'&&o.reason==='budget'));
 assert.deepEqual(g,before);result.elements[0].name='mutated';assert.deepEqual(g,before);
});
test('part contents and container are directional, retaining native owners and definition identities',()=>{
 const g=structureFixture(),contents=traceContext(g,{focus:'part',mode:'contents',budget:5}),container=traceContext(g,{focus:'part',mode:'container'});
 assert.deepEqual(contents.targets,['peer','subpart']);assert.deepEqual(new Set(ids(contents)),new Set(['part','type','peer','subpart']));
 assert.deepEqual(container.targets,['assembly']);assert.deepEqual(container.relationships,[g.relationships[0]]);
 assert.deepEqual(structuralActions(g,'part').map(a=>[a.mode,a.count]),[['contents',2],['container',1],['effective',6],['local-understanding',10],['global-impact',8]]);
 assert.ok(!ids(contents).includes('package'));assert.ok(!ids(contents).includes('requirement0'));
});
test('package focus exposes native containing package and declaration contents without membership plumbing',()=>{
 const g=structureFixture();g.elements.push(element('doc','Documentation'),element('fake','PartUsage',{qualifiedName:'package::fake'}));g.containment.push(owns('package','doc'));
 const root=traceContext(g,{focus:'package',budget:5});
 assert.deepEqual(root.targets,['type','assembly','nested']);assert.ok(root.relationships.every(e=>e.kind==='containment'&&e.navigationOnly&&e.nativeRole==='owner'));
 assert.ok(!ids(root).includes('doc'));assert.ok(!ids(root).includes('fake'));
 assert.deepEqual(traceContext(g,{focus:'nested',mode:'container'}).targets,['package']);
 assert.deepEqual(traceContext(g,{focus:'package',mode:'contents'}).targets,['assembly','nested','type']);
 const definition=traceContext(g,{focus:'assembly'});assert.deepEqual(definition.targets,['package','part']);
 assert.match(root.summary.message,/Package ownership is location context/);
});
test('structural contents retain every sibling and type bridge without paging or viewport budgets',()=>{
 const g=structureFixture();for(let i=0;i<60;i++){g.elements.push(element('child'+i,'PartUsage'));g.relationships.push(edge('child-link'+i,'type','child'+i,'composition'));g.containment.push(owns('type','child'+i));}
 const result=traceContext(g,{focus:'part',mode:'contents',budget:3,page:99});
 assert.equal(result.elements.length,64);assert.equal(result.total,62);assert.equal(result.pages,1);assert.equal(result.page,0);assert.equal(result.budget,null);assert.ok(result.relationships.some(e=>e.id==='typing'));
 assert.equal(result.omissions.filter(o=>o.reason==='budget').length,0);
 const reversed={elements:[...g.elements].reverse(),relationships:[...g.relationships].reverse(),containment:[...g.containment].reverse()};
 assert.deepEqual(traceContext(reversed,{focus:'part',mode:'contents',budget:3}),result);
});
test('structural filters and unavailable contents are disclosed without type or namespace shortcuts',()=>{
 const g=structureFixture();g.containment.push(owns('package','missing'));g.elements.push(element('meta','Package',{metamodel:true}));g.containment.push(owns('package','meta'));
 const contents=traceContext(g,{focus:'package',mode:'contents'});assert.equal(contents.summary.unavailable,1);assert.ok(contents.omissions.some(o=>o.target==='meta'&&o.reason==='metamodel-boundary'));
 const filtered=traceContext(g,{focus:'part',mode:'contents',relationshipKinds:['connection']});assert.deepEqual(ids(filtered),['part']);assert.ok(filtered.omissions.some(o=>o.reason==='relationship-filter'));
 const scope=traceContext(g,{focus:'part',mode:'contents',scopeIds:['part','peer','subpart']});assert.deepEqual(ids(scope),['part']);assert.ok(scope.omissions.some(o=>o.target==='type'&&o.reason==='outside-scope'));
 const types=traceContext(g,{focus:'part',elementKinds:['PartUsage']});assert.ok(!ids(types).includes('type'));assert.ok(!ids(types).includes('subpart'));
});
test('requirement default context never exposes package ownership and part definitions never expand all typed instances',()=>{
 const g=structureFixture();g.containment.push(owns('package','requirement0'));
 assert.deepEqual(traceContext(g,{focus:'requirement0'}).targets,['part']);
 const definition=traceContext(g,{focus:'type',mode:'contents'});assert.deepEqual(definition.targets,['peer','subpart']);assert.deepEqual(definition.typingBridges,[]);
 assert.ok(structuralActions(g,'requirement0').every(a=>!a.enabled));
});

test('package contents include native enumeration and concern declarations without broadening requirement context',()=>{
 const declarations=['EnumerationDefinition','EnumerationUsage','ConcernDefinition','ConcernUsage','MetadataDefinition','ViewUsage'];
 const g={elements:[element('p','Package'),element('r'),...declarations.map(kind=>element(kind,kind))],containment:declarations.map(kind=>owns('p',kind)),relationships:declarations.map(kind=>edge(kind,'r',kind,'dependency'))};
 const result=traceContext(g,{focus:'p',mode:'contents',budget:7});assert.deepEqual(new Set(result.targets),new Set(declarations));assert.equal(result.summary.filtered,0);
 assert.deepEqual(traceContext(g,{focus:'r'}).targets,[]);
 assert.deepEqual(ids(traceContext(g,{focus:'EnumerationDefinition'})),['EnumerationDefinition','r']);
});

test('structural neighbor prominence ranks a substantial branch before an alphabetical leaf within native roles',()=>{
 const g={elements:[element('whole','PartDefinition'),element('focus','PartUsage'),element('type','PartDefinition'),element('alpha','PartUsage'),element('zulu','PartUsage'),element('descendant','PartUsage')],
  relationships:[edge('whole','whole','focus','composition'),edge('type','focus','type','typing'),edge('alpha','type','alpha','composition'),edge('zulu','type','zulu','composition'),edge('descendant','zulu','descendant','composition')]};
 const result=traceContext(g,{focus:'focus',budget:4});
 assert.deepEqual(result.targets,['whole','type','zulu']);
 assert.deepEqual(result.typingBridges,['type']);
 assert.ok(result.omissions.some(o=>o.target==='alpha'&&o.reason==='budget'));
 assert.ok(!ids(result).includes('descendant'),'prominence must not expand another hop');
 assert.deepEqual(result.relationships.map(e=>[e.id,e.source,e.target]),[['type','focus','type'],['whole','whole','focus'],['zulu','type','zulu']]);
});

test('prominence pagination keeps parallel native links, direction and typing bridges across deterministic pages',()=>{
 const g={elements:[element('r'),element('definition','RequirementDefinition'),element('alpha','PartUsage'),element('zulu','PartUsage'),element('child','PartUsage')],
  relationships:[edge('type','r','definition','typing'),edge('a','alpha','definition','satisfy'),edge('z1','zulu','definition','satisfy'),edge('z2','zulu','definition','satisfaction'),edge('child','zulu','child','composition')]};
 const first=traceContext(g,{focus:'r',mode:'impact',budget:3}),second=traceContext(g,{focus:'r',mode:'impact',budget:3,page:1});
 assert.deepEqual(first.targets,['zulu']);assert.deepEqual(second.targets,['alpha']);assert.equal(first.pages,2);
 assert.deepEqual(first.relationships.map(e=>[e.id,e.source,e.target]),[['type','r','definition'],['z1','zulu','definition'],['z2','zulu','definition']]);
 assert.deepEqual(first.typingBridges,['type']);assert.deepEqual(second.typingBridges,['type']);
 const reversed={elements:[...g.elements].reverse(),relationships:[...g.relationships].reverse()};
 assert.deepEqual(traceContext(reversed,{focus:'r',mode:'impact',budget:3}),first);
});

test('rank scope prevents out-of-system children from inflating an in-scope neighbor',()=>{
 const g={elements:['r','alpha','zulu','outside1','outside2'].map(id=>element(id)),
  relationships:[edge('a','alpha','r','derive'),edge('z','zulu','r','derive'),edge('o1','zulu','outside1','composition'),edge('o2','zulu','outside2','composition')]};
 assert.deepEqual(traceContext(g,{focus:'r',mode:'derived',budget:3}).targets,['zulu','alpha']);
 assert.deepEqual(traceContext(g,{focus:'r',mode:'derived',budget:3,scopeIds:['r','alpha','zulu']}).targets,['alpha','zulu']);
});

test('prominence scope ranks the active system without hiding a direct external engineering trace',()=>{
 const g={elements:['r','alpha','outside'].map(id=>element(id)),relationships:[edge('a','alpha','r','derive'),edge('external','outside','r','derive')]};
 const result=traceContext(g,{focus:'r',mode:'derived',prominenceScopeIds:['r','alpha'],budget:3});
 assert.deepEqual(result.targets,['alpha','outside']);
 assert.deepEqual(result.relationships.map(e=>[e.id,e.source,e.target]),[['a','alpha','r'],['external','outside','r']]);
 assert.ok(!result.omissions.some(o=>o.reason==='outside-scope'));
});

test('hidden and unavailable known links do not produce a no-links claim',()=>{
 const link=edge('native-satisfy','boat','r','satisfy'),g=graph([element('r'),element('boat','PartUsage')],[link]);
 const hidden=traceContext(g,{focus:'r',mode:'impact',scopeIds:['r']});
 assert.equal(hidden.summary.status,'filtered');assert.equal(hidden.summary.filtered,1);
 assert.match(hidden.summary.message,/No matching neighbors are shown/);
 assert.match(hidden.summary.message,/1 matching neighbor is excluded/);
 assert.doesNotMatch(hidden.summary.message,/No satisfaction or allocation links are known/);
 assert.deepEqual(ids(hidden),['r']);
 const menu=requirementActions(g,'r',{scopeIds:['r']}).find(item=>item.mode==='impact');
 assert.equal(menu.total,1);assert.equal(menu.count,0);assert.equal(menu.summary.message,hidden.summary.message);
 assert.deepEqual(traceContext(g,{focus:'r',mode:'impact'}).relationships,[link]);
 const unavailable=traceContext(graph([element('r')],[link]),{focus:'r',mode:'impact'});
 assert.equal(unavailable.summary.status,'unavailable');assert.equal(unavailable.summary.unavailable,1);
 assert.match(unavailable.summary.message,/No matching neighbors are shown/);assert.match(unavailable.summary.message,/1 referenced element is unavailable/);
 assert.doesNotMatch(unavailable.summary.message,/No satisfaction or allocation links are known/);
 assert.deepEqual(ids(unavailable),['r']);
});
