# Today TeoyubeWorld synchronized playback verification

## 2026-07-31 all-feed official-channel expansion

This addendum supersedes the earlier one-playable-row limitation below while preserving that original delivery record. The owner explicitly requested that every remaining Today feed Play button load a different public video from the official TeoyubeWorld channel.

- Incremental starting HEAD: `7104aef974ae7260094bf70388caa8dd01adaa4e`.
- Incremental status: PASS.
- Official source verification: the public channel RSS feed, YouTube oEmbed author metadata, and privacy-enhanced embed endpoints were checked on 2026-07-31.
- Feed rows mapped: 8.
- Unique official-channel video IDs: 8.
- Feed rows unavailable: 0.
- Existing `The Seed of Promise` mapping retained: `4zM2olpouIo`.
- New mappings: `Walk in Divine Purpose` -> `yLBb7JCMqJE`; `Faith That Moves Mountains` -> `yDu0bD1lukE`; `The Power of Prayer` -> `tnjdlvbaBY8`; `Grace for Every Season` -> `chLnoAGxyrc`; `Kingdom Calling` -> `jAmIjP7-T5w`; `Promise Language` -> `I8Y3syhDG64`; `Daily Divine Assignment` -> `YY9VYdPUVf8`.
- Click-to-load and privacy-enhanced `youtube-nocookie.com` embedding remain unchanged. No YouTube request occurs before an explicit Play action.
- Next and static rollback browser coverage exercises all eight distinct Play controls, one shared iframe, Next/Previous wraparound, and keyboard operation.
- Full cross-runtime browser result: PASS, 30/30.
- Today screenshot, DOM, visible-label, action, carousel, and responsive parity: PASS, 4/4 across six viewports.
- Incremental protected visual files changed: 0. Immutable screenshots, DOM snapshots, and owner-approved support baselines changed: 0.
- Deterministic runtime identity was recomputed from the repository source manifest; canonical Next and the static rollback runtime remain unchanged.
- Residual availability risk: a public channel video can later become unavailable if its owner changes YouTube visibility; no runtime channel search or API key was added.

## Decision and scope

- Original 2026-07-30 status: PASS, with the historical verified-channel mapping limitation documented below.
- Approval ID: `TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001`.
- Branch: `recovery/visual-source-of-truth`.
- Starting HEAD: `8c50579cff1247e8857ea8aa013e4e4a66fdec7b`.
- Final HEAD: the final `test(today): verify synchronized YouTube playback` commit containing this report; the exact hash is recorded in the Codex handoff.
- Commits: `9169efb` approval; `436a84e` feature; final test/evidence commit containing this report.
- Runtime posture: canonical Next runtime retained; static Node runtime retained as the supported rollback path. No push or deployment was performed.

## Changed files

Product source:

- `embedded-videos.js`
- `src/app/_today/TodayPageController.tsx`
- `src/features/today/application/today-service.ts`
- `src/features/today/contracts.ts`
- `src/features/today/today-data.ts`
- `src/features/today/today-youtube-playback.static.js`
- `src/features/today/today-youtube.ts`

Data:

- `src/features/today/today-youtube-feed.json`

CSS:

- `styles/pages/today.css`

Tests:

- `tests/build-foundation/today-view-model.test.ts`
- `tests/build-foundation/today-youtube-playback.test.ts`
- `tests/e2e/today-youtube-playback.spec.ts`
- `tests/e2e/today-youtube-playback-static.spec.ts`
- `tests/visual/parity/today-parity.spec.ts`

Governance, derived contracts, and evidence:

- `docs/owner-approvals/functional/TODAY_TEOYUBEWORLD_VIDEO_PLAYBACK_CHANGE_REQUEST_2026-07-30.md`
- `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/*`
- `docs/recovery/today-teoyubeworld-playback-report.md`
- `config/runtime/asset-media-compatibility-manifest.json`
- `config/runtime/canonical-runtime-manifest.json`
- `tests/visual/contracts/original-static-visual-contract.json`
- `tests/visual/contracts/protected-visual-source-manifest.json`

