# Prompt 20 hybrid retrieval report

Date: 2026-07-23
Scope: Prompt 20 only
Prompt 21: not started

## Branch and commits

Branch: `recovery/visual-source-of-truth`
Starting commit: `f7d63855a0abc2b6e9bd3916392d57eb85d49115`
Embedding contracts commit: `ee6225512371b3c88faccfa4d10d55d6717baa6c`
Indexing/repository commit: `91e4f1e40a8a7c6bb49201122b0a6b442c94068f`
Index finalization commit: `8c7d9ff32006a482360f872c935466a0aa67fd65`
Hybrid retrieval commit: `91e4f1e40a8a7c6bb49201122b0a6b442c94068f`
Consent-aware memory commit: `1fe1bbe34eb35f704a2902fb6bad5fa4a45ef070`
Evaluation/gate commit: `927a362fe67e854f8ee4951a1dd333b720d3c444`
Security-patch commit: `91942ec23c66222f1f63a053b4bca3b6e96ba5b7`
Documentation commit: `8b9a94be8cca4a749b5f833a66ff7bee220c06cb`
Resumable-gate reconciliation commit: `816d6c265072771a24d601442eecb2420fb02209`
Evaluation-environment commit: `22812d77cb43fb62fdac8a9196e36b4623fcda65`
Expanded scorecard commit: `d74ff3e`
Final report commit: the commit containing this report; exact full SHA is recorded in the final handoff.
Worktree: clean at final handoff.

## Credential and budget

Credential decision: reused the existing funded-project key from ignored
`.env.local`; no credential was created or rotated in Prompt 20.
Key exposed: NO. The key was never displayed, fingerprinted, logged, or
committed.
Embedding model decision: the owner-authorized default passed; the candidate
was not required.
Default model: `text-embedding-3-small`.
Candidate model: `text-embedding-3-large`, locked and not called.
Model availability: both authorized models were available to the funded
project; legacy `text-embedding-ada-002` remained disabled.
Official price basis: the configured Prompt 20 rate table uses
`text-embedding-3-small` at `$0.02 / 1M` input tokens and
`text-embedding-3-large` at `$0.13 / 1M` input tokens.
Total approved spend: `$1.00`.
Actual indexing spend: the retained paid checkpoint proves `$0.01926196`
through source chunk 31,232. The repaired final checkpoint was a zero-call
cached replay, so an exact terminal provider total cannot be recovered without
inventing data. The paid run remained between that lower bound and the
conservative pre-authorized upper estimate of `$0.04899192`.
Actual evaluation spend: 717 input tokens across five passing evaluation runs
and one two-token diagnostic, estimated at `$0.00001434`. Two disabled-flag
negative-control runs cost zero.
Budget enforcement: `$0.25` public-index, `$0.25` query-evaluation, `$0.50`
candidate-evaluation, and `$1.00` total caps; each paid batch enforced its cap.
Only one automatic full public reindex was authorized.

The separate Prompt 19K provider regression cost `$0.090635`; it is reported
for regression evidence and is not represented as Prompt 20 embedding spend.

## Partitions

Partition count: 11. All partitions are separately identified, trust-labeled,
policy-filtered, and included in the boundary contract.

Scripture: `canonical_scripture`; exact WEB text remains authoritative and is
resolved before semantic retrieval.
Scripture context: `scripture_context`; contextual aids remain subordinate to
canonical Scripture.
Promise Clusters: `promise_clusters`; TIG-connected promise aids with
provenance, not Scripture equivalence.
Lexicon: `lexicon`; Teoyube language aids with explicit source metadata.
Prayer resources: `prayer_resources`; sourced prayer aids, never divine speech.
Theology/safety: `theology_safety`; highest-priority safety and doctrine
constraints.
Journal summaries: `journal_summaries`; user-owned, dual-consent, summary-only.
Testimonies: `testimonies`; user-owned and restricted to user-confirmed records.
Journey: `journey_history`; user-owned continuity artifacts only.
Calling evidence: `calling_evidence`; evidence for discernment, never a final
calling determination.
Product help: `product_help`; Teoyube usage guidance, isolated from spiritual
authority.
Cross-partition contamination: 0 in the locked boundary, trust, and evaluation
checks.

## Index

