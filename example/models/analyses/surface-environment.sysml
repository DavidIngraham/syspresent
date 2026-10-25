package BlueDogSurfaceEnvironment {
    private import ScalarValues::*;
    part policy {
        // Prescribed response sensitivities, not identified vessel RAOs.
        attribute motionStudyHsM : Real = 0.4;
        attribute motionStudyPeriodS : Real = 3;
        attribute heaveGain : Real = 1;
        attribute slopeGain : Real = 1;
        attribute motionPhaseCount : Integer = 32;
        attribute maximumMotionAngleRad : Real = 0.35;
        attribute referenceHeightM : Real = 10;
        attribute roughnessM : Real = 0.0002;
        attribute minimumProfileHeightM : Real = 0.05;
        attribute stripCount : Integer = 8;
        attribute waveResistanceCoefficient : Real = 1;
        attribute effectiveFetchM : Real = 8000;
        attribute waveGrowthHours : Real = 2;
        attribute wakeHeightM : Real = 0.3;
        attribute wakePeriodS : Real = 2;
        attribute wakeDurationS : Real = 120;
        attribute wakeRadiusM : Real = 300;
        metadata rationale : ModelingMetadata::Rationale { text = "The synthetic mission wind is explicitly interpreted at 10 m, not claimed to be a corrected NOAA station observation. Neutral roughness is a hypothesis; test 0.00002 to 0.002 m. Eight equal-area wing strips use the existing finite-wing polar locally, an approximate treatment of shear without lifting-line redistribution. Fetch 8 km (sensitivity 3 and 15 km) is effective open-water fetch, not a chart-derived ray. SMB deep-water fetch growth supplies sea height/period; two-hour relaxation supplies memory. Wave/current action transport is an entry-from-still-water sensitivity, not a measured Gorge current gradient. Coefficient 1 (sensitivity 0.5 and 2) sets uncalibrated added resistance. Wake height, duration and radius are scenario hypotheses attached to nearby powered traffic, not measured wake propagation."; }
        metadata issue : ModelingMetadata::Issue { text = "Prescribed wave-following heave and slope response is a sensitivity, not identified seakeeping RAOs. No wave-phase control, slamming load, wave shielding or viscous stall prediction. Hs is not a maximum wave. A 2Hs individual-wave screen has crest/trough amplitude Hs and reports possible contact/ventilation, not failure: Phase-resolved motion screens now report relative clearance; response gains remain unvalidated. Monte Carlo counts are conditional synthetic sensitivity results, not mission reliability estimates."; }
        comment motionMethod /* Mean-water wind datum is retained. The wave and vessel
         * are translated together; local water elevation is used only for contact.
         * Test fixed response (0,0), heave following (1,0), and slope following
         * (1,1). These are hypotheses, not bounds on resonant response. Independent
         * deterministic component phases sample mixed seas; no resolved spectrum.
         * https://www.orcina.com/webhelp/OrcaFlex/Content/html/Vesseltheory,RAOsandphases.htm */
        comment sources /* Neutral profile: https://www.nrel.gov/docs/fy21osti/78412.pdf
         * SMB equations: https://cosefm.cee.wisc.edu/CEE514_Coastal_Engineering/Online_Solver/Wind_Waves.html
         * Wave/current and encounter conventions: https://www.orcina.com/webhelp/OrcaFlex/Content/html/Vesseltheory,Wavedriftandsumfrequencyloads.htm */
    }
    analysis Inputs {
        out attribute motionSea : Real [2] ordered nonunique = (policy.motionStudyHsM,policy.motionStudyPeriodS);
        out attribute motion : Real [4] ordered nonunique = (policy.heaveGain,policy.slopeGain,policy.motionPhaseCount,policy.maximumMotionAngleRad);
        out attribute wind : Real [4] ordered nonunique = (policy.referenceHeightM,policy.roughnessM,policy.minimumProfileHeightM,policy.stripCount);
        out attribute sea : Real [7] ordered nonunique = (policy.effectiveFetchM,policy.waveGrowthHours,policy.waveResistanceCoefficient,policy.wakeHeightM,policy.wakePeriodS,policy.wakeDurationS,policy.wakeRadiusM);
    }
    dependency windPerformance from policy to BlueDogRequirements::legProgress;
    dependency windEnvelope from policy to BlueDogRequirements::gorgeWind;
    dependency waves from policy to BlueDogRequirements::gorgeWaves;
    dependency currentInteraction from policy to BlueDogRequirements::gorgeCurrent;
    dependency recovery from policy to BlueDogRequirements::capsizeControlRecovery;
}
