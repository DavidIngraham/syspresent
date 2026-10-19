import test from 'node:test';
import assert from 'node:assert/strict';
import ELK from 'elkjs/lib/elk.bundled.js';
import {layoutDiagram} from '../src/canvas-prototype/elk-layout.mjs';
const elk=new ELK();
const options={width:390,height:520,elk,measureLabel:text=>({width:text.length*6.5,height:16})};
const fixture=()=>({id:'native-view',kind:'requirement',nodes:[{id:'parent',semanticId:'native-parent',width:280,height:170},...['a','b','c','d'].map(id=>({id,semanticId:'native-'+id,width:160,height:76}))],edges:['a','b','c','d'].map(id=>({id:'derive-'+id,source:id,target:'parent',kind:'derive',label:'derive'}))});
const overlap=(a,b)=>a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;
const segmentHits=(a,b,n)=>a.x===b.x?a.x>n.x+.01&&a.x<n.x+n.width-.01&&Math.max(a.y,b.y)>n.y+.01&&Math.min(a.y,b.y)<n.y+n.height-.01:a.y===b.y&&a.y>n.y+.01&&a.y<n.y+n.height-.01&&Math.max(a.x,b.x)>n.x+.01&&Math.min(a.x,b.x)<n.x+n.width-.01;
function clear(view){for(const e of view.edges){assert.ok(e.points.length>=2,'edge '+e.id+' must route');for(let i=1;i<e.points.length;i++){const a=e.points[i-1],b=e.points[i];assert.ok(a.x===b.x||a.y===b.y,'orthogonal');for(const n of view.nodes.filter(n=>!view.nodes.some(c=>c.parentId===n.id)))assert.equal(segmentHits(a,b,n),false,e.id+' crosses '+n.id);}for(const other of view.edges.filter(other=>other.labelBox))for(let i=1;i<e.points.length;i++)assert.equal(segmentHits(e.points[i-1],e.points[i],other.labelBox),false,e.id+' crosses a connection label');if(e.labelBox)for(const n of view.nodes.filter(n=>!view.nodes.some(c=>c.parentId===n.id)))assert.equal(overlap(e.labelBox,n),false,'label crosses '+n.id);}}
test('joint phone layout preserves native direction, separates all derivations and chooses responsive rows',async()=>{const native=fixture(),before=structuredClone(native),view=await layoutDiagram(native,options);assert.deepEqual(native,before);assert.equal(view.nodes.length,5);assert.equal(view.edges.length,4);assert.equal(view.diagnostics.length,0);clear(view);const parent=view.nodes.find(n=>n.id==='parent');assert.ok(view.nodes.slice(1).every(n=>n.y>parent.y));assert.ok(new Set(view.nodes.slice(1).map(n=>n.y)).size>1,'children must not stay one unreadably wide row');assert.ok(view.layoutFitScale>.65);assert.equal(new Set(view.edges.map(e=>e.points.at(-1).x)).size,4);for(const edge of view.edges){assert.equal(edge.target,'parent');assert.ok(edge.labelBox);assert.equal(edge.sourceAnchor.identityStatus,'drawing-anchor');assert.equal(edge.targetAnchor.semanticId,null);}});
test('crosslinks and parallel edges remain individually routed and labeled',async()=>{const native=fixture();native.edges.push({id:'cross',source:'b',target:'d',kind:'dependency',label:'dependency'},{id:'parallel',source:'a',target:'parent',kind:'verify',label:'verify'});const view=await layoutDiagram(native,{...options,width:900,height:700});assert.equal(view.edges.length,6);assert.equal(view.diagnostics.length,0);clear(view);assert.notDeepEqual(view.edges.find(e=>e.id==='derive-a').points,view.edges.find(e=>e.id==='parallel').points);for(let i=0;i<view.edges.length;i++)for(let j=0;j<i;j++)assert.equal(overlap(view.edges[i].labelBox,view.edges[j].labelBox),false);});
test('actual model ports stay on compound boundary with separate provenance and native containment',async()=>{const native={kind:'interconnection',nodes:[{id:'assembly',semanticId:'assembly',width:160,height:76},{id:'device',semanticId:'device',parentId:'assembly',width:160,height:76},{id:'port',semanticId:'real-port',parentId:'device',kind:'port',side:'EAST',label:'Output',width:12,height:12},{id:'external',semanticId:'external',width:160,height:76}],edges:[{id:'wire',source:'port',target:'external',kind:'connection',label:'signal'}]};const view=await layoutDiagram(native,{...options,width:1000,height:700});assert.equal(view.diagnostics.length,0);const byID=Object.fromEntries(view.nodes.map(n=>[n.id,n]));assert.equal(byID.port.parentId,'device');assert.equal(byID.port.semanticId,'real-port');assert.ok(byID.port.portLabelBox);assert.equal(view.edges[0].sourceAnchor.identityStatus,'actual-model-port');assert.equal(view.edges[0].sourceAnchor.semanticId,'real-port');assert.ok(Math.abs(byID.port.x+byID.port.width/2-byID.device.x-byID.device.width)<.01);assert.ok(byID.device.y>=byID.assembly.y+byID.assembly.headerHeight+16);clear(view);});
test('activity parallel branches retain one layer and native succession directions',async()=>{const native={kind:'activity',nodes:['start','fork','left','right','join','end'].map(id=>({id,kind:['fork','join'].includes(id)?id:id==='start'?'initial':id==='end'?'final':'action',semanticId:id})),edges:[['start','fork'],['fork','left'],['fork','right'],['left','join'],['right','join'],['join','end']].map(([source,target],i)=>({id:'edge'+i,source,target,kind:'succession'}))};const view=await layoutDiagram(native,options),byID=Object.fromEntries(view.nodes.map(n=>[n.id,n]));assert.equal(view.diagnostics.length,0);assert.equal(byID.left.y,byID.right.y);assert.ok(byID.fork.y<byID.left.y&&byID.join.y>byID.left.y);clear(view);});

