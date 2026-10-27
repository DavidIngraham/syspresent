package BlueDog {
    doc /* Blue Dog is a small autonomous sailboat for the Columbia River. Its first mission is one Bingen-Stevenson-Bingen round trip using sail power and onboard control, with live monitoring from shore. The boat must detect traffic, protect its recovery energy and return to a suitable retrieval location after an abort. Later goals include repeated river circuits and a voyage toward Hawaii. The design is under development; equipment selection and physical testing remain open.*/

    private import GorgeChallenge::*;
    private import OOSEM::*;

    package DesignIntent {
        doc /* The owner requires a boat that one adult can transport, assemble, launch and retrieve, with printed components made on a 250 mm cubic desktop printer and equipment accessible for service between deployments.*/
    }

    package Goals {
        requirement def <'H-001'> HawaiiVoyage {
            metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
            metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
            doc /* The vessel shall complete an autonomous sailing voyage to Hawaii. */
        comment notes /* Gorge-specific challenge rules do not automatically apply to the ocean mission. */
        metadata rationale : ModelingMetadata::Rationale { text = "The Gorge is a proving ground for the ocean objective, not evidence of ocean readiness."; }
        metadata issue : ModelingMetadata::Issue { text = "Departure point, destination gate, route, duration, route/season suitability of the candidate ocean envelope, assistance/propulsion rules and acceptance evidence remain to be agreed."; }
        }
        requirement hawaiiVoyage : HawaiiVoyage;
    }

    package Mission {
        action def HawaiiMission {
            doc /* Plan the voyage, launch, sail toward Hawaii, approach the destination and recover the boat and its records. Energy management, health monitoring and communications support the passage. The route, arrival criteria, endurance and recovery plan still need to be defined.*/
            action prepareAndLaunch;
            action sailOceanPassage;
            action approachDestination;
            action recoverBoatAndData;
            action manageEnergy;
            action monitorHealthAndRecover;
            action communicateWithOperator;
            action recordMissionData;
        }
        action def TransGorgeMission {
            doc /* Prepare and launch at Bingen, sail to the buoy 16 rounding near Stevenson, return through the Bingen finish gate, and retrieve the boat and its records. Throughout the circuit, manage energy, monitor hazards and health, communicate with shore and record progress. Qualification requires onboard control without operator intervention. The course, operating conditions and recovery sites require review before launch; completion has no time limit.*/
            action prepareAndLaunch;
            action sailOutbound;
            action turnAround;
            action sailHome;
            action recoverBoatAndData;
            action manageEnergy;
            action monitorHealthAndRecover;
            action communicateWithOperator;
            action recordMissionData;
        }
        action def SwellMonitoringMission {
            doc /* A possible later mission would send the boat to an observation area, collect wind and wave measurements, and return for retrieval. The area, measurement products and accuracy remain to be chosen.*/
            action reachObservationArea;
            action maintainObservationArea;
            action measureAndRecordConditions;
            action returnForRecovery;
        }
    }

    package Architecture {
        doc /* The boat needs a hull and rig, electrical power, navigation and wind sensing, traffic detection, sailing control, communications, recovery equipment and data recording. This overview groups those jobs and identifies the operator, shore station, river conditions and other vessels. The logical architecture describes how the jobs interact; the IC-01 equipment proposal assigns them to candidate hardware.*/
        #user part def Operator;
        part def MonitoringStation;
        #externalSystem part def ShoreSupport {
            part monitoringStation : MonitoringStation;
        }
        #environment part def Environment;
        #externalSystem part def OtherVessel {
            doc /* External traffic, including commercial ships, barges, fishing and recreational craft, with or without AIS. Behavior and cooperation are outside Blue Dog control. */
        }
        #hardware part def PrintedHull;
        #hardware part def SealedEnclosure;
        #hardware part def KeelAndBallast;
        #hardware part def HandlingInterfaces;
        part def RigConcept {
            doc /* Three sail arrangements are under consideration: a soft sail, a rigid wing controlled by an aerodynamic tail, and a fixed-camber wing rotated by a drive. The comparison still needs sailing, energy, construction and recovery test results.*/
        }
        part def HullAndRig {
            part rig : RigConcept;
            part printedHull : PrintedHull;
            part enclosure : SealedEnclosure;
            part keelAndBallast : KeelAndBallast;
            part handling : HandlingInterfaces;
        }
        part def EnergyStorage;
        part def HarvestingInterface;
        part def PowerManagement;
        part def EnergySubsystem {
            part storage : EnergyStorage;
            part harvesting : HarvestingInterface;
            part powerManagement : PowerManagement;
        }
        part def PositionAndAttitude;
        part def WindSensing;
        part def TrafficSensing;
        part def NavigationAndSensing {
            part positionAndAttitude : PositionAndAttitude;
            part wind : WindSensing;
            part traffic : TrafficSensing;
        }
        part def MissionManager;
        part def CollisionAvoidance;
        part def BoundarySupervisor;
        part def GuidanceAndControl {
            part missionManager : MissionManager;
            part collisionAvoidance : CollisionAvoidance;
            part boundarySupervisor : BoundarySupervisor;
        }
        part def SailAndSteeringActuation;
        part def TelemetryRadio;
        part def AntennaSystem;
        part def CommandGateway;
        part def Communications {
            part telemetryRadio : TelemetryRadio;
            part antenna : AntennaSystem;
            part commandGateway : CommandGateway;
        }
        part def RecoveryPropulsion;
        part def RecoveryController;
        part def IngressMonitor;
        part def HealthAndRecovery {
            part motorSystem : RecoveryPropulsion;
            part recoveryController : RecoveryController;
            part ingressMonitor : IngressMonitor;
        }
        part def NavigationSignaling;
        part def DataRecording;
        part def ObservationPayload;

        #system part def Boat {
            doc /* Blue Dog combines hull and rig, power, sensing, control, sail and rudder actuation, communications, recovery, signaling and recording to complete the Gorge circuit. These groups identify the work the boat must perform. IC-01 describes the proposed equipment; its hardware still needs selection and testing.*/
            part hullAndRig : HullAndRig;
            part energy : EnergySubsystem;
            part navigation : NavigationAndSensing;
            part control : GuidanceAndControl;
            part actuation : SailAndSteeringActuation;
            part communications : Communications;
            part recovery : HealthAndRecovery;
            part recording : DataRecording;
            part signaling : NavigationSignaling;
            part observationPayload : ObservationPayload [0..1];
        }
        #systemContext part def MissionContext {
            part boat : Boat :>> systemOfInterest;
            part operator : Operator :>> users;
            part shoreSupport : ShoreSupport :> externalSystems;
            part :>> environment : Environment;
            part traffic : OtherVessel [0..*] :> externalSystems;
        }
        part missionContext : MissionContext;
    }

}

