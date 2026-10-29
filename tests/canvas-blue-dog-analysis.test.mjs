import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {validateProject,packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
const sha256=value=>createHash('sha256').update(value).digest('hex');
const sourceHashes={
 'models/blue-dog.sysml':'f32961b47aa620dc09f2cde75d5fa27cb35cdf8d07a2ded7611deb386652f2e2',
 'models/libraries/analysis.sysml':'98065dc7f0298faffb538558fc960f030787a611632b0650b3706d1e748a37ff',
 'models/libraries/decision-records.sysml':'93102a19a7e9c69cd35544bf7f4815657164803fd1bbe9af6d6689ad613f52f3',
 'models/libraries/energy/budget.sysml':'6b2f8c827db736130e1f343652d7d45695a4c4b18d5b4e7ac07f3d7a444ca365',
 'models/libraries/marine/design.sysml':'e39ba68e330e539167b298338b5bb20a98c3edb049d9a405a06df307640ef057',
 'models/libraries/navigation/inland-obligations.sysml':'8954be8c0904583cb977609428ed23734c59cd05aacf57ee82a8669c8e39da16',
 'models/libraries/navigation/inland-pair.sysml':'e0bb4518cbc1063a31ae63b5f8d3dbca4c06eb864c7a745199c45e47231de326'
};
test('shared Analysis and retained domain library bytes survive standalone Challenge extraction',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root)));
 const expectedLibraries=Object.keys(sourceHashes).filter(name=>name.startsWith('models/libraries/')).sort();
 assert.deepEqual(project.manifest.modelSources.filter(name=>name.startsWith('models/libraries/')).sort(),expectedLibraries);
 const files=Object.keys(project.files).filter(name=>name.startsWith('models/libraries/')&&name.endsWith('.sysml')).sort();
 assert.deepEqual(files,expectedLibraries);
 for(const name of expectedLibraries)assert.equal(sha256(project.files[name]),sourceHashes[name],name);
 const source=JSON.parse(fileText(project,'source.json')),migration=source.sharedAnalysisMigration,plan=JSON.parse(fileText(project,migration.mappingFile));
 assert.deepEqual(migration.sourceModelHashes,sourceHashes);
 assert.equal(Object.keys(plan.packages).length,15);assert.equal(Object.keys(plan.sourcePaths).length,15);
 for(const path of Object.keys(plan.sourcePaths))assert.equal(project.files[path],undefined,path+' not duplicated');
 assert.deepEqual(new Set(Object.values(plan.sourcePaths)),new Set(['models/libraries/analysis.sysml']));
 assert.deepEqual(new Set(plan.intendedRoots),new Set(['Analysis','BlueDog','EngineeringDecisions','MarineDesign','MarineEnergy','InlandExtended','InlandNavigationExperiment']));
 assert.deepEqual(new Set(plan.addedPackages),new Set(['Analysis','Analysis::Marine','Analysis::Mechanics','Analysis::Energy']));
 assert.equal(migration.preservedNativeElements,14929);assert.equal(migration.calculationDefinitions,44);
});
test('reviewed exact Analysis mapping is injective and preserves independent Challenge navigation',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),source=JSON.parse(fileText(project,'source.json')),migration=source.sharedAnalysisMigration;
 const plan=JSON.parse(fileText(project,migration.mappingFile)),exact=JSON.parse(fileText(project,migration.elementMappingFile));
 assert.equal(Object.keys(exact).length,707);assert.equal(new Set(Object.values(exact)).size,707);
 const prefixes=Object.keys(plan.packages).sort((a,b)=>b.length-a.length);
 for(const [before,after]of Object.entries(exact)){
  const prefix=prefixes.find(prefix=>before===prefix||before.startsWith(prefix+'::'));assert.ok(prefix,before);
  assert.equal(after,plan.packages[prefix]+before.slice(prefix.length));
 }
 assert.equal(exact['MarineSailing::Core'],'Analysis::Marine::Sailing::Core');
 assert.equal(exact['MarineMass'],'Analysis::Mechanics::Mass');
 assert.ok(project.authorManifest.navigation.roots.includes('GorgeChallenge'));
 assert.ok(!project.authorManifest.navigation.roots.includes('BlueDog::Mission::Challenge'));
 assert.ok(!Object.keys(exact).some(name=>name.startsWith('BlueDog::Mission::Challenge')));
});
test('Analysis source and authoritative migration maps survive portable export/import byte-for-byte',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),copy=unpackProject(packProject(project));
 for(const name of [...Object.keys(sourceHashes),'shared-analysis-migration.json','shared-analysis-element-map.json','source.json','views.sysml','story.md'])assert.deepEqual(copy.files[name],project.files[name],name);
 assert.deepEqual(copy.authorManifest,project.authorManifest);
});
