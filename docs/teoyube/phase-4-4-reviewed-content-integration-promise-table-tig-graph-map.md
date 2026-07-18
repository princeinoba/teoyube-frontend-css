# Phase 4.4 Reviewed Content Integration, Promise Table UX & TIG Graph Map

Current major milestone: TEOYUBE Phase 4 - Product Experience Expansion, Content Depth & Controlled Service Decisions

Current step: Phase 4.4 - Reviewed Content Integration, Promise Table UX & TIG Graph Experience Polish

## Phase 4.3 Files Found

Phase 4.4 builds on the Phase 4.3 review-only layer:

- `content-review-queue-contracts.ts`
- `content-review-queue-manager.ts`
- `content-backlog-to-review-queue.ts`
- `promise-cluster-expansion-draft-contracts.ts`
- `promise-cluster-expansion-draft-builder.ts`
- `scripture-anchor-draft-review.ts`
- `prayer-calling-action-draft-review.ts`
- `tig-relationship-draft-review.ts`
- `content-draft-safety-validator.ts`
- `surface-ux-refinement-contracts.ts`
- `surface-ux-refinement-planner.ts`
- `surface-ux-refinement-qa.ts`
- `phase-4-3-owner-review.ts`
- `phase-4-3-package.ts`
- `phase-4-3-audit.ts`

## Draft And Review Status Structures Found

Phase 4.3 already marks drafts as:

- review-only
- draft
- production ineligible
- excluded from live recommendation flows
- Scripture-review required
- theology-review required
- copy-review required where needed
- owner-review required

Phase 4.4 adds a separate reviewed-content integration gate. It does not treat Phase 4.3 draft records as production candidates unless all review metadata and production eligibility are explicitly recorded.

## Reviewed Content Integration Needs

Reviewed content needs:

- a gate that blocks review-only drafts
- a release candidate builder that remains in-memory/manual
- an integration planner that separates ready, review-needed, blocked, and deferred items
- QA checks for Scripture anchors, theology boundaries, production eligibility, draft exclusion, unsupported claims, fallback safety, and confidence boundaries

Existing production data may be represented as a manual release candidate when review metadata is explicit and no blockers are present.

## Promise Table Implementation Found

Promise Table rows are generated through `src/lib/teoyube/promises/promise-table.ts` from the existing Promise Engine, Promise Clusters, Scripture anchors, related Teoyube words, calling links, prayer links, and TIG edges.

`src/components/teoyube/PromiseTablePreview.tsx` already renders Promise Table rows as card-style rows with:

- theme
- Scripture anchors
- related words
- calling links
- TIG edge count
- review status
- safe empty state

## Promise Table UX Issues Found

Remaining Promise Table UX needs are primarily model/report-level:

- mobile list view data
- Scripture focus view data
- card grid data
- filter and sort models
- explicit no-draft-content QA
- missing-anchor warnings that stay visible

No additional Promise Table UI patch was required in this step.

## TIG Graph Implementation Found

`teoyube-app/src/components/tig/TIGGraphExplorer.tsx` already uses the TIG seed graph, query client, visualization builder, Promise Table preview rows, selected-node relationships, connected nodes, and a technical details disclosure for raw selected-node data.

`teoyube-app/src/components/tig/TIGResponsePanel.tsx` displays integrated context, Scripture anchors, confidence, fallback state, explanation path, production graph preview, and graph trace.

## TIG Graph UX Issues Found

Phase 4.4 identified these TIG graph UX needs:

- normal-user node and edge view-model labels
- relationship-list fallback for mobile and incomplete graphs
- guided trace overlay
- legend data
- no raw debug payload in normal response trace display
- Scripture basis warnings that remain visible where data is incomplete

## Scripture, Explanation, And Confidence Display

Current surfaces preserve:

- Scripture anchors in WordCard, Promise Table, PrayerCompanion, CompassExperience, TIGGraphExplorer, and TIGResponsePanel
- explanation paths in TIGResponsePanel and integrated contexts
- confidence labels in PrayerCompanion, CompassExperience, TIGGraphExplorer, and TIGResponsePanel
- fallback copy and fallback reasons where used

## Safe UI Patches Made

Phase 4.4 made one safe local UI patch:

- `teoyube-app/src/components/tig/TIGResponsePanel.tsx` now renders graph trace as readable trace summaries instead of raw JSON.

The patch does not change TIG logic, remove graph behavior, hide Scripture anchors, remove explanation paths, remove fallback handling, hide confidence labels, add persistence, add analytics, or connect services.

## Content That Remains Review-Only

Phase 4.3 Promise Cluster expansion drafts, Scripture anchor drafts, Prayer/Calling/Action drafts, and TIG relationship drafts remain review-only until Scripture, theology, copy where needed, and owner review are recorded.

Phase 4.4 release candidates are not automatically published and are not added to live recommendation flows.

## What Remains For Phase 4.5

Phase 4.5 should focus on:

- controlled admin workflow prototype
- service readiness review
- beta QA plan
- owner-reviewed content workflow decisions
- service connection decisions that remain disabled until explicitly approved
