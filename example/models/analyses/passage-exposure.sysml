package BlueDogPassageExposure {
    private import ScalarValues::*;
    analysis Contours {
        out attribute hours : Real [15] ordered = (12,18,24,30,36,42,48,54,60,66,72,78,84,90,96);
        out attribute rate99 : Real [15] ordered nonunique = hours->ControlFunctions::collect { in h : Real; MarineReliability::EqualSurvivalRate(0.99,h) };
        out attribute rate95 : Real [15] ordered nonunique = hours->ControlFunctions::collect { in h : Real; MarineReliability::EqualSurvivalRate(0.95,h) };
        out attribute rate90 : Real [15] ordered nonunique = hours->ControlFunctions::collect { in h : Real; MarineReliability::EqualSurvivalRate(0.90,h) };
        out attribute rate80 : Real [15] ordered nonunique = hours->ControlFunctions::collect { in h : Real; MarineReliability::EqualSurvivalRate(0.80,h) };
        out attribute exampleHours : Real [2] ordered = (60,30);
        out attribute exampleRates : Real [2] ordered = (0.001,0.0015);
        out attribute slowerSurvival : Real = MarineReliability::ConstantHazardSurvival(exampleRates#(1),exampleHours#(1));
        out attribute fasterSurvival : Real = MarineReliability::ConstantHazardSurvival(exampleRates#(2),exampleHours#(2));
        out attribute fasterWins : Boolean = fasterSurvival > slowerSurvival;
        metadata rationale : ModelingMetadata::Rationale { text = "Illustrative sensitivity for the finite Gorge mission: hourly critical failure rate may rise if total accumulated hazard falls. Points are hypothetical, not displacement/planing predictions or measured Blue Dog rates. Contours describe conditional hardware survival only; route completion, holds, weather and operational failures require joint trajectory evaluation."; }
    }
    dependency missionSelection from Contours to BlueDogMissionScope::current;
    dependency exposureCriterion from Contours to BlueDogRequirements::passageDuration;
    dependency survivalCriterion from Contours to BlueDogRequirements::missionSuccessProbability;
    dependency failureMechanisms from Contours to BlueDogDFMEA::starter;
}
