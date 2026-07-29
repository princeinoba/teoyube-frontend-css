# Canon full-page visual change approval

Decision: APPROVED

Approval-ID: TEOYUBE-VISUAL-2026-07-28-CANON-FULL-PAGE-002

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-28T15:30:00-04:00

## Route and state

- Canonical route: `/canon`
- Static rollback route: `#canon`
- State: current deterministic default Canon state
- Desktop composition: existing application navigation, Canon workspace, and
  complete Canon contextual rail
- Responsive states: 1536 × 1024, 1440 × 900, 1280 × 800, 1024 × 768,
  768 × 1024, 390 × 844, and 200% browser zoom

## Approved source scope

- Production visual source: `styles/pages/canon.css`
- Protected-source entry for that exact stylesheet
- Exact visual-contract fingerprints derived from that stylesheet
- Deterministic runtime digest/build identity derived solely from the approved
  stylesheet and fingerprint updates
- Approval documentation and disposable/archived Canon evidence

No HTML, JSX, TSX, JavaScript, TypeScript, route, handler, data, copy, asset,
package, test-source, or other page stylesheet change is authorized.

## Selectors and components

The change is limited to selectors scoped beneath:

```css
body[data-view="canon"]
```

The approved composition covers the existing Canon header, hero/search,
metrics, featured journeys, journey-category rail, recently updated cards,
recommendation-logic media, Canon paths, pagination, Standard Recommendation,
Guided Workflow Builder, and complete contextual right rail. Existing left
navigation and shared shell components may be positioned only through
Canon-scoped descendant selectors. They may not be globally redesigned.

## Assets

All current Canon and shared asset paths must be preserved. The owner reference
is evidence only and must not be used as a page background or production asset.
Informational artwork with embedded text must use complete-image presentation;
scenic artwork may use controlled cover cropping.

## Evidence

- Owner reference:
  `evidence/CANON-FULL-PAGE-VISUAL-REQUEST-2026-07-28/canon-owner-reference-1024x1536.png`
- Before evidence:
  `evidence/CANON-FULL-PAGE-VISUAL-REQUEST-2026-07-28/before/`
- Final evidence:
  `evidence/CANON-FULL-PAGE-VISUAL-REQUEST-2026-07-28/final/`

## Reason this cannot be implemented solely behind the interface

The owner has selected a new Canon-specific full-page composition. Its
three-region proportions, card density, artwork treatment, grid relationships,
responsive reflow, and right-rail presentation are rendered visual properties,
so implementing the approved result requires changing the Canon-owned
stylesheet.

## Alternatives considered

- Preserve the prior Canon arrangement: rejected because it conflicts with the
  newest owner-approved reference.
- Change components or DOM structure: rejected because CSS-only implementation
  is required.
- Use the reference as a background or iframe: rejected because it would not be
  a functional, accessible implementation.
- Hide live content absent from the reference: rejected because all current
  content and controls must remain available.

## Accessibility and performance effects

- DOM order, accessible names, ARIA state, keyboard order, handlers, and
  semantics remain unchanged.
- Visible `:focus-visible`, responsive reflow, reduced-motion handling, and
  document-overflow protection are required.
- The complete right rail remains reachable and moves beneath the workspace
  only when required by available width or zoom.
- No new package, font, remote request, image, or production asset is added.

## Rollback plan

Revert the focused evidence/fingerprint commit, then the Canon stylesheet
commit, then this approval-record commit. The existing static rollback runtime
and all immutable visual baselines remain intact.

## Owner scope statement

This approval establishes the attached Canon image as the current visual source
of truth for `/canon` and supersedes earlier Canon layout arrangements only
where they conflict visually with this reference. Earlier functionality,
accessibility, content-preservation, and CSS-only restrictions remain in force.
