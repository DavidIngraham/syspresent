import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,writeFile,mkdir,symlink,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {readProjectDirectory,documentDigest} from '../scripts/canvas_project_files.mjs';
import {documentsFor,fileText,packProject,unpackProject} from '../src/canvas-prototype/project.mjs';

async function fixture(t,files){
 const root=await mkdtemp(join(tmpdir(),'syspresent-files-'));t.after(()=>rm(root,{recursive:true,force:true}));
 for(const [name,value] of Object.entries(files)){await mkdir(join(root,name,'..'),{recursive:true});await writeFile(join(root,name),typeof value==='string'?value:JSON.stringify(value));}
 return root;
}

test('directory discovery includes nested native sources and provenance deterministically',async t=>{
 const root=await fixture(t,{'project.json':{schemaVersion:'syspresent.project.v2',title:'Test'},'z.sysml':'package Z {}','model/a.kerml':'package A {}','views.sysml':'package Views {}','story.md':'# Story','source.json':'{"revision":"abc"}','assets/plot.csv':'x,y','build/accidental.sysml':'package Ignore {}','.git/config':'private'});
 const project=await readProjectDirectory(root),documents=documentsFor(project);
 assert.deepEqual(documents.map(document=>document.name),['model/a.kerml','z.sysml','views.sysml']);
 assert.equal(fileText(project,'source.json'),'{"revision":"abc"}');
 assert.equal(project.files['build/accidental.sysml'],undefined);
 assert.equal(project.files['.git/config'],undefined);
 const restored=unpackProject(packProject(project));
 assert.equal(fileText(restored,'assets/plot.csv'),'x,y');
 assert.equal(fileText(restored,'source.json'),'{"revision":"abc"}');
 assert.equal(documentDigest(documentsFor(restored)),documentDigest(documents));
});

test('loose model directory needs no descriptor and preserves source filenames',async t=>{
 const root=await fixture(t,{'sub/system.sysml':'package System {}'}),project=await readProjectDirectory(root);
 assert.equal(project.manifest.modelSources.includes('sub/system.sysml'),true);
 assert.equal(fileText(project,'sub/system.sysml'),'package System {}');
 assert.doesNotThrow(()=>fileText(project,project.manifest.story));
 assert.ok(project.manifest.viewSources.length);
});

test('legacy directory retains its declared publication boundary',async t=>{
 const manifest={schemaVersion:'syspresent.project.v1',title:'Legacy',modelSources:['model.sysml'],viewSources:['views.sysml'],story:'story.md',assets:['source.json'],systemOfInterest:['System'],publication:{scope:'complete'}};
 const root=await fixture(t,{'project.json':manifest,'model.sysml':'package System {}','views.sysml':'package Views {}','story.md':'# Story','source.json':'{}','unpublished.sysml':'package Private {}'}),project=await readProjectDirectory(root);
 assert.equal(project.files['unpublished.sysml'],undefined);
 assert.equal(fileText(project,'source.json'),'{}');
 assert.deepEqual(documentsFor(project).map(document=>document.name),['model.sysml','views.sysml']);
});

test('directory loader rejects links outside its portable file boundary',async t=>{
 const root=await fixture(t,{'model.sysml':'package System {}'});await symlink('/etc/hosts',join(root,'linked.sysml'));
 await assert.rejects(readProjectDirectory(root),/symbolic links/);
});

test('legacy paths cannot escape the project root',async t=>{
 const root=await fixture(t,{'project.json':{schemaVersion:'syspresent.project.v1',modelSources:['../outside.sysml'],viewSources:[],story:'story.md'}});
 await assert.rejects(readProjectDirectory(root),/Invalid project path/);
});

test('document digest changes when an included source changes',()=>{
 assert.notEqual(documentDigest([{name:'model.sysml',content:'package A {}'}]),documentDigest([{name:'model.sysml',content:'package B {}'}]));
});
