# Prompt 23A-R release lineage diagnosis

The Prompt 22 runtime source commit
`52ed7e9530e292f60195f7305a8ec9a476bd7367` is an ancestor of the evidence
commit `7b27e7fbcd4522b66ddd16e4c231ff0a76379514` and final report commit
`b74eb7e5f25b4de1804d89e6ecff0d08b987ffda`.

The source-to-report diff contains seven paths:

| Path | Classification | Finding |
| --- | --- | --- |
| `config/runtime/canonical-runtime-manifest.json` | `RUNTIME_MANIFEST_METADATA` | Final decision, identity, build, tag, timestamp, and gate-result metadata only; runtime contract passed |
| `docs/architecture/adr/ADR-006-owner-controlled-local-runtime-cutover.md` | `REPORT_ONLY` | Decision status narrative |
| `docs/architecture/canonical-runtime.md` | `REPORT_ONLY` | Final owner-confirmation narrative |
| `docs/owner-approvals/runtime/TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24.md` | `OWNER_APPROVAL` | Exact owner runtime decision |
| `docs/recovery/prompt-22-runtime-cutover-candidate.json` | `EVIDENCE_ARTIFACT` | Machine-readable candidate evidence |
| `docs/recovery/prompt-22-runtime-cutover-candidate.md` | `REPORT_ONLY` | Candidate report |
| `docs/recovery/prompt-22-runtime-cutover-report.md` | `REPORT_ONLY` | Final report |

No command, route, API, feature flag, package, lockfile, source, test, visual
asset, stylesheet, baseline, or unknown path changed after the runtime source.
The historical Prompt 22 descendant is therefore eligible for strict
evidence-only reuse after exact hash verification.

Prompt 23A-R itself changes release gate logic and adds gate tests. Those
changes are `GATE_OR_TEST_AFFECTING`, so the repair commit must become a new
runtime-source candidate and receive a complete current no-cost Gate C-Preview
execution. No paid Prompt 19 or Prompt 20 call is required because their
model, prompt, schema, adapter, safety, tool, retrieval, chunking, index,
embedding, and consent dependencies remain unchanged.

Gate C-Production remains closed.
