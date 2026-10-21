# Model organization

The model owns requirements, assumptions, rationale and analysis contracts. [Documentation](../docs/index.md) explains methods and presents native views of these definitions.

[AGENTS.md](../AGENTS.md) governs how agents work. This README defines modeling conventions and locates authoritative definitions; it does not impose additional mission rules or select designs. Read the linked SysML definitions before changing engineering behavior or applicability. Resolve conflicting definitions explicitly, with rationale, rather than treating a prose summary as a new source of policy.

| Scope | Responsibility |
| --- | --- |
| `missions/` | Independent Trans-Gorge challenge |
| `vehicle/` | Blue Dog requirements, architecture, use cases, allocations, verification plans and decisions |
| `libraries/` | Reusable marine, energy and structural calculations without Blue Dog dependencies |
| `analyses/` | Project analysis cases and bindings to library calculations |
| `configurations/` | Named reference designs, assumptions and illustrative inputs |
| `evidence/` | Model projection of recorded evidence with explicit acceptance status |

## Conventions

Keep requirement documentation to one concise obligation. Put normative qualification context in named `comment conditions` and explanation in `comment notes`. Use standard `ModelingMetadata::Rationale`, `Issue` and `StatusInfo` metadata for justification, unresolved decisions and maturity; maturity is not a verification verdict.

Use `#derivation` only for justified obligations under the original requirement's conditions. The OMG Requirement Derivation library states **original satisfaction implies every derived requirement**; satisfying the children alone does not prove their parent. A new numerical allocation is not logically entailed by a qualitative mission need. Record its provisional basis and validation need. Owner constraints need not be derived from mission success.

Use `verify` for verification objectives and `satisfy` for design satisfaction assertions about an identified subject. A satisfaction assertion is an engineering claim to establish, not an allocation or an accepted verdict. Use `allocate` to map logical responsibilities to candidate physical elements. Planned procedures and unaccepted evidence must remain inconclusive. Executable predicates reuse model calculations; numerical search is orchestrated by SciPy. External geometry and aerodynamic data retain provenance.

Reusable library interfaces expose named design properties. Numerical adapters currently use documented SI scalar conventions and vector conversion calculations; this is not full dimensional type checking.

View definitions belong in the [authored Markdown](../docs/reference/authoring.md). Native document queries supporting publication live under `tools/publishing/`. Generated diagrams and pages are build outputs, not hand-maintained copies of the model.

### OOSEM

Use native OOSEM roles and views for context, logical responsibilities, physical elements and scenarios. `vehicle/method.sysml` records package roles, scenario-to-use-case refinements and allocations. Keep logical sequences distinct from executable controllers and physical test evidence. Requirement package classification does not require inventing direct parent derivations for every requirement. The running OOSEM maturity assessment distinguishes model coverage from supporting virtual and physical evidence.

### Engineering layers and ownership

| Layer | Authoritative model | Meaning |
| --- | --- | --- |
| Mission and external context | `missions/`, `BlueDog::Architecture::MissionContext` | Challenge rules, external actors and current/future applicability |
| System obligations and design basis | `vehicle/requirements.sysml`, `requirement-basis.sysml`, `decisions.sysml` | Obligations, owner constraints, provisional allocations and selected strategies remain distinct |
| Operational interactions | `BlueDogUseCases`, `BlueDogMethod::Scenarios` | Actor objectives and typed observations, commands, permissions and records |
| Logical architecture | `BlueDogLogicalArchitecture` | Responsibilities independent of processors, products and buses |
| Candidate physical architecture | `BlueDogPhysicalArchitecture` | Proposed realization and interfaces; separate parts do not prove fault independence |
| Executable policy | `BlueDogMissionLogic`, `BlueDogMissionSimulation` | Explicit observations drive decisions, latches and assessment; no physical autopilot claim |
| Configuration and analysis | `BlueDogIC01`, `analyses/`, `libraries/` | Complete named candidate inputs, project bindings and reusable domain calculations |
| Evidence | `models/evidence/`, `evidence/runs/` | Configuration-specific recorded outcomes and immutable source provenance |

The original `BlueDog::Architecture` subsystem tree remains the system responsibility/context boundary. It includes useful hardware concepts; it is not the deployed assembly. The separate logical and physical packages carry the more precise interfaces and allocations. Preserve useful names rather than break historical references merely to rename a layer.

Use native ports, connections and flows for interactions. A dependency means change impact or supporting basis, not transport of an item. A refinement points from the detailed representation to the element it clarifies. A constraint states a restriction; a decision records the chosen strategy and why. Review relationship meaning and endpoint types, not relationship counts.

