package BlueDogMissionLogic {
    private import ScalarValues::*;

    doc /* Executable supervisory policy for the conceptual mission simulator.
     * Geometry, sensing observations, heading search and vessel dynamics are supplied
     * by the simulator. These actions do not implement a physical autopilot.
     */
    action def HandleEvent {
        in eventKind : String;
        out directive : String;
        out capsized : Boolean;
        out recoveryPermitted : Boolean;
        first start;
        then action classify {
            assign directive :=
                if eventKind == "operator_intervention" or eventKind == "manual_weather_update" or eventKind == "motor_use" ? "disqualify"
                else if eventKind == "communications_loss" ? "communications_outage"
                else if eventKind == "weather_service_loss" ? "retain_forecast"
                else if eventKind == "wind_sensor_loss" ? "wind_outage"
                else if eventKind == "capsize" or eventKind == "unassisted_righting" ? "assess_capsize"
                else if eventKind == "forecast_invalidated" or eventKind == "sensing_loss" or eventKind == "steering_loss" or eventKind == "power_loss" or eventKind == "safety_capability_loss" or eventKind == "refuge_entry" or eventKind == "grounding" or eventKind == "anchoring" or eventKind == "shore_attachment" ? "abort"
                else if eventKind == "terminal_failure" ? "stop"
                else "unsupported";
            assign capsized := eventKind == "capsize";
            assign recoveryPermitted := eventKind == "sensing_loss" or eventKind == "forecast_invalidated" or eventKind == "safety_capability_loss" or eventKind == "capsize";
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
        out directive : String;
        first start;
        then action assess {
            assign directive := if abortLatched or not requiredSafetyConfirmed ? "abort"
                else if uprightRecoveryObserved and not currentlyCapsized ? "invalid_observation"
                else if uprightRecoveryObserved ? "resume"
                else "await_righting";
        }
        then done;
    }
    dependency capsizeQualification from CapsizeDisposition to BlueDogRequirements::capsizeQualificationRetention;

    action def SupervisoryCycle {
        in windValid : Boolean;
        in trafficConflict : Boolean;
        in abortRequested : Boolean;
        in abortLatched : Boolean;
        in communicationsAvailable : Boolean;
        out abortLatchedNext : Boolean;
        out sailingPermitted : Boolean;
        out mode : String;
        out alert : String;
        first start;
        then action chooseMode {
            assign abortLatchedNext := abortLatched or abortRequested;
            assign sailingPermitted := windValid and not (abortLatched or abortRequested);
            assign mode := if abortLatched or abortRequested ? "abort_recovery"
                else if not windValid ? "degraded_drift"
                else if trafficConflict ? "traffic_avoidance"
                else "sailing";
            assign alert := if not abortRequested or abortLatched ? "none"
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
    allocate supervisor to BlueDog::Architecture::missionContext.boat.control.missionManager;
}
