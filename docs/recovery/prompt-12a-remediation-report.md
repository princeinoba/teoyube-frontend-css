# Prompt 12A Parity Remediation Report

> Historical report. The final non-static route taxonomy is recorded by `TEOYUBE-OWNER-ROUTE-AMENDMENT-2026-07-20-P12D`; the Prompt 12A measurements below are unchanged.

Date: 2026-07-19

Branch: `recovery/visual-source-of-truth`

Commit before work: `93c014eb682369279acbf4b9937e7a9dd7753c0a`

Gate result: **BLOCKED — STATIC RUNTIME REMAINS CANONICAL**

Prompt 12A corrected one unintended Next-only Search markup difference. It did not alter the original static application, any protected stylesheet or asset, an immutable screenshot/DOM baseline, or an owner approval record. Today, Canon, and the open tablet shell drawer still require owner decisions for reproducible sub-threshold raster differences. Retained public routes without an original static counterpart remain blocked until the owner identifies or approves their source of truth.

## Preconditions

| Check | Result |
| --- | --- |
| Active branch | PASS — `recovery/visual-source-of-truth` |
| Recovery lineage | PASS — baseline tag dereferences to `607ec213e84002b1715b1ced9f7925a90a07f26b`, an ancestor of the starting commit |
| Starting worktree | PASS — clean |
| Starting commit | `93c014eb682369279acbf4b9937e7a9dd7753c0a` |
| `npm run recovery:verify` before work | PASS |
| Protected visual source changes before work | 0 |
| `npm start` | Static runtime: `node --preserve-symlinks-main server.js` |
| Next runtime | Separate preview: `npm run app:start` / `next start` |

## Remediation

The static Smart Search Suggestions markup contains a whitespace text node between the label `<span>` and explanatory `<small>`. The React projection omitted that node in two render states, shifting the sentence 4.390625 px to the left. This caused five nonzero viewport captures: 1,462 pixels at desktop-wide, 1,462 at desktop-standard, 1,466 at tablet-landscape, 1,467 at tablet-portrait, and 258 at mobile. Mobile-small was already zero.

`src/app/_search/ApprovedSearchView.tsx` now projects the original whitespace in both states. The affected Search suite was rerun after a fresh Next build and all six screenshots became pixel-identical. DOM/class, asset, geometry, focus, responsive, and functional checks remained exact. The preserved pre-remediation review artifacts are under `.tmp/visual-parity/prompt-12a-pre-remediation/search-owner-review/`; current evidence is under `.tmp/visual-parity/search-owner-review/`.

No CSS override, threshold change, ignored region, generic replacement component, static edit, or baseline update was used.

## Visual differences

