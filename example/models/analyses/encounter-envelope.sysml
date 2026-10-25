package BlueDogEncounterEnvelope {
    private import ScalarValues::*;
    doc /* Historical six-class 750 m response-distance comparison, not the current BlueDogClassDetection allocation or sensor qualification. Distances start at the nearest relevant physical extent, including the whole tow or swept underwater hazard. Velocities share a ground-relative frame. The scalar relative-speed bound must cover motion throughout response; turns or acceleration require a supported bound or trajectory assessment. No collision-free maneuver is proved.*/

    calc def RelativeSpeed {
        in ownEastMps : Real;
        in ownNorthMps : Real;
        in targetEastMps : Real;
        in targetNorthMps : Real;
        return speedMps : Real = RealFunctions::sqrt(
            (targetEastMps-ownEastMps)*(targetEastMps-ownEastMps)
            +(targetNorthMps-ownNorthMps)*(targetNorthMps-ownNorthMps));
    }

    calc def ResponseAfterDelivery {
        doc /* busyAtDeliveryS is residual occupancy WHEN the usable observation
         * reaches guidance, not at envelope entry. Acquisition and delivery must
         * be disjoint measured intervals. Phase is the next eligible assessment
         * opportunity after both observation availability and controller release.
         * The old one-second assessment allocation is counted here ONCE; there
         * is no additional one-second processing term. New command and avoidance
         * duration are separate from the remaining OLD command/maneuver. */
        in acquisitionS : Real;
        in deliveryS : Real;
        in busyAtDeliveryS : Real;
        in assessmentPhaseS : Real;
        in commandS : Real;
        in avoidanceS : Real;
        in contingencyS : Real;
        return seconds : Real = acquisitionS+deliveryS+busyAtDeliveryS
            +assessmentPhaseS+commandS+avoidanceS+contingencyS;
    }

    calc def ResponseFromEntry {
        doc /* busyAtEntryS is time until release measured at envelope entry.
         * Observation production overlaps that ONE known occupied interval.
         * This branch assumes no new unrelated maneuver starts before observation
         * delivery; use a residual-at-delivery bound otherwise. Phase is charged
         * once, after the later of observation delivery and controller release. */
        in acquisitionS : Real;
        in deliveryS : Real;
        in busyAtEntryS : Real;
        in assessmentPhaseS : Real;
        in commandS : Real;
        in avoidanceS : Real;
        in contingencyS : Real;
        attribute readyS : Real = acquisitionS+deliveryS;
        return seconds : Real = (if readyS > busyAtEntryS ? readyS else busyAtEntryS)
            +assessmentPhaseS+commandS+avoidanceS+contingencyS;
    }

    calc def RangeForResponse {
        in relativeSpeedMps : Real;
        in responseS : Real;
        in separationM : Real;
        in positionAllowanceM : Real;
        return rangeM : Real = relativeSpeedMps*responseS+separationM+positionAllowanceM;
    }

    analysis def Envelope {
        subject encounter;
        doc /* Caller supplies supported bounds, not nominal turn time. Set motionBoundAvailable=false for stalled or unresolved maneuver authority and observationBoundAvailable=false for presence-only/unbounded tracks. Unsupported distances are -1. occupiedAtDelivery selects the epoch of occupiedS. This scalar necessary timing screen does not prove safe motion or rules compliance. appliesTrafficRequirement selects the historical six-class comparison scope, excluding weeds. Its retained 750 m floor is historical only; current BlueDogClassDetection policy has no such floor.*/
        in attribute ownEastMps : Real;
        in attribute ownNorthMps : Real;
        in attribute targetEastMps : Real;
        in attribute targetNorthMps : Real;
        in attribute acquisitionS : Real;
        in attribute deliveryS : Real;
        in attribute occupiedS : Real;
        in attribute occupiedAtDelivery : Boolean;
        in attribute assessmentPhaseS : Real;
        in attribute commandS : Real;
        in attribute avoidanceS : Real;
        in attribute contingencyS : Real;
        in attribute separationM : Real;
        in attribute positionAllowanceM : Real;
        in attribute motionBoundAvailable : Boolean;
        in attribute observationBoundAvailable : Boolean;
        in attribute appliesTrafficRequirement : Boolean;
        out attribute supported : Boolean = motionBoundAvailable and observationBoundAvailable
            and acquisitionS >= 0 and deliveryS >= 0 and occupiedS >= 0
            and assessmentPhaseS >= 0 and commandS >= 0 and avoidanceS >= 0
            and contingencyS >= 0 and separationM >= 0 and positionAllowanceM >= 0;
        out attribute relativeSpeedMps : Real = RelativeSpeed(ownEastMps,ownNorthMps,targetEastMps,targetNorthMps);
        out attribute responseSeconds : Real = if not supported ? -1
            else if occupiedAtDelivery ? ResponseAfterDelivery(acquisitionS,deliveryS,occupiedS,assessmentPhaseS,commandS,avoidanceS,contingencyS)
            else ResponseFromEntry(acquisitionS,deliveryS,occupiedS,assessmentPhaseS,commandS,avoidanceS,contingencyS);
        out attribute requiredRangeM : Real = if supported ? RangeForResponse(relativeSpeedMps,responseSeconds,separationM,positionAllowanceM) else -1;
        out attribute retainedRequirementM : Real = BlueDogEncounterReview::criteria.rangeAllocationM;
        out attribute trafficComparisonApplicable : Boolean = appliesTrafficRequirement;
        out attribute fitsRetainedDistance : Boolean = appliesTrafficRequirement and supported and requiredRangeM <= retainedRequirementM;
        out attribute combinedEnvelopeM : Real = if not supported ? -1 else if not appliesTrafficRequirement ? requiredRangeM else if requiredRangeM > retainedRequirementM ? requiredRangeM else retainedRequirementM;
        out attribute status : String = if not supported ? "Unsupported: no finite response-distance claim" else if not appliesTrafficRequirement ? "Scenario timing sensitivity only; historical 750 m traffic comparison not applicable" else if fitsRetainedDistance ? "Within historical 750 m timing budget only; no current acceptance" else "Exceeds historical 750 m comparison; current class allocation remains open";
        out attribute physicalQualification : Boolean = false;
    }

    part study {
        attribute acquisitionS : Real = BlueDogEncounterReview::criteria.acquisitionSeconds;
        attribute deliveryS : Real = BlueDogIntegratedCandidate::hypothesis.sensorLatencyS;
        attribute assessmentPhaseS : Real = BlueDogEncounterReview::criteria.assessmentSeconds;
        attribute commandS : Real = BlueDogEncounterReview::criteria.commandSeconds;
        attribute avoidanceS : Real = BlueDogEncounterReview::criteria.maneuverSeconds;
        attribute contingencyS : Real = BlueDogEncounterReview::criteria.reserveSeconds;
        attribute positionAllowanceM : Real = BlueDogEncounterReview::criteria.relativePositionAllowanceM;
        attribute ownSpeedMps : Real = BlueDogEncounterReview::criteria.vesselSpeedMps;
        attribute illustrativeOccupiedS : Real = commandS+avoidanceS;
        attribute retainedRequirementM : Real = BlueDogEncounterReview::criteria.rangeAllocationM;
        attribute targets : String [8] ordered = (
            "commercial tow including barges", "fishing or drifting craft",
            "fast craft including towed person", "sailing craft", "passenger vessel",
            "person or low-profile paddle craft", "stationary person or low-profile paddle craft", "weed boundary");
        attribute targetSpeedMps : Real [8] ordered nonunique = (
            BlueDogEncounterReview::criteria.targetSpeedMps#(1),
            BlueDogEncounterReview::criteria.targetSpeedMps#(2),
            BlueDogEncounterReview::criteria.targetSpeedMps#(3),
            BlueDogEncounterReview::criteria.targetSpeedMps#(4),
            BlueDogEncounterReview::criteria.targetSpeedMps#(5),
            BlueDogEncounterReview::criteria.targetSpeedMps#(6),0,0);
        attribute separationM : Real [8] ordered nonunique = (
            BlueDogEncounterReview::criteria.hullSeparationM#(1),
            BlueDogEncounterReview::criteria.hullSeparationM#(2),
            BlueDogEncounterReview::criteria.hullSeparationM#(3),
            BlueDogEncounterReview::criteria.hullSeparationM#(4),
            BlueDogEncounterReview::criteria.hullSeparationM#(5),
            BlueDogEncounterReview::criteria.hullSeparationM#(6),
            BlueDogEncounterReview::criteria.hullSeparationM#(6),0);
        attribute additionalClassScope : String = "Stationary person or low-profile paddle craft retains its traffic separation and acquisition requirement. Weed row is a stationary no-contact boundary sensitivity with the existing 10 m position allowance, not a selected weed stand-off or an extension of the traffic acquisition requirement. Moving mats need measured ground velocity; fixed vegetation and drifting vegetation are different cases.";
        attribute occupiedScope : String = "17 s illustrates the archived 2 s command plus 15 s hold only. New bounded-turn dynamics may take longer or stall; substitute an achieved supported residual and avoidance bound or report unsupported.";
    }

    analysis Summary {
        out attribute targets : String [8] ordered = study.targets;
        out attribute targetSpeedMps : Real [8] ordered nonunique = study.targetSpeedMps;
        out attribute ownSpeedMps : Real = study.ownSpeedMps;
        out attribute separationM : Real [8] ordered nonunique = study.separationM;
        out attribute retainedRequirementM : Real = study.retainedRequirementM;
        out attribute freshSeconds : Real = ResponseAfterDelivery(study.acquisitionS,study.deliveryS,0,study.assessmentPhaseS,study.commandS,study.avoidanceS,study.contingencyS);
        out attribute occupiedAtEntrySeconds : Real = ResponseFromEntry(study.acquisitionS,study.deliveryS,study.illustrativeOccupiedS,study.assessmentPhaseS,study.commandS,study.avoidanceS,study.contingencyS);
        out attribute occupiedAtDeliverySeconds : Real = ResponseAfterDelivery(study.acquisitionS,study.deliveryS,study.illustrativeOccupiedS,study.assessmentPhaseS,study.commandS,study.avoidanceS,study.contingencyS);
        out attribute headOnFreshM : Real [8] ordered nonunique = (1..8)->ControlFunctions::collect {
            in i : Integer; RangeForResponse(RelativeSpeed(study.ownSpeedMps,0,-study.targetSpeedMps#(i),0),freshSeconds,study.separationM#(i),study.positionAllowanceM) };
        out attribute crossingFreshM : Real [8] ordered nonunique = (1..8)->ControlFunctions::collect {
            in i : Integer; RangeForResponse(RelativeSpeed(study.ownSpeedMps,0,0,study.targetSpeedMps#(i)),freshSeconds,study.separationM#(i),study.positionAllowanceM) };
        out attribute sameCourseFreshM : Real [8] ordered nonunique = (1..8)->ControlFunctions::collect {
            in i : Integer; RangeForResponse(RelativeSpeed(study.ownSpeedMps,0,study.targetSpeedMps#(i),0),freshSeconds,study.separationM#(i),study.positionAllowanceM) };
        out attribute headOnOccupiedAtEntryM : Real [8] ordered nonunique = (1..8)->ControlFunctions::collect {
            in i : Integer; RangeForResponse(RelativeSpeed(study.ownSpeedMps,0,-study.targetSpeedMps#(i),0),occupiedAtEntrySeconds,study.separationM#(i),study.positionAllowanceM) };
        out attribute headOnOccupiedAtDeliveryM : Real [8] ordered nonunique = (1..8)->ControlFunctions::collect {
            in i : Integer; RangeForResponse(RelativeSpeed(study.ownSpeedMps,0,-study.targetSpeedMps#(i),0),occupiedAtDeliverySeconds,study.separationM#(i),study.positionAllowanceM) };
        out attribute ownSpeedSweepMps : Real [5] ordered = (0,0.5,1,2,3);
        out attribute fastHeadOnByOwnSpeedM : Real [5] ordered nonunique = ownSpeedSweepMps->ControlFunctions::collect {
            in speed : Real; RangeForResponse(RelativeSpeed(speed,0,-study.targetSpeedMps#(3),0),freshSeconds,study.separationM#(3),study.positionAllowanceM) };
        out attribute qualificationClaim : Boolean = false;
        out attribute scope : String = "Historical six-class 750 m comparison and constant/bounded relative-velocity sensitivity, not current BlueDogClassDetection acceptance. Own-speed sweep alone does not preserve maneuver authority. No sensor measurement is credited.";
    }

    part observationContract {
        attribute presence : String = "First establish that a relevant hazard exists, with detection/miss and false-alarm evidence for its class, bearing, illumination and obscuration. Absence of AIS is not absence of a target.";
        attribute bearing : String = "Bearing and uncertainty place the hazard relative to the course and swept vessel; all-bearing coverage must address rig occlusion. Bearing alone does not give metric range.";
        attribute range : String = "Range and uncertainty are to the nearest relevant physical extent, not an AIS antenna or a circular proxy that detects early. Tow/skier envelopes and submerged appendages must be included.";
        attribute relativeMotion : String = "Time-stamped range/bearing or an independently supported velocity estimate must bound closing motion and intent changes. One image, presence detection or a passive acoustic cue does not establish range rate or a collision track.";
        attribute geometry : String = "Head-on adds speeds, right-angle crossing uses vector relative speed, and same-course overtaking uses speed difference. These are collision-course sensitivity geometries; other bearings require closest-approach and swept-motion assessment. Unknown target intent requires an adverse supported velocity envelope.";
        attribute lowTargets : String = "People, paddlers and stationary low obstacles need their own detection and range evidence in glare, waves and darkness. Commercial-vessel detection does not transfer to them.";
        attribute weeds : String = "Resolve vegetation extent and depth relative to keel, rudder and propulsor sweep, including sparse strands and moving mats. Presence or a downward survey return after passage is not timely forward clearance evidence.";
    }

    dependency unchangedAcquisition from Envelope to BlueDogRequirements::trafficSafety;
    dependency observedTracks from observationContract to BlueDogRequirements::trafficTracking;
    dependency responseDeadline from Envelope to BlueDogRequirements::avoidanceCommandDeadline;
    dependency archivedBudget from Summary to BlueDogEncounterReview::criteria;
}
