package BlueDogSizingEvidence {
    private import ScalarValues::*;
    part def Scenario {
        attribute label : String;
        attribute numericallyBalanced : Boolean;
        attribute operatingMargins : Real [1..*] ordered nonunique;
        attribute structuralMargins : Real [1..*] ordered nonunique;
        attribute routeMargins : Real [1..*] ordered nonunique;
        attribute restoringMomentsNm : Real [1..*] ordered nonunique;
        attribute missingPitchRoots : Integer;
        attribute pitchUnstableSamples : Integer;
        attribute diagnosticControlCases : Integer;
        attribute easterlyHours : Real;
        attribute westerlyHours : Real;
        attribute massKg : Real;
        attribute evidenceAccepted : Boolean;
        attribute acceptanceRouteMargins : Real [1..*] ordered nonunique default = routeMargins;
        attribute operatingScreensPass : Boolean = numericallyBalanced and
            operatingMargins->ControlFunctions::forAll { in x : Real; x >= -0.0001 } and
            structuralMargins->ControlFunctions::forAll { in x : Real; x >= -0.0001 } and
            acceptanceRouteMargins->ControlFunctions::forAll { in x : Real; x >= -0.0001 };
        attribute sampledRollPositive : Boolean = missingPitchRoots == 0 and
            restoringMomentsNm->ControlFunctions::forAll { in x : Real; x > 0 };
        doc /* Recorded numerical evidence only. Route durations from diagnostic
         * energy-unconstrained controls are not sustained-operation claims.
         * sampledRollPositive does not assert pitch stability or dynamic recovery.
         * evidenceAccepted is an independent review disposition, never inferred
         * from numerical convergence or these screening predicates. */
    }
    analysis def Review {
        subject scenario : Scenario;
        out attribute operatingScreensPass : Boolean = scenario.operatingScreensPass;
        out attribute sampledRollPositive : Boolean = scenario.sampledRollPositive;
        out attribute evidenceAccepted : Boolean = scenario.evidenceAccepted;
        metadata rationale : ModelingMetadata::Rationale { text = "Recorded margins are inspected with explicit tolerances. The numerical model omits physical qualification evidence; this analysis is not a verification case."; }
    }
    dependency operatingEvidence from Review to BlueDogRequirements::legProgress;
    dependency durationEvidence from Review to BlueDogRequirements::passageDuration;
    dependency energyEvidence from Review to BlueDogRequirements::lowEnergyRecovery;
    dependency structureEvidence from Review to BlueDogStructure::structuralIntegrity;
    dependency recoveryEvidence from Review to BlueDogRequirements::selfRighting;
}
