# Teoyube Intelligence Graph — Phase 5B

## Overview

The Teoyube Intelligence Graph (TIG) is the central Scripture Intelligence layer for Teoyube. TIG connects the spiritual and product logic of the platform into one graph-shaped foundation:

- Scripture
- Teoyube words
- Promise categories
- Promise clusters
- Emotion profiles
- Calling profiles
- Kingdom paths
- Journeys
- Prayer sequences
- Reflection prompts
- Action steps
- Growth milestones
- AI response patterns

Phase 5B.2 expands the original Phase 5B.1 foundation with richer seed nodes, relationship coverage, graph-aware engines, and validation tools.

## Current Roadmap Status

| Phase | Status | Progress |
| --- | --- | --- |
| Phase 5B.2 - Intelligence Graph Seeds & Engines | 100% Complete | 100 |
| Phase 5B.3 - Production Intelligence Layer | 100% Complete | 100 |
| Phase 6 - Personalization & AI Learning | 100% Complete | 100 |
| Phase 7 - Mobile & Scale | 100% Complete | 100 |

Phase 5B.2 is complete. The Intelligence Graph seed registry, graph engine, confidence scoring, validation layer, explanation path, and visualization-ready graph structure are now ready for the Production Intelligence Layer.

## Core Principle

Teoyube should not return simple keyword matches. It should detect the user's spiritual state, connect it to Scripture-backed promises, and return Scripture, prayer, reflection, action, and growth guidance.

Flow:

```text
User input
→ intent detection
→ emotion detection
→ promise classification
→ promise cluster matching
→ Scripture anchoring
→ Teoyube word mapping
→ journey selection
→ prayer sequence selection
→ reflection prompt
→ action step
→ growth milestone
```

## File Map

