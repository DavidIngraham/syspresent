package BlueDogMissionScope {
    private import ScalarValues::*;
    enum def MissionKind { gorge; futureOcean; futureEndurance; }
    metadata def Applicability {
        attribute mission : MissionKind;
    }
    metadata applicability : Applicability about GorgeChallenge::RepeatedOperation {
        mission = MissionKind::futureEndurance;
    }
    part current {
        attribute designObjective : String = "Maximize probability of completing one unassisted sail-only Gorge round trip within a selected weather window";
        attribute requiresOceanQualification : Boolean = false;
        attribute requiresIndefiniteOperation : Boolean = false;
        attribute requiresRepeatableEnergyBalance : Boolean = false;
        attribute hasCompletionDeadline : Boolean = false;
        metadata rationale : ModelingMetadata::Rationale { text = "Owner decision: focus on the finite Gorge challenge. Retain finite battery accounting and reserve protection; no fixed-duration campaign constrains acceptance; no Hawaii route, saltwater profile or indefinite operation constraint is inherited. Passage time, speed-dependent failure exposure and weather-window completion should be compared together. Safety dispositions remain independent launch gates."; }
        metadata issue : ModelingMetadata::Issue { text = "Archived studies retain their original daily-balance screens. Active Gorge sizing uses instantaneous peak-power checks; chronological mission execution must establish finite energy feasibility. Speed/load-dependent failure evidence and a valid planing model remain necessary for comparing hull regimes."; }
    }
    part future {
        attribute designObjective : String = "Define a separate Hawaii mission and persistent-operation capability";
        attribute acceptanceAllocated : Boolean = false;
        metadata rationale : ModelingMetadata::Rationale { text = "Hawaii remains a future mission with independently allocated route, weather, endurance, communications, maintenance and recovery constraints. Existing ocean limits and repeating-energy cases are candidate future studies; they do not constrain Gorge acceptance."; }
    }
    dependency currentMission from current to GorgeChallenge::transGorgeChallenge;
    dependency futureMission from future to BlueDog::Goals::hawaiiVoyage;
}
