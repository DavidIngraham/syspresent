# Standalone canvas prototype milestone

## Purpose and scope

This milestone implements the architecture agreed on 18 October 2026. It is a deliberately small proof of the Go/WASM-to-canvas contract and the graph-based presentation experience, initially using an unrelated small model. The published default now uses Blue Dog with its complete model sources; the small fixture remains the native/WASM parity test. It is not completion of the earlier whole-product goal, a claim of engineering acceptance, or permission to infer that all planned product requirements are satisfied.

The prototype must use the actual OpenSysML Go engine as browser WASM and natively for comparison. Canned JSON can test rendering but cannot establish semantic-runtime parity. Syspresent owns the new renderer and interaction layer; the prototype does not add VS Code extension source dependencies.

## Demonstrations and acceptance evidence

| Demonstration | Required evidence | Verification case |
|---|---|---|
| Native/WASM identity and declared view resolution | Same fixture and pinned engine revision; compare semantic IDs, directed relationships and selected view membership; record unsupported operations | SV-010 |
| Focused traversal without a story | First selection is stationary; explicit contextual expansion follows actual engineering relationships; no shared-KerML shortcut; explicit scope and path capture | SV-011 |
| Notation transition | Direct same-type fade/gather/reflow and one GV engineering journey that gathers destination features before another notation; semantic correspondence and reduced-motion outcome | SV-012 |
| Narrative-aware layout | Measured Markdown panel occupies reserved display space on wide and narrow viewports; scene relayout; stable reading interval; explore/return behavior | SV-013 |
| Captured scene export | Export Markdown plus referenced SysML view/project files, reload the exercised subset, compare content and native view selection | SV-014 |
| Basic publication validation | Broken model/view/route targets reported; unavailable publication context differs from hidden view content; historical snapshot remains immutable | SV-015 |

The SysML verification definitions remain inconclusive until their actual evidence is recorded. A passing native compiler validates the specification's structure; it does not pass the prototype demonstrations. Record fixture paths, engine/browser versions, commands, observed results and known gaps rather than only a blanket test total. Partial demonstrations must be labeled partial.

## Contract responsibilities

OpenSysML owns parsing, resolution, relationship meaning and declared-view semantics. The adapter packages authoritative output into semantic elements, engineering relationships and diagram projections, retaining provenance and identity correspondence. Syspresent owns selection, dynamic layout, narrative occupancy, animation, history and presentation editing. A presentation's system boundary guides route planning; it does not prohibit deliberate exploration of loaded context.

A scene references reusable SysML views. Markdown owns presentation choreography, not a duplicate selection language. Runtime geometry is derived from viewport and content. The project is ordinary model/library sources, view declarations, Markdown, assets and a manifest; complete publication is the default. Scoped exports disclose their boundaries.

## Explicit limits

This milestone does not require complete support for every activity, sequence, state, table or fault-tree detail, multiple simultaneous diagram regions, every folder/ZIP import scenario, underlying system-model editing, collaboration/accounts, a required backend, deep model history or automatic semantic-change review. The broader supported-notation, portability and usability obligations remain in the product baseline and need later evidence. Prepared evidence is not transformed into executed analysis merely by appearing on the canvas.

Human usability requirement SP-072 remains unaccepted until an actual representative-reader evaluation. An independent code/browser review can identify defects and establish prototype observations, but cannot replace that evaluation.

## Coordination and review

Use focused tasks with clear owned files and a coordinator integrating contract, runtime and canvas changes. Do not apply the Blue Dog agent workflow to this project. Serialize generated artifact updates and publication. An independent reviewer should inspect the resulting implementation and browser experience, especially identity, edge direction, scope boundaries, model-loading failures, stale worker results, narrative overlap and export fidelity. No agent publishes independently or opens upstream dependency PRs.

The canvas is the sole viewer. Documentation must distinguish intended product behavior from features actually demonstrated by this milestone. Keep a concrete evidence record in the final integration report rather than editing planned verification verdicts to pass without a model-backed result.

## Evidence recorded on 18 October 2026

The implementation is `src/canvas-prototype/`; the fixture is `examples/canvas-prototype/`. `npm run build:canvas` emits `build/canvas-prototype/site/`, a complete static-site ZIP, and a write-once ZIP under `build/canvas-prototype/snapshots/<sha256>.zip`. Publication serves the canvas directly at `/syspresent/`; see [CI and Pages](ci.md). `.github/workflows/canvas.yml` reproduces the engine and artifact build without VS Code source dependencies; this workflow has not yet been observed running on GitHub.

The exact local dependency is David's clean branch commit `02a582d3d9baf7b9f59e5aaaa8d65f054b279bc7`. The carried patch against `af37bbf155aea785b8ac494a14afe659244bbcdf` has SHA-256 `1bcab4044a669d6eb9924f982caec510434bc61bfb6f74253c4f5c217a25fff6`. Native and WASM use Go 1.25.11; the WASM binary is 36,688,007 bytes. Provenance includes binary hashes, source diff and patch hashes, runtime version and licenses. The source branch was not pushed and no upstream PR was opened.

