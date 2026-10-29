#!/usr/bin/env node
/** Same-engine standalone Gorge ownership acceptance. Source bytes and native IDs
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
const baselinePath=resolve(opt('--baseline-native','build/gorge-baseline-native.json'));
const upstreamComparisonPath=opt('--upstream-comparison');
if(!upstreamComparisonPath)throw Error('Required: --upstream-comparison <gorge-native-comparison.json>. Supplementary native Query evidence is separate from the carried API contract.');
const output=resolve(opt('--output','build/canvas-prototype/gorge-standalone-integration.json'));
const sha256=value=>createHash('sha256').update(value).digest('hex');
const refs=value=>Array.isArray(value)?value.flatMap(refs):value&&typeof value==='object'&&typeof value['@id']==='string'?[value['@id']]:[];
const [project,cacheBytes,baselineBytes,comparisonBytes]=await Promise.all([readProjectDirectory(projectRoot),readFile(cachePath),readFile(baselinePath),readFile(resolve(upstreamComparisonPath))]);
const cache=JSON.parse(cacheBytes),before=JSON.parse(baselineBytes),upstream=JSON.parse(comparisonBytes);
const source=JSON.parse(fileText(project,'source.json')),migration=source.gorgeChallengeMigration;
const engineProvenanceBytes=await readFile(resolve(opt('--engine-provenance','build/canvas-prototype/engine/provenance.json')));
const engineProvenance=JSON.parse(engineProvenanceBytes),baselineRuntimeBytes=await readFile(resolve(opt('--baseline-cache','build/gorge-baseline-runtime-cache.json'))),baselineRuntime=JSON.parse(baselineRuntimeBytes);
const nativeBinarySha256=sha256(await readFile(resolve(opt('--native','build/canvas-prototype/engine/sysml-native'))));
assert.equal(nativeBinarySha256,engineProvenance.assets['sysml-native'].sha256,'Fresh export uses the authenticated paired native engine');
assert.equal(cache.engineFingerprint,engineProvenance.assets['sysml-wasm.wasm'].sha256,'Current cache matches the paired WASM engine');
assert.equal(baselineRuntime.engineFingerprint,cache.engineFingerprint,'Retained baseline and current model use the same paired semantic engine fingerprint');
assert.equal(baselineRuntime.engineVersion,before.engineVersion,'Retained baseline API/runtime engine versions match');
const engineIdentity={nativeBinarySha256,wasmSha256:cache.engineFingerprint,provenanceSha256:sha256(engineProvenanceBytes),baselineRuntimeCacheSha256:sha256(baselineRuntimeBytes),baselineNativeSha256:sha256(baselineBytes)};

const mappingBytes=fileText(project,migration.mappingFile),exactMapBytes=fileText(project,migration.elementMappingFile);
const mapping=JSON.parse(mappingBytes),exactMap=JSON.parse(exactMapBytes),prefixes=Object.keys(mapping.packages).sort((a,b)=>b.length-a.length);
const mappedBody=value=>{for(const old of prefixes)value=value.replaceAll(old+'::',mapping.packages[old]+'::').replaceAll(old,mapping.packages[old]);return value;};
const mapped=value=>{if(typeof value!=='string')return value;for(const old of prefixes)if(value===old||value.startsWith(old+'::'))return mapping.packages[old]+value.slice(old.length);return value;};
assert.equal(upstream.elementsBefore,14933);assert.equal(upstream.elementsAfter,14933);
assert.deepEqual(upstream.missing,[]);assert.deepEqual(upstream.changed,[]);assert.deepEqual(upstream.added,[]);
assert.equal(Object.keys(exactMap).length,401);
assert.equal(new Set(Object.values(exactMap)).size,401,'Reviewed identity map is injective');
for(const [oldName,newName]of Object.entries(exactMap))assert.equal(mapped(oldName),newName,'Reviewed exact identity mapping '+oldName);
assert.equal(cache.inputDigest,documentDigest(documentsFor(project)),'Rebuild stale application cache.');
const documents=documentsFor(project).filter(row=>row.name.startsWith('models/'));
assert.equal(documents.length,8);assert.deepEqual(documents.map(row=>row.name).sort(),Object.keys(migration.sourceModelHashes).sort());
assert.deepEqual(migration.sourceModelHashes,upstream.sourceHashes,'Current payload matches the supplied native Query evidence bytes');
for(const document of documents)assert.equal(sha256(document.content),migration.sourceModelHashes[document.name],document.name+' reviewed bytes');
const baselineSource=JSON.parse(execFileSync('git',['show','2c76982abde656b6f8b00f7f2d2cdc441105191d:examples/canvas-blue-dog/source.json'],{cwd:resolve(opt('--baseline-checkout','.')),maxBuffer:16*1024*1024}));
const baselineDocuments=Object.entries(baselineSource.sharedAnalysisMigration.sourceModelHashes).sort(([a],[b])=>a.localeCompare(b)).map(([name,digest])=>{
 const bytes=execFileSync('git',['show','2c76982abde656b6f8b00f7f2d2cdc441105191d:examples/canvas-blue-dog/'+name],{cwd:resolve(opt('--baseline-checkout','.')),maxBuffer:16*1024*1024});
 assert.equal(sha256(bytes),digest,'Baseline reviewed bytes '+name);return{name,content:bytes.toString('utf8'),language:'sysml'};
});
assert.equal(documentDigest(baselineDocuments),before.inputDigest,'Saved baseline native export belongs to the exact previous deployed model');
for(const document of documents.filter(row=>row.name.startsWith('models/libraries/')))assert.equal(sha256(document.content),baselineSource.sharedAnalysisMigration.sourceModelHashes[document.name],'Shared library unchanged '+document.name);
assert.equal(before.exported.elements.length,15732);

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
const after=opt('--canonical-native')?JSON.parse(await readFile(resolve(opt('--canonical-native')),'utf8')):await compileNative(documents,'canonical');
assert.equal(after.inputDigest,documentDigest(documents),'Fresh/reused native export belongs to these exact model inputs');
await writeFile(resolve(dirname(output),'gorge-standalone-canonical-native.json'),JSON.stringify(after));
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
const movedRoots=new Set(Object.keys(mapping.rootMove)),movedIssueNames=new Set(Object.keys(mapping.movedBoatInterpretation));
const movedDeclarations=new Set([...movedRoots,...movedIssueNames]);
// These four reviewed source-prose changes decouple independent rules from
// boat-specific course/verification text. All other body fields remain exact.
const reviewedProseChanges={
 "GorgeChallenge::@0": {
  "beforeSha256": "54794923697672bfd7c10009ea5aa0db6d422c6e08ffa9d0acafd7a87625cbea",
  "afterSha256": "d8f01e0b4ede82ecf8d4b5ab15f5068c6ac4e491adf58465bf24360ade23c850"
 },
 "GorgeChallenge::CourseCompletion::conditions": {
  "beforeSha256": "a9aa7ffe78b5265858144548b1c41ee06773c2ba0a6446048265f36525cb3bf2",
  "afterSha256": "cb4026f5627e787e4a70704873fcb1ddc60f2f6e1c415685c78b611def4aa3dd"
 },
 "GorgeChallenge::NavigationRules::complianceSources": {
  "beforeSha256": "5ef24d350bc5326f1d972d59f6071a2da03c2eab224307faeb9b749af6a9ce74",
  "afterSha256": "bc7dc5490e9fe60d57778c980aa32f8ebfd991e712674a3f186fa4861044b219"
 },
 "BlueDog::Verification::Challenge::@0": {
  "beforeSha256": "a51cedd784ca9710374e207f64fb116098216f0265b913b6004e2530b032852d",
  "afterSha256": "39184dbbda0cfe5642d297dbb1035a074c12a9875a021abb207a6e8f9e1c4910"
 }
};
const parentMoves=new Map();
for(const oldName of movedDeclarations){
 const original=beforeByName.get(oldName),actual=afterByName.get(mapped(oldName));
 assert.ok(original&&actual,'Moved native record is available '+oldName);
 const oldOwner=refs(original.owner).map(id=>beforeById.get(id)?.qualifiedName).find(Boolean);
 const newOwner=movedRoots.has(oldName)?null:refs(actual.owner).map(id=>afterById.get(id)?.qualifiedName).find(Boolean);
 assert.ok(oldOwner,'Previous owner is natively available '+oldName);
 if(!parentMoves.has(mapped(oldOwner)))parentMoves.set(mapped(oldOwner),[]);
 parentMoves.get(mapped(oldOwner)).push({identity:mapped(oldName),delta:-1});
 if(newOwner){if(!parentMoves.has(newOwner))parentMoves.set(newOwner,[]);parentMoves.get(newOwner).push({identity:mapped(oldName),delta:1});}
}
const ownershipChanges=[],wordingChanges=[];

for(const original of beforeRows){
 const expectedName=mapped(original.qualifiedName),actual=afterByName.get(expectedName);
 if(!actual){fail('missing-native-api-identity',{id:original.qualifiedName,mappedId:expectedName,kind:original['@type']});continue;}
 verified.identities++;
 if(original['sysx:sourceLanguage']!==actual['sysx:sourceLanguage'])projectionChanges.push({id:expectedName,field:'sysx:sourceLanguage',before:original['sysx:sourceLanguage']??null,after:actual['sysx:sourceLanguage']??null,reason:'Reviewed standalone extraction changes document-level source language markers.'});
 if(actual['@type']!==original['@type'])fail('changed-kind',{id:expectedName,before:original['@type'],after:actual['@type']});else verified.kinds++;
 for(const field of new Set([...Object.keys(original),...Object.keys(actual)])){
  if(ignored.has(field))continue;
  if(movedDeclarations.has(original.qualifiedName)&&['owner','owningNamespace','declaredName'].includes(field)){
   if(field==='declaredName'){const expected=expectedName.split('::').at(-1);if(actual[field]!==expected)fail('incorrect-migrated-declaration-name',{id:expectedName,expected,actual:actual[field]});else verified.fields++;}
   else if(movedRoots.has(original.qualifiedName)){
    assert.ok(after.nativeRootIds.includes(actual['@id']),'Standalone Challenge is an actual ParseSources document root');
    assert.ok(!refs(actual[field]).some(id=>afterById.get(id)?.qualifiedName?.startsWith('BlueDog')),'Standalone Challenge has no native BlueDog owner');
    projectionChanges.push({id:expectedName,field,reason:'Actual document root replaces the previous native containing package; unavailable namespace wrappers are not fabricated.',before:refs(original[field]),after:refs(actual[field])});
   }else{
    const expected=expectedName.split('::').slice(0,-1).join('::'),found=refs(actual[field]).map(id=>afterById.get(id)?.qualifiedName);
    if(JSON.stringify([expected])!==JSON.stringify(found))fail('incorrect-moved-interpretation-owner',{id:expectedName,field,expected,actual:found});else verified.fields++;
   }
   continue;
  }
  const intentionalMoves=parentMoves.get(expectedName);
  if(intentionalMoves&&field==='ownedMember'){
   const oldNames=refs(original[field]).map(id=>mapped(beforeById.get(id)?.qualifiedName)),newNames=refs(actual[field]).map(id=>afterById.get(id)?.qualifiedName);
   assert.ok(oldNames.every(Boolean)&&newNames.every(Boolean),'Every affected ownedMember is a known native identity');
   const removed=intentionalMoves.filter(move=>move.delta<0).map(move=>move.identity),added=intentionalMoves.filter(move=>move.delta>0).map(move=>move.identity);
   for(const id of removed){assert.equal(oldNames.filter(name=>name===id).length,1);assert.ok(!newNames.includes(id));}
   for(const id of added){assert.ok(!oldNames.includes(id));assert.equal(newNames.filter(name=>name===id).length,1);}
   assert.deepEqual(oldNames.filter(name=>!removed.includes(name)),newNames.filter(name=>!added.includes(name)),'All retained native children preserve identity and relative order');
   ownershipChanges.push({id:expectedName,field,moves:intentionalMoves,before:oldNames,after:newNames,retainedOrderVerified:true});
   continue;
  }
  if(intentionalMoves&&['ownedMembership','ownedRelationship'].includes(field)){
   const left=normalize(original[field],beforeById,mapped,field),right=normalize(actual[field],afterById,value=>value,field);
   assert.ok(Array.isArray(left)&&Array.isArray(right)&&[...left,...right].every(value=>value['@unprojected']===true),'Only unavailable ownership wrapper identities receive this boundary accounting');
   assert.equal(right.length-left.length,intentionalMoves.reduce((sum,move)=>sum+move.delta,0),'Ownership wrapper cardinality changes by exactly the reviewed move');
   ownershipChanges.push({id:expectedName,field,moves:intentionalMoves,beforeCount:left.length,afterCount:right.length,wrapperIdentityStatus:'unprojected',knownOwnedMemberProof:true});
   unavailable.partialFields++;
   continue;
  }
  if(field==='body'&&reviewedProseChanges[expectedName]){
   const beforeBody=mappedBody(original.body),afterBody=actual.body,reviewed=reviewedProseChanges[expectedName];
   assert.equal(sha256(beforeBody),reviewed.beforeSha256,'Exact reviewed prior prose '+expectedName);
   assert.equal(sha256(afterBody),reviewed.afterSha256,'Exact reviewed current prose '+expectedName);
   wordingChanges.push({id:expectedName,field,before:beforeBody,after:afterBody,...reviewed,sourcePayloadWitness:{document:expectedName.startsWith('GorgeChallenge')?'models/gorge-challenge.sysml':'models/blue-dog.sysml',sha256:migration.sourceModelHashes[expectedName.startsWith('GorgeChallenge')?'models/gorge-challenge.sysml':'models/blue-dog.sysml']},status:'reviewed-wording-change-not-unchanged-semantics'});
   continue;
  }
  const unknownBefore=unavailable.referenceTargets;
  const left=normalize(original[field],beforeById,mapped,field),right=normalize(actual[field],afterById,value=>value,field);
  if(left===undefined||right===undefined){if(left!==right)fail('native-field-presence',{id:expectedName,field,before:left,after:right});else unavailable.fields++;continue;}
  if(JSON.stringify(left)!==JSON.stringify(right))fail('changed-native-field',{id:expectedName,field,before:left,after:right});else if(unavailable.referenceTargets===unknownBefore)verified.fields++;else unavailable.partialFields++;
 }
}
const languageChanges=projectionChanges.filter(row=>row.field==='sysx:sourceLanguage');
assert.equal(languageChanges.length,1,'Exactly the newly extracted document gains its language marker');
assert.ok(languageChanges.every(row=>row.id==='GorgeChallenge'&&row.before===null&&row.after==='sysml'),'Only extracted Challenge changes its document language marker');
assert.equal(wordingChanges.length,4);assert.equal(ownershipChanges.filter(row=>row.field==='ownedMember').length,3);
const expectedNames=new Set(beforeRows.map(row=>mapped(row.qualifiedName)));
const added=afterRows.filter(row=>!expectedNames.has(row.qualifiedName)).map(row=>({id:row.qualifiedName,kind:row['@type']}));
for(const row of added)fail('unexpected-native-api-identity',row);
assert.equal(afterRows.length,15732,'No API records added or lost by the ownership correction');
const packages=afterRows.filter(row=>row['@type']==='Package'),rootNames=after.nativeRootIds.map(id=>afterById.get(id)?.qualifiedName).filter(Boolean).sort();
assert.deepEqual(rootNames,[...mapping.intendedRoots].sort());assert.equal(packages.length,115);
const movedApiRows=beforeRows.filter(row=>mapped(row.qualifiedName)!==row.qualifiedName);
for(const old of Object.keys(mapping.rootMove))assert.equal(afterByName.has(old),false,'No duplicate nested Challenge alias '+old);
assert.equal(afterByName.get('GorgeChallenge')?.['@type'],'Package');
assert.equal(afterByName.get('BlueDog::Requirements::Communications::monitoringTechnologyIssue')?.['@type'],beforeByName.get('BlueDog::Mission::Challenge::LiveObservation::issue')?.['@type']);
const appRows=cache.exported.elements.filter(row=>row.qualifiedName!==cache.runtimePackage&&!row.qualifiedName?.startsWith(cache.runtimePackage+'::'));
const graph=modelGraph(appRows,[],{nativeRootIds:cache.nativeRootIds}),appById=new Map(appRows.map(row=>[row['@id'],row]));
const rootContext=completeRootContext(graph),appRootNames=rootContext.childProjection.childIds.map(id=>appById.get(id)?.qualifiedName).sort();
assert.deepEqual(appRootNames,[...mapping.intendedRoots,'BlueDogCanvasViews'].sort(),'Whole project actual native card membership');
assert.ok(rootContext.childProjection.childIds.every(id=>appById.get(id)?.['@type']==='Package'));
const spotlightNames=['Analysis','Analysis::Marine','Analysis::Mechanics','Analysis::Energy','Analysis::Reliability','Analysis::Marine::Sailing','Analysis::Marine::Sailing::Core','GorgeChallenge','BlueDog::Requirements'];
const hierarchy=[];
for(const name of spotlightNames){
 const owner=appRows.find(row=>row.qualifiedName===name);assert.ok(owner,name+' available');
 const expected=refs(owner.ownedMember).filter(id=>isDeclarationKind(appById.get(id)?.['@type']));
 const context=completeChildContext(graph,{focus:owner['@id']});
 assert.deepEqual([...context.childProjection.childIds].sort(),expected.sort(),name+' complete native immediate children');
 hierarchy.push({qualifiedName:name,id:owner['@id'],children:context.childProjection.childIds.length,childIds:context.childProjection.childIds});
}
const beforeChallenge=beforeByName.get('BlueDog::Mission::Challenge'),afterChallenge=afterByName.get('GorgeChallenge');
assert.deepEqual(refs(beforeChallenge.ownedMember).map(id=>mapped(beforeById.get(id)?.qualifiedName)),refs(afterChallenge.ownedMember).map(id=>afterById.get(id)?.qualifiedName),'Every immediate Challenge native child remains under the actual standalone root');
const metadata=sourceMetadata(graph,{pageSize:100000});
assert.equal(metadata.total,1956);
const relationshipOwned=appRows.filter(row=>row['@type']==='MetadataUsage'&&refs(row.owner).some(id=>appById.get(id)?.['@type']==='Dependency'));
assert.equal(relationshipOwned.length,605);
for(const row of relationshipOwned)for(const ownerId of refs(row.owner))assert.ok(metadataContext(graph,ownerId).ownedMetadata.some(item=>item.id===row['@id']),'Dependency metadata remains inspectable '+row['@id']);
const reviewCoverage={contract:'supplementary upstream native Query',beforeElements:upstream.elementsBefore,afterElements:upstream.elementsAfter,movedIds:upstream.movedIds,comparisonSha256:sha256(comparisonBytes),unavailableDoesNotImplyMissingSource:true};
const result={schemaVersion:'syspresent.gorge-standalone-integration.v1',passed:!failures.length,sourceRevision:source.revision,sourceState:source.sourceState,engineVersion:after.engineVersion,engineIdentity,cacheSha256:sha256(cacheBytes),mappingSha256:sha256(mappingBytes),exactMapSha256:sha256(exactMapBytes),baselineNative:{modelHash:before.modelHash,elements:beforeRows.length,inputDigest:before.inputDigest},canonicalNative:{modelHash:after.modelHash,elements:afterRows.length,inputDigest:after.inputDigest},reviewCoverage,verified,unavailable,added,projectionChanges,ownershipChanges,wordingChanges,sourceModelHashes:migration.sourceModelHashes,modelRoots:rootNames,modelPackages:packages.length,movedApiIdentities:movedApiRows.length,wholeProjectRootNames:appRootNames,hierarchy,sourceMetadata:metadata.total,relationshipOwnedMetadata:relationshipOwned.length,failures,limits:['Source locations, formatting, member position and document language markers are not compared as semantic fields. Native known targets preserve exact qualified identity, role, multiplicity and order; unavailable wrapper/member/annotation target identities are counted as reference occurrences across both compared payloads. Fields containing those references are partialFields, never fully verified fields. Native body prose normalizes approved qualified-prefix replacements; four separately hash-pinned wording changes carry full before/after text and source-payload witness. They are not described as unchanged semantic fields.','The upstream14933→14933 Query inventory is a separate native contract. Its supplied comparison is hash-recorded, and API qualified-name coverage is reported independently.','No parser, native ID decoding, aliases or fabricated ownership is used.']};
await writeFile(output,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({output,passed:result.passed,baselineApiElements:beforeRows.length,canonicalApiElements:afterRows.length,verified,unavailable,added,modelRoots:rootNames,wholeProjectRootNames:appRootNames,hierarchy:hierarchy.map(({childIds,...row})=>row),failures:failures.length},null,2));
assert.equal(failures.length,0,'Native standalone Gorge acceptance failed; inspect '+output);
