package BlueDogWindDocuments {
    private import DocumentQueries::*;
    calc def Configurations :> Query {
        Project(source = Named(qualifiedName = ("BlueDogWindEquipment::testbed", "BlueDogWindEquipment::challenge")), columns = (
            Column(name = "Configuration", path = "name"),
            Column(name = "Sensor", path = "product"),
            Column(name = "Interface", path = "dataInterface"),
            Column(name = "Installed mass kg", path = "installedMassKg"),
            Column(name = "Vessel bus W", path = "busPowerW"),
            Column(name = "Internal battery hours (supplier)", path = "internalBatteryRuntimeHours")))
    }
    part def WindEquipment :> Document {
        attribute redefines title = "Wind-sensing configurations";
        part configurations : Table { calc rows : Configurations; }
    }
}

package BlueDogDocuments {
    private import DocumentQueries::*;
    calc def ModelElements :> Query {
        Descendants(source = Named(qualifiedName = ("GorgeChallenge", "BlueDog::Goals", "BlueDogRequirements", "BlueDogStructure")))
    }
    calc def Requirements :> Query {
        Project(source = WhereType(source = ModelElements(), type = "RequirementDefinition"),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Requirement", path = "name"), Column(name = "Status", path = "workStatus.status"), Column(name = "Statement", path = "documentation")))
    }
    calc def DeferredRequirements :> Query {
        Project(source = WhereMetadata(source = WhereType(source = ModelElements(), type = "RequirementDefinition"), 'metadata' = "BlueDogMissionScope::Applicability"),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Requirement", path = "name")))
    }
    part def FutureMissionRequirements :> Document {
        attribute redefines title = "Deferred mission requirements";
        part entries : Table { calc rows : DeferredRequirements; }
    }
    calc def Derivations :> Query {
        Project(source = WhereType(source = ModelElements(), type = "ConnectionUsage"),
            columns = (
            Column(name = "Original", cell = { in row : KerML::Kernel::Connector;
            WhereMetadata(source = row.connectorEnd, 'metadata' = "RequirementDerivation::OriginalRequirementMetadata")->ControlFunctions::collect { in e : KerML::Core::Feature; e.ownedReferenceSubsetting.referencedFeature } }),
            Column(name = "Derived", cell = { in row : KerML::Kernel::Connector;
            WhereMetadata(source = row.connectorEnd, 'metadata' = "RequirementDerivation::DerivedRequirementMetadata")->ControlFunctions::collect { in e : KerML::Core::Feature; e.ownedReferenceSubsetting.referencedFeature } }),
            Column(name = "Status", path = "workStatus.status"), Column(name = "Rationale", path = "rationale.text")))
    }
    calc def UseCaseLinks :> Query {
        Project(source = WhereType(source = Descendants(source = Named(qualifiedName = "BlueDogUseCases")), type = "UseCaseUsage"),
            properties = ("name", "documentation"),
            columns = (Column(name = "Requirement", cell = { in row : SysML::UseCaseUsage;
            row.objectiveRequirement.ownedSubsetting.subsettedFeature })))
    }

    calc def SatisfactionLinks :> Query {
        Project(source = WhereType(source = Descendants(source = Named(qualifiedName = "BlueDogRequirements")), type = "RequirementUsage"),
            properties = ("name"),
            columns = (Column(name = "Design element", cell = { in row : SysML::RequirementUsage;
            RelatedElements(source = row, relationshipKind = "satisfaction", direction = "incoming", maxDepth = 1) })))
    }
    part def Traceability :> Document {
        attribute redefines title = "Use-case and architecture traceability";
        part caution : Paragraph { attribute redefines text = "Use-case objectives subset the referenced requirements. Satisfy relationships express intended design allocations, not verified compliance; criteria and evidence remain open."; }
        part useCases : Section {
            attribute redefines title = "Use-case objectives";
            part entries : Table { calc rows : UseCaseLinks; }
        }
        part satisfaction : Section {
            attribute redefines title = "Architecture satisfaction allocations";
            part entries : Table { calc rows : SatisfactionLinks; }
        }
    }
    part def RequirementsRegister :> Document {
        attribute redefines title = "Requirement derivation register";
        part context : Paragraph {
            part link : Link { attribute redefines text = "Qualification conditions, rationale, open issues and verification specifications"; attribute redefines target = "methods/modeling.md"; }
        }
        part intro : Paragraph {
            attribute redefines text = "Generated natively by OpenSysML from the project models. Status describes work on the model element, not verification. Derivations express required acceptance outcomes under their stated conditions, not evidence that a vessel satisfies them. Design-basis dependencies and refinements are reported separately.";
        }
        part requirements : Section {
            attribute redefines title = "Requirements";
            part entries : Table { calc rows : Requirements; }
        }
        part derivations : Section {
            attribute redefines title = "Derivations";
            part entries : Table { calc rows : Derivations; }
        }
    }

    calc def EnergyLoads :> Query {
        Project(source = WhereType(source = Descendants(source = Named(qualifiedName = "BlueDogEnergyExamples::sailing"), maxDepth = 1), type = "PartUsage"),
            columns = (Column(name = "Load", path = "label"),
            Column(name = "Active power", path = "activePower"), Column(name = "Idle power", path = "idlePower"),
            Column(name = "Active fraction", path = "activeFraction"), Column(name = "Conversion efficiency", path = "conversionEfficiency"),
            Column(name = "Uncertainty factor", path = "uncertaintyFactor"),
            Column(name = "Average bus power", path = "averagePower"), Column(name = "Peak bus power", path = "peakPower")))
    }
    calc def EnergyTotals :> Query {
        Project(source = Named(qualifiedName = "BlueDogEnergyExamples::sailing"),
            columns = (Column(name = "Budget", path = "name"), Column(name = "Average demand", path = "averagePower"), Column(name = "Coincident peak", path = "peakPower")))
    }
    part def EnergyBudget :> Document {
        attribute redefines title = "Sustained-operation energy roll-up";
        part caution : Paragraph {
            attribute redefines text = "Generated natively from the synthetic example. These are illustrative inputs, not measurements or hardware selections. Conversion losses and uncertainty factors are included per load; peak powers are conservatively coincident. See the energy article for configuration boundaries, the perception trade and evidence limitations.";
        }
        part loads : Table { calc rows : EnergyLoads; }
        part totals : Table { calc rows : EnergyTotals; }
    }

    calc def RequirementDefinitions :> Query {
        WhereType(source = ModelElements(), type = "RequirementDefinition")
    }
    calc def Conditions :> Query {
        WhereText(source = Project(source = RequirementDefinitions(),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Requirement", path = "name"),
            Column(name = "Text", cell = { in row : KerML::Root::Element;
            row.ownedElement->ControlFunctions::select { in e : KerML::Root::Element; e.declaredName == "conditions" }->ControlFunctions::collect { in c : KerML::Root::Comment; c.body } }))),
            columns = ("Text"), operator = "!=", value = "")
    }
    calc def Notes :> Query {
        WhereText(source = Project(source = RequirementDefinitions(),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Requirement", path = "name"),
            Column(name = "Text", cell = { in row : KerML::Root::Element;
            row.ownedElement->ControlFunctions::select { in e : KerML::Root::Element; e.declaredName == "notes" }->ControlFunctions::collect { in c : KerML::Root::Comment; c.body } }))),
            columns = ("Text"), operator = "!=", value = "")
    }
    calc def RationaleRows :> Query {
        Project(source = WhereMetadata(source = RequirementDefinitions(), 'metadata' = "ModelingMetadata::Rationale"),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Requirement", path = "name"), Column(name = "Text", path = "rationale.text")))
    }
    calc def IssueRows :> Query {
        Project(source = WhereMetadata(source = RequirementDefinitions(), 'metadata' = "ModelingMetadata::Issue"),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Requirement", path = "name"), Column(name = "Text", path = "issue.text")))
    }
    calc def VerificationSpecifications :> Query {
        Project(source = WhereType(source = Descendants(source = Named(qualifiedName = ("BlueDogRequirementVerification", "BlueDogReliability"))), type = "VerificationCaseDefinition"),
            properties = ("shortName", "name", "documentation"),
            columns = (Column(name = "Verifies", cell = { in row : SysML::VerificationCaseDefinition;
            RelatedElements(source = row, relationshipKind = "verification", direction = "outgoing", maxDepth = 1) })))
    }
    part def RequirementContext :> Document {
        attribute redefines title = "Requirement context and verification specifications";
        part intro : Paragraph { attribute redefines text = "Requirement statements are in the register and focused views. Qualification conditions below are normative definitions and test applicability; they are not optional rationale. Notes and rationale explain scope and decisions. Verification specifications describe planned evidence collection and return inconclusive until implemented with accepted evidence. No physical compliance is asserted."; }
        part conditions : Section {
            attribute redefines title = "Qualification conditions (normative)";
            part entries : Table { calc rows : Conditions; }
        }
        part rationale : Section {
            attribute redefines title = "Rationale";
            part entries : Table { calc rows : RationaleRows; }
        }
        part notes : Section {
            attribute redefines title = "Explanatory notes";
            part entries : Table { calc rows : Notes; }
        }
        part issues : Section {
            attribute redefines title = "Open issues";
            part entries : Table { calc rows : IssueRows; }
        }
        part verificationSpecifications : Section {
            attribute redefines title = "Verification specifications";
            part entries : Table { calc rows : VerificationSpecifications; }
        }
    }
    calc def ChallengeStatements :> Query {
        Project(source = WhereType(source = Descendants(source = Named(qualifiedName = "GorgeChallenge")), type = "RequirementDefinition"),
            columns = (Column(name = "ID", path = "shortName"), Column(name = "Rule", path = "name"), Column(name = "Statement", path = "documentation")))
    }
    part def ChallengeBrief :> Document {
        attribute redefines title = "Trans-Gorge challenge";
        part intro : Paragraph { attribute redefines text = "The challenge is defined independently of the vehicle in missions/transgorge.sysml. The statements below are generated from that model. Read the linked qualification conditions and open issues with these rules; a statement or model check is not proof of completion."; }
        part rules : Table { calc rows : ChallengeStatements; }
        part context : Paragraph { part link : Link { attribute redefines text = "Qualification conditions and open issues"; attribute redefines target = "methods/modeling.md"; } }
        part derivation : Paragraph { part link : Link { attribute redefines text = "Challenge derivations"; attribute redefines target = "requirements/requirements-c-000.md"; } }
        part process : Paragraph { part link : Link { attribute redefines text = "Design process and model sources"; attribute redefines target = "index.md"; } }
    }

    calc def RefinementDependencies :> Query {
        WhereMetadata(source = WhereType(source = ModelElements(), type = "Dependency"), 'metadata' = "ModelingMetadata::Refinement")
    }
    calc def RefinementLinks :> Query {
        Project(source = RefinementDependencies(), columns = (
            Column(name = "Refining element", cell = { in row : KerML::Root::Dependency; row.client }),
            Column(name = "Refined element", cell = { in row : KerML::Root::Dependency; row.supplier }),
            Column(name = "Rationale", path = "rationale.text")))
    }
    calc def DesignBasisLinks :> Query {
        Project(source = Except(source = WhereType(source = ModelElements(), type = "Dependency"), exclude = RefinementDependencies()), columns = (
            Column(name = "Dependent requirement", cell = { in row : KerML::Root::Dependency; row.client }),
            Column(name = "Design basis", cell = { in row : KerML::Root::Dependency; row.supplier }),
            Column(name = "Rationale", path = "rationale.text")))
    }
    part def RelationshipRegister :> Document {
        attribute redefines title = "Refinements and design-basis dependencies";
        part meaning : Paragraph { attribute redefines text = "Refinement points from a more precise representation to the element it clarifies. Plain dependency points from a dependent design obligation to its basis; it makes no satisfaction implication. These are model relationships, not completed evidence."; }
        part refinements : Section { attribute redefines title = "Refinement"; part entries : Table { calc rows : RefinementLinks; } }
        part designBasis : Section { attribute redefines title = "Plain dependency"; part entries : Table { calc rows : DesignBasisLinks; } }
    }
}

package BlueDogEvidenceDocuments {
    private import DocumentQueries::*;
    calc def Cases :> Query {
        Named(qualifiedName = ("BlueDogCurrentSizing::nominal", "BlueDogCurrentSizing::construction", "BlueDogCurrentSizing::aerodynamic", "BlueDogCurrentSizing::hydrodynamic", "BlueDogCurrentSizing::energy", "BlueDogCurrentSizing::combined"))
    }
    calc def Outcomes :> Query {
        Project(source = Cases(), columns = (
            Column(name = "Scenario", path = "label"),
            Column(name = "Sailing, structure and route", path = "operatingScreensPass"),
            Column(name = "Lowest replay margins", path = "limitingScreens"),
            Column(name = "Sampled roll positive", path = "sampledRollPositive"),
            Column(name = "Unstable pitch samples", path = "pitchUnstableSamples"),
            Column(name = "Peak-power diagnostic cases", path = "diagnosticControlCases"),
            Column(name = "Evidence accepted", path = "evidenceAccepted")))
    }
    calc def Dimensions :> Query {
        Project(source = Named(qualifiedName = "BlueDogCurrentSizing::candidate"), columns = (
            Column(name = "Length (m)", path = "length_m"),
            Column(name = "Beam (m)", path = "beam_m"),
            Column(name = "Wing area (m2)", path = "sail_m2"),
            Column(name = "Ballast (kg)", path = "ballast_kg"),
            Column(name = "Battery (Wh)", path = "battery_Wh")))
    }
    calc def Search :> Query {
        Project(source = Named(qualifiedName = "BlueDogCurrentSizing::searchAssessment"), columns = (
            Column(name = "Search status", path = "solverStatus"),
            Column(name = "Coarse feasible", path = "coarseFeasible"),
            Column(name = "Mass (kg)", path = "massKg"),
            Column(name = "Max equilibrium residual", path = "maximumResidual"),
            Column(name = "Minimum screen margin", path = "minimumMargin"),
            Column(name = "Qualified", path = "qualified")))
    }
    calc def Passage :> Query {
        Project(source = Cases(), columns = (Column(name = "Scenario", path = "label"),
            Column(name = "Westerly round trip (h, conditional)", path = "westerlyTimeLabel"),
            Column(name = "Easterly round trip (h, conditional)", path = "easterlyTimeLabel"),
            Column(name = "Mass (kg)", path = "massKg")))
    }
    calc def LimitingScreens :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCurrentSizing::searchConstraint0", "BlueDogCurrentSizing::searchConstraint1", "BlueDogCurrentSizing::searchConstraint2", "BlueDogCurrentSizing::searchConstraint3", "BlueDogCurrentSizing::searchConstraint4", "BlueDogCurrentSizing::searchConstraint5")), columns = (
            Column(name = "Lowest search screens", path = "label"), Column(name = "Normalized margin", path = "margin")))
    }
    calc def ActiveBounds :> Query {
        Project(source = Named(qualifiedName = "BlueDogCurrentSizing::searchAssessment"), columns = (
            Column(name = "Active design brackets (not frozen variables)", path = "activeBounds")))
    }
    calc def Convergence :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCurrentSizing::convergence0", "BlueDogCurrentSizing::convergence1", "BlueDogCurrentSizing::convergence2", "BlueDogCurrentSizing::convergence3", "BlueDogCurrentSizing::convergence4", "BlueDogCurrentSizing::convergence5")), columns = (
            Column(name = "Numerical increment", path = "label"),
            Column(name = "Max change CL", path = "CLtot"),
            Column(name = "Max change CDi", path = "CDi"),
            Column(name = "Max change CMy", path = "CMytot"),
            Column(name = "Screen passes", path = "passesScreen")))
    }
    part def AerodynamicChecks :> Document {
        attribute redefines title = "Representative numerical sensitivity";
        part checks : Table { calc rows : Convergence; }
        part coarse : Table { calc rows : CoarseGrid; }
    }
    calc def CoarseGrid :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCurrentSizing::coarseGrid0", "BlueDogCurrentSizing::coarseGrid1", "BlueDogCurrentSizing::coarseGrid2")), columns = (
            Column(name = "Coarse grid versus finest case", path = "label"),
            Column(name = "Max change CL", path = "CLtot"),
            Column(name = "Max change CDi", path = "CDi"),
            Column(name = "Max change CMy", path = "CMytot")))
    }
    calc def Ingress :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCurrentSizing::ingress0", "BlueDogCurrentSizing::ingress1", "BlueDogCurrentSizing::ingress2", "BlueDogCurrentSizing::ingress3", "BlueDogCurrentSizing::ingress4", "BlueDogCurrentSizing::ingress5")), columns = (
            Column(name = "Wing state and water density", path = "label"),
            Column(name = "Min sampled restoring (Nm)", path = "minimumRestoringNm"),
            Column(name = "Missing pitch roots", path = "missingPitchRoots"),
            Column(name = "Unstable pitch samples", path = "unstablePitchSamples"),
            Column(name = "Retained water (kg)", path = "retainedWaterKg")))
    }
    part def Recovery :> Document {
        attribute redefines title = "Archived 2.009 m reference: static ingress sensitivity";
        part cases : Table { calc rows : Ingress; }
    }
    part def CandidateBrief :> Document {
        attribute redefines title = "The trial geometry";
        part candidate : Table { calc rows : Dimensions; }
    }
    part def Summary :> Document {
        attribute redefines title = "Conservative sizing and refined replay";
        part search : Table { calc rows : Search; }
        part candidate : Table { calc rows : Dimensions; }
        part passage : Table { calc rows : Passage; }
        part cases : Table { calc rows : Outcomes; }
        part limiting : Table { calc rows : LimitingScreens; }
        part bounds : Table { calc rows : ActiveBounds; }
    }
}

