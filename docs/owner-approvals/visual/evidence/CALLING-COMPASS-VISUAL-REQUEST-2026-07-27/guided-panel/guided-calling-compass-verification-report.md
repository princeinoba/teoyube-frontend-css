# Guided Calling Compass focused visual verification

## Decision and scope

1. **Final status:** PASS.
2. **Approval decision recorded:** APPROVED in `docs/owner-approvals/visual/CALLING_COMPASS_VISUAL_CHANGE_REQUEST_2026-07-27.md`.
3. **Approval ID:** `TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-GUIDED-PANEL-001`.
4. **Approved by:** Prince Okiemute Inoba - Teoyube Project Owner.
5. **Approved at:** `2026-07-27T13:53:17-04:00`.
6. **Parent approval ID:** `TEOYUBE-VISUAL-2026-07-27-CALLING-COMPASS-001`.
7. **Branch:** `recovery/visual-source-of-truth`.
8. **Starting HEAD:** `98b096b2ae46ac21ee00270501f50c691694bf12`.
9. **Final HEAD:** the evidence commit containing this report; its exact hash is reported by `git rev-parse HEAD` in the task closeout because a Git commit cannot contain its own hash.
10. **Commits created:** `8ba7e82659703acfe1c8b2e573a84e1462940b16` (`docs(approval): authorize Guided Calling Compass panel redesign`), `7650aa2f71483ca49b9ff3adc9dc27430c498a21` (`style(calling-compass): match owner-approved guided-flow panel`), and the evidence/fingerprint commit containing this report (`test(recovery): record guided-flow evidence and fingerprints`).

## Changed files and source boundary

11. **Calling Compass CSS:** `styles/pages/calling-compass.css` only; final size 41,891 bytes, SHA-256 `13169753677e4e1a46f2a5321ffa6800792a21027128b6ae411378e0f148d623`.
12. **Governance/evidence:** the existing Calling Compass approval record and the focused `guided-panel/` evidence directory only.
13. **Protected hash/fingerprint:** `tests/visual/contracts/protected-visual-source-manifest.json` and `tests/visual/contracts/original-static-visual-contract.json` only.
14. **Runtime identity:** `config/runtime/asset-media-compatibility-manifest.json` and `config/runtime/canonical-runtime-manifest.json`; only the derived protected-manifest hash, runtime digest, and build ID changed.
15. **Application product source:** no `.html`, `.jsx`, `.tsx`, `.js`, or `.ts` application source changed. No DOM, copy, route, event handler, state, data, package, asset, test source, or build configuration changed.

## Icons, DOM, and controls

16. **Existing DOM icons restored:** 0; the inspected panel contained no reusable icon nodes.
17. **CSS icon definitions added:** 12 narrowly scoped semantic SVG masks, with no external URLs, packages, emoji, Base64 blobs, or new SVG files.
18. **Rendered icon instances:** 12 in the default panel: header compass, Start, three steps, question, three options, Back, Next, Generate Result.
19. **Decorative step numbers:** `::before` markers with only `content: "1"`, `"2"`, and `"3"`; visual-only, non-focusable, pointer-safe, and confined to the three existing steps.
20. **Empty approved icon containers:** 0.
21. **Panel control counts:** 7 before and 7 after in the default state; 11 after the unchanged generated-result actions appear. Element count and child signature remained 20 and `panel-head -> compass-progress -> compass-card`.

## Functional evidence

22. **Start Compass:** PASS; activates Question 1 with step 1 active.
23. **Step navigation:** PASS across burden, gift, and season; stages reached in existing order.
24. **Answer options:** PASS; selected `People needing direction`, `Creative communication`, and `Build with counsel` through the existing handlers.
25. **Back:** PASS; Question 3 returned to Question 2 with two active steps.
26. **Next:** PASS; advanced through all three questions and returned from Question 2 to Question 3 after Back.
27. **Generate Result:** PASS; produced the existing cautious `The Builder` result, Romans 8:28 source, prayer/action content, and four existing result actions.
28. **Validation/disabled state:** PASS; disabled Back remained disabled at step 1 and was correctly absent from the tab order; no state was forced with CSS.
29. **Keyboard:** PASS; unchanged order was Start, three burden answers, Next, Generate Result; Enter/Space semantics remain native button behavior and focus outlines remain visible.
30. **Focused Axe:** PASS with 0 violations in the focused panel audit.

