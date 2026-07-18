# Phase 3.3 Mock Data Audit

Status: Complete - live mock/static data risks reviewed

This audit distinguishes live UI data that should be engine-driven from fixtures, examples, docs, and seed/test assets that can remain.

## Live UI Findings

| Path | Finding | Surface | Decision | Replacement |
| --- | --- | --- | --- | --- |
| `teoyube-app/app/page.tsx` | Hardcoded TIG selected word/cluster ids for Daily Word production surface | Live UI | Replaced | `createWordCardAdapterProps()` and `createPromiseRecommendationContext()` |
| `teoyube-app/app/page.tsx` | Fixed dashboard prayer/promise ids (`PR004`, `PC02`) | Live UI | Replaced | Daily word context now drives Promise Engine and PrayerCompanion adapter focus |
| `teoyube-app/app/prayer/page.tsx` | Hardcoded TIG selected word/cluster ids for Prayer production surface | Live UI | Replaced | `createPrayerCompanionAdapterContext()` |
| `teoyube-app/app/compass/page.tsx` | Hardcoded TIG selected word/cluster ids for Calling Compass production surface | Live UI | Replaced | `createCompassExperienceAdapterContext()` |
| `teoyube-app/app/explore/page.tsx` | Hardcoded TIG selected word/cluster ids for Canon and Promise Cluster surfaces | Live UI | Replaced | `createWordCardAdapterProps()` and `createPromiseRecommendationContext()` |
| `teoyube-app/components/WordCard.tsx` | Loose legacy `word: any` could silently miss engine context | Live UI | Hardened | WordCard now enriches through Language Engine adapter and flags missing anchors |
| `teoyube-app/components/PrayerCompanion.tsx` | Former live AI companion POST dependency | Live UI | Replaced | Local Promise/Theology adapter context |
| `teoyube-app/components/compass/CompassExperience.tsx` | Calling context previously not engine-driven | Live UI | Hardened | Calling Engine context shown beside existing media search |
| `src/components/teoyube/PromiseTablePreview.tsx` | New Promise Table surface | Live UI | Engine-driven | `createPromiseTable()` and Promise Table filters |

## Retained Fixtures And Examples

| Path / Pattern | Scope | Decision | Reason |
| --- | --- | --- | --- |
| `src/lib/teoyube/examples/**` | Examples/smoke checks | Retained as fixture-only | Used for deterministic local validation and documentation examples |
| `src/lib/tig/examples/**` | TIG examples/smoke checks | Retained as fixture-only | Existing TIG validation fixtures |
| `src/lib/teoyube/mobile-scale/examples/**` | Mobile/scale examples | Retained as fixture-only | Historical roadmap validation examples |
| `docs/teoyube/**` sample/demo text | Documentation | Retained | Describes manual QA and launch workflows, not live UI data |
| `src/lib/tig/seed/**` | Seed graph | Retained | Canonical local TIG seed graph, not disposable mock data |
| fallback copy in adapters/components | Runtime safety copy | Retained | Required to prevent crashes and preserve Scripture/fallback boundaries |

## Unsupported Mock Content

No unsafe live mock Scripture, unsupported live mock promise, unsupported live mock prayer, or live mock calling content was intentionally left as the primary source for patched Phase 3.3 surfaces. Remaining sample/demo text is fixture, documentation, or safety fallback copy.

## Data Contracts Hardened

- `src/lib/teoyube/data/teoyube-data-contracts.ts`
- `src/lib/teoyube/data/teoyube-data-normalization.ts`
- `src/lib/teoyube/data/teoyube-data-contract-validation.ts`
- `src/lib/teoyube/data/teoyube-data-access.ts`

## Remaining Follow-Up For Phase 3.4

- Run full dependency-backed typecheck/build once `node_modules` is restored.
- Expand UI regression checks into rendered component tests.
- Continue replacing legacy `teoyube-app/data` assumptions with explicit cross-data contracts where safe.
- Validate TIG end-to-end recommendation traces against real data and user-visible explanation paths.
