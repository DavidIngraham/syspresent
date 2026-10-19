#!/usr/bin/env python3
"""Add a validated canvas archive to an existing static site without changing its links."""
import argparse
import hashlib
import json
import re
from pathlib import Path, PurePosixPath
import zipfile


def stage(archive, site):
    archive, site = Path(archive), Path(site).resolve()
    data = archive.read_bytes()
    digest = hashlib.sha256(data).hexdigest()
    with zipfile.ZipFile(archive) as zipped:
        names = zipped.namelist()
        if len(names) != len(set(names)):
            raise ValueError('Duplicate archive entries')
        for name in names:
            path = PurePosixPath(name)
            if path.is_absolute() or any(part in ('', '.', '..') for part in name.split('/')) or '\\' in name or ':' in name or name.endswith('/'):
                raise ValueError('Unsafe archive path: ' + name)
        manifest = json.loads(zipped.read('snapshot.json'))
        if manifest.get('schemaVersion') != 'syspresent.canvas-prototype.v1' or manifest.get('dirty') is not False:
            raise ValueError('Publication requires a clean canvas snapshot')
        revision = manifest.get('revision')
        if not isinstance(revision, str) or not re.fullmatch('[0-9a-f]{40}', revision):
            raise ValueError('Publication requires an exact viewer revision')
        allowed = set(manifest['assets']) | {'snapshot.json', 'README.txt'}
        if set(names) != allowed:
            raise ValueError('Archive and snapshot asset lists differ')
        for name, expected in manifest['assets'].items():
            if hashlib.sha256(zipped.read(name)).hexdigest() != expected:
                raise ValueError('Snapshot hash mismatch: ' + name)
        destination = site / 'canvas-prototype'
        if any(PurePosixPath(name).parts[0] == 'reviews' for name in names):
            raise ValueError('The reviews namespace is reserved for immutable archives')
        retained = destination / 'reviews' / (digest + '.zip')
        targets = [destination / name for name in names]
        # Validate every path before changing any published file.
        for target in [*targets, retained]:
            current = target
            while current != site:
                if current.is_symlink():
                    raise ValueError('Publication path contains a symlink')
                current = current.parent
        if retained.exists() and retained.read_bytes() != data:
            raise ValueError('Immutable archive collision')
        for name, target in zip(names, targets):
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(zipped.read(name))
        retained.parent.mkdir(parents=True, exist_ok=True)
        if not retained.exists():
            with retained.open('xb') as output:
                output.write(data)
    return {'urlPath': 'canvas-prototype/', 'snapshot': digest, 'viewerRevision': manifest['revision']}


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--archive', required=True)
    parser.add_argument('--site', required=True)
    args = parser.parse_args()
    print(json.dumps(stage(args.archive, args.site), indent=2))
