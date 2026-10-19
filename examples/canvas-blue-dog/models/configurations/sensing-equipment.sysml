package BlueDogSensingEquipment {
    doc /* Physical installation hypotheses reviewed 2026-10-16. Supplier specifications are component inputs, not demonstrated detection range, latency or full installed budgets. See evidence/sensing/2026-10-16/sources.json and docs/reference/sensing-configurations.md. No sensing simulation is changed by this package.*/
    private import ScalarValues::*;
    part fixedHighResolution {
        doc /* SC-01: four Luxonis OAK-1 W IMX378 fixed-focus cameras at 90 degree azimuth spacing; on-camera RVC2 inference; Raspberry Pi4 ModelB host; externally powered USB3 hub; Quark QK-A026 AIS/GPS and separate antennas. Four95deg horizontal fields give only5deg nominal adjacent overlap before occlusion or calibration.*/
        attribute id : String = "SC-01";
        attribute cameraCount : Real = 4;
        attribute horizontalPixels : Real = 4056;
        attribute horizontalFovDeg : Real = 95;
        attribute cameraMassKg : Real = 0.0531;
        attribute cameraStreamingLowW : Real = 2.5;
        attribute cameraStreamingHighW : Real = 3.0;
        attribute cameraAiAllowanceW : Real = 1.0;
        attribute cameraEncoderAllowanceW : Real = 0.5;
        attribute knownCameraMassKg : Real = 0.2124;
        attribute nominalOverlapDeg : Real = 5;
        attribute primaryPlanningMassKg : Real = 0.9824;
        attribute cameraStreamingSubtotalLowW : Real = 10.0;
        attribute cameraFeatureAllowanceHighW : Real = 18.0;
        attribute installedBudgetComplete : Boolean = false;
        attribute rangeDemonstrated : Boolean = false;
        attribute latencyDemonstrated : Boolean = false;
        attribute invertedObservationDemonstrated : Boolean = false;
        attribute independentRecoveryComplete : Boolean = false;
        attribute recoveryBlocker : String = "Separate recovery power alone is insufficient: independent host, observation geometry, navigation, antennas and sealed upright/inverted mounting remain unselected. No primary camera/hub credit after shared failure or immersion.";
    }
    part fixedGlobalShutter {
        doc /* SC-02: three Luxonis OAK-1 W OV9782 fixed-focus global-shutter cameras at120degree spacing; same Pi4B host, powered hub andQKA026 AIS/GPS. Three127degree fields give7degree nominal adjacent overlap. Lower resolution trades angular detail for fewer camera loads.*/
        attribute id : String = "SC-02";
        attribute cameraCount : Real = 3;
        attribute horizontalPixels : Real = 1280;
        attribute horizontalFovDeg : Real = 127;
        attribute cameraMassKg : Real = 0.0531;
        attribute cameraStreamingLowW : Real = 2.5;
        attribute cameraStreamingHighW : Real = 3.0;
        attribute cameraAiAllowanceW : Real = 1.0;
        attribute cameraEncoderAllowanceW : Real = 0.5;
        attribute knownCameraMassKg : Real = 0.1593;
        attribute nominalOverlapDeg : Real = 7;
        attribute primaryPlanningMassKg : Real = 0.8493;
        attribute cameraStreamingSubtotalLowW : Real = 7.5;
        attribute cameraFeatureAllowanceHighW : Real = 13.5;
        attribute installedBudgetComplete : Boolean = false;
        attribute rangeDemonstrated : Boolean = false;
        attribute latencyDemonstrated : Boolean = false;
        attribute invertedObservationDemonstrated : Boolean = false;
        attribute independentRecoveryComplete : Boolean = false;
        attribute recoveryBlocker : String = "Separate recovery power alone is insufficient: independent host, observation geometry, navigation, antennas and sealed upright/inverted mounting remain unselected. No primary camera/hub credit after shared failure or immersion.";
    }
    part scanningCamera {
        doc /* SC-03: one OAK-1 W IMX378 on Hitec HS785HB azimuth winch, Pololu Micro Maestro6 controller, Pi4B host, powered hub andQKA026 AIS/GPS. Bounded360degree sweep and cable-safe return; splash-only servo requires sealed installation. Revisit delay is unresolved; not credited with simultaneous coverage.*/
        attribute id : String = "SC-03";
        attribute cameraCount : Real = 1;
        attribute horizontalPixels : Real = 4056;
        attribute horizontalFovDeg : Real = 95;
        attribute cameraMassKg : Real = 0.0531;
        attribute servoMassKg : Real = 0.11;
        attribute controllerMassKg : Real = 0.0048;
        attribute servoSupplyV : Real = 6.0;
        attribute servoIdleA : Real = 0.008;
        attribute servoNoLoadA : Real = 0.25;
        attribute servoStallA : Real = 1.8;
        attribute servoSecondsPer60Deg : Real = 1.38;
        attribute idealFullSweepSeconds : Real = 8.28;
        attribute primaryPlanningMassKg : Real = 0.7679;
        attribute installedBudgetComplete : Boolean = false;
        attribute rangeDemonstrated : Boolean = false;
        attribute latencyDemonstrated : Boolean = false;
        attribute invertedObservationDemonstrated : Boolean = false;
        attribute independentRecoveryComplete : Boolean = false;
        attribute recoveryBlocker : String = "Separate recovery power alone is insufficient: independent host, observation geometry, navigation, antennas and sealed upright/inverted mounting remain unselected. No primary camera/hub credit after shared failure or immersion.";
    }
    part underwaterOption {
        doc /* Blue Robotics Ping360 optional submerged sector scanner. Range is supplier instrument range, not weed detection evidence. Adds drag, mount and snag risk. Primary sonar mounted below hull may emerge when inverted; no recovery backup credit.*/
        attribute massWithCableKg : Real = 0.51;
        attribute supplierMaxPowerW : Real = 5.0;
        attribute supplierMaxRangeM : Real = 50.0;
        attribute fullScanAtMaxRangeSeconds : Real = 33.0;
        attribute minimumTemperatureC : Real = 0.0;
        attribute maximumTemperatureC : Real = 30.0;
    }
    part radarReference {
        doc /* Garmin GMRFantom18x is ruled out as an IC01 drop-in: component alone exceeds added mass allocation and electrical demand. Retained as size/power comparison, not an installation candidate.*/
        attribute componentMassKg : Real = 6.35;
        attribute supplierNormalMaxPowerW : Real = 33.0;
        attribute supplierSaveMaxPowerW : Real = 24.0;
        attribute supplierStandbyMaxPowerW : Real = 4.0;
    }
    part budgetBasis {
        doc /* IC01 current base4.5W plus8W increment and1.2kg additional equipment. The full4.5W cannot be freely reassigned if navigation/comms/recording remain. Shared replacements require explicit reconciliation. Recovery battery mass remains separate, recovery electronics/propulsion allocations must not be double-counted.*/
        attribute baseElectronicsW : Real = 4.5;
        attribute additionalSensingW : Real = 8.0;
        attribute additionalEquipmentKg : Real = 1.2;
        attribute aisSupplierMaxW : Real = 0.6;
    }
    part supportAllowances {
        doc /* Unmeasured project planning allowances per primary installation: Pi4B3-6W, powered hub0.3-1W, DC conversion0.90 efficiency; common support mass0.450kg for host, hub, storage, receivers/antennas, wiring, fusing and common case. Ring camera housing/mount allowance0.080kg per camera; scanner sealed bearing/mount allowance0.150kg. These are design targets, not supplier totals. Recovery-side sensing, washing/heating and any structural reinforcement excluded and unresolved.*/
        attribute hostLowW : Real = 3.0;
        attribute hostHighW : Real = 6.0;
        attribute hubLowW : Real = 0.3;
        attribute hubHighW : Real = 1.0;
        attribute conversionEfficiency : Real = 0.9;
        attribute commonPrimaryMassKg : Real = 0.45;
        attribute perFixedCameraHousingKg : Real = 0.08;
        attribute scannerMountKg : Real = 0.15;
    }
}