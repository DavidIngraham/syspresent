package MarinePropulsion {
    private import ScalarValues::*;
    calc def IdealAxialDiskPower {
        doc /* Steady ideal axial actuator disk. Inputs: thrust N, diameter m,
         * fluid density kg/m3 and nonnegative axial inflow m/s. Output W.
         * Excludes swirl/profile losses, installation effects, crossflow,
         * ventilation and cavitation. Callers qualify the operating domain. */
        in thrustN : Real;
        in diameterM : Real;
        in densityKgM3 : Real;
        in axialSpeedMS : Real;
        attribute diskAreaM2 : Real = 3.141592653589793 * diameterM * diameterM / 4;
        attribute inducedSpeed : Real = (-axialSpeedMS + RealFunctions::sqrt(axialSpeedMS * axialSpeedMS + 2 * thrustN / (densityKgM3 * diskAreaM2))) / 2;
        return powerW : Real = thrustN * (axialSpeedMS + inducedSpeed);
    }
}
