package SyspresentVerification {
    doc /* Planned verification cases. All verdicts are explicitly inconclusive until implementation evidence exists. Structural model validation is not product acceptance. */
    verification def <'SV-001'> authoring {
        doc /* Compile valid and invalid Markdown fixtures: resolve typed prose, explicit contexts, unknown values, artifacts and model-linked decisions; reject missing or unsafe substitutions with source locations. */
        objective acceptance {
            verify SyspresentRequirements::Authoring::markdownSource;
            verify SyspresentRequirements::Authoring::typedSubstitution;
            verify SyspresentRequirements::Authoring::evaluationContext;
            verify SyspresentRequirements::Authoring::contentBoundary;
            verify SyspresentRequirements::Authoring::preparedEvidence;
            verify SyspresentRequirements::Authoring::strictBuild;
            verify SyspresentRequirements::Authoring::safeTemplates;
            verify SyspresentRequirements::Authoring::linearReading;
            verify SyspresentRequirements::Authoring::closingArgument;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-002'> snapshots {
        doc /* Build two revisions in CI; retain and hash-check the first bundle, change catalog lifecycle without rewriting it, resolve replacement links, and confirm old story/explorer links remain within the first snapshot. Inspect reviewer metadata without inferring approval. */
        objective acceptance {
            verify SyspresentRequirements::Snapshots::frozenSnapshot;
            verify SyspresentRequirements::Snapshots::ciBuild;
            verify SyspresentRequirements::Snapshots::reviewLifecycle;
            verify SyspresentRequirements::Snapshots::reviewMetadata;
            verify SyspresentRequirements::Snapshots::snapshotExploration;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-003'> story {
        doc /* Exercise forward/backward guided canvas scenes, scene links, settled reading intervals, manual exploration and exact resumption on desktop and mobile. Check keyboard focus, reduced motion and non-hover details. */
        objective acceptance {
            verify SyspresentRequirements::Audience::selfGuided;
            verify SyspresentRequirements::StoryExperience::continuousStory;
            verify SyspresentRequirements::StoryExperience::stableScenes;
            verify SyspresentRequirements::StoryExperience::responsiveLayout;
            verify SyspresentRequirements::StoryExperience::explorationHandoff;
            verify SyspresentRequirements::StoryExperience::semanticAnnotations;
            verify SyspresentRequirements::StoryExperience::presentationOverrides;
            verify SyspresentRequirements::StoryExperience::purposefulMotion;
            verify SyspresentRequirements::StoryExperience::accessibleControls;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-004'> exploration {
        doc /* Trace requirement-to-component-to-verification paths; filter and expand in both directions, cross a library boundary, distinguish omitted and unexported neighbors, restore history and reproduce state from a shared URL. Exercise a neighborhood larger than the viewport, verify real tiles and complete native endpoints, pan and zoom without geometry or selection changes, frame the neighborhood, restore active fit, focus a neighbor, and restore its prior camera and neighborhood budget through history. Check pointer cancellation and that taps do not become drags; verify disclosures for filters, unavailable targets, caps and unavailable routes. */
        objective acceptance {
            verify SyspresentRequirements::Exploration::localContext;
            verify SyspresentRequirements::Exploration::typedFilters;
            verify SyspresentRequirements::Exploration::boundedContext;
            verify SyspresentRequirements::Exploration::freeTraversal;
            verify SyspresentRequirements::Exploration::focusHistory;
            verify SyspresentRequirements::Exploration::shareableState;
            verify SyspresentRequirements::Exploration::detailsAndClaims;
            verify SyspresentRequirements::RequirementReading::requirementQuestions;
            verify SyspresentRequirements::RequirementReading::traceEvidence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-005'> notation {
        doc /* Compare each supported view kind with native semantic fixtures, including branching/concurrent actions, sequence ordering, composite states, shared failure causes and partial views. Verify cross-view identity and distinguish recorded execution from possible behavior. */
        objective acceptance {
            verify SyspresentRequirements::Views::viewKinds;
            verify SyspresentRequirements::Views::behaviorSemantics;
            verify SyspresentRequirements::Views::crossViewIdentity;
            verify SyspresentRequirements::Views::traceVersusPossibility;
            verify SyspresentRequirements::Views::comparisonViews;
            verify SyspresentRequirements::Views::generalToSpecific;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-006'> reuse {
        doc /* Build and serve both the Blue Dog acceptance story and unrelated tutorial without modifying viewer JavaScript. Inspect pinned dependencies, native payload preservation, identity mapping, declared bundle coverage and static hosting with WASM but no required application service. */
        objective acceptance {
            verify SyspresentRequirements::Audience::staticHosting;
            verify SyspresentRequirements::Reuse::declarativeReuse;
            verify SyspresentRequirements::Reuse::nativeAuthority;
            verify SyspresentRequirements::Reuse::versionedBundle;
            verify SyspresentRequirements::Reuse::reuseCanvas;
            verify SyspresentRequirements::Reuse::configuration;
            verify SyspresentRequirements::Acceptance::avoidanceStory;
            verify SyspresentRequirements::Acceptance::notationTutorial;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-007'> readerStudy {
        doc /* Run the task-based formative study with representative technically minded newcomers. Preserve protocol, observations, errors and unresolved acceptance thresholds. Preference alone cannot establish comprehension. */
        objective acceptance {
            verify SyspresentRequirements::Acceptance::usabilityEvidence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-008'> futurePresentation {
        doc /* Inspect that ordered stops, speaker notes and annotations survive compilation for later presentation adapters. No presenter UI completion is claimed. */
        objective acceptance {
            verify SyspresentRequirements::Audience::presentationLater;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-009'> futureEvolution {
        doc /* Follow the authored timeline to immutable historical reviews and verify change explanations do not alter historical content. This case remains follow-on work. */
        objective acceptance {
            verify SyspresentRequirements::Snapshots::evolutionTimeline;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-010'> canvasRuntimePrototype {
        doc /* Load the same small unrelated model and authored views through the pinned native Go and real browser WASM engines. Compare semantic identities, relationship directions and projected view membership. Record the fixture and engine revision. A mocked worker or canned JSON cannot establish runtime parity. */
        objective acceptance {
            verify SyspresentRequirements::CanvasAuthoring::runtimeParity;
            verify SyspresentRequirements::Audience::staticHosting;
            verify SyspresentRequirements::Reuse::nativeAuthority;
            verify SyspresentRequirements::Reuse::reuseCanvas;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-011'> focusedTraversalPrototype {
        doc /* With no story, load the fixture, select without moving, explicitly follow engineering context and restore focus history. Confirm route proposals follow actual system relationships, do not shortcut through shared KerML ancestors and respect story scope with explicit additions. Show a proposed route that the author can change and capture. */
        objective acceptance {
            verify SyspresentRequirements::CanvasAuthoring::selectionActions;
            verify SyspresentRequirements::CanvasAuthoring::engineeringJourneys;
            verify SyspresentRequirements::CanvasAuthoring::standaloneExploration;
            verify SyspresentRequirements::RequirementReading::requirementQuestions;
            verify SyspresentRequirements::RequirementReading::traceEvidence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-012'> transitionPrototype {
        doc /* Demonstrate direct gather/fade/reflow within one notation and a GV engineering journey that gathers destination features before entering another notation. Inspect correspondence and native semantic meaning at every stage. Reduced-motion controls must expose the same final content; full notation support and multi-region composition remain separate acceptance work. */
        objective acceptance {
            verify SyspresentRequirements::CanvasAuthoring::transitionKinds;
            verify SyspresentRequirements::Views::crossViewIdentity;
            verify SyspresentRequirements::StoryExperience::purposefulMotion;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-013'> occupiedPanelPrototype {
        doc /* Render a measured Markdown panel and a diagram on wide and narrow viewports. Confirm diagram content accounts for the panel's occupied region, each scene may relayout, and the settled panel remains steady while read. Explicit exploration collapses narrative; Return to scene restores it. */
        objective acceptance {
            verify SyspresentRequirements::StoryExperience::responsiveLayout;
            verify SyspresentRequirements::StoryExperience::stableScenes;
            verify SyspresentRequirements::StoryExperience::explorationHandoff;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-014'> sceneCapturePrototype {
        doc /* Capture an explored viewpoint into a scene referencing an authored SysML view; export Markdown and associated portable-project files, reload them and compare native view selection and presentation content. Report the exact format subset exercised. This prototype does not establish all-folder/ZIP round-trip support. */
        objective acceptance {
            verify SyspresentRequirements::Authoring::markdownSource;
            verify SyspresentRequirements::CanvasAuthoring::staticEditor;
            verify SyspresentRequirements::CanvasAuthoring::portableProject;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-015'> publicationBoundaryPrototype {
        doc /* Resolve references in a captured scene and saved journey; report deliberately broken targets. Distinguish hidden view context from explicitly omitted publication content. Retain and hash-check the original snapshot after an updated publication. Deep change adjudication is not required. */
        objective acceptance {
            verify SyspresentRequirements::CanvasAuthoring::basicRebuildValidation;
            verify SyspresentRequirements::CanvasAuthoring::publicationCoverage;
            verify SyspresentRequirements::Snapshots::frozenSnapshot;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }

    verification def <'SV-016'> landingAndDiscovery {
        doc /* Open the landing page at phone and landscape sizes without starting a demo or semantic worker. Select each packaged demo. Import plain SysML files, a multi-file folder and a manifest-free ZIP, discover their native roots and views, explore without a story, export compact v2 and reopen. Confirm native parse diagnostics for missing dependencies, safe archive paths and duplicate-name errors, previous-project recovery, publisher-trusted indexes and portable v1 project compatibility. Confirm immutable snapshot assets remain unchanged. Software checks do not establish arbitrary-model or physical-device usability acceptance. */
        objective acceptance {
            verify SyspresentRequirements::CanvasAuthoring::landingAndImport;
            verify SyspresentRequirements::CanvasAuthoring::discoveredProjectMetadata;
            verify SyspresentRequirements::CanvasAuthoring::portableProject;
            verify SyspresentRequirements::CanvasAuthoring::standaloneExploration;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-017'> automaticOverview {
        doc /* Load reordered native project graphs with multiple roots, wrapper packages, disconnected branches, duplicated relationships, dense library definitions and ownership cycles. Check deterministic bounded branch selection, native scope and endpoint preservation, child and distinct-neighbor counts and disclosure. Confirm authored entry precedence; select without movement, expand contents and restore exact overview/camera with Back. Inspect large-model startup and phone/desktop readability separately from reader acceptance. */
        objective acceptance {
            verify SyspresentRequirements::InitialOverview::structuralProminence;
            verify SyspresentRequirements::InitialOverview::overviewExploration;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-019'> packageWorkspace {
        doc /* Use an unrelated native-owner fixture and the Gorge challenge package. Check nested and empty packages, ownership cycles, misleading qualified-name prefixes, external typing and dependencies. Select without moving, search within scope, inspect excluded-link disclosure and switch native view types without a story. Confirm crossing native views are rejected atomically without trimming, stale responses cannot replace newer navigation, and Up, Whole project, Back, Forward and scene return restore the correct package, native view and camera. Inspect desktop and narrow layouts separately from reader acceptance. */
        objective acceptance {
            verify SyspresentRequirements::PackageExploration::packageWorkspace;
            verify SyspresentRequirements::PackageExploration::standaloneViewNavigation;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-018'> storyPublishing {
        doc /* Round-trip chapters, figure bytes, evidence metadata and native links through Markdown/ZIP. Reject missing assets, unsafe paths, unresolved/ambiguous model targets, conflicting chapters and incomplete run context. Exercise direct links, publication mismatch, contents, browser history and edited-project sharing. Confirm stationary semantic selection, hidden-target disclosure, explicit exploration/return, figure enlargement and narrow-screen tabs. Inspect desktop/mobile layout and assess representative-reader comprehension separately. */
        objective acceptance {
            verify SyspresentRequirements::StoryPublishing::chapterNavigation;
            verify SyspresentRequirements::StoryPublishing::figureRegions;
            verify SyspresentRequirements::StoryPublishing::narrativeLinks;
            verify SyspresentRequirements::StoryPublishing::contextualEvidence;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
    verification def <'SV-020'> conversationalExploration {
        doc /* Exercise complete native ownership pagination/search and attribute/part compartments, isolated/contextual package navigation, part effective requirements with collapsed native path inspection, and explicit local/global overrides. Submit consecutive explicit questions and confirm exactly one native slide per submission with none from browsing. Compile captured definitions, round-trip ZIP and rerender after source changes. Reject unsupported captures without mutation. Check focused context/emphasis exclusion and supported manual movement with peer stability, native edge identity/direction and collision rejection. Check typed rollup counts against actual native identities and repeated occurrences, scope-checked drilldown and graph isolation. Exercise portable layout source/ZIP roundtrip, changed geometry and missing-identity diagnostics, rigid groups and native ports. Validate offline and mocked authoring, native filter membership, stale/rejected candidates, fresh rational constants/documentation and publication failures on incompatible bindings. Inspect supported focused productions against official OMG notation and explicitly report remaining unsupported families. Live provider generation and full notation acceptance require separate authorization and evidence. */
        objective acceptance {
            verify SyspresentRequirements::ConversationalExploration::completeHierarchy;
            verify SyspresentRequirements::ConversationalExploration::partUnderstanding;
            verify SyspresentRequirements::ConversationalExploration::scopedContextChoice;
            verify SyspresentRequirements::ConversationalExploration::relationshipAggregation;
            verify SyspresentRequirements::ConversationalExploration::explicitQuestionSlides;
            verify SyspresentRequirements::ConversationalExploration::reusableNativeCapture;
            verify SyspresentRequirements::ConversationalExploration::focusedNotation;
            verify SyspresentRequirements::ConversationalExploration::manualLocalLayout;
            verify SyspresentRequirements::ConversationalExploration::groundedAuthoring;
            verify SyspresentRequirements::ConversationalExploration::portableLayoutIdentity;
            verify SyspresentRequirements::ConversationalExploration::freshNarrativeBindings;
            verify SyspresentRequirements::ConversationalExploration::inspectableNotationCoverage;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }

    verification def <'SV-021'> nativeModelMemory {
        doc /* Preserve pre-fix engine and source hashes, then compare fresh single-model declaration export, current plus candidate export and the actual edited Blue Dog append/reload path. Record WASM buffer bytes, allocated Go heap, post-collection retained heap, acquired arenas and model counts separately. Compare exact declaration objects and ordered collection values before and after optimization, including cross-document references, libraries, parallel relationships and primitive values. Repeat candidate validation, append, same-worker ZIP reload and fresh-worker ZIP import; confirm native attribute refresh, original system-source bytes and a bounded retained-model count. Exercise failed and stale loads, same-hash leases, submitted requests and resize-replaced initial layouts without losing the previous model. Software memory measurements apply to the exercised engine, sources and browser, not arbitrary project or physical-device limits. */
        objective acceptance {
            verify SyspresentRequirements::ConversationalExploration::nativeModelLifecycle;
            verify SyspresentRequirements::ConversationalExploration::reusableNativeCapture;
            verify SyspresentRequirements::ConversationalExploration::freshNarrativeBindings;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }

    verification def <'SV-022'> startupFeedbackAndPerformance {
        doc /* Measure actual public cold/warm starts and a paired local before/after payload under documented network/page-CPU and cache conditions. Record compressed/decoded transfer sizes, worker initialization, native parse/export/render, main-thread long tasks and first usable render. Check visible and accessible indeterminate/native stages, trustworthy byte/file/view counts, delay and long-running notices, no completion before a settled view, modal feedback, asset/worker failures, single retry, cancellation, repeated choices and stale responses. Preserve previous-project recovery, source/ZIP bytes, cache invalidation, model leases, relationship routing and updated Blue Dog/Gorge navigation. Report physical Safari as untested unless exercised on an actual device. */
        objective acceptance {
            verify SyspresentRequirements::StartupExperience::truthfulLoadingFeedback;
            verify SyspresentRequirements::StartupExperience::measuredStartupPath;
            verify SyspresentRequirements::ConversationalExploration::nativeModelLifecycle;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }

    verification def <'SV-023'> completeDefaultContents {
        doc /* Compare exact expected native immediate-child identities with active keyboard-accessible canvas tiles for zero, one, five, six, 90, 173 and 463 children plus all source ownership roots. Include attributes, port declarations, connections, metadata and unnamed satisfaction declarations. Directly typed definition declarations retain native owners and explicit typing. Exercise guided Explore handoff, isolated/contextual scope, repeated actions, narrow resize, pan/zoom and Back/Forward without truncation. Check readable widths, stationary selection, cancellation, frame provenance and exact peer edge identity/direction. Freeze bundled Blue Dog bytes independently of source-repository changes. Declaration cards are exploratory; reject unsupported focused rendering rather than omit declarations. */
        objective acceptance {
            verify SyspresentRequirements::InitialOverview::structuralProminence;
            verify SyspresentRequirements::InitialOverview::overviewExploration;
            verify SyspresentRequirements::ConversationalExploration::completeHierarchy;
            verify SyspresentRequirements::ConversationalExploration::partUnderstanding;
            verify SyspresentRequirements::PackageExploration::packageWorkspace;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }

    verification def <'SV-024'> canonicalNamespaceImport {
        doc /* Verify committed upstream identity and all 21 model payload hashes before replacing the 76 obsolete project documents. Compare before/after native declarations with the same compiler, applying the authoritative namespace map to identities, kinds, owners, types and generalizations. Report projection exclusions and source-import plumbing separately. Validate 21 payload roots and 111 payload packages independently of viewer packages and unanchored metadata. Resolve every authored view, current model link and narrative binding; retain historical figure/run provenance. Check exact complete immediate-child sets through hierarchy, scopes, native views, Back/Forward and phone widths. Capture a real native view, export/import ZIP and compare all source bytes. Run product/publication tests, native contracts/specification/parity and verify successful CI, deployed commit and public asset hashes. These are software/model-import checks, not physical analysis acceptance or physical Safari evidence. */
        objective acceptance {
            verify SyspresentRequirements::Authoring::strictBuild;
            verify SyspresentRequirements::Snapshots::frozenSnapshot;
            verify SyspresentRequirements::ConversationalExploration::completeHierarchy;
            verify SyspresentRequirements::PackageExploration::packageWorkspace;
            verify SyspresentRequirements::PackageExploration::standaloneViewNavigation;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }

}
