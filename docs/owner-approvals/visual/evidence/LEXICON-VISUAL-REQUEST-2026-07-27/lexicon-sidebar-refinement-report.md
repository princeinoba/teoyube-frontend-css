# Lexicon Menu Toolbar and Sidebar Refinement Report

Owner approval: `TEOYUBE-VISUAL-2026-07-27-LEXICON-001`

## Scope

The owner requested that the Lexicon menu toolbar/sidebar use the same compact
application-shell styling already approved on TeoyubeSearch, Canon, Calling
Compass, Promise Table, and Today.

This refinement is route-scoped to `body[data-view="lexicon"]`. It changes only
`styles/pages/lexicon.css` plus deterministic visual/runtime fingerprints and
this disposable approval evidence. No markup, application JavaScript,
TypeScript, image, SVG, package, data, route, or other route stylesheet changed.

Starting branch: `recovery/visual-source-of-truth`

Starting commit: `1e439f354d8835fb6a0525a182c201a73687874d`

Canonical route: `/lexicon`

Canonical runtime: Next, with the static runtime retained as rollback

## Computed-style comparison

Measurements were captured at `1536 x 1024`.

| Measurement | Lexicon before | Approved shell target | Lexicon after |
| --- | ---: | ---: | ---: |
| Sidebar width | 240 px | 190 px | 190 px |
| Sidebar x-position | 4.8 px | 4 px | 4 px |
| Sidebar padding | 18.4 px | 13.6 px 14.4 px | 13.6 px 14.4 px |
| Navigation-item height | 44.8 px | 34.39 px | 34.39 px |
| Navigation font size | 14.4 px | 11.52 px | 11.52 px |
| Saint-card height | 401.78 px | 242 px | 242 px |
| Main-content x-position | 260 px | 198 px | 198 px |

The after values match the TeoyubeSearch shell target exactly for these
measurements. The active Lexicon state, navigation order, icons, brand lockup,
Saint profile controls, top toolbar actions, page content, and page handlers
remain present.

## Scope and interaction evidence

- CSS diff: 208 additions and 0 removals.
- New CSS rule openers: 39 of 39 are scoped to
  `body[data-view="lexicon"]`.
- New `display: none`, `visibility: hidden`, or `pointer-events: none`
  declarations: 0.
- New asset or generated-content overrides: 0.
- Existing Lexicon controls after the change: 734 total, 732 visible in the
  default desktop state.
- Existing Lexicon word cards after the change: 109.
- Horizontal overflow at 1024, 768, and 390 CSS pixels: none.
- Mobile drawer open state: menu expanded, body state active, backdrop visible,
  sidebar at x=0.
- Mobile drawer close state: menu collapsed, body state removed, backdrop
  hidden, focus returned to the menu control.
- Mobile navigation: selecting TeoyubeSearch reached `/search` and closed the
  drawer.

Evidence:

- `sidebar-before-1536x1024.png`
- `sidebar-after-1536x1024.png`
- `sidebar-after-desktop-1440x900.png`
- `sidebar-after-tablet-1024x768.png`
- `sidebar-after-tablet-768x1024.png`
- `sidebar-after-mobile-390x844.png`
- `sidebar-before-audit.json`
- `sidebar-after-audit.json`
- `sidebar-after-tablet-1024x768-audit.json`
- `sidebar-after-tablet-768x1024-audit.json`
- `sidebar-after-mobile-390x844-audit.json`
- `sidebar-mobile-open-close-audit.json`
- `sidebar-mobile-navigation-audit.json`
- `sidebar-css-scope-audit.json`

## Verification

| Check | Result |
| --- | --- |
| Focused retrieval-inventory regression | PASS - 2 tests |
| Unit tests | PASS - 276 passed, 1 intentional skip |
| Browser tests | PASS - 16 passed |
| Next production build | PASS - 58 pages |
| Typecheck | PASS |
| Lint | PASS |
| Recovery verification | PASS |
| Immutable static screenshots | PASS - 72 verified |
| Immutable desktop DOM snapshots | PASS - 12 verified |
| Owner-approved support baselines | PASS - 60 screenshots and 120 DOM/asset contracts |
| Prompt 12D Next support baselines | PASS - 54 default and 16 interaction captures |
| TIG contract | PASS |
| Scripture contracts | PASS |
| Import and architecture boundaries | PASS |
| Safety orchestration | PASS - Gate A PASS; 64/64 fixtures |
| Candidate runtime contract | PASS - 23 routes, 14 mappings, 31 API contracts |

The first full unit run timed out in one retrieval inventory test while four
task-local Playwright audit roots and their 16 Chromium descendants were still
running. Those orphaned audit processes were identified by exact command line
and stopped without touching the canonical server. The focused regression then
passed in 2.26 seconds, and the complete unit suite passed.

## Result

Protected visual file changed under owner approval:
`styles/pages/lexicon.css`

Immutable static baselines changed: 0

Owner-approved support baselines changed: 0

Functional behavior changed: 0

Owner approval required: NO - the refinement is within
`TEOYUBE-VISUAL-2026-07-27-LEXICON-001`

Rollback after commit:

```powershell
git revert <lexicon-sidebar-refinement-commit>
```

Next gate: PASS
