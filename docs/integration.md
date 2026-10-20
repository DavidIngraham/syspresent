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

The canvas measures floating Markdown panels and includes their occupied rectangles in layout. Authors express focus, grouping, emphasis and optional constraints; the engine calculates readable placement for the current viewport. Each scene can rearrange the graph. A settled scene remains steady while read. Fit the compact active layout once inside the measured unobstructed area; do not push cards below a prose panel and then shrink the resulting empty space. Native one-hop neighbors occupy a prepared translucent surrounding world with real tiles and complete connections, including beyond the initial viewport. A separate camera supports pan and zoom without recomputing the graph; viewport clipping does not create terminal stubs. These neighbors do not affect active bounds, centering, or the camera. Batch route directed connections and place measured labels without card or label collisions. Multiple diagram regions may coexist with explicit notation boundaries; this is a full-product requirement, not necessarily a first-prototype demonstration.

Same-notation transitions gather relevant content, fade context and reflow directly. Cross-notation transitions use GV as navigation: expose the relevant engineering path, gather destination elements and features, then transform into the destination notation. Use one continuous journey clock with through-motion at intermediate viewpoints, not one separately eased animation per stage. Interpolate corresponding node and directed connection geometry together; crossfade entering and leaving content, including prose. Preserve the current visual sample when navigation interrupts a journey so the next transition begins there. Preserve identity where there is actual correspondence. Additional notation may appear as the destination takes shape; a line must not silently change engineering meaning because it has moved.

A route planner proposes actual engineering paths inside the presentation's system of interest and explicit scene additions. Authors inspect and edit the proposal and save the chosen route. Generic ancestry does not produce automatic shortcuts. Deliberate exploration into library/metamodel content remains available beyond story guidance, with visible boundaries and return history.

## Views and presentation authoring

Reusable selection belongs in SysML view definitions and usages, using native executable semantics. Markdown references views and supplies prose, scene order, annotations, emphasis and transition choreography. It must not become a competing model-selection language. Rendering definitions can express intent; JavaScript still implements geometry, animation and interaction.

The static-site editor loads a project, explores its model, captures viewpoints into authored views/scenes and exports them. Initial system-model sources remain read-only; view and presentation sources are editable. A first click/tap/key selection exposes contextual actions without moving the graph. Explicit refocus/expand/viewpoint actions trigger rearrangement. Leaving a guided scene collapses prose to Return to scene; returning restores authored context.

A portable project uses ordinary files: model and required library sources, authored views, Markdown, assets and an optional small manifest expressing author intent and entry-point overrides. Folder/ZIP import/export is the intended project format. Individual Markdown import/export remains supported. Exported SysML view declarations must accompany scenes that depend on them; a screenshot or cached layout is not a substitute for their semantic definition.

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

Structural sibling ordering and staggered rows may vary with available space. General requirements remain above their derived requirements; action fork/join branches retain concurrency. One camera transform fits tiles, paths, actual port labels and relationship labels together. Translucent context is placed afterward in extensible world space, avoiding active corridors and labels, and never expands the initial active camera fit. Failed routes are explicit omissions, with no line through an obstacle as a fallback.

Select a connection by touch or keyboard to emphasize its complete path, label and both endpoints. Selection does not relayout. Moving routes are checked against current tiles; an unsafe interpolated path uses a clear orthogonal route or remains hidden. Travel lowers relationship emphasis and restores it continuously as the scene settles. This is a prototype implementation, not proof of arbitrary-model readability or complete notation coverage.

## Focused requirement traversal

Selection exposes Origins, Derived requirements, Design impact and Verification on the existing diagram canvas. These are display projections over native relationship kinds and directions, not new model queries inferred from names or prose. A single explicit requirement definition/usage typing link may bridge to links recorded on the other representation; both identities and that typing edge remain visible. Definition inheritance and KerML ancestry do not become traversal shortcuts. Generic engineering context remains available for other elements, with requirement traces prioritized over generic dependencies when competing for the first bounded page.

