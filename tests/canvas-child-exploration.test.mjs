import test from 'node:test';
import assert from 'node:assert/strict';
import {completeChildContext,completeRootContext} from '../src/canvas-prototype/child-exploration.mjs';
import {traceContext,structuralActions} from '../src/canvas-prototype/exploration.mjs';
const item=(id,kind='PartUsage',extra={})=>({id,kind,name:id,qualifiedName:'Model::'+id,layer:'project',native:{declaredName:id,'sysx:sourceLine':1},...extra});
const owner=(source,target,id='owner:'+source+':'+target)=>({id,source,target,kind:'containment',label:'owns',nativeRole:'owner',navigationOnly:true,authority:'native-api',nativeRelationship:'native:'+id});
const edge=(id,source,target,kind)=>({id,source,target,kind,label:kind,authority:'native-api',nativeRelationship:'native:'+id});
const ids=context=>context.elements.map(e=>e.id);
const fixture=count=>({elements:[item('root','Package'),...Array.from({length:count},(_,i)=>item('child-'+String(i).padStart(4,'0'),i%2?'AttributeUsage':'PartUsage'))],relationships:[],containment:Array.from({length:count},(_,i)=>owner('root','child-'+String(i).padStart(4,'0')))});

for(const count of [0,1,5,6,128,513])test('complete contents keep all '+count+' immediate native siblings regardless of old budgets/pages',()=>{
 const graph=fixture(count),result=traceContext(graph,{focus:'root',mode:'contents',budget:3,page:99});
 assert.equal(result.total,count);assert.equal(result.shown,count);assert.equal(result.pages,1);assert.equal(result.page,0);assert.equal(result.budget,null);
 assert.equal(result.elements.length,count+1);assert.equal(result.relationships.length,count);
 assert.deepEqual(new Set(result.targets),new Set(graph.elements.slice(1).map(e=>e.id)));
 assert.ok(result.childProjection.complete);assert.equal(result.omissions.filter(o=>o.reason==='budget').length,0);
 assert.deepEqual(structuralActions(graph,'root').find(a=>a.mode==='contents').count,count);
 for(const id of result.targets)assert.equal(result.childProjection.declaredOn[id],'root');
});

test('unrelated links, containing packages and other usages cannot displace or enter the child set',()=>{
 const graph=fixture(80);graph.elements.push(item('parent','Package'),...Array.from({length:100},(_,i)=>item('related-'+i,'RequirementUsage')));
 graph.containment.push(owner('parent','root'));
 graph.relationships.push(...Array.from({length:100},(_,i)=>edge('satisfy-'+i,'root','related-'+i,'satisfy')));
 const context=completeChildContext(graph,{focus:'root'});
 assert.equal(context.total,80);assert.deepEqual(new Set(ids(context)),new Set(['root',...fixture(80).elements.slice(1).map(e=>e.id)]));
 assert.ok(!ids(context).includes('parent'));assert.ok(!context.relationships.some(e=>e.kind==='satisfy'));
});

test('attributes, internal parts, other source declarations and unnamed native usages are retained',()=>{
 const kinds=['PartUsage','PartDefinition','AttributeUsage','AttributeDefinition','PortUsage','ItemUsage','ActionDefinition','StateUsage','EnumerationDefinition','ConcernUsage','MetadataDefinition','ViewUsage','ConnectionUsage','SatisfyRequirementUsage'];
 const graph={elements:[item('root','Package'),...kinds.map(kind=>item(kind,kind)),item('unnamed','AttributeUsage',{name:'native-unnamed',qualifiedName:'Model::@11',native:{'sysx:sourceLine':11}}),item('doc','Documentation'),item('membership','FeatureMembership')],relationships:[],containment:[...kinds.map(kind=>owner('root',kind)),owner('root','unnamed'),owner('root','doc'),owner('root','membership')]};
 const result=completeChildContext(graph,{focus:'root'});
 assert.deepEqual(new Set(result.targets),new Set([...kinds,'unnamed']));
 assert.equal(result.childProjection.kindCounts.AttributeUsage,2);
 assert.ok(result.omissions.some(o=>o.target==='doc'&&o.reason==='element-policy'));
 assert.ok(result.omissions.some(o=>o.target==='membership'&&o.reason==='element-policy'));
 assert.ok(!result.omissions.some(o=>o.target==='unnamed'));
});

