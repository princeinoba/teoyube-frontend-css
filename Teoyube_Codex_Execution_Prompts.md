# Teoyube Codex Execution Prompt Pack — Visual Source-of-Truth Recovery Edition

**Recovery branch:** `recovery/visual-source-of-truth`
**Original baseline tag:** `teoyube-original-upload-2026-07-18`
**Original baseline commit:** `607ec21`
**Supersedes:** every earlier Teoyube Codex execution prompt pack. The prior build-foundation workspace is reference material only; only reviewed non-visual improvements may be recreated under Prompt 2.

---

## Read this before using any prompt

This file is a gated implementation program, not one giant instruction.

**Run exactly one numbered prompt at a time.** Paste only that prompt into Codex. Do not ask Codex to execute the whole file, infer later phases, or continue automatically.

At the end of each prompt, Codex must stop and report evidence. The next prompt is locked until all entry criteria are satisfied.

The most important rule in this recovery program is:

> **Architecture must migrate behind the original Teoyube interface. The original rendered interface is the visual and behavioral source of truth. No visual redesign is authorized.**

A technically clean implementation that changes Teoyube's visual identity, DOM hierarchy, CSS classes, imagery, icons, cards, animations, responsive behavior, page composition, or interaction patterns is a failed implementation.

---

# 1. Permanent product and engineering authority

Codex must apply this precedence order:

1. Explicit written instruction from the Teoyube owner.
2. The original rendered static application at `teoyube-original-upload-2026-07-18`.
3. `AGENTS.md`.
4. `tests/visual/contracts/protected-visual-source-manifest.json`.
5. `tests/visual/contracts/static-dom-contract.json`.
6. `tests/visual/contracts/original-static-visual-contract.json`.
7. `tests/visual/baselines/static-runtime/manifest.json` and its immutable artifacts.
8. Owner design references listed in `tests/visual/baselines/owner-reference-manifest.json`.
9. Product and theology documents under `docs/product-source/`.
10. Existing executable behavior and tests.
11. Architecture recommendations and framework conventions.

When two authorities appear to conflict, stop and ask the owner. Never resolve the conflict by redesigning the interface or silently updating a baseline.

---

# 2. Absolute no-redesign contract

Unless the owner provides a narrowly scoped written approval, Codex must preserve exactly:

- the rendered interface
- page-specific composition
- DOM hierarchy
- tag choice where it affects structure or semantics
- existing IDs
- existing CSS class names and class ordering
- stylesheet files and stylesheet loading order
- images, icons, SVGs, videos, posters, thumbnails, and asset paths
- hero panels and hero background images
- cards, rails, tables, grids, carousels, drawers, modals, badges, and buttons
- typography, color, spacing, dimensions, shadows, borders, radius, gradients, and overlays
- transitions, animations, hover states, focus states, and loading behavior
- responsive breakpoints and responsive composition
- sidebar, top bar, Saint profile area, navigation order, and page-specific controls
- user-visible copy that is part of the approved visual composition, unless the owner approves a content change
- functional behavior and interaction sequencing

Codex must not:

- replace pages with a generic dashboard
- replace page-specific designs with one generic feature shell
- turn Today into a generic ten-box wizard
- replace artwork with gradients or placeholders
- remove or simplify cards, carousels, tables, imagery, icons, rails, or animations
- add Tailwind, Bootstrap, Material UI, Chakra, shadcn, or another styling framework
- perform a CSS reset that alters the approved output
- rewrite CSS “for cleanliness”
- consolidate, rename, relocate, delete, regenerate, or replace a stylesheet or asset without owner approval
- use an iframe to claim parity
- update screenshots merely because the new implementation differs
- describe a visual regression as an acceptable migration limitation

Codex may add non-rendering infrastructure behind the interface. Additive `aria-*`, `data-*`, test identifiers, and non-rendering wrappers are allowed only when screenshot, layout, interaction, and accessibility evidence confirms that the approved experience has not changed.

Run before and after every prompt:

```bash
npm run recovery:verify
```

For visual-only diagnosis, `npm run recovery:visual:verify` validates all protected source hashes, stylesheet/DOM contracts, owner references, 72 responsive runtime screenshots, and 12 desktop DOM snapshots without regenerating them.

A failure is a hard stop. Do not regenerate or weaken the manifest.

---

# 3. Owner visual-approval protocol

Any proposal to alter a protected visual element requires a request based on:

```text
docs/owner-approvals/visual/VISUAL_CHANGE_REQUEST_TEMPLATE.md
```

The request must include:

- exact route and state
- exact files
- exact selectors or components
- exact assets
- before screenshot
- proposed after screenshot or mock-up
- reason the change cannot be implemented behind the existing interface
- alternatives considered
- accessibility and performance effects
- rollback plan

Codex must stop after preparing the request.

Codex is forbidden from writing or modifying:

```text
Decision: APPROVED
Approved-By:
Approved-At:
Approval-ID:
```

Only the owner can approve. Approval is limited to the exact stated scope. Silence, a green build, a previous architecture recommendation, or a prior broad request is not approval.

---

# 4. Recovery-branch discipline

The clean recovery repository was initialized directly from the uploaded ZIP because its `.git` directory was empty.

```text
baseline/original-phase-11.6c.3
  607ec21
  tag: teoyube-original-upload-2026-07-18

recovery/visual-source-of-truth
  active recovery branch
```

Rules:

- Never merge the failed redesign branch wholesale.
- Never copy a whole feature directory from the failed redesign.
- Recreate or selectively apply only independently verified non-visual work.
- Commit one prompt at a time.
- Keep rollback simple and documented.
- Do not force-push or rewrite the baseline tag.
- Do not modify the baseline branch.
- Do not add new production files named after historical phases.
- Do not delete legacy code before a parity-tested replacement exists.

Every task report must include:

```text
Branch:
Commit:
Files changed:
Protected visual files changed: 0 or owner approval ID
Visual contract result:
TIG contract result when applicable:
Build/type/lint/unit/browser results:
Screenshot parity result:
DOM/class parity result:
Functional parity result:
Security or safety result:
Remaining gaps:
Rollback command:
Owner approval required: YES/NO
Next gate: PASS/BLOCKED
```

---

# 5. Verified recovery starting state

Codex must inspect the workspace and verify these facts rather than assuming later work already exists:

- The static application remains the visual and behavioral source of truth.
- `index.html` loads the existing modular CSS in this order:
  - `styles/legacy.css`
  - `styles/tokens.css`
  - `styles/reset.css`
  - `styles/base.css`
  - `styles/layout.css`
  - `styles/components.css`
  - `styles/pages/index.css`
  - `styles/utilities.css`
  - `styles/responsive.css`
- The owner reference images are in `Asset/` and mapped by `tests/visual/baselines/owner-reference-manifest.json`.
- The recovery branch contains 72 immutable static-runtime screenshots: 12 views across six required viewports.
- The recovery branch contains 12 desktop-wide DOM/class snapshots and executable source, DOM, asset, animation, and runtime-baseline verification.
- The protected visual-source manifests cover the approved static HTML, CSS, JavaScript templates, owner images, public imagery, icons, and media UI assets.
- Existing public hero images, carousel images, thumbnails, icons, and backgrounds remain under `public/`.
- The original `package.json` is a static-runtime package and does not yet prove an independently reproducible Next application.
- The Next directory is a migration layer, not authorization to replace the approved frontend.
- `TIG_CALLING_SEEDS` exists in `src/lib/tig/seed/callings.seed.ts`.
- The recovery branch intentionally imports `TIG_CALLING_SEEDS` directly from its owner module rather than relying on a broad TIG barrel.
- The current app is primarily deterministic and local. Live generative AI, durable user memory, and production retrieval must remain gated.
- Product source documents under `docs/product-source/` are normative behavior and theology inputs, but do not authorize visual redesign.
- The original Phase 11.6C.3 publication smoke currently remains blocked at `owner_gate`, `lifecycle_state`, and `source_integrity_current`. This is a separate integrity blocker. Do not alter approval records, checksums, protected media, lifecycle evidence, or baselines merely to produce a green result.

