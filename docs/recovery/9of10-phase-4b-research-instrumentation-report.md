# Teoyube 9/10 Phase 4B research instrumentation report

Executed: 2026-08-04T23:53:18.8235769-04:00
Program: Teoyube 9/10 Implementation Program
Selected phase: **Phase 4B — Privacy-safe research instrumentation**

## Program result

| Field | Result |
| --- | --- |
| Previous status | READY |
| Final status | **PASS** |
| Phase 4 overall | **IN_PROGRESS** |
| Phase 4C | **READY — NOT STARTED** |
| Program overall | **IN_PROGRESS** |
| Phase 2A | **BLOCKED** |
| Phase 3 | **WAITING_OWNER** |
| Phase 4A | **PASS** |

Phase 4C may begin only through a separate explicit owner start and the approved consent/operator process. This phase recruited nobody, ran no participant session, created no actual participant record, and made no paid provider call.

## Branch and commits

| Field | Value |
| --- | --- |
| Branch | `recovery/visual-source-of-truth` |
| Starting commit | `24cbea9965daf998c31ba73e52a3948d53701e26` |
| Instrumentation commit | `79bcfbc9e754aeb56beebe697a6cb5e7b77d1909` |
| Test/security commit | `45a6b6138eae95be8b180c09a533ddda306ef5b0` |
| Documentation/final commit | `FINAL_PHASE4B_DOCUMENTATION_COMMIT_REPORTED_IN_FINAL_HANDOFF` |
| Pre-phase tag | `teoyube-9of10-phase4b-start-24cbea9` |
| Final worktree | Clean after the documentation commit and final verification |

The canonical runtime remains Next and the protected rollback remains static Node. The runtime owner decision and commands did not change. The runtime manifest received only the deterministic source identity `c84514e0cdccd7ed13e24f7e9515d0c532bf9c77dfd037ae587e2310f7f2a832` / `teoyube-c84514e0cdccd7ed13e24f7e`; runtime ownership changes are zero.

## Research mode

| Field | Result |
| --- | --- |
| Feature flag | `TEOYUBE_RESEARCH_MODE_ENABLED` — server-only |
| Checked-in default | `false` |
| Study allowlist | One synthetic-only study: `teoyube-phase4b-synthetic` |
| Collection authorized | No |
| Normal UI impact | None; no route, component, DOM, copy, CSS, or asset change |
| Static rollback impact | None; research-instrumentation-free |
| External analytics vendor | None |

Disabled mode returns before envelope, consent, storage, or operational telemetry work. The synthetic test proves zero event and zero operational calls. Built client chunks contain zero server research markers.

## Consent

The existing consent ledger now distinguishes:

- `research_participation`
- `research_product_events`
- `research_accessibility_observation`
- `research_optional_recording`
- `research_optional_live_ai_task`
- `research_follow_up_contact`

Participation never implies event, accessibility, recording, live-AI, or follow-up consent. Live AI additionally requires existing `external_ai_processing` consent. Revocation blocks future writes immediately. Participant deletion is idempotent and removes active events and regenerated-export membership. Contact data is not accepted by the event schema and is not stored in the research event repository.

## Events and privacy

| Field | Result |
| --- | --- |
| Registry version | `teoyube-research-events-2026-08-04.1` |
| Study version | `teoyube-formative-pilot-2026-08-04.1` |
| Event count | 66 fixed events |
| Allowed fields | Fixed machine-readable allowlist; ratings bounded to 1–5 |
| Prohibited fields | Recursive denylist plus email, phone, location, credential, token, and multiline-content value patterns |
| Raw spiritual content | 0 |
| Participant contact data | 0 |
| Spiritual score events | 0 |

Unknown event names, unknown fields, free-form payloads, raw Scripture text, raw queries/prompts/model data, prayer/journal/reflection/testimony text, secrets, and spiritual-ranking aliases fail closed.

## Session and storage

The session envelope is HMAC-signed, short-lived, server-authoritative, revocable, study-bound, participant-bound, task-bound, consent-record-bound, and synthetic-only in Phase 4B. It carries no name, email, user ID, owner privilege, or ordinary product write authority.

The local adapter stores encrypted event files under ignored `.var/research/events/`, with exports and deletion receipts under the corresponding ignored subdirectories. Event IDs are append-only, hashes are chained, reads are participant-scoped, cohort exports remain separate, and deletion receipts contain no participant ID. Retention is 180 days for the approved formative-pilot class. Deletion claims cover the active local store only; no unsupported backup-deletion claim is made.

Actual participant records and local research event files after verification: **0**.

## Verification

