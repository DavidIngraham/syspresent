import {validatePresentation} from './preferences.mjs';
import {validateStoryContent} from './story-content.mjs';
import {zipSync,unzipSync,strToU8,strFromU8} from 'fflate';
const SCHEMA='syspresent.project.v1',AUTHOR_SCHEMA='syspresent.project.v2';
const sourceFile=name=>/\.(sysml|kerml)$/i.test(name);
const conventionalView=name=>name==='views.sysml'||/^views\/.+\.sysml$/i.test(name);
const reservedSource=name=>name.split('/').at(-1).startsWith('__syspresent_');
const strings=(value,label,{empty=true}={})=>{if(!Array.isArray(value)||(!empty&&!value.length)||!value.every(x=>typeof x==='string'&&x)||new Set(value).size!==value.length)throw Error('Invalid '+label);return value;};
export function projectPath(name){if(typeof name!=='string'||!name||name.startsWith('/')||name.includes('\\')||name.includes(':')||/[\u0000-\u001f\u007f]/.test(name)||name.split('/').some(x=>x==='..'||x==='.'||!x))throw Error('Invalid project path: '+name);return name;}
export const fileText=(project,name)=>{projectPath(name);if(!Object.hasOwn(project.files,name))throw Error('Missing project file: '+name);const value=project.files[name];return typeof value==='string'?value:strFromU8(value);};
// File discovery identifies paths and editable presentation files only. Native
// parsing supplies every semantic root, identity, relationship and view usage.
export function normalizeProject(project,{title}={}){
 if(!project||!project.files||typeof project.files!=='object')throw Error('Project requires files');
 const files=Object.fromEntries(Object.entries(project.files).map(([name,value])=>[projectPath(name),value]));
 let author=project.authorManifest??project.manifest;
 if(project.manifest?.schemaVersion===SCHEMA)return {...project,files};
 if(author&&author.schemaVersion!==AUTHOR_SCHEMA)throw Error('Unsupported project manifest');
 author=author??{schemaVersion:AUTHOR_SCHEMA};
 for(const field of ['modelSources','viewSources','systemOfInterest','modelRoots','requirementSeeds','entryView','entryFocus','runtimeCache'])if(Object.hasOwn(author,field))throw Error('Computed project field is not authored in v2: '+field);
 if(author.title!==undefined&&(typeof author.title!=='string'||!author.title.trim()))throw Error('Invalid project title');
 const discovered=Object.keys(files).filter(sourceFile).sort();
 for(const name of discovered)if(reservedSource(name))throw Error('Reserved runtime source filename: '+name);
 const sources=author.sources===undefined?discovered:strings(author.sources,'project sources',{empty:false}).map(projectPath);
 if(!sources.length)throw Error('Project requires at least one SysML or KerML source');
 for(const name of sources){if(!sourceFile(name))throw Error('Project source must be SysML or KerML: '+name);fileText({files},name);}
 const viewSources=author.views===undefined?sources.filter(conventionalView):strings(author.views,'project views').map(projectPath);
 for(const name of viewSources){if(!sourceFile(name))throw Error('Project view source must be SysML or KerML: '+name);fileText({files},name);}
 if(!viewSources.length){if(Object.hasOwn(files,'views.sysml')&&!sources.includes('views.sysml'))throw Error('Existing views.sysml must be included as a source or editable view');files['views.sysml']??='';viewSources.push('views.sysml');}
 const story=projectPath(author.story??'story.md');
 if(author.story!==undefined)fileText({files},story);else files[story]??='';
 if(sourceFile(story)||story==='project.json')throw Error('Story must be a separate presentation file');
 const navigation=author.navigation??{};
 if(!navigation||typeof navigation!=='object'||Array.isArray(navigation))throw Error('Invalid project navigation');
 const roots=navigation.roots===undefined?[]:strings(navigation.roots,'navigation roots');
 for(const key of ['view','focus'])if(navigation[key]!==undefined&&(typeof navigation[key]!=='string'||!navigation[key]))throw Error('Invalid navigation '+key);
 const scope=author.publication?.scope??'complete';if(!['complete','scoped'].includes(scope))throw Error('Publication scope must be complete or scoped');
 const allSources=new Set([...sources,...viewSources]);
 const manifest={schemaVersion:SCHEMA,title:author.title??title??'Imported model',modelSources:sources.filter(name=>!viewSources.includes(name)),viewSources:[...viewSources],systemOfInterest:[...roots],story,assets:Object.keys(files).filter(name=>name!=='project.json'&&name!==story&&!allSources.has(name)).sort(),publication:{scope},...(Object.hasOwn(files,'runtime-cache.json')?{runtimeCache:'runtime-cache.json'}:{}),...(navigation.view?{entryView:navigation.view}:{}),...(navigation.focus?{entryFocus:navigation.focus}:{}),...(author.source!==undefined?{source:author.source}:{})};
 return {...project,files,manifest,authorManifest:author};
}
export function validateProject(project){
 if(project?.manifest?.schemaVersion!==SCHEMA)Object.assign(project,normalizeProject(project));
 const m=project.manifest;if(m?.schemaVersion!==SCHEMA)throw Error('Unsupported project manifest');
 for(const name of Object.keys(project.files))projectPath(name);
 for(const key of ['modelSources','viewSources','systemOfInterest'])strings(m[key],'project '+key,{empty:!!project.authorManifest});
 if(!m.modelSources.length&&!m.viewSources.length)throw Error('Project requires source files');
 if(m.requirementSeeds!==undefined)strings(m.requirementSeeds,'native requirement seeds',{empty:!!project.authorManifest});
 if(m.modelRoots!==undefined)strings(m.modelRoots,'native model roots',{empty:false});
 for(const name of [...m.modelSources,...m.viewSources])if(reservedSource(name))throw Error('Reserved runtime source filename: '+name);
 for(const name of [...m.modelSources,...m.viewSources,m.story,...(m.assets??[])])fileText(project,name);
 if(new Set([...m.modelSources,...m.viewSources]).size!==m.modelSources.length+m.viewSources.length)throw Error('Model and view source files must be separate');
 if(!['complete','scoped'].includes(m.publication?.scope))throw Error('Publication scope must be complete or scoped');
 validateStoryContent(parseStory(fileText(project,m.story)),{files:project.files,pathFor:projectPath});
 return project;
}
// Runtime indexes and generated caches never become authoring requirements.
export function projectDescriptor(project){
 validateProject(project);if(!project.authorManifest)return project.manifest;
 const author={...project.authorManifest},m=project.manifest;
 if(author.title!==undefined||m.title!=='Imported model')author.title=m.title;
 const actualSources=[...m.modelSources,...m.viewSources].sort(),discovered=Object.keys(project.files).filter(sourceFile).sort();
 if(author.sources!==undefined||JSON.stringify(actualSources)!==JSON.stringify(discovered))author.sources=actualSources;else delete author.sources;
 const conventional=actualSources.filter(conventionalView),views=[...m.viewSources].sort();
 if(author.views!==undefined||JSON.stringify(views)!==JSON.stringify(conventional))author.views=views;else delete author.views;
 if(author.story!==undefined||m.story!=='story.md')author.story=m.story;else delete author.story;
 return author;
}
export function parseStory(markdown){
 const scenes=[],pattern=/^```syspresent\s*\n([\s\S]*?)\n```[ \t]*$/gm;let previous;
 for(const match of markdown.matchAll(pattern)){
  if(previous)previous.markdown=markdown.slice(previous.bodyStart,match.index).trim();
  let config;try{config=JSON.parse(match[1]);}catch{throw Error('Invalid scene JSON near character '+match.index);}
  if(config.type!=='scene')throw Error('Canvas prototype requires scene blocks');
  for(const key of ['id','title','view','focus'])if(typeof config[key]!=='string'||!config[key])throw Error('Scene requires '+key);
  if(scenes.some(s=>s.id===config.id))throw Error('Duplicate scene '+config.id);
  if(config.journey!==undefined&&(!Array.isArray(config.journey)||!config.journey.every(x=>typeof x==='string'&&x)))throw Error('Invalid scene journey');
  if(config.presentation!==undefined)validatePresentation(config.presentation);
  if(config.regions!==undefined){
   if(!Array.isArray(config.regions)||config.regions.length>3)throw Error('A scene supports up to three additional view regions');
   const ids=new Set(['primary','comparison']);
   for(const r of config.regions){if(!r||typeof r.id!=='string'||!r.id||ids.has(r.id)||typeof r.view!=='string'||!r.view||r.focus!==undefined&&(typeof r.focus!=='string'||!r.focus))throw Error('Invalid or duplicate scene region');ids.add(r.id);}
  }
  if(!['right','bottom','left'].includes(config.panel?.placement??'right'))throw Error('Unsupported panel placement');
  previous={...config,bodyStart:match.index+match[0].length,markdown:''};scenes.push(previous);
 }
 if(previous)previous.markdown=markdown.slice(previous.bodyStart).trim();
 const result=scenes.map(({bodyStart,...scene})=>scene);validateStoryContent(result);return result;
}
export function writeStory(title,scenes){return '# '+title+'\n\n'+scenes.map(({markdown,...config})=>'```syspresent\n'+JSON.stringify({...config,type:'scene'})+'\n```\n\n'+(markdown??'').trim()+'\n').join('\n');}
export function packProject(project){validateProject(project);const files=Object.create(null);for(const [name,data] of Object.entries(project.files))files[projectPath(name)]=typeof data==='string'?strToU8(data):data;files['project.json']=strToU8(JSON.stringify(projectDescriptor(project),null,2)+'\n');return zipSync(files,{level:6});}
export function unpackProject(bytes){
 let expanded=0;let files=unzipSync(bytes,{filter:entry=>{projectPath(entry.name.replace(/\/$/,''));if(entry.name.endsWith('/'))return false;if(entry.originalSize>64*1024*1024||(expanded+=entry.originalSize)>160*1024*1024)throw Error('Project archive exceeds prototype size limit');return true;}});
 const names=Object.keys(files),folder=names[0]?.split('/')[0];
 if(names.length&&names.every(name=>name.includes('/')&&name.split('/')[0]===folder))files=Object.fromEntries(names.map(name=>[name.slice(folder.length+1),files[name]]));
 const manifest=files['project.json']?JSON.parse(strFromU8(files['project.json'])):undefined;
 return validateProject({manifest,files});
}
export function documentsFor(project){return [...project.manifest.modelSources,...project.manifest.viewSources].map(name=>({name,content:fileText(project,name),language:/\.kerml$/i.test(name)?'kerml':'sysml'}));}
export function appendScene(project,scene){
 const scenes=parseStory(fileText(project,project.manifest.story));if(scenes.some(s=>s.id===scene.id))throw Error('Scene ID already exists');
 scenes.push(scene);project.files[project.manifest.story]=writeStory(project.manifest.title,scenes);return scenes;
}
export function captureViewSource({packageName='CanvasCaptured',name,qualifiedNames,definition='GeneralView'}){
 // References are already resolved native names. No SysML is parsed here.
 const quoted=s=>"'"+s.replaceAll('\\','\\\\').replaceAll("'","\\'")+"'";
 if(!['GeneralView','ActionFlowView','InterconnectionView','StateTransitionView','SequenceView'].includes(definition))throw Error('Unsupported captured view definition');
 if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(packageName))throw Error('Invalid captured package name');
 if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(name))throw Error('Invalid captured view name');
 const refs=[...new Set(qualifiedNames)];if(!refs.length)throw Error('Capture requires native-qualified model elements');
 const reference=q=>q.split('::').map(quoted).join('::');
 return `package ${packageName} {\n    private import StandardViewDefinitions::*;\n    view ${name} : ${definition} {\n${refs.map(q=>'        expose '+reference(q)+';').join('\n')}\n    }\n}\n`;
}

