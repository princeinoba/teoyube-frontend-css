# Accessibility issue register

Phase 5A registered 11 items: eight confirmed product/accessibility defects or deltas and three manual evidence gaps. Phase 5C-1 fixed exactly three approved issues (A11Y-001, A11Y-002, and A11Y-004); five confirmed issues and all three manual evidence gaps remain open.

| ID | Severity | Classification | Route(s) | Summary | WCAG | Current status |
| --- | --- | --- | --- | --- | --- | --- |
| A11Y-001 | Critical | Confirmed defect | Lexicon | Unsupported ARIA attribute on 27 alphabet options | 1.3.1, 4.1.2 | **FIXED in 5C-1** |
| A11Y-002 | High | Confirmed defect | Today | Focusable actions remain in `aria-hidden` carousel slides | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-003 | High | Confirmed parity delta | Canon | Next adds 11 media stages to the focus order | 2.4.3, 2.4.6, 4.1.2 | READY for 5C-2; not started |
| A11Y-004 | High | Confirmed defect | Canon | Hidden recent-row control remains focusable | 2.4.3, 4.1.2 | **FIXED in 5C-1** |
| A11Y-005 | High | Confirmed name defect | Lexicon, Embedded Videos, Tables | Three search inputs lack durable programmatic names | 2.4.6, 3.3.2, 4.1.2 | READY for 5C-2; not started |
| A11Y-006 | High | Confirmed defect | Testimony | Milestones scroll region has no keyboard access | 2.1.1 | READY for 5C-2; not started |
| A11Y-007 | High | Confirmed defect | Today, Canon, Book, Explore | Target-size failures | 2.5.8 | Approved for 5C-3; not started |
| A11Y-008 | High | Confirmed defect | Canon | In-progress status contrast fails | 1.4.3 | Approved for 5C-3; not started |
| A11Y-009 | Medium | Manual validation | All retained routes | Complex-background contrast incomplete | 1.4.1, 1.4.3, 1.4.11 | APPROVED, NOT_TESTED |
| A11Y-010 | Medium | Manual validation | All retained routes | Focus visibility/obscuration needs human review | 2.4.7, 2.4.11 | APPROVED, NOT_TESTED |
| A11Y-011 | High | Manual AT/media validation | Media routes | Captions, alternatives, third-party controls, and spoken output unverified | 1.2.x, 2.1.1, 4.1.3 | APPROVED, NOT_TESTED |

## Phase 5C-1 evidence

- A11Y-001: 12/12 runtime/viewport cells have 27 valid options, exactly one `aria-selected=true`, and zero `aria-pressed` attributes.
- A11Y-002: all 216 hidden Today slides are inert and expose zero focusable descendants.
- A11Y-004: all 12 hidden Canon wrappers are inert, programmatic focus cannot enter them, and visible navigation remains operable.
- Current Phase 5A audit rerun: 311 cells, zero errors, zero `aria-allowed-attr`, zero axe `aria-hidden-focus`, and zero custom hidden-focus cells.

Search and Promise Search remain separate evidence surfaces. Complete WCAG 2.2 AA conformance is not claimed, and no manual task was executed.
