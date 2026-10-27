import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {mountGraphRegion} from '../src/canvas-prototype/scene-regions.mjs';
const source=()=>({
 id:'NativeViews::derivation',kind:'requirement',title:'Native derivation',
 nodes:[{id:'derived-node',semanticId:'derived',kind:'requirement',name:'derived',width:180,height:76},{id:'original-node',semanticId:'original',kind:'requirement',name:'original',width:180,height:76}],
 edges:[{id:'edge',semanticId:'native-derivation',name:'nativeDerivation',source:'derived-node',target:'original-node',kind:'derive',label:'exploratory old label',notation:{production:'derivation',sourceRole:'derived',targetRole:'original',sourceEndName:'derivedEnd',targetEndName:'originalEnd'}}]
});
const graph=()=>({elements:[{id:'derived',kind:'RequirementUsage',name:'derived',native:{declaredName:'derived'}},{id:'original',kind:'RequirementUsage',name:'original',native:{declaredName:'original'}}],relationships:[],containment:[]});
function hostFor(){const doc=new JSDOM('<section id="host"></section>').window.document,host=doc.getElementById('host');Object.defineProperty(host,'clientWidth',{value:720});Object.defineProperty(host,'clientHeight',{value:620});return host;}
const measureLabel=text=>({width:text.length*5,height:14});

test('secondary focused graph measures native faces and displays native directed end labels before selection',async()=>{
 const host=hostFor(),view=source(),before=structuredClone(view),selected=[];
 const controller=await mountGraphRegion(host,view,{elk:new ELK(),graph:graph(),renderingMode:'focused',measureLabel,onSelect:item=>selected.push(item)});
 try{
  assert.equal(host.querySelectorAll('.focused-face').length,2);assert.equal(host.querySelectorAll('.endpoint-label').length,2);
  assert.deepEqual([...host.querySelectorAll('.endpoint-label')].map(item=>[item.dataset.end,item.dataset.role,item.textContent]),[['source','derived','derivedEnd'],['target','original','originalEnd']]);
  assert.ok([...host.querySelectorAll('.endpoint-label')].every(item=>Number(item.getAttribute('font-size'))>0));
  assert.ok([...host.querySelectorAll('svg text')].some(item=>item.textContent==='nativeDerivation'));
  assert.equal([...host.querySelectorAll('svg text')].some(item=>item.textContent==='exploratory old label'),false);
  assert.match(host.textContent,/Requirement derivation is rendered as its native ConnectionUsage base/,'supported native-base note must remain visible');
  host.querySelector('svg g[role="button"]').dispatchEvent(new host.ownerDocument.defaultView.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.equal(selected[0].semanticId,'native-derivation');assert.equal(selected[0].relationships[0].sourceSemanticId,'derived');assert.equal(selected[0].relationships[0].targetSemanticId,'original');
  assert.deepEqual(view,before,'secondary preparation must not edit native view source');
 }finally{controller.destroy();}
});

test('secondary focused graph reports unplaceable end labels and retains relationship selection',async()=>{
 const host=hostFor(),view=source(),selected=[];
 const controller=await mountGraphRegion(host,view,{elk:new ELK(),graph:graph(),renderingMode:'focused',measureLabel:text=>({width:/^(derivedEnd|originalEnd)$/.test(text)?1e7:80,height:14}),onSelect:item=>selected.push(item)});
 try{
  assert.equal(host.querySelectorAll('.endpoint-label').length,0);assert.match(host.textContent,/end-label-space/);assert.match(host.textContent,/native connector end/);
  host.querySelector('svg g[role="button"]').dispatchEvent(new host.ownerDocument.defaultView.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.equal(selected[0].semanticId,'native-derivation');assert.deepEqual(view,source());
 }finally{controller.destroy();}
});
