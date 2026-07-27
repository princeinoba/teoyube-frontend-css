# Promise Table core panels — focused implementation report

Status: **PASS**

This report records the CSS-only visual replacement authorized by
`TEOYUBE-VISUAL-2026-07-26-PROMISE-PANELS-001`. It covers only the three
approved `/promise-table` panels and the existing Local beta notice.

## Authority and change scope

- Decision: `APPROVED`
- Approval ID: `TEOYUBE-VISUAL-2026-07-26-PROMISE-PANELS-001`
- Approved by: Prince Okiemute Inoba — Teoyube Project Owner
- Approved at: `2026-07-26T22:44:26-04:00`
- Parent approval: `TEOYUBE-VISUAL-2026-07-26-PROMISE-TABLE-001`
- Branch: `recovery/visual-source-of-truth`
- Starting HEAD: `4dd53addd6a268d9817e43feb17f37488f7f6c91`
- Approval commit: `0dd3014` (`docs(approval): authorize focused Promise Table panel redesign`)
- CSS implementation commit: `b5ae822` (`style(promise-table): match owner-approved workspace and data panels`)
- Evidence/fingerprint commit: the commit containing this report
- Product stylesheet changed: `styles/pages/promise-table.css`
- Application-source files changed with `.html`, `.jsx`, `.tsx`, `.js`, or
  `.ts` extensions: **0**
- Package, dependency, route, component, handler, data, label, and asset
  changes: **0**
- Immutable screenshots changed: **0**
- Immutable DOM snapshots changed: **0**
- Owner-approved support baselines changed: **0**

The only non-CSS changes are the owner-approval amendment, Promise
Table-specific evidence/reporting, the exact derived stylesheet fingerprints,
the eight verifier-derived CSS color tokens, the protected-manifest hash, and
the deterministic runtime identity.

## CSS and icon implementation

The implementation uses compact `--promise-core-*` tokens under
`body[data-view="table"] #table`, then scopes every panel rule to
`#phase116bPromiseWorkspace`, `#phase117PromiseTableControls`, or
`#phase114PromiseTablePanel`. The existing `.phase117-offline-status` remains
route-scoped through `body[data-view="table"]`.

- Existing icon nodes found/restored: **0**
- CSS-generated icon definitions: **17**
- Rendered approved icon targets: **17/17**
- Empty approved icon targets: **0**
- Mechanism: route-scoped, URL-encoded local SVG masks/background images in
  `styles/pages/promise-table.css`
- Remote URLs, dependencies, emoji, base64 blobs, new SVG files, and generated
  text: **none**
- All decorative pseudo-elements use `pointer-events: none`; labeled controls
  retain their visible text and accessible names.

## Control, responsive, and behavior evidence

At 1672×941:

- Complete Promise Table page controls: **150 before / 150 after**
- Focused target controls: **35 before / 35 after**
- Enabled focused controls: **34**
- Intentionally disabled focused controls: **1** (`Remove`)
- Hidden focused controls: **0**
- Focus order/accessibility-name signature: exact before/after match
- Focused panel union: **936.82px** versus the 941px reference canvas
- Document horizontal overflow: **0px**
- Semantic table headings: `Promise`, `Scripture`, `Status`, `Source`, `Actions`
- Table wrapper: `overflow-x: auto`
- Local beta notice: present, 240×72.52px at reference width, and
  `pointer-events: none`

The focused suite passed at:

- 1672×941
- 1536×1024
- 1440×900
- 1280×800
- 1024×768
- 768×1024
- 390×844
- 360×800
- 200% zoom (768×512 CSS viewport at device scale factor 2)

Intermediate responsive behavior is covered by the existing breakpoints and
the continuous Grid/Flex reflow rules. At 1280px and below, the semantic table
uses its internal wrapper rather than creating document-level horizontal
overflow.

Functional verification exercised 19 isolated workflows:

- Export Table: click dispatch preserved; enabled; no runtime error
- Add Promise: dialog opens and closes
- Filters: all eight current tabs exercised in DOM order
- Search: `TIDUILOVP` accepted without changing behavior
- Sort: `newest`, `status`, and `scripture` exercised
- Note editing: textarea accepts input and Save Note produces the existing
  notice
- Generate Prayer, Start Action Step, and Save to Book: existing actions and
  notices preserved
- Export Promise Table JSON and Export Safe Table: click dispatch preserved;
  enabled; no runtime error
- Import / Restore Preview: click dispatch preserved; no runtime error
- Status selector: `Studying → Praying → Studying` round trip passed
- Detail, Save to Book, Pray, Act, and Compare: existing row actions exercised
- All eight secondary feedback/save actions exercised
- Remove remains visibly and semantically disabled for the current protected
  row
- Keyboard: 33 enabled target controls reached in DOM order; all 33 expose a
  visible focus outline
- Desktop and 390px trial-click coverage: every enabled target control
  reachable; no covering icon or notice

The current export buttons do not emit a browser download event in this
runtime configuration; the verification therefore records the preserved
click dispatch and absence of errors rather than claiming a download that did
not occur. No export logic was changed.

## Accessibility and runtime errors

- Focused Axe violations: **0**
- Axe passes: **15**
- Axe manual-review/incomplete items:
  - pre-existing `aria-label` on `.phase115-feedback-controls` without an
    explicit role
  - automated contrast could not resolve gradient/background-image surfaces
- Console errors during responsive and functional page runs: **0**
- Page errors: **0**
- Request failures: **0**
- HTTP/asset errors during responsive and functional page runs: **0**

Axe CSS inspection separately requested twelve stylesheet alias URLs and
received 404 responses; ordinary page, responsive, functional, build, parity,
and browser runs did not reproduce those requests. They are retained
unfiltered in `focused-core-panels-axe.json`.

