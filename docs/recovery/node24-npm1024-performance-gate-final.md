# Node 24 + npm 10.2.4 Performance Gate Final

Date: 2026-07-21  
Branch: `recovery/visual-source-of-truth`  
Commit tested: `04865d75aaf3decad370c9a3c56768571fe5efe2`

## Result

**PASS.** Two consecutive complete controlled runs passed the existing 72-cell visual, accessibility, focus, and local-readiness audit. Every static and Next cell was at or below the unchanged `5,000 ms` per-cell threshold. No application, visual, audit, threshold, baseline, or package-lock change was required.

The earlier Next Today/desktop-wide result of `5,473.9 ms` is retained as a non-reproduced local timing transient. The controlled evidence does not establish an application-code regression. Local command-host and browser scheduling contention is the best-supported explanation, but it remains an inference rather than a code-level root cause.

## Toolchain and immutable inputs

- Node: `v24.18.0` at `C:\Program Files\nodejs\node.exe`
- Effective npm: `10.2.4` through `C:\Program Files\nodejs\npm.cmd`
- Package manager policy: `npm@10.2.4`
- npm engine: `>=10.2.4 <11`
- `package-lock.json` SHA-256 before and after `npm ci`: `036E13BE73767BD1FB89D3C7BAD0A6B4FE6A020089DA4E86F305B5643D1D3330`
- Locked runner SHA-256: `DA849AB0442251B49848B54EC15D60D00E8B198904F0223C511DD408FE07C557`
- Locked audit SHA-256: `AC54CA858B36F2E60010BB9D3B7DD8223B8DA397429F20B07E9987D7313E5E88`
- Visual Playwright configuration SHA-256: `B238E1E9AB56EBC2672586891F7C3AA35921934CD5E2C504C7AEC843069A29DA`
- PowerShell execution policy changed: **NO**
- User or machine PATH changed: **NO**
- Threshold changed: **NO**
- Baselines changed: **NO**

## Preserved original failure

The prior failed artifact and Playwright failure evidence were copied before ephemeral cleanup to:

`C:\Users\royce\AppData\Local\TeoyubeToolchainBackups\performance-gate-20260721-141410\original-failure`

Evidence hashes:

- `performance-accessibility.json`: `95D197EF2DB9D41F3BB5C54C0B673A5EC3BDF8E029F45B955845258E48D59A81`
- `error-context.md`: `2A6FD262FF08927A4AA88C238BD991C82D871D9157C77B6721423228899FC712`
- `trace.zip`: `C57EC1EFD44397DF190E6B5B51969795B7A6A7887D5E85DA208DD48ED669D581`

The failed cell was Next Today/desktop-wide at `5,473.9 ms`, `473.9 ms` above the locked threshold after the audit's built-in same-threshold retry. Accessibility and focus parity were true.

## Controlled complete runs

Both runs used the unchanged production build, static port `4183`, Next port `3183`, Windows Chrome, one isolated cold browser context per route and viewport, browser recycling per route, and the audit's existing readiness definition and same-threshold retry.

### Complete run 1

- Result: **PASS**
- Cells: `72/72`
- Violations: `0`
- Artifact SHA-256: `E15071CA213355E681587AB8D18C131D30C909EA38A62C6CAD2186A2FFEA0DC8`
- Maximum ready time: Next Today/desktop-standard, `4,756.5 ms`
- Next Today/desktop-wide ready time: `3,036.3 ms`
- Today/desktop-wide resource bytes: `41,462,820` transferred; `41,446,620` encoded body bytes
- Accessibility/focus parity: **PASS**
- Test servers closed: **YES**
- Evidence: `C:\Users\royce\AppData\Local\TeoyubeToolchainBackups\performance-gate-20260721-141410\controlled-run-1`

### Complete run 2

- Result: **PASS**
- Cells: `72/72`
- Violations: `0`
- Artifact SHA-256: `F498B70A84BD68E194689461EABB9676BBC50C17D8D4FA12B10FCD4C090C47A0`
- Maximum ready time: static Roadmap/tablet-landscape, `3,862.0 ms`
- Next Today/desktop-wide ready time: `2,055.3 ms`
- Today/desktop-wide resource bytes: `41,462,820` transferred; `41,446,620` encoded body bytes
- Accessibility/focus parity: **PASS**
- Test servers closed: **YES**
- Evidence: `C:\Users\royce\AppData\Local\TeoyubeToolchainBackups\performance-gate-20260721-141410\controlled-run-2`

The locked Playwright configuration retains traces on failure. Therefore the preserved original failing run includes a trace; passing controlled runs produced complete per-cell JSON and console evidence without a retained trace. The trace policy was not changed because enabling always-on tracing would alter the performance measurement.

## Uncompleted command-host attempts

Two additional starts were not counted as controlled audit results. In each case, the command host terminated or timed out before the audit produced its final artifact. Both left no performance artifact, no Playwright result, no Git change, and no listening test port. They were retained in the task record and were not treated as application passes or failures. The independently logged second complete run was then allowed to finish without command-host buffering.

## Verification

- `npm ci`: **PASS**, 395 packages, zero audit vulnerabilities
- `npm run app:build`: **PASS**, 59 pages; TIG and Scripture client-bundle contracts passed
- `npm run recovery:verify`: **PASS**
- `npm run typecheck`: **PASS**
- `npm run lint`: **PASS**
- `npm run test`: **PASS**, 17 files and 106 tests
- `npm run lint:memory`: **PASS**
- `npm run memory:security:verify`: **PASS**, 21 boundary files
- `npm run test:e2e`: **PASS**, five health, Scripture, and guided-journey browser tests
- `npm run test:memory:e2e`: **PASS**, three identity, consent, memory, and cross-user browser tests
- Prompt 13 guided journey: **PASS**
- Prompt 14 TIG boundaries: **PASS**
- Prompt 15B WEB Scripture and citation boundary: **PASS**
- Prompt 16 identity/consent/memory boundaries: **PASS**
- Protected visual files changed: `0`
- Immutable baseline changes: `0`
- Owner-approved support baseline changes: `0`
- Scripture content-delta baseline changes: `0`
- Test listeners closed: **YES**

## Decision and rollback

The original timing was transient under the authorized decision policy because two consecutive complete controlled runs passed every per-cell threshold. No performance fix commit is required.

Rollback for this report only:

```powershell
git restore -- docs/recovery/node24-npm1024-performance-gate-final.md
```

The verified npm rollback backup remains at `C:\Users\royce\AppData\Local\TeoyubeToolchainBackups\npm-20260721-125832`.
