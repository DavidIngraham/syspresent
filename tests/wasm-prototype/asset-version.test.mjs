import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeAssetVersion} from '../../scripts/wasm-prototype/asset-version.mjs';
const fixture=()=>({assets:{'sysml-wasm.wasm':{sha256:'a'.repeat(64)},'wasm_exec.js':{sha256:'b'.repeat(64)}}});
test('native cache key survives app/story/metadata changes only when both actual payloads stay identical',()=>{
 const before=fixture(),after={...fixture(),sourceCommit:'other',sourceDirty:true,storyRevision:'new'};
 assert.equal(nativeAssetVersion(before),nativeAssetVersion(after));
 for(const name of ['sysml-wasm.wasm','wasm_exec.js']){const changed=fixture();changed.assets[name].sha256='c'.repeat(64);assert.notEqual(nativeAssetVersion(before),nativeAssetVersion(changed));}
});
test('unverified or incomplete native asset metadata cannot receive a cache key',()=>{
 assert.throws(()=>nativeAssetVersion({}),/digest/);const bad=fixture();bad.assets['wasm_exec.js'].sha256='not-a-digest';assert.throws(()=>nativeAssetVersion(bad),/digest/);
});
