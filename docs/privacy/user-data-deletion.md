# User Data Deletion

Users can delete one record, a purpose, all sensitive memory, or the account. Commands use an idempotency key and return a content-free status with counts and completion time.

Purpose revocation is transactional: the ledger event and effective state change commit with record revocation and ciphertext destruction. Record deletion removes the row. Account deletion removes all remaining memory, invalidates sessions, removes projections, and tombstones identity. No full-text indexes, embeddings, queues, attachments, or durable cache derivatives exist in this phase.

The Settings control uses explicit buttons and confirmation for account deletion. There is no spiritual penalty, forced continuation, or dark pattern. Deletion does not claim removal from backups because Prompt 16 has no production backup adapter.
