# Next Preview Side-by-Side Parity Gate

Date: 2026-07-19

Branch: `recovery/visual-source-of-truth`

Prompt 12 starting commit: `f063226f515f446237a1e195b9b4a3835e740534`

Prompt 12A starting commit: `93c014eb682369279acbf4b9937e7a9dd7753c0a`

Prompt 12B starting commit: `4c3aaba00b72bdad99ff376a0a23a0718e9dfc7b`

Owner approval: `TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8`

Gate outcome: **BLOCKED — THREE RETAINED PUBLIC ROUTES STILL LACK AN APPROVED SOURCE BASELINE; NO RUNTIME CUTOVER**

The owner accepted V-01 through V-04 as nonvisual rendering variance, approved the exact Prompt 12A render as the initial source of truth for ten named support routes, classified `/graph` as internal-only, and directed `/compass` to permanently redirect to `/calling-compass`. The approval is recorded verbatim and bound to machine-verifiable hashes. The eleven retained public views in the immutable 12-view matrix are now `PASS`; Roadmap remains owner-only. The approval did not identify `/prayer`, `/journey`, or `/journal` as approved visual sources or internal routes, so those three retain `BLOCKED_MISSING_STATIC_COUNTERPART`. `npm start` remains the static Node runtime.

No original static baseline, protected static source, stylesheet, asset, or owner reference was regenerated or modified. The new support-route baseline is a separate owner-approved tree and does not supersede the original rendered static application outside its exact ten-route scope.

## Gate coverage

- 12 immutable static views × 6 required viewports = 72 matrix cells.
- 72 current static/Next side-by-side images.
- 72 current overlay-difference images.
- Ordered DOM hierarchy, IDs, class ordering, parent paths, asset and background URLs, computed geometry, visible labels, interactive controls, focus order, and responsive navigation compared in every matrix cell.
- Static reproducibility reran all 72 immutable screenshots and 12 desktop DOM snapshots.
- Route-specific browser suites exercised carousels, keyboard controls, navigation, search categories, filters, tabs, pagination, status changes, remove/undo, drawers, local media, prayer, Calling discernment, Journal, Testimony, Book, Tables, Lexicon, and deterministic Teo Guide behavior.
- Prayer, Journey, and Journal retained their frozen pre-migration responsive contracts at all six viewports.
- Sixty owner-approved support-route screenshots and 120 DOM/asset contracts cover settings, privacy, consent, terms, profile, daily word, dashboard, explore, personalization, and promise search at all six viewports.
- Graph remains internal-only and absent from normal navigation. `/compass` permanently redirects to `/calling-compass`.
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

`PASS` below means the current automated evidence satisfies every applicable parity gate and is bound to owner approval `TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8`. The accepted raster decisions do not loosen the screenshot threshold or excuse any structural, branded, asset, layout, copy, control, responsive, or interaction difference.

| View | Next route | Cells | Screenshot result | Structural/asset/focus result | Accessibility parity | Performance evidence | Gate result |
| --- | --- | ---: | --- | --- | --- | --- | --- |
| Today | `/` | 6/6 | Strict threshold PASS; V-01 accepted for 43 pixels at tablet-landscape | Exact | No new findings | Next median 2,114.6 ms | PASS — owner-approved |
| Search | `/search` | 6/6 | Zero differing pixels after exact whitespace remediation; V-02 reviewed | Exact | No new findings | Next median 1,161.2 ms | PASS — owner-approved |
| Canon | `/canon` | 6/6 | Strict threshold PASS; V-03 accepted for 692 pixels / 0.0534% at desktop-wide | Exact | No new findings | Next median 1,345.9 ms | PASS — owner-approved |
| Promise Table | `/promise-table` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,046.6 ms | PASS — owner-approved |
| Calling Compass | `/calling-compass` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,163.0 ms | PASS — owner-approved |
| Book of the Saint | `/book` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 790.3 ms | PASS — owner-approved |
| Lexicon | `/lexicon` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,171.9 ms | PASS — owner-approved |
| Testimony | `/testimony` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 770.2 ms | PASS — owner-approved |
| Teo Guide | `/teo-guide` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 675.3 ms | PASS — owner-approved |
| Embedded Videos | `/embedded-videos` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 854.4 ms | PASS — owner-approved |
| Teoyube Tables | `/tables` | 6/6 | Zero differing pixels | Exact | No new findings | Next median 1,052.8 ms | PASS — owner-approved |
| Roadmap (owner-only) | `/roadmap` | 6/6 | Zero differing pixels | Exact, including owner QA overlay | No new findings | Next median 2,473.6 ms | `NOT_APPLICABLE_INTERNAL_ROUTE` — absent from normal navigation |