The product doctrine to preserve is:

```text
Scripture-grounded retrieval
+ structured spiritual journeys
+ explainable recommendations
+ humble AI language
+ user-owned memory
+ cross-module continuity
+ discernment rather than certainty
+ long-term reflection and testimony
```

---

# 6. Teoyube success model

Do not optimize for raw session duration, compulsive streaks, message count, notification opens, or spiritual scoring.

Measure:

## User clarity

The user can distinguish:

- Scripture
- textual context
- Teoyube interpretation
- personalized application
- prayer draft
- suggested action
- uncertainty and limitation

## Faithful action

The user may voluntarily select one specific, realistic, Scripture-consistent action and later reflect on it. The app must never treat compliance as spiritual worth.

## Reflection continuity

A user-approved reflection may inform later journeys without hidden profiling or repeated data entry.

## Safety

No fabricated verse, harmful divine certainty, coercive guidance, unauthorized memory, unsafe crisis handling, or silent durable write.

## Trust

Users can inspect sources, explanation paths, confidence, limitations, memory use, and why an action was recommended.

## Reversibility

Users can edit, reject, skip, undo, export, and delete recommendations and stored records.

## Cross-module continuity

Information flows through Search, Scripture, Promise Table, Prayer, Calling Compass, Daily Assignment, Reflection, Testimony, and Book of the Saint without losing provenance or requiring unnecessary re-entry.

---

# Prompt 0 — Phase R0: Verify the clean recovery branch and lock the visual source of truth

```text
Read `AGENTS.md`, `docs/recovery/RECOVERY_BRANCH.md`, `docs/recovery/VISUAL_SOURCE_OF_TRUTH.md`, and every file under `docs/owner-approvals/visual/` before changing anything.

You are validating the clean recovery branch. Do not implement product features in this prompt.

GOAL

Prove that this workspace is based on the original uploaded Teoyube source, that the original frontend is protected, and that later Codex work cannot silently bless a redesign.

REQUIRED WORK

1. Confirm the active branch is `recovery/visual-source-of-truth`.
2. Confirm the baseline tag `teoyube-original-upload-2026-07-18` resolves to commit `607ec21`.
3. Review the diff from the tag to the recovery branch.
4. Confirm no protected visual source changed.
5. Run `npm run recovery:verify` and record every sub-check.
6. Run `npm run phase116c3:smoke` once, record the known publication-baseline result honestly, and do not modify protected media or approval evidence to repair it in this prompt.
7. Verify the owner reference image map points to existing files.
8. Verify the immutable runtime baseline contains 72 screenshots across six required viewports and 12 desktop-wide DOM snapshots.
9. Verify the product-source PDFs exist.
10. Verify the owner approval template does not contain an approved decision.
11. Produce `docs/recovery/r0-verification-report.md` containing exact commands and results.
12. Do not regenerate any manifest, DOM contract, or screenshot.

NON-GOALS

- no Next dependencies
- no page migration
- no CSS change
- no asset change
- no feature refactor
- no live AI
- no persistence
- no deletion or archive work

ACCEPTANCE CRITERIA

- protected visual files changed: zero
- all recovery-specific checks pass honestly
- the separate Phase 11.6C.3 publication blocker is documented without being weakened, rewritten, or falsely marked complete
- 72 responsive screenshots and 12 desktop DOM snapshots verify byte-for-byte
- branch and tag identities are correct
- all owner visual references resolve
- no owner approval is fabricated
- report states that the static runtime remains canonical
- Codex stops after the report

ROLLBACK

Only remove the R0 report if it is inaccurate. Do not touch the recovery guardrails.
```

---

# Prompt 1 — Phase R1: Repair and lock `TIG_CALLING_SEEDS` in isolation

```text
Read `AGENTS.md`. Run `npm run recovery:visual:verify` before changing anything.

GOAL

Eliminate the `Export TIG_CALLING_SEEDS doesn't exist in target module` failure through stable module ownership, without changing TIG data, recommendation behavior, user-facing output, CSS, markup, or assets.

EXPECTED IMPORT BOUNDARY

`src/lib/teoyube/calling/calling-engine.ts` must import:

- `detectCallingMatches` and `getScripturesFromCallings` from `../../tig/calling-compass`
- `TIG_CALLING_SEEDS` from `../../tig/seed/callings.seed`
- `CallingProfileNode` from `../../tig/types`

It must not depend on the broad `../../tig` barrel for these symbols.

REQUIRED WORK

1. Inspect all TIG calling exports and consumers.
2. Confirm there is only one authoritative `TIG_CALLING_SEEDS` definition.
3. Preserve the existing seed values byte-for-byte.
4. Preserve calling ranking and recommendation output.
5. Keep the compatibility barrel export if other existing consumers still need it; do not narrow it casually.
6. Add or retain a focused regression check that fails when:
   - the seed export disappears
   - the direct import changes back to the broad barrel
   - the calling functions or type owner move without an explicit contract update
7. Run:
   - `npm run recovery:tig:verify`
   - `npm run check:imports`
   - every existing calling/TIG smoke test that does not require unavailable external services
8. Run `npm run recovery:visual:verify` again.
9. Report the exact source-contract cause and why the fix is isolated.

PROHIBITED

- no duplicate seed constant
- no re-export shim that hides a missing owner module
- no changing seed data
- no moving TIG into a UI component
- no client-side model call
- no CSS, HTML, image, icon, layout, or screenshot change

ACCEPTANCE CRITERIA

- the direct imports resolve
- the regression check passes
- no protected visual source changed
- no recommendation data changed
- Codex reports exact files and stops
```

---

# Prompt 2 — Phase R2: Selectively restore the proven non-visual Next build foundation

```text
Read `AGENTS.md` and `docs/recovery/SELECTIVE_NON_VISUAL_PORT_ALLOWLIST.md`.

ENTRY GATE

Prompts 0 and 1 must pass. The static runtime remains canonical.

GOAL

Make the existing Next migration layer independently installable, type-checkable, lintable, testable, and buildable as a separate preview runtime while preserving the original static frontend exactly.

SOURCE RESTRICTION

Do not merge the failed Codex workspace. If it is available, use it only as a reference. Recreate or selectively copy reviewed files from the allowlist one coherent group at a time.

POTENTIALLY ALLOWED WORK

- Node version policy and `engines`
- reproducible npm dependencies and lockfile
- Next preview scripts
- strict TypeScript boundaries
- ESLint configuration and architecture rules
- Vitest or equivalent unit testing
- Playwright browser testing
- typed environment validation
- secret-safe health route
- CI workflow
- build-foundation documentation

EXPLICITLY FORBIDDEN TO COPY

