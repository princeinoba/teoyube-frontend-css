# Secondary Static Parity and Accessibility Evidence Reconciliation

Authorization: `TEOYUBE-AUG21-SECONDARY-PARITY-RECONCILIATION-2026-08-08-001`

## Result

**PASS_WITH_HISTORICAL_LIMITATION**

The current secondary static runtime is reproducible: two isolated, locked-environment captures matched in all 72 screenshot cells and all 12 DOM snapshots. Current visual failures: **0**. Current functional failures: **0**. Baseline writes: **0**.

The only limitation is historical: the immutable July 18 capture remains valid evidence, but its exact operating system, browser build, font/rasterization stack, and rendering backend were not recorded and cannot be recreated exactly. It is therefore retained as historical evidence, not used as the current regression oracle.

## Evidence disposition

| Evidence | Result |
| --- | --- |
| Current screenshots, capture A vs B | 72/72 PASS; pixel differences 0 |
| Current DOM snapshots, capture A vs B | 12/12 PASS |
| Current visual regressions | 0 |
| Current functional regressions | 0 |
| Real accessibility regressions | 0 |
| Historical semantic differences | 51/51 classified; unresolved 0 |
| Historical screenshot cells | 66 HISTORICAL_STATIC_RUNTIME_DIFFERENCE; 6 within historical tolerance |
| Baseline writes | 0 |

The 51 historical semantic differences comprise:

- 15 `OWNER_APPROVED_ACCESSIBILITY_DELTA`: Canon 11, Search 3, Testimony 1; approval `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`, introducing commit `0716dc6`.
- 36 `HISTORICAL_STATIC_RUNTIME_DIFFERENCE`: Today playback/status 11 (approval `TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001`, commit `436a84e`) and Promise Table playback labels 25 (approval `TEOYUBE-FUNCTIONAL-2026-07-30-PROMISE-TABLE-YOUTUBE-PLAYBACK-001`, commit `d7c55a5`).

No difference was classified `REAL_ACCESSIBILITY_REGRESSION`, `REAL_VISUAL_REGRESSION`, or `UNRESOLVED`.

## Harness reconciliation

The reconciled check uses bundled Chromium in two isolated contexts; locks en-US, UTC, DPR 1, light color scheme, forced colors off, reduced motion, clock and randomness; waits for fonts; and restricts external network activity. It compares current capture A with current capture B for the active gate, while classifying immutable historical evidence separately.

The status surface is reconciled only when its exact approved text, ID, classes, ARIA live behavior, and pill structure match the documented runtime contract. Unknown copy, missing structure, real visual drift, or real functional drift fails. Regression tests prove approved ARIA deltas pass; unapproved ARIA, real visual, and real functional changes fail; environment evidence is separate; and baseline writes remain zero.

## Aggregate controllers

The resumable aggregate controller passed three consecutive logical runs at commit `32621a418780d100cf7a877bc351993fed35e52b`:

| Run | Cells | Maximum readiness | Threshold | Visual/DOM/class/asset/functional |
| --- | ---: | ---: | ---: | --- |
| 1 | 72 | 3,625.4 ms | 5,000 ms | PASS |
| 2 | 72 | 3,848.6 ms | 5,000 ms | PASS |
| 3 | 72 | 3,089.3 ms | 5,000 ms | PASS |

Aggregate performance cells: **216/216 PASS**. The accessibility evidence controller also reports **PASS (216 cells; parity failures 0; inherited missing names 0)**.

Focused verification: 7 Vitest files / 31 tests PASS; TypeScript PASS; lint PASS; recovery verification PASS; focused protected parity groups 4/4, 4/4, 7/7, and 11/11 PASS.

## Release boundary

- Starting checkpoint: `2db1889c2b27fb9a9eff35c9922f0fbdf7c29f9e`
- Reconciled evidence commit: `32621a418780d100cf7a877bc351993fed35e52b` (report commit follows)
- Production runtime commit: `d95b6bc3abcc2e1f3592bbf5ae90970a40010954`
- Production deployment: `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM` — READY
- Production URL: https://teoyube-frontend-css.vercel.app
- Health identity: `production/vercel-production`
- Runtime-source digest: `9f8e05bb7c9d62995411593124a3f83a3f29f1cd867ebedf9d41522ed8355b9b` — unchanged
- Product source, protected CSS/DOM/assets, and baseline changes: **0**
- Production redeployment: **not required**
- Live AI, vector retrieval, embeddings, broad RAG, database persistence, research collection, and durable private memory: **OFF**
- Paid provider calls: **0**
- Genuine blockers: **none**

The complete per-cell and semantic inventory is in `secondary-static-failure-inventory.json`; the locked and historical environment boundary is in `secondary-static-environment-manifest.json`.