package BlueDogSailTradeDocuments {
    private import DocumentQueries::*;
    calc def Candidates :> Query { Named(qualifiedName = ("BlueDogSailTrade::tailWing", "BlueDogSailTrade::camberedWing", "BlueDogSailTrade::softSail")) }
    calc def Concepts :> Query { Project(source = Candidates(), columns = (Column(name = "Candidate", path = "label"), Column(name = "Definition", path = "concept"))) }
    calc def Durability :> Query { Project(source = Candidates(), columns = (Column(name = "Candidate", path = "label"), Column(name = "Durability and reliability", path = "durability"), Column(name = "Energy", path = "energy"))) }
    calc def Recovery :> Query { Project(source = Candidates(), columns = (Column(name = "Candidate", path = "label"), Column(name = "Sailing performance", path = "sailing"), Column(name = "Recovery geometry", path = "recovery"))) }
    calc def Manufacturing :> Query { Project(source = Candidates(), columns = (Column(name = "Candidate", path = "label"), Column(name = "Construction", path = "manufacturing"), Column(name = "Next evidence", path = "nextEvidence"))) }
    calc def Results :> Query { Project(source = Named(qualifiedName = ("BlueDogSailTrade::tailAssessment", "BlueDogSailTrade::camberAssessment", "BlueDogSailTrade::softAssessment")), columns = (Column(name = "Candidate", path = "candidateName"), Column(name = "Development decision", path = "developmentDecision"), Column(name = "Requirement verdict", path = "requirementVerdict"))) }
    calc def Traces :> Query { Project(source = WhereType(source = Descendants(source = Named(qualifiedName = "BlueDogSailTrade")), type = "Dependency"), columns = (Column(name = "Analysis element", cell = { in row : KerML::Root::Dependency; row.client }), Column(name = "Requirement / architecture", cell = { in row : KerML::Root::Dependency; row.supplier }))) }
    part def Report :> Document {
        attribute redefines title = "Sail architecture trade study";
        part scope : Paragraph { attribute redefines text = "Equal comparison of three rig concepts for the finite Gorge mission. All physical requirement gates remain unknown. No numeric reliability rates or arbitrary weighted scores are assigned. No rig is selected or mission-qualified. Sources and decision rationale are linked in BlueDogSourceEvidence and BlueDogDesignDecisions."; }
        part decision : Section { attribute redefines title = "Native analysis conclusion"; part rows : Table { calc rows : Results; } }
        part concepts : Section { attribute redefines title = "Candidate definitions"; part rows : Table { calc rows : Concepts; } }
        part durability : Section { attribute redefines title = "Durability and energy"; part rows : Table { calc rows : Durability; } }
        part recovery : Section { attribute redefines title = "Performance and capsize"; part rows : Table { calc rows : Recovery; } }
        part construction : Section { attribute redefines title = "Manufacturing and evidence"; part rows : Table { calc rows : Manufacturing; } }
        part trace : Section { attribute redefines title = "Requirement and architecture links"; part rows : Table { calc rows : Traces; } }
    }
    part def Conclusion :> Document {
        attribute redefines title = "Current trade disposition";
        part decision : Table { calc rows : Results; }
    }
}

