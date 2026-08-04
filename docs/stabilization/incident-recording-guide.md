# Incident recording guide

Create an incident whenever actual behavior differs materially from expected behavior or a safety, privacy, data, citation, visual, startup, restart, or rollback concern appears.

1. Remove private content and convert symptoms to bounded, safe product observations.
2. Create JSON matching [incident-record.schema.json](schemas/incident-record.schema.json), omitting `recordHash`; the command computes it.
3. Reference the owner session ID and choose `informational`, `low`, `medium`, `high`, or `critical`.
4. Set each disqualifying-impact flag explicitly. Use a stable safe error code instead of logs or payloads.
5. Set `ownerConfirmed: true`, `reportedBy: owner`, and `sensitiveContentIncluded: false` after review.
6. Run `npm run stabilization:incident -- --file <safe-incident.json>`.

To update an incident, submit the same ID and original `createdAt`, with the full strict record and an explicit `updatedAt`. The command never derives or changes status automatically. A `resolved` record requires a 40-character resolution commit; unresolved records must keep `resolutionCommit: null`.

Unresolved data loss, cross-user access, citation corruption, unsafe Teo Guide guidance, protected visual regression, or critical startup/runtime failure blocks later Phase 3B closeout.
