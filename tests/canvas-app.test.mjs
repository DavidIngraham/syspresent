import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {build} from 'esbuild';
import {JSDOM,VirtualConsole} from 'jsdom';
import ELK from 'elkjs/lib/elk.bundled.js';
import {routeConflicts} from '../src/canvas-prototype/peripheral-routing.mjs';
import {packProject} from '../src/canvas-prototype/project.mjs';
const {outputFiles}=await build({entryPoints:['src/canvas-prototype/app.mjs'],bundle:true,format:'iife',write:false,logLevel:'silent'});
const html=await readFile('src/canvas-prototype/index.html','utf8');
const raw=[{'@id':'orphan','@type':'PartUsage',qualifiedName:'Model::orphan',declaredName:'orphan','sysx:sourceLine':4},{'@id':'Model','@type':'Package',qualifiedName:'Model',declaredName:'Model','sysx:sourceLine':1},{'@id':'req','@type':'RequirementUsage',qualifiedName:'Model::req',declaredName:'req','sysx:sourceLine':2},{'@id':'part','@type':'PartUsage',qualifiedName:'Model::part',declaredName:'part','sysx:sourceLine':3},{'@id':'view','@type':'ViewUsage',qualifiedName:'Views::requirements','sysx:sourceLine':1}];
const native={kind:'requirement',nodes:[{id:'r',semanticId:'req',identityStatus:'mapped',name:'req',kind:'requirement'},{id:'p',semanticId:'part',identityStatus:'mapped',name:'part',kind:'part'}],edges:[{from:'p',to:'r',kind:'satisfy',label:'satisfy'}]};
const coverage={kind:'requirement',nodes:native.nodes,edges:native.edges};
const manifest={schemaVersion:'syspresent.project.v1',title:'Fixture',systemOfInterest:['Model'],modelSources:['model.sysml'],viewSources:['views.sysml'],story:'story.md',assets:[],publication:{scope:'complete'}};
const files={'model.sysml':'package Model {}','views.sysml':'package Views {}','story.md':'```syspresent\n'+JSON.stringify({type:'scene',id:'one',title:'Control the part',view:'Views::requirements',focus:'Model::req'})+'\n```\n\nReader context.'};
const until=async predicate=>{for(let i=0;i<1000;i++){if(predicate())return;await new Promise(r=>setTimeout(r,5));}throw Error('UI did not settle');};
async function harness({reducedMotion=true,secondScene=false,contextNeighbor=false,traceFixture=false,structuralFixture=false,ancestorFixture=false,foreignOwnerFixture=false,ambiguousRefs=false,presentation,size={width:1000,height:700}}={}){
 let resizeCallback;const fixtureFiles={...files};if(presentation)fixtureFiles['story.md']=fixtureFiles['story.md'].replace('\"focus\":\"Model::req\"','\"focus\":\"Model::req\",\"presentation\":'+JSON.stringify(presentation));if(secondScene)fixtureFiles['story.md']+='\n\n```syspresent\n'+JSON.stringify({type:'scene',id:'two',title:'Other scene',view:'Views::other',focus:'Model::orphan'})+'\n```\n\nOther context.';
 const extra=traceFixture?[{id:'origin',kind:'RequirementUsage'},{id:'case',kind:'VerificationCaseUsage'},...Array.from({length:8},(_,i)=>({id:'child'+i,kind:'RequirementUsage'}))]:[],fixtureCoverage=structuredClone(coverage);for(const e of extra)fixtureCoverage.nodes.push({id:e.id,semanticId:e.id,name:e.id,kind:e.kind==='VerificationCaseUsage'?'verification case':'requirement',identityStatus:'mapped'});if(traceFixture)fixtureCoverage.edges.push({from:'r',to:'origin',kind:'derive',label:'derive'},{from:'case',to:'r',kind:'verify',label:'verify'},...extra.filter(e=>e.id.startsWith('child')).map(e=>({from:e.id,to:'r',kind:'derive',label:'derive'})));
 const structuralRaw=structuralFixture?[{'@id':'definition','@type':'PartDefinition',qualifiedName:'Model::Device',declaredName:'Device',owner:{'@id':'Model'},ownedMember:[{'@id':'sensor'},{'@id':'processor'}],'sysx:sourceLine':10},...['sensor','processor'].map(id=>({'@id':id,'@type':'PartUsage',qualifiedName:'Model::Device::'+id,declaredName:id,owner:{'@id':'definition'},'sysx:sourceLine':11})),{'@id':'nested','@type':'Package',qualifiedName:'Model::Nested',declaredName:'Nested',owner:{'@id':'Model'},'sysx:sourceLine':12}]:[];
 const fixtureRaw=raw.map(e=>structuralFixture&&e['@id']==='part'?{...e,type:[{'@id':'definition'}],owner:{'@id':'Model'}}:e);
 let pendingRender,holdLayout=false,holdCountdown=null;const heldLayouts=[];
 const window=new JSDOM(html,{url:'http://localhost/',runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()}).window;
 window.matchMedia=()=>({matches:reducedMotion});window.Element.prototype.animate=function(){let done;const finished=new Promise(resolve=>done=resolve);return {finished,cancel:()=>done()};};const ownRealm=value=>{if(value===null||typeof value!=='object')return value;if(ArrayBuffer.isView(value))return new window.Uint8Array(value);if(Array.isArray(value))return window.Array.from(value,ownRealm);if(value instanceof Set)return new window.Set([...value].map(ownRealm));if(value instanceof Map)return new window.Map([...value].map(([k,v])=>[ownRealm(k),ownRealm(v)]));return window.Object.fromEntries(Object.entries(value).map(([k,v])=>[k,ownRealm(v)]));};window.structuredClone=value=>ownRealm(structuredClone(value));window.ResizeObserver=class{constructor(fn){resizeCallback=fn;}observe(){}};
 window.HTMLDialogElement.prototype.showModal=function(){this.open=true;};window.HTMLDialogElement.prototype.close=function(){this.open=false;};
 Object.defineProperty(window.HTMLElement.prototype,'clientWidth',{get(){return size.width;}});Object.defineProperty(window.HTMLElement.prototype,'clientHeight',{get(){return size.height;}});
 window.fetch=async url=>({ok:true,arrayBuffer:async()=>packProject({manifest,files:fixtureFiles}).buffer,json:async()=>String(url).includes('project.json')?manifest:{version:'fixture'},text:async()=>files[String(url).split('/').at(-1)]});
 window.Worker=class{constructor(url){this.layout=String(url).includes('elk-worker')?new ELK():null;}postMessage(message){const {id,method,params}=message;if(message.cmd){if(message.cmd==='layout')this.layout.layout(structuredClone(message.graph)).then(data=>{const reply=()=>this.onmessage({data:{id,data}});if(holdLayout||holdCountdown===1){holdLayout=false;holdCountdown=null;heldLayouts.push(error=>error?this.onmessage({data:{id,error:{message:error}}}):reply());}else{if(holdCountdown!==null)holdCountdown--;reply();}});else queueMicrotask(()=>this.onmessage({data:{id,data:{}}}));return;}const respond=result=>queueMicrotask(()=>this.onmessage({data:{id,result}}));
  if(method==='Initialize')respond({version:'test'});
  else if(method==='ParseSources')respond({modelHash:'fixture',roots:[{childIds:['Model']}],diagnostics:params.documents.some(d=>d.content.includes('BROKEN'))?[{severity:'error',message:'Native parse rejected broken view'}]:[]});
  else if(method==='ExportModel')respond({elements:structuredClone([...structuralRaw,...fixtureRaw.map(e=>(ancestorFixture||foreignOwnerFixture)&&['req','orphan'].includes(e['@id'])?{...e,owner:{'@id':foreignOwnerFixture?'foreign':'Model'}}:e),...(foreignOwnerFixture?[{'@id':'foreign','@type':'Package',qualifiedName:'Foreign::root',declaredName:'root','sysx:sourceLine':1}]:[]),...(ambiguousRefs?['duplicate1','duplicate2'].map(id=>({'@id':id,'@type':'RequirementUsage',qualifiedName:'Model::ambiguous',declaredName:'ambiguous','sysx:sourceLine':9})):[]),...extra.map(e=>({'@id':e.id,'@type':e.kind,qualifiedName:'Model::'+e.id,declaredName:e.id,'sysx:sourceLine':8})),...(secondScene?[{'@id':'view2','@type':'ViewUsage',qualifiedName:'Views::other','sysx:sourceLine':2}]:[]),...(contextNeighbor==='shared'?[{'@id':'second-neighbor-link','@type':'Dependency',client:[{'@id':'part'}],supplier:[{'@id':'orphan'}]}]:[]),...(contextNeighbor?[{'@id':'neighbor-link','@type':'Dependency',client:[{'@id':'req'}],supplier:[{'@id':'orphan'}]}]:[])])});
  else if(method==='RenderView'&&params.view==='Views::other')respond({kind:'requirement',nodes:[{id:'o',semanticId:'orphan',identityStatus:'mapped',name:'orphan',kind:'part'}],edges:[]});
  else if(method==='RenderView'&&params.view.startsWith('#'))pendingRender=()=>respond({kind:'interconnection',nodes:[native.nodes[1]],edges:[]});
  else if(method==='RenderView')respond(params.view.endsWith('::coverage')?fixtureCoverage:structuredClone(native));
 }terminate(){}};
 window.eval(outputFiles[0].text);await until(()=>window.document.querySelectorAll('.node[data-context=\"false\"]').length===2&&window.document.getElementById('status').textContent.startsWith('OpenSysML WASM')).catch(e=>{throw Error(e.message+': '+window.document.getElementById('status').textContent);});
 return {window,story:fixtureFiles['story.md'],document:window.document,resize:(width,height)=>{size.width=width;size.height=height;resizeCallback?.();},release:()=>pendingRender?.(),pending:()=>!!pendingRender,holdLayout:()=>{holdLayout=true;},holdLayoutAfter:count=>{holdCountdown=count;},layoutPending:()=>heldLayouts.length>0,releaseLayout:error=>heldLayouts.splice(0).forEach(reply=>reply(error))};
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
test('space-limited context retains a real offscreen tile and complete native link',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:180,height:240}}),d=h.document;
 assert.equal(d.querySelector('.context-boundary'),null);const neighbor=d.querySelector('.node[data-context="true"]');assert.equal(neighbor.dataset.semanticId,'orphan');assert.equal(neighbor.getAttribute('aria-hidden'),'false');
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

