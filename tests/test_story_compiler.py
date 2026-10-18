import copy
import json
from pathlib import Path
import tempfile
import unittest

from scripts.story_compiler import compile_story, StoryError


def fence(data):
    return '```syspresent\n' + json.dumps(data) + '\n```\n'


def token(**fields):
    return '{{model ' + json.dumps(fields) + '}}'


class StoryCompilerTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / 'plot.svg').write_text('<svg/>')
        (self.root / 'table.csv').write_text('name,value\na,1\n')
        self.bundle = {
            'schemaVersion': 'syspresent.bundle.v1',
            'elements': [{'id': 'uuid-1', 'qualifiedName': 'Example::length'}, {'id': 'uuid-2'}],
            'views': [{'id': 'view-a', 'elementIds': ['uuid-1']}],
            'records': [{'ref': 'Example::length', 'context': 'run-a', 'contextRequired': True,
                         'type': 'number', 'status': 'known', 'value': 1250, 'unit': 'mm',
                         'source': {'nativeExport': 'fixture'}}],
        }
        self.stop = {'type': 'stop', 'id': 'intro', 'title': 'A model', 'view': 'view-a',
                     'focus': 'uuid-1', 'annotations': [{'target': 'uuid-1', 'text': 'Measured here'}],
                     'placements': [{'target': 'uuid-1', 'x': 10, 'y': 20}],
                     'camera': {'target': 'uuid-1', 'zoom': 1.2}, 'speakerNotes': 'Ask why.',
                     'modelRefs': ['uuid-1']}
        self.closing = {'type': 'closing', 'id': 'conclusion', 'title': 'Decision',
                        'supports': 'The supplied case.', 'open': 'Physical measurements.',
                        'next': 'Measure the installation.'}

    def story(self, prose='', extra=''):
        return fence(self.stop) + prose + '\n' + extra + fence(self.closing)

    def compile(self, source=None, bundle=None):
        return compile_story(source or self.story(), bundle or self.bundle, self.root, 'demo.md')

    def numeric(self, **overrides):
        values = dict(ref='Example::length', context='run-a', type='number', format='.2f', unit='m')
        values.update(overrides)
        return token(**values)

    def test_linear_order_provenance_identity_and_no_mutation(self):
        original = copy.deepcopy(self.bundle)
        figure = {'type': 'figure', 'id': 'plot', 'title': 'Test plot', 'asset': 'plot.svg',
                  'alt': 'A measured response', 'caption': 'Prepared response',
                  'provenance': {'source': 'evidence/run.csv', 'context': 'run-a'}}
        result = self.compile(self.story('Length: ' + self.numeric(), fence(figure)))
        self.assertEqual(result['stops'], ['intro'])
        self.assertEqual([b['type'] for b in result['blocks']], ['stop', 'markdown', 'figure', 'closing'])
        self.assertIn('1.25 m', result['blocks'][1]['text'])
        self.assertEqual(result['blocks'][0]['focus'], 'uuid-1')
        self.assertEqual(result['substitutions'][0]['context'], 'run-a')
        self.assertEqual(self.bundle, original)

    def test_unknown_and_unassessed_remain_distinct(self):
        for status in ('unknown', 'unassessed'):
            with self.subTest(status=status):
                self.bundle['records'][0].update(status=status, reason='No observations')
                self.bundle['records'][0].pop('value', None)
                result = self.compile(self.story(self.numeric()))
                self.assertIn('[' + status + ']', result['blocks'][1]['text'])
                self.assertEqual(result['substitutions'][0]['reason'], 'No observations')
        self.bundle['records'][0]['status'] = 'unset'
        with self.assertRaisesRegex(StoryError, 'status'):
            self.compile(self.story(self.numeric()))

    def test_context_missing_or_wrong_fails_without_guessing(self):
        for context in ('wrong', None, ''):
            with self.subTest(context=context), self.assertRaises(StoryError):
                self.compile(self.story(self.numeric(context=context)))
        self.bundle['records'][0].pop('context')
        with self.assertRaisesRegex(StoryError, 'explicit context required'):
            self.compile(self.story(token(ref='Example::length', type='number', format='.2f', unit='m')))

    def test_type_unit_format_and_unsafe_expressions_rejected(self):
        cases = [self.numeric(unit='kg'), self.numeric(format='__import__("os")'),
                 self.numeric(type='text'), self.numeric(unit='furlong'),
                 self.numeric(ref='length'), '{{ __import__("os").system("echo bad") }}',
                 self.numeric(expression='value * 2')]
        for case in cases:
            with self.subTest(case=case), self.assertRaisesRegex(StoryError, 'demo.md:'):
                self.compile(self.story(case))

    def test_boolean_enum_and_text_are_typed(self):
        for kind, value, expected in [('boolean', False, 'false'), ('enum', 'open', 'open'), ('text', 'Explanation', 'Explanation')]:
            self.bundle['records'] = [{'ref': 'Example::status', 'type': kind, 'status': 'known',
                                      'value': value, 'choices': ['open', 'closed'], 'source': 'native'}]
            result = self.compile(self.story(token(ref='Example::status', type=kind, format='text')))
            self.assertIn(expected, result['blocks'][1]['text'])

    def test_required_assets_and_provenance(self):
        table = {'type': 'table', 'id': 'values', 'title': 'Values', 'asset': 'table.csv',
                 'caption': 'Recorded', 'provenance': {'source': 'instrument.csv', 'context': 'run-a'}}
        self.assertEqual(self.compile(self.story(extra=fence(table)))['blocks'][1]['type'], 'table')
        for asset in ('missing.csv', '../outside.csv', '/etc/passwd', 'https://example.org/a.csv'):
            table['asset'] = asset
            with self.subTest(asset=asset), self.assertRaises(StoryError):
                self.compile(self.story(extra=fence(table)))
        table['asset'] = 'table.csv'; table['provenance'].pop('context')
        with self.assertRaisesRegex(StoryError, 'provenance'):
            self.compile(self.story(extra=fence(table)))

    def test_evidence_full_width_is_optional_and_strictly_boolean(self):
        for kind in ('figure', 'table'):
            evidence = {'type': kind, 'id': 'evidence', 'title': 'Prepared evidence',
                        'asset': 'plot.svg' if kind == 'figure' else 'table.csv',
                        'caption': 'Prepared', 'provenance': {'source': 'native', 'context': 'run'}}
            if kind == 'figure':
                evidence['alt'] = 'A response plot'
            result = self.compile(self.story(extra=fence(evidence)))
            self.assertNotIn('fullWidth', result['blocks'][1])
            for value in (True, False):
                evidence['fullWidth'] = value
                result = self.compile(self.story(extra=fence(evidence)))
                self.assertIs(result['blocks'][1]['fullWidth'], value)
            for value in (1, 'true', None):
                evidence['fullWidth'] = value
                with self.subTest(kind=kind, value=value), self.assertRaisesRegex(StoryError, 'fullWidth'):
                    self.compile(self.story(extra=fence(evidence)))

    def test_semantic_targets_and_view_membership(self):
        for field, value in [('focus', 'Example::length'), ('view', 'missing'),
                             ('annotations', [{'target': 'uuid-2', 'text': 'Hidden'}]),
                             ('placements', [{'target': 'uuid-1', 'x': True, 'y': 0}]),
                             ('camera', {'target': 'uuid-1', 'zoom': 0})]:
            with self.subTest(field=field):
                before = copy.deepcopy(self.stop)
                self.stop[field] = value
                with self.assertRaises(StoryError):
                    self.compile()
                self.stop = before

    def test_ids_closing_unknown_fields_and_locations(self):
        with self.assertRaisesRegex(StoryError, 'duplicate story id'):
            self.compile(self.story(extra=fence(self.stop)))
        with self.assertRaisesRegex(StoryError, 'closing argument'):
            self.compile(fence(self.stop))
        self.stop['script'] = 'alert(1)'
        with self.assertRaisesRegex(StoryError, 'demo.md:1: unknown'):
            self.compile()

    def test_duplicate_json_nonfinite_and_incompatible_bundle(self):
        for payload in ('{"type":"stop","type":"closing"}', '{"x":NaN}'):
            with self.assertRaises(StoryError):
                self.compile('```syspresent\n' + payload + '\n```\n')
        self.bundle['schemaVersion'] = 'other'
        with self.assertRaisesRegex(StoryError, 'incompatible bundle'):
            self.compile()

    def test_wrong_shapes_fail_as_source_diagnostics(self):
        for case in (self.numeric(unit=[]), self.numeric(type={})):
            with self.assertRaisesRegex(StoryError, 'demo.md:'):
                self.compile(self.story(case))
        with self.assertRaisesRegex(StoryError, 'unknown block'):
            self.compile(fence({'type': [], 'id': 'bad', 'title': 'Bad'}))

    def test_fenced_example_does_not_create_story_stop(self):
        example = '````markdown\n' + fence(self.stop) + '````\n'
        result = self.compile(self.story(example))
        self.assertEqual(result['stops'], ['intro'])
        self.assertIn('```syspresent', result['blocks'][1]['text'])

    def test_symlink_asset_escape_rejected(self):
        with tempfile.TemporaryDirectory() as outside:
            external = Path(outside) / 'external.csv'
            external.write_text('private')
            (self.root / 'escape.csv').symlink_to(external)
            table = {'type': 'table', 'id': 'values', 'title': 'Values', 'asset': 'escape.csv',
                     'caption': 'Bad', 'provenance': {'source': 'native', 'context': 'run'}}
            with self.assertRaisesRegex(StoryError, 'outside bundle'):
                self.compile(self.story(extra=fence(table)))


