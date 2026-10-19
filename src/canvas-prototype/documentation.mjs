/** Full statements come from native documentation and explicit direct typing. */
const indexes=new WeakMap();
export function documentationFor(graph,id){
 let index=indexes.get(graph);if(!index){index=new Map((graph?.elements??[]).map(e=>[e.id,e]));if(graph)indexes.set(graph,index);}const own=index.get(id);
 if(own?.description)return {text:own.description,source:own};
 const types=own?.native?.type;const references=Array.isArray(types)?types:types?[types]:[];
 for(const reference of references){const type=index.get(reference?.['@id']);if(type?.description)return {text:type.description,source:type};}
 return {text:'',source:own};
}
/** Measure the real styled card at its final unscaled width; no character-count height guess. */
export function measureCard(document,node,detail){
 const width=Math.max(Number(node.width)||0,detail?280:160);
 const card=document.createElement('div');card.className='node';card.style.cssText=`position:fixed;left:-10000px;top:0;visibility:hidden;width:${width}px;height:auto;transform:none;`;
 for(const [className,text] of [['kind',`«${node.kind}»${node.displayID?' '+node.displayID:''}${node.type?' : '+node.type:''}`],['name',(node.name?.split('::').at(-1)||node.kind).replace(/([a-z0-9])([A-Z])/g,'$1\u200b$2')],...(detail?[['detail',detail]]:[])]){const part=document.createElement('span');part.className=className;part.textContent=text;card.append(part);}
 document.body.append(card);const height=Math.max(76,Math.ceil(card.getBoundingClientRect().height),card.scrollHeight);card.remove();return {width,height};
}
