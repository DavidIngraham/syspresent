package SyspresentBlueDogViews {
    private import StandardViewDefinitions::*;
    view avoidanceRequirements : GeneralView {
        doc /* Introduce the collision-avoidance obligation and its tracking requirement. A containment view keeps this opening scoped to these two declarations; the explorer supplies their wider requirement traces. */
        expose BlueDogRequirements::trafficSafety;
        expose BlueDogRequirements::trafficTracking;
    }
}
