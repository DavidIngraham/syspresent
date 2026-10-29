# Model organization

The model owns requirements, assumptions, rationale and analysis contracts. [Documentation](../docs/index.md) explains methods and presents native views of these definitions.

[AGENTS.md](../AGENTS.md) governs how agents work. This README defines modeling conventions and locates authoritative definitions; it does not impose additional mission rules or select designs. Read the linked SysML definitions before changing engineering behavior or applicability. Resolve conflicting definitions explicitly, with rationale, rather than treating a prose summary as a new source of policy.

The project is one native `BlueDog` package in [blue-dog.sysml](blue-dog.sysml).
Its packages express engineering ownership; file names and publication views do
not define another hierarchy. Reusable calculation libraries share the independent `Analysis` root under
`libraries/analysis.sysml`. Domain schemas, component types and mixed libraries
remain separate; none depends on `BlueDog`.

| Native scope | Responsibility |
| --- | --- |
| `BlueDog::Mission` | Challenge, course, applicability and use cases |
| `BlueDog::Requirements` | System obligations, allocation basis and structural requirements |
| `BlueDog::Architecture` | System composition/context, logical and candidate physical architecture, interfaces and correspondences |
| `BlueDog::Behavior` | Executable mission policy, navigation and behavior contracts |
| `BlueDog::Analyses` | Project analysis cases and bindings to reusable calculations |
| `BlueDog::Configurations` | Named candidate inputs, shared assumptions, equipment and explicitly illustrative examples |
| `BlueDog::Decisions` | Working dispositions, open questions, context and trade criteria |
| `BlueDog::Verification` | Verification definitions, plans and satisfaction assertions |
| `BlueDog::Evidence` | Source evidence and generated projections of recorded results |
| `BlueDog::Method`, `BlueDog::Goals`, `BlueDog::DesignIntent` | Method/scenario roles, goals and design intent |
| `Analysis::Marine`, `Analysis::Mechanics`, `Analysis::Energy`, `Analysis::Reliability` | Reusable calculation-only kernels, organized by domain |
| `MarineDesign`, `MarineEnergy`, `InlandExtended`, `InlandNavigationExperiment`, `EngineeringDecisions` | Design/physical/domain types, mixed rule assessments and engineering information schemas |

See [namespace ownership and source maintenance](../docs/reference/namespace-structure.md)
for the hierarchy, extension rules and generated-section boundaries.

## Conventions

Keep requirement documentation to one concise obligation. Put normative qualification context in named `comment conditions` and explanation in `comment notes`. Use standard `ModelingMetadata::Rationale`, `Issue` and `StatusInfo` metadata for justification, unresolved decisions and maturity; maturity is not a verification verdict.

Review readability separately from relationship correctness. A requirement's main
sentence must tell the reader what the boat must do; a list of requirement IDs
belongs in its qualification conditions. Describe architecture elements by the
work they perform and the information or power they exchange. Give each link a
specific engineering reason. State missing evidence as the measurement or test
still needed. Keep explanations of SysML relationship semantics in this guide
instead of repeating them in every element description.

Use `#derivation` only for justified obligations under the original requirement's conditions. The OMG Requirement Derivation library states **original satisfaction implies every derived requirement**; satisfying the children alone does not prove their parent. A new numerical allocation is not logically entailed by a qualitative mission need. Record its provisional basis and validation need. Owner constraints need not be derived from mission success.

Use `verify` for verification objectives and `satisfy` for design satisfaction assertions about an identified subject. A satisfaction assertion is an engineering claim to establish, not an allocation or an accepted verdict. Use `allocate` to map logical responsibilities to candidate physical elements. Planned procedures and unaccepted evidence must remain inconclusive. Executable predicates reuse model calculations; numerical search is orchestrated by SciPy. External geometry and aerodynamic data retain provenance.

Reusable library interfaces expose named design properties. Numerical adapters currently use documented SI scalar conventions and vector conversion calculations; this is not full dimensional type checking.

View definitions belong in the [authored Markdown](../docs/reference/authoring.md). Native document queries supporting publication live under `tools/publishing/`. Generated diagrams and pages are build outputs, not hand-maintained copies of the model.

### OOSEM

