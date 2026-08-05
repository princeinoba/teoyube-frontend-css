# Accessibility issue register

Phase 5A registers 11 items: eight confirmed product/accessibility defects or deltas and three manual evidence gaps. No remediation was performed.

| ID | Severity | Classification | Route(s) | Summary | WCAG |
| --- | --- | --- | --- | --- | --- |
| A11Y-001 | Critical | Confirmed defect | Lexicon | Unsupported ARIA attribute on 27 alphabet options | 1.3.1, 4.1.2 |
| A11Y-002 | High | Confirmed defect | Today | Focusable actions remain in `aria-hidden` carousel slides | 2.4.3, 4.1.2 |
| A11Y-003 | High | Confirmed parity delta | Canon | Next adds 11 media stages to the focus order | 2.4.3, 2.4.6, 4.1.2 |
| A11Y-004 | High | Confirmed defect | Canon | Hidden recent-row control remains focusable | 2.4.3, 4.1.2 |
| A11Y-005 | High | Confirmed name defect | Lexicon, Embedded Videos, Tables | Three search inputs lack durable programmatic names | 2.4.6, 3.3.2, 4.1.2 |
| A11Y-006 | High | Confirmed defect | Testimony | Milestones scroll region has no keyboard access | 2.1.1 |
| A11Y-007 | High | Confirmed defect | Today, Canon, Book, Explore | Target-size failures | 2.5.8 |
| A11Y-008 | High | Confirmed defect | Canon | In-progress status contrast fails | 1.4.3 |
| A11Y-009 | Medium | Manual validation | All retained routes | Complex-background contrast incomplete | 1.4.1, 1.4.3, 1.4.11 |
| A11Y-010 | Medium | Manual validation | All retained routes | Focus visibility/obscuration needs human review | 2.4.7, 2.4.11 |
| A11Y-011 | High | Manual AT/media validation | Media routes | Captions, alternatives, third-party controls, and spoken output unverified | 1.2.x, 2.1.1, 4.1.3 |

## Phase 5B boundary

Phase 5B may begin only after owner review of the exact visual/DOM implications. A11Y-001 through A11Y-008 are remediation candidates. A11Y-009 through A11Y-011 require manual evidence first and are not permission to redesign, change copy, alter baselines, or connect external services.

Search and Promise Search remain separate evidence surfaces. `/search` completed 13 cells and `/promise-search` completed 15 cells with no current automated violation; that result is not a conformance claim.

