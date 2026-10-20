import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {mountGrid, gridRowOrder} from '../src/canvas-prototype/grid-view.mjs';

const nativeMatrix = () => ({
  id:'matrix',kind:'matrix',title:'Coverage',columns:['Requirement','Verification case','Unresolved case'],
  rows:[
    {semanticId:'req-1',cells:['First requirement','verify','']},
    {semanticId:'req-2',cells:['Second requirement','','legacy verify']},
    {cells:['Unknown row','','']},
  ],
  columnElements:[{index:1,semanticId:'case-1'}],
  relationshipCells:[{row:0,column:1,relationships:[
    {semanticId:'link-1',sourceSemanticId:'case-1',targetSemanticId:'req-1',kind:'verify',label:'A'},
    {semanticId:'link-2',sourceSemanticId:'case-1',targetSemanticId:'req-1',kind:'verify',label:'B'},
  ]}],
});
function setup(view, options={}) {
  const dom=new JSDOM('<main id="host"></main>');
  const host=dom.window.document.querySelector('main');
  const mounted=mountGrid(host,view,options);
  return {dom,host,mounted,scroll:host.querySelector('.canvas-grid-scroll')};
}
const cell = (host,row,column) => host.querySelector(`button[data-grid-row="${row}"][data-grid-column="${column}"]`);
const rowButton = (host,row) => host.querySelector(`button[data-grid-kind="row"][data-grid-row="${row}"]`);
test('matrix selection exposes all native relationships without exploring, moving, or mutating source data', () => {
  const view=nativeMatrix(),before=structuredClone(view),selected=[],explored=[];
  const {host,mounted,scroll}=setup(view,{onSelect:value=>selected.push(value),onExplore:value=>explored.push(value)});
  scroll.scrollTop=123; scroll.scrollLeft=87;
  cell(host,0,1).click();
  assert.equal(selected.length,1);
  assert.deepEqual(selected[0].relationships.map(item=>item.semanticId),['link-1','link-2']);
  assert.equal(selected[0].relationships[0].sourceSemanticId,'case-1');
  assert.equal(explored.length,0);
  assert.equal(scroll.scrollTop,123); assert.equal(scroll.scrollLeft,87);
  assert.equal(host.querySelectorAll('.canvas-grid-inspector li').length,2);
  assert.match(host.querySelector('.canvas-grid-inspector').textContent,/case-1 → req-1/);
  assert.equal(cell(host,0,1).getAttribute('aria-pressed'),'true');
  assert.ok(rowButton(host,0).classList.contains('is-axis-highlight'));
  host.querySelector('.canvas-grid-explore').click();
  assert.deepEqual(explored[0].relationships.map(item=>item.semanticId),['link-1','link-2']);
  selected[0].relationships[0].kind='changed externally';
  assert.deepEqual(view,before);
  assert.equal(mounted.getState().selection.relationships[0].kind,'verify');
});
test('empty cells describe scoped absence, while old populated cells disclose unavailable provenance', () => {
  const {host}=setup(nativeMatrix());
  cell(host,0,2).click();
  assert.match(host.querySelector('.canvas-grid-inspector').textContent,/No matching relationship in this view\./);
  assert.equal(host.querySelector('.canvas-grid-explore'),null);
  cell(host,1,2).click();
  assert.match(host.querySelector('.canvas-grid-inspector').textContent,/provenance is unavailable/);
  assert.doesNotMatch(host.querySelector('.canvas-grid-inspector').textContent,/No matching relationship/);
  rowButton(host,2).click();
  assert.match(host.querySelector('.canvas-grid-inspector').textContent,/semantic identity unavailable/);
  assert.equal(host.querySelector('.canvas-grid-explore'),null);
});
test('external semantic selection highlights every occurrence without changing selection callback, scroll or native order', () => {
  let selected=0;
  const {host,mounted,scroll}=setup(nativeMatrix(),{onSelect:()=>selected++});
  scroll.scrollTop=20;
  mounted.select('link-2');
  assert.equal(cell(host,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(selected,0); assert.equal(scroll.scrollTop,20);
  mounted.select('elsewhere');
  assert.match(host.querySelector('.canvas-grid-disclosure').textContent,/not represented.*selection is retained/);
  assert.equal(mounted.reveal('elsewhere'),false);
  assert.equal(mounted.reveal('req-1'),true);
  assert.deepEqual([...host.querySelectorAll('tbody tr')].map(row=>row.dataset.nativeRow),['0','1','2']);
});
test('table sorting is explicit and stable; restoring history retains sort, original row selection, widths and scroll', () => {
  const view={kind:'table',columns:['Name','Value'],rows:[
    {semanticId:'r-z',cells:['Zulu','3']},{semanticId:'r-a',cells:['Alpha','2']},{semanticId:'r-a2',cells:['Alpha','1']},
  ]},before=structuredClone(view),changes=[];
  const {host,dom,mounted,scroll}=setup(view,{onStateChange:state=>changes.push(state)});
  rowButton(host,0).click();
  host.querySelector('.canvas-grid-sort').click();
  assert.deepEqual([...host.querySelectorAll('tbody tr')].map(row=>row.dataset.nativeRow),['1','2','0']);
  assert.equal(rowButton(host,0).getAttribute('aria-pressed'),'true');
  assert.equal(host.querySelector('thead th').getAttribute('aria-sort'),'ascending');
  const width=host.querySelector('input'); width.value='320'; width.dispatchEvent(new dom.window.Event('change'));
  assert.equal(host.querySelector('col').style.width,'320px');
  scroll.scrollTop=230; scroll.scrollLeft=90; scroll.dispatchEvent(new dom.window.Event('scroll'));
  const state=mounted.getState();
  const restored=setup(view,{state});
  assert.equal(restored.scroll.scrollTop,230); assert.equal(restored.scroll.scrollLeft,90);
  assert.equal(restored.host.querySelector('col').style.width,'320px');
  assert.deepEqual([...restored.host.querySelectorAll('tbody tr')].map(row=>row.dataset.nativeRow),['1','2','0']);
  assert.equal(rowButton(restored.host,0).getAttribute('aria-pressed'),'true');
  assert.equal(restored.mounted.getState().selection.semanticId,'r-z');
  assert.ok(changes.length>=4);
  assert.deepEqual(view,before);
  state.widths[0]=900;
  assert.equal(mounted.getState().widths[0],320);
  assert.deepEqual(gridRowOrder(view,{column:1,direction:'ascending'}),[2,1,0]);
});
test('matrices retain native axes, treat all native text as text, and contain graph gestures', () => {
  const view=nativeMatrix(); view.rows[0].cells[0]='<img src=x onerror=alert(1)>'; view.columns[1]='<script>bad()</script>';
  const {host,dom,mounted,scroll}=setup(view,{state:{sort:{column:0,direction:'descending'}}});
  assert.equal(host.querySelectorAll('img,script').length,0);
  assert.match(host.textContent,/<img src=x/);
  assert.equal(host.querySelector('.canvas-grid-sort'),null);
  assert.equal(mounted.getState().sort,null);
  let outerWheel=0; host.addEventListener('wheel',()=>outerWheel++);
  scroll.dispatchEvent(new dom.window.Event('wheel',{bubbles:true}));
  assert.equal(outerWheel,0);
  assert.equal(host.querySelectorAll('thead th[scope="col"]').length,3);
  assert.equal(host.querySelectorAll('tbody th[scope="row"]').length,3);
  mounted.destroy(); mounted.destroy();
  assert.equal(host.children.length,0);
});
test('transition anchors include only visible actual representations and preserve duplicates', () => {
  const {host,mounted,scroll}=setup(nativeMatrix());
  host.getBoundingClientRect=()=>({left:100,top:50,right:300,bottom:200,width:200,height:150});
  scroll.getBoundingClientRect=()=>({left:100,top:80,right:300,bottom:180,width:200,height:100});
  cell(host,0,1).getBoundingClientRect=()=>({left:110,top:100,right:190,bottom:140,width:80,height:40});
  rowButton(host,1).getBoundingClientRect=()=>({left:100,top:280,right:200,bottom:320,width:100,height:40});
  const anchors=mounted.anchors();
  assert.deepEqual(anchors.map(anchor=>anchor.semanticId),['link-1','link-2']);
  assert.equal(anchors[0].x,10); assert.equal(anchors[0].y,50);
  assert.equal(anchors[0].width,80); assert.equal(anchors[0].height,40);
  assert.notEqual(anchors[0].representationId,anchors[1].representationId);
});
test('external multi-relationship selection highlights every cell occurrence without moving or editing the grid', () => {
  const view=nativeMatrix();
  view.relationshipCells.push({row:1,column:1,relationships:[
    {semanticId:'link-3',sourceSemanticId:'case-1',targetSemanticId:'req-2',kind:'verify',label:'Third'},
  ]});
  const before=structuredClone(view),callbacks=[];
  const {host,mounted,scroll}=setup(view,{onSelect:value=>callbacks.push(value)});
  scroll.scrollTop=120;scroll.scrollLeft=45;
  mounted.selectMany(['link-2','link-3','link-2']);
  assert.equal(cell(host,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(cell(host,1,1).getAttribute('aria-pressed'),'true');
  assert.equal(scroll.scrollTop,120);assert.equal(scroll.scrollLeft,45);
  assert.equal(callbacks.length,0);
  assert.deepEqual(mounted.getState().selectedIds,['link-2','link-3']);
  assert.equal(mounted.getState().selectedId,null);
  assert.equal(mounted.getState().selection,null);
  const restored=setup(view,{state:mounted.getState()});
  assert.equal(cell(restored.host,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(cell(restored.host,1,1).getAttribute('aria-pressed'),'true');
  mounted.select('link-2');
  assert.equal(cell(host,0,1).getAttribute('aria-pressed'),'true');
  assert.equal(cell(host,1,1).getAttribute('aria-pressed'),'false');
  mounted.select(null);
  assert.equal(cell(host,0,1).getAttribute('aria-pressed'),'false');
  assert.deepEqual(view,before);
});
test('remount reconciles stale saved cell positions with explicit shared identities but preserves matching Back state', () => {
  const view=nativeMatrix(),first=setup(view);
  rowButton(first.host,0).click();
  first.scroll.scrollTop=70;first.scroll.scrollLeft=45;
  const saved=first.mounted.getState();
  assert.equal(saved.selection.semanticId,'req-1');
  const changed=setup(view,{state:saved,selectedIds:['req-2']});
  assert.equal(rowButton(changed.host,0).getAttribute('aria-pressed'),'false');
  assert.equal(rowButton(changed.host,1).getAttribute('aria-pressed'),'true');
  assert.equal(changed.mounted.getState().selection,null);
  assert.equal(changed.mounted.getState().selectedId,'req-2');
  assert.doesNotMatch(changed.host.querySelector('.canvas-grid-inspector').textContent,/First requirement/);
  assert.equal(changed.scroll.scrollTop,70);assert.equal(changed.scroll.scrollLeft,45);
  const back=setup(view,{state:saved,selectedIds:['req-1']});
  assert.deepEqual(back.mounted.getState().selection,saved.selection);
  assert.equal(rowButton(back.host,0).getAttribute('aria-pressed'),'true');
  assert.match(back.host.querySelector('.canvas-grid-inspector').textContent,/First requirement/);
  cell(first.host,0,1).click();
  const cellState=first.mounted.getState();
  const multiBack=setup(view,{state:cellState,selectedIds:['link-2','link-1']});
  assert.deepEqual(multiBack.mounted.getState().selection,cellState.selection,'the same identity set retains the exact positional selection regardless of ID ordering');
  assert.equal(multiBack.host.querySelectorAll('.canvas-grid-inspector li').length,2);
  const cleared=setup(view,{state:saved,selectedIds:[]});
  assert.equal(rowButton(cleared.host,0).getAttribute('aria-pressed'),'false');
  assert.equal(cleared.mounted.getState().selection,null);
  assert.equal(saved.selection.semanticId,'req-1','remount does not edit saved history');
});
test('native label resolver improves relationship reading while collapsed provenance retains exact identities', () => {
  const view=nativeMatrix(),before=structuredClone(view),lookups=[];
  const {host}=setup(view,{labelFor:id=>{lookups.push(id);return {'case-1':'Verification case','req-1':'Required behavior'}[id];}});
  cell(host,0,1).click();
  const item=host.querySelector('.canvas-grid-inspector li');
  assert.match(item.querySelector('span').textContent,/Verification case → Required behavior/);
  assert.doesNotMatch(item.querySelector('span').textContent,/case-1|req-1/);
  const provenance=item.querySelector('details');
  assert.equal(provenance.open,false);
  assert.match(provenance.textContent,/Relationship: link-1/);
  assert.match(provenance.textContent,/Source: case-1/);
  assert.match(provenance.textContent,/Target: req-1/);
  assert.ok(lookups.includes('case-1')&&lookups.includes('req-1'));
  assert.deepEqual(view,before);
});
