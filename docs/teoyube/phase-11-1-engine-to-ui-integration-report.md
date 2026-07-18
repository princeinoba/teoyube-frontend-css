# Phase 11.1 Engine-To-UI Integration Report

## Current Runtime Integration

The runnable app is static and cannot import TypeScript modules directly at runtime. Visible UI behavior is therefore powered by `app.js` local adapters plus JSON loaded from `src/data/**`.

| Surface | Runtime integration | Safety status |
| --- | --- | --- |
| Daily journey | `generateJourney()`, `pickCluster()`, `generateTeoyubeWord()`, `getDailyAssignment()` | Local only, Scripture references visible |
| Purpose/onboarding | `saveAssessment()`, `analyzeCalling()` | Session-only profile preview; cautious calling language |
| Promise Search | `runSearch()` and local word/promise matching | Shows Scripture anchors, prayer, assignment, safe explanation copy |
| Calling Compass | `analyzeCalling()`, compass UI, local media adapter | No certainty claims; media source disabled |
| Teo Guide | `askTeo()`, `buildTeoResponse()` | Local Scripture-grounded response; no live AI |
| Book of the Saint | `state.book`, `renderBook()` | Session-only activity/reflection/testimony entries |
| Testimony | `addTestimony()` | User-recorded only; no auto-fulfillment |
| Canon/Lexicon | JSON-backed renderers | Real local data and safe fallbacks |
| Embedded media | local media library + source-disabled notice | No external fetch or embed |

## TypeScript TIG Layer

The TypeScript layer under `src/lib/tig` and `src/lib/teoyube` is source-available and the Phase 11.1 smoke support uses it to verify:

- canonical data helpers
- major TIG production surfaces
- response panel props
- graph panel props
- explanation panel props
- session journal/activity/onboarding helpers
- safety, fallback, Scripture, and confidence state

This is compile/source verification in the current workspace because no TypeScript compiler dependency is installed at the root.

## Gap

A future Phase 11.2 can either keep improving the static app or restore a real `teoyube-app`/Next product. Until then, API routes are documented as pending and local client adapters are the real product path.
