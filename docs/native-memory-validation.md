# Native export and edited-project memory validation

This report separates the original failure, native exporter measurements and
actual browser acceptance. It concerns the integrated Blue Dog sources and
carried OpenSysML engine. It does not establish arbitrary-model or physical Safari
memory limits.

## Preserved failure and measurement definitions

The original product worktree was clean at f87125c and its paired native engine
was clean at 505baf091. The complete pre-fix site, engine digests and source
requests are preserved locally under build/memory-baseline. The 98 SysML source
files occupy 1,481,938 bytes; the runtime model adds a generated native context
view. Source bytes and generated helper bytes are recorded separately by each
harness.

The original engine completed both simplified Node/WASM cases:

| Original-engine operation | Maximum observed linear memory | Result |
| --- | ---: | --- |
| Fresh source model, declaration export | 1,207,959,552 bytes (1,152 MiB) | Passed |
| Base + runtime + candidate retained, candidate export | 1,870,659,584 bytes (1,784 MiB) | Passed |
| Actual browser first proposal append | 4,294,967,296 bytes (4 GiB) | Native out of memory |

The actual browser trace records the buffer reaching exactly 4 GiB. The failed
allocation was a 12,582,912-byte block; Go printed 4,185,653,248 bytes “in use”.
That runtime diagnostic sums acquired heap arenas and is not a live-object count.
This reproduction failed at Graph.AddTriple while growing RDF storage. The earlier
annotation failure has a different frame; its old JSON path was overwritten by
a successful run and is not retained fatal evidence.

The preserved current fatal evidence is
build/memory-baseline/browser-append-verified.json and its .console.log.
The harness records cleanup separately from the native failure. Exact reconstructed
candidate sources matched the Node sources byte for byte; the fixed harness also
captures actual ParseSources requests. The candidate preview had 29 nodes and no
edges, ruling out a thousands-node drawing as the explanation.

WASM linear memory is Memory.buffer.byteLength. Go HeapAlloc is allocated heap
and can include unreachable objects awaiting collection. HeapSys is acquired
arenas; TotalAlloc is cumulative allocation, not peak memory. Post-GC HeapAlloc
approximates retained heap. JS heap and process RSS are separate measurements.
WASM pages do not shrink on model disposal; later work can reuse them.

## Export allocation and semantic equivalence

The old native path materialized each full per-document RDF graph and grouped
every SysML property into a second map of copied values before retaining
source-backed declaration subjects. The new path retains every triple belonging
to those declaration subjects before annotation, including native references to
omitted subjects. It counts omitted subjects before filtering. Annotation uses
the existing graph index in first-triple order and encodes one collection at a
time, retaining supplied annotation overrides and exact primitive spelling.

Large-document temporary storage is reclaimed between documents and after the
merged graph no longer needs encoder tables. These changes do not omit additional
declarations, create relationship identities, infer semantic links or introduce
another parser.

The preserved native profile compares identical candidate documents through the
original instrumented exporter and the changed exporter. Exact API JSON remained
byte-identical: 25,640,706 bytes, SHA-256
a49842bc6d544f7ff33912bb15c993d5da888355868a9f5855388ed63fd29b50,
16,634 declarations and 173,715 disclosed omitted subjects.

| Native measurement | Before | After export changes |
| --- | ---: | ---: |
| Export duration | 14.637 s | 5.538 s |
| Cumulative allocation | 6.828 GB | 5.427 GB |
| Sampled acquired arenas | 812.65 MB | 762.28 MB |
| Maximum sampled allocated heap | 621.69 MB | 668.15 MB |

Allocated heap at sampled checkpoints increased; this table does not claim a
lower live peak. Collection at the merged-graph boundary reduced that stage's
allocated heap from 559.05 MB to 176.51 MB. These native measurements do not include
the browser's multiple cached models. Native profile sources, stage logs, binary
and instrumentation hashes, and exact JSON comparisons are under the carried
dependency's build/export-memory. The reproducible command is
scripts/export-memory.

