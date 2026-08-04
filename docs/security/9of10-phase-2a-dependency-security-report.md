# Teoyube 9/10 Phase 2A dependency-security report

Executed: 2026-08-04T16:32:41.9187522-04:00
Branch: `recovery/visual-source-of-truth`
Starting commit: `a7cc36897f32d9eeee8bbadef15bd47c58689161`
Remediation commit: `2981adee6763c112ca677f2f0e11dd5f260722e5`
Runtime-binding commit: `7d4906876412304556eab126ca020beaa8cb8c17`
Pre-phase tag: `teoyube-9of10-phase2a-start-a7cc368`

## Outcome

The dependency remediation is supported and complete, but Phase 2A is **BLOCKED** rather than PASS because the required current visual/performance run exposed pre-existing, out-of-scope gate failures. The security result is PASS: both the full and production dependency trees now contain zero vulnerabilities at every severity, without `npm audit fix --force`, an incompatible override, a waiver, or weakened lint/security thresholds.

Phase 2B remains locked. Phase 3A remains the recommended independent READY phase. Gate C-Preview remains blocked pending current release evidence and the independently scoped visual/performance findings below.

## Before remediation

The refreshed full audit reported four vulnerable package instances: one high and three moderate. The production-only audit reported no critical/high finding and two moderate vulnerable package instances (`next` and `postcss`).

| Advisory | Severity | Affected installed versions | Complete dependency paths | Official patched versions |
| --- | --- | --- | --- | --- |
| `GHSA-mh99-v99m-4gvg` / `CVE-2026-14257` | High | `brace-expansion@1.1.16`, `brace-expansion@5.0.7` | root -> `eslint-config-next@16.2.10` -> `eslint-plugin-import@2.32.0` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16`; root -> `eslint-config-next@16.2.10` -> `eslint-plugin-jsx-a11y@6.10.2` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16`; root -> `eslint-config-next@16.2.10` -> `eslint-plugin-react@7.37.5` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16`; root -> `eslint-config-next@16.2.10` -> `typescript-eslint@8.64.0` -> `@typescript-eslint/typescript-estree@8.64.0` -> `minimatch@10.2.5` -> `brace-expansion@5.0.7`; root -> `eslint@9.39.5` -> `@eslint/config-array@0.21.2` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16`; root -> `eslint@9.39.5` -> `@eslint/eslintrc@3.3.6` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16`; root -> `eslint@9.39.5` -> `minimatch@3.1.5` -> `brace-expansion@1.1.16` | Superseded by the stricter second advisory below |
| `GHSA-rgw5-rvv9-x895` / `CVE-2026-69152` | High | same paths | same paths | `1.1.18`, `2.1.4`, `3.0.6`, or `5.0.9`, by major line |
| `GHSA-fxqj-rqcc-2cmp` | Moderate | `postcss@8.5.19` | root -> `next@16.2.11` -> `postcss@8.5.19`; root -> `vitest@4.1.10` -> `vite@8.1.5` -> `postcss@8.5.19` | `8.5.23` |

Official evidence used:

- `https://github.com/advisories/GHSA-mh99-v99m-4gvg`.
- `https://github.com/advisories/GHSA-rgw5-rvv9-x895`; this is the controlling brace-expansion range because it also affects the first advisory's initial fixes.
- `https://github.com/advisories/GHSA-fxqj-rqcc-2cmp`.
- `https://github.com/vercel/next.js/blob/v16.3.0/packages/next/package.json` and npm registry package/peer metadata queried with the authoritative npm CLI.

