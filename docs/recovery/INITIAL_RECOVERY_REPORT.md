# Initial Recovery Report

## Recovery source

- Source archive: `Teoyube Phase 1(4).zip`
- Source SHA-256: `6eb1b8fa0937b3957138d3f5fb1a5b6308a2b0510d1ae00299e1d70172758de9`
- Baseline branch: `baseline/original-phase-11.6c.3`
- Baseline commit: `607ec21`
- Baseline tag: `teoyube-original-upload-2026-07-18`
- Active branch: `recovery/visual-source-of-truth`

The three uploaded ZIP copies, `Teoyube Phase 1(2).zip`, `Teoyube Phase 1(3).zip`, and `Teoyube Phase 1(4).zip`, have the same SHA-256 value. The recovery branch therefore starts from the same original workspace that was audited.

## Recovery work completed

1. Initialized clean Git history because the uploaded ZIP contained no usable repository history.
2. Committed the untouched upload as the immutable baseline.
3. Created the dedicated recovery branch.
4. Added repository-wide no-redesign agent rules.
5. Added protected source, CSS, asset, DOM, class-name, animation, and runtime-baseline contracts.
6. Captured the original static runtime at six viewport sizes across twelve retained views.
7. Stored 72 immutable PNG screenshots and 12 desktop-wide DOM snapshots.
8. Added a narrow owner-approval protocol for any future visual change.
9. Copied the owner-provided theology, Promise Cluster, lexicon, and TeoyubeSearch documents into `docs/product-source/` as product authority.
10. Fixed the `TIG_CALLING_SEEDS` build regression in isolation by importing the seed, functions, and type from their owning modules rather than the broad TIG barrel.
11. Added recovery verification commands to `package.json`.
12. Rewrote the Codex execution pack as a gated visual-source-of-truth migration program.
13. Added a CI contract that verifies the protected visual source, runtime baselines, TIG import boundary, and repository imports without updating evidence.
14. Added a pull-request template that requires an explicit visual-preservation declaration and owner approval ID for any exception.

## Visual changes

Protected visual source files changed: **0**.

No existing stylesheet, image, icon, SVG, video poster, hero panel, card, carousel, animation, responsive rule, DOM ID, CSS class, or page composition was intentionally modified.

## Current verification evidence

`npm run recovery:verify` passes with:

- 268 protected files matching the original baseline tag
- 185 static DOM IDs
- 398 static DOM class names
- 9 ordered stylesheets
- 210 protected visual files
- 12 owner design references
- 1,015 DOM class occurrences
- 525 DOM ID occurrences
- 1,152 CSS classes
- 34 animation names
- 72 runtime screenshots
- 12 desktop-wide DOM snapshots
- `TIG_CALLING_SEEDS` contract passing
- 1,376 imports checked with zero missing imports
- primary runtime confirmed as `static-node-app`

## Deliberately not imported

The failed Codex workspace itself was not included in the uploaded files. Therefore, no prior migration directory was merged or trusted from a completion report alone.

The reproducible Next build configuration, typed environment validation, secret-safe health route, strict TypeScript boundary, test configuration, and CI workflow are defined as an allowlisted selective recreation in Prompt 2. Codex must reproduce and verify those changes in this clean branch one coherent group at a time. It may not copy redesigned page components, CSS, assets, screenshots, or feature UI from the abandoned workspace.

## Runtime policy

The static runtime remains canonical. The Next runtime may become a side-by-side preview only after its build foundation is independently verified. It cannot become public until every retained view has screenshot, DOM/class, asset, interaction, responsive, accessibility, and functional parity plus explicit owner approval.

## Rollback

Return to the untouched upload:

```bash
git switch baseline/original-phase-11.6c.3
```

Return to the recovery branch:

```bash
git switch recovery/visual-source-of-truth
```
