package BlueDogStudyPlan {
    private import ScalarValues::*;
    part operatingCoverage {
        doc /* Numerical operating coverage, not a new environmental requirement.
         * Eight cases combine two winds, windward/leeward travel and both tacks.
         * State order: speed m/s, true-wind angle, incidence, leeway, rudder, heel;
         * all angles degrees, represented on positive tack and reflected in Python.
         * Incidence coverage is constrained by the recorded aerodynamic grid. */
        attribute windSpeeds : Real [2] ordered = (5, 8);
        attribute stateLower : Real [6] ordered nonunique = (0.2,20,BlueDogAerodynamicPolicy::sizing.incidenceLowDeg,-12,-25,-BlueDogAerodynamicPolicy::sizing.heelLimitDeg);
        attribute stateUpper : Real [6] ordered nonunique = (5,88,BlueDogAerodynamicPolicy::sizing.incidenceHighDeg,12,25,BlueDogAerodynamicPolicy::sizing.heelLimitDeg);
        attribute leewardHeading : Real [2] ordered = (95,175);
        attribute progressSearchReserve : Real = 0.005;
        attribute coarseTrims : Real [2] ordered = (0,90);
        attribute coarseHeels : Real [8] ordered = (-175,-150,-90,-15,15,90,150,175);
        attribute recoveryTrims : Real [4] ordered = (0,90,180,270);
        attribute recoveryDensities : Real [2] ordered = (1000,1025);
        attribute recoveryHeels : Real [3] ordered = (-180,180,49);
        metadata rationale : ModelingMetadata::Rationale { text = "Paired tacks expose the fixed-camber wing asymmetry. Numerical brackets bound a local solve; they do not establish optimality beyond the search domain. Coarse restoring samples screen the search; full-roll free-pitch replay and freshwater/seawater ingress cases assess the candidate. The progress reserve is a mesh allowance, not a physical safety margin."; }
    }
    dependency operatingPurpose from operatingCoverage to BlueDogRequirements::cruiseEvidence;
    dependency recoveryPurpose from operatingCoverage to BlueDogRequirements::selfRighting;
    dependency uncertaintyBasis from operatingCoverage to BlueDogDesignDecisions::uncertaintyPolicy;
}
