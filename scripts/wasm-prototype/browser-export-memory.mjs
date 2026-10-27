#!/usr/bin/env node
/** Actual localhost Chromium/WASM authoring, edited-project reindex and ZIP reload regression.
 * Requires Playwright and its Chromium executable, explicitly supplied if not installed.
 */
import {createServer} from 'node:http';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {writeFileSync,appendFileSync} from 'node:fs';
import {resolve,dirname,extname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {unzipSync,strFromU8} from 'fflate';
import {readProjectDirectory} from '../canvas_project_files.mjs';
import {documentsFor} from '../../src/canvas-prototype/project.mjs';
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const site=resolve(option('--site','build/canvas-prototype/site'));
const output=resolve(option('--output','build/browser-export-memory.json'));
const cycles=Number(option('--cycles','3')),stepTimeout=Number(option('--step-timeout-ms','180000'));
if(!Number.isInteger(cycles)||cycles<1||cycles>10)throw Error('--cycles must be1 through10');
await mkdir(dirname(output),{recursive:true});writeFileSync(output,'{}\n',{flag:'wx'});
const evidence={schemaVersion:'syspresent.browser-export-memory.v1',startedAt:new Date().toISOString(),site,cycles,trace:[],flows:[],errors:[],external:[],console:[]};
const save=()=>writeFileSync(output,JSON.stringify(evidence,null,2)+'\n');
const record=value=>{evidence.flows.push(value);save();console.log(JSON.stringify(value));};
const server=createServer(async(req,res)=>{try{let path=resolve(site,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(path!==site&&!path.startsWith(site+sep)){res.writeHead(403).end();return;}if(path===site||req.url.split('?')[0].endsWith('/'))path=resolve(path,'index.html');const data=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.wasm':'application/wasm','.css':'text/css','.zip':'application/zip','.svg':'image/svg+xml'})[extname(path)]||'application/octet-stream');res.end(data);}catch{res.writeHead(404).end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port,playwright=option('--playwright',null),executablePath=option('--chromium',undefined);
const {chromium}=await import(playwright?pathToFileURL(resolve(playwright)):'playwright');
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
let page;
async function makePage(){
 const result=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 await result.route('**/*',async route=>{
  const url=route.request().url();
  if(/^https?:/.test(url)&&!url.startsWith(origin+'/')){evidence.external.push(url);save();return route.abort();}
  if(new URL(url).pathname.endsWith('/engine/worker.js')){
   const response=await route.fetch();let text=await response.text();
   text=text.replace('const go = new Go();',`const go = new Go();
const reset=go.importObject.gojs['runtime.resetMemoryDataView'];
go.importObject.gojs['runtime.resetMemoryDataView']=(...params)=>{const result=reset(...params);if(globalThis.__profileMemory)console.log('MEMORY_TRACE '+JSON.stringify({stage:'growth',linearMemoryBytes:globalThis.__profileMemory.buffer.byteLength}));return result;};`);
   text=text.replace('let engineFailure;', 'globalThis.__profileMemory=instance.exports.mem||instance.exports.memory;let engineFailure;');
   text=text.replace('const raw = globalThis.sysmlWasm.call(method, JSON.stringify(params));',`console.log('MEMORY_TRACE '+JSON.stringify({stage:'before',method,linearMemoryBytes:globalThis.__profileMemory?.buffer.byteLength}));
if(method==='ParseSources')console.log('DOCUMENTS_TRACE '+JSON.stringify(params.documents));
const started=performance.now();const raw = globalThis.sysmlWasm.call(method, JSON.stringify(params));
if(method==='GetServerInfo'&&typeof raw==='string')globalThis.__profileStatsSupported=JSON.parse(raw).result?.capabilities?.includes('memory_stats');
let stats;if(globalThis.__profileStatsSupported&&typeof raw==='string'){const envelope=JSON.parse(globalThis.sysmlWasm.call('GetMemoryStats','{}'));stats=envelope.result;}
console.log('MEMORY_TRACE '+JSON.stringify({stage:'after',method,operationMs:performance.now()-started,linearMemoryBytes:globalThis.__profileMemory?.buffer.byteLength,nativeStats:stats,result:typeof raw==='string'?(()=>{const result=JSON.parse(raw).result;return method==='ParseSources'?{modelHash:result?.modelHash}:method==='RenderView'?{kind:result?.kind,nodes:result?.nodes?.length,edges:result?.edges?.length}:method==='ExportModel'?{elementCount:result?.elementCount,omittedElementCount:result?.omittedElementCount}:undefined;})():undefined}));`);
   return route.fulfill({response,body:text,contentType:'text/javascript'});
  }
  return route.continue();
 });
 result.on('console',message=>{const text=message.text();if(text.startsWith('DOCUMENTS_TRACE ')){const documents=JSON.parse(text.slice(16));evidence.documentRequests??=[];const path=output+'.documents-'+evidence.documentRequests.length+'.json';writeFileSync(path,JSON.stringify(documents));evidence.documentRequests.push({path,documents:documents.length,totalSourceBytes:documents.reduce((sum,d)=>sum+Buffer.byteLength(d.content),0),sha256:createHash('sha256').update(JSON.stringify(documents)).digest('hex')});save();return;}if(/runtime: out of memory|fatal error:/.test(text))evidence.nativeFatal={message:text,at:new Date().toISOString()};if(text.startsWith('MEMORY_TRACE ')){evidence.trace.push({at:new Date().toISOString(),...JSON.parse(text.slice(13))});save();return;}evidence.console.push({type:message.type(),text});appendFileSync(output+'.console.log',message.type()+': '+text+'\n');save();});
 result.on('pageerror',error=>{evidence.errors.push(error.message);save();});
 return result;
}
async function ready(){await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('OpenSysML WASM')&&document.querySelector('#loading')?.hidden,undefined,{timeout:stepTimeout});await settled();}
async function settled(){await page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')!=='true'&&(document.querySelector('.node[data-context="false"]')||document.querySelector('.sequence-participant')||document.querySelector('.canvas-grid-table')),undefined,{timeout:stepTimeout});await page.waitForTimeout(150);}
async function findIntegration(){
 if(await page.locator('#find').isHidden())await page.locator('#find-toggle').click();
 await page.locator('#search').fill('BlueDogIC01::integration');
 await page.locator('#search-results').getByRole('button',{name:'BlueDogIC01::integration',exact:true}).click();await settled();
 const node=page.locator('.node[data-context="false"][data-semantic-id="BlueDogIC01__integration"]');await node.locator('.name').first().click();
}
async function exportZip(cycle){
 if(!await page.locator('#project-menu').evaluate(e=>e.open))await page.locator('#project-menu>summary').click();
 const promise=page.waitForEvent('download');await page.locator('#export-project').click();const download=await promise,path=output+'.cycle-'+cycle+'.zip';await download.saveAs(path);
 const files=unzipSync(await readFile(path));
 const project=await readProjectDirectory('examples/canvas-blue-dog');
 for(const source of documentsFor(project)){if(!files[source.name]||strFromU8(files[source.name])!==source.content)throw Error('ZIP changed original model source '+source.name);}
 const story=strFromU8(files[project.manifest.story]);if(!story.includes('Memory regression '+cycle))throw Error('ZIP did not preserve authored scene title');
 return {path,files:Object.keys(files).length,sha256:createHash('sha256').update(await readFile(path)).digest('hex')};
}
async function checkpoint(label,{collect=false}={}){
 const worker=page.workers().find(worker=>worker.url().includes('/engine/worker.js'));
 const native=worker?await worker.evaluate(({collect})=>({linearMemoryBytes:globalThis.__profileMemory?.buffer.byteLength,stats:globalThis.__profileStatsSupported?JSON.parse(globalThis.sysmlWasm.call('GetMemoryStats',JSON.stringify({collect}))).result:null}),{collect}):null;
 const state=await page.evaluate(()=>({status:document.querySelector('#status')?.textContent,scenes:document.querySelectorAll('#scenes option').length,selectedScene:document.querySelector('#scenes')?.selectedOptions[0]?.textContent,narrative:document.querySelector('#narrative')?.textContent,activeNativeIds:[...new Set([...document.querySelectorAll('.node[data-context=\"false\"]')].map(node=>node.dataset.semanticId).filter(Boolean))].sort(),jsHeapUsedBytes:performance.memory?.usedJSHeapSize}));
 if(native?.stats){const settled=/published-model-ready|appended|reloaded|final-idle/.test(label);if(native.stats.retainedModels>(settled?1:2))throw Error('Unbounded native retention at '+label+': '+native.stats.retainedModels);}const sample={label,native,state};evidence.checkpoints??=[];evidence.checkpoints.push(sample);save();return sample;
}
try{
 page=await makePage();await page.goto(origin+'/?demo=blue-dog');await ready();evidence.snapshot=JSON.parse(await readFile(resolve(site,'snapshot.json'),'utf8'));await checkpoint('published-model-ready');
 let lastZip;
 for(let cycle=1;cycle<=cycles;cycle++){
  await findIntegration();const count=await page.locator('#scenes option').count();
  await page.locator('#edit').click();await page.locator('#author-native-slide').click();await page.locator('#authoring-values-button').click();await page.locator('#authoring-values').getByRole('button',{name:'Bind batteryWhKg = resolve natively during validation',exact:true}).click();
  const proposal=JSON.parse(await page.locator('#authoring-proposal').inputValue());
  proposal.title='Memory regression '+cycle;
  proposal.narrative={schemaVersion:'syspresent.narrative.v1',template:'Battery density: {{battery}}',bindings:[{name:'battery',symbol:'BlueDogIC01__integration',attribute:'batteryWhKg',unit:''}]};
  await page.locator('#authoring-proposal').fill(JSON.stringify(proposal,null,2));await page.locator('#authoring-validate').click();
  await page.waitForFunction(()=>!document.querySelector('#authoring-validate').disabled,undefined,{timeout:stepTimeout});
  if(await page.locator('#authoring-append').isDisabled())throw Error('Candidate validation failed: '+await page.locator('#authoring-review').textContent());
  const review=JSON.parse(await page.locator('#authoring-review').textContent()),value=review.values.find(v=>v.attribute==='batteryWhKg');
  if(!value||value.authority!=='native:Evaluate'||String(value.value?.intValue??value.formatted)!=='140')throw Error('Fresh native alias value mismatch '+JSON.stringify(value));
  if(await page.locator('#scenes option').count()!==count)throw Error('Validation appended a scene implicitly');
  await checkpoint('cycle-'+cycle+'-validated');
  await page.locator('#authoring-validate').click();await page.waitForFunction(()=>!document.querySelector('#authoring-validate').disabled,undefined,{timeout:stepTimeout});
  if(await page.locator('#authoring-append').isDisabled())throw Error('Repeated candidate validation failed: '+await page.locator('#authoring-review').textContent());
  const repeatedReview=JSON.parse(await page.locator('#authoring-review').textContent()),repeatedValue=repeatedReview.values.find(v=>v.attribute==='batteryWhKg');
  if(!repeatedValue||repeatedValue.authority!=='native:Evaluate'||String(repeatedValue.value?.intValue)!=='140'||await page.locator('#scenes option').count()!==count)throw Error('Repeated validation changed native value or appended implicitly');
  await checkpoint('cycle-'+cycle+'-revalidated');
  await page.locator('#authoring-append').click();
  await page.waitForFunction(n=>!document.querySelector('#authoring-dialog').open&&document.querySelectorAll('#scenes option').length===n+1,count,{timeout:stepTimeout});await settled();
  if(!(await page.locator('#narrative').textContent()).includes('Battery density: 140'))throw Error('Appended narrative did not resolve140');
  const appended=await checkpoint('cycle-'+cycle+'-appended');
  lastZip=await exportZip(cycle);
  await page.locator('#project-file').setInputFiles(lastZip.path);await ready();
  if(await page.locator('#scenes option').count()!==count+1)throw Error('ZIP reload scene count mismatch');
  const options=await page.locator('#scenes option').evaluateAll(options=>options.map(o=>({value:o.value,title:o.textContent})));
  const appendedOption=options.find(o=>o.title.includes('Memory regression '+cycle));if(!appendedOption)throw Error('ZIP reload lost appended scene');
  await page.locator('#scenes').selectOption(appendedOption.value);await settled();
  if(!(await page.locator('#narrative').textContent()).includes('Battery density: 140'))throw Error('Reloaded native binding did not resolve140');
  const reloaded=await checkpoint('cycle-'+cycle+'-reloaded');if(JSON.stringify(appended.state.activeNativeIds)!==JSON.stringify(reloaded.state.activeNativeIds))throw Error('ZIP reload changed represented native identities');
  record({status:'passed',flow:'updated Blue Dog native proposal append and same-worker ZIP reload',cycle,sceneCount:count+1,nativeValue:String(value.value?.intValue??value.formatted),appended:appended.native,reloaded:reloaded.native,archive:lastZip});
 }
 await page.screenshot({path:output+'.png',fullPage:true});
 await page.close();page=await makePage();await page.goto(origin+'/');await page.locator('#project-file').setInputFiles(lastZip.path);await ready();
 const count=await page.locator('#scenes option').count();const last=await page.locator('#scenes option').evaluateAll(options=>options.find(o=>o.textContent.includes('Memory regression '+options.filter(o=>o.textContent.includes('Memory regression ')).length))?.value);
 if(last){await page.locator('#scenes').selectOption(last);await settled();}
 const fresh=await checkpoint('fresh-worker-zip-reloaded');if(!(await page.locator('#narrative').textContent()).includes('Battery density: 140'))throw Error('Fresh imported binding failed');
 record({status:'passed',flow:'fresh-worker edited Blue Dog ZIP import and native binding reload',sceneCount:count,native:fresh.native});await checkpoint('final-idle-collected',{collect:true});
 if(evidence.external.length||evidence.errors.length)throw Error('Unexpected page errors or external requests');
 evidence.status='passed';
}catch(error){evidence.status='failed';evidence.failure={message:error.message,stack:error.stack};if(page&&!page.isClosed()&&!evidence.nativeFatal){try{const worker=page.workers().find(worker=>worker.url().includes('/engine/worker.js'));evidence.failureCollectionDiagnostic=worker?await worker.evaluate(()=>({interpretation:'Explicit post-failure collection diagnostic; not an acceptance phase',linearMemoryBytes:globalThis.__profileMemory?.buffer.byteLength,stats:globalThis.__profileStatsSupported?JSON.parse(globalThis.sysmlWasm.call('GetMemoryStats',JSON.stringify({collect:true}))).result:null})):null;}catch(diagnosticError){evidence.failureCollectionDiagnostic={error:diagnosticError.message};}save();}if(page&&!page.isClosed()){evidence.failureDOM=await page.evaluate(()=>({status:document.querySelector('#status')?.textContent,review:document.querySelector('#authoring-review')?.textContent,scenes:document.querySelectorAll('#scenes option').length})).catch(()=>null);await page.screenshot({path:output+'.failure.png',fullPage:true}).catch(()=>{});}console.error(error);process.exitCode=1;}
finally{evidence.endedAt=new Date().toISOString();evidence.maxObservedLinearMemoryBytes=Math.max(0,...evidence.trace.map(sample=>sample.linearMemoryBytes||0));save();await browser.close();await new Promise(resolve=>server.close(resolve));}
