# Canvas requirements evidence

The canvas is the sole Syspresent implementation. Its [scoped evidence record](canvas-prototype.md) and the checkpoints below describe exercised behavior; intended product obligations remain in `model/requirements.sysml`. Full notation coverage, value substitution, lifecycle management and representative-reader acceptance require additional evidence. Verification cases remain inconclusive until their own acceptance objectives are demonstrated.

Automated canvas and worker checks cover native identity and direction, behavior notation, view/region navigation, hidden context, history, snapshot immutability, portable project import/export and publication validation. The canvas is published directly at the project root through [the CI pipeline](ci.md).

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

## Package exploration and standalone native navigation (24 October 2026)

SP-098 and SP-099 specify a package reader scope independent of focus and story,
with persistent native view navigation. All 369 canvas/worker tests pass under
Node 22.14.0. New cases exercise exact native ownership, nested and empty packages,
ownership cycles, misleading qualified names, external typing and dependencies,
stationary selection, scoped search and action counts, boundary disclosure,
activity and matrix navigation, scope/camera/history restoration, scene return,
empty native results, intact rejected comparisons and stale response cancellation.
Existing snapshot, direction, identity and behavior-notation checks also pass.

The CI-pinned native compiler at `23ca2e2f0f1fae4da6bc3e1488951cb017ed43e2`
validates all four product specification packages without errors. The unchanged
native/WASM runtime pair at `761d37ebd01ce37b69a46e0b9fc71671f46ac310` parses the
current complete Blue Dog example with the existing model identity. Native owner
closure contains 398 projected declarations in `GorgeChallenge` and 223 in
`GorgeChallengeVerification`; these totals include unnamed declarations and are
distinct from the overview's eligible named-element count. Native tree and mixed
renderings stay within each scope. Internal rendering of these package roots is
empty, so the chooser reserves that action for parts. The runtime rejects a
`#requirement` shortcut; declared requirement views remain supported.

Local browser checks at the default 1280×720 viewport and the 390×844 responsive
breakpoint confirmed package selection, bounded contents, native requirement-view
switching and a rejected cross-package view that retained all four active
requirement identities. Narrow controls stayed within the 390-pixel document
width. Software checks and responsive inspection do not complete SV-019's
representative-reader acceptance. Package navigation URLs remain future work.
