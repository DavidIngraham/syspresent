package BlueDogConfigurationManagement {
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    doc /* Configuration and resource-accounting context, tailored from NASA SE6.5/6.7,
     * defense SE Guidebook2026 6.1.3/6.1.6 and PSM/INCOSE Technical Measurement2005.
     * No numerical allocation, equipment selection or historical evidence changes. */
    part def ContextRecord {
        attribute identifier : String [1];
        attribute role : String [1];
        attribute intendedUse : String [1];
        attribute revisionBasis : String [1];
        ref part representedSubject [1];
    }
    part currentCandidate : ContextRecord {
        attribute :>> identifier = "IC-01";
        attribute :>> role = "Current numerical/integration candidate";
        attribute :>> intendedUse = "Conditional coupled sizing and local sailing/encounter/recovery studies; planned physical integration, not a built or qualified article";
        attribute :>> revisionBasis = "Current model source/model hashes identify a run. design.sourceRevision identifies the archived numerical origin, not the current hardware/software configuration revision.";
        ref part :>> representedSubject = BlueDogIC01::design;
    }
    part retainedSizing : ContextRecord {
        attribute :>> identifier = "Retained440Wh";
        attribute :>> role = "Historical sizing-study subject";
        attribute :>> intendedUse = "Interpret the retained candidate and its original archived replay; no transfer of its budget or evidence acceptance to IC-01";
        attribute :>> revisionBasis = "BlueDogSRRCurrent preserves the 440Wh record and original source revision; current reanalysis requires its own input fingerprints.";
        ref part :>> representedSubject = BlueDogSRRCurrent::candidate;
    }
    part illustrativeLoads : ContextRecord {
        attribute :>> identifier = "IllustrativeLoads";
        attribute :>> role = "Synthetic load-accounting example";
        attribute :>> intendedUse = "Demonstrate duty/conversion rollup; not a complete vessel or IC-01 installed-load split";
        attribute :>> revisionBasis = "BlueDogEnergyExamples source fingerprint identifies the illustrative allocation; it is not installed equipment evidence.";
        ref part :>> representedSubject = BlueDogEnergyExamples::sailing;
    }
    part searchReference : ContextRecord {
        attribute :>> identifier = "SearchReference";
        attribute :>> role = "Numerical starting geometry";
        attribute :>> intendedUse = "Reference geometry for preparation/search; not a selected vessel or accepted installed article";
        attribute :>> revisionBasis = "Current authored configuration fingerprint; original decimal precision is not measured accuracy.";
        ref part :>> representedSubject = BlueDogConfigurations::reference;
    }
    part lowerSearchBracket : ContextRecord {
        attribute :>> identifier = "LowerBracket";
        attribute :>> role = "Numerical/model-domain lower bracket";
        attribute :>> intendedUse = "Define search bounds; not a complete feasible vessel, owner requirement or manufacturing tolerance";
        attribute :>> revisionBasis = "Current model-domain/search input fingerprint; bracket changes need applicability and search review.";
        ref part :>> representedSubject = BlueDogConfigurations::lowerBracket;
    }
    part upperSearchBracket : ContextRecord {
        attribute :>> identifier = "UpperBracket";
        attribute :>> role = "Numerical/model-domain upper bracket";
        attribute :>> intendedUse = "Define search bounds; not a selected dimension, vessel requirement or manufacturing tolerance";
        attribute :>> revisionBasis = "Current model-domain/search input fingerprint; do not transfer bracket status to physical feasibility.";
        ref part :>> representedSubject = BlueDogConfigurations::upperBracket;
    }
    part parameterBasis : ContextRecord {
        attribute :>> identifier = "ParameterBasis";
        attribute :>> role = "Provisional shared analysis assumptions";
        attribute :>> intendedUse = "Reusable physical/component assumptions overridden by identified candidate integration inputs where declared";
        attribute :>> revisionBasis = "Current model/driver fingerprints identify assumptions; numerical allocations are not measured equipment.";
        ref part :>> representedSubject = BlueDogConfigurations::assumptions;
    }
    part recordedBaseline : ContextRecord {
        attribute :>> identifier = "RecordedBaseline";
        attribute :>> role = "Historical exploratory sizing projection";
        attribute :>> intendedUse = "Interpret the original October10 exploration; no silent substitution for current geometry or qualification";
        attribute :>> revisionBasis = "models/evidence/coupled-2026-10-10.sysml and evidence/runs/2026-10-10-coupled/manifest.json retain original revision.";
        ref part :>> representedSubject = BlueDogRecordedSizing::candidate;
    }
    part bingenProjection : ContextRecord {
        attribute :>> identifier = "BingenProjection";
        attribute :>> role = "Historical Bingen sizing projection";
        attribute :>> intendedUse = "Interpret the October12 Bingen candidate; distinct from the later 440Wh retained replay and IC-01";
        attribute :>> revisionBasis = "Despite the package name CurrentSizing, evidence/runs/2026-10-12-bingen/manifest.json owns this historical projection.";
        ref part :>> representedSubject = BlueDogCurrentSizing::candidate;
    }
    part continuationProjection : ContextRecord {
        attribute :>> identifier = "ContinuationProjection";
        attribute :>> role = "Historical coarse sizing continuation";
        attribute :>> intendedUse = "Interpret the recorded continuation subject; coarse feasibility and target status do not establish refinement or physical qualification";
        attribute :>> revisionBasis = "models/evidence/sizing-continuation.sysml preserves its recorded stage/result context; retain the archived run lineage.";
        ref part :>> representedSubject = BlueDogSizingContinuation::candidate;
    }
    part finitePassageProjection : ContextRecord {
        attribute :>> identifier = "FinitePassageProjection";
        attribute :>> role = "Historical finite-passage continuation";
        attribute :>> intendedUse = "Interpret the recorded partial/coarse progression and unreached target; no global infeasibility or current-vessel claim";
        attribute :>> revisionBasis = "evidence/runs/2026-10-12-finite-passage/manifest.json and native evidenceManifest retain the original scope/status.";
        ref part :>> representedSubject = BlueDogFinitePassageSizing::candidate;
    }
    part reliabilityIllustration : ContextRecord {
        attribute :>> identifier = "ReliabilityIllustration";
        attribute :>> role = "Synthetic exposure/rate example";
        attribute :>> intendedUse = "Exercise voyage-duration and constant-hazard arithmetic; not surveyed course geometry or collected vessel failure evidence";
        attribute :>> revisionBasis = "Current illustrative source fingerprint; profile/rates, dependence and statistical applicability remain unaccepted.";
        ref part :>> representedSubject = BlueDogReliabilityExamples::gorgeIllustration;
    }
    part def PlannedInstallation {
        ref part design : MarineDesign::Design [1];
        ref part assembly : BlueDogPhysicalArchitecture::IC01Candidate [1];
        attribute articleId : String [0..1];
        attribute hardwareRevision : String [0..1];
        attribute softwareDataRevision : String [0..1];
        attribute procedureRevision : String [0..1];
        attribute reconciliationRecord : String [0..1];
        attribute reconciled : Boolean default = false;
        attribute identityReady : Boolean = SequenceFunctions::size(articleId) == 1 and
            SequenceFunctions::size(hardwareRevision) == 1 and SequenceFunctions::size(softwareDataRevision) == 1 and
            SequenceFunctions::size(procedureRevision) == 1 and SequenceFunctions::size(reconciliationRecord) == 1 and
            articleId->ControlFunctions::forAll { in v : String; v != "" } and
            hardwareRevision->ControlFunctions::forAll { in v : String; v != "" } and
            softwareDataRevision->ControlFunctions::forAll { in v : String; v != "" } and
            procedureRevision->ControlFunctions::forAll { in v : String; v != "" } and
            reconciliationRecord->ControlFunctions::forAll { in v : String; v != "" };
        attribute plannedReferencesApplicable : Boolean = design == BlueDogIC01::design and assembly == BlueDogPhysicalArchitecture::ic01;
        attribute configurationReconciled : Boolean = plannedReferencesApplicable and identityReady and reconciled;
        doc /* A record identity does not inspect records or accept hardware. Include
         * applicable data/calibration in softwareDataRevision; a justified exclusion
         * belongs in the reconciliation record. No actual article is identified yet. */
    }
    part ic01Installation : PlannedInstallation {
        ref part :>> design = BlueDogIC01::design;
        ref part :>> assembly = BlueDogPhysicalArchitecture::ic01;
    }
    part def ResourceScope {
        attribute label : String [1];
        attribute quantityKind : String [1];
        ref part configuration : MarineDesign::Design [1] = BlueDogIC01::design;
        attribute boundary : String [1];
        attribute mode : String [1];
        attribute ownerRole : String [1];
        attribute basis : String [1];
        attribute closureEvidenceNeeded : String [1];
        attribute massAllocation : MassValue [0..1];
        attribute massEstimate : MassValue [0..1];
        attribute averagePowerAllocation : PowerValue [0..1];
        attribute peakPowerBound : PowerValue [0..1];
        attribute nameplateEnergy : EnergyValue [0..1];
        attribute departureEnergy : EnergyValue [0..1];
        attribute acquisitionLatency : TimeValue [0..1];
        attribute assessmentLatency : TimeValue [0..1];
        attribute commandLatency : TimeValue [0..1];
        attribute maneuverDuration : TimeValue [0..1];
        attribute coverageReviewed : Boolean default = false;
        attribute measurementsAccepted : Boolean default = false;
        attribute accountingReconciled : Boolean default = false;
        attribute evidenceRecord : String [0..1];
        attribute contextIdentified : Boolean = label != "" and quantityKind != "" and boundary != "" and
            mode != "" and ownerRole != "" and basis != "" and closureEvidenceNeeded != "";
        attribute quantitiesValid : Boolean =
            massAllocation->ControlFunctions::forAll { in v : MassValue; v >= 0 [kg] } and
            massEstimate->ControlFunctions::forAll { in v : MassValue; v >= 0 [kg] } and
            averagePowerAllocation->ControlFunctions::forAll { in v : PowerValue; v >= 0 [W] } and
            peakPowerBound->ControlFunctions::forAll { in v : PowerValue; v >= 0 [W] } and
            nameplateEnergy->ControlFunctions::forAll { in v : EnergyValue; v >= 0 [J] } and
            departureEnergy->ControlFunctions::forAll { in v : EnergyValue; v >= 0 [J] } and
            acquisitionLatency->ControlFunctions::forAll { in v : TimeValue; v >= 0 [s] } and
            assessmentLatency->ControlFunctions::forAll { in v : TimeValue; v >= 0 [s] } and
            commandLatency->ControlFunctions::forAll { in v : TimeValue; v >= 0 [s] } and
            maneuverDuration->ControlFunctions::forAll { in v : TimeValue; v >= 0 [s] };
        attribute requiredQuantitiesPresent : Boolean default = false;
        attribute ready : Boolean = contextIdentified and requiredQuantitiesPresent and quantitiesValid and coverageReviewed and measurementsAccepted and accountingReconciled and
            SequenceFunctions::size(evidenceRecord) == 1 and
            evidenceRecord->ControlFunctions::forAll { in v : String; v != "" };
        doc /* Allocations are bound to existing owners, not added measurements.
         * Empty quantities are unknown/not supplied or outside the row's scope.
         * Review the boundary and quantityKind before interpreting or aggregating.
         * No total, headroom or zero entry is fabricated for missing information. */
    }
    part def AccountingCase {
        ref part installation : PlannedInstallation [1];
        part scopes : ResourceScope [1..*];
    }
    part ic01 : AccountingCase {
        ref part :>> installation = ic01Installation;
        part wholeVesselMass : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(massEstimate) == 1;
            attribute :>> label = "Whole-vessel mass estimate, not supplied in this register";
            attribute :>> quantityKind = "Total vessel mass estimate; distinct from component allowances";
            attribute :>> boundary = "Complete loaded vessel: structure, rig, appendages, batteries, equipment, attachment and support/finish contributions. Fixed equipment is one contribution; do not add it again after a complete native mass rollup.";
            attribute :>> mode = "Same loaded IC-01 geometry, equipment and carried-fluid configuration as the associated performance/handling/recovery study";
            attribute :>> ownerRole = "System integration/mass";
            attribute :>> basis = "A new identified coupled/native MassProperties execution is needed to populate this register. Historical IC-01 or reference-design estimates keep their own recorded source/configuration; none is silently substituted here.";
            attribute :>> closureEvidenceNeeded = "Current coupled/native mass/CG result with exact source/geometry inputs, complete installation reconciliation and weighed-article evidence for physical claims; compare with the applicable handling criterion";
        }
        part mainStorage : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(nameplateEnergy) == 1 and SequenceFunctions::size(departureEnergy) == 1;
            attribute :>> label = "Main sailing storage account";
            attribute :>> quantityKind = "Nameplate and allocated departure stored energy; successive states";
            attribute :>> boundary = "One main bank; nameplate, usable and departure states are not additive. Sailing withdrawal/losses/self-discharge and its protected reserve belong to the same finite-passage screen. Independent recovery storage is separate; no cross-bank transfer is credited.";
            attribute :>> mode = "Finite-Gorge passage/holds with current sizing usable/departure fractions; no solar credit in the IC-01 integration hypothesis";
            attribute :>> ownerRole = "Power/energy integration";
            attribute :>> basis = "BlueDogIC01.design.battery_Wh and BlueDogOperatingEnvironment.Inputs usable_fraction/initial_fraction; existing allocations, not measured storage capability";
            attribute :>> nameplateEnergy = BlueDogIC01::design.battery_Wh * 3600 [J];
            attribute :>> departureEnergy = nameplateEnergy * BlueDogOperatingEnvironment::Inputs.usable_fraction * BlueDogOperatingEnvironment::Inputs.initial_fraction;
            attribute :>> closureEvidenceNeeded = "Installed bank usable capacity, initial energy and temperature/end-of-service basis; complete withdrawal/reserve history and measured voltage/current/peak capability, coupled passage and casualty assessment";
        }
        part fixedEquipment : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(massAllocation) == 1;
            attribute :>> label = "Fixed-equipment mass allowance";
            attribute :>> quantityKind = "Mass allocation, not total vessel mass";
            attribute :>> boundary = "Base fixed equipment plus additional equipment plus recovery battery mass. Wind installation, geometry/materials, main battery and actuator models are accounted separately; do not add the recovery battery again.";
            attribute :>> mode = "Candidate installed mass/CG accounting across sailing and recovery";
            attribute :>> ownerRole = "System integration/mass";
            attribute :>> basis = "BlueDogIC01.integration.fixedEquipmentKg; specific-energy conversion is an allowance, not weighed hardware";
            attribute :>> massAllocation = BlueDogIC01::integration.fixedEquipmentKg * 1 [kg];
            attribute :>> closureEvidenceNeeded = "Complete non-overlapping BOM, installation/support mass and locations; weighed articles, packaging and coupled mass/CG/performance reconciliation";
        }
        part sailingElectronics : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(averagePowerAllocation) == 1 and SequenceFunctions::size(peakPowerBound) == 1;
            attribute :>> label = "Sailing electronics bus allowance";
            attribute :>> quantityKind = "Average bus power allocation; peak unknown";
            attribute :>> boundary = "Base electronics including separately provisioned wired wind plus additionalBusW. The additional 8W is inside this row, not another additive load; actuator demand is separate.";
            attribute :>> mode = "Qualifying sailing/holds under the declared performance and duty assumptions";
            attribute :>> ownerRole = "Power/sensing integration";
            attribute :>> basis = "BlueDogIC01.integration.electronicsW; no installed component split or startup/stall/coincident peak bound";
            attribute :>> averagePowerAllocation = BlueDogIC01::integration.electronicsW * 1 [W];
            attribute :>> closureEvidenceNeeded = "Selected acquisition/processing/navigation/recording/communications/signaling/support loads, explicit replacements, measured duty/thermal/peak performance and supplied bus compatibility";
        }
        part recoveryEssentials : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(averagePowerAllocation) == 1 and SequenceFunctions::size(peakPowerBound) == 1;
            attribute :>> label = "Recovery essential-load allowance";
            attribute :>> quantityKind = "Active recovery withdrawal-power allocation; peak unknown";
            attribute :>> boundary = "8W essentials used by the recovery demand model, separately from active motor and voyage standby. Not a measured bus split; record-storage and telemetry supply assignment is unresolved.";
            attribute :>> mode = "Active upright/inverted recovery after loss of primary sailing";
            attribute :>> ownerRole = "Recovery/power";
            attribute :>> basis = "BlueDogIC01.integration.recoveryEssentialW; preserve the recovery model's battery-withdrawal boundary and do not apply bus conversion twice";
            attribute :>> averagePowerAllocation = BlueDogIC01::integration.recoveryEssentialW * 1 [W];
            attribute :>> closureEvidenceNeeded = "Installed surviving functions, actual supply topology, conversions, simultaneous load and fault isolation; measured casualty performance";
        }
        part recoveryStorage : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(nameplateEnergy) == 1 and SequenceFunctions::size(departureEnergy) == 1;
            attribute :>> label = "Independent recovery storage account";
            attribute :>> quantityKind = "Nameplate and departure stored energy; successive states";
            attribute :>> boundary = "Nameplate and departure are not additive capacity. Standby depletes departure energy; route/casualty demand is assessed against the remaining bank. Main-pack protected reserve remains a separate conservative screen, with no pack transfer credited.";
            attribute :>> mode = "Voyage standby then route-dependent casualty recovery";
            attribute :>> ownerRole = "Recovery/energy";
            attribute :>> basis = "BlueDogIC01.integration.recoveryBatteryWh/recoveryDepartureWh; 1Wh=3600J";
            attribute :>> nameplateEnergy = BlueDogIC01::integration.recoveryBatteryWh * 3600 [J];
            attribute :>> departureEnergy = BlueDogIC01::integration.recoveryDepartureWh * 3600 [J];
            attribute :>> closureEvidenceNeeded = "Same installed bank's temperature/end-of-service usable capacity, initial energy, standby history and casualty route demand, peaks and no-transfer/isolation evidence";
        }
        part responseTiming : ResourceScope subsets scopes {
            attribute :>> requiredQuantitiesPresent = SequenceFunctions::size(acquisitionLatency) == 1 and SequenceFunctions::size(assessmentLatency) == 1 and SequenceFunctions::size(commandLatency) == 1 and SequenceFunctions::size(maneuverDuration) == 1;
            attribute :>> label = "Allocated encounter response stages";
            attribute :>> quantityKind = "Individual time allowances, not an accepted end-to-end bound";
            attribute :>> boundary = "Acquisition/assessment/command/maneuver allowances belong to separate response stages. Queueing, overlap, clock uncertainty and occupied-actuator delay need a whole-path model; do not infer a complete deadline by adding labels.";
            attribute :>> mode = "Local IC-01 encounter hypothesis, including degraded/occupied response";
            attribute :>> ownerRole = "Control/sensing integration";
            attribute :>> basis = "BlueDogIC01.integration.sensorLatencyS/assessmentS/commandS/maneuverS";
            attribute :>> acquisitionLatency = BlueDogIC01::integration.sensorLatencyS * 1 [s];
            attribute :>> assessmentLatency = BlueDogIC01::integration.assessmentS * 1 [s];
            attribute :>> commandLatency = BlueDogIC01::integration.commandS * 1 [s];
            attribute :>> maneuverDuration = BlueDogIC01::integration.maneuverS * 1 [s];
            attribute :>> closureEvidenceNeeded = "Synchronized installed observations, scheduling, delivered command and achieved motion, interacting faults and current class/clearance acceptance criteria";
        }
    }
    analysis def AccountingReview {
        subject account : AccountingCase;
        out attribute scopeCount : Integer = SequenceFunctions::size(account.scopes);
        out attribute allScopesSameConfiguration : Boolean = account.scopes->ControlFunctions::forAll {
            in row : ResourceScope; row.configuration == account.installation.design };
        out attribute installationReconciled : Boolean = account.installation.configurationReconciled;
        out attribute resourceEvidenceReady : Boolean = scopeCount > 0 and account.scopes->ControlFunctions::forAll {
            in row : ResourceScope; row.ready };
        return ready : Boolean = allScopesSameConfiguration and installationReconciled and resourceEvidenceReady;
    }
    analysis currentReview : AccountingReview { subject = ic01; }
    dependency wholeMassBasis from ic01::wholeVesselMass to BlueDogCoupledSizing::MassProperties;
    dependency mainStorageBasis from ic01::mainStorage to BlueDogIC01::design::battery_Wh;
    dependency massBasis from ic01::fixedEquipment to BlueDogIC01::integration::fixedEquipmentKg;
    dependency sailingBasis from ic01::sailingElectronics to BlueDogIC01::integration::electronicsW;
    dependency recoveryLoadBasis from ic01::recoveryEssentials to BlueDogIC01::integration::recoveryEssentialW;
    dependency storageBasis from ic01::recoveryStorage to BlueDogIntegratedCandidate::RecoveryScreen;
    dependency timingBasis from ic01::responseTiming to BlueDogEncounterReview::criteria;
    metadata issue : ModelingMetadata::Issue { text = "C-01: Identify installed article/hardware/software-data/procedure revisions and reconcile actual configuration. C-02: Replace lumped allowances with non-overlapping measured installation accounting, including signal/record/telemetry and recovery supplies. C-03: Reconcile modes, peaks, storage/conversion/reserve boundaries and mass/CG/performance coupling. C-04: Establish uncertainty/margin and change/retest triggers from evidence; none of these accounting scopes is accepted physical evidence."; }
}
