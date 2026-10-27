import test from 'node:test';
import assert from 'node:assert/strict';
import {createPresentationLayouts,loadPresentationLayouts,savePresentationLayouts,PRESENTATION_LAYOUT_SCHEMA,PRESENTATION_LAYOUT_FILE} from '../src/canvas-prototype/presentation-layout.mjs';
import {sequenceLayout,SEQUENCE_LAYOUT_SCHEMA} from '../src/canvas-prototype/sequence-view.mjs';
import {gridLayoutWidths,GRID_LAYOUT_SCHEMA} from '../src/canvas-prototype/grid-view.mjs';
import {normalizeProject,packProject,unpackProject,fileText,documentsFor} from '../src/canvas-prototype/project.mjs';

const sequence=()=>({id:'Views::sequence',kind:'sequence',nodes:[
 {id:'n0',semanticId:'native-panel',kind:'part',name:'panel'},
 {id:'n1',semanticId:'native-control',kind:'part',name:'control'},
],edges:[{id:'message',semanticId:'native-message',kind:'flow',from:'n0',to:'n1',label:'[enabled] request'}]});
const sequenceSettings=()=>({schemaVersion:SEQUENCE_LAYOUT_SCHEMA,lanes:[
 {semanticId:'native-panel',representationId:'n0',width:440},
 {semanticId:'native-control',representationId:'n1',width:300},
],messageGap:160});
const matrix=()=>({id:'Views::matrix',kind:'matrix',columns:['Requirement','Case A','Case B'],columnElements:[
 {index:1,semanticId:'native-case-a'},{index:2,semanticId:'native-case-b'},
],rows:[{semanticId:'native-req',cells:['Requirement','verify','verify']}],relationshipCells:[
 {row:0,column:1,relationships:[{semanticId:'native-link-a',kind:'verify',sourceSemanticId:'native-case-a',targetSemanticId:'native-req'}]},
 {row:0,column:2,relationships:[{semanticId:'native-link-b',kind:'verify',sourceSemanticId:'native-case-b',targetSemanticId:'native-req'}]},
]});
const gridSettings=()=>({schemaVersion:GRID_LAYOUT_SCHEMA,columns:[
 {semanticId:null,index:0,heading:'Requirement',width:260},
 {semanticId:'native-case-a',index:1,heading:'Case A',width:380},
 {semanticId:'native-case-b',index:2,heading:'Case B',width:460},
]});
const table=()=>({...matrix(),id:'Views::records',kind:'table'});
const project=()=>normalizeProject({files:{'model.sysml':'package Example { part panel; part control; }','story.md':''}});
const snapshot=regions=>({schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[],regions});
const sequenceRecord=()=>({viewId:'Views::sequence',viewKind:'sequence',layout:sequenceSettings()});
const gridRecord=()=>({viewId:'Views::matrix',viewKind:'matrix',layout:gridSettings()});

test('sequence, matrix and table regions JSON-roundtrip without retaining mutable callers or runtime state',()=>{
 const seq=sequence(),grid=matrix(),records=table(),before=structuredClone([seq,grid,records]),store=createPresentationLayouts();
 const settings=sequenceSettings();store.setRegion(seq,settings).setRegion(grid,gridSettings()).setRegion(records,gridSettings());settings.lanes[0].width=800;
 assert.equal(store.getRegion(seq).lanes[0].width,440);
 const stable=store.snapshot(),roundtrip=createPresentationLayouts(JSON.parse(JSON.stringify(stable)));
 assert.deepEqual(roundtrip.snapshot(),stable);assert.deepEqual(stable.views,[]);assert.equal(stable.regions.length,3);
 const returned=roundtrip.getRegion(seq);returned.lanes[0].width=880;assert.equal(roundtrip.getRegion(seq).lanes[0].width,440);
 const exported=roundtrip.snapshot();exported.regions.find(record=>record.viewKind==='matrix').layout.columns[0].width=800;assert.deepEqual(roundtrip.snapshot(),stable);
 assert.deepEqual([seq,grid,records],before);assert.doesNotMatch(JSON.stringify(stable),/modelHash|selectedId|scrollTop|relationshipCells|evaluatedValue|credentials/);
 const laidOut=sequenceLayout(seq,{layout:roundtrip.getRegion(seq)});
 assert.equal(laidOut.nodes[0].laneWidth,440);assert.deepEqual(laidOut.edges.map(edge=>edge.semanticId),['native-message']);assert.equal(laidOut.edges[0].label,'[enabled] request');
 assert.deepEqual({...gridLayoutWidths(grid,roundtrip.getRegion(grid)).widths},{0:260,1:380,2:460});
});