const activeIDs=d=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>n.dataset.semanticId).sort();
const action=(d,text)=>[...d.querySelectorAll('#selection button')].find(b=>b.textContent===text);
test('directional requirement actions stay on the canvas and history restores the authored scene',async()=>{
 const h=await harness({traceFixture:true}),d=h.document,before=[...d.querySelectorAll('.node')].map(n=>n.style.transform);d.querySelector('[data-semantic-id="req"]').click();assert.deepEqual([...d.querySelectorAll('.node')].map(n=>n.style.transform),before);assert.ok(action(d,'Origins (1)'));assert.ok(action(d,'Derived requirements (8)'));assert.ok(action(d,'Design impact (1)'));assert.ok(action(d,'Verification (1)'));action(d,'Origins (1)').click();await until(()=>d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='origin,req');assert.ok(d.getElementById('exploration-label').textContent.includes('Origins'));d.getElementById('explore-back').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');assert.equal(d.getElementById('explore-forward').disabled,false);d.getElementById('explore-forward').click();await until(()=>d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='origin,req');d.getElementById('return').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');h.window.close();
});
test('verification tracing retains native direction without inferring a passed test',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Verification (1)').click();await until(()=>activeIDs(d).join(',')==='case,req');const edge=d.querySelector('#connections g[data-context="false"]');assert.equal(edge.dataset.source,'case');assert.equal(edge.dataset.target,'req');assert.ok(d.getElementById('status').textContent.includes('not executed results'));h.window.close();
});
test('large derived sets page through bounded diagrams and history restores the prior page',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Derived requirements (8)').click();await until(()=>d.getElementById('trace-next').hidden===false&&activeIDs(d).length===7);const first=activeIDs(d);d.getElementById('trace-next').click();await until(()=>activeIDs(d).length===3);assert.ok(d.getElementById('exploration-label').textContent.includes('2 of 8'));d.getElementById('explore-back').click();await until(()=>activeIDs(d).join(',')===first.join(','));assert.equal(d.getElementById('trace-next').disabled,false);h.window.close();
});
test('editor display preferences validate references before changing or exporting the scene',async()=>{
 const h=await harness(),d=h.document;d.getElementById('edit').click();d.getElementById('presentation-expanded').value='Model::missing';d.getElementById('save-scene').click();await until(()=>d.getElementById('editor-error').textContent.includes('missing'));assert.equal(d.getElementById('editor').open,true);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');d.getElementById('presentation-expanded').value='Model::req';d.getElementById('presentation-context').value='0';d.getElementById('presentation-compartments').value='compact';d.getElementById('save-scene').click();await until(()=>!d.getElementById('editor').open);await new Promise(r=>setTimeout(r,20));assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);d.getElementById('edit').click();assert.equal(d.getElementById('presentation-expanded').value,'Model::req');assert.equal(d.getElementById('presentation-context').value,'0');assert.equal(d.getElementById('presentation-compartments').value,'compact');h.window.close();
});

