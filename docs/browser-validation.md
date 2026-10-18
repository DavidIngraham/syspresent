# Rendered development snapshot checks

Observed 17 October 2026 in the Codex browser against locally hosted immutable development snapshots. These are implementation checks, not a representative-reader study or release approval. The native candidate is explicitly dirty; no deployed CI run is represented here.

## Current observations

- Flashlight snapshot `05194b99026b8de318f0ad5c09319af98cf3c382e26b75fe4a914c933f09d0d2`: clicking Zoom in changes 100% to 125% and exposes Resume story. Resume returns to the authored 100% frame. Enter on the semantic prose link selects the native `portable` requirement and retains keyboard focus on its activating button.
- Blue Dog snapshot `28317fdeb1913c8266219b4dbe5f702dff4d38137ed55563b3ee16097ec2f247`: expanded qualitative fault tree visibly connects incoming edges to AND/OR gate stems. Shared power and compute events appear once each and feed both OR branches. Partial gate inputs remain explicitly labeled. This check caught a prior routing fix that tested `causation` edges while the native export actually used `connection`; the native regression now uses the actual six-node, seven-edge topology.
- Notation snapshot `ee1d94cebdda0324c3ca909535df1459e203542682e143ff2e0473f55cd923f5`: expanded state view visibly nests accelerating and steady inside active, with distinct inner and outer initial markers. The matrix displays derive, satisfy, allocate and verify with row-source/column-target headings. The earlier matrix identity gap is resolved in snapshot `08bce0cc892752f95c5788868fa2b60241b4e41dd2249489f850c885cd3676e2`: all four rows map from native source origins. Keyboard activation of row 4 selects `GuardCheck` and moves focus to its details heading. No label-based identity inference is used.
- The same notation snapshot shows request, selfCheck and ready in native event order, including the self-message on control. The action view retains guard labels and fork/join nodes; crossing routes merit further readability work.
- Earlier local checks exercised direct stop links, native DFMEA row selection with lazy context loading, expanded-view Escape/focus restoration, inline mobile views and collapsed mobile explorer controls. These do not substitute for a fresh final mobile and keyboard pass after remaining edits.

## Remaining acceptance work

Review final action routing, mobile layout and keyboard navigation; run clean pinned export/build/package and authorized deployment; conduct the representative-reader protocol. Do not infer engineering validity or a passing verification verdict from rendering a model.

A subsequent 390 × 844 mobile pass found that Resume did not reset the inline scene and that the snapshot heading overflowed the page. Both are fixed and rechecked in snapshot `fa59bad4f98b2c6da81f5db95606de260b1fb55644392abfd5bc6af053d4ec8f`: document scroll width equals client width (375 CSS pixels), inline zoom changes 100% to 125%, and Resume restores 100%. The visible state diagram remains inline with locally scrollable content. A real-renderer integration regression additionally checks compartment restoration and independent inline/main camera state.

Action stop `guarded-work` now uses semantic placement overrides to separate its complementary guard branches. Snapshot `e4a1d88a8b4c0fa50766e7d1c3e7dfedc85729c6e91f00e92c64c7c4f4c494b2` visibly keeps guardEnabled on the vertical decision-to-fork edge and not guardEnabled on the separate right-hand refusal branch. Native relationships and synthetic start/done nodes remain unchanged.

The clean noninteractive catalog at viewer commit `cc61dab`, native pin `af37bbf155aea785b8ac494a14afe659244bbcdf`, was loaded after all three exports completed. All three catalog links are present. Clean Blue Dog snapshot `a7a0f33a8f59b7190d2e3a42805ba30f3d608e15f62cab8de8408c07c50dadea` loads its draft metadata and native requirement scene in the browser. This is local hosting, not GitHub Pages deployment.

## Mobile Explore disclosure correction

A user reported that Explore this view did nothing on iOS. The handler activated its owning stop, which closed the mobile disclosure, then set paused directly without reopening it. It now uses the shared pause transition before scrolling. A regression asserts the disclosure is open at scroll time, the owning stop is retained and Resume is available. All 17 app tests pass. A 390 × 844 browser check confirmed open=true and inspector top approximately zero after clicking; this was not a physical iOS-device test. Independent read-only review found no material issue.

## Mobile workspace revision — 2026-10-17

The explorer now opens as a full-screen mobile dialog with persistent Back to story and Model, Details, Find and Filters tabs. Inline previews retain normal story tracking. A shared return path restores the owning stop, reading position and focus; responsive transition restores the authored scene. Compact controls and touch gesture handling preserve native semantic identity.

Rendered browser checks at 390×844 on the flashlight story exercised Explore, semantic node inspection, Find/search-result navigation and Back to story. The dialog remained bounded; selection opened Details and return released the modal/scroll lock and restored the invoking button. This is a desktop browser at phone dimensions, not physical iOS or WebKit gesture validation.