Vector repository: provider-neutral `VectorRepository` backed by local Node
SQLite for this preview-only phase.
Index path: `.var/retrieval/retrieval.sqlite`.
Tracked/generated: ignored and untracked; no vectors, cache entries,
checkpoints, or generated manifests entered Git or public assets.
Embedding dimension: 1,536.
Chunker versions:
`teoyube-deterministic-chunker-2026-07-23.1` and inventory
`teoyube-public-retrieval-inventory-2026-07-23.1`.
Source chunks: 33,599 raw chunks; 36 exact duplicate lexicon overlaps
excluded.
Vector count: 33,563 unique public vectors.
Index version:
`public:text-embedding-3-small:1536:teoyube-deterministic-chunker-2026-07-23.1:f0669e6f0c1974fc4be7`.
Composite source hash:
`f0669e6f0c1974fc4be742b301e7b3efefdbb0ea367d33b5c7a86ccfeccc7fbe`.
Index size: 296,927,232 bytes, below the 629,145,600-byte active-index cap.
Build/resume: resumable, idempotent, version-aware, batch-budgeted, and
checkpointed; final verification replay used 33,563 cache hits and zero
provider calls.
Incremental update: deterministic content hashes, source hashes, model,
dimension, adapter, chunker, dataset, and policy versions participate in
identity and invalidation.
Rollback: `npm run retrieval:rollback`; disabling
`TEOYUBE_VECTOR_RETRIEVAL_ENABLED` leaves lexical/TIG fallback complete.
Manifest verification: PASS; 33,563 database records match the public manifest,
model, dimension, version, source hash, and count.

## Consent and privacy

External embedding consent: public approved corpora only by default; user data
requires an explicit consent path.
User semantic-index consent: Prompt 16 continuity consent plus separate
semantic-index consent are both required.
Raw sensitive text embedded: NO. Only approved derivative summaries may be
indexed.
User vector encryption: AES-GCM envelope protection in the user vector service.
Cross-user retrieval: 0; repository queries are partitioned and user-scoped.
Revoked/deleted retrieval: 0 results in locked privacy evaluation.
Deletion propagation: PASS for source deletion, consent revocation, and
derivative cleanup.
Account deletion: semantic vectors and related derivatives participate in the
Prompt 16 deletion flow.
Raw queries/vectors in logs: NO; observability records bounded metadata,
versions, timings, counts, and cost rather than private content or vectors.

## Retrieval

Exact-reference accuracy: 1.0000.
Lexical baseline: deterministic exact/lexical/TIG behavior remains complete and
is the fallback when vector retrieval is disabled or unavailable.
Vector result: partition- and trust-filtered, source-inspectable candidates.
Hybrid result: deterministic fusion and reranking of exact, lexical, vector,
and TIG evidence.
Recall@5: baseline 0.8500; hybrid 1.0000.
Recall@10: baseline 0.9000; hybrid 1.0000.
MRR@10: baseline 0.642917; hybrid 0.7725.
nDCG@10: baseline 0.665387; hybrid 0.803102.
nDCG improvement: +0.137714.
Recall improvement: +0.1000 at 10.
Critical regressions: 0.
Source precision: baseline 0.36375; hybrid 0.24375. This reduction is retained
as a known tradeoff rather than hidden; the hybrid path retrieved a broader set
of relevant sources while materially improving recall, MRR, and nDCG.
Source diversity: 1.0000 at 10.
Source inspectability: 1.0000.
Citation validity: 1.0000.
Trust filtering: 1.0000.
Consent filtering: 1.0000.
Prompt-injection bypass: 0.
Fallback: deterministic; critical/safety paths do not call embeddings and
feature-off/provider-failure states return lexical/TIG results.

The locked set is
`teoyube-retrieval-eval-2026-07-23.1a`: 8 exact-reference cases, 20 semantic
cases, and 28 total.

## Cross-module

Search: general intent retrieval may use approved public partitions and returns
typed, sourced results.
Promise Search: remains promise-scoped and provenance-preserving.
Today/Journey: read-only continuity retrieval; no TIG or retrieval call mutates
journey state.
Prayer: receives minimal Scripture-grounded sources and cannot present model
language as divine speech.
Calling: receives evidence and explanation paths for ongoing discernment, never
a final destiny.
Lexicon: keeps Scripture-derived language aids distinct from Scripture.
Testimony/Book: user-confirmed, user-scoped records only; no automatic
publication or promotion.
Teo Guide: receives only validated, budgeted, source DTOs.
Product help: isolated product instructions without spiritual-authority
promotion.
Search/Promise Search distinction: preserved in contracts, partition filters,
application adapters, and tests; no route or page consolidation occurred.

## Live AI and safety

