# Accessibility evidence and inherited debt

Prompt 21 verifies parity and automated behavior; it does not claim WCAG
conformance.

Current owner-approved parity evidence records zero new Next accessibility
findings, zero focus-order divergence, zero positive-tabindex divergence, and
zero `aria-hidden` focusability divergence across the 72 matrix cells. The
static source and Next preview share inherited findings:

| Finding | Scope | Classification | Prompt 21 action |
| --- | --- | --- | --- |
| Focusable descendants inside 11 `aria-hidden` containers | Today | Protected-structure owner approval required | Register debt; do not alter protected DOM |
| Focusable descendant inside 1 `aria-hidden` container | Canon | Protected-structure owner approval required | Register debt; do not alter protected DOM |
| Accessible names, sequential focus, focus traps, keyboard actions, reduced motion, responsive text/zoom, and error association | Automated retained-route checks | Pixel-identical behavior verification | Re-run current parity/browser gates |
| Color contrast | Current rendered interface | Measurable automated checks plus manual review still required | Record tool output; do not claim conformance |
| User-facing accessibility wording | Any protected copy | Product-copy owner approval required | No Prompt 21 change |

False positives must be documented with route, selector, tool, and reproduction;
none are pre-declared here. Temporary debt is accepted only as inherited,
owner-visible debt, not as conformance.

Verification:

```text
npm run release:accessibility:verify
npm run visual:parity:gate:resumable
```
