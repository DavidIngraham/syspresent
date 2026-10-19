# Model organization

The model owns requirements, assumptions, rationale and analysis contracts. [Documentation](../docs/index.md) explains methods and presents native views of these definitions.

| Scope | Responsibility |
| --- | --- |
| `missions/` | Independent Trans-Gorge challenge |
| `vehicle/` | Blue Dog requirements, architecture, use cases, allocations, verification plans and decisions |
| `libraries/` | Reusable marine, energy and structural calculations without Blue Dog dependencies |
| `analyses/` | Project analysis cases and bindings to library calculations |
| `configurations/` | Named reference designs, assumptions and illustrative inputs |
| `evidence/` | Model projection of recorded evidence with explicit acceptance status |

## Conventions

Keep requirement documentation to one concise obligation. Put normative qualification context in named `comment conditions` and explanation in `comment notes`. Use standard `ModelingMetadata::Rationale`, `Issue` and `StatusInfo` metadata for justification, unresolved decisions and maturity; maturity is not a verification verdict.

Use `#derivation` for acceptance obligations derived under their parent's conditions. Use standard `#refinement dependency` when a source makes its target more precise. Plain dependencies express motivation or design choices and need rationale. Owner constraints need not be derived from mission success.

Use `verify` for verification cases and `satisfy` for intended design allocations. Planned procedures and unaccepted evidence must remain inconclusive. Executable predicates reuse model calculations; numerical search is orchestrated by SciPy. External geometry and aerodynamic data retain provenance.

Reusable library interfaces expose named design properties. Numerical adapters currently use documented SI scalar conventions and vector conversion calculations; this is not full dimensional type checking.

View definitions belong in the [authored Markdown](../docs/reference/authoring.md). Native document queries supporting publication live under `tools/publishing/`. Generated diagrams and pages are build outputs, not hand-maintained copies of the model.

### OOSEM

Use native OOSEM roles and views for context, logical responsibilities, physical elements and scenarios. `vehicle/method.sysml` records package roles, scenario-to-use-case refinements and allocations. Keep logical sequences distinct from executable controllers and physical test evidence. Requirement package classification does not require inventing direct parent derivations for every requirement. The running OOSEM maturity assessment distinguishes model coverage from supporting virtual and physical evidence.