Focus plus required typing bridges and neighboring targets share a bounded active budget (five on narrow screens, seven otherwise). Stable pages replace the neighbor set rather than accumulating an unbounded diagram. The canvas discloses shown/total targets and unavailable or policy-hidden context. Verification links identify modeled cases and never imply executed tests or passed verdicts. The loaded declaration/coverage graph is a projection, even when the complete source model is loaded in WASM; a zero link count is not proof that none exists in the model.

Exploration history restores the actual viewpoint, focus, expanded/collapsed statements, result page, story position and display preferences. Back/Forward appear only after an exploration action. Return to scene restores the authored scene and is itself reversible through history. First selection stays stationary. Slow or rejected obsolete layout responses cannot commit over newer navigation.

A scene may supply presentation-only settings in its existing Markdown JSON block:

```json
"presentation": {
  "compartments": "compact",
  "expanded": ["Example::requirement"],
  "emphasis": ["derive", "verify"],
  "contextBudget": 3,
  "grouping": "owner"
}
```

`compartments` accepts `auto`, `compact` or `expanded`; explicit expanded references resolve by native ID or qualified name. `emphasis` dims other active relationship kinds without filtering them out. `contextBudget` controls 0–256 prepared one-hop neighbors; omission uses the default limit of 48 on every viewport. Camera movement reveals the prepared neighborhood without expanding it. `grouping: owner` is a soft ordering preference among structural siblings using their actual native owners, not a synthetic containment diagram, and never changes behavior order. Invalid settings or unresolved references fail before scene edits are applied. The editor exposes these under Diagram presentation, and Markdown/project export retains them. Native view definitions still own model membership. Capturing an arbitrary focused projection as a new exact native view remains unsupported; use a declared native view or the existing native internal/activity capture path.


## Decision-chain reading order and replacement motion

Structural layout now ranks source obligations above their derivations/refinements, and requirements above satisfying parts and verifying cases. This is a display decision chain, not containment. Native endpoint order and arrowheads remain unchanged; behavioral order, native ports and allocation semantics are not recast as requirement ancestry.

For small flat structural diagrams the layout compares fit, route length, bends, stretch and crossings, then tries fixed-terminal orthogonal shortcuts against cards and reserved labels. Attachment sides may face each other instead of always using top/bottom. Small flat requirement fanouts also compare a balanced-parent placement so a wide layout does not align the parent over only its leftmost child. Compound, native-port and behavioral diagrams retain their existing routing. Peripheral cards respect the same native rank. Offscreen context retains real neighboring tiles and complete native connections. A viewport boundary clips the graph visually; it does not become a modeled endpoint or continuation marker. Unavailable routes or visual label fits are disclosed.

Before a tile replaces a departing tile's region, the departing tile moves off frame and fades. Exit sweeps avoid retained cards, held arrivals, measured prose and actual ancestor headers; where every exit is blocked, opacity reaches zero before first contact. Replacement motion starts smoothly after the hold. Connections must touch their currently rendered endpoints, and invisible connections lose pointer and keyboard targets. One continuous clock still drives the journey, and reduced motion reaches the same final state.


## Common-ancestor journeys

The former prototype searched undirected engineering links only for cross-notation transitions and directly reflowed every same-notation change. That did not implement the agreed common-ancestor journey. The planner now uses directed ancestry: derive/refine/satisfy/verify lead upward from specific elements to addressed requirements, while native composition/containment lead upward from child to parent. It finds the nearest permitted common ancestor, then descends toward the destination, retaining native endpoints and arrows.