## Native ownership and request boundaries

The combined engine retains compatible validation and execution caches. Its
ReleaseModel API removes the exact hash from both caches and their shared LRU.
App leases retain the current project, a loading project and any reviewed
candidate separately. Submitted native requests are serialized before disposal.
Same-hash owners share retention. Failed, stale and abandoned candidates release
their own models; the discovery model is released after runtime parsing.

Initial display is transactional: the previous model and asset URLs remain usable
until the latest initial layout, including resize replacements, commits.
Failed or canceled initial rendering restores the previous project, native view,
URL and Resume controls. Navigation history refers to the current project's
semantic model and is not silently invalidated by releasing old project versions.

The first exporter/ownership fix succeeded at append but remained too close to
the address ceiling. During repeated review, allocated Go heap fell naturally
from about 3.05 GB to 579 MB as NumGC advanced from 15 to 19, after linear memory
had already reached 4,254,793,728 bytes. This demonstrates delayed reclamation of
temporary objects, not a requirement for 3 GB of reachable SysML state. It is
preserved separately as build/browser-export-memory-fixed.json. The native call
sequence and allocation lifetime matter; a browser callback leak or a complete
explanation of the browser/Node pacing difference has not been established.

The browser engine now collects at a native request boundary after parse, render
or export work allocates at least 64 MiB and leaves at least 64 MiB allocated.
A known model release also collects when allocated heap reaches that threshold.
The returned data and owned caches remain reachable. Small queries/cache hits
and desktop/native GC behavior are unchanged. This is a work-phase trigger,
not a bound on peak memory within a single operation. Diagnostics expose each
collection's method, allocation, before/after heap and duration, plus the GC goal
and exact GOGC/soft-limit settings.

The final carried native source is clean
e4fd5aa4ce5e4b756992fcee2d69459833e5ef56. Native lifecycle and actual js/WASM
allocation tests preserve reachable data and verify query skips. Independent
read-only review found no remaining concrete correctness issue in the exporter,
phase collection or app ownership changes.

The projected candidate graph contains 436,684 RDF triples for 16,634 returned
subjects. The largest measured per-document graph was inland-obligations.sysml:
222,770 annotated triples and 19,384 subjects. These include native membership,
metadata and normative infrastructure; they are not runtime instances. This
expanded representation and its temporary indexes explain why source-file bytes
are not a useful estimate of compiler/export working memory.

Final browser diagnostics report GOGC 100 and the default maximum soft-limit
setting. No GC-off override or browser callback root leak was found. The exact
browser/Node pacing difference remains unresolved; the fix addresses the measured
object lifetimes without depending on a claim about that cause.

## Remaining limits

The phase threshold is not a universal heap cap, and a larger single operation
can still exceed WASM32's address space. Released arenas remain in the linear
buffer and can be reused. Stable retained-model count and post-GC heap must not
be described as a flat buffer or a physical RAM measurement.

Large edited-model discovery and runtime indexing still perform full native
declaration exports, measured around 30–40 seconds each in the browser runs.
This change does not claim incremental compilation or mobile editing performance.
Physical Safari remains untested. Downloaded native corpus roots are absent, so
their corpus gate skips; the complete native suite and its earlier unresolved
baseline comparisons are separate from the passing scoped contracts.

## Large-buffer allocation correction and extended stress

The first phase-collection build passed three append/reload cycles but its
linear buffer grew from 1,552 to 2,436 to 2,772 MiB at successive high-water
checkpoints. Post-append allocated heap stayed near 240 MB with one model.
That distinguishes successful flows and bounded model retention from a demonstrated
address-space plateau.

The growth trace contained repeated 88–92 MiB export allocations. Source review
found two exact capacity underestimates: merged provenance reserves one triple per
document but emits one per source-language root (131 roots across 99 documents);
root wrapping reserves eight triples per root while ownership emission can add
fifteen, plus namespace facts and ordered-collection annotations. Both can force
a complete large graph slice to grow. Dense declaration projection also reserved
twelve triples per declaration although actual records average more than twenty-six.