- `types.ts` defines TIG nodes, relationships, ranking, traversal, confidence, detection, AI request/response, and user growth tracking types.
- `rank.ts` provides weighted ranking helpers for TIG relevance scoring.
- `confidence.ts` builds confidence scores from intent, emotion, promise, Scripture, calling, and journey signals.
- `traverse.ts` implements first-version graph traversal over nodes and relationships.
- `ai-interface.ts` validates safe Scripture-anchored responses and provides fallback response helpers.
- `query.ts` creates reusable seed graph query clients for node, relationship, tag, and text lookup.
- `promise-search.ts` powers Promise Search using emotions, promises, clusters, Scriptures, words, journeys, prayers, reflections, and actions.
- `prayer-generator.ts` selects and formats prayer sequence seeds, with fallback structured prayer generation.
- `calling-compass.ts` detects calling language and connects calling profiles to Scriptures, journeys, words, prayers, reflections, actions, and milestones.
- `journey-engine.ts` matches growth journeys and connects them to Scriptures, words, prayer sequences, reflection prompts, action steps, and milestones.
- `engine.ts` routes all TIG modes through the central Scripture-anchored engine.
- `demo.ts` provides local demo requests and demo execution helpers.
- `validate-demo.ts` validates graph health, seed integrity, node coverage, and demo response completeness.
- `production-response-contracts.ts` defines stable Phase 5B.3 production response contracts.
- `production-intelligence-service.ts` exposes `runTeoyubeProductionIntelligence` for production-facing graph recommendations.
- `production-fallbacks.ts` keeps incomplete production recommendations Scripture-anchored through safe fallback paths.
- `production-guardrails.ts` validates Scripture evidence, explanation paths, action safety, confidence framing, and user-facing claims.
- `production-cache.ts` provides lightweight in-memory runtime caching for production responses.
- `production-events.ts` prepares analytics-ready event payloads without sending external analytics.
- `production-ui-adapter.ts` prepares production responses for response, graph, and explanation panels.
- `production-surface-adapters.ts` normalizes Canon, Daily Word, Prayer, Calling Compass, Promise Cluster, AI Companion, onboarding, and unknown surface inputs.
- `production-surface-runner.ts` runs the shared production intelligence service for each supported Teoyube surface.
- `personalization-contracts.ts` defines Phase 6 consent-aware personalization and learning architecture contracts.
- `personalization-signals.ts` normalizes safe structured personalization signals from production input, response, and event data.
- `ai-learning-architecture.ts` defines bounded explainable learning summaries and suggested adjustments without live AI calls.
- `personalization-safety.ts` validates consent, sanitizes signals, and disables personalization when unsafe or unavailable.
- `personalization-engine.ts` previews personalization hints without storing data or overriding Scripture anchors.
- `personalized-production-bridge.ts` connects personalization previews to the completed production intelligence service.
- `personalization-signal-store-contracts.ts` defines Phase 6.2 signal store records, queries, retention policies, privacy levels, and adapter contracts.
- `personalization-signal-store.ts` provides a development-safe in-memory signal store with consent checks, sanitization, query, export, delete, and retention behavior.
- `personalization-retention.ts` defines session-only and consent-based retention policies for signal records.
- `personalization-signal-query.ts` filters, groups, and summarizes structured personalization signals.
- `personalization-signal-store-safety.ts` validates consent, redacts raw text, validates store records, and blocks unsafe storage.
- `personalization-event-signal-bridge.ts` converts Phase 5B.3 production events into safe personalization signals.
- `personalization-context-from-store.ts` builds preview personalization context and hints from stored signal records.
- `personalization-preference-contracts.ts` defines preference profile, hint, score, decision, application, and safety contracts.
- `personalization-preference-engine.ts` derives soft preference profiles and decisions from consented structured signals.
- `personalization-preference-scoring.ts` ranks preference hints by recurrence, confidence, Scripture anchoring, recency, and feedback.
- `personalization-preference-safety.ts` validates consent and blocks unsafe or hard preference use.
- `personalization-preference-application.ts` applies preference profiles as soft context for production inputs.
- `personalization-preference-feedback.ts` reduces preference hints from explicit user feedback.
- `personalization-preference-ui-adapter.ts` prepares preference profiles and hints for future UI panels.
- `personalization-preview-contracts.ts` defines Phase 6.4 preview input, response, comparison, decision, safety, event, and status contracts.
- `personalization-preview-service.ts` runs baseline production intelligence and optional consent-aware personalized preview comparisons.
- `personalization-preview-comparison.ts` compares selected words, clusters, Scripture anchors, prayer sequences, action steps, confidence, fallback, and explanation paths.
- `personalization-preview-safety.ts` validates consent, Scripture anchoring, explanation paths, raw text redaction, and preview guardrails.
- `personalization-preview-events.ts` creates analytics-ready local preview event payloads without sending them.
- `personalization-preview-ui-adapter.ts` prepares preview response data for reusable UI panels.
- `personalization-preview-surface-runner.ts` runs preview comparisons for Canon, Daily Word, Prayer, Calling Compass, Promise Cluster, AI Companion, onboarding, and unknown surfaces.
- `personalization-feedback-contracts.ts` defines Phase 6.5 feedback types, targets, decisions, explanations, safety status, results, and event payloads.
- `personalization-consent-controls-contracts.ts` defines consent state, actions, settings, audit entries, results, and explanations.
- `personalization-feedback-engine.ts` normalizes, sanitizes, validates, explains, and applies explicit user feedback to preview preference profiles and signal stores.
- `personalization-consent-controls.ts` manages disabled, session-only, and profile-preview consent states with auditable reset, export, and delete requests.
- `personalization-feedback-signal-bridge.ts` converts explicit feedback into sanitized structured personalization signals when consent allows it.
- `personalization-feedback-events.ts` creates local analytics-ready feedback and consent event payloads without sending them.
- `personalization-feedback-ui-adapter.ts` prepares feedback results and consent states for future UI panels.
- `phase-6-personalization-completion-audit.ts` audits Phase 6 module coverage and Phase 7 readiness.
- `phase-6-personalization-safety-check.ts` validates Phase 6 consent, signal, preference, preview, and feedback safety.
- `index.ts` is the public barrel export for TIG.

Seed files:

- `seed/index.ts` aggregates all seed nodes and relationships into one graph.
- `seed/scriptures.seed.ts` contains starter Scripture nodes.
- `seed/emotions.seed.ts` contains starter emotion profiles.
- `seed/promises.seed.ts` contains starter promise categories.
- `seed/promise-clusters.seed.ts` contains starter promise clusters.
- `seed/callings.seed.ts` contains starter calling profiles.
- `seed/journeys.seed.ts` contains starter journey nodes and stages.
- `seed/words.seed.ts` contains starter Teoyube word nodes.
- `seed/prayer-sequences.seed.ts` contains structured prayer sequence seeds.
- `seed/reflection-prompts.seed.ts` contains reflection prompt seeds.
- `seed/action-steps.seed.ts` contains action step seeds.
- `seed/growth-milestones.seed.ts` contains growth milestone seeds.
- `seed/ai-response-patterns.seed.ts` contains AI response pattern seeds.
- `seed/relationships.seed.ts` connects the graph across emotions, promises, clusters, Scriptures, words, journeys, prayers, reflections, actions, milestones, callings, and response patterns.

