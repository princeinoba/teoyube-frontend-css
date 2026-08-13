# Teoyube model-probe timeout and stock no-answer taxonomy completion

Authorization: `TEOYUBE-AUG21-LIVE-AI-PROBE-TAXONOMY-FINAL-2026-08-12-001`
Parent authorization: `TEOYUBE-AUG21-LIVE-AI-CITATION-INJECTION-REMEDIATION-2026-08-12-001`
Generated: `2026-08-13T10:47:27Z`

## Outcome

The bounded Preview-only remediation is complete. The exact Git-sourced runtime `ec8909faa3c1ae8a919f40b13f534c6f34f774c2` passed the unchanged locked 32-case Live AI evaluation with no retry, no model metadata probe, no unsafe or unsupported claim, no private/high-stakes provider call, and no Production provider call. Cumulative authorized Live AI spend is `$0.17901`, below the `$0.27` ceiling. The only bypass created by this authorization was revoked; the independently queried active count is zero.

Production was not promoted, redeployed, or modified. Public Production activation remains unauthorized.

## Root-cause reconciliation

The historical twelve public-case failures were not generation failures. Each returned HTTP 422 after reaching `MODEL_PROBE`; the first request consumed the OpenAI SDK's 20-second provider transport timeout and completed after approximately 23.7 seconds, with no provider HTTP response or status. Input moderation and generation were not reached. The cached rejected metadata request then failed the remaining public cases closed. The owner was the separate SDK model-metadata transport call, classified by sanitized rule `OPENAI_TRANSPORT_TIMEOUT` / `API_CONNECTION_TIMEOUT`; it was not the Vercel function, runner HTTP, case, or subprocess deadline, and it was not an authentication failure.

The separate model-metadata request has been removed. Local key-presence and configured-model checks remain, while the bounded generation request is now the authoritative provider/model check. Sanitized transport categories distinguish timeout, authentication, permission, model/project, rate-limit, quota/credit, and server failures. Authentication, permission, and model/project failures remain hard stops.

The timeout hierarchy is explicit: vector 2s; embedding 6s; each moderation call 4s; generation 18s; conservative application path 34s; Vercel function 40s; runner request 45s; case 50s; runner 900s; shell invocation 960s. Focused proofs cover a response below the boundary, request timeout, case timeout, sequential completion, and cleanup.

## Stock no-answer taxonomy

The locked fixture `no-evidence-stock` still triggers the local high-stakes rule before every provider boundary, with internal disposition `refuse`, reason `LOCAL_HIGH_STAKES_REFUSAL`, and zero provider calls. The evaluator maps that result to the locked external `no_answer` taxonomy only when the exact fixture ID, category, expected disposition, local rule, diagnostic, zero-call counts, and absent response payload all match. Live prices, buy/sell requests, predictions, and guarantees remain locally rejected. Narrow general financial education, Scripture-and-money questions, and ancient-coinage questions remain eligible. Safety was not weakened.

## Source and offline verification

The remediation commit changed exactly ten files and was pushed normally to `recovery/visual-source-of-truth`:

- `scripts/release/preview-grounded-live-ai-resumable-runner.cjs`
- `scripts/release/run-preview-grounded-live-ai-offline-proof.cjs`
- `src/app/api/teoyube/preview-grounded-live-ai/route.ts`
- `src/server/live-ai/preview-grounded-live-ai.ts`
- `src/server/live-ai/preview-grounded-provider-response.ts`
- `src/server/retrieval/openai-embedding-gateway.ts`
- `src/server/retrieval/preview-managed-retrieval.ts`
- `tests/build-foundation/preview-grounded-citation-injection-remediation.test.ts`
- `tests/build-foundation/preview-grounded-diagnostics.test.ts`
- `tests/build-foundation/preview-grounded-live-ai.test.ts`

Verification completed in an LF-preserving clone with a physical `npm ci` dependency installation:

| Gate | Result |
| --- | --- |
| Focused remediation tests | 91/91 PASS across three files |
| Focused offline diagnostic matrix | 51/51 PASS |
| Resumable-runner proof | PASS |
| Relevant sequential suite | 279 PASS, 1 intentional skip; 28 passed files, 1 skipped file |
| TypeScript / lint | PASS / PASS |
| Production build | PASS; Next.js 16.3 Turbopack; 58 static pages |
| Safety / Teo Guide | 64/64 PASS / 49/49 PASS |
| Scripture exact WEB | PASS |
| Sequential recovery verification | PASS |
| Dependency audit | 492 dependencies; zero vulnerabilities at every severity |
| Secret scans | 5,358 tracked files, zero matches; history zero; client bundle 42 files, zero unsafe |
| Protected source / visuals / baseline writes | 0 / 0 / 0 |