package BlueDogReliabilityDocuments {
    private import DocumentQueries::*;
    calc def Modes :> Query {
        WhereType(source = Descendants(source = Named(qualifiedName = "BlueDogDFMEA::starter")),
            type = "FailureAnalysis::ReviewRow")
    }
    calc def Functions :> Query {
        Project(source = Modes(), columns = (Column(name = "ID", path = "identifier"),
            Column(name = "Model element", path = "name"), Column(name = "Function", path = "intendedFunction"), Column(name = "Failure mode", path = "failureModeText")))
    }
    calc def Effects :> Query {
        Project(source = Modes(), columns = (Column(name = "ID", path = "identifier"),
            Column(name = "Cause", path = "causeText"), Column(name = "Local effect", path = "localEffectText"), Column(name = "Mission effect", path = "missionEffectText")))
    }
    calc def Actions :> Query {
        Project(source = Modes(), columns = (Column(name = "ID", path = "identifier"),
            Column(name = "Proposed detection", path = "proposedDetection"), Column(name = "Recommended action", path = "recommendedAction"), Column(name = "Owner role", path = "ownerRole")))
    }
    calc def Dispositions :> Query {
        Project(source = Modes(), columns = (Column(name = "ID", path = "identifier"),
            Column(name = "Safety-critical", path = "safetyCritical"), Column(name = "Disposition accepted", path = "dispositionAccepted"),
            Column(name = "Action evidence accepted", path = "actionEvidenceAccepted"), Column(name = "Evidence", path = "evidenceReference")))
    }
    calc def Traces :> Query {
        Project(source = WhereType(source = Descendants(source = Named(qualifiedName = "BlueDogDFMEA")), type = "Dependency"),
            columns = (Column(name = "From", cell = { in row : KerML::Root::Dependency; row.client }),
            Column(name = "To", cell = { in row : KerML::Root::Dependency; row.supplier })))
    }
    part def DFMEA :> Document {
        attribute redefines title = "Initial architecture DFMEA";
        part intro : Paragraph { attribute redefines text = "Initial hypotheses for the logical architecture. Detection and prevention actions are proposed, not implemented controls. Risks are unassessed; no probabilities or RPNs are assigned. Scope completeness and every disposition remain open. Read reliability.md for the exposure model."; }
        part functions : Section { attribute redefines title = "Functions and failure modes"; part rows : Table { calc rows : Functions; } }
        part guide : Paragraph { part link : Link { attribute redefines text = "Cruise and reliability analysis guide"; attribute redefines target = "reliability.md"; } }
        part effects : Section { attribute redefines title = "Causes and effects"; part rows : Table { calc rows : Effects; } }
        part actions : Section { attribute redefines title = "Detection, actions and evidence"; part rows : Table { calc rows : Actions; } }
        part dispositions : Section { attribute redefines title = "Disposition and evidence"; part rows : Table { calc rows : Dispositions; } }
        part traces : Section { attribute redefines title = "Architecture and requirement links"; part rows : Table { calc rows : Traces; } }
    }
}

