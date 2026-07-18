# Phase 3.3 - Replace Mock Data, Harden Contracts & Add UI Regression Checks

Status: Complete

Current major milestone: TEOYUBE Phase 3 - Intelligent Architecture Integration

Phase 3.3 replaces remaining live fixed/mock-style data selections with engine-backed adapters, hardens the real data contracts, and adds local regression checks for Scripture anchors, explanation paths, fallback states, confidence labels, and mobile-safe list/table behavior.

## Mock Data Found

Live UI findings are documented in `docs/teoyube/phase-3-3-mock-data-audit.md`.

The main live issues were fixed selected ids in dashboard and TIG surface containers, plus loose component boundaries where legacy JSON props could hide missing Scripture anchors. The broad audit also found example, smoke check, launch documentation, placeholder input copy, TIG seed data, and fallback copy. Those remain where they are fixture-only, documentation-only, seed graph data, or safety fallback content.

## Live Mock Data Replaced

- `teoyube-app/app/page.tsx` now derives dashboard promise/prayer focus from the current Daily Word engine context instead of fixed `PR004`/`PC02` selections.
- `teoyube-app/app/page.tsx`, `teoyube-app/app/prayer/page.tsx`, `teoyube-app/app/compass/page.tsx`, and `teoyube-app/app/explore/page.tsx` pass engine-derived ids, Scripture anchors, and explanation context into TIG production surfaces.
- `teoyube-app/components/WordCard.tsx` keeps old props support but enriches through `createWordCardAdapterProps()`.
- `teoyube-app/components/PrayerCompanion.tsx` uses local Promise/Theology adapter context and does not persist user prayer text.
- `teoyube-app/components/compass/CompassExperience.tsx` shows Calling Engine context, Scripture anchors, confidence, action step, and explanation path beside existing media behavior.
- `src/components/teoyube/PromiseTablePreview.tsx` uses `createPromiseTable()` and filter helpers from real promise cluster data.

## Fixture Data Retained

Fixtures and examples remain only where useful:

- `src/lib/teoyube/examples/**` for deterministic examples and smoke checks.
- `src/lib/tig/**` seed graph data for local TIG behavior.
- `docs/teoyube/**` sample text for launch and QA documentation.
- Input placeholder text in UI controls.
- Scripture-grounded fallback copy that prevents crashes and keeps incomplete responses explainable.

## Data Contracts

Added `src/lib/teoyube/data/teoyube-data-contracts.ts` for:

- `TeoyubeVocabularyItem`
- `TeoyubePromiseCluster`
- `TeoyubeScriptureCanonEntry`
- `TeoyubeScriptureAnchor`
- `TeoyubeTheme`
- word, promise, calling, prayer, and TIG connection contracts
- data health issues and validation reports

The contracts match the existing JSON shapes and keep safe index signatures plus original source values so future adapters can read legacy fields without discarding metadata.

## Normalization

Added `src/lib/teoyube/data/teoyube-data-normalization.ts`.

Normalization handles strings, arrays, missing fields, alternate legacy names, and stable ids. It preserves original records, source metadata, Scripture references, promise declarations, and prayer/calling links. It does not invent unsupported Scripture references or promises.

## Validation

Added `src/lib/teoyube/data/teoyube-data-contract-validation.ts`.

Validation checks vocabulary, Promise Clusters, Scripture canon, duplicate ids, usable Scripture references, Promise Cluster Scripture support, cross-data word connections, missing anchors, and coverage warnings. Missing Scripture support on Promise Cluster surfaces is treated as blocker-level because those rows can drive live recommendations.

`src/lib/teoyube/data/teoyube-data-access.ts` now returns normalized data and exposes the contract report through `getDataHealthReport()`.

## UI Regression Checks

Added:

- `src/lib/teoyube/integration/phase-3-3-ui-regression-contracts.ts`
- `src/lib/teoyube/integration/phase-3-3-ui-regression-checks.ts`
- `src/lib/teoyube/integration/phase-3-3-mock-replacement-validation.ts`
- `src/lib/teoyube/integration/phase-3-3-integration-audit.ts`

The checks cover WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, TIGGraphExplorer, Promise Table, fallback states, Scripture anchor visibility, explanation paths, confidence/fallback boundaries, allowed fixture data, and disabled external service requirements.

## Fallback Behavior

Fallbacks stay explicit and visible. Missing word data falls back to a safe local word context. Prayer input without content uses local Scripture-grounded prayer support. TIG and Promise Table reports surface blockers or warnings rather than silently hiding missing anchors.

## Scripture And Explanation Protection

Scripture anchors remain required for Promise Cluster rows and visible for WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, TIGGraphExplorer, and Promise Table outputs where available. Explanation paths remain required for prayer, calling, TIG response, and action-step flows. The wording keeps devotional boundaries and does not claim divine certainty.

## Phase 3.3 Example And Smoke Check

Added:

- `src/lib/teoyube/examples/phase-3-3-data-contracts-ui-regression-example.ts`
- `src/lib/teoyube/examples/phase-3-3-data-contracts-ui-regression-smoke-check.ts`

The smoke check verifies normalized data, contract reports, data access, Promise Table rows, UI adapters, safe fallbacks, Scripture anchors, explanation paths, mock replacement validation, UI regression checks, integration audit, and disabled external services.

## Phase 3.4 Follow-Up

- Run dependency-backed typecheck/build/test after dependencies are restored.
- Expand report-level regression checks into rendered UI tests.
- Verify TIG end-to-end recommendation traces against real data and visible explanation paths.
- Continue reducing legacy `teoyube-app/data` assumptions where engine contracts can safely replace them.

Next recommended step: Phase 3.4 - TIG End-to-End Recommendation Flow, Explanation Trace & Real Data QA
