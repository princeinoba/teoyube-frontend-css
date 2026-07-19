# Prompt 12B Owner Approval Gate

Date: 2026-07-19

Branch: `recovery/visual-source-of-truth`

Commit before work: `4c3aaba00b72bdad99ff376a0a23a0718e9dfc7b`

Commit after work: recorded in the final task handoff; this report is part of that commit.

Approval ID: `TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8`

Gate outcome: **BLOCKED — PROMPT 13 REMAINS LOCKED**

The owner decision closes V-01 through V-04 and establishes a separate initial source of truth for the ten routes it names. All approval-bound baseline, route, redirect, internal-navigation, static-source, TIG, import, architecture, build, type, lint, unit, browser, screenshot, DOM/class/asset/focus, accessibility-parity, and safety checks pass. The approval does not name `/prayer`, `/journey`, or `/journal` as initial visual sources and does not classify them as internal. Those retained public routes therefore remain `BLOCKED_MISSING_STATIC_COUNTERPART`. The approval is not broadened by inference, and Prompt 13 is not implemented.

## Owner decision records

- Verbatim owner decision: `docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.md`
- Machine-readable binding: `docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.json`
- Durable side-by-side, overlay, and diff evidence: `docs/owner-approvals/visual/evidence/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8/`
- Prompt 12A sources: `docs/recovery/owner-review/prompt-12a-visual-review.md`, `docs/recovery/owner-review/prompt-12a-visual-review.json`, and `docs/recovery/prompt-12a-remediation-report.md`

The Markdown decision is recorded verbatim. The JSON binds the approval ID, date, owner, approved commit, Prompt 12A reports, all 24 durable review-artifact hashes, V-01 through V-04, each support-route decision, and the explicit prohibitions.

## Scope verification

| Check | Result |
| --- | --- |
| Active branch | PASS — `recovery/visual-source-of-truth` |
| Starting HEAD | `4c3aaba00b72bdad99ff376a0a23a0718e9dfc7b` |
| Baseline tag | PASS — `teoyube-original-upload-2026-07-18` dereferences to `607ec213e84002b1715b1ced9f7925a90a07f26b` and remains an ancestor |
| Starting worktree | PASS — clean |
| Prompt 12A scope | PASS — V-01 through V-04 were the only baseline-route owner decisions |
| Structural/branded/layout/asset/copy/control/responsive/interaction differences | 0 |
| Protected visual source changes | 0 |
| Original static baseline changes | 0 |
| Default `npm start` | Static runtime: `node --preserve-symlinks-main server.js` |
| Next runtime | Separate preview only: `next start` |

## Owner-reviewed raster decisions

| ID | State | Decision | Bound result |
| --- | --- | --- | --- |
| V-01 | Today, tablet-landscape | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | PASS — evidence hash-bound; threshold unchanged |
| V-02 | Search, listed desktop/tablet/mobile states | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | PASS — reviewed evidence hash-bound; current corrected render remains pixel-identical |
| V-03 | Canon, desktop-wide | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | PASS — evidence hash-bound; threshold unchanged |
| V-04 | Shell mobile sidebar open, tablet-portrait | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | PASS — evidence hash-bound; threshold unchanged |

The acceptance does not increase tolerance, mask a region, replace a baseline, approve a future difference, or authorize runtime cutover.

## Support-route baseline

The ten approved Next renders are frozen separately under `tests/visual/baselines/owner-approved-support-routes/`:

- 181 files total;
- 60 screenshots: ten routes at six viewports;
- 60 rich DOM/class/asset/geometry/label/control/focus/responsive contracts;
- 60 Prompt 12A surface contracts;
- one approval-bound manifest.

The manifest records route, viewport, deterministic state, capture environment, approved commit, approval ID, screenshot hash, both contract hashes, and strict recapture metrics. `scripts/recovery/verifyOwnerApprovedSupportBaselines.cjs` rejects an approval, manifest, source definition, artifact, route mapping, DOM/asset contract, Graph boundary, or Compass redirect change. Live candidates stay under `.tmp/visual-parity/`.

## Route status

| Route(s) | Status | Evidence / reason |
| --- | --- | --- |
| `/`, `/search`, `/canon`, `/promise-table`, `/calling-compass`, `/book`, `/lexicon`, `/testimony`, `/teo-guide`, `/embedded-videos`, `/tables` | `PASS` | All applicable automated evidence passes and the owner decision is bound to the exact Prompt 12A evidence |
| `/settings`, `/privacy`, `/consent`, `/terms`, `/profile`, `/daily-word`, `/dashboard`, `/explore`, `/personalization`, `/promise-search` | `OWNER_APPROVED_SOURCE_BASELINE` | Separate 60-cell owner-approved baseline and live verifier pass |
| `/compass` | `REDIRECT_TO_CANONICAL_PUBLIC_ROUTE` | Permanent redirect resolves to `/calling-compass`; no duplicate product surface |
| `/graph` | `NOT_APPLICABLE_INTERNAL_ROUTE` | `INTERNAL_ONLY`; absent from normal navigation |
| `/roadmap` | `NOT_APPLICABLE_INTERNAL_ROUTE` | Owner-only; absent from normal navigation |
| `/prayer`, `/journey`, `/journal` | `BLOCKED_MISSING_STATIC_COUNTERPART` | Retained public routes omitted from the scoped owner source-of-truth decision |
| TIG, development health/debug, evaluation, media-review, and operational routes | `NOT_APPLICABLE_INTERNAL_ROUTE` | Internal, development-only, or owner-only; absent from normal public navigation |

