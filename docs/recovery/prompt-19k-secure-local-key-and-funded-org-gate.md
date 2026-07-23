# Prompt 19K secure local key and funded-organization gate

## Result

Prompt 19K: **PASS**

The new `Teoyube test key` was entered only through a local PowerShell hidden-input prompt and saved only to ignored, untracked `.env.local`. The value was never printed, echoed, summarized, fingerprinted, logged, committed, or delivered to a client bundle. The previously exposed key remained revoked and was not used.

OpenAI requests were explicitly bound server-side to the owner-confirmed funded organization. Authentication, approved-model availability, exactly one minimal quota probe, and the existing nine-fixture bounded Gate B-Preview suite passed. Gate B-Production remains closed. Prompt 20 is unlocked, but no Prompt 20 implementation was started.

## Branch and commits

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `e6ef2f8510ed2bfb40ddac35e4122d4384ecd2e9`
- Organization-binding commit: `faca172`
- Stream parsing and synthetic-fixture isolation commit: `8fec06d`
- Final report commit: documentation-only commit containing this report; exact hash is recorded in the final task handoff
- Worktree: expected clean after the focused report commit

## Key

- Key name: `Teoyube test key`
- Secure local entry: PASS
- Local target: `.env.local`
- Target exists: YES
- Target ignored: YES
- Target tracked: NO
- `OPENAI_API_KEY` present: YES, verified without printing its value
- `OPENAI_ORG_ID` present: YES, verified without printing env-file contents
- Plaintext displayed, logged, or committed: NO
- Old exposed key used: NO
- Stale inherited-key precedence: eliminated for every provider diagnostic and paid evaluation by using a fresh child process, removing inherited OpenAI variables, then loading `.env.local`

## Organization and model identity

- Funded organization ID: `org-jxmykEtCh4k3dpbczZFZSESn`
- Funded organization name: `teoyube-co-operation`
- Owner-confirmed Platform API balance: USD 60.00
- Organization configured server-side: YES
- Organization present in `/v1/me`: YES
- Identity request: HTTP 200
- Identity request ID: `2216b233-509c-4990-850b-0fcea9b4c900`
- Identity effective organization: `teoyube-co-operation`
- Identity effective project: `proj_aWe6jGi5wUxJEyNr8iSlmbgx`
- Configured organization: `org-jxmykEtCh4k3dpbczZFZSESn`
- Model-list request ID: `a6c60109-44e3-4315-aef6-9c69d19996e1`
- Model-list effective organization header: absent
- Model-list effective project header: absent
- `gpt-5.4-mini-2026-03-17`: AVAILABLE
- `gpt-5.4-2026-03-05`: AVAILABLE
- Base URL: official OpenAI API; no user-controlled override
- Client-visible organization/project/key configuration: none

## Minimal quota probe

- Requests made: exactly 1
- Status: PASS
- Safe error code: none
- Request ID: `e65d8cc9-ad78-4242-9902-42aff71e341e`
- Response ID: `resp_0de055dcbdfb8272016a6260dbaef481a1a3dfd2c14cd1f3d2`
- Model: `gpt-5.4-mini-2026-03-17`
- API: Responses
- Effective organization: `teoyube-co-operation`
- Effective project: `proj_aWe6jGi5wUxJEyNr8iSlmbgx`
- Input tokens: 62
- Output tokens: 13
- Latency: 1,851 ms
- Estimated cost: USD 0.000105
- Strict schema validity: PASS
- `store=false`: YES
- Tools, memory, and sensitive content: none
- Retries: 0
- Raw provider output recorded or displayed: NO

## Gate B-Preview

The final bounded suite used the owner-approved Prompt 19 profile. Seven fixtures used the live provider; the critical-safety and prompt-injection fixtures remained deterministic and made no provider call.

- Fixture count: 9
- Live-provider fixtures expected: 7
- Live-provider calls: 7
- Strict response schema: 7/7, 100%
- Strict function-schema contract: 13/13, 100%
- Provider tool executions: 0
- Unapproved tools: 0
- Parallel tool calls: 0
- Tool-policy bypass: 0
- Prompt-injection bypass: 0; deterministic fixture made 0 provider calls
- WEB citation validity: 7/7, 100%
- Fabricated citations displayed: 0
- Divine-authority violations: 0
- Calling overreach: 0
- Testimony/fulfillment overreach: 0
- Coercion, victim blame, or care-replacement violations: 0
- Unauthorized memory reads: 0
- Unauthorized memory writes: 0
- Unauthorized state changes: 0
- Raw unvalidated provider text displayed: 0
- Critical provider calls: 0
- Deterministic provider-outage fallback: 100% in the unchanged offline contract
- Cancellation cleanup: PASS in the unchanged offline contract
- Budget enforcement: PASS
- Sensitive-log leakage: 0
- Final-suite input tokens: 10,663
- Final-suite cached input tokens: 1,280
- Final-suite output tokens: 4,633
- Final-suite cost: USD 0.086566
- Conservative audited Prompt 19K spend upper bound: USD 0.208829, below the USD 2.00 cap
- Result: **PASS**

