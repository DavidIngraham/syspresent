import test from 'node:test';
import assert from 'node:assert/strict';
import {engineeringContext,findEngineeringRoute,directTypingContext,projectView,layoutScene,planTransition} from '../src/canvas-prototype/core/index.mjs';
const graph={elements:[{id:'system',name:'System',kind:'part'},{id:'need',name:'Need',kind:'requirement'},{id:'derived',name:'Derived',kind:'requirement'},{id:'part',kind:'part'},{id:'test',kind:'verification'},{id:'classifier',kind:'definition'},{id:'other',kind:'part'},{id:'doc',kind:'documentation'},{id:'base',layer:'metamodel',kind:'definition'}],relationships:[
 {id:'derive',source:'derived',target:'need',kind:'derive',rationale:'Native rationale'},
 {id:'satisfy',source:'part',target:'derived',kind:'satisfy'},
 {id:'verify',source:'test',target:'derived',kind:'verify'},
 {id:'owned',source:'system',target:'part',kind:'composition'},
 {id:'type-a',source:'part',target:'classifier',kind:'typing'},
 {id:'type-b',source:'other',target:'classifier',kind:'typing'},
 {id:'doc-link',source:'need',target:'doc',kind:'documentation'},
 {id:'kernel-link',source:'other',target:'base',kind:'reference'},
 {id:'missing',source:'need',target:'unexported',kind:'derive'}
]};
const freeze=value=>{if(value&&typeof value==='object'){Object.values(value).forEach(freeze);Object.freeze(value);}return value;};
const overlaps=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;

test('engineering traversal follows actual native edge direction without treating satisfaction as evidence',()=>{
 const context=engineeringContext(graph,{focus:'need',depth:2});
 assert.deepEqual(new Set(context.elements.map(element=>element.id)),new Set(['need','derived','part','test']));
 assert.equal(context.relationships.find(edge=>edge.id==='satisfy').source,'part');
 assert.equal(context.relationships.find(edge=>edge.id==='satisfy').verdict,undefined);
 const route=findEngineeringRoute(graph,{from:'need',to:'part'});
 assert.equal(route.found,true);
 assert.deepEqual(route.relationships.map(edge=>[edge.source,edge.target]),[['derived','need'],['part','derived']]);
});

test('route search cannot wormhole through shared classifiers, documentation, or metamodels',()=>{
 assert.equal(findEngineeringRoute(graph,{from:'part',to:'other'}).found,false);
 assert.equal(findEngineeringRoute(graph,{from:'need',to:'doc',relationshipKinds:['documentation']}).found,false);
 assert.equal(findEngineeringRoute(graph,{from:'other',to:'base'}).omissions[0].reason,'metamodel-boundary');
 const direct=directTypingContext(graph,'part');
 assert.deepEqual(direct.elements.map(element=>element.id),['part','classifier']);
 assert.ok(!direct.elements.some(element=>element.id==='other'));
});

test('scope extensions are explicit and all unavailable, bounded and filtered context is disclosed',()=>{
 const scoped=engineeringContext(graph,{focus:'need',depth:3,scopeIds:['need','derived']});
 assert.ok(scoped.omissions.some(value=>value.target==='part'&&value.reason==='outside-scope'));
 assert.ok(scoped.omissions.some(value=>value.target==='unexported'&&value.reason==='unavailable'));
 assert.ok(scoped.omissions.some(value=>value.target==='doc'&&value.reason==='relationship-policy'));
 const extension=findEngineeringRoute(graph,{from:'need',to:'part',scopeIds:['need','derived'],includedIds:['part']});
 assert.equal(extension.found,true);
 assert.ok(engineeringContext(graph,{focus:'need',budget:1}).omissions.some(value=>value.reason==='budget'));
 assert.ok(engineeringContext(graph,{focus:'need',depth:0}).omissions.some(value=>value.reason==='depth'));
});

