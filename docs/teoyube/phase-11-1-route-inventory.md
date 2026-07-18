# Phase 11.1 Route Inventory

The current runnable app is a static single-page app. Routes are hash/static views, not Next.js routes.

| View | Source | Status | Notes |
| --- | --- | --- | --- |
| `#today` | `index.html#today` | Implemented | Daily journey, word, assignment, reflection, media preview |
| `#roadmap` | `index.html#roadmap` | Implemented | Static roadmap data and generated UI panels |
| `#search` | `index.html#search` | Implemented | Local promise search, save to Book, add to Promise Table |
| `#canon` | `index.html#canon` | Implemented | Canon tabs, cards, carousel, pagination, detail rail |
| `#table` | `index.html#table` | Implemented | Promise Table/media hybrid with local preview fallback |
| `#calling` | `index.html#calling` | Implemented | Compass panel, local media previews, calling copy |
| `#book` | `index.html#book` | Implemented | Session Book timeline, filters, stats |
| `#lexicon` | `index.html#lexicon` | Implemented | Word grid, filters, featured word/detail behavior |
| `#testimony` | `index.html#testimony` | Implemented | Local testimony form/list; user-recorded-only boundary |
| `#guide` | `index.html#guide` | Implemented | Local Teo Guide chat responses |
| `#ui-elements` | `index.html#ui-elements` | Implemented | Embedded video library using local preview records |
| `#teoyube-tables` | `index.html#teoyube-tables` | Implemented | Paginated table with local media source-disabled state |

## Local Endpoints

| Endpoint | Status | Behavior |
| --- | --- | --- |
| `/api/promises/seed` | Implemented | Returns local seed promise data from `scripts/seedDB` fallback |
| `/api/youtube/teoyube` | Implemented as compatibility fallback | Returns local TeoyubeWorld preview records only; no external lookup |

## Missing Next Routes

No `teoyube-app` directory exists in this workspace, so `/dashboard`, `/daily-word`, `/prayer`, `/journal`, `/personalization`, `/settings`, `/tig`, and `/graph` are not real file-system routes here. Their current functionality is represented inside static views and Phase 11.1 smoke support.
