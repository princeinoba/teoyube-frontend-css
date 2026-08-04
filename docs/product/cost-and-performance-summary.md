# Cost and performance summary

## Measured local performance

- Prompt 17S: **216/216** performance cells passed in three resumable local runs under the 5,000 ms route-readiness threshold.
- Current focused contract suite: **8 files / 66 tests PASS** in 3.92 seconds.
- Hybrid retrieval: p95 **304.2182 ms**, below the recorded 334.64 ms non-regression maximum.
- Mean retrieval context increased from 1,664 to 2,536.95 estimated tokens (+872.95), remaining under the 4,000-token cap.
- Consent-memory focused test evidence reports sub-3 ms local p95 values for its measured operations; these are in-process/local numbers, not network SLOs.

## Recorded paid evidence

| Evidence | Calls/tokens | Recorded cost |
| --- | --- | ---: |
| Prompt 19K bounded live-provider suite | Seven provider calls; 10,663 input, 1,280 cached input, 4,633 output tokens | Final suite USD 0.086566; conservative audited Prompt 19K upper bound USD 0.208829 |
| Prompt 20 public indexing | Retained paid checkpoint | Proven lower amount USD 0.01926196; conservative authorized estimate USD 0.04899192 |
| Prompt 20 evaluation | 717 input tokens over passing runs plus one two-token diagnostic | USD 0.00001434 |
| Prompt 24 | No provider operations | **USD 0.00** |

Prompt 20 separately cites a Prompt 19K regression amount of USD 0.090635; it is not counted as Prompt 20 embedding spend. Historical amounts are not projected as production economics.

## Controls

- Estimated request admission cap: 6,000 input and 1,200 output tokens.
- Conservative request/retry cost admission: USD 0.05.
- Content-free metadata records token counts, latency, route, request count, and estimated cost.
- Live AI, embeddings, vector retrieval, and broad RAG default off; owner kill switch remains available.
- Raw prayer, reflection, memory, request, response, or tool text must not be logged.

## Evidence gaps

- No production network, concurrency, cold-start, regional, or long-duration traffic evidence.
- No pilot distribution for requests per user, retry rate, context length, or accepted journey.
- No production monthly budget or alert-response evidence.
- Current client/CSS/image budgets need a newly authorized release bundle at current source.

Performance is scored 8.3 locally; production readiness remains 5.8 overall.
