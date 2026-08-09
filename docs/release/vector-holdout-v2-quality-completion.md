# Teoyube locked holdout V2 quality completion

Authorization: `TEOYUBE-AUG21-VECTOR-HOLDOUT-V2-2026-08-09-001`

## Outcome

Vector quality is **PASS** and activation readiness is **QUALITY_PASS**. Public Production activation remains **NOT AUTHORIZED**. The work is preserved as a local review checkpoint because two non-quality delivery gates remain blocked; no push, Preview, promotion, Production flag change, or Production redeployment occurred.

## Preserved evidence

- V1 safety reference: `safety/vector-holdout-v1-98722ac` at `98722ac12c18fdefdc2db1a8b3a57633d51d608c`
- V1 dataset SHA-256: `079327d48457a86eb98887883656b1aa6b29469d3abd54a52cf7c676ffca5d12`
- V2 lock commit: `1a31e6d4c600a1b93fe462ce424c335172eb0142`
- V2 dataset SHA-256: `3e84e225d5fe4faa84f8ade8bbca2e49c4c6d0bcb914584f5f459707f6c2d4f5`
- V2 provider result SHA-256: `b032d869590090defd576e330b20000bf50b709c6c2a269a5344f756a6ab65f9`
- Complete change manifest: `docs/release/vector-quality-holdout-v1-to-v2-manifest.{json,md}`

The genuine failures were retained and resolved generically: holdout-para-02 is rank 1, holdout-para-04 is rank 2, and holdout-para-08 is rank 1.

## Quality results

- Diagnostic: 42/43 cases, metric-based PASS, paraphrase recall@5 95%, all other approved accuracy/safety metrics 100%, p95 387.315 ms on run 1.
- Locked V2: 35/35 cases, paraphrase recall@5 100%, all approved accuracy/safety metrics 100%, p95 1,491.1872 ms on run 1.
- Provider failures/retries/generation calls: 0/0/0.
- Corpus re-embedded: no.
- Authorization query tokens/calls: 604 tokens / 66 calls across the initial blocked attempt and final passing evaluation.
- Authorization additional cost: $0.00001208; cumulative provider cost: $0.04042338.

- Run 1: `6add1cb1b51fa05f07ab38658c74023e309d0a7c6a82407dfa17220a8c46f64d`
- Run 2: `6add1cb1b51fa05f07ab38658c74023e309d0a7c6a82407dfa17220a8c46f64d`
- Run 3: `6add1cb1b51fa05f07ab38658c74023e309d0a7c6a82407dfa17220a8c46f64d`

## Verification

TypeScript, focused lint, 19 retrieval/storage/security tests, production build (58 static pages), dependency audit (0 vulnerabilities), exact WEB corpus, TIG, deterministic Teo Guide (49 tests), prompt/safety orchestration (64 fixtures), client bundle boundaries, and tracked-secret scan passed. Protected visual changes and baseline writes are both zero.

## Remaining delivery blockers

1. The inherited visual verifier reports stale owner-approved runtime and protected-visual identities at the unchanged `6a2b50e` baseline. This authorization forbids changing or regenerating those contracts.
2. The security gate's paid-evidence-reuse control recognizes the older prompt-20 tag, not this new locked V2 provider result. All other security controls pass.

Recommended next step: authorize a separately scoped identity reconciliation and bind this V2 result into the paid-evidence control, then rerun only those two gates before a normal push and unpromoted Preview.
