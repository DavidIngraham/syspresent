package BlueDogRequirementBasis {
    private import ScalarValues::*;
    enum def Kind { ownerConstraint; functionalAcceptance; performanceAllocation; selectedStrategy; }
    metadata def Basis {
        attribute kind : Kind;
        attribute rationale : String;
    }
    metadata basis0 : Basis about BlueDogRequirements::DesktopManufacture { kind = Kind::ownerConstraint; rationale = "Explicit owner choices; retain independently of challenge-derived performance."; }
    metadata basis1 : Basis about BlueDogRequirements::Transportability { kind = Kind::ownerConstraint; rationale = "Explicit owner choices; retain independently of challenge-derived performance."; }
    metadata basis2 : Basis about BlueDogStructure::HybridConstruction { kind = Kind::ownerConstraint; rationale = "Explicit owner choices; retain independently of challenge-derived performance."; }
    metadata basis3 : Basis about BlueDogStructure::BendingStrength { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis4 : Basis about BlueDogStructure::PanelStrength { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis5 : Basis about BlueDogStructure::WetCouponStrength { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis6 : Basis about BlueDogStructure::WetCouponStiffness { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis7 : Basis about BlueDogStructure::AppendageDeflection { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis8 : Basis about BlueDogStructure::HullDeflection { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis9 : Basis about BlueDogStructure::PanelDeflection { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis10 : Basis about BlueDogStructure::LoadedFreeboard { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis11 : Basis about BlueDogStructure::ReserveBuoyancy { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis12 : Basis about BlueDogStructure::LaunchClearance { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis13 : Basis about BlueDogStructure::PrintTileEnvelope { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis14 : Basis about BlueDogRequirements::PrintedMaterialAging { kind = Kind::functionalAcceptance; rationale = "Verify the actual design against qualified evidence and applicable functional/load/site limits; provisional screening constants are not acceptance thresholds."; }
    metadata basis15 : Basis about BlueDogRequirements::SelfRighting { kind = Kind::selectedStrategy; rationale = "Selected passive-righting concept; the challenge permits qualified limp recovery instead."; }
    metadata basis16 : Basis about BlueDogRequirements::LiftMass { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis17 : Basis about BlueDogRequirements::SetupDuration { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis18 : Basis about BlueDogRequirements::PackDuration { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis19 : Basis about BlueDogRequirements::WindSampleCadence { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis20 : Basis about BlueDogRequirements::WindSpeedAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis21 : Basis about BlueDogRequirements::WindDirectionAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis22 : Basis about BlueDogRequirements::PositionAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis23 : Basis about BlueDogRequirements::HeadingAccuracy { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    metadata basis24 : Basis about BlueDogRequirements::RightingDeadline { kind = Kind::performanceAllocation; rationale = "Retained measurable performance allocation. The mission motivates the function, not this exact number; confirm the allocation through handling/control/mission evidence before design release."; }
    part materials : BlueDogDesignDecisions::Decision {
        attribute :>> disposition = "10 GPa and 50 MPa remain unverified numerical inputs. Qualification may credit only supported wet/jointed material bounds; resize for measured properties.";
        attribute :>> evidenceNeeded = "Directional production coupons, exposure, joint/process variability and conservative allowable/stiffness bounds.";
    }
    part structuralScreens : BlueDogDesignDecisions::Decision {
        attribute :>> disposition = "Keep the numerical screening policy explicit: 2/0.5/1 percent deflection, 10 kPa pressure, 100 N proof probe, 50 mm freeboard and 100 percent intact reserve are provisional study controls.";
        attribute :>> evidenceNeeded = "Mission load cases, deformed-foil/control and sealing/clearance sensitivity, attachment loads and casualty flotation. Screen passes do not close these requirements.";
    }
    part manufactureAndSites : BlueDogDesignDecisions::Decision {
        attribute :>> disposition = "250 mm print jobs and one-person handling remain owner constraints. A 230 mm tile and a 1.5 m launch depth with 0.3 m clearance are changeable analysis assumptions.";
        attribute :>> evidenceNeeded = "Sliced job envelopes including supports and actual site/depth/appendage clearance evidence.";
    }
    part aging : BlueDogDesignDecisions::Decision {
        attribute :>> disposition = "Accept aged material against the capacity credited to the design, not 80 percent of an unaged coupon. Establish mission-representative exposure; 300 MJ/m2 was an unvalidated accelerated-test dose.";
        attribute :>> evidenceNeeded = "Exposure equivalence and aged production-component load bounds; no relative-retention target substitutes for structural adequacy.";
    }
    part retainedAllocations : BlueDogDesignDecisions::Decision {
        attribute :>> disposition = "Retain safety behavior, environmental qualification profiles, sensing/control timing and accuracy, handling targets and the provisional mission-reliability objective. These are performance allocations, not material or architecture mandates.";
        attribute :>> evidenceNeeded = "Validation of the allocated numbers against handling, control sensitivity and mission/encounter analysis; they are not uniquely derived by arithmetic from the challenge.";
    }
    part recoveryStrategy : BlueDogDesignDecisions::Decision {
        attribute :>> disposition = "Treat passive self-righting as a selected vehicle strategy. The Gorge challenge also admits demonstrated autonomous limp recovery after abort.";
        attribute :>> evidenceNeeded = "Concept-specific capsize and shore-recovery demonstrations, including impaired equipment; retain current numerical recovery screens without claiming universal necessity.";
    }
    dependency materialStudy from materials to BlueDogStructuralBasis::Inputs;
    dependency materialAcceptance from materials to BlueDogStructure::wetCouponStiffness;
    dependency strengthAcceptance from materials to BlueDogStructure::wetCouponStrength;
    dependency screenPurpose from structuralScreens to BlueDogStructure::structuralIntegrity;
    dependency printerChoice from manufactureAndSites to BlueDogRequirements::desktopManufacture;
    dependency agedCapacity from aging to BlueDogRequirements::printedMaterialAging;
    dependency rightingChoice from recoveryStrategy to BlueDogRequirements::selfRighting;
}
