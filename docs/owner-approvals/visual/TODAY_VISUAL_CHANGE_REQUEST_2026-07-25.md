# Teoyube Visual Change Request — Today

Approval-ID: TEOYUBE-VISUAL-2026-07-25-TODAY-001
Decision: APPROVED
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner
Approved-At: 2026-07-25T20:56:59-04:00

## Requested scope

- Route/view: `/`, Today default deterministic state and all existing interactive states.
- Runtime scope requiring an owner decision:
  - canonical Next runtime at `/`;
  - protected static rollback Today view, because both runtimes load the same stylesheet.
- Exact proposed production file:
  - `styles/pages/today.css`
- Exact protected contract entries that would require an owner-authorized hash update:
  - the `styles/pages/today.css` entry in
    `tests/visual/contracts/protected-visual-source-manifest.json`;
  - the `styles/pages/today.css` entry in
    `tests/visual/contracts/original-static-visual-contract.json`.
- Exact selectors/components proposed for Today-scoped styling:
  - `body[data-view="today"] .app-shell`
  - `body[data-view="today"] .app-sidebar`
  - `body[data-view="today"] .sidebar`
  - `body[data-view="today"] .brand-lockup`
  - `body[data-view="today"] .brand-mark`
  - `body[data-view="today"] .nav-list`
  - `body[data-view="today"] .nav-item`
  - `body[data-view="today"] .saint-card`
  - `body[data-view="today"] .app-main`
  - `body[data-view="today"] .app-header`
  - `body[data-view="today"] .topbar-actions`
  - `body[data-view="today"] #today`
  - `body[data-view="today"] .today-premium-shell`
  - `body[data-view="today"] .promise-carousel`
  - `body[data-view="today"] .carousel-slide`
  - `body[data-view="today"] .carousel-copy`
  - `body[data-view="today"] .slide-artwork`
  - `body[data-view="today"] .carousel-arrow`
  - `body[data-view="today"] .carousel-dots`
  - `body[data-view="today"] .today-insight-row`
  - `body[data-view="today"] .promise-detail-card`
  - `body[data-view="today"] .daily-inspiration-card`
  - `body[data-view="today"] .daily-progress-card`
  - `body[data-view="today"] .streak-card`
  - `body[data-view="today"] .today-action-grid`
  - `body[data-view="today"] .word-card`
  - `body[data-view="today"] .assignment-card`
  - `body[data-view="today"] .teoyubeworld-featured-panel`
  - `body[data-view="today"] .featured-story-panel-inner`
  - `body[data-view="today"] .featured-story-search-shell`
  - `body[data-view="today"] .promise-search-form`
  - `body[data-view="today"] .phase116-search-suggestions`
  - `body[data-view="today"] .phase116-chip-row`
  - `body[data-view="today"] .phase116-chip`
  - `body[data-view="today"] .search-chip-row`
  - `body[data-view="today"] .featured-story-carousel`
  - `body[data-view="today"] .featured-story-slide`
  - `body[data-view="today"] .featured-story-copy`
  - `body[data-view="today"] .featured-story-controls`
  - `body[data-view="today"] .today-integrations`
  - `body[data-view="today"] .teoyube-promise-panel`
  - `body[data-view="today"] .promise-movie-card`
  - `body[data-view="today"] .clients-promise-card`
  - `body[data-view="today"] .clients-table`
- Exact assets to retain without modification:
  - `public/images/today-carousel/today-carousel-01-welcome.png`
  - `public/images/today-carousel/today-carousel-02-journey.png`
  - `public/images/today-carousel/today-carousel-03-search.png`
  - `public/images/today-carousel/today-carousel-04-canon.png`
  - `public/images/today-carousel/today-carousel-05-promise-table.png`
  - `public/images/today-carousel/today-carousel-06-growth.png`
  - `public/images/today-carousel/today-carousel-07-live-promises.png`
  - `public/images/today-carousel/today-carousel-08-impact.png`
  - `public/images/today-carousel/today-carousel-09-deeper.png`
  - `public/images/today-carousel/today-carousel-10-legacy.png`
  - `public/images/today-carousel/today-carousel-11-faith.png`
  - `public/images/today-carousel/today-carousel-12-overlook.png`
  - `public/images/today/teoyubeworld-search-bg.png`
  - `public/images/ads/kingdom-wisdom.png`
  - existing TeoyubeWorld story thumbnails referenced by
    `src/features/today/today-data.ts`.
