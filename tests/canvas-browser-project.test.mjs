import test from 'node:test';
import assert from 'node:assert/strict';
import {projectFromSelection} from '../src/canvas-prototype/browser-project.mjs';
import {fileText} from '../src/canvas-prototype/project.mjs';
const file=(name,text,path='')=>{const bytes=new TextEncoder().encode(text);return {name,webkitRelativePath:path,size:bytes.length,arrayBuffer:async()=>bytes.buffer};};

test('local files need no descriptor and retain their source contents',async()=>{
 const project=await projectFromSelection([file('model.sysml','package System {}'),file('library.kerml','namespace Library {}')]);
 assert.deepEqual(project.manifest.modelSources,['library.kerml','model.sysml']);assert.equal(project.manifest.story,'story.md');assert.equal(fileText(project,'model.sysml'),'package System {}');assert.deepEqual(project.manifest.systemOfInterest,[]);
});
test('folder-relative paths distinguish same-named sources and preserve authored intent',async()=>{
 const project=await projectFromSelection([file('part.sysml','package A {}','Design/a/part.sysml'),file('part.sysml','package B {}','Design/b/part.sysml'),file('project.json',JSON.stringify({schemaVersion:'syspresent.project.v2',navigation:{roots:['A']}}),'Design/project.json')],{folder:true});
 assert.deepEqual(project.manifest.modelSources,['a/part.sysml','b/part.sysml']);assert.deepEqual(project.manifest.systemOfInterest,['A']);assert.equal(project.manifest.title,'Design');
});
test('local intake rejects ambiguous duplicate paths, unsafe paths and excessive files before reading',async()=>{
 await assert.rejects(projectFromSelection([file('same.sysml','a'),file('same.sysml','b')]),/Duplicate selected path/);
 await assert.rejects(projectFromSelection([file('../model.sysml','')]),/Invalid project path/);
 await assert.rejects(projectFromSelection([{name:'large.sysml',size:65*1024*1024,arrayBuffer:()=>{throw Error('must not read');}}]),/project limit/);
});


test('file intake reports completed reads and cancellation prevents later files or normalization',async()=>{
 const controller=new AbortController(),events=[];let secondRead=false;
 const second={...file('b.sysml','package B {}'),arrayBuffer:async()=>{secondRead=true;return new ArrayBuffer(0);}};
 await assert.rejects(projectFromSelection([file('a.sysml','package A {}'),second],{signal:controller.signal,onProgress:event=>{events.push(event);if(event.completed===1)controller.abort();}}),/Loading canceled/);
 assert.equal(secondRead,false);assert.deepEqual(events.map(e=>[e.completed,e.total,e.unit]),[[0,2,'files'],[1,2,'files']]);
});
