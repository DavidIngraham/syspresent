package BlueDogRequirements {
    private import RequirementDerivation::*;
    private import ModelingMetadata::refinement;
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    private import GorgeChallenge::*;
    private import BlueDog::Goals::*;
    requirement def <'M-001'> RoundTrip {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall sail from the Bingen departure gate, around buoy 16 near Stevenson, and through the Bingen finish gate in one qualifying attempt.*/
        comment conditions /* C-000 defines the governing finite challenge obligations. Course review, unassisted sail-only operation, safety capability, recovery reserve and the persistent attempt state apply throughout. Safe unassisted righting may preserve qualification; motor propulsion, external intervention or required safety-capability loss ends it. */
    }
    requirement def <'M-002'> MultiDayEndurance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall complete the qualifying round trip without servicing or external charging. */
        comment conditions /* N-010 operational functions and applicable N-001 shared conditions apply. The mission history includes sailing, maneuvers and holds until completion. Conservative usable energy must remain above the R-002 reserve. No fixed duration or nonnegative daily energy balance is required. */
        comment notes /* The mission may finish with less stored energy than at departure. */
    }
    requirement def <'E-001'> EnergyAwareness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel shall maintain conservative estimates of usable battery energy and the energy required for protected recovery. */
        comment conditions /* Energy estimation and conservative decision inputs; accuracy uses calibrated energy integration across operating battery temperatures. */
    }
    requirement def <'E-002'> NavigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall navigate the course and control its sail and rudder autonomously within the selected operating conditions.*/
        comment conditions /* Qualification uses the selected mission profile. Accuracy trials contain 1800 scheduled one-second epochs in 30 minutes; invalid or missing epochs count as failed epochs. Position and heading criteria use the same set of at least 1710 qualifying epochs, preventing separate selection of different good samples. Fault-injection runs are separate. */
    }
    requirement def <'E-003'> ResetRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After a watchdog reset, the vessel shall resume the autonomous behavior permitted by its retained operating mode.*/
        comment conditions /* Watchdog-reset tests start above protected reserve with valid navigation observations. Normal sailing remains subject to N-035; data and qualification persistence have shared leaf criteria. */
    }
    requirement def <'E-004'> LowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall keep the functions needed for safe recovery powered when the conservative estimate of usable energy reaches the recovery reserve.*/
        comment conditions /* Reserve means R-002. Emergency/recovery cadence takes precedence; clearing low-energy state is independent of other modes, while payload enabling respects all restrictions. */
    }
    requirement def <'E-005'> Communications {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall store telemetry during communication outages and deliver the stored records after reconnection.*/
        comment conditions /* Link availability is a delivery-test precondition, not a coverage guarantee. Normal, low-energy and recovery delivery cadence is 30 seconds, as allocated by GorgeChallenge::liveObservation. Outage tests last 24 hours. */
    }
    requirement def <'E-006'> IngressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall remain recoverable while fresh water enters its normally dry hull at 10 mL/min for 30 minutes.*/
        comment conditions /* All leaves use a 30-minute freshwater injection at 10 mL/min into the normally dry hull. No pump technology is prescribed; R-004 remains applicable. */
    }
    requirement def <'E-007'> MissionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall preserve timestamped mission records through communication outages and power interruptions.*/
        comment conditions /* Periodic records contain position, heading, mode, gate progress, battery energy and fault state. Critical events are independent of periodic cadence. Timestamp accuracy is assessed with valid GNSS time. */
    }
    requirement roundTrip : RoundTrip;
    requirement multiDayEndurance : MultiDayEndurance;
    requirement energyAwareness : EnergyAwareness;
    requirement navigationAndControl : NavigationAndControl;
    requirement resetRecovery : ResetRecovery;
    requirement lowEnergyRecovery : LowEnergyRecovery;
    requirement communications : Communications;
    requirement ingressResponse : IngressResponse;
    requirement missionEvidence : MissionEvidence;

    #refinement dependency challengeCourse from roundTrip to GorgeChallenge::courseCompletion {
        metadata rationale : ModelingMetadata::Rationale { text = "Ordered gate crossings use the marker-referenced proposal in TransGorgeCourse; operational release remains subject to course review."; }
    }
    dependency challengeEndurance from multiDayEndurance to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "The complete finite round trip, including holding and contingency exposure, determines required endurance. Repeated circuits are a separate future objective."; }
    }
    dependency challengeAutonomy from navigationAndControl to GorgeChallenge::unassistedAttempt {
        metadata rationale : ModelingMetadata::Rationale { text = "The vessel needs onboard guidance and control to complete an unassisted attempt."; }
    }
    dependency challengePropulsion from roundTrip to GorgeChallenge::sailingPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "Vehicle challenge operation excludes auxiliary motor propulsion; powered development tests are separate."; }
    }
    #refinement dependency challengeMonitoring from communications to GorgeChallenge::liveObservation {
        metadata rationale : ModelingMetadata::Rationale { text = "The vehicle telemetry requirement provides a more precise outage-retention and delivery specification for the observation aspect of C-005. Autonomous execution remains separately required."; }
    }
    dependency challengeOverride from communications to GorgeChallenge::emergencyIntervention {
        metadata rationale : ModelingMetadata::Rationale { text = "Vehicle communications provide emergency commands whose use ends attempt qualification."; }
    }

    // Derivations: direction is original requirement to derived requirement.
    dependency roundTripNavigation from navigationAndControl to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Autonomous completion of the route needs observations, guidance, and actuation."; }
    }
    dependency roundTripReset from resetRecovery to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "A reset during an autonomous journey must not leave mission behavior undefined."; }
    }
    dependency roundTripCommunications from communications to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Mission supervision and recovery need an agreed operator communication policy."; }
    }
    dependency roundTripIngress from ingressResponse to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Recovering the boat after the journey motivates a defined response to small leaks."; }
    }
    dependency roundTripEvidence from missionEvidence to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Assessing route completion and learning from the mission requires recorded evidence."; }
    }
    dependency enduranceEnergy from energyAwareness to multiDayEndurance {
        metadata rationale : ModelingMetadata::Rationale { text = "Multi-day operation with variable harvesting needs energy estimation and load management."; }
    }
    dependency enduranceLimpMode from lowEnergyRecovery to multiDayEndurance {
        metadata rationale : ModelingMetadata::Rationale { text = "Harvest shortfalls need an explicit degraded operating mode."; }
    }
    dependency energyLimpMode from lowEnergyRecovery to energyAwareness {
        metadata rationale : ModelingMetadata::Rationale { text = "Available-energy estimates and reserve policy must drive low-energy transitions."; }
    }

    requirement def <'P-001'> Transportability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall support transport, assembly, launch and retrieval by one adult under the specified handling conditions. */
        comment conditions /* Demonstrate with one adult, no powered lift, a firm bank or ramp of slope at most 1:12, wind at most 5 m/s and waves at most 0.2 m. This is not a survival-envelope recovery claim. */
    }
    requirement transportability : Transportability;
    dependency deriveTransportability from transportability to BlueDog::DesignIntent {
        metadata rationale : ModelingMetadata::Rationale { text = "The owner requires one-person handling independently of either voyage outcome."; }
    }

    attribute printBuildLimit : LengthValue = 250 [mm];
    requirement def <'P-002'> DesktopManufacture {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each print job shall fit within a 250 mm by 250 mm by 250 mm build volume.*/
        comment conditions /* Every printed component must be producible as one or more such jobs. The envelope includes the selected build orientation, supports, brim, raft and printer-required clearance. */
        attribute jobX : LengthValue;
        attribute jobY : LengthValue;
        attribute jobZ : LengthValue;
        attribute buildLimit : LengthValue = printBuildLimit;
        require constraint jobFits { PrintJobEnvelopeCriterion(jobX, jobY, jobZ, buildLimit) }
    }
    requirement desktopManufacture : DesktopManufacture;
    calc def PrintJobEnvelopeCriterion {
        in jobX : LengthValue;
        in jobY : LengthValue;
        in jobZ : LengthValue;
        in buildLimit : LengthValue;
        return verdict : Boolean;
        buildLimit > 0 [mm] and jobX > 0 [mm] and jobY > 0 [mm] and jobZ > 0 [mm] and
            jobX <= buildLimit and jobY <= buildLimit and jobZ <= buildLimit
    }
    dependency deriveDesktopManufacture from desktopManufacture to BlueDog::DesignIntent {
        metadata rationale : ModelingMetadata::Rationale { text = "The owner selected a 250 mm cubic desktop-printer build volume independently of mission completion."; }
    }

    requirement def <'P-003'> Serviceability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall support replacement of serviceable equipment without structural damage. */
        comment conditions /* Exercise individual replacement of the battery, every electronics module, every actuator and every serviceable enclosure seal by one operator using hand tools. */
    }
    requirement serviceability : Serviceability;
    dependency deriveServiceability from serviceability to BlueDog::DesignIntent {
        metadata rationale : ModelingMetadata::Rationale { text = "Between-attempt serviceability is a project lifecycle constraint; it is not entailed by unassisted endurance."; }
    }

    requirement def <'S-001'> TrafficSafety {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall detect and respond to traffic hazards within the reviewed limits for each target class, while avoiding collisions and allowing other vessels the passage required by navigation rules.*/
        metadata issue : ModelingMetadata::Issue { text = "BlueDogClassDetection defines the current class-specific allocation method. Numerical consequence, exposure, reliability, confidence and risk acceptance inputs remain unreviewed; hardware sensing and maneuver evidence is absent. Historical six-class 750 m analyses do not define the current requirement."; }
        comment conditions /* Use independently recorded head-on, crossing and overtaking AIS and non-AIS targets, day and night in the selected operational profile. Allocations shall include kinematic response distance, uncertainty, consequence-informed clearance and margins, and required timely observation and whole-response reliability with confidence criteria. Unreliably classified targets shall use a reviewed conservative envelope spanning plausible classes and occupant transitions. Collision avoidance and nonimpediment obligations remain unchanged.*/
    }
    requirement trafficSafety : TrafficSafety;
    #refinement dependency challengeTrafficResponse from BlueDogRequirements::trafficSafety to GorgeChallenge::trafficCoexistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-001 specifies observation, assessment and response supporting collision-free passage. Its reviewed performance envelopes are selected allocations; C-007 independently supplies navigation duties. No-contact outcome alone does not imply the assessment process."; }
    }
    dependency deriveTrafficSafety from trafficSafety to navigationAndControl {
        metadata rationale : ModelingMetadata::Rationale { text = "The boat must detect traffic and choose an avoidance maneuver while navigating the shared river."; }
    }

    requirement def <'S-002'> OperatingBoundary {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enforce the configured operating boundaries. */
        comment conditions /* Use uploaded permitted-water and exclusion polygons, with a 60-second prediction horizon. Inject approaches to every boundary, navigation loss and no-feasible-maneuver cases. Coordinates and uncertainty/clearance margins are controlled mission inputs with no default values. */
    }
    requirement operatingBoundary : OperatingBoundary;
    #refinement dependency challengeExclusions from operatingBoundary to GorgeChallenge::restrictedWaters {
        metadata rationale : ModelingMetadata::Rationale { text = "Configured polygons and predictive boundary handling refine the challenge exclusion obligation."; }
    }
    dependency deriveOperatingBoundary from operatingBoundary to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "The route must keep the boat inside permitted water and clear of restricted areas and obstacles."; }
    }

    requirement def <'S-003'> EmergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall support emergency control that permits abort, local motor isolation and safe response to remote-control loss.*/
        comment conditions /* Emergency intervention ends attempt qualification. Exercise abort, local isolation and remote-control loss with coexisting low-energy flags. S-110 through S-115 define the detailed acceptance criteria; powered shore-recovery capability is independently required by R-001. */
    }
    requirement emergencyControl : EmergencyControl;
    dependency deriveSafeRecovery from emergencyControl to GorgeChallenge::emergencyIntervention {
        metadata rationale : ModelingMetadata::Rationale { text = "Permitted emergency intervention requires explicit abort, qualification, isolation and control-loss behavior."; }
    }

    requirement def <'S-004'> NavigationConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present the navigation signals required for its operating mode. */
        comment conditions /* Use the deployment-specific compliance matrix for sailing, powered-recovery and stationary modes, including its visibility, arcs, colors and sound criteria. The matrix remains a deployment hold point under S-005. */
    }
    requirement navigationConspicuity : NavigationConspicuity;
    #refinement dependency challengeNavigationSignals from BlueDogRequirements::navigationConspicuity to GorgeChallenge::navigationRules {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-004 clarifies C-007 signal presentation during an attempt only. Its powered-recovery and stationary-mode coverage has the separate C-027 and deployment-matrix basis; those modes are not derived from attempt-only compliance."; }
    }
    dependency deriveNavigationConspicuity from navigationConspicuity to trafficSafety {
        metadata rationale : ModelingMetadata::Rationale { text = "Other waterway users need to see and identify the boat in the conditions in which it operates."; }
    }

    requirement def <'S-005'> RegulatoryClassification {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Deployment shall require documented compliance with applicable navigation, radio and authorization obligations. */
        comment conditions /* Acceptance is deployment document review, not onboard behavior or an assertion of buoy status. */
    }
    requirement regulatoryClassification : RegulatoryClassification;
    dependency deriveRegulatoryClassification from regulatoryClassification to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Entry review must identify which navigation and equipment rules apply to this boat and course."; }
    }

    requirement def <'N-001'> EnvironmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall keep its sailing and safety functions working in the declared operating conditions and remain afloat and recoverable in the declared survival conditions.*/
        comment conditions /* Gorge qualification uses N-010; ocean qualification uses N-020. Both include applicable shared exposure requirements. Operational functions are navigation, sail/steering control, recording and available-link telemetry. Survival requires flotation, attached rig/ballast, dry electronics and retained mission state; course progress is not required. Required traffic assessment, navigation signals and available-link location reporting remain safety obligations in every mode. Loss of required safety capability invokes C-012 even when the structure survives. */
        comment notes /* Profiles are not interchangeable. Gorge release does not require ocean qualification, and Gorge success does not establish ocean capability. */
    }
    requirement environmentalEnvelope : EnvironmentalEnvelope;
    dependency deriveEnvironmentalEnvelope from environmentalEnvelope to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Wind, waves, current and wet exposure determine the conditions in which the boat must complete the circuit and recover."; }
    }

    requirement def <'N-002'> MarineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall maintain structural strength and equipment operation through the wet-exposure tests for the selected mission.*/
        comment conditions /* Gorge uses N-041 freshwater exposure; ocean uses N-042 saltwater exposure; dual-profile qualification requires both. Shared sealing, material-aging and thermal checks use the selected campaign. */
        comment notes /* A derivation does not make every mission-specific descendant applicable to every deployment. */
    }
    requirement marineDurability : MarineDurability;
    dependency deriveMarineDurability from marineDurability to environmentalEnvelope {
        metadata rationale : ModelingMetadata::Rationale { text = "Water, corrosion and repeated exposure can damage equipment and prevent completion or recovery."; }
    }

    requirement def <'N-003'> CapsizeResilience {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After capsize, the vessel shall carry out the selected recovery strategy: right itself and restore upright control, or recover toward shore after abort.*/
        comment conditions /* Righting and upright control restoration apply to selected N-051/N-052 passive-righting criteria; C-018 independently permits post-abort limp recovery. No capsize waives required safety capability or motor inhibition. N-004 separately governs vegetation encounters. */

    }
    requirement capsizeResilience : CapsizeResilience;
    dependency deriveStabilityAndFouling from capsizeResilience to environmentalEnvelope {
        metadata rationale : ModelingMetadata::Rationale { text = "Capsize can disable sailing and sensing. The boat needs a defined way to regain control or reach a retrieval location under the declared conditions."; }
    }

    requirement def <'R-001'> RecoveryPropulsion {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* At maximum mission load, powered recovery shall reach a suitable shore retrieval location from the declared course recovery cases. */
        comment conditions /* Use route-specific wind, waves, current and casualty state, with installed propulsion performance. R-004 governs motor enable and challenge qualification; S-003 governs isolation and control loss. Course recovery scenarios must be accepted before qualification. */
        comment notes /* A sheltered thrust demonstration alone cannot qualify course-wide or capsized recovery. */
    }
    requirement recoveryPropulsion : RecoveryPropulsion;
