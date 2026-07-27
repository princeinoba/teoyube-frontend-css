# Teoyube Visual Change Request

Approval-ID: TEOYUBE-VISUAL-2026-07-26-PROMISE-TABLE-001
Decision: APPROVED
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner
Approved-At: 2026-07-26T20:15:31-04:00

## Requested scope

- Route/view: canonical Next route `/promise-table`; `body[data-view="table"]`; approved view root `#table`; default populated local/session state plus existing filter, search, sort, detail, note, export/import preview, row-action, video-navigation, suggestion, focus, disabled, reduced-motion, forced-colors, zoom, and responsive states.
- Product-source file proposed for modification: `styles/pages/promise-table.css`.
- Supporting approval/evidence files: this request and `docs/owner-approvals/visual/evidence/PROMISE-TABLE-VISUAL-REQUEST-2026-07-26/**`.
- Derived fingerprints that may be updated only after approval and successful verification: `tests/visual/contracts/protected-visual-source-manifest.json`, `tests/visual/contracts/original-static-visual-contract.json`, `config/runtime/asset-media-compatibility-manifest.json`, and `config/runtime/canonical-runtime-manifest.json`.
- Protected files that must remain unchanged: `styles.css`, `index.html`, all HTML/JS/JSX/TS/TSX, all runtime behavior, all assets, and all immutable or owner-approved screenshot/DOM baselines.
- Exact selectors/components:
  - `body[data-view="table"] #table`
  - `.promise-table-grid`, `.promise-scrolls-panel`, `.promise-calling-compass-card`, `.promise-calling-compass`, `.promise-compass-*`
  - `#phase116bPromiseWorkspace`, `.phase116b-panel-head`, `.phase116b1-promise-add-launcher`, `.phase116b-toolbar`, `.phase116b-detail-drawer`, `.phase116b-action-row`, `.phase116b-safety`
  - `#phase117PromiseTableControls`, `.phase117-surface-controls`, `.phase115-control-row`
  - `#phase114PromiseTablePanel`, `.phase114-section-head`, `.phase114-table-wrap`, `.phase114-promise-table`, `.phase114-row-actions`
  - `.promise-search-feed`, `.promise-feed-search`, `#promiseTableVideoPanel`, `.promise-table-featured-*`, `.promise-table-video-*`
  - `.promise-search-scroll-wrapper`, `.promise-search-list`, `.promise-search-item`, `.scripture-thumbnail`, `.promise-watch-video`
  - `.phase116-search-suggestions`, `.phase116-chip-row`, `.phase116-chip`
  - Existing controls and states beneath those sections, including `:hover`, `:focus-visible`, `[disabled]`, `.active`, native form controls, table controls, and current `data-*`/ARIA states.
- Exact owner reference asset: `Asset/ChatGPT Image page (TeoyubePromise table Page).png` (1024×1536; SHA-256 `83fee4c84b897e1e0235e2659ffc0c85096669f35b8e8da8ca35079afb409126`).
- Existing rendered assets to preserve without modification or path changes:
  - `/public/images/promise/promise-scrolls-bg.png`
  - `/public/images/table/calling-compass-panel-bg.png`
  - `/public/images/embed/embedded-videos-hero-bg.png`
  - `/public/images/today/teoyubeworld-search-bg.png`
  - `/public/images/search/search-purpose-hero.png`
  - `/public/images/canon/journey-calling.png`
  - `/public/images/canon/canon-card-04.png`
  - `/public/images/carousel/growth-in-grace.png`
  - `/public/images/carousel/kingdom-wisdom.png`
  - `/public/images/today-carousel/today-carousel-12-overlook.png`
- Viewports/states: 1536×1024, 1440×900, 1280×800, 1024×768, 768×1024, and 390×844; intermediate-width drag checks; 200% zoom; keyboard focus; reduced motion; forced colors; long/dynamic content; multiple rows; disabled controls; visible notifications.

## Why this cannot be implemented behind the existing interface

