# Blue Dog story source inventory

Read-only inventory on 17 October 2026 of `/home/david/repos/sv-blue-dog-editorial`, HEAD `b12b079855002466a8a95b54a5dba88e8ffc0611`. The checkout reported a modified `AGENTS.md`; no engineering source was modified during this inventory. These are verified source declarations and paths, not a claim that Syspresent has rendered or accepted them. Resolve semantic IDs through the native exporter before compiling the draft.

## Export inputs and reusable configuration

Use the complete `models/` directory initially. The requirements, mission logic, architecture, analyses and local libraries have cross-dependencies; this inventory does not claim a smaller closed source subset. Add `tools/publishing/reference.sysml` as an additional native source: the existing failure views and document queries are declared there, **not in the model directory**. Use the project's pinned native dependency configuration. Do not parse Markdown fences as SysML in the browser.

The draft proposes the following story-local view IDs. They are configuration keys to be bound by the native exporter, not existing native names:

| Story view ID | Native source / subject | Existing output kind |
| --- | --- | --- |
| `avoidance-requirements` | `BlueDogRequirements::trafficSafety`, `trafficTracking`, `criticalFailureDisposition`, `capsizeQualificationRetention`; `GorgeChallenge::safetyCapabilityAbort`, `autonomousShoreRecovery` | A new scoped native requirement view is needed, or reuse the source-authored safety view below |
| `supervisor` | `BlueDogMissionLogic::SupervisoryCycle` | Native action render requested from this action definition |
| `capsize` | `BlueDogMissionLogic::CapsizeDisposition` | Native action render requested from this action definition |
| `system-failure` | `BlueDogFailureViews::SystemTreeView` | Existing `FailureAnalysisViews::FaultTreeView` |
| `primary-failure` | `BlueDogFailureViews::PrimaryTreeView` | Existing fault-tree view |
| `scanner-failure` | `BlueDogFailureViews::ScannerTreeView` | Existing fault-tree view |
| `functional-review` | `BlueDogAvoidanceDocuments::functional` | Existing native Document with table from `functionalRows` |
| `starter-dfmea` | `BlueDogReliabilityDocuments::DFMEA` | Existing native Document with multiple tables; not a RenderView |

Do not silently coerce a native Document into a drawing. Export its prepared native tables with provenance, or explicitly support Document output in the adapter. Likewise, preserve unsupported fault-tree notation as a reported integration gap; do not redraw causal semantics from prose labels.

Additional existing source-authored views live inside Markdown fences:

- `docs/requirements/requirements-safety.md`: `Page_safety_18::thread` and `SRR_Thread_safety::thread`.
- `docs/architecture.md`: `Page_architecture_traffic::scenario` and `Page_architecture_recovery::scenario`.

Their scoped source declarations must be passed through the native compiler if reused. They are not automatically available from loading `models/`. The explicit subjects in the table above avoid depending on generated publishing intermediates.

## Exact model pointers and interpretation

| File relative to Blue Dog root | Verified declarations | Story meaning |
| --- | --- | --- |
| `models/vehicle/requirements.sysml` | `BlueDogRequirements::trafficSafety`, `trafficTracking`, `criticalFailureDisposition`, `capsizeQualificationRetention` | Current traffic, risk-disposition and qualification obligations |
| `models/missions/transgorge.sysml` | `GorgeChallenge::safetyCapabilityAbort`, `autonomousShoreRecovery`, `capsizeRecovery` | Safety action and casualty recovery, distinct from a qualifying sail-only attempt |
| `models/vehicle/mission-logic.sysml` | `BlueDogMissionLogic::HandleEvent`, `SupervisoryCycle`, `CapsizeDisposition`, `RecoveryAuthority`, `FallbackPolicy` | Executable supervisory decisions with supplied observations; not a physical autopilot or righting model |
| `models/analyses/class-specific-detection.sysml` | `BlueDogClassDetection::policy`, `Assessment`, `Summary` | Current class-specific distance, acquisition/track reliability and whole-response evidence gates; accepted allocations remain unresolved |
| `models/analyses/avoidance-failures.sysml` | `BlueDogAvoidanceFailures::Exposure`, `exposure`, `functional`, `concepts` | Conditional qualitative failure analysis and open design hypotheses |
| Same | `BlueDogAvoidanceFailures::Exposure::sharedPowerLoss`, `sharedComputeLoss`, `OR_primaryUnavailable`, `OR_recoveryUnavailable`, `AND_safeSeparationUnsupported` | Shared causes can defeat both paths; the top event is unsupported safe-separation capability during demand, **not a predicted collision** |
| `models/analyses/dfmea.sysml` | `BlueDogDFMEA::starter`, `starter::hullLeak`, `starter::steeringJam` | Initial architecture review; unassessed risk and proposed actions do not establish mitigation effectiveness |
| `tools/publishing/reference.sysml` | `BlueDogReliabilityDocuments::Modes`, `Functions`, `Effects`, `Actions`, `Dispositions`, `DFMEA` | Native queries and prepared review tables |

The starter `Modes` query selects descendants of `BlueDogDFMEA::starter` typed as `FailureAnalysis::ReviewRow`. Preserve this scope; selecting every review row in the project would mix the starter architecture review with the newer functional/concept reviews. Neither a hardcoded row-name list nor labels should establish membership.

Capsize does not automatically end the attempt. `CapsizeDisposition` requires safety confirmation while inverted and observed unassisted upright recovery with restored control before resumption. Missing safety evidence or a prior abort keeps the abort path. Motor use or outside intervention remains disqualifying. A powered inverted-recovery simulation is a different case from unassisted righting that preserves qualification.

## Prepared plot and provenance

The existing `docs/figures/passage-reliability.svg` is a suitable prepared sensitivity plot. Its generator is `tools/publishing/passage_exposure.py`, which obtains native results from `BlueDogPassageExposure::Contours` in `models/analyses/passage-exposure.sysml`. The calculation uses `MarineReliability::ConstantHazardSurvival` and `EqualSurvivalRate`. The plotted cases are hypothetical constant-hazard designs; no measured Blue Dog failure rate or collision-risk acceptance is implied.

For snapshot assembly, copy this existing SVG to `assets/passage-reliability.svg` and record the source revision plus content digests of the SVG, generating script, analysis and native dependency. The draft expects that local asset; it deliberately fails compilation if the snapshot builder has not copied it. This inventory did not regenerate or copy it and has not verified a fresh numerical run. Its source trace is sufficient to select the figure, not to claim a newly reproduced result.

Relevant explanatory sources are `docs/reliability.md`, `docs/mission-simulation.md`, `docs/encounter-feasibility.md`, and `docs/reference/encounter-envelope.md`. Earlier 750 m allocation and local IC-01 campaign results retain their historical scope; do not use them as verification of current class-specific requirements.

## Draft story and remaining integration work

`examples/blue-dog/story-draft.md` follows obligation → timely response → shared failure → review action → recovery qualification → exposure sensitivity → next evidence. It uses semantic ID spellings corresponding to the export convention (`::` becomes `__`), but those must be checked against actual native conversion output. The draft makes no claim of acceptance or complete causal coverage. Native table extraction, asset packaging, rendered review and source-version pinning remain integration tasks.
