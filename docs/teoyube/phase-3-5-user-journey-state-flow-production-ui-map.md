# Phase 3.5 User Journey, State Flow, and Production UI Map

## Pages and Routes Found

- `/` home dashboard: Daily Word, Promise Cluster focus, Prayer Companion focus, production TIG surface.
- `/explore` Canon Explorer: Teoyube words, Promise Clusters, Canon browsing, WordCard and Promise Table data.
- `/prayer` Prayer Companion: prayer library, PrayerCompanion client flow, production TIG prayer surface.
- `/compass` Calling Compass: Calling Engine context, TeoyubeWorld video search, production TIG calling surface.
- `/tig` TIG search: onboarding callout, TIGSearchPanel, TIGResponsePanel after user input.
- `/tig/graph` TIGGraphExplorer: seed graph, relationship view, Promise Table preview, list fallback.
- `/tig/onboarding`: onboarding panel.
- `/tig/journey`: existing saved journey activity panel. This predates Phase 3.5 and references local browser storage; Phase 3.5 does not expand or depend on it.
- `/consent`, `/privacy`, `/terms`: public policy and consent routes.

## Entry Points

Users can enter through the dashboard, Canon Explorer, Prayer Companion, Calling Compass, TIG Search, TIG Graph Explorer, onboarding, consent, or privacy routes.

The primary Phase 3.5 flow is:

1. Entry or onboarding context.
2. Local in-memory journey state.
3. TIG end-to-end recommendation.
4. WordCard, Promise Cluster, PrayerCompanion, CompassExperience, TIGResponsePanel, and TIGGraphExplorer payloads.
5. Explanation trace, confidence label, Scripture anchors, fallback reason, and action step.
6. Review or fallback state when support is incomplete.

## State Flow

`src/lib/teoyube/journey/user-journey-state.ts` creates sanitized in-memory state. It preserves IDs, Scripture anchors, trace steps, confidence labels, fallback reasons, and visible summaries, but clears raw sensitive query, prayer, calling, or action input by default.

No Phase 3.5 state uses localStorage, cookies, IndexedDB, database persistence, analytics, live AI orchestration, automatic user contact, or external services.

## Component Connections

- WordCard connects through `createWordCardJourneyPayload()`, which uses `createWordCardAdapterProps()`.
- PrayerCompanion connects through `createPrayerCompanionJourneyPayload()`, which uses `createPrayerCompanionAdapterContext()`.
- CompassExperience connects through `createCompassExperienceJourneyPayload()`, which uses `createCompassExperienceAdapterContext()`.
- TIGResponsePanel connects through `createTigResponsePanelJourneyPayload()`, which uses `createTigResponsePanelAdapterContext()`.
- TIGGraphExplorer connects through `createTigGraphExplorerJourneyPayload()`, which uses `createTigGraphExplorerAdapterContext()`.
- Promise Table connects through `createPromiseTableJourneyPayload()`, which uses real Promise Table rows.

## Trace, Confidence, and Fallback Visibility

Explanation trace appears in the Phase 3.4 TIG response panel and graph explorer patches, and Phase 3.5 route summaries now expose trace step counts. Confidence labels appear in route-level journey summaries and payloads. Fallback reasons remain visible when the TIG recommendation uses fallback framing.

## Mobile and Accessibility Risks

- TIG graph output can become dense; the journey graph payload preserves list fallback mode.
- Long Scripture anchors and trace text need wrapping on mobile.
- Prayer and Compass client input must avoid storing raw sensitive text.
- Existing TIG saved journey tools should remain clearly separated from the new in-memory recommendation journey.
- Debug routes and raw payload views must remain out of normal user flows.

## Patched Pages

- `teoyube-app/app/page.tsx`
- `teoyube-app/app/explore/page.tsx`
- `teoyube-app/app/prayer/page.tsx`
- `teoyube-app/app/compass/page.tsx`
- `teoyube-app/app/tig/page.tsx`
- `teoyube-app/app/tig/graph/page.tsx`
- `teoyube-app/app/tig/journey/page.tsx`

## Remains For Phase 3.6

Phase 3.6 should run real user journey QA, manual accessibility checks, mobile viewport review, focus review, page-by-page screenshot review where tooling is available, and integration readiness review before any wider production connection.
