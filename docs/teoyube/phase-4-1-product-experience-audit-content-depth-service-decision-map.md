# Phase 4.1 Product Experience Audit, Content Depth, and Service Decision Map

Current milestone: TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions

Current step: Phase 4.1 - Product Experience Audit, Content Depth Map & Controlled Service Decision Plan

Status: Complete

Next recommended step: Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design

## Files Mapped

- `src/lib/teoyube/data/**`
- `src/lib/teoyube/theology/**`
- `src/lib/teoyube/language/**`
- `src/lib/teoyube/promises/**`
- `src/lib/teoyube/calling/**`
- `src/lib/teoyube/tig/**`
- `src/lib/teoyube/journey/**`
- `src/lib/teoyube/qa/**`
- `src/lib/teoyube/integration/**`
- `src/lib/teoyube/phase-4/**`
- `src/lib/tig/**`
- `src/data/coreTeoyubeVocabulary.json`
- `src/data/promiseClusters.json`
- `src/data/scriptureCanon.json`
- `src/components/teoyube/PromiseTablePreview.tsx`
- `teoyube-app/components/WordCard.tsx`
- `teoyube-app/components/PrayerCompanion.tsx`
- `teoyube-app/components/ExploreTabs.tsx`
- `teoyube-app/components/compass/CompassExperience.tsx`
- `teoyube-app/src/components/tig/TIGResponsePanel.tsx`
- `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`
- `teoyube-app/app/**`
- `docs/teoyube/**`

## Product Surfaces Found

- Home dashboard: `teoyube-app/app/page.tsx`
- Explore and Canon: `teoyube-app/app/explore/page.tsx`, `teoyube-app/components/ExploreTabs.tsx`
- Daily Word and WordCard: `teoyube-app/components/WordCard.tsx`
- PrayerCompanion: `teoyube-app/app/prayer/page.tsx`, `teoyube-app/components/PrayerCompanion.tsx`
- CompassExperience: `teoyube-app/app/compass/page.tsx`, `teoyube-app/components/compass/CompassExperience.tsx`
- TIG response: `teoyube-app/app/tig/page.tsx`, `teoyube-app/src/components/tig/TIGResponsePanel.tsx`
- TIG graph: `teoyube-app/app/tig/graph/page.tsx`, `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`
- TIG journey/onboarding/privacy/progress/traversal surfaces under `teoyube-app/app/tig/**`
- Consent, privacy, and terms pages under `teoyube-app/app/consent`, `teoyube-app/app/privacy`, and `teoyube-app/app/terms`

## Product Experience State

Phase 3 left the primary product surfaces connected to real local engines and adapters:

- WordCard uses Teoyube Language Engine context.
- PrayerCompanion uses Promise Engine and Theology Framework context.
- CompassExperience uses Calling Engine context.
- TIGResponsePanel uses integrated TIG recommendation context.
- TIGGraphExplorer uses TIG graph and Promise Table relationship context.
- Promise Table rows come from real Promise Cluster data.
- Journey helpers expose Scripture anchors, explanation traces, fallback state, and confidence labels across route-level payloads.

Phase 4.1 adds a structured audit over these surfaces instead of rewriting them.

## Content Depth Map

The content depth map reads existing data only. It does not create new Scripture, promises, callings, prayers, or action steps.

Mapped areas:

- Teoyube vocabulary depth
- Promise Cluster depth
- Scripture Canon depth
- PrayerCompanion content depth
- Calling Compass content depth
- action step content depth
- TIG graph relationship depth

Classification:

- Strong: enough existing anchors/relationships for public polish.
- Weak: usable but should receive owner/content review.
- Missing: source data exists but direct anchors or relationship depth are absent.
- Ready for public polish: strong items that can move to Phase 4.2 copy and UI polish.
- Needs owner review: weak or missing items that must remain visible as content backlog items.

## Scripture And Promise Coverage

Phase 4.1 audits:

- Promise Clusters with fewer than two Scripture anchors.
- vocabulary items without direct Scripture support.
- Scripture Canon entries not directly used by vocabulary or Promise Clusters.
- themes with weak Promise Cluster coverage.
- themes with stronger Promise Cluster coverage.

Missing Scripture support is reported; it is not hidden and not patched by invented references.

## Product Surface Depth

The surface depth audit checks:

- WordCard
- PrayerCompanion
- CompassExperience
- TIGResponsePanel
- TIGGraphExplorer
- Promise Table
- Canon and Daily Word

Each check expects a journey payload, visible Scripture anchors or explicit fallback, an explanation trace, and a bounded confidence label. Manual product copy, accessibility, and mobile review are intentionally carried into Phase 4.2 as warnings.

## Controlled Service Decision Map

The service decision plan is deliberately plan-only:

- Database persistence: not connected.
- External analytics: not connected.
- Production monitoring provider: not connected.
- Admin content workflow: not connected to a CMS or database.
- Feedback storage: not connected.
- Live AI orchestration: not connected.

Each future service requires owner approval, privacy/consent review, payload minimization, safety review, fallback review, and explicit implementation in a later phase.

## Phase 4 Backlog Categories

The generated backlog groups follow-up work into:

- UI polish
- content coverage
- service decision planning
- admin workflow planning
- mobile review
- accessibility review
- public beta readiness

The backlog does not connect services or add persistence.

## Remaining Phase 4.2 Inputs

- Manual browser review over the integrated product surfaces.
- Manual mobile and accessibility checks.
- Content owner review for weak/missing Scripture, Promise Cluster, prayer, calling, action, and TIG relationship depth.
- Product copy polish that keeps devotional language humble and avoids divine-certainty claims.
- Admin workflow design before any CMS or persistence connection.
- Controlled service decision review before any database, analytics, monitoring, feedback storage, or live AI work.
