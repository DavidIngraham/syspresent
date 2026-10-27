import test from 'node:test';
import assert from 'node:assert/strict';
import {inventoryNativeView,summarizeConstructs,inventoryReachableDeclarations,renderingFamilyMatrix,nativeDtoCoverage,assessRenderingView,inventoryRenderingDataset,verifyEngineAssets,FOCUSED_RENDER_SHOW,sourceProjectDeclarations} from '../scripts/rendering_coverage.mjs';
const native=(id,type,extra={})=>({'@id':id,'@type':type,...extra});
test('inventory covers emitted native records only, with semantic types, roles, identities and observed field absence',()=>{
 const raw={kind:'action',nodes:[{id:'a',semanticId:'action',identityStatus:'mapped',kind:'action',name:'Run',detail:'native text',ports:[{id:'p',semanticId:'port',identityStatus:'mapped',direction:'in'}]},{id:'b',kind:'initial',identityStatus:'synthetic'}],edges:[{from:'b',to:'a',kind:'succession',semanticId:'link',identityStatus:'mapped',label:'[native label]'}],notices:['native limitation']};
 const elements=[native('action','ActionUsage',{type:[{'@id':'definition'}],value:{'@id':'expression'}}),native('port','PortUsage',{direction:'in'}),native('link','SuccessionAsUsage'),native('notDrawn','OperatorExpression')];
 const before=structuredClone(raw),inventory=inventoryNativeView(raw,{datasetId:'fixture',viewId:'View',elements});
 assert.equal(inventory.counts.node,2);assert.equal(inventory.counts.port,1);assert.equal(inventory.counts.edge,1);
 assert.ok(!inventory.constructs.some(g=>g.semanticKind==='OperatorExpression'));
 const node=inventory.constructs.find(g=>g.semanticKind==='ActionUsage');assert.equal(node.nativeRolePresence.type,1);assert.equal(node.nativeRolePresence.value,1);assert.equal(node.missingFieldCounts.entry,1);assert.equal(node.samples[0].nativeModifiers.value['@id'],'expression');
 const edge=inventory.records.find(r=>r.role==='edge');assert.equal(edge.sourceSemanticId,null);assert.equal(edge.targetSemanticId,'action');assert.ok(edge.missingFields.includes('guard'));assert.equal(edge.structuredFields.guard,undefined,'guard semantics are not inferred from label syntax');
 const synthetic=inventory.records.find(r=>r.identityStatus==='synthetic');assert.ok(!synthetic.missingFields.includes('semanticId'));
 assert.deepEqual(raw,before);assert.equal(inventory.nativeNotices.count,1);
});

test('native sequence order and actual structured fields are retained without deriving message semantics',()=>{
 const raw={kind:'sequence',nodes:[{id:'z',semanticId:'z',kind:'part'},{id:'a',semanticId:'a',kind:'part'}],edges:[{from:'z',to:'a',kind:'flow',semanticId:'send',guard:{expressionId:'native-guard'},fromPort:'actual-port',label:'send'}],fragments:[{kind:'native-fragment'}]};
 const inventory=inventoryNativeView(raw,{datasetId:'fixture',viewId:'Sequence',elements:[native('z','PartUsage'),native('a','PartUsage'),native('send','SendActionUsage')]});
 assert.deepEqual(inventory.records.filter(r=>r.role==='sequence-participant').map(r=>[r.semanticId,r.nativeOrder]),[['z',0],['a',1]]);
 const message=inventory.records.find(r=>r.role==='sequence-message');assert.equal(message.sourceSemanticId,'z');assert.equal(message.targetSemanticId,'a');assert.equal(message.nativeOrder,0);assert.equal(message.structuredFields.guard.expressionId,'native-guard');assert.ok(!message.missingFields.includes('guard'));assert.equal(inventory.additionalNativeViewData.fragments.count,1);
});

