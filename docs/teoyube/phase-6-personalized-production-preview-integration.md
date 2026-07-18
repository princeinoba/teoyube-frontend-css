# Teoyube Phase 6.4 - Personalized Production Preview Integration

## Status

| Phase | Status | Progress |
| --- | --- | --- |
| Phase 5B.2 - Intelligence Graph Seeds & Engines | 100% Complete | 100 |
| Phase 5B.3 - Production Intelligence Layer | 100% Complete | 100 |
| Phase 6 - Personalization & AI Learning | 100% Complete | 100 |
| Phase 7 - Mobile & Scale | 100% Complete | 100 |

## Overview

Phase 6.4 connects Teoyube's personalization architecture, signal store, and preference-style profile hints into a safe production preview layer.

The preview layer compares the existing production Scripture Intelligence response with an optional consent-aware personalized preview. It is designed to show what personalization might improve before any long-term personalization or database persistence is enabled.

## Baseline vs Personalized Preview

The baseline response always runs first through the completed Phase 5B.3 production intelligence service.

The personalized preview only runs when consent allows signal-based personalization. When allowed, Teoyube builds a safe personalization context from structured signals, profile preferences, and soft hints, then runs the same production service with preview context.

The personalized preview does not replace the baseline response. It sits beside it for comparison.

## Preference Hints

Preference hints can come from:

- sanitized signal store records
- personalization context summaries
- profile preferences
- preferred surfaces
- explicit preview hints supplied by the caller

Hints are soft. They may influence preview context, but they do not override Scripture anchoring, guardrails, fallback handling, or production response validation.

## Consent Behavior

Personalized preview requires consent.

If consent is missing or disabled, the service returns baseline-only mode. The response still includes a baseline production response, explanation, event payload, safety status, fallback status, and confidence comparison.

Raw private text is redacted from preview payloads. Events do not contain raw user input.

## Scripture Anchoring

Every preview response keeps the Phase 5B.3 requirement that Scripture anchoring remains available.

Safety rules block or downgrade personalized preview when:

- the baseline response is missing a Scripture anchor
- the personalized response is missing a Scripture anchor
- explanation paths are missing
- consent does not allow personalization
- unsafe or overclaiming language appears

## Preview Comparison

`personalization-preview-comparison.ts` compares:

- Teoyube word
- promise cluster
- Scripture anchor
- prayer sequence
- action step
- confidence score
- fallback usage
- explanation path

The comparison reports what changed, what stayed stable, whether confidence improved, whether fallback was avoided, and whether Scripture anchoring stayed intact.

## Preview Events

`personalization-preview-events.ts` creates analytics-ready event payloads for:

- preview created
- preview compared
- preview disabled
- preview blocked
- preference used

Events are local payloads only. They are not sent to external analytics.

## UI Adapter And Panel

`personalization-preview-ui-adapter.ts` prepares stable props for preview panels, comparison panels, explanation panels, debug panels, and consent summaries.

`teoyube-app/src/components/tig/TigPersonalizationPreviewPanel.tsx` renders a user-friendly preview card showing:

- baseline response
- personalized preview response
- what changed
- why it changed
- Scripture anchor
- confidence comparison
- fallback status
- consent status
- safety status

Debug JSON remains optional behind `showDebugInfo`.

## Phase 6.4 Includes

- preview contracts
- preview service
- baseline vs personalized comparison
- preview safety rules
- preview event helpers
- preview UI adapter
- optional preview panel
- surface preview runner
- production bridge updates
- examples
- smoke check
- documentation

## Phase 6.4 Does Not Include

- production database persistence
- hidden long-term memory
- external analytics sending
- live AI model learning
- live OpenAI orchestration
- mobile scaling
- automatic personalization without consent
- replacing the production intelligence service

## Later Phase 6 Update

Later Phase 6 work added user-facing consent and preference controls around these preview capabilities while keeping persistent personalization storage and live AI learning out of scope.

Phase 7.2 mobile UI optimization is complete after the completed Phase 6 audit.
