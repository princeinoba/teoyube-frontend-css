# Phase 5C-2 regression summary

The exact A11Y-003, A11Y-005, and A11Y-006 scope passes with zero stable-frame changed pixels and no CSS, visible-copy, class, ID, asset, immutable-baseline, or owner-approved-baseline change.

| Area | Result |
| --- | --- |
| Canon controls | 11/11 named and keyboard-operable in both runtimes; click, Enter, Space PASS |
| Search names | Lexicon, Embedded Videos, and Tables exact labels PASS in 36/36 cells |
| Testimony scroll | Named focusable region PASS in 8/8 cells; all overflow cells scroll |
| Current audit | 311 cells, 0 errors; only A11Y-007 and A11Y-008 automated families remain |
| Stable-frame raster | 0 changed pixels; no masks or new tolerance |
| Functional/browser | Focused 3/3; full serial 60/60 runnable, 3 static skips |
| Build/type/lint | PASS |
| Security | 0 vulnerabilities; 18 release controls PASS |
| Recovery | 72 screenshots, 12 DOM snapshots, all support baselines PASS |

The broad parity/performance composite remains blocked outside this batch. This does not invalidate the zero-pixel paired scoped comparison and is not reclassified as a Phase 5C-2 regression.
