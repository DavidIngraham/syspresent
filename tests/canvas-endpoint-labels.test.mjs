import test from 'node:test';
import assert from 'node:assert/strict';
import {placeEndpointLabels} from '../src/canvas-prototype/endpoint-labels.mjs';
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const nodes=()=>[{id:'a',semanticId:'native-a',x:20,y:80,width:100,height:80},{id:'b',semanticId:'native-b',x:400,y:80,width:100,height:80}];
const labels=()=>[{end:'source',role:'derived',text:'derivedEnd'},{end:'target',role:'original',text:'originalEnd'}];
const edge=()=>({id:'native-relation',semanticId:'assertion',kind:'derive',source:'a',target:'b',points:[{x:120,y:120},{x:400,y:120}],endLabels:labels()});
const area={x:0,y:0,width:600,height:260},measureLabel=text=>({width:text.length*5,height:14});

test('native source/target end labels remain near directed endpoints and preserve semantic records',()=>{
 const input=edge(),original=structuredClone(input),result=placeEndpointLabels([input],nodes(),{area,measureLabel}),draw=result.edges[0];
 assert.equal(result.omissions.length,0);assert.equal(draw.endLabelBoxes.length,2);assert.deepEqual(input,original);
 const source=draw.endLabelBoxes.find(label=>label.end==='source'),target=draw.endLabelBoxes.find(label=>label.end==='target');
 assert.equal(source.role,'derived');assert.equal(source.text,'derivedEnd');assert.equal(target.role,'original');assert.equal(target.text,'originalEnd');
 assert.ok(source.box.x+source.box.width<target.box.x,'labels stay with their own ends rather than midpoint swapping');
 for(const item of draw.endLabelBoxes){assert.ok(item.box.x>=area.x&&item.box.y>=area.y);assert.ok(item.box.x+item.box.width<=area.x+area.width);for(const node of nodes())assert.equal(overlap(item.box,node),false);}
 assert.equal(draw.id,input.id);assert.equal(draw.semanticId,'assertion');assert.equal(draw.source,'a');assert.equal(draw.target,'b');assert.deepEqual(draw.points,input.points);
});

test('a layout rank reversal never reverses native source and target roles',()=>{
 const reversed={...edge(),source:'b',target:'a',points:[{x:400,y:120},{x:120,y:120}]};
 const result=placeEndpointLabels([reversed],nodes(),{area,measureLabel});assert.equal(result.omissions.length,0);
 const a=result.edges[0].endLabelBoxes.find(item=>item.end==='source'),b=result.edges[0].endLabelBoxes.find(item=>item.end==='target');
 assert.equal(a.role,'derived');assert.ok(a.box.x>b.box.x);assert.equal(result.edges[0].source,'b');assert.equal(result.edges[0].target,'a');
});

test('actual port attachments, owner headers and port-label boxes reserve space',()=>{
 const ns=[{id:'assembly',semanticId:'assembly',x:0,y:0,width:560,height:300,headerHeight:55},{id:'owner',semanticId:'owner',parentId:'assembly',x:60,y:130,width:100,height:70},{id:'pin',semanticId:'pin',kind:'port',parentId:'owner',x:154,y:158,width:12,height:12,portLabelBox:{x:170,y:176,width:100,height:20}},{id:'target',semanticId:'target',parentId:'assembly',x:380,y:130,width:100,height:70}];
 const e={...edge(),source:'owner',sourceAttachment:'pin',target:'target',points:[{x:166,y:164},{x:380,y:164}]};
 const result=placeEndpointLabels([e],ns,{area:{x:0,y:0,width:560,height:300},measureLabel});assert.equal(result.omissions.length,0);assert.equal(result.edges[0].endLabelBoxes.length,2);
 for(const label of result.edges[0].endLabelBoxes){assert.ok(label.box.y>=55);assert.equal(overlap(label.box,ns[2].portLabelBox),false);assert.equal(overlap(label.box,ns[1]),false);assert.equal(overlap(label.box,ns[3]),false);}
 assert.equal(result.edges[0].sourceAttachment,'pin');assert.equal(result.edges[0].source,'owner');
});

