# Teoyube Recovery Setup Report

Date: 2026-07-18

## Outcome

A new Git repository was initialized from the exact contents of the owner-uploaded `Teoyube Phase 1(4).zip` because the archive did not contain usable prior Git history.

- Original archive SHA-256: `6eb1b8fa0937b3957138d3f5fb1a5b6308a2b0510d1ae00299e1d70172758de9`
- Baseline branch: `baseline/original-phase-11.6c.3`
- Baseline commit: `607ec21`
- Baseline tag: `teoyube-original-upload-2026-07-18`
- Active branch: `recovery/visual-source-of-truth`
- Canonical runtime at recovery start: original static application
- Next.js runtime status: migration preview only; public cutover is not authorized

## Visual source-of-truth controls

The recovery branch adds immutable verification for the original frontend without modifying the protected frontend itself:

- 268 protected visual source files in the source manifest
- original static DOM contract with 1,378 ordered nodes, 185 IDs, 398 class names, and nine ordered stylesheets
- expanded visual contract covering source templates, public imagery, owner design references, CSS classes, media queries, and animation names
- 72 static-runtime screenshots: 12 retained views at six required viewports
- 12 desktop-wide DOM/class snapshots
- route parity matrix and owner-reference mapping
- owner-only visual change approval protocol
- repository-wide `AGENTS.md` no-redesign rules

No protected stylesheet, image, icon, hero, card, page layout, visual JavaScript template, or approved asset was intentionally changed.

## Isolated TIG repair

`src/lib/teoyube/calling/calling-engine.ts` now imports:

- `detectCallingMatches` and `getScripturesFromCallings` from `../../tig/calling-compass`
- `TIG_CALLING_SEEDS` from `../../tig/seed/callings.seed`
- `CallingProfileNode` from `../../tig/types`

This repairs the missing broad-barrel export dependency without duplicating or changing the calling seed dataset and without changing rendered output.

## Prompt program

`Teoyube_Codex_Execution_Prompts.md` was rewritten as a 25-prompt gated recovery and implementation program. It:

- makes the original rendered UI and behavior authoritative
- prohibits visual redesign and generic replacement pages
- requires current-task owner approval before any protected visual change
- keeps the static runtime canonical until complete route-by-route parity and owner sign-off
- ports only reviewed non-visual build-foundation work
- migrates one business capability at a time behind approved views
- connects modules through one daily spiritual loop without replacing Today
- preserves TIG as deterministic, typed, explainable intelligence
- builds exact Scripture retrieval and citation validation before broad generative AI
- adds consent-aware, user-owned memory
- introduces theological safety and evaluation gates before live AI
- makes Teo Guide a structured-tool orchestrator before enabling a model
- permits archive or deletion only after dependency proof, rollback coverage, and owner approval
- evaluates the 9/10 scorecard from evidence rather than declarations

## Verification results

Command:

```bash
npm run recovery:verify
```

Result: PASS

- protected visual sources: 268 matched
- static DOM contract: PASS
- expanded visual contract: PASS
- owner design references: 12 matched
- CSS animation names: 34 matched
- runtime screenshots: 72 matched byte-for-byte
- desktop DOM snapshots: 12 matched byte-for-byte
- TIG calling seed contract: PASS
- import checker: 1,376 files checked, zero missing imports

Syntax checks also passed for all recovery CJS scripts and the Python baseline-capture utility. The rewritten prompt file contains 25 numbered prompts and balanced Markdown code fences.

## Separate known publication blocker

Command:

```bash
npm run phase116c3:smoke
```

Result: BLOCKED at `publication_baseline`.

Read-only baseline diagnostics report:

- `owner_gate`
- `lifecycle_state`
- `source_integrity_current`

This blocker existed in the uploaded source state and is separate from visual recovery. The recovery branch does not rewrite approvals, lifecycle evidence, checksums, protected source media, or publication records to manufacture a passing result.

## Selective port status

The prior Next build-foundation work has **not** been merged wholesale. Reproducible Next dependencies, environment validation, health route, tests, and CI remain work for Prompt 2 and must be selectively recreated or copied only after review. No failed redesign page, stylesheet, asset, or generic visual component has been ported.

## Operator commands

```bash
npm run recovery:visual:verify
npm run recovery:tig:verify
npm run recovery:verify
```

Return to the untouched uploaded baseline:

```bash
git switch baseline/original-phase-11.6c.3
```
