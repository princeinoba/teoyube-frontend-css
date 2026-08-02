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
