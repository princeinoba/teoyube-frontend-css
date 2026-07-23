# User semantic indexes

User semantic indexing is default-off and separate from durable memory consent.

Every user vector requires:

1. authenticated owner identity;
2. an active `external_ai_embedding_processing` grant with `embedding:process`;
3. an active partition-specific grant;
4. an approved structured record;
5. `rawPrayerOrReflectionTextIncluded=false`;
6. Prompt 16 encryption at rest.

Partition grants:

- journal summary: `user_memory_semantic_index` / `semantic_index:memory`;
- testimony: `user_testimony_semantic_index` / `semantic_index:testimony`;
- journey: `user_journey_semantic_index` / `semantic_index:journey`;
- calling evidence: `user_calling_evidence_semantic_index` / `semantic_index:calling_evidence`.

Raw Class 3 spiritual text and identity/security content are rejected. User query embeddings are not cached. Only locked synthetic owner-evaluation queries use the bounded in-memory query cache.

Search requires the same user ID, all consent-record IDs, and all purpose IDs recorded on the vector. The vector cannot be returned across users, after expiry, after deletion, or after revocation.

No user vectors were created during Prompt 20. The public index and public quality gate contain only reviewed public data.
