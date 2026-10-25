package BlueDogCoupledSizing {
    private import ScalarValues::*;
    public import MarineMass::*;
    private import BlueDogStructure::material;
    doc /* CAD/mesh metrics supply geometry; native calculations own material mass,
     * center of gravity and engineering loads. All numerical process allocations
     * and aerodynamic discrepancy factors remain provisional evidence inputs. */
    analysis Inputs {
        out attribute designNames : String [*] ordered nonunique = ("length_m", "beam_m", "bottom_depth_m", "deck_height_m", "sail_m2", "sail_AR", "camber_scale", "wing_thickness_scale", "mast_fraction", "mast_x_fraction", "keel_m2", "keel_span_m", "rudder_m2", "rudder_span_m", "rudder_arm_fraction", "ballast_kg", "battery_Wh", "panel_m2", "wing_torque_Nm", "rudder_torque_Nm", "hull_glass_kg_m2", "wing_glass_kg_m2", "keel_glass_kg_m2", "rudder_glass_kg_m2", "hull_rib_pitch_m", "foil_rib_pitch_m", "battery_x_fraction", "battery_z_fraction", "hull_fullness_exponent");
        out attribute referenceDesign : Real [*] ordered nonunique = MarineDesign::DesignVector(BlueDogConfigurations::reference);
        out attribute parameterNames : String [*] ordered nonunique = ("resinGlassRatio", "gearboxEfficiency", "motorEfficiency", "wingNoLoadW", "wingControllerW", "wingMotorHoldingW", "wingMoveFraction", "wingHoldingFraction", "rudderHoldingWPerNm", "rudderMoveFraction", "electronicsW", "solarResourceFactor", "batteryWhKg", "laminateKnockdown", "profileCd", "wingClLimit", "wingLiftScale", "wingDragScale", "wingRateRadS", "rudderRateRadS", "driveKgPerNm", "wingDriveBaseKg", "fixedEquipmentKg", "attachmentKg", "residuaryResistanceFactor", "viscousFormFactor", "foilClLimit", "foilEfficiency", "foilCd", "airNu", "waterNu", "waterDensity", "airDensity", "ballastDensity", "gravity", "loadFactor", "assemblyLimitKg", "panelCoverage", "elevatedEquipmentKg", "elevatedEquipmentXFraction", "elevatedEquipmentAboveDeckM");
        out attribute parameterValues : Real [*] ordered nonunique = MarineDesign::ParametersVector(BlueDogConfigurations::assumptions);
        out attribute materialValues : Real [*] ordered nonunique = (material.tapeWidth, material.printTile, material.tapeDryMass, material.petgDensity, material.hullPrintWall, material.finishingMass, material.ribHeight, material.glassDensity, material.epoxyDensity, material.foilPrintWall);
    }

    dependency manufacturing from MassProperties to BlueDogStructure::hybridConstruction;
    dependency handling from MassProperties to BlueDogRequirements::liftMass;
    dependency geometryRecovery from MassProperties to BlueDogRequirements::selfRighting;
}
