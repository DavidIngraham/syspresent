package BlueDogLocationTraffic { doc /* Desktop traffic assessment, 2026-10-16. Named sectors are survey scopes, not surveyed polygons or measured rates. No accepted departure window. Site evidence supports activities; conflict mechanisms and priority are engineering judgments. Existing mission actors remain scripted geometric proxies, not reactive wind-sport simulation.*/ private import ScalarValues::*;
    part policy {
        attribute sourceRegister : String = "evidence/traffic/2026-10-16-location-review/sources.json";
        attribute rateEvidenceAvailable : Boolean = false;
        attribute acceptedWindow : Boolean = false;
        attribute geometryStatus : String = "Survey WGS84 launch, riding, fall/relaunch and approach polygons; intersect both route legs and casualty routes. Include connecting reaches. Launch points do not bound riding areas.";
        attribute timingPolicy : String = "Review earliest entry through latest exit for each sector/class/condition on both legs, waiting and recovery. Use a common UTC epoch; retain local date/time and DST offset. Delay beyond the reviewed window requires reassessment.";
        attribute cooperationPolicy : String = "No probability credit for rider avoidance. Exercise timely, delayed, absent and failed response including falls. Predictable stand-on behavior still requires collision intervention.";
        attribute heatmapPolicy : String = "No Strava map sampled here. Global/Weekly/Night heatmaps may locate surveys, not calibrate hourly rates or prove absence. Personal date filtering is not a public hourly dataset.";
        attribute legalPolicy : String = "Apply Inland Rules and reviewed local restrictions; separate sailing category from speed/consequence. Exercise overtaking, tack, windward/leeward and failed give-way response. Autonomy and small size confer no restricted-maneuverability privilege. A shore launch prohibition does not imply absence offshore.";
    }
    part bingen {
        attribute location : String = "Bingen launch and departure/finish approaches";
        attribute basis : String = "Port-operated ramp/harbor and buoy-39 gate.";
        attribute hazards : String = "Launch traffic and low targets near departure, return and retrieval; wind-sport use unmeasured.";
        attribute nextInvestigation : String = "Count both approaches; distinguish ramp traffic from scored gate and survey waiting/capture.";
        attribute source : String = "Bingen port; TransGorgeCourse::east";
        attribute priority : String = "High: launch/retrieval";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part bridge {
        attribute location : String = "Hood River bridge and White Salmon approaches";
        attribute basis : String = "Both legs use lift span; course records temporary works exclusion.";
        attribute hazards : String = "Confined passing, commercial traffic and occluded emergence; avoiding riders may conflict with span/works limits.";
        attribute nextInvestigation : String = "Review current notices, geometry and crossing opportunities without impeding commercial passage.";
        attribute source : String = "TransGorgeCourse::bridgePassage; TransGorgeCourse::temporaryWorks";
        attribute priority : String = "High: constrained passage";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part hoodRiver {
        attribute location : String = "Hood River Event Site, sandbar, Hook and waterfront";
        attribute basis : String = "Port documents windsurfing, limited kiteboarding and mixed nonmotorized access.";
        attribute hazards : String = "Repeated crossings, learners, falls and launch/landing; shore-use boundaries are not riding footprints.";
        attribute nextInvestigation : String = "Survey offshore/cross-river tracks and events by wind/daylight; compare offsets without shifting risk to commercial passage.";
        attribute source : String = "Hood River waterfront; events";
        attribute priority : String = "High: documented mixed use";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part hatchery {
        attribute location : String = "Spring Creek Hatchery and Swell City";
        attribute basis : String = "State park documents windsurfing/kiteboarding; CGW2 identifies windsurfer/winger access at Swell City.";
        attribute hazards : String = "Turns in swell, occluded fallen riders and overlapping passage/recovery exposure.";
        attribute nextInvestigation : String = "Observe both banks/offshore under west/east winds separately; assess recovery entry independently.";
        attribute source : String = "Spring Creek park; CGW2 Swell City";
        attribute priority : String = "High: wind sports/recovery overlap";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part viento {
        attribute location : String = "Viento river access and adjacent reach";
        attribute basis : String = "Oregon State Parks documents river access and windsurfing.";
        attribute hazards : String = "Launch/fall areas and moving groups; downwind route extent remains a survey hypothesis.";
        attribute nextInvestigation : String = "Survey along-river and cross-river traffic, south-bank recovery and wind-conditioned arrival.";
        attribute source : String = "Viento park";
        attribute priority : String = "High: documented use; extent unknown";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part homeValley {
        attribute location : String = "Home Valley / Wind River and Drano approaches";
        attribute basis : String = "Existing site review identifies recreation, fishing and entrance conflicts.";
        attribute hazards : String = "Mixed users; changing recovery destination can introduce unassessed approach exposure.";
        attribute nextInvestigation : String = "Map/count approaches separately; retain Drano default exclusion and verify Home Valley access.";
        attribute source : String = "BlueDogRecoverySiteReview::homeValley; BlueDogRecoverySiteReview::drano";
        attribute priority : String = "High: recovery uncertainty";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part stevenson {
        attribute location : String = "Stevenson Bob's Beach, East Point and buoy-16 approaches";
        attribute basis : String = "Port documents windsurfing at Bob's Beach and directs kiteboarding to East Point.";
        attribute hazards : String = "Riding may intersect the turn and recovery. Bob's Beach launch prohibition does not exclude kiters offshore.";
        attribute nextInvestigation : String = "Survey windsurf/wing/kite tracks, rounding and ramp traffic; compare east/west wind and seasonal retrieval access.";
        attribute source : String = "Bob's Beach; East Point; TransGorgeCourse::west";
        attribute priority : String = "High: turn/recovery overlap";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part connecting {
        attribute location : String = "Remaining connecting reaches on both legs";
        attribute basis : String = "Course connects sectors; no complete traffic census here.";
        attribute hazards : String = "Mobile riders, boats and people may occur away from launch sites. Sparse heat is not absence.";
        attribute nextInvestigation : String = "Bound background exposure on both legs, waiting and recovery; hotspot-only coverage cannot admit a mission.";
        attribute source : String = "TransGorgeCourse; field evidence pending";
        attribute priority : String = "Unresolved: complete coverage required";
        attribute status : String = "Open: no surveyed traffic footprint, calibrated rate or accepted window";
        attribute accepted : Boolean = false;
    }
    part windsurfCrossing {
        attribute targetClass : String = "windsurfer";
        attribute scenario : String = "Crossing on either tack, overtaking, abrupt tack/gybe";
        attribute extent : String = "Rider, board, mast and sail; fallen sail and separated person";
        attribute criterion : String = "Exercise sailing roles and unknown tack with timely/delayed/no rider response. Bound speed and turn rate from evidence; do not inherit generic 4 m/s.";
        attribute evidenceStatus : String = "Planned hazard case; no measured response or reactive simulation validation";
    }
    part wingfoilTurn {
        attribute targetClass : String = "wingfoiler";
        attribute scenario : String = "Fast crossing/overtaking followed by turn or fall";
        attribute extent : String = "Rider, board, underwater foil, handheld wing and leash";
        attribute criterion : String = "Retain foil swept volume. Fall transitions to person-in-water plus equipment; lost upright detection is not disappearance.";
        attribute evidenceStatus : String = "Planned hazard case; no measured response or reactive simulation validation";
    }
    part kiteSweep {
        attribute targetClass : String = "kiter";
        attribute scenario : String = "Crossing, jump/landing, crash and relaunch";
        attribute extent : String = "Rider, board/foil, kite and taut/slack line sweep";
        attribute criterion : String = "Track aerial, surface and underwater occupied volume. Board rectangle alone cannot qualify clearance; no assumed rider avoidance.";
        attribute evidenceStatus : String = "Planned hazard case; no measured response or reactive simulation validation";
    }
    part fallenRider {
        attribute targetClass : String = "personInWater";
        attribute scenario : String = "Fall during initially safe predicted pass";
        attribute extent : String = "Person and separately drifting equipment";
        attribute criterion : String = "Preserve objects/uncertainty until separation resolves; assess injury, entanglement and secondary immersion. Empty-looking board is not occupancy evidence.";
        attribute evidenceStatus : String = "Planned hazard case; no measured response or reactive simulation validation";
    }
    part groupEncounter {
        attribute targetClass : String = "unclassified";
        attribute scenario : String = "Several riders turn or fall near confined passage";
        attribute extent : String = "Union of plausible riders/equipment with track-association uncertainty";
        attribute criterion : String = "Exercise track swaps, occlusion and no safe sailing maneuver. Check abort/recovery against remaining traffic and commercial passage.";
        attribute evidenceStatus : String = "Planned hazard case; no measured response or reactive simulation validation";
    }
    part windowOverrun {
        attribute targetClass : String = "unclassified";
        attribute scenario : String = "Outbound fits quiet window; delayed return/recovery does not";
        attribute extent : String = "Whole route exposure including waiting and recovery";
        attribute criterion : String = "Reject unsupported conditions. Shift departure, route or waiting only with supported energy, sensing and recovery; darkness/calm is not automatically safer.";
        attribute evidenceStatus : String = "Planned hazard case; no measured response or reactive simulation validation";
    }
    analysis def WindowAssessment {
        doc /* One sector/class/condition visit. Rates count entries into the declared encounter envelope, not shore attendance. Upper rate bound must cover every condition/time in the interval; otherwise split rows. References and flags declare reviewed evidence; contents are not validated here. No Poisson assumption or collision-probability estimate. Passing a row cannot authorize launch.*/
        subject visit;
        in attribute sectorId : String;
        in attribute targetClass : String;
        in attribute earliestEntryUtcS : Real;
        in attribute latestExitUtcS : Real;
        in attribute evidenceStartUtcS : Real;
        in attribute evidenceEndUtcS : Real;
        in attribute encounterRateUpperPerHour : Real;
        in attribute reviewedExposureLimit : Real;
        in attribute geometryReviewRef : String;
        in attribute rateEvidenceRef : String;
        in attribute rateMethodReviewRef : String;
        in attribute exposureCriterionRef : String;
        in attribute conditionMatch : Boolean;
        in attribute classAllocationAccepted : Boolean;
        in attribute responseWithoutRiderCooperationSupported : Boolean;
        in attribute navigationObligationsSupported : Boolean;
        in attribute recoverySupported : Boolean;
        out attribute knownSector : Boolean = sectorId == "bingen" or sectorId == "bridge" or sectorId == "hoodRiver" or sectorId == "hatchery" or sectorId == "viento" or sectorId == "homeValley" or sectorId == "stevenson" or sectorId == "connecting";
        out attribute knownClass : Boolean = targetClass == "commercialTow" or targetClass == "fishingCraft" or targetClass == "fastCraft" or targetClass == "sailingCraft" or targetClass == "passengerVessel" or targetClass == "occupiedKayak" or targetClass == "occupiedSUP" or targetClass == "personInWater" or targetClass == "unoccupiedDriftingCraft" or targetClass == "windsurfer" or targetClass == "wingfoiler" or targetClass == "kiter" or targetClass == "unclassified";
        out attribute intervalSupported : Boolean = earliestEntryUtcS >= 0 and latestExitUtcS > earliestEntryUtcS and evidenceStartUtcS >= 0 and evidenceEndUtcS > evidenceStartUtcS and evidenceStartUtcS <= earliestEntryUtcS and evidenceEndUtcS >= latestExitUtcS;
        out attribute exposureSupported : Boolean = knownSector and knownClass and intervalSupported and conditionMatch and encounterRateUpperPerHour >= 0 and geometryReviewRef != "" and rateEvidenceRef != "" and rateMethodReviewRef != "";
        out attribute expectedEncountersUpper : Real = if exposureSupported ? encounterRateUpperPerHour*(latestExitUtcS-earliestEntryUtcS)/3600 else -1;
        out attribute exposureWithinCriterion : Boolean = exposureSupported and exposureCriterionRef != "" and reviewedExposureLimit >= 0 and expectedEncountersUpper <= reviewedExposureLimit;
        out attribute rowSupported : Boolean = exposureWithinCriterion and classAllocationAccepted and responseWithoutRiderCooperationSupported and navigationObligationsSupported and recoverySupported;
        out attribute launchAuthorized : Boolean = false;
        out attribute status : String = if not exposureSupported ? "Unsupported exposure estimate" else if not rowSupported ? "Exposure estimated; visit unsupported" else "Supplied visit criteria pass; complete mission admission still required";
    }
    part missionAdmission {
        doc /* Require a complete audited matrix of every traversed sector, admitted/uncertain class, condition and visit on outbound, return, waiting and recovery. Couple forecast, energy, current, night capability, surveyed capture and live reassessment. Review cumulative exposure over disjoint rows without double-counting actors; row limits do not establish voyage risk. No mission aggregator or launch release implemented here.*/
        attribute coverageReviewComplete : Boolean = false;
        attribute missionExposureAccepted : Boolean = false;
        attribute launchAuthorized : Boolean = false;
        attribute nextEvidence : String = "Independent time-stamped counts/tracks, observation effort/misses, wind/daylight, dates/events, speed/turn distributions, falls and rider response; surveyed polygons and arrival ensembles. Review upper bounds/confidence; zero observations do not imply zero rate.";
    }

 dependency allocationTrace from policy to BlueDogClassDetection::policy;
 dependency trafficSafety from policy to BlueDogRequirements::trafficSafety;
 dependency launchReview from missionAdmission to GorgeChallenge::forecastAdmission;
 dependency casualtyReview from missionAdmission to GorgeChallenge::courseRecoveryReserve;
 dependency courseScope from missionAdmission to TransGorgeCourse::policy;
 dependency windCases from policy to GorgeChallengeVerification::WindSportEncounterVerification;
 dependency windowCases from missionAdmission to GorgeChallengeVerification::LocationTrafficAdmissionVerification;
}