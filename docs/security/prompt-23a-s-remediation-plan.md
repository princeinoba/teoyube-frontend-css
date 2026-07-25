# Prompt 23A-S remediation plan

## Selected plan

`D6_NO_SAFE_REMEDIATION` — make no dependency change, keep Gate C closed, and stop before the Prompt 23A archive inventory.

## Matrix

| Option | Result | Evidence |
|---|---|---|
| D1 patch/minor | Incomplete | Updating the compatible 5.x copy to `5.0.8` leaves all six 1.x paths and nine high findings. |
| D2 direct parent | Unavailable | ESLint `9.39.5` is the latest 9.x; the latest stable Next lint plugins and `@eslint/eslintrc` still require minimatch 3. |
| D3 scoped override | Incompatible | The safe package is outside the legacy parent range and changes the required CommonJS API shape. |
| D4 ESLint 10 | Incompatible and incomplete | The isolated candidate leaves six highs; import, JSX accessibility, and React plugins reject ESLint 10 in their peer ranges. |
| D5 replacement | No equivalent supported replacement | Removing or substituting the Next lint configuration would weaken current checks. |
| D6 no safe remediation | Selected | It is the only option that obeys the owner’s security, compatibility, and no-weakening constraints. |

## Dry-run results

- `npm audit fix --dry-run --json`: proposed 95 additions and 7 removals, but retained nine high vulnerability records.
- Semver-only isolated candidate: changed the `minimatch@10.2.5` branch to `brace-expansion@5.0.8`, but retained nine highs.
- Exact isolated ESLint `10.8.0` plus `eslint-config-next@16.2.11` candidate: retained six highs and marked the current import, JSX accessibility, and React plugins as invalid peers.

## Required upstream condition

Re-evaluate when either:

1. a patched legacy `brace-expansion` release is published and the advisory recognizes it;
2. the stable Next lint plugins replace minimatch 3 with a safe compatible dependency; or
3. a stable Next lint configuration ships an ESLint 10-compatible plugin tree with zero critical/high audit findings.

The owner is not being asked to approve `npm audit fix --force`, a major transitive override, a peer-invalid ESLint 10 tree, or reduced lint coverage.

No package or lockfile change is planned or applied.
