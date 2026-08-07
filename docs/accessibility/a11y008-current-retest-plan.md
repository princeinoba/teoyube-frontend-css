# A11Y-008 current-state retest plan

- Phase: **5D-1 evidence only**
- Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001`
- Historical proposal: `86157f49c8d6e4e897ad3c51a1fa7486c0f8ce7b09ac4bdd8420a0c0277cb2d8`
- Implementation authorized: **NO**
- Criterion: **WCAG 2.2 1.4.3**, normal-text threshold **4.5:1**

## Exact elements

- D02: `[data-canon-item="canon-map-D02"] .canon-status.in-progress`
- D05: `[data-canon-item="canon-map-D05"] .canon-status.in-progress`

## Deterministic matrix

Both Next `/canon` and static `/#canon`, six protected viewports, pinned Playwright Chromium, installed Chrome, and installed Edge, at 100% and a recorded 200% browser-zoom-equivalent device-metrics configuration. Applicable states are default, hover, corresponding media-selected, reduced-motion, and forced-colors. Focus, pointer/keyboard active, selected/current, and disabled states are explicitly `NOT_APPLICABLE` because these labels are noninteractive status text. Overlay geometry is measured: no intersection is `NOT_APPLICABLE`; an unrelated global status notice that occludes the label is also `NOT_APPLICABLE` to text contrast because it hides rather than restyles the label. In that case the notice is suppressed only in the harness after the occlusion evidence is recorded, allowing the underlying states to be measured.

Expected matrix: at most **720 applicable**, at least **864 not applicable**, and exactly **1584 total** element/state cells. When the approved responsive composition hides a corresponding media stage, `media-selected` is recorded as `NOT_APPLICABLE` with visibility and geometry evidence; the harness never forces a hidden state.

## Measurement and outcome rules

Record computed foreground/background, ancestor compositing, opacity, blend/filter/backdrop/image/gradient/pseudo-element data, font metrics, scoped axe, temporary screenshot hash, and reliable rendered-pixel samples. Antialias edge pixels do not define failure. Any reliable ratio below 4.5:1 reproduces the issue; every applicable cell must pass with no unknown or harness error for NOT_REPRODUCED_CURRENT_RETEST_COMPLETE. Missing or contradictory essential evidence produces BLOCKED_INCONCLUSIVE.

No product, CSS, color, DOM/ARIA, baseline, package/lockfile, paid-provider, participant, or manual-AT change is authorized.
