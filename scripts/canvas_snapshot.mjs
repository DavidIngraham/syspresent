import {mkdir,writeFile,readFile} from 'node:fs/promises';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
/** Content-addressed archives are write-once; changed builds get distinct paths. */
export async function retainSnapshot(directory,bytes){
 const id=createHash('sha256').update(bytes).digest('hex');await mkdir(directory,{recursive:true});const path=join(directory,id+'.zip');
 try{await writeFile(path,bytes,{flag:'wx'});}catch(error){if(error.code!=='EEXIST')throw error;const existing=await readFile(path);if(!existing.equals(Buffer.from(bytes)))throw Error('Immutable snapshot collision: '+id);}
 return {id,path};
}
