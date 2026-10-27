# Blue Dog: from the Gorge challenge to a defined boat

```syspresent
{"type": "scene", "id": "gorge-challenge", "title": "The Bingen–Stevenson–Bingen challenge", "view": "BlueDogCanvasViews::challengeOverview", "focus": "GorgeChallenge::transGorgeChallenge", "chapter": {"id": "gorge", "title": "The Gorge challenge"}, "presentation": {"compartments": "compact"}, "figures": [{"id": "course-map", "title": "The course", "asset": "assets/gorge-course.svg", "alt": "A schematic outbound leg from Bingen to a rounding near Stevenson, followed by the return to Bingen.", "caption": "The scored circuit starts and finishes at Bingen. The drawing shows the gate sequence; the model defines the geographic course.", "provenance": {"source": "TransGorgeCourse; models/missions/course.sysml", "context": "Blue Dog source b94b6e0; schematic, not a navigation chart"}, "modelRefs": ["TransGorgeCourse::policy", "GorgeChallenge::courseCompletion"]}], "context": [{"kind": "challenge-requirement", "title": "One qualifying circuit", "text": "Complete the configured gates in order, unassisted and using sailing propulsion. The challenge has no elapsed-time deadline.", "modelRefs": ["GorgeChallenge::courseCompletion", "GorgeChallenge::unassistedAttempt", "GorgeChallenge::sailingPropulsion"]}], "allowDisconnected": true}
```

Blue Dog is a small autonomous sailboat intended to navigate the Columbia River, trim its sail and respond to hazards using onboard control. Its first mission is the [Gorge challenge](model:GorgeChallenge::transGorgeChallenge): sail from Bingen, round buoy 16 near Stevenson and return to Bingen without operator intervention or motor propulsion.

The [course](model:TransGorgeCourse::policy) defines the departure, rounding and finish gates. They must be crossed in order during one attempt. There is no time limit. The complete boat, including its equipment and appendages, must fit the [1.2 m overall-length limit](model:GorgeChallenge::overallLength).

These views explain the boat's jobs, the designs under consideration and the tests still needed. IC-01 is the proposed boat used in the sizing studies. Equipment selection and physical qualification remain open.

```syspresent
{"type": "scene", "id": "qualifying-attempt", "title": "What keeps a circuit qualifying", "view": "BlueDogCanvasViews::story_qualifying_attempt", "focus": "GorgeChallenge::unassistedAttempt", "chapter": {"id": "gorge", "title": "The Gorge challenge"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "challenge-requirement", "title": "Recovery remains mandatory after abort", "text": "A safety abort initiates autonomous recovery toward a suitable shore retrieval location without waiting for communications. An alert is sent or queued.", "modelRefs": ["GorgeChallenge::autonomousShoreRecovery", "GorgeChallenge::abortAlert"]}]}
```

A qualifying circuit uses [sailing propulsion](model:GorgeChallenge::sailingPropulsion) and onboard control throughout. Passive shore monitoring and autonomous access to weather services are allowed. An operator-supplied update, remote control or use of the recovery motor ends qualification.

The boat must remain afloat and unattached. Anchoring, grounding or entering a designated refuge ends the attempt; waiting under sail is allowed. After intervention, a new attempt starts with a fresh departure-gate crossing.

[Loss of a required safety function](model:GorgeChallenge::safetyCapabilityAbort) requires abort and recovery unless a demonstrated backup preserves that function. A communications outage alone permits continued autonomous operation. The controller must remember whether the attempt has already been disqualified.

```syspresent
{"type": "scene", "id": "gorge-environment", "title": "Wind, waves and current define different operating questions", "view": "BlueDogCanvasViews::story_gorge_environment", "focus": "BlueDogRequirements::gorgeEnvironment", "chapter": {"id": "gorge", "title": "The Gorge challenge"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Test the proposed wind, wave and current limits", "text": "Measure which functions remain available and whether the boat can complete each leg in the admitted conditions.", "modelRefs": ["BlueDogRequirements::gorgeCurrent", "BlueDogRequirements::environmentalEnvelope"]}]}
```

The Columbia River brings opposing wind and current, short chop, traffic and submerged vegetation. The proposed [Gorge operating conditions](model:BlueDogRequirements::gorgeEnvironment) cover mean wind from 0 to 15 m/s, three-second gusts to 20 m/s, significant waves to 1.5 m and current to 1.5 m/s. These targets still need tests with the selected boat.

