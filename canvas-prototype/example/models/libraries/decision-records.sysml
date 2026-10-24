package EngineeringDecisions {
    private import ScalarValues::*;

    enum def RecordState { unclassified; workingDisposition; openQuestion; }

    item def DecisionRecord {
        doc /* An identifiable engineering information record, not an executable
            decision node or a physical component. Record state describes the
            existing content; workingDisposition does not assert formal approval,
            accepted evidence, implemented behavior or a hardware downselect.
            SysML 2.0 Part 1 section 7.10 supplies item semantics; NASA SE
            Handbook 6.8 informs the record content. This is a project-defined
            schema, not a normative SysML decision-record library. */
        attribute recordState : RecordState [1];
        attribute question : String [0..1];
        attribute disposition : String [0..1];
        attribute evidenceNeeded : String [1];
        attribute owner : String [0..1];
        attribute accepted : Boolean [0..1];
    }

    metadata def AllocationReview {
        doc /* Review information annotating the requirement or procedure whose
            provisional choice needs justification. This annotation does not
            select a value or constitute an acceptance decision. */
        attribute source : String;
        attribute applicability : String;
        attribute valueJustification : String;
        attribute marginBasis : String;
        attribute evidenceNeeded : String;
        attribute owner : String;
        attribute closureAction : String;
        attribute accepted : Boolean;
    }
}
