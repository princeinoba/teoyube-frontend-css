# Phase 3 Intelligent Architecture Integration Map

Status: In progress - code-aware engine integration started

This map records the real project surfaces found before adding Phase 3 integration code. Phase 3 should integrate with these assets instead of creating a second Teoyube system beside them.

## Actual Data Files Found

- `src/data/coreTeoyubeVocabulary.json`: 72 vocabulary records with word, meaning, category, Scripture sources, promise category, prayer use, animation symbol, and related words.
- `src/data/promiseClusters.json`: 12 rich promise clusters with ids, titles, themes, Scripture references, core words, prayer sequences, declarations, calling connections, and journey status options.
- `src/data/scriptureCanon.json`: 108 WordCard-style Scripture/word records with Scripture references, themes, promise statements, archetype links, path links, cluster links, prayer use, and graph tags.
- `src/data/kingdomArchetypes.json`: 24 calling/archetype records with core words, primary clusters, paths, scriptural models, and manifestation goals.
- `src/data/prayerEngineTemplates.json`, `src/data/prayerJourneys.json`, and `src/data/prayerRecommendationMap.json`: prayer templates, journeys, and recommendation maps.
- `src/data/graphRelationships.json`: 132 relationship records connecting words, paths, clusters, Scriptures, and graph concepts.
- `teoyube-app/data/*.json`: live app copies of words, promise clusters, Scripture canon, archetypes, prayers, graph relationships, and other MVP data.

## Actual Data Shapes Observed

- Core vocabulary shape: `word`, `pronunciation`, `meaning`, `category`, `scripture_sources`, `promise_category`, `prayer_use`, `animation_symbol`, and `related_words`.
- Promise cluster shape: `cluster_id`/`id`, `title`/`name`, `theme`, `description`, `promise_category`, `scripture_references`, `anchorScripture`, `anchor_scripture`, `keywords`, `coreWords`, `core_words`, `related_teoyube_words`, `prayerSequence`, `prayer_sequence`, `declaration`, `calling_connection`, and journey/status fields.
- Scripture canon shape: `id`, `teoyubeWord`, `word`, `meaning`, `category`, `scriptureReferences`, `scriptureThemes`, `promiseStatement`, `archetypeLinks`, `pathLinks`, `clusterLinks`, `prayerUse`, and `graphTags`.
- Calling/archetype shape: `id`, `name`, `teoyubeWord`, `category`, `identityStatement`, `primaryCluster`, `primaryPath`, `scripturalModels`, `coreWords`, and `manifestationGoal`.

## Actual TIG Files Found

- `src/lib/tig/types.ts`: canonical TIG node and relationship contracts.
- `src/lib/tig/seed/*`: typed seeds for words, Scriptures, promise categories, promise clusters, callings, journeys, prayer sequences, relationships, action steps, and more.
- `src/lib/tig/query.ts`: seed query client for nodes and relationships.
- `src/lib/tig/graph-engine.ts`, `traverse.ts`, `graph-visualization.ts`: graph resolution, traversal, and visualization support.
- `src/lib/tig/promise-search.ts`: existing promise-search intelligence.
- `src/lib/tig/calling-compass.ts`: existing calling compass intelligence.
- `src/lib/tig/prayer-generator.ts`: existing Scripture-anchored prayer generation.
- `src/lib/tig/production-ui-adapter.ts` and `production-surface-adapters.ts`: existing UI adapter helpers for production TIG responses.

## Actual Components Found

- `teoyube-app/components/WordCard.tsx`: renders a loose `word` object with meaning, category, promise statement, and Scripture references.
- `teoyube-app/components/PrayerCompanion.tsx`: client component calling `/api/ai/companion` and rendering cluster, response, Scripture anchor, prayer, journal prompt, confidence, fallback, safety, and explanation path.
- `teoyube-app/components/compass/CompassExperience.tsx`: client YouTube/search-oriented compass surface.
- `teoyube-app/src/components/tig/TIGResponsePanel.tsx`: production-aware TIG response panel with Scripture, explanation, graph, confidence, fallback, safety, and decision trace support.
- `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`: local seed graph explorer using `getTIGSeedGraph`, `getTIGSeedSummary`, and traversal visualization.

## Features Already Present

- TIG seed graph, typed node contracts, graph query, traversal, confidence, graph visualization, production response validation, fallbacks, guardrails, personalization, support/post-launch architecture, and UI adapters.
- Live Next app data imports via `teoyube-app/lib/teoyubeData.ts`.
- Existing Promise, Calling, Prayer, WordCard, and TIG UI surfaces.

## Engines Already Present

- Existing Promise/Search logic: `src/lib/tig/promise-search.ts`.
- Existing Calling logic: `src/lib/tig/calling-compass.ts`.
- Existing Prayer logic: `src/lib/tig/prayer-generator.ts`.
- Existing graph/query logic: `src/lib/tig/query.ts`, `src/lib/tig/seed/index.ts`, and `src/lib/tig/graph-engine.ts`.

## Integration Targets

- Theology Framework integrates with TIG guardrails, Scripture anchor validation, explanation path validation, promise interpretation boundaries, and response/adapters.
- Data Access integrates with existing JSON files and safely normalizes inconsistent field names without changing source data.
- Promise Engine integrates with `src/data/promiseClusters.json`, `src/data/scriptureCanon.json`, TIG promise cluster seeds, and TIG graph relationships.
- Calling Engine integrates with `src/data/kingdomArchetypes.json`, TIG calling seeds, `src/lib/tig/calling-compass.ts`, and `CompassExperience`.
- Teoyube Language Engine integrates with `src/data/coreTeoyubeVocabulary.json`, `src/data/scriptureCanon.json`, TIG word seeds, `WordCard`, and `TIGResponsePanel`.
- Promise Table integrates with existing promise clusters, vocabulary words, Scripture references, calling/archetype links, prayer links, and TIG relationships.

## Files To Patch Or Add

- Add `src/lib/teoyube/theology/theology-framework.ts`.
- Add `src/lib/teoyube/data/teoyube-data-access.ts`.
- Add `src/lib/teoyube/promises/promise-engine.ts` and `src/lib/teoyube/promises/promise-table.ts`.
- Add `src/lib/teoyube/calling/calling-engine.ts`.
- Add `src/lib/teoyube/language/teoyube-language-engine.ts`.
- Add adapters under `src/lib/teoyube/adapters`.
- Add integration validation under `src/lib/teoyube/integration`.
- Add `src/lib/teoyube/index.ts` and examples under `src/lib/teoyube/examples`.
- Add Phase 3 docs and update roadmap/status files.

## Files Not To Duplicate

- Do not duplicate or replace `src/lib/tig/promise-search.ts`, `src/lib/tig/calling-compass.ts`, `src/lib/tig/prayer-generator.ts`, TIG seed files, or existing React components.
- Do not create a second live AI layer, analytics layer, database persistence layer, service worker, or user-contact workflow.
- Do not rewrite `WordCard`, `PrayerCompanion`, `CompassExperience`, `TIGResponsePanel`, or `TIGGraphExplorer` in Phase 3.1; use adapters that can feed them better structured props later.

## Phase 3.1 Boundary

Phase 3.1 starts the code-aware engine integration layer. It maps existing data and engines, validates anchoring, and prepares stable adapter payloads. Connecting those adapter payloads directly into live UI components is the next step: Phase 3.2 - Connect Integrated Engines to Live UI Components.
