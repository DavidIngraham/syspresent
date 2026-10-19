import {zipSync,unzipSync,strToU8,strFromU8} from 'fflate';
const SCHEMA='syspresent.project.v1';
export function projectPath(name){if(typeof name!=='string'||!name||name.startsWith('/')||name.includes('\\')||name.includes(':')||name.split('/').some(x=>x==='..'||x==='.'||!x))throw Error('Invalid project path: '+name);return name;}
export const fileText=(project,name)=>{const value=project.files[projectPath(name)];if(value===undefined)throw Error('Missing project file: '+name);return typeof value==='string'?value:strFromU8(value);};
export function validateProject(project){
 const m=project.manifest;if(m?.schemaVersion!==SCHEMA)throw Error('Unsupported project manifest');
 for(const key of ['modelSources','viewSources','systemOfInterest'])if(!Array.isArray(m[key])||!m[key].length||!m[key].every(x=>typeof x==='string'&&x))throw Error('Project requires '+key);
 if(m.requirementSeeds!==undefined&&(!Array.isArray(m.requirementSeeds)||!m.requirementSeeds.length||!m.requirementSeeds.every(x=>typeof x==='string'&&x)))throw Error('Invalid native requirement seeds');
 if(m.modelRoots!==undefined&&(!Array.isArray(m.modelRoots)||!m.modelRoots.length||!m.modelRoots.every(x=>typeof x==='string'&&x)))throw Error('Invalid native model roots');
 for(const name of [...m.modelSources,...m.viewSources,m.story,...(m.assets??[])])fileText(project,name);
 if(new Set([...m.modelSources,...m.viewSources]).size!==m.modelSources.length+m.viewSources.length)throw Error('Model and view source files must be separate');
 if(!['complete','scoped'].includes(m.publication?.scope))throw Error('Publication scope must be complete or scoped');
 return project;
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
  if(!['right','bottom','left'].includes(config.panel?.placement??'right'))throw Error('Unsupported panel placement');
  previous={...config,bodyStart:match.index+match[0].length,markdown:''};scenes.push(previous);
 }
 if(previous)previous.markdown=markdown.slice(previous.bodyStart).trim();
 return scenes.map(({bodyStart,...scene})=>scene);
}
export function writeStory(title,scenes){return '# '+title+'\n\n'+scenes.map(({markdown,...config})=>'```syspresent\n'+JSON.stringify({...config,type:'scene'})+'\n```\n\n'+(markdown??'').trim()+'\n').join('\n');}
export function packProject(project){validateProject(project);const files={};for(const [name,data] of Object.entries(project.files))files[projectPath(name)]=typeof data==='string'?strToU8(data):data;files['project.json']=strToU8(JSON.stringify(project.manifest,null,2)+'\n');return zipSync(files,{level:6});}
export function unpackProject(bytes){
 let expanded=0;const files=unzipSync(bytes,{filter:entry=>{projectPath(entry.name.replace(/\/$/,''));if(entry.name.endsWith('/'))return false;if(entry.originalSize>64*1024*1024||(expanded+=entry.originalSize)>160*1024*1024)throw Error('Project archive exceeds prototype size limit');return true;}});
 if(!files['project.json'])throw Error('Project archive requires project.json at its root');
 return validateProject({manifest:JSON.parse(strFromU8(files['project.json'])),files});
}
export function documentsFor(project){return [...project.manifest.modelSources,...project.manifest.viewSources].map(name=>({name,content:fileText(project,name),language:name.endsWith('.kerml')?'kerml':'sysml'}));}
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
export async function verifiedRuntimeCache(project,{trustedHash,engineVersion,engineFingerprint,documents,modelHash}){
 const filename=project.manifest.runtimeCache;if(!filename||!trustedHash)return null;
 const value=project.files[filename],bytes=typeof value==='string'?new TextEncoder().encode(value):value;
 if(!bytes)return null;const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(b=>b.toString(16).padStart(2,'0')).join('');
 if(hash!==trustedHash)return null;
 const cache=JSON.parse(fileText(project,filename));
 if(cache.schemaVersion!=='syspresent.native-cache.v1'||cache.engineVersion!==engineVersion||cache.engineFingerprint!==engineFingerprint||cache.modelHash!==modelHash||cache.sourceDigest!==await sourceDigest(documents))return null;
 return cache;
}
