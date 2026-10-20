import {normalizeProject,projectPath} from './project.mjs';

/** Browser File API intake; semantic discovery belongs to the native engine. */
export async function projectFromSelection(selection,{folder=false}={}) {
 const selected=Array.from(selection??[]);
 if(!selected.length)throw Error('Choose at least one model file.');
 let total=0;
 for(const file of selected){if(file.size>64*1024*1024||(total+=file.size)>160*1024*1024)throw Error('Selected files exceed the 160 MB project limit (64 MB per file).');}
 const paths=selected.map(file=>file.webkitRelativePath||file.name);
 const common=folder&&paths.every(path=>path.includes('/')&&path.split('/')[0]===paths[0].split('/')[0])?paths[0].split('/')[0]+'/':'';
 const files=Object.create(null);
 for(let i=0;i<selected.length;i++){
  const path=projectPath(paths[i].slice(common.length));
  if(Object.hasOwn(files,path))throw Error('Duplicate selected path: '+path+'. Choose a folder to retain distinct paths.');
  files[path]=new Uint8Array(await selected[i].arrayBuffer());
 }
 let manifest;
 if(files['project.json']){try{manifest=JSON.parse(new TextDecoder().decode(files['project.json']));}catch{throw Error('project.json is not valid JSON.');}}
 return normalizeProject({manifest,files},{title:common?common.slice(0,-1):selected.length===1?selected[0].name.replace(/\.(sysml|kerml)$/i,''):'Imported model'});
}
