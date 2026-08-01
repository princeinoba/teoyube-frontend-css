# Promise Table TeoyubeWorld playback closeout

## Decision and repository state

1. **Final status:** PASS.
2. **Approval ID:** `TEOYUBE-FUNCTIONAL-2026-07-30-PROMISE-TABLE-YOUTUBE-PLAYBACK-001`.
3. **Branch:** `recovery/visual-source-of-truth`.
4. **Starting HEAD:** `4a4771788884efe2048a3d007f99beeaf0a7d01f`.
5. **Final HEAD:** the commit containing this report; the exact SHA is emitted in the Codex handoff. Final implementation/evidence HEAD before this report is `2af3a0dbbfbdc1d860b6bd151971992f9cbcdf77`.
6. **Commits created:**
   - `b6f2b3373ab02b0e64a5d77b8dc5770f39bf3cdb` ? `docs(approval): authorize Promise Table TeoyubeWorld playback`
   - `d7c55a5bc250d6c77d9f917eadf97efc410f9004` ? `feat(promise-table): synchronize TeoyubeWorld playback`
   - `2af3a0dbbfbdc1d860b6bd151971992f9cbcdf77` ? `test(promise-table): verify synchronized playback`
   - report closeout commit ? exact SHA emitted at handoff.

## Changed-file accounting

7. **Product-source files changed:**
   - `embedded-videos.js` ? approved static-runtime media bootstrap only.
   - `src/app/_promise-table/PromiseTablePageController.tsx` ? Next controller initializes and destroys the shared player.
   - `src/features/promises/promise-table-youtube-player.js` ? shared synchronized player/controller.
   - `src/features/promises/promise-table-youtube-player.d.ts` ? client-safe player contract.
   - `config/runtime/canonical-runtime-manifest.json` ? deterministic digest/build identity only.
   - `config/runtime/asset-media-compatibility-manifest.json` ? exact protected-manifest digest only.
   - `tests/visual/contracts/protected-visual-source-manifest.json` ? exact approved `embedded-videos.js` fingerprint only.
   - `tests/visual/contracts/original-static-visual-contract.json` ? exact approved `embedded-videos.js` fingerprint only.
8. **Media-data files changed:** `src/features/promises/promise-table-youtube-feed.json`.
9. **CSS files changed:** 0.
10. **Security/CSP files changed:** 0. No CSP weakening, API key, secret, dependency, or arbitrary iframe source was added.
11. **Test files changed:**
    - `playwright.config.ts` ? uses installed Chrome on Windows, matching the repository visual runner, because bundled Chromium fails before launch in this Windows environment.
    - `tests/build-foundation/promise-table-youtube-playback.test.ts`
    - `tests/e2e/promise-table-youtube-playback.spec.ts`
    - `tests/e2e/promise-table-youtube-playback-static.spec.ts`
12. **Governance/evidence files changed:**
    - `docs/owner-approvals/functional/PROMISE_TABLE_TEOYUBEWORLD_VIDEO_PLAYBACK_CHANGE_REQUEST_2026-07-30.md`
    - `docs/owner-approvals/functional/evidence/PROMISE-TABLE-YOUTUBE-PLAYBACK-2026-07-30/*`
    - `docs/recovery/promise-table-teoyubeworld-playback-report.md`

## Official media verification and mapping

13. **Official channel URL:** `https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w`.
14. **Official channel ID:** `UCxG1guesWqO69QK022fyp2w`.
15. **Media cards inspected:** 8 current canonical-match entries rendered in the Promise Table feed.
16. **Media cards mapped:** 8/8, using public channel RSS, public metadata/oEmbed, embed availability, the current repository media records, and exact canonical match fields. Production does not query RSS or metadata endpoints.
17. **Media cards unavailable:** 0.
18. **Canonical match-title-to-video-ID summary:**

