"""Validate and assemble an immutable static review and its mutable catalog."""
import argparse
import csv
import io
import xml.etree.ElementTree as ET
import html
import hashlib
from html.parser import HTMLParser
import json
import os
from pathlib import Path, PurePosixPath
import re
import subprocess
import tempfile
from urllib.parse import urlsplit, unquote

try:
    from .snapshots import canonical, digest, files, publish, verify, write_catalog
    from .story_compiler import compile_story
except ImportError:
    from snapshots import canonical, digest, files, publish, verify, write_catalog
    from story_compiler import compile_story

HASH = re.compile(r"[0-9a-f]{64}\Z")
REVISION = re.compile(r"[0-9a-f]{7,40}\Z")
REVIEW_ID = re.compile(r"[A-Za-z0-9][A-Za-z0-9._-]{0,119}\Z")


def read_json(path):
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError(f"Duplicate JSON key: {key}")
            result[key] = value
        return result
    return json.loads(Path(path).read_text(encoding="utf-8"), object_pairs_hook=unique,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError("Nonfinite JSON value")))


def safe_path(root, name):
    if not isinstance(name, str) or not name or "\\" in name or ":" in name:
        raise ValueError("Asset path must be a relative local path")
    parts = PurePosixPath(name)
    if parts.is_absolute() or ".." in parts.parts:
        raise ValueError("Asset path escapes its root")
    path = Path(root) / name
    if any(parent.is_symlink() for parent in [path, *path.parents] if parent != Path(root).parent):
        raise ValueError("Asset symlinks are forbidden")
    if not path.is_file():
        raise ValueError(f"Missing asset: {name}")
    return path


def verify_hash(value, label):
    if not isinstance(value, str) or not HASH.fullmatch(value):
        raise ValueError(f"Invalid SHA256 for {label}")


def verified_bytes(path, expected):
    verify_hash(expected, str(path))
    data = Path(path).read_bytes()
    if digest(data) != expected:
        raise ValueError(f"Digest mismatch: {path}")
    return data


def clean_revision(value, dirty, label, development):
    if not isinstance(value, str) or not value:
        raise ValueError(f"Missing {label} revision")
    if not development and (dirty is not False or not REVISION.fullmatch(value)):
        raise ValueError(f"Publication requires clean pinned {label} provenance; use --development only locally")


def validate_bundle(bundle):
    if bundle.get("schemaVersion") != "syspresent.bundle.v1":
        raise ValueError("Unsupported bundle schema")
    elements = bundle.get("elements")
    if not isinstance(elements, list) or (not elements and not (bundle.get("modelStore") and bundle.get("searchIndex"))):
        raise ValueError("Bundle requires native elements or a sharded native declaration catalog")
    ids = [element.get("id") for element in elements]
    if any(not isinstance(identity, str) or not identity for identity in ids) or len(ids) != len(set(ids)):
        raise ValueError("Invalid or duplicate semantic identity")
    known = set(ids)
    search = bundle.get("searchIndex", [])
    if not isinstance(search, list):
        raise ValueError("Invalid native search catalog")
    search_ids = set()
    for element in search:
        identity = element.get("id")
        if not isinstance(identity, str) or not identity or identity in search_ids or element.get("exported") is not True:
            raise ValueError("Invalid or duplicate native search identity")
        search_ids.add(identity)
    known.update(search_ids)
    view_ids = set()
    views = bundle.get("views")
    if not isinstance(views, list) or not views:
        raise ValueError("Bundle requires native views")
    for view in views:
        if not view.get("id") or view["id"] in view_ids or not isinstance(view.get("native"), dict):
            raise ValueError("Invalid native view")
        view_ids.add(view["id"])
        coverage = view.get("identityCoverage")
        if not isinstance(coverage, dict) or coverage.get("unmappedNodes"):
            raise ValueError("Native view identity coverage is missing or incomplete")
        mapping = view.get("nodeToElement", {})
        nodes = view["native"].get("nodes", [])
        synthetic = set(coverage.get("syntheticNodes", []))
        for node in nodes:
            identity = mapping.get(node.get("id"))
            status = node.get("identity_status", node.get("identityStatus"))
            if identity:
                native_id = node.get("semantic_id", node.get("semanticId"))
                if identity not in known or identity != native_id or status != "mapped":
                    raise ValueError("Native view identity mapping mismatch")
            elif node.get("id") not in synthetic or status != "synthetic":
                raise ValueError("Unmapped model node cannot be published")
        if any(identity not in known for identity in view.get("elementIds", [])):
            raise ValueError("View references an unavailable semantic element")
    required = bundle.get("configuration", {}).get("requiredViews", [])
    if not isinstance(required, list) or any(identity not in view_ids for identity in required):
        raise ValueError("Required native view missing")


