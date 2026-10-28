import {completeRootContext} from '../src/canvas-prototype/child-exploration.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {hierarchyPage} from '../src/canvas-prototype/package-explorer.mjs';
import {elementCompartments,compartmentText} from '../src/canvas-prototype/element-compartments.mjs';

const declaration=(id,kind,owner,extra={})=>({'@id':id,'@type':kind,declaredName:id,qualifiedName:id,...(owner?{owner:{'@id':owner}}:{}),'sysx:sourceLine':1,...extra});
function fixture(){return modelGraph([
 declaration('project','Package'),declaration('other','Package'),declaration('assembly','PartDefinition','project'),
 declaration('usage','PartUsage','project',{type:[{'@id':'assembly'}]}),declaration('base','PartDefinition','other'),
 declaration('attribute','AttributeUsage','assembly',{type:[{'@id':'real'}],value:{'@id':'expression'},'sysx:sourceText':'attribute attribute : Real = calculation();'}),
 declaration('subpart','PartUsage','assembly'),declaration('local','AttributeUsage','usage'),
 declaration('looksOwned','PartUsage','other',{qualifiedName:'assembly::notReallyOwned'}),
 ...Array.from({length:137},(_,i)=>declaration('child'+String(i).padStart(3,'0'),'PartUsage','assembly')),
 {'@id':'real','@type':'AttributeDefinition',declaredName:'Real'},
 {'@id':'membership','@type':'FeatureMembership',owner:{'@id':'assembly'},'sysx:sourceLine':1},
 ]);}

test('hierarchy offers every loaded owned declaration through stable pages and disconnected roots',()=>{
 const graph=fixture(),before=structuredClone(graph),roots=hierarchyPage(graph);
 assert.deepEqual(roots.items.map(e=>e.id),['other','project']);
 const ids=[];for(let page=0;page<3;page++){
  const result=hierarchyPage(graph,{parentId:'assembly',page,pageSize:50});
  assert.equal(result.total,139);assert.equal(result.hasNext,page<2);assert.equal(result.hasPrevious,page>0);
  ids.push(...result.items.map(item=>item.id));
 }
 assert.equal(new Set(ids).size,139);assert.ok(ids.includes('child136'));assert.ok(!ids.includes('looksOwned'));assert.ok(!ids.includes('membership'));
 const assembly=hierarchyPage(graph,{query:'assembly'}).items.find(e=>e.id==='assembly');
 assert.equal(assembly.childCount,139);assert.deepEqual(assembly.pathIds,['project']);assert.equal(assembly.provenance.role,'owner');
 assert.deepEqual(graph,before);
});
test('hierarchy search scans complete scope and never infers ownership from qualified names',()=>{
 const graph=fixture();
 assert.equal(hierarchyPage(graph,{rootId:'assembly',query:'child136'}).items[0].id,'child136');
 assert.equal(hierarchyPage(graph,{rootId:'assembly',query:'notReallyOwned'}).total,0);
 assert.deepEqual(hierarchyPage(graph,{scopeIds:['other','base','looksOwned']}).items.map(e=>e.id),['other']);
 assert.throws(()=>hierarchyPage(graph,{parentId:'project',scopeIds:['other']}),/outside/);
 assert.equal(hierarchyPage(graph,{parentId:'assembly',page:999}).page,2);
});
test('native owner cycles remain searchable and inspectable without asserting model roots',()=>{
 const graph=modelGraph([declaration('a','Package','b'),declaration('b','Package','a'),declaration('c','Package','d'),declaration('d','Package','c')]);
 const roots=hierarchyPage(graph);assert.deepEqual(roots.items.map(e=>e.id),[]);assert.deepEqual(new Set(completeRootContext(graph).childProjection.inspectionEntries.map(e=>e.id)),new Set(['a','b','c','d']));
 assert.equal(hierarchyPage(graph,{rootId:'a',query:'b'}).items[0].id,'b');
 assert.deepEqual(hierarchyPage(graph,{parentId:'a'}).items[0].pathIds,['a']);
 assert.equal(graph.relationships.length,0);
});
test('tile compartments expose attributes and internals with native classifier and declaration identities',()=>{
 const graph=fixture(),before=structuredClone(graph),result=elementCompartments(graph,'usage',{pageSize:200});
 assert.equal(result.total,140);assert.deepEqual(result.classifiers,[{id:'assembly',label:'assembly'}]);
 const attribute=result.items.find(e=>e.id==='attribute');assert.equal(attribute.direct,false);assert.equal(attribute.declaredOn,'assembly');assert.deepEqual(attribute.typeIds,['real']);assert.deepEqual(attribute.typeLabels,['Real']);assert.deepEqual(attribute.valueReferences,['expression']);assert.match(attribute.valueStatus,/not evaluated/);assert.match(attribute.provenance.sourceText,/calculation/);
 assert.equal(result.items[0].id,'local');assert.equal(result.items[0].direct,true);
 assert.ok(!result.items.some(e=>['looksOwned','base'].includes(e.id)));
 assert.deepEqual(graph,before);
});
test('bounded tile summaries disclose complete paged declaration access and do not evaluate values',()=>{
 const graph=fixture(),text=compartmentText(graph,'usage');
 assert.match(text,/Attributes declared on assembly/);assert.match(text,/attribute : Real \(value declared; not evaluated\)/);assert.match(text,/Showing 12 of 140/);
 const ids=[];for(let page=0;page<12;page++)ids.push(...elementCompartments(graph,'usage',{page}).items.map(e=>e.id));
 assert.equal(new Set(ids).size,140);assert.ok(ids.includes('subpart'));assert.equal(compartmentText(graph,'base'),'');assert.equal(compartmentText(graph,'missing'),'');
 assert.throws(()=>elementCompartments(graph,'missing'),/unavailable/);
});

test('hierarchy roots exclude metadata with a real nonstructural owner and retain search access',()=>{
 const graph=modelGraph([declaration('project','Package'),declaration('rel','Dependency','project'),declaration('meta','MetadataUsage','rel'),declaration('text','AttributeUsage','meta')],[],{nativeRootIds:['project']});
 assert.deepEqual(hierarchyPage(graph).items.map(row=>row.id),['project']);
 assert.deepEqual(hierarchyPage(graph,{query:'meta'}).items.map(row=>row.id),['meta']);
 assert.deepEqual(hierarchyPage(graph,{parentId:'meta'}).items.map(row=>row.id),['text']);
 assert.equal(completeRootContext(graph).childProjection.inspectionEntries.find(row=>row.id==='meta').ownerIds[0],'rel');
});
