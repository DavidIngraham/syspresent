# Author a static engineering story

`scripts/story_compiler.py` compiles Markdown and declarative JSON into an ordered static story. It consumes already exported native records; it does not parse SysML, query a running service, execute an analysis, or execute author code. This is the story-format implementation, not evidence that the browser experience or engineering claims have been accepted.

```sh
python3 scripts/story_compiler.py --story story.md --bundle bundle.json --assets assets --output story.json
python3 -m unittest discover -s tests -p 'test_story_compiler.py'
```

The Python entry point is `compile_story(markdown, bundle, asset_root, source="story.md")`. It returns a JSON-compatible dictionary or raises `StoryError` with a source file and line. The CLI exits nonzero on failure. Its output uses `schemaVersion: "syspresent.story.v1"`, ordered `blocks`, ordered stop IDs in `stops`, and a substitution provenance ledger. No input bundle is modified.

## Native export boundary

The compiler expects this minimal bundle interface. Other bundle properties are ignored; the adapter and snapshot builder own native export validation, version pinning, asset hashes and immutable publication.

```json
{
  "schemaVersion": "syspresent.bundle.v1",
  "elements": [{"id": "native-uuid-1", "qualifiedName": "Example::length"}],
  "views": [{"id": "dimensions", "elementIds": ["native-uuid-1"]}],
  "records": [{
    "ref": "Example::length",
    "context": "run-a",
    "contextRequired": true,
    "type": "number",
    "status": "known",
    "value": 1250,
    "unit": "mm",
    "source": {"nativeExport": "export.json", "modelRevision": "identified-revision"}
  }]
}
```

`elements` and `views` may also be ID-keyed objects whose values retain their `id`. Element IDs are native semantic identities, **not qualified names or drawing-node IDs**. The exporter resolves each view's `elementIds` from native semantic mappings and retains render-local mappings separately. The compiler checks presentation targets against these exported identities, including membership in the selected view; it does not infer mappings from labels.

Records are keyed by `(ref, context)`. `ref` is fully qualified. A contextual result must have `contextRequired: true` and a context ID identifying the configuration, instance or recorded run. The adapter must preserve that context's source and inputs elsewhere in the bundle. The compiler never selects another context, guesses inputs or runs missing calculations.

Supported record types are `text`, `number`, `boolean` and `enum`. Known enum records also supply a `choices` list. Unsupported native types fail substitution. The exporter explicitly supplies `known`, `unknown` or `unassessed` status and optional `reason`; the compiler does not interpret native unset or undetermined as domain-level unassessed. The adapter must make any mapping explicit and preserve its reason. Unknown and unassessed values render as distinct `[unknown]` and `[unassessed]` labels, with status and reason retained in the provenance ledger. A broken reference is always an error.

## Ordered stops and ordinary prose

Place JSON in a fence whose opening line is exactly three backticks followed by `syspresent`. Every declarative block has a unique `id`, `type` and nonempty `title`. IDs begin with a letter and use letters, digits, underscore, dot, colon or hyphen. Unknown fields and duplicate JSON keys fail the build.

```syspresent
{"type":"stop","id":"dimensions","title":"What sets the size?","view":"dimensions","focus":"native-uuid-1","annotations":[{"target":"native-uuid-1","text":"The measured dimension"}],"camera":{"target":"native-uuid-1","zoom":1.2},"placements":[{"target":"native-uuid-1","x":40,"y":60}],"speakerNotes":"Ask which measurement matters next.","modelRefs":["native-uuid-1"]}
```

Only `type`, `id` and `title` are required on a stop. `view`, `focus`, `annotations`, `camera`, `placements`, `speakerNotes` and `modelRefs` are optional. Annotation and placement targets must be present in the selected view. Camera framing identifies a semantic target and a positive zoom. Coordinates are finite presentation positions, not model coordinates. Overrides never rewrite the reusable view. Speaker notes survive compilation for a future presenter mode.

Ordinary Markdown between blocks remains ordered content. This provides a linear reading representation containing the same prose, figures, tables, callouts and closing argument; a downstream renderer must show these without depending on animation. Markdown and substituted strings remain text, not trusted HTML. The browser/build renderer must escape model text and sanitize authored Markdown and embedded assets; this compiler does not produce HTML or establish asset safety.

Engineering alternatives, assumptions and decisions belong in native model records. Use `modelRefs` on stops/closing blocks to identify those records and typed substitutions to quote exported values. Discussion prompts, reading order and speaker notes remain presentation content. The compiler checks reference existence, not whether arbitrary prose contains an unreferenced engineering claim; editorial review still owns that boundary.

## Typed substitutions

The only expression form is `{{model JSON_OBJECT}}`. It supports `ref`, optional `context`, `type`, `format` and numeric `unit`. No calls, arithmetic, property access, JavaScript or Python are accepted.

```text
The length is {{model {"ref":"Example::length","context":"run-a","type":"number","format":".2f","unit":"m"}}}.
```

That fixture renders `1.25 m`. Numeric formatting is explicit: `.0f` through `.12f`, with `e` or `g` also allowed. `text`, `boolean` and `enum` require `"format":"text"` and prohibit `unit`. Booleans render `true` or `false`. Numbers require explicit source and destination units, including `1` for dimensionless. Supported compatible groups are:

