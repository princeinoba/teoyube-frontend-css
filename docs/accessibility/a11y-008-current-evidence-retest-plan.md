# A11Y-008 current-evidence retest plan

Status: **NOT_REPRODUCED_CURRENT / NEEDS_MORE_EVIDENCE**

Current characterization covered 42 cells (24 Next and 18 static) at all six protected viewports. D02/D05 measured 6.9851:1 against the 4.5:1 requirement, and scoped axe contrast failures were zero. This does not establish FIXED, PASS, or FALSE_POSITIVE.

## Exact elements

- `[data-canon-item="canon-map-D02"] .canon-status.in-progress`
- `[data-canon-item="canon-map-D05"] .canon-status.in-progress`

## Required matrix

Retest `/canon` and static `/#canon` at 1440x900, 1280x800, 1024x768, 768x1024, 390x844, and 360x800. Capture default, hover, focus, active, disabled, selected, overlay, and media states where they actually apply; explicitly record non-applicable states rather than fabricating them.

Record computed foreground and effective composited backgrounds through images, gradients, transparency, filters, backdrop filters, blends, overlays, and media. Include forced-colors/high-contrast behavior and pinned Chromium plus current Edge and Chrome on Windows, at 100% and 200% zoom and the harness device-scale factors.

## Reopen criteria

Reopen implementation only after a deterministic current result below 4.5:1 identifies the exact element, route/runtime, state, viewport, browser/version, zoom, device scale factor, foreground/background pair, and compositing interaction. Then revalidate or replace the proposal hash and obtain a new issue-specific owner approval.
