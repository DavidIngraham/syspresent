#!/usr/bin/env node
/** Inventory actual native rendering records, never theoretical metamodel coverage.
 * No SysML parsing, inferred relationship semantics, remote service or evaluation.
 */
import {spawn} from 'node:child_process';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {readProjectDirectory,documentDigest} from './canvas_project_files.mjs';
import {documentsFor,requirementCoverageSource} from '../src/canvas-prototype/project.mjs';
import {adaptNativeView,modelGraph,graphView,isDeclarationKind} from '../src/canvas-prototype/graph.mjs';
const sha=value=>createHash('sha256').update(typeof value==='string'||Buffer.isBuffer(value)?value:JSON.stringify(value)).digest('hex');
const compare=(a,b)=>a<b?-1:a>b?1:0;
const nativeRefs=value=>Array.isArray(value)?value.some(nativeRefs):value&&typeof value==='object'&&typeof value['@id']==='string';
const present=value=>value!==undefined&&value!==null&&value!=='';
const source=e=>e.source??e.fromId??e.from;
const target=e=>e.target??e.toId??e.to;
export const FOCUSED_RENDER_SHOW=Object.freeze(['parameter-symbols','port-symbols','typings','edge-labels']);
export const sourceProjectDeclarations=(elements,runtimePackage)=>runtimePackage?elements.filter(e=>e.qualifiedName!==runtimePackage&&!e.qualifiedName?.startsWith(runtimePackage+'::')):elements;
const endpointFields=['guard','trigger','effect','fromPort','toPort','sourceSemanticId','targetSemanticId'];
const behaviorFields=['entry','do','exit','guard','trigger','effect','condition','body','multiplicity'];
function brief(value){
 if(typeof value==='string')return value.length>180?value.slice(0,177)+'…':value;
 if(Array.isArray(value))return {count:value.length,sample:value.slice(0,3).map(brief)};
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).slice(0,12).map(([key,item])=>[key,brief(item)]));
 return value;
}
const inc=(map,key,n=1)=>{map[key]=(map[key]??0)+n;};
function mergeMap(target,other){for(const [key,value]of Object.entries(other??{}))inc(target,key,value);}
function groupRecords(records,sampleLimit){
 const groups=new Map();
 for(const record of records){
  const key=JSON.stringify([record.role,record.kind,record.semanticKind,record.identityStatus]);
  if(!groups.has(key))groups.set(key,{role:record.role,kind:record.kind,semanticKind:record.semanticKind,identityStatus:record.identityStatus,count:0,viewKinds:{},fieldPresence:{},structuredFieldPresence:{},nativeRolePresence:{},missingFieldCounts:{},samples:[]});
  const group=groups.get(key);group.count++;inc(group.viewKinds,record.viewKind);
  for(const key of record.fields)inc(group.fieldPresence,key);
  for(const key of Object.keys(record.structuredFields))inc(group.structuredFieldPresence,key);
  for(const key of record.nativeRoles)inc(group.nativeRolePresence,key);
  for(const key of record.missingFields)inc(group.missingFieldCounts,key);
  if(group.samples.length<sampleLimit)group.samples.push(record);
 }
 return [...groups.values()].sort((a,b)=>compare(JSON.stringify([a.role,a.kind,a.semanticKind,a.identityStatus]),JSON.stringify([b.role,b.kind,b.semanticKind,b.identityStatus])));
}
/** Raw records preserve occurrence order/identities and native endpoint order.
 * Field absence is observation only: it is not a verdict that the field is
 * required for this construct or that its semantics can be inferred from text.
 */