package BlueDogLogicalArchitecture {
    private import OOSEM::*;
    private import ScalarValues::*;
    doc /* The onboard functions estimate position and wind, assess traffic and safety, plan sailing commands, decide which operations are allowed, operate the actuators, manage recovery, store records and communicate with shore. Their connections carry observations, permissions, commands and records. The physical architecture assigns these functions to proposed equipment.*/

    #ioEntity item def NavigationEstimate {
        attribute coordinateReference : String;
        attribute headingReference : String;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute valid : Boolean;
        attribute observedAt : ISQ::TimeValue;
        attribute latitude : ISQ::AngularMeasureValue;
        attribute longitude : ISQ::AngularMeasureValue;
        attribute heading : ISQ::AngularMeasureValue;
    }
    #ioEntity item def SafetyObservation {
        attribute valid : ScalarValues::Boolean;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute capsized : Boolean;
        attribute uprightControlRestored : Boolean;
        attribute requiredSafetyConfirmed : Boolean;
        attribute observedAt : ISQ::TimeValue;
        doc /* Reports whether navigation, traffic assessment, boundary awareness, energy and recovery remain available. A failed primary component may be covered by a working backup. Continued operation after capsize or a switch to backup equipment requires observations confirming that the required functions still work.*/
    }
    #ioEntity item def ReserveAssessment {
        attribute observedAt : ISQ::TimeValue;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute usableEnergy : ISQ::EnergyValue;
        attribute protectedReserve : ISQ::EnergyValue;
        attribute threatened : Boolean;
        attribute valid : Boolean;
    }
    #ioEntity item def TrafficAssessment {
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute conflict : Boolean;
        attribute valid : Boolean;
        attribute observedAt : ISQ::TimeValue;
    }
    #ioEntity item def BoundaryAssessment {
        attribute observedAt : ISQ::TimeValue;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute insidePermittedArea : Boolean;
        attribute avoidanceRequired : Boolean;
        attribute valid : Boolean;
        doc /* Evaluated against the configured water domain, exclusions and
         * current navigation observation; this is not a surveyed-site approval. */
    }
    #ioEntity item def TrafficTrack {
        attribute bearingReference : String;
        attribute rangeReference : String;
        attribute headingReference : String;
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute identity : String;
        attribute observedAt : ISQ::TimeValue;
        attribute bearing : ISQ::AngularMeasureValue;
        attribute range : ISQ::LengthValue;
        attribute speed : ISQ::SpeedValue;
        attribute heading : ISQ::AngularMeasureValue;
        attribute valid : Boolean;
        doc /* A tracked contact may come from AIS or non-cooperative sensing.
         * Declared observation validity does not establish detection coverage. */
    }
    #ioEntity item def TrafficObservation {
        attribute valid : ScalarValues::Boolean;
        attribute observedAt : ISQ::TimeValue;
        item context : BlueDogInterfaceContracts::ObservationContext;
        item tracks : TrafficTrack [0..*];
        attribute coverageConfirmed : Boolean;
    }
    #ioEntity item def OperationPermission {
        item context : BlueDogInterfaceContracts::CommandContext;
        attribute sailingPermitted : Boolean;
        attribute gateScoringPermitted : Boolean;
        attribute harvestPermitted : Boolean;
        attribute abortLatched : Boolean;
        attribute qualificationLost : Boolean;
    }
    #ioEntity item def RecoveryCommand {
        item context : BlueDogInterfaceContracts::CommandContext;
        attribute recoveryRequested : Boolean;
        attribute propulsionPermitted : Boolean;
        doc /* Powered recovery follows qualification loss. This command does
         * not assert shore reachability or available independent hardware. */
    }
    #ioEntity item def MissionRecord {
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute eventKind : String;
        attribute observedAt : ISQ::TimeValue;
        attribute qualificationLost : Boolean;
        attribute abortLatched : Boolean;
    }
    port def NavigationOutput { out item estimate : NavigationEstimate; }
    port def NavigationInput { in item estimate : NavigationEstimate; }
    port def WindOutput { out item estimate : BlueDogMethod::WindEstimate; }
    port def WindInput { in item estimate : BlueDogMethod::WindEstimate; }
    port def LinkOutput { out item observation : BlueDogMethod::LinkObservation; }
    port def LinkInput { in item observation : BlueDogMethod::LinkObservation; }
    port def SafetyOutput { out item observation : SafetyObservation; }
    port def SafetyInput { in item observation : SafetyObservation; }
    port def ReserveOutput { out item assessment : ReserveAssessment; }
    port def ReserveInput { in item assessment : ReserveAssessment; }
    port def TrafficOutput { out item assessment : TrafficAssessment; }
    port def TrafficInput { in item assessment : TrafficAssessment; }
    port def BoundaryOutput { out item assessment : BoundaryAssessment; }
    port def BoundaryInput { in item assessment : BoundaryAssessment; }
    port def TracksOutput { out item observation : TrafficObservation; }
    port def TracksInput { in item observation : TrafficObservation; }
    port def PermissionOutput { out item permission : OperationPermission; }
    port def PermissionInput { in item permission : OperationPermission; }
    port def CommandOutput { out item command : BlueDogMethod::SailingCommand; }
    port def CommandInput { in item command : BlueDogMethod::SailingCommand; }
    port def RecordOutput { out item record : MissionRecord; }
    port def RecordInput { in item record : MissionRecord; }
    port def RecoveryOutput { out item command : RecoveryCommand; }
    port def RecoveryInput { in item command : RecoveryCommand; }

    #logical part def NavigationEstimation { port navigation : NavigationOutput; }
    #logical part def WindEstimation { port wind : WindOutput; }
    #logical part def SafetyAssessment { port safety : SafetyOutput; }
    #logical part def EnergyManagement { port reserve : ReserveOutput; }
    #logical part def TrafficObservationService { port tracks : TracksOutput; }
    #logical part def CollisionAssessment {
        port tracks : TracksInput;
        port navigation : NavigationInput;
        port traffic : TrafficOutput;
    }
    #logical part def BoundaryManagement {
        port navigation : NavigationInput;
        port boundary : BoundaryOutput;
    }
    #logical part def MissionSupervision {
        port navigation : NavigationInput;
        port wind : WindInput;
        port link : LinkInput;
        port safety : SafetyInput;
        port reserve : ReserveInput;
        port traffic : TrafficInput;
        port boundary : BoundaryInput;
        port permissions : PermissionOutput;
        port events : RecordOutput;
    }
    #logical part def Guidance {
        port navigation : NavigationInput;
        port wind : WindInput;
        port boundary : BoundaryInput;
        port permissions : PermissionInput;
        port commands : CommandOutput;
    }
    #logical part def SailingActuation {
        port commands : CommandInput;
        port permissions : PermissionInput;
    }
    #logical part def RecoveryManagement {
        doc /* Choose and update a reachable shore retrieval route using position, traffic, boundaries, remaining safety functions and available energy. Send permitted propulsion commands to RecoveryActuation. The recovery plan must also account for reaching and staying at a place where the operator can retrieve the boat.*/
        port navigation : NavigationInput;
        port tracks : TracksInput;
        port boundary : BoundaryInput;
        port events : RecordOutput;
        port safety : SafetyInput;
        port reserve : ReserveInput;
        port permissions : PermissionInput;
        port commands : RecoveryOutput;
    }
    #logical part def RecoveryActuation {
        port commands : RecoveryInput;
        doc /* Apply permitted recovery propulsion commands. Tests must measure delivered thrust, operation after capsize, arrival at the retrieval location and the ability to stay there.*/
    }
    #logical part def Recording {
        port events : RecordInput;
        port retained : RecordOutput;
    }
    #logical part def Communications {
        port events : RecordInput;
        port retained : RecordInput;
        port status : LinkOutput;
    }
    part def LogicalVessel {
        doc /* Navigation and wind estimates feed guidance. Traffic, boundary, safety and energy assessments feed the supervisor, which grants or withdraws permission to sail or recover. Actuators apply permitted commands. Recovery planning selects a route to shore; recording and communications preserve and report the attempt history.*/
        part navigation : NavigationEstimation;
        part wind : WindEstimation;
        part safety : SafetyAssessment;
        part energy : EnergyManagement;
        part collision : CollisionAssessment;
        part boundary : BoundaryManagement;
        part trafficObservation : TrafficObservationService;
        part supervision : MissionSupervision;
        part guidance : Guidance;
        part actuation : SailingActuation;
        part recovery : RecoveryManagement;
        part recoveryActuation : RecoveryActuation;
        part recording : Recording;
        part communications : Communications;
        flow navigationToSupervisor from navigation.navigation.estimate to supervision.navigation.estimate;
        flow navigationToGuidance from navigation.navigation.estimate to guidance.navigation.estimate;
        flow windToGuidance from wind.wind.estimate to guidance.wind.estimate;
        flow windToSupervisor from wind.wind.estimate to supervision.wind.estimate;
        flow linkToSupervisor from communications.status.observation to supervision.link.observation;
        flow safetyToSupervisor from safety.safety.observation to supervision.safety.observation;
        flow safetyToRecovery from safety.safety.observation to recovery.safety.observation;
        flow reserveToSupervisor from energy.reserve.assessment to supervision.reserve.assessment;
        flow reserveToRecovery from energy.reserve.assessment to recovery.reserve.assessment;
        flow trafficToSupervisor from collision.traffic.assessment to supervision.traffic.assessment;
        flow tracksToCollision from trafficObservation.tracks.observation to collision.tracks.observation;
        flow navigationToCollision from navigation.navigation.estimate to collision.navigation.estimate;
        flow navigationToBoundary from navigation.navigation.estimate to boundary.navigation.estimate;
        flow boundaryToSupervisor from boundary.boundary.assessment to supervision.boundary.assessment;
        flow boundaryToGuidance from boundary.boundary.assessment to guidance.boundary.assessment;
        flow permissionsToGuidance from supervision.permissions.permission to guidance.permissions.permission;
        flow permissionsToActuation from supervision.permissions.permission to actuation.permissions.permission;
        flow permissionsToRecovery from supervision.permissions.permission to recovery.permissions.permission;
        flow sailingCommands from guidance.commands.command to actuation.commands.command;
        flow supervisorRecords from supervision.events.record to recording.events.record;
        flow supervisorTelemetry from supervision.events.record to communications.events.record;
        flow navigationToRecovery from navigation.navigation.estimate to recovery.navigation.estimate;
        flow tracksToRecovery from trafficObservation.tracks.observation to recovery.tracks.observation;
        flow boundaryToRecovery from boundary.boundary.assessment to recovery.boundary.assessment;
        flow recoveryCommands from recovery.commands.command to recoveryActuation.commands.command;
        flow recoveryRecords from recovery.events.record to recording.events.record;
        flow recoveryTelemetry from recovery.events.record to communications.events.record;
        flow retainedRecordsToCommunications from recording.retained.record to communications.retained.record;
    }
    part vessel : LogicalVessel;
}

