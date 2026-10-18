import {drawCanvas} from '@opensysml/canvas';
import {layoutCanvas} from '@opensysml/layout';
import {autoLayout} from '@opensysml/autolayout';
import {tableOf} from '@opensysml/table';

const supported = new Set(['tree','interconnection','state','action','sequence','requirement','definition','package','case','mixed','fault-tree','table','matrix']);
let serial = 0;

function camel(value) {
  if (Array.isArray(value)) return value.map(camel);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([,v])=>v!==null).map(([key,v])=>[key.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()),camel(v)]));
  return value;
}

/** Wire spelling adapter only. Native nodes, ordering, kinds and relationships stay authoritative. */
export function canvasPayload(native) {
  const result=camel(native);
  result.nodes=(result.nodes??[]).map(node=>{
    const result={...node,name:node.name??'',type:node.type??'',detail:node.detail??''};
    if(node.geometry){
      Object.assign(result,{x:node.geometry.x,y:node.geometry.y,collapsed:node.geometry.collapsed});
      if(node.geometry.hasSize) Object.assign(result,{width:node.geometry.width,height:node.geometry.height});
    }
    if(!result.parent) delete result.parent;
    return result;
  });
  result.edges=(result.edges??[]).map(edge=>({...edge,from:edge.from??edge.fromId,to:edge.to??edge.toId,label:edge.label??''}));
  result.notices??=[];
  return result;
}

function message(container,text) {
  const p=document.createElement('p');p.className='render-notice';p.textContent=text;container.append(p);
}

const structuralKinds = new Set(['tree','interconnection','requirement','definition','package','case','mixed']);
const layoutOnlyTreeKinds = new Set(['requirement','definition','package','case','mixed']);
const layouts = new WeakMap();
const frames = new WeakMap();