export function inventoryNativeView(raw,{datasetId,viewId,elements=[],origin='native-render',sampleLimit=4}={}){
 const view=adaptNativeView(raw,viewId),known=new Map(elements.map(e=>[e['@id'],e])),nodes=new Map(view.nodes.map(n=>[n.id,n])),records=[];
 function add(role,item,index,{kind=item.kind??'(none)',occurrenceId,sourceSemanticId,targetSemanticId,ownerSemanticId,extra={}}={}){
  const semanticId=item.semanticId??null,native=known.get(semanticId),identityStatus=item.identityStatus??(semanticId?'unspecified':'unknown');
  const fields=Object.keys(item).sort(compare),structuredFields=Object.fromEntries(Object.entries(item).filter(([key,value])=>present(value)&&!['id','name','label','detail','text','qualifiedName','semanticId','identityStatus'].includes(key)).map(([key,value])=>[key,brief(value)]));
  const missingFields=[];
  if(!semanticId&&!['synthetic','notation'].includes(identityStatus))missingFields.push('semanticId');
  if(semanticId&&!native)missingFields.push('nativeDeclarationInProjection');
  if(['edge','sequence-message'].includes(role))for(const field of endpointFields)if(!present(item[field]))missingFields.push(field);
  if(['node','sequence-participant'].includes(role)&&['action','state'].some(name=>kind.includes(name)))for(const field of behaviorFields)if(!present(item[field]))missingFields.push(field);
  const record={datasetId,viewId,viewKind:view.kind,role,kind,semanticKind:native?.['@type']??(['synthetic','notation'].includes(identityStatus)?'(synthetic)':'(unavailable)'),identityStatus,occurrenceId:occurrenceId??`${datasetId}:${viewId}:${role}:${index}:${item.id??''}`,semanticId,qualifiedName:item.qualifiedName??native?.qualifiedName??null,fields,structuredFields,nativeRoles:Object.keys(native??{}).filter(key=>nativeRefs(native[key])).sort(compare),nativeModifiers:Object.fromEntries(Object.entries(native??{}).filter(([key,value])=>typeof value==='boolean'||['direction','value','multiplicity','ownedMultiplicity'].includes(key)).map(([key,value])=>[key,brief(value)])),missingFields,...(sourceSemanticId!==undefined?{sourceSemanticId}:{}),...(targetSemanticId!==undefined?{targetSemanticId}:{}),...(ownerSemanticId!==undefined?{ownerSemanticId}:{}),textFields:Object.fromEntries(['name','type','label','text','detail'].filter(key=>present(item[key])).map(key=>[key,{characters:String(item[key]).length,newlines:String(item[key]).split('\n').length-1}])),...extra};records.push(record);return record;
 }
 for(const [index,node]of view.nodes.entries()){
  add('node',node,index);
  for(const [behaviorIndex,behavior]of (node.state?.behaviors??[]).entries())add('state-behavior',behavior,behaviorIndex,{kind:behavior.kind??'state-behavior',occurrenceId:`${datasetId}:${viewId}:state:${node.id}:${behaviorIndex}`,ownerSemanticId:node.semanticId??null,extra:{stateRole:behavior.role}});
  if(view.kind==='sequence')add('sequence-participant',node,index,{extra:{nativeOrder:index}});
  for(const [portIndex,port]of (node.ports??[]).entries())add('port',port,portIndex,{kind:port.kind??'port',occurrenceId:`${datasetId}:${viewId}:port:${node.id}:${portIndex}:${port.id??''}`,ownerSemanticId:node.semanticId??null});
 }
 for(const [index,edge]of view.edges.entries()){
  const sourceSemanticId=edge.sourceSemanticId??edge.semanticSource??nodes.get(source(edge))?.semanticId??null,targetSemanticId=edge.targetSemanticId??edge.semanticTarget??nodes.get(target(edge))?.semanticId??null;
  add('edge',edge,index,{sourceSemanticId,targetSemanticId});
  if(view.kind==='sequence'){add('sequence-message',edge,index,{sourceSemanticId,targetSemanticId,extra:{nativeOrder:index}});for(const role of ['sourceEvent','targetEvent'])if(edge.notation?.[role])add('sequence-endpoint-event',edge.notation[role],index,{kind:edge.notation[role].kind??'event',occurrenceId:`${datasetId}:${viewId}:event-ref:${index}:${role}`,extra:{endpointRole:role,lifelineId:edge.notation[role].lifelineId??null}});}
 }
 for(const [index,order]of (view.sequenceOrders??[]).entries())add('sequence-order',order,index,{sourceSemanticId:order.sourceEvent?.semanticId??null,targetSemanticId:order.targetEvent?.semanticId??null,extra:{nativeOrder:index,sourceEvent:brief(order.sourceEvent),targetEvent:brief(order.targetEvent)}});
 for(const [index,row]of (view.rows??[]).entries())add('table-row',row,index,{kind:view.kind==='matrix'?'matrix-row':'table-row',extra:{nativeOrder:index,cellCount:row.cells?.length??0}});
 for(const [index,column]of (view.columnElements??[]).entries())add('matrix-column',column,index,{kind:'native-column',extra:{nativeColumnIndex:column.index}});
 for(const cell of view.relationshipCells??[])for(const [index,relationship]of (cell.relationships??[]).entries())add('grid-relationship',relationship,index,{occurrenceId:`${datasetId}:${viewId}:cell:${cell.row}:${cell.column}:${index}`,sourceSemanticId:relationship.sourceSemanticId??null,targetSemanticId:relationship.targetSemanticId??null,extra:{row:cell.row,column:cell.column}});
 const counts={};for(const record of records)inc(counts,record.role);
 return {id:viewId,kind:view.kind,status:'rendered',origin,payloadSha256:sha(raw),fields:Object.keys(raw).sort(compare),counts,nativeNotices:{count:view.notices.length,samples:view.notices.slice(0,sampleLimit)},additionalNativeViewData:Object.fromEntries(Object.entries(raw).filter(([key,value])=>!['nodes','edges','rows','columns','columnElements','relationshipCells'].includes(key)&&value&&typeof value==='object').map(([key,value])=>[key,brief(value)])),viewCollections:Object.fromEntries(Object.entries(raw).filter(([,value])=>Array.isArray(value)).map(([key,value])=>[key,value.length])),constructs:groupRecords(records,sampleLimit),records};
}
export function summarizeConstructs(views,{sampleLimit=4}={}){
 const groups=new Map();
 for(const view of views)for(const group of view.constructs??[]){
  const key=JSON.stringify([group.role,group.kind,group.semanticKind,group.identityStatus]);
  if(!groups.has(key))groups.set(key,{role:group.role,kind:group.kind,semanticKind:group.semanticKind,identityStatus:group.identityStatus,count:0,viewKinds:{},fieldPresence:{},structuredFieldPresence:{},nativeRolePresence:{},missingFieldCounts:{},samples:[]});
  const target=groups.get(key);target.count+=group.count;for(const name of ['viewKinds','fieldPresence','structuredFieldPresence','nativeRolePresence','missingFieldCounts'])mergeMap(target[name],group[name]);target.samples.push(...group.samples.slice(0,Math.max(0,sampleLimit-target.samples.length)));
 }
 return [...groups.values()].sort((a,b)=>compare(JSON.stringify([a.role,a.kind,a.semanticKind,a.identityStatus]),JSON.stringify([b.role,b.kind,b.semanticKind,b.identityStatus])));
}
/** Named source declarations reachable in the existing explorer are separate
 * from records actually emitted by authored views. Anonymous plumbing, value
 * expressions and memberships do not become hypothetical diagram node kinds.
 */
