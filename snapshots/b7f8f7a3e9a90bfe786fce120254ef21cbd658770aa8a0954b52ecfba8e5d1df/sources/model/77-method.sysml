package BlueDogMethod {
    private import OOSEM::*;
    private import BlueDog::Architecture::*;
    private import ModelingMetadata::refinement;

    doc /* OOSEM organizes engineering artifacts; the development plan retains review
     * criteria and owner approval. Method classification is not review closure.
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

    #node part onboardPlatform {
        doc /* Initial deployment boundary for autonomous estimation and decisions.
         * Processor, PCB partition, operating system and redundancy remain open.
         * Allocation here establishes onboard responsibility, not detailed realization.
         */
        metadata issue : ModelingMetadata::Issue {
            text = "PDR must refine onboard allocations into compatible sensing, compute, software and actuator implementations with timing, power and failure evidence.";
        }
    }
    allocate missionContext.boat.navigation.positionAndAttitude to onboardPlatform;
    allocate missionContext.boat.navigation.wind to onboardPlatform;
    allocate missionContext.boat.navigation.traffic to onboardPlatform;
    allocate missionContext.boat.control.missionManager to onboardPlatform;
    allocate missionContext.boat.control.collisionAvoidance to onboardPlatform;
    allocate missionContext.boat.control.boundarySupervisor to onboardPlatform;
    allocate missionContext.boat.recovery.recoveryController to onboardPlatform;
    allocate missionContext.boat.navigation.wind to BlueDogWindEquipment::challenge;

    #ioEntity item def WindEstimate {
        attribute speed : ISQ::SpeedValue;
        attribute direction : ISQ::AngularMeasureValue;
        attribute observedAt : ISQ::TimeValue;
        attribute valid : ScalarValues::Boolean;
        doc /* Apparent wind in the vessel frame. Timestamp and validity travel with
         * the estimate; accuracy and cadence remain in the wind requirements.
         */
    }
    #ioEntity item def SailingCommand {
        attribute heading : ISQ::AngularMeasureValue;
        attribute sailTrim : ISQ::AngularMeasureValue;
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
            out command : SailingCommand;
        }
        action def ApplySailingCommand { in command : SailingCommand; }
        #logicalScenario action def NormalSailing {
            doc /* One cycle with valid navigation, wind and safety capabilities.
             * Invalid observations transfer responsibility to degraded-operation logic.
             */
            action observe : ObserveWind;
            then action select : SelectSailingCommand;
            then action actuate : ApplySailingCommand;
            flow observe.wind to select.wind;
            flow select.command to actuate.command;
        }
        action def ObserveTraffic;
        action def AssessEncounter;
        action def SelectAvoidanceManeuver;
        action def ExecuteAndReassess;
        #logicalScenario action def TrafficEncounter {
            doc /* Repeated encounter assessment includes AIS and non-AIS traffic.
             * Detection failure invokes abort/recovery; this sequence alone does not
             * establish collision avoidance or navigation-rule compliance.
             */
            action observe : ObserveTraffic;
            then action assess : AssessEncounter;
            then action select : SelectAvoidanceManeuver;
            then action execute : ExecuteAndReassess;
        }
        action def LatchAbort;
        action def RecordAndSignalAbort {
            doc /* Queue an alert and retain local evidence without waiting for a
             * communications link or acknowledgment before proceeding to recovery.
             */
        }
        action def SelectReachableShore;
        action def RecoverAndReassess;
        #logicalScenario action def AbortAndRecover {
            doc /* A safety-capability loss, reserve trigger or other declared abort
             * condition ends the attempt. Recovery may use the motor and must remain
             * autonomous through communications loss. Reassess shore reachability
             * and safety throughout recovery; completion never resumes the attempt.
             */
            action abort : LatchAbort;
            then action signal : RecordAndSignalAbort;
            then action plan : SelectReachableShore;
            then action recover : RecoverAndReassess;
        }
        #logicalScenario action normalSailing : NormalSailing;
        #logicalScenario action trafficEncounter : TrafficEncounter;
        #logicalScenario action abortAndRecover : AbortAndRecover;

        allocate normalSailing.observe to missionContext.boat.navigation.wind;
        allocate normalSailing.select to missionContext.boat.control.missionManager;
        allocate normalSailing.actuate to missionContext.boat.actuation;
        allocate trafficEncounter.observe to missionContext.boat.navigation.traffic;
        allocate trafficEncounter.assess to missionContext.boat.control.collisionAvoidance;
        allocate trafficEncounter.select to missionContext.boat.control.collisionAvoidance;
        allocate trafficEncounter.execute to missionContext.boat.control;
        allocate abortAndRecover.abort to missionContext.boat.control.missionManager;
        allocate abortAndRecover.signal to missionContext.boat.communications;
        allocate abortAndRecover.plan to missionContext.boat.recovery.recoveryController;
        allocate abortAndRecover.recover to missionContext.boat.recovery;

        #refinement dependency normalScenario from NormalSailing to BlueDogUseCases::sailGorge;
        #refinement dependency trafficScenario from TrafficEncounter to BlueDogUseCases::avoidTraffic;
        #refinement dependency recoveryScenario from AbortAndRecover to BlueDogUseCases::recover;
        dependency normalEvidence from BlueDogRequirementVerification::NavigationAndControlVerification to NormalSailing;
        dependency trafficEvidence from BlueDogRequirementVerification::TrafficSafetyVerification to TrafficEncounter;
        dependency recoveryEvidence from BlueDogRequirementVerification::SafeRecoveryVerification to AbortAndRecover;
        dependency simulationScope from BlueDogMissionSimulation::Inputs to NormalSailing;
        dependency encounterSimulationScope from BlueDogMissionSimulation::Inputs to TrafficEncounter;
        dependency recoverySimulationScope from BlueDogMissionSimulation::Inputs to AbortAndRecover;
    }
}
