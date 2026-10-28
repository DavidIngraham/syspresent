#!/usr/bin/env node
/**
 * Reproducible Chromium startup measurements. No telemetry or provider calls.
 * Public baseline runs use original assets and preserve browser HTTP caching.
 * Optional worker/CPU instrumentation is reported separately from baseline.
 */
import {readFile,writeFile,mkdir,mkdtemp} from 'node:fs/promises';
import {createServer} from 'node:http';
import {gzipSync} from 'node:zlib';
import {tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {resolve,dirname,extname,sep} from 'node:path';
const option=(name,fallback)=>process.argv.includes(name)?process.argv[process.argv.indexOf(name)+1]:fallback;
const playwright=option('--playwright',process.env.PLAYWRIGHT_MODULE??'playwright');
const {chromium}=await import(playwright.startsWith('/')||playwright.startsWith('.')?pathToFileURL(resolve(playwright)).href:playwright);
const site=option('--site',null),persistent=process.argv.includes('--persistent-profile');
let server,base=option('--base','https://davidingraham.github.io/syspresent/');
if(site){
 const root=resolve(site),encoded=new Map();
 server=createServer(async(req,res)=>{
  try{
   let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
   if(path!==root&&!path.startsWith(root+sep)){res.writeHead(403).end();return;}
   if(path===root||req.url.split('?')[0].endsWith('/'))path=resolve(path,'index.html');
   const type=({'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.wasm':'application/wasm','.css':'text/css','.zip':'application/zip','.svg':'image/svg+xml'})[extname(path)]??'application/octet-stream';
   const gzip=/gzip/.test(req.headers['accept-encoding']??'')&&!['.zip','.png','.jpg','.webp'].includes(extname(path));
   const key=path+'|'+gzip;let bytes=encoded.get(key);if(!bytes){bytes=await readFile(path);if(gzip)bytes=gzipSync(bytes,{level:6});encoded.set(key,bytes);}
   res.setHeader('Content-Type',type);res.setHeader('Content-Length',bytes.length);
   res.setHeader('Cache-Control',extname(path)==='.html'?'no-cache':'public, max-age=600');
   if(gzip)res.setHeader('Content-Encoding','gzip');res.end(bytes);
  }catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base='http://127.0.0.1:'+server.address().port+'/';
}
const output=resolve(option('--output','build/startup-public-baseline.json'));
const mode=option('--mode','baseline');
const executable=option('--chromium',process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH);
const onlyDemo=option('--demo',null);
const onlyCondition=option('--condition',null);
await mkdir(dirname(output),{recursive:true});
try{await readFile(output);throw Error('Refusing to overwrite '+output);}catch(e){if(e.code!=='ENOENT')throw e;}
const scenarios=onlyDemo==='landing'?[{demo:'landing',condition:onlyCondition??'normal'}]:mode==='instrumented'?[{demo:onlyDemo??'blue-dog',condition:'normal'}]:
 [{demo:'flashlight',condition:'normal'},{demo:'blue-dog',condition:'normal'},{demo:'blue-dog',condition:'constrained'}].filter(s=>(!onlyDemo||s.demo===onlyDemo)&&(!onlyCondition||s.condition===onlyCondition));
const evidence={schemaVersion:1,startedAt:new Date().toISOString(),base,mode,browserContext:persistent?'fresh persistent profile per scenario; cold then same-profile reload':'nonpersistent incognito context; cold then same-context reload',localServer:site?{site:resolve(site),gzipLevel:6,cacheControl:'public,max-age=600 except HTML no-cache'}:null,conditions:{normal:{network:'host connection, no emulation',cpuRate:1},constrained:{cdpPageNetwork:{latencyMs:80,downloadBytesPerSecond:375000,uploadBytesPerSecond:125000},cdpPageCPUThrottlingRate:4,note:'Desktop Chromium CDP emulation; record worker transfer timings, not a physical iOS/Safari claim.'}},runs:[],errors:[]};
const save=()=>writeFile(output,JSON.stringify(evidence,null,2)+'\n');
if(!['baseline','instrumented'].includes(mode)||!scenarios.length)throw Error('Choose baseline/instrumented mode and a supported demo/condition.');
await save();
function initObserver(){
 performance.setResourceTimingBufferSize(4096);
 window.__startup={statuses:[],longTasks:[],firstUsable:null};
 try{new PerformanceObserver(list=>{for(const e of list.getEntries())window.__startup.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});}catch{}
 const begin=()=>{
  const status=document.querySelector('#status'),loading=document.querySelector('#loading'),stage=document.querySelector('#stage');
  if(!status||!loading||!stage)return;
  let last='';
  const check=()=>{
   const text=status.textContent;
   if(text!==last){window.__startup.statuses.push({time:performance.now(),text});last=text;}
   const landingReady=!new URLSearchParams(location.search).has('demo')&&!document.querySelector('#landing')?.hidden&&document.querySelectorAll('[data-demo]').length>0;
   if(window.__startup.firstUsable===null&&(landingReady||(text.startsWith('OpenSysML WASM')&&loading.hidden&&stage.getAttribute('aria-busy')!=='true'&&document.querySelector('.node[data-context="false"]')))){
    requestAnimationFrame(()=>requestAnimationFrame(()=>{if(window.__startup.firstUsable===null)window.__startup.firstUsable=performance.now();}));
   }
  };
  const observer=new MutationObserver(check);
  observer.observe(status,{childList:true,characterData:true,subtree:true});
  observer.observe(loading,{attributes:true,attributeFilter:['hidden']});
  observer.observe(stage,{attributes:true,attributeFilter:['aria-busy'],childList:true});
  check();
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',begin,{once:true});else begin();
}
function workerProbe(){
 if(globalThis.__startupProbe)return;
 const records=globalThis.__startupProbe={attachedAt:performance.now(),timeOrigin:performance.timeOrigin,nativeCalls:[],wasm:[],apiReadyAt:null};
 for(const name of ['instantiate','instantiateStreaming']){
  const original=WebAssembly[name];if(typeof original!=='function')continue;
  WebAssembly[name]=async function(...args){
   const start=performance.now();
   try{return await Reflect.apply(original,this,args);}finally{records.wasm.push({method:name,start,duration:performance.now()-start,bytes:args[0]?.byteLength??null});}
  };
 }
 const wrap=api=>{
  if(!api||typeof api.call!=='function'||api.__startupWrapped)return api;
  const original=api.call;
  api.call=function(method,params){
   const start=performance.now();
   try{return Reflect.apply(original,this,[method,params]);}
   finally{records.nativeCalls.push({method,start,duration:performance.now()-start,requestChars:typeof params==='string'?params.length:null});}
  };
  Object.defineProperty(api,'__startupWrapped',{value:true});
  records.apiReadyAt=performance.now();return api;
 };
 if(globalThis.sysmlWasm)wrap(globalThis.sysmlWasm);
 else Object.defineProperty(globalThis,'sysmlWasm',{configurable:true,enumerable:true,get(){return undefined;},set(api){Object.defineProperty(globalThis,'sysmlWasm',{configurable:true,enumerable:true,writable:true,value:wrap(api)});}});
}
function cpuSummary(profile){
 const map=new Map(profile.nodes.map(n=>[n.id,n])),parents=new Map();
 for(const n of profile.nodes)for(const child of n.children??[])parents.set(child,n.id);
 const totals=new Map();
 for(let i=0;i<(profile.samples??[]).length;i++){
  const id=profile.samples[i],duration=profile.timeDeltas?.[i]??1000;let current=id;const seen=new Set();
  while(current&&!seen.has(current)){
   seen.add(current);const n=map.get(current);if(!n)break;const f=n.callFrame;
   const key=JSON.stringify([f.functionName,f.url,f.lineNumber]);
   const value=totals.get(key)??{function:f.functionName||'(anonymous)',url:f.url,line:f.lineNumber+1,selfMs:0,inclusiveMs:0};
   value.inclusiveMs+=duration/1000;if(current===id)value.selfMs+=duration/1000;totals.set(key,value);current=parents.get(current);
  }
 }
 return [...totals.values()].filter(x=>x.url.includes('app.js')).sort((a,b)=>b.selfMs-a.selfMs).slice(0,35);
}
for(const scenario of scenarios){
 const launch={headless:true,...(executable?{executablePath:executable}:{}),args:['--no-sandbox','--host-resolver-rules=MAP * ~NOTFOUND, EXCLUDE '+new URL(base).hostname]};
 const contextOptions={viewport:{width:1440,height:1000},reducedMotion:'reduce'};
 const profile=persistent?await mkdtemp(resolve(tmpdir(),'syspresent-startup-profile-')):null;
 const browser=persistent?null:await chromium.launch(launch);
 const context=persistent?await chromium.launchPersistentContext(profile,{...launch,...contextOptions}):await browser.newContext(contextOptions);
 try{
  await context.addInitScript(initObserver);
  const page=await context.newPage(),cdp=await context.newCDPSession(page),network=[],external=[],pageErrors=[];
  await cdp.send('Network.enable');await cdp.send('Network.clearBrowserCache');
  if(scenario.condition==='constrained'){
   await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:80,downloadThroughput:375000,uploadThroughput:125000,connectionType:'cellular4g'});
   await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  }
  cdp.on('Network.responseReceived',e=>network.push({event:'response',requestId:e.requestId,url:e.response.url,mimeType:e.response.mimeType,fromDiskCache:e.response.fromDiskCache??false,fromServiceWorker:e.response.fromServiceWorker??false,encodedDataLength:e.response.encodedDataLength,protocol:e.response.protocol,timestamp:e.timestamp,headers:e.response.headers}));
  cdp.on('Network.loadingFinished',e=>network.push({event:'finished',requestId:e.requestId,encodedDataLength:e.encodedDataLength,timestamp:e.timestamp}));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&(!r.url().startsWith(base)||r.method()!=='GET'))external.push({url:r.url(),method:r.method()});});
  page.on('pageerror',e=>pageErrors.push(e.message));
  if(mode==='instrumented'){
   page.on('worker',worker=>{if(worker.url().includes('/engine/worker.js'))worker.evaluate(workerProbe).catch(e=>pageErrors.push('Probe attach: '+e.message));});
   await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});
  }
  for(const temperature of mode==='instrumented'?['cold']:['cold','warm']){
   const run={demo:scenario.demo,condition:scenario.condition,temperature,profile,startedAt:new Date().toISOString(),networkStart:network.length};
   evidence.runs.push(run);await save();
   if(mode==='instrumented')await cdp.send('Profiler.start');
   const wallStart=Date.now();
   if(temperature==='cold')await page.goto(scenario.demo==='landing'?base:base+'?demo='+scenario.demo,{waitUntil:'domcontentloaded',timeout:90000});else await page.reload({waitUntil:'domcontentloaded',timeout:90000});
   await page.waitForFunction(()=>window.__startup?.firstUsable!==null&&window.__startup?.firstUsable!==undefined,undefined,{timeout:300000});
   run.wallElapsedMs=Date.now()-wallStart;
   Object.assign(run,await page.evaluate(()=>({
    ...window.__startup,
    navigation:performance.getEntriesByType('navigation').map(e=>e.toJSON()),
    paint:performance.getEntriesByType('paint').map(e=>e.toJSON()),
    resources:performance.getEntriesByType('resource').map(e=>e.toJSON()),
    status:document.querySelector('#status')?.textContent,
    nodeCount:document.querySelectorAll('.node[data-context="false"]').length,
    build:document.querySelector('meta[name="syspresent-build"]')?.content,
    userAgent:navigator.userAgent,
    hardwareConcurrency:navigator.hardwareConcurrency
   })));
   const workers=page.workers();run.workers=[];
   for(const worker of workers){
    try{run.workers.push({url:worker.url(),...(await worker.evaluate(()=>({timeOrigin:performance.timeOrigin,now:performance.now(),resources:performance.getEntriesByType('resource').map(e=>e.toJSON()),probe:globalThis.__startupProbe??null})))});}catch(e){run.workers.push({url:worker.url(),error:e.message});}
   }
   if(mode==='instrumented'){const {profile}=await cdp.send('Profiler.stop');run.cpuSummary=cpuSummary(profile);await writeFile(output+'.cpuprofile',JSON.stringify(profile));}
   run.network=network.slice(run.networkStart);delete run.networkStart;
   run.errors=[...pageErrors];run.external=[...external];run.finishedAt=new Date().toISOString();
   const snapshot=await context.request.get(base+'snapshot.json');run.snapshot={revision:(await snapshot.json()).revision};
   if(pageErrors.length||external.length)throw Error('Unexpected page/network errors');
   run.result='passed';await save();
   console.log(JSON.stringify({demo:run.demo,condition:run.condition,temperature:run.temperature,firstUsableMs:run.firstUsable,longTaskMs:run.longTasks.reduce((n,x)=>n+x.duration,0),status:run.status}));
  }
  await context.close();
 }catch(error){evidence.errors.push({scenario,message:error.message,stack:error.stack});await save();throw error;}
 finally{await context.close();await browser?.close();}
}
evidence.finishedAt=new Date().toISOString();await save();if(server)await new Promise(resolve=>server.close(resolve));
