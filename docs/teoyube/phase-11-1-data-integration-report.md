# Phase 11.1 Data Integration Report

## Runtime Data

`app.js` loads local JSON data with `fetch(..., { cache: "no-store" })` from `src/data/**`. Missing files use safe defaults instead of crashing.

| Data file | Used by |
| --- | --- |
| `coreTeoyubeVocabulary*.json` | Lexicon, Search, daily word support |
| `promiseClusters.json` | Today journey, Promise Search, Promise Table |
| `scriptureCanon.json` | Canon, Lexicon, Scripture anchors |
| `theologyConstitution.json` | Guardrail/safety language and promise level copy |
| `teoyubeSearchFramework.json` | Search intent support |
| `promiseCategories.json` | Promise/Search filters |
| `teoyubePromiseLanguageLexicon.json` | Lexicon grammar panel |
| `teoyubeCanonArchitecture.json` | Canon page summary/cards |
| `kingdomArchetypes.json` | Calling/canon archetype cards |
| `covenantPaths.json` | Canon journey cards |
| `prayerEngineTemplates.json` and `prayerJourneys.json` | Prayer/guide/canon copy |
| `tkos*.json` | Roadmap/dashboard panels |
| `glyphDefinitions.json` and `graphRelationships.json` | Lexicon/graph data inventory |

## TypeScript Data Access

`src/lib/teoyube/data-access.ts` provides normalized helpers for words, promises, Scripture, journeys, archetypes, prayer sequences, action steps, media records, and source summaries. The Phase 11.1 smoke checks use these helpers.

## Media Data Boundary

External TeoyubeWorld lookup has been replaced with local preview records. `/api/youtube/teoyube` remains only as a compatibility endpoint returning local records and `sourceStatus: "source_not_connected"`.

## Persistence

The visible app uses in-memory/session JavaScript state. It does not require `localStorage`, cookies, IndexedDB, database persistence, analytics, live AI, or external services.
