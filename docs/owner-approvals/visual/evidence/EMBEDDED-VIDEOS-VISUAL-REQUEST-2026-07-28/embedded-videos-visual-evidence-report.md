# Embedded Videos owner-approved visual transformation evidence

Approval: `TEOYUBE-VISUAL-2026-07-28-EMBEDDED-VIDEOS-001`

This report records the final CSS-only transformation of `/embedded-videos`.
Application markup, runtime logic, data, media, routes, assets, packages, and
tests were not changed. The canonical Next route and retained static rollback
view continue to share `styles/pages/embedded-videos.css`.

## Required closeout

1. **Final status:** PASS.
2. **Approval decision recorded:** `APPROVED`.
3. **Approval ID:** `TEOYUBE-VISUAL-2026-07-28-EMBEDDED-VIDEOS-001`.
4. **Approved by:** Prince Okiemute Inoba — Teoyube Project Owner.
5. **Approved at:** `2026-07-28T15:16:30-04:00`.
6. **Branch:** `recovery/visual-source-of-truth`.
7. **Starting HEAD:** `8969f0c85aee6c2a5722d2b7cdbdcb3d6e9c153e`.
8. **Final HEAD:** the evidence/fingerprint commit containing this report; the
   exact commit is reported at task closeout.
9. **Commits:** approval `27fc99e`; principal CSS `f8bc181`; focused protected
   token, responsive, and performance refinements `62dd748`, `761bb88`, and
   `7a57516`; final evidence commit reported at closeout.
10. **Embedded Videos CSS changed:** `styles/pages/embedded-videos.css` only.
11. **Approval/evidence changed:** the scoped approval record and files in this
    evidence directory only.
12. **Fingerprint files changed:** the exact Embedded Videos entry in
    `protected-visual-source-manifest.json` and
    `original-static-visual-contract.json`.
13. **Runtime identity files changed:** the protected-manifest hash in
    `asset-media-compatibility-manifest.json` plus deterministic digest/build ID
    in `canonical-runtime-manifest.json`.
14. **Application source boundary:** no HTML, JSX, TSX, JS, or TS application
    source changed.
15. **Static/protected result:** protected hashes, 72 immutable screenshots, and
    12 desktop DOM snapshots PASS; static rollback retained.
16. **Next result:** HTTP 200; canonical route retained; no Next console, page,
    request, hydration, CSS, image, or media asset error in the focused audit.
17. **Controls:** 53 route controls before and 53 after; 49 visible in the
    default state because four menu-action groups remain collapsed.
18. **Video cards:** 4 before and 4 after in the default state.
19. **Categories:** 7 before and 7 after.
20. **Smart Search suggestions:** 6 before and 6 after.
21. **Icon mechanism:** existing nodes/hooks, scoped geometry, five local
    URL-encoded SVG masks, and non-interactive pseudo-elements.
22. **Existing DOM icons restored:** title, header actions, four metrics,
    search, four play targets, eight carousel targets, four providers, four
    menus, load more, and local status.
23. **CSS icon definitions:** refresh, filter, search, Smart Search, provider,
    title screen/play, carousel chevrons, overflow dots, load-more chevron, and
    local-status dot.
24. **Rendered icon instances:** 35.
25. **Empty approved icon containers:** 0.
26. **Viewports:** 1536×1024, 1440×900, 1280×800, 1024×768, 768×1024,
    390×844, and a 768×512 CSS-viewport reflow audit representing 200% zoom.
27. **200% zoom:** PASS; one column, natural scrolling, all 53 controls retained,
    and zero document-level horizontal overflow.
28. **Header/hero:** PASS; 1314×184.31 at the reference viewport with the
    existing scenic asset and live copy.
29. **Header actions:** PASS; Guardrails, Generate Today's Journey, and Refresh
    remain visible and retain their handlers and accessible names.
30. **Hero preview:** no approved DOM target exists for the reference-only
    preview strip; nothing was fabricated.
31. **Category tabs:** PASS; compact desktop alignment and reachable mobile
    horizontal rail.
32. **Category selector:** PASS; existing options, selected state, and chevron
    retained.
33. **Sort:** PASS; existing options and state retained.
34. **Filters:** PASS at its baseline level; the existing button remains
    reachable and unchanged.
35. **Metric cards:** PASS; four metrics and existing live values retained.
36. **Search:** PASS; existing input, value, handler, and search icon retained.
37. **Smart Search:** PASS; all six controls and Clear retained.
38. **Video grid:** two columns at 1280px and above; one column at 1050px and
    below, matching the compact/tablet owner requirement.
39. **Media dimensions:** consistent panoramic desktop media and usable mobile
    16:9 media.
40. **Media crop:** scenic foreground artwork uses `object-fit: cover`; no
    distortion and no replacement asset.
41. **Category badges:** PASS; top-left placement and live labels retained.
42. **Play controls:** 4/4 visible and keyboard reachable.
43. **Previous controls:** 4/4 visible and functional at baseline level.
44. **Next controls:** 4/4 visible and functional at baseline level.
45. **Slide indices:** 4/4 visible.
46. **Durations:** 4/4 visible.
47. **Card footer:** compact title, provider, availability, Scripture metadata,
    and menu layout PASS.
48. **Card menu:** 4/4 reachable; each exposes the unchanged four actions.
49. **Load More:** visible, aligned, and behavior field-for-field identical to
    the original CSS.
50. **Refresh Videos:** visible; default card selection/order restores exactly
    as under the original CSS.
51. **Local beta:** visible, non-blocking, and unchanged.
52. **Category-filter behavior:** PASS; Teachings selects and renders the same
    three records before and after.
