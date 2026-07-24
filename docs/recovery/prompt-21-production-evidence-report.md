# Prompt 21 production evidence report

## Result

Prompt 21: **PASS**

Gate C-Preview: **PASS**

Gate C-Production: **CLOSED**

Prompt 22 eligible for a separate owner authorization: **YES**

Prompt 22 executed: **NO**

This result is engineering evidence for the local/CI Next preview. It is not a
production certification, runtime cutover, WCAG conformance claim, pastoral or
legal certification, production-traffic claim, or real-user validation.

The canonical executable evidence is bound to source commit
`c537c1db1d7007ddf47728a7d5cc1e3d3a9bee5d`. The final report commit is the Git
commit containing this file; it is a report-only descendant and its exact hash
is reported in the task handoff.

## Branch and commits

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `d7aefa3f62c107e1806f3b90ea7963e39c8bc59f`
- Observability/product-value commit:
  `dc68f3c` (`feat(observability): add privacy-safe release telemetry`)
- Security commit:
  `e717d37` (`feat(security): enforce preview release request controls`)
- Testing/CI and evidence-tooling commit:
  `e490c05` (`test(platform): consolidate executable release gates`)
- Operations documentation commits: `603909b`, `d9fe768`
- Build-identity commits: `c2721b5`, `c537c1d`
- Product-metrics/evidence source commit: `c537c1d`
- Final report commit: self (the commit containing this report)
- Evidence-source worktree: clean
- Final worktree target: clean

## Files changed

The evidence source changed 70 tracked paths; this report is the 71st Prompt 21
path. Exact status is reproducible with:

```text
git diff --name-status d7aefa3f62c107e1806f3b90ea7963e39c8bc59f..HEAD
```

Changes are limited to these nonvisual capability groups:

- CI: `.github/workflows/next-preview-foundation.yml`,
  `.github/workflows/recovery-contract.yml`, and
  `.github/workflows/release-evidence.yml`.
- Release policy: `.gitignore`, `package.json`, `package-lock.json`,
  `eslint.config.mjs`, `tsconfig.next.json`, `vitest.release.config.mts`, and
  `next.config.mjs`.
- Machine-readable policy: `config/api-security-registry.json`,
  `config/release-gate-policy.json`, `config/security-headers.json`,
  `config/supply-chain-policy.json`, and
  `config/telemetry-event-registry.json`.
- Release tooling: the 13 scripts under `scripts/release/`.
- Observability/product value: `src/domain/observability/`,
  `src/domain/product-value/`, `src/server/observability/`,
  `src/config/readiness.ts`, and `src/app/api/readiness/route.ts`.
- Request security: `src/proxy.ts`,
  `src/server/http/memory-route-helpers.ts`, and the existing consent,
  identity, and memory API route handlers.
- Reproducible preview evidence: `src/app/layout.tsx` and
  `src/lib/teoyube/app-state.ts`; normal runtime timestamps remain current.
- Tests: three new build-foundation suites, one new E2E suite, and one focused
  update to the existing safety-orchestration suite.
- Documentation: architecture ADR/evidence/observability, security and supply
  chain, SLO/error-budget/incident/runbook, performance, privacy, product value,
  user-research pilot, accessibility debt, test pyramid/CI, inventory,
  migration ledger, and this report.

No CSS, protected DOM/class source, public asset, owner image, or baseline path
changed.

## Toolchain and build

- Node: `v24.18.0`
- npm: `10.2.4`
- OS/architecture: `win32-x64`
- Package lock: lockfile version 3; SHA-256
  `1edbad08c15ad46effdca2258278ca4b7159f223bad088fbc792e7a5e57008ef`
