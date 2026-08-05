# Teoyube 9/10 Phase 5A accessibility audit report

## Result

Phase 5A is **PASS** as an audit-and-evidence phase. It does not claim that Teoyube conforms to WCAG A or AA. Phase 5 overall is **IN_PROGRESS**; Phase 5B is **READY but not started or authorized**.

Starting commit: `aa33ed65727222d9dd90cdfb875a242d505f22d1`
Pre-phase tag: `teoyube-9of10-phase5a-start-aa33ed6`
Audit evidence commit: `378f7e8a581df8785784a25adc3db1aad95e3cfa`
Matrix/issue commit: `3f2d4e6f4a40ca4d6a70e706226261010cdced0f`

## Audit coverage

- 23 retained public routes.
- Six protected viewports and 138 default route/viewport cells.
- 115 route/mode cells: text spacing, reduced motion, forced colors, 320-pixel reflow, and effective 200%-zoom layout.
- 58 focused interaction-state cells at desktop-wide and mobile.
- 81 keyboard traversal cells.
- 311 total cells and zero harness errors.
- Search and Promise Search audited independently.
- External network/media blocked; no model, embedding, analytics, or other paid call.

## Findings

Eleven items are registered: one critical, eight high, and two medium. Eight are confirmed product/accessibility defects or parity deltas; three are manual evidence gaps.

Confirmed failures include invalid Lexicon ARIA, hidden focusable controls on Today and Canon, 11 Next-only Canon media focus stops requiring owner review, three missing programmatic input names, an unfocusable Testimony scroll region, undersized targets, and Canon status contrast. No positive tabindex, duplicate ID, or horizontal overflow above one pixel was found.

Chrome and axe automation completed. Windows Narrator is installed but its spoken output is not reliably observable in this headless environment; it is recorded as not tested. Other named screen readers, mobile AT, braille, switch, speech input, magnification, and physical-device testing remain unavailable or manual.

## Standards position

The criterion matrix covers all 55 WCAG 2.2 A/AA success criteria. WAI-ARIA 1.2 and ARIA in HTML are normative semantic sources. APG is informative. WCAG 3.0 is an informative Working Draft and is not a conformance target.

**WCAG conformance claim: NO.**

## Verification

| Gate | Result |
| --- | --- |
| Clean `npm ci` | PASS — 408 packages; lock SHA unchanged |
| Full and production npm audit | PASS — zero vulnerabilities |
| Typecheck | PASS |
| Main lint | PASS |
| Focused audit-runner lint | PASS |
| Unit | PASS — 394; one intentional skip |
| Build | PASS — Next 16.3.0, 58 pages, client/server boundaries pass |
| Browser, default 12-worker run | Load-flaky evidence retained: 43 pass, 11 fail, 3 static skips |
| Browser, unchanged serialized run | PASS — 54 pass, 3 static skips |
| Security | PASS — 18 controls, critical/high zero |
| Runtime contract | PASS — Next canonical, 23 public routes, static rollback retained |
| Dual-runtime smoke | PASS — 83 checks, listeners closed |
| Recovery | PASS — 72 immutable screenshots and 12 DOM snapshots unchanged |
| Legacy release accessibility aggregator | BLOCKED — zero current 216-cell controller inputs; not regenerated or weakened |

The legacy aggregator result is an inherited evidence-lineage limitation. The Phase 5A current audit is separate and does not fabricate a 216-cell pass.

## Change boundary

- Product source: 0
- Protected visual files: 0
- CSS: 0
- DOM/classes/ARIA in production: 0
- Assets: 0
- Immutable static baselines: 0
- Owner-approved support baselines: 0
- Package or lockfile: 0
- Paid external calls: 0

## Program state

- Phase 2A: **BLOCKED**
- Phase 3: **WAITING_OWNER**
- Phase 4: **WAITING_OWNER_SESSION_DATA**
- Phase 5A: **PASS**
- Phase 5B: **READY, NOT STARTED**
- Phase 5: **IN_PROGRESS**
- Program: **IN_PROGRESS**

## Remaining blockers

Phase 5B requires a separate owner-scoped task and, where protected DOM or visual output changes, exact visual approval. Manual AT/device/media review remains. The Phase 2A Canon focus, performance, CSS-budget, and absent-current-216-cell blockers are unchanged. Phase 3 and Phase 4 still require authentic owner/session evidence.

Rollback after the final documentation commit:

```powershell
git revert <phase-5a-final-commit> 3f2d4e6f4a40ca4d6a70e706226261010cdced0f 378f7e8a581df8785784a25adc3db1aad95e3cfa
```
