import {fileURLToPath} from 'node:url';
import {readProjectDirectory} from '../scripts/canvas_project_files.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateProject,packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
test('Blue Dog project freezes every captured working-tree source and local library unchanged',async()=>{
 const project=validateProject(await readProjectDirectory(fileURLToPath(root))),manifest=project.manifest,source=JSON.parse(fileText(project,'source.json'));
 assert.equal(project.authorManifest.schemaVersion,'syspresent.project.v2');assert.equal(project.authorManifest.modelRoots,undefined);assert.equal(project.authorManifest.requirementSeeds,undefined);
 assert.equal(source.baseRevision,'b94b6e0231587b52cb5bec800dba408456ca701d');assert.equal(source.sourceState,'working-tree');assert.equal(source.revision,undefined);
 assert.equal(manifest.publication.scope,'complete');assert.equal(manifest.modelSources.length,97);
 for(const record of source.files){const data=await readFile(new URL(record.path,root));assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256);if(record.path.endsWith('.sysml'))assert.ok(manifest.modelSources.includes(record.path));}
 assert.equal(manifest.modelSources.filter(p=>p.startsWith('models/libraries/')).length,20);
 assert.deepEqual([...manifest.modelSources,...manifest.viewSources].sort(),[...source.files.filter(r=>r.path.endsWith('.sysml')).map(r=>r.path),'views.sysml'].sort());
 assert.ok(manifest.modelSources.includes('models/vehicle/satisfaction.sysml'));
 assert.ok(!manifest.modelSources.includes('models/vehicle/allocations.sysml'));
 assert.ok(manifest.modelSources.includes('models/libraries/decision-records.sysml'));
 assert.equal(createHash('sha256').update(source.files.map(r=>r.path+'\0'+r.sha256+'\n').join('')).digest('hex'),source.sourceDigest);
 const copy=unpackProject(packProject(project));
 for(const name of manifest.modelSources)assert.equal(fileText(copy,name),fileText(project,name));assert.equal(fileText(copy,'source.json'),fileText(project,'source.json'));assert.deepEqual(copy.manifest.systemOfInterest,manifest.systemOfInterest);
});
