# Phase 3.4 - TIG End-to-End Recommendation Flow, Explanation Trace & Real Data QA

Status: Complete

Current major milestone: TEOYUBE Phase 3 - Intelligent Architecture Integration

Phase 3.4 adds a real-data end-to-end TIG recommendation flow over the existing TIG production graph and Phase 3 Teoyube engines. It does not replace the TIG engine, connect providers, persist data, add analytics, or enable live AI orchestration.

## What This Step Adds

- TIG recommendation contracts
- real-data context builder
- candidate builder
- scoring and bounded confidence labels
- Scripture anchor validation
- explanation trace builder
- fallback decision support
- end-to-end recommendation flow
- UI adapter trace connections
- real data QA scenarios and runner
- Phase 3.4 validation, audit, example, and smoke check

## End-to-End TIG Recommendation Flow

`runTigEndToEndRecommendation()` performs:

1. Build context from real vocabulary, Promise Clusters, Scripture Canon, Calling Engine, and TIG graph references.
2. Build word, promise, Scripture, prayer, calling, and action candidates.
3. Score and rank candidates.
4. Validate Scripture anchors.
5. Decide whether fallback is needed.
6. Validate theology and safety boundaries.
7. Create a user-visible explanation trace.
8. Return stable UI-ready result data.

## Recommendation Context

`tig-recommendation-context.ts` connects:

- selected Teoyube word
- Promise Cluster recommendations
- Scripture anchors
- Scripture Canon coverage
- Calling Engine path
- prayer context
- action step context
- TIG graph references
- explanation path
- fallback status

Missing data produces warnings and fallback context rather than crashes.

## Candidate Building

`tig-candidate-builder.ts` builds candidates from real project data only:

- word candidates from Teoyube Language Engine
- promise candidates from Promise Engine and real Promise Clusters
- Scripture candidates from Scripture anchors and Scripture Canon coverage
- prayer candidates from Promise Cluster prayer sequences
- calling candidates from Calling Engine
- action candidates from Calling Engine action suggestions

It does not invent unsupported Scripture or unsupported promises.

## Scripture Anchor Validation

`tig-scripture-anchor-validation.ts` treats Promise recommendations without Scripture support as blockers. Prayer, calling, and action recommendations without anchors receive warnings unless clear fallback/explanation support is present. Unsupported references are visible in QA.

## Scoring And Confidence

`tig-recommendation-scoring.ts` scores Scripture strength, Promise relevance, word relevance, calling relevance, prayer/action relevance, trace completeness, fallback status, and data quality warnings.

Confidence labels are bounded:

- `strong_scripture_match`
- `good_contextual_match`
- `partial_match`
- `fallback_match`
- `insufficient_data`

The labels do not imply that God directly selected a recommendation.

## Explanation Trace

`tig-explanation-trace.ts` produces normal-user trace steps for:

- local context signal
- matched word
- matched Promise Cluster
- matched Scripture anchor
- prayer support
- calling path
- action step
- TIG graph references
- confidence reason
- fallback reason

The trace avoids raw sensitive input and internal debug payloads.

## Fallback Decisions

`tig-fallback-decision.ts` uses fallback when candidates are missing, Scripture anchors are missing, Promise Cluster relevance is too weak, confidence is too low, explanation trace is incomplete, or safety/theology validation requires safer framing.

Fallback is non-empty, humble, Scripture-grounded when possible, and explicit about uncertainty.

## UI Adapter Connection

Patched adapters now expose Phase 3.4 recommendation data:

- WordCard adapter exposes `tigRecommendation`, trace, confidence, and fallback reason.
- PrayerCompanion adapter exposes `tigRecommendation`, trace, confidence, and fallback reason.
- CompassExperience adapter exposes `tigRecommendation`, trace, confidence, and fallback reason.
- TIGResponsePanel adapter exposes selected candidate, trace, confidence, and fallback reason.
- TIGGraphExplorer adapter exposes trace relationships and list fallback mode.

## TIGResponsePanel Output

`TIGResponsePanel.tsx` now shows a compact end-to-end TIG trace in the integrated context area. It keeps selected word/promise, Scripture anchors, confidence, fallback, and explanation paths visible without exposing raw debug data.

## TIGGraphExplorer Output

`TIGGraphExplorer.tsx` now shows an end-to-end TIG trace under the Promise Table relationship preview and notes list fallback availability when the graph selection is incomplete.

## Real Data QA

`tig-real-data-qa-scenarios.ts` defines real-data scenarios for:

- real vocabulary word
- real Promise Cluster
- calling input
- prayer input
- ambiguous fallback

`tig-real-data-qa-runner.ts` verifies the flow completes, Scripture anchors are present where required, explanation traces are generated, confidence labels are bounded, fallbacks work, UI adapters remain stable, unsupported mock data is not used, and no external services are required.

## Phase 3.5 Follow-Up

Phase 3.5 should integrate these results into user journey state flow and production UI polish while preserving Scripture anchors, explanation paths, fallback safety, confidence labels, consent/privacy notices, and disabled provider boundaries.

Next recommended step: Phase 3.5 - User Journey Integration, State Flow & Production UI Polish
