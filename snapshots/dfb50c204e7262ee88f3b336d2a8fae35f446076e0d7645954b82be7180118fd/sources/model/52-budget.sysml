package MarineEnergy {
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    part def ElectricalLoad {
        attribute label : String;
        attribute activePower : PowerValue;
        attribute idlePower : PowerValue;
        attribute activeFraction : Real;
        attribute conversionEfficiency : Real;
        attribute uncertaintyFactor : Real;
        attribute averagePower : PowerValue =
            (idlePower + (activePower - idlePower) * activeFraction) * uncertaintyFactor / conversionEfficiency;
        attribute peakPower : PowerValue = activePower * uncertaintyFactor / conversionEfficiency;
        attribute valid : Boolean = activePower >= idlePower and idlePower >= 0 [W] and
            activeFraction >= 0 and activeFraction <= 1 and
            conversionEfficiency > 0 and conversionEfficiency <= 1 and uncertaintyFactor >= 1;
    }
    part def LoadBudget {
        part loads : ElectricalLoad [1..*] ordered;
        attribute averagePower : PowerValue = NumericalFunctions::sum(loads.averagePower);
        attribute peakPower : PowerValue = NumericalFunctions::sum(loads.peakPower);
        attribute valid : Boolean = SequenceFunctions::size(loads) > 0 and
            loads->ControlFunctions::forAll { in load : ElectricalLoad; load.valid };
    }
    part def Battery {
        attribute nominalEnergy : EnergyValue;
        attribute usableFraction : Real;
        attribute capacity : EnergyValue = nominalEnergy * usableFraction;
        attribute chargeEfficiency : Real;
        attribute dischargeEfficiency : Real;
        attribute maxChargePower : PowerValue;
        attribute selfDischargePower : PowerValue;
        attribute maxDischargePower : PowerValue;
        attribute valid : Boolean = nominalEnergy > 0 [J] and usableFraction > 0 and usableFraction <= 1 and
            chargeEfficiency > 0 and chargeEfficiency <= 1 and
            dischargeEfficiency > 0 and dischargeEfficiency <= 1 and
            maxChargePower >= 0 [W] and maxDischargePower > 0 [W] and selfDischargePower >= 0 [W];
    }
    part def Interval {
        ref part budget : LoadBudget;
        attribute duration : TimeValue;
        attribute harvestEnabled : Boolean;
        attribute rawHarvestPower : PowerValue;
        attribute harvestEfficiency : Real;
        attribute busHarvestPower : PowerValue = if harvestEnabled ? rawHarvestPower * harvestEfficiency else 0 [W];
        attribute netBusPower : PowerValue = busHarvestPower - budget.averagePower;
        attribute valid : Boolean = duration > 0 [s] and rawHarvestPower >= 0 [W] and
            harvestEfficiency > 0 and harvestEfficiency <= 1 and budget.valid;
    }
    calc def StorageRate {
        in interval : Interval;
        in battery : Battery;
        return rate : PowerValue;
        if interval.netBusPower >= 0 [W] ?
            NumericalFunctions::min(interval.netBusPower * battery.chargeEfficiency / (1 [W]), battery.maxChargePower / (1 [W])) * 1 [W] - battery.selfDischargePower
        else interval.netBusPower / battery.dischargeEfficiency - battery.selfDischargePower
    }
    analysis def BudgetRollup {
        subject budget : LoadBudget;
        assert constraint validInputs { budget.valid }
        out attribute labels : String [*] ordered nonunique = budget.loads.label;
        out attribute averageContributions : PowerValue [*] ordered nonunique = budget.loads.averagePower;
        out attribute peakContributions : PowerValue [*] ordered nonunique = budget.loads.peakPower;
        out attribute coincidentPeak : PowerValue = budget.peakPower;
        return averageDemand : PowerValue = budget.averagePower;
    }
}
