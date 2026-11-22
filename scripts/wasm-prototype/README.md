# Standalone semantic engine prototype

The browser runs the actual OpenSysML Go engine in a classic Web Worker. No VS Code
source module is imported. The client unwraps JSON-RPC envelopes, preserving the
native result or rejecting with its status code and message.

```js
import { createSemanticEngine } from '../../src/canvas-prototype/engine/client.mjs';
const engine = createSemanticEngine({
  assetBase: new URL('./engine/', location.href),
  workerURL: new URL('./engine/worker.js', location.href)
});
await engine.ready;
const model = await engine.call('ParseSources', {
  documents: [{ name: 'model.sysml', content: sourceText }]
});
const graph = await engine.call('ExportModel', { modelHash: model.modelHash });
const view = await engine.call('RenderView', {
  modelHash: model.modelHash,
  view: 'Views::requirements',
  includeSemanticIdentity: true
});
```

`graph.elements` is the existing experimental API-JSON mapping, accompanied by an
explicit notice. It is an exchange graph, not a claim that the browser implements
the OMG repository service. Render-local IDs and semantic element IDs remain
separate; synthetic start/final nodes have no semantic ID.

The current native/WASM source is pinned in [`dependency.json`](dependency.json):
`5578dbc8b56b4f892d9cbf3fd137a1a0cb52cf9c` in DavidIngraham/OpenSysML,
with official upstream base `318c3e02b059fe67f869cfc2dc7a9624e5a39536` and
extension-library commit `38097bbc0198767590c58f89796a436678319924`.
Blue Dog uses the same source commit and upstream/library baseline.
The browser-specific compatibility layer remains separately reviewable.

Build both engines from the exact source pin with Go 1.27.4:

```sh
python3 scripts/wasm-prototype/build.py
node scripts/wasm-prototype/parity.mjs
npm test
```

The builder fetches the exact personal-fork commit into a versioned `.tools`
checkout and verifies its Git tree. Full commit history is retained because Go
1.27 stamps the module version from reachable tags; a shallow override is rejected
rather than silently producing a different binary. Existing builder-owned shallow
checkouts are repaired with a read-only fetch. The official `v0.12.1` annotated
tag is fetched and verified against the exact object and commit in the manifest;
this is version-stamping context, not a different source baseline. The builder
checks the resulting Go module version before accepting a clean artifact. `--source ../opensysml-upgrade` instead uses
an existing checkout of that exact pin. Dirty source requires `--allow-dirty`
and is labeled as a development artifact. Builds record the source commit,
tree, upstream, dirty state, Go version and asset SHA-256 hashes, plus the
complete development source diff when applicable. Native and WASM artifacts
are built together with the matching `wasm_exec.js`.
The parity harness compares actual native and WASM parse responses, API graphs and
native view projections, including mapped identities, directed parameter pins, derivation roles, sequence events/orders, state behaviors and exact large-integer attribute values. Native and WASM Evaluate agree for selected attribute interpolation, including quantity/enum values and honest unset/collection rejection. It
also checks kind-preserving capture of ad hoc action/interconnection views, and
authoritative discovery of implicit satisfaction and inherited verification through
a declared requirement coverage view. Standalone requirement context must retain
those native endpoints even when no prepared story view exposes them.

Semantic calls are synchronous inside Go, but isolated from the canvas thread.
Terminating the worker cancels the complete engine session; the prototype does not
claim per-request cooperative cancellation, incremental model editing, or automatic
external library fetching. Supplied files and the embedded standard library are
available for resolution. The combined engine retains up to sixteen parsed models for compatibility. The app uses explicit model leases and ReleaseModel to dispose superseded and abandoned versions; settled projects retain one native model, and reviewed candidates have a separate temporary owner.


## Full models and declaration projection

For a browser exploration index use:

```js
const graph = await engine.call('ExportModel', {
  modelHash: model.modelHash,
  projection: 'declarations'
});
```

This includes every source-backed declaration object, selected by native
`sysx:sourceLine`, with each API object unchanged. `elementCount`,
`omittedElementCount`, `projection` and `coverageNotice` state the boundary.
References to omitted expression and membership objects retain native IDs; the
complete project remains parsed for native views and `GetSymbol`. Omitting the
option retains full export. This projection does not limit the loaded source model
to a presentation or selected story area.

Native declaration conversion shares all model identity scopes, materializes each
document before retaining source-backed subjects, then annotates only retained
collections. Annotation reuses the graph index and serializes one collection at a
time, preserving order and primitive spelling. Temporary encoder graphs are
collected before the merged declaration graph is serialized.
Native render identity uses the converter's identity inventory and cached semantic
model without serializing a full RDF graph. Native tests compare declaration objects
and identity origins against the complete conversion, including cross-document,
quoted-name, explicit identity-scope and normative-library cases.