package BlueDogWeatherDocuments {
    private import DocumentQueries::*;
    calc def Cases :> Query {
        Named(qualifiedName = ("BlueDogWindObservations::KDLS_warm", "BlueDogWindObservations::KDLS_winter", "BlueDogWindObservations::KTTD_warm", "BlueDogWindObservations::KTTD_winter"))
    }
    calc def Counts :> Query {
        Project(source = Cases(), columns = (
            Column(name = "Station", path = "station"), Column(name = "Season", path = "season"),
            Column(name = "Calendar hours", path = "expectedHours"),
            Column(name = "West", path = "westHours"), Column(name = "East", path = "eastHours"),
            Column(name = "Light", path = "lightHours"), Column(name = "Other", path = "otherHours"),
            Column(name = "Unknown / absent", path = "unknownHours")))
    }
    calc def Windows :> Query {
        Project(source = Cases(), columns = (
            Column(name = "Station", path = "station"), Column(name = "Season", path = "season"),
            Column(name = "Complete windows", path = "selectedWindows"),
            Column(name = "East encounters", path = "windowsWithEast"),
            Column(name = "Incomplete windows", path = "incompleteWindows"),
            Column(name = "Missing-data lower %", path = "encounterLowerPercent"),
            Column(name = "Missing-data upper %", path = "encounterUpperPercent"),
            Column(name = "Status", path = "eastEncounterLabel")))
    }
    part def Observations :> Document {
        attribute redefines title = "Gorge station observations: 2015–2024";
        part counts : Section { attribute redefines title = "Hourly bins"; part rows : Table { calc rows : Counts; } }
        part windows : Section { attribute redefines title = "72-hour window probe, not mission probability"; part rows : Table { calc rows : Windows; } }
    }
}

