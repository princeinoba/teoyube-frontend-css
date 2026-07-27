# Promise Table layout organization verification

Approval: `TEOYUBE-VISUAL-2026-07-27-PROMISE-LAYOUT-001`

This report records the CSS-only Promise Table spacing, alignment, and Calling
Compass refinement authorized by the owner. The containing commit is the final
evidence commit; resolve it with `git rev-parse HEAD` after checkout.

## Required result

1. Final status: **PASS**
2. Approval ID recorded: `TEOYUBE-VISUAL-2026-07-27-PROMISE-LAYOUT-001`
3. Branch: `recovery/visual-source-of-truth`
4. Starting HEAD: `35207632ef8531e838fac29aea2815d96a4cf14e`
5. Final HEAD: the commit containing this report
6. Commits created:
   - `477866c` — record the owner approval amendment
   - `b4d17f9` — implement the Promise Table CSS refinement
   - `6f11772` — refresh exact visual and runtime fingerprints
   - final evidence commit containing this report and the task artifacts
7. Exact CSS file changed: `styles/pages/promise-table.css`
8. Governance/evidence files changed:
   - `docs/owner-approvals/visual/PROMISE_TABLE_CSS_UPGRADE_CHANGE_REQUEST_2026-07-26.md`
   - this `layout-organization-2026-07-27/` evidence directory
9. Fingerprint/digest files changed:
   - `tests/visual/contracts/protected-visual-source-manifest.json`
   - `tests/visual/contracts/original-static-visual-contract.json`
   - `config/runtime/asset-media-compatibility-manifest.json`
   - `config/runtime/canonical-runtime-manifest.json`
10. HTML, JSX, TSX, JavaScript, and TypeScript application source changed: **0**
11. Calling Compass media type: existing DOM diagram with inline SVG connector layer
12. Previous diagram dimensions at 1536×1024: `376.00 × 196.80 px`
13. Final diagram dimensions at 1536×1024: `514.94 × 269.52 px`
14. Diagram width: `83.73%` of usable panel width (`79.98%` of total panel width)
15. Diagram aspect ratio: `1.9106` before and after; preserved
16. Diagram centering: `0 px` horizontal center offset
17. Diagram clipping: none; all SVG, core, nodes, labels, and icons are inside the diagram and panel
18. Workspace → Phase final gap: `14 px`
19. Phase → Local final gap: `14 px`
20. Local → Search final gap: `14 px`
21. Search → Suggestions final gap: `9 px`
22. Suggestions → Featured final gap: `14 px`
23. Required viewports tested: 1536×1024, 1440×900, 1280×800, 1024×768, 768×1024, and 390×844; intermediate widths 1181, 1100, 991, 990, 761, 760, 641, 640, 521, 520, 421, and 420 px were also drag-tested
24. 200% zoom: **PASS** at a 768×512 CSS viewport with device scale factor 2; no clipping or document overflow
25. Baseline/final control count: `154 / 154`; hidden controls `0 / 0`
26. Semantic table: **PASS**; headings remain Promise, Scripture, Status, Source, and Actions; the internal horizontal-scroll wrapper remains reachable
27. Search: **PASS** for saved rows, suggestion selection, and Promise search submission
28. Sort: **PASS**
29. Filter/status: **PASS** for all status tabs and reversible row-status transition
30. Notes/actions: **PASS** for Save Note, Generate Prayer, Start Action Step, Save to Book, Detail, Pray, Act, Compare, Remove/Undo, and all eight feedback actions
31. Export/import: **PASS** for Export Table, Export Promise Table JSON, Import / Restore Preview, and Export Safe Table
32. Featured video: **PASS** for dots, next/previous navigation, and media-card selection; the existing Watch Now control remains visible and enabled with its approved behavior unchanged
33. Keyboard: **PASS**; no positive `tabindex`, 59 unique Promise controls visited, 58 visible custom focus indicators plus the embedded iframe
34. Focused Axe: **PASS**, 0 violations, 25 passed rules; two scanner-incomplete groups remain indeterminate because of protected pseudo-element presentation/legacy ARIA markup and are not introduced by this CSS task
35. CSS lint: **PASS** through installed PostCSS and Lightning CSS parsers; the repository has no dedicated Stylelint dependency or script
36. Application lint: **PASS**
37. Typecheck: **PASS**
38. Unit tests: **PASS**, 276 passed and 1 skipped
39. Browser/route tests: **PASS**, 16 passed
40. Production build: **PASS**, Next 16.2.11; deterministic build ID `teoyube-275b22b77cd89f8d579cea31`
41. Visual contract: **PASS**; 210 protected files, 12 owner references, 72 immutable screenshots, and 12 immutable DOM snapshots verified
42. DOM/class parity: **PASS**; 1015 DOM classes, 525 DOM IDs, 1152 CSS classes, and 34 animation names verified
43. TIG contract: **PASS**
44. Recovery verification: **PASS**
45. Console/page/request errors: **0** in native layout, functional, keyboard, responsive, and parity audits. Axe’s injected analysis requests the 12 protected dormant route stylesheet links and records their pre-existing 404 responses; they are absent from native page-load audits and were not caused by this route-scoped CSS change.
46. Asset/404 result: **PASS** for native runtime and browser parity; no new asset 404s
47. Cross-route regression: **PASS**; every selector in `promise-table.css` is scoped to `body[data-view="table"]`, Canon/Promise parity passed across 12 route/viewport captures, and dual-runtime verification passed 83 checks
48. Before screenshot: `before-1536x1024-full-page.png`
49. Final desktop screenshot: `final-1536x1024-full-page.png`
50. Calling Compass close-up: `final-1536x1024-calling-compass-panel.png`
51. Organized core panels: `final-1536x1024-workspace-to-featured.png`
52. Responsive screenshots: `final-{1440x900,1280x800,1024x768,768x1024,390x844}-*.png`, `zoom200-768x512-*.png`, and `focused-core-panels-responsive/`
53. Side-by-side comparison: `comparison-1536x1024-side-by-side.png`
54. Difference image: `comparison-1536x1024-difference.png`; overlay: `comparison-1536x1024-overlay.png`
55. Remaining CSS-only differences: none outside the approved spacing, alignment, shared hero height, and actual diagram-dimension changes. Exact route-scoped `!important` declarations remain only where protected legacy positioning, sizing, margins, or focus rules required an override; each rescue is narrowly scoped and documented in the stylesheet.
56. Temporary files: disposable audit scripts and preview JPEGs removed; no task helper was promoted to production or test source
57. Worktree: clean after the final evidence commit
58. Rollback: `git revert <final-evidence-commit> 6f11772 b4d17f9 477866c`

## Additional executable evidence

- `npm run app:build`: PASS
- `npm run runtime:verify`: PASS
- `npm run runtime:dual:verify`: PASS, 83 checks
- `npm run recovery:verify`: PASS
- `npm run recovery:visual:verify`: PASS
- `npm run recovery:tig:verify`: PASS
- `npm run lint`: PASS
- `npm run typecheck`: PASS
- `npm run test`: PASS
- `npm run test:e2e`: PASS
- `npm run visual:parity:canon-promise`: PASS, 4 tests covering 12 route/viewport comparisons and both feature interaction contracts

The immutable static baselines and owner-approved support baselines were not
changed. The canonical Next runtime remains owner-controlled and the static
runtime remains available through `npm run rollback:start`. Gate C Preview
remains `BLOCKED_SECURITY_ADVISORY` and Gate C Production remains `CLOSED`;
this pre-existing release status is outside the approved CSS-only scope.