test('center labels, other end labels and unrelated route corridors cannot be obscured',()=>{
 const primary=edge(),other={id:'crossing',source:'x',target:'y',points:[{x:145,y:0},{x:145,y:260}],labelBox:{x:160,y:100,width:90,height:50}};
 const result=placeEndpointLabels([primary,other],nodes(),{area,measureLabel});
 assert.ok(result.edges[0].endLabelBoxes.length>0);
 for(const label of result.edges[0].endLabelBoxes){assert.equal(overlap(label.box,other.labelBox),false);assert.ok(!(label.box.x<145&&label.box.x+label.box.width>145));}
 const placed=result.edges.flatMap(e=>e.endLabelBoxes??[]);for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++)assert.equal(overlap(placed[i].box,placed[j].box),false);
});

test('dense endpoint corridors disclose omissions without altering native directions or inventing labels',()=>{
 const ns=[{id:'a',x:0,y:80,width:80,height:40},{id:'b',x:320,y:80,width:80,height:40},{id:'upper',x:80,y:0,width:240,height:98},{id:'lower',x:80,y:102,width:240,height:98}];
 const e={...edge(),points:[{x:80,y:100},{x:320,y:100}]},result=placeEndpointLabels([e],ns,{area:{x:0,y:0,width:400,height:200},measureLabel});
 assert.deepEqual(result.edges[0].endLabelBoxes,[]);assert.equal(result.omissions.length,2);assert.ok(result.omissions.every(item=>item.reason==='end-label-space'&&item.relationshipId==='assertion'));
 assert.deepEqual(result.edges[0].endLabels,labels());assert.deepEqual(result.edges[0].points,e.points);
});

test('fitted label scale applies to measured boxes and old payloads remain unchanged',()=>{
 const e={...edge(),labelScale:.5},result=placeEndpointLabels([e],nodes(),{area,measureLabel:()=>({width:80,height:20})});
 assert.equal(result.omissions.length,0);for(const label of result.edges[0].endLabelBoxes){assert.equal(label.box.width,40);assert.equal(label.box.height,10);}
 const legacy={id:'old',kind:'dependency',source:'a',target:'b',points:e.points};
 assert.deepEqual(placeEndpointLabels([legacy],nodes(),{area}).edges,[legacy]);assert.deepEqual(legacy,{id:'old',kind:'dependency',source:'a',target:'b',points:e.points});
});

test('missing native text, unsupported end roles, detached paths and invalid measurements are explicit',()=>{
 const e=edge();e.endLabels=[{end:'source',role:'derived',text:''},{end:'north',text:'not an endpoint'},{end:'target',role:'original',text:'native'}];
 const result=placeEndpointLabels([e],nodes(),{area,measureLabel:()=>({width:NaN,height:12})});
 assert.deepEqual(result.edges[0].endLabelBoxes,[]);assert.deepEqual(result.omissions.map(x=>x.reason),['end-label-text-unavailable','invalid-end-label','end-label-measurement']);
 const detached=placeEndpointLabels([{...edge(),points:[{x:125,y:120},{x:395,y:120}]}],nodes(),{area,measureLabel});
 assert.equal(detached.omissions.length,2);assert.ok(detached.omissions.every(x=>x.reason==='end-label-route'));
 assert.throws(()=>placeEndpointLabels([edge()],nodes(),{area:{x:0,y:0,width:0,height:100}}),/finite positive/);
});

test('malformed label lists and nonfinite scaled measurements fail closed',()=>{
 const wrongList=placeEndpointLabels([{...edge(),endLabels:{end:'source',text:'invalid list'}}],nodes(),{area,measureLabel});
 assert.equal(wrongList.omissions[0].reason,'invalid-end-label');assert.deepEqual(wrongList.edges[0].endLabelBoxes,[]);
 const badScale=placeEndpointLabels([{...edge(),labelScale:NaN}],nodes(),{area,measureLabel});
 assert.equal(badScale.omissions.length,2);assert.ok(badScale.omissions.every(item=>item.reason==='end-label-measurement'));
 const overflow=placeEndpointLabels([{...edge(),labelScale:1e308}],nodes(),{measureLabel:()=>({width:1e308,height:1e308})});
 assert.equal(overflow.omissions.length,2);assert.deepEqual(overflow.edges[0].endLabelBoxes,[]);
});

test('missing native ancestor header geometry cannot become an unreserved label area',()=>{
 const ns=[{id:'outer',x:0,y:0,width:600,height:260},...nodes().map(node=>({...node,parentId:'outer'}))];
 const result=placeEndpointLabels([edge()],ns,{area,measureLabel});
 assert.deepEqual(result.edges[0].endLabelBoxes,[]);assert.ok(result.omissions.every(item=>item.reason==='end-label-space'));
});
