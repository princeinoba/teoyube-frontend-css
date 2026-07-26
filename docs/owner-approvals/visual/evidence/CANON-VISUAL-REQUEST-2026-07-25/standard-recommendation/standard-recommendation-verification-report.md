# Canon Standard Recommendation CSS Verification

## Decision and scope

- Decision: owner-approved visual replacement
- Approval ID: `TEOYUBE-VISUAL-2026-07-25-CANON-001`
- Route: `/canon`
- Target: `#phase115SmartRecommendations-canon`
- Starting branch: `recovery/visual-source-of-truth`
- Starting commit: `a3ccb56d689e3894a583c1c5ded4260507468f57`
- Product source changed: `styles/pages/canon.css` only
- Product markup, JavaScript, TypeScript, data, copy, assets, icons, and behavior changed: **no**
- Contract records changed: only the exact `styles/pages/canon.css` byte count and SHA-256 entries in the two authorized visual-source contracts
- Final CSS fingerprint: 57,371 bytes; SHA-256 `e16d9a279b24006d8da9b738123644b556ec6de71bf9106ac0a4cc3a469f393b`

## Result

The scoped CSS replacement implements the owner reference's warm white workspace, two-column recommendation matrix, paired card rows, full-width evidence disclosures, segmented action toolbars, and six-column workflow builder. All 69 new selectors remain rooted at the Canon route and the exact recommendation section. The CSS safety audit found no unscoped rule, generated content, hidden content, fixed-position shortcut, or scale transform.

The current approved DOM contains 73 controls:

- one top comparison control
- six disclosure summaries
- twelve disclosure actions
- forty-eight feedback and save actions
- six workflow actions

All 73 remain present and enabled. With the first disclosure open for the reference state, 63 controls are exposed and ten disclosure actions are intentionally unavailable inside the other five closed native `details` elements. Every disclosure was separately opened and closed with Enter, Space, and mouse activation, exposing its two actions.

## Responsive and accessibility evidence

The focused audit passed at:

- 1536 x 1024
- 1440 x 900
- 1366 x 768
- 1280 x 800
- 1152 x 864
- 1024 x 768
- 820 x 1180
- 768 x 1024
- 600 x 960
- 430 x 932
- 390 x 844
- 768 x 512, representing 200% reflow from a 1536 x 1024 display

At every audited size:

- control inventory: 73
- unintended hidden controls: 0
- clipped controls: 0
- disabled controls: 0
- positive `tabindex` values: 0
- horizontal overflow: 0

Keyboard-modality focus indicators passed for all 61 controls exposed in the default closed-disclosure state. The twelve disclosure actions were keyboard-reached after their six native disclosures were opened. Reduced-motion computed transition and animation durations were `0.00001s`. The scoped axe WCAG A/AA/2.1 AA audit returned zero violations.

## Existing behavior boundary

This task did not change product behavior. The Next Canon controller currently preserves the comparison, graph, feedback, save, and workflow controls in the approved HTML, but it does not mount the legacy dialogs or feedback notices for this panel. The audit therefore records those controls as present, enabled, focusable, and activation-safe without claiming that a dialog or notice appeared. That adapter gap predates this CSS-only task and cannot be repaired under an authorization that expressly forbids HTML, JavaScript, TypeScript, JSX, and TSX changes.

The native disclosure behavior is fully operational. The repository Canon parity suite also verifies Canon tabs, pagination, search, and carousels, and the Promise Table provenance actions. No task-originated console, page, request, or response failure was observed. The long-lived port 3000 audit recorded twelve existing delayed root-level stylesheet probes (`/today.css` through `/tables.css`); fresh production-build parity and end-to-end runs completed successfully.

## Visual comparison

The owner reference is 1122 x 1402. The final 1536 x 1024 viewport capture produces a 1305 x 1616 panel and was normalized to the owner-reference dimensions only for evidence comparison.

- changed-pixel ratio above a per-channel threshold of 16: **15.739992%**
- normalized mean absolute channel difference: **5.503503%**
- root mean square channel difference: **40.748216**

These are measured reference-comparison values, not an immutable baseline update. The remaining material differences include decorative header/card/workflow icons and the privacy footer shown in the reference but absent from the approved source DOM. Adding them would require forbidden markup, assets, or CSS-generated content. The live DOM also retains all existing controls even where the owner reference shows a smaller subset.

## Evidence artifacts

- `owner-reference.png`
- `before-panel-1536x1024.png`
- `before-audit-1536x1024.json`
- `after-default-panel-1536x1024.png`
- `after-panel-1536x1024.png`
- `after-panel-1440x900.png`
- `after-panel-1366x768.png`
- `after-panel-1280x800.png`
- `after-panel-1152x864.png`
- `after-panel-1024x768.png`
- `after-panel-820x1180.png`
- `after-panel-768x1024.png`
- `after-panel-600x960.png`
- `after-panel-430x932.png`
- `after-panel-390x844.png`
- `after-panel-zoom-200-simulation-768x512.png`
- `after-functional-responsive-audit.json`
- `after-panel-1536x1024-normalized.png`
- `side-by-side-owner-after-1536x1024.png`
- `overlay-owner-after-1536x1024.png`
- `difference-owner-after-1536x1024.png`
- `visual-comparison-metrics.json`

The intermediate `pass-1` and `pass-2` captures remain in this evidence directory to document the non-destructive refinement path.

## Executable verification

- `npm run recovery:verify`: **PASS**
  - 268 protected visual sources
  - 72 immutable static screenshots
  - 12 immutable desktop DOM snapshots
  - 60 owner-approved support screenshots and their contracts
  - 54 owner-approved Next support captures and 16 interaction captures
  - TIG, Scripture, import, architecture, safety, and retrieval boundaries
- `npm run visual:parity:canon-promise`: **PASS**, 4 tests; Canon and Promise Table at six required viewports plus functional parity
- `npm run typecheck`: **PASS**
- `npm run lint`: **PASS**, zero warnings
- `npm run test`: **PASS**, 276 passed and 1 skipped
- `npm run app:build`: **PASS**, including TIG, Scripture, safety, Teo Guide, live-AI, and retrieval client/boundary scanners
- `npm run test:e2e`: **PASS on fresh rerun**, 16 passed; the first run had one timing-only Prompt 13 Calling Compass timeout and 15 passes
- focused Playwright responsive/control/keyboard/axe audit: **PASS**
- CSS parser and selector-isolation audit: **PASS**, 69 scoped rules

## Governance and runtime status

- Protected visual product files changed: **1**, `styles/pages/canon.css`, authorized by `TEOYUBE-VISUAL-2026-07-25-CANON-001`
- Immutable static baseline artifacts changed: **0**
- Owner-approved support baseline artifacts changed: **0**
- DOM/class/source markup changed: **0**
- Assets and icons changed: **0**
- Cross-route selector matches: `/canon` = 1; Today, Search, and Promise Table = 0
- Canon/Promise static-to-Next parity: **PASS**
- Canonical runtime: owner-approved local Next runtime
- Rollback runtime: static Node runtime via `npm run rollback:start`
- `npm run runtime:status`: **PASS**
- `npm run runtime:verify`: **BLOCKED**, because the separately governed runtime source digest and protected-manifest hash have not been rebound to this new owner-approved CSS fingerprint; runtime identity rebinding is outside this task's authorized file scope

## Final disposition

- Scoped visual task: **PASS**
- Owner approval required for this completed scope: **NO**
- Separate release/runtime identity gate: **BLOCKED pending an authorized runtime identity rebind**
- Rollback: revert the focused containing commit; the exact command is reported with the final commit SHA
