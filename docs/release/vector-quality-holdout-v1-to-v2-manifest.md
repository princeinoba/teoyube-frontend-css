# Vector Quality Holdout V1 to V2 Change Manifest

Authorization: `TEOYUBE-AUG21-VECTOR-HOLDOUT-V2-2026-08-09-001`

V1 `079327d48457a86eb98887883656b1aa6b29469d3abd54a52cf7c676ffca5d12` is preserved as historical evidence and marked **INVALID_AS_ACTIVATION_GATE**. Its full 2.17 MB result remains local and ignored with SHA-256 `649285f0571198a2518b468ea688897621d1785a76c59d488358d9f16c967d45`; the repository stores a compact result summary.

V2 `3e84e225d5fe4faa84f8ade8bbca2e49c4c6d0bcb914584f5f459707f6c2d4f5` contains 35 cases and was created from clean base `6a2b50e3f16564a2bfc6fdeda17946c12bcc2e1c` before remediation source changes.

## Exact changes

- holdout-para-01: `web:1CO.13.4` -> `web:1-corinthians.13.4`; query and rank requirement unchanged.
- holdout-para-03: `web:JAS.1.5` -> `web:james.1.5`; query and rank requirement unchanged.
- holdout-para-12: query and unsupported ID retained; classified `UNSUPPORTED_BY_AUTHORIZED_VECTOR_CORPUS` with deterministic abstention and zero provider calls required.
- holdout-para-13: added comparable indexed Lexicon case for `lexicon:wisdora`.

## Genuine failures retained unchanged

- holdout-para-02: rank 51 Scripture case; query and expected result unchanged.
- holdout-para-04: rank 51 Scripture case; query and expected result unchanged.
- holdout-para-08: rank 24 Canon case; query and expected result unchanged.

Expected IDs are evaluation-only and are not imported by Production ranking code. Corpus expansion and re-embedding remain unauthorized.