def shard_inputs(bundle, bundle_path):
    """Verify compressed shard bytes without loading or interpreting the model graph."""
    store = bundle.get("modelStore")
    if store is None:
        return {}
    if store.get("schemaVersion") != "syspresent.model-shards.v1" or store.get("addressing") != "sha256-utf8-first2":
        raise ValueError("Unsupported model shard schema")
    shards = store.get("shards")
    if not isinstance(shards, dict) or not shards:
        raise ValueError("Missing model shards")
    result = {}
    for bucket, spec in shards.items():
        if not isinstance(bucket, str) or not re.fullmatch(r"[0-9a-f]{2}|unresolved", bucket) or not isinstance(spec, dict):
            raise ValueError("Invalid model shard descriptor")
        name = spec.get("path")
        if name != f"model/{bucket}.json.gz":
            raise ValueError("Invalid model shard path")
        size = spec.get("bytes")
        if isinstance(size, bool) or not isinstance(size, int) or size <= 0:
            raise ValueError("Invalid model shard byte count")
        verify_hash(spec.get("sha256"), name)
        path = safe_path(Path(bundle_path).parent, name)
        state = hashlib.sha256()
        count = 0
        with path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                count += len(chunk)
                state.update(chunk)
        if count != size or state.hexdigest() != spec["sha256"]:
            raise ValueError(f"Model shard digest or size mismatch: {name}")
        result[name] = (path, spec)
    for element in [*bundle["elements"], *bundle.get("searchIndex", [])]:
        bucket = hashlib.sha256(element["id"].encode("utf-8")).hexdigest()[:2]
        if bucket not in shards:
            raise ValueError(f"Missing model shard for semantic identity: {element['id']}")
    return result


def compiler_bundle(bundle):
    """Give the story compiler native declaration identities without expanding graph shards."""
    elements = {element["id"]: element for element in bundle["elements"]}
    for element in bundle.get("searchIndex", []):
        elements.setdefault(element["id"], element)
    return {**bundle, "elements": list(elements.values())}


class AssetReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.references = []
    def handle_starttag(self, tag, attrs):
        for key, value in attrs:
            if key == "src" or (tag == "link" and key == "href"):
                self.references.append(value)


def validate_browser_references(browser_files):
    parser = AssetReferences()
    parser.feed(browser_files["index.html"].decode("utf-8"))
    refs = [("index.html", ref) for ref in parser.references]
    for name, data in browser_files.items():
        if name.endswith(".css"):
            refs.extend((name, match.strip().strip("\"'")) for match in re.findall(r"url\(([^)]+)\)", data.decode("utf-8")))
    for origin, ref in refs:
        parsed = urlsplit(ref)
        if parsed.scheme == "data":
            continue
        if parsed.scheme or parsed.netloc or parsed.path.startswith("/"):
            raise ValueError(f"Browser asset must be snapshot-local: {ref}")
        if not parsed.path:
            continue
        target = (PurePosixPath(origin).parent / unquote(parsed.path)).as_posix()
        while target.startswith("./"):
            target = target[2:]
        if ".." in PurePosixPath(target).parts or target not in browser_files:
            raise ValueError(f"Missing browser asset reference: {ref}")


