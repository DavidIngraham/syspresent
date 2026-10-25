package BlueDogDecisionContext {
    private import ScalarValues::*;
    metadata def Context {
        attribute kind : String [1];
        attribute decisionQuestion : String [0..1];
        attribute scope : String [1];
        attribute ownerRole : String [0..1];
        attribute criteriaBasis : String [1];
        attribute comparisonBasis : String [1];
        attribute reopenTrigger : String [1];
        attribute dispositionRecord : String [0..1];
        attribute authorityIdentity : String [0..1];
        attribute decisionDate : String [0..1];
        attribute implementationEvidence : String [0..1];
    }
    metadata sizingBaseline : Context about BlueDogDesignDecisions::sizingBaseline {
        kind = "Numerical baseline";
        decisionQuestion = "Which available geometry supports the first coupled sizing calculation?";
        scope = "Finite Gorge sizing/reference CAD; no hardware rig downselect.";
        criteriaBasis = "Applicable mission and safety obligations remain mandatory.";
        comparisonBasis = "Compare all three rigs using measured performance, durability, energy and recovery on common cases.";
        reopenTrigger = "New comparable rig evidence, changed geometry/domain or a proposed hardware selection.";
        ownerRole = "Project owner";
    }
    metadata holdingDrive : Context about BlueDogDesignDecisions::holdingDrive {
        kind = "Option investigation";
        decisionQuestion = "Should non-backdrivable gearing remain an actuator option?";
        scope = "Finite Gorge move/hold/standby energy, shock/jam and recovery; future endurance separate.";
        criteriaBasis = "Launch/recovery energy, controllability and casualty response cannot be traded away.";
        comparisonBasis = "Compare complete drive mass, efficiency, idle/move/hold energy, wear, depower and construction effort.";
        reopenTrigger = "Measured holding/efficiency/failure behavior or changed actuator/energy/safety assumptions.";
        ownerRole = "Project owner";
    }
    metadata aerodynamicScope : Context about BlueDogDesignDecisions::aerodynamicScope {
        kind = "Analysis-use policy";
        decisionQuestion = "What can the provisional VSPAERO response support?";
        scope = "Restricted attached-flow sizing of the reference section, not a measured candidate polar.";
        criteriaBasis = "Respect declared analysis domain and mission-evidence obligations.";
        comparisonBasis = "Convergence and domain sensitivity inform use; additional calculations do not prefer the rig.";
        reopenTrigger = "New measurements, solver/domain changes or a use beyond the declared polar envelope.";
        ownerRole = "Project owner";
    }
    metadata structuralScope : Context about BlueDogDesignDecisions::structuralScope {
        kind = "Analysis credit policy";
        decisionQuestion = "Which structural contributions receive preliminary bending credit?";
        scope = "Current hybrid printed/composite sizing; production joints and wet/aged properties unaccepted.";
        criteriaBasis = "Applicable structural integrity, manufacturing boundary and verification requirements.";
        comparisonBasis = "Compare complete mass, section behavior, constructability and test-supported material/joint alternatives.";
        reopenTrigger = "New wet/joint/fatigue/buckling data, changed construction or load envelope.";
        ownerRole = "Project owner";
    }
    metadata recoveryScope : Context about BlueDogDesignDecisions::recoveryScope {
        kind = "Analysis-use policy";
        decisionQuestion = "What recovery claim can static restoring curves support?";
        scope = "Static full-roll sensitivities for identified geometries; dynamic self-righting separate.";
        criteriaBasis = "Self-righting, safe casualty control, independent recovery and retrieval obligations.";
        comparisonBasis = "Compare geometry, pitch stability, water state, control restoration and dynamic trajectories.";
        reopenTrigger = "New dynamic releases, water-state geometry, failures or changed recovery use.";
        ownerRole = "Project owner";
    }
    metadata energyEvidenceAcceptance : Context about BlueDogDesignDecisions::energyEvidenceAcceptance {
        kind = "Evidence-acceptance policy";
        decisionQuestion = "What evidence would support setting energy evidenceAccepted?";
        scope = "Same installed configuration and declared sustained-operation use; finite Gorge energy remains separately scoped.";
        criteriaBasis = "Required functions, non-overlapping accounts and actual evidence/readiness obligations.";
        comparisonBasis = "Compare bound adequacy and uncertainty; a review Boolean is not an automatic evidence audit.";
        reopenTrigger = "Changed installation, duty, temperature/service age, usable storage, harvester or required functions.";
        ownerRole = "Project owner";
    }
    metadata uncertaintyPolicy : Context about BlueDogDesignDecisions::uncertaintyPolicy {
        kind = "Interpretation policy";
        decisionQuestion = "How should nominal solutions, adverse sensitivities and qualification be interpreted?";
        scope = "Local sizing/search and declared environmental/construction sensitivities.";
        criteriaBasis = "Preserve mission requirements and report calculation/domain limitations.";
        comparisonBasis = "Compare robust margins and consequential sensitivities; brackets/reserves are not accepted safety factors or probabilities.";
        reopenTrigger = "Measured bounds, new adverse cases, solver/domain changes or proposed qualification use.";
        ownerRole = "Project owner";
    }
    metadata trafficCourtesy : Context about BlueDogDesignDecisions::trafficCourtesy {
        kind = "Operational design preference";
        decisionQuestion = "How should alternatives reduce the burden on crewed traffic while meeting navigation duties?";
        scope = "Common finite Gorge traffic scenarios; planner preference not yet implemented or validated.";
        criteriaBasis = "Navigation duties, predictable required behavior, collision safety and permitted interventions.";
        comparisonBasis = "Compare close encounters, predicted other-vessel action and mission delay; no inference about another skipper's motives.";
        reopenTrigger = "Changed traffic/rule context, sensing/planning capability or contrary encounter evidence.";
        ownerRole = "Project owner";
    }
    metadata trafficAcceptance : Context about BlueDogRequirementDecisions::trafficAcceptance {
        kind = "Open acceptance question";
        scope = "Current Gorge class-specific traffic/rule applicability and installed response evidence.";
        criteriaBasis = "Applicable supporting requirements and the evidence named by this open question; unaccepted criteria remain open.";
        comparisonBasis = "Evidence sufficiency and applicability review; no hardware ranking or invented utility score.";
        reopenTrigger = "Observation/response errors, changed class/context/rules or new installed evidence.";
    }
    metadata recoveryAcceptance : Context about BlueDogRequirementDecisions::recoveryAcceptance {
        kind = "Open acceptance question";
        scope = "Current Gorge course-wide powered recovery, capture/retention and human retrieval.";
        criteriaBasis = "Applicable supporting requirements and the evidence named by this open question; unaccepted criteria remain open.";
        comparisonBasis = "Evidence sufficiency and applicability review; no hardware ranking or invented utility score.";
        reopenTrigger = "Changed shores/current/casualty envelope, supplies or recovery/retrieval capability.";
    }
    metadata structuralQualification : Context about BlueDogRequirementDecisions::structuralQualification {
        kind = "Open acceptance question";
        scope = "Current production materials/joints and combined structural/environmental loads.";
        criteriaBasis = "Applicable supporting requirements and the evidence named by this open question; unaccepted criteria remain open.";
        comparisonBasis = "Evidence sufficiency and applicability review; no hardware ranking or invented utility score.";
        reopenTrigger = "Changed production process, material/joint aging, loads or functional installation.";
    }
    metadata installedControlEvidence : Context about BlueDogRequirementDecisions::installedControlEvidence {
        kind = "Open acceptance question";
        scope = "Current onboard observations, command delivery and achieved motion for the actual installation.";
        criteriaBasis = "Applicable supporting requirements and the evidence named by this open question; unaccepted criteria remain open.";
        comparisonBasis = "Evidence sufficiency and applicability review; no hardware ranking or invented utility score.";
        reopenTrigger = "Changed sensing/frame/time/control path, software/calibration or fault behavior.";
    }
    metadata integrationCoverage : Context about BlueDogRequirementDecisions::integrationCoverage {
        kind = "Open acceptance question";
        scope = "Current whole-route mission/safety/energy/structure/casualty acceptance argument.";
        criteriaBasis = "Applicable supporting requirements and the evidence named by this open question; unaccepted criteria remain open.";
        comparisonBasis = "Evidence sufficiency and applicability review; no hardware ranking or invented utility score.";
        reopenTrigger = "Changed configuration, mission case, interacting fault or excluded domain.";
    }
    metadata futureMissionAcceptance : Context about BlueDogRequirementDecisions::futureMissionAcceptance {
        kind = "Open acceptance question";
        scope = "Separately scoped future ocean voyage; no implied current Gorge requirement.";
        criteriaBasis = "Applicable supporting requirements and the evidence named by this open question; unaccepted criteria remain open.";
        comparisonBasis = "Evidence sufficiency and applicability review; no hardware ranking or invented utility score.";
        reopenTrigger = "New route/exposure/maintenance requirements or an authorized future mission scope.";
    }
}

