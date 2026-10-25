package BlueDogEncounterReview {
    doc /* Historical six-class acquisition comparison retained for archived evidence reproduction. The uniform 750 m allocation and broad low-target class are prior hypotheses, not current acceptance criteria. Current class-specific policy and open review/evidence gates are BlueDogClassDetection; these numerical APIs retain their historical meaning.*/
    private import ScalarValues::*;
    part criteria {
        attribute targets : String [6] ordered = ("tow including barges", "fishing or drifting craft", "ski/power boat including tow", "sailing craft", "passenger vessel", "person or low-profile paddle craft");
        attribute targetSpeedMps : Real [6] ordered nonunique = (3.5,1.5,15,4,4,2);
        attribute lengthM : Real [6] ordered nonunique = (180,6,30,8,100,2);
        attribute beamM : Real [6] ordered nonunique = (24,2.5,3,3,18,1);
        attribute hullSeparationM : Real [6] ordered nonunique = (50,20,30,20,50,20);
        attribute vesselSpeedMps : Real = 3;
        attribute acquisitionSeconds : Real = 5;
        attribute assessmentSeconds : Real = 1;
        attribute commandSeconds : Real = 2;
        attribute maneuverSeconds : Real = 15;
        attribute reserveSeconds : Real = 15;
        attribute relativePositionAllowanceM : Real = 10;
        attribute rangeAllocationM : Real = 750;
        attribute visibilityM : Real = 1000;
        metadata rationale : ModelingMetadata::Rationale { text = "Engineering acceptance cases, not measured traffic rates or statutory separation. Range is measured from the nearest physical target extent, not an AIS antenna; use the whole tow and skier envelope. Closing speed is target speed plus 3 m/s vessel speed. Allow 5 s acquisition, 1 s assessment, 2 s command, 15 s maneuver and 15 s contingency, plus 10 m relative position error and class separation. Worst allocated closing case requires 724 m, rounded to 750 m. Observe all bearings including mast/wing occlusion in daylight, darkness, glare and 1 km visibility; include low freeboard paddle craft and a person-sized target. No AIS dependence. If capability is not demonstrable, reduce admissible speed/exposure with the same equation or redesign detection; do not waive collision avoidance."; }
    }
    analysis Acquisition {
        out attribute requiredRangesM : Real [6] ordered nonunique = (1..6)->ControlFunctions::collect {
            in i : Integer;
            BlueDogEncounterFeasibility::RequiredRange(criteria.targetSpeedMps#(i)+criteria.vesselSpeedMps,criteria.acquisitionSeconds,criteria.assessmentSeconds,criteria.commandSeconds,criteria.maneuverSeconds,criteria.reserveSeconds,criteria.hullSeparationM#(i),criteria.relativePositionAllowanceM) };
    }
    part acceptance {
        attribute scenarios : String = "Both tacks; head-on, crossing each side, overtaking each side, anchored/drifting fishing, reversing ski boat, obscured emergence, dense traffic, bridge approach and casualty recovery; repeat by target class in day/night and wave/glare extremes.";
        attribute passCriterion : String = "Historical acceptance hypothesis, not current BlueDogClassDetection policy: Acquire within 5 s of the target entering the 750 m envelope; maintain the track; update risk each second and command within 2 s; demonstrate the allocated maneuver within 15 s or reject the scenario. Independently measured swept hulls shall not overlap, project separation shall be preserved, and a confined vessel shall not need to change speed/course because of Blue Dog. Apply navigation rules separately; passing distance alone is insufficient.";
        attribute simulationScope : String = "Mission traffic generator is coarse route exposure. Exact target truth is not sensor performance. Dedicated deterministic encounter fixtures and later hardware replay close the one-second/2-second requirements; a 30 s mission control period cannot claim them.";
    }
    dependency basis from criteria to BlueDogRequirements::trafficSafety;
    dependency tracking from criteria to BlueDogRequirements::trafficTracking;
    dependency timing from criteria to BlueDogRequirements::avoidanceCommandDeadline;
    dependency applicableNavigationDuties from acceptance to GorgeChallenge::navigationRules;
}
