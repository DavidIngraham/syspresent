import test from 'node:test';
import assert from 'node:assert/strict';
import {loadReaderSettings,saveReaderSettings,compartmentVisible} from '../src/canvas-prototype/reader-settings.mjs';
import {connectionPath} from '../src/canvas-prototype/routing-style.mjs';
import {regionAreas} from '../src/canvas-prototype/scene-regions.mjs';
test('reader settings default to all, survive reload, and tolerate unavailable storage',()=>{
 const entries=new Map(),storage={getItem:k=>entries.get(k),setItem:(k,v)=>entries.set(k,v)};
 assert.deepEqual(loadReaderSettings(storage),{compartments:'all',routing:'square'});
 saveReaderSettings(storage,{compartments:'focused',routing:'mind-map'});
 assert.deepEqual(loadReaderSettings(storage),{compartments:'focused',routing:'mind-map'});
 assert.deepEqual(loadReaderSettings(null),{compartments:'all',routing:'square'});
});
test('focused compartments depend on focus, not first-click selection; explicit overrides remain local',()=>{
 const a={semanticId:'a'},b={semanticId:'b'};
 assert.equal(compartmentVisible(a,{mode:'all'}),true);
 assert.equal(compartmentVisible(b,{mode:'none',focus:'b'}),false);
 assert.equal(compartmentVisible(a,{mode:'focused',focus:'a'}),true);
 assert.equal(compartmentVisible(b,{mode:'focused',focus:'a'}),false);
 assert.equal(compartmentVisible(a,{mode:'all',collapsed:new Set(['a'])}),false);
 assert.equal(compartmentVisible(a,{mode:'none',expanded:new Set(['a'])}),true);
});
test('routing styles preserve terminals and leave semantic records immutable',()=>{
 const points=[{x:10,y:20},{x:80,y:20},{x:80,y:100},{x:150,y:100}],edge=Object.freeze({kind:'satisfy',source:'a',target:'b',fromPort:'real'});
 const copy=structuredClone(points),square=connectionPath(points,{edge}),curve=connectionPath(points,{edge,style:'mind-map'});
 assert.match(square,/^M10,20 L/);assert.match(curve,/^M10,20 C/);assert.match(curve,/150,100$/);
 assert.deepEqual(points,copy);assert.equal(edge.fromPort,'real');assert.equal(edge.source,'a');
});
test('mind-map curves retain a routed detour around an unrelated card',()=>{
 const points=[{x:10,y:20},{x:10,y:-50},{x:150,y:-50},{x:150,y:100}],edge={source:'a',target:'b'};
 const nodes=[{id:'block',x:40,y:0,width:80,height:80}];
 const path=connectionPath(points,{style:'mind-map',edge,nodes});
 assert.doesNotMatch(path,/ C/);assert.match(path,/ Q/);assert.match(path,/150,100$/);
});
test('regions divide wide available space and retain a full readable narrow viewport',()=>{
 const regions=[{id:'primary'},{id:'matrix'}],area={x:10,y:20,width:1000,height:500};
 const wide=regionAreas(area,regions);assert.ok(wide.every(r=>r.visible));assert.ok(wide[0].area.x+wide[0].area.width<wide[1].area.x);
 const narrow=regionAreas({...area,width:390},regions,'matrix');assert.deepEqual(narrow.map(r=>r.visible),[false,true]);assert.equal(narrow[1].area.width,390);
});
test('curved routing cannot cut back through a terminal card or its header',()=>{
 const points=[{x:100,y:50},{x:100,y:0},{x:50,y:0}],edge={source:'a',target:'a'},nodes=[{id:'a',x:0,y:0,width:100,height:100}];
 assert.equal(connectionPath(points,{style:'mind-map',edge,nodes}),'M100,50 L100,0 L50,0');
});
