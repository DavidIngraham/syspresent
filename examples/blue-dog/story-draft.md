# Blue Dog collision avoidance and recovery

I want to build a small autonomous sailboat for a round trip on the Columbia River. Completing that course is only useful if the boat can coexist with other river users and deal with a failed attempt. This story follows one engineering argument: observation has to arrive early enough to support a real response, and recovery has to remain useful when the primary response fails.

```syspresent
{"type":"stop","id":"challenge-obligations","title":"Gorge traffic, intervention and recovery obligations","view":"challenge-requirements","modelRefs":["GorgeChallenge__trafficCoexistence","GorgeChallenge__navigationRules","GorgeChallenge__safetyCapabilityAbort","GorgeChallenge__autonomousShoreRecovery"],"focus":"GorgeChallenge__TrafficCoexistence"}
```

The Gorge course is shared river space. Commercial traffic, recreational craft and people in the water make coexistence a central part of the challenge, with more frequent close encounters than an open-ocean passage. Completing the route does not excuse a collision or a navigation-rule breach.

These five challenge requirements establish the traffic and recovery obligations followed here. Collision avoidance, navigation-rule compliance, emergency intervention, loss of qualification and autonomous shore recovery are distinct outcomes. The table is a selected part of the challenge, not its complete entry criteria.

The record tables show requirement definitions, where the source model stores identifiers and full statements. The relationship views use the corresponding requirement usages, where the source model attaches traces. A definition describes the obligation; a usage applies it in this model.

```syspresent
{"type":"stop","id":"challenge-derivation","title":"Deriving traffic response and navigation signals","view":"challenge-derivation","modelRefs":["BlueDogRequirements__challengeTrafficResponse","BlueDogRequirements__challengeNavigationSignals"],"focus":"GorgeChallenge__trafficCoexistence"}
```

Read from the upper challenge requirements to the lower vehicle requirements. Native derivation arrowheads point back toward the original requirement. The model derives Blue Dog's traffic-safety requirement from the challenge's collision-free-course obligation, and navigation conspicuity from navigation-rule compliance. These are explicit derivation connections in the source model.

This block diagram shows two selected derivations. It does not say that signals alone cover navigation rules, or that the rest of the challenge has been fully allocated. A trace records the engineering argument to review; it is not evidence that the boat satisfies either obligation.

```syspresent
{"type":"stop","id":"obligation","title":"Blue Dog traffic response and navigation signals","view":"avoidance-requirements","focus":"BlueDogRequirements__TrafficSafety","modelRefs":["BlueDogRequirements__trafficSafety","BlueDogRequirements__navigationConspicuity","BlueDogClassDetection__policy"]}
```

S-001 turns collision avoidance into a vehicle obligation: assess traffic and respond within reviewed class-specific envelopes. S-004 separately requires the signals appropriate to the operating mode. Both remain open; neither a catalogue sensor range nor a light fitted to the hull establishes compliance.

For S-001, I need a timely usable track, a feasible decision and enough achieved motion to preserve separation. The allocation distinguishes target classes and conditions, including occupied kayaks, stand-up paddleboards, people in the water and unoccupied craft. Consequences and clearance matter alongside relative motion, but a presumed mild contact cannot shorten the physical maneuver. Accepted numerical class allocations remain unresolved.

```syspresent
{"type":"stop","id":"traffic-derivation","title":"Four acceptance outcomes derived from traffic safety","view":"traffic-acceptance","modelRefs":["BlueDogRequirements__trafficSafety","BlueDogRequirements__trafficTracking","BlueDogRequirements__collisionAssessmentCadence","BlueDogRequirements__avoidanceCommandDeadline","BlueDogRequirements__trafficAwarenessFault"],"focus":"BlueDogRequirements__trafficSafety"}
```

S-001 supplies the common encounter conditions. Its four derivation links separate tracking, risk-update cadence, command timing and fault reporting into outcomes that can be assessed individually. The original requirement is at the top; its derived requirements are below it. These links do not allocate a particular sensor or autopilot.

```syspresent
{"type":"stop","id":"traffic-details","title":"Tracking, assessment and command timing requirements","view":"traffic-details","modelRefs":["BlueDogRequirementVerification__TrafficSafetyVerification","BlueDogClassDetection__policy"],"focus":"BlueDogRequirements__TrafficTracking"}
```

The detailed records distinguish three kinds of timing. Collision-risk estimates update at least once per second. An avoiding-action command follows a risk trigger within two seconds. A traffic-awareness fault is logged within one second after assessment has been invalid for more than five seconds. Tracking performance still depends on the reviewed class and condition envelope.

Those deadlines do not establish achieved clearance: a timely command can still arrive too late for the boat's maneuver capability. [TrafficSafetyVerification](model:BlueDogRequirementVerification::TrafficSafetyVerification) names the parent and these four outcomes, but its verdict is inconclusive. Installed observation, physical response and representative encounter evidence are still required.

