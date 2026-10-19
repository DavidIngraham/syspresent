import {surroundingContext,positionSurrounding} from './context.mjs';
import {sampleTrack,startTimeline,samplePolyline,visibleTrackKeys} from './motion.mjs';
import {documentationFor,measureCard} from './documentation.mjs';
import {graphArea,fitNodes,routeEdges} from './geometry.mjs';
import {createSemanticEngine} from './engine/client.mjs';
import {engineeringContext,findEngineeringRoute,layoutScene,planTransition,directTypingContext} from './core/index.mjs';
import {adaptNativeView,modelGraph,graphView,requireNativeIdentity} from './graph.mjs';
import {validateProject,fileText,parseStory,writeStory,packProject,unpackProject,documentsFor,appendScene,captureViewSource,requirementCoverageSource,verifiedRuntimeCache} from './project.mjs';
const trustedCacheHash=document.querySelector('meta[name="syspresent-runtime-cache"]')?.content;
const buildVersion=document.querySelector('meta[name="syspresent-build"]')?.content||'development';
const $=id=>document.getElementById(id),el=(name,text,cls)=>{const e=document.createElement(name);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn)=>{const e=el('button',text);e.type='button';e.onclick=()=>Promise.resolve(fn()).catch(report);return e;};
const state={engine:null,project:null,graph:null,views:new Map(),scenes:[],sceneIndex:0,focus:null,selected:null,view:null,displayed:null,exploring:false,expanded:new Set(),collapsed:new Set(),rects:new Map(),reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,revision:0,loadRevision:0,animations:[],transitioning:false,provenance:null,history:[]};
const report=error=>{$('status').textContent=error.message||String(error);$('editor-error').textContent=error.message||String(error);console.error(error);};
const element=id=>state.graph?.elements.find(e=>e.id===id),label=id=>element(id)?.name||id;
const resolve=value=>state.graph?.elements.find(e=>e.id===value||e.qualifiedName===value)?.id;
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
 const byName=value=>graph.elements.find(e=>e.id===value||e.qualifiedName===value)?.id;
 for(const [sceneIndex,item] of scenes.entries()){if(item.journey?.length&&(byName(item.journey.at(-1))!==byName(item.focus)||(sceneIndex>0&&byName(item.journey[0])!==byName(scenes[sceneIndex-1].focus))))throw Error(`Scene ${item.id}: saved journey must connect the previous scene focus to this focus`);if(!views.has(item.view))throw Error(`Scene ${item.id}: native view ${item.view} does not resolve`);if(!byName(item.focus))throw Error(`Scene ${item.id}: focus ${item.focus} does not resolve`);for(let i=1;i<(item.journey??[]).length;i++){const from=byName(item.journey[i-1]),to=byName(item.journey[i]);if(!from||!to||!findEngineeringRoute(graph,{from,to,maxHops:1}).found)throw Error(`Scene ${item.id}: saved journey has a missing engineering connection`);}}
 const scoped=graph.elements.filter(e=>project.manifest.systemOfInterest.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id);
 for(let i=1;i<scenes.length;i++){const a=scenes[i-1],b=scenes[i],plan=planTransition({view:views.get(a.view),focus:byName(a.focus)},{view:views.get(b.view),focus:byName(b.focus)},{graph,scopeIds:scoped});if(plan.mode==='cross-kind'&&!plan.route.found)throw Error(`Scene ${b.id}: no engineering route from the previous scene within the presentation boundary`);}
 return {project,modelHash:parsed.modelHash,exported,graph,views,scenes,coverage,availableViews};
}
function busy(value){$('loading').hidden=!value;for(const id of ['previous','next','scenes','standalone','return','fit','find-toggle','edit'])$(id).disabled=value;}
async function loadProject(project){
 const revision=++state.loadRevision;++state.revision;busy(true);status('Parsing project with OpenSysML WASM…');$('selection').hidden=true;
 let compiled;try{compiled=await compile(validateProject(project));}catch(error){if(revision===state.loadRevision){busy(false);$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;}throw error;}if(revision!==state.loadRevision)return;
 Object.assign(state,compiled,{sceneIndex:0,selected:null,exploring:false,expanded:new Set(),collapsed:new Set(),rects:new Map(),view:null,displayed:null,history:[],extraViews:new Map()});
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
 const expanded=state.expanded.has(n.semanticId),requirement=!compact&&n.kind==='requirement'&&n.semanticId===focus&&!state.collapsed.has(n.semanticId),documentation=documentationFor(state.graph,n.semanticId);
 const detail=(expanded||requirement)?documentation.text||n.detail||(expanded?'No statement or documentation recorded.':''):'';
 const attribution=detail&&documentation.text&&documentation.source?.id!==n.semanticId?`Statement from ${documentation.source.qualifiedName||documentation.source.name}\n`:'';
 const displayDetail=attribution+detail;
 const displayID=element(n.semanticId)?.native?.declaredShortName||documentation.source?.native?.declaredShortName||'';
 const measured=['initial','final','fork','join','decision','merge'].includes(n.kind)?{}:measureCard(document,{...n,displayID},displayDetail);
 return {...n,...measured,displayDetail,displayID:element(n.semanticId)?.native?.declaredShortName||documentation.source?.native?.declaredShortName||''};
 })};}
