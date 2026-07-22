# Prompt 18 Teo Guide orchestration report

Date: 2026-07-22  
Decision: **PASS**  
Tool-Orchestration Gate: **PASS**  
Prompt 19: **UNLOCKED FOR SEPARATE OWNER AUTHORIZATION; NOT STARTED**

## BRANCH AND COMMITS

```text
Branch: recovery/visual-source-of-truth
Starting commit: b4262aa29c8de96a27c1553ba597849192f0b97c
Final implementation and locked-gate commit: 89fc1318c54622cc98b520fc0b298a226b54c9db
Final reporting commit: the commit containing this report; its exact hash is reported in the handoff because a commit cannot contain its own hash
Worktree: clean at the locked-gate commit; required clean again after the reporting commit
Lineage: PASS — the final implementation is a descendant of the authorized starting commit
```

Focused commits:

- `94f62a5` — characterize the retained deterministic Teo Guide responses.
- `107fd49` — add the deterministic orchestration service and fixed registry.
- `9aab3e4` — connect the approved view to the server-owned boundary.
- `200a0e2` — add the orchestration safety gate and regression coverage.
- `b2fe2f6` — document the orchestration boundaries.
- `657209e` — harden ownership and action-proposal contracts.
- `3ed82ef` — close the action and follow-up contracts.
- `89fc131` — make the CommonJS verifier lint-clean.

## FILES CHANGED

Forty-four tracked files changed from the authorized start, including this report. They are limited to nonvisual configuration, Teo Guide domain/server/API/controller code, privacy-safe telemetry, tests, fixtures, verification, and documentation:

```text
.env.example
docs/architecture/adr/ADR-002-deterministic-teo-guide-orchestration.md
docs/architecture/teo-guide-action-proposals.md
docs/architecture/teo-guide-orchestration.md
docs/architecture/teo-guide-tool-registry.md
docs/operations/teo-guide-errors-and-timeouts.md
docs/operations/teo-guide-observability.md
docs/privacy/teo-guide-conversation-retention.md
docs/privacy/teo-guide-data-flow.md
docs/privacy/teo-guide-memory-usage.md
docs/product/teo-guide-action-proposals.md
docs/product/teo-guide-follow-up-policy.md
docs/product/teo-guide-response-contract.md
docs/recovery/legacy-removal-ledger.md
docs/recovery/prompt-18-teo-guide-orchestration-report.md
docs/safety/teo-guide-prompt-injection-policy.md
docs/safety/teo-guide-tool-authorization.md
docs/safety/teo-guide-write-safety.md
docs/testing/teo-guide-orchestration-acceptance.md
package.json
scripts/recovery/verifyTeoGuideOrchestration.cjs
src/app/_teo-guide/TeoGuidePageController.tsx
src/app/api/teoyube/teo-guide/actions/route.ts
src/app/api/teoyube/teo-guide/conversations/[conversationId]/route.ts
src/app/api/teoyube/teo-guide/route.ts
src/config/environment.ts
src/domain/teo-guide/deterministic-planner.ts
src/domain/teo-guide/orchestration-contracts.ts
src/domain/teo-guide/teo-guide-client-dto.ts
src/domain/teo-guide/tool-contracts.ts
src/features/teo-guide/application/teo-guide-client-response.ts
src/server/observability/privacy-safe-events.ts
src/server/teo-guide/action-proposal-repository.ts
src/server/teo-guide/conversation-repository.ts
src/server/teo-guide/deterministic-orchestrator.ts
src/server/teo-guide/request-context.ts
src/server/teo-guide/tool-registry.ts
tests/build-foundation/environment.test.ts
tests/build-foundation/remaining-retained-contracts.test.ts
tests/build-foundation/teo-guide-characterization.test.ts
tests/build-foundation/teo-guide-orchestration.test.ts
tests/e2e/teo-guide-orchestration.spec.ts
tests/fixtures/teo-guide/legacy-deterministic-responses.json
tests/visual/parity/remaining-retained-parity.spec.ts
```

## TOOLCHAIN

```text
Node: v24.18.0
npm: 10.2.4 through C:\Program Files\nodejs\npm.cmd
package-lock changed: NO
```

