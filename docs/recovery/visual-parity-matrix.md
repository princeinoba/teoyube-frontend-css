# Visual Parity Matrix

## Gate status

The original static runtime remains canonical. Every Next route is `NOT VERIFIED`; a successful build does not change this status. Moving a cell to `CANDIDATE` activates blocking screenshot, ordered DOM, ID/class, parent path, asset/background, computed geometry, visible-label, control/focus, responsive-navigation, and functional comparisons. Moving a route to `VERIFIED` additionally requires `ownerApproved: true` and a current owner approval ID in `tests/visual/parity/next-route-status.json`.

The global Next shell is a separate `CANDIDATE — AWAITING OWNER REVIEW`. `npm run visual:parity:shell` compares the approved sidebar, top bar, mobile navigation, DOM/classes, asset URLs, geometry, focus order, keyboard behavior, and responsive state at all six required viewports. Side-by-side and overlay evidence is written to `.tmp/visual-parity/shell-owner-review/`. This shell candidate does not mark any feature route or matrix cell verified.

The shell contract scopes its three direct shell controls to the semantic parent `body > div.app-shell`. Next App Router emits one hidden, empty streaming sibling before the shell; it has no classes, labels, geometry, focusability, or rendered pixels and is not part of the approved shell. No shell descendant or visible region is excluded.

The Today Next preview is a `CANDIDATE — AWAITING OWNER REVIEW`, while its six matrix cells remain `NOT VERIFIED` until owner review. `npm run visual:parity:today` compares the complete approved Today surface at all six required viewports and writes static/Next screenshots, strict diffs, side-by-side images, overlays, and rich DOM contracts to `.tmp/visual-parity/today-owner-review/`. The passing 2026-07-18 run produced zero differing pixels at five viewports and 43 differing pixels (0.0055%) at tablet-landscape, within the unchanged 0.5% strict same-environment threshold.

The TeoyubeSearch Next preview is a `CANDIDATE — AWAITING OWNER REVIEW`, while its six matrix cells remain `NOT VERIFIED` until owner review. `npm run visual:parity:search` compares the complete approved Search surface at all six required viewports and writes static/Next screenshots, strict diffs, side-by-side images, overlays, and rich DOM contracts to `.tmp/visual-parity/search-owner-review/`. The passing 2026-07-18 run produced 0–1,467 differing pixels (0–0.1865%), within the unchanged 0.5% strict same-environment threshold; mobile-small 360×800 produced zero differing pixels. Ordered DOM, IDs/classes, parent paths, assets/backgrounds, computed geometry, visible labels, controls, focus order, and responsive navigation matched at every viewport.

The Search comparison excludes and masks no page region. It includes the approved hero and background artwork, Input/Button/Grid structure, Smart Search Suggestions, category filter, eight promise-cluster prompts, result thumbnails and cards, both explanation paths, progress bars, every result action and feedback control, benefits panel, shell, responsive composition, and offline status. The typed result model adds source, confidence, limitation, and disabled-provider facts behind the view; those facts do not add or change approved markup. Browser coverage exercises all seven categories and every distinct visible action type while external models and vector databases remain disconnected.

The Canon and Promise Table Next previews are `CANDIDATE - AWAITING OWNER REVIEW`, while their twelve matrix cells remain `NOT VERIFIED` until owner review. `npm run visual:parity:canon-promise` compares both complete approved pages at all six required viewports and writes static/Next screenshots, strict diffs, side-by-side images, overlays, and rich DOM contracts to `.tmp/visual-parity/canon-owner-review/` and `.tmp/visual-parity/promise-table-owner-review/`. The passing 2026-07-19 run produced zero differing pixels for Promise Table at every viewport and for Canon at five viewports. Canon desktop-wide produced 692 differing pixels (0.0534%), within the unchanged 0.5% strict same-environment threshold.

The Canon and Promise Table comparisons exclude and mask no page region. Ordered DOM, IDs/classes, parent paths, assets/backgrounds, computed geometry, visible labels, controls, focus order, and responsive navigation matched at all twelve route/viewport combinations. Browser coverage exercises Canon tabs, pagination, search, featured carousel buttons, and keyboard controls, plus Promise Table status transitions and filtering, sourced search suggestions, media selection, Level C manual entry, removal, and undo. The repository adapters retain exact Scripture references, promise level, explanation, source provenance, stable IDs, and reversible status history without connecting external storage.

