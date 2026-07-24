# Canonical executable test pyramid

The command map is machine-recorded by
`scripts/release/command-runner.cjs`. Exact file/test counts belong to the
current release-evidence artifact rather than this stable document.

## Unit

`npm run test:unit` covers journey transitions and reversibility, TIG
determinism/ranking/traversal/cache/limits, exact WEB parsing/retrieval and
citations, promise levels, safety/theology, consent/memory, model/tool budgets,
embedding/hybrid retrieval, trust filters, deletion propagation, and
product-value schemas.

## Integration

`npm run test:integration` covers repository contracts, API/application
boundaries, identity/authorization, consent, memory encryption/export/delete,
Scripture/TIG/Promise, Teo Guide orchestration, strict provider fallback,
embedding/vector repositories, index lifecycle, source validation, and
privacy-safe telemetry. Migration and cross-user cases are mandatory critical
contracts.

## Browser

`npm run test:e2e`, `npm run test:memory:e2e`, and the visual parity suite cover
retained routes, full journey continuity, search/promise workflows, prayer and
calling, reflection/testimony/Book review, consent and memory controls,
deterministic and consented preview AI states, fallback/error recovery,
keyboard/focus parity, restart continuity, and desktop/mobile layouts.

## AI and safety evaluation

Gate A and Prompt 18/19 checks cover WEB source fidelity, humility,
uncertainty, prohibited authority/calling/testimony claims, sensitive topics,
crisis ordering, prompt injection, authorization, provider refusal/outage,
strict schemas, and deterministic fallback. Paid Gate B-Preview evidence is
owner-tagged and hash-bound; paid jobs never run on pull requests.

## Retrieval evaluation

Prompt 20 covers exact references, lexical baseline, Recall@5/10, MRR@10,
nDCG@10, trust and consent filtering, deletion/revocation, cross-user
isolation, source diversity, context/token impact, and no-embedding fallback.

## Coverage policy

`vitest.release.config.mts` enforces the evidence-based ordinary baseline:
35% statements and 30% branches. Critical contracts require 100% enumerated
case coverage and at least 12 practical fault-injection patterns. Global line
coverage cannot substitute for a missing security or safety decision test.
The Scripture timing test runs in the ordinary and performance gates but is
excluded from the instrumented coverage process because V8 instrumentation
invalidates its fixed load-time assertion; its source modules remain in the
coverage include set.
