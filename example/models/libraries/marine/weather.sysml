package MarineWeather {
    private import ScalarValues::*;
    calc def TwoRegimeCoverage {
        in eastProbability : Real;
        in westPass : Boolean;
        in eastPass : Boolean;
        return coverage : Real;
        (1-eastProbability)*(if westPass ? 1 else 0) + eastProbability*(if eastPass ? 1 else 0)
    }
    calc def ConditionalPassageHours {
        in eastProbability : Real;
        in westPass : Boolean;
        in eastPass : Boolean;
        in westHours : Real;
        in eastHours : Real;
        attribute coverage : Real = TwoRegimeCoverage(eastProbability,westPass,eastPass);
        return hours : Real;
        if coverage > 0 ? ((1-eastProbability)*(if westPass ? westHours else 0) + eastProbability*(if eastPass ? eastHours else 0))/coverage else 0
    }
    doc /* Arithmetic for two mutually exclusive full-passage regime hypotheses.
     * Caller must validate 0<=p<=1, finite nonnegative times for passing cases,
     * and report coverage=0 as no conditional time (not a zero-hour passage).
     * Station hourly direction fractions are not full-passage probabilities.
     * Coverage is a route-screen sensitivity, not system reliability. */
}
