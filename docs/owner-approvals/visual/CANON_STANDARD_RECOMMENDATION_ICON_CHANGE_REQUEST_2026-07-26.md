# Visual Change Request — Canon Standard Recommendation Icons

Approval-ID: TEOYUBE-VISUAL-2026-07-26-CANON-REC-ICONS-001  
Decision: APPROVED  
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner  
Approved-At: 2026-07-26T17:14:46-04:00

## Request summary

Add the decorative icons shown in the owner reference to their corresponding
containers in the Canon `Standard recommendation` workspace. Preserve all
existing text, accessible names, controls, event handlers, recommendation
content, ordering, disclosures, feedback actions, workflow actions, responsive
behavior, and project functionality.

This request is separate from
`TEOYUBE-VISUAL-2026-07-25-CANON-001`. That approval authorized a CSS
composition change but explicitly excluded icon additions and CSS-generated
content.

## Exact route and state

- Route: `/canon`
- State: default Canon route with the `Recommended for Your Current Journey`
  section visible
- Root selector:
  `body[data-view="canon"] [id="phase115SmartRecommendations-canon"]`
- Affected state: visual decoration only; open/closed disclosure state and
  recommendation behavior remain unchanged

## Exact proposed production files

- `styles/pages/canon.css`

If approved and implemented, only the exact fingerprint entries for the
modified Canon stylesheet may also be updated in:

- `tests/visual/contracts/protected-visual-source-manifest.json`
- `tests/visual/contracts/original-static-visual-contract.json`

Candidate screenshots and verification evidence may be added only under:

- `docs/owner-approvals/visual/evidence/CANON-VISUAL-REQUEST-2026-07-26/icons/`

No baseline screenshot, DOM snapshot, JavaScript, TypeScript, TSX, JSX, HTML,
asset, package, configuration, route, data, or generated approved-markup file
is in scope.

## Exact selectors and icon mapping

All proposed selectors must remain nested under the root selector above.
Icons are decorative CSS pseudo-elements with route-scoped inline SVG masks;
they do not replace or hide visible labels.

### Section header and comparison action

- `.phase115-smart-recommendations__heading` — green rounded-square
  tree/branch emblem
- `[data-phase115-action="compare-recommendation"]` — bidirectional compare
  arrows

### Recommendation cards

The existing card order is preserved:

1. `.phase115-recommendation-card:nth-child(1)` — open book for Scripture
2. `.phase115-recommendation-card:nth-child(2)` — speech bubble for Teoyube
   Word
3. `.phase115-recommendation-card:nth-child(3)` — shield for Promise Cluster
4. `.phase115-recommendation-card:nth-child(4)` — praying hands for Prayer
5. `.phase115-recommendation-card:nth-child(5)` — target for Action Step
6. `.phase115-recommendation-card:nth-child(6)` — route/path for Journey

### Recommendation disclosure actions

- `[data-phase116-action="open-graph"]` — graph/path icon
- `[data-phase115-action="compare-recommendation"]` — bidirectional compare
  arrows

### Recommendation feedback actions

- `[data-phase115-feedback="more_like_this"]` — thumbs up
- `[data-phase115-feedback="less_like_this"]` — thumbs down
- `[data-phase115-feedback="not_relevant"]` — circled X
- `[data-phase115-feedback="save_scripture"]` — Scripture bookmark/open book
- `[data-phase115-feedback="save_word"]` — bookmark
- `[data-phase115-feedback="save_prayer"]` — praying hands
- `[data-phase115-feedback="complete_action"]` — checked square
- `[data-phase115-feedback="reset_preference"]` — circular reset arrow

### Guided Workflow Builder

- `.phase116-workflow-builder__heading` — circular compass/route emblem
- `[data-phase116-workflow="need-promise"]` — bookmark
- `[data-phase116-workflow="help-pray"]` — praying hands
- `[data-phase116-workflow="calling-clarity"]` — compass
- `[data-phase116-workflow="growth-journey"]` — sprout
- `[data-phase116-workflow="study-word"]` — magnifier
- `[data-phase116-workflow="record-testimony"]` — microphone

### Privacy footer

- The existing privacy-footer container, when present in the approved rendered
  section, receives a compact lock icon beside its unchanged privacy statement.
- No privacy text, behavior, footer container, or DOM node may be added or
  changed solely to create this icon.

## Exact assets

No new or existing external asset path is proposed. The preferred
implementation uses small monochrome inline SVG masks in
`styles/pages/canon.css`, following existing project icon-mask conventions.
This adds no network request and does not relocate, replace, or modify an
approved asset.

The icons must be visually subordinate to their labels and inherit the
existing Canon emerald/teal palette. Emoji, icon fonts, third-party icon
packages, and raster replacements are out of scope.

## Before screenshot

Current approved implementation without the requested icons:

- `docs/owner-approvals/visual/evidence/CANON-VISUAL-REQUEST-2026-07-25/standard-recommendation/after-default-panel-1536x1024.png`

## Proposed appearance reference

Owner-supplied reference showing the requested icon placement:

- `docs/owner-approvals/visual/evidence/CANON-VISUAL-REQUEST-2026-07-25/standard-recommendation/owner-reference.png`

The owner amendment dated 2026-07-26 includes the lock icon shown beside the
privacy statement only when the existing approved privacy-footer container is
present. New privacy copy, a new footer, and any new DOM required to create one
remain excluded. This request otherwise covers only icons for containers and
controls that already exist in the approved Canon DOM.