export function inventoryReachableDeclarations(elements,records=[],{sampleLimit=4}={}){
 const occurrences=new Map();
 for(const record of records)if(record.semanticId&&!['sequence-participant','sequence-message'].includes(record.role))occurrences.set(record.semanticId,(occurrences.get(record.semanticId)??0)+1);
 const named=elements.filter(e=>e['sysx:sourceLine']&&(e.declaredName||e.declaredShortName)&&isDeclarationKind(e['@type']));
 const groups=new Map();
 for(const native of [...named].sort((a,b)=>compare(a.qualifiedName??a['@id'],b.qualifiedName??b['@id']))){
  const kind=native['@type'];if(!groups.has(kind))groups.set(kind,{semanticKind:kind,namedSourceDeclarations:0,authoredRepresentedDeclarations:0,authoredOccurrences:0,nativeRolePresence:{},nativeModifierPresence:{},sourceDocumentMissing:0,samples:[]});
  const group=groups.get(kind),count=occurrences.get(native['@id'])??0;group.namedSourceDeclarations++;group.authoredOccurrences+=count;if(count)group.authoredRepresentedDeclarations++;if(!native['sysx:sourceDocument'])group.sourceDocumentMissing++;
  for(const [key,value]of Object.entries(native)){if(nativeRefs(value))inc(group.nativeRolePresence,key);if(typeof value==='boolean'||key==='direction')inc(group.nativeModifierPresence,key+'='+String(value));}
  if(group.samples.length<sampleLimit)group.samples.push({semanticId:native['@id'],qualifiedName:native.qualifiedName??null,declaredName:native.declaredName??native.declaredShortName,authoredOccurrences:count,source:{document:native['sysx:sourceDocument']??null,line:native['sysx:sourceLine'],column:native['sysx:sourceColumn']??null}});
 }
 return {definition:'Named source-backed native declarations accepted by the existing hierarchy declaration-kind policy. Availability is not proof the declaration was drawn, its native notation is supported, or evaluation was performed.',namedSourceDeclarations:named.length,authoredRepresentedDeclarations:named.filter(e=>occurrences.has(e['@id'])).length,kinds:[...groups.values()].sort((a,b)=>compare(a.semanticKind,b.semanticKind))};
}
/** One bounded row per actually emitted native view family. */
export function renderingFamilyMatrix(views){
 const rows=new Map();
 for(const view of views){
  if(view.status!=='rendered')continue;
  if(!rows.has(view.kind))rows.set(view.kind,{viewKind:view.kind,nativeViews:0,recordCounts:{},nativeNodeMetatypes:{},nativeEdgeKinds:{},nodeFieldPresence:{},edgeFieldPresence:{},missingNodeFields:{},missingEdgeFields:{},nativeNotices:0,representativeOccurrenceIds:[],focusedDescriptorStatus:'not-assessed'});
  const row=rows.get(view.kind);row.nativeViews++;mergeMap(row.recordCounts,view.counts);row.nativeNotices+=view.nativeNotices?.count??0;
  for(const group of view.constructs??[]){
   if(group.role==='node'){inc(row.nativeNodeMetatypes,group.semanticKind,group.count);mergeMap(row.nodeFieldPresence,group.fieldPresence);mergeMap(row.missingNodeFields,group.missingFieldCounts);}
   if(group.role==='edge'){inc(row.nativeEdgeKinds,group.kind,group.count);mergeMap(row.edgeFieldPresence,group.fieldPresence);mergeMap(row.missingEdgeFields,group.missingFieldCounts);}
   if(row.representativeOccurrenceIds.length<4&&group.samples[0])row.representativeOccurrenceIds.push(group.samples[0].occurrenceId);
  }
  if(view.rendererAssessment){
   row.focusedRenderVariants=(row.focusedRenderVariants??0)+Number(view.focusedVariant?.status==='rendered');
   row.focusedNativeRecordCounts??={};mergeMap(row.focusedNativeRecordCounts,view.focusedVariant?.counts);
   row.focusedEdgeProductions??={};mergeMap(row.focusedEdgeProductions,view.rendererAssessment.nativeDtoCoverage?.edgeProductions);
   row.focusedNodeStatusCounts??={};mergeMap(row.focusedNodeStatusCounts,view.rendererAssessment.focusedNodes.statusCounts);
   row.focusedStateBehaviorRoles??={};mergeMap(row.focusedStateBehaviorRoles,view.rendererAssessment.nativeDtoCoverage?.state.behaviorRoles);
   row.focusedEndpointLabelRecords=(row.focusedEndpointLabelRecords??0)+(view.rendererAssessment.endpointLabels?.nativeRecords??0);row.focusedNamedEndpointLabels=(row.focusedNamedEndpointLabels??0)+(view.rendererAssessment.endpointLabels?.namedRecords??0);
   row.focusedSurfaceRecordStatuses??={};mergeMap(row.focusedSurfaceRecordStatuses,view.rendererAssessment.surfaceCoverage?.statusCounts);
   row.focusedDescriptorSupportedNodes=(row.focusedDescriptorSupportedNodes??0)+view.rendererAssessment.focusedNodes.supported;
   row.focusedDescriptorTotalNodes=(row.focusedDescriptorTotalNodes??0)+view.rendererAssessment.focusedNodes.total;
   row.focusedDescriptorUnsupportedEdgeRecords=(row.focusedDescriptorUnsupportedEdgeRecords??0)+view.rendererAssessment.focusedEdges.filter(e=>!e.supported).reduce((n,e)=>n+e.count,0);
   row.focusedDescriptorNotices=(row.focusedDescriptorNotices??0)+view.rendererAssessment.focusedNotices.count;
   row.focusedDescriptorStatus='Current API result only; see notices and source digests. Browser acceptance and full standards compliance are not established.';
  }
 }
 return [...rows.values()].sort((a,b)=>compare(a.viewKind,b.viewKind));
}
function nativeClient(binary){
 const child=spawn(binary,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native JSON-RPC frame');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
 const fail=error=>{for(const job of pending.values())job.reject(error);pending.clear();};child.on('error',fail);child.on('exit',code=>fail(Error('Native engine exited: '+code)));
 return {call(method,params={}){const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});},close(){child.stdin.end();}};
}
const moduleFiles=['scripts/rendering_coverage.mjs','scripts/canvas_project_files.mjs','src/canvas-prototype/project.mjs','src/canvas-prototype/app.mjs','src/canvas-prototype/focused-native-view.mjs','src/canvas-prototype/focused-notation.mjs','src/canvas-prototype/focused-notation.css','src/canvas-prototype/notation.mjs','src/canvas-prototype/graph.mjs','src/canvas-prototype/view-contract.mjs','src/canvas-prototype/endpoint-labels.mjs','src/canvas-prototype/port-labels.mjs','src/canvas-prototype/elk-layout.mjs','src/canvas-prototype/geometry.mjs','src/canvas-prototype/canvas.css','src/canvas-prototype/manual-layout.mjs','src/canvas-prototype/presentation-layout.mjs','src/canvas-prototype/scene-regions.mjs','src/canvas-prototype/sequence-view.mjs','src/canvas-prototype/sequence-view.css','src/canvas-prototype/grid-view.mjs','src/canvas-prototype/grid-view.css'];
async function moduleDigests(){return Object.fromEntries(await Promise.all(moduleFiles.map(async path=>[path,sha(await readFile(resolve(path)))])));}
export function nativeDtoCoverage(view){
 const nodes=view.nodes??[],edges=view.edges??[],ports=nodes.flatMap(n=>n.ports??[]),behaviors=nodes.flatMap(n=>n.state?.behaviors??[]),productions={},roles={};
 for(const edge of edges)inc(productions,edge.notation?.production??'(not supplied)');for(const behavior of behaviors)inc(roles,behavior.role??'(not supplied)');
 return {nodes:nodes.length,edges:edges.length,ports:{total:ports.length,parameter:ports.filter(p=>p.parameter===true).length,canonicalIdentities:ports.filter(p=>p.semanticId&&['mapped','native'].includes(p.identityStatus)).length,nativeTypeLabels:ports.filter(p=>present(p.type)&&['mapped','native'].includes(p.identityStatus)).length,directions:ports.reduce((out,p)=>(inc(out,p.direction??'(not supplied)'),out),{})},edgeProductions:productions,edgesWithNativePortEnds:edges.filter(e=>e.fromPort||e.toPort).length,edgesWithBothNativePortEnds:edges.filter(e=>e.fromPort&&e.toPort).length,state:{structuredNodes:nodes.filter(n=>n.state).length,parallelNodes:nodes.filter(n=>n.state?.parallel===true).length,behaviorRecords:behaviors.length,behaviorRoles:roles,canonicalBehaviorIdentities:behaviors.filter(b=>b.semanticId&&['mapped','native'].includes(b.identityStatus)).length},sequence:{explicitOrders:view.sequenceOrders?.length??0,endpointEventReferences:edges.reduce((n,e)=>n+Number(!!e.notation?.sourceEvent)+Number(!!e.notation?.targetEvent),0)},nativeTypeLabels:nodes.filter(n=>present(n.type)&&['mapped','native'].includes(n.identityStatus)).length};
}
const statusOf=descriptor=>descriptor.supported?descriptor.coverage==='native-base'?'native-base':'implemented-symbol':'data-blocked';
export async function assessRenderingView(view,graph,helpers){
 const nodes=[];for(const [index,node]of view.nodes.entries()){const descriptor=helpers.focusedNodeDescriptor(node,graph,{view});nodes.push({index,occurrenceId:`${view.id}:node:${index}:${node.id}`,semanticId:node.semanticId??null,kind:node.kind,supported:descriptor.supported,status:statusOf(descriptor),shape:descriptor.shape,notices:descriptor.notices,compartments:descriptor.compartments.map(c=>({role:c.role,title:c.title,entries:c.entries?.map(e=>e.semanticId)??[],mandatory:c.mandatory??false}))});}
 const edgeGroups=new Map(),endpointLabels={nativeRecords:0,namedRecords:0,edges:0,semanticRoles:{},geometryStatus:'not-assessed-before-layout',reason:'Native role/text coverage only. Collision-free endpoint-label placement requires actual fitted nodes/routes and is verified separately.'};
 for(const edge of view.edges){const appearance=helpers.focusedEdgeAppearance(edge,{viewKind:view.kind,graph,view}),labels=appearance.endLabels??[],key=JSON.stringify([edge.kind,edge.notation?.production,appearance.supported,appearance.coverage,appearance.notice,appearance.missingFacts]);if(!edgeGroups.has(key))edgeGroups.set(key,{kind:edge.kind,production:edge.notation?.production??null,supported:appearance.supported,status:appearance.supported?appearance.coverage==='native-base'?'native-base':'implemented-symbol':edge.presentationOnly||edge.aggregate?'rejected':'data-blocked',coverage:appearance.coverage??null,notice:appearance.notice,missingFacts:appearance.missingFacts??[],count:0,representativeRelationshipId:edge.semanticId??null});edgeGroups.get(key).count++;if(labels.length)endpointLabels.edges++;for(const label of labels){endpointLabels.nativeRecords++;if(label.text?.trim())endpointLabels.namedRecords++;inc(endpointLabels.semanticRoles,label.role??'(not supplied)');}}
 const supported=nodes.filter(n=>n.supported).length,notices=helpers.focusedNotationNotices(view,graph),family=['table','matrix'].includes(view.kind)?'grid':view.kind==='sequence'?'sequence':'graph';
 const surface=family==='sequence'?helpers.sequenceNotationCoverage?.(view):family==='grid'?helpers.gridNotationCoverage?.(view):null;
 return {inputVariant:'focused-show',graphProfileApplicable:family==='graph',evidence:'Current native DTO and descriptor/API result, not browser acceptance or a full standards-compliance verdict',rendererFamily:family,nativeDtoCoverage:nativeDtoCoverage(view),focusedNodes:{supported,total:nodes.length,statusCounts:nodes.reduce((out,n)=>(inc(out,n.status),out),{}),unsupported:nodes.filter(n=>!n.supported),noticeCount:nodes.reduce((n,r)=>n+r.notices.length,0)},focusedEdges:[...edgeGroups.values()],focusedNotices:{count:notices.length,samples:notices.slice(0,12)},surfaceCoverage:surface?{...surface,statusCounts:(surface.records??[]).reduce((out,r)=>(inc(out,r.status),out),{})}:null,endpointLabels,manualLayout:{status:'not-assessed-before-layout',reason:'Manual support depends on actual fitted drawing geometry, nested bounds and explicit port attachments; raw native payloads are insufficient.'}};
}
/** Explorer fallback descriptors are separate from authored native rendering
 * occurrences. No theoretical declaration becomes an authored view count. */
