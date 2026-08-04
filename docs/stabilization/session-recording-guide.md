# Session recording guide

1. Exercise a real capability in canonical Next; a homepage-only check or automated run does not count.
2. Note only safe expected and actual product behavior. Remove all private spiritual or personal content.
3. Create JSON matching [session-record.schema.json](schemas/session-record.schema.json), omitting `recordHash`; the command computes it.
4. Use a unique ID beginning `STAB-SESSION-`, timezone-qualified ISO timestamps, and a `calendarDate` matching the local date at the start timestamp.
5. Set `ownerConfirmed: true`, `recordedBy: owner`, `automated: false`, and `sensitiveContentIncluded: false` only after personally reviewing the safe record.
6. Ensure every action's route and capability also appears in the session-level arrays.
7. Run `npm run stabilization:record -- --file <safe-session.json>`.
8. Preserve the reported ignored path and SHA-256 for owner review; do not commit the record.

The command rejects duplicates, unknown/prohibited fields, invalid dates, unsupported routes/capabilities, automated records, unconfirmed records, recognizable secrets, and notes over 2,000 characters. It prints no record content and never marks stabilization complete.
