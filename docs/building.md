# Build the canvas static site

Build the matching native/browser engine using the [pinned source and carried patch](../scripts/wasm-prototype/README.md), install locked npm dependencies, then run:

```sh
npm test
node scripts/wasm-prototype/parity.mjs
npm run build
python3 -m http.server 8783 --directory build/canvas-prototype/site
```

`npm run build` prepares the complete Blue Dog native cache, validates story references against native declarations and builds the canvas app and demo archives. `index.html` is the sole page template. All asset URLs are relative, so the same build runs at the Pages project root or another static hosting base.

Outputs are `build/canvas-prototype/site/`, `site.zip`, and a content-addressed write-once ZIP under `build/canvas-prototype/snapshots/`. `snapshot.json` records viewer revision, clean/dirty status, engine provenance and asset digests. Local dirty builds are marked explicitly and cannot be staged for publication.

The site contains the app, Go/WASM worker, layout worker, demo projects, license files and source provenance. `scripts/stage_canvas_publication.py` verifies a clean archive and every asset digest before extracting it into an empty publication directory, with the original archive retained under `reviews/<sha256>.zip`. No catalog or separate viewer is assembled. See [CI and Pages](ci.md) for deployment.