Use native OOSEM roles and views for context, logical responsibilities, physical elements and scenarios. `BlueDog::Method` records package roles, scenario-to-use-case refinements and allocations. Keep logical sequences distinct from executable controllers and physical test evidence. Requirement package classification does not require inventing direct parent derivations for every requirement. The running OOSEM maturity assessment distinguishes model coverage from supporting virtual and physical evidence.

### Engineering layers and ownership

| Layer | Authoritative model | Meaning |
| --- | --- | --- |
| Mission and external context | `BlueDog::Mission`, `BlueDog::Architecture::MissionContext` | Challenge rules, external actors and current/future applicability |
| System obligations and design basis | `BlueDog::Requirements`, `BlueDog::Decisions` | Obligations, owner constraints, provisional allocations and selected strategies remain distinct |
| Operational interactions | `BlueDog::Mission::UseCases`, `BlueDog::Method::Scenarios` | Actor objectives and typed observations, commands, permissions and records |
| Logical architecture | `BlueDog::Architecture::Logical` | Responsibilities independent of processors, products and buses |
| Candidate physical architecture | `BlueDog::Architecture::Physical` | Proposed realization and interfaces; separate parts do not prove fault independence |
| Executable policy | `BlueDog::Behavior::MissionLogic`, `BlueDog::Analyses::MissionSimulation` | Explicit observations drive decisions, latches and assessment; no physical autopilot claim |
| Configuration and analysis | `BlueDog::Configurations::IC01`, `BlueDog::Analyses`, independent libraries | Complete named candidate inputs, project bindings and reusable domain calculations |
| Evidence | `BlueDog::Evidence`, `evidence/runs/` | Configuration-specific recorded outcomes and immutable source provenance |

The subsystem tree directly in `BlueDog::Architecture` is the system responsibility/context boundary. It includes useful hardware concepts; it is not the deployed assembly. Its `Logical` and `Physical` packages carry the more precise interfaces and allocations. Package containment does not replace component composition or an allocation relationship.

Keep abstraction, component decomposition and configuration separate. A logical responsibility may span several candidate elements; several responsibilities may share a controller. [Architecture correspondences](blue-dog.sysml) map the context responsibilities into logical responsibilities and record each IC-01 implementation contribution, path and named configuration. Primary/recovery labels distinguish implementation paths; they do not select a mode, settle conflicting authority or demonstrate fault independence.

Logical flows have stable names so candidate exchange allocations can identify their implementation transfers. Use a scoped internal-exchange allocation when coallocated responsibilities interact inside one controller; this records an implementation obligation without asserting an executed software call or measured latency. Preserve payload meaning through any transformation and identify unresolved timing, encoding, freshness, supply and fault contracts. Recovery management plans and commands; recovery actuation executes permitted propulsion. Physical shore capture and human pickup remain separate obligations.

Use native ports, connections and flows for interactions. A dependency means change impact or supporting basis, not transport of an item. A refinement points from the detailed representation to the element it clarifies. A constraint states a restriction; a decision records the chosen strategy and why. Review relationship meaning and endpoint types, not relationship counts.

For an engineering change, follow the affected path from mission need and operational interaction through logical responsibility, candidate realization, configuration, analysis and verification. Use native queries to inspect relationship endpoints and applicability. Record unresolved interfaces or assumptions where they belong; a missing engineering decision cannot be repaired by adding a generic dependency. Introduce a new abstraction when it clarifies a responsibility, supports reuse or enables a concrete analysis or verification question.

### Configuration, execution and evidence

Named configurations own design values and capability assumptions. For the IC-01 candidate, [BlueDog::Configurations::IC01](blue-dog.sysml) defines `design` and `integration`; [design decisions](blue-dog.sysml) record candidate and trade status. Project analyses bind a named subject and its assumptions to reusable calculations. An analysis must identify its subject, applicability and input provenance, and reject unsupported subjects rather than silently mixing configurations. Archived solutions can supply numerical initial guesses, but cannot silently supply current design values. Preserve exact recorded design values when establishing a baseline; extra decimal places do not imply measurement precision.