test('reader collapse overrides authored expanded defaults and survives history restoration',async()=>{
 const h=await harness({traceFixture:true,presentation:{compartments:'expanded'}}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();assert.ok(d.querySelector('[data-semantic-id="req"] .detail'));action(d,'Collapse compartment').click();await until(()=>!d.querySelector('[data-semantic-id="req"] .detail'));action(d,'Origins (1)').click();await until(()=>activeIDs(d).join(',')==='origin,req');d.getElementById('explore-back').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');assert.equal(d.querySelector('[data-semantic-id="req"] .detail'),null);h.window.close();
});

test('a failed Return restores exploration history without inserting a duplicate entry',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Origins (1)').click();await until(()=>activeIDs(d).join(',')==='origin,req');h.holdLayout();d.getElementById('return').click();await until(h.layoutPending);h.releaseLayout('Return layout failed');await until(()=>d.getElementById('status').textContent.includes('Return layout failed'));assert.equal(d.getElementById('narrative').hidden,true);d.getElementById('explore-back').click();await until(()=>!d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req');h.window.close();
});

test('explicit trace intent emphasizes its connections independently of the authored scene emphasis',async()=>{
 const h=await harness({traceFixture:true,presentation:{emphasis:['derive']}}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Design impact (1)').click();await until(()=>d.getElementById('narrative').hidden&&activeIDs(d).join(',')==='part,req'&&d.getElementById('status').textContent.includes('matching engineering neighbors'));const edge=d.querySelector('#connections g[data-context="false"]');assert.equal(edge.style.opacity,'1');assert.equal(d.querySelector('header nav').hidden,true);d.getElementById('return').click();await until(()=>!d.getElementById('narrative').hidden&&d.querySelector('#connections g[data-context="false"]').style.opacity==='0.28');assert.equal(d.querySelector('header nav').hidden,false);assert.equal(d.querySelector('#connections g[data-context="false"]').style.opacity,'0.28');h.window.close();
});

test('ambiguous native references are rejected before author preference edits are applied',async()=>{
 const h=await harness({ambiguousRefs:true}),d=h.document;d.getElementById('edit').click();d.getElementById('presentation-expanded').value='Model::ambiguous';d.getElementById('save-scene').click();await until(()=>d.getElementById('editor-error').textContent.includes('Ambiguous'));assert.equal(d.getElementById('editor').open,true);assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');h.window.close();
});

test('history restores the matching context disclosure instead of leaving a later verification message',async()=>{
 const h=await harness({traceFixture:true}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Origins (1)').click();await until(()=>activeIDs(d).join(',')==='origin,req');d.querySelector('[data-semantic-id="req"]').click();action(d,'Verification (1)').click();await until(()=>activeIDs(d).join(',')==='case,req');assert.ok(d.getElementById('status').textContent.includes('not executed'));d.getElementById('explore-back').click();await until(()=>activeIDs(d).join(',')==='origin,req'&&d.getElementById('exploration-label').textContent.includes('Origins'));assert.ok(!d.getElementById('status').textContent.includes('not executed'));assert.ok(d.getElementById('status').textContent.includes('1 of 1'));h.window.close();
});

test('viewport changes during verification preserve the matching verification disclosure',async()=>{
 const h=await harness({traceFixture:true,reducedMotion:false}),d=h.document;d.querySelector('[data-semantic-id="req"]').click();action(d,'Verification (1)').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);h.resize(390,650);await new Promise(r=>setTimeout(r,130));d.getElementById('reduce').click();await until(()=>d.getElementById('stage').dataset.motionProgress===undefined&&activeIDs(d).join(',')==='case,req'&&d.getElementById('status').textContent.includes('not executed'));h.window.close();
});

test('a tiny viewport clips the neighborhood without removing its actual endpoint',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:120,height:140}}),d=h.document;assert.equal(d.querySelector('.context-boundary'),null);assert.ok(d.querySelector('#connections g[data-context="true"]'));assert.equal(d.querySelector('.node[data-context="true"]').dataset.semanticId,'orphan');const before=d.querySelector('.node[data-context="true"]').style.transform;d.getElementById('show-neighborhood').click();assert.notEqual(d.getElementById('graph-world').style.transform,'translate(0px,0px) scale(1)');assert.equal(d.querySelector('.node[data-context="true"]').style.transform,before);h.window.close();
});


