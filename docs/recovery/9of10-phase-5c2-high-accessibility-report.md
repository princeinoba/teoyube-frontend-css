# Teoyube 9/10 Phase 5C-2 high-severity accessibility report

Status: **PASS**
Outcome: **B - scoped remediation passed; unrelated pre-existing gates remain open**
Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`
Starting commit: `621aac4d70858c823e44b1f5df6f43688c68f451`
Implementation/test commits: `0716dc6`, `dbda6ba`

## Result

The exact hash-bound A11Y-003, A11Y-005, and A11Y-006 remediations are fixed. Canon retains all 11 media controls and gains equivalent static-runtime keyboard semantics and playback. The three search inputs now have durable route-specific names. The existing Testimony milestone strip is a named keyboard-scrollable region.

The focused evidence covers 56 cells across both runtimes and six protected viewports. All scoped behavior passed, the current 311-cell audit has zero harness errors and none of the three scoped defect families, and paired stable-frame raster comparison reports zero changed pixels. No CSS, visible copy, class, ID, asset, or baseline was changed.

## Verification

- Clean install: PASS (408 packages); full and production audits: zero vulnerabilities.
- Typecheck, lint, build, integration, security, Gate A, Teo Guide, deterministic retrieval, runtime, dual-runtime, and recovery contracts: PASS.
- Unit: PASS after isolated serial confirmation; parallel host runs exposed timeouts only, not assertion failures.
- Browser: all 60 runnable tests pass serially; three static-only cases remain intentionally skipped.
- Recovery: 72 immutable screenshots and 12 desktop DOM snapshots pass; all owner-approved support baselines remain unchanged.
- Scoped raster: PASS, stable-frame zero pixels; no masks, tolerance changes, or baseline replacement.
- Paid OpenAI/embedding calls: 0.

## Open gates

- A11Y-007 target size and A11Y-008 contrast remain approved for Phase 5C-3 and were not started.
- Every manual and real assistive-technology task remains approved but NOT_TESTED. WCAG 2.2 AA conformance is not claimed.
- Phase 2A and Gate C-Preview remain BLOCKED by broad pre-existing parity, incomplete 216-cell performance evidence, CSS budget, and stale release evidence. The first current performance run completed 72/72 cells below 5,000 ms, then the controller stopped on nine broad static/Next parity failures outside this attribute-only batch.
- Phase 3 remains WAITING_OWNER; Phase 4 remains WAITING_OWNER_SESSION_DATA; Phase 6A remains READY but not started.

## Rollback

`git revert <phase-5c2-evidence-commit> dbda6ba 0716dc6`
