import test from 'node:test';
import assert from 'node:assert/strict';
import {modelGraph} from '../src/canvas-prototype/graph.mjs';
import {completeChildContext} from '../src/canvas-prototype/child-exploration.mjs';
import {nativeOwnershipIndex,inspectNativeOwnership,metadataContext,sourceMetadata} from '../src/canvas-prototype/metadata-context.mjs';
const ref=id=>({'@id':id}),raw=(id,kind='PartUsage',extra={})=>({'@id':id,'@type':kind,qualifiedName:'Model::'+id,declaredName:id,'sysx:sourceLine':1,...extra});
const freeze=value=>{if(value&&typeof value==='object'){Object.freeze(value);for(const child of Object.values(value))freeze(child);}return value;};
const fixture=()=>modelGraph([
 raw('package','Package'),raw('part','PartUsage',{owner:ref('package')}),raw('requirement','RequirementUsage',{owner:ref('package')}),
 raw('dependency','Dependency',{owner:ref('package'),client:[ref('part')],supplier:[ref('requirement')],ownedAnnotation:[ref('annotation-rationale')]}),
 raw('rationale','MetadataUsage',{owner:ref('dependency'),owningRelationship:ref('annotation-rationale'),type:[ref('rationale-type')],'sysx:sourceText':'metadata rationale { text = "Design basis"; }\n'}),
 raw('text','AttributeUsage',{owner:ref('rationale'),'sysx:sourceText':'text = "Design basis";\n'})
]);

test('full native ownership reaches metadata through a source Dependency without structural reinterpretation',()=>{
 const graph=fixture(),before=structuredClone(graph),index=nativeOwnershipIndex(graph);
 assert.deepEqual(index.ownerIds.get('rationale'),['dependency']);assert.deepEqual(index.ownerIds.get('dependency'),['package']);
 assert.deepEqual(index.childIds.get('dependency'),['rationale']);assert.ok(index.sourceIds.has('dependency'));
 assert.deepEqual(new Set(index.sourceIds),new Set(graph.elements.map(element=>element.id)));
 assert.equal(graph.containment.some(edge=>edge.source==='dependency'&&edge.target==='rationale'),false,'native ownership index does not require declaration-only navigation edges');
 const inspection=inspectNativeOwnership(index,'text');
 assert.deepEqual(inspection.steps.map(step=>[step.id,step.kind]),[['text','AttributeUsage'],['rationale','MetadataUsage'],['dependency','Dependency'],['package','Package']]);
 assert.deepEqual(inspection.boundaries,[{id:'package',reason:'native-root'}]);assert.deepEqual(inspection.cycles,[]);
 assert.deepEqual(graph,before);
});

test('ownedAnnotation and metadata owningRelationship join only by exact native ID and do not fabricate annotation objects or targets',()=>{
 const graph=fixture(),context=metadataContext(graph,'dependency');
 assert.deepEqual(context.ownedMetadata.map(record=>record.id),['rationale']);
 assert.deepEqual(context.annotatingMetadata,[],'recorded-on provenance does not infer an annotatedElement target');
 assert.equal(context.annotationLinks.length,1);
 const link=context.annotationLinks[0];
 assert.equal(link.annotationId,'annotation-rationale');assert.equal(link.available,false);
 assert.deepEqual(link.recordedOnIds,['dependency']);assert.deepEqual(link.metadataIds,['rationale']);assert.deepEqual(link.annotatedElementIds,[]);
 assert.deepEqual(link.provenance,[{elementId:'dependency',property:'ownedAnnotation',referencedId:'annotation-rationale'},{elementId:'rationale',property:'owningRelationship',referencedId:'annotation-rationale'}]);
 assert.equal(link.presentationOnly,true);assert.equal(link.role,'annotation-record-provenance');
 assert.deepEqual(context.unavailableAnnotationIds,['annotation-rationale']);
 assert.deepEqual(context.ownedMetadata[0].matchingOwnedAnnotationIds,['annotation-rationale']);
 assert.deepEqual(context.ownedMetadata[0].recordedOnIds,['dependency']);
 const metadata=metadataContext(graph,'rationale').metadata;assert.deepEqual(metadata.ownerIds,['dependency']);assert.deepEqual(metadata.ownedElementIds,['text']);assert.deepEqual(metadata.typeIds,['rationale-type']);
 assert.match(metadata.source.text,/Design basis/);
});

