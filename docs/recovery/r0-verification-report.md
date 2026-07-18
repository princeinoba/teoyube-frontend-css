# Phase R0 Recovery Verification Report

Date: 2026-07-18  
Branch: `recovery/visual-source-of-truth`  
Baseline tag: `teoyube-original-upload-2026-07-18`  
Baseline commit: `607ec213e84002b1715b1ced9f7925a90a07f26b`

## Result

Phase R0 passes. The workspace is on the clean recovery branch, the baseline tag resolves to the original uploaded-source commit, all recovery-specific contracts pass, every owner reference resolves, and the immutable runtime evidence verifies byte-for-byte. The baseline-to-recovery diff changes zero paths listed by the 268-entry protected visual-source manifest.

The static Node runtime remains the canonical visual and behavioral source of truth. The Next.js source remains a migration layer and has no authority to replace or redesign the approved frontend.

The separate Phase 11.6C.3 smoke remains honestly blocked at `publication_baseline`. No approval record, lifecycle evidence, checksum, protected media file, contract, manifest, DOM snapshot, or screenshot was changed or regenerated to manufacture a passing result.

## Authority files reviewed before editing

The following command was run before this report was created:

```powershell
Get-Content -LiteralPath 'AGENTS.md'
Get-Content -LiteralPath 'docs/recovery/RECOVERY_BRANCH.md'
Get-Content -LiteralPath 'docs/recovery/VISUAL_SOURCE_OF_TRUTH.md'
$approvalFiles = @(rg --files docs/owner-approvals/visual)
$approvalFiles | ForEach-Object { Get-Content -LiteralPath $_ }
```

Files read in full:

- `AGENTS.md`
- `docs/recovery/RECOVERY_BRANCH.md`
- `docs/recovery/VISUAL_SOURCE_OF_TRUTH.md`
- `docs/owner-approvals/visual/README.md`
- `docs/owner-approvals/visual/VISUAL_CHANGE_REQUEST_TEMPLATE.md`

The approval template contains `Decision: PENDING — OWNER ONLY`, not an approved decision. No owner approval was created or inferred.

## Branch and baseline identity

Commands:

```powershell
git branch --show-current
git rev-parse 'teoyube-original-upload-2026-07-18^{}'
```

Results:

```text
recovery/visual-source-of-truth
607ec213e84002b1715b1ced9f7925a90a07f26b
```

The annotated tag therefore peels to the required `607ec21` commit.

## Baseline-to-recovery diff review

Commands:

```powershell
git log --oneline --decorate 'teoyube-original-upload-2026-07-18..HEAD'
git diff --stat 'teoyube-original-upload-2026-07-18..HEAD'
git diff --name-status 'teoyube-original-upload-2026-07-18..HEAD'
git diff 'teoyube-original-upload-2026-07-18..HEAD' -- .gitignore package.json src/lib/teoyube/calling/calling-engine.ts
```

Results:

- Three recovery commits were present before R0: `8bccd29`, `57d2bba`, and `0d96f98`.
- Diff summary: `122 files changed, 171922 insertions(+), 7 deletions(-)`.
- Added paths are recovery rules, owner-approval scaffolding, product-source PDFs, recovery documentation, verification tooling, protected contracts, and immutable baseline artifacts.
- `.gitignore` only adds Python recovery-tool exclusions.
- `package.json` only adds recovery verification commands.
- `src/lib/teoyube/calling/calling-engine.ts` replaces a broad TIG barrel import with narrow imports from the owning modules.
- No failed-redesign feature directory, page redesign, stylesheet, or replacement asset appears in the reviewed diff.

Protected-path intersection command:

```powershell
$tag = 'teoyube-original-upload-2026-07-18'
$manifest = Get-Content -Raw -LiteralPath 'tests/visual/contracts/protected-visual-source-manifest.json' | ConvertFrom-Json
$protectedPaths = @($manifest.files | ForEach-Object { if ($_ -is [string]) { $_ } else { $_.path } })
$changedPaths = @(git diff --name-only "$tag..HEAD")
$intersection = @($changedPaths | Where-Object { $protectedPaths -contains $_ })
```

Results:

```text
PROTECTED_MANIFEST_ENTRIES=268
CHANGED_PATHS_FROM_TAG=122
PROTECTED_DIFF_INTERSECTION=0
```

Protected visual source files changed: **0**.

## Recovery verification

Command run before report creation:

```powershell
npm run recovery:verify
```

Result: exit code `0`.

Sub-check results:

| Sub-check | Result | Evidence |
| --- | --- | --- |
| Visual source contract | PASS | 268 protected files match `teoyube-original-upload-2026-07-18` |
| Static DOM contract | PASS | 185 IDs, 398 class names, 9 stylesheets |
| Original static visual contract | PASS | 210 protected files, 12 owner references, 1,015 DOM classes, 525 DOM IDs, 1,152 CSS classes, 34 animation names |
| Runtime visual baselines | PASS | 72 screenshots and 12 desktop DOM snapshots |
| TIG calling seed contract | PASS | Direct owner-module import is enforced |
| Import validation | PASS | 1,376 files checked; 0 missing imports; primary runtime `static-node-app`; Next migration layer checked |

