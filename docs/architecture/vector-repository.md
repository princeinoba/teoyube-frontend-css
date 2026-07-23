# Vector repository

`VectorRepository` is partition-aware and provider-neutral. Prompt 20 implements it with Node 24 built-in SQLite at ignored path `.var/retrieval/retrieval.sqlite`.

The repository stores:

- vector bytes as Float32 BLOBs for reviewed public sources;
- source, trust, model, dimension, chunker, adapter, checksum, version, language, citation, expiry, and index metadata;
- active index versions per partition;
- encrypted payloads for consent-eligible user summaries.

Public and user records cannot cross the same storage representation. User vector plus approved structured summary content is encrypted with Prompt 16 AES-256-GCM, a versioned key ring, a random nonce, and record-specific additional authenticated data.

Search applies active-version, partition, trust, language, expiry, deletion, owner, consent-record, and purpose filters before ranking. Cross-user records and records missing any current consent ID or purpose are excluded.

Source invalidation, consent revocation, user deletion, account deletion, and compaction are explicit operations. Invalidated records have vector, content, and encrypted payload bytes destroyed before later physical compaction.

The public build activates an index only after all seven public partitions are complete. Rollback deactivates the target and restores the most recent prior version when one exists.
