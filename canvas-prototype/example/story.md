# Blue Dog: from the Gorge challenge to a defined boat

```syspresent
{"type": "scene", "id": "gorge-challenge", "title": "The Bingen–Stevenson–Bingen challenge", "view": "BlueDogCanvasViews::challengeOverview", "focus": "GorgeChallenge::transGorgeChallenge", "chapter": {"id": "gorge", "title": "The Gorge challenge"}, "presentation": {"compartments": "compact"}, "figures": [{"id": "course-map", "title": "The course", "asset": "assets/gorge-course.svg", "alt": "A schematic outbound leg from Bingen to a rounding near Stevenson, followed by the return to Bingen.", "caption": "The scored circuit starts and finishes at Bingen. The drawing shows the gate sequence; the model defines the geographic course.", "provenance": {"source": "TransGorgeCourse; models/missions/course.sysml", "context": "Blue Dog source b94b6e0; schematic, not a navigation chart"}, "modelRefs": ["TransGorgeCourse::policy", "GorgeChallenge::courseCompletion"]}], "context": [{"kind": "challenge-requirement", "title": "One qualifying circuit", "text": "Complete the configured gates in order, unassisted and using sailing propulsion. The challenge has no elapsed-time deadline.", "modelRefs": ["GorgeChallenge::courseCompletion", "GorgeChallenge::unassistedAttempt", "GorgeChallenge::sailingPropulsion"]}], "allowDisconnected": true}
```

Blue Dog is a small autonomous sailboat project: a boat intended to navigate, trim its sail, respond to traffic and protect its recovery energy without a person aboard. Its first mission is the [Gorge challenge](model:GorgeChallenge::transGorgeChallenge), one Bingen–Stevenson–Bingen circuit on the Columbia River.

The [course definition](model:TransGorgeCourse::policy) specifies directed departure, rounding and finish gates. Passing them in order provides an observable definition of completion. There is no elapsed-time deadline, and the complete operating boat must meet the [1.2 m overall-length limit](model:GorgeChallenge::overallLength).

This story follows how those obligations lead to a boat: requirements, operating scenarios, onboard responsibilities, competing sail concepts, the IC-01 candidate and the evidence still needed before launch. The diagrams and linked terms refer to the bundled SysML model; a requirement states an obligation, while a candidate describes a proposed solution.

```syspresent
{"type": "scene", "id": "qualifying-attempt", "title": "What keeps a circuit qualifying", "view": "BlueDogCanvasViews::story_qualifying_attempt", "focus": "GorgeChallenge::unassistedAttempt", "chapter": {"id": "gorge", "title": "The Gorge challenge"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "challenge-requirement", "title": "Recovery remains mandatory after abort", "text": "A safety abort initiates autonomous recovery toward a suitable shore retrieval location without waiting for communications. An alert is sent or queued.", "modelRefs": ["GorgeChallenge::autonomousShoreRecovery", "GorgeChallenge::abortAlert"]}]}
```

A qualifying circuit uses [sailing propulsion](model:GorgeChallenge::sailingPropulsion) and receives no operator-supplied control or mission update. Passive monitoring and autonomous weather-service access are permitted. An installed recovery motor is allowed, but using it ends qualification.

The boat must remain afloat and unattached: anchoring, grounding or entering designated refuge ends the scored passage. Safe waiting under sail is allowed. After intervention, the next attempt needs a new departure-gate crossing; partial progress does not transfer.

Safety has priority. [Loss of a required safety capability](model:GorgeChallenge::safetyCapabilityAbort) terminates qualification unless a demonstrated backup preserves that function. A communications outage alone does not. These rules create a need to track qualification separately from whether the boat can still move.

```syspresent
{"type": "scene", "id": "gorge-environment", "title": "Wind, waves and current define different operating questions", "view": "BlueDogCanvasViews::story_gorge_environment", "focus": "BlueDogRequirements::gorgeEnvironment", "chapter": {"id": "gorge", "title": "The Gorge challenge"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "A proposed qualification envelope", "text": "The environmental profiles and their numerical limits require evidence for the selected boat. Tolerating current does not establish station keeping or positive speed toward every gate.", "modelRefs": ["BlueDogRequirements::gorgeCurrent", "BlueDogRequirements::environmentalEnvelope"]}]}
```

The river brings opposing wind and current, short chop, traffic and submerged vegetation. Blue Dog's proposed [Gorge operating profile](model:BlueDogRequirements::gorgeEnvironment) calls for functions to remain available in mean wind from 0 to 15 m/s with 20 m/s three-second gusts, significant waves up to 1.5 m, and current up to 1.5 m/s.

These are qualification targets, not demonstrated capabilities or a claim that the boat makes upstream progress in every combination. [Whole-route progress](model:BlueDogRequirements::legProgress) depends on the weather history, tacking, current, delays and available energy. Launch therefore requires an assessed [forecast window](model:GorgeChallenge::forecastAdmission) covering passage and recovery.

Survival has a different purpose: retain safety and recoverability when full sailing operation is unavailable. Its exposure duration follows the recovery case. The separate [ocean profile](model:BlueDogRequirements::oceanEnvironment) belongs to a future mission toward Hawaii.

