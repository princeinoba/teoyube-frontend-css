# Canon Standard Recommendation Icon Verification Report

## Decision and scope

- Final status: **BLOCKED**
- Approval decision recorded: **APPROVED**
- Approval ID: `TEOYUBE-VISUAL-2026-07-26-CANON-REC-ICONS-001`
- Approved by: Prince Okiemute Inoba ? Teoyube Project Owner
- Approved at: `2026-07-26T17:14:46-04:00`
- Branch: `recovery/visual-source-of-truth`
- Starting HEAD: `ff4c0cc07a1563e3adc1dcd415e9456ccb6348d4`
- Product-source file changed: `styles/pages/canon.css`
- Implementation mechanism: exact-route and exact-section-scoped CSS pseudo-elements using small URL-encoded SVG masks; no DOM, application source, assets, packages, or external requests.

The owner approval is implemented for every icon target that exists in the approved rendered DOM. The task cannot honestly be marked PASS because the approved DOM contains no privacy-footer container or privacy statement to receive the required lock, the same-method aggregate reference metric is 16.74% versus the prior 15.74%, inherited local stylesheet-root 404s remain, the repository-wide accessibility gate remains blocked by inherited issues, and the pre-existing Next adapter still does not mount the Standard Recommendation dialog/feedback/workflow responses. No unapproved markup or behavior was added to conceal these conditions.

## Icon inventory

Verified present at all six required viewports:

- rooted section-header tile and title sparkle
- Compare Standard vs Preview arrows
- six distinct card icons: Scripture book, Teoyube Word message, Promise Cluster shield, Prayer hands, Action Step target, Journey route
- Scripture/reference and confidence metadata icons
- six Why-this insight icons
- Recommendation Quality icon treatment
- View Graph and Compare Preview icons
- all 48 rendered feedback toolbar icons across six cards
- Guided Workflow Builder header icon
- six distinct workflow tile icons
- six workflow trailing arrows

The focused browser audit found 106 rendered mask instances at every required viewport, with `pointer-events: none` for all 106 and no clipping or horizontal overflow. No existing DOM icon elements were available to restore; all implemented symbols are CSS decorations. Twenty-one mask definitions exist; the lock definition remains unused because no approved footer target exists. No external icon source, package, icon font, new asset file, or network icon request is used.

## Privacy-footer result

`privacy-footer-dom-audit.json` records:

- footer/privacy selector matches: 0
- matching privacy statements: 0
- status: `NOT_PRESENT_IN_APPROVED_DOM`

The approval simultaneously says ?Do not add a new footer? and ?Style only the existing privacy-footer container.? Adding a footer, privacy copy, or DOM target would exceed the CSS-only authorization, so no lock was fabricated. This is a hard Definition-of-Done blocker.

## Responsive, accessibility, and behavior evidence

- Viewports: 1536?1024, 1440?900, 1280?800, 1024?768, 768?1024, 390?844
- 200% zoom: captured; no document-level horizontal overflow
- Forced colors: masks and green/gold contrast remain visible using `forced-color-adjust: none` only on the exact scoped decorative pseudos/tiles; no new media-query contract was introduced
- Reduced motion: existing scoped reduction remains in force; no icon animation was added
- Axe focused section audit: 0 violations; 0 serious/critical findings
- Controls: 73/73 preserved at all six viewports
- Disclosure keyboard behavior: all six pass Enter-open, Space-close, and mouse-open checks
- Pseudo interception: 0 interactive pseudo-elements
- Cross-route selector matches: 0 on Today, Search, Promise Table, and Book
- Canon/Promise parity: 4/4 tests passed across Canon and Promise Table required viewports
- Panel geometry: prior 1536 height 1614.77px; final 1614.72px. The three card rows and 45.59px feedback toolbar height match the prior evidence within browser rounding.

The pre-icon audit already recorded that the Next adapter does not mount comparison/graph dialogs, visible feedback responses, or workflow dialogs. The final click audit reproduces that exact condition: no new functional regression, but the owner?s ?every control invokes its original behavior? PASS condition is not satisfied by the current runtime.

The repository-wide accessibility gate reports `BLOCKED` across 216 cells with 0 parity failures, 54 inherited missing names, and 216 inherited aria-hidden focusable findings. This focused CSS change adds no accessible name, focus-order, or Axe regression.

## Runtime and network evidence

- No page errors, hydration errors, or request failures in the focused audit.
- Twelve inherited root-level stylesheet requests return 404 (`today.css`, `roadmap.css`, `canon.css`, `search.css`, `promise-table.css`, `calling-compass.css`, `book.css`, `lexicon.css`, `testimony.css`, `teo-guide.css`, `embedded-videos.css`, `tables.css`). The prior Canon evidence records the same twelve requests. There are zero new icon/asset requests and zero new 404s from this change, but the owner?s absolute ?no 404 exists? PASS condition remains unmet.

## Contract and test results

