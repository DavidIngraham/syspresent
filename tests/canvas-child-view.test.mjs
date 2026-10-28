import test from 'node:test';
import assert from 'node:assert/strict';
import {completeChildContext,completeRootContext} from '../src/canvas-prototype/child-exploration.mjs';
import {completeChildView} from '../src/canvas-prototype/child-view.mjs';

const declaration=(id,kind='PartUsage',extra={})=>({id,kind,name:id,qualifiedName:'Model::'+id,layer:'project',native:{declaredName:id,'sysx:sourceLine':1},...extra});
const owner=(source,target)=>({id:'owner:'+source+':'+target,source,target,kind:'containment',nativeRole:'owner',navigationOnly:true,authority:'native-api',nativeRelationship:'membership:'+target});
const relation=(id,source,target,kind='connection')=>({id,source,target,kind,label:kind,authority:'native-api',nativeRelationship:'native:'+id,occurrences:[{id:'occurrence:'+id,nativeEdge:{semanticId:'native:'+id}}]});
const fixture=count=>{
 const children=Array.from({length:count},(_,i)=>declaration('child-'+String(i).padStart(4,'0'),i%2?'AttributeUsage':'PartUsage'));
 return {elements:[declaration('root','Package'),...children],containment:children.map(child=>owner('root',child.id)),relationships:[]};
};
const freeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;};

for(const count of [0,1,5,6,128,513])test('complete child cards preserve all '+count+' immediate siblings with exact native identities',()=>{
 const graph=fixture(count),context=completeChildContext(graph,{focus:'root',budget:1,page:99}),before=structuredClone({graph,context});
 freeze(graph);freeze(context);
 const view=completeChildView(graph,context,'Contents');
 assert.equal(view.nodes.length,count+1);
 assert.deepEqual(view.nodes.map(node=>node.semanticId),context.elements.map(element=>element.id));
 assert.deepEqual(new Set(view.nodes.map(node=>node.id)),new Set(context.elements.map(element=>'gv:'+element.id)));
 assert.deepEqual(new Set(view.childProjection.childIds),new Set(graph.elements.slice(1).map(element=>element.id)));
 assert.equal(view.edges.length,count);
 assert.equal(view.childProjection.complete,true);
 assert.equal(view.nodes.find(node=>node.semanticId==='root').overviewLabel,count?count+' immediate declarations':undefined);
 assert.ok(view.nodes.every(node=>node.childDeclaration));
 assert.deepEqual({graph,context},before);
});

test('native declaration kinds remain full cards including ports, attributes, internal parts and unnamed declarations',()=>{
 const kinds=['PortUsage','PortDefinition','AttributeUsage','AttributeDefinition','PartUsage','PartDefinition','ActionUsage','ActionDefinition','StateUsage','StateDefinition','ConnectionUsage','FlowUsage','MetadataUsage','ViewDefinition'];
 const children=kinds.map(kind=>declaration(kind,kind));
 children.push(declaration('anonymous','AttributeUsage',{name:'Model::root::@17',qualifiedName:'Model::root::@17',native:{'sysx:sourceLine':17}}));
 children.push(declaration('short-name','PortUsage',{name:'P',native:{declaredShortName:'P','sysx:sourceLine':18}}));
 const graph={elements:[declaration('root','Package'),...children],containment:children.map(child=>owner('root',child.id)),relationships:[]};
 const context=completeChildContext(graph,{focus:'root'}),view=completeChildView(graph,context);
 for(const original of graph.elements){
  const card=view.nodes.find(node=>node.semanticId===original.id);
  assert.ok(card,original.id+' is represented');
  assert.equal(card.kind,original.kind);
  assert.notEqual(card.kind,'port');
 }
 assert.equal(view.nodes.find(node=>node.semanticId==='anonymous').name,'Unnamed AttributeUsage');
 assert.equal(view.nodes.find(node=>node.semanticId==='short-name').name,'P');
 assert.equal(view.childProjection.childIds.length,children.length);
});

