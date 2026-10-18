package InlandNavigationExperiment {
 doc /* Reusable U.S. Inland Rules interpretation. Supplied facts and candidate checks are conditional assessments, not established legal compliance. The mission navigation adapter consumes the pair assessment; equipment and other obligations remain separately assessed.*/
 private import ScalarValues::*;
 enum def Truth { yes; no; unknown; }
 enum def VesselKind { sailing; power; unclassified;
     enum fishing;
     enum notUnderCommand;
     enum restrictedManeuverability;
 }
 enum def Tack { portTack; starboardTack; unresolved; }
 enum def Windward { ownWindward; otherWindward; unresolved; }
 enum def OvertakingMemory { clear; ownDuty; otherDuty; conflicting; }
 enum def EncounterRole { giveWay; standOn; noPairRole; unsupported;
     enum mutualAvoidance;
 }
 enum def Response { monitor; keepClear; holdCourseSpeed; mayAct; shallAct; unresolved; }
 part context;
 analysis def Assess {
  doc /* One stable pair identity at one observation. Call repeatedly with nextMemory from the preceding result; preserve memory on uncertain clearance. Changing vessel identity requires explicit caller reset. Rule 13 memory, Rule 12 roles, Rule 17 escalation and Rule 9 obligations remain distinct. No turn command, CPA threshold, safe-speed calculation or observation classifier is implemented.*/
  subject encounter;
  in attribute inlandProfile : Truth;
  in attribute inSight : Truth {
   doc /* Rule 3(k) visual observability assessed externally. AIS/radar acquisition alone is not sufficient.*/
  }
  in attribute restrictedVisibility : Truth;
  in attribute riskOfCollision : Truth {
   doc /* Rule 7 risk appraisal supplied externally; unknown is treated as risk, not a CPA-based clearance claim.*/
  }
  in attribute ownKind : VesselKind;
  in attribute otherKind : VesselKind;
  in attribute ownExceptionalStatus : Truth {
   doc /* Unresolved or additional status not represented by VesselKind; known fishing, NUC and RAM are now typed VesselKind values. Do not infer status from size or automation.*/
  }
  in attribute otherExceptionalStatus : Truth;
  in attribute unmodeledSpecialCircumstances : Truth {
   doc /* Includes traffic separation, special inland river priority, agreed passages, multi-vessel interactions and Rule 2 circumstances requiring interpretation outside this subset.*/
  }
  in attribute observationsAdequate : Truth;
  in attribute lookoutAdequate : Truth;
  in attribute safeSpeedSupported : Truth;
  in attribute ownTack : Tack;
  in attribute otherTack : Tack;
  in attribute windward : Windward;
  in attribute ownComingUp : Truth;
  in attribute otherComingUp : Truth;
  in attribute ownBearingLowDeg : Real {
   doc /* Lower folded absolute bearing of ownship as seen from the OTHER vessel, measured from its bow, 0..180 degrees; not ownship bearing to target.*/
  }
  in attribute ownBearingHighDeg : Real;
  in attribute otherBearingLowDeg : Real {
   doc /* Lower folded absolute bearing of target as seen from OWNSHIP bow, 0..180 degrees.*/
  }
  in attribute otherBearingHighDeg : Real;
  in attribute declaredOwnOvertakingDoubt : Truth {
   doc /* Independent doubt about being the overtaker. Unknown is treated as unresolved doubt for this experiment; distinguish from known not-overtaking.*/
  }
  in attribute previousMemory : OvertakingMemory {
   doc /* State supplied by caller for this same pair. Native outputs compute the transition; Python only transports it.*/
  }
  in attribute pastAndClear : Truth {
   doc /* Positive evidence that this encounter is finally past and clear; unknown cannot release an overtaking duty.*/
  }
  in attribute otherActionAppropriate : Truth {
   doc /* No means it has become apparent that the give-way vessel is not taking appropriate action; no timer is invented.*/
  }
  in attribute giveWayAloneSufficient : Truth {
   doc /* No means collision cannot be avoided by give-way action alone (Rule 17(b)); unknown does not establish that threshold.*/
  }
  in attribute ownAvoidanceFeasible : Truth;
  in attribute immediateDanger : Truth;
  in attribute channelContext : Truth {
   doc /* Includes approach/crossing of an applicable narrow channel, not only ownship physically inside it.*/
  }
  in attribute otherConfinedToChannel : Truth;
  in attribute ownLengthM : Real;
  in attribute crossingChannel : Truth;
  in attribute crossingWouldImpede : Truth;
  in attribute proceedingAlongChannel : Truth;
  in attribute channelPlanSupported : Truth {
   doc /* External review of practicable starboard-edge navigation, sufficient sea room, signaling and nonimpediment. Not implied by pair role.*/
  }
  out attribute inputBoundsValid : Boolean = ownLengthM > 0 and ownBearingLowDeg >= 0 and ownBearingHighDeg <= 180 and ownBearingLowDeg <= ownBearingHighDeg and otherBearingLowDeg >= 0 and otherBearingHighDeg <= 180 and otherBearingLowDeg <= otherBearingHighDeg {
   doc /* Engineering input contract, not a legal threshold.*/
  }
  out attribute clearanceConflict : Boolean = pastAndClear == Truth::yes and (riskOfCollision != Truth::no or clearanceEvidenceAdequate != Truth::yes) {
   doc /* Engineering consistency check: positive clearance requires adequate independent clearance evidence and a no-risk appraisal before releasing memory.*/
  }
  out attribute riskDeemedPresent : Boolean = riskOfCollision != Truth::no {
   doc /* Rule 7(a): doubt does not establish absence of collision risk.*/
  }
  out attribute ownOvertakingConfirmed : Boolean = inputBoundsValid and ownComingUp == Truth::yes and ownBearingLowDeg > 112.5 {
   doc /* Rule 13(b): 22.5 degrees abaft beam equals 112.5 from bow; strict greater-than.*/
  }
  out attribute ownOvertakingPresumed : Boolean = inputBoundsValid and not ownOvertakingConfirmed and (declaredOwnOvertakingDoubt != Truth::no or (ownComingUp != Truth::no and ownBearingHighDeg > 112.5)) {
   doc /* Rule 13(c) plus engineering interval interpretation: possible overtaking triggers own-duty presumption.*/
  }
  out attribute otherOvertakingConfirmed : Boolean = inputBoundsValid and otherComingUp == Truth::yes and otherBearingLowDeg > 112.5 {
   doc /* Confirmed other-overtaker geometry; uncertainty alone never awards stand-on status.*/
  }
  out attribute otherOvertakingUncertain : Boolean = inputBoundsValid and not otherOvertakingConfirmed and otherComingUp != Truth::no and otherBearingHighDeg > 112.5;
  out attribute ownDutyCandidate : Boolean = previousMemory == OvertakingMemory::ownDuty or ownOvertakingConfirmed or ownOvertakingPresumed;
  out attribute otherDutyCandidate : Boolean = previousMemory == OvertakingMemory::otherDuty or otherOvertakingConfirmed;
  out attribute pairwiseScopeSupported : Boolean = inputBoundsValid and not clearanceConflict and inlandProfile == Truth::yes and inSight == Truth::yes and observationsAdequate == Truth::yes and ownKind != VesselKind::unclassified and otherKind != VesselKind::unclassified and ownExceptionalStatus == Truth::no and otherExceptionalStatus == Truth::no and unmodeledSpecialCircumstances == Truth::no {
   doc /* Conservative experiment scope. Unsupported is not permission to ignore obligations.*/
  }
  out attribute nextMemory : OvertakingMemory = if not inputBoundsValid or clearanceConflict ? previousMemory else if pastAndClear == Truth::yes ? OvertakingMemory::clear else if not pairwiseScopeSupported ? previousMemory else if previousMemory == OvertakingMemory::conflicting or (ownDutyCandidate and otherDutyCandidate) ? OvertakingMemory::conflicting else if ownDutyCandidate ? OvertakingMemory::ownDuty else if otherDutyCandidate ? OvertakingMemory::otherDuty else OvertakingMemory::clear {
   doc /* Rule 13(d). Preserve established duty on lost sight/unknown status; do not acquire new memory from inadequate observations. Conflicting identity/geometry remains unresolved until clearance/reset.*/
  }
  out attribute sailingRole : EncounterRole = if ownKind != VesselKind::sailing or otherKind != VesselKind::sailing ? EncounterRole::unsupported else if ownTack == Tack::portTack and otherTack == Tack::starboardTack ? EncounterRole::giveWay else if ownTack == Tack::starboardTack and otherTack == Tack::portTack ? EncounterRole::standOn else if ownTack == Tack::portTack and otherTack == Tack::unresolved and windward == Windward::otherWindward ? EncounterRole::giveWay else if ownTack != Tack::unresolved and ownTack == otherTack and windward == Windward::ownWindward ? EncounterRole::giveWay else if ownTack != Tack::unresolved and ownTack == otherTack and windward == Windward::otherWindward ? EncounterRole::standOn else EncounterRole::unsupported {
   doc /* Rule 12. Tack and windward side are supplied legal interpretations, not deduced from a kite or symmetric wing.*/
  }
  out attribute role : EncounterRole = if not pairwiseScopeSupported ? EncounterRole::unsupported else if pastAndClear == Truth::yes ? EncounterRole::noPairRole else if nextMemory == OvertakingMemory::conflicting ? EncounterRole::unsupported else if nextMemory == OvertakingMemory::ownDuty ? EncounterRole::giveWay else if nextMemory == OvertakingMemory::otherDuty ? EncounterRole::standOn else if otherOvertakingUncertain ? EncounterRole::unsupported else if not riskDeemedPresent ? EncounterRole::noPairRole else ordinaryRole {
   doc /* Rule 13 takes priority over sailing role. Low current collision risk does not erase active overtaking duty.*/
  }
  out attribute ruleBasis : String = if not pairwiseScopeSupported ? "Insufficient assessed facts or special circumstances" else if nextMemory == OvertakingMemory::ownDuty or nextMemory == OvertakingMemory::otherDuty ? "Rule 13 persistent overtaking" else if not riskDeemedPresent ? "No pair risk reported; general duties remain" else if riverRole != EncounterRole::noPairRole ? "Rules 9/14/15 special inland river provisions" else if ownRule18GiveWay or otherRule18GiveWay ? "Rule 18; channel/TSS obligations independently apply" else if headOnPresumed ? "Rule 14 head-on" else if powerPair and powerEncounter == PowerEncounter::crossing ? "Rule 15 crossing" else "Rule 12 or unresolved encounter";
  out attribute response : Response = if role == EncounterRole::unsupported ? Response::unresolved else if role == EncounterRole::giveWay or role == EncounterRole::mutualAvoidance ? Response::keepClear else if role == EncounterRole::noPairRole ? Response::monitor else if giveWayAloneSufficient == Truth::no ? Response::shallAct else if otherActionAppropriate == Truth::no ? Response::mayAct else if giveWayAloneSufficient == Truth::unknown or otherActionAppropriate == Truth::unknown ? Response::unresolved else Response::holdCourseSpeed {
   doc /* Rules 16/17: optional action and mandatory action are distinct. Emergency review reports need for broader Rule 2 judgment, not permission for arbitrary departure.*/
  }
  out attribute nonImpedimentDuty : Truth = if inlandProfile != Truth::yes or not inputBoundsValid or ownExceptionalStatus != Truth::no or unmodeledSpecialCircumstances != Truth::no ? Truth::unknown else if channelContext == Truth::no ? Truth::no else if channelContext == Truth::unknown ? Truth::unknown else if ownKind == VesselKind::fishing and otherNavigatingChannel == Truth::yes ? Truth::yes else if ownKind == VesselKind::fishing and otherNavigatingChannel == Truth::unknown ? Truth::unknown else if otherConfinedToChannel == Truth::no ? Truth::no else if otherConfinedToChannel == Truth::unknown ? Truth::unknown else if ownLengthM < 20 or ownKind == VesselKind::sailing or crossingChannel == Truth::yes ? Truth::yes else if ownKind == VesselKind::unclassified or crossingChannel == Truth::unknown ? Truth::unknown else Truth::no {
   doc /* Rules 9(b/c/d), independent of pairwise role and instantaneous collision risk. Typed fishing status carries duty toward any vessel navigating the channel, not only channel-confined vessels.*/
  }
  out attribute crossingProhibited : Truth = if inlandProfile != Truth::yes or not inputBoundsValid ? Truth::unknown else if channelContext == Truth::no or crossingChannel == Truth::no or otherConfinedToChannel == Truth::no or crossingWouldImpede == Truth::no ? Truth::no else if channelContext == Truth::yes and crossingChannel == Truth::yes and otherConfinedToChannel == Truth::yes and crossingWouldImpede == Truth::yes ? Truth::yes else Truth::unknown {
   doc /* Rule 9(d); prohibited only when the assessed crossing impedes confined passage. Unknown is not permission to cross.*/
  }
  out attribute starboardEdgeDuty : Truth = if inlandProfile != Truth::yes or unmodeledSpecialCircumstances != Truth::no ? Truth::unknown else if channelContext == Truth::no or proceedingAlongChannel == Truth::no ? Truth::no else if channelContext == Truth::yes and proceedingAlongChannel == Truth::yes ? Truth::yes else Truth::unknown {
   doc /* Rule 9(a)(i): as near as safe and practicable. No geometric edge offset is invented.*/
  }
  out attribute channelObligationsSupported : Boolean = nonImpedimentDuty != Truth::unknown and crossingProhibited == Truth::no and starboardEdgeDuty != Truth::unknown and ((nonImpedimentDuty == Truth::no and starboardEdgeDuty == Truth::no) or channelPlanSupported == Truth::yes) {
   doc /* Engineering readiness check; nonimpediment remains separate and is not erased by stand-on status.*/
  }
  out attribute rule19AssessmentNeeded : Boolean = inSight != Truth::yes and restrictedVisibility != Truth::no {
   doc /* No Rule 19 maneuver logic is implemented; no use of Rule 12/17 role logic for nonvisual encounters.*/
  }
  out attribute selectionSupported : Boolean = pairwiseScopeSupported and candidateDirectionSupported and escalationAssessmentComplete and role != EncounterRole::unsupported and response != Response::unresolved and immediateDanger == Truth::no and lookoutAdequate == Truth::yes and safeSpeedSupported == Truth::yes and channelObligationsSupported and ((response == Response::monitor or response == Response::holdCourseSpeed) or ownAvoidanceFeasible == Truth::yes) {
   doc /* Support for this pairwise assessment only. CandidateAssessment composes other independently evaluated obligations; this flag alone never approves a trajectory or overall compliance.*/
  }
  out attribute emergencyReviewRequired : Boolean = immediateDanger != Truth::no {
   doc /* Rule 2 assessment remains separate from specific duties; no automatic permission to depart from a rule.*/
  }
  out attribute escalationAssessmentComplete : Boolean = role != EncounterRole::standOn or giveWayAloneSufficient != Truth::unknown {
   doc /* Engineering completeness check: a known permission to act does not establish whether action is already mandatory.*/
  }
  out attribute completeComplianceEstablished : Boolean = false {
   doc /* Rules 2, 5-8 require broader assessment; numeric motion, sound/light signals, Rule 18, Rule 19 and special cases are not fully implemented.*/
  }
  in attribute clearanceEvidenceAdequate : InlandNavigationExperiment::Truth {
   doc /* Independent assessment supporting finally-past-and-clear. May be established despite loss of visual contact; it must not default from a vanished or unreliable track.*/
  }
  in attribute powerEncounter : InlandNavigationExperiment::PowerEncounter;
  in attribute targetSide : InlandNavigationExperiment::TargetSide;
  in attribute headOnDoubt : InlandNavigationExperiment::Truth;
  in attribute passageAgreement : InlandNavigationExperiment::PassageAgreement;
  in attribute specialRiverRulesApply : InlandNavigationExperiment::Truth;
  in attribute ownRiverMotion : InlandNavigationExperiment::RiverMotion;
  in attribute otherRiverMotion : InlandNavigationExperiment::RiverMotion;
  in attribute downboundFollowingCurrent : InlandNavigationExperiment::Truth;
  in attribute ownUnderway : InlandNavigationExperiment::Truth;
  in attribute otherUnderway : InlandNavigationExperiment::Truth;
  in attribute portTurnProposed : InlandNavigationExperiment::Truth;
  in attribute crossAheadProposed : InlandNavigationExperiment::Truth;
  in attribute circumstancesAdmit : InlandNavigationExperiment::Truth;
  out attribute powerPair : Boolean = ownKind == VesselKind::power and otherKind == VesselKind::power;
  out attribute headOnPresumed : Boolean = powerPair and (powerEncounter == PowerEncounter::headOn or headOnDoubt != Truth::no);
  out attribute riverRole : InlandNavigationExperiment::EncounterRole = if not powerPair or specialRiverRulesApply == Truth::no ? EncounterRole::noPairRole else if specialRiverRulesApply == Truth::unknown ? EncounterRole::unsupported else if ownRiverMotion == RiverMotion::crossing and (otherRiverMotion == RiverMotion::upbound or otherRiverMotion == RiverMotion::downbound) ? EncounterRole::giveWay else if otherRiverMotion == RiverMotion::crossing and (ownRiverMotion == RiverMotion::upbound or ownRiverMotion == RiverMotion::downbound) ? EncounterRole::standOn else if ownRiverMotion == RiverMotion::upbound and otherRiverMotion == RiverMotion::downbound and downboundFollowingCurrent == Truth::yes ? EncounterRole::giveWay else if ownRiverMotion == RiverMotion::downbound and otherRiverMotion == RiverMotion::upbound and downboundFollowingCurrent == Truth::yes ? EncounterRole::standOn else if ownRiverMotion == RiverMotion::unresolved or otherRiverMotion == RiverMotion::unresolved or downboundFollowingCurrent == Truth::unknown ? EncounterRole::unsupported else EncounterRole::noPairRole;
  out attribute ownRule18GiveWay : Boolean = ((ownKind == VesselKind::power or ownKind == VesselKind::sailing or ownKind == VesselKind::fishing) and (otherKind == VesselKind::notUnderCommand or otherKind == VesselKind::restrictedManeuverability)) or ((ownKind == VesselKind::power or ownKind == VesselKind::sailing) and otherKind == VesselKind::fishing) or (ownKind == VesselKind::power and otherKind == VesselKind::sailing);
  out attribute otherRule18GiveWay : Boolean = ((otherKind == VesselKind::power or otherKind == VesselKind::sailing or otherKind == VesselKind::fishing) and (ownKind == VesselKind::notUnderCommand or ownKind == VesselKind::restrictedManeuverability)) or ((otherKind == VesselKind::power or otherKind == VesselKind::sailing) and ownKind == VesselKind::fishing) or (otherKind == VesselKind::power and ownKind == VesselKind::sailing);
  out attribute ordinaryRole : InlandNavigationExperiment::EncounterRole = if ownUnderway != Truth::yes or otherUnderway != Truth::yes ? EncounterRole::unsupported else if riverRole != EncounterRole::noPairRole ? riverRole else if ownRule18GiveWay ? EncounterRole::giveWay else if otherRule18GiveWay ? EncounterRole::standOn else if powerPair and headOnPresumed ? EncounterRole::mutualAvoidance else if powerPair and powerEncounter == PowerEncounter::crossing and targetSide == TargetSide::starboardSide ? EncounterRole::giveWay else if powerPair and powerEncounter == PowerEncounter::crossing and targetSide == TargetSide::portSide ? EncounterRole::standOn else sailingRole;
  out attribute headOnStarboardRequired : Boolean = role == EncounterRole::mutualAvoidance and (passageAgreement == PassageAgreement::none or passageAgreement == PassageAgreement::portToPort);
  out attribute agreedStarboardPassage : Boolean = role == EncounterRole::mutualAvoidance and passageAgreement == PassageAgreement::starboardToStarboard;
  out attribute rule17PortTurnRestricted : Boolean = powerPair and powerEncounter == PowerEncounter::crossing and role == EncounterRole::standOn and response == Response::mayAct and targetSide == TargetSide::portSide and circumstancesAdmit != Truth::no;
  out attribute crossAheadRestricted : Boolean = powerPair and powerEncounter == PowerEncounter::crossing and role == EncounterRole::giveWay and circumstancesAdmit != Truth::no;
  out attribute candidateDirectionSupported : Boolean = (not headOnStarboardRequired or (portTurnProposed == Truth::no and starboardTurnProposed == Truth::yes)) and (not rule17PortTurnRestricted or portTurnProposed == Truth::no) and (not crossAheadRestricted or crossAheadProposed == Truth::no) and passageAgreement != PassageAgreement::unresolved;
  in attribute otherNavigatingChannel : InlandNavigationExperiment::Truth;
  in attribute starboardTurnProposed : InlandNavigationExperiment::Truth;
 }
 enum def PowerEncounter {
     enum headOn;
     enum crossing;
     enum none;
     enum uncertain;
 }
 enum def TargetSide {
     enum portSide;
     enum starboardSide;
     enum ahead;
     enum astern;
     enum unresolved;
 }
 enum def RiverMotion {
     enum upbound;
     enum downbound;
     enum crossing;
     enum other;
     enum unresolved;
 }
 enum def PassageAgreement {
     enum none;
     enum portToPort;
     enum starboardToStarboard;
     enum unresolved;
 }
}