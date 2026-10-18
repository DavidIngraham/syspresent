package BlueDogDFMEA {
    private import ScalarValues::*;
    doc /* Initial design failure-mode review. Rows are hypotheses, not exhaustive
     * hazard coverage or measured rates. No ordinal score is converted to probability.
     * Scope includes sailing, holds, recovery, and common-cause failures.
     */
    private import FailureAnalysis::*;
    part starter : Review {
        ref part :>> system = BlueDog::Architecture::missionContext.boat;
        attribute :>> scopeReviewed default = false;
        part hullLeak : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.hullAndRig.printedHull;
            attribute :>> identifier = "FM-001";
            attribute :>> intendedFunction = "Retain buoyancy";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Printed seam leaks"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Cyclic wave load or print defect"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Water enters hull"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Buoyancy or electrical function lost"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Ingress sensing; acceptance unproven";
            attribute :>> recommendedAction = "Coupon fatigue, seam pressure test and flooded-compartment trial";
            attribute :>> ownerRole = "Hull/structure";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part keelLoss : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.hullAndRig.keelAndBallast;
            attribute :>> identifier = "FM-002";
            attribute :>> intendedFunction = "Maintain righting moment";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Keel attachment fractures"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Fatigue or impact"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Ballast detached"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Persistent inversion or vessel loss"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Attitude sensor; attachment inspection";
            attribute :>> recommendedAction = "Proof load and fatigue qualification of joint";
            attribute :>> ownerRole = "Hull/structure";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part steeringJam : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.actuation;
            attribute :>> identifier = "FM-003";
            attribute :>> intendedFunction = "Control heading";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Rudder or linkage jams"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Milfoil wrap, debris or actuator fault"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Commanded rudder motion unavailable"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Reduced VMG; boundary excursion or collision"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Position/current disagreement detection to be designed";
            attribute :>> recommendedAction = "Weed-jam injection and autonomous clearing trial";
            attribute :>> ownerRole = "Actuation";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part sailJam : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.actuation;
            attribute :>> identifier = "FM-004";
            attribute :>> intendedFunction = "Control sail force";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Wing trim jams"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Bearing wear, salt or drive failure"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Trim fixed in unsafe position"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "VMG loss or overpower/capsize"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Command/response monitoring to be designed";
            attribute :>> recommendedAction = "Jam test at adverse trim; passive load limiting trade";
            attribute :>> ownerRole = "Actuation";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part batteryFault : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.energy.storage;
            attribute :>> identifier = "FM-005";
            attribute :>> intendedFunction = "Supply essential power";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Battery disconnects or faults"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Cell degradation, BMS trip or short"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Bus power lost or overheating"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Mission loss; possible thermal damage"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Voltage/temperature/current sensing to be verified";
            attribute :>> recommendedAction = "Cold/aged-cell loading and BMS fault injection";
            attribute :>> ownerRole = "Power";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part harvestLoss : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.energy.harvesting;
            attribute :>> identifier = "FM-006";
            attribute :>> intendedFunction = "Replenish stored energy";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Harvesting stops"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Connector corrosion or panel damage"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Persistent energy deficit"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Long-hold exposure exhausts reserve"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Harvest-current residual monitoring to be designed";
            attribute :>> recommendedAction = "No-harvest fault campaign and reserve policy validation";
            attribute :>> ownerRole = "Power";
            attribute :>> safetyCritical = false;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part powerCommonCause : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.energy.powerManagement;
            attribute :>> identifier = "FM-007";
            attribute :>> intendedFunction = "Keep essential services powered";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Shared bus fault disables multiple functions"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Regulator short or common water ingress"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Navigation, actuation and telemetry lost together"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Mission and observation lost"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Independent health path not yet designed";
            attribute :>> recommendedAction = "Assess isolation and independence; common-cause fault injection";
            attribute :>> ownerRole = "Power/system";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part navigationFault : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.navigation.positionAndAttitude;
            attribute :>> identifier = "FM-008";
            attribute :>> intendedFunction = "Estimate position and heading";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Plausible wrong navigation solution"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Bias, stale data or corrupted input"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Guidance uses wrong state"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Boundary/traffic hazard and route failure"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Plausibility checks; independent reference unresolved";
            attribute :>> recommendedAction = "Biased/stale-sensor injection across speed/current profiles";
            attribute :>> ownerRole = "Navigation";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part controlLockup : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.missionManager;
            attribute :>> identifier = "FM-009";
            attribute :>> intendedFunction = "Execute autonomous mission";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Controller hangs or repeats invalid command"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Systematic software fault or reset corruption"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Mission logic stops or is unsafe"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "No progress or unsafe actuation"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Watchdog and restoration requirements; unverified";
            attribute :>> recommendedAction = "Fault injection and persisted-state consistency testing";
            attribute :>> ownerRole = "Autonomy";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part trafficMiss : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "FM-010";
            attribute :>> intendedFunction = "Avoid other vessels";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Traffic conflict missed"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Sensor blind spot or prediction error"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "The required encounter response is unavailable or too late"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Collision risk"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Independent lookout unavailable onboard";
            attribute :>> recommendedAction = "Non-AIS traffic scenarios and safe boundary strategies";
            attribute :>> ownerRole = "Autonomy/safety";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part radioLoss : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.communications.telemetryRadio;
            attribute :>> identifier = "FM-011";
            attribute :>> intendedFunction = "Provide live observation";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Radio link unavailable"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Antenna wetting, shadowing or radio fault"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Live data cannot reach shore"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Observation outage; autonomy must continue"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Contact-age monitoring and retained logs";
            attribute :>> recommendedAction = "Wet/inverted antenna trials and 24-hour outage/reconnect test";
            attribute :>> ownerRole = "Communications";
            attribute :>> safetyCritical = false;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
        part motorUncommanded : ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.recovery.motorSystem;
            attribute :>> identifier = "FM-012";
            attribute :>> intendedFunction = "Provide controlled recovery thrust";
            occurrence failureModeEvent : FailureAnalysis::Event { attribute :>> description = "Motor energizes during qualifying sailing"; }
            ref occurrence :>> failureMode = failureModeEvent;
            occurrence causeEvent : FailureAnalysis::Event { attribute :>> description = "Driver short or command gating fault"; }
            ref occurrence :>> cause = causeEvent;
            occurrence localEffectEvent : FailureAnalysis::Event { attribute :>> description = "Unintended powered propulsion"; }
            ref occurrence :>> localEffect = localEffectEvent;
            occurrence missionEffectEvent : FailureAnalysis::Event { attribute :>> description = "Challenge disqualification or contact hazard"; }
            ref occurrence :>> missionEffect = missionEffectEvent;
            attribute :>> proposedDetection = "Isolation and qualification latch; unverified";
            attribute :>> recommendedAction = "Stuck-driver test and independent propulsion isolation";
            attribute :>> ownerRole = "Recovery";
            attribute :>> safetyCritical = true;
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            metadata risk : RiskMetadata::Risk;
        }
    }
    dependency hullLeakDesign from starter::hullLeak to BlueDog::Architecture::missionContext::boat::hullAndRig::printedHull;
    dependency hullLeakCriterion from starter::hullLeak to BlueDogRequirements::enclosureSealing;
    dependency keelLossDesign from starter::keelLoss to BlueDog::Architecture::missionContext::boat::hullAndRig::keelAndBallast;
    dependency keelLossCriterion from starter::keelLoss to BlueDogRequirements::selfRighting;
    dependency steeringJamDesign from starter::steeringJam to BlueDog::Architecture::missionContext::boat::actuation;
    dependency steeringJamCriterion from starter::steeringJam to BlueDogRequirements::weedSnagSteeringRecovery;
    dependency sailJamDesign from starter::sailJam to BlueDog::Architecture::missionContext::boat::actuation;
    dependency sailJamCriterion from starter::sailJam to BlueDogRequirements::sailCommandCadence;
    dependency batteryFaultDesign from starter::batteryFault to BlueDog::Architecture::missionContext::boat::energy::storage;
    dependency batteryFaultCriterion from starter::batteryFault to BlueDogRequirements::sustainedReserveProtection;
    dependency harvestLossDesign from starter::harvestLoss to BlueDog::Architecture::missionContext::boat::energy::harvesting;
    dependency harvestLossCriterion from starter::harvestLoss to BlueDogRequirements::lowEnergyEntry;
    dependency powerCommonCauseDesign from starter::powerCommonCause to BlueDog::Architecture::missionContext::boat::energy::powerManagement;
    dependency powerCommonCauseCriterion from starter::powerCommonCause to BlueDogRequirements::missionReliability;
    dependency navigationFaultDesign from starter::navigationFault to BlueDog::Architecture::missionContext::boat::navigation::positionAndAttitude;
    dependency navigationFaultCriterion from starter::navigationFault to BlueDogRequirements::navigationAvailability;
    dependency controlLockupDesign from starter::controlLockup to BlueDog::Architecture::missionContext::boat::control::missionManager;
    dependency controlLockupCriterion from starter::controlLockup to BlueDogRequirements::resetRecovery;
    dependency trafficMissDesign from starter::trafficMiss to BlueDog::Architecture::missionContext::boat::control::collisionAvoidance;
    dependency trafficMissCriterion from starter::trafficMiss to BlueDogRequirements::trafficSafety;
    dependency radioLossDesign from starter::radioLoss to BlueDog::Architecture::missionContext::boat::communications::telemetryRadio;
    dependency radioLossCriterion from starter::radioLoss to BlueDogRequirements::outageAutonomy;
    dependency motorUncommandedDesign from starter::motorUncommanded to BlueDog::Architecture::missionContext::boat::recovery::motorSystem;
    dependency motorUncommandedCriterion from starter::motorUncommanded to BlueDogRequirements::challengeMotorInhibition;
    dependency dispositionCriterion from DesignFailureReview to BlueDogRequirements::criticalFailureDisposition;
    dependency speedExposureFeedback from DesignFailureReview to BlueDogReliability::CruiseReliability;
    dependency commonCauseBudget from starter::powerCommonCause to BlueDogRequirements::failureRateBudget;
    connection hullLeak_cause_failureMode : CauseAndEffect::Causation connect starter.hullLeak.cause to starter.hullLeak.failureMode;
    connection hullLeak_failureMode_localEffect : CauseAndEffect::Causation connect starter.hullLeak.failureMode to starter.hullLeak.localEffect;
    connection hullLeak_localEffect_missionEffect : CauseAndEffect::Causation connect starter.hullLeak.localEffect to starter.hullLeak.missionEffect;
    connection keelLoss_cause_failureMode : CauseAndEffect::Causation connect starter.keelLoss.cause to starter.keelLoss.failureMode;
    connection keelLoss_failureMode_localEffect : CauseAndEffect::Causation connect starter.keelLoss.failureMode to starter.keelLoss.localEffect;
    connection keelLoss_localEffect_missionEffect : CauseAndEffect::Causation connect starter.keelLoss.localEffect to starter.keelLoss.missionEffect;
    connection steeringJam_cause_failureMode : CauseAndEffect::Causation connect starter.steeringJam.cause to starter.steeringJam.failureMode;
    connection steeringJam_failureMode_localEffect : CauseAndEffect::Causation connect starter.steeringJam.failureMode to starter.steeringJam.localEffect;
    connection steeringJam_localEffect_missionEffect : CauseAndEffect::Causation connect starter.steeringJam.localEffect to starter.steeringJam.missionEffect;
    connection sailJam_cause_failureMode : CauseAndEffect::Causation connect starter.sailJam.cause to starter.sailJam.failureMode;
    connection sailJam_failureMode_localEffect : CauseAndEffect::Causation connect starter.sailJam.failureMode to starter.sailJam.localEffect;
    connection sailJam_localEffect_missionEffect : CauseAndEffect::Causation connect starter.sailJam.localEffect to starter.sailJam.missionEffect;
    connection batteryFault_cause_failureMode : CauseAndEffect::Causation connect starter.batteryFault.cause to starter.batteryFault.failureMode;
    connection batteryFault_failureMode_localEffect : CauseAndEffect::Causation connect starter.batteryFault.failureMode to starter.batteryFault.localEffect;
    connection batteryFault_localEffect_missionEffect : CauseAndEffect::Causation connect starter.batteryFault.localEffect to starter.batteryFault.missionEffect;
    connection harvestLoss_cause_failureMode : CauseAndEffect::Causation connect starter.harvestLoss.cause to starter.harvestLoss.failureMode;
    connection harvestLoss_failureMode_localEffect : CauseAndEffect::Causation connect starter.harvestLoss.failureMode to starter.harvestLoss.localEffect;
    connection harvestLoss_localEffect_missionEffect : CauseAndEffect::Causation connect starter.harvestLoss.localEffect to starter.harvestLoss.missionEffect;
    connection powerCommonCause_cause_failureMode : CauseAndEffect::Causation connect starter.powerCommonCause.cause to starter.powerCommonCause.failureMode;
    connection powerCommonCause_failureMode_localEffect : CauseAndEffect::Causation connect starter.powerCommonCause.failureMode to starter.powerCommonCause.localEffect;
    connection powerCommonCause_localEffect_missionEffect : CauseAndEffect::Causation connect starter.powerCommonCause.localEffect to starter.powerCommonCause.missionEffect;
    connection navigationFault_cause_failureMode : CauseAndEffect::Causation connect starter.navigationFault.cause to starter.navigationFault.failureMode;
    connection navigationFault_failureMode_localEffect : CauseAndEffect::Causation connect starter.navigationFault.failureMode to starter.navigationFault.localEffect;
    connection navigationFault_localEffect_missionEffect : CauseAndEffect::Causation connect starter.navigationFault.localEffect to starter.navigationFault.missionEffect;
    connection controlLockup_cause_failureMode : CauseAndEffect::Causation connect starter.controlLockup.cause to starter.controlLockup.failureMode;
    connection controlLockup_failureMode_localEffect : CauseAndEffect::Causation connect starter.controlLockup.failureMode to starter.controlLockup.localEffect;
    connection controlLockup_localEffect_missionEffect : CauseAndEffect::Causation connect starter.controlLockup.localEffect to starter.controlLockup.missionEffect;
    connection trafficMiss_cause_failureMode : CauseAndEffect::Causation connect starter.trafficMiss.cause to starter.trafficMiss.failureMode;
    connection trafficMiss_failureMode_localEffect : CauseAndEffect::Causation connect starter.trafficMiss.failureMode to starter.trafficMiss.localEffect;
    connection trafficMiss_localEffect_missionEffect : CauseAndEffect::Causation connect starter.trafficMiss.localEffect to starter.trafficMiss.missionEffect;
    connection radioLoss_cause_failureMode : CauseAndEffect::Causation connect starter.radioLoss.cause to starter.radioLoss.failureMode;
    connection radioLoss_failureMode_localEffect : CauseAndEffect::Causation connect starter.radioLoss.failureMode to starter.radioLoss.localEffect;
    connection radioLoss_localEffect_missionEffect : CauseAndEffect::Causation connect starter.radioLoss.localEffect to starter.radioLoss.missionEffect;
    connection motorUncommanded_cause_failureMode : CauseAndEffect::Causation connect starter.motorUncommanded.cause to starter.motorUncommanded.failureMode;
    connection motorUncommanded_failureMode_localEffect : CauseAndEffect::Causation connect starter.motorUncommanded.failureMode to starter.motorUncommanded.localEffect;
    connection motorUncommanded_localEffect_missionEffect : CauseAndEffect::Causation connect starter.motorUncommanded.localEffect to starter.motorUncommanded.missionEffect;
}