| ID | State | Result | Disposition |
| --- | --- | --- | --- |
| V-01 | Today, tablet-landscape, default slide 1 | 43 pixels in an 8×9 counter-glyph edge; exact DOM/style/geometry | Unresolved; `BLOCKED_OWNER_DECISION`; recommend `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |
| V-02 | Search, five viewports | Omitted inline whitespace corrected; all six current captures are zero pixels | Resolved; Search is `PASS` |
| V-03 | Canon, desktop-wide, default Canon Maps/slide 1 | 692 clipped-image/glyph compositor-edge pixels; exact DOM/style/geometry/assets | Unresolved; `BLOCKED_OWNER_DECISION`; recommend `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |
| V-04 | Shell, tablet-portrait, drawer open | 130 avatar image-edge pixels; exact state/style/geometry/asset | Unresolved; `BLOCKED_OWNER_DECISION`; recommend `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |

The complete human and machine-readable evidence is in `docs/recovery/owner-review/prompt-12a-visual-review.md` and `docs/recovery/owner-review/prompt-12a-visual-review.json`. Codex did not fill an owner decision.

## Immutable 12-view route status

| View | Route | Status | Reason |
| --- | --- | --- | --- |
| Today | `/` | `BLOCKED_OWNER_DECISION` | V-01 requires the owner's raster-variance decision |
| Search | `/search` | `PASS` | Six zero-pixel captures plus structural, asset, interaction, focus, and responsive parity |
| Canon | `/canon` | `BLOCKED_OWNER_DECISION` | V-03 requires the owner's raster-variance decision |
| Promise Table | `/promise-table` | `PASS` | Complete automated parity evidence |
| Calling Compass | `/calling-compass` | `PASS` | Complete automated parity evidence |
| Book of the Saint | `/book` | `PASS` | Complete automated parity evidence |
| Lexicon | `/lexicon` | `PASS` | Complete automated parity evidence |
| Testimony | `/testimony` | `PASS` | Complete automated parity evidence |
| Teo Guide | `/teo-guide` | `PASS` | Complete automated parity evidence |
| Embedded Videos | `/embedded-videos` | `PASS` | Complete automated parity evidence |
| Teoyube Tables | `/tables` | `PASS` | Complete automated parity evidence |
| Roadmap | `/roadmap` | `NOT_APPLICABLE_INTERNAL_ROUTE` | Owner-only route; absent from normal navigation |

The shell V-04 decision is an additional global blocker. No active route record remains `NOT_VERIFIED`.

## Support-route classifications

These page routes exist in the Next migration layer but do not have a cell in the immutable 12-view static baseline. A classification records their current gate treatment; it does not create a design source of truth or authorize a route change.

| Route(s) | Classification | Status / required action |
| --- | --- | --- |
| `/prayer`, `/journey`, `/journal`, `/settings`, `/privacy`, `/consent`, `/terms`, `/profile`, `/personalization` | `RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE` | `BLOCKED_MISSING_STATIC_COUNTERPART`; owner must identify or approve a source baseline |
| `/daily-word` → `/`, `/explore` → `/canon`, `/promise-search` → `/search`, `/compass` → `/calling-compass` | `REDIRECT_TO_CANONICAL_PUBLIC_ROUTE` | `BLOCKED_OWNER_DECISION`; canonical target is proposed only, not implemented by this prompt |
| `/dashboard`, `/dev/teoyube-health`, `/tig/debug` | `DEVELOPMENT_ONLY` | `NOT_APPLICABLE_INTERNAL_ROUTE`; must remain outside normal navigation |
| `/graph`, `/tig`, `/tig/data`, `/tig/graph`, `/tig/journal`, `/tig/journey`, `/tig/onboarding`, `/tig/privacy`, `/tig/progress`, `/tig/traversal` | `INTERNAL_ONLY` | `NOT_APPLICABLE_INTERNAL_ROUTE`; must remain outside normal navigation |

The machine-readable inventory is `tests/visual/parity/support-route-status.json`. No visual baseline was invented.

## Verification results

| Command | Result |
| --- | --- |
| `npm run recovery:verify` before work | PASS — protected source, DOM, stylesheet, owner-reference, 72 screenshot, 12 DOM-snapshot, TIG, import, and architecture checks |
| `npm run recovery:tig:verify` | PASS — direct seed-owner contract intact |
| `npm run check:imports` | PASS — 1,411 files, 0 missing imports |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS — zero warnings |
| `npm run test` | PASS — 11 files, 59 tests |
| `npm run visual:parity:verify` | PASS — 72 static screenshots, 12 DOM snapshots; disposable recapture removed |
| `npm run visual:parity:shell` | PASS — 1 browser test; six viewports and responsive drawer states |
| `npm run visual:parity:today` | PASS — 4 browser tests; six visual cells and approved interactions |
| `npm run visual:parity:search` | PASS — 4 browser tests; six current screenshots zero pixels |
| `npm run visual:parity:canon-promise` | PASS — 4 browser tests; twelve visual cells and approved interactions |
| `npm run visual:parity:prayer-calling-journey` | PASS — 6 browser tests; Calling visual parity and retained behavior contracts |
| `npm run visual:parity:journal-testimony-book` | PASS — 6 browser tests; twelve visual cells and retained Journal contracts |
| `npm run visual:parity:remaining-retained` | PASS — 11 browser tests; thirty visual cells, support treatment, media, tables, and navigation boundaries |
| `npm run visual:parity:gate:audit` | PASS — 72 accessibility/focus/performance pairs, 0 mismatches |
| `npm run test:e2e` | PASS — fresh Next startup and secret-safe health endpoint |
| `npm run app:build` | PASS — 53 routes generated under Node 24 |
| `npm run recovery:verify` after work | PASS — 268 protected source files; 72 screenshots; 12 DOM snapshots; TIG/import/architecture contracts |

## Runtime and gate

- Static runtime status: canonical and unchanged; `npm start` still runs `server.js`.
- Next preview status: separate and noncanonical; no runtime cutover was made.
- Protected visual files changed: 0.
- Immutable baseline artifacts changed: 0.
- Owner decisions required: V-01, V-03, V-04, the retained public routes missing a source baseline, and the proposed alias-to-canonical redirect treatment.
- Prompt 13: **LOCKED**.
- Rollback: after the Prompt 12A commit exists, use `git revert <prompt-12a-commit>`; before commit, restore only the files listed in the final report.
