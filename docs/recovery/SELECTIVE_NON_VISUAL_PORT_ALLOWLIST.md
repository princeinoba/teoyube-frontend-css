# Selective Non-Visual Port Allowlist

The prior Codex workspace must never be merged wholesale into this recovery branch. Only reviewed, independently verified, non-visual improvements may be recreated or selectively copied.

## Potentially allowed after review

- Node version policy: `.nvmrc`, `.node-version`, and `package.json#engines`
- dependency and lockfile changes required for a reproducible Next preview build
- separate strict TypeScript boundaries
- ESLint configuration and architecture-boundary rules
- unit-test and browser-test configuration
- typed environment parsing under `src/config/**`
- a secret-safe health route under `src/app/api/health/**`
- test fixtures for environment parsing and health metadata
- CI workflow files under `.github/workflows/**`
- build documentation that contains no false completion claims

## Never copy from the prior workspace without a new owner approval and parity proof

- `styles.css`
- `styles/**`
- `public/**`
- `Asset/**`
- `index.html`
- user-facing portions of `app.js`
- page JSX/TSX that introduced generic heroes, cards, navigation, or journey layouts
- `src/features/**` visual components from the failed redesign
- altered `src/app/**/page.tsx` files from the failed redesign
- generated screenshots that depict the redesigned application
- updated visual snapshots that bless the redesign
- any deletion, consolidation, or relocation of visual assets

## Required import process

For each candidate file:

1. Record its source workspace and source commit if available.
2. Review its full diff against this branch.
3. Confirm it does not import or alter visual files.
4. Run `npm run recovery:visual:verify` before applying it.
5. Apply one coherent file group only.
6. Run visual verification again.
7. Run the new build/test command the file enables.
8. Commit separately with an exact rollback command.

A prior green report is not sufficient. The file must pass in the clean recovery branch.

## Already established safely on this branch

- recovery-only CI for visual, DOM, asset, runtime-baseline, TIG, and import contracts
- pull-request declaration requiring zero protected visual changes or a narrowly scoped owner approval ID

This recovery CI is not the future Next application build pipeline. That pipeline remains a Prompt 2 deliverable and must be recreated from verified source in this clean branch.
