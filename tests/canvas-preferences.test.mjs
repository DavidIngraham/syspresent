import test from 'node:test';
import assert from 'node:assert/strict';
import {validatePresentation, resolvePresentation, PRESENTATION_RELATIONSHIP_KINDS} from '../src/canvas-prototype/preferences.mjs';
import {edgeAppearance} from '../src/canvas-prototype/notation.mjs';

test('display defaults are independent of viewport width and preserve no expansion or emphasis intent', () => {
  assert.deepEqual(validatePresentation(), {compartments:'auto', expanded:[], emphasis:[], grouping:'none'});
  assert.deepEqual(resolvePresentation(undefined, {width:390}), {
    compartments:'auto', expanded:[], emphasis:[], grouping:'none', contextBudget:48, expandedIds:[],
  });
  assert.equal(resolvePresentation({}, {width:699}).contextBudget, 48);
  assert.equal(resolvePresentation({}, {width:700}).contextBudget, 48);
  assert.equal(resolvePresentation().contextBudget, 48);
});

test('explicit display preferences are JSON round-trip safe and copied without mutation', () => {
  const config = {compartments:'expanded', expanded:['System::Traffic', 'native-id'], emphasis:['derive','verify'], contextBudget:0, grouping:'owner'};
  const before = structuredClone(config);
  const normalized = validatePresentation(config);
  assert.deepEqual(JSON.parse(JSON.stringify(normalized)), config);
  normalized.expanded.push('other'); normalized.emphasis.pop();
  assert.deepEqual(config, before);
  assert.equal(resolvePresentation(config, {width:390, resolve:ref => `id:${ref}`}).contextBudget, 0);
});

test('explicit expanded references use only the supplied native resolver and deduplicate native identities', () => {
  const calls = [];
  const output = resolvePresentation({expanded:['System::Traffic','native-id','System::Traffic']}, {
    resolve:reference => {calls.push(reference); return reference === 'native-id' ? {id:'native-id', name:'Unrelated label'} : 'native-id';},
  });
  assert.deepEqual(calls, ['System::Traffic','native-id']);
  assert.deepEqual(output.expanded, ['System::Traffic','native-id']);
  assert.deepEqual(output.expandedIds, ['native-id']);
});

test('references fail compilation when absent, ambiguous or not native identities', () => {
  const config = {expanded:['System::Missing']};
  assert.throws(() => resolvePresentation(config), /native identity resolver/);
  for (const value of [null, undefined, false, [], [{id:'a'}], {name:'System::Missing'}, '', '  ', Promise.resolve('a')]) {
    assert.throws(() => resolvePresentation(config, {resolve:() => value}), /unresolved or ambiguous.*System::Missing/);
  }
  const original = new Error('native lookup failed');
  assert.throws(() => resolvePresentation(config, {resolve:() => {throw original;}}), error => error.cause === original && /System::Missing/.test(error.message));
});

test('all exact native relationship kinds are supported, without interpreting labels', () => {
  for (const kind of PRESENTATION_RELATIONSHIP_KINDS) assert.equal(edgeAppearance({kind}).supported, true);
  assert.equal(new Set(PRESENTATION_RELATIONSHIP_KINDS).size, 20);
  assert.deepEqual(validatePresentation({emphasis:PRESENTATION_RELATIONSHIP_KINDS}).emphasis, PRESENTATION_RELATIONSHIP_KINDS);
  for (const value of ['Derive', 'derived from', 'verification', '*', 'unknown']) {
    assert.throws(() => validatePresentation({emphasis:[value]}), /unsupported emphasis/);
  }
});

test('compartment and owner grouping policies remain presentation-only enum values', () => {
  for (const compartments of ['auto','compact','expanded']) assert.equal(validatePresentation({compartments}).compartments, compartments);
  for (const grouping of ['none','owner']) assert.equal(validatePresentation({grouping}).grouping, grouping);
  for (const compartments of ['all',false,null,undefined,{},[]]) assert.throws(() => validatePresentation({compartments}), /compartments/);
  for (const grouping of ['package','label',false,null,undefined]) assert.throws(() => validatePresentation({grouping}), /grouping/);
});

test('unknown fields cannot introduce a competing model query language', () => {
  for (const key of ['query','filter','select','depth','script','layout','constructor','__proto__']) {
    assert.throws(() => validatePresentation(JSON.parse(`{"${key}":"anything"}`)), /unknown option/);
  }
});

test('invalid context limits fail instead of silently truncating or coercing author intent', () => {
  for (const contextBudget of [-1,257,1.5,'4',false,null,undefined,Infinity,NaN]) {
    assert.throws(() => validatePresentation({contextBudget}), /contextBudget/);
  }
  for (let contextBudget = 0; contextBudget <= 256; contextBudget++) assert.equal(validatePresentation({contextBudget}).contextBudget, contextBudget);
});

test('reference and emphasis lists reject malformed values and preserve exact identity text', () => {
  for (const key of ['expanded','emphasis']) {
    for (const value of [null,undefined,{},'derive',1]) assert.throws(() => validatePresentation({[key]:value}), /array/);
    for (const value of ['', ' ', ' derive', 'derive ', null, 5, {}, []]) assert.throws(() => validatePresentation({[key]:[value]}), /entries/);
  }
  assert.deepEqual(validatePresentation({emphasis:['derive','derive','verify']}).emphasis, ['derive','verify']);
  assert.deepEqual(validatePresentation({expanded:["System::'Traffic Safety'"]}).expanded, ["System::'Traffic Safety'"]);
});

test('configuration must be ordinary JSON data and cannot execute property accessors', () => {
  for (const value of [null,[],1,'text',new Date(),Object.create({expanded:[]})]) assert.throws(() => validatePresentation(value), /plain object/);
  let invoked = false;
  const accessor = Object.defineProperty({}, 'expanded', {enumerable:true, get(){invoked=true; return [];}});
  assert.throws(() => validatePresentation(accessor), /ordinary JSON property/);
  assert.equal(invoked, false);
  assert.throws(() => validatePresentation({[Symbol('query')]:true}), /symbol keys/);
  assert.throws(() => validatePresentation(Object.defineProperty({},'grouping',{value:'owner'})), /ordinary JSON property/);
});

test('viewport sizing rejects invalid numbers without affecting author intent', () => {
  for (const width of [0,-1,NaN,Infinity,'390',null]) assert.throws(() => resolvePresentation({}, {width}), /viewport width/);
});
