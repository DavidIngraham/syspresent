package SyspresentBlueDogViews {
    private import StandardViewDefinitions::*;
    view avoidanceRequirements : GeneralView {
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::trafficSafety;
        expose BlueDogRequirements::trafficTracking;
        expose BlueDogRequirements::criticalFailureDisposition;
        expose BlueDogRequirements::capsizeQualificationRetention;
        expose GorgeChallenge::safetyCapabilityAbort;
        expose GorgeChallenge::autonomousShoreRecovery;
    }
}
