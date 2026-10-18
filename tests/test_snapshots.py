import tempfile
import unittest
from pathlib import Path
from scripts.snapshots import publish, verify, write_catalog


class SnapshotTests(unittest.TestCase):
    def test_history_and_tampering(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            source = root / "source"
            source.mkdir()
            (source / "index.html").write_text("First review")
            provenance = dict.fromkeys(["storyRevision", "modelRevision", "nativeToolRevision", "viewerRevision", "bundleSchemaVersion", "evidenceManifestDigest"], "test")
            first = publish(source, root / "snapshots", provenance)
            original = (first / "manifest.json").read_bytes()
            self.assertEqual(first, publish(source, root / "snapshots", provenance))
            (source / "index.html").write_text("Second review")
            second = publish(source, root / "snapshots", provenance)
            self.assertNotEqual(first, second)
            entries = [{"reviewId": "first", "snapshotId": first.name, "status": "superseded", "reason": "Updated evidence", "replacementReviewId": "second"}, {"reviewId": "second", "snapshotId": second.name, "status": "current"}]
            write_catalog(root / "catalog.json", entries, root / "snapshots")
            self.assertEqual(original, (first / "manifest.json").read_bytes())
            self.assertEqual("First review", (first / "index.html").read_text())
            (first / "index.html").write_text("Tampered")
            with self.assertRaisesRegex(ValueError, "digest mismatch"):
                verify(first)

    def test_overlapping_paths_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            with self.assertRaisesRegex(ValueError, "overlap"):
                publish(root, root / "out", {})
            with self.assertRaisesRegex(ValueError, "existing directory"):
                publish(root / "missing", root / "out", {})

    def test_missing_provenance(self):
        with tempfile.TemporaryDirectory() as directory:
            (Path(directory) / "source").mkdir()
            with self.assertRaisesRegex(ValueError, "provenance"):
                publish(Path(directory) / "source", Path(directory) / "out", {})


if __name__ == "__main__":
    unittest.main()
