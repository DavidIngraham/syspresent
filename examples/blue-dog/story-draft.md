# Can Blue Dog avoid a hazard and remain recoverable?

I want to build a small autonomous sailboat for a round trip on the Columbia River. Completing that course is only useful if the boat can coexist with other river users and deal with a failed attempt. This story follows one engineering argument: observation has to arrive early enough to support a real response, and recovery has to remain useful when the primary response fails.

```syspresent
{"type":"stop","id":"obligation","title":"Start with what the boat owes other river users","view":"avoidance-requirements","focus":"BlueDogRequirements__trafficSafety","camera":{"target":"BlueDogRequirements__trafficSafety","zoom":1},"modelRefs":["BlueDogRequirements__trafficSafety","BlueDogRequirements__trafficTracking","BlueDogClassDetection__policy"]}
```

Avoiding collision and interference is the obligation. A sensor's catalogue range does not establish that the boat can meet it. I need a timely usable track, a feasible decision and enough achieved motion to preserve separation.

The current allocation distinguishes target classes and conditions. Occupied kayaks, stand-up paddleboards, people in the water and unoccupied craft need distinct evidence. Clearance and consequences matter alongside relative motion, but a presumed mild contact cannot shorten the physical maneuver. Accepted numerical class allocations remain unresolved.

```syspresent
{"type":"stop","id":"response","title":"Connect the observation to an onboard decision","view":"supervisor","focus":"BlueDogMissionLogic__SupervisoryCycle","modelRefs":["BlueDogMissionLogic__SupervisoryCycle","BlueDogMissionLogic__FallbackPolicy"]}
```

The supervisor chooses among sailing, avoidance and the abort/recovery path using supplied observations and capability states. It preserves an abort once requested. Shore communications can carry an alert; they are not permission to start acting safely.

This action describes decision logic. It is not a demonstration of installed sensing or a physical autopilot. Command delivery, an already occupied maneuver, turning authority and observation delay still determine whether the selected response can happen in time.

```syspresent
{"type":"stop","id":"shared-failure","title":"Two paths can share one cause of failure","view":"system-failure","focus":"BlueDogAvoidanceFailures__Exposure__AND_5fsafeSeparationUnsupported","camera":{"target":"BlueDogAvoidanceFailures__Exposure__AND_5fsafeSeparationUnsupported","zoom":1},"annotations":[{"target":"BlueDogAvoidanceFailures__Exposure__sharedPowerLoss","text":"The same power-loss event can defeat both credited paths."}],"modelRefs":["BlueDogAvoidanceFailures__Exposure"]}
```

The top event says that, during an encounter demand, neither the primary response nor the fallback supplies supported safe separation. That is a loss of capability, not a prediction that a collision must occur.

Shared power and shared computing appear on both paths. Treating those paths as independent would hide the common cause. The tree is qualitative and conditional: it assigns no event probabilities and does not claim that every cause has been found. Follow the gate connections and their meanings rather than counting boxes.

```syspresent
{"type":"stop","id":"find-action","title":"Turn a failure hypothesis into a useful investigation","view":"primary-failure","focus":"BlueDogAvoidanceFailures__Exposure__OR_5fprimaryUnavailable","modelRefs":["BlueDogAvoidanceFailures__functional","BlueDogAvoidanceFailures__concepts","BlueDogDFMEA__starter"]}
```

Observation, assessment, command selection and maneuver execution can each remove the primary response. The functional review follows those failures into local and mission effects. The separate starter design failure-mode review looks at architecture mechanisms such as leakage or a jammed rudder.

A proposed detection method or recommended test is an action to take, not an implemented safeguard. The native review tables retain the distinction between an open hypothesis, action evidence and an accepted disposition. Their current open scope prevents me from presenting the list as complete safety coverage.


```syspresent
{"type":"stop","id":"review-actions","title":"Read the open actions alongside the failure mechanisms","view":"dfmea-actions","modelRefs":["BlueDogDFMEA__starter"]}
```

The action table is generated from the model's starter review rows. Select a row to explore the same review element in the graph. An action description records work that remains to be done; it is not a completed test or an accepted result.

