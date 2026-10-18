import gzip
import hashlib
import json
from pathlib import Path
import tempfile
import unittest

from scripts.shard_bundle import bucket_for, shard_bundle


class ShardTests(unittest.TestCase):
    def fixture(self):
        return {"schemaVersion": "syspresent.bundle.v1", "elements": [
            {"id": "a", "name": "A", "kind": "PartUsage", "native": {"@id": "a", "declaredName": "A", "nested": {"value": [1, 2]}}},
            {"id": "b", "name": "B", "kind": "PartUsage", "native": {"@id": "b", "declaredName": "B"}},
            {"id": "anonymous", "name": "anonymous", "kind": "Membership", "native": {"@id": "anonymous"}},
        ], "relationships": [
            {"id": "ab", "source": "a", "target": "b", "kind": "ownedMember", "authority": "native-api-property"},
            {"id": "ba", "source": "b", "target": "a", "kind": "reference", "authority": "native-render-view"},
            {"id": "missing", "source": "b", "target": "outside", "kind": "reference"},
            {"id": "orphan", "source": "outside", "target": "elsewhere", "kind": "reference"},
        ], "views": [{"id": "view", "elementIds": ["a"], "native": {"kind": "tree"}}], "records": [],
            "nativeApi": ["duplicated-root"], "nativeQueries": ["duplicated-root"], "provenance": {"revision": "pinned"}}

    def test_lossless_incident_edges_identity_direction_and_unknown_targets(self):
        original = self.fixture()
        before = json.dumps(original, sort_keys=True)
        with tempfile.TemporaryDirectory() as temp:
            main = shard_bundle(original, temp)
            restored_nodes, restored_edges = {}, {}
            for bucket, descriptor in main["modelStore"]["shards"].items():
                compressed = (Path(temp) / descriptor["path"]).read_bytes()
                self.assertEqual(hashlib.sha256(compressed).hexdigest(), descriptor["sha256"])
                self.assertEqual(len(compressed), descriptor["bytes"])
                shard = json.loads(gzip.decompress(compressed))
                if bucket == "unresolved":
                    restored_edges.update((edge["id"], edge) for edge in shard["relationships"])
                    continue
                for identity, block in shard["nodes"].items():
                    self.assertEqual(bucket_for(identity), bucket)
                    restored_nodes[identity] = block["element"]
                    restored_edges.update((edge["id"], edge) for edge in block["relationships"])
                    for edge in block["relationships"]:
                        self.assertIn(identity, (edge["source"], edge["target"]))
                    if identity == "b":
                        self.assertIn({"id": "outside", "exported": False}, block["neighbors"])
            self.assertEqual(restored_nodes, {e["id"]: e for e in original["elements"]})
            self.assertEqual(restored_edges, {e["id"]: e for e in original["relationships"]})
            self.assertEqual([e["id"] for e in main["elements"]], ["a"])
            self.assertEqual([e["id"] for e in main["searchIndex"]], ["a", "b"])
            self.assertEqual(main["modelStore"]["elementKinds"], ["Membership", "PartUsage"])
            self.assertEqual(main["modelStore"]["relationshipKinds"], ["ownedMember", "reference"])
            self.assertEqual(main["views"], original["views"])
            self.assertNotIn("nativeApi", main)
            self.assertNotIn("nativeQueries", main)
            self.assertEqual(main["modelStore"]["statistics"], {"elements": 3, "relationships": 4, "unresolvedRelationships": 1})
            self.assertEqual(json.dumps(original, sort_keys=True), before)

    def test_deterministic_compressed_bytes(self):
        with tempfile.TemporaryDirectory() as one, tempfile.TemporaryDirectory() as two:
            first, second = shard_bundle(self.fixture(), one), shard_bundle(self.fixture(), two)
            self.assertEqual(first, second)
            for entry in first["modelStore"]["shards"].values():
                self.assertEqual((Path(one)/entry["path"]).read_bytes(), (Path(two)/entry["path"]).read_bytes())
            self.assertEqual((Path(one)/"bundle.json").read_bytes(), (Path(two)/"bundle.json").read_bytes())

    def test_duplicate_native_identifiers_rejected(self):
        for key in ("elements", "relationships"):
            bundle=self.fixture();bundle[key].append(bundle[key][0])
            with tempfile.TemporaryDirectory() as directory, self.assertRaises(ValueError):
                shard_bundle(bundle,directory)


if __name__ == "__main__":
    unittest.main()
