import hashlib
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

from scripts.native_export import prepare_assets, main


class ExportAssetsTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.output = self.root / 'out'
        (self.root / 'plot.svg').write_text('<svg/>')
        (self.root / 'generator.py').write_text('# source provenance only')
        self.bundle = {'schemaVersion': 'syspresent.bundle.v1', 'elements': [], 'relationships': [],
                       'views': [{'id': 'review', 'kind': 'table', 'asset': 'review.json',
                                  'query': {'id': 'Example::Review'}, 'elementIds': [],
                                  'native': {'columns': ['State'], 'rows': [{'cells': ['unassessed']}]}}],
                       'provenance': {'nativeToolRevision': 'fixture'}}
        self.config = {'preparedAssets': [{'source': 'plot.svg', 'asset': 'figures/plot.svg', 'provenanceSources': ['generator.py']}],
                       'provenanceSources': ['generator.py']}

    def test_native_table_copy_and_provenance(self):
        prepare_assets(self.bundle, self.config, self.root, self.output)
        table = json.loads((self.output / 'assets/review.json').read_text())
        self.assertEqual(table['rows'], [['unassessed']])
        self.assertEqual(self.bundle['views'][0]['native']['rows'], [{'cells': ['unassessed']}])
        self.assertEqual(table['provenance']['nativeQuery'], 'Example::Review')
        self.assertEqual((self.output / 'assets/figures/plot.svg').read_bytes(), (self.root / 'plot.svg').read_bytes())
        self.assertEqual(self.bundle['provenance']['preparedSourceDigests']['generator.py'], hashlib.sha256((self.root / 'generator.py').read_bytes()).hexdigest())

    def test_invalid_destinations_and_duplicates_fail_before_write(self):
        for name in ('../escape', '/tmp/escape', 'C:\\escape', 'review.json', './review.json'):
            with self.subTest(name=name):
                self.config['preparedAssets'][0]['asset'] = name
                with self.assertRaises(ValueError):
                    prepare_assets(self.bundle, self.config, self.root, self.output)
                self.assertFalse((self.output / 'assets/review.json').exists())

    def test_symlink_escape_and_missing_provenance_fail(self):
        self.output.mkdir()
        (self.output / 'assets').symlink_to(self.root, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, 'escapes output'):
            prepare_assets(self.bundle, self.config, self.root, self.output)
        (self.output / 'assets').unlink()
        self.config['provenanceSources'] = ['missing.py']
        with self.assertRaisesRegex(ValueError, 'Missing prepared source'):
            prepare_assets(self.bundle, self.config, self.root, self.output)
        self.assertFalse((self.output / 'assets/review.json').exists())

    def test_shard_cli_passes_same_in_memory_export(self):
        config_path = self.root / 'project.json'
        config_path.write_text(json.dumps(self.config))
        with patch('scripts.native_export.export', return_value=self.bundle) as exporter, \
             patch('scripts.shard_bundle.shard_bundle') as shard, \
             patch('sys.argv', ['native_export', '--config', str(config_path), '--output', str(self.output), '--shard']):
            main()
        exporter.assert_called_once()
        self.assertIs(shard.call_args.args[0], self.bundle)
        self.assertEqual(shard.call_args.args[1], str(self.output))
        self.assertFalse((self.output / 'bundle.json').exists())  # mocked sharder owns this write
        self.assertTrue((self.output / 'assets/review.json').is_file())


if __name__ == '__main__':
    unittest.main()
