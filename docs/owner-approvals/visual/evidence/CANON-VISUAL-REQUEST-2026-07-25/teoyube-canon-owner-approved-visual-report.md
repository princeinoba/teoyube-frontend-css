# Teoyube Canon owner-approved visual report

## Decision and scope

1. **Final status:** PASS for the owner-authorized Canon CSS-only visual upgrade.
2. **Approval decision recorded:** `Decision: APPROVED`.
3. **Approval ID recorded:** `TEOYUBE-VISUAL-2026-07-25-CANON-001`.
4. **Approved by:** Prince Okiemute Inoba — Teoyube Project Owner.
5. **Approved at:** `2026-07-25T23:43:50-04:00`.
6. **Branch:** `recovery/visual-source-of-truth`.
7. **Starting HEAD:** `49bd91a3f0765719084651590f1fc7c86dd7f0ed`.
8. **Final HEAD:** recorded in the final task handoff because a Git commit cannot contain its own final hash.
9. **Focused commits created:**
   - `46d7dff` — `docs(approval): record owner approval for Canon CSS upgrade`
   - `41fac6f` — `style(canon): implement owner-approved Canon page architecture`
   - Evidence/hash commit — recorded in the final task handoff.

## Files and protection

10. **Exact Canon CSS file changed:** `styles/pages/canon.css`.
11. **Approval, evidence, baseline, and hash files changed:**
    - Approval: `docs/owner-approvals/visual/CANON_VISUAL_CHANGE_REQUEST_2026-07-25.md`
    - Evidence: the Canon-specific files in this directory.
    - Hash entries:
      - `tests/visual/contracts/protected-visual-source-manifest.json`
      - `tests/visual/contracts/original-static-visual-contract.json`
    - Immutable screenshot baselines changed: **0**
    - Owner-approved support baselines changed: **0**
    - Protected visual source files changed: **1**, `styles/pages/canon.css`, under the approval above.
12. **Temporary audit-file status:** all verified untracked Canon audit scripts, candidate captures, and the temporary port `4173` rollback listener were removed after the selected evidence was copied here. No temporary audit file was committed.
13. **Application product-source boundary:** no HTML, JSX, TSX, JavaScript, or TypeScript application product source changed. No asset, package, dependency, build configuration, route, data, test source, or business logic changed.

The final Canon stylesheet is 38,620 bytes with SHA-256:

```text
4ddc79fe23865dc0c5d024774dde57bb63d8e016a308914e137aeaa5c98e6161
```

All 287 parsed CSS rules remain scoped under `body[data-view="canon"]`. The stylesheet contains no unscoped selector and no hash-like color token that can be misclassified as a protected DOM ID.

## Runtime and viewport evidence

14. **Static runtime result:** PASS for structure, controls, geometry, responsive layout, and CSS parity. Across six viewports, static and Next structure/control failures were `0`, maximum geometry difference was `0`, and maximum independently measured raster difference was `0.0024414%`. The rollback runtime retains its pre-existing publication/media-manifest `404` messages; the approved CSS did not create or change them.
15. **Next result:** PASS on the repository's canonical local Next runtime. `/api/health` returned `200`; Canon produced no console, page, hydration, or failed-resource errors after the final production build.
16. **Viewports tested:**
    - Required: `1536×1024`, `1440×900`, `1280×800`, `1024×768`, `768×1024`, `390×844`
    - Intermediate drag widths: `1366×900`, `1152×864`, `1100×800`, `900×900`, `820×900`, `600×900`, `430×844`
    - Page-scale verification: `200%` (`768×512` visual viewport over a `1536×1024` layout viewport)

At every required and intermediate viewport:

- document-level horizontal overflow: `0`
- clipped controls: `0`
- controls below the 24-pixel measured usability floor: `0`
- focus-indicator failures: `0`
- serious or critical Axe findings: `0`
- Canon runtime errors: `0`

## Controls and functional behavior

17. **Controls tested:** all current Canon controls were inventoried and their geometry/focusability inspected. The working-action smoke covered sidebar/mobile navigation, popular-search chips, featured-carousel pointer and keyboard navigation, recommended-carousel navigation, journey selection, Canon tab transitions, `Why this?` disclosure, and mobile Escape dismissal. The repository route suite additionally covered tabs, paging, search flow, and carousels. `11` direct smoke checks passed; `16/16` project E2E tests and all `4` Canon/Promise parity tests passed.
18. **Hero Search baseline comparison:** the control remains present, visible, aligned, keyboard reachable, named `Search`, and unchanged as a `type="button"` control. It still emits no search result notice.
19. **Search defect classification:** **PRE-EXISTING FUNCTIONAL DEFECT — UNCHANGED BY THE APPROVED CSS WORK.** No handler, form logic, route, copy, accessible name, pointer behavior, or application source was changed.

All other applicable working interactions passed. Existing conditionally hidden or inactive-state controls remain governed by the same DOM state and behavior; the approved CSS did not remove or conceal a live control.

## Executable checks

