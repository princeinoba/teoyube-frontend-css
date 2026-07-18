# Phase 3.4 TIG End-to-End Recommendation Flow Map

Status: Complete

This map documents the actual TIG and Phase 3 modules used for the end-to-end real-data recommendation flow.

## TIG Modules Found

- `src/lib/tig/intelligence-graph-engine.ts` selects graph paths from local TIG seed data.
- `src/lib/tig/intelligence-confidence.ts` provides the existing TIG confidence score and labels.
- `src/lib/tig/intelligence-graph-seeds.ts` normalizes seed nodes and relationships.
- `src/lib/tig/query.ts` provides local graph lookup helpers.
- `src/lib/tig/production-intelligence-service.ts` runs the production TIG path, guardrails, fallback, cache, and event-ready response shaping.
- `src/lib/tig/production-fallbacks.ts` and `src/lib/tig/production-guardrails.ts` preserve fallback and safety behavior.
- `src/lib/tig/production-ui-adapter.ts` maps TIG production responses to panel, graph, and explanation props.

## Recommendation Flow Found

Existing TIG production flow already performs graph selection and guardrail fallback. Phase 3.4 adds a Teoyube-specific orchestration layer under `src/lib/teoyube/tig/` that connects real Teoyube vocabulary, Promise Clusters, Scripture Canon, Calling Engine, Prayer context, UI adapters, explanation trace, and real-data QA.

## Real Data Sources Used

- `src/data/coreTeoyubeVocabulary.json`
- `src/data/promiseClusters.json`
- `src/data/scriptureCanon.json`
- local TIG seed graph data under `src/lib/tig`

## Engine Connections

Promise Engine connects through `createPromiseRecommendationContext()` and supplies Promise Cluster candidates, Scripture anchors, prayer sequence context, and explanation paths.

Teoyube Language Engine connects through `createWordCardContext()` and supplies selected word, Scripture anchors, promise connections, calling links, and WordCard explanation paths.

Calling Engine connects through `recommendCallingPath()` and supplies calling archetype, related words, related Promise Clusters, Scripture anchors, action suggestions, and calling explanation paths.

Theology Framework connects through `validateTheologyBoundaries()` inside the end-to-end flow to preserve Scripture anchoring, humble language, explanation paths, fallback framing, and no divine-certainty claims.

Scripture Canon validates anchors through `tig-scripture-anchor-validation.ts`, which flags missing anchors and unsupported references in QA.

## UI Adapter Connections

Patched adapters:

- `word-card-adapter.ts`
- `prayer-companion-adapter.ts`
- `compass-experience-adapter.ts`
- `tig-response-panel-adapter.ts`
- `tig-graph-explorer-adapter.ts`

Each adapter now exposes an end-to-end TIG recommendation result, trace steps, confidence label, and fallback reason where relevant while preserving previous props.

## Explanation Trace

`tig-explanation-trace.ts` generates user-visible trace steps:

- local context signal
- matched Teoyube word
- matched Promise Cluster
- matched Scripture anchor
- prayer support
- calling path
- action step
- TIG graph relationship summary
- confidence reason
- fallback reason when used

The trace avoids raw sensitive input and internal debug payloads.

## Fallback Triggering

`tig-fallback-decision.ts` triggers fallback when real candidates are missing, no Scripture-anchored candidate exists, no relevant Promise Cluster exists, confidence is too low, explanation trace is incomplete, or context validation indicates review risk.

Fallback remains Scripture-grounded when possible, humble, non-empty, and clear about uncertainty.

## Patched UI

- `TIGResponsePanel.tsx` now shows a compact end-to-end TIG trace and fallback reason in the integrated context panel.
- `TIGGraphExplorer.tsx` now shows a compact end-to-end TIG trace and list fallback note when graph selection is incomplete.

## Remains For Phase 3.5

- Integrate the end-to-end recommendation result into user journey state flow.
- Polish production UI around saved journeys and state transitions.
- Add rendered browser regression coverage after dependencies are restored.
- Continue avoiding persistence, analytics, live AI, and browser storage until explicit later approval.
