# Teoyube Visual Change Request — Calling Compass

Approval-ID: TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-001  
Decision: APPROVED  
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner  
Approved-At: 2026-07-27T13:19:16-04:00

## Requested scope

- Route/view:
  - canonical Next runtime at `/calling-compass`;
  - protected static rollback Calling view, because both runtimes load the same
    modular stylesheet sequence;
  - `/compass` remains an unchanged redirect to `/calling-compass`.
- Exact proposed production file:
  - `styles/pages/calling-compass.css`
- Exact governance/fingerprint files that would require derived updates after
  an approved CSS change:
  - `tests/visual/contracts/protected-visual-source-manifest.json`
  - `tests/visual/contracts/original-static-visual-contract.json`
  - `config/runtime/asset-media-compatibility-manifest.json`
  - `config/runtime/canonical-runtime-manifest.json`
- Existing CSS file state:
  - 111 bytes;
  - SHA-256
    `8ac6e869e69ddc247880ddb53e2348dee56ca8e130c2b99bb1353de5c43fe3a8`;
  - currently contains only a maximum-width safeguard for the Calling page.
- Exact selectors/components proposed for route-scoped styling:
  - `body[data-view="calling"]`
  - `body[data-view="calling"] .app-shell`
  - `body[data-view="calling"] .app-sidebar`
  - `body[data-view="calling"] .sidebar`
  - `body[data-view="calling"] .brand-lockup`
  - `body[data-view="calling"] .brand-mark`
  - `body[data-view="calling"] .nav-list`
  - `body[data-view="calling"] .nav-item`
  - `body[data-view="calling"] .saint-card`
  - `body[data-view="calling"] .app-main`
  - `body[data-view="calling"] #calling`
  - `body[data-view="calling"] .calling-premium-page`
  - `body[data-view="calling"] .calling-premium-head`
  - `body[data-view="calling"] .calling-premium-grid`
  - `body[data-view="calling"] .calling-main-column`
  - `body[data-view="calling"] .calling-right-rail`
  - `body[data-view="calling"] .calling-hero-panel`
  - `body[data-view="calling"] .calling-daily-inspiration`
  - `body[data-view="calling"] .calling-content-grid`
  - `body[data-view="calling"] .calling-featured-video`
  - `body[data-view="calling"] .compass-player-shell`
  - `body[data-view="calling"] .calling-compass-panel`
  - `body[data-view="calling"] .calling-radar`
  - `body[data-view="calling"] .phase116b-functional-panel`
  - `body[data-view="calling"] .calling-recommended-section`
  - `body[data-view="calling"] .calling-category-section`
  - `body[data-view="calling"] .calling-playlist-card`
  - `body[data-view="calling"] .calling-continue-card`
  - `body[data-view="calling"] .calling-progress-card`
- Exact assets to retain without modification or replacement:
  - `Asset/ChatGPT Image (Calling Compass).png` as the owner reference;
  - `public/images/canon/canon-hero-journey.png`;
  - `public/images/embed/embedded-videos-hero-bg.png`;
  - `public/images/today/teoyubeworld-search-bg.png`;
  - `public/images/table/calling-compass-panel-bg.png`;
  - `public/images/search/search-purpose-hero.png`;
  - `public/images/search/teoyube-search-panel-bg.png`;
  - `public/images/carousel/kingdom-wisdom.png`;
  - `public/images/carousel/growth-in-grace.png`;
  - `public/images/canon/canon-card-01.png`;
  - `public/images/canon/canon-card-02.png`;
  - `public/images/canon/canon-card-04.png`;
  - `public/images/canon/canon-card-05.png`;
  - `public/images/today-carousel/today-carousel-04-canon.png`;
  - `public/images/today-carousel/today-carousel-07-live-promises.png`;
  - `public/images/today-carousel/today-carousel-12-overlook.png`;
  - all existing CSS mask icons, inline SVG connectors, and shell assets.
