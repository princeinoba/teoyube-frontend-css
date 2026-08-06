# Phase 5C-1 after evidence

Status: **PASS** for the exact approved Phase 5C-1 scope.

Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`

| Issue | After result |
| --- | --- |
| A11Y-001 | 12/12 runtime/viewport cells retain 27 options and one selected option with zero unsupported `aria-pressed` states. |
| A11Y-002 | 216/216 hidden Today slides are inert; hidden focusable descendants: 0. |
| A11Y-004 | 12/12 hidden Canon wrappers are inert; programmatic hidden focus: 0; visible navigation operable: 12/12. |

The 36 scoped cells produced zero unexpected browser errors. The 36 recorded network errors are the known, pre-existing blocked media-manifest requests and are not accessibility failures.

## Visual evidence

- Today affected-route parity: PASS, 4/4, across all six protected viewports and functional flows.
- Canon screenshots, DOM, classes, and assets: PASS; the suite remains blocked only by pre-existing A11Y-003 / `STAB-BLOCKER-CANON-FOCUS`.
- Lexicon exact same-page prior-attribute counterfactual: zero pixels in all 12 runtime/viewport cells.
- Protected source, 72 immutable screenshots, 12 desktop DOM snapshots, and all owner-approved support baselines: PASS and unchanged.
- CSS, class, ID, asset, visible-copy, and baseline writes: 0.

An experimental tall full-root Today/Canon same-page counterfactual produced nondeterministic raster counts. The raw counts remain in the JSON for transparency, are labeled non-authoritative, and were not used to mask or excuse any region. Authoritative route parity and immutable contract verification establish **zero unapproved pixel differences**.

Manual accessibility tasks completed: **0**. Complete WCAG 2.2 AA conformance is not claimed.
