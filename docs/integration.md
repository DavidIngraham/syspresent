# Canvas architecture and semantic integration

## Agreed direction

The graph canvas is Syspresent's primary interface for guided presentations and standalone exploration. OpenSysML Go remains the semantic engine: browser WASM in a worker for the standalone app, native Go for CI and publication builds. Syspresent owns its interactive rendering, layout coordination, transitions and presentation editor. The new canvas does not depend on the VS Code extension's source modules.

The canvas is the sole application and is served directly at the GitHub Pages project root. Publication stages a fresh canvas site and retains content-addressed canvas ZIP archives. Independent geometry and layout packages remain behind explicit interfaces with source provenance.

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

Only then use the result to choose/finalize renderer and layout interfaces and plan the broader notation, complete editor and human-usability work. Making canvas the default is not proof that every required view is supported. No upstream dependency PRs are authorized by this integration work.

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


## Package workspace and standalone view navigation

Standalone exploration has an explicit reader scope independent of the focused element and authored presentation roots. Explore package opens a searchable native package catalog. Package membership follows the native owner index through nested declarations; names, typing and engineering composition do not establish ownership. The scope label retains the full qualified name as its accessible title. Overview, Up and Whole project provide explicit scope navigation. Package scope is session navigation state, preserved in Back/Forward alongside the native viewpoint and camera; it does not modify the project descriptor or source model.

Search, directional traces, action counts, route proposals and peripheral neighborhoods respect the same scope. Context reports external native targets as outside-scope, rather than absent or unavailable. The complete project stays loaded. Returning to a story clears the reader scope; exploration history can restore it. Empty packages remain inspectable without inventing children.

The persistent View chooser offers bounded graph projections, applicable native target renderings and declared views without opening the presentation editor. Native activity and sequence actions target actions; native states target states; packages and parts offer structural views. Declared views provide the other native notations, including grids. Compare views opens a secondary catalog. Every complete native view is checked using represented element identities and relationship endpoints before it replaces a scoped viewpoint or comparison. A crossing view requires Whole project; native behavior and grids are never trimmed to simulate a package-local rendering. Empty and unsupported native results retain the prior viewpoint and report the limitation. Reusable authored selection remains native SysML; this adds no query language or parser.

Shared URLs still restore published scenes. Package reader scope is currently local navigation state and is not claimed as a portable exploration URL.

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

`navigation.roots` expresses the intended engineering journey boundary, not a completeness claim or a hard exploration barrier. When omitted, native source roots supply a deterministic default. Optional `navigation.view` and `navigation.focus` select a preferred starting point; otherwise the first story scene or an automatic overview of discovered model roots starts exploration. Title is optional. An explicit `story` path overrides the conventional file. `publication.scope` defaults to `complete`; choose `scoped` only for a deliberately partial supplied project. Narrative sequence, annotations, evidence provenance and review intent cannot be inferred from model topology and remain authored content.

Native model roots, requirement seeds and the view catalog are discovered from ParseSources/ExportModel results. They are no longer author-maintained lists. The native build writes cache indexes, direct-source and complete-source digests, parsed model identity and engine fingerprint. The static builder writes a demo catalog, packaged demo files, viewer provenance and immutable snapshot hashes. A publisher-trusted cache index requires the exact input digest and engine identity before helping construct the native query; exported semantics require the subsequent native parse hash and complete source digest as well. Uploaded files do not supply their own publisher trust.

Existing v1 bundles retain their original explicit contract. New v2 exports contain the compact author descriptor and ordinary files, while derived runtime indexes stay out of project.json. Captured presentation-view files and edited Markdown survive export/reimport. Frozen old snapshots are never rewritten by migration. The documented native-cache and static-build commands remain suitable for CI; adding model files no longer requires rebuilding hand-authored source/root/requirement lists.


## Graph, sequence and grid regions

The scene controller hosts graph, sequence and grid renderers through semantic representation records. A representation may be a graph node, sequence participant/message, table row, matrix column or relationship occurrence in a matrix cell. Identity comes from the native engine; labels are never lookup keys. Native matrix relationships retain their own endpoint convention, including original-to-derived derivation. They are not added blindly to the general graph ancestry index.

