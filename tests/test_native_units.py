import copy
import json
import tempfile
import unittest

from scripts.story_compiler import compile_story, StoryError, validate_native_unit


class NativeUnitTests(unittest.TestCase):
    def setUp(self):
        # Actual Flashlight native Unit shape: kilograms reduce through SI::gram.
        self.record = {'ref': 'Flashlight::light::mass', 'context': 'design', 'contextRequired': True,
                       'type': 'number', 'status': 'known', 'value': .22, 'unit': 'kg',
                       'source': {'nativeEvaluation': 'Flashlight::light::mass'},
                       'nativeUnit': {'text': 'kg', 'scale_num': 1000.0, 'scale_den': 1.0,
                                      'factors': [{'unit_id': 'SI::gram', 'exponent': 1.0}],
                                      'reduction_given': True}}

    def compile(self, record):
        substitution = '{{model ' + json.dumps({'ref': record['ref'], 'context': 'design',
                          'type': 'number', 'format': '.1f', 'unit': 'g'}) + '}}'
        story = ('```syspresent\n{"type":"stop","id":"start","title":"Mass"}\n```\n'
                 + substitution + '\n```syspresent\n' + json.dumps({'type': 'closing', 'id': 'end',
                   'title': 'Next', 'supports': 'A calculation', 'open': 'Measurement', 'next': 'Measure'}) + '\n```')
        with tempfile.TemporaryDirectory() as root:
            return compile_story(story, {'schemaVersion': 'syspresent.bundle.v1', 'records': [record]}, root)

    def test_actual_flashlight_reduction_converts(self):
        result = self.compile(self.record)
        self.assertIn('220.0 g', result['blocks'][1]['text'])

    def test_spelling_is_not_authority(self):
        cases = [({'scale_num': 1}, 'same dimensions wrong scale'),
                 ({'factors': [{'unit_id': 'Local::gram', 'exponent': 1}]}, 'shadowed base'),
                 ({'factors': [{'unit_id': 'SI::second', 'exponent': 1}]}, 'wrong dimension'),
                 ({'factors': [{'unit_id': 'SI::gram', 'exponent': 2}]}, 'wrong exponent'),
                 ({'reduction_given': False}, 'missing reduction'),
                 ({'offset': 0}, 'unknown affine form')]
        for changes, label in cases:
            record = copy.deepcopy(self.record)
            record['nativeUnit'].update(changes)
            with self.subTest(label=label), self.assertRaises(StoryError):
                self.compile(record)

    def test_missing_native_unit_fails_for_native_evaluation(self):
        self.record.pop('nativeUnit')
        with self.assertRaisesRegex(StoryError, 'canonical unit reduction'):
            self.compile(self.record)
        self.record['source'] = 'explicit nonnative fixture'
        self.assertIn('220.0 g', self.compile(self.record)['blocks'][1]['text'])

    def test_unknown_value_still_requires_valid_unit(self):
        self.record['status'] = 'unknown'
        self.record['nativeUnit']['scale_num'] = 1
        with self.assertRaises(StoryError):
            self.compile(self.record)

    def test_exact_rational_composite_and_dimensionless(self):
        record = copy.deepcopy(self.record)
        record['unit'] = 'km/h'
        record['nativeUnit'] = {'text': 'km/h', 'scale_num': 1000, 'scale_den': 3600,
                                'factors': [{'unit_id': 'SI::second', 'exponent': -1},
                                            {'unit_id': 'SI::metre', 'exponent': 1}], 'reduction_given': True}
        validate_native_unit(record)
        record['unit'] = '1'
        record['nativeUnit'].update(scale_num=1, scale_den=1, factors=[])
        validate_native_unit(record)

    def test_malformed_reduction_rejected(self):
        for field, value in [('scale_den', 0), ('scale_num', float('inf')), ('scale_num', True),
                             ('factors', None), ('factors', [{'unit_id': 'SI::gram', 'exponent': True}]),
                             ('factors', [{'unit_id': 'SI::gram', 'exponent': 1}] * 2)]:
            record = copy.deepcopy(self.record)
            record['nativeUnit'][field] = value
            with self.subTest(field=field, value=value), self.assertRaises(ValueError):
                validate_native_unit(record)


if __name__ == '__main__':
    unittest.main()
