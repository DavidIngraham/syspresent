package BlueDogWeather {
    private import ScalarValues::*;
    part policy {
        doc /* Weather-window challenge; winter development tests and eventual
         * year-round unattended operation are separate profiles. West is the
         * representative challenge direction, not an assured forecast. */
        attribute challengeRequiresEastProgress : Boolean = false;
        attribute allSeasonRequiresEastProgress : Boolean = true;
        attribute firstYear : Integer = 2015;
        attribute lastYear : Integer = 2024;
        attribute warmMonths : Integer [5] ordered = (5,6,7,8,9);
        attribute winterMonths : Integer [5] ordered = (11,12,1,2,3);
        attribute eastSector : Real [2] ordered = (45,135);
        attribute westSector : Real [2] ordered = (225,315);
        attribute lightWindThreshold : Real = 2;
        attribute precedingWestHours : Integer = 6;
        attribute windowHours : Integer = 72;
        attribute probabilitySweep : Real [11] ordered = (0,0.1,0.2,0.3,0.4,0.5,0.6,0.7,0.8,0.9,1);
        metadata rationale : ModelingMetadata::Rationale { text = "Owner selected a favorable-weather-window qualifying attempt, with year-round operation later. Sharp and Mass (2004), https://doi.org/10.1175/826.1, supports season-dependent regimes. NOAA ISD-Lite 2015-2024 at KDLS and KTTD supplies descriptive station observations, not a calibrated route or forecast model. Sectors and the 2 m/s light-wind split are analysis bins, not sailing limits. Six preceding westerly hours define a reproducible hindcast selection probe, not a launch authorization. The 72-hour horizon is a fixed historical climatology comparison window only; it is not a passage deadline or launch forecast requirement. Active launch assessment must cover predicted passage, waiting and recovery exposure."; }
        metadata issue : ModelingMetadata::Issue { text = "No accepted east-wind mission probability or weather-success allocation yet. Need along-route wind, forecast-conditioned persistent trajectories, joint current/wave/solar conditions, and failed/held/aborted passage outcomes. Airport heights/exposure differ from the small wing. Winter tests do not inherit summer weights. Storm survival, recovery, traffic and no-intervention rules are not relaxed by frequency weighting."; }
    }
    analysis Inputs {
        out attribute challengeRequiresEastProgress : Boolean = policy.challengeRequiresEastProgress;
        out attribute allSeasonRequiresEastProgress : Boolean = policy.allSeasonRequiresEastProgress;
        out attribute firstYear : Integer = policy.firstYear;
        out attribute lastYear : Integer = policy.lastYear;
        out attribute warmMonths : Integer [5] ordered = policy.warmMonths;
        out attribute winterMonths : Integer [5] ordered = policy.winterMonths;
        out attribute eastSector : Real [2] ordered = policy.eastSector;
        out attribute westSector : Real [2] ordered = policy.westSector;
        out attribute lightWindThreshold : Real = policy.lightWindThreshold;
        out attribute precedingWestHours : Integer = policy.precedingWestHours;
        out attribute windowHours : Integer = policy.windowHours;
        out attribute probabilitySweep : Real [11] ordered = policy.probabilitySweep;
    }
    part def StationSeason {
        attribute station : String;
        attribute season : String;
        attribute expectedHours : Integer;
        attribute observedHours : Integer;
        attribute westHours : Integer;
        attribute eastHours : Integer;
        attribute lightHours : Integer;
        attribute otherHours : Integer;
        attribute unknownHours : Integer;
        attribute selectedWindows : Integer;
        attribute windowsWithEast : Integer;
        attribute incompleteWindows : Integer;
        attribute coveragePercent : Real = 100.0 * observedHours / expectedHours;
        attribute westPercent : Real = 100.0 * westHours / expectedHours;
        attribute eastPercent : Real = 100.0 * eastHours / expectedHours;
        attribute lightPercent : Real = 100.0 * lightHours / expectedHours;
        attribute otherPercent : Real = 100.0 * otherHours / expectedHours;
        attribute unknownPercent : Real = 100.0 * unknownHours / expectedHours;
        attribute eastAmongAxisPercent : Real = if westHours + eastHours > 0 ? 100.0 * eastHours / (westHours + eastHours) else 0;
        attribute eastEncounterPercent : Real = if selectedWindows > 0 ? 100.0 * windowsWithEast / selectedWindows else 0;
        attribute eastEncounterLabel : String = if selectedWindows > 0 ? "Complete windows only; see missing-data bounds" else "Not estimable: no complete windows";
        attribute encounterLowerPercent : Real = if selectedWindows + incompleteWindows > 0 ? 100.0 * windowsWithEast / (selectedWindows + incompleteWindows) else 0;
        attribute encounterUpperPercent : Real = if selectedWindows + incompleteWindows > 0 ? 100.0 * (windowsWithEast + incompleteWindows) / (selectedWindows + incompleteWindows) else 0;
    }
    analysis def RegimeSensitivity {
        subject result : BlueDogSizingEvidence::Scenario;
        out attribute probabilities : Real [11] ordered = policy.probabilitySweep;
        out attribute eligible : Boolean = result.numericallyBalanced and result.diagnosticControlCases == 0 and
            result.operatingMargins->ControlFunctions::forAll { in x : Real; x >= -0.0001 };
        out attribute westPass : Boolean = eligible and result.routeMargins#(4) >= -0.0001 and result.routeMargins#(5) >= -0.0001 and result.routeMargins#(6) >= -0.0001;
        out attribute eastPass : Boolean = eligible and result.routeMargins#(1) >= -0.0001 and result.routeMargins#(2) >= -0.0001 and result.routeMargins#(3) >= -0.0001;
        out attribute coverage : Real [11] ordered nonunique = probabilities->ControlFunctions::collect { in p : Real; MarineWeather::TwoRegimeCoverage(p,westPass,eastPass) };
        out attribute conditionalHours : Real [11] ordered nonunique = probabilities->ControlFunctions::collect { in p : Real; MarineWeather::ConditionalPassageHours(p,westPass,eastPass,result.westerlyHours,result.easterlyHours) };
        doc /* Counterfactual persistent-regime sensitivity over archived fixed geometry.
         * Probabilities are swept, not calibrated from hourly station frequencies.
         * A failed route screen is a failure, not a large finite passage time.
         * Structural and recovery failures remain separate hard failures. */
    }
    analysis primary : RegimeSensitivity { subject :>> result = BlueDogCurrentSizing::nominal; }
    analysis construction : RegimeSensitivity { subject :>> result = BlueDogCurrentSizing::construction; }
    analysis aerodynamic : RegimeSensitivity { subject :>> result = BlueDogCurrentSizing::aerodynamic; }
    analysis hydrodynamic : RegimeSensitivity { subject :>> result = BlueDogCurrentSizing::hydrodynamic; }
    analysis energy : RegimeSensitivity { subject :>> result = BlueDogCurrentSizing::energy; }
    analysis combined : RegimeSensitivity { subject :>> result = BlueDogCurrentSizing::combined; }
    dependency performanceProfile from policy to BlueDogRequirements::cruiseEvidence;
    dependency progressProfile from policy to BlueDogRequirements::legProgress;
    dependency exposureProfile from policy to BlueDogRequirements::passageDuration;
    dependency reliabilityProfile from policy to BlueDogRequirements::missionSuccessProbability;
    dependency energyProfile from policy to BlueDogRequirements::sustainedEnergyFeasibility;
    dependency sailingProfile from policy to BlueDogSailing::PolarVoyageAssessment;
    dependency searchProfile from policy to BlueDogCoupledOperation::Route;
}
