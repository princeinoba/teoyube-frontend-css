# Data Storage and Migrations

Prompt 16 uses Node's server-only SQLite binding for deterministic local/test proof. The database is relational, transactional, foreign-key constrained, indexed, and isolated behind `MemoryRepository`, `ConsentLedger`, and `SessionRepository`. Database files, WAL files, temporary exports, and owner inputs are ignored by Git.

## Migrations

1. `001_identity_consent_memory.sql`: users, sessions, append-only consent events, consent projection, memories, deletion status, export audit, constraints, and ownership indexes.
2. `002_retention_indexes.sql`: expiry, history, and deletion-status indexes.

Migrations run forward in `BEGIN IMMEDIATE` transactions and are recorded in `schema_migrations`. Tests verify both versions, foreign keys, unique constraints, indexes, rollback, and optimistic `version` conflicts.

Every memory query includes `user_id`; knowing a record ID never authorizes access. Sensitive rows contain ciphertext, nonce, authentication tag, and key version, with a check constraint forbidding plaintext JSON beside Class 3 ciphertext. Non-sensitive rows contain structured JSON.

## Production dependency

SQLite is appropriate for local deterministic proof and a single-node preview. Prompt 16 does not claim multi-region, horizontal-write, managed backup, high-availability, or distributed rate-limit readiness. A production adapter requires an owner-selected managed relational database, migration deployment/rollback procedures, encrypted backups, regional and retention policy, connection pooling, disaster recovery tests, and a managed identity provider. Repository contracts remain stable for that adapter.
