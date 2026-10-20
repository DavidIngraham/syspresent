import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {JSDOM} from 'jsdom';
import {showLanding} from '../src/canvas-prototype/landing.mjs';

const html = await readFile(new URL('../src/canvas-prototype/index.html', import.meta.url), 'utf8');

test('entry screen exposes demos and local import without exposing empty model controls', () => {
  const {document} = new JSDOM(html).window;
  assert.equal(document.getElementById('landing').hidden, false);
  for (const id of ['viewer-header', 'stage', 'viewer-footer']) assert.equal(document.getElementById(id).hidden, true);
  assert.deepEqual([...document.querySelectorAll('[data-demo]')].map(e => e.dataset.demo), ['blue-dog', 'views', 'flashlight']);
  const files = document.getElementById('sysml-files');
  assert.equal(files.multiple, true);
  assert.equal(files.accept, '.sysml,.kerml');
  assert.equal(document.getElementById('folder-files').multiple, true);
  assert.ok(document.getElementById('folder-files').hasAttribute('webkitdirectory'));
  assert.equal(document.getElementById('landing-status').getAttribute('role'), 'status');
  assert.equal(document.getElementById('landing-error').getAttribute('role'), 'alert');
});

test('opening a project and returning home preserves the loaded graph and scene', () => {
  const {document} = new JSDOM(html).window;
  const node = document.createElement('button');
  node.dataset.semanticId = 'Model::pump';
  document.getElementById('nodes').append(node);
  document.getElementById('scenes').innerHTML = '<option>Pressure protection</option>';
  showLanding(document, false);
  assert.equal(document.getElementById('landing').hidden, true);
  assert.equal(document.getElementById('stage').hidden, false);
  assert.equal(document.getElementById('viewer-header').hidden, false);
  assert.equal(document.getElementById('viewer-footer').hidden, false);
  assert.equal(document.body.classList.contains('landing-mode'), false);
  showLanding(document, true);
  assert.equal(document.getElementById('landing').hidden, false);
  assert.equal(document.getElementById('stage').hidden, true);
  assert.equal(document.querySelector('[data-semantic-id="Model::pump"]'), node);
  assert.equal(document.getElementById('scenes').value, 'Pressure protection');
  assert.equal(document.body.classList.contains('landing-mode'), true);
});
