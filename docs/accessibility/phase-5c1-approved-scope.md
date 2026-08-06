# Phase 5C-1 approved accessibility scope

- Status: **LOCKED BEFORE SOURCE CHANGES**
- Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`
- Batch: **5C-1**
- Approved issue IDs: **A11Y-001, A11Y-002, A11Y-004**
- Expected pixel, CSS, copy, class, ID, asset, and layout changes: **0**

### A11Y-001 — Lexicon alphabet options use an unsupported ARIA attribute

- Proposal hash: `11aef30ee50faf3b9c61b744bdb867dfeb1d0a8cafe3569a831f011d9cc52afe`
- Files: `app.js`, `src/app/_lexicon/LexiconPageController.tsx`, `src/app/_approved-source/approved-view-markup.generated.ts`
- Routes/states: /lexicon — default, alphabet-filter-selected
- Expected pixel impact: **none**
- Expected DOM/ARIA impact: **attribute_only**
- Keyboard/focus impact: Assistive technologies receive one valid selected state instead of conflicting pressed/selected states; filtering behavior is unchanged.
- Approved remediation: In Phase 5C, remove aria-pressed from every role=option alphabet control in the static renderer, approved captured markup, and Next state updater; retain listbox/option, aria-selected, labels, order, click behavior, and pixels.
- Rollback: Revert only the A11Y-001 Phase 5C commit and rerun recovery:verify; never regenerate baselines.

### A11Y-002 — Inactive Today carousel slides retain focusable descendants

- Proposal hash: `d09fd6540f400937f1b797e122e80455c3d7909a1ac80059c77cbc32b25bb61b`
- Files: `app.js`, `src/app/_today/ApprovedTodayView.tsx`
- Routes/states: / — default, promise-carousel-next, featured-story-next, autoplay-advance
- Expected pixel impact: **none**
- Expected DOM/ARIA impact: **attribute_only**
- Keyboard/focus impact: Tab navigation skips inactive slide controls and restores them when their slide becomes active; pointer, autoplay, swipe, and arrow controls remain unchanged.
- Approved remediation: In Phase 5C, make inactive slide containers inert while aria-hidden and remove inert when activated in both runtimes; preserve every control, label, transition, timing, and visible slide.
- Rollback: Revert only the A11Y-002 Phase 5C commit; restore no baseline and rerun recovery:verify.

### A11Y-004 — A hidden Canon recent-row control remains focusable

- Proposal hash: `c001c4a48c70289c2a111c1f57f78dad1fdd4f3b5e98123e7b4b4738b38718e1`
- Files: `app.js`, `src/app/_approved-source/approved-view-markup.generated.ts`
- Routes/states: /canon — default, recently-updated-watchman-merged-card
- Expected pixel impact: **none**
- Expected DOM/ARIA impact: **attribute_only**
- Keyboard/focus impact: Hidden duplicate rows leave the Tab order; visible Watchman navigation and selected-card behavior are unchanged.
- Approved remediation: In Phase 5C, apply inert to the existing aria-hidden .canon-watchman-story-copy subtree in static generation and the approved Next capture; do not hide or remove the visible carousel controls.
- Rollback: Revert only the A11Y-004 Phase 5C commit and rerun the hidden-focus and recovery checks.

## Explicit exclusions

- Batch 5C-2: A11Y-003, A11Y-005, A11Y-006
- Batch 5C-3: A11Y-007, A11Y-008
- Manual evidence: A11Y-009, A11Y-010, A11Y-011, A11Y-MANUAL-001, A11Y-MANUAL-002, A11Y-MANUAL-003, A11Y-MANUAL-004, A11Y-MANUAL-005, A11Y-MANUAL-006, A11Y-MANUAL-007, A11Y-MANUAL-008, A11Y-MANUAL-009
- No baseline replacement, manual-task execution, WCAG conformance claim, Phase 6A work, paid call, push, or deploy.
