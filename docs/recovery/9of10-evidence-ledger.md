# Teoyube 9/10 baseline evidence ledger

Machine-readable identities are in [9of10-evidence-ledger.json](9of10-evidence-ledger.json).

## Baseline identities

| Evidence | Locked identity |
| --- | --- |
| Commit | `39e75ee11d765c83c67660cd267315acec124ae9` |
| Tag | `teoyube-prompt24-baseline-39e75ee` |
| Package lock | `1edbad08c15ad46effdca2258278ca4b7159f223bad088fbc792e7a5e57008ef` |
| Runtime digest | `d01fb290dc1117edca9d97512d529e29f6b4d0635ca539a48b45338effb45534` |
| Build ID | `teoyube-d01fb290dc1117edca9d9751` |
| Runtime manifest | `fe378bf7d3d83f85120aaa94a522e87241a6c318ab56cd35ced211363fb78a19` |
| Release manifest | `0b7c530736b21778cfdbfadd02f49ba29dded7c82752f9a1ca3b6e3508857a47` |
| Current release validation | `3268f1f0ad6fb1f481929582d39b3f84bb14b72d035dc8bd2d97a108dddd7365` — BLOCKED, 1,087 failures |
| WEB corpus | `6e6b3f95b5d61c83c06534ee4281f10b6e4e02c878b75141dcdd4403bf42d77f` |
| WEB lexical index | `544b67548c04a36e2445fa6601f07f6cdb7b8d044ae2691591629609b2eeeeb2` |
| TIG | dataset `teoyube-local-dataset-2026-07-20.1`; rules `teoyube-deterministic-ruleset-2026-07-20.1` |
| Safety | policy `teoyube-safety-policy-1.0.0`; artifact `65943d102556d1af6e009621c99189fbccda0f881ceb2b67c62865a68f2f03dd` |
| Teo Guide | orchestration `teo-guide-orchestration-2026-07-22.1` |
| Retrieval | 33,563 chunks; manifest `338fc9009d4eb9177103a57f03443d7716aef52b374f91632248875f7a1f0ea3` |
| Protected visual source | `7e588086fdef89d2074dd36f7af57b64645f31778f1027043e67e0fc14596117` |
| Immutable visual baseline | `9fde44ca68f0eb9f9a2b2871f6d10102b53090d5194d6d04c5375c57b75e6e5b` |
| Owner support baseline | `9b8492f83366400a2a846e9713f64e2c2bb8e0a8a46c1263449fb01a82937283` |
| Scripture delta contract | `dcc20e9ae265a1e0777daaf4bfbd6e294fc1d6e40a7d49696c861e33e8f0a064` |
| Prompt 24 scorecard JSON | `fcb62eb682b622e7f9a84d667413358b09832f71ae153f6446328f2a35274a82` |
| Prompt 24 evidence ledger JSON | `28c0950c7525e480f4dba4be809c273c98e4045c5cf3e0a69b4b8c5ae4d82839` |

## Prompt 24 metadata discrepancy

`P24-META-001` is recorded, not rewritten. Prompt 24 used safety value `65943d2578…` when composing dependency hash `92562fd1…`. The authoritative Prompt 17 report, Prompt 17S evidence, Prompt 18 report, and current Gate A execution all use `65943d1025…`. The corrected Phase 1 composite is `95be7e233e322c5c8513e6792229ab58d93cf231384f4838a4c85ef38b565be6`.

This is a metadata lineage correction, not a score change and not a safety regression. Prompt 24 remains immutable historical evidence at its tagged commit.

## Current executable evidence

- Runtime status/contract: PASS.
- Recovery contract: PASS.
- Protected source: 268 files verified.
- Immutable screenshots: 72 verified.
- Desktop DOM snapshots: 12 verified.
- Owner support baselines: PASS.
- TIG direct import and seed contract: PASS.
- Scripture corpus and owner delta: PASS.
- Import scan: 1,433 files, zero missing imports.
- Architecture: 167 files, zero forbidden imports/cycles.
- Safety boundary: PASS.
- Retrieval boundary: 11 partitions, 28 locked cases, zero client seed/traversal imports.
- Gate A: 64/64 PASS.
- Paid calls in Phase 1: zero.

## Live-AI configuration

Checked-in live AI, embeddings, vector retrieval, and broad RAG are false. Gate B operational state is `CLOSED_LIVE_AI_DISABLED`; Gate B Production is closed. Secret files and values were not inspected.
