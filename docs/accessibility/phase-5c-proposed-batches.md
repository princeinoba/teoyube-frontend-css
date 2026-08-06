# Proposed Phase 5C implementation batches

Status: **PHASE 5C-3 SUPERSEDED; PHASE 5C-3A READY, NOT STARTED**

Decision `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001` approved the exact current hashes. Each batch still requires a separate Codex task and stop.

## Batch 5C-1 - Critical and hidden-focus barriers

- Issues: A11Y-001, A11Y-002, A11Y-004
- Entry: Each issue has an explicit matching-hash owner approval.
- Checks: pre-tag; focused axe/custom contracts; keyboard tests; 72 protected screenshots; DOM/class/asset contracts; recovery:verify
- Stop rule: Stop after this batch; do not continue automatically.

## Batch 5C-2 - Keyboard, name, role, and focus parity

- Issues: A11Y-003, A11Y-005, A11Y-006
- Entry: Each issue has an explicit matching-hash owner approval; Canon decision is approved.
- Checks: pre-tag; focused functional/browser tests; 72/105 parity evidence; three-run 216-cell gate for Canon; manual AT tasks as applicable; recovery:verify
- Stop rule: Stop after this batch; do not continue automatically.

## Batch 5C-3 - Target size and contrast refinements

- Status: **SUPERSEDED_FOR_EXECUTION** by `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5C3-SPLIT-2026-08-06-001`
- Historical issues: A11Y-007, A11Y-008
- Result: Characterization reproduced A11Y-007 but did not reproduce A11Y-008; no implementation occurred.

## Batch 5C-3A - A11Y-007 target size and spacing

- Status: **READY, NOT STARTED**
- Issue: A11Y-007 only
- Proposal hash: `e8b95d152abc18f9f94009db2895f9975384b02a2544d7808d594e69a03f8717`
- Excluded: A11Y-008 and all manual evidence tasks
- Rule: A separate Codex task must preserve the exact proposal, file scope, visual impact, tests, and rollback.
- Stop rule: Stop after this batch; do not continue automatically.

Manual evidence issues A11Y-009, A11Y-010, and A11Y-011 remain evidence tasks and are not treated as fixes.
