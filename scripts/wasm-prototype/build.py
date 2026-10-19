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
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--output', type=Path, default=Path('build/canvas-prototype/engine'))
    args = parser.parse_args()
    source = args.source.resolve()
    target = args.output.resolve()
    target.mkdir(parents=True, exist_ok=True)
    commit = run('git', '-C', str(source), 'rev-parse', 'HEAD')
    dirty = bool(run('git', '-C', str(source), 'status', '--porcelain'))
    # Include newly added files: applying the carried patch leaves those untracked.
    source_diff = subprocess.check_output(['git', 'diff', 'HEAD', '--binary'], cwd=source)
    untracked = subprocess.check_output(['git', 'ls-files', '--others', '--exclude-standard', '-z'], cwd=source)
    for name in sorted(path for path in untracked.split(b'\0') if path):
        content = (source / os.fsdecode(name)).read_bytes()
        source_diff += b'\0untracked\0' + name + b'\0' + str(len(content)).encode() + b'\0' + content
    patch = Path(__file__).with_name('opensysml-semantic-views.patch')
    version = f'syspresent-{commit[:12]}' + ('-dirty' if dirty else '')
    flags = f'-s -w -X main.Version={version} -X main.Commit={commit}'
    env = os.environ.copy()
    env.update(GOOS='js', GOARCH='wasm')
    subprocess.run(['go', 'build', '-trimpath', f'-ldflags={flags}', '-o', str(target / 'sysml-wasm.wasm'), './cmd/sysml-wasm'], cwd=source, env=env, check=True)
    native_env = os.environ.copy()
    native_env.update(GOOS=run('go', 'env', 'GOHOSTOS', cwd=source), GOARCH=run('go', 'env', 'GOHOSTARCH', cwd=source))
    subprocess.run(['go', 'build', '-trimpath', f'-ldflags={flags}', '-o', str(target / 'sysml-native'), './cmd/sysml-wasm'], cwd=source, env=native_env, check=True)
    goroot = Path(run('go', 'env', 'GOROOT', cwd=source))
    copy_asset(goroot / 'lib/wasm/wasm_exec.js', target / 'wasm_exec.js')
    copy_asset(source / 'LICENSE', target / 'OPENSYSML-LICENSE')
    copy_asset(goroot / 'LICENSE', target / 'GO-LICENSE')
    assets = {}
    for name in ('sysml-wasm.wasm', 'wasm_exec.js', 'sysml-native'):
        data = (target / name).read_bytes()
        assets[name] = {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data)}
    provenance = {'schemaVersion': 1, 'sourceCommit': commit, 'sourceDirty': dirty, 'version': version,
                  'sourceDiffSha256': hashlib.sha256(source_diff).hexdigest(),
                  'carriedPatchSha256': hashlib.sha256(patch.read_bytes()).hexdigest(),
                  'goVersion': run('go', 'version', cwd=source), 'license': 'Apache-2.0',
                  'runtimeLicense': 'BSD-3-Clause', 'assets': assets,
                  'experimentalMapping': True}
    (target / 'provenance.json').write_text(json.dumps(provenance, indent=2) + '\n')
    print(json.dumps(provenance, indent=2))


if __name__ == '__main__':
    main()
