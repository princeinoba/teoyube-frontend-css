# Emergency CSS Reorganization Report

## Baseline

- Legacy `styles.css`: 32,188 physical lines
- Legacy `!important` count: 2,995
- Legacy `z-index` declarations: 203
- Unexplained three- or four-digit z-index values after recovery: 0

## New Ownership Structure

The normal app now loads:

- `styles/legacy.css`
- `styles/tokens.css`
- `styles/reset.css`
- `styles/base.css`
- `styles/layout.css`
- `styles/components.css`
- `styles/pages/index.css` and 11 page files
- `styles/utilities.css`
- `styles/responsive.css`

The owner tool loads only `styles/owner/media-review.css`, which imports its established owner styles. The normal app does not load owner CSS.

The modular layer contains 21 files and 404 physical lines. It adds zero `!important` declarations.

## Layer System

Global layers are tokenized as base, sticky, sidebar, rail, overlay, drawer, modal backdrop, modal, toast, command palette, and QA. All legacy values above 100 were replaced with these tokens. Low values used inside individual cards and artwork remain local stacking contexts.

## Breakpoints

- 1180px: wide content and Embedded Videos grid adjustment
- 1024px: tablet shell spacing
- 768px: mobile navigation drawer and single-column shell
- 720px: Embedded Videos single-column cards
- 430px: compact phone actions and padding
- `prefers-reduced-motion`: animation safety

## Removed Or Quarantined Rules

The normal page no longer loads `teoyubeworld-media.css`; its large runtime-library selectors are quarantined with the inactive runtime page. The new Embedded Videos implementation owns its rules in `styles/pages/embedded-videos.css`.

## Honest Remaining Debt

The legacy 2,995 `!important` declarations are still active through the compatibility bridge. Mass-removing them during low-disk emergency work would create an unacceptable regression risk. The recovery layer establishes where future extraction belongs and adds no new specificity debt. Duplicate-selector reduction and full page-by-page extraction should happen only after the restored UI has a stable visual regression baseline.
