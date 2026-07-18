# Embedded Videos and Full-Width Regression Audit

## Scope

This audit covers the normal static Node application shell, Embedded Videos, Tables, Roadmap, and the separation between normal application CSS and owner Media Review CSS.

## Exact regression causes

### 1. The modular shell reintroduced a centered application width

`styles/tokens.css` defines `--page-max: 100rem`. `styles/layout.css`, which loads after the legacy application stylesheet, applies that token to both `.app-header` and `.page-container` with `width: min(100%, var(--page-max))`, `max-width: var(--page-max)`, and automatic inline margins.

Those rules override the legacy full-width page shell on wide displays. The result is a centered inner application with large unused regions instead of a main column that consumes the space remaining beside the sidebar.

Affected selectors:

- `.app-header`
- `.page-container`
- `.app-main`
- every normal `.view` that also has `.page-container`

Affected normal pages:

- Today
- TeoyubeSearch
- Canon
- Promise Table
- Calling Compass
- Book of the Saint
- Lexicon
- Testimony
- Teo Guide
- Embedded Videos
- Tables when exposed normally

### 2. The global insight-rail reservation compresses pages that do not own a rail

`styles/layout.css` uses `body:has(.phase113-insight-rail:not(.collapsed)) .app-main` to reserve up to 24vw on every desktop page. The rail is a fixed overlay created by the shared Phase 11.3 shell, not a page grid column. Reserving that space globally compresses unrelated pages and can remain active whenever the shared rail is present and not marked collapsed.

The rail should overlay the current page. A page that genuinely needs an inline rail must define that layout in its own page grid rather than changing the global main column.

### 3. Embedded Videos was changed from the original library to pilot-only data

`renderUiElementsVideos()` in `app.js` now calls `getApprovedEmbeddedVideos()` as its only source. The original `uiElementVideos`/local preview library is still loaded by `loadUiElementsYoutubeFeed()`, but the renderer no longer reads it.

The Embedded Videos markup was also reduced from six original category tabs to `All Videos`, `Scripture`, and `Shorts`. This made the 12-record Galatians pilot replace the original page instead of appearing as a contained source.

Route impact:

- `#media`, `#videos`, and `#embedded-videos` still resolve to the established `ui-elements` view.
- There is no need for a second TeoyubeWorld route.
- The correct repair is a seventh `TeoyubeWorld Media` tab inside `ui-elements`.

### 4. Modular Embedded Videos CSS replaced the original visual proportions

The original premium library in `styles.css` defines a two-column wide grid and the large media-card hierarchy. The later `styles/pages/embedded-videos.css` changes `.ui-video-grid` to three columns and replaces the original card frame with compact pilot-specific poster/body rules.

The page module owns the repair: two columns on wide desktop, one column on narrow screens, a stable 16:9 media area, and shared source-aware card styling.

### 5. Tables was intentionally removed from the normal route registry

The `teoyube-tables` section and `renderTeoyubeTablesPage()` still exist. Recovery work added `teoyube-tables` to the route allowlist only when `?qa=1` is present and removed its sidebar item. That is the direct cause of the missing normal Tables route.

The existing section retains its table demonstration renderer, filters, sorting, expansion, and pagination. It should be returned to normal navigation and extended with a separate, scoped `Teoyube Data Management` workspace.

## CSS ownership decision

- `styles/tokens.css`: design tokens only; no application max-width policy.
- `styles/layout.css`: full-width shell, sidebar/main relationship, and overlay stacking.
- `styles/pages/embedded-videos.css`: Embedded Videos grid and source-aware cards.
- `styles/pages/tables.css`: Tables demonstrations and data-management workspace only.
- `styles/responsive.css`: shared sidebar drawer and viewport breakpoints.
- `styles/owner/media-review.css`: owner Media Review only.

`index.html` does not load owner Media Review CSS. `media-review.html` remains a separate owner tool and is outside this repair.

## Roadmap state

The current Roadmap displays implementation phases, architecture modules, API routes, deployment/project structure, integration counts, and developer completion percentages. It does not present state-backed user journey progress or actionable normal-user milestones. It is classified as owner/developer-only and remains preserved behind `?qa=1` rather than returning to normal navigation.

## Repair direction

1. Remove the global page maximum and global rail space reservation from their owning layout rules.
2. Restore a two-column wide Embedded Videos grid.
3. Reconnect the original library to the original six tabs.
4. Add the approved runtime manifest as the seventh contained tab only.
5. Restore the existing Tables route and demonstrations, then add scoped local-data views.
6. Preserve Roadmap and owner Media Review in QA/owner-only surfaces.
