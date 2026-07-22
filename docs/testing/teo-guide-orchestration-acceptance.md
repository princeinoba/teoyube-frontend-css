# Teo Guide orchestration acceptance

The blocking gate is `npm run teo-guide:gate`. It combines the static boundary verifier, 47 focused characterization/orchestration tests, and Prompt 17 safety Gate A while Gate B stays closed.

Acceptance evidence also requires:

- `npm run recovery:verify`;
- `npm run typecheck`, `lint`, and full `test`;
- `npm run app:build` and `test:e2e`;
- retained-route interaction/default parity;
- Prompt 13 journey browser regression;
- Prompt 14 TIG and Prompt 15B WEB contracts;
- Prompt 16 consent/memory regression;
- Prompt 17 safety evaluation;
- `visual:parity:gate:resumable` for three independent 72-cell runs;
- workspace before/after inventory and audited candidate cleanup.

The verifier locks exactly 13 tool names, strict descriptors, no unknown tool, no provider SDK/network planner, no direct seed/traversal import, no unchecked boundary cast, no direct state repository write, client-safe imports, disabled AI/embedding/vector/RAG flags, and canonical static `start`.

Scenario coverage includes exact Scripture/context, Promise/TIG, prayer, calling, Journey read/proposal/confirmation, memory denial and Prompt 16 authorization regressions, reflection/drafts, mentor discussion, injection, crisis/sensitive ordering, timeout/input fallback, ownership, idempotency, bounded inspection/deletion, no raw telemetry, provider-free browser/API responses, and no unauthorized write.
