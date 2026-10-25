package BlueDogBehaviorContracts {
    private import ScalarValues::*;
    private import ISQ::*;
    private import ModelingMetadata::refinement;
    doc /* Partial executable consumer contracts for the current Gorge mission.
     * NASA SE Handbook 4.3.1.2.2 and defense SE Guidebook 2026 section 6.2.3
     * inform end-to-end functions/allocation; SysML 2.0 sections 7.17-7.18
     * govern action semantics. Actual outcomes follow the named requirements.
     * No hardware scheduler, synchronized clock or durable storage is inferred. */

    action def AssessObservationUsability {
        in producerValid : Boolean [1];
        in contextApplicable : Boolean [1];
        in clockEstablished : Boolean [1];
        in observedAt : TimeValue [1];
        in now : TimeValue [1];
        in maximumAge : TimeValue [1];
        out usable : Boolean [1];
        first start;
        then action assess {
            assign usable := BlueDogInterfaceContracts::ObservationUsable(
                producerValid,contextApplicable,clockEstablished,observedAt,now,maximumAge);
        }
        then done;
    }
    action def SailingActuationGate {
        doc /* Evaluate immediately before dispatch against current observations
         * and permission, not only at command creation. Boolean applicability
         * inputs are assessed using the interface contracts; they are not defaults. */
        in commandApplicable : Boolean [1];
        in permissionApplicable : Boolean [1];
        in sailingPermitted : Boolean [1];
        in abortLatched : Boolean [1];
        in qualificationLost : Boolean [1];
        in capsized : Boolean [1];
        in windUsable : Boolean [1];
        in navigationUsable : Boolean [1];
        in requiredSafetyConfirmed : Boolean [1];
        out actuate : Boolean [1];
        first start;
        then action gate {
            assign actuate := commandApplicable and permissionApplicable and sailingPermitted
                and not abortLatched and not qualificationLost and not capsized
                and windUsable and navigationUsable and requiredSafetyConfirmed;
        }
        then done;
    }
    action def RecoveryActuationGate {
        doc /* R-101 inhibits motor thrust while qualifying or status unknown.
         * E-138 requires durable disqualification before commanded motor enable.
         * R-102 requires established recovery authorization after restart.
         * Abort is intentionally not a motor inhibit: recovery follows abort. */
        in recoveryRequested : Boolean [1];
        in commandApplicable : Boolean [1];
        in recoveryAuthorized : Boolean [1];
        in qualificationStateKnown : Boolean [1];
        in qualifying : Boolean [1];
        in disqualificationStored : Boolean [1];
        in recoveryPathAvailable : Boolean [1];
        in inhibitActive : Boolean [1];
        out motorEnable : Boolean [1];
        first start;
        then action gate {
            assign motorEnable := recoveryRequested and commandApplicable and recoveryAuthorized
                and qualificationStateKnown and not qualifying and disqualificationStored
                and recoveryPathAvailable and not inhibitActive;
        }
        then done;
    }
    action def RestoreQualification {
        doc /* Explicit restart assessment, distinct from constructing a new
         * attempt. E-139/E-145 require nonqualifying fallback for missing or
         * inconsistent persisted state. A live disqualification cannot be erased
         * by restoring an older record. Persistence and the 30 s restoration
         * deadline still need an actual storage/restart implementation. */
        in recordValid : Boolean [1];
        in persistedQualificationLost : Boolean [1];
        in currentQualificationLost : Boolean [1];
        out qualificationLostNext : Boolean [1];
        first start;
        then action restore {
            assign qualificationLostNext := currentQualificationLost or not recordValid or persistedQualificationLost;
        }
        then done;
    }
    action navigationValidation : AssessObservationUsability;
    action sailingGate : SailingActuationGate;
    action recoveryGate : RecoveryActuationGate;
    action restartQualification : RestoreQualification;
    allocate navigationValidation to BlueDogLogicalArchitecture::vessel.navigation;
    allocate sailingGate to BlueDogLogicalArchitecture::vessel.actuation;
    allocate recoveryGate to BlueDogLogicalArchitecture::vessel.recoveryActuation;
    allocate restartQualification to BlueDogLogicalArchitecture::vessel.supervision;
    #refinement dependency navigationAssessment from AssessObservationUsability to BlueDogMethod::Scenarios::ValidateNavigation;
    #refinement dependency sailingAssessment from SailingActuationGate to BlueDogMethod::Scenarios::ApplySailingCommand;
    #refinement dependency recoveryAssessment from RecoveryActuationGate to BlueDogMethod::Scenarios::ApplyRecoveryCommand;
    dependency motorInvariant from RecoveryActuationGate to BlueDogRequirements::motorQualificationInvariant;
    dependency durableAuthorization from RecoveryActuationGate to BlueDogRequirements::qualificationPersistence;
    dependency freshAuthorization from RecoveryActuationGate to BlueDogRequirements::freshRecoveryCommand;
    dependency restorationPolicy from RestoreQualification to BlueDogRequirements::qualificationRestoration;
    dependency unknownFallback from RestoreQualification to BlueDogRequirements::unknownQualificationFallback;
    metadata issue : ModelingMetadata::Issue {
        text = "B-01: Bind installed message contexts to usability, current permissions and consumer gates; scalar conceptual simulations do not implement serialization. B-02: Demonstrate atomic durable state, acknowledgment ordering, all restriction restoration and restart deadlines on selected hardware. B-03: Resolve controller concurrency, command arbitration, resource ownership and timeout budgets, including abort during capsize/recovery. B-04: Implement and measure estimators, achieved actuation and repeated dynamic recovery; descriptive scenarios do not prove these functions.";
    }
}