| Stable ID | Canonical match | Official public title | Video ID |
| --- | --- | --- | --- |
| `local-seed-of-promise` | The Seed of Promise | The Seed of Promise | `4zM2olpouIo` |
| `local-power-of-prayer` | The Power of Prayer | Pleasing God over men The true servant's mission | `yLBb7JCMqJE` |
| `local-walk-in-purpose` | Walk in Divine Purpose | Count it all joy when you fall into diverse temptations and let patience perfect your faith | `yDu0bD1lukE` |
| `local-rooted-in-truth` | Rooted in His Word | If you lack wisdom, ask God in faith without wavering to receive it | `tnjdlvbaBY8` |
| `local-called-for-more` | Called for More | Grace and peace from God The foundation of faith | `chLnoAGxyrc` |
| `local-strength-for-today` | Strength for Today | From persecutor to preacher Paul's radical transformation | `jAmIjP7-T5w` |
| `local-promise-language` | Promise Language and Calling | Why God Regarded Not the People and the King They Chose | `I8Y3syhDG64` |
| `local-daily-assignment` | Daily Divine Assignment | Be doers of the word and not hearers only | `YY9VYdPUVf8` |

## Player and interaction results

19. **Player implementation used:** one shared, dependency-free click-to-load adapter that validates local feed records and constructs only `https://www.youtube-nocookie.com/embed/{verified-id}` URLs. Static and Next use the same mapping and controller.
20. **Player instances rendered:** one existing iframe shell and at most one active player; no card iframe or hidden duplicate player.
21. **Click-to-load result:** PASS. The iframe has no YouTube `src` and produces no YouTube request before an explicit media action.
22. **Initial autoplay result:** PASS. Initial autoplay is absent; `autoplay=1` is used only after an explicit Play/Watch/Next/Previous action.
23. **Watch Video! result:** PASS. All eight buttons use stable IDs, map to eight distinct official videos, update the existing Featured Video panel, preserve focus and scroll position, and replace the same iframe.
24. **Watch Now result:** PASS. It plays the selected item and defaults to the first playable entry without redirecting.
25. **Main Teaching Play result:** PASS by Enter, Space, and pointer activation; it plays the selected/default item inside the existing Teaching container and removes only the local poster overlay while active.
26. **Next Video result:** PASS. It follows the shared playable feed order and preserves the existing wrap convention.
27. **Existing Previous/indicator result:** PASS. Previous and all existing slide indicators share the same selected/active state, metadata, and iframe.
28. **Active metadata synchronization result:** PASS for title, description, channel, duration, view count, publication label, poster, active indicator, iframe title, Play accessible names, and truthful live status.
29. **Previous-video stop result:** PASS. The single iframe source is unloaded/replaced before the next verified source is assigned.
30. **Duplicate-audio result:** PASS. Only one iframe exists and rapid selection replaces the current source.
31. **Why this? regression result:** PASS; existing disclosure opens and remains independent of media selection.
32. **Promise Table regression result:** PASS; workspace, saved rows, Promise controls, page route, panel layout, and existing action wiring remain intact.
33. **Keyboard result:** PASS for Watch Video!, Watch Now, Main Play, Next, Previous, and indicator controls; focus remains on the activated control.
34. **Focused Axe result:** PASS; 0 critical or serious WCAG 2/2.1 A/AA violations in the Featured Video and media feed regions.

## Runtime, responsive, and regression evidence