export function requirementCoverageSource(qualifiedRoots,packageName='SyspresentRuntimeContext',seeds){
 const quoted=s=>"'"+s.replaceAll('\\','\\\\').replaceAll("'","\\'")+"'";
 return `package ${packageName} {
 private import StandardViewDefinitions::*;
 view coverage : GeneralView {
${seeds?'  @OpenSysMLRenderings::RequirementContext { relationshipDepth = 1; }\n':''}  filter @SysML::RequirementUsage or @SysML::RequirementDefinition;
${(seeds??qualifiedRoots).map(q=>'  expose '+q.split('::').map(quoted).join('::')+(seeds?';':'::**;')).join('\n')}
 }
}
`;
}

export async function sourceDigest(documents){const bytes=new TextEncoder().encode(JSON.stringify(documents));return [...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');}
// Cache readers are scoped to one compilation. Every check hashes the current
// file bytes; only verified JSON parsing is shared with index preparation.
export function createRuntimeCacheReader(project,{trustedHash,engineVersion,engineFingerprint}={}){
 let parsed,queue=Promise.resolve();
 const serial=operation=>{const result=queue.then(operation);queue=result.then(()=>{},()=>{});return result;};
 async function read(){
  const filename=project.manifest.runtimeCache;
  if(!filename||!trustedHash){parsed=undefined;return null;}
  const value=project.files[filename];
  if(value===undefined||value===null){parsed=undefined;return null;}
  // Capture the bytes which will be parsed, not a later read of a mutable file.
  const bytes=typeof value==='string'?new TextEncoder().encode(value):parsed?value:new Uint8Array(value);
  const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
  if(hash!==trustedHash){parsed=undefined;return null;}
  parsed??=JSON.parse(typeof value==='string'?value:strFromU8(bytes));
  if(!parsed||typeof parsed!=='object'||parsed.schemaVersion!=='syspresent.native-cache.v1'||parsed.engineVersion!==engineVersion||parsed.engineFingerprint!==engineFingerprint)return null;
  return parsed;
 }
 return {
  // An index can prepare native inputs, but never authorizes cached semantics.
  index({documents}){
   return serial(async()=>{
    let cache;try{cache=await read();}catch(error){if(error instanceof SyntaxError)return null;throw error;}
    if(!cache||cache.inputDigest!==await sourceDigest(documents))return null;
    if(!Array.isArray(cache.modelRoots)||!cache.modelRoots.length||!cache.modelRoots.every(x=>typeof x==='string'&&x)||!Array.isArray(cache.requirementSeeds)||!cache.requirementSeeds.every(x=>typeof x==='string'&&x))return null;
    if(cache.runtimePackage!==undefined&&(typeof cache.runtimePackage!=='string'||!/^[A-Za-z][A-Za-z0-9_]*$/.test(cache.runtimePackage)))return null;
    return {modelRoots:[...cache.modelRoots],requirementSeeds:[...cache.requirementSeeds],...(cache.runtimePackage!==undefined?{runtimePackage:cache.runtimePackage}:{})};
   });
  },
  cache({documents,modelHash}){
   return serial(async()=>{
    const cache=await read();
    if(!cache||cache.modelHash!==modelHash||cache.sourceDigest!==await sourceDigest(documents))return null;
    // Transfer ownership so a later reader call cannot observe caller mutations.
    parsed=undefined;
    return cache;
   });
  }
 };
}
export async function verifiedRuntimeCache(project,options){
 return createRuntimeCacheReader(project,options).cache(options);
}

// A publisher-trusted cache may accelerate native index preparation. This does
// not authorize reusing exported semantics before the actual native parse.
export async function verifiedRuntimeIndex(project,options){
 return createRuntimeCacheReader(project,options).index(options);
}
