# Teoyube Clean Recovery Branch

## Branch identity

- Baseline branch: `baseline/original-phase-11.6c.3`
- Baseline commit: `607ec21`
- Baseline tag: `teoyube-original-upload-2026-07-18`
- Active recovery branch: `recovery/visual-source-of-truth`

The baseline commit was created directly from the uploaded `Teoyube Phase 1(4).zip`. The ZIP contained an empty `.git` directory, so a new local repository was initialized rather than pretending prior history was available.

## Recovery objective

Recover architectural progress without surrendering the original Teoyube frontend. The static rendered application, its DOM hierarchy, CSS classes, images, icons, cards, heroes, animations, responsive behavior, and interactions are the source of truth.

Architecture migrates behind that interface. Next.js remains a preview runtime until visual and functional parity is proven for every retained page and the owner explicitly approves cutover.

## Changes intentionally introduced on the recovery branch

- repository-wide agent rules enforcing no visual redesign
- immutable visual-source and DOM contracts
- owner-reference screenshot mapping
- owner-approval protocol
- owner-provided product and theology source documents
- an isolated direct-import repair for `TIG_CALLING_SEEDS`
- verification scripts and npm commands
- a rewritten Codex execution prompt pack

No protected visual source is intentionally changed.

## Daily operator commands

```bash
npm run recovery:visual:verify
npm run recovery:tig:verify
npm run recovery:verify
```

## Rollback

Return to the exact uploaded source:

```bash
git switch baseline/original-phase-11.6c.3
```

Compare the recovery branch with the source baseline:

```bash
git diff --stat teoyube-original-upload-2026-07-18..recovery/visual-source-of-truth
git diff --name-status teoyube-original-upload-2026-07-18..recovery/visual-source-of-truth
```
