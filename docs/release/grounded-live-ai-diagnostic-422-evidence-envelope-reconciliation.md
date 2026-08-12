# Teoyube diagnostic 422 evidence-envelope reconciliation

Authorization: `TEOYUBE-AUG21-LIVE-AI-DIAGNOSTIC-422-ENVELOPE-2026-08-12-001`

Recorded: 2026-08-12T15:38:03.4349994-04:00

## Outcome

The bounded diagnostic stopped fail-closed after all three authorized `public-james-wisdom` samples completed without producing evidence sufficient to classify the earlier forbidden-claim failure as A, B, C, or D.

Classification: `UNRESOLVED_WITH_SANITIZED_EVIDENCE`

All three samples returned HTTP 200 with application status `COMPLETED`, validator rule `NONE`, and zero forbidden-claim matches. This proves the corrected status-aware diagnostic path can process successful application envelopes, but the live samples do not reproduce the earlier HTTP 422 and therefore do not establish its root cause. The authorization expressly requires stopping without remediation when none of A/B/C/D is proven.

No remediation was applied. The final locked evaluation was not started, no final-evaluation bypass was created, and no replacement diagnostic bypass was created.

## Exact Preview identity

- Repository: `princeinoba/teoyube-frontend-css`
- Branch: `recovery/visual-source-of-truth`
- Instrumentation/runtime commit: `723d861634e944ca3b240039119112d0e8abb171`
- Deployment: `dpl_DPDb23LR2NuMr1UEU62tc5hQTUXC`
- Preview URL: `https://teoyube-frontend-g4xa068m2-princeinobas-projects.vercel.app`
- Vercel state: `READY`
- Vercel target: Preview
- Vercel source: Git

Before the diagnostic, local HEAD, the remote recovery branch, and the deployment's Git SHA were exactly aligned at `723d861634e944ca3b240039119112d0e8abb171`. The worktree was clean.

## Diagnostic evidence

| Sample | HTTP | Result | Forbidden matches | Input / cached / output tokens | Actual cost |
|---:|---:|---|---:|---:|---:|
| 1 | 200 | `APPLICATION_RESULT_200` | 0 | 1126 / 0 / 211 | $0.004794 |
| 2 | 200 | `APPLICATION_RESULT_200` | 0 | 1126 / 1123 / 221 | $0.002893 |
| 3 | 200 | `APPLICATION_RESULT_200` | 0 | 1126 / 1123 / 255 | $0.003301 |

Aggregate token use was 3,378 input tokens, 2,246 cached input tokens, 687 output tokens, and 4,065 total tokens. Provider operations were one model probe plus three each of input moderation, embedding, vector retrieval, generation, and output moderation. No retry-to-pass was used.

Only the sanitized outcome fields above are retained. No query, generated response, Scripture text, credential, bypass value, or provider request/response body is stored.

## Cost and bypass ledger

- Prior cumulative spent/reserved: USD $0.047934
- Diagnostic actual metered cost: USD $0.010988
- Diagnostic conservative reservation: USD $0.032430
- Conservative cumulative spent/reserved: USD $0.080364
- Absolute ceiling: USD $0.250000
- Conservative remaining authorization: USD $0.169636
- Final-evaluation cost: USD $0.000000

The diagnostic used one bypass lifecycle. It was revoked immediately after the third inconclusive sample, and an independent post-run query confirmed zero active automation bypasses. Aggregate parent lifecycle count is 3 created / 3 revoked. The fourth authorized lifecycle was not used.

## Verification and security

- Diagnostic status/parser fixtures: PASS
- Focused tests: 79/79 PASS
- Focused offline diagnostic matrix: 51/51 PASS
- TypeScript: PASS
- Focused and full lint: PASS
- Production build in the LF-preserving physical-dependency clone: PASS
- Dependency audit: PASS, zero vulnerabilities
- Tracked/history/client-bundle secret controls: PASS
- Protected visual changes: 0
- Immutable baseline writes: 0
- Locked V1 dataset: unchanged
- Locked V1 SHA-256: `54ddbff8bc181d1a2eb6a662c91ca164ee0a68038daf66ea6214caf8854b9537`

The paid-evidence security control remains pending because the final 32-case locked evaluation did not run. Security therefore remains 18/19 rather than being promoted to 19/19.

## Production boundary

Production remains READY and unchanged at deployment `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM`, commit `d95b6bc3abcc2e1f3592bbf5ae90970a40010954`.

- Production Live AI: OFF
- Production embeddings/vector retrieval: OFF
- Production broad RAG: OFF
- Production research collection: OFF
- Production persistence/private memory: OFF
- Production provider credential variables present: 0
- Production mutation: 0
- Protected Vercel project mutations: 0
- Public Production activation: NOT AUTHORIZED

## Final classification

DIAGNOSTIC 422 EVIDENCE CONTRACT: PASS OFFLINE

FORBIDDEN-CLAIM ROOT CAUSE: UNRESOLVED WITH SANITIZED EVIDENCE

EVIDENCE-SUPPORTED REMEDIATION: NOT PERMITTED / NOT APPLIED

LOCKED V1 DATASET: UNCHANGED

LOCKED LIVE AI EVALUATION: NOT RUN — AUTHORIZED STOP CONDITION

PAID-EVIDENCE SECURITY CONTROL: PENDING

SECURITY CONTROLS: 18/19 PASS

PARENT BYPASSES CREATED/REVOKED: 3/3

ACTIVE BYPASS TOKENS: 0

CUMULATIVE PROVIDER COST: WITHIN USD $0.25

PROTECTED VISUAL CHANGES: 0

IMMUTABLE BASELINE WRITES: 0

PRODUCTION LIVE AI: OFF

PRODUCTION MUTATION: 0

PUBLIC PRODUCTION ACTIVATION: NOT AUTHORIZED