- Proposed visual scope:
  - use the same compact 198-pixel desktop shell architecture already approved
    for TeoyubeSearch, Today, Canon, and Promise Table;
  - use the same route background, compact sidebar, header scale, panel radius,
    restrained border, shadow, and spacing rhythm;
  - align the Calling main column and right rail to the common page boundaries;
  - remove the redundant 20-pixel inner padding from the Calling main column;
  - retain the page-specific dark-green hero, Calling Compass radar, video
    player, playlist, continuation, progress, journey, and category treatments;
  - preserve every existing DOM node, label, icon, asset, data value, route,
    control, and handler.
- Required viewports/states after approval:
  - 1536×1024;
  - 1440×900;
  - 1280×800;
  - 1024×768;
  - 768×1024;
  - 390×844;
  - 360×800;
  - 200% browser zoom;
  - default, search, voice-search, suggestion, playlist, video navigation,
    assistant, Calling Compass start/question/result, recommendation,
    category, right-rail, focus, keyboard, notification, and responsive
    navigation states.

## Why this cannot be implemented behind the existing interface

The requested outcome is a visible CSS transformation. It cannot be delivered
as non-rendering architecture behind the current interface because the owner
specifically requested the compact shell, page spacing, panel alignment, and
responsive styling used on the already upgraded routes.

`styles/pages/calling-compass.css` is protected by the source and original
visual contracts. Any production edit changes its hash and intentionally makes
`npm run recovery:verify` fail until an owner-authorized exact fingerprint
update is recorded. The existing parity approval proves the current interface;
it does not authorize a later restyle.

The canonical Next and static rollback Calling views share this stylesheet.
CSS cannot restyle one runtime without changing the other. Approval must
therefore explicitly cover the exact route-scoped stylesheet in both runtimes.

No markup or functional change is needed for the proposed result. A disposable
Playwright CSS-injection mock demonstrates that the requested shell and spacing
can be applied while preserving all 56 Calling controls, their order, assets,
and current mobile visibility. Production implementation remains stopped until
the owner approves the exact scope.

## Existing behavior and appearance

Before screenshots:

- [Current full page at 1536×1024](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/before-1536x1024-full-page.png)
- [Current viewport at 1536×1024](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/before-1536x1024-viewport.png)
- [Current mobile viewport at 390×844](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/before-390x844-viewport.png)

The full-page before screenshot SHA-256 is:

`7009c403e8086964bcd415fe3f76384207d82218150da85744553e3d9f409e21`

Measured at 1536×1024:

- shell columns: 260 px and 1276 px;
- Calling page root: x 280, width 1236 px;
- main column: x 280, width 915 px;
- right rail: x 1211, width 305 px;
- document height: 2486 px;
- document horizontal overflow: 0 px;
- controls inside `#calling`: 56;
- hidden Calling controls: unchanged responsive baseline only;
- console, page, request, and HTTP errors: 0.

Current functional surfaces include:

- Guardrails and Generate Today's Journey;
- TeoyubeWorld search, voice search, suggestions, clusters, and Clear;
- hero Scripture action and Daily Inspiration;
- embedded video, carousel controls, assistant actions, and playlist;
- Calling Compass radar and View Full Compass;
- Guided Calling Compass start, question, answer, back, next, result, save,
  journey, graph, and comparison actions;
- recommended journeys, categories, continuation card, progress card, and
  normal shell/navigation behavior.

`npm run recovery:verify` passed before this request was prepared.

## Proposed behavior and appearance

Non-production CSS-injection mock-ups:

- [Proposed full page at 1536×1024](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/mock-1536x1024-full-page.png)
- [Proposed viewport at 1536×1024](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/mock-1536x1024-viewport.png)
- [Proposed mobile viewport at 390×844](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/mock-390x844-viewport.png)
- [Current/proposed side-by-side](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/before-proposed-side-by-side-1536x1024.png)
- [Current/proposed overlay](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/before-proposed-overlay-1536x1024.png)
- [Exact proposed-layout audit](evidence/CALLING-COMPASS-VISUAL-REQUEST-2026-07-27/calling-compass-proposed-layout-audit.json)

The full-page proposed mock SHA-256 is:

`91c0e3184770a6653577db6af05b46b60cb04e864d221ecec639bacd101b468b`

