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

The prototype dependency revision is `02a582d3d9baf7b9f59e5aaaa8d65f054b279bc7`
on David's local `david/syspresent-wasm-prototype` branch. The carried
`opensysml-semantic-views.patch` contains its changes relative to the existing
`af37bbf155aea785b8ac494a14afe659244bbcdf` pin. It can be applied to that base
without publishing a dependency branch; a patch-applied source tree is honestly
recorded as dirty in build provenance.

Build both engines from the same local dependency revision:

```sh
python3 scripts/wasm-prototype/build.py \
  --source /home/david/repos/opensysml-syspresent-wasm
node --stack-size=8192 --no-concurrent-sparkplug scripts/wasm-prototype/parity.mjs
node --test tests/wasm-prototype/client.test.mjs
```

The build records the dependency revision, dirty state, Go version, asset sizes,
SHA-256 digests, carried-patch digest and source-diff digest (including untracked
new files), plus OpenSysML and Go runtime license information. The native executable is a validation tool;
published static assets need only WASM, its matching runtime, worker and provenance.
The parity harness compares actual native and WASM parse responses, API graphs and
four native view projections, including mapped identities and edge endpoints. It
also checks kind-preserving capture of ad hoc action/interconnection views, and
authoritative discovery of implicit satisfaction and inherited verification through
a declared requirement coverage view. Standalone requirement context must retain
those native endpoints even when no prepared story view exposes them.

Semantic calls are synchronous inside Go, but isolated from the canvas thread.
Terminating the worker cancels the complete engine session; the prototype does not
claim per-request cooperative cancellation, incremental model editing, or automatic
external library fetching. Supplied files and the embedded standard library are
available for resolution. The cache retains sixteen parsed models.
