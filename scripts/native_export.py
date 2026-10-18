"""Adapt native conversion/query/render data without parsing SysML or guessing graph semantics."""
import argparse
from dataclasses import asdict, is_dataclass
import hashlib
from fractions import Fraction
import json
import os
import subprocess
from pathlib import Path

SCHEMA = "syspresent.bundle.v1"


def references(value):
    if isinstance(value, dict) and isinstance(value.get("@id"), str):
        return [value["@id"]]
    if isinstance(value, list):
        return [target for item in value for target in references(item)]
    return []


def build_index(raw, queried, library_ids=(), project_ids=None):
    """Retain every native API reference; no type/relationship inference from labels."""
    project_ids = {item["@id"] for item in raw if "sysx:sourceLine" in item} if project_ids is None else set(project_ids)
    library_ids = set(library_ids)
    def owner(identity):
        return "project" if identity in project_ids else "library" if identity in library_ids else "external"
    properties = {entry["properties"]["elementId"]: entry for entry in queried if entry["properties"].get("elementId")}
    elements, relationships = [], []
    seen = set()
    for item in raw:
        identity = item["@id"]
        if identity in seen:
            raise ValueError(f"Duplicate native identity: {identity}")
        seen.add(identity)
        query = properties.get(identity, {}).get("properties", {})
        elements.append({
            "id": identity, "qualifiedName": item.get("qualifiedName", query.get("qualifiedName", "")),
            "name": item.get("declaredName", query.get("name", identity)),
            "kind": item["@type"], "description": query.get("documentation", item.get("body", "")),
            "owner": owner(identity), "source": {key: value for key, value in item.items() if key.startswith("sysx:source")},
            "native": item,
        })
        for property_name, value in item.items():
            if property_name.startswith("@"): continue
            for ordinal, target in enumerate(references(value)):
                relationships.append({"id": f"api:{identity}:{property_name}:{ordinal}", "source": identity,
                    "target": target, "kind": property_name, "label": property_name,
                    "authority": "native-api-property", "nativeProperty": property_name})
    # Explicitly requested library scope results supply identity and details. Their
    # scalar Query projection is not misrepresented as a full relationship export.
    for identity, entry in properties.items():
        if identity in seen: continue
        query = entry["properties"]
        elements.append({"id": identity, "qualifiedName": query.get("qualifiedName", entry["id"]),
            "name": query.get("name", entry["id"]), "kind": entry["type"], "description": query.get("documentation", ""),
            "owner": owner(identity), "source": {}, "coverage": "native-query-details-only"})
    known = {element["id"] for element in elements}
    return elements, relationships, sorted({edge["target"] for edge in relationships if edge["target"] not in known})


def merge_library_shard(by_id, library_raw, library_ids):
    """Merge native declarations, keeping ownership independent of deduplication."""
    for item in library_raw:
        identity = item["@id"]
        new_full = "sysx:sourceLine" in item
        if new_full:
            library_ids.add(identity)
        if identity in by_id:
            if by_id[identity] == item:
                continue
            old_full = "sysx:sourceLine" in by_id[identity]
            if old_full and new_full:
                raise ValueError(f"Conflicting native declaration across shards: {identity}")
            if old_full or not new_full:
                continue
        by_id[identity] = item


def adapt_view(view_id, payload):
    mappings = {}
    for node in payload.get("nodes", []):
        identity = node.get("semantic_id") or node.get("semanticId")
        mappings[node["id"]] = identity or None
    identity_coverage = {"unmappedNodes": [], "syntheticNodes": [], "unmappedEdges": [], "unmappedRows": []}
    row_mappings = {}
    for index, row in enumerate(payload.get("rows", [])):
        identity = row.get("semantic_id") or row.get("semanticId")
        row_mappings[str(index)] = identity or None
        if not identity:
            identity_coverage["unmappedRows"].append(str(index))
    for node in payload.get("nodes", []):
        if mappings[node["id"]]: continue
        status = node.get("identity_status", node.get("identityStatus", "unmapped"))
        identity_coverage["syntheticNodes" if status == "synthetic" else "unmappedNodes"].append(node["id"])
    edges = []
    for ordinal, edge in enumerate(payload.get("edges", [])):
        source = mappings.get(edge.get("from_id", edge.get("from")))
        target = mappings.get(edge.get("to_id", edge.get("to")))
        if not source or not target:
            identity_coverage["unmappedEdges"].append({"index": ordinal, "from": edge.get("from_id", edge.get("from")), "to": edge.get("to_id", edge.get("to")), "reason": "endpoint lacks semantic identity; retained in native drawing"})
        if source and target:
            edges.append({"id": f"view:{view_id}:{ordinal}", "source": source, "target": target,
                "kind": edge["kind"], "label": edge.get("label", ""), "authority": "native-render-view", "view": view_id})
    return {"id": view_id, "kind": payload["kind"], "elementIds": sorted({value for value in [*mappings.values(), *row_mappings.values()] if value}),
        "rowToElement": row_mappings, "nodeToElement": mappings, "identityCoverage": identity_coverage, "native": payload, "behaviorEvidence": "modeled-possibility"}, edges


