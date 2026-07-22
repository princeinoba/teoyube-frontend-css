# Prompt 17S storage recovery and resumable gate report

Date: 2026-07-22  
Decision: **PASS**  
Prompt 18: **UNLOCKED, NOT IMPLEMENTED**

## REPOSITORY

```text
Branch: recovery/visual-source-of-truth
Starting commit: ac86a6f83a76a20b58bf01fb7d97928cb0493a7d
Prompt 17 safety base: d3976a54687d09943771e618b3ccd6720aa57410
Final implementation/audit evidence commit: 8e2a17d1b3b835606f65bd69c97b4d17257e6523
Final reporting commit: the commit containing this report; its exact hash is reported in the final handoff because a commit cannot contain its own hash
Worktree: clean at evidence commit; required clean again after the report commit
Lineage: PASS — the final work is a descendant of both the authorized start and Prompt 17 safety base
```

Files changed from the authorized starting commit are limited to recovery documentation/evidence, `package.json` script wiring, Playwright recovery configuration, recovery runner/state tooling, the canonical performance audit extension, and its focused unit test. No production UI, CSS, asset, corpus, memory, TIG, journey, or safety implementation changed.

## TOOLCHAIN

```text
Node: v24.18.0 / C:\Program Files\nodejs\node.exe
npm: 10.2.4 / C:\Program Files\nodejs\npm.cmd
package-lock changed: NO
package-lock SHA-256: 4DC14EA3B324D0E5F13AF15CED4D03A46C8230A01B9F1141FA31655CF46252A0
npm ci: PASS — 396 packages installed; 0 vulnerabilities
```

## STORAGE BEFORE

The exact pre-cleanup inventory is preserved in `docs/recovery/prompt-17s-storage-inventory.{md,json}`.

```text
Workspace total: 6,313,584,743 bytes / 39,579 files
.git: 368,198,101 bytes / 1,877 files
node_modules: 480,173,737 bytes / 21,374 files
.next: 175,861,574 bytes / 1,688 files
.tmp: 4,824,621,237 bytes / 11,346 files
test-results: 0 bytes / absent
playwright-report: 537,478 bytes / 1 file
baseline roots: tests/visual/baselines 220,551,441 bytes; tests/visual/contracts 638,476 bytes
corpus: src/server/scripture 14,488,091 bytes; owner WEB archive input 2,907,330 bytes
```

Largest 20 pre-cleanup paths:

| Path | Bytes | Files |
| --- | ---: | ---: |
| `.tmp` | 4,824,621,237 | 11,346 |
| `.tmp/preserved` | 4,818,554,671 | 11,221 |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722` | 3,232,744,784 | 5,937 |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results` | 2,994,677,920 | 4,855 |
| `.tmp/preserved/prompt17p-final-run1-failed-20260722/playwright-results/.playwright-artifacts-0` | 2,994,663,286 | 4,854 |
| `.tmp/preserved/prompt17-before-17p-d3976a5` | 1,585,809,887 | 5,284 |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity` | 1,585,272,309 | 5,283 |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results/.playwright-artifacts-0` | 1,584,459,627 | 5,280 |
| `.tmp/preserved/prompt17-before-17p-d3976a5/visual-parity/playwright-results` | 1,584,459,627 | 5,280 |
| Prompt 17P trace subtree | 599,687,875 | 4,761 |
| Prompt 17 trace subtree | 546,741,267 | 5,256 |
| Prompt 17 trace resources | 520,292,801 | 5,184 |
| Prompt 17P trace resources | 511,510,189 | 4,485 |
| `node_modules` | 480,173,737 | 21,374 |
| `.git` | 368,198,101 | 1,877 |
| `.git/objects` | 367,711,768 | 1,842 |
| `tests` | 221,528,068 | 832 |
| `tests/visual` | 221,363,839 | 808 |
| `tests/visual/baselines` | 220,551,441 | 779 |
| `.git/objects/pack` | 220,156,096 | 3 |

## CLEANUP

Before cleanup, the complete Gate A scorecard, original three-failure checkpoint, incomplete 45-cell Prompt 17P checkpoint, diagnostic hashes, and compact order-sensitivity result were copied into `docs/recovery/evidence/prompt-17s/` and hash-verified. The final three-run evidence is preserved in `resumable-performance-gate-summary.json` with SHA-256 `0D522AC64C1D14161FB208E967541488AA4E8090B14BDE4B29FDC46625BF5C22`.

Deleted paths and exact reclaimed bytes:

