# Accessibility issue register

Phase 5A registered 11 items: eight confirmed product/accessibility defects or deltas and three manual evidence gaps. Phase 5C-1 fixed A11Y-001, A11Y-002, and A11Y-004. Phase 5C-2 fixed A11Y-003, A11Y-005, and A11Y-006. Two approved confirmed issues and all three manual evidence gaps remain open.

| ID | Severity | Classification | Route(s) | Summary | WCAG | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| A11Y-001 | Critical | Confirmed defect | Lexicon | Unsupported ARIA attribute on 27 alphabet options | 1.3.1, 4.1.2 | **FIXED in 5C-1** |
| A11Y-002 | High | Confirmed defect | Today | Focusable actions in hidden carousel slides | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-003 | High | Confirmed parity delta | Canon | Static runtime lacked the 11 named keyboard media controls present in Next | 2.4.3, 2.4.6, 4.1.2 | **FIXED in 5C-2** |
| A11Y-004 | High | Confirmed defect | Canon | Hidden recent-row control remained focusable | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-005 | High | Confirmed name defect | Lexicon, Embedded Videos, Tables | Three search inputs lacked durable programmatic names | 2.4.6, 3.3.2, 4.1.2 | **FIXED in 5C-2** |
| A11Y-006 | High | Confirmed defect | Testimony | Milestones scroll region lacked keyboard access | 2.1.1 | **FIXED in 5C-2** |
| A11Y-007 | High | Confirmed defect | Today, Canon, Book, Explore | Target-size failures | 2.5.8 | Approved for 5C-3; not started |
| A11Y-008 | High | Confirmed defect | Canon | In-progress status contrast fails | 1.4.3 | Approved for 5C-3; not started |
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
