# Purpose-Scoped Consent Ledger

Consent is an append-only event chain with a current projection. There is no pre-granted state.

Each event stores user, purpose, scope, action, policy version, timestamp, source, prior state, resulting state, monotonic sequence, and a SHA-256 integrity hash chained from the previous event. `(user, purpose, sequence)` is unique. The projection uses optimistic version increments.

Purposes are separate:

- `preference_continuity`
- `journey_continuity`
- `sensitive_spiritual_storage`
- `testimony_book_continuity`

Scopes are explicit (`memory:read`, `memory:write`, `memory:export`, `memory:delete`) and may not be inferred from terms acceptance. Revocation appends its event, updates the projection, revokes every active record for the purpose, destroys sensitive ciphertext, and commits those operations in one immediate transaction. Future reads and writes then fail. A content-free consent history remains inspectable for integrity.

Expiry is projected on access and is enforced before reads or writes. A policy-version change creates another event; it never silently expands an earlier scope. Concurrent sequence or event conflicts roll back without changing the prior effective projection.
