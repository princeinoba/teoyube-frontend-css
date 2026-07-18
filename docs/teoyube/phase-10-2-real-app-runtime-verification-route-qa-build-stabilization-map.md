# Phase 10.2 Map - Real App Runtime Verification, Route QA & Build Stabilization

## Detected App Root

The real app root is `teoyube-app`.

The repository root also contains the older static/prototype shell with `server.js`, `app.js`, `index.html`, and root `src/lib` architecture modules, but the functioning app surface is the Next app in `teoyube-app`.

## Detected Framework

- Framework: Next.js
- Router: App Router
- Config: `teoyube-app/next.config.js`
- TypeScript config: `teoyube-app/tsconfig.json`
- Package manager evidence: `pnpm-lock.yaml` and `pnpm-workspace.yaml` are present, but `pnpm` is not installed in the current shell. `npm` is available.

## Detected Package Scripts

`teoyube-app/package.json` defines:

- `dev`: `next dev`
- `build`: `next build`
- `start`: `next start`

Missing scripts:

- `typecheck`
- `lint`
- `test`

## Route And Page Inventory

App pages and route handlers found:

- `/` - `teoyube-app/app/page.tsx`
- `/explore` - `teoyube-app/app/explore/page.tsx`
- `/prayer` - `teoyube-app/app/prayer/page.tsx`
- `/compass` - `teoyube-app/app/compass/page.tsx`
- `/privacy` - `teoyube-app/app/privacy/page.tsx`
- `/consent` - `teoyube-app/app/consent/page.tsx`
- `/terms` - `teoyube-app/app/terms/page.tsx`
- `/journal` - `teoyube-app/app/journal/page.tsx`
- `/profile` - `teoyube-app/app/profile/page.tsx`
- `/tig` - `teoyube-app/app/tig/page.tsx`
- `/tig/graph` - `teoyube-app/app/tig/graph/page.tsx`
- `/tig/journey` - `teoyube-app/app/tig/journey/page.tsx`
- `/tig/traversal` - `teoyube-app/app/tig/traversal/page.tsx`
- `/tig/journal` - `teoyube-app/app/tig/journal/page.tsx`
- `/tig/progress` - `teoyube-app/app/tig/progress/page.tsx`
- `/tig/onboarding` - `teoyube-app/app/tig/onboarding/page.tsx`
- `/tig/data` - `teoyube-app/app/tig/data/page.tsx`
- `/tig/privacy` - `teoyube-app/app/tig/privacy/page.tsx`
- `/tig/debug` - `teoyube-app/app/tig/debug/page.tsx`
- `/api/daily-word` - `teoyube-app/app/api/daily-word/route.ts`
- `/api/tig` - `teoyube-app/app/api/tig/route.ts`
- `/api/youtube/teoyube` - `teoyube-app/app/api/youtube/teoyube/route.ts`
- `/api/ai/companion` - `teoyube-app/app/api/ai/companion/route.ts`

## Component Inventory

Core app components found:

- `WordCard`
- `PrayerCompanion`
- `CompassExperience`
- `TIGResponsePanel`
- `TIGGraphExplorer`
- `TIGGraphMap`
- `TIGSearchPanel`
- `TIGPrivacyPanel`
- `TIGDataManagerPanel`
- `MobileSafeErrorBoundary`
- public notice components for consent, privacy, sensitive information, terms, feedback, limitations, and AI/TIG transparency

## Data File Inventory

App data files found and parsed:

- `teoyube-app/data/words.json` - 108 records
- `teoyube-app/data/promiseClusters.json` - 12 records
- `teoyube-app/data/scriptureCanon.json` - 108 records
- `teoyube-app/data/prayers.json` - 12 records
- `teoyube-app/data/graphRelationships.json` - 132 records

Root Teoyube data files found and parsed:

- `src/data/coreTeoyubeVocabulary.json` - 72 records
- `src/data/promiseClusters.json` - 12 records
- `src/data/scriptureCanon.json` - 108 records

## Build, Typecheck, Lint, And Test Status Before Fixes

Commands run from `teoyube-app`:

- `npm run typecheck` - failed; missing script
- `npm run lint` - failed; missing script
- `npm run build` - failed; `next` is not recognized because dependencies are not installed
- `npm run test` - failed; missing script
- `npm run dev` - failed; `next` is not recognized because dependencies are not installed
- `pnpm --version` - failed; pnpm command is unavailable

## Runtime Risks Found

- `teoyube-app/node_modules` is absent.
- The Next runtime cannot start.
- Routes cannot be rendered locally yet.
- Build cannot run until dependencies are installed.
- Typecheck, lint, and test scripts are not defined.
- `/api/youtube/teoyube` depended on YouTube lookup; this has been gated off for local verification unless explicitly enabled later.
- `/api/ai/companion` returned an internal production object; this was removed from normal API output.

## Broken Import Or Export Risks

Full import/export proof is blocked by the missing TypeScript/Next toolchain. Static inspection did not identify a safe import/export patch beyond the API and external lookup safety fixes.

## Route Rendering Risks

Route source files exist, but no route was rendered locally because `npm run dev` cannot start without `next`.

## Data Loading Risks

JSON parse checks passed for app data and root Teoyube data. Runtime import proof is still blocked until the app can build.

## Safe Patches Applied

- `teoyube-app/lib/youtube.ts`: added `TEOYUBE_ENABLE_YOUTUBE_LOOKUP` gate so local verification cannot call YouTube unless explicitly enabled later.
- `teoyube-app/app/api/ai/companion/route.ts`: removed the internal `production` payload from the normal API response while preserving Scripture anchor, explanation path, confidence label, fallback, and safety status.

## Remaining Blockers

- Install dependencies for `teoyube-app` without adding unapproved services.
- Rerun build from `teoyube-app`.
- Add or document typecheck/lint/test scripts before relying on them.
- Start the local Next dev server and verify routes/components once dependencies exist.

## What Remains For Phase 10.3

Phase 10.3 should not begin until Phase 10.2 blockers are fixed. After build/runtime verification passes, Phase 10.3 can cover deployment readiness, environment review, and production build verification.
