# Phase 11.6C.2B Owner-Gate and Planning Correction

## Status

Phase 11.6C.2B remains blocked. The current complete validation reports:

- approved shorts: `0` (required: `12-30`)
- owner-confirmed Scripture sequences: `0` (required: exactly `1`)
- approved long-form records: `0` (allowed: up to `3`)
- approved pilot artifact: absent
- runtime media manifest: absent
- derivative media generated: `0`
- public media files published: `0`

## Approval visibility

The base owner-review HTML contains no pilot approval button or approval form. The browser requests the owner-gate control from a loopback-only QA endpoint. That endpoint runs the complete owner gate immediately before responding.

When any blocker exists, the endpoint returns HTTP `409` with a structured blocker payload and no approval markup. The browser clears the approval-control container after any unsaved review change or failed validation. There is no approval keyboard shortcut, approval URL parameter, or global client approval function.

Only a zero-blocker validation may return the server-generated `Approve pilot definition` button. The approval POST runs the complete gate again, so client markup cannot authorize an invalid pilot.

## Approval artifact

Owner approval is limited to the pilot definition. A passing request records:

- approved record IDs
- approved sequence IDs
- current source checksums
- source draft checksum
- manifest version
- approval timestamp
- explicit owner confirmation
- the exact complete validation result and its SHA-256 fingerprint

Approval creates no media, modifies no protected source, writes nothing into `public/media`, runs no process, and does not update the runtime manifest. It remains reversible until derivative execution authorization exists.

## Non-skippable lifecycle

The enforced lifecycle is:

1. `blocked`
2. `ready_for_owner_approval`
3. `owner_approved`
4. `derivative_plan_ready`
5. `derivative_execution_authorized`
6. `derivatives_generated`
7. `derivatives_validated`
8. `publication_authorized`
9. `published`

Derivative execution and publication each require a distinct owner authorization. Direct execution and publication requests currently return structured blockers and perform zero commands or file copies. Implemented guards do not provide derivative or publication engines in this blocked phase.

## Planning boundary

Derivative planning is report-only. It may emit inert command previews, expected derivative records, projected sizes, poster/thumbnail expectations, and JSON reports. The planning module imports no process executor and calls no spawn, exec, copy, write-stream, move, or rename API. It does not probe FFmpeg or FFprobe.

The former `media:pilot:derive` execution-shaped package command was removed. Available planning commands remain dry-run only.

## Verification

`phase116c2b:smoke` now includes 24 owner-gate hardening checks in addition to the existing 18 blocked-state checks. The tests prove:

- approval markup is absent in blocked HTML and blocked server responses
- direct blocked approval is rejected with structured blockers
- zero-blocker validation is the only condition that emits approval markup
- approval writes only a checksum-bound JSON artifact in an isolated test directory
- approval and planning create no media and change no source file
- planning executes no process and writes nothing into public media
- execution and publication cannot run without separate authorization
- the complete lifecycle cannot skip owner approval
- approval is reversible before execution authorization

Protected-source before/after signature: `3975` files, `106288074235` bytes, unchanged metadata fingerprint. Public media before/after: no media files; only the existing `.gitkeep` remains.

## Next owner action

Continue record review, Scripture confirmation, rights and safety review, duplicate resolution, sequence ordering, and pilot correction. Re-run validation after saving checksum-bound review changes. The pilot approval control must remain absent until the complete validator returns zero blockers.
