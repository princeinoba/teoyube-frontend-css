# Required stabilization coverage

All 26 capability IDs must appear across valid owner-confirmed sessions.

| # | Capability | Record ID |
| ---: | --- | --- |
| 1 | Today and the complete guided loop | `today_guided_loop` |
| 2 | Search | `search` |
| 3 | Promise Search as a distinct workflow | `promise_search` |
| 4 | Canon | `canon` |
| 5 | Promise Table | `promise_table` |
| 6 | Daily Word | `daily_word` |
| 7 | Prayer | `prayer` |
| 8 | Calling Compass | `calling_compass` |
| 9 | Journey | `journey` |
| 10 | Journal and Reflection | `journal_reflection` |
| 11 | Testimony candidate | `testimony_candidate` |
| 12 | Book of the Saint | `book_of_the_saint` |
| 13 | Lexicon | `lexicon` |
| 14 | Teo Guide deterministic mode | `teo_guide_deterministic` |
| 15 | Live-AI local preview with explicit consent | `live_ai_local_preview_consent` |
| 16 | Hybrid retrieval local preview | `hybrid_retrieval_local_preview` |
| 17 | Memory inspection | `memory_inspection` |
| 18 | Memory export | `memory_export` |
| 19 | Memory deletion | `memory_deletion` |
| 20 | Consent revocation | `consent_revocation` |
| 21 | Browser close/reopen and journey resume | `browser_restart_journey_resume` |
| 22 | Next stop/restart | `next_restart` |
| 23 | Static rollback | `static_rollback` |
| 24 | Return from static rollback to Next | `return_static_to_next` |
| 25 | `runtime:verify` | `runtime_verify` |
| 26 | `recovery:verify` | `recovery_verify` |

The aggregate must also record observation of all four registered blocker IDs. `STAB-BLOCKER-CANON-FOCUS` covers Canon focus behavior; `STAB-BLOCKER-CALLING-PERF` covers Calling Compass tablet portrait; `STAB-BLOCKER-CSS-BUDGET` and `STAB-BLOCKER-PERF-EVIDENCE` cover CSS/resource and current performance evidence. Observation is not remediation or acceptance.
