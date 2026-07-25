# Prompt 23A complete inventory

Generated: 2026-07-25T12:31:24.126Z

Source commit: `6bccbba694ae9b0f975884e182a0ad3f92cd7619`

## Gate separation

- Full-tree security: **BLOCKED — 9 high development advisories**
- Production dependency audit: **PASS — 0 critical/high**
- Gate C-Preview: `BLOCKED_SECURITY_ADVISORY`
- Gate C-Production: `CLOSED`
- Non-destructive inventory: **AUTHORIZED**
- Archive/delete execution: **BLOCKED**

## Coverage

- Tracked files classified individually: **3516**
- Workspace/ignored/required path records: **36**
- Untracked files reported by Git: **14**
- Parsed dependency edges: **10690**
- `UNKNOWN_BLOCKED`: **0**
- Static rollback archive eligible: **NO**

Every tracked file is present in the JSON report with one primary class, bytes, latest practical Git change, provenance/license note, six reachability dimensions, incoming dependency proof, string-path risk, protection, disposition, confidence, blocker, and benefit.

## Class counts

| Class | Items |
|---|---:|
| BUILD_TOOLING_CURRENT | 126 |
| CANDIDATE_DELETE_AFTER_OWNER_APPROVAL | 1 |
| CI_CURRENT | 5 |
| DOCUMENTATION_CURRENT | 234 |
| EPHEMERAL_IGNORED_OUTPUT | 4 |
| GENERATED_CURRENT_EVIDENCE | 3 |
| GENERATED_REPRODUCIBLE | 2 |
| HISTORICAL_REPORT | 332 |
| IMMUTABLE_BASELINE | 85 |
| LEGACY_COMPATIBILITY_ACTIVE | 1158 |
| LEGACY_PHASE_ACTIVE | 19 |
| LEGACY_PHASE_TEST_ONLY | 80 |
| LIVE_AI_REQUIRED | 28 |
| MEMORY_PRIVACY_REQUIRED | 68 |
| OWNER_APPROVED_BASELINE | 693 |
| OWNER_REFERENCE | 12 |
| PRODUCT_THEOLOGY_SOURCE | 6 |
| PRODUCTION_NEXT | 142 |
| PROTECTED_VISUAL_SOURCE | 257 |
| RETRIEVAL_REQUIRED | 21 |
| RUNTIME_CONFIG | 9 |
| SAFETY_REQUIRED | 14 |
| SCRIPTURE_CORPUS_SOURCE | 2 |
| SCRIPTURE_GENERATED_REQUIRED | 3 |
| SHARED_RUNTIME | 53 |
| STATIC_ROLLBACK | 6 |
| TEST_CURRENT | 74 |
| TIG_REQUIRED | 115 |

## Size analysis

| Area | Bytes | Human |
|---|---:|---:|
| trackedRepositoryBytes | 464933418 | 443.40 MiB |
| workspaceBytes | 2215582266 | 2.06 GiB |
| gitBytes | 371066874 | 353.88 MiB |
| sourceBytes | 25915783 | 24.72 MiB |
| testsBytes | 221679109 | 211.41 MiB |
| docsBytes | 24424602 | 23.29 MiB |
| protectedVisualBytes | 420963729 | 401.46 MiB |
| staticRollbackBytes | 202119424 | 192.76 MiB |
| nextBuildOutputBytes | 206424178 | 196.86 MiB |
| publicHybridIndexBytes | 296947328 | 283.19 MiB |
| generatedEvidenceBytes | 2958259 | 2.82 MiB |
| candidateBytes | 6 | 6 B |
| gitHistoryReductionFromProposals | 0 | 0 B |

Archiving inside this Git repository may improve navigation but reduces existing Git history by **0 bytes**. The only proposed tracked deletion is a six-byte diagnostic probe, so its storage benefit is negligible.

## Candidate summary

- Keep: `P23A-K001` — protected static rollback and visual/owner evidence.
- Refactor later: `P23A-R001` — active ESLint/minimatch/brace-expansion development chain; never archive/delete.
- Archive after stabilization: none.
- Delete after stabilization and explicit approval: `P23A-D001` — `.tmp-apply-patch-probe.txt`, 6 bytes, decision `PENDING`.
- Ephemeral cleanup through an existing safe command: none.
- Blocked ignored-output review: 2 path(s), all `PENDING`.

No candidate action is executable. Stabilization, Gate C-Preview, security, hashes, clean worktree, runtime gates, pre-action tag, and candidate-level approval all remain mandatory.

## Required path coverage

