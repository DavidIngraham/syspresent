# Previous viewer requirements evidence

This 17 October assessment describes the previous viewer. The 18 October canvas architecture supersedes several requirements it assessed; those older verdicts do not establish compliance of the new canvas. See [canvas prototype evidence](canvas-prototype.md) for the current scoped implementation.

Assessment date: 17 October 2026. This is a source-and-test inspection of the current working tree, not release acceptance. “Implemented” means a concrete implementation and relevant regression coverage exist; it does not assert that every test was rerun for this assessment. No representative-reader study or deployed CI run was observed. The reviewer previously authored native identity transport, snapshot packaging and shared-state validation, so assessment of those components is not independent. No implementation was changed during this assessment.

Evidence paths below are repository-relative. Test references mean tests inspected, not new execution results. Earlier focused shared-state tests were run by this reviewer, but those results do not validate later integration changes.

## Current verification and remaining gaps

The coordinator reports 73 Python tests and 45 Node tests passing on 17 October 2026 (Node 24 with the pinned OpenSysML source configured). The coordinator also reports 330 native renderer TypeScript tests passing and 16 app tests within the Node aggregate. These are reported aggregate results, not reruns by this reviewer. Local `build/site/catalog.json` now records assembled Blue Dog, flashlight and notation-fixture snapshots. Local assembly is not deployed CI or reader acceptance.

- **SP-012:** Export now declares `evaluationMode: bound-attribute`; context is explicitly a provenance label. Inputs and instance rebinding are unsupported and rejected, so general contextual evaluation remains outside the implemented capability.
- **SP-046:** Details now expose exact native query rows and native rendered verdicts for selected semantic IDs. This closes the earlier dropped-data presentation gap for configured views; elements outside those queries/views still lack a general evidence/verdict projection, and sources remain raw metadata.
- **SP-050/051:** The fault-tree connection-kind/geometry defect is fixed and locally browser-checked. Native action guard/fork/join semantics remain present, and authored semantic placements now separate the tutorial guard branches in a browser-checked snapshot. Rendered checks are documented in [browser-validation.md](browser-validation.md); complete release acceptance remains open.
- **SP-053:** Prepared evidence now explicitly distinguishes recorded execution from prepared analysis, with required source/configuration/inputs and recorded run identity. Compiler and display tests cover the contract; no actual recorded run or physical verification is invented by these fixtures.
- **SP-064:** Previously identified entry-point and mode/shared-state issues are resolved and reviewed. Declarative configuration is implemented; this does not replace broader usability acceptance.
- **SP-021/072:** The build workflow now builds both CLI and gRPC binaries, packages snapshots and preserves history; notice archives normalize metadata. A deployed CI run and representative-reader study remain unobserved. Clean reviewed dependency pins remain required.

## Requirement matrix

