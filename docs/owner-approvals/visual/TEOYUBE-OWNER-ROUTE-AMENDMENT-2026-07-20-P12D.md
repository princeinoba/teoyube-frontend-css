# Teoyube Prompt 12D Route Amendment

Amendment ID: `TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D`

Owner decision date: `2026-07-20`

Owner role: Teoyube Project Owner

Starting evidence commit: `750862ded54898d64f36b8e074f77e88f8ce3920`

## Superseded assumptions

This amendment supersedes only the assumptions that `/promise-search` may redirect to `/search`, that `/dashboard` belongs in the retained public support-baseline set, and that public visibility may be inferred from a hard-coded route count. It also carries forward the Prompt 12C decisions that `/daily-word` and `/explore` retain their distinct public behavior.

No immutable static baseline, protected visual source, stylesheet, asset, DOM contract, frozen pre-migration contract, or previously recorded measurement is changed by this decision.

## Promise Search evidence and decision

`/promise-search` is retained public and must not redirect to `/search`. At the bound commit it renders `TeoyubeSearchScreenshotPage`, owns controlled query state, projects six results, and calls the separate `runTeoyubeSearch`/`searchTeoyubeCanon` pipeline. `/search` uses `SearchPageController`, `createApprovedSearchViewModel`, and the typed search application service. Redirecting would discard distinct behavior and results.

The exact current `/promise-search` render and interaction states may become an owner-approved Next support baseline only after all six required viewports, its query behavior, result projection, Scripture/promise content, focus order, responsive behavior, accessibility findings, and artifact hashes verify.

## Corrected route taxonomy

| Route group | Visibility | Parity source | Required gate treatment |
| --- | --- | --- | --- |
| `/prayer`, `/journey`, `/journal` | `RETAINED_PUBLIC` | `FROZEN_PRE_MIGRATION` | Existing responsive, DOM/class, functional, and safety contracts must pass without regeneration |
| `/settings`, `/privacy`, `/consent`, `/terms`, `/profile`, `/personalization`, `/daily-word`, `/explore`, `/promise-search` | `RETAINED_PUBLIC` | `OWNER_APPROVED_NEXT_SUPPORT` | Exact current support baselines and functional contracts must pass |
| `/compass` -> `/calling-compass` | `RETAINED_PUBLIC` alias | `CANONICAL_REDIRECT` | Permanent no-loss redirect and safe query behavior must pass |
| `/dashboard` | `DEVELOPMENT_ONLY` | `NOT_APPLICABLE` | Must remain outside normal public navigation and outside the public baseline |
| `/graph`, TIG data/debug/traversal routes | `INTERNAL_ONLY` or `DEVELOPMENT_ONLY` | `NOT_APPLICABLE` | Must remain outside normal public navigation |
| `/roadmap` | `OWNER_ONLY` | `IMMUTABLE_STATIC` | Remains owner-only and is not a public cutover candidate |

The validated non-static retained-public total is twelve: three frozen pre-migration routes plus nine owner-approved Next support routes. The Compass alias is recorded separately as a canonical redirect.

## Support-baseline conditions

- Store the nine-route baseline only under `tests/visual/baselines/owner-approved-next-support/`.
- Bind every artifact to this amendment ID, the exact evidence commit, route, viewport, state, and SHA-256 hash.
- Preserve the existing Promise Search, Daily Word, and Explore behavior without merging, redirecting, flattening, or redesigning it.
- Never write into `tests/visual/baselines/static-runtime/` or regenerate frozen pre-migration contracts.
- Future differences require a new scoped owner decision.

## Runtime status

- Static runtime: canonical.
- `npm start`: remains the static `server.js` runtime.
- Next runtime: preview only.
- Runtime cutover: not authorized.
- Prompt 13: remains locked until every Prompt 12D executable gate passes.
- Prompt 14: not authorized.

