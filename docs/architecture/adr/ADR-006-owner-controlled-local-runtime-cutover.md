# ADR-006: Owner-controlled local runtime cutover

Status: candidate pending final owner confirmation

Date: 2026-07-24

Owner decision: `TEOYUBE-OWNER-RUNTIME-CUTOVER-LOCAL-2026-07-24`

## Context

Prompt 21 established executable Gate C-Preview evidence for the Next
application while the static runtime remained canonical. The owner authorized
Prompt 22 to change only the repository/local canonical command after a second
complete gate and final confirmation.

## Decision

Use the existing Next application as the canonical repository/local runtime
through a small build-safe launcher. Preserve the original static application
unchanged through explicit operational rollback aliases and a focused Git
revert path.

Legacy hash URLs are translated invisibly to typed routes. Protected internal
routes fail closed when local identity infrastructure is unavailable. Existing
asset and media URLs remain in place; no format conversion or asset movement is
performed.

## Consequences

- `npm start` can change without deleting or modifying the static frontend.
- A production build is an explicit prerequisite, not a startup side effect.
- Public deployment and Gate C-Production remain separate owner decisions.
- Prompt 23 remains locked until a separately approved stabilization period.
- The release gate now describes `next` as local canonical and `static-node` as
  rollback while retaining every production blocker.