| Case | Scoped observation | Remaining acceptance |
|---|---|---|
| SV-010 | Real native/WASM parity script compares capabilities, identical parse/hash/diagnostics, the complete 284-element fixture export and four declared native views. Browser worker successfully resolves these same source files; requirement view: 2 nodes/1 edge, internal view: 5 nodes, activity: 9 nodes/8 edges. | The API mapping is experimental. Embedded library resolution is available, but the export does not enumerate every standard-library declaration. |
| SV-011 | Stationary selection checked by comparing actual DOM rectangles before/after selection. Context follows native engineering edges. A generated native requirement-coverage view resolves implicit satisfaction and inherited verification even when no prepared story view exposes them. Tests exclude shared-classifier/metamodel shortcuts. Explicit disconnected jumps disclose that no engineering route exists; Return restores the authored scene. | No navigation-history UI or visual route editor yet. Typing is an explicit one-hop action. Engineering coverage is limited to API composition/dependency/type roles and relationships projected by native requirement/declared views; no claim of every SysML relationship. |
| SV-012 | Browser exercised requirement→GV journey→internal view→GV journey→activity. Core tests inspect bridge/journey/gather/morph stages and direct same-kind reflow. Reduced motion shows the same final activity. Native directed edges and fork/join controls survive capture and transitions. | Full notation morphing and multi-region scenes remain unimplemented. |
| SV-013 | Actual browser checked at 1280×720, 1024×768 landscape and 390×844. Panel rectangles reserve diagram space; occupied bounds are fitted without counting unused origin space. Container headers remain above their children; narrow activity layout keeps parallel branches beside each other. Explore hides prose while preserving the current native view; Return restores it. | These are browser viewport checks, not testing on physical iOS devices or a representative-reader study. Dense general graphs still need richer camera/zoom support. |
| SV-014 | In the real browser, opened ad hoc native activity, captured a fourth scene, exported ZIP, reset to the example, and reimported through the file picker. The fourth scene's prose and 9-node activity returned. Download inspection confirmed byte-identical `model.sysml` and a new `ActionFlowView` exposing only `Flashlight::turnOn`. Native/WASM parity compares complete captured activity/internal node and edge payloads. | Exact arbitrary focused-GV capture cannot be expressed by the current native GeneralView selection; the UI rejects it explicitly. Folder import and rich Markdown assets/tables are not demonstrated. |
| SV-015 | Broken native view references, system roots, route endpoints and missing engineering links are rejected. A real browser edit to `package Broken { view missing : ; }` produced the native diagnostic `expected a name (views.sysml:1)` while retaining the current scene; closing the editor and exploring still showed 9 nodes/8 edges. Context details distinguish unavailable/boundary targets from policy/depth/budget hiding. Tests retain an old content-addressed archive while a changed build gets another path. | No hosted publication-retention check in this milestone; scoped archive omission and full library browsing need further evidence. |

Executed checks: 30 focused JavaScript tests (canvas/project/worker/UI recovery), 106 whole-root JavaScript tests, and 77 Python tests with one skip. Native compilation validates all four specification packages. Native engine build and vet pass; affected Go engine/combined/identity and WASM dependency-contract tests pass. The broader dependency suite did not pass in this environment: Node 18/WASI/crypto expectations, missing corpus, VCS metadata, timing and REPL timeout failures are recorded in `/tmp/syspresent-wasm-go-test.log`; no broad-suite pass is claimed.

An independent agent reviewed the implementation and reproduced capture-fidelity, missing-context and asynchronous-navigation defects. The fixes were rechecked, including real native capture parity and independent disconnected-return/animation-race reproductions; no remaining material findings were reported within the prototype scope. Later mobile parallel-layout and explore-in-place changes have focused regression tests and coordinator browser checks. This review does not satisfy SP-072.

The initial Markdown renderer intentionally supports prose, headings, emphasis, code spans and simple lists. Binary assets are preserved by project packaging; rich embedded evidence, substitution, sequence/state/fault-tree/table renderers, live presenting, complete history, folder import and full editor polish remain broader product work.


## Blue Dog example and mobile reading

The standalone default is `examples/canvas-blue-dog/`: all 96 current `models/**/*.sysml` files, `tools/publishing/reference.sysml`, the model README, and presentation-owned views for 31 scenes in 14 chapters. The 24 October 2026 `source.json` records each copied file's SHA-256 and the complete engineering-source digest. It explicitly identifies a working-tree snapshot based on `b94b6e0231587b52cb5bec800dba408456ca701d`; that ancestry commit does not claim to contain the uncommitted cleanups. The 20 local domain-library sources are included; the pinned engine supplies its embedded normative libraries. Copied source bytes were compared directly with the authoritative working tree. The updated sources include decision-record items, scoped architecture allocations and `satisfaction.sysml`; no new engineering disposition is implied by publication.

Focused requirements display their complete own native documentation, or the complete statement of their explicitly referenced direct type with attribution. Cards are measured in the DOM at their actual width before layout. Other context cards start compact. Selection offers **Read full statement**, which presents unscaled, wrapping text in a scrollable dialog. General requirements stay above their derivations; wrapped directed edges detour around unrelated cards when a clear outer route is available.

`npm run build:canvas` first runs `scripts/build_canvas_cache.mjs` with the pinned native engine. It prepares the declaration index, full requirement relationship coverage and initial native views. At runtime WASM still parses the complete source project. The prepared data is reused only when its bytes match the publisher's SHA-256 and its engine version, WASM fingerprint, exact document digest and native parse model hash match. Changed or imported untrusted data falls back to native compilation. Ordinary ZIP exports retain all source files. Prepared data never substitutes for source files, nor makes unsupported canvas notations supported.

The browser index uses native `ExportModel` with `projection: declarations`, retaining source declaration objects for Blue Dog and authored views without serializing every expression/membership object into the index. The refreshed native export contains 17,266 declaration objects including generated runtime context. Raw native references retain their IDs even when their target is outside this projection. The complete semantic model stays in WASM for `GetSymbol` and additional native `RenderView` calls. Sources outside the guided story boundary remain discoverable through Find; the boundary guides the story, not standalone exploration.