- altered user-facing page files from the failed redesign
- `src/features/**` visual implementations from the failed redesign
- any stylesheet or asset from the failed redesign
- generic hero/card/journey components
- redesigned screenshots or updated snapshots
- changed `index.html`, `app.js`, `styles.css`, `styles/**`, `public/**`, or `Asset/**`

REQUIRED SCRIPTS

Add or verify:

- `app:dev`
- `app:build`
- `app:start`
- `typecheck`
- `lint`
- `test`
- `test:e2e`
- retain `prototype:start`
- retain `recovery:visual:verify`
- retain `recovery:tig:verify`

Do not change the default `start` command to Next.

ENVIRONMENT RULES

- AI keys, database URLs, telemetry credentials, and provider secrets remain server-only.
- No real external service is connected.
- Disabled feature flags must fail safe.
- Health output may show build version, runtime type, and enabled flags, but never secret values.

VISUAL PROTECTION

1. Run `npm run recovery:visual:verify` before applying each file group.
2. Run it after each file group.
3. The Next preview may look incomplete at this phase; do not “fix” it by inventing a new design.
4. Do not make the Next preview public or canonical.

ACCEPTANCE CRITERIA

- clean `npm ci` succeeds
- `npm run app:build` succeeds
- `npm run typecheck` succeeds for the Next preview strict boundary
- `npm run lint` succeeds
- `npm run test` succeeds
- a minimal e2e health test succeeds
- `npm run prototype:start` still serves the original frontend
- no secret is exposed
- protected visual files changed: zero
- Codex lists every selectively recreated or copied file and why it was allowed
- static `start` remains canonical
- Codex stops
```

---

# Prompt 3 — Phase R3: Turn the immutable visual baselines into a blocking parity harness

```text
Read `AGENTS.md`, `docs/recovery/VISUAL_SOURCE_OF_TRUTH.md`, the owner-reference manifest, and the static-runtime manifest.

ENTRY GATE

The Next preview build foundation must pass, but no page migration may have begun. The recovery branch already contains the owner-authorized initial baselines. Do not recapture, overwrite, rename, move, or update them.

GOAL

Make the existing screenshot, DOM, class, asset, animation, responsive, and interaction contracts executable against future Next preview pages so a redesign cannot be hidden behind a passing build.

EXISTING IMMUTABLE BASELINE

- 12 static views
- six required viewports:
  - desktop-wide 1440×900
  - desktop-standard 1280×800
  - tablet-landscape 1024×768
  - tablet-portrait 768×1024
  - mobile 390×844
  - mobile-small 360×800
- 72 static-runtime screenshots
- 12 desktop-wide DOM/class snapshots
- owner design references in `Asset/`
- protected source, stylesheet-order, DOM, class, asset, media-query, and animation-name contracts

REQUIRED WORK

1. Verify all existing baseline manifests and artifacts with `npm run recovery:visual:verify`.
2. Add Playwright comparison utilities that capture the Next preview into a separate candidate-output directory. Candidate captures must never overwrite baseline paths.
3. Freeze time, random values, carousels, transitions, videos, and nondeterministic network data only in the test harness. Do not change production CSS or behavior for test stability.
4. For each candidate route and viewport compare:
   - viewport screenshot
   - ordered DOM signature
   - IDs and class lists
   - parent/child paths for major regions
   - image, icon, poster, video, and background-image URLs
   - major computed geometry
   - visible static labels
   - focus order and interactive controls
   - responsive navigation and page composition
5. Ignore only framework-generated attributes, explicit test-only attributes, timestamps, and narrowly documented nondeterministic data. Never ignore a page region, hero, card, image, icon, rail, or responsive container merely because it differs.
6. Add functional parity tests for navigation, carousel controls, search submission, filters, tabs, pagination, modal/drawer behavior, primary actions, media controls, keyboard navigation, and responsive navigation.
7. Add side-by-side and overlay diff generation into disposable test artifacts.
8. Make ordinary CI unable to run `--update-snapshots` against owner baselines. A baseline update requires a current-task owner approval ID and is outside this prompt.
9. Create `docs/recovery/visual-parity-matrix.md` with one row per view and viewport. Initial Next status must be `NOT VERIFIED`, not inferred from a build.
10. Run a second static-runtime capture into a temporary directory and prove it compares to the immutable baseline within the documented browser-rendering tolerance. Delete only the temporary candidate output afterward.

DIFF POLICY

- Same-environment static-to-static comparison should be as close to zero as browser rasterization permits.
- Missing or changed artwork, icon, hero, card, table, rail, animation, layout region, class, ID, asset URL, or responsive composition is always a failure.
- A numerical threshold may detect noise; it may not excuse a structural or branded difference.
- Do not mask regions, loosen DOM comparison, or replace baseline images with Next screenshots.

ACCEPTANCE CRITERIA

- all 72 baseline screenshots and 12 DOM snapshots remain byte-identical
- protected source files changed: zero
- static-to-static reproducibility is documented
- candidate comparison tooling is executable in CI
- candidate outputs are stored separately and are disposable
- every Next route remains `NOT VERIFIED` until its feature prompt passes and the owner reviews the evidence
- no Next page migration begins in this prompt
- Codex stops
```

---

# Prompt 4 — Phase 11.7A-R: Establish feature-oriented boundaries without changing rendered output

```text
Read `AGENTS.md`. Run all recovery and parity baselines first.

ENTRY GATE

The owner has confirmed the baseline. No page has been visually redesigned.

GOAL

Organize new code around stable business capabilities while keeping all existing views and behaviors unchanged.

TARGET CAPABILITIES

- today
- search
- scripture
- promises
- prayer
- calling
- journey
- journal
- testimony
- book
- lexicon
- teo-guide
- media
- settings
- consent
- memory

TARGET DEPENDENCY DIRECTION

approved view
→ typed view model / event adapter
→ feature application service
→ domain contract and service
→ repository / infrastructure

REQUIRED WORK

1. Add feature public APIs and dependency boundaries without moving visual markup yet.
2. Create typed legacy adapters around current behavior.
3. Create domain contracts that import neither React nor Next.js.
4. Keep legacy phase files in place behind adapters.
5. Prevent new production imports from historical phase modules except through named compatibility adapters.
6. Add forbidden-import and dependency-cycle checks.
7. Add a removal ledger; do not remove anything in this prompt.
8. Do not create generic visual primitives to replace existing page-specific components.
9. A feature may expose data and actions, but its approved view remains responsible for the existing markup and classes.
10. Run screenshot, DOM, class, asset, functional, build, type, lint, and unit checks.

SUGGESTED STRUCTURE

src/
  app/
  features/
    today/
    search/
    scripture/
    promises/
    prayer/
    calling/
    journey/
    journal/
    testimony/
    book/
    lexicon/
    teo-guide/
    media/
    settings/
  domain/
    journey/
    tig/
    scripture/
    memory/
    safety/
  server/
    ai/
    auth/
    data/
    observability/
    security/
  shared/
    contracts/
    utilities/
    validation/

NON-GOALS

- no route cutover
- no CSS reorganization
- no visual component replacement
- no phase-file deletion
- no persistence
- no live AI

ACCEPTANCE CRITERIA

- new production code is capability-oriented
- domain code has no React or Next dependency
- legacy behavior is reachable through typed adapters
- no visual diff
- no DOM/class diff
- no asset diff
- no functional regression
- protected visual files changed: zero
- Codex stops
```

---

# Prompt 5 — Phase 11.7B-R1: Reproduce the global Teoyube shell exactly in the Next preview

```text
Read `AGENTS.md` and the parity matrix.

