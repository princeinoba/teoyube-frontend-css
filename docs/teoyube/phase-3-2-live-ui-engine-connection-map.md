# Phase 3.2 Live UI Engine Connection Map

Status: Complete - live UI engine wiring complete

This map records the real UI surfaces inspected before Phase 3.2 component wiring. The goal is to connect the Phase 3.1 engines and adapters to live UI without duplicating components or replacing existing TIG behavior.

## Components Found

- `teoyube-app/components/WordCard.tsx`: server-compatible card that accepts a loose `word` prop and displays meaning, category, promise, and Scripture references.
- `teoyube-app/components/PrayerCompanion.tsx`: client component with a message form and reply panel. It previously posted to `/api/ai/companion`.
- `teoyube-app/components/compass/CompassExperience.tsx`: client component with video search UI and existing `/api/youtube/teoyube` lookup.
- `teoyube-app/src/components/tig/TIGResponsePanel.tsx`: client TIG response panel with production insights, confidence, fallback, Scripture, decision trace, graph preview, and save/journal controls.
- `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`: client graph explorer using local TIG seed graph, traversal visualization, node filters, relationship details, and connected-node browsing.
- `teoyube-app/components/ExploreTabs.tsx`: existing explore surface for words, clusters, paths, archetypes, Scripture, glyphs, destiny, and graph relationships.

## Component Props Observed

- `WordCard({ word })`: accepts legacy JSON records from words or Scripture canon.
- `PrayerCompanion()`: no props; owns form state and reply state.
- `CompassExperience()`: no props; owns video, loading, error, and selection state.
- `TIGResponsePanel(props)`: requires `response`, optional `request`, selected word/cluster ids, surface, context, debug/graph flags, and session/user ids.
- `TIGGraphExplorer({ className })`: optional CSS class only.
- `ExploreTabs({ data })`: receives legacy app data from `teoyube-app/lib/teoyubeData.ts`.

## Current Data Sources

- Word and explore cards currently use `teoyube-app/data/*.json` through `teoyube-app/lib/teoyubeData.ts`.
- TIG panels already use `src/lib/tig` seed graph and production helpers.
- Phase 3 engines use `src/data/coreTeoyubeVocabulary.json`, `src/data/promiseClusters.json`, `src/data/scriptureCanon.json`, and TIG seeds through `src/lib/teoyube`.
- PrayerCompanion previously depended on an app API call for companion replies.
- CompassExperience keeps existing video lookup behavior, but Phase 3.2 engine context does not require it.

## Adapter Or Engine Feed

- WordCard: `createWordCardAdapterProps()` and `createWordCardContext()`.
- PrayerCompanion: `createPrayerCompanionAdapterContext()` plus Theology Framework boundaries.
- CompassExperience: `createCompassExperienceAdapterContext()` and Calling Engine path explanation.
- TIGResponsePanel: `createTigResponsePanelAdapterContext()` with Promise/Language context and existing TIG production input.
- TIGGraphExplorer: `createTigGraphExplorerAdapterContext()` and `createPromiseTable()`.
- Promise preview: `createPromiseTable()` and Promise Table filters.

## Patch Plan

- Patch `WordCard` to keep legacy props while enriching from the Language Engine when an id or word can be resolved.
- Patch `PrayerCompanion` to use local Promise/Theology adapter context instead of requiring live AI orchestration.
- Patch `CompassExperience` to display Calling Engine context and safe fallback guidance while preserving existing media search behavior.
- Patch `TIGResponsePanel` to show integrated word/promise Scripture anchors and explanation path context.
- Patch `TIGGraphExplorer` to expose a readable Promise Table preview alongside seed graph data.
- Patch `ExploreTabs` with a Promise Table preview connection point.
- Add hooks under `src/lib/teoyube/hooks` for client surfaces.
- Add a lightweight Promise Table preview component under `src/components/teoyube`.

## Files Not To Duplicate

- Do not duplicate `WordCard`, `PrayerCompanion`, `CompassExperience`, `TIGResponsePanel`, `TIGGraphExplorer`, TIG seed graph modules, Promise Engine, Calling Engine, Language Engine, or Theology Framework.
- Do not replace the existing production TIG response logic.
- Do not add live AI orchestration, database persistence, analytics, browser persistence, service workers, URL fetching helpers, or automatic user contact.

## Risks Found

- `PrayerCompanion` had an API-driven reply path; Phase 3.2 should make local Scripture-anchored context available without live AI.
- `CompassExperience` has existing video lookup behavior; the Calling Engine connection should not depend on that request succeeding.
- App data under `teoyube-app/data` and source data under `src/data` use overlapping but not identical shapes; UI wiring should keep legacy prop support.
- Full type/build verification is currently dependency-blocked because `node_modules`, local `tsc`, and local `next` are missing.

## What Remains For Phase 3.3

- Replace remaining mock/static display assumptions with typed data contracts.
- Harden cross-data mapping between `teoyube-app/data` and `src/data`.
- Add UI regression checks for WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, TIGGraphExplorer, and Promise Table preview.
- Re-run full typecheck, lint, build, and test after dependencies are restored.
