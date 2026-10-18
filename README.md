# Syspresent

Self-guided engineering stories and focused model exploration, authored in Markdown and grounded in native SysML data. The reader is a static JavaScript application; native OpenSysML runs at build time. Live presentation and model-evolution timelines are follow-on work.

The local implementation includes a strict story compiler, semantic prose links and annotations, native diagrams and tables, focused graph traversal, responsive reading, and content-addressed review snapshots. It is under validation and has not been released. The [requirement evidence matrix](docs/requirements-evidence.md) separates implemented behavior from remaining acceptance work. Representative-reader acceptance has not been conducted.

## Build and author

- [Authoring](docs/authoring.md): Markdown, native references, prepared evidence and closing arguments.
- [Configuration](docs/configuration.md): entry points, filters, context limits and presentation preferences.
- [Snapshot assembly](docs/building.md): export, build, validate and package commands.
- [CI and Pages](docs/ci.md): noninteractive builds and retention of historical snapshots.
- [Third-party provenance](THIRD_PARTY_NOTICES): reused components and generated license/source records.

OpenSysML remains authoritative for parsing, relationships, evaluation and notation. Syspresent imports its browser canvas, layout and table modules from a pinned checkout. It does not require a browser WASM runtime. Large native indexes are stored in integrity-checked compressed shards, loaded as readers traverse the graph.

A review freezes its story, model, evidence, source records and browser build. Lifecycle changes live in a separate catalog; publication or a current status does not imply engineering approval.

## Examples

1. [Blue Dog avoidance and recovery](examples/blue-dog/story-draft.md): traffic obligations, supervisory behavior, shared failures, DFMEA actions and passage exposure.
2. [Flashlight tutorial](examples/flashlight/story.md): requirements, part definitions and usages, claims versus verification, concurrency and states.
3. [Notation inspection](examples/notation-fixtures/story.md): guarded branches, nested states, ordered messages and trace matrices.

All examples use the same exporter, compiler and viewer without project-specific JavaScript.

## Specification and validation

The [46 requirements](model/requirements.sysml), [architecture](model/architecture.sysml), [decisions](model/decisions.sysml) and [verification cases](model/verification.sysml) define the product baseline. See the [research basis](docs/research-basis.md) for the evidence behind the UX choices and its limits.

```sh
python3 scripts/validate_spec.py --sysml /path/to/pinned/sysml
python3 -m unittest discover -s tests
OPENSYSML_SOURCE=/path/to/pinned/OpenSysML node --test tests/*.test.mjs
```

The implementation pins a reviewed commit in David’s OpenSysML fork. Publication runs the build and snapshot checks; reader acceptance remains separate. Native conversion is experimental, so exported coverage and unavailable targets remain explicit. A passing software test is not evidence that a vessel or a reader has passed acceptance.

## License

Syspresent is licensed under [Apache 2.0](LICENSE), matching OpenSysML. Third-party components retain their own terms; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). Frozen browser snapshots include this license and the dependency notices.
