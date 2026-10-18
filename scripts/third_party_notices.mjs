/** Preserve notices and exact build inputs; this is not a license-compliance verdict. */
import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {resolve,relative,join,dirname,sep} from 'node:path';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const sha = data => createHash('sha256').update(data).digest('hex');
const contained = (base,path) => path===base || path.startsWith(base+sep);

export async function generateThirdPartyNotices(outputDir, options={}) {
  const source=resolve(options.source??process.env.OPENSYSML_SOURCE??'');
  if(!options.source&&!process.env.OPENSYSML_SOURCE) throw new Error('Set OPENSYSML_SOURCE');
  const output=resolve(outputDir), cwd=resolve(options.workingDirectory??process.cwd());
  const notices=join(output,'notices'), editor=join(source,'editors/vscode');
  const metafile=JSON.parse(await readFile(join(output,'build-inputs.json'),'utf8'));
  const lockBytes=await readFile(join(editor,'package-lock.json'));
  const lock=JSON.parse(lockBytes), inputs=[], packages=new Map();
  const revision=execFileSync('git',['-C',source,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
  const dirty=!!execFileSync('git',['-C',source,'status','--porcelain'],{encoding:'utf8'}).trim();
  await mkdir(notices,{recursive:true});
  await writeFile(join(notices,'package-lock.json'),lockBytes);

  async function retain(from,to) {
    await mkdir(dirname(to),{recursive:true});
    await copyFile(from,to);
    const bytes=await readFile(from);
    return {path:relative(output,to).split(sep).join('/'),sha256:sha(bytes),bytes:bytes.length};
  }
  async function licenseFiles(directory,target) {
    const found=[];
    for(const entry of await readdir(directory,{withFileTypes:true})) {
      if(entry.isFile()&&/^(license|licence|copying|notice|copyright)(\.|$)/i.test(entry.name))
        found.push(await retain(join(directory,entry.name),join(target,entry.name)));
    }
    if(!found.length) throw new Error(`No license/notice files found in ${directory}`);
    return found;
  }
  for(const name of Object.keys(metafile.inputs)) {
    const path=resolve(cwd,name);
    if(!contained(source,path)) {
      // Original application sources are outside this notice generator's licensing scope.
      if(name.includes('node_modules')) throw new Error(`Unreviewed external bundled dependency: ${name}`);
      continue;
    }
    const rel=relative(source,path);
    const retained=await retain(path,join(notices,'source-inputs','OpenSysML',rel));
    inputs.push({input:name,...retained});
    const marker=`node_modules${sep}`, pos=rel.lastIndexOf(marker);
    if(pos<0) continue;
    const after=rel.slice(pos+marker.length).split(sep);
    const packageName=after[0].startsWith('@')?after.slice(0,2).join('/'):after[0];
    const packageRoot=join(source,rel.slice(0,pos),marker,...packageName.split('/'));
    packages.set(packageName,packageRoot);
  }
  const nativeLicenses=await licenseFiles(source,join(notices,'OpenSysML'));
  const dependencies=[];
  for(const [name,packageRoot] of packages) {
    const metadata=JSON.parse(await readFile(join(packageRoot,'package.json'),'utf8'));
    const key=relative(editor,packageRoot).split(sep).join('/');
    const pinned=lock.packages?.[key];
    if(!pinned||pinned.version!==metadata.version||!pinned.integrity||!pinned.resolved)
      throw new Error(`Installed ${name} is not identified by the source lockfile`);
    const folder=join(notices,name.replaceAll('/','_'));
    const licenses=await licenseFiles(packageRoot,folder);
    await retain(join(packageRoot,'package.json'),join(folder,'package.json'));
    // Retain package JS, maps and notices; exclude unused WASM binaries.
    // This is not relabeled as complete corresponding source.
    const archive=join(folder,`${name.replaceAll('/','_')}-${metadata.version}-installed.tar.gz`);
    execFileSync('tar',['--sort=name','--mtime=@0','--owner=0','--group=0','--numeric-owner','--exclude=*.wasm','-czf',archive,'-C',packageRoot,'.']);
    const archiveBytes=await readFile(archive);
    dependencies.push({name,version:metadata.version,declaredLicense:metadata.license,
      repository:metadata.repository,distribution:{url:pinned.resolved,integrity:pinned.integrity},
      licenses,installedArchive:{path:relative(output,archive).split(sep).join('/'),sha256:sha(archiveBytes),bytes:archiveBytes.length},
      excludedFiles:['*.wasm (not bundled or loaded by this viewer)'], sourceAvailability:'Exact bundled inputs and installed package contents except WASM retained. Upstream repository is identified; completeness of preferred source/build inputs is not certified.'});
  }
  const limits=[
    'This inventory follows actual esbuild inputs, not all development dependencies. Prebundled package internals retain their original headers and source maps; they have not been independently relicensed.',
    'OpenSysML checkout may contain local changes. Exact bundled source inputs and hashes are retained; the Git revision alone is not a digest of a dirty checkout.',
    'Package archives exclude unused WASM binaries. Only the JavaScript glue is bundled; this viewer does not call loadAvoid. Retained JS and source maps are not a claim of complete upstream corresponding source; source availability and replacement provisions need release review.',
    'No license is assigned here to original Syspresent code. This record is not a legal compliance conclusion.'
  ];
  const manifest={schemaVersion:'syspresent.third-party.v1',native:{name:'OpenSysML',repository:'https://github.com/DavidIngraham/OpenSysML',revision,dirty,declaredLicense:'Apache-2.0',licenses:nativeLicenses},
    lockSha256:sha(lockBytes),dependencies,inputs,limits};
  await writeFile(join(notices,'manifest.json'),JSON.stringify(manifest,null,2)+'\n');
  const text=['THIRD-PARTY NOTICES','',
    `OpenSysML — Apache-2.0 — revision ${revision}${dirty?' (modified checkout)':''}`,
    'Source: https://github.com/DavidIngraham/OpenSysML',
    'License text: OpenSysML/LICENSE; exact bundled inputs: source-inputs/OpenSysML/','',
    ...dependencies.flatMap(d=>[`${d.name} ${d.version} — package-declared license: ${d.declaredLicense}`,
      `Repository: ${typeof d.repository==='string'?d.repository:d.repository?.url}`,
      `Pinned distribution: ${d.distribution.url}`,`Integrity: ${d.distribution.integrity}`,
      `Retained distribution: ${d.installedArchive.path.replace(/^notices\//,'')}`,
      'Original license texts, notices and package metadata are in the adjacent package directory.','']),
    'Source availability and limits:',...limits.map(x=>'- '+x),'',
    'See manifest.json for exact bundled input and archive hashes.'];
  await writeFile(join(notices,'THIRD_PARTY_NOTICES.txt'),text.join('\n')+'\n');
  return manifest;
}

if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  const output=process.argv[2];
  if(!output) throw new Error('Usage: node scripts/third_party_notices.mjs <browser-output>');
  const result=await generateThirdPartyNotices(output);
  console.log(`Retained OpenSysML notices and ${result.dependencies.length} bundled package distributions.`);
}
