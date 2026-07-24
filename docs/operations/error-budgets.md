# Preview error-budget policy

Version: `teoyube-preview-error-budget-2026-07-24.1`

Correctness, security, Scripture, safety, consent, cross-user isolation,
deletion, and visual invariants have zero budget. An error budget cannot waive:

- fabricated or invalid Scripture;
- missed critical immediate-danger fixtures;
- unauthorized or cross-user access;
- unauthorized durable writes;
- raw private-content telemetry;
- protected visual or baseline drift;
- a failed 216-cell readiness run.

For ordinary latency and resource metrics, a critical metric may regress no
more than 10% from its verified Prompt 21 baseline. The fixed 5,000 ms per-cell
maximum remains absolute. Crossing a budget blocks Gate C-Preview until the
regression is corrected or the owner reviews a documented, nonvisual budget
change.

Preview evidence uses one release run as its observation window. A failed run
does not disappear through averaging. Production error budgets cannot be
calculated until real service ownership, traffic, alerts, and monitoring exist.