| ID | Assessment | Concrete evidence and remaining gap |
| --- | --- | --- |
| SP-001 | Partial | `examples/flashlight/story.md` explains definitions/usages, claims/verdicts and possible behavior for newcomers. Comprehension remains untested. |
| SP-002 | Implemented locally | `src/app.mjs` fetches static bundle/story/manifest; `scripts/package_review.py` assembles static assets. Hosting and released URLs not verified here. |
| SP-003 | Format implemented | `scripts/story_compiler.py` preserves stops, annotations and speakerNotes; authoring guide documents later presenter mode. No presenter UI claimed. |
| SP-010 | Implemented | Compiler and `tests/test_story_compiler.py::test_linear_order_provenance_identity_and_no_mutation`; Markdown plus declarative stops, figures and tables. |
| SP-011 | Implemented, bounded | Compiler typed substitutions; `tests/test_native_units.py` checks native reductions and rejects spelling as authority. Deliberate supported-type/unit limits remain. |
| SP-012 | Implemented for bound attributes only | Export explicitly declares bound-attribute evaluation and rejects inputs/other modes. Context labels are retained without suggesting native instance rebinding. General instance/config/result evaluation is not supported. |
| SP-013 | Supported editorial boundary | `docs/authoring.md`, stop modelRefs and examples distinguish model assumptions from narrative. Arbitrary prose engineering claims require editorial review. |
| SP-014 | Implemented | Prepared asset source/context and hashes in native exporter/package builder; `tests/test_export_assets.py` covers copying/provenance. No reader analysis execution. |
| SP-015 | Implemented, scoped | Compiler source diagnostics, required assets and schema failures; packaging rejects unmapped nodes/required-view errors. Unknown/unassessed preserved by compiler; native adapter does not export every possible unresolved-value type. |
| SP-016 | Implemented | Allowlisted JSON substitution grammar; compiler unsafe-expression/type/format tests. No author code evaluation. |
| SP-017 | Partial | `app.mjs::buildStory` renders ordered prose/evidence and inline mobile scenes. Linear representation exists; full no-animation reading quality not user-tested. |
| SP-018 | Implemented | Compiler requires final closing block with supports/open/next; both example stories supply it. |
| SP-020 | Implemented locally | `scripts/snapshots.py`, package builder and immutability/tamper tests freeze source, model, assets and viewer provenance. Real published retention not checked. |
| SP-021 | Implemented; clean command checked locally | `scripts/build_ci.py` and `.github/workflows/build.yml` run native export, browser build, immutable assembly and history preservation; gRPC service and CLI roles are separate. The full clean local command exported and packaged all three examples at viewer commit `cc61dab`; no hosted GitHub Actions or Pages run is claimed. |
| SP-022 | Implemented locally | Catalog lifecycle APIs and package lifecycle/catalog-only tests retain snapshots and support reason/replacement metadata. Public historical URL behavior not checked. |
| SP-023 | Implemented | Catalog reviewer/date/outcome metadata stays outside frozen snapshot; `test_lifecycle_metadata_does_not_mutate_snapshot`. No engineering approval inferred. |
| SP-024 | Implemented | Snapshot-local URLs/model store; restoreState rejects snapshot mismatch; exploration history/share regression. |
| SP-025 | Follow-on | No authored evolution timeline implemented. Explicitly outside first-release scope. |
| SP-030 | Implemented locally | App scroll activation, outline and stop hashes; app direct-stop regression. Human scrolling comfort not assessed. |
| SP-031 | Implemented; readability acceptance pending | Cached native frames and explicit reset restore authored scenes. Browser checks confirm 100% → 125% → Resume 100% on desktop/mobile; authored guard branches are separated and browser-checked. |
| SP-032 | Implemented and locally checked | Reading bands/full-width evidence/mobile disclosure have regressions. Browser validation confirms inline scene reset and document scroll width equals client width at 375 CSS pixels; broad device/user acceptance remains pending. |
| SP-033 | Implemented and locally checked | Story pause/resume restores authored framing and reading context; real-renderer integration checks independent inline/main camera state and compartment restoration. See browser-validation.md. |
| SP-034 | Implemented locally | Compiler resolves semantic prose links by exact ID/FQN and validates annotation membership; app activates only compiled ledger targets. Compiler/app regressions cover links and selection. Human interpretation remains untested. |
| SP-035 | Implemented | Camera/placement/annotation overrides copied onto native layout; compiler membership checks and renderer native-source-immutable regression. |
| SP-036 | Partial | Stable cached frames and instant scene changes avoid invented cross-notation morphs. Reduced-motion/browser behavior and perceived correspondence need rendered review. |
| SP-037 | Partial | Native nodes support Enter/Space, tables use real buttons; renderer keyboard/row-selection tests. No complete keyboard or assistive-technology audit. |
| SP-040 | Implemented, basic | Focus/search/neighbor expansion in app and pure exploration context. Selection is whole-neighborhood plus filters, not a rich per-edge expansion chooser. |
| SP-041 | Implemented, raw vocabulary | Independent node/relationship filters, explicit incoming/outgoing and native edge kinds; direction test. Native API-property vocabulary can be confusing; semantic-specific UX not comprehensively tested. |
| SP-042 | Partial | Context budget, omissions and filter reasons; budget/hidden-intermediate tests. Authored native views are not reduced by that local-graph budget; no separate pre-expansion selection dialog. |
| SP-043 | Implemented within export | `src/model_store.mjs`, shard index and ownership/unavailable disclosures; model-store, ownership and shard tests. Coverage restricted to configured native library exports; not all installed libraries implicitly exported. |
| SP-044 | Implemented | Navigation snapshots focus, filters, pinned/expanded context; back/forward/reset controls and history test. |
| SP-045 | Implemented locally | Bounded shared state stores snapshot/stop/view/context, validates native membership and provisional shard IDs; exploration tests and app asynchronous resolution. Shared-state code was authored by this reviewer. |
| SP-046 | Implemented for configured native records; partial coverage | App details exposes native query rows and rendered verdicts using semantic mappings, plus description/raw source/relevant views and claim disclaimer. Arbitrary elements outside those views lack general verdict/evidence extraction; source navigation remains limited. |
| SP-047 | Implemented and locally checked | Question reader opens from requirement selection and Explore. Native statements, annotations and exact upstream relation rationale; navigable source/derived/system/verification records. C-009 to S-001 and Back checked in the browser. |
| SP-048 | Implemented and locally checked | Named indirect paths, grouped verification targets, declared-result labeling, bounded link/application disclosure, lazy-loading and unavailable-target regressions; native diagram remains secondary. Reader acceptance is separate. |
| SP-050 | Implemented kinds; acceptance pending | Required-kind dispatch, native fixtures and local browser checks cover diagrams/tables/matrices. Fault-tree actual connection-kind routing fixed; authored guard branches are separated and browser-checked. |
| SP-051 | Implemented preservation; readability pending | Browser checks observe nested state markers, ordered sequence/self-message, guard labels and fork/join semantics. Fault-tree topology regression uses actual native connection edges. Complete reader interpretation is untested. |
| SP-052 | Implemented and locally checked | Native semantic mappings retain selection across diagrams/tables. All four actual matrix rows now map from native source origins; browser keyboard activation selects GuardCheck and focuses details. No label inference. |
| SP-053 | Implemented prepared-evidence distinction | Compiler validates explicit recorded-execution/prepared-analysis metadata, configuration and typed inputs; recorded execution requires run identity. App displays metadata; static views remain labeled modeled possibility. Synthetic tests claim no actual execution. |
| SP-054 | Partial | Native table/matrix renderer, prepared tables and marker namespaces for simultaneous views. No explicit comparison-group authoring/control; adjacent prepared content supports a basic comparison. |
| SP-055 | Implemented and locally checked | General structural layouts place native typing/specialization targets above their specific sources; native arrows and source payloads remain unchanged. Renderer tests cover mixed ownership, nested containment, authored placement and behavior exclusions; the flashlight view was checked in the browser. Cycles and explicit placements can prevent a strict vertical hierarchy. |
| SP-060 | Implemented in examples | Flashlight and Blue Dog use project JSON/native sources/story rather than project-specific JS. Complete reusable workflow still needs independent end-to-end acceptance. |
| SP-061 | Implemented | Export uses native parse/query/convert/eval/render; reference direction preserved; tests reject local IDs/labels as semantics. No second SysML parser. |
| SP-062 | Implemented, experimental native base | Versioned bundle/story/shards retain native payload/index/query/provenance and mappings; exporter/package/store tests. Native API conversion coverage notice remains material. |
| SP-063 | Implemented local reuse | Renderer imports native canvas/layout/autolayout/table; build provenance records dependency. Dirty candidate permitted only explicit development; clean fork revision `af37bbf155aea785b8ac494a14afe659244bbcdf` is now pinned. |
| SP-064 | Implemented; acceptance pending | Validated entry points/modes/default filters/limits/grouping/detail ordering/preferences are consumed by the app. Same-ID distinct views and shared-state/mode exceptions corrected and reviewed; representative usability remains pending. |
| SP-070 | Local snapshot assembled and inspected | Actual Blue Dog snapshot includes requirements, behavior, DFMEA tables, prepared plot/source provenance and closing. Browser check confirms qualitative fault-tree gate stems/shared causes; reader and engineering acceptance remain separate. |
| SP-071 | Example supplied | Flashlight tutorial uses core concepts and ISQ/SI, explicitly teaching assumptions; notation fixture adds OMG requirements library. Representative-reader acceptance outstanding. |
| SP-072 | Not conducted | `docs/reader-study.md` is a protocol only. No observed users, acceptance thresholds or measured accuracy/time/error/confidence/preference results. |