package BlueDogTradeCriteria {
    private import ScalarValues::*;
    enum def Kind { mandatory; comparativeStudy; }
    part def Criterion {
        attribute position : Integer [1];
        attribute label : String [1];
        attribute kind : Kind [1];
        attribute scope : String [1];
        attribute evidenceNeeded : String [1];
    }
    part durability : Criterion {
        attribute :>> position = 1; attribute :>> label = "Wet and survival durability";
        attribute :>> kind = Kind::mandatory;
        attribute :>> scope = "Complete proposed rig installation under applicable wet and Gorge survival conditions.";
        attribute :>> evidenceNeeded = "Comparable wet-cycle, wear, joint, storm and faulted-rig evidence for the intended exposure.";
    }
    part energy : Criterion {
        attribute :>> position = 2; attribute :>> label = "Finite mission energy and recovery reserve";
        attribute :>> kind = Kind::mandatory;
        attribute :>> scope = "Installed move/hold/idle and controller demand, main account and protected recovery account; future sustained energy separate.";
        attribute :>> evidenceNeeded = "Measured installed loads and duty bounds, stored-energy boundaries, route/exposure and casualty reserve.";
    }
    part progress : Criterion {
        attribute :>> position = 3; attribute :>> label = "Passage duration and representative cruise evidence";
        attribute :>> kind = Kind::mandatory;
        attribute :>> scope = "Current Gorge passage-duration obligation and both-tack representative evidence; legacy leg-progress ratio is a study comparison.";
        attribute :>> evidenceNeeded = "Comparable installed polars, loading, current/wind cases, passage limits and uncertainty.";
    }
    part recovery : Criterion {
        attribute :>> position = 4; attribute :>> label = "Capsize and control recovery";
        attribute :>> kind = Kind::mandatory;
        attribute :>> scope = "Candidate rig in actual casualty geometry, trim/jam/water states and restored control; static screens alone insufficient.";
        attribute :>> evidenceNeeded = "Dynamic righting, ingress/drainage, depower, observation/control restoration and fault evidence.";
    }
    part manufacturing : Criterion {
        attribute :>> position = 5; attribute :>> label = "Manufacturing compatibility";
        attribute :>> kind = Kind::mandatory;
        attribute :>> scope = "Applicable desktop-manufactured hull/structure obligation and compatible rig installation; sailcloth need not be printed.";
        attribute :>> evidenceNeeded = "Manufacturing/process and installation evidence; compare rig construction effort separately without inventing cost scores.";
    }
    part handling : Criterion {
        attribute :>> position = 6; attribute :>> label = "Lift and handling mass";
        attribute :>> kind = Kind::mandatory;
        attribute :>> scope = "Complete boat and applicable lift/handling configuration; compare total installed rig mass and CG consistently.";
        attribute :>> evidenceNeeded = "Identified configuration mass and handling/structural evidence, including wet and retained-water states as applicable.";
    }
    part reliabilityStudy : Criterion {
        attribute :>> position = 7; attribute :>> label = "Provisional voyage reliability study";
        attribute :>> kind = Kind::comparativeStudy;
        attribute :>> scope = "Unaccepted L-101 study objective; an unknown or missed study target is not a mandatory selection veto. Required functions still apply.";
        attribute :>> evidenceNeeded = "Representative failure/dependence/common-cause/exposure evidence and uncertainty before comparing reliability; supplied states do not accept rates.";
    }
    dependency durabilityWet from durability to BlueDogRequirements::wetMechanicalIntegrity;
    dependency durabilityStorm from durability to BlueDogRequirements::gorgeSurvivalWind;
    dependency energyAdmission from energy to BlueDogRequirements::launchEnergyAdmission;
    dependency energyReserve from energy to BlueDogRequirements::recoveryEnergy;
    dependency progressDuration from progress to BlueDogRequirements::passageDuration;
    dependency progressEvidence from progress to BlueDogRequirements::cruiseEvidence;
    dependency recoveryRighting from recovery to BlueDogRequirements::selfRighting;
    dependency recoveryControl from recovery to BlueDogRequirements::capsizeControlRecovery;
    dependency manufacturingScope from manufacturing to BlueDogRequirements::desktopManufacture;
    dependency handlingMass from handling to BlueDogRequirements::liftMass;
    dependency studyObjective from reliabilityStudy to BlueDogRequirements::missionSuccessProbability;
    dependency studyEvidence from reliabilityStudy to BlueDogRequirements::reliabilityEvidence;
    dependency requiredFunctionContinuity from reliabilityStudy to BlueDogRequirements::missionReliability {
        metadata rationale : ModelingMetadata::Rationale { text = "Functional continuity remains mandatory; classifying the provisional probability target as comparative does not waive required functions."; }
    }
}
