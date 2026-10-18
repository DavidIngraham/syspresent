package GorgeChallenge {
    doc /* Independent trans-gorge autonomous sailing challenge.
     * Inspired by the structure of the Microtransat rules:
     * https://microtransat.org/content.php?p=rules&top=rules
     * This is a separate project challenge, not a Microtransat entry or endorsement.
     * Vessel architecture and communications technology are unrestricted; overall length is limited to 1.2 m.
     * The Gorge is the proving ground for a longer-term voyage toward Hawaii.
     * Marker-referenced virtual gates are defined in TransGorgeCourse.
     * There is no completion deadline. The vehicle defines candidate environmental qualification profiles; no dam passage is permitted.
     */
    private import RequirementDerivation::*;
    private import ISQ::*;
    private import SI::*;
    attribute maximumOverallLength : LengthValue = 1.2 [m];
    requirement def <'C-000'> TransGorgeChallenge {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall complete the Trans-Gorge challenge under C-001, C-003 through C-010 and C-012 through C-027.*/
        metadata rationale : ModelingMetadata::Rationale { text = "One Bingen–Stevenson–Bingen circuit defines the finite challenge. Repeated circuits are a separate future endurance objective."; }
    }
    requirement transGorgeChallenge : TransGorgeChallenge;
    requirement def <'C-001'> CourseCompletion {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall cross the configured Bingen departure, buoy 16 rounding checkpoints and Bingen finish gates in order during one attempt. */
        comment conditions /* TransGorgeCourse defines nominal marker references and directed finite gate segments. Completion has no elapsed-time deadline. Position history must demonstrate crossings; touching a gate line alone does not count. */
        metadata issue : ModelingMetadata::Issue { text = "The marker-based gate proposal remains subject to the course safety review before launch; route corridor and current notice exclusions must accompany the accepted configuration."; }
    }
    requirement def <'C-002'> RepeatedOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* After its first circuit, the vessel should repeat Bingen–Stevenson–Bingen autonomously for as long as practical. */
        comment notes /* Future endurance objective, excluded from finite challenge acceptance. */
        metadata issue : ModelingMetadata::Issue { text = "No fixed objective endurance duration has been selected."; }
    }
    requirement def <'C-003'> UnassistedAttempt {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A qualifying attempt shall complete the round trip without operator intervention. */
        comment conditions /* Passive live monitoring and autonomous polling of weather services are permitted. Any operator-supplied update, remote emergency abort or manual control ends qualification. Weather data must be obtained by the system without manual operator submission. */
        comment restartConditions /* After intervention, a new qualifying attempt begins only with a new downstream crossing of the departure gate. Previous partial progress does not transfer. */
    }
    requirement def <'C-004'> SailingPropulsion {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A qualifying attempt shall use sailing propulsion without auxiliary motor propulsion. */
        comment conditions /* An auxiliary motor may remain installed. Motor use is permitted during separate development tests and vessel recovery; use during an attempt ends its qualification. */
        comment notes /* The restriction concerns propulsion, not onboard electrical power. */
    }
    requirement def <'C-005'> LiveObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall deliver position, operating mode and health updates at intervals no greater than 30 seconds while the monitoring link is available. */
        comment conditions /* Monitoring-link loss shall not interrupt autonomous mission execution. Retained telemetry shall be transmitted after contact returns. */
        metadata issue : ModelingMetadata::Issue { text = "LTE-M-class throughput is a provisional vehicle design assumption, not a mandated challenge technology. End-to-end delivery qualification and stale-data presentation are allocated to the vehicle."; }
    }
    requirement def <'C-006'> EmergencyIntervention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall permit remote emergency abort or manual control when a command link is available. */
        comment conditions /* Use disqualifies the attempt as unassisted. */
        metadata issue : ModelingMetadata::Issue { text = "Owner-approved policy: autonomous safety abort does not wait for operator contact. Recovery may use motor propulsion; operator-directed relocation or motor-sailing after abort never restores qualification."; }
    }
    requirement courseCompletion : CourseCompletion;
    requirement repeatedOperation : RepeatedOperation;
    requirement unassistedAttempt : UnassistedAttempt;
    requirement sailingPropulsion : SailingPropulsion;
    requirement liveObservation : LiveObservation;
    requirement emergencyIntervention : EmergencyIntervention;
    requirement def <'C-007'> NavigationRules {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall comply with the U.S. Inland Navigation Rules (33 CFR parts 83 through 90) and applicable local navigation provisions throughout the attempt on the approved Gorge course.*/
        comment conditions /* Evaluate the actual encounter and visibility conditions, including lookout, collision-risk assessment, avoidance action, safe speed, overtaking, sailing encounters and narrow-channel obligations. A safety action takes precedence over preserving attempt qualification. */
        metadata rationale : ModelingMetadata::Rationale { text = "USCG Navigation Rules: https://www.navcen.uscg.gov/navigation-rules-amalgamated . Detailed encounter cases and quantitative acceptance allocations belong to the vehicle analysis, not the independent challenge. Small size and sail propulsion do not exempt the vessel from collision avoidance or channel non-impediment."; }
        comment governingBaseline /* Before entry approval, the entrant shall submit a rule-applicability assessment for the identified vessel, propulsion modes, course and operating conditions. Identify the governing provisions and current local restrictions, required lights/shapes/sound signals, applicable exceptions and supporting authority. The organizer shall record the reviewed rule and notice baseline; later effective changes shall be reviewed before launch.*/
        comment entryEvidence /* Entry approval shall require organizer acceptance of configuration-specific evidence covering relevant sailing, overtaking, crossing and constrained-water encounters, uncertain classification, restricted visibility, degraded sensing and safety intervention. Record assumptions, observation and maneuver limits, pass/fail criteria, physical demonstrations, simulation coverage and remaining exclusions. Unsupported conditions shall be excluded from admission; unresolved capability within admitted conditions prevents entry approval. Entrants shall justify detection distances, margins and maneuver capability. Passing a limited software rule subset does not establish compliance with C-007.*/
        comment adjudication /* A collision, established navigation-rule breach or unsafe conduct requiring safety intervention disqualifies the attempt. Safety action shall not be delayed to preserve qualification, and the operator shall intervene when necessary if autonomous action is insufficient and intervention is available. Operator intervention or motor propulsion ends qualification under C-003/C-004 even when it prevents a violation. A compliant autonomous avoidance maneuver does not by itself end qualification. The organizer shall adjudicate using retained observations, commands, motion history and independent evidence where available, with a recorded reason. Insufficient evidence leaves qualification unconfirmed; absence of collision alone is not proof of compliance. Entry approval does not waive ongoing obligations.*/
        comment complianceSources /* Governing source: https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E . Applicability: https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E/part-83/subpart-A/section-83.01 . Source-linked verification cases in GorgeChallengeVerification cover applicability, lookout/avoidance, encounter conduct, channel/visibility and signals. Their verdicts remain inconclusive pending accepted evidence; traceability is not a compliance finding.*/
    }
    requirement def <'C-008'> RestrictedWaters {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall remain outside waters prohibited to the attempt configuration. */
        comment conditions /* Include dam restricted areas, lock approaches excluded by the challenge, and applicable temporary safety/security zones or closures. Use the chart and notice set applicable to the attempt. */
        metadata rationale : ModelingMetadata::Rationale { text = "33 CFR 207.718 defines site-specific dam restrictions and lock-approach authority: https://www.ecfr.gov/current/title-33/chapter-II/part-207/section-207.718 . The course stays between the dams and requires no lock passage. Do not replace mapped restrictions with an invented universal stand-off radius."; }
    }
    requirement def <'C-009'> TrafficCoexistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall complete the course without collision with other waterway users. */
        comment conditions /* The operating context includes commercial tows, passenger vessels, fishing craft, recreational powerboats, sailing vessels and people in the water. Channel non-impediment and encounter conduct remain independently required by C-007. The vehicle analysis defines representative and adverse traffic scenarios and assesses maneuver feasibility. */
        metadata rationale : ModelingMetadata::Rationale { text = "The course is shared water, not a closed test range. Typical traffic and uncertainty in other users' behavior are part of mission validation; AIS absence is not evidence of clear water. Numeric separation allocations must be justified by encounter geometry and vessel performance."; }
    }
    requirement navigationRules : NavigationRules;
    requirement restrictedWaters : RestrictedWaters;
    requirement trafficCoexistence : TrafficCoexistence;
    #derivation connection challengeNavigationRules {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-000 includes this obligation independently of course progress or elapsed time."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> navigationRules;
    }
    #derivation connection challengeRestrictedWaters {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-000 includes this obligation independently of course progress or elapsed time."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> restrictedWaters;
    }
    #derivation connection challengeTrafficCoexistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "C-000 includes this obligation independently of course progress or elapsed time."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> trafficCoexistence;
    }
    #derivation connection challengeRuleCourseCompletion {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This rule is explicitly included in C-000; C-002 retains its objective-only status."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> courseCompletion;
    }
    dependency futureEnduranceBasis from repeatedOperation to courseCompletion;
    #derivation connection challengeRuleUnassistedAttempt {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This rule is explicitly included in C-000; C-002 retains its objective-only status."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> unassistedAttempt;
    }
    #derivation connection challengeRuleSailingPropulsion {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This rule is explicitly included in C-000; C-002 retains its objective-only status."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> sailingPropulsion;
    }
    #derivation connection challengeRuleLiveObservation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This rule is explicitly included in C-000; C-002 retains its objective-only status."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> liveObservation;
    }
    #derivation connection challengeRuleEmergencyIntervention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        metadata rationale : ModelingMetadata::Rationale { text = "This rule is explicitly included in C-000; C-002 retains its objective-only status."; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> emergencyIntervention;
    }
    requirement def <'C-010'> OverallLength {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel overall length shall not exceed 1.2 m. */
        attribute measuredOverallLength : LengthValue;
        require constraint lengthLimit { measuredOverallLength > 0 [m] and measuredOverallLength <= maximumOverallLength }
        comment conditions /* Measure maximum fore-and-aft extent, including rudders, rig projections, antennas and other equipment, across normal operating configurations. Hull arrangement is unrestricted. */
        metadata rationale : ModelingMetadata::Rationale { text = "Half the Microtransat 2.4 m overall-length entry limit; owner-selected challenge constraint."; }
    }
    requirement overallLength : OverallLength;
    #derivation connection deriveOverallLength {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> overallLength;
    }
    requirement def <'C-012'> SafetyCapabilityAbort {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall autonomously terminate qualification when a required safety capability is lost. */
        comment conditions /* A demonstrated backup preserving the function permits continuation. Darkness alone is not a fault. Fog triggers this rule when it compromises required capability. */
        metadata rationale : ModelingMetadata::Rationale { text = "Abort is based on capability, not individual component failure."; }
    }
    requirement safetyCapabilityAbort : SafetyCapabilityAbort;
    #derivation connection deriveSafetyCapabilityAbort {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> safetyCapabilityAbort;
    }
    requirement def <'C-013'> AutonomousShoreRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Following a safety abort, the vessel shall autonomously initiate recovery toward a suitable shore-accessible retrieval location. */
        comment conditions /* Do not wait for operator intervention or communications. Select a viable route based on remaining capabilities. Intentional grounding at a suitable accessible shore is permitted. */
        metadata rationale : ModelingMetadata::Rationale { text = "Owner-selected recovery policy; residual risk of movement after traffic-sensing failure requires explicit analysis and review, not assumed acceptance."; }
    }
    requirement autonomousShoreRecovery : AutonomousShoreRecovery;
    #derivation connection deriveAutonomousShoreRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> autonomousShoreRecovery;
    }
    requirement def <'C-014'> AbortAlert {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall attempt immediate transmission of an abort alert when an abort is declared. */
        comment conditions /* Queue the alert while communications are unavailable and transmit when contact returns. */
        metadata rationale : ModelingMetadata::Rationale { text = "Operator awareness supports shore retrieval without being a prerequisite for recovery."; }
    }
    requirement abortAlert : AbortAlert;
    #derivation connection deriveAbortAlert {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> abortAlert;
    }
    requirement def <'C-015'> NoLittering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall support recovery without abandonment of the vessel or its major components in the waterway. */
        comment conditions /* Apply flotation, retention and post-capsize recovery obligations C-016 through C-018. */
        metadata rationale : ModelingMetadata::Rationale { text = "Owner intent: no littering. This is a recoverability obligation, not a guarantee against every conceivable casualty."; }
    }
    requirement noLittering : NoLittering;
    #derivation connection deriveNoLittering {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> noLittering;
    }
    requirement def <'C-016'> CasualtyFlotation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall remain afloat following capsize or hull flooding. */
        comment conditions /* Demonstrate in the declared casualty qualification conditions for the interval needed to execute shore recovery. */
        metadata rationale : ModelingMetadata::Rationale { text = "Derived from recoverability; casualty definition and exposure allocations require SRR review."; }
    }
    requirement casualtyFlotation : CasualtyFlotation;
    #derivation connection deriveCasualtyFlotation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> noLittering;
        end #derive target ::> casualtyFlotation;
    }
    requirement def <'C-017'> MajorComponentRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain its rig, ballast and battery following capsize or hull flooding. */
        comment conditions /* Use the same casualty qualification conditions as C-016. */
        metadata rationale : ModelingMetadata::Rationale { text = "Retained major components prevent debris and support retrieval."; }
    }
    requirement majorComponentRetention : MajorComponentRetention;
    #derivation connection deriveMajorComponentRetention {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> noLittering;
        end #derive target ::> majorComponentRetention;
    }
    requirement def <'C-018'> CapsizeRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall demonstrate autonomous travel to a suitable shore retrieval location following capsize without communications. */
        comment conditions /* Self-righting is not prescribed; inverted recovery is permitted. Auxiliary propulsion ends qualification. Demonstrate against declared course recovery conditions. */
        metadata rationale : ModelingMetadata::Rationale { text = "Limp recovery is the required outcome; hull architecture remains open."; }
    }
    requirement capsizeRecovery : CapsizeRecovery;
    #derivation connection deriveCapsizeRecovery {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> noLittering;
        end #derive target ::> capsizeRecovery;
    }
    requirement def <'C-019'> UnattachedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* A qualifying attempt shall remain afloat and unattached throughout the scored passage. */
        comment conditions /* Grounding, anchoring, attaching to shore or entering designated refuge ends qualification. Safe waiting under sail is permitted and counts toward elapsed exposure. */
        metadata rationale : ModelingMetadata::Rationale { text = "Refuge does not preserve partial qualifying progress."; }
    }
    requirement unattachedPassage : UnattachedPassage;
    #derivation connection deriveUnattachedPassage {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> unattachedPassage;
    }
    requirement def <'C-020'> OutageAutonomy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Loss of communications alone shall not terminate an otherwise safe qualifying attempt. */
        comment conditions /* Continue navigation and retain telemetry onboard; replay retained data after reconnection. */
        metadata rationale : ModelingMetadata::Rationale { text = "Onboard safety and recovery do not depend on contact."; }
    }
    requirement communicationOutageAutonomy : OutageAutonomy;
    #derivation connection deriveOutageAutonomy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> communicationOutageAutonomy;
    }
    requirement def <'C-021'> ForecastAdmission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Launch authorization shall require a forecast window assessed to support the complete round trip with waiting and recovery margins. */
        comment conditions /* Use the declared mission configuration and forecast-conditioned scenarios. No fixed completion deadline applies. */
        metadata rationale : ModelingMetadata::Rationale { text = "Whole-mission assessment replaces an arbitrary sailing-speed floor."; }
    }
    requirement forecastAdmission : ForecastAdmission;
    #derivation connection deriveForecastAdmission {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> forecastAdmission;
    }
    requirement def <'C-022'> WeatherOutageContinuation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall permit continued qualification during weather-service outage only while the last forecast remains applicable and required safety capabilities remain available. */
        comment conditions /* Forecast applicability must cover remaining passage and recovery options; assess against observations. */
        metadata rationale : ModelingMetadata::Rationale { text = "Loss of data access alone is not an abort trigger."; }
    }
    requirement weatherOutageContinuation : WeatherOutageContinuation;
    #derivation connection deriveWeatherOutageContinuation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> weatherOutageContinuation;
    }
    requirement def <'C-023'> CourseRecoveryReserve {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall protect sufficient energy to reach a suitable shore retrieval location from its current course position. */
        comment conditions /* Account for adverse current, essential onboard loads and uncertainty along the recovery route. No fixed motor-runtime reserve is substituted for route analysis. */
        metadata rationale : ModelingMetadata::Rationale { text = "Reserve follows the course and available recovery destinations."; }
    }
    requirement courseRecoveryReserve : CourseRecoveryReserve;
    #derivation connection deriveCourseRecoveryReserve {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> courseRecoveryReserve;
    }
    requirement def <'C-024'> ReserveAbort {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall initiate autonomous recovery before further mission continuation would compromise the course-dependent recovery reserve. */
        comment conditions /* Include the decision and maneuver margin needed to enter recovery. */
        metadata rationale : ModelingMetadata::Rationale { text = "Protecting reserve requires timely action, not only energy monitoring."; }
    }
    requirement reserveAbort : ReserveAbort;
    #derivation connection deriveReserveAbort {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> reserveAbort;
    }
    requirement def <'C-025'> NightOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall support qualifying operation in darkness. */
        comment conditions /* Required navigation, traffic safety and observation functions remain applicable. Nightfall alone does not require refuge. */
        metadata rationale : ModelingMetadata::Rationale { text = "Passage duration is uncertain and may include overnight sailing."; }
    }
    requirement nightOperation : NightOperation;
    #derivation connection deriveNightOperation {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> nightOperation;
    }
    requirement def <'C-026'> AbortPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* An aborted attempt shall remain disqualified until a new attempt begins at the departure gate. */
        comment conditions /* No autonomous resumption from refuge. Operator-commanded relocation is permitted outside qualification. */
        metadata rationale : ModelingMetadata::Rationale { text = "Recovery cannot silently resume a partial challenge."; }
    }
    requirement abortPersistence : AbortPersistence;
    #derivation connection deriveAbortPersistence {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> abortPersistence;
    }
    requirement def <'C-027'> RecoveryConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall present conspicuous recovery indications during autonomous shore recovery. */
        comment conditions /* Allocate indications consistently with applicable navigation signals; no light or sound configuration is prescribed here. */
        metadata rationale : ModelingMetadata::Rationale { text = "Prompt recovery and operator alerts do not replace visibility to other users."; }
    }
    requirement recoveryConspicuity : RecoveryConspicuity;
    #derivation connection deriveRecoveryConspicuity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        end #original source ::> transGorgeChallenge;
        end #derive target ::> recoveryConspicuity;
    }
    comment trafficCourtesyGuidance /* Entrants are encouraged to choose routes and operating windows that reduce encounters with other waterway users. This is nonbinding guidance, not an entry or adjudication criterion. Another vessel changing course or speed is not by itself a breach. Navigation-rule compliance, applicable nonimpediment duties and collision avoidance remain governed by C-007 and C-009.*/
}
