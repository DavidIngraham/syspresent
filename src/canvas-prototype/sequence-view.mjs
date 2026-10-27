import {projectView} from './core/index.mjs';
let serial=0;
const semanticId=record=>record.semanticId??record.semantic_id??null;
const labelOf=node=>[node.nameSynthesized??node.name_synthesized?'':node.name,node.type].filter(Boolean).join(' : ')||node.kind;

/** Native nodes supply lifeline order; native edges supply one display order.
 * Neither names, source locations, IDs nor timestamps imply a modeled total order. */
export const SEQUENCE_LAYOUT_SCHEMA='syspresent.sequence-layout.v1';
const laneKey=node=>JSON.stringify([semanticId(node),node.id]);
const finiteRange=(value,min,max)=>Number.isFinite(value)&&value>=min&&value<=max;
export function sequencePresentationLayout(nativeView,layout){
 if(layout===undefined)return undefined;
 if(!layout||layout.schemaVersion!==SEQUENCE_LAYOUT_SCHEMA||!Array.isArray(layout.lanes)||layout.lanes.length>2000)throw Error('Invalid sequence presentation layout');
 if(Object.keys(layout).some(key=>!['schemaVersion','lanes','messageGap'].includes(key)))throw Error('Sequence positions and message order are native; only lane widths and message spacing may be adjusted');
 if(layout.messageGap!==undefined&&!finiteRange(layout.messageGap,78,300))throw Error('Sequence message spacing must be between 78 and 300 pixels');
 const seen=new Set(),lanes=layout.lanes.map(lane=>{
  if(!lane||Object.keys(lane).some(key=>!['semanticId','representationId','width'].includes(key))||typeof lane.semanticId!=='string'||!lane.semanticId||typeof lane.representationId!=='string'||!lane.representationId||!finiteRange(lane.width,160,900))throw Error('A sequence lane width requires native semantic/representation identities and 160–900 pixels');
  const key=laneKey({id:lane.representationId,semanticId:lane.semanticId});if(seen.has(key))throw Error('Duplicate sequence lane placement');seen.add(key);
  return {semanticId:lane.semanticId,representationId:lane.representationId,width:lane.width};
 });
 return {schemaVersion:SEQUENCE_LAYOUT_SCHEMA,lanes,...(layout.messageGap!==undefined?{messageGap:layout.messageGap}:{})};
}
const occurrenceEndpointKinds=new Set(['event occurrence','occurrence','part','port','item','action','state','use case','verification','analysis']);
const eventProxy=ref=>ref?.kind==='event occurrence';
function messageNotation(edge){
 if(edge.kind!=='flow')return {status:'rejected',reason:'Unsupported native sequence relationship kind '+edge.kind+'. No message arrow is inferred.'};
 const notation=edge.notation;
 if(!notation?.production)return {status:'data-blocked',reason:'Original native message/flow production is unavailable. The exploratory message projection is retained; exact focused notation is withheld.'};
 if(notation.production==='message'){
  if(!occurrenceEndpointKinds.has(notation.sourceEvent?.kind)||!occurrenceEndpointKinds.has(notation.targetEvent?.kind))return {status:'data-blocked',reason:'Native message endpoints do not both expose occurrence roles required by OMG 8.2.3.16.'};
  return {status:'implemented',reason:'Native message production with occurrence endpoints; open arrow. No synchronous/asynchronous/return subtype is asserted.'};
 }
 if(['flow','succession-flow'].includes(notation.production))return {status:'data-blocked',reason:'Native '+notation.production+' requires directed-feature parameter/proxy ends. This sequence contract does not expose the parameter/proxy production needed to draw those ends; no message arrow is substituted.'};
 return {status:'rejected',reason:'Unsupported native sequence production '+notation.production+'. No alternate relationship is invented.'};
}
/** Coverage concerns actual native records, never sync/async classifications
 * inferred from a label or an edge array's display position. */
