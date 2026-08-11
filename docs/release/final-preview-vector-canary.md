# Final authenticated Preview managed-vector canary

Authorization: `TEOYUBE-AUG21-VECTOR-FINAL-VERIFIER-2026-08-11-001`

Executed: 2026-08-11T23:06:34.0485998Z

## Result

The corrected project-API verifier completed the single authorized temporary
automation-bypass lifecycle against the Git-sourced Preview. The credential
was captured only in process memory, used only as a Vercel protection header,
revoked in the unconditional cleanup path, and independently confirmed absent.
Production was not deployed, promoted, configured, or otherwise changed.

| Gate | Result |
| --- | --- |
| Verifier API adapter | PASS |
| Secret lifecycle preflight | PASS (11/11 tests) |
| Git-sourced Preview identity | PASS |
| Health | PASS (`preview/vercel-preview`) |
| Canonical routes | 23/23 PASS |
| Stylesheets | 9/9 PASS |
| Private-query local rejection | PASS (HTTP 422; zero provider calls) |
| Public managed-vector canary | PASS |
| WEB Scripture/citation contract | PASS (5 public sources) |
| Bypass created/revoked | 1/1 |
| Final active bypass count | 0 |
| Runtime errors, warnings, fatal, 5xx | 0 |
| Production mutations | 0 |

## Target identity

- Repository: `princeinoba/teoyube-frontend-css`
- Branch: `recovery/visual-source-of-truth`
- Deployment: `dpl_8qUECFJgVbPeXMiZAasneS7ztKdf`
- Preview commit: `3b91f4c62d7855d2ba2c4e60949f5a9f25c985a4`
- Preview state/class: `READY` / Preview
- Production deployment: `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM`
- Production commit: `d95b6bc3abcc2e1f3592bbf5ae90970a40010954`
- Production state: `READY`, unchanged

## Offline verifier evidence

The parser rejects a missing credential field, an empty credential, and an
unexpected project response. Lifecycle fixtures cover successful verification,
creation followed by credential-read failure, HTTP verification failure, and
an initial revocation failure. Every post-creation path enters bounded cleanup.
The Vercel API adapter sends mutation bodies through stdin; no credential is
placed in a process argument, URL, file, Git object, console output, snapshot,
report, or runtime log.

The exact preflight output was:

- `PARSER: PASS`
- `CREATE/READ ADAPTER: PASS`
- `FINALLY REVOCATION: PASS`
- `SECRET REDACTION: PASS`
- `ACTIVE-CREDENTIAL PRECHECK: ZERO`

Tooling commits preceding this report are `6fc28ad049bb1ca1b69e68ddeaad66d2ac2aea25`
and `4a9e053`. Their changes are limited to release-verifier scripts and one
build-foundation test; runtime-source identity remains the deployed `3b91f4c`.

## Environment and provider boundary

Nine required non-secret branch-specific Preview values matched the documented
runtime matrix. Ten forbidden Preview capabilities were OFF. `OPENAI_API_KEY`,
`UPSTASH_VECTOR_REST_URL`, and `UPSTASH_VECTOR_REST_TOKEN` were verified only as
present; their values were not read. Production has none of those credentials,
and its checked AI/vector/research/persistence/private-memory flags remain OFF.

The private request was rejected locally before OpenAI or Upstash. The public
request performed exactly one OpenAI query-embedding call and one namespaced
Upstash query. It used no generation, broad RAG, research collection, or
persistence. The runtime-enforced additional embedding ceiling was USD $0.01,
below the authorization ceiling of USD $0.05.

## Runtime and credential evidence

The canary sequence produced 34 HTTP 200 responses and the one expected HTTP
422 response. Vercel reported no runtime error clusters, no error/warning/fatal
logs, and no 5xx responses in the checked window.

No tracked `.env.local`, `.vercel` metadata, authentication artifact, bypass
token file, or credential file exists. The tracked-content scan found no real
credential. One pre-existing synthetic Bearer fixture in
`tests/build-foundation/research-instrumentation.test.ts` triggered a generic
detector; it predates the Preview commit and was not changed by this work.

The protected projects `teoyube-cooperation`, `teoyube-scripture-intelligence`,
and `teoyube-phase-1-sntz` remain present. No mutation command targeted them.

Rollback for the verifier/evidence commits, without rewriting history:

```text
git revert --no-commit 3b91f4c62d7855d2ba2c4e60949f5a9f25c985a4..HEAD
git commit -m "revert: remove final Preview verifier evidence"
```

Public Production activation remains unauthorized.
