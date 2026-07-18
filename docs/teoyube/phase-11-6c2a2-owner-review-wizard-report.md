# Phase 11.6C.2A.2 Owner Review Wizard Report

Date: 2026-07-13

## Route

`http://127.0.0.1:4174/media-review.html?qa=1&mode=pilot-wizard`

The assisted mode leaves the existing full-library workspace intact and limits the guided interface to the 12 prepared candidate records. It is loopback-only and requires `qa=1`.

## Guided flow

1. Pilot overview and technical selection evidence.
2. Three candidate source-family previews, sequence definition, contiguous ordering, and owner sequence confirmation.
3. One-record-at-a-time protected playback, poster/contact sheet, metadata editing, and explicit per-record confirmations.
4. Standalone-short review using the same record controls.
5. Rights and ownership declaration.
6. Scripture and sequence declaration.
7. Safety declaration.
8. Pilot-scoped final validation and blocker navigation.

The declaration checkboxes are unchecked until explicitly saved by the owner. Record review, Scripture, source channel, rights, safety, and final record confirmation are separate controls. Saving writes checksum-bound patches and immediately reruns the server gate.

## Approval boundary

No approval control exists in base HTML. The browser requests approval markup only after its current authoritative gate response contains zero blockers. The server then reruns the complete gate before returning `Approve Owner-Reviewed Pilot`, and reruns it again on approval POST.

The wizard does not expose accounts, persistence, analytics, service workers, external APIs, live AI, source paths, derivative execution, or publication controls.

