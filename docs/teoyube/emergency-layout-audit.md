# Emergency Layout Audit

## Scope

The static app shell and all normal destinations were inspected at source level before repair. Browser verification is recorded separately in `emergency-browser-qa-results.md`.

## Findings

| Area | Finding | Recovery action |
| --- | --- | --- |
| App shell | Legacy rules repeatedly redefine the desktop grid and page widths. | Added canonical `.app-shell`, `.app-sidebar`, `.app-main`, and `.app-header` ownership. |
| Page containment | Pages used different top wrappers and some wide media/roadmap content could escape the main column. | Added `.page-container` to every view and scoped page containment files. |
| Right rail | The insight rail is fixed and could cover wide page content. | Desktop main content now reserves rail space when the rail is open; mobile retains the compact control. |
| Sidebar | Sticky desktop rules and fixed mobile rules competed at multiple breakpoints. | Centralized width and layer tokens; responsive ownership now changes to a drawer at 768px. |
| Embedded media | The technical runtime library dynamically created a second page shell and large fixed surfaces. | Removed it from normal runtime and restored the contained Embedded Videos grid. |
| Tables | Wide tables could force the whole page to overflow. | Table wrappers own horizontal scrolling; page shells remain fixed to the viewport. |
| Cards and grids | Many page-specific grids had no common min-width protection. | Applied `min-width: 0`, media containment, and page-scoped max-width rules. |
| Modals and drawers | Very large numeric layer values obscured ownership. | Replaced high values with named modal, drawer, toast, command, and QA layers. |
| Mobile | Desktop padding and fixed surfaces leaked into mobile widths. | Added one 1024px tablet boundary, one 768px drawer boundary, and one 430px compact boundary. |
| Hidden overflow | Body-level overflow masking made the source of wide children difficult to find. | Kept viewport protection but added local scrolling to tables and explicit media-card containment. |

## Standard Shell

Normal pages now share:

- `.app-shell`
- `.app-sidebar`
- `.app-main`
- `.app-header`
- `.page-container`
- optional `.page-grid`
- `.right-insight-rail` / the existing `.phase113-insight-rail`
- `.modal-layer`
- `.drawer-layer`

The visual design of individual pages was not rewritten. This step restores predictable ownership, width, spacing, and layering around the existing content.

## Remaining Layout Debt

- The legacy stylesheet still contains many historical page overrides.
- The Roadmap and Teoyube Tables sections remain in source for QA compatibility but are not normal-user destinations.
- The right insight rail remains a fixed progressive enhancement; a future non-emergency refactor may place it directly in the grid.
- Decorative legacy components still use local low z-index values for artwork stacking. These are intentionally below global UI layers.