export function sequenceNotationCoverage(nativeView){
 const nodes=nativeView.nodes??[],edges=nativeView.edges??[],records=[];
 for(const node of nodes)records.push({role:'participant',representationId:node.id,semanticId:semanticId(node),kind:node.kind,status:['part','port'].includes(node.kind)?'implemented':'rejected',reason:['part','port'].includes(node.kind)?'Native feature header and lifeline; OMG 8.2.3.9.':'Native participant kind has no implemented sequence head production.'});
 for(const edge of edges){
  records.push({role:'message',semanticId:semanticId(edge),kind:edge.kind,production:edge.notation?.production,...messageNotation(edge)});
  for(const role of ['sourceEvent','targetEvent'])if(eventProxy(edge.notation?.[role])){
   const ref=edge.notation[role],expected=role==='sourceEvent'?(edge.source??edge.from):(edge.target??edge.to),supported=semanticId(ref)&&ref.lifelineId===expected;
   records.push({role:'event-proxy',endpointRole:role,semanticId:semanticId(ref),kind:ref.kind,status:supported?'implemented':'data-blocked',reason:supported?'Native event-occurrence proxy; no event inferred from a label.':'Native event occurrence lacks canonical identity or matching native lifeline; proxy attachment is withheld.'});
  }
 }
 for(const order of nativeView.sequenceOrders??[])records.push({role:'explicit-order',semanticId:semanticId(order),kind:order.kind,status:order.kind==='succession'&&eventProxy(order.sourceEvent)&&eventProxy(order.targetEvent)?'implemented':'data-blocked',reason:order.kind==='succession'&&eventProxy(order.sourceEvent)&&eventProxy(order.targetEvent)?'Explicit native event succession; drawing additionally requires uniquely represented endpoint proxies.':'Native order lacks event-occurrence proxy roles required by OMG 8.2.3.9; no alternate order is invented.'});
 if(nativeView.fragments?.length)records.push({role:'fragments',status:'rejected',reason:'Native fragment records lack a supported event/operand-boundary contract; no concurrency frame is invented.'});
 return {authority:'OMG SysML 2.0 formal/2026-03-02',sections:['8.2.3.9','8.2.3.16','8.2.3.26'],records,notice:'Supported native sequence subset. Native message production, event roles and explicit event orders are preserved; no elapsed time, call/return subtype or interaction-fragment semantics are inferred.'};
}
export function sequenceLayout(nativeView,{layout:preferences,renderingMode='exploratory'}={}){
  const view=projectView(nativeView);
  if(view.kind!=='sequence')throw Error('Sequence renderer requires a native sequence view');
  const notices=[...(view.notices??[])],presentationLayout=sequencePresentationLayout(view,preferences),saved=new Map((presentationLayout?.lanes??[]).map(lane=>[laneKey({id:lane.representationId,semanticId:lane.semanticId}),lane.width]));
  for(const lane of presentationLayout?.lanes??[])if(!view.nodes.some(node=>laneKey(node)===laneKey({id:lane.representationId,semanticId:lane.semanticId})))notices.push('Saved sequence lane '+lane.semanticId+' has no exact native representation; its width was not applied.');
  const coverage=sequenceNotationCoverage(view);
  if(renderingMode==='focused')for(const record of coverage.records)if(record.status!=='implemented')notices.push(record.reason);
  for(const node of view.nodes)if(node.parentId)notices.push(`Nested sequence participant ${labelOf(node)} is shown as a lifeline; its native nesting is not represented.`);
  for(const note of view.notes??[])notices.push(typeof note==='string'?note:note.text??JSON.stringify(note));
  const columnWidth=Math.max(210,...view.nodes.map(node=>Math.min(360,80+labelOf(node).length*7)));
  const widths=view.nodes.map(node=>saved.get(laneKey(node))??columnWidth);
  const participantHeight=Math.max(72,...view.nodes.map((node,index)=>40+[labelOf(node),node.text,node.detail].filter(Boolean).join('\n').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length*7/(widths[index]-50)))*19,0)));
  let left=30;const nodes=view.nodes.map((node,index)=>{const result={...node,semanticId:semanticId(node),x:left,y:16,width:widths[index]-30,height:participantHeight,laneWidth:widths[index]};left+=widths[index];return result;});
  const byId=new Map(nodes.map(node=>[node.id,node]));
  let y=participantHeight+70;
  const edges=view.edges.map((edge,index)=>{
    const from=byId.get(edge.source),to=byId.get(edge.target),a=from.x+from.width/2,b=to.x+to.width/2,self=a===b;
    const width=self?Math.max(150,from.laneWidth-40):Math.max(140,Math.abs(b-a)-24);
    const label=edge.label??'',detail=[edge.fromLabel??edge.from_label,edge.toLabel??edge.to_label].filter(Boolean).join(' → ');
    const text=[label,detail].filter(Boolean).join('\n');
    const labelHeight=Math.max(30,text.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length*7/(width-12)))*19,0)+8);
    const points=self?[{x:a,y},{x:a+Math.max(65,from.laneWidth*.37),y},{x:a+Math.max(65,from.laneWidth*.37),y:y+30},{x:a,y:y+30}]:[{x:a,y},{x:b,y}];
    const supported=renderingMode==='focused'?messageNotation(edge).status==='implemented':['flow','succession','transition'].includes(edge.kind);
    if(!supported)notices.push('Unsupported sequence message kind: '+edge.kind+'. '+messageNotation(edge).reason+' Its native record remains available.');
    const result={...edge,semanticId:semanticId(edge),sourceSemanticId:from.semanticId,targetSemanticId:to.semanticId,order:index,points,supported,self,
      labelBox:{x:self?a+12:Math.min(a,b)+12,y:y-labelHeight-5,width,height:labelHeight},text};
    y+=Math.max(presentationLayout?.messageGap??78,labelHeight+38)+(self?30:0);return result;
  });
  // Only native event-occurrence identities create event proxies. A shared
  // identity may legitimately have several drawing occurrences; explicit orders
  // attach only when the native lifeline and geometric proxy are unambiguous.
  const events=[],eventPoints=new Map();
  for(const edge of edges)for(const [role,point] of [['sourceEvent',edge.points[0]],['targetEvent',edge.points.at(-1)]]){
    const ref=edge.notation?.[role],lifelineId=role==='sourceEvent'?edge.source:edge.target;
    if(!eventProxy(ref)||!semanticId(ref))continue;
    if(ref.lifelineId!==lifelineId){notices.push('Native event '+semanticId(ref)+' has no matching endpoint lifeline; no event proxy was placed.');continue;}
    const id=semanticId(ref),key=JSON.stringify([id,lifelineId,point.x,point.y]);let event=events.find(item=>item.key===key);
    if(!event){event={...ref,key,id:edge.id+':'+role,semanticId:id,x:point.x,y:point.y,lifelineId};events.push(event);eventPoints.set(id,[...(eventPoints.get(id)??[]),event]);}
  }
  const orders=(view.sequenceOrders??[]).map((order,index)=>{
    const locate=ref=>eventProxy(ref)&&semanticId(ref)?(eventPoints.get(semanticId(ref))??[]).filter(point=>point.lifelineId===ref.lifelineId):[];
    const from=locate(order.sourceEvent),to=locate(order.targetEvent),supported=order.kind==='succession'&&from.length===1&&to.length===1;
    const result={...order,id:order.id??(view.id??'sequence')+':order:'+index,semanticId:semanticId(order),supported,sourceSemanticId:semanticId(order.sourceEvent??{}),targetSemanticId:semanticId(order.targetEvent??{})};
    if(!supported){notices.push('Explicit native succession '+(order.qualifiedName??semanticId(order)??index)+' has missing or ambiguous event-occurrence proxies; its record is retained without a guessed order arrow.');return result;}
    const a=from[0],b=to[0],sameLane=a.x===b.x,direction=b.y>=a.y?1:-1;
    // Choose a local bend by measured presentation obstacles only; event order
    // and endpoint identity never change to simplify this route.
    const crossings=offset=>edges.filter(edge=>{const box=edge.labelBox;return a.x+offset>=box.x&&a.x+offset<=box.x+box.width&&box.y<Math.max(a.y,b.y)&&box.y+box.height>Math.min(a.y,b.y);}).length;
    const offset=crossings(-24)<crossings(24)?-24:24;
    result.points=sameLane?[{x:a.x,y:a.y},{x:a.x+offset,y:a.y+8*direction},{x:b.x+offset,y:b.y-8*direction},{x:b.x,y:b.y}]:[{x:a.x,y:a.y},{x:b.x,y:b.y}];
    const labelWidth=sameLane?Math.min(150,(byId.get(a.lifelineId)?.laneWidth??210)-65):Math.max(100,Math.abs(a.x-b.x)-24);
    result.labelBox=order.name?{x:sameLane?a.x+offset+(offset<0?-labelWidth-3:3):Math.min(a.x,b.x)+12,y:(a.y+b.y)/2-12,width:labelWidth,height:24}:{x:(a.x+b.x)/2+(sameLane?offset:0)-7,y:(a.y+b.y)/2-7,width:14,height:14};
    return result;
  });
  if(renderingMode==='focused')for(const record of coverage.records.filter(record=>record.role==='explicit-order')){const order=orders.find(item=>item.semanticId===record.semanticId);if(order&&!order.supported){record.status='data-blocked';record.reason='Explicit order has no unique native event-proxy attachment; its record is retained without guessed placement.';}}
  if(view.fragments?.length)notices.push('Native interaction fragments are not supported by this renderer; their ordering and concurrency are not inferred.');
  return {...view,nodes,edges,events,orders,notices,coverage,presentationLayout,width:Math.max(340,left,...edges.flatMap(edge=>edge.points.map(point=>point.x+30))),height:Math.max(220,y+20)};
}