def typed_value(value):
    if is_dataclass(value):
        return {"nativeType": type(value).__name__, **{key: typed_value(item) for key, item in asdict(value).items()}}
    if isinstance(value, dict): return {key: typed_value(item) for key, item in value.items()}
    if isinstance(value, (tuple, list)): return [typed_value(item) for item in value]
    if isinstance(value, Fraction): return {"nativeType": "Rational", "numerator": value.numerator, "denominator": value.denominator}
    if value is None or isinstance(value, (str, bool, int, float)): return value
    raise ValueError(f"Unsupported native query value: {type(value).__name__}")


def query_view(spec, result, elements):
    by_name = {}
    for element in elements:
        name = element["qualifiedName"]
        if not name: continue
        if name in by_name and by_name[name] != element["id"]:
            raise ValueError(f"Ambiguous native qualified name in query mapping: {name}")
        by_name[name] = element["id"]
    rows, mapping = [], {}
    for index, row in enumerate(result.rows):
        mapping[str(index)] = by_name.get(row.element.id)
        cells = []
        for cell in row.cells:
            if not cell: cells.append("[no value]")
            else: cells.append("; ".join(str(value).lower() if isinstance(value, bool) else str(value) for value in cell))
        rows.append({"cells": cells})
    return {"id": spec["id"], "kind": "table", "elementIds": sorted({value for value in mapping.values() if value}),
        "rowToElement": mapping, "nodeToElement": {},
        "identityCoverage": {"unmappedNodes": [], "syntheticNodes": [], "unmappedEdges": [],
            "unmappedRows": [key for key, identity in mapping.items() if identity is None]},
        "native": {"kind": "table", "columns": list(result.columns), "rows": rows,
            "notices": ["Prepared native document query; table membership and values come from the model. This is not physical verification."]},
        "query": {"id": spec["native"], "result": typed_value(result)}, "asset": spec.get("asset"),
        "behaviorEvidence": "model-query"}


def value_record(request, value):
    import math
    from opensysml.values import Quantity
    record = {"ref": request["ref"], "context": request["context"], "contextRequired": True,
        "status": "known", "source": {"nativeEvaluation": request["ref"], "evaluationMode": "bound-attribute", "contextLabel": request["context"], "context": request["context"], "inputs": request.get("inputs", {})}}
    if isinstance(value, bool): record.update(type="boolean", value=value)
    elif isinstance(value, Quantity): record.update(type="number", value=float(value.magnitude), unit=value.unit.text, nativeUnit=asdict(value.unit))
    elif isinstance(value, (int, float)): record.update(type="number", value=value, unit="1",
        nativeUnit={"text": "1", "scale_num": 1.0, "scale_den": 1.0, "factors": [], "reduction_given": True})
    elif isinstance(value, str): record.update(type="text", value=value)
    else: raise ValueError(f"Unsupported native value for {request['ref']}: {type(value).__name__}")
    if record["type"] == "number" and not math.isfinite(record["value"]):
        raise ValueError("Nonfinite native value cannot fill prose")
    return record