test('direct definition declarations preserve their owners and typing bridge without becoming runtime instances',()=>{
 const graph={elements:[item('usage'),item('definition','PartDefinition'),item('own-attribute','AttributeUsage'),item('declared-part'),item('declared-attribute','AttributeUsage'),item('other-usage'),item('base','PartDefinition'),item('inherited-part')],
  containment:[owner('usage','own-attribute'),owner('definition','declared-part'),owner('definition','declared-attribute'),owner('base','inherited-part')],
  relationships:[edge('typing','usage','definition','typing'),edge('other-type','other-usage','definition','typing'),edge('specialization','definition','base','specialization'),edge('wire','declared-part','declared-attribute','connection')]};
 const result=completeChildContext(graph,{focus:'usage',budget:1});
 assert.deepEqual(new Set(ids(result)),new Set(['usage','definition','own-attribute','declared-part','declared-attribute']));
 assert.deepEqual(new Set(result.targets),new Set(['own-attribute','declared-part','declared-attribute']));
 assert.deepEqual(result.typingBridges,['typing']);assert.equal(result.summary.ownChildren,1);assert.equal(result.summary.definitionChildren,2);
 assert.equal(result.childProjection.declaredOn['declared-part'],'definition');assert.equal(result.childProjection.declaredOn['own-attribute'],'usage');
 assert.ok(result.relationships.some(e=>e.id==='wire'&&e.source==='declared-part'&&e.target==='declared-attribute'));
 assert.ok(!ids(result).includes('other-usage'));assert.ok(!ids(result).includes('base'));assert.ok(!ids(result).includes('inherited-part'));
 assert.match(result.summary.message,/not runtime instances/);
 const definition=completeChildContext(graph,{focus:'definition'});assert.deepEqual(new Set(definition.targets),new Set(['declared-part','declared-attribute']));assert.deepEqual(definition.typingBridges,[]);
});

test('composition references, QName prefixes and indirect ancestors never substitute for native owner membership',()=>{
 const graph={elements:[item('root','PartDefinition'),item('owned'),item('reference'),item('prefix','PartUsage',{qualifiedName:'Model::root::prefix'})],containment:[owner('root','owned')],relationships:[edge('composition-reference','root','reference','composition')]};
 const result=completeChildContext(graph,{focus:'root'});assert.deepEqual(result.targets,['owned']);assert.deepEqual(ids(result),['root','owned']);
});

test('isolated scope excludes an external definition before it can expose its declarations',()=>{
 const graph={elements:[item('usage'),item('definition','PartDefinition'),item('owned'),item('external-child')],containment:[owner('usage','owned'),owner('definition','external-child')],relationships:[edge('typing','usage','definition','typing')]};
 const result=completeChildContext(graph,{focus:'usage',scopeIds:['usage','owned','external-child']});
 assert.deepEqual(new Set(ids(result)),new Set(['usage','owned']));assert.ok(result.omissions.some(o=>o.target==='definition'&&o.reason==='outside-scope'));
 const included=completeChildContext(graph,{focus:'usage'});assert.deepEqual(new Set(included.targets),new Set(['owned','external-child']));
});

test('scope, unavailable references, explicit filters and metamodel records have separate truthful omissions',()=>{
 const graph=fixture(1);graph.elements.push(item('outside'),item('meta','PartUsage',{layer:'metamodel'}),item('library','PartDefinition',{layer:'library'}));graph.containment.push(owner('root','missing'),owner('root','outside'),owner('root','meta'),owner('root','library'));
 const scoped=completeChildContext(graph,{focus:'root',scopeIds:['root','child-0000','missing','meta','library']});
 assert.deepEqual(scoped.targets,['child-0000']);assert.equal(scoped.summary.unavailable,1);assert.equal(scoped.summary.outsideScope,1);
 for(const [id,reason]of [['missing','unavailable'],['outside','outside-scope'],['meta','metamodel-boundary'],['library','source-projection']])assert.ok(scoped.omissions.some(o=>o.target===id&&o.reason===reason));
 const filtered=completeChildContext(graph,{focus:'root',elementKinds:['Package','AttributeUsage']});assert.ok(filtered.omissions.some(o=>o.target==='child-0000'&&o.reason==='element-filter'));
 assert.equal(completeChildContext(graph,{focus:'missing'}).summary.status,'missing-focus');
});

test('multiple roots union one native hop without recursive descent or duplicate child identities',()=>{
 const graph={elements:[item('a','Package'),item('b','Package'),item('shared'),item('deep')],containment:[owner('a','b'),owner('a','shared','owner-a-shared'),owner('b','shared','owner-b-shared'),owner('shared','deep')],relationships:[]};
 const result=completeChildContext(graph,{rootIds:['b','a','a']});
 assert.deepEqual(new Set(ids(result)),new Set(['a','b','shared']));assert.deepEqual(new Set(result.targets),new Set(['b','shared']));assert.ok(!ids(result).includes('deep'));
 assert.equal(result.childProjection.declaredOn.shared,null);assert.deepEqual(result.childProjection.declarationOwners.shared,['a','b']);
 assert.equal(result.childProjection.ownership.length,3);
});