| Path/event | Class | Bytes | Regeneration |
| --- | --- | ---: | --- |
| Preserved Prompt 17 Playwright result tree only | EPHEMERAL_TEST_OUTPUT | 1,584,459,627 | rerun canonical audit |
| Preserved Prompt 17P Playwright result tree only | EPHEMERAL_TEST_OUTPUT | 2,994,677,920 | rerun canonical audit |
| Initial `.next` | REPRODUCIBLE_BUILD_OUTPUT | 175,861,574 | `npm run app:build` |
| Initial `playwright-report` | EPHEMERAL_TEST_OUTPUT | 537,478 | rerun browser test |
| Final-run Playwright results | EPHEMERAL_TEST_OUTPUT | 2,370,226 | rerun browser test |
| Final-run Playwright HTML report | EPHEMERAL_TEST_OUTPUT | 4,291,489 | rerun browser test |
| Prompt 12D disposable support candidates | EPHEMERAL_TEST_OUTPUT | 30,537,036 | rerun current support parity |
| Historical support-route disposable candidates | EPHEMERAL_TEST_OUTPUT | 2,103,444 | rerun historical diagnostic |
| Duplicate final performance artifact | EPHEMERAL_TEST_OUTPUT | 1,156,761 | read tracked compact evidence / rerun gate |
| Intermediate `playwright-report` | EPHEMERAL_TEST_OUTPUT | 537,518 | rerun browser test |
| Intermediate `.tmp/playwright-results` | EPHEMERAL_TEST_OUTPUT | 45 | rerun browser test |
| `.tmp/safety-build` | REPRODUCIBLE_BUILD_OUTPUT | 705,936 | rerun safety command |
| `.next/dev` | REPRODUCIBLE_BUILD_OUTPUT | 125,524,921 | `next typegen` / development runtime |
| `.next/cache` | REPRODUCIBLE_BUILD_OUTPUT | 209,618 | `npm run app:build` |
| Final `playwright-report` | EPHEMERAL_TEST_OUTPUT | 537,490 | rerun browser test |
| Final `.tmp/playwright-results` | EPHEMERAL_TEST_OUTPUT | 45 | rerun browser test |

Deletion-event total: **4,923,511,128 bytes**. The net workspace reduction is lower because dependencies/build output were cleanly regenerated and compact tracked evidence was added.

```text
Git maintenance capacity gate: PASS
Free disk before git gc: 321,407,062,016 bytes
Required strict minimum (2 × .git + 1 GiB): 1,810,138,026 bytes
git fsck --no-dangling: PASS
git gc: PASS
.git immediately after gc: 365,451,405 bytes
.git at final measurement after focused commits: 365,721,063 bytes
Git history rewritten: NO
Protected files deleted: 0
Baselines deleted: 0
Owner input deleted: 0
Corpus files deleted: 0
```

The remaining `.tmp/preserved` tree is 239,417,124 bytes. Its further deletion was intentionally omitted after the safety reviewer treated it as owner-required historical Prompt 17P evidence. This does not prevent material recovery or exceed the owner's 4 GB review threshold.

## STORAGE AFTER

Measured 2026-07-22T14:07:21.659Z before adding this small report:

```text
Workspace total: 1,703,990,265 bytes / 27,429 files
.git: 365,721,063 bytes / 102 files
node_modules: 480,173,839 bytes / 21,374 files
.next: 139,834,549 bytes / 1,495 files
.tmp: 251,748,134 bytes / 1,153 files
test-results: 0 bytes / absent
playwright-report: 0 bytes / absent
Total net reclaimed: 4,609,594,478 bytes (4.293 GiB)
```

Largest remaining paths are `node_modules` (480,173,839), `.git` (365,721,063), `.tmp` (251,748,134, including 239,417,124 of preserved historical evidence), `tests/visual/baselines` (220,551,441), `public` (178,231,869), and the production `.next` output (139,834,549). These are dependencies, Git storage, deliberately retained evidence, protected baselines/assets, or the verified preview build.

## RESUMABLE AUDIT

```text
Canonical test semantics changed: NO — measurement, pairing, cold contexts, retry rule, assertions, view/viewport order, and pass conditions are unchanged
Threshold changed: NO — 5,000 ms per paired static/Next cell
Readiness predicate changed: NO
Checkpoint schema/version: teoyube-performance-gate-checkpoint-1
Controller schema/version: teoyube-performance-gate-controller-1
Artifact budget: 524,288,000 bytes per active logical run
Interrupted run resumed: NO — all three final runs were uninterrupted; the prior 45-cell run remains preserved and was not reused under a changed audit identity
Completed logical runs: 3 consecutive / 3 attempts
Run 1 maximum: 3,360.0 ms
Run 2 maximum: 3,313.9 ms
Run 3 maximum: 3,050.8 ms
216/216 paired cells <= 5,000 ms: YES (432 individual static/Next readiness measurements)
Visual parity: PASS — 35/35 per logical run; 105/105 total
DOM/class parity: PASS
Asset parity: PASS
Accessibility/focus: PASS — 0 mismatches across 216 cells
Functional parity: PASS
Listeners closed: YES — 0 workspace-owned processes and 0 listeners on test ports
```