- Clean `npm ci`: PASS
- Typecheck: PASS
- Lint and release lint: PASS
- Format policy: PASS
- Next preview build: PASS, 72 routes
- Build reproducibility: PASS across two clean builds
- Client output: 42 files, 1,896,308 bytes
- Server output: 1,115 files, 116,535,441 bytes
- Artifact manifest: PASS
- Route manifest: PASS
- Client-bundle manifest: PASS
- Public source maps: 0; policy is server-only/not publicly served
- SBOM: CycloneDX, 490 components
- Dependency/license scan: PASS
- Direct license debt: 0
- Transitive packages requiring license review: 85
- Reviewed lifecycle scripts: one expected `unrs-resolver` postinstall; unexpected
  lifecycle scripts: 0
- `npm audit`: PASS, 0 total vulnerabilities
- Artifact signing: not performed; an owner signing/attestation identity is a
  production dependency

Framework output is not claimed to be byte-identical. Raw hashes and byte
counts are retained. The semantic comparison normalizes only documented
nonsemantic build entropy: the exact Next build ID and path references, exact
build-generated timestamp fields, two exact legacy TIG debug/result-ID shapes,
and an evidence-only Server Actions key derived from the source commit. The key
value is never recorded. Production builds require a deployment-managed key.

## Test pyramid

- Unit: 34 files PASS, 1 existing file skipped; 233 tests PASS, 1 skipped
- Integration: 8 files, 101 tests PASS
- Critical-contract suite: 8 files, 68 tests PASS
- Browser: 5 suites, 12 tests PASS
- Guided daily loop: PASS, including completion and skip/revisit/undo behavior
- AI/safety fixtures: Prompt 17 Gate A 64/64; Prompt 19K provider evidence 9
  fixtures, 7 strict/citation-valid provider responses
- Retrieval fixtures: 28 cases (8 exact, 20 semantic)
- Retrieval tests: 7 files, 21 tests PASS
- Critical-contract coverage: 16/16 required contracts PASS
- Fault-injection patterns: 12/12 present
- Ordinary coverage:
  - statements: 82.08% (2,904/3,538)
  - branches: 71.94% (2,164/3,008)
  - functions: 87.13% (745/855)
  - lines: 86.91% (2,525/2,905)
- Enforced ordinary thresholds: 35% statements and 30% branches
- Coverage exclusions: protected visual source, generated WEB corpus,
  third-party archive, and barrel-only index modules

Known test debt:

- one pre-existing skipped unit test/file remains;
- inherited accessibility findings require owner-reviewed protected changes or
  manual validation;
- production traffic, provider operations, alerting, and real-user behavior are
  not represented by local synthetic tests;
- the first local aggregate command host reached its one-hour wrapper limit
  during the final resumable gate. Its child completed all three logical runs,
  and the identity-bound controller plus the 35-command ledger subsequently
  validated PASS. No performance cell was skipped or converted to a pass.

## CI

- Workflow: `.github/workflows/release-evidence.yml`
- Runtime: Node 24.18.0 and npm 10.2.4
- Mandatory job: `offline-release-evidence`
- Mandatory stages: clean install, audit/supply chain, toolchain/lockfile,
  format/lint, typecheck, unit/integration/critical/coverage, semantic
  reproducible build, architecture/import/bundle boundaries, security and
  secret checks, Scripture/TIG/safety/Teo Guide/retrieval, browser journeys,
  static visual parity, resumable 216-cell performance, accessibility,
  observability, and evidence generation/verification
- Cost-bearing manual jobs:
  - `live-ai-preview-gate`, owner budget cap USD 2.00
  - `embedding-reindex`, owner budget cap USD 0.25
  - `embedding-candidate-evaluation`, owner budget cap USD 0.50
- Untrusted/fork protection: paid jobs require `workflow_dispatch`, explicit
  budget acknowledgement, and the protected `prompt-21-paid-preview`
  environment; ordinary pull requests receive no provider secret
- Local current-CI simulation: PASS
- Historical reports alone cannot make the workflow green
- Compact failure evidence retention: seven days

## Security