def validate_evidence(name, data, kind):
    suffix = Path(name).suffix.lower()
    if kind == "table":
        if suffix == ".csv":
            rows = list(csv.reader(io.StringIO(data.decode("utf-8")), strict=True))
        elif suffix == ".json":
            value = json.loads(data)
            rows = value if isinstance(value, list) else [value["columns"], *value["rows"]]
        else:
            raise ValueError("Prepared tables must be CSV or JSON")
        if not rows or any(not isinstance(row, list) for row in rows):
            raise ValueError("Prepared table requires rows of cells")
    elif suffix not in {".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp"}:
        raise ValueError("Prepared figure must be a supported image")
    elif suffix == ".svg":
        text = data.decode("utf-8")
        # Matplotlib emits this standard declaration. It adds no custom entities;
        # remove it for validation and never fetch or resolve its external DTD.
        text = re.sub(r'<!DOCTYPE\s+svg\s+PUBLIC\s+"-//W3C//DTD SVG 1\.1//EN"\s+"http://www\.w3\.org/Graphics/SVG/1\.1/DTD/svg11\.dtd"\s*>', '', text)
        if "<!DOCTYPE" in text or "<!ENTITY" in text:
            raise ValueError("Prepared SVG must be self-contained")
        try:
            root = ET.fromstring(text)
        except ET.ParseError as error:
            raise ValueError("Invalid prepared SVG") from error
        for element in root.iter():
            for key, value in element.attrib.items():
                if key.split("}")[-1] in {"href", "src"} and value and not value.startswith(("#", "data:")):
                    raise ValueError("Prepared SVG references an unfrozen external asset")
        for ref in re.findall(r"url\(([^)]+)\)", text):
            if not ref.strip().strip("\"'").startswith(("#", "data:")):
                raise ValueError("Prepared SVG references an unfrozen external asset")


def catalog_home(entries):
    lines = []
    for entry in entries:
        title = html.escape(entry.get("title", entry["reviewId"]))
        status = html.escape(entry["status"])
        reason = html.escape(entry.get("reason", ""))
        lines.append(f'<li><a href="snapshots/{entry["snapshotId"]}/">{title}</a> — {status}' + (f" · {reason}" if reason else "") + "</li>")
    return ('<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
            '<title>Syspresent reviews</title><main><h1>Engineering reviews</h1><p>Each link opens its frozen model and evidence snapshot. Lifecycle status does not imply approval.</p><ul>'
            + "".join(lines) + "</ul></main></html>")


