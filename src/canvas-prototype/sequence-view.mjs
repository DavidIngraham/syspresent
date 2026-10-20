import {projectView} from './core/index.mjs';
let serial=0;
const semanticId=record=>record.semanticId??record.semantic_id??null;
const labelOf=node=>[node.nameSynthesized??node.name_synthesized?'':node.name,node.type].filter(Boolean).join(' : ')||node.kind;

/** Native nodes are the lifeline order; native edges are the ordered messages.
 * Neither names, source locations, IDs nor timestamps determine their position. */
export function sequenceLayout(nativeView){
  const view=projectView(nativeView);
  if(view.kind!=='sequence')throw Error('Sequence renderer requires a native sequence view');
  const notices=[...(view.notices??[])];
  for(const node of view.nodes)if(node.parentId)notices.push(`Nested sequence participant ${labelOf(node)} is shown as a lifeline; its native nesting is not represented.`);
  for(const note of view.notes??[])notices.push(typeof note==='string'?note:note.text??JSON.stringify(note));
  const columnWidth=Math.max(210,...view.nodes.map(node=>Math.min(360,80+labelOf(node).length*7)));
  const participantHeight=Math.max(72,...view.nodes.map(node=>40+[labelOf(node),node.text,node.detail].filter(Boolean).join('\n').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length*7/(columnWidth-50)))*19,0)));
  const nodes=view.nodes.map((node,index)=>({...node,semanticId:semanticId(node),x:30+index*columnWidth,y:16,width:columnWidth-30,height:participantHeight}));
  const byId=new Map(nodes.map(node=>[node.id,node]));
  let y=participantHeight+70;
  const edges=view.edges.map((edge,index)=>{
    const from=byId.get(edge.source),to=byId.get(edge.target),a=from.x+from.width/2,b=to.x+to.width/2,self=a===b;
    const width=self?Math.max(150,columnWidth-40):Math.max(140,Math.abs(b-a)-24);
    const label=edge.label??'',detail=[edge.fromLabel??edge.from_label,edge.toLabel??edge.to_label].filter(Boolean).join(' → ');
    const text=[label,detail].filter(Boolean).join('\n');
    const labelHeight=Math.max(30,text.split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length*7/(width-12)))*19,0)+8);
    const points=self?[{x:a,y},{x:a+Math.max(65,columnWidth*.37),y},{x:a+Math.max(65,columnWidth*.37),y:y+30},{x:a,y:y+30}]:[{x:a,y},{x:b,y}];
    const supported=['flow','succession','transition'].includes(edge.kind);
    if(!supported)notices.push(`Unsupported sequence message kind: ${edge.kind}. Its native record remains available; no message arrow is inferred.`);
    const result={...edge,semanticId:semanticId(edge),sourceSemanticId:from.semanticId,targetSemanticId:to.semanticId,order:index,points,supported,self,
      labelBox:{x:self?a+12:Math.min(a,b)+12,y:y-labelHeight-5,width,height:labelHeight},text};
    y+=Math.max(78,labelHeight+38)+(self?30:0);return result;
  });
  if(view.fragments?.length)notices.push('Native interaction fragments are not supported by this renderer; their ordering and concurrency are not inferred.');
  return {...view,nodes,edges,notices,width:Math.max(340,30+nodes.length*columnWidth),height:Math.max(220,y+20)};
}

