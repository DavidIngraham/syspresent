// Regenerate with node tests/fixtures/canvas-views/capture-behaviors.mjs.
// Uses only this repository's pinned native engine and fixture sources.
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
const child=spawn('build/canvas-prototype/engine/sysml-native',[],{stdio:['pipe','pipe','inherit']});
let buffer=Buffer.alloc(0),serial=0;const pending=new Map();
child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);pending.delete(message.id);if(message.error)job.reject(Error(message.error.message));else job.resolve(message.result);}});
function call(method,params={}){const id=++serial,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});}
try{
 const model=await readFile(new URL('sequence.sysml',import.meta.url),'utf8'),extra=await readFile(new URL('behaviors.sysml',import.meta.url),'utf8');
 const parsed=await call('ParseSources',{documents:[{name:'model.sysml',content:model},{name:'behaviors.sysml',content:extra}]});
 if(parsed.diagnostics?.some(d=>String(d.severity).toLowerCase().includes('error')))throw Error(JSON.stringify(parsed.diagnostics));
 const engine=await call('GetServerInfo'),views={};
 for(const [key,view]of Object.entries({sequence:'BehaviorViews::sequence',state:'BehaviorViews::states',cases:'BehaviorViews::cases',mixed:'BehaviorViews::mixed',fault:'PowerSupply::tree'}))views[key]=await call('RenderView',{modelHash:parsed.modelHash,view,includeSemanticIdentity:true});
 await writeFile(new URL('behaviors.native.json',import.meta.url),JSON.stringify({engine,views},null,2)+'\n');
}finally{child.stdin.end();}