test('native projection keeps distinct representations, ports, guarded activity edges and authoritative semantic IDs',()=>{
 const native=freeze({id:'activity',kind:'activity',nodes:[{id:'left',semanticId:'same',label:'Sense',parent:null},{id:'right',semanticId:'same',label:'Sense again'},{id:'port',semanticId:'signal',parent:'right',kind:'port'}],edges:[{fromId:'left',toId:'port',kind:'control-flow',guard:'[valid]',order:2,concurrent:true}]});
 const projected=projectView(native);
 assert.equal(projected.nodes[0].semanticId,projected.nodes[1].semanticId);
 assert.notEqual(projected.nodes[0].id,projected.nodes[1].id);
 assert.equal(projected.nodes[2].parentId,'right');
 assert.equal(projected.edges[0].target,'port');
 assert.equal(projected.edges[0].guard,'[valid]');
 assert.equal(projected.edges[0].concurrent,true);
 assert.throws(()=>projectView({nodes:[{id:'a'},{id:'a'}]}),/Duplicate/);
 assert.throws(()=>projectView({nodes:[{id:'a'}],edges:[{from:'a',to:'missing'}]}),/unavailable/);
 assert.equal(projectView({nodes:[{id:'unmapped',label:'Looks like a model name'}]}).nodes[0].semanticId,null);
});

const generalView={id:'requirements',kind:'requirement',nodes:[{id:'child',semanticId:'derived',label:'Derived requirement'},{id:'parent',semanticId:'need',label:'Original requirement'}],edges:[{id:'derivation',source:'child',target:'parent',kind:'derive'}]};
test('general-to-specific geometry preserves the native upward derivation arrow',()=>{
 const result=layoutScene(generalView,{width:900,height:600});
 const child=result.nodes.find(node=>node.id==='child'),parent=result.nodes.find(node=>node.id==='parent');
 assert.ok(parent.y<child.y);
 assert.equal(result.edges[0].source,'child');
 assert.equal(result.edges[0].target,'parent');
});

test('desktop and narrow layouts reserve measured narrative panels without node overlap',()=>{
 const view={id:'flat',kind:'gv',nodes:['a','b','c','d'].map(id=>({id,semanticId:id,label:id})),edges:[]};
 for(const options of [{width:1100,height:700,panels:[{id:'prose',x:760,y:20,width:320,height:580}]},{width:420,height:760,panels:[{id:'prose',x:20,y:560,width:380,height:180}]}]){
  const result=layoutScene(view,options);
  for(const node of result.nodes){assert.ok(node.x>=0&&node.y>=0);assert.ok(node.x+node.width<=options.width);assert.ok(node.y+node.height<=options.height);for(const panel of options.panels)assert.equal(overlaps(node,panel),false);}
  for(let i=0;i<result.nodes.length;i++)for(let j=i+1;j<result.nodes.length;j++)assert.equal(overlaps(result.nodes[i],result.nodes[j]),false);
  assert.deepEqual(result.omissions,[]);
 }
});

test('internal features remain inside their native owner and outside unrelated components',()=>{
 const source={id:'internal',kind:'interconnection',nodes:[{id:'box',semanticId:'part',label:'Assembly'},{id:'port',parentId:'box',semanticId:'port',label:'Input',kind:'port'},{id:'peer',semanticId:'peer',label:'External component'}],edges:[{id:'wire',from:'port',to:'peer',kind:'connection',itemType:'Signal'}]};
 const result=layoutScene(source,{width:900,height:700,panels:[{x:600,y:20,width:280,height:500}]});
 const [box,port,peer]=['box','port','peer'].map(id=>result.nodes.find(node=>node.id===id));
 assert.ok(port.x>box.x&&port.y>box.y&&port.x+port.width<box.x+box.width&&port.y+port.height<box.y+box.height);
 assert.equal(overlaps(box,peer),false);
 assert.equal(result.edges[0].itemType,'Signal');
 assert.deepEqual(source.nodes.map(node=>node.x),[undefined,undefined,undefined]);
});

