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
## Phase 2A update

Historical Prompt 24 evidence and discrepancy `P24-META-001` remain unchanged.

| Evidence | Current Phase 2A identity/result |
| --- | --- |
| Starting commit | `a7cc36897f32d9eeee8bbadef15bd47c58689161` |
| Remediation commit | `2981adee6763c112ca677f2f0e11dd5f260722e5` |
| Runtime-binding commit | `7d4906876412304556eab126ca020beaa8cb8c17` |
| Package lock | `ae274247a9e4e65d1f28466eada2f7b0d39d9118f35d204ab5717d8850885b83` |
| Runtime digest/build | `76e58bce731190a3ba3e4950b40c7b3acb333c4bbc5d9eef59870d4348aee563`; `teoyube-76e58bce731190a3ba3e4950` |
| Full/production audit | PASS; 0 vulnerabilities / PASS; 0 vulnerabilities |
| Security/supply chain | PASS, 18 controls / PASS, 490 components |
| Recovery/protected baselines | PASS; 72 screenshots and 12 DOM snapshots unchanged |
| Visual/performance composite | BLOCKED; see Phase 2A report; no baseline or threshold changed |
| Markdown report | `c58e3dd3b9c65a03662e310cdfd5260065e0fbd2967e629949ae2b687fc05583` |
| JSON report | `1c4744d1aac78a1ba974b722857baf390d79f0aedab671eafa16095419e90cd7` |
## Phase 3A update

| Evidence | Current Phase 3A identity/result |
| --- | --- |
| Starting commit/tag | `07c4d7f5ce3166d699b14eb5096a48da8a4e0115`; `teoyube-9of10-phase3a-start-07c4d7f` |
| Toolkit commit | `a03979c70a9a4784448e8b36ac6086d2363f66c7` |
| Policy/toolkit | `teoyube-stabilization-policy-1.0.0`; `teoyube-stabilization-toolkit-1.0.0` |
| Session/incident schemas | `fc975d72d96e5ec65a2d46f611624b442e759e4e7bd35623f100f5c494910d84`; `bc022bc2505b19b8e642fa005ea4453532626d378132c9141252a68e08276f71` |
| Package lock | `ae274247a9e4e65d1f28466eada2f7b0d39d9118f35d204ab5717d8850885b83` — unchanged |
| Runtime digest/build | `489d8fb7054f78304b524c47b3441b5a737a6156952e4d85e997c1f55e47808c`; `teoyube-489d8fb7054f78304b524c47` |
| Synthetic toolkit tests | PASS, 23/23 |
| Phase 3A report hashes | Markdown `fe7b4649373c55079176ab237122538404addf200ac54472fa3f6c88307790f1`; JSON `a201c72ad96447e1ae93de4d5e2ada2945c079bc75626c0f7829f2fcb4d6e8e3` |
| Build/security/runtime/recovery | PASS; security 18 controls; dual-runtime 83 checks; 72 screenshots and 12 DOM snapshots unchanged |
| Current authentic evidence | 0 sessions; 0 days; 0 incidents; coverage NOT STARTED |
| Phase state | Phase 3A PASS; Phase 3 WAITING_OWNER; Phase 3B NOT READY |
| Protected/product/paid changes | 0 / 0 / 0 |

The four Phase 2A blockers remain open and unchanged. The 216-cell gate was not run because Phase 3A changed no product, visual, route, or performance code.