ENTRY GATE

Feature boundaries exist and the baseline harness passes.

GOAL

Render the global shell in the Next preview with exact parity while the static runtime remains canonical.

PRESERVE EXACTLY

- Ephesians 1:18 brand lockup
- brand mark
- sidebar width, hierarchy, scrolling, and responsive behavior
- navigation labels, order, active state, and icons
- Saint profile card
- mobile navigation controls and backdrop
- main content width
- top bar, title area, Guardrails action, and Generate Today's Journey action
- existing stylesheet order and asset URLs

IMPLEMENTATION RULES

1. Import or link the existing CSS without editing it.
2. Preserve existing public asset paths.
3. Reproduce the existing DOM hierarchy, IDs, and classes in React/Next.
4. Do not use an iframe.
5. Do not insert a new wrapper that changes grid, flex, stacking, scroll, or focus behavior.
6. Route state may be implemented behind the shell, but visible navigation must remain identical.
7. Keep internal TIG and owner routes out of normal navigation exactly as the approved runtime does.
8. Add shell-only screenshot, DOM, class, asset, keyboard, and responsive tests.

ACCEPTANCE CRITERIA

- every shell viewport passes the parity harness
- no missing image, icon, class, or interaction
- focus order is preserved or improved without visual change
- static runtime remains the default start
- protected visual files changed: zero
- owner receives side-by-side evidence
- no feature page is redesigned
- Codex stops for owner review
```

---

# Prompt 6 — Phase 11.7B-R2: Migrate Today with exact visual and functional parity

```text
Read `AGENTS.md`. Do not use the generic guided-journey page created in the failed migration.

GOAL

Move Today into the Next preview while preserving the original Today experience exactly.

PRESERVE

- promise carousel, arrows, dots, imagery, automation, and keyboard behavior
- Today's Promise detail card
- Daily Inspiration card
- Daily Progress card and ring
- Streak card
- Teoyube Word of the Day card
- Daily Divine Assignment card
- reflection field and completion action
- TeoyubeWorld featured-story search and carousel
- TeoyubeWorld feed table
- all existing IDs, classes, assets, copy placement, responsive rearrangement, and animations

ARCHITECTURE

1. Keep the approved Today component render-focused.
2. Feed it a typed `TodayViewModel` and typed actions.
3. Move data selection and state transitions behind an application service.
4. Preserve deterministic TIG behavior through a compatibility adapter.
5. Do not add the full daily journey UI yet.
6. The default state must remain screenshot-identical.
7. Add unit tests for view-model mapping and browser tests for all existing actions.

PROHIBITED

- no ten-step strip
- no generic white card shell
- no removal of imagery or TeoyubeWorld content
- no replacement of page-specific cards
- no new visual progress design

ACCEPTANCE CRITERIA

- screenshot, DOM, class, asset, responsive, and functional parity pass at every viewport
- Today can use new typed services without visual changes
- original static Today remains available as rollback
- protected visual files changed: zero
- Codex stops for owner review
```

---

# Prompt 7 — Phase 11.7B-R3: Migrate TeoyubeSearch with exact parity and typed behavior

```text
Read `AGENTS.md` and the product-source TeoyubeSearch and Promise Cluster documents.

GOAL

Move TeoyubeSearch into the Next preview without changing its approved hero, search entrance, images, filters, cards, thumbnails, buttons, supporting panels, or responsive composition.

PRODUCT BEHAVIOR

Search must support intent across:

- Promise
- Scripture
- life problem
- calling
- prayer
- Teoyube word
- testimony

The typed result model may include:

- search intent
- promise category and level
- exact Scripture references
- explanation
- calling connection
- Teoyube word and meaning
- prayer draft
- daily assignment
- animation reference
- actions to watch, save, add to Promise Table, or continue the journey

VISUAL RULE

Use the original Input, Button, Grid, Jumbotron/hero, Nav, thumbnail, list-item, and result-card structure. Do not replace it with generic cards or a dark-gradient approximation.

REQUIRED WORK

1. Preserve exact markup and classes.
2. Create a typed search controller and result DTO.
3. Keep current deterministic search as the behavior baseline.
4. Add source and confidence fields behind the view.
5. Preserve current empty, loading, and result states.
6. Add tests for every category and every visible action.
7. Run complete parity evidence.

ACCEPTANCE CRITERIA

- exact visual and functional parity
- typed search behavior behind the approved page
- no external model or vector database yet
- no protected visual change
- Codex stops
```

---

# Prompt 8 — Phase 11.7B-R4: Migrate Canon and Promise Table with exact parity

```text
Read `AGENTS.md` and Promise Cluster source documents.

GOAL

Move Canon and Promise Table into the Next preview without changing their page-specific hero imagery, grids, tabs, carousels, rows, cards, search panels, video panels, statuses, filters, actions, or responsive behavior.

CANON REQUIREMENTS

- preserve the current hero and background images
- preserve canonical tabs, grids, category cards, recent items, recommended carousel, pagination, and paths
- keep Scripture as primary authority
- do not make Teoyube words appear equivalent to Scripture

PROMISE TABLE REQUIREMENTS

- preserve the approved promise-table hero, search, saved rows, journey statuses, progress, media area, and action controls
- keep every saved item linked to its exact source, promise level, explanation, and reversible status transition
- preserve the current visual distinction between data regions

ARCHITECTURE

1. Add `ScriptureRepository` and `PromiseRepository` interfaces without changing storage yet.
2. Adapt existing JSON/local data behind those interfaces.
3. Preserve stable IDs and current displayed content.
4. Keep data access out of visual components.
5. Add parity and functional tests.

ACCEPTANCE CRITERIA

- exact parity for Canon and Promise Table
- no fabricated Scripture text
- source provenance survives save/remove/status actions
- protected visual files changed: zero
- Codex stops for owner review
```

---

# Prompt 9 — Phase 11.7B-R5: Migrate Prayer, Calling Compass, and the existing Journey surface with exact parity

```text
Read `AGENTS.md` and run `npm run recovery:tig:verify`.

GOAL

Move Prayer, Calling Compass, and the existing Journey experience into the Next preview without replacing their approved visual compositions.

CALLING COMPASS

- preserve the approved compass artwork, direction layout, cards, indicators, actions, and responsive states
- treat calling as discernment over time
- display evidence and emerging patterns, not a final destiny
- use wording such as “strongest indicators suggest” or “appears to be emerging”

PRAYER

- preserve the existing prayer cards, companion interaction, inputs, actions, and page imagery
- every generated prayer remains traceable to Scripture
- do not command God, manipulate the user, or present generated language as divine speech

JOURNEY

- preserve the existing journey page structure
- do not introduce the final unified daily loop in this prompt
- move current behavior behind typed journey contracts only

TECHNICAL REQUIREMENTS

1. Keep TIG engine and seed access server-side or in domain modules, not in client components.
2. Return typed DTOs to visual components.
3. Preserve explanation paths and confidence.
4. Add direct-import boundary tests.
5. Add visual and functional parity tests.

ACCEPTANCE CRITERIA

- exact parity for all three capabilities
- no `TIG_CALLING_SEEDS` regression
- no TIG seed bundle imported into browser components
- no final-calling language
- no protected visual change
- Codex stops
```

---

# Prompt 10 — Phase 11.7B-R6: Migrate Journal, Testimony, and Book of the Saint with exact parity

```text
Read `AGENTS.md` and the Theology Constitution.