53. **Search behavior:** PASS; suggestion query and Clear results are identical
    before and after.
54. **Sort behavior:** PASS; Shortest ordering is identical before and after.
55. **Player behavior:** PASS at baseline level; preview opens the existing
    detail state.
56. **Carousel behavior:** PASS; next changes panel 1 and previous restores it.
57. **Menu behavior:** PASS; details opens with four unchanged actions.
58. **Load More behavior:** baseline 4→4 behavior is unchanged. This is a
    pre-existing non-CSS limitation and was not repaired through CSS.
59. **Keyboard:** 45-control sample reached route controls in DOM order; 44
    samples exposed a visible focus indicator.
60. **Focused Axe:** zero violations at desktop and mobile. Image/gradient
    contrast remains a manual/incomplete check; the five pre-existing
    prohibited-ARIA incomplete nodes are unchanged.
61. **Clipping:** PASS; no route panel/control is covered. Mobile categories
    outside the initial viewport remain reachable inside the intentional tab
    rail.
62. **Horizontal overflow:** PASS at every required viewport.
63. **CSS lint:** PostCSS parse PASS; 191/191 selectors route-scoped; no
    `transition: all`, `will-change`, backdrop filter, expensive blur, page
    zoom, or page-root scale.
64. **Application lint:** PASS, zero warnings.
65. **Typecheck:** PASS.
66. **Unit tests:** PASS, 276 passed and 1 skipped.
67. **Browser tests:** PASS, 18 passed.
68. **Build:** PASS, 58 routes/pages generated and all client-boundary checks
    passed.
69. **Visual contract:** PASS.
70. **DOM/class parity:** static and Next normalized markup hash
    `03125024a54b4b2107216f2e3e83e879955dd85f248f825746fce7d1e68261c3`;
    IDs, classes, controls, and normalized asset paths are equal.
71. **TIG contract:** PASS.
72. **Recovery verification:** PASS.
73. **Console/page/request:** canonical Next focused audit PASS with zero
    errors.
74. **Assets/404:** canonical Next PASS. The isolated static server retains its
    pre-existing 404 for the published-media manifest endpoint and falls back
    locally; no CSS, image, video, or poster 404 was introduced.
75. **Cross-route regression:** PASS by 191/191 route-scoped selectors plus all
    immutable and owner-approved support baseline contracts.
76. **CSS fingerprint:** `eeab64e9febe302f7a645f573f64fbfbed05ca4fdf6ce9c45343a22ab6a8b373`
    (7,240 bytes) → `71c61bc1994fffcb2ba15116944b677c8c545802d8dca40072b4a8f4df36d657`
    (33,451 bytes).
77. **Runtime identity:** digest
    `d6949b3c4c5dcf9d9967eb41c4dc0f4ad81e89b648d01289529e28895443e5f9`
    / `teoyube-d6949b3c4c5dcf9d9967eb41` →
    `e5c232531def32a3d6c971398ea98152e166fd1ba3c3cbf72d77769d6d1b750c`
    / `teoyube-e5c232531def32a3d6c97139`.
78. **Before top:** `before-next-top-1536x1024.png`.
79. **Before full page:** `before-next-fullpage-1536x1024.png`.
80. **Owner reference:** `embedded-videos-owner-reference-1536x1024.png`.
81. **Final reference viewport:** `after-next-1536x1024.png`.
82. **Final full page:** `after-next-fullpage-1536x1024.png`.
83. **Responsive captures:** `after-next-1440x900.png`,
    `after-next-1280x800.png`, `after-next-1024x768.png`,
    `after-next-768x1024.png`, `after-next-200pct-768x512.png`, and
    `after-next-390x844.png`.
84. **Close-ups:** `after-hero-1536x1024.png`,
    `after-toolbar-1536x1024.png`, `after-metrics-search-1536x1024.png`,
    `after-video-grid-1536x1024.png`, and
    `after-video-card-1536x1024.png`.
85. **Side-by-side:** `embedded-videos-reference-vs-next-side-by-side.png`.
86. **Difference image:** `embedded-videos-reference-vs-next-diff.png`; overlay
    is `embedded-videos-reference-vs-next-overlay.png`.
87. **Measured difference:** mean absolute channel difference
    `31.5240605672`; RMS `60.5848654230`; 810,742 pixels (`51.545588%`) exceed
    a 10-level maximum-channel difference. This measures live/reference content
    differences as well as styling; it is not used to hide or excuse a
    structural regression.
88. **Remaining CSS-only differences:** reference-only hero preview cards have
    no DOM target; live copy and extra controls were preserved; live content
    determines card titles/metadata.
89. **Pre-existing limitations:** Load More remains 4→4 with the current local
    data; Filters retains its baseline focus behavior; isolated static media
    manifest fallback emits its existing 404.
90. **Temporary files:** disposable scripts were piped to Node; ignored
    pre-change CSS backups and isolated-server logs remain under
    `test-results/embedded-videos-owner-approved/`; no temporary production
    source was added.
91. **Worktree:** required to be clean after the final evidence commit and
    final runtime verification.
92. **Rollback:** revert the final evidence commit, then `7a57516`,
    `761bb88`, `62dd748`, `f8bc181`, and `27fc99e` in reverse chronological
    order.

## Known legacy smoke conflict

`npm run recovery:videos-tables:smoke` retains two visual assertions for the
superseded 21:7.35/foreground-`contain` Embedded Videos treatment. The current
owner approval explicitly requires the reference's panoramic full-bleed scenic
crop. The test source was not changed or weakened. All nonvisual checks in that
smoke pass, and exact pre/post CSS functional characterization is
field-for-field equal.
