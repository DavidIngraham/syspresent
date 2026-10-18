# Build and preserve a review

A review build exports native model data, compiles the Markdown story, bundles the browser,
then assembles an immutable snapshot. `scripts/package_review.py` is the noninteractive
assembly command. It does not deploy or establish engineering approval.

## Inputs

- `--bundle`: exported `syspresent.bundle.v1` JSON from the pinned native tool.
- `--story`: authored Markdown, compiled again during assembly so references are checked.
- `--browser`: the completed browser build directory, including its asset-digest manifest
  in `viewer-provenance.json` and its `renderer-provenance.json`.
- `--assets`: prepared images and CSV/JSON tables referenced by the story.
- `--model-root`: base directory for relative source paths in the native export; defaults
  to the story's directory. Absolute library source paths are verified separately.
- `--native-binary`: the service that produced the export; alternatively set
  `OPENSYSML_BINARY`. Its bytes and version output must match the exported provenance.

The assembler verifies model/library source digests, native binary provenance, browser
build digests, supported bundle schema, semantic mappings and declared required views.
Missing or unmapped model nodes fail the build; explicitly synthetic notation vertices
remain valid. Prepared images must be PNG, JPEG, GIF, WebP or self-contained SVG. Tables
must be CSV or JSON rows. All HTML/CSS browser asset references must resolve within the
snapshot. For a sharded model bundle, every `modelStore.shards` entry is verified against its
compressed byte count and SHA256, then copied under `model/` into the snapshot. Missing,
changed or unsupported shards fail assembly. Story references can resolve through the native
`searchIndex` declaration catalog without loading graph shards; the published bundle is
unchanged. Native coverage notices remain in the bundle; this does not assert that every
possible library element was exported.

## Assemble a static site

```sh
python3 scripts/package_review.py \
  --bundle build/model-bundle.json \
  --story examples/flashlight/story.md \
  --browser build/browser \
  --assets examples/flashlight/assets \
  --model-root examples/flashlight \
  --native-binary /path/to/pinned/sysml-grpc \
  --output build/site \
  --review-id notation-introduction-001 \
  --status draft \
  --title "Reading a small system model"
```

Run this command after native export and browser build in CI. A publication requires clean,
pinned native, renderer and viewer revisions; the native tool and renderer revisions must
match. A local development build may explicitly add `--development`. That flag is refused
when `CI` is true and marks the snapshot as development content. It never bypasses digest,
reference or mapping checks.

The output is a static directory suitable for GitHub Pages:

```text
index.html
catalog.json
.nojekyll
snapshots/<content-digest>/
    index.html
    app.js
    styles.css
    notation.css
    bundle.json
    story.json
    story.md
    assets/...
    model/*.json.gz             # when the model is sharded
    sources/model/...
    sources/library/...
    source-manifest.json
    evidence-manifest.json
    manifest.json
```

Each snapshot includes the verified source bytes, original Markdown, compiled story, model
bundle, prepared evidence and browser build. The content manifest hashes every file except
itself; the directory name hashes that manifest and its provenance. Repeating an identical
build reuses the snapshot after verifying it. Changed content creates another snapshot.
Existing snapshots are never overwritten. Preserve the previous `build/site` directory
between deployment builds so historical snapshots and catalog entries survive.

## Review lifecycle

A review ID identifies one immutable snapshot. A rebuild that changes that snapshot must
use a new review ID; it cannot silently move an existing review link to newer content.
The homepage links directly to frozen snapshots and does not redirect to the latest one.

Lifecycle updates do not need the old source checkout or a compiler. Use `--catalog-only`
to update an existing entry after verifying its frozen snapshot:

```sh
# First assemble the replacement under its own review ID.
python3 scripts/package_review.py --catalog-only \
  --output build/site \
  --review-id notation-introduction-001 \
  --status superseded \
  --reason "The replacement includes the revised operating states" \
  --replacement-review-id notation-introduction-002 \
  --reviewer "David" --reviewed-on 2026-10-17 --outcome "Reviewed with open actions"
```

Superseded reviews must link another catalog entry; superseded and withdrawn statuses
require a reason. Reviewer, date and outcome metadata live in the mutable catalog. They
do not alter frozen content or constitute an approval service. Metadata omitted on a later
lifecycle update is retained; returning to draft/current clears obsolete historical reasons
and replacement links.

The package tests exercise immutable rebuilds, historical preservation, tamper detection,
missing evidence, native/browser provenance, required-view coverage and lifecycle changes:

```sh
python3 -m unittest tests.test_package_review tests.test_snapshots
```
