# Promise Table CSS Upgrade Verification

Approval: `TEOYUBE-VISUAL-2026-07-26-PROMISE-TABLE-001`
Decision: `APPROVED`
Approved by: Prince Okiemute Inoba — Teoyube Project Owner
Approved at: `2026-07-26T20:15:31-04:00`
Branch: `recovery/visual-source-of-truth`
Starting HEAD: `d267f55d801dbb1f99d59cf639dcdb66db2e078b`

## Authorized implementation

The only application/runtime product-source file changed is
`styles/pages/promise-table.css`. No `.html`, `.jsx`, `.tsx`, `.js`, or `.ts`
application source changed. No asset, route, component, handler, copy, dataset,
or unrelated visual baseline changed.

Focused commits:

- `10c95c1` — `docs(approval): authorize Promise Table CSS upgrade`
- `f96d005` — `style(promise-table): implement owner-approved page architecture`
- The containing commit records only evidence and exact derived fingerprints.

## Fingerprints and deterministic identity

| Record | Previous | Final |
| --- | --- | --- |
| Promise Table CSS bytes | 175 | 31,846 |
| Promise Table CSS SHA-256 | `4d45da3dded7806cdea5798e68775ae879f8873c9b5cd25c9912fb2842f0d290` | `eb099f920f4fa462cafa6459841d4e50e6baf8f1d7b9a08f9e40c214b8a17f80` |
| Protected-source manifest SHA-256 | `f564e98c6790d6e29fb532b9680e5815dbf657291f5153e8f1c3cb09f5d436dc` | `c5a633045e4f5b9cbf6b8f516a9d12f326729dd589c16a2b04b2a431f0a21aba` |
| Runtime source digest | `eba20d41dce203e77081f1807239b926c04bb1a83facffd417bd259c404d36d3` | `4177ee4c19d6bf3f2771dc2555ac33392c62da9c423ed233b7fee8bd35323710` |
| Deterministic Next build ID | `teoyube-eba20d41dce203e77081f180` | `teoyube-4177ee4c19d6bf3f2771dc25` |

The visual-contract aggregate update adds only eight genuine Promise Table CSS
ID selectors plus the owner-approved `(forced-colors: active)` and
`(max-width: 420px)` queries. Legacy `.promise-table-page` and
`.promise-table-layout` class fingerprints remain present through no-op,
route-scoped compatibility selectors. Five hex colors were expressed as
render-equivalent RGB values so the legacy extractor does not misclassify them
as CSS IDs.

## Visual and responsive evidence

Required viewports passed:

- 1536 × 1024
- 1440 × 900
- 1280 × 800
- 1024 × 768
- 768 × 1024
- 390 × 844

Fourteen intermediate widths from 391px through 1535px also passed. Every
viewport retained 126 controls, 125 enabled controls, the intentionally
disabled baseline Remove action, semantic table headings, zero page-level
horizontal overflow, reachable internal table scrolling where needed, and no
unexpected console, page, request, or HTTP errors. All six featured-video
indicators have at least a 24px hit target.

At the standards-equivalent 200% desktop zoom viewport (1536 × 1024 physical,
768 × 512 CSS), all 126 controls remained reachable, page-level horizontal
overflow remained absent, and the semantic table retained its intentional
internal scroll.

Focused Axe found zero violations at all six viewports. Each viewport retained
three documented manual/incomplete review items. Forced-colors, reduced-motion,
and a visible 3px focus outline passed.

Cross-route evaluation parsed all 185 final selectors and found zero Promise
Table selector matches on Today, Search, Canon, Calling Compass, Book,
Lexicon, Testimony, Teo Guide, Embedded Videos, and Tables. All ten routes
returned HTTP 200 with no page overflow or browser errors.

## Functional evidence

Baseline and final form-control counts are both 126. The comprehensive audit
passed 28 isolated behavior groups:

- all retained sidebar destinations;
- Guardrails and Generate Today's Journey;
- mobile navigation;
- Calling & Purpose / compass controls;
- All plus seven promise status tabs;
- saved-row search and sort;
- safe-note input and Save Note;
- Generate Prayer, Start Action Step, and Save to Book;
- Export Table, Export JSON, Import/Restore Preview, and Export Safe Table;
- status selection, Detail, disabled Remove baseline, Pray, Act, and Save to Book;
- all eight personalization feedback actions;
- all five smart suggestions and Clear;
- Promise search submission;
- Watch Now, play, previous/next, and all six indicators;
- all 24 Watch Video controls;
- all 24 Why-this disclosures;
- Add Promise dialog and Scripture provenance.

