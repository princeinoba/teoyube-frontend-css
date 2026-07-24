# CI release gates

`.github/workflows/release-evidence.yml` runs the current clean-checkout
offline gates on pushes and pull requests with Node 24.18.0, npm 10.2.4, and
`npm ci`.

Mandatory stages include toolchain/lockfile, supply chain, formatting/lint,
typecheck, unit/integration/critical coverage, reproducible semantic build,
architecture/import and client/server bundle checks, secret/security checks,
Scripture/TIG/safety/Teo Guide/retrieval gates, browser journeys, static visual
parity, the resumable 216-cell performance gate, accessibility, observability,
and canonical evidence generation/verification.

Paid jobs are separate `workflow_dispatch` jobs:

- `live-ai-preview-gate`;
- `embedding-reindex`;
- `embedding-candidate-evaluation`.

They require explicit acknowledgement of the checked-in owner budget and the
protected `prompt-21-paid-preview` environment. The caps are $2.00 for live-AI
evaluation, $0.25 for public reindex, and $0.50 for candidate evaluation.
Secrets are referenced only at the job step and are unavailable to ordinary or
forked pull requests. Checked-in live AI and vector flags remain false.

The workflow executes gates; it does not turn an old report green. Compact
failure evidence is retained for seven days. Passing verbose logs and
screenshots are not uploaded.