test('faded transition connections cannot retain invisible pointer or keyboard targets',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;d.getElementById('next').click();
 await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 let hidden=0;
 for(let i=0;i<180;i++){
  for(const edge of d.querySelectorAll('#connections g[data-relationship]'))if(Number(edge.style.opacity)<.05){
   hidden++;assert.equal(edge.style.pointerEvents,'none');assert.equal(edge.getAttribute('aria-hidden'),'true');assert.equal(edge.getAttribute('tabindex'),'-1');
  }
  if(d.getElementById('stage').dataset.motionProgress===undefined)break;
  await new Promise(resolve=>setTimeout(resolve,10));
 }
 assert.ok(hidden>0,'exercise an actually faded connection during the journey');h.window.close();
});


test('disjoint same-notation navigation visibly ascends native ownership and descends before settling',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,ancestorFixture:true,presentation:{emphasis:['derive']}}),d=h.document;
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 await until(()=>[...d.querySelectorAll('[data-semantic-id="Model"]')].some(n=>Number(n.style.opacity)>.1));
 assert.match(d.getElementById('transition').textContent,/Model ownership route/);
 const edges=[...d.querySelectorAll('#connections g[data-relationship]')];assert.ok(edges.some(g=>g.dataset.source==='Model'&&g.dataset.target==='req'));assert.ok(edges.some(g=>g.dataset.source==='Model'&&g.dataset.target==='orphan'));
 await until(()=>[...d.querySelectorAll('#connections g[data-kind="containment"]')].some(g=>Number(g.style.opacity)>.8&&Number(g.querySelector('text')?.style.opacity)>.8));
 await until(()=>[...d.querySelectorAll('#connections g[data-kind="containment"]')].filter(g=>Number(g.style.opacity)>.6).length===2);
 const attachments=[...d.querySelectorAll('#connections g[data-kind="containment"]')].filter(g=>Number(g.style.opacity)>.6).map(g=>g.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d').match(/^M([\d.-]+),([\d.-]+)/).slice(1).map(Number));
 assert.notDeepEqual(attachments[0],attachments[1],'live ownership hops retain separate native-parent drawing attachments');
 d.getElementById('fit').click();await until(()=>activeIDs(d).join(',')==='orphan'&&d.getElementById('stage').dataset.motionProgress===undefined);assert.equal(d.getElementById('scenes').value,'1');h.window.close();
});


