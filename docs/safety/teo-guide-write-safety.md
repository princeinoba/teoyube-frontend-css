# Teo Guide write safety

Composition is read-only. No authorized Teo Guide tool performs a state mutation. Draft creation and journey changes are proposals with explicit source, owner, expiry, revision, reversibility, undo policy, and confirmation flags.

Confirmation is a separate authenticated request and is never inferred from continued conversation. It revalidates session, CSRF, safety, purpose, consent, ownership, source presence, expected revision, and idempotency. Expired, stale, replayed-under-a-new-key, anonymous, cross-user, unconsented, or unsourced proposals fail closed.

Prompt 18 confirmation performs no durable write. It cannot save memory, advance a journey, accept an assignment, save/publish testimony, mark fulfillment, determine calling, save a Book entry, contact another person, delete data, or revoke consent. Those actions remain owned by existing capability services and later owner authorization.

Calling declarations, automatic testimony, automatic fulfillment, and automatic divine attribution remain prohibited even with confirmation.