Protected visual source changes were limited to two owner-authorized files: `embedded-videos.js` and `styles/pages/today.css`. Their exact derived size/hash entries were refreshed under the approval. Immutable static screenshots changed: 0. Immutable desktop DOM snapshots changed: 0. Owner-approved support baselines changed: 0. No selector allowlist was weakened.

## Official channel verification

- Official channel URL: `https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w`.
- Official channel ID: `UCxG1guesWqO69QK022fyp2w`.
- Feed rows inspected: 8.
- Feed rows mapped: 1.
- Feed rows unavailable: 7.
- Verified title mapping: `The Seed of Promise` -> `4zM2olpouIo` -> `https://www.youtube.com/watch?v=4zM2olpouIo`.
- The exact public title/channel association and privacy-enhanced embed response were checked during owner-channel research. Runtime code never calls channel search, RSS, or a Data API.
- Unavailable exact titles: `Walk in Divine Purpose`, `Faith That Moves Mountains`, `The Power of Prayer`, `Grace for Every Season`, `Kingdom Calling`, `Promise Language`, and `Daily Divine Assignment`.
- No similar third-party upload, invented ID, or reused unrelated ID was substituted. All seven rows remain visible with disabled Play controls and an accessible reason.

Because only one exact feed-title match was verifiable on the official channel, the requested browser exercise of three different playable feed rows could not be performed honestly. The implementation and deterministic tests support multiple unique mapped IDs, but this delivery deliberately exposes only the one verified current mapping.

## Player and behavior result

- Player implementation: the one existing Teaching-container iframe, switched after user consent to `https://www.youtube-nocookie.com/embed/{verifiedId}`. No player package, API key, analytics, or new iframe framework was added.
- Player instances rendered: exactly 1 before and after playback.
- Click-to-load: PASS. No YouTube request or embed URL exists before explicit Play.
- Initial autoplay: PASS. No autoplay and no external YouTube request occurs on page initialization; `autoplay=1` appears only on the post-click embed URL.
- Main Teaching Play: PASS with Enter and Space. With no explicit selection it resolves to the first verified playable item.
- Feed-row Play: PASS with pointer, Enter, and Space for the verified row. Unavailable controls cannot load a different item.
- Previous: PASS. It follows playable feed order and wraps according to the existing convention. With one verified item it remains on that item.
- Next: PASS with the same behavior.
- Active metadata: PASS. Highlight and feed share stable item IDs and the same JSON order/title/description/channel/date/image/video mapping in Next and static runtimes.
- Previous-video stop/replacement: the adapter removes the active iframe source before a different item can load and maintains one iframe. A live multi-video replacement could not be observed because only one title is verified.
- Duplicate audio: PASS by the single-iframe lifecycle and route/page-hide teardown.
- Error state: typed and unit-tested; it clears the active source and preserves selected metadata in the existing status region.
- Local beta copy: corrected in its existing location to disclose click-triggered YouTube media while excluding AI processing, analytics, uploads, and persistence.
- Data sent to YouTube: verified ID plus embed control parameters only. No profile, prayer, Scripture, recommendation, reflection, or private note enters the URL.

## Accessibility and responsive result

- Keyboard: PASS for main Play, feed Play, Previous, and Next; focus remains on the activated feed control and the iframe does not trap focus.
- Existing status region: assigned `role="status"` and `aria-live="polite"` non-visually in both runtimes.
- Iframe: specific title, `allowfullscreen`, strict referrer policy, and only the approved permissions.
- Focused Axe: PASS with zero violations across desktop/mobile before playback and with the active player. Axe 4.12.1 left only manual `color-contrast` checks over image backgrounds and the expected cross-origin `frame-tested` check; the complete artifact is `focused-axe-audit.json`.
- Viewports: 1536x1024, 1440x900, 1280x800, 1024x768, 768x1024, and 390x844 in the focused player suite; the Today parity suite also passed its six protected viewport definitions, including 360x800.
- 200% browser scale: PASS.
- Panel sizing: PASS; iframe remains within the existing Teaching media shell and panel.
- Horizontal overflow: PASS at every focused viewport.
- Local notice/control overlap: no overlap observed in responsive screenshots or geometry assertions.