No verification manifest, DOM contract, or screenshot was regenerated.

## Owner reference map

Command:

```powershell
$owner = Get-Content -Raw -LiteralPath 'tests/visual/baselines/owner-reference-manifest.json' | ConvertFrom-Json
$missingOwner = @($owner.views | Where-Object { -not (Test-Path -LiteralPath $_.ownerReference) })
```

Results:

```text
OWNER_REFERENCE_COUNT=12
OWNER_REFERENCE_MISSING=0
```

Every mapped owner reference exists under `Asset/`.

## Immutable runtime baseline

Command:

```powershell
$runtime = Get-Content -Raw -LiteralPath 'tests/visual/baselines/static-runtime/manifest.json' | ConvertFrom-Json
($runtime.viewports.PSObject.Properties | Measure-Object).Count
@($runtime.artifacts | Where-Object kind -eq 'screenshot').Count
@($runtime.artifacts | Where-Object kind -eq 'dom').Count
@($runtime.artifacts | Where-Object { -not (Test-Path -LiteralPath $_.path) }).Count
```

Results:

```text
RUNTIME_VIEWPORT_COUNT=6
RUNTIME_VIEWPORTS=desktop-wide,desktop-standard,tablet-landscape,tablet-portrait,mobile,mobile-small
RUNTIME_VIEW_COUNT=12
RUNTIME_SCREENSHOT_COUNT=72
RUNTIME_DOM_COUNT=12
RUNTIME_ARTIFACTS_MISSING=0
```

`npm run recovery:verify` additionally recomputed and verified the recorded artifact sizes and SHA-256 hashes byte-for-byte.

## Product-source documents

Command:

```powershell
Get-ChildItem -LiteralPath 'docs/product-source' -Filter '*.pdf' -File
```

Results:

```text
Promise Clusters.pdf                                             79332 bytes
Teoyube Language Grammar and Lexicon Architecture.pdf           217257 bytes
Teoyube Promise Cluster Architecture.pdf                         56992 bytes
TEOYUBE THEOLOGY CONSTITUTION V1.pdf                              30022 bytes
TeoyubeSearch Framework.pdf                                      70701 bytes
```

All five normative product-source PDFs exist.

## Owner approval template

Command:

```powershell
$template = Get-Content -Raw -LiteralPath 'docs/owner-approvals/visual/VISUAL_CHANGE_REQUEST_TEMPLATE.md'
[bool]($template -match '(?m)^Decision:\s*APPROVED\s*$')
```

Result:

```text
False
```

The template is pending and contains no approved owner decision.

## Phase 11.6C.3 smoke

This command was run exactly once during R0:

```powershell
npm run phase116c3:smoke
```

Result: exit code `1`, with the known separate blocker:

```text
Error: publication_baseline: Published lifecycle, source checksums, and approval bindings remain valid.
    at check (...\scripts\phase116c3RuntimeIntegrationSmoke.cjs:87:24)
    at run (...\scripts\phase116c3RuntimeIntegrationSmoke.cjs:93:3)
```

The existing read-only recovery diagnosis identifies the underlying publication-baseline blockers as:

- `owner_gate`
- `lifecycle_state`
- `source_integrity_current`

This is an integrity blocker separate from visual recovery. It remains blocked and was not weakened, rewritten, repaired, or marked complete.

## R0 acceptance record

| Criterion | Result |
| --- | --- |
| Active recovery branch is correct | PASS |
| Baseline tag resolves to `607ec21` | PASS |
| Baseline-to-recovery diff reviewed | PASS |
| Protected visual files changed | 0 |
| Recovery-specific verification | PASS |
| Publication blocker recorded honestly | PASS — remains BLOCKED |
| Owner references resolve | PASS — 12 of 12 |
| Responsive screenshot baseline | PASS — 72 across 6 viewports |
| Desktop DOM snapshots | PASS — 12 |
| Product-source PDFs exist | PASS — 5 of 5 |
| Approval template is unapproved | PASS |
| Static runtime remains canonical | CONFIRMED |
| Manifests or baselines regenerated | NO |

## Changes and rollback

R0 adds only this report:

```text
docs/recovery/r0-verification-report.md
```

The reviewed branch contained 122 changed paths before R0. Including this new, unprotected report, the final tag-to-R0-commit diff is expected to contain 123 changed paths with a protected-path intersection of zero; this is verified again after commit.

If this report is inaccurate, remove only this file. Do not modify or remove recovery guardrails, contracts, manifests, screenshots, DOM snapshots, owner references, or approval protocols.
