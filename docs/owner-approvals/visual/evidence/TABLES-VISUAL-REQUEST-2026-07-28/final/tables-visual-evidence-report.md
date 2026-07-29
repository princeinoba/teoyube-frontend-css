# Tables visual transformation evidence

## Approval and scope

- Route: `/tables`
- Static route: `#teoyube-tables`
- Approval ID: `TEOYUBE-VISUAL-2026-07-28-TABLES-001`
- Approved by: Prince Okiemute Inoba — Teoyube Project Owner
- Approved at: `2026-07-28T16:59:22-04:00`
- Production visual source changed: `styles/pages/tables.css`
- Content, DOM, JavaScript, TypeScript, route semantics, data behavior, and assets changed: no

The replacement stylesheet is fully scoped to
`body[data-view="teoyube-tables"]`. It uses the existing scenic hero asset at
`public/images/lexicon/lexicon-hero-bg.png` and four CSS mask icons embedded as
data URLs. No new production asset or styling framework was introduced.

## Source identity

- Starting commit: `2db3848824fca930949ae0b32e3d392f0e74b15e`
- Approval commit: `b997564`
- CSS implementation commit: `5bce780`
- Original Tables stylesheet: 4,660 bytes
- Original Tables stylesheet SHA-256:
  `6e247f4cb3a24fc95dd1045a609ad99a24af620cb045f40ae357d0b4b272725a`
- Final Tables stylesheet: 46,344 bytes
- Final Tables stylesheet SHA-256:
  `8f8392ec1df04e49ffe34927fdc81688bdd2ee3b2e55edbce9fcffecbbf98cf3`
- Owner reference SHA-256:
  `70e85b75ebd2247b8411aa90cce70b8b7cb076d03c4d4ae45d878a2466e0e1ab`
- Protected visual-source manifest SHA-256 after the authorized update:
  `0282b929c07f42bd4bd25ac6044578712da86c8557656d80bcf7db3e6f38f161`
- Derived canonical runtime digest:
  `fefb4aa229f7eede271fef5e8dc08fb42f031fba12aca648409ea9d155dd26e8`
- Derived canonical build ID:
  `teoyube-fefb4aa229f7eede271fef5e`

## Visual and structural evidence

Candidate captures are included for:

- owner reference: 1254 × 1254
- desktop: 1536 × 1024
- desktop-wide: 1440 × 900
- desktop-standard: 1280 × 800
- tablet-landscape: 1024 × 768
- tablet-portrait: 768 × 1024
- mobile: 390 × 844
- browser zoom: 200%

At 1254 × 1254, the measured layout was:

- sidebar: x 4, width 176
- main: x 184, width 1070
- hero: y 0, height 119
- primary table card: y 129.7, height 748.4
- primary table scroll region: y 325, height 496
- saved workspace panel: y 888.8, height 536.7
- document height: 1441.5

Static-to-Next verification passed at all seven viewports. Five captures were
byte-identical; the remaining two had only sub-pixel raster noise. No pixel
exceeded the structural-difference threshold.

Static and Next DOM evidence also matched:

- ordered DOM: 678 nodes
- controls: 154 structural controls
- IDs: 22
- class-list entries: 257
- origin-normalized assets: 72
- visible-text characters: 4,569

The owner-reference comparison reports a normalized mean absolute channel
difference of `0.21216789306814537`. This comparison is diagnostic because the
owner reference depicts the approved target composition while the live page
retains current executable data and copy.

## Functional, responsive, and accessibility evidence

- Functional audit: 22 of 22 interactions passed at every audited viewport.
- Main data rows: 10.
- Saved data rows: 8.
- Expanded live rows: 4.
- Actual visible keyboard-tab stops: 124; all were focusable and named.
- Document horizontal overflow: none at any audited viewport or 200% zoom.
- Internal table horizontal scrolling: retained at 1024, 768, 390, and 200% zoom.
- Cross-route isolation: 11 of 11 routes passed; Tables-only styles were absent elsewhere.
- Axe automated accessibility violations: 0.
- Axe incomplete/manual-review items: prohibited-attribute review, contrast review,
  and iframe review; none was reported by Axe as a confirmed violation.

## Executable checks

- Next application build: pass.
- TypeScript: pass.
- ESLint: pass.
- Unit tests: 276 passed, 1 skipped.
- Browser tests: 19 passed.
- TIG recovery contract: pass.
- Visual recovery contract: pass, including 72 immutable screenshots and 12 DOM snapshots.
- Tables screenshot, DOM, class, asset, responsive, keyboard, and functional parity: pass.

## Known diagnostics outside this CSS-only scope

- The static publication runtime still requests the previously blocked
  Phase 11.6C media runtime manifest. That known publication-integrity 404 was
  not repaired or weakened in this task.
- The Next runtime issues duplicate root-level page-CSS requests that return
  404 while the correct `/styles/pages/*.css` resources load successfully.
  Tables styling and behavior remain active. No runtime loader or markup change
  was authorized here.
- The combined historical videos/tables smoke retains two Embedded-Videos-only
  expectations superseded by the later owner-approved TeoyubeWorld restoration.
  Every Tables-specific assertion passes.
- Measured Next layout shift (`0.9381`) remains higher than the static runtime
  (`0.1058`). The diagnostic is retained without altering runtime hydration,
  markup, or behavior in this CSS-only task.

## Evidence index

- `before/`: pre-change responsive captures and audits
- `final/owner-1254x1254/`: approved-target viewport capture and details
- `final/desktop-*`, `final/tablet-*`, `final/mobile-*`: responsive captures
- `final/static-runtime/`: independent static-runtime captures and audit
- `final/comparison/`: side-by-side, overlay, and pixel-difference output
- `final/audit.json`: full Next responsive and functional audit
- `final/tables-static-next-dom-parity.json`: DOM/class/ID/asset/text parity
- `final/tables-static-next-screenshot-parity.json`: raster parity
- `final/tables-axe-report.json`: automated accessibility report
- `final/tables-keyboard-focus-report.json`: keyboard/focus report
- `final/tables-css-scope-asset-audit.json`: scope and asset audit
- `final/tables-cross-route-isolation.json`: route-isolation audit
- `final/tables-runtime-resource-audit.json`: resource-delivery diagnostics
- `final/tables-performance-report.json`: static/Next timing comparison