test('explicit annotatedElement targets remain separate from native ownership and client/supplier relationships',()=>{
 const graph=fixture();
 graph.elements.push({id:'annotation-target',kind:'RequirementUsage',name:'target',layer:'project',native:{owner:ref('package')}});
 graph.elements.push({id:'annotation','kind':'MetadataUsage',name:'external annotation',layer:'project',native:{owner:ref('package'),annotatedElement:[ref('annotation-target')],owningRelationship:ref('not-projected')}});
 const index=nativeOwnershipIndex(graph),context=metadataContext(index,'annotation-target');
 assert.deepEqual(context.ownedMetadata,[]);assert.deepEqual(context.annotatingMetadata.map(record=>record.id),['annotation']);
 assert.deepEqual(context.annotatingMetadata[0].ownerIds,['package']);assert.deepEqual(context.annotatingMetadata[0].annotatedElementIds,['annotation-target']);
 assert.equal(index.childIds.get('annotation-target'),undefined);
 assert.deepEqual(inspectNativeOwnership(index,'annotation').steps.map(step=>step.id),['annotation','package']);
 assert.equal(metadataContext(index,'part').total,0,'Dependency client does not acquire the Dependency metadata');
 assert.equal(metadataContext(index,'requirement').total,0,'Dependency supplier does not acquire the Dependency metadata');
 assert.equal(metadataContext(index,'annotation').annotationLinks.length,0,'an unprojected owningRelationship alone is not evidence that it is an Annotation');
});

test('a loaded native Annotation preserves actual annotatedElement and annotatingElement roles',()=>{
 const graph=modelGraph([raw('owner','Package'),raw('target'),raw('meta','MetadataUsage',{owner:ref('owner'),owningRelationship:ref('ann')}),raw('ann','Annotation',{annotatingElement:ref('meta'),annotatedElement:[ref('target')]}),raw('recorded','Dependency',{owner:ref('owner'),ownedAnnotation:[ref('ann')]})]);
 const context=metadataContext(graph,'target');
 assert.deepEqual(context.annotatingMetadata.map(record=>record.id),['meta']);assert.equal(context.annotationLinks[0].available,true);
 assert.deepEqual(context.annotationLinks[0].annotatedElementIds,['target']);assert.deepEqual(context.annotationLinks[0].recordedOnIds,['recorded']);
 assert.deepEqual(nativeOwnershipIndex(graph).ownerIds.get('meta'),['owner']);
 assert.equal(nativeOwnershipIndex(graph).ownerIds.has('target'),false);
});

test('missing, cyclic and ambiguous owner records remain fully inspectable without guessed QName parents',()=>{
 const graph=modelGraph([raw('root','Package'),raw('meta','MetadataUsage',{qualifiedName:'Misleading::Parent::meta',owner:[ref('dependency'),ref('missing')]}),raw('dependency','Dependency',{owner:ref('cycle')}),raw('cycle','MetadataUsage',{owner:ref('dependency')})]);
 const result=inspectNativeOwnership(graph,'meta');
 assert.deepEqual(result.ownerIds,['dependency','missing']);assert.deepEqual(result.missingOwnerIds,['missing']);
 assert.deepEqual(result.ambiguous,[{id:'meta',reason:'ambiguous-owner',ownerIds:['dependency','missing']}]);
 assert.deepEqual(new Set(result.cycles[0].ids),new Set(['dependency','cycle']));
 assert.ok(!result.steps.some(step=>step.id==='root'),'qualified-name prefixes do not create native owners');
 assert.deepEqual(sourceMetadata(graph).items.map(item=>item.id),['meta','cycle']);
 const scoped=inspectNativeOwnership(graph,'meta',{scopeIds:['meta']});
 assert.deepEqual(scoped.outsideScopeIds,['dependency']);assert.deepEqual(scoped.missingOwnerIds,['missing']);
});

test('standalone unannotated metadata and explicitly targeted metadata retain distinct inspection facts',()=>{
 const graph=modelGraph([raw('standalone','MetadataUsage'),raw('targeted','MetadataUsage',{annotatedElement:[ref('unavailable-target')]}),raw('root','Package')]);
 assert.deepEqual(inspectNativeOwnership(graph,'standalone').boundaries,[{id:'standalone',reason:'native-root'}]);
 assert.deepEqual(sourceMetadata(graph).items.find(record=>record.id==='standalone').ownerIds,[]);
 const target=metadataContext(graph,'targeted').metadata;
 assert.deepEqual(target.annotatedElementIds,['unavailable-target']);assert.deepEqual(target.unavailableAnnotatedElementIds,['unavailable-target']);
 assert.deepEqual(target.ownerIds,[],'annotation target never substitutes for missing ownership');
});

for(const count of [0,1,5,6,137])test('indexing metadata does not sample or alter '+count+' complete immediate structural siblings',()=>{
 const rows=[raw('root','Package'),...Array.from({length:count},(_,i)=>raw('sibling-'+i,i%2?'AttributeUsage':'PartUsage',{owner:ref('root')})),raw('dependency','Dependency',{owner:ref('root')}),raw('meta','MetadataUsage',{owner:ref('dependency')})],graph=modelGraph(rows),before=structuredClone(graph);
 const index=nativeOwnershipIndex(graph);assert.equal(index.childIds.get('root').length,count+1);
 const context=completeChildContext(graph,{focus:'root',budget:1,page:999});
 assert.equal(context.shown,count);assert.deepEqual(new Set(context.targets),new Set(Array.from({length:count},(_,i)=>'sibling-'+i)));
 assert.deepEqual(sourceMetadata(index,{ownerId:'dependency'}).items.map(record=>record.id),['meta']);
 assert.deepEqual(graph,before);
});