If engineering ancestry has no permitted common point, a separate native ownership index can supply project location context. Its `owns` connections come only from explicit native `owner` roles on actual source declarations, never qualified-name truncation or membership/type walks. This index is not added to default requirement context; focused structural exploration can expose direct package ownership explicitly. Such journeys are labeled as model ownership routes, not engineering derivation. Synthetic namespace roots, imported libraries, typing and KerML ancestry cannot supply automatic shortcuts. Story scope and the total hop bound still apply. A genuinely unconnected context uses a disclosed explicit jump; an invalid saved route is an error, not permission to silently substitute a jump.

Same-notation changes with shared semantic content retain direct reflow. Disjoint changes use GV just like cross-notation journeys. Overlapping windows of at most three route elements retain their local edges and changing focus, instead of gathering the entire path into an overview. The renderer schedules departures per adjacent viewpoint interval, preserving every waypoint and the endpoints of each displayed hop. Reduced motion reaches the same destination.


Journey edge emphasis is independent of destination scene emphasis and the ordinary reflow midpoint fade. Small live GV hops route as one batch with distinct drawing attachments and shared label reservations, retaining native relationship identities. Labels appear only when a clear adjacent slot exists; invalid live routes are hidden instead of falling back to independently merged terminals. Final scene preferences and native joint layout remain authoritative.


## Peripheral crossing policy

Translucent connections participate in crossing and overlap minimization too. Active routes, labels, cards and fit are fixed before peripheral optimization. The contextual layout can choose alternate positions and orthogonal routes, avoiding active paths and other contextual paths while preserving native endpoints and independent attachments. A common modeled endpoint is distinct from a line crossing or a shared segment: separate relationships must not become an apparent bus. Dense neighborhoods extend beyond the viewport and retain actual tiles. Disclose unavailable routes or residual conflicts rather than replacing tiles with short continuations. Zero crossings alone is not a reason to remove otherwise readable context.


## Part and package exploration

Focus on a part now prioritizes its containing assembly, direct classifier and declared subparts before competing requirement traces. A part usage follows at most one outward native typing link to expose composition declared by its part definition. Both representations and the typing link remain visible; definition-owned parts are not relabeled as instance-owned children. The definition's requirements, owning package, base types and other usages of the same type are not pulled through that bridge. Requirement tracing keeps its existing defaults.

Packages and namespaces expose direct source declarations from the separate native `owner` index, with containment notation and an `owns` label. This is package location, not physical composition or an engineering dependency. No membership, documentation, expression or metamodel plumbing is exposed as a declared child. Duplicate ownership edges are suppressed when a native composition already represents that same pair. No package hierarchy is inferred from qualified names.

Parts / contents and Containing element actions select the corresponding direction. They share the existing five/seven-element paging budget, history and omission disclosure. Native connections between selected contents are retained without expanding the page. Whole-to-parts and package-to-contents placement reads top down; typed definitions remain above their usages. These display projections do not add typing shortcuts to the common-ancestor journey planner.


## Prepared neighborhoods and graph camera

Neighbor inclusion is no longer constrained by the display rectangle. The default is 48 neighbors on all screen sizes; authors may choose 0 through 256. The selection policy uses direct native links, relationship priorities appropriate to each active element, stable names/identities and balanced allocation between anchors with the focus first. Package ownership enters structural context and retains containment notation; it does not enter default requirement context. Native declaration categories include metadata, views, enumerations and concerns. A one-hop limit prevents recursive expansion; budget, filter, scope and availability exclusions remain distinct.

Every selected neighbor receives a real translucent tile in a prepared world around the fitted active geometry. Placement and routing may use offscreen space. Native endpoint identities, directions and labels remain authoritative; presentation attachments are disposable perimeter points, not model ports. Routing keeps unrelated tiles and active labels clear, minimizes crossings, and reports residual conflicts. If only a visible label cannot fit, the full link remains inspectable with its native label and a label omission notice. A route that cannot be drawn safely is disclosed rather than replaced with a dangling arrow.

