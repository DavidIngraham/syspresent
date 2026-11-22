/** Encode native qualified names for references; native parsing and resolution remain authoritative. */
export function nativeReference(value){
 if(typeof value!=='string'||!value||/[\u0000-\u001f\u007f]/.test(value))throw Error('Capture requires native-qualified model identities');
 const parts=[];let at=0;
 while(at<value.length){
  const start=at;
  if(value[at]==="'"){
   at++;let closed=false;
   while(at<value.length){
    if(value[at]==='\\'){at+=2;continue;}
    if(value[at++]==="'"){closed=true;break;}
   }
   if(!closed||at>value.length)throw Error('Unclosed native quoted name');
   parts.push(value.slice(start,at));
  }else{
   while(at<value.length&&value.slice(at,at+2)!=='::')at++;
   const name=value.slice(start,at);if(!name)throw Error('Empty native qualified-name segment');
   parts.push("'"+name.replaceAll('\\','\\\\').replaceAll("'","\\'")+"'");
  }
  if(at===value.length)break;
  if(value.slice(at,at+2)!=='::'||at+2===value.length)throw Error('Invalid native qualified-name separator');
  at+=2;
 }
 return parts.join('::');
}
