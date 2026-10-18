"""Lossless native-index sharding from an already exported in-memory bundle."""
import gzip
import hashlib
import json
from pathlib import Path

SCHEMA = "syspresent.model-shards.v1"


def bucket_for(identity):
    return hashlib.sha256(identity.encode("utf-8")).hexdigest()[:2]


def summary(element):
    return {**{key: element[key] for key in ("id", "name", "kind", "qualifiedName", "owner") if key in element}, "exported": True}


def shard_bundle(bundle, output_dir):
    """Write deterministic shards without reparsing or copying the large raw export.

    Every original element and relationship is retained in incident-node blocks.
    Unexported endpoints get an explicit summary, never an invented model element.
    """
    output = Path(output_dir)
    (output / "model").mkdir(parents=True, exist_ok=True)
    elements = bundle["elements"]
    if isinstance(elements, dict):
        elements = elements.values()
    index = {}
    buckets = {}
    for element in elements:
        identity = element["id"]
        if identity in index:
            raise ValueError(f"Duplicate element identity: {identity}")
        index[identity] = element
        buckets.setdefault(bucket_for(identity), []).append(identity)
    incident = {identity: [] for identity in index}
    edge_ids = set()
    orphan_edges = []
    for edge in bundle.get("relationships", []):
        if edge["id"] in edge_ids:
            raise ValueError(f"Duplicate relationship identity: {edge['id']}")
        edge_ids.add(edge["id"])
        endpoints = {edge["source"], edge["target"]}
        known = endpoints & index.keys()
        if not known:
            # Preserve otherwise unreachable relationships in their own manifest shard.
            orphan_edges.append(edge)
        for identity in known:
            incident[identity].append(edge)
    encoder = json.JSONEncoder(ensure_ascii=False, sort_keys=True, separators=(",", ":"), allow_nan=False)
    manifest = {}

    def write(name, payload):
        path = output / "model" / (name + ".json.gz")
        with path.open("wb") as stream:
            with gzip.GzipFile(filename="", fileobj=stream, mode="wb", mtime=0, compresslevel=6) as compressed:
                pending, size = [], 0
                for chunk in encoder.iterencode(payload):
                    pending.append(chunk)
                    size += len(chunk)
                    if size >= 65536:
                        compressed.write("".join(pending).encode("utf-8"))
                        pending, size = [], 0
                if pending:
                    compressed.write("".join(pending).encode("utf-8"))
        digest = hashlib.sha256()
        with path.open("rb") as stream:
            for chunk in iter(lambda: stream.read(1024 * 1024), b""):
                digest.update(chunk)
        manifest[name] = {"path": f"model/{name}.json.gz", "sha256": digest.hexdigest(), "bytes": path.stat().st_size}

    for bucket, identities in sorted(buckets.items()):
        blocks = {}
        for identity in sorted(identities):
            neighbors = set()
            for edge in incident[identity]:
                neighbors.update((edge["source"], edge["target"]))
            neighbors.discard(identity)
            blocks[identity] = {"element": index[identity], "relationships": incident[identity],
                                "neighbors": [summary(index[target]) if target in index else {"id": target, "exported": False}
                                              for target in sorted(neighbors)]}
        write(bucket, {"schemaVersion": SCHEMA, "bucket": bucket, "nodes": blocks})
    if orphan_edges:
        write("unresolved", {"schemaVersion": SCHEMA, "relationships": orphan_edges})
    views = bundle.get("views", [])
    view_list = views.values() if isinstance(views, dict) else views
    initial_ids = {identity for view in view_list for identity in view.get("elementIds", [])}
    main = {key: value for key, value in bundle.items() if key not in {"elements", "relationships", "nativeApi", "nativeQueries"}}
    main["elements"] = [index[identity] for identity in sorted(initial_ids) if identity in index]
    main["relationships"] = [edge for edge in bundle.get("relationships", []) if edge.get("authority") == "native-render-view"]
    # Search declarations, not anonymous generated API objects. Query-only library
    # records are declarations explicitly requested from native scope queries.
    main["searchIndex"] = [summary(element) for element in index.values()
                           if element.get("native", {}).get("declaredName")
                           or (element.get("coverage") == "native-query-details-only" and element.get("name") and element["name"] != element["id"])]
    main["modelStore"] = {"schemaVersion": SCHEMA, "addressing": "sha256-utf8-first2", "shards": manifest,
                           "statistics": {"elements": len(index), "relationships": len(edge_ids),
                                          "unresolvedRelationships": len(orphan_edges)},
                           "elementKinds": sorted({element["kind"] for element in index.values() if element.get("kind")}),
                           "relationshipKinds": sorted({edge["kind"] for edge in bundle.get("relationships", []) if edge.get("kind")}),
                           "initialNeighborhoodsLoaded": False}
    with (output / "bundle.json").open("w", encoding="utf-8") as stream:
        for chunk in encoder.iterencode(main):
            stream.write(chunk)
    return main
