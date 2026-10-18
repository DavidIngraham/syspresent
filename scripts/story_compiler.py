"""Compile declarative Markdown stories against a pre-exported native bundle.

No SysML parsing, model evaluation, HTML rendering, or author code execution.
"""
from __future__ import annotations

import argparse
import json
import math
from pathlib import Path
import re
from fractions import Fraction
from urllib.parse import quote, unquote


class StoryError(ValueError):
    """A publication-blocking source diagnostic."""


UNITS = {
    "1": ("dimensionless", 1), "%": ("dimensionless", .01),
    "m": ("length", 1), "cm": ("length", .01), "mm": ("length", .001),
    "km": ("length", 1000), "s": ("time", 1), "ms": ("time", .001),
    "min": ("time", 60), "h": ("time", 3600),
    "kg": ("mass", 1), "g": ("mass", .001),
    "W": ("power", 1), "kW": ("power", 1000),
    "Wh": ("energy", 1), "kWh": ("energy", 1000),
    "m/s": ("speed", 1), "km/h": ("speed", 1 / 3.6),
}
TOKEN = re.compile(r"\{\{model\s+(\{.*?\})\s*\}\}", re.DOTALL)
ID = re.compile(r"^[A-Za-z][A-Za-z0-9_.:-]*$")
FORMAT = re.compile(r"^\.(?:[0-9]|1[0-2])[feg]$")

# Canonical reduction for the pinned OMG SI library: its mass base is gram.
# This is an allowlist check on native results, not a model unit evaluator.
BASE_FACTORS = {
    "dimensionless": {}, "length": {"SI::metre": 1}, "time": {"SI::second": 1},
    "mass": {"SI::gram": 1},
    "power": {"SI::gram": 1, "SI::metre": 2, "SI::second": -3},
    "energy": {"SI::gram": 1, "SI::metre": 2, "SI::second": -2},
    "speed": {"SI::metre": 1, "SI::second": -1},
}
CANONICAL_SCALES = {
    "1": Fraction(1), "%": Fraction(1, 100),
    "m": Fraction(1), "cm": Fraction(1, 100), "mm": Fraction(1, 1000), "km": Fraction(1000),
    "s": Fraction(1), "ms": Fraction(1, 1000), "min": Fraction(60), "h": Fraction(3600),
    "g": Fraction(1), "kg": Fraction(1000), "W": Fraction(1000), "kW": Fraction(1000000),
    "Wh": Fraction(3600000), "kWh": Fraction(3600000000),
    "m/s": Fraction(1), "km/h": Fraction(5, 18),
}


def validate_native_unit(record):
    """Reject a display spelling whose native canonical reduction differs."""
    source = record.get("source")
    required = isinstance(source, dict) and "nativeEvaluation" in source
    if not required and "nativeUnit" not in record:
        return
    unit = record.get("nativeUnit")
    if not isinstance(unit, dict) or unit.get("reduction_given") is not True:
        raise ValueError("native numeric value requires an explicit canonical unit reduction")
    if set(unit) - {"text", "scale_num", "scale_den", "factors", "reduction_given"}:
        raise ValueError("unknown native unit reduction fields")
    name = record.get("unit")
    if not isinstance(name, str) or name not in CANONICAL_SCALES:
        raise ValueError("native source unit is not allowlisted")
    numerator, denominator = unit.get("scale_num"), unit.get("scale_den")
    for value in (numerator, denominator):
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value) or value <= 0:
            raise ValueError("native unit reduction requires positive finite scale")
    scale = Fraction(str(numerator)) / Fraction(str(denominator))
    factors = unit.get("factors")
    if not isinstance(factors, (list, tuple)):
        raise ValueError("native unit factors must be an explicit sequence")
    actual = {}
    for factor in factors:
        if not isinstance(factor, dict) or set(factor) != {"unit_id", "exponent"}:
            raise ValueError("unknown native unit factor form")
        identity, exponent = factor["unit_id"], factor["exponent"]
        if not isinstance(identity, str) or identity in actual:
            raise ValueError("duplicate or invalid native base unit")
        if isinstance(exponent, bool) or not isinstance(exponent, (int, float)) or not math.isfinite(exponent) or exponent == 0:
            raise ValueError("native unit exponent must be finite and nonzero")
        actual[identity] = exponent
    expected = BASE_FACTORS[UNITS[name][0]]
    if actual != expected or scale != CANONICAL_SCALES[name]:
        raise ValueError("native canonical unit reduction disagrees with source unit spelling")


