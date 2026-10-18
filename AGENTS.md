# Working on Syspresent

Read model/requirements.sysml, model/decisions.sysml and docs/integration.md before implementation. The SysML specification owns product obligations. Markdown explains rationale and implementation choices. Update both when agreed decisions change. Do not claim planned features are implemented or verification cases passed without evidence.

## Dependency ownership

Never open, reopen or submit upstream dependency PRs, including drafts, unless David explicitly overrides this rule for that specific PR. Work in his branch/fork first. Dependency contribution instructions do not authorize an upstream PR. Pin dependencies and preserve source/license provenance. No upstream PR is part of routine validation or completion.

## Architecture and reuse

Use native OpenSysML parsing, queries, evaluation and rendering semantics. Do not create a second SysML parser or infer relationships from labels. Reuse its browser rendering modules where the integration spike demonstrates suitability; do not copy the VS Code application or landing-page demo wholesale. Syspresent owns narrative, navigation and presentation policy. Keep Blue Dog names out of generic code.

## Delegation and review

Use focused agents for separable substantial tasks, with explicit owned files, requirements, interface boundaries and checks. Keep small coupled edits local. The coordinator owns integration, cross-view semantics and consistent UX. Shared generated artifacts, mutations and integration checks must be serialized. Agents must not publish or open PRs independently.

After substantive changes, ask an independent agent that did not author them for a read-only review. Resolve material findings and rerun affected checks. Review actual rendered stories for readability and navigation; verify model claims through native tools. Record the review scope and tests actually run. Agent approval does not establish engineering acceptance or permission to publish.

## Validation and publication

Validate specification changes with the native compiler. Product tests must cover relationship direction, semantic identity, hidden context, snapshot immutability and behavior-specific notation, not only screenshots. Keep snapshot status separate from verification and approval. Run the affected build and checks before authorized publication. Confirm deployment dispatch without polling unless David asks to wait.

## Example writing

Use concrete section headings that name the system, component, behavior, requirement or engineering question covered. Avoid generic reading instructions such as “Start with the job” or “Follow the meaning,” and abstract conclusions that could head any example. A reader scanning the outline should be able to predict each section’s content.
