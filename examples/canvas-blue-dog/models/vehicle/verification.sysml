package BlueDogRequirementVerification {
    doc /* Verification specifications, not completed evidence. Each case remains
     * inconclusive until an evidence-backed implementation supplies a verdict.
     * Named requirement conditions are normative qualification definitions;
     * rationale and notes are explanatory. */
    verification def <'V-M-001'> RoundTripVerification {
        doc /* Apply the complete M-001 qualification conditions and GorgeChallengeVerification::PassageQualificationVerification acceptance strategy. Correlate the observed trajectory with safety-capability, energy-reserve, external-command, propulsion and qualification histories. Test safe unassisted righting separately from capsize with safety loss, motor use or external assistance. Missing gate crossings, missing evidence or disqualifying events prevent a completion verdict. */
        objective acceptance {
            verify BlueDogRequirements::roundTrip;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-M-002'> MultiDayEnduranceVerification {
        doc /* Apply the M-002 qualification conditions. Record initial battery state, harvester configuration, resource profile, harvested energy and loads. Limit input to installed-harvester output measured under a frozen, recorded resource profile; any test supply replay must not exceed measured power or accumulated energy. Absent profile evidence invalidates the test. */
        objective acceptance {
            verify BlueDogRequirements::multiDayEndurance;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-001'> EnergyAwarenessVerification {
        doc /* Apply the E-001 qualification conditions. Assess every applicable acceptance outcome separately: E-101, E-102, E-103, E-104. */
        objective acceptance {
            verify BlueDogRequirements::energyAwareness;
            verify BlueDogRequirements::energyEstimateCadence;
            verify BlueDogRequirements::reserveEstimateCadence;
            verify BlueDogRequirements::energyEstimateAccuracy;
            verify BlueDogRequirements::conservativeEnergyEstimate;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-002'> NavigationAndControlVerification {
        doc /* Apply the E-002 qualification conditions. Assess every applicable acceptance outcome separately: E-105, E-106, E-107, E-108, E-109. */
        objective acceptance {
            verify BlueDogRequirements::navigationAndControl;
            verify BlueDogRequirements::guidanceUpdateCadence;
            verify BlueDogRequirements::sailCommandCadence;
            verify BlueDogRequirements::steeringCommandCadence;
            verify BlueDogRequirements::positionAccuracy;
            verify BlueDogRequirements::headingAccuracy;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-003'> ResetRecoveryVerification {
        doc /* Apply the E-003 qualification conditions. Assess every applicable acceptance outcome separately: E-110, E-111, E-112, E-113, E-145, E-136, E-139, E-138, R-102, R-101. */
        objective acceptance {
            verify BlueDogRequirements::resetRecovery;
            verify BlueDogRequirements::restartDeadline;
            verify BlueDogRequirements::missionStateRestoration;
            verify BlueDogRequirements::gateProgressRestoration;
            verify BlueDogRequirements::resetRestrictionPreservation;
            verify BlueDogRequirements::qualificationRestoration;
            verify BlueDogRequirements::logInterruptionDurability;
            verify BlueDogRequirements::unknownQualificationFallback;
            verify BlueDogRequirements::qualificationPersistence;
            verify BlueDogRequirements::freshRecoveryCommand;
            verify BlueDogRequirements::motorQualificationInvariant;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-004'> LowEnergyRecoveryVerification {
        doc /* Apply the E-004 qualification conditions. Assess every applicable acceptance outcome separately: E-114, E-115, E-116, E-117, E-118, E-119, E-130, E-120, E-132, R-101. */
        objective acceptance {
            verify BlueDogRequirements::lowEnergyRecovery;
            verify BlueDogRequirements::lowEnergyEntry;
            verify BlueDogRequirements::lowEnergyPayloadInhibition;
            verify BlueDogRequirements::lowEnergyNavigationContinuity;
            verify BlueDogRequirements::lowEnergyCollisionContinuity;
            verify BlueDogRequirements::lowEnergyExit;
            verify BlueDogRequirements::payloadRestartPermission;
            verify BlueDogRequirements::periodicLogCadence;
            verify BlueDogRequirements::telemetryDeliveryCadence;
            verify BlueDogRequirements::criticalEventRecording;
            verify BlueDogRequirements::motorQualificationInvariant;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-005'> CommunicationsVerification {
        doc /* Apply the E-005 qualification conditions. Assess every applicable acceptance outcome separately: E-120, E-121, E-122, E-123, E-124, E-131, E-137. */
        objective acceptance {
            verify BlueDogRequirements::communications;
            verify BlueDogRequirements::telemetryDeliveryCadence;
            verify BlueDogRequirements::outageAutonomy;
            verify BlueDogRequirements::reconnectCurrentRecord;
            verify BlueDogRequirements::backlogOrdering;
            verify BlueDogRequirements::backlogCurrentPriority;
            verify BlueDogRequirements::logRetention;
            verify BlueDogRequirements::reconnectLogPreservation;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-006'> IngressResponseVerification {
        doc /* Apply the E-006 qualification conditions. Assess every applicable acceptance outcome separately: E-125, E-126, E-127, E-128, E-129, E-144, E-132, R-101. */
        objective acceptance {
            verify BlueDogRequirements::ingressResponse;
            verify BlueDogRequirements::ingressDetection;
            verify BlueDogRequirements::ingressRecoveryRequest;
            verify BlueDogRequirements::ingressFlotation;
            verify BlueDogRequirements::ingressElectronicsProtection;
            verify BlueDogRequirements::ingressPositionContinuity;
            verify BlueDogRequirements::ingressEventDeadline;
            verify BlueDogRequirements::criticalEventRecording;
            verify BlueDogRequirements::motorQualificationInvariant;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-007'> MissionEvidenceVerification {
        doc /* Apply the E-007 qualification conditions. Assess every applicable acceptance outcome separately: E-130, E-131, E-132, E-133, E-134, E-135, E-136, E-137, E-138, E-139. */
        objective acceptance {
            verify BlueDogRequirements::missionEvidence;
            verify BlueDogRequirements::periodicLogCadence;
            verify BlueDogRequirements::logRetention;
            verify BlueDogRequirements::criticalEventRecording;
            verify BlueDogRequirements::logTimestampAccuracy;
            verify BlueDogRequirements::invalidTimestampMarking;
            verify BlueDogRequirements::logGapIndication;
            verify BlueDogRequirements::logInterruptionDurability;
            verify BlueDogRequirements::reconnectLogPreservation;
            verify BlueDogRequirements::qualificationPersistence;
            verify BlueDogRequirements::unknownQualificationFallback;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-P-001'> TransportabilityVerification {
        doc /* Apply the P-001 qualification conditions. Assess every applicable acceptance outcome separately: P-101, P-102, P-103, P-104, P-105, P-106. */
        objective acceptance {
            verify BlueDogRequirements::transportability;
            verify BlueDogRequirements::soloTransport;
            verify BlueDogRequirements::liftMass;
            verify BlueDogRequirements::setupDuration;
            verify BlueDogRequirements::packDuration;
            verify BlueDogRequirements::soloLaunch;
            verify BlueDogRequirements::soloRetrieval;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-P-002'> DesktopManufactureVerification {
        doc /* Apply the P-002 qualification conditions. Compare slicer/job-envelope measurements for every job with the 250 × 250 × 250 mm usable Cartesian travel; raw part volume is insufficient. */
        objective acceptance {
            verify BlueDogRequirements::desktopManufacture;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-P-003'> ServiceabilityVerification {
        doc /* Apply the P-003 qualification conditions. Assess every applicable acceptance outcome separately: P-107, P-108, P-109, P-110. */
        objective acceptance {
            verify BlueDogRequirements::serviceability;
            verify BlueDogRequirements::replacementDuration;
            verify BlueDogRequirements::nondestructiveService;
            verify BlueDogRequirements::postServiceSealing;
            verify BlueDogRequirements::postServiceActuation;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-S-001'> TrafficSafetyVerification {
        doc /* Verify S-001 and its decomposed timing and tracking requirements using reviewed class-specific and conservative unclassified envelopes from BlueDogClassDetection. Record class/condition-specific timely track and whole-response probability lower bounds, confidence, applicable method and consequence/exposure reviews, classification transitions, clearance and risk disposition. Independently observe collision and nonimpediment obligations; source-model gates and synthetic truth do not demonstrate physical compliance. Current allocations and installed evidence remain open.*/
        objective acceptance {
            verify BlueDogRequirements::trafficSafety;
            verify BlueDogRequirements::trafficTracking;
            verify BlueDogRequirements::collisionAssessmentCadence;
            verify BlueDogRequirements::avoidanceCommandDeadline;
            verify BlueDogRequirements::trafficAwarenessFault;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-S-002'> OperatingBoundaryVerification {
        doc /* Apply the S-002 qualification conditions. Assess every applicable acceptance outcome separately: S-105, S-106, S-107, S-108, S-109. */
        objective acceptance {
            verify BlueDogRequirements::operatingBoundary;
            verify BlueDogRequirements::boundaryEvaluationCadence;
            verify BlueDogRequirements::boundaryAvoidanceDeadline;
            verify BlueDogRequirements::boundaryAvoidanceRecording;
            verify BlueDogRequirements::boundaryStartInhibition;
            verify BlueDogRequirements::boundaryDegradedEvidence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-S-003'> SafeRecoveryVerification {
        doc /* Apply the S-003 qualification conditions. Assess every applicable acceptance outcome separately: S-110, S-111, S-112, S-113, S-114, S-115, E-138, R-101, E-130. */
        objective acceptance {
            verify BlueDogRequirements::safeRecovery;
            verify BlueDogRequirements::abortLatchDeadline;
            verify BlueDogRequirements::recoveryTelemetryCadence;
            verify BlueDogRequirements::motorIsolationDeadline;
            verify BlueDogRequirements::isolationRestartInhibition;
            verify BlueDogRequirements::manualControlLossShutdown;
            verify BlueDogRequirements::controlLossLocationContinuity;
            verify BlueDogRequirements::qualificationPersistence;
            verify BlueDogRequirements::motorQualificationInvariant;
            verify BlueDogRequirements::periodicLogCadence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-S-004'> NavigationConspicuityVerification {
        doc /* Apply the S-004 qualification conditions. Assess every applicable acceptance outcome separately: S-116, S-117, S-118, S-119, S-120, S-121. */
        objective acceptance {
            verify BlueDogRequirements::navigationConspicuity;
            verify BlueDogRequirements::navigationLightPresentation;
            verify BlueDogRequirements::navigationShapePresentation;
            verify BlueDogRequirements::navigationSoundPresentation;
            verify BlueDogRequirements::signalingModeDeadline;
            verify BlueDogRequirements::signalingFaultRecording;
            verify BlueDogRequirements::signalingFaultReporting;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-S-005'> RegulatoryClassificationVerification {
        doc /* Apply the S-005 qualification conditions. Assess every applicable acceptance outcome separately: S-122, S-123. */
        objective acceptance {
            verify BlueDogRequirements::regulatoryClassification;
            verify BlueDogRequirements::deploymentComplianceRecord;
            verify BlueDogRequirements::deploymentReleaseGate;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-001'> EnvironmentalEnvelopeVerification {
        doc /* Select the current Gorge profile and record configuration, load state, exposure duration, instrumentation and acceptance criteria before testing. Exercise required functions concurrently in physically realizable operating and recovery wind/wave/current combinations. Include N-014 course-derived recovery exposure, the complete N-041 freshwater/spray history and N-043 enclosure immersion checks before and after exposure. Inspect retained safety capability and distinguish structural survival from safe autonomous continuation. Shared equipment tests support the installed-vessel argument only with justified applicability. Ocean profiles require their own future plan and are not accepted by this case. */
        objective acceptance {
            verify BlueDogRequirements::environmentalEnvelope;
            verify BlueDogRequirements::gorgeEnvironment;
            verify BlueDogRequirements::gorgeSurvivalWind;
            verify BlueDogRequirements::freshwaterExposure;
            verify BlueDogRequirements::enclosureSealing;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-002'> MarineDurabilityVerification {
        doc /* Apply the N-002 qualification conditions. Perform post-exposure functional checks for the selected profile. */
        objective acceptance {
            verify BlueDogRequirements::marineDurability;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-R-001'> RecoveryPropulsionVerification {
        doc /* Apply the R-001 qualification conditions. Measure track, current and electrical power. */
        objective acceptance {
            verify BlueDogRequirements::recoveryPropulsion;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-R-002'> RecoveryEnergyVerification {
        doc /* Apply the R-002 qualification conditions. Evaluate recovery routes along the course under declared adverse current and casualty conditions. Measure motor and essential powers, bound transit and retrieval exposure, and characterize available battery energy at the lowest operating temperature and end-of-service capacity. Infeasible routes or missing route evidence cannot pass. */
        objective acceptance {
            verify BlueDogRequirements::recoveryEnergy;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-C-101'> TelemetryEquipmentVerification {
        doc /* Apply the C-101 qualification conditions. Assess every applicable acceptance outcome separately: C-201, C-202, C-203, C-204. */
        objective acceptance {
            verify BlueDogRequirements::telemetryEquipment;
            verify BlueDogRequirements::telemetryDisplayContent;
            verify BlueDogRequirements::telemetryStaleIndication;
            verify BlueDogRequirements::telemetryIdentityPreservation;
            verify BlueDogRequirements::telemetryDuplicateSuppression;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-C-102'> CommandIntegrityVerification {
        doc /* Apply the C-102 qualification conditions. Assess every applicable acceptance outcome separately: C-205, C-206, C-207, C-208, C-209, C-210, C-211, E-132, E-138. */
        objective acceptance {
            verify BlueDogRequirements::commandIntegrity;
            verify BlueDogRequirements::unauthenticatedCommandRejection;
            verify BlueDogRequirements::replayCommandRejection;
            verify BlueDogRequirements::expiredCommandRejection;
            verify BlueDogRequirements::acceptedCommandDeadline;
            verify BlueDogRequirements::onboardAcknowledgmentDeadline;
            verify BlueDogRequirements::acknowledgmentQueueing;
            verify BlueDogRequirements::externalControlDisqualification;
            verify BlueDogRequirements::criticalEventRecording;
            verify BlueDogRequirements::qualificationPersistence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-011'> GorgeWindVerification {
        doc /* Apply the N-011 qualification conditions. Include upwind, crosswind and downwind headings. */
        objective acceptance {
            verify BlueDogRequirements::gorgeWind;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-012'> GorgeWavesVerification {
        doc /* Apply the N-012 qualification conditions. Include head, beam and following seas and physically realizable wind-wave-current combinations within the selected profile. */
        objective acceptance {
            verify BlueDogRequirements::gorgeWaves;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-013'> GorgeCurrentVerification {
        doc /* Apply the N-013 qualification conditions. Include opposing current. */
        objective acceptance {
            verify BlueDogRequirements::gorgeCurrent;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-015'> GorgeSurvivalWavesVerification {
        doc /* Apply the N-015 qualification conditions. Include adverse relative directions and physically realizable combinations with profile survival wind and current. */
        objective acceptance {
            verify BlueDogRequirements::gorgeSurvivalWaves;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-021'> OceanWindVerification {
        doc /* Apply the N-021 qualification conditions. Include upwind, crosswind and downwind headings. */
        objective acceptance {
            verify BlueDogRequirements::oceanWind;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-022'> OceanWavesVerification {
        doc /* Apply the N-022 qualification conditions. Include head, beam and following seas and physically realizable wind-wave-current combinations within the selected profile. */
        objective acceptance {
            verify BlueDogRequirements::oceanWaves;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-023'> OceanCurrentVerification {
        doc /* Apply the N-023 qualification conditions. Include opposing current. */
        objective acceptance {
            verify BlueDogRequirements::oceanCurrent;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-025'> OceanSurvivalWavesVerification {
        doc /* Apply the N-025 qualification conditions. Include adverse relative directions and physically realizable combinations with profile survival wind and current. */
        objective acceptance {
            verify BlueDogRequirements::oceanSurvivalWaves;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-030'> AirTemperatureVerification {
        doc /* Apply the N-030 qualification conditions. Test powered cold and hot endpoints after internal temperatures stabilize to less than 1 degC change per hour; operate for 2 hours at each endpoint. */
        objective acceptance {
            verify BlueDogRequirements::airTemperature;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-031'> WaterTemperatureVerification {
        doc /* Apply the N-031 qualification conditions. Operate for 2 hours at each endpoint after thermal stabilization. */
        objective acceptance {
            verify BlueDogRequirements::waterTemperature;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-032'> HumidityVerification {
        doc /* Apply the N-032 qualification conditions. Apply three powered 24-hour cycles between 10 and 40 degC at at least 95 percent relative humidity. Produce visible external condensation during cooling; no liquid water may reach enclosed electronics. */
        objective acceptance {
            verify BlueDogRequirements::humidity;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-033'> VisibilityVerification {
        doc /* Apply the N-033 qualification conditions. Assess every applicable acceptance outcome separately: N-101, N-102, N-103, N-104, N-105. */
        objective acceptance {
            verify BlueDogRequirements::visibility;
            verify BlueDogRequirements::visibilityNavigationCapability;
            verify BlueDogRequirements::visibilityTrafficCapability;
            verify BlueDogRequirements::restrictedVisibilityEntry;
            verify BlueDogRequirements::restrictedVisibilityEvidence;
            verify BlueDogRequirements::restrictedVisibilityCollisionAssessment;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-034'> CalmOperationVerification {
        doc /* Apply the N-034 qualification conditions. Record initial energy, the load measurement and the full energy history. */
        objective acceptance {
            verify BlueDogRequirements::calmOperation;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-035'> EnvelopeTransitionVerification {
        doc /* Apply the N-035 qualification conditions. Assess every applicable acceptance outcome separately: N-106, N-107, N-108, N-109, N-110, E-130, R-101. */
        objective acceptance {
            verify BlueDogRequirements::envelopeTransition;
            verify BlueDogRequirements::survivalEntryDeadline;
            verify BlueDogRequirements::survivalTransitionRecording;
            verify BlueDogRequirements::sailingResumptionDeadline;
            verify BlueDogRequirements::sailingResumptionInhibition;
            verify BlueDogRequirements::resumptionBlockEvidence;
            verify BlueDogRequirements::periodicLogCadence;
            verify BlueDogRequirements::motorQualificationInvariant;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-044'> WetMechanicalIntegrityVerification {
        doc /* Apply the N-044 qualification conditions. Assess every applicable acceptance outcome separately: N-111, N-112. */
        objective acceptance {
            verify BlueDogRequirements::wetMechanicalIntegrity;
            verify BlueDogRequirements::wetMechanismTravel;
            verify BlueDogRequirements::wetJointIntegrity;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-045'> WetElectricalIntegrityVerification {
        doc /* Apply the N-045 qualification conditions. Assess every applicable acceptance outcome separately: N-113, N-114. */
        objective acceptance {
            verify BlueDogRequirements::wetElectricalIntegrity;
            verify BlueDogRequirements::wetConductorResistance;
            verify BlueDogRequirements::wetInsulationResistance;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-046'> SolarHeatingVerification {
        doc /* Apply the N-046 qualification conditions. Assess every applicable acceptance outcome separately: N-115, N-116, N-117. */
        objective acceptance {
            verify BlueDogRequirements::solarHeating;
            verify BlueDogRequirements::hotSunElectronicsOperation;
            verify BlueDogRequirements::hotSunBatteryTemperature;
            verify BlueDogRequirements::batteryChargeTemperatureInhibition;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-047'> PrintedMaterialAgingVerification {
        doc /* Apply the N-047 qualification conditions. Establish aged load-capacity bounds for the production geometry, orientation, material and process under representative exposure. Compare with the capacity credited to each component and verify its demanded loads. Unaged controls characterize degradation; neither an 80-percent ratio nor a fixed coupon count alone establishes qualification. */
        objective acceptance {
            verify BlueDogRequirements::printedMaterialAging;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-051'> SelfRightingVerification {
        doc /* Apply the N-051 qualification conditions. Assess every applicable acceptance outcome separately: N-118, N-119, N-120, N-121. */
        objective acceptance {
            verify BlueDogRequirements::selfRighting;
            verify BlueDogRequirements::rightingDeadline;
            verify BlueDogRequirements::capsizeRigRetention;
            verify BlueDogRequirements::capsizeBallastRetention;
            verify BlueDogRequirements::capsizeElectronicsSealing;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-052'> CapsizeControlRecoveryVerification {
        doc /* Apply the N-052 qualification conditions. Assess every applicable acceptance outcome separately: N-122, N-123, N-124, N-125. */
        objective acceptance {
            verify BlueDogRequirements::capsizeControlRecovery;
            verify BlueDogRequirements::controlRecoveryDeadline;
            verify BlueDogRequirements::capsizeGateProgressRetention;
            verify BlueDogRequirements::capsizeQualificationRetention;
            verify BlueDogRequirements::capsizeRestrictionRetention;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-053'> SubmergedWeedPassageVerification {
        doc /* Apply the N-053 qualification conditions. Assess every applicable acceptance outcome separately: N-126, N-127. */
        objective acceptance {
            verify BlueDogRequirements::submergedWeedPassage;
            verify BlueDogRequirements::weedPassageSpeed;
            verify BlueDogRequirements::weedPassageSteering;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-054'> WeedSnagSheddingVerification {
        doc /* Apply the N-054 qualification conditions. Assess every applicable acceptance outcome separately: N-128, N-129. */
        objective acceptance {
            verify BlueDogRequirements::weedSnagShedding;
            verify BlueDogRequirements::weedSnagSpeedRecovery;
            verify BlueDogRequirements::weedSnagSteeringRecovery;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-055'> WeedBlockageResponseVerification {
        doc /* Apply the N-055 qualification conditions. Assess every applicable acceptance outcome separately: N-130, N-131, N-132, R-101. */
        objective acceptance {
            verify BlueDogRequirements::weedBlockageResponse;
            verify BlueDogRequirements::weedBlockageFault;
            verify BlueDogRequirements::weedBlockageContingency;
            verify BlueDogRequirements::weedBlockageLocation;
            verify BlueDogRequirements::motorQualificationInvariant;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-056'> RecoveryPropulsorWeedsVerification {
        doc /* Apply the N-056 qualification conditions. Assess every applicable acceptance outcome separately: N-133, N-134, N-135, N-136, R-101. */
        objective acceptance {
            verify BlueDogRequirements::recoveryPropulsorWeeds;
            verify BlueDogRequirements::poweredWeedSpeed;
            verify BlueDogRequirements::poweredWeedCurrent;
            verify BlueDogRequirements::poweredWeedTemperature;
            verify BlueDogRequirements::lockedPropulsorShutdown;
            verify BlueDogRequirements::motorQualificationInvariant;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-008'> NavigationAvailabilityVerification {
        doc /* Apply the E-008 qualification conditions. Assess every applicable acceptance outcome separately: E-140, E-141, E-142, E-143, E-132. */
        objective acceptance {
            verify BlueDogRequirements::navigationAvailability;
            verify BlueDogRequirements::navigationValidEpochs;
            verify BlueDogRequirements::staleNavigationInvalidation;
            verify BlueDogRequirements::navigationDegradedTransition;
            verify BlueDogRequirements::staleNavigationUseInhibition;
            verify BlueDogRequirements::criticalEventRecording;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-R-003'> LaunchEnergyAdmissionVerification {
        doc /* Apply the R-003 qualification conditions. Inject below-reserve, equal-reserve, above-reserve and missing, invalid or stale inputs. */
        objective acceptance {
            verify BlueDogRequirements::launchEnergyAdmission;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-R-004'> ChallengeMotorInhibitionVerification {
        doc /* Apply the R-004 qualification conditions. Assess every applicable acceptance outcome separately: R-101, R-102, E-138, E-132. */
        objective acceptance {
            verify BlueDogRequirements::challengeMotorInhibition;
            verify BlueDogRequirements::motorQualificationInvariant;
            verify BlueDogRequirements::freshRecoveryCommand;
            verify BlueDogRequirements::qualificationPersistence;
            verify BlueDogRequirements::criticalEventRecording;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-201'> SustainedReserveProtectionVerification {
        doc /* Apply the E-201 qualification conditions. For piecewise-constant net power, check the initial state and every interval endpoint. */
        objective acceptance {
            verify BlueDogRequirements::sustainedReserveProtection;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-205'> EnergyEvidenceReadinessVerification {
        doc /* Apply the E-205 qualification conditions to the selected finite or repeating profile. Review configuration-specific installed loads, resources, battery limits, initial energy, reserve route, time resolution, uncertainty, provenance and acceptance disposition. A supplied acceptance Boolean is an input to the predicate, not an automated review of those records. */
        objective acceptance {
            verify BlueDogRequirements::energyEvidenceReadiness;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-L-104'> FailureDispositionVerification {
        doc /* Review the architecture DFMEA, coverage, accepted mitigations, residual-risk approvals and evidence before launch. The starter list is not complete hazard coverage. */
        objective disposition { verify BlueDogRequirements::criticalFailureDisposition; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-009'> WindObservationVerification {
        doc /* Run the E-009 installed-flow matrix and fault injections. Record time-correlated reference measurements, delivered observations, validity and control state. Demonstrate E-152 through the M-002 campaign with the same sensor and interface installation. A manufacturer specification alone cannot close installed-error criteria. */
        objective acceptance {
            verify BlueDogRequirements::windObservation;
            verify BlueDogRequirements::windSampleCadence;
            verify BlueDogRequirements::windSpeedAccuracy;
            verify BlueDogRequirements::windDirectionAccuracy;
            verify BlueDogRequirements::windStaleInvalidation;
            verify BlueDogRequirements::invalidWindUseInhibition;
            verify BlueDogRequirements::windLossResponse;
            verify BlueDogRequirements::windSensingEndurance;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-107'> StructuralMaterialEvidence {
        doc /* Establish wet-conditioned, directional production material bounds with documented variability and reductions. Compare every property credited by the released structural analysis with its supported bound. Re-run sizing and load checks after any material/process change. */
        objective acceptance {
            verify BlueDogStructure::wetCouponStrength;
            verify BlueDogStructure::wetCouponStiffness;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-102'> FunctionalDeformationEvidence {
        doc /* Validate member-specific deformation limits against sailing/control, alignment, sealing and clearance functions, then evaluate measured or correlated responses under applicable loads. Provisional numerical percentages cannot set evidence acceptance. */
        objective acceptance {
            verify BlueDogStructure::appendageDeflection;
            verify BlueDogStructure::hullDeflection;
            verify BlueDogStructure::panelDeflection;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-101'> StructuralLoadEvidence {
        doc /* Derive applicable operational, handling and casualty loads from the selected configuration and mission cases. Correlate structural predictions with member, panel, attachment and bond tests. A fixed pressure or tip-force screening probe alone is insufficient. */
        objective acceptance {
            verify BlueDogStructure::structuralIntegrity;
            verify BlueDogStructure::bendingStrength;
            verify BlueDogStructure::panelStrength;
            verify BlueDogStructure::rootProofLoad;
            verify BlueDogStructure::bondProof;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-110'> FlotationEvidence {
        doc /* Assess actual downflooding openings and casualty buoyancy across loading, heel/pitch, wave and ingress cases. Demonstrate flotation through the declared recovery exposure; intact freeboard or volume ratios alone cannot close the case. */
        objective acceptance {
            verify BlueDogStructure::loadedFreeboard;
            verify BlueDogStructure::reserveBuoyancy;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-112'> LaunchSiteEvidence {
        doc /* Record surveyed launch/retrieval paths, depth/stage uncertainty, motion and installed appendage configuration. Check the site-qualified clearance throughout each path. */
        objective acceptance {
            verify BlueDogStructure::launchClearance;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-113'> StructuralPrintEnvelope {
        doc /* Use actual sliced structural jobs including support and printer clearances; test all three positive extents against the owner 250 mm envelope. The study seam/tile dimension is not an acceptance limit. */
        objective acceptance {
            verify BlueDogStructure::printTileEnvelope;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-N-003'> StabilityAndFoulingVerification {
        doc /* Integrate the declared capsize and vegetation campaigns for the same installed configuration. Use N-051/N-052 only when the passive-righting strategy is selected; retain the independent C-018 post-capsize shore-recovery obligation. Review separate weed passage, appendage snag, blockage and powered-recovery outcomes against N-053 through N-056, including subsequent control and safety capability. Check that damage, fouling or energy consumed by one exposure does not invalidate the claimed next operating state. Separate campaign results require a justified combination argument; no automatic capsize disqualification or motor-assisted qualification is permitted. */
        objective acceptance { verify BlueDogRequirements::stabilityAndFouling; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-Q-001'> MissionCapabilityVerification {
        doc /* For the declared loaded configuration and reproducible route/weather ensemble, establish whole-route sailing capability from accepted sailing, maneuver, energy and recovery evidence. Retain failed routes and holds in exposure accounting. Independently assess preservation of mission-critical functions across the same exposure, including interacting faults and recoveries. Review Q-101 through Q-103 and L-103/L-104 evidence; the provisional L-101/L-102 study target cannot substitute for functional coverage or safety disposition. Numerical screens, a successful isolated course and uncalibrated simulation completion fractions do not close the installed-vessel capability claim. */
        objective acceptance {
            verify BlueDogRequirements::cruisePerformance;
            verify BlueDogRequirements::missionReliability;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-E-203'> PeakSupplyCapabilityVerification {
        doc /* Measure coincident installed withdrawal demand for each admitted mode and transition, including sensing, signaling, actuation and recovery. Disable harvesting and exercise conservative battery temperature, state of charge, end-of-service capacity, conversion losses and declared uncertainty. Compare each demand with demonstrated supply capability using E-203, and observe voltage-dependent loss of required function and protective trips. A component nameplate or summed nominal power does not establish installed peak delivery. */
        objective acceptance { verify BlueDogRequirements::peakSupplyCapability; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'V-T-001'> ConstructionArchitectureVerification {
        doc /* Inspect the as-built primary shell, bill of materials, manufacturing records and representative sections to establish the owner-selected FDM substrate and wet-layup glass/epoxy construction. Identify configuration, process and departures explicitly. This inspection establishes construction identity only; material, joint, load, durability and flotation acceptance remain separate objectives. */
        objective acceptance { verify BlueDogStructure::hybridConstruction; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
}
