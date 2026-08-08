# Accelerated release security disposition

The sole current full-tree high advisory, `GHSA-5p4m-2wfm-xmqj`, affected development-only `js-yaml 4.3.0` through `eslint 9.39.5 -> @eslint/eslintrc 3.3.6`. The official patched version is `4.3.1`, and the parent dependency already accepts `^4.3.0`.

The lockfile was narrowly updated to `js-yaml 4.3.1`. `package.json` did not change; no forced audit fix and no override were used.

Current evidence:

- Full npm audit: 0 vulnerabilities.
- Production-only npm audit: 0 vulnerabilities.
- Supply chain: 490 components, 0 unexpected lifecycle scripts, 0 direct license debt.
- Release security gate: 18 controls, 0 critical/high findings.
- Temporary exception: not required.

Official advisory: <https://github.com/advisories/GHSA-5p4m-2wfm-xmqj>
