# Teoyube Visual Change Request — Tables

Decision: APPROVED
Approval-ID: TEOYUBE-VISUAL-2026-07-28-TABLES-001
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner
Approved-At: 2026-07-28T16:59:22-04:00

## Requested scope

- Canonical route: `/tables`
- Protected static rollback view: `#teoyube-tables`
- Unique page root: `body[data-view="teoyube-tables"] #teoyube-tables`
- Exact authorized production stylesheet:
  `styles/pages/tables.css`
- Existing shared visual sources: the protected modular stylesheet sequence,
  including `styles/legacy.css` and `styles/pages/index.css`
- Static and Next render paths: both load the same page-owned stylesheet
  through `styles/pages/index.css`; the Next static-file boundary explicitly
  permits `styles/pages/tables.css`
- Exact derived governance files that may be updated after the approved CSS
  change:
  - `tests/visual/contracts/protected-visual-source-manifest.json`
  - `tests/visual/contracts/original-static-visual-contract.json`
  - `config/runtime/asset-media-compatibility-manifest.json`
  - `config/runtime/canonical-runtime-manifest.json`
- Owner reference:
  `evidence/TABLES-VISUAL-REQUEST-2026-07-28/tables-owner-reference-1254x1254.png`
- Owner-reference SHA-256:
  `70e85b75ebd2247b8411aa90cce70b8b7cb076d03c4d4ae45d878a2466e0e1ab`
- Owner-reference dimensions: 1254×1254 pixels
- Starting stylesheet SHA-256:
  `6e247f4d6bd6038d41a21c7ed0a1341ffa1a26490ba401ebb7178fc404c2725a`
- Starting stylesheet length: 4,660 bytes

The owner authorizes a complete CSS-only visual transformation of the Tables
route, closely reproducing the supplied reference while preserving every
existing DOM node, class, ID, route, state, value, handler, row, expanded-row
state, table semantic, control, accessible name, keyboard position, data
source, media source, asset, and static rollback behavior.

## Exact authorized selectors and components

All production rules must remain beneath
`body[data-view="teoyube-tables"]` and the existing Tables page root or one of
its existing component roots, including:

- `.app-shell`, `.app-sidebar`, `.sidebar`, `.app-main`, `.topbar`, and `main`
  only while `body[data-view="teoyube-tables"]` is active;
- `#teoyube-tables`, `.tables-page`, `.teoyube-table-page`,
  `.teoyube-tables-hero`, `.tables-hero-actions`, `.teoyube-table-card`,
  `.table-card-head`, `.tables-toolbar`, and `.tables-stat-grid`;
- `.teoyube-table-scroll`, `.teoyube-reference-table`,
  `.teoyube-main-row`, `.teoyube-detail-row`, `.table-detail-content`,
  `.table-detail-preview`, `.table-row-video`, `.teoyube-table-footer`,
  and `.table-pagination`;
- `.teoyube-data-tables`, `.teoyube-data-tables-head`, `.data-table-tabs`,
  `.data-table-toolbar`, `.data-table-shell`, `.data-table-scroll`,
  `.teoyube-management-table`, `.data-table-actions`, and
  `.data-table-pagination`;
- existing Tables buttons, inputs, selects, checkboxes, details/summary menus,
  images, iframes, icon nodes, and decorative pseudo-elements only while
  nested beneath the Tables route root.

No shared selector is authorized without the exact
`body[data-view="teoyube-tables"]` route scope.

## Exact assets

The implementation must retain the existing scenic Tables hero artwork
(`public/images/lexicon/lexicon-hero-bg.png`), every current thumbnail, media
preview, local video source, UI asset, font, icon asset, and path. No image,
SVG, video, audio, font, package, runtime content, or external dependency may
be replaced. Decorative icons may be restored through existing nodes or
tightly scoped inline SVG CSS masks as authorized by the owner.

## Existing behavior and appearance

The pre-change canonical Next route exposes 154 route controls at 1254×1254:
146 visible controls and eight intentionally hidden video-navigation controls.
It renders ten main rows, eight saved-table rows, four expanded main rows, the
Promises saved-table tab, a main page size of ten, and a saved-table page size
of eight. Main and saved semantic table wrappers preserve internal horizontal
scrolling when their content exceeds the viewport. No document-level
horizontal overflow or browser request/page/console error was present.

