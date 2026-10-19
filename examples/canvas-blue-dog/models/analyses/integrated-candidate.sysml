package BlueDogIntegratedCandidate {
    private import ScalarValues::*;
    doc /* Current working integration candidate. A refined IC-01-scale vessel is the intended first physical build.
     * Allocations are not selected catalog equipment or measured performance.
     * Independent recovery includes separate power, thrust, navigation and observation paths.
     * Every capability and independence claim requires configuration-specific physical evidence. */
    part hypothesis {
        attribute identifier : String = "IC-01";
        attribute additionalBusW : Real = 8;
        attribute additionalEquipmentKg : Real = 1.2;
        attribute recoveryBatteryWh : Real = 60;
        attribute recoveryStandbyW : Real = 0.05;
        attribute recoveryMotorW : Real = 50;
        attribute recoveryEssentialW : Real = 8;
        attribute recoverySpeedMps : Real = 1.5;
        attribute invertedSpeedMps : Real = 0.5;
        attribute invertedMotorW : Real = 40;
        attribute recoveryUncertainty : Real = 1.2;
        attribute arrivalAllowanceWh : Real = 2;
        attribute batteryWhKg : Real = BlueDogConfigurations::assumptions.batteryWhKg;
        attribute electronicsW : Real = BlueDogConfigurations::assumptions.electronicsW + additionalBusW;
        attribute fixedEquipmentKg : Real = BlueDogConfigurations::assumptions.fixedEquipmentKg + additionalEquipmentKg + recoveryBatteryWh/batteryWhKg;
        attribute recoveryDepartureWh : Real = recoveryBatteryWh*0.8*0.9;
        attribute sensorRangeM : Real = BlueDogEncounterReview::criteria.rangeAllocationM {
            doc /* Historical 15 October IC-01 sensing hypothesis retained for archived replay. The 750 m value is not a current class-specific allocation; BlueDogClassDetection allocations remain unaccepted.*/
        }
        attribute weedRangeM : Real = 40;
        attribute sensorLatencyS : Real = 1;
        attribute assessmentS : Real = 1;
        attribute commandS : Real = 2;
        attribute maneuverS : Real = 15;
        attribute planningHorizonS : Real = 180;
        attribute minimumSailingSpeedMps : Real = 0.05;
        attribute depowerPenaltyM : Real = 180;
        attribute crossTrackWeight : Real = 0.5;
        attribute maneuverPenaltyM : Real = 10;
    }
    analysis Inputs {
        out attribute identifier : String = hypothesis.identifier;
        out attribute parameterNames : String [2] ordered nonunique = ("electronicsW","fixedEquipmentKg");
        out attribute parameterValues : Real [2] ordered nonunique = (hypothesis.electronicsW,hypothesis.fixedEquipmentKg);
        out attribute designNames : String [9] ordered nonunique = ("battery_Wh","beam_m","bottom_depth_m","deck_height_m","sail_m2","wing_glass_kg_m2","wing_torque_Nm","keel_glass_kg_m2","rudder_glass_kg_m2");
        out attribute designValues : Real [9] ordered nonunique = (1300,0.42,0.10,0.07,0.4,0.4,1.5,2.5,3);
        out attribute recoveryCapability : Real [7] ordered nonunique = (hypothesis.recoverySpeedMps,hypothesis.recoveryMotorW,hypothesis.recoveryEssentialW,hypothesis.recoveryUncertainty,hypothesis.arrivalAllowanceWh,hypothesis.invertedSpeedMps,hypothesis.invertedMotorW);
        out attribute recoveryDepartureWh : Real = hypothesis.recoveryDepartureWh;
        out attribute recoveryNameplateWh : Real = hypothesis.recoveryBatteryWh;
        out attribute recoveryStandbyW : Real = hypothesis.recoveryStandbyW;
        out attribute planningHorizonSeconds : Real = hypothesis.planningHorizonS;
        out attribute controlPeriodSeconds : Real = hypothesis.assessmentS;
        out attribute commandLatencySeconds : Real = hypothesis.commandS;
        out attribute maneuverSeconds : Real = hypothesis.maneuverS;
        out attribute minimumSailingSpeedMps : Real = hypothesis.minimumSailingSpeedMps;
        out attribute depowerPenaltyM : Real = hypothesis.depowerPenaltyM;
        out attribute crossTrackWeight : Real = hypothesis.crossTrackWeight;
        out attribute maneuverPenaltyM : Real = hypothesis.maneuverPenaltyM;
        out attribute sensorRangeM : Real = hypothesis.sensorRangeM;
        out attribute weedRangeM : Real = hypothesis.weedRangeM;
        out attribute sensorLatencyS : Real = hypothesis.sensorLatencyS;
        out attribute horizonS : Real = 14400;
        out attribute seeds : Integer [2] ordered nonunique = (17,29);
    }
    requirement def VirtualClosure {
        subject candidate;
        in attribute sizingPass : Boolean;
        in attribute nominalPass : Boolean;
        in attribute encountersPass : Boolean;
        in attribute recoveryPass : Boolean;
        in attribute energyPass : Boolean;
        in attribute timingPass : Boolean;
        in attribute assumptionsRecorded : Boolean;
        require constraint { sizingPass and nominalPass and encountersPass and recoveryPass and energyPass and timingPass and assumptionsRecorded }
    }
    calc def RecoveryBankAfterExposure {
        in exposureHours : Real;
        return remainingWh : Real = hypothesis.recoveryDepartureWh-hypothesis.recoveryStandbyW*exposureHours;
    }
    dependency sizing from Inputs to BlueDogCoupledSizing::Inputs;
    dependency sensing from Inputs to BlueDogRequirements::trafficSafety;
    dependency recovery from Inputs to GorgeChallenge::autonomousShoreRecovery;
    dependency energy from Inputs to BlueDogRequirements::lowEnergyRecovery;
}
