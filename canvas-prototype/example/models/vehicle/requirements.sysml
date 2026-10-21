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
        doc /* The vessel shall cross the configured Bingen departure, buoy 16 rounding checkpoints and Bingen return gates in order during one qualifying attempt. */
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
        doc /* The vessel shall maintain conservative estimates of usable energy and protected recovery reserve. */
        comment conditions /* Energy estimation and conservative decision inputs; accuracy uses calibrated energy integration across operating battery temperatures. */
    }
    requirement def <'E-002'> NavigationAndControl {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall provide autonomous navigation and sail/steering control within the selected operational profile. */
        comment conditions /* Qualification uses the selected mission profile. Accuracy trials contain 1800 scheduled one-second epochs in 30 minutes; invalid or missing epochs count as failed epochs. Position and heading criteria use the same set of at least 1710 qualifying epochs, preventing separate selection of different good samples. Fault-injection runs are separate. */
    }
    requirement def <'E-003'> ResetRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall restore mode-appropriate autonomous operation after a watchdog reset. */
        comment conditions /* Watchdog-reset tests start above protected reserve with valid navigation observations. Normal sailing remains subject to N-035; data and qualification persistence have shared leaf criteria. */
    }
    requirement def <'E-004'> LowEnergyRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall protect essential functions when conservative usable energy reaches the recovery reserve. */
        comment conditions /* Reserve means R-002. Emergency/recovery cadence takes precedence; clearing low-energy state is independent of other modes, while payload enabling respects all restrictions. */
    }
    requirement def <'E-005'> Communications {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain telemetry through link outages for delivery after reconnection. */
        comment conditions /* Link availability is a delivery-test precondition, not a coverage guarantee. Normal, low-energy and recovery delivery cadence is 30 seconds, as allocated by GorgeChallenge::liveObservation. Outage tests last 24 hours. */
    }
    requirement def <'E-006'> IngressResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain recoverability during the specified hull-ingress qualification. */
        comment conditions /* All leaves use a 30-minute freshwater injection at 10 mL/min into the normally dry hull. No pump technology is prescribed; R-004 remains applicable. */
    }
    requirement def <'E-007'> MissionEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain time-correlated mission evidence through communication and power interruptions. */
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
        metadata rationale : ModelingMetadata::Rationale { text = "The complete finite round trip, including holding and contingency exposure, determines required endurance. Repeated circuits are a separate future objective. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency challengeAutonomy from navigationAndControl to GorgeChallenge::unassistedAttempt {
        metadata rationale : ModelingMetadata::Rationale { text = "The vessel needs onboard guidance and control to complete an unassisted attempt. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency challengePropulsion from roundTrip to GorgeChallenge::sailingPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "Vehicle challenge operation excludes auxiliary motor propulsion; powered development tests are separate. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    #refinement dependency challengeMonitoring from communications to GorgeChallenge::liveObservation {
        metadata rationale : ModelingMetadata::Rationale { text = "The vehicle telemetry requirement provides a more precise outage-retention and delivery specification for the observation aspect of C-005. Autonomous execution remains separately required."; }
    }
    dependency challengeOverride from communications to GorgeChallenge::emergencyIntervention {
        metadata rationale : ModelingMetadata::Rationale { text = "Vehicle communications provide emergency commands whose use ends attempt qualification. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    // Derivations: direction is original requirement to derived requirement.
    dependency roundTripNavigation from navigationAndControl to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Autonomous completion of the route needs observations, guidance, and actuation. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency roundTripReset from resetRecovery to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "A reset during an autonomous journey must not leave mission behavior undefined. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency roundTripCommunications from communications to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Mission supervision and recovery need an agreed operator communication policy. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency roundTripIngress from ingressResponse to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Recovering the boat after the journey motivates a defined response to small leaks. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency roundTripEvidence from missionEvidence to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "Assessing route completion and learning from the mission requires recorded evidence. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency enduranceEnergy from energyAwareness to multiDayEndurance {
        metadata rationale : ModelingMetadata::Rationale { text = "Multi-day operation with variable harvesting needs energy estimation and load management. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency enduranceLimpMode from lowEnergyRecovery to multiDayEndurance {
        metadata rationale : ModelingMetadata::Rationale { text = "Harvest shortfalls need an explicit degraded operating mode. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency energyLimpMode from lowEnergyRecovery to energyAwareness {
        metadata rationale : ModelingMetadata::Rationale { text = "Available-energy estimates and reserve policy must drive low-energy transitions. This is design motivation or an implementation choice, not a satisfaction implication."; }
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
        doc /* Every print job shall fit within positive X, Y and Z extents no greater than 250 mm each. */
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
        doc /* The vessel shall assess and respond to collision risks within reviewed class-specific detection and response envelopes while meeting the collision avoidance and nonimpediment obligations.*/
        metadata issue : ModelingMetadata::Issue { text = "BlueDogClassDetection defines the current class-specific allocation method. Numerical consequence, exposure, reliability, confidence and risk acceptance inputs remain unreviewed; hardware sensing and maneuver evidence is absent. Historical six-class 750 m analyses do not define the current requirement."; }
        comment conditions /* Use independently recorded head-on, crossing and overtaking AIS and non-AIS targets, day and night in the selected operational profile. Allocations shall include kinematic response distance, uncertainty, consequence-informed clearance and margins, and required timely observation and whole-response reliability with confidence criteria. Unreliably classified targets shall use a reviewed conservative envelope spanning plausible classes and occupant transitions. Collision avoidance and nonimpediment obligations remain unchanged.*/
    }
    requirement trafficSafety : TrafficSafety;
    #derivation connection challengeTrafficResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Preventing collisions requires traffic assessment and response; scenario parameters are allocated by Blue Dog analysis."; }
        end #original source ::> GorgeChallenge::trafficCoexistence;
        end #derive target ::> trafficSafety;
    }
    dependency deriveTrafficSafety from trafficSafety to navigationAndControl {
        metadata rationale : ModelingMetadata::Rationale { text = "TrafficSafety supports navigationAndControl. This is design motivation or an implementation choice, not a satisfaction implication."; }
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
        metadata rationale : ModelingMetadata::Rationale { text = "OperatingBoundary supports roundTrip. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'S-003'> SafeRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall support controlled emergency intervention and powered recovery. */
        comment conditions /* Emergency intervention ends attempt qualification. Exercise active emergency, powered recovery, local isolation and remote-control loss, including coexisting low-energy flags. */
    }
    requirement safeRecovery : SafeRecovery;
    dependency deriveSafeRecovery from safeRecovery to GorgeChallenge::emergencyIntervention {
        metadata rationale : ModelingMetadata::Rationale { text = "Permitted emergency intervention requires explicit abort, qualification, isolation and control-loss behavior. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'S-004'> NavigationConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present the navigation signals required for its operating mode. */
        comment conditions /* Use the deployment-specific compliance matrix for sailing, powered-recovery and stationary modes, including its visibility, arcs, colors and sound criteria. The matrix remains a deployment hold point under S-005. */
    }
    requirement navigationConspicuity : NavigationConspicuity;
    #derivation connection challengeNavigationSignals {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Applicable navigation-rule compliance includes presenting the required mode-dependent signals."; }
        end #original source ::> GorgeChallenge::navigationRules;
        end #derive target ::> navigationConspicuity;
    }
    dependency deriveNavigationConspicuity from navigationConspicuity to trafficSafety {
        metadata rationale : ModelingMetadata::Rationale { text = "NavigationConspicuity supports trafficSafety. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'S-005'> RegulatoryClassification {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Deployment shall require documented compliance with applicable navigation, radio and authorization obligations. */
        comment conditions /* Acceptance is deployment document review, not onboard behavior or an assertion of buoy status. */
    }
    requirement regulatoryClassification : RegulatoryClassification;
    dependency deriveRegulatoryClassification from regulatoryClassification to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "RegulatoryClassification supports roundTrip. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'N-001'> EnvironmentalEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain the functions required by its selected environmental profile and operating mode. */
        comment conditions /* Gorge qualification uses N-010; ocean qualification uses N-020. Both include applicable shared exposure requirements. Operational functions are navigation, sail/steering control, recording and available-link telemetry. Survival requires flotation, attached rig/ballast, dry electronics and retained mission state; course progress is not required. Required traffic assessment, navigation signals and available-link location reporting remain safety obligations in every mode. Loss of required safety capability invokes C-012 even when the structure survives. */
        comment notes /* Profiles are not interchangeable. Gorge release does not require ocean qualification, and Gorge success does not establish ocean capability. */
    }
    requirement environmentalEnvelope : EnvironmentalEnvelope;
    dependency deriveEnvironmentalEnvelope from environmentalEnvelope to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "EnvironmentalEnvelope supports roundTrip. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'N-002'> MarineDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain required function and structural integrity through its selected wet-exposure campaign. */
        comment conditions /* Gorge uses N-041 freshwater exposure; ocean uses N-042 saltwater exposure; dual-profile qualification requires both. Shared sealing, material-aging and thermal checks use the selected campaign. */
        comment notes /* A derivation does not make every mission-specific descendant applicable to every deployment. */
    }
    requirement marineDurability : MarineDurability;
    dependency deriveMarineDurability from marineDurability to environmentalEnvelope {
        metadata rationale : ModelingMetadata::Rationale { text = "MarineDurability supports environmentalEnvelope. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'N-003'> StabilityAndFouling {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall autonomously tolerate capsize and submerged aquatic vegetation, including milfoil-like stems. */
        comment conditions /* Capsize and vegetation are separate disturbance cases. Righting and upright control restoration apply to the selected N-051 strategy; C-018 also permits post-abort limp recovery. Weed passage, snag shedding and blockage response apply to the declared Gorge exposure. No disturbance waives required safety capability or motor inhibition. */
        comment notes /* Submerged-weed passage qualification does not cover dense floating mats or fishing-line entanglement. */
    }
    requirement stabilityAndFouling : StabilityAndFouling;
    dependency deriveStabilityAndFouling from stabilityAndFouling to environmentalEnvelope {
        metadata rationale : ModelingMetadata::Rationale { text = "StabilityAndFouling supports environmentalEnvelope. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'R-001'> RecoveryPropulsion {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* At maximum mission load, powered recovery shall reach a suitable shore retrieval location from the declared course recovery cases. */
        comment conditions /* Use route-specific wind, waves, current and casualty state, with installed propulsion performance. R-004 governs motor enable and challenge qualification; S-003 governs isolation and control loss. Course recovery scenarios must be accepted before qualification. */
        comment notes /* A sheltered thrust demonstration alone cannot qualify course-wide or capsized recovery. */
    }
    requirement recoveryPropulsion : RecoveryPropulsion;
    dependency deriveRecoveryPropulsion from recoveryPropulsion to safeRecovery {
        metadata rationale : ModelingMetadata::Rationale { text = "RecoveryPropulsion supports safeRecovery. This is design motivation or an implementation choice, not a satisfaction implication."; }
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
        metadata rationale : ModelingMetadata::Rationale { text = "RecoveryEnergy supports recoveryPropulsion. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'C-101'> TelemetryEquipment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall present current vessel telemetry with explicit data age and identity. */
        comment conditions /* Freshness threshold is 120 seconds for normal, emergency, powered recovery or unknown mode, and 600 seconds only for explicitly reported low energy without emergency or powered recovery. Staleness describes data age, not diagnosed link failure. Exercise a 24-hour outage and reconnection. */
    }
    requirement telemetryEquipment : TelemetryEquipment;
    dependency deriveTelemetryEquipment from telemetryEquipment to communications {
        metadata rationale : ModelingMetadata::Rationale { text = "TelemetryEquipment supports communications. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'C-102'> CommandIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall accept external commands only under the specified authentication, freshness and qualification rules. */
        comment conditions /* Exercise complete command receipt, authentication failure, replayed sequence numbers, age greater than 30 seconds, and external control during a qualifying attempt. */
    }
    requirement commandIntegrity : CommandIntegrity;
    dependency deriveCommandIntegrity from commandIntegrity to communications {
        metadata rationale : ModelingMetadata::Rationale { text = "CommandIntegrity supports communications. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'N-010'> GorgeEnvironment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall operate in the freshwater Columbia River reach between Bingen and Stevenson, including opposing wind/current, short chop, traffic and submerged vegetation. */
        comment conditions /* Gorge-specific parameter limits and applicable shared exposure requirements apply together. */
        comment notes /* The profile excludes dam transit, ice and surf-zone launch. */
    }
    requirement gorgeEnvironment : GorgeEnvironment;
    dependency deriveGorgeEnvironment from gorgeEnvironment to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "The Gorge mission sets the river environment; it does not impose the ocean profile. This is design motivation or an implementation choice, not a satisfaction implication."; }
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
        metadata rationale : ModelingMetadata::Rationale { text = "The Hawaii mission sets the ocean environment; this profile is not a Gorge acceptance prerequisite. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    requirement def <'N-011'> GorgeWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in 0–15 m/s mean true wind with 3-second gusts up to 20 m/s. */
        comment conditions /* Operational functions are defined by N-001. Mean wind uses a 10-minute average referenced to 10 m above water. */
        comment notes /* Wind tolerance does not guarantee upstream progress. */
    }
    requirement gorgeWind : GorgeWind;
    #derivation connection deriveGorgeWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "GorgeWind provides a separately verifiable criterion for gorgeEnvironment."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> gorgeWind;
    }

    requirement def <'N-012'> GorgeWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in significant wave heights up to 1.5 m, peak periods 1.5–5 s and individual waves up to 3 m. */
        comment conditions /* N-001 defines operational functions. Wave statistics use 20-minute records. */
    }
    requirement gorgeWaves : GorgeWaves;
    #derivation connection deriveGorgeWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "GorgeWaves provides a separately verifiable criterion for gorgeEnvironment."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> gorgeWaves;
    }

    requirement def <'N-013'> GorgeCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain navigation and control in currents from 0 to 1.5 m/s from any direction relative to wind and waves. */
        comment conditions /* Predicted boundary risk invokes S-002. */
        comment notes /* Current tolerance does not guarantee progress or station keeping; positive upstream speed is not required at every wind speed or heading. */
    }
    requirement gorgeCurrent : GorgeCurrent;
    #derivation connection deriveGorgeCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "GorgeCurrent provides a separately verifiable criterion for gorgeEnvironment."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> gorgeCurrent;
    }

    requirement def <'N-014'> GorgeSurvivalWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions through the course-derived recovery exposure in mean wind up to 25 m/s and 3-second gusts up to 35 m/s. */
        comment conditions /* Use N-001 survival outcomes and the operational wind reference convention. Selected-profile wave, current, temperature and humidity limits apply concurrently. BlueDogEnvironmentReview::RecoveryExposureHours includes casualty transit and declared pickup delay. */
    }
    requirement gorgeSurvivalWind : GorgeSurvivalWind;
    #derivation connection deriveGorgeSurvivalWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "GorgeSurvivalWind provides a separately verifiable criterion for gorgeEnvironment."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> gorgeSurvivalWind;
    }

    requirement def <'N-015'> GorgeSurvivalWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions through the course-derived recovery exposure in significant wave heights up to 2 m, peak periods 1.5–7 s and individual waves up to 4 m. */
        comment conditions /* N-001 defines survival outcomes. */
    }
    requirement gorgeSurvivalWaves : GorgeSurvivalWaves;
    #derivation connection deriveGorgeSurvivalWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "GorgeSurvivalWaves provides a separately verifiable criterion for gorgeEnvironment."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> gorgeSurvivalWaves;
    }

    requirement def <'N-021'> OceanWind {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in 3–15 m/s mean true wind with 3-second gusts up to 20 m/s. */
        comment conditions /* Operational functions are defined by N-001. Mean wind uses a 10-minute average referenced to 10 m above water. */
        comment notes /* Wind tolerance does not guarantee upstream progress. */
    }
    requirement oceanWind : OceanWind;
    #derivation connection deriveOceanWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "OceanWind provides a separately verifiable criterion for oceanEnvironment."; }
        end #original source ::> oceanEnvironment;
        end #derive target ::> oceanWind;
    }

    requirement def <'N-022'> OceanWaves {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain operational functions in significant wave heights up to 3 m, peak periods 5–20 s and individual waves up to 6 m. */
        comment conditions /* N-001 defines operational functions. Wave statistics use 20-minute records. */
    }
    requirement oceanWaves : OceanWaves;
    #derivation connection deriveOceanWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "OceanWaves provides a separately verifiable criterion for oceanEnvironment."; }
        end #original source ::> oceanEnvironment;
        end #derive target ::> oceanWaves;
    }

    requirement def <'N-023'> OceanCurrent {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain navigation and control in currents from 0 to 1.0 m/s from any direction relative to wind and waves. */
        comment conditions /* Predicted boundary risk invokes S-002. */
        comment notes /* Current tolerance does not guarantee progress or station keeping; positive upstream speed is not required at every wind speed or heading. */
    }
    requirement oceanCurrent : OceanCurrent;
    #derivation connection deriveOceanCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "OceanCurrent provides a separately verifiable criterion for oceanEnvironment."; }
        end #original source ::> oceanEnvironment;
        end #derive target ::> oceanCurrent;
    }

    requirement def <'N-024'> OceanSurvivalWind {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions for 24 continuous hours in mean wind up to 25 m/s and 3-second gusts up to 35 m/s. */
        comment conditions /* Use N-001 survival outcomes and the operational wind reference convention. Selected-profile wave, current, temperature and humidity limits apply concurrently. */
    }
    requirement oceanSurvivalWind : OceanSurvivalWind;
    #derivation connection deriveOceanSurvivalWind {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "OceanSurvivalWind provides a separately verifiable criterion for oceanEnvironment."; }
        end #original source ::> oceanEnvironment;
        end #derive target ::> oceanSurvivalWind;
    }

    requirement def <'N-025'> OceanSurvivalWaves {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain survival functions for 24 continuous hours in significant wave heights up to 6 m, peak periods 6–20 s and individual waves up to 12 m. */
        comment conditions /* N-001 defines survival outcomes. */
    }
    requirement oceanSurvivalWaves : OceanSurvivalWaves;
    #derivation connection deriveOceanSurvivalWaves {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "OceanSurvivalWaves provides a separately verifiable criterion for oceanEnvironment."; }
        end #original source ::> oceanEnvironment;
        end #derive target ::> oceanSurvivalWaves;
    }

    requirement def <'N-030'> AirTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain mode-appropriate functions at ambient air temperatures from 0 to 40 degC. */
        comment conditions /* N-001/N-035 define operational and survival functions. */
    }
    requirement airTemperature : AirTemperature;
    #derivation connection deriveAirTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "AirTemperature provides a separately verifiable criterion for environmentalEnvelope."; }
        end #original source ::> environmentalEnvelope;
        end #derive target ::> airTemperature;
    }

    requirement def <'N-031'> WaterTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Immersed hull, appendages and equipment shall retain mode-appropriate functions in water from 2 to 30 degC. */
        comment conditions /* N-001/N-035 define operational and survival functions. */
    }
    requirement waterTemperature : WaterTemperature;
    #derivation connection deriveWaterTemperature {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "WaterTemperature provides a separately verifiable criterion for environmentalEnvelope."; }
        end #original source ::> environmentalEnvelope;
        end #derive target ::> waterTemperature;
    }

    requirement def <'N-032'> Humidity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Installed equipment shall retain operational functions at 0–100 percent relative humidity, including condensation. */
    }
    requirement humidity : Humidity;
    #derivation connection deriveHumidity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Humidity provides a separately verifiable criterion for environmentalEnvelope."; }
        end #original source ::> environmentalEnvelope;
        end #derive target ::> humidity;
    }

    requirement def <'N-033'> Visibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall provide mode-appropriate navigation and traffic response across the specified visibility conditions. */
        comment conditions /* Exercise daylight and darkness at meteorological visibility of at least 1 km, and detected visibility below 1 km. Apply current BlueDogClassDetection class-specific or conservative plausible-class envelopes and the S-001 reviewed observation and response criteria.*/
    }
    requirement visibility : Visibility;
    #derivation connection deriveVisibility {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Visibility provides a separately verifiable criterion for environmentalEnvelope."; }
        end #original source ::> environmentalEnvelope;
        end #derive target ::> visibility;
    }

    requirement def <'N-034'> CalmOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While waiting in mean wind below 3 m/s, the vessel shall preserve the course-derived recovery reserve. */
        comment conditions /* Calm-mode functions are navigation, recording and autonomous boundary/traffic contingency. Waiting may continue only while forecast coverage, traffic/boundary safety and measured calm-mode loads preserve route-dependent recovery authority; no fixed waiting endurance is imposed. Autonomous safety recovery first terminates qualification under GorgeChallenge::safetyCapabilityAbort, then may enable the motor under R-004. */
        comment notes /* Neither progress nor station keeping is required. */
    }
    requirement calmOperation : CalmOperation;
    #derivation connection deriveCalmOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "CalmOperation provides a separately verifiable criterion for environmentalEnvelope."; }
        end #original source ::> environmentalEnvelope;
        end #derive target ::> calmOperation;
    }

    requirement def <'N-035'> EnvelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall select survival or sailing operation according to the defined environmental transition conditions. */
        comment conditions /* The trigger is a detected upper operational wind or wave limit exceedance for the selected profile; calm invokes N-034. Resumption eligibility requires 10 continuous minutes inside the selected wind/wave limits, valid navigation, upright control, preserved required safety capability and no low-energy, emergency-recovery or isolation restriction. Resuming a control mode never clears a disqualified attempt. */
    }
    requirement envelopeTransition : EnvelopeTransition;
    #derivation connection deriveEnvelopeTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "EnvelopeTransition provides a separately verifiable criterion for environmentalEnvelope."; }
        end #original source ::> environmentalEnvelope;
        end #derive target ::> envelopeTransition;
    }

    requirement def <'N-041'> FreshwaterExposure {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* For Gorge qualification, following continuous freshwater exposure for the full declared mission history, with submerged parts continuously wet and complete topside spray wetting at least once per hour, the vessel shall pass its Gorge functional checks without repair or servicing. */
    }
    requirement freshwaterExposure : FreshwaterExposure;
    #derivation connection deriveFreshwaterExposure {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "FreshwaterExposure provides a separately verifiable criterion for marineDurability."; }
        end #original source ::> marineDurability;
        end #derive target ::> freshwaterExposure;
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
    #derivation connection deriveEnclosureSealing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "EnclosureSealing provides a separately verifiable criterion for marineDurability."; }
        end #original source ::> marineDurability;
        end #derive target ::> enclosureSealing;
    }

    requirement def <'N-044'> WetMechanicalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* External mechanisms and structural joints shall retain integrity after the selected wet-exposure campaign. */
        comment conditions /* Evaluate after each selected profile wet-exposure campaign under N-002. */
    }
    requirement wetMechanicalIntegrity : WetMechanicalIntegrity;
    #derivation connection deriveWetMechanicalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "WetMechanicalIntegrity provides a separately verifiable criterion for marineDurability."; }
        end #original source ::> marineDurability;
        end #derive target ::> wetMechanicalIntegrity;
    }

    requirement def <'N-045'> WetElectricalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Cable assemblies shall retain electrical integrity after the selected wet-exposure campaign. */
        comment conditions /* Evaluate disconnected cable assemblies after each selected profile wet-exposure campaign under N-002; disconnect electronics for insulation measurement. */
    }
    requirement wetElectricalIntegrity : WetElectricalIntegrity;
    #derivation connection deriveWetElectricalIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "WetElectricalIntegrity provides a separately verifiable criterion for marineDurability."; }
        end #original source ::> marineDurability;
        end #derive target ::> wetElectricalIntegrity;
    }

    requirement def <'N-046'> SolarHeating {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain safe powered operation during the specified solar-heating exposure. */
        comment conditions /* Expose the powered vessel to 40 degC ambient air and 1000 W/m2 incident solar irradiance for 8 hours; use the installed battery manufacturer temperature limits. */
    }
    requirement solarHeating : SolarHeating;
    #derivation connection deriveSolarHeating {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "SolarHeating provides a separately verifiable criterion for marineDurability."; }
        end #original source ::> marineDurability;
        end #derive target ::> solarHeating;
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
    #derivation connection derivePrintedMaterialAging {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "PrintedMaterialAging provides a separately verifiable criterion for marineDurability."; }
        end #original source ::> marineDurability;
        end #derive target ::> printedMaterialAging;
    }

    requirement def <'N-051'> SelfRighting {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall recover from the specified capsize releases without external assistance or motor thrust. */
        comment conditions /* Apply to the selected passive-righting concept, not every challenge-compliant vessel. Use minimum and maximum mission loading, five releases at each angle of 90 and 180 degrees toward each side, without external action or motor thrust. Use freshwater for Gorge or 35 g/kg saltwater for ocean; dual qualification requires both media. All leaves apply to every release. */
    }
    requirement selfRighting : SelfRighting;
    dependency selectedRightingStrategy from selfRighting to stabilityAndFouling {
        metadata rationale : ModelingMetadata::Rationale { text = "Passive self-righting is the current monohull design strategy, not entailed by the challenge. C-018 also permits demonstrated limp recovery after abort; an alternative concept may meet that obligation without self-righting."; }
    }

    requirement def <'N-052'> CapsizeControlRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall restore mode-appropriate control after each specified capsize release. */
        comment conditions /* Apply to every N-051 release without operator input. Mode-appropriate control does not mean normal sailing before the N-035 resumption gate permits it. */
    }
    requirement capsizeControlRecovery : CapsizeControlRecovery;
    dependency deriveCapsizeControlRecovery from capsizeControlRecovery to stabilityAndFouling {
        metadata rationale : ModelingMetadata::Rationale { text = "Upright control restoration is an obligation of the selected passive-righting strategy. Alternative challenge concepts may provide post-abort limp recovery without this strategy."; }
    }

    requirement def <'N-053'> SubmergedWeedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall tolerate submerged milfoil-like vegetation during the specified unassisted Gorge sailing passes. */
        comment conditions /* Gorge campaign: five consecutive sailing passes without manual clearing or motor use through a 5 m by 1 m patch of 20 flexible branched stems per square metre, each 0.5-1.0 m long, extending from below the deepest appendage to within 0.1 m of the surface. Use 5 m/s mean wind and the weed-free reference heading. Record material, branch geometry, wet bending stiffness and anchoring. */
        metadata issue : ModelingMetadata::Issue { text = "Equivalence of the vegetation surrogate to local milfoil requires physical-test validation."; }
    }
    requirement submergedWeedPassage : SubmergedWeedPassage;
    #derivation connection deriveSubmergedWeedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "SubmergedWeedPassage provides a separately verifiable criterion for stabilityAndFouling."; }
        end #original source ::> stabilityAndFouling;
        end #derive target ::> submergedWeedPassage;
    }

    requirement def <'N-054'> WeedSnagShedding {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall recover sailing performance after the specified appendage weed snags without assistance or motor use. */
        comment conditions /* Gorge campaign: drape one wet 1 m branched stem over one appendage leading edge at a time, five repetitions per appendage, with N-053 surrogate characteristics, 5 m/s mean wind and the unobstructed reference heading. No manual assistance or motor use. Both leaf criteria apply to every repetition; visible stem removal alone is insufficient. */
    }
    requirement weedSnagShedding : WeedSnagShedding;
    #derivation connection deriveWeedSnagShedding {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "WeedSnagShedding provides a separately verifiable criterion for stabilityAndFouling."; }
        end #original source ::> stabilityAndFouling;
        end #derive target ::> weedSnagShedding;
    }

    requirement def <'N-055'> WeedBlockageResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter autonomous fouling contingency when the defined weed-blockage trigger occurs. */
        comment conditions /* Gorge trigger: vegetation prevents completion of commanded rudder motion for 5 seconds, or keeps water-relative speed below 25 percent of the preceding weed-free 60-second mean for 60 seconds with mean wind at least 3 m/s. Dense mats are a blockage/avoidance case, not a pass-through claim. */
    }
    requirement weedBlockageResponse : WeedBlockageResponse;
    #derivation connection deriveWeedBlockageResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "WeedBlockageResponse provides a separately verifiable criterion for stabilityAndFouling."; }
        end #original source ::> stabilityAndFouling;
        end #derive target ::> weedBlockageResponse;
    }

    requirement def <'N-056'> RecoveryPropulsorWeeds {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The recovery propulsion system shall tolerate the specified weed encounters within its rated electrical and thermal limits. */
        comment conditions /* Use a separately designated Gorge powered-recovery test with five passes through the N-053 patch without manual propulsor clearing, on the weed-free powered reference heading. Exercise locked propulsor separately. */
    }
    requirement recoveryPropulsorWeeds : RecoveryPropulsorWeeds;
    #derivation connection deriveRecoveryPropulsorWeeds {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "RecoveryPropulsorWeeds provides a separately verifiable criterion for stabilityAndFouling."; }
        end #original source ::> stabilityAndFouling;
        end #derive target ::> recoveryPropulsorWeeds;
    }
    dependency motorWeedTolerance from recoveryPropulsorWeeds to recoveryPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "The recovery propulsor must remain usable in the vegetation encountered by the sailing vessel. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    requirement def <'E-008'> NavigationAvailability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall maintain valid navigation inputs and reject stale observations. */
        comment conditions /* Campaigns use 1800 scheduled one-second epochs in 30 minutes, with missing/invalid epochs counted as failures. Fault injection is separate. */
    }
    requirement navigationAvailability : NavigationAvailability;
    requirement def <'R-003'> LaunchEnergyAdmission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Mission start shall remain inhibited unless a valid usable-energy estimate no older than 1 second strictly exceeds a valid R-002 protected reserve. */
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
        doc /* The vessel shall prevent motor propulsion from qualifying as unassisted sailing. */
        comment conditions /* Exercise qualifying, nonqualifying and unknown qualification states, restart, link loss, power loss during transitions and conflicting/stale commands. Shared qualification persistence applies before enabling intervention. */
    }
    requirement challengeMotorInhibition : ChallengeMotorInhibition;
    #derivation connection auditDerivation1 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "NavigationAvailability isolates a separately verifiable consequence of navigationAndControl."; }
        end #original source ::> navigationAndControl;
        end #derive target ::> navigationAvailability;
    }
    dependency auditDerivation2 from launchEnergyAdmission to recoveryEnergy {
        metadata rationale : ModelingMetadata::Rationale { text = "The selected launch gate consumes the route-dependent reserve calculation. A changed reserve or validity rule requires admission review; the reserve magnitude alone does not define launch behavior."; }
    }
    dependency auditDerivation3 from challengeMotorInhibition to GorgeChallenge::sailingPropulsion {
        metadata rationale : ModelingMetadata::Rationale { text = "The onboard interlock is the selected enforcement of sail-only qualification. The challenge rule governs the attempt outcome without mandating this particular interlock design."; }
    }
    dependency auditDerivation4 from challengeMotorInhibition to GorgeChallenge::unassistedAttempt {
        metadata rationale : ModelingMetadata::Rationale { text = "No-intervention qualification must survive resets and motor-mode transitions. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency auditDerivation5 from commandIntegrity to GorgeChallenge::unassistedAttempt {
        metadata rationale : ModelingMetadata::Rationale { text = "Accepted external control changes the attempt qualification; communications alone does not supply this rule. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency auditDerivation6 from commandIntegrity to GorgeChallenge::emergencyIntervention {
        metadata rationale : ModelingMetadata::Rationale { text = "The emergency control channel needs authenticated, fresh commands and persistent qualification changes. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    #derivation connection auditDerivation10 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "The river profile supplies the freshwater exposure medium."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> freshwaterExposure;
    }
    #derivation connection auditDerivation11 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "The ocean profile supplies the saltwater exposure medium."; }
        end #original source ::> oceanEnvironment;
        end #derive target ::> saltwaterExposure;
    }
    #derivation connection auditDerivation12 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "David identified Columbia River milfoil as a Gorge design condition."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> submergedWeedPassage;
    }
    #derivation connection auditDerivation13 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Appendage snags are a consequence of the Gorge submerged-vegetation exposure."; }
        end #original source ::> gorgeEnvironment;
        end #derive target ::> weedSnagShedding;
    }

    // Independently verifiable acceptance leaves.
    requirement def <'E-101'> EnergyEstimateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall refresh usable battery-energy estimates at least once per second. */
    }
    requirement energyEstimateCadence : EnergyEstimateCadence;

    #derivation connection decomposeEnergyEstimateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-001; the parent supplies shared verification conditions."; }
        end #original source ::> energyAwareness;
        end #derive target ::> energyEstimateCadence;
    }

    requirement def <'E-102'> ReserveEstimateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall refresh protected recovery-reserve estimates at least once per second. */
    }
    requirement reserveEstimateCadence : ReserveEstimateCadence;

    #derivation connection decomposeReserveEstimateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-001; the parent supplies shared verification conditions."; }
        end #original source ::> energyAwareness;
        end #derive target ::> reserveEstimateCadence;
    }

    requirement def <'E-103'> EnergyEstimateAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Usable-energy estimation error shall not exceed 10 percent of measured usable full-charge energy relative to calibrated charge/discharge integration across operating battery temperatures. */
    }
    requirement energyEstimateAccuracy : EnergyEstimateAccuracy;

    #derivation connection decomposeEnergyEstimateAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-001; the parent supplies shared verification conditions."; }
        end #original source ::> energyAwareness;
        end #derive target ::> energyEstimateAccuracy;
    }

    requirement def <'E-104'> ConservativeEnergyEstimate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The usable-energy input to admission and low-energy decisions shall equal estimated usable energy minus the EnergyEstimateAccuracy error allowance. */
    }
    requirement conservativeEnergyEstimate : ConservativeEnergyEstimate;

    #derivation connection decomposeConservativeEnergyEstimate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-001; the parent supplies shared verification conditions."; }
        end #original source ::> energyAwareness;
        end #derive target ::> conservativeEnergyEstimate;
    }

    requirement def <'E-105'> GuidanceUpdateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During operational qualification, mission guidance shall update at least once per second. */
    }
    requirement guidanceUpdateCadence : GuidanceUpdateCadence;

    #derivation connection decomposeGuidanceUpdateCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-002; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAndControl;
        end #derive target ::> guidanceUpdateCadence;
    }

    requirement def <'E-106'> SailCommandCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During operational qualification, commanded sail position shall update at least once per second. */
    }
    requirement sailCommandCadence : SailCommandCadence;

    #derivation connection decomposeSailCommandCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-002; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAndControl;
        end #derive target ::> sailCommandCadence;
    }

    requirement def <'E-107'> SteeringCommandCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During operational qualification, commanded steering position shall update at least once per second. */
    }
    requirement steeringCommandCadence : SteeringCommandCadence;

    #derivation connection decomposeSteeringCommandCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-002; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAndControl;
        end #derive target ::> steeringCommandCadence;
    }

    requirement def <'E-108'> PositionAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* At every epoch in the common E-002 acceptance set, valid position error shall be at most 10 m against an independent reference. */
    }
    requirement positionAccuracy : PositionAccuracy;

    #derivation connection decomposePositionAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-002; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAndControl;
        end #derive target ::> positionAccuracy;
    }

    requirement def <'E-109'> HeadingAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* At every epoch in the common E-002 acceptance set, valid heading error shall be at most 10 degrees against an independent reference. */
    }
    requirement headingAccuracy : HeadingAccuracy;

    #derivation connection decomposeHeadingAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-002; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAndControl;
        end #derive target ::> headingAccuracy;
    }

    requirement def <'E-110'> RestartDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After a watchdog reset under E-003 preconditions, the vessel shall restore mode-appropriate autonomous control within 30 seconds. */
        attribute measuredRestartTime : TimeValue;
        require constraint restartDeadline {
            measuredRestartTime >= 0 [s] and measuredRestartTime <= 30 [s]
        }
    }
    requirement restartDeadline : RestartDeadline;

    #derivation connection decomposeRestartDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-003; the parent supplies shared verification conditions."; }
        end #original source ::> resetRecovery;
        end #derive target ::> restartDeadline;
    }

    requirement def <'E-111'> MissionStateRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 30 seconds after a watchdog reset under E-003 preconditions, the restored mission-mode record shall equal the last persisted mode. */
        comment conditions /* Restoring recorded mission intent does not command that operating mode. Current safety, capsize, energy, recovery and isolation restrictions govern actual operation under E-113 and N-035. */
    }
    requirement missionStateRestoration : MissionStateRestoration;

    #derivation connection decomposeMissionStateRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-003; the parent supplies shared verification conditions."; }
        end #original source ::> resetRecovery;
        end #derive target ::> missionStateRestoration;
    }

    requirement def <'E-112'> GateProgressRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 30 seconds after a watchdog reset under E-003 preconditions, restored gate progress shall equal the last persisted gate progress. */
    }
    requirement gateProgressRestoration : GateProgressRestoration;

    #derivation connection decomposeGateProgressRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-003; the parent supplies shared verification conditions."; }
        end #original source ::> resetRecovery;
        end #derive target ::> gateProgressRestoration;
    }

    requirement def <'E-113'> ResetRestrictionPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After watchdog reset, each active survival, low-energy, recovery and isolation restriction shall remain effective until its own release condition is met. */
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
    }
    requirement lowEnergyEntry : LowEnergyEntry;

    #derivation connection decomposeLowEnergyEntry {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-004; the parent supplies shared verification conditions."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> lowEnergyEntry;
    }

    requirement def <'E-115'> LowEnergyPayloadInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While the low-energy flag is set, the optional observation payload shall be disabled. */
    }
    requirement lowEnergyPayloadInhibition : LowEnergyPayloadInhibition;

    #derivation connection decomposeLowEnergyPayloadInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-004; the parent supplies shared verification conditions."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> lowEnergyPayloadInhibition;
    }

    requirement def <'E-116'> LowEnergyNavigationContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While the low-energy flag is set, autonomous navigation shall remain active. */
    }
    requirement lowEnergyNavigationContinuity : LowEnergyNavigationContinuity;

    #derivation connection decomposeLowEnergyNavigationContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-004; the parent supplies shared verification conditions."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> lowEnergyNavigationContinuity;
    }

    requirement def <'E-117'> LowEnergyCollisionContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* While the low-energy flag is set, collision-response behavior shall remain active. */
    }
    requirement lowEnergyCollisionContinuity : LowEnergyCollisionContinuity;

    #derivation connection decomposeLowEnergyCollisionContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-004; the parent supplies shared verification conditions."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> lowEnergyCollisionContinuity;
    }

    requirement def <'E-118'> LowEnergyExit {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After conservative usable energy exceeds 1.2 times protected reserve for 10 continuous minutes, the vessel shall clear the low-energy flag independently of survival/recovery flags. */
    }
    requirement lowEnergyExit : LowEnergyExit;

    #derivation connection decomposeLowEnergyExit {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-004; the parent supplies shared verification conditions."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> lowEnergyExit;
    }

    requirement def <'E-119'> PayloadRestartPermission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Payload operation shall remain inhibited whenever a low-energy, survival or recovery restriction is active. */
    }
    requirement payloadRestartPermission : PayloadRestartPermission;

    #derivation connection decomposePayloadRestartPermission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-004; the parent supplies shared verification conditions."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> payloadRestartPermission;
    }

    requirement def <'E-120'> TelemetryDeliveryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* With a functioning link, current position, operating mode and health telemetry delivery intervals shall not exceed 30 seconds. */
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
    }
    requirement outageAutonomy : OutageAutonomy;

    #derivation connection decomposeOutageAutonomy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-005; the parent supplies shared verification conditions."; }
        end #original source ::> communications;
        end #derive target ::> outageAutonomy;
    }

    requirement def <'E-122'> ReconnectCurrentRecord {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After link restoration, a current telemetry record shall arrive within the active TelemetryDeliveryCadence interval. */
    }
    requirement reconnectCurrentRecord : ReconnectCurrentRecord;

    #derivation connection decomposeReconnectCurrentRecord {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-005; the parent supplies shared verification conditions."; }
        end #original source ::> communications;
        end #derive target ::> reconnectCurrentRecord;
    }

    requirement def <'E-123'> BacklogOrdering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After reconnection, retained backlog records shall be transmitted in ascending acquisition sequence order. */
    }
    requirement backlogOrdering : BacklogOrdering;

    #derivation connection decomposeBacklogOrdering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-005; the parent supplies shared verification conditions."; }
        end #original source ::> communications;
        end #derive target ::> backlogOrdering;
    }

    requirement def <'E-124'> BacklogCurrentPriority {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During backlog transfer, current telemetry shall continue to meet TelemetryDeliveryCadence. */
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
    }
    requirement ingressDetection : IngressDetection;

    #derivation connection decomposeIngressDetection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-006; the parent supplies shared verification conditions."; }
        end #original source ::> ingressResponse;
        end #derive target ::> ingressDetection;
    }

    requirement def <'E-126'> IngressRecoveryRequest {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 test, ingress detection shall set the recovery-request state. */
    }
    requirement ingressRecoveryRequest : IngressRecoveryRequest;

    #derivation connection decomposeIngressRecoveryRequest {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-006; the parent supplies shared verification conditions."; }
        end #original source ::> ingressResponse;
        end #derive target ::> ingressRecoveryRequest;
    }

    requirement def <'E-127'> IngressFlotation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 test, the vessel shall remain afloat for the full 30 minutes. */
    }
    requirement ingressFlotation : IngressFlotation;

    #derivation connection decomposeIngressFlotation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-006; the parent supplies shared verification conditions."; }
        end #original source ::> ingressResponse;
        end #derive target ::> ingressFlotation;
    }

    requirement def <'E-128'> IngressElectronicsProtection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After the E-006 test, enclosed-electronics water-sensitive indicators shall show no liquid ingress. */
    }
    requirement ingressElectronicsProtection : IngressElectronicsProtection;

    #derivation connection decomposeIngressElectronicsProtection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-006; the parent supplies shared verification conditions."; }
        end #original source ::> ingressResponse;
        end #derive target ::> ingressElectronicsProtection;
    }

    requirement def <'E-129'> IngressPositionContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Throughout the E-006 test with a functioning link, position reporting shall meet the active TelemetryDeliveryCadence. */
    }
    requirement ingressPositionContinuity : IngressPositionContinuity;

    #derivation connection decomposeIngressPositionContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-006; the parent supplies shared verification conditions."; }
        end #original source ::> ingressResponse;
        end #derive target ::> ingressPositionContinuity;
    }

    requirement def <'E-130'> PeriodicLogCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Periodic mission records shall be acquired at least once per second normally and once per minute in low-energy or survival operation. */
    }
    requirement periodicLogCadence : PeriodicLogCadence;

    #derivation connection decomposePeriodicLogCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> periodicLogCadence;
    }

    requirement def <'E-131'> LogRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Acquired mission records shall remain retrievable onboard for at least 30 days. */
    }
    requirement logRetention : LogRetention;

    #derivation connection decomposeLogRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> logRetention;
    }

    requirement def <'E-132'> CriticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every external-command disposition, reset, motor-enable transition, ingress detection, recovery request, navigation-degraded transition, low-energy flag transition and qualification change shall have an event record regardless of periodic cadence. */
    }
    requirement criticalEventRecording : CriticalEventRecording;

    #derivation connection decomposeCriticalEventRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> criticalEventRecording;
    }

    requirement def <'E-133'> LogTimestampAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* With valid GNSS time, mission-record timestamps shall differ from reference UTC by at most 1 second. */
    }
    requirement logTimestampAccuracy : LogTimestampAccuracy;

    #derivation connection decomposeLogTimestampAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> logTimestampAccuracy;
    }

    requirement def <'E-134'> InvalidTimestampMarking {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each record acquired without valid time shall carry an invalid-time indication. */
    }
    requirement invalidTimestampMarking : InvalidTimestampMarking;

    #derivation connection decomposeInvalidTimestampMarking {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> invalidTimestampMarking;
    }

    requirement def <'E-135'> LogGapIndication {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each detected missing sequence of scheduled records shall have a gap indication in retrieved data. */
    }
    requirement logGapIndication : LogGapIndication;

    #derivation connection decomposeLogGapIndication {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> logGapIndication;
    }

    requirement def <'E-136'> LogInterruptionDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After watchdog reset or abrupt power removal, every record older than 5 seconds before interruption shall remain readable. */
    }
    requirement logInterruptionDurability : LogInterruptionDurability;

    #derivation connection decomposeLogInterruptionDurability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> logInterruptionDurability;
    }

    requirement def <'E-137'> ReconnectLogPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Communication reconnection shall not delete retained mission records. */
    }
    requirement reconnectLogPreservation : ReconnectLogPreservation;

    #derivation connection decomposeReconnectLogPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> reconnectLogPreservation;
    }

    requirement def <'E-138'> QualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each disqualifying transition shall be durably stored before its associated commanded intervention or motor enable. */
    }
    requirement qualificationPersistence : QualificationPersistence;

    #derivation connection decomposeQualificationPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> qualificationPersistence;
    }

    requirement def <'E-139'> UnknownQualificationFallback {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* On restart with absent or inconsistent persisted qualification state, the vessel shall adopt nonqualifying status. */
    }
    requirement unknownQualificationFallback : UnknownQualificationFallback;

    #derivation connection decomposeUnknownQualificationFallback {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-007; the parent supplies shared verification conditions."; }
        end #original source ::> missionEvidence;
        end #derive target ::> unknownQualificationFallback;
    }

    requirement def <'E-140'> NavigationValidEpochs {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In each E-008 campaign, at least 1710 of 1800 scheduled epochs shall contain valid position and heading observations. */
        attribute validEpochs : Integer;
        require constraint availabilityFraction {
            validEpochs >= 1710 and validEpochs <= 1800
        }
    }
    requirement navigationValidEpochs : NavigationValidEpochs;

    #derivation connection decomposeNavigationValidEpochs {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-008; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAvailability;
        end #derive target ::> navigationValidEpochs;
    }

    requirement def <'E-141'> StaleNavigationInvalidation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Navigation observations older than 5 seconds shall be marked invalid. */
    }
    requirement staleNavigationInvalidation : StaleNavigationInvalidation;

    #derivation connection decomposeStaleNavigationInvalidation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-008; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAvailability;
        end #derive target ::> staleNavigationInvalidation;
    }

    requirement def <'E-142'> NavigationDegradedTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* When position or heading becomes invalid due to age, the vessel shall enter navigation-degraded state within 1 second. */
    }
    requirement navigationDegradedTransition : NavigationDegradedTransition;

    #derivation connection decomposeNavigationDegradedTransition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-008; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAvailability;
        end #derive target ::> navigationDegradedTransition;
    }

    requirement def <'E-143'> StaleNavigationUseInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The controller shall not use observations marked invalid as current navigation inputs. */
    }
    requirement staleNavigationUseInhibition : StaleNavigationUseInhibition;

    #derivation connection decomposeStaleNavigationUseInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-008; the parent supplies shared verification conditions."; }
        end #original source ::> navigationAvailability;
        end #derive target ::> staleNavigationUseInhibition;
    }

    requirement def <'P-101'> SoloTransport {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* One adult shall move all mission equipment 100 m without assistance. */
    }
    requirement soloTransport : SoloTransport;

    #derivation connection decomposeSoloTransport {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-001; the parent supplies shared verification conditions."; }
        end #original source ::> transportability;
        end #derive target ::> soloTransport;
    }

    requirement def <'P-102'> LiftMass {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each separately lifted assembly shall have a mass no greater than 15 kg. */
    }
    requirement liftMass : LiftMass;

    #derivation connection decomposeLiftMass {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-001; the parent supplies shared verification conditions."; }
        end #original source ::> transportability;
        end #derive target ::> liftMass;
    }

    requirement def <'P-103'> SetupDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* One adult shall assemble the vessel from its transport configuration within 30 minutes. */
    }
    requirement setupDuration : SetupDuration;

    #derivation connection decomposeSetupDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-001; the parent supplies shared verification conditions."; }
        end #original source ::> transportability;
        end #derive target ::> setupDuration;
    }

    requirement def <'P-104'> PackDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* One adult shall pack the vessel into its transport configuration within 30 minutes. */
    }
    requirement packDuration : PackDuration;

    #derivation connection decomposePackDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-001; the parent supplies shared verification conditions."; }
        end #original source ::> transportability;
        end #derive target ::> packDuration;
    }

    requirement def <'P-105'> SoloLaunch {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* One adult shall launch the assembled vessel without assistance. */
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
        doc /* One adult shall retrieve the vessel from the water without assistance. */
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
    }
    requirement replacementDuration : ReplacementDuration;

    #derivation connection decomposeReplacementDuration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-003; the parent supplies shared verification conditions."; }
        end #original source ::> serviceability;
        end #derive target ::> replacementDuration;
    }

    requirement def <'P-108'> NondestructiveService {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each P-003 replacement shall leave bonded structural joints and adjacent parts intact. */
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
    }
    requirement postServiceSealing : PostServiceSealing;

    #derivation connection decomposePostServiceSealing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-003; the parent supplies shared verification conditions."; }
        end #original source ::> serviceability;
        end #derive target ::> postServiceSealing;
    }

    requirement def <'P-110'> PostServiceActuation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each P-003 replacement, affected actuators shall complete their full commanded travel. */
    }
    requirement postServiceActuation : PostServiceActuation;

    #derivation connection decomposePostServiceActuation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of P-003; the parent supplies shared verification conditions."; }
        end #original source ::> serviceability;
        end #derive target ::> postServiceActuation;
    }

    requirement def <'S-101'> TrafficTracking {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall acquire and maintain encounter tracks with the reviewed class- and condition-specific timely acquisition and continuity performance required by S-001.*/
        comment conditions /* Each admitted target class remains in scope. Before reliable classification, apply the reviewed conservative envelope spanning plausible classes and occupant transitions. */
    }
    requirement trafficTracking : TrafficTracking;

    #derivation connection decomposeTrafficTracking {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-001; the parent supplies shared verification conditions."; }
        end #original source ::> trafficSafety;
        end #derive target ::> trafficTracking;
    }

    requirement def <'S-102'> CollisionAssessmentCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall update collision-risk estimates at least once per second. */
    }
    requirement collisionAssessmentCadence : CollisionAssessmentCadence;

    #derivation connection decomposeCollisionAssessmentCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-001; the parent supplies shared verification conditions."; }
        end #original source ::> trafficSafety;
        end #derive target ::> collisionAssessmentCadence;
    }

    requirement def <'S-103'> AvoidanceCommandDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall issue the prescribed avoiding-action command within 2 seconds of each S-001 collision-risk trigger. */
    }
    requirement avoidanceCommandDeadline : AvoidanceCommandDeadline;

    #derivation connection decomposeAvoidanceCommandDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-001; the parent supplies shared verification conditions."; }
        end #original source ::> trafficSafety;
        end #derive target ::> avoidanceCommandDeadline;
    }

    requirement def <'S-104'> TrafficAwarenessFault {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After traffic assessment has been invalid for more than 5 seconds, the vessel shall log a traffic-awareness fault within 1 second. */
    }
    requirement trafficAwarenessFault : TrafficAwarenessFault;

    #derivation connection decomposeTrafficAwarenessFault {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-001; the parent supplies shared verification conditions."; }
        end #original source ::> trafficSafety;
        end #derive target ::> trafficAwarenessFault;
    }

    requirement def <'S-105'> BoundaryEvaluationCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall evaluate its current position and predicted trajectory against the S-002 polygons at least once per second. */
    }
    requirement boundaryEvaluationCadence : BoundaryEvaluationCadence;

    #derivation connection decomposeBoundaryEvaluationCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-002; the parent supplies shared verification conditions."; }
        end #original source ::> operatingBoundary;
        end #derive target ::> boundaryEvaluationCadence;
    }

    requirement def <'S-106'> BoundaryAvoidanceDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall issue an avoidance command within 2 seconds of predicting a boundary crossing. */
    }
    requirement boundaryAvoidanceDeadline : BoundaryAvoidanceDeadline;

    #derivation connection decomposeBoundaryAvoidanceDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-002; the parent supplies shared verification conditions."; }
        end #original source ::> operatingBoundary;
        end #derive target ::> boundaryAvoidanceDeadline;
    }

    requirement def <'S-107'> BoundaryAvoidanceRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every boundary-avoidance command shall have a corresponding event record. */
    }
    requirement boundaryAvoidanceRecording : BoundaryAvoidanceRecording;

    #derivation connection decomposeBoundaryAvoidanceRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-002; the parent supplies shared verification conditions."; }
        end #original source ::> operatingBoundary;
        end #derive target ::> boundaryAvoidanceRecording;
    }

    requirement def <'S-108'> BoundaryStartInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Missing or geometrically invalid boundaries shall inhibit mission start. */
    }
    requirement boundaryStartInhibition : BoundaryStartInhibition;

    #derivation connection decomposeBoundaryStartInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-002; the parent supplies shared verification conditions."; }
        end #original source ::> operatingBoundary;
        end #derive target ::> boundaryStartInhibition;
    }

    requirement def <'S-109'> BoundaryDegradedEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Navigation loss or absence of a feasible maneuver shall produce an explicit degraded-route verdict instead of a safe-route verdict. */
    }
    requirement boundaryDegradedEvidence : BoundaryDegradedEvidence;

    #derivation connection decomposeBoundaryDegradedEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-002; the parent supplies shared verification conditions."; }
        end #original source ::> operatingBoundary;
        end #derive target ::> boundaryDegradedEvidence;
    }

    requirement def <'S-110'> AbortLatchDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After accepting emergency abort, the vessel shall latch the attempt as disqualified within 1 second. */
    }
    requirement abortLatchDeadline : AbortLatchDeadline;

    #derivation connection decomposeAbortLatchDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-003; the parent supplies shared verification conditions."; }
        end #original source ::> safeRecovery;
        end #derive target ::> abortLatchDeadline;
    }

    requirement def <'S-111'> RecoveryTelemetryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During active emergency or powered recovery with a functioning link, the vessel shall deliver position telemetry at least once per 30 seconds, including low-energy operation. */
    }
    requirement recoveryTelemetryCadence : RecoveryTelemetryCadence;

    #derivation connection decomposeRecoveryTelemetryCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-003; the parent supplies shared verification conditions."; }
        end #original source ::> safeRecovery;
        end #derive target ::> recoveryTelemetryCadence;
    }

    requirement def <'S-112'> MotorIsolationDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A physically accessible local isolation control shall remove motor power within 1 second of activation. */
    }
    requirement motorIsolationDeadline : MotorIsolationDeadline;

    #derivation connection decomposeMotorIsolationDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-003; the parent supplies shared verification conditions."; }
        end #original source ::> safeRecovery;
        end #derive target ::> motorIsolationDeadline;
    }

    requirement def <'S-113'> IsolationRestartInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Motor restart shall remain inhibited after local isolation until deliberate local reset. */
    }
    requirement isolationRestartInhibition : IsolationRestartInhibition;

    #derivation connection decomposeIsolationRestartInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-003; the parent supplies shared verification conditions."; }
        end #original source ::> safeRecovery;
        end #derive target ::> isolationRestartInhibition;
    }

    requirement def <'S-114'> ManualControlLossShutdown {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After remote control has been lost for 5 seconds during manual powered recovery, the vessel shall command zero thrust within a further 1 second. */
    }
    requirement manualControlLossShutdown : ManualControlLossShutdown;

    #derivation connection decomposeManualControlLossShutdown {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-003; the parent supplies shared verification conditions."; }
        end #original source ::> safeRecovery;
        end #derive target ::> manualControlLossShutdown;
    }

    requirement def <'S-115'> ControlLossLocationContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Location reporting shall continue at the active telemetry cadence after remote-control loss whenever a telemetry link is available. */
    }
    requirement controlLossLocationContinuity : ControlLossLocationContinuity;

    #derivation connection decomposeControlLossLocationContinuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-003; the parent supplies shared verification conditions."; }
        end #original source ::> safeRecovery;
        end #derive target ::> controlLossLocationContinuity;
    }

    requirement def <'S-116'> NavigationLightPresentation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present the lights prescribed for its current mode by the S-004 compliance matrix without a person aboard. */
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
    }
    requirement signalingModeDeadline : SignalingModeDeadline;

    #derivation connection decomposeSignalingModeDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-004; the parent supplies shared verification conditions."; }
        end #original source ::> navigationConspicuity;
        end #derive target ::> signalingModeDeadline;
    }

    requirement def <'S-120'> SignalingFaultRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each detectable signaling failure shall be logged within 5 seconds of detection. */
    }
    requirement signalingFaultRecording : SignalingFaultRecording;

    #derivation connection decomposeSignalingFaultRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-004; the parent supplies shared verification conditions."; }
        end #original source ::> navigationConspicuity;
        end #derive target ::> signalingFaultRecording;
    }

    requirement def <'S-121'> SignalingFaultReporting {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* With a functioning link, each detected signaling failure shall be reported to shore within 5 seconds. */
    }
    requirement signalingFaultReporting : SignalingFaultReporting;

    #derivation connection decomposeSignalingFaultReporting {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-004; the parent supplies shared verification conditions."; }
        end #original source ::> navigationConspicuity;
        end #derive target ::> signalingFaultReporting;
    }

    requirement def <'S-122'> DeploymentComplianceRecord {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each deployment shall have a dated compliance record identifying the craft, dimensions, waters, operating modes, applicable navigation and radio obligations, and permission evidence. */
    }
    requirement deploymentComplianceRecord : DeploymentComplianceRecord;

    #derivation connection decomposeDeploymentComplianceRecord {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of S-005; the parent supplies shared verification conditions."; }
        end #original source ::> regulatoryClassification;
        end #derive target ::> deploymentComplianceRecord;
    }

    requirement def <'S-123'> DeploymentReleaseGate {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Deployment release shall be withheld while any mandatory authorization is absent, expired or unresolved. */
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
    }
    requirement telemetryDisplayContent : TelemetryDisplayContent;

    #derivation connection decomposeTelemetryDisplayContent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-101; the parent supplies shared verification conditions."; }
        end #original source ::> telemetryEquipment;
        end #derive target ::> telemetryDisplayContent;
    }

    requirement def <'C-202'> TelemetryStaleIndication {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall indicate stale data when record age exceeds its C-101 mode threshold until receipt of a record within its applicable threshold. */
    }
    requirement telemetryStaleIndication : TelemetryStaleIndication;

    #derivation connection decomposeTelemetryStaleIndication {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-101; the parent supplies shared verification conditions."; }
        end #original source ::> telemetryEquipment;
        end #derive target ::> telemetryStaleIndication;
    }

    requirement def <'C-203'> TelemetryIdentityPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall preserve received record identity and sequence numbers across the C-101 outage/reconnection test. */
    }
    requirement telemetryIdentityPreservation : TelemetryIdentityPreservation;

    #derivation connection decomposeTelemetryIdentityPreservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-101; the parent supplies shared verification conditions."; }
        end #original source ::> telemetryEquipment;
        end #derive target ::> telemetryIdentityPreservation;
    }

    requirement def <'C-204'> TelemetryDuplicateSuppression {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The shore endpoint shall not present a duplicate telemetry record as a new observation. */
    }
    requirement telemetryDuplicateSuppression : TelemetryDuplicateSuppression;

    #derivation connection decomposeTelemetryDuplicateSuppression {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-101; the parent supplies shared verification conditions."; }
        end #original source ::> telemetryEquipment;
        end #derive target ::> telemetryDuplicateSuppression;
    }

    requirement def <'C-205'> UnauthenticatedCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Commands failing authentication shall cause zero accepted actuator or mission-state changes. */
    }
    requirement unauthenticatedCommandRejection : UnauthenticatedCommandRejection;

    #derivation connection decomposeUnauthenticatedCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> unauthenticatedCommandRejection;
    }

    requirement def <'C-206'> ReplayCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Commands with previously used sequence numbers shall cause zero accepted actuator or mission-state changes. */
    }
    requirement replayCommandRejection : ReplayCommandRejection;

    #derivation connection decomposeReplayCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> replayCommandRejection;
    }

    requirement def <'C-207'> ExpiredCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Commands older than 30 seconds shall cause zero accepted actuator or mission-state changes. */
    }
    requirement expiredCommandRejection : ExpiredCommandRejection;

    #derivation connection decomposeExpiredCommandRejection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> expiredCommandRejection;
    }

    requirement def <'C-208'> AcceptedCommandDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An accepted abort or mode-change command shall be applied within 1 second of complete receipt. */
    }
    requirement acceptedCommandDeadline : AcceptedCommandDeadline;

    #derivation connection decomposeAcceptedCommandDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> acceptedCommandDeadline;
    }

    requirement def <'C-209'> OnboardAcknowledgmentDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An accepted abort or mode-change command shall be acknowledged onboard within 1 second of complete receipt. */
    }
    requirement onboardAcknowledgmentDeadline : OnboardAcknowledgmentDeadline;

    #derivation connection decomposeOnboardAcknowledgmentDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> onboardAcknowledgmentDeadline;
    }

    requirement def <'C-210'> AcknowledgmentQueueing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An accepted command acknowledgment shall enter the transmit queue in the same command-processing cycle when a link is available. */
    }
    requirement acknowledgmentQueueing : AcknowledgmentQueueing;

    #derivation connection decomposeAcknowledgmentQueueing {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> acknowledgmentQueueing;
    }

    requirement def <'C-211'> ExternalControlDisqualification {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Acceptance of external mission or steering control during a qualifying attempt shall permanently disqualify that attempt. */
    }
    requirement externalControlDisqualification : ExternalControlDisqualification;

    #derivation connection decomposeExternalControlDisqualification {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of C-102; the parent supplies shared verification conditions."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> externalControlDisqualification;
    }

    requirement def <'N-101'> VisibilityNavigationCapability {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Navigation shall meet E-002 and E-008 acceptance criteria at visibility of at least 1 km in daylight and darkness. */
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
    }
    requirement restrictedVisibilityEntry : RestrictedVisibilityEntry;

    #derivation connection decomposeRestrictedVisibilityEntry {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-033; the parent supplies shared verification conditions."; }
        end #original source ::> visibility;
        end #derive target ::> restrictedVisibilityEntry;
    }

    requirement def <'N-104'> RestrictedVisibilityEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Restricted-visibility operation shall be recorded as outside the normal operational envelope. */
    }
    requirement restrictedVisibilityEvidence : RestrictedVisibilityEvidence;

    #derivation connection decomposeRestrictedVisibilityEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-033; the parent supplies shared verification conditions."; }
        end #original source ::> visibility;
        end #derive target ::> restrictedVisibilityEvidence;
    }

    requirement def <'N-105'> RestrictedVisibilityCollisionAssessment {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Collision assessment shall remain active during restricted-visibility operation. */
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
    }
    requirement survivalEntryDeadline : SurvivalEntryDeadline;

    #derivation connection decomposeSurvivalEntryDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-035; the parent supplies shared verification conditions."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> survivalEntryDeadline;
    }

    requirement def <'N-107'> SurvivalTransitionRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Every survival-mode entry shall have a corresponding event record. */
    }
    requirement survivalTransitionRecording : SurvivalTransitionRecording;

    #derivation connection decomposeSurvivalTransitionRecording {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-035; the parent supplies shared verification conditions."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> survivalTransitionRecording;
    }

    requirement def <'N-108'> SailingResumptionDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Full autonomous sailing shall resume within 5 minutes of N-035 resumption eligibility becoming continuously true. */
    }
    requirement sailingResumptionDeadline : SailingResumptionDeadline;

    #derivation connection decomposeSailingResumptionDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-035; the parent supplies shared verification conditions."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> sailingResumptionDeadline;
    }

    requirement def <'N-109'> SailingResumptionInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Full autonomous sailing shall remain inhibited while N-035 resumption eligibility is false. */
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
    }
    requirement resumptionBlockEvidence : ResumptionBlockEvidence;

    #derivation connection decomposeResumptionBlockEvidence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-035; the parent supplies shared verification conditions."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> resumptionBlockEvidence;
    }

    requirement def <'N-111'> WetMechanismTravel {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-044 exposure, external mechanisms shall complete their full commanded travel without seizure. */
    }
    requirement wetMechanismTravel : WetMechanismTravel;

    #derivation connection decomposeWetMechanismTravel {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-044; the parent supplies shared verification conditions."; }
        end #original source ::> wetMechanicalIntegrity;
        end #derive target ::> wetMechanismTravel;
    }

    requirement def <'N-112'> WetJointIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-044 exposure, structural joints shall show no separation or through-cracks on visual inspection at 5 times magnification. */
    }
    requirement wetJointIntegrity : WetJointIntegrity;

    #derivation connection decomposeWetJointIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-044; the parent supplies shared verification conditions."; }
        end #original source ::> wetMechanicalIntegrity;
        end #derive target ::> wetJointIntegrity;
    }

    requirement def <'N-113'> WetConductorResistance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-045 exposure, end-to-end conductor resistance shall be no more than 10 percent above its pre-test value. */
    }
    requirement wetConductorResistance : WetConductorResistance;

    #derivation connection decomposeWetConductorResistance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-045; the parent supplies shared verification conditions."; }
        end #original source ::> wetElectricalIntegrity;
        end #derive target ::> wetConductorResistance;
    }

    requirement def <'N-114'> WetInsulationResistance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-045 exposure, conductor-to-conductor and conductor-to-case insulation resistance shall be at least 1 megohm at 50 V DC. */
    }
    requirement wetInsulationResistance : WetInsulationResistance;

    #derivation connection decomposeWetInsulationResistance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-045; the parent supplies shared verification conditions."; }
        end #original source ::> wetElectricalIntegrity;
        end #derive target ::> wetInsulationResistance;
    }

    requirement def <'N-115'> HotSunElectronicsOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Powered electronics shall retain operational functions throughout the N-046 exposure. */
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
    }
    requirement controlRecoveryDeadline : ControlRecoveryDeadline;

    #derivation connection decomposeControlRecoveryDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-052; the parent supplies shared verification conditions."; }
        end #original source ::> capsizeControlRecovery;
        end #derive target ::> controlRecoveryDeadline;
    }

    requirement def <'N-123'> CapsizeGateProgressRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Gate progress shall be preserved through every N-051 release. */
    }
    requirement capsizeGateProgressRetention : CapsizeGateProgressRetention;

    #derivation connection decomposeCapsizeGateProgressRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-052; the parent supplies shared verification conditions."; }
        end #original source ::> capsizeControlRecovery;
        end #derive target ::> capsizeGateProgressRetention;
    }

    requirement def <'N-124'> CapsizeQualificationRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Qualification status shall be preserved through every N-051 release absent an independently disqualifying event. */
    }
    requirement capsizeQualificationRetention : CapsizeQualificationRetention;

    #derivation connection decomposeCapsizeQualificationRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-052; the parent supplies shared verification conditions."; }
        end #original source ::> capsizeControlRecovery;
        end #derive target ::> capsizeQualificationRetention;
    }

    requirement def <'N-125'> CapsizeRestrictionRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Control restoration after each N-051 release shall preserve every active survival, low-energy, recovery and motor-inhibition restriction. */
    }
    requirement capsizeRestrictionRetention : CapsizeRestrictionRetention;

    #derivation connection decomposeCapsizeRestrictionRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-052; the parent supplies shared verification conditions."; }
        end #original source ::> capsizeControlRecovery;
        end #derive target ::> capsizeRestrictionRetention;
    }

    requirement def <'N-126'> WeedPassageSpeed {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* During each N-053 patch passage, mean water-relative sailing speed shall be at least 50 percent of the weed-free reference speed. */
    }
    requirement weedPassageSpeed : WeedPassageSpeed;

    #derivation connection decomposeWeedPassageSpeed {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-053; the parent supplies shared verification conditions."; }
        end #original source ::> submergedWeedPassage;
        end #derive target ::> weedPassageSpeed;
    }

    requirement def <'N-127'> WeedPassageSteering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After each N-053 patch passage, full commanded rudder travel shall be regained within 5 minutes. */
    }
    requirement weedPassageSteering : WeedPassageSteering;

    #derivation connection decomposeWeedPassageSteering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-053; the parent supplies shared verification conditions."; }
        end #original source ::> submergedWeedPassage;
        end #derive target ::> weedPassageSteering;
    }

    requirement def <'N-128'> WeedSnagSpeedRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 5 minutes of each N-054 snag, water-relative sailing speed shall recover to at least 50 percent of unobstructed reference speed. */
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
    }
    requirement weedBlockageFault : WeedBlockageFault;

    #derivation connection decomposeWeedBlockageFault {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-055; the parent supplies shared verification conditions."; }
        end #original source ::> weedBlockageResponse;
        end #derive target ::> weedBlockageFault;
    }

    requirement def <'N-131'> WeedBlockageContingency {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter fouling-contingency state within 10 seconds after the N-055 trigger. */
    }
    requirement weedBlockageContingency : WeedBlockageContingency;

    #derivation connection decomposeWeedBlockageContingency {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-055; the parent supplies shared verification conditions."; }
        end #original source ::> weedBlockageResponse;
        end #derive target ::> weedBlockageContingency;
    }

    requirement def <'N-132'> WeedBlockageLocation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Location reporting shall continue at the active telemetry cadence during fouling contingency whenever a link is available. */
    }
    requirement weedBlockageLocation : WeedBlockageLocation;

    #derivation connection decomposeWeedBlockageLocation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-055; the parent supplies shared verification conditions."; }
        end #original source ::> weedBlockageResponse;
        end #derive target ::> weedBlockageLocation;
    }

    requirement def <'N-133'> PoweredWeedSpeed {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Mean water-relative powered speed through each N-056 patch passage shall be at least 50 percent of weed-free reference speed. */
    }
    requirement poweredWeedSpeed : PoweredWeedSpeed;

    #derivation connection decomposePoweredWeedSpeed {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-056; the parent supplies shared verification conditions."; }
        end #original source ::> recoveryPropulsorWeeds;
        end #derive target ::> poweredWeedSpeed;
    }

    requirement def <'N-134'> PoweredWeedCurrent {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Motor and controller currents shall remain within their respective rated limits during each N-056 patch passage. */
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
    }
    requirement lockedPropulsorShutdown : LockedPropulsorShutdown;

    #derivation connection decomposeLockedPropulsorShutdown {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of N-056; the parent supplies shared verification conditions."; }
        end #original source ::> recoveryPropulsorWeeds;
        end #derive target ::> lockedPropulsorShutdown;
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
    }
    requirement motorQualificationInvariant : MotorQualificationInvariant;

    #derivation connection decomposeMotorQualificationInvariant {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of R-004; the parent supplies shared verification conditions."; }
        end #original source ::> challengeMotorInhibition;
        end #derive target ::> motorQualificationInvariant;
    }

    requirement def <'R-102'> FreshRecoveryCommand {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After restart, motor enable shall remain inhibited until recovery is authorized by the onboard safety function or a fresh authenticated operator command. */
    }
    requirement freshRecoveryCommand : FreshRecoveryCommand;

    #derivation connection decomposeFreshRecoveryCommand {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of R-004; the parent supplies shared verification conditions."; }
        end #original source ::> challengeMotorInhibition;
        end #derive target ::> freshRecoveryCommand;
    }

    requirement def <'E-144'> IngressEventDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* In the E-006 injection test, an ingress event record shall exist within 60 seconds of injection starting. */
    }
    requirement ingressEventDeadline : IngressEventDeadline;

    #derivation connection decomposeIngressEventDeadline {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-006; the parent supplies shared verification conditions."; }
        end #original source ::> ingressResponse;
        end #derive target ::> ingressEventDeadline;
    }

    requirement def <'E-145'> QualificationRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Within 30 seconds after a watchdog reset under E-003 preconditions, qualification status shall equal the valid persisted status, or be nonqualifying when persisted status is absent or inconsistent. */
    }
    requirement qualificationRestoration : QualificationRestoration;

    #derivation connection decomposeQualificationRestoration {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of E-003; the parent supplies shared verification conditions."; }
        end #original source ::> resetRecovery;
        end #derive target ::> qualificationRestoration;
    }

    #derivation connection sharedAcceptance1 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "resetRecovery also requires the shared logInterruptionDurability outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> resetRecovery;
        end #derive target ::> logInterruptionDurability;
    }

    #derivation connection sharedAcceptance2 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "resetRecovery also requires the shared unknownQualificationFallback outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> resetRecovery;
        end #derive target ::> unknownQualificationFallback;
    }

    #derivation connection sharedAcceptance3 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "resetRecovery also requires the shared qualificationPersistence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> resetRecovery;
        end #derive target ::> qualificationPersistence;
    }

    #derivation connection sharedAcceptance4 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "resetRecovery also requires the shared freshRecoveryCommand outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> resetRecovery;
        end #derive target ::> freshRecoveryCommand;
    }

    #derivation connection sharedAcceptance5 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "resetRecovery also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> resetRecovery;
        end #derive target ::> motorQualificationInvariant;
    }

    #derivation connection sharedAcceptance6 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "commandIntegrity also requires the shared criticalEventRecording outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> criticalEventRecording;
    }

    #derivation connection sharedAcceptance7 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "commandIntegrity also requires the shared qualificationPersistence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> commandIntegrity;
        end #derive target ::> qualificationPersistence;
    }

    #derivation connection sharedAcceptance8 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "safeRecovery also requires the shared qualificationPersistence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> safeRecovery;
        end #derive target ::> qualificationPersistence;
    }

    #derivation connection sharedAcceptance9 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "safeRecovery also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> safeRecovery;
        end #derive target ::> motorQualificationInvariant;
    }

    #derivation connection sharedAcceptance10 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "safeRecovery also requires the shared periodicLogCadence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> safeRecovery;
        end #derive target ::> periodicLogCadence;
    }

    #derivation connection sharedAcceptance11 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "challengeMotorInhibition also requires the shared qualificationPersistence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> challengeMotorInhibition;
        end #derive target ::> qualificationPersistence;
    }

    #derivation connection sharedAcceptance12 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "challengeMotorInhibition also requires the shared criticalEventRecording outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> challengeMotorInhibition;
        end #derive target ::> criticalEventRecording;
    }

    #derivation connection sharedAcceptance13 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "lowEnergyRecovery also requires the shared periodicLogCadence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> periodicLogCadence;
    }

    #derivation connection sharedAcceptance14 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "lowEnergyRecovery also requires the shared telemetryDeliveryCadence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> telemetryDeliveryCadence;
    }

    #derivation connection sharedAcceptance15 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "lowEnergyRecovery also requires the shared criticalEventRecording outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> criticalEventRecording;
    }

    #derivation connection sharedAcceptance16 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "lowEnergyRecovery also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> lowEnergyRecovery;
        end #derive target ::> motorQualificationInvariant;
    }

    #derivation connection sharedAcceptance17 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "ingressResponse also requires the shared criticalEventRecording outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> ingressResponse;
        end #derive target ::> criticalEventRecording;
    }

    #derivation connection sharedAcceptance18 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "ingressResponse also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> ingressResponse;
        end #derive target ::> motorQualificationInvariant;
    }

    #derivation connection sharedAcceptance19 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "communications also requires the shared logRetention outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> communications;
        end #derive target ::> logRetention;
    }

    #derivation connection sharedAcceptance20 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "communications also requires the shared reconnectLogPreservation outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> communications;
        end #derive target ::> reconnectLogPreservation;
    }

    #derivation connection sharedAcceptance21 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "navigationAvailability also requires the shared criticalEventRecording outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> navigationAvailability;
        end #derive target ::> criticalEventRecording;
    }

    #derivation connection sharedAcceptance22 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "envelopeTransition also requires the shared periodicLogCadence outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> periodicLogCadence;
    }

    #derivation connection sharedAcceptance23 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "envelopeTransition also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> envelopeTransition;
        end #derive target ::> motorQualificationInvariant;
    }

    #derivation connection sharedAcceptance24 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "weedBlockageResponse also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> weedBlockageResponse;
        end #derive target ::> motorQualificationInvariant;
    }

    #derivation connection sharedAcceptance25 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "recoveryPropulsorWeeds also requires the shared motorQualificationInvariant outcome; one normative leaf avoids duplicate obligations."; }
        end #original source ::> recoveryPropulsorWeeds;
        end #derive target ::> motorQualificationInvariant;
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
        doc /* An energy case shall be accepted only after its installed-load coverage, resource bounds, battery derating and interval-resolution evidence have been accepted. */
        attribute accepted : Boolean;
        attribute verdict : Boolean = EnergyEvidenceReadinessCriterion(accepted);
        require constraint { verdict }
    }
    requirement energyEvidenceReadiness : EnergyEvidenceReadiness;

    dependency energyDerivation1 from sustainedEnergyFeasibility to GorgeChallenge::repeatedOperation {
        metadata rationale : ModelingMetadata::Rationale { text = "Repeated journeys motivate a repeatable energy cycle, beyond a one-off endurance run. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }

    dependency energyDerivation2 from sustainedEnergyFeasibility to BlueDog::Goals::hawaiiVoyage {
        metadata rationale : ModelingMetadata::Rationale { text = "The ocean ambition requires sustained energy autonomy; route-specific resources remain unresolved. This is design motivation or an implementation choice, not a satisfaction implication."; }
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

    #derivation connection energyDerivation6 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This leaf isolates one acceptance outcome of sustained energy feasibility."; }
        end #original source ::> sustainedEnergyFeasibility;
        end #derive target ::> energyEvidenceReadiness;
    }

    #derivation connection energyDerivation7 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "The M-002 campaign requires this separately evaluated energy outcome."; }
        end #original source ::> multiDayEndurance;
        end #derive target ::> sustainedReserveProtection;
    }

    #derivation connection energyDerivation8 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "The M-002 campaign requires this separately evaluated energy outcome."; }
        end #original source ::> multiDayEndurance;
        end #derive target ::> peakSupplyCapability;
    }

    #derivation connection energyDerivation9 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "A repeated-day qualification profile belongs to the future sustained-operation study, not finite Gorge completion."; }
        end #original source ::> sustainedEnergyFeasibility;
        end #derive target ::> harvestCampaignCoverage;
    }

    #derivation connection energyDerivation10 {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "The M-002 campaign requires this separately evaluated energy outcome."; }
        end #original source ::> multiDayEndurance;
        end #derive target ::> energyEvidenceReadiness;
    }

    dependency energyDerivation11 from sustainedReserveProtection to recoveryEnergy {
        metadata rationale : ModelingMetadata::Rationale { text = "Sustained operation protects the recovery reserve sized by the existing R-002 policy. This is design motivation or an implementation choice, not a satisfaction implication."; }
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
        doc /* The mission analysis shall evaluate whole-route progress over the declared reproducible scenario ensemble. */
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
        metadata rationale : ModelingMetadata::Rationale { text = "cruisePerformance is a selected engineering objective supporting roundTrip. This is design motivation or an implementation choice, not a satisfaction implication."; }
    }
    dependency cruiseReliabilityDerivation3 from missionReliability to roundTrip {
        metadata rationale : ModelingMetadata::Rationale { text = "missionReliability is a selected engineering objective supporting roundTrip. This is design motivation or an implementation choice, not a satisfaction implication."; }
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
    #derivation connection decomposeWindSampleCadence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> windSampleCadence;
    }
    requirement def <'E-147'> WindSpeedAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Installed apparent-wind speed error shall not exceed the greater of 0.5 m/s or 5 percent of reference speed. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windSpeedAccuracy : WindSpeedAccuracy;
    #derivation connection decomposeWindSpeedAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> windSpeedAccuracy;
    }
    requirement def <'E-148'> WindDirectionAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Installed apparent-wind direction error relative to the vessel heading shall not exceed 5 degrees. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windDirectionAccuracy : WindDirectionAccuracy;
    #derivation connection decomposeWindDirectionAccuracy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> windDirectionAccuracy;
    }
    requirement def <'E-149'> WindStaleInvalidation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall mark wind observations invalid when their age exceeds 2 seconds. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windStaleInvalidation : WindStaleInvalidation;
    #derivation connection decomposeWindStaleInvalidation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> windStaleInvalidation;
    }
    requirement def <'E-150'> InvalidWindUseInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Sail control shall exclude invalid wind observations from trim calculations. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement invalidWindUseInhibition : InvalidWindUseInhibition;
    #derivation connection decomposeInvalidWindUseInhibition {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> invalidWindUseInhibition;
    }
    requirement def <'E-151'> WindLossResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall enter its wind-sensing-degraded control state within 1 second after wind observations become invalid. */
        comment conditions /* E-009 supplies installed measurement and fault-test conditions. */
    }
    requirement windLossResponse : WindLossResponse;
    #derivation connection decomposeWindLossResponse {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> windLossResponse;
    }
    requirement def <'E-152'> WindSensingEndurance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The wind-sensing installation shall operate throughout the complete M-002 mission without servicing or external charging. */
        comment conditions /* Use the installed configuration through the complete M-002 energy campaign, including its holds and maneuvers. E-009 separately qualifies installed measurement and fault response. */
    }
    requirement windSensingEndurance : WindSensingEndurance;
    #derivation connection decomposeWindSensingEndurance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "Separately verifiable acceptance criterion for onboard wind observation."; }
        end #original source ::> windObservation;
        end #derive target ::> windSensingEndurance;
    }
}
