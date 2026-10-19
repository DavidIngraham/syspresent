package BlueDogCanvasViews {
    private import StandardViewDefinitions::*;

    view challengeTraffic : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose GorgeChallenge::trafficCoexistence;
        expose BlueDogRequirements::trafficSafety;
    }
    view trafficDerivation : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::trafficSafety;
        expose BlueDogRequirements::trafficTracking;
        expose BlueDogRequirements::collisionAssessmentCadence;
        expose BlueDogRequirements::avoidanceCommandDeadline;
        expose BlueDogRequirements::trafficAwarenessFault;
    }
    view recoveryBasis : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::safeRecovery;
        expose BlueDogRequirements::recoveryPropulsion;
        expose BlueDogRequirements::recoveryEnergy;
    }
    view capsizeQualification : GeneralView {
        @OpenSysMLRenderings::RequirementContext { relationshipDepth = 0; }
        filter @SysML::RequirementUsage;
        expose BlueDogRequirements::capsizeControlRecovery;
        expose BlueDogRequirements::capsizeQualificationRetention;
    }
    view capsizeDecision : ActionFlowView {
        expose BlueDogMissionLogic::CapsizeDisposition;
    }
    view supervisorDecision : ActionFlowView {
        expose BlueDogMissionLogic::SupervisoryCycle;
    }
}