Grid regions retain ordinary text size, sticky headings, scroll position, explicit sorting and column widths. Sequence regions retain native participant and message order; vertical distance does not assert elapsed time. Graph regions use independent cameras. Selection coordinates highlights without scrolling or rearrangement; explicit exploration opens the exact native relationship. Back restores the region navigation state. Wide screens show comparisons simultaneously and narrow screens use explicit region tabs.

A scene may add `regions: [{"id":"verification","view":"Views::verificationMatrix"}]` alongside its primary `view`. Region references are native view identities, with optional `title` and `focus`. The editor's Additional view regions field saves these references into Markdown. Find > Compare alongside adds a temporary comparison. Neither operation changes model selection semantics.

The View menu offers global Compartments (All, None, Focused) and Connection routing (Square, Mind-map). All is the initial compartment mode. These reader preferences persist locally where storage is available, override authored initial compartment preferences, and are not exported as changes to the author's scene. Explicit per-element expansion/collapse remains available. Focused follows explicit model focus, not first-click selection. Required behavior text remains visible in every mode.

Square routing uses orthogonal routes. Mind-map uses native-terminal tangent curves when the enclosing control geometry is clear; otherwise it rounds safe routing corridors. Endpoint identities, native ports and notation markers remain unchanged.


## Automatic system overview

Without an authored scene, entry view or explicit entry focus, standalone loading
selects an automatic system overview from the configured/discovered native roots.
View > System overview requests it explicitly at any time. The initial budget is
nine active tiles on wide screens and six on narrow screens. Resizing an existing
overview preserves its selection; explicitly requesting it again uses the current
budget. No peripheral neighborhood is added to the overview.

Scope follows native owner/composition edges, not qualified-name prefixes. Ranking
uses 3*log2(1+direct children) + log2(1+descendants) +
2*log2(1+distinct engineering neighbors) + 2*log2(1+cross-branch neighbors).
Ownership and composition contribute only to structure; typing, metadata and
library plumbing do not inflate connection counts. Parallel links to one neighbor
count once. Direct child/neighbor counts are exact within the eligible loaded
scope; descendant walks stop at 256 identities or 4096 adjacency inspections and
explicitly disclose lower bounds. Immutable graph/scope indexes are cached.

Selection first represents distinct native roots within budget, then balances
immediate branches before adding deeper content. With multiple roots, a child round
requires room for one child from every still-expandable represented root; spare
slots stay unused rather than showing arbitrary asymmetric detail. Eligibility
requires a native declared name or short name; generated qualified names alone
do not qualify. Single-child package wrappers
may be skipped; actual part/behavior boundaries are retained. Native edges between
selected identities remain unchanged. Automatic overview does not silently add
aggregate links; the explicit exploratory rollup control adds separate presentation artifacts. Ties use native qualified names and semantic IDs. Disconnected
branches remain selectable even when no engineering links join them.

Cards show children and distinct-neighbor counts. Overview selection explains the
policy, its loaded-projection limits and omitted-record counts; its list is bounded
to 100 entries for large models, with Find available for other elements. Selecting
a structural element exposes Expand contents; its bounded contents view uses the
same prominence ordering within existing relationship priorities. Action/state
views retain their native actions. Selection is stationary, while explicit
expansion and Back retain normal navigation/camera history. Opening the overview
activates the primary region; Back restores any former comparison and selected tab.
Authored scenes keep their membership and entry precedence. Prominence is a
presentation heuristic, never a safety, verification or engineering-criticality
judgment. Native links absent from the loaded projection cannot influence ranking.


## Canvas story publishing

Chapters, bundled figure regions, native prose links and contextual evidence cards
are documented in [canvas story content](canvas-story-content.md). The native view
remains the primary scene; figures share responsive region layout. Shared demo
links check the publication archive digest and native model identity. Authored
evidence categories never become native verdicts. Build and browser validation
resolve references using native declarations and preserve source/asset bytes.

## Explicit questions, complete declarations and part context

The Hierarchy control traverses every loaded source declaration through native
ownership, with paged contents and complete scoped search. Its roots are roots in
the declaration projection: relation-owned metadata may appear separately when
its nondeclaration owner is omitted. Browse declarations exposes all directly
owned attributes/parts and declarations on one direct classifier, retaining
declared-on identities and inert native source text. These hierarchy compartments
do not evaluate values; explicit narrative bindings use the separate
selected-attribute native path below.
Expanded cards show a disclosed first page; the dialog provides every page.