test('region layouts survive real project ZIP export/import while semantic model source bytes remain unchanged',()=>{
 const source=project(),before=structuredClone(source),store=createPresentationLayouts().setRegion(sequence(),sequenceSettings()).setRegion(matrix(),gridSettings());
 const candidate=savePresentationLayouts(source,store),again=savePresentationLayouts(candidate,store),imported=unpackProject(packProject(again)),loaded=loadPresentationLayouts(imported);
 assert.deepEqual(loaded.snapshot(),store.snapshot());assert.deepEqual(source,before);
 assert.equal(fileText(imported,'model.sysml'),fileText(source,'model.sysml'));assert.deepEqual(documentsFor(imported),documentsFor(source));
 assert.equal(imported.manifest.assets.filter(name=>name===PRESENTATION_LAYOUT_FILE).length,1);
 assert.equal(JSON.parse(fileText(imported,PRESENTATION_LAYOUT_FILE)).regions.length,2);
 const bytes=Uint8Array.from(new TextEncoder().encode(fileText(imported,PRESENTATION_LAYOUT_FILE)));
 assert.deepEqual(loadPresentationLayouts({...imported,files:{...imported.files,[PRESENTATION_LAYOUT_FILE]:bytes}}).snapshot(),store.snapshot());
});

test('sequence capture aliases rebind only unique native identities to fresh representation IDs',()=>{
 const source=sequence(),store=createPresentationLayouts().setRegion(source,sequenceSettings()),original=store.snapshot();
 const target={...structuredClone(source),id:'Captured::sequence',nodes:source.nodes.map(node=>({...node,id:'captured-'+node.id,name:'renamed display'}))};
 const result=store.alias(source,target);
 assert.deepEqual(result,{retained:2,omissions:[],settingsRetained:true});
 assert.deepEqual(store.getRegion(target).lanes.map(lane=>[lane.semanticId,lane.representationId,lane.width]),[['native-panel','captured-n0',440],['native-control','captured-n1',300]]);
 assert.equal(store.getRegion(target).messageGap,160);assert.deepEqual(store.getRegion(source),original.regions[0].layout);
 const missing={...structuredClone(target),id:'Captured::missing',nodes:target.nodes.filter(node=>node.semanticId!=='native-panel')},partial=store.alias(source,missing);
 assert.equal(partial.retained,1);assert.equal(partial.omissions[0].target,'native-panel');assert.equal(partial.omissions[0].reason,'region-layout-ambiguous-capture');assert.equal(store.getRegion(missing).messageGap,160);
 const ambiguous={...structuredClone(target),id:'Captured::duplicate',nodes:[...target.nodes,{...target.nodes[0],id:'another-panel'}]},duplicate=store.alias(source,ambiguous);
 assert.equal(duplicate.retained,1);assert.equal(duplicate.omissions[0].target,'native-panel');
 const unrelated={...structuredClone(target),id:'Captured::same-labels',nodes:target.nodes.map(node=>({...node,semanticId:'other-'+node.semanticId}))},unmatched=store.alias(source,unrelated);
 assert.equal(unmatched.retained,0);assert.equal(unmatched.omissions.length,2);assert.deepEqual(store.getRegion(unrelated).lanes,[]);
});

test('matrix capture preserves native axis identities across renamed/reordered columns without reversing relationships',()=>{
 const source=matrix(),before=structuredClone(source),store=createPresentationLayouts().setRegion(source,gridSettings());
 const target={...structuredClone(source),id:'Captured::matrix',columns:['Requirement','New case B caption','New case A caption'],columnElements:[{index:1,semanticId:'native-case-b'},{index:2,semanticId:'native-case-a'}],relationshipCells:[{...structuredClone(source.relationshipCells[1]),column:1},{...structuredClone(source.relationshipCells[0]),column:2}]},targetBefore=structuredClone(target);
 assert.deepEqual(store.alias(source,target),{retained:3,omissions:[]});
 const restored=gridLayoutWidths(target,store.getRegion(target));assert.deepEqual({...restored.widths},{0:260,1:460,2:380});assert.deepEqual(restored.notices,[]);
 assert.deepEqual(target,targetBefore);assert.deepEqual(target.relationshipCells.map(cell=>[cell.relationships[0].sourceSemanticId,cell.relationships[0].targetSemanticId]),[['native-case-b','native-req'],['native-case-a','native-req']]);assert.deepEqual(source,before);
 const changedHeading={...target,columns:['Different identity-less display column',...target.columns.slice(1)]},guarded=gridLayoutWidths(changedHeading,store.getRegion(target));
 assert.equal(guarded.widths[0],undefined);assert.equal(guarded.widths[1],460);assert.equal(guarded.notices[0].reason,'grid-layout-missing-column');
 const missing={...target,columnElements:[{index:1,semanticId:'unrelated'},{index:2,semanticId:'native-case-a'}]},unmatched=gridLayoutWidths(missing,store.getRegion(target));
 assert.equal(unmatched.widths[1],undefined);assert.equal(unmatched.widths[2],380);assert.equal(unmatched.notices[0].semanticId,'native-case-b');
});

