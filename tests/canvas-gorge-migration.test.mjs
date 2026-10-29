import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {validateProject,fileText,packProject,unpackProject} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
const sha256=bytes=>createHash('sha256').update(bytes).digest('hex');

test('standalone Gorge exact map preserves the special boat interpretation instead of applying the broad rule prefix',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),source=JSON.parse(fileText(project,'source.json')),migration=source.gorgeChallengeMigration;
 const mapping=JSON.parse(fileText(project,migration.mappingFile)),exact=JSON.parse(fileText(project,migration.elementMappingFile));
 assert.equal(Object.keys(exact).length,401);assert.equal(new Set(Object.values(exact)).size,401);
 const prefixes=Object.keys(mapping.packages).sort((a,b)=>b.length-a.length);
 for(const [before,after]of Object.entries(exact)){
  const prefix=prefixes.find(prefix=>before===prefix||before.startsWith(prefix+'::'));
  assert.ok(prefix,before+' has an authoritative mapping');
  assert.equal(after,mapping.packages[prefix]+before.slice(prefix.length));
 }
 assert.equal(exact['BlueDog::Mission::Challenge'],'GorgeChallenge');
 assert.equal(exact['BlueDog::Mission::Challenge::LiveObservation::issue'],'BlueDog::Requirements::Communications::monitoringTechnologyIssue');
 assert.ok(!Object.values(exact).some(name=>name==='GorgeChallenge::LiveObservation::issue'));
 assert.deepEqual(mapping.policyChanges,[]);
 assert.deepEqual(new Set(mapping.intendedRoots),new Set(['Analysis','BlueDog','GorgeChallenge','EngineeringDecisions','MarineDesign','MarineEnergy','InlandExtended','InlandNavigationExperiment']));
 assert.equal(project.manifest.modelSources.length,8);
});

test('Gorge extraction keeps the six reviewed shared libraries and authoritative maps byte-identical in a portable project',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),source=JSON.parse(fileText(project,'source.json')),migration=source.gorgeChallengeMigration;
 const libraries=project.manifest.modelSources.filter(name=>name.startsWith('models/libraries/'));
 assert.equal(libraries.length,6);
 for(const name of libraries)assert.equal(sha256(project.files[name]),source.sharedAnalysisMigration.sourceModelHashes[name],name+' unchanged by Challenge ownership');
 const copy=unpackProject(packProject(project));
 for(const name of [migration.mappingFile,migration.elementMappingFile,...project.manifest.modelSources])assert.deepEqual(copy.files[name],project.files[name],name+' portable bytes');
});
