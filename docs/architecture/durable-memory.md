# Durable Memory Architecture

Teoyube memory preserves explicit evidence and user choices; it does not turn TIG or devotional interpretation into facts. Session-only use remains the default and continues when durable memory is disabled or consent is absent.

## Four layers

| Layer | Behavior |
| --- | --- |
| Session | Ephemeral React/server request state. No durable write is implied by entry. |
| Episodic | User-approved event, milestone, prayer, reflection, or testimony material under its exact purpose. |
| Semantic preference | Explicit low-sensitivity choices such as WEB translation or response length. No inference from private text. |
| Journey state | Stage, status, WEB citations, TIG references, confidence, limitations, transitions, revisions, and undo depth without private edits. |

`UserMemoryService` is the only application write boundary. It validates layer/sensitivity/purpose compatibility, effective consent and scope, explicit approval, size and count limits, retention, ownership, and prohibited deterministic conclusions. TIG has no repository dependency. `TeoGuideAuthorizedMemoryReader` exposes a read method only and is restricted to authorized structured purposes.

Journey continuity is created by `createJourneyContinuityMemory`. It preserves exact `ScriptureCitation` objects, TIG trace IDs, source references, status, transition and reversible revision metadata. It deliberately stores edit counts rather than private edit text under ordinary journey consent. Private text requires the separate sensitive purpose.

## User control

The approved Settings grid conditionally mounts `ConsentAwareMemoryControls` only when the feature is available. With the feature off it renders no DOM, preserving the owner-approved default. Authenticated states reuse the existing panel, mini-card, input, button, status, activity-list, and export-box patterns for grant/revoke, overview, provenance, dates, retention, edit, record deletion, sensitive deletion, export, sign-out, and account deletion.

## Limits

- List page: 100 records.
- Export: 5,000 records or 2 MiB.
- Sensitive content: 20 KiB per record.
- Episodic records: 500 per user.
- Consent history: 100 events per response.
- API body: 64 KiB.
- Request rate: 60 per minute per pseudonymous session/network key.
- Concurrent exports: one per user per process.

These are defense-in-depth local limits, not production distributed rate limiting.
