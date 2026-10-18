package BlueDogManeuverDynamics {
    private import ScalarValues::*;
    doc /* Optional low-order maneuver hypothesis. These coefficients are not
     * measured IC-01 properties. The model has bounded yaw rate and acceleration,
     * speed-dependent rudder authority, and maneuver speed loss; it has no yaw
     * inertia, wave excitation, roll coupling or calibrated stall dynamics.
     * Defaults are scenario inputs for sensitivity, never qualification evidence.
     */
    part hypothesis {
        attribute maxTurnRateDegS : Real = 6;
        attribute authoritySpeedMps : Real = 1;
        attribute minimumSteerSpeedMps : Real = 0.15;
        attribute accelerationMps2 : Real = 0.08;
        attribute decelerationMps2 : Real = 0.15;
        attribute turnSpeedRetention : Real = 0.8;
        attribute tackSpeedRetention : Real = 0.35;
        attribute gybeSpeedRetention : Real = 0.65;
        attribute recoverySpeedRetention : Real = 0.7;
    }
    analysis Defaults {
        out attribute maxTurnRateDegS : Real = hypothesis.maxTurnRateDegS;
        out attribute authoritySpeedMps : Real = hypothesis.authoritySpeedMps;
        out attribute minimumSteerSpeedMps : Real = hypothesis.minimumSteerSpeedMps;
        out attribute accelerationMps2 : Real = hypothesis.accelerationMps2;
        out attribute decelerationMps2 : Real = hypothesis.decelerationMps2;
        out attribute turnSpeedRetention : Real = hypothesis.turnSpeedRetention;
        out attribute tackSpeedRetention : Real = hypothesis.tackSpeedRetention;
        out attribute gybeSpeedRetention : Real = hypothesis.gybeSpeedRetention;
        out attribute recoverySpeedRetention : Real = hypothesis.recoverySpeedRetention;
    }
    analysis StudyInputs {
        out attribute names : String [6] ordered = ("ordinary_turn","tack","gybe","low_speed_authority","rudder_unavailable","recovery_turn");
        out attribute initialHeadingDeg : Real [6] ordered nonunique = (0,45,135,0,0,0);
        out attribute targetHeadingDeg : Real [6] ordered nonunique = (90,315,225,90,90,90);
        out attribute initialSpeedMps : Real [6] ordered nonunique = (1,1,1,0.1,1,1);
        out attribute targetSpeedMps : Real [6] ordered nonunique = (1,1,1,0.1,1,1);
        out attribute kinds : String [6] ordered nonunique = ("turn","tack","gybe","turn","turn","recovery");
        out attribute rudderFractions : Real [6] ordered nonunique = (1,1,1,1,0,1);
        out attribute horizonS : Real = 120;
        out attribute intervalsS : Real [2] ordered = (1,0.25);
        out attribute currentMps : Real [2] ordered = (0.3,0);
        metadata rationale : ModelingMetadata::Rationale { text = "Synthetic component trajectories with constant requested speed. Add the same 0.3 m/s eastward current externally; water-relative speed sets rudder authority. Tack and gybe labels prescribe loss hypotheses, not a resolved polar/roll model. Low-speed and unavailable-rudder cases may never finish; do not replace censoring with a finite maneuver bound."; }
    }
    action def Advance {
        in headingErrorDeg : Real;
        in speedMps : Real;
        in targetSpeedMps : Real;
        in intervalS : Real;
        in rudderFraction : Real;
        in speedRetention : Real;
        in maxTurnRateDegS : Real;
        in authoritySpeedMps : Real;
        in minimumSteerSpeedMps : Real;
        in accelerationMps2 : Real;
        in decelerationMps2 : Real;
        out speedNextMps : Real;
        out speedMeanMps : Real;
        out turnRateDegS : Real;
        out deltaHeadingDeg : Real;
        first start;
        then action advance {
            assign speedNextMps := if targetSpeedMps*speedRetention > speedMps ?
                RealFunctions::min(targetSpeedMps*speedRetention, speedMps+accelerationMps2*intervalS)
                else RealFunctions::max(targetSpeedMps*speedRetention, speedMps-decelerationMps2*intervalS);
            assign speedMeanMps := (speedMps+speedNextMps)/2;
            assign turnRateDegS := maxTurnRateDegS*rudderFraction*
                RealFunctions::min(1,RealFunctions::max(0,(speedMeanMps-minimumSteerSpeedMps)/(authoritySpeedMps-minimumSteerSpeedMps)));
            assign deltaHeadingDeg := if headingErrorDeg >= 0 ?
                RealFunctions::min(headingErrorDeg,turnRateDegS*intervalS)
                else -RealFunctions::min(-headingErrorDeg,turnRateDegS*intervalS);
        }
        then done;
    }
    dependency controlEvidence from hypothesis to BlueDogRequirements::trafficSafety;
}
