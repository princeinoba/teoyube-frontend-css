# Teo Guide memory usage

Teo Guide reads memory only through `TeoGuideAuthorizedMemoryReader` and the Prompt 16 memory service. The server resolves identity; a request cannot supply a user ID. Reads require the authenticated owner, effective unexpired purpose consent, an allowed read scope, an active record, and the minimum necessary structured fields.

Revoked, deleted, expired, unavailable, unconsented, anonymous, and cross-user records are not returned. Normal responses continue with a sourced non-personalized fallback and disclose the limitation without revealing whether another record exists.

Conversation metadata is process-session bounded and stores fingerprints/identifiers rather than raw user text. Authenticated records carry an owner hash; inspection and deletion enforce that owner. Prompt 16 remains the durable, encrypted, exportable, deletable, consent-aware continuity owner.

Teo Guide cannot create memory. Reflection summaries are tentative proposals from approved record identifiers and are not mental-health, calling, divine, or hidden-profile facts. Raw prayer, reflection, journal, testimony, crisis, and memory text is excluded from telemetry.