/** Only optional structural compartments are elided; behavioral labels stay intact. */
export function presentationPayload(native, showCompartments = true) {
  const result = canvasPayload(native);
  if (!showCompartments && structuralKinds.has(result.kind)) {
    result.shown = (result.shown ?? ['keywords','typings','compartments','qualifiers']).filter(item => item !== 'compartments');
  }
  return result;
}
const generalTargetKinds = new Set(['typing','specialization','derive']);
/** Layout constraints run general→specific; drawing retains native specific→general arrows. */
export function layoutPayload(native) {
  if(native.kind!=='tree'&&!layoutOnlyTreeKinds.has(native.kind))return native;
  return {...native,kind:'tree',edges:(native.edges??[]).map(edge=>generalTargetKinds.has(edge.kind)
    ? {...edge,from:edge.to,to:edge.from,fromPort:edge.toPort,toPort:edge.fromPort}
    : edge)};
}
/** Native routes are indexed by edge; restore source-first order after layout-only reversal. */
export async function presentationLayout(native) {
  const input=layoutPayload(native),auto=await autoLayout(input);
  if(!auto||input===native)return auto;
  return {...auto,routes:new Map([...auto.routes].map(([index,points])=>[index,
    input.edges[index].from!==native.edges[index].from?[...points].reverse():points]))};
}
export function boundedZoom(value) { return Math.max(Number.MIN_VALUE,Math.min(4,value)); }
/** Keep the content point under the starting midpoint under the moving midpoint. */
export function pinchFrame(start, midpoint, distance) {
  const zoom=boundedZoom(start.zoom*distance/Math.max(1,start.distance));
  return {zoom,left:Math.max(0,(start.left+start.midpoint.x)*zoom/start.zoom-midpoint.x),top:Math.max(0,(start.top+start.midpoint.y)*zoom/start.zoom-midpoint.y)};
}
export function installDiagramGestures(viewport, frame, applyScale, onInteract=()=>{}) {
  let pinch=null,origin=null,touchOrigin=null,active=false,suppressUntil=0;
  const suppress=()=>{suppressUntil=Date.now()+500;};
  const pair=touches=>{const box=viewport.getBoundingClientRect(),a=touches[0],b=touches[1];return {midpoint:{x:(a.clientX+b.clientX)/2-box.left,y:(a.clientY+b.clientY)/2-box.top},distance:Math.hypot(a.clientX-b.clientX,a.clientY-b.clientY)};};
  viewport.addEventListener('touchstart',event=>{
    active=true;onInteract();
    if(event.touches.length===1)touchOrigin={x:event.touches[0].clientX,y:event.touches[0].clientY};
    if(event.touches.length===2){pinch={...pair(event.touches),zoom:frame.zoom,left:viewport.scrollLeft,top:viewport.scrollTop};suppress();}
  },{passive:true});
  viewport.addEventListener('touchmove',event=>{
    if(event.touches.length===1&&touchOrigin&&Math.hypot(event.touches[0].clientX-touchOrigin.x,event.touches[0].clientY-touchOrigin.y)>8)suppress();
    if(event.touches.length!==2||!pinch)return;
    event.preventDefault();suppress();
    const current=pair(event.touches);frame.fitted=false;Object.assign(frame,pinchFrame(pinch,current.midpoint,current.distance));applyScale();viewport.scrollLeft=frame.left;viewport.scrollTop=frame.top;frame.positioned=true;
  },{passive:false});
  const end=event=>{if(pinch)suppress();if(event.touches.length<2)pinch=null;active=event.touches.length>0;};
  viewport.addEventListener('touchend',end,{passive:true});viewport.addEventListener('touchcancel',end,{passive:true});
  viewport.addEventListener('pointerdown',event=>{origin={x:event.clientX,y:event.clientY};active=true;},{passive:true});
  viewport.addEventListener('pointermove',event=>{if(origin&&Math.hypot(event.clientX-origin.x,event.clientY-origin.y)>8)suppress();},{passive:true});
  for(const type of ['pointerup','pointercancel'])viewport.addEventListener(type,()=>{origin=null;active=false;},{passive:true});
  viewport.addEventListener('scroll',()=>{if(active)suppress();},{passive:true});
  viewport.addEventListener('click',event=>{if(event.detail!==0&&Date.now()<suppressUntil){event.preventDefault();event.stopImmediatePropagation();}},true);
}
async function cachedLayout(source, native, compact) {
  let variants=layouts.get(source);if(!variants){variants=new Map();layouts.set(source,variants);}
  const key=compact?'compact':'full';
  if(!variants.has(key))variants.set(key,presentationLayout(native));
  return variants.get(key);
}
function frameFor(source, options) {
  let variants=frames.get(source);if(!variants){variants=new Map();frames.set(source,variants);}
  const preferences=options.presentationPreferences??{};
  const key=JSON.stringify({surface:options.frameScope??"main",camera:options.camera??null,placements:options.placements??[],showCompartments:preferences.showCompartments===true});
  const preferredZoom=Number.isFinite(preferences.defaultZoom)&&preferences.defaultZoom>=.1&&preferences.defaultZoom<=4?preferences.defaultZoom:1;
  if(options.resetFrame||!variants.has(key))variants.set(key,{zoom:boundedZoom(options.camera?.zoom??preferredZoom),left:0,top:0,positioned:false,showCompartments:preferences.showCompartments===true});
  return variants.get(key);
}

