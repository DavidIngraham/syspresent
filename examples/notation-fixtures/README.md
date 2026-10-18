# Native notation preservation fixtures

This original desk-fan model tests notation that the simpler flashlight story does not cover. It is a teaching fixture, not a product design or execution trace. Imports are standard `ScalarValues` and OMG `RequirementDerivation`; the verification verdict uses standard `VerificationCases`.

`project.json` targets base revision `23ca2e2f0f1fae4da6bc3e1488951cb017ed43e2`. Its native pseudo-views are:

| ID | Native target | Meaning to preserve |
| --- | --- | --- |
| actions | `#action:DeskFan::StartCycle` | Complementary guards, decision, two-branch fork/join and terminal paths |
| states | `#state:DeskFan::operating` | Outer idle/active boundary and nested accelerating/steady states, including nested initial state |
| sequence | `#sequence:DeskFan::StartupExchange` | Panel/control participants; request, self-check, reply order; control-to-itself message |
| matrix | `#matrix:DeskFan` | Derivation from original to derived requirement, design satisfaction, verification objective and action-to-controller allocation |

Sequence declarations intentionally appear in reverse order. Native event successions establish request → selfCheck → ready. A renderer sorting source declarations would be wrong. The verification verdict is inconclusive, so the presence of a verification link must not imply passage.

Run the durable assertions against the pinned native CLI:

```sh
python3 examples/notation-fixtures/check_native.py --cli /path/to/pinned/sysml
```

Add `--bundle /path/to/fresh/bundle.json` to check the exported native payload's semantic identities, parent boundaries, message order/self-edge and matrix direction. `check_native.py` does not infer these semantics for a viewer; it asserts the expected meaning of this known fixture against native output.

On 17 October 2026, strict validation and all four nonempty text renders passed at the base pin. `native-checks.json` records source digest, exact pseudo-view requests and exit results. The adjacent `*.native.txt` files are captured native output, not handwritten diagrams.

The candidate service `/tmp/syspresent-sysml-grpc` identified itself as `23ca2e2f0-dirty`, and the matching source Python client was used for an additional export. This is distinct from the clean base revision. To repeat an integration-candidate export, load `project.json` in a script, explicitly replace `nativeToolRevision` **in memory** with the exact candidate commit string, and call `scripts.native_export.export(config, fixture_directory)`. Record the returned binary hash and source hashes with the generated bundle; do not relabel a dirty binary as the release pin. System Python lacked `grpc` in this environment, so the existing Blue Dog virtualenv supplied dependencies while `PYTHONPATH` selected the matching source client.

Native render success is not implemented viewer support. Browser drawing, labels, nested boundaries, guards, direction, sequence geometry, accessibility and independent rendered review remain separate checks. No publication or engineering acceptance is claimed.
