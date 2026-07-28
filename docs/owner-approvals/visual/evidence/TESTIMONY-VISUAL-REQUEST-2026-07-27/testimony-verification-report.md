# Testimony Archive CSS-only visual transformation verification

Owner approval: `TEOYUBE-VISUAL-2026-07-27-TESTIMONY-001`

1. **Implementation status:** PASS. Clean-tree closeout is intentionally reported in the final handoff after this evidence file is committed.
2. **Approval decision recorded:** PASS. The repository approval record preserves the provenance of the owner-authored governing attachment, which carries the formal approved decision.
3. **Approval ID:** `TEOYUBE-VISUAL-2026-07-27-TESTIMONY-001`.
4. **Approved by:** Prince Okiemute Inoba, Teoyube Project Owner.
5. **Approved at:** `2026-07-27T20:47:40-04:00`.
6. **Branch:** `recovery/visual-source-of-truth`.
7. **Starting HEAD:** `6ddf9b293761831645dc3d49a52535a966ee012d`.
8. **Evidence commit:** `0e4952c` (`test(recovery): record Testimony evidence and fingerprints`). The final documentation-closeout SHA is reported in the handoff because a commit cannot embed its own hash.
9. **Commits created:** `70e525c` (`docs(approval): record Testimony owner authority`), `96617a8` (`style(testimony): match owner-approved archive layout`), `0e4952c` (`test(recovery): record Testimony evidence and fingerprints`), plus the final documentation-only closeout commit containing this report correction.
10. **Exact Testimony CSS files changed:** `styles/pages/testimony.css` only.
11. **Approval and evidence files changed:** `docs/owner-approvals/visual/TESTIMONY_VISUAL_CHANGE_REQUEST_2026-07-27.md` plus files under `docs/owner-approvals/visual/evidence/TESTIMONY-VISUAL-REQUEST-2026-07-27/`.
12. **Protected-hash and fingerprint files changed:** `tests/visual/contracts/protected-visual-source-manifest.json` and `tests/visual/contracts/original-static-visual-contract.json`. Only the approved Testimony CSS size/hash and CSS-derived selector, ID, color-token, and media-query inventory changed.
13. **Runtime digest/build-identity files changed:** `config/runtime/asset-media-compatibility-manifest.json` and `config/runtime/canonical-runtime-manifest.json`. Only the protected-manifest hash and deterministic runtime digest/build ID changed.
14. **Application source confirmation:** no HTML, JSX, TSX, JavaScript, TypeScript, data, asset, package, route, handler, or behavior source changed.
15. **Static/protected runtime result:** PASS. The retained static Testimony render was exercised on an isolated port; its 1448x1086 viewport and full-page screenshots are byte-identical to Next. The immutable 72 screenshots and 12 desktop DOM snapshots remain unchanged and verified.
16. **Next runtime result:** PASS as the canonical local runtime candidate. The retained static Node runtime remains the rollback; no runtime cutover occurred in this task.
17. **Baseline and final control counts:** whole page `49/47 visible` before and after (the two non-visible shell controls are the mutually exclusive mobile-navigation controls); Testimony page `30/30 visible`, pointer-enabled, and horizontally unclipped at all nine tested sizes.
18. **Baseline and final Testimony-record counts:** `3` before and `3` after, with Public, Private, and Draft status preserved.
19. **Icon implementation mechanism:** existing DOM nodes and current `data-icon` containers are rendered with Testimony-scoped CSS shapes/pseudo-elements and current local visual assets. No package, remote URL, emoji, base64 blob, or new SVG asset was added.
20. **Existing DOM icons restored:** PASS.
21. **CSS icon definitions added:** scoped coverage for the hero, form/media controls, insights, milestones, encouragement, impact, quick actions, archive controls, privacy badges, record metrics/actions, and Load More.
22. **Rendered icon count:** `41/41` at every tested viewport.
23. **Empty approved icon containers:** `0`.
24. **Viewports tested:** `1536x1024`, `1448x1086`, `1440x900`, `1280x800`, `1024x768`, `768x1024`, `390x844`, `360x800`, and `768x512` as the 200%-zoom-equivalent layout.
25. **200% zoom result:** PASS; `30/30` Testimony controls remain visible and pointer-enabled, `41/41` icons render, all three records remain present, Axe reports zero violations, and no document-level horizontal overflow occurs.
26. **Header/hero result:** PASS; the scenic full-width hero, title hierarchy, supporting copy, heart mark, and top actions align to the approved composition while preserving live copy.
27. **Share-form result:** PASS; title, category, body, media group, and submission control are compact, aligned, and usable.
28. **Optional-media result:** PASS; all four current image, video, audio, and link actions remain visible, reachable, and invoke the existing notice flow.
29. **Form-validation result:** existing controller behavior is unchanged. A completed user-authored draft creates successfully; CSS introduces no validation or data semantics.
30. **Save Testimony result:** PASS; a session draft was created, appeared first with Draft status, and was undone back to the original three records.
31. **Testimony Insights result:** PASS; four current metrics and the period selector remain readable and operable.
32. **Testimony Milestones result:** PASS; current milestone sequence, values, active step, and View All action remain present.
33. **Encouragement Wall result:** PASS; heading, participant cluster, count, and Encourage Someone action remain present and unobstructed.
34. **Testimony Impact result:** PASS; all current metrics and the analytics action remain visible and aligned.
35. **Quick Actions result:** PASS; Write Testimony, Invite Encouragement, and Export Archive remain visible and enabled.
36. **My Testimonies result:** PASS; heading, tabs, controls, safety panel, export/data controls, three records, and Load More remain present.
37. **Sort result:** PASS; the existing sort selector remains visible, focusable, and unchanged.
38. **Filter result:** PASS; the existing Filters control remains visible and invokes its current handler.
39. **Status-tab result:** PASS; Public filters to `1`, Private to `1`, Drafts to `1`, and All restores `3`.
40. **Safety-panel result:** PASS; user-recorded-only language, safe export, and Data Controls remain visible and unchanged.
41. **Record-card result:** PASS; all three live cards retain thumbnails, current copy, status, metadata, Scripture, metrics, label action, and delete action.
42. **Privacy-state result:** PASS; Public, Private, and Draft remain visible. The tested Draft-to-Private local label transition worked and did not imply publication or fulfillment.
43. **Scripture-chip result:** PASS; all current references remain visible and unchanged.
44. **Record-statistics result:** PASS; current encouragement, view, and share metrics remain visible for every record.
45. **Overflow-menu result:** the current DOM exposes explicit label and delete actions rather than a separate overflow menu; both actions remain reachable. CSS did not fabricate a reference-only menu.
46. **Load More result:** PASS; the current control remains visible, enabled, and wired to its existing handler.
47. **Local beta notice result:** PASS; it remains visible, uses `pointer-events:none`, and cannot block a control.
48. **Testimony creation functionality result:** PASS; creation, rendering, and Undo were verified with session-only data and returned to the original state.
49. **Media functionality result:** PASS; the current optional-media action flow was exercised without changing upload or storage behavior.
50. **Sort/filter functionality result:** PASS for current status tabs and existing sort/filter controls; no JavaScript behavior changed.
51. **Encouragement functionality result:** the current action remains visible, pointer-enabled, and unchanged.
52. **Share functionality result:** current record share metrics and the existing owner-approved action surface remain unchanged; no new sharing behavior was fabricated.
53. **Export functionality result:** PASS; `teoyube-testimony-safe-export.json` downloaded with three redacted records, user-authored attribution, and no raw body field.
54. **Keyboard result:** PASS; all `30/30` Testimony controls accepted focus and displayed a visible focus indicator.
55. **Focused Axe result:** PASS; zero WCAG A/AA violations at 1448x1086, 390x844, and the 200%-zoom-equivalent viewport.
56. **Clipping result:** PASS; no Testimony control is horizontally clipped at any of the nine tested sizes.
57. **Horizontal-overflow result:** PASS; zero document-level horizontal overflow at all nine tested sizes.
58. **CSS lint result:** PASS; 169 rules, 181 selectors, zero unscoped selectors, zero external URLs, zero parse errors, and zero unauthorized hidden rules. The three hidden rules preserve dynamic filtering or approved responsive shell/topbar compaction.
59. **Application lint result:** PASS with zero warnings.
60. **Typecheck result:** PASS (`next typegen` and strict TypeScript).
61. **Unit-test result:** PASS in the required isolated run: 38 files passed, 1 skipped; 276 tests passed, 1 skipped. An earlier parallel run is retained as diagnostic context: concurrent CPU load caused one 5-second inventory timeout and a 5.57-second corpus load against its 5-second performance budget; both passed when rerun in isolation without code or threshold changes.
62. **Browser/route-test result:** PASS; all 16 Playwright tests passed, including the complete Today-to-Tomorrow guided journey.
63. **Build result:** PASS on Next.js `16.2.11`; 58 route artifacts generated and TIG, Scripture, safety, Teo Guide, live-AI, and retrieval client-boundary checks passed.
64. **Visual-contract result:** PASS; 268 protected source records, 210 protected visual records, 72 immutable screenshots, 12 immutable DOM snapshots, 60 owner-approved support screenshots, and 54 owner-approved Next support captures verify.
65. **DOM/class parity result:** PASS. Next and static Testimony signatures have the identical SHA-256 `aa4172811371a057248685a35b34eb286dd10aadefbc5a422a34e9c32d410f8e`; IDs, classes, controls, records, and tag structure compare equal.
66. **TIG-contract result:** PASS; the direct calling-seed ownership boundary remains intact.
67. **Recovery-verification result:** PASS, including visual, support-route, Next-support, TIG, Scripture, import, architecture, safety, and retrieval contracts.
68. **Console/page/request error result:** zero unexpected console errors, page errors, request failures, or bad responses in the focused and responsive audits. The current Next shell still issues known duplicate root stylesheet requests that return 404 while every canonical `/styles/pages/*.css` request returns 200; this pre-existing behavior was not changed or concealed.
69. **Asset/404 result:** PASS for the canonical Testimony stylesheet and used hero asset; both return successfully. No new asset or unexpected 404 was introduced.
70. **Cross-route regression result:** PASS; all 181 selectors are nested beneath `body[data-view="testimony"]`, and the full recovery, build, unit, browser, and boundary suites pass.
71. **Previous and new Testimony CSS fingerprints:** SHA-256 `a81f3460723d4c60294d25ec95d1aea72458b3b96fe580106130af482224cea2` at 111 bytes -> `617fc90329c8b135d88b38e23d8a442b5677e3c4e0807c9394e167194f4509f3` at 22,752 bytes. The protected source-manifest hash consequently changed `1dadccc6b8edaee1f52c1008f4200c994fc14d845c0919dbc3bbad7e808575df` -> `964b59ca8a9277006b387447c29d0777836a19b0e258e1669e9a1f2cad4a0cb5`.
72. **Previous and new deterministic runtime digest/build identity:** digest `751721dee1d666214b78f90104745aadedb93d5d4e9cf0ebe7226be7e9ff712c` / build ID `teoyube-751721dee1d666214b78f901` -> digest `aabbcc24f15b8d325bad7678c292d2e126ad3ca562cba59b976577ceb5e5f5e8` / build ID `teoyube-aabbcc24f15b8d325bad7678`. These values were computed from the exact approved CSS and protected-manifest binding.
73. **Before top screenshot path:** `before-next-1448x1086-viewport.png`.
74. **Before full-page screenshot path:** `before-next-1448x1086-full-page.png`.
75. **Owner-reference path:** `testimony-owner-reference-1448x1086.png`.
76. **Final 1448x1086 screenshot path:** `final-next-1448x1086-viewport.png`.
77. **Final full-page screenshot path:** `final-next-1448x1086-full-page.png`.
78. **Responsive screenshot paths:** the `final-next-{1536x1024,desktop-wide-1440x900,desktop-standard-1280x800,tablet-landscape-1024x768,tablet-portrait-768x1024,mobile-390x844,mobile-small-360x800,200-percent-768x512}-{viewport,full-page}.png` files in this evidence directory.
79. **Panel close-up paths:** the 13 `final-closeup-*.png` files covering header/hero, form, optional media, insights, milestones, encouragement, impact, quick actions, archive header, safety, records, record actions, and local beta notice.
80. **Side-by-side comparison path:** `testimony-owner-reference-side-by-side.png`.
81. **Difference-image path:** `testimony-owner-reference-absolute-diff.png`; enhanced difference: `testimony-owner-reference-diff-enhanced.png`; overlay: `testimony-owner-reference-overlay-50.png`.
82. **Measured visual difference:** exact-size 1448x1086 comparison: mean absolute RGB channel differences `[20.771368, 17.779701, 18.312324]`, RMS channel differences `[54.806604, 44.455588, 45.693694]`, exact-channel ratio `0.10784037`. These are descriptive metrics, not a baseline-replacement threshold.
83. **Remaining CSS-only differences:** existing live copy and current DOM controls remain authoritative; the reference-only three-dot header/menu and record overflow-menu treatment were not fabricated; the live page is 18 CSS pixels taller than the reference viewport because natural scrolling and all current controls/records were preserved.
84. **Temporary-file status:** all task-local disposable Testimony audit scripts and candidate manifests under `.tmp/` were removed after evidence generation; only owner evidence remains.
85. **Closeout status:** canonical runtime and complete recovery checks passed against committed evidence SHA `0e4952c`; only this report correction and the approval record's final blank-line normalization are pending in the documentation-only closeout commit. Final clean-tree status is reported in the handoff.
86. **Rollback command:** `git revert <final-evidence-commit> 96617a8 70e525c` (revert newest to oldest, resolving only if later owner work overlaps).

## Additional gate state

- Safety orchestration: PASS (`64/64` fixtures); Gate B remains `CLOSED_LIVE_AI_DISABLED`.
- Canonical runtime candidate and clean-tree checks: PASS.
- Runtime policy is unchanged: Next is canonical under `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`; static remains the rollback.
- No public deployment, live-AI enablement, persistence change, embedding change, or retrieval-policy change was performed.
