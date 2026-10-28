#!/usr/bin/env node
/** Read-only namespace acceptance over fresh native exports and reviewed native inventory.
 * No source parser or native identity reconstruction is used. Unavailable native
 * fields are reported separately from verified properties and semantic failures.
 */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {resolve,dirname,join} from 'node:path';
import {spawn,execFileSync} from 'node:child_process';
import {readProjectDirectory,documentDigest} from '../canvas_project_files.mjs';
import {documentsFor,fileText} from '../../src/canvas-prototype/project.mjs';
import {modelGraph,isDeclarationKind} from '../../src/canvas-prototype/graph.mjs';
import {completeChildContext,completeRootContext} from '../../src/canvas-prototype/child-exploration.mjs';

const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const projectRoot=resolve(option('--project','examples/canvas-blue-dog'));
const cachePath=resolve(option('--cache','build/canvas-prototype/runtime-cache.json'));
const baselinePath=option('--baseline'),mappingPath=option('--mapping');
if(!baselinePath||!mappingPath)throw Error('Required: --baseline <review baseline.json> --mapping <review namespace-map.json>. Native cache must be freshly built from this exact project.');
const output=resolve(option('--output','build/canvas-prototype/namespace-integration.json'));
const sha256=value=>createHash('sha256').update(value).digest('hex');
const [project,cacheBytes,baselineBytes,mappingBytes]=await Promise.all([readProjectDirectory(projectRoot),readFile(cachePath),readFile(resolve(baselinePath)),readFile(resolve(mappingPath))]);
const cache=JSON.parse(cacheBytes),baseline=JSON.parse(baselineBytes),mapping=JSON.parse(mappingBytes),source=JSON.parse(fileText(project,'source.json'));
assert.equal(cache.inputDigest,documentDigest(documentsFor(project)),'Native cache must match the current complete source/view inputs; rebuild stale caches.');
assert.equal(fileText(project,source.namespaceMigration.mappingFile),mappingBytes.toString('utf8'),'Bundled migration map must preserve authoritative reviewed bytes.');
assert.equal(mapping.baseline,source.namespaceMigration.baselineRevision);
const prefixes=Object.keys(mapping.packages).sort((a,b)=>b.length-a.length);
const mapped=value=>{
 if(typeof value==='string'){for(const old of prefixes)if(value===old||value.startsWith(old+'::'))return mapping.packages[old]+value.slice(old.length);return value;}
 if(Array.isArray(value))return value.map(mapped);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([key,child])=>[key,mapped(child)]));
 return value;
};
const expected=baseline.elements.map(original=>{
 const row=mapped(original);
 if(row.kind==='Package'){const parent=row.id.slice(0,row.id.lastIndexOf('::'));if(row.id.includes('::'))row.properties.owner=parent;else delete row.properties.owner;}
 return row;
});
for(const id of source.namespaceMigration.addedOrganizerIds)expected.push({id,kind:'Package',properties:{owner:id.slice(0,id.lastIndexOf('::'))}});
assert.equal(expected.length,14929,'Reviewed baseline plus six organizing packages');
assert.equal(new Set(expected.map(row=>row.id)).size,expected.length,'Mapping cannot merge distinct native identities.');
const reviewExpected=structuredClone(expected);
const nativeIds=value=>Array.isArray(value)?value.flatMap(nativeIds):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
async function compileNative(documents,label){
 const native=resolve(option('--native','build/canvas-prototype/engine/sysml-native'));
 const child=spawn(native,[],{stdio:['pipe','pipe','inherit'],env:{...process.env,GOMEMLIMIT:option('--memory-limit','3GiB'),GOGC:'50'}});
 let buffer=Buffer.alloc(0),sequence=0;const pending=new Map(),closed=new Promise(resolve=>child.on('exit',resolve));
 child.stdout.on('data',chunk=>{
  buffer=Buffer.concat([buffer,chunk]);
  while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native frame');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);clearTimeout(job.timer);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}
 });
 const fail=error=>{for(const job of pending.values()){clearTimeout(job.timer);job.reject(error);}pending.clear();};
 child.on('error',fail);child.on('exit',code=>fail(Error('Native '+label+' exited '+code)));
 const call=(method,params={})=>new Promise((resolve,reject)=>{
  const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params})),timer=setTimeout(()=>{pending.delete(id);child.kill();reject(Error('Native '+label+' '+method+' timed out'));},180000);
  pending.set(id,{resolve,reject,timer});child.stdin.write('Content-Length: '+data.length+'\r\n\r\n');child.stdin.write(data);
 });
 try{
  console.error(label+': ParseSources '+documents.length+' exact model documents');
  const info=await call('GetServerInfo'),parsed=await call('ParseSources',{documents});
  assert.ok(!(parsed.diagnostics??[]).some(item=>String(item.severity).toLowerCase().includes('error')),JSON.stringify(parsed.diagnostics));
  console.error(label+': ExportModel declarations');
  const exported=await call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
  return {engineVersion:info.version,modelHash:parsed.modelHash,inputDigest:documentDigest(documents),exported};
 }finally{child.stdin.end();await closed;}
}
let beforeNative,afterNative;
if(args.includes('--prepare-native-baseline')){
 const checkout=option('--source-checkout');if(!checkout)throw Error('--prepare-native-baseline requires --source-checkout for read-only git show.');
 const beforeDocuments=[];
 for(const [name,digest]of Object.entries(baseline.sourceHashes).sort(([a],[b])=>a.localeCompare(b))){
  const bytes=execFileSync('git',['show',mapping.baseline+':'+name],{cwd:resolve(checkout),maxBuffer:16*1024*1024});
  assert.equal(sha256(bytes),digest,'Reviewed baseline bytes '+name);
  const destination=resolve(dirname(output),'namespace-baseline-sources',name);await mkdir(dirname(destination),{recursive:true});await writeFile(destination,bytes);
  beforeDocuments.push({name,content:bytes.toString('utf8')});
 }
 const afterDocuments=documentsFor(project).filter(document=>document.name.startsWith('models/'));
 assert.equal(beforeDocuments.length,96);assert.equal(afterDocuments.length,21);
 beforeNative=await compileNative(beforeDocuments,'baseline');await writeFile(resolve(dirname(output),'namespace-baseline-native.json'),JSON.stringify(beforeNative));
 afterNative=await compileNative(afterDocuments,'canonical');await writeFile(resolve(dirname(output),'namespace-canonical-native.json'),JSON.stringify(afterNative));
}else{
 const beforePath=option('--baseline-native-cache'),afterPath=option('--canonical-native-cache');
 if(!beforePath||!afterPath)throw Error('Provide --prepare-native-baseline --source-checkout, or --baseline-native-cache and --canonical-native-cache. Reviewed Query inventories and API exports must not be conflated.');
 [beforeNative,afterNative]=await Promise.all([readFile(resolve(beforePath),'utf8').then(JSON.parse),readFile(resolve(afterPath),'utf8').then(JSON.parse)]);
}
assert.equal(beforeNative.engineVersion,afterNative.engineVersion,'Both native payloads must use the same engine.');
assert.equal(afterNative.engineVersion,cache.engineVersion,'App cache and pure payload exports must use the same engine.');
assert.equal(afterNative.inputDigest,documentDigest(documentsFor(project).filter(document=>document.name.startsWith('models/'))),'Canonical native evidence must match the exact 21 model files.');
const beforeRecords=beforeNative.exported.elements,beforeById=new Map(beforeRecords.map(row=>[row['@id'],row]));
const baselineUnprojectedReferences={owner:0,type:0,general:0};
for(const row of beforeRecords)for(const [property,field]of [['owner','owner'],['type','type'],['general','specializes']])if(nativeIds(row[field]).some(id=>!beforeById.get(id)?.qualifiedName))baselineUnprojectedReferences[property]++;
expected.splice(0,expected.length,...beforeRecords.filter(row=>row.qualifiedName).map(actual=>{
 const properties={},getNames=field=>nativeIds(actual[field]).map(id=>beforeById.get(id)?.qualifiedName).filter(Boolean);
 for(const [property,field]of [['owner','owner'],['type','type'],['general','specializes']]){const values=getNames(field);if(values.length)properties[property]=values.length===1?values[0]:values;}
 const row=mapped({id:actual.qualifiedName,kind:actual['@type'],properties});
 if(row.kind==='Package'){if(row.id.includes('::'))row.properties.owner=row.id.slice(0,row.id.lastIndexOf('::'));else delete row.properties.owner;}
 return row;
}));
for(const id of source.namespaceMigration.addedOrganizerIds)expected.push({id,kind:'Package',properties:{owner:id.slice(0,id.lastIndexOf('::'))}});
assert.equal(new Set(expected.map(row=>row.id)).size,expected.length,'Same-engine native mapping cannot merge identities.');
const expectedByName=new Map(expected.map(row=>[row.id,row]));
const pureByName=new Map(afterNative.exported.elements.map(row=>[row.qualifiedName,row]));

