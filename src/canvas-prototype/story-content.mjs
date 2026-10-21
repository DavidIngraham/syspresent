/** Presentation content only. Model identity is supplied by the native graph. */
const text=(value,label)=>{if(typeof value!=='string'||!value.trim())throw Error(label+' requires nonempty text');return value;};
const identifier=(value,label)=>{text(value,label);if(!/^[A-Za-z][A-Za-z0-9_.-]*$/.test(value))throw Error('Invalid '+label+': '+value);};
export const contextKinds={'challenge-requirement':'Challenge requirement','owner-constraint':'Owner constraint',assumption:'Assumption',allocation:'Provisional allocation',decision:'Design decision',candidate:'Candidate definition',analysis:'Analysis',evidence:'Evidence'};
export function assetType(path){const ext=path.split('.').at(-1).toLowerCase();return {svg:'image/svg+xml',png:'image/png',jpg:'image/jpeg',jpeg:'image/jpeg',webp:'image/webp',gif:'image/gif'}[ext];}
function references(refs,label,required=false){if(refs===undefined&&!required)return;if(!Array.isArray(refs)||(required&&!refs.length)||!refs.every(r=>typeof r==='string'&&r.trim()))throw Error(label+' requires modelRefs');}
function evidence(value,label){
 if(!value)return;
 if(!['prepared-analysis','recorded-execution'].includes(value.classification))throw Error(label+': invalid evidence classification');
 for(const key of ['source','configuration'])text(value[key],label+' evidence '+key);
 if(!value.inputs||typeof value.inputs!=='object'||Array.isArray(value.inputs))throw Error(label+': evidence inputs must be an object');
 let count=0;const inspect=(v,depth=0)=>{if(++count>1000||depth>8)throw Error(label+': evidence inputs exceed the supported size');if(typeof v==='number'&&!Number.isFinite(v))throw Error(label+': evidence inputs must contain finite numbers');if(v&&typeof v==='object')for(const item of Object.values(v))inspect(item,depth+1);};inspect(value.inputs);
 if(value.classification==='recorded-execution')text(value.runId,label+' evidence runId');
}
export function validateStoryContent(scenes,{files,pathFor,resolve}={}){
 const chapters=new Map(),closed=new Set();let previous;
 for(const scene of scenes){
  const label='Scene '+scene.id;
  if(scene.allowDisconnected!==undefined&&typeof scene.allowDisconnected!=='boolean')throw Error(label+': allowDisconnected must be boolean');
  if(scene.chapter){identifier(scene.chapter.id,'chapter id');text(scene.chapter.title,'chapter title');const old=chapters.get(scene.chapter.id);if(old&&old!==scene.chapter.title)throw Error('Conflicting chapter title: '+scene.chapter.id);chapters.set(scene.chapter.id,scene.chapter.title);}
  const chapter=scene.chapter?.id;if(chapter!==previous){if(previous)closed.add(previous);if(chapter&&closed.has(chapter))throw Error('Chapter must be contiguous: '+chapter);previous=chapter;}
  const ids=new Set(['primary','comparison',...(scene.regions??[]).map(r=>r.id)]);
  if(scene.figures!==undefined&&(!Array.isArray(scene.figures)||scene.figures.length>3))throw Error(label+': at most three figures are supported');
  if((scene.figures?.length??0)+(scene.regions?.length??0)>3)throw Error(label+': at most three companion regions are supported');
  for(const f of scene.figures??[]){identifier(f.id,'figure id');if(ids.has(f.id))throw Error(label+': duplicate region '+f.id);ids.add(f.id);for(const key of ['title','asset','alt','caption'])text(f[key],label+' figure '+key);
   if(!assetType(f.asset))throw Error(label+': unsupported figure asset '+f.asset);
   pathFor?.(f.asset);if(files&&!Object.hasOwn(files,f.asset))throw Error(label+': missing figure '+f.asset);
   for(const key of ['source','context'])text(f.provenance?.[key],label+' figure provenance '+key);
   references(f.modelRefs,label);evidence(f.evidence,label);
  }
  if(scene.context!==undefined&&!Array.isArray(scene.context))throw Error(label+': context must be an array');
  for(const card of scene.context??[]){if(!Object.hasOwn(contextKinds,card.kind))throw Error(label+': invalid context kind');for(const key of ['title','text'])text(card[key],label+' context '+key);references(card.modelRefs,label,true);evidence(card.evidence,label);}
  const refs=[...markdownModelReferences(scene.markdown??''),...(scene.figures??[]).flatMap(f=>f.modelRefs??[]),...(scene.context??[]).flatMap(c=>c.modelRefs)];
  if(resolve)for(const ref of refs)if(!resolve(ref))throw Error(label+': model reference does not resolve: '+ref);
 }
}
// Inline parsing is deliberately small and does not interpret HTML or execute author code.
export function inlineTokens(value){
 const tokens=[],pattern=/`([^`]+)`|\[([^\]\n]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;let start=0;
 for(const m of value.matchAll(pattern)){if(m.index>start)tokens.push({type:'text',text:value.slice(start,m.index)});tokens.push(m[1]?{type:'code',text:m[1]}:m[2]?{type:'link',text:m[2],target:m[3]}:{type:m[4]?'strong':'em',text:m[4]??m[5]});start=m.index+m[0].length;}
 if(start<value.length)tokens.push({type:'text',text:value.slice(start)});return tokens;
}
function modelRef(target){try{return decodeURIComponent(target.slice(6));}catch{throw Error('Invalid encoded model link: '+target);}}
export function markdownModelReferences(value){let fenced=false;return value.split('\n').flatMap(line=>{if(/^\s*```/.test(line)){fenced=!fenced;return [];}return fenced?[]:inlineTokens(line).filter(t=>t.type==='link'&&t.target.startsWith('model:')).map(t=>modelRef(t.target));});}
export function renderMarkdown(doc,value,{resolve,onSelect}={}){
 const host=doc.createElement('div');let paragraph=[],list,code;
 const inline=(parent,line)=>{for(const t of inlineTokens(line)){if(t.type==='text'){parent.append(doc.createTextNode(t.text));continue;}let node;
   if(t.type==='link'){
    if(t.target.startsWith('model:')){const ref=modelRef(t.target),id=resolve(ref);if(!id)throw Error('Unresolved model link: '+ref);node=doc.createElement('button');node.type='button';node.className='model-link';node.dataset.modelId=id;node.onclick=()=>onSelect(id);}
    else if(/^https?:\/\//i.test(t.target)){node=doc.createElement('a');node.href=t.target;node.target='_blank';node.rel='noopener noreferrer';}
    else {parent.append(doc.createTextNode(t.text));continue;}
   }else node=doc.createElement(t.type);node.textContent=t.text;parent.append(node);
  }};
 const flush=()=>{if(paragraph.length){const p=doc.createElement('p');inline(p,paragraph.join(' '));host.append(p);paragraph=[];}list=null;};
 for(const line of value.split('\n')){
  if(/^\s*```/.test(line)){flush();if(code)code=null;else{const pre=doc.createElement('pre');code=doc.createElement('code');pre.append(code);host.append(pre);}continue;}
  if(code){code.textContent+=line+'\n';continue;}
  const heading=/^(#{1,6})\s+(.+)$/.exec(line),item=/^\s*(?:([-*])|\d+\.)\s+(.+)$/.exec(line);
  if(heading){flush();const h=doc.createElement('h'+Math.min(6,heading[1].length+1));inline(h,heading[2]);host.append(h);}
  else if(item){if(paragraph.length)flush();const tag=item[1]?'UL':'OL';if(!list||list.tagName!==tag){list=doc.createElement(tag);host.append(list);}const li=doc.createElement('li');inline(li,item[2]);list.append(li);}
  else if(!line.trim())flush();else paragraph.push(line);
 }flush();return host;
}
const el=(doc,tag,value,cls)=>{const node=doc.createElement(tag);if(value!==undefined)node.textContent=value;if(cls)node.className=cls;return node;};
export function appendModelReferences(host,refs,{resolve,onSelect,labelFor}){const doc=host.ownerDocument;for(const ref of refs??[]){const id=resolve(ref),b=el(doc,'button',labelFor?.(id)??ref,'model-link');b.type='button';b.dataset.modelId=id;b.onclick=()=>onSelect(id);host.append(b);}}
export function renderEvidence(doc,value){
 const box=el(doc,'details',undefined,'evidence-details');box.append(el(doc,'summary',value.classification==='recorded-execution'?'Recorded execution · source and conditions':'Prepared analysis · source and conditions'));
 const dl=el(doc,'dl');for(const [name,content]of [['Source',value.source],['Configuration',value.configuration],['Run',value.runId]])if(content){dl.append(el(doc,'dt',name),el(doc,'dd',content));}box.append(dl,el(doc,'pre',JSON.stringify(value.inputs,null,2)),el(doc,'p','Classification identifies the supplied record; it does not establish acceptance or a verification verdict.','evidence-note'));return box;
}
export function renderContext(doc,cards,options){const host=el(doc,'div',undefined,'story-context');for(const card of cards??[]){const box=el(doc,'details',undefined,'context-card');box.append(el(doc,'summary',contextKinds[card.kind]+' · '+card.title),el(doc,'p',card.text));const refs=el(doc,'div',undefined,'model-references');appendModelReferences(refs,card.modelRefs,options);box.append(refs);if(card.evidence)box.append(renderEvidence(doc,card.evidence));host.append(box);}return host;}
export function chapterGroups(scenes){const groups=[];for(const [index,scene]of scenes.entries()){const id=scene.chapter?.id??'';let group=groups.at(-1);if(!group||group.id!==id){group={id,title:scene.chapter?.title??'Scenes',scenes:[]};groups.push(group);}group.scenes.push({scene,index});}return groups;}
export function sceneFromURL(url,scenes){const hash=new URLSearchParams(new URL(url).hash.slice(1)),id=hash.get('scene'),chapter=hash.get('chapter');if(!id&&!chapter)return 0;const index=scenes.findIndex(s=>id?s.id===id:s.chapter?.id===chapter);if(index<0)throw Error('Shared '+(id?'scene':'chapter')+' is unavailable: '+(id??chapter));return index;}
export function sceneURL(base,{scene,modelHash,demo,publication}){const url=new URL(base);if(demo)url.searchParams.set('demo',demo);url.hash=new URLSearchParams({scene,...(modelHash?{model:modelHash}:{}),...(publication?{publication}:{})}).toString();return url.href;}
export function checkSharedModel(url,modelHash,publication){const hash=new URLSearchParams(new URL(url).hash.slice(1)),expected=hash.get('model'),version=hash.get('publication');if(expected&&expected!==modelHash||version&&version!==publication)throw Error('This link refers to a different story or model snapshot. Open its original publication or remove the link fragment to read this version.');}
export function nativeIdentityResolver(exported){const ids=new Set(),names=new Map();for(const e of exported.elements){ids.add(e['@id']);if(e.qualifiedName){const list=names.get(e.qualifiedName)??[];list.push(e['@id']);names.set(e.qualifiedName,list);}}return ref=>{if(ids.has(ref))return ref;const found=names.get(ref)??[];if(found.length>1)throw Error('Ambiguous native reference: '+ref);return found[0];};}
