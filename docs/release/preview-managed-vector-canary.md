# Preview-only managed vector canary

Authorization: `TEOYUBE-AUG21-VECTOR-PREVIEW-CANARY-2026-08-09-001`

Evidence captured: 2026-08-11T19:23:05Z

## Disposition

The public retrieval corpus is ready in one isolated Upstash Vector Pay As You Go resource. The server-only managed adapter and authenticated Preview-only POST route are implemented behind exact environment gates. Production retrieval, Live AI, broad RAG, research collection, persistence, and private memory remain off. No Production deployment or configuration was changed.

The final Vercel Preview deployment ID and URL are intentionally recorded by the operator after this evidence-bearing commit is pushed and deployed. This prevents claiming a deployment before an exact commit exists.

## Repository boundary

| Item                      | Value                                                  |
| ------------------------- | ------------------------------------------------------ |
| Repository                | `princeinoba/teoyube-frontend-css`                     |
| Target branch             | `recovery/visual-source-of-truth`                      |
| Authorized starting SHA   | `9226605ede0a2fd7196bc68fcfebf8d5f747b284`             |
| Production deployment     | `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM` (unchanged)         |
| Production commit         | `d95b6bc3abcc2e1f3592bbf5ae90970a40010954` (unchanged) |
| Protected visual changes  | 0                                                      |
| Immutable baseline writes | 0                                                      |

## Managed vector resource

| Item                             | Value                                                                                   |
| -------------------------------- | --------------------------------------------------------------------------------------- |
| Name                             | `teoyube-public-scripture-vector-preview`                                               |
| Non-secret resource ID           | `store_GczzNBrkq0zuB4WA`                                                                |
| Provider/product                 | Upstash Vector through Vercel Marketplace                                               |
| Plan                             | Pay As You Go                                                                           |
| Region                           | provider-managed endpoint; no region value is exposed by the Vercel resource inspection |
| Metric/dimensions                | cosine / 1,536                                                                          |
| Documents                        | 32,515                                                                                  |
| Vectors                          | 33,656                                                                                  |
| Corpus hash                      | `7a3dc3e3adc2c9d0a94f527b6c5ff8ce4ee5243ca5281ab505d189ce82a4267f`                      |
| Successful/failed upsert batches | 676 / 0                                                                                 |
| Conservative operation cost      | USD $0.36                                                                               |
| Temporary storage estimate       | USD $0.09095756/month-equivalent                                                        |
| Conservative task total          | USD $0.45095756 (below USD $1.00 ceiling)                                               |

The content-type namespaces contain 33,428 Scripture, 108 Canon, 12 Promise, and 108 Lexicon vectors. Exact local/remote approved-metadata manifest hashes are:

- Scripture: `5d6a7d9f4d07e36484626b802fbf1271eda5287df991548d5acb0167b6152545`
- Canon: `0c3ff7b6ea5c0322922dc6c328d310eb04370adcf719ce3d03cc1006bf2d3b55`
- Promise: `83595923ec8acb3cc43db6513b9726c99b09314109ded33fcc31b39c5a56dbab`
- Lexicon: `725e6275922b9ef26db40ce97e927197d3bc033fe33fa90e389af40fb84c955d`

The superseded base namespace was deleted only after exact count and manifest verification. The authorized local checkpoint remains retained and unchanged. No corpus re-embedding occurred.

## OpenAI query evaluation

The Preview-only sensitive variable is named `OPENAI_API_KEY`; its value was never printed, logged, or committed. The project-scoped key name is `Codex`. It is limited by application policy to `text-embedding-3-small` query embeddings. No key is configured in Production.

| Item                                | Value           |
| ----------------------------------- | --------------- |
| Calls                               | 33              |
| Query tokens                        | 302             |
| Exact additional evaluation cost    | USD $0.00000604 |
| Total additional authorization cost | USD $0.00001208 |
| Provider failures/retries           | 0 / 0           |
| Generation calls                    | 0               |
| Corpus embedding calls              | 0               |

## Locked quality result

Three consecutive runs produced deterministic hash `2a1712a28aaa660f8038ece64df465e692663528e030abf5bf76c39f071871b5` and `QUALITY_PASS`.

| Gate                                     | Result                                              |
| ---------------------------------------- | --------------------------------------------------- |
| Diagnostic metric gate                   | PASS (42/43 cases; paraphrase recall@5 exactly 95%) |
| Locked Holdout V2                        | 35/35 on all three runs                             |
| Exact reference recall@1 / recall@5      | 100% / 100%                                         |
| V2 paraphrase recall@5                   | 100%                                                |
| Content-type precision                   | 100%                                                |
| No-answer precision                      | 100%                                                |
| Citation and displayed WEB accuracy      | 100%                                                |
| Private retrieval incidents              | 0                                                   |
| Prompt-override successes                | 0                                                   |
| Scripture/content-type misclassification | 0                                                   |
| Deterministic fallback                   | 100%                                                |
| Worst p95 retrieval latency              | 601.1979 ms (limit 2,500 ms)                        |

## Runtime and security controls

The POST route is disabled unless both Vercel and Teoyube identify the runtime as Preview, both legacy and current vector flags are enabled, exact provider/model identities match, and all forbidden feature flags remain off. Every request requires Vercel deployment authentication, same-origin policy, rate limiting, a strict schema, a 500-character limit, and explicit external-processing consent. Safety and deterministic retrieval policy reject sensitive, private, or unsafe input before either provider is called.

The response exposes public source material only. Query text, request bodies, embeddings, vectors, candidate diagnostics, and hashes are neither logged nor persisted. Timeouts, concurrency, provider-call and embedding-cost ceilings are bounded; retries are disabled; failures close to deterministic behavior. Client bundles cannot import credentials or server repositories.

Focused repository and runtime tests pass. The dependency audit reports zero vulnerabilities and the supply-chain gate passes with 492 components, zero unexpected lifecycle scripts, and zero direct-license debt. The CRLF checkout reports only two byte-bound paid-evidence controls as blocked; the final gate is required to pass in a fresh LF-preserving clone before commit/push.

## Preview/Production boundary

Preview receives only the required vector/embedding flags and credentials. Live AI, broad RAG, database persistence, durable/managed/server memory, and research collection remain off. Production receives neither OpenAI nor Upstash credentials and no enabled vector flags. Vercel Authentication remains enabled; no deployment-bypass token is permitted to remain active.

Recommendation: proceed with the authenticated Preview canary after LF-clean verification. Do not activate Production retrieval without a separate owner authorization and a controlled Production canary plan.
