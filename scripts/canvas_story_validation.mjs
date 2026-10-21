import {spawn} from 'node:child_process';
import {documentsFor,fileText,parseStory,projectPath} from '../src/canvas-prototype/project.mjs';
import {validateStoryContent,nativeIdentityResolver} from '../src/canvas-prototype/story-content.mjs';

/** Validate publication targets against native declarations, including builds without a cache. */
export async function validateProjectStory(project,{native,exported}={}){
 if(!exported){
  const child=spawn(native,[],{stdio:['pipe','pipe','inherit']});let buffer=Buffer.alloc(0),sequence=0;const pending=new Map();
  const fail=error=>{for(const job of pending.values())job.reject(error);pending.clear();};
  child.on('error',fail);child.on('exit',code=>fail(Error('Native validation exited: '+code)));
  child.stdout.on('data',chunk=>{buffer=Buffer.concat([buffer,chunk]);while(true){const end=buffer.indexOf('\r\n\r\n');if(end<0)return;const length=Number(/Content-Length:\s*(\d+)/i.exec(buffer.subarray(0,end).toString())?.[1]);if(!Number.isFinite(length)){fail(Error('Invalid native response'));return;}if(buffer.length<end+4+length)return;const message=JSON.parse(buffer.subarray(end+4,end+4+length));buffer=buffer.subarray(end+4+length);const job=pending.get(message.id);if(!job)continue;pending.delete(message.id);message.error?job.reject(Error(message.error.message)):job.resolve(message.result);}});
  const call=(method,params)=>{const id=++sequence,data=Buffer.from(JSON.stringify({jsonrpc:'2.0',id,method,params}));return new Promise((resolve,reject)=>{pending.set(id,{resolve,reject});child.stdin.write(`Content-Length: ${data.length}\r\n\r\n`);child.stdin.write(data);});};
  try{const parsed=await call('ParseSources',{documents:documentsFor(project)});if((parsed.diagnostics??[]).some(d=>String(d.severity).toLowerCase().includes('error')))throw Error('Native story source errors: '+JSON.stringify(parsed.diagnostics));exported=await call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});}finally{child.stdin.end();}
 }
 const scenes=parseStory(fileText(project,project.manifest.story));validateStoryContent(scenes,{files:project.files,pathFor:projectPath,resolve:nativeIdentityResolver(exported)});
}
