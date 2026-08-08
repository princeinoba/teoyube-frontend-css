# August 21 Production Baseline

- Authorization: `TEOYUBE-POST-LAUNCH-CAPABILITY-COMPLETION-2026-08-21-001`
- Captured: `2026-08-08T17:17:13.2866189-04:00`
- Repository: `https://github.com/princeinoba/teoyube-frontend-css`
- Authorized branch: `recovery/visual-source-of-truth`
- Local checkout: detached verification worktree at the exact remote branch commit

## Git and runtime identity

| Check | Result | Evidence |
| --- | --- | --- |
| Local HEAD | PASS | `d95b6bc3abcc2e1f3592bbf5ae90970a40010954` |
| Remote branch | PASS | `refs/remotes/origin/recovery/visual-source-of-truth` resolves to the same SHA |
| Worktree before evidence generation | PASS | Clean; dependency junction and generated evidence are ignored |
| Approved remote | PASS | `https://github.com/princeinoba/teoyube-frontend-css.git` |
| Runtime identity | PASS | Runtime-source verifier passed; digest `9f8e05bb7c9d62995411593124a3f83a3f29f1cd867ebedf9d41522ed8355b9b` |
| Build identity | PASS | `teoyube-9f8e05bb7c9d629954115931` |
| Recovery verification | PASS | Visual, DOM, 72 screenshots, 12 DOM snapshots, support routes, TIG, WEB Scripture, imports, architecture, safety and retrieval boundaries passed |

The workspace named in the authorization (`C:\Users\royce\Downloads\Teoyube-Recovery-Clean-LF`) was preserved without modification because it is at `c92e961`, two commits behind, and presents extensive tracked deletions. The sprint uses a fresh isolated worktree created from the authoritative remote-tracking commit.

## Production and rollback

| Check | Result | Evidence |
| --- | --- | --- |
| Project | PASS | `princeinobas-projects/teoyube-frontend-css` (`prj_0hPdbIadmq39jUS3wQ56tMvXOvCm`) |
| Production deployment | PASS | `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM`, `READY`, target `production` |
| Deployed commit | PASS | `d95b6bc3abcc2e1f3592bbf5ae90970a40010954` |
| Production URL | PASS | `https://teoyube-frontend-css.vercel.app` |
| Health identity | PASS | `status=ok`, `environment=production`, `deploymentTarget=vercel-production` |
| Readiness | PASS | `status=ready`, deterministic fallback ready; Scripture, TIG and safety ready |
| Rollback target | PASS | Preserve `dpl_4SSBQkV7WmwNZgSxQ7NWaRh3EjsM` |

## Environment names and feature flags

Only names, target scopes and boolean dispositions were inspected. No environment value was printed or written to this report.

Configured names:

- `NEXT_PUBLIC_TEOYUBE_APP_ENV`
- `NEXT_PUBLIC_TEOYUBE_DEPLOYMENT_TARGET`
- `NEXT_PUBLIC_TEOYUBE_ENABLE_CONSENT_CONTROLS`
- `NEXT_PUBLIC_TEOYUBE_ENABLE_DEBUG_UI`
- `NEXT_PUBLIC_TEOYUBE_ENABLE_OFFLINE_FALLBACK`
- `NEXT_PUBLIC_TEOYUBE_ENABLE_PERSONALIZATION_PREVIEW`
- `TEOYUBE_ENABLE_BROAD_RAG`
- `TEOYUBE_ENABLE_DATABASE_PERSISTENCE`
- `TEOYUBE_ENABLE_DURABLE_MEMORY`
- `TEOYUBE_ENABLE_EMBEDDINGS`
- `TEOYUBE_ENABLE_EXTERNAL_ANALYTICS`
- `TEOYUBE_ENABLE_EXTERNAL_MONITORING`
- `TEOYUBE_ENABLE_EXTERNAL_TEO_GUIDE_PROVIDER`
- `TEOYUBE_ENABLE_LIVE_AI`
- `TEOYUBE_ENABLE_VECTOR_RETRIEVAL`
- `TEOYUBE_LIVE_AI_ENABLED`
- `TEOYUBE_RESEARCH_MODE_ENABLED`
- `TEOYUBE_VECTOR_RETRIEVAL_ENABLED`

Verified false in Production and Preview: Live AI, vector retrieval (both aliases), embeddings, broad RAG, database persistence, research mode, durable memory and external Teo Guide provider. `TEOYUBE_SERVER_MEMORY_ENABLED` is not configured; the implemented durable-memory flag is false and readiness reports durable memory disabled.

## Dependency, secret and temporary-file status

| Check | Result | Evidence |
| --- | --- | --- |
| Dependency audit | PASS | `npm audit --json`: 490 total dependencies; 0 low, moderate, high or critical vulnerabilities |
| Tracked secret scan | PASS | 5,255 tracked files scanned; 0 secret-bearing files |
| Git-history secret scan | PASS | 0 pattern matches |
| Local environment boundary | PASS | `.env.local` ignored and not tracked; only `.env.example` tracked |
| Vercel/auth tracking | PASS | No tracked `.vercel` path, credential file, token file or authentication artifact |
| Client-bundle scan | PENDING | Fresh isolated worktree has no build yet; required after the production build |
| Full security gate | PENDING | Provisionally blocked only by missing fresh client build and missing persisted audit evidence; all other 16 controls pass |
| Tracked temporary files | CLEANUP REQUIRED | `.tmp-apply-patch-probe.txt` is tracked, contains only `probe`, and is not runtime source |

No paid provider call was made. Production was not changed or redeployed.
