import copy
import unittest
from scripts.configuration import validate_configuration


class ConfigurationTests(unittest.TestCase):
    def validate(self, value):
        return validate_configuration(value, [{"id": "a"}, {"id": "b"}], [{"id": "v", "elementIds": ["a"]}])

    def test_defaults_and_no_mutation(self):
        source = {"presentationPreferences": {"defaultZoom": 2}}
        before = copy.deepcopy(source)
        result = self.validate(source)
        self.assertEqual(source, before)
        self.assertEqual(result["contextLimit"], 24)
        self.assertEqual(result["modes"], ["relationships", "native-views"])
        self.assertFalse(result["presentationPreferences"]["showCompartments"])

    def test_entry_points_semantic_identity_and_view_membership(self):
        result = self.validate({"entryPoints": [{"id": "a", "label": "Start", "view": "v"}]})
        self.assertEqual(result["entryPoint"], "a")
        for entry in ({"id": "n0"}, {"id": "a", "view": "missing"}, {"id": "b", "view": "v"}, {"id": "a", "extra": 1}):
            with self.subTest(entry=entry), self.assertRaises(ValueError):
                self.validate({"entryPoints": [entry]})

    def test_legacy_aliases_and_conflicts(self):
        result = self.validate({"entryPoint": "a", "detailFields": ["verification"]})
        self.assertEqual(result["entryPoints"], [{"id": "a"}])
        self.assertEqual(result["detailFieldOrder"], ["verification", "source", "evidence"])
        self.assertNotIn("detailFields", result)
        for value in ({"entryPoint": "b", "entryPoints": [{"id": "a"}]}, {"detailFields": ["source"], "detailFieldOrder": ["evidence"]}):
            with self.assertRaises(ValueError): self.validate(value)

    def test_opaque_native_filter_names_are_preserved(self):
        result = self.validate({"defaultRelationshipTypes": ["satisfy", "owner", "futureNativeKind"], "defaultNodeTypes": ["PartUsage"]})
        self.assertEqual(result["defaultRelationshipTypes"], ["satisfy", "owner", "futureNativeKind"])

    def test_invalid_bounds_shapes_and_unknown_fields(self):
        values = [{"contextLimit": v} for v in (True, 0, 1001, 1.5, "24")]
        values += [{"presentationPreferences": {"defaultZoom": v}} for v in (True, float("nan"), float("inf"), .09, 4.1)]
        values += [{"presentationPreferences": {"showCompartments": 1}}, {"presentationPreferences": {"extra": True}}, {"modes": []}, {"modes": ["other"]}, {"modes": ["relationships", "relationships"]}, {"grouping": "guess"}, {"detailFieldOrder": ["native"]}, {"defaultNodeTypes": "PartUsage"}, {"defaultNodeTypes": ["x", "x"]}, {"defaultNodeTypes": ["x\n"]}, {"extra": 1}, {"entryPoints": [{"id": "a"}, {"id": "a"}]}]
        for value in values:
            with self.subTest(value=value), self.assertRaisesRegex(ValueError, "configuration"):
                self.validate(value)

    def test_mapping_inputs_and_nonexported_rejection(self):
        result = validate_configuration({"entryPoint": "a"}, {"a": {"id": "a"}}, {})
        self.assertEqual(result["entryPoint"], "a")
        with self.assertRaises(ValueError):
            validate_configuration({"entryPoint": "a"}, [{"id": "a", "exported": False}], [])


if __name__ == "__main__":
    unittest.main()