- Security Gate: PASS
- Controls: 18/18
- Critical/high unresolved findings: 0
- API inventory: 31/31 routes classified
- Strict request schemas and unknown-field rejection: PASS
- Global body maximum: 65,536 bytes
- Content type: strict JSON on the critical request boundary
- Request IDs/correlation: PASS
- Sanitized errors: PASS
- Timeout/cancellation contracts: PASS
- Authentication: server-authoritative session contracts PASS
- Authorization/record ownership: PASS
- Cross-user isolation: PASS; exposure 0
- CSRF/request-forgery: PASS
- Rate/abuse/budget limits: PASS; typed 429 behavior covered
- Secret scan: 3,475 tracked files, 0 secret files
- Git-history secret pattern matches: 0
- Client bundle: 42 files scanned, 0 secret/server-data violations
- Local environment boundary: ignored and untracked
- Headers: report-only CSP plus frame, MIME, referrer, permissions, and
  production transport policy validated
- Dependency vulnerabilities: 0 info/low/moderate/high/critical
- Prompt injection, strict tool/output, citation, memory consent, vector trust,
  user isolation, and deletion/revocation controls: PASS
- Paid evidence reuse: PASS; relevant Prompt 19K and Prompt 20 paths unchanged

## Privacy and observability

- Telemetry registry:
  `teoyube-telemetry-2026-07-24.1`
- Registered events: 22
- Raw private-content events: 0
- Raw private logs: 0
- Unsafe evidence artifacts: 0
- Default analytics consent: off
- Analytics purpose: separate `product_value_analytics` consent
- Local/test sink: bounded in-memory
- Structured events, metrics, p50/p95/p99 summaries, and traces: implemented
- Production exporter: interface complete, configuration pending
- Redaction/prohibited-field validation: PASS
- Per-event purpose, sensitivity, consent, retention, aggregation, source, and
  owner: registry-enforced
- Correlation IDs: supported
- Sampling and buffering: provider-neutral boundary implemented
- Exporter failure isolation: PASS
- Observability failure cannot block Scripture, safety, consent, or deterministic
  fallback

## SLOs and performance

- SLO version: `teoyube-preview-slo-2026-07-24.1`
- Error-budget version: `teoyube-preview-error-budget-2026-07-24.1`
- Exact displayed WEB citation validity: 100%
- Critical immediate-danger recall: 100%
- Cross-user exposure: 0
- Unauthorized memory/tool/state action: 0
- Fabricated displayed Scripture: 0
- Protected visual/baseline drift: 0
- Non-AI API: critical route tests PASS; synthetic local p95 budget 250 ms
- Production API p50/p95/p99: no production traffic claimed
- Scripture: exact WEB corpus/citation gates PASS
- TIG: deterministic/service/source boundary gates PASS
- Hybrid retrieval p95: 304.2182 ms; maximum 334.64 ms
- Deterministic Teo Guide: PASS
- Live Teo Guide: Prompt 19K hash-bound Gate B-Preview PASS; production latency
  and reliability remain unproven
- Route readiness: 216/216 cells, hard maximum 5,000 ms
- Three current logical-run maxima: 3,284.8 ms, 3,055.3 ms, and 3,333.6 ms
- Next client JavaScript: 1,896,308 / 2,085,704 bytes
- Largest client chunk: 886,783 / 975,462 bytes
- Approved CSS: 948,538 / 948,538 bytes
- Images: 167,041,108 / 167,041,108 bytes
- Media: 11,161,794 / 11,161,794 bytes
- Largest image: 2,554,394 / 2,554,394 bytes
- Largest media: 942,235 / 942,235 bytes
- Active public vector index: 296,927,232 / 629,145,600 bytes
- Client/server bundle-boundary violations: 0
- Performance checks: 11/11 PASS
- Performance Gate: PASS

Correctness, security, Scripture, safety, consent, cross-user isolation,
deletion, raw-content privacy, and protected-visual invariants have zero error
budget. Ordinary resource/latency metrics use a 10% non-regression budget.

## Accessibility

- Evidence type: automated parity; not WCAG certification
- Cells: 216
- New parity failures: 0
- Positive tabindex divergence: 0
- Reduced-motion support: present
- Automated checks: names, sequential focus, focus traps, `aria-hidden`
  descendants, keyboard actions, reduced motion, and error association