- `npm run app:build`: PASS; Next 16.2.11 production build, all 58 pages generated; TIG/Scripture/Safety/Teo Guide/Live AI/Retrieval client-boundary checks pass
- `npm run typecheck`: PASS
- `npm run lint`: PASS
- `npm run test`: PASS ? 38 files passed, 1 skipped; 276 tests passed, 1 skipped
- `npm run test:e2e`: PASS ? 16/16
- `npm run visual:parity:canon-promise`: PASS ? 4/4
- focused Axe: PASS ? 0 violations
- `npm run release:accessibility:verify`: BLOCKED by inherited evidence described above
- `npm run recovery:verify`: PASS
- `npm run recovery:visual:verify`: PASS within recovery verification
- `npm run recovery:tig:verify`: PASS within recovery verification
- immutable static baselines: PASS ? 72 screenshots and 12 desktop DOM snapshots unchanged
- owner-approved support baselines: PASS ? 60 screenshots and 120 DOM/asset contracts unchanged
- Prompt 12D Next support baselines: PASS ? 54 default and 16 interaction captures unchanged

## Deterministic protection updates

| Value | Previous | Final | File |
|---|---|---|---|
| Canon CSS bytes | 57,371 | 78,880 | both visual contracts |
| Canon CSS SHA-256 | `e16d9a279b24006d8da9b738123644b556ec6de71bf9106ac0a4cc3a469f393b` | `e987cf7be53844abf1d68e932f98e88c186b2cbe207f5254d771988dcf057f88` | both visual contracts |
| Protected visual manifest SHA-256 | `25fe35f7b7cb4caec7f604b481efaece86aba2c0134746fb5beaf7db4ea2cc86` | `fe38dc5ff4fa5c9be5936040415d5818292d91c0fa19f0aa175b00f931c473cd` | `config/runtime/asset-media-compatibility-manifest.json` |
| Runtime source digest | `466f4dec9876dbb7d8c6dfd364079014168b5df92fe7e581c36dffbc62d24305` | `9c7979ff35f890d5e9ba16c95345e4d2a03fd676de13d1c37ff3b0cab1ffb2fb` | `config/runtime/canonical-runtime-manifest.json` |
| Next build ID | `teoyube-466f4dec9876dbb7d8c6dfd3` | `teoyube-9c7979ff35f890d5e9ba16c9` | `config/runtime/canonical-runtime-manifest.json` and generated `.next/BUILD_ID` |

The runtime identity contains 1,903 source files. Only the authorized Canon CSS, its two exact fingerprint records, and the single dependent protected-manifest SHA changed its deterministic inputs.

## Visual comparison

The calculation uses the same 1122?1402 normalization, per-channel threshold 16, and prior root scroll offset (-64.39px):

- previous changed-pixel ratio: 15.74% (`0.15739992015480814`)
- final changed-pixel ratio: 16.74% (`0.16738565481957277`)
- final mean absolute channel difference: `15.504078080460559`
- final RMS channel difference: `43.58813657520089`

The header/icon areas improve, but the aggregate does not preserve the previous measured similarity. Remaining differences include exact owner-reference icon geometry, a reference-only privacy footer, and reference/runtime details outside the narrow icon decoration. No baseline was updated or masked to hide the difference.

## Evidence paths

- Before: `docs/owner-approvals/visual/evidence/CANON-VISUAL-REQUEST-2026-07-25/standard-recommendation/after-default-panel-1536x1024.png`
- Owner reference: `owner-reference.png`
- After: `after-panel-1536x1024.png`, `after-panel-1440x900.png`, `after-panel-1280x800.png`, `after-panel-1024x768.png`, `after-panel-768x1024.png`, `after-panel-390x844.png`
- Close-ups: `closeup-header.png`, `closeup-cards.png`, `closeup-why-this.png`, `closeup-quality-actions.png`, `closeup-action-toolbar.png`, `closeup-workflow.png`
- Zoom/forced colors: `after-panel-zoom-200-simulation-768x512.png`, `after-panel-forced-colors-1280x800.png`
- Side-by-side: `side-by-side-owner-after-1536x1024.png`
- Overlay: `overlay-owner-after-1536x1024.png`
- Difference: `difference-owner-after-1536x1024.png`
- Machine-readable audit: `canon-icon-functional-responsive-audit.json`
- Metric: `visual-comparison-metrics.json`
- Privacy evidence: `privacy-footer-dom-audit.json`

## Temporary artifacts

Temporary scripts were executed inline and were not added to production. `.tmp/canon-icons/` remains ignored/untracked and is excluded from the commit. The temporary port-3101 evidence runtime is stopped at handoff.

## Rollback

Revert the three focused commits in reverse order after substituting their final SHAs:

```powershell
git revert <evidence-commit> 9164d01 f799192
```

This restores the prior Canon CSS, fingerprints, runtime identity, and approval/evidence state without touching unrelated work.