The requested outcome expressly changes the Promise Table’s rendered composition, spacing, grids, surfaces, control sizing, table presentation, media layout, responsive reflow, and visual hierarchy. Non-rendering architecture cannot produce those changes. The current page-specific stylesheet contains only a six-line width/table guard while most presentation comes from protected legacy rules in `styles.css`. A maintainable implementation therefore requires an owner-authorized, route-scoped visual layer in `styles/pages/promise-table.css`, loaded after the protected legacy stylesheet. No markup, behavior, data, asset, or global-token change is required.

## Existing behavior and appearance

- Before screenshot, 1536×1024: `docs/owner-approvals/visual/evidence/PROMISE-TABLE-VISUAL-REQUEST-2026-07-26/before-promise-table-1536x1024.png`
- Before full-page screenshot, 1536×3135: `docs/owner-approvals/visual/evidence/PROMISE-TABLE-VISUAL-REQUEST-2026-07-26/before-promise-table-full-page.png`
- Baseline audit: `docs/owner-approvals/visual/evidence/PROMISE-TABLE-VISUAL-REQUEST-2026-07-26/before-promise-table-audit.json`
- Current response: HTTP 200 with no console errors, page errors, or failed requests.
- Current document: 1536px scroll width equals client width; natural document height is 3135px.
- Current controls: 126 total, 125 enabled, one intentionally disabled.
- Saved Promise Rows is a semantic table with five visible headings: Promise, Scripture, Status, Source, and Actions.
- The scoped table wrapper already owns horizontal overflow.
- Read-only pre-change smoke confirmed Promise filtering, search input, Add Promise dialog opening, and featured-video navigation.
- Existing Promise Table CSS SHA-256: `4d45da3dded7806cdea5798e68775ae879f8873c9b5cd25c9912fb2842f0d290`.

## Proposed behavior and appearance

The proposed visual target is the protected owner reference:

`Asset/ChatGPT Image page (TeoyubePromise table Page).png`

The implementation would:

- create a cohesive Promise Table-scoped token and layout system;
- preserve the existing shell, DOM order, labels, data, media, table semantics, handlers, focus order, and local/session-only behavior;
- use content-aware panel heights and natural document scrolling;
- align the hero, summaries, workspace, table, featured video, media collection, and suggestions with the owner reference as closely as the approved DOM permits;
- keep all statuses, columns, row actions, media actions, notifications, and controls visible and reachable;
- use internal table overflow only when required and prevent document-level horizontal overflow;
- avoid global selectors, asset replacement, generated replacement text, fixed viewport reconstruction, transform scaling, and baseline substitution.

The owner reference is a visual direction, not authorization to invent missing DOM, copy, controls, icons, or data. Any reference-only element without an approved existing DOM target would remain unimplemented and be reported.

## Alternatives that preserve the current interface

1. **No visual change.** Safest for the immutable source, but does not satisfy the requested Promise Table visual upgrade.
2. **Minimal defect-only patch.** Could address isolated overflow or clipping, but would not establish the requested hierarchy, density, hero balance, workspace composition, table treatment, or media layout.
3. **Modify protected legacy `styles.css`.** Rejected because it increases cross-route risk and weakens rollback and source-of-truth protection.
4. **Change markup/components.** Rejected because the request is CSS-only and all existing DOM, behavior, semantics, and controls must remain intact.
5. **Route-scoped CSS in `styles/pages/promise-table.css`.** Recommended because it is isolated, reversible, loaded in the established order, and can preserve behavior while implementing the approved visual target.

## Risks

- **Visual:** the reference aspect ratio and static content differ from the live, content-responsive page; exact screenshot identity may be impossible without prohibited markup/content changes.
- **Responsive:** dense controls, long statuses, and the five-column table may overflow unless carefully reflowed or internally scrolled.
- **Accessibility:** CSS could clip focus outlines, reduce contrast, visually reorder controls, or make table/media controls unreachable at zoom.
- **Functional:** decorative overlays or stacking contexts could intercept live controls; selectors must remain pointer-safe.
- **Performance:** large filters, backdrop blurs, excessive shadows, and broad transitions could increase paint cost.
- **Migration:** route-scoped rules may conflict with protected legacy declarations and existing responsive rules.
- **Cross-route:** insufficient scoping could affect pages sharing `.module-card`, `.secondary`, `.phase114-*`, `.phase115-*`, or `.phase116-*`.
- **Evidence:** derived fingerprints must be updated only for the exact approved CSS delta; immutable and owner-approved baselines must not be regenerated.

