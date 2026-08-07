# Teoyube 9/10 program risk register

| ID | Risk | Current state | Program gate | Exit trigger |
| --- | --- | --- | --- | --- |
| 9R-01 | Development dependency advisory | Prior Phase 2A remediation passed, but the current full tree now reports one high `js-yaml` advisory (GHSA-5p4m-2wfm-xmqj / CVE-2026-59870); production tree remains zero | Phase 2A/2C | Separate supported remediation and complete gate rerun; no forced fix or unrelated lockfile change |
| 9R-02 | Stale release evidence | Current validation blocked with 1,087 failures | Phase 2B/2C | Current-source lineage and Gate C Preview PASS |
| 9R-03 | Prompt 24 composite safety-hash input discrepancy | Historical report preserved; authoritative hash locked in Phase 1 | Phase 1 evidence integrity | Phase 1 ledger remains authoritative for later dependency comparisons |
| 9R-04 | Stabilization evidence incomplete | Phase 3A toolkit PASS; authentic evidence remains 0 days, 0 sessions, and 0 incidents | Phase 3 | Seven distinct days, ten owner-confirmed meaningful sessions, full coverage, no disqualifying incident, and owner closeout |
| 9R-05 | Real-user evidence absent | Phase 4A/4B/4C PASS and recruitment authorized; collection disabled; operator/contact-storage/privacy prerequisites and all real sessions remain outstanding; 0 participants, sessions, or participant records | Phase 4 | Complete prerequisites, conduct consent-bound sessions, and obtain owner-accepted Phase 4D analysis |
| 9R-06 | Accessibility conformance unproved | Phase 5C-1, 5C-2, and 5C-3A fixed 7 exact issues (A11Y-001 through A11Y-007); A11Y-008 remains NEEDS_MORE_EVIDENCE, all 12 manual/AT evidence scopes remain NOT_TESTED, and no conformance claim exists | Phase 5 and Phase 2A recheck | Complete A11Y-008 retest and approved manual/AT evidence; do not claim conformance early |
| 9R-07 | Production infrastructure absent | Local/test adapters only | Phase 6 | Managed, isolated, restored, monitored staging evidence |
| 9R-08 | Production AI/release gates closed | Gate B/C Production closed | Phase 7 | Human, red-team, data-control, load, cost, drill, and owner gates PASS |
| 9R-09 | Prompt 23 inventory stale | Five decisions pending; current-HEAD graph absent | Phase 8 | Fresh hashes/reachability and candidate-level decisions |
| 9R-10 | Static rollback premature retirement | Must remain protected | Phase 8 | Actual production, retention period, rollback drill, separate approval |
| 9R-11 | Workspace storage growth | Phase 1 start: 3,373,388,201 logical bytes | All phases | Track deltas; clean only through approved safe scope |
| 9R-12 | Unrelated listener on 4173 | Serves Nominate It, not Teoyube | Operational hygiene | Do not stop; owner manages in its own workspace |
| 9R-13 | Current performance composite blocked | Phase 5C-3A first run completed 72/72 cells below 5,000 ms, but the 216-cell controller stopped on nine broad inherited static/Next parity failures; CSS is 1,416,075 bytes against 948,538 (approved A11Y delta +1,119 bytes) | Phase 2A recheck / later performance scope | Reconcile owner-approved surfaces and historical budget through separate owner-authorized work; never weaken silently |

| 9R-14 | Research collection activated outside an approved study or consent boundary | Recruitment is authorized, but collection remains default-off and the Phase 4B real-study registry is not activated; zero real records | Phase 4 | Name operator, complete privacy/contact prerequisites, then separately verify real-study activation and every consent boundary before any write |
| 9R-15 | Recruitment begins before operational prerequisites | Owner decision is recorded; operator, separate non-Git contact storage, and local/privacy review remain incomplete | Phase 4C operations | Complete and document all three prerequisites before participant contact; authorization never creates records automatically |

Documentation is not risk acceptance. Every material risk remains open until its exit trigger is evidenced.