[Passage time](model:BlueDogRequirements::passageDuration) depends on the changing wind, current, tacking, waiting and available energy. An acceptable [forecast window](model:GorgeChallenge::forecastAdmission) must cover the journey and recovery. Tests must also establish how long the boat can preserve flotation, safety and recoverability after it can no longer sail normally. The [ocean conditions](model:BlueDogRequirements::oceanEnvironment) apply to the later Hawaii mission.

```syspresent
{"type": "scene", "id": "owner-constraints", "title": "A boat one person can build, transport and service", "view": "BlueDogCanvasViews::story_owner_constraints", "focus": "BlueDogRequirements::desktopManufacture", "chapter": {"id": "requirements", "title": "Requirements and owner constraints"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "owner-constraint", "title": "Buildable segments and service access", "text": "Plan print jobs, joints, removable assemblies, seals and access for one-person handling and hand-tool maintenance.", "modelRefs": ["BlueDogStructure::hybridConstruction", "BlueDogSailTrade::softSail"]}]}
```

The owner requires each print job to fit a [250 mm cube](model:BlueDogRequirements::desktopManufacture), including supports and printer clearance. The proposed [shell construction](model:BlueDogStructure::hybridConstruction) combines printed substrate with glass and epoxy; PETG is the first material to investigate.

[One adult must be able to handle the boat](model:BlueDogRequirements::transportability) under the specified mild wind, wave and bank conditions. Equipment must be replaceable with hand tools. These requirements determine segment sizes, joints, removable assemblies, access space and seals. Rough-weather retrieval needs its own recovery plan.

```syspresent
{"type": "scene", "id": "system-obligations", "title": "Passage needs navigation, energy, safety and a record", "view": "BlueDogCanvasViews::story_system_obligations", "focus": "BlueDogRequirements::roundTrip", "chapter": {"id": "requirements", "title": "Requirements and owner constraints"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Measure timing and accuracy", "text": "Measurements of the boat and its encounters must justify timing, accuracy and other numerical targets.", "modelRefs": ["BlueDogRequirementBasis::retainedAllocations", "BlueDogRequirementBasis::recoveryStrategy"]}]}
```

The boat must navigate the course, steer and trim its sail, detect traffic, stay within permitted water and keep enough energy to reach a recovery location. It must also store a [mission record](model:BlueDogRequirements::missionEvidence) that shows where it went, which commands it followed and why it changed behavior.

Navigation and wind updates, hazard detection and actuator commands must arrive in time for the boat to respond. The [timing and accuracy targets](model:BlueDogRequirementBasis::retainedAllocations) need measurements of the selected sensors, controllers and actuators.

```syspresent
{"type": "scene", "id": "normal-sailing", "title": "A sailing cycle observes wind, selects trim and applies control", "view": "BlueDogCanvasViews::story_normal_sailing", "focus": "BlueDogMethod::Scenarios::NormalSailing", "chapter": {"id": "operations", "title": "Operating scenarios"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Wind sensing has a freshness contract", "text": "The baseline calls for observations at least once a second, marks them invalid after two seconds, and excludes invalid observations from trim calculations.", "modelRefs": ["BlueDogRequirements::windSampleCadence", "BlueDogRequirements::windStaleInvalidation", "BlueDogRequirements::invalidWindUseInhibition"]}]}
```

In [normal sailing](model:BlueDogMethod::Scenarios::NormalSailing), the boat measures apparent wind, chooses a sail angle and applies the command while the supervisor permits sailing. Apparent wind is the wind measured relative to the moving boat.

The [navigation cycle](model:BlueDogMethod::Scenarios::NavigationUpdate) updates position and heading before choosing the next maneuver. Old or invalid observations must be rejected. These scenarios describe the steps to implement and test in the controller.

