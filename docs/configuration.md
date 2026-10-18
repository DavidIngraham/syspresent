# Declarative explorer configuration

Project export configuration uses `exploration`; the exported bundle stores its normalized value as `configuration`. `scripts.configuration.validate_configuration(configuration, elements, views, relationships=())` validates and returns an independent copy. Call it with the full native identity catalog before sharding; a consumer validating an existing sharded bundle must combine initial elements with the exported search catalog. Do not substitute drawing-local IDs or infer identities from names.

| Field | Contract and default |
| --- | --- |
| `title` | Optional nonempty text. |
| `contextLimit` | Integer 1–1000, default 24; a graph-context budget, not a readability guarantee. |
| `defaultNodeTypes`, `defaultRelationshipTypes` | Unique native kind strings, default empty (all). Maximum 128 entries, 256 characters each. |
| `grouping` | `none` (default) or `relationshipType`; grouping preserves relationship direction and meaning. |
| `detailFieldOrder` | Ordering of `source`, `evidence`, `verification`. Omitted fields append in that order so evidence remains accessible. This is not a hiding mechanism. |
| `detailFields` | Legacy ordering alias. Cannot conflict with `detailFieldOrder`; normalized output uses the latter. |
| `entryPoints` | Up to 100 objects with exported semantic `id`, optional `label` and native `view` ID. A specified view must contain that semantic identity. Duplicate identity/view pairs fail. |
| `entryPoint` | Legacy single semantic ID. Normalizes to the first entry; when both forms exist, it must match the first identity. |
| `modes` | Nonempty unique subset of `relationships`, `native-views`, default both. These govern exploration controls, not removal of authored story evidence. |
| `presentationPreferences` | Optional `defaultZoom` finite number 0.1–4 (default 1) and `showCompartments` boolean (default false). Authored stop overrides take precedence. |

Unknown fields, malformed shapes, duplicates, nonfinite numbers and invalid identities fail with a `configuration.<field>` diagnostic. Strings cannot contain control characters. Configuration validation does not run analyses or rewrite native views.

Filter names remain exact opaque native kinds. The validator deliberately permits a kind absent from a particular snapshot, enabling reusable configuration across project revisions. Such a filter matches nothing; it is not automatically corrected or aliased. For example, `composition` does not imply every native containment property. Authors should inspect exported kinds when configuring defaults. The validator does not promise typo detection for opaque native names.

```json
{
  "contextLimit": 24,
  "entryPoints": [{"id": "Flashlight__light", "label": "Proposed assembly", "view": "structure"}],
  "modes": ["relationships", "native-views"],
  "grouping": "relationshipType",
  "detailFieldOrder": ["verification", "evidence", "source"],
  "presentationPreferences": {"defaultZoom": 1, "showCompartments": false}
}
```

These are configuration and validation contracts. Actual control integration is separate; passing the validator alone does not establish that a viewer consumes every option.
