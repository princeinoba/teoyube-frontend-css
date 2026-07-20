# Prompt 15 Scripture retrieval report

Date: 2026-07-20
Branch: `recovery/visual-source-of-truth`
Starting commit: `715bd10a90abb0441c961f8d51166f7f89c74131`
Scope: Prompt 15 only

## Outcome

**BLOCKED — NO COMPLETE APPROVED FULL-TEXT SCRIPTURE CORPUS. PROMPT 16 REMAINS LOCKED.**

The entry gate passed: exact branch and starting HEAD, clean worktree, starting-commit ancestry, canonical static `npm start`, separate Next preview, recovery contracts, and 13/13 focused Prompt 13/14 regressions.

## Inventory result

The local data contains 356 normalized bare references across 53 books and zero approved verse texts. `scriptureCanon.json` contains 108 Teoyube records with 292 unique raw references and is byte-identical to `words.json`. The only exact-text candidate is a three-verse KJV TIG seed. It is incomplete and has no recorded upstream source version, attribution, territorial rights analysis, or owner display approval. It is registered as `DISPLAY_BLOCKED_LICENSE_UNKNOWN` and is not imported by the canonical repository.

No permission was inferred from repository presence or the KJV label. Promise summaries, prayers, PDFs, fixtures, screenshots, static UI copy, and user content were not converted into corpus text.

## Implemented blocker-safe slice

- Stable client-safe Scripture types and typed errors.
- Deterministic 66-book parser and canonical-label normalizer.
- Explicit machine-readable corpus/licensing registry with source hashes.
- One server-owned repository with reference-only retrieval and lexical reference search.
- `null` exact-text and context behavior instead of fabrication.
- Mandatory unresolved/blocked citation responses.
- Version/translation/query-aware reference-search cache with no raw-query logging.
- Fixed-path corpus verifier, source-import guard, and built-client bundle guard.
- Compatibility export preserving the approved Canon behavior.
- Parser, repository, security, cache, network-isolation, and licensing-block tests.

Local reference-only measurements recorded corpus-module load at 672.04 ms and reference-index construction at 16.36 ms. Exact/context fallback p95 remained below 0.003 ms, lexical cache-miss p95 was 0.9357 ms, and cache-hit p95 was 0.0074 ms. These measurements do not predict full-corpus performance.

## Product integration disposition

| Consumer | Prompt 15 result |
| --- | --- |
| TIG | Existing anchors and ranking unchanged; Prompt 14 regression passes. Anchors are not promoted to corpus-validated because exact text is unavailable. |
| Today/Journey | Prompt 13 state machine, source references, undo/revisit/reject behavior, and full browser loop pass unchanged. |
| Search | Existing deterministic workflow and seven categories pass parity; exact-reference ownership is not cut over. |
| Promise Search | Distinct six-result workflow passes its owner-approved support replay; it is not merged with Search. |
| Canon | Existing reference-only view model continues through the compatibility export; no visible output changed. |
| Promise Table | Provenance, Level A/B/C metadata, status transitions, remove, and undo pass unchanged. Existing references cannot yet be upgraded to validated corpus citations. |
| Prayer | Scripture/prayer separation and current behavior pass parity; no paraphrase is newly labeled as a verse. |
| Calling Compass | Cautious language and existing anchors pass parity; anchors remain unresolved at the corpus layer. |
| Teo Guide | Existing deterministic response passes parity. The new server endpoint is tool-shaped and reference-only but is not connected to the visible guide while exact text is blocked. |
| Journal/Testimony/Book | Existing source references, user-confirmation boundaries, reversibility, and session-only behavior pass unchanged. User text is never indexed. |

## Verification results

- Recovery verification: PASS, including 268 protected-source hashes, 210 protected visual files, 12 owner references, 72 immutable screenshots, 12 immutable DOM snapshots, both owner-approved support trees, TIG, Scripture registry, import, and architecture checks.
- Corpus/license verifier: PASS for registry integrity; readiness remains explicitly blocked.
- Parser/repository/citation/reference-search tests: PASS.
- Full unit suite: PASS, 16 files and 84 tests.
- Focused Prompt 13, Prompt 14, and Scripture regression: PASS, 5 files and 25 tests when run without unrelated process contention.
- Build: PASS, 56 Next routes/pages including the server-only Scripture endpoint.
- Typecheck and lint: PASS.
- Fresh-server browser suite: PASS, 5/5, including the complete Prompt 13 loop and Scripture API security cases.
- Complete retained-route visual/functional parity: PASS, 35/35.
- Prompt 12D support replay: PASS, 5/5 against 54 default and 16 interaction captures.
- TIG and Scripture built-client guards: PASS across 39 JavaScript chunks.
- Static runtime check: PASS at `http://127.0.0.1:4173/`; `npm start` remains canonical.
- Next remains preview-only.

No product integration ownership was moved because field-by-field exact-text characterization is impossible without an approved corpus. TIG and Prompt 13 behavior remain unchanged.

## Hard-coded quotation audit

The new canonical domain/server code contains no hard-coded Scripture quotation. The approved generated/static presentation and legacy TIG seed still contain historical wording. Those sources are retained, not declared validated, and cannot be migrated or silently changed under the visual contract. A complete corpus is required to compare them field by field and resolve any mismatch through an owner product decision.

## Gate status

The repository contract, parser, registry, reference-only search, security boundaries, and visual protection can pass. Prompt 15 acceptance cannot pass because exact text, context, quotation validation, full-text lexical search, and consumer integration remain blocked. Prompt 16 is **NO**.

Rollback after commit: `git revert <Prompt-15-commit>`.
