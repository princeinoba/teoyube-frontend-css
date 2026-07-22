# Teo Guide action-proposal architecture

Action proposals are a separate boundary from tool execution. Tools may create a bounded proposal but cannot mutate Journey, memory, Journal, Testimony, Book, Calling, Promise, consent, or contact state.

Each proposal carries an owner binding when authenticated, source identifiers, safe payload preview, creation and expiry time, expected revision, reversibility, undo policy, and explicit confirmation requirements. An anonymous proposal can be displayed but cannot later be confirmed because it has no authenticated owner binding.

The decision endpoint requires server session identity, same-origin CSRF, effective purpose consent, source presence, Prompt 17 pre-write authorization, proposal ownership, expiry, expected revision, and an idempotency key. The same owner/idempotency key returns the same decision; a different key against a stale revision fails closed. Cross-user lookup and decision return unavailable.

Prompt 18 returns `applicationActionAuthorized` and audit hashes but always `durableWritePerformed: false`. A later owner-authorized application action may consume a confirmed proposal through the capability's existing reversible write service.
