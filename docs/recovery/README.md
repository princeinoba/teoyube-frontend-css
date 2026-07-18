# Clean Recovery Branch

Branch: `recovery/visual-source-of-truth`

Baseline tag: `teoyube-original-upload-2026-07-18`

Baseline commit: `607ec21`

Original archive SHA-256:

`6eb1b8fa0937b3957138d3f5fb1a5b6308a2b0510d1ae00299e1d70172758de9`

This branch begins from the untouched uploaded Phase 11.6C.3 workspace. The original static interface is the visual and behavioral source of truth.

## Recovery principles

1. Preserve the original interface exactly.
2. Add architecture behind the approved views.
3. Port only proven non-visual improvements from the abandoned migration workspace.
4. Fix regressions in isolated commits.
5. Establish screenshot, asset, DOM, class-name, and interaction baselines before route migration.
6. Keep the static runtime public until every retained page has parity and owner approval.
7. Never update a visual baseline merely to make a test green.

## Allowed first ports

The first selective-port phase may consider only:

- reproducible Next.js dependency and build configuration
- Node version policy
- strict TypeScript boundary
- typed environment validation
- secret-safe health route
- unit-test and browser-test configuration
- CI workflow
- documentation that does not claim unverified completion

Each hunk must be inspected. Do not copy page components, feature pages, layouts, CSS, asset changes, or generic replacement UI from the abandoned workspace.

## Current isolated source repair

`src/lib/teoyube/calling/calling-engine.ts` uses narrow imports for `TIG_CALLING_SEEDS`, calling functions, and `CallingProfileNode`. This prevents the missing barrel-export regression without changing behavior or appearance.
