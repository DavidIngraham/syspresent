package BlueDogSailTrade {
    doc /* Control architecture and section camber are independent design axes.
     * A cambered wing could also use aerodynamic tail control. These three named
     * configurations are a starting comparison, not mutually exclusive physics. */
    private import ScalarValues::*;
    enum def Evidence { unknown; passed; failed; }
    part def Candidate {
        attribute label : String;
        attribute membraneSail : Boolean;
        attribute aerodynamicTrim : Boolean;
        attribute concept : String;
        attribute durability : String;
        attribute energy : String;
        attribute sailing : String;
        attribute recovery : String;
        attribute manufacturing : String;
        attribute nextEvidence : String;
        // Ordered: wet/survival durability, energy, polar/progress, capsize/control,
        // manufacturing compatibility, lifting, provisional voyage-reliability study.
        // The first six are declared mandatory evidence gates; the seventh is a
        // comparative study objective, not a challenge acceptance veto.
        attribute gates : Evidence [7] ordered nonunique default =
            (Evidence::unknown, Evidence::unknown, Evidence::unknown, Evidence::unknown,
             Evidence::unknown, Evidence::unknown, Evidence::unknown);
    }
    part tailWing : Candidate {
        attribute :>> label = "Tail-controlled rigid wing";
        attribute :>> membraneSail = false;
        attribute :>> aerodynamicTrim = true;
        attribute :>> concept = "Freely rotating main wing, provisionally symmetric, with a tail and actuated elevator-like trim tab. Tail/wing aerodynamic moments set incidence; no assumption of a powered whole-wing bearing.";
        attribute :>> durability = "Avoids sailcloth flogging and sheets; retains bearing, tab linkage, tail-boom, skin/joint and wave-impact failure modes. Rigid wings are not automatically storm-proof.";
        attribute :>> energy = "Low trim-energy potential from aerodynamic balance; measure bearing friction, tab hinge moment and failure-state power. No transfer of full-size Saildrone wattage to Blue Dog.";
        attribute :>> sailing = "Test both tacks and low-Reynolds-number main-wing/tail interaction. Tail authority, stall, gust response and faulted-tab loads remain open.";
        attribute :>> recovery = "Include main wing, tail, boom, tab, actuator and any counterweight as separate mass/volume bodies. Check free, jammed and failed trim states plus sealed, flooded and draining states.";
        attribute :>> manufacturing = "Compatible in principle with printed ribs and glass skins; extra bearings, waterproof actuation, alignment and tail clearance need design.";
        attribute :>> nextEvidence = "Low-speed trim bench; unpowered and jammed-tab gust tests; wet-cycle endurance; actual rig mass/CG and compartment geometry.";
        metadata rationale : ModelingMetadata::Rationale { text = "Equal development contender for the finite Gorge mission; passive trim and cloth/line wear are trade criteria, not demonstrated reliability advantages. Primary-source notes and limitations are linked through BlueDogSourceEvidence."; }
    }
    part camberedWing : Candidate {
        attribute :>> label = "Fixed-camber rotating-mast wing";
        attribute :>> membraneSail = false;
        attribute :>> aerodynamicTrim = false;
        attribute :>> concept = "Owner-defined fixed-camber CrescentWing with whole-mast rotation for trim. Square-sail/downwind mode and reaching mode; no camber reversal, flap or tail mechanism is assumed. Evaluate a non-backdrivable gearbox for unpowered position holding as an actuator option, not a selected component.";
        attribute :>> durability = "Avoids cloth flogging and camber-changing joints; retains skin, seam, mast-bearing and trim-drive fatigue and wave-impact loads. Verify holding torque and wear under shock, vibration, lubrication and temperature variation; do not assume every worm gearbox self-locks.";
        attribute :>> energy = "Non-backdrivable gearing may eliminate motor holding current, but not controller standby power or trim energy. Compare measured daily move, hold and idle energy against tail control; include starting friction, gearbox efficiency, trim frequency and gust response. A balanced pivot can reduce drive torque.";
        attribute :>> sailing = "Measure full-angle lift, drag and moment on both tacks, including drag-dominated square/downwind and lift-dominated reaching modes and transitions. Do not inherit symmetric linear-wing polars. Inspect edge geometry before assuming leading/trailing-edge interchange.";
        attribute :>> recovery = "Use actual crescent/swept geometry, dry and retained-water CG, sealed volume, trim angle and failed-drive position. A self-locking drive retains the last trim angle on power loss and cannot passively feather without a release mechanism. Assess locked-angle storm/capsize states and any clutch or emergency depower strategy. Manufacturing CAD is not qualified challenge-vessel geometry.";
        attribute :>> manufacturing = "Closest to existing CAD and useful for coupons/prototypes. Fixed section and rotating mast avoid tail/tab/boom parts; bearing, drive and waterproofing details remain to be designed.";
        attribute :>> nextEvidence = "Inspect CAD section and stations; measure both-mode, both-tack polars, trim moments and drive energy, including depower and jam states; compare against MaxiMOOP and Oshen PC13 directly driven wingsail precedent. Bench-test motor-off holding, wet-cycle wear, daily energy and failed-power depower/recovery; include gearbox mass and CG.";
        metadata rationale : ModelingMetadata::Rationale { text = "Owner confirmed fixed camber, whole-mast trim and square/downwind plus reaching modes. Miller et al., An Alternative Wing Sail Concept for Small Autonomous Sailing Craft, DOI 10.1007/978-3-319-72739-4_1, provides analogous square-sail-derived precedent, not Blue Dog qualification. Oshen PC13 provides ocean-service precedent for directly actuated DynaRig wingsails (https://www.microtransat.org/content.php?p=2026_oshen_cstar), not evidence of identical camber or a non-backdrivable gearbox. Retain alongside tail control pending comparable measurements."; }
    }
    part softSail : Candidate {
        attribute :>> label = "Triangular soft sail";
        attribute :>> membraneSail = true;
        attribute :>> aerodynamicTrim = false;
        attribute :>> concept = "Triangular woven-polyester sail on mast and boom with sheet control. Reefing/furling is a design option requiring explicit mechanism, mass and fault analysis; battens and reinforcement are not excluded.";
        attribute :>> durability = "Flogging, flutter, chafe, UV/stitching degradation and sheet wear create unattended-maintenance concerns. Durable cloth, battens and anti-chafe design can mitigate them; no lifetime failure is established.";
        attribute :>> energy = "Sheet/winch energy and holding strategy must be measured; self-locking or balanced arrangements may have low static draw. Do not assume a continuously powered servo.";
        attribute :>> sailing = "Both-tack sailing is conventional in principle; actual reefed and unreefed low-Re polars are needed. Compare mass and performance on the same finite-mission basis as both rigid wings.";
        attribute :>> recovery = "Lower membrane mass and negligible sealed cloth volume can help, but model mast/boom buoyancy, immersion drag, trapped water and sheet snagging separately.";
        attribute :>> manufacturing = "Simple sailmaking and repair, low rig-mass potential; requires sailcloth and rigging rather than printing every component. Hull FDM/glass requirement does not prohibit a soft sail.";
        attribute :>> nextEvidence = "Unattended flogging/chafe/UV exposure and sheet fault tests over declared mission hours; autonomous depower and recovery demonstration.";
        metadata rationale : ModelingMetadata::Rationale { text = "Equal development contender for the finite Gorge mission. Compare measured wear, handling, energy, mass and recovery against both rigid wings over the declared exposure; future ocean endurance does not select this rig."; }
    }
    analysis def TradeAssessment {
        subject candidate : Candidate;
        out attribute candidateName : String = candidate.label;
        out attribute gateCount : Integer = SequenceFunctions::size(candidate.gates);
        attribute mandatoryGates : Evidence [6] ordered nonunique =
            (candidate.gates#(1),candidate.gates#(2),candidate.gates#(3),candidate.gates#(4),candidate.gates#(5),candidate.gates#(6));
        out attribute knownFailure : Boolean = mandatoryGates->ControlFunctions::exists { in gate : Evidence; gate == Evidence::failed };
        out attribute evidenceComplete : Boolean = candidate.gates->ControlFunctions::forAll { in gate : Evidence; gate != Evidence::unknown };
        out attribute mandatoryEvidenceComplete : Boolean = mandatoryGates->ControlFunctions::forAll { in gate : Evidence; gate != Evidence::unknown };
        out attribute declaredMandatoryGatesMet : Boolean = gateCount == 7 and mandatoryGates->ControlFunctions::forAll { in gate : Evidence; gate == Evidence::passed };
        // Compatibility name: this is declared gate evidence, not physical qualification.
        out attribute qualified : Boolean = declaredMandatoryGatesMet;
        out attribute reliabilityStudyDisposition : String = if candidate.gates#(7) == Evidence::failed ? "Provisional study concern; assess uncertainty and evidence" else
            if candidate.gates#(7) == Evidence::passed ? "Supplied study objective met; not accepted mission reliability" else "Study evidence missing";
        out attribute requirementVerdict : String = if knownFailure ? "Failed mandatory gate" else if declaredMandatoryGatesMet ? "Passed declared mandatory gates" else "Inconclusive: mandatory evidence missing";
        // Explicit development policy, not an inferred failure probability or weighted score.
        return developmentDecision : String = if knownFailure ? "Resolve verified failure before selection" else
            if declaredMandatoryGatesMet ? "Eligible for selection review; compare adequate evidence and uncertainty; no hardware decision" else
            "Equal development contender for the finite Gorge mission";
        objective assess { require constraint { gateCount == 7 } }
    }
    analysis tailAssessment : TradeAssessment { subject :>> candidate = tailWing; }
    analysis camberAssessment : TradeAssessment { subject :>> candidate = camberedWing; }
    analysis softAssessment : TradeAssessment { subject :>> candidate = softSail; }
    dependency durabilityCriterion from TradeAssessment to BlueDogRequirements::wetMechanicalIntegrity;
    dependency stormWindCriterion from TradeAssessment to BlueDogRequirements::gorgeSurvivalWind;
    dependency progressCriterion from TradeAssessment to BlueDogRequirements::passageDuration;
    dependency progressEvidence from TradeAssessment to BlueDogRequirements::cruiseEvidence;
    dependency progressStudyComparison from TradeAssessment to BlueDogRequirements::legProgress {
        metadata rationale : ModelingMetadata::Rationale { text = "Retain the legacy progress study comparison separately; current mandatory performance uses passage duration and representative evidence."; }
    }
    dependency capsizeCriterion from TradeAssessment to BlueDogRequirements::selfRighting;
    dependency controlCriterion from TradeAssessment to BlueDogRequirements::capsizeControlRecovery;
    dependency liftCriterion from TradeAssessment to BlueDogRequirements::liftMass;
    dependency reliabilityCriterion from TradeAssessment to BlueDogRequirements::missionSuccessProbability {
        metadata rationale : ModelingMetadata::Rationale { text = "Provisional comparative study objective only; its supplied seventh evidence value does not veto otherwise met mandatory criteria or establish physical reliability."; }
    }
    dependency reliabilityEvidence from TradeAssessment to BlueDogRequirements::reliabilityEvidence;
    dependency architectureScope from Candidate to BlueDog::Architecture::HullAndRig;
    dependency failureReview from TradeAssessment to BlueDogDFMEA::starter::sailJam;

    part def RigBody {
        doc /* Input contract for the next geometry-based capsize model. Boat-fixed
         * x forward, y port, z up; all lengths m, mass kg, volume m3, time s.
         * Geometry must resolve wetted shape at each heel/pitch/trim; these scalar
         * properties alone do not establish a righting curve. */
        attribute component : String;
        attribute dryMassKg : Real;
        attribute dryCG : Real [3] ordered nonunique;
        attribute sealedVolumeM3 : Real;
        attribute sealedVolumeCentroid : Real [3] ordered nonunique;
        attribute floodableVolumeM3 : Real;
        attribute retainedWaterMassKg : Real;
        attribute retainedWaterCG : Real [3] ordered nonunique;
        attribute fillTimeS : Real;
        attribute drainTimeS : Real;
        attribute geometryReference : String;
        attribute geometryEvidenceAccepted : Boolean default false;
    }
    public import MarineHydrostatics::BuoyancyMomentSensitivity;
    analysis buoyancyIllustration {
        doc /* Ten litres fully immersed at +/-1 m horizontal lever in freshwater.
         * This is a sensitivity example, not a candidate volume or predicted GZ. */
        out attribute positiveMomentNm : Real = BuoyancyMomentSensitivity(0.01,1,1000);
        out attribute negativeMomentNm : Real = BuoyancyMomentSensitivity(0.01,-1,1000);
    }
    dependency geometryForRecovery from RigBody to BlueDogRequirements::selfRighting;
}