package BlueDogContinuationDocuments {
    private import DocumentQueries::*;
    calc def Stages :> Query {
        Project(source = Named(qualifiedName = ("BlueDogSizingContinuation::stage0", "BlueDogSizingContinuation::stage1", "BlueDogSizingContinuation::stage2", "BlueDogSizingContinuation::stage3", "BlueDogSizingContinuation::stage4")), columns = (
            Column(name = "Hull length (m)", path = "lengthM"),
            Column(name = "Coarse feasible", path = "feasible"),
            Column(name = "Max equilibrium residual", path = "maximumResidual"),
            Column(name = "Lowest margin", path = "minimumMargin")))
    }
    calc def Dimensions :> Query {
        Project(source = Named(qualifiedName = "BlueDogSizingContinuation::candidate"), columns = (
            Column(name = "Length (m)", path = "length_m"),
            Column(name = "Beam (m)", path = "beam_m"),
            Column(name = "Wing area (m2)", path = "sail_m2"),
            Column(name = "Ballast (kg)", path = "ballast_kg"),
            Column(name = "Battery (Wh)", path = "battery_Wh")))
    }
    calc def Assessment :> Query {
        Project(source = Named(qualifiedName = "BlueDogSizingContinuation::assessment"), columns = (
            Column(name = "Mass (kg)", path = "massKg"),
            Column(name = "Coarse westerly time (h)", path = "westerlyHours"),
            Column(name = "Rudder chord (m)", path = "rudderChordM"),
            Column(name = "Rudder aspect ratio", path = "rudderAspectRatio"),
            Column(name = "Hull + neutral rudder extent (m)", path = "neutralHullRudderLengthM"),
            Column(name = "Qualified", path = "qualified")))
    }
    part def Summary :> Document {
        attribute redefines title = "Continuation toward 1.2 m";
        part stages : Table { calc rows : Stages; }
        part dimensions : Table { calc rows : Dimensions; }
        part assessment : Table { calc rows : Assessment; }
    }
}

package BlueDogFinitePassageDocuments {
    private import DocumentQueries::*;
    calc def Stages :> Query {
        Project(source = Named(qualifiedName = ("BlueDogFinitePassageSizing::stage0", "BlueDogFinitePassageSizing::stage1", "BlueDogFinitePassageSizing::stage2", "BlueDogFinitePassageSizing::stage3")), columns = (
            Column(name = "Hull length (m)", path = "lengthM"),
            Column(name = "Mass (kg)", path = "massKg"),
            Column(name = "Battery (Wh)", path = "batteryWh"),
            Column(name = "Swept length (m)", path = "sweptLengthM"),
            Column(name = "Nominal coarse pass", path = "feasible")))
    }
    part def Summary :> Document {
        attribute redefines title = "Finite-passage sizing stages";
        part stages : Table { calc rows : Stages; }
    }
}

package BlueDogSRRDocuments {
    private import DocumentQueries::*;
    calc def EnvironmentProposalRows :> Query {
        Project(source = Named(qualifiedName = ("BlueDogEnvironmentReview::proposed")), columns = (
            Column(name = "Wind upper m/s", path = "operationalWindUpperMps"),
            Column(name = "Gust upper m/s", path = "operationalGustUpperMps"),
            Column(name = "Significant wave height m", path = "operationalWaveHeightM"),
            Column(name = "Peak periods s", path = "operationalPeriodSeconds"),
            Column(name = "Current sensitivity m/s", path = "currentSensitivityUpperMps")))
    }
    part def EnvironmentProposal :> Document {
        attribute redefines title = "Provisional environmental design allocations";
        part allocations : Table { calc rows : EnvironmentProposalRows; }
    }
}

package BlueDogRecoverySiteDocuments {
    private import DocumentQueries::*;
    calc def Candidates :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRecoverySiteReview::bingen", "BlueDogRecoverySiteReview::stevenson", "BlueDogRecoverySiteReview::springCreek", "BlueDogRecoverySiteReview::viento", "BlueDogRecoverySiteReview::homeValley", "BlueDogRecoverySiteReview::drano")), columns = (
            Column(name = "Candidate", path = "site"),
            Column(name = "Access evidence", path = "evidence"),
            Column(name = "Before routing", path = "outstanding"),
            Column(name = "Desktop decision", path = "desktopDisposition"),
            Column(name = "Accepted", path = "acceptedForRouting")))
    }
    part def Shortlist :> Document {
        attribute redefines title = "Recovery-site assessment shortlist";
        part candidates : Table { calc rows : Candidates; }
    }
}

