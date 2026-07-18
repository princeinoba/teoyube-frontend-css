# Phase 11.7 Local Persistence Options Plan

Current major milestone: TEOYUBE Phase 11 - Advanced Real App Productization, Local Persistence Options, Import/Export Hardening, Beta Data Safety & Offline-Ready Experience.

Current step: Phase 11.7 - Local Persistence Options, Import/Export Hardening, Beta Data Safety, Clean Handoff Packaging & Offline-Ready Experience.

## Runtime Decision

The repository-root static Node app remains the primary runtime. Phase 11.7 does not migrate the app to Next.js, connect external services, add accounts, add payments, add analytics, add database persistence, register a service worker, or add live AI orchestration.

## Data Modes

| Mode | Default | Behavior |
| --- | --- | --- |
| Memory-only session | Yes | Session data lives in app memory and can be cleared by the user. |
| Export-only backups | No | User-triggered JSON/Markdown downloads preserve selected sanitized data. |
| Optional local vault preview | No | Visible preview only; no hidden durable browser store is active in this beta. |

## Implementation Scope

- Added Phase 11.7 data mode helpers in `app.js`.
- Added safe export bundle generation with schema version `teoyube-beta-export-v1`.
- Added import preview, validation, duplicate detection, and merge strategies.
- Added Data Controls Center entry points from command palette, export center, Personalization Center, Book, right rail, QA, Promise Table, and Testimony surfaces.
- Added offline-aware status copy without service worker registration.
- Added beta handoff bundle script and smoke coverage.

## Next

Phase 11.8 - Final Functional MVP Acceptance Gate, Bug Sweep, Manual Browser QA Completion & Beta Handoff.