The requirement-coverage helper exposes 606 named requirements selected by native API kind and qualified identity. `requirementSeeds` is a generated index, checked against the fresh native declaration export during the build. Native `RequirementContext` depth one collects their engineering neighbors; JavaScript does not infer satisfaction, derivation or verification links. Anonymous requirement expressions remain in the loaded model and declaration index; only named requirements are exposed as helper seeds. Explicit seeds avoid the severe startup cost of recursively exposing 107 entire package namespaces. The generated helper can report duplicate-import-name warnings; the original Blue Dog source set parses without diagnostics.

The current clean dependency pin is `19eaec64755ff229794bda0193d4be9db9ca1b10`; carried patch SHA-256 is `cad3368db036e3e7ce2098102d2cabac92ad2353eacdb07895c55d252d9357ec`. Native/WASM fixture parity passes after optimizations, including unchanged compact declaration objects and implicit action endpoints. A full-project WASM profile with the exact helper parsed 88 documents in 9.615 seconds with 331 MB linear memory; four additional native views finished at 403 MB. These are Node measurements, not physical iOS memory measurements. Live full declaration export remains substantially heavier (about 969 MB linear in an earlier measured run); the prepared default avoids that phase, but large edited/imported foreign projects can still exceed a phone's memory budget.

The Blue Dog migration has 34 passing focused JavaScript tests, native/WASM parity, affected Go tests and an independent read-only review. Browser viewport observations and remaining limitations are recorded separately from engineering acceptance and the still-open representative-reader requirement.

Browser checks for the Blue Dog build used 390×844 and 1024×768 viewports. Initial, five-node derivation and recovery requirement cards had `scrollHeight === clientHeight`; the initial prose panel also fit fully. The full statement dialog displayed the complete native type statement at normal text size. The requirement-to-capsize action journey settled with four notation elements and no clipped card. Find opened `BlueDogIntegratedCandidate::hypothesis` outside the story, and Return restored the scene. A browser-exported 1.65 MB project ZIP contained all 86 SysML source files and all 87 original-file hashes matched the pinned provenance. These are responsive browser checks, not physical iOS validation.


## Continuous motion and peripheral context

The mobile derivation layout reported after the Blue Dog publication exposed two integration defects: reserved prose could create an empty row before a second fit pass, and labels were independently positioned on shared connection buses. Active cards are now compactly laid out inside one measured unobstructed region and fitted once. Batch routing distributes native endpoint ports, avoids cards, and reserves measured nonoverlapping label slots; short leaders associate offset labels with their actual connection. Active routes and labels are placed before peripheral context. A dense short-screen view may start with compact requirement compartments to preserve readable names; the full native statement remains available through selection and an explicit expansion.

The renderer now samples one animation clock for the complete journey. Shared semantic representations move through nonuniform waypoints using time-scaled monotone Hermite derivatives; it does not ease to a stop at every intermediate stage. Directed connections interpolate with their endpoints. Entering and leaving cards, connections and prose fade rather than being inserted or deleted visibly. Settled paths use their exact orthogonal routes. Cancellation preserves the sampled visual geometry, and Fit, compartment changes and viewport changes resolve the pending destination rather than reviving the prior scene. Reduced motion reaches the same final scene without animation.

A separate bounded native one-hop engineering projection supplies translucent surrounding connections. These elements never enter the active camera bounds. Peripheral cards occupy remaining space after active cards and label slots; if no card fits, the true connection ends at an explicit small boundary marker and context-space omission is recorded. Native kinds and endpoints remain unchanged. Activity succession is not invented for peripheral context, and shared typing/metamodel relationships do not become system connections. The budget is four peripheral elements on a narrow viewport and six on a wide one; additional context remains disclosed and available through deliberate exploration.

The updated four-file SysML specification parses through the pinned native engine without diagnostics. Fifty-seven focused tests pass, including the exact reported phone arrangement, all four derivation labels, zero-size boundary endpoints, native direction, bounded context, unchanged active geometry, through-waypoint velocity, interrupted navigation/Fit, resize recovery and reduced-motion outcome. An independent read-only review reproduced integration defects and verified their fixes; it reported no remaining material defects in its reviewed scope. These software checks do not establish physical iOS or representative-reader acceptance.

The revised full-model browser check at 390×720 retained five unclipped active requirement cards, approximately 142 pixels wide, and four separate 33×16 pixel derivation labels. Peripheral connections used opacity 0.18. Observing 119 successive DOM samples over the requirement-to-action journey confirmed intermediate transforms and partial entering opacity before the final action view; the numerical tests additionally check velocity continuity at nonuniform waypoints. Physical Safari remains untested.

Rotating from a 390×720 phone viewport to 1024×768 during the requirement-to-action journey now completes the intended four-element action view with the updated SVG viewport. This exercise caught an abandoned-zero-opacity track bug, which was fixed and independently rechecked. On shorter dense canvases, the measured prose panel uses a smaller scrollable region so active diagram text retains priority. Reduced motion and explicit Fit retain the same destination.

## Joint connection routing and trace interaction

The canvas now uses pinned elkjs 0.12.0 in a separate local browser worker to place tiles, order attachment points, reserve relationship labels and route connections together. ELK has no semantic role. The native Go/WASM engine, full project, view membership, relationship identities and endpoint order remain authoritative. The static artifact includes the worker, supplied license, source, package metadata and lockfile; no CDN or application backend is required.

