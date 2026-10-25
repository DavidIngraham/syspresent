package BlueDogAcousticEquipment {
 doc /* Acoustic bench candidates reviewed 2026-10-16. Supplier facts and project allowances are separate. Stand-alone planning assemblies are not complete traffic-safety solutions. No sensing simulation or requirement change. Dependencies identify questions, not satisfaction. See docs/reference/acoustic-sensing.md and its source register.*/
 private import ScalarValues::*;
 part passiveArray {
     doc /* AC-01: four Aquarian H3dX on four Zoom F6 channels, USB to Pi 4B. Shared recorder clock does not establish calibrated channel phase. Project array geometry is unvalidated. Cueing audible targets cannot cover quiet hazards.*/
     attribute id : String = "AC-01";
     attribute hydrophone : String = "Aquarian H3dX";
     attribute channelCount : Real = 4;
     attribute adc : String = "Zoom F6";
     attribute adcAvailableChannels : Real = 6;
     attribute host : String = "Raspberry Pi 4 Model B";
     attribute hydrophoneHeadMassKg : Real = 0.01;
     attribute recorderMassKg : Real = 0.52;
     attribute hydrophonePhantomVoltageV : Real = 48;
     attribute hydrophoneTypicalCurrentA : Real = 0.0012;
     attribute recorderMainUnitOnlyW : Real = 1;
     attribute arrayForeAftM : Real = 0.6;
     attribute arrayAthwartM : Real = 0.3;
     attribute supplierSource : String = "https://www.aquarianaudio.com/AqAudDocs/H3dX_manual.pdf";
     attribute massScope : String = "Head mass excludes cable/plug. Support covers host, four cables/XLR, enclosure, regulator, USB, rigid mount and flow shrouds, not optics or recovery.";
     attribute powerScope : String = "Recorder 1 W is main-unit-only. Nominal 48 V times current is phantom-supply power before feed losses, not power delivered inside the hydrophone or battery input; 5 V 1 A supply rating is not draw.";
     attribute observationBlocker : String = "Calibrate geometry, phase, sound speed and noise. Bearing does not establish metric range/range rate. Source level is unknown; amplitude-only range unsupported. Flow, self-noise, multipath and quiet targets unresolved.";
     attribute recoveryBlocker : String = "Heads may emerge inverted. Shared recorder, host and power not independent recovery.";
     attribute detectionRangeDemonstrated : Boolean = false;
     attribute bearingAccuracyDemonstrated : Boolean = false;
     attribute metricRangeDemonstrated : Boolean = false;
     attribute relativeMotionDemonstrated : Boolean = false;
     attribute latencyDemonstrated : Boolean = false;
     attribute dayNightCoverageDemonstrated : Boolean = false;
     attribute installedBudgetComplete : Boolean = false;
     attribute invertedObservationDemonstrated : Boolean = false;
     attribute independentRecoveryComplete : Boolean = false;
     attribute hardwareSelected : Boolean = false;
     attribute physicalQualification : Boolean = false;
     attribute plannedSampleRateHz : Real = 48000;
     attribute liveStreamingCompatibilityDemonstrated : Boolean = false;
 } part narrowBeamForward {
     doc /* AC-02: Omniscan 450 FS 100 m depth variant with Pi 4B. Narrow single beam builds an image using motion; not multibeam. Instrument range is not target detection evidence.*/
     attribute id : String = "AC-02";
     attribute sonar : String = "Cerulean Omniscan 450 FS, 100 m depth variant";
     attribute host : String = "Raspberry Pi 4 Model B";
     attribute componentMassKg : Real = 0.44;
     attribute supplierMaxPowerW : Real = 10;
     attribute supplyMinV : Real = 10;
     attribute supplyMaxV : Real = 30;
     attribute horizontalBeamDeg : Real = 0.8;
     attribute verticalBeamDeg : Real = 50;
     attribute supplierInstrumentRangeM : Real = 120;
     attribute dataInterface : String = "100Base-T Ethernet";
     attribute supplierSource : String = "https://docs.ceruleansonar.com/c/omniscan-450/specifications";
     attribute observationBlocker : String = "Known motion needed for coverage. Thin weeds, clutter, bubbles, shadowing, update age and above-water hazards unresolved.";
     attribute recoveryBlocker : String = "Mount may emerge inverted. Shared host, Ethernet and power not independent recovery.";
     attribute detectionRangeDemonstrated : Boolean = false;
     attribute bearingAccuracyDemonstrated : Boolean = false;
     attribute metricRangeDemonstrated : Boolean = false;
     attribute relativeMotionDemonstrated : Boolean = false;
     attribute latencyDemonstrated : Boolean = false;
     attribute dayNightCoverageDemonstrated : Boolean = false;
     attribute installedBudgetComplete : Boolean = false;
     attribute invertedObservationDemonstrated : Boolean = false;
     attribute independentRecoveryComplete : Boolean = false;
     attribute hardwareSelected : Boolean = false;
     attribute physicalQualification : Boolean = false;
     attribute narrowBeamAppliesBeyondM : Real = 5;
 } part multibeamForward {
     doc /* AC-03: Sonoptix ECHO with Pi 4B. Supplier instrument range, beams and powers do not establish Blue Dog target detection, tracking or latency.*/
     attribute id : String = "AC-03";
     attribute sonar : String = "Sonoptix ECHO";
     attribute host : String = "Raspberry Pi 4 Model B";
     attribute componentMassKg : Real = 0.75;
     attribute supplierPowerLowW : Real = 5;
     attribute supplierPowerHighW : Real = 25;
     attribute supplierActiveExampleVoltageV : Real = 12;
     attribute supplierActiveExampleCurrentA : Real = 1.2;
     attribute supplyMinV : Real = 9;
     attribute supplyMaxV : Real = 28;
     attribute beamCount : Real = 256;
     attribute horizontal400kHzDeg : Real = 90;
     attribute horizontal700kHzDeg : Real = 120;
     attribute verticalBeamDeg : Real = 20;
     attribute instrumentRange400kHzM : Real = 200;
     attribute instrumentRange700kHzM : Real = 30;
     attribute dataInterface : String = "Ethernet";
     attribute supplierSource : String = "https://bluerobotics.com/store/sonars/imaging-sonars/sonoptix-echo/";
     attribute observationBlocker : String = "Beams do not establish target probability, thin-strand resolution or swept-volume clearance. Reverberation, bubbles, attitude, masking and latency need measurement.";
     attribute recoveryBlocker : String = "Mount may emerge inverted. Shared host, Ethernet and power not independent recovery.";
     attribute detectionRangeDemonstrated : Boolean = false;
     attribute bearingAccuracyDemonstrated : Boolean = false;
     attribute metricRangeDemonstrated : Boolean = false;
     attribute relativeMotionDemonstrated : Boolean = false;
     attribute latencyDemonstrated : Boolean = false;
     attribute dayNightCoverageDemonstrated : Boolean = false;
     attribute installedBudgetComplete : Boolean = false;
     attribute invertedObservationDemonstrated : Boolean = false;
     attribute independentRecoveryComplete : Boolean = false;
     attribute hardwareSelected : Boolean = false;
     attribute physicalQualification : Boolean = false;
 } part planning {
     doc /* Unmeasured project allowances. Recorder power includes phantom and four microphones once. Shared host replacement requires explicit reconciliation; do not subtract a whole support assembly. Mass excludes optics, recovery and batteries. Storage, bandwidth and thermal performance unresolved.*/
     attribute recorderWithPhantomLowW : Real = 1.5;
     attribute recorderWithPhantomHighW : Real = 3;
     attribute hostLowW : Real = 3;
     attribute hostHighW : Real = 6;
     attribute conversionEfficiency : Real = 0.9;
     attribute passiveSupportMassKg : Real = 0.45;
     attribute activeSupportMassKg : Real = 0.3;
 }
 analysis Budget {
     doc /* Component/project arithmetic only. Mass remainder is not free payload. Active upper cases combine supplier maxima and host planning high, not measured average. Maximum power alone cannot reject an average-energy allocation. Ethernet, heating/cleaning and recovery unallocated.*/
     out attribute passiveHydrophoneHeadsKg : Real = passiveArray.channelCount*passiveArray.hydrophoneHeadMassKg;
     out attribute passiveNominalPhantomSupplyW : Real = passiveArray.channelCount*passiveArray.hydrophonePhantomVoltageV*passiveArray.hydrophoneTypicalCurrentA;
     out attribute passivePlanningMassKg : Real = passiveHydrophoneHeadsKg+passiveArray.recorderMassKg+planning.passiveSupportMassKg;
     out attribute passivePlanningRailLowW : Real = planning.recorderWithPhantomLowW+planning.hostLowW;
     out attribute passivePlanningRailHighW : Real = planning.recorderWithPhantomHighW+planning.hostHighW;
     out attribute passivePlanningBatteryLowW : Real = passivePlanningRailLowW/planning.conversionEfficiency;
     out attribute passivePlanningBatteryHighW : Real = passivePlanningRailHighW/planning.conversionEfficiency;
     out attribute narrowBeamPlanningMassKg : Real = narrowBeamForward.componentMassKg+planning.activeSupportMassKg;
     out attribute multibeamPlanningMassKg : Real = multibeamForward.componentMassKg+planning.activeSupportMassKg;
     out attribute narrowBeamMaxPlusHostHighW : Real = narrowBeamForward.supplierMaxPowerW+planning.hostHighW;
     out attribute multibeamMaxPlusHostHighW : Real = multibeamForward.supplierPowerHighW+planning.hostHighW;
     out attribute multibeamSupplierActiveExampleW : Real = multibeamForward.supplierActiveExampleVoltageV*multibeamForward.supplierActiveExampleCurrentA;
     out attribute installedBudgetComplete : Boolean = false;
     out attribute physicalQualification : Boolean = false;
 }
 dependency trafficQuestion from passiveArray to BlueDogRequirements::trafficSafety;
 dependency trackQuestion from passiveArray to BlueDogRequirements::trafficTracking;
 dependency underwaterQuestion from multibeamForward to BlueDogRequirements::trafficSafety;
 dependency integrationBudget from Budget to BlueDogIntegratedCandidate::hypothesis;
}