# Tables dual-container TeoyubeWorld playback closeout

## Decision and scope

- Status: **PASS**.
- Approval: `TEOYUBE-FUNCTIONAL-2026-08-01-TABLES-DUAL-VIDEO-PLAYBACK-001`.
- Approved by: Prince Okiemute Inoba, Teoyube Project Owner.
- Branch: `recovery/visual-source-of-truth`.
- Starting HEAD: `6f6491dca00fa166ff5c5af3cebf4658507acc0f`.
- Final HEAD: the focused commit containing this report; the exact SHA is recorded in the handoff.
- Approved execution timestamp: `2026-08-01T20:13:40-04:00`.
- Verification completed: `2026-08-01T21:25:44-04:00`.
- Route: `/tables`; static rollback hash: `#teoyube-tables`.

## Implementation result

The existing compact left preview and large right Airplay container now use one verified, dependency-free click-to-load adapter in both Next and the static rollback runtime. Each container reads and preserves its own stable media ID. The Airplay arrows change only the Airplay selection and unload only its iframe; compact playback and selection remain unchanged.

The current row data assigns the same verified record to both presentations on initial expansion. That existing assignment is preserved, but the players are independent after rendering. No YouTube request is made before a user activates Play. Production constructs only privacy-enhanced `youtube-nocookie.com/embed/{verified-id}` URLs from the local validated feed; no API key, analytics integration, arbitrary iframe URL, or automatic playback was added.

## Verified official-channel mapping

| Stable ID | Tables title | Video ID |
| --- | --- | --- |
| `local-seed-of-promise` | The Seed of Promise | `4zM2olpouIo` |
| `local-power-of-prayer` | The Power of Prayer | `yLBb7JCMqJE` |
| `local-walk-in-purpose` | Walk in Divine Purpose | `yDu0bD1lukE` |
| `local-rooted-in-truth` | Rooted in His Word | `tnjdlvbaBY8` |
| `local-called-for-more` | Called for More | `chLnoAGxyrc` |
| `local-strength-for-today` | Strength for Today | `jAmIjP7-T5w` |
| `local-promise-language` | Promise Language and Calling | `I8Y3syhDG64` |
| `local-daily-assignment` | Daily Divine Assignment | `YY9VYdPUVf8` |

Official channel: `https://www.youtube.com/channel/UCxG1guesWqO69QK022fyp2w`.

## Executable evidence

- Unit: **PASS**, 41 files passed / 1 skipped; 287 tests passed / 1 skipped. The focused contract validates all eight exact IDs, channel ownership, privacy-enhanced embed URLs, and rejection of malformed feeds.
- Typecheck: **PASS**.
- Lint: **PASS**, zero warnings.
- Architecture/imports: **PASS**; the shared media contract removed the forbidden cross-feature dependency and preserves the Promise Table public wrapper.
- Build: **PASS**, Next 16.2.11, 58 routes; TIG, Scripture, safety, Teo Guide, live-AI, and retrieval bundle boundaries passed.
- Focused browser: **PASS**, Next `1/1` and static `1/1`. It proves click-to-load, compact keyboard activation, exact source/title binding, independent Airplay navigation, and independent simultaneous iframe state.
- Accessibility: **PASS**, keyboard Space activation retained and focused Axe found 0 serious or critical WCAG 2/2.1 A/AA violations in the expanded row.
- Complete browser audit: 40/42 passed at four workers; the two unrelated Today shared-state cases then passed `2/2` serially. The earlier accidental 12-worker diagnostic produced resource-contention timeouts and is not treated as authoritative.
- Recovery: **PASS**: 268 protected-source entries, 210 visual files, 12 owner references, 72 immutable screenshots, 12 immutable DOM snapshots, 60 support-route screenshots, and 54 Next-support captures verified unchanged.
- Runtime candidate contract: **PASS**; deterministic build ID `teoyube-27236e410b105c3cf85892ba`, static rollback retained.

## Visual, security, and regression accounting

- CSS, markup templates, IDs, class lists, images, audio behavior, table structure, search/filter/sort, row expansion, pagination, and management-table behavior changed: **0**.
- Immutable screenshots/DOM baselines changed: **0**.
- Owner-approved support baselines changed: **0**.
- Protected static bootstrap changed only under the functional approval: `embedded-videos.js`; its exact fingerprints and derived runtime binding were updated. No baseline was regenerated.
- New iframe attributes are non-rendering accessibility/security attributes: title, allow policy, strict-origin referrer policy, and fullscreen capability.
- Live AI, embeddings, vector retrieval, broad RAG, persistence, push, and deployment were not enabled or performed.

