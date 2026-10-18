import sys
import types
import unittest
from unittest.mock import patch

from scripts.native_export import build_index, merge_library_shard, query_view, value_record


def declaration(identity):
    return {"@id": identity, "@type": "PartDefinition", "sysx:sourceLine": 1}


class OwnershipTests(unittest.TestCase):
    def test_source_less_stubs_are_not_project_declarations(self):
        raw = [declaration("project"), {"@id": "stub", "@type": "PartDefinition"}]
        elements, _, _ = build_index(raw, [])
        self.assertEqual([e["owner"] for e in elements], ["project", "external"])
        self.assertEqual(elements[0]["source"], {"sysx:sourceLine": 1})

    def test_explicit_library_scope_classifies_existing_stub_and_query_only(self):
        raw = [{"@id": "stub", "@type": "PartDefinition"}]
        queried = [{"id": "Name", "type": "PartDefinition", "properties": {"elementId": "query"}}]
        elements, _, _ = build_index(raw, queried, {"stub", "query"})
        self.assertEqual([e["owner"] for e in elements], ["library", "library"])

    def test_unknown_query_result_is_not_assumed_library(self):
        queried = [{"id": "SI::Misleading", "type": "PartDefinition", "properties": {"elementId": "unknown"}}]
        elements, _, _ = build_index([], queried)
        self.assertEqual(elements[0]["owner"], "external")

    def test_identical_shard_declaration_still_records_library_provenance(self):
        item = declaration("library")
        by_id, library_ids = {"library": item}, set()
        merge_library_shard(by_id, [dict(item)], library_ids)
        self.assertEqual(library_ids, {"library"})
        elements, _, _ = build_index(list(by_id.values()), [], library_ids, project_ids=set())
        self.assertEqual(elements[0]["owner"], "library")

    def test_project_declaration_wins_over_library_reference_and_scope(self):
        item = declaration("project")
        by_id, library_ids = {"project": item}, {"project"}
        merge_library_shard(by_id, [{"@id": "project", "@type": "PartDefinition"}], library_ids)
        elements, _, _ = build_index(list(by_id.values()), [], library_ids, {"project"})
        self.assertEqual(elements[0]["owner"], "project")
        self.assertIs(by_id["project"], item)

    def test_full_library_replaces_stub_but_unresolved_reference_stays_external(self):
        by_id = {"library": {"@id": "library", "@type": "PartDefinition"}}
        library_ids = set()
        merge_library_shard(by_id, [declaration("library"), {"@id": "other", "@type": "PartDefinition"}], library_ids)
        elements, _, _ = build_index(list(by_id.values()), [], library_ids, set())
        self.assertEqual([e["owner"] for e in elements], ["library", "external"])

    def test_conflicting_declarations_are_rejected(self):
        with self.assertRaisesRegex(ValueError, "Conflicting native declaration"):
            merge_library_shard({"x": declaration("x")}, [{**declaration("x"), "sysx:sourceLine": 2}], set())

    def test_scalar_has_authoritative_dimensionless_metadata(self):
        module = types.ModuleType("opensysml.values")
        module.Quantity = type("Quantity", (), {})
        with patch.dict(sys.modules, {"opensysml.values": module}):
            record = value_record({"ref": "x", "context": "c"}, 3)
        self.assertEqual(record["nativeUnit"], {"text": "1", "scale_num": 1.0, "scale_den": 1.0,
            "factors": [], "reduction_given": True})

    def test_query_view_reports_missing_row_identity(self):
        result = types.SimpleNamespace(columns=["Value"], rows=[
            types.SimpleNamespace(element=types.SimpleNamespace(id="known"), cells=[[1]]),
            types.SimpleNamespace(element=types.SimpleNamespace(id="missing"), cells=[[2]])])
        with patch("scripts.native_export.typed_value", return_value={}):
            view = query_view({"id": "table", "native": "Query"}, result, [{"qualifiedName": "known", "id": "id"}])
        self.assertEqual(view["identityCoverage"]["unmappedRows"], ["1"])
        self.assertEqual(view["rowToElement"], {"0": "id", "1": None})
        self.assertEqual(view["nodeToElement"], {})


if __name__ == "__main__":
    unittest.main()
