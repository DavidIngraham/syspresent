import {planDepartures} from './departures.mjs';
import {requirementActions,traceContext} from './exploration.mjs';
import {resolvePresentation,validatePresentation,PRESENTATION_RELATIONSHIP_KINDS} from './preferences.mjs';
import {surroundingContext} from './context.mjs';
import {preparePeripheral} from './peripheral.mjs';
import {sampleTrack,startTimeline,samplePolyline,visibleTrackKeys} from './motion.mjs';
import {documentationFor,measureCard} from './documentation.mjs';
import {graphArea,fitDiagram,routeEdges,routeIsClear,routeConnectsEndpoints} from './geometry.mjs';
import {createLayoutEngine,layoutDiagram} from './elk-layout.mjs';
import {edgeAppearance,markerDefinition} from './notation.mjs';
import {createSemanticEngine} from './engine/client.mjs';
import {engineeringContext,findEngineeringRoute,findHierarchyRoute,planTransition,directTypingContext} from './core/index.mjs';
import {adaptNativeView,modelGraph,graphView,requireNativeIdentity} from './graph.mjs';
import {validateProject,fileText,parseStory,writeStory,packProject,unpackProject,documentsFor,appendScene,captureViewSource,requirementCoverageSource,verifiedRuntimeCache} from './project.mjs';
const trustedCacheHash=document.querySelector('meta[name="syspresent-runtime-cache"]')?.content;
const buildVersion=document.querySelector('meta[name="syspresent-build"]')?.content||'development';
const $=id=>document.getElementById(id),el=(name,text,cls)=>{const e=document.createElement(name);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn)=>{const e=el('button',text);e.type='button';e.onclick=()=>Promise.resolve(fn()).catch(report);return e;};
const state={engine:null,project:null,graph:null,views:new Map(),scenes:[],sceneIndex:0,focus:null,selected:null,view:null,displayed:null,exploring:false,expanded:new Set(),collapsed:new Set(),rects:new Map(),reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,revision:0,loadRevision:0,animations:[],transitioning:false,provenance:null,history:[],future:[],presentation:{},traceRequest:null};
const report=error=>{$('status').textContent=error.message||String(error);$('editor-error').textContent=error.message||String(error);console.error(error);};
const element=id=>state.graph?.elements.find(e=>e.id===id),label=id=>element(id)?.name||id;
function resolveInGraph(graph,value){const exact=graph?.elements.find(e=>e.id===value);if(exact)return exact.id;const matches=graph?.elements.filter(e=>e.qualifiedName===value)??[];if(matches.length>1)throw Error('Ambiguous native qualified reference: '+value);return matches[0]?.id;}
const resolve=value=>resolveInGraph(state.graph,value);
const qname=id=>element(id)?.qualifiedName;
const scene=()=>state.scenes[state.sceneIndex];
function scopeIds(){const roots=state.project.manifest.systemOfInterest;return state.graph.elements.filter(e=>roots.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id);}
function status(text){$('status').textContent=text;$('loading-phase').textContent=text;}
function inline(parent,text){let start=0;for(const m of text.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g)){parent.append(document.createTextNode(text.slice(start,m.index)));parent.append(el(m[1]?'strong':m[2]?'code':'em',m[1]??m[2]??m[3]));start=m.index+m[0].length;}parent.append(document.createTextNode(text.slice(start)));}
function markdown(text){const host=el('div');let paragraph=[],list;const flush=()=>{if(paragraph.length){const p=el('p');inline(p,paragraph.join(' '));host.append(p);paragraph=[];}list=null;};for(const line of text.split('\n')){const heading=/^(#{1,6})\s+(.+)$/.exec(line),item=/^[-*]\s+(.+)$/.exec(line);if(heading){flush();host.append(el('h'+Math.min(6,Number(heading[1].length)+1),heading[2]));}else if(item){if(paragraph.length)flush();if(!list){list=el('ul');host.append(list);}const li=el('li');inline(li,item[1]);list.append(li);}else if(!line.trim())flush();else paragraph.push(line);}flush();return host;}
async function exampleProject(){const response=await fetch('./project.zip?v='+buildVersion);if(!response.ok)throw Error('Example project unavailable');return unpackProject(new Uint8Array(await response.arrayBuffer()));}
async function compile(project){
 const documents=documentsFor(project),scenes=parseStory(fileText(project,project.manifest.story));
 let parsed,exported,roots=project.manifest.modelRoots,runtimePackage='SyspresentRuntimeContext';
 const check=result=>{const errors=(result.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error'));if(errors.length)throw Error(errors.map(d=>`${d.message} (${d.span?.file??'source'}:${d.span?.startLine??'?'})`).join('\n'));if(!result.modelHash)throw Error('Native engine returned no model identity');};
 if(!roots?.length){
  parsed=await state.engine.call('ParseSources',{documents});check(parsed);
  exported=await state.engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
  const rootIDs=(parsed.roots??[]).flatMap(r=>r.childIds??[]);roots=exported.elements.filter(e=>rootIDs.includes(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName);
 }
 while(roots.includes(runtimePackage))runtimePackage+='X';
 status('Resolving the complete project with OpenSysML WASM…');
 const allDocuments=[...documents,{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(roots,runtimePackage,project.manifest.requirementSeeds)}];
 parsed=await state.engine.call('ParseSources',{documents:allDocuments});check(parsed);
 const cache=await verifiedRuntimeCache(project,{trustedHash:trustedCacheHash,engineVersion:state.engineInfo?.version,engineFingerprint:state.provenance?.assets?.['sysml-wasm.wasm']?.sha256,documents:allDocuments,modelHash:parsed.modelHash});
 status('Loading model declarations and requirement relationships…');
 exported=cache?.exported??await state.engine.call('ExportModel',{modelHash:parsed.modelHash,projection:'declarations'});
 if(!Array.isArray(exported.elements))throw Error('Native model export has no element array');
 if(project.manifest.modelRoots?.length){const modelRootIDs=parsed.roots.slice(0,project.manifest.modelSources.length).flatMap(r=>r.childIds??[]),actual=exported.elements.filter(e=>modelRootIDs.includes(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName);const missing=actual.filter(name=>!roots.includes(name));if(missing.length)throw Error('Native model roots need rebuilding: '+missing.join(', '));}
 const coverage=requireNativeIdentity(adaptNativeView(cache?.coverage??await state.engine.call('RenderView',{modelHash:parsed.modelHash,view:runtimePackage+'::coverage',includeSemanticIdentity:true}),runtimePackage+'::coverage'));
 exported.elements=exported.elements.filter(e=>e.qualifiedName!==runtimePackage&&!e.qualifiedName?.startsWith(runtimePackage+'::'));
 const availableViews=exported.elements.filter(e=>e['@type']==='ViewUsage'&&e.qualifiedName&&e['sysx:sourceLine']).map(e=>e.qualifiedName);
 const needed=new Set([...scenes.map(s=>s.view),...(project.manifest.entryView?[project.manifest.entryView]:[])]),views=new Map();
 for(const name of needed){if(!availableViews.includes(name))throw Error('Native view does not resolve: '+name);status('Preparing '+(scenes.find(s=>s.view===name)?.title||'model view')+'…');const raw=cache?.views?.[name]??await state.engine.call('RenderView',{modelHash:parsed.modelHash,view:name,includeSemanticIdentity:true});views.set(name,requireNativeIdentity(adaptNativeView(raw,name)));}
 const graph=modelGraph(exported.elements,[...views.values(),coverage]);
 for(const root of project.manifest.systemOfInterest)if(!graph.elements.some(e=>e.qualifiedName===root))throw Error('System of interest does not resolve: '+root);
 const byName=value=>resolveInGraph(graph,value);
 for(const [sceneIndex,item] of scenes.entries()){resolvePresentation(item.presentation,{resolve:byName});if(item.journey?.length&&(byName(item.journey.at(-1))!==byName(item.focus)||(sceneIndex>0&&byName(item.journey[0])!==byName(scenes[sceneIndex-1].focus))))throw Error(`Scene ${item.id}: saved journey must connect the previous scene focus to this focus`);if(!views.has(item.view))throw Error(`Scene ${item.id}: native view ${item.view} does not resolve`);if(!byName(item.focus))throw Error(`Scene ${item.id}: focus ${item.focus} does not resolve`);for(let i=1;i<(item.journey??[]).length;i++){const from=byName(item.journey[i-1]),to=byName(item.journey[i]);if(!from||!to||!findEngineeringRoute(graph,{from,to,maxHops:1}).found&&!findHierarchyRoute(graph,{from,to,maxHops:1}).found)throw Error(`Scene ${item.id}: saved journey has a missing engineering connection`);}}
 const scoped=graph.elements.filter(e=>project.manifest.systemOfInterest.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id);
 for(let i=1;i<scenes.length;i++){const a=scenes[i-1],b=scenes[i],plan=planTransition({view:views.get(a.view),focus:byName(a.focus)},{view:views.get(b.view),focus:byName(b.focus)},{graph,scopeIds:scoped,journey:b.journey?.map(byName)});if(b.journey?.length&&!plan.route.found)throw Error(`Scene ${b.id}: saved journey no longer resolves within the presentation boundary`);if(plan.mode==='cross-kind'&&!plan.route.found)throw Error(`Scene ${b.id}: no engineering route from the previous scene within the presentation boundary`);}
 return {project,modelHash:parsed.modelHash,exported,graph,views,scenes,coverage,availableViews};
}
function busy(value){$('loading').hidden=!value;for(const id of ['previous','next','scenes','standalone','return','fit','find-toggle','edit'])$(id).disabled=value;}
async function loadProject(project){
 const revision=++state.loadRevision;++state.revision;busy(true);status('Parsing project with OpenSysML WASM…');$('selection').hidden=true;
 let compiled;try{compiled=await compile(validateProject(project));}catch(error){if(revision===state.loadRevision){busy(false);$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;}throw error;}if(revision!==state.loadRevision)return;
 Object.assign(state,compiled,{sceneIndex:0,selected:null,exploring:false,expanded:new Set(),collapsed:new Set(),rects:new Map(),view:null,displayed:null,history:[],future:[],traceRequest:null,traceInfo:null,presentation:{},extraViews:new Map()});
 busy(false);updateLists();$('editor-error').textContent='';$('project-menu').open=false;
 if(state.scenes.length)await showScene(0,false);else {state.focus=resolve(project.manifest.systemOfInterest[0]);await explore(state.focus);}
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
 const context=surroundingContext(state.graph,layout,{budget:displayPreferences().contextBudget});
 const fringe=preparePeripheral(context,active,area,{width:104,height:56,gap:10,obstacles:[...labelObstacles,...routeObstacles],measureLabel:labelSize});
 const ghosts=fringe.nodes.map(n=>({...n,scale:1,opacity:.22,context:true,displayDetail:'',displayID:''}));
 const markers=fringe.boundaryMarkers.map(n=>({...n,scale:1,opacity:.22,context:true,interactive:false}));
 const nodes=[...active,...ghosts,...markers],counts=new Map(),byID=new Map();
 for(const n of nodes){n.key=nodeKey(n,counts,view);n.container=active.some(c=>c.parentId===n.id);byID.set(n.id,n);}
 const peripheral=[...routeEdges(fringe.edges,[...nodes,...labelObstacles,...fringe.stubEdges.filter(e=>e.labelBox).map(e=>({...e.labelBox,id:'stub-label:'+e.id}))],{area,measureLabel:labelSize}),...fringe.stubEdges];
 const edgeCounts=new Map(),edges=[...routed,...peripheral].map(e=>{
  const a=byID.get(e.sourceAttachment??e.source),b=byID.get(e.targetAttachment??e.target),ownerA=byID.get(e.source),ownerB=byID.get(e.target),base=[a?.semanticId||a?.key,b?.semanticId||b?.key,e.kind,e.label||''].join('|'),ordinal=edgeCounts.get(base)??0;edgeCounts.set(base,ordinal+1);
  return {...e,journey:journey&&!e.context,sourceClipped:a?.kind==='context-boundary',targetClipped:b?.kind==='context-boundary',key:base+':'+ordinal,sourceKey:a?.key,targetKey:b?.key,sourceSemantic:a?.semanticId||ownerA?.semanticId,targetSemantic:b?.semanticId||ownerB?.semanticId,opacity:e.context?.18:!journey&&displayPreferences().emphasis.length&&!displayPreferences().emphasis.includes(e.kind)?.28:1,routePoints:e.points,points:samplePolyline(e.points.length?e.points:[{x:0,y:0},{x:0,y:0}])};
 });
 const notationNotices=layout.edges.map(e=>({e,appearance:edgeAppearance(e,{viewKind:view.kind})})).filter(p=>!p.appearance.supported).map(p=>({reason:'unsupported-notation',target:p.e.target,relationshipId:p.e.id,message:p.appearance.notice}));
 const omissions=[...(layout.omissions??view.omissions??[]),...notationNotices,...fringe.omissions,...routed.filter(e=>e.labelOmitted||e.routingBlocked).map(e=>({reason:e.labelOmitted?'label-space':'route-space',target:e.semanticTarget||e.target,relationshipId:e.semanticId||e.id}))];
 return {view,nodes,edges,area,width:stage.clientWidth,height:stage.clientHeight,panels,scale:fitted.scale,layout,omissions};
}
function face(n){const host=el('span',undefined,'node-face');if(n.kind==='port'){const text=n.label??n.name??'';if(text)host.append(el('span',text,'port-name'));return host;}const short=(n.name?.split('::').at(-1)||n.kind).replace(/([a-z0-9])([A-Z])/g,'$1\u200b$2');host.append(el('span',`«${n.kind}»${n.displayID?' '+n.displayID:''}${n.type?' : '+n.type:''}`,'kind'),el('span',short,'name'));if(n.displayDetail&&!n.container)host.append(el('span',n.displayDetail,'detail'));return host;}
function visualNode(n){if(n.kind==='context-boundary'){const marker=el('span',undefined,'node context-boundary');marker.title='Additional model context: '+(n.name||n.semanticId);marker.setAttribute('role','img');marker.setAttribute('aria-label',marker.title);marker.dataset.context='true';const glyph=el('span','›','continuation-glyph');glyph.style.transform=`rotate(${({EAST:0,SOUTH:90,WEST:180,NORTH:270})[n.continuationDirection]??0}deg)`;marker.append(glyph);return marker;}const node=el('button',undefined,`node ${n.kind}${n.container?' container':''}${n.context?' peripheral':''}${n.semanticId&&n.semanticId===state.selected?' selected':''}`);node.type='button';node.dataset.representation=n.id;if(n.semanticId)node.dataset.semanticId=n.semanticId;node.dataset.context=String(!!n.context);node.setAttribute('aria-label',`${n.name||n.kind}: select ${n.kind}${n.context?' (surrounding context)':''}`);node.style.zIndex=String(n.context?0:n.container?1:3);node.append(face(n));node.onclick=event=>{event.stopPropagation();select(n.semanticId,n);};node.oncontextmenu=event=>{event.preventDefault();select(n.semanticId,n);};return node;}
const rectValues=n=>({x:n.x,y:n.y,width:n.width,height:n.height,scale:n.scale??1,opacity:n.opacity??1});
function presenceTrack(frames,key,collection){return frames.map((f,index)=>{const item=f[collection].find(n=>n.key===key);if(item)return item;let nearest;for(let distance=1;distance<frames.length&&!nearest;distance++)nearest=frames[index-distance]?.[collection].find(n=>n.key===key)??frames[index+distance]?.[collection].find(n=>n.key===key);return {...nearest,opacity:0};});}
async function paintFrames(frames,{duration=0,caption='',outgoingPanel}={}){
 clearTrace();cancelAnimations();const destination=frames.at(-1),svg=$('connections'),host=$('nodes'),stage=$('stage');svg.replaceChildren();host.replaceChildren();svg.setAttribute('viewBox',`0 0 ${stage.clientWidth} ${stage.clientHeight}`);
 const defs=svgel('defs');for(const name of ['open-arrow','filled-arrow','hollow-triangle','diamond','hollow-diamond','containment']){const {path,fill,...attrs}=markerDefinition(name),marker=svgel('marker',{id:'edge-'+name,...attrs,markerUnits:'userSpaceOnUse'});marker.append(svgel('path',{d:path,fill:fill==='line'?'#426869':fill==='background'?'#f5f7f7':'none',stroke:'#426869','stroke-width':1.2}));defs.append(marker);}svg.append(defs);
 const offsets=frames.length===5?[0,.18,.5,.74,1]:frames.map((_,i)=>i/(frames.length-1||1));
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
  const numeric=track.map(e=>{const r={opacity:e.opacity??1,x:e.x??0,y:e.y??0,labelOpacity:e.label&&!e.labelOmitted?1:0,journey:e.journey?1:0};for(const [i,p]of e.points.entries()){r['x'+i]=p.x;r['y'+i]=p.y;}return r;});
  return {key,group,line,oldLine,hit,text,latest,track:numeric};
 });
 const draw=(progress,clock)=>{const nodes=[],edges=[];for(const item of nodeTracks){const r=departurePlan.sampleNode(item.key,progress,p=>sampleTrack(item.track,offsets,p)),n=item.node;n.style.width=(r.width/(r.scale||1))+'px';n.style.height=(r.height/(r.scale||1))+'px';n.style.transform=`translate(${r.x}px,${r.y}px) scale(${r.scale})`;n.style.opacity=r.opacity;n.style.pointerEvents=item.latest.interactive!==false&&r.opacity>.12?'auto':'none';n.setAttribute('aria-hidden',String(r.opacity<.05));if(item.latest.portLabelBox){const label=n.querySelector('.port-name'),box=item.latest.portLabelBox;if(label){label.style.left=(box.x-item.latest.x)/(item.latest.scale||1)+'px';label.style.top=(box.y-item.latest.y)/(item.latest.scale||1)+'px';label.style.width=box.width/(item.latest.scale||1)+'px';label.style.height=box.height/(item.latest.scale||1)+'px';}}if(item.oldFace){const fade=Math.max(0,Math.min(1,(progress-.25)/.5));item.oldFace.style.opacity=1-fade;item.newFace.style.opacity=fade;}nodes.push({...item.latest,...r});}
  const currentNodes=nodes.map(n=>({...n,id:n.key,parentId:n.parentId?nodes.find(p=>p.id===n.parentId)?.key:undefined}));
  const sampledEdges=edgeTracks.map(item=>({item,r:sampleTrack(item.track,offsets,progress)})),journeySizes=new Map();
  const liveEdges=sampledEdges.filter(({r})=>clock!==1&&r.journey>.5&&r.opacity>.01).map(({item})=>{
   const text=item.latest.label??'',box=item.latest.labelBox??{width:Math.max(16,text.length*7),height:16},old=journeySizes.get(text);journeySizes.set(text,{width:Math.max(old?.width??0,box.width),height:Math.max(old?.height??0,box.height)});
   return {...item.latest,id:item.key,source:item.latest.sourceKey,target:item.latest.targetKey,label:text};
  });
  const liveRoutes=new Map(routeEdges(liveEdges,currentNodes,{area:destination.area,measureLabel:text=>journeySizes.get(text)}).map(route=>[route.id,route]));
  for(const {item,r} of sampledEdges){
   const interpolated=Array.from({length:20},(_,i)=>({x:r['x'+i],y:r['y'+i]}));
   // Never morph a line through a moving tile. During travel use a clear
   // rectilinear route and lower its emphasis; the final route is joint ELK geometry.
   const edge={...item.latest,source:item.latest.sourceKey,target:item.latest.targetKey};
   let points=clock===1?(item.latest.routePoints??[]):interpolated,liveLabel;
   const journeyEdge=clock!==1&&r.journey>.5;
   if(journeyEdge){const live=liveRoutes.get(item.key);points=live?.points??[];if(live?.labelBox&&!live.labelLeader&&![...liveRoutes.values()].some(other=>other.points.length>1&&!routeIsClear(other.points,other,currentNodes.concat([{...live.labelBox,id:'journey-label:'+item.key}]),{orthogonalOnly:true})))liveLabel=live;}
   if(!journeyEdge&&clock!==1&&(!routeIsClear(points,edge,currentNodes,{orthogonalOnly:true})||!routeConnectsEndpoints(points,edge,currentNodes))){points=routeEdges([{...edge,label:''}],currentNodes)[0]?.points??[];}
   if(!routeIsClear(points,edge,currentNodes)||!routeConnectsEndpoints(points,edge,currentNodes))points=[];
   const pathOf=path=>path.map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '),signature=points.slice(1).map((p,i)=>Math.abs(p.x-points[i].x)<.01?'V':'H').filter((v,i,a)=>!i||v!==a[i-1]).join('');
   if(clock!==1&&item.signature&&signature!==item.signature){item.outgoingPoints=item.drawnPoints;item.routeChangedAt=clock;}
   const routeFade=clock===1?1:Math.min(1,Math.max(0,(clock-(item.routeChangedAt??-1))*duration/140));
   let outgoing=item.outgoingPoints?.map(p=>({...p}));
   if(outgoing?.length>1&&points.length>1){const first=outgoing[0],second=outgoing[1],last=outgoing.at(-1),penultimate=outgoing.at(-2),horizontalFirst=Math.abs(first.y-second.y)<.01,horizontalLast=Math.abs(last.y-penultimate.y)<.01;outgoing[0]={...points[0]};outgoing[outgoing.length-1]={...points.at(-1)};if(horizontalFirst)second.y=points[0].y;else second.x=points[0].x;if(horizontalLast)penultimate.y=points.at(-1).y;else penultimate.x=points.at(-1).x;}
   const oldClear=outgoing&&routeIsClear(outgoing,edge,currentNodes,{orthogonalOnly:true})&&routeConnectsEndpoints(outgoing,edge,currentNodes);item.oldLine.setAttribute('d',oldClear?pathOf(outgoing):'');item.oldLine.style.opacity=oldClear?1-routeFade:0;
   const path=pathOf(points);item.line.setAttribute('d',path);item.line.style.opacity=routeFade;item.hit.setAttribute('d',path);item.signature=signature;item.drawnPoints=points;
   const traveling=duration&&clock>0&&clock<1,emphasis=traveling&&!journeyEdge?.2+.8*Math.abs(Math.cos(Math.PI*clock)):1;
   const endpoints=[currentNodes.find(n=>n.id===edge.source),currentNodes.find(n=>n.id===edge.target)],presence=Math.min(1,...endpoints.map(n=>n?(n.opacity??1)/(n.context?.22:1):0));const effectiveOpacity=points.length?r.opacity*emphasis*presence:0;item.group.style.opacity=effectiveOpacity;item.group.style.pointerEvents=effectiveOpacity>.1?'auto':'none';item.group.setAttribute('aria-hidden',String(effectiveOpacity<.05));item.group.setAttribute('tabindex',effectiveOpacity>.1?'0':'-1');
   if(item.text){item.text.setAttribute('x',liveLabel?.x??r.x);item.text.setAttribute('y',liveLabel?.y??r.y);item.text.style.opacity=journeyEdge?(liveLabel?r.labelOpacity*routeFade:0):traveling?Math.max(0,(clock-.85)/.15):r.labelOpacity;}
   edges.push({...item.latest,points,opacity:effectiveOpacity,x:r.x,y:r.y});
  }
  if(outgoingPanel)outgoingPanel.style.opacity=Math.max(0,1-clock*3);$('narrative').style.opacity=duration?Math.min(1,clock*2):1;stage.dataset.motionProgress=String(clock);state.visualSnapshot={...destination,nodes,edges};
 };
 const omissions=destination.omissions;$('transition').dataset.notice=String(!!caption);$('context-details').hidden=!omissions.length;$('context-details').textContent=`Context (${omissions.length})`;$('transition').textContent=caption||`${destination.view.kind} · ${destination.view.nodes.length} active elements`;
 const motion=startTimeline({duration:state.reduce?0:duration,update:draw});state.motion=motion;const result=await motion.finished;
 if(!result.cancelled){state.visualSnapshot=destination;for(const item of nodeTracks){if(!destination.nodes.some(n=>n.key===item.key))item.node.remove();else{item.oldFace?.remove();if(item.newFace?.style)item.newFace.style.opacity=1;}}for(const item of edgeTracks)if(!destination.edges.some(e=>e.key===item.key))item.group.remove();state.layout={...destination.layout,displayNodes:destination.nodes.filter(n=>!n.context),scale:destination.scale,area:destination.area};state.displayed=destination.view;state.displayOmissions=omissions;delete stage.dataset.motionProgress;}
 outgoingPanel?.remove();if(state.motion===motion)state.motion=null;return result;
}
async function frame(view,caption='',duration=0,focus=state.focus){if(state.transitioning&&state.pendingDestination){const pending=state.pendingDestination;return transitionTo(pending.view,pending.focus,{animate:false,allowDisconnected:true,journey:pending.journey});}const revision=++state.revision,panels=panelGeometry(view),destination=await prepareFrame(view,focus,panels),previous=state.visualSnapshot;if(revision!==state.revision)return;return paintFrames(duration&&previous?[previous,destination]:[destination],{duration,caption});}

function gather(ids,relationships){const set=new Set(ids),elements=state.graph.elements.filter(e=>set.has(e.id));return graphView(state.graph,{elements,relationships:(relationships??state.graph.relationships).filter(e=>set.has(e.source)&&set.has(e.target))},'General View journey');}
async function transitionTo(view,focus,{animate=true,journey,allowDisconnected=false}={}){
 const revision=++state.revision,previous=state.view;
 // Validate the route before committing focus or starting an animation.
 const savedJourney=journey?.length>1&&resolve(journey[0])===state.previousFocus&&resolve(journey.at(-1))===focus?journey.map(resolve):undefined;
 const plan=previous?planTransition({view:previous,focus:state.previousFocus},{view,focus},{graph:state.graph,scopeIds:state.exploring?undefined:scopeIds(),reducedMotion:state.reduce,journey:savedJourney}):null;
 if(savedJourney&&!plan?.route?.found)throw Error('Saved journey no longer resolves within the presentation boundary');
 const disconnected=plan?.journeyRequired&&plan.route?.found===false;
 if(disconnected&&!state.exploring&&!allowDisconnected)throw Error('No engineering route connects these viewpoints within the presentation system. Explore the model to open a disconnected viewpoint explicitly.');
 cancelAnimations();for(const p of $('stage').querySelectorAll('.narrative-outgoing'))p.remove();$('selection').hidden=true;state.transitioning=true;state.pendingDestination={view,focus,journey};state.lastTransition=plan;
 let oldPanel;try{
 oldPanel=!$('narrative').hidden?$('narrative').cloneNode(true):null;if(oldPanel){oldPanel.removeAttribute('id');oldPanel.classList.add('narrative-outgoing');oldPanel.setAttribute('aria-hidden','true');$('stage').append(oldPanel);}
 const panels=panelGeometry(view),target=await prepareFrame(view,focus,panels),frames=[];if(revision!==state.revision){oldPanel?.remove();return;}
 if(state.visualSnapshot&&animate&&!state.reduce){frames.push(state.visualSnapshot);if(plan?.journeyRequired&&!disconnected){for(const step of plan.stages.filter(step=>step.viewKind==='gv')){frames.push(await prepareFrame(gather(step.semanticIds,step.route),step.focusId??focus,panels,{journey:true}));if(revision!==state.revision){oldPanel?.remove();return;}}}frames.push(target);}else frames.push(target);
 if(revision!==state.revision){oldPanel?.remove();return;}
 const result=await paintFrames(frames,{duration:frames.length>2?Math.max(1700,(frames.length-1)*420):frames.length>1?780:0,caption:disconnected?'No engineering route · explicit view jump':plan?.route?.strategy==='ownership-ancestor'?'Model ownership route · location, not derivation':'',outgoingPanel:oldPanel});
 if(result.cancelled||revision!==state.revision)return;state.view=view;state.focus=focus;state.previousFocus=focus;
 if(!state.exploring)status(`OpenSysML WASM · ${state.graph.elements.length} native elements · ${state.availableViews.length} views`);else status(state.traceInfo?.summary.message??'Explore this native view · select an element for contextual actions');
 $('boundary').textContent=!scopeIds().includes(focus)?'Outside presentation boundary · loaded model context':state.project.manifest.publication.scope==='scoped'?'Scoped publication · supplied model context only':'Complete project · standalone exploration available';
 }finally{oldPanel?.remove();if(revision===state.revision){state.transitioning=false;state.pendingDestination=null;}}
}
async function showScene(index,animate=true,{record=false}={}){
 if(index<0||index>=state.scenes.length)return;
 const saved=snapshot(),savedHistory=[...state.history],savedFuture=[...state.future];
 if(record)remember();state.sceneIndex=index;state.exploring=false;state.selected=null;state.traceRequest=null;state.traceInfo=null;state.presentation=structuredClone(state.scenes[index].presentation??{});state.expanded=new Set(displayPreferences().expandedIds);state.collapsed=new Set();updateExplorationControls();const s=scene();const focus=resolve(s.focus),view=state.views.get(s.view);
 let navigationRevision;try{if(!focus||!view)throw Error('Scene focus or native view is unavailable');const pending=transitionTo(view,focus,{animate,journey:s.journey,allowDisconnected:true});navigationRevision=state.revision;await pending;}
 catch(error){if(navigationRevision!==undefined&&navigationRevision!==state.revision)return;state.history=savedHistory;state.future=savedFuture;restoreValues(saved);if(saved.view)await transitionTo(saved.view,saved.focus,{animate:false,allowDisconnected:true});throw error;}
 finally{updateExplorationControls();$('scenes').value=state.sceneIndex;$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;$('return').hidden=!state.exploring||!state.scenes.length;$('standalone').hidden=state.exploring;}
}
function displayPreferences(){return resolvePresentation(state.presentation,{width:$('stage').clientWidth,resolve});}
function snapshot(){return {view:state.pendingDestination?.view??state.view,focus:state.pendingDestination?.focus??state.focus,sceneIndex:state.sceneIndex,exploring:state.exploring,selected:state.selected,expanded:[...state.expanded],collapsed:[...state.collapsed],presentation:structuredClone(state.presentation),traceRequest:structuredClone(state.traceRequest),traceInfo:structuredClone(state.traceInfo??null)};}
function restoreValues(target){Object.assign(state,{sceneIndex:target.sceneIndex,exploring:target.exploring,selected:target.selected,expanded:new Set(target.expanded),collapsed:new Set(target.collapsed),presentation:structuredClone(target.presentation),traceRequest:structuredClone(target.traceRequest)});state.traceInfo=structuredClone(target.traceInfo??null);}
function remember(){if(!state.view)return;state.history.push(snapshot());if(state.history.length>40)state.history.shift();state.future=[];updateExplorationControls();}
function updateExplorationControls(){
 const exploring=state.exploring;document.querySelector('header nav').hidden=exploring;$('exploration-controls').hidden=!exploring&&!state.history.length&&!state.future.length;$('explore-back').disabled=!state.history.length;$('explore-forward').disabled=!state.future.length;
 $('return').hidden=!exploring||!state.scenes.length;$('standalone').hidden=exploring;
 const request=state.traceRequest,info=state.traceInfo;$('exploration-label').textContent=exploring?(request&&info?`${info.mode==='context'?'Context':({origins:'Origins',derived:'Derived requirements',impact:'Design impact',verification:'Verification'})[info.mode]} · ${label(request.focus)} · ${info.shown} of ${info.total}`:label(state.focus)):'Guided scene';$('exploration-label').title=$('exploration-label').textContent;
 $('trace-previous').hidden=!request||!info||info.pages<2;$('trace-next').hidden=!request||!info||info.pages<2;$('trace-previous').disabled=!info||info.page===0;$('trace-next').disabled=!info||info.page>=info.pages-1;
 if(info?.pages>1)$('trace-next').textContent=`More (${info.page+1}/${info.pages})`;
}
async function restoreHistory(direction){
 const from=direction==='back'?state.history:state.future,to=direction==='back'?state.future:state.history;if(!from.length)return;
 const target=from.pop(),current=snapshot();to.push(current);restoreValues(target);updateExplorationControls();const revision=state.revision+1;
 try{await transitionTo(target.view,target.focus,{allowDisconnected:true});if(revision!==state.revision)return;$('scenes').value=state.sceneIndex;updateExplorationControls();if(state.traceInfo)status(state.traceInfo.summary.message);}catch(error){if(revision!==state.revision)return;to.pop();from.push(target);restoreValues(current);updateExplorationControls();await transitionTo(current.view,current.focus,{animate:false,allowDisconnected:true});throw error;}
}
async function openExploration(view,id,{request=null,info=null,record=true}={}){
 const previous=snapshot(),history=[...state.history],future=[...state.future];if(record)remember();state.exploring=true;state.traceRequest=request;state.traceInfo=info;if(request)state.presentation={...state.presentation,emphasis:[]};state.selected=null;updateExplorationControls();const revision=state.revision+1;
 try{await transitionTo(view,id,{allowDisconnected:true});if(revision!==state.revision)return;updateExplorationControls();status(info?info.summary.message:'Explore this native view · select an element for contextual actions');}
 catch(error){if(revision!==state.revision)return;state.history=history;state.future=future;restoreValues(previous);updateExplorationControls();if(previous.view)await transitionTo(previous.view,previous.focus,{animate:false,allowDisconnected:true});throw error;}
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
 const e=element(id);if(['PartUsage','PartDefinition','Package'].includes(e?.kind))menu.append(button('Internal view',()=>explore(id,'interconnection')));if(['ActionUsage','ActionDefinition'].includes(e?.kind))menu.append(button('Activity view',()=>explore(id,'action')));
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
function bind(){
 for(const kind of PRESENTATION_RELATIONSHIP_KINDS){const option=el('option',kind);option.value=kind;$('presentation-emphasis').append(option);}
 $('explore-back').onclick=()=>restoreHistory('back').catch(report);$('explore-forward').onclick=()=>restoreHistory('forward').catch(report);$('trace-next').onclick=()=>followTrace(state.traceRequest.focus,state.traceRequest.mode,state.traceInfo.page+1).catch(report);$('trace-previous').onclick=()=>followTrace(state.traceRequest.focus,state.traceRequest.mode,state.traceInfo.page-1).catch(report);
 $('previous').onclick=()=>showScene(state.sceneIndex-1).catch(report);$('next').onclick=()=>showScene(state.sceneIndex+1).catch(report);$('scenes').onchange=()=>showScene(Number($('scenes').value)).catch(report);$('standalone').onclick=async()=>{try{await openExploration(state.view,state.focus);}catch(error){report(error);}};$('return').onclick=()=>showScene(state.sceneIndex,true,{record:true}).catch(report);
 $('fit').onclick=()=>frame(state.view).catch(report);$('reduce').setAttribute('aria-pressed',state.reduce);$('reduce').onclick=()=>{state.reduce=!state.reduce;$('reduce').setAttribute('aria-pressed',state.reduce);if(state.reduce)state.motion?.finish();};$('find-toggle').onclick=()=>{$('find').hidden=!$('find').hidden;if(!$('find').hidden)$('search').focus();};
 $('search').oninput=()=>{const q=$('search').value.trim().toLowerCase();$('search-results').replaceChildren();if(!q)return;const hits=state.graph.elements.filter(e=>e.qualifiedName&&e.layer==='project'&&e.native.declaredName&&(e.name+' '+e.qualifiedName).toLowerCase().includes(q));for(const e of hits.slice(0,30))$('search-results').append(button(e.qualifiedName,async()=>{$('find').hidden=true;await explore(e.id);}));};
 $('open-view').onclick=async()=>{try{const revision=++state.revision,modelHash=state.modelHash,name=$('views').value;let view=state.views.get(name);if(!view){const raw=await state.engine.call('RenderView',{modelHash,view:name,includeSemanticIdentity:true});if(revision!==state.revision||modelHash!==state.modelHash)return;view=requireNativeIdentity(adaptNativeView(raw,name));if(!['requirement','definition','tree','package','interconnection','action','state'].includes(view.kind))throw Error('This canvas does not yet render the native '+view.kind+' notation. The complete source remains included.');state.views.set(name,view);state.graph=modelGraph(state.exported.elements,[...state.views.values(),state.coverage,...state.extraViews.values()]);}const target=view.nodes.find(n=>n.semanticId)?.semanticId;$('find').hidden=true;await openExploration(view,target);}catch(e){report(e);}};
 $('context-details').onclick=()=>{$('information').classList.remove('statement');$('information-title').textContent='Context boundaries';const omissions=state.displayOmissions??state.displayed?.omissions??[];$('information-text').textContent=omissions.map(o=>`${['unavailable','outside-scope','metamodel-boundary'].includes(o.reason)?'Unavailable / boundary':'Hidden by view policy'}: ${o.reason} · ${label(o.target)} (${o.target})`).join('\n')+'\n\nCoverage: part composition, dependencies and direct types come from the native API. Other engineering links come from native requirement and declared views. Unprojected relationship kinds may be unavailable.';$('information').showModal();};
 $('edit').onclick=openEditor;$('view-file').onchange=()=>{$('view-source').value=fileText(state.project,$('view-file').value);};
 $('save-scene').onclick=async()=>{try{if(!scene())throw Error('Capture a first scene before editing it');const presentation=editorPresentation();scene().presentation=presentation;scene().title=$('scene-title').value;scene().markdown=$('scene-prose').value;scene().panel={placement:$('panel-placement').value};state.project.files[state.project.manifest.story]=writeStory(state.project.manifest.title,state.scenes);updateLists();$('editor').close();await showScene(state.sceneIndex,false);}catch(e){report(e);}};
 $('capture-scene').onclick=()=>capture().catch(report);$('apply-views').onclick=async()=>{try{const project=structuredClone(state.project);project.files[$('view-file').value]=$('view-source').value;await loadProject(project);$('editor').close();}catch(e){report(e);}};
 $('import-project').onclick=()=>{$('project-file').click();};$('project-file').onchange=async()=>{try{const file=$('project-file').files[0];if(file)await loadProject(unpackProject(new Uint8Array(await file.arrayBuffer())));}catch(e){report(e);}finally{$('project-file').value='';}};
 $('import-markdown').onclick=()=>{$('markdown-file').click();};$('markdown-file').onchange=async()=>{try{const file=$('markdown-file').files[0];if(file){const project=structuredClone(state.project);project.files[project.manifest.story]=await file.text();await loadProject(project);}}catch(e){report(e);}finally{$('markdown-file').value='';}};
 $('export-project').onclick=()=>{try{download('syspresent-project.zip',packProject(state.project),'application/zip');$('project-menu').open=false;}catch(e){report(e);}};$('export-markdown').onclick=()=>{download('story.md',fileText(state.project,state.project.manifest.story),'text/markdown');$('project-menu').open=false;};$('load-example').onclick=()=>exampleProject().then(loadProject).catch(report);
 $('about').onclick=()=>{$('information').classList.remove('statement');$('information-title').textContent='Engine and project details';$('information-text').textContent=JSON.stringify({engine:state.provenance,project:state.project.manifest,modelHash:state.modelHash,graph:{elements:state.graph.elements.length,relationships:state.graph.relationships.length},view:state.view.id,lastTransition:state.lastTransition,notice:state.exported.notice},null,2);$('information').showModal();};
 $('stage').onclick=e=>{if(e.target===$('stage')||e.target===$('nodes')||e.target===$('connections')){clearTrace();$('selection').hidden=true;}};
 let resize;new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(()=>{if(state.transitioning&&state.pendingDestination){const pending=state.pendingDestination;transitionTo(pending.view,pending.focus,{journey:pending.journey,allowDisconnected:true}).catch(report);}else if(state.view)frame(state.view).catch(report);},100);}).observe($('stage'));
}
async function start(){bind();busy(true);state.layoutEngine=createLayoutEngine({workerUrl:new URL('./layout/elk-worker.js?v='+buildVersion,location.href).href});state.engine=createSemanticEngine({assetBase:new URL('./engine/',location.href),assetVersion:buildVersion,workerURL:new URL('./engine/worker.js?v='+buildVersion,location.href)});const [project,info]=await Promise.all([exampleProject(),state.engine.ready]);state.engineInfo=info;state.provenance=await fetch('./engine/provenance.json?v='+buildVersion).then(r=>r.ok?r.json():info);await loadProject(project);}
start().catch(report);
