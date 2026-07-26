# Canon Visual Change Request

Approval-ID: TEOYUBE-VISUAL-2026-07-25-CANON-001

Decision: APPROVED

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-25T23:43:50-04:00

## Request summary

Transform the existing `/canon` page through a Canon-owned, route-scoped CSS
override so its desktop composition, visual density, responsive behavior, and
styling follow the supplied Canon reference. Preserve the current React markup,
content, assets, data, state, events, routes, accessibility semantics, and
application behavior.

The Teoyube Project Owner approved this exact request and the complete upgraded
Canon-page CSS engineering and responsive requirements supplied with it. The
approval is limited to the route, files, selectors, assets, states, viewports,
and verification scope recorded here.

## Exact route and state

- Route: `/canon`
- Body route state: `body[data-view="canon"]`
- Root view: `#canon.view.page-container.active`
- Default page state:
  - Canon Overview tab selected
  - initial featured, recent, recommended, and Watchman carousel positions
  - all optional disclosures closed
  - standard recommendation mode selected
  - default responsive navigation state
- Existing interactive states to preserve:
  - Canon tabs
  - hero search input and popular-search chips
  - featured/recommended/Watchman carousel arrows, dots, and keyboard navigation
  - journey-card selection
  - “Why this?” disclosures
  - quick actions and journey actions
  - desktop and responsive navigation
- Required viewports:
  - 1536×1024
  - 1440×900
  - 1280×800
  - 1024×768
  - 768×1024
  - 390×844
- Additional validation:
  - intermediate widths between the listed breakpoints
  - 200% browser zoom
  - reduced-motion preference

## Exact proposed production files

If and only if the owner approves this request, the proposed implementation may
modify:

1. `styles/pages/canon.css`
2. `tests/visual/contracts/protected-visual-source-manifest.json`
3. `tests/visual/contracts/original-static-visual-contract.json`

The two contract files may change only to record the new owner-approved
`styles/pages/canon.css` fingerprint. No DOM contract, screenshot baseline,
owner reference, asset, markup, JavaScript, TypeScript, TSX, package, build, or
environment file is in scope.

## Exact selectors and components

All rules must be rooted at `body[data-view="canon"]` and limited to the current
Canon page. The proposed selector scope is:

- Page and shell geometry, Canon route only:
  - `body[data-view="canon"] .app-shell`
  - `body[data-view="canon"] .sidebar`
  - `body[data-view="canon"] .app-main`
  - `body[data-view="canon"] .app-header`
  - `body[data-view="canon"] #canon`
- Primary three-region layout:
  - `.canon-premium-layout`
  - `.canon-main-column`
  - `.canon-right-rail`
- Hero, search, and quick suggestions:
  - `.canon-kingdom-hero`
  - `.canon-hero-copy`
  - `.canon-hero-search`
  - `.canon-quick-chips`
- KPI row:
  - `.canon-kpi-grid`
  - `.canon-kpi-card`
- Navigation and sections:
  - `.canon-tabs`
  - `.canon-tab`
  - `.canon-section-block`
  - `.canon-section-title`
- Featured journeys:
  - `.canon-project-grid`
  - `.canon-project-card`
  - `.canon-featured-carousel-card`
  - existing featured carousel stage, arrow, and dot descendants
- Journey categories:
  - `.canon-category-carousel`
  - `.canon-category-track`
  - `.canon-category-card`
  - `.canon-category-grid`
- Recently updated:
  - `.canon-recent-grid`
  - `.canon-recent-card`
  - `.canon-recent-merged-card`
  - `.canon-watchman-story-card`
- Explore Canon:
  - `.canon-explore-section`
  - `.canon-explore-grid`
  - `.canon-explore-card`
- Existing right rail:
  - `.canon-profile-widget`
  - `.canon-overview-widget`
  - `.canon-overview-premium`
  - `.canon-actions-widget`
  - `.canon-builder-widget`
  - `.canon-detail-sticky`
  - `.canon-recommended-widget`
- Existing recommendation, explanation, and guided-workflow descendants rendered
  beneath `#canon`, including the current `.phase116-*` controls, only where a
  more specific `body[data-view="canon"] #canon` selector prevents spillover to
  other routes.

No class may be renamed, reordered, removed, or added. No wrapper or element may
be added.

## Exact assets

No production asset may change. The CSS must continue using the current paths,
including:

- `public/images/canon/canon-hero-journey.png`
- `public/images/canon/canon-builder-badge.png`
- `public/images/canon/category-promise.png`
- `public/images/canon/canon-card-01.png` through the currently rendered Canon
  card set
