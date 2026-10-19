import {graphArea,fitNodes} from './geometry.mjs';
import {createSemanticEngine} from './engine/client.mjs';
import {engineeringContext,findEngineeringRoute,layoutScene,planTransition,directTypingContext} from './core/index.mjs';
import {adaptNativeView,modelGraph,graphView,requireNativeIdentity} from './graph.mjs';
import {validateProject,fileText,parseStory,writeStory,packProject,unpackProject,documentsFor,appendScene,captureViewSource,requirementCoverageSource} from './project.mjs';
const $=id=>document.getElementById(id),el=(name,text,cls)=>{const e=document.createElement(name);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
const button=(text,fn)=>{const e=el('button',text);e.type='button';e.onclick=()=>Promise.resolve(fn()).catch(report);return e;};
const state={engine:null,project:null,graph:null,views:new Map(),scenes:[],sceneIndex:0,focus:null,selected:null,view:null,displayed:null,exploring:false,expanded:new Set(),rects:new Map(),reduce:matchMedia('(prefers-reduced-motion: reduce)').matches,revision:0,loadRevision:0,animations:[],transitioning:false,provenance:null,history:[]};
const report=error=>{$('status').textContent=error.message||String(error);$('editor-error').textContent=error.message||String(error);console.error(error);};
const element=id=>state.graph?.elements.find(e=>e.id===id),label=id=>element(id)?.name||id;
const resolve=value=>state.graph?.elements.find(e=>e.id===value||e.qualifiedName===value)?.id;
const qname=id=>element(id)?.qualifiedName;
const scene=()=>state.scenes[state.sceneIndex];
function scopeIds(){const roots=state.project.manifest.systemOfInterest;return state.graph.elements.filter(e=>roots.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id);}
function status(text){$('status').textContent=text;}
function inline(parent,text){let start=0;for(const m of text.matchAll(/\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*/g)){parent.append(document.createTextNode(text.slice(start,m.index)));parent.append(el(m[1]?'strong':m[2]?'code':'em',m[1]??m[2]??m[3]));start=m.index+m[0].length;}parent.append(document.createTextNode(text.slice(start)));}
function markdown(text){const host=el('div');let paragraph=[],list;const flush=()=>{if(paragraph.length){const p=el('p');inline(p,paragraph.join(' '));host.append(p);paragraph=[];}list=null;};for(const line of text.split('\n')){const heading=/^(#{1,6})\s+(.+)$/.exec(line),item=/^[-*]\s+(.+)$/.exec(line);if(heading){flush();host.append(el('h'+Math.min(6,Number(heading[1].length)+1),heading[2]));}else if(item){if(paragraph.length)flush();if(!list){list=el('ul');host.append(list);}const li=el('li');inline(li,item[1]);list.append(li);}else if(!line.trim())flush();else paragraph.push(line);}flush();return host;}
async function exampleProject(){const manifest=await fetch('./example/project.json').then(r=>{if(!r.ok)throw Error('Example project unavailable');return r.json();});const files={};await Promise.all([...manifest.modelSources,...manifest.viewSources,manifest.story,...manifest.assets].map(async name=>{const r=await fetch('./example/'+name);if(!r.ok)throw Error('Missing example '+name);files[name]=await r.text();}));return validateProject({manifest,files});}
async function compile(project){
 let parsed=await state.engine.call('ParseSources',{documents:documentsFor(project)});
 const errors=(parsed.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error'));
 if(errors.length)throw Error(errors.map(d=>`${d.message} (${d.span?.file??'source'}:${d.span?.startLine??'?'})`).join('\n'));
 if(!parsed.modelHash)throw Error('Native engine returned no model identity');
 let exported=await state.engine.call('ExportModel',{modelHash:parsed.modelHash});
 if(!Array.isArray(exported.elements))throw Error('Native model export has no element array');
 // Native requirement renderer resolves implicit and inherited satisfy/verify roles.
 // Runtime helper views are derived from native roots; they never edit system sources.
 const rootIDs=(parsed.roots??[]).flatMap(r=>r.childIds??[]),roots=exported.elements.filter(e=>rootIDs.includes(e['@id'])&&e.qualifiedName).map(e=>e.qualifiedName);
 let runtimePackage='SyspresentRuntimeContext';while(exported.elements.some(e=>e.qualifiedName===runtimePackage))runtimePackage+='X';
 parsed=await state.engine.call('ParseSources',{documents:[...documentsFor(project),{name:'__syspresent_runtime_context.sysml',content:requirementCoverageSource(roots,runtimePackage)}]});
 const runtimeErrors=(parsed.diagnostics??[]).filter(d=>String(d.severity).toLowerCase().includes('error'));if(runtimeErrors.length)throw Error(runtimeErrors.map(d=>d.message).join('\n'));
 exported=await state.engine.call('ExportModel',{modelHash:parsed.modelHash});
 const coverage=requireNativeIdentity(adaptNativeView(await state.engine.call('RenderView',{modelHash:parsed.modelHash,view:runtimePackage+'::coverage',includeSemanticIdentity:true}),runtimePackage+'::coverage'));
 exported.elements=exported.elements.filter(e=>e.qualifiedName!==runtimePackage&&!e.qualifiedName?.startsWith(runtimePackage+'::'));

 const viewNames=exported.elements.filter(e=>e['@type']==='ViewUsage'&&e.qualifiedName&&e['sysx:sourceLine']).map(e=>e.qualifiedName);
 const views=new Map();for(const name of viewNames){const raw=await state.engine.call('RenderView',{modelHash:parsed.modelHash,view:name,includeSemanticIdentity:true});views.set(name,requireNativeIdentity(adaptNativeView(raw,name)));}
 const graph=modelGraph(exported.elements,[...views.values(),coverage]);
 for(const root of project.manifest.systemOfInterest)if(!graph.elements.some(e=>e.qualifiedName===root))throw Error('System of interest does not resolve: '+root);
 const scenes=parseStory(fileText(project,project.manifest.story));
 const byName=value=>graph.elements.find(e=>e.id===value||e.qualifiedName===value)?.id;
 for(const [sceneIndex,item] of scenes.entries()){if(item.journey?.length&&(byName(item.journey.at(-1))!==byName(item.focus)||(sceneIndex>0&&byName(item.journey[0])!==byName(scenes[sceneIndex-1].focus))))throw Error(`Scene ${item.id}: saved journey must connect the previous scene focus to this focus`);if(!views.has(item.view))throw Error(`Scene ${item.id}: native view ${item.view} does not resolve`);if(!byName(item.focus))throw Error(`Scene ${item.id}: focus ${item.focus} does not resolve`);for(let i=1;i<(item.journey??[]).length;i++){const from=byName(item.journey[i-1]),to=byName(item.journey[i]);if(!from||!to||!findEngineeringRoute(graph,{from,to,maxHops:1}).found)throw Error(`Scene ${item.id}: saved journey has a missing engineering connection`);}}
 for(let i=1;i<scenes.length;i++){const a=scenes[i-1],b=scenes[i],plan=planTransition({view:views.get(a.view),focus:byName(a.focus)},{view:views.get(b.view),focus:byName(b.focus)},{graph,scopeIds:graph.elements.filter(e=>project.manifest.systemOfInterest.some(root=>e.qualifiedName===root||e.qualifiedName?.startsWith(root+'::'))).map(e=>e.id)});if(plan.mode==='cross-kind'&&!plan.route.found)throw Error(`Scene ${b.id}: no engineering route from the previous scene within the presentation boundary`);}
 return {project,modelHash:parsed.modelHash,exported,graph,views,scenes,coverage};
}
function busy(value){for(const id of ['previous','next','scenes','standalone','return','fit','find-toggle','edit'])$(id).disabled=value;}
async function loadProject(project){
 const revision=++state.loadRevision;++state.revision;busy(true);status('Parsing project with OpenSysML WASM…');$('selection').hidden=true;
 let compiled;try{compiled=await compile(validateProject(project));}catch(error){if(revision===state.loadRevision){busy(false);$('previous').disabled=state.sceneIndex===0;$('next').disabled=state.sceneIndex===state.scenes.length-1;}throw error;}if(revision!==state.loadRevision)return;
 Object.assign(state,compiled,{sceneIndex:0,selected:null,exploring:false,expanded:new Set(),rects:new Map(),view:null,displayed:null,history:[],extraViews:new Map()});
 busy(false);updateLists();$('editor-error').textContent='';$('project-menu').open=false;
 if(state.scenes.length)await showScene(0,false);else {state.focus=resolve(project.manifest.systemOfInterest[0]);await explore(state.focus);}
 status(`OpenSysML WASM · ${state.graph.elements.length} native elements · ${state.views.size} views`);
 $('boundary').textContent=project.manifest.publication.scope==='scoped'?'Scoped publication · traversal stays within supplied model':'Complete project · standalone exploration available';
}
function updateLists(){
 $('scenes').replaceChildren();for(const [i,s]of state.scenes.entries()){const option=el('option',`${i+1}. ${s.title}`);option.value=i;$('scenes').append(option);}
 $('views').replaceChildren();for(const name of state.views.keys()){const option=el('option',name);option.value=name;$('views').append(option);}
 $('view-file').replaceChildren();for(const name of state.project.manifest.viewSources){const option=el('option',name);option.value=name;$('view-file').append(option);}
}
function panelGeometry(){
 const panel=$('narrative'),stage=$('stage');if(state.exploring||!scene()){panel.hidden=true;return [];}
 panel.hidden=false;panel.replaceChildren(el('div',`Scene ${state.sceneIndex+1} of ${state.scenes.length}`,'scene-count'),el('h2',scene().title),markdown(scene().markdown));
 const width=stage.clientWidth,height=stage.clientHeight,narrow=width<700,placement=narrow?'bottom':scene().panel?.placement??'right';
 panel.style.cssText='';panel.style.width=(narrow?width-24:Math.min(390,Math.max(280,width*.3)))+'px';
 if(placement==='bottom'){panel.style.width=width-24+'px';panel.style.left='12px';panel.style.bottom='58px';panel.style.maxHeight=(narrow?Math.max(140,height*.27):Math.max(140,height*.25))+'px';}
 else {panel.style.top='16px';panel.style[placement==='left'?'left':'right']='16px';panel.style.maxHeight=Math.max(140,height-90)+'px';}
 const a=panel.getBoundingClientRect(),b=stage.getBoundingClientRect();return [{id:'narrative',x:a.x-b.x,y:a.y-b.y,width:a.width,height:a.height}];
}
function sizeView(view){return {...view,nodes:view.nodes.map(n=>{const expanded=state.expanded.has(n.semanticId),detail=expanded?(element(n.semanticId)?.description||n.detail||'No statement or documentation recorded.'):n.kind==='requirement'?(n.detail??''):'';const lines=Math.max(1,Math.ceil(detail.length/32));return {...n,displayDetail:detail,height:detail?Math.max(n.height||0,58+lines*16):n.height};})};}
function cancelAnimations(){for(const a of state.animations)a.cancel();state.animations=[];}
function svgel(name,attrs={}){const e=document.createElementNS('http://www.w3.org/2000/svg',name);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;}
function edgePoints(a,b){const ac={x:a.x+a.width/2,y:a.y+a.height/2},bc={x:b.x+b.width/2,y:b.y+b.height/2};if(Math.abs(ac.y-bc.y)>Math.abs(ac.x-bc.x)*.5){const down=bc.y>ac.y,start={x:ac.x,y:down?a.y+a.height:a.y},end={x:bc.x,y:down?b.y:b.y+b.height},middle=(start.y+end.y)/2;return {d:`M${start.x},${start.y} L${start.x},${middle} L${end.x},${middle} L${end.x},${end.y}`,x:(start.x+end.x)/2,y:middle-5};}const right=bc.x>ac.x,start={x:right?a.x+a.width:a.x,y:ac.y},end={x:right?b.x:b.x+b.width,y:bc.y},middle=(start.x+end.x)/2;return {d:`M${start.x},${start.y} L${middle},${start.y} L${middle},${end.y} L${end.x},${end.y}`,x:middle+4,y:(start.y+end.y)/2-5};}
async function frame(view,caption='',duration=0){
 cancelAnimations();const stage=$('stage'),width=stage.clientWidth,height=stage.clientHeight,panels=panelGeometry();
 const layout=layoutScene(sizeView(view),{width,height,panels,padding:16,gap:24}),area=graphArea(width,height,panels),nodes=layout.nodes;
 const fitted=fitNodes(nodes,area),scale=fitted.scale,positioned=fitted.nodes,byID=new Map(positioned.map(n=>[n.id,n]));
 const svg=$('connections');svg.replaceChildren();svg.setAttribute('viewBox',`0 0 ${width} ${height}`);const defs=svgel('defs'),marker=svgel('marker',{id:'arrow',markerWidth:9,markerHeight:7,refX:8,refY:3.5,orient:'auto',markerUnits:'strokeWidth'});marker.append(svgel('path',{d:'M0,0 L8,3.5 L0,7',fill:'none',stroke:'#426869','stroke-width':1.4}));defs.append(marker);svg.append(defs);
 for(const e of layout.edges){const a=byID.get(e.source),b=byID.get(e.target);if(!a||!b)continue;const path=edgePoints(a,b),group=svgel('g',{'data-relationship':e.semanticId||e.id});const line=svgel('path',{d:path.d,fill:'none',stroke:'#426869','stroke-width':1.5,'marker-end':'url(#arrow)'});if(['satisfy','verify','dependency','derive','typing','specialization'].includes(e.kind))line.setAttribute('stroke-dasharray','5 3');group.append(line);if(e.label){const text=svgel('text',{x:path.x,y:path.y,'font-size':12,fill:'#355e60','paint-order':'stroke',stroke:'#f5f7f7','stroke-width':4});text.textContent=e.label;group.append(text);}svg.append(group);if(duration&&!state.reduce)state.animations.push(group.animate([{opacity:0},{opacity:1}],{duration,fill:'both'}));}
 const host=$('nodes');host.replaceChildren();const nextRects=new Map();
 for(const n of positioned){const children=nodes.some(c=>c.parentId===n.id),semantic=n.semanticId,node=el('button',undefined,`node ${n.kind}${children?' container':''}${semantic&&semantic===state.selected?' selected':''}`);node.type='button';node.dataset.representation=n.id;if(semantic)node.dataset.semanticId=semantic;
 node.setAttribute('aria-label',`${n.name||n.kind}: select ${n.kind}`);node.style.width=n.width/scale+'px';node.style.height=n.height/scale+'px';node.style.zIndex=String(children?0:3);node.style.transform=`translate(${n.x}px,${n.y}px) scale(${scale})`;
 const shortName=n.name?.includes('::')?n.name.split('::').at(-1):n.name;node.append(el('span',`«${n.kind}»${n.type?' : '+n.type:''}`,'kind'),el('span',shortName||n.kind,'name'));if(n.displayDetail&&!children)node.append(el('span',n.displayDetail,'detail'));
 node.onclick=event=>{event.stopPropagation();select(semantic,n);};node.oncontextmenu=event=>{event.preventDefault();select(semantic,n);};
 host.append(node);const key=semantic||`${view.id}:${n.id}`,old=state.rects.get(key);nextRects.set(key,{x:n.x,y:n.y,scale});
 if(duration&&!state.reduce){const from=old?`translate(${old.x}px,${old.y}px) scale(${old.scale})`:`translate(${n.x}px,${n.y}px) scale(${scale*.85})`;state.animations.push(node.animate([{transform:from,opacity:old?1:0},{transform:node.style.transform,opacity:1}],{duration,easing:'cubic-bezier(.2,.65,.25,1)',fill:'both'}));}
 }
 state.rects=nextRects;state.layout={...layout,displayNodes:positioned,scale,area};state.displayed=view;const omissions=view.omissions??[];$('context-details').hidden=!omissions.length;$('context-details').textContent=`Context (${omissions.length})`;$('transition').textContent=caption||`${view.kind} · ${nodes.length} elements`;
 if(duration&&!state.reduce)await Promise.all(state.animations.map(a=>a.finished.catch(()=>{})));
}
function gather(ids){const set=new Set(ids),elements=state.graph.elements.filter(e=>set.has(e.id));return graphView(state.graph,{elements,relationships:state.graph.relationships.filter(e=>set.has(e.source)&&set.has(e.target))},'General View journey');}
async function transitionTo(view,focus,{animate=true,journey,allowDisconnected=false}={}){
 const revision=++state.revision,previous=state.view;
 // Validate the route before committing focus or starting an animation.
 const plan=previous?planTransition({view:previous,focus:state.previousFocus},{view,focus},{graph:state.graph,scopeIds:state.exploring?undefined:scopeIds(),reducedMotion:state.reduce}):null;
 if(journey?.length>1&&plan?.route&&resolve(journey[0])===state.previousFocus&&resolve(journey.at(-1))===focus){const ids=journey.map(resolve);const routeEdges=[];for(let i=1;i<ids.length;i++){const route=findEngineeringRoute(state.graph,{from:ids[i-1],to:ids[i],scopeIds:scopeIds(),maxHops:1});if(!route.found)throw Error('Saved journey no longer resolves within the presentation boundary');routeEdges.push(...route.relationships);}plan.route={found:true,elements:ids.map(element),relationships:routeEdges};const stage=plan.stages.find(s=>s.kind==='gv-journey');if(stage){stage.route=routeEdges;stage.semanticIds=ids;}}
 const disconnected=plan?.mode==='cross-kind'&&plan.route?.found===false;
 if(disconnected&&!state.exploring&&!allowDisconnected)throw Error('No engineering route connects these viewpoints within the presentation system. Explore the model to open a disconnected viewpoint explicitly.');
 $('selection').hidden=true;state.transitioning=true;state.lastTransition=plan;
 try{if(animate&&plan&&!disconnected){for(const step of plan.stages){if(revision!==state.revision)return;const projected=step.viewKind==='gv'?gather(step.semanticIds):view;await frame(projected,step.kind==='gv-bridge'?'General View · leaving the current notation':step.kind==='gv-journey'?'General View · following engineering connections':step.kind==='gv-gather'?'General View · gathering destination features':step.kind==='morph'?'Arranging the destination view':'Rearranging within this notation',step.duration);}}
 if(revision!==state.revision)return;await frame(view,disconnected?'No engineering route · explicit view jump':'',disconnected&&!state.reduce?240:0);if(revision!==state.revision)return;state.view=view;state.focus=focus;state.previousFocus=focus;
 $('boundary').textContent=!scopeIds().includes(focus)?'Outside presentation boundary · loaded model context':state.project.manifest.publication.scope==='scoped'?'Scoped publication · supplied model context only':'Complete project · standalone exploration available';
 }finally{if(revision===state.revision)state.transitioning=false;}
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
 menu.append(button('Focus',()=>explore(id)),button(state.expanded.has(id)?'Collapse compartment':'Show statement / compartment',async()=>{if(state.expanded.has(id))state.expanded.delete(id);else state.expanded.add(id);await frame(state.view);select(id,node);}));
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
 $('fit').onclick=()=>frame(state.view).catch(report);$('reduce').setAttribute('aria-pressed',state.reduce);$('reduce').onclick=()=>{state.reduce=!state.reduce;$('reduce').setAttribute('aria-pressed',state.reduce);};$('find-toggle').onclick=()=>{$('find').hidden=!$('find').hidden;if(!$('find').hidden)$('search').focus();};
 $('search').oninput=()=>{const q=$('search').value.trim().toLowerCase();$('search-results').replaceChildren();if(!q)return;const hits=state.graph.elements.filter(e=>e.qualifiedName&&e.layer==='project'&&e.native.declaredName&&(e.name+' '+e.qualifiedName).toLowerCase().includes(q));for(const e of hits.slice(0,30))$('search-results').append(button(e.qualifiedName,async()=>{$('find').hidden=true;await explore(e.id);}));};
 $('open-view').onclick=async()=>{try{const view=state.views.get($('views').value);if(!view)return;const target=view.nodes.find(n=>n.semanticId)?.semanticId;state.exploring=true;$('return').hidden=!state.scenes.length;$('find').hidden=true;await transitionTo(view,target);}catch(e){report(e);}};
 $('context-details').onclick=()=>{const omissions=state.displayed?.omissions??[];$('information-text').textContent=omissions.map(o=>`${['unavailable','outside-scope','metamodel-boundary'].includes(o.reason)?'Unavailable / boundary':'Hidden by view policy'}: ${o.reason} · ${label(o.target)} (${o.target})`).join('\n')+'\n\nCoverage: part composition, dependencies and direct types come from the native API. Other engineering links come from native requirement and declared views. Unprojected relationship kinds may be unavailable.';$('information').showModal();};
 $('edit').onclick=openEditor;$('view-file').onchange=()=>{$('view-source').value=fileText(state.project,$('view-file').value);};
 $('save-scene').onclick=async()=>{try{if(!scene())throw Error('Capture a first scene before editing it');scene().title=$('scene-title').value;scene().markdown=$('scene-prose').value;scene().panel={placement:$('panel-placement').value};state.project.files[state.project.manifest.story]=writeStory(state.project.manifest.title,state.scenes);updateLists();$('editor').close();await showScene(state.sceneIndex,false);}catch(e){report(e);}};
 $('capture-scene').onclick=()=>capture().catch(report);$('apply-views').onclick=async()=>{try{const project=structuredClone(state.project);project.files[$('view-file').value]=$('view-source').value;await loadProject(project);$('editor').close();}catch(e){report(e);}};
 $('import-project').onclick=()=>{$('project-file').click();};$('project-file').onchange=async()=>{try{const file=$('project-file').files[0];if(file)await loadProject(unpackProject(new Uint8Array(await file.arrayBuffer())));}catch(e){report(e);}finally{$('project-file').value='';}};
 $('import-markdown').onclick=()=>{$('markdown-file').click();};$('markdown-file').onchange=async()=>{try{const file=$('markdown-file').files[0];if(file){const project=structuredClone(state.project);project.files[project.manifest.story]=await file.text();await loadProject(project);}}catch(e){report(e);}finally{$('markdown-file').value='';}};
 $('export-project').onclick=()=>{try{download('syspresent-project.zip',packProject(state.project),'application/zip');$('project-menu').open=false;}catch(e){report(e);}};$('export-markdown').onclick=()=>{download('story.md',fileText(state.project,state.project.manifest.story),'text/markdown');$('project-menu').open=false;};$('load-example').onclick=()=>exampleProject().then(loadProject).catch(report);
 $('about').onclick=()=>{$('information-text').textContent=JSON.stringify({engine:state.provenance,project:state.project.manifest,modelHash:state.modelHash,graph:{elements:state.graph.elements.length,relationships:state.graph.relationships.length},view:state.view.id,lastTransition:state.lastTransition,notice:state.exported.notice},null,2);$('information').showModal();};
 $('stage').onclick=e=>{if(e.target===$('stage')||e.target===$('nodes'))$('selection').hidden=true;};
 let resize;new ResizeObserver(()=>{clearTimeout(resize);resize=setTimeout(()=>{if(state.view&&!state.transitioning)frame(state.view).catch(report);},100);}).observe($('stage'));
}
async function start(){bind();busy(true);state.engine=createSemanticEngine({assetBase:new URL('./engine/',location.href),workerURL:new URL('./engine/worker.js',location.href)});const [project,info]=await Promise.all([exampleProject(),state.engine.ready]);state.provenance=await fetch('./engine/provenance.json').then(r=>r.ok?r.json():info);await loadProject(project);}
start().catch(report);
