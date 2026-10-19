import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM,VirtualConsole} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {packProject} from '../src/canvas-prototype/project.mjs';
const {outputFiles}=await build({entryPoints:['src/canvas-prototype/app.mjs'],bundle:true,format:'iife',write:false,logLevel:'silent'});
const html=await readFile('src/canvas-prototype/index.html','utf8');
const raw=[{'@id':'orphan','@type':'PartUsage',qualifiedName:'Model::orphan',declaredName:'orphan','sysx:sourceLine':4},{'@id':'Model','@type':'Package',qualifiedName:'Model',declaredName:'Model','sysx:sourceLine':1},{'@id':'req','@type':'RequirementUsage',qualifiedName:'Model::req',declaredName:'req','sysx:sourceLine':2},{'@id':'part','@type':'PartUsage',qualifiedName:'Model::part',declaredName:'part','sysx:sourceLine':3},{'@id':'view','@type':'ViewUsage',qualifiedName:'Views::requirements','sysx:sourceLine':1}];
const native={kind:'requirement',nodes:[{id:'r',semanticId:'req',identityStatus:'mapped',name:'req',kind:'requirement'},{id:'p',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{from:'p',to:'r',kind:'satisfy',label:'satisfy'}]};
const coverage={kind:'requirement',nodes:native.nodes,edges:native.edges};
const manifest={schemaVersion:'syspresent.project.v1',title:'Fixture',systemOfInterest:['Model'],modelSources:['model.sysml'],viewSources:['views.sysml'],story:'story.md',assets:[],publication:{scope:'complete'}};
const files={'model.sysml':'package Model {}','views.sysml':'package Views {}','story.md':'```syspresent\n'+JSON.stringify({type:'scene',id:'one',title:'Control the part',view:'Views::requirements',focus:'Model::req'})+'\n```\n\nReader context.'};
const until=async predicate=>{for(let i=0;i<1000;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('UI did not settle');};
async function harness({reducedMotion=true,secondScene=false,contextNeighbor=false,size={width:1000,height:700}}={}){
 let resizeCallback;const fixtureFiles={...files};if(secondScene)fixtureFiles['story.md']+='\n\n```syspresent\n'+JSON.stringify({type:'scene',id:'two',title:'Other scene',view:'Views::other',focus:'Model::orphan'})+'\n```\n\nOther context.';
 let pendingRender,holdLayout=false;const heldLayouts=[];
 const window=new JSDOM(html,{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}).window;
 window.matchMedia=()=>({matches:reducedMotion});window.Element.prototype.animate=function(){let done;const finished=new Promise(resolve=>done=resolve);return {finished,cancel:()=>done()};};window.structuredClone=structuredClone;window.ResizeObserver=class{constructor(fn){resizeCallback=fn;}observe(){}};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{get(){return size.width;}});Object.defineProperty(window.HTMLElement.prototype,'clientHeight',{get(){return size.height;}});
 window.fetch=async url=>({ok:true,arrayBuffer:async()=>packProject({manifest,files:fixtureFiles}).buffer,json:async()=>String(url).includes('project.json')?manifest:{version:'fixture'},text:async()=>files[String(url).split('/').at(-1)]});
 window.Worker=class{constructor(url){this.layout=String(url).includes('elk-worker')?new ELK():null;}postMessage(message){const {id,method,params}=message;if(message.cmd){if(message.cmd==='layout')this.layout.layout(structuredClone(message.graph)).then(data=>{const reply=()=>this.onmessage({data:{id,data}});if(holdLayout){holdLayout=false;heldLayouts.push(error=>error?this.onmessage({data:{id,error:{message:error}}}):reply());}else reply();});else queueMicrotask(()=>this.onmessage({data:{id,data:{}}}));return;}const respond=result=>queueMicrotask(()=>this.onmessage({data:{id,result}}));
  if(method==='Initialize')respond({version:'test'});
  else if(method==='ParseSources')respond({modelHash:'fixture',roots:[{childIds:['Model']}],diagnostics:params.documents.some(d=>d.content.includes('BROKEN'))?[{severity:'error',message:'Native parse rejected broken view'}]:[]});
  else if(method==='ExportModel')respond({elements:structuredClone([...raw,...(secondScene?[{'@id':'view2','@type':'ViewUsage',qualifiedName:'Views::other','sysx:sourceLine':2}]:[]),...(contextNeighbor?[{'@id':'neighbor-link','@type':'Dependency',client:[{'@id':'req'}],supplier:[{'@id':'orphan'}]}]:[])])});
  else if(method==='RenderView'&&params.view==='Views::other')respond({kind:'requirement',nodes:[{id:'o',semanticId:'orphan',identityStatus:'mapped',name:'orphan',kind:'part'}],edges:[]});
  else if(method==='RenderView'&&params.view.startsWith('#'))pendingRender=()=>respond({kind:'interconnection',nodes:[native.nodes[1]],edges:[]});
  else if(method==='RenderView')respond(params.view.endsWith('::coverage')?coverage:structuredClone(native));
 }terminate(){}};
 window.eval(outputFiles[0].text);await until(()=>window.document.querySelectorAll('.node[data-context=\"false\"]').length===2&&window.document.getElementById('status').textContent.startsWith('OpenSysML WASM')).catch(e=>{throw Error(e.message+': '+window.document.getElementById('status').textContent);});
 return {window,document:window.document,resize:(width,height)=>{size.width=width;size.height=height;resizeCallback?.();},release:()=>pendingRender?.(),pending:()=>!!pendingRender,holdLayout:()=>{holdLayout=true;},layoutPending:()=>heldLayouts.length>0,releaseLayout:error=>heldLayouts.splice(0).forEach(reply=>reply(error))};
}
test('a delayed native view cannot overwrite a newer scene navigation',async()=>{
 const h=await harness(),d=h.document;
 d.querySelector('[data-semantic-id="part"]').click();[...d.querySelectorAll('#selection button')].find(e=>e.textContent==='Internal view').click();
 await until(h.pending);d.getElementById('scenes').dispatchEvent(new h.window.Event('change'));h.release();
 await until(()=>d.querySelectorAll('.node').length===2);await new Promise(r=>setTimeout(r,15));
 assert.equal(d.querySelectorAll('.node').length,2);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.equal(d.getElementById('return').hidden,true);h.window.close();
});
test('native view validation failure retains the previous project and visible scene',async()=>{
 const h=await harness(),d=h.document;d.getElementById('edit').click();d.getElementById('view-source').value='BROKEN';d.getElementById('apply-views').click();
 await until(()=>d.getElementById('editor-error').textContent.includes('Native parse rejected'));
 assert.equal(d.querySelectorAll('.node').length,2);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.equal(d.getElementById('fit').disabled,false);
 d.getElementById('fit').click();assert.equal(d.querySelectorAll('.node').length,2);h.window.close();
});

test('return restores the authored scene after a deliberate disconnected exploration',async()=>{
 const h=await harness(),d=h.document;d.getElementById('find-toggle').click();const search=d.getElementById('search');search.value='orphan';search.dispatchEvent(new h.window.Event('input'));d.querySelector('#search-results button').click();
 await until(()=>d.getElementById('narrative').hidden&&d.querySelectorAll('.node').length===1);
 assert.match(d.getElementById('transition').textContent,/explicit view jump/);d.getElementById('return').click();
 await until(()=>!d.getElementById('narrative').hidden&&d.querySelectorAll('.node').length===2&&d.getElementById('return').hidden);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');h.window.close();
});

test('cancelled explicit-jump animation cannot commit over a newer restored scene',async()=>{
 const h=await harness({reducedMotion:false}),d=h.document;d.getElementById('find-toggle').click();const search=d.getElementById('search');search.value='orphan';search.dispatchEvent(new h.window.Event('input'));d.querySelector('#search-results button').click();
 await until(()=>d.getElementById('transition').textContent.includes('explicit view jump'));
 d.getElementById('reduce').click();d.getElementById('return').click();await until(()=>d.querySelectorAll('.node').length===2&&!d.getElementById('narrative').hidden);await new Promise(r=>setTimeout(r,15));d.getElementById('fit').click();
 assert.equal(d.querySelectorAll('.node').length,2);assert.equal(d.getElementById('return').hidden,true);h.window.close();
});

test('exploring a scene keeps its native diagram and gives the canvas the prose space',async()=>{
 const h=await harness(),d=h.document;const identities=[...d.querySelectorAll('.node')].map(e=>e.dataset.semanticId);d.getElementById('standalone').click();await until(()=>d.getElementById('narrative').hidden);
 assert.deepEqual([...d.querySelectorAll('.node')].map(e=>e.dataset.semanticId),identities);await until(()=>d.getElementById('status').textContent.includes('Explore this native view'));h.window.close();
});

test('Fit during a journey completes the current destination instead of restoring the previous diagram',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 d.getElementById('fit').click();await until(()=>d.getElementById('stage').dataset.motionProgress===undefined&&d.querySelectorAll('.node[data-context="false"]').length===1);
 assert.equal(d.querySelector('.node[data-context="false"]').dataset.semanticId,'orphan');assert.equal(d.querySelector('#narrative h2').textContent,'Other scene');assert.equal(d.getElementById('scenes').value,'1');h.window.close();
});
test('viewport changes during a journey rebuild and settle the intended destination',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 h.resize(390,650);await new Promise(resolve=>setTimeout(resolve,120));d.getElementById('reduce').click();
 await until(()=>d.getElementById('stage').dataset.motionProgress===undefined&&d.getElementById('scenes').value==='1');
 assert.equal(d.querySelector('.node[data-context="false"]').dataset.semanticId,'orphan');assert.equal(d.getElementById('connections').getAttribute('viewBox'),'0 0 390 650');h.window.close();
});
test('space-limited peripheral context has visible boundary markers and retains its directed native link',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:120,height:140}}),d=h.document;
 const marker=d.querySelector('.context-boundary');assert.ok(marker,d.getElementById('nodes').outerHTML+' STATUS '+d.getElementById('status').textContent);assert.equal(marker.hidden,false);assert.equal(marker.getAttribute('aria-hidden'),'false');
 const edge=d.querySelector('#connections g[data-context="true"]');assert.equal(edge.dataset.source,'req');assert.equal(edge.dataset.target,'orphan');assert.ok(Number(edge.style.opacity)>0&&Number(edge.style.opacity)<1);const coordinates=[...edge.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d').matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));assert.ok(coordinates.length>=2,'context path must remain visible');for(let i=1;i<coordinates.length;i++)assert.ok(coordinates[i].x===coordinates[i-1].x||coordinates[i].y===coordinates[i-1].y,'settled context routes retain exact orthogonal bends');h.window.close();
});

