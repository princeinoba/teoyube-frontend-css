# Prompt 17P performance stabilization report

Date: 2026-07-22
Decision: **BLOCKED**
Prompt 18: **LOCKED**

```text
BRANCH AND COMMITS
Branch: recovery/visual-source-of-truth
Starting commit: d3976a54687d09943771e618b3ccd6720aa57410
Final commit: the documentation commit containing this report
Worktree: expected clean after the documentation commit; verified in the final handoff

TOOLCHAIN
Node: v24.18.0 / C:\Program Files\nodejs\node.exe
npm: 10.2.4 / C:\Program Files\nodejs\npm.cmd
package-lock changed in this task: NO; SHA-256 remained 4DC14EA3B324D0E5F13AF15CED4D03A46C8230A01B9F1141FA31655CF46252A0 across npm ci
PowerShell policy changed: NO
PATH changed: NO

ORIGINAL BLOCKER
Failed cells: Next Today / desktop-standard; static Today / tablet-landscape; Next Today / tablet-portrait
Original timings: 6,666.2 ms; 5,845.3 ms; 5,250.0 ms
Threshold: unchanged 5,000 ms per runtime/view/viewport cell

DIAGNOSIS
Isolated cell results: 9/9 PASS with fresh production servers, browser, context, and page. Next Today/desktop-standard: 1,610.4, 644.5, 620.5 ms. Static Today/tablet-landscape: 708.7, 952.1, 946.8 ms. Next Today/tablet-portrait: 625.2, 637.2, 602.3 ms.
Order-sensitivity results: canonical 72/72 PASS, maximum 3,549.7 ms (static Roadmap/desktop-wide, position 67); reverse 72/72 PASS, maximum 3,310.6 ms (static Roadmap/desktop-standard, position 5).
Host metrics: isolated preflight CPU 2% twice, 4,308-4,404 MB available physical memory, 292.80 GB free disk, 1 Node process, 34 Chrome processes, 33 Edge processes, Balanced power scheme. Final-run preflight CPU 12% then 8%, 5,483-5,504 MB available memory, 291.77 GB free disk, same power scheme.
Route-bound, runtime-bound, viewport-bound, or cumulative: not route-, runtime-, or viewport-bound. No cell-level cumulative slowdown, request duplication, service worker, API duplication, or owned-process accumulation was found. Prolonged wall-clock suspension occurred between fresh Chrome route lifecycles.
Root cause: host/command/browser scheduling suspension is the best-supported cause; it is an evidence-backed environmental inference, not a confirmed application or canonical-harness defect.
Evidence: Prompt 17 evaluation/fixture modules are absent from Today and built route chunks; ordinary Next Today made 0 API calls and 0 duplicate requests. All isolated cases were below 1,611 ms. Both order matrices passed all 144 cells. The reverse diagnostic incurred an approximately 30-minute inter-route scheduling pause while completed cell timings remained below 3,311 ms and only one owned Chrome existed. Final canonical run 1 later timed out after 45/72 cells, with 0 cell violations and a maximum of 3,281.6 ms.

REMEDIATION
Files changed: documentation only
Runtime changes: NONE
Harness changes: NONE
Visible changes: 0
CSS changes: 0
DOM/class changes: 0
Asset changes: 0
Threshold changes: 0
Baseline changes: 0

FINAL PERFORMANCE GATE
Final run 1 maximum: 3,281.6 ms (static Today/desktop-wide) across 45 completed cells; run did not complete and command host timed out after a prolonged scheduling suspension
Final run 2 maximum: NOT RUN; run 1 broke the required consecutive sequence
Final run 3 maximum: NOT RUN; run 1 broke the required consecutive sequence
216/216 cells <= 5,000 ms: NO; only 45/216 final-sequence cells completed
Visual parity: retained-route 35/35 PASS; final performance run incomplete with 0 violations in 45 checkpointed cells
Accessibility/focus: final performance run incomplete; parity true and 0 violations in 45 checkpointed cells
Functional parity: PASS (35 retained-route, 5 owner-support, 5 fresh-server, and 3 memory browser tests)
Listeners closed: YES; ports 3100, 3116, 3183, 3383, 3483, 4173, 4183, 4383, and 4483 verified closed

SAFETY RECONFIRMATION
Fixture total: 64/64 PASS
Immediate-danger recall: 100%
Divine authority: 0 violations
Coercion: 0 violations
Victim blame: 0 violations
Care replacement: 0 violations
Citation fidelity: 0 fabricated citations; WEB validation 100%
Calling/testimony/fulfillment: 0 / 0 / 0 overreach
Prompt injection: 0 bypasses
Memory/tool authorization: 0 unauthorized reads; 0 unauthorized writes; 0 unauthorized state-changing tool plans
Gate A: PASS
Gate B: CLOSED_LIVE_AI_DISABLED

REGRESSIONS
Recovery: PASS
Prompt 13: PASS (5 fresh-server tests include the complete guided journey and reversible actions)
Prompt 14: PASS (TIG contracts, deterministic consumers, and client bundle boundary)
Prompt 15B: PASS (exact WEB corpus, citation, quotation, and content-delta contracts)
Prompt 16: PASS (memory boundary/lint plus 3 browser tests)
Prompt 17: PASS (64/64 safety evaluation and client/server boundary)
Build: PASS (59 Next pages)
Typecheck: PASS
Lint: PASS
Unit: PASS (18 files / 116 tests)
Browser: PASS outside the incomplete final performance sequence
Security: PASS (npm audit 0; memory and safety boundaries pass)

PROTECTION
Protected visual files changed: 0
Immutable baselines changed: 0
Support baselines changed: 0
Scripture-delta baselines changed: 0
Static runtime: CANONICAL; npm start unchanged
Next runtime: PREVIEW ONLY
Live AI connected: NO

RESULT
Prompt 17P: BLOCKED

Prompt 18 unlocked: NO

Owner approval required: NO; an owner waiver cannot replace the failed three-consecutive-run acceptance criterion
Rollback: git revert <Prompt 17P documentation commit>
```