```syspresent
{"type": "scene", "id": "prepare-launch", "title": "Launch permission depends on the installed boat and the site", "view": "BlueDogCanvasViews::story_prepare_launch", "focus": "BlueDogMethod::Scenarios::PrepareAndLaunch", "chapter": {"id": "operations", "title": "Operating scenarios"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

[Launch preparation](model:BlueDogMethod::Scenarios::PrepareAndLaunch) checks the actual boat, course, forecast, safety equipment and available energy. The [energy check](model:BlueDogRequirements::launchEnergyAdmission) requires a fresh usable-energy estimate above the valid recovery reserve. The forecast must allow the complete route, waiting and recovery.

After maintenance, [release for another attempt](model:BlueDogMethod::Scenarios::MaintainAndRelease) requires checks of the changed equipment and seals and a record of the installed configuration. Departure starts the attempt only after these checks have been accepted.

```syspresent
{"type": "scene", "id": "logical-sailing", "title": "Separate sensing, guidance, permission and actuation", "view": "BlueDogCanvasViews::story_logical_sailing", "focus": "BlueDogLogicalArchitecture::LogicalVessel", "chapter": {"id": "logical", "title": "Logical responsibilities"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The [onboard functions](model:BlueDogLogicalArchitecture::vessel) divide the sailing job. Navigation estimates position and heading; wind sensing supplies apparent wind; guidance chooses sail and rudder commands. Supervision grants or withdraws permission to sail. Actuation applies the permitted commands.

The actuator receives both the requested command and current [permission](model:BlueDogLogicalArchitecture::OperationPermission). This lets a new safety restriction stop an older trim or steering request. Connections show the observations and commands each function needs.

```syspresent
{"type": "scene", "id": "logical-safety", "title": "Safety and recovery continue without the shore link", "view": "BlueDogCanvasViews::story_logical_safety", "focus": "BlueDogLogicalArchitecture::LogicalVessel", "chapter": {"id": "logical", "title": "Logical responsibilities"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The supervisor uses position, wind, traffic, permitted-water boundaries, battery energy and equipment health to decide whether sailing can continue. [Recovery management](model:BlueDogLogicalArchitecture::RecoveryManagement) chooses a reachable retrieval location and updates the route as conditions change. Recording preserves the decisions and observations.

[Communications](model:BlueDogLogicalArchitecture::Communications) sends records to shore and reports link status. If contact is lost, onboard safety and recovery must continue. The hardware design must establish which sensors, power supplies and controllers remain available after a fault.

```syspresent
{"type": "scene", "id": "gorge-traffic", "title": "Collision avoidance on the Gorge course", "view": "BlueDogCanvasViews::challengeTraffic", "focus": "BlueDogRequirements::trafficSafety", "panel": {"placement": "right"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "traffic", "title": "Traffic detection and avoidance"}, "allowDisconnected": true}
```

Blue Dog shares the river with ships, barges, fishing boats, recreational craft and people in the water. Some carry AIS radio identification; others must be observed by other means. The [challenge](model:GorgeChallenge::trafficCoexistence) requires collision-free passage. Blue Dog's [traffic requirement](model:BlueDogRequirements::trafficSafety) calls for detection, assessment and response under the applicable navigation rules.

The [detection study](model:BlueDogClassDetection::policy) needs separate results for target size, motion, daylight, darkness, spray and glare. Distances must leave enough time to detect, decide and maneuver. The [courtesy preference](model:BlueDogDesignDecisions::trafficCourtesy) favors routes and times that reduce developing encounters. Implementing that preference in the route planner remains open.

```syspresent
{"type": "scene", "id": "traffic-derivation", "title": "Tracking, risk updates and command timing", "view": "BlueDogCanvasViews::trafficDerivation", "focus": "BlueDogRequirements::trafficSafety", "panel": {"placement": "bottom"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "traffic", "title": "Traffic detection and avoidance"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Detection distances still need testing", "text": "The replay uses a historical sensing assumption. Set class-specific distances using measured sensing and maneuver performance.", "modelRefs": ["BlueDogIC01::integration", "BlueDogClassDetection::policy"]}]}
```

Traffic safety needs [target tracks](model:BlueDogRequirements::trafficTracking), collision-risk updates at least once a second, an avoidance-command deadline of two seconds and a response to lost traffic awareness.

The [encounter scenario](model:BlueDogMethod::Scenarios::TrafficEncounter) follows detection through maneuver selection and reassessment. Tests must measure observation delay, processing, actuator response and achieved clearance. The [traffic test plan](model:BlueDogRequirementVerification::TrafficSafetyVerification) still needs results for the selected sensors and boat.

```syspresent
{"type": "scene", "id": "powered-recovery", "title": "Powered recovery needs protected energy", "view": "BlueDogCanvasViews::recoveryBasis", "focus": "BlueDogRequirements::recoveryPropulsion", "panel": {"placement": "right"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "recovery", "title": "Recovery, capsize and qualification"}, "allowDisconnected": true}
```

After an abort, the boat must reach a suitable place where the operator can retrieve it. [Powered recovery](model:BlueDogRequirements::recoveryPropulsion) must work with the boat's remaining capabilities, actual load and the current along that route.

The [recovery reserve](model:BlueDogRequirements::recoveryEnergy) includes propulsion and essential equipment through the final approach, with allowance for uncertainty. The IC-01 [recovery calculation](model:BlueDogIntegratedCandidate::RecoveryScreen) estimates speed and energy for supplied conditions. Physical tests must establish thrust, behavior after capsize and arrival at the retrieval site.

```syspresent
{"type": "scene", "id": "capsize-qualification", "title": "Capsize need not end the attempt", "view": "BlueDogCanvasViews::capsizeQualification", "focus": "BlueDogRequirements::capsizeQualificationRetention", "panel": {"placement": "right"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "recovery", "title": "Recovery, capsize and qualification"}, "allowDisconnected": true, "context": [{"kind": "decision", "title": "Test righting after capsize", "text": "Measure righting, flooding, drainage and restored control, including pitch and roll. Static restoring curves cover only part of that work.", "modelRefs": ["BlueDogDesignDecisions::recoveryScope"]}]}
```

After capsize, the boat must [remain afloat](model:GorgeChallenge::casualtyFlotation), [retain major components](model:GorgeChallenge::majorComponentRetention) and preserve a means of autonomous shore recovery. The challenge permits recovery while inverted. Blue Dog also proposes [passive self-righting](model:BlueDogRequirements::selfRighting), which depends on ballast, rig weight, sealed volumes, retained water and actuator positions.

A capsized boat may resume the same attempt after unassisted righting if its required safety functions stayed available and control is restored. Motor use, outside intervention or an earlier abort ends qualification permanently for that attempt.

```syspresent
{"type": "scene", "id": "capsize-decision", "title": "Deciding whether to resume after righting", "view": "BlueDogCanvasViews::capsizeDecision", "focus": "BlueDogMissionLogic::CapsizeDisposition", "panel": {"placement": "bottom"}, "journey": ["BlueDogRequirements::capsizeQualificationRetention", "BlueDogMissionLogic::CapsizeDisposition"], "presentation": {"compartments": "compact", "emphasis": ["succession"]}, "chapter": {"id": "recovery", "title": "Recovery, capsize and qualification"}, "allowDisconnected": true}
```

The [decision after righting](model:BlueDogMissionLogic::CapsizeDisposition) permits qualifying sailing to resume only when required safety functions are confirmed and the attempt has not already been aborted. Returning upright must preserve any recorded disqualification, energy restriction and motor restriction.

Tests of this logic supply observations and check the resulting decision. Hull, sensor and actuator tests must establish whether the boat can actually right itself, recognize its condition and regain control.

```syspresent
{"type": "scene", "id": "rig-trade", "title": "Choosing how Blue Dog carries and trims its sail", "view": "BlueDogCanvasViews::rigAlternatives", "focus": "BlueDogDesignDecisions::sizingBaseline", "chapter": {"id": "rig", "title": "The sail and actuator trades"}, "presentation": {"compartments": "compact"}, "figures": [{"id": "rig-concepts", "title": "Rig concepts", "asset": "assets/rig-alternatives.svg", "alt": "Three conceptual rigs: a soft sail, a rigid wing with an aerodynamic tail, and a wing rotated directly by an actuator.", "caption": "These retained concepts have different control, energy and recovery questions. Their sketches do not define manufactured geometry.", "provenance": {"source": "BlueDogSailTrade; models/analyses/sail-trade.sysml", "context": "Blue Dog source b94b6e0; equal development contenders"}, "modelRefs": ["BlueDogSailTrade::softSail", "BlueDogSailTrade::tailWing", "BlueDogSailTrade::camberedWing"]}], "context": [{"kind": "decision", "title": "A baseline for calculation", "text": "The directly rotated fixed-camber wing supplies the first numerical sizing baseline. Soft sail and tail-controlled wing remain equal development contenders; comparable performance, energy and recovery evidence is still needed.", "modelRefs": ["BlueDogDesignDecisions::sizingBaseline"]}], "allowDisconnected": true}
```

Three [sail designs](model:BlueDogSailTrade::TradeAssessment) remain under consideration: a triangular soft sail, a rigid wing controlled by an aerodynamic tail and a fixed-camber wing rotated directly by a drive.

The soft sail needs sheet and chafe testing. The tail-controlled wing adds a boom, tail and tab whose failure behavior matters. The directly rotated wing needs adequate drive torque and acceptable energy use. Compare all three for sailing progress, mass, construction, electrical demand and recovery using the same conditions.

The [first sizing calculations](model:BlueDogDesignDecisions::sizingBaseline) use the fixed-camber wing because its CAD section is already available. A final choice needs comparable results for all three designs. Wing camber and control method can be chosen independently.

```syspresent
{"type": "scene", "id": "drive-and-aerodynamics", "title": "Holding the sail angle changes power and failure behavior", "view": "BlueDogCanvasViews::story_drive_and_aerodynamics", "focus": "BlueDogDesignDecisions::holdingDrive", "chapter": {"id": "rig", "title": "The sail and actuator trades"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "decision", "title": "Evidence that can decide the rig", "text": "Compare both-tack progress, installed mass and center of gravity, daily drive energy, wet-cycle durability and dynamic recovery using the same mission conditions.", "modelRefs": ["BlueDogDesignDecisions::sizingBaseline"]}]}
```

A [drive that holds its angle without motor current](model:BlueDogDesignDecisions::holdingDrive) could reduce sailing energy use. Controller standby, trim movements, friction, shock and wear still need measurement. After power loss, the same drive may leave the wing stuck at its last angle. Test locked and jammed angles in strong wind and capsize cases.

The [aerodynamic calculations](model:BlueDogDesignDecisions::aerodynamicScope) currently cover a limited attached-flow range. Rig selection needs measured forces and trim moments on both tacks, including stall and broadside wind.

```syspresent
{"type": "scene", "id": "ic01-definition", "title": "The IC-01 candidate joins geometry and onboard capabilities", "view": "BlueDogCanvasViews::candidateDefinition", "focus": "BlueDogIC01::design", "chapter": {"id": "candidate", "title": "IC-01 geometry and coupled sizing"}, "presentation": {"compartments": "compact"}, "context": [{"kind": "candidate", "title": "Test the recovery equipment after primary faults", "text": "Measure recovery power, sensing, control and thrust after the faults the design must survive.", "modelRefs": ["BlueDogIC01::design", "BlueDogIC01::integration"]}, {"kind": "assumption", "title": "Recovery independence needs evidence", "text": "Separate proposed power, observation, navigation, control and thrust paths make the intended recovery architecture inspectable. Separate model parts do not establish fault isolation in hardware.", "modelRefs": ["BlueDogPhysicalArchitecture::IC01Candidate"]}], "allowDisconnected": true, "figures": [{"id": "ic01-inputs", "title": "IC-01 inputs", "asset": "assets/ic01-inputs.svg", "alt": "Rounded IC-01 inputs: hull length 1.20 m, beam 0.42 m, sail 0.40 square metres, ballast 0.50 kg, main battery 1300 Wh and recovery battery 60 Wh.", "caption": "Values are transcribed from the named design and integration records. They are candidate inputs, not measurements or accepted equipment specifications.", "provenance": {"source": "models/configurations/ic01.sysml; BlueDogIC01::design and integration", "context": "Source b94b6e0; exact geometry retains the October 15 candidate. Display values are rounded."}, "modelRefs": ["BlueDogIC01::design", "BlueDogIC01::integration"]}]}
```

[IC-01](model:BlueDogIC01::design) is the proposed boat used in the current calculations. Its inputs include a hull about 1.20 m long and 0.42 m wide, a 0.40 m² sail, 0.50 kg of ballast and 1,300 Wh of main-battery capacity. [Equipment assumptions](model:BlueDogIC01::integration) add mass, electrical demand and a separate 60 Wh recovery battery.

The calculations must use these dimensions and loads together. Building the boat requires selected equipment and manufacturing dimensions. The complete boat, including appendages, rig and equipment, must be measured against the 1.2 m overall-length rule. Physical qualification remains open.

```syspresent
{"type": "scene", "id": "coupled-sizing", "title": "A larger battery changes more than endurance", "view": "BlueDogCanvasViews::story_coupled_sizing", "focus": "BlueDogIC01::design", "chapter": {"id": "candidate", "title": "IC-01 geometry and coupled sizing"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Check installation space and weather delays", "text": "The sizing study assumes equipment volume and delay allowances that need confirmation for the actual boat and route.", "modelRefs": ["BlueDogConceptCredibility::passagePolicy"]}]}
```

Battery, sail, ballast and hull dimensions affect each other. A larger battery adds both energy and weight. Weight changes displacement and balance. A larger sail can add drive, heeling and structural load. Keel, rudder and reinforcement dimensions must work with that same boat.

[IC-01 analysis inputs](model:BlueDogIntegratedCandidate::Inputs) keep geometry, mass, electrical demand and recovery assumptions together. The [sizing assumptions](model:BlueDogConceptCredibility::passagePolicy) include installation space and weather delays. Calculated results help choose dimensions and experiments; measurements are needed to establish actual performance.

```syspresent
{"type": "scene", "id": "glass-and-print", "title": "Printed segments and glass skins must share a credible load path", "view": "BlueDogCanvasViews::story_glass_and_print", "focus": "BlueDogStructure::hybridConstruction", "chapter": {"id": "structure", "title": "Structure, manufacture and wet service"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The proposed structure uses printed substrate reinforced with glass and epoxy. Desktop-sized segments need joints that carry hull, sail and appendage loads after wet exposure.

The [structural calculation](model:BlueDogDesignDecisions::structuralScope) assigns bending strength to the glass; printed walls, ribs, seams and finish add weight. The [assumed glass properties](model:BlueDogRequirementBasis::materials) are 10 GPa stiffness and 50 MPa strength. Tests of wet production samples, glass-to-print bonds and actual joints must establish the properties available to the design.

```syspresent
{"type": "scene", "id": "water-weeds-service", "title": "Sealing, vegetation and service access shape the details", "view": "BlueDogCanvasViews::story_water_weeds_service", "focus": "BlueDogRequirements::enclosureSealing", "chapter": {"id": "structure", "title": "Structure, manufacture and wet service"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Measure materials and service conditions", "text": "Structural dimensions need measured material properties, acceptable deflection and the pressure and wet exposure expected at the site.", "modelRefs": ["BlueDogRequirementBasis::structuralScreens", "BlueDogRequirementBasis::manufactureAndSites"]}]}
```

[Sealing tests](model:BlueDogRequirements::enclosureSealing) must cover enclosures, connectors and cable entries. External mechanisms must keep moving after wet exposure, and service access must allow seals to be restored.

Submerged vegetation can slow the boat or jam steering. The [passage tests](model:BlueDogRequirements::submergedWeedPassage) and [blockage response](model:BlueDogRequirements::weedBlockageResponse) check shedding, restored performance, fault detection and recovery behavior. The recovery propulsor needs its own vegetation and locked-rotor tests. These results affect appendage shape, bearings, cables and maintenance access.

```syspresent
{"type": "scene", "id": "finite-energy", "title": "The main pack must last through sailing and delay", "view": "BlueDogCanvasViews::story_finite_energy", "focus": "BlueDogRequirements::multiDayEndurance", "chapter": {"id": "energy", "title": "Passage energy and protected recovery"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Measure usable energy and installed demand", "text": "IC-01 assumes 1,300 Wh main capacity and 60 Wh recovery capacity. Measure usable energy, loads and behavior after power faults.", "modelRefs": ["BlueDogIC01::design", "BlueDogIC01::integration", "BlueDogPhysicalArchitecture::IC01Candidate"]}]}
```

The boat must finish the circuit without servicing or external charging while keeping its recovery reserve available. Sailing and waiting both consume energy for sensing, control, signaling, recording and communications.

The [battery assumptions](model:BlueDogIC01::integration) must be checked against temperature, condition, conversion losses and starting charge. The [usable-energy estimate](model:BlueDogRequirements::conservativeEnergyEstimate) subtracts an error allowance before launch and recovery decisions. Optional payloads may be switched off to save power; required safety functions must remain available.

```syspresent
{"type": "scene", "id": "repeat-energy", "title": "A repeatable mission needs a full chronological energy balance", "view": "BlueDogCanvasViews::story_repeat_energy", "focus": "BlueDogRequirements::sustainedEnergyFeasibility", "chapter": {"id": "energy", "title": "Passage energy and protected recovery"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

For repeated operation, the [energy model](model:BlueDogEnergy::Scenario) tracks battery energy through each load and harvesting interval. It must stay above the recovery reserve throughout a cycle and finish with at least its starting energy at the same point in the cycle. Peak electrical demand also needs checking when harvesting is unavailable.

[The evidence plan](model:BlueDogDesignDecisions::energyEvidenceAcceptance) requires measured installed loads, battery derating and resource bounds at sufficient time resolution. Repeating the mission through real weather remains a later objective.

```syspresent
{"type": "scene", "id": "primary-hardware", "title": "Sailing responsibilities become proposed equipment", "view": "BlueDogCanvasViews::story_primary_hardware", "focus": "BlueDogPhysicalArchitecture::IC01Candidate", "chapter": {"id": "physical", "title": "The proposed onboard assembly"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "candidate", "title": "Equipment must fit the same configuration", "text": "The numerical mass and energy allowances need reconciliation with selected equipment, actual packaging, cables, enclosures and center of gravity.", "modelRefs": ["BlueDogIC01::integration", "BlueDogPhysicalArchitecture::IC01Candidate"]}]}
```

The [IC-01 equipment proposal](model:BlueDogPhysicalArchitecture::ic01) combines a main battery, navigation and wind sensors, traffic-observation equipment, a primary controller and sail and rudder actuators. The hull and rig carry the equipment and turn wind into motion.

The [equipment assignments](model:BlueDogArchitectureCorrespondence) identify which part performs each onboard job and which observations, permissions, commands and power supplies it needs. Products, processor choices, wiring, connectors, voltages and data rates remain to be selected.

```syspresent
{"type": "scene", "id": "recovery-hardware", "title": "Separate recovery paths need demonstrated independence", "view": "BlueDogCanvasViews::story_recovery_hardware", "focus": "BlueDogPhysicalArchitecture::IC01Candidate", "chapter": {"id": "physical", "title": "The proposed onboard assembly"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Independent recovery is still a hypothesis", "text": "Power separation must preserve observation, decision, actuation and essential records through the declared faults. Common-cause isolation requires physical evidence.", "modelRefs": ["BlueDogPhysicalArchitecture::IC01Candidate", "BlueDogIC01::integration"]}]}
```

The recovery proposal uses a separate battery, navigation sensors, traffic-observation equipment, controller and propulsor. Its purpose is to bring the boat to shore after a primary failure, including the declared capsize cases.

Tests must check shared flooding, wiring and software faults, sensing and thrust while inverted, detection of a failed primary controller and control of the propulsor. The [power supplies for telemetry and record storage](model:BlueDogPhysicalArchitecture::IC01Candidate) are still undecided. The assumed 8 W essential load and 60 Wh recovery battery need installed measurements.

```syspresent
{"type": "scene", "id": "supervisor-decision", "title": "Choosing sailing, avoidance or recovery", "view": "BlueDogCanvasViews::supervisorDecision", "focus": "BlueDogMissionLogic::SupervisoryCycle", "panel": {"placement": "bottom"}, "presentation": {"compartments": "compact", "emphasis": ["succession"]}, "chapter": {"id": "control", "title": "Supervisory decisions and persistence"}, "allowDisconnected": true}
```

The [supervisor](model:BlueDogMissionLogic::SupervisoryCycle) chooses sailing, collision avoidance, degraded drift or abort and recovery. It uses observations of the route, traffic, boundaries, energy and remaining safety functions.

The executable model tests those choices with supplied observations. Building the controller also requires sensors that supply valid observations and actuators that achieve the commanded motion. Tests must check both the decisions and the equipment they depend on.

```syspresent
{"type": "scene", "id": "reset-and-records", "title": "A reset must preserve aborts, restrictions and gate progress", "view": "BlueDogCanvasViews::story_reset_and_records", "focus": "BlueDogRequirements::resetRecovery", "chapter": {"id": "control", "title": "Supervisory decisions and persistence"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

After a reset, the controller must retain disqualification, abort, energy restrictions and gate progress. Motor permission follows the onboard safety rules or a fresh authenticated command. Restarting must preserve every restriction that still applies.

During a [communications outage](model:BlueDogMethod::Scenarios::CommunicationsOutage), the boat stores its records. On reconnection, it sends current observations before replaying older ones. Timestamps, identity and sequence numbers let the operator reconstruct what happened and distinguish delayed records from new events.

```syspresent
{"type": "scene", "id": "evidence-scope", "title": "What IC-01 has been checked against", "view": "BlueDogCanvasViews::story_evidence_scope", "focus": "BlueDogIC01::design", "chapter": {"id": "evidence", "title": "Analysis evidence and unresolved risk"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "evidence", "title": "Tests still needed for IC-01", "text": "IC-01 has recorded geometry and analysis assumptions. Its equipment and full river performance still need physical qualification.", "modelRefs": ["BlueDogIC01::design", "BlueDogRisks::mission"]}]}
```

[IC-01](model:BlueDogIC01::design) holds the proposed boat's dimensions and equipment assumptions. Each recorded analysis identifies the configuration and inputs it used. The [integration study](model:BlueDogIntegratedCandidate::VirtualClosure) checks sizing, sailing, encounters, recovery, energy and timing together on a bounded synthetic river reach. Full-course and physical testing remain open.

[Decision records](model:EngineeringDecisions::DecisionRecord) retain choices, reasons and unresolved questions. Requirement and procedure reviews identify the measurements needed to settle numerical limits. Older results, including [the October 12 candidate](model:BlueDogCurrentSizing::candidate), retain the design they originally evaluated.

```syspresent
{"type": "scene", "id": "failure-risk", "title": "Traffic and recovery are the immediate safety questions", "view": "BlueDogCanvasViews::story_failure_risk", "focus": "BlueDogRisks::traffic", "chapter": {"id": "evidence", "title": "Analysis evidence and unresolved risk"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The [risk review](model:BlueDogRisks::traffic) prioritizes traffic detection and recovery because either may force a different design or narrower operating conditions. Material properties, sail loads and electrical demand also need measurements before committing to the proposed boat.

The [failure review](model:BlueDogDFMEA::starter::powerCommonCause) covers shared power loss, steering jams and missed traffic. Tests must check whether a single fault can disable both sailing and recovery. Each open risk needs a reviewed response and evidence for the relevant conditions.

```syspresent
{"type": "scene", "id": "verification-status", "title": "Verification links identify the checks still to establish", "view": "BlueDogCanvasViews::story_verification_status", "focus": "BlueDogRequirements::cruiseEvidence", "chapter": {"id": "evidence", "title": "Analysis evidence and unresolved risk"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "evidence", "title": "A concrete verification example", "text": "The native traffic-safety case remains a planned configuration-specific procedure. No physical encounter acceptance is asserted by this story.", "modelRefs": ["BlueDogRequirementVerification::TrafficSafetyVerification"]}]}
```

The [traffic test plan](model:BlueDogRequirementVerification::TrafficSafetyVerification) identifies the boat configuration, encounter conditions, observations and acceptance checks. Its physical results remain open. The same applies to the other planned component and boat tests.

The [0.90 reliability target at 95-percent confidence](model:BlueDogRequirements::missionSuccessProbability) is a provisional study objective. Finite Gorge qualification has its own requirements. Before deployment, [critical failure modes](model:BlueDogRequirements::criticalFailureDisposition) need reviewed dispositions and evidence for the installed boat.

```syspresent
{"type": "scene", "id": "qualification-campaign", "title": "Measure components, integrate the boat, then qualify the course", "view": "BlueDogCanvasViews::story_qualification_campaign", "focus": "BlueDogRequirementVerification::StructuralMaterialEvidence", "chapter": {"id": "campaign", "title": "The path to a Gorge attempt"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "analysis", "title": "Priority follows the uncertainty that can change the design", "text": "Investigate traffic and recovery feasibility first, while bounding material, aerodynamic and installed-energy assumptions. Re-run affected analyses when measured inputs change.", "modelRefs": ["BlueDogRisks::traffic", "BlueDogRisks::recovery", "BlueDogRisks::structure", "BlueDogRisks::energy"]}]}
```

Test the assumptions most likely to change the design. Measure traffic detection and maneuver response, recovery thrust and behavior after faults. Measure wet material and joint properties, sail forces, trim torque, drive demand and installed electrical loads. Feed those results back into the boat dimensions and equipment choices.

Then test the assembled boat: sealing, usable energy, shared faults, capsize, control restoration and recovery at suitable sites. [A qualifying passage](model:GorgeChallengeVerification::PassageQualificationVerification) requires a reviewed course and forecast, accepted safety evidence for that boat, and a recorded unassisted circuit.

```syspresent
{"type": "scene", "id": "blue-dog-next", "title": "What now defines Blue Dog—and what remains to decide", "view": "BlueDogCanvasViews::story_blue_dog_next", "focus": "GorgeChallenge::transGorgeChallenge", "chapter": {"id": "campaign", "title": "The path to a Gorge attempt"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The next choices are the sail arrangement, sensing equipment, primary and recovery controls, power supplies and construction details. Those choices need comparable tests and a consistent set of boat dimensions, mass and electrical demand.

The first objective remains one safe, unassisted Gorge circuit. Repeated circuits and a [voyage toward Hawaii](model:BlueDog::Goals::hawaiiVoyage) follow later, with their own route, exposure and endurance tests.
