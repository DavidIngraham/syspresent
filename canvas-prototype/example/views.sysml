package BlueDogCanvasViews {
    private import StandardViewDefinitions::*;

    view challengeOverview : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose GorgeChallenge::transGorgeChallenge;
        expose GorgeChallenge::courseCompletion;
        expose GorgeChallenge::unassistedAttempt;
        expose GorgeChallenge::sailingPropulsion;
    }
    view rigAlternatives : GeneralView {
        filter @SysML::PartUsage or @SysML::Dependency;
        expose BlueDogDesignDecisions::sizingBaseline;
        expose BlueDogSailTrade::softSail;
        expose BlueDogSailTrade::tailWing;
        expose BlueDogSailTrade::camberedWing;
        expose BlueDogDesignDecisions::baselineCandidate;
        expose BlueDogDesignDecisions::retainedAlternative;
        expose BlueDogDesignDecisions::softSailAlternative;
    }
    view candidateDefinition : GeneralView {
        filter @SysML::PartUsage;
        expose BlueDogIC01::design;
        expose BlueDogIC01::integration;
        expose BlueDogPhysicalArchitecture::ic01;
    }

    view challengeTraffic : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose GorgeChallenge::trafficCoexistence;
        expose BlueDogRequirements::trafficSafety;
    }
    view trafficDerivation : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::trafficSafety;
        expose BlueDogRequirements::trafficTracking;
        expose BlueDogRequirements::collisionAssessmentCadence;
        expose BlueDogRequirements::avoidanceCommandDeadline;
        expose BlueDogRequirements::trafficAwarenessFault;
    }
    view recoveryBasis : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::safeRecovery;
        expose BlueDogRequirements::recoveryPropulsion;
        expose BlueDogRequirements::recoveryEnergy;
    }
    view capsizeQualification : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::capsizeControlRecovery;
        expose BlueDogRequirements::capsizeQualificationRetention;
    }
    view capsizeDecision : ActionFlowView {
        expose BlueDogMissionLogic::CapsizeDisposition;
    }
    view supervisorDecision : ActionFlowView {
        expose BlueDogMissionLogic::SupervisoryCycle;
    }

    // Curated views for the complete newcomer story. Native identities and relationships only.
    view story_qualifying_attempt : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose GorgeChallenge::unassistedAttempt;
        expose GorgeChallenge::sailingPropulsion;
        expose GorgeChallenge::unattachedPassage;
        expose GorgeChallenge::safetyCapabilityAbort;
        expose GorgeChallenge::communicationOutageAutonomy;
    }

    view story_gorge_environment : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::gorgeEnvironment;
        expose BlueDogRequirements::gorgeWind;
        expose BlueDogRequirements::gorgeWaves;
        expose BlueDogRequirements::gorgeCurrent;
        expose BlueDogRequirements::gorgeSurvivalWind;
    }

    view story_owner_constraints : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::desktopManufacture;
        expose BlueDogRequirements::transportability;
        expose BlueDogRequirements::serviceability;
        expose BlueDogStructure::hybridConstruction;
    }

    view story_system_obligations : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::roundTrip;
        expose BlueDogRequirements::navigationAndControl;
        expose BlueDogRequirements::energyAwareness;
        expose BlueDogRequirements::missionEvidence;
        expose BlueDogRequirements::marineDurability;
    }

    view story_normal_sailing : ActionFlowView {
        expose BlueDogMethod::Scenarios::NormalSailing;
    }

    view story_prepare_launch : ActionFlowView {
        expose BlueDogMethod::Scenarios::PrepareAndLaunch;
    }

    view story_logical_sailing : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDogLogicalArchitecture::LogicalVessel;
        expose BlueDogLogicalArchitecture::LogicalVessel::navigation;
        expose BlueDogLogicalArchitecture::LogicalVessel::wind;
        expose BlueDogLogicalArchitecture::LogicalVessel::supervision;
        expose BlueDogLogicalArchitecture::LogicalVessel::guidance;
        expose BlueDogLogicalArchitecture::LogicalVessel::actuation;
    }

    view story_logical_safety : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDogLogicalArchitecture::LogicalVessel;
        expose BlueDogLogicalArchitecture::LogicalVessel::safety;
        expose BlueDogLogicalArchitecture::LogicalVessel::energy;
        expose BlueDogLogicalArchitecture::LogicalVessel::collision;
        expose BlueDogLogicalArchitecture::LogicalVessel::recovery;
        expose BlueDogLogicalArchitecture::LogicalVessel::recording;
    }

    view story_drive_and_aerodynamics : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDogDesignDecisions::holdingDrive;
        expose BlueDogDesignDecisions::aerodynamicScope;
        expose BlueDogSailTrade::camberedWing;
    }

    view story_coupled_sizing : GeneralView {
        filter @SysML::PartUsage;
        expose BlueDogIC01::design;
        expose BlueDogConceptCredibility::passagePolicy;
        expose BlueDogDesignDecisions::uncertaintyPolicy;
        expose BlueDogDesignDecisions::structuralScope;
    }

    view story_glass_and_print : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogStructure::hybridConstruction;
        expose BlueDogStructure::structuralIntegrity;
        expose BlueDogStructure::bendingStrength;
        expose BlueDogStructure::bondProof;
        expose BlueDogStructure::wetCouponStiffness;
    }

    view story_water_weeds_service : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::enclosureSealing;
        expose BlueDogRequirements::wetMechanicalIntegrity;
        expose BlueDogRequirements::submergedWeedPassage;
        expose BlueDogRequirements::weedBlockageResponse;
        expose BlueDogRequirements::serviceability;
    }

    view story_finite_energy : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::multiDayEndurance;
        expose BlueDogRequirements::energyAwareness;
        expose BlueDogRequirements::conservativeEnergyEstimate;
        expose BlueDogRequirements::recoveryEnergy;
        expose BlueDogRequirements::lowEnergyRecovery;
    }

    view story_repeat_energy : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::sustainedEnergyFeasibility;
        expose BlueDogRequirements::sustainedReserveProtection;
        expose BlueDogRequirements::repeatableCycleBalance;
        expose BlueDogRequirements::peakSupplyCapability;
        expose BlueDogRequirements::energyEvidenceReadiness;
    }

    view story_primary_hardware : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDogPhysicalArchitecture::IC01Candidate;
        expose BlueDogPhysicalArchitecture::IC01Candidate::mainBattery;
        expose BlueDogPhysicalArchitecture::IC01Candidate::primaryNavigation;
        expose BlueDogPhysicalArchitecture::IC01Candidate::windSensor;
        expose BlueDogPhysicalArchitecture::IC01Candidate::primaryController;
        expose BlueDogPhysicalArchitecture::IC01Candidate::sailingActuators;
    }

    view story_recovery_hardware : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDogPhysicalArchitecture::IC01Candidate;
        expose BlueDogPhysicalArchitecture::IC01Candidate::recoveryBattery;
        expose BlueDogPhysicalArchitecture::IC01Candidate::recoveryNavigation;
        expose BlueDogPhysicalArchitecture::IC01Candidate::recoveryObservation;
        expose BlueDogPhysicalArchitecture::IC01Candidate::recoveryController;
        expose BlueDogPhysicalArchitecture::IC01Candidate::recoveryPropulsor;
    }

    view story_reset_and_records : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::resetRecovery;
        expose BlueDogRequirements::resetRestrictionPreservation;
        expose BlueDogRequirements::qualificationRestoration;
        expose BlueDogRequirements::gateProgressRestoration;
        expose BlueDogRequirements::missionEvidence;
    }

    view story_evidence_scope : GeneralView {
        filter @SysML::PartUsage;
        expose BlueDogIC01::design;
        expose BlueDogRisks::mission;
        expose BlueDogCurrentSizing::searchAssessment;
        expose BlueDogDesignDecisions::uncertaintyPolicy;
    }

    view story_failure_risk : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDogRisks::traffic;
        expose BlueDogRisks::recovery;
        expose BlueDogRisks::structure;
        expose BlueDogRisks::wing;
        expose BlueDogRisks::energy;
    }

    view story_verification_status : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDogRequirements::cruiseEvidence;
        expose BlueDogRequirements::reliabilityEvidence;
        expose BlueDogRequirements::criticalFailureDisposition;
        expose BlueDogRequirements::missionSuccessProbability;
    }

    view story_qualification_campaign : GeneralView {
        filter @SysML::VerificationCaseDefinition;
        expose BlueDogRequirementVerification::StructuralMaterialEvidence;
        expose BlueDogRequirementVerification::TrafficSafetyVerification;
        expose GorgeChallengeVerification::AutonomousShoreRecoveryVerification;
        expose GorgeChallengeVerification::PassageQualificationVerification;
    }

    view story_blue_dog_next : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose GorgeChallenge::transGorgeChallenge;
        expose BlueDogRequirements::cruiseEvidence;
        expose BlueDogRequirements::criticalFailureDisposition;
        expose BlueDogRequirements::oceanEnvironment;
    }
}