Bounded requirement views declare their context in SysML:

```sysml
view selected : StandardViewDefinitions::GeneralView {
    @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
    filter @SysML::RequirementUsage;
    expose Example::original;
    expose Example::derived;
}
```

Depth zero draws only relationships among exposed requirement seeds. Depth one
collects direct native neighbors; further depths extend the frontier deterministically.
The rendering extension accepts constant Integers from zero through 64. Unannotated
views keep legacy behavior. Plain native dependencies retain client-to-supplier
direction in bounded views.

Profile a complete source project with actual WASM, without a browser service:

```sh
node --stack-size=8192 --no-concurrent-sparkplug \
  scripts/wasm-prototype/profile-project.mjs \
  --project /path/to/project --views /path/to/views.sysml \
  --view ExampleViews::selected --skip-export
# Add --runtime-helper /path/to/helper.sysml to include the app context view.
```

The profile records full source digest and revision, parse diagnostics, model hash,
view identities, elapsed times, WASM linear-memory allocation and Node process RSS.
Remove `--skip-export` to exercise live declaration export as well. Node RSS includes
its compiler/runtime and is not a measurement of physical iPad browser memory.


The final full Blue Dog project plus authored views and explicit requirement helper
(88 source files, 1,072,184 bytes) parsed in 9.6 seconds in real WASM under Node.
Subsequent small requirement/action views took 0.25–2.22 seconds and retained
403 MB of WASM linear memory after four views. These are a reproducible desktop
Node profile, not a browser or iPad performance claim. The same project without
helper previously required roughly 969 MB of linear memory during live declaration
export; prepared native caches avoid that export during ordinary published startup.
Live exports of large changed/imported projects remain a mobile memory limitation.


## Native grid identity extension

The preserved pre-upgrade carried patch includes sparse matrix relationship-cell identities and
column element identities in the native JSON and WASM render contract.
`columnElements` preserves display-column indexes (including the leading label
column); `relationshipCells` preserves native row/column indexes and all matching
relationship declarations, with exact source/target direction. Ordinary table
property headings do not acquire invented element identities. Native clone tests
cover isolation. The parity harness compares actual native and WASM grid fixtures,
including duplicate relationships and derivation direction. The protobuf/gRPC
contract has not been extended by this change.

Historical native-branch observation: `aaf24bec050f84700f6191cca49e014f44158256`.
The shipped base-plus-patch provenance is recorded under Rollback source below.
Carried-patch SHA-256: `e8332e02f984358dd8c3da41fb9d3fa53cb8e140fa6b2a7a44bff0c43a76d908`.

## Distinct parallel native relationships

General graph deduplication now includes a located native source origin
(document and span), so two separate satisfaction declarations between the same
endpoints retain separate edge identities. Rediscovering one declaration still
deduplicates; unlocated artifacts keep the existing fallback. The native and WASM
engines are rebuilt from the same clean local commit. The parity harness checks
two actual native satisfaction IDs, repeated rendering, and adapter deduplication
across repeated views. This changes identity retention, not relationship kinds,
directions, selection semantics or the source model.


## Reproducible export and model-lifecycle measurements

Use Node 22.14.0 and the paired engine above. These local harnesses refuse to
overwrite their result JSON and record source/engine digests. They preserve fatal
console output separately. The browser harness serves only 127.0.0.1 and blocks
external requests; Playwright and Chromium must already be available.

~~~sh
node --stack-size=8192 scripts/wasm-prototype/profile-export-memory.mjs   --mode single --output build/memory-single.json
node --stack-size=8192 scripts/wasm-prototype/profile-export-memory.mjs   --mode candidate --output build/memory-candidate.json
node scripts/wasm-prototype/browser-export-memory.mjs   --cycles 3 --output build/memory-browser.json   --playwright /path/to/playwright/index.mjs --chromium /path/to/chrome
~~~

The single and candidate modes deliberately retain their parsed models to expose
native export pressure. The browser test exercises actual UI leases, repeated
validation, explicit append, original source bytes in ZIP, same-worker reload and
fresh-worker import. It samples native GetMemoryStats after calls without forcing
collection during the flows. Its final explicit collection measures retained heap.

GetMemoryStats reports allocated Go HeapAlloc (possibly including unswept garbage),
acquired HeapSys, cumulative TotalAlloc and retained model hashes. These are
distinct from actual WebAssembly.Memory.buffer.byteLength and JS heap.
ReleaseModel atomically disposes validation/execution caches without interrupting
a submitted request. Released WASM pages remain in the growing linear-memory
buffer and can be reused; disposal does not promise buffer shrinkage.

For per-document native export stages, build and run scripts/export-memory in the
carried native dependency. It records normative materialization, projection,
collection annotation, merge, explicit collection and serialization separately.
See [native memory validation](../../docs/native-memory-validation.md) for the measured before/after evidence and
its limits. Historical 88-document measurements above describe the earlier source
set and do not substitute for this updated-model regression.