/** Enlarge the existing DOM without copying native nodes, IDs or event bindings. */
function expandable(container, fragment, frame, title, options) {
  const expand=document.createElement('button');expand.type='button';expand.textContent='Expand view';expand.className='native-expand';
  fragment.prepend(expand);
  expand.addEventListener('click',()=>{
    const dialog=document.createElement('dialog');dialog.className='native-dialog';
    if(typeof dialog.showModal!=='function'){message(fragment,'Expanded inspection requires a browser with native dialog support.');return;}
    const saved={...frame};const viewport=fragment.querySelector('.native-scroll');
    if(viewport){saved.left=viewport.scrollLeft;saved.top=viewport.scrollTop;}
    const parent=fragment.parentNode,next=fragment.nextSibling,focus=document.activeElement;
    const heading=document.createElement('h2');heading.id=`native-dialog-title-${++serial}`;heading.textContent=title;
    dialog.setAttribute('aria-labelledby',heading.id);
    const close=document.createElement('button');close.type='button';close.textContent='Close expanded view';
    const header=document.createElement('div');header.className='native-dialog-header';header.append(heading,close);
    const body=document.createElement('div');body.className='native-dialog-body';dialog.append(header,body);
    let restored=false;
    const restore=()=>{
      if(restored)return;restored=true;
      parent.insertBefore(fragment,next?.parentNode===parent?next:null);expand.hidden=false;
      Object.assign(frame,saved);fragment.restoreScale?.();fragment.restoreFrame?.();
      dialog.remove();container.closeExpanded=null;
      if(focus?.isConnected)focus.focus({preventScroll:true});else if(expand.isConnected)expand.focus({preventScroll:true});
    };
    const dismiss=()=>{if(dialog.open)dialog.close();restore();};
    container.closeExpanded=dismiss;
    dialog.addEventListener('close',restore);
    dialog.addEventListener('cancel',event=>{event.preventDefault();dismiss();});
    close.addEventListener('click',dismiss);
    document.body.append(dialog);body.append(fragment);expand.hidden=true;dialog.showModal();
    fragment.restoreFrame?.();close.focus();options.onInteract?.();
  });
}

/** Short labels are presentation only; complete native names remain accessible. */
function readableMatrixLabels(table) {
  const cells=[...table.querySelectorAll('thead th')].slice(1).concat([...table.querySelectorAll('tbody tr')].map(row=>row.querySelector('td')).filter(Boolean));
  const byTail=new Map();
  for(const cell of cells){const full=cell.textContent,tail=full.split('::').at(-1);if(!byTail.has(tail))byTail.set(tail,new Set());byTail.get(tail).add(full);}
  for(const cell of cells){
    const full=cell.textContent,tail=full.split('::').at(-1);
    if(full.includes('::')){cell.title=full;cell.setAttribute('aria-label',full);if(tail&&byTail.get(tail).size===1)cell.textContent=tail;}
  }
}

