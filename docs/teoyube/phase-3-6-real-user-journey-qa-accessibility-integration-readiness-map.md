# Phase 3.6 Real User Journey QA, Accessibility, and Integration Readiness Map

Current milestone: TEOYUBE Phase 3 - Intelligent Architecture Integration

Current step: Phase 3.6 - Real User Journey QA, Accessibility Pass & Integration Readiness

Status: Complete

Next recommended step: Phase 3.7 - Phase 3 Completion Review, Integration Lock & Phase 4 Roadmap

## Pages and Routes Inspected

- `/`
- `/explore`
- `/prayer`
- `/compass`
- `/tig`
- `/tig/graph`
- `/tig/journey`
- `/tig/onboarding`
- `/consent`
- `/privacy`
- `/terms`
- Supporting TIG routes: `/tig/data`, `/tig/debug`, `/tig/journal`, `/tig/privacy`, `/tig/progress`, `/tig/traversal`

## Journey Flows Inspected

- Home/dashboard journey
- Daily Word and WordCard journey
- Promise Cluster and Promise Table journey
- PrayerCompanion journey
- CompassExperience calling journey
- TIGResponsePanel recommendation journey
- TIGGraphExplorer graph/list journey
- Fallback state journey
- Privacy notice and consent-control surfaces

## UI Surfaces Inspected

- `WordCard`
- `PrayerCompanion`
- `CompassExperience`
- `TIGResponsePanel`
- `TIGGraphExplorer`
- `PromiseTable`
- `Canon`
- `DailyWord`
- `Prayer`
- `Calling`
- Fallback, privacy, and consent surfaces

## Real Data Used in QA

- `src/data/coreTeoyubeVocabulary.json`
- `src/data/promiseClusters.json`
- `src/data/scriptureCanon.json`
- Real Phase 3 data contracts and normalization helpers
- Promise Engine context
- Teoyube Language Engine context
- Calling Engine context
- Theology Framework boundary validation
- TIG end-to-end recommendation flow
- Journey orchestrator and route-level page helpers
- Existing UI adapter payloads

## Accessibility Issues Found

- `teoyube-app/components/PrayerCompanion.tsx` used a textarea placeholder without an explicit accessible label.

Patched:

- Added `aria-label="Prayer need"` to the PrayerCompanion textarea.

Remaining accessibility notes:

- Phase 3.6 provides structured accessibility QA checks for headings, labels, native keyboard controls, semantic grouping, overflow, graph/list fallback, explanation visibility, and fallback clarity.
- Browser and assistive technology testing still remains a manual Phase 3.7 review item.

## Mobile Issues Found

- TIG graph surfaces need list fallback protection on compact screens.
- Promise Table surfaces need compact row/list rendering checks.
- Long Scripture anchors, explanation summaries, fallback messages, and confidence labels need wrapping checks.

Phase 3.6 response:

- Added `mobile-journey-qa-runner.ts` to validate stacked payload readiness, graph list fallback, Promise Table rows, Scripture visibility, trace visibility, confidence labels, and fallback readability.
- No mobile layout rewrite was performed.

## Fallback Issues Found

- Fallback behavior already exists in the Phase 3.4 TIG flow and Phase 3.5 journey layer.
- Phase 3.6 adds validation that fallback states are safe, non-empty, explain why they were used, and remain visible in UI payloads.

## Scripture, Explanation, and Confidence Issues Found

- Scripture anchors, explanation traces, and confidence labels are already preserved by the TIG flow and journey orchestrator.
- Phase 3.6 adds dedicated QA to prevent regressions where a selected promise loses anchors, a journey loses its trace, or a confidence label is hidden.
- Phase 3.6 also checks for unsafe certainty-overclaiming phrases in user-facing journey text.

## Files Patched

- `teoyube-app/components/PrayerCompanion.tsx`

## Files Added

- `src/lib/teoyube/qa/real-user-journey-qa-contracts.ts`
- `src/lib/teoyube/qa/real-user-journey-qa-scenarios.ts`
- `src/lib/teoyube/qa/real-user-journey-qa-runner.ts`
- `src/lib/teoyube/qa/accessibility-qa-contracts.ts`
- `src/lib/teoyube/qa/accessibility-qa-runner.ts`
- `src/lib/teoyube/qa/mobile-journey-qa-runner.ts`
- `src/lib/teoyube/qa/scripture-explanation-confidence-qa.ts`
- `src/lib/teoyube/qa/phase-3-integration-readiness-checklist.ts`
- `src/lib/teoyube/qa/index.ts`
- `src/lib/teoyube/integration/phase-3-6-qa-accessibility-validation.ts`
- `src/lib/teoyube/integration/phase-3-6-integration-audit.ts`
- `src/lib/teoyube/examples/phase-3-6-real-user-journey-qa-example.ts`
- `src/lib/teoyube/examples/phase-3-6-real-user-journey-qa-smoke-check.ts`

## Remaining Risks

- Manual browser, keyboard, screen-reader, and device testing still needs owner review.
- `teoyube-app/components/compass/CompassExperience.tsx` retains an existing optional video API fetch path. Phase 3.6 does not add or depend on it.
- Any future service connection must wait for explicit owner approval, privacy/consent review, payload sanitization, and Phase 3.7 integration lock.

## Phase 3.7 Follow-Up

- Review Phase 3 completion as a single integrated architecture.
- Lock the Phase 3 integration boundary before Phase 4 planning.
- Run manual browser/device accessibility review.
- Confirm any existing optional network paths are either disabled, explicitly approved, or isolated behind launch decisions.
