package RecoveryPropulsionTrade {
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    doc /* Preliminary axial actuator-disk analysis. Example inputs are illustrative,
     * not measured Blue Dog hardware. Negative axial inflow, crosswind, ventilation,
     * cavitation, weed drag and propeller/hull interactions are outside this model.
     */

    part comparisonBasis {
        doc /* The judgments below are engineering hypotheses to verify on the installed boat. No numerical score or weighting is assigned without measured performance and an agreed priority.

| Criterion / requirement | Submerged water propeller | Above-water air propeller | Evidence needed |
| --- | --- | --- | --- |
| Thrust versus energy, R-001/R-002 | Dense working fluid favors compact low-speed thrust; actual losses depend on diameter, pitch, immersion and installation | Lower density drives greater disk area or induced velocity for comparable static thrust; battery demand may dominate | Hull tow test, installed thrust/power curves and recovery run |
| Milfoil, N-053–N-056 | Blades, shaft and guard can wrap or collect stems; a duct/guard is not automatically weed-proof | Rotor avoids submerged stems while upright, but hull/keel/rudder can still anchor the boat in vegetation | Same patch and snag tests, including restart after blockage |
| Sailing drag and packaging | Submerged installation adds drag; folding/retracting concepts introduce moving parts and new failure modes | Adds windage, deck volume, possible sail interference and elevated mass | Coast/tow drag, wind-load and sail-clearance measurements |
| Capsize and waves, N-051/N-052 | Can ventilate or leave water while heeled; immersed motor/shaft sealing is central | Rotor can strike water, guard or rig during heel/capsize; restart while wet must be qualified | Heel clearances, disabled-rotor immersion, self-righting and post-capsize restart |
| Steering and reverse | Rudder-in-slipstream or steerable pod possible; reverse depends on selected propeller/drive | Air rudder, vectored thrust or differential thrust may be needed at low boat speed; ordinary air propellers are not assumed efficient in reverse | Low-speed turning, stopping and control-loss tests |
| Guarding and handling, S-003 | Contact hazard at launch/recovery; guards can collect weeds and add drag | Accessible high-speed rotor needs physical separation/guarding; larger guard increases windage and mass | Isolation timing, access assessment, guard deflection/clearance under loads |
| Corrosion and maintenance, N-042/P-003 | Continuous immersion, seals/bearings and dissimilar metals need attention | Less continuous immersion but still salt spray, condensation and capsize exposure | Exposure campaign and timed replacement |
| Wind sensitivity | Hull wind load still affects recovery; underwater inflow follows boat/current | Propeller inflow also changes directly with apparent wind and yaw | Installed testing across recovery wind headings |
| Cost and manufacturability | Waterproof drive hardware may add complexity; custom printed rotating blades are not assumed qualified | Hobby components may simplify prototyping, but marine protection and guards remain additional work | Actual BOM, mass, print jobs and supplier operating limits | */
        metadata rationale : ModelingMetadata::Rationale { text = "Retain water propulsion as the compact energy-focused reference and air propulsion as the submerged-rotor-fouling alternative. These are engineering hypotheses; installed evidence determines the choice."; }
    }
    dependency comparisonCriteria from comparisonBasis to RecoverySizing;
    part def Candidate :> BlueDog::Architecture::RecoveryPropulsion {
        attribute diskDiameter : LengthValue;
        attribute density : MassDensityValue;
        attribute axialInflow : SpeedValue;
        attribute requiredThrust : ForceValue;
        attribute overallEfficiency : Real;
        attribute essentialPower : PowerValue;
        attribute availableReserve : EnergyValue;
        attribute poweredDuration : TimeValue;
        attribute essentialDuration : TimeValue;
        attribute uncertaintyFactor : Real;
        attribute weedEvidenceAccepted : Boolean;
        attribute capsizeEvidenceAccepted : Boolean;
        attribute isolationEvidenceAccepted : Boolean;
        attribute thrustEvidenceAccepted : Boolean;
    }

    analysis def RecoverySizing {
        subject candidate : Candidate;
        objective sizingObjective {
            doc /* Assess whether the estimated R-002 recovery reserve fits the supplied battery reserve. This energy-only objective does not establish physical qualification or select an architecture. */
            require constraint { energyFits }
        }
        attribute thrustN : Real = candidate.requiredThrust / (1 [N]);
        attribute diameterM : Real = candidate.diskDiameter / (1 [m]);
        attribute rho : Real = candidate.density / (1 [kg/m^3]);
        attribute speed : Real = candidate.axialInflow / (1 [m/s]);
        assert constraint validInputs {
            candidate.diskDiameter > 0 [m] and candidate.density > 0 [kg/m^3] and
            candidate.axialInflow >= 0 [m/s] and candidate.requiredThrust >= 0 [N] and
            candidate.overallEfficiency > 0 and candidate.overallEfficiency <= 1 and
            candidate.essentialPower > 0 [W] and candidate.availableReserve >= 0 [J] and
            candidate.poweredDuration > 0 [s] and candidate.essentialDuration >= candidate.poweredDuration and candidate.uncertaintyFactor >= 1
        }
        out attribute idealPower : PowerValue = MarinePropulsion::IdealAxialDiskPower(thrustN, diameterM, rho, speed) * 1 [W];
        out attribute electricalPower : PowerValue = idealPower / candidate.overallEfficiency;
        return requiredReserve : EnergyValue = BlueDogRequirements::RecoveryReserveDemand(electricalPower, candidate.essentialPower, candidate.poweredDuration, candidate.essentialDuration, candidate.uncertaintyFactor);
        out attribute reserveMargin : EnergyValue = candidate.availableReserve - requiredReserve;
        out attribute energyFits : Boolean = reserveMargin >= 0 [J];
        out attribute qualificationEvidenceComplete : Boolean = candidate.weedEvidenceAccepted and candidate.capsizeEvidenceAccepted and candidate.isolationEvidenceAccepted and candidate.thrustEvidenceAccepted;
        out attribute modeledGatesMet : Boolean = energyFits and qualificationEvidenceComplete;
    }

    part waterExample : Candidate {
        doc /* Synthetic upstream example: 0.5 m/s ground speed against 1.5 m/s current. 5 N thrust is an assumed combined resistance, not a tow-test result. */
        attribute :>> diskDiameter default = 0.25 [m];
        attribute :>> density default = 1000 [kg/m^3];
        attribute :>> axialInflow default = 2 [m/s];
        attribute :>> requiredThrust default = 5 [N];
        attribute :>> overallEfficiency default = 0.5;
        attribute :>> essentialPower default = 10 [W];
        attribute :>> availableReserve default = 360000 [J];
        comment syntheticExposure /* Example route durations only; not a challenge allocation. */
        attribute :>> poweredDuration default = 1800 [s];
        attribute :>> essentialDuration default = 7200 [s];
        attribute :>> uncertaintyFactor default = 1.2;
        attribute :>> weedEvidenceAccepted default = false;
        attribute :>> capsizeEvidenceAccepted default = false;
        attribute :>> isolationEvidenceAccepted default = false;
        attribute :>> thrustEvidenceAccepted default = false;
    }
    part airExample : Candidate {
        doc /* Same assumed thrust and ground speed, with 5 m/s headwind: axial air inflow 5.5 m/s. Candidate drag and efficiency need independent measurements. */
        attribute :>> diskDiameter default = 0.25 [m];
        attribute :>> density default = 1.225 [kg/m^3];
        attribute :>> axialInflow default = 5.5 [m/s];
        attribute :>> requiredThrust default = 5 [N];
        attribute :>> overallEfficiency default = 0.5;
        attribute :>> essentialPower default = 10 [W];
        attribute :>> availableReserve default = 360000 [J];
        comment syntheticExposure /* Example route durations only; not a challenge allocation. */
        attribute :>> poweredDuration default = 1800 [s];
        attribute :>> essentialDuration default = 7200 [s];
        attribute :>> uncertaintyFactor default = 1.2;
        attribute :>> weedEvidenceAccepted default = false;
        attribute :>> capsizeEvidenceAccepted default = false;
        attribute :>> isolationEvidenceAccepted default = false;
        attribute :>> thrustEvidenceAccepted default = false;
    }
    dependency reserveCriterion from RecoverySizing to BlueDogRequirements::recoveryEnergy;
    dependency recoveryScenario from RecoverySizing to BlueDogRequirements::recoveryPropulsion;
    dependency weedGate from RecoverySizing to BlueDogRequirements::recoveryPropulsorWeeds;
    dependency capsizeGate from RecoverySizing to BlueDogRequirements::selfRighting;
    dependency controlRecoveryGate from RecoverySizing to BlueDogRequirements::capsizeControlRecovery;
    dependency isolationGate from RecoverySizing to BlueDogRequirements::motorIsolationDeadline;
    dependency isolationLatchGate from RecoverySizing to BlueDogRequirements::isolationRestartInhibition;
}