def export(config, root):
    import opensysml
    root = Path(root)
    binary = Path(os.environ.get("OPENSYSML_BINARY", ""))
    if not binary.is_file():
        raise ValueError("OPENSYSML_BINARY must explicitly identify the pinned service")
    version = subprocess.run([str(binary), "--version"], check=True, capture_output=True, text=True).stdout
    revision = config["nativeToolRevision"]
    if f"commit: {revision}" not in version.splitlines():
        raise ValueError("Running native tool does not match configured revision")
    binary_digest = hashlib.sha256(binary.read_bytes()).hexdigest()
    sources = [root / path for path in config["sources"]]
    source_files = sorted({path.resolve() for source in sources for path in (source.rglob("*") if source.is_dir() else [source]) if path.suffix in {".sysml", ".kerml"}})
    if not source_files:
        raise ValueError("No SysML or KerML sources configured")
    source_bytes = {path: path.read_bytes() for path in source_files}
    from opensysml.sources import SourceDocument
    documents = [SourceDocument.inline(str(path), data.decode("utf-8"), language="kerml" if path.suffix == ".kerml" else "sysml") for path, data in source_bytes.items()]
    model = opensysml.connect().parse_sources(documents)
    if not model.ok:
        raise ValueError("Native model validation failed: " + "; ".join(str(d) for d in model.diagnostics))
    raw = json.loads(str(model.to_api_json()))
    selects = ["elementId", "name", "qualifiedName", "documentation"]
    queried = [asdict(e) for e in model.query(select=selects)]
    project_ids = {item["@id"] for item in raw if "sysx:sourceLine" in item}
    library_ids = set()
    for scope in config.get("libraryScopes", []):
        entries = [asdict(e) for e in model.query(scope=[scope], select=selects)]
        library_ids.update(entry["properties"]["elementId"] for entry in entries if entry["properties"].get("elementId"))
        queried.extend(entries)
    library_hashes = {}
    by_id = {item["@id"]: item for item in raw}
    for library_path in config.get("librarySources", []):
        path = (root / library_path).resolve()
        data = path.read_bytes()
        library_hashes[str(path)] = hashlib.sha256(data).hexdigest()
        library_model = opensysml.connect().parse_sources([SourceDocument.inline(str(path), data.decode("utf-8"), language="kerml" if path.suffix == ".kerml" else "sysml")])
        if not library_model.ok:
            raise ValueError(f"Native library failed validation: {path}")
        library_raw = json.loads(str(library_model.to_api_json()))
        queried.extend(asdict(e) for e in library_model.query(select=selects))
        merge_library_shard(by_id, library_raw, library_ids)
    raw = list(by_id.values())
    elements, relationships, unavailable = build_index(raw, queried, library_ids, project_ids)
    views = []
    for spec in config["views"]:
        # This additive native option is required. Older clients fail explicitly.
        payload = asdict(model.render_view(spec["native"], include_semantic_identity=True))
        view, edges = adapt_view(spec["id"], payload)
        if view["identityCoverage"]["unmappedNodes"]:
            raise ValueError(f"View {spec['id']} has unmapped model nodes: {view['identityCoverage']['unmappedNodes']}")
        views.append(view)
        relationships.extend(edges)
    for spec in config.get("queries", []):
        views.append(query_view(spec, model.run_document_query(spec["native"]), elements))
    try:
        from .configuration import validate_configuration
    except ImportError:
        from configuration import validate_configuration
    configuration = validate_configuration(config.get("exploration", {}), elements, views, relationships)
    records = []
    for element in elements:
        if element["qualifiedName"] and element["description"]:
            records.append({"ref": element["qualifiedName"], "type": "text", "status": "known", "value": element["description"],
                "source": {"nativeQuery": "documentation", "elementId": element["id"]}})
    for request in config.get("values", []):
        if not isinstance(request.get("context"), str) or not request["context"].strip():
            raise ValueError("Native value export requires an explicit configuration/context")
        if request.get("evaluationMode", "bound-attribute") != "bound-attribute":
            raise ValueError("Only bound-attribute evaluation is supported; context is a provenance label, not instance rebinding")
        matches = model.query(scope=[request["ref"]], select=["qualifiedName"])
        exact = [entry for entry in matches if entry.properties.get("qualifiedName") == request["ref"]]
        if len(exact) != 1 or exact[0].type not in {"AttributeUsage", "ReferenceUsage"}:
            raise ValueError(f"Value reference must resolve to one native attribute/reference: {request['ref']}")
        if request.get("inputs"):
            raise ValueError("Analysis inputs require a recorded-result adapter; evaluation will not guess or inject them")
        records.append(value_record(request, model.eval(request["ref"])))
    hashes = {str(path.relative_to(root)) if path.is_relative_to(root) else str(path): hashlib.sha256(data).hexdigest() for path, data in source_bytes.items()}
    return {"schemaVersion": SCHEMA, "elements": elements, "relationships": relationships, "views": views, "records": records,
        "nativeApi": raw, "nativeQueries": queried, "configuration": configuration,
        "coverage": {"project": "native-api-conversion", "libraryScopes": config.get("libraryScopes", []),
            "libraryRelationships": "complete-native-properties-for-configured-shards" if library_hashes else "not-exported", "unavailableTargets": unavailable,
            "notice": "Native API conversion is experimental. Library Query results contain details, not complete library relationships."},
        "provenance": {"nativeToolRevision": revision, "nativeBinarySha256": binary_digest, "nativeVersion": version.strip(), "sourceDigests": hashes, "librarySourceDigests": library_hashes}}


