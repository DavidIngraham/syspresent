# Working on Syspresent

Read model/requirements.sysml, model/decisions.sysml and docs/integration.md before implementation. The SysML specification owns product obligations. Markdown explains rationale and implementation choices. Update both when agreed decisions change. Do not claim planned features are implemented or verification cases passed without evidence.

## Dependency ownership

Never open, reopen or submit upstream dependency PRs, including drafts, unless David explicitly overrides this rule for that specific PR. Work in his branch/fork first. Dependency contribution instructions do not authorize an upstream PR. Pin dependencies and preserve source/license provenance. No upstream PR is part of routine validation or completion.

## Architecture and reuse

Use native OpenSysML parsing, queries, evaluation and rendering semantics. Do not create a second SysML parser or infer relationships from labels. The current canvas architecture uses OpenSysML Go natively and as browser WASM in a worker, behind an explicit semantic/view contract. Syspresent owns its interactive renderer, dynamic layout, transitions, narrative and authoring policy. Do not add dependencies on the VS Code extension source for the new canvas; legacy reuse remains historical implementation, not the target architecture. Keep Blue Dog names out of generic code.

## Validation and publication

Validate specification changes with the native compiler. Product tests must cover relationship direction, semantic identity, hidden context, snapshot immutability and behavior-specific notation, not only screenshots. Keep snapshot status separate from verification and approval. Run the affected build and checks before authorized publication. Confirm deployment dispatch without polling unless David asks to wait.

## Example writing

Use concrete section headings that name the system, component, behavior, requirement or engineering question covered. Avoid generic reading instructions such as “Start with the job” or “Follow the meaning,” and abstract conclusions that could head any example. A reader scanning the outline should be able to predict each section’s content.

## Interface simplicity

Keep the graph canvas primary in standalone exploration and guided stories across all screen sizes. Treat measured Markdown panels as layout occupants. First selection reveals actions without moving the graph; explicit actions drive relayout. Scenes may rearrange freely, while their settled reading state remains stable. Keep the initial experience focused on reading and the model across all screen sizes. Expose exploration tools on request, avoid repeating titles across panes, and give diagrams substantial space. Do not solve general interaction clutter only with device-specific patches.