```syspresent
{"type": "scene", "id": "owner-constraints", "title": "A boat one person can build, transport and service", "view": "BlueDogCanvasViews::story_owner_constraints", "focus": "BlueDogRequirements::desktopManufacture", "chapter": {"id": "requirements", "title": "Requirements and owner constraints"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "owner-constraint", "title": "Construction and lifecycle choices", "text": "A printed shell does not require a printed sail. The soft-sail alternative remains compatible with the hull construction constraint.", "modelRefs": ["BlueDogStructure::hybridConstruction", "BlueDogSailTrade::softSail"]}]}
```

Some requirements come directly from the owner. Each print job must fit a [250 mm cube](model:BlueDogRequirements::desktopManufacture), including its orientation, supports and printer clearance. The primary shell uses [printed substrate with glass/epoxy reinforcement](model:BlueDogStructure::hybridConstruction); PETG is an initial candidate material.

[One-person handling](model:BlueDogRequirements::transportability) and equipment replacement with hand tools constrain assembly, access and packaging. Handling acceptance uses a specified firm bank or ramp and mild conditions; it does not promise that one person can retrieve the boat anywhere in survival weather.

These choices make joints, removable assemblies, seals and access space part of the design problem. They are owner constraints in the model, rather than conclusions that follow automatically from completing the Gorge circuit.

```syspresent
{"type": "scene", "id": "system-obligations", "title": "Passage needs navigation, energy, safety and a record", "view": "BlueDogCanvasViews::story_system_obligations", "focus": "BlueDogRequirements::roundTrip", "chapter": {"id": "requirements", "title": "Requirements and owner constraints"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Requirements do not select every number", "text": "The model explicitly separates owner constraints, provisional allocations, selected strategies and assurance obligations. Evidence must support each in its own context.", "modelRefs": ["BlueDogRequirementBasis::retainedAllocations", "BlueDogRequirementBasis::recoveryStrategy"]}]}
```

The challenge becomes a set of onboard obligations: navigate the course, control sail and steering, assess traffic, respect boundaries, preserve energy, endure wet exposure and retain a trustworthy [mission record](model:BlueDogRequirements::missionEvidence). Finishing the route is only one part of acceptance.

The model distinguishes an obligation from its implementation and its evidence. A derivation identifies an upstream requirement; a dependency can record supporting rationale; an allocation assigns a responsibility to a proposed component. A satisfaction assertion is a design claim. A verification case specifies how that claim will be checked.

Numerical timing and accuracy targets are [retained performance allocations](model:BlueDogRequirementBasis::retainedAllocations). Their values still need justification against control and encounter conditions. This prevents a convenient study assumption from quietly becoming proof that the boat meets the mission.

```syspresent
{"type": "scene", "id": "normal-sailing", "title": "A sailing cycle observes wind, selects trim and applies control", "view": "BlueDogCanvasViews::story_normal_sailing", "focus": "BlueDogMethod::Scenarios::NormalSailing", "chapter": {"id": "operations", "title": "Operating scenarios"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Wind sensing has a freshness contract", "text": "The baseline calls for observations at least once a second, marks them invalid after two seconds, and excludes invalid observations from trim calculations.", "modelRefs": ["BlueDogRequirements::windSampleCadence", "BlueDogRequirements::windStaleInvalidation", "BlueDogRequirements::invalidWindUseInhibition"]}]}
```

Before choosing electronics, the model describes what the boat must do. In [normal sailing](model:BlueDogMethod::Scenarios::NormalSailing), an observation supplies apparent wind—the wind relative to the moving boat. Guidance selects a sail command, and actuation applies it only with current permission from the supervisor.

The arrows represent modeled sequence and information exchange. They are a description of a decision cycle, not a recording of a controller running. Valid navigation and safety capabilities are preconditions; invalid observations transfer responsibility to degraded-operation logic.

The companion [navigation scenario](model:BlueDogMethod::Scenarios::NavigationUpdate) observes, validates, guides and actuates. Timestamp and validity matter as much as the measured value: an old heading or wind estimate must not silently authorize a new maneuver.

