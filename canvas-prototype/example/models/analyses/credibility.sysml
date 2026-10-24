package BlueDogAnalysisCredibility {
    private import ScalarValues::*;
    metadata def UseIntent {
        attribute category : String;
        attribute intendedUse : String;
        attribute domain : String;
        attribute excludedUses : String;
        attribute evidenceNeeded : String;
    }
    metadata def Inputs :> UseIntent {
        attribute :>> category = "Inputs";
        attribute :>> intendedUse = "Export declared parameters or provisional sensitivity assumptions for an identified caller.";
        attribute :>> domain = "The owning configuration and consumer units/vector ordering; these cases export inputs, not predicted performance.";
        attribute :>> excludedUses = "No feasibility, measured uncertainty distribution or physical capability follows from exporting values.";
        attribute :>> evidenceNeeded = "Trace each value to its owner, external-data pedigree and consuming analysis; verify conversions.";
    }
    metadata def HistoricalReview :> UseIntent {
        attribute :>> category = "HistoricalReview";
        attribute :>> intendedUse = "Inspect recorded operating screens and unaccepted evidence for the original archived candidate.";
        attribute :>> domain = "Only the original run configuration, policy, source revision and sampled scenarios.";
        attribute :>> excludedUses = "No current IC-01 design substitution, physical qualification or transfer of margins between configurations.";
        attribute :>> evidenceNeeded = "Preserve archive manifests and source hashes; assess new use separately against current configuration and policy.";
    }
    metadata def Rules :> UseIntent {
        attribute :>> category = "Rules";
        attribute :>> intendedUse = "Evaluate navigation-rule obligations or fixture consistency from supplied situation facts.";
        attribute :>> domain = "Declared rule edition, delivered tracks, vessel/status/visibility/channel facts and bounded encounter context.";
        attribute :>> excludedUses = "Supplied facts do not demonstrate perception, legal status or achieved safe maneuver; no universal compliance claim.";
        attribute :>> evidenceNeeded = "Validate actual fact acquisition, rule applicability and full encounter behavior against authoritative rules and observations.";
    }
    metadata def Readiness :> UseIntent {
        attribute :>> category = "Readiness";
        attribute :>> intendedUse = "Expose missing review/evidence preconditions in the named safety or configuration argument.";
        attribute :>> domain = "Declared review scope, configuration, contributors and supplied review assertions.";
        attribute :>> excludedUses = "A true review flag or complete register does not demonstrate control effectiveness, install hardware or accept risk.";
        attribute :>> evidenceNeeded = "Actual configuration, implementation/effectiveness records, coverage review and responsible disposition evidence.";
    }
    metadata def Trade :> UseIntent {
        attribute :>> category = "Trade";
        attribute :>> intendedUse = "Compare declared rig evidence gates or illustrate a supporting buoyancy calculation.";
        attribute :>> domain = "The named candidate and ordered evidence vector, or explicit synthetic buoyancy inputs.";
        attribute :>> excludedUses = "No invented scores, hardware downselect, accepted reliability estimate or physical qualification.";
        attribute :>> evidenceNeeded = "Comparable both-tack, energy, durability, construction, casualty and reliability-study evidence; separate mandatory criteria from studies.";
    }
    metadata def Recovery :> UseIntent {
        attribute :>> category = "Recovery";
        attribute :>> intendedUse = "Screen conditional recovery authority, exposure or energy for supplied capabilities and route.";
        attribute :>> domain = "Named configuration, current, orientation, usable reserve, approach and response assumptions.";
        attribute :>> excludedUses = "No demonstrated thrust, whole-river recoverability, physical independence, shore retention or pickup.";
        attribute :>> evidenceNeeded = "Measured installed propulsion/energy and casualty-response envelopes; route and approach evidence with uncertainty.";
    }
    metadata def Sailing :> UseIntent {
        attribute :>> category = "Sailing";
        attribute :>> intendedUse = "Estimate polar demand, conditional progress or hull/route screens under declared inputs.";
        attribute :>> domain = "Supplied polar/geometry, current, wind, leeway and bounded route assumptions.";
        attribute :>> excludedUses = "Demand ratios and solved states do not predict a measured voyage or establish performance outside the studied envelope.";
        attribute :>> evidenceNeeded = "Both-tack measured polar and mass/drag evidence; discretization, convergence and environment-domain sensitivity.";
    }
    metadata def Equipment :> UseIntent {
        attribute :>> category = "Equipment";
        attribute :>> intendedUse = "Account for candidate equipment allocations or illustrative actuator/energy loads.";
        attribute :>> domain = "Declared included/excluded components, duty assumptions, modes and accounting boundary.";
        attribute :>> excludedUses = "An allowance or arithmetic rollup is not a measured installed budget, peak capability or architecture downselect.";
        attribute :>> evidenceNeeded = "Identified component/BOM and synchronized mass, peak/average power, duty and environmental measurements.";
    }
    metadata def Encounter :> UseIntent {
        attribute :>> category = "Encounter";
        attribute :>> intendedUse = "Screen class detection, acquisition or response-distance/exposure from supplied bounds.";
        attribute :>> domain = "Specified target/class, timing, uncertainty, controller state and envelope assumptions.";
        attribute :>> excludedUses = "Allocated observation or response bounds are not demonstrated sensing coverage, maneuver completion or accepted safety margins.";
        attribute :>> evidenceNeeded = "Installed target-class detection/error/dropout and timing evidence including interacting faults and occupied maneuvers.";
    }
    metadata def Weather :> UseIntent {
        attribute :>> category = "Weather";
        attribute :>> intendedUse = "Explore environmental or passage-exposure sensitivity with declared scenario values.";
        attribute :>> domain = "Named wind/current/wave/weather assumptions, geometry and sampled domain.";
        attribute :>> excludedUses = "Scenario sweeps are not calibrated probability distributions, full-domain coverage or voyage reliability evidence.";
        attribute :>> evidenceNeeded = "Observed environmental basis, dependence and coverage review; uncertainty and sensitivity for the proposed use.";
    }
    metadata def EnergyReliability :> UseIntent {
        attribute :>> category = "EnergyReliability";
        attribute :>> intendedUse = "Evaluate conditional energy reconciliation or mission-reliability arithmetic for the named subject.";
        attribute :>> domain = "Declared load/exposure/storage boundaries or failure-rate partition, dependence and hazard assumptions.";
        attribute :>> excludedUses = "Numerical success does not establish measured load, accepted rates, independence or physical reliability/energy sufficiency.";
        attribute :>> evidenceNeeded = "Configuration-specific measurements, rate/profile justification, common-cause/dependence review and uncertainty assessment.";
    }
    metadata def Geometry :> UseIntent {
        attribute :>> category = "Geometry";
        attribute :>> intendedUse = "Inspect a geometric/course or analytic hydrostatic fixture.";
        attribute :>> domain = "Declared coordinate/geometry conventions and simplified analytic assumptions.";
        attribute :>> excludedUses = "A consistent fixture is not surveyed course truth, validated free-surface response or installed-vessel performance.";
        attribute :>> evidenceNeeded = "Independent coordinate/unit checks, geometry survey or hydrostatic comparison relevant to the proposed use.";
    }
    metadata use001 : Equipment about BlueDogAcousticEquipment::Budget;
    metadata use002 : Inputs about BlueDogAerodynamicPolicy::convergenceInputs;
    metadata use003 : Encounter about BlueDogAvoidanceFailures::EvaluateExposure;
    metadata use004 : EnergyReliability about BlueDogCandidateEnergy::Reconciliation;
    metadata use005 : Encounter about BlueDogClassDetection::Assessment;
    metadata use006 : Encounter about BlueDogClassDetection::Summary;
    metadata use007 : Inputs about BlueDogConceptCredibility::Inputs;
    metadata use008 : Inputs about BlueDogConceptCredibility::SensitivityInputs;
    metadata use009 : Readiness about BlueDogConfigurationManagement::AccountingReview;
    metadata use010 : Readiness about BlueDogConfigurationManagement::currentReview;
    metadata use011 : Inputs about BlueDogCoupledOperation::Inputs;
    metadata use012 : Inputs about BlueDogCoupledSizing::Inputs;
    metadata use013 : Inputs about BlueDogCoupledUncertainty::Inputs;
    metadata use014 : HistoricalReview about BlueDogCurrentSizing::nominalReview;
    metadata use015 : HistoricalReview about BlueDogCurrentSizing::constructionReview;
    metadata use016 : HistoricalReview about BlueDogCurrentSizing::aerodynamicReview;
    metadata use017 : HistoricalReview about BlueDogCurrentSizing::hydrodynamicReview;
    metadata use018 : HistoricalReview about BlueDogCurrentSizing::energyReview;
    metadata use019 : HistoricalReview about BlueDogCurrentSizing::combinedReview;
    metadata use020 : Encounter about BlueDogEncounterEnvelope::Envelope;
    metadata use021 : Encounter about BlueDogEncounterEnvelope::Summary;
    metadata use022 : Inputs about BlueDogEncounterFeasibility::Inputs;
    metadata use023 : Encounter about BlueDogEncounterReview::Acquisition;
    metadata use024 : EnergyReliability about BlueDogEnergy::SustainedOperation;
    metadata use025 : EnergyReliability about BlueDogEnergy::SustainedEnergyVerification::calculation;
    metadata use026 : Weather about BlueDogEnvironmentReview::FetchSensitivity;
    metadata use027 : Geometry about BlueDogHydrostatics::analyticExample;
    metadata use028 : Inputs about BlueDogIntegratedCandidate::Inputs;
    metadata use029 : Recovery about BlueDogIntegratedCandidate::RecoveryScreen;
    metadata use030 : Recovery about BlueDogIntegratedCandidate::IC01RecoveryIllustration;
    metadata use031 : Recovery about BlueDogIntegratedCandidate::IC01InvertedRecoveryIllustration;
    metadata use032 : Recovery about BlueDogIntegratedCandidate::IC01NoRecoveryAuthority;
    metadata use033 : Weather about BlueDogLocationTraffic::WindowAssessment;
    metadata use034 : Inputs about BlueDogManeuverDynamics::Defaults;
    metadata use035 : Inputs about BlueDogManeuverDynamics::StudyInputs;
    metadata use036 : Inputs about BlueDogMissionSimulation::Inputs;
    metadata use037 : Rules about BlueDogNavigationController::Policy;
    metadata use038 : Rules about BlueDogNavigationController::Candidate;
    metadata use039 : Rules about BlueDogNavigationController::Geometry;
    metadata use040 : Rules about BlueDogNavigationController::Context;
    metadata use041 : Inputs about BlueDogOperatingEnvironment::Inputs;
    metadata use042 : Weather about BlueDogPassageExposure::Contours;
    metadata use043 : HistoricalReview about BlueDogRecordedSizing::nominalReview;
    metadata use044 : HistoricalReview about BlueDogRecordedSizing::constructionReview;
    metadata use045 : HistoricalReview about BlueDogRecordedSizing::aerodynamicReview;
    metadata use046 : HistoricalReview about BlueDogRecordedSizing::hydrodynamicReview;
    metadata use047 : HistoricalReview about BlueDogRecordedSizing::energyReview;
    metadata use048 : HistoricalReview about BlueDogRecordedSizing::combinedReview;
    metadata use049 : Recovery about BlueDogRecoveryRisk::Sensitivity;
    metadata use050 : EnergyReliability about BlueDogReliability::CruiseReliability;
    metadata use051 : EnergyReliability about BlueDogReliability::VoyageReliabilityVerification::calculation;
    metadata use052 : EnergyReliability about BlueDogReliabilityExamples::gorgeAssessment;
    metadata use053 : Readiness about BlueDogSafety::SafetyReview;
    metadata use054 : Readiness about BlueDogSafety::SafetyReview::failureModes;
    metadata use055 : Readiness about BlueDogSafety::currentReview;
    metadata use056 : Trade about BlueDogSailTrade::TradeAssessment;
    metadata use057 : Trade about BlueDogSailTrade::tailAssessment;
    metadata use058 : Trade about BlueDogSailTrade::camberAssessment;
    metadata use059 : Trade about BlueDogSailTrade::softAssessment;
    metadata use060 : Trade about BlueDogSailTrade::buoyancyIllustration;
    metadata use061 : Sailing about BlueDogSailing::PolarDemandAndHullScreen;
    metadata use062 : Sailing about BlueDogSailing::PolarVoyageAssessment;
    metadata use063 : Sailing about BlueDogSailing::PolarVoyageAssessment::cruise;
    metadata use064 : Sailing about BlueDogSailing::SailingSensitivity;
    metadata use065 : Sailing about BlueDogSailingExamples::upstreamBeat;
    metadata use066 : Sailing about BlueDogSailingExamples::upstreamRun;
    metadata use067 : Sailing about BlueDogSailingExamples::downstreamBeat;
    metadata use068 : Sailing about BlueDogSailingExamples::downstreamRun;
    metadata use069 : Sailing about BlueDogSailingExamples::westerlyPassage;
    metadata use070 : Sailing about BlueDogSailingExamples::easterlyPassage;
    metadata use071 : Sailing about BlueDogSailingExamples::lightWindDemand;
    metadata use072 : Sailing about BlueDogSailingExamples::strongWindDemand;
    metadata use073 : Sailing about BlueDogSailingExamples::highWindDemand;
    metadata use074 : Sailing about BlueDogSailingExamples::sensitivity;
    metadata use075 : Sailing about BlueDogSailingExamples::oceanDemand;
    metadata use076 : HistoricalReview about BlueDogSizingEvidence::Review;
    metadata use077 : Inputs about BlueDogStructuralBasis::Inputs;
    metadata use078 : Inputs about BlueDogStructure::MaterialInputs;
    metadata use079 : Inputs about BlueDogStructure::material;
    metadata use080 : Inputs about BlueDogSurfaceEnvironment::Inputs;
    metadata use081 : Inputs about BlueDogWavePerformance::Inputs;
    metadata use082 : Inputs about BlueDogWeather::Inputs;
    metadata use083 : Weather about BlueDogWeather::RegimeSensitivity;
    metadata use084 : Weather about BlueDogWeather::primary;
    metadata use085 : Weather about BlueDogWeather::construction;
    metadata use086 : Weather about BlueDogWeather::aerodynamic;
    metadata use087 : Weather about BlueDogWeather::hydrodynamic;
    metadata use088 : Weather about BlueDogWeather::energy;
    metadata use089 : Weather about BlueDogWeather::combined;
    metadata use090 : Equipment about BlueDogWindEquipment::Rollup;
    metadata use091 : Equipment about BlueDogWingActuator::accountingExample;
    metadata use092 : Inputs about BlueDogWingHeel::sweepInputs;
    metadata use093 : Rules about InlandExtended::General;
    metadata use094 : Rules about InlandExtended::ChannelsAndTSS;
    metadata use095 : Rules about InlandExtended::RestrictedVisibility;
    metadata use096 : Rules about InlandExtended::LightsAndShapes;
    metadata use097 : Rules about InlandExtended::Signals;
    metadata use098 : Rules about InlandExtended::LightFixture;
    metadata use099 : Rules about InlandExtended::Installation;
    metadata use100 : Rules about InlandExtended::SoundAppliance;
    metadata use101 : Rules about InlandExtended::ExemptionsAndSpecialCases;
    metadata use102 : Rules about InlandExtended::CandidateAssessment;
    metadata use103 : Rules about InlandExtended::SnapshotConsistency;
    metadata use104 : Rules about InlandExtended::SpecialDisplays;
    metadata use105 : Rules about InlandExtended::PassageProtocol;
    metadata use106 : Rules about InlandExtended::DistressCatalog;
    metadata use107 : Rules about InlandNavigationExperiment::Assess;
    metadata use108 : Equipment about MarineEnergy::BudgetRollup;
    metadata use109 : Recovery about RecoveryPropulsionTrade::RecoverySizing;
    metadata use110 : Geometry about TransGorgeCourse::GateGeometry;

    calc def UsePreconditions {
        doc /* Supplied review assertions for a proposed use, not an acceptance decision or a requirement that the design pass its screens. */
        in intendedUseReviewed : Boolean [1];
        in configurationApplicable : Boolean [1];
        in domainApplicable : Boolean [1];
        in inputPedigreeReviewed : Boolean [1];
        in implementationVerified : Boolean [1];
        in validationAdequateForUse : Boolean [1];
        in uncertaintyReported : Boolean [1];
        in sensitivityReviewed : Boolean [1];
        in defectsDispositioned : Boolean [1];
        in limitationsReported : Boolean [1];
        return eligible : Boolean = intendedUseReviewed and configurationApplicable and domainApplicable and inputPedigreeReviewed and implementationVerified and validationAdequateForUse and uncertaintyReported and sensitivityReviewed and defectsDispositioned and limitationsReported;
    }
}
