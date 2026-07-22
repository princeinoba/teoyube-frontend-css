# Deterministic theological safety pipeline

Status: Prompt 17 Gate A implementation. Static Teoyube remains canonical; Next remains preview-only; live AI is disabled.

The framework-independent contracts live in `src/domain/safety`. Server-only orchestration, exact WEB retrieval, crisis-resource resolution, deterministic composition, and evaluation live in `src/server/safety`. Approved views are unchanged and do not import these server modules.

The pipeline is fail-closed and ordered:

1. `pre_retrieval`: minimize the input, classify topic/severity, detect immediate danger, select Scripture/memory policies, authorize retrieval categories, and ignore instructions embedded in untrusted data.
2. `pre_tool`: authorize a bounded typed tool list. State-changing tools are denied during composition; memory reads require server-authoritative identity, same-user scope, purpose, consent, and minimum-necessary fields.
3. `post_composition`: validate prohibited claims, exact WEB citation/text, crisis ordering, resource status, humility, uncertainty, escalation, tool/memory claims, and unsafe follow-up questions.
4. `pre_write`: a separate application action calls `authorizePreWrite`. Authentication, authorization, same-user scope, explicit confirmation, source validation, purpose, and consent (for memory) are rechecked. Calling cannot be declared as fact. User-controlled writes remain auditable and reversible.

The orchestration result lists the first three read-only stages as completed and states that pre-write authorization remains required. It does not silently perform the fourth stage or a durable write.

Limits are versioned in `SAFETY_LIMITS`: 8,000 input characters, four detected topics, 16,000 claim-scan characters, 24,000 response-validation characters, 250 evaluation cases, 10,000 ms deterministic evaluation, 500 ms resource lookup, 500 telemetry events per bounded sink, and 16 tool requests. Limit conditions return a typed cautious fallback or fail closed.

No safety module imports React, Next, CSS, protected assets, model providers, embeddings, browser storage, or client secrets. Exact Scripture is provided by the Prompt 15B canonical local WEB repository. Prompt 16 consent/deletion rules remain authoritative. Prompt 13 journey transitions remain outside safety recommendation computation.

Commands:

```text
npm run safety:verify
npm run safety:evaluate
npm run safety:gate:orchestration
npm run safety:gate:live-ai
```

Artifacts are disposable and written only to `.tmp/safety/results/`. Gate B is intentionally closed.
