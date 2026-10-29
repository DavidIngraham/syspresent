import {fileURLToPath} from 'node:url';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateProject,packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
const sha256=data=>createHash('sha256').update(data).digest('hex');
const evidenceRevision='680a36b2ca452260cb5e01c32534d0a9ec715d30';
const implementationRevision='680a36b2ca452260cb5e01c32534d0a9ec715d30';
const namespaceBaseline='8f2dd804e964fd75828ff170c8c93572c751c8f2';
// Byte identities from the reviewed, committed namespace handoff. Native semantic
// ownership is validated separately; this test does not parse SysML text.
const sourceModelHashes={
 "models/blue-dog.sysml": "9b4edf033775f6548658dc10fe263fcdc3e80f9c6e66cc36b16ebf6e98d4ba47",
 "models/gorge-challenge.sysml": "abd0ad9d39cb5b334170c7239862d1e770b521831e56b9f4fa3453c584c54fe9",
 "models/libraries/analysis.sysml": "98065dc7f0298faffb538558fc960f030787a611632b0650b3706d1e748a37ff",
 "models/libraries/decision-records.sysml": "93102a19a7e9c69cd35544bf7f4815657164803fd1bbe9af6d6689ad613f52f3",
 "models/libraries/energy/budget.sysml": "6b2f8c827db736130e1f343652d7d45695a4c4b18d5b4e7ac07f3d7a444ca365",
 "models/libraries/marine/design.sysml": "e39ba68e330e539167b298338b5bb20a98c3edb049d9a405a06df307640ef057",
 "models/libraries/navigation/inland-obligations.sysml": "8954be8c0904583cb977609428ed23734c59cd05aacf57ee82a8669c8e39da16",
 "models/libraries/navigation/inland-pair.sysml": "e0bb4518cbc1063a31ae63b5f8d3dbca4c06eb864c7a745199c45e47231de326"
};


test('Blue Dog bundles the exact committed standalone Challenge, shared Analysis and retained domain libraries',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),manifest=project.manifest,source=JSON.parse(fileText(project,'source.json'));
 assert.equal(project.authorManifest.schemaVersion,'syspresent.project.v2');assert.equal(project.authorManifest.modelRoots,undefined);assert.equal(project.authorManifest.requirementSeeds,undefined);
 assert.equal(source.sourceState,'committed');assert.equal(source.revision,evidenceRevision);assert.equal(source.sourceCommit,implementationRevision);assert.equal(source.baseRevision,namespaceBaseline);
 assert.equal(manifest.publication.scope,'complete');assert.equal(manifest.modelSources.length,8);
 const expected=Object.keys(sourceModelHashes).sort();
 assert.deepEqual([...manifest.modelSources].sort(),expected);
 assert.deepEqual(Object.keys(project.files).filter(path=>path.startsWith('models/')&&path.endsWith('.sysml')).sort(),Object.keys(sourceModelHashes).sort(),'old project documents are replaced, never loaded alongside the canonical source');
 for(const [path,digest]of Object.entries(sourceModelHashes))assert.equal(sha256(project.files[path]),digest,path+' matches the reviewed source bytes');
 assert.equal(project.files['tools/publishing/reference.sysml'],undefined,'unused publication-only helper is outside the exact model payload');
 assert.equal(manifest.modelSources.filter(path=>path.startsWith('models/libraries/')).length,6);
 assert.equal(manifest.modelSources.filter(path=>path.startsWith('models/')&&!path.startsWith('models/libraries/')).length,2);
 assert.ok(!Object.keys(project.files).some(path=>/^models\/(analyses|configurations|evidence|missions|vehicle)\//.test(path)),'legacy split project directories are absent from the portable bundle');
 const records=source.files;
 assert.equal(new Set(records.map(record=>record.path)).size,records.length,'provenance has no duplicate source paths');
 assert.deepEqual(records.map(record=>record.path),records.map(record=>record.path).sort(),'source digest ordering is explicit and reproducible');
 for(const record of records){assert.ok(project.files[record.path],record.path+' exists');assert.equal(sha256(project.files[record.path]),record.sha256,record.path+' provenance hash');}
 assert.equal(sha256(records.map(record=>record.path+'\0'+record.sha256+'\n').join('')),source.sourceDigest);
 assert.deepEqual([...manifest.modelSources,...manifest.viewSources].sort(),[...records.filter(record=>record.path.endsWith('.sysml')).map(record=>record.path),'views.sysml'].sort());
});

