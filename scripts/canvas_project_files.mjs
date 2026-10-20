import {readFile,readdir,lstat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import {normalizeProject,projectPath} from '../src/canvas-prototype/project.mjs';

const MAX_BYTES=160*1024*1024,MAX_FILE_BYTES=64*1024*1024;
const omittedDirectories=new Set(['.git','node_modules','build']);

// Discover ordinary project files; native OpenSysML discovers their semantics.
export async function readProjectDirectory(directory){
 const root=resolve(directory),files=Object.create(null);let expanded=0;
 async function read(name){
  projectPath(name);const stat=await lstat(join(root,name));
  if(stat.isSymbolicLink())throw Error('Project symbolic links are not supported: '+name);
  if(!stat.isFile())throw Error('Project path is not an ordinary file: '+name);
  if(stat.size>MAX_FILE_BYTES||(expanded+=stat.size)>MAX_BYTES)throw Error('Project directory exceeds prototype size limit');
  files[name]=new Uint8Array(await readFile(join(root,name)));
 }
 let manifest;
 try{
  const stat=await lstat(join(root,'project.json'));
  if(stat.isSymbolicLink())throw Error('Project symbolic links are not supported: project.json');
  if(!stat.isFile())throw Error('Project path is not an ordinary file: project.json');
  if(stat.size>MAX_FILE_BYTES)throw Error('Project directory exceeds prototype size limit');
  manifest=JSON.parse(await readFile(join(root,'project.json'),'utf8'));
 }catch(error){if(error.code!=='ENOENT')throw error;}
 if(manifest?.schemaVersion==='syspresent.project.v1'){
  // Legacy projects retain their explicitly declared source/asset boundary.
  for(const name of new Set([...(manifest.modelSources??[]),...(manifest.viewSources??[]),manifest.story,...(manifest.assets??[])]))await read(name);
 }else{
  async function walk(prefix=''){
   const entries=await readdir(join(root,prefix),{withFileTypes:true});
   entries.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0);
   for(const entry of entries){
    const name=prefix?prefix+'/'+entry.name:entry.name;
    if(entry.isSymbolicLink())throw Error('Project symbolic links are not supported: '+name);
    if(entry.isDirectory()){if(!omittedDirectories.has(entry.name))await walk(name);}
    else if(entry.isFile())await read(name);
    else throw Error('Project path is not an ordinary file: '+name);
   }
  }
  await walk();
 }
 return normalizeProject({manifest,files});
}

export const documentDigest=documents=>createHash('sha256').update(JSON.stringify(documents)).digest('hex');