Pre-change screenshots and the executable characterization report are stored
under:

`evidence/TABLES-VISUAL-REQUEST-2026-07-28/before/`

## Proposed behavior and appearance

The owner reference authorizes:

- a warm scenic page hero with the existing title, supporting copy, and live
  header actions;
- a compact white main-table panel with a search/category/sort/filter toolbar,
  five metric cards, a deep-green semantic table header, compact rows, an
  organized three-column expanded media row, and aligned pagination;
- a coordinated lower Table Workspace & Saved Entries panel with tabs,
  search/sort/rows controls, a pale-mint saved-table header, compact status and
  action controls, and independent pagination;
- restored decorative icons in existing containers, responsive reflow,
  visible focus states, reduced-motion support, and natural document
  scrolling.

All live wording, rows, controls, values, state, DOM order, accessible names,
and handlers remain unchanged. Elements shown only in the reference are not
fabricated when no approved live DOM target exists.

## Why this cannot be implemented behind the existing interface

The requested outcome is an explicitly owner-approved visible transformation.
It cannot be delivered as non-rendering infrastructure because the approved
reference changes the route’s scenic header, panel architecture, spacing,
semantic-table presentation, expanded-row composition, icon treatment,
responsive layout, and control hierarchy. The current markup already exposes
the required functional surfaces, so only the page-owned Tables stylesheet is
authorized to change their presentation.

## Alternatives considered

1. Keep the existing Tables presentation unchanged. Rejected because it does
   not satisfy the approved visual transformation.
2. Change shared or global CSS. Rejected because it risks cross-route leakage.
3. Add, remove, or reorganize markup. Rejected because product-source changes
   are restricted to CSS.
4. Hide live rows or controls absent from the reference. Rejected because
   every live record and handler must remain visible and reachable.
5. Convert semantic tables to card markup. Rejected because table semantics
   and column reachability must remain intact.
6. Use the reference as a page background or scale the page. Rejected as
   inaccessible and functionally deceptive.
7. Add external icons or a UI dependency. Rejected because existing nodes and
   page-scoped CSS masks are sufficient.

## Accessibility and performance effects

- DOM order, control count, accessible names, ARIA state, labels, routes,
  handlers, row state, selection state, search, filters, sorting, pagination,
  saved tabs, status values, audio/video controls, and data remain unchanged.
- Semantic table structure, internal horizontal scrolling, visible focus,
  touch targets, 200% zoom reflow, reduced motion, and zero document-level
  horizontal overflow are blocking verification requirements.
- CSS-generated icons are decorative, supplement visible labels, use
  `pointer-events: none`, and do not modify accessible names.
- No new request, dependency, JavaScript, hydration work, font, asset, model
  call, provider call, or data write is authorized.
- Transitions are limited to low-cost visual properties and are reduced for
  users who prefer reduced motion.

## Risks

- **Visual:** additional live rows and controls may make the page taller than
  the reference. Preserve every live item and document the CSS-only residual.
- **Responsive:** the desktop semantic tables can exceed compact viewports.
  Preserve intentional internal wrappers rather than shrinking or hiding
  columns.
- **Accessibility:** decorative pseudo-elements could cover focus outlines or
  controls. Keep them non-interactive and verify keyboard/focus behavior.
- **Functional:** overflow rules could obstruct menus, selects, expanded media,
  audio/video controls, or pagination. Verify every rendered control at its
  baseline level.
- **Cross-route:** legacy classes are shared. Require the exact route scope on
  every production selector.
- **Rollback:** protected fingerprints and deterministic runtime identity must
  be reverted with the stylesheet.

## Rollback plan

Revert the focused Tables commits created for this approval. Do not rewrite
history, replace immutable baselines, or alter another route.

## Owner decision source

The four approval fields and complete scope above were supplied directly in
the owner-authored Tables implementation prompt on 2026-07-28. This record
transcribes that owner decision; it does not originate or broaden it.
