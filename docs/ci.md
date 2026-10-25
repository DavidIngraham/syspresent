# Canvas CI and GitHub Pages

`.github/workflows/canvas.yml` validates and builds the sole Syspresent application. Pushes to `main` and manual dispatches publish it directly at [the project root](https://davidingraham.github.io/syspresent/). Pull requests run validation and upload the portable artifact without deployment.

CI installs locked npm dependencies, checks out the exact OpenSysML base from David's fork, applies the carried semantic-view patch, checks native contracts and builds matching native/browser engines. It validates the product specification with the native compiler, runs canvas/worker and publication tests, checks native/WASM parity, and builds the complete multi-demo site. No VS Code source dependency or separate exporter pipeline is required.

Before publication, staging verifies clean viewer metadata and every archive asset hash. The publish job starts with this fresh root site and retains only content-addressed canvas ZIP archives from `pages-history`. It replaces that branch's deployed tree with the canvas files using a normal non-force push, then uploads and deploys exactly that retained tree. Retired pages and their URLs are absent from the publication. Source and previous deployment history remain in Git.

Publication uses the existing `github-pages` environment and Pages/OIDC permissions; only the publish job can write deployment history. Publishing jobs share a non-cancelling concurrency group. A concurrent history update fails the push instead of discarding it. A deployment failure leaves the retained source available for diagnosis or retry. GitHub Pages must use Actions as its build source.

Local validation and build commands are in [building](building.md). Publishing the canvas as the default does not establish full notation, editor or representative-reader acceptance.
