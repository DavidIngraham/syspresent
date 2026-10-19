package SyspresentRequirements {
    doc /* Owner-agreed canvas architecture baseline, 18 October 2026. The scoped canvas prototype is not acceptance of the complete product. Shall statements specify intended behavior, not implemented capability. Scope notes identify first-release versus follow-on work. */
    package Audience {
        requirement <'SP-001'> selfGuided {
            doc /* The first release shall support a technically minded reader with basic systems engineering knowledge but no required SysML knowledge, following a self-guided engineering story. */
            comment scope /* First release */
        }
        requirement <'SP-002'> staticHosting {
            doc /* The application shall run as a standalone static web application without a required application server or account. A browser-hosted OpenSysML WASM engine shall support model loading, view resolution and exploration, with the same Go engine available natively for CI. */
            comment scope /* First release */
        }
        requirement <'SP-003'> presentationLater {
            doc /* The story format shall preserve ordered stops, annotations and optional speaker notes so a later live-presentation mode can reuse the authored content. */
            comment scope /* First release format; later presenter UI */
        }
    }
    package Authoring {
        requirement <'SP-010'> markdownSource {
            doc /* Authors shall define narratives in Markdown that references SysML views and includes prepared figures, prepared tables, annotations, ordered scenes and presentation transitions. Reusable model selection shall be expressed by SysML view definitions and view usages rather than a duplicate Markdown traversal language. */
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
            doc /* The same story source shall support ordered readable scenes and their narrative, relevant figures and tables without requiring animation to convey the argument. Reduced-motion navigation shall retain the information and correspondence of animated scenes. */
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
            doc /* The primary presentation surface shall be a graph canvas supporting ordered guided scenes and direct links to scenes. Guided navigation shall traverse the model while each settled scene emphasizes its intended active viewpoint. Bounded peripheral context may remain translucent; hidden context shall be disclosed when explored. */
            comment scope /* First release */
        }
        requirement <'SP-031'> stableScenes {
            doc /* The graph shall dynamically rearrange to make each scene and exploration action readable. Settled scenes shall remain stable over a reading interval; transitions shall preserve meaningful semantic correspondence and support backward navigation without requiring fixed global element positions. */
            comment scope /* First release */
        }
        requirement <'SP-032'> responsiveLayout {
            doc /* Markdown context panels shall occupy measured regions of the graph canvas. Diagram layout shall account for their actual occupied display space, labels and viewport dimensions. Panel size and placement may vary between scenes for efficient space use and shall remain steady while the scene is read unless resizing or an explicit action requires adjustment. Joint tile placement and connection routing shall reserve unobstructed corridors and measured labels. Connections shall not cross unrelated tiles, container headers or prose. Distinct relationships shall keep distinct terminal attachments and recognizable native notation. Settled connection labels shall avoid cards and other labels; an impossible route or label fit shall be disclosed rather than drawn through an obstacle. Placement and routing shall minimize unnecessary path length and bends while preserving distinct readable connections. Peripheral continuations shall identify their native relationship and shall not imply a junction between separate links. During transitions invalid intermediate paths or paths detached from their current endpoints shall not be drawn. */
            comment scope /* First release */
        }
        requirement <'SP-033'> explorationHandoff {
            doc /* Leaving an authored scene for manual exploration shall collapse its narrative panels into a compact Return to scene control and suspend guided movement. Returning shall restore the authored viewpoint, narrative and presentation preferences. */
            comment scope /* First release */
        }
        requirement <'SP-034'> semanticAnnotations {
            doc /* Model callouts and prose highlights shall bind to semantic element identities, not diagram coordinates. Missing targets shall fail publication. */
            comment scope /* First release */
        }
        requirement <'SP-035'> presentationOverrides {
            doc /* Authors shall express focus, emphasis, annotation anchors and optional layout constraints per scene using semantic identities. Runtime layout shall determine responsive positions; presentation constraints shall not alter model meaning or require a fixed global layout. */
            comment scope /* First release */
        }
        requirement <'SP-036'> purposefulMotion {
            doc /* Camera motion shall communicate location or correspondence. Changes between incompatible notations shall not imply false spatial or causal equivalence. Reduced-motion presentation shall preserve the same information. A multi-stage journey shall use continuous motion through intermediate viewpoints without repeated stop-and-restart easing; entering and leaving content shall fade. If an entering or retained tile will occupy a departing tile's region, the departing tile shall move out of the frame while fading before the replacement enters that region. Visible departing motion shall avoid retained tiles and measured prose; when no clear exit exists it shall fade before contact. Replacement movement shall start smoothly after its hold. */
            comment scope /* First release */
        }
        requirement <'SP-037'> accessibleControls {
            doc /* Navigation, selection and story resumption shall be keyboard operable with visible focus. Meaning and required details shall not depend solely on color, hover or animation. */
            comment scope /* First release */
        }
    }
    package Exploration {
        requirement <'SP-040'> localContext {
            doc /* The explorer shall start from a focused element or authored view and allow search and selective relationship-directed expansion instead of requiring a full-model overview. Requirement exploration shall default to engineering relationships, including explicit definition-to-usage context and modeled constraints, while retaining documentation and ownership internals as opt-in context. */
            comment scope /* First release */
        }
        requirement <'SP-041'> typedFilters {
            doc /* Readers shall be able to independently filter node types and relationship types, inspect edge direction and labels, and distinguish containment, derivation, satisfaction, verification, allocation and causation. */
            comment scope /* First release */
        }
        requirement <'SP-042'> boundedContext {
            doc /* Expansion shall disclose omitted neighbors and active filters and allow choosing additional context before excessive expansion. Context limits shall be configurable and shall not imply that hidden relationships are absent. Bounded engineering connections beyond the active viewpoint shall remain visible as translucent peripheral context, distinguishable from the active diagram. Peripheral context shall not determine the active content camera fit, centering or layout. */
            comment scope /* First release */
        }
        requirement <'SP-043'> freeTraversal {
            doc /* Readers shall be able to traverse all exported project and referenced library context in either relationship direction. Ownership boundaries and unexported or unavailable targets shall be explicit; project boundaries shall not be navigation barriers. */
            comment scope /* First release */
        }
        requirement <'SP-044'> focusHistory {
            doc /* The explorer shall provide focus, pin, collapse, reset and Back/Forward operations that restore the prior view and its context. History restoration shall include scene handoff, expanded statements, active result page and display preferences. */
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
    package RequirementReading {
        requirement <'SP-047'> requirementQuestions {
            doc /* Requirement diagrams and contextual exploration actions shall reveal the requirement statement, rationale, upstream origins, affected system elements and verification cases within the graph. Definitions and usages shall retain distinct semantic identities through explicit typing. Directional actions shall distinguish upstream origins from downstream derived requirements, and preserve explicit native links through any direct definition-to-usage bridge. Large result sets shall be traversable in bounded pages. A separate question-reader interface shall not replace diagram exploration. */
            comment scope /* First release */
        }
        requirement <'SP-048'> traceEvidence {
            doc /* Graph exploration shall identify indirect paths, disclose bounded or unavailable context, preserve native edge direction, and distinguish missing links, planned verification, declared model verdicts and executed evidence. Diagram representations shall remain the primary exploration surface. */
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
        requirement <'SP-055'> generalToSpecific {
            doc /* General structural views shall place general classifiers above their specializations and typed usages by default. Requirement views shall read top down from source obligations to derived or refined requirements, with satisfying parts and verifying cases below the requirements they address. This visual ordering shall not assert ownership or alter native arrows. The layout shall preserve native relationship directions and shall not change behavioral ordering. Explicit authored placement may override the default. */
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
            doc /* Syspresent shall own its interactive canvas, layout orchestration and transition framework without a runtime or source dependency on the OpenSysML VS Code extension. OpenSysML Go shall supply authoritative parsing and view semantics through an explicit versioned adapter contract. Other reused dependencies shall retain revision, license and source provenance. */
            comment scope /* First release */
        }
        requirement <'SP-064'> configuration {
            doc /* Entry points, exploration modes, default filters, context limits, grouping, detail fields and presentation preferences shall be declarative; Blue Dog names shall not be hardcoded in the viewer. */
            comment scope /* First release */
        }
    }
    package CanvasAuthoring {
        requirement <'SP-080'> selectionActions {
            doc /* A first click, tap or keyboard selection shall highlight the element and expose contextual actions without rearranging the graph. Refocus, expansion and viewpoint changes shall require an explicit action, with equivalent touch and keyboard access. */
            comment scope /* Canvas architecture baseline */
        }
        requirement <'SP-081'> transitionKinds {
            doc /* Transitions within one diagram type shall gather, fade and rearrange content directly in that notation. Transitions between diagram types shall use a General View journey through relevant engineering relationships, collect destination elements and features, then transform into the destination notation without inventing semantic equivalence. */
            comment scope /* Canvas architecture baseline */
        }
        requirement <'SP-082'> engineeringJourneys {
            doc /* Route proposals shall use explicit engineering relationships within the presentation system of interest and scene-specific additions. Shared library or KerML ancestry shall not create an implicit shortcut between system elements. Authors shall be able to inspect and adjust proposed routes, and save the selected explicit route. Deliberate library or metamodel exploration shall remain available outside guided routing. */
            comment scope /* Canvas architecture baseline */
        }
        requirement <'SP-083'> multipleRegions {
            doc /* A scene shall be able to compose multiple diagram regions with explicit notation boundaries, shared semantic identities and coordinated narrative-panel layout. */
            comment scope /* Full canvas product; prototype may demonstrate one primary region */
        }
        requirement <'SP-084'> staticEditor {
            doc /* The standalone static application shall import, edit and export views and presentations. Authors shall be able to explore the model, capture a viewpoint as a scene, edit Markdown and annotations and adjust semantic visibility and presentation constraints. The initial underlying system model shall remain read-only. */
            comment scope /* Canvas architecture baseline */
        }
        requirement <'SP-085'> portableProject {
            doc /* A presentation project shall use ordinary files for model and required library sources, authored SysML views, Markdown, assets and a small manifest with dependencies and entry points. Folder or ZIP import/export shall preserve those files; individual Markdown import/export shall also be supported. */
            comment scope /* Canvas architecture baseline; complete browser round-trip not implied by prototype */
        }
        requirement <'SP-086'> standaloneExploration {
            doc /* Users shall be able to load and explore a model without a story, create views and traverse all loaded model content. Story viewpoints shall guide exploration without restricting it; engineering route defaults and deliberate metamodel traversal shall remain distinct. */
            comment scope /* Canvas architecture baseline */
        }
        requirement <'SP-087'> publicationCoverage {
            doc /* Publication shall include the complete model project by default and permit an explicitly scoped export. The application shall distinguish an export boundary or unavailable target from content hidden by a view or exploration filter. */
            comment scope /* Canvas architecture baseline */
        }
        requirement <'SP-088'> runtimeParity {
            doc /* Native Go and browser WASM processing of the same project and declared view shall provide consistent semantic identities, relationship meaning and view content. The browser engine shall run in a worker so parsing and resolution do not block canvas interaction. Required unsupported operations shall be reported explicitly. */
            comment scope /* Canvas architecture baseline; scoped parity demonstrated by prototype */
        }
        requirement <'SP-089'> basicRebuildValidation {
            doc /* A rebuild shall identify scene, route and annotation references that no longer resolve and allow authors to repair them. Immutable published snapshots shall remain unchanged. Automatic semantic change adjudication, deep model history and mandatory change-review workflows are outside the current scope. */
            comment scope /* Canvas architecture baseline */
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