test('parallel native edges keep kinds, direction, identity and every occurrence without mutating inputs',()=>{
 const graph=fixture(2);
 graph.relationships.push(relation('wire-a','child-0000','child-0001'),relation('wire-b','child-0000','child-0001'),relation('return','child-0001','child-0000','flow'));
 const context=completeChildContext(graph,{focus:'root'}),before=structuredClone({graph,context});
 freeze(graph);freeze(context);
 const view=completeChildView(graph,context);
 assert.equal(view.edges.length,context.relationships.length);
 assert.deepEqual(view.edges.map(edge=>edge.id),context.relationships.map(edge=>edge.id));
 for(const native of context.relationships){
  const drawn=view.edges.find(edge=>edge.id===native.id);
  assert.equal(drawn.nativeRelationship,native.nativeRelationship);
  assert.equal(drawn.kind,native.kind);
  assert.equal(drawn.semanticSource,native.source);
  assert.equal(drawn.semanticTarget,native.target);
  assert.equal(drawn.source,'gv:'+native.source);
  assert.equal(drawn.target,'gv:'+native.target);
  assert.deepEqual(drawn.occurrences,native.occurrences);
  assert.equal(drawn.navigationOnly,native.navigationOnly);
 }
 assert.equal(view.edges.filter(edge=>edge.kind==='connection').length,2);
 assert.deepEqual({graph,context},before);
});

test('direct definition context uses actual native declarations and typing bridge rather than runtime copies',()=>{
 const graph={elements:[declaration('usage'),declaration('definition','PartDefinition'),declaration('own','AttributeUsage'),declaration('defined','PortUsage'),declaration('other-usage')],containment:[owner('usage','own'),owner('definition','defined')],relationships:[relation('type','usage','definition','typing'),relation('other-type','other-usage','definition','typing')]};
 const context=completeChildContext(graph,{focus:'usage'}),view=completeChildView(graph,context);
 assert.deepEqual(new Set(view.nodes.map(node=>node.semanticId)),new Set(['usage','definition','own','defined']));
 assert.equal(view.nodes.find(node=>node.semanticId==='defined').kind,'PortUsage');
 assert.equal(view.childProjection.declaredOn.defined,'definition');
 assert.equal(view.childProjection.declaredOn.own,'usage');
 assert.equal(view.nodes.find(node=>node.semanticId==='usage').overviewLabel,'1 immediate declarations');
 assert.equal(view.nodes.find(node=>node.semanticId==='definition').overviewLabel,'1 immediate declarations');
 assert.deepEqual(view.edges.filter(edge=>edge.kind==='typing').map(edge=>edge.nativeRelationship),['native:type']);
});

test('isolated child cards do not reintroduce excluded type context or unrelated engineering neighbors',()=>{
 const graph=fixture(6);
 graph.elements.push(declaration('external','PartDefinition'),declaration('external-child'),declaration('neighbor','RequirementUsage'));
 graph.containment.push(owner('external','external-child'));
 graph.relationships.push(relation('external-type','root','external','typing'),relation('satisfy','child-0000','neighbor','satisfy'));
 const scope=graph.elements.slice(0,7).map(element=>element.id),context=completeChildContext(graph,{focus:'root',scopeIds:scope}),view=completeChildView(graph,context);
 assert.deepEqual(new Set(view.nodes.map(node=>node.semanticId)),new Set(scope));
 assert.equal(view.childProjection.childIds.length,6);
 assert.ok(!view.edges.some(edge=>edge.nativeRelationship==='native:satisfy'));
});

test('implicit project root cards retain all actual packages with boundary metadata explicitly inspectable',()=>{
 const roots=Array.from({length:31},(_,i)=>declaration('package-'+i,'Package'));
 roots.push(declaration('anonymous-metadata','MetadataUsage',{native:{owner:{'@id':'omitted-native-owner'},'sysx:sourceLine':31}}));
 const graph={elements:roots,containment:[],relationships:[]},context=completeRootContext(graph),view=completeChildView(graph,context);
 assert.equal(view.nodes.length,31);
 assert.equal(view.childProjection.childIds.length,31);
 assert.deepEqual(view.childProjection.rootIds,[]);
 assert.deepEqual(view.childProjection.declaredOn,{});
 assert.ok(!view.nodes.some(node=>node.semanticId==='anonymous-metadata'));
 assert.equal(completeChildView(graph,completeChildContext(graph,{focus:'anonymous-metadata'})).nodes[0].name,'Unnamed MetadataUsage');
 assert.ok(view.childProjection.inspectionEntries.some(entry=>entry.id==='anonymous-metadata'&&entry.reason==='native-owner-unavailable'&&entry.ownerIds[0]==='omitted-native-owner'));
 assert.equal(view.edges.length,0);
});

test('incomplete contexts cannot masquerade as complete child views',()=>{
 const graph=fixture(0),context={elements:graph.elements,relationships:[]};
 assert.throws(()=>completeChildView(graph,context),/complete native child projection is required/);
});
