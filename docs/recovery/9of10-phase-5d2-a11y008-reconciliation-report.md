# Teoyube 9/10 Program — Phase 5D-2 A11Y-008 reconciliation report

## Outcome

**A11Y-008 EVIDENCE CLOSED — FORCED-COLORS TOOL CONFLICT CONFIRMED; ACCESSIBILITY-GATE DISPOSITION OWNER DECISION REQUIRED**

- Exact outcome: **C**
- Program: **IN_PROGRESS**
- Phase 5: **WAITING_OWNER**
- Product implementation authorized: **NO**
- Product remediation performed: **NO**

## Repository

- Branch: `recovery/visual-source-of-truth`
- Starting SHA: `212e18bcf91bb582935b70378e3614e1e51bbcae`
- Evidence commit: `50e89e362741aca81661f68dcb26d9cc1709bf82`
- Final SHA: `FINAL_PHASE5D2_REPORT_COMMIT_REPORTED_IN_FINAL_HANDOFF`
- Tag: `teoyube-9of10-phase5d1-a11y008-start-4c165ea`
- Rollback: `git revert <phase-5d2-evidence-commit>`

## Evidence

- Forced-colors axe reconciliation: 6/6 cells classified `AXE_DID_NOT_EVALUATE_RENDERED_PAIR`
- Raw axe 4.12.1 pair: `#fffdf4/#ffffff` (~1.01:1)
- Computed and rendered forced-color pair: black/white (21:1)
- Static forced colors: 6 cells × 5 fresh contexts = 30 captures; 30/30 reliable; 21:1 throughout; zero ratio spread
- Former unknowns resolved: 7/7
- D05 reduced motion: Next 10/10 at 6.9851:1; static 10/10 at 6.9851:1
- Native forced colors: NOT_AVAILABLE; OS settings were not changed
- Measurement SHA-256: `4d20210b1ea1baf8edf283438588247754b90788bc8cc8278d498af66eacff0a`
- Manifest SHA-256: `88c0da1ac90bd8a0c0ce80cf321c1ab64baa273401aa5da20566a2c3a9e26247`
- Retained screenshot hashes: 350 files; ordered path/hash aggregate SHA-256: `d6b6c3faf43cb48e295876aa05c8f68f183bb089b96fcb995390f2c1cc554382`
- Gate-disposition proposal hash: `63d03d4bc44ef4169b24c2e4d3dfa4236b10a67227ae03108b7fd535db6ce29d`

## Adjudication

Outcome C applies because forced-color computed and rendered evidence is repeatably at least 4.5:1, axe continues to report an authored pair below 4.5:1, direct paired-pixel evidence proves the axe pair is not the painted black/white pair, and every required unknown and Next/static comparison is resolved.

A new product-fix approval is **not required** because no current rendered failure was reproduced. An owner gate-disposition decision **is required** for the exact hash-bound, state-aware proposal. Axe remains enabled and unsuppressed.

## Protection

- Product source changes: 0
- Protected visual changes: 0
- CSS/color changes: 0
- DOM/ARIA changes: 0
- Baseline writes: 0
- Package/lockfile changes: 0
- Paid calls: 0
- Participant sessions: 0

## Verification

- Phase 5D-2 and retained Phase 5D-1 contracts: PASS, 12/12
- Typecheck: PASS
- Full lint: PASS
- Security/secret gate: PASS, 18 controls, critical/high 0
- Recovery: PASS
- Immutable screenshots: PASS, 72/72
- Desktop DOM snapshots: PASS, 12/12
- TIG: PASS
- Scripture: PASS
- Imports: PASS, 1,433 files, 0 missing
- Architecture: PASS, 180 files
- Safety: PASS, 64/64 fixtures
- Retrieval: PASS, 33,563 cache hits, 0 provider calls, $0 cost
- Dedicated listeners: 0
- Owned Node processes: 0
- Full build/performance: NOT_REQUIRED_EVIDENCE_ONLY
