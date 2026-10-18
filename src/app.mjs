import {ModelStore} from './model_store.mjs';
import {initialState, context, Navigation, shareState, restoreState} from './exploration.mjs';
import {renderView} from './renderer.mjs';
const $ = id => document.getElementById(id);
const el = (tag, text, cls) => { const node=document.createElement(tag); if(text!==undefined) node.textContent=text; if(cls)node.className=cls; return node; };
const button=(text,fn)=>{const b=el('button',text);b.type='button';b.addEventListener('click',fn);return b;};
const say=text=>{$('notice').textContent=text;$('explorer-notice').textContent=text;};
function safeURL(value, local=false){try{const u=new URL(value,location.href);return (local ? u.origin===location.origin && !String(value).includes('..') : ['http:','https:','mailto:'].includes(u.protocol))?u.href:null;}catch{return null;}}
function inline(parent,text){
  const re=/(\[([^\]]+)\]\(([^\s)]+)\)|\*\*([^*]+)\*\*|`([^`]+)`|\*([^*]+)\*)/g;let start=0;
  for(const m of text.matchAll(re)){parent.append(document.createTextNode(text.slice(start,m.index)));let n;
    if(m[2]){let target=null;if(m[3].startsWith('model:')){try{const id=decodeURIComponent(m[3].slice(6));if(story?.modelLinks?.some(link=>link.target===id))target=id;}catch{}}if(target){n=button(m[2],()=>choose(target));n.className='model-link';n.title='Inspect model element';}else{const href=safeURL(m[3]);n=el(href?'a':'span',m[2]);if(href){n.href=href;n.rel='noopener';}}}
    else n=el(m[4]?'strong':m[5]?'code':'em',m[4]??m[5]??m[6]);parent.append(n);start=m.index+m[0].length;}
  parent.append(document.createTextNode(text.slice(start)));
}
function markdown(text){const box=el('div',undefined,'prose');let para=[],list=null,code=null,fence=null;
  const flush=()=>{if(para.length){const p=el('p');inline(p,para.join(' '));box.append(p);para=[];}list=null;};
  for(const line of text.split('\n')){const marker=/^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);if(code){if(marker&&marker[1][0]===fence.char&&marker[1].length>=fence.length&&!marker[2].trim()){box.append(code);code=null;fence=null;}else code.append(document.createTextNode(line+'\n'));continue;}if(marker){flush();code=el('pre');fence={char:marker[1][0],length:marker[1].length};continue;}
    const heading=/^(#{1,6})\s+(.+)$/.exec(line),item=/^\s*(?:[-*]|\d+\.)\s+(.+)$/.exec(line);
    if(heading){flush();const h=el('h'+heading[1].length);inline(h,heading[2]);box.append(h);}
    else if(item){if(para.length)flush();if(!list){list=el(/^\s*\d/.test(line)?'ol':'ul');box.append(list);}const li=el('li');inline(li,item[1]);list.append(li);}
    else if(!line.trim())flush();else if(line.startsWith('> ')){flush();const q=el('blockquote');inline(q,line.slice(2));box.append(q);}else para.push(line);}
  flush();if(code)box.append(code);return box;
}
// Quoted CSV cells, embedded commas/newlines and doubled quotes remain data.
function csv(text){const rows=[];let row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(!quoted&&(c===','||c==='\n')){row.push(cell.replace(/\r$/,''));cell='';if(c==='\n'){rows.push(row);row=[];}}else cell+=c;}if(quoted)throw Error('Unclosed quoted CSV cell');if(cell||row.length){row.push(cell);rows.push(row);}return rows;}
async function json(path){const r=await fetch(path);if(!r.ok)throw Error(`${path}: HTTP ${r.status}`);return r.json();}
let store,bundle,story,manifest,nav,activeStop,selected,paused=false,savedStory=null,renderSerial=0,resetAuthoredFrame=false;
const stops=new Map(),views=new Map(),elements=new Map(),inlineScenes=new Map();
const label=id=>elements.get(id)?.name||elements.get(id)?.qualifiedName||id;
function pause(){if($('explorer-disclosure'))$('explorer-disclosure').open=true;if(!paused){savedStory={stop:activeStop?.id,scroll:window.scrollY};paused=true;}$('resume').hidden=false;$('scene-status').textContent='Explore freely. Back to story restores your reading position.';}
const modeEnabled=mode=>(bundle.configuration?.modes??['relationships','native-views']).includes(mode);
function authoredOptions(stop){return {annotations:stop?.annotations,placements:stop?.placements,camera:stop?.camera,presentationPreferences:stop?.presentationPreferences};}
function canonical(value){if(Array.isArray(value))return value.map(canonical);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>[key,canonical(value[key])]));return value;}
function isAuthoredInspection(state,stop=activeStop){return state.view===stop?.view && !!state.sceneOptions && JSON.stringify(canonical(state.sceneOptions))===JSON.stringify(canonical(authoredOptions(stop)));}
function explorationAllowed(state,stop=activeStop){return state.view ? modeEnabled('native-views') || isAuthoredInspection(state,stop) : modeEnabled('relationships');}
function update(patch){if(!explorationAllowed({...nav.state,...patch,sceneOptions:null})){say('This exploration mode is disabled in this snapshot.');return;}pause();nav.update({...patch,sceneOptions:null});if($('mobile-explorer').open)setMobilePanel('model');if(Object.hasOwn(patch,'focus'))selected=patch.focus;draw();}
function choose(id){if(!elements.has(id)){say('This semantic target is not exported in this snapshot.');return;}selected=id;pause();openMobile('model');const revision=panelRevision;draw().then(()=>{if($('mobile-explorer').open&&selected===id&&revision===panelRevision){setMobilePanel('details');const heading=$('details').querySelector('h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}});}
function sourceBlock(parent,title,value){if(value===undefined||value===null)return;const section=el('details');section.append(el('summary',title),el('pre',typeof value==='string'?value:JSON.stringify(value,null,2)));parent.append(section);}
function details(){const box=$('details');box.replaceChildren();const e=elements.get(selected);if(!e)return;
  box.append(el('h3',label(e.id)),el('p',`${e.kind||'Element'} · ${e.ownership||e.owner||e.origin?.ownership||'Ownership not declared'}`));
  if(e.description)box.append(markdown(e.description));
  const controls=el('div',undefined,'controls');controls.append(button('Focus',()=>update({focus:e.id,view:null})),button(nav.state.pinned.includes(e.id)?'Unpin':'Pin',()=>update({pinned:nav.state.pinned.includes(e.id)?nav.state.pinned.filter(x=>x!==e.id):[...nav.state.pinned,e.id],view:null})),button('Expand neighbors',()=>update({expanded:[...new Set([...nav.state.expanded,e.id])],view:null})),button('Collapse expansion',()=>update({expanded:nav.state.expanded.filter(x=>x!==e.id),view:null})));if(modeEnabled('relationships'))box.append(controls);
  const fields={source:['Source',e.source??e.origin],evidence:['Related evidence',e.evidence??e.evidenceRefs],verification:['Verification',e.verification??e.verdict]};const configured=(bundle.configuration?.detailFieldOrder??bundle.configuration?.detailFields??['source','evidence','verification']).filter(key=>Object.hasOwn(fields,key));for(const key of [...new Set([...configured,...Object.keys(fields)])]){const [title,value]=fields[key];sourceBlock(box,title,value);}
  const nativeRows=[];const nativeVerdicts=[];for(const v of bundle.views){for(const [row,id] of Object.entries(v.rowToElement??{})){if(id===e.id)nativeRows.push({query:v.query?.id??v.id,columns:v.native.columns,cells:v.native.rows[Number(row)]?.cells});}for(const n of v.native.nodes??[]){if(v.nodeToElement?.[n.id]===e.id&&n.verdict)nativeVerdicts.push({view:v.id,verdict:n.verdict});}}
  if(nativeRows.length)sourceBlock(box,'Native review records — evidence, actions and dispositions',nativeRows);
  if(nativeVerdicts.length)sourceBlock(box,'Native verification verdicts',nativeVerdicts);
  box.append(el('p','Satisfaction expresses a modeled claim. A verification verdict or accepted evidence must be identified separately.'));
  const related=bundle.relationships.filter(r=>r.source===e.id||r.target===e.id);const list=el('ul');const advanced=el('details');advanced.append(el('summary',`Native model properties (${related.filter(r=>r.authority!=='native-render-view').length})`));const rawList=el('ul');const relationGroups=new Map();for(const r of related){const other=r.source===e.id?r.target:r.source;const li=el('li',`${r.source===e.id?'Outgoing':'Incoming'} ${r.kind}: ${r.label||''} `);li.append(button(label(other),()=>{if(elements.has(other)){if(modeEnabled('relationships'))update({focus:other,view:null});else choose(other);}else say('Target unavailable in this export.');}));const destination=r.authority==='native-render-view'?list:rawList;if(bundle.configuration?.grouping==='relationshipType'){const key=(destination===list?'view:':'raw:')+r.kind;if(!relationGroups.has(key)){const group=el('li'),heading=el('strong',r.kind),items=el('ul');group.append(heading,items);destination.append(group);relationGroups.set(key,items);}relationGroups.get(key).append(li);}else destination.append(li);}advanced.append(rawList);box.append(list,advanced);
  const viewButtons=el('div',undefined,'controls');for(const v of bundle.views.filter(v=>(bundle.configuration?.modes??['native-views']).includes('native-views')&&v.elementIds?.includes(e.id)))viewButtons.append(button(v.title||v.name||v.id,()=>update({view:v.id})));box.append(el('h4','Relevant native views'),viewButtons);
}
function filters(){for(const [host,field,items] of [['node-filters','nodeTypes',bundle.elements],['edge-filters','relationshipTypes',bundle.relationships]]){const target=$(host);for(const kind of [...new Set(bundle.modelStore?.[field==='nodeTypes'?'elementKinds':'relationshipKinds']??items.map(x=>x.kind).filter(Boolean))].sort()){const l=el('label'),input=el('input');input.type='checkbox';input.value=kind;input.dataset.filter=field;input.addEventListener('change',()=>update({[field]:[...target.querySelectorAll('input:checked')].map(x=>x.value),view:null}));l.append(input,document.createTextNode(kind));target.append(l);}}}
function configureNavigation(){const config=bundle.configuration??{};const relationships=modeEnabled('relationships');$('explore').hidden=!relationships;$('reset').hidden=!relationships;$('node-filters').closest('details').hidden=!relationships;const entries=config.entryPoints??[];if(entries.length){const field=el('label','Explore from '),select=el('select'),placeholder=el('option','Choose an entry point');placeholder.value='';select.append(placeholder);entries.forEach((entry,index)=>{if(entry.view?!modeEnabled('native-views'):!relationships)return;const option=el('option',entry.label||label(entry.id));option.value=String(index);select.append(option);});select.onchange=()=>{if(select.value==='')return;const entry=entries[Number(select.value)];if(entry)update({focus:entry.id,view:entry.view??null});};if(select.options.length>1){field.append(select);$('entry-points').append(field);}}}

const genericCache=new Map();
function genericView(c){const cacheKey=JSON.stringify([c.elements.map(e=>e.id),c.relationships.map(e=>e.id)]);if(genericCache.has(cacheKey))return genericCache.get(cacheKey);const value= {id:'exploration',title:'Exported relationship context',elementIds:c.elements.map(e=>e.id),native:{kind:'tree',form:'mermaid',nodes:c.elements.map(e=>({id:e.id,semanticId:e.id,name:e.name||e.qualifiedName,kind:e.kind||'element',type:'',detail:e.owner||'',fqn:e.qualifiedName})),edges:c.relationships.map(e=>({...e,from:e.source,to:e.target,label:e.label||'',kind:e.kind})),notices:['Generic relationship context; select a native behavioral view to inspect behavioral notation.']}};genericCache.set(cacheKey,value);if(genericCache.size>40)genericCache.delete(genericCache.keys().next().value);return value;}
async function display(container,view,options={}){const mount=el('div');container.replaceChildren(mount);try{await renderView(mount,view,{selectedId:selected,onSelect:choose,onInteract:()=>{if($('mobile-explorer').open)pause();},compactControls:true,allowExpand:false,...options,presentationPreferences:{...bundle.configuration?.presentationPreferences,...options.presentationPreferences}});}catch(e){mount.replaceChildren(el('p',`View unavailable: ${e.message}. This is a rendering gap, not evidence that the model has no content.`));}}
async function draw(){const serial=++renderSerial,state=nav.state;const activeBefore=document.activeElement;const modelHadFocus=$('canvas').contains(activeBefore)||$('details').contains(activeBefore);let view,options={};
  if(store){try{const result=await store.ensureNeighborhood([state.focus,...state.expanded,...state.pinned,selected].filter(Boolean));if(serial!==renderSerial)return;for(const e of bundle.elements)elements.set(e.id,e);if(result.unavailable.length)say(`${result.unavailable.length} requested model targets are unavailable in this snapshot.`);if(!bundle.elements.some(e=>e.id===state.focus)){$('canvas').replaceChildren(el('p','The requested focus is not present in this frozen model export.'));return;}}catch(error){if(serial!==renderSerial)return;say('Model context could not be loaded: '+error.message);$('canvas').replaceChildren(el('p','Context unavailable. A failed model load does not mean relationships are absent.'));return;}}

  if(!paused&&activeStop){view=views.get(activeStop.view);options=authoredOptions(activeStop);$('scene-title').textContent=activeStop.title;}
  else {view=views.get(state.view);options=state.sceneOptions||{};$('scene-title').textContent=view?.title||view?.name||view?.id||'Explore exported relationships';}
  $('explorer-title').textContent=$('scene-title').textContent;
  $('back').disabled=nav.position===0;$('forward').disabled=nav.position===nav.entries.length-1;$('budget').value=state.budget;
  for(const input of document.querySelectorAll('[data-filter]'))input.checked=state[input.dataset.filter].includes(input.value);
  const c=context(bundle,state),hidden=$('omissions');hidden.replaceChildren(el('p',`${c.elements.length} elements shown in local context; ${c.omissions.length} omitted neighbor entries. Filters and context limit do not remove model relationships.`));
  if(bundle.coverage?.notice)hidden.prepend(el('p',bundle.coverage.notice));for(const omission of c.omissions){const row=el('div',`${label(omission.target)} · ${omission.reason} `,'omission');if(elements.has(omission.target))row.append(button('Focus this target',()=>update({focus:omission.target,view:null})));hidden.append(row);}
  if(!view&&paused&&modeEnabled('relationships'))view=genericView(c);
  if(view){options.resetFrame=resetAuthoredFrame;resetAuthoredFrame=false;await display($('canvas'),view,options);}else if(!view) $('canvas').replaceChildren(el('p','This story stop has no authored model view.'));
  if(serial!==renderSerial)return;
  $('annotations').replaceChildren();for(const a of (!paused?activeStop?.annotations:[])||[]){const n=el('div',undefined,'annotation');n.append(button(label(a.target),()=>choose(a.target)),document.createTextNode(' '+a.text));$('annotations').append(n);}
  if(!paused)$('scene-status').textContent=`Authored scene · ${view?.native?.kind||view?.kind||'prose'} · ${view?.elementIds?.length??0} model elements. ${view?.behaviorEvidence==='model-query'?'Native model query; not physical verification.':'Modeled possibilities; no execution record.'}`;
  $('view-info').textContent=paused?'Exploration of the frozen model. Modeled relationships do not establish physical verification.':$('scene-status').textContent;
  details();if(modelHadFocus&&(document.activeElement===activeBefore||document.activeElement===document.body)){const heading=$('details').querySelector('h3');if(heading){heading.tabIndex=-1;heading.focus();}}
}
const mobileLayout=()=>window.matchMedia?.('(max-width: 720px)').matches??false;
let mobilePanel='model',returnFocus=null,panelRevision=0;
function setMobilePanel(name){
 mobilePanel=name;panelRevision++;
 for(const key of ['model','details','find','filters']){
  const panel=$('panel-'+key),tab=$('tab-'+key),active=key===name;
  panel.hidden=$('mobile-explorer').open&&!active;
  if(tab){tab.setAttribute('aria-selected',String(active));tab.tabIndex=active?0:-1;}
 }
 if(name==='model')$('canvas').querySelector('.native-view')?.restoreFrame?.();
}
function openMobile(panel='model'){
 const dialog=$('mobile-explorer');
 if(!dialog.open){
  returnFocus=document.activeElement;$('explorer-notice').textContent='';
  $('mobile-host').append($('inspector'));
  dialog.showModal();document.body.classList.add('explorer-open');
  $('return-story').focus();
 }
 setMobilePanel(panel);
}
function closeMobile(){
 const dialog=$('mobile-explorer');
 if(dialog.open)dialog.close();
 document.body.classList.remove('explorer-open');
 $('explorer-disclosure').append($('inspector'));
 for(const key of ['model','details','find','filters'])$('panel-'+key).hidden=false;
}
async function resumeStory(){
 const saved=savedStory,id=saved?.stop||activeStop.id,focus=returnFocus;
 closeMobile();paused=false;$('resume').hidden=true;
 activate(id);dockExplorer();await displayInline(id,true);
 focus?.focus({preventScroll:true});
 window.scrollTo({top:saved?.scroll||0,behavior:'instant'});
}
function dockExplorer(){
 const disclosure=$('explorer-disclosure');if(!disclosure)return;if($('mobile-explorer').open)return;
 if(mobileLayout()){
  document.querySelector('.workspace').append(disclosure);
  if(!paused)disclosure.open=false;
 }else{
  if($('mobile-explorer').open)return;
  for(const key of ['model','details','find','filters'])$('panel-'+key).hidden=false;
  const band=activeStop&&$(activeStop.id)?.closest('.reading-band');
  (band||document.querySelector('.reading-band')||document.querySelector('.workspace')).append(disclosure);disclosure.open=true;
 }
}
function activate(id,scroll=false){const stop=stops.get(id);if(!stop)return;if(paused&&!scroll)return;activeStop=stop;resetAuthoredFrame=true;selected=stop.focus||stop.modelRefs?.[0]||selected;nav=new Navigation({...initialState(selected||bundle.elements[0]?.id,(bundle.configuration||bundle.config)),view:stop.view||null,sceneOptions:authoredOptions(stop)});for(const a of $('outline').querySelectorAll('a'))a.setAttribute('aria-current',String(a.dataset.stop===id));dockExplorer();if(scroll)$(id).scrollIntoView({behavior:'instant',block:'start'});draw();}
// Inline scenes own their story anchor even when another scene was being explored.
function exploreStop(id, target){const reading=window.scrollY;paused=false;activate(id);pause();savedStory={stop:id,scroll:reading};if(target&&elements.has(target))selected=target;openMobile('model');const revision=panelRevision;draw().then(()=>{if(target&&$('mobile-explorer').open&&selected===target&&revision===panelRevision){setMobilePanel('details');const heading=$('details').querySelector('h3');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}}});}
async function restoreLocation(){
  if(!location.hash)return;closeMobile();
  try{
    if(location.hash.startsWith('#state=')){
      const requestedHash=location.hash;const shared=restoreState(requestedHash,manifest.snapshotId,bundle);if(shared.unresolvedElementIds?.length){if(!store)throw Error('Model shard loader unavailable');const result=await store.ensureNeighborhood(shared.unresolvedElementIds);if(location.hash!==requestedHash)return;if(result.unavailable.length)throw Error('Shared context contains targets unavailable in this snapshot');for(const e of bundle.elements)elements.set(e.id,e);}
      const id=shared.stop||story.stops[0];if(!stops.has(id))throw Error('Unknown story stop');if(shared.exploration&&!explorationAllowed(shared.exploration,stops.get(id)))throw Error('Shared exploration mode is disabled in this snapshot');
      paused=false;$('resume').hidden=true;activate(id,true);
      if(shared.exploration){pause();nav=new Navigation(shared.exploration);selected=shared.exploration.focus;openMobile();draw();}
    }else{
      const id=decodeURIComponent(location.hash.slice(1));if(!stops.has(id))throw Error('Unknown story stop');
      paused=false;$('resume').hidden=true;activate(id,true);
    }
  }catch(e){say('Link position not restored: '+e.message);}
}
async function evidence(block){const fig=el('figure',undefined,block.fullWidth?'evidence evidence-wide':'evidence');fig.id=block.id;fig.append(el('h3',block.title));const path=safeURL((story.assetBase||'./assets/')+block.asset,true);if(!path)throw Error('Unsafe prepared asset path');
  if(block.type==='figure'){const img=el('img');img.src=path;img.alt=block.alt;img.loading='lazy';fig.append(img);}else {try{const response=await fetch(path);if(!response.ok)throw Error(`HTTP ${response.status}`);let rows;if(block.asset.endsWith('.csv'))rows=csv(await response.text());else if(block.asset.endsWith('.json')){const data=await response.json();rows=Array.isArray(data)?data:[data.columns,...data.rows];}else throw Error('Supported table formats are JSON rows and CSV');if(!Array.isArray(rows)||!rows.every(Array.isArray))throw Error('Table requires rows of cells');const table=el('table');rows.forEach((row,i)=>{const tr=el('tr');for(const cell of row)tr.append(el(i===0?'th':'td',typeof cell==='object'?JSON.stringify(cell):String(cell??'')));table.append(tr);});fig.append(table);}catch(e){fig.append(el('p','Prepared table unavailable: '+e.message));}}
  fig.append(el('figcaption',block.caption));
  const metadata=el('section',undefined,'evidence-metadata');
  const classification=block.evidence?.classification;
  const classificationLabel=classification==='recorded-execution'?'Recorded execution':classification==='prepared-analysis'?'Prepared analysis':'Unclassified evidence';
  metadata.append(el('strong',classificationLabel,'evidence-classification'));
  if(block.evidence){const record=block.evidence;const fields=el('dl');for(const [title,value] of [['Source',record.source],['Run ID',record.runId],['Configuration',record.configuration]]){if(value!==undefined)fields.append(el('dt',title),el('dd',value));}metadata.append(fields,el('h4','Inputs'),el('pre',JSON.stringify(record.inputs,null,2)));}
  else metadata.append(el('p','No execution or analysis classification was supplied.'));
  fig.append(metadata,el('p',`Source: ${block.provenance.source} · Context: ${block.provenance.context}`,'provenance'));return fig;}
async function displayInline(id,resetFrame=false){const scene=inlineScenes.get(id);if(!scene)return;const {canvas,stop}=scene;await display(canvas,views.get(stop.view),{selectedId:stop.focus,...authoredOptions(stop),frameScope:`inline:${stop.id}`,resetFrame,fitInitial:true,onInteract:()=>{if(mobileLayout())return;if(activeStop?.id!==id){const reading=window.scrollY;paused=false;activate(id);pause();savedStory={stop:id,scroll:reading};}else pause();},onSelect:target=>exploreStop(id,target)});}
async function buildStory(){const main=$('story');inlineScenes.clear();main.replaceChildren();let copy;const newBand=()=>{const band=el('div',undefined,'reading-band');copy=el('div',undefined,'reading-copy');band.append(copy);main.append(band);};newBand();for(const block of story.blocks){if(block.type==='markdown'){copy.append(markdown(block.text));continue;}if(block.type==='stop'){stops.set(block.id,block);const section=el('section',undefined,'stop');section.id=block.id;section.append(el('p',`Stop ${stops.size}`,'eyebrow'),el('h2',block.title));const link=el('a',block.title);link.href='#'+block.id;link.dataset.stop=block.id;link.onclick=e=>{e.preventDefault();paused=false;$('resume').hidden=true;history.pushState(null,'','#'+encodeURIComponent(block.id));activate(block.id,true);};$('outline').append(link);
      if(block.view){const inlineView=el('div',undefined,'inline-view'),canvas=el('div',undefined,'inline-canvas');inlineView.append(canvas,button('Explore this view',()=>{exploreStop(block.id);if(!$('mobile-explorer').open)$('inspector').scrollIntoView();}));section.append(inlineView);inlineScenes.set(block.id,{canvas,stop:block});await displayInline(block.id);}copy.append(section);
    }else if(['figure','table'].includes(block.type)){const prepared=await evidence(block);if(block.fullWidth){main.append(prepared);newBand();}else copy.append(prepared);}else if(block.type==='closing'){const section=el('section',undefined,'closing');section.id=block.id;section.append(el('h2',block.title));const dl=el('dl');for(const [key,title] of [['supports','What the evidence supports'],['open','What remains open'],['next','Next action or decision']])dl.append(el('dt',title),el('dd',block[key]));section.append(dl);copy.append(section);}}
}
async function start(){[bundle,story,manifest]=await Promise.all([json('./bundle.json'),json('./story.json'),json('./manifest.json')]);if(typeof manifest.snapshotId!=='string'||!manifest.snapshotId)throw Error('Snapshot identity missing');if(bundle.schemaVersion!=='syspresent.bundle.v1'||story.schemaVersion!=='syspresent.story.v1')throw Error('Unsupported snapshot schema');bundle.elements=Array.isArray(bundle.elements)?bundle.elements:Object.values(bundle.elements);bundle.views=Array.isArray(bundle.views)?bundle.views:Object.values(bundle.views);bundle.relationships??=[];if(!bundle.elements.length&&!bundle.searchIndex?.length)throw Error('No exported semantic elements');store=bundle.modelStore?new ModelStore(bundle):null;for(const e of [...(bundle.searchIndex??[]),...bundle.elements])elements.set(e.id,e);for(const v of bundle.views)views.set(v.id,v);const title=story.title||bundle.configuration?.title||'Engineering review';$('snapshot').textContent=`${title} · Lifecycle status unavailable · ${manifest.snapshotId}`;document.title=title+' · Syspresent';fetch('../../catalog.json').then(r=>{if(!r.ok)throw Error('Catalog unavailable');return r.json();}).then(catalog=>{const items=catalog.reviews||catalog.snapshots||catalog.entries||catalog;const entry=Array.isArray(items)?items.find(e=>e.snapshotId===manifest.snapshotId):items[manifest.snapshotId];if(entry){$('snapshot').textContent=`${title} · ${entry.status||'Status unspecified'} · ${manifest.snapshotId}`;if(entry.reason)say(entry.reason);const replacement=Array.isArray(items)?items.find(e=>e.reviewId===entry.replacementReviewId):null;if(replacement){const link=el('a','Open replacement review');link.href=`../${encodeURIComponent(replacement.snapshotId)}/`;$('snapshot').append(document.createTextNode(' · '),link);}}}).catch(()=>{});selected=bundle.configuration?.entryPoint??bundle.elements[0]?.id??bundle.searchIndex[0].id;nav=new Navigation(initialState(selected,(bundle.configuration||bundle.config)));filters();configureNavigation();await buildStory();activate(story.stops[0]);
  restoreLocation();window.addEventListener('hashchange',restoreLocation);window.matchMedia?.('(max-width: 720px)').addEventListener('change',dockExplorer);
  let scheduled=false;window.addEventListener('scroll',()=>{if(paused||scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;let current=story.stops[0];for(const id of story.stops){if($(id).getBoundingClientRect().top<innerHeight*.32)current=id;}if(current!==activeStop?.id)activate(current);});},{passive:true});
  bindNavigationControls();
}
function bindNavigationControls(){
  $('open-explorer').onclick=()=>exploreStop(activeStop.id);
  $('resume').onclick=resumeStory;
  $('return-story').onclick=resumeStory;
  $('mobile-explorer').addEventListener('cancel',event=>{event.preventDefault();resumeStory();});
  const names={model:'Model',details:'Details',find:'Find',filters:'Filters'};
  for(const [key,title] of Object.entries(names)){
   const tab=button(title,()=>setMobilePanel(key));tab.id='tab-'+key;tab.setAttribute('role','tab');tab.setAttribute('aria-controls','panel-'+key);
   $('panel-'+key).setAttribute('aria-labelledby',tab.id);
   tab.onkeydown=event=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;event.preventDefault();const keys=Object.keys(names),i=keys.indexOf(key),next=event.key==='Home'?0:event.key==='End'?3:(i+(event.key==='ArrowRight'?1:3))%4;setMobilePanel(keys[next]);$('tab-'+keys[next]).focus();};
   $('mobile-tabs').append(tab);
  }
  setMobilePanel('model');
  $('explore').onclick=()=>update({view:null});$('back').onclick=()=>{pause();nav.back();selected=nav.state.focus;draw();};$('forward').onclick=()=>{pause();nav.forward();selected=nav.state.focus;draw();};$('reset').onclick=()=>update({...initialState(activeStop?.focus||bundle.elements[0]?.id||bundle.searchIndex?.[0]?.id,(bundle.configuration||bundle.config)),view:null});$('relayout').onclick=()=>{pause();resetAuthoredFrame=true;nav.update({sceneOptions:!modeEnabled('native-views')&&isAuthoredInspection(nav.state)?authoredOptions(activeStop):null});draw();};$('budget').onchange=()=>{const value=Number($('budget').value);if(Number.isInteger(value)&&value>=1&&value<=1000)update({budget:value,view:null});else say('Context limit must be an integer from 1 to 1000.');};
  $('search').oninput=()=>{const q=$('search').value.toLowerCase().trim();$('search-results').replaceChildren();if(!q)return;const hits=(bundle.searchIndex??bundle.elements).filter(e=>[e.name,e.qualifiedName,e.kind].join(' ').toLowerCase().includes(q));$('search-results').append(el('p',`${hits.length} matches; first 40 listed.`));for(const e of hits.slice(0,40))$('search-results').append(button(`${label(e.id)} · ${e.kind||''}`,()=>{if(modeEnabled('relationships'))update({focus:e.id,view:null});else choose(e.id);}));};
  $('share').onclick=$('share-exploration').onclick=async()=>{const hash=shareState(manifest.snapshotId,activeStop?.id,paused?nav.state:null);history.replaceState(null,'',hash);try{await navigator.clipboard.writeText(location.href);say('Snapshot link copied.');}catch{say('Shareable state is now in the address bar. Copy the URL to share.');}};
}
start().catch(e=>{$('story').replaceChildren(el('h1','Snapshot could not be opened'),el('p',e.message));say('The viewer cannot claim this snapshot is valid.');});