Prompt 17 Gate A: PASS, 64/64.
Gate B-Preview: PASS under the existing Prompt 19K funded-project preview gate.
Gate B-Production: CLOSED.
Prompt 18 Tool-Orchestration Gate: PASS.
Prompt 19K: PASS; 9 fixtures, 7 provider calls, 7/7 strict responses, 7/7
citation checks, critical cases made zero provider calls, and no write or
memory action occurred.
Fabricated citations: 0 in the locked retrieval and Prompt 19K regressions.
Unauthorized memory/tools/state: 0. Retrieval and TIG remain read-only; writes
still require explicit, user-confirmed application actions.
Context token change: mean assembled context increased from 1,664 to 2,536.95
estimated tokens (+872.95); every case stayed within the 4,000-token cap.
Answer-source fidelity: citation validity, exact-reference accuracy, and source
inspectability each remained 1.0000.

## Performance and storage

Protected visual files changed: 0.
CSS changes: 0.
DOM/class changes: 0.
Asset changes: 0.
Immutable baselines changed: 0.
Support baselines changed: 0.
Scripture-delta baselines changed: 0.
Visual parity: PASS; 105/105 browser parity checks across three complete runs,
216/216 matrix cells, and zero screenshot, DOM/class, asset, functional,
accessibility, or focus failures.
Accessibility/focus: PASS.
Three-run performance: PASS. Run 1 maximum 3,102.7 ms and resumed across two
segments; run 2 maximum 3,128.3 ms; run 3 maximum 3,397.2 ms. All remained
below the 5,000 ms threshold.
Hybrid retrieval evaluation p95: 304.2182 ms.
Workspace before: 1,822,789,465 bytes and 31,365 files.
Workspace after: 2,149,646,488 bytes and 31,847 files after disposable Prompt
20 log cleanup.
Workspace growth: 326,857,023 bytes, below the 786,432,000-byte task cap.
Index size: 296,927,232 bytes.
Generated retrieval evidence: 296,947,351 bytes across seven ignored files,
including the database and retained manifests/evaluation evidence.
Storage bound: PASS.
Listeners closed: PASS at final handoff; no Prompt 20 server or browser process
was retained.

## Regressions

Prompt 13: PASS; complete guided-journey browser flow remains intact.
Prompt 14: PASS; TIG boundary and deterministic service remain intact.
Prompt 15B: PASS; exact WEB Scripture and quotation validation remain intact.
Prompt 16: PASS; consent-aware memory plus deletion propagation remain intact.
Prompt 17: PASS; theological safety and Gate A remain intact.
Prompt 17S: PASS; 216-cell performance contract passed.
Prompt 18: PASS; structured Teo Guide orchestration remains intact.
Prompt 19K: PASS; funded-project live-AI preview gate remains intact.
Recovery: PASS. Protected sources, owner references, all immutable baselines,
support baselines, TIG, WEB corpus, imports, architecture, safety, and retrieval
boundaries passed.
Build: PASS on Next 16.2.11; 58 routes built and bundle-boundary checks passed.
Typecheck: PASS.
Lint: PASS; focused retrieval lint also passed after the final scorecard change.
Unit: PASS; 218 passed and one paid-provider test skipped by default. Focused
retrieval: 21/21.
Browser: PASS; 10/10 ordinary e2e tests, 3/3 memory e2e tests, and the
three-run 105-test visual/performance gate passed.
Security: PASS. `npm audit` reported zero vulnerabilities after the audited
Next 16.2.11 patch; safety and prompt-injection contracts passed.

The separate historical Phase 11.6C.3 publication-integrity blocker remains
unchanged and was not weakened or represented as complete.

## Runtime

Static runtime: canonical; `npm start` remains
`node --preserve-symlinks-main server.js`.
Next runtime: preview-only.
Vector retrieval enabled in: explicit local/provider-backed evaluation and
preview paths only.
Checked-in vector flag: `TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false`.
Production vector infrastructure: not configured; local SQLite is not presented
as a production distributed store.
Runtime cutover: not performed.

## Known limitations

- The exact terminal public-index provider charge cannot be reconstructed from
  the repaired disposable checkpoint; the report retains a proven lower bound
  and conservative upper bound.
- Local SQLite uses a preview-scale scan path. It is not production
  multi-region vector infrastructure.
- Hybrid source precision decreased while Recall@5, Recall@10, MRR, and nDCG
  improved; this tradeoff requires continued monitoring.
- Mean assembled context grew by 872.95 estimated tokens, though all locked
  cases remained within the 4,000-token cap.
- Production key management, distributed storage, operational deletion across
  regions, and production Gate B evidence remain future owner-gated work.
- The owner-accepted exact Scripture corpus/provenance limitations from Prompt
  15 remain unchanged.

## Files changed

Prompt 20 changes 62 tracked files including this report. Exact inventory:

