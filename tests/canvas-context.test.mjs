import test from 'node:test';
import assert from 'node:assert/strict';
import {surroundingContext,positionSurrounding} from '../src/canvas-prototype/context.mjs';
const element=(id,kind='RequirementUsage',extra={})=>({id,kind,name:id,layer:'project',native:{declaredName:extra.name??id},description:'Full documentation must not clutter peripheral context',...extra});
const edge=(id,source,target,kind='derive')=>({id,source,target,kind,label:kind,authority:'native-api'});
const view={id:'native.requirements',kind:'requirement',nodes:[{id:'drawing:a',semanticId:'a',name:'A'},{id:'drawing:b',semanticId:'b',name:'B'}],edges:[{id:'native:ab',source:'drawing:a',target:'drawing:b',kind:'derive'}]};

test('surrounding context preserves the full active view and native edge direction',()=>{
 const graph={elements:['a','b','c','d'].map(id=>element(id)),relationships:[edge('ca','c','a'),edge('bd','b','d','verify'),edge('ab','a','b')]};
 const before=structuredClone({graph,view}),context=surroundingContext(graph,view);
 assert.equal(context.activeView,view);assert.equal(context.activeNodes,view.nodes);assert.equal(context.activeEdges,view.edges);
 assert.deepEqual(context.activeIds,['a','b']);assert.deepEqual(context.elements.map(e=>e.id),['c','d']);
 assert.deepEqual(context.view.edges.map(e=>[e.semanticSource,e.semanticTarget,e.source,e.target]),[
  ['b','d','drawing:b','context:native.requirements:d'],['c','a','context:native.requirements:c','drawing:a']]);
 assert.ok(context.view.nodes.every(n=>n.fit===false&&n.context&&n.parentId===null&&n.detail===''&&n.type===''));
 assert.ok(context.view.edges.every(e=>e.notation==='general'&&e.fit===false));
 assert.deepEqual({graph,view},before);
});

test('invalid typing, arbitrary ownership and source plumbing never become surrounding system connections',()=>{
 const graph={elements:[element('a'),element('b'),element('type'),element('doc','Documentation'),element('meta','PartDefinition',{layer:'metamodel'}),element('outside')],relationships:[edge('t','a','type','typing'),edge('o','a','doc','ownership'),edge('d','a','doc','dependency'),edge('m','a','meta','dependency'),edge('s','a','outside','dependency'),edge('missing','a','absent','dependency')]};
 const context=surroundingContext(graph,view,{scopeIds:['a','b','type','doc','meta']});
 assert.equal(context.elements.length,0);
 assert.deepEqual(context.omissions.map(o=>[o.relationshipId,o.reason]).sort(),[
  ['d','element-policy'],['m','metamodel-boundary'],['missing','unavailable'],['o','relationship-policy'],['s','outside-scope'],['t','relationship-policy']].sort());
 assert.equal(context.boundary.omitted,6);
 assert.equal(context.boundary.byReason['relationship-policy'],2);
});

test('the node budget is deterministic, fair across active nodes and excludes active elements',()=>{
 const graph={elements:['a','b','c1','c2','c3','z'].map(id=>element(id)),relationships:[edge('ac1','a','c1'),edge('ac2','a','c2'),edge('ac3','a','c3'),edge('bz','b','z')]};
 const context=surroundingContext(graph,view,{budget:2});
 assert.deepEqual(context.elements.map(e=>e.id),['c1','z']);
 assert.equal(context.activeNodes.length,2);assert.equal(context.boundary.shown,2);
 assert.deepEqual(context.omissions.filter(o=>o.reason==='budget').map(o=>o.target),['c2','c3']);
 const reverse=surroundingContext({elements:[...graph.elements].reverse(),relationships:[...graph.relationships].reverse()},{...view,nodes:[...view.nodes].reverse()},{budget:2});
 assert.deepEqual(reverse.elements,context.elements);assert.deepEqual(reverse.view.edges,context.view.edges);
});

test('second-hop links are disclosed without recursively expanding the context',()=>{
 const graph={elements:['a','b','c','d'].map(id=>element(id)),relationships:[edge('ac','a','c'),edge('cd','c','d','dependency')]};
 const context=surroundingContext(graph,view,{budget:8});
 assert.deepEqual(context.elements.map(e=>e.id),['c']);
 assert.deepEqual(context.relationships.map(e=>e.id),['ac']);
 assert.deepEqual(context.omissions,[{relationshipId:'cd',target:'d',anchor:'c',reason:'depth'}]);
 assert.equal(context.boundary.depth,1);
});