Required mitigation is full screenshot, geometry, overflow, keyboard, focus, forced-colors, 200% zoom, Axe, functional, cross-route, build, type, lint, unit, browser, runtime, recovery, TIG, and source-contract verification.

## Rollback plan

The pre-change source commit is `d267f55d801dbb1f99d59cf639dcdb66db2e078b`.

If an approved implementation is later applied, restore product source and deterministic fingerprints with:

```powershell
git restore --source=d267f55d801dbb1f99d59cf639dcdb66db2e078b -- `
  styles/pages/promise-table.css `
  tests/visual/contracts/protected-visual-source-manifest.json `
  tests/visual/contracts/original-static-visual-contract.json `
  config/runtime/asset-media-compatibility-manifest.json `
  config/runtime/canonical-runtime-manifest.json
```

Evidence and this request remain as an audit trail. The implementation report must also provide commit-specific `git revert` commands.

## Agent declaration

> I have not approved this request, changed protected visual sources, or updated baselines. Work is stopped pending an owner decision.

## Focused core-panel owner amendment

Decision: APPROVED

Approval-ID: TEOYUBE-VISUAL-2026-07-26-PROMISE-PANELS-001

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-26T22:44:26-04:00

Parent approval: TEOYUBE-VISUAL-2026-07-26-PROMISE-TABLE-001

The owner authorizes a CSS-only visual replacement on `/promise-table` for:

1. Promise Table Workspace
2. Safe 11.7 Promise Table Data — Live promise rows
3. Local Promise Table — Saved Promise Rows
4. Presentational icons in the approved existing containers and controls
5. Local beta notice positioning and presentation where necessary to avoid blocking controls

The approved product-source scope is limited to `styles/pages/promise-table.css`. The owner reference for this amendment is:

`docs/owner-approvals/visual/evidence/PROMISE-TABLE-VISUAL-REQUEST-2026-07-26/focused-core-panels-owner-reference.png`

No HTML, JSX, TSX, JavaScript, TypeScript, application behavior, route, data, copy, semantic table structure, asset, dependency, test source, immutable baseline, or owner-approved baseline change is authorized. Governance records, Promise Table-specific evidence, the exact final stylesheet fingerprints, and the deterministic runtime identity derived solely from those approved changes may be updated.

This owner amendment closes the pending-decision condition in the earlier agent declaration only for the exact focused scope above. It does not extend approval to the Promise Table hero, summary metrics, lower search/media sections, sidebar, shared header, another route, or another protected page.
## Final spacing and Calling Compass layout amendment

Decision: APPROVED

Approval-ID: TEOYUBE-VISUAL-2026-07-27-PROMISE-LAYOUT-001

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-27T09:47:27-04:00

Parent approvals:

- TEOYUBE-VISUAL-2026-07-26-PROMISE-TABLE-001
- TEOYUBE-VISUAL-2026-07-26-PROMISE-PANELS-001

The owner authorizes a CSS-only refinement on `/promise-table` to:

1. Normalize and tighten vertical spacing between the approved Promise Table sections.
2. Align the Workspace, Safe 11.7 data, Local Promise Table, promise search, Smart Search Suggestions, and Featured Video regions to the existing page grid.
3. Increase the existing Calling Compass diagram through its actual layout dimensions, center it inside its current panel, preserve its aspect ratio, and keep every existing label and feature visible.
4. Remove redundant blank space and improve responsive organization without changing the approved panel designs.
5. Reposition the existing Local beta notice only where necessary to keep every control reachable.

The approved product-source scope remains limited to `styles/pages/promise-table.css`. No HTML, JSX, TSX, JavaScript, TypeScript, component, route, behavior, data, copy, icon, asset, SVG source, dependency, test source, immutable baseline, or owner-approved baseline change is authorized. Promise Table-specific evidence and reports, the exact final stylesheet fingerprints, and the deterministic runtime identity derived solely from this approved CSS delta may be updated.

This amendment does not authorize a new page redesign, another route, global/shared CSS changes, application logic changes, diagram replacement, transform scaling, browser zoom, hidden controls, or baseline regeneration.