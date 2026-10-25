import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('canvas_publication', Path(__file__).parents[1] / 'scripts/stage_canvas_publication.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class CanvasPublicationTests(unittest.TestCase):
    def fixture(self, root, extra=None, verified_extra=None):
        archive = root / 'prototype.zip'
        files = {'index.html': b'<h1>Prototype</h1>'}
        files.update(verified_extra or {})
        manifest = {'schemaVersion': 'syspresent.canvas-prototype.v1', 'revision': 'a'*40, 'dirty': False,
                    'assets': {name: hashlib.sha256(data).hexdigest() for name, data in files.items()}}
        files.update({'snapshot.json': json.dumps(manifest).encode(), 'README.txt': b'Prototype'})
        if extra:
            files.update(extra)
        with zipfile.ZipFile(archive, 'w') as zipped:
            for name, data in files.items():
                zipped.writestr(name, data)
        return archive

    def test_canvas_is_the_root_and_retains_identical_archive(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            site = root / 'site'
            archive = self.fixture(root, verified_extra={'app.js': b'Canvas app'})
            result = module.stage(archive, site)
            self.assertEqual(result['urlPath'], '')
            self.assertEqual((site / 'index.html').read_bytes(), b'<h1>Prototype</h1>')
            self.assertEqual((site / 'app.js').read_bytes(), b'Canvas app')
            self.assertEqual((site / 'reviews' / (result['snapshot']+'.zip')).read_bytes(), archive.read_bytes())
            self.assertFalse((site / 'canvas-prototype').exists())
            self.assertFalse((site / 'catalog.json').exists())

    def test_rejects_nonempty_site_instead_of_merging_retired_pages(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            site = root / 'site'
            site.mkdir()
            (site / 'index.html').write_bytes(b'Previous publication')
            with self.assertRaisesRegex(ValueError, 'empty'):
                module.stage(self.fixture(root), site)
            self.assertEqual((site / 'index.html').read_bytes(), b'Previous publication')
            self.assertEqual(len(list(site.iterdir())), 1)

    def test_rejects_unsafe_or_unverified_archive_before_copying(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for extra in ({'../escape': b'bad'}, {'index.html': b'Tampered'}, {'reviews/old.zip': b'rewrite'}, {'a//b': b'alias'}):
                with self.subTest(extra=extra):
                    archive = self.fixture(root, extra)
                    with self.assertRaises(ValueError):
                        module.stage(archive, root / 'site')
                    self.assertFalse((root / 'site').exists())

    def test_immutable_archive_directory_cannot_redirect_writes(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            destination = root / 'site'
            destination.mkdir(parents=True)
            external = root / 'external'
            external.mkdir()
            (destination / 'reviews').symlink_to(external, target_is_directory=True)
            with self.assertRaises(ValueError):
                module.stage(self.fixture(root), root / 'site')
            self.assertEqual(list(external.iterdir()), [])
            self.assertFalse((destination / 'index.html').exists())

    def test_verified_archive_cannot_overwrite_a_previous_review(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            previous = root / 'site/reviews/old.zip'
            previous.parent.mkdir(parents=True)
            previous.write_bytes(b'Frozen review')
            archive = self.fixture(root, verified_extra={'reviews/old.zip': b'Replacement'})
            with self.assertRaisesRegex(ValueError, 'reserved'):
                module.stage(archive, root / 'site')
            self.assertEqual(previous.read_bytes(), b'Frozen review')

    def test_requires_explicit_clean_metadata_before_copying(self):
        with tempfile.TemporaryDirectory() as temporary:
            root = Path(temporary)
            for metadata in ({'dirty': None}, {'revision': 'main'}):
                archive = self.fixture(root)
                with zipfile.ZipFile(archive) as zipped:
                    files = {name: zipped.read(name) for name in zipped.namelist()}
                manifest = json.loads(files['snapshot.json'])
                manifest.update(metadata)
                files['snapshot.json'] = json.dumps(manifest).encode()
                with zipfile.ZipFile(archive, 'w') as zipped:
                    for name, data in files.items():
                        zipped.writestr(name, data)
                with self.assertRaises(ValueError):
                    module.stage(archive, root / 'site')
                self.assertFalse((root / 'site').exists())
