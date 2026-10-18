# Integration plan and reuse decision

## Decision

Reuse OpenSysML's semantic rendering contract and evaluate its existing browser canvas, layout, routing and export components. Build Syspresent's exploration and narrative shell separately. The new UX requirements increase the need for a separate shell; they do not by themselves invalidate the underlying renderer.

The pinned source already separates `editors/vscode/src/webview/{canvas,layout,autolayout,avoid}.ts` from host orchestration, and its `src/landing` demonstrator reuses several of these modules outside VS Code. Exact extraction boundaries must be established by code audit; these are source modules, not a promised stable standalone npm library. Export code also exists under `src/landing/export.ts` and `src/export.ts`.

Reuse candidates: native notation drawing, geometry, ELK layout, libavoid routing, selection primitives and suitable SVG export. Syspresent-specific work: story compilation, typed prose references, snapshot/catalog management, search and selective graph expansion, ownership boundaries, navigation history, annotation binding, shareable state and responsive story orchestration. Do not adopt landing-model constants, VS Code messaging or demo controls.

## Integration spike

1. Audit imports, browser/runtime assumptions and licenses at the exact pinned revision. Compare with the relevant changes in David's branch without silently adopting unrelated runtime updates.
2. Render native fixtures for requirements, structure, activities, sequences, states, tables/matrices and fault trees in a standalone harness. Check guards, order, concurrency, hierarchy and shared identities, not merely appearance. The new fault-tree kind may require a generic canvas addition even though its Mermaid form works.
3. Test external selection, stable scene framing, explicit relayout, annotations and responsive dimensions. Do not force continuous motion while the user reads.
4. If separation is clean, expose a small browser package in David's fork. Otherwise vendor only the necessary modules with revision and license provenance while planning an extraction. Reject a module if retaining it forces semantic losses or excessive host coupling; document that finding before replacing it.

No upstream PRs. No commitment to a new rendering engine before this spike.

## Data boundary

Native RenderView output describes one scoped view, not the complete model. Export a versioned bundle containing unchanged native view payloads, native-derived element/relationship indexes, query results, available-view catalog and provenance. Define semantic identity separately from render-local node IDs. Record export coverage, unresolved targets and library ownership. The exporter, not browser heuristics, resolves model relationships.

The conceptual SysML items are not a finalized JSON schema. Resolve identity guarantees and payload scale before freezing the wire contract. Keep an adapter so native schema changes are localized. Unsupported native detail remains visible as a limitation.

## Authoring boundary

The Markdown grammar and replacement syntax are not yet fixed. Engineering alternatives, assumptions, decisions and reusable views belong in model records; story order, audience explanation, camera placement, highlights and speaker notes belong in presentation content. Substitutions reference native values or explicitly contextualized recorded results. Permit explicit unknowns; reject broken references. Prepared plots and tables carry evidence provenance.

## Delivery sequence

1. Validate this specification and agree unresolved acceptance thresholds when measurements are available.
2. Prove canvas reuse and the native export contract on a small unrelated model.
3. Implement a static story with stable scrolling scenes, model-linked prose and annotations.
4. Add selective exploration, type filters, ownership boundaries, history, sharing and exact return to story.
5. Exercise every required view kind; add tables/matrices for coverage and simultaneous prepared comparisons.
6. Deliver the avoidance/recovery story and the core/OMG-library notation tutorial through the same generic code.
7. Run independent technical review, browser checks and a formative reader study; then integrate immutable snapshot publication and lifecycle catalog into CI and GitHub Pages.

Live presenter UI and the authored evolution timeline follow. WASM execution, offline bundles and visual authoring remain deferred. The first release uses prepared evidence and build-time exports.
