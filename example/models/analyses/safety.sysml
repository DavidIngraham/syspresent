package BlueDogSafety {
    private import ScalarValues::*;
    doc /* Initial current-Gorge hazard/control argument, not complete coverage or
     * accepted risk. MIL-STD-882E Change1 sections 4.3 and Task106, NASA SE
     * Handbook6.4 and defense R&M BoK2025 inform the structure. Project scales
     * and acceptance responsibilities remain to be established; no DoD matrix
     * or authority is adopted. Proposed controls have no credited effectiveness. */
    part def HazardRecord {
        attribute identifier : String [1];
        ref part configuration : MarineDesign::Design [1] = BlueDogIC01::design;
        attribute condition : String [1];
        attribute potentialMishap : String [1];
        attribute modes : String [1];
        attribute ownerRole : String [1];
        attribute controlIntent : String [1];
        attribute implementationEvidenceAccepted : Boolean default = false;
        attribute effectivenessEvidenceAccepted : Boolean default = false;
        attribute residualRiskAssessmentAccepted : Boolean default = false;
        attribute riskDispositionAccepted : Boolean default = false;
        attribute controlEvidenceRecord : String [0..1];
        attribute acceptanceRecord : String [0..1];
        attribute acceptanceAuthority : String [0..1];
        attribute recordsIdentified : Boolean = SequenceFunctions::size(controlEvidenceRecord) == 1 and
            SequenceFunctions::size(acceptanceRecord) == 1 and SequenceFunctions::size(acceptanceAuthority) == 1 and
            controlEvidenceRecord->ControlFunctions::forAll { in value : String; value != "" } and
            acceptanceRecord->ControlFunctions::forAll { in value : String; value != "" } and
            acceptanceAuthority->ControlFunctions::forAll { in value : String; value != "" };
        attribute contextIdentified : Boolean = identifier != "" and condition != "" and potentialMishap != "" and
            modes != "" and ownerRole != "" and controlIntent != "";
        attribute closed : Boolean = contextIdentified and implementationEvidenceAccepted and effectivenessEvidenceAccepted and
            residualRiskAssessmentAccepted and riskDispositionAccepted and recordsIdentified;
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata risk : RiskMetadata::Risk;
        doc /* Closed is a modeled review precondition over supplied dispositions
         * and record identities. It does not inspect records or accept risk.
         * Existing RiskMetadata levels are unassessed, not a numerical hazard
         * matrix or a zero/low risk assertion. Contributor links describe credible
         * mechanisms, not probabilities or inevitable mishaps. */
    }
    part def HazardSet {
        ref part failureReview : FailureAnalysis::Review [1];
        part hazards : HazardRecord [1..*];
        attribute scopeReviewed : Boolean default = false;
    }
    part gorge : HazardSet {
        ref part :>> failureReview = BlueDogDFMEA::starter;
        part collisionExposure : HazardRecord subsets hazards {
            attribute :>> identifier = "HAZ-01";
            attribute :>> condition = "Unsafe motion or clearance in the presence of people, craft or their equipment";
            attribute :>> potentialMishap = "Collision, strike or entanglement affecting other waterway users";
            attribute :>> modes = "Sailing, holds, degraded operation and powered/unpowered recovery";
            attribute :>> ownerRole = "Safety/navigation";
            attribute :>> controlIntent = "Admit only supported sensing/maneuver conditions; preserve lookout/avoidance and assess the independent recovery path. Controls and secondary effects need evidence.";
        }
        part boundaryLoss : HazardRecord subsets hazards {
            attribute :>> identifier = "HAZ-02";
            attribute :>> condition = "Required navigation or control cannot retain the approved water envelope";
            attribute :>> potentialMishap = "Grounding or hazardous interaction with excluded waterway structures and traffic";
            attribute :>> modes = "Sailing, waiting, degraded navigation and recovery";
            attribute :>> ownerRole = "Navigation/recovery";
            attribute :>> controlIntent = "Validate the permitted domain and uncertainty; retain current observations, boundary supervision and a supported recovery response. A planner result alone is insufficient.";
        }
        part unintendedThrust : HazardRecord subsets hazards {
            attribute :>> identifier = "HAZ-03";
            attribute :>> condition = "Motor thrust is enabled without current safe authority or during human handling";
            attribute :>> potentialMishap = "Propeller/contact or entanglement exposure; unwanted propulsion also ends qualification";
            attribute :>> modes = "Launch, qualifying attempt, restart, recovery, capture and service";
            attribute :>> ownerRole = "Recovery/handling";
            attribute :>> controlIntent = "Establish current authority, known nonqualifying state, durable disqualification and effective isolation. Driver faults and handling exposure require physical controls and trials.";
        }
        part flotationRetentionLoss : HazardRecord subsets hazards {
            attribute :>> identifier = "HAZ-04";
            attribute :>> condition = "Casualty load or ingress defeats flotation or major-component retention";
            attribute :>> potentialMishap = "Vessel loss or released components/debris affecting people, property or the environment";
            attribute :>> modes = "Loaded operation, capsize, flooding, recovery and retrieval";
            attribute :>> ownerRole = "Hull/structure";
            attribute :>> controlIntent = "Establish configuration-specific flotation, load paths and retention under casualty exposure; assess hazards introduced by retention choices. Static intact volume alone is insufficient.";
        }
        part electricalThermalExposure : HazardRecord subsets hazards {
            attribute :>> identifier = "HAZ-05";
            attribute :>> condition = "Water, faults, charging or temperature compromise energy containment and required electrical function";
            attribute :>> potentialMishap = "Thermal/electrical/material exposure to people or vessel and loss of required functions";
            attribute :>> modes = "Charging, bench testing, operation, casualty recovery and service";
            attribute :>> ownerRole = "Power/system safety";
            attribute :>> controlIntent = "Evaluate design/containment/protection alternatives, ingress and thermal limits, supply transients and safe service isolation using the selected installation. No component or protection scheme is selected by this record.";
        }
        part handlingRetrievalExposure : HazardRecord subsets hazards {
            attribute :>> identifier = "HAZ-06";
            attribute :>> condition = "Approach, capture, retention or lifting cannot be completed with the admitted site and handling arrangement";
            attribute :>> potentialMishap = "Operator fall/contact/exposure or vessel escape during attempted retrieval";
            attribute :>> modes = "Transport, launch, shore capture, pickup and maintenance handling";
            attribute :>> ownerRole = "Owner/handling";
            attribute :>> controlIntent = "Review site access and handling design before relying on procedures; validate the full one-person task and retained vessel rather than approach alone. Preserve failed/incomplete trials.";
        }
    }
    analysis def SafetyReview {
        subject assessment : HazardSet;
        analysis failureModes : FailureAnalysis::DesignFailureReview { subject = assessment.failureReview; }
        out attribute hazardCount : Integer = SequenceFunctions::size(assessment.hazards);
        out attribute unresolvedHazardCount : Integer = NumericalFunctions::sum(
            assessment.hazards->ControlFunctions::collect { in hazard : HazardRecord; if hazard.closed ? 0 else 1 });
        out attribute hazardRecordsClosed : Boolean = hazardCount > 0 and
            assessment.hazards->ControlFunctions::forAll { in hazard : HazardRecord; hazard.closed };
        out attribute fmeaReady : Boolean = failureModes.reviewReady;
        out attribute reviewReady : Boolean = assessment.scopeReviewed and fmeaReady and hazardRecordsClosed;
        return ready : Boolean = reviewReady;
        doc /* Uses the native FMEA review and explicit hazard dispositions.
         * A successful calculation is not safety qualification or risk acceptance. */
    }
    analysis currentReview : SafetyReview { subject = gorge; }
    dependency dispositionBasis from SafetyReview to BlueDogRequirements::criticalFailureDisposition;
    metadata issue : ModelingMetadata::Issue {
        text = "S-01: Complete lifecycle/mode/human/environment hazard coverage, including manufacturing materials, storage, charging and disposal; the initial six hazards are not exhaustive. S-02: Establish likelihood/consequence/uncertainty and project risk criteria without treating unknown as low. S-03: Select and verify controls, secondary effects and common-cause isolation on the installed configuration. S-04: Record actual effectiveness evidence and residual-risk dispositions with the responsible authority; all current hazard and failure actions remain open. S-05: Justify non-overlapping critical-function rate terms, dependence/common-cause treatment and exposure/statistical applicability before crediting reliability evidence.";
    }
    dependency collisionExposureControl1 from gorge::collisionExposure to BlueDogRequirements::trafficSafety;
    dependency collisionExposureControl2 from gorge::collisionExposure to BlueDogRequirements::navigationAvailability;
    dependency collisionExposureVerification1 from gorge::collisionExposure to BlueDogRequirementVerification::TrafficSafetyVerification;
    dependency collisionExposureVerification2 from gorge::collisionExposure to GorgeChallengeVerification::WindSportEncounterVerification;
    dependency boundaryLossControl1 from gorge::boundaryLoss to BlueDogRequirements::operatingBoundary;
    dependency boundaryLossControl2 from gorge::boundaryLoss to GorgeChallenge::restrictedWaters;
    dependency boundaryLossVerification1 from gorge::boundaryLoss to BlueDogRequirementVerification::OperatingBoundaryVerification;
    dependency boundaryLossVerification2 from gorge::boundaryLoss to GorgeChallengeVerification::RestrictedWatersVerification;
    dependency unintendedThrustControl1 from gorge::unintendedThrust to BlueDogRequirements::challengeMotorInhibition;
    dependency unintendedThrustControl2 from gorge::unintendedThrust to BlueDogRequirements::motorIsolationDeadline;
    dependency unintendedThrustControl3 from gorge::unintendedThrust to BlueDogRequirements::qualificationPersistence;
    dependency unintendedThrustVerification1 from gorge::unintendedThrust to BlueDogVerificationPlanning::InterfaceAndDurabilityIntegrationVerification;
    dependency unintendedThrustVerification2 from gorge::unintendedThrust to BlueDogRequirementVerification::EmergencyControlVerification;
    dependency flotationRetentionLossControl1 from gorge::flotationRetentionLoss to GorgeChallenge::casualtyFlotation;
    dependency flotationRetentionLossControl2 from gorge::flotationRetentionLoss to GorgeChallenge::majorComponentRetention;
    dependency flotationRetentionLossControl3 from gorge::flotationRetentionLoss to BlueDogStructure::structuralIntegrity;
    dependency flotationRetentionLossVerification1 from gorge::flotationRetentionLoss to BlueDogRequirementVerification::FlotationEvidence;
    dependency flotationRetentionLossVerification2 from gorge::flotationRetentionLoss to GorgeChallengeVerification::MajorComponentRetentionVerification;
    dependency electricalThermalExposureControl1 from gorge::electricalThermalExposure to BlueDogRequirements::wetElectricalIntegrity;
    dependency electricalThermalExposureControl2 from gorge::electricalThermalExposure to BlueDogRequirements::peakSupplyCapability;
    dependency electricalThermalExposureControl3 from gorge::electricalThermalExposure to BlueDogRequirements::batteryChargeTemperatureInhibition;
    dependency electricalThermalExposureVerification1 from gorge::electricalThermalExposure to BlueDogRequirementVerification::WetElectricalIntegrityVerification;
    dependency electricalThermalExposureVerification2 from gorge::electricalThermalExposure to BlueDogRequirementVerification::PeakSupplyCapabilityVerification;
    dependency electricalThermalExposureVerification3 from gorge::electricalThermalExposure to BlueDogRequirementVerification::SolarHeatingVerification;
    dependency handlingRetrievalExposureControl1 from gorge::handlingRetrievalExposure to BlueDogRequirements::soloRetrieval;
    dependency handlingRetrievalExposureControl2 from gorge::handlingRetrievalExposure to BlueDogRequirements::transportability;
    dependency handlingRetrievalExposureControl3 from gorge::handlingRetrievalExposure to BlueDogStructure::launchClearance;
    dependency handlingRetrievalExposureVerification1 from gorge::handlingRetrievalExposure to BlueDogVerificationPlanning::HumanRecoveryUseValidation;
    dependency handlingRetrievalExposureVerification2 from gorge::handlingRetrievalExposure to BlueDogRequirementVerification::LaunchSiteEvidence;
    dependency handlingRetrievalExposureVerification3 from gorge::handlingRetrievalExposure to BlueDogRequirementVerification::TransportabilityVerification;

    dependency collisionExposureContributor1 from gorge::collisionExposure to BlueDogDFMEA::starter::steeringJam {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor2 from gorge::collisionExposure to BlueDogDFMEA::starter::sailJam {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor3 from gorge::collisionExposure to BlueDogDFMEA::starter::powerCommonCause {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor4 from gorge::collisionExposure to BlueDogDFMEA::starter::navigationFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor5 from gorge::collisionExposure to BlueDogDFMEA::starter::controlLockup {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor6 from gorge::collisionExposure to BlueDogDFMEA::starter::trafficMiss {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor7 from gorge::collisionExposure to BlueDogDFMEA::starter::commandContextFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency collisionExposureContributor8 from gorge::collisionExposure to BlueDogDFMEA::starter::commonSensingFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency boundaryLossContributor1 from gorge::boundaryLoss to BlueDogDFMEA::starter::steeringJam {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency boundaryLossContributor2 from gorge::boundaryLoss to BlueDogDFMEA::starter::powerCommonCause {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency boundaryLossContributor3 from gorge::boundaryLoss to BlueDogDFMEA::starter::navigationFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency boundaryLossContributor4 from gorge::boundaryLoss to BlueDogDFMEA::starter::controlLockup {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency boundaryLossContributor5 from gorge::boundaryLoss to BlueDogDFMEA::starter::commandContextFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency boundaryLossContributor6 from gorge::boundaryLoss to BlueDogDFMEA::starter::commonSensingFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency unintendedThrustContributor1 from gorge::unintendedThrust to BlueDogDFMEA::starter::motorUncommanded {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency unintendedThrustContributor2 from gorge::unintendedThrust to BlueDogDFMEA::starter::controlLockup {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency unintendedThrustContributor3 from gorge::unintendedThrust to BlueDogDFMEA::starter::commandContextFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency flotationRetentionLossContributor1 from gorge::flotationRetentionLoss to BlueDogDFMEA::starter::hullLeak {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency flotationRetentionLossContributor2 from gorge::flotationRetentionLoss to BlueDogDFMEA::starter::keelLoss {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency flotationRetentionLossContributor3 from gorge::flotationRetentionLoss to BlueDogDFMEA::starter::sailJam {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency electricalThermalExposureContributor1 from gorge::electricalThermalExposure to BlueDogDFMEA::starter::batteryFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency electricalThermalExposureContributor2 from gorge::electricalThermalExposure to BlueDogDFMEA::starter::hullLeak {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency electricalThermalExposureContributor3 from gorge::electricalThermalExposure to BlueDogDFMEA::starter::powerCommonCause {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency handlingRetrievalExposureContributor1 from gorge::handlingRetrievalExposure to BlueDogDFMEA::starter::recoveryCaptureFault {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
    dependency handlingRetrievalExposureContributor2 from gorge::handlingRetrievalExposure to BlueDogDFMEA::starter::steeringJam {
        metadata rationale : ModelingMetadata::Rationale { text = "Possible contributing mechanism in this hazard's stated modes; supporting basis, not an inevitable mishap or numerical probability."; }
    }
}
