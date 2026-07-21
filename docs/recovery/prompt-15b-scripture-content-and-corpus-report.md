# Prompt 15B Scripture content and WEB corpus report

Status: **PASS**  
Owner decision: `TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B`  
Branch: `recovery/visual-source-of-truth`  
Starting commit: `4da2adfaa784039c5250a894fdcbd4c4aea64e82`  
Corpus/repository commit: `b0ffa52`  
Quotation-remediation commit: `571a6760935231ad2d3ec376c9ea2f79b869b3df`  
Final evidence commit: the commit containing this report; the exact hash is recorded in the final Git handoff.

Prompt 15B safely imports the owner-supplied World English Bible corpus, activates deterministic exact retrieval, applies all 17 owner-approved visible quotation replacements, quarantines the non-visible legacy records, and binds the approved content-only visual deltas without replacing any historical baseline. The static runtime remains canonical and Next remains preview-only.

## Evidence binding and owner decision

- Owner decision file: `docs/owner-approvals/scripture/TEOYUBE-OWNER-SCRIPTURE-QUOTATION-2026-07-20-P15B.md`
- Inventory JSON SHA-256: `F6108E8617786464888DCBABB3F48899ED5A113D4D3851AF947CED776D91D68C`
- Archive SHA-256: `4253589697DC6B5E92695655F2F28792D50E7BE7B9C8E212AF4F4BD18E866C3B`
- Archive bytes: `2,907,330`
- PGP signature verification: **NOT PERFORMED**
- Owner residual-risk acceptance: **YES**, for the exact archive hash above only
- Claim of cryptographic publisher-signature verification: **FORBIDDEN**
- Bound inventory result: 17 visible `LEGACY_NON_WEB_WORDING`, 0 visible `EXACT_WEB_MATCH`, 0 unresolved, 20 non-visible legacy, and 5 `NOT_SCRIPTURE_QUOTATION`
- `docs/scripture/legacy-quotation-owner-review.json` remains byte-identical because the owner's decision is explicitly bound to its SHA-256. The permanent outcomes are recorded in the owner decision table and executable overlay.

All 17 decisions resolved through the canonical WEB repository, retained their verified references, rendered the corpus text without manual shortening, received the existing `reference - WEB` citation treatment, and passed source-overlay plus static/Next content-delta verification.

| Record ID | Reference | Outcome |
| --- | --- | --- |
| `UI-TODAY-001` | Psalm 121:7 | PASS - exact WEB |
| `UI-CANON-001` | Ephesians 1:18 | PASS - exact WEB |
| `UI-CALLING-001` | Ephesians 1:18 | PASS - exact WEB |
| `UI-BOOK-001` | Proverbs 3:5-6 | PASS - exact WEB |
| `UI-BOOK-002` | Psalm 77:11 | PASS - exact WEB |
| `UI-BOOK-003` | Luke 16:10 | PASS - exact WEB |
| `UI-LEXICON-001` | Colossians 3:16 | PASS - exact WEB |
| `UI-LEXICON-002` | Proverbs 9:10 | PASS - exact WEB |
| `UI-GUIDE-001` | Psalm 119:105 | PASS - exact WEB |
| `UI-PROMISE-001` | Ephesians 1:18 | PASS - exact WEB |
| `UI-PROMISE-002` | 2 Corinthians 6:1 | PASS - exact WEB |
| `UI-PROMISE-003` | 2 Corinthians 6:2 | PASS - exact WEB |
| `UI-PROMISE-004` | 2 Corinthians 6:3 | PASS - exact WEB |
| `UI-PROMISE-005` | 2 Corinthians 6:4 | PASS - exact WEB |
| `UI-PROMISE-006` | 2 Corinthians 6:5 | PASS - exact WEB |
| `UI-PROMISE-007` | 2 Corinthians 6:6 | PASS - exact WEB |
| `UI-PROMISE-008` | 2 Corinthians 6:7 | PASS - exact WEB |

## Change and visual-protection accounting

- Files changed or added from the authorized starting commit: **353** after this report is included.
- Owner-authorized Scripture content files changed: **5** (`index.html`, `app.js`, `scripts/seedDB.js`, `src/app/_today/ApprovedTodayView.tsx`, and the deterministic approved-markup snapshot).
- Unauthorized protected visual files changed: **0**.
- CSS files changed: **0**.
- DOM/class structure changes: **0**.
- Asset files changed: **0**.
- Immutable static baseline overwrites: **0**.
- Owner-approved support baseline changes: **0**.
- Owner-approved Scripture content-delta baseline files added: **301** - one manifest plus **300** hash-bound screenshots, overlays, side-by-side images, and static/Next contracts.
- Original immutable evidence remains 72 screenshots and 12 desktop DOM snapshots, verified byte-for-byte.

