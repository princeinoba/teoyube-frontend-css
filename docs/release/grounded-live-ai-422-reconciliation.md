# Teoyube grounded Live AI 422 reconciliation

Authorization: `TEOYUBE-AUG21-LIVE-AI-422-RECONCILIATION-2026-08-12-001`

Final classification: **FAIL-CLOSED — FULL LOCKED EVALUATION INCOMPLETE**

## Outcome

The original HTTP 422 cause is resolved. The sanitized paid diagnostic identified `THEOLOGICAL_VALIDATION / THEOLOGICAL_RULE_VIOLATION / MISSING_UNCERTAINTY`. Retrieval produced five eligible evidence records, the provider response was completed and schema-valid, and its single citation was known.

The narrow remediation makes `safety_boundary` a fixed, server-reviewed strict-schema literal: `This is interpretation, not divine certainty.` The provider instruction requires that exact value, and a regression test proves free-form substitutes remain invalid. The remediated `public-james-wisdom` endpoint request returned HTTP 200.

The complete locked evaluation is not classified PASS. The final verifier completed health, 23 canonical routes, nine stylesheets, and the first case endpoint response, then stopped before case 2 and produced no final artifact. Its command host exited 124 after 2516.8 seconds. Runtime logs contain one evaluation POST with HTTP 200, no second POST, 35 informational entries, and no warning, error, fatal, or 5xx entry. Because both authorized bypass lifecycles have been used, no third lifecycle was created.

## Identity

| Item | Result |
| --- | --- |
| Starting SHA | `5258958aaa6856700559e557e188b0b2c7c29fb4` |
| Diagnostic instrumentation commit | `34c60be74237f456506217d420d74256a9a14f02` |
| Diagnostic Git runtime SHA | `480501d1a9727ef1f1104f5b0592198ec5eef764` |
| Remediation/tested runtime SHA | `4a4928ceb849a476fcddfcd9630b7e609739016b` |
| Branch | `recovery/visual-source-of-truth` |
| Repository | `princeinoba/teoyube-frontend-css` |
| Locked dataset | V1, 32 cases |
| V1 SHA-256 | `54ddbff8bc181d1a2eb6a662c91ca164ee0a68038daf66ea6214caf8854b9537` |
| Dataset mutation | None; V2 not created |

## Verification

| Gate | Result |
| --- | --- |
| Focused 422/diagnostic/remediation tests | 52/52 PASS |
| Sequential recovery verification | PASS |
| TypeScript | PASS |
| Repository lint | PASS |
| Physical LF `npm ci` | PASS; physical local dependencies; 0 vulnerabilities |
| Production build | PASS |
| Exact WEB and Scripture verification | PASS |
| TIG verification | PASS |
| Teo Guide tests | 49/49 PASS |
| Retrieval tests | 23/23 PASS |
| Live AI safety fixtures | 64/64 PASS; public Live AI remains closed |
| Tracked-secret scan | PASS; 0 matching files |
| Git-history secret scan | PASS; 0 pattern matches |
| Client-bundle scan | PASS; 0 unsafe files |
| LF security gate | BLOCKED only by `paid-evidence-reuse-boundary` because the full paid evaluation is incomplete |
| Protected visual changes | 0 |
| Baseline writes | 0 |

## Preview evaluation

Diagnostic Preview:

- Deployment: `dpl_CuMe8xsLNbxMjJYNPZUYkMDpphwT`
- URL: `https://teoyube-frontend-ovntd778v-princeinobas-projects.vercel.app`
- Runtime SHA: `480501d1a9727ef1f1104f5b0592198ec5eef764`
- Git-sourced Preview: READY

Remediation Preview:

- Deployment: `dpl_H5soWhbMMGrtCVioAWSeC2TzBUEt`
- URL: `https://teoyube-frontend-qr274lrod-princeinobas-projects.vercel.app`
- Runtime SHA: `4a4928ceb849a476fcddfcd9630b7e609739016b`
- Git-sourced Preview: READY
- Health: PASS
- Canonical routes: 23/23 PASS
- Stylesheets: 9/9 PASS
- Locked endpoint results: 1/32 received; `public-james-wisdom` HTTP 200
- Remaining cases: 31 not executed

The first HTTP 200 proves that the original `MISSING_UNCERTAINTY` fallback no longer occurs and that the server accepted strict structured output, citation validation, exact WEB hydration, moderation, and theological validation for that case. It does not prove the full-set thresholds.

## Calls, tokens, cost, and latency

Two generation pipelines executed across the diagnostic and final lifecycle. Conservative per-type maxima are two model probes, two input moderation calls, two embeddings, two vector queries, two generations, and two output moderation calls. Exact final response counters were not persisted. Production provider calls were zero; paid retries were zero.

Known diagnostic usage: 1,100 input tokens, 207 output tokens, zero reasoning tokens, USD $0.004694, and 10,042.469311 ms. Final-case tokens and latency were not persisted, so no locked mean/p95/maximum is claimed.

Conservative cumulative accounting:

- Prior failed request reserve: USD $0.01081
- Diagnostic actual: USD $0.004694
- Final first request reserve: USD $0.01081
- Total spent or reserved: USD $0.026314
- Remaining under USD $0.25: USD $0.223686
- Full-evaluation preflight maximum: USD $0.145224

## Security and deployment boundary

Both authorized bypasses were revoked. Final active bypass count is zero. No third bypass was created. No credential, environment value, query, prompt, Scripture text, generated response, or raw provider response is stored in this evidence.

Production remains READY and unchanged:

- Deployment: `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM`
- Commit: `d95b6bc3abcc2e1f3592bbf5ae90970a40010954`
- URL: `https://teoyube-frontend-css.vercel.app`
- Production Live AI: OFF
- Production mutation count: 0

The protected projects `teoyube-cooperation`, `teoyube-scripture-intelligence`, and `teoyube-phase-1-sntz` were not modified.

## Rollback and remaining blocker

Production needs no rollback because it was not changed. For Preview rollback, use `dpl_CuMe8xsLNbxMjJYNPZUYkMDpphwT`, or normally revert `4a4928ceb849a476fcddfcd9630b7e609739016b` and push. Do not reset, rewrite history, or force-push.

The remaining blocker is the incomplete 32-case final runtime evaluation. The exact verifier source is `scripts/release/run-preview-grounded-live-ai-canary.cjs`; the command host exited 124, no final canary artifact was written, and runtime logs show execution stopped between the first HTTP 200 response and receipt of a second POST. Completing the remaining 31 cases requires a new owner-authorized bypass lifecycle.

HTTP 422 ROOT CAUSE: RESOLVED

SANITIZED DIAGNOSTICS: PASS

LOCKED EVALUATION: FAIL-CLOSED / INCOMPLETE

ACTIVE BYPASS TOKENS: 0

PROTECTED VISUAL CHANGES: 0

PRODUCTION LIVE AI: OFF

PRODUCTION MUTATION: 0

PUBLIC PRODUCTION ACTIVATION: NOT AUTHORIZED
