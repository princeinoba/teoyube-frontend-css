# Research session envelope

The server-issued envelope is a signed, short-lived capability, not an ordinary user ID and not an owner/admin credential.

It contains study, opaque participant, research session, issued-at, expiry, allowed tasks, consent-record IDs, three optional-consent booleans, cohort, issuer, key ID, and nonce. It contains no name, email, contact data, application user ID, secret, product write authority, or raw content.

The Phase 4B issuer permits only `synthetic-*` participant/session IDs for the allowlisted synthetic study. Maximum lifetime is two hours. HMAC-SHA-256 protects integrity; signature comparison is constant-time. Verification rejects malformed, forged, expired, revoked, unknown-study, cross-study, non-synthetic, and arbitrary-task envelopes.

The token is accepted only by server research services. It is never persisted in an event, printed by normal UI, embedded in markup, or accepted as a general session token. Revocation is immediate for the running operator process; effective consent is rechecked independently for every event.