The exact 353-path inventory is represented by the three focused commits. Non-generated paths are grouped below; the content-delta manifest enumerates and hashes every one of its 300 artifacts.

- Runtime/content: `.gitignore`, `app.js`, `index.html`, `scripts/seedDB.js`, `package.json`.
- Domain/server/API: `src/domain/scripture/scripture-repository.ts`, `src/server/scripture/canonical-scripture-repository.ts`, `src/server/scripture/corpus-registry.json`, `src/server/tig/canonical-tig-service.ts`, `src/app/api/teoyube/scripture/route.ts`, `src/app/_today/ApprovedTodayView.tsx`, and `src/app/_approved-source/approved-view-markup.generated.ts`.
- Corpus/import: `scripts/scripture/importWebCorpus.cjs`, `scripts/scripture/materializePrompt15bSourceOverlay.cjs`, `scripts/scripture/lib/safe-zip-reader.cjs`, `scripts/scripture/lib/web-usfm-importer.cjs`, the three generated `src/server/scripture/corpora/engwebp/generated/*` files, and the server-only verified archive at `src/server/scripture/third-party/engwebp/source/engwebp_usfm.zip`.
- Recovery/security: `scripts/recovery/buildOwnerApprovedNextSupportCandidate.cjs`, `fixedTimePreload.cjs`, `captureScriptureContentDelta.cjs`, `scriptureContentDeltaOverlay.cjs`, `verifyNonVisibleScriptureQuarantine.cjs`, `verifyScriptureContentDelta.cjs`, `verifyScriptureContentDeltaArtifacts.cjs`, `verifyWebCorpus.cjs`, plus the updated Scripture client-bundle, corpus, quotation, source, DOM, and visual verifiers.
- Tests/contracts: four `tests/build-foundation/*` Scripture/TIG/journey tests, `tests/e2e/scripture-reference-only.spec.ts`, `tests/visual/contracts/owner-approved-scripture-content-delta.json`, and `tests/visual/baselines/owner-approved-scripture-content-delta/*`.
- Documentation: the owner decision, this report, the Scripture corpus/readiness/licensing/import/citation/quarantine/review documents, retrieval acceptance criteria, Scripture ADR, and legacy-removal ledger.

## Corpus and repository result

- Translation/corpus: `engwebp`, World English Bible, Protestant Edition 2020 stable text.
- Importer: `teoyube-web-usfm-importer-1.0.0`.
- Corpus version: `engwebp-2020-stable-2026-07-10.p15b.1`.
- Generated checksum: `91ed0e262462adc49b54fcb264a910d2753cb927538cf7968486961009fcb62f`.
- Corpus SHA-256: `6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f`.
- Lexical index SHA-256: `544b67548c04a36e2445fa6601f07f6cdb7b8d044ae2691591629609b2eeeeb2`.
- Generated manifest SHA-256: `e777cbf8c0dcebbb5093194025f1d4c788095d0c873ab4b5021fd238525ab8bd`.
- Coverage: 66 books, 1,189 chapters, 31,103 source verse markers, 31,098 displayable verses, 5 accounted source-footnote-only verse markers, 12,310 lexical terms, and 0 import warnings.
- Embedded checksum evidence: 70/70 verified.
- Existing Teoyube references: 356/356 resolve.
- Duplicate normalized verse keys: 0.
- Importer-created empty verses: 0.
- Mixed translations: 0.
- Exact retrieval: PASS for verses, ranges, cross-chapter ranges, chapters, and typed failures.
- Context retrieval: PASS with honest passage boundaries.
- Lexical search: PASS, deterministic and local.
- Citation validation: PASS with exact corpus/version/source/display-policy metadata.
- Caching: PASS, version-aware and query-bounded; raw queries are not logged.

## Integration, quarantine, and safety

