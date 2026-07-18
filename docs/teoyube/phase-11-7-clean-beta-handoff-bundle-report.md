# Phase 11.7 Clean Beta Handoff Bundle Report

Phase 11.7 adds `scripts/createBetaBundle.cjs` and package script `npm run bundle:beta`.

## Included

- Static app files.
- `server.js`.
- `package.json` and lockfile.
- `scripts/`.
- `src/`.
- `docs/teoyube/`.
- `public/` assets.
- `Asset/` if present.
- `.env.example`.
- Run instructions and generated bundle manifest.

## Excluded

- `.git`
- `.next`
- `.tmp`
- `node_modules`
- caches
- logs
- zip files
- generated screenshots/test artifacts
- `.env`, `.env.local`, and local env variants

## Output

The bundle is generated under `.tmp/teoyube-beta-handoff/teoyube-beta-phase-11-7` with `RUN_BETA.md` and `BETA_BUNDLE_MANIFEST.json`.