test('connection selection traces the full relationship without moving tiles',async()=>{
 const h=await harness(),d=h.document,before=[...d.querySelectorAll('.node')].map(n=>n.style.transform),edge=d.querySelector('#connections g[data-relationship]');
 assert.equal(edge.getAttribute('tabindex'),'0');edge.dispatchEvent(new h.window.MouseEvent('click',{bubbles:true}));assert.ok(edge.classList.contains('traced'));assert.equal(d.querySelectorAll('.trace-endpoint').length,2);assert.deepEqual([...d.querySelectorAll('.node')].map(n=>n.style.transform),before);assert.ok(edge.querySelector('.edge-hit'));assert.equal(edge.querySelector('.edge-line').getAttribute('marker-end'),'url(#edge-open-arrow)');h.window.close();
});
test('an older asynchronous layout cannot replace a newer scene',async()=>{
 const h=await harness({secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);d.getElementById('scenes').value='0';d.getElementById('scenes').dispatchEvent(new h.window.Event('change'));await until(()=>d.querySelector('#narrative h2').textContent==='Control the part'&&d.querySelectorAll('.node[data-context="false"]').length===2);h.releaseLayout();await new Promise(r=>setTimeout(r,30));assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.equal(d.querySelectorAll('.node[data-context="false"]').length,2);for(const n of d.querySelectorAll('.node'))assert.ok(!n.style.transform.includes('NaN'));h.window.close();
});

test('a rejected obsolete layout cannot restore stale prose over the newer model',async()=>{
 const h=await harness({secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);d.getElementById('scenes').value='1';d.getElementById('scenes').dispatchEvent(new h.window.Event('change'));await until(()=>d.querySelectorAll('.node[data-context="false"]').length===1);h.releaseLayout('obsolete layout failed');await new Promise(r=>setTimeout(r,30));assert.equal(d.querySelector('#narrative h2').textContent,'Other scene');assert.equal(d.getElementById('scenes').value,'1');assert.equal(d.querySelector('.node[data-context="false"]').dataset.semanticId,'orphan');assert.ok(!d.getElementById('status').textContent.includes('obsolete'));assert.equal(d.querySelectorAll('.narrative-outgoing').length,0);h.window.close();
});

test('focused relationship touch targets are above translucent context targets',async()=>{
 const h=await harness({contextNeighbor:true}),groups=[...h.document.querySelectorAll('#connections g[data-relationship]')];assert.ok(groups.some(g=>g.dataset.context==='true'));assert.equal(groups.at(-1).dataset.context,'false');assert.equal(groups.at(-1).querySelector('.edge-hit').getAttribute('stroke-width'),'18');assert.equal(groups.find(g=>g.dataset.context==='true').querySelector('.edge-hit').getAttribute('stroke-width'),'8');h.window.close();
});