test('native owner/type cycles retain identities without expanding another ownership level',()=>{
 const graph={elements:[item('a'),item('b','PartDefinition'),item('c')],containment:[owner('b','a'),owner('a','c'),owner('c','b')],relationships:[edge('type','a','b','typing')]};
 const result=completeChildContext(graph,{focus:'a'});assert.deepEqual(new Set(ids(result)),new Set(['a','b','c']));assert.deepEqual(new Set(result.targets),new Set(['a','c']));
 assert.deepEqual(result.typingBridges,['type']);assert.equal(result.childProjection.declaredOn.a,'b');
 assert.ok(!result.childProjection.ownership.some(e=>e.source==='c'));
});

test('result and input isolation, parallel native relationship identities and deterministic input order are preserved',()=>{
 const graph=fixture(6);graph.relationships.push(edge('parallel-1','child-0000','child-0001','connection'),edge('parallel-2','child-0000','child-0001','connection'));const original=structuredClone(graph);
 const result=completeChildContext(graph,{focus:'root'}),reversed={elements:[...graph.elements].reverse(),containment:[...graph.containment].reverse(),relationships:[...graph.relationships].reverse()};
 assert.deepEqual(completeChildContext(reversed,{focus:'root'}),result);
 assert.deepEqual(result.relationships.filter(e=>e.kind==='connection').map(e=>e.nativeRelationship),['native:parallel-1','native:parallel-2']);
 result.elements[0].name='changed';result.childProjection.ownership[0].label='changed';result.relationships[0].source='changed';
 assert.deepEqual(graph,original);assert.deepEqual(completeChildContext(graph,{focus:'root'}),completeChildContext(original,{focus:'root'}));
});


test('project opening contains all native source roots rather than a story subset or capped sample',()=>{
 const graph={elements:[...Array.from({length:137},(_,i)=>item('package-'+String(i).padStart(3,'0'),'Package')),...Array.from({length:53},(_,i)=>item('metadata-'+i,'MetadataUsage')),item('nested'),item('deep'),item('doc','Documentation')],relationships:[],containment:[owner('package-000','nested'),owner('nested','deep')]};
 for(let i=0;i<53;i++)graph.elements[137+i].native.owner={'@id':'omitted-native-owner-'+i};
 const context=completeRootContext(graph);
 assert.equal(context.total,190);assert.equal(context.summary.sourceDeclarations,192);assert.equal(context.summary.packages,137);assert.equal(context.summary.unanchoredMetadata,53);
 assert.deepEqual(new Set(context.targets),new Set(graph.elements.filter(e=>!['nested','deep','doc'].includes(e.id)).map(e=>e.id)));
 assert.ok(context.elements.slice(0,137).every(e=>e.kind==='Package'));assert.deepEqual(context.childProjection.rootIds,[]);assert.deepEqual(context.childProjection.declaredOn,{});
 assert.equal(context.childProjection.projectionRoots.find(e=>e.id==='metadata-0').reason,'native-owner-omitted');
 assert.deepEqual(context.childProjection.declarationOwners['metadata-0'],['omitted-native-owner-0']);assert.equal(context.relationships.length,0);
 assert.match(context.summary.message,/not asserted to be physical/);assert.ok(!context.targets.includes('nested'));assert.ok(!context.targets.includes('deep'));
});

test('project roots use native owner roles, exposing omitted-owner boundaries and not misleading QName roots',()=>{
 const graph={elements:[item('actual-root','Package'),item('child','Package',{qualifiedName:'Misleading::Other'}),item('orphan','MetadataUsage',{qualifiedName:'actual-root::orphan',native:{owner:{'@id':'absent'}}})],relationships:[],containment:[owner('actual-root','child')]};
 const context=completeRootContext(graph);
 assert.deepEqual(context.targets,['actual-root','orphan']);assert.ok(!context.targets.includes('child'));
 assert.equal(context.childProjection.projectionRoots.find(e=>e.id==='orphan').reason,'native-owner-omitted');
 const scopedOrphan=completeRootContext(graph,{scopeIds:['orphan']});assert.equal(scopedOrphan.childProjection.projectionRoots[0].reason,'native-owner-omitted');assert.deepEqual(scopedOrphan.childProjection.projectionRoots[0].omittedOwnerIds,['absent']);
 const scoped=completeRootContext(graph,{scopeIds:['child']});assert.deepEqual(scoped.targets,['child']);assert.equal(scoped.childProjection.projectionRoots[0].reason,'outside-scope');
});