Requirement siblings may stagger into narrower rows to use the active reading rectangle more efficiently. General requirements remain above their derivations. Independent terminal anchors and disabled edge merging distinguish the four derivation paths. Actual native embedded ports are projected as small glyphs on their owners, with their exact measured labels and native port IDs; display-only anchors never receive model identities. Activity forks and joins retain parallel branches, with attachment geometry matching their visible bars.

The active camera fits tile, route and label bounds together. Translucent one-hop context is placed after active corridors and labels have been reserved. A continuation chevron is not a modeled junction. Unknown relationship notation and impossible routes or labels are disclosed. No obstructed route receives a straight-line fallback. During motion, interpolated paths are checked against visible tiles and container headers; clear orthogonal routes replace unsafe interpolations. Changes of route topology crossfade over 140 milliseconds when the outgoing route remains clear. Invalid outgoing routes are hidden. The full journey still uses one continuous clock.

Touch or keyboard selection emphasizes the complete relationship and its endpoints without moving tiles. Active connection hit targets are above the narrower peripheral targets, so translucent context cannot intercept an overlapping active route. Navigation and resize use asynchronous layout request identities; a stale successful or rejected layout cannot replace newer scene content.

Evidence for this revision: all 99 canvas/worker tests pass; all four product specification files parse natively without diagnostics; the complete Blue Dog native-cache and static build succeed. Tests include actual captured native embedded-port payloads, port-owner body/header clearance, route/label camera bounds, multiple derivations, crosslinks, action concurrency, touch-layer priority, stationary tracing and obsolete layout success/failure. An independent read-only review found port-contract and stale-failure defects, verified their repairs, and reported no remaining material findings in its final reviewed scope.

Rendered checks used 390×650 and 390×720 phone viewports and a 1024×768 viewport. The Blue Dog derivation scene has five unclipped active cards and four separate labels; direct route taps and keyboard selection expose trace actions without changing tile transforms. An unrelated flashlight fixture with a real native battery-output/lamp-input connection rendered nested port glyphs and labels, and its activity scene retained concurrent power and temperature checks. Across 55 successive DOM observations of a requirement-to-action journey, 29 observations sampled motion, 17 showed partially fading active tiles, and none found a visible route intersecting a visible leaf tile. These are responsive browser/software observations; physical Safari and representative-reader acceptance remain unverified.

## Focused requirement exploration and author display preferences

Requirement selection now offers Origins, Derived requirements, Design impact and Verification on the existing graph canvas. Origins and derived traces follow opposite directions of native derivation/refinement links; satisfaction and verification preserve their native system/case-to-requirement arrows. At most one explicit requirement definition/usage typing bridge supplies links authored on the other representation, keeping both identities and the typing relationship visible. Generic context prioritizes these requirement traces before generic dependencies, using only native relationship kinds.

Active budgets include focus and necessary typing bridges: five elements on narrow screens and seven otherwise. Deterministic pages replace neighbors rather than accumulating more tiles. The header reports shown/total neighbors and exposes More only when needed. Context boundaries disclose unavailable targets and policy/budget omissions. A zero count means no matching link in the loaded projection, not proof that none exists in the full model. Verification links do not infer executions, verdicts or acceptance.

Selection remains stationary. Back/Forward restores the actual native/projected viewpoint, focus, expanded and collapsed statements, result page, original context disclosure and scene display settings. Return to scene is reversible through history. Guided scene navigation is hidden during manual exploration, leaving Return as the story handoff. Authored relationship emphasis is suspended for an explicit trace so the selected path stays clear, and restored with the scene. Obsolete successful or failed layouts cannot replace newer navigation; failure recovery also restores history stacks. The review caught and verified repairs for an authored-expansion override and a failed-Return history duplication.

The Diagram presentation editor section exposes initial compartments, explicit expanded native references, relationship emphasis, peripheral context budget and soft sibling ordering by actual native owner. Invalid fields and unresolved or ambiguous references are rejected before applying edits. Markdown and project export preserve these JSON preferences in ordinary scene blocks. Native view definitions continue to own model selection. The Blue Dog scenes now exercise compact derivation compartments and explicit relationship emphasis/context budgets. Arbitrary focused-subset capture as a new exact native view remains unsupported; the existing declared-view and native internal/activity capture paths remain available.

Validation: all 133 canvas/worker tests pass; the four SysML specification files parse with no diagnostics; the full Blue Dog native-cache/static build succeeds. An independent read-only review checked native authority, directional traces and typing bridges, deterministic pagination, preference validation, history and failure recovery, and found no remaining material defects after repair. The actual native coverage graph supports GorgeChallenge::trafficCoexistence → BlueDogRequirements::trafficSafety → BlueDogRequirements::trafficTracking, with satisfaction from BlueDog::Architecture::NavigationAndSensing::traffic and verification from BlueDogRequirementVerification::TrafficSafetyVerification.

Rendered checks exercised that path in the full-model browser at 390×720, plus bounded default context at 390×650 and restoration/editor controls at 1024×768. The tracking requirement and allocated component had unclipped cards; verification displayed its native case and the modeled-not-executed disclosure. Story restoration recovered the authored native viewpoint, and editor controls reflected the scene's declared settings. These are responsive browser checks, not physical iPad/Safari or representative-reader acceptance.


## Decision-chain placement and clear departures

