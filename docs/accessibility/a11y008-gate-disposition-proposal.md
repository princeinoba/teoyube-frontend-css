# A11Y-008 accessibility-gate disposition proposal

- Status: **WAITING OWNER DECISION**
- Proposal hash: `63d03d4bc44ef4169b24c2e4d3dfa4236b10a67227ae03108b7fd535db6ce29d`
- Outcome supported: **C — forced-colors tool conflict confirmed**
- Product change: **NO**
- Axe suppression: **NO**
- Wildcard exception: **NO**

## Exact proposed policy

For only D02 and D05 on Canon at desktop-wide 200% forced-colors active, the scoped axe authored-color result may be treated as reconciled when raw axe evidence is retained, the browser reports forced colors active, computed/used system colors are at least 4.5:1, at least four of five independent rendered samples per browser/selector are reliable and at least 4.5:1, every required unknown is resolved, and no unexplained Next/static conflict remains.

The policy fails closed for any failing rendered ratio, insufficient reliable captures, unknown cell, matching axe/rendered pair, unexplained runtime difference, or scope change. It does not suppress axe and cannot be generalized to another route, selector, state, browser, viewport, or zoom.

Owner approval of this exact proposal hash is required before the accessibility gate disposition changes.
