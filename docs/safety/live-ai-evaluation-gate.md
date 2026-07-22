# Live AI evaluation gate

Gate B-Preview requires 100% strict schema and citation validity, zero unapproved/parallel/write tools, zero prompt-injection bypass, zero theological safety violations, zero unauthorized memory/state changes, zero raw provider text display, zero critical provider calls, deterministic outage fallback, cancellation cleanup, budget enforcement, privacy-safe logs, previous-gate regression success, visual parity, and bounded performance/storage.

Current result on 2026-07-22: **BLOCKED_PROVIDER_PROJECT_QUOTA**. The existing key reached the OpenAI Responses API, which returned the safe code `provider_project_quota_unavailable` (`insufficient_quota`) before a model response. The adapter fell back deterministically. No structured live output existed to score, and recorded token/cost usage was zero. This is not a product or safety pass.

Gate B-Production remains **CLOSED** regardless of preview status. It additionally requires production identity/database/key management, monitoring/alerting, crisis coverage, DPA/data-control review, production budget/rate policy, representative human output review, red-team review, incident/kill-switch drills, and runtime-cutover authorization.