test('a saved same-notation ownership route outside the story boundary is rejected before replacing the project',async()=>{
 const h=await harness({secondScene:true,foreignOwnerFixture:true}),d=h.document,input=d.getElementById('markdown-file');
 const authored=h.story.replace('"focus":"Model::orphan"','"focus":"Model::orphan","journey":["Model::req","Foreign::root","Model::orphan"]');
 Object.defineProperty(input,'files',{value:[{text:async()=>authored}],configurable:true});input.dispatchEvent(new h.window.Event('change'));
 await until(()=>d.getElementById('editor-error').textContent.includes('saved journey no longer resolves within the presentation boundary'));
 assert.equal(d.querySelector('#narrative h2').textContent,'Control the part');assert.deepEqual(activeIDs(d),['part','req']);assert.equal(d.getElementById('fit').disabled,false);h.window.close();
});


test('fading old context paths cannot reintroduce crossings against current context or active routes',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,contextNeighbor:'shared'}),d=h.document;
 const points=path=>[...(path??'').matchAll(/[ML]([\d.-]+),([\d.-]+)/g)].map(m=>({x:Number(m[1]),y:Number(m[2])}));
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);let sampled=0;
 for(let i=0;i<220;i++){
  const rows=[...d.querySelectorAll('#connections g[data-relationship]')].filter(g=>Number(g.style.opacity)>.01).map(g=>({context:g.dataset.context==='true',now:points(g.querySelector('.edge-line:not(.edge-outgoing)').getAttribute('d')),old:points(g.querySelector('.edge-outgoing').getAttribute('d')),oldOpacity:Number(g.querySelector('.edge-outgoing').style.opacity)}));
  if(rows.filter(r=>r.context).length>1)sampled++;
  for(const row of rows.filter(r=>r.context&&r.oldOpacity>.01&&r.old.length>1)){
   const score=path=>rows.filter(r=>r!==row).reduce((sum,other)=>{const c=routeConflicts(path,other.now);return sum+c.crossings*1e6+c.overlapLength*1e4;},0);
   assert.ok(score(row.old)<=score(row.now)+.01,'obsolete context path worsens the current crossing/overlap state');
  }
  if(d.getElementById('stage').dataset.motionProgress===undefined)break;await new Promise(resolve=>setTimeout(resolve,10));
 }
 assert.ok(sampled>0,'exercise multiple faint paths during motion');h.window.close();
});