Source requirements now appear above derived/refined requirements. Satisfying parts and verification cases appear below the requirements they address, preserving their native upward satisfaction/verification arrows. Visual rank does not create ownership. The actual five-node Blue Dog scene now uses four distinct two-bend paths (eight bends total, zero active crossings), with lower-row links attaching to facing side terminals rather than wrapping across the middle row. The optimizer preserves hard card/label clearance and skips behavioral, compound and actual-port simplification. A balanced-parent alternative for small flat requirement fanouts centers the wide fixture above its children and reduces total path length from 1,344 to 976 layout units, with zero crossings.

Peripheral connections carry native relationship labels. Each clipped continuation has its own marker and native neighbor identity; it does not create a junction with another relationship. If a safe labeled stub cannot fit, the context disclosure records `context-continuation-space`. Active centering and fit remain independent of this context.

A tile scheduled to occupy a departing tile's region waits while that tile moves off frame and fades. Retained cards and held arrivals are obstacles; if all exits are blocked, the departing tile fades before contact. Replacement movement begins smoothly. Routes are revalidated against current endpoints as well as obstacles, and invisible routes cannot intercept touches or keyboard focus.

Validation for this revision: all 160 canvas/worker tests pass; all four product SysML files parse natively without diagnostics. An independent read-only review found and verified repairs for an exit crossing a retained card and invisible edge hit targets, with no remaining material findings in its final scope. The native model and engine pin are unchanged.

Rendered checks used 390×720, 390×650 and 1024×768 viewports. The phone derivation scene retained five unclipped active cards, four distinct native derivation labels and a translucent labeled verification continuation. At 390×720, 65 successive DOM observations sampled the first-to-second scene transition: `trafficCoexistence` moved above the frame and faded before `trafficSafety` entered its region; no sampled invisible edge retained an interactive target. Design impact placed the traffic-sensing part below `trafficTracking`; verification placed `TrafficSafetyVerification` below it, preserving native arrows and the modeled-not-executed disclosure. These are responsive browser/software checks; physical Safari and representative-reader acceptance remain unverified.


## Expanded requirement routes and ancestor journeys

The expanded communications requirement exposed a second geometry failure: unequal child heights made exact-y row detection unreliable, and ELK could rearrange nodes after attachment-side choices were calculated. The flat structural solver now checks actual intervening rectangles, reassesses sides through bounded retries, and penalizes crossings strongly enough to prefer a clear route over a marginal fit gain. Expanded native communications fixtures retain two child rows at phone sizes, with eight bends, zero active crossings and maximum route stretch below 1.15. The former fixture had twelve bends and one crossing. Small focused general views also compare centered-parent placement; behavior, compound frames and actual native ports retain their existing semantics.

Disjoint same-notation views now use the common-ancestor planner instead of bypassing semantic routing. Directed engineering ancestry has priority; a separate native project-ownership index supplies a labeled location fallback. Each GV hop retains at most three route elements, its actual native links and local focus. Shared-content same-notation scenes still reflow directly. Saved explicit paths are retained, including Blue Dog's qualification-to-capsize-decision dependency, and fail validation if their scoped links no longer resolve. No permitted common ancestor produces a disclosed explicit jump, not a fabricated global model root or a library/type shortcut.

Departure scheduling now operates per adjacent viewpoint interval and preserves every supplied waypoint, including nonuniform timing. Active GV hop paths and labels are exempt from the whole-journey midpoint dimming and destination scene's unrelated emphasis. Live journey paths route together as a batch to preserve distinct terminal attachments; measured labels reserve clear slots and are hidden if they require an unrendered leader or overlap a current path. Final authored geometry and preferences are restored.

Validation: all 177 canvas/worker tests pass; the four product specification files parse natively without diagnostics. Native cache and engine/model pin are unchanged. Independent read-only review found and verified repairs for scoped saved-route rejection, departure timing that hid an intermediate destination, and per-edge live routing that accidentally merged common-parent attachments. No material findings remain in the final reviewed scope. These software checks do not establish arbitrary-model readability or physical Safari/representative-reader acceptance.


Rendered full-model checks at 390×720 reproduced the exact communications context page, then expanded its parent statement: five active cards remained unclipped, and the four active derivations followed distinct two-bend routes. A 140-sample observation of traffic-to-recovery navigation showed the actual `BlueDogRequirements` ancestor and separate `owns` terminals during the flight; active hop labels stayed visible while the source faded and the destination gathered. Journey notices now use footer flow instead of covering the prose. Native route checks also resolve recovery-to-capsize and the two supervisor actions through their actual permitted ancestors while retaining the authored capsize dependency. Physical iOS/Safari remains untested.


## Translucent connection crossings

Peripheral connections now route against the actual active polylines and each other, including collinear overlap and false shared buses. Active cards, paths, labels and fit remain fixed. The router compares bounded orthogonal alternatives and a second decorative placement, reserves labels along complete paths (including terminal stubs), and may replace congested or substantially detouring contextual cards with separate short labeled continuations. A single otherwise readable unavoidable crossing may retain its full card with an explicit residual notice. Crossings at bends or T contacts count once per coordinate. Genuine point endpoints remain distinct from shared line segments.

The app uses finalized peripheral routes instead of independently rerouting them afterward. During motion it preserves safe sampled geometry and uses only a small cheap candidate set when conflicts arise, without visibility-grid searches or card relocation per frame. An outgoing crossfade cannot reintroduce worse crossings against active or current contextual paths or cross a visible label. Context disclosure distinguishes residual layout conflicts, shortened links and links not drawn; it does not present visible residual conflicts as hidden model relationships.