export async function renderView(container, view, options={}) {
  container.closeExpanded?.();
  const selectSemantic=id=>{container.closeExpanded?.();options.onSelect?.(id);};
  const token={};container.renderToken=token;
  const frame=frameFor(view.native,options);
  options={...options,resetFrame:false};
  const native=presentationPayload(view.native,frame.showCompartments);
  if(!supported.has(native.kind)) throw new Error(`Unsupported native view kind: ${native.kind}`);
  const fragment=document.createElement('div');fragment.className='native-view';
  if(native.kind==='table'||native.kind==='matrix') {
    const table=tableOf(native);table.setAttribute('aria-label',view.title??view.id);
    if(native.kind==='matrix')readableMatrixLabels(table);
    const represented=new Set();
    for(const row of table.querySelectorAll('tr[data-opensysml-row]')) {
      const semantic=view.rowToElement?.[row.dataset.opensysmlRow];
      if(typeof semantic!=='string'||!semantic)continue;
      represented.add(semantic);
      const selected=semantic===options.selectedId;
      row.dataset.semanticId=semantic;
      row.classList.toggle('opensysml-selected',selected);
      row.setAttribute('aria-selected',String(selected));
      // Retain native table/row/cell roles. A real button in the first data cell
      // provides keyboard selection without turning the row into a fake button.
      const select=document.createElement('button');select.type='button';
      select.textContent=selected?'Selected':'Select';
      select.setAttribute('aria-label',`${selected?'Selected row':'Select row'} ${Number(row.dataset.opensysmlRow)+1}: show model details`);
      select.setAttribute('aria-pressed',String(selected));
      select.addEventListener('click',event=>{event.stopPropagation();selectSemantic(semantic);});
      const cell=row.querySelector('td');if(cell){cell.prepend(select,document.createTextNode(' '));}
      row.addEventListener('click',()=>selectSemantic(semantic));
      if(selected){row.style.backgroundColor='#e0f2ed';row.style.boxShadow='inset 3px 0 #16645d';}
    }
    fragment.append(table);
    if(options.selectedId&&!represented.has(options.selectedId))message(fragment,'The selected element is not represented in this table. Your semantic selection is retained.');
    if((native.rows??[]).some((_,index)=>!view.rowToElement?.[String(index)]))message(fragment,'Some table rows have no exported semantic identity. Their values are readable, but model selection is unavailable.');
  } else {
    const auto=await cachedLayout(view.native,native,!frame.showCompartments);
    const overrides={nodes:new Map()};
    for(const placement of options.placements??[]) {
      for(const node of native.nodes) if((view.nodeToElement?.[node.id]??node.semanticId)===placement.target) overrides.nodes.set(node.id,{x:placement.x,y:placement.y});
    }
    const layout=layoutCanvas(native,overrides,auto);
    const svg=drawCanvas(layout);
    svg.setAttribute('role','group');svg.setAttribute('aria-label',view.title??view.id);
    // Native markers have document-global IDs. Namespace every instance so inline
    // mobile views and prepared comparisons cannot use another diagram's markers.
    const prefix=`sp-${++serial}-`;
    const ids=new Map([...svg.querySelectorAll('[id]')].map(el=>[el.id,prefix+el.id]));
    for(const el of svg.querySelectorAll('*')) {
      if(el.id) el.id=ids.get(el.id);
      for(const attr of [...el.attributes]) {
        let value=attr.value;
        for(const [oldId,newId] of ids) value=value.replaceAll(`url(#${oldId})`,`url(#${newId})`);
        if(value!==attr.value) el.setAttribute(attr.name,value);
      }
    }
    for(const group of svg.querySelectorAll('g.opensysml-node')) {
      const local=group.dataset.opensysmlId;
      const node=native.nodes.find(n=>n.id===local);
      const semantic=view.nodeToElement?.[local]??node?.semanticId;
      group.classList.toggle('selected',!!semantic&&semantic===options.selectedId);
      if(semantic) {
        group.setAttribute('tabindex','0');group.setAttribute('role','button');
        group.setAttribute('aria-label',`${node.name||node.kind}: show model details`);
        const select=()=>selectSemantic(semantic);
        group.addEventListener('click',select);
        group.addEventListener('keydown',event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();select();}});
      }
      const notes=(options.annotations??[]).filter(note=>note.target===semantic);
      if(notes.length) {
        group.classList.add('annotated');
        const title=document.createElementNS('http://www.w3.org/2000/svg','title');title.textContent=notes.map(n=>n.text).join('; ');group.append(title);
      }
    }
    const controls=document.createElement('div');controls.className='native-toolbar';controls.setAttribute('role','group');controls.setAttribute('aria-label','Diagram scale and detail');
    const viewport=document.createElement('div');viewport.className='native-scroll';viewport.tabIndex=0;viewport.setAttribute('role','region');viewport.setAttribute('aria-label','Scrollable model diagram; use arrow keys to pan');
    const scaleLabel=document.createElement('output');scaleLabel.setAttribute('aria-live','polite');
    const applyScale=()=>{svg.style.width=`${layout.width*frame.zoom}px`;svg.style.height=`${layout.height*frame.zoom}px`;scaleLabel.textContent=`${Math.round(frame.zoom*100)}%`;};
    const scaleTo=value=>{frame.fitted=false;frame.positioned=true;const previous=frame.zoom;frame.zoom=boundedZoom(value);applyScale();viewport.scrollLeft=(viewport.scrollLeft+viewport.clientWidth/2)*frame.zoom/previous-viewport.clientWidth/2;viewport.scrollTop=(viewport.scrollTop+viewport.clientHeight/2)*frame.zoom/previous-viewport.clientHeight/2;frame.left=viewport.scrollLeft;frame.top=viewport.scrollTop;};
    const control=(name,action)=>{const b=document.createElement('button');b.type='button';b.textContent=name;if(name==='Fit')b.dataset.readingControl='fit';b.addEventListener('click',()=>{options.onInteract?.();action();});controls.append(b);};
    control('−',()=>scaleTo(frame.zoom/1.25));controls.lastElementChild.setAttribute('aria-label','Zoom out');
    control('+',()=>scaleTo(frame.zoom*1.25));controls.lastElementChild.setAttribute('aria-label','Zoom in');
    control('100%',()=>scaleTo(1));
    const fit=()=>{if(!viewport.clientWidth||!viewport.clientHeight)return;frame.zoom=Math.min(4,Math.max(1,viewport.clientWidth-2)/layout.width,Math.max(1,viewport.clientHeight-2)/layout.height);frame.left=0;frame.top=0;frame.positioned=true;frame.fitted=true;applyScale();viewport.scrollLeft=0;viewport.scrollTop=0;};
    control('Fit',fit);
    controls.append(scaleLabel);
    if(structuralKinds.has(native.kind))control(frame.showCompartments?'Hide compartments':'Show compartments',()=>{container.closeExpanded?.();frame.showCompartments=!frame.showCompartments;frame.positioned=false;renderView(container,view,options).catch(error=>message(container,error.message));});
    if(options.compactControls){
      const more=document.createElement('details');more.className='native-more';const summary=document.createElement('summary');summary.textContent='More';more.append(summary);
      for(const control of [...controls.querySelectorAll('button')])if(control.textContent==='100%'||control.textContent.includes('compartments'))more.append(control);
      controls.append(more);
    }
    installDiagramGestures(viewport,frame,applyScale,()=>options.onInteract?.());
    fragment.restoreScale=applyScale;applyScale();viewport.append(svg);fragment.append(controls,viewport);
    if(!options.compactControls)message(fragment,'Drag with one finger to pan; pinch with two to zoom. Scroll or arrow keys also pan. Fit shows the whole view.');
    if(!options.compactControls&&structuralKinds.has(native.kind)&&!frame.showCompartments)message(fragment,'Compartments hidden; select a node for details.');
    const selectedNode=native.nodes.find(node=>(view.nodeToElement?.[node.id]??node.semanticId)===options.selectedId);
    if(selectedNode?.detail){const detail=document.createElement('details'),summary=document.createElement('summary'),body=document.createElement('pre');summary.textContent='Selected element: native detail';body.textContent=selectedNode.detail;detail.append(summary,body);fragment.append(detail);}
    // Intent events distinguish manual panning from asynchronous programmatic scroll events.
    for(const type of ['wheel','pointerdown'])viewport.addEventListener(type,()=>options.onInteract?.(),{passive:true});
    viewport.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key))options.onInteract?.();});
    viewport.addEventListener('scroll',()=>{if(!viewport.clientWidth||!viewport.clientHeight)return;if(viewport.scrollLeft!==frame.left||viewport.scrollTop!==frame.top)frame.fitted=false;frame.left=viewport.scrollLeft;frame.top=viewport.scrollTop;frame.positioned=true;},{passive:true});
    fragment.restoreFrame=()=>{
      if(!viewport.clientWidth||!viewport.clientHeight)return;
      // First display and reset show the complete view, including authored camera scenes.
      // Selection redraws retain the reader's frame; hidden panels wait for dimensions.
      if(!frame.positioned||frame.fitted)fit();
      viewport.scrollLeft=frame.left;viewport.scrollTop=frame.top;frame.positioned=true;
    };
    const ResizeObserverClass=document.defaultView?.ResizeObserver;
    if(ResizeObserverClass){const observer=new ResizeObserverClass(()=>{if(!fragment.isConnected){observer.disconnect();return;}fragment.restoreFrame();});observer.observe(viewport);}
    if(native.nodes.length>600) message(fragment,'Automatic layout limit reached; native/grid placement is shown. Reduce context before requesting a clearer layout.');
    if(options.selectedId&&!native.nodes.some(n=>(view.nodeToElement?.[n.id]??n.semanticId)===options.selectedId)) message(fragment,'The selected element is not represented in this view. Your semantic selection is retained.');
  }
  for(const notice of native.notices) message(fragment,notice);
  for(const note of native.notes??[]) message(fragment,note.text);
  for(const annotation of options.annotations??[]) message(fragment,annotation.text);
  if(options.allowExpand!==false)expandable(container,fragment,frame,view.title??view.id,options);
  if(container.renderToken===token){container.replaceChildren(fragment);fragment.restoreFrame?.();}
}
