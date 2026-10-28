# Complete default Explore validation

The correction was checked against the bundled Blue Dog/Gorge model from deployed commit
`0a3f5c3489010d3ad61d5a1da02fb4f55adf0c4e`. No Blue Dog source checkout was imported or changed.

## Frozen native reference

The deployed CI `site.zip` supplied the project ZIP (2,122,061 bytes, SHA-256
`f5965aad06b02ceddf433bbdef5b0c15dad9a4f324b896e620b07548112a914c`)
and runtime cache (26,909,465 bytes, SHA-256
`8cbb3b489556190c1715f01f082edf2d08efe636c04f61a3de5980e5b49735bc`).
Expected child IDs were independently collected from source-backed native declaration
records and their actual `owner` references, with a single native direct PartDefinition
type hop for PartUsage. No labels or source-text parser supplied relationships.

The tested project bundle has exactly the same file membership and byte-identical
source files as that published ZIP. Its native cache is equal in every field except
the rebuilt engine's explicit `engineVersion` and `engineFingerprint` provenance.
The per-source-file aggregate digest recorded by the browser harness is
`f827187d79783bf9d2f15a9f0ef446bc7c21186f086463dadff681406b748f21`.

## Measured baseline and corrected membership

| Actual model selection | Published baseline | Corrected canvas membership |
| --- | --- | --- |
| Default Explore from first guided scene | Authored four-node slice retained | GorgeChallenge plus all 90 immediate declarations |
| Isolated Gorge overview | 8 of 90 children | All 90 |
| Gorge Parts / contents, desktop | 6 of 90 children | All 90 |
| Gorge Parts / contents, 390px viewport | 4 of 90 children | All 90 |
| BlueDogRequirements, 390px viewport | 4 of 463 children | All 463 |
| BlueDogSatisfaction | Named-only filtering excluded anonymous usages | All 209 native SatisfyRequirementUsages |
| BlueDogLogicalArchitecture | Bounded page of children | All 50, including 24 PortDefinitions |
| IC01Candidate PartDefinition | Only 14 composition parts eligible before paging | All 50 declared children, including flows and metadata |
| ic01 PartUsage | Own and typed composition parts sampled | 2 own children plus all 50 direct type children, with usage/type anchors |
| BlueDogIC01::integration | 28 attributes excluded; contents disabled | All 28 attributes as tiles |
| MarineSailing::Core CalculationDefinition | Generic context did not provide complete contents | All 173 owned attributes/references |

Whole-project Explore shows all **735 native ownership projection roots**, comprising
130 Packages and 605 MetadataUsages whose owner records are outside the declaration
projection. These are explicitly disclosed as projection roots with omitted owner
context, rather than described as 735 native top-level packages. Their native owner
closure reaches all 14,364 source-backed declarations in this frozen model. The
configured 12 authored navigation roots and the compiler's 129 parse roots are
different sets and were not substituted for the independent expected set.

Actual model boundary fixtures also passed on a 390px viewport: BlueDog::DesignIntent
(0), BlueDogWingActuator (1), BlueDogEnvironmentReview (5), and BlueDogEnergy (6).
Every membership assertion compares the complete native-ID set, including extras
and missing IDs, on active canvas nodes. Sidebar search does not satisfy these checks.

## Browser evidence and limits

The initial integrated repair pass passed 19 localhost-only Chromium flows. The
final clean-build pass adds an explicit Forward/Back cycle and actual viewport pan;
its final result is recorded below after completion. Existing assertions cover first
selection keeping the camera stationary, keyboard focus revealing the last of 463
siblings, Back restoring full contents, scope/context navigation, resize, zoom,
anonymous declarations, ports, direct typing and attribute tiles. No old More/page
controls appear in these complete child views.

Cards retained 260–280px visual widths in the measured complete views; large sibling
sets use the local viewport rather than fitting every card into unreadable pixels.
The desktop was 1440×1000 and the narrow viewport was 390×844. Screenshots were
visually inspected. The initial large-package check completed approximately 1.24s
after selection under concurrent development/test load; this is an observation,
not an isolated performance benchmark. No physical iPhone or Safari measurement
was performed.

Ignored local evidence under `build/`:

- `children-native-inventory.json`, `children-part-typing-inventory.json`,
  `children-native-root-expected.json`: exact native expected IDs and counts.
- `children-public-baseline.json`, `children-baseline-projections.json`: public UI
  reproduction and old selector results.
- `children-browser-repair.json`: initial 19-flow integrated pass.
- `children-browser-final.json`: final clean-build result (pending at doc creation).
- `children-browser-validation.mjs`: local diagnostic harness, using this checkout's
  published site, installed Playwright/Chromium and machine-local tool paths.
- `children-baseline-gorge-desktop.png`, `children-baseline-gorge-mobile.png`,
  `children-baseline-large.png`: reproduced baseline sampling.
- `children-final-default-gorge.png`, `children-final-whole-project.png`,
  `children-final-large-desktop.png`, `children-final-large-mobile.png`,
  `children-final-port-declarations.png`, `children-final-definition.png`,
  `children-final-part-usage.png`, `children-final-attributes.png`,
  `children-final-calculation.png`: corrected viewport screenshots.

These ignored artifacts are local audit evidence, not portable repository test
fixtures. Product regression tests cover synthetic boundary and layout contracts.
This audit preserves the frozen bundled model while a separate authorized task
refactors Blue Dog analysis source. It makes no claim about unimported source changes
or complete SysML notation conformance.