No dependency or provider SDK was added. The host npm installation was restored to the repository-required 10.2.4 before authoritative checks; no version check or environment flag was bypassed.

## ORCHESTRATION

```text
Orchestration version: teo-guide-orchestration-2026-07-22.1
Response-contract version: teo-guide-structured-response-2026-07-22.1
Intent taxonomy/planner version: teo-guide-deterministic-planner-2026-07-22.1
Tool registry version: teo-guide-tools-2026-07-22.1
Authorized tool count: 13
Unknown tool executions: 0
Plan determinism: PASS — fixed normalized input and versions produce the same plan and response
Maximum tool calls: 5 per turn
Total timeout: 10,000 ms
Input limit: 8,000 characters
Conversation limit: 20 turns / 100 in-memory conversation records
Tool-output limit: 24,000 characters
Response-source limit: 12
Proposal expiry: 15 minutes
```

Authorized tools:

```text
searchScripture
getScriptureContext
searchPromises
getPromiseCluster
getCurrentJourney
proposeJourneyAction
getCallingEvidence
buildPrayerOptions
searchApprovedUserMemory
summarizeReflectionPattern
createJournalDraft
createTestimonyDraft
createMentorDiscussionPrompt
```

The taxonomy covers Scripture lookup/context, promise discovery/cluster, journey help/daily action, calling reflection, prayer, memory inspection/summary proposal, reflection, journal/testimony/Book candidates, mentor prompts, sensitive and crisis support, product help, and ambiguity. Repository names `mentor_prompt` and `sensitive_topic` are the documented equivalents of the prompt's `mentor_discussion` and `sensitive_support` labels.

## TOOL RESULTS

```text
Source completeness: PASS — every exercised response and tool result has inspectable source paths, authority, and versions
Confidence/limitations completeness: PASS
Dataset-version completeness: PASS
Consent-scope completeness: PASS — present on tool results; authenticated tools require effective purpose consent
Schema validation: PASS — strict input/output schemas; malformed and unknown tools are rejected
Timeout behavior: PASS — per-tool timeout yields a typed, privacy-safe fallback
Partial-result behavior: PASS — unavailable/blocked/timeout tools disclose limitations without fabricated data
```

All 13 tools are fixed, server-owned, deterministic, schema-validated, bounded, and read-only with respect to product state. No tool may invoke an arbitrary tool, path, query, provider, or dynamic user-supplied name.

## SAFETY

```text
Prompt 17 Gate A: PASS — 64/64 fixtures
Prompt 17 Gate B: CLOSED_LIVE_AI_DISABLED
Safety artifact SHA-256: 65943d102556d1af6e009621c99189fbccda0f881ceb2b67c62865a68f2f03dd
Critical response ordering: PASS — immediate safety guidance precedes Scripture; ordinary spiritual tools are skipped
Prohibited claims: 0 violations
Prompt injection: 0 tool-policy bypasses
Memory authorization: PASS — session, purpose, consent, and ownership enforced
Tool authorization: PASS — fixed allowlist, intent, safety mode, limits, and consent enforced before execution
Pre-write authorization: PASS — separate session, CSRF, consent, purpose, owner, source, revision, and idempotency checks
Crisis resource behavior: PASS — verified policy output or generic local-emergency fallback
Deterministic fallback: PASS
```

Pre-retrieval safety remains authoritative, tool results are treated as untrusted data and schema-validated, post-composition validation remains mandatory, and stateful confirmation is reauthorized separately. No chain-of-thought, system instruction, secret, stack trace, private source text, or raw memory is returned.

## WRITE SAFETY

```text
Action proposals: PASS — typed preview, sources, required consent, revision, expiry, reversibility, and undo policy
Silent memory writes: 0
Silent journey advances: 0
Automatic calling declarations: 0
Automatic testimony publications: 0
Automatic promise fulfillment: 0
Explicit confirmation: PASS — a separate authenticated request is required
Idempotency/expiry/undo: PASS — replay is stable, conflicting replay/stale revision fails, expiry and undo metadata are enforced
Durable writes performed by Teo Guide: 0
```

