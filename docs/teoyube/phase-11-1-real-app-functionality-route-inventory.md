# Phase 11.1 - Real App Functionality Route Inventory

## Corrected App Detection

The current runnable app is the repository-root static app. `teoyube-app` is not present, so `/dashboard`, `/daily-word`, `/prayer`, `/journal`, `/personalization`, `/settings`, `/tig`, and `/graph` are not real file-system routes in this workspace.

## Static Views

| View | Hash route | Primary surface | Runtime status |
| --- | --- | --- | --- |
| Today | `#today` | Daily word, assignment, featured media, promise animation | Runtime reachable |
| Roadmap | `#roadmap` | Implementation roadmap and current static/future product map | Runtime reachable |
| TeoyubeSearch | `#search` | Promise search cards, Scripture badges, journey actions | Runtime reachable |
| Canon | `#canon` | Canon journeys, Scripture-rooted cards, graph-like explanations | Runtime reachable |
| Promise Table | `#table` | Promise rows, featured promise flow, calling/promise context | Runtime reachable |
| Calling Compass | `#calling` | Local media preview, calling compass, prayer/action prompts | Runtime reachable |
| Book of the Saint | `#book` | Session-style reflections and promise discoveries | Runtime reachable |
| Lexicon | `#lexicon` | Word list, Scripture badges, grammar architecture | Runtime reachable |
| Testimony | `#testimony` | Testimony form and local/static archive examples | Runtime reachable |
| Teo Guide | `#guide` | Local Scripture-grounded guidance preview | Runtime reachable |
| UI Elements | `#ui-elements` | UI component catalogue | Runtime reachable |
| Tables / Embedded Videos | `#teoyube-tables` | Local preview media and table demos | Runtime reachable |

## Local Endpoints

| Endpoint | Behavior |
| --- | --- |
| `/api/promises/seed` | Serves local seed promise data from the repository |
| `/api/youtube/teoyube` | Compatibility endpoint returning local TeoyubeWorld preview records only |

## Route Fixes

- Startup now selects the correct static view from the URL hash.
- Unknown hashes safely fall back to `#today`.
- Hash changes update the active view and sidebar state.
- External media route behavior is replaced with local source-disabled notices.