- Length: `mm`, `cm`, `m`, `km`.
- Time: `ms`, `s`, `min`, `h`.
- Mass: `g`, `kg`.
- Power: `W`, `kW`.
- Energy: `Wh`, `kWh`.
- Speed: `m/s`, `km/h`.
- Dimensionless: `1`, `%`.

This allowlist deliberately excludes affine temperature conversion and arbitrary unit algebra. Unknown or incompatible units fail, even for unknown values. Boolean values cannot masquerade as numbers; nonfinite numbers fail. Template markers are reserved throughout authored prose and block text. Locations identify the relevant Markdown line or declarative block; field-level JSON text shares the block location.

## Prepared evidence and a closing argument

```syspresent
{"type":"figure","id":"response","title":"Measured response","asset":"response.svg","alt":"Heading settles after a command.","caption":"The identified test configuration.","provenance":{"source":"evidence/run-a.csv","context":"run-a"}}
```

Tables use `"type":"table"` with the same fields except `alt`. Both figures and tables accept optional `"fullWidth":true` to request full-width presentation; `false` is also preserved, and omission leaves layout to the viewer default. Only JSON booleans are accepted. `asset` must identify an existing file below the declared asset root; absolute paths, remote URLs and escaping symlinks are rejected. Figures require alt text. Both require caption and source/context provenance. For context-independent explanatory evidence, use an explicit description such as `"context":"context-independent notation example"`; do not leave the field blank. No reader-triggered calculation is implied. A figure or table is a prepared asset; table decoding/rendering belongs to the viewer's declared asset format support.

The last nonempty content must be exactly one closing argument:

```syspresent
{"type":"closing","id":"decision","title":"What follows from the evidence?","supports":"The tested configuration meets the supplied case.","open":"Other conditions remain unmeasured.","next":"Measure the adverse case before extending the envelope.","modelRefs":["native-uuid-1"]}
```

`supports`, `open` and `next` are required nonempty text; `modelRefs` is optional. At least one stop is required. This enforces the default review's closing structure without inventing an approval or verdict.

## Native value context

Value exports currently use `evaluationMode: "bound-attribute"`: `ref` identifies an already bound native attribute or reference, and `context` is the author's provenance label for that value. It does not select another instance, rebind parameters, or execute a scenario. Requested inputs and other evaluation modes fail. The bundle records this mode, the exact native reference and the context label. Use a distinct bound native attribute for a different configuration; a label alone cannot change the evaluation.

## Semantic links in prose

In ordinary Markdown prose, write `[the assembly](model:Example::assembly)` or use the exact native semantic ID. The build resolves the target against exported identities and qualified names; missing or ambiguous matches fail with the Markdown source line. No label matching or browser-side model lookup is used. Percent-encode spaces or reserved characters in targets when needed.

Compiled Markdown normalizes targets to `model:<percent-encoded-native-ID>` and records `modelLinks` entries with target, original reference and line. The viewer can use these links to select the semantic element and pause story tracking. Links may target exported elements outside the current drawing; that does not add them to the native view or establish a new relationship.

Code fences and inline code examples stay literal. This syntax is supported in ordinary Markdown blocks, not plain-text declarative fields such as titles, captions or closing summaries. It does not execute expressions; typed substitutions retain their existing separate contract. Model text inserted by substitutions is not treated as authored semantic-link syntax at compile time.

## Distinguish prepared analysis from recorded execution

Figures and tables may add an `evidence` object. Without it, the viewer must not infer that an asset is an execution trace. Existing `provenance.source` and `provenance.context` remain required; they describe asset provenance, while `evidence` classifies its meaning.

```json
{
  "classification": "recorded-execution",
  "source": "identified recorder or immutable source record",
  "runId": "identified run",
  "configuration": "identified specimen or simulation configuration",
  "inputs": {"command": "on", "supplyVoltage": {"value": 3, "unit": "V"}}
}
```

This is a schema example, not a claim that a run occurred. `recorded-execution` requires source, runId, configuration and inputs. `prepared-analysis` requires source, configuration and inputs, with optional runId identifying the calculation. The latter is not evidence of execution. Configuration and source must identify the actual records; this compiler validates structure, not the truth of an author's claims. Inputs must be an explicit JSON object; `{}` means no inputs, not missing or guessed inputs. An execution record may concern simulation or a physical specimen: say which in configuration/source, and do not equate execution with physical verification.

Metadata is preserved in compiled story content and therefore frozen with the snapshot. Unknown fields/classifications, missing identities and malformed data fail the build. Identity strings are nonempty, at most 4096 characters and contain no control characters. Inputs permit JSON null, booleans, finite numbers (integers limited to ±9007199254740991 to preserve browser precision), strings, lists and objects; keys are nonempty strings up to 256 characters, strings up to 8192 characters, at most eight nested levels and 1000 values, and the entire evidence object is at most 65536 UTF-8 bytes. No code, calculations or trace simulation are executed. Metadata is literal data, not a template field.
