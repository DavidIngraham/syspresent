package BlueDogRequirementBasis {
    private import ScalarValues::*;
    enum def Kind { ownerConstraint; functionalAcceptance; performanceAllocation; selectedStrategy; studyObjective; assuranceObligation; }
    metadata def Basis {
        attribute kind : Kind;
        attribute rationale : String;
    }
    metadata def StudyObjective :> Basis {
        attribute :>> kind = Kind::studyObjective;
    }
    metadata basis0 : Basis about BlueDogRequirements::DesktopManufacture { kind = Kind::ownerConstraint; rationale = "Explicit owner choices; retain independently of challenge-derived performance."; }
    metadata basis1 : Basis about BlueDogRequirements::Transportability { kind = Kind::ownerConstraint; rationale = "Explicit owner choices; retain independently of challenge-derived performance."; }
    metadata basis2 : Basis about BlueDogStructure::HybridConstruction { kind = Kind::ownerConstraint; rationale = "Explicit owner choices; retain independently of challenge-derived performance."; }
    metadata basis3 : Basis about BlueDogStructure::BendingStrength { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis4 : Basis about BlueDogStructure::PanelStrength { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis5 : Basis about BlueDogStructure::WetCouponStrength { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis6 : Basis about BlueDogStructure::WetCouponStiffness { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis7 : Basis about BlueDogStructure::AppendageDeflection { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis8 : Basis about BlueDogStructure::HullDeflection { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis9 : Basis about BlueDogStructure::PanelDeflection { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis10 : Basis about BlueDogStructure::LoadedFreeboard { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis11 : Basis about BlueDogStructure::ReserveBuoyancy { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis12 : Basis about BlueDogStructure::LaunchClearance { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis13 : Basis about BlueDogStructure::PrintTileEnvelope { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis14 : Basis about BlueDogRequirements::PrintedMaterialAging { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis15 : Basis about BlueDogRequirements::SelfRighting { kind = Kind::selectedStrategy; rationale = "Selected passive-righting concept; the challenge permits qualified limp recovery instead."; }
    metadata basis16 : Basis about BlueDogRequirements::LiftMass { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis17 : Basis about BlueDogRequirements::SetupDuration { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis18 : Basis about BlueDogRequirements::PackDuration { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis19 : Basis about BlueDogRequirements::WindSampleCadence { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis20 : Basis about BlueDogRequirements::WindSpeedAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis21 : Basis about BlueDogRequirements::WindDirectionAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis22 : Basis about BlueDogRequirements::PositionAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis23 : Basis about BlueDogRequirements::HeadingAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis24 : Basis about BlueDogRequirements::RightingDeadline { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    item materials : EngineeringDecisions::DecisionRecord {
        attribute :>> recordState = EngineeringDecisions::RecordState::workingDisposition;
        attribute :>> disposition = "10 GPa and 50 MPa remain unverified numerical inputs. Qualification may credit only supported wet/jointed material bounds; resize for measured properties.";
        attribute :>> evidenceNeeded = "Directional production coupons, exposure, joint/process variability and conservative allowable/stiffness bounds.";
    }
    item structuralScreens : EngineeringDecisions::DecisionRecord {
        attribute :>> recordState = EngineeringDecisions::RecordState::workingDisposition;
        attribute :>> disposition = "Keep the numerical screening policy explicit: 2/0.5/1 percent deflection, 10 kPa pressure, 100 N proof probe, 50 mm freeboard and 100 percent intact reserve are provisional study controls.";
        attribute :>> evidenceNeeded = "Mission load cases, deformed-foil/control and sealing/clearance sensitivity, attachment loads and casualty flotation. Screen passes do not close these requirements.";
    }
    item manufactureAndSites : EngineeringDecisions::DecisionRecord {
        attribute :>> recordState = EngineeringDecisions::RecordState::workingDisposition;
        attribute :>> disposition = "250 mm print jobs and one-person handling remain owner constraints. A 230 mm tile and a 1.5 m launch depth with 0.3 m clearance are changeable analysis assumptions.";
        attribute :>> evidenceNeeded = "Sliced job envelopes including supports and actual site/depth/appendage clearance evidence.";
    }
    item aging : EngineeringDecisions::DecisionRecord {
        attribute :>> recordState = EngineeringDecisions::RecordState::workingDisposition;
        attribute :>> disposition = "Accept aged material against the capacity credited to the design, not 80 percent of an unaged coupon. Establish mission-representative exposure; 300 MJ/m2 was an unvalidated accelerated-test dose.";
        attribute :>> evidenceNeeded = "Exposure equivalence and aged production-component load bounds; no relative-retention target substitutes for structural adequacy.";
    }
    item retainedAllocations : EngineeringDecisions::DecisionRecord {
        attribute :>> recordState = EngineeringDecisions::RecordState::workingDisposition;
        attribute :>> disposition = "Retain safety behavior, environmental qualification profiles, sensing/control timing and accuracy, handling targets and the provisional mission-reliability objective. These are performance allocations, not material or architecture mandates.";
        attribute :>> evidenceNeeded = "Validation of the allocated numbers against handling, control sensitivity and mission/encounter analysis; they are not uniquely derived by arithmetic from the challenge.";
    }
    item recoveryStrategy : EngineeringDecisions::DecisionRecord {
        attribute :>> recordState = EngineeringDecisions::RecordState::workingDisposition;
        attribute :>> disposition = "Treat passive self-righting as a selected vehicle strategy. The Gorge challenge also admits demonstrated autonomous limp recovery after abort.";
        attribute :>> evidenceNeeded = "Concept-specific capsize and shore-recovery demonstrations, including impaired equipment; retain current numerical recovery screens without claiming universal necessity.";
    }
    dependency materialStudy from materials to BlueDogStructuralBasis::Inputs;
    dependency materialAcceptance from materials to BlueDogStructure::wetCouponStiffness;
    dependency strengthAcceptance from materials to BlueDogStructure::wetCouponStrength;
    dependency screenPurpose from structuralScreens to BlueDogStructure::structuralIntegrity;
    dependency printerChoice from manufactureAndSites to BlueDogRequirements::desktopManufacture;
    dependency agedCapacity from aging to BlueDogRequirements::printedMaterialAging;
    dependency rightingChoice from recoveryStrategy to BlueDogRequirements::selfRighting;

    metadata basisServiceability : Basis about BlueDogRequirements::Serviceability { kind = Kind::ownerConstraint; rationale = "Between-deployment access and replacement are owner lifecycle constraints; successful unassisted passage does not imply serviceability."; }
    metadata basisMissionSuccessProbability : StudyObjective about BlueDogRequirements::MissionSuccessProbability { rationale = "Provisional reliability-study objective. Its numerical target and distribution assumptions do not govern finite Gorge qualification and require an accepted mission-specific evidence basis before adoption."; }
    metadata basisFailureRateBudget : StudyObjective about BlueDogRequirements::FailureRateBudget { rationale = "Provisional reliability-study objective. Its numerical target and distribution assumptions do not govern finite Gorge qualification and require an accepted mission-specific evidence basis before adoption."; }
    metadata basisCapsizeControlRecovery : Basis about BlueDogRequirements::CapsizeControlRecovery { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisCapsizeRigRetention : Basis about BlueDogRequirements::CapsizeRigRetention { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisCapsizeBallastRetention : Basis about BlueDogRequirements::CapsizeBallastRetention { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisCapsizeElectronicsSealing : Basis about BlueDogRequirements::CapsizeElectronicsSealing { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisControlRecoveryDeadline : Basis about BlueDogRequirements::ControlRecoveryDeadline { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisCapsizeGateProgressRetention : Basis about BlueDogRequirements::CapsizeGateProgressRetention { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisCapsizeQualificationRetention : Basis about BlueDogRequirements::CapsizeQualificationRetention { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisCapsizeRestrictionRetention : Basis about BlueDogRequirements::CapsizeRestrictionRetention { kind = Kind::selectedStrategy; rationale = "Acceptance belongs to the selected N-051 passive-righting campaign. The independent challenge admits qualified post-abort limp recovery; this does not impose passive righting on every candidate architecture."; }
    metadata basisEnergyEvidenceReadiness : Basis about BlueDogRequirements::EnergyEvidenceReadiness { kind = Kind::assuranceObligation; rationale = "This constrains the evidence or assessment process. A completed analysis or reviewed statement is distinct from installed-vessel physical qualification."; }
    metadata basisRegulatoryClassification : Basis about BlueDogRequirements::RegulatoryClassification { kind = Kind::assuranceObligation; rationale = "This constrains the evidence or assessment process. A completed analysis or reviewed statement is distinct from installed-vessel physical qualification."; }
    metadata basisReliabilityEvidence : Basis about BlueDogRequirements::ReliabilityEvidence { kind = Kind::assuranceObligation; rationale = "This constrains the evidence or assessment process. A completed analysis or reviewed statement is distinct from installed-vessel physical qualification."; }
    metadata basisCruiseEvidence : Basis about BlueDogRequirements::CruiseEvidence { kind = Kind::assuranceObligation; rationale = "This constrains the evidence or assessment process. A completed analysis or reviewed statement is distinct from installed-vessel physical qualification."; }
    metadata basisLegProgress : Basis about BlueDogRequirements::LegProgress { kind = Kind::assuranceObligation; rationale = "This constrains the evidence or assessment process. A completed analysis or reviewed statement is distinct from installed-vessel physical qualification."; }
    metadata basisEnergyEstimateCadence : Basis about BlueDogRequirements::EnergyEstimateCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisReserveEstimateCadence : Basis about BlueDogRequirements::ReserveEstimateCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisEnergyEstimateAccuracy : Basis about BlueDogRequirements::EnergyEstimateAccuracy { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisGuidanceUpdateCadence : Basis about BlueDogRequirements::GuidanceUpdateCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSailCommandCadence : Basis about BlueDogRequirements::SailCommandCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSteeringCommandCadence : Basis about BlueDogRequirements::SteeringCommandCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisRestartDeadline : Basis about BlueDogRequirements::RestartDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisLowEnergyEntry : Basis about BlueDogRequirements::LowEnergyEntry { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisLowEnergyExit : Basis about BlueDogRequirements::LowEnergyExit { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisTelemetryDeliveryCadence : Basis about BlueDogRequirements::TelemetryDeliveryCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisOutageAutonomy : Basis about BlueDogRequirements::OutageAutonomy { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisIngressDetection : Basis about BlueDogRequirements::IngressDetection { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisPeriodicLogCadence : Basis about BlueDogRequirements::PeriodicLogCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisLogRetention : Basis about BlueDogRequirements::LogRetention { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisLogTimestampAccuracy : Basis about BlueDogRequirements::LogTimestampAccuracy { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisLogInterruptionDurability : Basis about BlueDogRequirements::LogInterruptionDurability { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisNavigationValidEpochs : Basis about BlueDogRequirements::NavigationValidEpochs { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisStaleNavigationInvalidation : Basis about BlueDogRequirements::StaleNavigationInvalidation { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisNavigationDegradedTransition : Basis about BlueDogRequirements::NavigationDegradedTransition { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisReplacementDuration : Basis about BlueDogRequirements::ReplacementDuration { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSoloTransport : Basis about BlueDogRequirements::SoloTransport { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisCollisionAssessmentCadence : Basis about BlueDogRequirements::CollisionAssessmentCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisAvoidanceCommandDeadline : Basis about BlueDogRequirements::AvoidanceCommandDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisTrafficAwarenessFault : Basis about BlueDogRequirements::TrafficAwarenessFault { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisBoundaryEvaluationCadence : Basis about BlueDogRequirements::BoundaryEvaluationCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisBoundaryAvoidanceDeadline : Basis about BlueDogRequirements::BoundaryAvoidanceDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisAbortLatchDeadline : Basis about BlueDogRequirements::AbortLatchDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisRecoveryTelemetryCadence : Basis about BlueDogRequirements::RecoveryTelemetryCadence { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisMotorIsolationDeadline : Basis about BlueDogRequirements::MotorIsolationDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisManualControlLossShutdown : Basis about BlueDogRequirements::ManualControlLossShutdown { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSignalingModeDeadline : Basis about BlueDogRequirements::SignalingModeDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSignalingFaultRecording : Basis about BlueDogRequirements::SignalingFaultRecording { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSignalingFaultReporting : Basis about BlueDogRequirements::SignalingFaultReporting { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisExpiredCommandRejection : Basis about BlueDogRequirements::ExpiredCommandRejection { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisAcceptedCommandDeadline : Basis about BlueDogRequirements::AcceptedCommandDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisOnboardAcknowledgmentDeadline : Basis about BlueDogRequirements::OnboardAcknowledgmentDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisGorgeWind : Basis about BlueDogRequirements::GorgeWind { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisGorgeWaves : Basis about BlueDogRequirements::GorgeWaves { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisGorgeCurrent : Basis about BlueDogRequirements::GorgeCurrent { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisGorgeSurvivalWind : Basis about BlueDogRequirements::GorgeSurvivalWind { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisGorgeSurvivalWaves : Basis about BlueDogRequirements::GorgeSurvivalWaves { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisAirTemperature : Basis about BlueDogRequirements::AirTemperature { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWaterTemperature : Basis about BlueDogRequirements::WaterTemperature { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisHumidity : Basis about BlueDogRequirements::Humidity { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisVisibility : Basis about BlueDogRequirements::Visibility { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisCalmOperation : Basis about BlueDogRequirements::CalmOperation { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisEnvelopeTransition : Basis about BlueDogRequirements::EnvelopeTransition { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisEnclosureSealing : Basis about BlueDogRequirements::EnclosureSealing { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSolarHeating : Basis about BlueDogRequirements::SolarHeating { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSubmergedWeedPassage : Basis about BlueDogRequirements::SubmergedWeedPassage { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedSnagShedding : Basis about BlueDogRequirements::WeedSnagShedding { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedBlockageResponse : Basis about BlueDogRequirements::WeedBlockageResponse { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisRecoveryPropulsorWeeds : Basis about BlueDogRequirements::RecoveryPropulsorWeeds { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisRestrictedVisibilityEntry : Basis about BlueDogRequirements::RestrictedVisibilityEntry { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSurvivalEntryDeadline : Basis about BlueDogRequirements::SurvivalEntryDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisSailingResumptionDeadline : Basis about BlueDogRequirements::SailingResumptionDeadline { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWetConductorResistance : Basis about BlueDogRequirements::WetConductorResistance { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWetInsulationResistance : Basis about BlueDogRequirements::WetInsulationResistance { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedPassageSpeed : Basis about BlueDogRequirements::WeedPassageSpeed { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedPassageSteering : Basis about BlueDogRequirements::WeedPassageSteering { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedSnagSpeedRecovery : Basis about BlueDogRequirements::WeedSnagSpeedRecovery { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedSnagSteeringRecovery : Basis about BlueDogRequirements::WeedSnagSteeringRecovery { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedBlockageFault : Basis about BlueDogRequirements::WeedBlockageFault { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWeedBlockageContingency : Basis about BlueDogRequirements::WeedBlockageContingency { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisPoweredWeedSpeed : Basis about BlueDogRequirements::PoweredWeedSpeed { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisLockedPropulsorShutdown : Basis about BlueDogRequirements::LockedPropulsorShutdown { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWindStaleInvalidation : Basis about BlueDogRequirements::WindStaleInvalidation { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata basisWindLossResponse : Basis about BlueDogRequirements::WindLossResponse { kind = Kind::performanceAllocation; rationale = "Retained baseline acceptance allocation under its stated campaign and mode conditions. The numerical limit is not uniquely implied by mission success; justify it through control, encounter, environmental or handling evidence before design release."; }
    metadata def ProcessObligation {
        attribute responsibleRole : String;
        attribute output : String;
        attribute acceptance : String;
    }
    metadata def AllocationDecision :> EngineeringDecisions::AllocationReview;

    metadata processRegulatoryClassification : ProcessObligation about BlueDogRequirements::RegulatoryClassification {
        responsibleRole = "Project owner"; output = "Deployment compliance assessment"; acceptance = "Configuration-specific applicable navigation, radio and authorization evidence reviewed before deployment.";
    }
    metadata processDeploymentComplianceRecord : ProcessObligation about BlueDogRequirements::DeploymentComplianceRecord {
        responsibleRole = "Project owner"; output = "Deployment compliance record"; acceptance = "Identify the governing matrix, evidence, authority and unresolved exclusions.";
    }
    metadata processDeploymentReleaseGate : ProcessObligation about BlueDogRequirements::DeploymentReleaseGate {
        responsibleRole = "Project owner"; output = "Deployment release decision"; acceptance = "Reject unresolved applicable compliance obligations.";
    }
    metadata processLegProgress : ProcessObligation about BlueDogRequirements::LegProgress {
        responsibleRole = "Project owner, mission assessment"; output = "Reproducible whole-route scenario assessment"; acceptance = "Include sailing legs, holds, maneuvers and failed routes; no fixed speed floor.";
    }
    metadata processCruiseEvidence : ProcessObligation about BlueDogRequirements::CruiseEvidence {
        responsibleRole = "Project owner, mission assessment"; output = "Configuration-specific mission performance evidence"; acceptance = "Review route ensemble coverage and installed validity; calculations alone do not accept evidence.";
    }
    metadata processReliabilityEvidence : ProcessObligation about BlueDogRequirements::ReliabilityEvidence {
        responsibleRole = "Project owner, reliability assessment"; output = "Reliability evidence argument"; acceptance = "Review mission-critical functions, exposure, rates, dependence and evidence applicability independently of provisional targets.";
    }
    metadata processCriticalFailureDisposition : ProcessObligation about BlueDogRequirements::CriticalFailureDisposition {
        responsibleRole = "Project owner, safety assessment"; output = "Failure dispositions"; acceptance = "Resolve applicable critical failure and common-cause actions before release.";
    }
    metadata processEnergyEvidenceReadiness : ProcessObligation about BlueDogRequirements::EnergyEvidenceReadiness {
        responsibleRole = "Project owner, energy assessment"; output = "Energy-case acceptance record"; acceptance = "Identify accepted installed loads, resource bounds, battery derating and interval resolution evidence.";
    }
    metadata processNavigationRuleApplicability : ProcessObligation about GorgeChallenge::NavigationRuleApplicability {
        responsibleRole = "Entrant"; output = "NavigationRuleApplicability record for the identified configuration and attempt"; acceptance = "Review the requirement conditions using the entry/adjudication verification case; no accepted evidence is implied by this role assignment.";
    }
    metadata processNavigationRuleBaseline : ProcessObligation about GorgeChallenge::NavigationRuleBaseline {
        responsibleRole = "Organizer"; output = "NavigationRuleBaseline record for the identified configuration and attempt"; acceptance = "Review the requirement conditions using the entry/adjudication verification case; no accepted evidence is implied by this role assignment.";
    }
    metadata processNavigationEntryEvidence : ProcessObligation about GorgeChallenge::NavigationEntryEvidence {
        responsibleRole = "Organizer"; output = "NavigationEntryEvidence record for the identified configuration and attempt"; acceptance = "Review the requirement conditions using the entry/adjudication verification case; no accepted evidence is implied by this role assignment.";
    }
    metadata processOperatorSafetyIntervention : ProcessObligation about GorgeChallenge::OperatorSafetyIntervention {
        responsibleRole = "Operator"; output = "OperatorSafetyIntervention record for the identified configuration and attempt"; acceptance = "Review the requirement conditions using the entry/adjudication verification case; no accepted evidence is implied by this role assignment.";
    }
    metadata processNavigationAdjudication : ProcessObligation about GorgeChallenge::NavigationAdjudication {
        responsibleRole = "Organizer"; output = "NavigationAdjudication record for the identified configuration and attempt"; acceptance = "Review the requirement conditions using the entry/adjudication verification case; no accepted evidence is implied by this role assignment.";
    }

    metadata decisionLiftMass : AllocationDecision about BlueDogRequirements::LiftMass {
        source = "Retained baseline P-102; BlueDogRequirementBasis::basis16 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "P-102 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in P-102 LiftMass; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for P-102; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TransportabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of P-102: Measure timed handling tasks, carried loads and setup interfaces with one adult and permitted aids; compare the selected limit with repeatability, fatigue and launch/retrieval conditions. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSetupDuration : AllocationDecision about BlueDogRequirements::SetupDuration {
        source = "Retained baseline P-103; BlueDogRequirementBasis::basis17 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "P-103 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in P-103 SetupDuration; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for P-103; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TransportabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of P-103: Measure timed handling tasks, carried loads and setup interfaces with one adult and permitted aids; compare the selected limit with repeatability, fatigue and launch/retrieval conditions. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionPackDuration : AllocationDecision about BlueDogRequirements::PackDuration {
        source = "Retained baseline P-104; BlueDogRequirementBasis::basis18 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "P-104 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in P-104 PackDuration; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for P-104; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TransportabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of P-104: Measure timed handling tasks, carried loads and setup interfaces with one adult and permitted aids; compare the selected limit with repeatability, fatigue and launch/retrieval conditions. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWindSampleCadence : AllocationDecision about BlueDogRequirements::WindSampleCadence {
        source = "Retained baseline E-146; BlueDogRequirementBasis::basis19 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-146 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-146 WindSampleCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-146; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WindObservationVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-146: Correlate the installed wind observation with a traceable reference across the declared flow/heel/trim matrix; reconcile local apparent-wind errors and the 10 m true-wind admission estimate before accepting the limit. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWindSpeedAccuracy : AllocationDecision about BlueDogRequirements::WindSpeedAccuracy {
        source = "Retained baseline E-147; BlueDogRequirementBasis::basis20 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-147 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-147 WindSpeedAccuracy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-147; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WindObservationVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-147: Correlate the installed wind observation with a traceable reference across the declared flow/heel/trim matrix; reconcile local apparent-wind errors and the 10 m true-wind admission estimate before accepting the limit. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWindDirectionAccuracy : AllocationDecision about BlueDogRequirements::WindDirectionAccuracy {
        source = "Retained baseline E-148; BlueDogRequirementBasis::basis21 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-148 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-148 WindDirectionAccuracy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-148; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WindObservationVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-148: Correlate the installed wind observation with a traceable reference across the declared flow/heel/trim matrix; reconcile local apparent-wind errors and the 10 m true-wind admission estimate before accepting the limit. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionPositionAccuracy : AllocationDecision about BlueDogRequirements::PositionAccuracy {
        source = "Retained baseline E-108; BlueDogRequirementBasis::basis22 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-108 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-108 PositionAccuracy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-108; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAndControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-108: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionHeadingAccuracy : AllocationDecision about BlueDogRequirements::HeadingAccuracy {
        source = "Retained baseline E-109; BlueDogRequirementBasis::basis23 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-109 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-109 HeadingAccuracy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-109; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAndControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-109: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionRightingDeadline : AllocationDecision about BlueDogRequirements::RightingDeadline {
        source = "Retained baseline N-118; BlueDogRequirementBasis::basis24 records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-118 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-118 RightingDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-118; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::SelfRightingVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-118: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionEnergyEstimateCadence : AllocationDecision about BlueDogRequirements::EnergyEstimateCadence {
        source = "Retained baseline E-101; BlueDogRequirementBasis::basisEnergyEstimateCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-101 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-101 EnergyEstimateCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-101; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnergyAwarenessVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-101: Correlate installed energy estimates and reserve timing with calibrated withdrawal and temperature/aging evidence; compare the selected bound with route-dependent recovery margin. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionReserveEstimateCadence : AllocationDecision about BlueDogRequirements::ReserveEstimateCadence {
        source = "Retained baseline E-102; BlueDogRequirementBasis::basisReserveEstimateCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-102 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-102 ReserveEstimateCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-102; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnergyAwarenessVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-102: Correlate installed energy estimates and reserve timing with calibrated withdrawal and temperature/aging evidence; compare the selected bound with route-dependent recovery margin. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionEnergyEstimateAccuracy : AllocationDecision about BlueDogRequirements::EnergyEstimateAccuracy {
        source = "Retained baseline E-103; BlueDogRequirementBasis::basisEnergyEstimateAccuracy records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-103 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-103 EnergyEstimateAccuracy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-103; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnergyAwarenessVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-103: Correlate installed energy estimates and reserve timing with calibrated withdrawal and temperature/aging evidence; compare the selected bound with route-dependent recovery margin. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionGuidanceUpdateCadence : AllocationDecision about BlueDogRequirements::GuidanceUpdateCadence {
        source = "Retained baseline E-105; BlueDogRequirementBasis::basisGuidanceUpdateCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-105 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-105 GuidanceUpdateCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-105; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAndControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-105: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSailCommandCadence : AllocationDecision about BlueDogRequirements::SailCommandCadence {
        source = "Retained baseline E-106; BlueDogRequirementBasis::basisSailCommandCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-106 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-106 SailCommandCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-106; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAndControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-106: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSteeringCommandCadence : AllocationDecision about BlueDogRequirements::SteeringCommandCadence {
        source = "Retained baseline E-107; BlueDogRequirementBasis::basisSteeringCommandCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-107 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-107 SteeringCommandCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-107; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAndControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-107: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionRestartDeadline : AllocationDecision about BlueDogRequirements::RestartDeadline {
        source = "Retained baseline E-110; BlueDogRequirementBasis::basisRestartDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-110 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-110 RestartDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-110; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::ResetRecoveryVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-110: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionLowEnergyEntry : AllocationDecision about BlueDogRequirements::LowEnergyEntry {
        source = "Retained baseline E-114; BlueDogRequirementBasis::basisLowEnergyEntry records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-114 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-114 LowEnergyEntry; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-114; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::LowEnergyRecoveryVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-114: Correlate installed energy estimates and reserve timing with calibrated withdrawal and temperature/aging evidence; compare the selected bound with route-dependent recovery margin. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionLowEnergyExit : AllocationDecision about BlueDogRequirements::LowEnergyExit {
        source = "Retained baseline E-118; BlueDogRequirementBasis::basisLowEnergyExit records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-118 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-118 LowEnergyExit; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-118; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::LowEnergyRecoveryVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-118: Correlate installed energy estimates and reserve timing with calibrated withdrawal and temperature/aging evidence; compare the selected bound with route-dependent recovery margin. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionTelemetryDeliveryCadence : AllocationDecision about BlueDogRequirements::TelemetryDeliveryCadence {
        source = "Retained baseline E-120; BlueDogRequirementBasis::basisTelemetryDeliveryCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-120 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-120 TelemetryDeliveryCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-120; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::LowEnergyRecoveryVerification; BlueDogRequirementVerification::CommunicationsVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-120: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionOutageAutonomy : AllocationDecision about BlueDogRequirements::OutageAutonomy {
        source = "Retained baseline E-121; BlueDogRequirementBasis::basisOutageAutonomy records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-121 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-121 OutageAutonomy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-121; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::CommunicationsVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-121: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionIngressDetection : AllocationDecision about BlueDogRequirements::IngressDetection {
        source = "Retained baseline E-125; BlueDogRequirementBasis::basisIngressDetection records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-125 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-125 IngressDetection; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-125; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::IngressResponseVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-125: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionPeriodicLogCadence : AllocationDecision about BlueDogRequirements::PeriodicLogCadence {
        source = "Retained baseline E-130; BlueDogRequirementBasis::basisPeriodicLogCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-130 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-130 PeriodicLogCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-130; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::LowEnergyRecoveryVerification; BlueDogRequirementVerification::MissionEvidenceVerification; BlueDogRequirementVerification::EmergencyControlVerification; BlueDogRequirementVerification::EnvelopeTransitionVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-130: Interrupt power, reset and communications at the recording boundaries; measure lost history, timestamp uncertainty and replay behavior against the selected bound. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionLogRetention : AllocationDecision about BlueDogRequirements::LogRetention {
        source = "Retained baseline E-131; BlueDogRequirementBasis::basisLogRetention records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-131 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-131 LogRetention; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-131; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::CommunicationsVerification; BlueDogRequirementVerification::MissionEvidenceVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-131: Interrupt power, reset and communications at the recording boundaries; measure lost history, timestamp uncertainty and replay behavior against the selected bound. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionLogTimestampAccuracy : AllocationDecision about BlueDogRequirements::LogTimestampAccuracy {
        source = "Retained baseline E-133; BlueDogRequirementBasis::basisLogTimestampAccuracy records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-133 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-133 LogTimestampAccuracy; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-133; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::MissionEvidenceVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-133: Interrupt power, reset and communications at the recording boundaries; measure lost history, timestamp uncertainty and replay behavior against the selected bound. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionLogInterruptionDurability : AllocationDecision about BlueDogRequirements::LogInterruptionDurability {
        source = "Retained baseline E-136; BlueDogRequirementBasis::basisLogInterruptionDurability records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-136 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-136 LogInterruptionDurability; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-136; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::ResetRecoveryVerification; BlueDogRequirementVerification::MissionEvidenceVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-136: Interrupt power, reset and communications at the recording boundaries; measure lost history, timestamp uncertainty and replay behavior against the selected bound. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionNavigationValidEpochs : AllocationDecision about BlueDogRequirements::NavigationValidEpochs {
        source = "Retained baseline E-140; BlueDogRequirementBasis::basisNavigationValidEpochs records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-140 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-140 NavigationValidEpochs; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-140; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAvailabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-140: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionStaleNavigationInvalidation : AllocationDecision about BlueDogRequirements::StaleNavigationInvalidation {
        source = "Retained baseline E-141; BlueDogRequirementBasis::basisStaleNavigationInvalidation records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-141 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-141 StaleNavigationInvalidation; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-141; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAvailabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-141: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionNavigationDegradedTransition : AllocationDecision about BlueDogRequirements::NavigationDegradedTransition {
        source = "Retained baseline E-142; BlueDogRequirementBasis::basisNavigationDegradedTransition records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-142 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-142 NavigationDegradedTransition; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-142; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationAvailabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-142: Measure installed command/observation refresh and fault-transition latency at the declared interface; compare the selected bound with achieved control response and interacting-fault safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionReplacementDuration : AllocationDecision about BlueDogRequirements::ReplacementDuration {
        source = "Retained baseline P-107; BlueDogRequirementBasis::basisReplacementDuration records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "P-107 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in P-107 ReplacementDuration; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for P-107; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::ServiceabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of P-107: Measure timed handling tasks, carried loads and setup interfaces with one adult and permitted aids; compare the selected limit with repeatability, fatigue and launch/retrieval conditions. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSoloTransport : AllocationDecision about BlueDogRequirements::SoloTransport {
        source = "Retained baseline P-101; BlueDogRequirementBasis::basisSoloTransport records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "P-101 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in P-101 SoloTransport; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for P-101; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TransportabilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of P-101: Measure timed handling tasks, carried loads and setup interfaces with one adult and permitted aids; compare the selected limit with repeatability, fatigue and launch/retrieval conditions. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionCollisionAssessmentCadence : AllocationDecision about BlueDogRequirements::CollisionAssessmentCadence {
        source = "Retained baseline S-102; BlueDogRequirementBasis::basisCollisionAssessmentCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-102 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-102 CollisionAssessmentCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-102; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TrafficSafetyVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-102: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionAvoidanceCommandDeadline : AllocationDecision about BlueDogRequirements::AvoidanceCommandDeadline {
        source = "Retained baseline S-103; BlueDogRequirementBasis::basisAvoidanceCommandDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-103 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-103 AvoidanceCommandDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-103; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TrafficSafetyVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-103: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionTrafficAwarenessFault : AllocationDecision about BlueDogRequirements::TrafficAwarenessFault {
        source = "Retained baseline S-104; BlueDogRequirementBasis::basisTrafficAwarenessFault records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-104 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-104 TrafficAwarenessFault; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-104; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::TrafficSafetyVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-104: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionBoundaryEvaluationCadence : AllocationDecision about BlueDogRequirements::BoundaryEvaluationCadence {
        source = "Retained baseline S-105; BlueDogRequirementBasis::basisBoundaryEvaluationCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-105 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-105 BoundaryEvaluationCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-105; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::OperatingBoundaryVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-105: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionBoundaryAvoidanceDeadline : AllocationDecision about BlueDogRequirements::BoundaryAvoidanceDeadline {
        source = "Retained baseline S-106; BlueDogRequirementBasis::basisBoundaryAvoidanceDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-106 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-106 BoundaryAvoidanceDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-106; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::OperatingBoundaryVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-106: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionAbortLatchDeadline : AllocationDecision about BlueDogRequirements::AbortLatchDeadline {
        source = "Retained baseline S-110; BlueDogRequirementBasis::basisAbortLatchDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-110 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-110 AbortLatchDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-110; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EmergencyControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-110: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionRecoveryTelemetryCadence : AllocationDecision about BlueDogRequirements::RecoveryTelemetryCadence {
        source = "Retained baseline S-111; BlueDogRequirementBasis::basisRecoveryTelemetryCadence records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-111 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-111 RecoveryTelemetryCadence; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-111; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EmergencyControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-111: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionMotorIsolationDeadline : AllocationDecision about BlueDogRequirements::MotorIsolationDeadline {
        source = "Retained baseline S-112; BlueDogRequirementBasis::basisMotorIsolationDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-112 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-112 MotorIsolationDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-112; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EmergencyControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-112: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionManualControlLossShutdown : AllocationDecision about BlueDogRequirements::ManualControlLossShutdown {
        source = "Retained baseline S-114; BlueDogRequirementBasis::basisManualControlLossShutdown records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-114 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-114 ManualControlLossShutdown; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-114; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EmergencyControlVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-114: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSignalingModeDeadline : AllocationDecision about BlueDogRequirements::SignalingModeDeadline {
        source = "Retained baseline S-119; BlueDogRequirementBasis::basisSignalingModeDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-119 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-119 SignalingModeDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-119; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationConspicuityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-119: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSignalingFaultRecording : AllocationDecision about BlueDogRequirements::SignalingFaultRecording {
        source = "Retained baseline S-120; BlueDogRequirementBasis::basisSignalingFaultRecording records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-120 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-120 SignalingFaultRecording; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-120; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationConspicuityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-120: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSignalingFaultReporting : AllocationDecision about BlueDogRequirements::SignalingFaultReporting {
        source = "Retained baseline S-121; BlueDogRequirementBasis::basisSignalingFaultReporting records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "S-121 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in S-121 SignalingFaultReporting; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for S-121; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::NavigationConspicuityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of S-121: Use installed observations and achieved maneuvers in representative and adverse encounters or emergency-control faults; compare the selected latency with complete response and safety margins. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionExpiredCommandRejection : AllocationDecision about BlueDogRequirements::ExpiredCommandRejection {
        source = "Retained baseline C-207; BlueDogRequirementBasis::basisExpiredCommandRejection records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "C-207 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in C-207 ExpiredCommandRejection; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for C-207; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::CommandIntegrityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of C-207: Measure end-to-end telemetry or command handling under delays, reconnects and invalid/replayed input; compare the selected timing with operator interpretation and persistent qualification behavior. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionAcceptedCommandDeadline : AllocationDecision about BlueDogRequirements::AcceptedCommandDeadline {
        source = "Retained baseline C-208; BlueDogRequirementBasis::basisAcceptedCommandDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "C-208 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in C-208 AcceptedCommandDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for C-208; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::CommandIntegrityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of C-208: Measure end-to-end telemetry or command handling under delays, reconnects and invalid/replayed input; compare the selected timing with operator interpretation and persistent qualification behavior. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionOnboardAcknowledgmentDeadline : AllocationDecision about BlueDogRequirements::OnboardAcknowledgmentDeadline {
        source = "Retained baseline C-209; BlueDogRequirementBasis::basisOnboardAcknowledgmentDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "C-209 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in C-209 OnboardAcknowledgmentDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for C-209; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::CommandIntegrityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of C-209: Measure end-to-end telemetry or command handling under delays, reconnects and invalid/replayed input; compare the selected timing with operator interpretation and persistent qualification behavior. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionGorgeWind : AllocationDecision about BlueDogRequirements::GorgeWind {
        source = "Retained baseline N-011; BlueDogRequirementBasis::basisGorgeWind records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-011 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-011 GorgeWind; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-011; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::GorgeWindVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-011: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionGorgeWaves : AllocationDecision about BlueDogRequirements::GorgeWaves {
        source = "Retained baseline N-012; BlueDogRequirementBasis::basisGorgeWaves records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-012 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-012 GorgeWaves; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-012; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::GorgeWavesVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-012: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionGorgeCurrent : AllocationDecision about BlueDogRequirements::GorgeCurrent {
        source = "Retained baseline N-013; BlueDogRequirementBasis::basisGorgeCurrent records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-013 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-013 GorgeCurrent; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-013; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::GorgeCurrentVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-013: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionGorgeSurvivalWind : AllocationDecision about BlueDogRequirements::GorgeSurvivalWind {
        source = "Retained baseline N-014; BlueDogRequirementBasis::basisGorgeSurvivalWind records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-014 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-014 GorgeSurvivalWind; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-014; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnvironmentalEnvelopeVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-014: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionGorgeSurvivalWaves : AllocationDecision about BlueDogRequirements::GorgeSurvivalWaves {
        source = "Retained baseline N-015; BlueDogRequirementBasis::basisGorgeSurvivalWaves records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-015 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-015 GorgeSurvivalWaves; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-015; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::GorgeSurvivalWavesVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-015: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionAirTemperature : AllocationDecision about BlueDogRequirements::AirTemperature {
        source = "Retained baseline N-030; BlueDogRequirementBasis::basisAirTemperature records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-030 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-030 AirTemperature; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-030; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::AirTemperatureVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-030: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWaterTemperature : AllocationDecision about BlueDogRequirements::WaterTemperature {
        source = "Retained baseline N-031; BlueDogRequirementBasis::basisWaterTemperature records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-031 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-031 WaterTemperature; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-031; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WaterTemperatureVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-031: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionHumidity : AllocationDecision about BlueDogRequirements::Humidity {
        source = "Retained baseline N-032; BlueDogRequirementBasis::basisHumidity records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-032 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-032 Humidity; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-032; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::HumidityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-032: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionVisibility : AllocationDecision about BlueDogRequirements::Visibility {
        source = "Retained baseline N-033; BlueDogRequirementBasis::basisVisibility records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-033 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-033 Visibility; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-033; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::VisibilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-033: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionCalmOperation : AllocationDecision about BlueDogRequirements::CalmOperation {
        source = "Retained baseline N-034; BlueDogRequirementBasis::basisCalmOperation records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-034 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-034 CalmOperation; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-034; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::CalmOperationVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-034: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionEnvelopeTransition : AllocationDecision about BlueDogRequirements::EnvelopeTransition {
        source = "Retained baseline N-035; BlueDogRequirementBasis::basisEnvelopeTransition records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-035 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-035 EnvelopeTransition; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-035; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnvelopeTransitionVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-035: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionEnclosureSealing : AllocationDecision about BlueDogRequirements::EnclosureSealing {
        source = "Retained baseline N-043; BlueDogRequirementBasis::basisEnclosureSealing records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-043 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-043 EnclosureSealing; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-043; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnvironmentalEnvelopeVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-043: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSolarHeating : AllocationDecision about BlueDogRequirements::SolarHeating {
        source = "Retained baseline N-046; BlueDogRequirementBasis::basisSolarHeating records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-046 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-046 SolarHeating; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-046; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::SolarHeatingVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-046: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSubmergedWeedPassage : AllocationDecision about BlueDogRequirements::SubmergedWeedPassage {
        source = "Retained baseline N-053; BlueDogRequirementBasis::basisSubmergedWeedPassage records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-053 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-053 SubmergedWeedPassage; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-053; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::SubmergedWeedPassageVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-053: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedSnagShedding : AllocationDecision about BlueDogRequirements::WeedSnagShedding {
        source = "Retained baseline N-054; BlueDogRequirementBasis::basisWeedSnagShedding records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-054 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-054 WeedSnagShedding; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-054; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WeedSnagSheddingVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-054: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedBlockageResponse : AllocationDecision about BlueDogRequirements::WeedBlockageResponse {
        source = "Retained baseline N-055; BlueDogRequirementBasis::basisWeedBlockageResponse records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-055 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-055 WeedBlockageResponse; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-055; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WeedBlockageResponseVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-055: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionRecoveryPropulsorWeeds : AllocationDecision about BlueDogRequirements::RecoveryPropulsorWeeds {
        source = "Retained baseline N-056; BlueDogRequirementBasis::basisRecoveryPropulsorWeeds records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-056 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-056 RecoveryPropulsorWeeds; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-056; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::RecoveryPropulsorWeedsVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-056: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionRestrictedVisibilityEntry : AllocationDecision about BlueDogRequirements::RestrictedVisibilityEntry {
        source = "Retained baseline N-103; BlueDogRequirementBasis::basisRestrictedVisibilityEntry records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-103 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-103 RestrictedVisibilityEntry; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-103; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::VisibilityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-103: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSurvivalEntryDeadline : AllocationDecision about BlueDogRequirements::SurvivalEntryDeadline {
        source = "Retained baseline N-106; BlueDogRequirementBasis::basisSurvivalEntryDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-106 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-106 SurvivalEntryDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-106; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnvelopeTransitionVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-106: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionSailingResumptionDeadline : AllocationDecision about BlueDogRequirements::SailingResumptionDeadline {
        source = "Retained baseline N-108; BlueDogRequirementBasis::basisSailingResumptionDeadline records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-108 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-108 SailingResumptionDeadline; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-108; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::EnvelopeTransitionVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-108: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWetConductorResistance : AllocationDecision about BlueDogRequirements::WetConductorResistance {
        source = "Retained baseline N-113; BlueDogRequirementBasis::basisWetConductorResistance records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-113 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-113 WetConductorResistance; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-113; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WetElectricalIntegrityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-113: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWetInsulationResistance : AllocationDecision about BlueDogRequirements::WetInsulationResistance {
        source = "Retained baseline N-114; BlueDogRequirementBasis::basisWetInsulationResistance records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-114 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-114 WetInsulationResistance; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-114; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WetElectricalIntegrityVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-114: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedPassageSpeed : AllocationDecision about BlueDogRequirements::WeedPassageSpeed {
        source = "Retained baseline N-126; BlueDogRequirementBasis::basisWeedPassageSpeed records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-126 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-126 WeedPassageSpeed; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-126; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::SubmergedWeedPassageVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-126: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedPassageSteering : AllocationDecision about BlueDogRequirements::WeedPassageSteering {
        source = "Retained baseline N-127; BlueDogRequirementBasis::basisWeedPassageSteering records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-127 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-127 WeedPassageSteering; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-127; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::SubmergedWeedPassageVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-127: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedSnagSpeedRecovery : AllocationDecision about BlueDogRequirements::WeedSnagSpeedRecovery {
        source = "Retained baseline N-128; BlueDogRequirementBasis::basisWeedSnagSpeedRecovery records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-128 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-128 WeedSnagSpeedRecovery; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-128; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WeedSnagSheddingVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-128: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedSnagSteeringRecovery : AllocationDecision about BlueDogRequirements::WeedSnagSteeringRecovery {
        source = "Retained baseline N-129; BlueDogRequirementBasis::basisWeedSnagSteeringRecovery records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-129 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-129 WeedSnagSteeringRecovery; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-129; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WeedSnagSheddingVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-129: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedBlockageFault : AllocationDecision about BlueDogRequirements::WeedBlockageFault {
        source = "Retained baseline N-130; BlueDogRequirementBasis::basisWeedBlockageFault records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-130 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-130 WeedBlockageFault; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-130; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WeedBlockageResponseVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-130: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWeedBlockageContingency : AllocationDecision about BlueDogRequirements::WeedBlockageContingency {
        source = "Retained baseline N-131; BlueDogRequirementBasis::basisWeedBlockageContingency records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-131 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-131 WeedBlockageContingency; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-131; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WeedBlockageResponseVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-131: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionPoweredWeedSpeed : AllocationDecision about BlueDogRequirements::PoweredWeedSpeed {
        source = "Retained baseline N-133; BlueDogRequirementBasis::basisPoweredWeedSpeed records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-133 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-133 PoweredWeedSpeed; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-133; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::RecoveryPropulsorWeedsVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-133: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionLockedPropulsorShutdown : AllocationDecision about BlueDogRequirements::LockedPropulsorShutdown {
        source = "Retained baseline N-136; BlueDogRequirementBasis::basisLockedPropulsorShutdown records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "N-136 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in N-136 LockedPropulsorShutdown; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for N-136; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::RecoveryPropulsorWeedsVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of N-136: Establish representative site/casualty exposure and configuration-specific functional recovery; compare the selected boundary or response limit with measured failure margins and interacting exposures. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWindStaleInvalidation : AllocationDecision about BlueDogRequirements::WindStaleInvalidation {
        source = "Retained baseline E-149; BlueDogRequirementBasis::basisWindStaleInvalidation records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-149 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-149 WindStaleInvalidation; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-149; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WindObservationVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-149: Correlate the installed wind observation with a traceable reference across the declared flow/heel/trim matrix; reconcile local apparent-wind errors and the 10 m true-wind admission estimate before accepting the limit. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata decisionWindLossResponse : AllocationDecision about BlueDogRequirements::WindLossResponse {
        source = "Retained baseline E-151; BlueDogRequirementBasis::basisWindLossResponse records its provisional allocation. No accepted originating value-selection trade is recorded.";
        applicability = "E-151 retains its own normative conditions and mission applicability: current/shared; selected configuration and conditions govern.";
        valueJustification = "Open: justify the actual limit in E-151 WindLossResponse; mission motivation alone does not select that value.";
        marginBasis = "Open: record measurement uncertainty, variability and margin for E-151; no extra numerical margin is allocated by this decision record.";
        evidenceNeeded = "BlueDogRequirementVerification::WindObservationVerification; accepted configuration-specific measurements and the value-selection argument remain required.";
        owner = "Project owner; supporting assessment responsibility follows the named verification case.";
        closureAction = "Before release of E-151: Correlate the installed wind observation with a traceable reference across the declared flow/heel/trim matrix; reconcile local apparent-wind errors and the 10 m true-wind admission estimate before accepting the limit. Record the retained or revised value, alternatives, evidence references, assumptions and acceptance disposition.";
        accepted = false;
    }
    metadata procedureAirTemperatureVerification : AllocationDecision about BlueDogRequirementVerification::AirTemperatureVerification {
        source = "Planned procedure uses two hours at each stabilized air-temperature endpoint; this is a test-design choice, not another product requirement.";
        applicability = "Installed configuration and the associated environmental qualification conditions.";
        valueJustification = "Open: justify exposure duration and cycle count using thermal time constants, moisture transport, failure mechanisms and course/campaign representativeness.";
        marginBasis = "Open: record instrumentation uncertainty and duration/coverage margin.";
        evidenceNeeded = "Correlated temperature/moisture histories, stabilization evidence and review of cumulative and combined exposures.";
        owner = "Project owner, environmental assessment";
        closureAction = "Before accepting this procedure, establish representative exposure and coverage or revise the procedure; retain the associated product limits and inconclusive verdict until evidence is accepted.";
        accepted = false;
    }
    metadata procedureWaterTemperatureVerification : AllocationDecision about BlueDogRequirementVerification::WaterTemperatureVerification {
        source = "Planned procedure uses two hours at each stabilized water-temperature endpoint; this is a test-design choice, not another product requirement.";
        applicability = "Installed configuration and the associated environmental qualification conditions.";
        valueJustification = "Open: justify exposure duration and cycle count using thermal time constants, moisture transport, failure mechanisms and course/campaign representativeness.";
        marginBasis = "Open: record instrumentation uncertainty and duration/coverage margin.";
        evidenceNeeded = "Correlated temperature/moisture histories, stabilization evidence and review of cumulative and combined exposures.";
        owner = "Project owner, environmental assessment";
        closureAction = "Before accepting this procedure, establish representative exposure and coverage or revise the procedure; retain the associated product limits and inconclusive verdict until evidence is accepted.";
        accepted = false;
    }
    metadata procedureHumidityVerification : AllocationDecision about BlueDogRequirementVerification::HumidityVerification {
        source = "Planned procedure uses three powered 24-hour condensation cycles; this is a test-design choice, not another product requirement.";
        applicability = "Installed configuration and the associated environmental qualification conditions.";
        valueJustification = "Open: justify exposure duration and cycle count using thermal time constants, moisture transport, failure mechanisms and course/campaign representativeness.";
        marginBasis = "Open: record instrumentation uncertainty and duration/coverage margin.";
        evidenceNeeded = "Correlated temperature/moisture histories, stabilization evidence and review of cumulative and combined exposures.";
        owner = "Project owner, environmental assessment";
        closureAction = "Before accepting this procedure, establish representative exposure and coverage or revise the procedure; retain the associated product limits and inconclusive verdict until evidence is accepted.";
        accepted = false;
    }

}
