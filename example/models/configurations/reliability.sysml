package BlueDogReliabilityExamples {
    private import SI::*;
    part gorgeIllustration : BlueDogReliability::VoyageProfile {
        doc /* Synthetic 100 km each-way profile; not surveyed challenge gates or a predicted polar.
         * 2.5 m/s water VMG with 20 percent loss, +/-1.5 m/s current, six hours of holds.
         * Failure-rate and test-hour inputs are illustrative, not collected evidence. */
        ref part :>> vessel = BlueDog::Architecture::missionContext.boat;
        part upstream : BlueDogReliability::SailingLeg subsets legs {
            attribute :>> distance default = 100000 [m];
            attribute :>> waterVMG default = 2.5 [m/s];
            attribute :>> currentVMG default = -1.5 [m/s];
            attribute :>> retainedPerformance default = 0.8;
        }
        part downstream : BlueDogReliability::SailingLeg subsets legs {
            attribute :>> distance default = 100000 [m];
            attribute :>> waterVMG default = 2.5 [m/s];
            attribute :>> currentVMG default = 1.5 [m/s];
            attribute :>> retainedPerformance default = 0.8;
        }
        attribute :>> holdTime default = 21600 [s];
        attribute :>> qualifiedDuration default = 259200 [s];
        attribute :>> criticalRatesPerHour default = (0.0002, 0.0003);
        attribute :>> commonCauseRatePerHour default = 0.0001;
        attribute :>> zeroFailureTestHours default = 2000;
        attribute :>> observedCriticalFailures default = 0;
        attribute :>> profileEvidenceAccepted default = false;
        attribute :>> rateEvidenceAccepted default = false;
        attribute :>> constantHazardAccepted default = false;
    }
    analysis gorgeAssessment : BlueDogReliability::CruiseReliability { subject :>> profile = gorgeIllustration; }
}
