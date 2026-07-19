# Next Preview Side-by-Side Parity Gate

Date: 2026-07-19

Branch: `recovery/visual-source-of-truth`

Prompt 12 starting commit: `f063226f515f446237a1e195b9b4a3835e740534`

Prompt 12A starting commit: `93c014eb682369279acbf4b9937e7a9dd7753c0a`

Gate outcome: **BLOCKED FOR OWNER REVIEW — NO RUNTIME CUTOVER**

The automated parity implementation passed every executable screenshot, DOM/class, asset, interaction, keyboard/focus, responsive, accessibility-parity, and local performance check. Prompt 12A corrected the one identified Next layout defect: omitted inline whitespace shifted the Search suggestion sentence 4.390625 px. Search is now pixel-identical at all six viewports. Today, Canon, and one shell drawer capture retain sub-threshold raster differences with exact structure, styles, assets, and geometry; those states remain blocked for owner decision. `npm start` remains the static Node runtime.

No baseline, protected static source, stylesheet, asset, owner reference, or approval record was regenerated or modified. Every active route status is now explicit; no active route remains `NOT_VERIFIED`.

## Gate coverage

- 12 immutable static views × 6 required viewports = 72 matrix cells.
- 72 current static/Next side-by-side images.
- 72 current overlay-difference images.
- Ordered DOM hierarchy, IDs, class ordering, parent paths, asset and background URLs, computed geometry, visible labels, interactive controls, focus order, and responsive navigation compared in every matrix cell.
- Static reproducibility reran all 72 immutable screenshots and 12 desktop DOM snapshots.
- Route-specific browser suites exercised carousels, keyboard controls, navigation, search categories, filters, tabs, pagination, status changes, remove/undo, drawers, local media, prayer, Calling discernment, Journal, Testimony, Book, Tables, Lexicon, and deterministic Teo Guide behavior.
- Prayer, Journey, and Journal retained their frozen pre-migration responsive contracts at all six viewports.
- Settings, privacy, consent, terms, profile, daily word, dashboard, explore, graph, personalization, promise search, and compass retained the approved shell and current responsive treatment at all six viewports.
- An isolated cold-context audit ran the 72 matrix cells again on dedicated static and Next ports for accessibility/focus parity and comparative performance.

## Immutable source verification

| Contract | Result |
| --- | --- |
| Protected visual-source hashes | PASS — 268 files |
| Protected visual contract | PASS — 210 files |
| Owner reference map | PASS — 12 images |
| Static DOM contract | PASS — 185 IDs, 398 class names, 9 stylesheets |
| Visual DOM/CSS inventory | PASS — 1,015 DOM classes, 525 DOM IDs, 1,152 CSS classes, 34 animation names |
| Immutable runtime baseline | PASS — 72 screenshots, 12 desktop DOM snapshots |
| Second static capture | PASS — all 72 screenshots and 12 DOM snapshots |
| Baseline writes or updates | 0 |

The second static capture used Windows Chrome against the immutable Linux Chromium baseline. As already documented by the recovery harness, its cross-platform result was: maximum raw raster ratio 43.8757%, maximum perceptual delta 9.519%, maximum regional delta 30.512%, with all 72 screenshots inside the cross-platform static-only tolerance. Temporary static candidates were deleted after the passing comparison.

## Matrix result

`PASS` below means the current automated parity evidence satisfies every applicable gate without relying on a visual tolerance decision. Owner approval was not supplied or inferred. Nonzero states and owner-only routes keep their explicit blocked/not-applicable status.

