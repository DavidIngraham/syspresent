import json
import os
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
from types import SimpleNamespace

from scripts.package_review import assemble, update_catalog
from scripts.snapshots import canonical, digest, files, verify


class PackageReviewTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.browser = self.root / "browser"
        self.assets = self.root / "assets"
        self.browser.mkdir(); self.assets.mkdir()
        self.binary = self.root / "sysml-grpc"
        self.binary.write_bytes(b"verified-native-binary")
        self.source = self.root / "model.sysml"
        self.source.write_text("package Demo { part thing; }")
        self.revision = "a" * 40
        self.version = f"sysml-grpc version release\ncommit: {self.revision}\nbuilt: fixture"
        self.bundle = {"schemaVersion": "syspresent.bundle.v1", "elements": [{"id": "Demo__thing"}],
            "records": [], "relationships": [], "configuration": {"requiredViews": ["structure"]},
            "views": [{"id": "structure", "kind": "tree", "elementIds": ["Demo__thing"],
                "nodeToElement": {"n0": "Demo__thing"}, "identityCoverage": {"unmappedNodes": [], "syntheticNodes": []},
                "native": {"nodes": [{"id": "n0", "semantic_id": "Demo__thing", "identity_status": "mapped"}], "edges": []}}],
            "provenance": {"nativeToolRevision": self.revision, "nativeBinarySha256": digest(self.binary.read_bytes()),
                "nativeVersion": self.version, "sourceDigests": {"model.sysml": digest(self.source.read_bytes())}, "librarySourceDigests": {}}}
        self.bundle_path = self.root / "bundle.json"
        self.save_bundle()
        self.story = self.root / "review.md"
        self.story.write_text("# Review\n\n```syspresent\n" + json.dumps({"type": "stop", "id": "intro", "title": "Introduction", "view": "structure", "focus": "Demo__thing"}) + "\n```\n\n```syspresent\n" + json.dumps({"type": "figure", "id": "plot", "title": "Prepared result", "asset": "plot.svg", "alt": "A line", "caption": "Prepared result", "provenance": {"source": "bench", "context": "run one"}}) + "\n```\n\n```syspresent\n" + json.dumps({"type": "closing", "id": "closing", "title": "Conclusion", "supports": "A finding", "open": "A gap", "next": "A decision"}) + "\n```\n")
        (self.assets / "plot.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"/>')
        for name, content in {"index.html": '<link rel="stylesheet" href="./styles.css"><link rel="stylesheet" href="./notation.css"><script src="./app.js"></script>', "app.js": "console.log('viewer')", "styles.css": "body {}", "notation.css": "svg {}", "renderer-provenance.json": json.dumps({"revision": self.revision, "dirty": False})}.items():
            (self.browser / name).write_text(content)
        self.save_viewer()
        self.version_patch = patch("scripts.package_review.subprocess.run", return_value=SimpleNamespace(stdout=self.version))
        self.version_patch.start(); self.addCleanup(self.version_patch.stop)
        self.ci_patch = patch.dict(os.environ, {"CI": ""})
        self.ci_patch.start(); self.addCleanup(self.ci_patch.stop)
        self.args = dict(bundle_path=self.bundle_path, story_path=self.story, browser=self.browser,
                         assets=self.assets, output=self.root / "site", review_id="review-one", native_binary=self.binary)

    def save_bundle(self):
        self.bundle_path.write_bytes(canonical(self.bundle))

    def save_viewer(self, dirty=False):
        values = files(self.browser)
        values.pop("viewer-provenance.json", None)
        (self.browser / "viewer-provenance.json").write_bytes(canonical({"revision": "b" * 40, "dirty": dirty, "assets": values}))

    def test_prepared_asset_manifest_rejects_tampering_and_missing_entry(self):
        data = (self.assets / "plot.svg").read_bytes()
        valid = {"plot.svg": {"sha256": digest(data), "bytes": len(data)}}
        for manifest in ({}, {"plot.svg": {"sha256": "0" * 64, "bytes": len(data)}},
                         {"plot.svg": {"sha256": digest(data), "bytes": len(data) + 1}}):
            self.bundle["provenance"]["preparedAssets"] = manifest
            self.save_bundle()
            with self.subTest(manifest=manifest), self.assertRaisesRegex(ValueError, "prepared manifest|Prepared asset"):
                assemble(**self.args)
        self.bundle["provenance"]["preparedAssets"] = valid
        self.save_bundle()
        target = assemble(**self.args)
        self.assertEqual((target / "assets/plot.svg").read_bytes(), data)

    def test_prepared_sources_verified_frozen_and_tamper_rejected(self):
        sibling = self.root / "evidence"
        sibling.mkdir()
        source = sibling / "generator.py"
        source.write_text("# frozen generator")
        # A config-root-relative sibling path is intentional source provenance.
        config_root = self.root / "configuration"
        config_root.mkdir()
        self.bundle["provenance"]["sourceDigests"] = {"../model.sysml": digest(self.source.read_bytes())}
        self.bundle["provenance"]["preparedSourceDigests"] = {"../evidence/generator.py": digest(source.read_bytes())}
        self.save_bundle()
        target = assemble(**self.args, model_root=config_root)
        frozen = target / "sources/evidence-source/0-generator.py"
        self.assertEqual(frozen.read_bytes(), source.read_bytes())
        manifest = json.loads((target / "source-manifest.json").read_text())
        self.assertEqual(manifest["sources/evidence-source/0-generator.py"]["source"], "../evidence/generator.py")
        source.write_text("# changed generator")
        with self.assertRaisesRegex(ValueError, "Digest mismatch"):
            assemble(**self.args, model_root=config_root)
        self.assertEqual(frozen.read_text(), "# frozen generator")
        source.unlink()
        with self.assertRaisesRegex(ValueError, "Missing"):
            assemble(**self.args, model_root=config_root)

    def test_immutable_rebuild_and_catalog(self):
        first = assemble(**self.args, title="<Review>", status="current")
        original = files(first)
        self.assertEqual(first, assemble(**self.args, title="<Review>", status="current"))
        self.assertEqual(original, files(first))
        (self.assets / "plot.svg").write_text('<svg xmlns="http://www.w3.org/2000/svg"><title>New result</title></svg>')
        with self.assertRaisesRegex(ValueError, "different snapshot"):
            assemble(**self.args, title="<Review>")
        second = assemble(**{**self.args, "review_id": "review-two"}, title="Second", status="current")
        self.assertNotEqual(first, second)
        self.assertEqual(original, files(first))
        self.assertNotIn("manifest.json", verify(first)["assets"])
        homepage = (self.root / "site/index.html").read_text()
        self.assertIn("&lt;Review&gt;", homepage)
        self.assertNotIn("http-equiv", homepage)
        self.assertIn(first.name, homepage)
        self.assertIn(second.name, homepage)

    def test_lifecycle_metadata_does_not_mutate_snapshot(self):
        first = assemble(**self.args, status="current")
        original = files(first)
        assemble(**{**self.args, "review_id": "review-two"}, title="Replacement")
        same = assemble(**self.args, status="superseded", reason="New evidence", replacement_review_id="review-two", reviewers=["David"], reviewed_on="2026-10-17", outcome="Discussed")
        self.assertEqual(first, same)
        self.assertEqual(original, files(first))
        entries = json.loads((self.root / "site/catalog.json").read_text())["reviews"]
        self.assertEqual(entries[0]["status"], "superseded")
        self.assertEqual(entries[0]["reviewers"], ["David"])
        self.assertEqual(entries[0]["outcome"], "Discussed")

    def test_catalog_only_after_sources_change(self):
        first = assemble(**self.args, status="current")
        original = files(first)
        self.source.write_text("new model")
        self.story.unlink()
        update_catalog(output=self.root / "site", review_id="review-one", status="withdrawn", reason="Review obsolete")
        self.assertEqual(original, files(first))
        entry = json.loads((self.root / "site/catalog.json").read_text())["reviews"][0]
        self.assertEqual(entry["reason"], "Review obsolete")
        self.assertEqual(entry["status"], "withdrawn")

    def test_tampered_snapshot_rejected(self):
        first = assemble(**self.args)
        (first / "app.js").write_text("changed")
        with self.assertRaisesRegex(ValueError, "digest mismatch"):
            assemble(**self.args)

    def test_missing_evidence_rejected(self):
        (self.assets / "plot.svg").unlink()
        with self.assertRaisesRegex(ValueError, "missing asset"):
            assemble(**self.args)

    def test_browser_and_model_tampering_rejected(self):
        (self.browser / "app.js").write_text("changed")
        with self.assertRaisesRegex(ValueError, "build digest mismatch"):
            assemble(**self.args)
        self.save_viewer()
        self.source.write_text("changed")
        with self.assertRaisesRegex(ValueError, "Digest mismatch"):
            assemble(**self.args)

    def test_native_binary_and_dirty_build_rejected(self):
        self.binary.write_bytes(b"wrong")
        with self.assertRaisesRegex(ValueError, "Digest mismatch"):
            assemble(**self.args)
        self.binary.write_bytes(b"verified-native-binary")
        self.save_viewer(dirty=True)
        with self.assertRaisesRegex(ValueError, "clean pinned viewer"):
            assemble(**self.args)
        assemble(**self.args, development=True)
        with patch.dict(os.environ, {"CI": "true"}):
            with self.assertRaisesRegex(ValueError, "forbidden in CI"):
                assemble(**self.args, development=True)

    def test_status_and_required_view_rejected(self):
        with self.assertRaisesRegex(ValueError, "reason"):
            assemble(**self.args, status="withdrawn")
        with self.assertRaisesRegex(ValueError, "another catalog review"):
            assemble(**self.args, status="superseded", reason="Changed", replacement_review_id="missing")
        self.bundle["configuration"]["requiredViews"] = ["missing"]
        self.save_bundle()
        with self.assertRaisesRegex(ValueError, "Required native view"):
            assemble(**self.args)

    def test_mixed_unmapped_view_rejected(self):
        self.bundle["views"][0]["native"]["nodes"].append({"id": "n1", "identity_status": "unmapped"})
        self.save_bundle()
        with self.assertRaisesRegex(ValueError, "Unmapped model node"):
            assemble(**self.args)

    def make_sharded_bundle(self):
        from scripts.shard_bundle import shard_bundle
        self.bundle["elements"].append({"id": "Demo__other", "name": "other", "qualifiedName": "Demo::other", "native": {"declaredName": "other"}})
        self.bundle["relationships"].append({"id": "edge", "source": "Demo__thing", "target": "Demo__other", "kind": "reference"})
        self.bundle = shard_bundle(self.bundle, self.root)
        self.story.write_text(self.story.read_text().replace('"focus": "Demo__thing"', '"focus": "Demo__thing", "modelRefs": ["Demo__other"]'))
        return next(iter(self.bundle["modelStore"]["shards"].values()))

    def test_sharded_snapshot_and_search_only_story_reference(self):
        self.make_sharded_bundle()
        self.assertNotIn("Demo__other", [element["id"] for element in self.bundle["elements"]])
        target = assemble(**self.args)
        manifest = verify(target)
        for spec in self.bundle["modelStore"]["shards"].values():
            self.assertEqual(manifest["assets"][spec["path"]], spec["sha256"])
            self.assertEqual((target / spec["path"]).stat().st_size, spec["bytes"])
        compiled = json.loads((target / "story.json").read_text())
        stop = next(block for block in compiled["blocks"] if block["type"] == "stop")
        self.assertEqual(stop["modelRefs"], ["Demo__other"])
        published = json.loads((target / "bundle.json").read_text())
        self.assertEqual(published, self.bundle)

    def test_table_only_sharded_bundle_is_valid(self):
        self.bundle["elements"][0]["native"] = {"declaredName": "thing"}
        self.bundle["views"][0].update(kind="table", elementIds=[], nodeToElement={}, native={"nodes": [], "edges": [], "columns": ["Element"], "rows": [{"cells": ["thing"]}]})
        self.make_sharded_bundle()
        self.story.write_text(self.story.read_text().replace(', "focus": "Demo__thing"', ''))
        self.assertEqual(self.bundle["elements"], [])
        verify(assemble(**self.args))

    def test_missing_shard_rejected(self):
        spec = self.make_sharded_bundle()
        (self.root / spec["path"]).unlink()
        with self.assertRaisesRegex(ValueError, "Missing asset"):
            assemble(**self.args)

    def test_tampered_shard_rejected(self):
        spec = self.make_sharded_bundle()
        with (self.root / spec["path"]).open("ab") as stream:
            stream.write(b"tampered")
        with self.assertRaisesRegex(ValueError, "shard digest or size mismatch"):
            assemble(**self.args)

    def test_missing_browser_reference_rejected(self):
        (self.browser / "styles.css").write_text('body {background: url("missing.png")}')
        self.save_viewer()
        with self.assertRaisesRegex(ValueError, "Missing browser asset reference"):
            assemble(**self.args)


if __name__ == "__main__":
    unittest.main()
