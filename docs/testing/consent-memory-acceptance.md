# Consent and Memory Acceptance Evidence

Focused unit coverage is in `tests/build-foundation/consent-aware-memory.test.ts`. It verifies classification, migrations, foreign keys, identity/session lifecycle, CSRF, roles, cross-user isolation, cross-session resume, default-off and purpose-separated consent, expiry, sensitive approval and AEAD, wrong keys, transactional revocation, rollback, optimistic concurrency, idempotency, export isolation, deletion, exact WEB/TIG/journey provenance, spiritual safety, Teo Guide read-only access, log safety, and p50/p95 local latency.

`tests/e2e-memory/consent-memory.spec.ts` starts a dedicated development preview with a disposable SQLite file and external test key. Independent browser contexts sign in as the same subject and resume preference and journey state; another subject sees no records. It also verifies consent-off sensitive use, explicit sensitive storage, revocation, same-origin/CSRF, ignored user-ID injection, and owner-only route protection.

`npm run memory:security:verify` statically rejects client-trusted user IDs, public secret names, raw boundary loggers, browser-authoritative stores, client imports of server memory internals, and Teo Guide writes.

The dedicated runner owns port 3116, terminates the complete Windows process tree, and deletes its database and Playwright output. It does not touch immutable or owner-approved baselines.
