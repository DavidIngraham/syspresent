#!/usr/bin/env node
/** Actual Chromium/WASM effective-requirement scope and native provenance check. */
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname,sep,dirname} from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
const args=process.argv.slice(2),option=(name,fallback)=>args.includes(name)?args[args.indexOf(name)+1]:fallback;
const site=resolve(option('--site','build/canvas-prototype/site')),output=resolve(option('--output','build/browser-effective-requirements.json'));
const playwright=option('--playwright',null),executablePath=option('--chromium',undefined);
const {chromium}=await import(playwright?pathToFileURL(resolve(playwright)):'playwright');
await mkdir(dirname(output),{recursive:true});
const server=createServer(async(req,res)=>{try{
 let path=resolve(site,'.'+new URL(req.url,'http://localhost').pathname);
 if(path!==site&&!path.startsWith(site+sep))return res.writeHead(403).end();
 if(path===site||path.endsWith('/'))path=resolve(path,'index.html');
 const bytes=await readFile(path);res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm','.css':'text/css'})[extname(path)]??'application/octet-stream');res.end(bytes);
}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const browser=await chromium.launch({headless:true,executablePath,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),errors=[];
page.on('pageerror',error=>errors.push(error.message));
try{
 await page.goto('http://127.0.0.1:'+server.address().port+'/');
 await page.locator('#sysml-files').setInputFiles(resolve('tests/fixtures/part-effective.sysml'));
 await page.waitForFunction(()=>document.querySelector('#status')?.textContent.startsWith('OpenSysML WASM')&&document.querySelector('#loading')?.hidden,undefined,{timeout:180000});
 if(await page.locator('#find').isHidden())await page.locator('#find-toggle').click();
 await page.locator('#search').fill('EffectiveFixture::component');
 await page.locator('#search-results').getByRole('button',{name:'EffectiveFixture::component',exact:true}).click();
 await page.waitForFunction(()=>document.querySelector('#stage')?.getAttribute('aria-busy')!=='true');
 const component=page.locator('.node[data-context="false"][data-semantic-id="EffectiveFixture__component"]');
 await component.locator('.name').first().click();
 await page.locator('#selection').getByRole('button',{name:/^Effective requirements \(2\)$/}).click();
 await page.waitForFunction(()=>document.querySelector('#exploration-label')?.textContent.startsWith('Effective requirements')&&document.querySelector('#stage')?.getAttribute('aria-busy')!=='true');
 const observed=await page.evaluate(()=>({status:document.querySelector('#status').textContent,label:document.querySelector('#exploration-label').textContent,active:[...document.querySelectorAll('.node[data-context="false"][data-semantic-id]')].map(n=>n.dataset.semanticId).sort(),relationships:[...document.querySelectorAll('g[data-relationship][data-context="false"]')].map(e=>({id:e.dataset.relationship,kind:e.dataset.kind}))}));
 assert.deepEqual(observed.active,['EffectiveFixture__Base__baseReq','EffectiveFixture__Derived__localReq','EffectiveFixture__component']);
 for(const id of ['EffectiveFixture__Base','EffectiveFixture__Derived'])assert.ok(!observed.active.includes(id),'Collapsed inheritance type '+id);
 assert.equal(observed.relationships.length,0,'Collapsed paths must not become invented requirement links');
 assert.match(observed.status,/inherited paths retain native provenance/);
 assert.deepEqual(errors,[]);
 await writeFile(output,JSON.stringify({site,observed,errors},null,2)+'\n');console.log(JSON.stringify(observed));
}finally{await browser.close();await new Promise(r=>server.close(r));}