- Non-visible legacy quarantine: PASS. All 20 records remain source-bound, receive no WEB label, and cannot enter canonical Scripture DTO or rendering boundaries.
- Prayer/paraphrase separation: PASS. All 5 records remain non-Scripture prayer-sequence content with grounding references and no WEB label.
- TIG: PASS. Scripture anchors resolve through the canonical repository while recommendation IDs, ranking, graph paths, confidence, limitations, and ruleset/dataset versions remain stable.
- Prompt 13 journey: PASS. Citation provenance, skip, revisit, edit, reject, undo, and explicit user-confirmed writes remain intact.
- Search and Promise Search: PASS as distinct routes and workflows; no redirect or consolidation was introduced.
- Prayer, Calling Compass, Teo Guide, Promise Table, Journal, Testimony, and Book boundaries: PASS through focused contracts and retained-route browser suites.
- Client bundle: PASS across 39 JavaScript chunks; no corpus, lexical index, importer, canonical server repository, blocked KJV seed, TIG seeds, traversal, graph dataset, or server cache entered client bundles.
- Security: fixed local corpus paths, safe ZIP traversal checks, fixed archive hash, bounded input/query/results/traversal, sanitized API failures, no source-path leakage, and no raw spiritual-query logging.
- External services: no network, model, embeddings, vector search, database, or external persistence added.

## Performance

Supported runtime: Node `24.14.0`, within `package.json` policy.

- Final archive verification: 281.74 ms.
- Final deterministic import: 1,868.00 ms.
- Corpus module load: 923.7142 ms.
- Reference-index build: 16.0670 ms.
- Exact retrieval p50/p95: 0.0033 / 0.0246 ms.
- Context p50/p95: 0.0072 / 0.0250 ms.
- Lexical search miss p50/p95: 0.1598 / 0.2849 ms.
- Lexical search hit p50/p95: 0.0014 / 0.0027 ms.
- Citation validation p50/p95: 0.0061 / 0.0208 ms.
- Search cache: 100 hits, 1 miss, 1 bounded entry; version/checksum bound and raw-query logging disabled.
- Affected-route readiness: all 60 static/Next content-delta route/viewport cells settled, rendered full text, and passed the existing harness timing and geometry checks.

## Verification result

| Gate | Result |
| --- | --- |
| `npm run recovery:verify` | PASS - visual, immutable/support contracts, TIG, Scripture, 1,416 imports, and 81 architecture files |
| Archive/source/license and deterministic regeneration | PASS - no network, 70/70 embedded checksums, exact output hashes |
| Parser/repository/context/search/citation/performance | PASS |
| 17-record owner decision and source overlay | PASS - 17 records, 5 exact protected-source overlays |
| Scripture content-delta replay | PASS - 300 artifacts, exact static/Next structure, assets, quotation presentation, and visible-control geometry |
| Historical immutable baselines | PASS - 72 screenshots and 12 DOM snapshots unchanged |
| Current Prompt 12D support replay | PASS - 70 captures and 5/5 behavior/boundary tests using a test-only owner-approval-date build |
| TIG and Prompt 13 regressions | PASS |
| Full unit suite | PASS - 16 files, 85 tests |
| Typecheck | PASS |
| Lint | PASS - zero warnings, including the deterministic visual-build harness |
| Next preview build | PASS - Next 16.2.10, 56 routes |
| Fresh-server E2E | PASS - 5/5 health, exact Scripture API, and Prompt 13 loop tests |
| Retained-route browser suites | PASS after fresh dedicated reruns at every required viewport |
| Client-bundle boundaries | PASS - 39 chunks |
| External network/model/database | PASS - none required or introduced |

An initial shared-port diagnostic encountered a stale pre-change static process. It was discarded, the exact listener was closed, and all affected route suites were rerun on fresh dedicated processes. No result from the stale process is used as acceptance evidence.

The content-delta manifest records a maximum raw channel-delta raster ratio of 0.5887% for the Book tablet-portrait capture due to browser backdrop-filter compositing. This is retained transparently for owner review and is not masked. Exact DOM/class/asset/text agreement, quotation/control geometry, overflow/accessibility checks, and the ordinary Book parity suite at all six viewports pass.

## Runtime, limitations, rollback, and next gate

- Static runtime: **CANONICAL**; `npm start` remains `node --preserve-symlinks-main server.js`.
- Next runtime: **PREVIEW ONLY**.
- Runtime cutover: **NOT AUTHORIZED**.
- Known limitations: independent PGP signature verification was not performed; the five WEB source markers represented only in footnotes are accounted but are not importer-created display verses; live AI, embeddings/RAG, and durable persistence remain disabled; the current support replay requires deterministic server build time and now enforces it only in the test harness.
- Temporary extraction and document-rendering directories: removed. Test servers: closed.
- Rollback: `git revert --no-edit <final-evidence-commit> 571a6760935231ad2d3ec376c9ea2f79b869b3df b0ffa52`.
- Owner approval required: **NO** for the implemented decision scope.
- Prompt 16 unlocked: **YES**.
- Next gate: **PASS**. Stop after this report; Prompt 16 is not started.
