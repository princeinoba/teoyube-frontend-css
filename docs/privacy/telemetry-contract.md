# Privacy-safe telemetry contract

Registry version: `teoyube-telemetry-2026-07-24.1`.

Every accepted event is declared in
`config/telemetry-event-registry.json` with its name, version, purpose, allowed
and prohibited fields, sensitivity, consent requirement, retention,
aggregation, source, owner, and tests.

Operational telemetry may contain route, safe trace ID, status, latency,
reason code, safe source IDs, model route/ID, aggregate token and estimated
cost, journey stage, consent operation, retrieval partition/index version, and
result count.

It must not contain raw:

- user messages or search queries;
- prayer, journal, testimony, check-in, or reflection;
- trauma, abuse, health, relationship, or spiritual-memory details;
- model request/response or tool-result bodies;
- vectors;
- API keys, session tokens, email, or exact identity.

Product-value analytics consent is a separate purpose from sensitive memory
and external AI. It is default off, inspectable, revocable, and deletable when
linked. Aggregate local/test summaries need no external vendor. There is no
advertising or sale/sharing of spiritual data.

The verifier rejects undeclared events, disallowed fields, prohibited field
names, suspicious sample values, and unbounded retention. Exporter failure is
isolated from application behavior.

```text
npm run release:telemetry:verify
```

