# Teoyube Visual and Behavioral Source of Truth

## Protected experience

The approved Teoyube product is not a generic dashboard. Its identity includes the exact combination of:

- Ephesians 1:18 brand lockup and sidebar composition
- existing primary navigation labels and order
- Saint profile card
- top action bar
- page-specific hero artwork and background images
- promise carousels, story carousels, tables, cards, rails, badges, and icon treatments
- existing typography, spacing, radius, shadows, gradients, and responsive rules
- existing transitions, animations, hover/focus behavior, and page state changes
- page-specific composition rather than one generic template

The static runtime at the baseline tag is the behavioral reference. The images under `Asset/` are owner design references. Neither may be replaced by a simplified approximation.

## Visual precedence

When a runtime screenshot and an owner reference image differ because implementation is incomplete, do not guess. Record the difference and ask the owner which state is authoritative for that element.

When a Next preview differs from the static runtime, the static runtime controls unless the owner has approved a scoped improvement.

## Migration pattern

Use a strangler pattern:

```text
existing approved markup and CSS
        ↓
typed view model and event adapter
        ↓
feature application service
        ↓
domain service / TIG / Scripture / memory
        ↓
repository or external provider
```

The initial React component for a migrated page should reproduce the existing markup, IDs, classes, asset URLs, and interaction structure. Refactor implementation internals only after parity tests are green.

## Required parity evidence

For every retained view and every required viewport:

- owner reference image association
- static-runtime screenshot baseline
- Next-preview screenshot
- visual diff artifact
- ordered DOM signature
- ID and class inventory
- asset URL inventory
- computed geometry for major regions
- keyboard and focus flow
- interaction test results
- owner decision

Do not update a baseline to make a regression disappear.