- Configuration and package boundary: `.env.example`, `.gitignore`,
  `package.json`, `package-lock.json`, `tsconfig.retrieval.json`.
- Architecture/product/privacy/security documentation:
  `docs/architecture/adr/ADR-004-partitioned-local-hybrid-retrieval.md`,
  `docs/architecture/embedding-gateway.md`,
  `docs/architecture/hybrid-retrieval.md`,
  `docs/architecture/retrieval-context-budget.md`,
  `docs/architecture/retrieval-partitions.md`,
  `docs/architecture/retrieval-ranking.md`,
  `docs/architecture/vector-repository.md`,
  `docs/privacy/user-semantic-indexes.md`,
  `docs/privacy/vector-deletion-and-revocation.md`,
  `docs/product/cross-module-intelligence.md`,
  `docs/security/retrieval-prompt-injection.md`.
- Recovery/evaluation evidence:
  `docs/recovery/evidence/prompt-20/public-index-manifest-record.json`,
  `docs/recovery/prompt-20-embedding-owner-decision.md`,
  `docs/recovery/prompt-20-hybrid-rag-report.md`,
  `docs/recovery/prompt-20-migration-ledger.md`,
  `docs/testing/retrieval-evaluation-scorecard.json`,
  `docs/testing/retrieval-evaluation.md`.
- Recovery and retrieval scripts:
  `scripts/recovery/resumableVisualGateState.cjs`,
  `scripts/recovery/runResumableVisualGate.cjs`,
  `scripts/recovery/verifyLiveAiBoundaries.cjs`,
  `scripts/recovery/verifyRetrievalBoundaries.cjs`,
  `scripts/retrieval/retrieval-cli.ts`,
  `scripts/retrieval/retrieval-evaluation-cli.ts`,
  `scripts/retrieval/runRetrievalCommand.cjs`.
- Domain/feature/configuration code:
  `src/config/environment.ts`,
  `src/domain/memory/data-classification-registry.ts`,
  `src/domain/memory/memory-contracts.ts`,
  `src/domain/retrieval/index.ts`,
  `src/domain/retrieval/retrieval-contracts.ts`,
  `src/domain/retrieval/retrieval-policy.ts`,
  `src/features/memory/application/user-memory-service.ts`,
  `src/features/retrieval/application/cross-module-retrieval-service.ts`,
  `src/features/retrieval/contracts.ts`,
  `src/features/retrieval/index.ts`.
- Server implementation:
  `src/server/memory/memory-runtime.ts`,
  `src/server/retrieval/content-hashing.ts`,
  `src/server/retrieval/deterministic-chunker.ts`,
  `src/server/retrieval/hybrid-retrieval-service.ts`,
  `src/server/retrieval/index.ts`,
  `src/server/retrieval/openai-embedding-gateway.ts`,
  `src/server/retrieval/public-index-pipeline.ts`,
  `src/server/retrieval/public-source-inventory.ts`,
  `src/server/retrieval/retrieval-config.ts`,
  `src/server/retrieval/retrieval-context-assembler.ts`,
  `src/server/retrieval/retrieval-observability.ts`,
  `src/server/retrieval/sqlite-vector-repository.ts`,
  `src/server/retrieval/user-vector-index-service.ts`.
- Tests and fixtures:
  `tests/build-foundation/consent-aware-memory.test.ts`,
  `tests/build-foundation/cross-module-retrieval.test.ts`,
  `tests/build-foundation/embedding-gateway.test.ts`,
  `tests/build-foundation/hybrid-retrieval.test.ts`,
  `tests/build-foundation/resumable-visual-gate.test.ts`,
  `tests/build-foundation/retrieval-contracts.test.ts`,
  `tests/build-foundation/retrieval-inventory.test.ts`,
  `tests/build-foundation/retrieval-security-permission.test.ts`,
  `tests/build-foundation/retrieval-storage.test.ts`,
  `tests/fixtures/retrieval/locked-evaluation-set.json`.

## Result

Prompt 20: **PASS**
Retrieval Quality Gate: **PASS**
Owner approval required: **NO** for Prompt 20 closure; Prompt 21 still requires
its own explicit authorization.
Prompt 21 unlocked: **YES**, but not started.
Next gate: **PASS** for Prompt 20.

Rollback:

```text
git revert --no-commit f7d63855a0abc2b6e9bd3916392d57eb85d49115..HEAD
git commit -m "revert Prompt 20 hybrid retrieval"
```

Kill switch:

```text
TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false
```

No protected visual, immutable baseline, support baseline, Scripture-delta
baseline, static-runtime, or production Gate B change is part of this result.
