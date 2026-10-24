package BlueDogMethod {
    private import OOSEM::*;
    private import BlueDog::Architecture::*;
    private import ModelingMetadata::refinement;

    doc /* OOSEM organizes engineering artifacts and their engineering questions.
     * Method classification is not verification or evidence acceptance.
     * Existing requirement derivations, refinements and owner constraints keep their
     * meanings. Package roles do not assert a one-level derivation for every member.
     */
    metadata mission : OOSEMPackage about GorgeChallenge {
        kind = OOSEMPackageKind::missionRequirements;
    }
    metadata requirements : OOSEMPackage about BlueDogRequirements {
        kind = OOSEMPackageKind::systemRequirements;
    }
    metadata verificationScope : OOSEMPackage about BlueDogRequirementVerification {
        kind = OOSEMPackageKind::verificationModel;
    }
    metadata simulation : OOSEMPackage about BlueDogMissionSimulation {
        kind = OOSEMPackageKind::analysisModel;
    }
    metadata equipment : OOSEMPackage about BlueDogWindEquipment {
        kind = OOSEMPackageKind::physicalArchitecture;
    }

    metadata logicalArchitecture : OOSEMPackage about BlueDogLogicalArchitecture {
        kind = OOSEMPackageKind::logicalArchitecture;
    }
    metadata physicalArchitecture : OOSEMPackage about BlueDogPhysicalArchitecture {
        kind = OOSEMPackageKind::physicalArchitecture;
    }

    #ioEntity item def WindEstimate {
        attribute frameIdentity : ScalarValues::String;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute speed : ISQ::SpeedValue;
        attribute direction : ISQ::AngularMeasureValue;
        attribute observedAt : ISQ::TimeValue;
        attribute valid : ScalarValues::Boolean;
        doc /* Apparent wind in the vessel frame. Timestamp and validity travel with
         * the estimate; accuracy and cadence remain in the wind requirements.
         */
    }
    #ioEntity item def SailingCommand {
        item context : BlueDogInterfaceContracts::CommandContext;
        attribute headingReference : ScalarValues::String;
        attribute sailTrimReference : ScalarValues::String;
        attribute heading : ISQ::AngularMeasureValue;
        attribute sailTrim : ISQ::AngularMeasureValue;
    }
    #ioEntity item def LinkObservation {
        attribute valid : ScalarValues::Boolean;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute available : ScalarValues::Boolean;
        attribute observedAt : ISQ::TimeValue;
    }
    #ioEntity item def TelemetryDisposition {
        item record : BlueDogLogicalArchitecture::MissionRecord;
        attribute transmitCurrentRecord : ScalarValues::Boolean;
        attribute retainCriticalRecord : ScalarValues::Boolean;
        doc /* Current records take priority on reconnect; older evidence is
         * retained and transmitted according to the communications requirements. */
    }
    #ioEntity item def DeploymentAssessment {
        attribute configurationIdentity : ScalarValues::String;
        attribute configurationKnown : ScalarValues::Boolean;
        attribute siteAccepted : ScalarValues::Boolean;
        attribute forecastApplicable : ScalarValues::Boolean;
        attribute recoveryPathKnown : ScalarValues::Boolean;
        attribute energyAdmitted : ScalarValues::Boolean;
        attribute requiredSafetyConfirmed : ScalarValues::Boolean;
        doc /* Inputs require configuration-specific inspection and accepted
         * operating/site evidence. The model does not infer these from IC-01 sizing. */
    }
    #ioEntity item def DeploymentPermission {
        attribute configurationIdentity : ScalarValues::String;
        attribute admitted : ScalarValues::Boolean;
    }
    #ioEntity item def ServiceAssessment {
        attribute configurationIdentity : ScalarValues::String;
        attribute sealingEvidenceAccepted : ScalarValues::Boolean;
        attribute actuationEvidenceAccepted : ScalarValues::Boolean;
        attribute configurationRecorded : ScalarValues::Boolean;
    }
    #ioEntity item def RecoveryPlan {
        attribute destinationIdentity : ScalarValues::String;
        attribute routeFeasible : ScalarValues::Boolean;
        attribute requiredEnergy : ISQ::EnergyValue;
        doc /* Reachability and energy are re-evaluated against current conditions.
         * A candidate plan does not establish safe shore access or arrival. */
    }

    @OOSEMPackage { kind = OOSEMPackageKind::logicalArchitecture; }
    package Scenarios {
        doc /* Logical decision-cycle descriptions, not executable controllers.
         * The mission simulation evaluates conceptual implementations. Physical
         * verification must establish the allocated behavior and interfaces.
         */
        action def ObserveWind { out wind : WindEstimate; }
        action def SelectSailingCommand {
            in wind : WindEstimate;
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            out command : SailingCommand;
        }
        action def ApplySailingCommand {
            in command : SailingCommand [1];
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            doc /* Apply only with current supervisor permission at the actuation
             * interface. This sequence does not bypass the independent inhibit. */
        }
        #logicalScenario action def NormalSailing {
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            doc /* One cycle with valid navigation, wind and safety capabilities.
             * Invalid observations transfer responsibility to degraded-operation logic.
             */
            action observe : ObserveWind;
            then action select : SelectSailingCommand;
            then action actuate : ApplySailingCommand;
            flow observe.wind to select.wind;
            bind select.navigation = navigation;
            bind select.permission = permission;
            bind actuate.permission = permission;
            flow select.command to actuate.command;
        }
        action def ObserveTraffic { out observation : BlueDogLogicalArchitecture::TrafficObservation; }
        action def ObserveNavigation { out navigation : BlueDogLogicalArchitecture::NavigationEstimate; }
        action def AssessEncounter {
            in observation : BlueDogLogicalArchitecture::TrafficObservation;
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            out assessment : BlueDogLogicalArchitecture::TrafficAssessment;
        }
        action def SelectAvoidanceManeuver {
            in assessment : BlueDogLogicalArchitecture::TrafficAssessment;
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            out command : SailingCommand;
        }
        action def ExecuteAndReassess {
            in command : SailingCommand [1];
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            out assessment : BlueDogLogicalArchitecture::TrafficAssessment;
        }
        #logicalScenario action def TrafficEncounter {
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            doc /* Repeated encounter assessment includes AIS and non-AIS traffic.
             * Detection failure invokes abort/recovery; this sequence alone does not
             * establish collision avoidance or navigation-rule compliance.
             */
            action observe : ObserveTraffic;
            then action navigate : ObserveNavigation;
            then action assess : AssessEncounter;
            then action select : SelectAvoidanceManeuver;
            then action execute : ExecuteAndReassess;
            flow observe.observation to assess.observation;
            flow navigate.navigation to assess.navigation;
            flow assess.assessment to select.assessment;
            flow navigate.navigation to select.navigation;
            bind select.permission = permission;
            bind execute.permission = permission;
            flow select.command to execute.command;
        }
        action def LatchAbort {
            out permission : BlueDogLogicalArchitecture::OperationPermission;
            out record : BlueDogLogicalArchitecture::MissionRecord;
        }
        action def RecordAndSignalAbort {
            in record : BlueDogLogicalArchitecture::MissionRecord;
            doc /* Queue an alert and retain local evidence without waiting for a
             * communications link or acknowledgment before proceeding to recovery.
             */
        }
        action def AssessRecoveryBoundary {
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            out boundary : BlueDogLogicalArchitecture::BoundaryAssessment;
        }
        action def SelectReachableShore {
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            in observation : BlueDogLogicalArchitecture::TrafficObservation;
            in boundary : BlueDogLogicalArchitecture::BoundaryAssessment;
            in reserve : BlueDogLogicalArchitecture::ReserveAssessment;
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            out plan : RecoveryPlan;
        }
        action def RecoverAndReassess {
            in plan : RecoveryPlan;
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            out command : BlueDogLogicalArchitecture::RecoveryCommand;
            out record : BlueDogLogicalArchitecture::MissionRecord;
        }
        action def PersistRecoveryAuthorization {
            in record : BlueDogLogicalArchitecture::MissionRecord;
            out authorizationStored : ScalarValues::Boolean [1];
            doc /* Confirm durable disqualification storage before motor enable.
             * Failure or unknown acknowledgment cannot authorize propulsion.
             * This descriptive step does not implement storage hardware. */
        }
        action def ApplyRecoveryCommand {
            in command : BlueDogLogicalArchitecture::RecoveryCommand [1];
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            in authorizationStored : ScalarValues::Boolean [1];
            out record : BlueDogLogicalArchitecture::MissionRecord;
            doc /* Check current authority, command applicability, qualification,
             * durable state and interlocks before enable. Record the observed
             * execution disposition; acceptance does not establish shore arrival. */
        }
        action def RecordRecoveryOutcome {
            in record : BlueDogLogicalArchitecture::MissionRecord;
        }
        #logicalScenario action def AbortAndRecover {
            doc /* A safety-capability loss, reserve trigger or other declared abort
             * condition ends the attempt. Recovery may use the motor and must remain
             * autonomous through communications loss. Reassess shore reachability
             * and safety throughout recovery; completion never resumes the attempt.
             */
            action abort : LatchAbort;
            then action signal : RecordAndSignalAbort;
            then action navigate : ObserveNavigation;
            then action observe : ObserveTraffic;
            then action boundary : AssessRecoveryBoundary;
            then action reserve : ObserveReserve;
            then action plan : SelectReachableShore;
            then action recover : RecoverAndReassess;
            then action persist : PersistRecoveryAuthorization;
            then action actuate : ApplyRecoveryCommand;
            then action record : RecordRecoveryOutcome;
            flow navigate.navigation to boundary.navigation;
            flow navigate.navigation to plan.navigation;
            flow observe.observation to plan.observation;
            flow boundary.boundary to plan.boundary;
            flow reserve.assessment to plan.reserve;
            flow recover.command to actuate.command;
            flow recover.record to persist.record;
            flow persist.authorizationStored to actuate.authorizationStored;
            flow abort.permission to actuate.permission;
            flow actuate.record to record.record;
            flow abort.record to signal.record;
            flow abort.permission to plan.permission;
            flow abort.permission to recover.permission;
            flow plan.plan to recover.plan;
        }
        action def ObserveCapsizeSafety {
            out observation : BlueDogLogicalArchitecture::SafetyObservation;
        }
        action def AssessCapsizeContinuation {
            in observation : BlueDogLogicalArchitecture::SafetyObservation;
            out permission : BlueDogLogicalArchitecture::OperationPermission;
            out record : BlueDogLogicalArchitecture::MissionRecord;
            doc /* Preserve the qualification and abort latches. Inversion alone
             * does not disqualify. Missing safety confirmation, intervention or
             * motor use prohibits resumption. An explicit unassisted upright
             * control observation is required before sailing can resume. */
        }
        action def ApplyCapsizePermission {
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
        }
        action def RetainCapsizeRecord {
            in record : BlueDogLogicalArchitecture::MissionRecord;
        }
        #logicalScenario action def CapsizeAndResume {
            doc /* One repeated capsize-management decision cycle, not a promise
             * that the hull will self-right. Suspend sailing and gate scoring,
             * observe required safety while inverted, then either retain the
             * attempt until unassisted righting or transfer to AbortAndRecover.
             * The native supervisor executes permissions; physical righting,
             * inverted safety and restoration times still require measurement. */
            action observe : ObserveCapsizeSafety;
            then action assess : AssessCapsizeContinuation;
            then action apply : ApplyCapsizePermission;
            then action record : RetainCapsizeRecord;
            flow observe.observation to assess.observation;
            flow assess.permission to apply.permission;
            flow assess.record to record.record;
        }
        action def ValidateNavigation {
            in observation : BlueDogLogicalArchitecture::NavigationEstimate;
            out current : BlueDogLogicalArchitecture::NavigationEstimate;
            out usable : ScalarValues::Boolean [1];
            doc /* Preserve the producer assertion and report consumer usability
             * separately using the allocated age/context criteria. Backup safety
             * confirmation is a separate observation, not inferred from this flag. */
        }
        action def SelectNavigationGuidance {
            in navigation : BlueDogLogicalArchitecture::NavigationEstimate;
            in navigationUsable : ScalarValues::Boolean [1];
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            out command : SailingCommand;
            doc /* Invalid navigation cannot authorize a sailing command; the
             * separate supervisor permission interface inhibits actuation. */
        }
        #logicalScenario action def NavigationUpdate {
            in permission : BlueDogLogicalArchitecture::OperationPermission [1];
            doc /* Observe, validate, guide and actuate. Invalid primary navigation
             * enters degraded operation; continuation requires separately confirmed
             * safety and cannot credit gate progress from invalid observations. */
            action observe : ObserveNavigation;
            then action validate : ValidateNavigation;
            then action guide : SelectNavigationGuidance;
            then action actuate : ApplySailingCommand;
            flow observe.navigation to validate.observation;
            flow validate.current to guide.navigation;
            flow validate.usable to guide.navigationUsable;
            bind guide.permission = permission;
            bind actuate.permission = permission;
            flow guide.command to actuate.command;
        }
        action def ObserveLink { out link : LinkObservation; }
        action def ReadCurrentRecord { out record : BlueDogLogicalArchitecture::MissionRecord; }
        action def SelectTelemetryDisposition {
            in link : LinkObservation;
            in record : BlueDogLogicalArchitecture::MissionRecord;
            out disposition : TelemetryDisposition;
        }
        action def SendOrRetainRecord { in disposition : TelemetryDisposition; }
        #logicalScenario action def CommunicationsOutage {
            doc /* One repeated link-state decision cycle through outage and
             * reconnection. Autonomous safety continues without waiting for a link;
             * retain critical records and deliver current status before backlog
             * when service returns. No operator control is inferred from monitoring. */
            action observe : ObserveLink;
            then action read : ReadCurrentRecord;
            then action select : SelectTelemetryDisposition;
            then action deliver : SendOrRetainRecord;
            flow observe.link to select.link;
            flow read.record to select.record;
            flow select.disposition to deliver.disposition;
        }
        action def ObserveReserve { out assessment : BlueDogLogicalArchitecture::ReserveAssessment; }
        action def SelectReserveResponse {
            in assessment : BlueDogLogicalArchitecture::ReserveAssessment;
            out permission : BlueDogLogicalArchitecture::OperationPermission;
            out recovery : BlueDogLogicalArchitecture::RecoveryCommand;
        }
        action def PreserveSafetyLoads { in permission : BlueDogLogicalArchitecture::OperationPermission [1]; }
        action def RequestRecovery { in command : BlueDogLogicalArchitecture::RecoveryCommand [1]; }
        #logicalScenario action def LowEnergyResponse {
            doc /* Compare conservative usable energy with current recovery demand,
             * protect required safety loads, and abort when the protected reserve
             * is threatened. Recovery action is conditional on the resulting
             * command and available authority; energy restoration cannot clear abort. */
            action observe : ObserveReserve;
            then action select : SelectReserveResponse;
            then action preserve : PreserveSafetyLoads;
            then action request : RequestRecovery;
            flow observe.assessment to select.assessment;
            flow select.permission to preserve.permission;
            flow select.recovery to request.command;
        }
        action def InspectLaunchReadiness { out assessment : DeploymentAssessment; }
        action def AdmitLaunch {
            in assessment : DeploymentAssessment;
            out permission : DeploymentPermission;
        }
        action def LaunchAndInitialize { in permission : DeploymentPermission; }
        #logicalScenario action def PrepareAndLaunch {
            doc /* The operator supplies inspected configuration and accepted site,
             * forecast, safety and energy assessments. Admission precedes physical
             * launch and initialization of a new attempt. Transport and launch are
             * operator actions; onboard autonomy starts at the declared mission boundary. */
            action inspect : InspectLaunchReadiness;
            then action admit : AdmitLaunch;
            then action launch : LaunchAndInitialize;
            flow inspect.assessment to admit.assessment;
            flow admit.permission to launch.permission;
        }
        action def ServiceAndInspect { out assessment : ServiceAssessment; }
        action def AssessServiceRelease {
            in assessment : ServiceAssessment;
            out permission : DeploymentPermission;
        }
        action def RecordServiceConfiguration {
            in assessment : ServiceAssessment;
            in permission : DeploymentPermission;
        }
        #logicalScenario action def MaintainAndRelease {
            doc /* After component replacement, the operator inspects sealing and
             * actuation and records the actual configuration before release.
             * A denied release is recorded too; this descriptive scenario does
             * not execute or accept physical service tests. */
            action service : ServiceAndInspect;
            then action assess : AssessServiceRelease;
            then action record : RecordServiceConfiguration;
            flow service.assessment to assess.assessment;
            flow service.assessment to record.assessment;
            flow assess.permission to record.permission;
        }
        #logicalScenario action normalSailing : NormalSailing;
        #logicalScenario action trafficEncounter : TrafficEncounter;
        #logicalScenario action abortAndRecover : AbortAndRecover;
        #logicalScenario action capsizeAndResume : CapsizeAndResume;
        #logicalScenario action navigationUpdate : NavigationUpdate;
        #logicalScenario action communicationsOutage : CommunicationsOutage;
        #logicalScenario action lowEnergyResponse : LowEnergyResponse;
        #logicalScenario action prepareAndLaunch : PrepareAndLaunch;
        #logicalScenario action maintainAndRelease : MaintainAndRelease;

        allocate normalSailing.observe to BlueDogLogicalArchitecture::vessel.wind;
        allocate normalSailing.select to BlueDogLogicalArchitecture::vessel.guidance;
        allocate normalSailing.actuate to BlueDogLogicalArchitecture::vessel.actuation;
        allocate trafficEncounter.observe to BlueDogLogicalArchitecture::vessel.trafficObservation;
        allocate trafficEncounter.navigate to BlueDogLogicalArchitecture::vessel.navigation;
        allocate trafficEncounter.assess to BlueDogLogicalArchitecture::vessel.collision;
        allocate trafficEncounter.select to BlueDogLogicalArchitecture::vessel.guidance;
        allocate trafficEncounter.execute to BlueDogLogicalArchitecture::vessel.actuation;
        allocate abortAndRecover.abort to BlueDogLogicalArchitecture::vessel.supervision;
        allocate abortAndRecover.signal to BlueDogLogicalArchitecture::vessel.communications;
        allocate abortAndRecover.signal to BlueDogLogicalArchitecture::vessel.recording;
        allocate abortAndRecover.plan to BlueDogLogicalArchitecture::vessel.recovery;
        allocate abortAndRecover.recover to BlueDogLogicalArchitecture::vessel.recovery;
        allocate abortAndRecover.navigate to BlueDogLogicalArchitecture::vessel.navigation;
        allocate abortAndRecover.observe to BlueDogLogicalArchitecture::vessel.trafficObservation;
        allocate abortAndRecover.boundary to BlueDogLogicalArchitecture::vessel.boundary;
        allocate abortAndRecover.reserve to BlueDogLogicalArchitecture::vessel.energy;
        allocate abortAndRecover.persist to BlueDogLogicalArchitecture::vessel.recording;
        allocate abortAndRecover.actuate to BlueDogLogicalArchitecture::vessel.recoveryActuation;
        allocate abortAndRecover.record to BlueDogLogicalArchitecture::vessel.recording;
        allocate capsizeAndResume.observe to BlueDogLogicalArchitecture::vessel.safety;
        allocate capsizeAndResume.assess to BlueDogLogicalArchitecture::vessel.supervision;
        allocate capsizeAndResume.apply to BlueDogLogicalArchitecture::vessel.actuation;
        allocate capsizeAndResume.record to BlueDogLogicalArchitecture::vessel.recording;
        allocate navigationUpdate.observe to BlueDogLogicalArchitecture::vessel.navigation;
        allocate navigationUpdate.validate to BlueDogLogicalArchitecture::vessel.navigation;
        allocate navigationUpdate.guide to BlueDogLogicalArchitecture::vessel.guidance;
        allocate navigationUpdate.actuate to BlueDogLogicalArchitecture::vessel.actuation;
        allocate communicationsOutage.observe to BlueDogLogicalArchitecture::vessel.communications;
        allocate communicationsOutage.read to BlueDogLogicalArchitecture::vessel.recording;
        allocate communicationsOutage.select to BlueDogLogicalArchitecture::vessel.communications;
        allocate communicationsOutage.deliver to BlueDogLogicalArchitecture::vessel.communications;
        allocate lowEnergyResponse.observe to BlueDogLogicalArchitecture::vessel.energy;
        allocate lowEnergyResponse.select to BlueDogLogicalArchitecture::vessel.supervision;
        allocate lowEnergyResponse.preserve to BlueDogLogicalArchitecture::vessel.energy;
        allocate lowEnergyResponse.request to BlueDogLogicalArchitecture::vessel.recovery;
        allocate prepareAndLaunch.inspect to missionContext.operator;
        allocate prepareAndLaunch.admit to BlueDogLogicalArchitecture::vessel.supervision;
        allocate prepareAndLaunch.launch to missionContext.operator;
        allocate maintainAndRelease.service to missionContext.operator;
        allocate maintainAndRelease.assess to missionContext.operator;
        allocate maintainAndRelease.record to BlueDogLogicalArchitecture::vessel.recording;

        #refinement dependency normalScenario from NormalSailing to BlueDogUseCases::sailGorge;
        #refinement dependency trafficScenario from TrafficEncounter to BlueDogUseCases::avoidTraffic;
        #refinement dependency recoveryScenario from AbortAndRecover to BlueDogUseCases::recover;
        #refinement dependency capsizeScenario from CapsizeAndResume to BlueDogUseCases::recoverUpright;
        #refinement dependency navigationScenario from NavigationUpdate to BlueDogUseCases::navigateCourse;
        #refinement dependency outageScenario from CommunicationsOutage to BlueDogUseCases::monitor;
        #refinement dependency energyScenario from LowEnergyResponse to BlueDogUseCases::preserveRecoveryReserve;
        #refinement dependency launchScenario from PrepareAndLaunch to BlueDogUseCases::prepare;
        #refinement dependency serviceScenario from MaintainAndRelease to BlueDogUseCases::maintain;
        dependency normalEvidence from BlueDogRequirementVerification::NavigationAndControlVerification to NormalSailing;
        dependency trafficEvidence from BlueDogRequirementVerification::TrafficSafetyVerification to TrafficEncounter;
        dependency recoveryEvidence from BlueDogRequirementVerification::EmergencyControlVerification to AbortAndRecover;
        dependency recoveryPropulsionEvidence from BlueDogRequirementVerification::RecoveryPropulsionVerification to AbortAndRecover;
        dependency recoveryReserveEvidence from BlueDogRequirementVerification::RecoveryEnergyVerification to AbortAndRecover;
        dependency capsizeEvidence from BlueDogRequirementVerification::CapsizeControlRecoveryVerification to CapsizeAndResume;
        dependency navigationEvidence from BlueDogRequirementVerification::NavigationAvailabilityVerification to NavigationUpdate;
        dependency outageEvidence from BlueDogRequirementVerification::CommunicationsVerification to CommunicationsOutage;
        dependency reserveEvidence from BlueDogRequirementVerification::LowEnergyRecoveryVerification to LowEnergyResponse;
        dependency serviceEvidence from BlueDogRequirementVerification::ServiceabilityVerification to MaintainAndRelease;
        dependency simulationScope from BlueDogMissionSimulation::Inputs to NormalSailing;
        dependency encounterSimulationScope from BlueDogMissionSimulation::Inputs to TrafficEncounter;
        dependency recoverySimulationScope from BlueDogMissionSimulation::Inputs to AbortAndRecover;
    }
}