def assemble(*, bundle_path, story_path, browser, assets, output, review_id, status="draft", title=None,
             development=False, model_root=None, native_binary=None, reason=None, replacement_review_id=None,
             reviewers=(), reviewed_on=None, outcome=None):
    if development and os.environ.get("CI", "").lower() not in {"", "0", "false"}:
        raise ValueError("--development is forbidden in CI")
    if not REVIEW_ID.fullmatch(review_id):
        raise ValueError("Invalid review ID")
    if status not in {"draft", "current", "superseded", "withdrawn"}:
        raise ValueError("Invalid review status")
    if status in {"superseded", "withdrawn"} and not reason:
        raise ValueError("Historical status requires a reason")
    bundle_path, story_path, browser, assets, output = map(Path, (bundle_path, story_path, browser, assets, output))
    bundle = read_json(bundle_path)
    validate_bundle(bundle)
    shards = shard_inputs(bundle, bundle_path)
    source = story_path.read_bytes()
    story = compile_story(source.decode("utf-8"), compiler_bundle(bundle), assets, story_path.name)
    story["title"] = title or bundle.get("configuration", {}).get("title") or review_id
    story["assetBase"] = "./assets/"
    native = bundle.get("provenance", {})
    native_revision = native.get("nativeToolRevision")
    clean_revision(native_revision, not bool(REVISION.fullmatch(native_revision or "")), "native tool", development)
    binary = Path(native_binary or os.environ.get("OPENSYSML_BINARY", ""))
    if not binary.is_file():
        raise ValueError("Native binary is required to verify tool provenance")
    verified_bytes(binary, native.get("nativeBinarySha256"))
    version = subprocess.run([str(binary.resolve()), "--version"], check=True, capture_output=True, text=True).stdout.strip()
    if version != native.get("nativeVersion", "").strip() or f"commit: {native_revision}" not in version.splitlines():
        raise ValueError("Native tool version provenance mismatch")
    viewer = read_json(browser / "viewer-provenance.json")
    renderer = read_json(browser / "renderer-provenance.json")
    clean_revision(viewer.get("revision"), viewer.get("dirty"), "viewer", development)
    clean_revision(renderer.get("revision"), renderer.get("dirty"), "renderer", development)
    if not development and renderer["revision"] != native_revision:
        raise ValueError("Native tool and browser renderer revisions differ")
    expected = viewer.get("assets")
    if not isinstance(expected, dict) or not expected:
        raise ValueError("Missing browser build asset digests")
    if any(name in {"manifest.json", "bundle.json", "story.json", "story.md", "source-manifest.json", "evidence-manifest.json"} or name.startswith(("assets/", "sources/", "model/")) for name in expected):
        raise ValueError("Browser build uses reserved snapshot paths")
    actual = files(browser)
    actual.pop("viewer-provenance.json", None)
    if actual != expected:
        raise ValueError("Browser build digest mismatch")
    browser_files = {name: verified_bytes(safe_path(browser, name), sha) for name, sha in expected.items()}
    for name in ("index.html", "app.js", "styles.css", "notation.css", "renderer-provenance.json"):
        if name not in browser_files:
            raise ValueError(f"Missing browser asset: {name}")
    validate_browser_references(browser_files)
    browser_files["viewer-provenance.json"] = canonical(viewer)
    evidence = {}
    prepared = native.get("preparedAssets")
    if "preparedAssets" in native and not isinstance(prepared, dict):
        raise ValueError("Invalid prepared asset manifest")
    for block in story["blocks"]:
        if block["type"] in {"figure", "table"}:
            evidence[block["asset"]] = safe_path(assets, block["asset"]).read_bytes()
            if prepared is not None:
                spec = prepared.get(block["asset"])
                if not isinstance(spec, dict):
                    raise ValueError(f"Referenced asset missing from prepared manifest: {block['asset']}")
                verify_hash(spec.get("sha256"), block["asset"])
                data = evidence[block["asset"]]
                size = spec.get("bytes")
                if type(size) is not int or size < 0 or len(data) != size or digest(data) != spec["sha256"]:
                    raise ValueError(f"Prepared asset digest or size mismatch: {block['asset']}")
            validate_evidence(block["asset"], evidence[block["asset"]], block["type"])
    evidence_hashes = {name: digest(data) for name, data in evidence.items()}
    model_root = Path(model_root) if model_root else story_path.parent
    model_sources = {}
    source_manifest = {}
    for group, hashes in (("model", native.get("sourceDigests")), ("library", native.get("librarySourceDigests", {})), ("evidence-source", native.get("preparedSourceDigests", {}))):
        if not isinstance(hashes, dict) or (group == "model" and not hashes):
            raise ValueError("Missing model source digests")
        for i, (name, sha) in enumerate(sorted(hashes.items())):
            path = Path(name) if Path(name).is_absolute() else model_root / name
            if path.is_symlink() or not path.is_file():
                raise ValueError(f"Missing or symlinked model source: {name}")
            packaged = f"sources/{group}/{i}-{path.name}"
            model_sources[packaged] = verified_bytes(path, sha)
            source_manifest[packaged] = {"source": name, "sha256": sha}
    provenance = {"storyRevision": digest(source), "modelRevision": digest(canonical(source_manifest)),
                  "nativeToolRevision": native_revision, "nativeBinarySha256": native["nativeBinarySha256"],
                  "viewerRevision": viewer["revision"], "viewerBuildDigest": digest(canonical(expected)),
                  "rendererRevision": renderer["revision"], "bundleSchemaVersion": bundle["schemaVersion"],
                  "bundleDigest": digest(canonical(bundle)), "evidenceManifestDigest": digest(canonical(evidence_hashes)),
                  "title": story["title"], "development": development}
    entries = read_json(output / "catalog.json")["reviews"] if (output / "catalog.json").exists() else []
    for entry in entries:
        verify_hash(entry.get("snapshotId"), "catalog snapshot")
        verify(output / "snapshots" / entry["snapshotId"])
    if status == "superseded" and (replacement_review_id == review_id or replacement_review_id not in {e["reviewId"] for e in entries}):
        raise ValueError("Superseded review requires another catalog review")
    with tempfile.TemporaryDirectory(prefix="syspresent-package-") as temp:
        staging = Path(temp)
        payloads = {**browser_files, **model_sources, "bundle.json": canonical(bundle), "story.json": canonical(story),
                    "story.md": source, "source-manifest.json": canonical(source_manifest), "evidence-manifest.json": canonical(evidence_hashes)}
        payloads.update({"assets/" + name: data for name, data in evidence.items()})
        for name, data in payloads.items():
            target = staging / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(data)
        for name, (path, spec) in shards.items():
            target = staging / name
            target.parent.mkdir(parents=True, exist_ok=True)
            state = hashlib.sha256()
            count = 0
            with path.open("rb") as stream, target.open("wb") as copied:
                for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                    copied.write(chunk)
                    state.update(chunk)
                    count += len(chunk)
            if count != spec["bytes"] or state.hexdigest() != spec["sha256"]:
                raise ValueError(f"Model shard changed while copying: {name}")
        # Detect a reused review ID before writing a new immutable directory.
        prospective = digest(canonical({"schemaVersion": 1, "provenance": provenance, "assets": files(staging)}))
        prior = next((entry for entry in entries if entry["reviewId"] == review_id), None)
        if prior and prior["snapshotId"] != prospective:
            raise ValueError("Review ID already identifies a different snapshot; use a new review ID")
        target = publish(staging, output / "snapshots", provenance)
    entry = {"reviewId": review_id, "snapshotId": target.name, "status": status, "title": story["title"]}
    for key, value in (("reason", reason), ("replacementReviewId", replacement_review_id), ("reviewers", list(reviewers)), ("reviewedOn", reviewed_on), ("outcome", outcome)):
        if value:
            entry[key] = value
        elif prior and key in prior:
            entry[key] = prior[key]
    entries = [entry if old["reviewId"] == review_id else old for old in entries] if prior else [*entries, entry]
    write_catalog(output / "catalog.json", entries, output / "snapshots")
    (output / "index.html").write_text(catalog_home(entries), encoding="utf-8")
    (output / ".nojekyll").touch()
    return target


