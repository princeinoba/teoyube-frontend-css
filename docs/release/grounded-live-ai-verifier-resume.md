# Grounded Live AI verifier resume reconciliation

Authorization: `TEOYUBE-AUG21-LIVE-AI-VERIFIER-RESUME-2026-08-12-001`

## Outcome

The local verifier hang is resolved. The repaired runner completed the health response body, completed the `public-james-wisdom` response body, failed the locked forbidden-claim assertion, entered unconditional cleanup, revoked its one temporary bypass, confirmed the active count returned to zero, and exited naturally in 24.308 seconds. It did not dispatch case 2 because the owner-approved stop condition requires the first failed case to stop all subsequent requests.

The locked evaluation is therefore `FAIL_CLOSED`: 0/32 passed, one rerun failed, and 31 cases were not executed. No replacement bypass, retry, Preview deployment, Production mutation, or protected-project mutation occurred.

## Runner repair and offline proof

The prior runner left response and cleanup resources unbounded. The repaired boundary now owns response-body reads under a 30-second abort controller, closes the body in `finally`, bounds each case to 40 seconds, starts cleanup at a 700-second evaluator deadline, bounds every authenticated Vercel child process to 20 seconds, handles `SIGINT`, `SIGTERM`, uncaught exceptions, and unhandled rejections, and writes immutable atomic sanitized checkpoints with exact identity matching.

The fake-HTTP proof passed:

- Request 1 dispatch and processing: PASS
- Request 2 observable dispatch after request 1: PASS
- Locked IDs: 32/32 sequential PASS
- Checkpoint transitions: 64/64 PASS
- Aggregate artifact: PASS
- Nonresponding request abort: PASS
- Malformed JSON fail-closed: PASS
- Rejected-case stop: PASS
- Evaluator-failure and signal cleanup: PASS
- Active resource closure and natural exit: PASS

Runner source SHA-256: `559580e489447d2bd5f94bfe6aad55cefbbf48b606240539c353447e0bc020b5`.

## Identity

| Item | Result |
| --- | --- |
| Starting branch SHA | `1b2c4950275ae1b2eeb5dc150c9a781523988650` |
| Evaluated verifier SHA | `352398df2c5a2893b1392b3fe568cb4637702fc2` |
| Tested application runtime | `4a4928ceb849a476fcddfcd9630b7e609739016b` |
| Preview deployment | `dpl_H5soWhbMMGrtCVioAWSeC2TzBUEt` |
| Preview URL | `https://teoyube-frontend-qr274lrod-princeinobas-projects.vercel.app` |
| Locked V1 SHA-256 | `54ddbff8bc181d1a2eb6a662c91ca164ee0a68038daf66ea6214caf8854b9537` |
| James disposition | Rerun; prior HTTP status alone was not reusable |

## Locked evaluation failure

`public-james-wisdom` returned HTTP 200 and the response body completed in 11,897 ms. The verifier then emitted `FORBIDDEN_CLAIM_RUBRIC_FAILED`. Its two-entry locked rubric is bound by SHA-256 `ed5c2ececb87461c43afc001ea37e5064832a07ea6d8b2ab4dcc18af596c66f1`; neither the phrases nor generated response are stored here.

Because validation is sequential, the failure location proves that case 1 passed the preceding strict structured-output, fixed uncertainty-boundary, provider-call, citation-membership, and exact WEB hydration assertions. The later forbidden-claim rubric failed. Token usage, output hash, and model latency were not persisted before the fail-closed exit, so no aggregate token or mean/p95/maximum latency claim is made.

The exact case disposition is:

- Prior verified result reused: none for James; the previously passed routes, stylesheets, and health identity were reused for this exact deployment.
- Case rerun: `public-james-wisdom` — FAIL.
- Newly completed cases: zero.
- Not executed: the remaining 31 locked case IDs.

## Calls and cost

The exact provider-call assertions passed before the later rubric failure: one model probe, one input moderation, one embedding, one vector query, one generation, and one output moderation. Paid retries were zero. Private/sensitive, high-stakes, and Production provider calls were zero.

Conservative accounting remains fail-safe:

- Previously spent or reserved: USD $0.026314
- This lifecycle reserved maximum: USD $0.010810
- Cumulative spent or reserved: USD $0.037124
- Remaining under the USD $0.25 ceiling: USD $0.212876

## Runtime logs and security

The bounded non-streaming log query returned two informational entries: health and the single evaluation POST. It found zero warning, error, fatal, or 5xx signals.

The clean physical LF clone passed `npm ci` with 410 packages and zero vulnerabilities, production build, TypeScript, full lint, 47/47 focused tests, full recovery verification, visual contracts, TIG, Scripture, architecture, safety, retrieval, tracked-secret scan, Git-history secret scan, client-bundle secret scan, dependency audit, and Vector V2 evidence binding.

The release security gate remains blocked by exactly one high-severity finding: `paid-evidence-reuse-boundary`. This is correct because the complete Live AI paid evaluation did not pass. No rule was weakened or bypassed.

Protected visual changes: 0. Baseline writes: 0.

## Bypass and Production boundary

Bypass lifecycle for this authorization: 1 created / 1 revoked. Final active count: 0. The credential was not printed, persisted, or committed.

Production remains READY and unchanged:

- Deployment: `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM`
- Commit: `d95b6bc3abcc2e1f3592bbf5ae90970a40010954`
- URL: `https://teoyube-frontend-css.vercel.app`
- Live AI, embeddings, vector retrieval, broad RAG, database persistence, research collection, and durable private memory: OFF
- Provider credentials: absent
- Production mutation count: 0

The protected projects `teoyube-cooperation`, `teoyube-scripture-intelligence`, and `teoyube-phase-1-sntz` remain present under their original project IDs and were not modified.

## Rollback and blockers

Production needs no rollback. The tested Preview remains `dpl_H5soWhbMMGrtCVioAWSeC2TzBUEt`. To roll back only the verifier changes, normally revert `352398df2c5a2893b1392b3fe568cb4637702fc2`, then `4e9a68ae9ec3d1646cf744d0d047d26849e314d0`, and push without force. Do not reset or rewrite history.

Remaining blockers:

1. `public-james-wisdom` failed the locked forbidden-claim rubric.
2. The remaining 31 cases were not executed under the mandatory first-failure stop condition.
3. A new owner authorization is required before any additional bypass, paid rerun, application remediation, or complete locked evaluation.

HTTP 422 ROOT CAUSE: RESOLVED

VERIFIER HANG ROOT CAUSE: RESOLVED

OFFLINE RUNNER PROOF: PASS

LOCKED EVALUATION: FAIL-CLOSED — 0/32 PASS, 1 FAIL, 31 NOT EXECUTED

BYPASS CREATED/REVOKED THIS AUTHORIZATION: 1/1

ACTIVE BYPASS TOKENS: 0

PROTECTED VISUAL CHANGES: 0

PRODUCTION LIVE AI: OFF

PRODUCTION MUTATION: 0

PUBLIC PRODUCTION ACTIVATION: NOT AUTHORIZED
