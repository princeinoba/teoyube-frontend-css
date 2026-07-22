# Live AI memory boundaries

External model memory use requires both `external_ai_memory_context` and the original purpose-specific `memory:read` consent. The safe builder removes approved-memory sources and memory tool results when external memory consent is absent.

When allowed, the model receives at most two bounded records. Record content is represented through prepared, source-bound summaries and minimal metadata; database paths, audit history, encryption material, cross-user data, raw journal history, and full conversation history are excluded. Exact Scripture is never truncated into a misleading quote.

The model cannot write memory. Live response completion does not retain a conversation, create a reflection, publish testimony, advance a journey, declare fulfillment, or promote a Book record. Those operations remain explicit deterministic endpoints with authentication, CSRF, consent, idempotency, expiry, audit, and reversal policies.
