package BlueDogCoupledUncertainty {
    private import ScalarValues::*;
    doc /* Explicit engineering sensitivity brackets, not calibrated probability
     * distributions or qualified tolerances. They expose dependence on missing
     * material/actuator/polar/environment evidence; they do not replace it. */
    analysis Inputs {
        out attribute nominal : Real [41] ordered nonunique = BlueDogCoupledSizing::Inputs.parameterValues;
        out attribute construction : Real [41] ordered nonunique = (1..41)->ControlFunctions::collect { in i : Integer; if i == 1 ? 1.2 else if i == 13 ? 120 else if i == 14 ? 0.7 else if i == 21 ? 0.225 else if i == 23 ? 3 else BlueDogCoupledSizing::Inputs.parameterValues#(i) };
        out attribute aerodynamic : Real [41] ordered nonunique = (1..41)->ControlFunctions::collect { in i : Integer; if i == 15 ? BlueDogAerodynamicPolicy::stress.profileCd else if i == 16 ? BlueDogAerodynamicPolicy::stress.clLimit else if i == 17 ? BlueDogAerodynamicPolicy::stress.liftScale else if i == 18 ? BlueDogAerodynamicPolicy::stress.dragScale else BlueDogCoupledSizing::Inputs.parameterValues#(i) };
        out attribute hydrodynamic : Real [41] ordered nonunique = (1..41)->ControlFunctions::collect { in i : Integer; if i == 25 ? 1.3 else BlueDogCoupledSizing::Inputs.parameterValues#(i) };
        out attribute energy : Real [41] ordered nonunique = (1..41)->ControlFunctions::collect { in i : Integer; if i == 2 ? 0.25 else if i == 3 ? 0.7 else if i == 5 ? 0.15 else if i == 7 ? 0.05 else if i == 8 ? 0.95 else if i == 10 ? 0.1 else if i == 11 ? 5.5 + BlueDogWindEquipment::challenge.busPowerW else if i == 12 ? 0.45 else BlueDogCoupledSizing::Inputs.parameterValues#(i) };
        out attribute combined : Real [41] ordered nonunique = (1..41)->ControlFunctions::collect { in i : Integer; if i == 25 ? 1.3 else if i == 1 ? 1.2 else if i == 13 ? 120 else if i == 14 ? 0.7 else if i == 21 ? 0.225 else if i == 23 ? 3 else if i == 15 ? BlueDogAerodynamicPolicy::stress.profileCd else if i == 16 ? BlueDogAerodynamicPolicy::stress.clLimit else if i == 17 ? BlueDogAerodynamicPolicy::stress.liftScale else if i == 18 ? BlueDogAerodynamicPolicy::stress.dragScale else if i == 2 ? 0.25 else if i == 3 ? 0.7 else if i == 5 ? 0.15 else if i == 7 ? 0.05 else if i == 8 ? 0.95 else if i == 10 ? 0.1 else if i == 11 ? 5.5 + BlueDogWindEquipment::challenge.busPowerW else if i == 12 ? 0.45 else BlueDogCoupledSizing::Inputs.parameterValues#(i) };
        out attribute nominalRoute : Real [7] ordered nonunique = (0.95,0.5,1,TransGorgeCourse::policy.referenceLegLengthM,0,0.5,1);
        out attribute adverseRoute : Real [7] ordered nonunique = (0.90,0.75,1.25,TransGorgeCourse::policy.referenceLegLengthM,0,0.5,1);
    }
    dependency materialEvidence from Inputs to BlueDogStructure::structuralIntegrity;
    dependency energyEvidence from Inputs to BlueDogRequirements::sustainedEnergyFeasibility;
    dependency routeEvidence from Inputs to BlueDogRequirements::cruiseEvidence;
}