| View | Next route | Cells | Screenshot result | Structural/asset/focus result | Accessibility parity | Performance evidence | Gate result |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| Today | `/` | 6/6 | Strict threshold PASS; 43 pixels at tablet-landscape | Exact | No new findings | Next median 2,114.6 ms | **BLOCKED — owner raster decision required** |
| Search | `/search` | 6/6 | Zero differing pixels after exact whitespace remediation | Exact | No new findings | Next median 1,161.2 ms | PASS — automated |
| Canon | `/canon` | 6/6 | Strict threshold PASS; 692 pixels / 0.0534% at desktop-wide | Exact | No new findings | Next median 1,345.9 ms | **BLOCKED — owner raster decision required** |
| Promise Table | `/promise-table` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,046.6 ms | PASS — automated |
| Calling Compass | `/calling-compass` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,163.0 ms | PASS — automated |
| Book of the Saint | `/book` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 790.3 ms | PASS — automated |
| Lexicon | `/lexicon` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,171.9 ms | PASS — automated |
| Testimony | `/testimony` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 770.2 ms | PASS — automated |
| Teo Guide | `/teo-guide` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 675.3 ms | PASS — automated |
| Embedded Videos | `/embedded-videos` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 854.4 ms | PASS — automated |
| Teoyube Tables | `/tables` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,052.8 ms | PASS — automated |
| Roadmap (owner-only) | `/roadmap` | 6/6 | Zero differing pixels | Exact, including owner QA overlay | No new findings | Next median 2,473.6 ms | `NOT_APPLICABLE_INTERNAL_ROUTE` — absent from normal navigation |

## Shell result

The sidebar, top bar, brand lockup, navigation order/icons, Saint profile, mobile toggle/backdrop, drawer focus behavior, and keyboard navigation passed at all six viewports. All shell element captures had zero differing pixels except the open mobile sidebar at tablet-portrait, which contained 130 differing pixels (0.0397%) and remained inside the strict 0.5% threshold.

Shell gate result: **BLOCKED — owner raster decision required for the tablet-portrait open-drawer overlay**.

## Visible raster differences requiring owner decisions

No structural, branded, layout, asset, copy, control, responsive, or interaction difference was detected. The following nonzero raster evidence cannot be promoted to owner-approved parity by Codex:

| Decision item | State | Differing pixels | Ratio | Current disposition |
| --- | --- | ---: | ---: | --- |
| V-01 | Today, tablet-landscape | 43 | 0.0055% | BLOCKED pending owner review |
| V-03 | Canon, desktop-wide | 692 | 0.0534% | BLOCKED pending owner review |
| V-04 | Shell mobile sidebar open, tablet-portrait | 130 | 0.0397% | BLOCKED pending owner review |

Every other matrix screenshot produced zero differing pixels. All listed differences are below the unchanged strict numerical tolerance, but the owner must inspect the associated side-by-side and overlay artifacts and decide whether they are browser raster noise. This report does not update a baseline or invent that decision.

## Resolved raster difference

Search had one actual projection defect across five viewports: the static template's whitespace text node between the Smart Search Suggestions `<span>` and `<small>` was absent from the React markup. That shifted the sentence 4.390625 px. Prompt 12A restored the whitespace in both Search states, rebuilt the Next preview, and reran the affected suite. All six Search screenshots now have zero differing pixels. Pre-remediation static, Next, side-by-side, overlay, diff, and metric evidence remains separate under `.tmp/visual-parity/prompt-12a-pre-remediation/search-owner-review/`.

## Accessibility and keyboard/focus parity

The isolated audit compared the exact route-root accessibility issue signature, document language, and sequential focus order in all 72 matrix cells.

- Cells audited: 72
- Accessibility/focus mismatches: 0
- New Next accessibility findings: 0
- Positive-tabindex divergence: 0
- Missing accessible-name divergence: 0
- `aria-hidden`/focusability divergence: 0

This is an accessibility **parity** result, not a claim of complete WCAG conformance. The static source and Next preview share these existing audit findings:

- Today: 11 `aria-hidden` containers with focusable descendants.
- Canon: 1 `aria-hidden` container with a focusable descendant.
- Lexicon: 1 search-input accessible-name finding.
- Embedded Videos: 1 search-input accessible-name finding.
- Teoyube Tables: 1 search-input accessible-name finding.

