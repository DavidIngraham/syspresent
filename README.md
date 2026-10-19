# Syspresent

Self-guided engineering stories and focused model exploration, authored in Markdown and grounded in native SysML data. The new graph canvas is a static JavaScript application with OpenSysML Go/WASM in a worker and the same engine natively for CI. Live presentation and model-evolution timelines are follow-on work.

The standalone canvas prototype implements focused traversal, native view resolution, animated General View journeys, measured floating prose, and a small portable presentation editor. The previous viewer and its examples remain available separately; the new canvas does not yet replace their full notation coverage. The [requirement evidence matrix](docs/requirements-evidence.md) separates implemented behavior from remaining acceptance work. Representative-reader acceptance has not been conducted.

## Build and author

- [Authoring](docs/authoring.md): Markdown, native references, prepared evidence and closing arguments.
- [Configuration](docs/configuration.md): entry points, filters, context limits and presentation preferences.
- [Snapshot assembly](docs/building.md): export, build, validate and package commands.
- [CI and Pages](docs/ci.md): noninteractive builds and retention of historical snapshots.
- [Third-party provenance](THIRD_PARTY_NOTICES): reused components and generated license/source records.

OpenSysML remains authoritative for parsing, relationships, evaluation and view semantics. Syspresent owns the new interactive canvas and layout; it imports no VS Code source modules. The previous viewer uses the older build-time export and renderer integration. See [canvas scope and evidence](docs/canvas-prototype.md) and the [engine contract](scripts/wasm-prototype/README.md).

A review freezes its story, model, evidence, source records and browser build. Lifecycle changes live in a separate catalog; publication or a current status does not imply engineering approval.

## Run the standalone canvas prototype

```sh
npm ci --ignore-scripts
python3 scripts/wasm-prototype/build.py --source /path/to/opensysml-canvas
npm run test:canvas
node scripts/wasm-prototype/parity.mjs
npm run build:canvas
python3 -m http.server 8783 --directory build/canvas-prototype/site
```

The engine source must include the [carried patch and exact base](scripts/wasm-prototype/README.md). Open http://localhost:8783. The default example includes the complete Blue Dog model with six focused story scenes. The build prepares the initial native graph and views for faster mobile startup; the browser still loads all sources into WASM for exploration. The build also produces a complete static-site ZIP and retains a content-addressed archive. Project > Export project ZIP saves ordinary model, view and Markdown files. Activity/internal-view capture preserves native notation; arbitrary focused-graph capture is explicitly unsupported for now.

## Previous viewer examples

1. [Blue Dog avoidance and recovery](examples/blue-dog/story-draft.md): traffic obligations, supervisory behavior, shared failures, DFMEA actions and passage exposure.
2. [Flashlight tutorial](examples/flashlight/story.md): requirements, part definitions and usages, claims versus verification, concurrency and states.
3. [Notation inspection](examples/notation-fixtures/story.md): guarded branches, nested states, ordered messages and trace matrices.

All examples use the same exporter, compiler and viewer without project-specific JavaScript.

## Specification and validation

The [requirements](model/requirements.sysml), [architecture](model/architecture.sysml), [decisions](model/decisions.sysml) and [verification cases](model/verification.sysml) define the product baseline. See the [research basis](docs/research-basis.md) for the evidence behind the UX choices and its limits.

```sh
python3 scripts/validate_spec.py --sysml /path/to/pinned/sysml
python3 -m unittest discover -s tests
OPENSYSML_SOURCE=/path/to/pinned/OpenSysML node --test tests/*.test.mjs
```

The implementation pins a reviewed commit in David’s OpenSysML fork. Publication runs the build and snapshot checks; reader acceptance remains separate. Native conversion is experimental, so exported coverage and unavailable targets remain explicit. A passing software test is not evidence that a vessel or a reader has passed acceptance.

## License

Syspresent is licensed under [Apache 2.0](LICENSE), matching OpenSysML. Third-party components retain their own terms; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). Frozen browser snapshots include this license and the dependency notices.
