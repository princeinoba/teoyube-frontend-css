# Book of the Saint CSS transformation verification

This report records the executable evidence for the owner-authorized
Book of the Saint visual transformation. Product-source implementation was
limited to `styles/pages/book.css`; DOM, behavior, assets, data, and routes
were not changed.

1. **Final status:** PASS.
2. **Approval decision recorded:** `Decision: APPROVED`.
3. **Approval ID:** `TEOYUBE-VISUAL-2026-07-27-BOOK-OF-THE-SAINT-001`.
4. **Approved by:** Prince Okiemute Inoba — Teoyube Project Owner.
5. **Approved at:** `2026-07-27T18:45:04-04:00`.
6. **Branch:** `recovery/visual-source-of-truth`.
7. **Starting HEAD:** `58dc78f931d4eb25ab6ec61765d65e161950be94`.
8. **Final HEAD:** the evidence commit containing this report; resolve with
   `git rev-parse HEAD`. Its exact SHA is also recorded in the final owner
   handoff because a commit cannot contain its own SHA.
9. **Commits created:** `9c9ffe1 docs(approval): authorize Book of the Saint
   CSS transformation`; `19d311a style(book-of-the-saint): implement
   owner-approved page architecture`; and the focused evidence/fingerprint
   commit containing this report.
10. **Exact Book CSS files changed:** `styles/pages/book.css` only.
11. **Approval and evidence files changed:** the scoped approval record plus
    this directory’s immutable owner-reference copy, before/final captures,
    responsive captures, panel close-ups, comparison images, and JSON audits.
12. **Protected-hash and fingerprint files changed:**
    `tests/visual/contracts/protected-visual-source-manifest.json` and
    `tests/visual/contracts/original-static-visual-contract.json`; only the
    Book CSS record and verifier-reported CSS-derived class, ID, and media-query
    fingerprints changed.
13. **Runtime digest/build-identity files changed:**
    `config/runtime/asset-media-compatibility-manifest.json` and
    `config/runtime/canonical-runtime-manifest.json`; only the derived
    protected-manifest checksum, runtime digest, and build ID changed.
14. **Application-source confirmation:** no `.html`, `.jsx`, `.tsx`, `.js`,
    or `.ts` application source changed. No image, SVG, package file, other
    route stylesheet, test source, immutable screenshot, or owner-approved
    support baseline changed.
15. **Static/protected runtime result:** PASS. The static rollback rendered
    all 74 Book controls; the 72 immutable screenshots and 12 desktop DOM
    snapshots verified byte-for-byte. Its pre-existing unpublished media
    manifest 404 remains separately classified and unchanged.
16. **Next runtime result:** PASS. `/book` rendered, the production build
    completed, and the deterministic candidate runtime contract passed.
17. **Baseline and final control counts:** before Next 74/74 visible; before
    static 74/74; final Next 74/74; final static 74/74.
18. **Icon implementation mechanism:** existing DOM containers with
    Book-scoped CSS masks and pseudo-elements; no new DOM, assets, packages, or
    accessible-name changes.
19. **Existing DOM icons restored:** 19 approved existing icon containers
    render decorative icons.
20. **CSS icon definitions added:** 12 Book-scoped reusable icon-mask
    definitions.
21. **Rendered icon count:** 19 audited approved containers.
22. **Empty approved icon containers:** zero.
23. **Viewports tested:** 1536×1024, 1440×900, 1280×800, 1122×1402,
    1024×768, 768×1024, 390×844, and 360×800.
24. **200% zoom result:** PASS at 561×701 with device scale factor 2; 74/74
    controls visible, no off-screen controls, and zero document overflow.
25. **Header result:** PASS; compact route-scoped shell/header, title, and
    existing actions align without overlap.
26. **Hero result:** PASS; the retained scenic Book hero forms the dominant
    top composition with readable text and the existing encouragement card.
27. **Book-cover result:** PASS; the project-owned Book artwork remains fully
    visible and no asset path changed.
28. **Encouragement-card result:** PASS; it aligns in the hero and reflows
    full-width on narrow screens.
29. **Metric-card result:** PASS; all four cards align and reflow without
    clipped values.
30. **Search/filter result:** PASS; suggestions, search, type/date filters,
    and filter action remain visible and responsive.
31. **Memory-panel result:** PASS; Saved Journey Memory, filters, empty/live
    regions, Export Memory, and Clear Memory remain present.
32. **Data-control result:** PASS; status cards and all advanced controls
    remain visible, readable, and wrapped safely.
