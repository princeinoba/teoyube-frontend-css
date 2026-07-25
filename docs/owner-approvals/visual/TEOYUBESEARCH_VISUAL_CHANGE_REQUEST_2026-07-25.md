# Teoyube Visual Change Request — TeoyubeSearch

Approval-ID: TEOYUBE-VISUAL-2026-07-25-SEARCH-001
Decision: APPROVED
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner
Approved-At: 2026-07-25T17:51:38-04:00

## Requested scope

- Route/view: `/search`, TeoyubeSearch default populated-results state.
- Runtime scope requiring an owner decision:
  - canonical Next runtime at `/search`;
  - protected static rollback Search view, because both runtimes load the same
    stylesheet.
- Exact proposed production file:
  - `styles/pages/search.css`
- Protected contracts that currently bind that file and would fail after any
  CSS edit:
  - `tests/visual/contracts/protected-visual-source-manifest.json`
  - `tests/visual/contracts/original-static-visual-contract.json`
- Exact selectors/components proposed for page-scoped styling:
  - `body[data-view="search"] .app-shell`
  - `body[data-view="search"] .app-sidebar`
  - `body[data-view="search"] .app-main`
  - `body[data-view="search"] .app-header`
  - `body[data-view="search"] #search`
  - `body[data-view="search"] .search-jumbotron`
  - `body[data-view="search"] .search-form`
  - `body[data-view="search"] .phase116-search-suggestions`
  - `body[data-view="search"] .phase116-chip-row`
  - `body[data-view="search"] .phase116-chip`
  - `body[data-view="search"] .quick-prompts`
  - `body[data-view="search"] .search-results-shell`
  - `body[data-view="search"] .search-results-toolbar`
  - `body[data-view="search"] .search-view-actions`
  - `body[data-view="search"] .search-results`
  - `body[data-view="search"] .search-result-card`
  - `body[data-view="search"] .thumbnail`
  - `body[data-view="search"] .search-bookmark`
  - `body[data-view="search"] .scripture-strip`
  - `body[data-view="search"] .phase116b-result-metrics`
  - `body[data-view="search"] .phase114-explanation-path`
  - `body[data-view="search"] .phase116-why-this-panel`
  - `body[data-view="search"] .search-progress`
  - `body[data-view="search"] .result-actions`
  - `body[data-view="search"] .phase115-feedback-controls`
  - `body[data-view="search"] .search-feature-row`
  - `body[data-view="search"] .search-feature-icon`
- Exact production assets to retain without modification:
  - `public/images/search/search-purpose-hero.png`
  - `public/images/search/suggested-journey-01.png`
  - `public/images/search/suggested-journey-02.png`
  - `public/images/search/suggested-journey-03.png`
  - existing CSS mask icons and existing shell assets.
- Requested viewports/states:
  - 1536×1024 primary default populated-results state;
  - 1440×900;
  - 1280×800;
  - 1024×768;
  - 768×1024;
  - 390×844;
  - search, category, sorting, grid/list, disclosure, feedback, save,
    navigation, focus, and responsive-navigation states.

## Existing behavior and appearance

Before screenshot:

[Current `/search` at 1536×1024](evidence/TEOYUBESEARCH-VISUAL-REQUEST-2026-07-25/before-1536x1024.png)

- SHA-256:
  `10e85141f5f5c9543515a22da3f65d4d05b9374b12986ccbb58827c681f4cc44`
- Captured from:
  `http://127.0.0.1:3000/search`
- Current route root:
  `body[data-view="search"] #search`
- Current measured geometry at 1536×1024:
  - page root: x 280, y 125, width 1236, height 1703.17;
  - hero: x 280, y 125, width 1236, height 564.75;
  - search form: x 313, y 369.58, width 1024, height 61.38;
  - results shell: x 280, y 721.75, width 1236, height 990.5;
  - three cards: width 387.88 and height 896.25 each;
  - benefits strip: y 1728.25, width 1236, height 99.92.
- Horizontal overflow: none.
- Console errors during capture: none.
- Current controls found inside `#search`: 74.

The existing route is functional and its visual/DOM/interaction contracts pass
before this request. `npm run recovery:verify` passed before any proposed CSS
work.

## Proposed behavior and appearance

Owner-supplied proposed-after mock:

[Proposed reference at 1536×1024](evidence/TEOYUBESEARCH-VISUAL-REQUEST-2026-07-25/proposed-reference-1536x1024.png)

- SHA-256:
  `9ae5508cf494416e3dad337057cec8de84f64ac259ce13dbf02411451e4874dd`
- The requested result is a compact Search-only composition with an
  approximately 198-pixel sidebar, shorter hero, unified search surface,
  integrated suggestion panel, compact three-column equal-height cards, and
  four-column benefits strip.
- No production image, icon, route, component, behavior, data, or content
  change is proposed by this request.

## Why this cannot currently be executed as a CSS-only change

### 1. The only proposed stylesheet is immutable protected source

`styles/pages/search.css` is recorded at SHA-256
`cf1a76c81e8d8715c96855ac8e9891ca382d034f08accb3c133ef0571fb22c8d`
in the protected visual-source manifest and the original-static visual
contract. Any CSS edit makes `npm run recovery:verify` fail. The supplied brief
forbids changing JSON contracts or baselines, so there is no authorized path
to both change the stylesheet and leave the mandatory recovery gate green.

The existing owner record
`TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8` explicitly says it does not authorize
future Search CSS changes. A new owner-authored approval record must therefore
supersede that restriction for this exact scope and state how the protected
source contract is to be handled.

### 2. Canonical Next and static rollback share the stylesheet

