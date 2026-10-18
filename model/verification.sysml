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
        doc /* Exercise forward/backward scrolling, section links, broad settled scene intervals, manual exploration and exact resumption on desktop and mobile. Check keyboard focus, reduced motion and non-hover details. */
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
        doc /* Trace requirement-to-component-to-verification paths; filter and expand in both directions, cross a library boundary, distinguish omitted and unexported neighbors, restore history and reproduce state from a shared URL. */
        objective acceptance {
            verify SyspresentRequirements::Exploration::localContext;
            verify SyspresentRequirements::Exploration::typedFilters;
            verify SyspresentRequirements::Exploration::boundedContext;
            verify SyspresentRequirements::Exploration::freeTraversal;
            verify SyspresentRequirements::Exploration::focusHistory;
            verify SyspresentRequirements::Exploration::shareableState;
            verify SyspresentRequirements::Exploration::detailsAndClaims;
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
        doc /* Build and serve both the Blue Dog acceptance story and unrelated tutorial without modifying viewer JavaScript. Inspect pinned dependencies, native payload preservation, identity mapping, declared bundle coverage and static hosting with no application service. */
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
}
