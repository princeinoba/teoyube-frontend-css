# Accessibility issue register

Phase 5A registered 11 items: eight confirmed product/accessibility defects or deltas and three manual evidence gaps. Phase 5C-1 fixed A11Y-001, A11Y-002, and A11Y-004. Phase 5C-2 fixed A11Y-003, A11Y-005, and A11Y-006. One current needs-more-evidence issue and all three manual evidence gaps remain open.

| ID | Severity | Classification | Route(s) | Summary | WCAG | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| A11Y-001 | Critical | Confirmed defect | Lexicon | Unsupported ARIA attribute on 27 alphabet options | 1.3.1, 4.1.2 | **FIXED in 5C-1** |
| A11Y-002 | High | Confirmed defect | Today | Focusable actions in hidden carousel slides | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-003 | High | Confirmed parity delta | Canon | Static runtime lacked the 11 named keyboard media controls present in Next | 2.4.3, 2.4.6, 4.1.2 | **FIXED in 5C-2** |
| A11Y-004 | High | Confirmed defect | Canon | Hidden recent-row control remained focusable | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-005 | High | Confirmed name defect | Lexicon, Embedded Videos, Tables | Three search inputs lacked durable programmatic names | 2.4.6, 3.3.2, 4.1.2 | **FIXED in 5C-2** |
| A11Y-006 | High | Confirmed defect | Testimony | Milestones scroll region lacked keyboard access | 2.1.1 | **FIXED in 5C-2** |
| A11Y-007 | High | **FIXED** | Today, Canon, Book, Explore | Target-size failures | 2.5.8 | Phase 5C-3A PASS: 570/570 scoped targets meet 24×24; behavior preserved |
| A11Y-008 | High | Needs more evidence | Canon | Current contrast evidence is contradictory in forced-colors rendering | 1.4.3 | BLOCKED_INCONCLUSIVE / NEEDS_MORE_EVIDENCE; no source change |
| A11Y-009 | Medium | Manual validation | All retained routes | Complex-background contrast incomplete | 1.4.1, 1.4.3, 1.4.11 | APPROVED, NOT_TESTED |
| A11Y-010 | Medium | Manual validation | All retained routes | Focus visibility/obscuration needs human review | 2.4.7, 2.4.11 | APPROVED, NOT_TESTED |
| A11Y-011 | High | Manual AT/media validation | Media routes | Captions, alternatives, third-party controls, and spoken output unverified | 1.2.x, 2.1.1, 4.1.3 | APPROVED, NOT_TESTED |

## Phase 5C-2 evidence

- A11Y-003: 12/12 runtime/viewport cells expose exactly 11 named keyboard controls; 36/36 click, Enter, and Space activations passed.
- A11Y-005: 36/36 cells expose the exact route-specific search-input name; 36/36 retain existing input behavior.
- A11Y-006: 8/8 cells expose a named focusable region; focus remains contained, all four overflow cells scroll, and axe reports zero related violations.
- Current audit: 311 cells, zero errors, zero missing names, zero hidden-focus findings, and only the later-batch target-size and color-contrast rule families remain.
- Stable paired before/after raster: zero changed pixels for the two first-capture outliers; no masks, tolerance changes, or baseline replacement.

All manual and assistive-technology tasks remain **NOT_TESTED**. Complete WCAG 2.2 AA conformance is not claimed.

## Phase 5C-3 split status

- A11Y-007: **FIXED / PHASE 5C-3A PASS**; exact approved proposal hash unchanged; 42 cells, 66 groups, and 570/570 targets pass.
- A11Y-008: **NOT_REPRODUCED_CURRENT / NEEDS_MORE_EVIDENCE**; historical issue/proposal/evidence preserved; not FIXED, PASS, or FALSE_POSITIVE.
- Current A11Y-008 evidence: focused evidence remains 42 cells, six viewports, 6.9851:1 versus 4.5:1, and zero scoped axe contrast failures; the broader current audit still reports two known Canon contrast occurrences. Status remains **NOT_REPRODUCED_CURRENT / NEEDS_MORE_EVIDENCE** and Phase 5C-3A product changes for A11Y-008 are zero.

## Phase 5C-3A execution update (2026-08-07T00:44:40.967Z)

A11Y-007 passed the exact hash-bound remediation: 42 focused cells (24 Next, 18 static), 66 scoped groups, 570 targets, minimum 24×24 CSS pixels, 570/570 pass, zero violations, 284 required center-hit checks pass, zero unintended overlap, and all behavior comparisons pass. A11Y-008 and every manual evidence task were excluded. Seven confirmed product issues are now fixed; A11Y-008 remains the one needs-more-evidence issue. Complete WCAG 2.2 AA conformance is not claimed.

## Phase 5D-1 A11Y-008 retest (2026-08-07T12:30:10.264Z)

A11Y-008 completed its deterministic 1,584-cell retest with **BLOCKED_INCONCLUSIVE** outcome. Minimum computed and reliable rendered ratios are 6.9851:1 and 5.5411:1, but forced-colors axe evidence conflicts with computed/rendered evidence, seven rendered samples remain unknown, and one static/Next comparison contradicts. A11Y-008 remains **NEEDS_MORE_EVIDENCE**; product changes, manual task completions, and new owner decisions are zero.

## Phase 5D-2 A11Y-008 update

A11Y-008 evidence is closed as **forced-colors tool conflict confirmed**, pending an owner accessibility-gate disposition decision. Six reconciled forced-colors cells render at 21:1, 30/30 static repeats are reliable, and D05 reduced-motion is 10/10 Next plus 10/10 static at 6.9851:1. Product remediation was not performed. Proposal hash: `63d03d4bc44ef4169b24c2e4d3dfa4236b10a67227ae03108b7fd535db6ce29d`.
