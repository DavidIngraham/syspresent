package BlueDogInterfaceContracts {
    private import ScalarValues::*;
    private import ISQ::*;
    private import SI::*;
    doc /* Candidate logical data contracts. Source basis: NASA SE Handbook
     * 6.3.1.2.2-3; historical NASA SWE-112 section 3 (DI-IPSC-81436A-based
     * guidance); OMG SysML 2.0 sections 7.12-7.16. These definitions do not
     * select transport, serialize messages or implement runtime acceptance. */

    item def ObservationContext {
        attribute sourceIdentity : String;
        attribute configurationIdentity : String;
        attribute clockIdentity : String;
        attribute sourceEpoch : String;
        attribute sequence : Integer;
        doc /* Identity and sequence are semantic provenance, not authentication.
         * Epoch changes on producer restart; ordering is meaningful only within
         * the identified source/epoch. Clock identity requires an established
         * epoch, synchronization and uncertainty contract before comparing times. */
    }
    item def CommandContext {
        attribute authorityIdentity : String;
        attribute configurationIdentity : String;
        attribute clockIdentity : String;
        attribute authorityEpoch : String;
        attribute sequence : Integer;
        attribute issuedAt : TimeValue;
        attribute validUntil : TimeValue;
        doc /* Times use one identified monotonic reference. Consumers must use
         * an agreed authority epoch and ordering rule. Expiry cannot grant
         * permission or clear an abort. Arbitration, restart and inhibit design
         * remain unresolved; these fields do not establish an independent path. */
    }
    calc def ObservationUsable {
        doc /* Parameterized consumer precondition, not a selected freshness
         * policy. All comparisons require one established clock and applicable
         * configuration/frame. Producer validity alone is insufficient. A
         * negative observation may be valid. Bounds here are inclusive; a
         * consumer's allocated criterion must justify its maximumAge. */
        in producerValid : Boolean;
        in contextApplicable : Boolean;
        in clockEstablished : Boolean;
        in observedAt : TimeValue;
        in now : TimeValue;
        in maximumAge : TimeValue;
        return usable : Boolean = producerValid and contextApplicable and clockEstablished
            and maximumAge >= 0 [s] and observedAt <= now and now - observedAt <= maximumAge;
    }
    calc def CommandApplicable {
        doc /* Parameterized applicability only. Does not grant authority or
         * defeat the consumer's current permission/inhibit. Replay protection,
         * arbitration and clock establishment require separate implementation. */
        in authorityAccepted : Boolean;
        in contextApplicable : Boolean;
        in clockEstablished : Boolean;
        in orderingAccepted : Boolean;
        in issuedAt : TimeValue;
        in validUntil : TimeValue;
        in now : TimeValue;
        return applicable : Boolean = authorityAccepted and contextApplicable and clockEstablished
            and orderingAccepted and issuedAt <= now and now <= validUntil and issuedAt <= validUntil;
    }
    metadata issue : ModelingMetadata::Issue {
        text = "IF-01: Select per-consumer freshness/latency limits from safety and control analysis; cadence does not establish age. IF-02: Establish clock epoch, synchronization uncertainty, producer/authority restart and replay rules. IF-03: Resolve navigation datum, heading/bearing/trim references and required transformations. IF-04: Resolve primary/recovery arbitration, safe inhibits and command expiry. IF-05: Specify physical voltage/current/protection, connector and sealing contracts, storage/telemetry supply and encoding/protocol details. Schema and predicate checks do not close these implementation and physical-evidence gaps.";
    }
}
