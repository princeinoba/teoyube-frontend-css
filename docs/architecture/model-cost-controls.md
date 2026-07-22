# Model cost controls

Pricing assumption version: `openai-public-pricing-2026-07-22`.

| Control | Limit |
| --- | ---: |
| estimated input tokens | 6,000 |
| output tokens | 1,200 |
| tool rounds | 2 |
| deterministic tools per turn | 5 |
| request duration | 20 seconds |
| provider timeout | 15 seconds |
| requests per user per minute | 6 |
| global requests per minute | 30 |
| concurrency | 2 |
| estimated cost per request, including retry admission | USD 0.05 |
| development/evaluation daily budget | USD 2.00 |
| Prompt 19 evaluation cap | USD 2.00 |
| transient retries | 1 |
| circuit breaker | 3 provider failures / 60-second cooldown |

Budget admission runs before every provider call and retry. Cached input, input, output, reasoning, total tokens, request count, route, latency, and estimated cost are content-free metadata. Raw prayer, reflection, memory, request, response, or tool text is never logged. The owner kill switch is `TEOYUBE_LIVE_AI_ENABLED=false`; the two surrounding provider/live flags must also be true.
