# TeoyubeSearch owner-approved visual transformation report

Approval-ID: `TEOYUBE-VISUAL-2026-07-25-SEARCH-001`
Owner: Prince Okiemute Inoba — Teoyube Project Owner
Branch: `recovery/visual-source-of-truth`
Starting commit: `037152e97478dfd096f5f6799156647f865ebb02`
Approval commit: `e8d6561`
Style commit: `60e674e`
Evidence commit: the commit containing this report

## Scope and source changes

- Product source changed: `styles/pages/search.css` only.
- Protected visual source changed: 1 file under owner approval
  `TEOYUBE-VISUAL-2026-07-25-SEARCH-001`.
- Protected contract metadata changed: only the `styles/pages/search.css`
  size/hash entries in the protected visual-source manifest and original-static
  visual contract.
- Final stylesheet SHA-256:
  `b889c52caabd5f3c36c03d8554888027f808c4bac95568ea193fa1cbaa6b324e`.
- DOM, IDs, class attributes, product copy, TypeScript/JavaScript, data, routes,
  assets, packages, build configuration, and test source changed: 0.
- Immutable static screenshots changed: 0.
- Immutable desktop DOM snapshots changed: 0.
- Owner-approved support-route baselines changed: 0.
- Owner-approved Next support-route baselines changed: 0.

## Rendered result

At 1536×1024 the finalized canonical Search geometry is:

- sidebar grid track: 198px; rendered sidebar surface: x=4, width=190;
- main content: x=210, width=1302;
- hero: y=71.97, width=1302, height=338.25;
- search form: x=237.39, y=210.67, width=672, height=55.58;
- coherent suggestion surface: y=277.44 through 393.22;
- results shell: y=418.22, width=1302;
- three equal cards: width=413.59/413.61/413.59, height=549.89;
- horizontal overflow: none.

The reference geometry is closely reproduced. The cards remain taller than the
mock because the owner required every existing action, feedback control, and
second disclosure to remain visible and functional. Existing header copy and
the split suggestion DOM also remain unchanged as explicitly approved.

All required viewports were captured for canonical Next and static rollback:
1536×1024, 1440×900, 1280×800, 1024×768, 768×1024, and 390×844. Every capture
has zero horizontal overflow, 74 Search controls, zero hidden/disabled Search
controls in the default surface inventory, and zero controls below 24px high.

## Visual comparison

The evidence method performs per-channel absolute RGB comparison at device
scale factor 1. A changed pixel uses maximum RGB delta greater than 16; the
visual diff amplifies channel deltas 4×.

- Reference vs before normalized mean absolute error: 31.147463%.
- Reference vs after normalized mean absolute error: 10.096819%.
- Relative improvement: 67.583816%.
- Reference vs after pixels above threshold: 36.219724%.
- Canonical Next vs static rollback normalized mean error:
  0% to 0.001064% across all six viewports.
- Next/static exact pixels: 99.989446% to 100%.

This is an honest metric, not a claim of pixel identity with the mock. The
remaining reference delta is dominated by the explicitly retained controls,
existing copy, and real application content. Side-by-side, 50% overlay,
amplified diff, runtime-agreement diff, screenshots, geometry, and hashes are
stored beside the approval evidence.

## Functional and accessibility evidence

The focused Playwright audit passes 25/25 checks:

- all 74 Search controls present, enabled, operable, and at least 24px high;
- keyboard Tab reaches every currently exposed Search control;
- controls inside closed disclosures become focusable when expanded;
- focus indication is visible;
- search submission, category selection, smart suggestions, deterministic
  Clear reset, and quick prompts work;
- both explanation panels expand without clipping or horizontal overflow;
- Save to Book, Add to Promise Table, Explore Journey, View Graph, Compare,
  bookmark, grid/list, sort, and all eight feedback actions retain behavior;
- mobile navigation opens, closes with Escape, and restores toggle focus.

Axe WCAG A/AA automation reports 0 violations at 1536×1024 and 390×844.
`aria-prohibited-attr` and color contrast remain manual-review/incomplete items
(7 and 48 nodes respectively per viewport); no conformance claim is made.

## Verification results

- `npm run recovery:visual:verify`: PASS; 72 immutable screenshots and 12
  desktop DOM snapshots byte-verified.
- `npm run recovery:verify`: PASS.
- `npm run recovery:tig:verify`: PASS.
- final monitored `npm run app:build`: PASS, including TIG, Scripture, safety,
  Teo Guide, live-AI, and retrieval bundle boundaries.
- `npm run typecheck`: PASS.
- `npm run lint`: PASS.
- `npm run test`: PASS — 38 files passed, 1 skipped; 276 tests passed, 1
  skipped.
- `npm run test:e2e`: PASS — 16/16, including the complete Prompt 13 journey.
- focused Search browser audit: PASS — 25/25.
- accessibility automation: PASS — 0 violations.
- canonical health: PASS — HTTP 200.
- runtime status: canonical Next, static-node rollback, deterministic build ID
  `teoyube-7f1d01b5874cee35175bd6b4` matches the source digest.

## Known limitations and separate runtime evidence gap

`npm run runtime:verify` reports:

- protected visual-source manifest hash differs;
- recorded runtime source digest is stale.

This is expected after the owner-authorized protected Search CSS/manifest
change. Updating the separate canonical cutover decision/digest record was not
among the files authorized by this approval, so it was not changed. Canonical
Next is running and healthy; static rollback remains available but was stopped
after evidence capture to avoid a listener leak. The static capture also
observed the pre-existing `Published media manifest returned 404` diagnostic;
this CSS-only task did not alter or mask it.

## Rollback

Revert the evidence commit first, then `60e674e`, then `e8d6561`, and rerun
`npm run recovery:verify`. Do not regenerate an immutable baseline.

Owner approval required: NO for this completed Search transformation. A
separate owner-authorized runtime-evidence lineage update is required only if
`runtime:verify` must be made green after the approved protected-manifest
change.

Next gate: PASS for the owner-approved Search visual transformation; BLOCKED
only for the separate runtime cutover digest-record refresh.