The Calling Compass Next preview is a `CANDIDATE - AWAITING OWNER REVIEW`, while its six matrix cells remain `NOT VERIFIED` until owner review. `npm run visual:parity:prayer-calling-journey` compares the complete approved Calling surface against the immutable static runtime at all six required viewports. Static/Next screenshots, strict diffs, side-by-side images, overlays, and rich DOM contracts are written only to `.tmp/visual-parity/calling-owner-review/`. The passing 2026-07-19 run produced zero differing pixels and exact rich-contract parity at all six viewports.

Prayer and Journey are existing internal preview surfaces rather than members of the 12-view immutable static baseline. Their pre-migration renders were captured before the typed migration, and the blocking harness exercises their responsive output at all six required viewports. The same command enforces their exact pre-migration ordered DOM, IDs, classes, attributes, and visible-label digests at every viewport and writes disposable owner-review captures under `.tmp/visual-parity/prayer-journey-owner-review/`. The task-level pre/post screenshot and geometry comparison remains under `.tmp/visual-parity/prompt9-preservation/`; it does not create or replace an owner baseline. The 2026-07-19 structural runs matched all twelve Prayer/Journey viewport combinations. The Journey view model explicitly leaves the final unified daily loop disabled.

Functional coverage exercises Calling media search/navigation and the cautious three-question discernment flow, checks visible Scripture/evidence and rejects final-destiny language, submits Prayer Companion input and verifies Scripture, prayer, confidence, explanation, and devotional boundaries, and confirms the existing Journey seeds, levels, guardrails, limitations, and absence of a ten-step or unified-loop UI. TIG engines and seed datasets remain outside client components.

The Book of the Saint and Testimony Next previews are `CANDIDATE - AWAITING OWNER REVIEW`, while their twelve matrix cells remain `NOT VERIFIED` until owner review. `npm run visual:parity:journal-testimony-book` compares both complete approved pages at all six required viewports and writes static/Next screenshots, strict diffs, side-by-side images, overlays, and rich DOM contracts only to `.tmp/visual-parity/journal-testimony-book-owner-review/`. The passing 2026-07-19 run produced zero differing pixels and exact ordered-DOM, ID/class, parent-path, asset/background, geometry, visible-label, control, focus-order, and responsive parity for both pages at every viewport.

Journal is an existing internal preview surface rather than one of the 12 immutable static views. The same command enforces its exact pre-migration 39-element structural digest at all six viewports and stores disposable review captures beside the Book and Testimony evidence. Functional coverage verifies redacted session-only reflection summaries, editable/reviewable/reversible testimony records, explicit user status actions, removal and undo, and the absence of silent Book promotion or browser persistence. The domain contract rejects Book promotion unless a testimony is user-reviewed and the user explicitly confirms that promotion; Teoyube never declares promise fulfillment or divine action for the user.

Prompt 6 explicitly excludes the full daily journey UI. The Today harness therefore removes only the three separately injected legacy journey/recommendation nodes (`#phase116bTodayCommandCenter`, `#phase116b1Continuation-today`, and `#phase115SmartRecommendations-today`) from the static comparison. It does not exclude or mask the promise carousel, summary cards, Word of the Day, Daily Divine Assignment, reflection controls, Smart Search Suggestions, TeoyubeWorld featured-story search/carousel, highlight, feed table, shell, imagery, icons, assets, or responsive containers. Finite CSS animations are finished and infinite animations are set to time zero symmetrically in the test harness; production CSS and behavior are unchanged.

Shell element screenshots hide only `#appMain` children other than `.topbar` and the static-only `#phase113Shell` feature-infrastructure overlay in both runtimes. Those elements are feature-page or legacy infrastructure content outside this shell phase and otherwise paint above the header or Saint card before their migration prompts. The harness disables the sidebar transition symmetrically while capturing deterministic open-drawer evidence. No pixel inside the sidebar, header, navigation, mobile controls, backdrop, or Saint card is masked.