| Gate | Result |
| --- | --- |
| Clean `npm ci` | PASS — 408 packages; 0 vulnerabilities |
| Lockfile integrity | PASS — `ae274247a9e4e65d1f28466eada2f7b0d39d9118f35d204ab5717d8850885b83` |
| Full / production audit | PASS / PASS — 0 vulnerabilities |
| Mode and consent | PASS |
| Schema and privacy | PASS — all 66 events plus prohibited-key/value adversarial coverage |
| Isolation and integrity | PASS |
| Deletion and export | PASS |
| Product integration and failure isolation | PASS |
| Research tests | PASS — 44/44 |
| Consent/integration tests | PASS — 101/101 |
| Full unit tests | PASS — 361 passed, 1 intentionally skipped, using one worker |
| Typecheck | PASS |
| Research lint / full lint | PASS / PASS |
| Build | PASS — 58 pages generated; server boundary checks PASS |
| Security | PASS — 18 controls; critical/high 0 |
| Supply chain | PASS — 490 components |
| Telemetry/product-value | PASS — 22 events; unsafe artifacts 0 |
| Architecture/imports | PASS — 180 source files / 1,433 import files |
| Client bundles | PASS — 0 research server markers |
| Recovery | PASS — 72 immutable screenshots and 12 DOM snapshots |
| Runtime | PASS — Next canonical; static rollback retained |
| Next browser | PASS for all relevant assertions under serialized execution; 53 passed, 3 static-only skipped; one Today zoom assertion passed on isolated unchanged retry |
| Static rollback smoke | PASS — index and legacy stylesheet 200 on dedicated port 4186 |
| Visual / DOM / class / asset | PASS — protected contracts unchanged |
| Accessibility/focus | No DOM change; existing focus/Axe browser checks pass, including isolated Today 200% zoom retry |
| Performance | Disabled path has zero calls and zero client-bundle delta; synthetic encrypted write 3.576 ms and 1,558 bytes |
| Workspace storage | 3,466,005,717 logical bytes after required clean install and build output |
| Listeners closed | Ports 3000, 3100, and 4186 closed; unrelated port 4173 untouched |

The default 12-worker browser run was not green because machine contention caused broad navigation/test timeouts. The unchanged suite was rerun with one worker: every Phase 4B-relevant route and behavior passed; the sole transient Today 200%-zoom case then passed alone. No assertion, timeout, baseline, or threshold was weakened.

## Changes

Production implementation is limited to server/domain research contracts and adapters plus additions to the existing consent-purpose registry. Operator commands are synthetic-only and dry-run in Phase 4B. Documentation records architecture, registry, dictionary, consent, envelope, retention/deletion, operations, export, security, and acceptance.

| Change class | Count/result |
| --- | --- |
| Product-source PDFs changed | 0 |
| Protected visual changes | 0 |
| CSS changes | 0 |
| DOM/class changes | 0 |
| Asset changes | 0 |
| Baseline changes | 0 |
| Package / lockfile changes | `package.json`: one script group; `package-lock.json`: 0 |
| Runtime ownership changes | 0 |
| Paid provider calls | 0 |

## Exact file inventory

Files changed: **47**.

- `.env.example`
- `.gitignore`
- `config/research-event-registry.json`
- `config/research-field-policy.json`
- `config/research-study-registry.json`
- `config/runtime/canonical-runtime-manifest.json`
- `docs/recovery/9of10-evidence-ledger.json`
- `docs/recovery/9of10-evidence-ledger.md`
- `docs/recovery/9of10-owner-decisions.json`
- `docs/recovery/9of10-owner-decisions.md`
- `docs/recovery/9of10-phase-4b-research-instrumentation-report.json`
- `docs/recovery/9of10-phase-4b-research-instrumentation-report.md`
- `docs/recovery/9of10-phase-history.md`
- `docs/recovery/9of10-program-status.json`
- `docs/recovery/9of10-program-status.md`
- `docs/recovery/9of10-risk-register.md`
- `docs/research/instrumentation-architecture.md`
- `docs/research/phase-4b-starting-manifest.json`
- `docs/research/research-consent-purposes.md`
- `docs/research/research-data-dictionary.md`
- `docs/research/research-event-registry.md`
- `docs/research/research-export-format.md`
- `docs/research/research-instrumentation-acceptance.md`
- `docs/research/research-instrumentation-security.md`
- `docs/research/research-operator-guide.md`
- `docs/research/research-retention-and-deletion.md`
- `docs/research/research-session-envelope.md`
- `package.json`
- `scripts/recovery/verifyResearchInstrumentation.cjs`
- `scripts/research/runResearchCommand.cjs`
- `src/domain/memory/data-classification-registry.ts`
- `src/domain/memory/memory-contracts.ts`
- `src/domain/research/research-contracts.ts`
- `src/domain/research/research-event-registry.ts`
- `src/domain/research/research-event-validator.ts`
- `src/server/research/encrypted-file-research-event-repository.ts`
- `src/server/research/index.ts`
- `src/server/research/in-memory-research-event-repository.ts`
- `src/server/research/research-action-observer.ts`
- `src/server/research/research-aggregate.ts`
- `src/server/research/research-consent-reader.ts`
- `src/server/research/research-event-integrity.ts`
- `src/server/research/research-event-service.ts`
- `src/server/research/research-runtime-config.ts`
- `src/server/research/research-session-envelope-service.ts`
- `tests/build-foundation/consent-aware-memory.test.ts`
- `tests/build-foundation/research-instrumentation.test.ts`

## Current blockers and next gate

| Existing blocker | Status |
| --- | --- |
| Canon focus mismatch | OPEN |
| Calling tablet-portrait performance | OPEN |
| CSS historical budget | OPEN |
| Current three-run 216-cell set | NOT PASSING |

Gate C-Preview is not claimed. Next independent READY choices are Phase 4C, Phase 5A, or Phase 6A. Owner action for Phase 4C: explicitly begin recruitment only through the approved consent-bound participant process.

Rollback:

```powershell
git revert <phase-4b-documentation-commit> 45a6b6138eae95be8b180c09a533ddda306ef5b0 79bcfbc9e754aeb56beebe697a6cb5e7b77d1909
```

Do not remove or rewrite Phase 4A or earlier evidence. Phase 4C was not started.
