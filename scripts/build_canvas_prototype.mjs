import {documentsFor,requirementCoverageSource} from '../src/canvas-prototype/project.mjs';
import {retainSnapshot} from './canvas_snapshot.mjs';
import {build} from 'esbuild';
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {zipSync,strToU8} from 'fflate';
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const output=resolve(option('--output','build/canvas-prototype/site'));
const engine=resolve(option('--engine','build/canvas-prototype/engine'));
const project=resolve(option('--project','examples/canvas-blue-dog'));
const cachePath=option('--runtime-cache');let runtimeCacheHash;
await mkdir(join(output,'engine'),{recursive:true});await mkdir(join(output,'example'),{recursive:true});await mkdir(join(output,'notices'),{recursive:true});
const inputs=await build({entryPoints:['src/canvas-prototype/app.mjs'],bundle:true,format:'esm',target:['es2022'],outfile:join(output,'app.js'),metafile:true,sourcemap:true});
if(Object.keys(inputs.metafile.inputs).some(name=>name.includes('editors/vscode')))throw Error('Canvas prototype must not depend on VS Code source modules');
const files=['app.js','app.js.map'];
async function copy(from,to){await mkdir(dirname(join(output,to)),{recursive:true});await copyFile(from,join(output,to));files.push(to);}
await copy('src/canvas-prototype/index.html','index.html');await copy('src/canvas-prototype/canvas.css','canvas.css');await copy('LICENSE','LICENSE');await copy('THIRD_PARTY_NOTICES','THIRD_PARTY_NOTICES');
for(const name of ['sysml-wasm.wasm','wasm_exec.js','provenance.json','OPENSYSML-LICENSE','GO-LICENSE'])await copy(join(engine,name),'engine/'+name);
await copy('src/canvas-prototype/engine/worker.js','engine/worker.js');
await copy('node_modules/fflate/LICENSE','notices/fflate-LICENSE');
const manifest=JSON.parse(await readFile(join(project,'project.json'),'utf8'));
if(cachePath){
 const data=await readFile(resolve(cachePath)),cache=JSON.parse(data),engineInfo=JSON.parse(await readFile(join(engine,'provenance.json'),'utf8')),sourceFiles={};
 for(const name of [...manifest.modelSources,...manifest.viewSources])sourceFiles[name]=await readFile(join(project,name));
 const roots=manifest.modelRoots??cache.modelRoots;if(!Array.isArray(roots)||!roots.length)throw Error('Prepared native cache requires native model roots');
 let runtimePackage='SyspresentRuntimeContext';while(roots.includes(runtimePackage))runtimePackage+='X';
 const documents=[...documentsFor({manifest,files:sourceFiles}),{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(roots,runtimePackage,manifest.requirementSeeds)}];
 if(cache.engineVersion!==engineInfo.version||cache.engineFingerprint!==engineInfo.assets['sysml-wasm.wasm'].sha256||cache.sourceDigest!==createHash('sha256').update(JSON.stringify(documents)).digest('hex'))throw Error('Prepared native cache does not match the model and engine');
 runtimeCacheHash=createHash('sha256').update(data).digest('hex');manifest.runtimeCache='runtime-cache.json';manifest.assets=[...new Set([...(manifest.assets??[]),manifest.runtimeCache])];
}
for(const name of ['project.json',...manifest.modelSources,...manifest.viewSources,manifest.story,...manifest.assets]){
 if(name==='project.json'){await writeFile(join(output,'example/project.json'),JSON.stringify(manifest,null,2)+'\n');files.push('example/project.json');}
 else await copy(cachePath&&name===manifest.runtimeCache?resolve(cachePath):join(project,name),'example/'+name);
}
const projectFiles={};for(const name of ['project.json',...manifest.modelSources,...manifest.viewSources,manifest.story,...manifest.assets])projectFiles[name]=new Uint8Array(await readFile(join(output,'example',name)));
await writeFile(join(output,'project.zip'),zipSync(projectFiles,{level:6,mtime:new Date(1980,0,2)}));files.push('project.zip');
const buildToken=createHash('sha256');for(const name of [...files].sort()){buildToken.update(name+'\0');buildToken.update(await readFile(join(output,name)));}const version=buildToken.digest('hex').slice(0,20);
const html=(await readFile(join(output,'index.html'),'utf8')).replace('<head>','<head>'+(runtimeCacheHash?'<meta name="syspresent-runtime-cache" content="'+runtimeCacheHash+'">':'')+'<meta name="syspresent-build" content="'+version+'">').replace('src="./app.js"','src="./app.js?v='+version+'"').replace('href="./canvas.css"','href="./canvas.css?v='+version+'"');await writeFile(join(output,'index.html'),html);
await writeFile(join(output,'build-inputs.json'),JSON.stringify(inputs.metafile,null,2));files.push('build-inputs.json');
const revision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
const assets={};for(const name of files)assets[name]=createHash('sha256').update(await readFile(join(output,name))).digest('hex');
const provenance={schemaVersion:'syspresent.canvas-prototype.v1',revision,dirty,assets,engine:JSON.parse(await readFile(join(engine,'provenance.json'),'utf8')),notice:'Experimental canvas prototype. Software evidence is separate from engineering and representative-reader acceptance.'};
await writeFile(join(output,'snapshot.json'),JSON.stringify(provenance,null,2));files.push('snapshot.json');
await writeFile(join(output,'README.txt'),'Syspresent standalone canvas prototype\nServe this directory using any static web server, for example:\n  python3 -m http.server 8783\nOpen http://localhost:8783/ in your browser. The Go/WASM engine runs in a Web Worker; no application backend is used.\nProject > Export project ZIP exports ordinary model/view/Markdown files.\nThis artifact is a prototype, not a completed full-product release.\n');files.push('README.txt');
const siteFiles={};for(const name of files)siteFiles[name]=new Uint8Array(await readFile(join(output,name)));
const archive=zipSync(siteFiles,{level:6,mtime:new Date(1980,0,2)});
await writeFile(output+'.zip',archive);
const retained=await retainSnapshot(resolve('build/canvas-prototype/snapshots'),archive);
console.log(JSON.stringify({output,archive:output+'.zip',assets:files.length,retained,engineRevision:provenance.engine.sourceCommit},null,2));
