# Formal stabilization policy

Policy version: `teoyube-stabilization-policy-1.0.0`

## Evidence threshold

Phase 3 closeout requires at least seven distinct calendar days and at least ten valid, owner-confirmed meaningful sessions. A meaningful session:

- uses the canonical Next runtime;
- exercises at least one real product capability and records at least one real manual action;
- records bounded, privacy-safe expected and actual behavior;
- contains no private spiritual, personal, health, crisis, credential, token, prompt, or model-response content;
- has a unique session ID, start/end timestamps, and an owner confirmation;
- is recorded as `automated: false` and `recordedBy: owner`.

An automated test run does not count. Opening the homepage without exercising a capability does not count. The toolkit never invents days, treats file count alone as completion, or marks a session complete automatically.

## Aggregate requirements

All 26 capabilities in [coverage-requirements.md](coverage-requirements.md) must be covered. The static rollback, return-to-Next, browser restart/resume, Next restart, runtime verification, and recovery verification evidence are mandatory. The owner must also explicitly observe the current Canon focus, Calling tablet-portrait, and CSS/resource/performance-evidence blocker surfaces without fixing or waiving them in this phase.

## Gate logic

`stabilization:status` is informative and succeeds with `WAITING_OWNER` before readiness. `stabilization:verify` is fail-closed. It requires the duration, session, coverage, verification, rollback/return, and incident criteria. If those mechanical criteria are complete, Phase 3A tooling reports `WAITING_OWNER_CLOSEOUT` as a non-passing gate. Only a separately authorized Phase 3B owner closeout may produce `PASS`.

Unresolved data loss, cross-user access, citation corruption, unsafe Teo Guide guidance, protected visual regression, or critical startup/runtime failure blocks closeout. An incident is never automatically closed.

## Evidence ownership and retention

The owner creates and controls local records. Each stored JSON object has a deterministic SHA-256 hash. Records are human-readable, Git-ignored, server/tooling-only, excluded from public assets and normal telemetry, and exportable only through the redacted aggregate command. Actual session and incident records are not committed by default.
