package SyspresentRequirements {
    doc /* Owner-agreed product baseline, 17 October 2026. Shall statements specify intended behavior, not implemented capability. Scope notes identify first-release versus follow-on work. */
    package Audience {
        requirement <'SP-001'> selfGuided {
            doc /* The first release shall support a technically minded reader with basic systems engineering knowledge but no required SysML knowledge, following a self-guided engineering story. */
            comment scope /* First release */
        }
        requirement <'SP-002'> staticHosting {
            doc /* The reader application shall run as a static site on GitHub Pages without application servers, accounts, or a required WASM runtime. */
            comment scope /* First release */
        }
        requirement <'SP-003'> presentationLater {
            doc /* The story format shall preserve ordered stops, annotations and optional speaker notes so a later live-presentation mode can reuse the authored content. */
            comment scope /* First release format; later presenter UI */
        }
    }
    package Authoring {
        requirement <'SP-010'> markdownSource {
            doc /* Authors shall define narratives in Markdown with declarative blocks for native model views, prepared figures, prepared tables, annotations and story stops. */
            comment scope /* First release */
        }
        requirement <'SP-011'> typedSubstitution {
            doc /* The build shall resolve fully qualified model references and typed text/value substitutions through native OpenSysML interfaces; formatting and compatible unit conversion shall be explicit. */
            comment scope /* First release */
        }
        requirement <'SP-012'> evaluationContext {
            doc /* A substitution requiring an instance, configuration or analysis result shall identify that context. The build shall not guess inputs or silently run an analysis to fill prose. */
            comment scope /* First release */
        }
        requirement <'SP-013'> contentBoundary {
            doc /* Substantive engineering alternatives, assumptions and decisions shall reference model records. Narrative explanations, discussion prompts, story order and speaker notes may be presentation content. */
            comment scope /* First release */
        }
        requirement <'SP-014'> preparedEvidence {
            doc /* The first release shall embed prepared plots and data tables with their source and configuration/run provenance where applicable; it shall not require reader-triggered analysis execution. */
            comment scope /* First release */
        }
        requirement <'SP-015'> strictBuild {
            doc /* Publication shall fail on unresolved required references, missing artifacts, incompatible bundles or invalid substitutions, with source-location diagnostics. Explicit unknown and unassessed values shall remain distinguishable from errors, zero and empty text. */
            comment scope /* First release */
        }
        requirement <'SP-016'> safeTemplates {
            doc /* Template substitution shall use an allowlisted typed expression vocabulary without arbitrary author-supplied Python or JavaScript execution. */
            comment scope /* First release */
        }
        requirement <'SP-017'> linearReading {
            doc /* The same story source shall provide a linear readable presentation of its narrative, relevant figures and tables, without requiring animation to convey its argument. */
            comment scope /* First release */
        }
        requirement <'SP-018'> closingArgument {
            doc /* The default review template shall close with what the evidence supports, what remains open, and the decision requested or next action. */
            comment scope /* First release */
        }
    }
    package Snapshots {
        requirement <'SP-020'> frozenSnapshot {
            doc /* A published review shall identify and retain immutable story, model, evidence and viewer/tool versions, with content digests sufficient to detect changed snapshot assets. Updates shall publish a new snapshot rather than overwrite the reviewed content. */
            comment scope /* First release */
        }
        requirement <'SP-021'> ciBuild {
            doc /* A documented noninteractive CI command shall validate references, export native model data and assemble a deployable static review snapshot, returning failure when publication checks fail. */
            comment scope /* First release */
        }
        requirement <'SP-022'> reviewLifecycle {
            doc /* The review catalog shall support draft, current, superseded and withdrawn statuses. Superseded and withdrawn snapshots shall remain accessible with explicit status and reason; superseded entries shall link their replacement review. */
            comment scope /* First release */
        }
        requirement <'SP-023'> reviewMetadata {
            doc /* Reviews shall support reviewer identity, review date and outcome metadata. Publication, software checks and metadata entry shall not imply engineering approval. */
            comment scope /* First release */
        }
        requirement <'SP-024'> snapshotExploration {
            doc /* Exploration launched from a story shall remain within that snapshot. Normal reading shall not offer a silent or automatic switch to the latest model. */
            comment scope /* First release */
        }
        requirement <'SP-025'> evolutionTimeline {
            doc /* A separate authored model-evolution timeline shall explain selected changes and link to the relevant frozen reviews; it shall not silently alter a historical review. */
            comment scope /* Follow-on feature */
        }
    }
    package StoryExperience {
        requirement <'SP-030'> continuousStory {
            doc /* Readers shall progress by normal continuous page scrolling, with a section outline and direct links to story stops. Narrative progression shall not require precision positioning of the scrollbar. */
            comment scope /* First release */
        }
        requirement <'SP-031'> stableScenes {
            doc /* Authored scenes shall remain stable over a reading interval. Scene transitions shall be reversible on backward navigation and shall preserve readable labels and meaningful element correspondence. */
            comment scope /* First release */
        }
        requirement <'SP-032'> responsiveLayout {
            doc /* Desktop stories shall provide scrolling prose beside a persistent model canvas, with full-width prepared figures/tables where requested. Mobile stories shall place views inline and avoid persistent controls obscuring the reading area. */
            comment scope /* First release */
        }
        requirement <'SP-033'> explorationHandoff {
            doc /* Manual graph exploration shall suspend automatic story camera movement. An explicit resume control shall restore the authored scene and reading position. */
            comment scope /* First release */
        }
        requirement <'SP-034'> semanticAnnotations {
            doc /* Model callouts and prose highlights shall bind to semantic element identities, not diagram coordinates. Missing targets shall fail publication. */
            comment scope /* First release */
        }
        requirement <'SP-035'> presentationOverrides {
            doc /* Authors may override camera framing, highlights and node placement per story stop without modifying the reusable model view or its semantic relationships. Overrides shall be keyed to identities. */
            comment scope /* First release */
        }
        requirement <'SP-036'> purposefulMotion {
            doc /* Camera motion shall communicate location or correspondence. Changes between incompatible notations shall not imply false spatial or causal equivalence. Reduced-motion presentation shall preserve the same information. */
            comment scope /* First release */
        }
        requirement <'SP-037'> accessibleControls {
            doc /* Navigation, selection and story resumption shall be keyboard operable with visible focus. Meaning and required details shall not depend solely on color, hover or animation. */
            comment scope /* First release */
        }
    }
    package Exploration {
        requirement <'SP-040'> localContext {
            doc /* The explorer shall start from a focused element or authored view and allow search and selective relationship-directed expansion instead of requiring a full-model overview. */
            comment scope /* First release */
        }
        requirement <'SP-041'> typedFilters {
            doc /* Readers shall be able to independently filter node types and relationship types, inspect edge direction and labels, and distinguish containment, derivation, satisfaction, verification, allocation and causation. */
            comment scope /* First release */
        }
        requirement <'SP-042'> boundedContext {
            doc /* Expansion shall disclose omitted neighbors and active filters and allow choosing additional context before excessive expansion. Context limits shall be configurable and shall not imply that hidden relationships are absent. */
            comment scope /* First release */
        }
        requirement <'SP-043'> freeTraversal {
            doc /* Readers shall be able to traverse all exported project and referenced library context in either relationship direction. Ownership boundaries and unexported or unavailable targets shall be explicit; project boundaries shall not be navigation barriers. */
            comment scope /* First release */
        }
        requirement <'SP-044'> focusHistory {
            doc /* The explorer shall provide focus, pin, collapse, reset and Back/Forward operations that restore the prior view and its context. */
            comment scope /* First release */
        }
        requirement <'SP-045'> shareableState {
            doc /* A shareable URL shall identify the immutable snapshot and restore the story stop or explored focus, view, filters and expanded elements. */
            comment scope /* First release */
        }
        requirement <'SP-046'> detailsAndClaims {
            doc /* Selection shall expose descriptions, source references, related evidence and relevant views. Intended satisfaction links shall remain distinct from verification verdicts and accepted evidence. */
            comment scope /* First release */
        }
    }
    package Views {
        requirement <'SP-050'> viewKinds {
            doc /* The explorer shall support requirement relationships, structure, activity/logic, sequence, state-machine and qualitative fault-tree views, and native tabular views. Unsupported native kinds or details shall be explicitly reported rather than silently approximated. Such reporting does not waive required first-release support; a gap in a required kind blocks its acceptance. */
            comment scope /* First release acceptance scope */
        }
        requirement <'SP-051'> behaviorSemantics {
            doc /* Behavioral views shall preserve applicable order, guards, concurrency, participants, state boundaries and call relationships. Browser code shall not reconstruct these semantics from labels. */
            comment scope /* First release */
        }
        requirement <'SP-052'> crossViewIdentity {
            doc /* Switching views shall retain semantic selection where represented and identify where it is not. Different render-local IDs shall not imply different model elements. */
            comment scope /* First release */
        }
        requirement <'SP-053'> traceVersusPossibility {
            doc /* Modeled possible behavior shall be distinguished from recorded execution traces, including the trace configuration and inputs. A diagram alone shall not be presented as evidence of execution or physical verification. */
            comment scope /* First release */
        }
        requirement <'SP-054'> comparisonViews {
            doc /* Traceability questions shall be expressible as native tables or matrices as well as node-link paths. Prepared comparison views shall allow simultaneous inspection rather than requiring animation or visual memory alone. */
            comment scope /* First release */
        }
    }
    package Reuse {
        requirement <'SP-060'> declarativeReuse {
            doc /* An unrelated model shall use the exporter and explorer by changing only model sources, native views/queries, story content and declarative configuration, without project-specific JavaScript. */
            comment scope /* First release */
        }
        requirement <'SP-061'> nativeAuthority {
            doc /* OpenSysML shall remain authoritative for parsing, model relationships, evaluation and rendering semantics. Syspresent shall not introduce a second SysML parser or infer engineering relationships from diagram labels. */
            comment scope /* First release */
        }
        requirement <'SP-062'> versionedBundle {
            doc /* The export contract shall version native view payloads, element and relationship indexes, query results, view catalogs and provenance. Semantic identities shall be mapped separately from view-local identifiers. */
            comment scope /* First release */
        }
        requirement <'SP-063'> reuseCanvas {
            doc /* The implementation shall evaluate reuse of OpenSysML browser canvas, layout, routing and export components before introducing equivalents. Reused dependencies shall be pinned with license and source provenance. */
            comment scope /* First release */
        }
        requirement <'SP-064'> configuration {
            doc /* Entry points, exploration modes, default filters, context limits, grouping, detail fields and presentation preferences shall be declarative; Blue Dog names shall not be hardcoded in the viewer. */
            comment scope /* First release */
        }
    }
    package Acceptance {
        requirement <'SP-070'> avoidanceStory {
            doc /* The first engineering acceptance story shall explain Blue Dog avoidance and recovery using requirement traces, behavior, failure analysis, DFMEA, and at least one prepared plot, with an explicit closing argument. */
            comment scope /* First release */
        }
        requirement <'SP-071'> notationTutorial {
            doc /* A second example shall teach core SysML v2 and OMG standard domain-library notation through a small familiar system independent of Blue Dog. Tool-specific extensions shall not be presented as OMG notation. */
            comment scope /* First release */
        }
        requirement <'SP-072'> usabilityEvidence {
            doc /* Before declaring the reading experience accepted, evaluate technically minded readers on requirement tracing, satisfaction versus verification, shared causes, behavioral interpretation and returning from exploration; record accuracy, time, navigation errors, confidence and preference. */
            comment scope /* First release acceptance; sample size and quantitative thresholds pending owner review */
        }
    }
}