No route remains `NOT_VERIFIED`. Every route has an explicit terminal status, but the three retained public blockers mean the Prompt 13 entry criterion “all retained public routes are PASS or OWNER_APPROVED_SOURCE_BASELINE” is not satisfied.

## Files changed

Approval and documentation:

- `docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.md`
- `docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.json`
- 24 files under `docs/owner-approvals/visual/evidence/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8/`
- `docs/recovery/visual-parity-matrix.md`
- `docs/recovery/next-preview-parity-gate.md`
- this report

Support baseline and executable contracts:

- 181 files under `tests/visual/baselines/owner-approved-support-routes/`
- `tests/visual/parity/support-route-baseline-source.json`
- `tests/visual/parity/support-route-baseline-config.ts`
- `tests/visual/parity/support-route-baseline-capture.spec.ts`
- `tests/visual/parity/support-route-baseline-parity.spec.ts`
- `scripts/recovery/materializePrompt12bApprovalEvidence.cjs`
- `scripts/recovery/materializeOwnerApprovedSupportBaselines.cjs`
- `scripts/recovery/verifyOwnerApprovedSupportBaselines.cjs`
- `scripts/recovery/runVisualParitySuite.cjs`
- `playwright.visual.config.ts`
- `package.json`

Route/status and regression contracts:

- `src/app/compass/page.tsx`
- `tests/visual/parity/next-route-status.json`
- `tests/visual/parity/support-route-status.json`
- `tests/visual/parity/config.ts`
- `tests/visual/parity/remaining-retained-parity.spec.ts`
- `tests/visual/parity/full-gate-audit.spec.ts`
- `tests/build-foundation/visual-parity-contract.test.ts`
- `tests/build-foundation/remaining-retained-contracts.test.ts`

Protected visual files changed: **0**.

Original immutable static baseline files changed: **0**.

## Verification results

| Command | Result |
| --- | --- |
| `npm run recovery:verify` before work | PASS — protected source, static DOM/CSS/assets, 72 screenshots, 12 DOM snapshots, TIG, imports, and architecture |
| `npm run recovery:support-routes:contract:verify` | PASS — 10 routes, 6 viewports, 60 screenshots, 120 contracts, 24 owner-review artifacts |
| `npm run recovery:support-routes:verify` | PASS — stored binding plus 60 live route/viewport cells and redirect/internal boundaries |
| `npm run visual:parity:verify` | PASS — second static capture reproduced 72 screenshots and 12 DOM snapshots; temporary candidates deleted |
| `npm run visual:parity:shell` | PASS — six viewports and responsive drawer states |
| `npm run visual:parity:today` | PASS — six visual cells and four browser/interaction tests |
| `npm run visual:parity:search` | PASS — six visual cells and four browser/interaction tests |
| `npm run visual:parity:canon-promise` | PASS — twelve visual cells and four browser/interaction tests |
| `npm run visual:parity:prayer-calling-journey` | PASS — Calling visual cells plus six functional/frozen-structure tests; this does not create source baselines for Prayer or Journey |
| `npm run visual:parity:journal-testimony-book` | PASS — Book/Testimony visual cells plus six functional/frozen-structure tests; this does not create a source baseline for Journal |
| `npm run visual:parity:remaining-retained` | PASS — 11 tests; five immutable views, ten approved support routes, media, Tables, Graph/navigation, and Compass redirect |
| `npm run visual:parity:gate:audit` | PASS — 72 accessibility/focus/performance pairs, 0 violations; Chrome recycled per route; 3 transient cells passed the unchanged same-threshold retry |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — zero warnings |
| `npm run test` | PASS — 11 files, 59 tests |
| `npm run test:e2e` | PASS — fresh Next preview and secret-safe health endpoint |
| `npm run app:build` | PASS — Next 16.2.10, 53 routes |
| `npm run recovery:verify` after work | PASS — 268 protected files, 72 original screenshots, 12 original DOM snapshots, 60 support screenshots, 120 support contracts, TIG, 1,411 import checks, and 71 architecture files |

Diagnostic retries were not hidden: one live support run encountered a Chrome network-service crash before its first navigation and then passed all 60 cells after a bounded retry guard was added; an old retained-route test still treated Graph and Compass as visual surfaces and was narrowed to the exact owner-approved ten-route scope; the accessibility audit exposed asynchronous legacy-overlay and browser-service races, which were stabilized only in the test harness without changing thresholds or production output.

## Runtime, safety, and rollback

- Static runtime: canonical and unchanged.
- Next preview: separate, local, and noncanonical.
- Runtime cutover: not authorized and not performed.
- Prompt 13 implementation: not started.
- Secret exposure or external-service connection: none.
- Rollback: `git revert <Prompt-12B-commit>`.
- Owner approval still required: **YES** — a scoped visual-source or route-classification decision for `/prayer`, `/journey`, and `/journal`.
- Prompt 13: **BLOCKED**.
