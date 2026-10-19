# Blue Dog: river traffic and recovery

```syspresent
{"type":"scene","id":"gorge-traffic","title":"Collision avoidance on the Gorge course","view":"BlueDogCanvasViews::challengeTraffic","focus":"BlueDogRequirements::trafficSafety","panel":{"placement":"right"},"presentation":{"compartments":"auto","emphasis":["derive"],"contextBudget":3}}
```

I want to build a small autonomous sailboat for a Bingen–Stevenson–Bingen round trip. Shared river traffic makes collision avoidance a central design problem. The derivation arrow points toward the original challenge obligation. The full model is loaded; this scene selects its link to Blue Dog’s traffic-response requirement.

```syspresent
{"type":"scene","id":"traffic-derivation","title":"Tracking, risk updates and command timing","view":"BlueDogCanvasViews::trafficDerivation","focus":"BlueDogRequirements::trafficSafety","panel":{"placement":"bottom"},"presentation":{"compartments":"compact","emphasis":["derive"],"contextBudget":3}}
```

S-001 separates into tracking, one-second risk updates, a two-second command deadline and fault reporting. Detection envelopes depend on target class and conditions. These are requirements and intended allocations. Their verification remains inconclusive: a timely command alone does not establish enough achieved clearance.

```syspresent
{"type":"scene","id":"powered-recovery","title":"Powered recovery needs protected energy","view":"BlueDogCanvasViews::recoveryBasis","focus":"BlueDogRequirements::safeRecovery","panel":{"placement":"right"},"presentation":{"compartments":"auto","emphasis":["derive"],"contextBudget":3}}
```

Emergency intervention ends the qualifying attempt. Controlled recovery motivates a motor capable of reaching a suitable retrieval location and a protected energy reserve. These plain dependencies record design reasons. They do not establish an independently working recovery path after sensing, steering or power fails.

```syspresent
{"type":"scene","id":"capsize-qualification","title":"Capsize need not end the attempt","view":"BlueDogCanvasViews::capsizeQualification","focus":"BlueDogRequirements::capsizeQualificationRetention","panel":{"placement":"right"},"presentation":{"compartments":"auto","emphasis":["derive"],"contextBudget":3}}
```

Capsize alone does not disqualify the boat. Safety functions must remain available while inverted; unassisted righting and restored control can preserve qualification. Motor use, outside intervention or a prior abort still ends it. The requirement link is distinct from proof that the physical boat can recover.

```syspresent
{"type":"scene","id":"capsize-decision","title":"Deciding whether to resume after righting","view":"BlueDogCanvasViews::capsizeDecision","focus":"BlueDogMissionLogic::CapsizeDisposition","panel":{"placement":"bottom"},"journey":["BlueDogRequirements::capsizeQualificationRetention","BlueDogMissionLogic::CapsizeDisposition"],"presentation":{"compartments":"auto","emphasis":["succession"],"contextBudget":3}}
```

The General View follows the model’s explicit dependency from the qualification requirement to this decision. Missing safety confirmation or a latched abort prevents resumption. Supplied observations drive the action; it predicts neither righting dynamics nor installed sensing performance.

```syspresent
{"type":"scene","id":"supervisor-decision","title":"Choosing sailing, avoidance or recovery","view":"BlueDogCanvasViews::supervisorDecision","focus":"BlueDogMissionLogic::SupervisoryCycle","panel":{"placement":"bottom"},"presentation":{"compartments":"auto","emphasis":["succession"],"contextBudget":3}}
```

The supervisor selects sailing, traffic avoidance, degraded drift or abort/recovery from its supplied inputs. Communications can carry an alert; they do not authorize safe action. The next engineering work is to establish reviewed detection envelopes, physical maneuver performance and recovery evidence. The model’s open claims remain open.
