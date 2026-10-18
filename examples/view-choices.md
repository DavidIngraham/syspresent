# Example view choices

Each stop chooses a representation for its question. A small node count does not by itself make a diagram useful. Requirements are read in tables; relationships, behavior and shared causes retain their appropriate native notation. Per-stop compartment visibility is presentation data, not a model claim.

The requirement tables use native `DocumentQueries::Project` queries with ID, Requirement and Statement columns. The pinned native `GridView`/`asElementTable` rendering has fixed structural columns and does not include requirement text. These are therefore native query tables, not a claim of a new standard requirement-view definition. Query row identity is retained for exploration. Blue Dog selects requirement definitions because its usages carry neither the identifier nor the documentation; its definitions carry S-001 and S-101.

| Example / section | Default | Reason |
| --- | --- | --- |
| Flashlight: mass and on/off requirements | Requirement table | Read the full obligations and identifiers before tracing them. Two isolated boxes add no relationship information. |
| Flashlight: battery, lamp and switch assembly | Structure diagram | Ownership and usage-to-definition typing are the point; retain the seven scoped part/definition nodes. |
| Flashlight: battery and assembled mass inputs | Native query table | Show evaluated bound quantities with their native units, without implying the assembly mass was calculated from its components. |
| Flashlight: coverage and mass check | Relationship matrix | Compare satisfaction and verification directions together; a link is not a passing verdict. |
| Flashlight: turning on | Action diagram | Preserve the fork, concurrent branches and join; a table would lose the ordering question. |
| Flashlight: off and on | State diagram | Show possible transitions between the two operating states. |
| Flashlight: measurements still needed | Prose closing | No new model drawing is needed to state the missing evidence. |
| Desk fan: startup permission and preparation | Action diagram | Branch guards, fork and join must remain visible. Retain the authored placements that separate the refused branch. |
| Desk fan: idle, accelerating and steady | State diagram | Composite-state containment is the question; keep inner and outer initial markers. |
| Desk fan: startup messages | Sequence diagram | Event order, participants and self-message carry the meaning. |
| Desk fan: requirements and responsibilities | Relationship matrix | Compare derivation, satisfaction, verification and allocation without confusing their direction. |
| Desk fan: checking the diagrams | Prose closing | Summarize the inspection task without duplicating a diagram. |
| Blue Dog: traffic obligations | Requirement table | Read S-001 and S-101 in full; select native rows for definitions and the adjacent semantic links for usages and their traces. |
| Blue Dog: sailing, avoidance and recovery | Action diagram | The supervisor's branches and abort behavior are the subject. |
| Blue Dog: shared power and computing failures | Fault tree | Repeated/shared causes and gate connections must remain explicit. |
| Blue Dog: sensing, decisions and maneuver failures | Scoped primary-response fault tree | Decompose one credited path without repeating the whole system tree. |
| Blue Dog: open investigations | Native action query table | Read proposed work by review row. Remove the second, identical prepared action table. |
| Blue Dog: evidence and status | Native disposition query table | A separate stop gives evidence and unresolved dispositions their own readable view and semantic selection. Remove the duplicate prepared rendition. |
| Blue Dog: capsize and qualification | Action diagram | Conditional righting versus loss of qualification is a branching decision, not a list of attributes. |
| Blue Dog: passage duration | Prepared plot with provenance | A quantitative sensitivity is best read as a plot; a graph adds no evidence. |
| Blue Dog: needed tests | Prose closing | State what remains open without implying more evidence from another picture. |

Behavioral labels, guards, state boundaries and fault-gate meaning must not be suppressed as optional structural compartments. The pinned native renderer does not supply attribute compartments for structural nodes. Enabling compartment visibility there would do nothing. The flashlight therefore uses a separate native mass-input query table; no story claims that unsupported compartments are visible. Per-stop compartment visibility remains available for native views that actually supply relevant content; tables have no compartment setting. The desk-fan views remain unchanged after this audit because their native notations directly address the stated questions.

## Native checks

The pinned native CLI returned exactly two rows for each new requirement query. Flashlight returned FL-01/portable and FL-02/controllable with their full statements. Blue Dog returned S-001/TrafficSafety and S-101/TrafficTracking with their full statements. The native flashlight structure rendering retained its seven part/definition nodes and six ownership/typing relationships. The native mass-input query returned Flashlight::Battery = 0.08 [kg] and Flashlight::light = 0.22 [kg], retaining native units. Browser inspection established that structural nodes contain no native detail/text payload, so no expanded attribute-compartment claim remains.