35. **Static-runtime result:** PASS. The retained static rollback path uses the same local mapping, consent boundary, controls, and one-player lifecycle (`1/1` focused static browser test).
36. **Next runtime result:** PASS. The current owner-approved canonical local Next route `/promise-table` uses the shared player; no cutover, publication, push, or deployment was performed by this task.
37. **Viewports tested:** 1536x1024, 1440x900, 1280x800, 1024x768, 768x1024, and 390x844.
38. **200% zoom result:** PASS; player and controls remain operable, focused, contained, and free of serious Axe findings.
39. **Visual-preservation result:** PASS. Default-state structure, classes, imagery, copy placement, and panel composition remain unchanged. Evidence includes approved-before, current-before-playback, selected, active, close-up, mobile, and side-by-side captures. No baseline was regenerated.
40. **Panel-sizing result:** PASS; actual layout height remains within 1 px before/after playback across all required viewports. A runtime-only minimum preserves the initially rendered panel height after activation and restores the prior inline value on cleanup.
41. **Horizontal-overflow result:** PASS; document overflow is at most 1 px at every required viewport.
42. **Console/page/request error result:** PASS; focused Next and static browser audits record 0 console errors and 0 page errors. Deterministic tests intercept only expected `youtube-nocookie.com/embed/{id}` requests and report no unexpected request failure.
43. **Asset/404 result:** PASS; no missing Promise Table asset or unexpected 404 was observed. Existing canonical media HEAD/Range/cache/not-found browser contract also passed.
44. **Unit-test result:** PASS ? focused mapping/player contract `3/3`; complete Vitest suite `284 passed, 1 skipped` (`40` files passed, `1` skipped). A parallel diagnostic run briefly exceeded two pre-existing retrieval timing budgets; the isolated authoritative run passed in 9.79 seconds without changing a threshold.
45. **Browser-test result:** PASS ? Promise Table Next matrix `9/9`; static matrix `1/1`; full bounded-concurrency suite `38 passed, 2 expected environment-gated static skips`; unrelated Today isolation `10/10`. The unbounded 12-worker diagnostic caused two Today feed timeouts, but the unchanged tests passed both in isolation and in the complete four-worker suite.
46. **Lint result:** PASS, 0 warnings.
47. **Typecheck result:** PASS (`next typegen` plus strict Next TypeScript boundary).
48. **Build result:** PASS; Next 16.2.11 generated 58 routes. Deterministic build ID `teoyube-8217ea902545a52308103b69`; TIG, Scripture, safety, Teo Guide, live-AI, and retrieval bundle/boundary checks all passed.
49. **Visual-contract result:** PASS ? 268 protected-source entries, 210 visual-contract files, 12 owner references, 72 immutable screenshots, and 12 immutable DOM snapshots verified.
50. **DOM/class parity result:** PASS ? static contract retained 185 IDs, 398 class names, and 9 stylesheet entries; no production ID, class, DOM-order, or stylesheet-order change was made. Only non-visual runtime `data-*`/`aria-*` attributes are added.
51. **TIG-contract result:** PASS; direct seed ownership contract remains intact and no TIG data or client seed/traversal import changed.
52. **Recovery-verification result:** PASS, including visual, support-route, Next support-route, TIG, Scripture, import, architecture, safety, and retrieval contracts.
53. **Cross-route regression result:** PASS. The complete four-worker browser suite passed all 38 runnable tests with two expected static-spec skips; the Prompt 13 guided loop, Today, Embedded Videos, sidebars, runtime routing/media, Scripture, release evidence, and Teo Guide all passed.

## Evidence, limitations, and rollback

54. **Before screenshot path:** `docs/owner-approvals/visual/evidence/PROMISE-TABLE-VISUAL-REQUEST-2026-07-26/after-closeup-featured.png` (the approved pre-functional-integration visual reference).
55. **Active-player screenshot path:** `docs/owner-approvals/functional/evidence/PROMISE-TABLE-YOUTUBE-PLAYBACK-2026-07-30/after-active-power-of-prayer.png`.
56. **Watch Video! close-up path:** `docs/owner-approvals/functional/evidence/PROMISE-TABLE-YOUTUBE-PLAYBACK-2026-07-30/watch-video-card-closeup.png`.
57. **Mobile screenshot path:** `docs/owner-approvals/functional/evidence/PROMISE-TABLE-YOUTUBE-PLAYBACK-2026-07-30/mobile-active-390x844.png`.
58. **Side-by-side comparison path:** `docs/owner-approvals/functional/evidence/PROMISE-TABLE-YOUTUBE-PLAYBACK-2026-07-30/side-by-side-before-after.png`.
59. **Remaining limitations:** deterministic CI validates official IDs, privacy-enhanced URLs, lifecycle, and rendered states using mocked embed documents; it does not depend on public YouTube playback availability. Public playback still depends on YouTube availability and the video owner retaining embed permission. The repository's pre-existing `gateCPreview` security-advisory blocker and closed production gate are unchanged.
60. **Temporary-file status:** all 47 task-created diagnostic scripts, logs, PID files, patches, and disposable Playwright-result paths were removed after verification. Only committed owner-review evidence remains. Task-owned ports 3100 and 4173 were stopped; no user runtime was stopped.
61. **Worktree status:** clean after the report commit; verified again at handoff.
62. **Rollback command:** `git revert --no-edit 4a4771788884efe2048a3d007f99beeaf0a7d01f..HEAD`.

No push or deployment was performed. No unrelated baseline, approval, page, CSS, asset, package, or private-data file was modified.
