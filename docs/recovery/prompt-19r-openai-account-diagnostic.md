# Prompt 19R OpenAI account diagnostic

## Prompt 19K owner correction and resolution

This document preserves the Prompt 19R diagnostic as historical evidence. The owner subsequently corrected the billing classification: the visible USD 60.00 balance is OpenAI Platform API credit for Teoyube's funded organization, `org-jxmykEtCh4k3dpbczZFZSESn`.

Prompt 19K used the new, unexposed `Teoyube test key` through hidden local PowerShell entry only. The key was saved to ignored, untracked `.env.local`, never displayed or logged, and was not committed. The server-only adapter was bound to the funded organization. `/v1/me`, approved-model availability, one minimal quota probe, and the nine-fixture bounded Gate B-Preview suite passed.

- Prompt 19K: **PASS**
- Gate B-Preview: **PASS**
- Gate B-Production: **CLOSED**
- Prompt 20 unlocked: **YES**
- Prompt 20 work started: no

The original Prompt 19R conclusion below remains unchanged as the record of the information and owner answer available at that time. See `docs/recovery/prompt-19k-secure-local-key-and-funded-org-gate.md` for the superseding gate evidence.

Generated: `2026-07-23T02:34:26.458Z`

## Safe credential status

- Key present: yes
- Source class: process environment
- Plaintext exposed: no
- Authentication: PASS
- Secret, authorization header, cookie, email, or raw API response recorded: no

## API identity

The official `GET /v1/me` request succeeded with HTTP 200.

- Safe user ID: `user-h73TQx6VWPrixUFbgqM1iLVt`
- Request ID: `e3c8f431-f694-442a-bb0b-0696964741ee`
- Organization count: 2
- `org-jxmykEtCh4k3dpbczZFZSESn` — `teoyube-co-operation` — role `owner`
- `org-ZCGL2IBiQVP0jRTq3BC41YaG` — `user-h73tqx6vwprixufbgqm1ilvt` — role `owner`

No email address or other personal identity field is retained.

## Effective request routing

The single model-list request succeeded and both approved snapshots were visible:

- Light: `gpt-5.4-mini-2026-03-17`
- Standard: `gpt-5.4-2026-03-05`
- Request ID: `530aa532-72bc-4d59-9a53-5b162f1867b3`
- Effective organization header: absent
- Effective project header: absent
- Configured organization: absent
- Configured project: absent
- Base URL hostname: `api.openai.com`
- Key scope: `UNKNOWN_SCOPE`
- Possible organization/project mismatch: unknown

No organization or project was inferred where the provider did not return one.

## Read-only organization diagnostics

Each permitted organization endpoint was attempted exactly once for a bounded one-day range:

- `/v1/organization/costs`: HTTP 403, `ADMIN_READ_ACCESS_NOT_AVAILABLE`, request `02310d4f-90c4-4002-888d-98124164d766`
- `/v1/organization/usage/completions`: HTTP 403, `ADMIN_READ_ACCESS_NOT_AVAILABLE`, request `2a5c856d-f8a2-40a5-b5cf-c5c807964fbf`

This expected Admin-key restriction is diagnostic only. No Admin API key was requested or created.

## Current decision

- Existing key valid: yes
- Approved model listing: PASS
- Owner billing answer: 2
- Credit system: `CHATGPT_OR_CODEX_NOT_API`
- Positive OpenAI Platform API balance: not confirmed; the owner reports that the credits appear only in ChatGPT/Codex or a ChatGPT workspace
- New project key created: no
- Generation request made in Prompt 19R: no
- Gate B-Preview: `BLOCKED_CREDIT_SYSTEM_NOT_API`
- Gate B-Production: closed
- Prompt 20 unlocked: no

The owner-selected branch explicitly prohibits another generation request or key creation. ChatGPT/Codex credits are not treated as OpenAI Platform API quota.

## Final report

### Branch and commits

- Branch: `recovery/visual-source-of-truth`
- Starting commit: `d407645dcc4cfb659dad42b42e5ebb196a89b878`
- Final report commit: this documentation-only commit; exact hash is recorded in the final task handoff
- Worktree: clean at entry; expected clean after the focused report commit

### Credential

- Existing key valid: yes
- New project key created: no
- Key plaintext exposed: no
- Local target: process environment
- Target ignored/tracked: not applicable; no env file was read or changed

### Account identity

- `/v1/me`: PASS
- Organizations: 2, listed above
- Effective organization: provider header absent
- Effective project: provider header absent
- Configured organization: absent
- Configured project: absent
- Mismatch found: unknown; the provider returned no effective routing headers

### Billing confirmation

- Owner answer: 2
- Credit system: `CHATGPT_OR_CODEX_NOT_API`
- Funded API organization: not confirmed
- Funded API project: not confirmed

### Quota probe

- Key used: none for generation in Prompt 19R
- Model: not called
- Status: not run; prohibited by the owner-answer-2 branch
- Error code: not applicable
- Request ID: not applicable
- Tokens: 0
- Cost: USD 0
- Organization/project headers: not applicable

### Gate

- Gate B-Preview: `BLOCKED_CREDIT_SYSTEM_NOT_API`
- Gate B-Production: CLOSED
- Prompt 17 Gate A: PASS, 64/64 at entry
- Prompt 18 Tool-Orchestration Gate: PASS at entry

### Support

- Support package created: no; Section 12 does not apply to owner answer 2
- Support submission required: no

### Protection

- Protected visual files changed: 0
- Baselines changed: 0
- Key in Git/client/logs: no
- Static runtime: CANONICAL
- Next runtime: PREVIEW ONLY
- Prompt 20 work: not started

### Result

- Prompt 19R: **BLOCKED**
- Prompt 20 unlocked: **NO**
- Owner action remaining: establish a positive balance in OpenAI Platform API Billing for the intended API organization/project before a new bounded provider-gate task
- Rollback: `git revert <Prompt 19R final report commit>`
- Kill switch: `TEOYUBE_LIVE_AI_ENABLED=false`