test('region alias rejects changed native view kinds and missing source records without altering state',()=>{
 const source=sequence(),store=createPresentationLayouts().setRegion(source,sequenceSettings()),before=store.snapshot(),target={...matrix(),id:'Captured::wrong-kind'};
 assert.deepEqual(store.alias(source,target),{retained:0,omissions:[{reason:'region-layout-kind-changed',message:'Native region kind changed; settings were not aliased.'}]});
 assert.equal(store.getRegion(target),undefined);assert.deepEqual(store.snapshot(),before);
 assert.deepEqual(store.alias({...source,id:'Unstored::sequence'},{...source,id:'Captured::empty'}),{retained:0,omissions:[]});assert.deepEqual(store.snapshot(),before);
});

test('malformed region imports are rejected atomically and cannot insert semantic or navigation payloads',()=>{
 const store=createPresentationLayouts().setRegion(sequence(),sequenceSettings()),before=store.snapshot();
 const invalid=[
  {...snapshot([]),regions:{}},
  snapshot([sequenceRecord(),sequenceRecord()]),
  snapshot([{...sequenceRecord(),layout:undefined}]),
  snapshot([{...sequenceRecord(),layout:null}]),
  snapshot([{...sequenceRecord(),viewKind:'action'}]),
  snapshot([{...sequenceRecord(),viewId:''}]),
  snapshot([{...sequenceRecord(),modelHash:'stale'}]),
  snapshot([{...sequenceRecord(),layout:{...sequenceSettings(),selectedId:'native-panel'}}]),
  snapshot([{...sequenceRecord(),layout:{...sequenceSettings(),messageGap:NaN}}]),
  snapshot([{...sequenceRecord(),layout:{...sequenceSettings(),lanes:[{semanticId:'native-panel',representationId:'n0',width:Infinity}]}}]),
  snapshot([{...sequenceRecord(),layout:{...sequenceSettings(),lanes:[{semanticId:'',representationId:'n0',width:440}]}}]),
  snapshot([{...sequenceRecord(),layout:{...sequenceSettings(),lanes:[sequenceSettings().lanes[0],sequenceSettings().lanes[0]]}}]),
  snapshot([{...gridRecord(),layout:{...gridSettings(),columns:[{semanticId:null,index:-1,heading:'x',width:200}]}}]),
  snapshot([{...gridRecord(),layout:{...gridSettings(),columns:[{semanticId:42,index:0,heading:'x',width:200}]}}]),
  snapshot([{...gridRecord(),layout:{...gridSettings(),columns:[{semanticId:null,index:0,heading:'x',width:Infinity}]}}]),
  snapshot([{...gridRecord(),layout:{...gridSettings(),columns:[gridSettings().columns[0],gridSettings().columns[0]]}}]),
 ];
 for(const [index,value]of invalid.entries()){assert.throws(()=>store.fromSnapshot(value),undefined,'invalid case '+index);assert.deepEqual(store.snapshot(),before,'invalid case '+index+' is atomic');}
});

test('explicit null region payload is malformed; omitted regions retain legacy snapshot compatibility',()=>{
 assert.throws(()=>createPresentationLayouts(snapshot(null)),/Invalid.*region/i);
 const legacy={schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[]},empty=createPresentationLayouts(legacy);
 assert.deepEqual(empty.snapshot(),legacy);assert.equal(empty.getRegion(sequence()),undefined);
 const graphRecord={viewId:'Views::structure',viewKind:'definition',placements:[{semanticId:'native-part',representationId:'drawing-part',parentSemanticId:null,parentRepresentationId:null,offset:{x:0.1,y:0.2}}]},old={schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[graphRecord]};
 const loaded=createPresentationLayouts(old);assert.deepEqual(loaded.snapshot(),old);assert.equal(loaded.has({id:'Views::structure',kind:'definition'}),true);assert.equal(loaded.has(sequence()),false);
 loaded.setRegion(sequence(),sequenceSettings());assert.deepEqual(loaded.snapshot().views,[graphRecord]);loaded.setRegion(sequence(),undefined);assert.deepEqual(loaded.snapshot(),old);
});

test('history snapshots, clones, resets and per-kind keys isolate portable region settings',()=>{
 const seq=sequence(),grid=matrix(),sameIdMatrix={...grid,id:seq.id},store=createPresentationLayouts().setRegion(seq,sequenceSettings()).setRegion(sameIdMatrix,gridSettings()),initial=store.snapshot(),copy=store.clone();
 copy.setRegion(seq,{...sequenceSettings(),messageGap:220});assert.equal(store.getRegion(seq).messageGap,160);assert.equal(copy.getRegion(seq).messageGap,220);
 const changed=copy.snapshot();copy.clear(seq);assert.equal(copy.has(seq),false);assert.equal(copy.has(sameIdMatrix),true);assert.equal(copy.getRegion(seq),undefined);
 copy.fromSnapshot(changed);assert.equal(copy.getRegion(seq).messageGap,220);copy.fromSnapshot(initial);assert.equal(copy.getRegion(seq).messageGap,160);
 assert.equal(store.has({...seq,modelHash:'new-model-version'}),true);store.clear();assert.deepEqual(store.snapshot(),{schemaVersion:PRESENTATION_LAYOUT_SCHEMA,views:[]});
 assert.equal(copy.has(seq),true);assert.equal(copy.has(sameIdMatrix),true);
});
