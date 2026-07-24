# Prompt 22 migration ledger

## Scope

Owner decision: `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`

Authorized: repository/local runtime commands, runtime metadata, legacy URL
compatibility, owner-route protection, dual-runtime tests, rollback tooling,
and cutover documentation.

Not authorized: public deployment, Gate C-Production, visual changes, baseline
updates, feature consolidation, external feature enablement, archive deletion,
or Prompt 23.

## Added runtime ownership

| Capability | Owner |
| --- | --- |
| Safe Next production launch | `scripts/runtime/start-next.cjs` |
| Build and port validation | `scripts/runtime/runtime-launcher-lib.cjs` |
| Canonical contract verification | `scripts/runtime/verify-runtime-contract.cjs` |
| Next → static → Next drill | `scripts/runtime/verify-dual-runtime.cjs` |
| Safe status | `scripts/runtime/runtime-status.cjs` |
| Canonical metadata | `config/runtime/canonical-runtime-manifest.json` |
| Routes and legacy URLs | `config/runtime/route-compatibility-manifest.json` |
| Assets and media | `config/runtime/asset-media-compatibility-manifest.json` |
| Browser fragment adapter | `src/app/_runtime/LegacyHashCompatibility.tsx` |

## Preserved ownership

- `server.js` remains the original static runtime.
- `index.html`, `app.js`, all styles, `public/`, `Asset/`, media UI files,
  immutable screenshots, DOM snapshots, support baselines, and Scripture-delta
  baselines remain protected and unchanged.
- Prompt 13–21 feature, domain, safety, Scripture, TIG, memory, AI, retrieval,
  and observability ownership remains unchanged.
- `/compass` remains the only Prompt 12D canonical route alias.
- The Phase 11.6C.3 publication-integrity blocker remains separate and
  unchanged.

## Removal ledger

Nothing is removed. The static runtime and all compatibility adapters remain
protected. Prompt 23 remains locked.