## Shell result

The sidebar, top bar, brand lockup, navigation order/icons, Saint profile, mobile toggle/backdrop, drawer focus behavior, and keyboard navigation passed at all six viewports. All shell element captures had zero differing pixels except the open mobile sidebar at tablet-portrait, which contained 130 differing pixels (0.0397%) and remained inside the strict 0.5% threshold.

Shell gate result: **PASS — V-04 accepted as `ACCEPT_NONVISUAL_RENDERING_VARIANCE` under the recorded owner approval**.

## Owner disposition of reviewed raster evidence

No structural, branded, layout, asset, copy, control, responsive, or interaction difference was detected. The owner reviewed the Prompt 12A evidence and supplied these exact decisions:

| Decision item | State | Differing pixels | Ratio | Owner disposition |
| --- | --- | ---: | ---: | --- |
| V-01 | Today, tablet-landscape | 43 | 0.0055% | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |
| V-02 | Search, reviewed listed states | Prompt 12A record | Within reviewed scope | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |
| V-03 | Canon, desktop-wide | 692 | 0.0534% | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |
| V-04 | Shell mobile sidebar open, tablet-portrait | 130 | 0.0397% | `ACCEPT_NONVISUAL_RENDERING_VARIANCE` |

Every other matrix screenshot produced zero differing pixels. The durable side-by-side, overlay, and diff artifacts are stored under `docs/owner-approvals/visual/evidence/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8/` and are hash-bound by the machine approval record. The decision changes gate status only; it does not update the immutable static baseline or numerical tolerance.

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

Method: one isolated cold browser context per runtime, view, and viewport; Chrome recycled per route; local loopback servers; fonts and visible images ready; 72 paired samples. A transient mismatch or ready time above 5,000 ms receives one same-threshold recapture; three cells used it. These numbers are comparative local evidence, not a production network benchmark.

| View | Static median ready | Next median ready | Static max | Next max |
| --- | ---: | ---: | ---: | ---: |
| Today | 2,580.5 ms | 2,198.5 ms | 3,153.6 ms | 2,335.3 ms |
| Search | 1,893.8 ms | 1,010.7 ms | 2,325.2 ms | 1,209.9 ms |
| Canon | 2,590.7 ms | 1,458.0 ms | 2,687.6 ms | 1,638.3 ms |
| Promise Table | 1,982.7 ms | 1,054.1 ms | 2,368.2 ms | 1,096.8 ms |
| Calling Compass | 2,029.0 ms | 1,194.8 ms | 2,543.4 ms | 1,691.6 ms |
| Book | 1,578.9 ms | 789.4 ms | 2,157.2 ms | 893.6 ms |
| Lexicon | 1,810.4 ms | 1,193.7 ms | 2,757.6 ms | 1,417.6 ms |
| Testimony | 2,204.4 ms | 762.7 ms | 2,376.3 ms | 828.3 ms |
| Teo Guide | 1,833.4 ms | 624.2 ms | 3,759.1 ms | 654.4 ms |
| Embedded Videos | 2,291.3 ms | 821.6 ms | 3,585.4 ms | 2,262.4 ms |
| Teoyube Tables | 2,219.2 ms | 1,123.2 ms | 2,408.9 ms | 1,836.3 ms |
| Roadmap | 3,484.8 ms | 1,779.8 ms | 4,654.5 ms | 2,795.5 ms |

The maximum retained paired-cell values were 4,654.5 ms for static and 2,795.5 ms for Next. No final cell exceeded the 5,000 ms local gate, and accessibility/focus mismatches were zero.

## Support-route source decisions

The owner established the exact Prompt 12A Next render as the initial source of truth for ten named routes. Those captures are stored in the separate `tests/visual/baselines/owner-approved-support-routes/` tree with 60 screenshots and 120 DOM/asset contracts. The original static baseline remains untouched.

