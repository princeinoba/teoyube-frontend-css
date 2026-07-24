# Release security gate

`npm run release:security:gate` creates
`artifacts/release/security-gate.json` and fails for a critical or high
unresolved result.

The machine-readable gate verifies:

- all 31 API routes are classified in `config/api-security-registry.json`;
- durable routes declare authentication, authorization, strict schema,
  content-type, limits, request-forgery controls, rate limits, and idempotency;
- server-authoritative sessions, rotation, expiry, ownership, and cross-user
  denial tests exist;
- consent, encryption, export, deletion, and revocation critical contracts
  execute;
- API keys and storage/encryption configuration stay server-only;
- tracked source, Git history, build output, client chunks, events, traces, and
  evidence contain no recognized secret or private-content pattern;
- security headers match `config/security-headers.json`;
- live AI and retrieval keep strict tools, strict outputs, source validation,
  trust/consent filters, deletion propagation, and deterministic fallback;
- critical contract and fault-injection policies are complete.

Request IDs, JSON content-type enforcement, the 64 KiB API body limit,
unknown-field rejection, bounded result sets, sanitized errors, safe session
cookies, and route-specific rate limits are enforced at the existing request
boundaries. The rate limiter is process-local for preview; a production
distributed limiter is a Gate C-Production dependency.

CSP remains Report-Only during preview diagnosis to avoid breaking protected
media or the approved interface. HSTS is emitted only in production
configuration. Neither setting is evidence of a production deployment.