- Inherited accessible-name findings: 54 cell occurrences, representing the
  existing search inputs on Embedded Videos, Lexicon, and Tables
- Inherited `aria-hidden` focus findings: 216 cell occurrences, representing
  11 Today containers and one Canon container across the matrix
- Contrast: manual measurement still required
- Responsive text/zoom: real-user pilot task still required
- Accessibility Gate: PASS as honest parity/debt evidence, not conformance

No protected accessibility structure or copy was changed to hide inherited
debt.

## Product value

- Clarity event schemas: sources, Scripture/interpretation disclosure,
  explanation, limitations, and optional self-reported understanding
- Faithful-action schemas: proposed, accepted, edited, rejected, undone, and
  later reflected upon
- Reflection-continuity schemas: completion, consented reuse, tomorrow-context
  choice, and explicit carry-forward
- Trust/reversibility schemas: source inspection, rejection, undo, memory
  inspect/delete, consent revoke, fallback, safety feedback, and citation report
- Cross-module schemas: Search to Promise Table, Scripture to Prayer, Prayer to
  Calling, Calling to action, Action to Reflection, Reflection to testimony
  candidate, Testimony to Book review, and Today to Tomorrow
- Community-support schemas: explicit mentor prompt, trusted-person suggestion,
  or professional-support link action only; follow-through is not inferred
- Safety/quality schemas: deterministic fallback, safety/citation/memory/
  injection denials, provider outage, and user-reported unsafe/unhelpful output
- Prohibited metrics: holiness score, faith score, spiritual rank, guilt
  streak, divine favor, time-in-app objective, compulsive notification loop,
  coercive retention language, and hidden engagement profile
- Analytics consent: purpose-specific, inspectable, revocable, default off
- Dashboard/summary: deterministic local aggregate; all counts are 0 because no
  real user analytics were collected
- Raw content stored: false
- Spiritual score computed: false
- Real user research: **USER_RESEARCH_NOT_YET_RUN**
- UX/Product validation: **NOT YET PROVEN BY REAL USERS**

## AI and retrieval

- Prompt 17 Gate A: PASS, 64/64
- Gate B-Preview: PASS_REUSED_HASH_BOUND
- Gate B-Production: CLOSED
- Prompt 18 Tool-Orchestration Gate: PASS
- Prompt 20 Retrieval Quality Gate: PASS_REUSED_HASH_BOUND
- Citation fidelity: exact reference accuracy 100%; citation validity 100%
- Hybrid Recall@5/10: 1.0/1.0
- Hybrid MRR@10: 0.7725
- Hybrid nDCG@10: 0.803102
- Trust filter accuracy: 100%
- Consent filter accuracy: 100%
- Source inspectability: 100%
- Critical regressions: 0
- Cross-user leakage: 0
- Deleted/revoked leakage: 0
- Fabricated citations: 0
- Prompt-injection bypass: 0
- Deterministic fallback: true
- Public index: 33,563 vectors/chunks
- Verification provider calls: 0
- Verification cost: USD 0
- Prompt 19K reused provider evidence: 7 calls, USD 0.090635 historical actual
  cost; no Prompt 21 paid rerun
- Raw provider content copied into release evidence: false

## Release evidence

- Manifest version: `teoyube-release-evidence-2026-07-24.1`
- Scorecard version: `teoyube-gate-c-preview-2026-07-24.1`
- Evidence source commit:
  `c537c1db1d7007ddf47728a7d5cc1e3d3a9bee5d`
- Commands: 35/35 PASS
- Hashed artifacts: 22/22 verified
- Validation failures: 0
- Local package: 23 compact files under `artifacts/release-evidence/` plus
  `artifacts/release/security-gate.json`
- Environment: Node/npm/OS, branch, clean source, lockfile hash recorded
- Source manifest: 3,475 files, 464,758,032 bytes, SHA-256
  `bc5694e9522f50da709ff9ebdfbb54e87e07ceec7600dc8718593a08e3434624`
