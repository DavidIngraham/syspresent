package BlueDogUseCases {
    private import OOSEM::systemUseCase;
    private import BlueDog::Architecture::*;
    private import BlueDogRequirements::*;
    #systemUseCase use case prepare {
        doc /* Prepare and launch. */
        subject context : MissionContext;
        actor operator : Operator;
        objective 'P-001 Transportability' :> transportability;
    }
    #systemUseCase use case sailGorge {
        doc /* Complete Gorge challenge. */
        subject context : MissionContext;
        actor operator : Operator;
        actor traffic : OtherVessel;
        objective 'M-001 Gorge mission' :> roundTrip;
    }
    #systemUseCase use case navigateCourse {
        doc /* Use current validated navigation to follow the declared course
         * and operating boundaries. Invalid observations require degradation and
         * separately confirmed safety; they cannot silently remain control inputs. */
        subject context : MissionContext;
        actor operator : Operator;
        actor traffic : OtherVessel;
        objective 'E-002 Navigation and control' :> navigationAndControl;
    }
    #systemUseCase use case preserveRecoveryReserve {
        doc /* Observe usable energy and current recovery demand, preserve
         * required safety loads, and transfer to recovery when reserve is threatened. */
        subject context : MissionContext;
        actor operator : Operator;
        objective 'E-004 Low-energy recovery' :> lowEnergyRecovery;
    }
    #systemUseCase use case sailOcean {
        metadata applicability : BlueDogMissionScope::Applicability { mission = BlueDogMissionScope::MissionKind::futureOcean; }
        doc /* Future mission: sail to Hawaii under independently allocated constraints. */
        subject context : MissionContext;
        actor operator : Operator;
        actor traffic : OtherVessel;
        objective 'H-001 Hawaii voyage' :> BlueDog::Goals::hawaiiVoyage;
    }
    #systemUseCase use case monitor {
        doc /* Monitor live and reconnect. */
        subject context : MissionContext;
        actor operator : Operator;
        objective 'C-101 Telemetry' :> telemetryEquipment;
    }
    #systemUseCase use case recover {
        doc /* Abort and recover. */
        subject context : MissionContext;
        actor operator : Operator;
        actor traffic : OtherVessel;
        objective 'S-003 Emergency control' :> emergencyControl;
    }
    #systemUseCase use case recoverUpright {
        doc /* For the passive-righting candidate, retain required safety while inverted, recover upright without
         * propulsion or outside assistance, and restore control without clearing
         * gate progress, restrictions or a prior loss of qualification. If safety
         * is unavailable, transfer to autonomous abort and recovery. */
        subject context : MissionContext;
        actor operator : Operator;
        actor traffic : OtherVessel;
        objective 'N-051 Self-righting' :> selfRighting;
    }
    #systemUseCase use case maintain {
        doc /* Manufacture and service. */
        subject context : MissionContext;
        actor operator : Operator;
        objective 'P-003 Serviceability' :> serviceability;
    }
    #systemUseCase use case avoidTraffic {
        doc /* Detect AIS and non-AIS traffic, assess collision risk, maneuver, and monitor separation without depending on operator intervention or cooperation by the other vessel. */
        subject context : MissionContext;
        actor operator : Operator;
        actor traffic : OtherVessel;
        objective 'S-001 Traffic safety' :> trafficSafety;
    }
    #systemUseCase use case presentNavigationSignals {
        doc /* Present mode-appropriate navigation signals to other vessels during sailing, powered recovery and stationary operation. */
        subject context : MissionContext;
        actor traffic : OtherVessel;
        objective 'S-004 Navigation conspicuity' :> navigationConspicuity;
    }
    dependency poweredRecoveryBasis from recover to BlueDogRequirements::recoveryPropulsion;
}
