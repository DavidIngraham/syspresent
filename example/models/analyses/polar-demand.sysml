package BlueDogSailing {
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    doc /* Inverse performance demand and a wave-speed reference, not a VPP.
     * The route is aligned with the wind axis; symmetric tacks/gybes cancel
     * cross-track motion, with no cross-current. TWA uses water-relative true
     * wind. Leeway increases the absolute track angle away from the wind.
     * A uniform maneuver factor reduces average water VMG; current continues
     * throughout. Environmental retention is a through-water speed factor here.
     * Weather holds are separate in VoyageProfile.
     */
    calc def CourseProjection {
        in trueWindAngle : AngularMeasureValue;
        in leeway : AngularMeasureValue;
        in windward : Boolean;
        return projection : Real;
        (if windward ? 1 else -1) * TrigFunctions::cos((trueWindAngle + leeway) / (1 [rad]))
    }
    calc def RequiredPolarSpeed {
        in groundTarget : SpeedValue;
        in current : SpeedValue;
        in retention : Real;
        in maneuver : Real;
        in projection : Real;
        return speed : SpeedValue;
        if retention > 0 and retention <= 1 and maneuver > 0 and maneuver <= 1 and projection > 0 and projection <= 1 ?
            (if groundTarget > current ? (groundTarget - current) / (retention * maneuver * projection) else 0 [m/s])
        else 0 [m/s]
    }
    calc def WaveReferenceSpeed {
        in waterline : LengthValue;
        return speed : SpeedValue;
        if waterline > 0 [m] ? RealFunctions::sqrt(9.80665 * (waterline / (1 [m])) / (2 * TrigFunctions::pi)) * (1 [m/s]) else 0 [m/s]
    }
    calc def LengthFroude {
        in speed : SpeedValue;
        in waterline : LengthValue;
        return number : Real;
        if waterline > 0 [m] ? (speed / (1 [m/s])) / RealFunctions::sqrt(9.80665 * (waterline / (1 [m]))) else 0
    }
    calc def WaveReferenceLength {
        in speed : SpeedValue;
        return waterline : LengthValue;
        2 * TrigFunctions::pi * (speed / (1 [m/s])) * (speed / (1 [m/s])) / 9.80665 * (1 [m])
    }
    part def PolarLeg :> BlueDogReliability::SailingLeg {
        attribute label : String;
        attribute trueWindSpeed : SpeedValue;
        attribute trueWindAngle : AngularMeasureValue;
        attribute leeway : AngularMeasureValue;
        attribute windward : Boolean;
        attribute cleanPolarSpeed : SpeedValue;
        attribute maneuverRetention : Real;
        attribute waterlineLength : LengthValue;
        attribute allocatedTime : TimeValue;
        attribute minimumGroundVMG : SpeedValue;
        attribute polarEvidenceAccepted : Boolean;
        attribute hullEvidenceAccepted : Boolean;
        attribute projection : Real = CourseProjection(trueWindAngle, leeway, windward);
        attribute :>> waterVMG = cleanPolarSpeed * maneuverRetention * projection;
        attribute demandInputsValid : Boolean = distance > 0 [m] and trueWindSpeed > 0 [m/s] and
            trueWindAngle >= 0 [rad] and trueWindAngle <= TrigFunctions::pi * (1 [rad]) and
            leeway >= 0 [rad] and trueWindAngle + leeway <= TrigFunctions::pi * (1 [rad]) and
            projection > 0.000001 and projection <= 1 and retainedPerformance > 0 and retainedPerformance <= 1 and
            maneuverRetention > 0 and maneuverRetention <= 1 and waterlineLength > 0 [m] and allocatedTime > 0 [s] and
            minimumGroundVMG >= 0 [m/s];
        attribute timeTarget : SpeedValue = if allocatedTime > 0 [s] ? distance / allocatedTime else 0 [m/s];
        attribute requiredGroundVMG : SpeedValue = if timeTarget > minimumGroundVMG ? timeTarget else minimumGroundVMG;
        attribute requiredCleanPolar : SpeedValue = RequiredPolarSpeed(requiredGroundVMG, currentVMG, retainedPerformance, maneuverRetention, projection);
    }
    analysis def PolarDemandAndHullScreen {
        subject leg : PolarLeg;
        out attribute inputsValid : Boolean = leg.demandInputsValid and leg.cleanPolarSpeed > 0 [m/s];
        assert constraint validInputs { inputsValid }
        out attribute sampledWindSpeed : SpeedValue = leg.trueWindSpeed;
        out attribute requiredGroundVMG : SpeedValue = leg.requiredGroundVMG;
        out attribute requiredCleanPolarSpeed : SpeedValue = leg.requiredCleanPolar;
        out attribute requiredOperatingSpeed : SpeedValue = requiredCleanPolarSpeed * leg.retainedPerformance;
        out attribute requiredCleanKnots : Real = requiredCleanPolarSpeed / ((1852.0 / 3600.0) [m/s]);
        out attribute requiredSpeedWindRatio : Real = if inputsValid ? requiredCleanPolarSpeed / leg.trueWindSpeed else 0;
        out attribute candidateGroundVMG : SpeedValue = leg.groundVMG;
        out attribute candidateHours : Real = leg.travelTime / (3600 [s]);
        out attribute minimumProgressMet : Boolean = BlueDogRequirements::LegProgressCriterion((leg.groundVMG));
        out attribute allocatedDurationMet : Boolean = leg.valid and BlueDogRequirements::PassageDurationCriterion(leg.travelTime, leg.allocatedTime);
        out attribute waveReference : SpeedValue = WaveReferenceSpeed(leg.waterlineLength);
        out attribute requiredCleanFroude : Real = LengthFroude(requiredCleanPolarSpeed, leg.waterlineLength);
        out attribute requiredOperatingFroude : Real = LengthFroude(requiredOperatingSpeed, leg.waterlineLength);
        out attribute equivalentWaveLength : LengthValue = WaveReferenceLength(requiredCleanPolarSpeed);
        out attribute exceedsWaveReference : Boolean = requiredCleanPolarSpeed > waveReference;
        out attribute evidenceReady : Boolean = leg.polarEvidenceAccepted and leg.hullEvidenceAccepted;
        return modeledFeasible : Boolean = inputsValid and leg.valid and allocatedDurationMet;
        out attribute performanceSupported : Boolean = modeledFeasible and evidenceReady;
        objective feasibility { require constraint { modeledFeasible } }
    }
    part def PolarVoyageProfile :> BlueDogReliability::VoyageProfile {
        part :>> legs : PolarLeg [1..*] ordered;
        attribute allocatedDuration : TimeValue = NumericalFunctions::sum(legs.allocatedTime) + holdTime;
        attribute :>> profileEvidenceAccepted = legs->ControlFunctions::forAll { in leg : PolarLeg; leg.polarEvidenceAccepted and leg.hullEvidenceAccepted };
    }
    analysis def PolarVoyageAssessment {
        subject profile : PolarVoyageProfile;
        analysis cruise : BlueDogReliability::CruiseReliability { subject = profile; }
        out attribute allocationValid : Boolean = profile.valid and SequenceFunctions::size(profile.legs) > 0 and
            profile.legs->ControlFunctions::forAll { in leg : PolarLeg; leg.demandInputsValid and leg.cleanPolarSpeed > 0 [m/s] } and
            BlueDogRequirements::PassageDurationCriterion(profile.allocatedDuration, profile.qualifiedDuration);
        out attribute legBudgetsMet : Boolean = profile.legs->ControlFunctions::forAll { in leg : PolarLeg;
            leg.valid and BlueDogRequirements::PassageDurationCriterion(leg.travelTime, leg.allocatedTime) };
        out attribute allocatedHours : Real = profile.allocatedDuration / (3600 [s]);
        out attribute voyageHours : Real = cruise.voyageHours;
        out attribute groundSpeeds : SpeedValue [*] ordered nonunique = cruise.groundSpeeds;
        out attribute allowableRatePerHour : Real = cruise.allowableRatePerHour;
        out attribute evidenceReady : Boolean = cruise.evidenceReady;
        return modeledFeasible : Boolean = allocationValid and legBudgetsMet and cruise.modeledFeasible;
        out attribute voyageSupported : Boolean = modeledFeasible and cruise.reliabilitySupported;
        objective feasibility { require constraint { modeledFeasible } }
    }
    analysis def SailingSensitivity {
        subject leg : PolarLeg;
        assert constraint validInputs { leg.demandInputsValid and leg.leeway == 0 [rad] }
        out attribute referenceTwaDegrees : Real = TrigFunctions::deg(leg.trueWindAngle / (1 [rad]));
        out attribute groundTarget : SpeedValue = leg.requiredGroundVMG;
        out attribute alongCurrent : SpeedValue = leg.currentVMG;
        out attribute retainedPerformance : Real = leg.retainedPerformance;
        out attribute maneuverRetention : Real = leg.maneuverRetention;
        out attribute beatAngles : Real [*] ordered = (6..15)->ControlFunctions::collect { in i : Integer; i * 5.0 };
        out attribute runAngles : Real [*] ordered = (21..36)->ControlFunctions::collect { in i : Integer; i * 5.0 };
        out attribute beatSpeeds : SpeedValue [*] ordered nonunique = beatAngles->ControlFunctions::collect { in a : Real;
            RequiredPolarSpeed(leg.requiredGroundVMG, leg.currentVMG, leg.retainedPerformance, leg.maneuverRetention, CourseProjection(TrigFunctions::rad(a) * (1 [rad]), leg.leeway, true)) };
        out attribute runSpeeds : SpeedValue [*] ordered nonunique = runAngles->ControlFunctions::collect { in a : Real;
            RequiredPolarSpeed(leg.requiredGroundVMG, leg.currentVMG, leg.retainedPerformance, leg.maneuverRetention, CourseProjection(TrigFunctions::rad(a) * (1 [rad]), leg.leeway, false)) };
        out attribute waterlines : LengthValue [*] ordered = (2..16)->ControlFunctions::collect { in i : Integer; i * 0.25 [m] };
        out attribute waveSpeeds : SpeedValue [*] ordered = waterlines->ControlFunctions::collect { in length : LengthValue; WaveReferenceSpeed(length) };
        out attribute cleanDemand : SpeedValue = leg.requiredCleanPolar;
        out attribute operatingDemand : SpeedValue = leg.requiredCleanPolar * leg.retainedPerformance;
        return computed : Boolean = leg.demandInputsValid and leg.leeway == 0 [rad];
        objective consistency { require constraint { computed } }
    }
    dependency progressDemand from PolarDemandAndHullScreen to BlueDogRequirements::legProgress;
    dependency timeAllocation from PolarDemandAndHullScreen to BlueDogRequirements::passageDuration;
    dependency polarEvidence from PolarDemandAndHullScreen to BlueDogRequirements::cruiseEvidence;
    dependency currentBoundary from PolarDemandAndHullScreen to BlueDogRequirements::gorgeCurrent;
    dependency weedAllowance from PolarDemandAndHullScreen to BlueDogRequirements::submergedWeedPassage;
    dependency hullDecision from PolarDemandAndHullScreen to BlueDog::Architecture::HullAndRig;
    dependency cruiseIntegration from BlueDogReliability::CruiseReliability to PolarDemandAndHullScreen;
}
