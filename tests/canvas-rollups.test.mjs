import test from 'node:test';
import assert from 'node:assert/strict';
import {relationshipRollups,rollupDrilldown} from '../src/canvas-prototype/rollups.mjs';
import {modelGraph,graphView} from '../src/canvas-prototype/graph.mjs';
const element=(id,kind='PartUsage',extra={})=>({id,kind,name:id,layer:'project',...extra});
const edge=(id,source,target,kind='satisfy',extra={})=>({id,source,target,kind,authority:'native-api',...extra});
const owns=(source,target)=>edge('owner:'+source+':'+target,source,target,'containment',{nativeRole:'owner',navigationOnly:true});
const fixture=()=>({elements:[element('design','Package'),element('requirements','Package'),element('part'),element('other'),element('requirement','RequirementUsage'),element('next','RequirementUsage'),element('external'),element('fake','PartUsage',{qualifiedName:'design::fake'})],containment:[owns('design','part'),owns('design','other'),owns('requirements','requirement'),owns('requirements','next')],relationships:[edge('one','part','requirement','satisfy',{nativeRelationship:'native-one'}),edge('two','other','next','satisfy',{nativeRelationship:'native-two'}),edge('derive','next','requirement','derive'),edge('verify','other','requirement','verify'),edge('reverse','requirement','part','allocate'),edge('external','external','requirement','allocate')]});
const roll=g=>relationshipRollups(g,{visibleIds:['design','requirements']});

test('typed rollups preserve native direction, kinds, underlying identities and exact drilldown',()=>{
 const g=fixture(),result=roll(g),satisfy=result.rollups.find(r=>r.kind==='satisfy');
 assert.equal(satisfy.source,'design');assert.equal(satisfy.target,'requirements');assert.equal(satisfy.count,2);assert.equal(satisfy.nativeRelationshipCount,2);assert.ok(satisfy.identityComplete);
 assert.deepEqual(satisfy.underlyingRelationshipIds,['one','two']);assert.deepEqual(satisfy.nativeRelationshipIds,['native-one','native-two']);
 assert.ok(result.rollups.some(r=>r.kind==='verify'&&r.source==='design'&&r.target==='requirements'));
 assert.ok(result.rollups.some(r=>r.kind==='allocate'&&r.source==='requirements'&&r.target==='design'));
 const detail=rollupDrilldown(g,satisfy);assert.deepEqual(detail.relationships,g.relationships.slice(0,2));assert.deepEqual(new Set(detail.elements.map(e=>e.id)),new Set(['part','other','requirement','next']));
 assert.deepEqual(detail.paths[0].source.elementIds,['part','design']);assert.deepEqual(detail.paths[0].target.relationships,[g.containment[2]]);
 assert.ok(detail.relationships.every(e=>!e.presentationOnly));assert.ok(graphView(g,detail).edges.every(e=>!e.aggregate));
});

test('scope excludes external allocations before aggregation and same-container links are explicitly omitted',()=>{
 const g=fixture(),result=relationshipRollups(g,{visibleIds:['design','requirements'],scopeIds:['design','requirements','part','other','requirement','next']});
 assert.ok(result.omissions.some(o=>o.relationshipId==='external'&&o.reason==='outside-scope'));
 assert.ok(result.omissions.some(o=>o.relationshipId==='derive'&&o.reason==='internal-to-visible-container'));
 assert.ok(!result.rollups.some(r=>r.underlyingRelationshipIds.includes('external')));
 const unrelated={...g,relationships:[...g.relationships,edge('unrelated','external','fake','allocate')]};
 const scoped=relationshipRollups(unrelated,{visibleIds:['requirements'],scopeIds:['requirements','requirement','next']});assert.ok(scoped.summary.excludedOutsideScope>0);assert.ok(!scoped.omissions.some(o=>o.relationshipId==='unrelated'));
 const isolated=relationshipRollups(g,{visibleIds:['requirements'],scopeIds:['requirements','requirement','next']});
 assert.deepEqual(isolated.rollups,[]);assert.ok(isolated.summary.reasonCounts['outside-scope']>0);
 const internal=relationshipRollups(g,{visibleIds:['requirements'],scopeIds:['requirements','requirement','next'],includeInternal:true});
 assert.equal(internal.rollups[0].source,'requirements');assert.equal(internal.rollups[0].target,'requirements');assert.equal(internal.rollups[0].kind,'derive');
});