## Verification results

- CSS parse/syntax lint (PostCSS): **PASS**
- Application lint: **PASS**
- Typecheck: **PASS**
- Unit: **276 passed, 1 skipped**
- Browser/route: **16 passed**
- Production build: **PASS** (58 routes generated)
- TIG client-bundle boundary: **PASS**
- Scripture client-bundle boundary: **PASS**
- Safety, live-AI, Teo Guide, and retrieval boundaries: **PASS**
- Focused Canon/Promise parity: **4/4 PASS**
  - Canon and Promise Table at all six required viewports
  - Canon interaction contract
  - Promise Table add/status/remove/undo/search/media interaction contract
- Visual source contract: **PASS** (268 protected entries)
- Static DOM contract: **PASS** (185 IDs, 398 classes, 9 stylesheets)
- Aggregate visual contract: **PASS**
- Immutable runtime baselines: **PASS** (72 screenshots, 12 DOM snapshots)
- Owner-approved support baselines: **PASS** (60 screenshots and 120
  DOM/asset contracts)
- Prompt 12D Next support baselines: **PASS** (54 default and 16 interaction
  captures)
- TIG calling seed contract: **PASS**
- Complete recovery verification: **PASS**
- Canonical runtime: Next, per
  `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`
- Static runtime: retained and exercised as the rollback/reference side of the
  focused parity suite

## Exact derived metadata

| File | Previous | New | Derivation |
|---|---|---|---|
| `styles/pages/promise-table.css` | 35,446 bytes; `c9592524509daf78e275e31cb48037ed4c16d5c41e19d4f40e692b61c530872b` | 52,123 bytes; `52e7d176d7588adabcbddc0f1e76cb5f3e006ff45a3c3db40da38c9f7f359a2e` | Exact final approved CSS |
| `tests/visual/contracts/protected-visual-source-manifest.json` Promise entry | same previous CSS bytes/hash | same new CSS bytes/hash | Exact Promise stylesheet fingerprint only |
| `tests/visual/contracts/original-static-visual-contract.json` Promise entry | same previous CSS bytes/hash | same new CSS bytes/hash | Exact Promise stylesheet fingerprint only |
| `tests/visual/contracts/original-static-visual-contract.json` aggregate `cssIds` | no focused color tokens | `b42335`, `bdd8ce`, `d9e6e1`, `e2f1ea`, `e7f4ed`, `f1f8f4`, `f6fbf8`, `fffafb` | Exact verifier-reported literals from the approved CSS |
| `config/runtime/asset-media-compatibility-manifest.json` protected-manifest SHA-256 | `ebf3bbc82eb218f037a13b2b586ffaeacdbbbfa3b021313183bccb34fae46442` | `c512277b7c0e5e8eeec41ef71ba19e93304bceb061269215a80756dda0f838ad` | Hash of the exact protected manifest after its one Promise entry changed |
| `config/runtime/canonical-runtime-manifest.json` runtime digest | `a72242a9f03f00a65bc54a9b7acafb02b0330c838257af7360d855bc89f9c03e` | `cf8c42af1fa3ff1509d749fd7281dd6cc3da6be27113d666674f7563528f1b31` | Deterministic digest of the authorized CSS and exact derived contracts |
| `config/runtime/canonical-runtime-manifest.json` Next build ID | `teoyube-a72242a9f03f00a65bc54a9b` | `teoyube-cf8c42af1fa3ff1509d749fd` | Deterministically derived from the new runtime digest |

## Visual evidence

- Owner reference:
  `focused-core-panels-owner-reference.png`
- Before:
  `before-focused-core-panels-1672.png`
- Final raw focused capture:
  `after-focused-core-panels-1672-raw.png`
- Comparison-only normalized capture:
  `after-focused-core-panels-normalized-1672x941.png`
- Close-ups:
  - `after-workspace-header-manual-entry.png`
  - `after-workspace-tabs-search.png`
  - `after-selection-detail-actions.png`
  - `after-live-promise-rows-panel.png`
  - `after-saved-promise-rows-panel.png`
  - `after-local-beta-notice.png`
- Responsive captures:
  `focused-core-panels-responsive/`
- Side-by-side:
  `focused-core-panels-side-by-side.png`
- Overlay:
  `focused-core-panels-overlay.png`
- Absolute difference:
  `focused-core-panels-absolute-difference.png`
- Responsive/functional/Axe audit:
  `focused-core-panels-verification.json`
- Comparison metrics:
  `focused-core-panels-comparison-metrics.json`

The comparison copy is normalized to 1672×941 only for evidence; production
CSS and screenshots are not transformed or scaled. The measured normalized
comparison contains 89.0812% non-identical pixels, 9.4537% pixels with a
maximum RGB-channel delta of at least 32, and a mean absolute RGB difference
of 14.7867. The owner image is a visual target, not an immutable pixel
baseline, so the structural, responsive, control, behavior, and measured
geometry evidence governs acceptance.

## Preserved differences and rollback

The CSS-only boundary preserves three current DOM-copy differences from the
reference:

- `Open Detail` remains instead of `Selection Detail`.
- `Safe promise rows` remains instead of `Live promise rows`.
- The current additional `all` filter remains visible and functional.

Changing those labels or removing the live filter would require prohibited
application-source/behavior changes. No screenshot region is masked and no
control is hidden to imitate the reference.

Temporary verification helpers remain only under ignored `.tmp/` and are not
production source. Roll back the task with:

```powershell
git revert --no-edit <evidence-commit>
git revert --no-edit b5ae822
git revert --no-edit 0dd3014
```
