# Prompt 22 final local runtime cutover report

## Branch and commits

Branch: `recovery/visual-source-of-truth`

Starting commit: `d01464743347251cb6fa2af20585c9983c67fe81`

Pre-cutover tag:
`teoyube-before-next-canonical-2026-07-24-d014647`

Candidate cutover commit:
`52ed7e9530e292f60195f7305a8ec9a476bd7367`

Candidate evidence commit:
`7b27e7fbcd4522b66ddd16e4c231ff0a76379514`

Final report commit: this report's commit and the post-cutover tag target; its
exact hash is recorded by Git in the final task handoff.

Post-cutover tag: `teoyube-next-canonical-local-2026-07-24`

Worktree at handoff: clean

## Owner approval

Stage 0 decision: option 1, authorized

Owner decision ID:
`TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`

Final confirmation: option 1, approved at `2026-07-24T21:10:29.582Z`
against candidate evidence commit
`7b27e7fbcd4522b66ddd16e4c231ff0a76379514`

Scope: repository/local canonical runtime only

Production deployment authorized: **NO**

## Runtime commands

| Command | Verified result |
| --- | --- |
| `npm start` | Safe Next production launcher |
| `npm run dev` | Next development runtime |
| `npm run app:start` | Safe explicit Next production launcher |
| `npm run static:start` | Original static Node runtime |
| `npm run rollback:start` | Original static Node runtime |
| `npm run runtime:status` | Secret-safe canonical/rollback metadata |
| `npm run runtime:verify` | Canonical, rollback, route, asset, flag, and owner-decision contract |

## Canonical state

Canonical repository/local runtime: **Next**

Rollback runtime: **protected original static Node**

Gate C-Preview: **PASS**

Gate C-Production: **CLOSED**

Public deployment: **NOT PERFORMED**

Live AI checked-in default: **disabled**

Vector retrieval checked-in default: **disabled**

## Routes

- Retained public routes: 23; passed 23.
- Legacy static/hash mappings: 14; passed 14.
- Canonical redirect: `/compass` to `/calling-compass`; passed.
- Direct deep links, safe query preservation, trailing slashes, refresh, and
  back/forward navigation passed.
- Owner, development, graph, TIG, and other internal routes fail closed with
  404 unless their explicit authorization contract is present.

## Assets and media

- Protected asset URLs, images, icons, SVGs, heroes, backgrounds, thumbnails,
  posters, and TeoyubeWorld media passed.
- Representative media Range, MIME, content length, cache, HEAD,
  Last-Modified/304, not-found, and publication-boundary checks passed.
- Next weak ETag revalidation returns 200; the contracted
  Last-Modified/`If-Modified-Since` path returns 304.
- Publication integrity evidence changed: **NO**.
- The separate historical Phase 11.6C.3 publication-integrity blocker remains
  unchanged and was not weakened.

## Product and API

- Journey: complete Prompt 13 loop and both browser regression tests passed.
- Search and distinct Promise Search: passed.
- Prayer, Calling, and Journal/Testimony/Book flows: passed.
- Memory/consent inspect, revoke, export, delete, and isolation contracts:
  passed.
- Exact WEB Scripture and deterministic TIG: passed.
- Deterministic Teo Guide, guarded live-AI preview contracts, provider
  fallback, and consent gates: passed.
- Hybrid retrieval enabled/disabled and vector-consent-denied contracts:
  passed.
- Health/readiness: secret-safe, deterministic fallback ready, and correctly
  identifies Next local canonical with static rollback.
- API contracts retained: 31.

## Gates

| Gate | Result |
| --- | --- |
| Recovery | PASS |
| Prompt 17 Gate A | PASS, 64/64 |
| Prompt 18 Tool Gate | PASS_REUSED_HASH_BOUND |
| Gate B-Preview | PASS_REUSED_HASH_BOUND |
| Prompt 20 Retrieval Gate | PASS_REUSED_HASH_BOUND |
| Prompt 21 / current Gate C-Preview | PASS |
| Security and supply chain | PASS; no critical/high issue |
| Build | PASS |
| Typecheck | PASS |
| Lint | PASS |
| Unit | PASS, 238 passed and 1 paid-provider test intentionally skipped |
| Integration | PASS, 101/101 |
| Critical contracts | PASS, 68/68 |
| Browser | PASS, 16/16 ordinary plus 3/3 memory |
| Visual | PASS |
| Accessibility/focus | PASS |
| Dual-runtime rollback drill | PASS, 83 checks |

The final release-orchestrated performance gate completed three consecutive
runs without resumption: 216/216 visual/performance cells and 105/105
parity/functional tests passed. Run maxima were 3,292.1 ms, 3,645.0 ms, and
3,154.0 ms against the 5,000 ms threshold.

Release evidence: 35/35 commands passed and 22/22 artifacts hash-verified.

## Protection and storage

- Protected visual files changed: **0**
- CSS changes: **0**
- Protected DOM/class changes: **0**
- Protected asset changes: **0**
- Immutable static baselines changed: **0**
- Owner-approved support baselines changed: **0**
- Owner-approved Scripture-delta baselines changed: **0**
- Static files deleted: **0**
- Immutable static screenshots verified: 72
- Immutable desktop DOM snapshots verified: 12
- Support screenshots verified: 60
- Next support captures verified: 54 defaults and 16 interactions
- Workspace before: 2,177,047,787 bytes
- Workspace after final owner record: 2,201,320,376 bytes
- Growth: 24,272,589 bytes; within the 300 MB Prompt 22 bound
- Required listeners after review: **0**

## Files changed

Runtime/configuration:

- `package.json`, `next.config.mjs`, `tsconfig.next.json`
- `config/runtime/*` and the scoped release-gate policy
- `scripts/runtime/*` plus focused release/recovery boundary updates
- Next layout, proxy, health/readiness, legacy-fragment adapter, and
  client-safe canonical-runtime contract

Tests:

- focused build-foundation, browser, release-evidence, runtime-cutover, and
  visual-parity contracts

Documentation:

- runtime ADR, canonical/rollback architecture, operations/runbook, testing
  acceptance, migration ledger, pre-cutover manifest, owner decision, candidate
  evidence, and this final report

No product feature, protected visual source, baseline, corpus, index, user
record, or secret was changed.

## Production blockers

- Identity: production identity/session infrastructure not configured.
- Managed persistence: not configured.
- KMS: production key management not configured.
- Backups/restore: production service and restore drill not configured.
- Observability exporter: external production exporter not configured.
- Distributed rate limiting: not configured.
- Crisis-resource coverage: production/localization review outstanding.
- Production vector infrastructure: not configured or enabled.
- Monitoring/on-call: production ownership not established.
- Runtime deployment: no public host, domain, DNS, or TLS deployment exists.
- Owner production review: not requested and not authorized.
- Real-user pilot and stabilization evidence: outstanding.

## Result

Prompt 22: **PASS**

Next canonical locally: **YES**

Static rollback retained: **YES**

Prompt 23 eligible: **NO** — it requires an owner-defined stabilization
period and separate archive approval.

Prompt 23 executed: **NO**

Operational rollback:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run rollback:start
```

Focused repository rollback of runtime behavior:

```powershell
git revert 52ed7e9530e292f60195f7305a8ec9a476bd7367
```

Kill switches:

```text
TEOYUBE_LIVE_AI_ENABLED=false
TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false
```

Owner approval required for this local cutover: **NO — received**

Next gate: **BLOCKED — Gate C-Production closed; Prompt 23 locked**
