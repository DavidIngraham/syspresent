#!/usr/bin/env node
/** Same-engine shared Analysis migration acceptance. Source bytes and native IDs
 * are authoritative. This harness never parses SysML or decodes native IDs.
 */
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
import {execFileSync,spawn} from 'node:child_process';
import {createHash} from 'node:crypto';
import {readProjectDirectory,documentDigest} from '../canvas_project_files.mjs';
import {documentsFor,fileText} from '../../src/canvas-prototype/project.mjs';
import {modelGraph,isDeclarationKind} from '../../src/canvas-prototype/graph.mjs';
import {completeRootContext,completeChildContext} from '../../src/canvas-prototype/child-exploration.mjs';
import {sourceMetadata,metadataContext} from '../../src/canvas-prototype/metadata-context.mjs';

const args=process.argv.slice(2),opt=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const projectRoot=resolve(opt('--project','examples/canvas-blue-dog'));
const cachePath=resolve(opt('--cache','build/canvas-prototype/runtime-cache.json'));
const sourceCheckout=resolve(opt('--baseline-checkout','.'));
const baselineRevision=opt('--baseline-revision','0819890f4d78a4e590b880ab5f6b8a553c24d738');
const reviewPath=opt('--review-baseline'),upstreamComparisonPath=opt('--upstream-comparison');
if(!reviewPath||!upstreamComparisonPath)throw Error('Required: --review-baseline <shared-analysis baseline.json> --upstream-comparison <native-comparison.json>. These are supplementary Query evidence, not API exports.');
const output=resolve(opt('--output','build/canvas-prototype/shared-analysis-integration.json'));
const sha256=value=>createHash('sha256').update(value).digest('hex');
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const [project,cacheBytes,reviewBytes,comparisonBytes]=await Promise.all([readProjectDirectory(projectRoot),readFile(cachePath),readFile(resolve(reviewPath)),readFile(resolve(upstreamComparisonPath))]);
const cache=JSON.parse(cacheBytes),review=JSON.parse(reviewBytes),upstream=JSON.parse(comparisonBytes);
const source=JSON.parse(fileText(project,'source.json')),migration=source.sharedAnalysisMigration;
if(source.gorgeChallengeMigration)throw Error('This command audits a historical namespace payload. Use check-gorge-challenge-standalone.mjs for the current source, or provide --project and --cache from the historical snapshot.');
const mappingBytes=fileText(project,migration.mappingFile),exactMapBytes=fileText(project,migration.elementMappingFile);
const mapping=JSON.parse(mappingBytes),exactMap=JSON.parse(exactMapBytes),prefixes=Object.keys(mapping.packages).sort((a,b)=>b.length-a.length);
const mappedBody=value=>{for(const old of prefixes)value=value.replaceAll(old+'::',mapping.packages[old]+'::');return value;};
const mapped=value=>{if(typeof value!=='string')return value;for(const old of prefixes)if(value===old||value.startsWith(old+'::'))return mapping.packages[old]+value.slice(old.length);return value;};
assert.equal(review.elements.length,14929);
assert.equal(upstream.beforeElements,14929);assert.equal(upstream.afterElements,14933);
assert.deepEqual(upstream.missing,[]);assert.deepEqual(upstream.changed,[]);
assert.deepEqual([...upstream.added].sort(),[...mapping.addedPackages].sort());
assert.equal(Object.keys(exactMap).length,707);
for(const [before,after]of Object.entries(exactMap))assert.equal(mapped(before),after,'Reviewed exact identity mapping '+before);
assert.equal(cache.inputDigest,documentDigest(documentsFor(project)),'Rebuild stale application cache.');
const documents=documentsFor(project).filter(row=>row.name.startsWith('models/'));
assert.equal(documents.length,7);
assert.deepEqual(documents.map(row=>row.name).sort(),Object.keys(migration.sourceModelHashes).sort());
for(const document of documents)assert.equal(sha256(document.content),migration.sourceModelHashes[document.name],document.name+' reviewed bytes');
for(const oldPath of Object.keys(mapping.sourcePaths))assert.equal(project.files[oldPath],undefined,'No duplicate legacy source '+oldPath);
const baselineDocuments=Object.entries(review.sourceHashes).sort(([a],[b])=>a.localeCompare(b)).map(([name,digest])=>{
 const bytes=execFileSync('git',['show',baselineRevision+':examples/canvas-blue-dog/'+name],{cwd:sourceCheckout,maxBuffer:16*1024*1024});
 assert.equal(sha256(bytes),digest,'Baseline source matches reviewed bytes '+name);return{name,content:bytes.toString('utf8')};
});
assert.equal(baselineDocuments.length,21);