export function assessReachableDeclarations(elements,graph,helpers,{sampleLimit=4}={}){
 const named=elements.filter(e=>e['sysx:sourceLine']&&(e.declaredName||e.declaredShortName)&&isDeclarationKind(e['@type'])),groups=new Map(),known=new Map(graph.elements.map(e=>[e.id,e])),ownedCounts=new Map();
 for(const edge of graph.containment??[])if(edge.nativeRole==='owner')ownedCounts.set(edge.source,(ownedCounts.get(edge.source)??0)+1);
 const projection=graphView(graph,{elements:named.map(e=>known.get(e['@id'])).filter(Boolean),relationships:[]},'Explorer declaration assessment'),projectedNodes=new Map(projection.nodes.map(n=>[n.semanticId,n]));
 for(const native of named){const element=known.get(native['@id']);if(!element)continue;const view={...projection,nodes:[projectedNodes.get(element.id)]},descriptor=helpers.focusedNodeDescriptor(view.nodes[0],graph,{view}),status=statusOf(descriptor),kind=native['@type'];
  if(!groups.has(kind))groups.set(kind,{semanticKind:kind,declarations:0,descriptorStatusCounts:{},noticeReasons:{},typeReferences:0,unresolvedTypeReferences:0,sourceOwnedRoleRecords:0,renderedMemberRecords:0,nativeModifierPresence:{},dataBlockers:[],samples:[]});const row=groups.get(kind);row.declarations++;inc(row.descriptorStatusCounts,status);row.typeReferences+=(descriptor.typeIds??[]).length;row.unresolvedTypeReferences+=(descriptor.unresolvedTypeIds??[]).length;row.sourceOwnedRoleRecords+=ownedCounts.get(element.id)??0;row.renderedMemberRecords+=descriptor.compartments.reduce((n,c)=>n+(c.entries?.length??0),0);for(const [key,value]of Object.entries(native))if(typeof value==='boolean'||key==='direction')inc(row.nativeModifierPresence,key+'='+String(value));
  for(const notice of descriptor.notices){inc(row.noticeReasons,notice.reason);if(row.dataBlockers.length<sampleLimit&&notice.reason!=='focused-native-type-label'&&!row.dataBlockers.some(n=>n.message===notice.message))row.dataBlockers.push(brief(notice));}if(row.samples.length<sampleLimit)row.samples.push({semanticId:element.id,qualifiedName:element.qualifiedName??null,status,shape:descriptor.shape,noticeCount:descriptor.notices.length});
 }
 return {scope:'Generic explorer GraphView descriptors for named source-backed declarations, not native RenderView proof. No evaluation, input configuration or behavioral layout is inferred. Type/reference/member omissions remain explicit.',declarations:named.length,kinds:[...groups.values()].sort((a,b)=>compare(a.semanticKind,b.semanticKind))};
}
export async function inventoryRenderingDataset(client,{id,root,cacheFile,sampleLimit,assess,helpers}){
 const project=await readProjectDirectory(root),sources=documentsFor(project),sourceFiles=sources.map(d=>({name:d.name,bytes:Buffer.byteLength(d.content),sha256:sha(d.content)}));
 let cache=null,cacheSha256=null,documents=sources;
 if(cacheFile){const bytes=await readFile(cacheFile);cache=JSON.parse(bytes);cacheSha256=sha(bytes);if(documentDigest(sources)!==cache.inputDigest)throw Error('Prepared cache source digest differs from current project: '+id);documents=[...sources,{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(cache.modelRoots,cache.runtimePackage,cache.requirementSeeds)}];if(documentDigest(documents)!==cache.sourceDigest)throw Error('Prepared cache runtime source digest differs: '+id);}
 console.error('ParseSources '+id);const parsed=await client.call('ParseSources',{documents});
 const errors=(parsed.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error'));if(errors.length)throw Error('Native parse rejected '+id+': '+JSON.stringify(errors));
 if(cache&&parsed.modelHash!==cache.modelHash)throw Error('Prepared cache native model hash differs: '+id);
 const exported=cache?.exported??await client.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
 const sourceDeclarations=sourceProjectDeclarations(exported.elements,cache?.runtimePackage);
 const sourceNames=new Set(sources.map(d=>d.name)),available=exported.elements.filter(e=>e['@type']==='ViewUsage'&&e.qualifiedName&&e.qualifiedName!==cache?.runtimePackage+'::coverage'&&e['sysx:sourceLine']&&(!e['sysx:sourceDocument']||sourceNames.has(e['sysx:sourceDocument']))).map(e=>e.qualifiedName).sort(compare);
 const names=[...new Set([...(cache?.availableViews??[]),...available])].sort(compare),views=[],payloads=[],authoredRecords=[];
 for(const name of names){
  let raw,origin='fresh-native-render';
  try{if(cache?.views[name]){raw=cache.views[name];origin='verified-native-cache';}else{console.error('RenderView '+id+' '+name);raw=await client.call('RenderView',{modelHash:parsed.modelHash,view:name,includeSemanticIdentity:true});}
   const item=inventoryNativeView(raw,{datasetId:id,viewId:name,elements:exported.elements,origin,sampleLimit});authoredRecords.push(...item.records);delete item.records;views.push(item);payloads.push(adaptNativeView(raw,name));
  }catch(error){views.push({id:name,status:'rejected-by-native',origin,error:error.message});}
 }
 const auxiliary=[];if(cache?.coverage){const name=cache.runtimePackage+'::coverage',item=inventoryNativeView(cache.coverage,{datasetId:id,viewId:name,elements:exported.elements,origin:'verified-native-cache',sampleLimit});delete item.records;auxiliary.push(item);payloads.push(adaptNativeView(cache.coverage,name));}
 let reachableAssessment=null;
 if(assess){
  const focusedPayloads=[];
  for(const item of views)if(item.status==='rendered')try{console.error('RenderView focused '+id+' '+item.id);const raw=await client.call('RenderView',{modelHash:parsed.modelHash,view:item.id,includeSemanticIdentity:true,show:[...FOCUSED_RENDER_SHOW]}),variant=inventoryNativeView(raw,{datasetId:id,viewId:item.id,elements:exported.elements,origin:'fresh-native-focused-show',sampleLimit});delete variant.records;variant.request={includeSemanticIdentity:true,show:[...FOCUSED_RENDER_SHOW]};item.focusedVariant=variant;focusedPayloads.push(adaptNativeView(raw,item.id));}catch(error){item.focusedVariant={id:item.id,status:'rejected-by-native',origin:'fresh-native-focused-show',request:{includeSemanticIdentity:true,show:[...FOCUSED_RENDER_SHOW]},error:error.message};}
  const graph=modelGraph(exported.elements,[...payloads,...focusedPayloads]);
  for(const item of views)if(item.focusedVariant?.status==='rendered')item.rendererAssessment=await assessRenderingView(focusedPayloads.find(p=>p.id===item.id),graph,helpers);
  for(const item of auxiliary)if(item.status==='rendered'){item.rendererAssessment=await assessRenderingView(payloads.find(p=>p.id===item.id),graph,helpers);item.rendererAssessment.inputVariant='cached-auxiliary-default';}
  reachableAssessment=assessReachableDeclarations(sourceDeclarations,graph,helpers,{sampleLimit});
 }
 return {id,root,modelHash:parsed.modelHash,documentsSha256:documentDigest(documents),sourceFiles,runtimeHelper:documents.length>sources.length?{name:documents.at(-1).name,sha256:sha(documents.at(-1).content)}:null,cache:cache?{path:cacheFile,sha256:cacheSha256,inputDigest:cache.inputDigest,sourceDigest:cache.sourceDigest,modelHash:cache.modelHash,engineVersion:cache.engineVersion,engineFingerprint:cache.engineFingerprint,verifiedCurrentSourcesAndNativeHash:true}:null,exportProjection:{kind:exported.projection??'full',records:exported.elements.length,omitted:exported.omittedElementCount??null,notice:exported.coverageNotice??exported.notice??null},declaredViewCount:names.length,views,focusedConstructs:summarizeConstructs(views.flatMap(v=>v.focusedVariant?.status==='rendered'?[v.focusedVariant]:[]),{sampleLimit}),reachableDeclarationAssessment:reachableAssessment,reachableExplorerKinds:inventoryReachableDeclarations(sourceDeclarations,authoredRecords,{sampleLimit}),auxiliaryViews:auxiliary,constructs:summarizeConstructs(views,{sampleLimit}),auxiliaryConstructs:summarizeConstructs(auxiliary,{sampleLimit})};
}
/** Verify the exact paired local assets; a matching JSON claim alone is not
 * evidence that the current native/WASM/runtime files belong to this build. */
export async function verifyEngineAssets(provenanceFile){
 const bytes=await readFile(provenanceFile),provenance=JSON.parse(bytes),assets={};
 for(const name of ['sysml-native','sysml-wasm.wasm','wasm_exec.js']){const expected=provenance.assets?.[name];if(!expected?.sha256)throw Error('Engine provenance does not identify '+name);const path=resolve(dirname(provenanceFile),name),data=await readFile(path),digest=sha(data);if(digest!==expected.sha256||expected.bytes!==undefined&&data.length!==expected.bytes)throw Error('Paired engine asset differs from provenance: '+name);assets[name]={path,sha256:digest,bytes:data.length};}
 return {provenance,provenanceSha256:sha(bytes),verifiedAssets:assets};
}
export async function createRenderingInventory({native='build/canvas-prototype/engine/sysml-native',provenance='build/canvas-prototype/engine/provenance.json',cache='build/canvas-prototype/runtime-cache.json',sampleLimit=4,assess=false,projects=[{id:'blue-dog',root:'examples/canvas-blue-dog',useCache:true},{id:'flashlight',root:'examples/canvas-prototype'},{id:'native-gallery',root:'examples/canvas-views'}]}={}){
 if(!Number.isInteger(sampleLimit)||sampleLimit<1||sampleLimit>20)throw Error('Sample limit must be 1–20');
 const verified=await verifyEngineAssets(provenance),engineProvenance=verified.provenance,binaryBytes=await readFile(native),binarySha256=sha(binaryBytes);
 if(engineProvenance.assets?.['sysml-native']?.sha256!==binarySha256)throw Error('Native binary digest does not match engine provenance');
 const client=nativeClient(resolve(native)),datasets=[],startModules=assess?await moduleDigests():null;let helpers;
 if(assess)helpers={...await import('../src/canvas-prototype/focused-notation.mjs'),...await import('../src/canvas-prototype/sequence-view.mjs'),...await import('../src/canvas-prototype/grid-view.mjs')};
 try{
  const server=await client.call('GetServerInfo');if(server.version!==engineProvenance.version)throw Error('Running native engine version differs from verified binary provenance');
  for(const project of projects)try{
   if(project.useCache){const cached=JSON.parse(await readFile(cache,'utf8'));if(cached.engineVersion!==server.version||cached.engineFingerprint!==engineProvenance.assets['sysml-wasm.wasm'].sha256)throw Error('Prepared native cache engine differs from current compiler/provenance');}
   datasets.push(await inventoryRenderingDataset(client,{...project,cacheFile:project.useCache?cache:null,sampleLimit,assess,helpers}));
  }catch(error){datasets.push({id:project.id,root:project.root,status:'blocked',error:error.message});}
  const endModules=assess?await moduleDigests():null,rendered=datasets.flatMap(d=>d.views??[]).filter(v=>v.status==='rendered'),rejected=datasets.flatMap(d=>d.views??[]).filter(v=>v.status!=='rendered');
  return {schemaVersion:'syspresent.actual-rendering-inventory.v1',generatedAt:new Date().toISOString(),scope:'Every declared native view in the three supplied projects; Blue Dog auxiliary requirement coverage is recorded separately. Only emitted native rendering records and displayed descriptor compartments are counted. Focused show variants are nested under each authored view and never added to the authored view count. No expression evaluation or theoretical metamodel inventory.',limitations:['Field absence is observation, not proof that the field is required or a compliance failure.','Renderer descriptor/API support is separate from browser rendering acceptance and OMG compliance.','Sequence nodes/messages are also counted under their raw node/edge roles; role counts must not be summed as distinct model elements.','Samples are bounded; aggregate counts cover every rendered record.','Native compiler errors and unavailable declaration identities are retained explicitly.'],engine:{nativeBinary:resolve(native),binarySha256,provenanceFile:provenance,provenanceSha256:verified.provenanceSha256,verifiedAssets:verified.verifiedAssets,sourceCommit:engineProvenance.sourceCommit,sourceDirty:engineProvenance.sourceDirty,sourceDiffSha256:engineProvenance.sourceDiffSha256,carriedPatchSha256:engineProvenance.carriedPatchSha256,goVersion:engineProvenance.goVersion,server,assets:engineProvenance.assets},rendererAssessment:assess?{startModuleDigests:startModules,endModuleDigests:endModules,modulesUnchangedDuringRun:JSON.stringify(startModules)===JSON.stringify(endModules)}:{status:'not-requested',reason:'Raw native inventory collected before concurrent renderer implementation. Run --assess to capture current descriptor APIs with module digests.'},focusedConstructs:summarizeConstructs(rendered.flatMap(v=>v.focusedVariant?.status==='rendered'?[v.focusedVariant]:[]),{sampleLimit}),summary:{focusedRenderedVariants:rendered.filter(v=>v.focusedVariant?.status==='rendered').length,focusedRejectedVariants:rendered.filter(v=>v.focusedVariant?.status==='rejected-by-native').length,datasets:datasets.length,declaredViews:datasets.reduce((n,d)=>n+(d.declaredViewCount??0),0),renderedViews:rendered.length,rejectedViews:rejected.length,blockedDatasets:datasets.filter(d=>d.status==='blocked').map(d=>d.id),viewKinds:rendered.reduce((counts,v)=>(inc(counts,v.kind),counts),{})},familyMatrix:renderingFamilyMatrix(rendered),constructs:summarizeConstructs(rendered,{sampleLimit}),datasets};
 }finally{client.close();}
}
async function main(){
 const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
 const output=resolve(option('--output','build/rendering-coverage-inventory.json'));
 const inventory=await createRenderingInventory({native:option('--native','build/canvas-prototype/engine/sysml-native'),provenance:option('--provenance','build/canvas-prototype/engine/provenance.json'),cache:option('--cache','build/canvas-prototype/runtime-cache.json'),sampleLimit:Number(option('--samples',4)),assess:args.includes('--assess')});
 try{
  const previous=JSON.parse(await readFile(output,'utf8'));
  if(previous.schemaVersion===inventory.schemaVersion){
   const baseline={generatedAt:previous.generatedAt,summary:previous.summary,engine:{sourceCommit:previous.engine.sourceCommit,binarySha256:previous.engine.binarySha256,wasmSha256:previous.engine.assets?.['sysml-wasm.wasm']?.sha256,provenanceSha256:previous.engine.provenanceSha256},datasets:previous.datasets.map(d=>({id:d.id,modelHash:d.modelHash,documentsSha256:d.documentsSha256,cacheSha256:d.cache?.sha256})),familyMatrix:previous.familyMatrix??renderingFamilyMatrix(previous.datasets.flatMap(d=>d.views??[])),rendererAssessment:previous.rendererAssessment};
   const history=previous.priorRuns??[],signature=sha({...baseline,generatedAt:undefined});if(!history.some(run=>run.signature===signature))history.push({...baseline,signature});inventory.priorRuns=history.slice(-4);
  }
 }catch(error){if(error.code!=='ENOENT')throw error;}
 await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(inventory,null,2)+'\n');console.log(JSON.stringify({output,...inventory.summary},null,2));if(inventory.summary.blockedDatasets.length||inventory.summary.rejectedViews||inventory.summary.focusedRejectedVariants||inventory.rendererAssessment.modulesUnchangedDuringRun===false)process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href)await main();