test('part and package actions expose structural context on the canvas and history restores it',async()=>{
 const h=await harness({structuralFixture:true,size:{width:390,height:720}}),d=h.document;
 const active=()=>[...d.querySelectorAll('.node[data-context="false"]')];
 const clickAction=text=>{const control=[...d.querySelectorAll('#selection button')].find(b=>b.textContent===text);assert.ok(control,text);control.click();};
 d.querySelector('[data-semantic-id="part"]').click();clickAction('Focus');
 await until(()=>active().length===5&&d.getElementById('status').textContent.includes('matching structural'));
 assert.deepEqual(new Set(active().map(n=>n.dataset.semanticId)),new Set(['part','Model','definition','sensor','processor']));
 assert.equal(d.querySelectorAll('#connections g[data-kind="typing"][data-context="false"]').length,1);
 assert.equal(d.querySelectorAll('#connections g[data-kind="composition"][data-context="false"]').length,2);
 // Actual positions are CSS transforms, inspected below rather than DOM order.
 const rect=id=>d.querySelector('.node[data-context="false"][data-semantic-id="'+id+'"]').style.transform.match(/translate\(([\d.-]+)px,\s*([\d.-]+)px/).slice(1).map(Number);
 assert.ok(rect('definition')[1]<rect('sensor')[1]);assert.ok(rect('Model')[1]<rect('part')[1]);
 d.querySelector('.node[data-context="false"][data-semantic-id="part"]').click();clickAction('Parts / contents (2)');
 await until(()=>active().length===4&&d.getElementById('exploration-label').textContent.startsWith('Parts / contents'));
 assert.ok(!active().some(n=>n.dataset.semanticId==='Model'));
 d.querySelector('.node[data-context="false"][data-semantic-id="part"]').click();clickAction('Containing element (1)');
 await until(()=>active().length===2&&d.getElementById('exploration-label').textContent.startsWith('Containing element'));
 d.getElementById('explore-back').click();await until(()=>active().length===4&&d.getElementById('exploration-label').textContent.startsWith('Parts / contents'));
 d.getElementById('explore-back').click();await until(()=>active().length===5);
 d.querySelector('.node[data-context="false"][data-semantic-id="Model"]').click();clickAction('Parts / contents (3)');
 await until(()=>d.getElementById('exploration-label').textContent.startsWith('Parts / contents · Model')&&active().length===4&&active().some(n=>n.dataset.semanticId==='nested'));
 assert.deepEqual(new Set(active().map(n=>n.dataset.semanticId)),new Set(['Model','part','definition','nested']));
 const owned=[...d.querySelectorAll('#connections g[data-kind="containment"][data-context="false"]')];assert.equal(owned.length,3);assert.ok(owned.every(g=>g.dataset.source==='Model'));
 assert.ok(d.getElementById('status').textContent.includes('Package ownership is location context'));h.window.close();
});


test('camera zoom and pan reveal fixed world geometry, Fit restores active content and taps stay stationary',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:390,height:720}}),d=h.document,world=d.getElementById('graph-world'),surface=d.getElementById('graph-viewport');
 const geometry=()=>[...d.querySelectorAll('.node')].map(n=>[n.dataset.semanticId,n.style.transform,n.style.width,n.style.height]);
 const before=geometry();h.holdLayout();d.getElementById('show-neighborhood').click();const neighborhoodCamera=world.style.transform;assert.notEqual(neighborhoodCamera,'translate(0px,0px) scale(1)');assert.deepEqual(geometry(),before);assert.equal(h.layoutPending(),false);
 d.querySelector('.node[data-context="true"]').click();assert.equal(world.style.transform,neighborhoodCamera);assert.equal(d.getElementById('selection').hidden,false);
 surface.dispatchEvent(new h.window.KeyboardEvent('keydown',{key:'ArrowRight',bubbles:true,cancelable:true}));assert.notEqual(world.style.transform,neighborhoodCamera);assert.deepEqual(geometry(),before);
 const panCamera=world.style.transform;surface.dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:100,clientX:190,clientY:200,bubbles:true,cancelable:true}));assert.notEqual(world.style.transform,panCamera);assert.deepEqual(geometry(),before);
 d.getElementById('fit').click();assert.equal(world.style.transform,'translate(0px,0px) scale(1)');assert.deepEqual(geometry(),before);assert.equal(h.layoutPending(),false);h.window.close();
});

