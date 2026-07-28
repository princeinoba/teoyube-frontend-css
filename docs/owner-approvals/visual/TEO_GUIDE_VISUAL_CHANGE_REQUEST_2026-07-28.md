# Teoyube Visual Change Request — Teo Guide

Decision: APPROVED  
Approval-ID: TEOYUBE-VISUAL-2026-07-28-TEO-GUIDE-001  
Approved-By: Prince Okiemute Inoba — Teoyube Project Owner  
Approved-At: 2026-07-28T07:11:22-04:00

## Requested scope

- Canonical route: `/teo-guide`
- Protected static rollback view: `#guide`
- Unique page root: `body[data-view="guide"] #guide`
- Exact authorized production stylesheet: `styles/pages/teo-guide.css`
- Existing shared visual sources: the protected modular stylesheet sequence,
  including `styles/legacy.css` and `styles/pages/index.css`
- Exact derived governance files that may be updated after the approved CSS
  change:
  - `tests/visual/contracts/protected-visual-source-manifest.json`
  - `tests/visual/contracts/original-static-visual-contract.json`
  - `config/runtime/asset-media-compatibility-manifest.json`
  - `config/runtime/canonical-runtime-manifest.json`
- Owner reference:
  `evidence/TEO-GUIDE-VISUAL-REQUEST-2026-07-28/teo-guide-owner-reference-1402x1122.png`
- Owner-reference SHA-256:
  `a6a6bd6089af748e8ddcfb6966d319ff2011337ada41bde4c225ad695c68d246`
- Owner-reference dimensions: 1402×1122 pixels
- Starting stylesheet SHA-256:
  `525c5a75e54331e9ae4940060ed63a1159e7963a897697355c3d96ffd99ccb02`
- Starting stylesheet length: 101 bytes

The owner authorizes a complete CSS-only visual transformation of the Teo
Guide route, closely reproducing the supplied reference while preserving every
existing DOM node, class, ID, route, state, value, handler, control, accessible
name, keyboard position, Scripture reference, prompt, response, safety
boundary, asset, and static rollback behavior.

## Exact authorized selectors and components

All production rules must remain beneath `body[data-view="guide"]` and the
existing Teo Guide page root or one of its existing component roots, including:

- `.app-shell`, `.app-sidebar`, `.sidebar`, `.app-main`, and `.app-header`
  only while `body[data-view="guide"]` is active;
- `#guide`, `.guide-layout`, `.guide-main`, and `.guide-chat-panel`;
- the existing hero, Divine Guide, help-card, guidance-topic, and Scripture
  quotation surfaces;
- existing chat header, contextual guide, response, explanation, feedback,
  prompt-category, suggested-prompt, smart-search, composer, disclaimer, and
  local-notice surfaces;
- existing Teo Guide buttons, inputs, textareas, icon nodes, and decorative
  pseudo-elements only when nested beneath the Teo Guide route root.

No shared selector is authorized without the `body[data-view="guide"]` route
scope.

## Exact assets

The implementation must retain the existing Teo Guide hero, scenic and
Scripture artwork, every current UI asset, and all current paths. No image, SVG,
font, package, runtime content, or external dependency may be replaced.
Decorative icons may be restored through existing nodes, existing local icon
mechanisms, or tightly scoped CSS masks as authorized by the owner.

## Why this cannot be implemented behind the existing interface

The requested outcome is a visible page transformation. It cannot be delivered
as non-rendering architecture because the owner specifically authorized the
reference's Teo Guide layout, guidance column, chat workspace, icons,
responsive composition, and CSS presentation. The existing markup already
contains the functional surfaces; only page-owned CSS is authorized to change
their presentation.

The canonical Next route and protected static rollback view both load
`styles/pages/index.css`, which imports `styles/pages/teo-guide.css`. The
approval therefore covers the same route-scoped stylesheet in both render
paths.

## Alternatives considered

1. Keep the existing Teo Guide presentation unchanged. Rejected because it
   does not satisfy the approved visual transformation.
2. Change shared or global CSS. Rejected because it risks cross-route leakage.
3. Add or reorganize markup. Rejected because product-source changes are
   restricted to CSS.
4. Hide live controls absent from the reference. Rejected because every live
   control and handler must remain visible and reachable.
5. Use the reference as a background or scale the page. Rejected as
   inaccessible and functionally deceptive.
6. Add external icons or a UI dependency. Rejected because existing nodes and
   page-scoped CSS are sufficient.

## Accessibility and performance effects

- DOM order, control count, accessible names, ARIA state, labels, routes,
  handlers, prompt state, and feedback state remain unchanged.
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

- **Visual:** reference proportions may conflict with additional live content.
  Preserve and wrap all live controls; document residual CSS-only differences.
- **Responsive:** the desktop two-column layout could squeeze the chat column.
  Reflow to one column before controls become unreadable.
- **Accessibility:** decorative pseudo-elements could cover focus outlines or
  controls. Keep them non-interactive and verify keyboard/focus behavior.
- **Functional:** CSS overflow or stacking could obstruct controls. Verify all
  rendered controls, chat scrolling, composer actions, and notices.
- **Cross-route:** shared class names could leak. Require the exact Guide route
  scope on every production selector.
- **Rollback:** protected fingerprints and deterministic runtime identity must
  be reverted with the stylesheet.

## Rollback plan

Revert the focused Teo Guide commits created for this approval. Do not rewrite
history, replace immutable baselines, or alter another route.

## Owner decision source

The four approval fields and complete scope above were supplied directly and
confirmed in chat by the Teoyube Project Owner on 2026-07-28. This record
transcribes that owner decision; it does not originate or broaden it.
