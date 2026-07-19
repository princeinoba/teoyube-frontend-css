# Next Preview Side-by-Side Parity Gate

Date: 2026-07-19

Branch: `recovery/visual-source-of-truth`

Starting commit: `f063226f515f446237a1e195b9b4a3835e740534`
Gate outcome: **BLOCKED FOR OWNER REVIEW — NO RUNTIME CUTOVER**

The automated parity implementation passed every executable screenshot, DOM/class, asset, interaction, keyboard/focus, responsive, accessibility-parity, and local performance check. This does not make the Next preview canonical or change any route to `VERIFIED`. Four screenshot states contain sub-threshold raster differences and require an owner decision. Every route in `tests/visual/parity/next-route-status.json` therefore remains `NOT_VERIFIED`, and `npm start` remains the static Node runtime.

No baseline, protected static source, stylesheet, asset, owner reference, approval record, or runtime status was regenerated or modified.

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

The second static capture used Windows Chrome against the immutable Linux Chromium baseline. As already documented by the recovery harness, its cross-platform result was: maximum raw raster ratio 43.8653%, maximum perceptual delta 9.519%, maximum regional delta 30.516%, with all 72 screenshots inside the cross-platform static-only tolerance. Temporary static candidates were deleted after the passing comparison.

## Matrix result

`PASS` below means the current automated parity evidence passed. It does not mean owner approval was supplied, and it does not alter the route status file.

| View | Next route | Cells | Screenshot result | Structural/asset/focus result | Accessibility parity | Performance evidence | Gate result |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| Today | `/` | 6/6 | Strict threshold PASS; 43 pixels at tablet-landscape | Exact | No new findings | Next median 2,804.3 ms | **BLOCKED — owner raster decision required** |
| Search | `/search` | 6/6 | Strict threshold PASS; max 1,467 pixels / 0.1865% | Exact | No new findings | Next median 1,373.3 ms | **BLOCKED — owner raster decision required** |
| Canon | `/canon` | 6/6 | Strict threshold PASS; 692 pixels / 0.0534% at desktop-wide | Exact | No new findings | Next median 1,653.3 ms | **BLOCKED — owner raster decision required** |
| Promise Table | `/promise-table` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,442.1 ms | PASS — automated |
| Calling Compass | `/calling-compass` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,518.6 ms | PASS — automated |
| Book of the Saint | `/book` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 960.0 ms | PASS — automated |
| Lexicon | `/lexicon` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,445.6 ms | PASS — automated |
| Testimony | `/testimony` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 892.9 ms | PASS — automated |
| Teo Guide | `/teo-guide` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 547.5 ms | PASS — automated |
| Embedded Videos | `/embedded-videos` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 896.4 ms | PASS — automated |
| Teoyube Tables | `/tables` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 905.5 ms | PASS — automated |
| Roadmap (owner-only) | `/roadmap` | 6/6 | Zero differing pixels | Exact, including owner QA overlay | No new findings | Next median 1,483.1 ms | PASS — automated; owner-only |

## Shell result

The sidebar, top bar, brand lockup, navigation order/icons, Saint profile, mobile toggle/backdrop, drawer focus behavior, and keyboard navigation passed at all six viewports. All shell element captures had zero differing pixels except the open mobile sidebar at tablet-portrait, which contained 130 differing pixels (0.0397%) and remained inside the strict 0.5% threshold.

Shell gate result: **BLOCKED — owner raster decision required for the tablet-portrait open-drawer overlay**.

## Visible raster differences requiring owner decisions

No structural, branded, layout, asset, copy, control, responsive, or interaction difference was detected. The following nonzero raster evidence cannot be promoted to owner-approved parity by Codex:

| Decision item | State | Differing pixels | Ratio | Current disposition |
| --- | --- | ---: | ---: | --- |
| V-01 | Today, tablet-landscape | 43 | 0.0055% | BLOCKED pending owner review |
| V-02 | Search, desktop-wide | 1,462 | 0.1128% | BLOCKED pending owner review |
| V-02 | Search, desktop-standard | 1,462 | 0.1428% | BLOCKED pending owner review |
| V-02 | Search, tablet-landscape | 1,466 | 0.1864% | BLOCKED pending owner review |
| V-02 | Search, tablet-portrait | 1,467 | 0.1865% | BLOCKED pending owner review |
| V-02 | Search, mobile | 258 | 0.0784% | BLOCKED pending owner review |
| V-03 | Canon, desktop-wide | 692 | 0.0534% | BLOCKED pending owner review |
| V-04 | Shell mobile sidebar open, tablet-portrait | 130 | 0.0397% | BLOCKED pending owner review |

