# Prompt 23A-I open development advisory

Status: **OPEN — UNRESOLVED**

This record is not a vulnerability waiver or security exception. The full dependency tree remains blocked by nine high-severity development-tool vulnerability records rooted in `GHSA-mh99-v99m-4gvg` / `CVE-2026-14257`.

## Current audit state

- Full tree: 0 critical, 9 high, 0 moderate, 0 low — **BLOCKED**
- Production-only tree: 0 critical, 0 high, 0 moderate, 0 low — **PASS**
- Audit threshold changed: **NO**
- Safe supported remediation available: **NO**

## Reachability

No Next production or static rollback runtime path to this dependency chain was identified. The chain is active in development, lint, CI, and release/build-gate tooling. It is therefore retained as `BUILD_TOOLING_CURRENT` with recommendation `REFACTOR_LATER_NOT_ARCHIVE`.

## Current dependency paths

1. `eslint@9.39.5 > @eslint/config-array@0.21.2 > minimatch@3.1.5 > brace-expansion@1.1.16`
2. `eslint@9.39.5 > @eslint/eslintrc@3.3.6 > minimatch@3.1.5 > brace-expansion@1.1.16`
3. `eslint@9.39.5 > minimatch@3.1.5 > brace-expansion@1.1.16`
4. `eslint-config-next@16.2.10 > eslint-plugin-import@2.32.0 > minimatch@3.1.5 > brace-expansion@1.1.16`
5. `eslint-config-next@16.2.10 > eslint-plugin-jsx-a11y@6.10.2 > minimatch@3.1.5 > brace-expansion@1.1.16`
6. `eslint-config-next@16.2.10 > eslint-plugin-react@7.37.5 > minimatch@3.1.5 > brace-expansion@1.1.16`
7. `eslint-config-next@16.2.10 > typescript-eslint@8.64.0 > @typescript-eslint/typescript-estree@8.64.0 > minimatch@10.2.5 > brace-expansion@5.0.7`

## Owner decision

- Non-destructive inventory: **AUTHORIZED**
- Release/deployment work: **BLOCKED**
- Archive/delete execution: **BLOCKED**
- Gate C-Preview: `BLOCKED_SECURITY_ADVISORY`
- Gate C-Production: `CLOSED`

## Next review triggers

- a patched `brace-expansion` release compatible with the legacy dependency API;
- a maintained plugin release that removes the vulnerable chain;
- a supported ESLint migration path with valid peer contracts;
- an advisory update changing the affected range or severity.

The risk must not be described as resolved until a supported remediation is applied and the full-tree audit is clean.
