# Live AI acceptance

Offline acceptance covers:

- strict gateway, response, and 13 function-tool contracts;
- key/flag fail-safe behavior;
- `store: false`, Responses streaming, and no built-ins;
- refusal, outage, cancellation, malformed schema, unapproved and parallel tools;
- external, sensitive, memory, and retention consent boundaries;
- zero provider calls for critical/prompt-injection/no-consent cases;
- exact citation validation and unsafe post-model fallback;
- safe-context truncation and memory exclusion;
- cost, rate, concurrency, retry, idempotency, and circuit controls;
- typed validated-section stream and no raw delta;
- no silent write;
- SDK/client-bundle and secret boundaries;
- Prompt 13–18 regressions, visual contracts, and browser behavior.

The default suite skips paid provider evaluation unless `TEOYUBE_RUN_LIVE_AI_EVAL=true`. The bounded synthetic provider suite is limited by the owner configuration and writes only content-safe synthetic results to `.tmp/live-ai/results`. A provider quota failure is blocking evidence, not a skipped/pass result.