test('only native owners establish rollup containers, with ambiguity, cycles and unavailable ownership disclosed',()=>{
 const g=fixture();g.relationships.push(edge('fake','fake','requirement'));g.elements.push(element('cycleA'),element('cycleB'),element('ambiguous'));g.containment.push(owns('cycleA','cycleB'),owns('cycleB','cycleA'),owns('design','ambiguous'),owns('requirements','ambiguous'),owns('absent','other'));g.relationships.push(edge('cycle','cycleA','requirement'),edge('ambiguous','ambiguous','requirement'),edge('missing','missing','requirement'));
 const result=roll(g);
 assert.ok(result.omissions.some(o=>o.relationshipId==='fake'&&o.reason==='no-visible-owner'));
 assert.ok(result.omissions.some(o=>o.relationshipId==='cycle'&&o.reason==='ownership-cycle'));
 assert.ok(result.omissions.some(o=>o.relationshipId==='ambiguous'&&o.reason==='ambiguous-visible-owner'));
 assert.ok(result.omissions.some(o=>o.relationshipId==='missing'&&o.reason==='unavailable'));
 const limit=relationshipRollups(g,{visibleIds:['design','requirements'],maxOwnerHops:0});assert.ok(limit.omissions.some(o=>o.reason==='ownership-limit'));
 const unknownOwner=roll({...g,containment:g.containment.filter(e=>!(e.target==='other'&&e.source==='design'))});assert.ok(unknownOwner.omissions.some(o=>o.relationshipId==='two'&&o.reason==='unavailable-owner'));
});

test('relationship filtering, direct edges and deterministic rollup budgets retain separate disclosure',()=>{
 const g=fixture();g.relationships.push(edge('direct','design','requirements','satisfy'));
 const result=relationshipRollups(g,{visibleIds:['design','requirements'],relationshipKinds:['satisfy','verify'],budget:1});
 assert.deepEqual(result.directRelationships,[g.relationships.at(-1)]);assert.equal(result.rollups.length,1);assert.equal(result.summary.totalGroups,2);
 assert.ok(result.omissions.some(o=>o.reason==='relationship-filter'));assert.ok(result.omissions.some(o=>o.reason==='rollup-budget'));
 assert.deepEqual(relationshipRollups({...g,elements:[...g.elements].reverse(),relationships:[...g.relationships].reverse(),containment:[...g.containment].reverse()},{visibleIds:['requirements','design'],relationshipKinds:['satisfy','verify'],budget:1}),result);
 assert.throws(()=>relationshipRollups(g,{}),/visible/);assert.throws(()=>relationshipRollups(g,{visibleIds:[],budget:-1}),/budget/);
});

test('rollup drilldown pages exact connections and rechecks current scope and ownership',()=>{
 const g=fixture(),aggregate=roll(g).rollups.find(r=>r.kind==='satisfy');
 const first=rollupDrilldown(g,aggregate,{pageSize:1}),second=rollupDrilldown(g,aggregate,{page:1,pageSize:1});assert.equal(first.pages,2);assert.deepEqual(first.relationships,[g.relationships[0]]);assert.deepEqual(second.relationships,[g.relationships[1]]);assert.ok(second.hasPrevious);
 const scoped=rollupDrilldown(g,aggregate,{scopeIds:['design','requirements','part','requirement']});assert.equal(scoped.total,1);assert.ok(scoped.omissions.some(o=>o.relationshipId==='two'&&o.reason==='outside-scope'));
 const changed={...g,containment:g.containment.filter(e=>e.target!=='part')};const stale=rollupDrilldown(changed,aggregate);assert.ok(stale.omissions.some(o=>o.relationshipId==='one'&&o.reason==='stale-owner-projection'));
 const removed=rollupDrilldown({...g,relationships:g.relationships.slice(1)},aggregate);assert.ok(removed.omissions.some(o=>o.relationshipId==='one'&&o.reason==='stale-relationship'));
 assert.throws(()=>rollupDrilldown(g,{id:'pretend'}),/presentation/);
});