test('activity context retains its general-view identity and cannot invent sequence edges',()=>{
 const activity={id:'native.activity',kind:'action',nodes:[{id:'container',semanticId:'a',kind:'action'},{id:'synthetic-start',identityStatus:'synthetic',kind:'initial'}],edges:[]};
 const graph={elements:[element('a','ActionUsage'),element('requirement'),element('next','ActionUsage')],relationships:[edge('r','a','requirement','dependency'),edge('seq','a','next','succession')]};
 const context=surroundingContext(graph,activity,{relationshipKinds:['dependency','succession']});
 assert.equal(context.activeView.kind,'action');assert.equal(context.view.kind,'general');
 assert.equal(context.view.nodes[0].parentId,null);assert.equal(context.view.edges[0].kind,'dependency');
 assert.deepEqual(context.view.edges.map(e=>e.id),['context:r']);
 assert.equal(context.omissions.find(o=>o.relationshipId==='seq').reason,'relationship-policy');
});

test('zero budget and duplicate semantic representations remain explicit and stable',()=>{
 const repeated={...view,nodes:[...view.nodes,{id:'aaa',semanticId:'a'}]};
 const graph={elements:['a','b','c'].map(id=>element(id)),relationships:[edge('ac','a','c'),edge('bc','b','c')]};
 assert.equal(surroundingContext(graph,repeated).view.edges.find(e=>e.semanticSource==='a').source,'aaa');
 const empty=surroundingContext(graph,repeated,{budget:0});assert.equal(empty.view.nodes.length,0);assert.equal(empty.view.edges.length,0);
 assert.equal(empty.omissions.filter(o=>o.reason==='budget').length,2);
 assert.throws(()=>surroundingContext(graph,repeated,{budget:-1}),/budget/);
 assert.throws(()=>surroundingContext(graph,repeated,{budget:1.5}),/budget/);
});


test('peripheral geometry avoids active cards, remains within the available area and leaves active fit unchanged',()=>{
 const graph={elements:['a','b','c','d'].map(id=>element(id)),relationships:[edge('ac','a','c'),edge('bd','b','d')]};
 const context=surroundingContext(graph,view),active=[{...view.nodes[0],x:220,y:100,width:160,height:100},{...view.nodes[1],x:220,y:250,width:160,height:100}],original=structuredClone(active),area={x:0,y:0,width:600,height:450};
 const placed=positionSurrounding(context,active,area);
 assert.equal(placed.nodes.length,2);assert.equal(placed.boundaryMarkers.length,0);assert.deepEqual(active,original);
 const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
 for(const node of placed.nodes){assert.ok(node.x>=0&&node.y>=0&&node.x+node.width<=600&&node.y+node.height<=450);assert.ok(active.every(a=>!overlaps(a,node)));assert.equal(node.fit,false);}
 assert.ok(!overlaps(...placed.nodes));assert.equal(placed.edges,context.view.edges);
});

test('insufficient context space retains true connections at explicit boundary markers',()=>{
 const graph={elements:['a','b','c'].map(id=>element(id)),relationships:[edge('ca','c','a')]},context=surroundingContext(graph,view);
 const active=[{id:'drawing:a',x:0,y:0,width:160,height:100}],area={x:0,y:0,width:160,height:100};
 const placed=positionSurrounding(context,active,area);
 assert.equal(placed.nodes.length,0);assert.equal(placed.boundaryMarkers.length,1);
 const marker=placed.boundaryMarkers[0];assert.equal(marker.semanticId,'c');assert.equal(marker.id,placed.edges[0].source);assert.equal(placed.edges[0].target,'drawing:a');
 assert.equal(marker.interactive,false);assert.equal(marker.fit,false);assert.ok(marker.x===0||marker.x===160||marker.y===0||marker.y===100);
 assert.equal(placed.omissions.find(o=>o.reason==='context-space').target,'c');
 assert.equal(placed.boundary.byReason['context-space'],1);
 assert.throws(()=>positionSurrounding(context,active,{x:0,y:0,width:0,height:100}),/geometry/);
});


