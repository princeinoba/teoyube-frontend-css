# Phase 11.1 - End-to-End User Flow Verification

## Verified Static-App Flows

| Flow | Current path | Status |
| --- | --- | --- |
| Open app | `http://127.0.0.1:4173/#today` | HTTP 200 and static view routing repaired |
| Daily Word | `#today` | Renders local data-backed word, Scripture badges, assignment, and source-safe media |
| Promise Search | `#search` | Renders local promise/journey cards with Scripture anchors and action buttons |
| Calling Compass | `#calling` | Uses local previews and cautious calling/action copy |
| Teo Guide | `#guide` | Uses local Scripture-grounded guidance preview with safe fallback boundaries |
| Promise Table | `#table` | Renders promise/calling context from local app data |
| Book / activity | `#book` | Shows session-style reflections, promise discovery, filters, and activity panels |
| Roadmap | `#roadmap` | Now labels the current runtime as static/local and future app plans as pending |

## Safety Boundaries

- No live AI orchestration is connected.
- No analytics are connected.
- No database persistence is connected.
- No external media or URL fetching is required for the visible app.
- Browser persistence for sensitive personalization is not used.
- Scripture anchors, explanation language, confidence labels, and fallback notices are preserved.

## Remaining Warnings

- Separate file-system routes for Prayer, Journal, Personalization, TIG Graph, and Settings are pending future productization.
- Current route equivalents are static hash views and local support modules, not Next.js routes.
- Full type/build/test verification is blocked by missing package scripts/tooling.
