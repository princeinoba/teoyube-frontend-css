# ADR-002: Deterministic server-owned Teo Guide orchestration

## Status

Accepted for Prompt 18 preview; live model Gate B remains closed.

## Decision

Use one framework-independent orchestration contract, one deterministic planner, and one fixed server-only 13-tool registry. Exact WEB Scripture, canonical TIG, Prompt 16 identity/consent memory, and Prompt 17 safety retain ownership. The browser receives only a client-safe DTO. Tools are read-only; state changes are owner-bound, expiring, idempotent proposals requiring a separate confirmed application action.

## Consequences

Teo Guide is useful and sourced without a provider, embedding system, vector database, broad RAG, or secret. Fixed versions make responses reproducible. Sensitive and critical safety ordering is deterministic. Ordinary legacy wording remains a compatibility boundary.

The limitation is reduced free-form synthesis: unknown requests use one focused question and safe fallback. Conversation metadata is session-process only; durable continuity remains owned by Prompt 16. Adding a model or tool requires a later explicit owner gate and cannot be inferred from this ADR.
