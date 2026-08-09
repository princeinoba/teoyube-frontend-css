# Scripture Vector Retrieval Provider Evaluation

Authorization: `TEOYUBE-AUG21-VECTOR-EVALUATION-2026-08-09-001`

## Disposition

**BLOCKED_QUALITY**

The OpenAI provider and the evaluation-only index were exercised successfully, within the owner-authorized cost ceiling and without private content. Vector retrieval is now **PROVIDER_EVALUATED**, but it is **not activation-ready** and remains OFF.

## Provider and checkpoint

- Provider: OpenAI embeddings
- Model: `text-embedding-3-small`
- Dimensions: 1536
- Evaluation corpus hash: `7a3dc3e3adc2c9d0a94f527b6c5ff8ce4ee5243ca5281ab505d189ce82a4267f`
- Prepared inventory reference hash: `f0669e6f0c1974fc4be742b301e7b3efefdbb0ea367d33b5c7a86ccfeccc7fbe`
- Documents: 32,515
- Chunks: 33,656
- Checkpoint: `checkpoint:evaluation:text-embedding-3-small:1536:teoyube-deterministic-chunker-2026-07-23.1:7a3dc3e3adc2c9d0a94f:2026-08-09T14:11:21.881Z`
- Created: `2026-08-09T14:11:21.881Z`
- Database size: 298,397,696 bytes
- Storage: ignored local evaluation checkpoint; no vectors committed or exposed publicly
- Expiration/deletion: Delete local ignored checkpoint after owner review or before any corpus/model/policy change.
- Deletion command: `npm run retrieval:provider:delete-checkpoint`

The authorized evaluation corpus contains exact WEB Scripture, Scripture context, public Promise metadata, public Lexicon records, and public Canon records. Five prepared sources outside the new authorization were excluded: prayer templates, theology policy, and three product-help files. No journal, prayer text, testimony candidate, Calling Compass answer, user identifier, research event, managed-memory record, secret, log, or unrelated-repository content was indexed.

## Cost and usage

| Item | Result |
| --- | ---: |
| Expected cost | $0.04099110 |
| Conservative ceiling | $0.04918932 |
| Authorized ceiling | $0.25 |
| Actual bounded task cost | $0.04040528 |
| Index input tokens | 2,019,872 |
| Query input tokens, cumulative | 392 |
| Provider calls, cumulative | 181 |
| Retries | 0 |
| Failed indexed items | 0 |

The first raw-vector evaluation was retained unchanged under the ignored checkpoint. One final query-only evaluation used the actual Teoyube hybrid retrieval path; the completed index was reused with no duplicate indexing cost.

## Metrics

| Metric | Result | Required |
| --- | ---: | ---: |
| Exact-reference recall@1 | 100% | 100% |
| Exact-reference recall@5 | 100% | 100% |
| Paraphrase recall@5 | 90% | >=95% |
| Mean reciprocal rank | 0.714167 | reported |
| Content-type precision | 85.71% | reported |
| Citation-reference accuracy | 100% | 100% |
| Displayed exact-WEB accuracy | 100% | 100% |
| No-answer precision | 0% | required safe abstention |
| Private/excluded retrieval | 0% | 0% |
| Prompt-injection override | 0% | 0% |
| Cross-type Scripture misclassification | 0 | 0 |
| Deterministic fallback | 100% | 100% |
| Latency p95 | 6249.63 ms | reported |
| Provider errors | 0 | 0 |

## Quality blockers

- Paraphrase recall@5 is 0.90, below the required 0.95.
- No-answer precision is 0.00; unsupported external-current-info and ambiguous queries return plausible but irrelevant Scripture instead of abstaining.
- Calling/Canon ranking misses para-16 and para-20 in the top five.
- The interpretation-as-Scripture trap does not surface the expected Canon record, although returned Scripture remains correctly typed.

The thresholds and expected records were not weakened after results. No further provider call was made after the final hybrid evaluation.

## Scripture and safety

The deterministic exact-WEB Scripture service remains authoritative. Semantic retrieval only locates candidates; displayed Scripture is resolved and validated through the canonical service. The corpus verification remains 66 books, 1,189 chapters, 31,103 source markers, 31,098 displayable verses and five source-footnote-only markers, with no silent paraphrase substitution.

Private/excluded retrieval was 0%, prompt-injection override was 0%, and cross-type Scripture misclassification was 0. Provider failure, timeout, rate-limit, partial response, corrupt dimension, key-absent, feature-off, authorization, storage isolation and deterministic fallback tests pass.

## Verification and release boundary

- Focused tests: 31 unique tests PASS
- Production build: PASS, 58 pages
- Full TypeScript: PASS
- Full lint: PASS
- Dependency audit: 0 vulnerabilities
- Security/secret gate: PASS, 18 controls, critical/high 0
- Final `recovery:verify`: FAIL on pre-existing stale protected visual/Scripture approval metadata; protected files are byte-identical to starting commit `ff9fd245`, and the baseline was not regenerated or weakened
- Protected visual changes: 0
- Immutable baseline writes: 0
- Production flags changed: 0
- Production redeployed: no
- Vector retrieval, embeddings, broad RAG and Live AI: OFF

Final outcome: **BLOCKED_QUALITY**. A future owner-authorized remediation must add robust abstention and improve Canon/calling paraphrase ranking, then run a new locked evaluation. This checkpoint must not be promoted or used as a public Production index.
