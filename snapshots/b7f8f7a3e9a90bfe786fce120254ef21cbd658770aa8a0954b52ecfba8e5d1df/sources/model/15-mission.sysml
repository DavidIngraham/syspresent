package BlueDogMissionSimulation {
    private import ScalarValues::*;
    part scenarioPolicy {
        attribute stepSeconds : Real = 30;
        attribute controlPeriodSeconds : Real = 30;
        attribute horizonHours : Real = 240;
        attribute seed : Integer = 20261011;
        attribute ensembleCount : Integer = 32;
        attribute forecastSeconds : Real = 180;
        attribute routeLookaheadM : Real = 180;
        attribute maneuverSeconds : Real = 15;
        attribute gateApproachM : Real = 80;
        attribute completionDeadlineEnabled : Boolean = false;
        metadata rationale : ModelingMetadata::Rationale { text = "Numerical campaign settings, not challenge requirements. A run that reaches its horizon before finishing is censored, not a failed deadline. Seeded independent scenario streams permit reproducible paired design comparisons. Controller updates have their own fixed period; refining integration does not change the guidance policy or shorten maneuver delay. Repeat with smaller time steps and longer horizons before interpreting an ensemble."; }
    }
    part conceptualVessel {
        attribute batteryWh : Real = 500;
        attribute initialEnergyWh : Real = 500;
        attribute protectedReserveWh : Real = 60;
        attribute baseLoadW : Real = 5 + BlueDogWindEquipment::challenge.busPowerW;
        attribute maneuverEnergyWh : Real = 0.025;
        attribute solarPeakW : Real = 40;
        attribute solarEfficiency : Real = 0.85;
        attribute dischargeEfficiency : Real = 0.9;
        attribute beamM : Real = 0.5;
        attribute lengthM : Real = 1.2;
        attribute speedCapMps : Real = 3;
        attribute polarAnglesDeg : Real [7] ordered nonunique = (0,35,45,60,90,135,180);
        attribute speedWindRatios : Real [7] ordered nonunique = (0,0,0.28,0.36,0.45,0.38,0.30);
        metadata rationale : ModelingMetadata::Rationale { text = "Declared conceptual boat used to exercise mission logic before detailed-design convergence. These speed ratios and energy allowances are hypotheses, not VSP results, measured polars or the optimized Blue Dog design. Replace the performance provider and equipment budget with a named, correlated configuration without changing course or verdict logic. Sensor power uses the current wired installation roll-up."; }
        metadata issue : ModelingMetadata::Issue { text = "No physical performance or energy acceptance attaches to this configuration. The 60 Wh reserve is a scenario allocation; final reserve must use RecoveryReserveDemand with measured installed recovery and essential loads. Peak power, turning dynamics, capsize and wave response require higher-fidelity providers."; }
    }
    part weatherHypothesis {
        attribute initialWindFromDeg : Real = 270;
        attribute meanWindMps : Real = 7;
        attribute currentMps : Real = 0.4;
        attribute meanRegimeHours : Real = 36;
        attribute eastRegimeProbability : Real = 0.2;
        attribute hourlyPersistence : Real = 0.85;
        attribute windInnovationMps : Real = 0.8;
        attribute minimumCloudTransmission : Real = 0.15;
        attribute nominalCloudTransmission : Real = 0.8;
        attribute cloudDisturbanceCoefficient : Real = 0.08;
        attribute currentDisturbanceCoefficient : Real = 0.03;
        attribute sunriseHour : Real = 6;
        attribute sunsetHour : Real = 18;
        attribute departureHour : Real = 8;
        metadata rationale : ModelingMetadata::Rationale { text = "Synthetic weather-window sensitivity generator. Begin in a westerly window, retain temporally persistent regimes, and couple cloud, wind perturbations and current in each realization. The east probability and persistence are uncalibrated hypotheses, not a forecast-conditioned Gorge completion probability. NOAA station evidence in BlueDogWeather motivates regimes but does not justify these numeric weights."; }
    }
    part trafficHypothesis {
        attribute names : String [5] ordered = ("commercial tow", "fishing craft", "recreational powerboat", "sailing vessel", "passenger vessel");
        attribute arrivalsPerHour : Real [5] ordered nonunique = (0.1,0.5,0.5,0.3,0.05);
        attribute speedsMps : Real [5] ordered nonunique = (3.5,1.5,10,2,4);
        attribute lengthsM : Real [5] ordered nonunique = (180,6,7,8,100);
        attribute beamsM : Real [5] ordered nonunique = (24,2.5,2.5,3,18);
        attribute separationM : Real [5] ordered nonunique = (50,20,30,20,50);
        metadata rationale : ModelingMetadata::Rationale { text = "Initial encounter hypotheses for the finite mission, not measured traffic distributions. USACE identifies tow blind spots; the commercial footprint includes tug and barges rather than a single AIS point. The archived regional VesselFinder snapshot includes passenger hulls up to 100 by 18 m but does not establish arrival frequency. Fishing/recreation are supported by the Oregon boating guide. Rates, speeds and separations are scenario allocations; calibrate with time-stamped observations before claiming probability. See evidence/course/2026-10-11/sources.json. Small craft may have no AIS. Add crossing, overtaking, anchored/drifting fishing and changing-course skiing cases independently of the random transit generator."; }
        metadata issue : ModelingMetadata::Issue { text = "Separation domains are analysis screens, not statutory stand-offs or proof of Navigation Rules compliance. Fishing-vessel privilege depends on actual gear restriction, not the actor's label. Seasonal/daytime concentration, wakes, hidden targets and maneuver response require explicit scenario coverage."; }
    }
    analysis Inputs {
        out attribute gateNames : String [5] ordered nonunique = TransGorgeCourse::policy.gateNames;
        out attribute gateDirections : Integer [5] ordered nonunique = TransGorgeCourse::policy.gateDirections;
        out attribute controlPeriodSeconds : Real = scenarioPolicy.controlPeriodSeconds;
        out attribute commandLatencySeconds : Real = BlueDogEncounterReview::criteria.commandSeconds;
        out attribute continueAfterAbort : Boolean = true;
        out attribute gateApproachM : Real = scenarioPolicy.gateApproachM;
        out attribute time : Real [6] ordered nonunique = (scenarioPolicy.stepSeconds,scenarioPolicy.horizonHours,scenarioPolicy.forecastSeconds,scenarioPolicy.routeLookaheadM,scenarioPolicy.maneuverSeconds,scenarioPolicy.seed);
        out attribute energy : Real [8] ordered nonunique = (conceptualVessel.batteryWh,conceptualVessel.initialEnergyWh,conceptualVessel.protectedReserveWh,conceptualVessel.baseLoadW,conceptualVessel.maneuverEnergyWh,conceptualVessel.solarPeakW,conceptualVessel.solarEfficiency,conceptualVessel.dischargeEfficiency);
        out attribute dimensions : Real [3] ordered nonunique = (conceptualVessel.lengthM,conceptualVessel.beamM,conceptualVessel.speedCapMps);
        out attribute angles : Real [7] ordered nonunique = conceptualVessel.polarAnglesDeg;
        out attribute speedRatios : Real [7] ordered nonunique = conceptualVessel.speedWindRatios;
        out attribute weather : Real [14] ordered nonunique = (weatherHypothesis.initialWindFromDeg,weatherHypothesis.meanWindMps,weatherHypothesis.currentMps,weatherHypothesis.meanRegimeHours,weatherHypothesis.eastRegimeProbability,weatherHypothesis.hourlyPersistence,weatherHypothesis.windInnovationMps,weatherHypothesis.minimumCloudTransmission,weatherHypothesis.nominalCloudTransmission,weatherHypothesis.cloudDisturbanceCoefficient,weatherHypothesis.currentDisturbanceCoefficient,weatherHypothesis.sunriseHour,weatherHypothesis.sunsetHour,weatherHypothesis.departureHour);
        out attribute trafficNames : String [5] ordered = trafficHypothesis.names;
        out attribute trafficRates : Real [5] ordered nonunique = trafficHypothesis.arrivalsPerHour;
        out attribute trafficSpeeds : Real [5] ordered nonunique = trafficHypothesis.speedsMps;
        out attribute trafficLengths : Real [5] ordered nonunique = trafficHypothesis.lengthsM;
        out attribute trafficBeams : Real [5] ordered nonunique = trafficHypothesis.beamsM;
        out attribute trafficSeparation : Real [5] ordered nonunique = trafficHypothesis.separationM;
    }
    dependency course from Inputs to GorgeChallenge::courseCompletion;
    dependency autonomy from Inputs to GorgeChallenge::unassistedAttempt;
    dependency sailing from Inputs to GorgeChallenge::sailingPropulsion;
    dependency traffic from Inputs to GorgeChallenge::trafficCoexistence;
    dependency navigation from Inputs to GorgeChallenge::navigationRules;
    dependency reserve from Inputs to BlueDogRequirements::lowEnergyRecovery;
    dependency finiteEndurance from Inputs to BlueDogRequirements::multiDayEndurance;
    calc def MissionOutcome {
        in orderedCourseComplete : Boolean;
        in intervention : Boolean;
        in motorUsed : Boolean;
        in safetyViolation : Boolean;
        in executionStopped : Boolean;
        in reserveProtected : Boolean;
        in horizonReached : Boolean;
        in safetyAbort : Boolean;
        return outcome : String;
        if safetyViolation ? "safety_violation"
        else if intervention or motorUsed or safetyAbort ? "disqualified"
        else if executionStopped or not reserveProtected ? "incomplete"
        else if orderedCourseComplete ? "qualified_completion"
        else if horizonReached ? "censored"
        else "incomplete"
    }
    dependency simulatedCourseCriterion from MissionOutcome to GorgeChallenge::courseCompletion;
    dependency simulatedAutonomyCriterion from MissionOutcome to GorgeChallenge::unassistedAttempt;
    dependency simulatedPropulsionCriterion from MissionOutcome to GorgeChallenge::sailingPropulsion;
    dependency simulatedCollisionCriterion from MissionOutcome to GorgeChallenge::trafficCoexistence;
    dependency simulatedReserveCriterion from MissionOutcome to BlueDogRequirements::lowEnergyRecovery;
    comment acceptanceScope /* MissionOutcome classifies observed simulation facts. It does not establish complete navigation-rule compliance, sensor credibility, launch authorization or physical qualification. Python computes continuous geometry and dynamics; this calculation owns the outcome precedence. */
}