package BlueDogSRRFrontierDocuments {
    private import DocumentQueries::*;
    calc def Alternatives :> Query {
        Project(source = Named(qualifiedName = ("BlueDogSRRFrontier::point0", "BlueDogSRRFrontier::point1", "BlueDogSRRFrontier::point2", "BlueDogSRRFrontier::point3", "BlueDogSRRFrontier::point4", "BlueDogSRRFrontier::point5")), columns = (
            Column(name = "Length cap (m)", path = "capM"),
            Column(name = "Objective", path = "optimizationObjective"),
            Column(name = "Coarse feasible", path = "feasible"),
            Column(name = "Mass (kg)", path = "massKg"),
            Column(name = "Conditional passage (h)", path = "conditionalPassageHours"),
            Column(name = "Overall length (m)", path = "overallLengthM")))
    }
    part def Summary :> Document {
        attribute redefines title = "Bounded local sizing alternatives";
        part alternatives : Table { calc rows : Alternatives; }
    }
    calc def Replay :> Query {
        Project(source = Named(qualifiedName = "BlueDogSRRFrontier::retainedSeedReplay"), columns = (
            Column(name = "Mass (kg)", path = "massKg"),
            Column(name = "Westerly passage (h)", path = "westerlyHours"),
            Column(name = "Voyage energy margin", path = "voyageEnergyMargin"),
            Column(name = "Refined screens pass", path = "profileScreensPass"),
            Column(name = "Qualified", path = "qualified")))
    }
    part def SeedReplay :> Document {
        attribute redefines title = "Refined replay of the retained seed";
        part replay : Table { calc rows : Replay; }
    }
}

package BlueDogSRRReadinessDocuments {
    private import DocumentQueries::*;
    calc def EncounterRows :> Query {
        Project(source = Named(qualifiedName = "BlueDogEncounterReview::criteria"), columns = (
            Column(name = "Acquisition range m", path = "rangeAllocationM"),
            Column(name = "Acquisition s", path = "acquisitionSeconds"),
            Column(name = "Assessment s", path = "assessmentSeconds"),
            Column(name = "Command s", path = "commandSeconds"),
            Column(name = "Maneuver s", path = "maneuverSeconds"),
            Column(name = "Contingency s", path = "reserveSeconds")))
    }
    part def Encounters :> Document {
        attribute redefines title = "Historical six-class traffic allocation";
        part budget : Table { calc rows : EncounterRows; }
    }
    calc def SiteDecisionRows :> Query {
        Project(source = Named(qualifiedName = "BlueDogRecoverySiteReview::selection"), columns = (
            Column(name = "Endpoints", path = "primarySites"),
            Column(name = "Intermediate coverage", path = "intermediateSites"),
            Column(name = "Coverage acceptance", path = "coverageDecision")))
    }
    part def SiteDecision :> Document {
        attribute redefines title = "Recovery architecture decision";
        part selection : Table { calc rows : SiteDecisionRows; }
    }
}

package BlueDogSRRCurrentDocuments {
    private import DocumentQueries::*;
    calc def CandidateRows :> Query {
        Project(source = Named(qualifiedName = "BlueDogSRRCurrent::candidate"), columns = (
            Column(name = "Battery Wh", path = "batteryWh"),
            Column(name = "Mass kg", path = "massKg"),
            Column(name = "Passage h", path = "westerlyPassageHours"),
            Column(name = "Energy headroom Wh", path = "energyHeadroomWh"),
            Column(name = "Refined static screens pass", path = "staticScreensPass"),
            Column(name = "Physically qualified", path = "physicallyQualified")))
    }
    part def Summary :> Document {
        attribute redefines title = "Gorge sizing candidate";
        part result : Table { calc rows : CandidateRows; }
    }
}

package BlueDogRequirementBasisDocuments {
    private import DocumentQueries::*;
    calc def Decisions :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRequirementBasis::materials", "BlueDogRequirementBasis::structuralScreens", "BlueDogRequirementBasis::manufactureAndSites", "BlueDogRequirementBasis::aging", "BlueDogRequirementBasis::retainedAllocations", "BlueDogRequirementBasis::recoveryStrategy")), columns = (
            Column(name = "Current design basis", path = "disposition"),
            Column(name = "Evidence needed", path = "evidenceNeeded")))
    }
    part def Summary :> Document {
        attribute redefines title = "Requirements and provisional design basis";
        part decisions : Table { calc rows : Decisions; }
    }
}

package BlueDogRiskDocuments {
    private import DocumentQueries::*;
    calc def PrioritiesRows :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRisks::traffic", "BlueDogRisks::recovery", "BlueDogRisks::structure", "BlueDogRisks::wing", "BlueDogRisks::energy", "BlueDogRisks::mission")), columns = (
            Column(name = "ID", path = "risk.identifier"),
            Column(name = "Risk kind", path = "risk.riskKind"),
            Column(name = "Work priority", path = "risk.priority"),
            Column(name = "Risk event", path = "risk.statement"),
            Column(name = "Consequence", path = "risk.consequence"),
            Column(name = "Why investigate now", path = "risk.priorityRationale")))
    }
    part def Priorities :> Document {
        attribute redefines title = "Current investigation priorities";
        part rows : Table { calc values : PrioritiesRows; }
    }
    calc def AssessmentRows :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRisks::traffic", "BlueDogRisks::recovery", "BlueDogRisks::structure", "BlueDogRisks::wing", "BlueDogRisks::energy", "BlueDogRisks::mission")), columns = (
            Column(name = "ID", path = "risk.identifier"),
            Column(name = "Risk kind", path = "risk.riskKind"),
            Column(name = "Likelihood class", path = "risk.likelihoodClass"),
            Column(name = "Consequence class", path = "risk.consequenceClass"),
            Column(name = "Confidence", path = "risk.confidence"),
            Column(name = "Assessment basis", path = "risk.assessmentBasis"),
            Column(name = "Evidence references", path = "risk.evidenceReference")))
    }
    part def Assessments :> Document {
        attribute redefines title = "Qualitative technical risk assessments";
        part rows : Table { calc values : AssessmentRows; }
    }
    calc def ActionsRows :> Query {
        Project(source = Named(qualifiedName = ("BlueDogRisks::traffic", "BlueDogRisks::recovery", "BlueDogRisks::structure", "BlueDogRisks::wing", "BlueDogRisks::energy", "BlueDogRisks::mission")), columns = (
            Column(name = "ID", path = "risk.identifier"),
            Column(name = "Risk kind", path = "risk.riskKind"),
            Column(name = "Evidence gap", path = "risk.uncertainty"),
            Column(name = "Reduction action", path = "risk.reductionAction"),
            Column(name = "Closure evidence", path = "risk.closureEvidence"),
            Column(name = "Disposition", path = "risk.residualDisposition"),
            Column(name = "Owner", path = "workStatus.owner")))
    }
    part def Actions :> Document {
        attribute redefines title = "Investigation actions";
        part rows : Table { calc values : ActionsRows; }
    }
}

