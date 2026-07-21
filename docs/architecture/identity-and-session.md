# Identity and Session Boundary

Prompt 16 adds a provider-neutral identity boundary to the Next preview. The static runtime remains canonical and has no identity or database dependency.

## Selected approach

- `IdentityProvider` authenticates a credential into an opaque subject and role.
- `SessionRepository` issues 256-bit opaque tokens, stores only peppered SHA-256 token and CSRF hashes, and resolves the user server-side.
- Session cookies are `HttpOnly`, `SameSite=Strict`, scoped to `/`, expiring, and `Secure` in production. A separate non-bearer CSRF cookie supplies the custom request header after reload.
- Rotation invalidates the old server record before issuing a new token. Sign-out invalidates the session and clears both cookies.
- Every state-changing memory and consent route checks same-origin and session-bound CSRF. No request body or query user ID participates in authorization.
- Owner, admin, and development routes are independently protected by `src/proxy.ts` when the durable subsystem is enabled; ordinary users receive the same non-enumerating `404` response.

## Local/test versus production

`LocalDevelopmentIdentityProvider` is deliberately limited to development and test. Credentials and deterministic seed identities must be supplied through server-only environment configuration. It implements real user/session separation but is not a password store and is not a production identity provider.

When `NODE_ENV=production`, local identity returns disabled. `production_provider` is reserved but not connected. Production deployment therefore requires an owner-selected OIDC/OAuth provider with maintained Next support, account recovery, MFA policy, abuse controls, and operational key management. Prompt 16 does not claim that dependency is complete.

## Session policy

- Default local/test expiry: eight hours.
- Expired, rotated, signed-out, or deleted-account sessions resolve to unauthenticated.
- Database leakage does not reveal usable session or CSRF tokens.
- Account deletion invalidates every session for that user.
- Authentication errors do not distinguish an unknown account from a bad credential.

## Environment

All of the following are server-only: `TEOYUBE_MEMORY_DATABASE_PATH`, `TEOYUBE_MEMORY_ENCRYPTION_KEYS`, `TEOYUBE_MEMORY_ACTIVE_KEY_VERSION`, `TEOYUBE_SESSION_PEPPER`, and `TEOYUBE_LOCAL_IDENTITY_CREDENTIALS`. The feature is off unless `TEOYUBE_ENABLE_DURABLE_MEMORY=true`. No value is returned by health output.
