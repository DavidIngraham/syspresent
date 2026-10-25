package BlueDogEnvironmentReview {
    private import ScalarValues::*;
    doc /* SRR design-basis review: candidate allocations are not measured extrema,
     * joint occurrence probabilities or accepted launch limits. */
    part evidence {
        attribute windSource : String = "https://repository.library.noaa.gov/view/noaa/28157/noaa_28157_DS1.pdf";
        attribute windFinding : String = "Two cool seasons of profiler observations characterize persistent easterly gap flow and spatial/vertical variation. Gap-jet statistics at Troutdale are not 10 m surface limits for Bingen to Stevenson.";
        attribute surfaceRecord : String = "evidence/weather/2015-2024/manifest.json";
        attribute surfaceLimit : String = "Archived airport observations support seasonal sensitivity; they do not provide a calibrated along-route launch forecast or small-wing exposure.";
        attribute chartSource : String = "evidence/course/2026-10-11/sources.json";
        attribute currentLimit : String = "Chart geometry and pool stage do not establish a local current maximum. Retain 1.5 m/s as a proposed sensitivity bound pending spatial current evidence; recovery routing must reject insufficient authority.";
        attribute waveBasis : String = "MarineSurface::FetchSea; effective fetch 3, 8 and 15 km. These are model sensitivities, not surveyed directional fetch or observed wave statistics.";
        attribute reviewAccepted : Boolean = false;
        metadata issue : ModelingMetadata::Issue { text = "Qualification shall use coupled wind, current and waves plus separate wake events. The SRR allocations define the design domain; measured route profiles and forecast-conditioned exposure are required before field release. Do not infer joint extremes by combining independent maxima or assign return periods without evidence."; }
    }
    part proposed {
        attribute operationalWindUpperMps : Real = 15;
        attribute operationalGustUpperMps : Real = 20;
        attribute operationalWaveHeightM : Real = 1.5;
        attribute operationalPeriodSeconds : Real [2] ordered nonunique = (1.5,5);
        attribute currentSensitivityUpperMps : Real = 1.5;
        attribute includesCalmWaiting : Boolean = true;
        attribute includesDarkness : Boolean = true;
        attribute mandatesProgressAtEveryCondition : Boolean = false;
        attribute recoveryExposureBasis : String = "Course-dependent transit and final retrieval exposure, including forecast deterioration; exposure ends at retained, retrievable shore arrival plus the declared pickup delay. No fixed challenge or survival deadline is imposed.";
        metadata rationale : ModelingMetadata::Rationale { text = "Propose 1.5 m significant wave height and 1.5-5 s peak period for review: the native 6-15 m/s wind, 3-15 km fetch sensitivity yields approximately 0.21-1.22 m and 1.80-4.28 s before current and wakes. The rounding margin is an engineering allocation, not a measured extreme. Retain 15 m/s mean wind, 20 m/s gust and 1.5 m/s current as unaccepted study allocations. Calm waiting is an allowed mission state, not a minimum-wind failure. Dense fog matters through loss of safety capability."; }
    }
    part recovery {
        attribute meanWindUpperMps : Real = 25;
        attribute gustUpperMps : Real = 35;
        attribute significantWaveHeightM : Real = 2;
        attribute peakPeriodSeconds : Real [2] ordered nonunique = (1.5,7);
        attribute maximumIndividualWaveM : Real = 4;
        attribute pickupDelayHours : Real = 2;
        metadata rationale : ModelingMetadata::Rationale { text = "Design stress allocations, not climate return levels. Apply for the longest modeled casualty transit under the forecast-conditioned current field plus 2 h arranged pickup delay. Require launch logistics capable of this pickup delay; otherwise use the longer declared delay and re-evaluate flotation, retention and energy. Operational waves use Hs <= 1.5 m, Tp 1.5-5 s and an explicit 3 m individual-wave case. Recovery uses Hs <= 2 m, Tp 1.5-7 s and a 4 m individual-wave case. No independent-maxima probability is claimed. Ice, dam transit and surf-zone launch remain outside scope."; }
    }
    calc def RecoveryExposureHours {
        in transitHours : Real;
        in pickupHours : Real;
        return hours : Real = transitHours + pickupHours;
    }
    analysis FetchSensitivity {
        out attribute windsMps : Real [9] ordered nonunique = (6,6,6,10,10,10,15,15,15);
        out attribute fetchesM : Real [9] ordered nonunique = (3000,8000,15000,3000,8000,15000,3000,8000,15000);
        out attribute heightsM : Real [9] ordered nonunique = (1..9)->ControlFunctions::collect {
            in i : Integer; MarineSurface::FetchSea((windsMps#(i),fetchesM#(i),9.80665))#(1) };
        out attribute periodsSeconds : Real [9] ordered nonunique = (1..9)->ControlFunctions::collect {
            in i : Integer; MarineSurface::FetchSea((windsMps#(i),fetchesM#(i),9.80665))#(2) };
    }
    dependency windBasis from proposed to BlueDogRequirements::gorgeWind;
    dependency waveBasis from proposed to BlueDogRequirements::gorgeWaves;
    dependency currentBasis from proposed to BlueDogRequirements::gorgeCurrent;
    dependency launchContext from proposed to GorgeChallenge::forecastAdmission;
    dependency recoveryContext from proposed to GorgeChallenge::courseRecoveryReserve;
}