test('layout is deterministic for identical native input and explicit routing measurements',async()=>{const first=await layoutDiagram(fixture(),options),second=await layoutDiagram(fixture(),options);assert.deepEqual(first,second);});
test('an obstructed engine result is reported without drawing an illegal fallback',async()=>{const native={kind:'definition',nodes:['a','middle','b'].map(id=>({id,width:100,height:60})),edges:[{id:'native-edge',source:'a',target:'b',kind:'dependency'}]};const fake={layout:async graph=>({...graph,width:124,height:264,children:graph.children.map((n,i)=>({...n,x:12,y:i*100+12})),edges:graph.edges.map(e=>({...e,sections:[{startPoint:{x:62,y:72},endPoint:{x:62,y:212}}]}))})};const view=await layoutDiagram(native,{elk:fake,width:1000,height:700});assert.equal(view.edges[0].routingBlocked,true);assert.deepEqual(view.edges[0].points,[]);assert.ok(view.diagnostics.some(d=>d.reason==='unroutable-connection'&&d.relationshipId==='native-edge'));assert.equal(view.nodes.length,3);});
test('an unavailable layout engine throws rather than replacing the view with empty geometry',async()=>{await assert.rejects(layoutDiagram(fixture(),{...options,elk:{layout:async()=>{throw Error('worker unavailable');}}}),/worker unavailable/);});

