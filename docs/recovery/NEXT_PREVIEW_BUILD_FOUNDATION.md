# Next Preview Build Foundation

## Authority and scope

The static runtime served by `npm start` and `npm run prototype:start` remains canonical. The Next application is an independently installable private preview only. This work does not authorize publication, cutover, visual redesign, live AI, external persistence, analytics, or baseline regeneration.

No failed-redesign workspace was available during R2. Every file below was independently reviewed or recreated in the clean recovery repository. No stylesheet, static HTML, asset, public media, protected source manifest, DOM contract, or immutable screenshot was changed.

## Toolchain

- Node: `>=22.13.0 <25`; repository version files select `22.20.0`.
- npm: `>=10.2.4 <11`; `package-lock.json` is authoritative.
- Next: `16.2.10`; React and React DOM: `19.2.7`.
- TypeScript: `5.9.3`; ESLint: `9.39.5`; Vitest: `4.1.10`; Playwright: `1.61.1`; Zod: `4.4.3`.
- PostCSS is overridden to `8.5.19` because Next's pinned `8.4.31` is covered by GHSA-qx2v-qp2m-jg93. No breaking Next downgrade was accepted.

## Verification boundary

`tsconfig.next.json` is a strict boundary for the newly restored environment, health, and test foundation. It intentionally does not claim that every historical migration file is strict-clean. `next build` still compiles and prerenders the complete preview route graph; expanding the standalone strict boundary is later migration work and must not be used to justify visual edits.

`npm run lint` covers the independently restored foundation and applies UI/domain import restrictions from `eslint.config.mjs`. It does not claim that protected static JavaScript or every historical migration file is lint-clean.

## Environment and health contract

All provider keys, database URLs, and telemetry credentials remain server-only. Missing or invalid feature flags resolve to disabled. `/api/health` exposes only a sanitized build version, runtime/environment labels, and enabled booleans; it never returns secret values. No external service is contacted by the application.

## Selectively recreated files

| File | Allowlisted reason |
| --- | --- |
| `.nvmrc`, `.node-version` | Node version policy. |
| `package.json`, `package-lock.json` | Reproducible dependencies, preview scripts, engines, and the security override. Static `start` is unchanged. |
| `.gitignore` | Excludes generated Next, coverage, and browser-test output. |
| `next.config.mjs` | Strict TypeScript config selection and repository-local Turbopack root. |
| `tsconfig.next.json` | Separate strict Next preview boundary. |
| `eslint.config.mjs` | Foundation linting and architecture import rules. |
| `vitest.config.mts`, `playwright.config.ts` | Unit and request-level browser-test configuration. |
| `scripts/runNextPreviewE2E.cjs` | Owns the local preview server lifecycle so the health test terminates reliably on Windows and CI. |
| `.env.example`, `src/config/environment.ts`, `src/config/health.ts` | Typed, fail-safe environment parsing and secret-safe health metadata. |
| `src/app/api/health/route.ts` | Nonvisual health endpoint with no-store output. |
| `tests/build-foundation/environment.test.ts`, `tests/build-foundation/health.test.ts` | Environment and secret-exposure regression tests. |
| `tests/e2e/health.spec.ts` | Minimal request-level e2e health test. |
| `.github/workflows/recovery-contract.yml` | Moves existing recovery verification to the declared Node baseline. |
| `.github/workflows/next-preview-foundation.yml` | Clean-install, recovery, type, lint, unit, build, and health CI. |
| `src/components/tig/TIGPrivacyPanel.tsx` | Nonvisual import correction: the existing limitation notice is imported from its actual owner module. Markup and copy are unchanged. |
| `src/app/profile/page.tsx` | Nonvisual prerender guard: absent optional `scriptureFlow` data becomes an empty list instead of crashing. Markup, classes, and populated output are unchanged. |

## Commands

```text
npm ci
npm run recovery:verify
npm run typecheck
npm run lint
npm run test
npm run app:build
npm run test:e2e
npm run prototype:start
```

`npm run app:dev` and `npm run app:start` operate only the private preview. Default `npm start` continues to serve the original static runtime.