## Executable verification

- Focused units: PASS, 7/7.
- Full unit suite: PASS, 281 passed and 1 pre-existing skip across 40 files.
- Focused Next browser suite: PASS, 9/9 using installed stable Chrome with deterministic YouTube interception.
- Static rollback browser suite: PASS, 1/1.
- Full cross-route browser suite: PASS, 29/29 across the canonical Next runtime and opt-in static rollback test using installed stable Chrome.
- Browser console errors: 0.
- Page errors: 0.
- Failed requests: 0 in the focused deterministic run.
- HTTP/asset errors and 404s: 0 in the focused deterministic run; canonical media HEAD/Range/cache/not-found behavior also passed the cross-route suite.
- Lint: PASS.
- Typecheck: PASS.
- Production build: PASS with deterministic build identity generated from current runtime sources.
- Today static-to-Next screenshot/DOM/class/asset/action parity: PASS, 4/4 tests across six parity viewports.
- Visual contract: PASS; 210 protected files, 12 owner references, 1,015 DOM classes, 525 IDs, 1,156 CSS classes, and 34 animation names.
- Immutable baselines: PASS; 72 screenshots and 12 desktop DOM snapshots remain byte-identical.
- TIG contract: PASS.
- Recovery verification: PASS.
- Build client-boundary scans: PASS for TIG, Scripture, safety, Teo Guide, live AI, and retrieval.
- Repository release accessibility evidence gate: inherited BLOCKED state remains (`216` cells, `0` parity failures, `54` inherited missing-name findings, `216` inherited aria-hidden-focusable findings). This task did not weaken or rewrite that evidence; the focused playback Axe audit itself is PASS.
- Default `npm run test:e2e`: the bundled Chromium headless-shell failed to initialize on Windows with `Invalid file descriptor to ICU data received`. The identical committed suite passed serially using installed stable Chrome 150. This is a local Playwright-binary/toolchain limitation, not an application assertion failure.

## Evidence paths

- Owner/before reference: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/owner-reference.png`
- After, before playback: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/after-initial-desktop.png`
- Selected feed / active player: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/after-active-player-desktop.png`
- Feed controls close-up: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/feed-mapping-and-controls.png`
- Main Play before consent: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/main-player-before-consent.png`
- Main player active: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/main-player-after-consent.png`
- Mobile active player: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/mobile-active-player.png`
- Side-by-side: `docs/owner-approvals/functional/evidence/TEOYUBE-FUNCTIONAL-2026-07-30-TODAY-YOUTUBE-PLAYBACK-001/owner-reference-vs-implementation.png`

The player body shown in active-player evidence is an explicitly labeled deterministic intercepted test response. The asserted iframe URL is the real privacy-enhanced official-video embed URL; no public network is used by unit/browser tests.

## Remaining limitations, cleanup, and rollback

- Historical product limitation (superseded by the 2026-07-31 owner-directed mapping addendum): only one exact-title match was exposed in the original delivery.
- Accessibility evidence limitation: cross-origin iframe internals and image-background contrast require manual review; Axe reports no scoped violations.
- Temporary files: disposable Playwright configs/scripts/results and parity candidates are removed before final handoff; only the reviewed evidence above remains tracked.
- Worktree: required to be clean after the final test commit and post-commit verification.
- Rollback: `git revert --no-edit 9169efb^..HEAD` (run from a clean worktree). This reverts the three focused task commits without rewriting history.
- Push/deploy: not performed.
