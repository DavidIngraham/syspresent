# Standalone canvas prototype milestone

## Purpose and scope

This milestone implements the architecture agreed on 18 October 2026. It is a deliberately small proof of the Go/WASM-to-canvas contract and the graph-based presentation experience, using an unrelated small model. It is not completion of the earlier whole-product goal, a claim of engineering acceptance, or permission to infer that all planned product requirements are satisfied.

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

The old viewer may coexist with the prototype. Documentation must distinguish the target architecture, the old implementation and features actually demonstrated by this milestone. Keep a concrete evidence record in the final integration report rather than editing planned verification verdicts to pass without a model-backed result.

## Evidence recorded on 18 October 2026

The implementation is `src/canvas-prototype/`; the fixture is `examples/canvas-prototype/`. `npm run build:canvas` emits `build/canvas-prototype/site/`, a complete static-site ZIP, and a write-once ZIP under `build/canvas-prototype/snapshots/<sha256>.zip`. These are local artifacts; the new canvas has not replaced the published viewer. `.github/workflows/canvas.yml` reproduces the engine and artifact build without VS Code source dependencies; this workflow has not yet been observed running on GitHub.

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

The initial Markdown renderer intentionally supports prose, headings, emphasis, code spans and simple lists. Binary assets are preserved by project packaging; rich embedded evidence, substitution, sequence/state/fault-tree/table renderers, live presenting, complete history, folder import and full editor polish remain broader product work. Existing viewer examples and evidence remain separate.
