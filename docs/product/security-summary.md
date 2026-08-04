# Security summary

## Current decision

Security score: **7.1/10**. Gate C Preview is **BLOCKED**; Gate C Production is **CLOSED**.

## Demonstrated controls

- Production dependency audit evidence reports **0 critical / 0 high**.
- Full-tree development audit evidence reports **0 critical / 9 high**, all mapped to one brace-expansion advisory through active lint/CI tooling.
- Server-authoritative sessions, expiry, rotation, sign-out, CSRF checks, role checks, anti-enumeration, and cross-user isolation pass focused tests.
- Sensitive approved memory uses authenticated ciphertext with key versions; wrong keys fail closed.
- Consent revocation, retention, export, record/account deletion, idempotency, and optimistic concurrency are executable.
- Retrieval deletion/revocation and cross-user leakage checks report zero leakage.
- Privacy-safe observability rejects prohibited/private fields and isolates exporter failure.
- Live AI and vector retrieval have server-only adapters, default-off flags, strict outputs, bounded inputs, and kill switches.

## Current blockers

1. **GHSA-mh99-v99m-4gvg / CVE-2026-14257:** nine high development findings; no waiver; no supported safe fix identified at the unchanged lockfile.
2. **Stale release evidence:** the current verifier reports 1,087 failures against the ff925572 source manifest, including two hash mismatches and 1,083 lineage items.
3. **Production controls unproved:** managed identity, KMS, production database/vector service, distributed rate limiting, backups/restores, operator access, telemetry export, and incident practice are absent or local/test only.
4. **No stabilization or real-user safety evidence.**

The current release validator's coarse `protected_visual_or_baseline_diff` does not demonstrate immutable baseline drift. `npm run recovery:verify` independently passes protected source, the 72 immutable screenshots, 12 DOM snapshots, and owner-approved support contracts. The release bundle still must be regenerated under authorization before release.

## Required security exit criteria

- Zero current critical/high findings in the release-relevant full tree, or a separate owner-approved, time-bounded exception with compensating controls and expiry.
- Current-source Gate C lineage and artifact hashes pass.
- Independent review of production identity, authorization, key management, isolation, logs, backups, deletion, rate limits, and incident procedures.
- Restore, revocation, cross-tenant, wrong-key, prompt-injection, provider-outage, and kill-switch drills pass.
- No public deployment until Gate C Production is explicitly opened.