/** Bounded, scrollable native sequence reading region. Selection never scrolls. */
export function mountSequence(host,nativeView,{onSelect=()=>{},onExplore=()=>{},selectedId=null,selectedIds,state={},onStateChange=()=>{}}={}){
  const document=host.ownerDocument,layout=sequenceLayout(nativeView),records=[],selected={value:null,ids:[]};
  const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
  const svg=(tag,attrs={})=>{const e=document.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs))e.setAttribute(k,v);return e;};
  const root=make('section',undefined,'sequence-view');root.setAttribute('aria-label','Sequence view');
  const toolbar=make('div',undefined,'sequence-toolbar');
  const evidence=make('p','Modeled interaction · vertical spacing does not represent elapsed time.','sequence-evidence');
  const explore=make('button','Explore selection');explore.type='button';explore.disabled=true;explore.onclick=()=>{if(selected.value)onExplore(selected.value);};
  toolbar.append(evidence,explore);root.append(toolbar);
  const selectionNotice=make('p','','sequence-selection-notice');selectionNotice.hidden=true;selectionNotice.setAttribute('role','status');root.append(selectionNotice);
  if(layout.notices.length){const notices=make('details',undefined,'sequence-notices');notices.append(make('summary',`${layout.notices.length} native or rendering notices`));const list=make('ul');for(const notice of layout.notices)list.append(make('li',typeof notice==='string'?notice:notice.message??JSON.stringify(notice)));notices.append(list);root.append(notices);}
  const viewport=make('div',undefined,'sequence-viewport');viewport.tabIndex=0;viewport.setAttribute('aria-label','Sequence participants and ordered messages; scroll to reveal more');
  const canvas=make('div',undefined,'sequence-canvas');canvas.style.width=layout.width+'px';canvas.style.height=layout.height+'px';
  const drawing=svg('svg',{width:layout.width,height:layout.height,'aria-hidden':'true',class:'sequence-lines'});
  const markerId=`sequence-arrow-${++serial}`,defs=svg('defs'),marker=svg('marker',{id:markerId,viewBox:'0 0 12 12',refX:11,refY:6,markerWidth:9,markerHeight:9,orient:'auto'});marker.append(svg('path',{d:'M1 1 L11 6 L1 11 Z',fill:'currentColor'}));defs.append(marker);drawing.append(defs);
  canvas.append(drawing);
  const currentState=()=>({scrollLeft:viewport.scrollLeft,scrollTop:viewport.scrollTop,selectedId:selected.ids.length===1?selected.ids[0]:null,...(selected.ids.length>1?{selectedIds:[...selected.ids]}:{})});
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
    const button=make('button',undefined,'sequence-participant');button.append(make('span',`«${node.kind}»`,'sequence-kind'),make('span',labelOf(node)));
    if(node.detail||node.text){button.append(make('span',[node.text,node.detail].filter(Boolean).join('\n'),'sequence-detail'));}
    register(button,{...node,label:labelOf(node)},node);
  }
  for(const edge of layout.edges){
    let path=null;
    if(edge.supported){path=svg('path',{d:edge.points.map((p,i)=>`${i?'L':'M'}${p.x},${p.y}`).join(' '),class:'sequence-message-line','marker-end':`url(#${markerId})`});drawing.append(path);}
    const button=make('button',edge.text||'(unnamed message)','sequence-message');button.setAttribute('aria-label',`Message ${edge.order+1}: ${edge.text||'unnamed'}, ${labelOf(layout.nodes.find(n=>n.id===edge.source))} to ${labelOf(layout.nodes.find(n=>n.id===edge.target))}${edge.self?', self-message':''}`);
    register(button,{...edge,kind:'relationship',relationshipKind:edge.kind,label:edge.label,relationships:[{semanticId:edge.semanticId,sourceSemanticId:edge.sourceSemanticId,targetSemanticId:edge.targetSemanticId,kind:edge.kind,label:edge.label}]},edge.labelBox,path);
  }
  viewport.append(canvas);root.append(viewport);host.replaceChildren(root);
  viewport.scrollLeft=state.scrollLeft??0;viewport.scrollTop=state.scrollTop??0;
  viewport.addEventListener('scroll',()=>onStateChange(currentState()));
  for(const type of ['wheel','pointerdown','touchstart'])viewport.addEventListener(type,event=>event.stopPropagation(),{passive:true});
  if(selectedIds)selectMany(selectedIds);else if(selectedId)select(selectedId);else if(state.selectedIds)selectMany(state.selectedIds);else select(state.selectedId);
  return {
    destroy(){root.remove();},
    getState:currentState,
    select,
    selectMany,
    reveal(id){const item=records.find(item=>item.selection.semanticId===id);if(item)item.button.scrollIntoView?.({block:'nearest',inline:'nearest'});},
    anchors(){const hostBox=host.getBoundingClientRect();return records.filter(item=>item.selection.semanticId).flatMap(item=>{const box=item.button.getBoundingClientRect(),area=viewport.getBoundingClientRect();if(box.right<area.left||box.left>area.right||box.bottom<area.top||box.top>area.bottom)return [];return [{semanticId:item.selection.semanticId,representationId:item.selection.id,x:box.x-hostBox.x,y:box.y-hostBox.y,width:box.width,height:box.height}];});},
  };
}
