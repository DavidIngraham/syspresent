# Blue Dog namespace integration validation

The viewer integration uses the canonical Blue Dog payload from source commit
`ad26c68b7f01149cb207759cf390642c645ba514`, supplied with evidence commit
`e8fb1601d35c5d1c8e7ec8084fe4a9391228ce30`. The browser audit did not modify
or publish the Blue Dog repository.

## Canonical source fidelity

The delivered `HANDOFF.json` supplies SHA-256 hashes for one canonical
`models/blue-dog.sysml` and twenty reusable library files. The browser harness
checks all **21 file hashes** inside the built project ZIP, the ZIP exported
after explicit native capture, and a second ZIP exported after importing that
capture. All three checks passed with byte-identical canonical sources.

The active bundle has no legacy `tools/publishing/reference.sysml` helper or old
project fragments. The only additional SysML source in the measured bundle is
the presentation-owned `views.sysml`. Captured presentation source under
`views/` is permitted separately from canonical model sources.

Expected model membership comes from native exported declaration identities,
`owner` references and native source-document provenance. Labels, qualified-name
prefixes and a source-text parser do not supply ownership or relationships.

## Native package and projection counts

The helper-free native cache independently confirms:

| Native set | Count |
| --- | ---: |
| Canonical payload package roots | 21 |
| Canonical packages through actual native ownership closure | 111 |
| Nested canonical packages | 90 |
| Additional presentation package root, BlueDogCanvasViews | 1 |
| Package roots in the viewer declaration projection | 22 |
| MetadataUsage roots with omitted owner context | 605 |
| Complete whole-project ownership projection roots | 627 |
| Source-backed declarations in the viewer projection | 13,844 |
| Native export records after excluding the runtime helper | 15,945 |

The 627 ownership projection roots are not 627 native top-level packages.
Likewise, the 21 canonical package roots do not count the presentation-owned
package or metadata boundaries. The declaration projection is narrower than a
full kernel object inventory; byte fidelity preserves all supplied source
content without claiming that this projection enumerates every kernel object.

Actual immediate-child sets checked by exact native IDs include:

| Selected native owner | Immediate declarations |
| --- | ---: |
| BlueDog | 12 |
| BlueDog::Mission | 7 |
| BlueDog::Mission::Challenge | 90 |
| BlueDog::Requirements | 465 |
| BlueDog::Architecture | 43 |
| BlueDog::Architecture::Logical | 50 |
| BlueDog::Architecture::Physical | 17 |
| BlueDog::Configurations | 12 |
| BlueDog::Verification::Satisfaction | 209 |

Requirements now has 465 children because the original 463 declarations remain
alongside the nested Basis and Structure packages. Satisfaction includes
anonymous native usages. Ownership locates declarations; it does not establish
boat composition or engineering traceability.

## Actual browser flows

The helper-free integration build passed **19 localhost Chromium flows**. Exact
active canvas native-ID membership was checked for default Explore, the complete
whole-project roots and the owners above. Checks included scope isolation,
keyboard access to the last requirements sibling, first selection keeping the
camera stationary, Back/Forward, actual viewport pan, zoom, and resize to
390×844. Complete views showed no More/page controls. Cards retained 260px
minimum visual width; the desktop viewport was 1440×1000.

Manual browsing kept the original 31 scenes. Opening the declared native
`BlueDogCanvasViews::challengeOverview` preserved the migrated native identities.
Explicit capture appended one scene referencing that real native definition.
The native WASM parse/render path, ZIP export, ZIP import and reexport completed
successfully, preserving all 21 canonical source hashes and native membership.
Capture therefore retained model-backed native view semantics and source.

Loading instrumentation observed real engine download/compile, native parsing,
declaration discovery/indexing, relationship resolution, native scene preparation
and layout stages. Download counts included measured bytes (for example
515.8 KiB of 35.2 MiB for the semantic engine). Unknown-work stages remained
indeterminate. The complete audit, including fresh import, ran from
21:52:55Z to 21:54:55Z on 28 October 2026 under concurrent development load;
this is not a startup benchmark.

No page errors, console errors or off-origin requests occurred in the successful
run. The owned browser and localhost server were closed afterward. Desktop
Chromium with a narrow viewport is **not physical iPhone/Safari evidence**.

## Evidence and diagnostic limits

Ignored local evidence under `build/` includes:

- `namespace-native-inventory.json`: exact native owner membership, source-root
  classification and full expected ID sets.
- `namespace-browser-helper-free.json`: successful 19-flow integration pass,
  source-hash proofs and actual loading-stage events.
- `namespace-browser-validation.mjs`: machine-local diagnostic harness.
- `namespace-captured-roundtrip.zip` and
  `namespace-reexported-roundtrip.zip`: actual browser roundtrip outputs.
- `namespace-default-challenge.png`, `namespace-blue-dog-root.png`,
  `namespace-whole-project.png`, `namespace-requirements-desktop.png`,
  `namespace-requirements-phone.png`, `namespace-native-gorge.png`:
  actual viewport screenshots.

Two retained earlier failures were harness fixtures, not product failures:
`namespace-browser-legacy-view-fixture-failure.json` used a nonexistent guessed
legacy native-view name, replaced by exact compiled native-ID matching;
`namespace-browser-capture-status-fixture-failure.json` waited for the initial
startup status after capture had already succeeded. The success screenshot
`namespace-aux-capture-success-harness-wait-timeout.png` shows the appended
scene and explicit capture-success message. The corrected flow waits for the
actual scene count, loading state and settled canvas.

The earlier diagnostic build included 29 unused viewer reference packages; its
counts are not final acceptance counts. Final clean-build and public acceptance
results are recorded in their separate browser artifacts after the integration
owner's build/deployment checks. No browser finding implies complete OMG notation
conformance or unobstructed routing of every dense-view relationship.
