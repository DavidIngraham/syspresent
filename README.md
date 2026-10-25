# Syspresent

[Open Syspresent](https://davidingraham.github.io/syspresent/)

Self-guided engineering stories and focused model exploration, authored in Markdown and grounded in native SysML data. The canvas is the sole application and the default GitHub Pages experience. OpenSysML Go/WASM runs in a browser worker; the same engine runs natively for CI. No application server or account is required.

The canvas supports focused traversal, native view resolution, animated General View journeys, measured floating prose and portable presentation editing. Graph, sequence, table and matrix surfaces include native state, case, mixed and fault-tree notation. [Current evidence and limitations](docs/requirements-evidence.md) distinguish software behavior from pending product and reader acceptance.

## Build and run

```sh
npm ci --ignore-scripts
python3 scripts/wasm-prototype/build.py --source /path/to/opensysml-canvas
npm test
node scripts/wasm-prototype/parity.mjs
npm run build
python3 -m http.server 8783 --directory build/canvas-prototype/site
```

The engine source must include the [carried patch and exact base](scripts/wasm-prototype/README.md). Open http://localhost:8783/. The landing page offers the complete Blue Dog story, a native view gallery and a small flashlight model, plus local file, folder and ZIP import. Project > Export project ZIP saves ordinary model, view and Markdown files. Models without authored entry content open a bounded native system overview.

## Authoring and publication

- [Canvas stories](docs/canvas-story-content.md): chapters, scene links, figures, semantic prose and evidence context.
- [Authoring](docs/authoring.md) and [configuration](docs/configuration.md): portable projects and presentation preferences.
- [Build artifacts](docs/building.md) and [CI and Pages](docs/ci.md): validated canvas builds, root publication and retained canvas archives.
- [Canvas scope](docs/canvas-prototype.md), [integration contract](docs/integration.md) and [third-party provenance](THIRD_PARTY_NOTICES).

The [requirements](model/requirements.sysml), [architecture](model/architecture.sysml), [decisions](model/decisions.sysml) and [verification cases](model/verification.sysml) define the product baseline. Validate specification edits with `python3 scripts/validate_spec.py --sysml /path/to/pinned/sysml`. Publication, software checks and snapshot status do not establish engineering approval or representative-reader acceptance.

## License

Syspresent is licensed under [Apache 2.0](LICENSE), matching OpenSysML. Third-party components retain their own terms; see [THIRD_PARTY_NOTICES](THIRD_PARTY_NOTICES). Static snapshots retain the applicable license files and dependency provenance.