Every checkpoint update is atomic. Resume acceptance is bound to the exact Git commit, clean tracked worktree, Node/npm versions, audit hash, 5,000 ms threshold, all visual baseline/contract hashes, and static/Next build hashes. Completed passing cells may be retained; a failed cell cannot be skipped; an incomplete cell is rerun. Each resumed segment starts fresh servers and browser contexts.

Final audit identity:

```text
Git commit: 9e2be30b852f58f187f528b76dcf4b1570c90274
Audit SHA-256: 30E6E77730FA179E4B11B930BBD3365A588D186E6D527C7F8560BB3E768A3F8C
Visual baseline SHA-256: A9E3E8F8E746A179048FEF14C987EF3B87A7676711FA227074958066B5234429
Visual contract SHA-256: F97A216794536D43DFEC03F67DF582A4521D1874B467EAD81097B2CD9DCA7C53
Static build SHA-256: A92D815805E93BA9E19874123713CD9FBEF2CBDF282230D896E533891F140F0A
Audited Next build SHA-256: 4C64963ED69F02010E62F7487FE03F837AF609B777FF9EB3A40F5F3F76FF3B7E
```

Passing screenshots/traces were not retained after hashes and metrics were recorded. No baseline image was moved, overwritten, regenerated, or deleted. The retained compact raw run sizes were approximately 2.31 MB each, far below the 500 MB budget.

## SAFETY

```text
Gate A: PASS — 64/64 fixtures
Gate B: CLOSED_LIVE_AI_DISABLED
Immediate-danger recall: 100%
Divine authority: 0 violations
Coercion: 0 violations
Victim blame: 0 violations
Care replacement: 0 violations
Citation fidelity: 0 fabricated citations; 100% WEB validation
Prompt injection: 0 bypasses
Memory/tool authorization: 0 unauthorized reads; 0 unauthorized writes; 0 unauthorized state-changing tool plans
Deterministic fallback: PASS / 100% availability
Safety artifact hash: 65943D102556D1AF6E009621C99189FBCCDA0F881CEB2B67C62865A68F2F03DD
```

`safety:verify`, `safety:evaluate`, `safety:gate:orchestration`, and `safety:gate:live-ai` all passed serially. One discarded diagnostic invocation ran orchestration and live-AI concurrently and encountered an expected shared temporary-build collision; the canonical serial reruns passed and are the acceptance evidence.

## REGRESSIONS

```text
Recovery: PASS — final recovery:verify
Prompt 13: PASS — focused contracts plus 5/5 fresh-server journey/Scripture/health tests
Prompt 14: PASS — TIG contracts and 39-chunk client boundary
Prompt 15B: PASS — exact WEB corpus, quotation/content-delta, citation, and client boundary
Prompt 16: PASS — consent-memory unit/security/lint and 3/3 browser tests
Prompt 17: PASS — 64/64 deterministic safety evaluation; Gate A PASS; Gate B closed
Build: PASS — normal Next 16.2.10 production build; 59 pages; TIG/Scripture/safety bundle boundaries pass
Typecheck: PASS
Lint: PASS — including memory and new recovery tooling
Unit: PASS — 19 files / 119 tests
Browser: PASS — 3 × 35 retained-route tests, final 5/5 E2E, 3/3 memory E2E, current Prompt 12D support 5/5
Security: PASS — npm audit 0; safety and memory boundary checks pass
```

The first current Prompt 12D support replay was interrupted by a host scheduling pause and hit its unchanged timeout; the dedicated rerun passed 5/5 in 1.5 minutes. A separately invoked historical Prompt 12B support replay correctly remained bound to its earlier approval-date Daily Word (`Hadriel`, Psalm 145:5) and therefore differs from the later Prompt 12D approval-date candidate (`Doxa`, 2 Corinthians 3:18). Its immutable hashes still pass in `recovery:verify`; it is not the governing current-runtime support baseline, and neither historical baseline was changed.

## PROTECTION

```text
Protected visual files changed: 0
Immutable baselines changed: 0
Support baselines changed: 0
Scripture-delta baselines changed: 0
CSS changes: 0
DOM/class production changes: 0
Asset changes: 0
Static runtime: CANONICAL — npm start remains node --preserve-symlinks-main server.js
Next runtime: PREVIEW ONLY
Live AI connected: NO
```

## RESULT

```text
Prompt 17S: PASS
Prompt 18 unlocked: YES
Owner approval required: NO
Rollback: git revert --no-commit ac86a6f83a76a20b58bf01fb7d97928cb0493a7d..HEAD && git commit -m "revert Prompt 17S"
```

Known limitations: the performance evidence is deterministic local Windows Chrome evidence, not a production or multi-region SLO; the remaining 239 MB historical evidence was retained by the preservation gate; PGP verification of the exact WEB archive remains the owner-accepted Prompt 15B residual; the separate historical Phase 11.6C.3 publication-integrity blocker remains unchanged. Prompt 18, runtime cutover, live generative AI, embeddings, broad RAG, external persistence expansion, CSS consolidation, baseline replacement, and archive deletion were not implemented.
