# Canvas project and presentation configuration

An optional `project.json` expresses author intent:

```json
{
  "schemaVersion": "syspresent.project.v2",
  "title": "My system",
  "navigation": {"roots": ["MySystem"]}
}
```

Sources, assets, native roots, requirements and views are discovered from supplied files and native engine results. Optional `navigation.view` and `navigation.focus` select an entry point; otherwise the first authored scene or a bounded native system overview opens. `story` overrides the conventional `story.md` filename. `views` selects presentation-owned editable view files. `sources` selects an exact supplied source subset; necessary custom dependencies must remain included. `publication.scope` defaults to `complete`; deliberately partial projects use `scoped` and disclose unavailable targets.

Scene `presentation` supports `compartments` (`auto`, `compact`, `expanded`), exact native `expanded` references, relationship `emphasis`, `contextBudget` (0–256, default 48) and soft `grouping: owner`. Native views still own membership. Invalid or unresolved settings fail validation. Reader All/None/Focused compartment preferences and Square/Mind-map routing persist locally and override authored initial defaults.

See [integration](integration.md) for detailed contracts and [canvas stories](canvas-story-content.md) for scene authoring. Portable v1 project import remains supported; exports use compact v2 descriptors. Imported files are processed locally in the browser WASM engine.