```syspresent
{"type": "scene", "id": "prepare-launch", "title": "Launch permission depends on the installed boat and the site", "view": "BlueDogCanvasViews::story_prepare_launch", "focus": "BlueDogMethod::Scenarios::PrepareAndLaunch", "chapter": {"id": "operations", "title": "Operating scenarios"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

[Preparation and launch](model:BlueDogMethod::Scenarios::PrepareAndLaunch) begin with an inspected configuration and accepted site, weather and safety evidence. Admission produces permission; launching initializes the attempt. This makes launch a deliberate decision with prerequisites.

The [energy admission rule](model:BlueDogRequirements::launchEnergyAdmission) requires a fresh valid estimate of usable energy strictly above a valid protected reserve. The forecast must support the complete route with waiting and recovery margins. A battery percentage or favorable wind at the launch point is insufficient by itself.

After service, [maintenance release](model:BlueDogMethod::Scenarios::MaintainAndRelease) checks the changed equipment and seals and records the configuration. This ties future evidence to the actual boat being launched.

```syspresent
{"type": "scene", "id": "logical-sailing", "title": "Separate sensing, guidance, permission and actuation", "view": "BlueDogCanvasViews::story_logical_sailing", "focus": "BlueDogLogicalArchitecture::LogicalVessel", "chapter": {"id": "logical", "title": "Logical responsibilities"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The [logical vessel](model:BlueDogLogicalArchitecture::vessel) divides the job into responsibilities before assigning processors or products. Navigation estimates position and attitude. Wind estimation supplies the sailing input. Guidance proposes commands. Supervision decides which operations are permitted. Actuation receives both commands and permission.

That separation matters when a useful command is unsafe to execute. An old trim request must not bypass a new inhibit. The model's typed [operation permission](model:BlueDogLogicalArchitecture::OperationPermission) and [sailing command](model:BlueDogMethod::SailingCommand) make these different messages explicit.

The part tree shows responsibility membership. The full logical definition also contains native ports and flows for the information exchanges; membership alone does not mean that one responsibility controls another.

```syspresent
{"type": "scene", "id": "logical-safety", "title": "Safety and recovery continue without the shore link", "view": "BlueDogCanvasViews::story_logical_safety", "focus": "BlueDogLogicalArchitecture::LogicalVessel", "chapter": {"id": "logical", "title": "Logical responsibilities"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

Supervision combines navigation, wind, safety, reserve, traffic, boundaries and link status. [Recovery management](model:BlueDogLogicalArchitecture::RecoveryManagement) needs current safety and energy assessments plus permission. Recording retains the events that explain what happened.

[Communications](model:BlueDogLogicalArchitecture::Communications) carries records and reports link state. It is not the authority that makes onboard safety possible. If contact disappears, the boat still needs to assess hazards, preserve its reserve and initiate recovery when required.

This division creates a concrete architecture question: which of these responsibilities can survive a primary controller, sensor or power fault? The later physical candidate proposes separate recovery paths; the logical model identifies what those paths must preserve.

```syspresent
{"type": "scene", "id": "gorge-traffic", "title": "Collision avoidance on the Gorge course", "view": "BlueDogCanvasViews::challengeTraffic", "focus": "BlueDogRequirements::trafficSafety", "panel": {"placement": "right"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "traffic", "title": "Traffic detection and avoidance"}, "allowDisconnected": true}
```

Blue Dog shares the river with commercial and recreational traffic, including vessels and people without cooperative radio identification. The [challenge traffic obligation](model:GorgeChallenge::trafficCoexistence) leads to Blue Dog's [traffic-safety requirement](model:BlueDogRequirements::trafficSafety): detect and respond within reviewed class-specific envelopes.

Different targets create different visibility and motion problems. A single sensor-range number cannot establish useful detection of every class in daylight, darkness, spray or glare. The current [class-specific detection policy](model:BlueDogClassDetection::policy) keeps those allocations separate from the historical sensing hypothesis used in IC-01 replay.

The [traffic-courtesy decision](model:BlueDogDesignDecisions::trafficCourtesy) prefers routes and windows that reduce developing encounters, while retaining the modeled navigation duties. That preference is still a design direction; it is not an implemented planner objective.

```syspresent
{"type": "scene", "id": "traffic-derivation", "title": "Tracking, risk updates and command timing", "view": "BlueDogCanvasViews::trafficDerivation", "focus": "BlueDogRequirements::trafficSafety", "panel": {"placement": "bottom"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "traffic", "title": "Traffic detection and avoidance"}, "allowDisconnected": true, "context": [{"kind": "allocation", "title": "Historical range is not an accepted detection envelope", "text": "The IC-01 replay retains a historical sensing hypothesis. Current class-specific allocations and physical encounter performance remain unaccepted.", "modelRefs": ["BlueDogIC01::integration", "BlueDogClassDetection::policy"]}]}
```

Traffic safety separates into [tracking](model:BlueDogRequirements::trafficTracking), one-second risk updates, a two-second command deadline and fault reporting. These links expose smaller obligations that can be tested individually.

The [encounter scenario](model:BlueDogMethod::Scenarios::TrafficEncounter) observes traffic and navigation, assesses the encounter, selects a maneuver and reassesses its effect. Detection distance must cover sensing delay, assessment, command latency and the boat's actual maneuver response.

A command sent on time does not prove adequate clearance. The [traffic verification case](model:BlueDogRequirementVerification::TrafficSafetyVerification) still needs configuration-specific sensing and maneuver evidence. The design therefore couples sensor choice with hull, rudder, sail authority and operating restrictions.

```syspresent
{"type": "scene", "id": "powered-recovery", "title": "Powered recovery needs protected energy", "view": "BlueDogCanvasViews::recoveryBasis", "focus": "BlueDogRequirements::safeRecovery", "panel": {"placement": "right"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "recovery", "title": "Recovery, capsize and qualification"}, "allowDisconnected": true}
```

An aborted attempt still has a destination: a suitable shore-accessible retrieval location. [Powered recovery](model:BlueDogRequirements::recoveryPropulsion) must be evaluated at mission load, with remaining capabilities and adverse current. A place that is geometrically nearby may not be reachable or suitable for retrieval.

The [protected reserve](model:BlueDogRequirements::recoveryEnergy) follows the recovery route. It includes propulsion, essential onboard loads, exposure and uncertainty. A fixed number of motor minutes cannot substitute for that route assessment.

The IC-01 [recovery screen](model:BlueDogIntegratedCandidate::RecoveryScreen) checks conditional speed and battery-side energy arithmetic for the named configuration. A completed calculation can report an infeasible route. Even a positive result does not demonstrate shore capture, thrust or survival after a casualty.

```syspresent
{"type": "scene", "id": "capsize-qualification", "title": "Capsize need not end the attempt", "view": "BlueDogCanvasViews::capsizeQualification", "focus": "BlueDogRequirements::capsizeQualificationRetention", "panel": {"placement": "right"}, "presentation": {"compartments": "compact", "emphasis": ["derive"]}, "chapter": {"id": "recovery", "title": "Recovery, capsize and qualification"}, "allowDisconnected": true, "context": [{"kind": "decision", "title": "Static restoring moment is a screen", "text": "Sampled roll-restoring curves do not establish dynamic self-righting. Pitch instability, flooding, drainage and control restoration require separate evidence.", "modelRefs": ["BlueDogDesignDecisions::recoveryScope"]}]}
```

Capsize raises two separate questions: can the boat remain safe and recoverable, and can the same attempt still qualify? The challenge requires [casualty flotation](model:GorgeChallenge::casualtyFlotation), [major-component retention](model:GorgeChallenge::majorComponentRetention) and autonomous shore recovery without communications. It permits recovery while inverted.

Blue Dog additionally pursues [passive self-righting](model:BlueDogRequirements::selfRighting) as a selected vehicle strategy. This affects ballast, rig mass, sealed volumes, retained water and failed actuator positions. It is not a universal challenge mandate.

Capsize alone does not disqualify an attempt. Required safety must remain available; unassisted righting and restored control can preserve qualification. Motor use, outside intervention or a previously latched abort still ends it.

```syspresent
{"type": "scene", "id": "capsize-decision", "title": "Deciding whether to resume after righting", "view": "BlueDogCanvasViews::capsizeDecision", "focus": "BlueDogMissionLogic::CapsizeDisposition", "panel": {"placement": "bottom"}, "journey": ["BlueDogRequirements::capsizeQualificationRetention", "BlueDogMissionLogic::CapsizeDisposition"], "presentation": {"compartments": "compact", "emphasis": ["succession"]}, "chapter": {"id": "recovery", "title": "Recovery, capsize and qualification"}, "allowDisconnected": true}
```

The [capsize disposition](model:BlueDogMissionLogic::CapsizeDisposition) makes the resumption decision explicit. Missing safety confirmation or a latched abort prevents a return to qualifying sailing. Restored upright attitude must not erase qualification loss, energy restrictions or motor inhibition.

Its inputs describe observed conditions. Executing this decision can test policy for those inputs, but cannot predict whether the hull will right itself or whether its sensors work upside down.

This links the mechanical and control designs: a successful physical righting maneuver is useful only if the boat also knows its state, retains its record and restores permitted control.

```syspresent
{"type": "scene", "id": "rig-trade", "title": "Choosing how Blue Dog carries and trims its sail", "view": "BlueDogCanvasViews::rigAlternatives", "focus": "BlueDogDesignDecisions::sizingBaseline", "chapter": {"id": "rig", "title": "The sail and actuator trades"}, "presentation": {"compartments": "compact"}, "figures": [{"id": "rig-concepts", "title": "Rig concepts", "asset": "assets/rig-alternatives.svg", "alt": "Three conceptual rigs: a soft sail, a rigid wing with an aerodynamic tail, and a wing rotated directly by an actuator.", "caption": "These retained concepts have different control, energy and recovery questions. Their sketches do not define manufactured geometry.", "provenance": {"source": "BlueDogSailTrade; models/analyses/sail-trade.sysml", "context": "Blue Dog source b94b6e0; equal development contenders"}, "modelRefs": ["BlueDogSailTrade::softSail", "BlueDogSailTrade::tailWing", "BlueDogSailTrade::camberedWing"]}], "context": [{"kind": "decision", "title": "A baseline for calculation", "text": "The directly rotated fixed-camber wing supplies the first numerical sizing baseline. Soft sail and tail-controlled wing remain equal development contenders; comparable performance, energy and recovery evidence is still needed.", "modelRefs": ["BlueDogDesignDecisions::sizingBaseline"]}], "allowDisconnected": true}
```

The mission needs useful progress, manageable power demand and recoverable behavior. The [sail trade](model:BlueDogSailTrade::TradeAssessment) retains a triangular soft sail, a tail-controlled rigid wing and a directly rotated fixed-camber wing as equal development contenders.

Soft sail brings cloth, sheet and chafe questions. Tail control offers aerodynamic trim but adds a boom, tail, tab and their failure states. Direct mast rotation avoids those parts but puts trim torque, movement energy and failed-angle behavior onto the drive. None has established superiority across the declared evidence gates.

The [numerical baseline decision](model:BlueDogDesignDecisions::sizingBaseline) uses the fixed-camber wing because existing CAD provides a starting section. This enables coupled calculations; it is not a final downselect. Control architecture and camber are independent choices—a cambered wing could also use tail control.

```syspresent
{"type": "scene", "id": "drive-and-aerodynamics", "title": "Holding the sail angle changes power and failure behavior", "view": "BlueDogCanvasViews::story_drive_and_aerodynamics", "focus": "BlueDogDesignDecisions::holdingDrive", "chapter": {"id": "rig", "title": "The sail and actuator trades"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "decision", "title": "Evidence that can decide the rig", "text": "Compare both-tack progress, installed mass and center of gravity, daily drive energy, wet-cycle durability and dynamic recovery using the same mission conditions.", "modelRefs": ["BlueDogDesignDecisions::sizingBaseline"]}]}
```

A [non-backdrivable drive](model:BlueDogDesignDecisions::holdingDrive) might hold mast angle without motor current. That can save energy, but controller standby and trim movement still consume power. Gear friction, shock, wear and temperature must be measured.

The same holding property creates a recovery question: after power loss, the wing may stay at its last angle rather than feather into the wind. Jammed and locked-angle cases belong in storm, capsize and depower assessment.

The [aerodynamic policy](model:BlueDogDesignDecisions::aerodynamicScope) uses restricted attached-flow numerical evidence. A polar describes force or performance versus wind angle and operating condition. Blue Dog still needs measured both-tack forces, drag and trim moments, including stall and broadside behavior, before those calculations can support a rig selection.

```syspresent
{"type": "scene", "id": "ic01-definition", "title": "The IC-01 candidate joins geometry and onboard capabilities", "view": "BlueDogCanvasViews::candidateDefinition", "focus": "BlueDogIC01::design", "chapter": {"id": "candidate", "title": "IC-01 geometry and coupled sizing"}, "presentation": {"compartments": "compact"}, "context": [{"kind": "candidate", "title": "Named inputs for a consistent boat", "text": "IC-01 owns the geometry and integration assumptions used by its analyses. It is a provisional finite-Gorge candidate; installed equipment and physical qualification remain open.", "modelRefs": ["BlueDogIC01::design", "BlueDogIC01::integration"]}, {"kind": "assumption", "title": "Recovery independence needs evidence", "text": "Separate proposed power, observation, navigation, control and thrust paths make the intended recovery architecture inspectable. Separate model parts do not establish fault isolation in hardware.", "modelRefs": ["BlueDogPhysicalArchitecture::IC01Candidate"]}], "allowDisconnected": true, "figures": [{"id": "ic01-inputs", "title": "IC-01 inputs", "asset": "assets/ic01-inputs.svg", "alt": "Rounded IC-01 inputs: hull length 1.20 m, beam 0.42 m, sail 0.40 square metres, ballast 0.50 kg, main battery 1300 Wh and recovery battery 60 Wh.", "caption": "Values are transcribed from the named design and integration records. They are candidate inputs, not measurements or accepted equipment specifications.", "provenance": {"source": "models/configurations/ic01.sysml; BlueDogIC01::design and integration", "context": "Source b94b6e0; exact geometry retains the October 15 candidate. Display values are rounded."}, "modelRefs": ["BlueDogIC01::design", "BlueDogIC01::integration"]}]}
```

[IC-01](model:BlueDogIC01::design) is the named provisional integration candidate. Its model owns a roughly 1.20 m hull length, 0.42 m beam, 0.40 m² sail area, 0.50 kg ballast and 1,300 Wh main-battery input. Exact stored values reproduce the archived candidate; they are not manufacturing tolerances or measurements.

[Integration inputs](model:BlueDogIC01::integration) add equipment mass and demand, a proposed 60 Wh recovery battery and assumed recovery capabilities. Keeping those values together prevents an analysis from borrowing the hull of one candidate and the energy allowance of another.

Hull length alone does not demonstrate the 1.2 m overall-length rule: the complete operating envelope, including appendages and rig, still needs checking. The named candidate has physical qualification explicitly set to false.

```syspresent
{"type": "scene", "id": "coupled-sizing", "title": "A larger battery changes more than endurance", "view": "BlueDogCanvasViews::story_coupled_sizing", "focus": "BlueDogIC01::design", "chapter": {"id": "candidate", "title": "IC-01 geometry and coupled sizing"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Allowances belong to a declared study", "text": "The passage screen uses a duration multiplier, delay allowance and installation-volume assumptions. These are changeable engineering probes, not measured equipment or probabilities.", "modelRefs": ["BlueDogConceptCredibility::passagePolicy"]}]}
```

The boat cannot be sized one subsystem at a time. More battery increases available energy and mass; mass changes displacement and center of gravity. More sail can increase drive but also heeling, structure and actuator loads. Keel, rudder, ballast, reinforcement and their positions must be considered together.

[IC-01 analysis inputs](model:BlueDogIntegratedCandidate::Inputs) bind the named design to the coupled sizing calculations. Geometry, mass properties, sailing balance, structural screens, drive demand and passage energy constrain the same proposed boat.

The [credibility policy](model:BlueDogConceptCredibility::passagePolicy) carries provisional packaging and delay allowances. The search is local and uses limited physics domains. A feasible numerical point is useful for choosing experiments; it is not proof of a global optimum or a qualified design.

```syspresent
{"type": "scene", "id": "glass-and-print", "title": "Printed segments and glass skins must share a credible load path", "view": "BlueDogCanvasViews::story_glass_and_print", "focus": "BlueDogStructure::hybridConstruction", "chapter": {"id": "structure", "title": "Structure, manufacture and wet service"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The proposed construction uses printed forms or substrate plus wet-laid glass/epoxy. Segmentation makes desktop manufacture possible, but adds joints and assembly details. The model asks whether the hull, wing and appendages retain their load paths under the declared loads and wet exposure.

The current [structural analysis choice](model:BlueDogDesignDecisions::structuralScope) credits glass sections for bending and gives the printed substrate no bending-strength credit. Printed walls, ribs, finish and seams still add mass. Finite section geometry matters: an approximation must not claim more section stiffness than the solid shape could have.

The [material basis](model:BlueDogRequirementBasis::materials) retains 10 GPa stiffness and 50 MPa strength as unverified study inputs. Wet production coupons, glass-to-print bonds, attachments and joints must establish the properties the design may actually credit.

```syspresent
{"type": "scene", "id": "water-weeds-service", "title": "Sealing, vegetation and service access shape the details", "view": "BlueDogCanvasViews::story_water_weeds_service", "focus": "BlueDogRequirements::enclosureSealing", "chapter": {"id": "structure", "title": "Structure, manufacture and wet service"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Screening constants are not material acceptance", "text": "Deflection fractions, pressure probes, nominal freeboard and print-tile allowances are preliminary study controls. Functional limits and site conditions require their own evidence.", "modelRefs": ["BlueDogRequirementBasis::structuralScreens", "BlueDogRequirementBasis::manufactureAndSites"]}]}
```

Water changes both strength and function. Enclosures, connectors and penetrations need [sealing checks](model:BlueDogRequirements::enclosureSealing); external mechanisms must still move after wet exposure. Access for replacing equipment has to preserve those seals.

Submerged vegetation can reduce speed or jam steering. The [weed-passage requirements](model:BlueDogRequirements::submergedWeedPassage) and [blockage response](model:BlueDogRequirements::weedBlockageResponse) make snag shedding, performance recovery, fault detection and contingency behavior part of the boat definition. The recovery propulsor has its own weed and locked-rotor obligations.

These requirements feed back into appendage geometry, bearings, cable routing and maintenance. A clean-water performance calculation leaves these service conditions unresolved.

```syspresent
{"type": "scene", "id": "finite-energy", "title": "The main pack must last through sailing and delay", "view": "BlueDogCanvasViews::story_finite_energy", "focus": "BlueDogRequirements::multiDayEndurance", "chapter": {"id": "energy", "title": "Passage energy and protected recovery"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Two energy stores, unresolved installation", "text": "IC-01 proposes 1,300 Wh main capacity and 60 Wh recovery capacity. Installed loads, power isolation and recovery authority remain unmeasured assumptions.", "modelRefs": ["BlueDogIC01::design", "BlueDogIC01::integration", "BlueDogPhysicalArchitecture::IC01Candidate"]}]}
```

The finite challenge requires completion without servicing or external charging. The boat must power sensing, navigation, control, signaling, recording and communications while sailing and waiting. Drive duty, standby loads and weather delays can matter as much as nominal propulsion performance.

IC-01's main battery and separate recovery-bank inputs are [capacity assumptions](model:BlueDogIC01::integration). Nameplate watt-hours are not the same as usable energy: temperature, service condition, conversion losses and initial charge affect what can be withdrawn.

The [conservative estimate](model:BlueDogRequirements::conservativeEnergyEstimate) subtracts an error allowance before admission and low-energy decisions. The reserve must remain available for the current recovery route. Optional payload shedding cannot be used to excuse loss of required safety functions.

```syspresent
{"type": "scene", "id": "repeat-energy", "title": "A repeatable mission needs a full chronological energy balance", "view": "BlueDogCanvasViews::story_repeat_energy", "focus": "BlueDogRequirements::sustainedEnergyFeasibility", "chapter": {"id": "energy", "title": "Passage energy and protected recovery"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

Repeated operation asks more than one successful battery-powered passage. The [sustained-energy model](model:BlueDogEnergy::Scenario) follows stored energy through a declared sequence of loads and harvesting intervals. Energy must remain above reserve throughout, and a repeating cycle must finish with at least its starting energy at the same phase.

Average daily generation cannot reveal every low-energy interval. Peak demand is checked separately without assuming harvesting will be available at that instant.

[Evidence acceptance](model:BlueDogDesignDecisions::energyEvidenceAcceptance) requires measured installed-load coverage, resource bounds, battery derating and adequate time resolution for the same configuration. These are additional questions for repeat operation; a finite synthetic campaign does not establish indefinite service.

```syspresent
{"type": "scene", "id": "primary-hardware", "title": "Sailing responsibilities become proposed equipment", "view": "BlueDogCanvasViews::story_primary_hardware", "focus": "BlueDogPhysicalArchitecture::IC01Candidate", "chapter": {"id": "physical", "title": "The proposed onboard assembly"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "candidate", "title": "Equipment must fit the same configuration", "text": "The numerical mass and energy allowances need reconciliation with selected equipment, actual packaging, cables, enclosures and center of gravity.", "modelRefs": ["BlueDogIC01::integration", "BlueDogPhysicalArchitecture::IC01Candidate"]}]}
```

The [physical IC-01 candidate](model:BlueDogPhysicalArchitecture::ic01) proposes equipment to realize the logical responsibilities: a main battery, navigation and wind sensing, traffic observation, a primary controller and sailing actuators. Hull and rig provide the mechanical platform.

Native allocations connect responsibilities to candidate elements. The model also declares power, observation, permission and command interfaces. This is where the earlier story becomes a proposed assembly: autonomous sailing requires these functions to work together on the same boat.

Catalog products, processor partitions, connectors, buses, voltage and throughput are still open. The diagram defines proposed equipment roles and interfaces, not a released bill of materials.

```syspresent
{"type": "scene", "id": "recovery-hardware", "title": "Separate recovery paths need demonstrated independence", "view": "BlueDogCanvasViews::story_recovery_hardware", "focus": "BlueDogPhysicalArchitecture::IC01Candidate", "chapter": {"id": "physical", "title": "The proposed onboard assembly"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "assumption", "title": "Independent recovery is still a hypothesis", "text": "Power separation must preserve observation, decision, actuation and essential records through the declared faults. Common-cause isolation requires physical evidence.", "modelRefs": ["BlueDogPhysicalArchitecture::IC01Candidate", "BlueDogIC01::integration"]}]}
```

The recovery proposal adds a separate battery, navigation, observation, controller and propulsor. Its purpose is to preserve a route to shore after loss of primary capability, including declared capsize cases.

Separate model parts make the hypothesis inspectable. They do not establish immunity to shared flooding, software faults, wiring failures or a common obstruction. Inverted sensing and thrust, peer-fault detection and permission handling need configuration-specific tests.

The model explicitly leaves [telemetry and record-storage power assignment](model:BlueDogPhysicalArchitecture::IC01Candidate) unresolved. The 8 W recovery essential-load allowance is not an installed measurement or proof that these functions survive on the recovery bank. This is a design gap with direct consequences for the safety story.

```syspresent
{"type": "scene", "id": "supervisor-decision", "title": "Choosing sailing, avoidance or recovery", "view": "BlueDogCanvasViews::supervisorDecision", "focus": "BlueDogMissionLogic::SupervisoryCycle", "panel": {"placement": "bottom"}, "presentation": {"compartments": "compact", "emphasis": ["succession"]}, "chapter": {"id": "control", "title": "Supervisory decisions and persistence"}, "allowDisconnected": true}
```

The [supervisory cycle](model:BlueDogMissionLogic::SupervisoryCycle) selects sailing, avoidance, degraded drift or abort/recovery from supplied observations. It combines the operating rules with capability and energy state rather than treating arrival at the next gate as the only objective.

This executable policy is a different artifact from the earlier logical scenarios. It can be exercised with explicit inputs to check decisions and latches. It still relies on other models or equipment to supply truthful observations and achieve the requested motion.

The bridge from model to installed control therefore has two sides: verify that the decision logic implements the requirements, and establish that sensing and actuation meet the assumptions under which those decisions are safe.

```syspresent
{"type": "scene", "id": "reset-and-records", "title": "A reset must preserve aborts, restrictions and gate progress", "view": "BlueDogCanvasViews::story_reset_and_records", "focus": "BlueDogRequirements::resetRecovery", "chapter": {"id": "control", "title": "Supervisory decisions and persistence"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

A watchdog reset must not turn an aborted boat into a fresh qualifying attempt. [Qualification restoration](model:BlueDogRequirements::qualificationRestoration) uses a valid persisted status, or treats absent or inconsistent status as nonqualifying. Gate progress and active restrictions must also survive.

Motor thrust remains inhibited while qualification is true or unknown. After restart, recovery authorization follows the defined onboard safety or fresh authenticated command policy. Restoring software execution alone does not restore permission.

The [communications-outage scenario](model:BlueDogMethod::Scenarios::CommunicationsOutage) retains evidence while disconnected and prioritizes current records on reconnection. Time, identity and sequence help distinguish a delayed old observation from a new event. They also let a reviewer reconstruct why the boat continued, waited or aborted.

```syspresent
{"type": "scene", "id": "evidence-scope", "title": "A named candidate is not the same as a qualified boat", "view": "BlueDogCanvasViews::story_evidence_scope", "focus": "BlueDogIC01::design", "chapter": {"id": "evidence", "title": "Analysis evidence and unresolved risk"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "evidence", "title": "Read configuration and acceptance together", "text": "IC-01 retains an archived design source and has physicallyQualified=false. The integration risk assessment records incomplete transfer from synthetic scenarios to the river.", "modelRefs": ["BlueDogIC01::design", "BlueDogRisks::mission"]}]}
```

The model contains several kinds of support. Requirements state obligations. Scenarios describe interactions. Executable decisions check supplied observations. Numerical analyses test conditional feasibility. Recorded evidence preserves the source, configuration and assumptions of an actual run.

[Virtual closure](model:BlueDogIntegratedCandidate::VirtualClosure) requires sizing, nominal passage, encounters, recovery, energy, timing and recorded assumptions to agree for a candidate. The integration study uses a bounded synthetic reach; it does not establish a complete Gorge passage or installed performance.

Older records remain useful history. For example, [the October 12 sizing candidate](model:BlueDogCurrentSizing::candidate) belongs to an earlier exploratory run and differs from IC-01. A package name containing “Current” does not override its recorded revision. This publication presents the model; it does not execute a new sizing or mission campaign.

```syspresent
{"type": "scene", "id": "failure-risk", "title": "Traffic and recovery are the immediate safety questions", "view": "BlueDogCanvasViews::story_failure_risk", "focus": "BlueDogRisks::traffic", "chapter": {"id": "evidence", "title": "Analysis evidence and unresolved risk"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

The [development risk assessment](model:BlueDogRisks::traffic) prioritizes evidence that could force a redesign or a narrower operating envelope. Traffic detection and recovery capability are immediate safety questions. Structural properties, wing loads and installed energy demand affect whether the proposed boat remains credible.

The [failure review](model:BlueDogDFMEA::starter::powerCommonCause) includes common power loss alongside component faults such as steering jam and missed traffic. A duplicated controller cannot compensate for a shared failure that removes its power or observations.

Qualitative risk classes express engineering judgments about unresolved design work. They are not measured incident probabilities or accepted residual risk. Each open item needs a disposition and evidence appropriate to the affected mission conditions.

```syspresent
{"type": "scene", "id": "verification-status", "title": "Verification links identify the checks still to establish", "view": "BlueDogCanvasViews::story_verification_status", "focus": "BlueDogRequirements::cruiseEvidence", "chapter": {"id": "evidence", "title": "Analysis evidence and unresolved risk"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "evidence", "title": "A concrete verification example", "text": "The native traffic-safety case remains a planned configuration-specific procedure. No physical encounter acceptance is asserted by this story.", "modelRefs": ["BlueDogRequirementVerification::TrafficSafetyVerification"]}]}
```

A [verification case](model:BlueDogRequirementVerification::TrafficSafetyVerification) identifies a subject, procedure and requirement to be checked. Its presence is coverage, not a passing result. The model keeps planned or unaccepted evidence inconclusive.

Likewise, the [0.90 mission-reliability objective](model:BlueDogRequirements::missionSuccessProbability) at 95-percent confidence is a provisional study objective. It does not govern finite Gorge qualification or turn synthetic scenario fractions into a measured real-world success probability.

Before reliance, [critical failure modes](model:BlueDogRequirements::criticalFailureDisposition) need accepted dispositions, and sailing and reliability claims need applicable evidence for the installed configuration. Software checks on this publication establish that its references and views load; they do not close those engineering claims.

```syspresent
{"type": "scene", "id": "qualification-campaign", "title": "Measure components, integrate the boat, then qualify the course", "view": "BlueDogCanvasViews::story_qualification_campaign", "focus": "BlueDogRequirementVerification::StructuralMaterialEvidence", "chapter": {"id": "campaign", "title": "The path to a Gorge attempt"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true, "context": [{"kind": "analysis", "title": "Priority follows the uncertainty that can change the design", "text": "Investigate traffic and recovery feasibility first, while bounding material, aerodynamic and installed-energy assumptions. Re-run affected analyses when measured inputs change.", "modelRefs": ["BlueDogRisks::traffic", "BlueDogRisks::recovery", "BlueDogRisks::structure", "BlueDogRisks::energy"]}]}
```

The next work should follow the unresolved assumptions. Production coupons, joints and wet mechanisms establish credible structure. Both-tack sail forces, trim moments and drive demand inform the rig trade. Controlled target observations and maneuver tests establish useful detection and avoidance envelopes.

An integrated boat then needs measured loads and usable energy, fault isolation, sealing, capsize/control restoration and recovery to suitable sites. These measurements can change the geometry, equipment or operating restrictions and must feed back into the named configuration.

Finally, [passage qualification](model:GorgeChallengeVerification::PassageQualificationVerification) needs a reviewed course, forecast and navigation baseline, accepted configuration-specific safety evidence, and a traceable unassisted run. This is an ordered engineering campaign, not launch authorization from the existence of a model.

```syspresent
{"type": "scene", "id": "blue-dog-next", "title": "What now defines Blue Dog—and what remains to decide", "view": "BlueDogCanvasViews::story_blue_dog_next", "focus": "GorgeChallenge::transGorgeChallenge", "chapter": {"id": "campaign", "title": "The path to a Gorge attempt"}, "presentation": {"compartments": "compact"}, "allowDisconnected": true}
```

Blue Dog is now defined as more than a hull with a sail. Its model connects a qualifying river circuit to autonomous navigation, traffic response, protected recovery, owner-selected manufacture, logical responsibilities and a proposed physical realization. IC-01 gives those studies a consistent named set of design and integration inputs.

The open decisions are consequential: select a rig using comparable evidence, establish installed sensing and recovery capability, replace assumed loads and material properties with supported bounds, and demonstrate the complete boat in its admitted conditions. The next review should decide whether that evidence supports the candidate, a redesign or a narrower operating envelope.

Repeated Gorge circuits and an eventual [voyage toward Hawaii](model:BlueDog::Goals::hawaiiVoyage) remain future objectives with different exposure and qualification needs. A successful finite Gorge campaign would be a foundation for them, with its own recorded configuration and limitations.