async function compileNative(input,label){
 const native=resolve(opt('--native','build/canvas-prototype/engine/sysml-native'));
 const child=spawn(native,[],{stdio:['pipe','pipe','inherit'],env:{...process.env,GOMEMLIMIT:'3GiB',GOGC:'50'}});
 let buffer=Buffer.alloc(0),sequence=0;const pending=new Map(),closed=new Promise(resolve=>child.on('exit',resolve));
 const fail=error=>{for(const job of pending.values()){clearTimeout(job.timer);job.reject(error);}pending.clear();};
 child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length))throw Error('Invalid native frame');if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);clearTimeout(job.timer);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
 child.on('error',fail);child.on('exit',code=>fail(Error('Native '+label+' exited '+code)));
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params})),timer=setTimeout(()=>{pending.delete(id);child.kill();reject(Error('Native '+label+' '+method+' timed out'));},180000);pending.set(id,{resolve,reject,timer});child.stdin.write('Content-Length: '+data.length+'\r\n\r\n');child.stdin.write(data);});
 try{
  console.error(label+': ParseSources '+input.length+' exact model documents');
  const info=await call('GetServerInfo'),parsed=await call('ParseSources',{documents:input});
  assert.ok(!(parsed.diagnostics??[]).some(row=>String(row.severity).toLowerCase().includes('error')),JSON.stringify(parsed.diagnostics));
  console.error(label+': ExportModel declarations');
  const exported=await call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
  return{engineVersion:info.version,inputDigest:documentDigest(input),modelHash:parsed.modelHash,nativeRootIds:(parsed.roots??[]).flatMap(row=>row.childIds??[]),exported};
 }finally{child.stdin.end();await closed;}
}
await mkdir(dirname(output),{recursive:true});
const before=await compileNative(baselineDocuments,'baseline');
await writeFile(resolve(dirname(output),'shared-analysis-baseline-native.json'),JSON.stringify(before));
const after=await compileNative(documents,'canonical');
await writeFile(resolve(dirname(output),'shared-analysis-canonical-native.json'),JSON.stringify(after));
assert.equal(before.engineVersion,after.engineVersion);assert.equal(after.engineVersion,cache.engineVersion);
const beforeRows=before.exported.elements,afterRows=after.exported.elements;
const beforeById=new Map(beforeRows.map(row=>[row['@id'],row])),afterById=new Map(afterRows.map(row=>[row['@id'],row]));
const beforeByName=new Map(beforeRows.map(row=>[row.qualifiedName,row])),afterByName=new Map(afterRows.map(row=>[row.qualifiedName,row]));
assert.equal(beforeByName.size,beforeRows.length,'Unique baseline qualified identities');
assert.equal(afterByName.size,afterRows.length,'Unique canonical qualified identities');
const failures=[],projectionChanges=[],unavailable={fields:0,partialFields:0,referenceTargets:0,byField:{}},verified={identities:0,kinds:0,fields:0,referenceTargets:0};
const fail=(reason,detail)=>failures.push({reason,...detail});
const normalize=(value,index,mapName,field)=>{
 if(Array.isArray(value))return value.map(child=>normalize(child,index,mapName,field));
 if(value&&typeof value==='object'){
  if(typeof value['@id']==='string'){const target=index.get(value['@id']);if(target?.qualifiedName){verified.referenceTargets++;return{'@qualifiedName':mapName(target.qualifiedName)};}unavailable.referenceTargets++;unavailable.byField[field]=(unavailable.byField[field]??0)+1;return{'@unprojected':true};}
  return Object.fromEntries(Object.keys(value).sort().map(key=>[key,normalize(value[key],index,mapName,field)]));
 }
 return typeof value==='string'?(field==='body'&&mapName===mapped?mappedBody(value):mapName(value)):value;
};
// Locations, source formatting, native document wrapper plumbing and implicit
// compiler-generated records are tracked separately from semantic properties.
const ignored=new Set(['@id','elementId','qualifiedName','sysx:memberIndex','sysx:sourceLine','sysx:sourceColumn','sysx:sourceEndLine','sysx:sourceEndColumn','sysx:sourceDocument','sysx:sourceText','sysx:sourceTail','sysx:sourceLanguage']);
const movedPackages=new Set(prefixes);
for(const original of beforeRows){
 const expectedName=mapped(original.qualifiedName),actual=afterByName.get(expectedName);
 if(!actual){fail('missing-native-api-identity',{id:original.qualifiedName,mappedId:expectedName,kind:original['@type']});continue;}
 verified.identities++;
 if(original['sysx:sourceLanguage']!==actual['sysx:sourceLanguage'])projectionChanges.push({id:expectedName,field:'sysx:sourceLanguage',before:original['sysx:sourceLanguage']??null,after:actual['sysx:sourceLanguage']??null,reason:'Former document root is now a nested package; document language is carried by Analysis.'});
 if(actual['@type']!==original['@type'])fail('changed-kind',{id:expectedName,before:original['@type'],after:actual['@type']});else verified.kinds++;
 for(const field of new Set([...Object.keys(original),...Object.keys(actual)])){
  if(ignored.has(field))continue;
  if(movedPackages.has(original.qualifiedName)&&['owner','owningNamespace','declaredName'].includes(field)){
   const expected=field==='declaredName'?expectedName.split('::').at(-1):[expectedName.split('::').slice(0,-1).join('::')];
   const found=field==='declaredName'?actual[field]:refs(actual[field]).map(id=>afterById.get(id)?.qualifiedName);
   if(JSON.stringify(expected)!==JSON.stringify(found))fail('incorrect-migrated-package-owner-or-name',{id:expectedName,field,expected,actual:found});else verified.fields++;
   continue;
  }
  const unknownBefore=unavailable.referenceTargets;
  const left=normalize(original[field],beforeById,mapped,field),right=normalize(actual[field],afterById,value=>value,field);
  if(left===undefined||right===undefined){if(left!==right)fail('native-field-presence',{id:expectedName,field,before:left,after:right});else unavailable.fields++;continue;}
  if(JSON.stringify(left)!==JSON.stringify(right))fail('changed-native-field',{id:expectedName,field,before:left,after:right});else if(unavailable.referenceTargets===unknownBefore)verified.fields++;else unavailable.partialFields++;
 }
}
assert.equal(projectionChanges.length,15,'Only former document roots lose their document-level language marker');
assert.ok(projectionChanges.every(row=>mapping.packages[beforeRows.find(original=>mapped(original.qualifiedName)===row.id)?.qualifiedName]===row.id));
const expectedNames=new Set(beforeRows.map(row=>mapped(row.qualifiedName)));
const added=afterRows.filter(row=>!expectedNames.has(row.qualifiedName)).map(row=>({id:row.qualifiedName,kind:row['@type']}));
for(const row of added)if(!mapping.addedPackages.includes(row.id))fail('unexpected-native-api-identity',row);
for(const id of mapping.addedPackages)assert.equal(afterByName.get(id)?.['@type'],'Package',id+' is an actual added native Package');
const packages=afterRows.filter(row=>row['@type']==='Package'),rootNames=after.nativeRootIds.map(id=>afterById.get(id)?.qualifiedName).filter(Boolean).sort();
assert.deepEqual(rootNames,[...mapping.intendedRoots].sort());assert.equal(packages.length,115);
const movedCalculations=beforeRows.filter(row=>row['@type']==='CalculationDefinition'&&mapped(row.qualifiedName)!==row.qualifiedName);
assert.equal(movedCalculations.length,44);
for(const old of prefixes)assert.equal(afterByName.has(old),false,'No legacy root alias '+old);
const appRows=cache.exported.elements.filter(row=>row.qualifiedName!==cache.runtimePackage&&!row.qualifiedName?.startsWith(cache.runtimePackage+'::'));
const graph=modelGraph(appRows,[],{nativeRootIds:cache.nativeRootIds}),appById=new Map(appRows.map(row=>[row['@id'],row]));
const rootContext=completeRootContext(graph),appRootNames=rootContext.childProjection.childIds.map(id=>appById.get(id)?.qualifiedName).sort();
assert.deepEqual(appRootNames,[...mapping.intendedRoots,'BlueDogCanvasViews'].sort(),'Whole project actual native card membership');
assert.ok(rootContext.childProjection.childIds.every(id=>appById.get(id)?.['@type']==='Package'));
const spotlightNames=['Analysis','Analysis::Marine','Analysis::Mechanics','Analysis::Energy','Analysis::Reliability','Analysis::Marine::Sailing','Analysis::Marine::Sailing::Core','BlueDog::Mission::Challenge','BlueDog::Requirements'];
const hierarchy=[];
for(const name of spotlightNames){
 const owner=appRows.find(row=>row.qualifiedName===name);assert.ok(owner,name+' available');
 const expected=refs(owner.ownedMember).filter(id=>isDeclarationKind(appById.get(id)?.['@type']));
 const context=completeChildContext(graph,{focus:owner['@id']});
 assert.deepEqual([...context.childProjection.childIds].sort(),expected.sort(),name+' complete native immediate children');
 hierarchy.push({qualifiedName:name,id:owner['@id'],children:context.childProjection.childIds.length,childIds:context.childProjection.childIds});
}
const beforeChallenge=beforeByName.get('BlueDog::Mission::Challenge'),afterChallenge=afterByName.get('BlueDog::Mission::Challenge');
assert.deepEqual(refs(beforeChallenge.ownedMember).map(id=>beforeById.get(id)?.qualifiedName),refs(afterChallenge.ownedMember).map(id=>afterById.get(id)?.qualifiedName),'Challenge native child identities unchanged');
const metadata=sourceMetadata(graph,{pageSize:100000});
assert.equal(metadata.total,1956);
const relationshipOwned=appRows.filter(row=>row['@type']==='MetadataUsage'&&refs(row.owner).some(id=>appById.get(id)?.['@type']==='Dependency'));
assert.equal(relationshipOwned.length,605);
for(const row of relationshipOwned)for(const ownerId of refs(row.owner))assert.ok(metadataContext(graph,ownerId).ownedMetadata.some(item=>item.id===row['@id']),'Dependency metadata remains inspectable '+row['@id']);
const reviewCoverage={contract:'supplementary upstream native Query',beforeElements:review.elements.length,afterElements:upstream.afterElements,mappedQualifiedNamesAvailableInApi:review.elements.filter(row=>afterByName.has(mapped(row.id))).length,reviewSha256:sha256(reviewBytes),comparisonSha256:sha256(comparisonBytes),unavailableDoesNotImplyMissingSource:true};
const result={schemaVersion:'syspresent.shared-analysis-integration.v1',passed:!failures.length,sourceRevision:source.revision,engineVersion:after.engineVersion,cacheSha256:sha256(cacheBytes),mappingSha256:sha256(mappingBytes),exactMapSha256:sha256(exactMapBytes),baselineNative:{modelHash:before.modelHash,elements:beforeRows.length,inputDigest:before.inputDigest},canonicalNative:{modelHash:after.modelHash,elements:afterRows.length,inputDigest:after.inputDigest},reviewCoverage,verified,unavailable,added,projectionChanges,modelRoots:rootNames,modelPackages:packages.length,movedCalculationDefinitions:movedCalculations.length,wholeProjectRootNames:appRootNames,hierarchy,sourceMetadata:metadata.total,relationshipOwnedMetadata:relationshipOwned.length,failures,limits:['Source locations, formatting, member position and document language markers are not compared as semantic fields. Native known targets preserve exact qualified identity, role, multiplicity and order; unavailable wrapper/member/annotation target identities are counted as reference occurrences across both compared payloads. Fields containing those references are partialFields, never fully verified fields. Native body prose normalizes only the approved qualified-prefix replacements.','The upstream14929→14933 Query inventory is a separate native contract. Its supplied comparison is hash-recorded, and API qualified-name coverage is reported independently.','No parser, native ID decoding, aliases or fabricated ownership is used.']};
await writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output,passed:result.passed,baselineApiElements:beforeRows.length,canonicalApiElements:afterRows.length,verified,unavailable,added,modelRoots:rootNames,wholeProjectRootNames:appRootNames,hierarchy:hierarchy.map(({childIds,...row})=>row),failures:failures.length},null,2));
assert.equal(failures.length,0,'Native shared Analysis acceptance failed; inspect '+output);
