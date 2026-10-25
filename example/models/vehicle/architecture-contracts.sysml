package BlueDogArchitectureContracts {
    private import ScalarValues::*;
    doc /* Project allocation conventions, not a new relationship engine.
     * Primary/recovery label implementation paths, not automatic mode selection
     * or proof of independent operation. Each mapping is a provisional claim. */
    enum def ImplementationPath { primary; recovery; shared; }
    allocation def ContextMapping {
        end part context;
        end part logical;
        attribute scope : String;
    }
    allocation def IC01Responsibility {
        end part logical;
        end part implementation;
        ref part configuration : MarineDesign::Design = BlueDogIC01::design;
        attribute path : ImplementationPath;
        attribute scope : String;
    }
    allocation def IC01Exchange {
        end occurrence logical;
        end occurrence implementation;
        ref part configuration : MarineDesign::Design = BlueDogIC01::design;
        attribute path : ImplementationPath;
        attribute scope : String;
        doc /* Map a logical transfer to a candidate transfer. A common payload
         * definition preserves meaning; latency, arbitration, encoding and
         * installed protocol remain interface decisions, not implied by this link. */
    }
    allocation def IC01InternalExchange {
        end occurrence logical;
        end part implementation;
        ref part configuration : MarineDesign::Design = BlueDogIC01::design;
        attribute path : ImplementationPath;
        attribute scope : String;
        doc /* Interaction between responsibilities allocated to one controller.
         * This records an internal implementation obligation, not an existing
         * software call or measured scheduling/latency guarantee. */
    }
}

