# Prompt 16 Consent-Aware Continuity Report

Date: 2026-07-21  
Branch: `recovery/visual-source-of-truth`  
Starting commit: `28be4450323f0b485aaa8f25de454d559e6b8d82`  
Final implementation commit: `af0564a`  
Report commit: the commit containing this report  
Prompt 16 result: **PASS**  
Prompt 17 unlocked: **YES**

## Focused commits

1. `577bf8f` — `feat(memory): add classified encrypted relational storage`
2. `69e87ef` — `feat(identity): add server-authoritative preview sessions`
3. `397254c` — `feat(consent): add user-owned continuity services`
4. `451e09e` — `test(security): verify isolation consent and revocation`
5. `af0564a` — `docs(privacy): document consent-aware user memory`

## Change inventory

- Identity/session: `src/domain/identity/**`, `src/server/identity/**`, four identity API routes, and `src/proxy.ts`.
- Classification/contracts/storage: `src/domain/memory/**`, `src/server/memory/**`, two SQL migrations, server environment/config updates, and ignored local DB/export paths.
- Consent/memory application: `src/features/memory/application/user-memory-service.ts`, consent/memory/export/account-deletion API routes, safe HTTP helpers, and privacy-safe event contracts.
- Product continuity: journey continuity adapter, read-only Teo Guide authorized-memory reader, and authenticated-only controls behind the existing approved Consent panel.
- Verification: `tests/build-foundation/consent-aware-memory.test.ts`, `tests/e2e-memory/consent-memory.spec.ts`, dedicated Playwright config/runner, and `verifyConsentMemoryBoundaries.cjs`.
- Documentation: five architecture/ADR files, five privacy files, the threat model, acceptance guide, and migration ledger.
- Build policy: `package.json`, `tsconfig.next.json`, `.gitignore`, and `src/config/environment.ts`.

No static HTML, protected CSS, original JavaScript template, public/owner asset, immutable screenshot/DOM artifact, owner-approved support artifact, or Scripture content-delta artifact changed.

## Required report fields

| Field | Result |
| --- | --- |
| Protected visual files changed | **0** |
| Immutable static baselines changed | **0** |
| Owner-approved support baselines changed | **0** |
| Owner-approved Scripture-delta artifacts changed | **0** |
| Identity/session approach | Provider-neutral `IdentityProvider` plus server-authoritative opaque sessions. Cookie token and CSRF values are random; only peppered hashes are stored. Expiry, rotation, sign-out, invalidation, same-origin/CSRF, role checks, and account-wide session invalidation pass. |
| Production vs local/test | Local/test identity is real server-separated but explicitly non-production. Production identity stays disabled until an owner-configured maintained OIDC/OAuth provider exists. |
| Persistence technology | Server-only Node SQLite behind `MemoryRepository`, `ConsentLedger`, and `SessionRepository`; transactions, foreign keys, uniqueness, indexes, ownership predicates, and optimistic versions. |
| Migration count | **2** forward migrations, verified in `schema_migrations`. |
| Data classification | **PASS** — five executable classes with purpose, persistence, consent, storage, encryption, log, retention, export, deletion, sharing, model, and analytics policy. |
| Memory layers | **PASS** — session, episodic, semantic preference, and structured journey state are typed and distinct. |
| Consent ledger | **PASS** — append-only, purpose/scoped, policy-versioned, hash-chained event history with effective projection and transactional revoke/expire. |
| Purpose registry | Four default-off purposes: preference, journey, sensitive spiritual content, and testimony/Book continuity. |
| Low-sensitivity preference persistence | **PASS** — explicit WEB preference resumes for the same user in a second independent browser context. |
| Journey continuity | **PASS** — current stage, statuses, transitions, undo depth, exact WEB citation metadata, TIG IDs, confidence, limitations, and revisions resume cross-context without private edits or silent advancement. |
| Sensitive-content consent | **PASS** — durable write is denied without both purpose consent and explicit record approval; session-only product behavior remains available. |
| Encryption | **PASS** — AES-256-GCM, 12-byte nonce, AAD bound to owner/record/purpose, authentication tag, ciphertext-only Class 3 row, and key version. Wrong keys fail safely. |
| Key management | Development/test key ring is supplied server-side. Old-version read plus active-version rewrite passes. Production KMS/HSM, rotation ceremony, and emergency key revocation remain deployment dependencies. |
| Revocation | **PASS** — event, projection, purpose-record revocation, and ciphertext destruction are one immediate transaction; future read/write returns denied. |
| Export | **PASS** — human-readable schema `1.0.0`, provenance/history/timestamps, owner-only records, no session, ciphertext envelope, key, DB value, or other-user content. |
| Deletion | **PASS** — record, purpose, all-sensitive, and account workflows; idempotent status; ciphertext and active rows removed; no indexes/embeddings/queues/attachments/caches exist. |
| Cross-user isolation | **PASS** — record IDs, query/body user IDs, and exports cannot cross the repository ownership boundary. |
| No-sensitive-log | **PASS** — allowlisted pseudonymous operational events only; static verifier rejects raw boundary loggers. |
| No browser-authoritative sensitive store | **PASS** — no localStorage, sessionStorage, IndexedDB, bearer token storage, or client database. |
| TIG | **PASS** — deterministic/read-only; no seed/traversal client import and no memory mutation method. |
| Prompt 13 | **PASS** — focused unit regression and 5-test production e2e, including Today-to-Tomorrow flow. |
| Scripture | **PASS** — WEB 66/1,189/31,103/31,098, 356/356 references, corpus and lexical checksums, citation/quotation boundaries, and 300 delta artifacts. |
| Teo Guide memory boundary | **PASS** — typed authorized structured-memory reader only; no write method, raw private read, live model, or silent save. |
| Visual parity | **PASS** — 35 retained-route tests; every approved route/viewport and interaction passed. Static reproducibility: 72 screenshots and 12 DOM snapshots; max perceptual 9.519%, max regional 30.409%, temporary candidates deleted. |
| Accessibility/focus | **PASS parity** — all 72 cells, zero new mismatch; this remains parity evidence rather than full WCAG conformance. |
| Security | **PASS** — session lifecycle, CSRF/same-origin, role route protection, user isolation, consent bypass, wrong key, revocation, deletion, exports, limits, and static source boundary checks. |
| Static runtime | **CANONICAL** — `npm start` remains `node --preserve-symlinks-main server.js`; fresh HTTP 200 contained the static title and no `__next` payload. |
| Next runtime | **PREVIEW ONLY** — no cutover. Durable memory is disabled unless an explicit server flag and complete local/test configuration are present. |

