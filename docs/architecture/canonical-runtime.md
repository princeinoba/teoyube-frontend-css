# Canonical runtime

## Decision

Owner decision `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24` authorizes
Teoyube's repository/local canonical runtime to use the verified Next
application after the Prompt 22 candidate gate and final owner confirmation.
It does not authorize a public deployment.

The owner gave that final confirmation by selecting option 1 on 2026-07-24.

The runtime boundary is:

```text
npm start
  -> scripts/runtime/start-next.cjs
  -> existing Next production build

npm run rollback:start
  -> original server.js static runtime
```

The safe launcher never installs dependencies, builds datasets, calls a model
provider, or mutates the repository. It checks `.next/BUILD_ID`, checks the
requested local port, binds to loopback by default, and delegates to
`next start`. A missing or invalid build fails with an instruction to run
`npm run app:build`.

## Runtime identities

| Purpose | Runtime | Command |
| --- | --- | --- |
| Canonical repository/local application | Next production runtime | `npm start` |
| Next development | Next development runtime | `npm run dev` |
| Explicit Next production runtime | Next production runtime | `npm run app:start` |
| Protected static runtime | Original Node static runtime | `npm run static:start` |
| Compatibility static alias | Original Node static runtime | `npm run prototype:start` |
| Operational rollback | Original Node static runtime | `npm run rollback:start` |

The original static application, protected sources, immutable baselines, owner
support baselines, and owner Scripture-delta baselines remain unchanged. The
static runtime is not an archive and is not deleted by this cutover.

## Boundaries

- Public deployment, DNS, domains, hosting, and Gate C-Production remain out of
  scope and closed.
- Checked-in live AI, embeddings, vector retrieval, and broad RAG remain
  disabled.
- The Next runtime remains server-owned for Scripture, TIG, memory, safety,
  model-provider, and retrieval internals.
- Owner, development, and internal routes remain absent from public navigation
  and return 404 without an authorized session. The visual harness can reach
  Roadmap only through an explicit loopback-only QA mode.
- The historical Phase 11.6C.3 publication-integrity blocker is unchanged.

The machine-readable authority is
`config/runtime/canonical-runtime-manifest.json`. Route and asset details are
separated into their corresponding compatibility manifests.