The mock is explicitly not a production implementation. It injects temporary
route-scoped CSS after page load and changes no repository product source.

Measured proposed desktop result:

- compact shell target: 198 px sidebar plus flexible main area;
- shared content boundaries: x 210 through x 1512;
- main column: x 210, width 954 px;
- right rail: x 1176, width 336 px;
- main/rail gap: 12 px;
- document height: 2323 px;
- document horizontal overflow: 0 px;
- controls: 56 before and 56 proposed;
- exact control signatures: unchanged;
- assets: unchanged;
- console, page, request, and HTTP errors: 0.

Measured proposed mobile result:

- document horizontal overflow: 0 px;
- control count and signatures: unchanged;
- hidden-control count: 1 before and 1 proposed, preserving the existing
  responsive baseline rather than introducing a new hidden control.

The requested production implementation must reproduce the approved mock's
shell and density while retaining the original page-specific compositions and
all current behavior. It must not treat the mock as authorization to simplify,
remove, or replace any Calling surface.

## Alternatives that preserve the current interface

1. **Keep the current protected Calling Compass interface.**
   - Safest and requires no new approval, but does not satisfy the requested
     cross-route CSS alignment.
2. **Apply only the compact shell selectors.**
   - Aligns the sidebar and main background with upgraded routes while leaving
     interior spacing unchanged; lower risk, but visually incomplete.
3. **Apply the route-scoped shell plus restrained page spacing and panel
   containment proposed here.**
   - Recommended after approval. It satisfies the request without markup,
     content, asset, or behavior changes.
4. **Modify shared/global CSS.**
   - Rejected because it could change Today, Search, Canon, Promise Table, and
     every retained route.
5. **Replace the page with shared generic cards or a new dashboard.**
   - Rejected because it destroys the approved page-specific identity.
6. **Hide controls to make the page shorter.**
   - Rejected because it changes behavior and accessibility.
7. **Use negative margins, absolute positioning, transforms, page zoom, or a
   screenshot background.**
   - Rejected as fragile, inaccessible, and contrary to the recovery rules.

## Accessibility and performance effects

- All 56 controls, accessible names, DOM order, keyboard order, focus
  visibility, and responsive navigation must remain unchanged.
- Touch targets, expanded disclosures, notifications, dropdowns, focus rings,
  Calling Compass nodes, and media controls must not be clipped.
- The mobile implementation must retain zero document-level horizontal
  overflow and the current responsive control visibility.
- Route-scoped CSS should add no requests, JavaScript, hydration work, or
  provider calls.
- Existing image, icon, and font assets remain unchanged, so network cost
  should not increase.
- Implementation requires screenshot, DOM/class, asset, functional, keyboard,
  focused Axe, performance, and responsive evidence before it can be reported
  complete.

## Risks

- unintended change to the shared static rollback Calling view;
- mandatory recovery failure if exact approved hashes are not updated;
- cross-route leakage if any selector is not rooted at
  `body[data-view="calling"]`;
- clipping of the radar, player, playlist, right rail, notifications, or focus
  outlines;
- responsive overflow from the two-column desktop composition;
- visual crowding if density is reduced more than the mock;
- inconsistent mobile navigation if desktop shell rules override existing
  responsive behavior;
- accidental functionality changes if implementation expands beyond CSS;
- visual drift from Search, Today, Canon, or Promise Table if shared values are
  copied inconsistently rather than documented as Calling-scoped tokens.

## Rollback plan

No production visual source has been changed.

Starting commit:

`524632cb509ea6d0bc5cd864d274ec6a1586e2c7`

If a future owner-approved implementation commit is created:

1. revert that exact implementation/evidence commit or commit series;
2. restore the prior exact `styles/pages/calling-compass.css` hash;
3. restore only the corresponding derived fingerprint and runtime identity
   entries;
4. run `npm run recovery:verify`;
5. run Calling Compass parity across all six required viewports;
6. run the complete Calling functional/keyboard/browser suite;
7. confirm Today, Search, Canon, Promise Table, and the shared shell are
   unchanged;