test('grid occurrence identities and native endpoint convention remain distinct even for repeated relation identities',()=>{
 const raw={kind:'matrix',nodes:[],edges:[],columns:['Requirement','Derived'],rows:[{semanticId:'original',cells:['native','derive']}],columnElements:[{index:1,semanticId:'derived'}],relationshipCells:[{row:0,column:1,relationships:[{semanticId:'relation',sourceSemanticId:'original',targetSemanticId:'derived',kind:'derive'},{semanticId:'relation',sourceSemanticId:'original',targetSemanticId:'derived',kind:'derive'}]}]};
 const inventory=inventoryNativeView(raw,{datasetId:'fixture',viewId:'Matrix',elements:[native('original','RequirementUsage'),native('derived','RequirementUsage'),native('relation','ConnectionUsage')]});
 assert.equal(inventory.counts['grid-relationship'],2);assert.equal(inventory.counts['matrix-column'],1);
 const relationships=inventory.records.filter(r=>r.role==='grid-relationship');assert.notEqual(relationships[0].occurrenceId,relationships[1].occurrenceId);assert.ok(relationships.every(r=>r.sourceSemanticId==='original'&&r.targetSemanticId==='derived'));assert.equal(inventory.records.find(r=>r.role==='matrix-column').nativeColumnIndex,1);
});

test('bounded samples do not cap actual construct counts across views',()=>{
 const elements=[native('p','PartUsage')],view=id=>inventoryNativeView({kind:'definition',nodes:Array.from({length:12},(_,i)=>({id:id+i,semanticId:'p',kind:'part',identityStatus:'mapped'})),edges:[]},{datasetId:'fixture',viewId:id,elements,sampleLimit:2});
 const summary=summarizeConstructs([view('A'),view('B')],{sampleLimit:3});assert.equal(summary[0].count,24);assert.equal(summary[0].samples.length,3);assert.equal(summary[0].fieldPresence.semanticId,24);assert.equal(summary[0].viewKinds.definition,24);
});

 test('reachable named explorer metatypes stay separate from authored rendered records and omit opaque plumbing',()=>{
 const elements=[native('drawn','PartUsage',{'sysx:sourceLine':1,declaredName:'drawn',qualifiedName:'Example::drawn'}),native('notDrawn','CalculationDefinition',{'sysx:sourceLine':2,declaredName:'availableCalculation',qualifiedName:'Example::availableCalculation'}),native('anonymous','RequirementUsage',{'sysx:sourceLine':3}),native('expression','OperatorExpression',{'sysx:sourceLine':4,declaredName:'opaque'}),native('membership','OwningMembership',{'sysx:sourceLine':5,declaredName:'member'}),native('library','PartDefinition',{declaredName:'embedded'})];
 const reachable=inventoryReachableDeclarations(elements,[{semanticId:'drawn'},{semanticId:'drawn'}]);assert.equal(reachable.namedSourceDeclarations,2);assert.equal(reachable.authoredRepresentedDeclarations,1);assert.deepEqual(reachable.kinds.map(g=>g.semanticKind),['CalculationDefinition','PartUsage']);assert.equal(reachable.kinds[0].authoredOccurrences,0);assert.equal(reachable.kinds[1].authoredOccurrences,2);assert.equal(reachable.kinds[0].samples[0].semanticId,'notDrawn');
 });

 test('family matrix summarizes only native emitted view families and leaves renderer acceptance unassessed',()=>{
 const node=(id,kind)=>({id,semanticId:id,kind,identityStatus:'mapped'});
 const views=[inventoryNativeView({kind:'definition',nodes:[node('p','part')],edges:[]},{datasetId:'fixture',viewId:'A',elements:[native('p','PartUsage')]}),inventoryNativeView({kind:'state',nodes:[node('s','state')],edges:[{from:'s',to:'s',kind:'transition',semanticId:'t'}]},{datasetId:'fixture',viewId:'B',elements:[native('s','StateUsage'),native('t','TransitionUsage')]}),{status:'rejected-by-native',kind:'sequence'}];
 const matrix=renderingFamilyMatrix(views);assert.deepEqual(matrix.map(r=>r.viewKind),['definition','state']);assert.equal(matrix[1].nativeViews,1);assert.equal(matrix[1].nativeNodeMetatypes.StateUsage,1);assert.equal(matrix[1].nativeEdgeKinds.transition,1);assert.equal(matrix[1].focusedDescriptorStatus,'not-assessed');assert.equal(matrix[1].missingEdgeFields.guard,1);
 });