Both runtimes load `styles/legacy.css`, the modular stylesheet sequence, and
`styles/pages/search.css`. A CSS-only edit cannot update canonical Next Search
without also changing the protected static rollback Search rendering. The
approval must explicitly decide whether both Search implementations are in
scope.

### 3. The existing DOM has extra functional controls absent from the mock

Each current result card contains:

- media bookmark;
- `Save to Book`;
- `Add to Promise Table`;
- `Explore Journey`;
- `View Graph`;
- `Compare Preview`;
- `More like this`;
- `Less like this`;
- `Not relevant`;
- `Save Scripture`;
- `Save Word`;
- `Save Prayer`;
- `Complete Action`;
- `Reset this preference`;
- two independent disclosure summaries:
  `phase114-explanation-path` and `phase116-why-this-panel`.

The mock omits `Save to Book`, `View Graph`, `Reset this preference`, and the
second disclosure row. The brief simultaneously forbids hiding/removing
controls and requires exact reproduction of the mock. CSS cannot satisfy both
requirements. Keeping the controls creates a visible mismatch; hiding them
breaks functional and accessibility preservation.

### 4. Required visible copy differs from the existing DOM

The approved shell renders:

`Where God's Promises Meet Your Calling`

The proposed mock requests:

`GOD'S PROMISES MEET YOUR CALLING`

Changing or replacing this text is prohibited, and CSS-generated replacement
text is also prohibited. CSS cannot make these strings identical without
hiding or falsifying user-visible content.

### 5. Suggestion controls are split across sibling structures

The proposed panel visually combines the heading, explanatory copy, Clear
control, and ten suggestion chips. The existing DOM splits these controls
between:

- `.phase116-search-suggestions` with five suggestions plus Clear; and
- sibling `.quick-prompts` with eight additional functional prompts.

CSS can visually align these siblings, but cannot create one semantic panel or
deduplicate repeated prompts without hiding or moving controls. Exact mock
parity is therefore not available under the stated no-wrapper/no-markup rule.

## Alternatives considered

1. **Keep the protected current interface.**
   Preserves all recovery contracts and functions, but does not match the new
   mock.
2. **Page-scoped CSS overrides in `styles/pages/search.css`.**
   Best implementation approach after approval; it preserves DOM and behavior
   but still affects static rollback, breaks protected source hashes, and
   cannot resolve the extra-control/copy/grouping conflicts.
3. **Modify shared `styles.css` or global tokens.**
   Rejected because it is protected, broad, and risks every other route.
4. **Hide extra controls or duplicate text with pseudo-elements.**
   Rejected because it violates the brief's functionality, accessibility, and
   content requirements.
5. **Use negative margins, absolute placement, scaling, zoom, or the mock as a
   background.**
   Rejected by the brief and because it would be fragile and inaccessible.
6. **Permit a narrowly scoped DOM/content amendment.**
   Technically resolves grouping, copy, and extra-control decisions, but is
   outside the current CSS-only authorization and requires a separate owner
   decision.
7. **Approve a deliberate visual mismatch for the extra controls and existing
   copy.**
   Keeps CSS-only implementation possible, but cannot meet the requested
   below-1% or exact-composition claim.

## Accessibility effects

- Intended page-scoped CSS must preserve tab order, labels, focus visibility,
  touch targets, disclosures, and every control.
- Hiding any of the extra controls would reduce keyboard and screen-reader
  access and is not proposed.
- Compacting the cards must not clip expanded disclosure content, dropdowns,
  toasts, or focus rings.
- Existing inherited accessibility debt remains evidence, and no WCAG
  conformance claim is made.

## Performance effects

- CSS-only layout overrides should add no runtime requests and negligible
  stylesheet bytes.
- Existing images and font loading remain unchanged.
- Layout density changes require six-viewport screenshot, geometry,
  interaction, accessibility/focus, and performance validation.

## Risks

- mandatory protected-source verification failure;
- unintended change to static rollback Search;
- unintended shell impact if route scoping is incomplete;
- clipped or inaccessible controls from aggressive card compaction;
- divergence between the proposed mock and the preserved control inventory;
- responsive overflow at tablet/mobile widths;
- dropdown, disclosure, toast, or focus-ring clipping;
- claiming visual parity that CSS alone cannot achieve.

## Rollback plan

No production change has been made.

If a future approved CSS-only commit is created, rollback must be performed by
reverting that exact commit. Before any implementation, record the starting
commit:

`037152e97478dfd096f5f6799156647f865ebb02`

After rollback, require:

- `npm run recovery:verify`;
- canonical `/search` functional checks;
- static rollback Search checks;
- all unrelated route visual contracts;
- clean worktree and zero listener leaks.

## Final owner decision

The owner approved this request under
`TEOYUBE-VISUAL-2026-07-25-SEARCH-001` and directed implementation to continue
without another approval round.

The approval is limited to:

1. modifying `styles/pages/search.css` for the exact TeoyubeSearch
   transformation described by this request;
2. applying the Search-specific stylesheet to both canonical Next `/search`
   and the protected static rollback Search view;
3. updating only the exact immutable-source hash entries for
   `styles/pages/search.css`, and only after the CSS is final and reviewed;
4. keeping every existing functional control visible, operable, compact, and
   understandable, accepting its presence as an approved difference from the
   reference image;
5. preserving the existing header copy as an approved CSS-only difference;
6. styling the two existing suggestion structures as one visually coherent
   surface without a DOM amendment;
7. creating approval, comparison, overlay/diff, measurement, and final report
   evidence without replacing any immutable screenshot baseline.

No other production source, product copy, DOM, JavaScript/TypeScript, route,
asset, package, build configuration, test source, or visual baseline is
authorized to change.

## Agent declaration

> The owner approved this exact scoped exception. Implementation may continue
> under the restrictions in the final owner decision above.