Independent read-only review identified stranded inline pause state, hidden-canvas restoration, breakpoint restoration, stale selection and late asynchronous tab switching. These were corrected: inline interaction does not pause mobile reading, selection renders while Model is visible before opening Details, all exits restore the story, and late tab switches are guarded. Automated tests cover these paths plus native gesture math and accidental selection suppression. Human reader acceptance remains open.

Final checks: 53 JavaScript tests and 73 Python tests passed; browser bundle and frozen flashlight package built successfully. Final rendered node selection updated native highlighting after returning from Details. Desktop breakpoint transition closed the modal, released the scroll lock and restored the authored scene. Physical iPhone testing remains outstanding.

## Concrete example headings — 2026-10-17

Replaced story, section, figure and closing headings across all three examples with their actual engineering subjects; aligned catalog titles. Independent editorial review checked headings against section content and corrected two desk-fan headings to distinguish motor power from logging and requirements from controller allocation. All three story packages validated against existing native exports; 73 Python tests passed. The rendered Blue Dog outline and section headings were checked in the browser. No model semantics changed.

## Reading-first layout — 2026-10-18

Default reading now exposes Fit and Explore rather than the full inspector on every screen size. Contents and review metadata are collapsed. Wide layouts allocate three fifths of reading-band width to the model; the repeated inspector title is hidden. Explicit exploration uses the shared full-screen tabbed workspace on desktop, tablet and phone. Independent review identified inaccessible sharing within the modal and missing view identity; a Share action and one current-view title now appear in its header. Native warnings remain rendered, and scene qualification is available under About this review.

Rendered checks at 1180×820 and 1024×768 confirmed the simplified initial screen and no horizontal page overflow. At 1024×768, the model viewport measured approximately 538×432 pixels. Opening Explore, switching to Find, resizing to 390×844 and returning to the story preserved the active panel and released modal state. These are browser viewport checks, not physical iPad tests.

Final desktop check at 1440×900 showed only Fit and Explore as visible inspector controls, with no horizontal overflow. 55 JavaScript tests and 73 Python tests passed; the native specification compiler and browser build passed. Share feedback is mirrored into the dialog status region.

## Automatic fit and Blue Dog opening scope — 2026-10-18

New/reset diagrams now fit their available viewport, including scenes with authored initial camera zoom. Untouched fitted views refit on resize or becoming visible; manual zoom and pan persist while inspecting elements. Fit restores automatic fitting. Regression coverage includes hidden views, camera precedence, resize, large diagrams below 5% scale, and a tap that must not disable fitting.

The previous opening native requirement view expanded six exposed requirements into 267 nodes and 451 edges. Native requirement relationship traversal grows the drawn endpoint set while scanning relationships. The introductory GeneralView now uses a containment rendering of only trafficSafety and trafficTracking, with no invented edge. The story explicitly states that scope and points to exploration for wider traces. A fresh native export confirmed exactly those two semantic identities and zero edges; native CLI rendering also passed.

Rendered checks on the fresh Blue Dog export at 1180×820 and 390×844 confirmed two non-overlapping requirements and drawing bounds inside the viewport. Tablet drawing width 627px fit within 629px; phone drawing width 295px fit within 297px. The Fit and Explore controls now share one row; the measured space between the viewer top and drawing viewport fell from roughly 120px to 59px. Native warnings remain visible. The flashlight example was also checked for initial fitting. These are browser viewport checks, not physical iPad tests.

Independent review caught and resolved a sub-5% zoom-direction bug and a tap disabling responsive fit. 59 JavaScript tests passed, including 19 renderer tests. The specification compiler and fresh browser/package builds passed.


## View choices by engineering question — 2026-10-18

Audited every stop in all three examples; rationale is recorded in examples/view-choices.md. Requirements now open as native record-query tables with identifiers, names and full statements. Blue Dog explicitly links definitions to the usages carrying satisfaction/derivation traces. Duplicate DFMEA prepared tables were removed; action and disposition native tables each have one stop. Behavioral, state, sequence, matrix and scoped fault-tree views remain where their notation answers the section question.

Added strict per-stop showCompartments presentation preferences with project-default merging, shared-state validation, independent frame caching and authored reset behavior. Actual browser inspection caught that the pinned native GeneralView exports no structural attribute detail: enabling compartments alone could not show mass. The flashlight therefore retains its seven-node assembly diagram and adds a native mass-input query table. Native Quantity export now preserves exact magnitude and complete unit metadata; it does not infer or convert units.

Fresh native exports and development packages passed for Blue Dog and flashlight; the unchanged desk-fan native export was repackaged with the new viewer. At 1180x820, inspected Blue Dog full requirement statements, semantic usage-link selection, shared-cause fault gates, and the separate disposition table; flashlight mass inputs visibly read 0.08 [kg] and 0.22 [kg]. Desk-fan action guards/fork/join remained visible. At 390x844, tables scroll within their viewer and the document remained 375 CSS pixels wide, equal to its client width. A readable minimum table width prevents long statements collapsing into narrow columns; row controls no longer split IDs inline. These are desktop-browser viewport checks, not physical iOS testing.