33. **Backup-reminder result:** PASS; reminder, shield treatment, and all
    existing actions remain visible.
34. **Journal-entry result:** PASS; title, reflection input, Save Journal
    Entry, export, and open-memory detail are aligned and usable.
35. **Open-memory result:** PASS; existing item content, Scripture pills,
    Remove Item, and View Graph remain visible.
36. **Promise-discovery result:** PASS; timeline entry, date, copy, pills,
    Open Detail, Remove, and Graph remain visible.
37. **Pagination result:** PASS; previous, next, page 1/2/3/12 controls remain
    visible and keyboard reachable.
38. **Continuation-panel result:** PASS; current context and all seven
    reversible continuation actions remain visible and wrap safely.
39. **Smart Collections result:** PASS; input, create action, seven tabs,
    management controls, and add-current controls remain labeled and reachable.
40. **Journey Overview result:** PASS; overview metrics, week timeline,
    Scripture card, and existing values remain readable.
41. **Right-rail result:** PASS; Journey Overview, topics, Scripture/reminder,
    and quick actions align as a 224px rail at 1122px and become full-width on
    narrow screens.
42. **Search functionality result:** PASS; input accepted and retained the
    audit query with no console, page, request, or HTTP error.
43. **Filter functionality result:** PASS; type selection changed through the
    existing select handler; memory/date/filter controls remain present and
    receive interaction without CSS interception.
44. **Memory functionality result:** PASS; all ten filters and memory actions
    retain the same DOM, order, handlers, and baseline session-only behavior.
45. **Journal functionality result:** PASS; both existing inputs accepted
    values; no save, memory, or journal implementation changed.
46. **Export functionality result:** PASS; seven existing export/download
    controls remain visible and reachable; export implementation did not
    change.
47. **Collection functionality result:** PASS; all seven tabs, Create,
    Rename, Delete, Export, and five add-current controls retain their handlers
    and receive pointer/keyboard focus without pseudo-element interception.
48. **Pagination functionality result:** PASS; six existing pagination
    controls remain visible, ordered, and focusable.
49. **Continuation functionality result:** PASS; seven existing controls
    remain visible and retain the Prompt 13 reversible journey implementation.
50. **Keyboard result:** PASS; Next and static both produced the same
    90-control document tab sequence, the same Book-only sequence, zero hidden
    focusable controls, zero positive tabindex values, and visible focus
    indicators.
51. **Focused Axe result:** PASS with zero WCAG A/AA violations and 17 passed
    rule groups. Axe left contrast and prohibited-ARIA checks incomplete for
    gradient/pseudo-element contexts; no violation was reported and those
    existing semantics were not modified.
52. **Clipping result:** PASS; no user-visible label or control is clipped.
    The audit’s sole raw overflow heuristic is the existing `aria-hidden`
    search glyph replaced visually by the CSS mask.
53. **Horizontal-overflow result:** PASS; zero document-level horizontal
    overflow and zero off-screen controls at every tested viewport and 200%.
54. **CSS lint result:** PASS; PostCSS parsed 289 rules/879 declarations, with
    zero unscoped selectors, zero `transition: all`, and zero external URLs.
55. **Application lint result:** PASS, zero ESLint warnings.
56. **Typecheck result:** PASS; Next route type generation and
    `tsc -p tsconfig.next.json --noEmit`.
57. **Unit-test result:** PASS; 38 files passed, 1 skipped; 276 tests passed,
    1 skipped.
58. **Browser/route-test result:** PASS; 16/16 Playwright tests, including
    every retained route and the complete Prompt 13 daily loop.
59. **Build result:** PASS; Next 16.2.11 production build plus TIG, Scripture,
    safety, Teo Guide, live-AI, and retrieval client-boundary checks.
60. **Visual-contract result:** PASS; 210 protected files, 12 owner
    references, 1015 DOM classes, 525 DOM IDs, 1154 CSS classes, and 34
    animation names verified.
61. **DOM/class parity result:** PASS; no markup source changed and the final
    Next/static 74-control tag/ID/class/order signatures are identical.
62. **TIG-contract result:** PASS; the narrow `TIG_CALLING_SEEDS` ownership
    contract remains intact.
63. **Recovery-verification result:** PASS, including visual, support-route,
    Scripture, import, architecture, safety, and retrieval contracts.
64. **Console/page/request error result:** PASS for regression: the focused
    interaction audit produced zero errors. A pre-existing duplicate root
    page-CSS request pattern and the static unpublished media-manifest 404 are
    recorded rather than concealed; canonical resources returned 200.
