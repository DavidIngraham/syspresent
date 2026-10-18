"""Content-addressed static snapshots; mutable review catalog stays outside them."""
from pathlib import Path
import hashlib
import json
import os
import shutil
import tempfile


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(value):
    return json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(",", ":")).encode()


def files(root):
    result = {}
    for path in sorted(root.rglob("*")):
        if path.is_symlink():
            raise ValueError(f"Snapshot symlink forbidden: {path}")
        if path.is_file():
            result[path.relative_to(root).as_posix()] = digest(path.read_bytes())
    return result


def verify(snapshot):
    snapshot = Path(snapshot)
    manifest = json.loads((snapshot / "manifest.json").read_text())
    actual = files(snapshot)
    del actual["manifest.json"]
    if actual != manifest["assets"]:
        raise ValueError("Snapshot asset digest mismatch")
    content = {k: v for k, v in manifest.items() if k != "snapshotId"}
    if digest(canonical(content)) != manifest["snapshotId"]:
        raise ValueError("Snapshot manifest digest mismatch")
    if snapshot.name != manifest["snapshotId"]:
        raise ValueError("Snapshot directory identity mismatch")
    return manifest


def publish(source, destination, provenance):
    source, destination = Path(source).resolve(), Path(destination).resolve()
    if not source.is_dir():
        raise ValueError("Snapshot source must be an existing directory")
    if destination.is_relative_to(source) or source.is_relative_to(destination):
        raise ValueError("Snapshot source and destination must not overlap")
    required = {"storyRevision", "modelRevision", "nativeToolRevision", "viewerRevision", "bundleSchemaVersion", "evidenceManifestDigest"}
    if any(not provenance.get(key) for key in required):
        raise ValueError("Missing snapshot provenance: " + ", ".join(sorted(key for key in required if not provenance.get(key))))
    if (source / "manifest.json").exists():
        raise ValueError("manifest.json is reserved")
    manifest = {"schemaVersion": 1, "provenance": provenance, "assets": files(source)}
    snapshot_id = digest(canonical(manifest))
    manifest["snapshotId"] = snapshot_id
    destination.mkdir(parents=True, exist_ok=True)
    target = destination / snapshot_id
    if target.exists():
        verify(target)
        return target
    staging = Path(tempfile.mkdtemp(prefix=".staging-", dir=destination))
    try:
        shutil.copytree(source, staging, dirs_exist_ok=True)
        (staging / "manifest.json").write_bytes(canonical(manifest))
        # Check copied bytes before atomically exposing this immutable directory.
        copied = files(staging)
        del copied["manifest.json"]
        if copied != manifest["assets"]:
            raise ValueError("Source changed while publishing")
        staging.rename(target)
    finally:
        if staging.exists():
            shutil.rmtree(staging)
    verify(target)
    return target


def write_catalog(path, entries, snapshots):
    ids = [entry["reviewId"] for entry in entries]
    if len(ids) != len(set(ids)):
        raise ValueError("Duplicate review ID")
    for entry in entries:
        status = entry.get("status")
        if status not in {"draft", "current", "superseded", "withdrawn"}:
            raise ValueError("Invalid review status")
        snapshot_id = entry["snapshotId"]
        if len(snapshot_id) != 64 or any(c not in "0123456789abcdef" for c in snapshot_id):
            raise ValueError("Invalid snapshot identity")
        verify(Path(snapshots) / snapshot_id)
        if status in {"superseded", "withdrawn"} and not entry.get("reason"):
            raise ValueError("Historical status requires a reason")
        if status == "superseded" and (entry.get("replacementReviewId") not in ids or entry.get("replacementReviewId") == entry["reviewId"]):
            raise ValueError("Superseded review requires another catalog review")
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, temp = tempfile.mkstemp(dir=path.parent)
    try:
        with os.fdopen(fd, "wb") as stream:
            stream.write(canonical({"schemaVersion": 1, "reviews": entries}))
        os.replace(temp, path)
    finally:
        if os.path.exists(temp):
            os.unlink(temp)
