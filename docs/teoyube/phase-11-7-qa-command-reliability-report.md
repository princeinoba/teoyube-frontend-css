# Phase 11.7 QA Command Reliability Report

Phase 11.7 separates static and runtime checks:

- `npm run check:static` runs import and Phase 11 smoke gates without requiring a pre-running server.
- `npm run check:runtime` starts or reuses the local static server and verifies HTTP reachability.
- `npm run check` delegates to `check:static`.
- `npm run phase11:qa` now includes Phase 11.7 smoke coverage.

## Reliability Fix

`scripts/phase11Smoke.cjs` now treats local server reachability as optional unless `TEOYUBE_REQUIRE_RUNTIME=1` is set. This prevents fresh-workspace static QA from failing before the server is started.

## Runtime Gate

`scripts/checkRuntime.cjs` performs the stricter local server check separately.
