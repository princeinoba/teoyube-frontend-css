# Accessibility testing methodology

## Outcome

Phase 5A is a current audit and evidence registration phase. It makes **no WCAG conformance claim** and changes no application markup, styles, ARIA, behavior, dependencies, or visual baselines. Confirmed defects are registered for Phase 5B owner-scoped remediation.

## Scope

- Canonical Next production runtime at starting commit `aa33ed65727222d9dd90cdfb875a242d505f22d1`.
- 23 retained public routes.
- Six protected viewports: 1440×900, 1280×800, 1024×768, 768×1024, 390×844, and 360×800.
- 29 focused interaction states, each exercised at desktop-wide and mobile, producing 58 state cells.
- Search and Promise Search treated as separate products and evidence rows.
- Owner-only, internal-only, and development-only routes excluded from public conformance scope.

## Environment

| Item | Value |
| --- | --- |
| OS | Windows |
| Node | 24.18.0 |
| npm | 10.2.4 from `C:\Users\royce\AppData\Roaming\npm\npm.cmd` |
| Browser | Chrome 150.0.7871.187, headless through Playwright |
| axe-core | 4.12.1 |
| Runtime | Dedicated canonical Next production process on loopback port 3185 |
| Network | External requests blocked; only loopback and data URLs allowed |

## Automated procedure

`node scripts/accessibility/run-phase5a-audit.cjs`:

1. Starts the already-built canonical Next runtime on a dedicated port.
2. Visits every route at every required viewport: 138 default cells.
3. Runs axe tags `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, and `wcag22aa`.
4. Records accessible-name heuristics, hidden focusables, positive tabindex, duplicate IDs, landmarks, headings, live regions, target geometry, and horizontal overflow.
5. Traverses up to 80 keyboard stops in desktop and interactive-state cells.
6. Applies WCAG text-spacing overrides, reduced motion, and forced colors to every route.
7. Tests every route at 320 CSS pixels for reflow and at a 640-CSS-pixel effective 200% layout width.
8. Exercises 29 retained interaction states at desktop-wide and mobile.
9. Blocks external media to keep the audit deterministic and free of paid/external calls.
10. Writes raw working evidence only to `.tmp/accessibility/phase-5a/current-audit.json` and stops its owned server.

The final run produced 311 cells, 81 keyboard-traversal cells, and zero harness errors. The raw evidence SHA-256 is `bab3bd9498f6112e410450316eb09590950f2071995187f7d8f7db2db6228ed7`.

## Human-review boundaries

- Automated contrast results are confirmed only where axe computed a result. Its 3,674 incomplete contrast node occurrences remain manual work.
- The 640-CSS-pixel pass models the reflow width created by 200% zoom; it does not prove browser chrome, magnifier, or assistive-technology behavior.
- The keyboard obscuration heuristic is triage evidence only. Sticky overlays, skip links, scroll changes, and element hit testing require human visual confirmation.
- External YouTube UI, captions, transcripts, audio description, and third-party player keyboard behavior were not loaded and are not claimed.
- Windows Narrator is installed, but this environment cannot reliably capture or assert spoken output. NVDA, JAWS, VoiceOver, TalkBack, switch control, and braille displays were unavailable.
- Touch, stylus, speech input, screen magnification, and physical mobile-device behavior remain in the manual-device backlog.

## Result vocabulary

- `FAIL_CONFIRMED`: repeatable evidence demonstrates a criterion failure.
- `SUPPORTED_BY_AUTOMATION`: the tested automation found no failure, but this is not a conformance claim.
- `PARTIAL_EVIDENCE`: some relevant evidence exists; human or AT validation remains.
- `MANUAL_VALIDATION_REQUIRED`: no reliable automated determination is possible.
- `NOT_APPLICABLE_OBSERVED`: no in-scope content requiring the criterion was observed; later content can change this.