Candidate files are written only under `.tmp/visual-parity/`. Successful static reproducibility runs delete their temporary candidates. Failed runs retain candidate, diff, side-by-side, overlay-difference, report, and trace artifacts for diagnosis. Nothing writes to `tests/visual/baselines/static-runtime/`.

## Rendering tolerance

- Baseline-environment and every static-to-Next comparison: pixels with a channel delta greater than 16 may occupy at most 0.5% of the viewport. Structural, asset, label, geometry, focus, control, and responsive comparisons must also pass.
- Cross-platform static-only diagnosis: Windows Chrome or an explicitly marked non-baseline Linux Chromium may additionally pass when the downsampled whole-frame mean delta is at most 10% and every cell in a 4×4 regional grid is at most 32%. This exception is valid only after protected hashes and all 12 desktop DOM snapshots pass exactly. It is never available to a Next candidate.
- Missing or changed artwork, icons, heroes, cards, tables, rails, media, classes, IDs, assets, or responsive regions remain failures regardless of a numeric image score.
- Timed carousel state is frozen and aligned in the harness to the active controls recorded in the immutable desktop DOM snapshots. No carousel region is masked or ignored.

On 2026-07-18, the required second capture used Windows Chrome against the Linux `/usr/bin/chromium` owner baseline. It passed all 72 cross-platform screenshot checks and all 12 DOM checks. The maximum raw pixel ratio was 43.8486%, maximum whole-frame perceptual delta was 9.519%, and maximum regional delta was 30.513%. Zero screenshots met the stricter same-environment raster threshold, which is reported honestly as an environment difference rather than described as pixel equality. Temporary candidates were deleted after the passing run.

## Owner-reference map

| View | Next target | Owner reference |
| --- | --- | --- |
| today | `/` | `Asset/ChatGPT Image page (Today).png` |
| search | `/search` | `Asset/ChatGPT Image page (TeoyubeSearch).png` |
| canon | `/canon` | `Asset/ChatGPT Image page (TeoyubeCanon Page).png` |
| table | `/promise-table` | `Asset/ChatGPT Image page (TeoyubePromise table Page).png` |
| calling | `/calling-compass` | `Asset/ChatGPT Image (Calling Compass).png` |
| book | `/book` | `Asset/ChatGPT Image (Book of Saints).png` |
| lexicon | `/lexicon` | `Asset/ChatGPT Image (Teoyube Lexicon Page).png` |
| testimony | `/testimony` | `Asset/ChatGPT Image (Testimony Page).png` |
| guide | `/teo-guide` | `Asset/ChatGPT Image (Teo Guide Page).png` |
| ui-elements | `/embedded-videos` | `Asset/ChatGPT Image (Embed Video Page).png` |
| teoyube-tables | `/tables` | `Asset/ChatGPT Image (Teoyube Tables Page).png` |
| roadmap | `/roadmap` | `Asset/ChatGPT Image page (Roadmap).png` |

## 72-cell route and viewport matrix