package BlueDogPhysicalArchitecture {
    private import OOSEM::*;
    private import ScalarValues::*;
    private import BlueDogLogicalArchitecture::*;
    doc /* IC-01 proposes primary sailing equipment and a separate recovery battery, navigation sensors, observation equipment, controller and propulsor. The design aims to preserve recovery after a primary failure. Hardware tests must establish which faults each path can survive, including flooding and capsize. Equipment choices, wiring, connectors, supply ratings and data rates remain open.*/
    #ioEntity item def ElectricalSupply {
        attribute availablePower : ISQ::PowerValue;
        attribute available : Boolean;
    }
    #ioEntity item def MonitoredBankState {
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute usableEnergy : ISQ::EnergyValue;
        attribute valid : Boolean;
        attribute observedAt : ISQ::TimeValue;
        doc /* Reports estimated usable battery energy, observation time and validity. Energy management compares this estimate with the energy needed for the current recovery route.*/
    }
    port def SupplyOutput { out item electrical : ElectricalSupply; }
    port def SupplyInput { in item electrical : ElectricalSupply; }
    port def BankStateOutput { out item observation : MonitoredBankState; }
    port def BankStateInput { in item observation : MonitoredBankState; }
    #hardware part def Battery {
        attribute nameplateWh : Real;
        port output : SupplyOutput;
        port monitor : BankStateOutput;
        doc /* Stores electrical energy and supplies the connected equipment. Its monitor must estimate usable energy and report observation time and validity. Sensing, calibration and installation still need to be selected.*/
    }
    #hardware part def NavigationSensors {
        port power : SupplyInput;
        port navigation : NavigationOutput;
    }
    #hardware part def WindSensor {
        ref part installation : BlueDogWindEquipment::Installation = BlueDogWindEquipment::challenge;
        port power : SupplyInput;
        port wind : WindOutput;
    }
    #hardware part def ObservationEquipment {
        port power : SupplyInput;
        port tracks : TracksOutput;
    }
    #hardware part def Controller {
        port power : SupplyInput;
        port link : LinkInput;
        port navigation : NavigationInput;
        port wind : WindInput;
        port tracks : TracksInput;
        port safety : SafetyInput;
        port assessedSafety : SafetyOutput;
        port mainBank : BankStateInput;
        port recoveryBank : BankStateInput;
        port commands : CommandOutput;
        port recovery : RecoveryOutput;
        port permissions : PermissionOutput;
        port peerPermissions : PermissionInput;
        port retained : RecordInput;
        port events : RecordOutput;
        doc /* Combines sensor, actuator, battery and health observations to assess safety and issue permitted sailing or recovery commands. The software, peer timeout and failure detection need to be designed and tested, including incorrect or missing peer reports.*/
    }
    #hardware part def SailingActuators {
        port power : SupplyInput;
        port commands : CommandInput;
        port permissions : PermissionInput;
    }
    #hardware part def RecoveryPropulsor {
        port power : SupplyInput;
        port recovery : RecoveryInput;
    }
    #hardware part def RecordStorage {
        port power : SupplyInput;
        port events : RecordInput;
        port retained : RecordOutput;
        doc /* Stores mission events and provides records for delayed telemetry. The design still needs a power supply, access rules and retention behavior that preserve the required records after a primary fault.*/
    }
    #hardware part def TelemetryEquipment {
        port power : SupplyInput;
        port events : RecordInput;
        port status : LinkOutput;
    }
    #hardware part def IC01Candidate {
        doc /* The IC-01 equipment proposal combines hull and rig, primary sailing power and controls, a separate recovery power and control path, telemetry and record storage. Hardware selection and tests must establish mass, electrical demand, sealing, capsize performance and recovery after faults.*/
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata issue : ModelingMetadata::Issue {
            text = "Recovery still needs tests for shared faults, operation after capsize, sealing, installed loads and interfaces. The power supplies for telemetry and record storage are undecided. The recovery model currently assumes 8 W of essential load and a 60 Wh battery; installed measurements must establish demand and usable capacity.";
        }
        part mainBattery : Battery { attribute :>> nameplateWh = BlueDogIC01::design.battery_Wh; }
        part recoveryBattery : Battery { attribute :>> nameplateWh = BlueDogIC01::integration.recoveryBatteryWh; }
        part primaryNavigation : NavigationSensors;
        part windSensor : WindSensor;
        part primaryObservation : ObservationEquipment;
        part primaryController : Controller;
        part sailingActuators : SailingActuators;
        part recoveryNavigation : NavigationSensors;
        part recoveryObservation : ObservationEquipment;
        part recoveryController : Controller;
        part recoveryPropulsor : RecoveryPropulsor;
        part recordStorage : RecordStorage;
        part telemetry : TelemetryEquipment;
        part hullAndRig : BlueDog::Architecture::HullAndRig;
        flow mainNavigationPower from mainBattery.output.electrical to primaryNavigation.power.electrical;
        flow windPower from mainBattery.output.electrical to windSensor.power.electrical;
        flow mainObservationPower from mainBattery.output.electrical to primaryObservation.power.electrical;
        flow mainControllerPower from mainBattery.output.electrical to primaryController.power.electrical;
        flow sailingPower from mainBattery.output.electrical to sailingActuators.power.electrical;
        flow recoveryNavigationPower from recoveryBattery.output.electrical to recoveryNavigation.power.electrical;
        flow recoveryObservationPower from recoveryBattery.output.electrical to recoveryObservation.power.electrical;
        flow recoveryControllerPower from recoveryBattery.output.electrical to recoveryController.power.electrical;
        flow recoveryPropulsionPower from recoveryBattery.output.electrical to recoveryPropulsor.power.electrical;
        flow mainBankToPrimary from mainBattery.monitor.observation to primaryController.mainBank.observation;
        flow recoveryBankToPrimary from recoveryBattery.monitor.observation to primaryController.recoveryBank.observation;
        flow recoveryBankToRecovery from recoveryBattery.monitor.observation to recoveryController.recoveryBank.observation;
        flow mainBankToRecovery from mainBattery.monitor.observation to recoveryController.mainBank.observation;
        flow primaryNavigationData from primaryNavigation.navigation.estimate to primaryController.navigation.estimate;
        flow windData from windSensor.wind.estimate to primaryController.wind.estimate;
        flow primaryTrafficData from primaryObservation.tracks.observation to primaryController.tracks.observation;
        flow primarySafetyToRecovery from primaryController.assessedSafety.observation to recoveryController.safety.observation;
        flow recoverySafetyToPrimary from recoveryController.assessedSafety.observation to primaryController.safety.observation;
        flow sailingPermissions from primaryController.permissions.permission to sailingActuators.permissions.permission;
        flow primaryPermissionsToRecovery from primaryController.permissions.permission to recoveryController.peerPermissions.permission;
        flow recoveryPermissionsToPrimary from recoveryController.permissions.permission to primaryController.peerPermissions.permission;
        flow sailingCommandData from primaryController.commands.command to sailingActuators.commands.command;
        flow recoveryNavigationData from recoveryNavigation.navigation.estimate to recoveryController.navigation.estimate;
        flow recoveryTrafficData from recoveryObservation.tracks.observation to recoveryController.tracks.observation;
        flow recoveryCommandData from recoveryController.recovery.command to recoveryPropulsor.recovery.command;
        flow primaryRecords from primaryController.events.record to recordStorage.events.record;
        flow recoveryRecords from recoveryController.events.record to recordStorage.events.record;
        flow primaryTelemetry from primaryController.events.record to telemetry.events.record;
        flow recoveryTelemetry from recoveryController.events.record to telemetry.events.record;
        flow primaryLinkStatus from telemetry.status.observation to primaryController.link.observation;
        flow recoveryLinkStatus from telemetry.status.observation to recoveryController.link.observation;
        flow primaryRecordReadback from recordStorage.retained.record to primaryController.retained.record;
        flow recoveryRecordReadback from recordStorage.retained.record to recoveryController.retained.record;
    }
    part ic01 : IC01Candidate {
        ref part configuration : MarineDesign::Design = BlueDogIC01::design;
        ref part integration = BlueDogIC01::integration;
        doc /* Candidate assembly for this named geometry and capability hypothesis.
         * Configuration references do not qualify installed hardware. */
    }
}