GOAL

Move Journal, Testimony, and Book of the Saint into the Next preview while preserving every existing page-specific image, hero, book treatment, card, table, field, filter, action, and responsive state.

DOMAIN DISTINCTION

- Journal: private chronological reflection
- Testimony: a user-reviewed account the user chooses to record
- Book of the Saint: a curated spiritual autobiography composed from user-approved milestones, testimony, prayers, lessons, and calling reflections

RULES

1. Never automatically declare a promise fulfilled.
2. Never automatically label an event as God's action.
3. Only the user may publish or finalize testimony.
4. A journal item may be proposed as a testimony candidate, but the proposal must be editable, rejectable, and reversible.
5. A reviewed record may be promoted to the Book only after explicit confirmation.
6. Preserve existing session-only behavior until the consent-aware persistence phase.
7. Do not log raw reflection text.
8. Add typed domain records and provenance behind the approved views.

ACCEPTANCE CRITERIA

- exact visual and functional parity
- no silent persistence
- no automatic testimony or divine claim
- provenance and reversibility modeled
- protected visual files changed: zero
- Codex stops
```

---

# Prompt 11 — Phase 11.7B-R7: Migrate Lexicon, Teo Guide, Embedded Videos, Tables, and approved support views with exact parity

```text
Read `AGENTS.md` and the language/lexicon source document.

GOAL

Complete preview-route parity for the remaining retained user-facing capabilities without redesign.

LEXICON

- preserve hero/background imagery, cards, categories, pronunciation, meaning, Scripture source, prayer use, word combinations, promise clusters, calling associations, and animation symbols
- explicitly show that Teoyube words are Scripture-derived aids, not Scripture

TEO GUIDE

- preserve the approved Teo Guide page imagery, conversation area, prompts, cards, buttons, rails, and states
- keep deterministic local behavior in this prompt
- add typed message and source contracts behind the page

EMBEDDED VIDEOS AND TABLES

- preserve media hero imagery, grids, filters, thumbnails, playback, table structure, full-width behavior, and responsive layout
- preserve MIME, Range, cache, and protected-path behavior

SUPPORT VIEWS

- settings, privacy, consent, terms, profile, and other retained public views must use the approved shell and current visual treatment
- owner-only and development-only views remain protected and absent from normal navigation

ACCEPTANCE CRITERIA

- every retained view has parity evidence
- no missing assets or media behavior
- Teo Guide remains deterministic until later safety gates
- protected visual files changed: zero
- Codex stops for owner review
```

---

# Prompt 12 — Phase 11.7B-R8: Complete the side-by-side parity gate without switching runtimes

```text
Read `AGENTS.md` and `docs/recovery/visual-parity-matrix.md`.

GOAL

Prove that the Next preview reproduces every retained public capability before any unified-journey expansion or runtime cutover.

REQUIRED WORK

1. Run static and Next preview side by side.
2. Run every viewport and state in the parity matrix.
3. Produce side-by-side and overlay diff artifacts.
4. Verify:
   - screenshot parity
   - DOM hierarchy parity
   - ID and class parity
   - asset path parity
   - interaction parity
   - keyboard/focus parity
   - responsive parity
   - accessibility parity
   - performance comparison
5. Record every intentional nonvisual difference, such as framework attributes or server rendering behavior.
6. Any visible difference requires owner review; do not update the baseline.
7. Keep `npm start` on the static runtime.
8. Produce `docs/recovery/next-preview-parity-gate.md`.

ACCEPTANCE CRITERIA

- every retained page is PASS or explicitly BLOCKED
- no page is marked PASS from a build result alone
- every visible difference has an owner decision
- static runtime remains canonical
- protected source files remain unchanged
- Codex stops
```

---

# Prompt 13 — Phase 11.8-R: Connect all modules through one guided daily spiritual loop without redesigning Today

```text
Read `AGENTS.md` and all parity evidence.

ENTRY GATE

Every affected page must already pass visual and functional parity in the Next preview.

GOAL

Create one coherent daily spiritual formation loop across existing modules while preserving the original default appearance and page-specific designs.

CANONICAL LOOP

Today
→ Check-in
→ Scripture
→ Promise
→ Prayer
→ Calling discernment
→ Daily assignment
→ Reflection
→ Testimony candidate
→ Book review
→ Tomorrow

CRITICAL VISUAL RULE

Do not replace Today with a wizard, ten-stage strip, generic cards, or a new dashboard. Integrate the journey through the existing Today cards, progress area, actions, drawers/modals, and existing module pages.

DEFAULT STATE

The default Today screenshot must remain identical. Journey state may populate existing content, change approved text/data, and activate existing states. A new visible component requires owner approval.

DOMAIN MODEL

Create typed artifacts for:

- check-in summary
- Scripture selection and citations
- promise selection and level
- prayer draft
- discernment record
- daily assignment
- reflection record
- testimony candidate
- Book promotion decision
- tomorrow carry-forward

Every artifact must include:

- source references
- TIG explanation trace
- confidence
- limitations
- creation time
- user edits
- accepted/rejected/skipped status
- reversible transition metadata

REQUIRED BEHAVIOR

1. One primary action and no more than two secondary actions per active journey moment.
2. Allow skip, revisit, edit, reject, and undo.
3. Reuse deterministic TIG through typed application services.
4. Make cross-module actions explicit.
5. Preserve source provenance when moving between modules.
6. Do not automatically:
   - claim fulfillment
   - label an event as God's action
   - decide calling
   - publish testimony
   - persist private text
7. Add journey continuity tests across every module.
8. Measure clarity, faithful-action selection, reflection continuity, trust, and reversibility—not raw engagement.

ACCEPTANCE CRITERIA

- a user can complete the full loop without losing context
- every module retains its approved visual identity
- default screenshots remain unchanged
- all new states use existing approved structures or owner-approved additions
- every recommendation is sourced, explainable, rejectable, and reversible
- browser tests cover the complete loop
- Codex stops
```

---

# Prompt 14 — Phase 11.9-R: Turn TIG into a stable typed domain service

```text
Read `AGENTS.md`. This is a domain refactor, not a UI task.

GOAL

Make TIG the deterministic, explainable intelligence layer with stable contracts and no dependency on React, Next, model providers, or client bundles.

REQUIRED CONTRACTS

- query intent
- normalized user context
- candidate
- score breakdown
- Scripture anchor
- graph path
- confidence
- limitations
- fallback reason
- recommendation DTO
- explanation DTO
- dataset and ruleset version

REQUIRED WORK

1. Identify the canonical TIG implementation and overlapping legacy implementations.
2. Create one stable service interface.
3. Preserve current outputs through compatibility adapters.
4. Import seeds from owning modules.
5. Keep seed datasets and traversal server-side where appropriate.
6. Create deterministic tests for ranking, traversal, fallback, and explanation.
7. Add contract tests for every feature consumer.
8. Add dataset-version-aware caching.
9. Add input-size and complexity limits.
10. Do not delete legacy TIG code until no production consumer imports it and parity tests pass.

RECOMMENDED INTERFACE

interface TigService {
  recommend(input: TigRecommendationInput): Promise<TigRecommendationResult>;
  explain(recommendationId: string): Promise<TigExplanation>;
  validateSources(result: TigRecommendationResult): Promise<SourceValidationResult>;
}

ACCEPTANCE CRITERIA