package BlueDogArchitectureCorrespondence {
    private import BlueDogArchitectureContracts::*;
    private import BlueDogLogicalArchitecture::vessel;
    private import BlueDogPhysicalArchitecture::ic01;
    private import BlueDog::Architecture::missionContext;
    doc /* Cross-description mappings for the finite-Gorge IC-01 hypothesis.
     * Logical/implementation allocation can be many-to-many. The scope on each
     * link identifies the contribution; no allocation asserts physical acceptance.
     * Source configurations and historical evidence retain their own identity. */
    metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
    metadata interfaceDecisions : ModelingMetadata::Issue {
        text = "Resolve sensor freshness and validity propagation; peer timeout, authority arbitration and startup after primary loss; independent inverted safety observations; controller software deployment and timing; recording/telemetry power, retention and arbitration. Existing IC-01 mass and energy allowances are hypotheses, not a bill of materials or installed-load evidence.";
    }
    metadata contextLimits : ModelingMetadata::Issue {
        text = "Navigation signaling has a context responsibility and requirements but no detailed logical interface or IC-01 equipment allocation. Optional observation payload and future harvesting remain outside this finite-Gorge implementation. Hull/rig composition and operator launch/pickup stay in their physical and human descriptions; they are not fictitious controller functions.";
    }
    allocation contextEnergy : ContextMapping allocate missionContext.boat.energy to vessel.energy { attribute :>> scope = "Reserve estimation and protection"; }
    allocation contextNavigation : ContextMapping allocate missionContext.boat.navigation to vessel.navigation { attribute :>> scope = "Position and attitude estimation"; }
    allocation contextWind : ContextMapping allocate missionContext.boat.navigation to vessel.wind { attribute :>> scope = "Apparent wind estimates"; }
    allocation contextTrafficObservation : ContextMapping allocate missionContext.boat.navigation to vessel.trafficObservation { attribute :>> scope = "Traffic observations"; }
    allocation contextSupervision : ContextMapping allocate missionContext.boat.control to vessel.supervision { attribute :>> scope = "Permissions and qualification state"; }
    allocation contextGuidance : ContextMapping allocate missionContext.boat.control to vessel.guidance { attribute :>> scope = "Sailing commands"; }
    allocation contextCollision : ContextMapping allocate missionContext.boat.control to vessel.collision { attribute :>> scope = "Encounter assessment"; }
    allocation contextBoundary : ContextMapping allocate missionContext.boat.control to vessel.boundary { attribute :>> scope = "Operating domain assessment"; }
    allocation contextActuation : ContextMapping allocate missionContext.boat.actuation to vessel.actuation { attribute :>> scope = "Sail and steering execution"; }
    allocation contextCommunications : ContextMapping allocate missionContext.boat.communications to vessel.communications { attribute :>> scope = "Onboard telemetry and link status"; }
    allocation contextSafety : ContextMapping allocate missionContext.boat.recovery to vessel.safety { attribute :>> scope = "Required safety capability assessment"; }
    allocation contextRecovery : ContextMapping allocate missionContext.boat.recovery to vessel.recovery { attribute :>> scope = "Shore recovery planning and control"; }
    allocation contextRecoveryActuation : ContextMapping allocate missionContext.boat.recovery to vessel.recoveryActuation { attribute :>> scope = "Recovery propulsion execution"; }
    allocation contextRecording : ContextMapping allocate missionContext.boat.recording to vessel.recording { attribute :>> scope = "Mission evidence retention and readback"; }
    allocation primaryNavigation : IC01Responsibility allocate vessel.navigation to ic01.primaryNavigation {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Acquire and supply primary time-stamped navigation estimates";
    }
    allocation recoveryNavigation : IC01Responsibility allocate vessel.navigation to ic01.recoveryNavigation {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Acquire and supply recovery-path navigation estimates";
    }
    allocation primaryNavigationValidation : IC01Responsibility allocate vessel.navigation to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Validate and consume primary navigation estimates; stale data cannot become confirmed safety";
    }
    allocation recoveryNavigationValidation : IC01Responsibility allocate vessel.navigation to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Validate recovery navigation independently of the primary estimate";
    }
    allocation wind : IC01Responsibility allocate vessel.wind to ic01.windSensor {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Supply apparent wind estimates with timestamp and validity";
    }
    allocation primarySafety : IC01Responsibility allocate vessel.safety to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Assess primary safety capability from observations; inverted evidence remains unresolved";
    }
    allocation recoverySafety : IC01Responsibility allocate vessel.safety to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Assess recovery safety capability; a peer report alone does not establish independence";
    }
    allocation primaryEnergy : IC01Responsibility allocate vessel.energy to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Estimate main and recovery reserve and protect recovery energy";
    }
    allocation recoveryEnergy : IC01Responsibility allocate vessel.energy to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Assess recovery-bank energy and route demand after primary loss";
    }
    allocation primaryCollision : IC01Responsibility allocate vessel.collision to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Assess traffic for sailing";
    }
    allocation recoveryCollision : IC01Responsibility allocate vessel.collision to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Assess traffic for powered recovery; implemented navigation-rule coverage remains open";
    }
    allocation primaryBoundary : IC01Responsibility allocate vessel.boundary to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Assess the configured sailing domain";
    }
    allocation recoveryBoundary : IC01Responsibility allocate vessel.boundary to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Assess recovery route boundaries and permitted shore approach";
    }
    allocation primaryObservation : IC01Responsibility allocate vessel.trafficObservation to ic01.primaryObservation {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Acquire primary traffic tracks; detection coverage remains unverified";
    }
    allocation recoveryObservation : IC01Responsibility allocate vessel.trafficObservation to ic01.recoveryObservation {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Acquire recovery traffic tracks including the unresolved inverted installation";
    }
    allocation primarySupervision : IC01Responsibility allocate vessel.supervision to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Sailing and gate permissions, qualification and abort state";
    }
    allocation recoverySupervision : IC01Responsibility allocate vessel.supervision to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Recovery-side qualification restrictions and fallback authority; primary-loss arbitration remains open";
    }
    allocation guidance : IC01Responsibility allocate vessel.guidance to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Select sailing guidance subject to current permissions";
    }
    allocation sailingActuation : IC01Responsibility allocate vessel.actuation to ic01.sailingActuators {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Execute permitted sailing commands";
    }
    allocation recoveryManagement : IC01Responsibility allocate vessel.recovery to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Plan, reassess and command recovery; does not itself produce thrust or retrieve the boat";
    }
    allocation recoveryActuation : IC01Responsibility allocate vessel.recoveryActuation to ic01.recoveryPropulsor {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Execute permitted recovery commands; achieved upright/inverted thrust remains unverified";
    }
    allocation recordStorage : IC01Responsibility allocate vessel.recording to ic01.recordStorage {
        attribute :>> path = ImplementationPath::shared;
        attribute :>> scope = "Persist and expose records; supply and post-fault availability remain unresolved";
    }
    allocation primaryRecordPolicy : IC01Responsibility allocate vessel.recording to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Generate and schedule primary records and readback";
    }
    allocation recoveryRecordPolicy : IC01Responsibility allocate vessel.recording to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Generate and schedule recovery records; shared-storage survival is unverified";
    }
    allocation telemetry : IC01Responsibility allocate vessel.communications to ic01.telemetry {
        attribute :>> path = ImplementationPath::shared;
        attribute :>> scope = "Transmit records and report link availability; supply and interface arbitration remain unresolved";
    }
    allocation primaryCommunications : IC01Responsibility allocate vessel.communications to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Queue and prioritize primary telemetry without blocking autonomy";
    }
    allocation recoveryCommunications : IC01Responsibility allocate vessel.communications to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Queue and prioritize recovery telemetry; autonomy does not require a link";
    }
    allocation navigationToSupervisorPrimaryNavigationData : IC01Exchange allocate vessel.navigationToSupervisor to ic01.primaryNavigationData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToSupervisorRecoveryNavigationData : IC01Exchange allocate vessel.navigationToSupervisor to ic01.recoveryNavigationData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToGuidancePrimaryNavigationData : IC01Exchange allocate vessel.navigationToGuidance to ic01.primaryNavigationData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation windToGuidanceWindData : IC01Exchange allocate vessel.windToGuidance to ic01.windData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation windToSupervisorWindData : IC01Exchange allocate vessel.windToSupervisor to ic01.windData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation linkToSupervisorPrimaryLinkStatus : IC01Exchange allocate vessel.linkToSupervisor to ic01.primaryLinkStatus {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation linkToSupervisorRecoveryLinkStatus : IC01Exchange allocate vessel.linkToSupervisor to ic01.recoveryLinkStatus {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation safetyToSupervisorRecoverySafetyToPrimary : IC01Exchange allocate vessel.safetyToSupervisor to ic01.recoverySafetyToPrimary {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation safetyToSupervisorPrimarySafetyToRecovery : IC01Exchange allocate vessel.safetyToSupervisor to ic01.primarySafetyToRecovery {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation safetyToRecoveryPrimarySafetyToRecovery : IC01Exchange allocate vessel.safetyToRecovery to ic01.primarySafetyToRecovery {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation tracksToCollisionPrimaryTrafficData : IC01Exchange allocate vessel.tracksToCollision to ic01.primaryTrafficData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation tracksToCollisionRecoveryTrafficData : IC01Exchange allocate vessel.tracksToCollision to ic01.recoveryTrafficData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToCollisionPrimaryNavigationData : IC01Exchange allocate vessel.navigationToCollision to ic01.primaryNavigationData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToCollisionRecoveryNavigationData : IC01Exchange allocate vessel.navigationToCollision to ic01.recoveryNavigationData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToBoundaryPrimaryNavigationData : IC01Exchange allocate vessel.navigationToBoundary to ic01.primaryNavigationData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToBoundaryRecoveryNavigationData : IC01Exchange allocate vessel.navigationToBoundary to ic01.recoveryNavigationData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation permissionsToActuationSailingPermissions : IC01Exchange allocate vessel.permissionsToActuation to ic01.sailingPermissions {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation permissionsToRecoveryPrimaryPermissionsToRecovery : IC01Exchange allocate vessel.permissionsToRecovery to ic01.primaryPermissionsToRecovery {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation sailingCommandsSailingCommandData : IC01Exchange allocate vessel.sailingCommands to ic01.sailingCommandData {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation supervisorRecordsPrimaryRecords : IC01Exchange allocate vessel.supervisorRecords to ic01.primaryRecords {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation supervisorRecordsRecoveryRecords : IC01Exchange allocate vessel.supervisorRecords to ic01.recoveryRecords {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation supervisorTelemetryPrimaryTelemetry : IC01Exchange allocate vessel.supervisorTelemetry to ic01.primaryTelemetry {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation supervisorTelemetryRecoveryTelemetry : IC01Exchange allocate vessel.supervisorTelemetry to ic01.recoveryTelemetry {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation navigationToRecoveryRecoveryNavigationData : IC01Exchange allocate vessel.navigationToRecovery to ic01.recoveryNavigationData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation tracksToRecoveryRecoveryTrafficData : IC01Exchange allocate vessel.tracksToRecovery to ic01.recoveryTrafficData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation recoveryCommandsRecoveryCommandData : IC01Exchange allocate vessel.recoveryCommands to ic01.recoveryCommandData {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation recoveryRecordsRecoveryRecords : IC01Exchange allocate vessel.recoveryRecords to ic01.recoveryRecords {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation recoveryTelemetryRecoveryTelemetry : IC01Exchange allocate vessel.recoveryTelemetry to ic01.recoveryTelemetry {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation retainedRecordsToCommunicationsPrimaryRecordReadback : IC01Exchange allocate vessel.retainedRecordsToCommunications to ic01.primaryRecordReadback {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation retainedRecordsToCommunicationsRecoveryRecordReadback : IC01Exchange allocate vessel.retainedRecordsToCommunications to ic01.recoveryRecordReadback {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Candidate payload transfer; installed timing, transport and fault handling remain to be specified";
    }
    allocation safetyToSupervisorPrimaryInternal : IC01InternalExchange allocate vessel.safetyToSupervisor to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation safetyToSupervisorRecoveryInternal : IC01InternalExchange allocate vessel.safetyToSupervisor to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation safetyToRecoveryRecoveryInternal : IC01InternalExchange allocate vessel.safetyToRecovery to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation reserveToSupervisorPrimaryInternal : IC01InternalExchange allocate vessel.reserveToSupervisor to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation reserveToSupervisorRecoveryInternal : IC01InternalExchange allocate vessel.reserveToSupervisor to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation reserveToRecoveryRecoveryInternal : IC01InternalExchange allocate vessel.reserveToRecovery to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation trafficToSupervisorPrimaryInternal : IC01InternalExchange allocate vessel.trafficToSupervisor to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation trafficToSupervisorRecoveryInternal : IC01InternalExchange allocate vessel.trafficToSupervisor to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation boundaryToSupervisorPrimaryInternal : IC01InternalExchange allocate vessel.boundaryToSupervisor to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation boundaryToSupervisorRecoveryInternal : IC01InternalExchange allocate vessel.boundaryToSupervisor to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation boundaryToGuidancePrimaryInternal : IC01InternalExchange allocate vessel.boundaryToGuidance to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation permissionsToGuidancePrimaryInternal : IC01InternalExchange allocate vessel.permissionsToGuidance to ic01.primaryController {
        attribute :>> path = ImplementationPath::primary;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation permissionsToRecoveryRecoveryInternal : IC01InternalExchange allocate vessel.permissionsToRecovery to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
    allocation boundaryToRecoveryRecoveryInternal : IC01InternalExchange allocate vessel.boundaryToRecovery to ic01.recoveryController {
        attribute :>> path = ImplementationPath::recovery;
        attribute :>> scope = "Internal interaction of coallocated responsibilities; software scheduling, validity propagation and fault handling remain unresolved";
    }
}
