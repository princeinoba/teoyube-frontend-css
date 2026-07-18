# Phase 4.3 Content Review Queue, Promise Drafts & Surface UX Map

Current major milestone: TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions

Current step: Phase 4.3 - Content Review Queue, Promise Cluster Expansion Drafts & Surface UX Refinement

## Backlog Inspected

Phase 4.3 extends the Phase 4.2 backlog and review workflow instead of replacing it.

Inspected Phase 4.2 modules:

- `content-expansion-contracts.ts`
- `content-expansion-backlog.ts`
- `scripture-promise-content-review-workflow.ts`
- `prayer-calling-content-review-workflow.ts`
- `product-surface-polish-contracts.ts`
- `product-surface-polish-planner.ts`
- `admin-content-workflow-contracts.ts`
- `admin-content-workflow-design.ts`
- `admin-workflow-service-requirements.ts`
- `phase-4-2-owner-review.ts`
- `phase-4-2-package.ts`
- `phase-4-2-audit.ts`

Backlog areas carried forward into the review queue:

- Vocabulary Scripture support review
- Promise Cluster anchor depth review
- Scripture Canon usage review
- PrayerCompanion prompt depth
- Calling Compass path depth
- Action step depth
- TIG relationship depth
- WordCard copy polish
- Promise Table copy polish
- PrayerCompanion copy polish
- Calling Compass copy polish
- Canon and Daily Word copy polish

## Review Queue Needs

The Phase 4.3 queue needs a stable, manual, in-memory structure that can track:

- item type
- source ids
- source surface
- content area
- priority
- review state
- Scripture review requirement
- theology review requirement
- copy review requirement
- owner review requirement
- production exclusion
- live recommendation exclusion

The queue does not persist externally and does not publish draft content.

## Promise Cluster Expansion Opportunities

Promise Cluster draft opportunities are derived from existing data and coverage audits:

- Promise Clusters with fewer than two Scripture anchors
- themes with weak Promise Cluster coverage
- vocabulary words with weak Promise/Scripture support
- Scripture Canon entries not yet used by vocabulary or Promise Clusters

Drafts are review-only. They do not modify `src/data/promiseClusters.json`, do not invent Scripture references, and do not create unsupported promise claims.

## Scripture Anchor Review Needs

Scripture anchor drafts must verify:

- the reference exists in Scripture Canon or is explicitly marked for manual verification
- proposed use is relevant to a word, theme, Promise Cluster, prayer, calling, action, or TIG relationship
- no unsupported interpretation is introduced
- no divine-certainty claim is introduced
- owner, Scripture, and theology review are required before future production use

## PrayerCompanion Gaps

Prayer draft review must preserve:

- devotional encouragement boundaries
- Scripture support or explanation path
- safe fallback copy
- no unsupported promises
- no professional advice
- no persistence of user prayer text

## Calling Compass Gaps

Calling draft review must preserve:

- humble and non-deterministic calling language
- Scripture support or explanation path
- action suggestions that remain general and safe
- visible confidence and fallback boundaries

## Action Step Gaps

Action step drafts must remain:

- safe and general
- non-professional advice
- review-only
- explanation-path aware
- excluded from live recommendation flows

## TIG Relationship Gaps

TIG relationship drafts must protect:

- relationship source and target ids
- explanation trace compatibility
- Scripture anchors where applicable
- visible confidence boundaries
- no hidden personalization
- no unsupported relationship claims

## Surface UX Refinement Needs

Phase 4.3 inherits the safe Phase 4.2 UI patch record and adds a refinement plan for:

- review-only and fallback labels
- Promise Table reviewed-content indicators after reviewed drafts exist
- TIG graph density and mobile list fallback review
- manual mobile review
- manual accessibility review

No additional live UI file patch was required in this step. The Phase 4.2 safe patches remain recorded and verified.

## Review-Only Draft Rules

All Phase 4.3 draft content must be:

- `reviewOnly: true`
- `productionEligible: false`
- excluded from live recommendation flows
- Scripture-review required
- theology-review required
- copy-review required where visible copy is involved
- owner-review required
- in-memory/manual only

Phase 4.3 does not add production publishing, CMS, admin login, database persistence, analytics, production monitoring providers, live AI orchestration, browser persistence, or external service connections.

## What Remains For Phase 4.4

Phase 4.4 should begin only after owner review decides which drafts are safe to integrate. Recommended focus:

- reviewed content integration
- Promise Table UX for reviewed content status
- TIG graph experience polish with reviewed relationships only
- manual mobile/accessibility review
- owner-approved Scripture/theology/copy decisions
