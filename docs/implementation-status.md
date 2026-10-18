# Implementation evidence

Updated 17 October 2026. The implementation is local and first-release acceptance remains open. The detailed assessment is in [requirements-evidence.md](requirements-evidence.md); it covers all 46 requirements without treating automated checks as reader or engineering acceptance.

## Current implementation

The native export adapter preserves native API identities, relationships, view payloads and typed records. Sharded loading supports the large Blue Dog export without forcing the whole graph into the initial browser bundle. Library coverage is explicit and bounded by configured exports. Native API conversion remains experimental.

The Markdown compiler supports declarative stops, semantic annotations and prose links, prepared evidence, typed substitutions, presentation overrides, speaker notes and closing arguments. Numeric export explicitly evaluates already bound attributes: context labels do not rebind native instances or inject analysis inputs.

Prepared evidence now distinguishes recorded execution from prepared analysis using explicit source, configuration, typed inputs and required recorded run identity. Synthetic tests validate this contract without claiming a real run.

The static viewer reuses OpenSysML canvas/layout/table modules. It supports self-guided stories, local graph exploration, filters, bounded context, history and shared states, native table selection, and declarative entry points/modes/preferences. Details now show exact configured native query rows and rendered verdicts rather than treating satisfaction as verification. Source details remain raw metadata; query/view coverage does not imply every element has evidence.

Packaging verifies native/viewer/model/evidence provenance and shard digests, freezes prepared source/generator inputs, and preserves content-addressed snapshots separately from lifecycle metadata. Local catalog entries now include actual Blue Dog, flashlight and notation-fixture snapshots. They are development evidence, not a production release.

## Verification evidence

The coordinator reports **73 Python tests and 45 Node tests passing** on 17 October 2026, using Node 24 and the configured OpenSysML source checkout. The documentation reviewer did not rerun this aggregate suite. Coverage includes compiler diagnostics, identity/direction, bounded shared state, source/evidence tampering, immutable history, lazy model loading, configuration and DOM interactions. These tests do not establish visual quality or usability.

Earlier desktop/mobile inspections drove fixes to scale, inline scene ownership, reading bands, full-width evidence, selection and camera handoff. They are development observations, not complete browser acceptance of the current build. The fault-tree connection-kind/geometry defect is fixed and browser-checked against actual native connection edges. Authored semantic placements now separate the tutorial guard branches; the resulting drawing was checked in the browser. Required-kind native fixtures exercise guards, concurrency, nested states, sequence ordering and matrix direction; local browser observations now cover gate stems/shared causes, nested states, ordered sequence/self-message, and matrix directions. All four native matrix rows map by source identity; keyboard selection of GuardCheck focuses its details. See [browser-validation.md](browser-validation.md).

The coordinator reports 330 native renderer TypeScript tests passing and 16 app tests within the Node aggregate. Mobile browser recheck confirms 375-pixel document/client width equality and inline zoom 100% → 125% → Resume 100%; real-renderer regression covers compartment reset and independent inline/main camera state.

A broader native suite is currently ongoing. No final result for that running suite is claimed here. Reviewers have identified and corrected issues in code other than their own; some contributors also authored components they assessed, so this is not a blanket independent-review claim.

## CI and publication

`.github/workflows/build.yml` and `scripts/build_ci.py` now provide noninteractive native export, browser build, immutable packaging and history preservation. The workflow builds both the CLI for specification validation and the gRPC service for Python export. Notice archive metadata is normalized to improve repeatability. The noninteractive command completed from clean viewer commit `cc61dab` and native pin `af37bbf155aea785b8ac494a14afe659244bbcdf`, exporting and packaging all three examples into a verified static catalog. This is local execution of the CI command; no hosted GitHub Actions or Pages deployment is claimed.

Publication still requires reviewed clean source pins, corresponding binaries and viewer provenance, required license/notice files, and successful end-to-end CI. The native changes are now committed and pushed only to David's fork at `af37bbf155aea785b8ac494a14afe659244bbcdf`; all three examples pin that exact revision. Fresh CLI/service builds identify that commit. Earlier dirty development snapshots remain historical evidence, not release artifacts. No upstream pull request is authorized by this work.

## Outstanding acceptance

Complete final browser/keyboard acceptance; verify the clean CI build and deployed immutable URLs. Declarative mode restrictions, shared-state authored-scene exceptions and distinct entry points sharing an identity have been corrected and reviewed. Keep recorded-execution metadata distinct from actual execution and physical verification. The representative-reader study in [reader-study.md](reader-study.md) has not been conducted, and sample/acceptance thresholds remain unresolved. SP-025 evolution timeline and presenter-mode delivery remain follow-on scope.

Clean local snapshots: flashlight `f0f3188b4b1f25e690c660d829eaeaeed25fcacdea6742c150ac27d794950819`, notation `b82fb049ba95736776f288925a311f333c0567bfb661ca57db59be3b2d0251fb`, Blue Dog `a7a0f33a8f59b7190d2e3a42805ba30f3d608e15f62cab8de8408c07c50dadea`. The native specification and notation payload assertion commands also passed using the clean pinned CLI.
