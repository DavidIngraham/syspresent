import {showLanding} from './landing.mjs';
import {projectFromSelection} from './browser-project.mjs';
import {discoverNativeIndex} from './native-project.mjs';
import {planDepartures} from './departures.mjs';
import {requirementActions,structuralActions,isStructuralElement,traceContext} from './exploration.mjs';
import {resolvePresentation,validatePresentation,PRESENTATION_RELATIONSHIP_KINDS} from './preferences.mjs';
import {surroundingContext} from './context.mjs';
import {prepareNeighborhood} from './neighborhood.mjs';
import {journeyCameraTrack} from './journey-camera.mjs';
import {createCamera,zoomCameraAt,fitCameraToBounds,bindCameraControls} from './camera.mjs';
import {routePeripheralEdges,peripheralRoutingMetrics,peripheralRouteScore} from './peripheral-routing.mjs';
import {sampleTrack,startTimeline,samplePolyline,visibleTrackKeys} from './motion.mjs';
import {documentationFor,measureCard} from './documentation.mjs';
import {graphArea,fitDiagram,routeEdges,routeIsClear,routeConnectsEndpoints} from './geometry.mjs';
import {createLayoutEngine,layoutDiagram} from './elk-layout.mjs';
import {edgeAppearance,markerDefinition} from './notation.mjs';
import {createSemanticEngine} from './engine/client.mjs';
import {engineeringContext,findEngineeringRoute,findHierarchyRoute,planTransition,directTypingContext} from './core/index.mjs';
import {adaptNativeView,modelGraph,graphView,requireNativeIdentity} from './graph.mjs';
import {validateProject,fileText,parseStory,writeStory,packProject,unpackProject,documentsFor,appendScene,captureViewSource,requirementCoverageSource,verifiedRuntimeCache,verifiedRuntimeIndex,projectPath} from './project.mjs';
const buildVersion=document.querySelector('meta[name="syspresent-build"]')?.content||'development';
const $=id=>document.getElementById(id),el=(name,text,cls)=>{const e=document.createElement(name);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn)=>{const e=el('button',text);e.type='button';e.onclick=()=>Promise.resolve(fn()).catch(report);return e;};
const state={engine:null,project:null,graph:null,views:new Map(),scenes:[],sceneIndex:0,focus:null,selected:null,view:null,displayed:null,exploring:false,expanded:new Set(),collapsed:new Set(),rects:new Map(),reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,revision:0,loadRevision:0,animations:[],transitioning:false,provenance:null,history:[],future:[],presentation:{},traceRequest:null,camera:createCamera(),cameraRevision:0,neighborhoodBudget:null};
const report=error=>{const message=error.message||String(error);$('status').textContent=message;$('editor-error').textContent=message;if(!$('landing').hidden){$('landing-error').textContent=message;$('landing-error').hidden=false;$('landing-status').textContent='';}console.error(error);};
const element=id=>state.graph?.elements.find(e=>e.id===id),label=id=>element(id)?.name||id;
function resolveInGraph(graph,value){const exact=graph?.elements.find(e=>e.id===value);if(exact)return exact.id;const matches=graph?.elements.filter(e=>e.qualifiedName===value)??[];if(matches.length>1)throw Error('Ambiguous native qualified reference: '+value);return matches[0]?.id;}
const resolve=value=>resolveInGraph(state.graph,value);
const qname=id=>element(id)?.qualifiedName;
const scene=()=>state.scenes[state.sceneIndex];
function scopeIds(){const roots=state.project.manifest.systemOfInterest;return state.graph.elements.filter(e=>roots.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id);}
function status(text){$('status').textContent=text;$('loading-phase').textContent=text;if(!$('landing').hidden)$('landing-status').textContent=text;}
function inline(parent,text){let start=0;for(const m of text.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g)){parent.append(document.createTextNode(text.slice(start,m.index)));parent.append(el(m[1]?'strong':m[2]?'code':'em',m[1]??m[2]??m[3]));start=m.index+m[0].length;}parent.append(document.createTextNode(text.slice(start)));}
function markdown(text){const host=el('div');let paragraph=[],list;const flush=()=>{if(paragraph.length){const p=el('p');inline(p,paragraph.join(' '));host.append(p);paragraph=[];}list=null;};for(const line of text.split('\n')){const heading=/^(#{1,6})\s+(.+)$/.exec(line),item=/^[-*]\s+(.+)$/.exec(line);if(heading){flush();host.append(el('h'+Math.min(6,Number(heading[1].length)+1),heading[2]));}else if(item){if(paragraph.length)flush();if(!list){list=el('ul');host.append(list);}const li=el('li');inline(li,item[1]);list.append(li);}else if(!line.trim())flush();else paragraph.push(line);}flush();return host;}
let engineReady, demoCatalog;
async function ensureEngine(){
 if(engineReady)return engineReady;
 status('Starting the model engine…');
 state.layoutEngine??=createLayoutEngine({workerUrl:new URL('./layout/elk-worker.js?v='+buildVersion,location.href).href});
 state.engine=createSemanticEngine({assetBase:new URL('./engine/',location.href),assetVersion:buildVersion,workerURL:new URL('./engine/worker.js?v='+buildVersion,location.href)});
 engineReady=(async()=>{state.engineInfo=await state.engine.ready;const response=await fetch('./engine/provenance.json?v='+buildVersion);if(!response.ok)throw Error('Model engine provenance is unavailable.');state.provenance=await response.json();})().catch(error=>{state.engine?.terminate();engineReady=null;throw error;});
 return engineReady;
}
async function demos(){
 if(demoCatalog)return demoCatalog;
 const response=await fetch('./demos.json?v='+buildVersion);if(!response.ok)throw Error('Demo catalog is unavailable. You can still open your own model files.');
 const catalog=await response.json();if(catalog.schemaVersion!=='syspresent.demos.v1'||!Array.isArray(catalog.demos))throw Error('Unsupported demo catalog');
 const seen=new Set();for(const item of catalog.demos){if(typeof item.id!=='string'||!item.id||seen.has(item.id)||typeof item.title!=='string')throw Error('Invalid demo catalog');seen.add(item.id);projectPath(item.project);}
 demoCatalog=catalog.demos;return demoCatalog;
}
async function openDemo(id){
 const request=++state.loadRevision;++state.revision;busy(true);$('landing-error').hidden=true;status('Opening demo…');
 try{const demo=(await demos()).find(item=>item.id===id);if(!demo)throw Error('Demo not found: '+id);const response=await fetch('./'+demo.project+'?v='+buildVersion);if(!response.ok)throw Error('Demo files are unavailable.');const bytes=new Uint8Array(await response.arrayBuffer());if(request!==state.loadRevision)return;await loadProject(unpackProject(bytes),{cacheHash:demo.runtimeCacheHash,loadToken:request});}
 catch(error){if(request===state.loadRevision)throw error;}finally{if(request===state.loadRevision)busy(false);}
}
function home(){++state.loadRevision;++state.revision;cancelAnimations();$('project-menu').open=false;$('selection').hidden=true;$('find').hidden=true;for(const dialog of document.querySelectorAll('dialog[open]'))dialog.close();busy(false);showLanding(document,true);$('landing-status').textContent='';$('landing-error').hidden=true;$('resume-model').hidden=!state.view;document.title='Syspresent';}
async function compile(project,{cacheHash=state.trustedCacheHash,progress=status}={}){
 const documents=documentsFor(project),scenes=parseStory(fileText(project,project.manifest.story));
 const m=project.manifest;
 let parsed,exported,roots=m.modelRoots,seeds=m.requirementSeeds,runtimePackage;
 const check=result=>{const errors=(result.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error'));if(errors.length)throw Error(errors.map(d=>`${d.message} (${d.span?.file??'source'}:${d.span?.startLine??'?'})`).join('\n'));if(!result.modelHash)throw Error('Native engine returned no model identity');};
 const index=await verifiedRuntimeIndex(project,{trustedHash:cacheHash,engineVersion:state.engineInfo?.version,engineFingerprint:state.provenance?.assets?.['sysml-wasm.wasm']?.sha256,documents});
 if(index){roots=index.modelRoots;seeds=index.requirementSeeds;runtimePackage=index.runtimePackage;}
 if(!roots?.length||seeds===undefined||!runtimePackage){
  parsed=await state.engine.call('ParseSources',{documents});check(parsed);
  exported=await state.engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
  const discovered=discoverNativeIndex(parsed,exported,{modelDocumentCount:m.modelSources.length});
  roots=roots?.length?roots:discovered.modelRoots;seeds??=discovered.requirementSeeds;
  runtimePackage='SyspresentRuntimeContext';const names=new Set(exported.elements.map(e=>e.qualifiedName));while(names.has(runtimePackage))runtimePackage+='X';
 }
 if(!roots.length)throw Error('No named model declarations were found in the supplied files.');
 progress('Resolving the complete project with OpenSysML WASM…');
 const allDocuments=[...documents,{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(roots,runtimePackage,seeds)}];
 parsed=await state.engine.call('ParseSources',{documents:allDocuments});check(parsed);
 const cache=await verifiedRuntimeCache(project,{trustedHash:cacheHash,engineVersion:state.engineInfo?.version,engineFingerprint:state.provenance?.assets?.['sysml-wasm.wasm']?.sha256,documents:allDocuments,modelHash:parsed.modelHash});
 progress('Loading model declarations and requirement relationships…');
 exported=structuredClone(cache?.exported??await state.engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'}));
 if(!Array.isArray(exported.elements))throw Error('Native model export has no element array');
 if(m.modelRoots?.length){const modelRootIDs=parsed.roots.slice(0,m.modelSources.length).flatMap(r=>r.childIds??[]),actual=exported.elements.filter(e=>modelRootIDs.includes(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName);const missing=actual.filter(name=>!roots.includes(name));if(missing.length)throw Error('Native model roots need rebuilding: '+missing.join(', '));}
 const coverage=requireNativeIdentity(adaptNativeView(seeds.length?(cache?.coverage??await state.engine.call('RenderView',{modelHash:parsed.modelHash,view:runtimePackage+'::coverage',includeSemanticIdentity:true})):{kind:'definition',nodes:[],edges:[]},runtimePackage+'::coverage'));
 exported.elements=exported.elements.filter(e=>e.qualifiedName!==runtimePackage&&!e.qualifiedName?.startsWith(runtimePackage+'::'));
 const availableViews=exported.elements.filter(e=>e['@type']==='ViewUsage'&&e.qualifiedName&&e['sysx:sourceLine']).map(e=>e.qualifiedName);
 const needed=new Set([...scenes.map(s=>s.view),...(m.entryView?[m.entryView]:[])]),views=new Map();
 for(const name of needed){if(!availableViews.includes(name))throw Error('Native view does not resolve: '+name);progress('Preparing '+(scenes.find(s=>s.view===name)?.title||'model view')+'…');const raw=cache?.views?.[name]??await state.engine.call('RenderView',{modelHash:parsed.modelHash,view:name,includeSemanticIdentity:true});views.set(name,requireNativeIdentity(adaptNativeView(raw,name)));}
 if(!m.systemOfInterest.length)m.systemOfInterest=[...roots];
 const graph=modelGraph(exported.elements,[...views.values(),coverage]);
 for(const root of project.manifest.systemOfInterest)if(!resolveInGraph(graph,root))throw Error('System of interest does not resolve: '+root);
 const byName=value=>resolveInGraph(graph,value);
 for(const [sceneIndex,item] of scenes.entries()){resolvePresentation(item.presentation,{resolve:byName});if(item.journey?.length&&(byName(item.journey.at(-1))!==byName(item.focus)||(sceneIndex>0&&byName(item.journey[0])!==byName(scenes[sceneIndex-1].focus))))throw Error(`Scene ${item.id}: saved journey must connect the previous scene focus to this focus`);if(!views.has(item.view))throw Error(`Scene ${item.id}: native view ${item.view} does not resolve`);if(!byName(item.focus))throw Error(`Scene ${item.id}: focus ${item.focus} does not resolve`);for(let i=1;i<(item.journey??[]).length;i++){const from=byName(item.journey[i-1]),to=byName(item.journey[i]);if(!from||!to||!findEngineeringRoute(graph,{from,to,maxHops:1}).found&&!findHierarchyRoute(graph,{from,to,maxHops:1}).found)throw Error(`Scene ${item.id}: saved journey has a missing engineering connection`);}}
 const scoped=graph.elements.filter(e=>project.manifest.systemOfInterest.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id);
 for(let i=1;i<scenes.length;i++){const a=scenes[i-1],b=scenes[i],plan=planTransition({view:views.get(a.view),focus:byName(a.focus)},{view:views.get(b.view),focus:byName(b.focus)},{graph,scopeIds:scoped,journey:b.journey?.map(byName)});if(b.journey?.length&&!plan.route.found)throw Error(`Scene ${b.id}: saved journey no longer resolves within the presentation boundary`);if(plan.mode==='cross-kind'&&!plan.route.found)throw Error(`Scene ${b.id}: no engineering route from the previous scene within the presentation boundary`);}
 if(m.entryFocus&&!byName(m.entryFocus))throw Error('Starting element does not resolve: '+m.entryFocus);
 return {project,modelHash:parsed.modelHash,exported,graph,views,scenes,coverage,availableViews};
}
function busy(value){$('landing').setAttribute('aria-busy',String(value));for(const control of $('landing').querySelectorAll('button:not(#resume-model)'))control.disabled=value;$('loading').hidden=!value;for(const id of ['previous','next','scenes','standalone','return','fit','show-neighborhood','zoom-in','zoom-out','find-toggle','edit'])$(id).disabled=value;}
async function loadProject(project,{cacheHash=state.trustedCacheHash,loadToken}={}){
 const revision=loadToken??++state.loadRevision;if(revision!==state.loadRevision)return;++state.revision;$('landing-error').hidden=true;$('landing-error').textContent='';busy(true);status('Parsing project with OpenSysML WASM…');$('selection').hidden=true;
 let compiled;try{await ensureEngine();if(revision!==state.loadRevision)return;compiled=await compile(validateProject(project),{cacheHash,progress:text=>{if(revision===state.loadRevision)status(text);}});}catch(error){if(revision!==state.loadRevision)return;busy(false);$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;throw error;}if(revision!==state.loadRevision)return;
 Object.assign(state,compiled,{sceneIndex:0,selected:null,exploring:false,expanded:new Set(),collapsed:new Set(),rects:new Map(),view:null,displayed:null,history:[],future:[],traceRequest:null,traceInfo:null,presentation:{},extraViews:new Map(),neighborhoodBudget:null});
 state.trustedCacheHash=cacheHash??null;showLanding(document,false);document.title=project.manifest.title+' · Syspresent';$('resume-model').hidden=false;busy(false);updateLists();$('editor-error').textContent='';$('project-menu').open=false;
 if(state.scenes.length)await showScene(0,false);else {state.focus=resolve(project.manifest.entryFocus??project.manifest.systemOfInterest[0]);const entry=state.views.get(project.manifest.entryView);if(entry)await openExploration(entry,state.focus,{record:false});else await explore(state.focus);}
 status(`OpenSysML WASM · ${state.graph.elements.length} native elements · ${state.availableViews.length} views`);
 $('boundary').textContent=project.manifest.publication.scope==='scoped'?'Scoped publication · traversal stays within supplied model':'Complete project · standalone exploration available';
}
function updateLists(){
 $('scenes').replaceChildren();for(const [i,s]of state.scenes.entries()){const option=el('option',`${i+1}. ${s.title}`);option.value=i;$('scenes').append(option);}
 $('views').replaceChildren();for(const name of state.availableViews){const option=el('option',name);option.value=name;$('views').append(option);}
 $('view-file').replaceChildren();for(const name of state.project.manifest.viewSources){const option=el('option',name);option.value=name;$('view-file').append(option);}
}
function panelGeometry(view=state.view){
 const panel=$('narrative'),stage=$('stage');if(state.exploring||!scene()){panel.hidden=true;return [];}
 panel.hidden=false;panel.replaceChildren(el('div',`Scene ${state.sceneIndex+1} of ${state.scenes.length}`,'scene-count'),el('h2',scene().title),markdown(scene().markdown));
 const width=stage.clientWidth,height=stage.clientHeight,narrow=width<700,placement=narrow?'bottom':scene().panel?.placement??'right';
 panel.style.cssText='';panel.style.width=(narrow?width-24:Math.min(390,Math.max(280,width*.3)))+'px';
 if(placement==='bottom'){panel.style.width=width-24+'px';panel.style.left='12px';panel.style.bottom='58px';panel.style.maxHeight=(narrow?Math.max(140,Math.min(height*(height<560&&(view?.nodes.length??0)>3 ? .30 : .42),height-260)):Math.max(140,height*.25))+'px';}
 else {panel.style.top='16px';panel.style[placement==='left'?'left':'right']='16px';panel.style.maxHeight=Math.max(140,height-90)+'px';}
 const a=panel.getBoundingClientRect(),b=stage.getBoundingClientRect();return [{id:'narrative',x:a.x-b.x,y:a.y-b.y,width:a.width,height:a.height}];
}
function sizeView(view,focus,{compact=false}={}){return {...view,nodes:view.nodes.map(n=>{
 const preferences=displayPreferences(),expanded=!state.collapsed.has(n.semanticId)&&(state.expanded.has(n.semanticId)||preferences.compartments==='expanded'),requirement=preferences.compartments!=='compact'&&!compact&&n.kind==='requirement'&&n.semanticId===focus&&!state.collapsed.has(n.semanticId),documentation=documentationFor(state.graph,n.semanticId);
 const detail=(expanded||requirement)?documentation.text||n.detail||(expanded?'No statement or documentation recorded.':''):'';
 const attribution=detail&&documentation.text&&documentation.source?.id!==n.semanticId?`Statement from ${documentation.source.qualifiedName||documentation.source.name}\n`:'';
 const displayDetail=attribution+detail;
 const displayID=element(n.semanticId)?.native?.declaredShortName||documentation.source?.native?.declaredShortName||'';
 const measured=['initial','final','fork','join','decision','merge','port'].includes(n.kind)?{}:measureCard(document,{...n,displayID},displayDetail);
 return {...n,...measured,layoutGroup:preferences.grouping==='owner'?(element(n.semanticId)?.native?.owner?.['@id']??''):'',displayDetail,displayID:element(n.semanticId)?.native?.declaredShortName||documentation.source?.native?.declaredShortName||''};
 })};}
function cancelAnimations(){state.motion?.cancel();state.motion=null;for(const a of state.animations)a.cancel();state.animations=[];}
function svgel(name,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
const nodeKey=(node,counts,view)=>{const base=node.kind==='context-boundary'?'boundary:'+node.id:node.semanticId?'semantic:'+node.semanticId:'notation:'+view.id+':'+node.id;const count=counts.get(base)??0;counts.set(base,count+1);return base+':'+count;};
function labelSize(text){const span=el('span',text);span.style.cssText='position:fixed;visibility:hidden;left:-10000px;white-space:pre;font:12px system-ui,sans-serif';document.body.append(span);const rect=span.getBoundingClientRect();span.remove();return {width:Math.ceil(rect.width)+4,height:16};}
async function prepareFrame(view,focus,panels,{journey=false}={}){
 const stage=$('stage'),area=graphArea(stage.clientWidth,stage.clientHeight,panels);
 const layoutFor=compact=>layoutDiagram(sizeView(view,focus,{compact}),{width:area.width,height:area.height,elk:state.layoutEngine,measureLabel:labelSize,grouping:displayPreferences().grouping});
 let layout=await layoutFor(false),fitted=fitDiagram(layout,area);
 // Prefer readable names over shrinking an automatically expanded statement.
 if(fitted.scale<.9&&view.nodes.length>3&&!state.expanded.has(focus)&&displayPreferences().compartments!=='expanded'){layout=await layoutFor(true);fitted=fitDiagram(layout,area);}
 const active=fitted.nodes.map(n=>({...n,scale:fitted.scale,opacity:1,context:false}));
 const routed=fitted.edges;
 const labelObstacles=[...routed.filter(e=>e.labelBox).map((e,i)=>({...e.labelBox,id:'label-obstacle:'+i})),...active.flatMap(n=>n.portLabelBox?[{...n.portLabelBox,id:'port-label:'+n.id}]:[])];
 const routeObstacles=routed.flatMap(e=>e.points.slice(1).map((p,i)=>({id:'route:'+e.id+':'+i,x:Math.min(p.x,e.points[i].x)-3,y:Math.min(p.y,e.points[i].y)-3,width:Math.max(6,Math.abs(p.x-e.points[i].x)+6),height:Math.max(6,Math.abs(p.y-e.points[i].y)+6)})));
 const budget=state.neighborhoodBudget??displayPreferences().contextBudget,context=surroundingContext(state.graph,layout,{budget:journey?Math.min(8,budget):budget,focus});
 context.view.nodes=context.view.nodes.map(node=>({...node,...measureCard(document,node,'')}));
 const fringe=prepareNeighborhood(context,active,area,{width:160,height:80,gap:72,activeEdges:routed,labelObstacles,obstacles:[...labelObstacles,...routeObstacles],measureLabel:labelSize});
 const ghosts=fringe.nodes.map(n=>({...n,scale:1,opacity:.3,context:true,displayDetail:'',displayID:''}));
 const markers=fringe.boundaryMarkers.map(n=>({...n,scale:1,opacity:.22,context:true,interactive:false}));
 const nodes=[...active,...ghosts,...markers],counts=new Map(),byID=new Map();
 for(const n of nodes){n.key=nodeKey(n,counts,view);n.container=active.some(c=>c.parentId===n.id);byID.set(n.id,n);}
 const peripheral=fringe.routedEdges;
 const edgeCounts=new Map(),edges=[...routed,...peripheral].map(e=>{
  const a=byID.get(e.sourceAttachment??e.source),b=byID.get(e.targetAttachment??e.target),ownerA=byID.get(e.source),ownerB=byID.get(e.target),base=[a?.semanticId||a?.key,b?.semanticId||b?.key,e.kind,e.label||''].join('|'),ordinal=edgeCounts.get(base)??0;edgeCounts.set(base,ordinal+1);
  return {...e,journey:journey&&!e.context,sourceClipped:a?.kind==='context-boundary',targetClipped:b?.kind==='context-boundary',key:base+':'+ordinal,sourceKey:a?.key,targetKey:b?.key,sourceSemantic:a?.semanticId||ownerA?.semanticId,targetSemantic:b?.semanticId||ownerB?.semanticId,opacity:e.context?.18:!journey&&displayPreferences().emphasis.length&&!displayPreferences().emphasis.includes(e.kind)?.28:1,routePoints:e.points,points:samplePolyline(e.points.length?e.points:[{x:0,y:0},{x:0,y:0}])};
 });
 const notationNotices=layout.edges.map(e=>({e,appearance:edgeAppearance(e,{viewKind:view.kind})})).filter(p=>!p.appearance.supported).map(p=>({reason:'unsupported-notation',target:p.e.target,relationshipId:p.e.id,message:p.appearance.notice}));
 const omissions=[...(layout.omissions??view.omissions??[]),...notationNotices,...fringe.omissions,...fringe.notices,...routed.filter(e=>e.labelOmitted||e.routingBlocked).map(e=>({reason:e.labelOmitted?'label-space':'route-space',target:e.semanticTarget||e.target,relationshipId:e.semanticId||e.id}))];
 return {view,focus,journey,nodes,edges,area,width:stage.clientWidth,height:stage.clientHeight,panels,scale:fitted.scale,layout,omissions,routingMetrics:fringe.routingMetrics,worldBounds:fringe.worldBounds,neighborhood:{shown:context.elements.length,total:context.elements.length+new Set(context.omissions.filter(o=>o.reason==='budget').map(o=>o.target)).size,budget}};
}
function face(n){const host=el('span',undefined,'node-face');if(n.kind==='port'){const text=n.label??n.name??'';if(text)host.append(el('span',text,'port-name'));return host;}const short=(n.name?.split('::').at(-1)||n.kind).replace(/([a-z0-9])([A-Z])/g,'$1\u200b$2');host.append(el('span',`«${n.kind}»${n.displayID?' '+n.displayID:''}${n.type?' : '+n.type:''}`,'kind'),el('span',short,'name'));if(n.displayDetail&&!n.container)host.append(el('span',n.displayDetail,'detail'));return host;}
function visualNode(n){if(n.kind==='context-boundary'){const marker=el('span',undefined,'node context-boundary');marker.title='Additional model context: '+(n.name||n.semanticId);marker.setAttribute('role','img');marker.setAttribute('aria-label',marker.title);marker.dataset.context='true';const glyph=el('span','›','continuation-glyph');glyph.style.transform=`rotate(${({EAST:0,SOUTH:90,WEST:180,NORTH:270})[n.continuationDirection]??0}deg)`;marker.append(glyph);return marker;}const node=el('button',undefined,`node ${n.kind}${n.container?' container':''}${n.context?' peripheral':''}${n.semanticId&&n.semanticId===state.selected?' selected':''}`);node.type='button';node.dataset.representation=n.id;if(n.semanticId)node.dataset.semanticId=n.semanticId;node.dataset.context=String(!!n.context);node.setAttribute('aria-label',`${n.name||n.kind}: select ${n.kind}${n.context?' (surrounding context)':''}`);node.style.zIndex=String(n.context?0:n.container?1:3);node.append(face(n));node.onclick=event=>{event.stopPropagation();select(n.semanticId,n);};node.oncontextmenu=event=>{event.preventDefault();select(n.semanticId,n);};return node;}
const rectValues=n=>({x:n.x,y:n.y,width:n.width,height:n.height,scale:n.scale??1,opacity:n.opacity??1,context:n.context?1:0});
function presenceTrack(frames,key,collection){return frames.map((f,index)=>{const item=f[collection].find(n=>n.key===key);if(item)return item;let nearest;for(let distance=1;distance<frames.length&&!nearest;distance++)nearest=frames[index-distance]?.[collection].find(n=>n.key===key)??frames[index+distance]?.[collection].find(n=>n.key===key);return {...nearest,opacity:0};});}
function applyCamera(value){state.camera=createCamera(value);const c=state.camera;$('graph-world').style.transform=`translate(${c.x}px,${c.y}px) scale(${c.scale})`;}
function cameraCenter(){const a=state.visualSnapshot?.area??graphArea($('stage').clientWidth,$('stage').clientHeight);return {x:a.x+a.width/2,y:a.y+a.height/2};}
function takeCameraControl(){++state.cameraRevision;state.motion?.finish();}
function zoomBy(factor){takeCameraControl();applyCamera(zoomCameraAt(state.camera,cameraCenter(),factor));}
function fitNeighborhood(){takeCameraControl();const f=state.visualSnapshot;if(f?.worldBounds)applyCamera(fitCameraToBounds(f.worldBounds,f.area,20));$('camera-menu').open=false;}
async function resetCamera(){++state.cameraRevision;if(state.transitioning&&state.pendingDestination)await frame(state.view);else state.motion?.finish();applyCamera(createCamera());$('camera-menu').open=false;}
async function moreNeighbors(){if(!state.view)return;remember();state.neighborhoodBudget=Math.min(256,(state.neighborhoodBudget??displayPreferences().contextBudget)+48);await frame(state.view);$('camera-menu').open=false;}
async function paintFrames(frames,{duration=0,caption='',outgoingPanel,cameraTarget=state.camera}={}){
 const cameraFrom={...state.camera},cameraTo=createCamera(cameraTarget);
 clearTrace();cancelAnimations();const destination=frames.at(-1),svg=$('connections'),host=$('nodes'),stage=$('stage');svg.replaceChildren();host.replaceChildren();svg.setAttribute('viewBox',`0 0 ${stage.clientWidth} ${stage.clientHeight}`);
 const defs=svgel('defs');for(const name of ['open-arrow','filled-arrow','hollow-triangle','diamond','hollow-diamond','containment']){const {path,fill,...attrs}=markerDefinition(name),marker=svgel('marker',{id:'edge-'+name,...attrs,markerUnits:'userSpaceOnUse'});marker.append(svgel('path',{d:path,fill:fill==='line'?'#426869':fill==='background'?'#f5f7f7':'none',stroke:'#426869','stroke-width':1.2}));defs.append(marker);}svg.append(defs);
 const offsets=frames.length===5?[0,.18,.5,.74,1]:frames.map((_,i)=>i/(frames.length-1||1));
 const cameraTrack=journeyCameraTrack(frames,{initialCamera:cameraFrom,finalCamera:cameraTo,offsets});
 const departurePlan=planDepartures(frames,{width:stage.clientWidth,height:stage.clientHeight,panels:destination.panels??[],offsets});stage.dataset.departureCount=String(departurePlan.departures.length);
 const nodeKeys=visibleTrackKeys(frames,'nodes'),edgeKeys=visibleTrackKeys(frames,'edges').sort((a,b)=>{const edge=key=>destination.edges.find(e=>e.key===key)??frames.flatMap(f=>f.edges).find(e=>e.key===key);return Number(!!edge(b)?.context)-Number(!!edge(a)?.context);});
 const nodeTracks=nodeKeys.map(key=>{const track=presenceTrack(frames,key,'nodes'),latest=destination.nodes.find(n=>n.key===key)??track.filter(n=>n.opacity>0).at(-1),node=visualNode(latest);host.append(node);
  const first=track.find(n=>n.opacity>0),oldFace=latest.kind!=='context-boundary'&&first&&JSON.stringify([first.kind,first.displayDetail,first.type,first.container])!==JSON.stringify([latest.kind,latest.displayDetail,latest.type,latest.container])?face(first):null;
  if(oldFace){oldFace.classList.add('old-face');oldFace.setAttribute('aria-hidden','true');node.append(oldFace);}
  return {key,node,latest,oldFace,newFace:node.firstChild,track:track.map(rectValues)};
 });
 const edgeTracks=edgeKeys.map(key=>{
  const track=presenceTrack(frames,key,'edges'),latest=destination.edges.find(e=>e.key===key)??track.filter(e=>e.opacity>0).at(-1),appearance=edgeAppearance(latest,{viewKind:destination.view.kind});
  const group=svgel('g',{'data-relationship':latest.semanticId||latest.id,'data-context':String(!!latest.context),'data-source':latest.sourceSemantic||'','data-target':latest.targetSemantic||'',role:'button',tabindex:0,'aria-label':`${latest.label||latest.kind}: ${label(latest.sourceSemantic)} to ${label(latest.targetSemantic)}`,'data-kind':latest.kind});
  const line=svgel('path',{class:'edge-line',fill:'none',stroke:'#426869','stroke-width':latest.context?1.1:1.5});
  for(const [side,marker]of [['start',appearance.sourceMarker],['end',appearance.targetMarker]])if(marker!=='none'&&!(side==='start'?latest.sourceClipped:latest.targetClipped))line.setAttribute('marker-'+side,'url(#edge-'+marker+')');
  if(appearance.line==='dashed')line.setAttribute('stroke-dasharray','5 3');
  const oldLine=line.cloneNode();oldLine.classList.add('edge-outgoing');oldLine.style.opacity=0;const hit=svgel('path',{class:'edge-hit',fill:'none',stroke:'transparent','stroke-width':latest.context?8:18,'pointer-events':'stroke'});group.append(hit,oldLine,line);
  const title=svgel('title');title.textContent=latest.label||latest.kind;group.append(title);
  let text;if(latest.label&&!latest.labelOmitted){text=svgel('text',{'font-size':12*(latest.labelScale??1),'font-family':'system-ui, sans-serif',fill:'#355e60','paint-order':'stroke',stroke:'#f5f7f7','stroke-width':4,'text-anchor':'start'});text.textContent=latest.label;group.append(text);}
  group.onclick=event=>{event.stopPropagation();traceEdge(latest,key);};group.onkeydown=event=>{if(['Enter',' '].includes(event.key)){event.preventDefault();traceEdge(latest,key);}};
  svg.append(group);
  const numeric=track.map(e=>{const r={opacity:e.opacity??1,x:e.x??0,y:e.y??0,labelOpacity:e.label&&!e.labelOmitted?1:0,journey:e.journey?1:0,context:e.context?1:0};for(const [i,p]of e.points.entries()){r['x'+i]=p.x;r['y'+i]=p.y;}return r;});
  return {key,group,line,oldLine,hit,text,latest,track:numeric};
 });
 const draw=(progress,clock)=>{const contextFade=duration?Math.max(0,1-clock/.16,(clock-.84)/.16):1;applyCamera(cameraTrack.sample(progress));const nodes=[],edges=[];for(const item of nodeTracks){const r=departurePlan.sampleNode(item.key,progress,p=>sampleTrack(item.track,offsets,p)),n=item.node;if(r.context>.5)r.opacity*=contextFade;n.classList.toggle('peripheral',r.context>.5);n.dataset.context=String(r.context>.5);n.style.width=(r.width/(r.scale||1))+'px';n.style.height=(r.height/(r.scale||1))+'px';n.style.transform=`translate(${r.x}px,${r.y}px) scale(${r.scale})`;n.style.opacity=r.opacity;n.style.pointerEvents=item.latest.interactive!==false&&r.opacity>.12?'auto':'none';n.setAttribute('aria-hidden',String(r.opacity<.05));if(item.latest.portLabelBox){const label=n.querySelector('.port-name'),box=item.latest.portLabelBox;if(label){label.style.left=(box.x-item.latest.x)/(item.latest.scale||1)+'px';label.style.top=(box.y-item.latest.y)/(item.latest.scale||1)+'px';label.style.width=box.width/(item.latest.scale||1)+'px';label.style.height=box.height/(item.latest.scale||1)+'px';}}if(item.oldFace){const fade=Math.max(0,Math.min(1,(progress-.25)/.5));item.oldFace.style.opacity=1-fade;item.newFace.style.opacity=fade;}nodes.push({...item.latest,...r,context:r.context>.5});}
  const currentNodes=nodes.map(n=>({...n,id:n.key,parentId:n.parentId?nodes.find(p=>p.id===n.parentId)?.key:undefined}));
  const sampledEdges=edgeTracks.map(item=>({item,r:sampleTrack(item.track,offsets,progress)})),journeySizes=new Map();
  const liveEdges=sampledEdges.filter(({r})=>clock!==1&&r.journey>.5&&r.opacity>.01).map(({item})=>{
   const text=item.latest.label??'',box=item.latest.labelBox??{width:Math.max(16,text.length*7),height:16},old=journeySizes.get(text);journeySizes.set(text,{width:Math.max(old?.width??0,box.width),height:Math.max(old?.height??0,box.height)});
   return {...item.latest,id:item.key,source:item.latest.sourceKey,target:item.latest.targetKey,label:text};
  });
  const liveRoutes=new Map(routeEdges(liveEdges,currentNodes,{area:destination.area,measureLabel:text=>journeySizes.get(text)}).map(route=>[route.id,route]));
  const shapeFor=({item,r})=>{
   if(r.context>.5&&r.journey<.5&&contextFade<.01)return {points:[],edge:{...item.latest,id:item.key,source:item.latest.sourceKey,target:item.latest.targetKey},journeyEdge:false};
   const interpolated=Array.from({length:20},(_,i)=>({x:r['x'+i],y:r['y'+i]}));
   // Never morph a line through a moving tile. During travel use a clear
   // rectilinear route and lower its emphasis; the final route is joint ELK geometry.
   const edge={...item.latest,id:item.key,source:item.latest.sourceKey,target:item.latest.targetKey,context:r.context>.5&&r.journey<.5};
   let points=clock===1?(item.latest.routePoints??[]):interpolated,liveLabel;
   const journeyEdge=clock!==1&&r.journey>.5;
   if(journeyEdge){const live=liveRoutes.get(item.key);points=live?.points??[];if(live?.labelBox&&!live.labelLeader&&![...liveRoutes.values()].some(other=>other.points.length>1&&!routeIsClear(other.points,other,currentNodes.concat([{...live.labelBox,id:'journey-label:'+item.key}]),{orthogonalOnly:true})))liveLabel=live;}
   if(!journeyEdge&&clock!==1&&(!routeIsClear(points,edge,currentNodes,{orthogonalOnly:true})||!routeConnectsEndpoints(points,edge,currentNodes))){points=routeEdges([{...edge,label:''}],currentNodes)[0]?.points??[];}
   if(!routeIsClear(points,edge,currentNodes)||!routeConnectsEndpoints(points,edge,currentNodes))points=[];
   return {points,edge,journeyEdge,liveLabel};
  };
  const shapes=new Map(sampledEdges.map(sample=>[sample.item.key,shapeFor(sample)]));
  const visibleNodes=currentNodes.filter(n=>(n.opacity??1)>.08),visibleIDs=new Set(visibleNodes.map(n=>n.id));
  const currentActive=sampledEdges.filter(({item,r})=>(r.context<.5||r.journey>.5)&&r.opacity>.01).map(({item,r})=>{
   const shape=shapes.get(item.key),box=shape.liveLabel?.labelBox??item.latest.labelBox;
   const labelBox=shape.liveLabel?.labelBox??(box&&(clock===1||clock>.85)?{...box,x:r.x,y:r.y-box.height*.78}:undefined);
   return {...shape.edge,points:shape.points,...(labelBox?{labelBox}:{} )};
  }).filter(edge=>edge.points.length>1&&visibleIDs.has(edge.source)&&visibleIDs.has(edge.target));
  if(clock>0&&clock<1&&contextFade>.01){
   const contextSizes=new Map(),movingContext=sampledEdges.filter(({item,r})=>r.context>.5&&r.journey<.5&&r.opacity>.01).map(({item})=>{
    const shape=shapes.get(item.key),text=item.latest.label??'',box=item.latest.labelBox??{width:Math.max(16,text.length*7),height:16},old=contextSizes.get(text);contextSizes.set(text,{width:Math.max(old?.width??0,box.width),height:Math.max(old?.height??0,box.height)});
    return {...shape.edge,points:shape.points};
   }).filter(edge=>visibleIDs.has(edge.source)&&visibleIDs.has(edge.target));
   const before=peripheralRoutingMetrics(movingContext,currentActive);
   if(before.crossings||before.overlapLength||before.blocked){
    const optimized=routePeripheralEdges(movingContext,visibleNodes,destination.area,{activeEdges:currentActive,measureLabel:text=>contextSizes.get(text),candidateBudget:4,reverse:false,visibilitySearches:0});
    if(peripheralRouteScore(optimized.metrics)<peripheralRouteScore(before))for(const route of optimized.edges){const shape=shapes.get(route.id);shape.points=route.points;shape.liveLabel=route.labelBox?route:undefined;}
   }
  }
  const currentContext=sampledEdges.filter(({item,r})=>r.context>.5&&r.journey<.5&&r.opacity>.01).map(({item})=>{const shape=shapes.get(item.key);return {...shape.edge,points:shape.points};});
  const visibleLabels=[...currentActive.flatMap(edge=>edge.labelBox?[edge.labelBox]:[]),...sampledEdges.filter(({item,r})=>r.context>.5&&r.journey<.5&&clock>.85&&r.labelOpacity>.05).flatMap(({item,r})=>{const box=shapes.get(item.key).liveLabel?.labelBox??item.latest.labelBox;return box?[{...box,x:shapes.get(item.key).liveLabel?.x??r.x,y:(shapes.get(item.key).liveLabel?.y??r.y)-box.height*.78,id:'live-label:'+item.key}]:[];})];
  for(const {item,r} of sampledEdges){
   const {points,edge,journeyEdge,liveLabel}=shapes.get(item.key);
   const pathOf=path=>path.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '),signature=points.slice(1).map((p,i)=>Math.abs(p.x-points[i].x)<.01?'V':'H').filter((v,i,a)=>!i||v!==a[i-1]).join('');
   if(clock!==1&&item.signature&&signature!==item.signature){item.outgoingPoints=item.drawnPoints;item.routeChangedAt=clock;}
   const routeFade=clock===1?1:Math.min(1,Math.max(0,(clock-(item.routeChangedAt??-1))*duration/140));
   let outgoing=item.outgoingPoints?.map(p=>({...p}));
   if(outgoing?.length>1&&points.length>1){const first=outgoing[0],second=outgoing[1],last=outgoing.at(-1),penultimate=outgoing.at(-2),horizontalFirst=Math.abs(first.y-second.y)<.01,horizontalLast=Math.abs(last.y-penultimate.y)<.01;outgoing[0]={...points[0]};outgoing[outgoing.length-1]={...points.at(-1)};if(horizontalFirst)second.y=points[0].y;else second.x=points[0].x;if(horizontalLast)penultimate.y=points.at(-1).y;else penultimate.x=points.at(-1).x;}
   const protectedPaths=[...currentActive,...currentContext.filter(other=>other.id!==edge.id)];
   const oldClear=outgoing&&routeIsClear(outgoing,edge,currentNodes.concat(visibleLabels),{orthogonalOnly:true})&&routeConnectsEndpoints(outgoing,edge,currentNodes)&&(!edge.context||peripheralRouteScore(peripheralRoutingMetrics([{...edge,points:outgoing}],protectedPaths))<=peripheralRouteScore(peripheralRoutingMetrics([{...edge,points}],protectedPaths)));item.oldLine.setAttribute('d',oldClear?pathOf(outgoing):'');item.oldLine.style.opacity=oldClear?1-routeFade:0;
   const path=pathOf(points);item.line.setAttribute('d',path);item.line.style.opacity=routeFade;item.hit.setAttribute('d',path);item.signature=signature;item.drawnPoints=points;
   const traveling=duration&&clock>0&&clock<1,emphasis=traveling&&!journeyEdge?.2+.8*Math.abs(Math.cos(Math.PI*clock)):1;
   const endpoints=[currentNodes.find(n=>n.id===edge.source),currentNodes.find(n=>n.id===edge.target)],presence=Math.min(1,...endpoints.map(n=>n?(n.opacity??1)/(n.context?.3:1):0));const effectiveOpacity=points.length?r.opacity*emphasis*presence*(edge.context?contextFade:1):0;item.group.style.opacity=effectiveOpacity;item.group.style.pointerEvents=effectiveOpacity>.1?'auto':'none';item.group.setAttribute('aria-hidden',String(effectiveOpacity<.05));item.group.setAttribute('tabindex',effectiveOpacity>.1?'0':'-1');
   if(item.text){item.text.setAttribute('x',liveLabel?.x??r.x);item.text.setAttribute('y',liveLabel?.y??r.y);item.text.style.opacity=journeyEdge?(liveLabel?r.labelOpacity*routeFade:0):traveling?Math.max(0,(clock-.85)/.15):r.labelOpacity;}
   edges.push({...item.latest,points,opacity:effectiveOpacity,x:r.x,y:r.y});
  }
  if(outgoingPanel)outgoingPanel.style.opacity=Math.max(0,1-clock*3);$('narrative').style.opacity=duration?Math.min(1,clock*2):1;stage.dataset.motionProgress=String(clock);state.visualSnapshot={...destination,nodes,edges};
 };
 const a=destination.area;$('graph-viewport').style.clipPath=`inset(${a.y}px ${Math.max(0,stage.clientWidth-a.x-a.width)}px ${Math.max(0,stage.clientHeight-a.y-a.height)}px ${a.x}px)`;
 const neighborhood=destination.neighborhood;$('more-neighbors').hidden=!neighborhood||neighborhood.shown>=neighborhood.total;$('more-neighbors').disabled=(neighborhood?.budget??0)>=256;$('more-neighbors').textContent=neighborhood?`More neighbors (${neighborhood.shown} of ${neighborhood.total})`:'More neighbors';
 const omissions=destination.omissions;$('transition').dataset.notice=String(!!caption);$('context-details').hidden=!omissions.length&&!neighborhood?.shown;$('context-details').textContent=neighborhood?.shown?`Neighbors (${neighborhood.shown})`:'Context limits';$('transition').textContent=caption||`${destination.view.kind} · ${destination.view.nodes.length} active elements`;
 const motion=startTimeline({duration:state.reduce?0:duration,update:draw});state.motion=motion;const result=await motion.finished;
 if(!result.cancelled){state.visualSnapshot=destination;for(const item of nodeTracks){if(!destination.nodes.some(n=>n.key===item.key))item.node.remove();else{item.oldFace?.remove();if(item.newFace?.style)item.newFace.style.opacity=1;}}for(const item of edgeTracks)if(!destination.edges.some(e=>e.key===item.key))item.group.remove();state.layout={...destination.layout,displayNodes:destination.nodes.filter(n=>!n.context),scale:destination.scale,area:destination.area};state.displayed=destination.view;state.displayOmissions=omissions;delete stage.dataset.motionProgress;}
 outgoingPanel?.remove();if(state.motion===motion)state.motion=null;return result;
}
async function frame(view,caption='',duration=0,focus=state.focus){if(state.transitioning&&state.pendingDestination){const pending=state.pendingDestination;return transitionTo(pending.view,pending.focus,{animate:false,allowDisconnected:true,journey:pending.journey,camera:pending.cameraRevision===state.cameraRevision?pending.camera:state.camera});}const revision=++state.revision,panels=panelGeometry(view),destination=await prepareFrame(view,focus,panels),previous=state.visualSnapshot;if(revision!==state.revision)return;return paintFrames(duration&&previous?[previous,destination]:[destination],{duration,caption});}

function gather(ids,relationships){const set=new Set(ids),elements=state.graph.elements.filter(e=>set.has(e.id));return graphView(state.graph,{elements,relationships:(relationships??state.graph.relationships).filter(e=>set.has(e.source)&&set.has(e.target))},'General View journey');}
async function transitionTo(view,focus,{animate=true,journey,allowDisconnected=false,camera=createCamera()}={}){
 const revision=++state.revision,previous=state.view,cameraRevision=state.cameraRevision;
 // Validate the route before committing focus or starting an animation.
 const savedJourney=journey?.length>1&&resolve(journey[0])===state.previousFocus&&resolve(journey.at(-1))===focus?journey.map(resolve):undefined;
 const plan=previous?planTransition({view:previous,focus:state.previousFocus},{view,focus},{graph:state.graph,scopeIds:state.exploring?undefined:scopeIds(),reducedMotion:state.reduce,journey:savedJourney}):null;
 if(savedJourney&&!plan?.route?.found)throw Error('Saved journey no longer resolves within the presentation boundary');
 const disconnected=plan?.journeyRequired&&plan.route?.found===false;
 if(disconnected&&!state.exploring&&!allowDisconnected)throw Error('No engineering route connects these viewpoints within the presentation system. Explore the model to open a disconnected viewpoint explicitly.');
 cancelAnimations();for(const p of $('stage').querySelectorAll('.narrative-outgoing'))p.remove();$('selection').hidden=true;state.transitioning=true;state.pendingDestination={view,focus,journey,camera,cameraRevision};state.lastTransition=plan;
 let oldPanel;try{
 oldPanel=!$('narrative').hidden?$('narrative').cloneNode(true):null;if(oldPanel){oldPanel.removeAttribute('id');oldPanel.classList.add('narrative-outgoing');oldPanel.setAttribute('aria-hidden','true');$('stage').append(oldPanel);}
 const panels=panelGeometry(view),target=await prepareFrame(view,focus,panels),frames=[];if(revision!==state.revision){oldPanel?.remove();return;}
 if(state.visualSnapshot&&animate&&!state.reduce&&cameraRevision===state.cameraRevision){frames.push(state.visualSnapshot);if(plan?.journeyRequired&&!disconnected){for(const step of plan.stages.filter(step=>step.viewKind==='gv')){frames.push(await prepareFrame(gather(step.semanticIds,step.route),step.focusId??focus,panels,{journey:true}));if(revision!==state.revision){oldPanel?.remove();return;}}}frames.push(target);}else frames.push(target);
 if(revision!==state.revision){oldPanel?.remove();return;}
 if(cameraRevision!==state.cameraRevision)frames.splice(0,frames.length,target);
 const result=await paintFrames(frames,{duration:frames.length>2?Math.max(1700,(frames.length-1)*420):frames.length>1?780:0,caption:disconnected?'No engineering route · explicit view jump':plan?.route?.strategy==='ownership-ancestor'?'Model ownership route · location, not derivation':'',outgoingPanel:oldPanel,cameraTarget:cameraRevision===state.cameraRevision?camera:state.camera});
 if(result.cancelled||revision!==state.revision)return;state.view=view;state.focus=focus;state.previousFocus=focus;
 if(!state.exploring)status(`OpenSysML WASM · ${state.graph.elements.length} native elements · ${state.availableViews.length} views`);else status(state.traceInfo?.summary.message??'Explore this native view · select an element for contextual actions');
 $('boundary').textContent=!scopeIds().includes(focus)?'Outside presentation boundary · loaded model context':state.project.manifest.publication.scope==='scoped'?'Scoped publication · supplied model context only':'Complete project · standalone exploration available';
 }finally{oldPanel?.remove();if(revision===state.revision){state.transitioning=false;state.pendingDestination=null;}}
}
async function showScene(index,animate=true,{record=false}={}){
 if(index<0||index>=state.scenes.length)return;
 const saved=snapshot(),savedHistory=[...state.history],savedFuture=[...state.future];
 if(record)remember();state.sceneIndex=index;state.exploring=false;state.neighborhoodBudget=null;state.selected=null;state.traceRequest=null;state.traceInfo=null;state.presentation=structuredClone(state.scenes[index].presentation??{});state.expanded=new Set(displayPreferences().expandedIds);state.collapsed=new Set();updateExplorationControls();const s=scene();const focus=resolve(s.focus),view=state.views.get(s.view);
 let navigationRevision;try{if(!focus||!view)throw Error('Scene focus or native view is unavailable');const pending=transitionTo(view,focus,{animate,journey:s.journey,allowDisconnected:true});navigationRevision=state.revision;await pending;}
 catch(error){if(navigationRevision!==undefined&&navigationRevision!==state.revision)return;state.history=savedHistory;state.future=savedFuture;restoreValues(saved);if(saved.view)await transitionTo(saved.view,saved.focus,{animate:false,allowDisconnected:true,camera:saved.camera});throw error;}
 finally{updateExplorationControls();$('scenes').value=state.sceneIndex;$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;$('return').hidden=!state.exploring||!state.scenes.length;$('standalone').hidden=state.exploring;}
}
function displayPreferences(){return resolvePresentation(state.presentation,{width:$('stage').clientWidth,resolve});}
function snapshot(){return {view:state.pendingDestination?.view??state.view,focus:state.pendingDestination?.focus??state.focus,sceneIndex:state.sceneIndex,exploring:state.exploring,selected:state.selected,expanded:[...state.expanded],collapsed:[...state.collapsed],presentation:structuredClone(state.presentation),traceRequest:structuredClone(state.traceRequest),traceInfo:structuredClone(state.traceInfo??null),camera:{...state.camera},neighborhoodBudget:state.neighborhoodBudget};}
function restoreValues(target){Object.assign(state,{sceneIndex:target.sceneIndex,exploring:target.exploring,selected:target.selected,expanded:new Set(target.expanded),collapsed:new Set(target.collapsed),presentation:structuredClone(target.presentation),traceRequest:structuredClone(target.traceRequest),neighborhoodBudget:target.neighborhoodBudget??null});state.traceInfo=structuredClone(target.traceInfo??null);}
function remember(){if(!state.view)return;state.history.push(snapshot());if(state.history.length>40)state.history.shift();state.future=[];updateExplorationControls();}
function updateExplorationControls(){
 const exploring=state.exploring;document.querySelector('header nav').hidden=exploring;$('exploration-controls').hidden=!exploring&&!state.history.length&&!state.future.length;$('explore-back').disabled=!state.history.length;$('explore-forward').disabled=!state.future.length;
 $('return').hidden=!exploring||!state.scenes.length;$('standalone').hidden=exploring;
 const request=state.traceRequest,info=state.traceInfo;$('exploration-label').textContent=exploring?(request&&info?`${info.mode==='context'?'Context':({origins:'Origins',derived:'Derived requirements',impact:'Design impact',verification:'Verification',contents:'Parts / contents',container:'Containing element'})[info.mode]} · ${label(request.focus)} · ${info.shown} of ${info.total}`:label(state.focus)):'Guided scene';$('exploration-label').title=$('exploration-label').textContent;
 $('trace-previous').hidden=!request||!info||info.pages<2;$('trace-next').hidden=!request||!info||info.pages<2;$('trace-previous').disabled=!info||info.page===0;$('trace-next').disabled=!info||info.page>=info.pages-1;
 if(info?.pages>1)$('trace-next').textContent=`More (${info.page+1}/${info.pages})`;
}
async function restoreHistory(direction){
 const from=direction==='back'?state.history:state.future,to=direction==='back'?state.future:state.history;if(!from.length)return;
 const target=from.pop(),current=snapshot();to.push(current);restoreValues(target);updateExplorationControls();const revision=state.revision+1;
 try{await transitionTo(target.view,target.focus,{allowDisconnected:true,camera:target.camera});if(revision!==state.revision)return;$('scenes').value=state.sceneIndex;updateExplorationControls();if(state.traceInfo)status(state.traceInfo.summary.message);}catch(error){if(revision!==state.revision)return;to.pop();from.push(target);restoreValues(current);updateExplorationControls();await transitionTo(current.view,current.focus,{animate:false,allowDisconnected:true,camera:current.camera});throw error;}
}
async function openExploration(view,id,{request=null,info=null,record=true}={}){
 const previous=snapshot(),history=[...state.history],future=[...state.future];if(record)remember();state.neighborhoodBudget=null;state.exploring=true;state.traceRequest=request;state.traceInfo=info;if(request)state.presentation={...state.presentation,emphasis:[]};state.selected=null;updateExplorationControls();const revision=state.revision+1;
 try{await transitionTo(view,id,{allowDisconnected:true});if(revision!==state.revision)return;updateExplorationControls();status(info?info.summary.message:'Explore this native view · select an element for contextual actions');}
 catch(error){if(revision!==state.revision)return;state.history=history;state.future=future;restoreValues(previous);updateExplorationControls();if(previous.view)await transitionTo(previous.view,previous.focus,{animate:false,allowDisconnected:true,camera:previous.camera});throw error;}
}
async function explore(id,kind){
 if(!id||!element(id))throw Error('Model target unavailable');const revision=++state.revision,modelHash=state.modelHash;
 if(kind){const q=qname(id);if(!q)throw Error('Native view requires a qualified model identity');const raw=await state.engine.call('RenderView',{modelHash,view:`#${kind}:${q}`,includeSemanticIdentity:true});if(revision!==state.revision||modelHash!==state.modelHash)return;const view={...requireNativeIdentity(adaptNativeView(raw,`#${kind}:${q}`)),capture:{definition:kind==='action'?'ActionFlowView':'InterconnectionView',root:q}};state.extraViews??=new Map();state.extraViews.set(view.id,view);state.graph=modelGraph(state.exported.elements,[...state.views.values(),state.coverage,...state.extraViews.values()]);await openExploration(view,id);}
 else await followTrace(id,'context');
}
async function followTrace(id,mode,page=0){
 const request={focus:id,mode,budget:$('stage').clientWidth<700?5:7,page},context=traceContext(state.graph,request),view=graphView(state.graph,context,mode+' of '+label(id));view.traceRequest=request;
 await openExploration(view,id,{request,info:context});
}
function select(id,node){clearTrace();state.selected=id||null;for(const n of $('nodes').children)n.classList.toggle('selected',!!id&&n.dataset.semanticId===id);const menu=$('selection');menu.replaceChildren(el('strong',node?.name||label(id)));menu.hidden=false;
 if(!id){menu.append(el('p','This native notation element or embedded port has no independent model-element identity in this projection.'),button('Close',()=>{menu.hidden=true;}));return;}
 const documentation=documentationFor(state.graph,id);if(documentation.text)menu.append(button('Read full statement',()=>{$('information').classList.add('statement');$('information-title').textContent='Full statement';$('information-text').textContent=(documentation.source?.qualifiedName||label(id))+'\n\n'+documentation.text;$('information').showModal();}));
 menu.append(button('Focus',()=>explore(id)),button(state.expanded.has(id)||!!node?.displayDetail?'Collapse compartment':'Show statement / compartment',async()=>{if(state.expanded.has(id)||!!node?.displayDetail){state.expanded.delete(id);state.collapsed.add(id);}else{state.collapsed.delete(id);state.expanded.add(id);}await frame(state.view);select(id,node);}));
 const e=element(id);if(isStructuralElement(e)){const actions=el('div',undefined,'requirement-actions');for(const action of structuralActions(state.graph,id)){const control=button(`${action.label} (${action.count})`,()=>followTrace(id,action.mode));control.disabled=!action.enabled;control.title=action.summary.message;actions.append(control);}menu.append(actions);}
 if(['PartUsage','PartDefinition','Package'].includes(e?.kind))menu.append(button('Internal view',()=>explore(id,'interconnection')));if(['ActionUsage','ActionDefinition'].includes(e?.kind))menu.append(button('Activity view',()=>explore(id,'action')));
 if(['RequirementUsage','RequirementDefinition'].includes(e?.kind)){
  const actions=el('div',undefined,'requirement-actions');for(const action of requirementActions(state.graph,id).filter(a=>a.mode!=='context')){const control=button(`${action.label} (${action.count})`,()=>followTrace(id,action.mode));control.disabled=action.count===0&&action.unavailable===0&&action.filtered===0;control.title=action.summary?.message??'';actions.append(control);}menu.append(actions,el('p','Counts describe links in this loaded projection. Missing links are not proof that none exist.','projection-note'));
 }
 const advanced=el('details'),summary=el('summary','Other relationships');advanced.append(summary);
 const kinds=[...new Set(state.graph.relationships.filter(r=>r.source===id||r.target===id).map(r=>r.kind))].filter(k=>!['typing','owner','specialization'].includes(k));
 for(const kind of kinds)advanced.append(button(`Follow ${kind} relationships`,async()=>{const context=engineeringContext(state.graph,{focus:id,relationshipKinds:[kind],depth:1,budget:7});await openExploration(graphView(state.graph,context),id);}));
 menu.append(advanced);
 const typing=directTypingContext(state.graph,id);if(typing.elements.length>1)menu.append(button('Show direct type context',async()=>{await openExploration(graphView(state.graph,typing,'Explicit typing context'),id);}));
 menu.append(button('Close',()=>{menu.hidden=true;}));
}
function clearTrace(){ $('stage').classList.remove('tracing');for(const n of $('nodes').children)n.classList.remove('trace-endpoint');for(const e of $('connections').querySelectorAll('g[data-relationship]')){e.classList.remove('traced');e.removeAttribute('aria-pressed');} }
function traceEdge(edge,key){
 clearTrace();$('stage').classList.add('tracing');for(const n of $('nodes').children)n.classList.toggle('trace-endpoint',[edge.sourceSemantic,edge.targetSemantic].includes(n.dataset.semanticId));
 for(const g of $('connections').querySelectorAll('g[data-relationship]')){const match=g.dataset.relationship===String(edge.semanticId||edge.id)&&g.dataset.source===(edge.sourceSemantic||'')&&g.dataset.target===(edge.targetSemantic||'');g.classList.toggle('traced',match);g.setAttribute('aria-pressed',String(match));}
 const menu=$('selection');menu.replaceChildren(el('strong',edge.label||edge.kind),el('p',`${label(edge.sourceSemantic)} → ${label(edge.targetSemantic)}`));
 for(const id of [...new Set([edge.sourceSemantic,edge.targetSemantic])].filter(Boolean))menu.append(button('Focus '+label(id),()=>explore(id)));
 menu.append(button('Close',()=>{clearTrace();menu.hidden=true;}));menu.hidden=false;
}
function download(name,bytes,type){const blob=new Blob([bytes],{type}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function editorPresentation(){const config={compartments:$('presentation-compartments').value,expanded:$('presentation-expanded').value.split('\n').map(s=>s.trim()).filter(Boolean),emphasis:[...$('presentation-emphasis').selectedOptions].map(o=>o.value),grouping:$('presentation-grouping').value};if($('presentation-context').value!=='')config.contextBudget=Number($('presentation-context').value);resolvePresentation(config,{resolve});return validatePresentation(config);}
function openEditor(){if(!state.project)return;$('scene-title').value=scene()?.title||'New scene';$('scene-prose').value=scene()?.markdown||'';$('panel-placement').value=scene()?.panel?.placement||'right';$('view-source').value=fileText(state.project,$('view-file').value);const p=validatePresentation(scene()?.presentation);$('presentation-compartments').value=p.compartments;$('presentation-expanded').value=p.expanded.join('\n');for(const o of [...$('presentation-emphasis').options])o.selected=p.emphasis.includes(o.value);$('presentation-context').value=p.contextBudget??'';$('presentation-grouping').value=p.grouping;$('editor-error').textContent='';$('editor').showModal();}
async function capture(){
 if(!state.view)throw Error('Open a view before capturing a scene');let viewName=state.view.id;
 const project=structuredClone(state.project),number=state.scenes.length+1;
 if(!state.views.has(viewName)){if(!state.view.capture)throw Error('This focused graph cannot yet be captured faithfully as a native SysML view. Open a declared view, Internal view, or Activity view, then capture it.');const names=[state.view.capture.root];const name='scene'+number;const packageName='CanvasCaptured'+number;const filename='captured-views.sysml';const declaration=captureViewSource({packageName,name,qualifiedNames:names,definition:state.view.capture.definition});project.files[filename]=(project.files[filename]?fileText(project,filename)+'\n':'')+declaration;if(!project.manifest.viewSources.includes(filename))project.manifest.viewSources.push(filename);viewName=packageName+'::'+name;}
 const s={type:'scene',id:'captured-'+Date.now(),title:$('scene-title').value||'Captured view',view:viewName,focus:qname(state.focus),panel:{placement:$('panel-placement').value},presentation:editorPresentation(),markdown:$('scene-prose').value};
 if(!s.focus)throw Error('Captured focus needs a native qualified identity');appendScene(project,s);await loadProject(project);await showScene(state.scenes.length-1,false);$('editor').close();status('Scene captured. Export the project ZIP or Markdown to keep it.');
}
function contextNotice(notice){
 if(notice.reason==='context-route-fallback')return `Connection layout: ${notice.continued??0} shortened; ${notice.unrepresented??0} not drawn in this view. Native relationships: ${(notice.relationships??[]).join(', ')}.`;
 if(notice.reason==='context-route-continuation')return `Shortened context: ${(notice.targets??[]).map(id=>label(id)??id).join(', ')}; ${notice.continued??0} labeled connections.`;
 if(notice.reason==='context-route-conflict')return `Layout notice: ${notice.crossings} context crossings; ${Math.round(notice.overlapLength??0)} pixels of shared path remain.`;
 const target=notice.target??notice.relationshipId??'connection',name=label(target)??target;
 const prefix=notice.reason==='context-route-continuation'?'Shortened connection':['unavailable','outside-scope','metamodel-boundary'].includes(notice.reason)?'Unavailable / boundary':'Hidden by view policy';
 return `${prefix}: ${notice.reason} · ${name} (${target})`;
}
function bind(){
 $('open-folder').hidden=!('webkitdirectory' in $('folder-files'));
 for(const kind of PRESENTATION_RELATIONSHIP_KINDS){const option=el('option',kind);option.value=kind;$('presentation-emphasis').append(option);}
 $('explore-back').onclick=()=>restoreHistory('back').catch(report);$('explore-forward').onclick=()=>restoreHistory('forward').catch(report);$('trace-next').onclick=()=>followTrace(state.traceRequest.focus,state.traceRequest.mode,state.traceInfo.page+1).catch(report);$('trace-previous').onclick=()=>followTrace(state.traceRequest.focus,state.traceRequest.mode,state.traceInfo.page-1).catch(report);
 $('previous').onclick=()=>showScene(state.sceneIndex-1).catch(report);$('next').onclick=()=>showScene(state.sceneIndex+1).catch(report);$('scenes').onchange=()=>showScene(Number($('scenes').value)).catch(report);$('standalone').onclick=async()=>{try{await openExploration(state.view,state.focus);}catch(error){report(error);}};$('return').onclick=()=>showScene(state.sceneIndex,true,{record:true}).catch(report);
 $('fit').onclick=()=>resetCamera().catch(report);$('show-neighborhood').onclick=fitNeighborhood;$('zoom-in').onclick=()=>zoomBy(1.25);$('zoom-out').onclick=()=>zoomBy(.8);$('more-neighbors').onclick=()=>moreNeighbors().catch(report);
 bindCameraControls({element:$('stage'),getViewportArea:()=>state.visualSnapshot?.area,getCamera:()=>state.camera,setCamera:applyCamera,onGestureStart:takeCameraControl,shouldHandleTarget:target=>target===$('stage')||!!target?.closest?.('#graph-viewport')});$('reduce').setAttribute('aria-pressed',state.reduce);$('reduce').onclick=()=>{state.reduce=!state.reduce;$('reduce').setAttribute('aria-pressed',state.reduce);if(state.reduce)state.motion?.finish();};$('find-toggle').onclick=()=>{$('find').hidden=!$('find').hidden;if(!$('find').hidden)$('search').focus();};
 $('search').oninput=()=>{const q=$('search').value.trim().toLowerCase();$('search-results').replaceChildren();if(!q)return;const hits=state.graph.elements.filter(e=>e.qualifiedName&&e.layer==='project'&&e.native.declaredName&&(e.name+' '+e.qualifiedName).toLowerCase().includes(q));for(const e of hits.slice(0,30))$('search-results').append(button(e.qualifiedName,async()=>{$('find').hidden=true;await explore(e.id);}));};
 $('open-view').onclick=async()=>{try{const revision=++state.revision,modelHash=state.modelHash,name=$('views').value;let view=state.views.get(name);if(!view){const raw=await state.engine.call('RenderView',{modelHash,view:name,includeSemanticIdentity:true});if(revision!==state.revision||modelHash!==state.modelHash)return;view=requireNativeIdentity(adaptNativeView(raw,name));if(!['requirement','definition','tree','package','interconnection','action','state'].includes(view.kind))throw Error('This canvas does not yet render the native '+view.kind+' notation. The complete source remains included.');state.views.set(name,view);state.graph=modelGraph(state.exported.elements,[...state.views.values(),state.coverage,...state.extraViews.values()]);}const target=view.nodes.find(n=>n.semanticId)?.semanticId;$('find').hidden=true;await openExploration(view,target);}catch(e){report(e);}};
 $('context-details').onclick=()=>{$('information').classList.remove('statement');$('information-title').textContent='Prepared neighborhood';const omissions=state.displayOmissions??state.displayed?.omissions??[],n=state.visualSnapshot?.neighborhood;const summary=n?`${n.shown} of ${n.total} eligible one-hop neighbors prepared (limit ${n.budget}). Every included neighbor has a real tile. Pan or zoom to reveal tiles outside the active fit. Camera movement does not expand the model.\n\n`:'';$('information-text').textContent=summary+omissions.map(contextNotice).join('\n')+'\n\nCoverage: part composition, dependencies and direct types come from the native API. Other engineering links come from native requirement and declared views. Unprojected relationship kinds may be unavailable.';$('information').showModal();};
 $('edit').onclick=openEditor;$('view-file').onchange=()=>{$('view-source').value=fileText(state.project,$('view-file').value);};
 $('save-scene').onclick=async()=>{try{if(!scene())throw Error('Capture a first scene before editing it');const presentation=editorPresentation();scene().presentation=presentation;scene().title=$('scene-title').value;scene().markdown=$('scene-prose').value;scene().panel={placement:$('panel-placement').value};state.project.files[state.project.manifest.story]=writeStory(state.project.manifest.title,state.scenes);updateLists();$('editor').close();await showScene(state.sceneIndex,false);}catch(e){report(e);}};
 $('capture-scene').onclick=()=>capture().catch(report);$('apply-views').onclick=async()=>{try{const project=structuredClone(state.project);project.files[$('view-file').value]=$('view-source').value;await loadProject(project);$('editor').close();}catch(e){report(e);}};
 $('open-sysml').onclick=()=>$('sysml-files').click();$('open-folder').onclick=()=>$('folder-files').click();$('landing-project').onclick=()=>$('project-file').click();
 for(const [id,folder] of [['sysml-files',false],['folder-files',true]])$(id).onchange=async()=>{const request=++state.loadRevision;++state.revision;try{if($(id).files.length){busy(true);$('landing-error').hidden=true;const project=await projectFromSelection($(id).files,{folder});if(request!==state.loadRevision)return;await loadProject(project,{cacheHash:null,loadToken:request});}}catch(error){if(request===state.loadRevision)report(error);}finally{if(request===state.loadRevision)busy(false);$(id).value='';}};
 for(const demo of document.querySelectorAll('[data-demo]'))demo.onclick=()=>openDemo(demo.dataset.demo).catch(report);
 $('home').onclick=home;$('resume-model').onclick=async()=>{++state.loadRevision;++state.revision;busy(false);showLanding(document,false);document.title=state.project.manifest.title+' · Syspresent';await frame(state.view).catch(report);};
 $('import-project').onclick=()=>{$('project-file').click();};$('project-file').onchange=async()=>{const request=++state.loadRevision;++state.revision;try{const file=$('project-file').files[0];if(file){busy(true);const bytes=new Uint8Array(await file.arrayBuffer());if(request!==state.loadRevision)return;await loadProject(unpackProject(bytes),{cacheHash:null,loadToken:request});}}catch(e){if(request===state.loadRevision)report(e);}finally{if(request===state.loadRevision)busy(false);$('project-file').value='';}};
 $('import-markdown').onclick=()=>{$('markdown-file').click();};$('markdown-file').onchange=async()=>{const request=++state.loadRevision;++state.revision;try{const file=$('markdown-file').files[0];if(file){busy(true);const project=structuredClone(state.project);project.files[project.manifest.story]=await file.text();if(request!==state.loadRevision)return;await loadProject(project,{loadToken:request});}}catch(e){if(request===state.loadRevision)report(e);}finally{if(request===state.loadRevision)busy(false);$('markdown-file').value='';}};
 $('export-project').onclick=()=>{try{download('syspresent-project.zip',packProject(state.project),'application/zip');$('project-menu').open=false;}catch(e){report(e);}};$('export-markdown').onclick=()=>{download('story.md',fileText(state.project,state.project.manifest.story),'text/markdown');$('project-menu').open=false;};$('load-example').textContent='Choose another demo';$('load-example').onclick=home;
 $('about').onclick=()=>{$('information').classList.remove('statement');$('information-title').textContent='Engine and project details';$('information-text').textContent=JSON.stringify({engine:state.provenance,project:state.project.manifest,modelHash:state.modelHash,graph:{elements:state.graph.elements.length,relationships:state.graph.relationships.length},routing:state.visualSnapshot?.routingMetrics,camera:state.camera,neighborhood:state.visualSnapshot?.neighborhood,view:state.view.id,lastTransition:state.lastTransition,notice:state.exported.notice},null,2);$('information').showModal();};
 let keyboardFocus=false;document.addEventListener('keydown',()=>{keyboardFocus=true;},true);document.addEventListener('pointerdown',()=>{keyboardFocus=false;},true);$('nodes').addEventListener('focusin',event=>{if(!keyboardFocus||state.transitioning||!event.target.matches('.node'))return;const a=state.visualSnapshot?.area;if(!a)return;const r=event.target.getBoundingClientRect(),s=$('stage').getBoundingClientRect(),x=r.x-s.x,y=r.y-s.y;if(x<a.x||y<a.y||x+r.width>a.x+a.width||y+r.height>a.y+a.height){takeCameraControl();applyCamera({...state.camera,x:state.camera.x+a.x+a.width/2-x-r.width/2,y:state.camera.y+a.y+a.height/2-y-r.height/2});}});
 $('stage').onclick=e=>{if(e.target===$('stage')||e.target===$('nodes')||e.target===$('connections')){clearTrace();$('selection').hidden=true;}};
 let resize;new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(()=>{if($('stage').hidden||$('stage').clientWidth<=0||$('stage').clientHeight<=0)return;if(state.transitioning&&state.pendingDestination){const pending=state.pendingDestination;transitionTo(pending.view,pending.focus,{journey:pending.journey,allowDisconnected:true,camera:pending.cameraRevision===state.cameraRevision?pending.camera:state.camera}).catch(report);}else if(state.view)frame(state.view).catch(report);},100);}).observe($('stage'));
}
async function start(){bind();busy(false);showLanding(document,true);const demo=new URLSearchParams(location.search).get('demo');if(demo)await openDemo(demo);}
start().catch(report);
