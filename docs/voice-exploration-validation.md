# Native exploration, layouts and authoring validation

The local feature branch preserves the integrated Blue Dog source refresh and
implements SP-103 and SP-107 through SP-111 alongside the earlier exploration
requirements. Software checks do not establish engineering acceptance, a live LLM
service, full OMG conformance or representative-reader acceptance.

| Capability | Exercised behavior | Explicit limits |
| --- | --- | --- |
| Typed rollups | Actual owner paths, native direction/kind/identity, repeated-view deduplication, scope-checked paged drilldown | Unresolved native relationship identity is reported as connection records; aggregates remain presentation artifacts |
| Portable layouts | Separate JSON asset, normalized offsets, semantic/representation/parent identity, ZIP roundtrip, capture aliases, Back/Forward/reset | Unsafe or missing geometry is disclosed; behavioral/control movement is unsupported |
| Complex layout | Rigid groups, bounded internal movement, stationary peers, actual port/label envelopes, header/body and route safety | Internal moves require measured native parent bounds; no silent container escape or global reshuffle |
| Native authoring | Native definitions/type filters, explicit review/append, source/reference/claim validation, stale rejection | Free prose remains an unverified author draft; no live provider configured |
| Narrative bindings | Native documentation and exact constant scalars, explicit type/unit/format, source reload/publication refresh | Runtime-input evaluation and unit conversion are unsupported |
| Focused notation | Verified definition/usage shapes, owned compartments, typed names where available, native port directions, supported relationship/control symbols | Unsupported families/modifiers/roles are diagnosed; opaque type IDs are provenance, not displayed type names |

## Final product checks

- Node 22.14.0: npm test passed 456 canvas/worker/native-fixture checks, zero
  failures or skips, plus six Python publication tests.
- Native product specification validation passed using a compiler built from the
  same local source revision as the paired semantic engines.
- Native/WASM parity passed, including two distinct parallel satisfaction IDs,
  repeated-render identity, capture, native grids and original matrix direction.
- Matching static build passed with 137 assets.
- Ten actual Chromium/WASM workflows passed on localhost only, with zero page
  errors and zero external requests. They cover repeated authoring validation,
  explicit append, 0.22 to 0.31 kg source refresh and export, group/internal moves,
  capture layout alias, ZIP import, reset/Back/Forward, focused shapes, all seven
  native Blue Dog-to-Gorge assertions across pages, isolated Gorge, narrow graph
  viewport and native matrix preservation.
- Original dirty Blue Dog checkout diff remains byte-identical to the preserved
  integration patch (SHA-256 e716289653611faa16800e401001ccbccd1c8e2eb349794b1d739fed06922838).
- Whitespace checks passed. Original working-tree sources were not reset or edited.

The paired engine source is b1ea888051d2423acdf5c35fab11fac531fc24b2, clean local branch
fix/syspresent-parallel-identity. Its carried patch is based on the existing
af37bbf155aea785b8ac494a14afe659244bbcdf pin, SHA-256 951f2344ff859869b88e735c8c876c2d9e3c349fdddbdb0a864931de621bb8e1.
Native source-origin deduplication preserves distinct parallel declarations while
deduplicating rediscovery of the same declaration. No upstream changes were
published.

## Native dependency gate limits

Final-source view, engine, combined, renderidentity and required wire/dependency
contracts passed. Full native build, vet and formatting checks passed.

The broad native suite is not green. Its run failed ten packages; it is not
represented as a final-source full-pass gate. Focused comparison established:

- CLI VCS build-info assertions and the extension RequirementContext contract
  mismatch also fail on the untouched baseline.
- The pilot VehicleUsages.kerml fixture and generated libavoid-js license asset
  are absent in both worktrees.
- With Node 22, functional browser/WASI checks pass; the deadline-report assertion
  expecting MainThread still fails because this environment reports node, also
  reproduced on the baseline.
- The 800-document gRPC timing check passes isolated. The revisited-fork SMT check
  passes isolated on both baseline and candidate.
- Four package-timeout comparisons remain untested/unknown: CLI exploration,
  SMT RefereeCorpus, REPL compiled budget and migration. They are not called
  baseline failures or waived.

Exact commands, failures and untested comparisons are recorded locally in
build/voice-native-baseline-comparison.json. Product logs are
build/voice-remaining-{tests-final,spec,parity,build,browser}.log, with screenshots
and browser JSON alongside them. These build outputs are local evidence, not
committed test fixtures.

## Live generation decision

The optional JSON gateway adapter is mock-tested only and remains unconfigured.
It supports a user-supplied same-origin or loopback JSON gateway with server-held
provider credentials, no browser credential storage, cookies or authentication
headers, and no default endpoint. Repository conventions identify no existing
gateway service; none was live-tested.

Before enabling it, choose the gateway endpoint/protocol and provider/model,
authorize which selected native metadata may leave the browser, and decide
server/provider logging and retention. The minimum payload is the question plus
selected native identities, qualified names and kinds; documentation and directed
links are opt-in. Full model sources and credentials are excluded. Same-origin
HTTPS and loopback have different browser/CORS constraints; no configuration,
connection or model-data transmission has occurred.