Search mobile-small and every other matrix screenshot produced zero differing pixels. All listed differences are below the unchanged strict numerical tolerance, but the owner must inspect the associated side-by-side and overlay artifacts and decide whether they are browser raster noise. This report does not update a baseline or invent that decision.

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
| Today | 3,591.6 ms | 2,804.3 ms | 4,051.6 ms | 3,027.6 ms |
| Search | 1,971.9 ms | 1,373.3 ms | 2,573.1 ms | 1,536.3 ms |
| Canon | 2,763.3 ms | 1,653.3 ms | 3,847.1 ms | 2,410.9 ms |
| Promise Table | 2,238.6 ms | 1,442.1 ms | 2,797.0 ms | 1,508.7 ms |
| Calling Compass | 2,815.5 ms | 1,518.6 ms | 3,202.7 ms | 2,210.3 ms |
| Book | 1,967.5 ms | 960.0 ms | 2,595.3 ms | 1,069.0 ms |
| Lexicon | 2,433.1 ms | 1,445.6 ms | 2,839.7 ms | 1,757.4 ms |
| Testimony | 2,490.2 ms | 892.9 ms | 2,599.8 ms | 1,060.5 ms |
| Teo Guide | 1,294.8 ms | 547.5 ms | 2,035.0 ms | 646.2 ms |
| Embedded Videos | 1,749.3 ms | 896.4 ms | 3,358.4 ms | 2,106.8 ms |
| Teoyube Tables | 2,065.5 ms | 905.5 ms | 2,351.0 ms | 1,921.1 ms |
| Roadmap | 3,063.7 ms | 1,483.1 ms | 3,690.4 ms | 2,333.1 ms |

Overall static median ready time was 2,178.9 ms; Next was 1,315.7 ms. The maximum paired-cell values were 4,051.6 ms and 3,027.6 ms. Median transferred resource bytes were 22,066,268 for static and 8,913,524 for Next. No cell exceeded the 5,000 ms local gate.

## Other retained capabilities

These surfaces are retained but are not members of the 12-view immutable static screenshot baseline:

| Surface | Evidence | Result |
| --- | --- | --- |
| Prayer | Frozen pre-migration DOM/class/attribute/label digest at six viewports; functional Scripture/prayer/limitation checks | PASS against pre-migration contract |
| Journey | Frozen pre-migration digest at six viewports; seed/level/guardrail checks; no unified daily loop | PASS against pre-migration contract |
| Journal | Frozen pre-migration digest at six viewports; redacted session-only and reversible workflow checks | PASS against pre-migration contract |
| Settings | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Privacy | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Consent | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Terms | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Profile | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Daily Word | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Dashboard | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Explore | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Graph | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Personalization | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Promise Search | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |
| Compass | Approved shell/current responsive treatment at six viewports | **BLOCKED — no immutable static page counterpart; owner review required** |

Roadmap, TIG, development health, and media-review controls remain absent from normal navigation.

## Intentional nonvisual differences

| Difference | Scope | Evidence treatment |
| --- | --- | --- |
| Next App Router streaming sibling | One hidden, empty sibling before the shell | Explicitly documented; no class, label, geometry, focusability, or pixels; shell descendants remain fully compared |
| Framework-generated attributes | `data-nextjs*`, `data-react*`, explicit test-only attributes, `data-testid`, and `nonce` | Narrowly ignored by the DOM contract; no page region or user attribute is ignored |
| Runtime model | Static Node document/hash navigation versus Next server-rendered route plus hydration | Direct route content, visible DOM, interaction state, and assets remain compared |
| Route addresses | Static `index.html#view` versus typed Next routes | Route mapping is explicit in the immutable matrix and status file |
| Approved stylesheet serving | Static file URLs versus Next preview rewrites for the same protected styles/assets | Computed geometry, classes, stylesheet output, and asset URLs remain compared; source files unchanged |
| Test determinism | Fixed time/randomness, paused animations and media, controlled carousel state, blocked external network | Applied symmetrically in the test harness only; production behavior unchanged |
| Internal/support views without static cells | Prayer, Journey, Journal, and 12 support routes | Compared to frozen pre-migration/current-treatment contracts and reported separately; not represented as immutable static parity |

## Commands and results

| Command | Result |
| --- | --- |
| `npm run recovery:verify` | PASS before work |
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
| `npm run test` | PASS — 11 files, 58 tests |
| `npm run test:e2e` | PASS — fresh Next preview startup, secret-safe health test |
| `npm run app:build` | PASS |
| `npm run recovery:verify` | PASS after work — visual, TIG, imports, and architecture contracts |

The first route-specific commands observed an already-ready local Next process on port 3100 while their launch helper also attempted to start one, producing a non-blocking `EADDRINUSE` message. The route tests completed against the current built preview and passed. The final performance/accessibility audit eliminated that ambiguity by starting fresh static and Next servers on dedicated ports 4183 and 3183; both started successfully, all 72 pairs passed, and both ports were closed afterward. The final ordinary e2e run also started a fresh Next server cleanly on port 3100 before its secret-safe health check passed.

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
- Required owner action: review V-01 through V-04 and the support routes without immutable static counterparts, then supply explicit scoped decisions.
- Next gate: **BLOCKED** pending those owner decisions and route-level owner sign-off.
