import test from 'node:test';
import assert from 'node:assert/strict';
import {
  supportsView, supportedViewKinds, rendererFamily, representations,
  representedIdentities, transitionGraphView,
} from '../src/canvas-prototype/view-contract.mjs';

const matrix = () => ({
  id:'coverage',kind:'matrix',title:'Verification coverage',
  columns:['Requirement','Case A','Case B'],
  rows:[
    {semanticId:'req-a',cells:['Requirement A','verify','']},
    {semanticId:'req-b',cells:['Requirement B','','verify']},
    {cells:['Unresolved row','','']},
  ],
  columnElements:[{index:1,semanticId:'case-a'},{index:2,semanticId:'case-b'}],
  relationshipCells:[
    {row:0,column:1,relationships:[
      {semanticId:'verify-1',sourceSemanticId:'case-a',targetSemanticId:'req-a',kind:'verify',label:'First'},
      {semanticId:'verify-2',sourceSemanticId:'case-a',targetSemanticId:'req-a',kind:'verify',label:'Second'},
    ]},
    {row:1,column:2,relationships:[{semanticId:'verify-3',sourceSemanticId:'case-b',targetSemanticId:'req-b',kind:'verify'}]},
  ],
});
test('renderer families cover every native kind without interpreting names', () => {
  assert.equal(supportedViewKinds.length,13);
  for (const kind of supportedViewKinds) assert.equal(supportsView({kind}),true);
  assert.equal(rendererFamily({kind:'matrix'}),'grid');
  assert.equal(rendererFamily({kind:'table'}),'grid');
  assert.equal(rendererFamily({kind:'sequence'}),'sequence');
  assert.equal(rendererFamily({kind:'fault-tree'}),'graph');
  assert.equal(rendererFamily({kind:'fake',title:'matrix'}),'unsupported');
});
test('representation identities preserve repeated occurrences, unknown rows and native cell direction', () => {
  const view=matrix();
  view.relationshipCells.push({row:0,column:2,relationships:[{semanticId:'verify-1',sourceSemanticId:'case-a',targetSemanticId:'req-a',kind:'verify'}]});
  const before=structuredClone(view),records=representations(view);
  assert.equal(records.filter(item=>item.semanticId==='verify-1').length,2);
  assert.equal(records.find(item=>item.row===2 && item.role==='row').identityStatus,'unknown');
  assert.equal(records.find(item=>item.semanticId==='verify-1').sourceSemanticId,'case-a');
  assert.equal(records.find(item=>item.semanticId==='case-a').column,1);
  assert.deepEqual(representedIdentities(view),['req-a','req-b','case-a','case-b','verify-1','verify-2','verify-3']);
  assert.deepEqual(view,before);
});
test('transition scaffolds bound membership, prioritize focused relationship endpoints and preserve duplicate directed links', () => {
  const view=matrix(),before=structuredClone(view);
  const result=transitionGraphView(view,{limit:2,focusedId:'verify-1'});
  assert.deepEqual(result.nodes.map(node=>node.semanticId),['case-a','req-a']);
  assert.equal(result.edges.length,2);
  for (const edge of result.edges) {
    assert.equal(result.nodes.find(node=>node.id===edge.source).semanticId,'case-a');
    assert.equal(result.nodes.find(node=>node.id===edge.target).semanticId,'req-a');
  }
  assert.deepEqual(result.edges.map(edge=>edge.semanticId),['verify-1','verify-2']);
  assert.equal(result.omissions.length,2);
  assert.match(result.notices[0],/complete grid remains available/);
  assert.equal(result.transitionOnly,true);
  assert.deepEqual(view,before);
  assert.equal(transitionGraphView(view,{limit:0}).nodes.length,0);
});
test('ordinary table labels cannot fabricate identities or links', () => {
  const view={id:'table',kind:'table',columns:['Name','Type'],rows:[{cells:['Requirement A','part']}],nodes:[],edges:[]};
  assert.deepEqual(representedIdentities(view),[]);
  assert.deepEqual(transitionGraphView(view).nodes,[]);
  assert.deepEqual(transitionGraphView(view).edges,[]);
  const graph={kind:'state',nodes:[{id:'local',semanticId:'state'}]};
  assert.equal(transitionGraphView(graph),graph);
});
