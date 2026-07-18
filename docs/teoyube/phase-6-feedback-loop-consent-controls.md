# Teoyube Phase 6.5 - Feedback Loop & Consent Controls

## Status

| Phase | Status | Progress |
| --- | --- | --- |
| Phase 5B.2 - Intelligence Graph Seeds & Engines | 100% Complete | 100 |
| Phase 5B.3 - Production Intelligence Layer | 100% Complete | 100 |
| Phase 6 - Personalization & AI Learning | 100% Complete | 100 |
| Phase 7 - Mobile & Scale | 100% Complete | 100 |

## Overview

Phase 6.5 adds the user-control layer for Teoyube personalization. It lets users guide, reduce, disable, reset, export, or delete personalization signals before long-term personalization is enabled.

This phase keeps personalization preview-safe, reversible, explainable, and consent-aware.

## Feedback Controls

Feedback controls let users say:

- more like this
- less like this
- not relevant
- save Scripture
- save word
- save prayer
- complete action step
- fallback was helpful or not helpful
- confidence was too low
- disable personalization
- reset preferences
- export signals
- delete signals

Feedback is treated as explicit user control. It is not hidden profiling, and it does not claim certainty about the user.

## Consent Controls

Consent controls support:

- personalization disabled
- session-only personalization
- profile-preview personalization
- preference hints enabled or disabled
- raw text storage disabled by default
- export requests
- delete requests
- reset preferences
- surface-specific personalization toggles
- event-to-signal conversion toggles

The default state is privacy-protective: personalization off, preference hints off, signal storage blocked, raw text storage off.

## Feedback To Signals

`personalization-feedback-signal-bridge.ts` converts explicit feedback into safe structured personalization signals when consent allows it.

Feedback signals can store structured fields such as:

- target kind
- target id
- selected word id
- selected promise cluster id
- selected Scripture reference
- selected prayer sequence id
- selected action step id
- surface
- confidence-style score

Raw private text is redacted by default.

## Preference Hint Effects

The feedback engine can:

- strengthen soft hints when users choose "more like this"
- reduce hints when users choose "less like this"
- avoid crashing on "not relevant"
- disable personalization when requested
- reset simulated profile preferences

Feedback never creates hard overrides. It cannot remove Scripture anchoring, bypass guardrails, or replace the production intelligence service.

## Disable, Reset, Export, Delete

Phase 6.5 adds simulated local controls:

- disable personalization
- reset preferences
- request signal export
- request signal delete

These controls are auditable and explainable. They do not connect Firestore, database persistence, localStorage, cookies, files, or external services.

## Events

`personalization-feedback-events.ts` creates local analytics-ready payloads for:

- feedback submitted
- consent updated
- personalization disabled
- reset requested
- export requested
- delete requested

Events are not sent anywhere. Each event includes `externalAnalyticsSent: false`.

## UI

Phase 6.5 adds optional app components:

- `TigPersonalizationConsentPanel`
- `TigPersonalizationFeedbackControls`

These components present the controls in a user-friendly way and keep behavior local and simulated.

## Phase 6.5 Includes

- feedback contracts
- consent control contracts
- feedback engine
- consent control manager
- feedback-to-signal bridge
- feedback events
- feedback UI adapter
- optional consent and feedback UI components
- examples
- smoke check
- documentation

## Phase 6.5 Does Not Include

- production database persistence
- hidden long-term memory
- external analytics sending
- live AI model learning
- live OpenAI orchestration
- mobile scaling
- automatic personalization without consent

## Phase 6 Completion Update

Phase 6 is now complete with preference review, preview, feedback, consent controls, safety checks, examples, smoke checks, and completion audit. Production persistence and live AI learning remain intentionally out of scope.

Phase 7.2 mobile UI optimization is complete after the completed Phase 6 audit.
