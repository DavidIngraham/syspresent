package BlueDogWingHeel {
    private import ScalarValues::*;
    analysis sweepInputs {
        doc /* Numerical sensitivity study of the fixed-camber reference wing.
         * World axes: X aft, Y starboard, Z up. Positive heel rotates about +X.
         * Apparent wind is horizontal, from AWA clockwise from the bow.
         * Upright nominal incidence fixes mast trim; heel does not retrim it.
         * R = Rx(heel) Rz(nominalAlpha - AWA) Rx(90 degrees) maps wing to world.
         * Transform wind into wing axes; solve alpha and beta together, then
         * rotate dimensional inviscid forces and moments back to world axes.
         * Moment origin is the root midchord, not the vessel center of gravity. */
        out attribute areaM2 : Real = 1;
        out attribute aspectRatio : Real = 4;
        out attribute speedMps : Real = 5;
        out attribute airDensity : Real = 1.225;
        out attribute kinematicViscosity : Real = 0.000015;
        out attribute mesh : Integer = 24;
        out attribute wakeIterations : Integer = 5;
        out attribute heelDegrees : Real [5] ordered = (-40,-20,0,20,40);
        out attribute apparentWindDegrees : Real [3] ordered = (45,90,135);
        out attribute nominalAlphaDegrees : Real [8] ordered = (-12,-8,-4,0,4,8,12,16);
        metadata rationale : ModelingMetadata::Rationale { text = "Cover the current operating heel bounds and three wind directions. Resolve heel-induced spanwise flow and compare with the provisional cosine projection, holding mast trim fixed for each nominal incidence. Free-air attached-flow sensitivity only; no water surface, hull, mast, stall, gust or dynamic roll model. No automatic replacement of the optimizer polar."; }
    }
    dependency purpose from sweepInputs to BlueDogRequirements::cruiseEvidence;
    dependency approximationUnderReview from sweepInputs to MarineSailing::Evaluate;
    dependency scope from sweepInputs to BlueDogDesignDecisions::aerodynamicScope;
}