## Engine Modes

- `daily_word` returns a Scripture-anchored fallback response in v1.
- `promise_search` runs the Promise Search engine over emotions, promise categories, promise clusters, Scriptures, words, journeys, prayers, reflections, and actions.
- `calling_compass` runs the Calling Compass engine over calling profiles, Scriptures, journeys, words, prayers, reflections, actions, and milestones.
- `prayer` generates a Scripture-grounded prayer from seed graph prayer sequences and returns it through the central TIG response contract.
- `journal` returns a Scripture-anchored fallback response in v1.
- `growth_journey` runs the Journey Engine over seeded journeys, stages, Scriptures, words, prayers, reflections, actions, and growth milestones.
- `ai_companion` currently uses Promise Search as the default graph-grounded v1 behavior.

## Scripture Anchoring Rule

Every usable TIG response must include at least one `ScriptureNode`.

If no graph match is found, the engine must use a Scripture-anchored fallback response. This rule is enforced by `validateTIGAIResponse`.

## Current Data Status

Phase 5B.2 includes starter seeds for:

- 3 Scriptures
- 3 Emotion Profiles
- 4 Promise Categories
- 5 Promise Clusters
- 5 Calling Profiles
- 3 Journeys
- 12 Teoyube Words
- 5 Prayer Sequences
- 6 Reflection Prompts
- 12 Action Steps
- 10 Growth Milestones
- 5 AI Response Patterns
- Expanded relationships

## API Route

The Next.js API route `/api/tig` accepts `POST` requests and runs the local TIG engine.

Accepted body fields:

- `input`
- `mode`
- `context` optional
- `userId` optional
- `locale` optional

Supported modes:

- `daily_word`
- `promise_search`
- `calling_compass`
- `prayer`
- `journal`
- `growth_journey`
- `ai_companion`

## UI Components

- `useTIGEngine` is the client hook for calling `/api/tig`, with `response`, `loading`, `error`, `submit`, and `reset`.
- `TIGResponsePanel` displays TIG responses including Scripture, graph matches, prayer, reflection, action, confidence, and graph trace.
- `TIGSearchPanel` provides the interactive Scripture Intelligence input surface and mode selector.
- `TigSurfaceProductionSection` displays the production response path for Canon, Daily Word, Prayer, Calling Compass, Promise Cluster, and AI Companion surfaces.
- `/tig` is the user-facing Scripture Intelligence page.
- `/tig/debug` is the developer validation and diagnostics page.

## Validation

- `validateTIGSeedGraph` checks node integrity, relationship integrity, score ranges, Scripture integrity, duplicate IDs, and required node type coverage.
- `validateTIGDemoResponses` checks that demo responses remain Scripture-anchored and include message, prayer, reflection, action, confidence, and Scripture text.
- `/tig/debug` displays seed graph validation, seed summary, demo validation, sample response details, graph trace, and raw validation JSON in the browser.

## Current Limitations

- TIG currently uses local seed data only.
- It does not call an external AI API yet.
- Intent detection is simple phrase matching.
- Emotion and calling detection are seed-based.
- User journey persistence is not yet connected.
- Full 108 Teoyube words are not all loaded yet.
- Firestore/database storage is not yet connected.

## Phase 5B.3 Completion

Phase 5B.3 is complete. The Production Intelligence Layer now provides production response contracts, fallback handling, guardrails, runtime cache, analytics-ready event payloads, response validation, UI adapters, surface adapters, surface runners, and a stable `runTeoyubeProductionIntelligence` service over the completed Phase 5B.2 graph.

The main TIG response panel now consumes the Production Intelligence Layer and shows production selection, explanation path, fallback state, safety state, and visualization-ready graph data in the user-facing response UI.

Production fallback hardening is complete. The service now validates response completeness, strengthens fallback reasons, sanitizes unsafe output, replaces blocked responses with safe Scripture-grounded paths, and includes runtime fixtures plus a smoke-check runner.

