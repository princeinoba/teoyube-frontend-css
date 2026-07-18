# Phase 11.5 Personalization Experience Plan

Current major milestone: TEOYUBE Phase 11 - Advanced Real App Productization, Personalization Experience, Saved Journey Memory & Preference Learning Preview.

Current step: Phase 11.5 - Advanced Personalization Experience, Saved Journey Memory, Consent UI & Preference Learning Preview.

## Implementation Scope

Phase 11.5 keeps the repository-root static Node app as the primary runtime. It adds a visible Personalization Center, baseline vs personalized preview comparison, safe journey memory, soft preference hints, right-rail personalization preview, Book memory timeline, feedback controls, safe export updates, and a Phase 11.5 smoke gate.

Personalization remains off by default. When enabled, it uses only visible local/session signals and saved journey memory. It does not add accounts, analytics, database persistence, live AI, browser persistence, service workers, automatic contact, or external service calls.

## User Experience

- Sidebar/profile card opens the Personalization Center.
- Command palette can open Personalization Center, enable session-only personalization, and compare the standard Scripture path with the personalized preview.
- Right insight rail shows active consent mode, memory summary, top hints, whether the result was affected, Scripture preservation, confidence comparison, fallback comparison, and data controls.
- Safe export center includes a Personalization Center entry and data controls.
- Today and Canon include "Recommended for Your Current Journey" panels.
- TeoyubeSearch, Promise Table, Teo Guide, and smart recommendation cards expose feedback controls.

## Guardrails

- Scripture remains visible in both standard and preview results.
- Baseline output is never hidden.
- Hints are soft and removable.
- Raw private text is excluded from safe exports.
- Personalization cannot override safety, confidence, fallback, consent, or Scripture constraints.

## Next Step

Phase 11.6 - Premium Teoyube Intelligence UX: Graph Explorer, Why-This Explanation, Command Palette Intelligence & Smart Recommendation Rail.