import {mkdtemp,writeFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
const helperFixture={
 focusedNodeDescriptor(node,graph,options){assert.ok(graph);assert.ok(options.view.nodes.includes(node));return {supported:true,shape:'rounded',notices:[],compartments:[]};},
 focusedEdgeAppearance(edge,options){assert.ok(options.graph);assert.ok(options.view.edges.includes(edge));return {supported:true,coverage:'native-base',endLabels:[{text:edge.notation?.sourceEndName??'',role:'derived'}]};},
 focusedNotationNotices(){return [];},
 sequenceNotationCoverage(){return {records:[{role:'message',status:'implemented'}]};},
 gridNotationCoverage(){return {records:[{role:'frame',status:'implemented'}]};}
};
test('focused assessment retains native production, pin, state-role and endpoint facts with graph/view helper context',async()=>{
 const view={id:'V',kind:'state',nodes:[{id:'a',semanticId:'a',identityStatus:'mapped',type:'NativeType',ports:[{id:'p',semanticId:'p',identityStatus:'mapped',parameter:true,direction:'in',type:'NativeType'}],state:{parallel:true,behaviors:[{role:'entry',semanticId:'entry',identityStatus:'mapped',text:'begin'}]}},{id:'b'}],edges:[{kind:'derive',from:'a',to:'b',semanticId:'relation',fromPort:'p',notation:{production:'derivation',sourceEndName:'derived'}}]};
 const result=await assessRenderingView(view,{elements:[]},helperFixture);
 assert.equal(result.graphProfileApplicable,true);assert.deepEqual(result.nativeDtoCoverage.edgeProductions,{derivation:1});assert.equal(result.nativeDtoCoverage.ports.parameter,1);assert.equal(result.nativeDtoCoverage.ports.canonicalIdentities,1);assert.equal(result.nativeDtoCoverage.state.parallelNodes,1);assert.deepEqual(result.nativeDtoCoverage.state.behaviorRoles,{entry:1});assert.equal(result.focusedEdges[0].status,'native-base');assert.equal(result.endpointLabels.namedRecords,1);assert.equal(result.endpointLabels.geometryStatus,'not-assessed-before-layout');
 const sequence={...view,kind:'sequence',sequenceOrders:[{}],edges:[{...view.edges[0],notation:{production:'message',sourceEvent:{semanticId:'event'},targetEvent:{semanticId:'event2'}}}]};
 const coverage=nativeDtoCoverage(sequence);assert.equal(coverage.sequence.explicitOrders,1);assert.equal(coverage.sequence.endpointEventReferences,2);const assessed=await assessRenderingView(sequence,{elements:[]},helperFixture);assert.equal(assessed.graphProfileApplicable,false);assert.deepEqual(assessed.surfaceCoverage.statusCounts,{implemented:1});
});

test('focused variants use explicit native show flags without adding authored views or duplicate sequence aliases',async()=>{
 const root=await mkdtemp(join(tmpdir(),'syspresent-coverage-project-'));
 try{
  await writeFile(join(root,'project.json'),JSON.stringify({schemaVersion:'syspresent.project.v2',title:'Fixture'}));await writeFile(join(root,'model.sysml'),'package Fixture;');
  const elements=[native('v','ViewUsage',{declaredName:'View',qualifiedName:'Fixture::View','sysx:sourceLine':1}),native('part','PartUsage',{declaredName:'part',qualifiedName:'Fixture::part','sysx:sourceLine':2})],calls=[];
  const client={async call(method,params){if(method==='ParseSources')return {modelHash:'fixture-model',diagnostics:[]};if(method==='ExportModel')return {projection:'declarations',elements};if(method==='RenderView'){calls.push(params);return {kind:'definition',nodes:[{id:'part',semanticId:'part',kind:'part',identityStatus:'mapped',...(params.show?{ports:[{id:'pin',parameter:true,direction:'in'}]}:{})}],edges:[]};}throw Error(method);}};
  const result=await inventoryRenderingDataset(client,{id:'fixture',root,sampleLimit:2,assess:true,helpers:helperFixture});
  assert.equal(result.declaredViewCount,1);assert.equal(result.views.length,1);assert.equal(calls.length,2);assert.equal(calls[0].show,undefined);assert.deepEqual(calls[1].show,[...FOCUSED_RENDER_SHOW]);assert.equal(calls[1].includeSemanticIdentity,true);assert.equal(result.views[0].counts.port,undefined);assert.equal(result.views[0].focusedVariant.counts.port,1);assert.equal(result.views[0].focusedVariant.origin,'fresh-native-focused-show');
  const matrix=renderingFamilyMatrix(result.views);assert.equal(matrix[0].nativeViews,1);assert.equal(matrix[0].focusedRenderVariants,1);assert.equal(matrix[0].recordCounts.node,1);assert.equal(matrix[0].focusedNativeRecordCounts.port,1);
  const aliases=inventoryReachableDeclarations(elements,[{role:'node',semanticId:'part'},{role:'sequence-participant',semanticId:'part'}]);assert.equal(aliases.kinds.find(k=>k.semanticKind==='PartUsage').authoredOccurrences,1);
 }finally{await rm(root,{recursive:true,force:true});}
});

test('paired engine provenance verifies bytes of native, WASM and runtime rather than trusting metadata alone',async()=>{
 const root=await mkdtemp(join(tmpdir(),'syspresent-coverage-engine-'));
 try{
  const assets={};for(const name of ['sysml-native','sysml-wasm.wasm','wasm_exec.js']){const bytes=Buffer.from('fixture '+name);await writeFile(join(root,name),bytes);assets[name]={bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')};}
  const provenance=join(root,'provenance.json');await writeFile(provenance,JSON.stringify({assets}));const verified=await verifyEngineAssets(provenance);assert.deepEqual(Object.keys(verified.verifiedAssets),Object.keys(assets));assert.equal(verified.verifiedAssets['sysml-wasm.wasm'].sha256,assets['sysml-wasm.wasm'].sha256);
  await writeFile(join(root,'sysml-wasm.wasm'),'changed');await assert.rejects(verifyEngineAssets(provenance),/Paired engine asset differs.*sysml-wasm/);
 }finally{await rm(root,{recursive:true,force:true});}
});


test('reachable declaration inventory excludes the generated runtime helper subtree consistently',()=>{
 const declarations=[native('p','PartUsage',{declaredName:'part',qualifiedName:'Model::part','sysx:sourceLine':1}),native('helper','ReferenceUsage',{declaredName:'relationshipDepth',qualifiedName:'RuntimeContext::coverage::@0::relationshipDepth','sysx:sourceLine':4}),native('root','Package',{declaredName:'RuntimeContext',qualifiedName:'RuntimeContext','sysx:sourceLine':1})];
 const actual=sourceProjectDeclarations(declarations,'RuntimeContext');assert.deepEqual(actual.map(e=>e['@id']),['p']);assert.equal(inventoryReachableDeclarations(actual).namedSourceDeclarations,1);assert.equal(sourceProjectDeclarations(declarations,undefined),declarations);
});