test('native NodeData.Ports and FromPort/ToPort connect modeled pins without inventing semantic identities',async()=>{
 // Lower-camel adapter output of the Go view.NodeData/EdgeData/Port contract.
 const native={id:'InterconnectionView',kind:'interconnection',nodes:[
  {id:'n0',kind:'part',name:'Assembly',semanticId:'api-assembly',width:160,height:76},
  {id:'n1',kind:'part',name:'source',semanticId:'api-source',parent:'n0',width:160,height:76,ports:[{id:'n1.0',name:'output',nameSynthesized:false,type:'~SignalPort',direction:3,parameter:false,origin:{document:'system.sysml',line:4,column:9}}]},
  {id:'n2',kind:'part',name:'sink',semanticId:'api-sink',parent:'n0',width:160,height:76,ports:[{id:'n2.0',name:'input',nameSynthesized:false,type:'SignalPort',direction:3,parameter:false,origin:{document:'system.sysml',line:5,column:9}}]}
 ],edges:[{id:'wire',from:'n1',to:'n2',fromPort:'n1.0',toPort:'n2.0',kind:'connection',label:'signal'}]};
 const before=structuredClone(native),view=await layoutDiagram(native,{...options,width:1000,height:800});
 assert.deepEqual(native,before);assert.equal(view.diagnostics.length,0);assert.equal(view.nodes.length,5);
 const [edge]=view.edges,byID=new Map(view.nodes.map(n=>[n.id,n])),sourcePin=byID.get(edge.sourceAttachment),targetPin=byID.get(edge.targetAttachment);
 assert.equal(edge.source,'n1');assert.equal(edge.target,'n2');assert.equal(edge.fromPort,'n1.0');assert.equal(edge.toPort,'n2.0');
 assert.equal(sourcePin.nativePortId,'n1.0');assert.equal(targetPin.nativePortId,'n2.0');assert.equal(sourcePin.parentId,'n1');assert.equal(targetPin.parentId,'n2');
 assert.equal(sourcePin.semanticId,null);assert.equal(sourcePin.identityStatus,'modeled-pin');assert.equal(edge.sourceAnchor.semanticId,null);assert.equal(edge.sourceAnchor.identityStatus,'modeled-pin');assert.equal(edge.sourceAnchor.nativePortId,'n1.0');
 assert.deepEqual(byID.get('n1').ports,native.nodes[1].ports);assert.deepEqual(byID.get('n2').ports,native.nodes[2].ports);
 assert.deepEqual(sourcePin.nativePort,native.nodes[1].ports[0]);assert.equal(sourcePin.label,'output : ~SignalPort');assert.ok(sourcePin.portLabelBox);assert.ok(targetPin.portLabelBox);clear(view);
});
test('unavailable native embedded port fails explicitly rather than attaching to its owner card',async()=>{
 const native={kind:'interconnection',nodes:[{id:'source',ports:[{id:'output',name:'output',direction:1}]},{id:'sink',ports:[]}],edges:[{id:'wire',source:'source',target:'sink',fromPort:'missing',kind:'flow'}]};
 await assert.rejects(layoutDiagram(native,options),/references unavailable port missing/);
});

test('captured native RenderView interconnection payload attaches connectors to its declared pins',async()=>{
 // Native sysml-native RenderView of Pins::internal, captured from the current
 // pinned engine using connect source.output to sink.input inside part assembly.
 const native={"view":"Pins::internal","kind":"interconnection","stated":"view def InterconnectionView","notices":[],"shown":["port-symbols","compartments","keywords"],"nodes":[{"identityStatus":"mapped","semanticId":"Pins__assembly","qualifiedName":"Pins::assembly","id":"n0","kind":"part","name":"Pins::assembly","type":"","detail":""},{"identityStatus":"mapped","semanticId":"Pins__assembly__source","qualifiedName":"Pins::assembly::source","id":"n1","kind":"part","name":"source","type":"","detail":"","parent":"n0","ports":[{"id":"n1.0","name":"output"}]},{"identityStatus":"mapped","semanticId":"Pins__assembly__sink","qualifiedName":"Pins::assembly::sink","id":"n2","kind":"part","name":"sink","type":"","detail":"","parent":"n0","ports":[{"id":"n2.0","name":"input"}]}],"edges":[{"identityStatus":"mapped","semanticId":"Pins__assembly___402","qualifiedName":"Pins::assembly::@2","from":"n1","to":"n2","fromPort":"n1.0","toPort":"n2.0","label":"","kind":"connection"}]};
 const view=await layoutDiagram(native,{...options,width:1000,height:800}),edge=view.edges[0];
 assert.equal(view.diagnostics.length,0);assert.equal(edge.source,'n1');assert.equal(edge.target,'n2');assert.equal(edge.fromPort,'n1.0');assert.equal(edge.toPort,'n2.0');
 assert.equal(view.nodes.find(n=>n.id===edge.sourceAttachment).nativePortId,'n1.0');assert.equal(view.nodes.find(n=>n.id===edge.targetAttachment).nativePortId,'n2.0');
 assert.equal(edge.semanticId,'Pins__assembly___402');assert.equal(edge.sourceAnchor.identityStatus,'modeled-pin');assert.equal(edge.targetAnchor.identityStatus,'modeled-pin');clear(view);
});

