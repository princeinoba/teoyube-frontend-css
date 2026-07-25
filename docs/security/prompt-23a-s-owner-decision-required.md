# Prompt 23A-S owner decision required

Candidate ID: `P23A-S-SECURITY-001`

Decision: `PENDING`

## Blocker

The only patched `brace-expansion` release is `5.0.8`. Six current ESLint/Next lint branches require the legacy 1.x callable API through `minimatch@3.1.5`, and no patched 1.x release exists. The latest stable plugin set has not migrated away from minimatch 3.

## Recommended disposition

Keep Gate C-Preview and Gate C-Production closed. Retry the focused remediation after an upstream compatible release appears.

## Options explicitly rejected

- `npm audit fix --force`;
- forcing `brace-expansion@5.0.8` outside the legacy parent range;
- forcing minimatch 10 into plugins that call minimatch 3 as a CommonJS function;
- adopting a peer-invalid ESLint 10 tree that still reports six highs;
- weakening or removing lint rules;
- lowering or suppressing the audit threshold.

No owner approval is inferred or fabricated. Prompt 23A inventory, Prompt 23B, and Prompt 24 remain locked.