if __name__ == '__main__':
    unittest.main()


class SemanticProseLinkTests(unittest.TestCase):
    def compile(self, prose, elements=None):
        import tempfile
        bundle = {"schemaVersion": "syspresent.bundle.v1", "elements": elements or [{"id": "native/a", "qualifiedName": "Example::part"}], "views": [], "records": []}
        story = prose + '\n```syspresent\n{"type":"stop","id":"start","title":"Start"}\n```\n```syspresent\n{"type":"closing","id":"end","title":"End","supports":"A","open":"B","next":"C"}\n```\n'
        with tempfile.TemporaryDirectory() as assets:
            return compile_story(story, bundle, assets, source="links.md")

    def test_exact_identity_and_qualified_name_normalize(self):
        result = self.compile('[part](model:Example::part) and [again](model:native%2Fa)')
        self.assertEqual(result["blocks"][0]["text"].count('model:native%2Fa'), 2)
        self.assertEqual([x["target"] for x in result["modelLinks"]], ["native/a", "native/a"])

    def test_missing_ambiguous_and_bad_encoding_have_locations(self):
        cases = [('[x](model:missing)', None), ('[x](model:%ZZ)', None), ('[x](model:)', None), ('[x](model:Example::part)', [{"id":"a","qualifiedName":"Example::part"},{"id":"b","qualifiedName":"Example::part"}])]
        for prose, elements in cases:
            with self.subTest(prose=prose), self.assertRaisesRegex(StoryError, 'links.md:2:'):
                self.compile('Intro\n' + prose, elements)

    def test_code_examples_and_external_links_remain_literal(self):
        prose = '`[example](model:missing)`\n```text\n[example](model:missing)\n```\n[site](https://example.org)'
        result = self.compile(prose)
        self.assertEqual(result["modelLinks"], [])
        self.assertIn(prose, result["blocks"][0]["text"])

    def test_identity_fqn_collision_is_ambiguous(self):
        with self.assertRaisesRegex(StoryError, 'ambiguous'):
            self.compile('[x](model:a)', [{"id":"a"},{"id":"b","qualifiedName":"a"}])