## Release interpretation

This matrix does not accept any first-release verification case. Keep bound-attribute evaluation and configured-record details within their explicit limits. Keep prepared execution metadata distinct from observed execution truth. Complete acceptance checks before claiming release acceptance. Exercise all required native kinds in the packaged browser, run the end-to-end CI build, and retain actual reader-study evidence separately from automated checks. Reassess this matrix after code changes; older counts in `docs/implementation-status.md` are historical checkpoints, not current suite totals.


## Standalone workspace surfaces (October 2026)

The earlier rows describe the previous viewer unless their evidence explicitly
names the standalone canvas. The standalone workspace now dispatches graph,
sequence and grid surfaces, using native projections for all supported view kinds.

| Requirement | Status | Evidence and limits |
| --- | --- | --- |
| SP-056 | Implemented locally | Native tables/matrices retain normal-size text, scrolling, column sizing and identity-based inspection; grid/contract/app tests and responsive browser checks. |
| SP-057 | Implemented locally | Persistent All/None/Focused compartments, default All; mandatory behavior details remain. Settings/app tests and browser checks. |
| SP-058 | Implemented locally | Square/Mind-map routes retain endpoints, direction and obstacle safety; routing regressions and browser inspection. |
| SP-059 | Implemented locally | Coordinated regions, shared multi-selection, exact grid/sequence history and bounded transition anchors; app/region tests and browser matrix-to-graph navigation. |

These checks do not establish reader acceptance, complete SysML notation coverage,
or physical iOS/Safari performance. Native unsupported-construct notices remain
visible; interaction fragments are not locally invented.