## Remaining limitation and rollback

Deterministic browser tests intercept the exact privacy-enhanced embed request; public playback still depends on YouTube availability and each video retaining embed permission. The repository's pre-existing high-severity development-dependency advisory remains unchanged; no dependency version was changed in this task.

Rollback is an exact restore of the files listed in the final handoff plus removal of the task's newly added player, shared contract, tests, approval, and evidence files. No automatic rollback was performed.
## All-row expansion and playback remediation

- Remediation starting HEAD: `af6821a665f460e70cc3f0cbe809021c9c5058fa`.
- Verified at: `2026-08-02T00:40:37-04:00`.
- Root cause: the canonical Next controller assumed every main row already had a following detail row. The approved initial capture contains detail markup for only four rows, so later rows could toggle their main-row class but could not reveal either player. Filtering could also mistake the next main row for a detail row.
- Repair: 24 exact canonical static row-detail states are now retained in a separate generated module. The controller inserts only the matching approved detail row when a collapsed row is first expanded and thereafter toggles that row safely. No protected generated markup, CSS, static source, baseline, asset, class, or ID changed.
- Playback: all 24 rows across three pages expose the compact and Airplay players, producing 48 verified Play controls. Each initial row assignment follows the existing eight-item official-channel mapping by stable row index. Airplay navigation remains independent of compact playback.
- Focused browser: **PASS 2/2**; the all-row case verifies 24 row details, all 48 Play actions, exact `youtube-nocookie.com` video IDs, adjacent-row integrity, and search restoration.
- Static rollback browser: **PASS 1/1**.
- Focused unit: **PASS 9/9**; full unit: **PASS 287/287 with one existing skipped test**.
- Complete browser audit: Tables passed within the 39/40 four-worker run. One unrelated Today external-request assertion failed under concurrency and its complete file then passed **9/9** serially; three conditional static cases were skipped in the combined run and the focused static Tables case passed separately.
- Typecheck, lint, build, TIG/Scripture/safety/live-AI/retrieval bundle boundaries: **PASS**.
- Complete recovery contract: **PASS**; 72 immutable screenshots, 12 immutable DOM snapshots, 60 owner-approved support screenshots, and 54 Next-support captures remain unchanged.
- Deterministic build ID: `teoyube-2f1056fbac6d9e0f1fc2049a`.
- Protected visual files changed in this remediation: **0**.
- Rollback: revert the focused remediation commit after it is recorded; the prior dual-container implementation remains available at `af6821a665f460e70cc3f0cbe809021c9c5058fa`.

## Live iframe navigation remediation

- Remediation starting HEAD: `d809ced1dbc7f8e506c57e6117865ece6cefc301`.
- Verified at: `2026-08-02T09:07:02.9133614-04:00`.
- Root cause: after removing the approved placeholder `srcdoc`, the player left `loading="lazy"` on the iframe. Chrome accepted the new YouTube URL attribute but retained an `about:blank` child frame and made no provider request. The earlier mocked browser assertion checked only the `src` attribute, so it could pass without playback.
- Repair: the click-to-load adapter now removes lazy loading before the first verified `src` assignment, registers load/error state handlers before navigation, and restores lazy loading only when a player is stopped. Markup, CSS, feed IDs, official-channel mappings, row state, and adjacent Tables controls are unchanged.
- Provider validation: YouTube oEmbed returned HTTP 200 for all eight configured video IDs and identified every author as TeoyubeWorld.
- Deterministic browser regression: **PASS 2/2**; all 24 rows and 48 controls now produce 48 intercepted embed-document requests, rather than merely changing iframe attributes.
- Live provider playback: **PASS 16/16**; each of the eight videos loaded in both compact and Airplay containers, exposed `readyState: 4`, reported no player error, and advanced media time with `paused: false`.
- Typecheck, lint, unit, build, TIG/Scripture/safety/live-AI/retrieval bundle boundaries: **PASS**.
- Deterministic build ID: `teoyube-31f851e837cd35a81819b6e1`.
- Protected visual files, immutable baselines, owner-approved support baselines, CSS, markup, assets, IDs, and class lists changed: **0**.