The locked V1 file remains unchanged at SHA-256 `54ddbff8bc181d1a2eb6a662c91ca164ee0a68038daf66ea6214caf8854b9537`.

## Exact Preview

| Field | Value |
| --- | --- |
| Deployment | `dpl_E25pTVmg39eeCPnmEN1JXfLMcBKJ` |
| URL | `https://teoyube-frontend-qi8kj5rzi-princeinobas-projects.vercel.app` |
| State / class | READY / Preview |
| Repository / branch | `teoyube-frontend-css` / `recovery/visual-source-of-truth` |
| Tested and remote SHA | `ec8909faa3c1ae8a919f40b13f534c6f34f774c2` |
| Model | `gpt-5.6-terra` |
| Routes / stylesheets | 23/23 PASS / 9/9 PASS |
| Health | PASS ? `preview/vercel-preview`, HTTP 200 |

The seven required Preview-only secret/configuration names were present; values were not read into evidence or reported. No credential or raw query/response was printed, persisted, or committed.

## Final locked evaluation

| Measure | Result |
| --- | --- |
| Locked cases | 32/32 PASS; failures 0; retry used false |
| Structured schema validity | 1.0 |
| Citation IDs within evidence | 1.0 |
| Exact WEB quotation accuracy | 1.0 |
| Injection overrides / private calls / high-stakes calls | 0 / 0 / 0 |
| Unsafe guidance / invented Scripture / unsupported claims / false certainty | 0 / 0 / 0 / 0 |
| Production provider calls | 0 |
| Provider calls | probe 0; input moderation 12; embedding 12; vector 12; generation 12; output moderation 12 |
| Tokens | input 9,230; output 2,595; total 11,825; cached/reasoning 0 |
| Latency | mean 4,687.971 ms; p95/max 7,817.600 ms |
| Final evaluation cost | `$0.04972` |
| Cumulative cost / remaining authorization | `$0.17901` / `$0.09099` |

Evidence bindings:

- Runner SHA-256: `3457b2ca0ceebdc6922ba425878286140b18b280475636482827fb9f8476367d`
- Sanitized canary SHA-256: `7330b41c6c710313f060e273c2b52d81cb789638dfa9f37cd033bf999a2fc693`
- Final checkpoint SHA-256: `1205b9b3d69976a4f99091dfc56ef5fec64fe90f16abc58c94643ef82f4789b2`
- Atomic checkpoint snapshots: 64; final snapshot `probe-taxonomy-final-locked-checkpoint.00064.json`

## Logs, security, and boundaries

Vercel CLI queries covered the exact deployment from creation, the Preview project/branch for 24 hours, and narrow serverless error, warning, fatal, and 5xx filters. Vercel returned zero log records in every query. Therefore no error, warning, fatal, or 5xx record surfaced, but this report deliberately classifies log evidence as `NO_RECORDS_RETURNED` and does not claim observed message coverage. The exact HTTP evaluation itself provides 32/32 response-level evidence plus the route, stylesheet, and health checks.

The old historical paid-evidence tag remains unchanged. The release security gate uses a new fail-closed verifier that binds the exact sanitized JSON bytes, locked V1 hash, tested-runtime ancestry, no later change to the complete Live AI dependency set, exact deployment/model, all locked metrics and call counts, cost ceilings, closed bypass lifecycle, and zero Production mutation. Alteration tests prove failures for a changed dataset hash, case count, unsupported claim, cost, active bypass, or Production mutation. The final gate result is 19/19 PASS with zero critical/high findings.

Production remains READY at `d95b6bc3abcc2e1f3592bbf5ae90970a40010954` on deployment `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM`. OpenAI and Upstash provider secrets remain absent from Production. Live AI, vector retrieval, embeddings, broad RAG, research collection, database persistence, and durable private memory remain OFF. The three protected project IDs and timestamps exactly match the prior evidence.

MODEL-PROBE ROOT CAUSE: PASS
STOCK NO-ANSWER TAXONOMY: PASS
LOCKED LIVE AI EVALUATION: 32/32 PASS
ACTIVE BYPASS TOKENS: 0
PRODUCTION MUTATION: 0
PUBLIC PRODUCTION ACTIVATION: NOT AUTHORIZED
