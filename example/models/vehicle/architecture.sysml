package BlueDog {
    doc /* Working architecture model, 2026-10-09.
     * Confirmed threshold: Bingen-Stevenson-Bingen round trip.
     * Repeated operation is a future endurance objective, outside current acceptance.
     * Qualifying round trips require no operator intervention; live monitoring is required.
     * Current design driver: one finite GorgeChallenge::transGorgeChallenge round trip.
     * Goals::hawaiiVoyage is a separate future mission with its own constraints.
     * Multi-day endurance with energy harvesting remains an earlier intent. SysML v2 learning is a project goal.
     * Decomposition identifies responsibilities; physical design remains open.
     * Tool checks are recorded in the modeling guide; design satisfaction links
     * are maintained separately and do not establish verification.
     */

    private import GorgeChallenge::*;
    private import OOSEM::*;

    package DesignIntent {
        doc /* Owner-imposed project constraints: one-person transport, construction on a
         * 250 mm cubic desktop printer, and serviceability between deployments. These
         * remain binding alongside the finite Gorge mission, not consequences of sailing success.
         */
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
            doc /* Mission decomposition supporting Goals::hawaiiVoyage.
             * This is not an executable sequence or a verified mission plan.
             * Route, landfall, endurance, and recovery criteria remain open.
             */
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
            doc /* Activity decomposition, not execution order.
             * TransGorgeCourse defines marker-referenced gates, subject to course release review.
             * The finite challenge has no completion deadline. GorgeChallenge defines
             * monitoring and recovery obligations; environmental allocations and
             * real recovery sites remain subject to review.
             * No operator intervention is permitted during a qualifying round trip.
             */
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
            doc /* Stretch mission, not required for the initial round trip.
             * Station-keeping area, measurement products, and accuracy TBD.
             */
            action reachObservationArea;
            action maintainObservationArea;
            action measureAndRecordConditions;
            action returnForRecovery;
        }
    }

    package Architecture {
        doc /* System responsibility and external-context description. Boat is
         * not an installed assembly. BlueDogArchitectureCorrespondence maps its
         * responsibilities to LogicalVessel; IC01Candidate owns the provisional
         * equipment composition. HullAndRig remains a shared hardware concept. */
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
            doc /* Soft sail, tail-controlled rigid wing and directly rotated
             * fixed-camber wing retain equal development standing. No selected
             * rig or physical demonstration is implied by this responsibility. */
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
            doc /* System responsibility breakdown with identified hardware concepts.
             * Candidate architecture for the finite Gorge challenge. Future missions require separate allocation.
             * BlueDogLogicalArchitecture defines implementation-independent exchanges.
             * BlueDogPhysicalArchitecture describes a provisional IC-01 realization;
             * neither this responsibility tree nor that candidate establishes hardware qualification.
             */
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
    doc /* Implementation-independent responsibilities and information exchanges.
     * Ports describe information contracts, not buses, processors or installed
     * equipment. Native scenario allocations identify who performs each action.
     * Candidate realization is separate in BlueDogPhysicalArchitecture. */

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
        doc /* Confirmation covers currently required navigation, collision
         * assessment, boundary awareness, energy and recovery capabilities.
         * A primary failure is distinct from loss of the required capability.
         * Confirmation while inverted or using backup equipment requires explicit
         * evidence; absence of that observation cannot establish safe continuation. */
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
        doc /* Select and reassess a reachable shore plan and command recovery.
         * Navigation, traffic, boundary and reserve assessments are explicit
         * inputs. Thrust execution belongs to RecoveryActuation; shore capture
         * and operator pickup remain separate physical/procedural obligations. */
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
        doc /* Execute permitted recovery propulsion. A command is not evidence
         * of achieved thrust, inverted operation, shore arrival or retention. */
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
    doc /* Provisional physical realization of IC-01's mass/energy and recovery
     * hypothesis. Separate parts make intended fault containment inspectable;
     * they do not demonstrate electrical, software or environmental independence.
     * Catalog equipment, processor partition and installed sensing remain open.
     * Ports and flows identify candidate interfaces without specifying connector,
     * bus, voltage, current, throughput or proven inverted performance. */
    #ioEntity item def ElectricalSupply {
        attribute availablePower : ISQ::PowerValue;
        attribute available : Boolean;
    }
    #ioEntity item def MonitoredBankState {
        item context : BlueDogInterfaceContracts::ObservationContext;
        attribute usableEnergy : ISQ::EnergyValue;
        attribute valid : Boolean;
        attribute observedAt : ISQ::TimeValue;
        doc /* Battery observation used with a route-dependent recovery demand;
         * nameplate capacity alone does not establish usable energy or reserve. */
    }
    port def SupplyOutput { out item electrical : ElectricalSupply; }
    port def SupplyInput { in item electrical : ElectricalSupply; }
    port def BankStateOutput { out item observation : MonitoredBankState; }
    port def BankStateInput { in item observation : MonitoredBankState; }
    #hardware part def Battery {
        attribute nameplateWh : Real;
        port output : SupplyOutput;
        port monitor : BankStateOutput;
        doc /* The monitor is a candidate required interface; its sensing,
         * estimation and installation have not been selected or calibrated. */
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
        doc /* SafetyAssessment is allocated here; its output aggregates current
         * sensing, actuation, energy and health evidence, not navigation alone.
         * The implementation, peer-timeout policy and independent failure detection
         * are unresolved. Receiving a peer report does not prove its truth. */
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
        doc /* Readback supports queued telemetry. Retention, arbitration and
         * availability after a primary fault require an installed interface and
         * supply decision; this interface does not establish survivability. */
    }
    #hardware part def TelemetryEquipment {
        port power : SupplyInput;
        port events : RecordInput;
        port status : LinkOutput;
    }
    #hardware part def IC01Candidate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata issue : ModelingMetadata::Issue {
            text = "Independent recovery power, navigation, observation, control and thrust are unverified hypotheses. Establish common-cause isolation, inverted sensing/propulsion, sealing, load and interface evidence before hardware acceptance. Telemetry and record-storage bus assignment remains unresolved; the 8 W recovery essential-load allowance is not an installed load measurement or proof that those functions survive on the 60 Wh bank.";
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
