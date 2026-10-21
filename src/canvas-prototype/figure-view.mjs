import {assetType,appendModelReferences,renderEvidence} from './story-content.mjs';
export function createAssetURLs(files,urlAPI=URL){const urls=new Map();return {get(path){if(!urls.has(path)){const data=files[path];if(data===undefined)throw Error('Missing figure: '+path);urls.set(path,urlAPI.createObjectURL(new Blob([data],{type:assetType(path)})));}return urls.get(path);},destroy(){for(const value of urls.values())urlAPI.revokeObjectURL(value);urls.clear();}};}
export function mountFigure(host,figure,{assetURL,resolve,onSelect,labelFor,state={},onStateChange,onEnlarge}={}){
 const doc=host.ownerDocument,el=(tag,text)=>{const n=doc.createElement(tag);if(text!==undefined)n.textContent=text;return n;};
 host.classList.add('figure-region');const body=el('figure'),image=el('img');image.src=assetURL(figure.asset);image.alt=figure.alt;image.decoding='async';
 const caption=el('figcaption');caption.append(el('p',figure.caption));const refs=el('div');refs.className='model-references';appendModelReferences(refs,figure.modelRefs,{resolve,onSelect,labelFor});caption.append(refs);
 const source=el('details');source.append(el('summary','Figure source'),el('p',figure.provenance.source),el('p',figure.provenance.context));caption.append(source);
 if(figure.evidence)caption.append(renderEvidence(doc,figure.evidence));
 if(onEnlarge){const b=el('button','Enlarge figure');b.type='button';b.onclick=()=>onEnlarge(figure);caption.prepend(b);}
 body.append(image,caption);host.replaceChildren(body);for(const [i,d]of [...host.querySelectorAll('details')].entries())d.open=state.open?.[i]??false;host.scrollTop=state.scrollTop??0;
 const getState=()=>({scrollTop:host.scrollTop,open:[...host.querySelectorAll('details')].map(d=>d.open)});host.onscroll=()=>onStateChange?.(getState());
 return {getState,destroy(){host.onscroll=null;host.replaceChildren();},anchors:()=>[],selectMany(ids){for(const b of host.querySelectorAll('[data-model-id]'))b.classList.toggle('selected',ids.includes(b.dataset.modelId));}};
}