| View | Next route | Viewport | Immutable screenshot | Status |
| --- | --- | --- | --- | --- |
| today | `/` | desktop-wide 1440×900 | `desktop-wide/today.png` | NOT VERIFIED |
| today | `/` | desktop-standard 1280×800 | `desktop-standard/today.png` | NOT VERIFIED |
| today | `/` | tablet-landscape 1024×768 | `tablet-landscape/today.png` | NOT VERIFIED |
| today | `/` | tablet-portrait 768×1024 | `tablet-portrait/today.png` | NOT VERIFIED |
| today | `/` | mobile 390×844 | `mobile/today.png` | NOT VERIFIED |
| today | `/` | mobile-small 360×800 | `mobile-small/today.png` | NOT VERIFIED |
| search | `/search` | desktop-wide 1440×900 | `desktop-wide/search.png` | NOT VERIFIED |
| search | `/search` | desktop-standard 1280×800 | `desktop-standard/search.png` | NOT VERIFIED |
| search | `/search` | tablet-landscape 1024×768 | `tablet-landscape/search.png` | NOT VERIFIED |
| search | `/search` | tablet-portrait 768×1024 | `tablet-portrait/search.png` | NOT VERIFIED |
| search | `/search` | mobile 390×844 | `mobile/search.png` | NOT VERIFIED |
| search | `/search` | mobile-small 360×800 | `mobile-small/search.png` | NOT VERIFIED |
| canon | `/canon` | desktop-wide 1440×900 | `desktop-wide/canon.png` | NOT VERIFIED |
| canon | `/canon` | desktop-standard 1280×800 | `desktop-standard/canon.png` | NOT VERIFIED |
| canon | `/canon` | tablet-landscape 1024×768 | `tablet-landscape/canon.png` | NOT VERIFIED |
| canon | `/canon` | tablet-portrait 768×1024 | `tablet-portrait/canon.png` | NOT VERIFIED |
| canon | `/canon` | mobile 390×844 | `mobile/canon.png` | NOT VERIFIED |
| canon | `/canon` | mobile-small 360×800 | `mobile-small/canon.png` | NOT VERIFIED |
| table | `/promise-table` | desktop-wide 1440×900 | `desktop-wide/table.png` | NOT VERIFIED |
| table | `/promise-table` | desktop-standard 1280×800 | `desktop-standard/table.png` | NOT VERIFIED |
| table | `/promise-table` | tablet-landscape 1024×768 | `tablet-landscape/table.png` | NOT VERIFIED |
| table | `/promise-table` | tablet-portrait 768×1024 | `tablet-portrait/table.png` | NOT VERIFIED |
| table | `/promise-table` | mobile 390×844 | `mobile/table.png` | NOT VERIFIED |
| table | `/promise-table` | mobile-small 360×800 | `mobile-small/table.png` | NOT VERIFIED |
| calling | `/calling-compass` | desktop-wide 1440×900 | `desktop-wide/calling.png` | NOT VERIFIED |
| calling | `/calling-compass` | desktop-standard 1280×800 | `desktop-standard/calling.png` | NOT VERIFIED |
| calling | `/calling-compass` | tablet-landscape 1024×768 | `tablet-landscape/calling.png` | NOT VERIFIED |
| calling | `/calling-compass` | tablet-portrait 768×1024 | `tablet-portrait/calling.png` | NOT VERIFIED |
| calling | `/calling-compass` | mobile 390×844 | `mobile/calling.png` | NOT VERIFIED |
| calling | `/calling-compass` | mobile-small 360×800 | `mobile-small/calling.png` | NOT VERIFIED |
| book | `/book` | desktop-wide 1440×900 | `desktop-wide/book.png` | NOT VERIFIED |
| book | `/book` | desktop-standard 1280×800 | `desktop-standard/book.png` | NOT VERIFIED |
| book | `/book` | tablet-landscape 1024×768 | `tablet-landscape/book.png` | NOT VERIFIED |
| book | `/book` | tablet-portrait 768×1024 | `tablet-portrait/book.png` | NOT VERIFIED |
| book | `/book` | mobile 390×844 | `mobile/book.png` | NOT VERIFIED |
| book | `/book` | mobile-small 360×800 | `mobile-small/book.png` | NOT VERIFIED |
| lexicon | `/lexicon` | desktop-wide 1440×900 | `desktop-wide/lexicon.png` | NOT VERIFIED |
| lexicon | `/lexicon` | desktop-standard 1280×800 | `desktop-standard/lexicon.png` | NOT VERIFIED |
| lexicon | `/lexicon` | tablet-landscape 1024×768 | `tablet-landscape/lexicon.png` | NOT VERIFIED |
| lexicon | `/lexicon` | tablet-portrait 768×1024 | `tablet-portrait/lexicon.png` | NOT VERIFIED |
| lexicon | `/lexicon` | mobile 390×844 | `mobile/lexicon.png` | NOT VERIFIED |
| lexicon | `/lexicon` | mobile-small 360×800 | `mobile-small/lexicon.png` | NOT VERIFIED |
| testimony | `/testimony` | desktop-wide 1440×900 | `desktop-wide/testimony.png` | NOT VERIFIED |
| testimony | `/testimony` | desktop-standard 1280×800 | `desktop-standard/testimony.png` | NOT VERIFIED |
| testimony | `/testimony` | tablet-landscape 1024×768 | `tablet-landscape/testimony.png` | NOT VERIFIED |
| testimony | `/testimony` | tablet-portrait 768×1024 | `tablet-portrait/testimony.png` | NOT VERIFIED |
| testimony | `/testimony` | mobile 390×844 | `mobile/testimony.png` | NOT VERIFIED |
| testimony | `/testimony` | mobile-small 360×800 | `mobile-small/testimony.png` | NOT VERIFIED |
| guide | `/teo-guide` | desktop-wide 1440×900 | `desktop-wide/guide.png` | NOT VERIFIED |
| guide | `/teo-guide` | desktop-standard 1280×800 | `desktop-standard/guide.png` | NOT VERIFIED |
| guide | `/teo-guide` | tablet-landscape 1024×768 | `tablet-landscape/guide.png` | NOT VERIFIED |
| guide | `/teo-guide` | tablet-portrait 768×1024 | `tablet-portrait/guide.png` | NOT VERIFIED |
| guide | `/teo-guide` | mobile 390×844 | `mobile/guide.png` | NOT VERIFIED |
| guide | `/teo-guide` | mobile-small 360×800 | `mobile-small/guide.png` | NOT VERIFIED |
| ui-elements | `/embedded-videos` | desktop-wide 1440×900 | `desktop-wide/ui-elements.png` | NOT VERIFIED |
| ui-elements | `/embedded-videos` | desktop-standard 1280×800 | `desktop-standard/ui-elements.png` | NOT VERIFIED |
| ui-elements | `/embedded-videos` | tablet-landscape 1024×768 | `tablet-landscape/ui-elements.png` | NOT VERIFIED |
| ui-elements | `/embedded-videos` | tablet-portrait 768×1024 | `tablet-portrait/ui-elements.png` | NOT VERIFIED |
| ui-elements | `/embedded-videos` | mobile 390×844 | `mobile/ui-elements.png` | NOT VERIFIED |
| ui-elements | `/embedded-videos` | mobile-small 360×800 | `mobile-small/ui-elements.png` | NOT VERIFIED |
| teoyube-tables | `/tables` | desktop-wide 1440×900 | `desktop-wide/teoyube-tables.png` | NOT VERIFIED |
| teoyube-tables | `/tables` | desktop-standard 1280×800 | `desktop-standard/teoyube-tables.png` | NOT VERIFIED |
| teoyube-tables | `/tables` | tablet-landscape 1024×768 | `tablet-landscape/teoyube-tables.png` | NOT VERIFIED |
| teoyube-tables | `/tables` | tablet-portrait 768×1024 | `tablet-portrait/teoyube-tables.png` | NOT VERIFIED |
| teoyube-tables | `/tables` | mobile 390×844 | `mobile/teoyube-tables.png` | NOT VERIFIED |
| teoyube-tables | `/tables` | mobile-small 360×800 | `mobile-small/teoyube-tables.png` | NOT VERIFIED |
| roadmap | `/roadmap` | desktop-wide 1440×900 | `desktop-wide/roadmap.png` | NOT VERIFIED |
| roadmap | `/roadmap` | desktop-standard 1280×800 | `desktop-standard/roadmap.png` | NOT VERIFIED |
| roadmap | `/roadmap` | tablet-landscape 1024×768 | `tablet-landscape/roadmap.png` | NOT VERIFIED |
| roadmap | `/roadmap` | tablet-portrait 768×1024 | `tablet-portrait/roadmap.png` | NOT VERIFIED |
| roadmap | `/roadmap` | mobile 390×844 | `mobile/roadmap.png` | NOT VERIFIED |
| roadmap | `/roadmap` | mobile-small 360×800 | `mobile-small/roadmap.png` | NOT VERIFIED |

## Functional activation contract

`tests/visual/parity/functional-scenarios.ts` defines blocking scenarios for primary navigation, carousel buttons, search submission, filters, tabs, pagination, modal and drawer behavior, primary actions, media preview controls, keyboard carousel control, and responsive mobile navigation. The static and Next pages execute the same actions and their resulting observable state must match. These scenarios are not reported as passed while their route is `NOT VERIFIED`.

Baseline update commands are deliberately refused. `npm run visual:baselines:update` always exits with an error, and both the runner and Playwright configuration reject `--update-snapshots`. A baseline change requires a separate owner-approved task and is outside R3.
