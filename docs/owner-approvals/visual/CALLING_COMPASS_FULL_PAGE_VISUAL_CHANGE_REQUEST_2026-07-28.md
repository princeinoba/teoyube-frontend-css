# Calling Compass full-page visual change approval

Decision: APPROVED

Approval-ID: TEOYUBE-VISUAL-2026-07-28-CALLING-COMPASS-FULL-PAGE-002

Approved-By: Prince Okiemute Inoba — Teoyube Project Owner

Approved-At: 2026-07-28T21:50:06-04:00

Parent-Approval: TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-001

## Route and state

- Canonical route: `/calling-compass`
- Static rollback route: `#calling`
- State: current deterministic default Calling Compass state
- Desktop composition: existing application navigation, Calling Compass
  workspace, and complete contextual rail
- Responsive states: 1300 × 1210, 1536 × 1024, 1440 × 900, 1280 × 800,
  1024 × 768, 768 × 1024, 390 × 844, intermediate drag widths, and 200%
  browser zoom

## Approved source scope

- Production visual source: `styles/pages/calling-compass.css`
- Protected-source entry for that exact stylesheet
- Exact visual-contract fingerprints derived from that stylesheet
- Deterministic runtime digest/build identity derived solely from the approved
  stylesheet and fingerprint updates
- Approval documentation and Calling Compass evidence

No HTML, JSX, TSX, JavaScript, TypeScript, route, handler, data, copy, asset,
package, test-source, or other page stylesheet change is authorized.

## Selectors and components

The production visual change is limited to selectors scoped beneath:

```css
body[data-view="calling"]
```

The approved composition covers the existing page header, hero/search, Daily
Inspiration, Featured Video, AI Calling Assistant, Your Calling Compass,
Guided Calling Compass, Recommended For You, Explore by Category, Up Next
Playlist, Continue Watching, Kingdom Progress, local beta notice, and complete
contextual right rail. Shared shell elements may be positioned or styled only
through Calling Compass-scoped descendants.

## Assets

All current Calling Compass and shared asset paths remain unchanged. The owner
reference is archived as evidence only and must not be used as a production
background, overlay, or replacement interface.

## Evidence

- Owner reference:
  `evidence/CALLING-COMPASS-FULL-PAGE-VISUAL-REQUEST-2026-07-28/calling-compass-owner-reference-1300x1210.png`
- Reference SHA-256:
  `670349f6aea099c6cf6076c60947396bcc01034eff30c63d79f98957caa32bc4`
- Before and final captures, responsive audits, accessibility evidence,
  interaction evidence, comparisons, and deterministic fingerprints are stored
  in that same evidence directory.

## Reason for the visual change

The owner selected a new Calling Compass-specific full-page composition. Its
three-region proportions, visual hierarchy, media sizing, compact rail panels,
playlist scrolling, density, and responsive reflow are rendered visual
properties and therefore require a change to the Calling Compass-owned
stylesheet.

## Alternatives considered

- Preserve the earlier layout unchanged: rejected where it conflicts with the
  newest reference.
- Change components or DOM order: rejected because implementation is CSS-only.
- Use the reference as a background or iframe: rejected because it would not be
  a functional or accessible implementation.
- Replace current live content with reference-specific mock data: rejected
  because current content, controls, and handlers must remain authoritative.
- Hide additional live content: rejected because every current control and data
  item must remain visible and reachable.

## Accessibility and performance effects

- DOM order, accessible names, ARIA state, keyboard order, handlers, playlist
  order, data, and semantics remain unchanged.
- Visible focus states, responsive reflow, reduced motion, playlist internal
  scrolling, and document-overflow protection are required.
- The complete contextual rail remains reachable and moves beneath the
  workspace only when required by available width or zoom.
- No new dependency, font, remote request, image, or production asset is added.

## Rollback plan

Revert the focused evidence/fingerprint commit, then the Calling Compass
stylesheet commit, then this approval-record commit. The canonical runtime,
static rollback runtime, and all immutable baselines remain available.

## Owner scope statement

This approval establishes the attached Calling Compass image as the current
visual source of truth for `/calling-compass` and supersedes earlier Calling
Compass layout directions only where they conflict visually with this
reference. Earlier functionality, accessibility, live-content preservation,
and CSS-only restrictions remain in force.
