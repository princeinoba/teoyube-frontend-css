# ADR 0016: Local Relational Consent Memory

Status: Accepted for Prompt 16 local/test preview only.

Decision: use provider-neutral domain repositories with Node's server-only SQLite binding, an append-only consent ledger, server-authoritative opaque sessions, and AES-256-GCM Class 3 envelopes. Keep production adapters disabled until the owner configures maintained identity, relational hosting, and KMS.

Consequences: deterministic tests can exercise transactions, constraints, migrations, cross-user authorization, cross-browser continuity, revocation, export, and deletion without cloud credentials. SQLite and in-process rate/export coordination are not claims of horizontal or multi-region readiness. The static runtime stays independent and canonical.

Rejected: localStorage/IndexedDB (not server-authoritative or suitable for sensitive ownership), unencrypted JSON files (no relational constraints or Class 3 protection), a custom password system (forbidden and unsafe), and immediate cloud services (no owner configuration or flag).
