package BlueDogEnergyExamples {
    private import SI::*;
    doc /* Illustrative system budget with an explicit provisional wired wind-sensor allocation.
     * Other equipment loads remain synthetic; none are accepted measurements. A zero payload represents absent optional equipment, not an
     * unmeasured installed load. Solar resource and battery capacity are illustrative.
     * Recovery motor is excluded from qualifying sailing loads; its reserve is protected.
     */
    part sailing : BlueDogEnergy::LoadBudget {
        part controller :> loads {
            attribute :>> label = "Guidance and mission computer";
            attribute :>> activePower default = 2 [W];
            attribute :>> idlePower default = 0.8 [W];
            attribute :>> activeFraction default = 1;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part navigation :> loads {
            attribute :>> label = "Position and attitude sensors";
            attribute :>> activePower default = 0.5 [W];
            attribute :>> idlePower default = 0.1 [W];
            attribute :>> activeFraction default = 1;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part wind :> loads {
            attribute :>> label = "Calypso ULP Wired Mini with interface allowance";
            attribute :>> activePower default = BlueDogWindEquipment::challenge.busPowerW * 1 [W];
            attribute :>> idlePower default = BlueDogWindEquipment::challenge.busPowerW * 1 [W];
            attribute :>> activeFraction default = 1;
            attribute :>> conversionEfficiency default = 1;
            attribute :>> uncertaintyFactor default = 1;
        }
        part traffic :> loads {
            attribute :>> label = "Traffic sensing";
            attribute :>> activePower default = 1 [W];
            attribute :>> idlePower default = 0.2 [W];
            attribute :>> activeFraction default = 1;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part sail :> loads {
            attribute :>> label = "Sail actuator";
            attribute :>> activePower default = 8 [W];
            attribute :>> idlePower default = 0.05 [W];
            attribute :>> activeFraction default = 0.02;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part steering :> loads {
            attribute :>> label = "Steering actuator";
            attribute :>> activePower default = 6 [W];
            attribute :>> idlePower default = 0.05 [W];
            attribute :>> activeFraction default = 0.05;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part telemetry :> loads {
            attribute :>> label = "Telemetry radio and command gateway";
            attribute :>> activePower default = 6 [W];
            attribute :>> idlePower default = 0.1 [W];
            attribute :>> activeFraction default = 0.02;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part signaling :> loads {
            attribute :>> label = "Navigation signals";
            attribute :>> activePower default = 0.6 [W];
            attribute :>> idlePower default = 0 [W];
            attribute :>> activeFraction default = 0.5;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part recording :> loads {
            attribute :>> label = "Recording electronics";
            attribute :>> activePower default = 0.2 [W];
            attribute :>> idlePower default = 0.05 [W];
            attribute :>> activeFraction default = 0.5;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part health :> loads {
            attribute :>> label = "Recovery controller and ingress sensing";
            attribute :>> activePower default = 0.1 [W];
            attribute :>> idlePower default = 0.05 [W];
            attribute :>> activeFraction default = 1;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part housekeeping :> loads {
            attribute :>> label = "Power management quiescent demand";
            attribute :>> activePower default = 0.2 [W];
            attribute :>> idlePower default = 0.2 [W];
            attribute :>> activeFraction default = 1;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
        part payload :> loads {
            attribute :>> label = "Optional payload absent";
            attribute :>> activePower default = 0 [W];
            attribute :>> idlePower default = 0 [W];
            attribute :>> activeFraction default = 0;
            attribute :>> conversionEfficiency default = 0.9;
            attribute :>> uncertaintyFactor default = 1.15;
        }
    }
    part campaign : BlueDogEnergy::Scenario {
        part redefines battery {
            attribute :>> nominalEnergy default = 900000 [J];
            attribute :>> usableFraction default = 0.8;
            attribute :>> chargeEfficiency default = 0.9;
            attribute :>> dischargeEfficiency default = 0.9;
            attribute :>> selfDischargePower default = 0.02 [W];
            attribute :>> maxChargePower default = 30 [W];
            attribute :>> maxDischargePower default = 60 [W];
        }
        attribute :>> initialEnergy default = 648000 [J];
        attribute :>> recoveryMotorPower default = 50 [W];
        attribute :>> recoveryEssentialPower default = 8 [W];
        comment recoveryExample /* Synthetic route exposure for evaluator regression, not the challenge reserve policy. */
        attribute :>> recoveryPoweredDuration default = 1800 [s];
        attribute :>> recoveryEssentialDuration default = 7200 [s];
        attribute :>> recoveryUncertaintyFactor default = 1.2;
        ref part :>> timeline default = (dark1, harvest1, dark2, harvest2, dark3, harvest3);
        attribute :>> dayCount default = 3;
        attribute :>> evidenceAccepted default = false;
        part dark1 :> intervals {
            ref part :>> budget default = sailing;
            attribute :>> duration default = 64800 [s];
            attribute :>> harvestEnabled default = false;
            attribute :>> rawHarvestPower default = 0 [W];
            attribute :>> harvestEfficiency default = 0.85;
        }
        part harvest1 :> intervals {
            ref part :>> budget default = sailing;
            attribute :>> duration default = 21600 [s];
            attribute :>> harvestEnabled default = true;
            attribute :>> rawHarvestPower default = 40 [W];
            attribute :>> harvestEfficiency default = 0.85;
        }
        part dark2 :> intervals {
            ref part :>> budget default = sailing;
            attribute :>> duration default = 64800 [s];
            attribute :>> harvestEnabled default = false;
            attribute :>> rawHarvestPower default = 0 [W];
            attribute :>> harvestEfficiency default = 0.85;
        }
        part harvest2 :> intervals {
            ref part :>> budget default = sailing;
            attribute :>> duration default = 21600 [s];
            attribute :>> harvestEnabled default = true;
            attribute :>> rawHarvestPower default = 40 [W];
            attribute :>> harvestEfficiency default = 0.85;
        }
        part dark3 :> intervals {
            ref part :>> budget default = sailing;
            attribute :>> duration default = 64800 [s];
            attribute :>> harvestEnabled default = false;
            attribute :>> rawHarvestPower default = 0 [W];
            attribute :>> harvestEfficiency default = 0.85;
        }
        part harvest3 :> intervals {
            ref part :>> budget default = sailing;
            attribute :>> duration default = 21600 [s];
            attribute :>> harvestEnabled default = true;
            attribute :>> rawHarvestPower default = 40 [W];
            attribute :>> harvestEfficiency default = 0.85;
        }
    }
    dependency controllerAllocation from sailing::controller to BlueDog::Architecture::missionContext::boat::control;
    dependency navigationAllocation from sailing::navigation to BlueDog::Architecture::missionContext::boat::navigation;
    dependency trafficAllocation from sailing::traffic to BlueDog::Architecture::missionContext::boat::navigation::traffic;
    dependency sailAllocation from sailing::sail to BlueDog::Architecture::missionContext::boat::actuation;
    dependency steeringAllocation from sailing::steering to BlueDog::Architecture::missionContext::boat::actuation;
    dependency telemetryAllocation from sailing::telemetry to BlueDog::Architecture::missionContext::boat::communications;
    dependency signalingAllocation from sailing::signaling to BlueDog::Architecture::missionContext::boat::signaling;
    dependency recordingAllocation from sailing::recording to BlueDog::Architecture::missionContext::boat::recording;
    dependency healthAllocation from sailing::health to BlueDog::Architecture::missionContext::boat::recovery;
    dependency housekeepingAllocation from sailing::housekeeping to BlueDog::Architecture::missionContext::boat::energy::powerManagement;
    dependency payloadAllocation from sailing::payload to BlueDog::Architecture::missionContext::boat::observationPayload;
    dependency campaignIntent from campaign to BlueDogRequirements::multiDayEndurance;
}
