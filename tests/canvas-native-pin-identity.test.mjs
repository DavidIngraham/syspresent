import test from 'node:test';
import assert from 'node:assert/strict';
import ELK from 'elkjs/lib/elk.bundled.js';
import {layoutDiagram} from '../src/canvas-prototype/elk-layout.mjs';
import {manualLayoutSupport} from '../src/canvas-prototype/manual-layout.mjs';
test('native canonical parameter identity remains distinct from disposable glyph and rendering pin IDs',async()=>{
 const view={id:'native-activity',kind:'action',nodes:[
  {id:'a',semanticId:'action-a',kind:'action',name:'a',ports:[{id:'a.out',semanticId:'parameter-out',qualifiedName:'Model::A::out',identityStatus:'mapped',name:'output',direction:'out',parameter:true}]},
  {id:'b',semanticId:'action-b',kind:'action',name:'b',ports:[{id:'b.in',semanticId:'parameter-in',qualifiedName:'Model::B::in',identityStatus:'mapped',name:'input',direction:'in',parameter:true}]}
 ],edges:[{id:'flow-drawing',semanticId:'flow-native',from:'a',to:'b',kind:'flow',fromPort:'a.out',toPort:'b.in'}]},before=structuredClone(view);
 const drawing=await layoutDiagram(view,{elk:new ELK(),width:1000,height:800});
 const pins=drawing.nodes.filter(node=>node.kind==='port');
 assert.equal(pins.length,2);
 const output=pins.find(node=>node.semanticId==='parameter-out'),input=pins.find(node=>node.semanticId==='parameter-in');
 assert.equal(output.nativePortId,'a.out');assert.equal(input.nativePortId,'b.in');
 assert.notEqual(output.id,output.semanticId);assert.notEqual(output.id,output.nativePortId);
 assert.equal(output.portSide,'EAST');assert.equal(input.portSide,'WEST');
 assert.equal(output.identityStatus,'mapped');assert.equal(output.qualifiedName,'Model::A::out');
 assert.equal(drawing.edges[0].sourceAttachment,output.id);assert.equal(drawing.edges[0].targetAttachment,input.id);
 assert.equal(drawing.edges[0].semanticId,'flow-native');
 assert.equal(manualLayoutSupport(drawing,output.id).supported,false,'a native identity does not authorize detaching the owner pin');
 assert.deepEqual(view,before);
});
test('older native pin records without a semantic identity remain honest drawing glyphs',async()=>{
 const drawing=await layoutDiagram({id:'old-pins',kind:'action',nodes:[{id:'a',semanticId:'action',kind:'action',name:'a',ports:[{id:'raw-pin',name:'input',direction:'in'}]}],edges:[]},{elk:new ELK(),width:600,height:600});
 const pin=drawing.nodes.find(node=>node.kind==='port');
 assert.equal(pin.semanticId,null);assert.equal(pin.identityStatus,'modeled-pin');
 assert.equal(pin.nativePortId,'raw-pin');
});
