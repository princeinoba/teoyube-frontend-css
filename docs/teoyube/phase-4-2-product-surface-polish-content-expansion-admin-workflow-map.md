# Phase 4.2 Product Surface Polish, Content Expansion, and Admin Workflow Map

Current milestone: TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions

Current step: Phase 4.2 - Product Surface Polish, Content Expansion Backlog & Admin Workflow Design

Status: Complete

Next recommended step: Phase 4.3 - Content Review Queue, Promise Cluster Expansion Drafts & Surface UX Refinement

## Product Surfaces Inspected

- Home dashboard: `teoyube-app/app/page.tsx`
- Explore/Canon: `teoyube-app/app/explore/page.tsx`, `teoyube-app/components/ExploreTabs.tsx`
- Daily Word and WordCard: `teoyube-app/components/WordCard.tsx`
- Promise Table preview: `src/components/teoyube/PromiseTablePreview.tsx`
- PrayerCompanion: `teoyube-app/components/PrayerCompanion.tsx`
- CompassExperience: `teoyube-app/components/compass/CompassExperience.tsx`
- TIGResponsePanel: `teoyube-app/src/components/tig/TIGResponsePanel.tsx`
- TIGGraphExplorer: `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`
- Consent, privacy, and terms routes under `teoyube-app/app/**`
- Phase 4.1 audit modules under `src/lib/teoyube/phase-4/**`

## Polish Needs Found

- WordCard Scripture labels could be clearer for normal users.
- Long Scripture references, Promise Cluster names, and explanation text need safe wrapping.
- Promise Table preview needed clearer review status copy and a safer empty state.
- TIGGraphExplorer exposed raw selected-node JSON directly to normal users.
- TIG graph fallback/list-mode copy needed clearer normal-user wording.
- Manual mobile and accessibility review remains required before broader public beta work.

## Safe UI Patches Made

- `teoyube-app/components/WordCard.tsx`
  - Changed `Scriptures` to `Scripture Anchors`.
  - Added wrapping to Scripture anchors, Promise Clusters, and explanation path text.
  - Renamed `Why this appears` to `Explanation Path`.

- `src/components/teoyube/PromiseTablePreview.tsx`
  - Added row-specific class for future polish.
  - Added wrapping to Scripture anchors and related words.
  - Renamed validation copy to `Review Status`.
  - Clarified empty state so it does not invent unsupported promises.

- `teoyube-app/src/components/tig/TIGGraphExplorer.tsx`
  - Clarified missing Scripture basis copy for relationships.
  - Improved Promise Table preview fallback message.
  - Moved raw selected-node JSON behind `Technical node data`.

These patches do not change engines, data flow, TIG graph logic, Scripture anchors, explanation paths, fallback behavior, confidence labels, consent notices, privacy notices, persistence, analytics, monitoring, admin auth, CMS, or live AI.

## Content Expansion Needs Found

- Vocabulary items without direct Scripture support need Scripture and owner review.
- Promise Clusters with fewer than two Scripture anchors need anchor-depth review.
- Scripture Canon entries not directly used by vocabulary or Promise Clusters need usage review.
- PrayerCompanion depth should grow only through reviewed Promise Cluster prayer sequences.
- Calling Compass paths need humble guidance, Scripture support, and explanation path review.
- Action steps need theology/copy review to stay gentle and non-professional.
- TIG relationships with weak or missing relationship depth need review before expansion.

## Scripture And Promise Coverage Gaps

The Phase 4.2 backlog uses Phase 4.1 coverage findings:

- Promise Clusters without strong anchor depth
- vocabulary without direct Scripture support
- unused Scripture Canon entries
- themes with weak Promise Cluster coverage

No unsupported Scripture references or unsupported promises are created.

## PrayerCompanion Depth Gaps

Prayer depth is treated as review backlog only. New prayer copy must have Scripture support where applicable, devotional boundaries, fallback safety, explanation path support, and owner/content review before production use.

## Calling Compass Depth Gaps

Calling depth is treated as review backlog only. Calling content must remain reflective and humble, avoid certainty claims, preserve Scripture anchors and explanation paths, and receive theology/owner review before future release.

## TIG Graph UX Gaps

TIG graph work remains UI polish and review backlog:

- improve relationship labels
- keep list fallback readable
- avoid dense unreadable graphs
- hide technical data by default
- keep Scripture basis visible or explicitly flagged for review

## Promise Table UX Gaps

Promise Table follow-up items:

- improve filter clarity
- improve compact row readability
- keep Scripture anchors visible
- keep missing-anchor review messages visible
- avoid creating unsupported promise rows for empty searches

## Admin/Content Workflow Needs

Phase 4.2 designs a future workflow for:

- content draft creation
- Scripture review
- theology review
- copy review
- owner review
- approval for future release
- blocked/archive handling
- change log concept
- rollback concept
- future CMS/admin requirements

No admin UI, admin authentication, database persistence, audit logging, CMS provider, or external service is connected.

## Backlog-Only Items

- new Teoyube vocabulary entries
- new Promise Clusters
- new Scripture anchors
- new prayer prompts
- new calling paths
- new action steps
- new TIG relationships
- production CMS/admin tooling
- admin login
- database persistence
- analytics
- monitoring provider
- live AI orchestration
- feedback storage
- user accounts

## What Remains For Phase 4.3

- Create a content review queue.
- Draft Promise Cluster expansion candidates for review only.
- Refine surface UX after manual mobile/accessibility review.
- Keep content expansion Scripture-anchored, explainable, confidence-aware, fallback-safe, privacy-protective, and owner-reviewed.
