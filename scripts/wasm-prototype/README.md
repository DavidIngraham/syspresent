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

The prototype dependency revision is `505baf09110e5af9720164186c77cd19d9e5b45e`
on the local `fix/syspresent-parallel-identity` branch, based on David's standalone semantic-view fork. The carried
`opensysml-semantic-views.patch` contains its changes relative to the existing
`af37bbf155aea785b8ac494a14afe659244bbcdf` pin. It can be applied to that base
without publishing a dependency branch; a patch-applied source tree is honestly
recorded as dirty in build provenance.

Build both engines from the same local dependency revision:

```sh
python3 scripts/wasm-prototype/build.py \
  --source /home/david/repos/opensysml-syspresent-voice-identity
node --stack-size=8192 --no-concurrent-sparkplug scripts/wasm-prototype/parity.mjs
node --test tests/wasm-prototype/client.test.mjs
```

The build records the dependency revision, dirty state, Go version, asset sizes,
SHA-256 digests, carried-patch digest and source-diff digest (including untracked
new files), plus OpenSysML and Go runtime license information. The native executable is a validation tool;
published static assets need only WASM, its matching runtime, worker and provenance.
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
available for resolution. The cache retains sixteen parsed models.


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

Native declaration conversion shares all model identity scopes, processes complete
per-document graphs and releases omitted expression graph storage between documents.
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

The current carried patch includes sparse matrix relationship-cell identities and
column element identities in the native JSON and WASM render contract.
`columnElements` preserves display-column indexes (including the leading label
column); `relationshipCells` preserves native row/column indexes and all matching
relationship declarations, with exact source/target direction. Ordinary table
property headings do not acquire invented element identities. Native clone tests
cover isolation. The parity harness compares actual native and WASM grid fixtures,
including duplicate relationships and derivation direction. The protobuf/gRPC
contract has not been extended by this change.

Current source revision: `505baf09110e5af9720164186c77cd19d9e5b45e` (clean).
Carried-patch SHA-256: `951f2344ff859869b88e735c8c876c2d9e3c349fdddbdb0a864931de621bb8e1`.

## Distinct parallel native relationships

General graph deduplication now includes a located native source origin
(document and span), so two separate satisfaction declarations between the same
endpoints retain separate edge identities. Rediscovering one declaration still
deduplicates; unlocated artifacts keep the existing fallback. The native and WASM
engines are rebuilt from the same clean local commit. The parity harness checks
two actual native satisfaction IDs, repeated rendering, and adapter deduplication
across repeated views. This changes identity retention, not relationship kinds,
directions, selection semantics or the source model.