## Why the change cannot be implemented behind the existing interface

The current approved DOM contains the relevant text and functional controls
but contains no icon nodes for these containers. Adding the requested visual
symbols necessarily changes rendered output. The narrowest implementation is
route-scoped CSS decoration attached to existing containers; it leaves the DOM,
accessible labels, and behavior intact.

## Alternatives considered

1. **Add icon elements to the rendered markup.** Rejected because it would
   modify approved DOM hierarchy and generated markup and carries greater
   accessibility and interaction risk.
2. **Add image or SVG asset files.** Rejected because separate asset requests
   are unnecessary for small monochrome symbols and would expand the protected
   asset surface.
3. **Use an icon library or icon font.** Rejected because it would add a
   dependency and could alter loading, layout, and project-wide styling.
4. **Use Unicode glyphs or emoji.** Rejected because platform rendering is
   inconsistent and would not match the reference.
5. **Use route-scoped CSS pseudo-elements with inline SVG masks.** Preferred
   because it changes one page stylesheet, requires no DOM or behavior change,
   performs no network fetch, and follows existing project conventions.
6. **Leave the icons absent.** Safest technically, but does not satisfy the
   owner's requested Canon presentation.

## Accessibility effects

- Existing button text and accessible names remain unchanged and visible.
- Decorative icons receive no independent focus stop or interactive role.
- Icons must not be the sole indicator of an action.
- Focus order, keyboard behavior, disclosure semantics, and control hit areas
  must remain unchanged.
- Icons must retain sufficient contrast without replacing text labels.
- Verification must cover keyboard navigation, visible focus, reduced motion,
  high zoom, and control clipping.

## Performance effects

- No new HTTP requests, packages, scripts, fonts, or runtime logic.
- Inline monochrome SVG masks add a small stylesheet cost only.
- No animation is authorized.
- Candidate verification must confirm no measurable regression in layout
  stability or interaction response.

## Functional and responsive constraints

- Preserve every existing control and handler.
- Preserve the current 73 interactive controls in the Canon page audit unless
  an independently verified existing state produces a different count.
- Preserve recommendation ordering, content, confidence labels, Scripture
  references, feedback behavior, disclosure behavior, comparison behavior,
  and Guided Workflow Builder behavior.
- No label may be hidden or replaced by an icon.
- No card, action row, or workflow tile may overflow or clip.
- Verify at 1536×1024, 1440×900, 1280×800, 1024×768, 768×1024, 390×844,
  representative intermediate widths, 200% zoom, and reduced motion.

## Validation required after approval

- `npm run recovery:verify`
- `npm run recovery:visual:verify`
- Canon screenshot comparison at every required viewport
- Canon DOM/class/asset contract comparison
- Canon functional and keyboard/browser checks
- build, typecheck, lint, unit, and applicable browser suites
- focused audit proving icons do not change accessible names, focus order,
  handler counts, recommendation output, or workflow behavior
- separate disposable candidate screenshots; immutable and owner-approved
  baselines must not be overwritten

## Risks

- Pseudo-element spacing could change wrapping or card height.
- Incorrect selector scope could decorate controls outside Canon.
- Generated icons could overlap labels at narrow widths or high zoom.
- Mask rendering could differ across browsers.
- Reusing one pseudo-element for both an icon and an existing decoration could
  unintentionally remove approved styling.

These risks are controlled by strict root scoping, one-to-one selector
mapping, unchanged visible labels, responsive browser evidence, and a
single-file rollback.

## Rollback plan

If implemented in a future approved task:

1. Revert the dedicated icon implementation commit with
   `git revert <future-icon-commit>`.
2. Restore the prior exact Canon stylesheet fingerprint entries in the two
   protected visual contracts.
3. Remove only the disposable icon candidate evidence if required.
4. Run `npm run recovery:verify` and the focused Canon parity/functional suite.

If this request record is inaccurate before approval, remove only:

- `docs/owner-approvals/visual/CANON_STANDARD_RECOMMENDATION_ICON_CHANGE_REQUEST_2026-07-26.md`

## Explicit exclusions

- new privacy footer, new privacy copy, or new DOM solely to create a footer;
  the lock icon beside an existing privacy statement is approved
- new DOM elements or wrappers
- changes to JavaScript, TypeScript, TSX, JSX, HTML, or generated markup
- changes to recommendation data, TIG, Scripture sources, confidence,
  explanation, or ordering
- changes to event handlers, routes, persistence, AI, or workflow behavior
- CSS consolidation or changes outside the scoped Canon section
- replacement or regeneration of immutable or owner-approved baselines
- any icon outside the selector inventory above

## Owner-only decision

The owner approved the exact scope above under
`TEOYUBE-VISUAL-2026-07-26-CANON-REC-ICONS-001`. Approval is limited to the
listed route, root, selectors, icon meanings, and file boundaries. The
2026-07-26 owner amendment additionally includes a compact lock icon beside an
existing privacy statement. Any addition—especially new copy, a new privacy
footer, markup, assets, or behavior—requires a separate written request.

## Agent declaration

No production visual file, protected visual contract, baseline, asset,
markup, or functional code was changed while preparing this request. The
agent stopped before implementation as required by the visual approval
protocol.
