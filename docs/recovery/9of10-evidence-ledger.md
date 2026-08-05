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

## Phase 4A update

| Evidence | Current Phase 4A identity/result |
| --- | --- |
| Starting/design commit/tag | `32933458e6695b851d3e05a67a4b052047f279f7`; `9ab9b8bf999783a87b81a86a07e6553bd7eaa18b`; `teoyube-9of10-phase4a-start-3293345` |
| Package | 15/15 deliverables; 12 research questions; 15 synthetic tasks |
| Owner decision | `APPROVED`; response choice `1`; no separate approval ID; 15/15 decision fields approved as recommended |
| Phase state | Phase 4A `PASS`; Phase 4B `READY` and not started; Phase 2A `BLOCKED`; Phase 3 `WAITING_OWNER` |
| Participant evidence | 0 participants; 0 sessions; 0 records; 0 fabricated results |
| Privacy/instrumentation/paid calls | PASS / 0 / 0 |
| Runtime/recovery | PASS / PASS; 72 screenshots and 12 DOM snapshots unchanged |
| Phase 4A reports | Markdown `548a8b576c57982fbbdfaa07b220b84042cd54b5576a055d5d25edfc156ddbf2`; JSON `1e31dafb0f1983ad24df1ef2ab814483e2ed2d8befb34b652ce2c8ff2ea19d21` |
| Product/protected/baseline/package changes | 0 / 0 / 0 / 0 |

### Phase 4A artifact hashes

| Path | SHA-256 |
| --- | --- |
| `docs/research/phase-4a-starting-manifest.json` | `9f6abbf8529d1c3968cf34b55708ccbc08e51a56c29fc3665055c18c7bb9a127` |
| `docs/research/pilot-protocol.md` | `8af0ab090a4a6addf81788eaf0a495422f9c4c930ca6b57910c6ffc7013bee9d` |
| `docs/research/participant-consent.md` | `3db4ecc3debb3b2b13c73b183a2c113e55c6145cf413c0f0ac45b7ec4e09021f` |
| `docs/research/recruitment-screen.md` | `19c048f882680699f627756dc09dab190f08149512829e499d00b7cb81685c2c` |
| `docs/research/task-guide.md` | `3d6ff54ddbaf3c18688246c117ef67e248b9a719eeea1e33c493930aa5b7253c` |
| `docs/research/interview-guide.md` | `1d78952abbdeb9d9d450b5aa57d3e281361bc90e8ac97ccb4e6fac2e9188c165` |
| `docs/research/accessibility-guide.md` | `26710a748dc9883b74c79bcc6a9f1d9a7a3a8e544806eae104e3ef78f8d17b1d` |
| `docs/research/adverse-event-protocol.md` | `f48ed7f1391d958301ab0b2a4df7a9b662ae914534358ddd5d59025b3e6d3d93` |
| `docs/research/anonymization-policy.md` | `5fe39a56c053e82cebc5389fd1f009f3913bb75d2eb372efe063359c3cb018de` |
| `docs/research/analysis-plan.md` | `b9cb95d7137c6f9c31a4f377c07b691f9243f91236785cbfa52012488ae05101` |
| `docs/research/data-dictionary.md` | `6d6cb317b10a7d883c9199ce49daa4061c3c26a53cf9f77ab5eecf5693f28daf` |
| `docs/research/pilot-decision.md` | `e3599dc2fa4baa9b4071ec37091bcfea059f1ea5b01bb3d13f14faff8bf4feee` |
| `docs/research/pilot-decision.json` | `997c2d56a460cef81eada422faf76704532b018d78e4e6951e2bb9d17622eefb` |
| `docs/recovery/9of10-phase-4a-pilot-design-report.md` | `548a8b576c57982fbbdfaa07b220b84042cd54b5576a055d5d25edfc156ddbf2` |
| `docs/recovery/9of10-phase-4a-pilot-design-report.json` | `1e31dafb0f1983ad24df1ef2ab814483e2ed2d8befb34b652ce2c8ff2ea19d21` |

No participant, contact, recording, instrumentation, product, visual, package, baseline, or paid-call artifact was created. Phase 4B requires a separate explicit task.
## Phase 4B update

| Evidence | Current Phase 4B identity/result |
| --- | --- |
| Starting commit/tag | `24cbea9965daf998c31ba73e52a3948d53701e26`; `teoyube-9of10-phase4b-start-24cbea9` |
| Instrumentation commit | `79bcfbc9e754aeb56beebe697a6cb5e7b77d1909` |
| Test/security commit | `45a6b6138eae95be8b180c09a533ddda306ef5b0` |
| Documentation/final commit | `FINAL_PHASE4B_DOCUMENTATION_COMMIT_REPORTED_IN_FINAL_HANDOFF` |
| Registry / study | `teoyube-research-events-2026-08-04.1`, 66 events; `teoyube-formative-pilot-2026-08-04.1` |
| Checked-in mode / actual data | `false`; 0 participants, 0 sessions, 0 actual records, 0 local event files |
| Synthetic tests | PASS, 44/44; integration 101/101; full unit 361 passed and 1 intentional skip under serialized execution |
| Privacy/isolation/deletion/export | PASS; prohibited data fails closed; no raw content; cohort separation preserved |
| Encrypted write measurement | 3.576 ms; 1,558 bytes for one synthetic event |
| Build/security/runtime/recovery | PASS; 18 security controls; 490 supply-chain components; 72 screenshots and 12 DOM snapshots unchanged |
| Browser | PASS under serialized execution plus one isolated unchanged retry; default 12-worker run retained as load-flaky evidence; no threshold changed |
| Runtime identity | `c84514e0cdccd7ed13e24f7e9515d0c532bf9c77dfd037ae587e2310f7f2a832`; `teoyube-c84514e0cdccd7ed13e24f7e` |
| Package / lockfile | `package.json` scripts added / lockfile unchanged at `ae274247a9e4e65d1f28466eada2f7b0d39d9118f35d204ab5717d8850885b83` |
| Product/protected/CSS/DOM/assets/baselines/paid calls | 0 / 0 / 0 / 0 / 0 / 0 / 0 |
| Phase state | 2A BLOCKED; 3 WAITING_OWNER; 4A PASS; 4B PASS; 4C READY and NOT STARTED |