## Responsive and visual evidence

31. **Viewports:** 1536x1024, 1440x900, 1280x800, 1024x768, 768x1024, 390x844, 360x800; drag tests at 1181x820, 899x820, 719x820, and 519x820; focused 2048x512-equivalent comparison.
32. **200% zoom:** PASS via 768x512 CSS viewport at device scale 2; 7 controls reachable, no document overflow.
33. **Clipping:** PASS; no clipped controls at any recorded viewport.
34. **Horizontal overflow:** PASS; measured document overflow was 0 at every required, mobile, drag, cross-route, and zoom audit size.
35. **Pointer interception:** PASS; all 12 icon pseudo-elements and decorative markers use `pointer-events: none`; connector/decorations remain behind controls.

## Executable checks

36. **CSS lint/scope:** PASS; CSS parsed, 123 focused rules, 0 invalid selectors, 0 `!important`, and generated content limited to empty strings plus approved numbers 1-3.
37. **Application lint:** PASS with zero warnings.
38. **Typecheck:** PASS.
39. **Unit tests:** PASS; 38 files passed, 1 skipped; 276 tests passed, 1 skipped.
40. **Browser/route tests:** PASS; general E2E 16/16, including the Prompt 13 journey, plus focused Prayer/Calling/Journey parity 6/6 on isolated ports 4184/3184.
41. **Production build:** PASS on Next.js 16.2.11; generated build ID `teoyube-999244fb8dc86d935a0ef41b`.
42. **Visual contract:** PASS; 210 protected visual files, 12 owner references, 1,015 DOM classes, 525 DOM IDs, 1,152 CSS classes, and 34 animations verified.
43. **DOM/class parity:** PASS; 72 immutable runtime screenshots and 12 desktop DOM snapshots remained byte-identical; focused DOM signature, visible labels, accessible names, and control order were unchanged.
44. **TIG contract:** PASS; the narrow `TIG_CALLING_SEEDS` ownership/import boundary remains intact.
45. **Recovery verification:** PASS, including visual, support-route, Next-support, TIG, Scripture, imports, architecture, safety, and retrieval boundaries.
46. **Console/page/request errors:** PASS for the canonical Next responsive and cross-route audits: no console errors, page errors, request failures, or HTTP errors. The static rollback still reports its pre-existing TeoyubeWorld polling 404 for `/media/teoyubeworld/pilot-v1/runtime-manifest.json`; it was not introduced or hidden by this CSS task.
47. **Assets/404:** PASS for all focused CSS masks, stylesheet loads, and canonical Next requests; no new asset 404 exists. The known static media-manifest 404 above remains separately documented.
48. **Cross-route regression:** PASS for Today, Search, Canon, and Promise Table; the focused panel selector matched zero elements on each route and overflow remained zero. The rest of Calling Compass retained its existing DOM and behavior.

## Exact derived metadata

49. **Calling CSS fingerprint:** `styles/pages/calling-compass.css` changed from 12,899 bytes / `ffe598cf6c2b1031f4b49433bdda434781a8568d18f2514c6bd3a2e02a3bcc4b` to 41,891 bytes / `13169753677e4e1a46f2a5321ffa6800792a21027128b6ae411378e0f148d623`. The visual contract additionally records only the CSS-derived values `d9ad3c`, `e9f6f1`, `f3c64f`, `f4c84d`, `phase116bCallingCompassTool`, and `(min-width: 521px)`.
50. **Runtime identity:** runtime source digest changed from `52b68df9e362a10c6026af653ecbd6f6a091c7db7c19e984b89c73055e930a7a` / `teoyube-52b68df9e362a10c6026af65` to `999244fb8dc86d935a0ef41b797a6dfdbcc3f7863261ff2646a85fc2155ca571` / `teoyube-999244fb8dc86d935a0ef41b`. The protected-manifest SHA changed from `75b0721bd96ce51987e734b5a4f45fdf4a6aca71f6579a04cb3f412f328c9d70` to `31f06c98baa340d09385da30b3f7314b4b3a4ebb18dfc5d30ed755749f00828c`. Independent runtime computation matched 1,903 files and 206,402,595 bytes; all values derive solely from the approved CSS and exact fingerprint update.