Key executed commands were `npm audit --json`, `npm audit --omit=dev --json`, `npm ls --all`, targeted `npm view <package> versions dependencies peerDependencies engines --json`, `npm ci`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run app:build`, the full serial Playwright suite, `npm run release:security:gate`, `npm run release:supply-chain:verify`, `npm run runtime:dual:verify`, `npm run runtime:verify`, `npm run recovery:verify`, `npm run visual:parity:gate:resumable`, and `npm run release:performance:verify`. Every npm command used `C:\Users\royce\AppData\Roaming\npm\npm.cmd` version 10.2.4.

## Compatibility decision and exact remediation

- `next` and `eslint-config-next`: `16.2.10/16.2.11` -> `16.3.0`.
- `brace-expansion`: `1.1.16` -> `1.1.18` and `5.0.7` -> `5.0.9`, through compatible parent semver ranges; no direct override was added.
- `postcss` override: `8.5.19` -> `8.5.23`.
- Transitive `nanoid`: `3.3.16` -> `3.3.17` through the resolved PostCSS tree.
- ESLint remains `9.39.5`. The installed `eslint-plugin-import@2.32.0`, `eslint-plugin-jsx-a11y@6.10.2`, and `eslint-plugin-react@7.37.5` peer ranges support ESLint 9 but do not jointly support ESLint 10. A controlled ESLint major migration was therefore rejected as unnecessary and unsupported for this phase.
- `typescript-eslint@8.64.0`, Vitest `4.1.10`, and Vite `8.1.5` remain unchanged.

The runtime verifier now distinguishes the immutable Prompt 22 historical lock hash from the current canonical runtime manifest's `packageLockSha256`. Historical Prompt 22 and Prompt 24 evidence was not rewritten.

## After remediation

Resolved dependency paths now use `brace-expansion@1.1.18`, `brace-expansion@5.0.9`, and `postcss@8.5.23`. The authoritative lock hash is `ae274247a9e4e65d1f28466eada2f7b0d39d9118f35d204ab5717d8850885b83`; the bound runtime-manifest hash is `cab52474045f4d2758ef697cfe091c5296b681d0006083640f2bbd6c71296d56`.

| Check | Result |
| --- | --- |
| Clean `npm ci` | PASS; 408 packages added, 409 audited, zero vulnerabilities |
| Full `npm audit` | PASS; critical/high/moderate/low = 0/0/0/0 |
| Production-only audit | PASS; critical/high/moderate/low = 0/0/0/0 |
| Lint | PASS |
| Typecheck | PASS |
| Unit/integration | PASS; 294 passed, 1 intentionally skipped; one transient 5-second retrieval-inventory timeout passed 2/2 focused and passed in the unchanged full rerun |
| Build | PASS; Next.js 16.3.0, 58 static pages, all bundle-boundary checks PASS |
| Browser | PASS; serial full suite 54 passed, 3 intentionally skipped; focused reruns cleared parallel-only timeouts |
| Security | PASS; 18 controls, critical/high 0 |
| Supply chain | PASS; 490 components, unexpected lifecycle scripts 0, direct license debt 0 |
| Dual runtime | PASS; 83 checks, Next -> static -> Next, listeners closed |
| Runtime contract | PASS; Next canonical, static rollback retained |
| Recovery contract | PASS; protected source, 72 immutable screenshots, 12 desktop DOM snapshots, owner baselines, TIG, Scripture, imports, architecture, safety, and retrieval |
| Paid provider/embedding calls | 0 |
| Workspace | 36,779 files; 3,460,052,710 logical bytes; +86,664,509 bytes from the Phase 1 starting measurement; no cleanup performed |

## Required visual/performance gate result

`npm run visual:parity:gate:resumable` executed all 72 route/viewport cells but failed:

- Canon at all six viewports has an accessibility/focus-order mismatch. Static and Next report the same existing `aria-hidden-focusable` issue; Next additionally exposes 11 pre-existing Canon video-stage controls. Those Canon files are absent from the Phase 2A diff.
- Calling/tablet-portrait recorded one local-ready measurement of 6,448.7 ms against the 5,000-ms budget.
- `npm run release:performance:verify` is BLOCKED because approved CSS is 1,414,956 bytes against the historical 948,538-byte budget and no current 216-cell passing set exists.

These findings are not excused or masked. Phase 2A changed only `package.json`, `package-lock.json`, `scripts/runtime/verify-runtime-contract.cjs`, and `config/runtime/canonical-runtime-manifest.json`; product source, CSS, DOM/class behavior, assets, protected source, and baselines changed zero. Resolving the Canon parity/accessibility and historical CSS-budget mismatch is outside the dependency-only authorization.

## Final status and next gate

- Phase 2A: **BLOCKED** (security remediation PASS; required visual/performance composite not green).
- Phase 2B: **NOT READY**.
- Recommended independent next READY phase: **3A**.
- Gate C-Preview: **BLOCKED**; security advisory cleared, release evidence remains stale, and the recorded visual/performance blockers remain open.
- Gate C-Production: **CLOSED**.
- Owner approval required for Phase 2A dependency changes: **NO**.
- Owner action required now: select an independently authorized phase, or issue a separately scoped instruction for the pre-existing Canon parity/accessibility and performance-budget reconciliation.
- Rollback: `git revert 7d4906876412304556eab126ca020beaa8cb8c17 2981adee6763c112ca677f2f0e11dd5f260722e5`.