Validation: all 188 canvas/worker tests pass, and all four SysML specification files parse natively without diagnostics. Independent read-only review verified the repairs for a terminal stub crossing an active label and an outgoing crossfade reintroducing a context crossing; no material findings remain. Tests cover fixed active geometry, native identity/direction, distinct attachments, active/context and context/context crossings, overlap, labels, impossible fits, bounded live routing and the single-crossing/dense-context tradeoff.

In the full Blue Dog browser at 390×720, the expanded communications context changed from seven visible peripheral links with nine strict crossings and about 293 pixels of shared path to six labeled links with zero crossings or overlap. The five active card transforms/sizes and four active SVG paths were unchanged. Four links use short explicit continuations around one full contextual card. This is a responsive browser comparison, not physical Safari or representative-reader acceptance.


Final rendered checks repeated that comparison after the density refinement, exercised Return through the full-model ancestor journey with 100 DOM motion samples (88 during its middle interval), then checked the five-node derivation at 1024×768. The journey settled correctly; landscape contextual continuations remained separate from the active routes. These observations do not measure physical-device frame rate.


## Structural exploration of parts and packages

Part Focus now gives structural context priority over competing requirement links: its whole, direct type and declared subparts. The usage and definition keep separate native identities and a visible typing link; subparts declared by the definition stay attached to it. Only that direct definition is bridged. The bridge does not expose its owning package, base classifiers, requirement traces or sibling typed usages. Native peer connections between selected contents are retained without adding nodes.

Package Focus shows its containing package and directly owned source declarations using `owns` containment notation, distinct from part composition. Native declarations include enumeration, concern, metadata and view categories as well as engineering elements; memberships, documentation and expressions remain excluded. Ownership comes only from exported native owner roles and source declarations. No qualified-name hierarchy is inferred. Parts / contents and Containing element actions expose each direction, share bounded paging and history, and preserve the default top-down whole-to-contents order. Requirement exploration keeps its engineering priorities; automatic journeys still cannot shortcut through shared types.

Validation: all 197 canvas/worker tests passed. The four product SysML files parsed through the pinned native engine with no diagnostics. Independent read-only review identified an omitted declaration-category filter; the repair and expanded native declaration policy were reviewed with no remaining material findings. Tests cover native direction/identity, source-only ownership, explicit type bridges, no type-ancestry or sibling-usage expansion, filters, unavailable targets, page bounds, immutable input, peer connections, canvas actions, top-down placement and history.

Rendered full Blue Dog checks at 390×720 showed navigation with its Boat container, NavigationAndSensing definition and declared parts, all active cards unclipped. Contents exposed all three declared navigation parts with the explicit typing link. Containing element reached Architecture, whose default view showed BlueDog above it and owned part declarations below. At 1024×768, BlueDogMissionScope showed five native owned declarations, including MissionKind and Applicability metadata. At phone size, its contents paged four then one; Back restored the first page. Return restored the story, and Derived requirements still displayed the four native trafficSafety derivations with five unclipped active requirement cards. These are responsive browser checks, not physical Safari or representative-reader acceptance. Engine and Blue Dog source pins are unchanged.


## Real neighboring tiles and graph camera

The prepared neighborhood now defaults to 48 one-hop native neighbors on every viewport, configurable from 0 to 256. Inclusion follows deterministic focused-element priorities and a balanced allocation across active anchors; source/native identity ordering breaks ties. Viewport size, prose occupancy and camera movement do not change which neighbors are selected. A declared scene may specify its own limit. Blue Dog's six scenes now inherit the larger default. Omitted kinds, unavailable targets, budget exclusions and unavailable routes remain explicitly disclosed. More neighbors increases the cap by 48, up to 256, through an explicit action. It does not recursively traverse newly visible nodes.

Each included neighbor has a real translucent tile, normally outside the initial reading area, and complete available native connections. The previous viewport-squeezed cards and continuation arrows are superseded by this policy. Active tiles, paths and initial Fit remain independent of peripheral bounds. Distinct perimeter attachments, orthogonal route alternatives, fan candidates and bounded lane refinement avoid false shared buses. Clearance against cards and measured active labels is mandatory. Crossings within the active reading area cost more than crossings in the offscreen graph; residual conflicts and labels without a clear slot remain disclosed rather than implying missing native relationships.

Drag pans the graph; pinch, wheel, keyboard and View-menu zoom actions change only its camera. Show neighborhood frames the prepared world. Fit restores active content. The graph is clipped to its measured prose-free area while Markdown and controls stay fixed on screen. Selection remains stationary; explicit Focus prepares a new neighborhood. Back/Forward restores camera position and neighborhood limit along with the existing view, statements and scene preferences. Keyboard focus reveals an offscreen tile by moving the camera without DOM scrolling. A manual camera gesture finishes current motion before taking over; stale asynchronous journey layouts cannot later overwrite that camera.

Multi-stage navigation opens around the actual route, follows prepared native engineering or ownership-ancestor viewpoints, then settles at the destination active fit. Geometry and camera use the same continuous clock and preserve fade/departure rules. Unrelated peripheral bounds do not dictate travel zoom. Intermediate GV links keep their active journey emphasis even when the same relationship is peripheral at the destination. Reduced motion retains the same settled information and history.

Validation: all 245 canvas/worker tests pass, and all four product SysML files parse through the pinned native engine without diagnostics (specification hash `555761725fee094bc078af442447a99186505083a742108911117b5fc02e1556`). The complete Blue Dog cache/static build succeeds with the existing engine and model pins. A final independent read-only review ran 96 focused tests across camera, journey, neighborhood, app, context and preferences, reporting no material runtime findings. It caught a stale 0–8 documentation limit, now corrected. Its separate 256-neighbor composition probe retained every link with zero blocked routes, shared segments or crossings in 2.18 seconds on the development machine. This is a bounded-work probe, not a mobile performance guarantee.

