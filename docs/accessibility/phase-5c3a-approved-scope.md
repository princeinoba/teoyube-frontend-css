# Phase 5C-3A approved accessibility scope

- Status: **LOCKED BEFORE SOURCE CHANGES**
- Owner decisions: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`, `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001`
- Issue: **A11Y-007 only**
- Proposal hash: `e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717`
- Authorized files: `styles/pages/today.css`, `styles/pages/book.css`, `styles/pages/canon.css`, `src/app/globals.css`, `src/components/teoyube/ExploreTabs.tsx`
- Routes: /, /book, /canon, /explore
- States: default, carousel-pagination, memory-filtering, explore-tab-selection
- Viewports: desktop-wide, desktop-standard, tablet-landscape, tablet-portrait, mobile, mobile-small
- Expected pixel impact: **possible**, within the six recorded selectors only
- Expected DOM impact: **none**
- Behavior: Control activation and selection stay unchanged while pointer/touch hit areas become usable.
- A11Y-008 and all manual tasks: **EXCLUDED**
- Rollback: Revert only the selector-scoped A11Y-007 CSS/component commit; leave baselines unchanged.
