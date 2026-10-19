package BlueDogConceptCredibility {
    private import ScalarValues::*;
    part policy {
        attribute minimumUnderwaterAspectRatio : Real = 2;
        attribute rudderStockChordFraction : Real = 0.5;
        attribute rudderLoadChordFraction : Real = 0.25;
        doc /* The geometry rotates about mid-chord. Use the attached-flow
         * symmetric-section quarter-chord force location for the provisional
         * torque arm, rather than an independent 2-percent balance credit.
         * https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/aerodynamic-center/
         * Measured hinge moments and stalled/reversed-flow loads remain open. */
        attribute appendageClearanceM : Real = 0.02;
        doc /* Provisional screening allocations, not universal hydrodynamic limits.
         * AR >= 2 excludes squat foils from the simple finite-wing correction;
         * it does not validate that correction at AR=2. Both keel and rudder
         * need section/finite-span evidence before design acceptance.
         * 20 mm is a provisional rigid-geometry separation, not a deflection
         * or debris allowance. The current architecture has no aft outrigger:
         * rudder stock must be at or forward of the transom. A bracket concept
         * must explicitly add its structure, mass and loads before relaxing this.
         * Theory context: https://ntrs.nasa.gov/citations/19930085047 .
         * That source motivates a domain screen; it does not prescribe AR=2. */
    }
    part passagePolicy {
        attribute durationMultiplier : Real = 1.25;
        attribute delayHours : Real = 6;
        attribute batteryInstalledWhM3 : Real = 200000;
        attribute equipmentInstalledKgM3 : Real = 500;
        attribute usableHullVolumeFraction : Real = 0.5;
        doc /* Provisional selected-window allowances: 25 percent sailing-time
         * allowance plus six hours for traffic/weather delay; no deadline.
         * Battery allocation 200 Wh/litre includes pack enclosure; equipment
         * density 0.5 kg/litre includes installation space. Only half the hull
         * void is credited to account for access, taper and segregation.
         * These are not catalog data or calibrated probabilities. Sensitivity
         * cases must test them; actual equipment and CAD fit remain open. */
    }
    analysis Inputs {
        out attribute values : Real [5] ordered nonunique = (passagePolicy.durationMultiplier,passagePolicy.delayHours,passagePolicy.batteryInstalledWhM3,passagePolicy.equipmentInstalledKgM3,passagePolicy.usableHullVolumeFraction);
    }
    analysis SensitivityInputs {
        doc /* One-at-a-time engineering probes, not probability distributions.
         * No probe changes the nominal search constraints. Recovery samples
         * are sparse diagnostics, never dynamic self-righting qualification. */
        out attribute durationMultiplier : Real [3] ordered nonunique = (1,1.25,1.5);
        out attribute delayHours : Real [3] ordered nonunique = (0,6,12);
        out attribute batteryInstalledWhM3 : Real [3] ordered nonunique = (150000,200000,250000);
        out attribute equipmentInstalledKgM3 : Real [3] ordered nonunique = (250,500,750);
        out attribute usableHullVolumeFraction : Real [3] ordered nonunique = (0.35,0.5,0.65);
        out attribute minimumUnderwaterAspectRatio : Real [3] ordered nonunique = (1.5,2,3);
        out attribute recoveryProbeHeels : Real [6] ordered nonunique = (-150,-90,-30,30,90,150);
    }
    dependency enduranceScope from passagePolicy to BlueDogRequirements::multiDayEndurance;
    dependency reserveScope from passagePolicy to BlueDogRequirements::lowEnergyRecovery;
    dependency packagingScope from passagePolicy to BlueDogRequirements::transportability;
    dependency steeringScope from policy to BlueDogRequirements::navigationAndControl;
    dependency handlingScope from policy to BlueDogRequirements::transportability;
    dependency structureScope from policy to BlueDogStructure::structuralIntegrity;
    comment remainingAcceptanceGaps /* Geometry screening is necessary but insufficient.
     * Candidate voyage energy (including reserve and weather delays), component
     * volume/installation space, real foil polars and stall/ventilation,
     * rudder stock/bearings and joints, fatigue/slamming, dynamic recovery and
     * packaging of 250 mm printed segments remain acceptance work.
     * Do not promote coarseFeasible to a credible or mission-qualified design.
     * Report hull length separately from the complete operating envelope;
     * the owner-selected challenge limit is 1.2 m overall. */
}