test('offscreen neighbor Focus and Back restore the former camera and neighborhood without changing native identity',async()=>{
 const h=await harness({contextNeighbor:true,size:{width:390,height:720}}),d=h.document,active=()=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>n.dataset.semanticId).sort();
 d.getElementById('show-neighborhood').click();const camera=d.getElementById('graph-world').style.transform;
 d.querySelector('.node[data-context="true"]').click();[...d.querySelectorAll('#selection button')].find(b=>b.textContent==='Focus').click();
 await until(()=>d.getElementById('exploration-label').textContent.includes('orphan')&&active().includes('orphan')&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.equal(d.getElementById('graph-world').style.transform,'translate(0px,0px) scale(1)');
 d.getElementById('explore-back').click();await until(()=>d.getElementById('return').hidden&&active().join(',')==='part,req'&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.equal(d.getElementById('graph-world').style.transform,camera);assert.equal(d.querySelector('.node[data-context="true"]').dataset.semanticId,'orphan');h.window.close();
});

test('explicit More neighbors expands only the prepared neighborhood and keeps the active layout and camera',async()=>{
 const h=await harness({contextNeighbor:true,presentation:{contextBudget:0}}),d=h.document;
 const active=()=>[...d.querySelectorAll('.node[data-context="false"]')].map(n=>[n.dataset.semanticId,n.style.transform]);
 const before=active(),camera=d.getElementById('graph-world').style.transform;assert.equal(d.querySelectorAll('.node[data-context="true"]').length,0);assert.equal(d.getElementById('more-neighbors').hidden,false);
 d.getElementById('more-neighbors').click();await until(()=>d.querySelectorAll('.node[data-context="true"]').length===1&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.deepEqual(active(),before);assert.equal(d.getElementById('graph-world').style.transform,camera);assert.equal(d.getElementById('more-neighbors').hidden,true);
 d.getElementById('explore-back').click();await until(()=>d.querySelectorAll('.node[data-context="true"]').length===0);h.window.close();
});


test('a camera gesture during pending layout is not overwritten by its eventual destination',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true}),d=h.document;h.holdLayout();d.getElementById('next').click();await until(h.layoutPending);
 d.getElementById('graph-viewport').dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:120,clientX:180,clientY:170,bubbles:true,cancelable:true}));
 const camera=d.getElementById('graph-world').style.transform;assert.notEqual(camera,'translate(0px,0px) scale(1)');h.releaseLayout();
 await until(()=>d.getElementById('scenes').value==='1'&&d.getElementById('stage').dataset.motionProgress===undefined&&activeIDs(d).join(',')==='orphan');
 assert.equal(d.getElementById('graph-world').style.transform,camera);h.window.close();
});