| Path | Exists | State | Files | Bytes | Class | Disposition |
|---|---|---|---:|---:|---|---|
| src | YES | tracked-or-mixed | 1652 | 25915783 | PRODUCTION_NEXT | KEEP_ACTIVE |
| app.js | YES | tracked-or-mixed | 1 | 585321 | STATIC_ROLLBACK | KEEP_STATIC_ROLLBACK |
| server.js | YES | tracked-or-mixed | 1 | 76277 | STATIC_ROLLBACK | KEEP_STATIC_ROLLBACK |
| index.html | YES | tracked-or-mixed | 1 | 92485 | STATIC_ROLLBACK | KEEP_STATIC_ROLLBACK |
| styles | YES | tracked-or-mixed | 22 | 17505 | STATIC_ROLLBACK | KEEP_STATIC_ROLLBACK |
| public | YES | tracked-or-mixed | 208 | 178231869 | STATIC_ROLLBACK | KEEP_STATIC_ROLLBACK |
| Asset | YES | tracked-or-mixed | 20 | 20180408 | PROTECTED_VISUAL_SOURCE | KEEP_OWNER_PROTECTED |
| tests | YES | tracked-or-mixed | 856 | 221679109 | TEST_CURRENT | KEEP_TEST |
| scripts | YES | tracked-or-mixed | 133 | 1023456 | BUILD_TOOLING_CURRENT | KEEP_ACTIVE |
| docs | YES | tracked-or-mixed | 572 | 24424602 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| config | YES | tracked-or-mixed | 9 | 45162 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| data | NO | absent | 0 | 0 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| media-source | NO | absent | 0 | 0 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| owner-input | YES | ignored | 1 | 2907330 | SCRIPTURE_CORPUS_SOURCE | KEEP_LICENSE_OR_SOURCE |
| .var | YES | workspace-metadata | 7 | 296947328 | GENERATED_CURRENT_EVIDENCE | KEEP_EVIDENCE |
| .github | YES | tracked-or-mixed | 4 | 9289 | CI_CURRENT | KEEP_ACTIVE |
| package.json | YES | tracked-or-mixed | 1 | 21107 | BUILD_TOOLING_CURRENT | KEEP_ACTIVE |
| package-lock.json | YES | tracked-or-mixed | 1 | 249942 | BUILD_TOOLING_CURRENT | KEEP_ACTIVE |
| next.config.mjs | YES | tracked-or-mixed | 1 | 1605 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| tsconfig.json | YES | tracked-or-mixed | 1 | 562 | BUILD_TOOLING_CURRENT | KEEP_ACTIVE |
| tsconfig.next.json | YES | tracked-or-mixed | 1 | 1881 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| tsconfig.retrieval.json | YES | tracked-or-mixed | 1 | 859 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| tsconfig.safety.json | YES | tracked-or-mixed | 1 | 697 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| playwright.config.ts | YES | tracked-or-mixed | 1 | 329 | BUILD_TOOLING_CURRENT | KEEP_ACTIVE |
| playwright.memory.config.ts | YES | tracked-or-mixed | 1 | 314 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| playwright.visual.config.ts | YES | tracked-or-mixed | 1 | 2559 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| vitest.config.mts | YES | tracked-or-mixed | 1 | 344 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| vitest.release.config.mts | YES | tracked-or-mixed | 1 | 1703 | DOCUMENTATION_CURRENT | KEEP_ACTIVE |
| .git | YES | workspace-metadata | 1022 | 371066874 | GENERATED_CURRENT_EVIDENCE | KEEP_EVIDENCE |
| node_modules | YES | ignored | 24226 | 493438083 | GENERATED_REPRODUCIBLE | KEEP_ACTIVE |
| .next | YES | ignored | 1762 | 206424178 | GENERATED_REPRODUCIBLE | KEEP_ACTIVE |
| .tmp | YES | ignored | 2063 | 369618686 | EPHEMERAL_IGNORED_OUTPUT | REFACTOR_LATER_NOT_ARCHIVE |
| test-results | NO | absent | 0 | 0 | EPHEMERAL_IGNORED_OUTPUT | REFACTOR_LATER_NOT_ARCHIVE |
| playwright-report | YES | ignored | 1 | 553074 | EPHEMERAL_IGNORED_OUTPUT | REFACTOR_LATER_NOT_ARCHIVE |
| coverage | NO | absent | 0 | 0 | EPHEMERAL_IGNORED_OUTPUT | REFACTOR_LATER_NOT_ARCHIVE |
| artifacts/release-evidence | YES | ignored | 23 | 397883 | GENERATED_CURRENT_EVIDENCE | KEEP_EVIDENCE |

## Method and limits

The graph uses parsed imports, re-exports, dynamic imports, CommonJS requires, file-system reads, JSON/repository path strings, CSS URLs, HTML references, public URLs, API routes, package scripts, and runtime/visual/owner/release manifests. Framework discovery seeds every Next page/API route. Static rollback policy seeds the protected HTML/CSS/JS/assets and rollback launcher. Test, CI/build, and documentation/evidence roots are separately traversed.

An unresolved string is treated as risk, never as proof of dead code. Names such as `phase`, `legacy`, `old`, or `temporary` do not establish candidacy.

## Prompt 23A-D scoped delta

Generated: 2026-07-25T18:36:30.044Z

Gate-execution source commit: `db4747d2fd653b3bc531d0a52d061f82339ca8bf`

- Base inventory nodes: **3,516**
- Added classified runtime/release-tooling nodes: **5**
- Current inventory nodes: **3521**
- Dependency edges after scoped recomputation: **10726**
- Added parsed edges: **36**
- Runtime build identity: **PASS**
- Non-destructive inventory: **COMPLETE**
- Release/deployment: `BLOCKED_SECURITY_ADVISORY`
- Archive/delete execution: **NOT AUTHORIZED**
- New candidates: **0**
- Unknown classifications: **0**
- Owner decisions changed: **0**

Added classes are one `RUNTIME_CONFIG`, one `BUILD_TOOLING_CURRENT`, one
`DOCUMENTATION_CURRENT`, and two `TEST_CURRENT` records. The accessibility
test verifies release-evidence accounting only; it does not change approved
markup or accessibility baselines. Sixteen post-scan report artifacts remain
outside the frozen inventory node set, and later Prompt 23A-D report artifacts
are likewise evidence outputs rather than rescanned source nodes.

The five original candidates are unchanged and every decision remains
`PENDING`. No file was moved, renamed, archived, or deleted.
