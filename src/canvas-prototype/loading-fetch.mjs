/** Read an actual response once, reporting decoded bytes without inventing totals. */
export async function readLoadingBytes(response,{signal,onProgress=()=>{},stage='project-download',label='Downloading project…'}={}) {
 if(!response.ok)throw Error('Project download failed (HTTP '+response.status+'). Retry or open a local project ZIP.');
 const canceled=()=>{if(signal?.aborted)throw Object.assign(Error('Loading canceled'),{name:'AbortError'});};
 const length=Number(response.headers?.get?.('content-length')),encoding=response.headers?.get?.('content-encoding');
 let total=(!encoding||encoding.toLowerCase()==='identity')&&Number.isSafeInteger(length)&&length>0?length:undefined;
 let completed=0,last=0;
 const emit=()=>onProgress({stage,label,completed,...(total===undefined?{}:{total}),unit:'bytes'});
 canceled();emit();
 if(!response.body?.getReader){
  const bytes=new Uint8Array(await response.arrayBuffer());canceled();completed=bytes.byteLength;if(total!==undefined&&completed!==total)total=undefined;emit();return bytes;
 }
 const reader=response.body.getReader(),chunks=[];
 const abort=()=>{reader.cancel().catch(()=>{});};signal?.addEventListener('abort',abort,{once:true});
 try{
  while(true){canceled();const {done,value}=await reader.read();canceled();if(done)break;chunks.push(value);completed+=value.byteLength;if(total!==undefined&&completed>total)total=undefined;
   const now=Date.now();if(now-last>=100){last=now;emit();}
  }
  if(total!==undefined&&completed!==total)total=undefined;
  emit();const bytes=new Uint8Array(completed);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength;}return bytes;
 }catch(error){try{await reader.cancel();}catch{}throw error;}finally{signal?.removeEventListener('abort',abort);reader.releaseLock?.();}
}
