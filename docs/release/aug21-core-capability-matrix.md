# August 21 Core Capability Matrix

Authorization: `TEOYUBE-POST-LAUNCH-CAPABILITY-COMPLETION-2026-08-21-001`

All 20 approved safe-core capabilities are implemented and exercised without live AI, vector retrieval, research collection, database persistence, or managed memory. “Local continuity” means reversible, user-controlled session state and export/delete controls; it does not claim durable browser or server persistence.

| Capability | Entry and action | State/output | Scripture / TIG | Keyboard/mobile/fallback | Evidence | Result |
| --- | --- | --- | --- | --- | --- | --- |
| Today | `/`; Generate Today | in-memory daily card | yes / yes | passed / passed / deterministic | Today model, playback, daily loop, live smoke | PASS |
| Guided daily loop | `/`, `/journey`; Continue, revisit, skip, undo | staged in-memory journey | yes / yes | passed / passed / reversible | daily-spiritual-loop Playwright | PASS |
| Search | `/search`; query + Enter | session-only results | yes / yes | passed / passed / local search | search service/parity and live smoke | PASS |
| Promise Search | `/promise-search`; Search Teoyube | session-only promise results | yes / yes | passed / 6 viewports / deterministic API | focused route and API checks | PASS |
| Canon | `/canon`; browse/search/select | session selection and canon rows | yes / yes | passed / passed / repository fallback | Canon, ARIA and playback tests | PASS |
| Promise Table | `/promise-table`; add/update/remove/save/pray | reversible session rows | yes / yes | passed / passed / local repository | foundation and playback tests | PASS |
| Daily Word | `/daily-word`; Generate Journey | daily word, Scripture, promise, action | yes / yes | passed / passed / deterministic | API functional smoke and route suite | PASS |
| Prayer | `/prayer`; enter need and ask companion | prayer, Scripture, journal prompt; no raw durable write | yes / yes | passed / passed / deterministic | contracts and daily loop | PASS |
| Calling Compass | `/calling-compass`; Start Compass | cautious session result | yes / yes | passed / passed / deterministic | keyboard, responsive, playback | PASS |
| Journey | `/journey`; accept/revisit/skip/undo | reversible progress | yes / yes | passed / passed / safe defaults | daily loop and navigation tests | PASS |
| Journal | `/journal`; Add Reflection | sanitized in-memory entry | yes / indirect | passed / passed / no persistence | contracts and daily loop | PASS |
| Reflection | `/journal`; reflect and review | testimony-candidate handoff | yes / indirect | passed / passed / reversible | daily loop | PASS |
| Testimony candidate | `/testimony`; save/export/delete/undo | candidate, never asserted fulfillment | yes / indirect | passed / passed / JSON export | functional and visual suites | PASS |
| Book of the Saint | `/book`; add reviewed item/remove/undo | session Book item | yes / yes | passed / passed / reversible | daily loop and Book checks | PASS |
| Lexicon | `/lexicon`; search/select | word, meaning, references | yes / yes | passed / passed / local corpus | ARIA and responsive tests | PASS |
| Exact WEB Scripture | `/api/teoyube/scripture`; get/search/context/validate | validated verse text and citations | source / n/a | n/a / API-safe / validation errors | exact Scripture tests and Production request | PASS |
| TIG | integrated surfaces; inspect why | scored paths, confidence, limits | anchors / source | passed / passed / deterministic | TIG recovery and Teo Guide gates | PASS |
| Deterministic Teo Guide | `/teo-guide`; prompt + Enter | sourced deterministic response; no durable write | yes / yes | passed / passed / live-provider-off fallback | 49 tests and Production functional smoke | PASS |
| Local continuity | journey/journal/testimony/book/settings controls | session state, export, delete, undo | varies / varies | passed / passed / safe reset on refresh | daily loop and back/forward/refresh | PASS |
| Static rollback | `npm run rollback:start` | static protected runtime | bundled / deterministic | passed / passed / rollback itself | 83-check dual-runtime verifier | PASS |

Notes:

- The 23 canonical routes and 9 required stylesheet endpoints returned successfully on exact-commit Preview and Production.
- Repository Playwright evidence covered functional interaction, state transitions, keyboard behavior, mobile viewports, direct entry, back/forward and refresh. The in-app browser could not initialize because of a Windows ACL sandbox failure; this is an evidence-tool limitation, not an HTTP-only completion claim.
- Protected visual source checks passed: 268 source files, 210 protected files, 72 screenshots and 12 desktop DOM snapshots. No protected source or baseline was changed.
