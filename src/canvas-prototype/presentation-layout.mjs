/** Portable presentation offsets. This file contains no model selection, native
 * relationship, credentials, model hash, viewport snapshot or evaluated value. */
import {manualLayoutSupport,applyManualPositions} from './manual-layout.mjs';
export const PRESENTATION_LAYOUT_FILE='syspresent-layouts.json';
export const PRESENTATION_LAYOUT_SCHEMA='syspresent.presentation-layouts.v1';
const string=value=>typeof value==='string'&&value.length>0&&value.length<=8192;
const finite=value=>Number.isFinite(value);
const identity=item=>JSON.stringify([item.semanticId,item.representationId]);
const parentIdentity=(layout,node)=>{const parent=layout.nodes.find(n=>n.id===node.parentId);return {parentSemanticId:parent?.semanticId??null,parentRepresentationId:node.parentId??null};};
const areaFor=area=>{if(!area||![area.x,area.y,area.width,area.height].every(finite)||area.width<=0||area.height<=0)throw Error('Presentation layout needs a finite positive drawing area.');return area;};
export function presentationViewKey(view){if(!string(view?.id)||!string(view.kind))throw Error('Presentation layout requires a native view identity and kind.');return JSON.stringify([view.id,view.kind]);}
function validateSnapshot(snapshot){
 if(!snapshot||snapshot.schemaVersion!==PRESENTATION_LAYOUT_SCHEMA||!Array.isArray(snapshot.views)||snapshot.views.length>1000)throw Error('Invalid presentation layout file.');
 const seen=new Set();let count=0;
 const views=snapshot.views.map(record=>{
  if(!record||typeof record!=='object')throw Error('Invalid presentation layout view.');
  const key=presentationViewKey({id:record.viewId,kind:record.viewKind});if(seen.has(key)||!Array.isArray(record.placements)||record.placements.length>5000||(count+=record.placements.length)>20000)throw Error('Invalid or duplicate presentation layout view.');seen.add(key);
  const identities=new Set(),placements=record.placements.map(item=>{
   if(!string(item?.semanticId)||!string(item.representationId)||!item.offset||![item.offset.x,item.offset.y].every(finite)||[item.parentSemanticId,item.parentRepresentationId].some(id=>id!==null&&!string(id)))throw Error('Invalid presentation placement identity or coordinates.');
   const key=identity(item);if(identities.has(key))throw Error('Duplicate presentation placement.');identities.add(key);
   return {semanticId:item.semanticId,representationId:item.representationId,parentSemanticId:item.parentSemanticId,parentRepresentationId:item.parentRepresentationId,offset:{x:item.offset.x,y:item.offset.y}};
  });
  return {viewId:record.viewId,viewKind:record.viewKind,placements};
 });
 return {schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views};
}
export function createPresentationLayouts(initial={schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[]}){
 let views;
 const fromSnapshot=value=>{const validated=validateSnapshot(value);views=new Map(validated.views.map(record=>[presentationViewKey({id:record.viewId,kind:record.viewKind}),record]));};
 fromSnapshot(initial);
 const snapshot=()=>({schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[...views.values()].map(record=>structuredClone(record)).sort((a,b)=>presentationViewKey({id:a.viewId,kind:a.viewKind}).localeCompare(presentationViewKey({id:b.viewId,kind:b.viewKind})))});
 const store={
  snapshot,toJSON:snapshot,fromSnapshot(value){fromSnapshot(value);return store;},clone(){return createPresentationLayouts(snapshot());},
  clear(view){if(view===undefined)views.clear();else views.delete(presentationViewKey(view));},
  has(view){return views.has(presentationViewKey(view));},
  /** Absolute positions are measured against the automatic layout before any
   * manual placement is applied; only normalized displacement is serialized. */
  capture(view,layout,{positions={},area}={}){
   const drawing=areaFor(area),key=presentationViewKey(view),placements=[];
   for(const [id,position]of Object.entries(positions)){
    const node=layout.nodes.find(n=>n.id===id),support=manualLayoutSupport({...layout,kind:view.kind},id);
    if(!support.supported)throw Error(support.reason);if(!position||![position.x,position.y,node.x,node.y].every(finite))throw Error('Presentation coordinates must be finite.');
    placements.push({semanticId:node.semanticId,representationId:node.id,...parentIdentity(layout,node),offset:{x:(position.x-node.x)/drawing.width,y:(position.y-node.y)/drawing.height}});
   }
   // Validate final arrangement as a batch: swapping peers is legal.
   applyManualPositions({...layout,kind:view.kind},positions,{area});
   const record={viewId:view.id,viewKind:view.kind,placements};validateSnapshot({schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[record]});views.set(key,record);return store;
  },
  restore(view,layout,{area,measureLabel}={}){
   const drawing=areaFor(area),record=views.get(presentationViewKey(view)),positions=Object.create(null),omissions=[];if(!record)return {positions,omissions};
   for(const saved of record.placements){
    const matches=layout.nodes.filter(n=>n.id===saved.representationId&&n.semanticId===saved.semanticId),node=matches[0];
    if(matches.length!==1){omissions.push({reason:'layout-missing-representation',target:saved.semanticId,representationId:saved.representationId,message:'Saved placement has no unique native representation in this view; automatic layout is retained.'});continue;}
    const parent=parentIdentity(layout,node);if(parent.parentSemanticId!==saved.parentSemanticId||parent.parentRepresentationId!==saved.parentRepresentationId){omissions.push({reason:'layout-parent-changed',target:saved.semanticId,representationId:saved.representationId,message:'Native drawing containment changed; automatic layout is retained.'});continue;}
    const support=manualLayoutSupport({...layout,kind:view.kind},node.id);if(!support.supported){omissions.push({reason:'layout-unsupported',target:saved.semanticId,representationId:saved.representationId,message:support.reason});continue;}
    const position={x:node.x+saved.offset.x*drawing.width,y:node.y+saved.offset.y*drawing.height};if(![position.x,position.y].every(finite)){omissions.push({reason:'layout-invalid-coordinates',target:saved.semanticId,representationId:saved.representationId,message:'Saved displacement is not finite in this viewport; automatic layout is retained.'});continue;}positions[node.id]=position;
   }
   try{applyManualPositions({...layout,kind:view.kind},positions,{area,measureLabel});}
   catch(error){for(const id of Object.keys(positions)){omissions.push({reason:'layout-conflict',target:layout.nodes.find(n=>n.id===id)?.semanticId,representationId:id,message:'Saved arrangement cannot be safely restored: '+error.message});delete positions[id];}}
   return {positions,omissions};
  },
  /** Explicit capture may create different representation IDs. Rebind only
   * unique native semantic + containing-semantic correspondence; no label match. */
  alias(sourceView,targetView,targetLayout){
   const source=views.get(presentationViewKey(sourceView)),omissions=[];if(!source)return {omissions,retained:0};
   const placements=[];
   for(const saved of source.placements){
    const matches=targetLayout.nodes.filter(node=>node.semanticId===saved.semanticId&&parentIdentity(targetLayout,node).parentSemanticId===saved.parentSemanticId);
    const sourcePeers=source.placements.filter(item=>item.semanticId===saved.semanticId&&item.parentSemanticId===saved.parentSemanticId);
    if(matches.length!==1||sourcePeers.length!==1){omissions.push({reason:'layout-ambiguous-capture',target:saved.semanticId,message:'Captured view has no unique native representation correspondence for this placement.'});continue;}
    const node=matches[0],support=manualLayoutSupport({...targetLayout,kind:targetView.kind},node.id);if(!support.supported){omissions.push({reason:'layout-unsupported',target:saved.semanticId,message:support.reason});continue;}
    placements.push({...structuredClone(saved),representationId:node.id,...parentIdentity(targetLayout,node)});
   }
   views.set(presentationViewKey(targetView),{viewId:targetView.id,viewKind:targetView.kind,placements});return {omissions,retained:placements.length};
  },
 };
 return store;
}
export function loadPresentationLayouts(project){
 const bytes=project?.files?.[PRESENTATION_LAYOUT_FILE];if(bytes===undefined)return createPresentationLayouts();
 const text=typeof bytes==='string'?bytes:new TextDecoder().decode(bytes);if(text.length>8*1024*1024)throw Error('Presentation layout file exceeds size limit.');
 let value;try{value=JSON.parse(text);}catch{throw Error('Invalid presentation layout JSON.');}return createPresentationLayouts(value);
}
/** Return a candidate project. The caller commits it only after validation; a
 * failed save leaves both the project and system model source bytes intact. */
export function savePresentationLayouts(project,store){
 if(!project?.files||!project.manifest)throw Error('Presentation layouts require a loaded project.');
 if(Object.hasOwn(project.files,PRESENTATION_LAYOUT_FILE))loadPresentationLayouts(project);
 const snapshot=validateSnapshot(store.snapshot());
 return {...project,files:{...project.files,[PRESENTATION_LAYOUT_FILE]:JSON.stringify(snapshot,null,2)+'\n'},manifest:{...project.manifest,assets:[...new Set([...(project.manifest.assets??[]),PRESENTATION_LAYOUT_FILE])].sort()}};
}