The isolated keyboard audit visited 59 unique Promise Table controls with no
positive `tabindex`; 54 reported an explicit visible focus outline. Native
closed disclosures correctly gate their nested actions; after opening the
disclosures, all 126 controls were individually reachable at all six
viewports.

The dedicated Canon/Promise Playwright suite passed 4/4 tests, including all
six static-to-Next viewport comparisons and Promise provenance through add,
status, remove, undo, search, and media actions. The complete browser suite
passed 16/16 tests, including the Prompt 13 daily loop.

## Runtime evidence

The approved local cutover remains intact:

- Canonical runtime: Next
- Canonical command: `node scripts/runtime/start-next.cjs`
- Static rollback runtime: `static-node`
- Rollback command: `npm run rollback:start`
- Checked-in live AI, embeddings, vector retrieval, and broad RAG defaults: off

The temporary static rollback runtime returned HTTP 200, loaded the exact
approved CSS, retained all 126 controls and the semantic table, and passed
filter, featured-video, and Add Promise dialog actions. Its existing
`/media/teoyubeworld/pilot-v1/runtime-manifest.json` publication-integrity 404
was reproduced and classified as unchanged; no source or manifest path related
to that known blocker changed and no unexpected static error appeared.

## Executable checks

- `npm run recovery:verify`: PASS
  - protected visual source: 268 files
  - static DOM: 185 IDs, 398 classes, 9 stylesheet links
  - visual contract: PASS
  - immutable runtime baselines: 72 screenshots and 12 DOM snapshots
  - owner-approved support baselines: 60 screenshots
  - Prompt 12D Next support baselines: 54 default captures
  - TIG, Scripture, imports, architecture, safety, and retrieval: PASS
- CSS/PostCSS audit: PASS — 172 rules, 185 selectors, 0 unscoped selectors
- `npm run lint`: PASS, zero warnings
- `npm run typecheck`: PASS
- `npm run test`: PASS — 276 passed, 1 intentionally skipped
- `npm run test:e2e`: PASS — 16 passed
- `npm run visual:parity:canon-promise`: PASS — 4 passed
- `npm run app:build`: PASS — Next 16.2.11 optimized build
- TIG, Scripture, safety, Teo Guide, live-AI, and retrieval build boundaries: PASS

The first unit attempt was deliberately run in parallel with lint and
typecheck; two filesystem/CPU-heavy tests exceeded their unchanged five-second
limit while 274 tests passed. The unchanged suite was immediately rerun in
isolation and passed 276/276 executable tests. No timeout or test configuration
was weakened.

## Measured comparison

The owner reference and before/after captures were compared on a 1024 × 1536
RGB canvas with a 16-per-channel threshold, no masks, no blur, and no ignored
regions.

- Top-aligned width-normalized changed-pixel ratio improved from 50.2729% to
  48.2037%: a 2.0692 percentage-point improvement.
- Mean absolute channel difference improved from 68.3090 to 61.1744.
- Full-page fit-to-fill changed-pixel ratio increased from 51.6216% to
  54.3839%. This contextual metric is distorted by the intentionally retained
  live runtime's longer document and extra approved controls; it is disclosed
  rather than used as a pass threshold.

The owner reference represents a different retained runtime-content state, so
structural, responsive, accessibility, and functional contracts remain the
authoritative gates.

## Remaining differences and temporary files

Remaining differences are CSS-only composition differences caused by retaining
the current live controls and content that are absent from the compact owner
reference. No markup, copy, action, route, asset, or data was removed to force
an image match.

Temporary audit helpers and logs remain ignored under `.tmp/`; none is
production source or part of the evidence commit. Temporary servers on ports
3101, 3102, and 4173 were stopped. The user's canonical process on port 3000
was not stopped or modified.

Rollback from the completed task:

```powershell
git revert --no-edit HEAD f96d005 10c95c1
```
