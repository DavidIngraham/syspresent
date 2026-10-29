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
        filter @SysML::PartUsage or @SysML::ItemUsage or @SysML::Dependency;
        expose BlueDog::Decisions::Design::sizingBaseline;
        expose BlueDog::Analyses::SailTrade::softSail;
        expose BlueDog::Analyses::SailTrade::tailWing;
        expose BlueDog::Analyses::SailTrade::camberedWing;
        expose BlueDog::Decisions::Design::baselineCandidate;
        expose BlueDog::Decisions::Design::retainedAlternative;
        expose BlueDog::Decisions::Design::softSailAlternative;
    }
    view candidateDefinition : GeneralView {
        filter @SysML::PartUsage;
        expose BlueDog::Configurations::IC01::design;
        expose BlueDog::Configurations::IC01::integration;
        expose BlueDog::Architecture::Physical::ic01;
    }

    view challengeTraffic : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose GorgeChallenge::trafficCoexistence;
        expose BlueDog::Requirements::trafficSafety;
    }
    view trafficDerivation : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDog::Requirements::trafficSafety;
        expose BlueDog::Requirements::trafficTracking;
        expose BlueDog::Requirements::collisionAssessmentCadence;
        expose BlueDog::Requirements::avoidanceCommandDeadline;
        expose BlueDog::Requirements::trafficAwarenessFault;
    }
    view recoveryBasis : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDog::Requirements::recoveryPropulsion;
        expose BlueDog::Requirements::recoveryEnergy;
    }
    view capsizeQualification : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDog::Requirements::capsizeControlRecovery;
        expose BlueDog::Requirements::capsizeQualificationRetention;
    }
    view capsizeDecision : ActionFlowView {
        expose BlueDog::Behavior::MissionLogic::CapsizeDisposition;
    }
    view supervisorDecision : ActionFlowView {
        expose BlueDog::Behavior::MissionLogic::SupervisoryCycle;
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
        expose BlueDog::Requirements::gorgeEnvironment;
        expose BlueDog::Requirements::gorgeWind;
        expose BlueDog::Requirements::gorgeWaves;
        expose BlueDog::Requirements::gorgeCurrent;
        expose BlueDog::Requirements::gorgeSurvivalWind;
    }

    view story_owner_constraints : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::desktopManufacture;
        expose BlueDog::Requirements::transportability;
        expose BlueDog::Requirements::serviceability;
        expose BlueDog::Requirements::Structure::hybridConstruction;
    }

    view story_system_obligations : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::roundTrip;
        expose BlueDog::Requirements::navigationAndControl;
        expose BlueDog::Requirements::energyAwareness;
        expose BlueDog::Requirements::missionEvidence;
        expose BlueDog::Requirements::marineDurability;
    }

    view story_normal_sailing : ActionFlowView {
        expose BlueDog::Method::Scenarios::NormalSailing;
    }

    view story_prepare_launch : ActionFlowView {
        expose BlueDog::Method::Scenarios::PrepareAndLaunch;
    }

    view story_logical_sailing : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDog::Architecture::Logical::LogicalVessel;
        expose BlueDog::Architecture::Logical::LogicalVessel::navigation;
        expose BlueDog::Architecture::Logical::LogicalVessel::wind;
        expose BlueDog::Architecture::Logical::LogicalVessel::supervision;
        expose BlueDog::Architecture::Logical::LogicalVessel::guidance;
        expose BlueDog::Architecture::Logical::LogicalVessel::actuation;
    }

    view story_logical_safety : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDog::Architecture::Logical::LogicalVessel;
        expose BlueDog::Architecture::Logical::LogicalVessel::safety;
        expose BlueDog::Architecture::Logical::LogicalVessel::energy;
        expose BlueDog::Architecture::Logical::LogicalVessel::collision;
        expose BlueDog::Architecture::Logical::LogicalVessel::recovery;
        expose BlueDog::Architecture::Logical::LogicalVessel::recording;
    }

    view story_drive_and_aerodynamics : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDog::Decisions::Design::holdingDrive;
        expose BlueDog::Decisions::Design::aerodynamicScope;
        expose BlueDog::Analyses::SailTrade::camberedWing;
    }

    view story_coupled_sizing : GeneralView {
        filter @SysML::PartUsage;
        expose BlueDog::Configurations::IC01::design;
        expose BlueDog::Analyses::Sizing::Credibility::passagePolicy;
        expose BlueDog::Decisions::Design::uncertaintyPolicy;
        expose BlueDog::Decisions::Design::structuralScope;
    }

    view story_glass_and_print : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::Structure::hybridConstruction;
        expose BlueDog::Requirements::Structure::structuralIntegrity;
        expose BlueDog::Requirements::Structure::bendingStrength;
        expose BlueDog::Requirements::Structure::bondProof;
        expose BlueDog::Requirements::Structure::wetCouponStiffness;
    }

    view story_water_weeds_service : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::enclosureSealing;
        expose BlueDog::Requirements::wetMechanicalIntegrity;
        expose BlueDog::Requirements::submergedWeedPassage;
        expose BlueDog::Requirements::weedBlockageResponse;
        expose BlueDog::Requirements::serviceability;
    }

    view story_finite_energy : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::multiDayEndurance;
        expose BlueDog::Requirements::energyAwareness;
        expose BlueDog::Requirements::conservativeEnergyEstimate;
        expose BlueDog::Requirements::recoveryEnergy;
        expose BlueDog::Requirements::lowEnergyRecovery;
    }

    view story_repeat_energy : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::sustainedEnergyFeasibility;
        expose BlueDog::Requirements::sustainedReserveProtection;
        expose BlueDog::Requirements::repeatableCycleBalance;
        expose BlueDog::Requirements::peakSupplyCapability;
        expose BlueDog::Requirements::energyEvidenceReadiness;
    }

    view story_primary_hardware : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDog::Architecture::Physical::IC01Candidate;
        expose BlueDog::Architecture::Physical::IC01Candidate::mainBattery;
        expose BlueDog::Architecture::Physical::IC01Candidate::primaryNavigation;
        expose BlueDog::Architecture::Physical::IC01Candidate::windSensor;
        expose BlueDog::Architecture::Physical::IC01Candidate::primaryController;
        expose BlueDog::Architecture::Physical::IC01Candidate::sailingActuators;
    }

    view story_recovery_hardware : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDog::Architecture::Physical::IC01Candidate;
        expose BlueDog::Architecture::Physical::IC01Candidate::recoveryBattery;
        expose BlueDog::Architecture::Physical::IC01Candidate::recoveryNavigation;
        expose BlueDog::Architecture::Physical::IC01Candidate::recoveryObservation;
        expose BlueDog::Architecture::Physical::IC01Candidate::recoveryController;
        expose BlueDog::Architecture::Physical::IC01Candidate::recoveryPropulsor;
    }

    view story_reset_and_records : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::resetRecovery;
        expose BlueDog::Requirements::resetRestrictionPreservation;
        expose BlueDog::Requirements::qualificationRestoration;
        expose BlueDog::Requirements::gateProgressRestoration;
        expose BlueDog::Requirements::missionEvidence;
    }

    view story_evidence_scope : GeneralView {
        filter @SysML::PartUsage;
        expose BlueDog::Configurations::IC01::design;
        expose BlueDog::Analyses::DevelopmentRisks::mission;
        expose BlueDog::Evidence::CurrentSizing::searchAssessment;
        expose BlueDog::Decisions::Design::uncertaintyPolicy;
    }

    view story_failure_risk : GeneralView {
        filter @SysML::PartUsage or @SysML::PartDefinition;
        expose BlueDog::Analyses::DevelopmentRisks::traffic;
        expose BlueDog::Analyses::DevelopmentRisks::recovery;
        expose BlueDog::Analyses::DevelopmentRisks::structure;
        expose BlueDog::Analyses::DevelopmentRisks::wing;
        expose BlueDog::Analyses::DevelopmentRisks::energy;
    }

    view story_verification_status : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose BlueDog::Requirements::cruiseEvidence;
        expose BlueDog::Requirements::reliabilityEvidence;
        expose BlueDog::Requirements::criticalFailureDisposition;
        expose BlueDog::Requirements::missionSuccessProbability;
    }

    view story_qualification_campaign : GeneralView {
        filter @SysML::VerificationCaseDefinition;
        expose BlueDog::Verification::Requirements::StructuralMaterialEvidence;
        expose BlueDog::Verification::Requirements::TrafficSafetyVerification;
        expose BlueDog::Verification::Challenge::AutonomousShoreRecoveryVerification;
        expose BlueDog::Verification::Challenge::PassageQualificationVerification;
    }

    view story_blue_dog_next : GeneralView {
        filter @SysML::RequirementUsage;
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        expose GorgeChallenge::transGorgeChallenge;
        expose BlueDog::Requirements::cruiseEvidence;
        expose BlueDog::Requirements::criticalFailureDisposition;
        expose BlueDog::Requirements::oceanEnvironment;
    }
}