Final local snapshots: Blue Dog bd0b660071b018ef1ccf1602a715471bee3ba680e5655580edc201c0411621ed; flashlight 4ec512f75f7db4b7fca1ffc1a9df83ad7f6d1e998e2cbfba5b18d8d1d6992723. Independent read-only review covered view choices, scene-preference plumbing and Quantity serialization. 62 JavaScript tests and 75 Python tests (with the native client, including Quantity) passed; native specification validation passed. Representative-reader acceptance remains open.


## General-first layout and Blue Dog requirement derivations — 2026-10-18

General structural views now feed native ELK layout with general-to-specific constraints for native typing/specialization edges. Native drawing keeps the original arrows and restores source-first route order. Ownership, authored placements and behavioral/fault layouts retain their meanings. Tests cover mixed ownership/typing, nested containment, specialization chains, route direction and immutable inputs. Explicit placements and cycles can prevent a strict vertical hierarchy. SP-055 records the default and is covered by the notation verification case; no accepted verdict is implied.

The Blue Dog story adds challenge/system/detail requirement records and four scoped native relationship matrices: two challenge derivations, four traffic leaf derivations, a three-link recovery design-motivation chain, and five selected recovery leaf derivations. A native GeneralView attempt expanded to 287 nodes; native GridView matrices preserve explicit scopes without reconstructing links. Record tables use definitions; matrices retain usage endpoints. The narrative distinguishes original-to-derived links from specific-to-motivating dependencies and identifies inconclusive verification cases.

Fresh native export and package validation passed. All four matrices retain native row identity with no unmapped rows. At 1180x820 the flashlight definitions appeared above usages with hollow typing arrowheads upward and ownership diamonds intact. Blue Dog challenge, traffic and recovery matrices were inspected in the browser. Unambiguous matrix labels now omit repeated namespace prefixes while full names remain in titles/accessibility labels; collision tests retain qualified names. Selecting recovery matrix row 2 opened recoveryPropulsion. Authored focus prevents unrelated stale-selection warnings in the new scenes. At 390x844 tables scroll locally; document scroll/client width both measured375 CSS pixels. These are browser viewport checks, not physical iOS validation.

Final Blue Dog development snapshot: a3edfb0ff5d81143efb085cd22057f72a6d29f69b8a863764413c1d67fec7e28. Independent review covered renderer routes, native table/query scopes, derivation/dependency directions, timing statements and verification references. 66 JavaScript tests,75 Python tests with the native client, native specification validation, browser build and package checks passed. Human reader acceptance remains open.


## Derivation block diagrams — 2026-10-18

Replaced the three derivation matrices with scoped native requirement block diagrams, retaining the detailed requirement tables and separate recovery design-dependency matrix. The export selects exact native relationship qualified names and their original endpoints, retains the full source rendering in sourceNative, and discloses omitted context. Native export confirmed challenge4nodes/2edges, traffic5nodes/4edges and recovery6nodes/5edges with no unmapped identities. The native diagram convention draws derive edges from derived to original; the layout reverses only ranking constraints so originals appear above details while arrowheads remain native.

At1180x820, checked all three block diagrams in development snapshot3ad282600fef35c680bf16d79e4dd2e0c05f47cd5f47426007984d47376ef21d. Parent blocks appear above detailed blocks, arrows point back to originals, and no unrelated requirement neighborhood is drawn. All76Python tests and67JavaScript tests passed, including projection preservation/missing-name validation and native derivation layout direction. Fresh native export, browser build, package validation and specification validation passed. Work and review were performed directly, without agent delegation, as requested. No human-reader or physical-device acceptance is implied.


## Requirement questions — 2026-10-18

Requirement selection and exploration now default to five questions: statement, rationale, origins, system impact and verification. Native owned annotations and exact upstream relationship records supply rationale; metadata expressions remain declared values or explicitly unevaluated. API Dependency client/supplier roles retain dependent-to-supplier direction. Parts/allocation and derived requirements stay visible; other dependent records use a disclosure. Repeated verification targets show their distinct direct/indirect paths once. Context limits disclose additional links and requirement applications.

Fresh native Blue Dog export on the pinned source revision and development packaging passed. Browser checks followed C-009 to S-001 and back, verified the exact challengeTrafficResponse rationale, the S-101 through S-104 derived statements and the inconclusive declared TrafficSafetyVerification verdict. At 1180x820 the two-column question layout had no document overflow. At 390x844 it collapsed to one column with document width 390 CSS pixels and no question overflow. These are browser viewport checks, not physical iOS testing. Keyboard focus follows the new requirement heading; Back restores the prior semantic focus.

Independent read-only review covered native direction, result projection, lazy record completeness, bounded context, unavailable targets, history and keyboard focus. Reported defects were corrected and given regressions. 79 JavaScript tests, 77 Python tests and native specification validation passed. SP-047/SP-048 have local software evidence; SP-072 reader acceptance remains open. Final locally inspected development snapshot: 30531685188fb00d03f7dc5cc68bb86fe8b28bd93ae1a35b54d5921a6eaa4c85.
