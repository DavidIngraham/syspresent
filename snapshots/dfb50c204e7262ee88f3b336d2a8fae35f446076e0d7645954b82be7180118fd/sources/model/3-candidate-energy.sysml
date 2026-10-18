package BlueDogCandidateEnergy {
    private import ScalarValues::*;
    private import BlueDogSRRCurrent::energyInputs;
    private import BlueDogSRRCurrent::candidate;
    private import BlueDogSRRCurrent::energyGoverningCase;
    private import BlueDogSRRCurrent::peakGoverningCase;
    doc /* Authoritative accounting for the retained 440 Wh candidate's archived
     * nominal finite-passage screen. Inputs are projected from its source revision
     * and immutable replay; this is not an installed equipment qualification.
     * No independent electronics component split or perception capability is credited. */
    attribute exposureHours : Real = candidate.westerlyPassageHours*energyInputs.durationMultiplier+energyInputs.delayHours;
    attribute wingAverageCase : Real [3] ordered nonunique = MarineActuation::DrivePower(energyGoverningCase.wingTorqueNm,energyInputs.wingRateRadS,energyInputs.motorEfficiency,energyInputs.gearboxEfficiency,energyInputs.wingNoLoadW,energyInputs.wingControllerW,energyInputs.wingMotorHoldingW,energyInputs.wingMoveFraction,energyInputs.wingHoldingFraction);
    attribute rudderAverageCase : Real [3] ordered nonunique = MarineActuation::DrivePower(energyGoverningCase.rudderTorqueNm,energyInputs.rudderRateRadS,energyInputs.motorEfficiency,1,1,0.1,energyInputs.rudderHoldingWPerNm*energyGoverningCase.rudderTorqueNm,energyInputs.rudderMoveFraction,1-energyInputs.rudderMoveFraction);
    attribute wingPeakCase : Real [3] ordered nonunique = MarineActuation::DrivePower(peakGoverningCase.wingTorqueNm,energyInputs.wingRateRadS,energyInputs.motorEfficiency,energyInputs.gearboxEfficiency,energyInputs.wingNoLoadW,energyInputs.wingControllerW,energyInputs.wingMotorHoldingW,energyInputs.wingMoveFraction,energyInputs.wingHoldingFraction);
    attribute rudderPeakCase : Real [3] ordered nonunique = MarineActuation::DrivePower(peakGoverningCase.rudderTorqueNm,energyInputs.rudderRateRadS,energyInputs.motorEfficiency,1,1,0.1,energyInputs.rudderHoldingWPerNm*peakGoverningCase.rudderTorqueNm,energyInputs.rudderMoveFraction,1-energyInputs.rudderMoveFraction);
    part def Load {
        attribute label : String;
        attribute averageBusW : Real;
        attribute peakBusW : Real;
        attribute busWh : Real = averageBusW*exposureHours;
        attribute batteryWh : Real = busWh/energyInputs.dischargeEfficiency;
        attribute basis : String;
    }
    part electronics : Load {
        attribute :>> label = "Base electronics (unresolved component split)";
        attribute :>> averageBusW = energyInputs.electronicsW-energyInputs.windBusW;
        attribute :>> peakBusW = averageBusW;
        attribute :>> basis = "Lumped allocation; hardware, duty and surge unmeasured";
    }
    part wind : Load {
        attribute :>> label = "Wired wind sensor and interface";
        attribute :>> averageBusW = energyInputs.windBusW;
        attribute :>> peakBusW = averageBusW;
        attribute :>> basis = "Supplier sensor demand plus interface, conversion and margin allowances; startup unmeasured";
    }
    part wing : Load {
        attribute :>> label = "Wing drive and controller";
        attribute :>> averageBusW = wingAverageCase#(1);
        attribute :>> peakBusW = wingPeakCase#(2);
        attribute :>> basis = "Native torque/duty model: 2 percent moving, 98 percent holding; no motor holding current";
    }
    part rudder : Load {
        attribute :>> label = "Rudder drive and controller";
        attribute :>> averageBusW = rudderAverageCase#(1);
        attribute :>> peakBusW = rudderPeakCase#(2);
        attribute :>> basis = "Native torque/duty model: 5 percent moving, 95 percent holding";
    }
    part totals : Load {
        attribute :>> label = "Total sailing load";
        attribute :>> averageBusW = electronics.averageBusW+wind.averageBusW+wing.averageBusW+rudder.averageBusW;
        attribute :>> peakBusW = electronics.peakBusW+wind.peakBusW+wing.peakBusW+rudder.peakBusW;
        attribute :>> basis = "Maximum sampled average throughout exposure; peak uses the maximum-total-peak operating case";
    }
    part def Account { attribute label : String; attribute energyWh : Real; attribute basis : String; }
    part nominal : Account { attribute :>> label = "Nameplate battery"; attribute :>> energyWh = candidate.batteryWh; attribute :>> basis = "Allocated capacity, not measured capacity"; }
    part usable : Account { attribute :>> label = "Usable capacity"; attribute :>> energyWh = candidate.batteryWh*energyInputs.usableFraction; attribute :>> basis = "80 percent of nameplate"; }
    part departure : Account { attribute :>> label = "Departure stored energy"; attribute :>> energyWh = usable.energyWh*energyInputs.initialFraction; attribute :>> basis = "90 percent of usable capacity"; }
    part sailing : Account { attribute :>> label = "Energy delivered to sailing loads"; attribute :>> energyWh = totals.busWh; attribute :>> basis = "Average bus power times the full passage allowance"; }
    part losses : Account { attribute :>> label = "Discharge losses"; attribute :>> energyWh = totals.batteryWh-totals.busWh; attribute :>> basis = "90 percent discharge efficiency; applied once"; }
    part selfDischarge : Account { attribute :>> label = "Self-discharge"; attribute :>> energyWh = exposureHours*energyInputs.selfDischargeW; attribute :>> basis = "0.02 W battery-side withdrawal"; }
    part reserve : Account { attribute :>> label = "Protected recovery reserve"; attribute :>> energyWh = energyInputs.reserveWh; attribute :>> basis = "Synthetic allocation: 50 W motor for 0.5 h plus 8 W essentials for 2 h, times 1.2"; }
    part required : Account { attribute :>> label = "Total required at departure"; attribute :>> energyWh = totals.batteryWh+selfDischarge.energyWh+reserve.energyWh; attribute :>> basis = "Sailing withdrawal, self-discharge and reserve; zero harvest credit"; }
    part headroom : Account { attribute :>> label = "Remaining headroom"; attribute :>> energyWh = departure.energyWh-required.energyWh; attribute :>> basis = "Unallocated margin after the protected recovery reserve"; }
    part def Gap { attribute function : String; attribute allowance : String; attribute evidenceNeeded : String; }
    part compute : Gap { attribute :>> function = "Mission computer and avoidance inference"; attribute :>> allowance = "Within 4.5 W lump; no separately established allocation"; attribute :>> evidenceNeeded = "Selected pipeline, measured sustained/peak power, latency and thermal performance"; }
    part navigation : Gap { attribute :>> function = "GNSS and attitude sensing"; attribute :>> allowance = "Within 4.5 W lump; no separately established allocation"; attribute :>> evidenceNeeded = "Installed equipment and bus measurements"; }
    part traffic : Gap { attribute :>> function = "AIS, cameras, radar, hydrophones and sonar"; attribute :>> allowance = "Unselected; no incremental load or detection capability established"; attribute :>> evidenceNeeded = "Sensing trade and installed acquisition/processing power"; }
    part communications : Gap { attribute :>> function = "Telemetry, command link and recording"; attribute :>> allowance = "Within 4.5 W lump; no separately established allocation"; attribute :>> evidenceNeeded = "Transmit/receive duty, peaks and logging demand"; }
    part housekeeping : Gap { attribute :>> function = "Signals, recovery control, ingress sensing and power management"; attribute :>> allowance = "Within 4.5 W lump; no separately established allocation"; attribute :>> evidenceNeeded = "Operating modes, quiescent demand and fault independence"; }
    part recoveryHardware : Gap { attribute :>> function = "Recovery propulsion"; attribute :>> allowance = "Energy reserve allocated separately; no installed propulsion power rating established"; attribute :>> evidenceNeeded = "Measured thrust/power, casualty reachability and electrical peak capability"; }
    analysis Reconciliation {
        out attribute averageBusW : Real = totals.averageBusW;
        out attribute peakBusW : Real = totals.peakBusW;
        out attribute exposureHours : Real = BlueDogCandidateEnergy::exposureHours;
        out attribute requiredWh : Real = required.energyWh;
        out attribute departureWh : Real = departure.energyWh;
        out attribute headroomWh : Real = headroom.energyWh;
        out attribute reserveWh : Real = reserve.energyWh;
        out attribute busWh : Real = totals.busWh;
        out attribute dischargeLossWh : Real = losses.energyWh;
        out attribute selfDischargeWh : Real = selfDischarge.energyWh;
        out attribute hardwareBudgetComplete : Boolean = false;
        assert constraint { RealFunctions::abs(averageBusW-energyGoverningCase.recordedAverageW)<0.00000001 }
        assert constraint { RealFunctions::abs(peakBusW-peakGoverningCase.recordedPeakW)<0.00000001 }
        assert constraint { RealFunctions::abs(requiredWh-candidate.requiredWh)<0.00000001 }
        assert constraint { RealFunctions::abs(departureWh-candidate.departureWh)<0.00000001 }
    }
    dependency replayBasis from Reconciliation to BlueDogSRRCurrent::candidate;
    dependency driveBasis from Reconciliation to MarineActuation::DrivePower;
    dependency reserveBasis from reserve to BlueDogRequirements::lowEnergyRecovery;
}
