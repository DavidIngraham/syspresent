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
a148595ae662847965777157c2943942fd88657a. Native lifecycle and actual js/WASM
allocation tests preserve reachable data and verify query skips. Independent
read-only review found no remaining concrete correctness issue in the exporter,
phase collection or app ownership changes.