Production surface integration is complete. Canon, Daily Word, Prayer, Calling Compass, Promise Cluster, and AI Companion now consume the same Scripture-anchored production response through shared surface adapters, a shared runner, reusable UI, examples, and a surface smoke check.

Production event readiness is complete. Event helpers now prepare stable analytics-ready payloads and event batches without sending external analytics. The final completion audit returns 100%.

## Phase 6.1 - Personalization & AI Learning Architecture

Phase 6.1 is complete. It adds consent-aware personalization contracts, safe signal normalization, AI learning architecture scaffolding, safety rules, a preview-only personalization engine, a production bridge, examples, smoke checks, and documentation.

Phase 6.1 does not add database persistence, long-term memory storage, live AI model learning, external API calls, mobile scaling, hidden profiling, or automatic personalization without consent.

## Phase 6.2 - Personalization Signal Store Design

Phase 6.2 is complete. It adds signal store contracts, a development-safe in-memory store, retention policies, query and aggregation helpers, a safety layer, event-to-signal bridge, context-from-store builder, personalized production bridge support, examples, smoke checks, and documentation.

The Phase 6.2 store does not write to a database, localStorage, cookies, files, external analytics, or AI APIs. It stores sanitized structured graph signals only when consent allows signal storage, redacts raw private text by default, and keeps personalization explainable and user-controllable.

## Phase 6.3 - Personalization Preference Engine

Phase 6.3 is complete. It adds preference contracts, preference profile derivation, hint scoring, safety checks, application helpers, feedback reduction helpers, and UI adapters.

Preference hints are soft, consent-aware, preview-safe, and reversible. They can guide language, surfaces, words, promise clusters, journeys, prayers, actions, and calling continuity without overriding Scripture anchoring or claiming certainty.

## Phase 6.4 - Personalized Production Preview Integration

Phase 6.4 is complete. It adds preview contracts, baseline vs personalized comparison, preview safety rules, local preview event payloads, UI adapters, an optional preview panel, surface preview runners, production bridge updates, examples, smoke checks, and documentation.

The personalized preview layer does not replace the production intelligence service. It runs baseline production first, runs personalized preview only when consent allows it, preserves Scripture anchoring and explanation paths, redacts raw private text from preview payloads, and keeps fallback behavior visible.

## Phase 6.5 - Feedback Loop & Consent Controls

Phase 6.5 is complete. It adds feedback contracts, consent control contracts, a feedback engine, consent control manager, feedback-to-signal bridge, feedback event payloads, feedback UI adapters, optional consent and feedback components, examples, smoke checks, and documentation.

Feedback is explicit user control. Users can guide, reduce, disable, reset, export, or delete simulated personalization signals. Raw private text is redacted by default, no production persistence is connected, and feedback cannot override Scripture anchoring or make hard claims about the user.

## Phase 6.6 - Completion Audit & Phase 7 Readiness

Phase 6.6 is complete. It adds the completion audit, safety checker, completion example, completion smoke check, Phase 6 completion documentation, and a Phase 7 readiness plan.

The audit confirms the Personalization & AI Learning foundation is safe, consent-aware, Scripture-anchored, explainable, reversible, fallback-safe, preview-ready, and ready for the Mobile & Scale phase.

Phase 6 still intentionally does not include production database persistence, live AI learning, external analytics sending, mobile scaling, automatic personalization without consent, or hidden long-term memory.

## Phase 7 Complete

Phase 7 focused on mobile layout optimization, responsive TIG panels, performance, offline-safe devotional surfaces, scalable persistence strategy, production analytics connection planning, mobile onboarding refinement, mobile personalization controls, and deployment hardening.

Phase 7.2 mobile UI optimization is complete. The mobile pass added shared layout primitives, compact TIG graph previews, mobile explanation paths, responsive production response panels, mobile personalization preview support, consent/feedback touch targets, examples, smoke checks, and documentation.

Phase 7 is complete. It still does not include production persistence, analytics sending, live AI orchestration, service workers, native mobile builds, or deployment provider integration. Phase 7.3 performance, cache, and offline readiness, Phase 7.4 scale readiness and deployment preparation, and Phase 7.5 final completion audit are complete. Production Launch Preparation is now complete, Manual Preview Deployment Execution 2.1, 2.2, 2.3, 2.4, and 2.5 are complete, Soft Launch Preparation 3.1, 3.2, and 3.3 are complete, and the next recommended step is Limited Soft Launch Execution 4.1 - Controlled Launch Activation Checklist.




