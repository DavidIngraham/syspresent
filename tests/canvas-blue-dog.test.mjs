import {fileURLToPath} from 'node:url';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateProject,packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
const sha256=data=>createHash('sha256').update(data).digest('hex');
const evidenceRevision='e8fb1601d35c5d1c8e7ec8084fe4a9391228ce30';
const implementationRevision='ad26c68b7f01149cb207759cf390642c645ba514';
const namespaceBaseline='8f2dd804e964fd75828ff170c8c93572c751c8f2';
// Byte identities from the reviewed, committed namespace handoff. Native semantic
// ownership is validated separately; this test does not parse SysML text.
const sourceModelHashes={
 "models/blue-dog.sysml": "6e761cf3caf31a04e1421026d36961aeb1148ab9e41477e4cf224ae1035e964f",
 "models/libraries/decision-records.sysml": "93102a19a7e9c69cd35544bf7f4815657164803fd1bbe9af6d6689ad613f52f3",
 "models/libraries/energy/actuation.sysml": "b0fba9c178586b4208e50bf7e681959c96cdff4c9d71d49f243b7ff9db57838f",
 "models/libraries/energy/budget.sysml": "6b2f8c827db736130e1f343652d7d45695a4c4b18d5b4e7ac07f3d7a444ca365",
 "models/libraries/marine/appendages.sysml": "86cefc51f2d86bcf3cc63fbe06fc8151836cd568d8dd7d73c23c696573131a9d",
 "models/libraries/marine/concept.sysml": "0d21f054d7cec7c54ead46154c2820787678dbcee57b433bf67d15077113f524",
 "models/libraries/marine/course.sysml": "3f58d6c0dc668858aa0b6bdad232c26b0ac75952ad67d0f06e73f4fbd464c85c",
 "models/libraries/marine/design.sysml": "e39ba68e330e539167b298338b5bb20a98c3edb049d9a405a06df307640ef057",
 "models/libraries/marine/hull-resistance.sysml": "967550313effe20092525e10c1695771b8354c66478203f449ac902d8af1a5f1",
 "models/libraries/marine/hydrostatics.sysml": "b6791576a108dee393063a15a1a359113a8c24aba793105fa7d60fa193e9d858",
 "models/libraries/marine/propulsion.sysml": "16848c8a487a3bd087d43099c5062ec4da6dc9e8aee5447af63e50ef3a5a6fc7",
 "models/libraries/marine/recovery.sysml": "00c8c1fcfda115116fc66bf1db5a67334e04ea893182a454a796ada62eeeaab4",
 "models/libraries/marine/reliability.sysml": "b5e5a18d2924737f1c84df6683c8806a56a65f62e06a3acf25e2d998008aaf29",
 "models/libraries/marine/sailing.sysml": "8281caf912a840d83d5a6d1c39fe0422419ce7fb9ccaae3d9044b0c5df33446f",
 "models/libraries/marine/surface.sysml": "781d337d8553160eb8d3c0724ae2aef4463d51ae6bc05ef475d32884645213c8",
 "models/libraries/marine/wave-performance.sysml": "ee1d491adb19773eb151588a5f8ccb52c8ee4364150c5783637c58ada8a07ba9",
 "models/libraries/marine/weather.sysml": "1d2d4a98082b0daefa5bcce180d4805c1e0907de818ed69d0b68b38d6c1f96b8",
 "models/libraries/navigation/inland-obligations.sysml": "8954be8c0904583cb977609428ed23734c59cd05aacf57ee82a8669c8e39da16",
 "models/libraries/navigation/inland-pair.sysml": "e0bb4518cbc1063a31ae63b5f8d3dbca4c06eb864c7a745199c45e47231de326",
 "models/libraries/structures/mass-properties.sysml": "ced6365432541c9c9ada7b683564efde12f597d46e96144fd70221f767ef5dde",
 "models/libraries/structures/scantlings.sysml": "7ed46d886547ac779560838a5abc42c986ce3e41830b150ff0c11e3926fecd32"
};


test('Blue Dog bundles the exact committed canonical model and twenty unchanged reusable libraries',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),manifest=project.manifest,source=JSON.parse(fileText(project,'source.json'));
 assert.equal(project.authorManifest.schemaVersion,'syspresent.project.v2');assert.equal(project.authorManifest.modelRoots,undefined);assert.equal(project.authorManifest.requirementSeeds,undefined);
 assert.equal(source.sourceState,'committed');assert.equal(source.revision,evidenceRevision);assert.equal(source.sourceCommit,implementationRevision);assert.equal(source.baseRevision,namespaceBaseline);
 assert.equal(manifest.publication.scope,'complete');assert.equal(manifest.modelSources.length,21);
 const expected=Object.keys(sourceModelHashes).sort();
 assert.deepEqual([...manifest.modelSources].sort(),expected);
 assert.deepEqual(Object.keys(project.files).filter(path=>path.startsWith('models/')&&path.endsWith('.sysml')).sort(),Object.keys(sourceModelHashes).sort(),'old project documents are replaced, never loaded alongside the canonical source');
 for(const [path,digest]of Object.entries(sourceModelHashes))assert.equal(sha256(project.files[path]),digest,path+' matches the reviewed source bytes');
 assert.equal(project.files['tools/publishing/reference.sysml'],undefined,'unused publication-only helper is outside the exact model payload');
 assert.equal(manifest.modelSources.filter(path=>path.startsWith('models/libraries/')).length,20);
 assert.equal(manifest.modelSources.filter(path=>path.startsWith('models/')&&!path.startsWith('models/libraries/')).length,1);
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
 assert.deepEqual(source.namespaceMigration.sourceModelHashes,sourceModelHashes);
});

test('Blue Dog source, provenance, native bindings and asset bytes roundtrip through its portable ZIP',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),copy=unpackProject(packProject(project));
 assert.deepEqual(Object.keys(copy.files).sort(),Object.keys(project.files).sort());
 for(const name of Object.keys(project.files))assert.deepEqual(copy.files[name],project.files[name],name+' remains byte-identical');
 assert.deepEqual(copy.authorManifest,project.authorManifest);assert.deepEqual(copy.manifest,project.manifest);
 for(const name of [...project.manifest.modelSources,...project.manifest.viewSources,'source.json','namespace-migration.json'])assert.equal(fileText(copy,name),fileText(project,name));
});
