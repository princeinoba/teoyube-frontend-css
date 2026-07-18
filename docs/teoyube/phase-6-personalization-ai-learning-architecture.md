# Teoyube Phase 6.1 - Personalization & AI Learning Architecture

## Status

| Phase | Status | Progress |
| --- | --- | --- |
| Phase 5B.2 - Intelligence Graph Seeds & Engines | 100% Complete | 100 |
| Phase 5B.3 - Production Intelligence Layer | 100% Complete | 100 |
| Phase 6 - Personalization & AI Learning | 100% Complete | 100 |
| Phase 7 - Mobile & Scale | 100% Complete | 100 |

## Overview

Phase 6 begins the architecture foundation for consent-aware personalization and future AI learning. It builds on the completed Phase 5B.2 graph and Phase 5B.3 production intelligence layer.

Phase 6.1 is planning and contract work only. It does not store long-term user memory, connect a production database, call live AI models, send analytics, or begin mobile scaling.

## What Phase 6 Is Meant To Add

Phase 6 will eventually help Teoyube recognize safe, consented patterns such as:

- repeated user emotions
- selected Teoyube words
- selected promise clusters
- saved Scriptures
- repeated prayer themes
- completed action steps
- preferred surfaces
- confidence feedback
- fallback frequency
- journey continuity
- calling compass patterns

The goal is not hidden profiling. The goal is explainable, bounded, Scripture-anchored continuity.

## How Phase 5B.3 Events Are Used

Phase 5B.3 production events already include:

- surface
- intent
- selected word id
- selected promise cluster id
- selected Scripture reference
- selected prayer sequence id
- selected action step id
- confidence label
- fallback status
- safety status
- graph counts

Phase 6.1 converts those event objects into safe personalization signals. The event payloads remain local architecture inputs in this phase.

## Personalization Signals

`src/lib/tig/personalization-signals.ts` creates and normalizes lightweight structured signals from:

- production inputs
- production responses
- production events

Signals prefer structured values instead of raw text:

- surface
- emotion tag
- intent
- selected word id
- selected cluster id
- selected Scripture reference
- confidence label
- fallback used
- timestamp
- source

Raw user text is not stored by default.

## Learning Signals

`src/lib/tig/ai-learning-architecture.ts` defines a bounded learning architecture. It can group safe signals into patterns and suggest future adjustments such as:

- prefer a familiar Teoyube word theme
- prioritize a recurring promise cluster
- recommend familiar prayer sequences
- reduce repeated fallback paths
- surface relevant Scripture anchors
- support journey continuity
- support calling patterns

Learning signals are explainable suggestions. They do not override Scripture anchors.

## Consent

`src/lib/tig/personalization-safety.ts` defines consent validation.

Consent tracks:

- personalization enabled
- learning enabled
- raw text storage allowed
- allowed scopes
- source
- updated date

Without consent, personalization is disabled and the standard Scripture-anchored production path remains available.

## Safety

Safety rules ensure:

- personalization is consent-aware
- no sensitive data is stored by default
- raw private text is not stored unless explicitly allowed
- recommendations remain Scripture-anchored
- personalization never claims divine certainty
- personalization does not create medical, legal, financial, or emergency advice
- user feedback can reduce or disable personalization
- fallback remains available when personalization is unsafe or unavailable

## Scripture Anchoring Priority

Scripture anchoring remains the highest priority. Personalization can suggest continuity hints, but it cannot replace:

- Scripture evidence
- confidence scoring
- explanation paths
- fallback safety
- guardrail checks

## Production Bridge

`src/lib/tig/personalized-production-bridge.ts` connects Phase 6.1 previews to the completed Phase 5B.3 production service.

It can:

- create a personalized production input preview
- run a production response with preview hints
- create a personalization explanation
- create a personalization-aware event payload

This bridge is preview-safe and does not replace the production service.

## Phase 6.1 Includes

- personalization contracts
- personalization signal normalizer
- AI learning architecture shell
- consent and safety rules
- personalization engine shell
- production bridge
- examples
- smoke check
- documentation

## Phase 6.1 Does Not Include

- database persistence
- long-term memory storage
- live AI model learning
- external API calls
- mobile scaling
- hidden user profiling
- automatic personalization without consent

## Files Added

- `src/lib/tig/personalization-contracts.ts`
- `src/lib/tig/personalization-signals.ts`
- `src/lib/tig/ai-learning-architecture.ts`
- `src/lib/tig/personalization-safety.ts`
- `src/lib/tig/personalization-engine.ts`
- `src/lib/tig/personalized-production-bridge.ts`
- `src/lib/tig/examples/phase-6-personalization-architecture-example.ts`
- `src/lib/tig/examples/phase-6-personalization-architecture-smoke-check.ts`

## Phase 6.2 Update

Phase 6.2 is complete. It adds the personalization signal store design: contracts, in-memory storage, consent enforcement, sanitization, retention rules, query helpers, event-to-signal bridge, context-from-store builder, examples, smoke checks, and documentation.

The Phase 6.2 store remains development-safe. It does not connect Firestore, localStorage, cookies, files, external analytics, external AI calls, hidden long-term memory, or automatic personalization without consent.

## Later Phase 6 Update

Later Phase 6 work defined user-facing consent, preference, preview, feedback, and completion-audit controls without adding production persistence or live AI learning.

Database persistence, long-term memory, and AI model orchestration should wait until consent, safety, and user controls are clearly designed.