test('activity cycles remain present without fabricating a topological ordering, and tiny viewports disclose overflow',()=>{
 const view={id:'loop',kind:'activity',nodes:[{id:'a',semanticId:'a'},{id:'b',semanticId:'b'}],edges:[{source:'a',target:'b',kind:'control-flow',guard:'[continue]'},{source:'b',target:'a',kind:'control-flow',guard:'[retry]'}]};
 const result=layoutScene(view,{width:240,height:100});
 assert.equal(result.edges.length,2);
 assert.deepEqual(result.edges.map(edge=>edge.guard),['[continue]','[retry]']);
 assert.ok(result.omissions.some(value=>value.reason==='layout-overflow'));
 assert.throws(()=>layoutScene({nodes:[{id:'a',parent:'b'},{id:'b',parent:'a'}]},{width:100,height:100}),/Cyclic/);
});

test('same-kind transitions reflow directly while cross-kind transitions gather in a GV before morphing',()=>{
 const next={id:'operation',kind:'activity',nodes:[{id:'action',semanticId:'part'},{id:'r',semanticId:'derived'}],edges:[]};
 const from={view:generalView,focus:'need'},to={view:next,focus:'part'};
 const transition=planTransition(from,to,{graph});
 assert.equal(transition.mode,'cross-kind');
 assert.deepEqual(transition.stages.map(stage=>stage.kind),['gv-bridge','gv-journey','gv-gather','morph']);
 assert.equal(transition.route.found,true);
 assert.deepEqual(transition.stages[2].semanticIds,['part','derived']);
 assert.deepEqual(transition.correspondence,[{semanticId:'derived',fromRepresentationIds:['child'],toRepresentationIds:['r']}]);
 assert.deepEqual(planTransition(from,{view:{...generalView,id:'other'}}).stages.map(stage=>stage.kind),['reflow']);
 const reduced=planTransition(from,to,{graph,reducedMotion:true});
 assert.ok(reduced.stages.every(stage=>stage.duration===0));
 assert.deepEqual(reduced.stages.map(stage=>stage.semanticIds),transition.stages.map(stage=>stage.semanticIds));
});

test('immutable native payloads survive context, route, layout and transition planning unchanged',()=>{
 const source=freeze(structuredClone(graph)),view=freeze(structuredClone(generalView));const before=JSON.stringify({source,view});
 engineeringContext(source,{focus:'need'});findEngineeringRoute(source,{from:'need',to:'part'});layoutScene(view);planTransition(view,{...view,kind:'activity'},{graph:source});
 assert.equal(JSON.stringify({source,view}),before);
});

test('activity containment uses native succession ranks to show parallel branches and a later join',()=>{
 const nodes=[{id:'operation',semanticId:'operation',kind:'action',label:'Operate lamp'},
  {id:'join',kind:'join',parentId:'operation'},
  {id:'temperature',kind:'action',label:'Check temperature',parentId:'operation'},
  {id:'fork',kind:'fork',parentId:'operation'},
  {id:'initial',kind:'initial',parentId:'operation'},
  {id:'supply',kind:'action',label:'Supply power',parentId:'operation'},
  {id:'enable',kind:'action',label:'Enable lamp',parentId:'operation'},
  {id:'finish',kind:'final',parentId:'operation'}];
 const edges=[['initial','fork'],['fork','temperature'],['fork','supply'],['temperature','join'],['supply','join'],['join','enable'],['enable','finish']].map(([source,target])=>({source,target,kind:'succession'}));
 const result=layoutScene({kind:'action',nodes,edges},{width:1100,height:700,panels:[{id:'prose',x:760,y:20,width:320,height:580}]});
 const byId=Object.fromEntries(result.nodes.map(node=>[node.id,node]));
 assert.equal(byId.temperature.y,byId.supply.y);
 assert.notEqual(byId.temperature.x,byId.supply.x);
 assert.ok(byId.fork.y<byId.temperature.y);
 assert.ok(byId.join.y>byId.temperature.y+byId.temperature.height);
 assert.ok(byId.enable.y>byId.join.y);
 assert.ok(byId.finish.y>byId.enable.y);
 assert.equal(byId.fork.height,24);
 assert.deepEqual(result.omissions,[]);
 for(const node of result.nodes)for(const panel of result.panels)assert.equal(overlaps(node,panel),false);
});