- deterministic result for fixed input and dataset version
- every result has explanation and source path
- no UI component imports seeds
- no model call is required
- current user-visible behavior remains visually and functionally stable
- TIG contract, visual contract, build, type, lint, and tests pass
- Codex stops
```

---

# Prompt 15 — Phase 12.0-R: Build exact and citable Scripture retrieval before broad generative AI

```text
Read `AGENTS.md`, the Theology Constitution, Promise Cluster Architecture, and TeoyubeSearch Framework.

GOAL

Create a trustworthy Scripture retrieval service that resolves exact passages, preserves translation metadata, validates citations, and feeds Search, Promise Table, Prayer, Today, Calling Compass, Journey, and Teo Guide.

SCRIPTURE AUTHORITY

Scripture text, reference, translation, context, and licensing metadata must be separate from Teoyube interpretation and personalized application.

REQUIRED CAPABILITIES

1. Parse and normalize exact references.
2. Retrieve exact verse or passage text from an approved licensed/local corpus.
3. Return book, chapter, verse range, translation, source, and licensing metadata.
4. Retrieve surrounding paragraph/pericope and chapter context.
5. Support lexical search without an LLM.
6. Validate every displayed quotation against the corpus.
7. Distinguish:
   - Level A direct promise
   - Level B biblical principle
   - Level C personalized application
8. Reject or visibly flag unresolved references.
9. Prevent the application from inventing a verse.
10. Add tests for ranges, abbreviations, punctuation, invalid references, translation boundaries, and citation rendering.

REPOSITORY CONTRACT

interface ScriptureRepository {
  getByReference(reference: ScriptureReference): Promise<ScripturePassage | null>;
  getContext(reference: ScriptureReference): Promise<ScriptureContext>;
  search(query: ScriptureSearchQuery): Promise<ScriptureSearchResult[]>;
}

VISUAL RULE

Render results through the existing approved Scripture, Search, Canon, Promise, Prayer, and Teo Guide structures. A new citation component may be created only if it reproduces current styling or receives owner approval.

ACCEPTANCE CRITERIA

- every quote is corpus-validated
- every reference is exact and citable
- translation and licensing status are explicit
- interpretation is visibly separate from Scripture
- no generative AI is needed for retrieval
- all existing visual parity tests remain green
- Codex stops
```

---

# Prompt 16 — Phase 12.1-R: Add durable, consent-aware continuity and user-owned memory

```text
Read `AGENTS.md`, privacy/consent views, and the Theology Constitution.

GOAL

Provide durable continuity without hidden profiling, unauthorized storage, or loss of user control.

MEMORY LAYERS

- session memory: current conversation and active journey
- episodic memory: user-approved summaries of events and completed actions
- semantic preference memory: translation, response length, accessibility, and reminder preferences
- structured spiritual-journey state: completed stages, sources, actions, and reflections

DO NOT STORE AI CONCLUSIONS AS FACTS

Do not store “the user is called to ministry.” Store evidence such as “the user saved three reflections related to teaching and mentoring.”

REQUIRED WORK

1. Define data classification and retention.
2. Add authentication and authorization.
3. Add repository interfaces and migrations.
4. Add a consent ledger with purpose, scope, time, and revocation.
5. Persist low-sensitivity settings first.
6. Persist journey state only with clear consent.
7. Persist journal/reflection content only under explicit sensitive-data consent.
8. Encrypt in transit and at rest; consider application-level encryption for private journal text.
9. Add export, edit, deletion, and memory inspection.
10. Apply immediate revocation and deletion semantics.
11. Prevent cross-user access with authorization tests.
12. Do not log raw prayer, confession, trauma, health, relationship, or journal text.

WRITE POLICY

Every durable write must be:

- explicit
- reviewable
- user-confirmed when sensitive
- auditable
- reversible
- exportable
- deletable

VISUAL RULE

Use the approved Settings, Privacy, Consent, Journal, Journey, and Teo Guide page structures. Any new visible control requires owner approval if it cannot be implemented in an existing card, row, modal, or drawer.

ACCEPTANCE CRITERIA

- cross-device continuity works
- users can inspect and delete memory
- no hidden persistence
- no cross-user leakage
- consent revocation is effective
- private text is absent from logs
- visual parity remains green
- Codex stops
```

---

# Prompt 17 — Phase 12.2-R: Establish theological safety, sensitive-topic handling, and AI evaluation gates

```text
Read `AGENTS.md` and `docs/product-source/TEOYUBE THEOLOGY CONSTITUTION V1.pdf`.

GOAL

Create executable policies and evaluations that must pass before live generative AI is connected.

NON-NEGOTIABLE THEOLOGICAL RULES

- Scripture is the highest authority.
- Teoyube may explain, organize, personalize, and apply Scripture, but never replace it.
- Personalization must not change Scripture's meaning.
- Teoyube words are memory/prayer aids, not Scripture.
- Calling is discerned, not declared by AI.
- Major decisions require prayer, biblical examination, wise counsel, fruit, and time.
- AI must not claim divine authority.
- Only the user may record testimony or declare fulfillment.
- Teoyube does not replace Scripture, prayer, pastoral care, church community, medical care, legal advice, or emergency services.

SENSITIVE-TOPIC TAXONOMY

- doubt
- grief
- trauma
- abuse
- self-harm or danger
- psychosis, paranoia, or hearing divine commands
- spiritual coercion
- relationship crisis
- medical concern
- financial desperation
- prophecy and divine messages
- demonic interpretations
- scrupulosity and compulsive religious fear

REQUIRED WORK

1. Create typed safety decisions and escalation paths.
2. Create pre-retrieval, pre-model, and post-model safety checks.
3. Create prohibited-claim detection.
4. Create crisis response policies and locale-aware resource integration.
5. Add a versioned evaluation dataset.
6. Evaluate:
   - Scripture fidelity
   - citation correctness
   - humility
   - uncertainty
   - coercion
   - divine-certainty language
   - calling overreach
   - testimony overreach
   - crisis response
   - prompt injection
   - memory authorization
7. Define release thresholds and a blocking AI quality gate.
8. Keep live model flags disabled.

ACCEPTANCE CRITERIA

- safety tests are executable and versioned
- harmful divine certainty is blocked
- sensitive questions route correctly
- deterministic fallback remains available
- no live model is connected
- visual parity remains green
- Codex stops
```

---

# Prompt 18 — Phase 12.3-R: Make Teo Guide an orchestrator over safe structured tools

```text
Read `AGENTS.md`, TIG contracts, Scripture retrieval contracts, memory contracts, and safety policies.

GOAL

Turn Teo Guide into a useful spiritual companion orchestrator while still operating without a live generative model.

AUTHORIZED TOOL CATEGORIES

- `searchScripture`
- `getScriptureContext`
- `searchPromises`
- `getPromiseCluster`
- `getCurrentJourney`
- `proposeJourneyAction`
- `getCallingEvidence`
- `buildPrayerOptions`
- `searchApprovedUserMemory`
- `summarizeReflectionPattern`
- `createJournalDraft`
- `createTestimonyDraft`
- `createMentorDiscussionPrompt`

TOOL RESULT CONTRACT

Every tool result must contain:

- data
- source references
- confidence
- limitations
- retrieved time
- dataset/version metadata
- consent scope when memory is involved

TEO GUIDE RESPONSE CONTRACT

Visibly distinguish:

