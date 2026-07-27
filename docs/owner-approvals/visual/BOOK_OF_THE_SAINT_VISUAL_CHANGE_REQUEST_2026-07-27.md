# Teoyube Visual Change Request — Book of the Saint

Decision: APPROVED  
Approval-ID: TEOYUBE-VISUAL-2026-07-27-BOOK-OF-THE-SAINT-001  
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner  
Approved-At: 2026-07-27T18:45:04-04:00

## Requested scope

- Canonical route: `/book`
- Protected static rollback view: `#book`
- Unique page root: `body[data-view="book"] #book.book-saint-view`
- Exact authorized production stylesheet: `styles/pages/book.css`
- Existing inherited visual source: route-scoped Book rules in `styles.css`,
  loaded through `styles/legacy.css`
- Exact derived governance files that may be updated after the approved CSS
  change:
  - `tests/visual/contracts/protected-visual-source-manifest.json`
  - `tests/visual/contracts/original-static-visual-contract.json`
  - `config/runtime/asset-media-compatibility-manifest.json`
  - `config/runtime/canonical-runtime-manifest.json`
- Owner reference:
  `evidence/BOOK-OF-THE-SAINT-VISUAL-REQUEST-2026-07-27/book-of-the-saint-owner-reference-1122x1402.png`
- Owner-reference SHA-256:
  `810b0cf596e3adaa7075bb647169360124ff4e399122d931940c534bf43bf2d7`
- Owner-reference dimensions: 1122×1402 pixels
- Starting stylesheet SHA-256:
  `21e97bde6d65fa72b5f8519496b3a8d06b27f92c8ecca7ca540b723c698d3294`
- Starting stylesheet length: 97 bytes

The owner authorizes a complete CSS-only visual transformation of the Book of
the Saint route, closely reproducing the supplied reference while preserving
every existing DOM node, class, ID, route, state, value, handler, control,
accessible name, keyboard position, asset, local-data guarantee, and static
rollback behavior.

## Exact authorized selectors and components

All production rules must remain beneath `body[data-view="book"]` and the
existing Book page root or one of its existing component roots, including:

- `.app-shell`, `.app-sidebar`, `.sidebar`, `.app-main`, and `.app-header`
  only while `body[data-view="book"]` is active;
- `#book.book-saint-view`, `.book-saint-shell`, `.book-saint-main`, and
  `.book-saint-rail`;
- `.book-saint-hero`, `.book-hero-content`, `.book-encouragement-card`,
  `.book-stat-grid`, `.book-stat-card`, and `.book-stat-icon`;
- `.book-toolbar`, `.book-search-field`, `.book-filter-button`,
  `.phase116-search-suggestions`, and `.phase116-chip-row`;
- `.phase116b-functional-panel`, `.book-memory-panel`,
  `.book-memory-actions`, `.book-memory-filters`, and existing Book memory
  empty/item states;
- `.phase114-functional-panel`, `.phase114-status-grid`,
  `.phase114-advanced-controls`, and `.phase114-backup-card` when rendered
  inside the Book root;
- `.phase116b-journal-panel`, `.phase116b-journal-form`,
  `.phase116b-detail-drawer`, `.book-timeline`, `.timeline-entry`,
  `.book-pagination`, and their existing action groups;
- `.phase116b-continuation`, `.phase116b-continuation-grid`, and existing
  continuation actions;
- `.phase117-collection-panel`, existing collection tabs, collection
  management controls, and add-current actions;
- `.book-journey-overview`, `.book-journey-metrics`,
  `.book-week-timeline`, `.book-journey-scripture`, `.book-topics-card`,
  `.book-lantern-card`, `.book-actions-card`, and existing right-rail notice
  cards;
- existing Book-route buttons, inputs, selects, textareas, icon nodes, and
  decorative pseudo-elements only when nested beneath the Book route root.

No shared selector is authorized without the `body[data-view="book"]` route
scope.

## Exact assets

The implementation must retain the project-owned Book hero and cover artwork,
all existing scenic backgrounds, every current Scripture and UI asset, and
all current paths. No image, SVG, icon asset, font, package, or runtime content
may be replaced. Decorative icons may be restored through existing nodes,
existing local icon mechanisms, or tightly scoped CSS masks as authorized by
the owner.

## Why this cannot be implemented behind the existing interface

The requested outcome is a visible page transformation. It cannot be delivered
as non-rendering architecture because the owner specifically authorized the
reference's Book page layout, panel rhythm, right rail, icons, responsive
composition, and CSS presentation. The existing markup already contains the
functional surfaces; only the page-owned CSS is authorized to change their
presentation.

The canonical Next route and protected static rollback view share the modular
stylesheet sequence. The approval therefore covers the same route-scoped Book
stylesheet in both render paths.

## Alternatives considered

1. Keep the existing protected Book presentation unchanged. Rejected because
   it does not satisfy the approved visual transformation.
2. Change shared/global CSS. Rejected because it risks cross-route leakage.
3. Add or reorganize markup. Rejected because product-source changes are
   restricted to CSS.
4. Hide live controls that do not appear in the reference. Rejected because
   every live control and handler must remain visible and reachable.
5. Use the reference as a background or scale the page. Rejected as
   inaccessible and functionally deceptive.
6. Add external icons or a UI dependency. Rejected because existing nodes and
   page-scoped CSS are sufficient.

## Accessibility and performance effects

- DOM order, control count, accessible names, ARIA state, labels, routes, and
  handlers remain unchanged.
- Focus indicators, touch targets, natural document scrolling, 200% zoom
  reflow, reduced-motion behavior, and zero document-level horizontal overflow
  are blocking verification requirements.
- CSS-generated icons are decorative, supplement visible labels, have
  `pointer-events: none`, and do not modify accessible names.
- No new request, dependency, JavaScript, hydration work, font, asset, or
  provider call is authorized.
- Transitions are limited to low-cost visual properties and suppressed under
  reduced motion.

## Evidence and visual review

Before, final, responsive, close-up, side-by-side, difference, control,
geometry, accessibility, error, asset, and cross-route evidence is stored
under:

`docs/owner-approvals/visual/evidence/BOOK-OF-THE-SAINT-VISUAL-REQUEST-2026-07-27/`

The immutable owner reference is archived byte-for-byte before implementation.
Candidate captures never replace immutable or owner-approved baselines.

## Rollback

After the implementation and evidence commits exist, roll back the complete
approved change with:

```text
git revert --no-edit <evidence-commit> <style-commit> <approval-commit>
```

To inspect the original Book stylesheet without changing the worktree:

```text
git show <starting-head>:styles/pages/book.css
```

