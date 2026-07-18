# Phase 11.4 Mobile QA Report

## Breakpoints Covered

| Width | Result | Fixes applied |
| --- | --- | --- |
| 360px | Pass for local beta | mobile navigation drawer hidden by default, Menu toggle visible, right rail collapsed, no horizontal overflow |
| 390px | Pass for local beta | drawer opens with Menu, closes with Escape, focus returns to Menu, Promise Table scrolls |
| 430px | Pass for local beta | dialogs/cards keep smaller border radius and fit viewport |
| 768px | Pass for local beta | drawer behavior remains active, topbar/page actions stack, QA panel fits |
| 1024px | Pass for local beta | desktop shell returns, right rail expanded, mobile Menu hidden |
| Desktop | Pass for local beta | right rail, QA helper, command palette, export center remain nonblocking |

## Fixes Made

- Added no-horizontal-overflow guard on `body`.
- Added responsive command palette and export center constraints.
- Added mobile-safe save drawer height and scroll behavior.
- Added horizontal scrolling for the local Promise Table rows.
- Added mobile layout rules for topbar and hero action groups.
- Added real mobile navigation drawer controls with backdrop, Escape close, and focus return.
- Collapsed the right insight rail on mobile while keeping it keyboard-expandable.
- Added reduced motion support across animations/transitions.

## Remaining Limitations

- Some legacy art-heavy pages still depend on large background imagery and should receive future visual compression/performance work.
- The mobile drawer is intentionally simple for the static runtime; full route-aware focus trapping can be revisited after the runtime migration decision.

## Browser Verification

- Browser QA at 390px confirmed drawer hidden by default, opens via Menu, shows backdrop, closes with Escape, and returns focus to Menu.
- Breakpoint sweep at 360, 390, 430, 768, and 1024px confirmed no horizontal body overflow.