## Automatic system overview

| Requirement | Status | Evidence and limits |
| --- | --- | --- |
| SP-092 | Implemented locally | Native ownership scope, distinct-neighbor counts, damped structural ranking, balanced shallow branches, wrapper handling and deterministic caps; permutation, duplicate, cyclic, deep and boundary tests. Counts reflect the available native projection. |
| SP-093 | Implemented locally | Explicit overview and contents actions, stable selection, authored-entry precedence, Back/Forward and comparison restoration; app tests and shared neighbor-priority regressions. Prominence does not establish engineering criticality. |

SV-017 remains inconclusive pending the broader acceptance procedure; automated
regressions and browser inspection are software evidence, not reader acceptance.


## Canvas story publishing (21 October 2026)

SP-094 through SP-097 have local implementation evidence in `story-content.mjs`,
`figure-view.mjs`, the scene controller and the native publication validator.
`tests/canvas-story-content.test.mjs` covers exact identity and ambiguity,
missing/unsafe assets, ZIP/Markdown fidelity, chapter consistency, safe prose,
execution provenance, publication mismatch and image resource lifecycle.
`tests/canvas-app.test.mjs` covers stationary link selection, hidden-context
exploration/return, figure tabs/enlargement, contents/browser history, invalid-edit
rollback, edited-project sharing and resizing during scene navigation.

The full canvas/worker run passed 357 tests before the final navigation repair;
the affected app/content run then passed 70 tests, including resize/URL and
stale-link recovery regressions. Native parsing of all product specification sources passed. Native
cache preparation and the static-site build passed against the updated Blue Dog
source b94b6e0, using the existing native/WASM engine pin. Source file hashes and
complete model ZIP round trips are checked by the Blue Dog fixture test.

Real in-app Chromium checks at the default 1280-by-720 viewport and an explicit
390-by-844 viewport inspected the course/rig figure regions, chapter navigation,
figure enlargement, context-card expansion and model-versioned sharing links.
Expanding context retained the prose panel rectangle and made its content
scrollable. Native rig views were narrowed after the first phone inspection.
These are responsive browser checks, not physical Safari or reader-study
acceptance. SV-018 remains inconclusive pending its broader acceptance procedure.

## Complete Blue Dog story (21 October 2026)

The source now contains 31 scenes in 14 contiguous chapters, with three bundled
figures. The complete canvas/worker suite passed 359 tests, and all five canvas
publication-staging tests passed. Native parsing, story-reference validation,
view rendering and static packaging passed. A native-cache audit confirmed that
all 31 authored focus elements occur in their selected views and that each view
contains at most eight nodes. The pinned Blue Dog source hashes remain unchanged
from b94b6e0; only presentation views, narrative and assets were authored.

In-app Chromium loaded the full story and its chapter selector. Desktop review
covered a logical scenario, physical assembly and closing chapter. A 390-by-844
viewport check covered the IC-01 input figure, region tabs and scrollable prose;
the viewport was restored afterward. No browser errors were reported during
these checks. This is responsive inspection, not physical-device acceptance.

This validates the publication software and content bindings. No boat analysis
was rerun and no physical verification, residual-risk acceptance or representative
reader study is claimed by this publication.

## Updated Blue Dog model snapshot (24 October 2026)

The canvas example captures all 96 current model sources, the publication queries
and model README from the authorized Blue Dog working tree. `source.json` records
98 individual file hashes, their aggregate digest, the ancestry commit and an
explicit working-tree status. The copied content includes the requirement and
architecture cleanups, twenty decision-record items, eighty subject-attached
allocation/procedure reviews and the renamed satisfaction source. No new
engineering decision or acceptance disposition was introduced by this refresh.

The existing native/WASM engine pair (`761d37ebd01ce37b69a46e0b9fc71671f46ac310`)
parses the updated sources and resolves all 31 guided views. The removed
safeRecovery grouping is replaced in the presentation by the concrete recovery
propulsion requirement; the rig view includes item usages. The story distinguishes
refinement from derivation and updates its architecture and decision-record
explanations. Prepared figures retain their original source provenance.

All 359 canvas/worker tests pass with the CI-pinned Node 22.14.0 runtime. The
source/view inventory assertion covers the complete copied source set and ZIP
round trip. Two existing WebCrypto test fixtures now preserve and restore the
global property descriptor, supporting Node's getter-backed crypto property.
Local browser inspection confirmed the current working-tree introduction,
sizingBaseline displayed as an item, the separate provisional reliability study,
and the twenty-record/eighty-review explanation. No browser console errors were
reported in those checks. These results establish publication compatibility, not
physical boat qualification or representative-reader acceptance.