20. **CSS lint:** PASS — PostCSS syntax parse; `0` unscoped selectors; `0` contract-parser hash-color tokens.
21. **Application lint:** PASS — ESLint with `--max-warnings=0`.
22. **Type-check:** PASS — Next route type generation and strict TypeScript check.
23. **Unit tests:** PASS — `38` files passed, `1` skipped; `276` tests passed, `1` skipped.
24. **Route tests:** PASS — `16/16` Playwright E2E tests.
25. **Production build:** PASS — Next `16.2.11`; `58/58` static pages generated; TIG, Scripture, safety, Teo Guide, live-AI, and retrieval bundle/boundary checks passed.
26. **Accessibility:** PASS for the Canon task — 13-width Axe/keyboard/geometry audit found no serious/critical violation, clipped control, sub-24-pixel target, or focus-indicator failure; `200%` page scale had no horizontal overflow. The broader release-evidence command remains identity-bound to the locked pre-Canon 216-cell controller (`ff925572…`), so it reports `BLOCKED` until a separately authorized release-evidence rebind; its existing data still reports `216` cells, `0` parity failures, `0` positive tab indices, and reduced-motion support present. That evidence-lineage condition is not a Canon accessibility regression and was not rewritten in this CSS-only task.
27. **Visual contract:** PASS — `210` protected files, `12` owner references, `1,015` DOM classes, `525` DOM IDs, `1,152` CSS classes, and `34` animation names verified; all `72` immutable screenshots and `12` immutable DOM snapshots verified.
28. **DOM/class/asset parity:** PASS — disabling and re-enabling only the Canon stylesheet kept ordered structure, controls, and assets equal. Structure hash: `fb7f574509d7e18e631e7bb458204ccf4e4cbc9de6e969067c33b650b27d13b0`; control hash: `01f02531cad58921e5570fb8113bce3821e2ca51634da6a39d11512c3bf60edd`; asset hash: `cced39ea1d1d10dfb0669fe1b794093ec1f026c5b2097e55aa046e7a2d3c15b6`.
29. **TIG contract:** PASS — direct seed-owner import boundary remains intact.
30. **Recovery verification:** PASS — full `npm run recovery:verify`, including immutable and owner-approved support baselines.
31. **Cross-route regression:** PASS — Today, Search, Book, and Promise Table retained identical computed geometry/style signatures with and without the Canon stylesheet. Search, Book, and Promise Table were raster byte-identical; Today's computed signature was identical while its screenshot contained known dynamic pixels. Promise Table also passed six-viewport strict raster parity at `0` changed pixels.

The canonical runtime verifier was also run. It correctly reports that the separately governed runtime identity record still points at the pre-Canon protected-manifest hash/source digest. Updating that broader runtime manifest was not authorized by the instruction to update only the exact Canon protection entries, so no runtime/build configuration was altered.

## Visual evidence

32. **Before screenshot paths:**
    - `before-top-1536x1024.png`
    - `before-full-1536x1024.png`
    - `before-full-390x844.png`
33. **Approved reference path:** `owner-proposed-reference.png`
34. **After screenshot paths:**
    - `after-next-1536x1024.png`
    - `after-next-1440x900.png`
    - `after-next-1280x800.png`
    - `after-next-1024x768.png`
    - `after-next-768x1024.png`
    - `after-next-390x844.png`
    - `after-full-1536x1024.png`
    - `after-full-390x844.png`
35. **Side-by-side paths:**
    - `side-by-side-reference-after-1536.png`
    - `side-by-side-before-after-1536x1024.png`
    - `side-by-side-before-after-390x844.png`
36. **Overlay/difference paths:**
    - `overlay-reference-after-1536.png`
    - `difference-before-after-1536x1024.png`
37. **Measured visual differences:**
    - Existing page versus approved final desktop viewport: `65.331268%` changed pixels; mean absolute normalized channel difference `0.312317`. This is the intentional owner-approved transformation.
    - Tall owner concept composite normalized against the final live full page: `53.740678%` changed pixels; mean absolute normalized channel difference `0.245139`. This comparison is descriptive because the reference is not a same-viewport browser capture.
    - Locked repository static/Next parity: maximum changed-pixel ratio `0.471875%`, below the unchanged `0.5%` strict threshold; both mobile viewports were exact.
38. **Remaining CSS-only visual differences:** the approved reference is a tall concept composite rather than a browser viewport, and the live page preserves all existing controls, recommendation panels, full content, and natural scrolling. The implementation follows its shell, hierarchy, density, imagery, workspace/rail, card, and responsive architecture without screenshot reconstruction or removal of live content.
39. **Extra live controls:** confirmed retained, visible in their applicable state, keyboard reachable, unclipped, and not covered by decorative overlays. No existing element, asset, ID, class, or interaction was removed.

## Evidence index

- `responsive-metrics.json`
- `interaction-report.json`
- `accessibility-and-regression-report.json`
- `repository-canon-parity-summary.json`
- `repository-promise-table-regression-summary.json`
- `static-next-comparison.json`
- `visual-comparison.json`
