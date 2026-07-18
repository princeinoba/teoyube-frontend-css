# Phase 3.2 Connect Integrated Engines To Live UI Components

Status: Complete - live UI engine wiring complete

Phase 3.2 connects the Phase 3.1 integrated engines and adapters to the real app UI surfaces. The work preserves existing component behavior while making Scripture anchors, explanation paths, confidence/fallback state, and safe local context visible in live UI.

## Components Connected

- `teoyube-app/components/WordCard.tsx`
- `teoyube-app/components/PrayerCompanion.tsx`
- `teoyube-app/components/compass/CompassExperience.tsx`
- `teoyube-app/src/components/tig/TIGResponsePanel.tsx`
- `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`
- `teoyube-app/components/ExploreTabs.tsx`
- `src/components/teoyube/PromiseTablePreview.tsx`

## Hooks And Adapters Used

- `useTeoyubeWordCardContext()` wraps the WordCard adapter.
- `usePrayerCompanionContext()` wraps the PrayerCompanion adapter.
- `useCompassExperienceContext()` wraps the CompassExperience adapter.
- `useTigResponsePanelContext()` wraps the TIGResponsePanel adapter.
- `useTigGraphExplorerContext()` wraps the TIGGraphExplorer adapter.

The live components use adapter context directly where a server-compatible component is safer, and hooks where the component is already a client component.

## WordCard Connection

WordCard keeps the legacy loose `word` prop and now enriches it through `createWordCardAdapterProps()`. It can show:

- word/title
- meaning
- category
- Scripture anchors
- related Promise Clusters
- explanation hint
- missing Scripture warning when no anchor is available

## PrayerCompanion Connection

PrayerCompanion now uses local Promise Engine and Theology Framework context through `usePrayerCompanionContext()`. The form no longer needs to post to live AI to show a Scripture-anchored companion response. It displays:

- related promise cluster
- response text
- Scripture anchor
- safe fallback prayer
- journal prompt
- confidence and fallback state
- devotional/professional-advice boundary note
- explanation path

## CompassExperience Connection

CompassExperience now displays Calling Engine context through `useCompassExperienceContext()`. Existing media search behavior is preserved, but the calling context does not require the media request to succeed. It displays:

- calling archetype
- confidence label
- Scripture anchors
- related Promise Clusters
- next action step
- explanation path
- no-divine-certainty reminder

## TIGResponsePanel Connection

TIGResponsePanel now calls `useTigResponsePanelContext()` and displays an Integrated Teoyube Context section. It shows:

- selected Teoyube word, when available
- selected Promise Cluster
- Scripture anchors
- confidence label
- fallback state
- explanation path

Existing TIG graph logic, production insights, confidence labels, fallback messages, decision trace, and Scripture sections remain intact.

## TIGGraphExplorer Connection

TIGGraphExplorer now calls `useTigGraphExplorerContext()` and exposes a Promise Table Relationship Preview. It connects the seed graph to:

- real Promise Table rows
- Scripture anchors
- Promise Cluster themes
- TIG edge counts

The existing graph explorer, traversal map, node filtering, relationship detail, and connected-node browsing remain intact.

## Promise Table UI

`src/components/teoyube/PromiseTablePreview.tsx` provides a lightweight searchable/filterable Promise Table preview. ExploreTabs includes a new `Promise Table` tab that renders the preview.

The preview shows:

- promise title/theme
- Scripture anchors
- related Teoyube words
- calling links
- TIG edge availability
- validation warnings

## Fallback Behavior

- Missing WordCard data falls back to a safe engine context and flags missing Scripture anchors.
- PrayerCompanion uses a local Scripture-grounded fallback prayer and does not collect text persistently.
- CompassExperience shows Calling Engine context even if the video request fails.
- TIGResponsePanel flags missing anchors as safe fallback review.
- TIGGraphExplorer falls back to readable list/table previews when graph context is incomplete.
- PromiseTablePreview shows an empty-state message for unmatched filters.

## Safety Boundary

Phase 3.2 does not add external services, database persistence, analytics, live AI orchestration, browser persistence, service workers, automatic user contact, or hidden personalization. Existing user-facing consent/privacy notices in TIG surfaces are preserved.

## Validation

Added:

- `src/lib/teoyube/integration/phase-3-2-ui-integration-validation.ts`
- `src/lib/teoyube/examples/phase-3-2-live-ui-engine-connection-example.ts`
- `src/lib/teoyube/examples/phase-3-2-live-ui-engine-connection-smoke-check.ts`

The validation confirms WordCard, PrayerCompanion, CompassExperience, TIGResponsePanel, TIGGraphExplorer, and Promise Table preview can receive stable adapter data without external services.

## What Remains For Phase 3.3

Next recommended step:

Phase 3.3 - Replace Mock Data, Harden Data Contracts & Add UI Regression Checks

That step should remove remaining static assumptions, define stricter cross-data contracts, restore full dependency-backed type/build checks, and add UI regression checks for the connected surfaces.
