# Teo Guide tool registry

The registry is fixed at version `teo-guide-tools-2026-07-22.1`. Tools have strict versioned input/output schemas, bounded outputs, explicit trust labels, and `stateMutation: false`.

| Tool | Purpose | Auth/consent | Owner implementation |
|---|---|---|---|
| `searchScripture` | Exact approved WEB retrieval | No | Canonical Scripture repository |
| `getScriptureContext` | Canonical passage context | No | Canonical Scripture repository |
| `searchPromises` | Search local Promise Clusters | No | Reviewed local cluster data |
| `getPromiseCluster` | Read one local cluster | No | Reviewed local cluster data |
| `getCurrentJourney` | Read current journey | Yes | Prompt 16 journey memory/context |
| `proposeJourneyAction` | Create a reversible proposal | Yes | Proposal repository; no mutation |
| `getCallingEvidence` | Return TIG indicators and trace | No | Canonical TIG service |
| `buildPrayerOptions` | Build editable prayer aids | No | Deterministic Scripture-grounded template |
| `searchApprovedUserMemory` | Read approved structured memory | Yes | Prompt 16 memory service |
| `summarizeReflectionPattern` | Summarize approved metadata | Yes | Deterministic summary rule |
| `createJournalDraft` | Create session-only draft | No | Deterministic draft rule |
| `createTestimonyDraft` | Create user-review candidate | No | Deterministic draft rule |
| `createMentorDiscussionPrompt` | Create counsel/community prompt | No | Deterministic prompt rule |

Every descriptor also fixes allowed intents, prohibited safety modes, input/output limits, timeout, rate limit, idempotency policy, source requirements, telemetry policy, and implementation version. Every output carries confidence, limitations, source paths, dataset versions, consent scopes when used, latency, result hash, and schema-validated size.

The registry rejects unknown tools. User or retrieved text is always data and never registry configuration. No client component imports this registry, its local datasets, Scripture implementation, TIG traversal, seeds, caches, or memory runtime.

Adding, removing, or changing a tool requires a contract version change, authorization review, source/provenance review, scenario tests, browser tests, and the blocking Teo Guide gate. A live provider is not a tool in this registry.
