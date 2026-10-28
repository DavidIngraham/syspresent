# Metadata ownership and Whole project validation

The live baseline at commit `05ab5209d7c2a8d3807a4311d8063e1843f76987`
displayed 627 Whole project cards: 22 Packages and 605 MetadataUsages.
The public browser reproduced the exact native-ID set and keyboard-revealed a
viewport containing the repeated metadata cards.

## Native cause and corrected roots

All 605 metadata records have available native owners: **281 Dependency
objects**. They were not true orphans. The old declaration-only owner projection
excluded Dependency owners and promoted their metadata to root cards.

Whole project now uses the native root identities returned by parsing the source
documents. The actual model has **22 root packages**: BlueDog, twenty reusable
library packages and the presentation-owned BlueDogCanvasViews package. Metadata
annotations remain model content but are not promoted to structural roots or
attached directly to a package to manufacture containment.

The native source inventory contains **1,956 MetadataUsages** after excluding one
generated runtime coverage annotation. Of these, 605 are Dependency-owned. The
remaining annotations include metadata owned by packages, requirements, parts,
connections, cases and views. These are distinct totals.

## Annotation access and provenance

The workspace Metadata button exposes all 1,956 source metadata records,
independent of current canvas scope, with truthful pagination and search.
Source inspection exposes the 605 relationship-owned records excluded from the
root drawing. Node selection provides Inspect metadata; an actual native
relationship provides Inspect relationship metadata when its native identity is
available.

The inspector retains metadata IDs, direct owner IDs and owner kinds, type IDs,
source spans and source text, native ownership steps, annotation-record provenance
and the native record. Native owner, explicit annotatedElement targets and
ownedAnnotation provenance remain separate facts. Missing annotation objects and
unknown target roles are disclosed rather than inferred from an owner or endpoint
pair. In the current export, 513 source metadata records lack native source text;
those fields remain null.

## Actual browser evidence

The corrected integration build passed **19 localhost Chromium flows**:

- Whole project contained exactly the 22 independently expected native Package
  IDs, with no metadata cards. Repeated Whole project, Back/Forward and a
  390×844 viewport preserved that set.
- Default and isolated Challenge retained all 90 immediate source declarations;
  Requirements retained all 465. Inspection left canvas membership unchanged.
- The C-000 TransGorgeChallenge definition exposed its two actual metadata records.
  The rendered futureEnduranceBasis Dependency exposed its rationale through
  its native identity and preserved client repeatedOperation to supplier
  courseCompletion direction.
- All 1,956 metadata IDs were reached across 49 catalogue pages without omission
  or duplication, including every one of the 605 Dependency-owned IDs.
  Source inspection exposed all 605.
- Metadata on the unrendered boundaryLossContributor1 Dependency was inspected
  globally while the canvas remained scoped to Challenge. Its available
  Dependency owner remained in the native ownership steps.
- An actual native Internal view was rendered, then Whole project still returned
  the same 22 roots after the graph rebuild.
- Project ZIP export preserved all 21 canonical Blue Dog model/library file
  hashes from the ad26c68 source/e8fb160 evidence handoff. Inspection did not append
  slides or modify model sources.

The successful initial run reported no page errors, console errors or off-origin
requests. Native-ID membership and role/source assertions accompany screenshots;
screenshots alone do not establish semantic correctness. Final clean-build and
public acceptance evidence are retained separately after the integration owner's
build and deployment checks.

## Reproduction artifacts and limits

Ignored local evidence under `build/`:

- `metadata-native-inventory.json`: all metadata IDs, native owners and
  Dependency client/supplier records.
- `metadata-browser-expected.json`: independent expected package, child and
  annotation IDs.
- `metadata-public-baseline.json`, `metadata-public-baseline.png` and
  `metadata-public-baseline-annotations.png`: actual old public root cards.
- `metadata-browser-local.json`, `metadata-browser-local-summary.json`:
  successful initial 19-flow corrected UI run.
- `metadata-final-whole-project.png`,
  `metadata-final-whole-project-phone.png`,
  `metadata-final-unrendered-owner-inspection.png`: corrected UI evidence.
- `metadata-inspected-project.zip`: actual source-faithful browser export.
- `metadata-browser-missing-import-regression.json` and its screenshot:
  retained first-build inspector failure caused by a missing isDeclarationKind
  import. Eight structural flows passed before that error; the corrected bundle
  passed the complete inspector run.
- `metadata-browser-validation.mjs` and `metadata-public-validation.mjs`:
  machine-local diagnostic harnesses, with final results stored separately.

The 390px check uses desktop Chromium; physical iPhone/Safari remains untested.
This correction does not change native parsing/evaluation, the Blue Dog sources,
notation coverage or provider configuration. No new native relationship is
created by inspection, and no blanket notation or unobstructed-routing claim is
made.
