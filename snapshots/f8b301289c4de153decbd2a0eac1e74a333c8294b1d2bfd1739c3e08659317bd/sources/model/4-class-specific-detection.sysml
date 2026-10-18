package BlueDogClassDetection {
    doc /* Current owner-approved class-specific detection and consequence approach, 2026-10-16. No blanket 750 m floor applies to current policy. Earlier six-class and IC-01 acquisition numbers remain historical hypotheses in their original analyses. No numerical consequence, reliability or risk acceptance thresholds were selected by this policy change.*/
    private import ScalarValues::*;
    part policy {
        doc /* Detection distance must cover relative motion during observation/decision/maneuver delay, position uncertainty and reviewed clearance/margin. Consequences and exposure separately inform clearance and required reliability; do not multiply kinematic distance by severity or call a whole class harmless. Collision and nonimpediment obligations remain. No current class allocation is accepted without applicable review and evidence.*/
        attribute classIds : String [12] ordered = ("commercialTow","fishingCraft","fastCraft","sailingCraft","passengerVessel","occupiedKayak","occupiedSUP","personInWater","unoccupiedDriftingCraft","windsurfer","wingfoiler","kiter");
        attribute consequenceReview : String = "Review actual vessel mass and relative contact speed, contact geometry, rigid appendages, entanglement, capsize/immersion, occupant vulnerability and secondary collision/impediment. A low-speed glancing hull contact may have low direct damage under supported conditions; that is not a whole-class near-zero consequence allocation.";
        attribute classificationRule : String = "Before reliable classification, use a reviewed conservative envelope spanning plausible classes and occupant transitions. An apparently empty craft may have a person beside it; unknown is not unoccupied. Classification range must support the transition to a narrower envelope. With no reviewed conservative envelope, admission remains unsupported.";
        attribute reliabilityMeaning : String = "Required probability concerns timely acquisition AND sufficient track continuity for the admitted encounter class/conditions, not per-frame detector accuracy. Review exposure, false negatives, false positives and confidence basis. A lower confidence bound must come from applicable independent evidence; supplied booleans alone cannot establish acceptance.";
        attribute currentAllocationsAccepted : Boolean = false;
        attribute currentStatus : String = "Open: class clearances, consequence margins, required reliability/confidence and risk dispositions await review and evidence.";
    } part illustrative {
        doc /* Historical sensitivity inputs only: ownship 3 m/s; first five classes inherit earlier target speeds/separations. The four newly separated slow classes each reuse the former broad low-target 2 m/s and 20 m solely to show comparison arithmetic; they are not measured speeds or selected class clearances. Equal illustrated distances do not imply equal consequence or required reliability. No sensing simulation is changed.*/
        attribute targetSpeedMps : Real [9] ordered nonunique = (3.5,1.5,15,4,4,2,2,2,2);
        attribute historicalSeparationM : Real [9] ordered nonunique = (50,20,30,20,50,20,20,20,20);
        attribute ownSpeedMps : Real = 3;
        attribute positionAllowanceM : Real = 10;
        attribute responseS : Real = BlueDogEncounterEnvelope::ResponseAfterDelivery(5,1,0,1,2,15,15);
    }
    analysis def Assessment { doc /* Current class allocation/evidence gate. Required real inputs have no zero defaults. Kinematic and reviewed-design distances are not accepted deployment envelopes. Acquisition-and-track probability is separate from the whole detection-decision-maneuver response probability; no independence multiplication is assumed. Both lower confidence bounds must meet the reviewed confidence level. Method review must address sampling, correlation, uncertainty and applicability; sample count alone proves nothing. References name applicable reviewed records, not merely nonempty labels. Class-specific credit requires reliable classification; unclassified requires a reviewed conservative plausible-class envelope. allocationAccepted means supplied evidence passes this declared analysis gate, not physical qualification or full navigation-law compliance.*/ subject encounter;
        in attribute classId : String;
        in attribute classificationReliable : Boolean;
        in attribute conservativeEnvelopeReviewed : Boolean;
        in attribute classificationReviewRef : String;
        in attribute relativeSpeedBoundMps : Real;
        in attribute responseBoundS : Real;
        in attribute positionAllowanceM : Real;
        in attribute motionBoundAvailable : Boolean;
        in attribute observationBoundAvailable : Boolean;
        in attribute consequenceClearanceM : Real;
        in attribute consequenceMarginM : Real;
        in attribute consequenceReviewRef : String;
        in attribute exposureReviewRef : String;
        in attribute allocationReviewRef : String;
        in attribute requiredTimelyTrackProbability : Real;
        in attribute requiredConfidenceLevel : Real;
        in attribute reliabilityReviewRef : String;
        in attribute demonstratedRangeM : Real;
        in attribute timelyTrackProbabilityLowerBound : Real;
        in attribute evidenceConfidenceLevel : Real;
        in attribute independentEncounterCount : Integer;
        in attribute observationEvidenceRef : String;
        in attribute maneuverEvidenceRef : String;
        in attribute consequenceEvidenceRef : String;
        in attribute riskAcceptanceRef : String;
        in attribute collisionAndNonImpedimentSupported : Boolean;
        out attribute knownClass : Boolean = classId == "commercialTow" or classId == "fishingCraft" or classId == "fastCraft" or classId == "sailingCraft" or classId == "passengerVessel" or classId == "occupiedKayak" or classId == "occupiedSUP" or classId == "personInWater" or classId == "unoccupiedDriftingCraft" or classId == "windsurfer" or classId == "wingfoiler" or classId == "kiter";
        out attribute classScopeSupported : Boolean = classificationReviewRef != "" and ((knownClass and classificationReliable) or (classId == "unclassified" and conservativeEnvelopeReviewed));
        out attribute kinematicsSupported : Boolean = classScopeSupported and motionBoundAvailable and observationBoundAvailable and relativeSpeedBoundMps >= 0 and responseBoundS >= 0 and positionAllowanceM >= 0;
        out attribute kinematicMinimumM : Real = if kinematicsSupported ? relativeSpeedBoundMps*responseBoundS+positionAllowanceM else -1;
        out attribute consequenceReviewed : Boolean = consequenceReviewRef != "" and consequenceClearanceM >= 0 and consequenceMarginM >= 0;
        out attribute reliabilityCriterionReviewed : Boolean = reliabilityReviewRef != "" and requiredTimelyTrackProbability > 0 and requiredTimelyTrackProbability <= 1 and requiredConfidenceLevel > 0 and requiredConfidenceLevel < 1;
        out attribute allocationReviewed : Boolean = kinematicsSupported and consequenceReviewed and reliabilityCriterionReviewed and responseCriterionReviewed and exposureReviewRef != "" and allocationReviewRef != "";
        out attribute reviewedDesignDistanceM : Real = if allocationReviewed ? kinematicMinimumM+consequenceClearanceM+consequenceMarginM else -1;
        out attribute evidenceApplicable : Boolean = observationEvidenceRef != "" and maneuverEvidenceRef != "" and consequenceEvidenceRef != "" and evidenceMethodReviewRef != "" and independentEncounterCount > 0 and timelyTrackProbabilityLowerBound >= 0 and timelyTrackProbabilityLowerBound <= 1 and evidenceConfidenceLevel > 0 and evidenceConfidenceLevel < 1;
        out attribute reliabilitySatisfied : Boolean = allocationReviewed and evidenceApplicable and timelyTrackProbabilityLowerBound >= requiredTimelyTrackProbability and evidenceConfidenceLevel >= requiredConfidenceLevel;
        out attribute timingFeasible : Boolean = allocationReviewed and evidenceApplicable and demonstratedRangeM >= reviewedDesignDistanceM;
        out attribute allocationAccepted : Boolean = timingFeasible and reliabilitySatisfied and responseReliabilitySatisfied and collisionAndNonImpedimentSupported and riskAcceptanceRef != "" {
            doc /* Consistency gate on supplied reviewed bounds and evidence declarations only. Nonempty references are declarations: this analysis does not read or validate their contents, applicability or approval. Passing is not certification or physical qualification.*/
        }
        out attribute acceptedDetectionDistanceM : Real = if allocationAccepted ? reviewedDesignDistanceM else -1;
        out attribute physicalQualification : Boolean = false;
        out attribute status : String = if not allocationReviewed ? "Unsupported: current class allocation not reviewed" else if not allocationAccepted ? "Reviewed design distance only; safety acceptance unsupported" else "Supplied class evidence and risk disposition pass analysis gate; no physical qualification";
        in attribute requiredResponseProbability : Real;
        in attribute responseProbabilityLowerBound : Real;
        in attribute responseEvidenceConfidenceLevel : Real;
        in attribute responseEvidenceRef : String;
        in attribute responseReliabilityReviewRef : String;
        in attribute evidenceMethodReviewRef : String;
        out attribute responseReliabilitySatisfied : Boolean = allocationReviewed and responseCriterionReviewed and responseEvidenceRef != "" and evidenceMethodReviewRef != "" and responseProbabilityLowerBound >= requiredResponseProbability and responseProbabilityLowerBound <= 1 and responseEvidenceConfidenceLevel >= requiredConfidenceLevel and responseEvidenceConfidenceLevel < 1;
        out attribute responseCriterionReviewed : ScalarValues::Boolean = responseReliabilityReviewRef != "" and requiredResponseProbability > 0 and requiredResponseProbability <= 1 and requiredConfidenceLevel > 0 and requiredConfidenceLevel < 1;
    }
    analysis Summary {
        doc /* Historical nine-row sensitivity comparison; current policy additionally includes windsurfer, wingfoiler and kiter with no inherited speed or distance allocation.*/
        out attribute classIds : String [9] ordered = ("commercialTow","fishingCraft","fastCraft","sailingCraft","passengerVessel","occupiedKayak","occupiedSUP","personInWater","unoccupiedDriftingCraft");
        out attribute illustrativeTargetSpeedMps : Real [9] ordered nonunique = illustrative.targetSpeedMps;
        out attribute illustrativeSeparationM : Real [9] ordered nonunique = illustrative.historicalSeparationM;
        out attribute illustrativeResponseS : Real = illustrative.responseS;
        out attribute illustrativeKinematicMinimumM : Real [9] ordered nonunique = (1..9)->ControlFunctions::collect { in i : Integer; (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(i))*illustrative.responseS+illustrative.positionAllowanceM };
        out attribute illustrativeResponseDistanceM : Real [9] ordered nonunique = (1..9)->ControlFunctions::collect { in i : Integer; (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(i))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(i) };
        out attribute currentAllocationsAccepted : Boolean = policy.currentAllocationsAccepted;
        out attribute physicalQualification : Boolean = false;
        out attribute status : String = policy.currentStatus;
    }
    dependency currentTraffic from policy to BlueDogRequirements::trafficSafety;
    dependency currentTracking from policy to BlueDogRequirements::trafficTracking;
    dependency collisionObligation from policy to GorgeChallenge::trafficCoexistence;
    dependency applicableNavigationDuties from policy to GorgeChallenge::navigationRules;
    part classRow1 {
        attribute target : String = "Commercial tow";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(1);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(1))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(1);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow2 {
        attribute target : String = "Fishing craft";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(2);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(2))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(2);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow3 {
        attribute target : String = "Fast craft";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(3);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(3))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(3);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow4 {
        attribute target : String = "Sailing craft";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(4);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(4))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(4);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow5 {
        attribute target : String = "Passenger vessel";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(5);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(5))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(5);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow6 {
        attribute target : String = "Occupied kayak";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(6);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(6))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(6);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow7 {
        attribute target : String = "Occupied stand-up paddleboard";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(7);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(7))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(7);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow8 {
        attribute target : String = "Person in water";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(8);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(8))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(8);
        attribute allocationAccepted : Boolean = false;
    }
    part classRow9 {
        attribute target : String = "Unoccupied drifting craft";
        attribute targetSpeedMps : Real = illustrative.targetSpeedMps#(9);
        attribute illustrativeDistanceM : Real = (illustrative.ownSpeedMps+illustrative.targetSpeedMps#(9))*illustrative.responseS+illustrative.positionAllowanceM+illustrative.historicalSeparationM#(9);
        attribute allocationAccepted : Boolean = false;
    }
}
