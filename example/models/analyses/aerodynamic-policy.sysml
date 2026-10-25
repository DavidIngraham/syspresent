package BlueDogAerodynamicPolicy {
    private import ScalarValues::*;
    part sizing {
        doc /* Engineering assumptions for a restricted, attached-flow sizing case.
         * These are not measured confidence bounds or a demonstrated stall boundary.
         * Published crescent-wing tests establish method relevance, but their section,
         * Reynolds number and setup do not validate this CAD geometry. */
        attribute incidenceLowDeg : Real = -4;
        attribute incidenceHighDeg : Real = 8;
        attribute heelLimitDeg : Real = 20;
        attribute profileCd : Real = 0.04;
        attribute clLimit : Real = 0.9;
        attribute liftScale : Real = 0.7;
        attribute dragScale : Real = 1.4;
        attribute momentScale : Real = 1.4;
        metadata rationale : ModelingMetadata::Rationale { text = "Use the former adverse aerodynamic case for primary sizing. Restrict nominal incidence and heel to reduce reliance on separated flow and large spanwise inflow. The observed heel sensitivity motivates additional conservatism, not a universal calibrated correction. Moment uncertainty is independent of reduced lift credit so lower propulsion credit does not automatically reduce predicted actuator demand. All geometry variables remain free within their existing model brackets."; }
        metadata issue : ModelingMetadata::Issue { text = "Matched low-Re forward/reverse section measurements, measured pitching moments, finite-thickness effects, and heel-dependent full-grid validation remain missing. The retained cosine projection and uncertainty factors are provisional. A feasible solve establishes only feasibility under these assumptions."; }
    }
    part stress {
        attribute profileCd : Real = 0.06;
        attribute clLimit : Real = 0.8;
        attribute liftScale : Real = 0.55;
        attribute dragScale : Real = 1.6;
        metadata rationale : ModelingMetadata::Rationale { text = "An additional uncalibrated adverse hypothesis, not a probability distribution or a validated worst case. Re-solve controls at the selected geometry to expose remaining sensitivity."; }
    }
    analysis convergenceInputs {
        out attribute aspect : Real = 4;
        out attribute camber : Real = 1;
        out attribute meshes : Integer [3] ordered = (24,48,72);
        out attribute wakeIterations : Integer [3] ordered = (5,15,30);
        out attribute absoluteTolerance : Real [3] ordered = (0.03,0.01,0.02);
        doc /* Compare CL, induced CD and CMy over nominal incidence -4..8 degrees.
         * Crossed mesh/wake checks on both chord directions. Engineering numerical
         * screening tolerances only; passing does not establish physical validity. */
    }
    dependency supports from sizing to BlueDogRequirements::cruiseEvidence;
    dependency evidence from sizing to BlueDogWingHeel::sweepInputs;
    dependency literature from sizing to BlueDogSourceEvidence::sail4;
    dependency actuator from sizing to BlueDogRequirements::sustainedEnergyFeasibility;
}
