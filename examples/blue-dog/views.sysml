package SyspresentBlueDogViews {
    private import DocumentQueries::*;
    private import StandardViewDefinitions::*;
    calc def AvoidanceRequirements :> Query {
        doc /* Read the system-level traffic obligations before their detailed acceptance outcomes. */
        Project(source = Named(qualifiedName = ("BlueDogRequirements::TrafficSafety", "BlueDogRequirements::NavigationConspicuity")), columns = (
            Column(name = "ID", path = "shortName"),
            Column(name = "Requirement", path = "name"),
            Column(name = "Statement", path = "documentation")))
    }
    calc def ChallengeRequirements :> Query {
        Project(source = Named(qualifiedName = ("GorgeChallenge::EmergencyIntervention", "GorgeChallenge::NavigationRules", "GorgeChallenge::TrafficCoexistence", "GorgeChallenge::SafetyCapabilityAbort", "GorgeChallenge::AutonomousShoreRecovery")), columns = (
            Column(name = "ID", path = "shortName"),
            Column(name = "Requirement", path = "name"),
            Column(name = "Statement", path = "documentation")))
    }
    calc def TrafficDetails :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRequirements::TrafficTracking", "BlueDogRequirements::CollisionAssessmentCadence", "BlueDogRequirements::AvoidanceCommandDeadline", "BlueDogRequirements::TrafficAwarenessFault")), columns = (
            Column(name = "ID", path = "shortName"),
            Column(name = "Requirement", path = "name"),
            Column(name = "Statement", path = "documentation")))
    }
    calc def RecoveryRequirements :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRequirements::SafeRecovery", "BlueDogRequirements::RecoveryPropulsion", "BlueDogRequirements::RecoveryEnergy")), columns = (
            Column(name = "ID", path = "shortName"),
            Column(name = "Requirement", path = "name"),
            Column(name = "Statement", path = "documentation")))
    }
    calc def RecoveryDetails :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRequirements::AbortLatchDeadline", "BlueDogRequirements::RecoveryTelemetryCadence", "BlueDogRequirements::MotorIsolationDeadline", "BlueDogRequirements::IsolationRestartInhibition", "BlueDogRequirements::ManualControlLossShutdown")), columns = (
            Column(name = "ID", path = "shortName"),
            Column(name = "Requirement", path = "name"),
            Column(name = "Statement", path = "documentation")))
    }
    view ChallengeDerivation : GridView {
        filter @SysML::ConnectionUsage;
        expose BlueDogRequirements::challengeTrafficResponse;
        expose BlueDogRequirements::challengeNavigationSignals;
    }
    view RecoveryDerivation : GridView {
        filter @SysML::ConnectionUsage or @SysML::Dependency;
        expose BlueDogRequirements::deriveSafeRecovery;
        expose BlueDogRequirements::deriveRecoveryPropulsion;
        expose BlueDogRequirements::deriveRecoveryEnergy;
    }
    view RecoveryAcceptance : GridView {
        filter @SysML::ConnectionUsage or @SysML::Dependency;
        expose BlueDogRequirements::decomposeAbortLatchDeadline;
        expose BlueDogRequirements::decomposeRecoveryTelemetryCadence;
        expose BlueDogRequirements::decomposeMotorIsolationDeadline;
        expose BlueDogRequirements::decomposeIsolationRestartInhibition;
        expose BlueDogRequirements::decomposeManualControlLossShutdown;
    }
    view TrafficAcceptance : GridView {
        filter @SysML::ConnectionUsage;
        expose BlueDogRequirements::decomposeTrafficTracking;
        expose BlueDogRequirements::decomposeCollisionAssessmentCadence;
        expose BlueDogRequirements::decomposeAvoidanceCommandDeadline;
        expose BlueDogRequirements::decomposeTrafficAwarenessFault;
    }
}