- Viewports:
  - 1536×1024 primary desktop;
  - 1440×900;
  - 1280×800;
  - 1024×768;
  - 768×1024;
  - 390×844.
- States:
  - default Today;
  - promise carousel previous, next, dot, keyboard, hover-pause, and swipe;
  - Guardrails and generated daily-journey states;
  - prayer framework;
  - reflection input, completion, skip, revisit, edit, reject, and undo;
  - TeoyubeWorld search, suggestion, clear, filter, carousel, keyboard, and feed selection;
  - media source preview;
  - desktop and responsive navigation;
  - keyboard focus.

## Existing behavior and appearance

- [Current Today at 1536×1024](evidence/TODAY-VISUAL-REQUEST-2026-07-25/before-1536x1024.png)
- [Current Today at 390×844](evidence/TODAY-VISUAL-REQUEST-2026-07-25/before-390x844.png)
- Captured from `http://127.0.0.1:3000/`.
- Current `styles/pages/today.css`:
  - 112 bytes;
  - SHA-256
    `c86d8601e479a0ffcc5a13fa22abd52a6fa2f482419b390e0ec94692fd832c09`.
- Current 1536×1024 geometry:
  - Today root: x 286.39, y 91.44, width 1223.22, height 2667.63;
  - promise carousel: x 286.39, y 91.44, width 1223.22, height 768;
  - insight row: y 874.63, height 248.09;
  - action region: y 1137.91, height 1165.97;
  - TeoyubeWorld integrations: y 2319.06, height 440.
- Current controls inside `#today`: 92.
- Horizontal overflow: none.
- Console errors during the deterministic capture: none.
- `npm run recovery:verify` passed before this request was prepared.

## Proposed behavior and appearance

Use the already approved TeoyubeSearch design language as the exact styling
reference while preserving Today’s page-specific composition and artwork:

```text
1536×1024
┌──────── 198px sidebar ────────┬──────────── flexible main content ────────────┐
│ compact brand/navigation       │ compact eyebrow/title + existing actions      │
│ existing Saint card            ├────────────────────────────────────────────────┤
│ remains bottom anchored        │ cinematic promise carousel, approximately      │
│                                │ 336–416px high, existing image/copy/controls    │
│                                ├────────────────────────────────────────────────┤
│                                │ four compact Today insight cards                │
│                                ├──────────────────────┬─────────────────────────┤
│                                │ Word of the Day      │ Daily Assignment         │
│                                ├──────────────────────┴─────────────────────────┤
│                                │ existing TeoyubeWorld search + story carousel   │
│                                ├──────────────────────┬─────────────────────────┤
│                                │ existing video       │ existing feed table      │
└────────────────────────────────┴──────────────────────┴─────────────────────────┘
```

Exact visual treatment:

- the same Search-scoped green, mint, white, off-white, and gold hierarchy;
- approximately 198-pixel desktop sidebar;
- the same compact header, navigation, profile card, button proportions, and
  focus-visible treatment;
- 12–14 pixel panel radii;
- subtle green borders and `0 12px 30px rgba(12, 45, 38, 0.08)`-class shadows;
- reduced page gaps and card padding without clipping copy or controls;
- existing Today carousel image and overlay retained, with only its CSS height,
  typography scale, and control density adjusted;
- Today’s four insight cards remain four columns on wide desktop, then two,
  then one;
- Word and Assignment remain a two-column row on desktop;
- TeoyubeWorld search and featured carousel remain one page-specific panel;
- video highlight and feed remain distinct page-specific regions;
- no generic dashboard, wizard, replacement card, new wrapper, or removed
  imagery;
