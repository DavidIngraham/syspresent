package BlueDogVerificationPlanning {
    private import ScalarValues::*;
    doc /* Verification-method tags describe plans, not execution or acceptance.
     * Source basis: NASA SE Handbook 5.3.1.2 and 5.4.1.2; NASA-HDBK-1009A
     * 8.14-8.20 engineering information design; defense SE Guidebook 2026
     * 6.2.5-6.2.7. SysML 2.0 VerificationCases supplies method/verdict kinds.
     * Plans remain inconclusive. Historical records retain their own subjects. */

    calc def EvidenceEligibleForAcceptance {
        doc /* Decision-support preconditions only, never an acceptance decision.
         * Inputs are established by traceable evidence review, not inferred from
         * an artifact filename or a successful equation. False eligibility does
         * not discard a valid failed test or prevent review of incomplete data.
         * Criteria and uncertainty rules belong to the actual assessed claim. */
        in executed : Boolean [1];
        in subjectIdentified : Boolean [1];
        in configurationApplicable : Boolean [1];
        in conditionsApplicable : Boolean [1];
        in procedureControlled : Boolean [1];
        in provenanceIntact : Boolean [1];
        in measurementBasisAdequate : Boolean [1];
        in uncertaintyAdequate : Boolean [1];
        in criterionEvaluated : Boolean [1];
        in criterionHolds : Boolean [1];
        in anomaliesAccounted : Boolean [1];
        return eligible : Boolean [1] = executed and subjectIdentified and configurationApplicable
            and conditionsApplicable and procedureControlled and provenanceIntact
            and measurementBasisAdequate and uncertaintyAdequate and criterionEvaluated
            and criterionHolds and anomaliesAccounted;
    }
    part def PlannedTestConfiguration {
        ref part plannedDesign : MarineDesign::Design [1];
        ref part plannedAssembly : BlueDogPhysicalArchitecture::IC01Candidate [1];
        attribute purpose : String [1];
        attribute articleIdentity : String [0..1];
        attribute procedureIdentity : String [0..1];
        attribute instrumentConfiguration : String [0..1];
        attribute plannedOnly : Boolean = true;
        doc /* Planned candidate references are not the identity of a built article.
         * Absent article, released procedure and instruments remain unresolved;
         * no execution or evidence-acceptance status is invented. */
    }
    part interfaceBench : PlannedTestConfiguration {
        ref part :>> plannedDesign = BlueDogIC01::design;
        ref part :>> plannedAssembly = BlueDogPhysicalArchitecture::ic01;
        attribute :>> purpose = "Current Gorge command/permission, storage durability and restart integration";
    }
    part recoveryUseTrial : PlannedTestConfiguration {
        ref part :>> plannedDesign = BlueDogIC01::design;
        ref part :>> plannedAssembly = BlueDogPhysicalArchitecture::ic01;
        attribute :>> purpose = "Current Gorge recovery approach, shore retention and one-person pickup in admitted conditions";
    }
    verification def InterfaceAndDurabilityIntegrationVerification {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedInspect : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::inspect; }
        subject vessel : BlueDogPhysicalArchitecture::IC01Candidate = BlueDogPhysicalArchitecture::ic01;
        doc /* Freeze actual article/software/storage/clock configuration and procedure.
         * Independently observe command receipt, authority/expiry assessment,
         * durable disqualification acknowledgment and physical motor enable.
         * Inject stale/future/reordered/replayed commands, expired permissions,
         * missing acknowledgments, primary loss and reset between each boundary.
         * Confirm no thrust while qualification is qualifying or unknown and no
         * commanded enable before durable disqualification. Establish legitimate
         * onboard recovery authorization separately from authenticated operator
         * authorization. Measure the governed restart/response deadlines using
         * appropriate instrumentation; synthetic gate checks do not close them.
         * Retain failures, input loss and power-cut corruption, not only clean runs. */
        objective acceptance {
            verify BlueDogRequirements::motorQualificationInvariant;
            verify BlueDogRequirements::freshRecoveryCommand;
            verify BlueDogRequirements::qualificationPersistence;
            verify BlueDogRequirements::qualificationRestoration;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def HumanRecoveryUseValidation {
        metadata plannedTest : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::test; }
        metadata plannedDemo : VerificationCases::VerificationMethod { kind = VerificationCases::VerificationMethodKind::demo; }
        subject vessel : BlueDogPhysicalArchitecture::IC01Candidate = BlueDogPhysicalArchitecture::ic01;
        doc /* Combined product verification and stakeholder-use validation.
         * Use the identified actual operator, candidate installation, handling
         * aids and surveyed recovery destination. Declare conditions, access,
         * retrieval exposure, acceptance criteria and recovery arrangements before
         * the trial. Observe autonomous approach separately from shore capture,
         * retention and one-person pickup. Measure applicable handling outcomes;
         * assess whether the intended user can complete the whole recovery task.
         * Record failures, assistance, unsafe access and incomplete retrieval.
         * A simulated approach, propulsion command or cooperative fixture alone
         * cannot establish intended-use recovery or physical qualification. */
        objective acceptance { verify BlueDogRequirements::soloRetrieval; }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    dependency interfaceConfiguration from interfaceBench to InterfaceAndDurabilityIntegrationVerification;
    dependency recoveryConfiguration from recoveryUseTrial to HumanRecoveryUseValidation;
    dependency intendedRecoveryUse from HumanRecoveryUseValidation to BlueDogUseCases::recover;
    dependency interfaceScenario from InterfaceAndDurabilityIntegrationVerification to BlueDogMethod::Scenarios::AbortAndRecover;
    dependency restartContract from InterfaceAndDurabilityIntegrationVerification to BlueDogBehaviorContracts::RestoreQualification;
    metadata issue : ModelingMetadata::Issue {
        text = "V-01: Release configuration-specific procedures, article identity, instrumentation/calibration and acceptance criteria before physical assessment. V-02: Establish applicability and uncertainty for every transferred component, historical or simulation artifact. V-03: Retain independent review and acceptance dispositions; method tags and eligibility checks do not execute or accept evidence. V-04: Perform stakeholder-use validation of shore capture, retention and one-person pickup, not only autonomous approach.";
    }
}
