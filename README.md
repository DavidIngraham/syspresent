# Syspresent

Self-guided engineering stories and focused model exploration, authored in Markdown and grounded in SysML. Planned as a reusable static application, with live presentation support to follow.

This repository currently contains the product specification, not an implemented viewer. Blue Dog is the first engineering example, not a dependency of the generic UI.

## Specification

- [Requirements](model/requirements.sysml): 46 owner-agreed requirements with release scope.
- [Architecture](model/architecture.sysml): logical responsibilities, snapshot/catalog separation and conceptual data contracts.
- [Verification](model/verification.sysml): nine planned cases linked to requirements; every verdict remains inconclusive.
- [Decisions](model/decisions.sysml): recorded boundaries, deferred work and open design choices.
- [Integration plan](docs/integration.md): reuse of OpenSysML and staged implementation.
- [Research basis](docs/research-basis.md): evidence informing the interaction design and limits of that evidence.

Use a native OpenSysML CLI to validate the model:

```sh
python3 scripts/validate_spec.py --sysml /path/to/sysml
```

The initial baseline was validated with DavidIngraham/OpenSysML revision `23ca2e2f0f1fae4da6bc3e1488951cb017ed43e2`. The included GitHub Actions workflow builds that exact compiler revision and runs this validation command. No browser implementation or Pages deployment is included yet. Successful parsing does not establish product acceptance.

## Intended experience

Readers scroll prose alongside stable diagram scenes, branch into the frozen model snapshot, and explicitly resume the story. Native structural and behavioral views preserve their notation. Prepared figures and tables support the argument. Reviews conclude with supported findings, remaining gaps and decisions or next actions.

Published snapshots remain immutable. A separate catalog can mark them draft, current, superseded or withdrawn. A later authored timeline explains model evolution without mixing newer facts into historical reviews.

## First examples

1. Blue Dog avoidance and recovery: requirements, behavior, shared failures, DFMEA and a prepared plot.
2. A small familiar system introducing core SysML v2 and OMG standard domain-library notation. The exact example system remains to be selected.

Repository license and third-party packaging will be established before reusing source code; public availability alone does not grant reuse rights. No third-party implementation has been copied into this repository.