65. **Asset/404 result:** PASS; `/styles/pages/book.css`,
    `/styles/pages/index.css?recovery=1`, and the retained hero image returned
    200 with exact expected byte lengths. No asset changed.
66. **Cross-route regression result:** PASS across Today, Search, Canon,
    Promise Table, Calling Compass, Lexicon, Testimony, Teo Guide, Embedded
    Videos, and Tables; Book selectors were inactive and horizontal overflow
    was zero on every route. Shared source did not change.
67. **Previous/new Book CSS fingerprints:** 97 bytes /
    `21e97bde6d65fa72b5f8519496b3a8d06b27f92c8ecca7ca540b723c698d3294`
    → 51,083 bytes /
    `0b6b2d9cd813f2ec35216ad3d8778ac4b3a69e44367d8680052d7d2a6101d184`.
68. **Previous/new deterministic runtime identity:**
    digest `233edc7b656c62a7010d4c3e9b418e792063aaf530deff0160fb53692094a09f`
    / build `teoyube-233edc7b656c62a7010d4c3e` → digest
    `7868e1e0e4165352a1f36630b8316dc9f661d8e420ca469fc186d1d09d6460c5`
    / build `teoyube-7868e1e0e4165352a1f36630`.
69. **Before top screenshot:**
    `before-next-1122x1402-viewport.png`.
70. **Before full-page screenshot:**
    `before-next-1122x1402-full-page.png`.
71. **Owner-reference path:**
    `book-of-the-saint-owner-reference-1122x1402.png`; SHA-256
    `810b0cf596e3adaa7075bb647169360124ff4e399122d931940c534bf43bf2d7`.
72. **Final 1122×1402 screenshot:**
    `final-next-1122x1402-viewport.png`.
73. **Final full-page screenshot:**
    `final-next-1122x1402-full-page.png`.
74. **Responsive screenshots:** `final-next-1536x1024-viewport.png`,
    `final-next-1440x900-viewport.png`,
    `final-next-1280x800-viewport.png`,
    `final-next-1024x768-viewport.png`,
    `final-next-768x1024-viewport.png`,
    `final-next-390x844-viewport.png`,
    `final-next-360x800-viewport.png`, and
    `final-next-561x701-200-percent-viewport.png`; matching full-page captures
    are preserved beside them.
75. **Panel close-ups:** `final-closeup-header.png`,
    `final-closeup-hero.png`, `final-closeup-summary-metrics.png`,
    `final-closeup-search-filter-row.png`,
    `final-closeup-saved-journey-memory.png`,
    `final-closeup-data-controls.png`, `final-closeup-backup-reminder.png`,
    `final-closeup-book-journal-testimony.png`,
    `final-closeup-promise-discovery.png`,
    `final-closeup-continue-where-left-off.png`,
    `final-closeup-smart-collections.png`, and
    `final-closeup-right-rail.png`.
76. **Side-by-side comparison:** `side-by-side-owner-final-1122x1402.png`.
77. **Difference image:** `difference-owner-final-1122x1402.png`; the
    50%-opacity overlay is `overlay-owner-final-1122x1402.png`.
78. **Measured visual difference:** unmasked identical-dimension 1122×1402
    absolute RGB comparison measured 615,359 pixels with a maximum channel
    delta greater than 10 (39.1190%), mean absolute RGB delta 22.5821, RMSE
    52.2787, maximum channel delta 255. This is diagnostic evidence, not a
    threshold waiver.
79. **Remaining CSS-only differences:** the live app retains controls, values,
    local-only panels, copy, and session states that are absent or different
    in the illustrative owner reference, as explicitly required. Font
    rasterization and project-owned artwork differ from the mock-up’s rendered
    pixels. No live content was hidden to lower the difference.
80. **Temporary-file status:** disposable capture script removed; generated
    evidence retained only in this authorized directory. Existing `.tmp`
    build/test artifacts remain ignored.
81. **Worktree status:** expected to be clean after the focused evidence
    commit; the final handoff records the exact `git status --short` result.
82. **Rollback command:** `git revert --no-edit <evidence-commit> 19d311a
    9c9ffe1`. Substitute the final evidence commit SHA from the handoff.

## Additional executable safety result

`npm run safety:gate:orchestration` passed: Gate A PASS, Gate B
`CLOSED_LIVE_AI_DISABLED`, 64/64 fixtures passed. No behavior, persistence,
Scripture, TIG, live-AI, or retrieval implementation changed.
