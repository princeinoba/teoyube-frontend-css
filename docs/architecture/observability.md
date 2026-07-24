# Provider-neutral observability

Status: Prompt 21 local/CI implementation. No production exporter is configured.

Teoyube emits versioned operational events through
`src/server/observability/observability-service.ts`. The service accepts only
events validated by the domain contract and the registry in
`config/telemetry-event-registry.json`.

The boundary provides:

- structured events, counters, latency distributions, and trace spans;
- a bounded local/test sink with p50, p95, and p99 summaries;
- correlation IDs supplied at the request boundary;
- allowlist-based redaction before an event reaches a sink;
- sampling and bounded buffering;
- an exporter interface that can later be implemented by a production vendor;
- failure isolation: exporter failure cannot break Scripture, safety, consent,
  memory, or deterministic fallback.

The boundary never accepts raw messages, searches, prayers, journals,
testimonies, check-ins, memories, model bodies, vectors, tokens, email, or exact
identity. A production exporter, alert destination, on-call owner, and retention
enforcement system remain deployment dependencies.

Public liveness is `/api/health`. Secret-safe preview readiness is
`/api/readiness`. Readiness treats the deterministic path as available even
when optional provider or vector dependencies are disabled or unavailable.

Verification:

```text
npm run release:telemetry:verify
npm run test:critical
```
