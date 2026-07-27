# Your Calling Compass internal diagram verification

1. **Final status:** PASS.
2. **Approval ID recorded:** `TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-DIAGRAM-001`, as an amendment to the existing Calling Compass approval.
3. **Branch:** `recovery/visual-source-of-truth`.
4. **Starting HEAD:** `5fc26e6e4608c55eeb5508905b06f26a93703170`.
5. **Final HEAD:** the commit containing this report; its exact hash is reported by `git rev-parse HEAD` in the task closeout (a commit cannot embed its own final hash).
6. **Commits created:** approval record, scoped diagram implementation, decorative-layer hit-target refinement, intermediate-width fill refinement, and final evidence/fingerprint closeout.
7. **Exact CSS file changed:** `styles/pages/calling-compass.css`.
8. **Governance/evidence changed:** the existing Calling Compass approval record and this task's `diagram-panel/` evidence directory only.
9. **Fingerprint/digest files changed:** `tests/visual/contracts/protected-visual-source-manifest.json`, `tests/visual/contracts/original-static-visual-contract.json`, `config/runtime/asset-media-compatibility-manifest.json`, and `config/runtime/canonical-runtime-manifest.json`.
10. **Application-source boundary:** no HTML, JSX, TSX, JavaScript, or TypeScript application source changed; no route, handler, data, asset, test source, or package file changed.
11. **Desired reference:** Image 1, preserved as `your-calling-compass-owner-target-image1.png`, was used only for the internal arrangement.
12. **Current baseline reference:** Image 2, preserved as `your-calling-compass-baseline-image2.png`, was used for the locked outer-shell role.
13. **Outer panel baseline dimensions (2048×1200):** `526.65625 × 609.5625` CSS px at document position `x=1149.34375`, `y=948.421875`.
14. **Outer panel final dimensions (2048×1200):** `526.65625 × 609.5625` CSS px at the identical document position.
15. **Outer panel geometry difference:** `x=0`, `y=0`, `documentX=0`, `documentY=0`, `width=0`, `height=0` at all 12 audited viewports; header and neighboring panel deltas are also zero.
16. **Footer CTA baseline position:** document `x=1162.8125`, `y=1508.046875`, `499.71875 × 36.46875` CSS px.
17. **Footer CTA final position:** exactly the same; every measured footer delta is zero.
18. **Diagram-region dimensions:** owner-wide baseline and final are both `448 × 284.796875` CSS px; the region box remains exact at every audited viewport.
19. **Baseline diagram-composition dimensions:** `380.3125 × 265.078125` CSS px owner-wide.
20. **Final diagram-composition dimensions:** `448 × 284.796875` CSS px owner-wide.
21. **Baseline central-hub diameter:** `78.390625` CSS px owner-wide.
22. **Final central-hub diameter:** `100` CSS px owner-wide, with responsive `76`/`100` CSS px caps where the locked footprint requires them.
23. **Baseline diagram-space usage:** `84.8912%` width and `93.0762%` height owner-wide.
24. **Final diagram-space usage:** `100%` width and `100%` height owner-wide, without changing the diagram-region or panel box.
25. **Dimension cards rendered:** 7 — Purpose, Identity, Giftings, Service, Prayer, Leadership, and Wisdom.
26. **Visible dimension icons:** 7 at every viewport and at the 200% equivalent.
27. **Existing descriptions displayed:** 7 at every viewport and at the 200% equivalent.
28. **Missing-description DOM limitations:** 0; every approved node already contains a description and no text was invented.
29. **Clipping:** 0 clipped nodes at all audited sizes.
30. **Overlap:** 0 node-node, 0 node-hub, and 0 content-footer overlaps at all audited sizes.
31. **Internal scrollbar:** none added; panel and radar internal scroll deltas remain zero.
32. **Horizontal overflow:** 0 CSS px at every viewport and at the 200% equivalent.
33. **Dimension-node interaction:** all seven retain `tabindex="0"`, unchanged accessible text/tooltips, focus, click behavior, and URL state; all seven have 9/9 usable sampled pointer points owner-wide.
34. **Central-hub interaction:** the approved hub is a noninteractive `STRONG` with `tabIndex=-1` and no role; that behavior and text are unchanged.
35. **View Full Compass:** remains the same focusable footer button with the same label, size, position, and baseline behavior; clicking preserves the same URL because the approved button is currently inert.
36. **Keyboard:** focus order remains Purpose → Identity → Giftings → Service → Prayer → Leadership → Wisdom → View Full Compass; focus-visible styling is retained.
37. **Focused Axe:** PASS, 0 violations in the panel.
38. **Viewports tested:** 2048×1200, 1536×1024, 1440×900, 1280×800, 1024×768, 768×1024, 390×844, 360×800, plus drag widths 1181, 899, 719, and 519.
39. **200% zoom:** PASS using a 768×512 CSS viewport at device scale factor 2; outer panel/footer deltas zero, 7/7/7 content visible, 0 clipping/overlap/overflow.
40. **CSS lint:** no dedicated stylelint script exists; the executable scoped-CSS audit passed 45/45 selector parts, `git diff --check` passed, and there are 0 broad selectors, scale transforms, `transition: all`, external URLs, or generated content declarations.
41. **Application lint:** PASS with `npm run lint`.
42. **Typecheck:** PASS with `npm run typecheck`.
43. **Unit tests:** PASS, 276 passed and 1 skipped. The first parallel run exposed three existing contention-sensitive performance failures; all 3 passed in isolation and the full suite passed with one worker without changing code or thresholds.
44. **Browser/route tests:** PASS, 16/16 Playwright e2e tests.
45. **Build:** PASS with Next.js 16.2.11; 58 pages generated and TIG, Scripture, safety, Teo Guide, live-AI, and retrieval client-boundary checks passed.
46. **Visual contract:** PASS — 210 protected visual files, 12 owner references, 72 immutable screenshots, and 12 immutable desktop DOM snapshots verified.
47. **DOM/class parity:** PASS — protected static contract verified 185 IDs, 398 class names, and 9 stylesheets; focused Calling Compass parity passed without DOM/class changes.
48. **TIG contract:** PASS; seed ownership/import boundary remains intact.
49. **Recovery verification:** PASS, including support-route and Next-support owner baselines, Scripture, imports, architecture, safety, and retrieval boundaries.
50. **Console/page/request errors:** 0 console errors, 0 page errors, 0 failed requests across all 12 comparative captures.
51. **Asset/404:** 0 HTTP error responses or asset 404s in the comparative audit; build client-bundle checks also passed.
52. **Cross-route regression:** PASS — all 45 added selector parts are rooted under `body[data-view="calling"] .calling-compass-panel .calling-radar`; Prayer/Calling/Journey parity passed 6/6 and neighboring panels have zero geometry delta.
53. **Calling Compass fingerprint:** previous `41,891` bytes / SHA-256 `13169753677e4e1a46f2a5321ffa6800792a21027128b6ae411378e0f148d623`; final `51,442` bytes / SHA-256 `8db16464a9e5a28aff3cd868ef14ef348fb01b81758d293cea476f4902d53aef`, with only `(min-width: 721px)` and `(min-width: 721px) and (max-width: 900px)` added to the exact media-query fingerprint.
54. **Deterministic runtime identity:** previous digest `999244fb8dc86d935a0ef41b797a6dfdbcc3f7863261ff2646a85fc2155ca571` / build ID `teoyube-999244fb8dc86d935a0ef41b`; final digest `233edc7b656c62a7010d4c3e9b418e792063aaf530deff0160fb53692094a09f` / build ID `teoyube-233edc7b656c62a7010d4c3e`.
55. **Before screenshot:** `your-calling-compass-before-owner-wide-2048x1200-locked.png`.
56. **Image 1 owner reference:** `your-calling-compass-owner-target-image1.png`.
57. **Image 2 baseline reference:** `your-calling-compass-baseline-image2.png`.
58. **Final panel screenshot:** `your-calling-compass-final-owner-wide-2048x1200.png`.
59. **Side-by-side comparisons:** `your-calling-compass-owner-target-final-side-by-side.png` and `your-calling-compass-before-final-side-by-side.png`.
60. **Difference/overlay:** `your-calling-compass-before-final-absolute-difference.png` and `your-calling-compass-before-final-overlay-50-percent.png`; comparison is unmasked and no baseline was replaced.
61. **Remaining CSS-only differences:** Image 1 remains a composition reference rather than a pixel baseline; its portrait shell was intentionally not copied. The locked live DOM, exact copy, fonts, and responsive footprint control final rendering. At narrow scroll positions, the pre-existing global offline-status badge overlaps part or all of Wisdom in both locked-before and final captures; this task introduced no new coverage and preserved keyboard access.
62. **Temporary files:** all enumerated working/superseded screenshots and the external visualization working copy were deleted; only final evidence remains.
63. **Worktree:** expected clean after the final evidence commit; verified again in the task closeout.
64. **Rollback:** revert the contiguous task commits in reverse order; the exact command with final hashes is provided in the task closeout.

Additional gates: safety orchestration PASS (64/64 fixtures, Gate A PASS, Gate B closed because live AI remains disabled); deterministic candidate runtime contract PASS; canonical Next runtime rebuilt and health-checked on port 3000; static rollback remains retained.