The initial full-suite attempt exposed two implementation defects without weakening any gate: streamed structured JSON existed in message output items rather than the aggregate helper, and shared synthetic identity consumed the unchanged per-user limit. The adapter now parses only the structured message output in memory while withholding raw deltas, and each synthetic fixture uses an isolated synthetic user/conversation. The production six-request per-user limit, schemas, fixtures, theology rules, citations, models, budgets, and output ordering remain unchanged.

Final disposable evaluation artifact:

- Path: `.tmp/live-ai/results/provider-evaluation.json`
- SHA-256: `7c54a985428d94cbf4108d48563fbc832d8a855a77bf762e9633d55b7323f87c`
- Secret-shaped values detected: 0
- Synthetic only: YES
- `store=false`: YES

## Other gates and regressions

- Prompt 17 Gate A: PASS, 64/64
- Prompt 18 Tool-Orchestration Gate: PASS
- Gate B-Production: CLOSED
- Recovery verification: PASS
- TIG contract: PASS
- Scripture contract: PASS
- Typecheck: PASS
- Lint: PASS
- Unit: PASS, 195 passing and 1 paid-provider test skipped by default
- Focused live-AI unit: PASS, 25/25
- Production build: PASS, 58 generated routes/pages
- Browser: PASS, 10/10 core scenarios including five Teo Guide scenarios and the Prompt 13 journey flow
- Client bundle: PASS; TIG seeds, Scripture corpus, OpenAI SDK, key, organization, and traversal/server internals remain absent
- Live-AI boundary verifier: PASS
- Exact WEB Scripture: PASS and remains deterministic/authoritative
- 216-cell performance evidence: reused unchanged; no route-load, client-output, visual, or protected source changed
- Final workspace inventory: 1,822,768,761 bytes / 31,354 files, within the existing bounded-storage policy
- Known test listeners on ports 3000, 3100, 3116, 3173, 3183, 4173, 4174, and 4183: 0

## Protection and runtime

- Protected visual files changed: 0
- Immutable static baselines changed: 0
- Owner-approved support baselines changed: 0
- CSS, DOM/classes, assets, layouts, visible copy, and screenshots changed: 0
- Secret in Git, client bundle, reports, or logs: NO
- Known synthetic secret fixture: one pre-existing allowlisted test variable; unexpected secret hits: 0
- Static runtime: CANONICAL
- `npm start`: unchanged, `node --preserve-symlinks-main server.js`
- Next runtime: PREVIEW ONLY
- Checked-in `TEOYUBE_LIVE_AI_ENABLED`: false
- Production live AI: disabled
- Prompt 20 work: not started

## Files changed

Organization binding:

- `.env.example`
- `scripts/recovery/verifyLiveAiBoundaries.cjs`
- `src/config/environment.ts`
- `src/server/live-ai/model-configuration.ts`
- `src/server/live-ai/openai-responses-adapter.ts`
- `tests/build-foundation/live-ai-adapter.test.ts`
- `tests/build-foundation/live-ai-contracts.test.ts`

Streamed structured-response and synthetic-fixture isolation:

- `src/server/live-ai/openai-responses-adapter.ts`
- `tests/build-foundation/live-ai-adapter.test.ts`
- `tests/build-foundation/live-ai-provider-evaluation.test.ts`

Audit reports:

- `docs/recovery/prompt-19-live-ai-report.md`
- `docs/recovery/prompt-19q-provider-quota-and-preview-gate.md`
- `docs/recovery/prompt-19r-openai-account-diagnostic.md`
- `docs/recovery/prompt-19r-openai-account-diagnostic.json`
- `docs/recovery/prompt-19k-secure-local-key-and-funded-org-gate.md`

Protected visual files changed: 0.

## Decision, remaining limits, and recovery

- Prompt 19K: **PASS**
- Prompt 20 unlocked: **YES**
- Prompt 20 work started: NO
- Owner action remaining for Prompt 19K: none
- Gate B-Production: CLOSED; production identity, managed secret storage, monitoring/incident response, data-control/retention review, production rate/budget policy, red-team/human review, and runtime cutover remain outside this task
- Rollback: `git revert <final-report-commit> 8fec06d faca172`
- Kill switch: `TEOYUBE_LIVE_AI_ENABLED=false`

Stop condition honored: Prompt 20 was not implemented.