- all 92 existing controls remain visible and functional;
- no horizontal overflow at any required viewport.

No production image, icon, markup, component, route, data, copy, or behavior
change is proposed.

## Why this cannot be implemented behind the existing interface

This request is itself a visible style change. The required compact shell,
carousel height, card density, radii, spacing, and shadows must be implemented
in the protected Today stylesheet; non-rendering infrastructure cannot change
those visual properties.

`styles/pages/today.css` is protected by two exact source contracts. Any edit
will fail `npm run recovery:verify` unless the owner explicitly authorizes:

1. changing this one stylesheet;
2. applying the change to both canonical Next and static rollback Today,
   because they share the file;
3. updating only this file’s exact size and SHA-256 entries after the CSS is
   final.

The existing approval
`TEOYUBE-VISUAL-2026-07-25-SEARCH-001` explicitly applies only to
`styles/pages/search.css` and forbids broadening that scope. It cannot be
silently reused for Today.

## Alternatives that preserve the current interface

1. Keep Today unchanged. This preserves every existing visual contract but
   does not satisfy the requested Search-style upgrade.
2. Change shared `styles.css` or global tokens. Rejected because it risks every
   route and is broader than a page-scoped Today override.
3. Change JSX, add wrappers, replace cards, or consolidate routes. Rejected
   because the requested result is achievable through existing Today selectors
   and those changes would increase functional and parity risk.
4. Hide controls or content to make the page shorter. Rejected because every
   existing function and visible composition must remain.
5. Apply `transform: scale()`, browser zoom, screenshot backgrounds, or iframe
   rendering. Rejected because these are fragile, inaccessible, and forbidden.
6. Add Today-scoped CSS to `styles/pages/today.css`. This is the proposed
   minimal production approach after exact owner approval.

## Accessibility and performance effects

- DOM order, accessible names, landmarks, focus order, labels, and event
  handlers remain unchanged.
- Focus-visible rings will use the same high-contrast gold treatment as Search.
- All existing touch targets will be checked at the six required viewports.
- No image, font, script, package, or network request is added.
- CSS-only selectors and page-scoped custom properties have negligible runtime
  cost.
- Reduced dimensions must be verified against text wrapping, disclosures,
  drawers, overlays, tables, and keyboard focus to prevent clipping.

## Risks

- Visual: compact sizing could clip carousel copy, TeoyubeWorld content, or
  table controls at intermediate widths.
- Accessibility: overly compact buttons could reduce touch targets or focus
  ring clearance.
- Functional: overflow rules could cover or clip controls even though handlers
  remain intact.
- Responsive: legacy Today rules are extensive and require final-cascade
  verification at all six viewports.
- Migration: both canonical Next and static rollback Today will receive the
  stylesheet change.
- Contract: updating any unrelated protected hash would weaken recovery
  evidence and is not proposed.

Mitigations:

- page-root scoping beneath `body[data-view="today"]`;
- no HTML, JSX, TSX, JavaScript, TypeScript, data, asset, or test-source edit;
- deterministic before/after screenshots;
- all 92 controls inventoried;
- Today interaction, daily-journey, browser, accessibility, build, and recovery
  gates;
- immutable screenshots and owner-approved support baselines remain unchanged.

## Rollback plan

After a future implementation commit, prefer:

```powershell
git revert <future-today-visual-implementation-commit>
```

For an owner-directed pre-commit recovery to the verified starting state:

```powershell
git restore --source da894664ad384bc4da1de1af1c843341a842f7c0 -- `
  styles/pages/today.css `
  tests/visual/contracts/protected-visual-source-manifest.json `
  tests/visual/contracts/original-static-visual-contract.json
```

Then run:

```powershell
npm run recovery:verify
```

Do not delete or regenerate any baseline.

## Agent declaration

> I have not approved this request, changed protected visual sources, or updated baselines. Work is stopped pending an owner decision.