test('global source metadata inventory paginates every record with truthful counts and exact native fields',()=>{
 const graph=modelGraph([raw('owner','Dependency'),...Array.from({length:1956},(_,i)=>raw('metadata-'+String(i).padStart(4,'0'),'MetadataUsage',{owner:ref('owner'),annotatedElement:i===42?[ref('target')]:[],owningRelationship:ref('ann-'+i)})),{'@id':'library-meta','@type':'MetadataUsage',declaredName:'library-only'}]);
 const index=nativeOwnershipIndex(graph),seen=[];
 for(let page=0;page<49;page++){
  const result=sourceMetadata(index,{page});assert.equal(result.total,1956);assert.equal(result.totalSourceMetadata,1956);assert.equal(result.pages,49);assert.equal(result.page,page);
  assert.equal(result.shown,page===48?36:40);assert.equal(result.hasPrevious,page>0);assert.equal(result.hasNext,page<48);
  seen.push(...result.items.map(record=>record.id));assert.deepEqual(result.rows,result.items);
 }
 assert.equal(new Set(seen).size,1956);assert.equal(seen.includes('library-meta'),false);
 const result=sourceMetadata(index,{query:'metadata-0042',ownerId:'owner',page:999});
 assert.equal(result.total,1);assert.equal(result.page,0);assert.deepEqual(result.items[0].annotatedElementIds,['target']);assert.deepEqual(result.items[0].owningRelationshipIds,['ann-42']);assert.deepEqual(result.items[0].matchingOwnedAnnotationIds,[]);
 assert.equal(sourceMetadata(index,{ownerId:'target'}).total,0,'annotation target is not an owner filter match');
 assert.throws(()=>sourceMetadata(index,{page:-1}),/nonnegative/);assert.throws(()=>sourceMetadata(index,{pageSize:0}),/positive/);
});

test('source ownership and metadata results preserve frozen inputs and isolate mutable inspection snapshots',()=>{
 const graph=fixture(),before=structuredClone(graph);freeze(graph);
 const index=nativeOwnershipIndex(graph);assert.equal(nativeOwnershipIndex(graph),index,'immutable graph index is cached');
 const ownership=inspectNativeOwnership(index,'rationale'),context=metadataContext(index,'dependency'),inventory=sourceMetadata(index);
 ownership.ownerIds.push('fake');context.ownedMetadata[0].ownerIds.push('fake');context.annotationLinks[0].recordedOnIds.push('fake');inventory.items[0].ownedElementIds.push('fake');
 assert.deepEqual(inspectNativeOwnership(index,'rationale').ownerIds,['dependency']);assert.deepEqual(metadataContext(index,'dependency').annotationLinks[0].recordedOnIds,['dependency']);
 assert.deepEqual(sourceMetadata(index).items[0].ownedElementIds,['text']);assert.deepEqual(graph,before);
});

test('native index rebuilds for replacement source arrays and appended explicit source records',()=>{
 const graph=fixture(),first=nativeOwnershipIndex(graph);
 graph.elements.push({id:'added',kind:'MetadataUsage',layer:'project',native:{owner:ref('dependency')}});
 const second=nativeOwnershipIndex(graph);assert.notEqual(second,first);assert.deepEqual(second.childIds.get('dependency'),['added','rationale']);
 graph.elements=[...graph.elements];assert.notEqual(nativeOwnershipIndex(graph),second);
});

test('deep native ownership remains stack-safe and a shared owner is not a cycle',()=>{
 const elements=Array.from({length:10000},(_,i)=>({id:'node-'+i,kind:i%2?'Dependency':'MetadataUsage',layer:'project',native:i?{owner:ref('node-'+(i-1))}:{}}));
 const graph={elements,containment:[],relationships:[]},result=inspectNativeOwnership(graph,'node-9999');
 assert.equal(result.steps.length,10000);assert.equal(result.cycles.length,0);assert.deepEqual(result.boundaries,[{id:'node-0',reason:'native-root'}]);
 const shared=modelGraph([raw('root','Package'),raw('a','Dependency',{owner:ref('root')}),raw('b','Dependency',{owner:ref('root')}),raw('meta','MetadataUsage',{owner:[ref('a'),ref('b')]})]);
 assert.equal(inspectNativeOwnership(shared,'meta').cycles.length,0);
});

test('annotation joins do not match missing object names, suffixes, type IDs or parallel relationship endpoints',()=>{
 const graph=fixture();
 graph.elements.push({id:'false-metadata',kind:'MetadataUsage',name:'annotation-rationale',qualifiedName:'annotation-rationale',layer:'project',native:{owner:ref('dependency'),owningRelationship:ref('prefix-annotation-rationale'),type:[ref('annotation-rationale')]}});
 const context=metadataContext(graph,'dependency'),falseRecord=context.ownedMetadata.find(record=>record.id==='false-metadata');
 assert.deepEqual(falseRecord.matchingOwnedAnnotationIds,[]);assert.deepEqual(falseRecord.recordedOnIds,[]);
 assert.deepEqual(context.annotationLinks[0].metadataIds,['rationale']);
});
