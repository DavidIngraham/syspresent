package SyspresentBlueDogViews {
    private import DocumentQueries::*;
    calc def AvoidanceRequirements :> Query {
        doc /* Read the two opening obligations before exploring their wider traces. */
        Project(source = Named(qualifiedName = ("BlueDogRequirements::TrafficSafety", "BlueDogRequirements::TrafficTracking")), columns = (
            Column(name = "ID", path = "shortName"),
            Column(name = "Requirement", path = "name"),
            Column(name = "Statement", path = "documentation")))
    }
}