```syspresent
{"type":"table","id":"action-table","title":"Starter DFMEA actions","asset":"dfmea-actions.json","fullWidth":true,"caption":"Native query output for the current starter review scope. Read proposed work separately from evidence and disposition.","provenance":{"source":"BlueDogReliabilityDocuments::Actions","context":"Model source b12b079855002466a8a95b54a5dba88e8ffc0611; starterReviewRows; proposed investigations"}}
```

```syspresent
{"type":"table","id":"disposition-table","title":"Evidence and disposition of those same rows","asset":"dfmea-dispositions.json","fullWidth":true,"caption":"The matching native rows retain open or unassessed dispositions. Publishing this table does not close the actions.","provenance":{"source":"BlueDogReliabilityDocuments::Dispositions","context":"Same frozen starterReviewRows and source revision as the action table"}}
```

```syspresent
{"type":"stop","id":"righting","title":"Recoverable capsize need not end the attempt","view":"capsize","focus":"BlueDogMissionLogic__CapsizeDisposition","modelRefs":["BlueDogMissionLogic__CapsizeDisposition","BlueDogRequirements__capsizeQualificationRetention","GorgeChallenge__autonomousShoreRecovery"]}
```

Capsize alone is not the deciding event. Required safety functions must remain available while inverted. If the boat rights itself unassisted and restores upright control, it can preserve qualification. Missing safety evidence, a prior abort, motor use or outside intervention does not become a qualifying attempt merely because the boat is upright again.

Powered shore recovery is a separate safety response after qualification is lost. A successful simulation of that response does not demonstrate unassisted self-righting, independent installed observation or physical capture at a shore approach.

```syspresent
{"type":"stop","id":"exposure","title":"Duration changes the exposure to failure","modelRefs":["BlueDogPassageExposure__Contours","BlueDogDFMEA__starter"]}
```

The prepared plot asks a narrower question: under a constant hourly critical-failure rate, how does passage duration change conditional survival? A shorter passage can offset a higher hourly rate. The plotted designs are hypothetical; they are not measured Blue Dog reliability or an accepted collision-risk budget.

```syspresent
{"type":"figure","id":"exposure-plot","title":"An illustrative passage-exposure trade","asset":"passage-reliability.svg","fullWidth":true,"alt":"Equal-survival contours compare passage hours and constant hourly critical-failure rate, with two hypothetical designs.","caption":"Prepared native-analysis sensitivity. It does not predict a selected hull or establish safety acceptance.","provenance":{"source":"sv-blue-dog docs/figures/passage-reliability.svg; generator tools/publishing/passage_exposure.py; native BlueDogPassageExposure::Contours","context":"Illustrative constant-hazard inputs in models/analyses/passage-exposure.sysml, source HEAD b12b079855002466a8a95b54a5dba88e8ffc0611; no measured specimen"},"evidence":{"classification":"prepared-analysis","source":"BlueDogPassageExposure::Contours; models/analyses/passage-exposure.sysml","configuration":"Illustrative constant-hazard sensitivity; source revision b12b079855002466a8a95b54a5dba88e8ffc0611","inputs":{"hours":[12,18,24,30,36,42,48,54,60,66,72,78,84,90,96],"survivalContours":[0.99,0.95,0.9,0.8],"exampleHours":[60,30],"exampleRatesPerHour":[0.001,0.0015]}}}
```

```syspresent
{"type":"closing","id":"next-evidence","title":"What follows from this argument?","supports":"The model connects traffic obligations, supervisory behavior, conditional failure paths and proposed investigations. It distinguishes qualification-preserving unassisted righting from disqualified powered recovery.","open":"Installed observation, achieved maneuver bounds, shared-fault isolation and class-specific evidence criteria remain unresolved. The qualitative tree and open reviews do not establish complete coverage or physical acceptance.","next":"Measure useful observation and achieved response together, challenge the credited recovery path with shared faults, and use the resulting evidence to review class-specific allocations and open failure actions.","modelRefs":["BlueDogClassDetection__policy","BlueDogDFMEA__starter","BlueDogRequirements__criticalFailureDisposition"]}
```
