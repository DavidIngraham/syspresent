/** Native capture and explicit conversation turns. Never interprets question prose. */
import {appendScene,documentsFor,fileText,parseStory,validateProject} from './project.mjs';
import {adaptNativeView,requireNativeIdentity} from './graph.mjs';
import {representedIdentities} from './view-contract.mjs';

const DEFINITIONS=new Set(['GeneralView','ActionFlowView','InterconnectionView','StateTransitionView','SequenceView']);
const quote=value=>"'"+value.replaceAll('\\','\\\\').replaceAll("'","\\'")+"'";
const reference=value=>{
 if(typeof value!=='string'||!value||/[\u0000-\u001f\u007f]/.test(value))throw Error('Capture requires native-qualified model identities');
 return value.split('::').map(quote).join('::');
};
export function nativeViewDefinitionSource({packageName,name='slide',definition='GeneralView',qualifiedNames,kinds=[]}){
 for(const value of [packageName,name])if(!/^[A-Za-z][A-Za-z0-9_]*$/.test(value??''))throw Error('Invalid captured declaration name');
 if(!DEFINITIONS.has(definition))throw Error('Unsupported captured native notation: '+definition);
 const refs=[...new Set(qualifiedNames??[])];if(!refs.length)throw Error('Capture requires native-qualified model elements');
 const filters=[...new Set(kinds)];if(filters.some(kind=>!/^\w+(Usage|Definition)$/.test(kind)))throw Error('Unsupported native capture filter');
 const requirement=filters.some(kind=>/^Requirement(Usage|Definition)$/.test(kind));
 // Expose belongs to a view usage in SysML v2, never the definition body.
 // RequirementContext is an explicit OpenSysML rendering extension, not OMG notation.
 return `package ${packageName} {\n    private import StandardViewDefinitions::*;\n    view def Definition :> ${definition}${filters.length?' {\n        filter '+filters.map(kind=>'@SysML::'+kind).join(' or ')+';\n    }':';'}\n    view ${name} : Definition {\n${requirement?'        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }\n':''}${refs.map(q=>'        expose '+reference(q)+';').join('\n')}\n    }\n}\n`;
}
function identities(view){return [...new Set((view.nodes??[]).map(node=>node.semanticId).filter(Boolean))].sort();}
function edges(view){
 const nodes=new Map((view.nodes??[]).map(node=>[node.id,node.semanticId]));
 return (view.edges??[]).map(edge=>{
  const source=edge.semanticSource??edge.sourceSemanticId??nodes.get(edge.fromId??edge.from??edge.source);
  const target=edge.semanticTarget??edge.targetSemanticId??nodes.get(edge.toId??edge.to??edge.target);
  return JSON.stringify([source,target,edge.kind]);
 }).sort();
}
/** This verifies selection and directed relationship occurrences, never coordinates. */
export function assertExactNativeProjection(expected,actual){
 const wanted=identities(expected),got=identities(actual);
 if(JSON.stringify(wanted)!==JSON.stringify(got)||JSON.stringify(edges(expected))!==JSON.stringify(edges(actual)))throw Error(`This exploration cannot yet be captured faithfully by the native renderer (${wanted.length} requested elements, ${got.length} rendered). Open a declared native view, Internal view, or Activity view and capture that instead.`);
}
function nextIdentity(project,graph){
 const scenes=parseStory(fileText(project,project.manifest.story)),used=new Set(scenes.map(scene=>scene.id));
 const names=new Set((graph?.elements??[]).map(element=>element.qualifiedName));
 let number=scenes.length+1;while(used.has('captured-'+number)||names.has('CanvasCaptured'+number))number++;
 return {number,id:'captured-'+number,packageName:'CanvasCaptured'+number};
}
/** Prepare a cloned project; caller commits it only after its own stale-result guard. */
export async function prepareNativeCapture(project,{view,graph,views,focus,title='Captured view',markdown='',presentation,panel={placement:'right'},engine,question}={}){
 if(!view)throw Error('Open a view before capturing a slide');
 if(typeof engine?.call!=='function')throw Error('Native capture requires the semantic engine');
 const focusElement=graph?.elements.find(element=>element.id===focus||element.qualifiedName===focus);
 const focusName=focusElement?.qualifiedName;
 if(!focusName)throw Error('Captured focus needs a native qualified identity');
 const candidate=structuredClone(project),identity=nextIdentity(candidate,graph);
 let viewName=view.id,source;
 const declared=views?.has?.(viewName);
 if(!declared){
  const selected=identities(view),byId=new Map((graph?.elements??[]).map(element=>[element.id,element]));
  const names=view.capture?[view.capture.root]:selected.map(id=>byId.get(id)?.qualifiedName);
  if(names.some(name=>!name))throw Error('A selected element has no native qualified identity; capture is unavailable');
  const kinds=view.capture?[]:selected.map(id=>byId.get(id)?.kind).filter(Boolean);
  source=nativeViewDefinitionSource({packageName:identity.packageName,qualifiedNames:names,definition:view.capture?.definition??'GeneralView',kinds});
  const filename='views/captured-views.sysml';
  candidate.files[filename]=(Object.hasOwn(candidate.files,filename)?fileText(candidate,filename)+'\n':'')+source;
  if(!candidate.manifest.viewSources.includes(filename))candidate.manifest.viewSources.push(filename);
  viewName=identity.packageName+'::slide';
 }
 const parsed=await engine.call('ParseSources',{documents:documentsFor(candidate)});
 const errors=(parsed.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error')||d.code==='nonstandard-notation');
 if(errors.length)throw Error('Native captured view is invalid: '+errors.map(d=>d.message).join('; '));
 const raw=await engine.call('RenderView',{modelHash:parsed.modelHash,view:viewName,includeSemanticIdentity:true});
 const nativeView=requireNativeIdentity(adaptNativeView(raw,viewName));
 if(!representedIdentities(nativeView).length)throw Error('The native captured view has no represented model content');
 if(!declared)assertExactNativeProjection(view,nativeView);
 const scene={type:'scene',id:identity.id,title,view:viewName,focus:focusName,panel,allowDisconnected:true,...(presentation?{presentation:structuredClone(presentation)}:{}),...(question?{question}:{}),markdown};
 const scenes=appendScene(candidate,scene);validateProject(candidate);
 return {project:candidate,scene,sceneIndex:scenes.length-1,viewName,source,nativeView};
}
/** Only an explicit question submission calls this; ordinary browsing has no hook. */
export function prepareQuestionSlide(project,{question,...options}={}){
 if(typeof question!=='string'||!question.trim())throw Error('Enter an explicit question before appending a slide');
 return prepareNativeCapture(project,{...options,question:question.trim(),title:options.title??question.trim()});
}