test('Blue Dog namespace mapping records reviewed migration boundaries without runtime aliases',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),source=JSON.parse(fileText(project,'source.json')),mapping=JSON.parse(fileText(project,source.namespaceMigration.mappingFile));
 assert.equal(source.namespaceMigration.mappingFile,'namespace-migration.json');assert.equal(mapping.baseline,namespaceBaseline);
 assert.equal(Object.keys(mapping.packages).length,79);assert.equal(Object.keys(mapping.sourcePaths).length,76);
 assert.equal(mapping.packages.GorgeChallenge,'BlueDog::Mission::Challenge');assert.equal(mapping.packages.BlueDogRequirements,'BlueDog::Requirements');assert.equal(mapping.packages.BlueDogSatisfaction,'BlueDog::Verification::Satisfaction');
 assert.deepEqual(new Set(Object.values(mapping.sourcePaths)),new Set(['models/blue-dog.sysml']));
 for(const oldPath of Object.keys(mapping.sourcePaths))assert.equal(project.files[oldPath],undefined,'obsolete source '+oldPath+' is absent');
 assert.equal(source.namespaceMigration.baselineRevision,namespaceBaseline);
 assert.equal(source.namespaceMigration.replacedProjectDocuments,76);assert.equal(source.namespaceMigration.modelPayloadFiles,21);assert.equal(source.namespaceMigration.libraryFiles,20);assert.equal(source.namespaceMigration.preservedNativeElements,14923);assert.equal(source.namespaceMigration.nativeTopLevelPackages,21);
 assert.equal(source.namespaceMigration.addedOrganizerIds.length,6);
 assert.equal(Object.keys(source.namespaceMigration.sourceModelHashes).length,21,'original project namespace migration remains historical provenance');
 assert.equal(Object.keys(source.sharedAnalysisMigration.sourceModelHashes).length,7,'shared Analysis remains historical provenance');
 assert.deepEqual(source.gorgeChallengeMigration.sourceModelHashes,sourceModelHashes);
 assert.equal(source.gorgeChallengeMigration.nativeTopLevelPackages,8);assert.equal(source.gorgeChallengeMigration.preservedNativeElements,14933);assert.equal(source.gorgeChallengeMigration.movedElementIds,401);
 assert.equal(source.sharedAnalysisMigration.baselineRevision,'556cd79e266394cae9e9b371a86941f50295cffc');
 assert.equal(source.sharedAnalysisMigration.nativeTopLevelPackages,7);assert.equal(source.sharedAnalysisMigration.preservedNativeElements,14929);assert.equal(source.sharedAnalysisMigration.calculationDefinitions,44);
});

test('Blue Dog source, provenance, native bindings and asset bytes roundtrip through its portable ZIP',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),copy=unpackProject(packProject(project));
 assert.deepEqual(Object.keys(copy.files).sort(),Object.keys(project.files).sort());
 for(const name of Object.keys(project.files))assert.deepEqual(copy.files[name],project.files[name],name+' remains byte-identical');
 assert.deepEqual(copy.authorManifest,project.authorManifest);assert.deepEqual(copy.manifest,project.manifest);
 for(const name of [...project.manifest.modelSources,...project.manifest.viewSources,'source.json','namespace-migration.json','shared-analysis-migration.json','shared-analysis-element-map.json','gorge-challenge-migration.json','gorge-challenge-element-map.json'])assert.equal(fileText(copy,name),fileText(project,name));
});