## Evidence paths

51. **Before:** `guided-calling-compass-before-panel-2048-equivalent.png`.
52. **Owner reference:** `guided-calling-compass-owner-reference-2048x512.png`; source and evidence SHA-256 both `608e5092cb5910360de52945ab9508d40c244e837c67e829a16e6e8ea9d0ec`, proving the reference copy is unchanged.
53. **Final focused panel:** `guided-calling-compass-final-panel-2048x512-equivalent.png`; live crop 1466x366 and normalized comparison 2048x512 in `guided-calling-compass-final-normalized-2048x512.png`.
54. **Full page:** `guided-calling-compass-final-full-page-1536x1024.png`.
55. **Responsive:** `guided-calling-compass-final-desktop-owner-1536x1024-viewport.png`, `guided-calling-compass-final-desktop-wide-1440x900-viewport.png`, `guided-calling-compass-final-desktop-standard-1280x800-viewport.png`, `guided-calling-compass-final-tablet-landscape-1024x768-viewport.png`, `guided-calling-compass-final-tablet-portrait-768x1024-viewport.png`, `guided-calling-compass-final-mobile-390x844-{viewport,panel}.png`, `guided-calling-compass-final-mobile-small-360x800-{viewport,panel}.png`, the four `guided-calling-compass-final-drag-*` captures, and `guided-calling-compass-final-200-percent-equivalent-1536x1024.png`.
56. **Icon close-ups:** `guided-calling-compass-closeup-header-and-start.png`, `guided-calling-compass-closeup-step-controls.png`, `guided-calling-compass-closeup-question-emblem.png`, `guided-calling-compass-closeup-answer-options.png`, and `guided-calling-compass-closeup-bottom-actions.png`.
57. **Side-by-side:** `guided-calling-compass-owner-final-side-by-side.png`; before/final comparison in `guided-calling-compass-before-final-side-by-side.png`.
58. **Difference/overlay:** `guided-calling-compass-owner-final-difference.png` and `guided-calling-compass-owner-final-overlay.png`.
59. **Measured visual difference:** unmasked absolute RGB comparison after normalizing the live crop to 2048x512 measured 275,395 changed pixels of 1,048,576 at channel delta >8: ratio `0.2626371383666992` (26.2637%), mean channel delta `15.571845372517904`, maximum 255. No region was masked.
60. **Remaining CSS-only differences:** small live-browser font rasterization, line-height, antialiasing, and spacing differences remain versus the raster reference. Exact existing DOM text, controls, state behavior, and accessible names were preserved as required; no prohibited markup or behavior change was used to chase raster noise.
61. **Temporary files:** all task-created `.tmp/guided-*` files and the focused temporary directory were removed after evidence preservation. Playwright artifacts are ignored/disposable and no temporary script became production source.
62. **Worktree:** expected to be clean after the evidence commit; the closeout verifies with `git status --short` after committing.
63. **Rollback:** revert the three task commits newest to oldest: `git revert <evidence-commit> 7650aa2f71483ca49b9ff3adc9dc27430c498a21 8ba7e82659703acfe1c8b2e573a84e1462940b16`.

## Notes

The first focused parity attempt reused port 4173, which was occupied by an unrelated Bookie dev server and therefore lacked Teoyube's `window.setView`. That service was not stopped or modified. The suite was rerun against isolated Teoyube servers on 4184/3184 and passed 6/6. Static rollback was also verified independently on port 4175; it loaded the final 41,891-byte stylesheet, retained 7 controls and 20 elements, started Question 1 correctly, and had zero overflow.
