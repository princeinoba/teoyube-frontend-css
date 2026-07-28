# Testimony Archive Visual Change — Owner-Authored Authority Provenance

The governing authority for this task is the owner-authored attachment supplied
in the Codex task:

`C:\Users\royce\.codex\attachments\6e65aae8-936b-4d31-9f25-f16f908a2bc9\pasted-text.txt`

That attachment identifies the Testimony visual authorization as
`TEOYUBE-VISUAL-2026-07-27-TESTIMONY-001` and contains the owner's decision,
identity, timestamp, exact scope, implementation constraints, and acceptance
criteria. Codex has not recreated, edited, or asserted the four owner-only
decision fields in this repository file.

## Exact governed scope

- Route and state: `/testimony`, canonical default Testimony Archive state and
  its existing responsive, focus, filter, form, record, and interaction states.
- Unique approved view: `#testimony.testimony-view`.
- Product-source file: `styles/pages/testimony.css`.
- Protected-derived metadata: only the exact Testimony stylesheet fingerprint,
  the visual-contract entry derived from that stylesheet, and deterministic
  runtime identity derived from those changes.
- Evidence directory:
  `docs/owner-approvals/visual/evidence/TESTIMONY-VISUAL-REQUEST-2026-07-27/`.
- Owner reference:
  `ChatGPT Image Jul 27, 2026, 08_46_32 PM.png`, native size
  `1448 × 1086`.

## Governed selectors and components

All CSS must be scoped beneath `body[data-view="testimony"]` and the existing
`#testimony.testimony-view` root. The governed components are:

- application shell and active Testimony navigation state;
- `.testimony-hero`;
- `.testimony-dashboard`, `.testimony-main`, and `.testimony-rail`;
- `.testimony-form-card`, `.testimony-card-head`, and
  `.testimony-media-actions`;
- `.testimony-insights-card`, `.testimony-insight-grid`;
- `.testimony-milestones-card`, `.testimony-milestones`;
- `.testimony-wall-card`, `.testimony-impact-card`, and
  `.testimony-quick-card`;
- `.testimony-archive-card`, `.testimony-section-head`,
  `.testimony-list-tools`, and `.testimony-tabs`;
- `#phase117TestimonyControls`;
- `.testimony-entry`, `.testimony-thumb`, `.testimony-status-badge`,
  `.testimony-entry-body`, `.testimony-entry-meta`,
  `.testimony-entry-stats`, `.scripture-strip`, `.scripture-pill`, and
  `.testimony-load-more`;
- the existing local beta notice where present on the Testimony route;
- existing desktop, tablet, mobile, zoom, reduced-motion, hover, active,
  disabled, and focus states.

No markup, DOM order, accessible name, route, handler, value, testimony record,
privacy status, Scripture reference, image asset, SVG asset, JavaScript,
TypeScript, package, build configuration, environment configuration, or test
source change is within scope.

## Assets and visual evidence

Existing assets may be repositioned or resized through Testimony-scoped CSS,
but may not be edited, replaced, regenerated, or used as a screenshot overlay.
The owner reference is evidence only and must not be used as a page background.
Before, final, responsive, comparison, difference, functional, and
accessibility evidence must be stored under the governed evidence directory.
Immutable and owner-approved baselines must not be overwritten.

## Implementation rationale

The current Testimony page already contains the required DOM targets and
behavior, but its route-owned stylesheet contains only a minimal width guard.
The visual transformation can therefore migrate behind the existing interface
through route-scoped CSS. Replacing markup, introducing a new component system,
modifying shared styles, or reproducing the reference as an image would change
behavior, increase cross-route risk, or evade the visual contract.

## Accessibility, performance, and rollback

The implementation must preserve keyboard and DOM order, accessible names,
focus visibility, form labels, privacy semantics, and all controls. It must
reflow at 200% zoom and mobile widths without clipping or horizontal page
overflow. Decorative CSS icons must use existing DOM targets, remain
pointer-transparent, and supplement visible labels. No new dependency, remote
asset, continuous animation, large blur, layout animation, or
`transition: all` is permitted.

Rollback must revert only the focused commits created for this Testimony task.
The original static source, immutable baselines, and unrelated owner-approved
route work remain untouched.

