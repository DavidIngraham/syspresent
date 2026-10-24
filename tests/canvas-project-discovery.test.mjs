import test from 'node:test';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
import {zipSync,strToU8,strFromU8,unzipSync} from 'fflate';
import {normalizeProject,validateProject,projectDescriptor,documentsFor,packProject,unpackProject,sourceDigest,verifiedRuntimeIndex} from '../src/canvas-prototype/project.mjs';
const source='package RealNativeName { part child; }';
const v2=extra=>({schemaVersion:'syspresent.project.v2',...extra});
const archive=files=>zipSync(Object.fromEntries(Object.entries(files).map(([name,value])=>[name,strToU8(value)])));
test('manifest-free intake discovers deterministic file paths without guessing semantic roots',()=>{
 const p=normalizeProject({files:{'z.kerml':'namespace Z {}','a.sysml':source,'image.svg':'<svg/>','notes.md':'a'}});
 assert.deepEqual(p.manifest.modelSources,['a.sysml','z.kerml']);assert.deepEqual(p.manifest.viewSources,['views.sysml']);assert.deepEqual(p.manifest.systemOfInterest,[]);
 assert.equal(p.manifest.title,'Imported model');assert.equal(p.manifest.publication.scope,'complete');assert.equal(p.files['story.md'],'');assert.equal(p.files['views.sysml'],'');assert.deepEqual(p.manifest.assets,['image.svg','notes.md']);
 assert.equal(p.files['a.sysml'],source);assert.equal('modelRoots' in p.manifest,false);assert.equal('requirementSeeds' in p.manifest,false);
 assert.deepEqual(documentsFor(p).map(d=>d.name),['a.sysml','z.kerml','views.sysml']);
});
test('view filename convention does not parse model text or guess declaration roles',()=>{
 const p=normalizeProject({files:{'model.sysml':'view CouldBeHere {}','other-views.sysml':source,'views/detail.sysml':'view Detail {}','views.sysml':'view Main {}'}});
 assert.deepEqual(p.manifest.viewSources,['views.sysml','views/detail.sysml']);assert.deepEqual(p.manifest.modelSources,['model.sysml','other-views.sysml']);
});
test('author choices override file discovery and preserve exact native references',()=>{
 const descriptor=v2({title:'Chosen',sources:['selected.sysml'],views:['presentation.sysml'],story:'review.md',navigation:{roots:['Root with spaces'],view:'R::V',focus:'native-id'},publication:{scope:'scoped'},source:{revision:'abc'}});
 const p=validateProject({manifest:descriptor,files:{'selected.sysml':source,'unused.sysml':'package Other {}','presentation.sysml':'view V {}','review.md':'# Review'}});
 assert.equal(p.authorManifest,descriptor);assert.deepEqual(p.manifest.modelSources,['selected.sysml']);assert.deepEqual(p.manifest.viewSources,['presentation.sysml']);assert.deepEqual(p.manifest.systemOfInterest,['Root with spaces']);assert.equal(p.manifest.entryView,'R::V');assert.equal(p.manifest.entryFocus,'native-id');assert.equal(p.manifest.publication.scope,'scoped');assert.deepEqual(p.manifest.source,{revision:'abc'});assert.ok(p.manifest.assets.includes('unused.sysml'));
});
test('folder-supplied title is a fallback and filename discovery handles source extension casing',()=>{
 const p=normalizeProject({files:{'Model.SYSML':source}},{title:'My folder'});assert.equal(p.manifest.title,'My folder');assert.equal(documentsFor(p)[0].language,'sysml');
});
test('missing explicit inputs and invalid navigation are reported rather than guessed',()=>{
 for(const manifest of [v2({sources:['missing.sysml']}),v2({views:['missing.sysml']}),v2({story:'missing.md'}),v2({sources:['model.txt']})])assert.throws(()=>normalizeProject({manifest,files:{'model.sysml':source}}));
 for(const navigation of [{roots:'Root'},{view:22},{focus:''},[]])assert.throws(()=>normalizeProject({manifest:v2({navigation}),files:{'model.sysml':source}}),/navigation/);
 for(const extra of [{modelRoots:['Root']},{requirementSeeds:['Root::Requirement']},{systemOfInterest:['Root']},{runtimeCache:'cache.json'}])assert.throws(()=>normalizeProject({manifest:v2(extra),files:{'model.sysml':source}}),/Computed project field/);
});
test('source-less projects, unsafe paths and reserved runtime sources fail explicitly',()=>{
 for(const files of [{},{'notes.md':'Hello'},{'../a.sysml':source},{'__syspresent_runtime_context.sysml':source},{'model/__syspresent_fake.kerml':source}])assert.throws(()=>normalizeProject({files}));
});
test('minimal v2 export omits derived indexes and automatic path lists',()=>{
 const p=normalizeProject({files:{'model.sysml':source}});p.manifest.modelRoots=['NativeRoot'];p.manifest.requirementSeeds=['NativeRoot::r'];p.manifest.systemOfInterest=['NativeRoot'];
 const descriptor=JSON.parse(strFromU8(unzipSync(packProject(p))['project.json']));assert.deepEqual(descriptor,{schemaVersion:'syspresent.project.v2'});
 const restored=unpackProject(packProject(p));assert.equal(restored.files['story.md'].length,0);assert.deepEqual(restored.manifest.systemOfInterest,[]);assert.equal('modelRoots' in restored.manifest,false);assert.equal('requirementSeeds' in restored.manifest,false);
});
test('captured non-conventional view files and edited narrative survive compact project export',()=>{
 const p=normalizeProject({manifest:v2({sources:['model.sysml'],navigation:{focus:'RealNativeName::child'}}),files:{'model.sysml':source}});
 p.files['captured-views.sysml']='package Captured { view scene1; }';p.manifest.viewSources.push('captured-views.sysml');p.files['story.md']='# An edited story';
 const restored=unpackProject(packProject(p));assert.deepEqual(restored.manifest.viewSources,['captured-views.sysml','views.sysml']);assert.equal(strFromU8(restored.files['story.md']),'# An edited story');assert.equal(strFromU8(restored.files['model.sysml']),source);assert.equal(restored.authorManifest.navigation.focus,'RealNativeName::child');
 assert.deepEqual(restored.authorManifest.sources,['captured-views.sysml','model.sysml','views.sysml']);
});
test('normalization and validation retain native runtime discovery after initial intake',()=>{
 const p=normalizeProject({files:{'model.sysml':source}});p.manifest.modelRoots=['RealNativeName'];p.manifest.systemOfInterest=['RealNativeName'];p.manifest.requirementSeeds=[];
 validateProject(p);assert.deepEqual(normalizeProject(p).manifest.modelRoots,['RealNativeName']);assert.deepEqual(p.manifest.systemOfInterest,['RealNativeName']);
});
test('legacy v1 descriptors retain original authoring and runtime metadata on roundtrip',()=>{
 const manifest={schemaVersion:'syspresent.project.v1',title:'Legacy',modelSources:['model.sysml'],viewSources:['views.sysml'],systemOfInterest:['RealNativeName'],story:'story.md',publication:{scope:'complete'},modelRoots:['RealNativeName'],requirementSeeds:['RealNativeName::r'],source:{revision:'original'}};
 const p={manifest,files:{'model.sysml':source,'views.sysml':'','story.md':'# Legacy'}};assert.equal(projectDescriptor(p),manifest);assert.deepEqual(unpackProject(packProject(p)).manifest,manifest);assert.equal('authorManifest' in p,false);
});
test('archives accept manifest-free ordinary folders and strip one common enclosing folder',()=>{
 const p=unpackProject(archive({'my-project/model.sysml':source,'my-project/plot.svg':'<svg/>'}));assert.deepEqual(p.manifest.modelSources,['model.sysml']);assert.ok(p.files['plot.svg']);
 const q=unpackProject(archive({'folder/project.json':JSON.stringify(v2({title:'Folder project'})),'folder/model.sysml':source}));assert.equal(q.manifest.title,'Folder project');assert.ok(q.files['model.sysml']);
 const mixed=unpackProject(archive({'a/model.sysml':source,'b/more.kerml':'namespace More {}'}));assert.deepEqual(mixed.manifest.modelSources,['a/model.sysml','b/more.kerml']);
});
test('archive path validation occurs before common-folder stripping',()=>{
 for(const name of ['folder/../outside.sysml','/folder/model.sysml','folder//model.sysml','folder/./model.sysml','C:/model.sysml','folder\\model.sysml'])assert.throws(()=>unpackProject(archive({[name]:source})),/Invalid project path/);
});
test('a publisher-trusted runtime index checks exact input files without exposing cached semantics',async()=>{
 const original=Object.getOwnPropertyDescriptor(globalThis,'crypto');Object.defineProperty(globalThis,'crypto',{configurable:true,value:webcrypto});
 try{
  const documents=[{name:'model.sysml',content:source}],cache={schemaVersion:'syspresent.native-cache.v1',engineVersion:'engine',engineFingerprint:'fingerprint',inputDigest:await sourceDigest(documents),modelRoots:['RealNativeName'],requirementSeeds:['RealNativeName::r'],runtimePackage:'SyspresentRuntimeContext2',exported:{elements:[{'@id':'should-not-escape'}]},views:{unused:{}}};
  const bytes=strToU8(JSON.stringify(cache)),project={manifest:{runtimeCache:'cache.json'},files:{'cache.json':bytes}},options={trustedHash:createHash('sha256').update(bytes).digest('hex'),engineVersion:'engine',engineFingerprint:'fingerprint',documents};
  assert.deepEqual(await verifiedRuntimeIndex(project,options),{modelRoots:['RealNativeName'],requirementSeeds:['RealNativeName::r'],runtimePackage:'SyspresentRuntimeContext2'});
  for(const change of [{trustedHash:undefined},{trustedHash:'wrong'},{engineVersion:'new'},{engineFingerprint:'new'},{documents:[{...documents[0],content:'changed'}]}])assert.equal(await verifiedRuntimeIndex(project,{...options,...change}),null);
  const p=normalizeProject({files:{'model.sysml':source,'runtime-cache.json':bytes}});assert.equal(p.manifest.runtimeCache,'runtime-cache.json');assert.equal('runtimeCache' in projectDescriptor(p),false);
  for(const runtimePackage of ['bad-name','Bad::Name','Bad;Injection',42]){const bad=strToU8(JSON.stringify({...cache,runtimePackage}));const invalid={manifest:project.manifest,files:{'cache.json':bad}};assert.equal(await verifiedRuntimeIndex(invalid,{...options,trustedHash:createHash('sha256').update(bad).digest('hex')}),null);}
  const result=await verifiedRuntimeIndex(project,options);result.modelRoots.push('Mutated');assert.deepEqual((await verifiedRuntimeIndex(project,options)).modelRoots,['RealNativeName']);
 }finally{if(original)Object.defineProperty(globalThis,'crypto',original);else delete globalThis.crypto;}
});