### Phase 4B artifact hashes

| Path | SHA-256 |
| --- | --- |
| `config/research-event-registry.json` | `efd1c7d9ecb1fef950117951c8fbf6f2ce5f920ebcccae45609d2cc626d091fc` |
| `config/research-field-policy.json` | `984432da11e8bb4bb407f24602d4941c855aa9963bf1dcda51bee72c2678490f` |
| `config/research-study-registry.json` | `5b94086e2da0a677a2bc3be7b228e896b41f392ef23f479678fbeaa71f8dcfe3` |
| `docs/research/phase-4b-starting-manifest.json` | `b1ef43af83a27b186be178887506d4893b24b235b72e103741a04de31097a395` |
| `docs/research/instrumentation-architecture.md` | `96c9eff6ede5e205b73f7d885f4e6586349b9d5247fb25713cd9ad3f218d7688` |
| `docs/research/research-event-registry.md` | `2cbb123986974b70a64b2473540d4cf2e147e01e54fa0ce883d2292642a22fcb` |
| `docs/research/research-data-dictionary.md` | `3904a19a9c01bafb5a00a954a350882a4f2d03e2995400fb818a88454fb1507d` |
| `docs/research/research-consent-purposes.md` | `d060e398d16f427c2ab2b1d91343159a55d3163f8b27af0b06f12db2c67f379e` |
| `docs/research/research-session-envelope.md` | `229f3e9dd6c62aab3a38c0419d5ad30f79fc9ef6e1c45f243c4bb51b8e244251` |
| `docs/research/research-retention-and-deletion.md` | `2c0d4ca6206154e320ddff9b58c2d446afce96216c3371638dbbefdc099346a9` |
| `docs/research/research-operator-guide.md` | `9ef8511e917fd073a9db8fb6b5fd03c236a372ffb62e14879c18524dd97f77a3` |
| `docs/research/research-export-format.md` | `caddc330ab067ecd104430ccdb700ca33b3089a3f269dfd3a59de6e57a7c9be5` |
| `docs/research/research-instrumentation-security.md` | `c451e34fe77484b079bea50df2a4fd8915ec8b15388aef7c98340cc1f3af6037` |
| `docs/research/research-instrumentation-acceptance.md` | `a31ac0c4f6dfd5a8fcdc4c87e644b65ad203a5173f2266453df312ca94b69628` |
| `docs/recovery/9of10-phase-4b-research-instrumentation-report.md` | `9301f6b5553f8d55ad96ff159d23042851e7e0fbc619a2fc1e8a780c0bd465aa` |
| `docs/recovery/9of10-phase-4b-research-instrumentation-report.json` | `7ef6f14e1a4322e742de2ae8a1ad89c4cba86ad7252ed0a21584a7009cf158d9` |

Phase 4B created no participant/contact/recording/event export, no UI route, no external analytics integration, and no paid-call artifact. Phase 4C requires a separate explicit owner start.

## Phase 4C update

| Evidence | Current Phase 4C identity/result |
| --- | --- |
| Starting commit/tag | `d58fa5c5de4069beff84e3281d49b5e5b6192295`; `teoyube-9of10-phase4c-start-d58fa5c` |
| Operations commit | `66d9adb06409f73a875a453f54caeba1a3817b81` |
| Study/scenarios | `teoyube-formative-pilot-2026-01`; READY_FOR_OWNER_RECRUITMENT_DECISION; 17 synthetic scenarios |
| Readiness/research tests | PASS 33/33; PASS 77/77 |
| Synthetic drill | PASS; consent, rescue, accessibility, fallback, withdrawal/deletion and reset; zero records after cleanup |
| Security/imports/architecture | PASS; 18 controls, 1,433 import files, 180 boundary files |
| Build/type/lint/runtime/recovery | PASS; Next 58 pages; dual runtime 83 checks; 72 screenshots and 12 DOM snapshots unchanged |
| Runtime identity | `ae07aa13d9eae08969840a1160571c9483362a98d3a634ce13da2621fcac5a75`; `teoyube-ae07aa13d9eae08969840a11` |
| Package/lock | scripts added to package.json; lock unchanged at `ae274247a9e4e65d1f28466eada2f7b0d39d9118f35d204ab5717d8850885b83` |
| Actual participant/contact/session/paid evidence | 0 / 0 / 0 / 0 |
| Product/protected/CSS/DOM/assets/baselines | 0 / 0 / 0 / 0 / 0 / 0 |
| Phase state | 4C WAITING_OWNER; recruitment PENDING; Phase 4 IN_PROGRESS; Phase 4D NOT READY |

No owner recruitment approval was prefilled. No real participant or session artifact was created. The full 216-cell gate was not required because Phase 4C changed no product, client, visual, route, or performance code.