Confirmation authorizes an explicit application action and records privacy-safe audit hashes; it does not itself perform a durable journey, memory, journal, testimony, Book, fulfillment, calling, consent, deletion, or contact write. Those executors remain outside Prompt 18.

## SCRIPTURE AND TIG

```text
WEB citation validation: 100%
Fabricated citations: 0
WEB corpus: 66 books / 1,189 chapters / 31,103 source markers / 31,098 displayable verses
TIG source/explanation: PASS — canonical deterministic TIG service, source path, confidence, and limitations retained
Search/Promise Search distinction: PASS
Journey provenance: PASS — journey ID, revision, stage, Scripture sources, and reversible proposal metadata retained
```

Exact quotation is returned only by the canonical local WEB repository. Scripture, context, Teoyube interpretation, prayer language, possible application, TIG explanation, and user-approved records remain distinct.

## MEMORY

```text
Consent-aware reads: PASS
Revoked/deleted memory: excluded; revocation browser regression PASS
Cross-user isolation: PASS — 0 accesses
Conversation retention: bounded, metadata/fingerprint only; raw user text stored: NO
Memory inspection/deletion: authenticated owner-only inspect/delete boundary PASS
Raw sensitive telemetry: 0
Automatic long-term memory creation: 0
```

Without authorized durable consent, orchestration continuity is session-only. The orchestrator receives only the smallest structured context supplied by the Prompt 16 server boundary; it does not replay journals, prayers, testimony, or raw conversations.

## RESPONSE CONTRACT

```text
Scripture section: PASS — exact WEB text and citation only
What-text-says/context section: PASS
Interpretation section: PASS — explicitly Teoyube interpretation with humble wording
Prayer section: PASS — editable devotional language, separate from Scripture
Practical-step section: PASS — suggestion, never divine command
Trusted-person section: PASS — mentor/community/professional support preserved where relevant
Why-suggested section: PASS — sources and deterministic explanation
Limitations section: PASS — uncertainty and missing/blocked tools disclosed
Follow-up policy: PASS — at most one focused question; no sensitive disclosure required; safe decline/fallback
Every exercised response sourced: 100%
Every exercised recommendation explainable: 100%
```

The approved client receives only a narrow DTO. Existing message, details, source/explanation, loading, error, and action structures are reused; internal tool names are not presented as spiritual authority.

## UI AND PERFORMANCE

```text
Protected visual files changed: 0
CSS changes: 0
DOM/class changes: 0
Asset changes: 0
Immutable baselines changed: 0
Owner-approved support baselines changed: 0
Owner-approved Scripture-delta baselines changed: 0
Visual parity: PASS — 35/35 tests per run; 105/105 total
DOM/class parity: PASS
Asset parity: PASS
Functional parity: PASS
Accessibility/focus: PASS — 0 mismatches across 216 cells
Three-run performance gate: PASS — 216/216 cells, 3 consecutive runs, 5,000 ms unchanged threshold
Run 1 maximum readiness: 3,334.2 ms
Run 2 maximum readiness: 3,377.3 ms
Run 3 maximum readiness: 3,281.8 ms
Workspace size before: 1,704,740,600 bytes
Workspace size after audited cleanup, before this small report: 1,708,995,027 bytes
Measured workspace size after adding this report, before its evidence commit: 1,709,010,695 bytes
Measured net growth at that point: 4,270,095 bytes / 4.07 MiB
Temporary artifacts cleaned: YES — 61,771,903 bytes of audited reproducible passing output
Compact resumable-gate evidence retained: 13,900,241 bytes
Listeners/processes closed: YES — 0 Prompt 18 test-era Node processes; 0 listeners on 3100, 3116, 3183, 4173, or 4183
```

Locked gate identity:

