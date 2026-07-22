# ADR-003: Guarded live model gateway

Status: accepted for local Next preview; production gate closed.

Decision: retain Prompt 17 safety and Prompt 18 deterministic orchestration as authoritative, then place an optional provider-neutral synthesis gateway behind explicit consent and three server kill switches. Use the official OpenAI Responses API adapter as the only vendor integration. Validate a strict response object before streaming approved sections.

Consequences: deterministic mode remains complete without credentials or consent; provider failure cannot block Scripture-grounded fallback; model SDK and seeds stay out of client bundles; every state change remains a separate user-confirmed deterministic action. Production use remains blocked by identity, database, deployment key management, monitoring, incident response, data-control review, human output review, and runtime-cutover authorization.

Rejected: direct SDK imports in features, model-selected tools, free-form streamed text, provider-hosted memory, built-in retrieval, live AI in the static runtime, and baseline/UI redesign.
