# Canvas architecture and semantic integration

## Agreed direction

The graph canvas is Syspresent's primary interface for guided presentations and standalone exploration. OpenSysML Go remains the semantic engine: browser WASM in a worker for the standalone app, native Go for CI and publication builds. Syspresent owns its interactive rendering, layout coordination, transitions and presentation editor. The new canvas does not depend on the VS Code extension's source modules.

The existing viewer reused VS Code-derived drawing and layout modules. That was a useful prototype decision, but it is historical implementation rather than the target architecture. Do not describe the new canvas as implemented merely because the old viewer can display a native diagram. Reuse of independent general-purpose geometry or layout packages remains possible with explicit interfaces and provenance.

The immediate implementation and verification scope is [the canvas prototype](canvas-prototype.md). The broader requirements in `model/requirements.sysml` remain intended product behavior. In particular, this prototype does not by itself establish all notation support, complete project editing or reader-study acceptance.

## Semantic runtime boundary

The browser worker loads model and required library sources, parses and resolves them through the actual WASM engine, resolves declared SysML views and answers focused exploration requests. Native and WASM paths use the same pinned Go engine. Parsing and view resolution must not be reimplemented in JavaScript. Failures and unsupported operations are explicit diagnostics, not synthetic fallback semantics.

The adapter exposes a versioned browser-friendly contract with:

- Semantic model identities and typed, directed relationships with source provenance.
- Scoped diagram projections with representation identities separate from semantic identities.
- Behavior-specific information such as ports, participants, ordering, guards and gates where supported natively.
- View identities and definitions, project/library ownership, publication coverage and unavailable references.
- Engine version and source/dependency information sufficient to resolve fresh views and queries.

A scoped RenderView payload alone is too narrow for unrestricted exploration. A raw metamodel dump alone contains incidental relationships unsuitable for default engineering navigation. The contract must support an intentional engineering graph as well as native notation projections. Actual native relationships remain authoritative in both; a shared classifier or KerML ancestor is not a system connection.

The default full Blue Dog publication prepares native declaration/requirement/view data during its build. The browser verifies the publisher hash, exact sources, native parse identity and engine fingerprint before reuse, while retaining the complete model in WASM for fresh queries and views. An explicit native declaration projection reduces metamodel-expression serialization; omitted objects are disclosed, never silently replaced by inferred links. See the prototype evidence for mobile memory limits.

No permanent wire schema is implied by these conceptual fields. A narrow adapter contains native API changes. The prototype must demonstrate actual identity and view parity before this boundary is treated as stable. Browser-worker request identities and stale-result handling should keep a slow earlier response from replacing a newer scene.

## Rendering and transition boundary

Keep five concepts separate: model element, diagram representation, scene intent, calculated layout and transition correspondence. One model element may have several representations. Dynamic scene positions are not model properties and need not persist globally.

The canvas measures floating Markdown panels and includes their occupied rectangles in layout. Authors express focus, grouping, emphasis and optional constraints; the engine calculates readable placement for the current viewport. Each scene can rearrange the graph. A settled scene remains steady while read. Fit the compact active layout once inside the measured unobstructed area; do not push cards below a prose panel and then shrink the resulting empty space. Native one-hop engineering neighbors may appear translucently at the fringe, with explicit truncation markers. These neighbors do not affect active bounds, centering, or the camera. Batch route directed connections and place measured labels without card or label collisions. Multiple diagram regions may coexist with explicit notation boundaries; this is a full-product requirement, not necessarily a first-prototype demonstration.

Same-notation transitions gather relevant content, fade context and reflow directly. Cross-notation transitions use GV as navigation: expose the relevant engineering path, gather destination elements and features, then transform into the destination notation. Use one continuous journey clock with through-motion at intermediate viewpoints, not one separately eased animation per stage. Interpolate corresponding node and directed connection geometry together; crossfade entering and leaving content, including prose. Preserve the current visual sample when navigation interrupts a journey so the next transition begins there. Preserve identity where there is actual correspondence. Additional notation may appear as the destination takes shape; a line must not silently change engineering meaning because it has moved.

A route planner proposes actual engineering paths inside the presentation's system of interest and explicit scene additions. Authors inspect and edit the proposal and save the chosen route. Generic ancestry does not produce automatic shortcuts. Deliberate exploration into library/metamodel content remains available beyond story guidance, with visible boundaries and return history.

## Views and presentation authoring

Reusable selection belongs in SysML view definitions and usages, using native executable semantics. Markdown references views and supplies prose, scene order, annotations, emphasis and transition choreography. It must not become a competing model-selection language. Rendering definitions can express intent; JavaScript still implements geometry, animation and interaction.

The static-site editor loads a project, explores its model, captures viewpoints into authored views/scenes and exports them. Initial system-model sources remain read-only; view and presentation sources are editable. A first click/tap/key selection exposes contextual actions without moving the graph. Explicit refocus/expand/viewpoint actions trigger rearrangement. Leaving a guided scene collapses prose to Return to scene; returning restores authored context.

A portable project uses ordinary files: model and required library sources, authored views, Markdown, assets and a small manifest naming dependencies and entry points. Folder/ZIP import/export is the intended project format. Individual Markdown import/export remains supported. Exported SysML view declarations must accompany scenes that depend on them; a screenshot or cached layout is not a substitute for their semantic definition.

Publications include the complete project by default. Scoped publications remain possible and disclose unavailable targets separately from hidden diagram context. Frozen snapshots retain exact model/story/runtime content. Rebuilds report broken references and routes; automatic deep change history, semantic adjudication and compulsory reapproval are outside the agreed current scope.

## Integration sequence

1. Prove the real native/WASM contract on a small unrelated model: identity, relationships and view membership.
2. Implement focused engineering traversal and diagram selection without relying on a story.
3. Demonstrate direct same-notation transitions and one cross-notation GV gathering journey.
4. Coordinate measured Markdown space with responsive diagram layout and explicit exploration/return.
5. Capture and export a scene referencing an authored native view, then reload the exercised portable format.
6. Independently review native semantic claims, actual browser behavior and the limits of the prototype evidence.

Only then use the result to choose/finalize renderer and layout interfaces and plan the broader notation, complete editor and human-usability work. Preserve legacy viewer compatibility separately; replacing it is not proof that every existing view is supported. No upstream dependency PRs are authorized by this integration work.

## Connection layout and selection

The canvas uses pinned elkjs 0.12.0 in a separate browser worker for joint tile, port, corridor and label geometry. This adds no semantic processing: OpenSysML remains authoritative for view membership, containment, relationship kind, endpoints, guards and actual ports. Native endpoint order is restored after any layout-only rank reversal. ELK drawing anchors carry no model identity.

Structural sibling ordering and staggered rows may vary with available space. General requirements remain above their derived requirements; action fork/join branches retain concurrency. One camera transform fits tiles, paths, actual port labels and relationship labels together. Translucent context is placed afterward, avoiding active corridors and labels, and never expands that camera fit. Failed routes are explicit omissions, with no line through an obstacle as a fallback.

Select a connection by touch or keyboard to emphasize its complete path, label and both endpoints. Selection does not relayout. Moving routes are checked against current tiles; an unsafe interpolated path uses a clear orthogonal route or remains hidden. Travel lowers relationship emphasis and restores it continuously as the scene settles. This is a prototype implementation, not proof of arbitrary-model readability or complete notation coverage.
