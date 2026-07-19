# Prompt 12A Owner Visual Review

Date: 2026-07-19

Branch: `recovery/visual-source-of-truth`

Commit before work: `93c014eb682369279acbf4b9937e7a9dd7753c0a`

Owner decision status: **PENDING**

The original static runtime remains canonical. This package does not approve a visual difference, change a baseline, or modify protected static source. The machine-readable companion is `docs/recovery/owner-review/prompt-12a-visual-review.json`.

## Decision vocabulary

Only these values are used in this package:

- `REJECT_NEXT_MUST_MATCH`
- `ACCEPT_NONVISUAL_RENDERING_VARIANCE`
- `APPROVE_INTENTIONAL_VISUAL_CHANGE`
- `PENDING_OWNER_DECISION`

The recommendation is technical guidance. Only the owner can replace `PENDING_OWNER_DECISION` with an owner-authored decision.

## Review summary

| ID | Route/state | Result | Human visibility | Recommended decision | Owner decision |
| --- | --- | --- | --- | --- | --- |
| V-01 | Today, tablet-landscape, default slide 1 | 43 pixels; 99.994532% similarity; unresolved | Not discernible at 1:1 | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | `PENDING_OWNER_DECISION` |
| V-02-DW | Search, desktop-wide, default suggestions | 1,462 pixels before fix; now zero | Subtle 4.390625 px text shift | `REJECT_NEXT_MUST_MATCH` | `PENDING_OWNER_DECISION`; no longer gate-blocking after exact correction |
| V-02-DS | Search, desktop-standard, default suggestions | 1,462 pixels before fix; now zero | Subtle 4.390625 px text shift | `REJECT_NEXT_MUST_MATCH` | `PENDING_OWNER_DECISION`; no longer gate-blocking after exact correction |
| V-02-TL | Search, tablet-landscape, default suggestions | 1,466 pixels before fix; now zero | Subtle 4.390625 px text shift | `REJECT_NEXT_MUST_MATCH` | `PENDING_OWNER_DECISION`; no longer gate-blocking after exact correction |
| V-02-TP | Search, tablet-portrait, default suggestions | 1,467 pixels before fix; now zero | Subtle 4.390625 px text shift | `REJECT_NEXT_MUST_MATCH` | `PENDING_OWNER_DECISION`; no longer gate-blocking after exact correction |
| V-02-M | Search, mobile, default suggestions | 258 pixels before fix; now zero | Subtle shift in visible fragment | `REJECT_NEXT_MUST_MATCH` | `PENDING_OWNER_DECISION`; no longer gate-blocking after exact correction |
| V-03 | Canon, desktop-wide, default Canon Maps/slide 1 | 692 pixels; 99.946605% similarity; unresolved | Not discernible at 1:1 | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | `PENDING_OWNER_DECISION` |
| V-04 | Global shell, tablet-portrait, drawer open | 130 pixels; 99.960296% similarity; unresolved | Not discernible at 1:1 | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` | `PENDING_OWNER_DECISION` |

Search mobile-small had zero pixels before remediation and remains zero. Every other matrix screenshot also remains zero except V-01 and V-03; the shell-only open-drawer capture V-04 is outside the 72 full-page cells.

## V-01 — Today counter glyph

- Route: `/`
- Viewport: tablet-landscape, 1024×768
- State: default Today, promise slide 1 active, deterministic test-only animation state
- Static: `.tmp/visual-parity/today-owner-review/tablet-landscape/today.static.png`
- Next: `.tmp/visual-parity/today-owner-review/tablet-landscape/today.next.png`
- Side-by-side: `.tmp/visual-parity/today-owner-review/tablet-landscape/today.side-by-side.png`
- Overlay: `.tmp/visual-parity/today-owner-review/tablet-landscape/today.overlay-difference.png`
- Pixel diff: `.tmp/visual-parity/today-owner-review/tablet-landscape/today.diff.png`
- Result: 43 pixels, ratio 0.000054677327473958336, 99.994532% similarity, maximum channel delta 41
- Changed box: x=345, y=250, width=8, height=9
- Target: `.slide-number` text `01 / 12`

Diagnosis: the target span has identical text, position, size, font, weight, color, border, and shadow. All 43 pixels form one numeral-edge cluster and reproduce exactly. CSS load order, stylesheet presence, font metrics, dimensions, spacing, state, animations, scroll, and assets were ruled out. The remaining cause is browser text-raster/compositor variance.

## V-02 — Search suggestion spacing, resolved

The static template contains a whitespace text node between the Smart Search Suggestions label and its `<small>` sentence. The React projection omitted that node. The sentence therefore began at x=564.40625 instead of x=568.796875, a 4.390625 px left shift. This was a real Next-only layout difference, not antialiasing.

The pre-remediation evidence is preserved under `.tmp/visual-parity/prompt-12a-pre-remediation/search-owner-review/<viewport>/` with `search.static.png`, `search.next.png`, `search.side-by-side.png`, `search.overlay-difference.png`, and `search.diff.png` for all six viewports. Exact metrics and bounding boxes are in the JSON companion.

Remediation restored the original whitespace in `src/app/_search/ApprovedSearchView.tsx`. After rebuilding, every Search viewport produced zero differing pixels and retained exact DOM/class, asset, geometry, focus, responsive, and functional parity. No CSS, static source, asset, or baseline changed.

## V-03 — Canon compositor edges

- Route: `/canon`
- Viewport: desktop-wide, 1440×900
- State: default Canon Maps tab, featured slide 1, deterministic test-only animation state
- Static: `.tmp/visual-parity/canon-owner-review/desktop-wide/canon.static.png`
- Next: `.tmp/visual-parity/canon-owner-review/desktop-wide/canon.next.png`
- Side-by-side: `.tmp/visual-parity/canon-owner-review/desktop-wide/canon.side-by-side.png`
- Overlay: `.tmp/visual-parity/canon-owner-review/desktop-wide/canon.overlay-difference.png`
- Pixel diff: `.tmp/visual-parity/canon-owner-review/desktop-wide/canon.diff.png`
- Result: 692 pixels, ratio 0.0005339506172839506, 99.946605% similarity, maximum channel delta 52
- Changed box: x=301, y=658, width=953, height=242
- Largest component: x=303, y=897, width=183, height=3, 350 pixels

Diagnosis: computed DOM, geometry, transforms, fonts, gradients, borders, shadows, background sizing/position, and normalized assets are identical. The largest component is the viewport-clipped top edge of the first Featured Journey image; the remainder consists of small Calling-dimension glyph/decorative edges. The result reproduced exactly. No correctable CSS, hydration, timing, scroll, animation, or asset defect was found.

## V-04 — Shell Saint avatar edge

- Route/state: global shell on Today, responsive drawer open
- Viewport: tablet-portrait, 768×1024
- Static: `.tmp/visual-parity/shell-owner-review/tablet-portrait/mobile-sidebar-open.static.png`
- Next: `.tmp/visual-parity/shell-owner-review/tablet-portrait/mobile-sidebar-open.next.png`
- Side-by-side: `.tmp/visual-parity/shell-owner-review/tablet-portrait/mobile-sidebar-open.side-by-side.png`
- Overlay: `.tmp/visual-parity/shell-owner-review/tablet-portrait/mobile-sidebar-open.overlay-difference.png`
- Pixel diff: `.tmp/visual-parity/shell-owner-review/tablet-portrait/mobile-sidebar-open.diff.png`
- Result: 130 pixels, ratio 0.0003970435526235416, 99.960296% similarity, maximum channel delta 47
- Changed box: x=36, y=705, width=46, height=46
- Target: `.saint-avatar`

Diagnosis: the avatar has identical geometry, normalized image URL, gradient, cover sizing, center position, border, and shadows. The changed pixels are disconnected image-edge antialias clusters and reproduce exactly. Drawer state, transition state, CSS, layout, and asset loading were ruled out.

## Owner action

Review V-01, V-03, and V-04 at 1:1 and with their overlay/diff artifacts. The recommended decision is `ACCEPT_NONVISUAL_RENDERING_VARIANCE`, but the current owner decision remains `PENDING_OWNER_DECISION`. Prompt 13 remains locked until the owner records the required decisions and all retained public routes are `PASS`.
