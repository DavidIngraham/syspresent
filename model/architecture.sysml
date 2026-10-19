package SyspresentArchitecture {
    doc /* Logical responsibilities and interface intentions, not an implemented wire schema. Engineering data is native-derived; presentation state cannot change model meaning. */
    private import ScalarValues::*;
    enum def ReviewStatus { draft; current; superseded; withdrawn; }
    item def SnapshotManifest {
        attribute snapshotId : String;
        attribute storyRevision : String;
        attribute modelRevision : String;
        attribute evidenceManifestDigest : String;
        attribute nativeToolRevision : String;
        attribute viewerRevision : String;
        attribute bundleSchemaVersion : String;
        attribute contentManifestDigest : String;
    }
    item def ReviewCatalogEntry {
        doc /* Mutable catalog record points to immutable snapshot content. Lifecycle changes do not rewrite the reviewed snapshot. */
        attribute reviewId : String;
        attribute snapshotId : String;
        attribute status : ReviewStatus;
        attribute reviewer : String [0..*];
        attribute reviewedOn : String [0..1];
        attribute outcome : String [0..1];
        attribute statusReason : String [0..1];
        attribute replacementReviewId : String [0..1];
    }
    item def StorySource {
        doc /* Markdown prose, native view references, typed reference expressions, scene order and transition choreography. Reusable selection is declared in SysML view definitions/usages, not a parallel Markdown query language. */
        attribute sourcePath : String;
    }
    item def ModelBundle {
        doc /* Versioned engineering graph, diagram projections, view catalog, typed query results, sources, required libraries and provenance; includes explicit publication coverage and semantic-to-representation ID mapping. Native engine semantics remain authoritative. */
        item manifest : SnapshotManifest;
    }
    item def StoryStop {
        attribute stopId : String;
        attribute viewReference : String [0..1];
        attribute focusElementId : String [0..*];
        attribute annotationTargetId : String [0..*];
        attribute speakerNotes : String [0..1];
        doc /* Focus, emphasis, narrative anchors and optional layout constraints are presentation-only and keyed to semantic identity. Calculated responsive coordinates are not model meaning. */
    }
    part def NativeExportAdapter {
        doc /* Calls pinned OpenSysML interfaces; exports model meaning and view data without a parallel parser or relationship engine. */
    }
    part def StoryCompiler {
        doc /* Validates Markdown, typed references, prepared evidence and snapshot provenance; outputs static story assets or actionable errors. */
    }
    part def ExplorerShell {
        doc /* Owns search, scope, relationship filters, history, pins, selection and detail panels. */
    }
    part def CanvasEngine {
        doc /* Syspresent-owned diagram representations, selection, dynamic layout, routing and animation; no VS Code source dependency. Model semantics arrive through the explicit native adapter contract. */
    }
    part def SemanticWorker {
        doc /* Hosts OpenSysML Go WASM parsing, model loading and view resolution in a browser worker. Native Go exposes equivalent project/view semantics for CI. Unsupported operations produce explicit diagnostics. */
    }
    part def ViewAuthoringEditor {
        doc /* Captures exploration into authored SysML views and Markdown scenes; imports/exports the portable project. System-model sources remain read-only in the initial editor. */
    }
    part def ProjectArchiveAdapter {
        doc /* Reads/writes ordinary project files and ZIPs: model/library sources, authored views, Markdown, assets and a dependency/entry-point manifest. Supports independent Markdown export. */
    }
    part def PanelLayoutCoordinator {
        doc /* Measures narrative occupancy, solves scene/region layout for current viewport and keeps settled panel geometry steady while read. */
    }
    part def JourneyPlanner {
        doc /* Proposes author-editable engineering routes inside system scope and explicit additions. Excludes incidental metamodel ancestry shortcuts; saves chosen relationships and resolves basic broken-reference diagnostics. */
    }
    part def StoryController {
        doc /* Owns guided canvas scenes, direct same-notation transitions, cross-notation GV journeys, semantic correspondence, exploration handoff and restoration. It does not require a story for standalone exploration. */
    }
    part def StaticPublication {
        doc /* Publishes immutable snapshot assets and a mutable lifecycle catalog through CI. No accounts, comments or approval service. */
    }
    part syspresent {
        part exporter : NativeExportAdapter;
        part compiler : StoryCompiler;
        part explorer : ExplorerShell;
        part canvas : CanvasEngine;
        part semanticWorker : SemanticWorker;
        part editor : ViewAuthoringEditor;
        part archive : ProjectArchiveAdapter;
        part panelLayout : PanelLayoutCoordinator;
        part journeys : JourneyPlanner;
        part story : StoryController;
        part publication : StaticPublication;
    }
    dependency semanticBoundary from syspresent::exporter to SyspresentRequirements::Reuse::nativeAuthority;
    dependency authoringBoundary from syspresent::compiler to SyspresentRequirements::Authoring::contentBoundary;
    dependency snapshotBoundary from syspresent::publication to SyspresentRequirements::Snapshots::frozenSnapshot;
    dependency independentRendering from syspresent::canvas to SyspresentRequirements::Reuse::reuseCanvas;
    dependency navigationResponsibility from syspresent::explorer to SyspresentRequirements::Exploration::focusHistory;
    dependency browserRuntime from syspresent::semanticWorker to SyspresentRequirements::CanvasAuthoring::runtimeParity;
    dependency authoringScope from syspresent::editor to SyspresentRequirements::CanvasAuthoring::staticEditor;
    dependency projectRoundTrip from syspresent::archive to SyspresentRequirements::CanvasAuthoring::portableProject;
    dependency occupiedSpace from syspresent::panelLayout to SyspresentRequirements::StoryExperience::responsiveLayout;
    dependency engineeringRoutes from syspresent::journeys to SyspresentRequirements::CanvasAuthoring::engineeringJourneys;
    dependency readingResponsibility from syspresent::story to SyspresentRequirements::StoryExperience::stableScenes;
}
