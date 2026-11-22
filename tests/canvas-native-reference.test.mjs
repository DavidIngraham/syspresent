import test from 'node:test';
import assert from 'node:assert/strict';
import {nativeReference} from '../src/canvas-prototype/native-reference.mjs';
import {captureViewSource,requirementCoverageSource} from '../src/canvas-prototype/project.mjs';

test('native quoted qualified names preserve escaped quotes and embedded separators',()=>{
 const name="P::'A::B'::'Owner\\'s requirement'";
 assert.equal(nativeReference(name),"'P'::'A::B'::'Owner\\'s requirement'");
 assert.ok(requirementCoverageSource(['P'],'Context',[name]).includes('expose '+nativeReference(name)+';'));
 assert.ok(captureViewSource({name:'saved',qualifiedNames:[name]}).includes('expose '+nativeReference(name)+';'));
 assert.equal(nativeReference('P::legacy name'),"'P'::'legacy name'");
});

test('native reference encoding rejects broken boundaries and contains unquoted punctuation',()=>{
 for(const name of ["P::'open","P::'safe'; part injected;",'P::','P::::x','P\nx'])assert.throws(()=>nativeReference(name));
 assert.equal(nativeReference('P::x; part injected;'),"'P'::'x; part injected;'");
});
