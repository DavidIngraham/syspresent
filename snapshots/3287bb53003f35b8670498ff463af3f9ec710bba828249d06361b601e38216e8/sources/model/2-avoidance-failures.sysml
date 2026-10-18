package BlueDogAvoidanceFailures {
    private import ScalarValues::*; private import FailureAnalysis::*; private import CauseAndEffect::*;
    doc /* Qualitative, conditional avoidance failure analysis. All review actions remain open. Tree propositions are defined over one encounter response interval. Fallback unavailable means no complete timely safe fallback, not merely a stopped motor. Other users avoiding Blue Dog are not credited as a safeguard. No probability or exhaustive coverage claim. */
    occurrence def Exposure {
        occurrence encounterDemand : Event { attribute :>> description = "An encounter requires effective separation control within the available response time."; }
        occurrence missedDetection : Event { attribute :>> description = "A relevant target is not observed before the response deadline."; }
        occurrence lateObservation : Event { attribute :>> description = "Delivered target information is too old for a supported response."; }
        occurrence falseOrSwappedTrack : Event { attribute :>> description = "A false target or identity swap corrupts the encounter picture."; }
        occurrence wrongClassification : Event { attribute :>> description = "An incorrect target class, tack, status or occupant assessment is treated as reliable."; }
        occurrence wrongMotionPrediction : Event { attribute :>> description = "The credited target trajectory or swept extent excludes the actual encounter."; }
        occurrence wrongRuleAssessment : Event { attribute :>> description = "The controller applies the wrong duty, loses an overtaking duty or uses unsupported context."; }
        occurrence noFeasibleCommand : Event { attribute :>> description = "No timely safe, rule-consistent primary command is available."; }
        occurrence unsafeCourtesyChange : Event { attribute :>> description = "A discretionary courtesy change conflicts with an established encounter duty or another avoidance action."; }
        occurrence steeringUnavailable : Event { attribute :>> description = "The vessel cannot achieve the steering motion credited to the response."; }
        occurrence sailControlUnavailable : Event { attribute :>> description = "The vessel cannot achieve the sail-force change credited to the response."; }
        occurrence unobservedExecutionError : Event { attribute :>> description = "Actual motion diverges from the plan without timely corrective action."; }
        occurrence sharedPowerLoss : Event { attribute :>> description = "One shared power fault defeats the credited primary and recovery paths during the same demand."; }
        occurrence sharedComputeLoss : Event { attribute :>> description = "One shared compute, timebase or data-path fault defeats both credited response paths."; }
        occurrence unsafeAbortTransition : Event { attribute :>> description = "A command-arbitration, reset or propulsion-gating fault during transition defeats a timely safe fallback. A qualification-state error alone does not assert this event."; }
        occurrence inadequateRecoveryObservation : Event { attribute :>> description = "Recovery has no adequate independent observation and navigation capability for the encounter."; }
        occurrence noSafeRecoveryRoute : Event { attribute :>> description = "No accessible recovery route preserves separation and boundary safety."; }
        occurrence recoveryTooLate : Event { attribute :>> description = "The complete recovery response cannot act before the separation deadline."; }
        occurrence <'Observation unavailable'> OR_observationUnavailable : OrGate { attribute :>> description = "The primary observation picture is unusable for a safe response."; ref occurrence :>> inputs = (missedDetection, lateObservation, falseOrSwappedTrack); }
        connection OR_observationUnavailable_0 : Causation connect missedDetection to OR_observationUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_observationUnavailable_1 : Causation connect lateObservation to OR_observationUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_observationUnavailable_2 : Causation connect falseOrSwappedTrack to OR_observationUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        occurrence <'Assessment wrong'> OR_assessmentWrong : OrGate { attribute :>> description = "Primary encounter assessment is unsafe."; ref occurrence :>> inputs = (wrongClassification, wrongMotionPrediction, wrongRuleAssessment); }
        connection OR_assessmentWrong_0 : Causation connect wrongClassification to OR_assessmentWrong { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_assessmentWrong_1 : Causation connect wrongMotionPrediction to OR_assessmentWrong { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_assessmentWrong_2 : Causation connect wrongRuleAssessment to OR_assessmentWrong { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        occurrence <'Command unsafe'> OR_commandUnsafe : OrGate { attribute :>> description = "Primary command selection cannot provide a safe response."; ref occurrence :>> inputs = (noFeasibleCommand, unsafeCourtesyChange); }
        connection OR_commandUnsafe_0 : Causation connect noFeasibleCommand to OR_commandUnsafe { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_commandUnsafe_1 : Causation connect unsafeCourtesyChange to OR_commandUnsafe { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        occurrence <'Maneuver unavailable'> OR_maneuverUnavailable : OrGate { attribute :>> description = "Primary maneuver execution cannot provide a safe response."; ref occurrence :>> inputs = (steeringUnavailable, sailControlUnavailable, unobservedExecutionError); }
        connection OR_maneuverUnavailable_0 : Causation connect steeringUnavailable to OR_maneuverUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_maneuverUnavailable_1 : Causation connect sailControlUnavailable to OR_maneuverUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_maneuverUnavailable_2 : Causation connect unobservedExecutionError to OR_maneuverUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        occurrence <'Primary response unavailable'> OR_primaryUnavailable : OrGate { attribute :>> description = "No effective timely primary separation response remains."; ref occurrence :>> inputs = (OR_observationUnavailable, OR_assessmentWrong, OR_commandUnsafe, OR_maneuverUnavailable, sharedPowerLoss, sharedComputeLoss); }
        connection OR_primaryUnavailable_0 : Causation connect OR_observationUnavailable to OR_primaryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_primaryUnavailable_1 : Causation connect OR_assessmentWrong to OR_primaryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_primaryUnavailable_2 : Causation connect OR_commandUnsafe to OR_primaryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_primaryUnavailable_3 : Causation connect OR_maneuverUnavailable to OR_primaryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_primaryUnavailable_4 : Causation connect sharedPowerLoss to OR_primaryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_primaryUnavailable_5 : Causation connect sharedComputeLoss to OR_primaryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        occurrence <'Recovery response unavailable'> OR_recoveryUnavailable : OrGate { attribute :>> description = "No effective timely fallback separation response remains."; ref occurrence :>> inputs = (unsafeAbortTransition, inadequateRecoveryObservation, noSafeRecoveryRoute, recoveryTooLate, sharedPowerLoss, sharedComputeLoss); }
        connection OR_recoveryUnavailable_0 : Causation connect unsafeAbortTransition to OR_recoveryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_recoveryUnavailable_1 : Causation connect inadequateRecoveryObservation to OR_recoveryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_recoveryUnavailable_2 : Causation connect noSafeRecoveryRoute to OR_recoveryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_recoveryUnavailable_3 : Causation connect recoveryTooLate to OR_recoveryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_recoveryUnavailable_4 : Causation connect sharedPowerLoss to OR_recoveryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        connection OR_recoveryUnavailable_5 : Causation connect sharedComputeLoss to OR_recoveryUnavailable { metadata CausationMetadata { isNecessary = false; isSufficient = true; } }
        occurrence <'Safe separation unsupported'> AND_safeSeparationUnsupported : AndGate { attribute :>> description = "During an encounter demand, neither primary nor fallback provides a supported safe separation response. This is capability loss, not a predicted collision."; ref occurrence :>> inputs = (encounterDemand, OR_primaryUnavailable, OR_recoveryUnavailable); }
        connection AND_safeSeparationUnsupported_0 : Causation connect encounterDemand to AND_safeSeparationUnsupported { metadata CausationMetadata { isNecessary = true; isSufficient = false; } }
        connection AND_safeSeparationUnsupported_1 : Causation connect OR_primaryUnavailable to AND_safeSeparationUnsupported { metadata CausationMetadata { isNecessary = true; isSufficient = false; } }
        connection AND_safeSeparationUnsupported_2 : Causation connect OR_recoveryUnavailable to AND_safeSeparationUnsupported { metadata CausationMetadata { isNecessary = true; isSufficient = false; } }
    }
    occurrence exposure : Exposure;
    analysis def EvaluateExposure { subject scenario : Exposure; out attribute primaryUnavailable : Boolean = scenario.OR_primaryUnavailable.present; out attribute recoveryUnavailable : Boolean = scenario.OR_recoveryUnavailable.present; out attribute safeSeparationUnsupported : Boolean = scenario.AND_safeSeparationUnsupported.present; }
    occurrence fixedAngularGap : Event { attribute :>> description = "Rig masking or heel opens an unobserved sector through the response deadline."; }
    connection fixedAngularGapContributes : Causation connect fixedAngularGap to exposure.missedDetection { doc /* Conditional design hypothesis for SC-01 / SC-02; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence fixedStaleFrames : Event { attribute :>> description = "Dropped or frozen camera frames are presented as current tracks."; }
    connection fixedStaleFramesContributes : Causation connect fixedStaleFrames to exposure.lateObservation { doc /* Conditional design hypothesis for SC-01 / SC-02; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence wetOptics : Event { attribute :>> description = "Spray, condensation, glare or darkness defeats required optical observation."; }
    connection wetOpticsContributes : Causation connect wetOptics to exposure.missedDetection { doc /* Conditional design hypothesis for SC-01 / SC-02 / SC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence sharedHub : Event { attribute :>> description = "A common USB hub or host loses all credited optical channels."; }
    connection sharedHubContributes : Causation connect sharedHub to exposure.missedDetection { doc /* Conditional design hypothesis for SC-01 / SC-02 / SC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence scannerJam : Event { attribute :>> description = "Scanner stops or reports a false azimuth while targets remain outside its view."; }
    connection scannerJamContributes : Causation connect scannerJam to exposure.missedDetection { doc /* Conditional design hypothesis for SC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence scannerRevisit : Event { attribute :>> description = "Sweep, cable-safe return or processing creates excessive sector revisit time."; }
    connection scannerRevisitContributes : Causation connect scannerRevisit to exposure.lateObservation { doc /* Conditional design hypothesis for SC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence scannerCable : Event { attribute :>> description = "Cable winding, seal friction or ingress prevents the required scan."; }
    connection scannerCableContributes : Causation connect scannerCable to exposure.missedDetection { doc /* Conditional design hypothesis for SC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence passiveQuiet : Event { attribute :>> description = "A quiet target provides no usable acoustic cue before the response deadline."; }
    connection passiveQuietContributes : Causation connect passiveQuiet to exposure.missedDetection { doc /* Conditional design hypothesis for AC-01; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence passiveAmbiguous : Event { attribute :>> description = "Flow noise, multipath or calibration error produces a plausible wrong bearing or motion estimate."; }
    connection passiveAmbiguousContributes : Causation connect passiveAmbiguous to exposure.wrongMotionPrediction { doc /* Conditional design hypothesis for AC-01; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence activeClutter : Event { attribute :>> description = "Bubbles, clutter, shadowing or weak target return removes required sonar detection."; }
    connection activeClutterContributes : Causation connect activeClutter to exposure.missedDetection { doc /* Conditional design hypothesis for AC-02 / AC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence narrowBeamRevisit : Event { attribute :>> description = "Motion-dependent narrow-beam coverage leaves a target unsampled too long."; }
    connection narrowBeamRevisitContributes : Causation connect narrowBeamRevisit to exposure.lateObservation { doc /* Conditional design hypothesis for AC-02; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence multibeamExtent : Event { attribute :>> description = "A sonar return is treated as complete rider, rig or line extent when it is not."; }
    connection multibeamExtentContributes : Causation connect multibeamExtent to exposure.wrongMotionPrediction { doc /* Conditional design hypothesis for AC-03; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence invertedMount : Event { attribute :>> description = "Capsize immerses optical apertures or exposes acoustic heads, defeating the credited fallback."; }
    connection invertedMountContributes : Causation connect invertedMount to exposure.inadequateRecoveryObservation { doc /* Conditional design hypothesis for All concepts; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence wingDriveJam : Event { attribute :>> description = "A wing drive or bearing jams at an adverse force direction during avoidance."; }
    connection wingDriveJamContributes : Causation connect wingDriveJam to exposure.sailControlUnavailable { doc /* Conditional design hypothesis for Rigid-wing alternatives; not an installed configuration or individually sufficient physical causal claim. */ }
    occurrence softSailSheetJam : Event { attribute :>> description = "A sheet or sail mechanism jams so commanded force reduction is not achieved."; }
    connection softSailSheetJamContributes : Causation connect softSailSheetJam to exposure.sailControlUnavailable { doc /* Conditional design hypothesis for Soft-sail alternative; not an installed configuration or individually sufficient physical causal claim. */ }
    part functional : FailureAnalysis::Review { ref part :>> system = BlueDog::Architecture::missionContext.boat; attribute :>> scopeReviewed = false;
        part missedDetection : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-001"; attribute :>> intendedFunction = "Observe traffic";
            occurrence initiatingCause : Event { attribute :>> description = "Sensor coverage or sensitivity is inadequate for the admitted target and conditions."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.OR_observationUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Coverage confidence and independent observation are unproven."; attribute :>> recommendedAction = "Demonstrate class-specific timely observation and explicit unknown-target treatment."; attribute :>> ownerRole = "Perception"; attribute :>> safetyCritical = true;
        }
        part lateObservation : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-002"; attribute :>> intendedFunction = "Deliver timely tracks";
            occurrence initiatingCause : Event { attribute :>> description = "Acquisition, transport, processing or sector revisit exceeds the response budget."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.lateObservation; ref occurrence :>> localEffect = exposure.OR_observationUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Capture-time and end-to-end age monitoring are proposed."; attribute :>> recommendedAction = "Inject latency and stale timestamps at the encounter boundary."; attribute :>> ownerRole = "Perception"; attribute :>> safetyCritical = true;
        }
        part falseOrSwappedTrack : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-003"; attribute :>> intendedFunction = "Maintain target identity";
            occurrence initiatingCause : Event { attribute :>> description = "Clutter or association errors transfer motion or duty to the wrong object."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.falseOrSwappedTrack; ref occurrence :>> localEffect = exposure.OR_observationUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Association ambiguity detection is unproven."; attribute :>> recommendedAction = "Exercise crossing tracks, groups, disappearances and reappearance without erasing duties."; attribute :>> ownerRole = "Perception"; attribute :>> safetyCritical = true;
        }
        part wrongClassification : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-004"; attribute :>> intendedFunction = "Assess vessel and occupant status";
            occurrence initiatingCause : Event { attribute :>> description = "An uncertain class, tack, rider fall or propulsion mode is overcredited."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.wrongClassification; ref occurrence :>> localEffect = exposure.OR_assessmentWrong; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Confidence and consistency checks are proposed."; attribute :>> recommendedAction = "Inject wrong-but-plausible classifications and occupant transitions."; attribute :>> ownerRole = "Autonomy"; attribute :>> safetyCritical = true;
        }
        part wrongMotionPrediction : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-005"; attribute :>> intendedFunction = "Predict occupied water";
            occurrence initiatingCause : Event { attribute :>> description = "Turning targets, kite lines or rider falls violate the assumed trajectory or extent."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.wrongMotionPrediction; ref occurrence :>> localEffect = exposure.OR_assessmentWrong; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Prediction residual monitoring is proposed."; attribute :>> recommendedAction = "Bound swept extents and adversarial target maneuvers; include occupied ownship turns."; attribute :>> ownerRole = "Autonomy"; attribute :>> safetyCritical = true;
        }
        part wrongRuleAssessment : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-006"; attribute :>> intendedFunction = "Determine navigation duties";
            occurrence initiatingCause : Event { attribute :>> description = "Context, overtaking memory or stand-on escalation is misapplied."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.wrongRuleAssessment; ref occurrence :>> localEffect = exposure.OR_assessmentWrong; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Native rule consistency checks cover only supplied facts."; attribute :>> recommendedAction = "Inject context changes, missing tracks and inconsistent facts; test retained duties."; attribute :>> ownerRole = "Autonomy"; attribute :>> safetyCritical = true;
        }
        part noFeasibleCommand : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-007"; attribute :>> intendedFunction = "Select a safe response";
            occurrence initiatingCause : Event { attribute :>> description = "Required clearance, duties and achieved maneuver capability leave no admissible command."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.noFeasibleCommand; ref occurrence :>> localEffect = exposure.OR_commandUnsafe; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Feasibility rejection exists only in bounded replay."; attribute :>> recommendedAction = "Verify rejection timing and a safe transition when no candidate remains."; attribute :>> ownerRole = "Guidance"; attribute :>> safetyCritical = true;
        }
        part unsafeCourtesyChange : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-008"; attribute :>> intendedFunction = "Remain predictable";
            occurrence initiatingCause : Event { attribute :>> description = "Early route preference is applied as a late always-yield maneuver."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.unsafeCourtesyChange; ref occurrence :>> localEffect = exposure.OR_commandUnsafe; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Rule-consistency filtering is proposed for the future planner."; attribute :>> recommendedAction = "Test that courtesy cannot override established encounter duties or create another conflict."; attribute :>> ownerRole = "Guidance"; attribute :>> safetyCritical = true;
        }
        part steeringUnavailable : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-009"; attribute :>> intendedFunction = "Execute heading response";
            occurrence initiatingCause : Event { attribute :>> description = "Weeds, linkage damage or actuator saturation defeats steering."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.steeringUnavailable; ref occurrence :>> localEffect = exposure.OR_maneuverUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Command/position/current and motion residuals are unproven."; attribute :>> recommendedAction = "Measure jammed and reduced-authority trajectories and response limits."; attribute :>> ownerRole = "Actuation"; attribute :>> safetyCritical = true;
        }
        part sailControlUnavailable : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-010"; attribute :>> intendedFunction = "Execute force response";
            occurrence initiatingCause : Event { attribute :>> description = "Rig actuator or sail mechanism jams or lacks authority."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.sailControlUnavailable; ref occurrence :>> localEffect = exposure.OR_maneuverUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Trim and achieved-force monitoring are unproven."; attribute :>> recommendedAction = "Compare failure positions across all three rigs and test adverse trim."; attribute :>> ownerRole = "Rig/control"; attribute :>> safetyCritical = true;
        }
        part unobservedExecutionError : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-011"; attribute :>> intendedFunction = "Monitor achieved response";
            occurrence initiatingCause : Event { attribute :>> description = "Guidance assumes commanded motion despite current, stall, latency or drift."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.unobservedExecutionError; ref occurrence :>> localEffect = exposure.OR_maneuverUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Independent trajectory residual monitoring is unproven."; attribute :>> recommendedAction = "Inject motion mismatch and test timely replanning with actual achieved motion."; attribute :>> ownerRole = "Navigation/control"; attribute :>> safetyCritical = true;
        }
        part unsafeAbortTransition : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-012"; attribute :>> intendedFunction = "Transition safely to recovery";
            occurrence initiatingCause : Event { attribute :>> description = "Command arbitration, reset or propulsion gating loses safety during abort."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.unsafeAbortTransition; ref occurrence :>> localEffect = exposure.OR_recoveryUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Qualification latch tests do not establish safe motion."; attribute :>> recommendedAction = "Inject simultaneous abort, reset and stale commands; verify navigation duties in recovery."; attribute :>> ownerRole = "System/control"; attribute :>> safetyCritical = true;
        }
        part inadequateRecoveryObservation : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-013"; attribute :>> intendedFunction = "Preserve fallback awareness";
            occurrence initiatingCause : Event { attribute :>> description = "Primary and fallback share failed sensors or lack usable casualty geometry."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.inadequateRecoveryObservation; ref occurrence :>> localEffect = exposure.OR_recoveryUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Independent recovery observation is not selected."; attribute :>> recommendedAction = "Design and demonstrate complete power, host, observation and navigation independence."; attribute :>> ownerRole = "System integration"; attribute :>> safetyCritical = true;
        }
        part noSafeRecoveryRoute : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-014"; attribute :>> intendedFunction = "Choose a safe fallback path";
            occurrence initiatingCause : Event { attribute :>> description = "Remaining motion, traffic or boundaries invalidate shore access."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.noSafeRecoveryRoute; ref occurrence :>> localEffect = exposure.OR_recoveryUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Geometric recovery checks do not establish rule compliance."; attribute :>> recommendedAction = "Exercise blocked routes, lost sensing and no safe transit without assuming motor use is safe."; attribute :>> ownerRole = "Recovery"; attribute :>> safetyCritical = true;
        }
        part recoveryTooLate : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-015"; attribute :>> intendedFunction = "Respond before separation is lost";
            occurrence initiatingCause : Event { attribute :>> description = "Detection, transition and recovery maneuver exceed available time."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.recoveryTooLate; ref occurrence :>> localEffect = exposure.OR_recoveryUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "End-to-end timing bounds are unmeasured."; attribute :>> recommendedAction = "Measure full transition latency and action effectiveness against the encounter deadline."; attribute :>> ownerRole = "Recovery"; attribute :>> safetyCritical = true;
        }
        part sharedPowerLoss : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-016"; attribute :>> intendedFunction = "Preserve independent safety power";
            occurrence initiatingCause : Event { attribute :>> description = "One bus, regulator, ingress path or wiring fault disables both responses."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.sharedPowerLoss; ref occurrence :>> localEffect = exposure.OR_primaryUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Independent health detection is unresolved."; attribute :>> recommendedAction = "Inject common faults and verify physical isolation across primary and recovery."; attribute :>> ownerRole = "Power/system"; attribute :>> safetyCritical = true;
        }
        part sharedComputeLoss : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDog::Architecture::missionContext.boat.control.collisionAvoidance;
            attribute :>> identifier = "AF-017"; attribute :>> intendedFunction = "Preserve independent decision paths";
            occurrence initiatingCause : Event { attribute :>> description = "Shared host, clock, network or software fault corrupts both responses."; }
            ref occurrence :>> cause = initiatingCause;
            ref occurrence :>> failureMode = exposure.sharedComputeLoss; ref occurrence :>> localEffect = exposure.OR_primaryUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "An independent monitoring path is unresolved."; attribute :>> recommendedAction = "Audit dependencies and inject frozen time, corrupt data and common reset."; attribute :>> ownerRole = "Compute/system"; attribute :>> safetyCritical = true;
        }
    }
    connection missedDetectionInitiation : Causation connect functional.missedDetection.initiatingCause to exposure.missedDetection;
    connection lateObservationInitiation : Causation connect functional.lateObservation.initiatingCause to exposure.lateObservation;
    connection falseOrSwappedTrackInitiation : Causation connect functional.falseOrSwappedTrack.initiatingCause to exposure.falseOrSwappedTrack;
    connection wrongClassificationInitiation : Causation connect functional.wrongClassification.initiatingCause to exposure.wrongClassification;
    connection wrongMotionPredictionInitiation : Causation connect functional.wrongMotionPrediction.initiatingCause to exposure.wrongMotionPrediction;
    connection wrongRuleAssessmentInitiation : Causation connect functional.wrongRuleAssessment.initiatingCause to exposure.wrongRuleAssessment;
    connection noFeasibleCommandInitiation : Causation connect functional.noFeasibleCommand.initiatingCause to exposure.noFeasibleCommand;
    connection unsafeCourtesyChangeInitiation : Causation connect functional.unsafeCourtesyChange.initiatingCause to exposure.unsafeCourtesyChange;
    connection steeringUnavailableInitiation : Causation connect functional.steeringUnavailable.initiatingCause to exposure.steeringUnavailable;
    connection sailControlUnavailableInitiation : Causation connect functional.sailControlUnavailable.initiatingCause to exposure.sailControlUnavailable;
    connection unobservedExecutionErrorInitiation : Causation connect functional.unobservedExecutionError.initiatingCause to exposure.unobservedExecutionError;
    connection unsafeAbortTransitionInitiation : Causation connect functional.unsafeAbortTransition.initiatingCause to exposure.unsafeAbortTransition;
    connection inadequateRecoveryObservationInitiation : Causation connect functional.inadequateRecoveryObservation.initiatingCause to exposure.inadequateRecoveryObservation;
    connection noSafeRecoveryRouteInitiation : Causation connect functional.noSafeRecoveryRoute.initiatingCause to exposure.noSafeRecoveryRoute;
    connection recoveryTooLateInitiation : Causation connect functional.recoveryTooLate.initiatingCause to exposure.recoveryTooLate;
    connection sharedPowerLossInitiation : Causation connect functional.sharedPowerLoss.initiatingCause to exposure.sharedPowerLoss;
    connection sharedComputeLossInitiation : Causation connect functional.sharedComputeLoss.initiatingCause to exposure.sharedComputeLoss;
    part concepts : FailureAnalysis::Review { ref part :>> system = BlueDog::Architecture::missionContext.boat; attribute :>> scopeReviewed = false;
        part fixedAngularGap : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::fixedHighResolution; attribute :>> identifier = "ACF-001";
            attribute :>> intendedFunction = "SC-01 / SC-02: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::fixedAngularGap; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Map installed coverage through rig trim, heel and target elevation; test seam crossings."; attribute :>> ownerRole = "Optical installation"; attribute :>> safetyCritical = true;
        }
        part fixedStaleFrames : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::fixedGlobalShutter; attribute :>> identifier = "ACF-002";
            attribute :>> intendedFunction = "SC-01 / SC-02: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::fixedStaleFrames; ref occurrence :>> failureMode = exposure.lateObservation; ref occurrence :>> localEffect = exposure.lateObservation; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Inject frozen images and capture/processing delay; verify end-to-end age, not receipt time."; attribute :>> ownerRole = "Perception/software"; attribute :>> safetyCritical = true;
        }
        part wetOptics : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::fixedHighResolution; attribute :>> identifier = "ACF-003";
            attribute :>> intendedFunction = "SC-01 / SC-02 / SC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::wetOptics; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Wet/glare/night trials; test degradation detection and safe admission limits."; attribute :>> ownerRole = "Optical installation"; attribute :>> safetyCritical = true;
        }
        part sharedHub : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::scanningCamera; attribute :>> identifier = "ACF-004";
            attribute :>> intendedFunction = "SC-01 / SC-02 / SC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::sharedHub; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Fault the hub/host and check isolation; do not credit camera count as independence."; attribute :>> ownerRole = "Compute/power"; attribute :>> safetyCritical = true;
        }
        part scannerJam : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::scanningCamera; attribute :>> identifier = "ACF-005";
            attribute :>> intendedFunction = "SC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::scannerJam; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Jam the drive; inject encoder disagreement and verify sector-age monitoring."; attribute :>> ownerRole = "Scanning installation"; attribute :>> safetyCritical = true;
        }
        part scannerRevisit : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::scanningCamera; attribute :>> identifier = "ACF-006";
            attribute :>> intendedFunction = "SC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::scannerRevisit; ref occurrence :>> failureMode = exposure.lateObservation; ref occurrence :>> localEffect = exposure.lateObservation; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Measure worst-case target revisit and track age during reversal and occupied turns."; attribute :>> ownerRole = "Scanning installation"; attribute :>> safetyCritical = true;
        }
        part scannerCable : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::scanningCamera; attribute :>> identifier = "ACF-007";
            attribute :>> intendedFunction = "SC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::scannerCable; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Wet-cycle the complete mount and cable path; demonstrate stall detection."; attribute :>> ownerRole = "Scanning installation"; attribute :>> safetyCritical = true;
        }
        part passiveQuiet : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogAcousticEquipment::passiveArray; attribute :>> identifier = "ACF-008";
            attribute :>> intendedFunction = "AC-01: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::passiveQuiet; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Retain nonacoustic coverage for quiet hazards; measure class-specific cue availability."; attribute :>> ownerRole = "Acoustics"; attribute :>> safetyCritical = true;
        }
        part passiveAmbiguous : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogAcousticEquipment::passiveArray; attribute :>> identifier = "ACF-009";
            attribute :>> intendedFunction = "AC-01: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::passiveAmbiguous; ref occurrence :>> failureMode = exposure.wrongMotionPrediction; ref occurrence :>> localEffect = exposure.wrongMotionPrediction; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Calibrate channel phase/geometry and test self-noise and multipath; do not infer range from amplitude."; attribute :>> ownerRole = "Acoustics"; attribute :>> safetyCritical = true;
        }
        part activeClutter : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogAcousticEquipment::multibeamForward; attribute :>> identifier = "ACF-010";
            attribute :>> intendedFunction = "AC-02 / AC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::activeClutter; ref occurrence :>> failureMode = exposure.missedDetection; ref occurrence :>> localEffect = exposure.missedDetection; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Measure target-class performance under bubbles, weeds, waves and bottom clutter."; attribute :>> ownerRole = "Acoustics"; attribute :>> safetyCritical = true;
        }
        part narrowBeamRevisit : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogAcousticEquipment::narrowBeamForward; attribute :>> identifier = "ACF-011";
            attribute :>> intendedFunction = "AC-02: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::narrowBeamRevisit; ref occurrence :>> failureMode = exposure.lateObservation; ref occurrence :>> localEffect = exposure.lateObservation; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Measure motion-aware coverage and revisit; reject stationary coverage assumptions."; attribute :>> ownerRole = "Acoustics"; attribute :>> safetyCritical = true;
        }
        part multibeamExtent : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogAcousticEquipment::multibeamForward; attribute :>> identifier = "ACF-012";
            attribute :>> intendedFunction = "AC-03: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::multibeamExtent; ref occurrence :>> failureMode = exposure.wrongMotionPrediction; ref occurrence :>> localEffect = exposure.wrongMotionPrediction; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Validate swept-volume estimates with above-water rider and line geometry."; attribute :>> ownerRole = "Acoustics/perception"; attribute :>> safetyCritical = true;
        }
        part invertedMount : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSensingEquipment::scanningCamera; attribute :>> identifier = "ACF-013";
            attribute :>> intendedFunction = "All concepts: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::invertedMount; ref occurrence :>> failureMode = exposure.inadequateRecoveryObservation; ref occurrence :>> localEffect = exposure.inadequateRecoveryObservation; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Demonstrate upright/inverted installed geometry and independent recovery sensing."; attribute :>> ownerRole = "System integration"; attribute :>> safetyCritical = true;
        }
        part wingDriveJam : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSailTrade::camberedWing; attribute :>> identifier = "ACF-014";
            attribute :>> intendedFunction = "Rigid-wing alternatives: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::wingDriveJam; ref occurrence :>> failureMode = exposure.sailControlUnavailable; ref occurrence :>> localEffect = exposure.sailControlUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Compare direct-drive and tail-controlled failure positions; verify load limiting and remaining steering."; attribute :>> ownerRole = "Rig/control"; attribute :>> safetyCritical = true;
        }
        part softSailSheetJam : FailureAnalysis::ReviewRow subsets modes {
            ref part :>> affected = BlueDogSailTrade::softSail; attribute :>> identifier = "ACF-015";
            attribute :>> intendedFunction = "Soft-sail alternative: preserve the credited observation or maneuver capability";
            ref occurrence :>> cause = BlueDogAvoidanceFailures::softSailSheetJam; ref occurrence :>> failureMode = exposure.sailControlUnavailable; ref occurrence :>> localEffect = exposure.sailControlUnavailable; ref occurrence :>> missionEffect = exposure.AND_safeSeparationUnsupported;
            attribute :>> proposedDetection = "Proposed diagnostics and degraded behavior require installed evidence.";
            attribute :>> recommendedAction = "Inject sheet jams and adverse trim; measure residual maneuver authority."; attribute :>> ownerRole = "Rig/control"; attribute :>> safetyCritical = true;
        }
    }
    dependency missedDetectionCriterion from functional::missedDetection to BlueDogRequirements::trafficSafety;
    dependency lateObservationCriterion from functional::lateObservation to BlueDogRequirements::trafficSafety;
    dependency falseOrSwappedTrackCriterion from functional::falseOrSwappedTrack to BlueDogRequirements::trafficSafety;
    dependency wrongClassificationCriterion from functional::wrongClassification to BlueDogRequirements::trafficSafety;
    dependency wrongMotionPredictionCriterion from functional::wrongMotionPrediction to BlueDogRequirements::trafficSafety;
    dependency wrongRuleAssessmentCriterion from functional::wrongRuleAssessment to BlueDogRequirements::trafficSafety;
    dependency noFeasibleCommandCriterion from functional::noFeasibleCommand to BlueDogRequirements::trafficSafety;
    dependency unsafeCourtesyChangeCriterion from functional::unsafeCourtesyChange to BlueDogRequirements::trafficSafety;
    dependency steeringUnavailableCriterion from functional::steeringUnavailable to BlueDogRequirements::trafficSafety;
    dependency sailControlUnavailableCriterion from functional::sailControlUnavailable to BlueDogRequirements::trafficSafety;
    dependency unobservedExecutionErrorCriterion from functional::unobservedExecutionError to BlueDogRequirements::trafficSafety;
    dependency unsafeAbortTransitionCriterion from functional::unsafeAbortTransition to BlueDogRequirements::trafficSafety;
    dependency inadequateRecoveryObservationCriterion from functional::inadequateRecoveryObservation to BlueDogRequirements::trafficSafety;
    dependency noSafeRecoveryRouteCriterion from functional::noSafeRecoveryRoute to BlueDogRequirements::trafficSafety;
    dependency recoveryTooLateCriterion from functional::recoveryTooLate to BlueDogRequirements::trafficSafety;
    dependency sharedPowerLossCriterion from functional::sharedPowerLoss to BlueDogRequirements::trafficSafety;
    dependency sharedComputeLossCriterion from functional::sharedComputeLoss to BlueDogRequirements::trafficSafety;
    dependency navigationDuties from functional::wrongRuleAssessment to GorgeChallenge::navigationRules;
    dependency courtesyPolicy from functional::unsafeCourtesyChange to BlueDogDesignDecisions::trafficCourtesy;
    dependency fallbackPolicy from functional::unsafeAbortTransition to GorgeChallenge::safetyCapabilityAbort;
    dependency starterLink from functional to BlueDogDFMEA::starter::trafficMiss;
    occurrence OR_fixedObservationUnavailable : OrGate { doc /* Conditional branch for SC-01 or SC-02 only; other concepts are alternatives, not installed backups. No physical failure rates or safeguards are credited. */ attribute :>> description = "Required concept observation or cue unavailable within the response interval"; ref occurrence :>> inputs = (fixedAngularGap, fixedStaleFrames, wetOptics, sharedHub); }
    connection OR_fixedObservationUnavailable_0 : Causation connect fixedAngularGap to OR_fixedObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_fixedObservationUnavailable_1 : Causation connect fixedStaleFrames to OR_fixedObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_fixedObservationUnavailable_2 : Causation connect wetOptics to OR_fixedObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_fixedObservationUnavailable_3 : Causation connect sharedHub to OR_fixedObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    occurrence <'Scanner observation unavailable'> OR_scannerObservationUnavailable : OrGate { doc /* Conditional branch for SC-03 only; other concepts are alternatives, not installed backups. No physical failure rates or safeguards are credited. */ attribute :>> description = "Required concept observation or cue unavailable within the response interval"; ref occurrence :>> inputs = (scannerJam, scannerRevisit, scannerCable, wetOptics, sharedHub); }
    connection OR_scannerObservationUnavailable_0 : Causation connect scannerJam to OR_scannerObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_scannerObservationUnavailable_1 : Causation connect scannerRevisit to OR_scannerObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_scannerObservationUnavailable_2 : Causation connect scannerCable to OR_scannerObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_scannerObservationUnavailable_3 : Causation connect wetOptics to OR_scannerObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_scannerObservationUnavailable_4 : Causation connect sharedHub to OR_scannerObservationUnavailable { metadata CausationMetadata { isSufficient = true; } }
    occurrence OR_passiveCueUnavailable : OrGate { doc /* Conditional branch for AC-01 only; other concepts are alternatives, not installed backups. No physical failure rates or safeguards are credited. */ attribute :>> description = "Required concept observation or cue unavailable within the response interval"; ref occurrence :>> inputs = (passiveQuiet, passiveAmbiguous, invertedMount); }
    connection OR_passiveCueUnavailable_0 : Causation connect passiveQuiet to OR_passiveCueUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_passiveCueUnavailable_1 : Causation connect passiveAmbiguous to OR_passiveCueUnavailable { metadata CausationMetadata { isSufficient = true; } }
    connection OR_passiveCueUnavailable_2 : Causation connect invertedMount to OR_passiveCueUnavailable { metadata CausationMetadata { isSufficient = true; } }
    dependency fixedAngularGap_fixedGlobalShutter from concepts::fixedAngularGap to BlueDogSensingEquipment::fixedGlobalShutter;
    dependency wetOptics_fixedGlobalShutter from concepts::wetOptics to BlueDogSensingEquipment::fixedGlobalShutter;
    dependency wetOptics_scanningCamera from concepts::wetOptics to BlueDogSensingEquipment::scanningCamera;
    dependency sharedHub_fixedHighResolution from concepts::sharedHub to BlueDogSensingEquipment::fixedHighResolution;
    dependency sharedHub_fixedGlobalShutter from concepts::sharedHub to BlueDogSensingEquipment::fixedGlobalShutter;
    dependency activeNarrowScope from concepts::activeClutter to BlueDogAcousticEquipment::narrowBeamForward;
    dependency wingTailScope from concepts::wingDriveJam to BlueDogSailTrade::tailWing;
    dependency inverted_fixedHighResolution from concepts::invertedMount to BlueDogSensingEquipment::fixedHighResolution;
    dependency inverted_fixedGlobalShutter from concepts::invertedMount to BlueDogSensingEquipment::fixedGlobalShutter;
    dependency inverted_passiveArray from concepts::invertedMount to BlueDogAcousticEquipment::passiveArray;
    dependency inverted_narrowBeamForward from concepts::invertedMount to BlueDogAcousticEquipment::narrowBeamForward;
    dependency inverted_multibeamForward from concepts::invertedMount to BlueDogAcousticEquipment::multibeamForward;
}