Maintain the distinction between descriptive scenarios, executed supervisory decisions, conditional numerical feasibility and accepted physical evidence. Required observations that are missing must not silently become confirmed capability. Qualification and recovery obligations belong in the [mission](blue-dog.sysml) and [vehicle requirements](blue-dog.sysml); [mission logic](blue-dog.sysml) implements supervisory policy. State transitions, persistence and reset conditions must agree with those obligations. Test both fault entry and restoration, including interacting faults and event ordering where relevant, rather than inferring policy from a successful nominal run.

Report native pass, fail, inconclusive and error outcomes without collapsing missing input into success. Not-applicable is a separate scope decision (for example, future ocean requirements during a Gorge review), not a fabricated fifth native verdict. Analysis completion with a `reserveFits=false` output means the calculation ran; it does not mean the recovery route passed.

Existing immutable evidence retains its source revision, original policy and configuration. New outputs record the actual source hashes, model hash, runtime revision and named subject; a Git commit alone is insufficient when the source tree is modified. Never rewrite historical projections to make them describe the current boat.

For each applicable governing requirement, identify a credible verification strategy and its subject, conditions and method. Coverage links identify defined objectives; execution records identify what ran; accepted evidence and verdicts require an explicit assessment of applicability and limitations. Keep these distinctions visible in reports. Scope exclusions need an explicit model basis, and unexplained missing coverage remains an open issue. See the [runtime instructions](../docs/reference/model-runtime.md) for native requirement and architecture audits and named-configuration demonstrations.

### Standards and implementation limits