def prepare_assets(bundle, config, root, output_dir):
    """Materialize explicitly configured evidence; never reinterpret native cells.

    Sources are relative to the config root (including explicit sibling paths).
    Destinations are relative to output/assets and may never escape that tree.
    """
    root, output = Path(root).resolve(), Path(output_dir).resolve()
    assets_root = output / "assets"
    if not assets_root.resolve().is_relative_to(output):
        raise ValueError("Assets directory escapes output")
    pending, destinations = [], set()
    hashes, source_hashes = {}, {}

    def destination(name):
        if not isinstance(name, str) or not name or "\\" in name or ":" in name:
            raise ValueError("Asset destination must be a relative path")
        relative = Path(name)
        if relative.is_absolute() or ".." in relative.parts or name.endswith("/"):
            raise ValueError("Asset destination cannot escape output/assets")
        path = assets_root / relative
        if not path.resolve().is_relative_to(assets_root.resolve()) or path == assets_root:
            raise ValueError("Asset destination escapes output/assets")
        key = str(relative)
        if key in destinations:
            raise ValueError(f"Duplicate asset destination: {key}")
        destinations.add(key)
        return path, key

    def source_bytes(name):
        if not isinstance(name, str) or not name or Path(name).is_absolute() or "\\" in name or ":" in name:
            raise ValueError("Prepared source must be relative to config root")
        path = (root / name).resolve()
        if not path.is_file():
            raise ValueError(f"Missing prepared source: {name}")
        data = path.read_bytes()
        source_hashes[name] = hashlib.sha256(data).hexdigest()
        return data

    views = bundle.get("views", [])
    if isinstance(views, dict):
        views = views.values()
    for view in views:
        if view.get("asset") is None:
            continue
        if not view.get("query") or view.get("kind") != "table":
            raise ValueError("Prepared query asset requires a native query table")
        path, name = destination(view["asset"])
        native = view["native"]
        payload = {"columns": native["columns"], "rows": [row["cells"] for row in native["rows"]],
                   "provenance": {"nativeQuery": view["query"]["id"], "viewId": view["id"],
                                  "nativeToolRevision": bundle.get("provenance", {}).get("nativeToolRevision")}}
        data = (json.dumps(payload, ensure_ascii=False, allow_nan=False, indent=2) + "\n").encode("utf-8")
        pending.append((path, name, data, {"nativeQuery": view["query"]["id"]}))
    for spec in config.get("preparedAssets", []):
        if not isinstance(spec, dict) or not {"source", "asset"} <= set(spec) or set(spec) - {"source", "asset", "provenanceSources"}:
            raise ValueError("preparedAssets entries require source and asset")
        path, name = destination(spec["asset"])
        pending.append((path, name, source_bytes(spec["source"]), {"source": spec["source"]}))
        for source in spec.get("provenanceSources", []):
            source_bytes(source)
    for source in config.get("provenanceSources", []):
        source_bytes(source)
    # Validate every path/source before the first write.
    for path, name, data, provenance in pending:
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(data)
        hashes[name] = {"sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data), **provenance}
    bundle.setdefault("provenance", {})["preparedAssets"] = hashes
    bundle["provenance"]["preparedSourceDigests"] = source_hashes
    return hashes


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--config", required=True)
    parser.add_argument("--output", required=True)
    parser.add_argument("--shard", action="store_true", help="Write output directory bundle.json and model shards directly from native export")
    args = parser.parse_args()
    config_path = Path(args.config).resolve()
    config = json.loads(config_path.read_text())
    result = export(config, config_path.parent)
    if args.shard:
        try:
            from scripts.shard_bundle import shard_bundle
        except ModuleNotFoundError:
            from shard_bundle import shard_bundle
        prepare_assets(result, config, config_path.parent, args.output)
        shard_bundle(result, args.output)
        return
    prepare_assets(result, config, config_path.parent, Path(args.output).parent)
    Path(args.output).parent.mkdir(parents=True, exist_ok=True)
    Path(args.output).write_text(json.dumps(result, indent=2) + "\n")


if __name__ == "__main__":
    main()