function cancelAnimations(){state.motion?.cancel();state.motion=null;for(const a of state.animations)a.cancel();state.animations=[];}
function svgel(name,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
const nodeKey=(node,counts,view)=>{const base=node.kind==='context-boundary'?'boundary:'+node.semanticId:node.semanticId?'semantic:'+node.semanticId:'notation:'+view.id+':'+node.id;const count=counts.get(base)??0;counts.set(base,count+1);return base+':'+count;};
function labelSize(text){const span=el('span',text);span.style.cssText='position:fixed;visibility:hidden;left:-10000px;white-space:pre;font:12px system-ui,sans-serif';document.body.append(span);const rect=span.getBoundingClientRect();span.remove();return {width:Math.ceil(rect.width)+4,height:16};}
function prepareFrame(view,focus,panels){
 const stage=$('stage'),area=graphArea(stage.clientWidth,stage.clientHeight,panels);
 const layoutFor=compact=>layoutScene(sizeView(view,focus,{compact}),{width:area.width,height:area.height,panels:[],padding:8,gap:28});
 let layout=layoutFor(false),fitted=fitNodes(layout.nodes,area);
 // Preserve legible active names on short mobile canvases. Full text remains an explicit action.
 if(fitted.scale<.9&&view.nodes.length>3&&!state.expanded.has(focus)){layout=layoutFor(true);fitted=fitNodes(layout.nodes,area);}
 const active=fitted.nodes.map(n=>({...n,scale:fitted.scale,opacity:1,context:false}));
 const routed=routeEdges(layout.edges,active,{area,measureLabel:labelSize});
 const labelObstacles=routed.filter(e=>e.labelBox).map((e,i)=>({...e.labelBox,id:'label-obstacle:'+i}));
 const context=surroundingContext(state.graph,layout,{budget:stage.clientWidth<700?4:6});
 const fringe=positionSurrounding(context,[...active,...labelObstacles],area,{width:104,height:56,gap:10});
 const ghosts=fringe.nodes.map(n=>({...n,scale:1,opacity:.22,context:true,displayDetail:'',displayID:''}));
 const markers=fringe.boundaryMarkers.map(n=>({...n,x:n.x+(n.x===area.x?-8:n.x===area.x+area.width?8:0),y:n.y+(n.y===area.y?-8:n.y===area.y+area.height?8:0),scale:1,opacity:.22,context:true,interactive:false}));
 const nodes=[...active,...ghosts,...markers],counts=new Map(),byID=new Map();
 for(const n of nodes){n.key=nodeKey(n,counts,view);n.container=active.some(c=>c.parentId===n.id);byID.set(n.id,n);}
 const peripheral=routeEdges(fringe.edges.map(e=>({...e,label:''})), [...nodes,...labelObstacles],{area});
 const edgeCounts=new Map(),edges=[...routed,...peripheral].map(e=>{
  const a=byID.get(e.source),b=byID.get(e.target),base=[a?.semanticId||a?.key,b?.semanticId||b?.key,e.kind,e.label||''].join('|'),ordinal=edgeCounts.get(base)??0;edgeCounts.set(base,ordinal+1);
  return {...e,key:base+':'+ordinal,sourceKey:a?.key,targetKey:b?.key,sourceSemantic:a?.semanticId,targetSemantic:b?.semanticId,opacity:e.context ? .18 : 1,routePoints:e.points,points:samplePolyline(e.points)};
 });
 const omissions=[...(view.omissions??[]),...fringe.omissions,...routed.filter(e=>e.labelOmitted||e.routingBlocked).map(e=>({reason:e.labelOmitted?'label-space':'route-space',target:e.semanticTarget||e.target,relationshipId:e.semanticId||e.id}))];
 return {view,nodes,edges,area,width:stage.clientWidth,height:stage.clientHeight,scale:fitted.scale,layout,omissions};
}
function face(n){const host=el('span',undefined,'node-face');const short=n.name?.split('::').at(-1)||n.kind;host.append(el('span',`«${n.kind}»${n.displayID?' '+n.displayID:''}${n.type?' : '+n.type:''}`,'kind'),el('span',short,'name'));if(n.displayDetail&&!n.container)host.append(el('span',n.displayDetail,'detail'));return host;}
function visualNode(n){if(n.kind==='context-boundary'){const marker=el('span',undefined,'node context-boundary');marker.title='Additional model context: '+(n.name||n.semanticId);marker.setAttribute('role','img');marker.setAttribute('aria-label',marker.title);marker.dataset.context='true';return marker;}const node=el('button',undefined,`node ${n.kind}${n.container?' container':''}${n.context?' peripheral':''}${n.semanticId&&n.semanticId===state.selected?' selected':''}`);node.type='button';node.dataset.representation=n.id;if(n.semanticId)node.dataset.semanticId=n.semanticId;node.dataset.context=String(!!n.context);node.setAttribute('aria-label',`${n.name||n.kind}: select ${n.kind}${n.context?' (surrounding context)':''}`);node.style.zIndex=String(n.context?0:n.container?1:3);node.append(face(n));node.onclick=event=>{event.stopPropagation();select(n.semanticId,n);};node.oncontextmenu=event=>{event.preventDefault();select(n.semanticId,n);};return node;}
const rectValues=n=>({x:n.x,y:n.y,width:n.width,height:n.height,scale:n.scale??1,opacity:n.opacity??1});
function presenceTrack(frames,key,collection){return frames.map((f,index)=>{const item=f[collection].find(n=>n.key===key);if(item)return item;let nearest;for(let distance=1;distance<frames.length&&!nearest;distance++)nearest=frames[index-distance]?.[collection].find(n=>n.key===key)??frames[index+distance]?.[collection].find(n=>n.key===key);return {...nearest,opacity:0};});}
async function paintFrames(frames,{duration=0,caption='',outgoingPanel}={}){
 cancelAnimations();const destination=frames.at(-1),svg=$('connections'),host=$('nodes'),stage=$('stage');svg.replaceChildren();host.replaceChildren();svg.setAttribute('viewBox',`0 0 ${stage.clientWidth} ${stage.clientHeight}`);
 const defs=svgel('defs'),marker=svgel('marker',{id:'arrow',markerWidth:8,markerHeight:6,refX:7,refY:3,orient:'auto',markerUnits:'strokeWidth'});marker.append(svgel('path',{d:'M0,0 L7,3 L0,6',fill:'none',stroke:'#426869','stroke-width':1.2}));defs.append(marker);svg.append(defs);
 const offsets=frames.length===5?[0,.18,.5,.74,1]:frames.map((_,i)=>i/(frames.length-1||1));
 const nodeKeys=visibleTrackKeys(frames,'nodes'),edgeKeys=visibleTrackKeys(frames,'edges');
 const nodeTracks=nodeKeys.map(key=>{const track=presenceTrack(frames,key,'nodes'),latest=destination.nodes.find(n=>n.key===key)??track.filter(n=>n.opacity>0).at(-1),node=visualNode(latest);host.append(node);
  const first=track.find(n=>n.opacity>0),oldFace=latest.kind!=='context-boundary'&&first&&JSON.stringify([first.kind,first.displayDetail,first.type,first.container])!==JSON.stringify([latest.kind,latest.displayDetail,latest.type,latest.container])?face(first):null;
  if(oldFace){oldFace.classList.add('old-face');oldFace.setAttribute('aria-hidden','true');node.append(oldFace);}
  return {key,node,latest,oldFace,newFace:node.firstChild,track:track.map(rectValues)};
 });
 const edgeTracks=edgeKeys.map(key=>{const track=presenceTrack(frames,key,'edges'),latest=destination.edges.find(e=>e.key===key)??track.filter(e=>e.opacity>0).at(-1),group=svgel('g',{'data-relationship':latest.semanticId||latest.id,'data-context':String(!!latest.context),'data-source':latest.sourceSemantic||'','data-target':latest.targetSemantic||''}),line=svgel('path',{fill:'none',stroke:'#426869','stroke-width':latest.context?1.1:1.35,'marker-end':'url(#arrow)'});if(['satisfy','verify','dependency','derive','typing','specialization'].includes(latest.kind))line.setAttribute('stroke-dasharray','5 3');group.append(line);const title=svgel('title');title.textContent=latest.label||latest.kind;group.append(title);let text;if(latest.label&&!latest.labelOmitted){text=svgel('text',{'font-size':12,'font-family':'system-ui, sans-serif',fill:'#355e60','paint-order':'stroke',stroke:'#f5f7f7','stroke-width':4,'text-anchor':'start'});text.textContent=latest.label;group.append(text);}const leader=track.some(e=>e.labelLeader)?svgel('line',{stroke:'#638183','stroke-width':.8,'stroke-dasharray':'2 3'}):null;if(leader)group.prepend(leader);svg.append(group);
  const numeric=track.map(e=>{const r={opacity:e.opacity??1,x:e.x??0,y:e.y??0,labelOpacity:e.label&&!e.labelOmitted?1:0,leaderOpacity:e.labelLeader?1:0,lax:e.labelLeader?.from.x??e.x??0,lay:e.labelLeader?.from.y??e.y??0,lbx:e.labelLeader?.to.x??e.x??0,lby:e.labelLeader?.to.y??e.y??0};for(const [i,p]of e.points.entries()){r['x'+i]=p.x;r['y'+i]=p.y;}return r;});
  return {key,group,line,text,leader,latest,track:numeric};
 });
 const draw=(progress,clock)=>{const nodes=[],edges=[];for(const item of nodeTracks){const r=sampleTrack(item.track,offsets,progress),n=item.node;n.style.width=(r.width/(r.scale||1))+'px';n.style.height=(r.height/(r.scale||1))+'px';n.style.transform=`translate(${r.x}px,${r.y}px) scale(${r.scale})`;n.style.opacity=r.opacity;n.style.pointerEvents=item.latest.interactive!==false&&r.opacity>.12?'auto':'none';n.setAttribute('aria-hidden',String(r.opacity<.05));if(item.oldFace){const fade=Math.max(0,Math.min(1,(progress-.25)/.5));item.oldFace.style.opacity=1-fade;item.newFace.style.opacity=fade;}nodes.push({...item.latest,...r});}
  for(const item of edgeTracks){const r=sampleTrack(item.track,offsets,progress),points=Array.from({length:20},(_,i)=>({x:r['x'+i],y:r['y'+i]}));item.line.setAttribute('d',(clock===1&&item.latest.routePoints?item.latest.routePoints:points).map((p,i)=>(i?'L':'M')+p.x+','+p.y).join(' '));item.group.style.opacity=r.opacity;if(item.text){item.text.setAttribute('x',r.x);item.text.setAttribute('y',r.y);item.text.style.opacity=r.labelOpacity;}if(item.leader){item.leader.setAttribute('x1',r.lax);item.leader.setAttribute('y1',r.lay);item.leader.setAttribute('x2',r.lbx);item.leader.setAttribute('y2',r.lby);item.leader.style.opacity=r.leaderOpacity*.6;}edges.push({...item.latest,points,opacity:r.opacity,x:r.x,y:r.y});}
  if(outgoingPanel)outgoingPanel.style.opacity=Math.max(0,1-clock*3);$('narrative').style.opacity=duration?Math.min(1,clock*2):1;stage.dataset.motionProgress=String(clock);state.visualSnapshot={...destination,nodes,edges};
 };
 const omissions=destination.omissions;$('transition').dataset.notice=String(!!caption);$('context-details').hidden=!omissions.length;$('context-details').textContent=`Context (${omissions.length})`;$('transition').textContent=caption||`${destination.view.kind} · ${destination.view.nodes.length} active elements`;
 const motion=startTimeline({duration:state.reduce?0:duration,update:draw});state.motion=motion;const result=await motion.finished;
 if(!result.cancelled){state.visualSnapshot=destination;for(const item of nodeTracks){if(!destination.nodes.some(n=>n.key===item.key))item.node.remove();else{item.oldFace?.remove();if(item.newFace)item.newFace.style.opacity=1;}}for(const item of edgeTracks)if(!destination.edges.some(e=>e.key===item.key))item.group.remove();state.layout={...destination.layout,displayNodes:destination.nodes.filter(n=>!n.context),scale:destination.scale,area:destination.area};state.displayed=destination.view;state.displayOmissions=omissions;delete stage.dataset.motionProgress;}
 outgoingPanel?.remove();if(state.motion===motion)state.motion=null;return result;
}
async function frame(view,caption='',duration=0,focus=state.focus){if(state.transitioning&&state.pendingDestination){const pending=state.pendingDestination;return transitionTo(pending.view,pending.focus,{animate:false,allowDisconnected:true,journey:pending.journey});}const panels=panelGeometry(view),destination=prepareFrame(view,focus,panels),previous=state.visualSnapshot;return paintFrames(duration&&previous?[previous,destination]:[destination],{duration,caption});}

function gather(ids){const set=new Set(ids),elements=state.graph.elements.filter(e=>set.has(e.id));return graphView(state.graph,{elements,relationships:state.graph.relationships.filter(e=>set.has(e.source)&&set.has(e.target))},'General View journey');}
async function transitionTo(view,focus,{animate=true,journey,allowDisconnected=false}={}){
 const revision=++state.revision,previous=state.view;
 // Validate the route before committing focus or starting an animation.
 const plan=previous?planTransition({view:previous,focus:state.previousFocus},{view,focus},{graph:state.graph,scopeIds:state.exploring?undefined:scopeIds(),reducedMotion:state.reduce}):null;
 if(journey?.length>1&&plan?.route&&resolve(journey[0])===state.previousFocus&&resolve(journey.at(-1))===focus){const ids=journey.map(resolve);const routeEdges=[];for(let i=1;i<ids.length;i++){const route=findEngineeringRoute(state.graph,{from:ids[i-1],to:ids[i],scopeIds:scopeIds(),maxHops:1});if(!route.found)throw Error('Saved journey no longer resolves within the presentation boundary');routeEdges.push(...route.relationships);}plan.route={found:true,elements:ids.map(element),relationships:routeEdges};const stage=plan.stages.find(s=>s.kind==='gv-journey');if(stage){stage.route=routeEdges;stage.semanticIds=ids;}}
 const disconnected=plan?.mode==='cross-kind'&&plan.route?.found===false;
 if(disconnected&&!state.exploring&&!allowDisconnected)throw Error('No engineering route connects these viewpoints within the presentation system. Explore the model to open a disconnected viewpoint explicitly.');
 $('selection').hidden=true;state.transitioning=true;state.pendingDestination={view,focus,journey};state.lastTransition=plan;
 try{
 const oldPanel=!$('narrative').hidden?$('narrative').cloneNode(true):null;if(oldPanel){oldPanel.removeAttribute('id');oldPanel.classList.add('narrative-outgoing');oldPanel.setAttribute('aria-hidden','true');$('stage').append(oldPanel);}
 const panels=panelGeometry(view),target=prepareFrame(view,focus,panels),frames=[];
 if(state.visualSnapshot&&animate&&!state.reduce){frames.push(state.visualSnapshot);if(plan?.mode==='cross-kind'&&!disconnected){for(const step of plan.stages.slice(0,-1))frames.push(prepareFrame(gather(step.semanticIds),focus,panels));}frames.push(target);}else frames.push(target);
 const result=await paintFrames(frames,{duration:frames.length>2?1700:frames.length>1?780:0,caption:disconnected?'No engineering route · explicit view jump':'',outgoingPanel:oldPanel});
 if(result.cancelled||revision!==state.revision)return;state.view=view;state.focus=focus;state.previousFocus=focus;
 if(!state.exploring)status(`OpenSysML WASM · ${state.graph.elements.length} native elements · ${state.availableViews.length} views`);
 $('boundary').textContent=!scopeIds().includes(focus)?'Outside presentation boundary · loaded model context':state.project.manifest.publication.scope==='scoped'?'Scoped publication · supplied model context only':'Complete project · standalone exploration available';
 }finally{if(revision===state.revision){state.transitioning=false;state.pendingDestination=null;}}
}
async function showScene(index,animate=true){
 if(index<0||index>=state.scenes.length)return;
 const saved={sceneIndex:state.sceneIndex,exploring:state.exploring,selected:state.selected};
 state.sceneIndex=index;state.exploring=false;state.selected=null;const s=scene();const focus=resolve(s.focus),view=state.views.get(s.view);
 try{if(!focus||!view)throw Error('Scene focus or native view is unavailable');await transitionTo(view,focus,{animate,journey:s.journey,allowDisconnected:true});}
 catch(error){Object.assign(state,saved);if(state.view)await frame(state.view);throw error;}
 finally{$('scenes').value=state.sceneIndex;$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;$('return').hidden=!state.exploring||!state.scenes.length;$('standalone').hidden=state.exploring;}
}
async function explore(id,kind){
 if(!id||!element(id))throw Error('Model target unavailable');
 const revision=++state.revision,modelHash=state.modelHash;
 let view;
 if(kind){const q=qname(id);if(!q)throw Error('Native view requires a qualified model identity');const raw=await state.engine.call('RenderView',{modelHash,view:`#${kind}:${q}`,includeSemanticIdentity:true});if(revision!==state.revision||modelHash!==state.modelHash)return;view={...requireNativeIdentity(adaptNativeView(raw,`#${kind}:${q}`)),capture:{definition:kind==='action'?'ActionFlowView':'InterconnectionView',root:q}};state.extraViews??=new Map();state.extraViews.set(view.id,view);state.graph=modelGraph(state.exported.elements,[...state.views.values(),state.coverage,...state.extraViews.values()]);}
 if(revision!==state.revision)return;
 state.history.push({view:state.view,focus:state.focus});state.exploring=true;$('return').hidden=!state.scenes.length;$('standalone').hidden=true;
 if(view)await transitionTo(view,id);
 else {const context=engineeringContext(state.graph,{focus:id,depth:1,budget:14});await transitionTo(graphView(state.graph,context),id);status(`Focused General View · ${context.elements.length} elements · ${context.omissions.length} context boundaries (details available)`);}
}
function select(id,node){state.selected=id||null;for(const n of $('nodes').children)n.classList.toggle('selected',!!id&&n.dataset.semanticId===id);const menu=$('selection');menu.replaceChildren(el('strong',node?.name||label(id)));menu.hidden=false;
 if(!id){menu.append(el('p','This is a native notation/control element; it has no model-element identity.'),button('Close',()=>{menu.hidden=true;}));return;}
 const documentation=documentationFor(state.graph,id);if(documentation.text)menu.append(button('Read full statement',()=>{$('information').classList.add('statement');$('information-title').textContent='Full statement';$('information-text').textContent=(documentation.source?.qualifiedName||label(id))+'\n\n'+documentation.text;$('information').showModal();}));
 menu.append(button('Focus',()=>explore(id)),button(state.expanded.has(id)||!!node?.displayDetail?'Collapse compartment':'Show statement / compartment',async()=>{if(state.expanded.has(id)||!!node?.displayDetail){state.expanded.delete(id);state.collapsed.add(id);}else{state.collapsed.delete(id);state.expanded.add(id);}await frame(state.view);select(id,node);}));
 const e=element(id);if(['PartUsage','PartDefinition','Package'].includes(e?.kind))menu.append(button('Internal view',()=>explore(id,'interconnection')));if(['ActionUsage','ActionDefinition'].includes(e?.kind))menu.append(button('Activity view',()=>explore(id,'action')));
 const kinds=[...new Set(state.graph.relationships.filter(r=>r.source===id||r.target===id).map(r=>r.kind))].filter(k=>!['typing','owner','specialization'].includes(k));
 for(const kind of kinds)menu.append(button(`Follow ${kind} relationships`,async()=>{state.exploring=true;$('return').hidden=!state.scenes.length;const context=engineeringContext(state.graph,{focus:id,relationshipKinds:[kind],depth:1,budget:14});await transitionTo(graphView(state.graph,context),id);}));
 const typing=directTypingContext(state.graph,id);if(typing.elements.length>1)menu.append(button('Show direct type context',async()=>{state.exploring=true;$('return').hidden=!state.scenes.length;await transitionTo(graphView(state.graph,typing,'Explicit typing context'),id);}));
 menu.append(button('Close',()=>{menu.hidden=true;}));
}
function download(name,bytes,type){const blob=new Blob([bytes],{type}),url=URL.createObjectURL(blob),a=el('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000);}
function openEditor(){if(!state.project)return;$('scene-title').value=scene()?.title||'New scene';$('scene-prose').value=scene()?.markdown||'';$('panel-placement').value=scene()?.panel?.placement||'right';$('view-source').value=fileText(state.project,$('view-file').value);$('editor-error').textContent='';$('editor').showModal();}
async function capture(){
 if(!state.view)throw Error('Open a view before capturing a scene');let viewName=state.view.id;
 const project=structuredClone(state.project),number=state.scenes.length+1;
 if(!state.views.has(viewName)){if(!state.view.capture)throw Error('This focused graph cannot yet be captured faithfully as a native SysML view. Open a declared view, Internal view, or Activity view, then capture it.');const names=[state.view.capture.root];const name='scene'+number;const packageName='CanvasCaptured'+number;const filename='captured-views.sysml';const declaration=captureViewSource({packageName,name,qualifiedNames:names,definition:state.view.capture.definition});project.files[filename]=(project.files[filename]?fileText(project,filename)+'\n':'')+declaration;if(!project.manifest.viewSources.includes(filename))project.manifest.viewSources.push(filename);viewName=packageName+'::'+name;}
 const s={type:'scene',id:'captured-'+Date.now(),title:$('scene-title').value||'Captured view',view:viewName,focus:qname(state.focus),panel:{placement:$('panel-placement').value},markdown:$('scene-prose').value};
 if(!s.focus)throw Error('Captured focus needs a native qualified identity');appendScene(project,s);await loadProject(project);await showScene(state.scenes.length-1,false);$('editor').close();status('Scene captured. Export the project ZIP or Markdown to keep it.');
}
function bind(){
 $('previous').onclick=()=>showScene(state.sceneIndex-1).catch(report);$('next').onclick=()=>showScene(state.sceneIndex+1).catch(report);$('scenes').onchange=()=>showScene(Number($('scenes').value)).catch(report);$('standalone').onclick=async()=>{try{state.exploring=true;$('return').hidden=!state.scenes.length;$('standalone').hidden=true;await transitionTo(state.view,state.focus);status('Explore this native view · select an element for contextual actions');}catch(error){report(error);}};$('return').onclick=()=>showScene(state.sceneIndex).catch(report);
 $('fit').onclick=()=>frame(state.view).catch(report);$('reduce').setAttribute('aria-pressed',state.reduce);$('reduce').onclick=()=>{state.reduce=!state.reduce;$('reduce').setAttribute('aria-pressed',state.reduce);if(state.reduce)state.motion?.finish();};$('find-toggle').onclick=()=>{$('find').hidden=!$('find').hidden;if(!$('find').hidden)$('search').focus();};
 $('search').oninput=()=>{const q=$('search').value.trim().toLowerCase();$('search-results').replaceChildren();if(!q)return;const hits=state.graph.elements.filter(e=>e.qualifiedName&&e.layer==='project'&&e.native.declaredName&&(e.name+' '+e.qualifiedName).toLowerCase().includes(q));for(const e of hits.slice(0,30))$('search-results').append(button(e.qualifiedName,async()=>{$('find').hidden=true;await explore(e.id);}));};
 $('open-view').onclick=async()=>{try{const revision=++state.revision,modelHash=state.modelHash,name=$('views').value;let view=state.views.get(name);if(!view){const raw=await state.engine.call('RenderView',{modelHash,view:name,includeSemanticIdentity:true});if(revision!==state.revision||modelHash!==state.modelHash)return;view=requireNativeIdentity(adaptNativeView(raw,name));if(!['requirement','definition','tree','package','interconnection','action','state'].includes(view.kind))throw Error('This canvas does not yet render the native '+view.kind+' notation. The complete source remains included.');state.views.set(name,view);state.graph=modelGraph(state.exported.elements,[...state.views.values(),state.coverage,...state.extraViews.values()]);}const target=view.nodes.find(n=>n.semanticId)?.semanticId;state.exploring=true;$('return').hidden=!state.scenes.length;$('find').hidden=true;await transitionTo(view,target);}catch(e){report(e);}};
 $('context-details').onclick=()=>{$('information').classList.remove('statement');$('information-title').textContent='Context boundaries';const omissions=state.displayOmissions??state.displayed?.omissions??[];$('information-text').textContent=omissions.map(o=>`${['unavailable','outside-scope','metamodel-boundary'].includes(o.reason)?'Unavailable / boundary':'Hidden by view policy'}: ${o.reason} · ${label(o.target)} (${o.target})`).join('\n')+'\n\nCoverage: part composition, dependencies and direct types come from the native API. Other engineering links come from native requirement and declared views. Unprojected relationship kinds may be unavailable.';$('information').showModal();};
 $('edit').onclick=openEditor;$('view-file').onchange=()=>{$('view-source').value=fileText(state.project,$('view-file').value);};
 $('save-scene').onclick=async()=>{try{if(!scene())throw Error('Capture a first scene before editing it');scene().title=$('scene-title').value;scene().markdown=$('scene-prose').value;scene().panel={placement:$('panel-placement').value};state.project.files[state.project.manifest.story]=writeStory(state.project.manifest.title,state.scenes);updateLists();$('editor').close();await showScene(state.sceneIndex,false);}catch(e){report(e);}};
 $('capture-scene').onclick=()=>capture().catch(report);$('apply-views').onclick=async()=>{try{const project=structuredClone(state.project);project.files[$('view-file').value]=$('view-source').value;await loadProject(project);$('editor').close();}catch(e){report(e);}};
 $('import-project').onclick=()=>{$('project-file').click();};$('project-file').onchange=async()=>{try{const file=$('project-file').files[0];if(file)await loadProject(unpackProject(new Uint8Array(await file.arrayBuffer())));}catch(e){report(e);}finally{$('project-file').value='';}};
 $('import-markdown').onclick=()=>{$('markdown-file').click();};$('markdown-file').onchange=async()=>{try{const file=$('markdown-file').files[0];if(file){const project=structuredClone(state.project);project.files[project.manifest.story]=await file.text();await loadProject(project);}}catch(e){report(e);}finally{$('markdown-file').value='';}};
 $('export-project').onclick=()=>{try{download('syspresent-project.zip',packProject(state.project),'application/zip');$('project-menu').open=false;}catch(e){report(e);}};$('export-markdown').onclick=()=>{download('story.md',fileText(state.project,state.project.manifest.story),'text/markdown');$('project-menu').open=false;};$('load-example').onclick=()=>exampleProject().then(loadProject).catch(report);
 $('about').onclick=()=>{$('information').classList.remove('statement');$('information-title').textContent='Engine and project details';$('information-text').textContent=JSON.stringify({engine:state.provenance,project:state.project.manifest,modelHash:state.modelHash,graph:{elements:state.graph.elements.length,relationships:state.graph.relationships.length},view:state.view.id,lastTransition:state.lastTransition,notice:state.exported.notice},null,2);$('information').showModal();};
 $('stage').onclick=e=>{if(e.target===$('stage')||e.target===$('nodes'))$('selection').hidden=true;};
 let resize;new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(()=>{if(state.transitioning&&state.pendingDestination){const pending=state.pendingDestination;transitionTo(pending.view,pending.focus,{journey:pending.journey,allowDisconnected:true}).catch(report);}else if(state.view)frame(state.view).catch(report);},100);}).observe($('stage'));
}
async function start(){bind();busy(true);state.engine=createSemanticEngine({assetBase:new URL('./engine/',location.href),assetVersion:buildVersion,workerURL:new URL('./engine/worker.js?v='+buildVersion,location.href)});const [project,info]=await Promise.all([exampleProject(),state.engine.ready]);state.engineInfo=info;state.provenance=await fetch('./engine/provenance.json?v='+buildVersion).then(r=>r.ok?r.json():info);await loadProject(project);}
start().catch(report);
