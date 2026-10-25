package MarineReliability {
    private import ScalarValues::*;
    calc def ConstantHazardSurvival {
        in ratePerHour : Real;
        in hours : Real;
        return survival : Real = OpenSysMLMathFunctions::exp(-ratePerHour * hours);
    }
    calc def EqualSurvivalRate {
        in survival : Real;
        in hours : Real;
        return ratePerHour : Real = -OpenSysMLMathFunctions::ln(survival) / hours;
    }
    doc /* Constant nonnegative mission-critical hazard, no repair, hours > 0,
     * and 0 < target survival <= 1. NIST Engineering Statistics Handbook,
     * https://itl.nist.gov/div898/handbook/apr/section1/apr161.htm.
     * The calculation does not estimate rates or represent impact/cycle damage. */
}