test('bounded context prioritizes explicit trace kinds over generic dependencies and retains links among chosen neighbors',()=>{
 const graph={elements:['a','b','aaa-dependency','verification','derived'].map(id=>element(id)),relationships:[edge('dependency','a','aaa-dependency','dependency'),edge('verify','verification','a','verify'),edge('derive','derived','a','derive'),edge('context-link','derived','verification','dependency')]};
 const context=surroundingContext(graph,view,{budget:2});
 assert.deepEqual(context.elements.map(e=>e.id),['derived','verification']);
 assert.ok(context.relationships.some(e=>e.id==='context-link'));
 assert.equal(context.omissions.find(o=>o.relationshipId==='dependency').reason,'budget');
});


test('prepared context includes more neighbors by default without recursive expansion',()=>{
 const graph={elements:[element('a'),...Array.from({length:60},(_,i)=>element(`n${String(i).padStart(2,'0')}`))],relationships:Array.from({length:60},(_,i)=>edge(`r${i}`,'a',`n${String(i).padStart(2,'0')}`))};
 const context=surroundingContext(graph,{id:'v',nodes:[{id:'A',semanticId:'a'}],edges:[]});
 assert.equal(context.elements.length,48);assert.equal(context.boundary.budget,48);assert.equal(context.boundary.byReason.budget,12);
});

test('parts prioritize composition and direct native type while packages expose declared ownership distinctly',()=>{
 const graph={elements:[element('part','PartUsage'),element('child','PartUsage'),element('type','PartDefinition'),element('req'),element('pkg','Package'),element('nested','Package')],relationships:[edge('req','part','req','satisfy'),edge('type','part','type','typing'),edge('child','part','child','composition')],containment:[{...edge('owner','pkg','part','containment'),nativeRole:'owner'},{...edge('nested','pkg','nested','containment'),nativeRole:'owner'}]};
 const part=surroundingContext(graph,{id:'part',nodes:[{id:'p',semanticId:'part'}],edges:[]},{budget:2});
 assert.deepEqual(part.elements.map(e=>e.id),['child','pkg']);
 const all=surroundingContext(graph,{id:'part',nodes:[{id:'p',semanticId:'part'}],edges:[]});
 assert.ok(all.relationships.some(e=>e.kind==='typing'&&e.target==='type'));
 const pkg=surroundingContext(graph,{id:'pkg',nodes:[{id:'p',semanticId:'pkg'}],edges:[]});
 assert.deepEqual(new Set(pkg.elements.map(e=>e.id)),new Set(['part','nested']));
 assert.ok(pkg.relationships.every(e=>e.kind==='containment'&&e.nativeRole==='owner'));
});

test('context focus gets first choice, with stable names and balanced other anchors',()=>{
 const graph={elements:[element('a'),element('b'),element('id-z','RequirementUsage',{name:'Alpha'}),element('id-a','RequirementUsage',{name:'Zulu'}),element('from-b')],relationships:[edge('a1','a','id-a'),edge('a2','a','id-z'),edge('b1','b','from-b')]};
 const context=surroundingContext(graph,view,{budget:2,focusId:'b'});
 assert.deepEqual(context.elements.map(e=>e.id),['from-b','id-z']);
});

test('native ownership only exposes package declarations, without inferred qname links',()=>{
 const graph={elements:[element('pkg','Package'),element('child','PartDefinition'),element('fake','PartDefinition',{qualifiedName:'pkg::fake'})],relationships:[edge('arbitrary','pkg','fake','containment')],containment:[{...edge('native','pkg','child','containment'),nativeRole:'owner'}]};
 const result=surroundingContext(graph,{nodes:[{id:'p',semanticId:'pkg'}]});
 assert.deepEqual(result.elements.map(e=>e.id),['child']);
 assert.equal(result.omissions.find(o=>o.relationshipId==='arbitrary').reason,'relationship-policy');
});


