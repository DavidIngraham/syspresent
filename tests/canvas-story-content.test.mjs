import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {validateStoryContent,renderMarkdown,renderContext,chapterGroups,sceneURL,sceneFromURL,checkSharedModel,nativeIdentityResolver} from '../src/canvas-prototype/story-content.mjs';
import {createAssetURLs,mountFigure} from '../src/canvas-prototype/figure-view.mjs';
import {packProject,unpackProject,parseStory,writeStory,projectPath} from '../src/canvas-prototype/project.mjs';

const resolve=nativeIdentityResolver({elements:[{'@id':'native-a',qualifiedName:'Boat::requirement'},{'@id':'native-b',qualifiedName:'Boat::candidate'}]});
const figure={id:'course',title:'Course',asset:'assets/course.svg',alt:'Two gates on a river',caption:'Illustrative course.',provenance:{source:'Course model',context:'Illustrative configuration'},modelRefs:['Boat::requirement']};
const card={kind:'candidate',title:'Candidate configuration',text:'Proposed geometry.',modelRefs:['Boat::candidate'],evidence:{classification:'prepared-analysis',source:'Sizing analysis',configuration:'Candidate A',inputs:{massKg:12}}};
const scene={type:'scene',id:'start',title:'Challenge',view:'Views::start',focus:'Boat::requirement',chapter:{id:'challenge',title:'The challenge'},figures:[figure],context:[card],markdown:'Inspect [the requirement](model:Boat::requirement).'};
const files={'model.sysml':'package Boat {}','story.md':writeStory('Story',[scene]),'assets/course.svg':'<svg xmlns="http://www.w3.org/2000/svg"><text>Course</text></svg>'};

test('portable chapter, figure bytes, evidence and semantic prose survive project and Markdown round trips',()=>{
 const imported=unpackProject(packProject({files}));assert.deepEqual(parseStory(new TextDecoder().decode(imported.files['story.md'])),[scene]);assert.equal(new TextDecoder().decode(imported.files['assets/course.svg']),files['assets/course.svg']);
 validateStoryContent([scene],{files,resolve,pathFor:projectPath});
});
test('publication rejects missing figures, unsafe paths and unsupported embedded documents',()=>{
 for(const asset of ['missing.svg','../course.svg','https://example.com/course.svg','course.html'])assert.throws(()=>validateStoryContent([{...scene,figures:[{...figure,asset}]}],{files,resolve,pathFor:projectPath}),/figure|path/);
});
test('every narrative, figure and context reference must resolve by native identity',()=>{
 for(const bad of [{...scene,markdown:'[unknown](model:Boat::missing)'},{...scene,figures:[{...figure,modelRefs:['Boat::missing']}]},{...scene,context:[{...card,modelRefs:['Boat::missing']}]}])assert.throws(()=>validateStoryContent([bad],{files,resolve,pathFor:projectPath}),/Scene start.*Boat::missing/);
 const ambiguous=nativeIdentityResolver({elements:[{'@id':'one',qualifiedName:'Same'},{'@id':'two',qualifiedName:'Same'}]});assert.throws(()=>ambiguous('Same'),/Ambiguous/);assert.equal(ambiguous('one'),'one');
});
test('recorded executions require identity and context, without converting classification into acceptance',()=>{
 assert.throws(()=>validateStoryContent([{...scene,context:[{...card,evidence:{...card.evidence,classification:'recorded-execution'}}]}]),/runId/);
 const window=new JSDOM().window,host=renderContext(window.document,[card],{resolve,onSelect(){}});assert.match(host.textContent,/Prepared analysis/);assert.match(host.textContent,/does not establish acceptance/);assert.equal(host.querySelector('details').open,false);window.close();
});
test('chapters remain contiguous and figures cannot shadow native region identities',()=>{
 assert.throws(()=>validateStoryContent([scene,{...scene,id:'middle',chapter:{id:'design',title:'Design'}},{...scene,id:'end'}]),/contiguous/);
 assert.throws(()=>validateStoryContent([{...scene,figures:[{...figure,id:'primary'}]}]),/duplicate region/);
 assert.throws(()=>validateStoryContent([scene,{...scene,id:'end',chapter:{id:'challenge',title:'Other title'}}]),/Conflicting/);
 assert.equal(chapterGroups([scene,{...scene,id:'end'}])[0].scenes.length,2);
});
test('safe narrative links select exact native identities; code and untrusted markup remain literal',()=>{
 const window=new JSDOM().window,doc=window.document,selected=[];
 const value='[Inspect](model:Boat%3A%3Acandidate) [Source](https://example.com/source) [Bad](javascript:alert) <img src=x onerror=alert(1)> `x [literal](model:Missing)`\n\n```\n[also literal](model:Missing)\n```';
 validateStoryContent([{...scene,markdown:value}],{resolve});const host=renderMarkdown(doc,value,{resolve,onSelect:id=>selected.push(id)});
 assert.equal(host.querySelectorAll('[data-model-id]').length,1);host.querySelector('button').click();assert.deepEqual(selected,['native-b']);assert.equal(host.querySelectorAll('a').length,1);assert.equal(host.querySelector('img'),null);assert.match(host.querySelector('pre').textContent,/model:Missing/);window.close();
});
test('deep links retain deployment path, select chapters and reject missing scenes or changed snapshots',()=>{
 const scenes=[scene,{...scene,id:'candidate',chapter:{id:'design',title:'Design'}}],url=sceneURL('https://host/reviews/frozen/?x=1',{scene:'candidate',demo:'boat',modelHash:'hash',publication:'pub'});
 assert.match(url,/reviews\/frozen\//);assert.equal(sceneFromURL(url,scenes),1);assert.equal(sceneFromURL('https://host/#chapter=design',scenes),1);checkSharedModel(url,'hash','pub');assert.throws(()=>checkSharedModel(url,'hash','changed'),/different story/);assert.throws(()=>sceneFromURL('https://host/#scene=missing',scenes),/unavailable/);
});
test('figure presentation preserves image alt text, provenance, selection and scroll state',()=>{
 const window=new JSDOM().window,host=window.document.createElement('section'),selected=[];window.document.body.append(host);
 const view=mountFigure(host,figure,{assetURL:()=> 'blob:local',resolve,onSelect:id=>selected.push(id),state:{scrollTop:12}});assert.equal(host.querySelector('img').alt,figure.alt);assert.match(host.textContent,/Illustrative configuration/);host.querySelector('[data-model-id]').click();assert.deepEqual(selected,['native-a']);assert.equal(view.getState().scrollTop,12);view.selectMany(['native-a']);assert.ok(host.querySelector('.selected'));view.destroy();assert.equal(host.childElementCount,0);window.close();
});
test('asset URLs are reused within a project and revoked on replacement',()=>{
 const created=[],revoked=[],store=createAssetURLs(files,{createObjectURL:blob=>(created.push(blob),'blob:'+created.length),revokeObjectURL:url=>revoked.push(url)});assert.equal(store.get(figure.asset),store.get(figure.asset));assert.equal(created[0].type,'image/svg+xml');store.destroy();assert.deepEqual(revoked,['blob:1']);
});