class EvidenceClassificationTests(unittest.TestCase):
    def compile(self, metadata):
        import tempfile
        with tempfile.TemporaryDirectory() as directory:
            Path(directory, "data.json").write_text('[["Time", "State"], [0, "idle"]]')
            blocks = [{"type":"stop","id":"start","title":"Start"},
                {"type":"table","id":"data","title":"Synthetic unit-test fixture","asset":"data.json","caption":"Not an actual recorded run","provenance":{"source":"test fixture","context":"test only"},"evidence":metadata},
                {"type":"closing","id":"end","title":"End","supports":"Parser test","open":"No actual run","next":"Inspect"}]
            markdown = '\n'.join('```syspresent\n' + json.dumps(block) + '\n```' for block in blocks)
            return compile_story(markdown, {"schemaVersion":"syspresent.bundle.v1","elements":[],"views":[],"records":[]}, directory)

    def test_recorded_execution_requires_and_preserves_explicit_metadata(self):
        metadata = {"classification":"recorded-execution","source":"synthetic test fixture","runId":"fixture-only","configuration":"fixture configuration","inputs":{"command":"on","samples":[0,1],"enabled":True,"unknown":None}}
        result = self.compile(metadata)
        self.assertEqual(result["blocks"][1]["evidence"], metadata)
        self.assertIsNot(result["blocks"][1]["evidence"], metadata)
        for field in ("source","runId","configuration","inputs"):
            invalid = dict(metadata); del invalid[field]
            with self.subTest(field=field), self.assertRaises(StoryError): self.compile(invalid)

    def test_prepared_analysis_is_explicit_and_does_not_imply_execution(self):
        metadata = {"classification":"prepared-analysis","source":"fixture calculation","configuration":"fixture inputs","inputs":{}}
        self.assertEqual(self.compile(metadata)["blocks"][1]["evidence"], metadata)

    def test_invalid_classification_inputs_and_limits_fail(self):
        valid = {"classification":"recorded-execution","source":"fixture","runId":"fixture","configuration":"fixture","inputs":{}}
        invalid = [{**valid,"classification":"verified"},{**valid,"runId":""},{**valid,"configuration":""},{**valid,"inputs":[]},{**valid,"inputs":{"x":float('inf')}},{**valid,"inputs":{"x":"a"*8193}},{**valid,"inputs":{"x":list(range(1001))}},{**valid,"extra":True}]
        nested = {}; current = nested
        for _ in range(10): current['child'] = {}; current = current['child']
        invalid.append({**valid,"inputs":nested})
        invalid.append({**valid,"inputs":{"integer":10**400}})
        for metadata in invalid:
            with self.subTest(metadata=str(metadata)[:100]), self.assertRaises(StoryError): self.compile(metadata)
