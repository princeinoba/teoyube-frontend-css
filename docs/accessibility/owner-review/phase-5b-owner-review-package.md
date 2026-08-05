# Phase 5B accessibility owner-review package

Status: **PASS - OWNER DECISIONS RECORDED**. Decision `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001` approves only the current hash-bound scopes. No fix is implemented and no WCAG conformance claim is made.

## Issue decisions

| ID | Severity | What is wrong | Recommendation | Pixels | DOM/ARIA | Recommended decision |
| --- | --- | --- | --- | --- | --- | --- |
| A11Y-001 | critical | All 27 alphabet controls are role=option elements carrying aria-selected and the unsupported aria-pressed state; axe reports aria-allowed-attr in every audited Lexicon cell. | In Phase 5C, remove aria-pressed from every role=option alphabet control in the static renderer, approved captured markup, and Next state updater; retain listbox/option, aria-selected, labels, order, click behavior, and pixels. | none | attribute_only | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-002 | high | Inactive promise and featured-story slides are aria-hidden while their links and buttons remain sequentially focusable. | In Phase 5C, make inactive slide containers inert while aria-hidden and remove inert when activated in both runtimes; preserve every control, label, transition, timing, and visible slide. | none | attribute_only | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-003 | high | The canonical Next controller makes 11 visible, independently playable media stages keyboard-operable and named. The protected static sequence omits them, creating an exact focus-order parity delta. | In Phase 5C, preserve all 11 Next controls and add equivalent named keyboard-operable semantics and playback behavior to the same visible static media stages. Keep them as 11 separate controls; do not delete them, add hidden duplicates, or use roving tabindex because they are independent actions rather than one composite widget. | none | attribute_only | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-004 | high | button.canon-recent-merged-row is inside .canon-watchman-story-copy marked aria-hidden=true but remains a native focus target. | In Phase 5C, apply inert to the existing aria-hidden .canon-watchman-story-copy subtree in static generation and the approved Next capture; do not hide or remove the visible carousel controls. | none | attribute_only | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-005 | high | #lexiconSearchInput, #uiVideoSearch, and #teoyubeTableSearch rely on placeholder text and icon-only wrapping labels, producing no durable accessible name. | In Phase 5C, add route-specific aria-label values to the three existing input elements in the approved source and captured Next artifact; preserve placeholders, IDs, wrappers, styling, filter behavior, and copy. | none | attribute_only | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-006 | high | The horizontally scrollable .testimony-milestones region has neither a focusable region target nor focusable content in the audited states. | In Phase 5C, add tabindex=0, role=region, and a concise aria-label to the existing .testimony-milestones container in approved source and Next capture; preserve children, order, overflow, and pixels. | none | attribute_only | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-007 | high | Audited carousel dots, Book memory filters/chips, and Explore tabs are smaller than 24 by 24 CSS pixels or lack sufficient spacing; Phase 5A recorded 289 repeated node occurrences. | In Phase 5C, enlarge only the interactive hit areas for Today carousel dots, Canon Watchman dots, Book memory chips/filters, and Explore tabs to at least 24 by 24 CSS pixels, using transparent padding or pseudo hit areas where pixels can remain stable; any visible geometry change must remain within this exact selector scope. | possible | none | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-008 | high | The D02 and D05 .canon-status.in-progress labels are computed against a white background at approximately 1.01:1 in the current audited state. | In Phase 5C, correct only .canon-status.in-progress foreground/background rendering so the measured pair reaches at least 4.5:1; retain the In Progress text, badge dimensions, status meaning, and all other status colors. | certain | none | **APPROVE_RECOMMENDED_PHASE5C_FIX** |
| A11Y-009 | medium | axe returned 3,674 incomplete contrast nodes where gradients, imagery, pseudo-elements, or stateful surfaces prevent a conclusive automated measurement. | Approve A11Y-MANUAL-001. Do not infer a pass from axe incomplete nodes; open a new issue-specific proposal for any confirmed contrast defect. | none | none | **APPROVE_MANUAL_EVIDENCE_TASK** |
| A11Y-010 | medium | Automated computed-style checks found no missing focus indicator, but hit-testing reported candidates whose real visibility/obscuration cannot be determined without human review. | Approve A11Y-MANUAL-002. Review every route/state with keyboard-only traversal and record clipped, obscured, or ambiguous focus cases as separate issue proposals. | none | none | **APPROVE_MANUAL_EVIDENCE_TASK** |
| A11Y-011 | high | External media requests were intentionally blocked and no observable spoken-output session was available; captions, alternatives, third-party control keyboard behavior, and live announcements remain unverified. | Approve A11Y-MANUAL-003 through A11Y-MANUAL-009. Do not alter media sources or claim conformance until browser/AT and alternatives evidence is complete. | none | none | **APPROVE_MANUAL_EVIDENCE_TASK** |

## Manual task decisions

- **A11Y-MANUAL-001** (A11Y-009): Complex-background and forced-colors contrast review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `fccac54b66ccb80145cdbbaed860392a218dc860d874c8c5743c17fc9745de02`
- **A11Y-MANUAL-002** (A11Y-010): Keyboard focus visibility and obscuration review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `186d9c8fd501df3ebf16852e5299f96b4e1d6b1f7148369347d4f2b6d419b369`
- **A11Y-MANUAL-003** (A11Y-003, A11Y-011): NVDA and Chrome media/control announcement review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `84b99d36942904896986cf7eefb6ad909a715f55c1c89de0d202f0c8a7992c08`
- **A11Y-MANUAL-004** (A11Y-003, A11Y-011): NVDA and Firefox media/control announcement review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `d954af1031f13887ea94aad68921e447615af9ab2d9aa8cc06b8a511e38fbff6`
- **A11Y-MANUAL-005** (A11Y-003, A11Y-011): Narrator and Edge media/control announcement review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `6e075829daaa6400a2c35e92838ef5d6658197e4466219709f4c8171beff5fe0`
- **A11Y-MANUAL-006** (A11Y-003, A11Y-011): VoiceOver and macOS Safari media/control review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `bf703879160f666fdda3addf2baa9216e011ddd828711e193b695d3e8df6dffc`
- **A11Y-MANUAL-007** (A11Y-011): VoiceOver and iOS Safari touch media review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `82e0f445aa551b0f54c6a0a4ec77af8eea053c82d94d396f76cf4ec56ebc09ae`
- **A11Y-MANUAL-008** (A11Y-011): TalkBack and Android Chrome touch media review - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `f28f0723e2dfb549ae45d8ba1b1e79ac98b82a70471659d42086dc5714bfd2bd`
- **A11Y-MANUAL-009** (A11Y-011): Exact media-alternatives inventory - recommended **APPROVE_MANUAL_EVIDENCE_TASK** - hash `2dcafdae7e38febdd9f684933aed20e28ea897f9eb5299e93e4bbc729a1c5533`

## Recorded decision

- Owner: Prince Okiemute Inoba — Teoyube Project Owner
- Decided at: `2026-08-05T17:13:18.973Z`
- All 20 entries approved exactly as recommended and hash-bound.
- Manual evidence remains NOT TESTED.
- Phase 5C is READY for approved scope only and was not started.

## Owner rules

- Reply with one line per issue/task ID.
- A blanket approval is invalid.
- Every approved fix or task is bound to its listed proposal hash.
- Approval does not start Phase 5C, update a baseline, or authorize an unlisted visual change.
