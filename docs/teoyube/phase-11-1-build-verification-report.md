# Phase 11.1 Build Verification Report

## Available Scripts

Root `package.json` exposes:

- `npm run start`
- `npm run seed:vocabulary`
- `npm run seed:promise-clusters`
- `npm run seed:canon`
- `npm run seed:scripture`
- `npm run seed:tkos`

It does not expose `typecheck`, `lint`, `build`, or `test`.

## Required Checks

| Command | Result |
| --- | --- |
| `npm run typecheck` | Failed: missing script |
| `npm run lint` | Failed: missing script |
| `npm run build` | Failed: missing script |
| `npm run test` | Failed: missing script |

## Static Runtime Checks

| Command | Result |
| --- | --- |
| `node --check app.js` | Passed |
| `node --check server.js` | Passed |
| `Invoke-WebRequest http://127.0.0.1:4173` | HTTP 200 |

## TypeScript Smoke Checks

The Phase 11.1 TypeScript smoke files are present under `src/lib/teoyube/examples/**`, but the root workspace has no TypeScript compiler dependency and no `typecheck` script. They are source-updated for the static app and remain ready for a future compiler-enabled run.

## Status

For the current static Node app, runtime verification passes. Formal TypeScript/build/lint/test verification is unavailable until project scripts/tooling are added.
