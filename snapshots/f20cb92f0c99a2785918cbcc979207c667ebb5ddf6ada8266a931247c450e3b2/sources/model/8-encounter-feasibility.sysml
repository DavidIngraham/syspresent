package BlueDogEncounterFeasibility {
    private import ScalarValues::*;
    doc /* Historical six-class acquisition comparison retained for archived evidence reproduction. The uniform 750 m allocation and broad low-target class are prior hypotheses, not current acceptance criteria. Current class-specific policy and open review/evidence gates are BlueDogClassDetection; these numerical APIs retain their historical meaning.*/
    calc def RequiredRange {
        in closingMps : Real;
        in acquisitionS : Real;
        in processingS : Real;
        in commandS : Real;
        in maneuverS : Real;
        in contingencyS : Real;
        in separationM : Real;
        in errorM : Real;
        return rangeM : Real = closingMps*(acquisitionS+processingS+commandS+maneuverS+contingencyS)+separationM+errorM;
    }
    calc def EnergyScreen {
        in additionalBusW : Real;
        return headroomWh : Real = BlueDogCandidateEnergy::headroom.energyWh-additionalBusW*BlueDogCandidateEnergy::exposureHours/BlueDogSRRCurrent::energyInputs.dischargeEfficiency;
    }
    calc def InstalledIncrement {
        in measuredBusW : Real;
        in replacedBaseW : Real;
        return incrementW : Real = measuredBusW-replacedBaseW;
    }
    calc def CapacityLowerBound {
        in incrementW : Real;
        return nameplateWh : Real = (BlueDogCandidateEnergy::required.energyWh+incrementW*BlueDogCandidateEnergy::exposureHours/BlueDogSRRCurrent::energyInputs.dischargeEfficiency)/(BlueDogSRRCurrent::energyInputs.usableFraction*BlueDogSRRCurrent::energyInputs.initialFraction);
    }
    requirement def TimingCriterion {
        subject target;
        in attribute assessmentPeriodS : Real;
        in attribute commandLatencyS : Real;
        require constraint { assessmentPeriodS > 0 and assessmentPeriodS <= BlueDogEncounterReview::criteria.assessmentSeconds and commandLatencyS >= 0 and commandLatencyS <= BlueDogEncounterReview::criteria.commandSeconds }
    }
    analysis Inputs {
        out attribute targets : String [6] ordered = BlueDogEncounterReview::criteria.targets;
        out attribute speeds : Real [6] ordered nonunique = BlueDogEncounterReview::criteria.targetSpeedMps;
        out attribute separations : Real [6] ordered nonunique = BlueDogEncounterReview::criteria.hullSeparationM;
        out attribute ownSpeed : Real = BlueDogEncounterReview::criteria.vesselSpeedMps;
        out attribute acquisition : Real = BlueDogEncounterReview::criteria.acquisitionSeconds;
        out attribute processing : Real = BlueDogEncounterReview::criteria.assessmentSeconds;
        out attribute command : Real = BlueDogEncounterReview::criteria.commandSeconds;
        out attribute contingency : Real = BlueDogEncounterReview::criteria.reserveSeconds;
        out attribute error : Real = BlueDogEncounterReview::criteria.relativePositionAllowanceM;
        out attribute rangeAllocation : Real = BlueDogEncounterReview::criteria.rangeAllocationM;
        out attribute maneuverSweep : Real [3] ordered = (15,30,60);
        out attribute processingSweep : Real [3] ordered = (1,5,15);
        out attribute stacks : String [4] ordered = ("AIS + vision", "AIS + radar + vision", "AIS + hydrophone cue + vision", "AIS + forward sonar + vision");
        // Deliberately hypothetical combined envelopes, no vendor performance credit.
        out attribute craftRange : Real [4] ordered nonunique = (250,750,250,250);
        out attribute lowRange : Real [4] ordered nonunique = (100,150,100,100);
        out attribute weedRange : Real [4] ordered nonunique = (20,20,20,40);
        out attribute cooperativeRange : Real = 1500;
        out attribute nightFactor : Real [4] ordered nonunique = (0.3,0.8,0.3,0.3);
        out attribute latency : Real [4] ordered nonunique = (2,1,3,2);
        out attribute additionalBusW : Real [4] ordered nonunique = (3,8,5,10);
        out attribute usableBatteryWh : Real = BlueDogCandidateEnergy::usable.energyWh;
        out attribute trialHorizonS : Real = 120;
        out attribute continuationHorizonS : Real = 3600;
        out attribute controllerSweepS : Real [2] ordered = (30,1);
        out attribute commandLatencyS : Real = BlueDogEncounterReview::criteria.commandSeconds;
        out attribute refinementStepS : Real [2] ordered = (1,0.5);
        out attribute clearanceTailS : Real = 60;
        out attribute baselineElectronicsW : Real = BlueDogCandidateEnergy::electronics.averageBusW;
        out attribute trialSeeds : Integer [2] ordered = (17,29);
        out attribute recoveryCapability : Real [5] ordered nonunique = (2,50,8,1.2,2);
        out attribute samplePeriodS : Real = 1;
        out attribute missProbability : Real = 0.1;
        out attribute positionErrorM : Real = 5;
        out attribute trackExpiryS : Real = 10;
    }
    part def RangeRow {
        attribute targetIndex : Integer;
        attribute target : String = BlueDogEncounterReview::criteria.targets#(targetIndex);
        attribute baselineM : Real = RequiredRange(BlueDogEncounterReview::criteria.targetSpeedMps#(targetIndex)+Inputs.ownSpeed,Inputs.acquisition,Inputs.processing,Inputs.command,15,Inputs.contingency,BlueDogEncounterReview::criteria.hullSeparationM#(targetIndex),Inputs.error);
        attribute slowerM : Real = RequiredRange(BlueDogEncounterReview::criteria.targetSpeedMps#(targetIndex)+Inputs.ownSpeed,Inputs.acquisition,Inputs.processing,Inputs.command,30,Inputs.contingency,BlueDogEncounterReview::criteria.hullSeparationM#(targetIndex),Inputs.error);
    }
    part def StackRow {
        attribute stackIndex : Integer;
        attribute label : String = Inputs.stacks#(stackIndex);
        attribute craftM : Real = Inputs.craftRange#(stackIndex);
        attribute lowM : Real = Inputs.lowRange#(stackIndex);
        attribute weedM : Real = Inputs.weedRange#(stackIndex);
        attribute additionalW : Real = Inputs.additionalBusW#(stackIndex);
        attribute headroomWh : Real = EnergyScreen(additionalW);
    }
    part target1 : RangeRow { attribute :>> targetIndex = 1; }
    part target2 : RangeRow { attribute :>> targetIndex = 2; }
    part target3 : RangeRow { attribute :>> targetIndex = 3; }
    part target4 : RangeRow { attribute :>> targetIndex = 4; }
    part target5 : RangeRow { attribute :>> targetIndex = 5; }
    part target6 : RangeRow { attribute :>> targetIndex = 6; }
    part stack1 : StackRow { attribute :>> stackIndex = 1; }
    part stack2 : StackRow { attribute :>> stackIndex = 2; }
    part stack3 : StackRow { attribute :>> stackIndex = 3; }
    part stack4 : StackRow { attribute :>> stackIndex = 4; }
    dependency timingBasis from TimingCriterion to BlueDogRequirements::avoidanceCommandDeadline;
    dependency loadBasis from InstalledIncrement to BlueDogCandidateEnergy::electronics;
    dependency rangeBasis from RequiredRange to BlueDogEncounterReview::criteria;
    dependency energyBasis from EnergyScreen to BlueDogCandidateEnergy::Reconciliation;
    dependency riskBasis from Inputs to BlueDogRisks::traffic;
}