The corrected native buffers reserve the complete emitted upper bound or count
the actual retained triples before allocation. Emission loops, deduplication,
order, identities and references remain unchanged. Fail-first capacity tests
cover multi-root, imported/referenced and dense declarations. Runtime API JSON
remains byte-identical at 26,200,164 bytes, SHA-256
8a7e74cc1e0507c6b6ec2d4cd6f3b698a64765f31131816ae78b3014e88120d2,
17,269 declarations and 173,739 disclosed omissions. Candidate JSON remains
identical to the earlier comparison.

| Capacity-fix native measurement | Runtime before / after | Candidate before / after |
| --- | ---: | ---: |
| Sampled acquired arenas | 808.42 / 695.14 MB | 762.28 / 669.94 MB |
| Maximum sampled allocated heap | 683.50 / 582.65 MB | 668.15 / 581.85 MB |

Each export allocates approximately 263–270 MB less cumulatively. This is
additional native evidence, not a browser plateau claim. Exact output/source
digests and stage traces are recorded in build/memory-capacity-comparison.json
and the native build/export-memory/capacity-comparison.json.

The browser harness now requires at least six and at most ten uninterrupted
same-worker append/reload cycles. Its late three-cycle window permits no more
than 4 MiB growth per cycle or 16 MiB combined, with at least 512 MiB remaining.
It rejects worker changes, missing/inconsistent measurements, excessive model
retention and a 3584 MiB protective limit. Eight policy regressions cover these
conditions, including growth between cycle baselines. No harness collection is
permitted during accepted cycles. Only production request/release collection
provides their heap samples.

## Bounded allocation classes and wire buffers

The exact-capacity build completed eight functional same-worker cycles but failed
stability. Its completed high-water marks were 2208, 2284, 2316, 2316, 2468,
2500, 2500 and 2576 MiB. Settled, naturally collected heap rose only from about
240 to 243 MB with one retained model. The failed stability record is preserved;
it is not relabeled as a pass.

Slightly larger exact allocations can fail to reuse a previous contiguous span
even when total idle heap is large. Large graph buffers now reserve 65,536-triple
bands once their requested count reaches 262,144. The measured source/runtime
graphs and wrapped variants share the 458,752-triple class. Small graphs remain
exact; spare capacity is strictly below 25%, and overflow falls back safely.
Record length, ordering, deduplication, native identities and serialized values
remain unchanged.

Large response buffers use 4 MiB classes from 16 MiB upward. Standard JSON
encoding preserves validation and escaping; returning buffer storage avoids an
exact-size result clone. Success envelopes use an appropriately reserved local
string builder instead of formatter buffers and a final string copy. Error
envelopes and small export responses retain their previous behavior. A 26 MiB
native wire benchmark allocated 100.0 MB per operation before and 67.8 MB after.
Bounded spare storage can increase fresh allocations; this policy targets
repeated span reuse, not a universal reduction of fresh-operation peaks.

Native and actual js/WASM byte-equivalence tests cover large bodies, nearby
revisions, full/declaration metadata, nil, invalid JSON, HTML and UTF-8. Independent
review found no correctness blocker. Actual same-worker stability still requires
the late-cycle acceptance window; implementation and unit tests alone do not
establish it.


## Accepted same-worker regression on October 27, 2026

The final executable payload was tested at SysPresent
8f7a9ac2b55db065a4fe6c8e0d93857eb448de83 with clean native
e4fd5aa4ce5e4b756992fcee2d69459833e5ef56. Seven uninterrupted
validate/append/export-ZIP/reload cycles passed in one semantic worker.
Completed-cycle linear-memory high-water marks were 1476, 2232, 2264, 2492,
2492, 2492 and 2492 MiB. The policy accepted cycles 5–7 with zero growth,
leaving 1681915904 bytes (1604 MiB) below the 4 GiB ceiling. No worker restart or
harness-forced collection occurred during these cycles.