const records=(cache.exported.elements??[]).filter(row=>row.qualifiedName!==cache.runtimePackage&&!row.qualifiedName?.startsWith(cache.runtimePackage+'::'));
const byId=new Map(records.map(row=>[row['@id'],row])),byName=new Map();
for(const row of records){if(!byName.has(row.qualifiedName))byName.set(row.qualifiedName,[]);byName.get(row.qualifiedName).push(row);}
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const names=value=>Array.isArray(value)?value.flatMap(names):typeof value==='string'?[value]:[];
const failures=[],plumbingChanges=[],coverage={reviewedQueryElements:baseline.elements.length,baselineElements:beforeRecords.length,expectedElements:expected.length,matched:0,matchedByKind:{},excludedByProjection:{},verifiedProperties:{owner:0,type:0,general:0},unavailableProperties:{owner:0,type:0,general:0},sourceTexts:0,sourceTails:0};
const fail=(reason,detail)=>failures.push({reason,...detail});
const compareProperty=(row,actual,property,field)=>{
 const expectedNames=names(row.properties[property]),actualIds=refs(actual[field]);
 const resolved=actualIds.map(id=>byId.get(id)?.qualifiedName),known=resolved.filter(Boolean),unknown=resolved.filter(name=>!name).length;
 // Export projection may omit standard-library classifiers or owner plumbing.
 // A QName is never guessed from an encoded ID or source text.
 if(!actualIds.length||unknown)coverage.unavailableProperties[property]++;
 else coverage.verifiedProperties[property]++;
 for(const name of known)if(!expectedNames.includes(name))fail('native-'+property+'-changed',{id:row.id,expected:expectedNames,actual:known,unresolvedReferences:unknown});
 for(const name of expectedNames)if(byName.has(name)&&!known.includes(name))fail('native-'+property+'-missing',{id:row.id,expected:name,actual:known,unresolvedReferences:unknown});
};
const rootSources=new Map((baseline.roots??[]).map(root=>[mapped(root.id),mapping.sourcePaths[root.file]??root.file]));
rootSources.set('BlueDog','models/blue-dog.sysml');
const sourceFor=row=>{
 let current=row,seen=new Set();
 while(current&&!seen.has(current.id)){
  seen.add(current.id);if(rootSources.has(current.id))return rootSources.get(current.id);
  current=expectedByName.get(current.properties.owner);
 }
};
const linesByFile=new Map();
const sourceSpanMatches=(file,line,column,snippet)=>{
 if(!linesByFile.has(file)){
  const text=fileText(project,file),offsets=[0];let next=text.indexOf('\n');
  while(next>=0){offsets.push(next+1);next=text.indexOf('\n',next+1);}
  linesByFile.set(file,{text,offsets});
 }
 const {text,offsets}=linesByFile.get(file),token=(offsets[line-1]??text.length)+Math.max(0,(column??1)-1);
 let at=text.indexOf(snippet);
 while(at>=0&&at<=token){if(at+snippet.length>=token)return true;at=text.indexOf(snippet,at+1);}
 return false;
};
for(const row of expected){
 const candidates=byName.get(row.id)??[];
 if(candidates.length!==1){
  if(!candidates.length&&row.kind==='NamespaceImport'){plumbingChanges.push({change:'removed',id:row.id,kind:row.kind});continue;}
  fail(candidates.length?'ambiguous-native-qualified-identity':'missing-native-declaration',{id:row.id,kind:row.kind,count:candidates.length});continue;
 }
 const actual=candidates[0],pure=pureByName.get(row.id);if(!pure)fail('missing-pure-native-declaration',{id:row.id,kind:row.kind});else if(pure['@type']!==actual['@type'])fail('viewer-helper-changed-kind',{id:row.id,expected:pure['@type'],actual:actual['@type']});coverage.matched++;coverage.matchedByKind[row.kind]=(coverage.matchedByKind[row.kind]??0)+1;
 if(actual['@type']!==row.kind)fail('native-kind-changed',{id:row.id,expected:row.kind,actual:actual['@type']});
 if(row.properties.owner)compareProperty(row,actual,'owner','owner');
 else if(refs(actual.owner).some(id=>byId.has(id)))fail('native-root-gained-owner',{id:row.id,actual:refs(actual.owner)});
 if(row.properties.type||refs(actual.type).some(id=>byId.get(id)?.qualifiedName))compareProperty(row,actual,'type','type');
 // Native query "general" is not automatically equivalent to the usage's type.
 // Only compare explicit exported specialization targets; disclose the rest.
 if(row.properties.general||refs(actual.specializes).some(id=>byId.get(id)?.qualifiedName)){if(actual.specializes)compareProperty(row,actual,'general','specializes');else coverage.unavailableProperties.general++;}
 const file=sourceFor(row);
 if(file&&actual['sysx:sourceText']&&actual['sysx:sourceLine']){
  coverage.sourceTexts++;if(!sourceSpanMatches(file,actual['sysx:sourceLine'],actual['sysx:sourceColumn'],actual['sysx:sourceText']))fail('native-source-text-changed',{id:row.id,file,line:actual['sysx:sourceLine']});
 }
 if(file&&actual['sysx:sourceTail']&&actual['sysx:sourceEndLine']){
  coverage.sourceTails++;if(!sourceSpanMatches(file,actual['sysx:sourceEndLine'],actual['sysx:sourceEndColumn'],actual['sysx:sourceTail']))fail('native-source-tail-changed',{id:row.id,file,line:actual['sysx:sourceEndLine']});
 }
}
const packageNames=expected.filter(row=>row.kind==='Package').map(row=>row.id).sort();
const expectedRoots=expected.filter(row=>row.kind==='Package'&&!row.properties.owner).map(row=>row.id).sort();
assert.equal(packageNames.length,111);assert.equal(expectedRoots.length,21);
const extraPayloadDeclarations=afterNative.exported.elements.filter(row=>row.qualifiedName&&!expectedByName.has(row.qualifiedName));
for(const row of extraPayloadDeclarations){if(row['@type']==='NamespaceImport')plumbingChanges.push({change:'added',id:row.qualifiedName,kind:row['@type']});else fail('unexpected-payload-native-identity',{id:row.qualifiedName,kind:row['@type']});}
assert.deepEqual(plumbingChanges.map(item=>[item.change,item.id,item.kind]).sort(),[['removed','BlueDog::@1','NamespaceImport'],['removed','BlueDog::@2','NamespaceImport'],['added','BlueDog::Architecture::@44','NamespaceImport']].sort(),'Only explicit namespace import scaffolding changes; native declarations remain invariant.');
for(const legacy of Object.keys(mapping.packages))if(byName.has(legacy))fail('legacy-package-still-loaded',{id:legacy});
const graph=modelGraph(records,[...(cache.views?Object.entries(cache.views).map(([id,view])=>({...view,id})):[])],{nativeRootIds:cache.nativeRootIds}),spotlights=['BlueDog','BlueDog::Mission','BlueDog::Mission::Challenge','BlueDog::Requirements','BlueDog::Architecture','BlueDog::Analyses','MarineSailing::Core'],hierarchy=[];
for(const name of [...new Set([...packageNames,...spotlights])]){
 const actual=(byName.get(name)??[])[0];if(!actual)continue;
 const immediate=records.filter(row=>row['sysx:sourceLine']&&isDeclarationKind(row['@type'])&&refs(row.owner).includes(actual['@id'])).map(row=>row['@id']).sort();
 const context=completeChildContext(graph,{focus:actual['@id'],includeDirectTypes:false,budget:1,page:999});
 const actualIds=[...context.childProjection.childIds].sort();
 if(JSON.stringify(actualIds)!==JSON.stringify(immediate))fail('native-immediate-child-membership',{id:name,expected:immediate,actual:actualIds});
 if(context.omissions.some(item=>item.reason==='budget'))fail('hidden-child-budget',{id:name});
 hierarchy.push({qualifiedName:name,id:actual['@id'],children:immediate.length,childIdentityDigest:sha256(JSON.stringify(immediate)),kindCounts:context.childProjection.kindCounts});
}
const rootContext=completeRootContext(graph),rootPackageNames=rootContext.elements.filter(row=>row.kind==='Package').map(row=>row.qualifiedName).sort();
for(const root of expectedRoots)if(!rootPackageNames.includes(root))fail('missing-native-package-root',{id:root});
for(const nested of packageNames.filter(name=>!expectedRoots.includes(name)))if(rootPackageNames.includes(nested))fail('nested-package-flattened',{id:nested});
const reviewProjectionCoverage={expected:reviewExpected.length,matchedQualifiedNames:reviewExpected.filter(row=>byName.has(row.id)).length,unavailableQualifiedNames:reviewExpected.filter(row=>!byName.has(row.id)).length,kindDifferences:reviewExpected.filter(row=>byName.has(row.id)&&byName.get(row.id)[0]['@type']!==row.kind).length,notice:'Reviewed native Query output expands inherited/instantiated records and uses different kind labels. It is supplementary preservation evidence, not the same contract as source API export.'};
const result={baselineUnprojectedReferences,plumbingChanges,baselineNative:{modelHash:beforeNative.modelHash,inputDigest:beforeNative.inputDigest,elements:beforeRecords.length,engineVersion:beforeNative.engineVersion},canonicalNative:{modelHash:afterNative.modelHash,inputDigest:afterNative.inputDigest,elements:afterNative.exported.elements.length,engineVersion:afterNative.engineVersion},reviewProjectionCoverage,schemaVersion:'syspresent.namespace-integration.v1',passed:!failures.length,sourceRevision:source.revision,sourceCommit:source.sourceCommit,modelHash:cache.modelHash,engineVersion:cache.engineVersion,engineFingerprint:cache.engineFingerprint,inputDigest:cache.inputDigest,cacheSha256:sha256(cacheBytes),baselineSha256:sha256(baselineBytes),mappingSha256:sha256(mappingBytes),coverage,payloadPackageCount:packageNames.length,payloadRootPackages:expectedRoots,loadedRootPackages:rootPackageNames,rootProjection:{total:rootContext.total,kindCounts:rootContext.summary.kindCounts,relationshipMetadata:rootContext.summary.relationshipMetadata,sourceMetadata:rootContext.summary.sourceMetadata,inspectionEntries:rootContext.summary.inspectionEntries},hierarchy,failures,limits:['Baseline query fields absent from native declaration projection are explicitly counted as unavailable; no classifier identity is inferred from labels or encoded IDs.','Source validation compares native reported declaration/tail bytes at native reported source lines; it does not parse source.','Upstream full native Query preservation evidence remains separate; acceptance compares baseline and canonical API exports compiled by this same application engine.']};
await mkdir(dirname(output),{recursive:true});await writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output,passed:result.passed,matched:coverage.matched,excludedByProjection:coverage.excludedByProjection,verifiedProperties:coverage.verifiedProperties,unavailableProperties:coverage.unavailableProperties,baselineUnprojectedReferences,sourceTexts:coverage.sourceTexts,sourceTails:coverage.sourceTails,payloadPackages:packageNames.length,payloadRoots:expectedRoots.length,spotlights:hierarchy.filter(row=>spotlights.includes(row.qualifiedName)),failures:failures.length},null,2));
assert.equal(failures.length,0,'Namespace acceptance failed; inspect '+output);