The language reference is [OMG SysML 2.0, Part 1, formal/2026-03-02](https://www.omg.org/spec/SysML/2.0/Language/PDF), particularly §§7.14–7.17 for interfaces, allocation, flows and actions, requirements, verification and §9.6 Requirement Derivation. The official [derivation library source](https://github.com/Systems-Modeling/SysML-v2-Release/blob/master/sysml.library/Domain%20Libraries/Requirement%20Derivation/DerivationConnections.sysml) provides the implication and distinct-end constraints. OOSEM supplies the iterative engineering progression from needs through logical/allocated architecture and V&V; it is not itself a SysML metamodel. See the [INCOSE method survey, §3.2](https://www.omg.org/sysml/MBSE_Methodology_Survey_RevB.pdf) (2008 historical guidance) and the [current OOSEM working group](https://www.incose.org/group/object-oriented-se-method-working-group/). [NASA logical decomposition](https://www.nasa.gov/reference/4-3-logical-decomposition/), [interface management](https://www.nasa.gov/reference/6-3-interface-management/) and the [2026 defense SE guidebook, §6.2.3](https://www.cto.mil/wp-content/uploads/2026/09/SE-Guidebook-2026.pdf) inform the project conventions for behavior, structure, exchanges and configuration. These conventions are local synthesis rather than a claim of full standards compliance.

The audit uses the accessible [INCOSE Guide to Writing Requirements v4 summary](https://www.incose.org/docs/default-source/working-groups/requirements-wg/guidetowritingrequirements/incose_rwg_gtwr_v4_summary_sheet.pdf): singular obligations, explicit conditions, appropriate abstraction and separate requirement/system verification. The [SE Handbook fifth-edition overview](https://www.incose.org/resources-publications/technical-publications/se-handbook/) establishes lifecycle coverage. The complete paid guide and handbook were not available in this run; no full-text compliance certification is claimed.

Keep OpenSysML pinned at the revision in the installer, lockfile and README. Its OOSEM and DocumentQueries packages are implementation libraries written in SysML, not OMG normative domain libraries. Native parsing and queries establish supported semantics; descriptive scenario actions do not acquire executable bodies from a diagram. Marine/structural adapters still expose some documented SI scalar vectors; these do not provide universal dimensional checking. The model uses typed quantities at architecture and energy interfaces where supported. The runtime's native missing-input errors can be opaque; preserve failure rather than infer a value.

Before relying on an MCP result, confirm the server's workspace and runtime revision match the checkout under review. Use the matching pinned CLI/client if they differ, and record the mismatch with the validation result. A successful check against a different checkout or runtime is not a regression result for this model.

Candidate interface payload context and parameterized applicability predicates live in `BlueDog::Architecture::Interfaces`. They preserve the distinction between producer validity, consumer freshness, configuration/frame applicability and current command authority. No default freshness bound, synchronized clock or controller arbitration is implied. IF-01 through IF-05 record the outstanding engineering decisions; schema completion is not transport implementation or integration acceptance.

`BlueDog::Behavior::Contracts` holds partial executable consumer and qualification-restoration actions. Keep producer validity separate from consumer usability, and command applicability separate from current operational permission. Recovery enable respects known nonqualifying state and a durable disqualification acknowledgment; the outcome record follows actual actuation disposition. Required timing, storage atomicity, scheduling and physical implementation remain explicit open issues, not consequences of an allocation. New-attempt initialization and watchdog restoration are different operations.

Verification methods use native `VerificationCases::VerificationMethod` metadata. They describe planned assessment work; they do not execute it or accept evidence. `BlueDog::Verification::Planning` separates intended IC-01 test configuration from actual article/procedure/instrument identity and records interface/durability integration plus recovery-use validation. Eligibility for an affirmative evidence claim is distinct from an acceptance decision. Numerical verification definitions require bound subjects and retain their native verdict logic; do not invent default inputs to populate a report.

`BlueDog::Analyses::Safety` owns the initial Gorge hazard/control argument. Hazard
records identify configuration, modes, mishap, ownership and proposed controls;
native dependencies identify contributors, controlling requirements and planned
verification. Closure requires implementation/effectiveness and residual-risk
assessments plus actual disposition record identities. Review flags are supplied
assertions, not physical evidence or actual risk acceptance. Keep unassessed risk
explicit and do not import a military risk matrix as project policy. Reliability
rate aggregation also requires an explicit function partition, dependence treatment
and common-cause coverage basis.

`BlueDog::Configurations::Management` identifies study/input contexts, the intended
IC-01 installation and resource-accounting scopes. Native references preserve the
difference between current candidate, archived projection, numerical bracket,
shared assumptions and synthetic example. Source/model hashes identify a run;
archived geometry origin does not identify the current hardware revision. Budget
rows bind existing owners and declare boundary, mode, exclusions and closure work.
Do not add parents and children, replaced equipment, capacity states or main/recovery
accounts without their declared aggregation rules. Missing quantities stay unset,
and required peaks/identity records cannot be replaced with zero or review flags.

`BlueDog::Analyses::AnalysisCredibility` attaches intended-use/domain/limitation metadata to
analysis definitions and configured/nested usages without changing archived results.
Its proposed-use precondition accepts supplied review assertions only. Review effort
and validation adequacy depend on the intended use; an infeasible design can be the
valid conclusion of a credible calculation. Never use tag coverage as validation.

Engineering decision information uses the project-defined
`EngineeringDecisions::DecisionRecord` item definition in
`libraries/decision-records.sysml`, following SysML 2.0 Part 1 §7.10. A record is
information acted on over time, not a physical component or an executable decision
node. The U01–U06 identifiers identify the retained open questions under
`BlueDog::Decisions::OpenQuestions`. Record state
distinguishes retained working dispositions from open questions; it does not assert
formal approval, implementation or evidence acceptance. Preserve mixed constraints,
assumptions and strategy statements until their content is separately reviewed.
The native register includes eight design dispositions, six requirement-basis
records and six open questions.

Requirement-value and procedure-choice reviews remain metadata attached to their
subjects. `BlueDog::Requirements::Basis::AllocationDecision` specializes the shared
`EngineeringDecisions::AllocationReview` metadata definition; its 80 existing
annotations retain their content, subject identities and acceptance flags. They
are review obligations, not 80 newly accepted decisions or executable branches.

`BlueDog::Decisions::Context` adds scope, decision kind, responsibility,
criterion/comparison basis and reopening conditions to existing dispositions and
open questions. Actual record/authority/date/implementation identities stay absent
until known. Preserve the original question and owner on open-question items;
metadata context does not accept evidence. `BlueDog::Decisions::TradeCriteria` distinguishes
six declared mandatory rig evidence groups from the provisional reliability study.
These groups are not exhaustive system acceptance. Native trade selection, an
engineering recommendation and an authorized actual decision are different records.