package BlueDogRiskPlot {
    private import DocumentQueries::*;
    calc def Rows :> Query {
        Project(source = WhereMetadata(source = Descendants(source = Named(qualifiedName = "BlueDogRisks")), 'metadata' = "RiskMetadata::Risk"), columns = (
            Column(name = "ID", path = "risk.identifier"),
            Column(name = "Risk kind", path = "risk.riskKind"),
            Column(name = "Area", path = "name"),
            Column(name = "Likelihood class", path = "risk.likelihoodClass"),
            Column(name = "Consequence class", path = "risk.consequenceClass"),
            Column(name = "status", path = "workStatus.status"),
            Column(name = "statement", path = "risk.statement"),
            Column(name = "effect", path = "risk.consequence"),
            Column(name = "uncertainty", path = "risk.uncertainty"),
            Column(name = "priority", path = "risk.priority"),
            Column(name = "priorityRationale", path = "risk.priorityRationale"),
            Column(name = "reductionAction", path = "risk.reductionAction"),
            Column(name = "closureEvidence", path = "risk.closureEvidence"),
            Column(name = "confidence", path = "risk.confidence"),
            Column(name = "assessedOn", path = "risk.assessedOn"),
            Column(name = "assessor", path = "risk.assessor"),
            Column(name = "scope", path = "risk.assessmentScope"),
            Column(name = "basis", path = "risk.assessmentBasis"),
            Column(name = "evidence", path = "risk.evidenceReference"),
            Column(name = "disposition", path = "risk.residualDisposition"),
            Column(name = "owner", path = "workStatus.owner")))
    }
    part def Data :> Document {
        attribute redefines title = "Qualitative development risk coordinates";
        part data : Table { calc rows : Rows; }
    }
}

package BlueDogCandidateEnergyDocuments {
    private import DocumentQueries::*;
    calc def Loads :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCandidateEnergy::electronics", "BlueDogCandidateEnergy::wind", "BlueDogCandidateEnergy::wing", "BlueDogCandidateEnergy::rudder", "BlueDogCandidateEnergy::totals")), columns = (
            Column(name = "Load", path = "label"), Column(name = "Average bus W", path = "averageBusW"),
            Column(name = "Peak bus W", path = "peakBusW"), Column(name = "Bus Wh", path = "busWh"),
            Column(name = "Battery Wh", path = "batteryWh")))
    }
    calc def Storage :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCandidateEnergy::nominal", "BlueDogCandidateEnergy::usable", "BlueDogCandidateEnergy::departure")), columns = (
            Column(name = "Storage", path = "label"), Column(name = "Wh", path = "energyWh"), Column(name = "Basis", path = "basis")))
    }
    calc def Ledger :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCandidateEnergy::sailing", "BlueDogCandidateEnergy::losses", "BlueDogCandidateEnergy::selfDischarge", "BlueDogCandidateEnergy::reserve", "BlueDogCandidateEnergy::required", "BlueDogCandidateEnergy::headroom")), columns = (
            Column(name = "Energy account", path = "label"), Column(name = "Wh", path = "energyWh"), Column(name = "Basis", path = "basis")))
    }
    calc def Gaps :> Query {
        Project(source = Named(qualifiedName = ("BlueDogCandidateEnergy::compute", "BlueDogCandidateEnergy::navigation", "BlueDogCandidateEnergy::traffic", "BlueDogCandidateEnergy::communications", "BlueDogCandidateEnergy::housekeeping", "BlueDogCandidateEnergy::recoveryHardware")), columns = (
            Column(name = "Function", path = "function"), Column(name = "Current accounting", path = "allowance"), Column(name = "Needed to establish installed budget", path = "evidenceNeeded")))
    }
    part def Budget :> Document {
        attribute redefines title = "Retained candidate: sailing power and passage energy";
        part loads : Table { calc rows : Loads; }
        part storage : Table { calc rows : Storage; }
        part ledger : Table { calc rows : Ledger; }
    }
    part def MissingAllocations :> Document {
        attribute redefines title = "Unresolved equipment allocations";
        part gaps : Table { calc rows : Gaps; }
    }
}

package BlueDogEncounterStudyDocuments {
    private import DocumentQueries::*;
    calc def Ranges :> Query {
        Project(source = Named(qualifiedName = ("BlueDogEncounterFeasibility::target1", "BlueDogEncounterFeasibility::target2", "BlueDogEncounterFeasibility::target3", "BlueDogEncounterFeasibility::target4", "BlueDogEncounterFeasibility::target5", "BlueDogEncounterFeasibility::target6")), columns = (
            Column(name = "Target", path = "target"), Column(name = "15 s maneuver: required m", path = "baselineM"), Column(name = "30 s maneuver: required m", path = "slowerM")))
    }
    calc def Stacks :> Query {
        Project(source = Named(qualifiedName = ("BlueDogEncounterFeasibility::stack1", "BlueDogEncounterFeasibility::stack2", "BlueDogEncounterFeasibility::stack3", "BlueDogEncounterFeasibility::stack4")), columns = (
            Column(name = "Hypothesis", path = "label"), Column(name = "Craft m", path = "craftM"), Column(name = "Low target m", path = "lowM"), Column(name = "Weeds m", path = "weedM"), Column(name = "Extra bus W", path = "additionalW"), Column(name = "Remaining Wh", path = "headroomWh")))
    }
    part def Detection :> Document {
        attribute redefines title = "Closing distance and maneuver allowance";
        part ranges : Table { calc rows : Ranges; }
    }
    part def Energy :> Document {
        attribute redefines title = "Hypothetical sensing envelopes and fixed-candidate energy screen";
        part stacks : Table { calc rows : Stacks; }
    }
}

