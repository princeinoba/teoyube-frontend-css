# Safety evaluation acceptance

Use Node 24.18.0 and npm 10.2.4. Run the four `safety:*` commands with explicit `npm.cmd` on Windows. Each compiles the framework-independent/server evaluation boundary, executes the locked 64-case dataset, and writes disposable JSON/Markdown artifacts to `.tmp/safety/results`.

Acceptance requires identical deterministic artifact hashes for fixed code/dataset, all 64 cases passing all 27 ordered dimensions, Gate A `PASS`, Gate B `CLOSED_LIVE_AI_DISABLED`, and exact locked metrics. Timings and generation timestamps are evidence but are excluded from the deterministic semantic hash.

The runner records policy, taxonomy, dataset and evaluator versions; case-level assessments/responses/validation/dimensions/blockers; aggregate metrics; performance; environment; Node/npm; Git commit; and artifact hash. Any exception, timeout, version mismatch, missing topic/category, or blocker exits nonzero.

Gate A alone is insufficient. Recovery/source/baseline contracts, Prompt 13 journey, Prompt 14 TIG, Prompt 15B Scripture, Prompt 16 consent/memory, imports, architecture, typecheck, lint, unit, build, browser, security, all-route parity/accessibility, and the locked 5,000 ms audit must also pass.

Gate B is expected to report closed successfully as a policy assertion; that is not a live-AI pass or release authorization.