The captured dense native opening fixture retains all 42 neighbors and 60 contextual links, zero blocked routes, zero shared line segments and unchanged active geometry. It has 123 residual crossings across the full world, including 27 within the initial reading area (the preceding full-neighborhood layout had 174 and 88 respectively); none cross its active link. This is an improvement, not a claim of globally optimal routing. The actual 1024×768 browser preparation reports 120 crossings and zero blocked/shared routes because its measured geometry differs slightly from the fixture.

Rendered full-model checks at 390×720 show 42 real neighbors, 60 contextual links plus the active derivation, no continuation stubs and unclipped active statements. Show neighborhood changes only the camera; all tile transforms and dimensions remain byte-identical. Selecting trafficTracking leaves that overview camera stationary, Focus reaches its native requirement context, and Back restores the exact saved overview transform. Earlier rendered observations also exercised drag and keyboard focus without tile relayout or DOM scroll. At 1024×768, 120 successive DOM observations of traffic-to-recovery navigation sampled 25 moving states and 26 distinct camera transforms, including opening zoom, travel at 0.78 scale, and final active fit at identity. The recovery scene settles on its three actual active requirements. These are responsive Chromium/software observations. Physical iOS/Safari frame rate, pinch ergonomics and representative-reader acceptance remain unverified.


## Demo landing and optional project descriptors

The prototype URL now opens a landing page with Blue Dog and flashlight demos and local SysML/KerML, folder and ZIP intake. No demo is fetched and no semantic worker starts until a selection. Home returns to the landing page; Resume restores the existing loaded model. Folder selection is offered only when the input API advertises directory support. Narrow layouts keep the main model-file action visible and place secondary import options below it. Direct demo links use the catalog ID in `?demo=`.

Basic exploration now works with no manifest, story or prepared views. The optional v2 author descriptor expresses title, navigation roots/start and intentional source/publication overrides. Native roots, requirement seeds, source/asset lists and view catalogs are discovered; cache and viewer identities/digests are generated. Blue Dog's descriptor shrank from 859 lines to 15 while preserving its seven intentional navigation roots, all 86 pinned model/library source files and source.json provenance. Its cached semantic results are regenerated through the native engine. New exports keep the compact descriptor; frozen v1 bundles remain readable under their existing contract.

Independent read-only review found two material intake defects: a conventionally named views-only source could lose its native roots, and a delayed fetch/read could overwrite a resumed project. Both were repaired and independently rechecked. The browser also exposed a hidden-stage ResizeObserver request with zero dimensions on Home; the viewer now ignores it and has a regression. A final independent followup ran 66 affected checks and reported no remaining material findings. All 276 canvas/worker tests pass. All four specification files parse natively without diagnostics, with specification hash `0d1582f0e45c8a0114692c782a6326ad3464ea3135e17b1e6b5b76025ff88333`. Native cache and static multi-demo build succeed; the engine/model pins remain unchanged.

Rendered checks used 390×720 and 1024×768. The flashlight demo resolves 67 native elements and four authored views. Selecting only its model.sysml opens the actual Flashlight package, parts and verification case with no story or authored-view file. The browser-exported ZIP contains unchanged model.sysml, blank presentation sources and a two-field v2 descriptor (schemaVersion and title); importing that ZIP restores the same active native elements without diagnostics. A separate source named views.sysml containing an Uploaded package, a Sensor definition and its typed usage, but no requirements or native views, also opens correctly. Blue Dog selected from the landing page loads all 13,125 native elements, nine available views and six story scenes, settling on trafficCoexistence and trafficSafety. Local selection path/size/duplicate checks, folder-relative paths, archive traversal rejection, cache trust and portable v1 project compatibility have automated coverage. Physical folder-picker behavior and iOS performance remain unverified; these checks do not establish representative-reader acceptance.


## Native view regions, reader controls and routing

The standalone workspace now supports graph, grid and sequence regions. Native
tables and matrices use sticky headings, normal-size text, independent scrolling,
column sizing and inspection. Table sorting preserves native record identity;
matrix axes preserve native ordering. Exact cell selection, scrolling, sorting,
column widths, graph cameras and coordinated comparisons are included in history.
Multiple native relationship declarations in a matrix cell remain individually
inspectable and explore with their original endpoints and direction. Blank cells
are explicitly limited to the current view.

Scenes accept additional native view regions, editable from the presentation
editor. Wide spaces display them together; narrow spaces provide explicit tabs.
Shared selection highlights matching identities without moving a region. Explicit
exploration moves to the graph, and Back restores the previous surface.
Cross-notation motion uses at most 24 native identities and measured visible
anchors, rather than animating every grid record.

State, case, mixed and fault-tree diagrams use behavior-specific graph faces.
Sequence views preserve native participant/message order and self-messages on an
independent scrollable surface. Unsupported native constructs remain disclosed.
Native interaction fragments are not reconstructed from labels.

View offers persistent All, None and Focused optional compartments (default All),
and Square or Mind-map connection routing (default Square). Focused refers to
explicit focus; first selection does not rearrange the scene. Mandatory behavior
details remain visible. Curves retain terminals and arrow semantics and use safe
corridors or square fallbacks around obstacles. Graph camera actions are disabled
when the primary surface is a grid/sequence or is hidden by a narrow region tab.

