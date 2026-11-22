# Specification validation record

## 22 November 2026 compiler upgrade

The native compiler pinned in [`dependency.json`](../scripts/wasm-prototype/dependency.json)
validates all four product packages without errors at
`5578dbc8b56b4f892d9cbf3fd137a1a0cb52cf9c` (Go 1.27.4).
The model and its verification verdicts are unchanged. See
[the paired-engine checks](../scripts/wasm-prototype/README.md) and
[the memory regression record](native-memory-validation.md).

## Original specification baseline

Baseline: 17 October 2026.

Native OpenSysML validation passed for all four model files using revision `23ca2e2f0f1fae4da6bc3e1488951cb017ed43e2`. The validation checks syntax and native semantic consistency; it does not demonstrate the intended product behavior.

A separate read-only agent reviewed the specification against the agreed requirements and found no blocking omission. Its two clarifications were incorporated: model views are optional for story stops, and an unsupported-view notice does not waive first-release view support. The reviewer did not run validation; the coordinating agent reran native validation after the edits.

All nine product verification cases deliberately return inconclusive. No application code, reader study, live presenter mode or Pages deployment has been completed by this baseline. CI validation is configured; its remote result is not claimed by this local record.
