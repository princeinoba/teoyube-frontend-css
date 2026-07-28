# Teoyube Visual Change Request — Embedded Videos

Decision: APPROVED
Approval-ID: TEOYUBE-VISUAL-2026-07-28-EMBEDDED-VIDEOS-001
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner
Approved-At: 2026-07-28T15:16:30-04:00

## Requested scope

- Canonical route: `/embedded-videos`
- Protected static rollback view: `#ui-elements`
- Unique page root: `body[data-view="ui-elements"] #ui-elements`
- Exact authorized production stylesheet:
  `styles/pages/embedded-videos.css`
- Existing shared visual sources: the protected modular stylesheet sequence,
  including `styles/legacy.css` and `styles/pages/index.css`
- Exact derived governance files that may be updated after the approved CSS
  change:
  - `tests/visual/contracts/protected-visual-source-manifest.json`
  - `tests/visual/contracts/original-static-visual-contract.json`
  - `config/runtime/asset-media-compatibility-manifest.json`
  - `config/runtime/canonical-runtime-manifest.json`
- Owner reference:
  `evidence/EMBEDDED-VIDEOS-VISUAL-REQUEST-2026-07-28/embedded-videos-owner-reference-1536x1024.png`
- Owner-reference SHA-256:
  `109162df6e89fe6803b85545d2c966e087e91b6a7ad6746c813bbc3347b70109`
- Owner-reference dimensions: 1536×1024 pixels
- Starting stylesheet SHA-256:
  `eeab64e9febe302f7a645f573f64fbfbed05ca4fdf6ce9c45343a22ab6a8b373`
- Starting stylesheet length: 7,240 bytes

The owner authorizes a complete CSS-only visual transformation of the
Embedded Videos route, closely reproducing the supplied reference while
preserving every existing DOM node, class, ID, route, state, value, handler,
control, accessible name, keyboard position, video record, category, media
source, Scripture reference, duration, asset, and static rollback behavior.

## Exact authorized selectors and components

All production rules must remain beneath `body[data-view="ui-elements"]` and
the existing Embedded Videos page root or one of its existing component
roots, including:

- `.app-shell`, `.app-sidebar`, `.sidebar`, `.app-main`, and `.app-header`
  only while `body[data-view="ui-elements"]` is active;
- `#ui-elements`, `.embedded-video-page`, and `.embedded-video-library`;
- the existing hero, title icon, header action, toolbar, category, filter,
  metric, search, smart-search, video-grid, card, poster, navigation, menu,
  detail, load-more, and local-notice surfaces;
- existing Embedded Videos buttons, inputs, selects, images, videos, icon
  nodes, and decorative pseudo-elements only when nested beneath the
  Embedded Videos route root.

No shared selector is authorized without the
`body[data-view="ui-elements"]` route scope.

## Exact assets

The implementation must retain the existing Embedded Videos hero artwork,
every current thumbnail, poster, media source, UI asset, and path. No image,
SVG, video, font, package, runtime content, or external dependency may be
replaced. Decorative icons may be restored through existing nodes, existing
local icon mechanisms, or tightly scoped CSS masks as authorized by the
owner.

## Why this cannot be implemented behind the existing interface

The requested outcome is a visible page transformation. It cannot be
delivered as non-rendering architecture because the owner specifically
authorized the reference's scenic header, compact media-library toolbar,
metrics, search, two-column video grid, media treatment, icons, and responsive
composition. The existing markup already contains the functional surfaces;
only page-owned CSS is authorized to change their presentation.

The canonical Next route and protected static rollback view both serve the
same modular stylesheet. `styles/pages/index.css` imports
`styles/pages/embedded-videos.css`, and the Next static-file boundary permits
that exact path.

## Alternatives considered

1. Keep the existing Embedded Videos presentation unchanged. Rejected because
   it does not satisfy the approved visual transformation.
2. Change shared or global CSS. Rejected because it risks cross-route leakage.
3. Add, remove, or reorganize markup. Rejected because product-source changes
   are restricted to CSS.
4. Hide live videos or controls absent from the reference. Rejected because
   every live item and handler must remain visible and reachable.
5. Use the reference as a background or scale the page. Rejected as
   inaccessible and functionally deceptive.
6. Add external icons or a UI dependency. Rejected because existing nodes and
   page-scoped CSS are sufficient.

## Accessibility and performance effects

- DOM order, control count, accessible names, ARIA state, labels, routes,
  handlers, player state, categories, filters, sorting, search, carousel
  state, load-more behavior, and refresh behavior remain unchanged.
- Focus indicators, touch targets, natural document scrolling, 200% zoom
  reflow, reduced-motion behavior, and zero document-level horizontal overflow
  are blocking verification requirements.
- CSS-generated icons are decorative, supplement visible labels, use
  `pointer-events: none`, and do not modify accessible names.
- No new request, dependency, JavaScript, hydration work, font, asset, model
  call, provider call, or data write is authorized.
- Transitions are limited to low-cost visual properties and are reduced for
  users who prefer reduced motion.

## Risks and mitigations

- **Visual:** reference proportions may conflict with additional live videos.
  Preserve every live item and allow additional rows; document residual
  CSS-only differences.
- **Responsive:** the desktop two-column grid could squeeze controls. Reflow
  before labels or media become unreadable.
- **Accessibility:** decorative pseudo-elements could cover focus outlines or
  controls. Keep them non-interactive and verify keyboard/focus behavior.
- **Functional:** overflow or stacking could obstruct player, carousel, menu,
  filter, refresh, or load-more controls. Verify all rendered controls.
- **Cross-route:** shared class names could leak. Require the exact route scope
  on every production selector.
- **Rollback:** protected fingerprints and deterministic runtime identity must
  be reverted with the stylesheet.

## Rollback plan

Revert the focused Embedded Videos commits created for this approval. Do not
rewrite history, replace immutable baselines, or alter another route.

## Owner decision source

The four approval fields and complete scope above were supplied directly in
the owner-authored Embedded Videos implementation prompt on 2026-07-28. This
record transcribes that owner decision; it does not originate or broaden it.
