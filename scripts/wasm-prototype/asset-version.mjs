import {createHash} from 'node:crypto';
/** A native payload cache key independent of story/app changes; runtime ABI stays paired. */
export function nativeAssetVersion(provenance) {
 const names=['sysml-wasm.wasm','wasm_exec.js'],hash=createHash('sha256');
 for(const name of names){
  const digest=provenance?.assets?.[name]?.sha256;
  if(typeof digest!=='string'||!/^[a-f0-9]{64}$/.test(digest))throw Error('Native asset digest is missing or invalid: '+name);
  hash.update(name+'\0'+digest+'\0');
 }
 return hash.digest('hex');
}