package BlueDogClassDetectionDocuments {
    doc /* Historical nine-row sensitivity; current policy also includes three wind-sport classes without inherited numerical allocations.*/
    private import DocumentQueries::*;
    calc def Rows :> Query { Project(source=Named(qualifiedName=("BlueDogClassDetection::classRow1","BlueDogClassDetection::classRow2","BlueDogClassDetection::classRow3","BlueDogClassDetection::classRow4","BlueDogClassDetection::classRow5","BlueDogClassDetection::classRow6","BlueDogClassDetection::classRow7","BlueDogClassDetection::classRow8","BlueDogClassDetection::classRow9")),columns=(Column(name="Target",path="target"),Column(name="Illustrative target speed (m/s)",path="targetSpeedMps"),Column(name="Illustrative head-on distance (m)",path="illustrativeDistanceM"),Column(name="Allocation accepted",path="allocationAccepted"))) }
    part def Summary :> Document { attribute redefines title="Class-specific response sensitivity: unaccepted illustrative inputs"; part cases : Table { calc rows : Rows; } }
}

package BlueDogLocationTrafficDocuments {
    private import DocumentQueries::*;
    calc def Sectors :> Query { Project(source=Named(qualifiedName=("BlueDogLocationTraffic::bingen","BlueDogLocationTraffic::bridge","BlueDogLocationTraffic::hoodRiver","BlueDogLocationTraffic::hatchery","BlueDogLocationTraffic::viento","BlueDogLocationTraffic::homeValley","BlueDogLocationTraffic::stevenson","BlueDogLocationTraffic::connecting")),columns=(Column(name="Location",path="location"),Column(name="Conflict to assess",path="hazards"),Column(name="Next investigation",path="nextInvestigation"))) }
    part def Locations :> Document { attribute redefines title="Traffic assessment sectors: survey priorities, not accepted windows"; part sectors : Table { calc rows : Sectors; } }
    calc def Hazards :> Query { Project(source=Named(qualifiedName=("BlueDogLocationTraffic::windsurfCrossing","BlueDogLocationTraffic::wingfoilTurn","BlueDogLocationTraffic::kiteSweep","BlueDogLocationTraffic::fallenRider","BlueDogLocationTraffic::groupEncounter","BlueDogLocationTraffic::windowOverrun")),columns=(Column(name="Case",path="scenario"),Column(name="Occupied extent",path="extent"),Column(name="Required challenge",path="criterion"))) }
    part def Cases :> Document { attribute redefines title="Wind-sport and traffic-window hazard cases"; part hazards : Table { calc rows : Hazards; } }
}

package BlueDogAvoidanceDocuments { private import DocumentQueries::*;
    calc def functionalRows :> FailureAnalysisViews::ReviewRows {
        in :>> reviewName = "BlueDogAvoidanceFailures::functional";
    }
    part def functional :> Document { attribute redefines title = ""; part rows : Table { calc rows : functionalRows; } }
    calc def conceptsRows :> FailureAnalysisViews::ReviewRows {
        in :>> reviewName = "BlueDogAvoidanceFailures::concepts";
    }
    part def concepts :> Document { attribute redefines title = ""; part rows : Table { calc rows : conceptsRows; } }
}

package BlueDogFailureViews { private import FailureAnalysisViews::*; private import DocumentQueries::*;
    view SystemTreeView : FaultTreeView {
        expose BlueDogAvoidanceFailures::Exposure::encounterDemand;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable;
        expose BlueDogAvoidanceFailures::Exposure::OR_recoveryUnavailable;
        expose BlueDogAvoidanceFailures::Exposure::AND_safeSeparationUnsupported;
        expose BlueDogAvoidanceFailures::Exposure::sharedPowerLoss;
        expose BlueDogAvoidanceFailures::Exposure::sharedComputeLoss;
        expose BlueDogAvoidanceFailures::Exposure::AND_safeSeparationUnsupported_0;
        expose BlueDogAvoidanceFailures::Exposure::AND_safeSeparationUnsupported_1;
        expose BlueDogAvoidanceFailures::Exposure::AND_safeSeparationUnsupported_2;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable_4;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable_5;
        expose BlueDogAvoidanceFailures::Exposure::OR_recoveryUnavailable_4;
        expose BlueDogAvoidanceFailures::Exposure::OR_recoveryUnavailable_5;
    }
    part def SystemTree :> Document { attribute redefines title = ""; part diagram : Diagram { attribute redefines direction = "BT"; attribute redefines show = "keywords"; ref redefines source = SystemTreeView; } }
    view PrimaryTreeView : FaultTreeView {
        expose BlueDogAvoidanceFailures::Exposure::OR_observationUnavailable;
        expose BlueDogAvoidanceFailures::Exposure::OR_assessmentWrong;
        expose BlueDogAvoidanceFailures::Exposure::OR_commandUnsafe;
        expose BlueDogAvoidanceFailures::Exposure::OR_maneuverUnavailable;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable_0;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable_1;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable_2;
        expose BlueDogAvoidanceFailures::Exposure::OR_primaryUnavailable_3;
    }
    part def PrimaryTree :> Document { attribute redefines title = ""; part diagram : Diagram { attribute redefines direction = "BT"; attribute redefines show = "keywords"; ref redefines source = PrimaryTreeView; } }
    view ScannerTreeView : FaultTreeView {
        expose BlueDogAvoidanceFailures::scannerJam;
        expose BlueDogAvoidanceFailures::scannerRevisit;
        expose BlueDogAvoidanceFailures::scannerCable;
        expose BlueDogAvoidanceFailures::wetOptics;
        expose BlueDogAvoidanceFailures::sharedHub;
        expose BlueDogAvoidanceFailures::OR_scannerObservationUnavailable;
        expose BlueDogAvoidanceFailures::OR_scannerObservationUnavailable_0;
        expose BlueDogAvoidanceFailures::OR_scannerObservationUnavailable_1;
        expose BlueDogAvoidanceFailures::OR_scannerObservationUnavailable_2;
        expose BlueDogAvoidanceFailures::OR_scannerObservationUnavailable_3;
        expose BlueDogAvoidanceFailures::OR_scannerObservationUnavailable_4;
    }
    part def ScannerTree :> Document { attribute redefines title = ""; part diagram : Diagram { attribute redefines direction = "BT"; attribute redefines show = "keywords"; ref redefines source = ScannerTreeView; } }
}