1. Scripture
2. What the text says
3. A possible interpretation
4. Consider in prayer
5. A practical next step
6. Discuss with someone you trust
7. Why this was suggested
8. Limitations or uncertainty

WRITE SAFETY

Teo Guide may propose but may not silently:

- save memory
- advance a journey
- publish testimony
- declare fulfillment
- determine calling
- contact another person
- delete data
- make a durable state change

REQUIRED WORK

1. Create a provider-neutral orchestration interface.
2. Run tools through authorization, validation, timeout, and telemetry boundaries.
3. Use deterministic response composition initially.
4. Preserve the approved Teo Guide page exactly.
5. Add follow-up question policies.
6. Add source drawer/explanation behavior only through existing approved structures or owner approval.
7. Add end-to-end tests for safe tool selection and no unauthorized writes.

ACCEPTANCE CRITERIA

- Teo Guide can coordinate structured tools without a model
- every response is sourced and explainable
- memory reads honor consent
- all writes require confirmation
- default and interaction visual states retain parity
- Codex stops
```

---

# Prompt 19 — Phase 12.4-R: Activate live AI through a guarded provider-neutral gateway

```text
Read `AGENTS.md` and proceed only when Scripture, memory, safety, evaluation, TIG, and tool-orchestration gates all pass.

GOAL

Make Teo Guide an active live AI companion without allowing the model to become the source of Scripture, truth, consent, journey state, or divine authority.

ARCHITECTURE

user input
→ input validation and size limits
→ safety and intent classification
→ authorized structured tool plan
→ Scripture/TIG/memory retrieval
→ provider-neutral model gateway
→ structured response validation
→ citation and theological-claim validation
→ streamed approved response
→ user-confirmed write actions

MODEL GATEWAY

Create one server-only interface. No feature may import a vendor SDK directly.

Support:

- structured outputs
- approved function tools
- typed streaming events
- timeouts and cancellation
- retries with idempotency
- model routing
- token and cost budgets
- deterministic fallback
- provider outage fallback
- prompt and response versioning

MODEL ROUTING

- deterministic: exact lookup, graph traversal, state transitions, citations, consent, safety
- low-cost model: intent, query expansion, labels, constrained summaries
- standard model: ordinary Teo Guide conversation and synthesis
- advanced reasoning model: rare high-complexity cases, with stricter limits

HUMBLE LANGUAGE

The model may say:

- “One way to understand this passage is…”
- “This may be worth praying about and discussing with someone you trust.”
- “I cannot know with certainty that God is directing you to…”
- “This suggestion is based on the sources shown below.”

It must not say:

- “God told me…”
- “God is definitely calling you…”
- “This is guaranteed.”
- “You must do this immediately.”
- “Your suffering proves a spiritual failure.”

PROMPT INJECTION

Treat user content, journal text, retrieved web content, uploaded documents, and vector chunks as untrusted data. Retrieved instructions may never override system policy or tool authorization.

VISUAL RULE

Live streaming, tool status, errors, and source explanations must use the approved Teo Guide page, cards, message structures, and existing visual language. Do not redesign the page to resemble a generic chatbot.

ACCEPTANCE CRITERIA

- live model responses stream through the gateway
- every Scripture quote validates
- structured schema validates before display
- unsafe certainty is blocked
- prompt injection tests pass
- no unauthorized memory or write action
- deterministic fallback works during provider failure
- model costs and latency are observable without logging private text
- AI evaluation thresholds pass
- visual parity remains green
- Codex stops
```

---

# Prompt 20 — Phase 12.5-R: Add partitioned RAG, embeddings, and cross-module intelligence

```text
Read `AGENTS.md`. Live AI must already be safe and observable.

GOAL

Improve retrieval and continuity without creating an opaque vector-only spiritual authority.

PARTITIONED CORPORA

Use separate collections/indexes for:

1. Scripture text
2. Scripture context and cross-references
3. Promise clusters
4. Teoyube lexicon and grammar
5. prayer resources
6. theology and safety rules
7. user-approved journal summaries
8. user-approved testimonies
9. journey history
10. calling evidence
11. product help

RETRIEVAL ORDER

1. detect explicit Scripture references
2. resolve exact Scripture
3. run lexical search
4. run vector search where useful
5. expand through TIG graph relationships
6. filter by metadata, consent, translation, and trust level
7. rerank
8. provide the smallest sufficient context to the model

CHUNKING

Scripture must use verse, paragraph/pericope, chapter, and cross-reference structures—not arbitrary token windows alone.

TRUST METADATA

Each document must identify whether it is:

- canonical Scripture
- reviewed Teoyube content
- user-authored content
- external untrusted content

REQUIRED WORK

- embeddings interface independent of provider
- vector repository interface
- hybrid retrieval
- query expansion with evaluation
- graph expansion
- citation provenance
- cache keyed by corpus and model versions
- retrieval observability
- privacy isolation for user indexes
- deletion propagation
- retrieval-quality evaluation

ACCEPTANCE CRITERIA

- exact Scripture remains authoritative
- hybrid retrieval outperforms lexical-only baseline on the evaluation set
- user memory never crosses accounts or consent boundaries
- every retrieved source is inspectable
- token use and cost improve or are justified by quality
- existing UI remains unchanged unless owner-approved
- Codex stops
```

---

# Prompt 21 — Phase 12.6-R: Add real testing, observability, security, performance, and product-value measurement

```text
Read `AGENTS.md`.

GOAL

Replace simulated readiness with executable production evidence while preserving the approved user experience.

TEST PYRAMID

Unit:
- domain rules
- TIG ranking and traversal
- reference parsing
- theological boundaries
- consent and memory policies
- model routing

Integration:
- repositories
- API schemas
- tool orchestration
- citation validation
- authorization
- deletion and export

Browser:
- every parity route
- complete daily loop
- Search to Promise Table
- Prayer and Calling flows
- Reflection to testimony candidate to Book
- memory inspection and deletion
- offline/error recovery where implemented

AI evaluations:
- source fidelity
- humility
- uncertainty
- harmful certainty
- sensitive topics
- injection resistance
- retrieval relevance
- fallback behavior

SECURITY

- strict request schemas
- size limits
- authentication and authorization
- row-level isolation
- rate limits
- secret scanning
- dependency scanning
- secure headers
- audit events
- redacted logs
- prompt-injection defenses
- signed/reproducible builds where practical

OBSERVABILITY

Track structured metadata, not raw private content:

- latency
- errors
- retrieval results and source IDs
- fallback rates
- citation validation failures
- safety interventions
- model tier and cost
- journey-stage completion
- undo/reject rates
- memory consent and deletion operations

PERFORMANCE

- route and bundle budgets
- image and media budgets
- no TIG seed bundle in client
- request deduplication
- stable-data caching
- lazy loading for heavy graphs and media
- streaming for live AI
- render profiling and scoped state selectors

PRODUCT-VALUE METRICS

Measure:

- user clarity
- voluntary faithful-action selection
- reflection continuity
- source inspection
- recommendation rejection/undo success
- trust and safety feedback
- cross-module continuity

Do not optimize for raw engagement time or a spiritual score.

ACCEPTANCE CRITERIA

- CI runs real executable gates
- visual parity remains a blocking test
- security and privacy tests pass
- performance budgets are recorded and enforced
- private content is absent from telemetry by default
- product dashboards use value and trust metrics
- Codex stops
```

---

# Prompt 22 — Phase 12.7-R1: Cut over to one Next runtime only after full owner-approved parity

```text
Read `AGENTS.md`, the parity matrix, and every owner decision.

