# Prompt 23A-S dependency advisory analysis

## Result

`NO_SAFE_REMEDIATION_AVAILABLE` — remediation option D6 is selected.

The full installed tree has nine high-severity vulnerability records, all rooted in one reviewed advisory: `GHSA-mh99-v99m-4gvg` / `CVE-2026-14257`. The production-only audit has zero findings. This is still a release blocker because the affected dev tooling executes during lint and CI.

The advisory affects `brace-expansion <=5.0.7`; the only patched version currently published and recognized by the advisory is `5.0.8`. The official description states that crafted brace patterns can cause an uncatchable Node.js out-of-memory process crash.

Official sources:

- https://github.com/advisories/GHSA-mh99-v99m-4gvg
- https://github.com/juliangruber/brace-expansion/security/advisories/GHSA-mh99-v99m-4gvg
- https://www.npmjs.com/package/brace-expansion
- https://eslint.org/blog/2026/02/eslint-v10.0.0-released/
- https://eslint.org/docs/latest/use/migrate-to-10.0.0

## Exact installed paths

The safe semver-compatible branch:

- `eslint-config-next@16.2.10`
  → `typescript-eslint@8.64.0`
  → `@typescript-eslint/typescript-estree@8.64.0`
  → `minimatch@10.2.5`
  → `brace-expansion@5.0.7`

`minimatch@10.2.5` accepts `brace-expansion@5.0.8` through its `^5.0.5` range.

The blocked legacy branches:

- `eslint@9.39.5`
  → `@eslint/config-array@0.21.2`
  → `minimatch@3.1.5`
  → `brace-expansion@1.1.16`
- `eslint@9.39.5`
  → `@eslint/eslintrc@3.3.6`
  → `minimatch@3.1.5`
  → `brace-expansion@1.1.16`
- `eslint@9.39.5`
  → `minimatch@3.1.5`
  → `brace-expansion@1.1.16`
- `eslint-config-next@16.2.10`
  → each of `eslint-plugin-import@2.32.0`, `eslint-plugin-jsx-a11y@6.10.2`, and `eslint-plugin-react@7.37.5`
  → `minimatch@3.1.5`
  → `brace-expansion@1.1.16`

`minimatch@3.1.5` requires `brace-expansion ^1.1.7`. The registry has no patched 1.x release; `1.1.16` is the highest published 1.x version. Forcing `5.0.8` violates the parent range and the APIs are incompatible.

## Execution and exploitability

- Production runtime: no current dependency path.
- Build: no direct execution in `next build`.
- Lint: executed.
- Test: not directly executed by the test runner.
- CI: executed through lint and release gates.
- Developer tooling: executed.

The exploit requires attacker-influenced brace or glob patterns to reach `brace-expansion` directly or through `minimatch`. The production runtime is not exposed by this tree. A malicious or compromised repository/configuration input can still terminate local or CI lint processes with an uncatchable out-of-memory error, so the dev-only classification does not make the finding acceptable.

## Why the available options are unsafe or incomplete

1. A semver-compatible update changes only the 5.x copy from `5.0.7` to `5.0.8`. The six 1.x paths remain and `npm audit` still reports nine highs.
2. ESLint `9.39.5` is the latest stable 9.x release. The latest `@eslint/eslintrc@3.3.6` still depends on `minimatch ^3.1.5`.
3. `eslint-config-next@16.2.11` still depends on the current stable import, JSX accessibility, and React plugins, each of which depends on `minimatch ^3.1.2`.
4. A scoped override from `minimatch@3` to `minimatch@10` is not compatible. The 3.x CommonJS export is callable; the 10.x CommonJS export is an object with a named `minimatch` function. The plugins call the package itself as a function.
5. The isolated ESLint 10 / `eslint-config-next@16.2.11` lock candidate reports six highs and invalid peer contracts:
   - `eslint-plugin-import@2.32.0` supports ESLint through 9.
   - `eslint-plugin-jsx-a11y@6.10.2` supports ESLint through 9.
   - `eslint-plugin-react@7.37.5` supports ESLint through 9.7.
6. Removing or replacing the Next lint configuration would drop current rule coverage and is not an equivalent, supported remediation.
7. `npm audit fix --force` is explicitly prohibited and its proposed breaking changes do not clear the whole tree.

## Required regression scope after an upstream-compatible fix

- clean `npm ci`;
- full and production-only audits;
- zero-warning lint;
- typecheck, unit, integration, and application build;
- supply-chain, secret, dependency-boundary, and security gates;
- runtime, recovery, TIG, Scripture, safety, memory, live-AI, and retrieval contracts;
- current Next and static rollback smokes;
- strict Gate C-Preview regeneration.

No dependency, lockfile, runtime, visual source, baseline, or release artifact was changed during this analysis.
