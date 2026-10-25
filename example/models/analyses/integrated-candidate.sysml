package BlueDogIntegratedCandidate {
    private import ScalarValues::*;
    doc /* Current working integration candidate. A refined IC-01-scale vessel is the intended first physical build.
     * Allocations are not selected catalog equipment or measured performance.
     * Independent recovery includes separate power, thrust, navigation and observation paths.
     * Every capability and independence claim requires configuration-specific physical evidence. */
    alias hypothesis for BlueDogIC01::integration;
    analysis Inputs {
        out attribute identifier : String = hypothesis.identifier;
        out attribute independentRecoveryAssumed : Boolean = hypothesis.independentRecoveryAssumed;
        out attribute parameterNames : String [2] ordered nonunique = ("electronicsW","fixedEquipmentKg");
        out attribute parameterValues : Real [2] ordered nonunique = (hypothesis.electronicsW,hypothesis.fixedEquipmentKg);
        out attribute designNames : String [29] ordered nonunique = BlueDogCoupledSizing::Inputs.designNames;
        out attribute designValues : Real [29] ordered nonunique = MarineDesign::DesignVector(BlueDogIC01::design);
        out attribute recoveryCapability : Real [7] ordered nonunique = (hypothesis.recoverySpeedMps,hypothesis.recoveryMotorW,hypothesis.recoveryEssentialW,hypothesis.recoveryUncertainty,hypothesis.arrivalAllowanceWh,hypothesis.invertedSpeedMps,hypothesis.invertedMotorW);
        out attribute recoveryDepartureWh : Real = hypothesis.recoveryDepartureWh;
        out attribute recoveryNameplateWh : Real = hypothesis.recoveryBatteryWh;
        out attribute recoveryStandbyW : Real = hypothesis.recoveryStandbyW;
        out attribute planningHorizonSeconds : Real = hypothesis.planningHorizonS;
        out attribute controlPeriodSeconds : Real = hypothesis.assessmentS;
        out attribute commandLatencySeconds : Real = hypothesis.commandS;
        out attribute maneuverSeconds : Real = hypothesis.maneuverS;
        out attribute minimumSailingSpeedMps : Real = hypothesis.minimumSailingSpeedMps;
        out attribute depowerPenaltyM : Real = hypothesis.depowerPenaltyM;
        out attribute crossTrackWeight : Real = hypothesis.crossTrackWeight;
        out attribute maneuverPenaltyM : Real = hypothesis.maneuverPenaltyM;
        out attribute sensorRangeM : Real = hypothesis.sensorRangeM;
        out attribute weedRangeM : Real = hypothesis.weedRangeM;
        out attribute sensorLatencyS : Real = hypothesis.sensorLatencyS;
        out attribute horizonS : Real = 14400;
        out attribute seeds : Integer [2] ordered nonunique = (17,29);
    }
    requirement def VirtualClosure {
        subject candidate;
        in attribute sizingPass : Boolean;
        in attribute nominalPass : Boolean;
        in attribute encountersPass : Boolean;
        in attribute recoveryPass : Boolean;
        in attribute energyPass : Boolean;
        in attribute timingPass : Boolean;
        in attribute assumptionsRecorded : Boolean;
        require constraint { sizingPass and nominalPass and encountersPass and recoveryPass and energyPass and timingPass and assumptionsRecorded }
    }
    calc def RecoveryBankAfterExposure {
        in exposureHours : Real;
        return remainingWh : Real = hypothesis.recoveryDepartureWh-hypothesis.recoveryStandbyW*exposureHours;
    }
    analysis def RecoveryScreen {
        subject candidate : MarineDesign::Design = BlueDogIC01::design;
        in attribute exposureHours : Real;
        in attribute distanceM : Real;
        in attribute alongCurrentMps : Real;
        in attribute crossCurrentMps : Real;
        in attribute inverted : Boolean;
        out attribute configurationApplicable : Boolean = candidate == BlueDogIC01::design;
        assert constraint configurationApplicability { configurationApplicable }
        assert constraint inputDomain { exposureHours >= 0 and distanceM >= 0 }
        attribute speedMps : Real = if inverted ? hypothesis.invertedSpeedMps else hypothesis.recoverySpeedMps;
        attribute motorW : Real = if inverted ? hypothesis.invertedMotorW else hypothesis.recoveryMotorW;
        attribute segment : Real [4] ordered nonunique = MarineRecovery::Segment((distanceM,speedMps,alongCurrentMps,crossCurrentMps,motorW,hypothesis.recoveryEssentialW,hypothesis.recoveryUncertainty));
        out attribute configurationId : String = hypothesis.identifier;
        out attribute mainNameplateWh : Real = BlueDogIC01::design.battery_Wh;
        out attribute independentNameplateWh : Real = hypothesis.recoveryBatteryWh;
        out attribute remainingWh : Real = RecoveryBankAfterExposure(exposureHours);
        out attribute groundSpeedMps : Real = segment#(2);
        out attribute transitSeconds : Real = segment#(3);
        out attribute requiredWh : Real = segment#(4)+hypothesis.arrivalAllowanceWh;
        out attribute routeFeasible : Boolean = segment#(1) == 1;
        out attribute reserveFits : Boolean = configurationApplicable and routeFeasible and remainingWh >= requiredWh;
        out attribute physicalQualification : Boolean = false;
        doc /* Conditional battery-side recovery arithmetic scoped to IC-01 only.
         * The native applicability assertion rejects an alternate runtime subject.
         * It does not establish an available safe approach, shore capture, thrust,
         * casualty survivability or physical qualification. Infeasible current
         * reports routeFeasible=false, never zero-energy recovery success. */
    }
    analysis IC01RecoveryIllustration : RecoveryScreen {
        subject :>> candidate;
        in attribute :>> exposureHours = Inputs.horizonS/3600;
        in attribute :>> distanceM = 600;
        in attribute :>> alongCurrentMps = -BlueDogMissionSimulation::weatherHypothesis.currentMps;
        in attribute :>> crossCurrentMps = 0;
        in attribute :>> inverted = false;
        doc /* Synthetic 600 m reach and four-hour exposure, matching the bounded
         * integration scenario scale; not the Gorge course or a required limit. */
    }
    analysis IC01InvertedRecoveryIllustration : RecoveryScreen {
        subject :>> candidate;
        in attribute :>> exposureHours = Inputs.horizonS/3600;
        in attribute :>> distanceM = 600;
        in attribute :>> alongCurrentMps = -BlueDogMissionSimulation::weatherHypothesis.currentMps;
        in attribute :>> crossCurrentMps = 0;
        in attribute :>> inverted = true;
    }
    analysis IC01NoRecoveryAuthority : RecoveryScreen {
        subject :>> candidate;
        in attribute :>> exposureHours = Inputs.horizonS/3600;
        in attribute :>> distanceM = 600;
        in attribute :>> alongCurrentMps = -hypothesis.recoverySpeedMps;
        in attribute :>> crossCurrentMps = 0;
        in attribute :>> inverted = false;
        doc /* Adverse arithmetic control: opposing current equals allocated
         * through-water speed, so no upstream route is credited. */
    }
    dependency recoveryReserveBasis from RecoveryScreen to BlueDogRequirements::recoveryEnergy;
    dependency recoveryConfiguration from RecoveryScreen to BlueDogIC01::design;
    dependency sizing from Inputs to BlueDogCoupledSizing::Inputs;
    dependency sensing from Inputs to BlueDogRequirements::trafficSafety;
    dependency recovery from Inputs to GorgeChallenge::autonomousShoreRecovery;
    dependency energy from Inputs to BlueDogRequirements::lowEnergyRecovery;
}