Production model-release collection left approximately 240.16–242.68 MB of
allocated Go heap after successive appends, with one retained model; candidate
review retained two. The final explicit idle collection, performed only after
acceptance, measured 267880080 bytes with one retained model. This is retained
Go heap evidence, separate from the nonshrinking 2492 MiB linear buffer, and
does not predict indefinite stability for every possible source change.

Every cycle appended exactly one scene (32 through 38), preserved all 29
represented native identities and resolved the selected native attribute to 140.
All seven exported ZIPs preserve the 98 original SysML source files,
1481938 bytes, byte for byte. The accepted raw trace is
build/browser-export-memory-reuse-stress.json; per-ZIP source proof is
build/browser-export-memory-reuse-source-proof.json. The earlier eight-cycle
stability failure remains preserved separately.

On the same executable payload, 578 Node tests and 6 Python publication tests
passed without skips; native/WASM parity and all four product specification
packages passed. Native full build/vet/formatting and affected RDF, exporter,
frontend, render-identity and public export contracts passed, including actual
js/WASM allocation and wire-equivalence tests. The final browser regression suite
passed 19 workflows with no page errors or external requests. Its scope includes
capture, layout persistence, Back/Forward, behavior/sequence/grid controls,
Blue Dog typed rollups and isolated/contextual Gorge navigation.

The complete native test suite is not claimed passed. Earlier baseline failures,
missing downloaded corpus assets and unresolved timeout comparisons remain
separate from these scoped passes. The 47-view notation inventory in
rendering-coverage.md is the earlier 505baf assessment, not a newly run inventory
against e4fd5. Provider/privacy configuration remains unconfigured.

The carried patch reconstructs exactly the tested native source tree
65830302812358fcbe78ab5dd7ef111708d46e3f from public base
af37bbf155aea785b8ac494a14afe659244bbcdf. A fresh base-plus-patch paired
engine build and parity passed. Provenance honestly records the base as dirty
with patch/diff SHA-256
2ad5d8101a2288bedc01addeac27fed46467a6369e647e3df9f392ac0aa6d80a;
its version metadata and binary digests differ from the clean local native build.
No separate dependency publication is required.


A separate fresh browser imported the last exported ZIP after the uninterrupted
run completed. It passed with 38 scenes, 41 native views, all 29 represented
identities unchanged and the exact last model hash. Actual native GetSymbol and
Evaluate returned the selected integer value 140. Its linear high-water was
1096 MiB; final collected HeapAlloc was 242541664 bytes with one retained model.
There were no page errors or external requests. The fresh verifier's subprocess
returned zero. Both browser sessions and their owned processes closed cleanly.

Fresh evidence is build/browser-export-memory-reuse-fresh.json, SHA-256
9cab417111f75c8f12abb4fc2bee7463371cb36f2aaf92130cd3b9b2f444dedb.
The stress driver ended with passed assertions; its outer shell wrapper had an
exit-status quoting error, so no successful shell-wrapper exit is claimed.
Driver JSON, continuity, source hashes and independently verified cleanup are
the evidence for that run.

## Deployment contract followup on October 28, 2026

The first Pages run failed before deployment because the standalone wire parity
test still expected the capability list before model release and memory statistics
were introduced. The exact capability assertion now includes both implemented
APIs; no check is skipped. The failure was reproduced locally, and the exact
workflow native-contract command, full native build/vet and formatting passed.

Native source aaf24bec050f84700f6191cca49e014f44158256 differs from the memory-tested e4fd5
only in that test and its changelog fragment. Production Go files are unchanged.
The current carried patch is e8332e02f984358dd8c3da41fb9d3fa53cb8e140fa6b2a7a44bff0c43a76d908;
it reconstructs source tree d85adf5b2e95aad223e944768fc37769e32acab4
from the same public base. The earlier memory figures and patch digest above
remain historical measurements of their stated revisions.

Rebuilding the public base with the updated patch produced byte-identical native
and WASM binaries to the previous base-plus-patch build. Native/WASM parity
passed again. The test repair therefore changes no shipped engine behavior.