| Routes | Classification | Explicit status |
| --- | --- | --- |
| `/settings`, `/privacy`, `/consent`, `/terms`, `/profile`, `/daily-word`, `/dashboard`, `/explore`, `/personalization`, `/promise-search` | `OWNER_APPROVED_PUBLIC_ROUTE` | `OWNER_APPROVED_SOURCE_BASELINE` |
| `/prayer`, `/journey`, `/journal` | `RETAINED_PUBLIC_ROUTE_REQUIRES_SOURCE_BASELINE` | `BLOCKED_MISSING_STATIC_COUNTERPART`; not named by the approval |
| `/compass` → `/calling-compass` | `REDIRECT_TO_CANONICAL_PUBLIC_ROUTE` | `REDIRECT_TO_CANONICAL_PUBLIC_ROUTE`; permanent redirect implemented |
| `/dev/teoyube-health`, `/tig/debug` | `DEVELOPMENT_ONLY` | `NOT_APPLICABLE_INTERNAL_ROUTE` |
| `/graph`, `/tig`, `/tig/data`, `/tig/graph`, `/tig/journal`, `/tig/journey`, `/tig/onboarding`, `/tig/privacy`, `/tig/progress`, `/tig/traversal` | `INTERNAL_ONLY` | `NOT_APPLICABLE_INTERNAL_ROUTE` |

The complete machine-readable inventory is `tests/visual/parity/support-route-status.json`. Roadmap remains owner-only. Graph, Roadmap, development, and TIG routes remain absent from normal navigation. The omission of Prayer, Journey, and Journal from the approval cannot be treated as silence-based authorization, so Prompt 13 remains locked.

## Intentional nonvisual differences

| Difference | Scope | Evidence treatment |
| --- | --- | --- |
| Next App Router streaming sibling | One hidden, empty sibling before the shell | Explicitly documented; no class, label, geometry, focusability, or pixels; shell descendants remain fully compared |
| Framework-generated attributes | `data-nextjs*`, `data-react*`, explicit test-only attributes, `data-testid`, and `nonce` | Narrowly ignored by the DOM contract; no page region or user attribute is ignored |
| Runtime model | Static Node document/hash navigation versus Next server-rendered route plus hydration | Direct route content, visible DOM, interaction state, and assets remain compared |
| Route addresses | Static `index.html#view` versus typed Next routes | Route mapping is explicit in the immutable matrix and status file |
| Approved stylesheet serving | Static file URLs versus Next preview rewrites for the same protected styles/assets | Computed geometry, classes, stylesheet output, and asset URLs remain compared; source files unchanged |
| Test determinism | Fixed time/randomness, paused animations and media, controlled carousel state, blocked external network | Applied symmetrically in the test harness only; production behavior unchanged |
| Owner-approved support routes without static cells | 10 exact Next renders | Stored in a separate approval-bound baseline tree; never represented as original static parity |
| Other internal/support views without static cells | 16 classified page routes | Redirect, internal/development, or blocked-source treatment is explicit and machine-checked |

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
| `npm run visual:parity:gate:audit` | PASS — 72 accessibility/focus/performance pairs, 0 violations; Chrome recycled per route; three unchanged-threshold retries |
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
- Immutable original static baselines: `tests/visual/baselines/static-runtime/` — read-only and unchanged
- Owner approval record: `docs/owner-approvals/visual/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8.md`
- Durable owner-review artifacts: `docs/owner-approvals/visual/evidence/TEOYUBE-VISUAL-APPROVAL-2026-07-19-R8/`
- Owner-approved support-route baselines: `tests/visual/baselines/owner-approved-support-routes/`

## Runtime and next gate

- Canonical runtime: static Node application.
- Default `npm start`: `node --preserve-symlinks-main server.js`.
- Next preview: separate, local, noncanonical.
- Baseline update: forbidden and not performed.
- Unified-journey expansion: not started.
- Runtime cutover: not authorized and not performed.
- Owner decisions applied: V-01 through V-04, ten exact support-route source baselines, Graph internal-only, and the Compass permanent redirect.
- Remaining owner action: identify or approve the visual source for `/prayer`, `/journey`, and `/journal`, or explicitly reclassify each route.
- Prompt 13 entry gate: **BLOCKED** because those three retained public routes still have `BLOCKED_MISSING_STATIC_COUNTERPART`.
