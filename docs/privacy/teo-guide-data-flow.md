# Teo Guide data flow

1. The approved client sends input, a random session conversation identifier, and locale to the same-origin Next preview endpoint.
2. The server bounds the body and input, fingerprints telemetry metadata, and does not log raw prayer or reflection text.
3. Authentication is optional for ordinary guidance. The server—not the request body—resolves identity, consent, and any current journey record.
4. Safety classification runs before tool execution.
5. The fixed planner chooses no more than five read-only tools.
6. Memory/journey tools receive minimum necessary structured fields only after identity and consent authorization.
7. Tool outputs remain transient. Sources, versions, limitations, and proposal metadata flow to the structured response.
8. Conversation metadata stores only turn identifiers, timestamps, input fingerprints, response identifiers, and source identifiers. Raw user text is not stored.
9. The client receives a narrow DTO. It does not receive seed datasets, graph traversal, server caches, private memory content, secrets, or provider configuration.

No external request is made by the orchestrator. `TEOYUBE_ENABLE_LIVE_AI`, embeddings, vector retrieval, broad RAG, and an external Teo Guide provider are explicitly false in the preview environment template.

Durable Prompt 16 memory remains separately gated. Teo Guide has a read-only memory adapter and cannot silently persist user input, summaries, drafts, actions, or conclusions.
