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
        doc /* Markdown prose, declarative blocks and typed reference expressions. Exact grammar remains a design decision. */
        attribute sourcePath : String;
    }
    item def ModelBundle {
        doc /* Native render payloads, native-derived element/relationship index, view catalog and typed query results; includes explicit export coverage and semantic-to-render ID mapping. */
        item manifest : SnapshotManifest;
    }
    item def StoryStop {
        attribute stopId : String;
        attribute viewReference : String [0..1];
        attribute focusElementId : String [0..*];
        attribute annotationTargetId : String [0..*];
        attribute speakerNotes : String [0..1];
        doc /* Camera framing and layout overrides are presentation-only and keyed to semantic identity. */
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
    part def NativeCanvasAdapter {
        doc /* Adapts reused OpenSysML canvas/layout/routing to Syspresent data and events, without VS Code host or landing-page assumptions. Reuse feasibility must be proven. */
    }
    part def StoryController {
        doc /* Owns continuous scrolling, stable stops, meaningful transitions, exploration handoff and restoration. */
    }
    part def StaticPublication {
        doc /* Publishes immutable snapshot assets and a mutable lifecycle catalog through CI. No accounts, comments or approval service. */
    }
    part syspresent {
        part exporter : NativeExportAdapter;
        part compiler : StoryCompiler;
        part explorer : ExplorerShell;
        part canvas : NativeCanvasAdapter;
        part story : StoryController;
        part publication : StaticPublication;
    }
    dependency semanticBoundary from syspresent::exporter to SyspresentRequirements::Reuse::nativeAuthority;
    dependency authoringBoundary from syspresent::compiler to SyspresentRequirements::Authoring::contentBoundary;
    dependency snapshotBoundary from syspresent::publication to SyspresentRequirements::Snapshots::frozenSnapshot;
    dependency renderingReuse from syspresent::canvas to SyspresentRequirements::Reuse::reuseCanvas;
    dependency navigationResponsibility from syspresent::explorer to SyspresentRequirements::Exploration::focusHistory;
    dependency readingResponsibility from syspresent::story to SyspresentRequirements::StoryExperience::stableScenes;
}
