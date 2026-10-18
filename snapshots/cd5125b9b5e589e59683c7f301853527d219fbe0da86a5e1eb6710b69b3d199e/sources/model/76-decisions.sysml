package BlueDogDesignDecisions {
    private import ScalarValues::*;
    part def Decision {
        attribute disposition : String;
        attribute evidenceNeeded : String;
    }
    part sizingBaseline : Decision {
        attribute :>> disposition = "Use the fixed-camber rotating-mast wing as the first numerical sizing baseline; no final sail downselect.";
        attribute :>> evidenceNeeded = "Comparable both-tack polars, wet-cycle durability, actuator energy, mass/CG and dynamic recovery evidence for the alternatives.";
        metadata rationale : ModelingMetadata::Rationale {
            text = "The existing manufacturing CAD supplies a measured section and a practical starting geometry. This enables coupled sizing while preserving the tail-controlled wing and soft sail as equal development contenders for the finite Gorge mission. Availability of CAD is not proof of superior sailing performance.";
        }
        metadata issue : ModelingMetadata::Issue { text = "The source CAD is a manufacturing prototype, not the challenge vessel; the rectangular VSP wing uses its complete midspan section rather than reproducing its swept planform."; }
    }
    dependency baselineCandidate from sizingBaseline to BlueDogSailTrade::camberedWing;
    dependency retainedAlternative from sizingBaseline to BlueDogSailTrade::tailWing;
    dependency softSailAlternative from sizingBaseline to BlueDogSailTrade::softSail;
    dependency baselinePurpose from sizingBaseline to BlueDogRequirements::cruiseEvidence;

    part holdingDrive : Decision {
        attribute :>> disposition = "Evaluate non-backdrivable gearing as an option, not a selected or qualified component.";
        attribute :>> evidenceNeeded = "Motor-off holding under shock, wear, temperature and lubrication changes; moving efficiency, controller demand, jam and power-loss recovery tests.";
        metadata rationale : ModelingMetadata::Rationale { text = "Zero motor holding current can reduce daily energy consumption, but gear friction and trim movement still consume energy. A locked gearbox retains the last mast angle and requires explicit storm and capsize assessment."; }
    }
    dependency holdingEnergy from holdingDrive to BlueDogRequirements::sustainedEnergyFeasibility;
    dependency holdingRecovery from holdingDrive to BlueDogRequirements::capsizeControlRecovery;
    dependency holdingCalculation from holdingDrive to MarineActuation::DrivePower;

    part aerodynamicScope : Decision {
        attribute :>> disposition = "Use restricted attached-flow VSPAERO sensitivity evidence with conservative sizing assumptions and separate actuator-moment uncertainty; no measured polar is available for this CAD.";
        attribute :>> evidenceNeeded = "Low-Reynolds-number viscous drag, stall, broadside response, thickness sensitivity and both-tack moment measurements; converged heel/wind/trim response across the sizing grid.";
        metadata rationale : ModelingMetadata::Rationale { text = "Potential-flow interpolation is suitable for a provisional force-balance model. Mesh convergence and direct candidate checks establish numerical consistency only. Rounded section ends and assumed wake attachment require physical validation; square-sail/downwind performance is not established by VLM."; }
    }
    dependency heelSensitivityEvidence from aerodynamicScope to BlueDogWingHeel::sweepInputs;
    dependency sizingAerodynamicPolicy from aerodynamicScope to BlueDogAerodynamicPolicy::sizing;
    dependency polarPurpose from aerodynamicScope to BlueDogRequirements::cruiseEvidence;
    dependency polarCalculation from aerodynamicScope to MarineSailing::Evaluate;

    part structuralScope : Decision {
        attribute :>> disposition = "Credit finite glass/epoxy laminate sections for bending; give printed substrate no bending-strength credit.";
        attribute :>> evidenceNeeded = "Wet/jointed coupon strength and stiffness, glass-to-print bonds, ribs, attachments, fatigue, buckling and impact tests.";
        metadata rationale : ModelingMetadata::Rationale { text = "Thin-wall inertia exceeded the solid-section bound in an earlier sizing trial. Polygon offsets now define finite-thickness section properties. Printed walls/ribs, seams and finish still contribute mass; preliminary material targets are not measured properties."; }
    }
    dependency structureChoice from structuralScope to BlueDogStructure::hybridConstruction;
    dependency structureCriteria from structuralScope to BlueDogStructure::structuralIntegrity;
    dependency structureCalculation from structuralScope to MarineStructures::DesignMargins;

    part recoveryScope : Decision {
        attribute :>> disposition = "Treat static full-roll restoring curves as screening evidence, separate from dynamic self-righting.";
        attribute :>> evidenceNeeded = "Dynamic releases, pitch stability, ingress/drainage, control restoration and credible failure-state geometry.";
        metadata rationale : ModelingMetadata::Rationale { text = "Positive sampled roll moments on a pitch-unstable equilibrium branch do not establish a recovery trajectory. Freely flooded material and fully retained water are distinct static sensitivities, not leakage or slosh predictions."; }
    }
    dependency recoveryCriteria from recoveryScope to BlueDogRequirements::selfRighting;
    dependency recoveryCalculation from recoveryScope to MarineHydrostatics::Balance;

    part energyEvidenceAcceptance : Decision {
        attribute :>> disposition = "Set evidenceAccepted only after review of evidence for the same installed configuration.";
        attribute :>> evidenceNeeded = "Non-overlapping installed-load coverage; measured power and duty bounds that preserve required functions; installed harvester route/season bounds including outages; temperature/end-of-service battery limits; conservative initial energy; consistent stored-energy and bus boundaries; interval resolution, uncertainty, repeat-cycle phase, source identifiers, configuration revision and review disposition.";
        metadata rationale : ModelingMetadata::Rationale { text = "A review Boolean does not automatically audit the records. Recovery demand is a battery withdrawal rate and its reserve stays inside usable capacity. Saving power by violating navigation, collision assessment, signaling, logging or communications does not establish sustained operation. A finite synthetic campaign cannot establish indefinite service."; }
    }
    dependency energyAcceptance from energyEvidenceAcceptance to BlueDogRequirements::energyEvidenceReadiness;
    dependency energyVerification from energyEvidenceAcceptance to BlueDogEnergy::SustainedEnergyVerification;

    part uncertaintyPolicy : Decision {
        attribute :>> disposition = "Separate nominal feasibility, adverse engineering sensitivities and physical qualification.";
        attribute :>> evidenceNeeded = "Measured uncertainty bounds and environmental exposure; hardware packaging/CG; robust feasibility with sufficient mission margins.";
        metadata rationale : ModelingMetadata::Rationale { text = "The size search is local and its variable brackets are numerical or model-domain limits. Mesh reserves are numerical allowances, not engineering safety factors. Sensitivity cases are not probabilities. Failed local operating solves do not prove physical impossibility or global infeasibility."; }
    }
    dependency uncertaintyCases from uncertaintyPolicy to BlueDogCoupledUncertainty::Inputs;
    dependency missionEvidence from uncertaintyPolicy to BlueDogRequirements::missionEvidence;
    part trafficCourtesy : Decision {
        attribute disposition :>> disposition = "Prefer safe, rule-consistent routes, operating windows and trajectories that reduce the likelihood of crewed vessels needing to maneuver. Accept delay or reduced mission progress to avoid developing encounters. Once encounter duties apply, preserve required predictable behavior and act when permitted or necessary; this is not an always-yield policy.";
        attribute evidenceNeeded :>> evidenceNeeded = "Compare alternatives against the same traffic scenarios using close-encounter exposure, predicted need for other-vessel action and mission delay, with explicit behavior and sensing assumptions. These are comparative design measures, not evidence of why another skipper acted or challenge pass/fail criteria. The preference is not yet implemented as a planner objective or validated by the existing replay.";
    }
    dependency courtesyWithinNavigationDuties from trafficCourtesy to GorgeChallenge::navigationRules;
    dependency courtesyCollisionSafety from trafficCourtesy to GorgeChallenge::trafficCoexistence;
}
