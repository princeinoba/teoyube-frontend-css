# Prompt 23A-D deterministic build and inventory closeout

Prompt 23A-D: **PASS**

Runtime build identity: **PASS**

Non-destructive inventory: **COMPLETE**

Release/deployment: `BLOCKED_SECURITY_ADVISORY`

## Branch and commits

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `8039edaf69b5fc5261716c0f784ad99f0d2e6ad0`
- Build identity implementation:
  `2f8b55cb904a84ac129a26c9f2f50a6747b44d5e`
- Runtime manifest:
  `6de8e820c489080524c1e589a11a7252570b603c`
- Gate execution:
  `ff925572a8117e21d0532f7127cc3111cc297d1b`
- Final report commit: the commit containing this report; a commit cannot
  contain its own hash
- Worktree: expected clean after the final report commit

## Build identity

Before the fix, Prompt 22 expected `I1g8n9KHFcruCq_ERB1C1`, the latest
independent build was `ScebDgB9WUecs9EA8cic3`, and two clean diagnostic
builds produced different IDs: `tN95MP87UZng8-trvmg12` and
`pkxDK78kvksKZQH5CTaxl`.

The supported `generateBuildId` implementation now uses:

- runtime source commit:
  `2f8b55cb904a84ac129a26c9f2f50a6747b44d5e`
- digest:
  `466f4dec9876dbb7d8c6dfd364079014168b5df92fe7e581c36dffbc62d24305`
- algorithm/generator:
  `sha256 / teoyube-runtime-source-digest-2026-07-25.1`
- format: `teoyube-<first 24 lowercase hex digest characters>`
- build ID: `teoyube-466f4dec9876dbb7d8c6dfd3`

Two clean post-fix builds produced the same ID. Report-only changes do not
affect it; runtime-source changes do. Unknown or unclassified runtime paths,
missing/duplicate/malformed/stale records, dirty runtime inputs, and arbitrary
overrides fail closed.

## Runtime and regressions

- Canonical runtime: **Next**
- Static rollback: **RETAINED**
- `runtime:verify`: **PASS**
- `runtime:status`: **PASS**
- Next browser smoke: **PASS — 16/16**
- Static rollback smoke: **PASS**
- Dual runtime: **PASS — 83 checks, Next -> static -> Next**
- Dedicated listeners closed: **YES**
- `npm ci`: **PASS — 408 packages**
- Package/lock integrity: **PASS**
- Typecheck: **PASS**
- Lint: **PASS**
- Unit: **PASS — 272 passed, 1 skipped; focused runtime/accessibility/lineage 38/38**
- Integration: **PASS — 101/101**
- Production/reproducible build: **PASS**
- Imports: **PASS — 1,431 files, 0 missing**
- Architecture: **PASS — 155 files, no forbidden imports/cycles**
- Client/server bundles: **PASS — 42 client files**
- WEB corpus: **PASS — 66 books, 1,189 chapters, 31,103 markers**
- TIG: **PASS**
- Prompt 17 Gate A: **PASS — 64/64**
- Prompt 18 Tool Gate: **PASS**
- Prompt 20 Retrieval Gate: **PASS_REUSED_HASH_BOUND**
- Secret and server/client boundary scans: **PASS**
- Routes/assets/media/tables: **PASS**

The commit-bound resumable gate passed three consecutive logical runs:

| Run | Cells | Maximum readiness |
|---|---:|---:|
| 1 | 72 | 3,125.9 ms |
| 2 | 72 | 3,643.3 ms |
| 3 | 72 | 3,531.2 ms |

All 216 cells were at or below 5,000 ms, and all 105 parity tests passed. Screenshot, DOM/class, asset,
functional, responsive, accessibility/focus parity, and all 35 route tests per
run passed with zero baseline writes. Inherited accessible-name and
`aria-hidden` focus debt remains reported; no WCAG conformance is claimed.

## Security

- Full audit: **0 critical, 9 high — BLOCKED**
- Production-only audit: **0 critical/high — PASS**
- Dependencies changed: **0**
- Lockfile changed: **0**
- Gate C-Preview: `BLOCKED_SECURITY_ADVISORY`
- Gate C-Production: `CLOSED`

The direct network audit submission was denied by the tool security reviewer
because it would disclose dependency metadata. No bypass was attempted.
Current lock-bound local evidence and the owner production report were used.
No waiver, threshold change, or release-readiness claim was made.

## Inventory and protection

- Inventory records: **3,521**
- Dependency edges: **10,726**
- Candidate records: **5**
- Decisions pending: **5**
- Unknown classifications: **0**
- Added classes: one `RUNTIME_CONFIG`, one `BUILD_TOOLING_CURRENT`, one
  `DOCUMENTATION_CURRENT`, and two `TEST_CURRENT`
- Archive/delete execution: **NOT AUTHORIZED**
- Static rollback archive eligible: **NO**

The deterministic manifest connects the Next build identity to the approved
static source and public assets, strengthening the evidence that the static
rollback/protected source must be retained.

Files moved, deleted, renamed, or archived: **0**. Protected visual files,
immutable baselines, owner-approved baselines, static rollback files,
dependencies, and lockfile changed: **0**. Paid provider calls: **0**.

Prompt 23B authorized: **NO**

Prompt 24 authorized: **NO**

Next required action:
`WAIT FOR A SAFE UPSTREAM DEPENDENCY REMEDIATION AND COMPLETE STABILIZATION`

Rollback:

```text
git revert --no-edit 8039edaf69b5fc5261716c0f784ad99f0d2e6ad0..HEAD
```