Large JS/WASM parse, render and export calls now collect at their return boundary
when both their cumulative allocation and remaining allocated heap reach 64 MiB.
Actual model disposal collects a material heap at the same threshold. Small calls
and desktop/native collection policy are unchanged. This work-phase budget is not
a memory cap for a single native operation. GetMemoryStats exposes phase counts,
collection duration, before/after heap, GC goal and exact GC settings.

For address-space stability, add --stress-plateau to browser-export-memory.mjs.
It runs at least six and at most ten uninterrupted same-worker append/ZIP-reload
cycles, with one validation per cycle by default. Acceptance requires a late
three-cycle window with no more than 4 MiB growth in any cycle, 16 MiB combined,
and at least 512 MiB headroom. Worker replacement, retained-model violations and
a 3584 MiB protective limit fail explicitly. The harness does not force GC during
cycles; production ReleaseModel collection supplies the post-append heap sample.
The earlier three-cycle success alone is not a plateau claim.

Large graph reservations now use bounded 65,536-triple allocation bands above
262,144 triples; large JSON responses use 4 MiB bands above 16 MiB. Both reserve
less than 25% spare space and preserve actual record lengths. This lets nearby
source revisions reuse compatible spans in the nonshrinking WASM heap. The
success envelope uses a local string builder without the formatter/string copy.
Repeated same-worker stability is an independent acceptance gate.

## Reproducible source bootstrap

Use Node 22.14.0 and Go 1.27.4. No release or nightly asset is assumed:

~~~sh
python3 scripts/wasm-prototype/build.py
npm ci --ignore-scripts --no-audit --no-fund
npm test
node scripts/wasm-prototype/parity.mjs
npm run build
~~~

The current pin is reachable in David's personal fork on
`review/engine-contracts-20261122`. A clean empty-cache bootstrap rebuilt all four
engine assets byte-for-byte identically and passed the normal static build. A local source override works before
publication and verifies the same pinned tree. `--prepare-only` fetches and
verifies without building. Versioned source directories let the new checkout
coexist with a previously patched cache.

## Rollback source

The earlier `aaf24bec050f84700f6191cca49e014f44158256` observation describes
the pre-upgrade native branch. Shipped base-plus-patch provenance instead records
published base `af37bbf155aea785b8ac494a14afe659244bbcdf`, dirty source, patch
SHA-256 `e8332e02f984358dd8c3da41fb9d3fa53cb8e140fa6b2a7a44bff0c43a76d908`
and reconstructed tree `d85adf5b2e95aad223e944768fc37769e32acab4`.
The patch file and historical memory evidence remain available for rollback;
the new source bootstrap does not apply that old patch to the newer upstream.

## November baseline contracts

The declaration projection retains full native derived-property context and
selects unchanged source-backed API objects. Bounded memoization releases caches
without filtering semantic context. Browser Go GC uses a 2560 MiB soft limit and
GOGC=50 to leave address-space headroom. Sequence proxies, event IDs and explicit
orders remain native facts. Start/done control nodes stay synthetic.

The authored `BlueDogCanvasViews::challengeOverview` depth-zero acceptance keeps
exactly its four exposed requirements and three authored derivations, alongside
the Flashlight depth-one coverage case. The real Blue Dog declaration export is
also compared object-for-object between native and WASM. Seven inherited-name
warnings are preserved in both runtimes; they do not become parse errors.

Discovery uses the native `ExportModel` projection `declaration-index` when the
engine advertises `declaration_index`. Its IDs, qualified names and requirement
seed flags come from the same native declaration and metaclass inventory as the
complete API export. It is a discovery response, not a substitute API graph.
Older engines fall back to the full declaration projection. Differential fixtures
and the actual Blue Dog project compare every model root and requirement seed;
subsequent exploration still receives the authoritative declaration objects.

Combined JSON `ExportModel`, exact `ReleaseModel` and `GetMemoryStats` are
required contracts. Native gRPC serves `GetElementProperties` and `Convert`;
the combined JSON dispatcher already reported those calls Unimplemented on the
old baseline and continues to do so. A stock nightly missing model release is
an interface incompatibility, not evidence of a memory regression.


## Execution and full model profiles

The combined frontend supplies full native export and canonical identities through
the thin execution engine's model-extension interface. Both native and WASM use
that same composed profile. The standalone execution engine keeps its converter-free
boundary. Default view JSON retains protobuf compatibility; native notation/state
metadata is requested by `includeSemanticIdentity` or independently with
`includeRenderingMetadata`. All browser view requests already use semantic identity.
The current repaired source has its own parity and browser traces under
`build/upgrade-5578dbc/`; earlier candidate traces retain their original source and
asset hashes.