test('a native ancestor journey pulls the camera back and travels before settling on active fit',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,ancestorFixture:true}),d=h.document;
 d.getElementById('next').click();await until(()=>d.getElementById('stage').dataset.motionProgress!==undefined);
 await until(()=>{const m=/scale\(([^)]+)\)/.exec(d.getElementById('graph-world').style.transform);return m&&Number(m[1])<.9;});
 const camera=d.getElementById('graph-world').style.transform;assert.notEqual(camera,'translate(0px,0px) scale(1)');
 await until(()=>d.querySelector('.node[data-semantic-id="Model"]')&&Number(d.querySelector('.node[data-semantic-id="Model"]').style.opacity)>.5);
 assert.match(d.getElementById('transition').textContent,/Model ownership route/);
 d.getElementById('fit').click();await until(()=>activeIDs(d).join(',')==='orphan'&&d.getElementById('stage').dataset.motionProgress===undefined);
 assert.equal(d.getElementById('graph-world').style.transform,'translate(0px,0px) scale(1)');h.window.close();
});


test('a gesture during intermediate journey preparation cancels automated camera travel',async()=>{
 const h=await harness({reducedMotion:false,secondScene:true,ancestorFixture:true}),d=h.document;h.holdLayoutAfter(2);d.getElementById('next').click();await until(h.layoutPending);
 d.getElementById('graph-viewport').dispatchEvent(new h.window.WheelEvent('wheel',{deltaY:120,clientX:180,clientY:170,bubbles:true,cancelable:true}));const camera=d.getElementById('graph-world').style.transform;h.releaseLayout();
 await until(()=>d.getElementById('scenes').value==='1'&&d.getElementById('stage').dataset.motionProgress===undefined&&activeIDs(d).join(',')==='orphan');
 assert.equal(d.getElementById('graph-world').style.transform,camera);h.window.close();
});


test('neighbor disclosure counts prepared tiles rather than conflating offscreen tiles with omissions',async()=>{
 const h=await harness({contextNeighbor:true}),d=h.document;assert.equal(d.getElementById('context-details').textContent,'Neighbors (1)');
 d.getElementById('context-details').click();assert.equal(d.getElementById('information-title').textContent,'Prepared neighborhood');
 assert.match(d.getElementById('information-text').textContent,/1 of 1 eligible one-hop neighbors prepared/);assert.match(d.getElementById('information-text').textContent,/real tile/);h.window.close();
});
