package BlueDogIC01 {
    private import ScalarValues::*;
    doc /* IC-01 is the provisional finite-Gorge integration configuration.
     * The complete geometry is explicitly owned here. Exact values preserve the
     * 15 October archived candidate; they are not measured manufacturing precision.
     * The wing model is a sizing representation, not a rig selection. Soft sail,
     * tail-controlled wing and directly rotated fixed-camber wing remain contenders.
     * Physical qualification and accepted installed equipment remain open. */
    part design : MarineDesign::Design {
        attribute configurationId : String = "IC-01";
        attribute missionId : String = "Trans-Gorge";
        attribute designSource : String = "evidence/runs/2026-10-15-integrated-candidate/integrated-sizing.json";
        attribute sourceRevision : String = "86049ae5ee0429fd2c7b350228d3a544428a4aaf";
        attribute physicallyQualified : Boolean = false;
        attribute :>> length_m = 1.1999999999991275;
        attribute :>> beam_m = 0.42;
        attribute :>> bottom_depth_m = 0.1;
        attribute :>> deck_height_m = 0.07;
        attribute :>> sail_m2 = 0.4;
        attribute :>> sail_AR = 2.341980758978876;
        attribute :>> camber_scale = 1.5;
        attribute :>> wing_thickness_scale = 2.0;
        attribute :>> mast_fraction = 0.5238422485213118;
        attribute :>> mast_x_fraction = -0.1481170636448525;
        attribute :>> keel_m2 = 0.02;
        attribute :>> keel_span_m = 0.19999999999977908;
        attribute :>> rudder_m2 = 0.017679746777796716;
        attribute :>> rudder_span_m = 0.188041210379152;
        attribute :>> rudder_arm_fraction = 0.420003780182039;
        attribute :>> ballast_kg = 0.5;
        attribute :>> battery_Wh = 1300;
        attribute :>> panel_m2 = 0.05;
        attribute :>> wing_torque_Nm = 1.5;
        attribute :>> rudder_torque_Nm = 0.34378095116731916;
        attribute :>> hull_glass_kg_m2 = 0.452496128293465;
        attribute :>> wing_glass_kg_m2 = 0.4;
        attribute :>> keel_glass_kg_m2 = 2.5;
        attribute :>> rudder_glass_kg_m2 = 3;
        attribute :>> hull_rib_pitch_m = 0.022436816975681086;
        attribute :>> foil_rib_pitch_m = 0.2299999999996331;
        attribute :>> battery_x_fraction = -2.528793840994581e-11;
        attribute :>> battery_z_fraction = 0.05;
        attribute :>> hull_fullness_exponent = 2.0;
    }
    part integration {
        attribute identifier : String = design.configurationId;
        attribute additionalBusW : Real = 8;
        attribute additionalEquipmentKg : Real = 1.2;
        attribute independentRecoveryAssumed : Boolean = true;
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
}
