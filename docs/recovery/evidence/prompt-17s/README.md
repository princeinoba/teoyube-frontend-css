# Prompt 17S compact evidence

This directory preserves the minimum durable evidence needed to explain the Prompt 17 performance blocker and the interrupted Prompt 17P attempt before storage recovery. It does not replace any immutable or owner-approved visual baseline.

- `safety-orchestration-scorecard.json`: complete Gate A safety scorecard, copied byte-for-byte.
- `prompt-17-blocked-checkpoint.json`: complete 12-cell checkpoint containing the original three performance violations.
- `prompt-17p-incomplete-checkpoint.json`: complete 45-cell, zero-violation checkpoint from the later interrupted run.
- `prompt-17p-order-sensitivity-summary.json`: compact canonical/reverse-order diagnostic result.
- `evidence-manifest.json`: hashes, source locations, checkpoint summaries, toolchain identity, and retention rationale.
- `resumable-performance-gate-summary.json`: identity-bound compact results for the three final 72-cell logical runs (216/216 paired cells), including timings, accessibility/focus parity, telemetry, result hashes, and artifact-budget evidence.

Large Playwright traces, temporary screenshots, browser profiles, and build output are intentionally not copied here. They are reproducible test artifacts, while the protected static and owner-approved baselines remain unchanged in their canonical locations.