def update_catalog(*, output, review_id, status, reason=None, replacement_review_id=None,
                   reviewers=(), reviewed_on=None, outcome=None):
    output = Path(output)
    entries = read_json(output / "catalog.json")["reviews"]
    entry = next((entry for entry in entries if entry["reviewId"] == review_id), None)
    if entry is None:
        raise ValueError("Review ID is not in the catalog")
    entry["status"] = status
    for key, value in (("reason", reason), ("replacementReviewId", replacement_review_id),
                       ("reviewers", list(reviewers)), ("reviewedOn", reviewed_on), ("outcome", outcome)):
        if value:
            entry[key] = value
    if status != "superseded":
        entry.pop("replacementReviewId", None)
    if status not in {"superseded", "withdrawn"}:
        entry.pop("reason", None)
    write_catalog(output / "catalog.json", entries, output / "snapshots")
    (output / "index.html").write_text(catalog_home(entries), encoding="utf-8")
    return output / "snapshots" / entry["snapshotId"]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for name in ("output", "review-id"):
        parser.add_argument("--" + name, required=True)
    for name in ("bundle", "story", "browser", "assets"):
        parser.add_argument("--" + name)
    parser.add_argument("--status", choices=["draft", "current", "superseded", "withdrawn"], default="draft")
    for name in ("title", "model-root", "native-binary", "reason", "replacement-review-id", "reviewed-on", "outcome"):
        parser.add_argument("--" + name)
    parser.add_argument("--reviewer", action="append", default=[])
    parser.add_argument("--development", action="store_true")
    parser.add_argument("--catalog-only", action="store_true", help="Update lifecycle metadata of an existing frozen review")
    args = vars(parser.parse_args())
    catalog_only = args.pop("catalog_only")
    args["reviewers"] = args.pop("reviewer")
    try:
        if catalog_only:
            unused = {"bundle", "story", "browser", "assets", "title", "model_root", "native_binary", "development"}
            if any(args[name] for name in unused):
                raise ValueError("Catalog-only update does not accept build inputs")
            print(update_catalog(**{key: value for key, value in args.items() if key not in unused}))
        else:
            if any(not args[name] for name in ("bundle", "story", "browser", "assets")):
                raise ValueError("Assembly requires --bundle, --story, --browser and --assets")
            args["bundle_path"] = args.pop("bundle")
            args["story_path"] = args.pop("story")
            print(assemble(**args))
    except (ValueError, OSError, KeyError, TypeError, subprocess.CalledProcessError) as error:
        parser.exit(1, str(error) + "\n")


if __name__ == "__main__":
    main()