dependency deriveRecoveryPropulsion from recoveryPropulsion to GorgeChallenge::autonomousShoreRecovery {
        metadata rationale : ModelingMetadata::Rationale { text = "R-001 specifies the installed powered means supporting course-dependent shore recovery. Emergency-control acceptance remains a separate S-003 obligation."; }
    }

    calc def RecoveryReserveDemand {
        doc /* R-002 route-dependent reserve. Route traversal and recovery completion determine exposure durations; uncertainty is explicit. Powers are non-overlapping battery withdrawal rates. */
        in motorPower : PowerValue;
        in essentialPower : PowerValue;
        in poweredDuration : TimeValue;
        in essentialDuration : TimeValue;
        in uncertaintyFactor : Real;
        return reserve : EnergyValue;
        uncertaintyFactor * (motorPower * poweredDuration + essentialPower * essentialDuration)
    }

    requirement def <'R-002'> RecoveryEnergy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The protected reserve shall cover the energy required by a viable course-dependent shore recovery route with declared uncertainty allowance. */
        comment conditions /* Route evaluation supplies powered and essential durations from current position to a suitable retrieval location, including adverse current and final approach. Essential duration includes all powered transit. Powers use the installed configuration; uncertaintyFactor is at least one. An unavailable or infeasible recovery route cannot produce a valid reserve. */
        comment notes /* R-003 governs launch admission; E-004 governs in-mission reserve crossing. */
        attribute motorPower : PowerValue;
        attribute essentialPower : PowerValue;
        attribute reserveEnergy : EnergyValue;
        attribute poweredDuration : TimeValue;
        attribute essentialDuration : TimeValue;
        attribute uncertaintyFactor : Real;
        attribute routeFeasible : Boolean;
        require constraint reserveSizing {
            motorPower > 0 [W] and essentialPower > 0 [W] and
            routeFeasible and poweredDuration > 0 [s] and essentialDuration >= poweredDuration and uncertaintyFactor >= 1 and
            reserveEnergy >= RecoveryReserveDemand(motorPower, essentialPower, poweredDuration, essentialDuration, uncertaintyFactor)
        }
    }
    requirement recoveryEnergy : RecoveryEnergy;
    dependency deriveRecoveryEnergy from recoveryEnergy to recoveryPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "The recovery route needs enough stored energy for propulsion and essential equipment through arrival at shore."; }
    }

    requirement def <'C-101'> TelemetryEquipment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall present current vessel telemetry with explicit data age and identity. */
        comment conditions /* Freshness threshold is 120 seconds for normal, emergency, powered recovery or unknown mode, and 600 seconds only for explicitly reported low energy without emergency or powered recovery. Staleness describes data age, not diagnosed link failure. Exercise a 24-hour outage and reconnection. */
    }
    requirement telemetryEquipment : TelemetryEquipment;
    dependency deriveTelemetryEquipment from telemetryEquipment to communications {
        metadata rationale : ModelingMetadata::Rationale { text = "The operator needs vessel identity, current observations and their age to interpret received telemetry."; }
    }

    requirement def <'C-102'> CommandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall accept external commands only under the specified authentication, freshness and qualification rules. */
        comment conditions /* Exercise complete command receipt, authentication failure, replayed sequence numbers, age greater than 30 seconds, and external control during a qualifying attempt. */
    }
    requirement commandIntegrity : CommandIntegrity;
    dependency deriveCommandIntegrity from commandIntegrity to communications {
        metadata rationale : ModelingMetadata::Rationale { text = "Authentication and freshness checks prevent unauthorized or replayed commands from changing the boat's behavior."; }
    }

    requirement def <'N-010'> GorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall operate in the freshwater Columbia River reach between Bingen and Stevenson, including opposing wind/current, short chop, traffic and submerged vegetation. */
        comment conditions /* Gorge-specific parameter limits and applicable shared exposure requirements apply together. */
        comment notes /* The profile excludes dam transit, ice and surf-zone launch. */
    }
    requirement gorgeEnvironment : GorgeEnvironment;
    dependency deriveGorgeEnvironment from gorgeEnvironment to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "The Gorge mission sets the river environment; it does not impose the ocean profile."; }
    }

    requirement def <'N-020'> OceanEnvironment {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall operate on a northeast Pacific passage toward Hawaii amid saltwater, ocean swell, wind seas and prolonged unattended exposure. */
        comment conditions /* Ocean-specific parameter limits and applicable shared exposure requirements apply together. */
        comment notes /* This baseline is neither a hurricane-survival claim nor completed route/season qualification. */
    }
    requirement oceanEnvironment : OceanEnvironment;
    dependency deriveOceanEnvironment from oceanEnvironment to BlueDog::Goals::hawaiiVoyage {
        metadata rationale : ModelingMetadata::Rationale { text = "The Hawaii mission sets the ocean environment; this profile is not a Gorge acceptance prerequisite."; }
    }

    requirement def <'N-011'> GorgeWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in 0–15 m/s mean true wind with 3-second gusts up to 20 m/s. */
        comment conditions /* Operational functions are defined by N-001. Mean wind uses a 10-minute average referenced to 10 m above water. */
        comment notes /* Wind tolerance does not guarantee upstream progress. */
    }
    requirement gorgeWind : GorgeWind;
    #refinement dependency deriveGorgeWind from BlueDogRequirements::gorgeWind to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-011 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }

    requirement def <'N-012'> GorgeWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in significant wave heights up to 1.5 m, peak periods 1.5–5 s and individual waves up to 3 m. */
        comment conditions /* N-001 defines operational functions. Wave statistics use 20-minute records. */
    }
    requirement gorgeWaves : GorgeWaves;
    #refinement dependency deriveGorgeWaves from BlueDogRequirements::gorgeWaves to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-012 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }

    requirement def <'N-013'> GorgeCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain navigation and control in currents from 0 to 1.5 m/s from any direction relative to wind and waves. */
        comment conditions /* Predicted boundary risk invokes S-002. */
        comment notes /* Current tolerance does not guarantee progress or station keeping; positive upstream speed is not required at every wind speed or heading. */
    }
    requirement gorgeCurrent : GorgeCurrent;
    #refinement dependency deriveGorgeCurrent from BlueDogRequirements::gorgeCurrent to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-013 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }

    requirement def <'N-014'> GorgeSurvivalWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions through the course-derived recovery exposure in mean wind up to 25 m/s and 3-second gusts up to 35 m/s. */
        comment conditions /* Use N-001 survival outcomes and the operational wind reference convention. Selected-profile wave, current, temperature and humidity limits apply concurrently. BlueDogEnvironmentReview::RecoveryExposureHours includes casualty transit and declared pickup delay. */
    }
    requirement gorgeSurvivalWind : GorgeSurvivalWind;
    #refinement dependency deriveGorgeSurvivalWind from BlueDogRequirements::gorgeSurvivalWind to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-014 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }

    requirement def <'N-015'> GorgeSurvivalWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions through the course-derived recovery exposure in significant wave heights up to 2 m, peak periods 1.5–7 s and individual waves up to 4 m. */
        comment conditions /* N-001 defines survival outcomes. */
    }
    requirement gorgeSurvivalWaves : GorgeSurvivalWaves;
    #refinement dependency deriveGorgeSurvivalWaves from BlueDogRequirements::gorgeSurvivalWaves to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-015 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }

    requirement def <'N-021'> OceanWind {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in 3–15 m/s mean true wind with 3-second gusts up to 20 m/s. */
        comment conditions /* Operational functions are defined by N-001. Mean wind uses a 10-minute average referenced to 10 m above water. */
        comment notes /* Wind tolerance does not guarantee upstream progress. */
    }
    requirement oceanWind : OceanWind;
    #refinement dependency deriveOceanWind from BlueDogRequirements::oceanWind to BlueDogRequirements::oceanEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-021 specifies a detailed acceptance condition for N-020 within their stated applicability."; }
    }

    requirement def <'N-022'> OceanWaves {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in significant wave heights up to 3 m, peak periods 5–20 s and individual waves up to 6 m. */
        comment conditions /* N-001 defines operational functions. Wave statistics use 20-minute records. */
    }
    requirement oceanWaves : OceanWaves;
    #refinement dependency deriveOceanWaves from BlueDogRequirements::oceanWaves to BlueDogRequirements::oceanEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-022 specifies a detailed acceptance condition for N-020 within their stated applicability."; }
    }

    requirement def <'N-023'> OceanCurrent {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain navigation and control in currents from 0 to 1.0 m/s from any direction relative to wind and waves. */
        comment conditions /* Predicted boundary risk invokes S-002. */
        comment notes /* Current tolerance does not guarantee progress or station keeping; positive upstream speed is not required at every wind speed or heading. */
    }
    requirement oceanCurrent : OceanCurrent;
    #refinement dependency deriveOceanCurrent from BlueDogRequirements::oceanCurrent to BlueDogRequirements::oceanEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-023 specifies a detailed acceptance condition for N-020 within their stated applicability."; }
    }

    requirement def <'N-024'> OceanSurvivalWind {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions for 24 continuous hours in mean wind up to 25 m/s and 3-second gusts up to 35 m/s. */
        comment conditions /* Use N-001 survival outcomes and the operational wind reference convention. Selected-profile wave, current, temperature and humidity limits apply concurrently. */
    }
    requirement oceanSurvivalWind : OceanSurvivalWind;
    #refinement dependency deriveOceanSurvivalWind from BlueDogRequirements::oceanSurvivalWind to BlueDogRequirements::oceanEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-024 specifies a detailed acceptance condition for N-020 within their stated applicability."; }
    }

    requirement def <'N-025'> OceanSurvivalWaves {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions for 24 continuous hours in significant wave heights up to 6 m, peak periods 6–20 s and individual waves up to 12 m. */
        comment conditions /* N-001 defines survival outcomes. */
    }
    requirement oceanSurvivalWaves : OceanSurvivalWaves;
    #refinement dependency deriveOceanSurvivalWaves from BlueDogRequirements::oceanSurvivalWaves to BlueDogRequirements::oceanEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-025 specifies a detailed acceptance condition for N-020 within their stated applicability."; }
    }

    requirement def <'N-030'> AirTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain mode-appropriate functions at ambient air temperatures from 0 to 40 degC. */
        comment conditions /* N-001/N-035 define operational and survival functions. */
    }
    requirement airTemperature : AirTemperature;
    #refinement dependency deriveAirTemperature from BlueDogRequirements::airTemperature to BlueDogRequirements::environmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-030 specifies a detailed acceptance condition for N-001 within their stated applicability."; }
    }

    requirement def <'N-031'> WaterTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Immersed hull, appendages and equipment shall retain mode-appropriate functions in water from 2 to 30 degC. */
        comment conditions /* N-001/N-035 define operational and survival functions. */
    }
    requirement waterTemperature : WaterTemperature;
    #refinement dependency deriveWaterTemperature from BlueDogRequirements::waterTemperature to BlueDogRequirements::environmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-031 specifies a detailed acceptance condition for N-001 within their stated applicability."; }
    }

    requirement def <'N-032'> Humidity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Installed equipment shall retain operational functions at 0–100 percent relative humidity, including condensation. */
    }
    requirement humidity : Humidity;
    #refinement dependency deriveHumidity from BlueDogRequirements::humidity to BlueDogRequirements::environmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-032 specifies a detailed acceptance condition for N-001 within their stated applicability."; }
    }

    requirement def <'N-033'> Visibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall provide mode-appropriate navigation and traffic response across the specified visibility conditions. */
        comment conditions /* Exercise daylight and darkness at meteorological visibility of at least 1 km, and detected visibility below 1 km. Apply current BlueDogClassDetection class-specific or conservative plausible-class envelopes and the S-001 reviewed observation and response criteria.*/
    }
    requirement visibility : Visibility;
    #refinement dependency deriveVisibility from BlueDogRequirements::visibility to BlueDogRequirements::environmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-033 specifies a detailed acceptance condition for N-001 within their stated applicability."; }
    }

    requirement def <'N-034'> CalmOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While waiting in mean wind below 3 m/s, the vessel shall preserve the course-derived recovery reserve. */
        comment conditions /* Calm-mode functions are navigation, recording and autonomous boundary/traffic contingency. Waiting may continue only while forecast coverage, traffic/boundary safety and measured calm-mode loads preserve route-dependent recovery authority; no fixed waiting endurance is imposed. Autonomous safety recovery first terminates qualification under GorgeChallenge::safetyCapabilityAbort, then may enable the motor under R-004. */
        comment notes /* Neither progress nor station keeping is required. */
    }
    requirement calmOperation : CalmOperation;
    #refinement dependency deriveCalmOperation from BlueDogRequirements::calmOperation to BlueDogRequirements::environmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-034 specifies a detailed acceptance condition for N-001 within their stated applicability."; }
    }

    requirement def <'N-035'> EnvelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall select survival or sailing operation according to the defined environmental transition conditions. */
        comment conditions /* The trigger is a detected upper operational wind or wave limit exceedance for the selected profile; calm invokes N-034. Resumption eligibility requires 10 continuous minutes inside the selected wind/wave limits, valid navigation, upright control, preserved required safety capability and no low-energy, emergency-recovery or isolation restriction. Resuming a control mode never clears a disqualified attempt. */
    }
    requirement envelopeTransition : EnvelopeTransition;
    #refinement dependency deriveEnvelopeTransition from BlueDogRequirements::envelopeTransition to BlueDogRequirements::environmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-035 specifies a detailed acceptance condition for N-001 within their stated applicability."; }
    }

    requirement def <'N-041'> FreshwaterExposure {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* For Gorge qualification, following continuous freshwater exposure for the full declared mission history, with submerged parts continuously wet and complete topside spray wetting at least once per hour, the vessel shall pass its Gorge functional checks without repair or servicing. */
    }
    requirement freshwaterExposure : FreshwaterExposure;
    #refinement dependency deriveFreshwaterExposure from BlueDogRequirements::freshwaterExposure to BlueDogRequirements::marineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-041 specifies a detailed acceptance condition for N-002 within their stated applicability."; }
    }

    requirement def <'N-042'> SaltwaterExposure {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* For ocean qualification, following 30 days continuous 35 g/kg saltwater exposure, with submerged parts continuously wet and complete topside spray wetting at least once per hour, the vessel shall pass its ocean functional checks without repair or servicing. */
        comment notes /* The exposure campaign does not establish the eventual passage duration. */
    }
    requirement saltwaterExposure : SaltwaterExposure;

    requirement def <'N-043'> EnclosureSealing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Before and after each wet-exposure campaign, installed electronics enclosures, connectors and penetrations shall show no detectable liquid ingress on dry internal water-sensitive indicators after 30 minutes immersion with their highest point 1 m below the water surface. */
    }
    requirement enclosureSealing : EnclosureSealing;
    #refinement dependency deriveEnclosureSealing from BlueDogRequirements::enclosureSealing to BlueDogRequirements::marineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-043 specifies a detailed acceptance condition for N-002 within their stated applicability."; }
    }

    requirement def <'N-044'> WetMechanicalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* External mechanisms and structural joints shall retain integrity after the selected wet-exposure campaign. */
        comment conditions /* Evaluate after each selected profile wet-exposure campaign under N-002. */
    }
    requirement wetMechanicalIntegrity : WetMechanicalIntegrity;
    #refinement dependency deriveWetMechanicalIntegrity from BlueDogRequirements::wetMechanicalIntegrity to BlueDogRequirements::marineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-044 specifies a detailed acceptance condition for N-002 within their stated applicability."; }
    }

    requirement def <'N-045'> WetElectricalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Cable assemblies shall retain electrical integrity after the selected wet-exposure campaign. */
        comment conditions /* Evaluate disconnected cable assemblies after each selected profile wet-exposure campaign under N-002; disconnect electronics for insulation measurement. */
    }
    requirement wetElectricalIntegrity : WetElectricalIntegrity;
    #refinement dependency deriveWetElectricalIntegrity from BlueDogRequirements::wetElectricalIntegrity to BlueDogRequirements::marineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-045 specifies a detailed acceptance condition for N-002 within their stated applicability."; }
    }

    requirement def <'N-046'> SolarHeating {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain safe powered operation during the specified solar-heating exposure. */
        comment conditions /* Expose the powered vessel to 40 degC ambient air and 1000 W/m2 incident solar irradiance for 8 hours; use the installed battery manufacturer temperature limits. */
    }
    requirement solarHeating : SolarHeating;
    #refinement dependency deriveSolarHeating from BlueDogRequirements::solarHeating to BlueDogRequirements::marineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-046 specifies a detailed acceptance condition for N-002 within their stated applicability."; }
    }

    requirement def <'N-047'> PrintedMaterialAging {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Aged printed structural components shall retain the load capacity credited to them in the qualified design. */
        comment conditions /* Use exposure representative of the selected mission and intended service interval, followed by N-041 for Gorge or N-042 for ocean. Establish aged directional load bounds for the actual print and joints. The initial 300 MJ/m2 UV dose is a provisional accelerated-test condition, not a mission-derived dose; compare aged capacity with credited demand, not an arbitrary percentage of unaged strength. */
        attribute creditedLoadCapacityN : Real;
        attribute qualifiedAgedCapacityN : Real;
        attribute exposureEvidenceAccepted : Boolean;
        require constraint acceptance { exposureEvidenceAccepted and creditedLoadCapacityN > 0 and qualifiedAgedCapacityN >= creditedLoadCapacityN }
    }
    requirement printedMaterialAging : PrintedMaterialAging;
    #refinement dependency derivePrintedMaterialAging from BlueDogRequirements::printedMaterialAging to BlueDogRequirements::marineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-047 specifies a detailed acceptance condition for N-002 within their stated applicability."; }
    }

    requirement def <'N-051'> SelfRighting {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall recover from the specified capsize releases without external assistance or motor thrust. */
        comment conditions /* Apply to the selected passive-righting concept, not every challenge-compliant vessel. Use minimum and maximum mission loading, five releases at each angle of 90 and 180 degrees toward each side, without external action or motor thrust. Use freshwater for Gorge or 35 g/kg saltwater for ocean; dual qualification requires both media. N-118 RightingDeadline, N-119 CapsizeRigRetention, N-120 CapsizeBallastRetention and N-121 CapsizeElectronicsSealing apply to every release. */
    }
    requirement selfRighting : SelfRighting;
    dependency selectedRightingStrategy from selfRighting to capsizeResilience {
        metadata rationale : ModelingMetadata::Rationale { text = "Passive self-righting is the current monohull design strategy, not entailed by the challenge. C-018 also permits demonstrated limp recovery after abort; an alternative concept may meet that obligation without self-righting."; }
    }

    requirement def <'N-052'> CapsizeControlRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall restore mode-appropriate control after each specified capsize release. */
        comment conditions /* Apply to every N-051 release without operator input. Mode-appropriate control does not mean normal sailing before the N-035 resumption gate permits it. */
    }
    requirement capsizeControlRecovery : CapsizeControlRecovery;
    dependency deriveCapsizeControlRecovery from capsizeControlRecovery to capsizeResilience {
        metadata rationale : ModelingMetadata::Rationale { text = "Upright control restoration is an obligation of the selected passive-righting strategy. Alternative challenge concepts may provide post-abort limp recovery without this strategy."; }
    }

    requirement def <'N-053'> SubmergedWeedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall tolerate submerged milfoil-like vegetation during the specified unassisted Gorge sailing passes. */
        comment conditions /* Gorge campaign: five consecutive sailing passes without manual clearing or motor use through a 5 m by 1 m patch of 20 flexible branched stems per square metre, each 0.5-1.0 m long, extending from below the deepest appendage to within 0.1 m of the surface. Use 5 m/s mean wind and the weed-free reference heading. Record material, branch geometry, wet bending stiffness and anchoring. */
        metadata issue : ModelingMetadata::Issue { text = "Equivalence of the vegetation surrogate to local milfoil requires physical-test validation."; }
    }
    requirement submergedWeedPassage : SubmergedWeedPassage;
    #refinement dependency deriveSubmergedWeedPassage from BlueDogRequirements::submergedWeedPassage to BlueDogRequirements::vegetationResilience {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-053 specifies a detailed acceptance condition for N-004 within their stated applicability."; }
    }

    requirement def <'N-054'> WeedSnagShedding {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall recover sailing performance after the specified appendage weed snags without assistance or motor use. */
        comment conditions /* Gorge campaign: drape one wet 1 m branched stem over one appendage leading edge at a time, five repetitions per appendage, with N-053 surrogate characteristics, 5 m/s mean wind and the unobstructed reference heading. No manual assistance or motor use. N-128 WeedSnagSpeedRecovery and N-129 WeedSnagSteeringRecovery apply to every repetition; visible stem removal alone is insufficient. */
    }
    requirement weedSnagShedding : WeedSnagShedding;
    #refinement dependency deriveWeedSnagShedding from BlueDogRequirements::weedSnagShedding to BlueDogRequirements::vegetationResilience {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-054 specifies a detailed acceptance condition for N-004 within their stated applicability."; }
    }

    requirement def <'N-055'> WeedBlockageResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter autonomous fouling contingency when the defined weed-blockage trigger occurs. */
        comment conditions /* Gorge trigger: vegetation prevents completion of commanded rudder motion for 5 seconds, or keeps water-relative speed below 25 percent of the preceding weed-free 60-second mean for 60 seconds with mean wind at least 3 m/s. Dense mats are a blockage/avoidance case, not a pass-through claim. */
    }
    requirement weedBlockageResponse : WeedBlockageResponse;
    #refinement dependency deriveWeedBlockageResponse from BlueDogRequirements::weedBlockageResponse to BlueDogRequirements::vegetationResilience {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-055 specifies a detailed acceptance condition for N-004 within their stated applicability."; }
    }

    requirement def <'N-056'> RecoveryPropulsorWeeds {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The recovery propulsion system shall tolerate the specified weed encounters within its rated electrical and thermal limits. */
        comment conditions /* Use a separately designated Gorge powered-recovery test with five passes through the N-053 patch without manual propulsor clearing, on the weed-free powered reference heading. Exercise locked propulsor separately. */
    }
    requirement recoveryPropulsorWeeds : RecoveryPropulsorWeeds;
    #refinement dependency deriveRecoveryPropulsorWeeds from BlueDogRequirements::recoveryPropulsorWeeds to BlueDogRequirements::vegetationResilience {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-056 specifies a detailed acceptance condition for N-004 within their stated applicability."; }
    }
    dependency motorWeedTolerance from recoveryPropulsorWeeds to recoveryPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "The recovery propulsor must remain usable in the vegetation encountered by the sailing vessel."; }
    }
    requirement def <'E-008'> NavigationAvailability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall maintain valid navigation inputs and reject stale observations. */
        comment conditions /* Campaigns use 1800 scheduled one-second epochs in 30 minutes, with missing/invalid epochs counted as failures. Fault injection is separate. */
    }
    requirement navigationAvailability : NavigationAvailability;
    requirement def <'R-003'> LaunchEnergyAdmission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel shall inhibit mission start unless a valid usable-energy estimate no older than 1 second strictly exceeds a valid R-002 protected reserve. */
        comment conditions /* Missing, stale or invalid estimates or reserve configuration inhibit start. */
        attribute conservativeStartEnergy : EnergyValue;
        attribute protectedReserve : EnergyValue;
        attribute estimateAge : TimeValue;
        attribute estimateValid : Boolean;
        attribute reserveValid : Boolean;
        attribute missionStartEnabled : Boolean;
        attribute admissionEligible : Boolean =
            estimateValid and reserveValid and protectedReserve > 0 [J] and
            estimateAge >= 0 [s] and estimateAge <= 1 [s] and
            conservativeStartEnergy > protectedReserve;
        require constraint launchEnergyGate {
            not missionStartEnabled or admissionEligible
        }
    }
    requirement launchEnergyAdmission : LaunchEnergyAdmission;
    requirement def <'R-004'> ChallengeMotorInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel shall inhibit motor thrust until it has durably recorded a known nonqualifying status for the attempt. */
        comment conditions /* Exercise qualifying, nonqualifying and unknown qualification states, restart, link loss, power loss during transitions and conflicting/stale commands. Shared qualification persistence applies before enabling intervention. */
    }
    requirement challengeMotorInhibition : ChallengeMotorInhibition;
    #refinement dependency auditDerivation1 from BlueDogRequirements::navigationAvailability to BlueDogRequirements::navigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-008 specifies a detailed acceptance condition for E-002 within their stated applicability."; }
    }
    dependency auditDerivation2 from launchEnergyAdmission to recoveryEnergy {
        metadata rationale : ModelingMetadata::Rationale { text = "The selected launch gate consumes the route-dependent reserve calculation. A changed reserve or validity rule requires admission review; the reserve magnitude alone does not define launch behavior."; }
    }
    dependency auditDerivation3 from challengeMotorInhibition to GorgeChallenge::sailingPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "The onboard interlock is the selected enforcement of sail-only qualification. The challenge rule governs the attempt outcome without mandating this particular interlock design."; }
    }
    dependency auditDerivation4 from challengeMotorInhibition to GorgeChallenge::unassistedAttempt {
        metadata rationale : ModelingMetadata::Rationale { text = "No-intervention qualification must survive resets and motor-mode transitions."; }
    }
    dependency auditDerivation5 from commandIntegrity to GorgeChallenge::unassistedAttempt {
        metadata rationale : ModelingMetadata::Rationale { text = "Accepted external control changes the attempt qualification; communications alone does not supply this rule."; }
    }
    dependency auditDerivation6 from commandIntegrity to GorgeChallenge::emergencyIntervention {
        metadata rationale : ModelingMetadata::Rationale { text = "The emergency control channel needs authenticated, fresh commands and persistent qualification changes."; }
    }
    #refinement dependency auditDerivation10 from BlueDogRequirements::freshwaterExposure to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-041 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }
    #refinement dependency auditDerivation11 from BlueDogRequirements::saltwaterExposure to BlueDogRequirements::oceanEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-042 specifies a detailed acceptance condition for N-020 within their stated applicability."; }
    }
    #refinement dependency auditDerivation12 from BlueDogRequirements::submergedWeedPassage to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-053 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }
    #refinement dependency auditDerivation13 from BlueDogRequirements::weedSnagShedding to BlueDogRequirements::gorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-054 specifies a detailed acceptance condition for N-010 within their stated applicability."; }
    }

    // Independently verifiable acceptance leaves.
    requirement def <'E-101'> EnergyEstimateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall refresh usable battery-energy estimates at least once per second. */
        comment conditions /*
         *  Apply the E-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-101 continue to govern. */
    }
    requirement energyEstimateCadence : EnergyEstimateCadence;
    #refinement dependency decomposeEnergyEstimateCadence from BlueDogRequirements::energyEstimateCadence to BlueDogRequirements::energyAwareness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-101 specifies a detailed acceptance condition for E-001 within their stated applicability."; }
    }

    requirement def <'E-102'> ReserveEstimateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall refresh protected recovery-reserve estimates at least once per second. */
        comment conditions /*
         *  Apply the E-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-102 continue to govern. */
    }
    requirement reserveEstimateCadence : ReserveEstimateCadence;
    #refinement dependency decomposeReserveEstimateCadence from BlueDogRequirements::reserveEstimateCadence to BlueDogRequirements::energyAwareness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-102 specifies a detailed acceptance condition for E-001 within their stated applicability."; }
    }

    requirement def <'E-103'> EnergyEstimateAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  Across the operating battery-temperature range, the absolute difference between estimated usable energy and calibrated charge/discharge integration shall not exceed 10 percent of measured usable full-charge energy. */
        comment conditions /*
         *  Apply the E-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-103 continue to govern. */
    }
    requirement energyEstimateAccuracy : EnergyEstimateAccuracy;
    #refinement dependency decomposeEnergyEstimateAccuracy from BlueDogRequirements::energyEstimateAccuracy to BlueDogRequirements::energyAwareness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-103 specifies a detailed acceptance condition for E-001 within their stated applicability."; }
    }

    requirement def <'E-104'> ConservativeEnergyEstimate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The usable-energy input to admission and low-energy decisions shall equal estimated usable energy minus the EnergyEstimateAccuracy error allowance. */
        comment conditions /*
         *  Apply the E-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-104 continue to govern. */
    }
    requirement conservativeEnergyEstimate : ConservativeEnergyEstimate;
    #refinement dependency decomposeConservativeEnergyEstimate from BlueDogRequirements::conservativeEnergyEstimate to BlueDogRequirements::energyAwareness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-104 specifies a detailed acceptance condition for E-001 within their stated applicability."; }
    }

    requirement def <'E-105'> GuidanceUpdateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  During operational qualification, mission guidance shall refresh its guidance output at intervals no greater than 1 second. */
        comment observationBoundary /*
         *  Observe refresh at the guidance output consumed by control, or at the actuator command input, respectively. Repeated values count as a refresh; changed values and achieved physical motion are not required by this cadence criterion. */
        comment conditions /*
         *  Apply the E-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-105 continue to govern. */
    }
    requirement guidanceUpdateCadence : GuidanceUpdateCadence;
    #refinement dependency decomposeGuidanceUpdateCadence from BlueDogRequirements::guidanceUpdateCadence to BlueDogRequirements::navigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-105 specifies a detailed acceptance condition for E-002 within their stated applicability."; }
    }

    requirement def <'E-106'> SailCommandCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  During operational qualification, sail control shall refresh the commanded sail position at intervals no greater than 1 second. */
        comment observationBoundary /*
         *  Observe refresh at the guidance output consumed by control, or at the actuator command input, respectively. Repeated values count as a refresh; changed values and achieved physical motion are not required by this cadence criterion. */
        comment conditions /*
         *  Apply the E-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-106 continue to govern. */
    }
    requirement sailCommandCadence : SailCommandCadence;
    #refinement dependency decomposeSailCommandCadence from BlueDogRequirements::sailCommandCadence to BlueDogRequirements::navigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-106 specifies a detailed acceptance condition for E-002 within their stated applicability."; }
    }

    requirement def <'E-107'> SteeringCommandCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  During operational qualification, steering control shall refresh the commanded steering position at intervals no greater than 1 second. */
        comment observationBoundary /*
         *  Observe refresh at the guidance output consumed by control, or at the actuator command input, respectively. Repeated values count as a refresh; changed values and achieved physical motion are not required by this cadence criterion. */
        comment conditions /*
         *  Apply the E-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-107 continue to govern. */
    }
    requirement steeringCommandCadence : SteeringCommandCadence;
    #refinement dependency decomposeSteeringCommandCadence from BlueDogRequirements::steeringCommandCadence to BlueDogRequirements::navigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-107 specifies a detailed acceptance condition for E-002 within their stated applicability."; }
    }

    requirement def <'E-108'> PositionAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* At every epoch in the common E-002 acceptance set, valid position error shall be at most 10 m against an independent reference. */
        comment conditions /*
         *  Apply the E-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-108 continue to govern. */
    }
    requirement positionAccuracy : PositionAccuracy;
    #refinement dependency decomposePositionAccuracy from BlueDogRequirements::positionAccuracy to BlueDogRequirements::navigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-108 specifies a detailed acceptance condition for E-002 within their stated applicability."; }
    }

    requirement def <'E-109'> HeadingAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* At every epoch in the common E-002 acceptance set, valid heading error shall be at most 10 degrees against an independent reference. */
        comment conditions /*
         *  Apply the E-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-109 continue to govern. */
    }
    requirement headingAccuracy : HeadingAccuracy;
    #refinement dependency decomposeHeadingAccuracy from BlueDogRequirements::headingAccuracy to BlueDogRequirements::navigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-109 specifies a detailed acceptance condition for E-002 within their stated applicability."; }
    }

    requirement def <'E-110'> RestartDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After a watchdog reset under E-003 preconditions, the vessel shall restore mode-appropriate autonomous control within 30 seconds. */
        attribute measuredRestartTime : TimeValue;
        require constraint restartDeadline {
            measuredRestartTime >= 0 [s] and measuredRestartTime <= 30 [s]
        }
        comment conditions /*
         *  Apply the E-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-110 continue to govern. */
    }
    requirement restartDeadline : RestartDeadline;
    #refinement dependency decomposeRestartDeadline from BlueDogRequirements::restartDeadline to BlueDogRequirements::resetRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-110 specifies a detailed acceptance condition for E-003 within their stated applicability."; }
    }

    requirement def <'E-111'> MissionStateRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 30 seconds after a watchdog reset under E-003 preconditions, the restored mission-mode record shall equal the last persisted mode. */
        comment conditions /* Restoring recorded mission intent does not command that operating mode. Current safety, capsize, energy, recovery and isolation restrictions govern actual operation under E-113 and N-035. */
    }
    requirement missionStateRestoration : MissionStateRestoration;
    #refinement dependency decomposeMissionStateRestoration from BlueDogRequirements::missionStateRestoration to BlueDogRequirements::resetRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-111 specifies a detailed acceptance condition for E-003 within their stated applicability."; }
    }

    requirement def <'E-112'> GateProgressRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 30 seconds after a watchdog reset under E-003 preconditions, restored gate progress shall equal the last persisted gate progress. */
        comment conditions /*
         *  Apply the E-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-112 continue to govern. */
    }
    requirement gateProgressRestoration : GateProgressRestoration;
    #refinement dependency decomposeGateProgressRestoration from BlueDogRequirements::gateProgressRestoration to BlueDogRequirements::resetRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-112 specifies a detailed acceptance condition for E-003 within their stated applicability."; }
    }

    requirement def <'E-113'> ResetRestrictionPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After watchdog reset, each active survival, low-energy, recovery and isolation restriction shall remain effective until its own release condition is met. */
        comment conditions /*
         *  Apply the E-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-113 continue to govern. */
    }
    requirement resetRestrictionPreservation : ResetRestrictionPreservation;

    #derivation connection decomposeResetRestrictionPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-003; the parent supplies shared verification conditions."; }
        end #original source ::> resetRecovery;
        end #derive target ::> resetRestrictionPreservation;
    }

    requirement def <'E-114'> LowEnergyEntry {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* When conservative usable energy reaches or falls below protected reserve, the vessel shall set the low-energy flag within 5 seconds. */
        comment conditions /*
         *  Apply the E-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-114 continue to govern. */
    }
    requirement lowEnergyEntry : LowEnergyEntry;
    #refinement dependency decomposeLowEnergyEntry from BlueDogRequirements::lowEnergyEntry to BlueDogRequirements::lowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-114 specifies a detailed acceptance condition for E-004 within their stated applicability."; }
    }

    requirement def <'E-115'> LowEnergyPayloadInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While the low-energy flag is set, the optional observation payload shall be disabled. */
        comment conditions /*
         *  Apply the E-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-115 continue to govern. */
    }
    requirement lowEnergyPayloadInhibition : LowEnergyPayloadInhibition;
    #refinement dependency decomposeLowEnergyPayloadInhibition from BlueDogRequirements::lowEnergyPayloadInhibition to BlueDogRequirements::lowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-115 specifies a detailed acceptance condition for E-004 within their stated applicability."; }
    }

    requirement def <'E-116'> LowEnergyNavigationContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While the low-energy flag is set, autonomous navigation shall remain active. */
        comment conditions /*
         *  Apply the E-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-116 continue to govern. */
    }
    requirement lowEnergyNavigationContinuity : LowEnergyNavigationContinuity;
    #refinement dependency decomposeLowEnergyNavigationContinuity from BlueDogRequirements::lowEnergyNavigationContinuity to BlueDogRequirements::lowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-116 specifies a detailed acceptance condition for E-004 within their stated applicability."; }
    }

    requirement def <'E-117'> LowEnergyCollisionContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While the low-energy flag is set, collision-response behavior shall remain active. */
        comment conditions /*
         *  Apply the E-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-117 continue to govern. */
    }
    requirement lowEnergyCollisionContinuity : LowEnergyCollisionContinuity;
    #refinement dependency decomposeLowEnergyCollisionContinuity from BlueDogRequirements::lowEnergyCollisionContinuity to BlueDogRequirements::lowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-117 specifies a detailed acceptance condition for E-004 within their stated applicability."; }
    }

    requirement def <'E-118'> LowEnergyExit {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After conservative usable energy exceeds 1.2 times protected reserve for 10 continuous minutes, the vessel shall clear the low-energy flag independently of survival/recovery flags. */
        comment conditions /*
         *  Apply the E-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-118 continue to govern. */
    }
    requirement lowEnergyExit : LowEnergyExit;
    #refinement dependency decomposeLowEnergyExit from BlueDogRequirements::lowEnergyExit to BlueDogRequirements::lowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-118 specifies a detailed acceptance condition for E-004 within their stated applicability."; }
    }

    requirement def <'E-119'> PayloadRestartPermission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Payload operation shall remain inhibited whenever a low-energy, survival or recovery restriction is active. */
        comment conditions /*
         *  Apply the E-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-119 continue to govern. */
    }
    requirement payloadRestartPermission : PayloadRestartPermission;
    #refinement dependency decomposePayloadRestartPermission from BlueDogRequirements::payloadRestartPermission to BlueDogRequirements::lowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-119 specifies a detailed acceptance condition for E-004 within their stated applicability."; }
    }

    requirement def <'E-120'> TelemetryDeliveryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* With a functioning link, current position, operating mode and health telemetry delivery intervals shall not exceed 30 seconds. */
        comment conditions /*
         *  Apply the E-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-120 continue to govern. */
    }
    requirement telemetryDeliveryCadence : TelemetryDeliveryCadence;

    #derivation connection decomposeTelemetryDeliveryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-005; the parent supplies shared verification conditions."; }
        end #original source ::> communications;
        end #derive target ::> telemetryDeliveryCadence;
    }

    requirement def <'E-121'> OutageAutonomy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Through a 24-hour telemetry-link outage, autonomous mission control shall continue without operator intervention. */
        comment conditions /*
         *  Apply the E-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-121 continue to govern. */
    }
    requirement outageAutonomy : OutageAutonomy;
    #refinement dependency decomposeOutageAutonomy from BlueDogRequirements::outageAutonomy to BlueDogRequirements::communications {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-121 specifies a detailed acceptance condition for E-005 within their stated applicability."; }
    }

    requirement def <'E-122'> ReconnectCurrentRecord {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After link restoration, a current telemetry record shall arrive within the active TelemetryDeliveryCadence interval. */
        comment conditions /*
         *  Apply the E-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-122 continue to govern. */
    }
    requirement reconnectCurrentRecord : ReconnectCurrentRecord;
    #refinement dependency decomposeReconnectCurrentRecord from BlueDogRequirements::reconnectCurrentRecord to BlueDogRequirements::communications {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-122 specifies a detailed acceptance condition for E-005 within their stated applicability."; }
    }

    requirement def <'E-123'> BacklogOrdering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After reconnection, retained backlog records shall be transmitted in ascending acquisition sequence order. */
        comment conditions /*
         *  Apply the E-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-123 continue to govern. */
    }
    requirement backlogOrdering : BacklogOrdering;
    #refinement dependency decomposeBacklogOrdering from BlueDogRequirements::backlogOrdering to BlueDogRequirements::communications {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-123 specifies a detailed acceptance condition for E-005 within their stated applicability."; }
    }

    requirement def <'E-124'> BacklogCurrentPriority {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During backlog transfer, current telemetry shall continue to meet TelemetryDeliveryCadence. */
        comment conditions /*
         *  Apply the E-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-124 continue to govern. */
    }
    requirement backlogCurrentPriority : BacklogCurrentPriority;

    #derivation connection decomposeBacklogCurrentPriority {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-005; the parent supplies shared verification conditions."; }
        end #original source ::> communications;
        end #derive target ::> backlogCurrentPriority;
    }

    requirement def <'E-125'> IngressDetection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 injection test, ingress detection shall occur within 60 seconds of injection starting. */
        comment conditions /*
         *  Apply the E-006 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-125 continue to govern. */
    }
    requirement ingressDetection : IngressDetection;
    #refinement dependency decomposeIngressDetection from BlueDogRequirements::ingressDetection to BlueDogRequirements::ingressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-125 specifies a detailed acceptance condition for E-006 within their stated applicability."; }
    }

    requirement def <'E-126'> IngressRecoveryRequest {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 test, ingress detection shall set the recovery-request state. */
        comment conditions /*
         *  Apply the E-006 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-126 continue to govern. */
    }
    requirement ingressRecoveryRequest : IngressRecoveryRequest;
    #refinement dependency decomposeIngressRecoveryRequest from BlueDogRequirements::ingressRecoveryRequest to BlueDogRequirements::ingressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-126 specifies a detailed acceptance condition for E-006 within their stated applicability."; }
    }

    requirement def <'E-127'> IngressFlotation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 test, the vessel shall remain afloat for the full 30 minutes. */
        comment conditions /*
         *  Apply the E-006 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-127 continue to govern. */
    }
    requirement ingressFlotation : IngressFlotation;
    #refinement dependency decomposeIngressFlotation from BlueDogRequirements::ingressFlotation to BlueDogRequirements::ingressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-127 specifies a detailed acceptance condition for E-006 within their stated applicability."; }
    }

    requirement def <'E-128'> IngressElectronicsProtection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After the E-006 test, enclosed-electronics water-sensitive indicators shall show no liquid ingress. */
        comment conditions /*
         *  Apply the E-006 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-128 continue to govern. */
    }
    requirement ingressElectronicsProtection : IngressElectronicsProtection;
    #refinement dependency decomposeIngressElectronicsProtection from BlueDogRequirements::ingressElectronicsProtection to BlueDogRequirements::ingressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-128 specifies a detailed acceptance condition for E-006 within their stated applicability."; }
    }

    requirement def <'E-129'> IngressPositionContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Throughout the E-006 test with a functioning link, position reporting shall meet the active TelemetryDeliveryCadence. */
        comment conditions /*
         *  Apply the E-006 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-129 continue to govern. */
    }
    requirement ingressPositionContinuity : IngressPositionContinuity;
    #refinement dependency decomposeIngressPositionContinuity from BlueDogRequirements::ingressPositionContinuity to BlueDogRequirements::ingressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-129 specifies a detailed acceptance condition for E-006 within their stated applicability."; }
    }

    requirement def <'E-130'> PeriodicLogCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Periodic mission records shall be acquired at least once per second normally and once per minute in low-energy or survival operation. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-130 continue to govern. */
    }
    requirement periodicLogCadence : PeriodicLogCadence;
    #refinement dependency decomposePeriodicLogCadence from BlueDogRequirements::periodicLogCadence to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-130 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-131'> LogRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Acquired mission records shall remain retrievable onboard for at least 30 days. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-131 continue to govern. */
    }
    requirement logRetention : LogRetention;
    #refinement dependency decomposeLogRetention from BlueDogRequirements::logRetention to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-131 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-132'> CriticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every external-command disposition, reset, motor-enable transition, ingress detection, recovery request, navigation-degraded transition, low-energy flag transition and qualification change shall have an event record regardless of periodic cadence. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-132 continue to govern. */
    }
    requirement criticalEventRecording : CriticalEventRecording;
    #refinement dependency decomposeCriticalEventRecording from BlueDogRequirements::criticalEventRecording to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-132 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-133'> LogTimestampAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* With valid GNSS time, mission-record timestamps shall differ from reference UTC by at most 1 second. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-133 continue to govern. */
    }
    requirement logTimestampAccuracy : LogTimestampAccuracy;
    #refinement dependency decomposeLogTimestampAccuracy from BlueDogRequirements::logTimestampAccuracy to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-133 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-134'> InvalidTimestampMarking {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each record acquired without valid time shall carry an invalid-time indication. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-134 continue to govern. */
    }
    requirement invalidTimestampMarking : InvalidTimestampMarking;
    #refinement dependency decomposeInvalidTimestampMarking from BlueDogRequirements::invalidTimestampMarking to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-134 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-135'> LogGapIndication {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each detected missing sequence of scheduled records shall have a gap indication in retrieved data. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-135 continue to govern. */
    }
    requirement logGapIndication : LogGapIndication;
    #refinement dependency decomposeLogGapIndication from BlueDogRequirements::logGapIndication to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-135 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-136'> LogInterruptionDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After watchdog reset or abrupt power removal, every record older than 5 seconds before interruption shall remain readable. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-136 continue to govern. */
    }
    requirement logInterruptionDurability : LogInterruptionDurability;
    #refinement dependency decomposeLogInterruptionDurability from BlueDogRequirements::logInterruptionDurability to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-136 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-137'> ReconnectLogPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Communication reconnection shall not delete retained mission records. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-137 continue to govern. */
    }
    requirement reconnectLogPreservation : ReconnectLogPreservation;
    #refinement dependency decomposeReconnectLogPreservation from BlueDogRequirements::reconnectLogPreservation to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-137 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-138'> QualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each disqualifying transition shall be durably stored before its associated commanded intervention or motor enable. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-138 continue to govern. */
    }
    requirement qualificationPersistence : QualificationPersistence;
    #refinement dependency decomposeQualificationPersistence from BlueDogRequirements::qualificationPersistence to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-138 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-139'> UnknownQualificationFallback {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* On restart with absent or inconsistent persisted qualification state, the vessel shall adopt nonqualifying status. */
        comment conditions /*
         *  Apply the E-007 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-139 continue to govern. */
    }
    requirement unknownQualificationFallback : UnknownQualificationFallback;
    #refinement dependency decomposeUnknownQualificationFallback from BlueDogRequirements::unknownQualificationFallback to BlueDogRequirements::missionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-139 specifies a detailed acceptance condition for E-007 within their stated applicability."; }
    }

    requirement def <'E-140'> NavigationValidEpochs {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In each E-008 campaign, at least 1710 of 1800 scheduled epochs shall contain valid position and heading observations. */
        attribute validEpochs : Integer;
        require constraint availabilityFraction {
            validEpochs >= 1710 and validEpochs <= 1800
        }
        comment conditions /*
         *  Apply the E-008 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-140 continue to govern. */
    }
    requirement navigationValidEpochs : NavigationValidEpochs;
    #refinement dependency decomposeNavigationValidEpochs from BlueDogRequirements::navigationValidEpochs to BlueDogRequirements::navigationAvailability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-140 specifies a detailed acceptance condition for E-008 within their stated applicability."; }
    }

    requirement def <'E-141'> StaleNavigationInvalidation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Navigation observations older than 5 seconds shall be marked invalid. */
        comment conditions /*
         *  Apply the E-008 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-141 continue to govern. */
    }
    requirement staleNavigationInvalidation : StaleNavigationInvalidation;
    #refinement dependency decomposeStaleNavigationInvalidation from BlueDogRequirements::staleNavigationInvalidation to BlueDogRequirements::navigationAvailability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-141 specifies a detailed acceptance condition for E-008 within their stated applicability."; }
    }

    requirement def <'E-142'> NavigationDegradedTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* When position or heading becomes invalid due to age, the vessel shall enter navigation-degraded state within 1 second. */
        comment conditions /*
         *  Apply the E-008 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-142 continue to govern. */
    }
    requirement navigationDegradedTransition : NavigationDegradedTransition;
    #refinement dependency decomposeNavigationDegradedTransition from BlueDogRequirements::navigationDegradedTransition to BlueDogRequirements::navigationAvailability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-142 specifies a detailed acceptance condition for E-008 within their stated applicability."; }
    }

    requirement def <'E-143'> StaleNavigationUseInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The controller shall not use observations marked invalid as current navigation inputs. */
        comment conditions /*
         *  Apply the E-008 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-143 continue to govern. */
    }
    requirement staleNavigationUseInhibition : StaleNavigationUseInhibition;
    #refinement dependency decomposeStaleNavigationUseInhibition from BlueDogRequirements::staleNavigationUseInhibition to BlueDogRequirements::navigationAvailability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-143 specifies a detailed acceptance condition for E-008 within their stated applicability."; }
    }

    requirement def <'P-101'> SoloTransport {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel and its mission equipment shall be transportable for 100 m by one adult without assistance under the P-001 handling conditions. */
        comment conditions /*
         *  Apply the P-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-101 continue to govern. */
    }
    requirement soloTransport : SoloTransport;
    #refinement dependency decomposeSoloTransport from BlueDogRequirements::soloTransport to BlueDogRequirements::transportability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-101 specifies a detailed acceptance condition for P-001 within their stated applicability."; }
    }

    requirement def <'P-102'> LiftMass {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each separately lifted assembly shall have a mass no greater than 15 kg. */
        comment conditions /*
         *  Apply the P-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-102 continue to govern. */
    }
    requirement liftMass : LiftMass;
    #refinement dependency decomposeLiftMass from BlueDogRequirements::liftMass to BlueDogRequirements::transportability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-102 specifies a detailed acceptance condition for P-001 within their stated applicability."; }
    }

    requirement def <'P-103'> SetupDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel shall be capable of assembly from its transport configuration by one adult within 30 minutes under the P-001 handling conditions. */
        comment conditions /*
         *  Apply the P-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-103 continue to govern. */
    }
    requirement setupDuration : SetupDuration;
    #refinement dependency decomposeSetupDuration from BlueDogRequirements::setupDuration to BlueDogRequirements::transportability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-103 specifies a detailed acceptance condition for P-001 within their stated applicability."; }
    }

    requirement def <'P-104'> PackDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel shall be capable of packing into its transport configuration by one adult within 30 minutes under the P-001 handling conditions. */
        comment conditions /*
         *  Apply the P-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-104 continue to govern. */
    }
    requirement packDuration : PackDuration;
    #refinement dependency decomposePackDuration from BlueDogRequirements::packDuration to BlueDogRequirements::transportability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-104 specifies a detailed acceptance condition for P-001 within their stated applicability."; }
    }

    requirement def <'P-105'> SoloLaunch {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The assembled vessel shall be launchable by one adult without assistance under the P-001 handling conditions. */
        comment conditions /*
         *  Apply the P-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-105 continue to govern. */
    }
    requirement soloLaunch : SoloLaunch;

    #derivation connection decomposeSoloLaunch {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-001; the parent supplies shared verification conditions."; }
        end #original source ::> transportability;
        end #derive target ::> soloLaunch;
    }

    requirement def <'P-106'> SoloRetrieval {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The vessel shall be retrievable from the water by one adult without assistance under the P-001 handling conditions. */
        comment conditions /*
         *  Apply the P-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-106 continue to govern. */
    }
    requirement soloRetrieval : SoloRetrieval;

    #derivation connection decomposeSoloRetrieval {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-001; the parent supplies shared verification conditions."; }
        end #original source ::> transportability;
        end #derive target ::> soloRetrieval;
    }

    requirement def <'P-107'> ReplacementDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each P-003 replacement shall take no more than 30 minutes. */
        comment conditions /*
         *  Apply the P-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-107 continue to govern. */
    }
    requirement replacementDuration : ReplacementDuration;
    #refinement dependency decomposeReplacementDuration from BlueDogRequirements::replacementDuration to BlueDogRequirements::serviceability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-107 specifies a detailed acceptance condition for P-003 within their stated applicability."; }
    }

    requirement def <'P-108'> NondestructiveService {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each P-003 replacement shall leave bonded structural joints and adjacent parts intact. */
        comment conditions /*
         *  Apply the P-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-108 continue to govern. */
    }
    requirement nondestructiveService : NondestructiveService;

    #derivation connection decomposeNondestructiveService {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-003; the parent supplies shared verification conditions."; }
        end #original source ::> serviceability;
        end #derive target ::> nondestructiveService;
    }

    requirement def <'P-109'> PostServiceSealing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each P-003 replacement, the assembly shall meet the N-043 immersion criterion. */
        comment conditions /*
         *  Apply the P-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-109 continue to govern. */
    }
    requirement postServiceSealing : PostServiceSealing;
    #refinement dependency decomposePostServiceSealing from BlueDogRequirements::postServiceSealing to BlueDogRequirements::serviceability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-109 specifies a detailed acceptance condition for P-003 within their stated applicability."; }
    }

    requirement def <'P-110'> PostServiceActuation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each P-003 replacement, affected actuators shall complete their full commanded travel. */
        comment conditions /*
         *  Apply the P-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in P-110 continue to govern. */
    }
    requirement postServiceActuation : PostServiceActuation;
    #refinement dependency decomposePostServiceActuation from BlueDogRequirements::postServiceActuation to BlueDogRequirements::serviceability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "P-110 specifies a detailed acceptance condition for P-003 within their stated applicability."; }
    }

    requirement def <'S-101'> TrafficTracking {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall acquire and maintain encounter tracks with the reviewed class- and condition-specific timely acquisition and continuity performance required by S-001.*/
        comment conditions /* Each admitted target class remains in scope. Before reliable classification, apply the reviewed conservative envelope spanning plausible classes and occupant transitions. */
    }
    requirement trafficTracking : TrafficTracking;
    #refinement dependency decomposeTrafficTracking from BlueDogRequirements::trafficTracking to BlueDogRequirements::trafficSafety {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-101 specifies a detailed acceptance condition for S-001 within their stated applicability."; }
    }

    requirement def <'S-102'> CollisionAssessmentCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall update collision-risk estimates at least once per second. */
        comment conditions /*
         *  Apply the S-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-102 continue to govern. */
    }
    requirement collisionAssessmentCadence : CollisionAssessmentCadence;
    #refinement dependency decomposeCollisionAssessmentCadence from BlueDogRequirements::collisionAssessmentCadence to BlueDogRequirements::trafficSafety {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-102 specifies a detailed acceptance condition for S-001 within their stated applicability."; }
    }

    requirement def <'S-103'> AvoidanceCommandDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall issue the prescribed avoiding-action command within 2 seconds of each S-001 collision-risk trigger. */
        comment conditions /*
         *  Apply the S-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-103 continue to govern. */
    }
    requirement avoidanceCommandDeadline : AvoidanceCommandDeadline;
    #refinement dependency decomposeAvoidanceCommandDeadline from BlueDogRequirements::avoidanceCommandDeadline to BlueDogRequirements::trafficSafety {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-103 specifies a detailed acceptance condition for S-001 within their stated applicability."; }
    }

    requirement def <'S-104'> TrafficAwarenessFault {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After traffic assessment has been invalid for more than 5 seconds, the vessel shall log a traffic-awareness fault within 1 second. */
        comment conditions /*
         *  Apply the S-001 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-104 continue to govern. */
    }
    requirement trafficAwarenessFault : TrafficAwarenessFault;
    #refinement dependency decomposeTrafficAwarenessFault from BlueDogRequirements::trafficAwarenessFault to BlueDogRequirements::trafficSafety {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-104 specifies a detailed acceptance condition for S-001 within their stated applicability."; }
    }

    requirement def <'S-105'> BoundaryEvaluationCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall evaluate its current position and predicted trajectory against the S-002 polygons at least once per second. */
        comment conditions /*
         *  Apply the S-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-105 continue to govern. */
    }
    requirement boundaryEvaluationCadence : BoundaryEvaluationCadence;
    #refinement dependency decomposeBoundaryEvaluationCadence from BlueDogRequirements::boundaryEvaluationCadence to BlueDogRequirements::operatingBoundary {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-105 specifies a detailed acceptance condition for S-002 within their stated applicability."; }
    }

    requirement def <'S-106'> BoundaryAvoidanceDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall issue an avoidance command within 2 seconds of predicting a boundary crossing. */
        comment conditions /*
         *  Apply the S-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-106 continue to govern. */
    }
    requirement boundaryAvoidanceDeadline : BoundaryAvoidanceDeadline;
    #refinement dependency decomposeBoundaryAvoidanceDeadline from BlueDogRequirements::boundaryAvoidanceDeadline to BlueDogRequirements::operatingBoundary {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-106 specifies a detailed acceptance condition for S-002 within their stated applicability."; }
    }

    requirement def <'S-107'> BoundaryAvoidanceRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every boundary-avoidance command shall have a corresponding event record. */
        comment conditions /*
         *  Apply the S-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-107 continue to govern. */
    }
    requirement boundaryAvoidanceRecording : BoundaryAvoidanceRecording;
    #refinement dependency decomposeBoundaryAvoidanceRecording from BlueDogRequirements::boundaryAvoidanceRecording to BlueDogRequirements::operatingBoundary {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-107 specifies a detailed acceptance condition for S-002 within their stated applicability."; }
    }

    requirement def <'S-108'> BoundaryStartInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Missing or geometrically invalid boundaries shall inhibit mission start. */
        comment conditions /*
         *  Apply the S-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-108 continue to govern. */
    }
    requirement boundaryStartInhibition : BoundaryStartInhibition;
    #refinement dependency decomposeBoundaryStartInhibition from BlueDogRequirements::boundaryStartInhibition to BlueDogRequirements::operatingBoundary {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-108 specifies a detailed acceptance condition for S-002 within their stated applicability."; }
    }

    requirement def <'S-109'> BoundaryDegradedEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Navigation loss or absence of a feasible maneuver shall produce an explicit degraded-route verdict instead of a safe-route verdict. */
        comment conditions /*
         *  Apply the S-002 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-109 continue to govern. */
    }
    requirement boundaryDegradedEvidence : BoundaryDegradedEvidence;
    #refinement dependency decomposeBoundaryDegradedEvidence from BlueDogRequirements::boundaryDegradedEvidence to BlueDogRequirements::operatingBoundary {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-109 specifies a detailed acceptance condition for S-002 within their stated applicability."; }
    }

    requirement def <'S-110'> AbortLatchDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After accepting emergency abort, the vessel shall latch the attempt as disqualified within 1 second. */
        comment conditions /*
         *  Apply the S-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-110 continue to govern. */
    }
    requirement abortLatchDeadline : AbortLatchDeadline;
    #refinement dependency decomposeAbortLatchDeadline from BlueDogRequirements::abortLatchDeadline to BlueDogRequirements::emergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-110 specifies a detailed acceptance condition for S-003 within their stated applicability."; }
    }

    requirement def <'S-111'> RecoveryTelemetryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During active emergency or powered recovery with a functioning link, the vessel shall deliver position telemetry at least once per 30 seconds, including low-energy operation. */
        comment conditions /*
         *  Apply the S-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-111 continue to govern. */
    }
    requirement recoveryTelemetryCadence : RecoveryTelemetryCadence;
    #refinement dependency decomposeRecoveryTelemetryCadence from BlueDogRequirements::recoveryTelemetryCadence to BlueDogRequirements::emergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-111 specifies a detailed acceptance condition for S-003 within their stated applicability."; }
    }

    requirement def <'S-112'> MotorIsolationDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A physically accessible local isolation control shall remove motor power within 1 second of activation. */
        comment conditions /*
         *  Apply the S-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-112 continue to govern. */
    }
    requirement motorIsolationDeadline : MotorIsolationDeadline;
    #refinement dependency decomposeMotorIsolationDeadline from BlueDogRequirements::motorIsolationDeadline to BlueDogRequirements::emergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-112 specifies a detailed acceptance condition for S-003 within their stated applicability."; }
    }

    requirement def <'S-113'> IsolationRestartInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Motor restart shall remain inhibited after local isolation until deliberate local reset. */
        comment conditions /*
         *  Apply the S-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-113 continue to govern. */
    }
    requirement isolationRestartInhibition : IsolationRestartInhibition;
    #refinement dependency decomposeIsolationRestartInhibition from BlueDogRequirements::isolationRestartInhibition to BlueDogRequirements::emergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-113 specifies a detailed acceptance condition for S-003 within their stated applicability."; }
    }

    requirement def <'S-114'> ManualControlLossShutdown {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After remote control has been lost for 5 seconds during manual powered recovery, the vessel shall command zero thrust within a further 1 second. */
        comment conditions /*
         *  Apply the S-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-114 continue to govern. */
    }
    requirement manualControlLossShutdown : ManualControlLossShutdown;
    #refinement dependency decomposeManualControlLossShutdown from BlueDogRequirements::manualControlLossShutdown to BlueDogRequirements::emergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-114 specifies a detailed acceptance condition for S-003 within their stated applicability."; }
    }

    requirement def <'S-115'> ControlLossLocationContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Location reporting shall continue at the active telemetry cadence after remote-control loss whenever a telemetry link is available. */
        comment conditions /*
         *  Apply the S-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-115 continue to govern. */
    }
    requirement controlLossLocationContinuity : ControlLossLocationContinuity;
    #refinement dependency decomposeControlLossLocationContinuity from BlueDogRequirements::controlLossLocationContinuity to BlueDogRequirements::emergencyControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-115 specifies a detailed acceptance condition for S-003 within their stated applicability."; }
    }

    requirement def <'S-116'> NavigationLightPresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present the lights prescribed for its current mode by the S-004 compliance matrix without a person aboard. */
        comment conditions /*
         *  Apply the S-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-116 continue to govern. */
    }
    requirement navigationLightPresentation : NavigationLightPresentation;

    #derivation connection decomposeNavigationLightPresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-004; the parent supplies shared verification conditions."; }
        end #original source ::> navigationConspicuity;
        end #derive target ::> navigationLightPresentation;
    }

    requirement def <'S-117'> NavigationShapePresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present the shapes prescribed for its current mode by the S-004 compliance matrix without a person aboard. */
        comment conditions /*
         *  Apply the S-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-117 continue to govern. */
    }
    requirement navigationShapePresentation : NavigationShapePresentation;

    #derivation connection decomposeNavigationShapePresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-004; the parent supplies shared verification conditions."; }
        end #original source ::> navigationConspicuity;
        end #derive target ::> navigationShapePresentation;
    }

    requirement def <'S-118'> NavigationSoundPresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present the sound signals prescribed for its current mode by the S-004 compliance matrix without a person aboard. */
        comment conditions /*
         *  Apply the S-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-118 continue to govern. */
    }
    requirement navigationSoundPresentation : NavigationSoundPresentation;

    #derivation connection decomposeNavigationSoundPresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-004; the parent supplies shared verification conditions."; }
        end #original source ::> navigationConspicuity;
        end #derive target ::> navigationSoundPresentation;
    }

    requirement def <'S-119'> SignalingModeDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A commanded mode change shall select the corresponding signaling configuration within 1 second. */
        comment conditions /*
         *  Apply the S-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-119 continue to govern. */
    }
    requirement signalingModeDeadline : SignalingModeDeadline;
    #refinement dependency decomposeSignalingModeDeadline from BlueDogRequirements::signalingModeDeadline to BlueDogRequirements::navigationConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-119 specifies a detailed acceptance condition for S-004 within their stated applicability."; }
    }

    requirement def <'S-120'> SignalingFaultRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each detectable signaling failure shall be logged within 5 seconds of detection. */
        comment conditions /*
         *  Apply the S-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-120 continue to govern. */
    }
    requirement signalingFaultRecording : SignalingFaultRecording;
    #refinement dependency decomposeSignalingFaultRecording from BlueDogRequirements::signalingFaultRecording to BlueDogRequirements::navigationConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-120 specifies a detailed acceptance condition for S-004 within their stated applicability."; }
    }

    requirement def <'S-121'> SignalingFaultReporting {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* With a functioning link, each detected signaling failure shall be reported to shore within 5 seconds. */
        comment conditions /*
         *  Apply the S-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-121 continue to govern. */
    }
    requirement signalingFaultReporting : SignalingFaultReporting;
    #refinement dependency decomposeSignalingFaultReporting from BlueDogRequirements::signalingFaultReporting to BlueDogRequirements::navigationConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-121 specifies a detailed acceptance condition for S-004 within their stated applicability."; }
    }

    requirement def <'S-122'> DeploymentComplianceRecord {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each deployment shall have a dated compliance record identifying the craft, dimensions, waters, operating modes, applicable navigation and radio obligations, and permission evidence. */
        comment conditions /*
         *  Apply the S-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-122 continue to govern. */
    }
    requirement deploymentComplianceRecord : DeploymentComplianceRecord;
    #refinement dependency decomposeDeploymentComplianceRecord from BlueDogRequirements::deploymentComplianceRecord to BlueDogRequirements::regulatoryClassification {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-122 specifies a detailed acceptance condition for S-005 within their stated applicability."; }
    }

    requirement def <'S-123'> DeploymentReleaseGate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Deployment release shall be withheld while any mandatory authorization is absent, expired or unresolved. */
        comment conditions /*
         *  Apply the S-005 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in S-123 continue to govern. */
    }
    requirement deploymentReleaseGate : DeploymentReleaseGate;

    #derivation connection decomposeDeploymentReleaseGate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-005; the parent supplies shared verification conditions."; }
        end #original source ::> regulatoryClassification;
        end #derive target ::> deploymentReleaseGate;
    }

    requirement def <'C-201'> TelemetryDisplayContent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall display UTC sample time, position, mode, conservative usable energy, reserve, faults and age from each current telemetry record. */
        comment conditions /*
         *  Apply the C-101 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-201 continue to govern. */
    }
    requirement telemetryDisplayContent : TelemetryDisplayContent;
    #refinement dependency decomposeTelemetryDisplayContent from BlueDogRequirements::telemetryDisplayContent to BlueDogRequirements::telemetryEquipment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-201 specifies a detailed acceptance condition for C-101 within their stated applicability."; }
    }

    requirement def <'C-202'> TelemetryStaleIndication {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall indicate stale data when record age exceeds its C-101 mode threshold until receipt of a record within its applicable threshold. */
        comment conditions /*
         *  Apply the C-101 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-202 continue to govern. */
    }
    requirement telemetryStaleIndication : TelemetryStaleIndication;
    #refinement dependency decomposeTelemetryStaleIndication from BlueDogRequirements::telemetryStaleIndication to BlueDogRequirements::telemetryEquipment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-202 specifies a detailed acceptance condition for C-101 within their stated applicability."; }
    }

    requirement def <'C-203'> TelemetryIdentityPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall preserve received record identity and sequence numbers across the C-101 outage/reconnection test. */
        comment conditions /*
         *  Apply the C-101 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-203 continue to govern. */
    }
    requirement telemetryIdentityPreservation : TelemetryIdentityPreservation;
    #refinement dependency decomposeTelemetryIdentityPreservation from BlueDogRequirements::telemetryIdentityPreservation to BlueDogRequirements::telemetryEquipment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-203 specifies a detailed acceptance condition for C-101 within their stated applicability."; }
    }

    requirement def <'C-204'> TelemetryDuplicateSuppression {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall not present a duplicate telemetry record as a new observation. */
        comment conditions /*
         *  Apply the C-101 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-204 continue to govern. */
    }
    requirement telemetryDuplicateSuppression : TelemetryDuplicateSuppression;
    #refinement dependency decomposeTelemetryDuplicateSuppression from BlueDogRequirements::telemetryDuplicateSuppression to BlueDogRequirements::telemetryEquipment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-204 specifies a detailed acceptance condition for C-101 within their stated applicability."; }
    }

    requirement def <'C-205'> UnauthenticatedCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Commands failing authentication shall cause zero accepted actuator or mission-state changes. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-205 continue to govern. */
    }
    requirement unauthenticatedCommandRejection : UnauthenticatedCommandRejection;
    #refinement dependency decomposeUnauthenticatedCommandRejection from BlueDogRequirements::unauthenticatedCommandRejection to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-205 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'C-206'> ReplayCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Commands with previously used sequence numbers shall cause zero accepted actuator or mission-state changes. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-206 continue to govern. */
    }
    requirement replayCommandRejection : ReplayCommandRejection;
    #refinement dependency decomposeReplayCommandRejection from BlueDogRequirements::replayCommandRejection to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-206 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'C-207'> ExpiredCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Commands older than 30 seconds shall cause zero accepted actuator or mission-state changes. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-207 continue to govern. */
    }
    requirement expiredCommandRejection : ExpiredCommandRejection;
    #refinement dependency decomposeExpiredCommandRejection from BlueDogRequirements::expiredCommandRejection to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-207 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'C-208'> AcceptedCommandDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An accepted abort or mode-change command shall be applied within 1 second of complete receipt. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-208 continue to govern. */
    }
    requirement acceptedCommandDeadline : AcceptedCommandDeadline;
    #refinement dependency decomposeAcceptedCommandDeadline from BlueDogRequirements::acceptedCommandDeadline to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-208 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'C-209'> OnboardAcknowledgmentDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An accepted abort or mode-change command shall be acknowledged onboard within 1 second of complete receipt. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-209 continue to govern. */
    }
    requirement onboardAcknowledgmentDeadline : OnboardAcknowledgmentDeadline;
    #refinement dependency decomposeOnboardAcknowledgmentDeadline from BlueDogRequirements::onboardAcknowledgmentDeadline to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-209 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'C-210'> AcknowledgmentQueueing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An accepted command acknowledgment shall enter the transmit queue in the same command-processing cycle when a link is available. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-210 continue to govern. */
    }
    requirement acknowledgmentQueueing : AcknowledgmentQueueing;
    #refinement dependency decomposeAcknowledgmentQueueing from BlueDogRequirements::acknowledgmentQueueing to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-210 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'C-211'> ExternalControlDisqualification {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Acceptance of external mission or steering control during a qualifying attempt shall permanently disqualify that attempt. */
        comment conditions /*
         *  Apply the C-102 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in C-211 continue to govern. */
    }
    requirement externalControlDisqualification : ExternalControlDisqualification;
    #refinement dependency decomposeExternalControlDisqualification from BlueDogRequirements::externalControlDisqualification to BlueDogRequirements::commandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-211 specifies a detailed acceptance condition for C-102 within their stated applicability."; }
    }

    requirement def <'N-101'> VisibilityNavigationCapability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Navigation shall meet E-002 and E-008 acceptance criteria at visibility of at least 1 km in daylight and darkness. */
        comment conditions /*
         *  Apply the N-033 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-101 continue to govern. */
    }
    requirement visibilityNavigationCapability : VisibilityNavigationCapability;

    #derivation connection decomposeVisibilityNavigationCapability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-033; the parent supplies shared verification conditions."; }
        end #original source ::> visibility;
        end #derive target ::> visibilityNavigationCapability;
    }

    requirement def <'N-102'> VisibilityTrafficCapability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Traffic assessment shall meet the reviewed class-specific S-001 criteria at visibility of at least 1 km in daylight and darkness.*/
        comment conditions /*
         *  Apply the N-033 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-102 continue to govern. */
    }
    requirement visibilityTrafficCapability : VisibilityTrafficCapability;

    #derivation connection decomposeVisibilityTrafficCapability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-033; the parent supplies shared verification conditions."; }
        end #original source ::> visibility;
        end #derive target ::> visibilityTrafficCapability;
    }

    requirement def <'N-103'> RestrictedVisibilityEntry {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* On detecting visibility below 1 km, the vessel shall enter restricted-visibility state within 60 seconds. */
        comment conditions /*
         *  Apply the N-033 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-103 continue to govern. */
    }
    requirement restrictedVisibilityEntry : RestrictedVisibilityEntry;
    #refinement dependency decomposeRestrictedVisibilityEntry from BlueDogRequirements::restrictedVisibilityEntry to BlueDogRequirements::visibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-103 specifies a detailed acceptance condition for N-033 within their stated applicability."; }
    }

    requirement def <'N-104'> RestrictedVisibilityEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Restricted-visibility operation shall be recorded as outside the normal operational envelope. */
        comment conditions /*
         *  Apply the N-033 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-104 continue to govern. */
    }
    requirement restrictedVisibilityEvidence : RestrictedVisibilityEvidence;
    #refinement dependency decomposeRestrictedVisibilityEvidence from BlueDogRequirements::restrictedVisibilityEvidence to BlueDogRequirements::visibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-104 specifies a detailed acceptance condition for N-033 within their stated applicability."; }
    }

    requirement def <'N-105'> RestrictedVisibilityCollisionAssessment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Collision assessment shall remain active during restricted-visibility operation. */
        comment conditions /*
         *  Apply the N-033 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-105 continue to govern. */
    }
    requirement restrictedVisibilityCollisionAssessment : RestrictedVisibilityCollisionAssessment;

    #derivation connection decomposeRestrictedVisibilityCollisionAssessment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-033; the parent supplies shared verification conditions."; }
        end #original source ::> visibility;
        end #derive target ::> restrictedVisibilityCollisionAssessment;
    }

    requirement def <'N-106'> SurvivalEntryDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter survival mode within 60 seconds of the N-035 upper-limit trigger. */
        comment conditions /*
         *  Apply the N-035 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-106 continue to govern. */
    }
    requirement survivalEntryDeadline : SurvivalEntryDeadline;
    #refinement dependency decomposeSurvivalEntryDeadline from BlueDogRequirements::survivalEntryDeadline to BlueDogRequirements::envelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-106 specifies a detailed acceptance condition for N-035 within their stated applicability."; }
    }

    requirement def <'N-107'> SurvivalTransitionRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every survival-mode entry shall have a corresponding event record. */
        comment conditions /*
         *  Apply the N-035 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-107 continue to govern. */
    }
    requirement survivalTransitionRecording : SurvivalTransitionRecording;
    #refinement dependency decomposeSurvivalTransitionRecording from BlueDogRequirements::survivalTransitionRecording to BlueDogRequirements::envelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-107 specifies a detailed acceptance condition for N-035 within their stated applicability."; }
    }

    requirement def <'N-108'> SailingResumptionDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Full autonomous sailing shall resume within 5 minutes of N-035 resumption eligibility becoming continuously true. */
        comment conditions /*
         *  Apply the N-035 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-108 continue to govern. */
    }
    requirement sailingResumptionDeadline : SailingResumptionDeadline;
    #refinement dependency decomposeSailingResumptionDeadline from BlueDogRequirements::sailingResumptionDeadline to BlueDogRequirements::envelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-108 specifies a detailed acceptance condition for N-035 within their stated applicability."; }
    }

    requirement def <'N-109'> SailingResumptionInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Full autonomous sailing shall remain inhibited while N-035 resumption eligibility is false. */
        comment conditions /*
         *  Apply the N-035 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-109 continue to govern. */
    }
    requirement sailingResumptionInhibition : SailingResumptionInhibition;

    #derivation connection decomposeSailingResumptionInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-035; the parent supplies shared verification conditions."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> sailingResumptionInhibition;
    }

    requirement def <'N-110'> ResumptionBlockEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every blocked sailing-resumption attempt shall record the blocking condition. */
        comment conditions /*
         *  Apply the N-035 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-110 continue to govern. */
    }
    requirement resumptionBlockEvidence : ResumptionBlockEvidence;
    #refinement dependency decomposeResumptionBlockEvidence from BlueDogRequirements::resumptionBlockEvidence to BlueDogRequirements::envelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-110 specifies a detailed acceptance condition for N-035 within their stated applicability."; }
    }

    requirement def <'N-111'> WetMechanismTravel {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-044 exposure, external mechanisms shall complete their full commanded travel without seizure. */
        comment conditions /*
         *  Apply the N-044 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-111 continue to govern. */
    }
    requirement wetMechanismTravel : WetMechanismTravel;
    #refinement dependency decomposeWetMechanismTravel from BlueDogRequirements::wetMechanismTravel to BlueDogRequirements::wetMechanicalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-111 specifies a detailed acceptance condition for N-044 within their stated applicability."; }
    }

    requirement def <'N-112'> WetJointIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-044 exposure, structural joints shall show no separation or through-cracks on visual inspection at 5 times magnification. */
        comment conditions /*
         *  Apply the N-044 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-112 continue to govern. */
    }
    requirement wetJointIntegrity : WetJointIntegrity;
    #refinement dependency decomposeWetJointIntegrity from BlueDogRequirements::wetJointIntegrity to BlueDogRequirements::wetMechanicalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-112 specifies a detailed acceptance condition for N-044 within their stated applicability."; }
    }

    requirement def <'N-113'> WetConductorResistance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-045 exposure, end-to-end conductor resistance shall be no more than 10 percent above its pre-test value. */
        comment conditions /*
         *  Apply the N-045 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-113 continue to govern. */
    }
    requirement wetConductorResistance : WetConductorResistance;
    #refinement dependency decomposeWetConductorResistance from BlueDogRequirements::wetConductorResistance to BlueDogRequirements::wetElectricalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-113 specifies a detailed acceptance condition for N-045 within their stated applicability."; }
    }

    requirement def <'N-114'> WetInsulationResistance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-045 exposure, conductor-to-conductor and conductor-to-case insulation resistance shall be at least 1 megohm at 50 V DC. */
        comment conditions /*
         *  Apply the N-045 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-114 continue to govern. */
    }
    requirement wetInsulationResistance : WetInsulationResistance;
    #refinement dependency decomposeWetInsulationResistance from BlueDogRequirements::wetInsulationResistance to BlueDogRequirements::wetElectricalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-114 specifies a detailed acceptance condition for N-045 within their stated applicability."; }
    }

    requirement def <'N-115'> HotSunElectronicsOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Powered electronics shall retain operational functions throughout the N-046 exposure. */
        comment conditions /*
         *  Apply the N-046 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-115 continue to govern. */
    }
    requirement hotSunElectronicsOperation : HotSunElectronicsOperation;

    #derivation connection decomposeHotSunElectronicsOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-046; the parent supplies shared verification conditions."; }
        end #original source ::> solarHeating;
        end #derive target ::> hotSunElectronicsOperation;
    }

    requirement def <'N-116'> HotSunBatteryTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Battery temperatures shall remain within manufacturer operating limits throughout the N-046 exposure. */
        comment conditions /*
         *  Apply the N-046 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-116 continue to govern. */
    }
    requirement hotSunBatteryTemperature : HotSunBatteryTemperature;

    #derivation connection decomposeHotSunBatteryTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-046; the parent supplies shared verification conditions."; }
        end #original source ::> solarHeating;
        end #derive target ::> hotSunBatteryTemperature;
    }

    requirement def <'N-117'> BatteryChargeTemperatureInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Battery charging shall remain inhibited whenever measured battery temperature is outside the manufacturer permitted charge range. */
        comment conditions /*
         *  Apply the N-046 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-117 continue to govern. */
    }
    requirement batteryChargeTemperatureInhibition : BatteryChargeTemperatureInhibition;

    dependency decomposeBatteryChargeTemperatureInhibition from batteryChargeTemperatureInhibition to solarHeating {
        metadata rationale : ModelingMetadata::Rationale { text = "Charge-temperature protection applies beyond the solar-heating campaign. The campaign supplies one relevant verification exposure rather than the source of this universal battery-protection obligation."; }
    }

    requirement def <'N-118'> RightingDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall self-right within 60 seconds of each N-051 release. */
        attribute measuredRightingTime : TimeValue;
        require constraint rightingDeadline {
            measuredRightingTime >= 0 [s] and measuredRightingTime <= 60 [s]
        }
        comment conditions /*
         *  Apply the N-051 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-118 continue to govern. */
    }
    requirement rightingDeadline : RightingDeadline;

    #derivation connection decomposeRightingDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-051; the parent supplies shared verification conditions."; }
        end #original source ::> selfRighting;
        end #derive target ::> rightingDeadline;
    }

    requirement def <'N-119'> CapsizeRigRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain its rig through every N-051 release. */
        comment conditions /*
         *  Apply the N-051 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-119 continue to govern. */
    }
    requirement capsizeRigRetention : CapsizeRigRetention;

    #derivation connection decomposeCapsizeRigRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-051; the parent supplies shared verification conditions."; }
        end #original source ::> selfRighting;
        end #derive target ::> capsizeRigRetention;
    }

    requirement def <'N-120'> CapsizeBallastRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain its ballast through every N-051 release. */
        comment conditions /*
         *  Apply the N-051 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-120 continue to govern. */
    }
    requirement capsizeBallastRetention : CapsizeBallastRetention;

    #derivation connection decomposeCapsizeBallastRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-051; the parent supplies shared verification conditions."; }
        end #original source ::> selfRighting;
        end #derive target ::> capsizeBallastRetention;
    }

    requirement def <'N-121'> CapsizeElectronicsSealing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* No water shall reach electronics during any N-051 release. */
        comment conditions /*
         *  Apply the N-051 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-121 continue to govern. */
    }
    requirement capsizeElectronicsSealing : CapsizeElectronicsSealing;

    #derivation connection decomposeCapsizeElectronicsSealing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-051; the parent supplies shared verification conditions."; }
        end #original source ::> selfRighting;
        end #derive target ::> capsizeElectronicsSealing;
    }

    requirement def <'N-122'> ControlRecoveryDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall restore mode-appropriate autonomous sail/steering control within 120 seconds from each N-051 release. */
        attribute measuredControlRecoveryTime : TimeValue;
        require constraint controlRecoveryDeadline {
            measuredControlRecoveryTime >= 0 [s] and measuredControlRecoveryTime <= 120 [s]
        }
        comment conditions /*
         *  Apply the N-052 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-122 continue to govern. */
    }
    requirement controlRecoveryDeadline : ControlRecoveryDeadline;
    #refinement dependency decomposeControlRecoveryDeadline from BlueDogRequirements::controlRecoveryDeadline to BlueDogRequirements::capsizeControlRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-122 specifies a detailed acceptance condition for N-052 within their stated applicability."; }
    }

    requirement def <'N-123'> CapsizeGateProgressRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Gate progress shall be preserved through every N-051 release. */
        comment conditions /*
         *  Apply the N-052 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-123 continue to govern. */
    }
    requirement capsizeGateProgressRetention : CapsizeGateProgressRetention;
    #refinement dependency decomposeCapsizeGateProgressRetention from BlueDogRequirements::capsizeGateProgressRetention to BlueDogRequirements::capsizeControlRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-123 specifies a detailed acceptance condition for N-052 within their stated applicability."; }
    }

    requirement def <'N-124'> CapsizeQualificationRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Qualification status shall be preserved through every N-051 release absent an independently disqualifying event. */
        comment conditions /*
         *  Apply the N-052 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-124 continue to govern. */
    }
    requirement capsizeQualificationRetention : CapsizeQualificationRetention;
    #refinement dependency decomposeCapsizeQualificationRetention from BlueDogRequirements::capsizeQualificationRetention to BlueDogRequirements::capsizeControlRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-124 specifies a detailed acceptance condition for N-052 within their stated applicability."; }
    }

    requirement def <'N-125'> CapsizeRestrictionRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Control restoration after each N-051 release shall preserve every active survival, low-energy, recovery and motor-inhibition restriction. */
        comment conditions /*
         *  Apply the N-052 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-125 continue to govern. */
    }
    requirement capsizeRestrictionRetention : CapsizeRestrictionRetention;
    #refinement dependency decomposeCapsizeRestrictionRetention from BlueDogRequirements::capsizeRestrictionRetention to BlueDogRequirements::capsizeControlRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-125 specifies a detailed acceptance condition for N-052 within their stated applicability."; }
    }

    requirement def <'N-126'> WeedPassageSpeed {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During each N-053 patch passage, mean water-relative sailing speed shall be at least 50 percent of the weed-free reference speed. */
        comment conditions /*
         *  Apply the N-053 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-126 continue to govern. */
    }
    requirement weedPassageSpeed : WeedPassageSpeed;
    #refinement dependency decomposeWeedPassageSpeed from BlueDogRequirements::weedPassageSpeed to BlueDogRequirements::submergedWeedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-126 specifies a detailed acceptance condition for N-053 within their stated applicability."; }
    }

    requirement def <'N-127'> WeedPassageSteering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-053 patch passage, full commanded rudder travel shall be regained within 5 minutes. */
        comment conditions /*
         *  Apply the N-053 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-127 continue to govern. */
    }
    requirement weedPassageSteering : WeedPassageSteering;
    #refinement dependency decomposeWeedPassageSteering from BlueDogRequirements::weedPassageSteering to BlueDogRequirements::submergedWeedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-127 specifies a detailed acceptance condition for N-053 within their stated applicability."; }
    }

    requirement def <'N-128'> WeedSnagSpeedRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 5 minutes of each N-054 snag, water-relative sailing speed shall recover to at least 50 percent of unobstructed reference speed. */
        comment conditions /*
         *  Apply the N-054 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-128 continue to govern. */
    }
    requirement weedSnagSpeedRecovery : WeedSnagSpeedRecovery;

    #derivation connection decomposeWeedSnagSpeedRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-054; the parent supplies shared verification conditions."; }
        end #original source ::> weedSnagShedding;
        end #derive target ::> weedSnagSpeedRecovery;
    }

    requirement def <'N-129'> WeedSnagSteeringRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 5 minutes of each N-054 snag, full commanded rudder travel shall be regained. */
        comment conditions /*
         *  Apply the N-054 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-129 continue to govern. */
    }
    requirement weedSnagSteeringRecovery : WeedSnagSteeringRecovery;

    #derivation connection decomposeWeedSnagSteeringRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-054; the parent supplies shared verification conditions."; }
        end #original source ::> weedSnagShedding;
        end #derive target ::> weedSnagSteeringRecovery;
    }

    requirement def <'N-130'> WeedBlockageFault {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A suspected-fouling fault shall be logged within 10 seconds after the N-055 trigger. */
        comment conditions /*
         *  Apply the N-055 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-130 continue to govern. */
    }
    requirement weedBlockageFault : WeedBlockageFault;
    #refinement dependency decomposeWeedBlockageFault from BlueDogRequirements::weedBlockageFault to BlueDogRequirements::weedBlockageResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-130 specifies a detailed acceptance condition for N-055 within their stated applicability."; }
    }

    requirement def <'N-131'> WeedBlockageContingency {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter fouling-contingency state within 10 seconds after the N-055 trigger. */
        comment conditions /*
         *  Apply the N-055 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-131 continue to govern. */
    }
    requirement weedBlockageContingency : WeedBlockageContingency;
    #refinement dependency decomposeWeedBlockageContingency from BlueDogRequirements::weedBlockageContingency to BlueDogRequirements::weedBlockageResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-131 specifies a detailed acceptance condition for N-055 within their stated applicability."; }
    }

    requirement def <'N-132'> WeedBlockageLocation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Location reporting shall continue at the active telemetry cadence during fouling contingency whenever a link is available. */
        comment conditions /*
         *  Apply the N-055 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-132 continue to govern. */
    }
    requirement weedBlockageLocation : WeedBlockageLocation;
    #refinement dependency decomposeWeedBlockageLocation from BlueDogRequirements::weedBlockageLocation to BlueDogRequirements::weedBlockageResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-132 specifies a detailed acceptance condition for N-055 within their stated applicability."; }
    }

    requirement def <'N-133'> PoweredWeedSpeed {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Mean water-relative powered speed through each N-056 patch passage shall be at least 50 percent of weed-free reference speed. */
        comment conditions /*
         *  Apply the N-056 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-133 continue to govern. */
    }
    requirement poweredWeedSpeed : PoweredWeedSpeed;
    #refinement dependency decomposePoweredWeedSpeed from BlueDogRequirements::poweredWeedSpeed to BlueDogRequirements::recoveryPropulsorWeeds {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-133 specifies a detailed acceptance condition for N-056 within their stated applicability."; }
    }

    requirement def <'N-134'> PoweredWeedCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Motor and controller currents shall remain within their respective rated limits during each N-056 patch passage. */
        comment conditions /*
         *  Apply the N-056 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-134 continue to govern. */
    }
    requirement poweredWeedCurrent : PoweredWeedCurrent;

    #derivation connection decomposePoweredWeedCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-056; the parent supplies shared verification conditions."; }
        end #original source ::> recoveryPropulsorWeeds;
        end #derive target ::> poweredWeedCurrent;
    }

    requirement def <'N-135'> PoweredWeedTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Motor and controller temperatures shall remain within their respective rated limits during each N-056 patch passage. */
        comment conditions /*
         *  Apply the N-056 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-135 continue to govern. */
    }
    requirement poweredWeedTemperature : PoweredWeedTemperature;

    #derivation connection decomposePoweredWeedTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-056; the parent supplies shared verification conditions."; }
        end #original source ::> recoveryPropulsorWeeds;
        end #derive target ::> poweredWeedTemperature;
    }

    requirement def <'N-136'> LockedPropulsorShutdown {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A locked propulsor shall cause motor shutdown within 2 seconds. */
        comment conditions /*
         *  Apply the N-056 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in N-136 continue to govern. */
    }
    requirement lockedPropulsorShutdown : LockedPropulsorShutdown;
    #refinement dependency decomposeLockedPropulsorShutdown from BlueDogRequirements::lockedPropulsorShutdown to BlueDogRequirements::recoveryPropulsorWeeds {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-136 specifies a detailed acceptance condition for N-056 within their stated applicability."; }
    }

    requirement def <'R-101'> MotorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Motor thrust shall remain disabled whenever an attempt is qualifying or qualification status is unknown. */
        attribute qualifying : Boolean;
        attribute qualificationStateKnown : Boolean;
        attribute motorEnabled : Boolean;
        require constraint motorQualificationInvariant {
            not motorEnabled or (qualificationStateKnown and not qualifying)
        }
        comment conditions /*
         *  Apply the R-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in R-101 continue to govern. */
    }
    requirement motorQualificationInvariant : MotorQualificationInvariant;
    #refinement dependency decomposeMotorQualificationInvariant from BlueDogRequirements::motorQualificationInvariant to BlueDogRequirements::challengeMotorInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "R-101 specifies a detailed acceptance condition for R-004 within their stated applicability."; }
    }

    requirement def <'R-102'> FreshRecoveryCommand {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After restart, motor enable shall remain inhibited until recovery is authorized by the onboard safety function or a fresh authenticated operator command. */
        comment conditions /*
         *  Apply the R-004 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in R-102 continue to govern. */
    }
    requirement freshRecoveryCommand : FreshRecoveryCommand;
    #refinement dependency decomposeFreshRecoveryCommand from BlueDogRequirements::freshRecoveryCommand to BlueDogRequirements::challengeMotorInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "R-102 specifies a detailed acceptance condition for R-004 within their stated applicability."; }
    }

    requirement def <'E-144'> IngressEventDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 injection test, an ingress event record shall exist within 60 seconds of injection starting. */
        comment conditions /*
         *  Apply the E-006 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-144 continue to govern. */
    }
    requirement ingressEventDeadline : IngressEventDeadline;
    #refinement dependency decomposeIngressEventDeadline from BlueDogRequirements::ingressEventDeadline to BlueDogRequirements::ingressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-144 specifies a detailed acceptance condition for E-006 within their stated applicability."; }
    }

    requirement def <'E-145'> QualificationRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 30 seconds after a watchdog reset under E-003 preconditions, qualification status shall equal the valid persisted status, or be nonqualifying when persisted status is absent or inconsistent. */
        comment conditions /*
         *  Apply the E-003 qualification conditions for this criterion. Explicit mode coverage and independent shared obligations stated in E-145 continue to govern. */
    }
    requirement qualificationRestoration : QualificationRestoration;
    #refinement dependency decomposeQualificationRestoration from BlueDogRequirements::qualificationRestoration to BlueDogRequirements::resetRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-145 specifies a detailed acceptance condition for E-003 within their stated applicability."; }
    }
    dependency sharedAcceptance1 from BlueDogRequirements::resetRecovery to BlueDogRequirements::logInterruptionDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-003 relies on the E-136 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance2 from BlueDogRequirements::resetRecovery to BlueDogRequirements::unknownQualificationFallback {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-003 relies on the E-139 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance3 from BlueDogRequirements::resetRecovery to BlueDogRequirements::qualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-003 relies on the E-138 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance4 from BlueDogRequirements::resetRecovery to BlueDogRequirements::freshRecoveryCommand {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-003 relies on the R-102 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance5 from BlueDogRequirements::resetRecovery to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-003 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance6 from BlueDogRequirements::commandIntegrity to BlueDogRequirements::criticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-102 relies on the E-132 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance7 from BlueDogRequirements::commandIntegrity to BlueDogRequirements::qualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-102 relies on the E-138 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance8 from BlueDogRequirements::emergencyControl to BlueDogRequirements::qualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-003 relies on the E-138 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance9 from BlueDogRequirements::emergencyControl to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-003 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance10 from BlueDogRequirements::emergencyControl to BlueDogRequirements::periodicLogCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "S-003 relies on the E-130 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance11 from BlueDogRequirements::challengeMotorInhibition to BlueDogRequirements::qualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "R-004 relies on the E-138 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance12 from BlueDogRequirements::challengeMotorInhibition to BlueDogRequirements::criticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "R-004 relies on the E-132 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance13 from BlueDogRequirements::lowEnergyRecovery to BlueDogRequirements::periodicLogCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-004 relies on the E-130 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance14 from BlueDogRequirements::lowEnergyRecovery to BlueDogRequirements::telemetryDeliveryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-004 relies on the E-120 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance15 from BlueDogRequirements::lowEnergyRecovery to BlueDogRequirements::criticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-004 relies on the E-132 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance16 from BlueDogRequirements::lowEnergyRecovery to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-004 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance17 from BlueDogRequirements::ingressResponse to BlueDogRequirements::criticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-006 relies on the E-132 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance18 from BlueDogRequirements::ingressResponse to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-006 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance19 from BlueDogRequirements::communications to BlueDogRequirements::logRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-005 relies on the E-131 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance20 from BlueDogRequirements::communications to BlueDogRequirements::reconnectLogPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-005 relies on the E-137 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance21 from BlueDogRequirements::navigationAvailability to BlueDogRequirements::criticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-008 relies on the E-132 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance22 from BlueDogRequirements::envelopeTransition to BlueDogRequirements::periodicLogCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-035 relies on the E-130 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance23 from BlueDogRequirements::envelopeTransition to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-035 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance24 from BlueDogRequirements::weedBlockageResponse to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-055 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }
    dependency sharedAcceptance25 from BlueDogRequirements::recoveryPropulsorWeeds to BlueDogRequirements::motorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "N-056 relies on the R-101 rule only for events and modes within its own qualification context. The full shared rule remains independently applicable and directly verified; this dependency does not derive its other contexts."; }
    }

    requirement def <'E-200'> SustainedEnergyFeasibility {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureEndurance; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The installed energy architecture shall support the selected bounded repeating profile without external charging, meeting the derived reserve, cycle-balance and peak-supply criteria. */
        comment notes /* A 72-hour energy demonstration does not prove indefinite weather availability, functional performance or ocean readiness. */
    }
    requirement sustainedEnergyFeasibility : SustainedEnergyFeasibility;

    requirement def <'E-201'> SustainedReserveProtection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Conservative stored energy shall remain strictly above the R-002 protected reserve throughout the selected mission-energy profile. */
        comment conditions /* Apply to the complete finite M-002 history or the future E-200 repeating profile as selected. Route-dependent reserve remains subject to R-002; a fixed reserve input is a declared analysis approximation. */
        comment notes /* Unmodeled intrainterval dips are outside the analysis claim. */
        attribute samples : EnergyValue [1..*] ordered nonunique;
        attribute reserve : EnergyValue;
        attribute verdict : Boolean = SustainedReserveProtectionCriterion(samples, reserve);
        require constraint { verdict }
    }
    requirement sustainedReserveProtection : SustainedReserveProtection;

    requirement def <'E-202'> RepeatableCycleBalance {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureEndurance; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Stored energy at the end of the complete repeating profile shall be at least its initial value at the same profile phase. */
        comment conditions /* The repeatability criterion assumes fixed capacity, loads and resource bounds. */
        comment notes /* This conditional result is not an indefinite-endurance verdict. */
        attribute initialEnergy : EnergyValue;
        attribute finalEnergy : EnergyValue;
        attribute verdict : Boolean = RepeatableCycleBalanceCriterion(initialEnergy, finalEnergy);
        require constraint { verdict }
    }
    requirement repeatableCycleBalance : RepeatableCycleBalance;

    requirement def <'E-203'> PeakSupplyCapability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The battery supply shall support each selected mode’s coincident peak withdrawal power without harvesting. */
        comment conditions /* Load power includes conversion losses and the declared uncertainty allowance. */
        attribute demands : PowerValue [1..*] ordered nonunique;
        attribute availablePower : PowerValue;
        attribute verdict : Boolean = PeakSupplyCapabilityCriterion(demands, availablePower);
        require constraint { verdict }
    }
    requirement peakSupplyCapability : PeakSupplyCapability;

    requirement def <'E-204'> HarvestCampaignCoverage {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureEndurance; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The qualification energy profile shall contain at least three consecutive 24-hour days, each with harvesting enabled for no more than 6 hours. */
        comment conditions /* Each modeled day is gap-free; the remaining time has harvesting disabled. Enabling harvesting with zero resource still counts as enabled. */
        attribute duration : TimeValue;
        attribute dayCount : Integer;
        attribute enabledHours : Real [1..*] ordered nonunique;
        attribute verdict : Boolean = HarvestCampaignCoverageCriterion(duration, dayCount, enabledHours);
        require constraint { verdict }
    }
    requirement harvestCampaignCoverage : HarvestCampaignCoverage;

    requirement def <'E-205'> EnergyEvidenceReadiness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The energy-case acceptance record shall identify accepted evidence for installed-load coverage, resource bounds, battery derating and interval resolution before the case is accepted. */
        attribute accepted : Boolean;
        attribute verdict : Boolean = EnergyEvidenceReadinessCriterion(accepted);
        require constraint { verdict }
    }
    requirement energyEvidenceReadiness : EnergyEvidenceReadiness;

    dependency energyDerivation1 from sustainedEnergyFeasibility to GorgeChallenge::repeatedOperation {
        metadata rationale : ModelingMetadata::Rationale { text = "Repeated journeys motivate a repeatable energy cycle, beyond a one-off endurance run."; }
    }

    dependency energyDerivation2 from sustainedEnergyFeasibility to BlueDog::Goals::hawaiiVoyage {
        metadata rationale : ModelingMetadata::Rationale { text = "The ocean ambition requires sustained energy autonomy; route-specific resources remain unresolved."; }
    }

    #derivation connection energyDerivation3 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of sustained energy feasibility."; }
        end #original source ::> sustainedEnergyFeasibility;
        end #derive target ::> sustainedReserveProtection;
    }

    #derivation connection energyDerivation4 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of sustained energy feasibility."; }
        end #original source ::> sustainedEnergyFeasibility;
        end #derive target ::> repeatableCycleBalance;
    }

    #derivation connection energyDerivation5 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of sustained energy feasibility."; }
        end #original source ::> sustainedEnergyFeasibility;
        end #derive target ::> peakSupplyCapability;
    }
    dependency energyDerivation6 from BlueDogRequirements::energyEvidenceReadiness to BlueDogRequirements::sustainedEnergyFeasibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-205 is an evidence-acceptance work product supporting E-200; a product capability does not logically entail the assurance record."; }
    }

    #derivation connection energyDerivation7 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "The M-002 campaign requires this separately evaluated energy outcome."; }
        end #original source ::> multiDayEndurance;
        end #derive target ::> sustainedReserveProtection;
    }
    #refinement dependency energyDerivation8 from BlueDogRequirements::peakSupplyCapability to BlueDogRequirements::multiDayEndurance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-203 specifies a detailed acceptance condition for M-002 within their stated applicability."; }
    }
    #refinement dependency energyDerivation9 from BlueDogRequirements::harvestCampaignCoverage to BlueDogRequirements::sustainedEnergyFeasibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-204 specifies a detailed acceptance condition for E-200 within their stated applicability."; }
    }
    dependency energyDerivation10 from BlueDogRequirements::energyEvidenceReadiness to BlueDogRequirements::multiDayEndurance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-205 is an evidence-acceptance work product supporting M-002; a product capability does not logically entail the assurance record."; }
    }

    dependency energyDerivation11 from sustainedReserveProtection to recoveryEnergy {
        metadata rationale : ModelingMetadata::Rationale { text = "Sustained operation protects the recovery reserve sized by the existing R-002 policy."; }
    }

    calc def SustainedReserveProtectionCriterion {
        in samples : EnergyValue [1..*] ordered nonunique;
        in reserve : EnergyValue;
        return verdict : Boolean;
        reserve > 0 [J] and SequenceFunctions::size(samples) > 0 and
            samples->ControlFunctions::forAll { in e : EnergyValue; e > reserve }
    }

    calc def RepeatableCycleBalanceCriterion {
        in initialEnergy : EnergyValue;
        in finalEnergy : EnergyValue;
        return verdict : Boolean;
        initialEnergy > 0 [J] and finalEnergy >= initialEnergy
    }

    calc def PeakSupplyCapabilityCriterion {
        in demands : PowerValue [1..*] ordered nonunique;
        in availablePower : PowerValue;
        return verdict : Boolean;
        availablePower > 0 [W] and SequenceFunctions::size(demands) > 0 and
            demands->ControlFunctions::forAll { in p : PowerValue; p >= 0 [W] and p <= availablePower }
    }

    calc def HarvestCampaignCoverageCriterion {
        in duration : TimeValue;
        in dayCount : Integer;
        in enabledHours : Real [1..*] ordered nonunique;
        return verdict : Boolean;
        dayCount >= 3 and duration == dayCount * 86400 [s] and
            SequenceFunctions::size(enabledHours) == dayCount and
            enabledHours->ControlFunctions::forAll { in hours : Real; hours >= 0 and hours <= 6 }
    }

    calc def EnergyEvidenceReadinessCriterion {
        in accepted : Boolean;
        return verdict : Boolean;
        accepted
    }
    requirement def <'Q-001'> CruisePerformance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall sustain sailing performance sufficient to complete each declared unassisted mission route. */
        comment conditions /* The declared route includes sailing legs, current projections, weather holds and maneuvering time. The Gorge qualifying attempt uses a selected weather window, with westerly flow as the representative sizing case. Winter testing and eventual year-round operation use separate declared profiles. Apply Q-101 through Q-103; see BlueDogWeather::policy. */
        metadata rationale : ModelingMetadata::Rationale { text = "Cruise speed determines exposure to failures; water speed alone does not establish route completion."; }
    }
    requirement cruisePerformance : CruisePerformance;
    requirement def <'Q-101'> LegProgress {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /*
         *  The mission-performance assessment shall evaluate complete-route progress over the declared reproducible scenario ensemble, including sailing legs, holds and maneuvers. */
        comment conditions /* Evaluate sailing-only, loaded configuration under the declared wind, wave, current and fouling profile. Include tacking in water-relative velocity made good. Holds are separate exposure intervals, not discarded samples. */
        metadata rationale : ModelingMetadata::Rationale { text = "Owner decision: no fixed minimum sailing speed. Compare complete passage, waiting, aborts, recovery reserve and model coverage using the same versioned scenario set across designs."; }
        metadata issue : ModelingMetadata::Issue { text = "Proposed target pending design review and mission-profile selection."; }
        attribute groundSpeeds : SpeedValue [1..*] ordered nonunique;
        comment assessment /* Ground speeds are analysis outputs, not a fixed-speed acceptance predicate. Mission outcomes govern the performance trade. */
    }
    requirement legProgress : LegProgress;
    requirement def <'Q-102'> PassageDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall complete the declared route within the qualified unassisted operating duration. */
        comment conditions /* Passage duration includes every sailing leg, weather hold and maneuver. Qualified duration must come from the same configuration and applicable environment. */
        metadata rationale : ModelingMetadata::Rationale { text = "A fast moving-leg average cannot conceal long periods waiting for usable wind."; }
        attribute voyageDuration : TimeValue;
        attribute qualifiedDuration : TimeValue;
        require constraint acceptance { PassageDurationCriterion(voyageDuration, qualifiedDuration) }
    }
    requirement passageDuration : PassageDuration;
    requirement def <'Q-103'> CruiseEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The cruise-performance assessment shall use accepted loaded-vessel sailing evidence for its declared mission profile. */
        comment conditions /* Evidence records route distance, wind/sea state, signed along-route current, sailing polar or measured velocity made good, fouling allowance, holds, uncertainty and configuration. No auxiliary propulsion credit for the Gorge challenge. */
        metadata rationale : ModelingMetadata::Rationale { text = "Synthetic inputs support sensitivity analysis only."; }
    }
    requirement cruiseEvidence : CruiseEvidence;
    requirement def <'L-001'> MissionReliability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall preserve mission-critical functions throughout each declared unassisted voyage. */
        comment conditions /* L-103 evidence and L-104 failure dispositions apply to the finite Gorge attempt. L-101 and L-102 are provisional study objectives, not launch or mission-acceptance thresholds. Hawaii reliability targets require a separate future allocation. Failure includes loss of required control, mission completion, safety function or required observation service. Recovery that violates the mission rules is not success. */
        metadata rationale : ModelingMetadata::Rationale { text = "Longer passages impose tighter reliability budgets; Gorge performance does not qualify an ocean mission."; }
    }
    requirement missionReliability : MissionReliability;
    requirement def <'L-101'> MissionSuccessProbability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The reliability study should assess a provisional objective of 0.90 mission reliability at 95-percent confidence over the declared voyage duration. */
        comment conditions /* Reliability means absence of mission-critical failure over total elapsed exposure, including holds. Statistical evidence must represent the declared configuration, environment and failure definition. */
        metadata rationale : ModelingMetadata::Rationale { text = "0.90 at 95-percent confidence is a proposed engineering target. It is not a measured reliability estimate."; }
        metadata issue : ModelingMetadata::Issue { text = "Proposed target pending design review and mission-profile selection."; }
        attribute lowerBound : Real;
        attribute confidence : Real;
        comment assessment /* MissionReliabilityCriterion is available for study comparisons; this provisional objective is not a challenge acceptance constraint. */
    }
    requirement missionSuccessProbability : MissionSuccessProbability;
    requirement def <'L-102'> FailureRateBudget {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The reliability study should compare the combined mission-critical failure-rate bound with the provisional L-101 objective over Q-102 exposure. */
        comment conditions /* The initial constant-hazard model sums non-overlapping independent critical failure rates plus a separately assessed common-cause contribution. Component bounds require a joint-confidence argument; summing individual 95-percent bounds does not establish a system 95-percent bound. Wear, systematic software faults, variable stress and recovery need a different model when this assumption is unsupported. */
        metadata rationale : ModelingMetadata::Rationale { text = "Use lambda_max = -ln(0.90)/T. Do not sum DFMEA ordinal rankings or assume missing rates are zero."; }
        attribute ratePerHour : Real;
        attribute exposureHours : Real;
        comment assessment /* FailureRateCriterion evaluates the provisional study objective; it is not a binding qualification constraint. */
    }
    requirement failureRateBudget : FailureRateBudget;
    requirement def <'L-103'> ReliabilityEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The reliability assessment shall use accepted mission-representative evidence supporting its failure-rate bound. */
        comment conditions /* Document confidence method, censoring, configuration, mission profile, exposure and observed critical failures. The initial zero-failure demonstration is invalid when failures occurred or the constant-hazard assumption is unsupported. */
        metadata rationale : ModelingMetadata::Rationale { text = "A numerical estimate is not a confidence bound; shorter tests cannot establish an indefinite lifetime."; }
    }
    requirement reliabilityEvidence : ReliabilityEvidence;
    requirement def <'L-104'> CriticalFailureDisposition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each identified safety-critical failure mode shall have an accepted disposition before an unassisted launch. */
        comment conditions /* Acceptance requires evidence for prevention, detection and response, or an explicitly reviewed residual risk. The DFMEA starter is incomplete; completing listed rows does not demonstrate hazard coverage. */
        metadata rationale : ModelingMetadata::Rationale { text = "Potential harm to other waterway users must not be traded against an attractive aggregate reliability score."; }
    }
    requirement criticalFailureDisposition : CriticalFailureDisposition;
    dependency cruiseReliabilityDerivation1 from cruisePerformance to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "The cruise study estimates sailing speed and the time and energy needed to complete the river circuit."; }
    }
    dependency cruiseReliabilityDerivation3 from missionReliability to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "The reliability study compares failure exposure during the circuit; its target still needs evidence for the proposed boat."; }
    }
    #derivation connection cruiseReliabilityDerivation6 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "legProgress supplies an acceptance condition needed to achieve cruisePerformance."; }
        end #original source ::> cruisePerformance;
        end #derive target ::> legProgress;
    }
    #derivation connection cruiseReliabilityDerivation7 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "passageDuration supplies an acceptance condition needed to achieve cruisePerformance."; }
        end #original source ::> cruisePerformance;
        end #derive target ::> passageDuration;
    }
    #derivation connection cruiseReliabilityDerivation8 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "cruiseEvidence supplies an acceptance condition needed to achieve cruisePerformance."; }
        end #original source ::> cruisePerformance;
        end #derive target ::> cruiseEvidence;
    }
    dependency cruiseReliabilityDerivation9 from missionSuccessProbability to missionReliability {
        metadata rationale : ModelingMetadata::Rationale { text = "The provisional probability/confidence objective supports reliability studies; preserving required functions does not entail this unaccepted numerical target."; }
    }
    dependency cruiseReliabilityDerivation10 from failureRateBudget to missionReliability {
        metadata rationale : ModelingMetadata::Rationale { text = "The constant-hazard budget is one provisional study model. Mission capability does not require this failure distribution or establish its evidence."; }
    }
    #derivation connection cruiseReliabilityDerivation11 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "reliabilityEvidence supplies an acceptance condition needed to achieve missionReliability."; }
        end #original source ::> missionReliability;
        end #derive target ::> reliabilityEvidence;
    }
    #derivation connection cruiseReliabilityDerivation12 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "criticalFailureDisposition supplies an acceptance condition needed to achieve missionReliability."; }
        end #original source ::> missionReliability;
        end #derive target ::> criticalFailureDisposition;
    }
    calc def LegProgressCriterion {
        in speeds : SpeedValue [1..*] ordered nonunique;
        return verdict : Boolean;
        SequenceFunctions::size(speeds) > 0 and speeds->ControlFunctions::forAll { in speed : SpeedValue; speed >= 0.5 [m/s] }
    }
    calc def PassageDurationCriterion {
        in exposure : TimeValue;
        in qualified : TimeValue;
        return verdict : Boolean;
        exposure > 0 [s] and qualified > 0 [s] and exposure <= qualified
    }
    calc def MissionReliabilityCriterion {
        in lowerBound : Real;
        in confidence : Real;
        return verdict : Boolean;
        lowerBound >= 0.90 and lowerBound <= 1 and confidence >= 0.95 and confidence < 1
    }
    calc def FailureRateCriterion {
        in ratePerHour : Real;
        in exposureHours : Real;
        return verdict : Boolean;
        ratePerHour >= 0 and exposureHours > 0 and ratePerHour * exposureHours <= -OpenSysMLMathFunctions::ln(0.90)
    }

    // Refine numerical acceptance; these links do not establish physical evidence.
    #refinement dependency formalizeSustainedReserveProtectionCriterion from SustainedReserveProtectionCriterion to sustainedReserveProtection {
        metadata rationale : ModelingMetadata::Rationale { text = "Formalizes the numerical acceptance relation on supplied inputs. The requirement qualification conditions, input representativeness and evidence obligations still apply."; }
    }
    #refinement dependency formalizeRepeatableCycleBalanceCriterion from RepeatableCycleBalanceCriterion to repeatableCycleBalance {
        metadata rationale : ModelingMetadata::Rationale { text = "Formalizes the numerical acceptance relation on supplied inputs. The requirement qualification conditions, input representativeness and evidence obligations still apply."; }
    }
    #refinement dependency formalizePeakSupplyCapabilityCriterion from PeakSupplyCapabilityCriterion to peakSupplyCapability {
        metadata rationale : ModelingMetadata::Rationale { text = "Formalizes the numerical acceptance relation on supplied inputs. The requirement qualification conditions, input representativeness and evidence obligations still apply."; }
    }
    #refinement dependency formalizeHarvestCampaignCoverageCriterion from HarvestCampaignCoverageCriterion to harvestCampaignCoverage {
        metadata rationale : ModelingMetadata::Rationale { text = "Formalizes the numerical acceptance relation on supplied inputs. The requirement qualification conditions, input representativeness and evidence obligations still apply."; }
    }
    dependency studyLegProgressCriterion from LegProgressCriterion to legProgress {
        metadata rationale : ModelingMetadata::Rationale { text = "Legacy or provisional numerical study screen, retained for comparison with recorded analyses. This is not a current challenge acceptance refinement."; }
    }
    #refinement dependency formalizePassageDurationCriterion from PassageDurationCriterion to passageDuration {
        metadata rationale : ModelingMetadata::Rationale { text = "Formalizes the numerical acceptance relation on supplied inputs. The requirement qualification conditions, input representativeness and evidence obligations still apply."; }
    }
    dependency studyMissionReliabilityCriterion from MissionReliabilityCriterion to missionSuccessProbability {
        metadata rationale : ModelingMetadata::Rationale { text = "Legacy or provisional numerical study screen, retained for comparison with recorded analyses. This is not a current challenge acceptance refinement."; }
    }
    dependency studyFailureRateCriterion from FailureRateCriterion to failureRateBudget {
        metadata rationale : ModelingMetadata::Rationale { text = "Legacy or provisional numerical study screen, retained for comparison with recorded analyses. This is not a current challenge acceptance refinement."; }
    }
    private import RequirementDerivation::*;
    requirement def <'E-009'> WindObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall provide onboard apparent-wind observations for autonomous sail control. */
        comment conditions /* Qualify the complete installation, including sensor, alignment, vessel-frame transformation and communication interface. Use a calibrated wind reference at the sensor location, speeds 2, 5, 10, 15 and 20 m/s, headings every 30 degrees, heels -20, 0 and 20 degrees, and all intended rig trim positions. Evaluate each 30-minute steady test independently; every scheduled one-second observation must satisfy the applicable criterion. Fault tests inject link loss, frozen timestamps, malformed data and power interruption separately. */
        metadata rationale : ModelingMetadata::Rationale { text = "Sail trim depends on apparent-wind direction and loading depends on speed. Closed-loop autonomous sailing needs onboard observations independent of shore telemetry. One-second updates align with sail-command cadence; 5 degrees and max(0.5 m/s,5 percent) are initial installed-error allocations to refine with control sensitivity analysis."; }
        metadata issue : ModelingMetadata::Issue { text = "Validate sensor exposure, mast/wing interference, heel transformation and degraded trim behavior. Local apparent wind is distinct from the 10 m true-wind environmental reference; envelope detection needs a separate estimation model. Extend accuracy qualification beyond 20 m/s if survival control depends on precise wind measurements."; }
    }
    requirement windObservation : WindObservation;
    dependency windForAutonomousControl from windObservation to navigationAndControl {
        metadata rationale : ModelingMetadata::Rationale { text = "Apparent-wind feedback is the selected implementation for autonomous sail trim. This is a design-basis dependency, not an assertion that every autonomous sailing architecture must use this sensor."; }
    }
    dependency windForSailOnlyMission from windObservation to GorgeChallenge::sailingPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "Changes to the sail-only operating concept require review of the selected wind-feedback strategy; sailing propulsion alone does not prescribe a sensor technology."; }
    }
    dependency windEnduranceBasis from windSensingEndurance to multiDayEndurance {
        metadata rationale : ModelingMetadata::Rationale { text = "A change to the finite mission exposure changes installed sensing endurance and energy evidence; the mission does not imply a fixed campaign duration."; }
    }
    requirement def <'E-146'> WindSampleCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall deliver apparent-wind observations to sail control at intervals no greater than 1 second. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windSampleCadence : WindSampleCadence;
    #refinement dependency decomposeWindSampleCadence from BlueDogRequirements::windSampleCadence to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-146 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'E-147'> WindSpeedAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Installed apparent-wind speed error shall not exceed the greater of 0.5 m/s or 5 percent of reference speed. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windSpeedAccuracy : WindSpeedAccuracy;
    #refinement dependency decomposeWindSpeedAccuracy from BlueDogRequirements::windSpeedAccuracy to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-147 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'E-148'> WindDirectionAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Installed apparent-wind direction error relative to the vessel heading shall not exceed 5 degrees. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windDirectionAccuracy : WindDirectionAccuracy;
    #refinement dependency decomposeWindDirectionAccuracy from BlueDogRequirements::windDirectionAccuracy to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-148 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'E-149'> WindStaleInvalidation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall mark wind observations invalid when their age exceeds 2 seconds. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windStaleInvalidation : WindStaleInvalidation;
    #refinement dependency decomposeWindStaleInvalidation from BlueDogRequirements::windStaleInvalidation to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-149 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'E-150'> InvalidWindUseInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Sail control shall exclude invalid wind observations from trim calculations. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement invalidWindUseInhibition : InvalidWindUseInhibition;
    #refinement dependency decomposeInvalidWindUseInhibition from BlueDogRequirements::invalidWindUseInhibition to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-150 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'E-151'> WindLossResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter its wind-sensing-degraded control state within 1 second after wind observations become invalid. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windLossResponse : WindLossResponse;
    #refinement dependency decomposeWindLossResponse from BlueDogRequirements::windLossResponse to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-151 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'E-152'> WindSensingEndurance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The wind-sensing installation shall operate throughout the complete M-002 mission without servicing or external charging. */
        comment conditions /* Use the installed configuration through the complete M-002 energy campaign, including its holds and maneuvers. E-009 separately qualifies installed measurement and fault response. */
    }
    requirement windSensingEndurance : WindSensingEndurance;
    #refinement dependency decomposeWindSensingEndurance from BlueDogRequirements::windSensingEndurance to BlueDogRequirements::windObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "E-152 specifies a detailed acceptance condition for E-009 within their stated applicability."; }
    }
    requirement def <'N-004'> VegetationResilience {
        doc /* The vessel shall preserve or autonomously recover the sailing and recovery functions specified for the declared submerged-vegetation encounters. */
        comment conditions /* N-053 through N-056 define distinct passage, snag, blockage and powered-recovery cases under the declared Gorge exposure. Submerged-weed qualification excludes dense floating mats and fishing-line entanglement. No disturbance waives required safety capability or motor inhibition. */
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
    }
    requirement vegetationResilience : VegetationResilience;
    dependency vegetationEnvironmentBasis from vegetationResilience to environmentalEnvelope;

    dependency navigationDutyBasis from trafficSafety to GorgeChallenge::navigationRules;
    dependency recoverySignalBasis from navigationConspicuity to GorgeChallenge::recoveryConspicuity;
    dependency signalMatrixBasis from navigationConspicuity to regulatoryClassification;

}