The camera transforms the graph layer only. Measured prose and controls stay in screen space; the graph viewport clips to the usable reading region. Drag, pinch, wheel and keyboard move or zoom the same prepared graph without relayout. Stationary taps select without moving. View exposes Show neighborhood, Zoom in/out and More neighbors when capped. Fit restores the active viewpoint. Focusing a surrounding tile makes it active and prepares its new neighborhood. Back/Forward restore camera position and the neighborhood limit as well as existing context. Guided navigation and Return restore the authored active fit. No new model parser or VS Code dependency is introduced.


Journey camera choreography uses the same continuous clock as graph geometry. It opens around relevant source route elements, follows the actual focus in intermediate GV windows, then settles at the destination active fit. The camera follows prepared model route geometry rather than fitting unrelated neighbors. A large same-notation reflow may use a modest pullback. Camera positions are presentation data, not model locations. An input handoff finishes current motion before applying the gesture; a camera revision guard prevents a pending layout response from overwriting a gesture that started while geometry was being prepared. Context fading follows each sampled frame's active/context role, so an ancestor link remains visible during the journey even when it becomes background context at the destination.


## Landing page and project discovery

The demo root opens a landing page rather than loading a model immediately. It offers the packaged Blue Dog and flashlight examples, local multi-file SysML/KerML selection, a folder selection where supported and project ZIP import. The WASM and layout workers start only after a model is chosen. Home returns to the landing page; Resume retains the loaded model. A requested demo can be linked directly with `?demo=blue-dog` or `?demo=flashlight`. Model sources are processed in the browser, without an application upload endpoint.

Basic exploration needs only model files and any custom library sources that the model imports. A manifest, story and predeclared views are optional. The importer retains filenames, rejects duplicate selected paths, and uses folder-relative paths when supplied. ZIP intake also accepts a single enclosing project folder. Parse errors remain native diagnostics; the importer does not guess missing library semantics. Built-in runtime libraries remain pinned with the engine.

New author projects use `syspresent.project.v2`. For example, the complete Blue Dog author descriptor contains only its schema, title and intentionally selected navigation roots:

```json
{
  "schemaVersion": "syspresent.project.v2",
  "title": "My system",
  "navigation": {
    "roots": ["MySystem"]
  }
}
```

Even this file is optional. File conventions discover SysML/KerML sources, `story.md`, and ordinary assets. `views.sysml` and SysML files under `views/` are presentation-owned editable files by convention; use `views` to choose a different editable subset. A blank presentation view file and story are provided when absent. `sources` is an optional exact source-file selection, useful for intentional exclusions; supplied dependency files must still be included. No SysML syntax is parsed by JavaScript for discovery.

`navigation.roots` expresses the intended engineering journey boundary, not a completeness claim or a hard exploration barrier. When omitted, native source roots supply a deterministic default. Optional `navigation.view` and `navigation.focus` select a preferred starting point; otherwise the first story scene or a discovered model root starts exploration. Title is optional. An explicit `story` path overrides the conventional file. `publication.scope` defaults to `complete`; choose `scoped` only for a deliberately partial supplied project. Narrative sequence, annotations, evidence provenance and review intent cannot be inferred from model topology and remain authored content.

Native model roots, requirement seeds and the view catalog are discovered from ParseSources/ExportModel results. They are no longer author-maintained lists. The native build writes cache indexes, direct-source and complete-source digests, parsed model identity and engine fingerprint. The static builder writes a demo catalog, packaged demo files, viewer provenance and immutable snapshot hashes. A publisher-trusted cache index requires the exact input digest and engine identity before helping construct the native query; exported semantics require the subsequent native parse hash and complete source digest as well. Uploaded files do not supply their own publisher trust.

Existing v1 bundles retain their original explicit contract. New v2 exports contain the compact author descriptor and ordinary files, while derived runtime indexes stay out of project.json. Captured presentation-view files and edited Markdown survive export/reimport. Frozen old snapshots are never rewritten by migration. The documented native-cache and static-build commands remain suitable for CI; adding model files no longer requires rebuilding hand-authored source/root/requirement lists.
