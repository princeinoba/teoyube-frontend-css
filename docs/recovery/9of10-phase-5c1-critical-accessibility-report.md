# Teoyube 9/10 Phase 5C-1 critical accessibility report

Generated: 2026-08-06T00:30:08.628Z

## Program

- Selected phase: Phase 5C-1 ? Critical and fail-closed accessibility remediation
- Previous status: READY FOR APPROVED SCOPE
- Final status: **PASS**
- Phase 5C: **IN_PROGRESS**
- Phase 5C-2: **READY**
- Program overall: **IN_PROGRESS**

## Branch and commits

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `1d74ff7a8b995a0f1461d8dd7a6731541d29eb4f`
- Implementation commit: `0472b0c`
- Test commit: `b074d61`
- Evidence/final commit: reported in final handoff
- Pre-phase tag: `teoyube-9of10-phase5c1-start-1d74ff7`
- Worktree: expected clean after final evidence commit

## Approved scope

Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`. Batch: 5C-1.

| Issue | Proposal hash | Approved result |
| --- | --- | --- |
| A11Y-001 | `11aef30ee50faf3b9c61b744bdb867dfeb1d0a8cafe3569a831f011d9cc52afe` | Unsupported `aria-pressed` removed; listbox/option/`aria-selected` preserved. |
| A11Y-002 | `d09fd6540f400937f1b797e122e80455c3d7909a1ac80059c77cbc32b25bb61b` | Inactive hidden Today slides are inert; active controls remain operable. |
| A11Y-004 | `c001c4a48c70289c2a111c1f57f78dad1fdd4f3b5e98123e7b4b4738b38718e1` | Hidden Canon copy subtree is inert; every visible media control remains. |

Excluded: A11Y-003, A11Y-005 through A11Y-011, A11Y-MANUAL-001 through A11Y-MANUAL-009. Expected pixels: 0. DOM/ARIA impact: attribute-only.

## Implementation and accessibility

Controls removed: 0. Visible copy changed: 0. CSS changed: 0. Class/ID changes: 0. Static rollback changed: 0.

Issues before/fixed/partial/blocked/new: **3 / 3 / 0 / 0 / 0**. The 36 scoped cells and 311-cell full audit verify correct keyboard, role/state, hidden/inert, and focus behavior for this batch. Accessible names and focus restoration remain unchanged. Available AT evidence is limited to Chrome accessibility automation plus automated keyboard testing. Manual tasks completed: **0**.

WCAG matrix updated: **YES**. Complete WCAG 2.2 AA conformance claimed: **NO**.

## Visual and DOM

- Protected visual verification: PASS.
- Immutable baselines: unchanged; 72 screenshots and 12 DOM snapshots verified.
- Owner baselines: unchanged.
- Accessibility delta contract: PASS, exact five-file hash binding.
- Unapproved pixel/DOM-class/asset-copy differences: 0 / 0 / 0.
- Baseline writes: 0.

The raw experimental tall full-root raster diagnostic is retained and labeled non-authoritative because dynamic Today/Canon rendering was nondeterministic. Authoritative affected-route parity and immutable verification control the zero-unapproved-pixel conclusion.

## Performance

The three-run gate produced **72/216** results before stopping on all six pre-existing Canon A11Y-003 focus mismatches. Every measured cell passed the 5,000-ms threshold; maximum: **4,319.6 ms**. Calling tablet-portrait: static **1,469 ms**, Next **1,222.8 ms**. CSS remains **1,414,956 / 948,538 bytes**, blocked. New regressions: 0. Gate C-Preview: **BLOCKED**.

## Regression gates

| Gate | Result |
| --- | --- |
| npm ci / audit | PASS, 408 packages; zero full/production vulnerabilities |
| Typecheck / lint / build | PASS; 58 pages |
| Unit / integration | 397 pass + 1 intentional skip / 101 pass |
| Browser | all 57 non-skipped tests pass after serial confirmation; 3 static skips |
| Security / Gate A | 18 controls PASS / 64 of 64 PASS |
| Recovery / runtime | PASS; Next canonical; static rollback retained; dual-runtime 83 checks |
| WEB / TIG | PASS / PASS |
| Prompt 18 / Prompt 20 | 49 of 49 with 13 tools / 21 of 21, 33,563 chunks, zero provider calls |
| Research | PASS; 66 events, 17 scenarios, zero participants/sessions/paid calls |
| Stabilization | WAITING_OWNER; existing blockers preserved |
| Next/static smoke | PASS / PASS; listeners closed |

## Changes and status

Product source files changed: 5. Protected visual files: 0. Package/lockfile changes: 0. Baseline changes: 0. Workspace growth is bounded to tracked source, tests, and compact evidence; exact final tracked-byte delta is reported in the handoff.

- Phase 2A: BLOCKED
- Phase 3: WAITING_OWNER
- Phase 4: WAITING_OWNER_SESSION_DATA
- Phase 5A: PASS
- Phase 5B: PASS
- Phase 5C-1: PASS
- Next READY: Phase 5C-2

Rollback: `git revert <evidence-final-commit> b074d61 0472b0c`.

Phase 5C-2 was not started.
