# Teoyube 9/10 Phase 5D-1 A11Y-008 current-state retest

Final outcome: **BLOCKED_INCONCLUSIVE**
Previous status: **NEEDS_MORE_EVIDENCE**
Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001`
Starting commit: `4c165eada3a04212d32456c96bef3cf8b69613f5`
Test/evidence commit: `cfc455fcc6bacecf6789d89aaad71606e4a91a27`
Pre-phase tag: `teoyube-9of10-phase5d1-a11y008-start-4c165ea`

## Result

The deterministic retest completed all **1,584** planned element/state cells across Next and static, six protected viewports, 100% and 200% browser-equivalent device metrics, and three Windows Chromium-family browser installations. There were **708 applicable**, **876 not applicable**, **563 passing**, **145 failing**, **7 unknown**, and **0 harness-error** cells.

The lowest computed ratio is **6.9851:1** and the lowest reliable rendered sample is **5.5411:1**, both above the required **4.5:1** threshold. The 145 recorded failures cannot be treated as a current product failure: 144 are forced-colors axe findings that report the historical authored 1.01:1 pair while computed forced colors are 21:1 and rendered pixels are predominantly high contrast. One additional cell has unavailable rendered evidence and contradicts the matching static sample. Seven cells have unresolved rendered samples in total. Outcome B is therefore forbidden by the unknown and contradictory evidence, and Outcome A is not established by a reliable below-threshold rendered pair.

A11Y-008 remains **NEEDS_MORE_EVIDENCE**. No product fix, former-proposal reactivation, new proposal, manual/AT completion, or conformance claim was made.

## Exact missing evidence

- Reconcile the 144 forced-colors axe results that report the historical authored #fffdf4/#ffffff pair at 1.01:1 with computed forced colors at 21:1 and predominantly high-contrast rendered samples.
- Obtain repeatable, full-opacity rendered foreground/background samples for the six static desktop-wide 200% forced-colors D02/D05 cells across pinned Chromium, installed Chrome, and installed Edge.
- Reproduce the pinned-Chromium Next tablet-landscape 200% reduced-motion D05 rendered sample and reconcile it with the static 6.7731:1 sample.

## Protection

- Product source changes: 0.
- Protected visual changes: 0.
- CSS/color changes: 0.
- DOM/ARIA changes: 0.
- Baseline writes: 0.
- Package/lockfile changes: 0.
- Paid calls: 0.
- Participant records and sessions: 0.

## Regression evidence

- Runtime: PASS — Next canonical, static rollback retained.
- Recovery: PASS — 268 protected source entries, 72 immutable screenshots, 12 desktop DOM snapshots, and owner-approved support baselines unchanged.
- Phase 5C-1, 5C-2, and 5C-3A delta contracts: PASS (13/13 combined focused tests).
- A11Y-008 evidence contract: PASS (3/3).
- Typecheck and full lint: PASS.
- Release security/secret gate: PASS — 18 controls, zero critical/high.
- Research pilot: PASS — zero participants, sessions, participant records, or paid calls.
- Temporary listeners on 3194 and 4194: closed.

## Independent blockers

The single high development-only `js-yaml` advisory, CSS budget **1,416,075 / 948,538 bytes**, nine broad pre-existing parity failures, Gate C-Preview block, Phase 3 **WAITING_OWNER**, and Phase 4 **WAITING_OWNER_SESSION_DATA** remain open and were not remediated.

## Next gate

Phase 5 is **WAITING_EVIDENCE**. The next action is the exact missing-evidence task above. Manual accessibility evidence execution did not begin.

## Rollback

`git revert <phase-5d1-final-report-commit> cfc455fcc6bacecf6789d89aaad71606e4a91a27`