- `public/images/canon/canon-tile-01.png` through the currently rendered Canon
  tile set
- `public/images/canon/featured-carousel/canon-featured-slide-01.png` through
  `canon-featured-slide-08.png`
- `public/images/canon/recommended-carousel/canon-recommended-slide-01.png`
  through `canon-recommended-slide-06.png`
- `public/images/canon/watchman-carousel/canon-watchman-slide-01.png` through
  `canon-watchman-slide-07.png`
- `public/images/carousel/eternal-hope.png`
- `public/images/sidebar/saint-profile-avatar.png`

The supplied image is approval evidence and a visual target only. It must not be
shipped as a page background, flattened page substitute, or production asset.

## Before evidence

- [Current 1536×1024 top viewport](evidence/CANON-VISUAL-REQUEST-2026-07-25/before-top-1536x1024.png)
- [Current 1536×1024 full page](evidence/CANON-VISUAL-REQUEST-2026-07-25/before-full-1536x1024.png)
- [Current 390×844 full page](evidence/CANON-VISUAL-REQUEST-2026-07-25/before-full-390x844.png)
- [Responsive geometry and runtime audit](evidence/CANON-VISUAL-REQUEST-2026-07-25/current-responsive-audit.json)
- [Current interaction audit](evidence/CANON-VISUAL-REQUEST-2026-07-25/current-interaction-audit.json)

At 1536×1024, the current page has:

- a 260px shell navigation column
- a 1226.41px Canon content region
- an 828.81px main Canon column
- a 376px right rail
- a 475.3px hero
- a 5024.22px full document height
- no horizontal overflow
- 164 visible controls and 3 controls hidden by current state
- no console, page, or request failures during the capture

At 1280px and narrower, the current right rail already moves below the main
column. At 768px and 390px, it becomes a single-column document flow. The
captured six viewports have no horizontal document overflow.

## Proposed after reference

- [Owner-supplied proposed Canon reference](evidence/CANON-VISUAL-REQUEST-2026-07-25/owner-proposed-reference.png)

Reference fingerprint:

```text
SHA-256:
FDE68552B2A23A28012495E18E15D1298EB50901CD82CD7A36C0E64E37056AED
```

This image differs from the existing owner-reference file
`Asset/ChatGPT Image page (TeoyubeCanon Page).png`, whose SHA-256 is:

```text
7403AB4756660A2C6F7A55AB471ED6A3AEE24D0D232D0C2F82844E1996C6D9C4
```

Approval must therefore identify the newly supplied image, not rely on the
older owner-reference manifest entry.

## Proposed visual result

The CSS-only result would:

- keep the application sidebar as the left region
- create a denser, wider central Canon workspace
- retain the narrower contextual right rail
- preserve the current hero artwork and make the hero composition match the
  supplied reference
- keep five KPI cards in a single desktop row
- establish the asymmetric featured-journey composition shown in the reference
- retain the current category, recent, recommendation, exploration, and
  workflow sections while tightening their desktop rhythm
- keep the right rail visually distinct and contextual
- stack the rail and simplify grids at narrower widths without horizontal
  scrolling
- preserve natural document scrolling and avoid zoom, transform, fixed-canvas,
  screenshot-background, or coordinate hacks
- keep all current copy and media
- preserve focus visibility, keyboard interaction, and reduced-motion behavior

## Reason this cannot be implemented behind the existing interface

The requested outcome intentionally changes rendered widths, density, card
composition, spacing, typography hierarchy, rail behavior, responsive
breakpoints, and visual styling. A non-rendering service, view model, data
adapter, or domain change cannot produce that result. It requires a protected
visual CSS change and therefore cannot proceed under the normal no-redesign
contract without this scoped owner approval.

## Current functional discrepancy requiring an owner decision

The current hero Search control renders as `type="button"`. The controller
handles form submission, but clicking this button does not submit the form and
does not emit a result notice. The interaction audit recorded:

- popular-search chip population and focus restoration: PASS
- featured carousel click and keyboard navigation: PASS
- recommended carousel navigation: PASS
- journey-card selection: PASS
- “Why this?” disclosure: PASS
- Canon tab transition: PASS
- mobile navigation open and Escape close: PASS
- hero Search button response: FAIL (existing behavior)

CSS cannot repair this behavior. The supplied engineering brief both forbids
markup/TypeScript changes and requires all controls to work, so those
instructions conflict. This request does not authorize silently changing the
button or controller.

