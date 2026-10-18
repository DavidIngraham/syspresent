package BlueDogStructure {
    private import ScalarValues::*;
    private import RequirementDerivation::*;
    doc /* Owner-selected FDM plus wet-layup construction. Acceptance uses qualified material evidence and validated load/functional envelopes.
     * Provisional numerical screening values live in BlueDogStructuralBasis. */
    requirement def <'T-001'> HybridConstruction {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The primary shell structure shall use an FDM substrate with wet-layup glass/epoxy reinforcement. */
        comment conditions /* Owner-selected construction architecture. PETG is the initial candidate, not a qualified material. */
        metadata rationale : ModelingMetadata::Rationale { text = "Owner-selected construction architecture. PETG is the initial candidate, not a qualified material."; }
    }
    requirement hybridConstruction : HybridConstruction;
    dependency basisHybridConstruction from hybridConstruction to BlueDog::DesignIntent { metadata rationale : ModelingMetadata::Rationale { text = "Selected design allocation; the numerical value is not logically implied by the parent requirement."; } }
    requirement def <'T-100'> StructuralIntegrity {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The primary structure shall carry its declared limit loads throughout the specified wet exposure. */
        comment conditions /* Apply T-101 through T-109 independently. Current screening allocations do not cover impact, fatigue, buckling or qualified adhesive strength. */
    }
    requirement structuralIntegrity : StructuralIntegrity;
    dependency structuralBasis from structuralIntegrity to BlueDogRequirements::wetMechanicalIntegrity;
    requirement def <'T-101'> BendingStrength {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each primary structural member shall retain nonnegative bending-strength margin under the applicable limit-load cases. */
        comment conditions /* Assess each member and load direction using qualified wet/jointed allowables. Grounding, ballast inertia and operational loads are distinct cases. The sizing model currently credits glass only; that is an analysis choice. */
        attribute stressPa : Real;
        attribute qualifiedAllowablePa : Real;
        attribute evidenceAccepted : Boolean;
        require constraint acceptance { evidenceAccepted and qualifiedAllowablePa > 0 and RealFunctions::abs(stressPa) <= qualifiedAllowablePa }
    }
    requirement bendingStrength : BendingStrength;
    #derivation connection deriveBendingStrength { end #original source ::> structuralIntegrity; end #derive target ::> bendingStrength; }
    requirement def <'T-102'> AppendageDeflection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each wing, keel and rudder shall remain within its validated functional deformation limit under the applicable load cases. */
        comment conditions /* Validate the limit against affected functions: foil/control performance, alignment, clearances and sealing as applicable. The preliminary sizing fraction is a screening assumption, not an accepted limit. Assess each member and direction separately. */
        attribute fraction : Real;
        attribute validatedMaximumFraction : Real;
        attribute limitEvidenceAccepted : Boolean;
        require constraint acceptance { limitEvidenceAccepted and validatedMaximumFraction > 0 and fraction >= 0 and fraction <= validatedMaximumFraction }
    }
    requirement appendageDeflection : AppendageDeflection;
    #derivation connection deriveAppendageDeflection { end #original source ::> structuralIntegrity; end #derive target ::> appendageDeflection; }
    requirement def <'T-103'> HullDeflection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The hull shall remain within its validated functional deformation limit under the applicable load cases. */
        comment conditions /* Validate the limit against affected functions: foil/control performance, alignment, clearances and sealing as applicable. The preliminary sizing fraction is a screening assumption, not an accepted limit. Assess each member and direction separately. */
        attribute fraction : Real;
        attribute validatedMaximumFraction : Real;
        attribute limitEvidenceAccepted : Boolean;
        require constraint acceptance { limitEvidenceAccepted and validatedMaximumFraction > 0 and fraction >= 0 and fraction <= validatedMaximumFraction }
    }
    requirement hullDeflection : HullDeflection;
    #derivation connection deriveHullDeflection { end #original source ::> structuralIntegrity; end #derive target ::> hullDeflection; }
    requirement def <'T-104'> PanelStrength {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each hull skin panel shall retain nonnegative bending-strength margin under the applicable differential-pressure cases. */
        comment conditions /* Determine load cases from immersion, wave/slam exposure and compartment pressures for the selected mission and geometry. The 10 kPa sizing screen is provisional, not a complete pressure envelope. */
        attribute stressPa : Real;
        attribute qualifiedAllowablePa : Real;
        attribute evidenceAccepted : Boolean;
        require constraint acceptance { evidenceAccepted and qualifiedAllowablePa > 0 and RealFunctions::abs(stressPa) <= qualifiedAllowablePa }
    }
    requirement panelStrength : PanelStrength;
    #derivation connection derivePanelStrength { end #original source ::> structuralIntegrity; end #derive target ::> panelStrength; }
    requirement def <'T-105'> PanelDeflection {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each hull skin panel shall remain within its validated functional deformation limit under the applicable load cases. */
        comment conditions /* Validate the limit against affected functions: foil/control performance, alignment, clearances and sealing as applicable. The preliminary sizing fraction is a screening assumption, not an accepted limit. Assess each member and direction separately. */
        attribute fraction : Real;
        attribute validatedMaximumFraction : Real;
        attribute limitEvidenceAccepted : Boolean;
        require constraint acceptance { limitEvidenceAccepted and validatedMaximumFraction > 0 and fraction >= 0 and fraction <= validatedMaximumFraction }
    }
    requirement panelDeflection : PanelDeflection;
    #derivation connection derivePanelDeflection { end #original source ::> structuralIntegrity; end #derive target ::> panelDeflection; }
    requirement def <'T-106'> RootProofLoad {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each appendage root attachment shall retain its load path under its applicable limit-load proof cases. */
        comment conditions /* Cover operational, handling, grounding and ballast-inertia loads applicable to the selected design. The initial 100 N tip-load and two-times-weight probes are screening cases, not universal requirements. Beam stress alone does not qualify joints or attachments. */
    }
    requirement rootProofLoad : RootProofLoad;
    #derivation connection deriveRootProofLoad { end #original source ::> structuralIntegrity; end #derive target ::> rootProofLoad; }
    requirement def <'T-107'> WetCouponStrength {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Strength allowables credited in structural qualification shall not exceed the qualified wet-conditioned production-laminate bounds. */
        comment conditions /* Establish directional bounds for the selected layup, print, joints and cure process, including exposure and statistical/design reductions. Lower measured strength requires re-analysis or resizing, not rejection against the provisional 50 MPa input. */
        attribute creditedAllowablePa : Real;
        attribute qualifiedAllowablePa : Real;
        attribute evidenceAccepted : Boolean;
        require constraint acceptance { evidenceAccepted and qualifiedAllowablePa > 0 and creditedAllowablePa > 0 and creditedAllowablePa <= qualifiedAllowablePa }
    }
    requirement wetCouponStrength : WetCouponStrength;
    #derivation connection deriveWetCouponStrength { end #original source ::> structuralIntegrity; end #derive target ::> wetCouponStrength; }
    requirement def <'T-108'> WetCouponStiffness {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Stiffness credited in structural qualification shall not exceed the qualified wet-conditioned production-laminate bounds. */
        comment conditions /* Establish directional effective stiffness for the modeled layup, joints and exposure. A lower measured modulus can be accommodated by geometry or reinforcement changes; 10 GPa is an unverified analysis input, not a material acceptance floor. */
        attribute creditedModulusPa : Real;
        attribute qualifiedModulusPa : Real;
        attribute evidenceAccepted : Boolean;
        require constraint acceptance { evidenceAccepted and qualifiedModulusPa > 0 and creditedModulusPa > 0 and creditedModulusPa <= qualifiedModulusPa }
    }
    requirement wetCouponStiffness : WetCouponStiffness;
    #derivation connection deriveWetCouponStiffness { end #original source ::> structuralIntegrity; end #derive target ::> wetCouponStiffness; }
    requirement def <'T-109'> BondProof {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each representative glass-to-print joint shall retain its load path under its calculated limit-load proof test after N-044 exposure. */
        comment conditions /* No qualified adhesion value is available; bond acceptance remains evidence-gated even when beam margins pass. */
        metadata rationale : ModelingMetadata::Rationale { text = "No qualified adhesion value is available; bond acceptance remains evidence-gated even when beam margins pass."; }
    }
    requirement bondProof : BondProof;
    #derivation connection deriveBondProof { end #original source ::> structuralIntegrity; end #derive target ::> bondProof; }
    requirement def <'T-110'> LoadedFreeboard {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Downflooding openings shall retain positive clearance above the local water surface throughout the applicable intact operating cases. */
        comment conditions /* Evaluate actual openings, loading, heel, pitch and wave motion. A sealed deck edge may immerse without downflooding; the 50 mm deck-edge screen is not proof of this requirement. */
        attribute minimumOpeningClearanceM : Real;
        attribute caseCoverageAccepted : Boolean;
        require constraint acceptance { caseCoverageAccepted and minimumOpeningClearanceM > 0 }
    }
    requirement loadedFreeboard : LoadedFreeboard;
    dependency basisLoadedFreeboard from loadedFreeboard to BlueDogRequirements::stabilityAndFouling { metadata rationale : ModelingMetadata::Rationale { text = "Selected design allocation; the numerical value is not logically implied by the parent requirement."; } }
    requirement def <'T-111'> ReserveBuoyancy {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The vessel shall retain sufficient buoyancy to support its loaded weight throughout the applicable casualty-flotation cases. */
        comment conditions /* Use the declared flooding, capsize, ingress and recovery exposure cases; account for retained water and lost buoyant volume. Do not credit unsealed infill. The intact 100-percent reserve screen is not a casualty-flotation demonstration. */
        attribute availableBuoyancyN : Real;
        attribute loadedWeightN : Real;
        attribute caseCoverageAccepted : Boolean;
        require constraint acceptance { caseCoverageAccepted and loadedWeightN > 0 and availableBuoyancyN >= loadedWeightN }
    }
    requirement reserveBuoyancy : ReserveBuoyancy;
    dependency flotationPurpose from reserveBuoyancy to GorgeChallenge::casualtyFlotation;
    dependency basisReserveBuoyancy from reserveBuoyancy to BlueDogRequirements::stabilityAndFouling { metadata rationale : ModelingMetadata::Rationale { text = "Selected design allocation; the numerical value is not logically implied by the parent requirement."; } }
    requirement def <'T-112'> LaunchClearance {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* The loaded vessel shall retain the site-qualified bottom clearance throughout the selected launch and retrieval paths. */
        comment conditions /* Use surveyed depth, stage/current uncertainty, vessel motion and actual appendage configuration. The 1.5 m depth and 0.3 m clearance used in preliminary sizing do not qualify a site or impose a universal draft limit. */
        attribute availableDepthM : Real;
        attribute immersedDepthM : Real;
        attribute requiredClearanceM : Real;
        attribute siteEvidenceAccepted : Boolean;
        require constraint acceptance { siteEvidenceAccepted and immersedDepthM > 0 and requiredClearanceM > 0 and availableDepthM - immersedDepthM >= requiredClearanceM }
    }
    requirement launchClearance : LaunchClearance;
    dependency basisLaunchClearance from launchClearance to BlueDogRequirements::soloLaunch { metadata rationale : ModelingMetadata::Rationale { text = "Selected design allocation; the numerical value is not logically implied by the parent requirement."; } }
    requirement def <'T-113'> PrintTileEnvelope {
        metadata workStatus : ModelingMetadata::StatusInfo { status = ModelingMetadata::StatusKind::open; }
        doc /* Each structural tile shall fit the 250 mm cubic print-job envelope in its selected build configuration. */
        comment conditions /* Include supports, brim, raft and printer clearance in the job extents. The 230 mm tile is a seam/mass-study assumption; larger tiles are permitted when the complete job satisfies P-002. */
        attribute jobXM : Real;
        attribute jobYM : Real;
        attribute jobZM : Real;
        attribute slicerEvidenceAccepted : Boolean;
        require constraint acceptance { slicerEvidenceAccepted and jobXM > 0 and jobYM > 0 and jobZM > 0 and jobXM <= 0.25 and jobYM <= 0.25 and jobZM <= 0.25 }
    }
    requirement printTileEnvelope : PrintTileEnvelope;
    dependency basisPrintTileEnvelope from printTileEnvelope to BlueDogRequirements::desktopManufacture { metadata rationale : ModelingMetadata::Rationale { text = "Selected design allocation; the numerical value is not logically implied by the parent requirement."; } }
    // Compatibility projection for numerical adapters; authority is the analysis basis.
    analysis def MaterialInputs :> BlueDogStructuralBasis::Inputs;
    analysis material : MaterialInputs;




    dependency materialSource from MaterialInputs to hybridConstruction;
    satisfy hybridConstruction by BlueDog::Architecture::missionContext.boat.hullAndRig.printedHull;
    satisfy bendingStrength by BlueDog::Architecture::missionContext.boat.hullAndRig;
    satisfy appendageDeflection by BlueDog::Architecture::missionContext.boat.hullAndRig;
    satisfy loadedFreeboard by BlueDog::Architecture::missionContext.boat.hullAndRig.printedHull;
    satisfy reserveBuoyancy by BlueDog::Architecture::missionContext.boat.hullAndRig.printedHull;
    satisfy launchClearance by BlueDog::Architecture::missionContext.boat.hullAndRig;
    satisfy printTileEnvelope by BlueDog::Architecture::missionContext.boat.hullAndRig.printedHull;
}