## Tests and performance

- Focused security/domain tests: **21/21 PASS**.
- Full unit suite after implementation: **17 files / 106 tests PASS**.
- Ordinary fresh production e2e: **5/5 PASS**.
- Dedicated multi-context continuity/security e2e: **3/3 PASS**, with server tree, SQLite file, browser output, and temporary exports removed.
- Support baseline replay: **5/5 PASS** across 54 default and 16 interaction captures.
- Complete retained-route browser parity: **35/35 PASS** in 25.1 minutes.
- Accessibility/focus/performance audit: **72/72 cells PASS** in 13.9 minutes.

Local in-memory relational performance, milliseconds:

| Operation | p50 | p95 |
| --- | ---: | ---: |
| Authenticated session issue | 0.048 | 0.091 |
| Consent update | 0.148 | 0.243 |
| Journey save | 0.104 | 0.221 |
| Journey resume | 0.562 | 0.755 |
| Memory list | 0.565 | 0.678 |
| Export generation | 0.324 | 0.587 |
| Create plus deletion | 0.195 | 3.897 |
| Sensitive encryption/write | 0.351 | 0.726 |

These are deterministic local evidence, not network, multi-region, or production SLO claims. Browser API timings also passed without weakening authorization or encryption.

## Verification commands

| Command/evidence | Result |
| --- | --- |
| `npm run recovery:verify` | **PASS** after work: visual, support, TIG, Scripture, imports, and architecture. |
| `npm run app:build` under supported Node 24 | **PASS**, including TIG and Scripture client-bundle verifiers. |
| `npm run typecheck` | **PASS**. |
| `npm run lint` and `npm run lint:memory` | **PASS**, zero warnings. |
| `npm run test` | **PASS**. |
| `npm run test:e2e` | **PASS**. |
| `npm run test:memory:e2e` | **PASS**, cleanup included. |
| `npm run memory:security:verify` | **PASS**, 21 boundary files. |
| `visual:parity:next` equivalent | **PASS**, 35 tests. |
| `visual:parity:gate:audit` equivalent | **PASS**, 72 cells. |
| `visual:parity:verify` equivalent | **PASS**, 72 screenshots/12 DOM snapshots. |
| Owner-approved Next support replay | **PASS**, 5 browser tests. |

The machine-wide `npm.cmd` is bound to unsupported Node 20.11 and one attempted build correctly failed because `node:sqlite` is unavailable there. The repository already requires Node `>=22.13 <25`. Reinvoking the exact npm scripts with the configured bundled Node 24.14 runtime passed. No engine threshold or persistence boundary was weakened to accommodate the unsupported host executable.

## Known production dependencies and limitations

- Owner-selected maintained production identity, recovery/MFA/abuse policy, and provider-authoritative roles.
- Managed relational deployment, pooling, HA, regional policy, migration operations, encrypted backups, restore tests, and backup deletion window.
- Managed KMS/HSM and rotation/emergency-revocation runbook.
- Distributed request rate limiting and export concurrency coordination; current controls are per process.
- SQLite's Node standard-library binding reports experimental status in Node 24 and is approved here only for local/test preview proof.
- No production cloud service, live AI, embedding, RAG, private-memory search, analytics profile, or runtime cutover is claimed.

## Rollback

From the Prompt 16 final report commit, rollback the capability commits in reverse order with non-destructive reverts. The core implementation rollback boundary is:

```text
git revert --no-commit 577bf8f^..af0564a
```

Review the resulting revert and commit it. This does not rewrite history, touch `28be445`, modify the baseline tag, or delete protected evidence.

## Gate conclusion

Every Prompt 16 acceptance criterion passes on the repository-supported Node runtime. Static remains canonical; Next remains preview-only; production identity/database/KMS remain explicitly unconfigured; protected and owner-approved evidence changed by zero. **Prompt 17 unlocked: YES.**