Part Focus defaults to Effective requirements. Local understanding exposes the
existing structural context; Global impact exposes native definitions,
specializations and usages. Effective obligations follow explicit native typing,
specialization, satisfaction or owned requirement usages. Definitions used only
as templates are not obligations. Inherited nodes may collapse, but paths retain
native identities/kinds and Context lists them. The canvas does not fabricate a
shortcut edge. Counts describe the loaded projection. Include external context
is an explicit, reversible choice within the retained package workspace; isolated
scope remains the default.

Ask as a new slide takes a selected native identity and a supported question mode.
The optional wording is a slide label, not a natural-language semantic query.
Only explicit submission appends a slide to the same story. A candidate captures
a real reusable view definition plus an exposed view usage, or references a
declared native view, then parses/renders it before committing the project.
Arbitrary graph captures must match native selected identities and directed
relationship occurrences exactly; unsupported projections fail without mutation.
Export project ZIP retains view source and slides. This uses the authored native
pipeline without adding a provider or credentials. Optional provider-neutral authoring is described below. No aggregate is inserted
into the native semantic graph.

Exploratory rendering is default. Focused notation disables peripheral context,
relationship emphasis and exploratory journeys, while retaining native active
membership. It is not a claim of complete standards compliance. The official
reference checked is [OMG SysML 2.0 Language, formal/2026-03-02](https://www.omg.org/spec/SysML/2.0/Language/PDF),
section 8.2.3, including attributes/parts compartments. The focused renderer uses a separately measured native descriptor: square
definitions, rounded usages, typed names, separate owned compartments, actual
port directions and supported control symbols. Its solid two-dot typing marker,
circled-plus ownership marker and supported relationship productions differ
from exploratory styling. Unknown modifiers, unavailable native roles, overloaded
kinds and unsupported families have inspectable notices. Native extensions and
sequence/grid/fault-tree subsets retain their per-record limitations. The current
bounded inventory, helper contracts and remaining gaps are documented in
[rendering coverage](rendering-coverage.md); none is a claim of complete standards
compliance.

Adjust layout supports explicit dragging and keyboard movement of active flat
structural cards, state nodes, structural/state groups and bounded nested members.
Mapped action/control and fault-tree nodes support horizontal adjustment to
preserve the drawing's established reading layers; horizontal positions do not
impose native branch order, and coordinates do not assert elapsed time. Complete
action containers may move rigidly where no native succession crosses their
boundary. Group movement translates native
descendants, ports, labels and drawing anchors together; external edges reroute
against stationary peers. Nested moves use the actual fitted parent body and header, rejecting escape,
header entry and card/native-label collisions. Descendants and actual ports move
rigidly. Missing parent geometry, unsafe routes and loss of mandatory native labels
reject a gesture. Synthetic controls and actual ports move only with their owning
container. Dedicated sequence/grid controls adjust lane widths, message spacing
and column widths while preserving native identities, explicit event order and
matrix direction; generic graph movement does not replace those renderers.
Pan/zoom remains available without relayout.

Positions persist in the project asset syspresent-layouts.json, separate from
SysML view selection and story narrative. It records native semantic,
representation and parent identities plus offsets normalized to the graph area,
alongside typed sequence/grid region settings.
It stores neither a model hash nor a frozen viewport. ZIP export/import retains
the asset and unchanged system sources. Export is the durable-save boundary;
model metadata is not automatically retained in browser storage. Back/Forward,
reset and native capture restore or uniquely rebind the independent placement
state. Fresh native geometry remains authoritative; missing/ambiguous identities,
changed parents and unsafe restored arrangements produce explicit omissions and
retain safe automatic geometry.

### Typed relationship rollups

Display > Roll up hidden links explicitly adds typed, directed drawing overlays
between visible native containing parts/packages. Actual owner paths determine
each representative. Scope is checked on the underlying native endpoints before
rollup; isolated Gorge cannot regain external allocations through a container.
Each overlay retains every underlying graph record, known native relationship ID,
API/view occurrence and owner path. Known identities count once across repeated
projections; unresolved identity is labeled connection records, never a claim of
distinct modeled relationships. Select an overlay for paged provenance and Open
this page as graph; drilldown rechecks current scope, ownership and stale records.

Aggregates never enter modelGraph, semantic traversal or native view capture.
Native satisfaction edge identities are accepted only when the engine maps their
origins to actual SatisfyRequirementUsage declarations. The updated Blue Dog model
exposes 216 such identities; the Blue Dog-to-Gorge satisfaction rollup contains
seven known native relationships. Other unavailable native identity mappings
remain explicit limitations of the loaded projection. The carried native dependency
patch also preserves distinct located source origins when parallel assertions
share endpoints/kind, while repeated discovery of one declaration deduplicates.

### Grounded native authoring and fresh narratives

Edit > Author native slide opens local proposal review with the provider visibly
unconfigured. Prepare local context exposes a bounded selection of native
identities, documentation and typed directed links. A local starter copies native
documentation bindings; it is explicitly not LLM output. Proposal JSON declares
native view definition kind, exposed native references and native type filters,
plus narrative templates, bindings, references and optional structured
relationship claims. Native parse/render verifies membership and scope; claims
must match exact native directed records. The review shows emitted SysML,
represented membership, typed-value provenance and a preview through the existing
native graph/sequence/grid renderer. Validation alone never appends; only Append
validated slide changes the story. Rejected or obsolete candidates leave it intact.

Inspect native values starts with exact GetSymbol attributes. Templates retain
native documentation or scalar-attribute bindings and resolve afresh on project
reload and publication validation, including exact rational/large-integer
formatting and explicit same-unit/type assertions. If an already identified
attribute has no static value, only that exact quoted native attribute may be
evaluated in its selected native owner/subject context. The native result,
diagnostics and provenance are retained. This path supplies no missing inputs,
accepts no arbitrary expression text and runs no actions or simulations. Unset,
undetermined, collection, nonfinite and incompatible values fail explicitly; units
are not inferred from names or silently converted. The bounded 184-attribute
survey found 147 supported static values, 13 additional native-evaluated scalars
and 24 explicit rejections; see [rendering and value coverage](rendering-coverage.md).
Declared/evaluated values remain distinct from measurement, recorded execution
and engineering approval. Native references and structured claims can be checked;
free prose remains an unverified author draft.

The provider-neutral transport interface defaults to unconfigured. Tests use
explicitly labeled mocked transports with allowlisted identity/documentation/link
fields; no network implementation, provider, credential storage or paid call is
configured. Live generation requires a provider/endpoint choice, a decision about
which selected metadata may leave the browser, and explicit transmission approval.
It must use the same native proposal validation and rendering path. Existing
snapshots remain immutable and software evidence does not establish engineering
or full OMG notation acceptance.

The October 25 pending Blue Dog example refresh was copied byte-for-byte from
the six dirty files in the original SysPresent checkout. Its source.json identifies
the working-tree snapshot: all 98 listed source hashes matched the current
sv-blue-dog-editorial files when integrated. Original checkout edits were preserved.
This source refresh and software validation imply neither engineering acceptance
nor a new Blue Dog architecture.


The optional JSON gateway adapter accepts an explicitly supplied loopback or
same-origin HTTP(S) endpoint; it has no default target. A gateway request uses
syspresent.authoring-gateway.v1 and contains the question, selected native IDs,
qualified names and kinds, with documentation and directed links only when
allowlisted. It sends no full model sources, cookies, bearer tokens or browser
credentials, and retains no gateway configuration. Redirects and credential/query
URLs are rejected. The server owns provider/model choice and credentials; responses
contain a structured authoring proposal that still undergoes native validation and
review. Tests inject mocked fetch only. No actual gateway was identified in
repository conventions or live-tested, and no endpoint is configured.

The concrete live-generation decision is whether to use a user-designated local
JSON gateway with server-held credentials, which provider/model it should call,
which selected metadata fields may leave the browser, and what request logging/
retention is acceptable. Same-origin HTTPS can avoid cross-origin loopback browser
constraints; loopback CORS/private-network behavior remains untested without a
chosen service. Direct provider APIs and automatic OpenAI-compatible passthrough
are not configured.


Closed generated-view proposal validation avoids a redundant whole-candidate
declaration export after verifying original source bytes and presentation-file
ownership. Existing native names/documentation remain authoritative under that
unchanged-source boundary; candidate native parse/render and fresh candidate
GetSymbol/Evaluate calls still validate view membership and typed values.
The review exposes this reuse. It does not manufacture a publisher-trusted cache
or establish a pass for large edited-model append/reload: the native whole-model
exporter can still exhaust WASM's 4 GiB memory during RDF collection annotation.
See docs/rendering-coverage.md and the final validation record for exact evidence.