Changing those approved attributes or structures is outside this prompt. They remain inherited accessibility debt for a separately scoped owner-reviewed task.

## Performance comparison

Method: one isolated cold browser context per runtime, view, and viewport; local loopback servers; fonts and visible images ready; 72 paired samples. These numbers are comparative local evidence, not a production network benchmark.

| View | Static median ready | Next median ready | Static max | Next max |
| --- | ---: | ---: | ---: | ---: |
| Today | 2,870.0 ms | 2,114.6 ms | 3,224.7 ms | 2,463.9 ms |
| Search | 1,499.8 ms | 1,161.2 ms | 2,629.5 ms | 1,278.6 ms |
| Canon | 2,235.9 ms | 1,345.9 ms | 2,811.2 ms | 1,837.7 ms |
| Promise Table | 1,725.0 ms | 1,046.6 ms | 2,362.9 ms | 1,103.2 ms |
| Calling Compass | 1,896.6 ms | 1,163.0 ms | 2,488.3 ms | 1,722.4 ms |
| Book | 1,591.1 ms | 790.3 ms | 2,127.3 ms | 856.8 ms |
| Lexicon | 2,085.9 ms | 1,171.9 ms | 2,542.5 ms | 1,353.5 ms |
| Testimony | 2,151.1 ms | 770.2 ms | 2,323.1 ms | 1,558.1 ms |
| Teo Guide | 1,530.5 ms | 675.3 ms | 2,234.9 ms | 699.1 ms |
| Embedded Videos | 1,815.6 ms | 854.4 ms | 3,540.3 ms | 2,276.3 ms |
| Teoyube Tables | 1,968.8 ms | 1,052.8 ms | 2,255.2 ms | 1,592.3 ms |
| Roadmap | 3,439.3 ms | 2,473.6 ms | 3,943.5 ms | 2,597.2 ms |

Overall static median ready time was 1,911.0 ms; Next was 1,059.6 ms. The maximum paired-cell values were 3,943.5 ms and 2,597.2 ms. Median transferred resource bytes were 22,066,268 for static and 8,913,524 for Next. No cell exceeded the 5,000 ms local gate.

## Support routes without an immutable static counterpart

The prior frozen/current-treatment browser checks remain useful functional evidence, but they cannot promote a public route to `PASS` without an owner-approved source baseline. These classifications do not invent a design or implement a route change:

| Routes | Classification | Explicit status |
| --- | --- | --- |
| `/prayer`, `/journey`, `/journal`, `/settings`, `/privacy`, `/consent`, `/terms`, `/profile`, `/personalization` | `RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE` | `BLOCKED_MISSING_STATIC_COUNTERPART` |
| `/daily-word` → `/`, `/explore` → `/canon`, `/promise-search` → `/search`, `/compass` → `/calling-compass` | `REDIRECT_TO_CANONICAL_PUBLIC_ROUTE` | `BLOCKED_OWNER_DECISION`; target is proposed, not implemented here |
| `/dashboard`, `/dev/teoyube-health`, `/tig/debug` | `DEVELOPMENT_ONLY` | `NOT_APPLICABLE_INTERNAL_ROUTE` |
| `/graph`, `/tig`, `/tig/data`, `/tig/graph`, `/tig/journal`, `/tig/journey`, `/tig/onboarding`, `/tig/privacy`, `/tig/progress`, `/tig/traversal` | `INTERNAL_ONLY` | `NOT_APPLICABLE_INTERNAL_ROUTE` |

The complete machine-readable inventory is `tests/visual/parity/support-route-status.json`. Roadmap remains owner-only and every owner/development/TIG route remains absent from normal navigation.

## Intentional nonvisual differences

