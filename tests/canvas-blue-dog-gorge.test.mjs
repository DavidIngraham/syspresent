import test from 'node:test';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import {createHash} from 'node:crypto';
import {validateProject,packProject,unpackProject,fileText,parseStory} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
test('current authored Challenge navigation and story references target the standalone native namespace',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root)));
 assert.ok(project.authorManifest.navigation.roots.includes('GorgeChallenge'));
 assert.ok(!project.authorManifest.navigation.roots.includes('BlueDog::Mission::Challenge'));
 const views=project.manifest.viewSources.map(name=>fileText(project,name)).join('\n'),story=fileText(project,project.manifest.story);
 assert.ok(views.includes('expose GorgeChallenge::transGorgeChallenge;'));
 assert.ok(!views.includes('BlueDog::Mission::Challenge'));
 assert.ok(!story.includes('BlueDog::Mission::Challenge'));
 const scenes=parseStory(story);
 assert.equal(scenes[0].focus,'GorgeChallenge::transGorgeChallenge');
 assert.ok(scenes.some(scene=>scene.context?.some(context=>context.modelRefs?.includes('GorgeChallenge::courseCompletion'))));
});

const reviewedModelHashes={
 "models/blue-dog.sysml": "9b4edf033775f6548658dc10fe263fcdc3e80f9c6e66cc36b16ebf6e98d4ba47",
 "models/gorge-challenge.sysml": "abd0ad9d39cb5b334170c7239862d1e770b521831e56b9f4fa3453c584c54fe9",
 "models/libraries/analysis.sysml": "98065dc7f0298faffb538558fc960f030787a611632b0650b3706d1e748a37ff",
 "models/libraries/decision-records.sysml": "93102a19a7e9c69cd35544bf7f4815657164803fd1bbe9af6d6689ad613f52f3",
 "models/libraries/energy/budget.sysml": "6b2f8c827db736130e1f343652d7d45695a4c4b18d5b4e7ac07f3d7a444ca365",
 "models/libraries/marine/design.sysml": "e39ba68e330e539167b298338b5bb20a98c3edb049d9a405a06df307640ef057",
 "models/libraries/navigation/inland-obligations.sysml": "8954be8c0904583cb977609428ed23734c59cd05aacf57ee82a8669c8e39da16",
 "models/libraries/navigation/inland-pair.sysml": "e0bb4518cbc1063a31ae63b5f8d3dbca4c06eb864c7a745199c45e47231de326"
};

test('standalone Challenge import contains exactly the eight reviewed native model documents',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),source=JSON.parse(fileText(project,'source.json'));
 const paths=Object.keys(project.files).filter(name=>name.startsWith('models/')&&name.endsWith('.sysml')).sort();
 assert.deepEqual(paths,Object.keys(reviewedModelHashes).sort());
 assert.deepEqual(project.manifest.modelSources.slice().sort(),paths);
 for(const [name,digest]of Object.entries(reviewedModelHashes))assert.equal(createHash('sha256').update(project.files[name]).digest('hex'),digest,name);
 assert.deepEqual(source.gorgeChallengeMigration.sourceModelHashes,reviewedModelHashes);
 assert.equal(source.gorgeChallengeMigration.preservedNativeElements,14933);assert.equal(source.gorgeChallengeMigration.movedElementIds,401);
 assert.deepEqual(new Set(source.gorgeChallengeMigration.intendedRoots),new Set(['Analysis','BlueDog','GorgeChallenge','EngineeringDecisions','MarineDesign','MarineEnergy','InlandExtended','InlandNavigationExperiment']));
 const copy=unpackProject(packProject(project));
 for(const name of [...paths,'gorge-challenge-migration.json','gorge-challenge-element-map.json','views.sysml','story.md'])assert.deepEqual(copy.files[name],project.files[name],name);
});
test('Challenge migration preserves the separate boat interpretation identity without a nested alias',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),source=JSON.parse(fileText(project,'source.json')),plan=JSON.parse(fileText(project,source.gorgeChallengeMigration.mappingFile)),ids=JSON.parse(fileText(project,source.gorgeChallengeMigration.elementMappingFile));
 assert.equal(Object.keys(ids).length,401);assert.equal(new Set(Object.values(ids)).size,401);
 assert.equal(plan.rootMove['BlueDog::Mission::Challenge'],'GorgeChallenge');
 assert.equal(ids['BlueDog::Mission::Challenge'],'GorgeChallenge');
 assert.equal(ids['BlueDog::Mission::Challenge::LiveObservation::issue'],'BlueDog::Requirements::Communications::monitoringTechnologyIssue');
 const prefixes=Object.keys(plan.packages).sort((a,b)=>b.length-a.length);
 for(const [oldName,newName]of Object.entries(ids)){
  const prefix=prefixes.find(prefix=>oldName===prefix||oldName.startsWith(prefix+'::'));assert.ok(prefix,oldName);
  assert.equal(newName,plan.packages[prefix]+oldName.slice(prefix.length),oldName);
 }
});
