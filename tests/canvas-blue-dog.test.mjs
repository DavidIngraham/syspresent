import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {validateProject,packProject,unpackProject,fileText} from '../src/canvas-prototype/project.mjs';
const root=new URL('../examples/canvas-blue-dog/',import.meta.url);
test('Blue Dog project includes every pinned model source and local library unchanged',async()=>{
 const manifest=JSON.parse(await readFile(new URL('project.json',root),'utf8')),source=JSON.parse(await readFile(new URL('source.json',root),'utf8')),files={};
 assert.equal(source.revision,manifest.source.revision);assert.equal(manifest.publication.scope,'complete');assert.equal(manifest.modelSources.length,86);
 for(const record of source.files){const data=await readFile(new URL(record.path,root));assert.equal(createHash('sha256').update(data).digest('hex'),record.sha256);if(record.path.endsWith('.sysml'))assert.ok(manifest.modelSources.includes(record.path));}
 assert.equal(manifest.modelSources.filter(p=>p.startsWith('models/libraries/')).length,19);
 for(const name of [...manifest.modelSources,...manifest.viewSources,manifest.story,...manifest.assets])files[name]=new Uint8Array(await readFile(new URL(name,root)));
 const project=validateProject({manifest,files}),copy=unpackProject(packProject(project));
 for(const name of manifest.modelSources)assert.equal(fileText(copy,name),fileText(project,name));assert.ok(manifest.modelRoots.length>100);
});