test('native package declaration context includes enum and concern but ownership does not crowd requirement traces',()=>{
 const graph={elements:[element('pkg','Package'),element('enum','EnumerationDefinition'),element('concern','ConcernUsage'),element('view','ViewDefinition'),element('meta','MetadataUsage'),element('req')],relationships:[],containment:['enum','concern','view','meta','req'].map(id=>({...edge('o:'+id,'pkg',id,'containment'),nativeRole:'owner'}))};
 const pkg=surroundingContext(graph,{nodes:[{id:'p',semanticId:'pkg'}]});
 assert.deepEqual(new Set(pkg.elements.map(e=>e.id)),new Set(['enum','concern','view','meta','req']));
 const req=surroundingContext(graph,{nodes:[{id:'r',semanticId:'req'}]});
 assert.equal(req.elements.length,0);assert.equal(req.omissions[0].reason,'relationship-policy');
 const explicit=surroundingContext(graph,{nodes:[{id:'r',semanticId:'req'}]},{relationshipKinds:['containment']});
 assert.deepEqual(explicit.elements.map(e=>e.id),['pkg']);
});

test('peripheral prominence favors rich neighbors while preserving focus and round-robin fairness',()=>{
 const graph={elements:['a','b','alpha','zulu','from-b','child1','child2'].map(id=>element(id)),
  relationships:[edge('a1','a','alpha'),edge('a2','a','zulu'),edge('b1','b','from-b'),edge('c1','zulu','child1','composition'),edge('c2','zulu','child2','composition')]};
 const context=surroundingContext(graph,view,{budget:2,focusId:'a'});
 assert.deepEqual(context.elements.map(e=>e.id),['zulu','from-b']);
 assert.deepEqual(context.relationships.map(e=>[e.source,e.target]),[['a','zulu'],['b','from-b']]);
 assert.ok(context.omissions.some(o=>o.target==='alpha'&&o.reason==='budget'));
 assert.ok(context.omissions.some(o=>o.target==='child1'&&o.reason==='depth'));
 assert.deepEqual(surroundingContext({...graph,elements:[...graph.elements].reverse(),relationships:[...graph.relationships].reverse()},view,{budget:2,focusId:'a'}).elements,context.elements);
});

test('native trace priority outranks prominence and duplicate relationships retain identity',()=>{
 const graph={elements:['a','b','z-trace','alpha-hub','child1','child2'].map(id=>element(id)),
  relationships:[edge('native1','z-trace','a'),edge('native2','z-trace','a'),edge('dep','a','alpha-hub','dependency'),edge('c1','alpha-hub','child1','composition'),edge('c2','alpha-hub','child2','composition')]};
 const context=surroundingContext(graph,view,{budget:1,focusId:'a'});
 assert.deepEqual(context.elements.map(e=>e.id),['z-trace']);
 assert.deepEqual(context.relationships.map(e=>[e.id,e.source,e.target]),[['native1','z-trace','a'],['native2','z-trace','a']]);
 assert.ok(context.omissions.some(o=>o.relationshipId==='dep'&&o.reason==='budget'));
});

test('peripheral ranking measures only explicit scope without allowing library hubs to monopolize it',()=>{
 const graph={elements:[...['a','b','alpha','zulu','outside1','outside2'].map(id=>element(id)),element('library','RequirementUsage',{layer:'library'})],
  relationships:[edge('a1','a','alpha'),edge('a2','a','zulu'),edge('l','a','library'),edge('c1','zulu','outside1','composition'),edge('c2','zulu','outside2','composition'),edge('l1','library','outside1','dependency'),edge('l2','library','outside2','dependency')]};
 const scoped=surroundingContext(graph,view,{budget:1,focusId:'a',scopeIds:['a','b','alpha','zulu','library']});
 assert.deepEqual(scoped.elements.map(e=>e.id),['alpha']);
 const unscoped=surroundingContext(graph,view,{budget:1,focusId:'a'});
 assert.deepEqual(unscoped.elements.map(e=>e.id),['zulu']);
});

test('peripheral rank scope keeps native cross-system neighbors available',()=>{
 const graph={elements:['a','b','alpha','outside'].map(id=>element(id)),relationships:[edge('a1','a','alpha'),edge('outside','outside','a')]};
 const context=surroundingContext(graph,view,{budget:2,focusId:'a',prominenceScopeIds:['a','b','alpha']});
 assert.deepEqual(context.elements.map(e=>e.id),['alpha','outside']);
 assert.deepEqual(context.relationships.map(e=>[e.id,e.source,e.target]),[['a1','a','alpha'],['outside','outside','a']]);
 assert.ok(!context.omissions.some(o=>o.reason==='outside-scope'));
});
