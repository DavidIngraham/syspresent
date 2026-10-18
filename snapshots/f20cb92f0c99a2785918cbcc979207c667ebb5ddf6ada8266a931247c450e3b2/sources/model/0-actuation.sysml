package BlueDogWingActuator {
    private import ScalarValues::*;
    public import MarineActuation::*;
    doc /* Output-shaft torque and speed drive electrical consumption. Efficiency
     * and idle/no-load losses are measured or bounded inputs, not free design
     * improvements. A self-locking candidate may be studied with holding motor
     * power zero, but that assumption is distinct from verified holding behavior.
     * The external search must retain power-loss trim and capsize checks. */



    analysis accountingExample {
        doc /* Arithmetic check, not component specifications or mission evidence.
         * 1 Nm at 0.2 rad/s; 80% motor, 40% gearbox; 1 W no-load,
         * 0.1 W controller; 2% moving, 98% holding. */
        out attribute locked : Real [3] ordered nonunique = DrivePower(1,0.2,0.8,0.4,1,0.1,0,0.02,0.98);
        out attribute poweredHold : Real [3] ordered nonunique = DrivePower(1,0.2,0.8,0.4,1,0.1,2,0.02,0.98);
        out attribute lockedWhPerDay : Real = DailyEnergy(locked#(1),24);
        out attribute poweredHoldWhPerDay : Real = DailyEnergy(poweredHold#(1),24);
    }
    dependency sustainedEnergy from DrivePower to BlueDogRequirements::sustainedEnergyFeasibility;
    dependency lockedTrimRecovery from DrivePower to BlueDogRequirements::capsizeControlRecovery;
    dependency loadSizing from MastTorque to BlueDogStructure::structuralIntegrity;
}