test('mapped occurrence cardinality stays distinct from known native relationship identity and input is immutable',()=>{
 const g=fixture();g.relationships[0].occurrences=[{id:'view:A:0'},{id:'view:B:0'}];g.relationships[1].nativeRelationship='native-one';g.relationships.push(edge('unknown','part','next','satisfy',{occurrences:[{id:'view:A:1'},{id:'view:B:1'}]}));
 const before=structuredClone(g),aggregate=roll(g).rollups.find(r=>r.kind==='satisfy');assert.equal(aggregate.nativeRelationshipCount,1);assert.equal(aggregate.unresolvedRecordCount,1);assert.equal(aggregate.count,2);assert.equal(aggregate.recordCount,3);assert.equal(aggregate.occurrenceCount,5);assert.equal(aggregate.identityComplete,false);assert.match(aggregate.summary,/not additional modeled relationships/);
 const detail=rollupDrilldown(g,aggregate);detail.relationships[0].kind='changed';aggregate.records[0].sourcePath.relationships[0].source='changed';assert.deepEqual(g,before);
});

test('graph adapter preserves parallel native relationship IDs and every repeated view occurrence without semantic aggregate leakage',()=>{
 const raw=[{'@id':'a','@type':'PartUsage'},{'@id':'b','@type':'RequirementUsage'},...['d1','d2'].map(id=>({'@id':id,'@type':'Dependency',client:{'@id':'a'},supplier:{'@id':'b'}}))];
 const nodes=[{id:'aNode',semanticId:'a'},{id:'bNode',semanticId:'b'}],edge={from:'aNode',to:'bNode',kind:'dependency',semanticId:'d1',identityStatus:'mapped'};
 const g=modelGraph(raw,[{id:'viewA',nodes,edges:[edge,{...edge,kind:'satisfy',semanticId:'a'}]},{id:'viewB',nodes,edges:[edge,{...edge,kind:'satisfy',semanticId:'a'},{...edge,kind:'invented',presentationOnly:true,aggregate:true}]}]);
 assert.equal(g.relationships.filter(e=>e.kind==='dependency').length,2);assert.equal(g.relationships.find(e=>e.nativeRelationship==='d1').occurrences.length,2);
 const mapped=g.relationships.find(e=>e.kind==='satisfy');assert.equal(mapped.nativeRelationship,undefined);assert.deepEqual(mapped.occurrences.map(o=>o.id),['view:viewA:1','view:viewB:1']);assert.equal(mapped.occurrences[0].semanticId,'a');assert.equal(mapped.occurrences[0].nativeEdge.from,'aNode');
 assert.ok(!g.relationships.some(e=>e.kind==='invented'));
});

 test('native mapped satisfaction usage IDs identify assertions without subject parsing or endpoint-only guessing',()=>{
 const raw=[{'@id':'design','@type':'Package','sysx:sourceLine':1},{'@id':'requirements','@type':'Package','sysx:sourceLine':2},{'@id':'p','@type':'PartUsage',owner:{'@id':'design'},'sysx:sourceLine':3},{'@id':'r','@type':'RequirementUsage',owner:{'@id':'requirements'},'sysx:sourceLine':4},...['s1','s2'].map(id=>({'@id':id,'@type':'SatisfyRequirementUsage',subsets:{'@id':'r'},subject:'unparsed.native.feature.chain','sysx:sourceLine':5}))];
 const nodes=[{id:'pNode',semanticId:'p'},{id:'rNode',semanticId:'r'}],view=(name,semanticIds)=>({id:name,nodes,edges:semanticIds.map(semanticId=>({from:'pNode',to:'rNode',kind:'satisfy',semanticId,identityStatus:'mapped'}))});
 const g=modelGraph(raw,[view('one',['s1','s2']),view('two',['s1'])]);
 assert.deepEqual(g.relationships.map(e=>e.nativeRelationship),['s1','s2']);
 const aggregate=relationshipRollups(g,{visibleIds:['design','requirements']}).rollups[0];
 assert.equal(aggregate.nativeRelationshipCount,2);assert.equal(aggregate.unresolvedRecordCount,0);assert.equal(aggregate.count,2);assert.equal(aggregate.occurrenceCount,3);assert.ok(aggregate.identityComplete);
 const unknown=modelGraph(raw,[view('unmapped',['p'])]);assert.equal(unknown.relationships[0].nativeRelationship,undefined,'same endpoints are not enough to choose s1 or s2');
 const wrongKind=modelGraph(raw,[{...view('different',['s1']),edges:[{from:'pNode',to:'rNode',kind:'derive',semanticId:'s1',identityStatus:'mapped'}]}]);assert.equal(wrongKind.relationships[0].nativeRelationship,undefined,'the satisfaction identity contract does not cover derivation');
 });