test('requirement decision chain places satisfying parts and verification cases below requirements while retaining native arrows',async()=>{
 const native={kind:'requirement',nodes:[{id:'goal',kind:'requirement'},{id:'detail',kind:'requirement'},{id:'hardware',kind:'part'},{id:'case',kind:'verification'}],edges:[{id:'derivation',source:'detail',target:'goal',kind:'derive',label:'derive'},{id:'satisfaction',source:'hardware',target:'detail',kind:'satisfy',label:'satisfy'},{id:'verification',source:'case',target:'detail',kind:'verify',label:'verify'}]};
 const view=await layoutDiagram(native,{...options,width:900,height:700}),byID=new Map(view.nodes.map(n=>[n.id,n]));clear(view);assert.equal(view.diagnostics.length,0);
 assert.ok(byID.get('goal').y+byID.get('goal').height<byID.get('detail').y);
 for(const id of ['hardware','case'])assert.ok(byID.get('detail').y+byID.get('detail').height<byID.get(id).y,id+' should read downstream of the requirement');
 for(const original of native.edges){const edge=view.edges.find(e=>e.id===original.id);assert.equal(edge.source,original.source);assert.equal(edge.target,original.target);assert.ok(edge.points[0].y>edge.points.at(-1).y,'native relationship arrows still point upward');}
});

