# Calling Compass CSS-only visual upgrade verification

- Final status: **PASS**
- Approval decision recorded: **APPROVED**
- Approval ID: `TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-001`
- Approved by: Prince Okiemute Inoba — Teoyube Project Owner
- Approved at: `2026-07-27T13:19:16-04:00`
- Branch: `recovery/visual-source-of-truth`
- Starting HEAD: `524632cb509ea6d0bc5cd864d274ec6a1586e2c7`
- Final HEAD: the focused evidence commit containing this report; resolve with `git rev-parse HEAD`
- Focused commits: `4a4c3b1 docs(approval): authorize Calling Compass CSS upgrade`; `31157a5 style(calling-compass): implement owner-approved page architecture`; final evidence/fingerprint commit containing this report.

## Authorized changes

- Calling CSS: `styles/pages/calling-compass.css` only. Size changed from 111 to 12,899 bytes.
- Approval: `docs/owner-approvals/visual/CALLING_COMPASS_VISUAL_CHANGE_REQUEST_2026-07-27.md`.
- Evidence: files in this directory, including before, approved mock, after, responsive, close-up, accessibility, interaction, cross-route, static-runtime, side-by-side, overlay, and difference artifacts.
- Protected fingerprint files: `tests/visual/contracts/protected-visual-source-manifest.json` and `tests/visual/contracts/original-static-visual-contract.json`; only the Calling CSS entry changed.
- Derived runtime identity: `config/runtime/asset-media-compatibility-manifest.json` and `config/runtime/canonical-runtime-manifest.json`; only the protected-manifest SHA, deterministic source digest, and build ID changed.
- No application `.html`, `.jsx`, `.tsx`, `.js`, or `.ts` source changed. No asset or baseline artifact changed.

## Runtime and controls

- Canonical runtime: Next, deterministic fresh production build `teoyube-52b68df9e362a10c6026af65`; health and route checks pass. The repository’s earlier owner-controlled cutover remains intact.
- Retained static rollback: the Calling hash route returned HTTP 200, activated `body[data-view="calling"]`, loaded the approved stylesheet, retained 56 controls, and had zero horizontal overflow. Its separately pre-existing unpublished TeoyubeWorld runtime-manifest 404 is retained honestly in `calling-compass-static-runtime-audit.json`; this CSS-only task did not alter media publication.
- Baseline controls: 56. Final controls: 56 at every viewport. The only hidden mobile control is the unchanged voice-search control.
- Existing behavior preserved: local search, suggestion chips, video navigation, playlist selection, the wired assistant action, cautious three-question compass flow, result generation, explicit reflection action, and mobile navigation passed. The unchanged prominent `Ask the Assistant` button has no controller action in the approved implementation; CSS-only scope did not invent JavaScript behavior.

## Visual and responsive evidence

Tested viewports:

- 1536×1024 owner desktop
- 1440×900 desktop-wide
- 1280×800 desktop-standard
- 1024×768 tablet landscape
- 768×1024 tablet portrait
- 390×844 mobile
- 360×800 mobile-small
- 200% equivalent audit: 768×512 CSS viewport at device scale factor 2 (1536×1024 physical equivalent)

All viewports passed with zero page-level horizontal overflow. The owner desktop and mobile layouts match the approved mock geometry within the recorded 0.06 CSS-pixel audit tolerance, with zero geometry differences and exact control signatures.

The main Calling visualization remains a CSS/HTML radar diagram, not replacement artwork. At 1536×1024 its measured box changed from 285.66×284.80 px (aspect 1.0030) to 314.27×284.80 px (aspect 1.1035). Its overflow remains `visible`, so labels/features are not clipped. The containing Calling panel changed from 312.59×464.45 px in the before audit to 341.20×492.81 px in the approved/final layout. No new scroll container was introduced; existing document scrolling and vertical content flow remain intact.

Measured raster comparison against the approved CSS-injection mock (threshold: channel delta > 8):

- 1536×1024: 93,649 changed pixels; ratio 5.9540%; mean channel delta 4.7863; max channel delta 255.
- 390×844: 11,300 changed pixels; ratio 3.4330%; mean channel delta 4.3782; max channel delta 251.

Geometry and controls are exact. Unmasked side-by-side, 50% overlay, and difference images are retained for inspection; capture-time text antialiasing and transient presentation account for raster differences. No region was masked.

## Accessibility, scope, and quality

