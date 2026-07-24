# Prompt 22 local runtime cutover candidate

## Decision scope

Owner decision:
`TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`

Authorized starting commit:
`d01464743347251cb6fa2af20585c9983c67fe81`

Source candidate commit:
`52ed7e9530e292f60195f7305a8ec9a476bd7367`

The candidate changes only Teoyube's repository/local canonical runtime. It
does not deploy Teoyube publicly. Gate C-Production remains closed and Prompt
23 remains locked.

## Candidate runtime

| Purpose | Command | Runtime |
| --- | --- | --- |
| Canonical local application | `npm start` | Safe Next production launcher |
| Local development | `npm run dev` | Next development runtime |
| Explicit Next production | `npm run app:start` | Safe Next production launcher |
| Operational rollback | `npm run rollback:start` | Original static Node runtime |
| Static compatibility | `npm run static:start` | Original static Node runtime |

The safe launcher requires the existing production build, binds only to
loopback, refuses occupied or invalid ports, and performs no install, build,
dataset mutation, provider call, or source mutation at startup.

Next build ID: `I1g8n9KHFcruCq_ERB1C1`

## Compatibility

- 23 retained public routes passed direct navigation, refresh, trailing-slash,
  history, and back/forward checks.
- 14 legacy static hash mappings passed, including `/index.html` entry and
  safe query preservation.
- `/compass` retains its canonical redirect to `/calling-compass`.
- 31 API route contracts remain present.
- Owner, development, graph, and TIG routes return 404 without authorization.
- The Next -> static -> Next drill passed 83 checks and released every owned
  listener.
- Representative media passed MIME, content length, HEAD, Range, immutable
  cache, Last-Modified 304, missing-path, and protected-source checks.

## Visual source of truth

Protected visual files changed: **0**

Immutable or owner-approved baselines changed: **0**

Verified unchanged:

- 268 protected visual-source files;
- 210 visual-contract files and 12 owner design references;
- 72 immutable static screenshots and 12 desktop DOM snapshots;
- 60 owner-approved support screenshots;
- 54 owner-approved Next support defaults and 16 interaction captures;
- all approved Scripture content-delta artifacts.

No baseline, screenshot, DOM contract, stylesheet, CSS rule, asset, image,
icon, video, or approved copy was regenerated or replaced.

## Automated gate

Gate C-Preview: **PASS**

Gate C-Production: **CLOSED**

The release scorecard is bound to source commit `52ed7e9...` and records:

- 35/35 release commands passed;
- 22/22 release artifacts hash-verified;
- dependency audit, supply chain, reproducible build, security, telemetry,
  operational readiness, coverage, accessibility, and performance passed;
- 238 unit tests passed and one paid-provider test remained intentionally
  skipped;
- 101 integration and 68 critical contract tests passed;
- 16/16 ordinary browser tests, including both Prompt 13 journey tests;
- 3/3 consent-memory browser tests;
- 21/21 focused retrieval tests;
- 49/49 focused Teo Guide tests;
- 25/25 offline live-AI contract tests;
- Prompt 17 safety Gate A passed 64/64 deterministic fixtures;
- Prompt 19K Gate B-Preview and Prompt 20 retrieval quality remain
  `PASS_REUSED_HASH_BOUND`;
- checked-in live AI, embeddings, vector retrieval, and broad RAG remain off.

The final release-orchestrated visual/performance sequence passed:

| Run | Performance cells | Parity/functional tests | Maximum readiness |
| --- | ---: | ---: | ---: |
| 1 | 72/72 | 35/35 | 3,292.1 ms |
| 2 | 72/72 | 35/35 | 3,645.0 ms |
| 3 | 72/72 | 35/35 | 3,154.0 ms |
| Total | 216/216 | 105/105 | 5,000 ms threshold |

An earlier candidate sequence demonstrated the checkpoint resume path after a
transient Windows file-lock interruption. It resumed without losing or
changing a cell. The final release-orchestrated sequence above completed all
three runs without resumption and is the release scorecard authority.

## Review URLs

The dedicated review servers are started only after this evidence commit:

- Next candidate: `http://127.0.0.1:3130`
- Static rollback: `http://127.0.0.1:4200/index.html`

Both are loopback-only and are stopped after the owner's final decision.

## Known boundaries

- Final local runtime cutover confirmation is pending.
- This candidate is not a public deployment.
- Production identity, managed persistence, key management, backup/restore,
  external observability, production rate limiting, production crisis
  coverage, production live-AI review, production vector infrastructure,
  domain/TLS protection, on-call ownership, and real-user pilot evidence
  remain production blockers.
- The separate Phase 11.6C.3 publication-integrity blocker remains unchanged.
- The original static publication-integrity boundary still returns 404 for
  unpublished protected media.
- Next emits a weak ETag for the representative video but uses the verified
  Last-Modified/`If-Modified-Since` 304 conditional contract.
- Real-user UX and product validation is not yet proven.

## Rollback

Immediate operational rollback:

```powershell
& "C:\Program Files\nodejs\npm.cmd" run rollback:start
```

Focused repository rollback of runtime behavior:

```powershell
git revert 52ed7e9530e292f60195f7305a8ec9a476bd7367
```

The static runtime requires no network, package install, or Next build.

## Owner gate

Final owner confirmation: **PENDING**

Prompt 23 unlocked: **NO**