Owner decision: preserve the current non-submitting Search button behavior for
this CSS-only task. Keep the control present, visible, aligned, sized, keyboard
reachable, focus-visible, and clickable to the same extent as the audited
baseline. Do not repair, hide, disable, replace, cover, relabel, or simulate its
submission in CSS.

Record the result as:

`PRE-EXISTING FUNCTIONAL DEFECT — UNCHANGED BY THE APPROVED CSS WORK`

Any future repair requires a separate, explicitly authorized functional task.

## Alternatives considered

1. **Retain the current Canon page.** Safest option; no protected source changes.
2. **Narrow the requested visual scope.** Apply only specifically selected
   sections or viewports after the owner names them.
3. **CSS-only Canon override.** Preferred implementation if approved because it
   keeps markup, behavior, assets, and route architecture intact.
4. **Rebuild or restructure the React view.** Rejected; prohibited by the brief
   and unnecessary for the proposed visual outcome.
5. **Flatten the mock-up into an image or use page scaling.** Rejected because
   it would break semantics, interaction, responsiveness, accessibility, and
   maintainability.

## Accessibility effects

Potential benefits if implemented carefully:

- clearer hierarchy and grouping
- consistent focus visibility
- responsive stacking without horizontal overflow

Risks requiring executable evidence:

- the denser desktop layout may reduce text legibility or target size
- sticky rail content may become inaccessible at shorter viewport heights
- 167 current controls can create crowded keyboard and zoom flows
- visual reordering must not diverge from DOM and focus order
- informational media must retain usable cropping and accessible naming

Validation must include keyboard-only operation, focus order, visible focus,
semantic landmarks, 200% zoom, reduced motion, and all required viewports.

## Performance effects

The implementation may use only existing production assets and CSS. It may not
add fonts, packages, JavaScript, images, or animation dependencies. The main
performance risk is layout and paint cost from dense grids, shadows, sticky
elements, and route-specific overrides. Browser evidence must confirm no new
runtime errors, excessive layout shift, overflow, or degraded interaction.

## Risks

- Existing late Canon rules in `styles.css` use high-specificity declarations
  and responsive overrides; the page-owned override must remain understandable
  and route-scoped.
- The supplied reference is a tall composite rather than a native viewport
  baseline, so exact responsive intent must be verified at each real viewport.
- Matching desktop density can create excessive height or compression on
  tablets and phones.
- Shared shell selectors could affect other routes unless every declaration is
  rooted at `body[data-view="canon"]`.
- Updating the protected CSS fingerprint without exact owner scope would weaken
  recovery integrity.
- Passing screenshots alone cannot excuse changed controls, text, assets, DOM,
  focus order, or behavior.

## Verification required after approval

Before implementation:

- `npm run recovery:verify`
- `npm run recovery:visual:verify`

After implementation:

- `npm run recovery:verify`
- `npm run recovery:visual:verify`
- `npm run runtime:verify`
- build, typecheck, lint, and applicable unit/browser tests
- screenshot capture at all six required viewports into disposable candidate
  output
- side-by-side and overlay comparison to the approved supplied reference
- DOM, ID, class, copy, asset-path, control-count, focus, keyboard, responsive,
  overflow, reduced-motion, and interaction checks
- explicit confirmation that no screenshot or owner-reference baseline changed

The new mock-up must not replace an immutable or owner-approved baseline.

## Rollback plan

If a future implementation is approved and committed:

1. revert that implementation commit with `git revert <implementation-commit>`;
2. restore the prior `styles/pages/canon.css` fingerprint entries in the two
   contract manifests through the same revert;
3. rerun `npm run recovery:verify`, `npm run recovery:visual:verify`, and
   `npm run runtime:verify`;
4. confirm `/canon` matches the before evidence at every required viewport.

No baseline regeneration or asset restoration should be necessary because
neither is in scope.

## Owner decision

The owner approved:

- the full selector, file, state, and viewport scope recorded above;
- the newly supplied reference with SHA-256
  `FDE68552B2A23A28012495E18E15D1298EB50901CD82CD7A36C0E64E37056AED`
  as the visual target;
- CSS-only implementation with the pre-existing Search submission defect
  intentionally preserved unchanged.

Approval remains limited to this exact written scope.

## Agent declaration

The agent did not invent, broaden, or self-approve this decision. The four
owner-only fields and Search decision above were supplied explicitly by Prince
Okiemute Inoba, Teoyube Project Owner.
