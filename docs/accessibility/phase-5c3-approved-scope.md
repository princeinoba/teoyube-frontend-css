# Phase 5C-3 approved accessibility scope

- Status: **LOCKED BEFORE SOURCE CHANGES**
- Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`
- Batch: **5C-3**
- Approved issue IDs: **A11Y-007, A11Y-008**
- Unapproved pixel, DOM, copy, CSS, class, ID, and asset changes: **0**

### A11Y-007 — Controls do not meet the minimum target-size or spacing rule

- Proposal hash: `e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717`
- Authorized files: `styles/pages/today.css`, `styles/pages/book.css`, `styles/pages/canon.css`, `src/app/globals.css`, `src/components/teoyube/ExploreTabs.tsx`
- Routes/states: /, /book, /canon, /explore — default, carousel-pagination, memory-filtering, explore-tab-selection
- Expected pixel impact: **possible**
- Expected DOM/ARIA impact: **none**
- Expected copy impact: **none**
- Expected CSS/layout impact: exact selector-scoped target geometry only
- Pointer/target/description impact: Control activation and selection stay unchanged while pointer/touch hit areas become usable.
- Approved remediation: In Phase 5C, enlarge only the interactive hit areas for Today carousel dots, Canon Watchman dots, Book memory chips/filters, and Explore tabs to at least 24 by 24 CSS pixels, using transparent padding or pseudo hit areas where pixels can remain stable; any visible geometry change must remain within this exact selector scope.
- Rollback: Revert only the selector-scoped A11Y-007 CSS/component commit; leave baselines unchanged.

### A11Y-008 — Canon in-progress status text fails minimum contrast

- Proposal hash: `86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8`
- Authorized files: `styles/pages/canon.css`
- Routes/states: /canon — default, D02-in-progress, D05-in-progress
- Expected pixel impact: **certain**
- Expected DOM/ARIA impact: **none**
- Expected copy impact: **none**
- Expected CSS/layout impact: exact .canon-status.in-progress foreground/background only
- Pointer/target/description impact: No functional behavior changes; the two status badges become readable.
- Approved remediation: In Phase 5C, correct only .canon-status.in-progress foreground/background rendering so the measured pair reaches at least 4.5:1; retain the In Progress text, badge dimensions, status meaning, and all other status colors.
- Rollback: Revert only the A11Y-008 selector change; never replace the Canon baseline.

## Explicit exclusions

- Completed Phase 5C-1: A11Y-001, A11Y-002, A11Y-004
- Completed Phase 5C-2: A11Y-003, A11Y-005, A11Y-006
- Manual evidence: A11Y-009, A11Y-010, A11Y-011, A11Y-MANUAL-001, A11Y-MANUAL-002, A11Y-MANUAL-003, A11Y-MANUAL-004, A11Y-MANUAL-005, A11Y-MANUAL-006, A11Y-MANUAL-007, A11Y-MANUAL-008, A11Y-MANUAL-009
- No baseline replacement, manual-task execution, WCAG conformance claim, Phase 6A work, paid call, push, or deploy.
