package BlueDogRisks {
    private import ScalarValues::*;
    doc /* Technical risk assessment for the next concept-selection and integrated-test
     * planning spiral. Qualitative likelihood rates the prospect that an identified
     * limitation forces redesign or operating-envelope restriction. Consequence rates
     * the credible effect if it is not addressed. These are ordinal engineering
     * judgments, not incident probabilities, expected losses or residual-risk acceptance.
     * Standard technicalRisk probability and impact remain unset without quantitative evidence.
     */
    metadata def Tracking :> RiskMetadata::Risk {
        attribute identifier : String;
        attribute riskKind : String;
        attribute statement : String;
        attribute consequence : String;
        attribute uncertainty : String;
        attribute priority : String;
        attribute priorityRationale : String;
        attribute reductionAction : String;
        attribute closureEvidence : String;
        attribute likelihoodClass : String default "";
        attribute consequenceClass : String default "";
        attribute confidence : String default "Unassessed";
        attribute assessedOn : String default "2026-10-15";
        attribute assessor : String default "Analysis agent; owner review pending";
        attribute assessmentScope : String default "Next concept-selection and integrated-test planning spiral; likelihood of redesign or operating-envelope restriction, not a probability of an accident on a voyage.";
        attribute assessmentBasis : String default "Unassessed";
        attribute evidenceReference : String default "None accepted";
        attribute residualDisposition : String default "Open; no residual-risk acceptance recorded";
    }
    part traffic {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; owner = "Analysis agent; owner reviews disposition"; }
        metadata risk : Tracking {
            riskKind = "technical";
            identifier = "R-001";
            likelihoodClass = "Likely";
            consequenceClass = "Critical";
            confidence = "Low";
            assessmentBasis = "Current class-specific detection allocations require reviewed kinematics, consequence-informed clearance, observation and whole-response reliability, confidence and risk disposition. Those inputs and installed evidence remain open. Historical IC-01 synthetic closure used a uniform 750 m sensing hypothesis; it does not establish the new class policy or measured installation. A missed encounter can compromise other river users.";
            evidenceReference = "models/analyses/class-specific-detection.sysml; models/analyses/encounter-review.sysml (historical); models/analyses/integrated-candidate.sysml (historical sensing hypothesis); models/vehicle/requirements.sysml";
            residualDisposition = "Open; Mitigate; require sensing and maneuver evidence before admitting the affected operating envelope. No residual-risk acceptance recorded.";
            statement = "If installed sensing cannot acquire and track relevant traffic early enough, the vessel cannot safely execute the allocated avoidance maneuver.";
            consequence = "Collision or impediment of other river users, especially in darkness or spray.";
            uncertainty = "No installed class-specific detection envelope, consequence review or correlated maneuver-response evidence establishes an accepted current allocation.";
            priority = "Now: safety feasibility";
            priorityRationale = "Safety consequence and potential architecture blocker; a desktop envelope study can expose infeasibility before equipment selection.";
            reductionAction = "Analyze detection geometry, target visibility, latency and maneuver sensitivity together; define a shore-camera and controlled-target experiment before selecting equipment.";
            closureEvidence = "A candidate sensing/maneuver architecture has a bounded operating envelope supported by independent observations; unmet cases have explicit restrictions or a revised architecture.";
        }
    }
    dependency trafficTrace0 from traffic to BlueDogEncounterReview::criteria {
        doc /* Historical six-class allocation study; current allocation is traced separately. */
    }
    dependency trafficCurrentPolicy from traffic to BlueDogClassDetection::policy;
    dependency trafficLocationReview from traffic to BlueDogLocationTraffic::policy;
    dependency trafficTrace1 from traffic to BlueDogDFMEA::starter::trafficMiss;
    dependency trafficTrace2 from traffic to BlueDogRequirements::trafficSafety;
    part recovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; owner = "Analysis agent; owner reviews disposition"; }
        metadata risk : Tracking {
            riskKind = "technical";
            identifier = "R-002";
            likelihoodClass = "Likely";
            consequenceClass = "Critical";
            confidence = "Medium";
            assessmentBasis = "IC-01 reaches synthetic approaches in six casualty/end-of-exposure cases using allocated independent power, control, observations and upright/inverted thrust. Shared-power and empty-bank controls still reach shore contact. No surveyed casualty coverage, measured fault isolation, finite-turn recovery dynamics or retention is established. Site, propulsion or operating restrictions remain likely; unresolved loss of recovery can expose other traffic.";
            evidenceReference = "models/analyses/recovery-site-review.sysml; tests/test_course_recovery.py; evidence/runs/2026-10-15-integrated-candidate/integrated-mission.json; models/analyses/recovery-risk.sysml";
            residualDisposition = "Open; Mitigate; retain casualty restrictions until site coverage and installed recovery authority are demonstrated. No residual-risk acceptance recorded.";
            statement = "If a casualty removes sensing, steering or buoyancy, autonomous shore recovery may fail before another traffic encounter.";
            consequence = "Collision, stranded vessel or unrecovered debris.";
            uncertainty = "Reachability and common-cause exposure are unvalidated; low failure probability is not established.";
            priority = "Now: safety feasibility";
            priorityRationale = "Safety consequence; shares maneuver and sensing assumptions with R-001, so investigate those dependencies together.";
            reductionAction = "Exercise coupled loss-of-sensing, steering, power and capsize cases against reachable shore sites; identify the measurements needed for a controlled recovery trial.";
            closureEvidence = "Reachable recovery coverage is demonstrated for declared casualty cases; unsupported cases are excluded or mitigated and residual safety risk is explicitly reviewed.";
        }
    }
    dependency recoveryTrace0 from recovery to BlueDogRecoveryRisk::Sensitivity;
    dependency recoveryTrace1 from recovery to BlueDogDFMEA::starter::steeringJam;
    dependency recoveryTrace2 from recovery to BlueDogDFMEA::starter::powerCommonCause;
    dependency recoveryTrace3 from recovery to BlueDogDesignDecisions::recoveryScope;
    dependency recoveryTrace4 from recovery to GorgeChallenge::casualtyFlotation;
    part structure {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; owner = "Analysis agent; owner reviews disposition"; }
        metadata risk : Tracking {
            riskKind = "technical";
            identifier = "R-003";
            likelihoodClass = "Possible";
            consequenceClass = "Critical";
            confidence = "Low";
            assessmentBasis = "The structural basis explicitly marks 10 GPa and 50 MPa as unqualified and lacks joint/load correlation. There is insufficient evidence to call the candidate inadequate or robust, so redesign is possible rather than presumed likely. Loss of a keel or hull load path can defeat flotation and recovery.";
            evidenceReference = "models/analyses/structural-basis.sysml; models/vehicle/verification.sysml";
            residualDisposition = "Open; Mitigate; obtain production material and attachment evidence and rerun affected sizing before structural reliance. No residual-risk acceptance recorded.";
            statement = "If wet laminate, joint or load assumptions are optimistic, the proposed structure may be too heavy or may lose its load path in service.";
            consequence = "Structural failure, loss of recovery capability or invalid sizing frontier.";
            uncertainty = "10 GPa and 50 MPa are unqualified; joint, fatigue and functional deformation evidence is missing.";
            priority = "Next: sizing credibility";
            priorityRationale = "Affects mass, buoyancy and recovery across every concept; sensitivity work can focus inexpensive experiments.";
            reductionAction = "Sweep material and joint/load assumptions to rank sensitivity; specify production coupons and attachment tests around the assumptions that change design selection.";
            closureEvidence = "Credited properties and applicable loads are supported within a declared scope; re-sizing establishes margins or identifies the required redesign.";
        }
    }
    dependency structureTrace0 from structure to BlueDogStructuralBasis::Inputs;
    dependency structureTrace1 from structure to BlueDogStructure::structuralIntegrity;
    dependency structureTrace2 from structure to BlueDogRequirementVerification::StructuralMaterialEvidence;
    dependency structureTrace3 from structure to BlueDogRequirementVerification::StructuralLoadEvidence;
    dependency structureTrace4 from structure to BlueDogDFMEA::starter::hullLeak;
    dependency structureTrace5 from structure to BlueDogDFMEA::starter::keelLoss;
    part wing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; owner = "Analysis agent; owner reviews disposition"; }
        metadata risk : Tracking {
            riskKind = "technical";
            identifier = "R-004";
            likelihoodClass = "Likely";
            consequenceClass = "Critical";
            confidence = "Medium";
            assessmentBasis = "Recorded mesh and heel sensitivities motivate restricted incidence and conservative force/moment allowances. Both-tack and off-design measurements and loaded drive behavior remain absent. Rig or actuator changes are likely; an overloaded or jammed actuator can remove control authority, so the credible consequence is safety-critical even though a physical failure rate is unknown.";
            evidenceReference = "models/analyses/aerodynamic-policy.sysml; docs/sail-trade.md; evidence/runs/2026-10-13-surface-environment/summary.json";
            residualDisposition = "Open; Mitigate; keep rig selection open and bound forces, moments and drive demand with measurements. No residual-risk acceptance recorded.";
            statement = "If the wing force or trim-moment model is optimistic, the selected rig may lack progress or overload its actuator.";
            consequence = "Mission noncompletion, excess energy demand or loss of control.";
            uncertainty = "No measured both-tack polar; stall, broadside response and loaded gearbox behavior remain uncertain.";
            priority = "Next: sizing credibility";
            priorityRationale = "High leverage on rig selection, energy and vessel size; avoid refining geometry inside an unsupported aerodynamic assumption.";
            reductionAction = "Rank force and moment sensitivity at mission-critical conditions; define force/moment and drive-energy component tests supporting the first IC-01-scale build.";
            closureEvidence = "Independent measurements bound the model at conditions used for concept selection; force, trim and failure behavior support the chosen rig or trigger a new trade.";
        }
    }
    dependency wingTrace0 from wing to BlueDogDesignDecisions::aerodynamicScope;
    dependency wingTrace1 from wing to BlueDogDesignDecisions::holdingDrive;
    dependency wingTrace2 from wing to BlueDogRequirements::cruiseEvidence;
    dependency wingTrace3 from wing to BlueDogDFMEA::starter::sailJam;
    part energy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; owner = "Analysis agent; owner reviews disposition"; }
        metadata risk : Tracking {
            riskKind = "technical";
            identifier = "R-005";
            likelihoodClass = "Likely";
            consequenceClass = "Critical";
            confidence = "Medium";
            assessmentBasis = "IC-01 has 102.062 Wh main-pack headroom against 833.938 Wh nominal allocated demand and separately budgets recovery standby and propulsion. Its additional 8 W sensing demand, equipment mass, usable capacity, duty and isolation remain unmeasured. This is a conditional allocation, not installed energy evidence. Energy or operating allocations remain likely to need adjustment; exhausted or shared power can remove safety and recovery functions.";
            evidenceReference = "models/analyses/integrated-candidate.sysml; evidence/runs/2026-10-15-integrated-candidate/integrated-sizing.json; evidence/runs/2026-10-15-integrated-candidate/integrated-mission.json";
            residualDisposition = "Open; Mitigate; establish measured capacity/load bounds and protect independent recovery authority before relying on the margin. No residual-risk acceptance recorded.";
            statement = "If installed loads, battery capacity or correlated duty cycles exceed assumptions, the vessel may exhaust usable energy before passage or recovery completes.";
            consequence = "Abort or loss of safety and recovery functions.";
            uncertainty = "IC-01 has nominal allocated margin; installed sensing demand, usable capacity, duty and independent recovery loads are unmeasured.";
            priority = "Next: integration credibility";
            priorityRationale = "Simultaneous sensing performance, installed demand and power isolation can overturn the allocated concept despite virtual closure.";
            reductionAction = "Propagate correlated load and capacity uncertainty through chronological passage and abort cases; specify measured-load replay on the electrical bench.";
            closureEvidence = "Evidence-backed usable energy and load profiles support passage and recovery margins in the declared scenario set; protection and common-cause faults have explicit dispositions.";
        }
    }
    dependency energyTrace0 from energy to BlueDogDesignDecisions::energyEvidenceAcceptance;
    dependency energyTrace1 from energy to BlueDogDFMEA::starter::batteryFault;
    dependency energyTrace2 from energy to BlueDogDFMEA::starter::powerCommonCause;
    dependency energyTrace3 from energy to BlueDogRequirements::sustainedReserveProtection;
    part mission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; owner = "Analysis agent; owner reviews disposition"; }
        metadata risk : Tracking {
            riskKind = "technical";
            identifier = "R-006";
            likelihoodClass = "Demonstrated";
            consequenceClass = "Major";
            confidence = "High";
            assessmentBasis = "IC-01 closes a bounded synthetic reach with averaged-tack sailing and point-mass recovery. It does not establish complete Gorge, wave or physical maneuver coverage. All four archived wave-performance mission replays stop outside their supported domain at departure despite 32 small-wave operating cases. Synthetic traffic and weather limit transfer; greater sample count alone cannot establish the operating envelope.";
            evidenceReference = "evidence/runs/2026-10-15-integrated-candidate/integrated-mission.json; evidence/runs/2026-10-13-wave-performance/summary.json; docs/mission-simulation.md";
            residualDisposition = "Open; Restrict claims to supported domains; expand and correlate decision-driving coverage before comparing mission success. No residual-risk acceptance recorded.";
            statement = "If weather, traffic or physics coverage is unrepresentative, the optimizer may select a boat whose apparent mission success does not transfer to the river.";
            consequence = "Wrong concept selection or unjustified operating envelope.";
            uncertainty = "Synthetic scenario fractions are not calibrated real-world mission probabilities.";
            priority = "Continuous: decision credibility";
            priorityRationale = "Cross-cutting dependency of every ranking; maintain alongside focused investigations rather than treating more Monte Carlo runs as validation.";
            reductionAction = "Track scenario coverage and model validity; compare candidates using common seeded realizations, explicit edge cases and sensitivity to uncertain inputs.";
            closureEvidence = "Decision-driving scenarios and model domains have documented evidence and limitations; conclusions remain stable or the unresolved sensitivity is carried into the review.";
        }
    }
    dependency missionTrace0 from mission to BlueDogDesignDecisions::uncertaintyPolicy;
    dependency missionTrace1 from mission to BlueDogRequirements::missionReliability;
    dependency missionTrace2 from mission to FailureAnalysis::DesignFailureReview;
}
