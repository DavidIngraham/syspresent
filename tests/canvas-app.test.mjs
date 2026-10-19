import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM,VirtualConsole} from 'jsdom';
import {packProject} from '../src/canvas-prototype/project.mjs';
const {outputFiles}=await build({entryPoints:['src/canvas-prototype/app.mjs'],bundle:true,format:'iife',write:false,logLevel:'silent'});
const html=await readFile('src/canvas-prototype/index.html','utf8');
const raw=[{'@id':'orphan','@type':'PartUsage',qualifiedName:'Model::orphan',declaredName:'orphan','sysx:sourceLine':4},{'@id':'Model','@type':'Package',qualifiedName:'Model',declaredName:'Model','sysx:sourceLine':1},{'@id':'req','@type':'RequirementUsage',qualifiedName:'Model::req',declaredName:'req','sysx:sourceLine':2},{'@id':'part','@type':'PartUsage',qualifiedName:'Model::part',declaredName:'part','sysx:sourceLine':3},{'@id':'view','@type':'ViewUsage',qualifiedName:'Views::requirements','sysx:sourceLine':1}];
const native={kind:'requirement',nodes:[{id:'r',semanticId:'req',identityStatus:'mapped',name:'req',kind:'requirement'},{id:'p',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{from:'p',to:'r',kind:'satisfy',label:'satisfy'}]};
const coverage={kind:'requirement',nodes:native.nodes,edges:native.edges};
const manifest={schemaVersion:'syspresent.project.v1',title:'Fixture',systemOfInterest:['Model'],modelSources:['model.sysml'],viewSources:['views.sysml'],story:'story.md',assets:[],publication:{scope:'complete'}};
const files={'model.sysml':'package Model {}','views.sysml':'package Views {}','story.md':'```syspresent\n'+JSON.stringify({type:'scene',id:'one',title:'Control the part',view:'Views::requirements',focus:'Model::req'})+'\n```\n\nReader context.'};
const until=async predicate=>{for(let i=0;i<200;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('UI did not settle');};
async function harness({reducedMotion=true}={}){
 let pendingRender;
 const window=new JSDOM(html,{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}).window;
 window.matchMedia=()=>({matches:reducedMotion});window.Element.prototype.animate=function(){let done;const finished=new Promise(resolve=>done=resolve);return {finished,cancel:()=>done()};};window.structuredClone=structuredClone;window.ResizeObserver=class{observe(){}};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{get(){return 1000;}});Object.defineProperty(window.HTMLElement.prototype,'clientHeight',{get(){return 700;}});
 window.fetch=async url=>({ok:true,arrayBuffer:async()=>packProject({manifest,files}).buffer,json:async()=>String(url).includes('project.json')?manifest:{version:'fixture'},text:async()=>files[String(url).split('/').at(-1)]});
 window.Worker=class{postMessage({id,method,params}){const respond=result=>queueMicrotask(()=>this.onmessage({data:{id,result}}));
  if(method==='Initialize')respond({version:'test'});
  else if(method==='ParseSources')respond({modelHash:'fixture',roots:[{childIds:['Model']}],diagnostics:params.documents.some(d=>d.content.includes('BROKEN'))?[{severity:'error',message:'Native parse rejected broken view'}]:[]});
  else if(method==='ExportModel')respond({elements:structuredClone(raw)});
  else if(method==='RenderView'&&params.view.startsWith('#'))pendingRender=()=>respond({kind:'interconnection',nodes:[native.nodes[1]],edges:[]});
  else if(method==='RenderView')respond(params.view.endsWith('::coverage')?coverage:structuredClone(native));
 }terminate(){}};
 window.eval(outputFiles[0].text);await until(()=>window.document.querySelectorAll('.node').length===2&&window.document.getElementById('status').textContent.startsWith('OpenSysML WASM')).catch(e=>{throw Error(e.message+': '+window.document.getElementById('status').textContent);});
 return {window,document:window.document,release:()=>pendingRender?.(),pending:()=>!!pendingRender};
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
