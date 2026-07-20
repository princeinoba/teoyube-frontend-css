# Owner-Approved Next Support Routes

Current amendment: `TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D`

Evidence commit: `750862ded54898d64f36b8e074f77e88f8ce3920`

Canonical runtime: static Node application. Next remains preview-only.

## Baseline scope

The approved support baseline contains exactly these nine retained public routes:

| Route | Default captures | Interaction captures | Gate result |
| --- | ---: | ---: | --- |
| `/settings` | 6 | 2 — personalization disabled | `PASS` |
| `/privacy` | 6 | 0 — informational route | `PASS` |
| `/consent` | 6 | 0 — informational route | `PASS` |
| `/terms` | 6 | 0 — informational route | `PASS` |
| `/profile` | 6 | 0 — read-only profile route | `PASS` |
| `/personalization` | 6 | 2 — wisdom signal | `PASS` |
| `/daily-word` | 6 | 2 — generated session | `PASS` |
| `/explore` | 6 | 6 — Clusters, Promise Table, filtered Wisdom | `PASS` |
| `/promise-search` | 6 | 4 — Wisdom query and keyboard query | `PASS` |

Total: 54 default captures plus 16 interaction captures. Each capture stores a viewport screenshot, rich DOM/class/asset/geometry/label/control/focus/responsive contract, and accessibility/performance/storage audit under `tests/visual/baselines/owner-approved-next-support/`.

The manifest binds every artifact to the owner amendment, commit, route, viewport, state, and SHA-256 hash. `scripts/recovery/verifyOwnerApprovedNextSupportBaselines.cjs` verifies the complete 211-file tree read-only.

## Current behavior boundaries

- Promise Search retains its controlled query state, deterministic `runTeoyubeSearch`/`searchTeoyubeCanon` pipeline, Scripture/promise result content, and projection capped at six visible rows. Input changes update results immediately; Enter retains the query and route. The current approved route has no separate loading or empty state because its local fallback always returns rows.
- Daily Word keeps its visible Scripture, promise, action, prayer, confidence, explanation, and Generate Today's Journey action. The action updates session-only React state and writes neither local nor session storage. The approved route does not contain a reflection-entry control; reflection remains the separately retained `/journal` capability, and Prompt 12D does not invent a new visible control.
- Explore keeps both TIG production panels, the read-only Canon journey-state summary, nine tabs, local filtering, and Promise Table projection. The journey summary is currently read-only; the approved interactive states are tabs and filtering.

## Other route sources

| Route(s) | Visibility | Parity source | Gate status |
| --- | --- | --- | --- |
| `/prayer`, `/journey`, `/journal` | `RETAINED_PUBLIC` | `FROZEN_PRE_MIGRATION` | `PASS` |
| `/compass` → `/calling-compass` | `RETAINED_PUBLIC` alias | `CANONICAL_REDIRECT` | `PASS` |
| `/dashboard` | `DEVELOPMENT_ONLY` | `NOT_APPLICABLE` | `NOT_APPLICABLE_INTERNAL_ROUTE` |
| `/graph` and TIG data/traversal surfaces | `INTERNAL_ONLY` | `NOT_APPLICABLE` | `NOT_APPLICABLE_INTERNAL_ROUTE` |
| `/roadmap` | `OWNER_ONLY` | `IMMUTABLE_STATIC` | `NOT_APPLICABLE_INTERNAL_ROUTE` |

Dashboard, internal routes, and owner-only routes are absent from normal public navigation and receive no Prompt 12D public baseline.

## Protection rules

- Never write into `tests/visual/baselines/static-runtime/`.
- Never regenerate Prayer, Journey, or Journal frozen contracts merely to close a gate.
- Candidate captures remain disposable under `.tmp/visual-parity/`.
- A future difference from this support tree requires another scoped owner decision.

