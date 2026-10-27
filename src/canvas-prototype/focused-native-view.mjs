/** Optional display facts come from the same loaded native model and renderer. */
import {adaptNativeView,requireNativeIdentity} from './graph.mjs';
import {supportsView} from './view-contract.mjs';

export const FOCUSED_NATIVE_SHOW=Object.freeze([
 'parameter-symbols','port-symbols','typings','edge-labels',
]);
export const FOCUSED_NATIVE_PROFILE='focused-native-v1';

// These are presentation projections, even when their contents contain a native
// selector. Re-rendering them by ID would silently replace their actual meaning.
const projected=view=>view?.transitionOnly===true||view?.projectionOnly===true||
 view?.presentationOnly===true||Boolean(view?.overview)||
 /^(?:explore|overview|transition|projection):/.test(view?.id??'');

/**
 * Create one promise cache per loaded model. Return complete native membership;
 * scope and atomic mode changes belong to the caller. forceNative permits a
 * newly authored source view before it enters the declared-view inventory.
 */
export function createFocusedNativeViews({engine,modelHash,declaredViewIds=[]}={}) {
 if(typeof engine?.call!=='function')throw Error('Focused native views require the semantic engine');
 if(typeof modelHash!=='string'||!modelHash)throw Error('Focused native views require a loaded model identity');
 const declared=new Set(declaredViewIds),cache=new Map();
 async function resolve(view,{forceNative=false}={}) {
  if(!view||projected(view))return view;
  const id=view.id;
  if(typeof id!=='string'||!id||(!forceNative&&!declared.has(id)&&!id.includes('#')))return view;
  let pending=cache.get(id);
  if(!pending){
   pending=Promise.resolve().then(()=>engine.call('RenderView',{
    modelHash,view:id,includeSemanticIdentity:true,show:[...FOCUSED_NATIVE_SHOW],
   })).then(raw=>{
    const native=requireNativeIdentity(adaptNativeView(raw,id));
    if(!supportsView(native))throw Error('Unsupported focused native notation: '+native.kind);
    return native;
   });
   cache.set(id,pending);
  }
  try{
   const native=await pending;
   if(native.kind!==view.kind)throw Error(`Focused native view changed notation from ${view.kind} to ${native.kind}: ${id}`);
   // Keep the shared cache isolated from both callers and later display edits.
   // Never copy old nodes, edges, omissions, ports or narrowed membership back.
   const result=structuredClone(native);
   for(const key of ['title','capture','presentation'])if(Object.hasOwn(view,key))result[key]=structuredClone(view[key]);
   return {...result,id,focusedNative:true,nativeDisplayProfile:FOCUSED_NATIVE_PROFILE};
  }catch(error){
   if(cache.get(id)===pending)cache.delete(id);
   throw error;
  }
 }
 return {resolve};
}
