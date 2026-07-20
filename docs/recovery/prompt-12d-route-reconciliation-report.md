# Prompt 12D Route Reconciliation Report

Date: 2026-07-20

Branch: `recovery/visual-source-of-truth`

Commit before work: `750862ded54898d64f36b8e074f77e88f8ce3920`

Commit after work: recorded in the final handoff; this report is part of that commit.

Owner amendment: `TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D`

Gate outcome: **PASS — PARITY GATE CLOSED; STATIC RUNTIME REMAINS CANONICAL**

Prompt 12D retains Promise Search, Daily Word, and Explore as distinct public routes; separates route visibility, parity source, and gate status; keeps Compass as the only canonical redirect; and restores Dashboard to development-only. No protected visual source, immutable static baseline, or frozen pre-migration contract is changed.

## Verified route inventory

| Routes | Visibility | Parity source | Gate status |
| --- | --- | --- | --- |
| 11 immutable public views | `RETAINED_PUBLIC` | `IMMUTABLE_STATIC` | `PASS` |
| `/prayer`, `/journey`, `/journal` | `RETAINED_PUBLIC` | `FROZEN_PRE_MIGRATION` | `PASS` |
| `/settings`, `/privacy`, `/consent`, `/terms`, `/profile`, `/personalization`, `/daily-word`, `/explore`, `/promise-search` | `RETAINED_PUBLIC` | `OWNER_APPROVED_NEXT_SUPPORT` | `PASS` |
| `/compass` → `/calling-compass` | `RETAINED_PUBLIC` alias | `CANONICAL_REDIRECT` | `PASS` |
| `/dashboard`, `/dev/teoyube-health`, `/tig/debug` | `DEVELOPMENT_ONLY` | `NOT_APPLICABLE` | `NOT_APPLICABLE_INTERNAL_ROUTE` |
| `/graph` and retained TIG internal routes | `INTERNAL_ONLY` | `NOT_APPLICABLE` | `NOT_APPLICABLE_INTERNAL_ROUTE` |
| `/roadmap` | `OWNER_ONLY` | `IMMUTABLE_STATIC` | `NOT_APPLICABLE_INTERNAL_ROUTE` |

The non-static retained-public total is twelve: three frozen-contract routes plus nine owner-approved Next support routes. The Compass alias is recorded separately.

## Support baseline

- Root: `tests/visual/baselines/owner-approved-next-support/`
- Routes: 9
- Required viewports: 6
- Default captures: 54
- Interaction captures: 16
- Total captures: 70
- Artifacts per capture: screenshot, rich contract, accessibility/performance/storage audit
- Total files including manifest: 211
- Accessibility findings in focused captures: 0
- Browser storage writes: 0
- Dashboard/internal route captures: 0

Historical R8 support evidence remains unchanged under `tests/visual/baselines/owner-approved-support-routes/` and continues to verify. Prompt 12D's current taxonomy supersedes its Dashboard grouping without rewriting the historical manifest.

## Preserved distinct behavior

- `/promise-search`: separate controlled input, deterministic legacy search pipeline, Scripture/promise content, up-to-six visible result projection, keyboard query behavior, no redirect, and no browser persistence.
- `/daily-word`: Scripture/promise/action/prayer/explanation output and Generate Today's Journey session action. The approved route has no separate reflection control; `/journal` remains the retained reflection capability.
- `/explore`: two TIG production surfaces, Canon journey summary, all nine tabs, Promise Table state, and local filtering.
- `/compass`: permanent redirect to `/calling-compass`, preserving safe `assessment`, `topic`, and `q` parameters and dropping unknown input.

## Verification

| Command | Result |
| --- | --- |
| `npm run recovery:verify` | PASS before and after work — 268 protected source hashes, 210 protected visual files, 12 owner references, 72 immutable screenshots, 12 desktop DOM snapshots, TIG, 1,411 imports, and 71 architecture-boundary files |
| `npm run recovery:next-support:verify` | PASS — immutable Prompt 12D manifest plus all 70 route/state/viewport comparisons and 5 focused behavior/boundary tests |
| `npm run visual:parity:verify` | PASS — second static capture validates all 72 screenshots and 12 DOM snapshots within the documented cross-platform tolerance |
| `npm run visual:parity:shell` | PASS — approved shell at all six viewports |
| `npm run visual:parity:next` | PASS — 35 scoped route tests in 13.3 minutes, including every retained static-source viewport plus frozen Prayer, Journey, and Journal checks |
| `npm run visual:parity:gate:audit` | PASS — 72 accessibility/focus/performance pairs, 0 violations, 2 unchanged-threshold retries, 17.9 minutes |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — zero warnings |
| `npm run test` | PASS — 11 files, 59 tests |
| `npm run app:build` | PASS — Next 16.2.10, 53 generated routes; `/compass` remains dynamic |
| `npm run test:e2e` | PASS — fresh Next preview server and secret-safe health response |

The fresh audit artifact was generated at `2026-07-20T12:23:17.266Z`: 12 views, six viewports, 72 cells, zero violations. Maximum final ready time was 4,547.9 ms for static and 2,790.6 ms for Next, below the unchanged 5,000 ms threshold. The test-only audit now uses the same settle timing as the route-parity harness and a 40-minute aggregate execution budget; it does not change or loosen any cell-level assertion.

The immutable historical R8 support artifact verifier also passes. Its superseded 10-route live replay is not a Prompt 12D gate: a diagnostic replay correctly exposed that its server-rendered Daily Word varies by build date. Prompt 12D replaces that current route source with the immutable nine-route, 70-capture baseline rather than rewriting historical evidence.

## Runtime and gate

- Static runtime: canonical; `npm start` remains `node --preserve-symlinks-main server.js`.
- Next runtime: separate preview only.
- Runtime cutover: not authorized.
- Prompt 13: **UNLOCKED** by the completed Prompt 12D gate; no Prompt 13 work was implemented here.
- Prompt 14: not authorized.
- Rollback: `git revert <Prompt-12D-commit>` after commit; before commit, restore only files listed in the final handoff.