Validation for this change: 316 canvas/worker tests passed; Python tests passed
(82 tests, one skipped). All four product specification files validate with the
native compiler. Native/WASM parity, including actual grid fixtures with duplicate
relationships and derivation direction, passed. The rebuilt native engine is clean
revision `761d37ebd01ce37b69a46e0b9fc71671f46ac310`; the Blue Dog cache and static
multi-demo build succeeded. Independent reviews covered region lifecycle, shared
selection, history, native identity and notation, and curved-route safety; material
findings were repaired and retested.

Browser inspection used the new desk-fan view gallery at 1280x720 and a 390x844
responsive viewport. It exercised the global controls, nested states, case shapes,
mixed notation, shared-cause fault trees, ordered/self sequence messages, ordinary
tables, narrow scrolling matrices, duplicate-relationship inspection and
matrix-to-graph exploration with Back. The browser error log was empty in this
review. This does not establish physical Safari performance or reader acceptance.

The broader dependency Go suite was attempted but is not green: it includes
package timeouts, absent pilot corpus/VCS prerequisites, a pre-existing rendering
metadata expectation mismatch and system Node 18 crypto limitations. Focused native
build, vet, grid/clone/identity tests and actual WASM checks passed. These dependency-suite limitations are not reported as passes.


## Structural prominence overview checkpoint

Standalone models without authored entry scenes, views or focus now open a bounded
system overview. Native child/descendant and distinct-neighbor counts determine
structural prominence; separate roots are represented before balanced child rounds.
Unfilled slots avoid asymmetric detail when a whole root round cannot fit. Named
native elements qualify; library/generated plumbing does not. Counts describe the
loaded projection, and descendant caps are disclosed. No aggregate model links
are invented. View > System overview makes the same selection explicitly; Expand
contents and normal Back/Forward retain the reading state.

The full 13,125-element Blue Dog model was inspected in the browser at 1280x720
and 390x844. Its authored first scene still opens first. Explicit overview showed
seven root cards on wide screens and six on narrow screens, exact count badges,
and no peripheral nodes. Selection, contents expansion, Back and the selection
explanation were exercised. The header now refreshes after a resize restarts a
transition. Browser error logging was empty. Full compartments remain visible by
default; fit-to-screen text in long package documentation still requires zooming
on narrow screens. This review does not establish reader acceptance or physical
Safari performance.

All 344 canvas tests passed, including port metrics and resize-restart regressions.
The static multi-demo build and all four native product specification validations
passed. Python tests passed (82 tests, one skipped). Independent review covered
ranking, native scope/identity, projection bounds, comparison/history restoration,
resize transitions and port count badges. Existing dependency-suite limitations
recorded above remain unchanged.


## Chaptered stories and supporting figures

The canvas now supports named chapters, Contents, direct scene/chapter URLs,
publication-version checks, bundled figure regions, model links in prose and
model-linked context/evidence cards. See [the format and authoring guide](canvas-story-content.md)
and [the local evidence record](requirements-evidence.md#canvas-story-publishing-21-october-2026).

The default source snapshot is now sv-blue-dog b94b6e0: 86 model SysML files plus
the publishing reference, the model README and authored views. The complete
newcomer story now contains 31 scenes across 14 chapters, with course, rig and
IC-01 input figures. The earlier source and feature counts above describe
historical milestones. The flashlight example demonstrates prepared analysis
provenance, without claiming a physical measurement.

## Package workspace and native view navigation

Choose **Explore model**, then **Explore package…** and select a native package such as `GorgeChallenge`. The workspace keeps that package as the reader scope while the focused element changes. **Overview** returns to its bounded overview; **Up** opens the native containing package when one exists; **Whole project** clears the reader scope. Selecting a package tile also offers **Explore package on its own**. Search, contents paging, relationship actions and surrounding context use native ownership membership, including nested declarations. Crossing links remain disclosed in Context. Back/Forward restore scope, viewpoint and camera; Return to scene restores the story.

The persistent **View** chooser opens declared native views or applicable views of the focused element. Packages offer a bounded overview and contents plus complete native tree/general renderings; parts offer internal views, actions offer activity/sequence views and states offer state views. Declared requirement, case, fault, table and matrix views remain available directly. The pinned engine has no `#requirement` shortcut. Complete native renderings can be large. Empty or unsupported results retain the current viewpoint and report their limit.

Native views that cross package scope require explicitly choosing Whole project. The explorer checks represented native identities and relationship endpoints before replacing the view; it does not trim behavior, grids or relationships to manufacture a scoped rendering. **Compare views…** opens the secondary native catalog. **Display** contains compartment, routing and camera settings. Package scope is currently session history state; published links still restore authored scenes.

## Complete Blue Dog introduction

The authored sequence covers the Gorge challenge; requirements and owner
constraints; operating scenarios; logical responsibilities; traffic; recovery
and capsize; sail and actuator trades; IC-01 and coupled sizing; structure and
wet service; energy; physical equipment; supervisory policy; evidence and risk;
and the qualification campaign. Every chapter has native model references.
Chapter transitions permit an explicit view jump when no engineering route
connects the selected endpoints; story order does not fabricate model links.

The narrative distinguishes finite Gorge acceptance from future repeated/ocean
operation, nominal inputs from measurements, logical scenarios from executable
policy, and numerical closure from physical qualification. Older evidence keeps
its own configuration and revision. Authoring did not modify the pinned Blue Dog
model or execute a new boat-analysis campaign.
