import {generateThirdPartyNotices} from './third_party_notices.mjs';
import {createRequire} from 'node:module';
import {resolve,join} from 'node:path';
import {mkdir,copyFile,readFile,writeFile,readdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';

const source=process.env.OPENSYSML_SOURCE;
if(!source) throw new Error('Set OPENSYSML_SOURCE to the pinned fork checkout');
const root=resolve(source), editor=join(root,'editors/vscode');
const require=createRequire(join(editor,'package.json'));
const {build}=require('esbuild');
const output=resolve(process.argv[2]??'build/browser');
await mkdir(output,{recursive:true});
const modules={canvas:'webview/canvas.ts',layout:'webview/layout.ts',autolayout:'webview/autolayout.ts',table:'webview/table.ts'};
await build({entryPoints:['src/app.mjs'],bundle:true,format:'esm',target:['es2022'],outfile:join(output,'app.js'),
  alias:Object.fromEntries(Object.entries(modules).map(([key,path])=>['@opensysml/'+key,join(editor,'src',path)])),
  sourcemap:true,metafile:true}).then(async result=>{
    await writeFile(join(output,'build-inputs.json'),JSON.stringify(result.metafile,null,2));
  });
for(const [from,to] of [['LICENSE','LICENSE'],['index.html','index.html'],['src/styles.css','styles.css'],['src/notation.css','notation.css']]) await copyFile(from,join(output,to));
const revision=execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
const dirty=!!execFileSync('git',['-C',root,'status','--porcelain'],{encoding:'utf8'}).trim();
const lock=await readFile(join(editor,'package-lock.json'));
await writeFile(join(output,'renderer-provenance.json'),JSON.stringify({repository:'https://github.com/DavidIngraham/OpenSysML',revision,dirty,
  lockSha256:createHash('sha256').update(lock).digest('hex'),modules,notice:'Development harness. Publication must pin a clean reviewed source revision and retain all dependency notices.'},null,2));
await generateThirdPartyNotices(output);
console.log(`Built browser in ${output}`);

const viewerRevision=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
const viewerDirty=!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim();
const assets={};
async function noticeFiles(directory,prefix='notices'){const result=[];for(const entry of await readdir(directory,{withFileTypes:true})){const name=prefix+'/'+entry.name;if(entry.isDirectory())result.push(...await noticeFiles(join(directory,entry.name),name));else if(entry.isFile())result.push(name);else throw Error('Unexpected notice asset type');}return result;}
for(const name of ['LICENSE','index.html','app.js','app.js.map','styles.css','notation.css','build-inputs.json','renderer-provenance.json',...await noticeFiles(join(output,'notices'))]) {
  assets[name]=createHash('sha256').update(await readFile(join(output,name))).digest('hex');
}
await writeFile(join(output,'viewer-provenance.json'),JSON.stringify({revision:viewerRevision,dirty:viewerDirty,assets},null,2));