| Difference | Scope | Evidence treatment |
| --- | --- | --- |
| Next App Router streaming sibling | One hidden, empty sibling before the shell | Explicitly documented; no class, label, geometry, focusability, or pixels; shell descendants remain fully compared |
| Framework-generated attributes | `data-nextjs*`, `data-react*`, explicit test-only attributes, `data-testid`, and `nonce` | Narrowly ignored by the DOM contract; no page region or user attribute is ignored |
| Runtime model | Static Node document/hash navigation versus Next server-rendered route plus hydration | Direct route content, visible DOM, interaction state, and assets remain compared |
| Route addresses | Static `index.html#view` versus typed Next routes | Route mapping is explicit in the immutable matrix and status file |
| Approved stylesheet serving | Static file URLs versus Next preview rewrites for the same protected styles/assets | Computed geometry, classes, stylesheet output, and asset URLs remain compared; source files unchanged |
| Test determinism | Fixed time/randomness, paused animations and media, controlled carousel state, blocked external network | Applied symmetrically in the test harness only; production behavior unchanged |
| Internal/support views without static cells | 26 classified page routes | Functional/current-treatment evidence is reported separately and never represented as immutable static parity |

## Commands and results

| Command | Result |
| --- | --- |
| `npm run recovery:verify` | PASS before work |
| `npm run recovery:tig:verify` | PASS — direct seed-owner boundary intact |
| `npm run check:imports` | PASS — 1,411 files, 0 missing imports |
| `npm run visual:parity:verify` | PASS — static 72 screenshots / 12 DOM snapshots |
| `npm run visual:parity:shell` | PASS — 1 browser test, six viewports |
| `npm run visual:parity:today` | PASS — 4 browser tests |
| `npm run visual:parity:search` | PASS — 4 browser tests |
| `npm run visual:parity:canon-promise` | PASS — 4 browser tests |
| `npm run visual:parity:prayer-calling-journey` | PASS — 6 browser tests |
| `npm run visual:parity:journal-testimony-book` | PASS — 6 browser tests |
| `npm run visual:parity:remaining-retained` | PASS — 11 browser tests |
| `npm run visual:parity:gate:audit` | PASS — 72 accessibility/focus/performance pairs, 0 violations |
| `npm run typecheck` | PASS |
| `npm run lint` | PASS |
| `npm run test` | PASS — 11 files, 59 tests |
| `npm run test:e2e` | PASS — fresh Next preview startup, secret-safe health test |
| `npm run app:build` | PASS |
| `npm run recovery:verify` | PASS after work — visual, TIG, imports, and architecture contracts |

Every Prompt 12A route-specific suite started the current built preview cleanly. The final performance/accessibility audit started fresh static and Next servers on dedicated ports 4183 and 3183; both started successfully, all 72 pairs passed, and both ports were closed afterward. The final ordinary e2e run also started a fresh Next server cleanly on port 3100 before its secret-safe health check passed.

## Evidence locations

- Static/Next screenshots, contracts, side-by-side images, and overlays: `.tmp/visual-parity/*-owner-review/`
- Current 72-cell side-by-side count: 72
- Current 72-cell overlay count: 72
- Performance and accessibility artifact: `.tmp/visual-parity/next-preview-parity-gate/performance-accessibility.json`
- Playwright report: `.tmp/visual-parity/report/`
- Immutable owner baselines: `tests/visual/baselines/static-runtime/` — read-only and unchanged

## Runtime and next gate

- Canonical runtime: static Node application.
- Default `npm start`: `node --preserve-symlinks-main server.js`.
- Next preview: separate, local, noncanonical.
- Baseline update: forbidden and not performed.
- Unified-journey expansion: not started.
- Runtime cutover: not authorized and not performed.
- Required owner action: review V-01, V-03, V-04, retained public routes without immutable static counterparts, and the proposed alias-to-canonical redirect classifications; then supply explicit scoped decisions.
- Next gate: **BLOCKED** pending those owner decisions and route-level owner sign-off.
