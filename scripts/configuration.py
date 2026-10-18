"""Validate declarative viewer configuration without interpreting native semantics."""
from copy import deepcopy
import math


def validate_configuration(configuration, elements, views, relationships=()):
    """Return a normalized independent copy; raise ValueError on invalid input.

    elements/views accept lists or ID-keyed mappings. Filter names are opaque
    native names: an absent kind is permitted for reusable cross-snapshot config.
    relationships is accepted for callers with a full export, not used to invent
    or normalize semantic kinds.
    """
    def fail(path, message):
        raise ValueError(f"configuration.{path}: {message}")

    def text(value, path, limit=4096):
        if not isinstance(value, str) or not value.strip() or len(value) > limit or any(ord(c) < 32 or ord(c) == 127 for c in value):
            fail(path, "expected a nonempty bounded string without control characters")
        return value

    def names(value, path, allowed=None, maximum=128):
        if not isinstance(value, list) or len(value) > maximum:
            fail(path, f"expected an array of at most {maximum} strings")
        for item in value:
            text(item, path, 256)
            if allowed is not None and item not in allowed:
                fail(path, f"unsupported value {item!r}")
        if len(set(value)) != len(value):
            fail(path, "duplicate values are not allowed")
        return list(value)

    if not isinstance(configuration, dict):
        fail("<root>", "expected an object")
    allowed = {"title", "contextLimit", "defaultNodeTypes", "defaultRelationshipTypes", "grouping", "detailFieldOrder", "detailFields", "entryPoint", "entryPoints", "modes", "presentationPreferences"}
    for key in configuration:
        if key not in allowed:
            fail(str(key), "unknown field")
    result = deepcopy(configuration)
    if "title" in result:
        text(result["title"], "title")
    budget = result.setdefault("contextLimit", 24)
    if type(budget) is not int or not 1 <= budget <= 1000:
        fail("contextLimit", "expected an integer from 1 to 1000")
    for field in ("defaultNodeTypes", "defaultRelationshipTypes"):
        result[field] = names(result.get(field, []), field)
    grouping = result.setdefault("grouping", "none")
    if grouping not in ("none", "relationshipType"):
        fail("grouping", "expected none or relationshipType")
    field_names = ["source", "evidence", "verification"]
    for field in ("detailFieldOrder", "detailFields"):
        if field in result:
            names(result[field], field, field_names)
    if "detailFields" in result and "detailFieldOrder" in result and result["detailFields"] != result["detailFieldOrder"]:
        fail("detailFieldOrder", "conflicts with legacy detailFields ordering")
    order = result.get("detailFieldOrder", result.get("detailFields", field_names))
    result["detailFieldOrder"] = order + [field for field in field_names if field not in order]
    result.pop("detailFields", None)
    result["modes"] = names(result.get("modes", ["relationships", "native-views"]), "modes", ["relationships", "native-views"])
    if not result["modes"]:
        fail("modes", "at least one exploration mode is required")
    prefs = result.setdefault("presentationPreferences", {})
    if not isinstance(prefs, dict) or set(prefs) - {"defaultZoom", "showCompartments"}:
        fail("presentationPreferences", "expected defaultZoom/showCompartments object")
    zoom = prefs.setdefault("defaultZoom", 1)
    if type(zoom) not in (int, float) or not math.isfinite(zoom) or not .1 <= zoom <= 4:
        fail("presentationPreferences.defaultZoom", "expected finite number from 0.1 to 4")
    if type(prefs.setdefault("showCompartments", False)) is not bool:
        fail("presentationPreferences.showCompartments", "expected boolean")
    element_list = elements.values() if isinstance(elements, dict) else elements
    view_list = views.values() if isinstance(views, dict) else views
    ids = {item["id"] for item in element_list if item.get("exported") is not False}
    view_index = {item["id"]: item for item in view_list}
    entries = result.get("entryPoints", [])
    if not isinstance(entries, list) or len(entries) > 100:
        fail("entryPoints", "expected at most 100 entries")
    seen = set()
    for index, entry in enumerate(entries):
        path = f"entryPoints[{index}]"
        if not isinstance(entry, dict) or "id" not in entry or set(entry) - {"id", "label", "view"}:
            fail(path, "expected id with optional label/view")
        identity = text(entry["id"], path + ".id")
        if identity not in ids:
            fail(path + ".id", "unknown exported semantic identity")
        if "label" in entry:
            text(entry["label"], path + ".label")
        if "view" in entry:
            view = text(entry["view"], path + ".view")
            if view not in view_index:
                fail(path + ".view", "unknown native view")
            if identity not in view_index[view].get("elementIds", []):
                fail(path + ".view", "entry identity is absent from selected view")
        key = (identity, entry.get("view"))
        if key in seen:
            fail(path, "duplicate entry point")
        seen.add(key)
    if "entryPoint" in result:
        identity = text(result["entryPoint"], "entryPoint")
        if identity not in ids:
            fail("entryPoint", "unknown exported semantic identity")
        if entries and entries[0]["id"] != identity:
            fail("entryPoint", "must match the first entryPoints identity when both are supplied")
        if not entries:
            entries = [{"id": identity}]
    result["entryPoints"] = entries
    if entries:
        result["entryPoint"] = entries[0]["id"]
    return result