/** Bounded, scrollable native sequence reading region. Selection never scrolls. */
function mountSequenceSurface(host,nativeView,{onSelect=()=>{},onExplore=()=>{},selectedId=null,selectedIds,state={},onStateChange=()=>{},onLayoutChange=()=>{},renderingMode='exploratory'}={}){
  const document=host.ownerDocument,layout=sequenceLayout(nativeView,{layout:state.layout,renderingMode}),records=[],selected={value:null,ids:[]};
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const svg=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
  let destroyed=false;const root=make('section',undefined,'sequence-view'+(renderingMode==='focused'?' focused-sequence':''));root.setAttribute('aria-label','Sequence view');
  if(renderingMode==='focused'){const identity=nativeView.id??nativeView.view;if(identity)root.append(make('div','«view» '+identity,'sequence-frame-label'));else layout.notices.push('Native view identity is unavailable; no standard view-frame name was invented.');}
  const toolbar=make('div',undefined,'sequence-toolbar');
  const evidence=make('p',nativeView.sequenceOrdering==='declaration-order-cycle-fallback'?'Native cycle fallback display; not a valid execution or total-order proof. Spacing is presentation only.':'Native message display order · vertical spacing asserts neither elapsed time nor additional modeled ordering.','sequence-evidence');
  const explore=make('button','Explore selection');explore.type='button';explore.disabled=true;explore.onclick=()=>{if(selected.value)onExplore(selected.value);};
  toolbar.append(evidence,explore);
  const settings=make('details',undefined,'sequence-layout-settings');settings.append(make('summary','Layout'));
  const fields=make('div',undefined,'sequence-layout-fields'),currentLayout=layout.presentationLayout??{schemaVersion:SEQUENCE_LAYOUT_SCHEMA,lanes:[]};
  const request=next=>onLayoutChange(next);
  for(const node of layout.nodes){const field=make('label',labelOf(node)+' lane width'),input=make('input');input.type='number';input.min='160';input.max='900';input.step='20';input.value=String(node.laneWidth);input.setAttribute('aria-label',labelOf(node)+' lane width in pixels');input.disabled=!node.semanticId;input.title=node.semanticId?'Width changes preserve native participant and message order.':'Native participant identity is unavailable.';
   input.onchange=()=>{const width=Number(input.value);if(!finiteRange(width,160,900)){input.value=String(node.laneWidth);return;}const lanes=currentLayout.lanes.filter(lane=>laneKey({id:lane.representationId,semanticId:lane.semanticId})!==laneKey(node));lanes.push({semanticId:node.semanticId,representationId:node.id,width});request({...currentLayout,lanes});};field.append(input);fields.append(field);}
  const gapField=make('label','Message spacing'),gap=make('input');gap.type='number';gap.min='78';gap.max='300';gap.step='10';gap.value=String(currentLayout.messageGap??78);gap.setAttribute('aria-label','Message spacing in pixels');gap.onchange=()=>{const messageGap=Number(gap.value);if(!finiteRange(messageGap,78,300)){gap.value=String(currentLayout.messageGap??78);return;}request({...currentLayout,messageGap});};gapField.append(gap);fields.append(gapField);
  const reset=make('button','Reset sequence layout');reset.type='button';reset.onclick=()=>request(undefined);fields.append(reset,make('p','Lane widths and spacing are presentation only. Participant order and native message order stay fixed.'));settings.append(fields);toolbar.append(settings);root.append(toolbar);
  const selectionNotice=make('p','','sequence-selection-notice');selectionNotice.hidden=true;selectionNotice.setAttribute('role','status');root.append(selectionNotice);
  if(layout.notices.length){const notices=make('details',undefined,'sequence-notices');notices.append(make('summary',`${layout.notices.length} native or rendering notices`));const list=make('ul');for(const notice of layout.notices)list.append(make('li',typeof notice==='string'?notice:notice.message??JSON.stringify(notice)));notices.append(list);root.append(notices);}
  const viewport=make('div',undefined,'sequence-viewport');viewport.tabIndex=0;viewport.setAttribute('aria-label','Sequence participants and ordered messages; scroll to reveal more');
  const canvas=make('div',undefined,'sequence-canvas');canvas.style.width=layout.width+'px';canvas.style.height=layout.height+'px';
  const drawing=svg('svg',{width:layout.width,height:layout.height,'aria-hidden':'true',class:'sequence-lines'});
  const markerId=`sequence-arrow-${++serial}`,defs=svg('defs'),marker=svg('marker',{id:markerId,viewBox:'0 0 12 12',refX:11,refY:6,markerWidth:9,markerHeight:9,orient:'auto'});marker.append(svg('path',{d:renderingMode==='focused'?'M1 1 L11 6 L1 11':'M1 1 L11 6 L1 11 Z',fill:renderingMode==='focused'?'none':'currentColor',stroke:'currentColor'}));defs.append(marker);const orderMarkerId=markerId+'-order',orderMarker=svg('marker',{id:orderMarkerId,viewBox:'0 0 12 12',refX:11,refY:6,markerWidth:9,markerHeight:9,orient:'auto'});orderMarker.append(svg('path',{d:'M1 1 L11 6 L1 11',fill:'none',stroke:'currentColor'}));defs.append(orderMarker);drawing.append(defs);
  canvas.append(drawing);
  const currentState=()=>({...((state.layout!==undefined)?{layout:structuredClone(state.layout)}:{}),scrollLeft:viewport.scrollLeft,scrollTop:viewport.scrollTop,selectedId:selected.ids.length===1?selected.ids[0]:null,...(selected.ids.length>1?{selectedIds:[...selected.ids]}:{})});
  const highlight=()=>{
    for(const item of records){const active=selected.ids.includes(item.selection.semanticId);item.button.classList.toggle('selected',active);item.button.setAttribute('aria-pressed',String(active));item.path?.classList.toggle('selected',active);}
    explore.disabled=!selected.value?.semanticId;
    const missing=selected.ids.filter(id=>!records.some(item=>item.selection.semanticId===id));
    selectionNotice.textContent=missing.length?`${missing.length} selected element${missing.length===1?' is':'s are'} not represented in this sequence. Your semantic selection is retained.`:'';
    selectionNotice.hidden=!missing.length;
  };
  const select=(id,{notify=false,record=null}={})=>{
    selected.ids=id?[id]:[];
    selected.value=record??records.find(item=>item.selection.semanticId===id)?.selection??null;
    highlight();
    if(notify){onSelect(selected.value);onStateChange(currentState());}
  };
  const selectMany=ids=>{
    selected.ids=[...new Set((ids??[]).filter(id=>typeof id==='string'&&id))];
    selected.value=selected.ids.length===1?records.find(item=>item.selection.semanticId===selected.ids[0])?.selection??null:null;
    highlight();
  };
  const register=(button,selection,box,path)=>{
    button.type='button';button.dataset.representation=selection.id;if(selection.semanticId)button.dataset.semanticId=selection.semanticId;
    button.setAttribute('aria-pressed','false');button.onclick=event=>{event.stopPropagation();select(selection.semanticId,{notify:true,record:selection});};
    Object.assign(button.style,{left:box.x+'px',top:box.y+'px',width:box.width+'px',minHeight:box.height+'px'});
    records.push({button,selection,box,path});canvas.append(button);
  };
  for(const node of layout.nodes){
    const x=node.x+node.width/2;drawing.append(svg('line',{x1:x,x2:x,y1:node.y+node.height,y2:layout.height-15,class:'sequence-lifeline'}));
    const button=make('button',undefined,'sequence-participant'+(renderingMode==='focused'&&!['part','port'].includes(node.kind)?' sequence-unsupported-participant':''));button.dataset.participantKind=node.kind;if(renderingMode==='focused'&&!['part','port'].includes(node.kind))button.append(make('span','Unsupported participant notation','sequence-kind'));button.append(make('span',`«${node.kind}»`,'sequence-kind'),make('span',labelOf(node)));
    if(node.detail||node.text){button.append(make('span',[node.text,node.detail].filter(Boolean).join('\n'),'sequence-detail'));}
    register(button,{...node,label:labelOf(node)},node);
  }
  for(const edge of layout.edges){
    let path=null;
    if(edge.supported){path=svg('path',{d:edge.points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '),class:'sequence-message-line','marker-end':`url(#${markerId})`});drawing.append(path);}
    const button=make('button',edge.text||'(unnamed message)','sequence-message');button.setAttribute('aria-label',`Message ${edge.order+1}: ${edge.text||'unnamed'}, ${labelOf(layout.nodes.find(n=>n.id===edge.source))} to ${labelOf(layout.nodes.find(n=>n.id===edge.target))}${edge.self?', self-message':''}`);
    register(button,{...edge,kind:'relationship',relationshipKind:edge.kind,label:edge.label,relationships:[{semanticId:edge.semanticId,sourceSemanticId:edge.sourceSemanticId,targetSemanticId:edge.targetSemanticId,kind:edge.kind,label:edge.label}]},edge.labelBox,path);
  }
  for(const order of layout.orders){
    if(!order.supported)continue;
    const path=svg('path',{d:order.points.map((point,index)=>(index?'L':'M')+point.x+','+point.y).join(' '),class:'sequence-order-line','marker-end':'url(#'+orderMarkerId+')'});
    if(order.semanticId)path.dataset.semanticId=order.semanticId;drawing.append(path);
    const button=make('button',order.name??'','sequence-order'+(order.name?'':' sequence-order-unlabeled'));button.title='Select native event succession';button.setAttribute('aria-label','Native event succession: '+(order.sourceEvent.qualifiedName??order.sourceSemanticId)+' to '+(order.targetEvent.qualifiedName??order.targetSemanticId));
    register(button,{...order,kind:'relationship',relationshipKind:order.kind,relationships:[{semanticId:order.semanticId,sourceSemanticId:order.sourceSemanticId,targetSemanticId:order.targetSemanticId,kind:order.kind}]},order.labelBox,path);
  }
  for(const event of layout.events){
    const button=make('button','','sequence-event-proxy');button.title=event.qualifiedName??event.name??event.semanticId;button.setAttribute('aria-label','Event occurrence: '+button.title);
    register(button,{...event,kind:'event occurrence',label:button.title},{x:event.x-5,y:event.y-5,width:10,height:10});
  }
  viewport.append(canvas);root.append(viewport);host.replaceChildren(root);
  viewport.scrollLeft=state.scrollLeft??0;viewport.scrollTop=state.scrollTop??0;
  viewport.addEventListener('scroll',()=>{if(!destroyed)onStateChange(currentState());});
  for(const type of ['wheel','pointerdown','touchstart'])viewport.addEventListener(type,event=>event.stopPropagation(),{passive:true});
  if(selectedIds)selectMany(selectedIds);else if(selectedId)select(selectedId);else if(state.selectedIds)selectMany(state.selectedIds);else select(state.selectedId);
  return {
    destroy(){destroyed=true;root.remove();},
    getState:currentState,
    select,
    selectMany,
    reveal(id){const item=records.find(item=>item.selection.semanticId===id);if(item)item.button.scrollIntoView?.({block:'nearest',inline:'nearest'});},
    anchors(){const hostBox=host.getBoundingClientRect();return records.filter(item=>item.selection.semanticId).flatMap(item=>{const box=item.button.getBoundingClientRect(),area=viewport.getBoundingClientRect();if(box.right<area.left||box.left>area.right||box.bottom<area.top||box.top>area.bottom)return [];return [{semanticId:item.selection.semanticId,representationId:item.selection.id,x:box.x-hostBox.x,y:box.y-hostBox.y,width:box.width,height:box.height}];});},
  };
}

/** Stable controller; explicit presentation adjustments rebuild geometry without
 * changing any native semantic payload or shared selection. */
export function mountSequence(host,nativeView,options={}){
 let active,destroyed=false;
 const mount=state=>mountSequenceSurface(host,nativeView,{...options,...(state?{state,selectedId:state.selectedId,selectedIds:state.selectedIds}:{}),onLayoutChange:layout=>{
  if(destroyed)return;sequencePresentationLayout(nativeView,layout);const saved=active.getState(),previousLayout=saved.layout===undefined?undefined:structuredClone(saved.layout);if(layout===undefined)delete saved.layout;else saved.layout=layout;
  active.destroy();active=mount(saved);options.onStateChange?.(active.getState());options.onLayoutChange?.(layout===undefined?undefined:structuredClone(layout),{previousLayout});
 }});
 active=mount();
 return {destroy(){destroyed=true;active.destroy();},getState:()=>active.getState(),select:(...args)=>active.select(...args),selectMany:(...args)=>active.selectMany(...args),reveal:(...args)=>active.reveal(...args),anchors:()=>active.anchors()};
}
