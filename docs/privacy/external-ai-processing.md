# External AI processing

Four default-off purposes are separate:

- `external_ai_processing` / `external_ai:process` permits a provider request;
- `external_ai_sensitive_content` / `external_ai:sensitive_content` permits noncritical sensitive content;
- `external_ai_memory_context` / `external_ai:memory_context` permits minimum already-authorized memory context;
- `live_ai_conversation_retention` / `external_ai:conversation_retention` is separate and is not used to create provider-hosted memory.

Submitting a message does not imply consent. No purpose is pre-granted. Revocation immediately removes the grant from future request context. Existing purpose-specific memory read authorization is still required in addition to external memory consent. Critical and prompt-injection cases do not call the provider even when consent exists.

Provider metadata contains content-free request, route, model, prompt/schema/safety versions, consent identifiers/purposes, memory-used status, token counts, latency, and cost. It excludes raw messages, responses, memory, prayer, reflection, journal/testimony, tool output, sessions, secrets, and source paths.

OpenAI requests use `store: false`. This repository has not verified Zero Data Retention, region, DPA, or production retention controls; no stronger deletion or retention claim is made.
