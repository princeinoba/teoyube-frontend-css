# Teoyube Phase 6.2 - Personalization Signal Store Design

## Status

| Phase | Status | Progress |
| --- | --- | --- |
| Phase 5B.2 - Intelligence Graph Seeds & Engines | 100% Complete | 100 |
| Phase 5B.3 - Production Intelligence Layer | 100% Complete | 100 |
| Phase 6 - Personalization & AI Learning | 100% Complete | 100 |
| Phase 7 - Mobile & Scale | 100% Complete | 100 |

## Overview

Phase 6.2 adds a safe foundation for storing, querying, sanitizing, summarizing, exporting, and deleting Teoyube personalization signals without adding production database persistence.

The signal store is intentionally in-memory only. It is a development-safe architecture layer that prepares future consented persistence while keeping user control, Scripture anchoring, and privacy boundaries explicit.

## Why In-Memory Only

The current signal store does not write to:

- Firestore
- databases
- localStorage
- cookies
- files
- external analytics
- external AI services

This keeps Phase 6.2 useful for architecture, examples, smoke checks, and future adapter design without creating hidden long-term memory.

## Consent

Signal storage is consent-aware.

Storage requires:

- `personalizationEnabled`
- the `signals` consent scope

Signals can be stored as session-safe structured context, but they do not become production learning data unless future user-facing consent and persistence controls are added.

Disabled personalization blocks writes. Missing consent follows the existing Phase 6.1 default: personalization is disabled.

## Sanitization

Signals are sanitized before storage.

The store keeps structured graph fields such as:

- surface
- emotion tag
- intent
- selected Teoyube word ID
- selected promise cluster ID
- selected Scripture reference
- selected prayer sequence ID
- selected action step ID
- confidence label and score
- fallback state
- journey ID
- calling ID

Raw private user text is redacted by default. Raw text can only be kept if future consent explicitly allows raw text storage, and sensitive text is still blocked.

## Retention

`personalization-retention.ts` defines retention policy helpers for:

- session-only signals
- consented profile-preview signals
- max signal count
- max signal age
- allowed scopes
- privacy level filtering
- expired signal removal

No scheduled job or database TTL exists yet. Retention is applied synchronously inside the in-memory store and can also be run manually in examples or smoke checks.

## Querying And Aggregation

`personalization-signal-query.ts` provides helpers to filter and summarize signals by:

- surface
- emotion
- intent
- selected word
- promise cluster
- fallback use
- confidence label

Aggregation helpers group repeated surfaces, emotions, words, and promise clusters. These outputs prepare future learning patterns without making final AI decisions or spiritual claims.

## Production Event Bridge

`personalization-event-signal-bridge.ts` converts Phase 5B.3 production events into safe personalization signals.

The bridge can:

- create a signal from one production event
- create signals from an event batch
- store one event-derived signal in an in-memory store
- store a batch of event-derived signals

It does not send events externally and does not persist signals beyond the provided memory store.

## Context From Store

`personalization-context-from-store.ts` can build a preview personalization context from stored signals.

It can provide safe hints such as:

- repeated emotion tags
- repeated selected Teoyube words
- repeated promise clusters
- repeated surfaces
- fallback frequency
- confidence pattern
- Scripture anchors

These hints do not override Scripture anchors, do not claim divine certainty, and remain bounded to preview use.

## Export And Deletion Simulation

The in-memory store supports:

- safe export of sanitized signal records
- deletion by ID, query, scope, session, or user
- clearing all records or one scope

Exports omit raw text and can omit metadata. This prepares future user-access and deletion flows without connecting a database.

## Phase 6.2 Includes

- signal store contracts
- in-memory signal store
- retention rules
- query helpers
- safety layer
- event-to-signal bridge
- context-from-store builder
- personalized production bridge support
- examples
- smoke check
- documentation

## Phase 6.2 Does Not Include

- production database persistence
- hidden long-term memory
- external analytics sending
- live AI model learning
- live OpenAI orchestration
- mobile scaling
- automatic personalization without consent

## Files Added

- `src/lib/tig/personalization-signal-store-contracts.ts`
- `src/lib/tig/personalization-signal-store.ts`
- `src/lib/tig/personalization-retention.ts`
- `src/lib/tig/personalization-signal-query.ts`
- `src/lib/tig/personalization-signal-store-safety.ts`
- `src/lib/tig/personalization-event-signal-bridge.ts`
- `src/lib/tig/personalization-context-from-store.ts`
- `src/lib/tig/examples/phase-6-personalization-signal-store-example.ts`
- `src/lib/tig/examples/phase-6-personalization-signal-store-smoke-check.ts`

## Roadmap Position

Phase 6 is now complete. Phase 6.2 completed the signal store design foundation, and later Phase 6 steps completed preference management, preview integration, feedback, consent controls, and the completion safety audit.

Phase 7.2 mobile UI optimization is complete.
