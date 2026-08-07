# A11Y-008 Next/static tablet reduced-motion reconciliation

- Identified browser: Playwright Chromium 149.0.7827.55
- Target: D05
- Viewport: tablet-landscape
- Zoom contract: 200%
- State: reduced-motion
- Next: 10/10 reliable at 6.9851:1
- Static: 10/10 reliable at 6.9851:1
- Unknown samples: 0
- Difference: 0
- Result: verified equivalence

The Phase 5D-1 unknown came from an occluded target clip rather than font, hydration, transform, animation, CSS-asset, background-ancestor, antialiasing, or browser-specific contrast behavior. Phase 5D-2 hides only the documented unrelated local-status notice, verifies the D05 target is topmost, waits for fonts and two stable animation frames, and uses same-context visible/text-removed paired captures. CSS bundle identities, hydration/readiness, typography, geometry, raw axe results, pixel masks/clusters, and accessibility-tree evidence are retained for the extension captures.
