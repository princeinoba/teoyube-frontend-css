# Teoyube Recovery Agent Rules

These rules apply to every human or automated coding agent working in this repository. They override architectural convenience, cleanup preferences, framework defaults, and aesthetic judgment.

## 1. Owner authority and source of truth

The original uploaded Teoyube interface is the visual and behavioral source of truth.

Authority order:

1. Explicit written owner instruction.
2. The rendered static application at tag `teoyube-original-upload-2026-07-18`.
3. `tests/visual/contracts/protected-visual-source-manifest.json`.
4. `tests/visual/contracts/static-dom-contract.json`.
5. `tests/visual/contracts/original-static-visual-contract.json`.
6. `tests/visual/baselines/static-runtime/manifest.json` and its immutable artifacts.
7. Owner reference images listed in `tests/visual/baselines/owner-reference-manifest.json`.
8. Product and theology documents in `docs/product-source/`.
9. Architecture recommendations and framework conventions.

When these conflict, stop and ask the owner. Do not choose a redesign.

## 2. Absolute no-redesign rule

Architecture must migrate behind the approved interface.

Without a scoped written owner approval, do not alter, delete, rename, consolidate, replace, restyle, simplify, approximate, or regenerate any existing:

- rendered page composition
- DOM hierarchy
- element IDs
- CSS class names or class ordering
- stylesheet order
- CSS rule, token, breakpoint, animation, transition, shadow, radius, spacing, typography, gradient, or responsive behavior
- image, icon, SVG, video poster, animation asset, hero artwork, background image, thumbnail, or asset path
- sidebar, top bar, navigation item, hero panel, card, table, carousel, rail, modal, drawer, panel, badge, button, or page-specific layout
- user-facing interaction, focus behavior, route transition, loading state, empty state, or responsive state

Do not replace the Teoyube frontend with generic cards, generic gradients, a generic dashboard, a generic wizard, or framework-default components.

Do not add Tailwind, Bootstrap, Material UI, Chakra, shadcn, or another styling system to reproduce or supersede the existing design.

Do not use an iframe as a parity shortcut.

Additive `aria-*`, `data-*`, test IDs, and non-rendering wrappers are allowed only when they do not change layout, accessibility semantics adversely, screenshots, computed geometry, or interaction behavior.

## 3. Protected visual files

Run before and after every task:

```bash
npm run recovery:verify
```

For visual-only diagnosis:

```bash
npm run recovery:visual:verify
```

A failure is a hard stop. Never regenerate, weaken, delete, or bypass the manifest to make a task pass.

Protected evidence includes the existing static DOM, CSS, user-facing JavaScript, owner reference assets, public assets, 72 responsive runtime screenshots, and 12 desktop-wide DOM snapshots recorded in:

```text
tests/visual/contracts/protected-visual-source-manifest.json
tests/visual/contracts/original-static-visual-contract.json
tests/visual/baselines/static-runtime/manifest.json
```

New files may be added behind the interface. Existing protected files and baseline artifacts may not change without owner approval. Candidate screenshots must be written to a separate disposable test-results directory.

## 4. Owner approval protocol

A visual change requires a scoped owner-authored approval record under:

```text
docs/owner-approvals/visual/
```

The request must identify exact files, selectors/components, screenshots, rationale, alternatives, risk, and rollback. The agent must stop after preparing the request.

The agent may not:

- write `Decision: APPROVED`
- invent an approval ID
- broaden the approved scope
- treat silence, a prior architecture recommendation, or a green test as approval
- update visual baselines merely because implementation differs

Approval for one selector, asset, or page does not approve another.

## 5. Runtime migration policy

The static runtime remains canonical until every retained page has:

- side-by-side screenshot parity at all required viewports
- DOM/class contract parity
- asset-path parity
- functional parity
- accessibility parity or an owner-approved improvement
- performance evidence
- owner sign-off

Next.js must remain a separate preview runtime until the final cutover gate. Do not change the default `start` command before that gate.

## 6. Feature architecture policy

New production code must be organized by stable business capability, not historical phase name.

Preferred dependency direction:

```text
approved view -> feature controller/view model -> application service -> domain service -> repository/infrastructure
```

Domain code must not import React or Next.js. UI components must not import TIG seed internals, model SDKs, database clients, or secret configuration.

Preserve legacy code behind typed compatibility adapters until parity is proven. Do not delete first and reconstruct later.

## 7. TIG policy

TIG remains the deterministic, explainable intelligence layer.

- Import symbols from their owning modules rather than broad unstable barrels.
- Preserve source paths, confidence, limitations, fallback reasons, and explanation traces.
- Do not move seed datasets into client bundles.
- Do not let an LLM replace deterministic Scripture lookup, graph traversal, consent decisions, safety rules, journey transitions, or citation validation.

Run:

```bash
npm run recovery:tig:verify
```

## 8. Scripture and theology policy

The Bible is the highest authority in Teoyube. Generated content must distinguish Scripture from interpretation, application, prayer, and suggested action.

Teo Guide must never claim:

- that God spoke through the model
- certain divine direction
- a final destiny or calling
- guaranteed promise fulfillment
- that a user must act immediately because the AI said so

Only the user may record a testimony or declare a promise fulfilled. Major decisions must encourage prayer, Scripture, wise counsel, community, and appropriate professional care.

## 9. AI policy

Do not connect live generative AI until exact Scripture retrieval, citation validation, consent-aware memory, safety contracts, sensitive-topic handling, observability, deterministic fallback, and evaluation thresholds are implemented and passing.

All model access must go through one server-only provider-neutral gateway. All durable writes require explicit user confirmation and must be reviewable, auditable, reversible, exportable, and deletable.

## 10. Task discipline

Work one prompt and one vertical slice at a time.

At the end of every task report:

- branch and commit
- files changed
- protected visual files changed: must be `0` unless owner-approved
- `npm run recovery:visual:verify` result
- `npm run recovery:tig:verify` result when TIG is touched
- build, type, lint, unit, browser, accessibility, security, and parity results that apply
- exact remaining gaps
- rollback command
- owner approval required: yes/no
- next gate status

Never claim completion from documentation alone. Executable evidence controls.
