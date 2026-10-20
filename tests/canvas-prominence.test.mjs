import test from 'node:test';
import assert from 'node:assert/strict';
import {buildSystemOverview,createProminenceIndex,nativeScopeIds} from '../src/canvas-prototype/prominence.mjs';

const element=(id,kind='PartUsage',extra={})=>({
  id,kind,name:id,qualifiedName:`Model::${id}`,layer:'project',native:{declaredName:id},...extra,
});
const owner=(source,target,extra={})=>({id:`owner:${source}:${target}`,source,target,kind:'containment',nativeRole:'owner',navigationOnly:true,...extra});
const connection=(source,target,id=`link:${source}:${target}`,kind='dependency')=>({id,source,target,kind,label:kind,authority:'native-api'});
const graph=(elements,containment=[],relationships=[])=>({elements,containment,relationships});
const ids=overview=>overview.elements.map(item=>item.id);

test('prominence counts distinct native structural and engineering neighbors without edge inflation',()=>{
  const model=graph(
    ['root','a','b','leaf'].map(id=>element(id,id==='root'?'Package':'PartUsage')),
    [owner('root','a'),owner('root','a',{id:'second-owner'}),owner('root','b'),owner('a','leaf')],
    [connection('root','a','composition','composition'),connection('a','b','one'),connection('a','b','two'),connection('b','a','reverse'),connection('a','a','self')],
  );
  const index=createProminenceIndex(model),a=index.metrics.get('a'),root=index.metrics.get('root');
  assert.equal(root.children,2);assert.equal(root.descendants,3);
  assert.equal(root.connections,0,'ownership and composition are not counted again as connection degree');
  assert.equal(a.children,1);assert.equal(a.descendants,1);assert.equal(a.connections,1);assert.equal(a.crossBranchConnections,1);
  const unique=graph(model.elements,[owner('root','a'),owner('root','b'),owner('a','leaf')],[connection('a','b')]);
  assert.deepEqual([...index.metrics],[...createProminenceIndex(unique).metrics]);
  assert.equal(createProminenceIndex(model),index,'default index is cached per immutable native graph snapshot');
  const scope=['root','a','b'],scoped=createProminenceIndex(model,{scopeIds:scope});
  assert.equal(createProminenceIndex(model,{scopeIds:scope}),scoped,'the same immutable native scope reuses its graph index');
  assert.notEqual(createProminenceIndex(model,{scopeIds:[...scope]}),scoped,'a new scope identity has its own index');
});
test('connections remain distinct from descendant prominence and count across native branches',()=>{
  const model=graph(
    ['root','a','b','aa','ab','ba'].map(id=>element(id,id==='root'?'Package':'PartUsage')),
    [owner('root','a'),owner('root','b'),owner('a','aa'),owner('a','ab'),owner('b','ba')],
    [connection('aa','ab','within'),connection('aa','ba','across')],
  );
  const metrics=createProminenceIndex(model).metrics;
  assert.equal(metrics.get('aa').connections,2);
  assert.equal(metrics.get('aa').crossBranchConnections,1);
  assert.equal(metrics.get('ab').crossBranchConnections,0);
  assert.ok(metrics.get('a').score>metrics.get('ab').score);
});
test('ranking and overview are invariant to native serialization order and preserve qname ties',()=>{
  const model=graph(
    [element('root','Package'),element('z','PartUsage',{qualifiedName:'A::native'}),element('a','PartUsage',{qualifiedName:'Z::native'}),element('child')],
    [owner('root','z'),owner('root','a'),owner('z','child')],
    [connection('z','a')],
  );
  const shuffled=graph([...model.elements].reverse(),[...model.containment].reverse(),[...model.relationships].reverse());
  assert.deepEqual([...createProminenceIndex(model).metrics],[...createProminenceIndex(shuffled).metrics]);
  assert.deepEqual(buildSystemOverview(model,{rootIds:['root']}),buildSystemOverview(shuffled,{rootIds:['root']}));
  const ties=createProminenceIndex(graph([model.elements[1],model.elements[2]]));
  assert.deepEqual(['a','z'].sort(ties.compare),['z','a']);
});
test('library, unnamed, view, metadata and relationship plumbing cannot inflate rankings or enter an overview',()=>{
  const excluded=[
    element('view','ViewUsage'),element('view-definition','ViewDefinition'),
    element('metadata','MetadataUsage'),element('metadata-definition','MetadataDefinition'),
    element('membership','FeatureMembership'),element('expression','OperatorExpression'),
    element('library','PartDefinition',{layer:'library'}),
    element('unnamed','PartUsage',{qualifiedName:undefined,native:{},name:'synthetic fallback'}),
  ];
  const model=graph([element('root','Package'),...excluded],excluded.map(item=>owner('root',item.id)),excluded.map(item=>connection('root',item.id)));
  const index=createProminenceIndex(model);
  assert.deepEqual([...index.metrics.keys()],['root']);assert.equal(index.metrics.get('root').children,0);assert.equal(index.metrics.get('root').connections,0);
  const overview=buildSystemOverview(model,{rootIds:['root']});
  assert.deepEqual(ids(overview),['root'],'a legitimate empty root is retained even when it owns only excluded helpers');
  assert.equal(overview.omissions.filter(item=>item.reason==='element-policy').length,7);
  assert.ok(overview.omissions.some(item=>item.target==='library'&&item.reason==='library'));
});
test('native declared names distinguish anonymous generated members from explicitly named unusual declarations',()=>{
  const model=graph([
    element('root','PartDefinition'),
    element('anonymous','PartUsage',{qualifiedName:'Model::root::@3',native:{},name:'Model::root::@3'}),
    element('quoted','PartUsage',{qualifiedName:"Model::root::'@3'",native:{declaredName:'@3'},name:'@3'}),
    element('short','PartUsage',{qualifiedName:'Model::root::short',native:{declaredShortName:'P-1'},name:'short'}),
  ],[owner('root','anonymous'),owner('root','quoted'),owner('root','short')]);
  const index=createProminenceIndex(model);
  assert.equal(index.metrics.has('anonymous'),false);
  assert.equal(index.metrics.has('quoted'),true,'an unusual explicit native name remains meaningful without a text heuristic');
  assert.equal(index.metrics.has('short'),true);
  assert.equal(index.metrics.get('root').children,2);
  const overview=buildSystemOverview(model,{rootIds:['root']});
  assert.deepEqual(new Set(ids(overview)),new Set(['root','quoted','short']));
  assert.ok(overview.omissions.some(item=>item.target==='anonymous'&&item.reason==='element-policy'));
});
test('scope follows native owner and composition edges, never qualified-name prefixes or generic graph reachability',()=>{
  const model=graph([
    element('root','Package',{qualifiedName:'Declared'}),
    element('inside','PartUsage',{qualifiedName:'Unrelated::label'}),
    element('composed','PartUsage'),
    element('outside','PartUsage',{qualifiedName:'Declared::LooksInside'}),
    element('not-owner','PartUsage'),
  ],[owner('root','inside'),owner('root','not-owner',{nativeRole:'not-an-owner'})],[
    connection('inside','composed','composition','composition'),connection('inside','outside'),
  ]);
  assert.deepEqual(nativeScopeIds(model,['root']),['composed','inside','root']);
  const index=createProminenceIndex(model,{scopeIds:nativeScopeIds(model,['root'])});
  assert.equal(index.metrics.has('outside'),false);assert.equal(index.metrics.get('inside').connections,0);
  const overview=buildSystemOverview(model,{rootIds:['root']});
  assert.deepEqual(new Set(ids(overview)),new Set(['inside','composed']));
  assert.ok(overview.omissions.some(item=>item.target==='root'&&item.reason==='package-wrapper'));
  assert.ok(overview.omissions.some(item=>item.target==='outside'&&item.reason==='outside-scope'));
  assert.equal(overview.relationships.some(edge=>edge.target==='outside'),false);
});
test('single-child package wrappers promote substantial owners but parts and actions stay visible',()=>{
  const model=graph(
    [element('outer','Package'),element('inner','Package'),element('system','PartDefinition'),element('action','ActionUsage'),element('step','ActionUsage')],
    [owner('outer','inner'),owner('inner','system'),owner('system','action'),owner('action','step')],
  );
  const overview=buildSystemOverview(model,{rootIds:['outer']});
  assert.equal(overview.focus,'system');assert.deepEqual(ids(overview),['system','action','step']);
  assert.deepEqual(overview.promotedRootIds,['system']);
  assert.equal(overview.omissions.filter(item=>item.reason==='package-wrapper').length,2);
  assert.deepEqual(ids(buildSystemOverview(model,{rootIds:['action']})),['action','step']);
});
test('disconnected roots receive representatives before extra children and deeper branches rotate fairly',()=>{
  const model=graph([
    element('rootA','Package'),element('rootB','Package'),
    ...['a','b','c','d','aa','ab','ac','ba'].map(id=>element(id)),
  ],[
    owner('rootA','a'),owner('rootA','b'),owner('rootB','c'),owner('rootB','d'),
    owner('a','aa'),owner('a','ab'),owner('a','ac'),owner('b','ba'),
  ]);
  const overview=buildSystemOverview(model,{rootIds:['rootB','rootA'],budget:4});
  assert.ok(ids(overview).includes('rootA')&&ids(overview).includes('rootB'));
  assert.ok(ids(overview).some(id=>['a','b'].includes(id)));
  assert.ok(ids(overview).some(id=>['c','d'].includes(id)));
  const branched=buildSystemOverview(model,{rootIds:['rootA'],budget:5});
  assert.ok(ids(branched).includes('a')&&ids(branched).includes('b'));
  assert.ok(ids(branched).includes('ba'),'a large first branch cannot consume every deeper slot');
  assert.equal(ids(branched).filter(id=>['aa','ab','ac'].includes(id)).length,1);
  assert.equal(overview.summary.shownRoots,2);
});
test('multiple roots leave spare budget unused when a complete child round cannot fit',()=>{
  const roots=Array.from({length:7},(_,i)=>`root-${i}`);
  const model=graph(
    [...roots.map(id=>element(id,'PartDefinition')),...roots.flatMap(root=>[element(`${root}-a`),element(`${root}-b`),element(`${root}-deep`)])],
    roots.flatMap(root=>[owner(root,`${root}-a`),owner(root,`${root}-b`),owner(`${root}-a`,`${root}-deep`)]),
  );
  const overview=buildSystemOverview(model,{rootIds:roots,budget:9});
  assert.deepEqual(new Set(ids(overview)),new Set(roots));
  assert.equal(overview.elements.length,7,'two spare slots do not privilege the first two roots');
  assert.equal(overview.summary.shownRoots,7);
  assert.equal(overview.omissions.filter(item=>item.reason==='budget').length,21);
  const pair=buildSystemOverview(model,{rootIds:roots.slice(0,2),budget:5});
  assert.equal(pair.elements.length,4,'two roots plus one complete child round; the fifth slot remains unused');
  for(const root of roots.slice(0,2)) {
    assert.ok(ids(pair).includes(root));
    assert.equal(ids(pair).filter(id=>model.containment.some(edge=>edge.source===root&&edge.target===id)).length,1);
  }
  assert.equal(ids(pair).some(id=>id.endsWith('-deep')),false,'deeper descendants cannot consume an incomplete direct-child round');
  const before=structuredClone(model);
  assert.deepEqual(overview,buildSystemOverview(graph([...model.elements].reverse(),[...model.containment].reverse()),{rootIds:[...roots].reverse(),budget:9}));
  assert.deepEqual(model,before);
});
test('output snapshots preserve native direction and occurrences without fabricated aggregation links or source mutation',()=>{
  const model=graph(
    [element('root','PartDefinition'),element('a'),element('b')],
    [owner('root','a'),owner('root','b')],
    [connection('root','a','composition','composition'),connection('b','a','first','satisfy'),connection('b','a','second','satisfy')],
  ),before=structuredClone(model),overview=buildSystemOverview(model,{rootIds:['root']});
  const nativeKeys=new Set([...model.relationships,...model.containment].map(edge=>edge.id));
  assert.ok(overview.relationships.every(edge=>nativeKeys.has(edge.id)));
  assert.equal(overview.relationships.filter(edge=>edge.source==='root'&&edge.target==='a').length,1,'composition and owner overlap share one visible structural link');
  assert.deepEqual(overview.relationships.filter(edge=>edge.kind==='satisfy').map(edge=>[edge.id,edge.source,edge.target]),[['first','b','a'],['second','b','a']]);
  overview.elements[0].native.declaredName='changed';overview.relationships[0].label='changed';overview.metrics.get('root').children=99;
  assert.deepEqual(model,before);
});
test('budgets are capped at ten and every omitted native candidate remains disclosed',()=>{
  const children=Array.from({length:24},(_,i)=>`child-${i}`);
  const model=graph([element('root','PartDefinition'),...children.map(id=>element(id))],children.map(id=>owner('root',id)));
  const overview=buildSystemOverview(model,{rootIds:['root'],budget:900});
  assert.equal(overview.elements.length,10);assert.equal(overview.budget,10);assert.equal(overview.summary.shown,10);assert.equal(overview.summary.total,25);
  assert.equal(overview.omissions.filter(item=>item.reason==='budget').length,15);
  assert.match(overview.summary.message,/loaded native scope/);
  const empty=buildSystemOverview(model,{rootIds:['root'],budget:0});
  assert.equal(empty.focus,null);assert.deepEqual(empty.elements,[]);
  assert.throws(()=>buildSystemOverview(model,{budget:1.5}),/budget/);
  assert.throws(()=>buildSystemOverview(model,{budget:-1}),/budget/);
});
test('native cycles and unavailable roots terminate with explicit omissions',()=>{
  const model=graph(['a','b','c'].map(id=>element(id,'Package')),[owner('a','b'),owner('b','c'),owner('c','a'),owner('c','missing')]);
  const index=createProminenceIndex(model);
  for(const metric of index.metrics.values()){assert.equal(metric.descendants,2);assert.equal(metric.descendantsCapped,false);}
  const overview=buildSystemOverview(model,{rootIds:['a','unknown']});
  assert.ok(overview.elements.length>0&&overview.elements.length<=3);
  assert.ok(overview.omissions.some(item=>item.target==='unknown'&&item.reason==='unavailable-root'));
  assert.ok(overview.omissions.some(item=>item.target==='missing'&&item.reason==='unavailable'));
  assert.ok(ids(overview).includes(overview.focus));
  const inferred=buildSystemOverview(model);assert.ok(inferred.elements.length>0);
});
test('13,000-element deep models use bounded descendant counts without recursion or quadratic closure', {timeout:12000}, t=>{
  const size=13000,model=graph(
    Array.from({length:size},(_,i)=>element(`node-${String(i).padStart(5,'0')}`,'PartDefinition')),
    Array.from({length:size-1},(_,i)=>owner(`node-${String(i).padStart(5,'0')}`,`node-${String(i+1).padStart(5,'0')}`)),
  );
  const started=performance.now(),index=createProminenceIndex(model),overview=buildSystemOverview(model,{rootIds:['node-00000']});
  assert.equal(index.metrics.get('node-00000').descendants,256);assert.equal(index.metrics.get('node-00000').descendantsCapped,true);
  assert.equal(index.metrics.get('node-12999').descendants,0);assert.equal(index.metrics.get('node-12999').descendantsCapped,false);
  assert.equal(overview.elements.length,9);assert.equal(overview.summary.total,size);assert.equal(overview.summary.descendantsCapped,true);
  assert.match(overview.summary.message,/capped counts are lower bounds/);
  assert.equal(overview.relationships.length,8);assert.equal(overview.focus,'node-00000');
  t.diagnostic(`13,000 native declarations indexed and overview selected in ${Math.round(performance.now()-started)} ms`);
});