```syspresent
{"type":"stop","id":"recovery-requirements","title":"Controlled recovery, propulsion and protected energy","view":"recovery-requirements","modelRefs":["BlueDogRequirements__safeRecovery","BlueDogRequirements__recoveryPropulsion","BlueDogRequirements__recoveryEnergy"],"focus":"BlueDogRequirements__SafeRecovery"}
```

The traffic response needs a recovery branch when continuing the attempt is no longer supportable. S-003 covers controlled intervention and powered recovery. R-001 requires reaching a suitable retrieval location from declared course cases. R-002 protects the energy for a viable route, including its uncertainty allowance.

Recovery remains a maneuver in shared water. A motor and an energy reserve do not demonstrate safe movement after sensing is lost. C-012 and C-013 govern abort and autonomous recovery, but the selected vehicle dependency chain below starts from the challenge's emergency-intervention provision. It is not a complete derivation of those autonomous recovery obligations.

```syspresent
{"type":"stop","id":"recovery-basis","title":"Design reasons for powered recovery and its reserve","view":"recovery-basis","modelRefs":["BlueDogRequirements__deriveSafeRecovery","BlueDogRequirements__deriveRecoveryPropulsion","BlueDogRequirements__deriveRecoveryEnergy"],"focus":"BlueDogRequirements__safeRecovery"}
```

Here the relationship is deliberately different. Each cell is a dependency from a more specific design requirement in the row to its motivating requirement in the column: controlled intervention motivates powered recovery, which motivates a protected reserve. The source model calls these design motivations, not formal satisfaction implications. The names beginning with “derive” do not change their relationship type.

```syspresent
{"type":"stop","id":"recovery-acceptance","title":"Derived checks for abort, telemetry and motor isolation","view":"recovery-acceptance","modelRefs":["BlueDogRequirements__safeRecovery","BlueDogRequirementVerification__SafeRecoveryVerification"],"focus":"BlueDogRequirements__safeRecovery"}
```

These are formal derivation links again: S-003 is the original requirement at the top and the selected detailed outcomes are below it. This diagram concentrates on the abort latch, recovery telemetry, local isolation, restart inhibition and loss of manual control. Other S-003 outcomes and shared recording and energy obligations remain outside this selected view.

```syspresent
{"type":"stop","id":"recovery-details","title":"Emergency recovery timing and shutdown requirements","view":"recovery-details","modelRefs":["BlueDogRequirementVerification__SafeRecoveryVerification"],"focus":"BlueDogRequirements__AbortLatchDeadline"}
```

The records make the distinctions concrete. Latching a disqualification is separate from reporting position. Local isolation removes motor power and blocks restart until deliberate local reset. Loss of the manual command link has its own zero-thrust deadline; that condition must not be mistaken for a general instruction to wait for communications before autonomous recovery.

[SafeRecoveryVerification](model:BlueDogRequirementVerification::SafeRecoveryVerification) references these outcomes and additional shared requirements. Its verdict is also inconclusive. A derivation arrow establishes a modeled relationship, not a passing test or a demonstrated recovery route.

```syspresent
{"type":"stop","id":"response","title":"Choosing between sailing, avoidance and recovery","view":"supervisor","focus":"BlueDogMissionLogic__SupervisoryCycle","modelRefs":["BlueDogMissionLogic__SupervisoryCycle","BlueDogMissionLogic__FallbackPolicy"]}
```

The supervisor chooses among sailing, avoidance and the abort/recovery path using supplied observations and capability states. It preserves an abort once requested. Shore communications can carry an alert; they are not permission to start acting safely.

This action describes decision logic. It is not a demonstration of installed sensing or a physical autopilot. Command delivery, an already occupied maneuver, turning authority and observation delay still determine whether the selected response can happen in time.

```syspresent
{"type":"stop","id":"shared-failure","title":"Shared power and computing failures","view":"system-failure","focus":"BlueDogAvoidanceFailures__Exposure__AND_5fsafeSeparationUnsupported","camera":{"target":"BlueDogAvoidanceFailures__Exposure__AND_5fsafeSeparationUnsupported","zoom":1},"annotations":[{"target":"BlueDogAvoidanceFailures__Exposure__sharedPowerLoss","text":"The same power-loss event can defeat both credited paths."}],"modelRefs":["BlueDogAvoidanceFailures__Exposure"]}
```

The top event says that, during an encounter demand, neither the primary response nor the fallback supplies supported safe separation. That is a loss of capability, not a prediction that a collision must occur.

Shared power and shared computing appear on both paths. Treating those paths as independent would hide the common cause. The tree is qualitative and conditional: it assigns no event probabilities and does not claim that every cause has been found. Follow the gate connections and their meanings rather than counting boxes.

