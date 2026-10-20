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
        doc /* Open the landing page at phone and landscape sizes without starting a demo or semantic worker. Select each packaged demo. Import plain SysML files, a multi-file folder and a manifest-free ZIP, discover their native roots and views, explore without a story, export compact v2 and reopen. Confirm native parse diagnostics for missing dependencies, safe archive paths and duplicate-name errors, previous-project recovery, publisher-trusted indexes and legacy v1 compatibility. Confirm immutable snapshot assets remain unchanged. Software checks do not establish arbitrary-model or physical-device usability acceptance. */
        objective acceptance {
            verify SyspresentRequirements::CanvasAuthoring::landingAndImport;
            verify SyspresentRequirements::CanvasAuthoring::discoveredProjectMetadata;
            verify SyspresentRequirements::CanvasAuthoring::portableProject;
            verify SyspresentRequirements::CanvasAuthoring::standaloneExploration;
        }
        return verdict : VerificationCases::VerdictKind = VerificationCases::VerdictKind::inconclusive;
    }
}