- 200% zoom: PASS; zero horizontal overflow.
- Keyboard/focus: PASS; no positive tabindex, duplicate IDs, or unnamed visible controls in the Calling root.
- Focused Axe: PASS; zero violations at every audited viewport and zero serious/critical violations. Axe retained manual-review incomplete items separately.
- CSS lint: PASS; PostCSS parse succeeded; all 104 selectors are qualified beneath `body[data-view="calling"]`. Twelve narrow `!important` declarations are limited to mobile legacy overrides and user-preference overrides.
- Cross-route selector isolation: PASS for Today, TeoyubeSearch, Canon, and Promise Table; no Calling root and no horizontal overflow on those routes.
- Today regression: PASS through route isolation, recovery contracts, build, unit tests, and browser journey tests.
- TeoyubeSearch regression: PASS through route isolation, recovery contracts, build, unit tests, and browser route tests.
- Canon regression: PASS through route isolation, recovery contracts, build, unit tests, and browser route tests.
- Promise Table regression: PASS through route isolation, recovery contracts, build, unit tests, and browser route tests.

## Executable checks

- `npm run recovery:verify`: PASS — 268 protected source files, 210 protected visual files, 72 immutable screenshots, 12 immutable DOM snapshots, support baselines, TIG, Scripture, imports, architecture, safety, and retrieval boundaries.
- `npm run recovery:visual:verify`: PASS.
- `npm run recovery:tig:verify`: PASS.
- `npm run runtime:verify:candidate`: PASS while authorized runtime inputs were uncommitted.
- `npm run app:build`: PASS; Next 16.2.11 production build and client-boundary checks passed.
- `npm run lint`: PASS, zero warnings.
- `npm run typecheck`: PASS.
- `npm run test`: PASS — 38 files passed, 1 skipped; 276 tests passed, 1 skipped.
- `npm run test:e2e`: PASS — 16/16.
- Prayer/Calling/Journey Playwright parity: PASS — 6/6 against fresh isolated Teoyube servers. The wrapper’s first attempt reused unrelated Bookie port 4173 and was rejected; the unchanged project passed on static 4174 and Next 3100.
- Focused browser audit: PASS at all seven viewports; real console/page/request blocking errors: zero.
- Asset/404 audit: canonical Calling stylesheet `/styles/pages/calling-compass.css` returned 200. Next still emits pre-existing duplicate root page-CSS requests while canonical `/styles/pages/*` resources load; these are classified and preserved in the audit rather than concealed. Static rollback’s separate unpublished media-manifest 404 is also retained.

## Fingerprints and rollback

- Calling CSS SHA-256: `8ac6e869e69ddc247880ddb53e2348dee56ca8e130c2b99bb1353de5c43fe3a8` → `ffe598cf6c2b1031f4b49433bdda434781a8568d18f2514c6bd3a2e02a3bcc4b`.
- Protected visual-source manifest SHA-256: `f4dd839d19f5b873b8d441168b07d6b6ae4b6253c5f9f54b9c1e4190b0940257` → `75b0721bd96ce51987e734b5a4f45fdf4a6aca71f6579a04cb3f412f328c9d70`.
- Runtime source digest: `275b22b77cd89f8d579cea31dbfb5c83a98ee511af19fa622a502b819888cb3d` → `52b68df9e362a10c6026af653ecbd6f6a091c7db7c19e984b89c73055e930a7a`.
- Next build ID: `teoyube-275b22b77cd89f8d579cea31` → `teoyube-52b68df9e362a10c6026af65`.
- Temporary review files: all untracked `.tmp/calling-*` scripts and logs created for this task were removed after evidence generation. No temporary script became production or test source.
- Remaining CSS-only differences: none against the approved geometry/control contract. Raster deltas are retained above for owner review.
- Rollback command after the final evidence commit: `git revert <final-evidence-commit> 31157a5 4a4c3b1` (revert newest to oldest; no history rewrite).

## Evidence paths

- Before desktop: `before-1536x1024-viewport.png`; full page: `before-1536x1024-full-page.png`.
- Approved mock: `mock-1536x1024-viewport.png`; full page: `mock-1536x1024-full-page.png`; mobile: `mock-390x844-viewport.png`.
- Final desktop: `after-owner-desktop-1536x1024-viewport.png`; full page: `after-owner-desktop-1536x1024-full-page.png`.
- Responsive captures: `after-desktop-wide-1440x900-viewport.png`, `after-desktop-standard-1280x800-viewport.png`, `after-tablet-landscape-1024x768-viewport.png`, `after-tablet-portrait-768x1024-viewport.png`, `after-mobile-390x844-viewport.png`, `after-mobile-small-360x800-viewport.png`.
- Visualization close-up: `after-closeup-main-visualization.png`.
- Other close-ups: `after-closeup-page-header.png`, `after-closeup-major-panel-grid.png`, `after-closeup-action-controls.png`, `after-closeup-form-toolbar.png`, `after-closeup-lower-panels.png`.
- Side-by-side: `mock-after-side-by-side-1536x1024.png`; mobile: `mock-after-side-by-side-390x844.png`.
- Overlay: `mock-after-overlay-1536x1024.png`; mobile: `mock-after-overlay-390x844.png`.
- Difference: `mock-after-difference-1536x1024.png`; mobile: `mock-after-difference-390x844.png`.