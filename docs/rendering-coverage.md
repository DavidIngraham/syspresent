# Native rendering, layout and value coverage

This is a bounded implementation report for the supplied projects. It separates
native records, renderer helper results, tested interactions and standards claims.
Successful native rendering or a helper's `implemented` status does not establish
browser acceptance, engineering acceptance or complete OMG conformance.

The notation reference is [OMG SysML 2.0 Language, formal/2026-03-02](https://www.omg.org/spec/SysML/2.0/Language/PDF),
principally graphical productions in section 8.2.3. Sequence/event and flow
productions use 8.2.3.9 and 8.2.3.16; views and tabular examples use 7.26 and
8.2.3.26. Exploratory rendering remains the default. Focused notation uses the
same native model selection and removes peripheral opacity, contextual rollups
and exploratory journeys. It is based on the supported productions, with explicit
notices for native extensions, missing roles and unsupported modifiers.

## Actual authored views

The inventory covers all declared views in `examples/canvas-blue-dog` (34),
`examples/canvas-prototype` (4) and `examples/canvas-views` (9): **47 views in 11
native rendering families**, with no native-render rejection in the recorded
ordinary-view inventory. Auxiliary Blue Dog requirement coverage is recorded
separately. Focused variants of these same views are separate payloads, not extra
authored views. Counts concern occurrences across views, not distinct model
elements or proof of full metamodel support.

| Native family | Authored views | Ordinary native records | Rendering boundary |
| --- | ---: | --- | --- |
| definition | 11 | 43 nodes, 20 edges | Native definitions/usages, typing, ownership and owned compartments; omitted expressions and unavailable modifiers stay explicit |
| requirement | 18 | 74 nodes, 36 edges | Native requirement identities and directed traces; no verification verdict inferred |
| action | 6 | 35 nodes, 33 edges | Native controls, succession, guards, parameters and available pins; no action execution or reconstructed order |
| case | 2 | 12 nodes, 4 edges | Native case families and role-aware relationships; extensions retain their native-base notices |
| fault-tree | 4 | 23 nodes, 22 edges | Native causal topology and shared identities; focused mode uses native occurrence bases and labels extension gate categories instead of certifying an OMG gate symbol |
| interconnection | 1 | 5 nodes | Actual native containment; separate live pin tests exercise native connectors and their endpoint roles |
| mixed | 1 | 22 nodes, 16 edges | Each node keeps its actual family, native boundaries and identity; generic view kind does not erase behavior semantics |
| state | 1 | 7 nodes, 5 edges | Native states, synthetic starts, transitions and available entry/do/exit roles; position does not assert execution order |
| sequence | 1 | 2 participants, 3 messages | Dedicated lifelines/messages, native event proxies and explicit event succession; see limits below |
| matrix | 1 | 2 rows, 2 native columns, 3 relationship-cell occurrences | Every occurrence retains its native endpoints/direction, including duplicate identities |
| table | 1 | 4 rows | Native properties and text remain native data; cell text does not supply a missing property identity |

Sequence participants/messages also appear under raw node/edge roles in the JSON
inventory. Those role counts must not be summed as distinct entities. Bounded
samples do not cap aggregate record counts. The separate reachable-declaration
inventory describes named native source declarations available to exploration;
it does not claim that every declaration was drawn or has a complete graphical
production. A missing-field counter is an observation, not proof that a field is
required for every record of that kind.

## Inspectable notation and helper contracts

[The inventory script](../scripts/rendering_coverage.mjs) records native binary,
WASM, source, carried-patch, input/cache and renderer-module digests. Its per-view
records retain identities, kinds, native endpoint order, observed fields and
source provenance. Renderer assessment is optional and records module digests
before and after the run; an unstable run is not final evidence.

| Helper | What its result establishes | What it does not establish |
| --- | --- | --- |
| `focusedNodeDescriptor`, `focusedNotationNotices` | Available native graphical production, owned compartments, typed names, modifiers and explicit missing-role notices | Full standards compliance, body-expression completeness or a rendered-browser verdict |
| `focusedEdgeAppearance` | Native relationship production, direction, endpoint roles and unsupported overloaded-kind diagnostics | Permission to infer semantics from a relationship label |
| `placeEndpointLabels` | Measured role/end labels placed against cards, headers, ports, labels and route corridors, or explicit omission | A new model end, port or relationship; a descriptor-only inventory does not validate geometry |
| `placePortLabels` | Measured native pin labels retain unambiguous nearby slots or explicit omissions; canonical identities and full accessible text remain | A semantic port inferred from a drawing ID, a detached pin, or a global reshuffle |
| `sequenceNotationCoverage` | Actual participant/message/event/order records classified as implemented, data-blocked or rejected | Sync/async/call/return semantics, durations or invented interaction fragments |
| `gridNotationCoverage`, `gridLayoutWidths` | Native axes, rows, values, relationship-cell occurrences and restorable width correspondence | Missing property identities inferred from headings or values |
| `manualLayoutCoverage`, `manualLayoutSupport` | Constraints and explicit reasons per actual graphical representation | Arbitrary behavior editing or modification of native model semantics |

`native-base` means that a supported native base production is displayed while
its additional category or role remains explicitly labeled. `data-blocked` means
that the native payload lacks a required production/role; exact focused notation
is withheld and any neutral/exploratory representation retains its notice. `rejected` identifies an unsupported supplied construct.
`not-assessed` is not a success or a failure. These distinctions remain visible
instead of treating all native records as compliant.

### Recorded focused helper assessment

The paired-source `505baf09110e5af9720164186c77cd19d9e5b45e` assessment verifies
native/WASM/runtime asset hashes and unchanged start/end renderer-module digests.
It freshly renders 47 focused variants of the same 47 authored views, with no
native-render rejection. The final corrected inventory was generated at
2026-10-27T05:32:10.621Z, SHA-256
e666d782163cdd7fd12320a205ebe1b743da89ebcd400910bcab0df9bdd6353d.
Later renderer-module changes require a new assessment.

| Assessed focused records | Result | Remaining limitation |
| --- | --- | --- |
| 221 graph node occurrences | 194 implemented-symbol, 27 native-base | The 27 bases are 23 fault-tree occurrences and 4 case-objective occurrences; their extension categories remain explicit |
| 136 graph edge occurrences | 108 implemented-symbol, 24 native-base, 4 data-blocked | Four native anchor edges in `BlueDogCanvasViews::story_qualification_campaign` lack a known graphical production |
| Parameter pins | 39 with canonical native identities: 38 action, 1 mixed | Ordinary/default payloads emitted zero pins; focused native requests expose them instead of synthesizing pins in JavaScript |
| Sequence surface | 13 implemented records: 2 participants, 3 messages, 6 event references, 2 explicit orders | This does not add inferred timing, call/return or interaction-fragment semantics |
| Matrix/table surfaces | 2 implemented helper records each | Helper records describe the frame and native content contract, not extra model rows/cells |
| Derivation endpoint labels | 11 native edges, 22 named/native end labels | The inventory assesses data only; collision-free placement requires fitted-geometry tests |
| Structured state DTOs | 10 node occurrences: 5 mixed, 5 state | These authored views contain no entry/do/exit behavior records or parallel states; separate native fixtures/parity exercise those fields |

The graph totals exclude the 2 sequence participants and 3 sequence messages,
which use their dedicated surface. The ordinary payloads contain 223 raw node and
139 raw edge occurrences. Native-base and data-blocked statuses remain distinct
from full graphical coverage even when a helper's base descriptor is supported.

The separate user-source exploration assessment covers **8,724 named source
declarations across 36 metatypes**: 8,626 Blue Dog, 28 flashlight and 70 gallery.
Of these, 6,541 have an implemented-symbol descriptor; 235 have a native-base
metadata annotation with omitted body arguments; 1,948 require unavailable
standalone roles. The latter comprise 1,105 metadata annotations without one
resolved type, 837 standalone `ReferenceUsage` declarations and 6 standalone
`EventOccurrenceUsage` declarations requiring their native sequence/event frame.
Generated runtime-helper declarations are excluded. These counts assess available
descriptor data, not proof that every declaration was drawn or fully rendered.
Values, member types, modifiers and compartment budgets retain their own notices.
Standalone `ReferenceUsage` needs its actual parameter, subject, end or other
owner role; `Dependency` is an edge rather than a standalone node. Metadata
bodies require native argument/expression data; a base annotation may retain its
resolved native definition while omitted body data is diagnosed. Omitted value expressions,
multiplicities, conjugation and unsupported modifiers are disclosed. No library
type name or semantic connection is recovered by parsing labels or source text.

## Safe presentation layout

Graph edits store only presentation displacement. Actual parent-body/header
bounds, descendant and native-port envelopes, collisions, clear routes and visible
mandatory labels constrain each gesture. Peers stay stationary. A rejected
movement leaves the project/model unchanged; no global reshuffle repairs it.

| Actual construct | Supported adjustment | Explicit boundary |
| --- | --- | --- |
| Structural cards and nested parts | 2D within actual enclosing body; descendants and ports move rigidly | Missing measured bounds, header entry, escaped port labels or collisions reject the move |
| State nodes and regions | 2D within native boundaries; whole containers move rigidly | Transitions and native entry/do/exit roles do not acquire ordering or time from coordinates |
| Mapped actions, decisions, forks and joins | Horizontal adjustment within the drawing's established reading layer | Vertical movement requires an eligible complete container; concurrent branches may exchange horizontal positions if final geometry is safe |
| Complete action containers | Rigid 2D translation where no native succession crosses the group boundary | All controls, native pins, internal order and concurrency remain intact |
| Fault events and gates | Horizontal adjustment preserving the existing cause/effect reading layers | Gate category, shared-cause identity and directed native links remain unchanged |
| Synthetic controls and actual ports | Translation with their owning native container | Direct movement lacks an independent native identity or would detach a native pin |
| Sequence regions | Lane widths 160-900 pixels and message spacing 78-300 pixels | Native participant order and explicit partial-order relations stay fixed; spacing is not elapsed time |
| Grid regions | Column widths 80-900 pixels | Widths do not change native rows, matrix axes, relationship direction or cell membership |

The graph coverage tests directly exercise native action/action-definition,
decision/fork/join, nested states and starts, shared basic events, OR/AND gates,
and mixed case/part nodes. Native specialized action, region/history and other
fault-event kinds use the same role-based constraints; dedicated live cases for
every specialization are not claimed. Unknown control context is diagnosed,
rather than guessed from its name. Generic graph movement rejects sequence
placement because it lacks the dedicated participant/event geometry; the sequence
region provides its own constrained spacing controls.

`sequencePresentationLayout` validates native semantic/representation lane keys
and optional `messageGap`. `gridPresentationLayout` validates native column
identity, index and width; a heading only guards an identity-less display column
at its original index. The mounted regions expose `getState().layout` and
`onLayoutChange(next, {previousLayout})` for deliberate edit/reset, not selection
or scrolling. Missing or ambiguous correspondence retains safe defaults with
notices. Native message productions and event proxies remain distinct; a native
partial-order linearization is not an additional modeled total order. Sequence
flow/succession-flow glyphs remain data-blocked when directed parameter/proxy
roles are absent. Unsupported participant/edge kinds and interaction fragments
retain explicit limitations.

`syspresent-layouts.json` stores graph offsets and dedicated region settings
separately from SysML selection. Graph keys contain semantic, representation and
parent identities without a model hash. The presentation store supports candidate
project saves, ZIP roundtrip, capture aliasing, reset and history snapshots.
Export is the durable-save boundary; model metadata is not automatically retained
in browser storage. Pan/zoom remains available without relayout.

## Selected native attribute values

The bounded native-value survey used 98 source documents and 19 sampled attribute
owners: 10 represented in the sampled authored graph views and 9 under native
`GorgeChallenge`/`TransGorgeCourse` ownership. It is separate from the 47-view
rendering inventory and is not a whole-project evaluation.

Of **184 returned attributes**, **147** supplied supported static `GetSymbol`
values. For the remaining 37 absent static values, exact selected-attribute native
`Evaluate` calls recovered **13** additional scalars: 2 strings, 6 integers,
4 reals and 1 canonical enumeration literal. **24** stayed rejected: 10 unset
values and 14 sequences, including empty/optional collections. These are explicit
unknown/unsupported substitutions, not fabricated zeros, empty strings or passes.

The application first obtains the exact native owner and attribute with
`GetSymbol`. Only an already identified attribute with absent static value may
use its quoted native name as the `Evaluate` expression, with that selected
`contextSymbolId` and, where applicable, `subjectSymbolId`. Results, diagnostics,
current model identity and `native:GetSymbol`/`native:Evaluate` authority are
retained in binding provenance. This is not an arbitrary-expression interface,
input collection, action executor, simulation or physical test.

Supported formatting includes finite scalar values, exact large integers,
explicit rational precision, native quantities and canonical enumeration IDs
when the native result supplies them. The 184-attribute survey contained no
large-integer values; exact `18446744073709551616` is exercised separately by the
native fixture and native/WASM parity. Type/unit assertions fail on mismatch;
unit conversion is not implemented. A recovered attribute named `batteryWhKg`
remains unitless if the native API reports no unit. Reload/build resolves current
source values again. No provider, credentials, paid call or external model-data
transmission is configured by this work.

## Reproduction and evidence

Build the paired native/WASM engines and cache using the current pinned-source
instructions in [the engine README](../scripts/wasm-prototype/README.md), then run:

```sh
node scripts/rendering_coverage.mjs --assess --output build/rendering-coverage-inventory.json
node --test tests/canvas-rendering-coverage.test.mjs tests/canvas-focused-notation.test.mjs tests/canvas-sequence.test.mjs tests/canvas-grid.test.mjs tests/canvas-manual-behavior.test.mjs tests/canvas-manual-layout-native.test.mjs tests/canvas-authoring-native-values.test.mjs
python3 scripts/validate_spec.py --sysml build/canvas-prototype/engine/sysml-spec
```

Use the documented Node 22 runtime and a specification compiler from the matching
native source. Generated local evidence includes
`build/rendering-coverage-inventory.json`,
`build/canvas-prototype/native-value-coverage.json`,
`build/voice-native-gallery-notation-probe.json` and their adjacent test/run logs.
These files retain their own scope and provenance. Inventory/helper checks,
actual browser workflows, native/WASM parity, publication validation and the
complete native dependency suite remain separate gates; passing one does not
silently pass the others. See [the validation record](voice-exploration-validation.md)
for the earlier baseline and followup limits.

## Large-model native authoring boundary

A fresh isolated browser run confirmed that a redundant candidate-wide native
declaration export can exhaust the 4 GiB WASM address space during RDF collection
annotation. This occurred before the selected attribute was evaluated; a fresh
full-model WASM query resolves the actual batteryWhKg alias to native Integer
140. The fatal trace is build/voice-selected-alias-direct-trace-results.json.

Closed generated-view proposal validation now reuses the loaded native source
identity/documentation index only while original source bytes and view-file
ownership remain unchanged. Candidate parsing, native rendering, exact membership,
scope and relationship-claim validation remain required. Each selected attribute
still uses the candidate model's fresh GetSymbol/Evaluate response. Unknown
bindings and concurrent source changes reject explicitly; no trusted cache or
new modeled relationship is fabricated.

This bounded avoidance concerns proposal review. It does not repair the native
whole-model exporter or establish a pass for large edited Blue Dog append/reload
or ZIP reindexing. Those paths still require the broad export and retain the
confirmed memory limitation. A future bounded native declaration-export/index
handoff is needed before claiming those large-model flows pass. Compact native
append, source refresh, capture and ZIP workflows are separate verified cases.