```text
Git commit: 89fc1318c54622cc98b520fc0b298a226b54c9db
Audit SHA-256: 30e6e77730fa179e4b11b930bbd3365a588d186e6d527c7f8560bb3e768a3f8c
Visual baseline SHA-256: a9e3e8f8e746a179048fef14c987ef3b87a7676711fa227074958066b5234429
Visual contract SHA-256: f97a216794536d43dfec03f67df582a4521d1874b467ead81097b2cd9dca7c53
Static build SHA-256: a92d815805e93ba9e19874123713cd9fbef2cbdf282230d896e533891f140f0a
Next build SHA-256: 0df08c7e9554f3318e0302b564676468023d2cec828cb5e13a5f2a378ced00cc
Run 1 performance SHA-256: 08debaf87d46bc7cae98221a519c4c327e09037b5f72470ac97008bf26e7bbdc
Run 1 parity SHA-256: 57545d18c953cdc970516cb1c4d4afe07b7427256c20c73d23fdf4955d43be40
Run 2 performance SHA-256: 8eab39241e6edb092eac65af1c70e954149db835622942f946d1f87f97d1c3ef
Run 2 parity SHA-256: b51e859893fb47d305edd922a9bbfc37002cbb2af5e84c94564d6ec211f020cd
Run 3 performance SHA-256: aa920230ad94425e89a08e07129a2584abe593c231f4a75f2befd57f81026af3
Run 3 parity SHA-256: 0f75ffb730712f9223a4129555c86363f8074ebe6fbe8bd83ef26973e064b524
```

Passing candidate screenshots, traces, and reports were deleted after their hashes and compact results were recorded. Baseline roots were never written. The final workspace growth is far below the 250 MiB stop threshold.

## REGRESSIONS

```text
Prompt 13: PASS — both complete guided-journey browser flows pass
Prompt 14: PASS — TIG seed/import contract, deterministic consumers, and 39-chunk client boundary pass
Prompt 15B: PASS — corpus, exact quotation, content-delta, quarantine, citation, and client boundary pass
Prompt 16: PASS — 21-file security boundary, memory lint, and 3/3 fresh-server browser tests pass
Prompt 17: PASS — verify/evaluate/orchestration; Gate A 64/64; Gate B closed
Prompt 17S: PASS — current 216-cell three-run locked gate
Recovery: PASS — 268 protected sources, 210 visual files, 72 screenshots, 12 DOM snapshots, support and Scripture overlays
Build: PASS — Next 16.2.10 production preview build; client bundle guards pass
Typecheck: PASS
Lint: PASS
Unit: PASS — 21 files / 169 tests
Focused Teo Guide: PASS — 2 files / 49 tests, including 4 legacy characterization fixtures and all 19 intents
Browser: PASS — 9/9 standard E2E, 3/3 memory E2E, and 3 × 35 parity tests
Security: PASS — safety, memory, tool, CSRF, ownership, prompt-injection, provider/network, and bundle boundaries
```

## RUNTIME

```text
Static runtime: CANONICAL — npm start remains node --preserve-symlinks-main server.js
Next runtime: PREVIEW ONLY — app:start remains next start
Live model connected: NO
Provider SDK imported: NO
External Teo Guide provider: DISABLED
Embeddings: DISABLED
Vector retrieval: DISABLED
Broad RAG: DISABLED
Gate B: CLOSED_LIVE_AI_DISABLED
```

## KNOWN LIMITATIONS

- Teo Guide remains deterministic and local/server-owned; no live composer, model planner, embeddings, vector retrieval, broad RAG, or external knowledge source exists.
- Action confirmation produces an authorization/audit decision only; Prompt 18 intentionally connects no durable product-state executor.
- Conversation continuity is process-local metadata unless a later separately authorized phase integrates a reviewed Prompt 16 repository path.
- The WEB archive's PGP signature remains unverified under the owner's Prompt 15B exact-archive residual-risk decision.
- The local Windows Chromium performance result is gate evidence, not a production multi-region SLO.
- The historical Phase 11.6C.3 publication-integrity blocker remains unchanged and separate.

## RESULT

```text
Prompt 18: PASS
Tool-Orchestration Gate: PASS
Owner approval required: NO
Prompt 19 unlocked: YES — eligible for separate owner authorization; not begun
Next gate: PASS
Rollback: git revert --no-commit b4262aa29c8de96a27c1553ba597849192f0b97c..HEAD, review the inverse diff, then commit the rollback
```

Prompt 19, a live model, runtime cutover, external persistence expansion, embeddings, vector retrieval, broad RAG, CSS consolidation, baseline replacement, Scripture corpus replacement, route consolidation, and archive deletion were not implemented.
