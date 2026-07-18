# Phase 11.1 Advanced Real App Productization Map

Current milestone: TEOYUBE Phase 11 - Advanced Real App Productization, Interactive Feature Integration & End-to-End Functionality Hardening.

Current step: Phase 11.1 - App Productization Audit, Engine-to-UI Wiring, Button Behavior Completion & Advanced Usable Experience Build.

## Detected App

| Item | Current workspace reality |
| --- | --- |
| App root | Repository root `.` |
| Runnable framework | Static HTML/CSS/JS served by `server.js` |
| Running URL | `http://127.0.0.1:4173` |
| Next app | `teoyube-app` is not present in this workspace |
| Package manager | npm |
| Package scripts | `start`, seed scripts only |
| TypeScript config | No root `tsconfig.json` detected |
| Build/lint/test scripts | Not present |

## Product Surface

The current app is `index.html` + `app.js` + `styles.css`. It renders the premium left-sidebar Teoyube prototype with hash/static views:

- `#today`
- `#roadmap`
- `#search`
- `#canon`
- `#table`
- `#calling`
- `#book`
- `#lexicon`
- `#testimony`
- `#guide`
- `#ui-elements`
- `#teoyube-tables`

Phase 11.1 added hash-route repair so direct links and sidebar navigation resolve through `setView()`.

## Data And Engines

The static app loads canonical JSON from `src/data/**` and uses local JavaScript adapters for:

- Daily journey generation
- Purpose assessment/onboarding preview
- Promise search result generation
- Calling pattern analysis with cautious language
- Book of the Saint session entries
- Testimony session entries
- Teo Guide local Scripture-grounded responses
- Canon and Lexicon exploration
- Local media search with source-not-connected fallback

The TypeScript TIG/data layer remains in `src/lib/**`. A Phase 11.1 smoke layer validates that canonical data helpers, TIG production surfaces, response panels, graph panels, explanation paths, confidence, fallback, safety, and session helpers are represented without external services.

## Repairs Completed

- Confirmed `teoyube-app` is absent and stopped treating it as the real app root.
- Kept the static prototype as the product surface.
- Repaired hash routing for direct view navigation.
- Removed runtime browser persistence requirement from `app.js` state.
- Replaced public TeoyubeWorld/video lookup behavior with local preview records and clear source-disabled copy.
- Converted `server.js` `/api/youtube/teoyube` compatibility endpoint to local preview data only.
- Corrected Phase 11.1 smoke inventories to static views.
- Preserved Scripture anchors, cautious calling language, safety notices, confidence/fallback copy, and user-recorded testimony boundaries.

## Verification

| Check | Result |
| --- | --- |
| `npm run typecheck` | Missing script |
| `npm run lint` | Missing script |
| `npm run build` | Missing script |
| `npm run test` | Missing script |
| `node --check app.js` | Passed |
| `node --check server.js` | Passed |
| `GET http://127.0.0.1:4173` | HTTP 200 |

## Completion Status

Phase 11.1 is complete for the current static app surface: the app opens locally, main views render, key buttons have handlers or safe disabled states, real local data appears, session-only saves work, and external services remain disabled. Remaining work for Phase 11.2 should focus on interaction polish, accessibility hardening, mobile QA, and optionally reintroducing a real Next app only after its files exist again.