HARD ENTRY GATE

Do not execute unless:

- every retained route passes screenshot parity at every required viewport
- DOM/class/asset parity passes
- functional parity passes
- accessibility and performance gates pass
- media and protected-path gates pass
- complete daily journey tests pass
- security, memory, Scripture, TIG, Teo Guide, and AI gates pass
- the owner has explicitly approved runtime cutover

GOAL

Make Next the canonical public runtime while preserving the original static runtime as a read-only rollback for a defined stabilization window.

REQUIRED WORK

1. Record the owner approval ID.
2. Create a release tag before cutover.
3. Change runtime commands and deployment routing only.
4. Do not alter visual sources during cutover.
5. Verify every route and deep link.
6. Preserve existing public asset URLs.
7. Preserve approved media Range, MIME, cache, and access behavior.
8. Keep the static runtime available as an explicit rollback artifact.
9. Monitor errors, performance, safety, and parity after deployment.
10. Document one-command rollback.

ACCEPTANCE CRITERIA

- normal users encounter one application and one navigation model
- it looks and behaves like the approved Teoyube interface
- all routes and assets work
- no protected visual file changed during cutover
- rollback is tested
- owner confirms the production result
- Codex stops
```

---

# Prompt 23 — Phase 12.7-R2: Archive historical scaffolding only after dependency proof and owner approval

```text
Read `AGENTS.md`. Runtime cutover and stabilization must be complete.

GOAL

Reduce technical debt without deleting product history or visual assets prematurely.

REQUIRED WORK

1. Classify every candidate as:
   - production
   - test
   - build/tooling
   - documentation
   - generated
   - archive
   - unknown
2. Resolve every unknown.
3. Prove no production import reaches each archive candidate.
4. Prefer archive before deletion.
5. Create a path-by-path archive plan.
6. Request owner approval for:
   - every deletion
   - every stylesheet move or consolidation
   - every image or icon move
   - every page-layout removal
   - every baseline retirement
7. Do not archive the original static rollback until the owner-defined retention period ends.
8. Do not remove owner reference screenshots.
9. Do not remove theology or product source documents.
10. Keep historical phase reports out of active developer navigation without destroying them.
11. Measure repository, build, bundle, and maintenance improvement.

CANDIDATES AFTER PROOF

- unused compatibility adapters
- duplicate component wrappers
- dead phase exports
- obsolete launch simulations
- temporary probes
- stale generated evidence
- historical phase examples not used by tests or production

PROHIBITED

- no mass deletion
- no deletion based only on filename
- no CSS consolidation without owner approval
- no asset relocation without owner approval
- no removal of the visual source baseline

ACCEPTANCE CRITERIA

- each archived/deleted path has evidence and approval
- production imports do not reach archive
- all parity and functional tests remain green
- rollback remains possible
- Codex stops
```

---

# Prompt 24 — Phase 12.8-R: Produce the evidence-based 9/10 Product Scorecard and next roadmap

```text
Read all implementation evidence. Do not award a score from task completion alone.

GOAL

Assess whether Teoyube has reached at least 9/10 in:

- Product Vision
- UX
- Architecture
- AI
- Maintainability
- Scalability
- Performance
- Security
- Spiritual Experience
- Developer Experience

EVIDENCE REQUIRED

Product Vision:
- coherent journey and validated user value

UX:
- owner-approved visual preservation
- user research
- accessibility
- journey clarity
- discoverability and error recovery

Architecture:
- one canonical runtime
- stable feature and domain boundaries
- no phase-oriented production coupling

AI:
- exact citations
- structured tools
- live model gateway
- safety and evaluation thresholds
- deterministic fallback

Maintainability:
- dependency rules
- manageable file ownership
- test coverage
- current documentation

Scalability:
- durable repositories
- tenant isolation
- retrieval and memory scalability

Performance:
- measured budgets and production telemetry

Security:
- threat model
- authorization tests
- secret and dependency scans
- privacy controls

Spiritual Experience:
- Scripture-first clarity
- humble discernment
- reflection continuity
- testimony ownership
- pastor/community/professional boundaries

Developer Experience:
- clean setup
- reliable CI
- feature templates
- short feedback loops

SCORING RULE

A score of 9 or 10 requires evidence. If evidence is missing, score lower and state the exact gap. Do not change the frontend merely to improve an abstract score.

DELIVERABLES

- `docs/product/product-scorecard.md`
- six-month prioritized roadmap
- remaining risk register
- user-research plan
- AI evaluation summary
- security summary
- visual-parity summary
- cost and performance summary

SUCCESS DEFINITION

Teoyube's defensible value must be demonstrably built from:

- Scripture-grounded retrieval
- structured spiritual journeys
- explainable recommendations
- humble AI language
- user-owned memory
- cross-module continuity
- discernment rather than certainty
- long-term reflection and testimony

Codex must stop after reporting scores and evidence gaps.
```

---

# Optional Program Controller Prompt

Use only after the owner has reviewed this pack and wants Codex to determine the next locked phase. This controller must never execute more than one prompt.

```text
Read `AGENTS.md` and `Teoyube_Codex_Execution_Prompts.md`.

1. Determine the first numbered prompt whose acceptance criteria are not fully satisfied.
2. Verify every entry gate for that prompt.
3. Run `npm run recovery:visual:verify` before any change.
4. If a gate is missing, produce a blocker report and stop.
5. If the next task could change a protected visual element, prepare an owner visual-change request and stop.
6. Otherwise execute only that one prompt.
7. Run all required tests and visual guards.
8. Commit only that phase.
9. Report the standard evidence template.
10. Stop. Do not begin the next prompt.
```

---

# Recommended immediate execution order

1. Prompt 0 — verify recovery and visual lock
2. Prompt 1 — TIG calling-seed repair
3. Prompt 2 — selectively restore nonvisual build foundation
4. Prompt 3 — activate the blocking parity harness against the immutable visual/DOM baselines
5. Prompt 4 — establish capability boundaries without output change
6. Prompts 5–12 — exact Next preview parity, one surface at a time
7. Prompt 13 — guided daily loop through existing UI
8. Prompt 14 — stable TIG service
9. Prompt 15 — exact Scripture retrieval
10. Prompt 16 — consent-aware continuity
11. Prompt 17 — safety and evaluation gates
12. Prompt 18 — structured Teo Guide orchestration
13. Prompt 19 — live AI
14. Prompt 20 — RAG and embeddings
15. Prompt 21 — production evidence and value metrics
16. Prompt 22 — owner-approved runtime cutover
17. Prompt 23 — controlled archive/deletion
18. Prompt 24 — evidence-based 9/10 assessment

---

# Final target state

Teoyube is complete only when it provides one trusted spiritual formation system while still looking and feeling like the Teoyube the owner built:

```text
Today
→ exact Scripture
→ responsibly classified promise
→ Scripture-based prayer
→ humble calling discernment
→ one voluntary faithful action
→ reflection
→ user-declared testimony
→ curated Book of the Saint
→ tomorrow's continuity
```

TIG explains how recommendations were formed. Scripture remains authoritative. Teo Guide uses live AI as a humble language and dialogue layer over structured tools, not as a divine voice. Memory belongs to the user. Every durable action is explicit and reversible. Every source can be inspected. Every page preserves its established visual identity unless the owner explicitly chooses otherwise.
