# Phase 5C-2 approved accessibility scope

- Status: **LOCKED BEFORE SOURCE CHANGES**
- Owner decision: `TEOYUBE-OWNER-ACCESSIBILITY-PHASE5B-2026-08-05-001`
- Batch: **5C-2**
- Approved issue IDs: **A11Y-003, A11Y-005, A11Y-006**
- Expected pixel, CSS, copy, class, ID, asset, and layout changes: **0**

### A11Y-003 — Next Canon adds eleven media stages to the keyboard focus order

- Proposal hash: `512755ac81b5cf4961c9c548a8a7eea12c7677564762635d589d26de1656a1ca`
- Files: `app.js`, `src/app/_canon/CanonPageController.tsx`, `src/features/scripture/canon-youtube.ts`
- Routes/states: /canon — default, media-stage-focused, media-stage-playing
- Expected pixel impact: **none**
- Expected DOM/ARIA impact: **attribute_only**
- Keyboard/focus impact: The rollback runtime gains parity with canonical keyboard playback; the canonical Next sequence and visible media remain intact.
- Approved remediation: In Phase 5C, preserve all 11 Next controls and add equivalent named keyboard-operable semantics and playback behavior to the same visible static media stages. Keep them as 11 separate controls; do not delete them, add hidden duplicates, or use roving tabindex because they are independent actions rather than one composite widget.
- Rollback: Revert only the A11Y-003 Phase 5C commit and restore the prior exact static handler/attributes; do not remove the existing Next controls or alter baselines.

### A11Y-005 — Three retained search inputs lack a durable programmatic name

- Proposal hash: `048ab643249f468aedd9d9db15205a762d2789c40ddd2936ccbd763ede2ac5ce`
- Files: `index.html`, `src/app/_approved-source/approved-view-markup.generated.ts`
- Routes/states: /lexicon, /embedded-videos, /tables — default, search-focused, filtered-results
- Expected pixel impact: **none**
- Expected DOM/ARIA impact: **attribute_only**
- Keyboard/focus impact: Inputs become discoverable by name without any visual, query, filtering, or focus change.
- Approved remediation: In Phase 5C, add route-specific aria-label values to the three existing input elements in the approved source and captured Next artifact; preserve placeholders, IDs, wrappers, styling, filter behavior, and copy.
- Rollback: Revert only the three A11Y-005 attribute additions and regenerate no baseline.

### A11Y-006 — Testimony milestone scroll region has no keyboard access

- Proposal hash: `0ba9a5fb8e12da2e3f26176e168ee3255d64d0033b9467ac6ff35fb48bde0a61`
- Files: `index.html`, `src/app/_approved-source/approved-view-markup.generated.ts`
- Routes/states: /testimony — default, drafts-tab
- Expected pixel impact: **none**
- Expected DOM/ARIA impact: **attribute_only**
- Keyboard/focus impact: The milestone strip becomes keyboard-scrollable; testimony state and user data behavior are unchanged.
- Approved remediation: In Phase 5C, add tabindex=0, role=region, and a concise aria-label to the existing .testimony-milestones container in approved source and Next capture; preserve children, order, overflow, and pixels.
- Rollback: Revert only the A11Y-006 attributes and rerun Testimony and recovery checks.

## Explicit exclusions

- Completed Batch 5C-1: A11Y-001, A11Y-002, A11Y-004
- Batch 5C-3: A11Y-007, A11Y-008
- Manual evidence: A11Y-009, A11Y-010, A11Y-011, A11Y-MANUAL-001, A11Y-MANUAL-002, A11Y-MANUAL-003, A11Y-MANUAL-004, A11Y-MANUAL-005, A11Y-MANUAL-006, A11Y-MANUAL-007, A11Y-MANUAL-008, A11Y-MANUAL-009
- No baseline replacement, manual-task execution, WCAG conformance claim, Phase 6A work, paid call, push, or deploy.
