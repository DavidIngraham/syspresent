package BlueDogMissionLogic {
    private import ScalarValues::*;
    private import ModelingMetadata::refinement;

    doc /* Executable supervisory policy for the conceptual mission simulator.
     * Geometry, sensing observations, heading search and vessel dynamics are supplied
     * by the simulator. These actions do not implement a physical autopilot.
     */
    action def HandleEvent {
        in eventKind : String;
        in qualificationLost : Boolean = false;
        out directive : String;
        out capsized : Boolean;
        out recoveryPermitted : Boolean;
        out qualificationLostNext : Boolean;
        first start;
        then action classify {
            assign directive :=
                if eventKind == "operator_intervention" or eventKind == "manual_weather_update" or eventKind == "motor_use" ? "disqualify"
                else if eventKind == "communications_loss" ? "communications_outage"
                else if eventKind == "weather_service_loss" ? "retain_forecast"
                else if eventKind == "wind_sensor_loss" ? "wind_outage"
                else if eventKind == "navigation_loss" ? "navigation_outage"
                else if eventKind == "capsize" or eventKind == "unassisted_righting" ? "assess_capsize"
                else if eventKind == "forecast_invalidated" or eventKind == "sensing_loss" or eventKind == "steering_loss" or eventKind == "power_loss" or eventKind == "safety_capability_loss" or eventKind == "refuge_entry" or eventKind == "grounding" or eventKind == "anchoring" or eventKind == "shore_attachment" ? "abort"
                else if eventKind == "terminal_failure" ? "stop"
                else "unsupported";
            assign capsized := eventKind == "capsize";
            assign recoveryPermitted := eventKind == "sensing_loss" or eventKind == "forecast_invalidated" or eventKind == "safety_capability_loss" or eventKind == "capsize";
            assign qualificationLostNext := qualificationLost or directive == "disqualify" or directive == "abort";
        }
        then done;
    }

    action def CapsizeDisposition {
        doc /* Explicit observation contract, not a righting dynamics prediction.
         * Safety must remain available while inverted. Resumption additionally
         * requires observed unassisted upright recovery and restored control.
         * Missing safety evidence fails closed; a prior abort cannot be cleared. */
        in currentlyCapsized : Boolean;
        in uprightRecoveryObserved : Boolean;
        in requiredSafetyConfirmed : Boolean;
        in abortLatched : Boolean;
        in qualificationLost : Boolean = false;
        out directive : String;
        out qualificationLostNext : Boolean;
        first start;
        then action assess {
            assign directive := if abortLatched or qualificationLost or not requiredSafetyConfirmed ? "abort"
                else if uprightRecoveryObserved and not currentlyCapsized ? "invalid_observation"
                else if uprightRecoveryObserved ? "resume"
                else "await_righting";
            assign qualificationLostNext := qualificationLost or abortLatched or not requiredSafetyConfirmed;
        }
        then done;
    }
    dependency capsizeQualification from CapsizeDisposition to BlueDogRequirements::capsizeQualificationRetention;
    #refinement dependency capsizeScenarioPolicy from CapsizeDisposition to BlueDogMethod::Scenarios::AssessCapsizeContinuation;

    action def SupervisoryCycle {
        doc /* A nominal upright cycle assumes valid observations supplied by its caller.
         * Inversion or invalid primary navigation requires explicit confirmation of
         * retained safety capability. Qualification and safety abort are distinct
         * persistent states: intervention ends qualification even without a casualty.
         * The caller supplies geometry and energy assessments; this action owns the
         * response permissions. It does not predict righting or verify hardware. */
        in windValid : Boolean;
        in navigationValid : Boolean = true;
        in capsized : Boolean = false;
        in requiredSafetyConfirmed : Boolean;
        in reserveThreatened : Boolean = false;
        in trafficConflict : Boolean;
        in abortRequested : Boolean;
        in abortLatched : Boolean;
        in qualificationLost : Boolean = false;
        in communicationsAvailable : Boolean;
        out abortLatchedNext : Boolean;
        out qualificationLostNext : Boolean;
        out sailingPermitted : Boolean;
        out gateScoringPermitted : Boolean;
        out harvestPermitted : Boolean;
        out mode : String;
        out alert : String;
        first start;
        then action chooseMode {
            assign abortLatchedNext := abortLatched or abortRequested or reserveThreatened or not requiredSafetyConfirmed;
            assign qualificationLostNext := qualificationLost or abortLatchedNext;
            assign sailingPermitted := windValid and navigationValid and not capsized and not qualificationLostNext;
            assign gateScoringPermitted := navigationValid and not capsized and not qualificationLostNext;
            assign harvestPermitted := not capsized;
            assign mode := if abortLatchedNext ? "abort_recovery"
                else if qualificationLostNext ? "disqualified"
                else if capsized ? "capsized_drift"
                else if not navigationValid ? "navigation_degraded"
                else if not windValid ? "degraded_drift"
                else if trafficConflict ? "traffic_avoidance"
                else "sailing";
            assign alert := if not abortLatchedNext or abortLatched ? "none"
                else if communicationsAvailable ? "attempt" else "queue";
        }
        then done;
    }

    action def RecoveryAuthority {
        in eventKind : String;
        in ordinaryPermission : Boolean;
        in independentPath : Boolean;
        out permitted : Boolean;
        first start;
        then action chooseAuthority {
            assign permitted := ordinaryPermission or (independentPath and (eventKind == "steering_loss" or eventKind == "power_loss"));
        }
        then done;
    }
    action def FallbackPolicy {
        in recoveryAvailable : Boolean;
        in recoveryPermitted : Boolean;
        out attemptRecovery : Boolean;
        out continueDrift : Boolean;
        first start;
        then action chooseFallback {
            assign attemptRecovery := recoveryAvailable and recoveryPermitted;
            assign continueDrift := not (recoveryAvailable and recoveryPermitted);
        }
        then done;
    }
    dependency fallbackBasis from FallbackPolicy to GorgeChallenge::autonomousShoreRecovery;

    dependency unassisted from HandleEvent to GorgeChallenge::unassistedAttempt;
    dependency propulsion from HandleEvent to GorgeChallenge::sailingPropulsion;
    dependency safeRecovery from SupervisoryCycle to GorgeChallenge::autonomousShoreRecovery;
    dependency normalScenario from SupervisoryCycle to BlueDogMethod::Scenarios::NormalSailing;
    dependency trafficScenario from SupervisoryCycle to BlueDogMethod::Scenarios::TrafficEncounter;
    dependency recoveryScenario from SupervisoryCycle to BlueDogMethod::Scenarios::AbortAndRecover;
    action supervisor : SupervisoryCycle;
    action capsizeDisposition : CapsizeDisposition;
    action recoveryAuthority : RecoveryAuthority;
    action fallback : FallbackPolicy;
    allocate recoveryAuthority to BlueDogLogicalArchitecture::vessel.recovery;
    allocate fallback to BlueDogLogicalArchitecture::vessel.recovery;
    dependency recoveryAuthorityScenario from RecoveryAuthority to BlueDogMethod::Scenarios::AbortAndRecover;
    dependency fallbackScenario from FallbackPolicy to BlueDogMethod::Scenarios::AbortAndRecover;
    allocate supervisor to BlueDogLogicalArchitecture::vessel.supervision;
    allocate capsizeDisposition to BlueDogLogicalArchitecture::vessel.supervision;
}