For an engineering change, follow the affected path from mission need and operational interaction through logical responsibility, candidate realization, configuration, analysis and verification. Use native queries to inspect relationship endpoints and applicability. Record unresolved interfaces or assumptions where they belong; a missing engineering decision cannot be repaired by adding a generic dependency. Introduce a new abstraction when it clarifies a responsibility, supports reuse or enables a concrete analysis or verification question.

### Configuration, execution and evidence

Named configurations own design values and capability assumptions. For the IC-01 candidate, [BlueDogIC01](configurations/ic01.sysml) defines `design` and `integration`; [design decisions](vehicle/decisions.sysml) record candidate and trade status. Project analyses bind a named subject and its assumptions to reusable calculations. An analysis must identify its subject, applicability and input provenance, and reject unsupported subjects rather than silently mixing configurations. Archived solutions can supply numerical initial guesses, but cannot silently supply current design values. Preserve exact recorded design values when establishing a baseline; extra decimal places do not imply measurement precision.

Maintain the distinction between descriptive scenarios, executed supervisory decisions, conditional numerical feasibility and accepted physical evidence. Required observations that are missing must not silently become confirmed capability. Qualification and recovery obligations belong in the [mission](missions/transgorge.sysml) and [vehicle requirements](vehicle/requirements.sysml); [mission logic](vehicle/mission-logic.sysml) implements supervisory policy. State transitions, persistence and reset conditions must agree with those obligations. Test both fault entry and restoration, including interacting faults and event ordering where relevant, rather than inferring policy from a successful nominal run.

Report native pass, fail, inconclusive and error outcomes without collapsing missing input into success. Not-applicable is a separate scope decision (for example, future ocean requirements during a Gorge review), not a fabricated fifth native verdict. Analysis completion with a `reserveFits=false` output means the calculation ran; it does not mean the recovery route passed.

Existing immutable evidence retains its source revision, original policy and configuration. New outputs record the actual source hashes, model hash, runtime revision and named subject; a Git commit alone is insufficient when the source tree is modified. Never rewrite historical projections to make them describe the current boat.

For each applicable governing requirement, identify a credible verification strategy and its subject, conditions and method. Coverage links identify defined objectives; execution records identify what ran; accepted evidence and verdicts require an explicit assessment of applicability and limitations. Keep these distinctions visible in reports. Scope exclusions need an explicit model basis, and unexplained missing coverage remains an open issue. See the [runtime instructions](../docs/reference/model-runtime.md) for native coverage audits and named-configuration demonstrations.

### Standards and implementation limits

The language reference is [OMG SysML 2.0, Part 1, formal/2026-03-02](https://www.omg.org/spec/SysML/2.0/Language/PDF), particularly requirements, verification and §9.6 Requirement Derivation. The official [derivation library source](https://github.com/Systems-Modeling/SysML-v2-Release/blob/master/sysml.library/Domain%20Libraries/Requirement%20Derivation/DerivationConnections.sysml) provides the implication and distinct-end constraints. OOSEM supplies the iterative engineering progression from needs through logical/allocated architecture and V&V; it is not itself a SysML metamodel. See the [INCOSE method survey, §3.2](https://www.omg.org/sysml/MBSE_Methodology_Survey_RevA.pdf) (2007 historical guidance) and the [current OOSEM working group](https://www.incose.org/group/object-oriented-se-method-working-group/).

The audit uses the accessible [INCOSE Guide to Writing Requirements v4 summary](https://www.incose.org/docs/default-source/working-groups/requirements-wg/guidetowritingrequirements/incose_rwg_gtwr_v4_summary_sheet.pdf): singular obligations, explicit conditions, appropriate abstraction and separate requirement/system verification. The [SE Handbook fifth-edition overview](https://www.incose.org/resources-publications/technical-publications/se-handbook/) establishes lifecycle coverage. The complete paid guide and handbook were not available in this run; no full-text compliance certification is claimed.

Keep OpenSysML pinned at the revision in the installer, lockfile and README. Its OOSEM and DocumentQueries packages are implementation libraries written in SysML, not OMG normative domain libraries. Native parsing and queries establish supported semantics; descriptive scenario actions do not acquire executable bodies from a diagram. Marine/structural adapters still expose some documented SI scalar vectors; these do not provide universal dimensional checking. The model uses typed quantities at architecture and energy interfaces where supported. The runtime's native missing-input errors can be opaque; preserve failure rather than infer a value.

Before relying on an MCP result, confirm the server's workspace and runtime revision match the checkout under review. Use the matching pinned CLI/client if they differ, and record the mismatch with the validation result. A successful check against a different checkout or runtime is not a regression result for this model.
