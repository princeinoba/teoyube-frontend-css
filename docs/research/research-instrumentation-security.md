# Research instrumentation security

## Trust boundaries

- Environment configuration is server-only and defaults off.
- A study must be allowlisted; Phase 4B allows synthetic tests only.
- Participant/session identity comes only from an HMAC-signed server envelope.
- Consent comes from the existing append-only consent ledger and is rechecked per event.
- Event names and fields are closed machine registries.
- Local events are AES-256-GCM encrypted with per-record nonces and associated data.
- Each participant stream is SHA-256 hash chained; duplicates and tampering fail.
- Participant reads are constrained by the verified envelope.

## Data minimization

The event schema has no payload, note, text-input, screenshot, page-content, session-replay, heat-map, fingerprint, or contact field. Unknown/prohibited keys and secret/contact patterns fail before persistence. Ordinary operational telemetry receives only a safe code and booleans; research pseudonyms are not copied into it.

## Failure behavior

Mode off returns before consent, repository, or operational calls. Boundary failures are safe-coded. Unexpected storage or telemetry failures do not break product actions. No external analytics vendor or normal admin route exists.

## Known limits

Phase 4B provides local/staging storage only. It does not authorize production storage, participant recruitment, recordings, actual live-AI study work, contact management, or backup deletion claims. Envelope revocation is process-local; a later production store requires durable revocation before activation.
