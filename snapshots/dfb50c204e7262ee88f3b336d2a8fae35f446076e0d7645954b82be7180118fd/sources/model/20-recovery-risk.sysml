package BlueDogRecoveryRisk {
    private import ScalarValues::*;
    doc /* Sensitivity study for recovery after loss of traffic sensing. All rates
     * are hypotheses. This is not evidence that failures or collisions are rare. */
    calc def ExposureBound {
        in lossRatePerHour : Real;
        in missionHours : Real;
        in conflictRatePerHour : Real;
        in recoveryHours : Real;
        return probability : Real = (1-MarineReliability::ConstantHazardSurvival(lossRatePerHour,missionHours))*(1-MarineReliability::ConstantHazardSurvival(conflictRatePerHour,recoveryHours));
    }
    analysis Sensitivity {
        out attribute lossRatesPerHour : Real [9] ordered nonunique = (0.0001,0.0001,0.0001,0.001,0.001,0.001,0.01,0.01,0.01);
        out attribute recoveryHours : Real [9] ordered nonunique = (0.25,1,4,0.25,1,4,0.25,1,4);
        out attribute bounds : Real [9] ordered nonunique = (1..9)->ControlFunctions::collect {
            in i : Integer; ExposureBound(lossRatesPerHour#(i),48,0.1,recoveryHours#(i)) };
    }
    part disposition {
        attribute architecture : String = "Retain autonomous conspicuous shore recovery with no assumed backup detector. Minimize exposure using the reachable least-risk shore route; operator contact is not a prerequisite.";
        attribute interpretation : String = "A 48 h example passage, loss rates 1e-4 to 1e-2 per hour and 0.1 conflicting encounter per hour span sensitivity only. Every conflicting encounter is pessimistically treated as contact. The product assumes conditional independence of sensing loss and subsequent traffic; fog, waves and common-power failures can invalidate it. Analyze these as separate deterministic cases. DFMEA ranks do not supply rates.";
        attribute releaseCondition : String = "Before unattended trials, demonstrate casualty maneuvering and retention; measure installed fault exposure and local traffic; assess injury, entanglement and impediment as well as collision probability. If residual risk cannot be accepted, restrict the operating window/route or add independent protection. SRR approval does not accept that risk.";
    }
    dependency safetyBasis from disposition to GorgeChallenge::autonomousShoreRecovery;
    dependency casualtyBasis from Sensitivity to GorgeChallenge::capsizeRecovery;
}