def _json(text):
    def pairs(items):
        result = {}
        for key, value in items:
            if key in result:
                raise ValueError(f"duplicate JSON key {key!r}")
            result[key] = value
        return result
    def constant(value):
        raise ValueError(f"nonfinite JSON number {value}")
    return json.loads(text, object_pairs_hook=pairs, parse_constant=constant)


def compile_story(markdown, bundle, asset_root, source="story.md"):
    """Return JSON-compatible ordered content, stops and substitution provenance."""
    def fail(line, message):
        raise StoryError(f"{source}:{line}: {message}")

    if not isinstance(bundle, dict) or bundle.get("schemaVersion") != "syspresent.bundle.v1":
        fail(1, "incompatible bundle schemaVersion")

    def index(name):
        rows = bundle.get(name, [])
        if isinstance(rows, dict):
            rows = list(rows.values())
        if not isinstance(rows, list):
            fail(1, f"bundle {name} must be a list or id-keyed mapping")
        out = {}
        for row in rows:
            if not isinstance(row, dict) or not isinstance(row.get("id"), str):
                fail(1, f"bundle {name} entry needs an id")
            if row["id"] in out:
                fail(1, f"duplicate {name} id {row['id']}")
            out[row["id"]] = row
        return out

    elements, views = index("elements"), index("views")
    for view in views.values():
        members = view.get("elementIds")
        if not isinstance(members, list) or any(not isinstance(x, str) or x not in elements for x in members):
            fail(1, f"view {view['id']} needs exported semantic elementIds")
    records = {}
    raw_records = bundle.get("records", [])
    if not isinstance(raw_records, list):
        fail(1, "bundle records must be a list")
    for record in raw_records:
        if not isinstance(record, dict) or not isinstance(record.get("ref"), str):
            fail(1, "invalid model record")
        if record.get("context") is not None and not isinstance(record["context"], str):
            fail(1, "record context must be text")
        key = record["ref"], record.get("context")
        if key in records:
            fail(1, f"duplicate model record {key}")
        records[key] = record
    substitutions = []

    def text(value, line):
        if not isinstance(value, str) or not value.strip():
            fail(line, "expected nonempty text")
        def replace(match):
            at = line + value[:match.start()].count("\n")
            try:
                spec = _json(match.group(1))
            except ValueError as exc:
                fail(at, f"invalid substitution JSON: {exc}")
            if not isinstance(spec, dict) or set(spec) - {"ref", "context", "type", "format", "unit"}:
                fail(at, "substitution contains unsupported fields")
            ref = spec.get("ref")
            if not isinstance(ref, str) or "::" not in ref:
                fail(at, "substitution requires fully qualified ref")
            if "context" in spec and (not isinstance(spec["context"], str) or not spec["context"]):
                fail(at, "context must identify an exported record")
            record = records.get((ref, spec.get("context")))
            if record is None:
                fail(at, f"unresolved model record or context: {ref}")
            if record.get("contextRequired") and not spec.get("context"):
                fail(at, f"explicit context required: {ref}")
            kind = spec.get("type")
            if not isinstance(kind, str) or kind not in ("text", "number", "boolean", "enum") or record.get("type") != kind:
                fail(at, "substitution type mismatch")
            if not record.get("source"):
                fail(at, "model record lacks native source provenance")
            if kind in ("text", "enum", "boolean"):
                if spec.get("format") != "text" or "unit" in spec:
                    fail(at, "nonnumeric substitution requires format=text and no unit")
            else:
                if not isinstance(spec.get("format"), str) or not FORMAT.fullmatch(spec["format"]):
                    fail(at, "number requires explicit .0f through .12f/e/g format")
                old, new = record.get("unit"), spec.get("unit")
                if not isinstance(old, str) or not isinstance(new, str) or old not in UNITS or new not in UNITS or UNITS[old][0] != UNITS[new][0]:
                    fail(at, "unknown or incompatible unit conversion")
                try:
                    validate_native_unit(record)
                except ValueError as exc:
                    fail(at, str(exc))
            status = record.get("status")
            if status in ("unknown", "unassessed"):
                rendered = f"[{status}]"
            elif status != "known":
                fail(at, "model record status must be known, unknown or unassessed")
            elif kind in ("text", "enum"):
                rendered = record.get("value")
                if not isinstance(rendered, str) or not rendered:
                    fail(at, "known text record requires nonempty value")
                if kind == "enum" and (not isinstance(record.get("choices"), list) or rendered not in record["choices"]):
                    fail(at, "enum value absent from exported choices")
            elif kind == "boolean":
                if not isinstance(record.get("value"), bool):
                    fail(at, "known boolean record requires boolean value")
                rendered = "true" if record["value"] else "false"
            else:
                number = record.get("value")
                if isinstance(number, bool) or not isinstance(number, (int, float)) or not math.isfinite(number):
                    fail(at, "known numeric record requires finite number")
                number = number * UNITS[old][1] / UNITS[new][1]
                if not math.isfinite(number):
                    fail(at, "unit conversion overflow")
                rendered = format(number, spec["format"]) + ("" if new == "1" else " " + new)
            substitutions.append({"reference": ref, "context": spec.get("context"), "status": status,
                                  "rendered": rendered, "source": record["source"], "line": at,
                                  "reason": record.get("reason")})
            return rendered
        result = TOKEN.sub(replace, value)
        if "{{" in result or "}}" in result:
            fail(line, "unsupported or malformed template expression")
        return result

    model_links = []

    def prose_links(value, line):
        """Resolve only authored Markdown links outside code; native IDs stay opaque."""
        fence = None
        output = []
        link = re.compile(r"(?<!!)\[([^\]\n]+)\]\(model:([^\s)]*)\)")
        for offset, row in enumerate(value.splitlines(keepends=True)):
            stripped = row.strip()
            opening = re.match(r"^(`{3,}|~{3,})(.*)$", stripped)
            if fence:
                if re.fullmatch(re.escape(fence[0]) + '{' + str(len(fence)) + ',}', stripped):
                    fence = None
                output.append(row)
                continue
            if opening:
                fence = opening.group(1)
                output.append(row)
                continue
            # Inline code remains literal, including examples of model links.
            chunks = re.split(r"(`+[^`]*`+)", row)
            for index in range(0, len(chunks), 2):
                def replace(match):
                    raw = match.group(2)
                    if not raw or re.search(r"%(?![0-9A-Fa-f]{2})", raw):
                        fail(line + offset, "invalid model link target encoding")
                    try:
                        target = unquote(raw, errors="strict")
                    except UnicodeError:
                        fail(line + offset, "invalid model link target encoding")
                    candidates = {identity for identity, element in elements.items()
                                  if element.get("exported") is not False
                                  and (identity == target or element.get("qualifiedName") == target)}
                    if len(candidates) != 1:
                        fail(line + offset, f"{'ambiguous' if candidates else 'missing'} model link target {target!r}")
                    identity = next(iter(candidates))
                    model_links.append({"target": identity, "reference": target, "line": line + offset})
                    return f"[{match.group(1)}](model:{quote(identity, safe='')})"
                chunks[index] = link.sub(replace, chunks[index])
            output.append("".join(chunks))
        return "".join(output)

    seen = set()
    blocks, stops = [], []
    root = Path(asset_root).resolve()

    def semantic(identity, line, view=None):
        if not isinstance(identity, str) or identity not in elements:
            fail(line, f"missing semantic element {identity!r}")
        if view is not None and identity not in view.get("elementIds", []):
            fail(line, f"element {identity} absent from authored view")
        return identity

    def number(value, line):
        if isinstance(value, bool) or not isinstance(value, (int, float)) or not math.isfinite(value):
            fail(line, "camera/placement coordinates must be finite numbers")

    def evidence_metadata(value, line):
        if not isinstance(value, dict) or set(value) - {"classification", "source", "runId", "configuration", "inputs"}:
            fail(line, "invalid evidence metadata fields")
        classification = value.get("classification")
        if classification not in ("recorded-execution", "prepared-analysis"):
            fail(line, "evidence classification must be recorded-execution or prepared-analysis")
        required = {"classification", "source", "configuration", "inputs"}
        if classification == "recorded-execution":
            required.add("runId")
        if not required <= set(value):
            fail(line, "evidence requires source, configuration, inputs and recorded execution runId")
        for field in ("source", "configuration") + (("runId",) if "runId" in value else ()):
            item = value[field]
            if not isinstance(item, str) or not item.strip() or len(item) > 4096 or any(ord(c) < 32 or ord(c) == 127 for c in item):
                fail(line, f"evidence {field} requires bounded nonempty identity text")
        if not isinstance(value["inputs"], dict):
            fail(line, "evidence inputs must be an explicit object (empty if no inputs)")
        count = 0
        def checked(item, depth=0):
            nonlocal count
            count += 1
            if depth > 8 or count > 1000:
                fail(line, "evidence inputs exceed nesting or value limit")
            if item is None or type(item) is bool:
                return
            if type(item) in (int, float):
                if (type(item) is int and abs(item) > 9007199254740991) or not math.isfinite(item):
                    fail(line, "evidence inputs require finite numbers and browser-safe integers")
                return
            if isinstance(item, str):
                if len(item) > 8192 or any(ord(c) < 32 or ord(c) == 127 for c in item):
                    fail(line, "evidence input string exceeds bounds")
                return
            if isinstance(item, list):
                for child in item:
                    checked(child, depth + 1)
                return
            if isinstance(item, dict):
                for key, child in item.items():
                    if not isinstance(key, str) or not key or len(key) > 256 or any(ord(c) < 32 or ord(c) == 127 for c in key):
                        fail(line, "evidence input keys require bounded nonempty text")
                    checked(child, depth + 1)
                return
            fail(line, "evidence inputs must be typed JSON data")
        checked(value["inputs"])
        if len(json.dumps(value, ensure_ascii=False).encode("utf-8")) > 65536:
            fail(line, "evidence metadata exceeds byte limit")
        return json.loads(json.dumps(value, allow_nan=False))

    def block(data, line):
        if not isinstance(data, dict):
            fail(line, "syspresent block must be an object")
        kind = data.get("type")
        common = {"type", "id", "title"}
        fields = {"stop": {"view", "focus", "annotations", "camera", "placements", "speakerNotes", "modelRefs"},
                  "figure": {"asset", "alt", "caption", "provenance", "fullWidth", "evidence"},
                  "table": {"asset", "caption", "provenance", "fullWidth", "evidence"},
                  "closing": {"supports", "open", "next", "modelRefs"}}
        if not isinstance(kind, str) or kind not in fields or set(data) - common - fields[kind]:
            fail(line, "unknown block type or fields")
        ident = data.get("id")
        if not isinstance(ident, str) or not ID.fullmatch(ident) or ident in seen:
            fail(line, "invalid or duplicate story id")
        seen.add(ident)
        result = {"type": kind, "id": ident, "title": text(data.get("title"), line),
                  "location": {"source": source, "line": line}}
        if "modelRefs" in data:
            if not isinstance(data["modelRefs"], list):
                fail(line, "modelRefs must be semantic identities")
            result["modelRefs"] = [semantic(x, line) for x in data["modelRefs"]]
        if kind == "stop":
            view = None
            if "view" in data:
                if not isinstance(data["view"], str) or data["view"] not in views:
                    fail(line, "missing native view")
                result["view"] = data["view"]
                view = views[data["view"]]
            if "focus" in data:
                result["focus"] = semantic(data["focus"], line, view)
            for field in ("annotations", "placements"):
                if field not in data:
                    continue
                if view is None or not isinstance(data[field], list):
                    fail(line, f"{field} requires an authored view and list")
                items, targets = [], set()
                for item in data[field]:
                    allowed = {"target", "text"} if field == "annotations" else {"target", "x", "y"}
                    if not isinstance(item, dict) or set(item) != allowed:
                        fail(line, f"invalid {field} entry")
                    target = semantic(item["target"], line, view)
                    if target in targets:
                        fail(line, f"duplicate {field} target")
                    targets.add(target)
                    if field == "annotations":
                        items.append({"target": target, "text": text(item["text"], line)})
                    else:
                        number(item["x"], line); number(item["y"], line)
                        items.append(dict(item))
                result[field] = items
            if "camera" in data:
                camera = data["camera"]
                if view is None or not isinstance(camera, dict) or set(camera) != {"target", "zoom"}:
                    fail(line, "camera requires view, semantic target and zoom")
                semantic(camera["target"], line, view); number(camera["zoom"], line)
                if camera["zoom"] <= 0:
                    fail(line, "camera zoom must be positive")
                result["camera"] = dict(camera)
            if "speakerNotes" in data:
                result["speakerNotes"] = text(data["speakerNotes"], line)
            stops.append(ident)
        elif kind in ("figure", "table"):
            if "evidence" in data:
                result["evidence"] = evidence_metadata(data["evidence"], line)
            if "fullWidth" in data:
                if not isinstance(data["fullWidth"], bool):
                    fail(line, "fullWidth must be a boolean")
                result["fullWidth"] = data["fullWidth"]
            asset = data.get("asset")
            if not isinstance(asset, str) or not asset or "\\" in asset or ":" in asset:
                fail(line, "asset must be a relative local path")
            path = (root / asset).resolve()
            if not path.is_relative_to(root) or not path.is_file():
                fail(line, "missing asset or asset outside bundle root")
            if Path(asset).is_absolute():
                fail(line, "absolute asset paths prohibited")
            provenance = data.get("provenance")
            if not isinstance(provenance, dict) or set(provenance) != {"source", "context"}:
                fail(line, "evidence requires source and context provenance")
            result.update(asset=asset, provenance={k: text(v, line) for k, v in provenance.items()},
                          caption=text(data.get("caption"), line))
            if kind == "figure":
                result["alt"] = text(data.get("alt"), line)
        else:
            for field in ("supports", "open", "next"):
                result[field] = text(data.get(field), line)
        blocks.append(result)

    lines = markdown.splitlines(keepends=True)
    prose, prose_line, i, ordinary_fence = [], 1, 0, None
    def flush():
        if "".join(prose).strip():
            blocks.append({"type": "markdown", "text": text(prose_links("".join(prose), prose_line), prose_line),
                           "location": {"source": source, "line": prose_line}})
        prose.clear()
    while i < len(lines):
        stripped = lines[i].strip()
        if ordinary_fence:
            if re.fullmatch(re.escape(ordinary_fence[0]) + '{' + str(len(ordinary_fence)) + ',}', stripped):
                ordinary_fence = None
            prose.append(lines[i]); i += 1
            continue
        opening = re.match(r"^(`{3,}|~{3,})(.*)$", stripped)
        if opening and stripped != "```syspresent":
            ordinary_fence = opening.group(1)
            prose.append(lines[i]); i += 1
            continue
        if lines[i].strip() == "```syspresent":
            flush(); start = i + 1; i += 1; payload = []
            while i < len(lines) and lines[i].strip() != "```":
                payload.append(lines[i]); i += 1
            if i == len(lines):
                fail(start, "unterminated syspresent fence")
            try:
                data = _json("".join(payload))
            except ValueError as exc:
                fail(start + getattr(exc, "lineno", 1), f"invalid block JSON: {exc}")
            block(data, start); i += 1; prose_line = i + 1
        else:
            prose.append(lines[i]); i += 1
    flush()
    if not stops:
        fail(1, "story requires at least one stop")
    closings = [b for b in blocks if b["type"] == "closing"]
    if len(closings) != 1 or blocks[-1]["type"] != "closing":
        fail(len(lines) or 1, "story must end with exactly one closing argument")
    return {"schemaVersion": "syspresent.story.v1", "source": source, "stops": stops,
            "blocks": blocks, "substitutions": substitutions, "modelLinks": model_links}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    for arg in ("story", "bundle", "assets", "output"):
        parser.add_argument("--" + arg, required=True)
    args = parser.parse_args()
    try:
        story = Path(args.story).read_text(encoding="utf-8")
        bundle = _json(Path(args.bundle).read_text(encoding="utf-8"))
        result = compile_story(story, bundle, args.assets, args.story)
        Path(args.output).write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    except (StoryError, ValueError, OSError) as exc:
        parser.exit(1, str(exc) + "\n")


if __name__ == "__main__":
    main()
