package BlueDogCoupledOperation {
    private import ScalarValues::*;
    public import MarineSailing::*;
    public import MarineStructures::*;
    public import MarineCourse::*;
    doc /* Quasi-steady force balance. VSPAERO supplies inviscid CL/CDi/CMy;
     * discrepancy factors and viscous drag remain provisional model inputs.
     * Hydrostatic heave/pitch and mast-trim geometry are external geometry solves.
     * No wave-motion, dynamic planing, separated-flow or dynamic recovery claim. */
    analysis Inputs {
        doc /* Named numerical roles for the finite-voyage search. Residuals are
         * normalized by the sailing calculations; nonnegative margins pass.
         * Daily energy balance is diagnostic, not a Gorge constraint. */
        out attribute equilibriumOutputs : String [4] ordered nonunique = ("surgeResidual", "swayResidual", "yawResidual", "rollResidual");
        out attribute staticMarginOutputs : String [11] ordered nonunique = ("wingLiftMargin", "keelLiftMargin", "rudderLiftMargin", "keelAngleMargin", "rudderAngleMargin", "wingDriveMargin", "rudderDriveMargin", "froudeMargin", "wingReMargin", "keelReMargin", "rudderReMargin");
        out attribute peakMarginOutput : String = "peakMargin";
        out attribute resistanceMarginOutputs : String [19] ordered nonunique = ("delftResistanceMargin", "delftDomain4", "delftDomain5", "delftDomain6", "delftDomain7", "delftDomain8", "delftDomain9", "delftDomain10", "delftDomain11", "delftDomain12", "delftDomain13", "delftDomain14", "delftDomain15", "delftDomain16", "delftDomain17", "delftDomain18", "delftDomain19", "delftDomain20", "delftDomain21");
        out attribute maximumOverallLengthM : Real = GorgeChallenge::maximumOverallLength / (1 [SI::m]);
        out attribute challengeRequiresEastProgress : Boolean = BlueDogWeather::policy.challengeRequiresEastProgress;
        out attribute allSeasonRequiresEastProgress : Boolean = BlueDogWeather::policy.allSeasonRequiresEastProgress;
        out attribute windSpeeds : Real [2] ordered nonunique = BlueDogStudyPlan::operatingCoverage.windSpeeds;
        out attribute stateLower : Real [6] ordered nonunique = BlueDogStudyPlan::operatingCoverage.stateLower;
        out attribute stateUpper : Real [6] ordered nonunique = BlueDogStudyPlan::operatingCoverage.stateUpper;
        out attribute leewardHeading : Real [2] ordered nonunique = BlueDogStudyPlan::operatingCoverage.leewardHeading;
        out attribute coarseTrims : Real [2] ordered nonunique = BlueDogStudyPlan::operatingCoverage.coarseTrims;
        out attribute coarseHeels : Real [8] ordered nonunique = BlueDogStudyPlan::operatingCoverage.coarseHeels;
        out attribute recoveryTrims : Real [4] ordered nonunique = BlueDogStudyPlan::operatingCoverage.recoveryTrims;
        out attribute recoveryDensities : Real [2] ordered nonunique = BlueDogStudyPlan::operatingCoverage.recoveryDensities;
        out attribute recoveryHeels : Real [3] ordered nonunique = BlueDogStudyPlan::operatingCoverage.recoveryHeels;
        out attribute progressSearchReserve : Real = BlueDogStudyPlan::operatingCoverage.progressSearchReserve;

        doc /* Search brackets are numerical/domain limits, not new vessel requirements.
         * Aspect/camber are limited by the VSPAERO interpolation grid; thickness
         * remains a geometric sensitivity without validated viscous-drag response. */
        out attribute designLower : Real [29] ordered nonunique = MarineDesign::DesignVector(BlueDogConfigurations::lowerBracket);
        out attribute designUpper : Real [29] ordered nonunique = MarineDesign::DesignVector(BlueDogConfigurations::upperBracket);
        doc /* Search-only mesh-resolution reserves, not vessel requirements.
         * Raw native domain margins remain unchanged for independent replay.
         * Cp and B/L reserves exceed the observed resolution-12 to -16 shifts
         * (0.00175 and 0.00271); remaining non-invariant coordinates receive
         * provisional numerical reserves and still require finer validation.
         * Order: positive resistance, Fn low/high, LCB low/high, Cp low/high,
         * volume/area low/high, B/L low/high, LCB/LCF low/high,
         * volume/length low/high, Cm low/high, B/T low/high. */
        // Search-only mesh/replay reserve: cycleMargin is daily net Wh / 100.
        // 0.005 therefore reserves 0.5 Wh/day; it is not a physical uncertainty allowance.
        out attribute cycleEnergySearchReserve : Real = 0.005;
        out attribute resistanceDomainReserve : Real [19] ordered nonunique = (0,0.002,0.004,0,0,0.003,0.003,0.003,0.003,0.004,0.004,0,0,0.002,0.002,0.002,0.002,0.15,0.15);
        out attribute routeParameters : Real [7] ordered nonunique = (0.95,0.5,1.0,TransGorgeCourse::policy.referenceLegLengthM,0,0.5,1.0);
        out attribute structureValues : Real [12] ordered nonunique = (BlueDogStructure::material.laminateModulus, BlueDogStructure::material.laminateAllowable, BlueDogStructure::material.pressure, BlueDogStructure::material.tipProofForce, BlueDogStructure::material.minimumFreeboard, BlueDogStructure::material.reserveFraction, BlueDogStructure::material.launchDepth-BlueDogStructure::material.bottomClearance, BlueDogStructure::material.appendageDeflectionFraction, BlueDogStructure::material.hullDeflectionFraction, BlueDogStructure::material.panelDeflectionFraction, BlueDogConceptCredibility::policy.minimumUnderwaterAspectRatio, BlueDogConceptCredibility::policy.appendageClearanceM);
    }

    dependency sustained from Evaluate to BlueDogRequirements::sustainedEnergyFeasibility;
    dependency progress from Evaluate to BlueDogRequirements::legProgress;
    dependency control from Evaluate to BlueDogRequirements::capsizeControlRecovery;

    dependency strength from DesignMargins to BlueDogStructure::structuralIntegrity;
    dependency handling from DesignMargins to BlueDogRequirements::liftMass;


    dependency routeProgress from Route to BlueDogRequirements::legProgress;
    dependency routeTime from Route to BlueDogRequirements::passageDuration;
}
