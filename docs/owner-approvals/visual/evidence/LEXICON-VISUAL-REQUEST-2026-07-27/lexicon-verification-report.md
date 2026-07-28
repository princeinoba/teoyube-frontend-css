# Lexicon CSS-only visual transformation verification

Owner approval: `TEOYUBE-VISUAL-2026-07-27-LEXICON-001`

1. **Final status:** PASS.
2. **Approval decision recorded:** `Decision: APPROVED` is preserved in the owner-authored approval record.
3. **Approval ID:** `TEOYUBE-VISUAL-2026-07-27-LEXICON-001`.
4. **Approved by:** Prince Okiemute Inoba — Teoyube Project Owner.
5. **Approved at:** `2026-07-27T20:30:17-04:00`.
6. **Branch:** `recovery/visual-source-of-truth`.
7. **Starting HEAD:** `d07c30dc444b74320241448e86e191fbcde8b8df`.
8. **Final HEAD:** the commit containing this report, with subject `test(recovery): record Lexicon evidence and fingerprints`; the immutable SHA is reported by the final `git rev-parse HEAD` handoff because a commit cannot embed its own hash.
9. **Commits created:** `2e99f3d` (`docs(approval): authorize Lexicon CSS transformation`), `087931d` (`style(lexicon): implement owner-approved page architecture`), and the containing evidence commit (`test(recovery): record Lexicon evidence and fingerprints`).
10. **Exact Lexicon CSS files changed:** `styles/pages/lexicon.css` only.
11. **Approval and evidence files changed:** `docs/owner-approvals/visual/LEXICON_VISUAL_CHANGE_REQUEST_2026-07-27.md` plus the files under `docs/owner-approvals/visual/evidence/LEXICON-VISUAL-REQUEST-2026-07-27/`.
12. **Protected-hash and fingerprint files changed:** `tests/visual/contracts/protected-visual-source-manifest.json` and `tests/visual/contracts/original-static-visual-contract.json`. Only the approved Lexicon CSS size/hash and CSS-derived selector/token/media-query inventory changed.
13. **Runtime digest/build-identity files changed:** `config/runtime/asset-media-compatibility-manifest.json` and `config/runtime/canonical-runtime-manifest.json`. Only the protected-manifest hash and deterministic runtime digest/build ID changed.
14. **Application source confirmation:** no HTML, JSX, TSX, JavaScript, TypeScript, data, asset, package, route, or behavior source changed.
15. **Static/protected runtime result:** PASS. The 268 protected source records, 210 protected visual records, 72 immutable screenshots, 12 immutable desktop DOM snapshots, and all owner-approved support baselines verify.
16. **Next runtime result:** PASS as the canonical local runtime; the static Node runtime remains the retained rollback. No runtime cutover was performed by this task.
17. **Baseline and final control counts:** Next `715/715 visible` before and `715/715 visible` after; static was also `715/715` before and after.
18. **Baseline and final rendered word-card counts:** `109/109 visible` before and `109/109 visible` after in both runtimes.
19. **Icon implementation mechanism:** existing icon nodes/classes are restored and supplemented only by route-scoped CSS masks or decorative pseudo-elements using local/project-owned or URL-encoded SVG masks. Decorative layers use `pointer-events: none`.
20. **Existing DOM icons restored:** PASS; approved existing icon containers render without DOM changes.
21. **CSS icon definitions added:** route-scoped definitions cover the page header, search/filter controls, metrics, featured word, library controls/cards, right rail, and deep-study tools. No external URL, package, asset file, emoji, or replacement label was added.
22. **Rendered icon count:** `687/687` approved icon targets at every tested viewport.
23. **Empty approved icon containers:** `0`.
24. **Viewports tested:** `1536×1024`, `1440×900`, `1280×800`, `1024×768`, `768×1024`, `390×844`, `360×800`, and `768×512` for the 200% zoom-equivalent audit.
25. **200% zoom result:** PASS; two-column responsive composition, `715/715` controls, `109/109` cards, no clipping, no horizontal overflow, and `687/687` icons.
26. **Header/hero result:** PASS; Lexicon title treatment, scenic book artwork, shell alignment, hierarchy, and actions match the approved visual direction using existing DOM and assets.
27. **Search/filter result:** PASS; compact search, smart suggestions, category/speech selectors, and filter control are aligned, visible, and operable.
28. **Metric-card result:** PASS; five compact metric cards align in the approved system and retain current live values.
29. **Featured Word result:** PASS; TIDUILOVP hierarchy, image, references, controls, and study actions remain visible and usable.
30. **Today's Discovery result:** PASS; scenic card treatment and current live wording are preserved.
31. **Personal-insight result:** PASS within the current DOM; the existing study selector and actions remain usable. No reference-only note field was fabricated.
32. **Lexicon Library result:** PASS; header, alphabet controls, view controls, and all 109 live words remain reachable.
33. **Grid/List result:** visual controls align and remain enabled. The current Next controller does not change the `lexicon-grid` class when either control is selected; that pre-existing application behavior was preserved because JavaScript changes were outside the CSS-only approval.
34. **Library-filter result:** PASS; category, part-of-speech, alphabet, smart-suggestion, and text filters remain operable.
35. **Word-card grid result:** PASS; 4 columns at 1536/1440/1280, 3 at 1024, 2 at 768, and 1 at 390/360, with no clipped cards.
36. **Word-card pronunciation result:** pronunciation controls remain visible and enabled for all live cards; CSS does not intercept their current handlers.
37. **Word-card Favorite result:** existing save-word controls remain visible, enabled, and visually represented; no storage semantics were changed.
38. **Load More result:** the current control remains visible and enabled with the existing 109-card dataset and unchanged loading behavior.
39. **Lexicon Overview result:** PASS; overview panel, summary metrics, and visual hierarchy align with the reference.
40. **Progress-ring result:** PASS; the complete ring remains rendered using the existing SVG/DOM, without canvas or data changes.
41. **Top Searches result:** PASS; current live search ranking remains visible in the reorganized rail.
42. **Recent Activity result:** PASS; all current activity items remain visible and accessible.
43. **Word of the Day result:** PASS; existing copy, artwork, and action are preserved.
44. **Quick Actions result:** PASS; current actions remain visible, enabled, and grouped in the approved rail treatment.
45. **Scripture quotation result:** PASS; current Scripture copy and reference remain unchanged and visually organized.
46. **Deep Study result:** PASS; the existing panel is reorganized without DOM, copy, data, or handler changes.
47. **Word Analysis result:** PASS; current analysis, metadata, and related information remain visible.
48. **Quick Tools result:** PASS; current tool controls remain visible and enabled.
49. **Related Scriptures result:** PASS; current exact references and copy remain unchanged.
50. **Related Words result:** PASS; current related-word content remains unchanged and visible.
51. **Search functionality result:** PASS; searching `TIDUILOVP` yields 1 card and clearing restores 109.
52. **Filter functionality result:** PASS; category `acceptance` yields 1, speech `authority` yields 12, alphabet `T` yields 13, and reset restores 109. The `Benor` suggestion correctly yields 0 for the current dataset.
53. **Grid/List functionality result:** current controls remain enabled and clickable; their existing no-class-transition behavior is unchanged and documented in item 33.
54. **Pronunciation functionality result:** controls remain reachable, enabled, and unobstructed; no audio or application handler was changed by CSS.
55. **Favorite functionality result:** existing save-word action remains reachable and unobstructed; no persistence behavior changed.
56. **Note functionality result:** no approved personal-note input exists in the current Lexicon DOM. CSS did not fabricate a control or data behavior.
57. **Load More functionality result:** control remains enabled; current count and application behavior remain unchanged.
58. **Export functionality result:** no approved Lexicon export control exists in the current DOM. CSS did not fabricate an export action.
59. **Keyboard result:** PASS; `165/165` observed keyboard stops showed a visible focus indicator, with zero focus issues.
60. **Focused Axe result:** one pre-existing critical `aria-allowed-attr` rule remains on 27 unchanged `role="option"` elements using `aria-pressed`. Fixing markup/ARIA was outside this CSS-only approval; no contrast violation or new CSS-caused violation was found.
61. **Clipping result:** PASS; zero clipped approved targets at all eight tested sizes.
62. **Horizontal-overflow result:** PASS; zero document-level horizontal overflow at all eight tested sizes.
63. **CSS lint result:** PASS; 227 rules, zero unscoped selectors, zero unauthorized hidden rules, zero forbidden declarations. The one dynamic `[hidden]` rule preserves existing filter behavior.
64. **Application lint result:** PASS with zero warnings.
65. **Typecheck result:** PASS (`next typegen` and strict TypeScript boundary).
66. **Unit-test result:** PASS; 38 files passed, 1 skipped; 276 tests passed, 1 skipped.
67. **Browser/route-test result:** PASS; all 16 Playwright tests passed, including the full Today-to-Tomorrow journey.
68. **Build result:** PASS on Next.js `16.2.11`; 58 static/dynamic route artifacts generated and all client-boundary checks passed.
69. **Visual-contract result:** PASS; protected source, visual contracts, 72 immutable screenshots, 12 immutable DOM snapshots, 60 support screenshots, and 54 retained Next support-route captures verify.
70. **DOM/class parity result:** PASS; before Next, final Next, before static, and final static rendered Lexicon DOM files have the identical SHA-256 `8b1d720a8fb15e49b28222a7f17e6a94beb2255c02c2f5a9fd7d3a8b1b967bc6`.
71. **TIG-contract result:** PASS; the direct calling-seed ownership contract remains intact.
72. **Recovery-verification result:** PASS, including visual, support-route, Next-support, TIG, Scripture, import, architecture, safety, and retrieval contracts.
73. **Console/page/request error result:** canonical Next audit: 0 console errors, 0 page errors, 0 request failures, 0 bad responses. Static rollback retains its known pre-existing 404 for `/media/teoyubeworld/pilot-v1/runtime-manifest.json`; it was not introduced or concealed.
74. **Asset/404 result:** PASS for the canonical Next Lexicon page. The stylesheet and all four used Lexicon images return HTTP 200: `lexicon-hero-bg.png`, `word-of-the-day-bg.png`, `daily-inspiration-bg.png`, and `promise-language-panel-bg.png`.
75. **Cross-route regression result:** PASS; every revised selector is nested beneath `body[data-view="lexicon"]`, and full recovery/browser suites found no route regression.
76. **Previous and new Lexicon CSS fingerprints:** SHA-256 `66f6f7220414c27cd16715482362cd11bb38b1ee1386b9a08ba61bf1dcb0aae5` at 103 bytes → `83410c9049eda0fd1b2ec395ea3858e0e1580d4cd91f999c41786fc69d575098` at 44,249 bytes. The protected source-manifest hash consequently changed `0bc591cec1301220e20959d768979f1562f4906676ed0eec75a66b36def5ea49` → `be8fdaa76e4476b7c82cd307a184dce991e909b1e60ef0d256a9436f6f094a6d`.
77. **Previous and new deterministic runtime digest/build identity:** digest `7868e1e0e4165352a1f36630b8316dc9f661d8e420ca469fc186d1d09d6460c5` / build ID `teoyube-7868e1e0e4165352a1f36630` → digest `76e4188df729b6fab27e772fba3496ea136fa82925aa290e64abc81babc615f7` / build ID `teoyube-76e4188df729b6fab27e772f`. These are deterministic consequences of the approved CSS and exact fingerprint update only.
78. **Before top screenshot path:** `before-next-1536x1024-viewport.png`.
79. **Before full-page screenshot path:** `before-next-1536x1024-full-page.png`.
80. **Owner-reference path:** `lexicon-owner-reference-659x1134.jpeg`.
81. **Final desktop screenshot path:** `final-next-1536x1024-viewport.png`.
82. **Final full-page screenshot path:** `final-next-1536x1024-full-page.png`.
83. **Normalized 659 × 1134 comparison screenshot path:** `normalized-final-full-page-659x1134.png`; the normalized owner image is `normalized-owner-reference-659x1134.png`.
84. **Responsive screenshot paths:** the `final-next-{1536x1024,1440x900,1280x800,1024x768,768x1024,390x844,360x800,200-percent-768x512}-{viewport,full-page}.png` files in this evidence directory.
85. **Panel close-up paths:** the 15 `final-closeup-*.png` files covering header/hero, search, metrics, featured word, discovery, library, grid, overview, rail panels, and deep study.
86. **Side-by-side comparison path:** `side-by-side-owner-final-659x1134.png`.
87. **Difference-image path:** `difference-owner-final-659x1134.png`; overlay: `overlay-owner-final-659x1134.png`.
88. **Measured visual difference:** containment-normalized comparison at `659×1134` (no crop): mean absolute channel difference `24.888006`, normalized MAE `0.0976000`, changed-pixel ratio above 10 `0.32515997`, maximum channel difference `255`. This is evidence, not a parity threshold.
89. **Remaining CSS-only differences:** the live page is materially taller because all 109 current word cards and extra live controls/modules were preserved; current wording differs from the illustrative reference; reference-only note/export elements were not fabricated; Grid/List retains its pre-existing no-class-transition behavior.
90. **Temporary-file status:** task-local `.tmp` Lexicon audit scripts and console logs were removed after evidence generation; only committed owner evidence remains.
91. **Worktree status:** clean after the containing evidence commit and final verification.
92. **Rollback command:** `git revert <final-evidence-commit> 087931d 2e99f3d` (revert newest to oldest, resolving only if later owner work overlaps).

## Additional gate state

- Safety orchestration: PASS (`64/64` fixtures); live AI Gate B remains closed.
- Canonical runtime contract: PASS; Next remains canonical under owner decision `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`; the static runtime remains the rollback.
- Release state remains unchanged: `gateCPreview: BLOCKED_SECURITY_ADVISORY`, `gateCProduction: CLOSED`, no public deployment.
- Checked-in feature defaults remain disabled for live AI, embeddings, vector retrieval, and broad RAG.
