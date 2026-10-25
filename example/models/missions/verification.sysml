package GorgeChallengeVerification {
    doc /* Planned qualification cases, not completed evidence. Virtual regression checks and physical demonstrations are separate evidence streams. */
    verification def OverallLengthVerification {
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Inspect and measure the maximum fore-and-aft extent through all normal rig, steering and equipment configurations. Apply the executable lengthLimit constraint with recorded measurement uncertainty; confirm no unmeasured projection extends beyond the reported envelope. */
        objective acceptance { verify GorgeChallenge::overallLength; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def SafetyCapabilityAbortVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Inject loss of required safety functions, including visibility-driven loss and common-cause faults. Confirm qualification terminates when the function is unavailable; demonstrate continued qualification only when an accepted backup maintains that function. */
        objective acceptance { verify GorgeChallenge::safetyCapabilityAbort; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def AutonomousShoreRecoveryVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* From declared course locations and casualty states, remove communications and trigger safety abort. Record recovery initiation, chosen accessible destination, transit and final approach. Assess impaired-sensing collision exposure and consequences independently; a successful transit alone does not accept that residual risk. */
        objective acceptance { verify GorgeChallenge::autonomousShoreRecovery; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def AbortAlertVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Trigger abort with available and unavailable links. Observe immediate transmission attempts with a link, durable queueing without a link and delivery after reconnection. Timing implementation tolerance must be declared before qualification. */
        objective acceptance { verify GorgeChallenge::abortAlert; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def NoLitteringVerification {
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Review and demonstrate the linked flotation, major-component retention and capsize recovery cases using the same casualty configuration. Account for every major component at retrieval. */
        objective acceptance { verify GorgeChallenge::noLittering; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def CasualtyFlotationVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Execute the approved flooding and capsize exposure cases with maximum mission load. Observe flotation throughout the course-derived recovery duration. A short static float test cannot substantiate a longer recovery exposure. */
        objective acceptance { verify GorgeChallenge::casualtyFlotation; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def MajorComponentRetentionVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        doc /* Inspect rig, ballast and battery retention before and after the same flooding and capsize cases used for flotation. Record attachments and any released debris. */
        objective acceptance { verify GorgeChallenge::majorComponentRetention; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def CapsizeRecoveryVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Release the vessel in the declared capsize orientations with communications disabled and execute shore recovery under the approved current, wind and wave profile. Observe arrival at a retrievable location; remaining inverted is allowed. Motor use must disqualify the attempt. */
        objective acceptance { verify GorgeChallenge::capsizeRecovery; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def UnattachedPassageVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Review timestamped passage records and inject grounding, anchoring, shore attachment and refuge entry. Each ends qualification; safe afloat waiting does not. Missing evidence prevents an affirmative qualification verdict. */
        objective acceptance { verify GorgeChallenge::unattachedPassage; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def OutageAutonomyVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Interrupt communications during healthy passage and verify continued autonomous operation, retained observations and backlog delivery. Separately inject a safety failure during the outage to ensure loss of contact does not inhibit recovery. */
        objective acceptance { verify GorgeChallenge::communicationOutageAutonomy; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def ForecastAdmissionVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Exercise forecast-conditioned launch scenarios covering full passage, waiting and recovery exposure. Reject missing or insufficient forecast coverage. Evaluate the frozen Monte Carlo ensemble and explicit edge cases without treating sample completion fraction as calibrated real-world probability. */
        objective acceptance { verify GorgeChallenge::forecastAdmission; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def WeatherOutageContinuationVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Interrupt weather access with applicable and expired forecasts; independently vary onboard safety capability. Confirm continuation requires both applicable forecast information and preserved safety capability. */
        objective acceptance { verify GorgeChallenge::weatherOutageContinuation; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def CourseRecoveryReserveVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Evaluate route-dependent reserve along the course using installed load evidence, adverse currents, route feasibility and uncertainty. An inaccessible shore, infeasible route or missing input cannot establish a protected reserve. */
        objective acceptance { verify GorgeChallenge::courseRecoveryReserve; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def ReserveAbortVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Inject declining energy and increasing recovery demand along the route. Confirm recovery begins with sufficient reserve for the decision delay, transition and transit rather than only after reserve exhaustion. */
        objective acceptance { verify GorgeChallenge::reserveAbort; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def NightOperationVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Exercise the declared navigation, traffic, communications and recovery scenarios in darkness. Confirm nightfall alone does not terminate qualification. Simulation cannot close optical sensing or navigation-light physical evidence. */
        objective acceptance { verify GorgeChallenge::nightOperation; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def AbortPersistenceVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* After abort, test reboot, contact restoration, refuge departure and operator relocation. Qualification remains ended until the new attempt departure-gate condition is met; partial progress is not carried forward. */
        objective acceptance { verify GorgeChallenge::abortPersistence; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def RecoveryConspicuityVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        doc /* Inspect and test recovery indications against the deployment-specific navigation-signal matrix in the approved visibility conditions, including the casualty states for which recovery is claimed. */
        objective acceptance { verify GorgeChallenge::recoveryConspicuity; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def WindSportEncounterVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Exercise BlueDogLocationTraffic windsurfCrossing, wingfoilTurn, kiteSweep, fallenRider and groupEncounter across both tacks, overtaking, unknown tack, glare, waves and darkness. Independently record rider/equipment extent, timing, swept-volume clearance and navigation obligations. Include timely, delayed and absent rider avoidance, falls, track swaps and no feasible sailing response. Scripted planar targets or cooperative passes cannot close these cases.*/
        objective acceptance {
            verify GorgeChallenge::trafficCoexistence;
            verify GorgeChallenge::navigationRules;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def LocationTrafficAdmissionVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Exercise BlueDogLocationTraffic windowOverrun and WindowAssessment for surveyed sectors and background reaches on both legs, waiting and recovery. Reject missing traffic evidence, unsupported wind/daylight conditions, incomplete coverage and intervals outside reviewed windows. Compare cumulative exposure, energy, sensing and recovery before departure. Sparse heatmaps and zero observed users cannot establish absence. Reassess delays and unexpected traffic; no accepted window yet.*/
        objective acceptance {
            verify GorgeChallenge::forecastAdmission;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def NavigationRulesEntryAndAdjudicationVerification {
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Planned case; no completed compliance evidence. Review entry applicability, current rule/notice baseline, installed observation and maneuver evidence, controlled demonstrations and simulation limitations against predeclared criteria. Reject unsupported admitted conditions. Replay compliant autonomous avoidance, no-contact rule breach, collision, operator intervention, motor-assisted safety action and insufficient evidence; confirm their distinct qualification outcomes. Record configuration, conditions, reviewer, evidence and rationale. Do not stage hazardous encounters with uninvolved users.*/
        objective acceptance {
            verify GorgeChallenge::navigationRules;
            verify GorgeChallenge::navigationRuleApplicability;
            verify GorgeChallenge::navigationRuleBaseline;
            verify GorgeChallenge::navigationEntryEvidence;
            verify GorgeChallenge::operatorSafetyIntervention;
            verify GorgeChallenge::navigationAdjudication;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def InlandApplicabilityVerification {
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Planned case; no completed compliance evidence. Sources: Rules 1-3, https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E/part-83/subpart-A . Review jurisdiction, vessel classification, sailing/powered/casualty modes, responsibility, local provisions and authority for exceptions. Record applicability dispositions; no blanket small-vessel or autonomous exemption.*/
        objective acceptance {
            verify GorgeChallenge::navigationRules;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def InlandLookoutAndAvoidanceVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Planned case; no completed compliance evidence. Sources: Rules 5-8, https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E/part-83/subpart-B . Demonstrate installed lookout, safe speed, risk appraisal and effective avoidance under admitted conditions, including uncertain and missed tracks. Independently observe early/substantial action and effectiveness. No-contact outcome alone is insufficient.*/
        objective acceptance {
            verify GorgeChallenge::navigationRules;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def InlandEncounterConductVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Planned case; no completed compliance evidence. Sources: Rules 11-18, https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E/part-83/subpart-B . Review applicability and demonstrate sailing, overtaking, crossing/head-on where relevant, give-way and stand-on escalation, unknown tack and exceptional status. Retain overtaking duty until past and clear. Distinguish permission from mandatory action; a subset does not verify omitted rules.*/
        objective acceptance {
            verify GorgeChallenge::navigationRules;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def InlandChannelAndVisibilityVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Planned case; no completed compliance evidence. Sources: Rules 9, 10 and 19, https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E/part-83/subpart-B . Review channel confinement, nonimpediment, crossings, applicable traffic separation and restricted visibility. Exercise simultaneous pairwise/channel duties. Record applicability or justified exclusions, operating limits and response to deteriorating visibility. In-sight logic does not verify nonvisual encounters.*/
        objective acceptance {
            verify GorgeChallenge::navigationRules;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def InlandSignalsVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        doc /* Planned case; no completed compliance evidence. Sources: Rules 20-37 and applicable annexes, https://www.ecfr.gov/current/title-33/chapter-I/subchapter-E . Review lights, shapes and sound signals for sailing, powered recovery and casualty modes. Demonstrate required equipment performance and signal behavior under admitted conditions. Record authority for alternatives; review distress signaling and applicable exemptions separately.*/
        objective acceptance {
            verify GorgeChallenge::navigationRules;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def PassageQualificationVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Review the approved course, configuration and predeclared admission evidence, then independently reconstruct the ordered finite gate crossings and complete attempt history. Exercise skipped/reversed/touched gates, operator updates, motor thrust, grounding and restart. A complete circuit is insufficient when another governing challenge obligation failed or evidence is missing. Safe unassisted righting preserves qualification only with required safety capability; recovery after disqualification cannot transfer partial progress into a new attempt. Accept C-000 only after every applicable C-001, C-003 through C-010 and C-012 through C-027 obligation has its own accepted evidence or justified coverage in the same attempt. */
        objective acceptance {
            verify GorgeChallenge::transGorgeChallenge;
            verify GorgeChallenge::courseCompletion;
            verify GorgeChallenge::unassistedAttempt;
            verify GorgeChallenge::sailingPropulsion;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def ObservationAndInterventionVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        doc /* Measure acquisition-to-shore delivery under an available link, including current position, operating mode and health. Interrupt and restore the link; inspect durable backlog replay and continued autonomous control. Exercise authenticated emergency abort and manual-control commands with independent observation of the commanded response and persistent disqualification. Passive monitoring must not change mission state. Distinguish an unavailable link from a failed delivery on an available link. The demonstration must cover the installed vessel and shore endpoints; software queue tests alone do not establish communication service. */
        objective acceptance {
            verify GorgeChallenge::liveObservation;
            verify GorgeChallenge::emergencyIntervention;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def RestrictedWatersVerification {
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Review the applicable chart, dam and lock exclusions, local restrictions and current notice baseline for the configured course. Independently compare the complete observed vessel envelope and position uncertainty against approved exclusion geometry throughout the attempt. Exercise approach, navigation-loss and no-feasible-maneuver cases in a controlled test or simulation; do not enter prohibited waters to test the response. A route-planner clearance result is supporting analysis, not evidence that actual operation remained outside restrictions. */
        objective acceptance { verify GorgeChallenge::restrictedWaters; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
}
