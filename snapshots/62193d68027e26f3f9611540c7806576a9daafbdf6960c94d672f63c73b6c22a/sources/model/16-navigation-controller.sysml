package BlueDogNavigationController { doc /* Mission integration policy for supplied Inland pair assessments. Numerical thresholds below are engineering hypotheses, not statutory interpretations or physically validated limits.*/ private import ScalarValues::*; part context;
    analysis def Policy {
        subject encounter;
        out attribute headingToleranceDeg : Real = 2.0;
        out attribute speedToleranceMps : Real = 0.05;
        out attribute substantialTurnDeg : Real = 15.0;
        out attribute bearingUncertaintyDeg : Real = 10.0;
        out attribute clearanceReleaseMultiplier : Real = 2.0;
    }
    analysis def Candidate {
        doc /* Filters a geometrically feasible proposal using the native pair response. Hold-course/speed tolerances and substantial-turn threshold are declared hypotheses. No supported candidate causes a navigation abort, not an inferred lawful emergency departure. Recovery is separately unassessed.*/
        subject encounter;
        in attribute relevant : Boolean;
        in attribute supported : Boolean;
        in attribute candidateClear : Boolean;
        in attribute heldClear : Boolean;
        in attribute holdsCourseSpeed : Boolean;
        in attribute substantialChange : Boolean;
        in attribute missingTrackedDuty : Boolean;
        in attribute response : String;
        out attribute allowed : Boolean = not missingTrackedDuty and (if not relevant ? true else supported and candidateClear and (continuationSupported or (if response == "holdCourseSpeed" ? holdsCourseSpeed else if response == "mayAct" ? holdsCourseSpeed or substantialChange else if response == "keepClear" or response == "shallAct" ? (heldClear and holdsCourseSpeed) or substantialChange else response == "monitor")));
        out attribute completeComplianceEstablished : Boolean = false;
        in attribute continuationSupported : Boolean;
    }
    analysis def Geometry {
        doc /* Geometry-to-assessed-fact hypotheses. Past-and-clear requires an observed opening track beyond twice the protected envelope and no forecast conflict. Track loss never meets this condition. Substantial action here only recognizes a heading change; speed-only maneuvers need a separate validated criterion.*/
        subject encounter;
        in attribute rangeM : Real;
        in attribute closingMps : Real;
        in attribute protectedRadiusM : Real;
        in attribute releaseMultiplier : Real;
        in attribute headingChangeDeg : Real;
        in attribute speedChangeMps : Real;
        in attribute headingToleranceDeg : Real;
        in attribute speedToleranceMps : Real;
        in attribute substantialTurnDeg : Real;
        in attribute heldConflict : Boolean;
        in attribute headingKnown : Boolean;
        in attribute trackAdequate : Boolean;
        out attribute pastAndClear : Boolean = trackAdequate and not heldConflict and closingMps < 0 and rangeM > protectedRadiusM * releaseMultiplier;
        out attribute holdsCourseSpeed : Boolean = headingKnown and headingChangeDeg <= headingToleranceDeg and speedChangeMps <= speedToleranceMps;
        out attribute substantialChange : Boolean = headingKnown and headingChangeDeg >= substantialTurnDeg;
    }
    analysis def Context {
        doc /* This controller integration is restricted to the assessed synthetic clear-visibility, non-channel context. Other contexts require a separate controller implementation, even without observed traffic. This scope gate is not a general legal prohibition.*/
        subject encounter;
        in attribute inlandProfile : String;
        in attribute channelContext : String;
        in attribute restrictedVisibility : String;
        in attribute specialCircumstances : String;
        out attribute supported : Boolean = inlandProfile == "yes" and channelContext == "no" and restrictedVisibility == "no" and specialCircumstances == "no";
    }
}