# Parity and accessibility reconciliation

- Commit: `72644c45d3e7f2c1918bf4ece21705e75ed4d786`
- Recovery contract: **PASS**
- Product or protected visual changes for reconciliation: **0**
- Immutable baseline writes: **0**
- Complete WCAG 2.2 AA claim: **not made**
- Final performance/accessibility evidence: **216/216 cells passed**, zero accessibility violations, all cells below the 5,000 ms release threshold

## Classification

- **OWNER_APPROVED_ACCESSIBILITY_DELTA:** Phase 5C-1, Phase 5C-2, Phase 5C-3A/A11Y-007, and the exact A11Y-008 forced-colors disposition.
- **REAL_VISUAL_REGRESSION:** none currently reproduced.
- **REAL_FUNCTIONAL_REGRESSION:** none currently reproduced. The complete candidate parity run passed all 27 functional assertions.
- **HARNESS_STALENESS:** Phase 5C delta contracts contained stale hard-coded derived build identity. Current identity is verified directly; historical approved evidence remains fail-closed and hash-bound. For Phase 5C-3A only the four derived manifest fields are normalized before the exact approved blob hash is checked.
- **NONDETERMINISM:** none accepted as a release exemption.

## Legacy static raster classification

The canonical parity run produced nine screenshot differences while its 27 functional assertions passed. No baseline was changed. Eight differences compare the immutable 18 July static source to later owner-authorized route treatments:

| Current route | Legacy view | Existing owner approval |
| --- | --- | --- |
| `/search` | `search` | `TEOYUBE-VISUAL-2026-07-25-SEARCH-001` |
| `/canon` | `canon` | `TEOYUBE-VISUAL-2026-07-28-CANON-FULL-PAGE-002` |
| `/book` | `book` | `TEOYUBE-VISUAL-2026-07-27-BOOK-OF-THE-SAINT-001` |
| `/testimony` | `testimony` | `TEOYUBE-VISUAL-2026-07-27-TESTIMONY-001` |
| `/lexicon` | `lexicon` | `TEOYUBE-VISUAL-2026-07-27-LEXICON-001` |
| `/teo-guide` | `guide` | `TEOYUBE-VISUAL-2026-07-28-TEO-GUIDE-001` |
| `/embedded-videos` | `ui-elements` | `TEOYUBE-VISUAL-2026-07-28-EMBEDDED-VIDEOS-001` |
| `/tables` | `teoyube-tables` | `TEOYUBE-VISUAL-2026-07-28-TABLES-001` |

The ninth difference is `/roadmap`, an owner-only route already classified `NOT_APPLICABLE_INTERNAL_ROUTE` in the parity matrix and absent from the current 23-route public production manifest. These are release classifications, not excuses to rewrite the immutable source or its screenshots.

## Final 216-cell evidence

Three clean-commit samples each exercised 72 route/viewport cells. The samples passed 216/216 cells with zero accessibility violations. Maximum observed durations were 3,063.8 ms, 4,905.7 ms, and 4,921.9 ms against a 5,000 ms limit. The result is **PASS - owner-approved release classification**, with zero unclassified visual or functional regression.
