package BlueDogEnergy {
    private import ScalarValues::*;
    public import MarineEnergy::*;
    private import ISQ::*;
    private import SI::*;
    doc /* Battery-bus energy accounting with piecewise-constant bounded loads and
     * harvested power. All calculations execute natively. Interval averaging must
     * resolve outages/load bursts that matter to storage minima; peak demand is
     * checked separately without credit for intermittent harvesting. No controller,
     * weather forecast, electrochemical model or vessel qualification is implied.
     */





    part def Scenario {
        part battery : Battery;
        part intervals : Interval [1..*];
        ref part timeline : Interval [1..*] ordered;
        attribute initialEnergy : EnergyValue;
        attribute recoveryMotorPower : PowerValue;
        attribute recoveryEssentialPower : PowerValue;
        attribute recoveryPoweredDuration : TimeValue;
        attribute recoveryEssentialDuration : TimeValue;
        attribute recoveryUncertaintyFactor : Real;
        attribute reserve : EnergyValue = BlueDogRequirements::RecoveryReserveDemand(recoveryMotorPower, recoveryEssentialPower, recoveryPoweredDuration, recoveryEssentialDuration, recoveryUncertaintyFactor);
        attribute dayCount : Integer;
        attribute evidenceAccepted : Boolean;
        doc /* evidenceAccepted requires the review record defined by BlueDogDesignDecisions::energyEvidenceAcceptance.
         * No default: numerical feasibility and measurement acceptance are distinct.
         * Inputs refer to the same installed configuration. Recovery powers are
         * battery-energy withdrawal rates (include discharge/conversion losses).
         */
    }

    calc def EnergyAt {
        in scenario : Scenario;
        in index : Integer;
        return energy : EnergyValue;
        if index == 0 ? scenario.initialEnergy else
            NumericalFunctions::min(scenario.battery.capacity / (1 [J]),
                (EnergyAt(scenario, index - 1) + StorageRate(scenario.timeline#(index), scenario.battery) * scenario.timeline#(index).duration) / (1 [J])) * 1 [J]
    }
    calc def TimeAt {
        in scenario : Scenario;
        in index : Integer;
        return time : TimeValue;
        if index == 0 ? 0 [s] else TimeAt(scenario, index - 1) + scenario.timeline#(index).duration
    }
    calc def HarvestTimeInDay {
        in scenario : Scenario;
        in day : Integer;
        return enabledTime : TimeValue;
        NumericalFunctions::sum((1..SequenceFunctions::size(scenario.timeline))->ControlFunctions::collect {
            in i : Integer;
            if scenario.timeline#(i).harvestEnabled ?
                NumericalFunctions::max(0, NumericalFunctions::min(TimeAt(scenario, i) / (1 [s]), day * 86400) -
                    NumericalFunctions::max(TimeAt(scenario, i - 1) / (1 [s]), (day - 1) * 86400)) * 1 [s]
            else 0 [s]
        })
    }

    analysis def SustainedOperation {
        subject scenario : Scenario;
        attribute count : Integer = SequenceFunctions::size(scenario.timeline);
        out attribute inputsValid : Boolean =
            count > 0 and scenario.dayCount > 0 and scenario.battery.valid and
            scenario.initialEnergy > 0 [J] and scenario.initialEnergy <= scenario.battery.capacity and
            scenario.recoveryMotorPower > 0 [W] and scenario.recoveryEssentialPower > 0 [W] and
            scenario.recoveryPoweredDuration > 0 [s] and scenario.recoveryEssentialDuration >= scenario.recoveryPoweredDuration and scenario.recoveryUncertaintyFactor >= 1 and
            scenario.timeline->ControlFunctions::forAll { in interval : Interval; interval.valid };
        assert constraint validInputs { inputsValid }
        out attribute campaignDuration : TimeValue = TimeAt(scenario, count);
        out attribute usableCapacity : EnergyValue = scenario.battery.capacity;
        out attribute protectedReserve : EnergyValue = scenario.reserve;
        out attribute boundaryTimes : TimeValue [*] ordered nonunique = (0..count)->ControlFunctions::collect { in i : Integer; TimeAt(scenario, i) };
        out attribute energyHistory : EnergyValue [*] ordered nonunique = (0..count)->ControlFunctions::collect { in i : Integer; EnergyAt(scenario, i) };
        out attribute storageRates : PowerValue [*] ordered nonunique = scenario.timeline->ControlFunctions::collect { in interval : Interval; StorageRate(interval, scenario.battery) };
        out attribute reserveMargins : EnergyValue [*] ordered nonunique = energyHistory->ControlFunctions::collect { in e : EnergyValue; e - scenario.reserve };
        out attribute harvestHoursPerDay : Real [*] ordered nonunique = (1..scenario.dayCount)->ControlFunctions::collect { in d : Integer; HarvestTimeInDay(scenario, d) / (3600 [s]) };
        out attribute consumedEnergy : EnergyValue = NumericalFunctions::sum(scenario.timeline->ControlFunctions::collect {
            in interval : Interval; interval.budget.averagePower * interval.duration });
        out attribute harvestedBusEnergy : EnergyValue = NumericalFunctions::sum(scenario.timeline->ControlFunctions::collect {
            in interval : Interval; interval.busHarvestPower * interval.duration });
        out attribute finalStoredEnergy : EnergyValue = EnergyAt(scenario, count);
        out attribute reserveProtected : Boolean = BlueDogRequirements::SustainedReserveProtectionCriterion(energyHistory, scenario.reserve);
        out attribute repeatableBalance : Boolean = BlueDogRequirements::RepeatableCycleBalanceCriterion(scenario.initialEnergy, finalStoredEnergy);
        out attribute peakSupported : Boolean = BlueDogRequirements::PeakSupplyCapabilityCriterion(
            scenario.timeline->ControlFunctions::collect { in interval : Interval; interval.budget.peakPower / scenario.battery.dischargeEfficiency + scenario.battery.selfDischargePower },
            scenario.battery.maxDischargePower);
        out attribute campaignCovered : Boolean = BlueDogRequirements::HarvestCampaignCoverageCriterion(campaignDuration, scenario.dayCount, harvestHoursPerDay);
        out attribute finiteCampaignFeasible : Boolean = inputsValid and reserveProtected and peakSupported;
        return modeledEnergyFeasible : Boolean = finiteCampaignFeasible and repeatableBalance and campaignCovered;
        out attribute evidenceReady : Boolean = BlueDogRequirements::EnergyEvidenceReadinessCriterion(scenario.evidenceAccepted);
        out attribute finiteCampaignSupported : Boolean = finiteCampaignFeasible and evidenceReady;
        out attribute energyCaseSupported : Boolean = modeledEnergyFeasible and evidenceReady;
        objective feasibility {
            doc /* Conditional numerical feasibility only; evidenceReady is separately reported. */
            require constraint { modeledEnergyFeasible }
        }
    }
    dependency sustainedReserveProtectionTrace from SustainedOperation to BlueDogRequirements::sustainedReserveProtection;
    dependency finiteCampaignTrace from SustainedOperation to BlueDogRequirements::multiDayEndurance;
    dependency repeatableCycleBalanceTrace from SustainedOperation to BlueDogRequirements::repeatableCycleBalance;
    dependency peakSupplyCapabilityTrace from SustainedOperation to BlueDogRequirements::peakSupplyCapability;
    dependency harvestCampaignCoverageTrace from SustainedOperation to BlueDogRequirements::harvestCampaignCoverage;
    dependency energyEvidenceReadinessTrace from SustainedOperation to BlueDogRequirements::energyEvidenceReadiness;

    verification def SustainedEnergyVerification {
        metadata plannedAnalyze : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::analyze; }
        doc /* Energy-case verification only. Synthetic or unaccepted evidence is
         * inconclusive even when the numerical analysis passes. This does not verify
         * navigation, sailing performance, weather availability or indefinite life.
         */
        subject scenario : Scenario;
        analysis calculation : SustainedOperation { subject = scenario; }
        objective energyAcceptance {
            verify BlueDogRequirements::sustainedEnergyFeasibility;
            require constraint { calculation.energyCaseSupported }
        }
        return verdict : VerificationCases::VerdictKind =
            if not calculation.evidenceReady ? VerificationCases::VerdictKind::inconclusive
            else VerificationCases::PassIf(calculation.modeledEnergyFeasible);
    }
}
