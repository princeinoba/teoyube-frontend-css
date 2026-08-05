# Phase 4C synthetic moderator dry-run report

Executed: 2026-08-05T00:40:48-04:00

Status: **PASS**

Study: `teoyube-formative-pilot-2026-01`

This drill used only `synthetic-participant-phase4c-001` and `synthetic-session-phase4c-001`. They are fixed synthetic fixtures, not real participant or session records.

| Control | Result |
| --- | --- |
| Study status | `READY_FOR_OWNER_RECRUITMENT_DECISION` |
| Signed session envelope | PASS |
| Required research consent | PASS |
| Optional live-AI consent | Denied by default |
| Recording consent | Denied by default |
| Coded event recording | PASS — 12 synthetic events |
| Task scoring | PASS — fixed codes only |
| Moderator rescue | PASS — one synthetic rescue |
| Accessibility observation | PASS |
| Provider fallback | PASS — deterministic only |
| Participant withdrawal | PASS |
| Participant deletion | PASS |
| Aggregate regeneration | PASS |
| Events after deletion | 0 |
| Participants after deletion | 0 |
| Synthetic record files after cleanup | 0 |
| Real participants / sessions / records | 0 / 0 / 0 |
| Paid provider calls | 0 |
| Contact or raw content accepted | No |
| Unresolved adverse events | 0 |
| Findings created | No |

The exact-study reset removed only the approved synthetic fixture namespace. It did not touch ordinary Teoyube data, another study, visual evidence, baselines, or the static rollback. The generated analysis export is empty and redacted.

This report proves operational readiness only. It is not participant evidence, a study finding, recruitment authorization, or permission to begin Phase 4D.
