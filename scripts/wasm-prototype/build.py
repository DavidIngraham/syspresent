#!/usr/bin/env python3
"""Build matching native and Go/WASM semantic engines from a pinned local fork."""
import argparse
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile


def run(*args, **kwargs):
    return subprocess.check_output(args, text=True, **kwargs).strip()


def copy_asset(source, destination):
    # Go's module cache files are read-only. Replace assets atomically on rebuild.
    with tempfile.NamedTemporaryFile(dir=destination.parent, delete=False) as temporary:
        temporary_path = Path(temporary.name)
    try:
        shutil.copyfile(source, temporary_path)
        temporary_path.chmod(0o644)
        temporary_path.replace(destination)
    finally:
        temporary_path.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, help='Existing exact pinned checkout; otherwise fetch into .tools')
    parser.add_argument('--allow-dirty', action='store_true', help='Build an explicitly labeled development artifact')
    parser.add_argument('--prepare-only', action='store_true', help='Fetch and verify source without building')
    parser.add_argument('--output', type=Path, default=Path('build/canvas-prototype/engine'))
    args = parser.parse_args()
    pin = json.loads(Path(__file__).with_name('dependency.json').read_text())
    source = (args.source or Path('.tools/opensysml-' + pin['commit'][:12])).resolve()
    if args.source is None and not source.exists():
        source.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(['git', 'clone', '--filter=blob:none', '--no-checkout',
                        'https://github.com/' + pin['repository'] + '.git', str(source)], check=True)
        subprocess.run(['git', '-C', str(source), 'fetch', 'origin', pin['commit']], check=True)
        subprocess.run(['git', '-C', str(source), 'checkout', '--detach', pin['commit']], check=True)
    if run('git', '-C', str(source), 'rev-parse', '--is-shallow-repository') == 'true':
        if args.source is not None:
            raise SystemExit('OpenSysML source is shallow; fetch its full history so Go module-version stamping is reproducible')
        subprocess.run(['git', '-C', str(source), 'fetch', '--unshallow',
                        'https://github.com/' + pin['repository'] + '.git', pin['commit']], check=True)
    target = args.output.resolve()
    target.mkdir(parents=True, exist_ok=True)
    commit = run('git', '-C', str(source), 'rev-parse', 'HEAD')
    dirty = bool(run('git', '-C', str(source), 'status', '--porcelain'))
    tree = run('git', '-C', str(source), 'rev-parse', 'HEAD^{tree}')
    if commit != pin['commit'] or tree != pin['tree']:
        raise SystemExit('OpenSysML checkout does not match dependency.json; use a separate checkout of the exact pin')
    if dirty and not args.allow_dirty:
        raise SystemExit('OpenSysML source is dirty; --allow-dirty is required for a development artifact')
    if args.prepare_only:
        print(json.dumps({'sourceCommit': commit, 'sourceTree': tree, 'sourceDirty': dirty, 'sourcePath': str(source)}))
        return
    toolchain_env = dict(os.environ, GOTOOLCHAIN='go' + pin['goVersion'])
    subprocess.run(['go', 'generate', './internal/workspace/libs'], cwd=source, env=toolchain_env, check=True)
    # Include untracked source files in the provenance of an allowed development build.
    source_diff = subprocess.check_output(['git', 'diff', 'HEAD', '--binary'], cwd=source)
    untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z'], cwd=source)
    for name in sorted(path for path in untracked.split(b'\0') if path):
        content = (source / os.fsdecode(name)).read_bytes()
        source_diff += b'\0untracked\0' + name + b'\0' + str(len(content)).encode() + b'\0' + content
    version = f'syspresent-{commit[:12]}' + ('-dirty' if dirty else '')
    flags = f'-s -w -X main.Version={version} -X main.Commit={commit}'
    env = toolchain_env.copy()
    env.update(GOOS='js', GOARCH='wasm')
    subprocess.run(['go', 'build', '-trimpath', f'-ldflags={flags}', '-o', str(target / 'sysml-wasm.wasm'), './cmd/sysml-wasm'], cwd=source, env=env, check=True)
    native_env = toolchain_env.copy()
    native_env.update(GOOS=run('go', 'env', 'GOHOSTOS', cwd=source, env=toolchain_env), GOARCH=run('go', 'env', 'GOHOSTARCH', cwd=source, env=toolchain_env))
    subprocess.run(['go', 'build', '-trimpath', f'-ldflags={flags}', '-o', str(target / 'sysml-native'), './cmd/sysml-wasm'], cwd=source, env=native_env, check=True)
    subprocess.run(['go', 'build', '-trimpath', f'-ldflags={flags}', '-o', str(target / 'sysml'), './cmd/sysml'], cwd=source, env=native_env, check=True)
    goroot = Path(run('go', 'env', 'GOROOT', cwd=source, env=toolchain_env))
    copy_asset(goroot / 'lib/wasm/wasm_exec.js', target / 'wasm_exec.js')
    copy_asset(source / 'LICENSE', target / 'OPENSYSML-LICENSE')
    copy_asset(goroot / 'LICENSE', target / 'GO-LICENSE')
    assets = {}
    for name in ('sysml-wasm.wasm', 'wasm_exec.js', 'sysml-native', 'sysml'):
        data = (target / name).read_bytes()
        assets[name] = {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    provenance = {'schemaVersion': 1, 'sourceCommit': commit, 'sourceDirty': dirty, 'version': version,
                  'sourceDiffSha256': hashlib.sha256(source_diff).hexdigest(),
                  'sourceRepository': pin['repository'], 'sourceTree': tree,
                  'upstreamCommit': pin['upstreamCommit'],
                  'goVersion': run('go', 'version', cwd=source, env=toolchain_env), 'license': 'Apache-2.0',
                  'runtimeLicense': 'BSD-3-Clause', 'assets': assets,
                  'experimentalMapping': True}
    (target / 'provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
    print(json.dumps(provenance, indent=2))


if __name__ == '__main__':
    main()