test('closed native owner cycles expose all cycle members while keeping their descendants behind drilldown',()=>{
 const graph={elements:[item('root','Package'),item('normal-child'),item('a','Package'),item('b','Package'),item('cycle-child'),item('self','Package')],relationships:[],containment:[owner('root','normal-child'),owner('a','b'),owner('b','a'),owner('b','cycle-child'),owner('self','self')]};
 const context=completeRootContext(graph);
 assert.deepEqual(new Set(context.targets),new Set(['root','a','b','self']));assert.equal(context.summary.cycleEntries,3);
 assert.ok(!context.targets.includes('cycle-child'));assert.ok(!context.targets.includes('normal-child'));
 assert.ok(context.childProjection.projectionRoots.filter(e=>e.reason==='cycle').every(e=>['a','b','self'].includes(e.id)));
 assert.ok(!context.childProjection.projectionRoots.some(e=>e.reason==='ownership-unresolved'));
 assert.deepEqual(completeChildContext(graph,{focus:'b'}).targets,['a','cycle-child']);
});

test('deep ownership chains do not recurse the JS stack or expand into the project-root drawing',()=>{
 const count=10000,graph={elements:Array.from({length:count},(_,i)=>item(String(i),'Package')),containment:Array.from({length:count-1},(_,i)=>owner(String(i),String(i+1))),relationships:[]};
 const context=completeRootContext(graph);assert.deepEqual(context.targets,['0']);assert.equal(context.summary.sourceDeclarations,count);assert.equal(context.elements.length,1);
});

test('complete contents disclose typed one-hop native relationship context separately from child counts',()=>{
 const graph={elements:[item('root','PartUsage'),item('child'),item('external','RequirementUsage'),item('available','PartDefinition')],containment:[owner('root','child')],relationships:[edge('outgoing','child','external','satisfy'),edge('incoming','external','root','verify'),edge('missing','child','unloaded','dependency'),edge('unopened','available','child','typing'),edge('parallel','child','external','satisfy')]};
 const result=completeChildContext(graph,{focus:'root',scopeIds:['root','child','available','unloaded']});
 assert.deepEqual(new Set(ids(result)),new Set(['root','child']));
 assert.equal(result.total,1);assert.equal(result.summary.ownChildren,1);assert.equal(result.summary.filtered,0);assert.equal(result.summary.unavailable,0);
 assert.deepEqual(result.summary.relationshipContext,{total:5,outsideScope:3,unavailable:1,notOpened:1,kindCounts:{satisfy:2,verify:1,dependency:1,typing:1}});
 const context=result.omissions.filter(o=>o.contextOnly);
 assert.equal(context.length,5);assert.deepEqual(new Set(context.map(o=>o.relationshipId)),new Set(graph.relationships.map(r=>r.id)));
 for(const native of graph.relationships){const omission=context.find(o=>o.relationshipId===native.id);assert.equal(omission.kind,native.kind);assert.equal(omission.nativeRelationship,native.nativeRelationship);assert.equal(omission.source,native.source);assert.equal(omission.target,native.target);assert.equal(omission.semanticSource,native.source);assert.equal(omission.semanticTarget,native.target);}
 assert.equal(context.find(o=>o.relationshipId==='incoming').otherEndpoint,'external');
 assert.equal(context.find(o=>o.relationshipId==='missing').reason,'unavailable');
 assert.equal(context.find(o=>o.relationshipId==='unopened').reason,'not-opened');
 assert.match(result.summary.message,/without adding endpoints or changing child counts/);
 assert.equal(result.relationships.filter(r=>r.kind==='satisfy').length,0);
});

test('relationship context diagnostics preserve multiple native occurrences without becoming sibling omissions',()=>{
 const graph=fixture(0),outside=item('outside');graph.elements.push(outside);
 const native={...edge('dependency','outside','root','dependency'),occurrences:[{id:'view-occurrence-1'},{id:'view-occurrence-2'}]};graph.relationships.push(native);
 const result=completeChildContext(graph,{focus:'root'}),omission=result.omissions.find(o=>o.contextOnly);
 assert.equal(result.total,0);assert.equal(result.summary.status,'no-known-children');
 assert.equal(result.summary.relationshipContext.notOpened,1);
 assert.deepEqual(omission.occurrences,native.occurrences);omission.occurrences[0].id='edited';assert.equal(native.occurrences[0].id,'view-occurrence-1');
});
