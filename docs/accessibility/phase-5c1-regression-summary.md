# Phase 5C-1 regression summary

## Scoped outcome

A11Y-001, A11Y-002, and A11Y-004 are fixed exactly under their owner-approved proposal hashes. No control, visible copy, CSS rule, class, ID, asset, route, or baseline was removed or changed outside the approved attribute-only delta.

## Accessibility

- Scoped characterization: 36/36 cells valid across Next/static, six viewports, and three issues.
- Current full audit: 311 cells, zero errors, zero `aria-allowed-attr`, zero axe `aria-hidden-focus`, zero custom hidden-focus cells.
- Remaining automated rules: target size (A11Y-007), Testimony scroll region (A11Y-006), Canon contrast (A11Y-008).
- Remaining contract findings: Canon focus parity (A11Y-003), missing search names (A11Y-005).
- Manual/AT tasks: approved, 0 completed, all NOT_TESTED.

## Visual and functional

- `recovery:verify`: PASS; 72 immutable screenshots and 12 DOM snapshots unchanged.
- Today route parity: PASS.
- Canon visual/DOM/class/asset parity: PASS; pre-existing A11Y-003 focus mismatch remains.
- Lexicon attribute counterfactual: zero pixels in all cells.
- Unapproved visual, class/ID, asset/copy, CSS, structural, and baseline changes: 0.

## Engineering and safety

- Clean install: PASS, 408 packages; full and production audits: zero vulnerabilities.
- Typecheck/lint/build: PASS; build produced 58 pages.
- Unit: 397 pass, 1 intentional skip; integration: 101 pass.
- Browser: all 57 non-skipped tests pass after serial confirmation; 3 static skips preserved. Phase 5C-1 browser tests: 3/3.
- Security: 18 controls PASS; Gate A: 64/64; Teo Guide: 49/49 and 13 tools; retrieval: 21/21, 33,563 chunks, zero provider calls.
- Research: 66-event registry and 17 scenarios verified; 0 participants, sessions, records, or paid calls.
- Runtime: Next canonical/static rollback retained; dual-runtime smoke 83 checks PASS; temporary listeners closed.

## Existing blockers retained

The 216-cell performance gate stopped after 72 measured cells because all six Canon viewports reproduced the pre-existing A11Y-003 focus mismatch. All 72 measured cells were below 5,000 ms (max 4,319.6 ms). CSS remains 1,414,956 bytes against the locked 948,538-byte budget. Gate C-Preview remains BLOCKED. These are not Phase 5C-1 regressions and were not weakened.
