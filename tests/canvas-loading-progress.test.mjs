import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {createLoadingProgress,yieldLoadingPaint} from '../src/canvas-prototype/loading-progress.mjs';

const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
function harness(t,{delayMs=150,longRunningMs=10000}={}){
 const window=new JSDOM(html).window,document=window.document;
 let now=0,sequence=0;const timers=new Map();
 const progress=createLoadingProgress(document,{delayMs,longRunningMs,clock:()=>now,schedule:(callback,delay)=>{const id=++sequence;timers.set(id,{at:now+delay,callback});return id;},unschedule:id=>timers.delete(id)});
 const advance=ms=>{const end=now+ms;while(true){const due=[...timers].filter(([,timer])=>timer.at<=end).sort((a,b)=>a[1].at-b[1].at||a[0]-b[0])[0];if(!due)break;timers.delete(due[0]);now=due[1].at;due[1].callback();}now=end;};
 t.after(()=>{progress.dispose();window.close();});
 return {window,document,progress,advance,timers,element:id=>document.getElementById(id)};
}
test('loading feedback is reachable outside the initially hidden model canvas',t=>{
 const h=harness(t);assert.equal(h.element('loading').closest('#stage'),null);
 assert.equal(h.element('loading').getAttribute('role'),'region');
 assert.equal(h.element('loading-phase').getAttribute('role'),'status');
 assert.equal(h.element('loading-error').getAttribute('role'),'alert');
 assert.equal(h.element('loading').hasAttribute('aria-hidden'),false);
 assert.equal(h.element('loading').hidden,true);
});
test('a warm completed load never flashes a card or a false ready percentage',t=>{
 const h=harness(t);h.progress.begin(1,{label:'Reading project'});h.advance(100);
 assert.equal(h.element('loading').hidden,true);assert.equal(h.progress.finish(1),true);h.advance(20000);
 assert.equal(h.element('loading').hidden,true);assert.equal(h.element('loading-progress').hasAttribute('value'),false);assert.equal(h.timers.size,0);
});
test('slow stages reveal measured byte progress and unknown work stays indeterminate',t=>{
 const h=harness(t);h.progress.begin(1,{label:'Downloading project'});h.advance(150);
 assert.equal(h.element('loading').hidden,false);assert.equal(h.element('loading').getAttribute('aria-busy'),'true');
 h.progress.update(1,{stage:'download',label:'Downloading project',completed:1024,total:4096,unit:'bytes'});
 assert.equal(h.element('loading-progress').value,1024);assert.equal(h.element('loading-progress').max,4096);
 assert.equal(h.element('loading-count').textContent,'1.0 KiB of 4.0 KiB');
 assert.match(h.element('loading-progress').getAttribute('aria-label'),/current stage/);
 h.progress.update(1,{stage:'compile',label:'Compiling engine'});
 assert.equal(h.element('loading-progress').hasAttribute('value'),false);assert.equal(h.element('loading-count').hidden,true);
 h.progress.update(1,{stage:'download',label:'Downloading engine',completed:123,unit:'bytes'});
 assert.equal(h.element('loading-progress').hasAttribute('value'),false);
 assert.equal(h.element('loading-count').textContent,'123 B received; total size unavailable');
 h.progress.update(1,{stage:'views',label:'Resolving native views',completed:2,total:3,unit:'views'});
 assert.equal(h.element('loading-count').textContent,'2 of 3 views');
 h.progress.update(1,{stage:'layout',label:'Laying out graph',completed:5,total:0,unit:'nodes'});
 assert.equal(h.element('loading-progress').hasAttribute('value'),false);
});
test('unknown invalid totals cannot become invented percentages or completion',t=>{
 const h=harness(t);h.progress.begin(1);h.advance(150);
 for(const event of [{completed:Infinity,total:20},{completed:1,total:NaN},{completed:9,total:2},{completed:-1,total:8}]){h.progress.update(1,event);assert.equal(h.element('loading-progress').hasAttribute('value'),false);}
 h.progress.update(1,{stage:'files',label:'Reading model files',completed:3,total:3,unit:'files'});
 assert.equal(h.element('loading').hidden,false);assert.equal(h.element('loading').getAttribute('aria-busy'),'true');
 assert.equal(h.element('loading-count').textContent,'3 of 3 files');
 h.progress.finish(1);assert.equal(h.element('loading').hidden,true);
});
test('newer loads reject old progress, failures, completion and scheduled reveals',t=>{
 const h=harness(t);h.progress.begin('old',{label:'Old model'});h.advance(100);
 h.progress.begin('new',{label:'New model'});assert.equal(h.progress.update('old',{label:'Wrong model'}),false);
 assert.equal(h.progress.fail('old',new Error('stale')),false);assert.equal(h.progress.finish('old'),false);
 h.advance(50);assert.equal(h.element('loading').hidden,true);h.advance(100);
 assert.equal(h.element('loading-phase').textContent,'New model');assert.equal(h.element('loading').hidden,false);
 h.progress.cancel('new');assert.equal(h.progress.update('new',{label:'Late network response'}),false);
 assert.equal(h.element('loading').hidden,true);
});
test('long-running text reports elapsed stage time and resets for the next stage',t=>{
 const h=harness(t,{longRunningMs:10000});h.progress.begin(1,{label:'Parsing model'});
 h.advance(9999);assert.equal(h.element('loading-elapsed').hidden,true);h.advance(1);
 assert.equal(h.element('loading-elapsed').textContent,'This stage is still running (10 seconds).');
 h.advance(2000);assert.match(h.element('loading-elapsed').textContent,/12 seconds/);
 h.progress.update(1,{stage:'layout',label:'Laying out model'});assert.equal(h.element('loading-elapsed').hidden,true);
 h.advance(10000);assert.match(h.element('loading-elapsed').textContent,/10 seconds/);
 h.progress.finish(1);assert.equal(h.timers.size,0);
});
test('load failure shows an immediate actionable error and repeated retry clicks start once',async t=>{
 const h=harness(t);let retries=0;
 h.progress.begin(1,{onRetry:()=>{retries++;h.progress.begin(2,{label:'Retrying model'});},onCancel:()=>{}});
 h.progress.fail(1,new Error('Engine download failed. Check the connection and try again.'));
 assert.equal(h.element('loading').hidden,false);assert.equal(h.element('loading-progress').hidden,true);
 assert.equal(h.element('loading').getAttribute('aria-busy'),'false');assert.equal(h.element('loading-retry').hidden,false);
 assert.match(h.element('loading-error').textContent,/Engine download failed/);
 h.element('loading-retry').click();h.element('loading-retry').click();await Promise.resolve();await Promise.resolve();
 assert.equal(retries,1);assert.equal(h.progress.token,2);assert.equal(h.element('loading-phase').textContent,'Retrying model');
 assert.equal(h.progress.fail(1,new Error('late old failure')),false);
});
test('retry failure remains actionable without reviving an obsolete operation',async t=>{
 const h=harness(t);
 h.progress.begin(1,{onRetry:async()=>{throw Error('Still offline');}});h.progress.fail(1,Error('Offline'));
 h.element('loading-retry').click();await new Promise(setImmediate);
 assert.equal(h.element('loading-error').textContent,'Still offline');assert.equal(h.element('loading-retry').disabled,false);
 let staleRetries=0;h.progress.begin(2,{onRetry:()=>{staleRetries++;return Promise.reject(Error('old retry'));},label:'New project'});h.progress.fail(2,Error('Needs retry'));
 h.element('loading-retry').click();h.progress.begin(3,{label:'Latest project'});await new Promise(setImmediate);
 assert.equal(staleRetries,0);assert.equal(h.progress.token,3);assert.equal(h.element('loading-phase').textContent,'Latest project');
});
test('cancel is a single operation callback and cannot affect a subsequent load',t=>{
 const h=harness(t);let canceled=[];
 h.progress.begin(1,{onCancel:token=>canceled.push(token)});h.advance(150);
 h.element('loading-cancel').click();h.element('loading-cancel').click();
 assert.deepEqual(canceled,[1]);assert.equal(h.element('loading').hidden,true);assert.equal(h.progress.token,undefined);
 h.progress.begin(2,{label:'Second model'});assert.equal(h.progress.cancel(1),false);h.advance(150);
 assert.equal(h.element('loading-phase').textContent,'Second model');
});
test('loading and retry controls stay in the current modal and return when it closes',async t=>{
 const h=harness(t),editor=h.element('editor'),author=h.element('authoring-dialog');
 editor.setAttribute('open','');author.setAttribute('open','');
 h.progress.begin(1,{onRetry:()=>{},onCancel:()=>{}});h.advance(150);
 assert.equal(h.element('loading').parentElement,author);
 h.progress.fail(1,Error('Failed native view'));assert.equal(h.element('loading-retry').closest('dialog'),author);
 author.removeAttribute('open');await Promise.resolve();assert.equal(h.element('loading').parentElement,editor);
 editor.removeAttribute('open');await Promise.resolve();assert.equal(h.element('loading').parentElement,h.document.body);
 editor.setAttribute('open','');await Promise.resolve();assert.equal(h.element('loading').parentElement,editor);
 h.progress.finish(1);assert.equal(h.element('loading').parentElement,h.document.body);
});
test('failure content stays inert and disposing clears timers, observers and callbacks',t=>{
 const h=harness(t);let retries=0;
 h.progress.begin(1,{onRetry:()=>retries++});h.progress.fail(1,Error('<img src=x onerror=alert(1)>'));
 assert.equal(h.element('loading-error').querySelector('img'),null);assert.match(h.element('loading-error').textContent,/<img/);
 h.progress.dispose();assert.equal(h.timers.size,0);assert.equal(h.element('loading').hidden,true);
 h.element('loading-retry').click();assert.equal(retries,0);assert.equal(h.progress.begin(2),false);
 assert.equal(h.progress.update(1,{label:'old'}),false);
});
test('paint yield spans two animation frames and clears its bounded hidden-tab fallback',async()=>{
 const frames=[],timers=new Map();let id=0,resolved=false;
 const window={requestAnimationFrame:callback=>frames.push(callback),setTimeout:callback=>{const key=++id;timers.set(key,callback);return key;},clearTimeout:key=>timers.delete(key)};
 const result=yieldLoadingPaint({window}).then(()=>resolved=true);
 assert.equal(resolved,false);frames.shift()();await Promise.resolve();assert.equal(resolved,false);
 frames.shift()();await result;assert.equal(resolved,true);assert.equal(timers.size,0);
 const fallback=yieldLoadingPaint({window});[...timers.values()][0]();await fallback;assert.equal(timers.size,0);
});
