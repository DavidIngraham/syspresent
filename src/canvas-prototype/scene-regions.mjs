import {focusedFace,focusedEdgeAppearance,focusedNotationNotices} from './focused-notation.mjs';
import {layoutDiagram} from './elk-layout.mjs';
import {fitDiagram} from './geometry.mjs';
import {edgeAppearance,markerDefinition} from './notation.mjs';
import {connectionPath} from './routing-style.mjs';
import {behaviorFace} from './behavior-view.mjs';
import {createCamera,bindCameraControls} from './camera.mjs';

/** Narrow displays keep full-size content behind explicit region tabs. */
export function regionAreas(area, regions, active='primary') {
  if(regions.length<2)return regions.map(region=>({...region,area:{...area},visible:true}));
  const narrow=area.width<760,gap=16,header=36,width=(area.width-gap*(regions.length-1))/regions.length;
  return regions.map((region,i)=>({...region,visible:!narrow||region.id===active,
    area:{x:narrow?area.x:area.x+i*(width+gap),y:area.y+header,width:narrow?area.width:width,height:Math.max(80,area.height-header)}}));
}
let serial=0;
/** Preserve author metadata and allocate collision-free IDs, including repeated views. */
export function updateRegionReferences(previous,names) {
  const remaining=[...previous],used=new Set(previous.map(r=>r.id)),result=[];
  for(const view of names){
    const index=remaining.findIndex(r=>r.view===view);
    if(index>=0){result.push({...remaining.splice(index,1)[0],view});continue;}
    let i=1;while(used.has('region-'+i))i++;const id='region-'+i;used.add(id);result.push({id,view});
  }
  return result;
}
/** Secondary graph regions use the same native layout/notation but an independent camera. */
export async function mountGraphRegion(host,view,{onSelect,onExplore,selectedId,selectedIds:sharedIds,state={},onStateChange,elk,routing='square',renderingMode='exploratory',graph,measureLabel}={}) {
  const doc=host.ownerDocument,ns='http://www.w3.org/2000/svg';
  const svg=(name,attrs={})=>{const node=doc.createElementNS(ns,name);for(const [k,v]of Object.entries(attrs))node.setAttribute(k,v);return node;};
  const width=host.clientWidth||480,height=host.clientHeight||400;
  const layout=await layoutDiagram(view,{width,height,elk,measureLabel});
  const fitted=fitDiagram(layout,{x:0,y:0,width,height});
  const viewport=doc.createElement('div');viewport.className='region-graph';viewport.tabIndex=0;viewport.setAttribute('aria-label',view.title||'Model graph');
  const world=doc.createElement('div');world.className='region-world';viewport.append(world);
  const drawing=svg('svg',{width,height,'aria-label':'Model relationships'}),defs=svg('defs'),prefix='region-'+(++serial)+'-';
  for(const name of ['open-arrow','filled-arrow','hollow-triangle','diamond','hollow-diamond','containment','definition-two-dot','owned-membership']){
    const {path,fill,adornments=[],...attrs}=markerDefinition(name),marker=svg('marker',{...attrs,id:prefix+name,markerUnits:'userSpaceOnUse'});
    for(const shape of [{path,fill},...adornments])marker.append(svg('path',{d:shape.path,fill:shape.fill==='line'?'#426869':shape.fill==='background'?'#fff':'none',stroke:'#426869'}));defs.append(marker);
  }
  drawing.append(defs);world.append(drawing);const targets=[],edgeTargets=[],notices=[...(renderingMode==='focused'?focusedNotationNotices(view,graph):[]),...(view.notices??[]),...(layout.diagnostics??[]).map(d=>d.message||d.reason)];
  for(const edge of fitted.edges){
    const appearance=(renderingMode==='focused'?focusedEdgeAppearance:edgeAppearance)(edge,{viewKind:view.kind}),a=fitted.nodes.find(n=>n.id===edge.source),b=fitted.nodes.find(n=>n.id===edge.target);
    if(!appearance.supported)notices.push(appearance.notice);
    const record={semanticId:edge.semanticId,kind:'relationship',label:edge.label||edge.kind,relationships:[{semanticId:edge.semanticId,sourceSemanticId:a?.semanticId,targetSemanticId:b?.semanticId,kind:edge.kind,label:edge.label}]};
    if(!edge.points?.length||edge.routingBlocked){notices.push(`Connection route unavailable: ${edge.label||edge.kind}`);continue;}
    const g=svg('g',{tabindex:0,role:'button','aria-label':record.label});
    const path=svg('path',{d:connectionPath(edge.points,{style:routing,edge,nodes:fitted.nodes}),fill:'none',stroke:'#426869','stroke-width':1.5});
    for(const [side,marker]of [['start',appearance.sourceMarker],['end',appearance.targetMarker]])if(marker!=='none')path.setAttribute('marker-'+side,`url(#${prefix+marker})`);
    if(appearance.line==='dashed')path.setAttribute('stroke-dasharray','5 3');
    const hit=path.cloneNode();hit.setAttribute('stroke','transparent');hit.setAttribute('stroke-width',16);
    g.append(hit,path);
    if(edge.label&&!edge.labelOmitted&&Number.isFinite(edge.x)&&Number.isFinite(edge.y)){const label=svg('text',{x:edge.x,y:edge.y,'font-size':12,fill:'#355e60','paint-order':'stroke',stroke:'white','stroke-width':3});label.textContent=edge.label;g.append(label);}
    const choose=()=>{select(record.semanticId);changed();onSelect?.(record);};
    g.onclick=e=>{e.stopPropagation();choose();};g.onkeydown=e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();choose();}};drawing.append(g);edgeTargets.push({node:g,semanticId:edge.semanticId});
  }
  for(const n of fitted.nodes){
    const node=doc.createElement('button');node.className=`node ${n.kind}${n.container?' container':''}`;node.dataset.semanticId=n.semanticId??'';
    const scale=fitted.scale||1;node.style.cssText=`left:${n.x}px;top:${n.y}px;width:${n.width/scale}px;height:${n.height/scale}px;transform:scale(${scale});z-index:${n.container?1:3}`;
    const face=renderingMode==='focused'?focusedFace(doc,n,graph):behaviorFace(doc,n);
    if(face)node.append(face);else{for(const [cls,text]of [['kind',`«${n.kind}»`],['name',n.name],['detail',n.displayDetail]])if(text){const span=doc.createElement('span');span.className=cls;span.textContent=text;node.append(span);}}
    node.onclick=e=>{e.stopPropagation();select(n.semanticId);changed();onSelect?.({semanticId:n.semanticId,name:n.name,label:n.name,kind:'element'});};world.append(node);targets.push({node,n});
  }
  host.replaceChildren(viewport);if(notices.length){const details=doc.createElement('details');details.className='region-notices';const summary=doc.createElement('summary');summary.textContent=`View notices (${notices.length})`;details.append(summary);for(const notice of notices){const p=doc.createElement('p');p.textContent=typeof notice==='string'?notice:JSON.stringify(notice);details.append(p);}host.append(details);}let camera=createCamera(state.camera),selected=selectedId,selectedIds=sharedIds??state.selectedIds??[selectedId].filter(Boolean);
  const changed=()=>onStateChange?.({camera,selectedId:selected,selectedIds:[...selectedIds]});
  const update=value=>{camera=createCamera(value);world.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;changed();};
  const cleanup=bindCameraControls({element:viewport,getCamera:()=>camera,setCamera:update,shouldHandleTarget:target=>target===viewport||target===world||target===drawing});
  function selectMany(ids){selectedIds=[...new Set(ids.filter(Boolean))];selected=selectedIds.length===1?selectedIds[0]:null;for(const {node,n}of targets)node.classList.toggle('selected',selectedIds.includes(n.semanticId));for(const target of edgeTargets){const active=selectedIds.includes(target.semanticId);target.node.classList.toggle('selected',active);target.node.setAttribute('aria-pressed',String(active));}}
  function select(id){selectMany([id]);}
  world.style.transform=`translate(${camera.x}px,${camera.y}px) scale(${camera.scale})`;selectMany(selectedIds);
  return {destroy(){cleanup();viewport.remove();},getState:()=>({camera:{...camera},selectedId:selected,selectedIds:[...selectedIds]}),select,selectMany,
    reveal(id){const n=targets.find(t=>t.n.semanticId===id)?.n;if(n)update({...camera,x:width/2-(n.x+n.width/2)*camera.scale,y:height/2-(n.y+n.height/2)*camera.scale});},
    anchors:()=>targets.filter(t=>t.n.semanticId).map(({n})=>({semanticId:n.semanticId,representationId:n.id,x:n.x*camera.scale+camera.x,y:n.y*camera.scale+camera.y,width:n.width*camera.scale,height:n.height*camera.scale}))};
}