- WEB corpus: `engwebp-2020-stable-2026-07-10.p15b.1`, SHA-256
  `e777cbf8c0dcebbb5093194025f1d4c788095d0c873ab4b5021fd238525ab8bd`
- Inventory: 522 entries
- Inventory UNKNOWN: 0
- Historical PASS acceptance: execution or valid hash-bound reuse only
- Simulated/document-only readiness accepted as PASS: false
- Gate C-Preview: PASS
- Gate C-Production: CLOSED

Large generated evidence remains ignored. Compact manifests and scorecards are
regenerable from the committed scripts and current source; passing raw provider
content, browser reports, compiler scratch output, and passing logs were
deleted after hashing.

## Gate C-Production blockers

1. Production identity provider
2. Managed relational persistence
3. Production key management
4. Backup and restore test
5. Production observability exporter and alerts
6. Managed production rate limiting
7. Production crisis-resource coverage
8. Production live-AI data-control review
9. Production vector infrastructure
10. Domain, TLS, and deployment protection
11. Incident on-call ownership
12. Rollback drill
13. Owner runtime-cutover approval
14. Owner production visual review
15. Real-user UX, trust, safety, and accessibility pilot evidence
16. Owner signing/attestation identity
17. Managed multi-region deletion and retention operations

Gate C-Production is not implied by Gate C-Preview.

## Protection and storage

- Protected visual files changed: 0
- CSS changes: 0
- DOM/class changes: 0
- Asset changes: 0
- Immutable baselines changed: 0
- Owner-approved support baselines changed: 0
- Owner-approved Scripture-delta baselines changed: 0
- Starting workspace: 31,861 files; 2,149,688,687 bytes
- Pre-final-verification cleanup snapshot: 32,013 files; 2,176,314,847
  bytes
- Growth at that snapshot: 152 files; 26,626,160 bytes (below the
  524,288,000-byte limit)
- The terminal post-commit byte count is reported in the task handoff because
  committing this report necessarily changes `.git`, and final recovery
  refreshes compact safety evidence
- Public hybrid index retained
- Passing raw provider artifact removed after hash-bound summary generation
- Passing browser/compiler scratch output removed
- Target test listeners on ports 3100, 3183, 4173, and 4183: 0
- Storage bound: PASS

## Runtime

- Static runtime: CANONICAL
- `npm start`: `node --preserve-symlinks-main server.js`
- Next runtime: PREVIEW ONLY
- Checked-in live AI: `TEOYUBE_LIVE_AI_ENABLED=false`
- Checked-in vector retrieval:
  `TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false`
- Runtime cutover: NOT AUTHORIZED / NOT EXECUTED

## Required commands and results

```text
npm run release:commands:core       PASS (27/27 current core records)
npm run release:commands:evidence   PASS (8/8; 35 total records)
npm run release:evidence:generate   PASS
npm run release:evidence:verify     PASS (22 artifacts; 0 failures)
npm run release:gate:preview        PASS
npm run recovery:verify             PASS
npm run recovery:tig:verify         PASS
npm run safety:gate:orchestration   PASS
```

The current resumable controller independently records three passing logical
runs and 216/216 cells under the fixed 5,000 ms threshold.

## Approval, rollback, and next gate

- Owner approval required for Prompt 21 engineering evidence: **NO**
- Owner approval required for Prompt 22/runtime cutover: **YES**
- Prompt 22 eligible for separate owner authorization: **YES**
- Prompt 22 executed: **NO**
- Next gate: **PASS FOR SEPARATE OWNER DECISION; RUNTIME REMAINS UNCHANGED**

Rollback the Prompt 21 commit range from the final Prompt 21 HEAD:

```text
git revert --no-commit d7aefa3f62c107e1806f3b90ea7963e39c8bc59f..HEAD
git commit -m "revert: Prompt 21 release evidence"
```

Kill switches remain:

```text
TEOYUBE_LIVE_AI_ENABLED=false
TEOYUBE_VECTOR_RETRIEVAL_ENABLED=false
```
