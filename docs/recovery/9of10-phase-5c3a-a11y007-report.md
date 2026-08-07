# Teoyube 9/10 Phase 5C-3A A11Y-007 report

Status: **PASS**
Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001`
Proposal hash: `e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717` — **PASS**
Starting commit: `8f01138907a9c76439bd725662097bb6106dea52`
Implementation/test commits: `95a0816`, `6895368`

## Result

The exact A11Y-007 target-size scope is fixed. Across 42 focused cells (24 Next and 18 static), 66 groups and 570 targets now have a minimum 24×24 CSS-pixel target. All 570 pass; target violations are zero; 284/284 required center-hit checks pass; unintended overlap is zero; all 42 behavior comparisons and 66 interaction groups pass.

The approved interface, behavior, DOM hierarchy, class and ID structure, visible copy, assets, controls, and baselines are preserved. Three protected CSS files changed only under the exact owner-approved A11Y-007 delta contract; unapproved protected changes are zero. The scoped CSS delta is 1,119 bytes. A11Y-008 received zero product changes and remains **NOT_REPRODUCED_CURRENT / NEEDS_MORE_EVIDENCE**. No manual evidence task was performed, and complete WCAG 2.2 AA conformance is not claimed.

## Verification

- Recovery: PASS — 72 immutable screenshots, 12 desktop DOM snapshots, and owner-approved support baselines unchanged.
- Typecheck, lint, build, integration, focused and serial browser, security, Gate A, Teo Guide, deterministic retrieval, runtime, and dual-runtime checks: PASS.
- Unit: PASS in the isolated serial run; earlier parallel host runs had timeout-only failures.
- Full accessibility audit: 311 cells, zero harness errors; the scoped A11Y-007 family is closed. Two broader Canon contrast occurrences remain governed by the A11Y-008 evidence hold.
- Full dependency audit: one current high `js-yaml` advisory; production audit: zero. No dependency or lockfile change was authorized.
- Performance: the first run at pre-amend evidence commit `9617865` had all 72 cells below 5,000 ms (maximum 3,843.1 ms, static Today desktop-wide), then nine inherited broad parity failures stopped the controller. The current-commit gate therefore has 0/216 matched cells and remains blocked. Calling tablet portrait was 1,254.1 ms static / 1,029.8 ms Next; Canon maxima were 1,768.9 ms static / 1,277.0 ms Next. CSS remains 1,416,075 / 948,538 bytes. These are separate Phase 2A/Gate C blockers.
- Paid OpenAI/embedding calls: 0.

## Program state

Phase 5C-3A: **PASS**. Phase 5C remains **PARTIAL / WAITING EVIDENCE** because A11Y-008 and all approved manual/AT tasks remain incomplete. Phase 2A is **BLOCKED**, Phase 3 is **WAITING_OWNER**, Phase 4 is **WAITING_OWNER_SESSION_DATA**, and Phase 6A remains **READY, NOT STARTED**.

## Rollback

`git revert <phase-5c3a-evidence-commit> 6895368 95a0816`
