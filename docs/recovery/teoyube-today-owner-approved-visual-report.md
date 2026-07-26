# Teoyube Today owner-approved visual upgrade report

## Authority and scope

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `da894664ad384bc4da1de1af1c843341a842f7c0`
- Approval: `TEOYUBE-VISUAL-2026-07-25-TODAY-001`
- Approval record commit: `9e3ca5519052953a6ae12db7e610a5c801bc2928`
- CSS implementation commit: `4f15902`
- Protected product-source file changed: `styles/pages/today.css`
- Final CSS bytes: `24825`
- Final CSS SHA-256: `04f6038fe74d3b139e292e200a17a360e6310677e4f3e93ba7a4ecbf8081db17`

The owner approval restricts application/runtime product-source changes to CSS
and authorizes Today evidence, verification reports, and the exact Today CSS
fingerprint entries in the two protected-source contracts. No HTML, JSX, TSX,
JavaScript, TypeScript, React component, hook, state, event handler, route, API,
data, copy, image, icon, package, build configuration, or test source changed.

## Result

The Today page has the approved compact, premium Search-aligned presentation
while retaining its original page-specific content and behavior. The work is
route-scoped under `body[data-view="today"]`; no other route stylesheet or
visual source changed.

The TeoyubeWorld Feed remains a visibly bounded, independently vertically
scrollable panel at every required and intermediate width. It retains all
eight rows and controls, supports normal document scrolling outside the feed,
and exposes internal horizontal table scrolling only at the narrow mobile
width where the six-column table cannot fit without clipping content.

## Files changed

Implementation:

- `styles/pages/today.css`
- `tests/visual/contracts/protected-visual-source-manifest.json` — exact Today
  CSS byte count and SHA-256 only
- `tests/visual/contracts/original-static-visual-contract.json` — exact Today
  CSS byte count and SHA-256 only

Approval and evidence:

- `docs/owner-approvals/visual/TODAY_VISUAL_CHANGE_REQUEST_2026-07-25.md`
- `docs/owner-approvals/visual/evidence/TODAY-VISUAL-REQUEST-2026-07-25/*`
- `docs/recovery/teoyube-today-owner-approved-visual-report.md`

Protected visual files changed: `1`, authorized by
`TEOYUBE-VISUAL-2026-07-25-TODAY-001`.

Immutable static baseline screenshots changed: `0`.
Immutable desktop DOM snapshots changed: `0`.
Owner-approved support baselines changed: `0`.

## Responsive and feed evidence

Required viewport results:

| Viewport | Page overflow | Normal document scroll | Feed client/scroll height | Feed bottom reached | Final row visible | Runtime errors |
| --- | --- | --- | --- | --- | --- | --- |
| 1536×1024 | none | yes | 353 / 423 | yes | yes | 0 |
| 1440×900 | none | yes | 331 / 452 | yes | yes | 0 |
| 1280×800 | none | yes | 320 / 571 | yes | yes | 0 |
| 1024×768 | none | yes | 368 / 423 | yes | yes | 0 |
| 768×1024 | none | yes | 352 / 442 | yes | yes | 0 |
| 390×844 | none | yes | 320 / 1118 | yes | yes | 0 |

Nine additional transition widths—1181, 1120, 1000, 980, 920, 901, 900,
820, and 769 pixels—also passed overflow, document-scroll, feed-scroll,
feed-bottom, final-row, console, and page-error checks.

All 94 Today controls remain rendered at each required viewport. The carousel
pagination dots intentionally retain their original compact visual target;
focus-visible treatment and keyboard carousel navigation remain available.

Evidence:

- `responsive-metrics.json`
- `intermediate-width-report.json`
- `side-by-side-1536x1024.png`
- `side-by-side-390x844.png`
- six `after-next-*.png` captures

All evidence is under:
`docs/owner-approvals/visual/evidence/TODAY-VISUAL-REQUEST-2026-07-25/`.

## Functional evidence

Focused browser audit: `19/19 PASS`.

Verified:

- promise carousel next, dot selection, and Arrow-key navigation
- TeoyubeWorld search submission
- safe search suggestion loading, focus return, and clearing
- category filters
- featured-story next and Arrow-key navigation
- feed row selection
- feed final-row reachability
- media source preview
- reflection entry and assignment completion
- Prayer Framework navigation
- mobile menu open and Escape-key close

The complete Prompt 13 browser suite passed `16/16` in `22.9s`, including the
Today-to-Tomorrow guided journey and reversible skip/revisit/undo flow.

The first `npm run test:e2e` invocation did not return from its Windows
lifecycle wrapper and was terminated without test output. The same repository
Playwright configuration was then run directly against a bounded hidden Next
server on port 3100; all 16 tests passed. The exact temporary server PID was
stopped and port 3100 was verified closed.

## Accessibility

An exact starting-commit-versus-candidate axe WCAG A/AA comparison at
1536×1024 and 390×844 reports zero introduced findings.

The final CSS corrects the TeoyubeWorld channel badge contrast that appeared
during implementation. One pre-existing `aria-hidden-focus` finding remains
identical to the starting commit: inactive promise and featured-story carousel
slides contain focusable controls. Correcting that issue requires protected
React markup changes, which are outside this CSS-only approval.

## Executable gates

- `npm run recovery:visual:verify`: PASS
  - 210 protected files
  - 12 owner references
  - 1,015 DOM classes
  - 525 DOM IDs
  - 1,152 CSS classes
  - 34 animation names
  - 72 immutable screenshots
  - 12 immutable DOM snapshots
- `npm run recovery:tig:verify`: PASS
- `npm run recovery:verify`: PASS
- `npm run app:build`: PASS
- `npm run typecheck`: PASS
- `npm run lint`: PASS, zero warnings
- `npm run test`: PASS — 276 passed, 1 skipped
- Playwright browser tests: PASS — 16 passed
- Focused Today interaction audit: PASS — 19 passed
- Required responsive audit: PASS — 6 viewports
- Intermediate responsive audit: PASS — 9 widths
- Accessibility regression comparison: PASS — 0 introduced findings
- Safety, live-AI, Scripture, retrieval, import, architecture, and client-bundle
  boundaries: PASS

## Runtime status and separate evidence blocker

`npm run runtime:status` confirms:

- canonical runtime: Next
- static Node runtime: retained rollback
- deterministic current Next build identity: PASS
- public deployment performed: false
- checked-in live AI, embeddings, vector retrieval, and broad RAG defaults:
  disabled
- Gate C-Preview: `BLOCKED_SECURITY_ADVISORY`
- Gate C-Production: `CLOSED`

`npm run runtime:verify` is separately BLOCKED because the canonical runtime
manifest still records the pre-change protected-source-manifest checksum and
runtime source digest. Updating `config/runtime/canonical-runtime-manifest.json`
is outside this CSS-only owner approval. No runtime manifest or build
configuration was changed to hide that mismatch.

This is release-evidence staleness caused by the authorized CSS fingerprint
change, not a Today functional, build, safety, recovery, or visual-contract
failure. A separately authorized runtime-identity evidence refresh is required
if `runtime:verify` must return green.

## Rollback

Implementation rollback:

```powershell
git revert 4f15902
```

This reverts the Today stylesheet and its two exact fingerprint entries while
preserving the owner decision and evidence history.

## Gate status

- Owner approval required for the Today visual implementation: `NO`
- Owner approval required for a separate runtime-identity evidence refresh:
  `YES`
- Today visual/functional gate: `PASS`
- Overall next gate: `BLOCKED` only by the separately scoped runtime-evidence
  refresh described above