## Preserved evidence

The prior Prompt 17 output was moved atomically, without deletion or overwrite, to `.tmp/preserved/prompt17-before-17p-d3976a5`. Its blocked checkpoint remains SHA-256 `AF6035EF344BF168579B21C319BECFFED7331D5E3B5A2A9723311383C4856AA4`.

Prompt 17P evidence hashes:

- isolated diagnostics: `5C3D914F0FD5E0022F69FE5759168607D8C0FF3EFE24C8366B67605219CC666D`;
- canonical-order diagnostics: `DE91E5785F0C9E6E8DF0BC4C32791AFED6FA0FE61479EF2DBC2B3EFCE35AC8C6`;
- reverse-order diagnostics: `D9D7240C7051CE05F38E9A0F88C8E95E824753620C944E7BCCCFE9A1BA907C5F`;
- order summary: `48F87AA573EE5F3E878753D5EEAAB4B53745D64BA51CF07D1C89CC4082AB7163`;
- failed final-run checkpoint: `3BFB5C9F523A60ECC3861B231CD3BA9FECB2FB8303E226F54CCE48BCDEB3E710`.

The complete failed final-run output, including retained Playwright traces, is preserved at `.tmp/preserved/prompt17p-final-run1-failed-20260722` (5,937 files; 3,232,744,784 bytes). The checkpoint contains 45 completed cells, zero violations, and maximum readiness of 3,281.6 ms. Runs 2 and 3 were not executed because the owner-authored rule makes any failed final run blocking.

The source reports preserved at task entry had these hashes:

- `docs/recovery/node24-npm1024-performance-gate-final.md`: `3F3D7C82D82529EC0B9CAF4CDA854874C3CA02BB094B3512DBD24C29EAB7505A`;
- `docs/recovery/prompt-17-safety-evaluation-report.md`: `ADE2E3231B48B82633F8643E798D76AFAE02210B8A20EFF31A849A96023E4A95`.

No threshold, timeout, readiness predicate, route, viewport, retry, worker count, screenshot mask, baseline, application source, or visible content was changed.