// Captured native RenderView at engine 19eaec64755f, model source b12b07985500.
// These identities/directions come from Go, not names inferred by the renderer.
const blueDogTrafficDerivation={"view":"BlueDogCanvasViews::trafficDerivation","kind":"requirement","stated":"view def GeneralView, filter @RequirementUsage","notices":[],"shown":["port-symbols","compartments","keywords"],"nodes":[{"identityStatus":"mapped","semanticId":"BlueDogRequirements__trafficSafety","qualifiedName":"BlueDogRequirements::trafficSafety","id":"n0","kind":"requirement","name":"BlueDogRequirements::trafficSafety","type":"","detail":""},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__trafficTracking","qualifiedName":"BlueDogRequirements::trafficTracking","id":"n1","kind":"requirement","name":"BlueDogRequirements::trafficTracking","type":"","detail":""},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__collisionAssessmentCadence","qualifiedName":"BlueDogRequirements::collisionAssessmentCadence","id":"n2","kind":"requirement","name":"BlueDogRequirements::collisionAssessmentCadence","type":"","detail":""},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__avoidanceCommandDeadline","qualifiedName":"BlueDogRequirements::avoidanceCommandDeadline","id":"n3","kind":"requirement","name":"BlueDogRequirements::avoidanceCommandDeadline","type":"","detail":""},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__trafficAwarenessFault","qualifiedName":"BlueDogRequirements::trafficAwarenessFault","id":"n4","kind":"requirement","name":"BlueDogRequirements::trafficAwarenessFault","type":"","detail":""}],"edges":[{"identityStatus":"mapped","semanticId":"BlueDogRequirements__decomposeTrafficTracking","qualifiedName":"BlueDogRequirements::decomposeTrafficTracking","from":"n1","to":"n0","label":"derive","kind":"derive"},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__decomposeCollisionAssessmentCadence","qualifiedName":"BlueDogRequirements::decomposeCollisionAssessmentCadence","from":"n2","to":"n0","label":"derive","kind":"derive"},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__decomposeAvoidanceCommandDeadline","qualifiedName":"BlueDogRequirements::decomposeAvoidanceCommandDeadline","from":"n3","to":"n0","label":"derive","kind":"derive"},{"identityStatus":"mapped","semanticId":"BlueDogRequirements__decomposeTrafficAwarenessFault","qualifiedName":"BlueDogRequirements::decomposeTrafficAwarenessFault","from":"n4","to":"n0","label":"derive","kind":"derive"}]};
test('native Blue Dog phone derivations take short distinct paths on their own side of staggered siblings',async()=>{
 const native=structuredClone(blueDogTrafficDerivation);
 for(const node of native.nodes){node.width=160;node.height=node.id==='n2'?100:76;}
 const view=await layoutDiagram(native,{...options,width:350,height:440}),byID=new Map(view.nodes.map(n=>[n.id,n]));
 assert.equal(view.diagnostics.length,0);clear(view);assert.ok(view.layoutFitScale>.85,'avoid paying for detours by shrinking readable cards');
 assert.equal(view.nodes.filter(n=>n.id!=='n0').reduce((rows,n)=>rows.add(n.y),new Set()).size,2);
 assert.ok(view.layoutMetrics.bends<=8,'four independent derivations need no more than two bends each');
 assert.equal(view.layoutMetrics.crossings,0);
 for(const edge of view.edges){
  assert.equal(edge.target,'n0');assert.ok(edge.labelBox);assert.ok(edge.points.length<=4,'avoid staircase paths through label layers');
  const start=edge.points[0],end=edge.points.at(-1),length=edge.points.slice(1).reduce((sum,p,i)=>sum+Math.abs(p.x-edge.points[i].x)+Math.abs(p.y-edge.points[i].y),0),direct=Math.abs(start.x-end.x)+Math.abs(start.y-end.y);
  assert.ok(length/direct<=1.15,'path should remain close to its fixed-terminal Manhattan lower bound');
  const original=native.edges.find(e=>e.semanticId===edge.semanticId);assert.equal(edge.source,original.from);assert.equal(edge.target,original.to);
  assert.ok(byID.get(edge.source).y>byID.get(edge.target).y,'general requirement stays above its four specifics');
 }
 for(let i=0;i<view.edges.length;i++)for(let j=0;j<i;j++){
  const a=view.edges[i].points,b=view.edges[j].points;
  for(let ai=1;ai<a.length;ai++)for(let bi=1;bi<b.length;bi++){
   const aa=a[ai-1],ab=a[ai],ba=b[bi-1],bb=b[bi];
   if(aa.x===ab.x&&ba.x===bb.x&&aa.x===ba.x)assert.ok(Math.min(Math.max(aa.y,ab.y),Math.max(ba.y,bb.y))-Math.max(Math.min(aa.y,ab.y),Math.min(ba.y,bb.y))<=.01,'distinct derivations cannot share a vertical bus');
   if(aa.y===ab.y&&ba.y===bb.y&&aa.y===ba.y)assert.ok(Math.min(Math.max(aa.x,ab.x),Math.max(ba.x,bb.x))-Math.max(Math.min(aa.x,ab.x),Math.min(ba.x,bb.x))<=.01,'distinct derivations cannot share a horizontal bus');
  }
 }
});

test('native Blue Dog wide fanout centers the general requirement above its specifics',async()=>{
 const native=structuredClone(blueDogTrafficDerivation);
 for(const node of native.nodes){node.width=160;node.height=node.id==='n2'?100:76;}
 const view=await layoutDiagram(native,{...options,width:1000,height:390}),root=view.nodes.find(n=>n.id==='n0'),children=view.nodes.filter(n=>n.id!=='n0');
 assert.equal(view.diagnostics.length,0);clear(view);assert.equal(new Set(children.map(n=>n.y)).size,1);
 const center=(Math.min(...children.map(n=>n.x))+Math.max(...children.map(n=>n.x+n.width)))/2;
 assert.ok(Math.abs(root.x+root.width/2-center)<=1,'general requirement centered above the full decision chain');
 assert.ok(view.layoutMetrics.pathLength<1100,'avoid long horizontal sweeps from a root above the first child');
 assert.equal(view.layoutMetrics.crossings,0);assert.ok(view.layoutFitScale>=.99);
 for(const edge of view.edges){assert.equal(edge.target,'n0');assert.ok(edge.points.length<=4);assert.ok(edge.labelBox);}
});