```syspresent
{"type":"stop","id":"find-action","title":"Failures in sensing, decisions and maneuver execution","view":"primary-failure","focus":"BlueDogAvoidanceFailures__Exposure__OR_5fprimaryUnavailable","modelRefs":["BlueDogAvoidanceFailures__functional","BlueDogAvoidanceFailures__concepts","BlueDogDFMEA__starter"]}
```

Observation, assessment, command selection and maneuver execution can each remove the primary response. The functional review follows those failures into local and mission effects. The separate starter design failure-mode review looks at architecture mechanisms such as leakage or a jammed rudder.

A proposed detection method or recommended test is an action to take, not an implemented safeguard. The native review tables retain the distinction between an open hypothesis, action evidence and an accepted disposition. Their current open scope prevents me from presenting the list as complete safety coverage.


```syspresent
{"type":"stop","id":"review-actions","title":"Open investigations in the design failure review","view":"dfmea-actions","modelRefs":["BlueDogDFMEA__starter"]}
```

The action table is generated from the model's starter review rows. Select a row to explore the same review element in the graph. An action description records work that remains to be done; it is not a completed test or an accepted result.

```syspresent
{"type":"stop","id":"review-dispositions","title":"Evidence and status of the design failure investigations","view":"dfmea-dispositions","modelRefs":["BlueDogDFMEA__starter"]}
```

The disposition table separates the proposed work from its evidence and current status. An open or unassessed row remains unresolved when the story is published. Compare the review identifier with the action table in the previous section to follow the same failure mode.

```syspresent
{"type":"stop","id":"righting","title":"Capsize recovery and challenge qualification","view":"capsize","focus":"BlueDogMissionLogic__CapsizeDisposition","modelRefs":["BlueDogMissionLogic__CapsizeDisposition","BlueDogRequirements__capsizeQualificationRetention","GorgeChallenge__autonomousShoreRecovery"]}
```

Capsize alone is not the deciding event. Required safety functions must remain available while inverted. If the boat rights itself unassisted and restores upright control, it can preserve qualification. Missing safety evidence, a prior abort, motor use or outside intervention does not become a qualifying attempt merely because the boat is upright again.

Powered shore recovery is a separate safety response after qualification is lost. A successful simulation of that response does not demonstrate unassisted self-righting, independent installed observation or physical capture at a shore approach.

```syspresent
{"type":"stop","id":"exposure","title":"Passage duration and the probability of critical failure","modelRefs":["BlueDogPassageExposure__Contours","BlueDogDFMEA__starter"]}
```

The prepared plot asks a narrower question: under a constant hourly critical-failure rate, how does passage duration change conditional survival? A shorter passage can offset a higher hourly rate. The plotted designs are hypothetical; they are not measured Blue Dog reliability or an accepted collision-risk budget.

```syspresent
{"type":"figure","id":"exposure-plot","title":"Passage duration versus hourly critical-failure rate","asset":"passage-reliability.svg","fullWidth":true,"alt":"Equal-survival contours compare passage hours and constant hourly critical-failure rate, with two hypothetical designs.","caption":"Prepared native-analysis sensitivity. It does not predict a selected hull or establish safety acceptance.","provenance":{"source":"sv-blue-dog docs/figures/passage-reliability.svg; generator tools/publishing/passage_exposure.py; native BlueDogPassageExposure::Contours","context":"Illustrative constant-hazard inputs in models/analyses/passage-exposure.sysml, source HEAD b12b079855002466a8a95b54a5dba88e8ffc0611; no measured specimen"},"evidence":{"classification":"prepared-analysis","source":"BlueDogPassageExposure::Contours; models/analyses/passage-exposure.sysml","configuration":"Illustrative constant-hazard sensitivity; source revision b12b079855002466a8a95b54a5dba88e8ffc0611","inputs":{"hours":[12,18,24,30,36,42,48,54,60,66,72,78,84,90,96],"survivalContours":[0.99,0.95,0.9,0.8],"exampleHours":[60,30],"exampleRatesPerHour":[0.001,0.0015]}}}
```

```syspresent
{"type":"closing","id":"next-evidence","title":"Tests needed for sensing, maneuvering and recovery","supports":"The model connects traffic obligations, supervisory behavior, conditional failure paths and proposed investigations. It distinguishes qualification-preserving unassisted righting from disqualified powered recovery.","open":"Installed observation, achieved maneuver bounds, shared-fault isolation and class-specific evidence criteria remain unresolved. The qualitative tree and open reviews do not establish complete coverage or physical acceptance.","next":"Measure useful observation and achieved response together, challenge the credited recovery path with shared faults, and use the resulting evidence to review class-specific allocations and open failure actions.","modelRefs":["BlueDogClassDetection__policy","BlueDogDFMEA__starter","BlueDogRequirements__criticalFailureDisposition"]}
```
