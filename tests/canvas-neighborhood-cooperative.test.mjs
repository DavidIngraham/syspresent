import test from 'node:test';
import assert from 'node:assert/strict';
import {surroundingContext} from '../src/canvas-prototype/context.mjs';
import {prepareNeighborhood,prepareNeighborhoodAsync} from '../src/canvas-prototype/neighborhood.mjs';

const area={x:0,y:0,width:390,height:410};
function fixture(count=8){
 const elements=[{id:'parent',kind:'PartDefinition',name:'Parent'},...Array.from({length:count},(_,i)=>({id:'c'+i,kind:'PartUsage',name:'Child '+i}))];
 const relationships=elements.slice(1).map(n=>({id:'native:'+n.id,source:'parent',target:n.id,kind:'composition',label:'composition'}));
 relationships.push({id:'native:peer',source:'c0',target:'c1',kind:'dependency',label:'dependency'});
 const active=[{id:'P',semanticId:'parent',name:'Parent',x:115,y:60,width:160,height:95}];
 const context=surroundingContext({elements,relationships},{id:'native:view',nodes:active,edges:[]});
 const activeEdges=[{id:'native:active',points:[{x:20,y:210},{x:360,y:210}],labelBox:{x:170,y:216,width:60,height:18}}];
 return {context,active,options:{activeEdges,obstacles:[{x:0,y:300,width:390,height:160}],labelObstacles:[activeEdges[0].labelBox],measureLabel:text=>({width:text.length*6.5+4,height:14})}};
}

test('cooperative scheduling keeps exact synchronous native geometry, paths, labels and omissions',async()=>{
 const {context,active,options}=fixture(),before=structuredClone({context,active}),expected=prepareNeighborhood(context,active,area,options);
 let yielded=0,time=0;
 const result=await prepareNeighborhoodAsync(context,active,area,{...options,budgetMs:3,clock:()=>time++,yieldControl:async()=>{yielded++;}});
 assert.deepEqual(result,expected);
 assert.deepEqual({context,active},before);
 assert.ok(yielded>context.view.edges.length,'candidate batches yield throughout placement and route improvement');
 assert.deepEqual(result.edges.map(e=>[e.id,e.source,e.target,e.kind]),expected.edges.map(e=>[e.id,e.source,e.target,e.kind]));
});

test('a short neighborhood does not yield before its measured work budget expires',async()=>{
 const {context,active,options}=fixture(2);let yielded=0;
 const result=await prepareNeighborhoodAsync(context,active,area,{...options,clock:()=>0,yieldControl:async()=>{yielded++;}});
 assert.deepEqual(result,prepareNeighborhood(context,active,area,options));
 assert.equal(yielded,0);
});

test('superseded cooperative layout stops before subsequent geometry callbacks and leaves sources unchanged',async()=>{
 const {context,active,options}=fixture(),before=structuredClone({context,active});let current=true,yielded=0,measurements=0;
 await assert.rejects(prepareNeighborhoodAsync(context,active,area,{...options,budgetMs:0,isCurrent:()=>current,measureLabel:()=>{measurements++;return {width:40,height:14};},yieldControl:async()=>{yielded++;current=false;}}),error=>error.name==='AbortError'&&error.code==='LAYOUT_CANCELED');
 assert.equal(yielded,1);assert.equal(measurements,0);
 assert.deepEqual({context,active},before);
 await assert.rejects(prepareNeighborhoodAsync(context,active,area,{...options,isCurrent:()=>false}),error=>error.code==='LAYOUT_CANCELED');
});

test('a scheduling failure is surfaced without returning a partial neighborhood',async()=>{
 const {context,active,options}=fixture(),before=structuredClone({context,active}),failure=Error('scheduler unavailable');
 await assert.rejects(prepareNeighborhoodAsync(context,active,area,{...options,budgetMs:0,yieldControl:async()=>{throw failure;}}),error=>error===failure);
 assert.deepEqual({context,active},before);
});

test('default cooperative yielding admits queued tasks rather than only promise microtasks',async()=>{
 const {context,active,options}=fixture(2);let tasks=0;
 const interval=setInterval(()=>tasks++,0);
 try{await prepareNeighborhoodAsync(context,active,area,{...options,budgetMs:0});}
 finally{clearInterval(interval);}
 assert.ok(tasks>0,'paint/input task opportunities must occur between batches');
});

test('invalid cooperative budgets and callbacks fail explicitly',async()=>{
 const {context,active}=fixture(2);
 for(const options of [{budgetMs:-1},{budgetMs:Infinity},{yieldControl:null},{isCurrent:false},{clock:null}]){
  await assert.rejects(prepareNeighborhoodAsync(context,active,area,options),TypeError);
 }
});
