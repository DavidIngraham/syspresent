package MarineActuation {
    private import ScalarValues::*;

    calc def MastTorque {
        in densityKgM3 : Real;
        in apparentWindMS : Real;
        in sailAreaM2 : Real;
        in chordM : Real;
        in momentCoefficientAtMast : Real;
        in bearingFrictionNm : Real;
        return torqueNm : Real;
        0.5*densityKgM3*apparentWindMS*apparentWindMS*sailAreaM2*chordM*RealFunctions::abs(momentCoefficientAtMast)+bearingFrictionNm
    }
    calc def DrivePower {
        doc /* Preconditions: efficiencies in (0,1], nonnegative powers and duty
         * fractions; moving plus holding fraction at most one. The external
         * sizing adapter must reject inputs outside these domains. */
        in shaftTorqueNm : Real;
        in shaftSpeedRadS : Real;
        in motorEfficiency : Real;
        in gearboxEfficiency : Real;
        in motorNoLoadW : Real;
        in controllerW : Real;
        in motorHoldingW : Real;
        in moveFraction : Real;
        in holdingFraction : Real;
        attribute movingW : Real = controllerW+motorNoLoadW+RealFunctions::abs(shaftTorqueNm*shaftSpeedRadS)/(motorEfficiency*gearboxEfficiency);
        attribute holdingW : Real = controllerW+motorHoldingW;
        return powersW : Real [3] ordered nonunique;
        (moveFraction*movingW+holdingFraction*holdingW+(1-moveFraction-holdingFraction)*controllerW,
         NumericalFunctions::max(movingW,holdingW),movingW)
    }
    calc def DailyEnergy {
        in averagePowerW : Real;
        in durationHours : Real;
        return energyWh : Real;
        averagePowerW*durationHours
    }
}
