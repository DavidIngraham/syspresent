package BlueDogSailingExamples {
    private import SI::*;
    doc /* Synthetic design studies. No measured hull, polar or route is asserted.
     * Wind from west/east denotes idealized alignment with a straight river axis,
     * not a weather forecast or surveyed corridor. Length is waterline length of
     * the assembled vessel, not a printer-module dimension. gorgeWesterly is
     * the representative selected-window challenge illustration; gorgeEasterly
     * is a reversal/winter sensitivity. Neither is a probability-weighted route.
     * BlueDogWeather::policy governs seasonal context, not these synthetic speeds.
     */
    part def UpstreamHeadwind :> BlueDogSailing::PolarLeg {
        attribute :>> label default = "Upstream / headwind";
        attribute :>> distance default = 100000 [m];
        attribute :>> currentVMG default = -1.5 [m/s];
        attribute :>> retainedPerformance default = 0.8;
        attribute :>> trueWindSpeed default = 5 [m/s];
        attribute :>> trueWindAngle default = TrigFunctions::rad(45) * (1 [rad]);
        attribute :>> leeway default = 0 [rad];
        attribute :>> windward default = true;
        attribute :>> cleanPolarSpeed default = 4 [m/s];
        attribute :>> maneuverRetention default = 0.95;
        attribute :>> waterlineLength default = 1 [m];
        attribute :>> allocatedTime default = 201600 [s];
        attribute :>> minimumGroundVMG default = 0.5 [m/s];
        attribute :>> polarEvidenceAccepted default = false;
        attribute :>> hullEvidenceAccepted default = false;
    }
    part def UpstreamTailwind :> UpstreamHeadwind {
        attribute :>> label default = "Upstream / tailwind";
        attribute :>> trueWindAngle default = TrigFunctions::rad(140) * (1 [rad]);
        attribute :>> windward default = false;
        attribute :>> cleanPolarSpeed default = 3.6 [m/s];
    }
    part def DownstreamHeadwind :> UpstreamHeadwind {
        attribute :>> label default = "Downstream / headwind";
        attribute :>> currentVMG default = 1.5 [m/s];
        attribute :>> allocatedTime default = 36000 [s];
        attribute :>> cleanPolarSpeed default = 3 [m/s];
    }
    part def DownstreamTailwind :> DownstreamHeadwind {
        attribute :>> label default = "Downstream / tailwind";
        attribute :>> trueWindAngle default = TrigFunctions::rad(140) * (1 [rad]);
        attribute :>> windward default = false;
    }
    part upstreamHeadwind : UpstreamHeadwind;
    part upstreamTailwind : UpstreamTailwind;
    part downstreamHeadwind : DownstreamHeadwind;
    part downstreamTailwind : DownstreamTailwind;
    part gorgeWesterly : BlueDogSailing::PolarVoyageProfile {
        ref part :>> vessel = BlueDog::Architecture::missionContext.boat;
        part upstream : UpstreamTailwind subsets legs;
        part downstream : DownstreamHeadwind subsets legs;
        attribute :>> holdTime default = BlueDogReliabilityExamples::gorgeIllustration.holdTime;
        attribute :>> qualifiedDuration default = BlueDogReliabilityExamples::gorgeIllustration.qualifiedDuration;
        attribute :>> criticalRatesPerHour default = BlueDogReliabilityExamples::gorgeIllustration.criticalRatesPerHour;
        attribute :>> commonCauseRatePerHour default = BlueDogReliabilityExamples::gorgeIllustration.commonCauseRatePerHour;
        attribute :>> zeroFailureTestHours default = BlueDogReliabilityExamples::gorgeIllustration.zeroFailureTestHours;
        attribute :>> observedCriticalFailures default = BlueDogReliabilityExamples::gorgeIllustration.observedCriticalFailures;
        attribute :>> rateEvidenceAccepted default = false;
        attribute :>> constantHazardAccepted default = false;
    }
    part gorgeEasterly :> gorgeWesterly {
        part redefines upstream {
            attribute :>> label = upstreamHeadwind.label;
            attribute :>> trueWindAngle = upstreamHeadwind.trueWindAngle;
            attribute :>> windward = true;
            attribute :>> cleanPolarSpeed = upstreamHeadwind.cleanPolarSpeed;
        }
        part redefines downstream {
            attribute :>> label = downstreamTailwind.label;
            attribute :>> trueWindAngle = downstreamTailwind.trueWindAngle;
            attribute :>> windward = false;
            attribute :>> cleanPolarSpeed = downstreamTailwind.cleanPolarSpeed;
        }
    }
    analysis upstreamBeat : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = upstreamHeadwind; }
    analysis upstreamRun : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = upstreamTailwind; }
    analysis downstreamBeat : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = downstreamHeadwind; }
    analysis downstreamRun : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = downstreamTailwind; }
    analysis westerlyPassage : BlueDogSailing::PolarVoyageAssessment { subject :>> profile = gorgeWesterly; }
    analysis easterlyPassage : BlueDogSailing::PolarVoyageAssessment { subject :>> profile = gorgeEasterly; }
    part lightWind : UpstreamHeadwind { attribute :>> trueWindSpeed = 3 [m/s]; }
    part strongWind : UpstreamHeadwind { attribute :>> trueWindSpeed = 10 [m/s]; }
    part highWind : UpstreamHeadwind { attribute :>> trueWindSpeed = 15 [m/s]; }
    analysis lightWindDemand : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = lightWind; }
    analysis strongWindDemand : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = strongWind; }
    analysis highWindDemand : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = highWind; }
    analysis sensitivity : BlueDogSailing::SailingSensitivity { subject :>> leg = upstreamHeadwind; }
    part oceanIllustration : UpstreamHeadwind {
        doc /* Sizing probe only: 4000 km in 28 moving days (30 days less 48 h holds),
         * zero along-route current, 140-degree TWA. No Hawaii route, season, wind
         * persistence, endurance qualification or operating window is established. */
        metadata issue : ModelingMetadata::Issue { text = "Illustrative distance and time allocation are not approved Hawaii mission parameters."; }
        attribute :>> label = "Offshore sizing probe";
        attribute :>> distance = 4000000 [m];
        attribute :>> currentVMG = 0 [m/s];
        attribute :>> allocatedTime = 2419200 [s];
        attribute :>> trueWindAngle = TrigFunctions::rad(140) * (1 [rad]);
        attribute :>> windward = false;
        attribute :>> cleanPolarSpeed = 3 [m/s];
    }
    analysis oceanDemand : BlueDogSailing::PolarDemandAndHullScreen { subject :>> leg = oceanIllustration; }
    dependency oceanSizingBasis from oceanIllustration to BlueDog::Goals::hawaiiVoyage;
}