8. confirm a clean worktree and healthy canonical runtime.

## Owner decision required

The owner must decide whether to approve this exact route-scoped CSS
transformation for both the canonical Next `/calling-compass` route and the
shared static rollback Calling view.

The coding agent will not write or modify the owner-only approval fields.

## Agent declaration

> I have not approved this request, changed protected visual sources, or updated baselines. Work is stopped pending an owner decision.

---

## Owner amendment -- Guided Calling Compass panel

Decision: APPROVED
Approval-ID: TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-GUIDED-PANEL-001
Approved-By: Prince Okiemute Inoba -- Teoyube Project Owner
Approved-At: 2026-07-27T13:53:17-04:00
Parent-Approval-ID: TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-001

### Exact approved route and state

- Canonical Next route: `/calling-compass`.
- Shared static rollback Calling view, because both runtimes load the same
  route stylesheet.
- Existing dynamic panel: `#phase116bCallingCompassTool`.
- Default, started, active-step, selected-answer, generated-result, disabled,
  focus-visible, hover, keyboard, responsive, and 200% zoom states.

### Exact approved production file

- `styles/pages/calling-compass.css`

No HTML, JavaScript, TypeScript, TSX, asset, package, test, shared stylesheet,
or global stylesheet change is authorized.

### Exact approved selector scope

All new visual rules must remain rooted at:

```css
body[data-view="calling"] #phase116bCallingCompassTool
```

The approved descendants are the panel's existing:

- `.phase116b-panel-head`;
- eyebrow, heading, subtitle, and Start Compass button;
- `.phase116b-compass-progress` and its three ordered step spans;
- `.phase116b-compass-card` question, answer buttons, and action row;
- existing result card and feedback states when present.

### Approved visual result

The Guided Calling Compass panel may be restyled to match the owner-supplied
2048x512 reference:

- a full-width warm white and mint bordered panel;
- a compact compass emblem beside the existing eyebrow, heading, and subtitle;
- the existing Start Compass action at the upper right;
- three connected burden, gift, and season progress pills with numeric markers
  1, 2, and 3 and CSS-rendered semantic icons;
- a contained question workspace with a gold directional emblem;
- CSS-rendered semantic icons for the existing direction, healing, and wisdom
  answer buttons;
- CSS-rendered arrow, sparkle, and wand icons for the existing Back, Next, and
  Generate Result controls;
- route-scoped desktop, tablet, mobile, intermediate-width, focus, disabled,
  hover, and 200% zoom refinements.

CSS pseudo-elements and URL-encoded SVG masks are authorized for these
decorative icons. They must use both `-webkit-mask-*` and standard `mask-*`
properties, must not capture pointer events, and must not add accessible or
DOM text. The only pseudo-element text authorized is the progress numbering
`"1"`, `"2"`, and `"3"`.

### Required preservation

- Existing DOM hierarchy, IDs, classes, class ordering, text, controls,
  accessible names, DOM order, keyboard order, focus behavior, data
  attributes, event wiring, state transitions, TIG behavior, results,
  fallback wording, and route behavior remain unchanged.
- The panel must not become a wizard, modal, drawer, replacement dashboard, or
  screenshot background.
- No new image, icon, font, JavaScript, provider, dependency, or network
  request may be introduced.
- No baseline image or DOM snapshot may be regenerated or replaced.
- All CSS-created decorative elements must use `pointer-events: none`.

### Owner reference and evidence

The owner-supplied reference must be copied without modification to the
existing Calling Compass evidence area as:

`guided-calling-compass-owner-reference-2048x512.png`

Evidence must include the focused panel crop, all required full-page
viewports, mobile, 200% zoom, intermediate drag widths, interaction states,
keyboard/focus verification, Axe, DOM/control invariants, runtime identity,
recovery verification, build/type/lint/unit/browser results, and before/after
geometry.

### Rollback

Revert only the focused approval, CSS implementation, and derived
evidence/fingerprint commits; restore the preceding exact Calling Compass CSS
and manifest hashes; then run `npm run recovery:verify` and the complete
Calling Compass visual and functional suite.
