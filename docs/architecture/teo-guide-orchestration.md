# Teo Guide deterministic orchestration

Teo Guide is a deterministic server-owned application service. It does not call a model, embedding service, vector database, broad RAG system, or external provider. The static runtime remains canonical and the Next route remains preview-only.

The boundary is:

```text
approved Teo Guide view
→ client-safe response adapter
→ POST /api/teoyube/teo-guide
→ safety pre-retrieval decision
→ deterministic intent classifier and fixed plan
→ authenticated/consent-aware tool authorization
→ fixed local tool registry
→ structured response composer
→ post-composition safety validation
→ client-safe DTO
```

The orchestrator is `DeterministicTeoGuideOrchestrator`. Fixed input, fixed context, fixed clock, and fixed dataset/ruleset versions produce the same semantic response and source paths. Operational duration is measured separately. User input can select only a fixed intent; it cannot supply tool names, permission changes, repositories, URLs, or instructions.

Exact Scripture comes from the canonical WEB repository. Calling evidence comes from the canonical TIG service. Promise data comes from the reviewed local Promise Cluster dataset. Consent-aware reads use the Prompt 16 server identity and memory service. Tool execution is read-only. Drafts and journey changes are proposals, not writes.

The existing deterministic Teo Guide message is retained as a compatibility adapter so ordinary user-visible copy, Scripture anchors, confidence wording, and limitations remain stable. Sensitive and critical responses use the Prompt 17 safety composer, with critical safety guidance rendered before Scripture or recommendations.

Versions are returned with every structured response: orchestrator, planner, tool registry, Scripture corpus, TIG dataset, TIG ruleset, and safety policy.
