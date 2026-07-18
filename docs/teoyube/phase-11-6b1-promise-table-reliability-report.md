# Phase 11.6B.1 Promise Table Reliability Report

## Root cause

The inline manual form accumulated a per-render click listener, per-render pointer listener, document pointer capture, document click capture, document submit delegation, and general delegated action handling. Re-rendering during pointer activation could invalidate the original click target; alternate paths could invoke add more than once.

## Fix

- Replaced the inline form with an explicit Add Promise button and native dialog.
- Added required title and Scripture fields plus word, category, status, optional safe note, and Save-to-Book choice.
- Uses one document-level submit handler; no listener is attached during render.
- Supports mouse/touch activation, native Enter submission, and Ctrl/Cmd+Enter from the note field.
- Validates Scripture syntax, creates a deterministic ID, rejects duplicate title/reference pairs, updates table/detail/rail/activity/QA state, returns focus, and pushes undo.
- Testified remains a user-selected status and is never inferred.

Browser verification results are recorded in `phase-11-6b1-manual-browser-qa-results.md`.
